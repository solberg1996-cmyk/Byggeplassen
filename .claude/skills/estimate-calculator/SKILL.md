---
name: estimate-calculator
description: >
  Bygger og forbedrer kalkulasjonsmotoren i calcEngine.js og productionData.js.
  Bruk denne skillen nar brukeren nevner kalkyle, estimat, timekalkyle, produksjonsrater,
  tilkomstfaktor, hoyde-faktor, kompleksitetsfaktor, indirekte tid, rigg, kjoring,
  operasjonsberegning, eller vil legge til/endre/feilsoke kalkulasjonslogikk. Trigger
  ogsa nar brukeren spor om hvordan timer beregnes, vil justere faktorer, eller
  rapporterer feil i kalkyler.
---

# Estimate Calculator

Hjelper med a bygge, forbedre og feilsoke kalkulasjonsmotoren som beregner
tidsestimat for byggeprosjekter i Byggeplassen-appen.

## Arkitektur

Kalkylemotoren er delt i to filer:

- **productionData.js** — Ren data, ingen logikk. Inneholder:
  - `productionRates` — basistimer per enhet for alle jobbtyper (low/normal/high)
  - `jobCategories` — strukturert meny (Utvendig/Innvendig)
  - `accessFactors` — tilkomstfaktorer (normal 1.0, trang 1.15, vanskelig 1.3, svart vanskelig 1.45)
  - `heightFactors` — hoydefaktorer (bakke 1.0, stige 1.1, stillas 1.2, tak 1.3)
  - `complexityFactors` — kompleksitetsfaktorer (enkel 0.85, normal 1.0, kompleks 1.2, svart kompleks 1.45)
  - `calcDefs` — materialdefinisjoner per jobbtype
  - `calcDefaults` — standardverdier for materialkalkulator

- **calcEngine.js** — All beregningslogikk. Avhenger av productionData.js. Inneholder:
  - `getBaseTime(jobType, level)` — hent basistid fra productionRates
  - `getProductionRate(type)` — hent brukerens rate eller standard
  - `calcOperationHours(op)` — beregn timer for en operasjon med faktorer
  - `calcProject(project)` — hovedfunksjon, beregn hele prosjektet
  - Indirekte tid: kjoring, rigg, planlegging, opprydding, kvalitetskontroll

## Beregningsflyt

```
1. Bruker legger inn operasjoner (type, mengde, tilkomst, hoyde, kompleksitet)
2. For hver operasjon:
   basistimer = mengde × produksjonsrate(type, level)
   faktorTimer = basistimer × tilkomst × hoyde × kompleksitet
3. direkteTimer = sum av alle faktorTimer
4. indirektTimer = kjoring + rigg + planlegging + opprydding + kvalitetskontroll
5. totalTimer = direkteTimer + indirektTimer
6. Pris = totalTimer × timepris
```

## Viktige prinsipper

### Tre-nivaer for produksjonsrater
- **low** = rutinearbeid, god flyt, erfaren tomrer, ideelle forhold
- **normal** = standardverdi brukt i kalkyler, typisk prosjekt
- **high** = forstyrrelser, ekstra tilpasning, vanskelige forhold

Verdiene i productionRates er validert mot SmartKalk (Holte) og Svenn.
Se `docs/produksjonsdata-analyse.md` for komplett referansedata.

### Justeringsfaktorer
Faktorer multipliseres sammen. Eksempel:
- Trang tilkomst (1.15) + stillas (1.2) + kompleks (1.2) = 1.15 × 1.2 × 1.2 = **1.656**
- En jobb pa 10 timer normalt blir 16.6 timer

### Indirekte tid
Beregnes automatisk basert pa direkteTimer:
- **Kjoring**: km × 2 × antall turer / 80 km/t
- **Rigg**: 2t grunnlag + 0.5t per 8t direkte + ev. stillas 4%
- **Planlegging**: 1t + 3% av direkte
- **Opprydding**: 3% av direkte (justerbar)
- **Kvalitetskontroll**: 2% av direkte

### Brukerens egne rater
Brukeren kan overstyre standard produksjonsrater via `state.calcRates`.
`getProductionRate()` sjekker brukerens rate for, og faller tilbake til standard.

## Arbeidsflyt for endringer

### Legge til ny jobbtype
1. Legg til rate i `productionRates` i productionData.js
2. Legg til jobben i riktig kategori i `jobCategories`
3. Eventuelt legg til `calcDefs` for materialberegning
4. Verifiser at `calcEngine.js` haandterer den nye typen (den faller tilbake til `annet`)

### Endre beregningslogikk
1. Les hele `calcEngine.js` forst — forsta flyten
2. Identifiser hvilken funksjon som skal endres
3. Test med konkrete tall: gitt mengde X og rate Y, forvent Z timer
4. Sjekk at endringen ikke bryter andre beregninger

### Feilsoke kalkyle
1. Identifiser operasjonen med feil resultat
2. Sjekk produksjonsraten for jobtypen i productionData.js
3. Sjekk faktorene (tilkomst, hoyde, kompleksitet)
4. Folg beregningen steg for steg i calcOperationHours()
5. Sjekk indirekte tid i calcIndirectTime()

## Vanlige fallgruver

- **Enhet-mismatch**: Sjekk at mengde og rate bruker samme enhet (m2, lm, stk)
- **Faktor-stacking**: Tre faktorer ganges sammen — resultatet kan bli overraskende hoyt
- **Indirekte overshoot**: Pa sma jobber kan indirekte tid bli uforholdsmessig stor
- **Avrunding**: `round1()` runder til en desimal — kan gi avvik pa store summer
- **Bruker-rates**: Husk at `state.calcRates` overstyrer standard — sjekk denne ved feilsoking
