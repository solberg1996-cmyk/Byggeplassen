# Byggeplassen Beta

Byggeplassen Beta er et lettvekts, nettbasert kalkyle- og tilbudsverktøy utviklet for norske håndverksbedrifter.

Applikasjonen lar brukere opprette kunder, beregne prosjektkostnader, strukturere tilbud og følge salgsprosessen fra utkast til ferdigstilt prosjekt — alt i én samlet løsning.

Målet er å erstatte manuelle Excel-ark og uoversiktlige systemer med et raskt, intuitivt og produksjonsklart verktøy.

---

## Målgruppe

Små og mellomstore norske håndverksbedrifter (tømrere, snekkere, malere, rørleggere o.l.) som trenger et raskt og oversiktlig verktøy for å kalkulere jobber og sende tilbud til kunder — uten tunge ERP-systemer.

---

## Funksjoner

### Kundehåndtering

* Lagre kunder med navn, telefon, e-post og adresse
* Søk og filtrer på tvers av alle kunder

### Prosjektkalkyle

* Strukturer prosjekter i steg/faser
* Beregn arbeidstimer, materialkostnader, påslag og kjøring
* Automatisk MVA-håndtering (eks./inkl. visning)
* Konfigurerbare standardsatser per firma

### Tilbudsgenerator

* Live forhåndsvisning av tilbudet
* Tilpasset postervisning: vis alle poster, enkel visning, eller slå sammen til egendefinerte linjer
* Legg til fritekst-seksjoner, vis/skjul deler
* Skriv ut eller eksporter til PDF direkte fra nettleser

### Pipeline og statistikk

* Statuser: Utkast → Sendt → Vunnet / Tapt / Pågår / Ferdig
* Dashboard med nøkkeltall: antall kunder, prosjekter, sendte tilbud og vinnerate

### Firmainnstillinger

* Logo (PNG/JPG), primærfarge og fargetema
* Firmainformasjon: navn, org.nr, adresse, kontonummer, betalingsbetingelser
* Globale standardsatser: timepris, intern timekost, materialpåslag, kjøring/drift

### Data og synkronisering

* Skylagring via Supabase (auth + database)
* Innlogging med e-post og passord, støtte for kontooppretting
* JSON-basert eksport (backup) og import (restore)

---

## Teknologi

| Lag                | Teknologi                       |
| ------------------ | ------------------------------- |
| Frontend           | Vanilla HTML, CSS, JavaScript   |
| Backend / database | Supabase                        |
| Autentisering      | Supabase Auth (e-post/passord)  |
| PDF-eksport        | Nettleserens innebygde utskrift |
| Distribusjon       | Statisk fil — ingen build-steg  |

Appen er bygget som én enkelt HTML-fil uten rammeverk eller byggeprosess. Dette gjør den enkel å hoste, dele og vedlikeholde.

---

## Arkitektur (nåværende)

Applikasjonen er per i dag bygget som en monolitisk frontend:

* All logikk (UI, state, kalkulasjon og API-kall) ligger i én HTML-fil
* Data lagres lokalt (localStorage) og synkroniseres mot Supabase
* Ingen build tools eller rammeverk

Dette gir rask utvikling og enkel distribusjon, men begrenser skalerbarhet og vedlikehold på sikt.

---

## Datamodell (forenklet)

Applikasjonen opererer med følgende hovedobjekter:

* Customer
* Project
* Material
* Offer

State håndteres globalt i frontend og persisteres via localStorage + Supabase.

---

## Foreslått mappestruktur

```
byggeplassen/
├── index.html
├── README.md
│
├── src/
│   ├── css/
│   │   └── main.css
│   │
│   ├── js/
│   │   ├── app.js
│   │   ├── auth.js
│   │   ├── customers.js
│   │   ├── projects.js
│   │   ├── offer.js
│   │   ├── settings.js
│   │   ├── supabase.js
│   │   └── utils.js
│   │
│   └── templates/
│       └── offer.html
│
├── assets/
│   └── icons/
│
└── supabase/
    └── schema.sql
```

---

## Roadmap

### Fase 1 — Stabilisering

* [ ] Refaktorere fra monolitt til modulbasert struktur (separere UI, state og forretningslogikk)
* [ ] Legge til Supabase-skjema og Row Level Security (RLS) i versjonskontroll
* [ ] Enkel feilhåndtering og brukervennlige feilmeldinger

### Fase 2 — Forbedret tilbudsflyt

* [ ] E-postutsending av tilbud direkte fra appen
* [ ] Kundens mulighet til å godta/avslå tilbud via unik lenke
* [ ] PDF-generering server-side (f.eks. Puppeteer eller ekstern tjeneste)

### Fase 3 — Økonomi og rapportering

* [ ] Fakturamodul koblet til vunne prosjekter
* [ ] Lønnsomhetsrapport per prosjekt (budsjett vs. faktisk)
* [ ] Eksport til regnskapsformat (f.eks. CSV for Fiken/Tripletex)

### Fase 4 — Samarbeid

* [ ] Flerbrukerstøtte (inviter kolleger til firmakonto)
* [ ] Rollestyring (admin, selger, kalkulator)
* [ ] Aktivitetslogg per prosjekt

### Fase 5 — Mobil

* [ ] Responsivt design optimalisert for mobil
* [ ] PWA-støtte (offline-modus og installerbar app)

---

## Kom i gang

1. Klon eller last ned prosjektet
2. Opprett et Supabase-prosjekt
3. Lim inn Supabase-URL og anon-nøkkel i `index.html`
4. Åpne `index.html` i nettleser eller host den statisk (Netlify, Vercel, GitHub Pages)

> Ingen installasjon eller build-steg kreves.
