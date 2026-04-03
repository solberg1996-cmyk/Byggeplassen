# Materialformler — Referanse

Vanlige formler for mengdeberegning av byggematerialer. Brukes i `calcDefs` i
`productionData.js`. Variabelen `area` representerer brukerens oppgitte mengde
(m2, lm eller stk avhengig av jobbtype).

## Innholdsfortegnelse

1. Trelast og kledning
2. Plater (gips, OSB, kryssfiner)
3. Isolasjon og membran
4. Festemidler
5. Lekting og underlag
6. Terrasse og utendors
7. Generelle formler

---

## 1. Trelast og kledning

### Kledningsbord per m2

Dekningsbredde bestemmer antall bord per m2:

```
lm per m2 = 1000 / dekningsbredde_mm
```

| Dimensjon | Total bredde | Dekningsbredde | lm per m2 |
|-----------|-------------|----------------|-----------|
| 19x123 | 123 mm | 98 mm | 10.2 |
| 23x148 | 148 mm | 123 mm | 8.13 |
| 23x173 | 173 mm | 148 mm | 6.76 |
| 28x120 | 120 mm | 95 mm | 10.5 |
| 28x145 | 145 mm | 120 mm | 8.33 |

Dekningsbredde = total bredde minus not/fjor-overlapp (typisk 25mm).

### Stenderverk per m2 vegg

```
antall stendere = bredde_m / cc_avstand + 1
lm stender = antall × vegghoyde

Forenklet for c/c 600, 2.4m hoyde:
lm per m2 = area / 0.6 × 2.4 ≈ area × 4.0
```

Med svill og reim (liggande trelast oppe og nede):
```
lm svill_reim = (area / vegghoyde) × 2
Total lm = stender_lm + svill_reim_lm
```

### Bjelker per m2 gulv

```
c/c 600: antall bjelker = bredde / 0.6 + 1
lm bjelke = antall × spennlengde

Forenklet per m2: area × 1.7 (c/c 600)
                  area × 2.5 (c/c 400)
```

## 2. Plater (gips, OSB, kryssfiner)

### Gipsplater per m2

Standard platestorrelse: 1200 × 2400 mm = 2.88 m2 per plate.

```
plater per m2 = 1 / 2.88 ≈ 0.35
m2 gips per m2 vegg = 1.0 (1:1 dekning)
```

For dobbel gipsing: `area × 2.0`

### OSB/kryssfiner per m2

Standard 1200 × 2400 = 2.88 m2, men ogsa 1220 × 2440 = 2.98 m2.

```
m2 plate per m2 = 1.0
```

## 3. Isolasjon og membran

### Mineralull per m2

Selges i ruller (bredde 570 eller 600 mm) eller plater.

```
m2 isolasjon per m2 = 1.0 (1:1 dekning)
```

Svinn er lavt (5-8%) fordi mineralull kan komprimeres og skjaeres presist.

### Vindsperre per m2

Selges i ruller, typisk 1.5m × 50m. Overlapp 150mm.

```
m2 vindsperre per m2 = 1.0
```

Svinn 15% dekker overlapp og avskjaer.

### Dampsperre per m2

Plastfolie, overlapp 150-200mm. Tapes i skjot.

```
m2 dampsperre per m2 = 1.0
```

Svinn 15% dekker overlapp.

## 4. Festemidler

### Skruer for kledning

Ca 25 skruer per m2 kledning (2 skruer per bord per lekt).

```
pakker per m2 = area × 25 / antall_i_pk
```

Vanlige pakningsstorrelser: 200 stk, 250 stk, 500 stk.

| Bruk | Skruer per m2 | Typisk formel (pk a 200) |
|------|--------------|--------------------------|
| Kledning utvendig | 25 | area × 0.13 |
| Gipsplater | 15 | area × 0.08 |
| Lekting | 4 | area × 0.02 |
| Panel innvendig | 20 | area × 0.10 |
| Terrassebord | 20 | area × 0.10 |

### Spiker

Brukes for lekting, bjelkelag, reisverk.

```
kg spiker per m2 reisverk ≈ 0.5 kg
kg spiker per m2 lekting ≈ 0.2 kg
```

### Beslag

Bjelkesko, vinkler, stolpesko — stykk-basert:

```
bjelkesko per m2 gulv (c/c 600) = 1 / 0.6 × 2 ≈ 3.3 stk per lm bjelkelag
stolpesko per stk stolpe = 1
vinkelbeslag per hjorne = 2-4 stk
```

## 5. Lekting og underlag

### Lekting for kledning (sloyfing + kleding-lekt)

Vertikal sloyfing c/c 600 + horisontal lekt c/c 600:

```
sloyfing (vertikal): area × 1.7 lm (c/c 600)
kledningslekt (horisontal): area × 1.7 lm (c/c 600)
Total: area × 3.4 lm
```

Forenklet: `area × 3.5` (med litt ekstra for korte biter/avkapp).

### Lekting for gips/panel innvendig

Horisontal lekting c/c 600 eller c/c 400:

```
c/c 600: area × 1.7 lm
c/c 400: area × 2.5 lm
```

## 6. Terrasse og utendors

### Terrassebord per m2

| Dimensjon | Spalte | Dekningsbredde | lm per m2 |
|-----------|--------|----------------|-----------|
| 28x120 | 5mm | 125 mm | 8.0 |
| 28x145 | 5mm | 150 mm | 6.67 |
| 48x148 royal | 5mm | 153 mm | 6.54 |

### Baerekonstruksjon terrasse

```
bjelker c/c 600: area × 1.7 lm
strekkfisker: varierer med design
stolper: ca 1 per 2 m2 (area × 0.5 stk)
```

### Rekkverk per lm

```
stolper c/c 1200: lm / 1.2 + 1 stk
handloper: lm × 1.0
sprosser c/c 100: lm / 0.1 stk (for sprossrekkverk)
```

## 7. Generelle formler

### Omregning mellom enheter

```
m2 til lm (bord): m2 × (1000 / dekningsbredde_mm)
m2 til stk (plater): m2 / plate_areal
lm til stk (stolper c/c X): lm / X + 1
```

### Svinn-tillegg

Alle formler gir netto mengde. Svinn legges til i calcDefs:

```
bestillingsmengde = formelresultat × (1 + waste)
```

Se SKILL.md for svinn-prosenter per materialtype.
