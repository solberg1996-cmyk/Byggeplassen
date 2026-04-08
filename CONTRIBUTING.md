# Bidra til Kalk

## Viktigste regler for labor-/recipe-systemet

1. **Sett laborId paa alle arbeidsbaerelinjene** — virke, kledning, gips, isolasjon etc. Forbruksmateriell (spiker, lim) uten laborId er ok.

2. **Sjekk enheten i laborData foer du bruker en laborId** — matcher `unit` i recipe med `unit` i laborData? Hvis ikke: sett `laborQty` og `laborUnit`.

3. **Bruk stk-varianter** naar recipe teller stykk men laborData maaler i lm. Se etter `*_stk` i productionData.js.

4. **Unngaa duplikate laborId-er i samme recipe** — to linjer med samme laborId = dobbelttelling. Fjern laborId fra sekundaere linjer.

5. **Bruk `unit:'stk'`, ikke `'sett'`**, paa linjer med laborId. laborData bruker `t/stk`.

6. **Aldri returner timer fra calc()** — timer beregnes i calcEngine, ikke i recipes.

7. **Nye laborData-entries maa ha** `category`, `source` og `confidence`. Legg til i `rateSettingsGroups`.

8. **Ikke endre `unit` paa eksisterende laborData-entry** — lag ny ID i stedet.

## Teste endringer

```bash
node testLaborQty.js
```

Alle 93 tester maa passere. Seksjon 10 kjoerer alle 61 recipes og verifiserer 0 engine-warnings — den feiler hvis en ny recipe innfoerer en enhetsmismatch.

## Full dokumentasjon

Se [docs/labor-system.md](docs/labor-system.md) for:

- Systemstatistikk og arkitektur
- Rate-kaskade (4 nivaaer)
- Forklaring av qty / unit / laborQty / laborUnit
- Guardrails og feiltyper som fanges
- Saarbare omraader
- Utviklerregler for recipes og laborData
- Full validerings-checklist for nye entries
