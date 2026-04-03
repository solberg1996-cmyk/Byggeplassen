# Kalkulasjonsprogram — Dataformater

## SmartKalk (EG/Holte)

### UI-kjennetegn
- Mork gra/gronn desktop-applikasjon
- Verktoyrad med ikoner oppe
- Trestruktur i venstre panel (prosjekter/kalkyler)
- Hoyre panel: kalkyleposter eller katalogbibliotek

### Katalogvisning
Viser byggeprodukter/poster fra Holtes database.
Kolonner (hoyre side): Beskrivelse, Timer, Pris
- "Timer" = ENH. TIDSF. = timer per enhet (direkte brukbar)

### Prosjektkalkyle
Viser en konkret kalkulasjon med poster.
Kolonner: BES | KODE | BESKRIVELSE | ENHET | MENGDE | ENH.PRIS | ENH.TIDSF. | TIMER | SUM
- ENH. TIDSF. = enhetstidsfaktor i timer
- TIMER = ENH.TIDSF. x MENGDE

### Komponent-breakdown
Noen poster kan utvides for a vise delkomponenter:
```
Innerdor komplett           ENH.TIDSF: 4.81 t/stk
  ├── Apning                 0.540
  ├── Dorblad                1.350
  ├── Foring                 0.690
  ├── Dytting                0.150
  ├── Feielist               0.270
  ├── Beslag                 0.405
  └── Karmlist               1.430
```

## Svenn (web.svenn.com)

### UI-kjennetegn
- Orange/hvit web-applikasjon
- Venstremeny med navigasjon (Apper, Kunder, Produkter, etc.)
- "Legg til bygningsdelsmonstre" dialog

### Datastruktur
Hierarkisk NS 3420-basert:
```
01.631 Rigg, Drift og Sikring — Generelt (16)
  ├── Lafteboks (4)
  │     ├── Mannskap Lafteboks: md, 0.0174
  │     └── Justering av form: md, 0.0086
  ├── 01.311 Hovedbjelker (2)
  └── 02.331 Ytakbjeller og sperrer (9)
```

### Kolonner
| Kolonne | Betydning |
|---------|-----------|
| Enhet | Enhetstype: md, stk, m, m2, ml |
| Grunnid | Basisfaktor — for arbeid (md-poster): mannsdager per enhet |
| Innkjopspris materiell | Materialspris eks. mva |

### Omregning
```
Timer = Grunnid(md) x 7.5
```
Norsk arbeidsdag = 7.5 timer.

### Viktig: Svenn gir komponent-rater
Svenn bryter ned i enkeltkomponenter. En "yttervegg" i Svenn har:
- Bindingsverk: 0.039 md/m2 = 0.29 t/m2
- Gips: 0.044 md/m2 = 0.33 t/m2
- Isolasjon: 0.008 md/m2 = 0.06 t/m2
- etc.

Man ma summere relevante komponenter for a fa en sammenlignbar verdi.
SmartKalks "komplette poster" er allerede summert.

## Holte Kalkulasjonsnokkelen

### Om kilden
- 7500+ enhetspriser med tid- og materialforbruk
- Bransjestandard i Norge
- Tilgjengelig som bok, PDF, eller integrert i SmartKalk
- Ofte bak betalingsmur

### Format
Typisk tabell med:
- NS-kode
- Beskrivelse
- Enhet (m2, lm, stk)
- Arbeidstid (timer)
- Materialmengde
- Enhetspris

## ISY Calcus (Norconsult)

### Om kilden
- Brukes mye av radgivere og storre entreprenorer
- Integrasjon med BIM-modeller
- NS 3420-basert

### Format
Lignende SmartKalk men med annen UI. Ser etter:
- Tidsfaktorer i timer per enhet
- Ressursforbruk per post
