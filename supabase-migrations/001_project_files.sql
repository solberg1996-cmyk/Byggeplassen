-- ============================================================
-- Migrering: project_files + Storage-bucket for prosjektbilder/-dokumenter
-- ============================================================
-- Kjøres i Supabase Dashboard → SQL Editor → kjør hele filen.
-- Berører IKKE eksisterende tabell (user_data) eller data.
--
-- Bakgrunn: prosjekter finnes i dag kun som JSON i user_data.data,
-- IKKE som rader i en egen "projects"-tabell. project_files.project_id
-- er derfor en ren tekstkolonne som matcher prosjektets p.id fra JSON-
-- blob'en (8-tegns id fra uid()), ikke en ekte fremmednøkkel — det finnes
-- ingen tabell å referere til. Eierskap/sikkerhet håndheves utelukkende
-- via user_id + RLS, samme tillitsnivå som resten av appen allerede har
-- (f.eks. p.customerId har heller ingen DB-håndhevelse i dag).
-- ============================================================

-- ── 1. TABELL ────────────────────────────────────────────────
create table if not exists project_files (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users(id) on delete cascade,
  project_id         text not null,
  file_type          text not null check (file_type in ('image','document')),
  category           text not null default 'annet',  -- fri streng, validert i klienten (se app.js)
                                       -- — ikke DB-enum, så kategorilister kan endres uten ny
                                       -- migrering. Default 'annet' lar mobilflyten være
                                       -- "Ta bilde → lagret" uten at kategori må velges først.
  title              text,
  description        text,            -- kommentarfeltet fra UI
  storage_path       text not null,   -- full sti i bucketen, se punkt 3
  original_filename  text not null,
  mime_type          text not null,
  file_size          integer not null check (file_size > 0),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  deleted_at         timestamptz      -- soft delete. NULL = aktiv. Satt = "slettet" i UI,
                                       -- men Storage-objektet slettes IKKE i V1 (se punkt 4).
);

comment on table project_files is
  'Metadata for bilder/dokumenter lastet opp til prosjekter. Selve filen ligger i Storage-bucketen "project-files" (se punkt 3), denne tabellen holder kun referansen.';

-- Hovedspørringen appen kjører er "hent aktive filer for ETT prosjekt for
-- innlogget bruker, nyeste først". Én delvis indeks (kun aktive rader)
-- dekker dette — ingen grunn til flere indekser ved denne skalaen.
create index if not exists project_files_active_idx
  on project_files (user_id, project_id, created_at desc)
  where deleted_at is null;


-- ── 2. ROW LEVEL SECURITY (tabell) ──────────────────────────
alter table project_files enable row level security;

-- SELECT: du ser kun dine egne rader. Merk: soft-slettede rader er IKKE
-- filtrert bort her — det er en UI-avgjørelse (appen spør etter
-- deleted_at is null i galleriet), ikke en sikkerhetsgrense. Det gir oss
-- fri vei til en "papirkurv"-visning senere uten ny policy.
drop policy if exists "project_files_select_own" on project_files;
create policy "project_files_select_own"
  on project_files for select
  to authenticated
  using (auth.uid() = user_id);

-- INSERT: du kan kun opprette rader der du selv er eier. Hindrer at noen
-- laster opp en fil og "gir" den til en annen bruker sin user_id.
drop policy if exists "project_files_insert_own" on project_files;
create policy "project_files_insert_own"
  on project_files for insert
  to authenticated
  with check (auth.uid() = user_id);

-- UPDATE: du kan kun endre dine egne rader (brukes til å redigere
-- kategori/kommentar/tittel, OG til soft delete via deleted_at).
-- with check hindrer i tillegg at en UPDATE bytter eierskap til en
-- annen bruker. updated_at har ingen database-trigger — appkoden setter
-- updated_at=now() eksplisitt ved denne typen UPDATE.
drop policy if exists "project_files_update_own" on project_files;
create policy "project_files_update_own"
  on project_files for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Bevisst: INGEN delete-policy. Uten en policy nekter RLS som standard
-- all DELETE — dette håndhever "ingen hard sletting i V1" på database-
-- nivå, ikke bare som en konvensjon i appkoden. Legges til når papirkurv/
-- automatisk opprydding bygges senere.


-- ── 3. STORAGE BUCKET ────────────────────────────────────────
-- Privat bucket (public=false) — filer nås kun via signerte URL-er
-- generert server-side/klient-side for innlogget eier, aldri direkte.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-files',
  'project-files',
  false,
  26214400,  -- 25 MB i bytes — dette er bucketens absolutte tak.
             -- Strengere per-type-grenser (bilder maks 20 MB) håndheves
             -- i klienten før opplasting starter (se app.js), siden
             -- Supabase Storage ikke støtter ulike grenser per mime-type
             -- på bucket-nivå.
  array[
    'image/jpeg','image/png','image/webp','image/heic','image/heif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;


-- ── 4. STORAGE POLICIES (storage.objects) ───────────────────
-- Sti-struktur: {user_id}/{project_id}/{file_type}/{uuid}.{ext}
-- storage.foldername(name) gir mappesegmentene (uten filnavn) som array,
-- så [1] er alltid user_id. Vi krever i tillegg bucket_id eksplisitt i
-- hver policy, siden storage.objects er delt på tvers av ALLE bucketer
-- i prosjektet — uten den sjekken ville policyen utilsiktet også
-- påvirke andre bucketer.

-- SELECT: nødvendig for å kunne generere signerte URL-er for egne filer
-- (Supabase sjekker SELECT-policy når en signert URL utstedes, ikke når
-- den brukes — selve signerte URL-en er en tidsbegrenset token som
-- omgår RLS ved bruk).
drop policy if exists "project_files_storage_select_own" on storage.objects;
create policy "project_files_storage_select_own"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'project-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- INSERT: kan kun laste opp til en sti som starter med egen user_id.
drop policy if exists "project_files_storage_insert_own" on storage.objects;
create policy "project_files_storage_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'project-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Bevisst: INGEN update- eller delete-policy på storage.objects.
-- - UPDATE: hver opplasting får en fersk UUID i stien (se punkt 3-kommentar
--   i appkoden) — vi skriver aldri over et eksisterende objekt, så det er
--   ikke bruk for update her i V1.
-- - DELETE: samme begrunnelse som punkt 2 — ingen hard sletting i V1.
--   Soft delete skjer kun i project_files-tabellen; selve fil-objektet
--   blir liggende i Storage til en fremtidig oppryddingsjobb bygges.
