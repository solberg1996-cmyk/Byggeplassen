---
name: material-data-manager
description: >
  Haandterer materialdefinisjoner, mengdeberegninger, svinn-prosenter og priskobling i
  productionData.js (calcDefs). Bruk denne skillen nar brukeren nevner materialliste,
  materialberegning, calcDefs, svinn/waste, dekningsbredde, kledningsmal, NOBB, materialpriser,
  pris-CSV, mengdeberegning, materialformel, board coverage, eller vil legge til/endre
  materialer for en jobbtype. Trigger ogsa nar brukeren jobber med materialformler,
  trelastdimensjoner, c/c-avstand, eller spor om hvor mye materiale som trengs.
---

# Material Data Manager

Hjelper med a definere, beregne og vedlikeholde materiallister og kalkulasjonsdefinisjoner
(calcDefs) i Byggeplassen-appen.

## Hvorfor dette er viktig

Byggeplassen beregner materialforbruk basert pa `calcDefs` i `productionData.js`. Hver
jobbtype har en materialdefinisjon som inneholder formler for mengde og svinn. Feil her
betyr feil materialbestilling — enten for lite (forsinkelse) eller for mye (bortkastet).

## Datastruktur i productionData.js

### calcDefs
```javascript
const calcDefs = {
  kledning: {
    materials: [
      { name: 'Kledningsbord 23x148 furu',    unit: 'lm', formula: 'area * 8.13', waste: 0.10 },
      { name: 'Lekt 36x48 impregnert',         unit: 'lm', formula: 'area * 3.5',  waste: 0.08 },
      { name: 'Vindsperre',                     unit: 'm²', formula: 'area * 1.0',  waste: 0.15 },
      { name: 'Skruer rustfri A4 4.2x55',      unit: 'pk', formula: 'area * 0.08', waste: 0.10 },
    ],
  },
  // ... en definisjon per jobbtype
};
```

### Hvordan formlene brukes
- `area` = brukeren oppgir m2, lm eller stk avhengig av jobbtype
- `formula` evalueres med area som variabel
- Resultat ganges med `(1 + waste)` for a legge til svinn
- Endelig mengde kobles mot materialpriser fra CSV

### Priskobling
- Appen laster en CSV med materialpriser fra Supabase
- CSV-format: NOBB-nr, Navn, Enhet, Innkjopspris, Paslag, Enhetspris
- Matching skjer pa `name`-feltet i calcDefs mot CSV-navn
- Hvis navn ikke matcher far brukeren en advarsel

## Arbeidsflyt

### Legge til materialer for en ny jobbtype

1. **Les productionData.js** — finn eksisterende calcDefs for kontekst
2. **Identifiser materialene** som trengs for jobben:
   - Hovedmateriale (bord, plater, etc.)
   - Festemidler (skruer, spiker)
   - Underlag/membran (vindsperre, dampsperre)
   - Lekting/underlag
3. **Beregn formelfaktorer** — se referanse `references/material-formulas.md`
4. **Sett svinn-prosent** basert pa materialtype
5. **Skriv calcDef** med riktig format
6. **Verifiser** at materialnavnene matcher prislisten

### Endre eksisterende materialdefinisjoner

1. Les gjeldende calcDef for jobben
2. Identifiser hva som skal endres (mengde, svinn, nytt material)
3. Beregn ny formelfaktor hvis mengden endres
4. Oppdater calcDef
5. Les `references/material-formulas.md` for vanlige formler hvis relevant

## Svinn-prosenter etter materialtype

| Materialtype | Svinn % | Grunn |
|-------------|---------|-------|
| Konstruksjonstrelast (stender, bjelker) | 8-10% | Kapping, feilkutt |
| Kledning/panel (utvendig) | 10-15% | Mye tilpasning rundt hjorner/vinduer |
| Panel (innvendig) | 8-12% | Mindre tilpasning enn utvendig |
| Gipsplater | 10-12% | Store plater, mye avskjaer |
| Isolasjon (mineralull) | 5-8% | Komprimerbar, lite avfall |
| Dampsperre/membran | 15% | Omlegg 150-200mm |
| Vindsperre | 15% | Omlegg 150mm |
| Skruer/festemidler | 10% | Feilskruing, tapt |
| Takstein | 5-8% | Kapping pa gradtak |
| Bjelkesko/beslag | 5% | Lite avfall |
| Lim/fugemasse | 10% | Smoreavfall |

## Norske trelastdimensjoner

### Konstruksjonstrelast (C24)
| Dimensjon | Vanlig bruk |
|-----------|------------|
| 36x48 | Lekt, sloyfe |
| 48x48 | Lekt, stroplekt |
| 48x98 | Bindingsverk innervegger |
| 48x148 | Bindingsverk yttervegger |
| 48x198 | Bindingsverk, bjelker |
| 48x248 | Bjelker, sperrer |
| 73x198 | Dragere, bjelker |
| 73x248 | Dragere |

### Standard c/c-avstander
- Stenderverk: 600mm (standard), 400mm (baerevegger)
- Lekting for kledning: 600mm
- Bjelkelag: 600mm (standard), 400mm (tung belastning)
- Sperrer: 600mm eller 900mm
- Takstein-lekting: varierer med steintype (300-370mm)

## Tips for gode materialformler

### Trelast per m2 vegg (stenderverk c/c 600)
Stendere: `area / 0.6` gir antall stendere. Med 2.4m hoydevegger:
```
lm stender = area / 0.6 * 2.4  → forenklet: area * 4.0
```
Men med svill + reim (2 x bredde): legg til `area / vegghoyde * 2 * veggbredde`

### Kledningsbord per m2
Dekningsbredde avgjor antall bord per m2:
```
bord per m2 = 1000 / dekningsbredde_mm
lm per m2 = bord_per_m2 (hvis 1 bord = 1 lm hoydebredde)
```

Eksempel: 23x148 med 123mm dekningsbredde:
```
1000 / 123 = 8.13 lm per m2
```

### Festemidler
- Kledning: ~25 skruer per m2 (ca 0.5 pk a 200 stk per 4m2)
- Gips: ~15 skruer per m2
- Lekting: ~4 skruer per m2

## Eksempel: Komplett calcDef for ny jobbtype

```javascript
// Eksempel: Levegg med staende kledning
levegg: {
  materials: [
    { name: 'Stender 48x98 C24',              unit: 'lm', formula: 'area * 4.0',  waste: 0.10 },
    { name: 'Kledningsbord 23x148 furu',       unit: 'lm', formula: 'area * 8.13', waste: 0.12 },
    { name: 'Lekt 36x48 impregnert',           unit: 'lm', formula: 'area * 3.5',  waste: 0.08 },
    { name: 'Stolpesko 48x98',                 unit: 'stk', formula: 'area * 0.7', waste: 0.05 },
    { name: 'Skruer rustfri A4 4.2x55',        unit: 'pk', formula: 'area * 0.13', waste: 0.10 },
    { name: 'Fundament/stolpesko',              unit: 'stk', formula: 'area * 0.4', waste: 0.00 },
  ],
},
```
