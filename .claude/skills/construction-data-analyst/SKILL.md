---
name: construction-data-analyst
description: >
  Analyserer produksjonsdata fra norske kalkulasjonsprogrammer (SmartKalk, Svenn, Holte, ISY Calcus)
  og sammenligner mot verdiene i productionData.js. Bruk denne skillen hver gang brukeren nevner
  SmartKalk, Svenn, kalkulasjonsprogram, produksjonsrater, timer per enhet, ENH. TIDSF., Grunnid,
  eller vil sammenligne/validere/oppdatere timeverdier i appen. Trigger ogsa nar brukeren deler
  screenshots fra kalkulasjonsprogrammer eller vil analysere byggetider.
---

# Construction Data Analyst

Analyser screenshots og data fra norske kalkulasjonsprogrammer, trekk ut produksjonsrater,
og sammenlign mot Byggeplassens egne verdier i `productionData.js`.

## Hvorfor denne skillen finnes

Byggeplassen bruker egne produksjonsrater (timer per enhet) for a estimere tidsbruk pa
byggeprosjekter. Disse ratene ma valideres mot bransjestandard for a sikre at kalkylene
er palitelige. SmartKalk og Svenn er de to viktigste referansekildene i Norge.

## Arbeidsflyt

### Steg 1 — Finn og les data

Nar brukeren gir en mappesti med screenshots:

1. Bruk `Glob` for a finne alle bildefiler (png/jpg) i mappen
2. Les bildene i batches pa 10 (paralleliser med `Read`)
3. For hvert bilde, identifiser kilden:

**SmartKalk** (EG/Holte):
- Har mork gra/gronn UI med verktoyrad oppe
- Viser kolonner: BES, KODE, BESKRIVELSE, ENHET, MENGDE, ENH. TIDSF., TIMER
- ENH. TIDSF. = enhetstidsfaktor = timer per enhet (direkte brukbar)
- Kan vise katalog (bibliotek-visning med lister) eller prosjektkalkyle (detaljerte poster)
- Katalogvisning har kolonnene: Timer, Pris (til hoyre)

**Svenn** (web.svenn.com):
- Har orange/hvit web-UI med venstresidemeny
- Viser "Legg til bygningsdelsmonstre" med NS 3420-koder
- Kolonner: Enhet, Grunnid, Innkjopspris materiell
- **Grunnid er i mannsdager (md)**. Omregning: `md x 7.5 = timer`
- Enhet-kolonnen viser hva Grunnid maler: md=arbeid, m/m2/stk=materialkvantitet

### Steg 2 — Trekk ut data

For hvert bilde, noter:
- Kildeprogrammet
- Postbeskrivelse (norsk)
- Tidsfaktor/Grunnid-verdi
- Enhet (t/m2, t/lm, t/stk)
- Om det er komponent-rate eller komplett post

Viktig forskjell mellom kildene:
- **SmartKalk komplette poster** inkluderer alt arbeid (tilpasning, hjorner, avslutning, opprydding)
- **SmartKalk katalog-komponenter** er delrater for enkeltoperasjoner
- **Svenn** gir typisk bare basismontering uten tilpasning — **lavere enn virkeligheten**
- Byggeplassens verdier bor ligge naermere SmartKalk-niva siden de representerer hele jobber

### Steg 3 — Les productionData.js

Les filen og hent alle verdier fra `productionRates`-objektet. Hver jobb har:
```javascript
jobbnavn: { low: X, normal: Y, high: Z, unit: 'enhet', label: 'Beskrivelse' }
```

### Steg 4 — Sammenlign og analyser

For hver jobb i productionRates:
1. Finn matchende data fra SmartKalk og/eller Svenn
2. Beregn avvik: `((din - ekstern) / ekstern) x 100%`
3. Sett sikkerhetsgrad:
   - **Hoy**: Direkte match fra SmartKalk komplett post
   - **Middels**: Utledet fra komponenter, eller kun en kilde
   - **Lav**: Ingen ekstern data, eller svart usikker match
4. Gi anbefaling: Behold / Juster opp / Juster ned

### Steg 5 — Presenter resultater

Lag sammenligningstabell pa norsk:

```markdown
| Jobb | Din normal | SmartKalk | Svenn | Delta | Sikkerhet | Anbefaling |
|------|-----------|-----------|-------|-------|-----------|------------|
| ...  | ...       | ...       | ...   | ...   | ...       | ...        |
```

Deretter oppsummer:
1. **Kritiske endringer** (stort avvik, hoy sikkerhet) — disse BOR endres
2. **Moderate endringer** — disse bor vurderes
3. **Bekreftet OK** — verdier som stemmer med eksterne kilder
4. **Ingen data** — verdier uten ekstern referanse

### Steg 6 — Lagre og oppdater

1. Lagre all ekstrahert data til `docs/produksjonsdata-analyse.md` med:
   - Alle SmartKalk-datapunkter (komplette poster og komponenter)
   - Alle Svenn-datapunkter (med md-verdier og timer-omregning)
   - Dato og kildehenvisning
   
2. Nar brukeren godkjenner, oppdater `productionData.js`:
   - Endre low/normal/high for godkjente jobber
   - Behold eksisterende format og kommentarer
   - Ikke endre jobber brukeren ikke har godkjent

## Domenekunskap

### Norske byggebegreper
| Norsk | Engelsk | Beskrivelse |
|-------|---------|-------------|
| Kalkyle | Estimate | Beregning av tid og kostnad |
| Tilbud | Quote/Offer | Pristilbud til kunde |
| Kledning | Cladding | Utvendig bordkledning |
| Reisverk/Stenderverk | Framing/Studs | Bindingsverk i vegger |
| Bjelkelag | Joist system | Gulv-/etasjekonstruksjon |
| Svill | Sill plate | Bunnsvill i vegg |
| Stender | Stud | Vertikale stendere |
| Vindsperre | Wind barrier | Utvendig vindtetting |
| Utlekting | Battening | Lekting for kledning/panel |
| Gerikter | Architraves | Listverk rundt dor/vindu |
| Himling | Ceiling panel | Takpanel innvendig |

### NS 3420-struktur (relevant for Svenn)
- 01.xxx: Rigg, drift og sikring
- 02.xxx: Betong og konstruksjon (bjelkelag, sperrer)
- 41.xxx: Yttervegger (kledning, bindingsverk, isolasjon)
- 42.xxx: Innervegger
- 43.xxx: Dekker og gulv
- 55.xxx: Innredning (kjokken)
- 56.xxx: Vatrom
- 67.xxx: Trapper
- 85.xxx: Listverk

### Enheter
- `t/m2` = timer per kvadratmeter
- `t/lm` = timer per lopemeter
- `t/stk` = timer per stykk
- `md` = mannsdagsverk (Svenn) = 7.5 timer

### Typiske avviksmonstre vi har observert
- Dormontering underestimeres ofte (folk glemmer foring, listing, beslag)
- Gulvlegging overestimeres ofte (ferdigparkett/laminat gar fort)
- Gips- og panelarbeid overestimeres ofte med ~20-30%
- Svenn-verdier er systematisk 30-50% lavere enn SmartKalk (mangler tilpasning)

## Eksisterende referansedata

Sjekk om `docs/produksjonsdata-analyse.md` allerede finnes — den kan inneholde
tidligere analyseresultater som bor oppdateres, ikke overskrites.
