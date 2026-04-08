# Labor-system: Materialbasert timeberegning

Systemet beregner arbeidstimer fra materiallinjer, ikke fra jobbtype-rater. Hver materiallinje i en recipe kan baere arbeidstid uavhengig.

---

## Systemstatistikk

| Metrikk | Verdi |
|---------|-------|
| laborData-entries | 228 (177 Svenn, 51 estimat) |
| calcDefs (recipes) | 61 |
| Materiallinjer (standardinput) | 290 |
| Linjer med laborId | 180 (62 %) |
| Linjer med laborQty-override | 61 (21 %) |
| Unike laborId-er i bruk | 106 av 228 |
| stk-varianter | 4 (stolpesko, rekkverksspiler, vinkel_beslag, gjerde_bord) |
| Tester | 93 (10 seksjoner) |

---

## Hvordan timeberegning fungerer

```
calcDefs[type].calc(inputs, mats)
  -> materialer[] med laborId, laborQty (valgfri)

calcLineHours(line)
  -> (laborQty || qty) * resolvedRate

calcDirectBaseHours(materialLines[])
  -> sum(calcLineHours(line))

calcAdjustedDirectHours(baseHours, factors)
  -> baseHours * (1 + tilkomst + hoyde + kompleksitet)

totalTimer = adjustedDirectHours + indirectTime
```

Tre lag, en retning:

```
productionData.js (data) -> recipes.js (materiallinjer) -> calcEngine.js (timer)
```

Data flyter kun fremover. Ingen sirkulaere avhengigheter.

---

## Rate-kaskade

Naar `calcLineHours` beregner timer for en materiallinje, brukes foerste treff i denne rekkefølgen:

```
1. line.laborRate       Eksplisitt rate paa materiallinjen (manuell overstyring)
2. state.laborRates[id] Brukerens egne erfaringstall (lagret i state)
3. laborData[id].rate   Standardverdi fra sentral tabell
4. 0                    Ukjent materiale -> 0 timer (forbruksmateriell)
```

Eksempel: Hvis en bruker har justert raten for `kledning_dobbelfals_liggende` i innstillingene, brukes den verdien fremfor Svenn-standardverdien.

---

## qty / unit / laborQty / laborUnit

Hver materiallinje har to separate enhets-konsepter:

### Innkjoep (alltid til stede)

- **qty** — Mengde for materialkostnad og innkjoepsliste
- **unit** — Innkjoepsenhet (`lm`, `m2`, `stk`, `pk`, `rull`, `pl`, `sett`, `tube`, `m3` etc.)

### Arbeidstid (valgfritt)

- **laborId** — Noekkelen til laborData-oppslag. Uten denne: 0 timer.
- **laborQty** — Mengde for timeberegning. Hvis utelatt: bruker `qty`.
- **laborUnit** — Kun dokumentasjon (motoren bruker den ikke). Angir hva laborQty representerer.

### Naar trenger du laborQty?

Naar innkjoepsenheten ikke matcher arbeidsenhetene i laborData:

| Situasjon | Eksempel | Loesning |
|-----------|----------|----------|
| lm -> t/m2 | Kledning: qty=85 lm, rate=0.109 t/m2 | `laborQty:netto` (areal) |
| pk -> t/m2 | Isolasjon: qty=4 pk, rate=0.06 t/m2 | `laborQty:areal` |
| rull -> t/m2 | Vindsperre: qty=1 rull, rate=0.024 t/m2 | `laborQty:areal` |
| pl -> t/m2 | Gipsplater: qty=8 pl, rate=0.10 t/m2 | `laborQty:totAreal` |
| m3 -> t/m2 | Settsand: qty=1 m3, rate=0.25 t/m2 | `laborQty:areal` |
| m2 -> t/stk | Platemateriell: qty=16 m2, rate=2.5 t/stk | `laborQty:antall` |
| pl -> t/stk | Gips kasse: qty=1 pl, rate=1.5 t/stk | `laborQty:antall` |
| l -> t/stk | Lakk trapp: qty=4 l, rate=0.30 t/stk | `laborQty:antallTrinn` |

### Eksempler

```javascript
// Enhet matcher — laborQty ikke noedvendig
{ name: 'Gulvlist', qty: 28, unit: 'lm', laborId: 'gulvlist' }
// -> 28 * 0.052 = 1.456 timer

// Enhet matcher IKKE — laborQty noedvendig
{ name: 'Isolasjon 200mm', qty: 4, unit: 'pk', laborId: 'isolasjon_200mm',
  laborQty: 20, laborUnit: 'm2' }
// -> 20 * 0.065 = 1.3 timer (ikke 4 * 0.065)

// Betinget laborId basert paa materialvalg
{ name: 'Gjerdebord', qty: bordLm, unit: erLukket ? 'lm' : 'stk',
  laborId: erLukket ? 'gjerde_bord' : 'gjerde_bord_stk' }
```

---

## Guardrails

### I calcEngine.js

| Guardrail | Funksjon | Hva den fanger |
|-----------|----------|----------------|
| Enhetsmismatch-warning | `calcLineHours()` | `unit` matcher ikke `laborData[id].unit` og `laborQty` mangler |
| Duplikat-laborId-warning | `calcDirectBaseHours()` | Samme `laborId` brukt med ulike effective units i en recipe |
| Ukjent laborId-warning | `getLaborRate()` | `laborId` som ikke finnes i laborData |
| Nullsikring | `calcLineHours()` | `Number(...) \|\| 0` paa qty, rate-kaskade faller til 0 |

### I testsuiten (testLaborQty.js)

| Seksjon | Hva den tester |
|---------|----------------|
| 1. qty direkte | unit === laborUnit -> qty brukes |
| 2. laborQty override | unit !== laborUnit -> laborQty brukes |
| 3. Warnings | Mismatch uten laborQty -> warning, med -> ingen |
| 4. Takdetaljer | Undertak rull -> laborQty=areal |
| 5. Listverk | lm-basert, ingen laborQty noedvendig |
| 6. Trapp/rekkverk | Ingen dobbeltelling, opptrinn uten laborId |
| 7. sett->stk | Normalisering + stk-varianter |
| 8. laborQty platting/innredning | m3->m2, m2->stk, pl->stk |
| 9. Garderobe dobbeltelling | Sekundaere linjer uten laborId |
| 10. 0-warnings for alle calcDefs | Kjoerer alle 61 recipes, verifiserer 0 warnings |

**Seksjon 10 er den viktigste.** Den feiler hvis en ny recipe innfoerer en enhetsmismatch.

---

## Feiltyper som fanges automatisk

| Feil | Symptom | Konsekvens uten guardrail |
|------|---------|--------------------------|
| Ny recipe: lm + laborId t/m2 uten laborQty | Warning i console | Timer beregnet fra lm i stedet for m2 |
| To linjer med samme laborId, ulik enhet | Warning i console | Dobbelt arbeidstid |
| laborId som ikke finnes | Warning + 0 timer | NaN eller krasj |
| Manglende qty/laborQty | 0 timer (nullsikring) | NaN |
| Ny recipe med mismatch | Testsuiten feiler (seksjon 10) | Stille feil i produksjon |

---

## Saarbare omraader

Disse feilene fanges **ikke** automatisk:

| Saarbarhet | Risiko | Tiltak |
|------------|--------|--------|
| Feil laborQty-verdi | Recipe beregner laborQty manuelt. Feil formel gir feil timer uten warning. | Manuell kodegjennomgang |
| Manglende laborId | Arbeidsbaerelinje uten laborId gir 0 timer. Ingen warning. | Review-sjekkliste |
| Betingede linjer (spreads) | `...erX?[{...}]:[]` kan skjule linjer som trenger laborId/laborQty. | Test med alle materialvalg |
| 122 ubrukte laborData-entries | Nye recipes kan velge feil ID blant mange lignende. | Bruk rateSettingsGroups som guide |
| Estimat-rater (51 stk) | Merket `source:'estimate'`, ikke verifisert mot Svenn. | Verifiser mot erfaring over tid |
| stk-varianter | Manuelt utledet fra Svenn lm-rater. Upresis konvertering. | Juster basert paa erfaring |
| Alternative materialvalg | Testes kun med `options[0]` i seksjon 10. | Utvid tester for nye recipes |

---

## Utviklerregler for nye recipes

### 1. Sett laborId paa arbeidsbaerelinjene

Spiker, skruer, lim, tape uten laborId er ok (forbruksmateriell).
Virke, kledning, gips, isolasjon uten laborId er feil.

### 2. Sjekk enheten i laborData foer du bruker en laborId

Finn ID-en i productionData.js, les `unit`-feltet. Matcher den recipe-linjens `unit`? Hvis ikke: sett `laborQty`.

### 3. Sett laborQty + laborUnit naar innkjoepsenhet != arbeidsenhet

- pk/rull/pl/m3 med laborData t/m2 -> `laborQty: areal`
- lm med laborData t/m2 -> `laborQty: areal`
- m2/pl med laborData t/stk -> `laborQty: antall`

### 4. Bruk stk-varianter naar recipe teller stykk men Svenn maaler lm

Se etter eksisterende `*_stk` i laborData. Finnes ikke? Lag ny variant, dokumenter utledning.

### 5. Unngaa duplikate laborId-er i samme recipe

Samme laborId paa to linjer = dobbelt arbeidstid. Unntak: bevisst, med lik unit paa begge.

### 6. Aldri returner timer fra calc()

Timer beregnes i calcEngine fra materiallinjer. `calc()` returnerer kun `{ areal, info, materialer }`.

### 7. Test med standardinput OG alternative materialvalg

Betingede linjer (spreads) kan ha annen enhet. F.eks. gjerde: lukket=lm, stakitt=stk.

### 8. Bruk unit='stk', ikke 'sett', for linjer med laborId

laborData bruker `t/stk`. `sett != stk` gir warning. `sett` er ok kun for forbruksmateriell uten laborId.

### 9. Fjern laborId fra sekundaere linjer i samme operasjon

Skyvedoer: skinne baerer arbeid, paneler gjoer ikke. Garderobe: innredning baerer arbeid, gavler gjoer ikke.

### 10. Legg til TODO ved usikkerhet

```javascript
// TODO(thomas): usikker paa laborQty for X
```

Bedre med TODO enn med stille feil.

---

## Utviklerregler for nye laborData-entries

### 1. ID-er bruker snake_case med norsk fagspraak

`kledning_dobbelfals_liggende`, ikke `cladding_horizontal`.

### 2. Alltid oppgi unit som t/<enhet>

`t/m2`, `t/lm`, `t/stk`, `t/m3`. Ikke bare "m2".

### 3. Alltid oppgi category, source, confidence

```javascript
{ rate: 0.109, unit: 't/m2', label: 'Kledning dobbelfals',
  category: 'kledning', source: 'svenn', confidence: 'high' }
```

- **source**: `'svenn'` (verifisert) eller `'estimate'` (anslag)
- **confidence**: `'high'`, `'medium'`, `'low'`

### 4. Lag stk-variant naar Svenn-data er i lm men recipes bruker stk

Navnekonvensjon: `original_stk`. Dokumenter utledningen i kommentar:

```javascript
// Svenn har vinkel_beslag: 0.055 t/lm, men recipes bruker stk (per beslag).
vinkel_beslag_stk: { rate: 0.015, unit: 't/stk', ... }
```

### 5. Legg til i rateSettingsGroups

Nye ID-er maa inn i riktig gruppe for aa vises i innstillingspanelet.

### 6. Unngaa overlappende ID-er

`gjerde_bord` (t/lm) og `gjerde_bord_stk` (t/stk) er ok — forskjellig enhet.
`gjerde_bord` og `gjerde_spile` med samme rate — velg en.

### 7. Ikke endre unit paa eksisterende entry brukt i recipes

Endring fra `t/lm` til `t/m2` oedelegger alle recipes som bruker den. Lag ny ID i stedet.

### 8. Sett rate=0 kun for forbruksmaterialer

Hvis rate er 0 og entry har recipe-bruk: noe er feil.

### 9. Hold resept-kompatible entries samlet

Seksjon "RESEPT-KOMPATIBLE OPPFOERINGER" i productionData.js. Svenn-entries over, estimater under.

### 10. Oppdater label til norsk brukerlesbart navn

Vises i innstillingspanelet. "Kledning dobbelfals liggende", ikke "kledning_dobbelfals_liggende".

---

## Validerings-checklist

Bruk denne naar du legger til en ny recipe eller laborData-entry:

```
[ ] unit
    Matcher laborData[laborId].unit (etter t/-prefix)?
    Ja -> ok. Nei -> sett laborQty + laborUnit.

[ ] laborUnit
    Er laborUnit satt naar laborQty er satt?
    laborQty uten laborUnit er teknisk ok men utydelig.

[ ] laborQty
    Er verdien korrekt beregnet fra recipe-inputs?
    Dobbeltsjekk: er det areal, antall, eller lengde?
    Betinget linje? Sjekk begge grener.

[ ] rate=0
    Er det tilsiktet? Forbruksmaterialer: ok.
    Arbeidsbaerelinje: feil, legg til laborId.

[ ] duplikat laborId
    Brukes samme laborId paa flere linjer i recipe?
    Hvis ja: er det bevisst og med lik unit?
    Ellers: fjern laborId fra sekundaer linje.

[ ] dobbeltelling
    Baerer to linjer arbeid for samme operasjon?
    F.eks. skinne + panel = en montering?
    Bare hovedlinjen skal ha laborId.

[ ] tvetydige varianter
    Finnes baade original og _stk i laborData?
    Bruker du riktig variant for recipe-ens unit?
    lm-recipe -> original. stk-recipe -> _stk.

[ ] materialvalg
    Gir alternative materialOptions annen enhet?
    Test med alle options, ikke bare [0].

[ ] rateSettingsGroups
    Er ny laborId lagt til i riktig gruppe?

[ ] 0-warnings
    Kjoer: node testLaborQty.js
    Seksjon 10 skal passere.
```
