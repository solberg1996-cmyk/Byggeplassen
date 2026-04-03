# Produksjonsdata-analyse — SmartKalk + Svenn vs Byggeplassen

Dato: 2026-04-03
Kilder: SmartKalk (EG/Holte), Svenn (web.svenn.com), egne verdier i productionData.js

## Om kildene

### SmartKalk
- Norsk bransjestandard kalkulasjonsprogram (EG/Holte)
- Bruker ENH. TIDSF. (enhetstidsfaktor) i timer
- Gir både komponent-rater og komplette poster
- NS 3420-basert

### Svenn
- Norsk prosjektstyringsverktoy med kalkulasjonsmaler
- Bruker Grunnid i mannsdager (md). Omregning: md x 7.5 = timer
- NS 3420-basert bygningsdelsmonstre
- Gir typisk komponent-niva rater (basisarbeid uten tilpasning)

### Byggeplassen (var app)
- Bruker low/normal/high rater i timer per enhet
- Normal-verdi er standardverdien i kalkyler
- Inkluderer komplett jobb med tilpasning

---

## SmartKalk — Detaljerte datapunkter

### Komplette poster (ENH. TIDSF. i timer)

| Post | Timer | Enhet | Kilde |
|------|-------|-------|-------|
| Etterisolering komplett vegg | 1.04 | t/m2 | Prosjektkalk |
| — panel | 0.320 | t/m2 | Komponent |
| — utlekting | 0.180 | t/m2 | Komponent |
| — bindingsverk | 0.220 | t/m2 | Komponent |
| — gips | 0.150 | t/m2 | Komponent |
| — isolering | 0.080 | t/m2 | Komponent |
| — vindsperre | 0.030 | t/m2 | Komponent |
| — sloyfer | 0.050 | t/m2 | Komponent |
| Bindingsverk nybygg stor flate | 1.89 | t/m2 | Prosjektkalk |
| Bindingsverk nybygg liten flate 12.4m2 | 2.37 | t/m2 | Prosjektkalk |
| Innerdor komplett | 4.81 | t/stk | Prosjektkalk |
| — apning | 0.540 | t/stk | Komponent |
| — dor | 1.350 | t/stk | Komponent |
| — foring | 0.690 | t/stk | Komponent (0.135 t/lm x ~5lm) |
| — dytting | 0.150 | t/stk | Komponent |
| — feielist | 0.270 | t/stk | Komponent |
| — beslag | 0.405 | t/stk | Komponent |
| — karmlist | 1.430 | t/stk | Komponent (0.135 t/lm x ~10.6lm) |
| Vindu komplett m/riving | 4.32 | t/stk | Prosjektkalk |
| — riving | 0.650 | t/stk | Komponent |
| — montering | 0.980 | t/stk | Komponent |
| — foring+listing+fuging | 1.690 | t/stk | Komponent |
| Vindu trevegg | 2.76-4.09 | t/stk | Katalog |
| Vindu murvegg | 5.10-6.05 | t/stk | Katalog |
| Ytterdor murvegg | 8.19 | t/stk | Prosjektkalk |
| Hovedinngang m/sidefelt | 8.92 | t/stk | Prosjektkalk |
| Ytterdor trevegg (antatt) | ~4.3 | t/stk | Utledet |
| Terrassegulv enkel | 0.78 | t/m2 | Prosjektkalk |
| Dragere 90x315 | 1.35 | t/stk | Prosjektkalk |
| Stillas montering | 0.300 | t/m2 | Prosjektkalk |
| Stillas demontering | 0.300 | t/m2 | Prosjektkalk |

### Katalog komponent-rater

#### Kledning (per m2)
| Type | Timer |
|------|-------|
| Staende utv. kledning, Royal enkelfals | 1.08 |
| Liggende utv. kledning, Royal enkelfals | 1.08 |
| Spaltekledning furu | ~0.75 |

#### Gipsplater (per m2)
| Type | Timer |
|------|-------|
| Gipsplater innv. kledning, enkel gips | 0.27 |
| Gipsplater innv. kledning, dobbel gips | 0.41 |
| Gipsplater innv. kledning, Hard gips | 0.21 |
| Gipsplater innv. kledning, kipper gips | 0.48 |
| Gipsplater pa rupanel 1x13mm | 0.17 |
| Gipsplater pa rupanel 2x13mm | 0.25 |
| Setting delesparring, gipsplate >8 m2 | 0.40 |
| Setting delesparring, gipsplate en side | 0.47 |

#### Panel innvendig (per m2)
| Type | Timer |
|------|-------|
| Gulvpanel furu staende | 0.26 |
| Gulvpanel furu kledning | 0.28 |
| Himlingspanel furu staende | 0.47 |
| Himlingspanel furu matt staende | 0.47 |
| Liggende panel med omlegg | 0.35 |
| Staende panel med dobbeltfals | 0.25 |
| Tommermannspanel | 0.42-1.45 |

#### Gulv (per m2)
| Type | Timer |
|------|-------|
| Parkett pa undergulv, eik | 0.21 |
| Parkett 1 stav pa undergulv | 0.21 |
| Parkett 3 stav pa undergulv | 0.25 |
| Parkett pa undergulv, eik matt | 0.31 |
| Laminat gulv eik | 0.18 |
| Bordgulv pa undergulv | 0.25-0.28 |
| Sliping/lakkering plast | 0.14 |

#### Terrassegulv (per m2)
| Type | Timer |
|------|-------|
| Terrassegulv Robusg 21x132 | 0.47 |
| Terrassegulv Robusg 26x120 | 0.50 |
| Terrassegulv trykkimpregnert | 0.42-0.62 |
| Til. DEK 1 til terrassegulv | 0.17 |
| Til. DEK 2 til terrassegulv | 0.17 |

#### Bjelkelag (per stk/lm)
| Type | Timer |
|------|-------|
| Bjelkelag L=3300mm | 0.18 |
| Bjelkelag L=3600mm | 0.22 |
| Bjelkelag L=4800mm | 0.28 |
| Forsterkning bjelkelag for baerevegger | 0.14 |

#### Tak-komponenter
| Type | Timer | Enhet |
|------|-------|-------|
| Sperretakk av beitski c/s 600 | 0.25 | t/stk |
| Lekter og sloyfer for takstein | 0.06-0.18 | t/m2 |
| Undertak panel | 0.27-0.38 | t/m2 |
| Mineralull takisolplate | 0.18 | t/m2 |
| Membrankar for takstein | 0.15 | t/m2 |
| Takstein subtelstein flat sort | 1.07 | t/stk? |

#### Vindskier (per stk)
| Type | Timer |
|------|-------|
| Vindskier av tre (2 bord i hoyden) | 0.28-1.48 |

#### Rekkverk (per stk/seksjon)
| Type | Timer |
|------|-------|
| Rekkverk trykkimpregnert tre | 1.15 |
| Rekkverk liggende spile, impregnert | 1.15 |
| Rekkverk staende spile, impregnert | 1.15 |

#### Listverk (per lm)
| Type | Timer |
|------|-------|
| Gulvlist | 0.09 |
| Karmlist | 0.10 |

#### Riving
| Type | Timer | Enhet |
|------|-------|-------|
| Riving panel | 0.14 | t/m2 |
| Riving vindu | 1.94 | t/stk |
| Riving dor | 1.84 | t/stk |

#### Bindingsverk detaljert (fra katalog)
| Type | Timer | Enhet |
|------|-------|-------|
| Enkelt bindingsverk beltro m/2 spleiering, div. storr. | 0.22-1.48 | t/stk |
| Enkelt bindingsverk beltro u/spleiering | 0.18-1.32 | t/stk |
| Dobbelt bindingsverk stal c/s 60 | 0.28-0.38 | t/stk |
| Enkelt bindingsverk I-profil | 0.25-1.58 | t/stk |

#### Dor-komponenter (fra katalog)
| Type | Timer | Enhet |
|------|-------|-------|
| Innvendig belisting dor/vindu | 1.00 | t/stk |
| Utfoak etter halfkledning for dor | 1.52-1.58 | t/stk |
| Fuging m/akryl, vindu og dor | 0.15 | t/stk |
| Fuging, brannfuge, vindu og dor | 0.11 | t/stk |

#### Takbord (per m2)
| Type | Timer |
|------|-------|
| Takbord A1 eps | 0.12 |
| Takbord furu ferdig matt | 0.48 |
| Takbord furu profil matt | 0.48 |
| Takbord furu, ubehandlet | 0.18 |

#### Undergulv (per m2)
| Type | Timer |
|------|-------|
| Undergulv av kryssfiner | 0.15 |
| Undergulv av plater trellfiber, hard | 0.18 |
| Undergulv av plater, gips | 0.18 |
| Undergulv av sponplater | 0.15-0.18 |

---

## Svenn — Detaljerte datapunkter

Alle Grunnid-verdier i mannsdager (md). Timer = md x 7.5.

### 01.311 Hovedbjelker
| Type | Grunnid (md) | Timer | Enhet |
|------|-------------|-------|-------|
| Limtre (alle storr.) | 0.665 | 4.99 | t/stk |

### 02.331 Ytakbjeller og sperrer
| Komponent | Grunnid (md) | Timer | Enhet |
|-----------|-------------|-------|-------|
| Takstoler 80x180mm | 0.13 | 0.98 | t/stk |
| Takstein (Surdal) | 0.032 | 0.24 | t/ml |
| Moenekul | 0.07 | 0.53 | t/stk |
| Auktoring | 0.008 | 0.06 | t/md |
| Vindsperre | 0.01 | 0.08 | t/m2 |

### 02.302 Bjelkelag for gulv og dekker
| Komponent | Grunnid (md) | Timer | Enhet |
|-----------|-------------|-------|-------|
| Bjelkelag (I-bjelke) | 0.008 | 0.06 | t/m2 |
| Sprotslam (blokkering) | 0.006 | 0.05 | t/m2 |
| Isolasjon | 0.008-0.038 | 0.06-0.29 | t/m2 |
| Bjelkelag total (uten isol.) | ~0.014 | ~0.11 | t/m2 |
| Bjelkelag total (med isol.) | ~0.052 | ~0.39 | t/m2 |

### 41.511 Baerende yttervegger — Komplett vegg 98x198
| Komponent | Grunnid (md) | Timer | Enhet |
|-----------|-------------|-------|-------|
| Bindingsverk | 0.039 | 0.29 | t/m2 |
| Tillegg monteringsverkt | 0.013 | 0.10 | t/m2 |
| Vindsperre | 0.012 | 0.09 | t/m2 |
| Avyestring lekting 36x48 | 0.13 | 0.98 | t/m |
| Isolasjon 200mm | 0.008 | 0.06 | t/m2 |
| Gips innvendig | 0.044 | 0.33 | t/m2 |
| Utlekting innvendig 48mm | 0.054 | 0.41 | t/m |
| Panel/bordkledning 19x102 | 0.090 | 0.68 | t/m2 |

### 41.418 Utvendig kledning
| Komponent | Grunnid (md) | Timer | Enhet |
|-----------|-------------|-------|-------|
| Lekting (lektlon) | 0.041 | 0.31 | t/m2 |
| Liggende kledning | 0.026 | 0.20 | t/m2 |
| Staende kledning | 0.030 | 0.23 | t/m2 |
| Total kledning m/lekting | ~0.067 | ~0.50 | t/m2 |

### 41.414 Vinduer, dorer, porter
| Komponent | Grunnid (md) | Timer | Enhet |
|-----------|-------------|-------|-------|
| Vindu montering (kappen) | 0.18-0.19 | 1.35-1.43 | t/stk |
| Utforing | 0.041 | 0.31 | t/lm |
| Karmlist | 0.041 | 0.31 | t/lm |
| Sylforing | 0.045 | 0.34 | t/lm |
| Bunnfylningslist | 0.012 | 0.09 | t/lm |
| Fugemasse | 0.03 | 0.23 | t/lm |

#### Vindu komplett beregning (typisk vindu ~5lm omkrets):
- Montering: 1.43 t
- Utforing 5lm: 1.55 t
- Karmlist 5lm: 1.55 t
- Sylforing, fuging etc: ~1.5 t
- **Total: ~6 t** (murvegg, inkluderer mer arbeid)

#### Ytterdor 3x21 (murvegg):
- Apning i bindingsverk: 0.45 md = 3.38 t
- Dor montering + foring + listing: ~3-4 t
- **Total: ~6-7 t** (murvegg)

### Skyvedorer
| Type | Grunnid (md) | Timer |
|------|-------------|-------|
| Skyvedor 80 | 1.05 | 7.88 |
| Skyvedor B2 | 1.05 | 7.88 |

### 43.554 Gulv og overflate
| Komponent | Grunnid (md) | Timer | Enhet |
|-----------|-------------|-------|-------|
| Parkett pa undergulv | 0.008-0.075 | 0.06-0.56 | t/m2 |
| Parkettunderlag | 0.015 | 0.11 | t/m2 |
| Laminat | 0.008 | 0.06 | t/m2 |

### Himling
| Komponent | Grunnid (md) | Timer | Enhet |
|-----------|-------------|-------|-------|
| Lekting (lektlon) | 0.041 | 0.31 | t/m2 |
| Himlingspanel | 0.042 | 0.32 | t/m2 |
| Dampsperre | 0.012 | 0.09 | t/m2 |
| Total himling | ~0.095 | ~0.71 | t/m2 |

### Isolasjon
| Tykkelse | Grunnid (md) | Timer | Enhet |
|----------|-------------|-------|-------|
| 70mm | 0.008-0.048 | 0.06-0.36 | t/m2 |
| 100mm | 0.008-0.025 | 0.06-0.19 | t/m2 |
| 148mm | 0.048 | 0.36 | t/m2 |
| 150mm | 0.045 | 0.34 | t/m2 |
| 200mm | 0.008 | 0.06 | t/m2 |

### Undergulv
| Komponent | Grunnid (md) | Timer | Enhet |
|-----------|-------------|-------|-------|
| Undergulv sponplater | 0.006 | 0.05 | t/m2 |
| Belsting (lekting) | 0.008 | 0.06 | t/m2 |
| Dampsperre | 0.001 | 0.01 | t/m2 |
| Total undergulv | ~0.015 | ~0.11 | t/m2 |

### 67.671 Hovedtrapper
| Type | Grunnid (md) | Timer |
|------|-------------|-------|
| Montering innvendig trapp (komplett) | 1.5 | 11.25 |
| Montering trappeloper | 0.001 | 0.01 |

### 55.633 Kjokkeninnredning
| Komponent | Grunnid (md) | Timer | Enhet |
|-----------|-------------|-------|-------|
| Montering underskap | 0.037 | 0.28 | t/stk |
| Montering overskap | 0.074 | 0.56 | t/stk |
| Montering hoyskap 1 dor | 0.088 | 0.66 | t/stk |
| Montering hoyskap 2 dorer | 0.088 | 0.66 | t/stk |

### 56.564 Vatromsoverflate
| Komponent | Grunnid (md) | Timer | Enhet |
|-----------|-------------|-------|-------|
| Baderomsplate | 0.035 | 0.26 | t/m2 |
| Silikon | 0.001 | 0.01 | t/m2 |

### Levegg
| Komponent | Grunnid (md) | Timer | Enhet |
|-----------|-------------|-------|-------|
| Levegg m/staende kledning | 0.22 | 1.65 | t/m2 |
| Levegg m/liggende kledning | 0.22 | 1.65 | t/m2 |
| Rekverksstolpe M6.75 c/s 1500 | 0.171 | 1.28 | t/stk |

### Gjerde og port
| Type | Grunnid (md) | Timer | Enhet |
|------|-------------|-------|-------|
| Gjerde m/staende spiler — stolpe | 0.75 | 5.63 | t/stk |
| Gjerde — splenting | 0.234 | 1.76 | t/m |
| Port, staende — stolpe | 0.75 | 5.63 | t/stk |

### Rekkverk
| Type | Grunnid (md) | Timer | Enhet |
|------|-------------|-------|-------|
| Rekkverk med stolpe | 0.171 | 1.28 | t/stk |
| Sprosser/spiler | 0.234 | 1.76 | t/m |

### Pergola
| Type | Grunnid (md) | Timer |
|------|-------------|-------|
| Montasje Pergola (komplett) | 1.0 | 7.50 |

### 85.691 Listverk
| Type | Grunnid (md) | Timer | Enhet |
|------|-------------|-------|-------|
| Taklist furu div. profiler | 0.006 | 0.045 | t/lm |

---

## SmartKalk prosjektkalkyle — "Hypp welding" (komplett referanse)

Fra screenshots 15:09-15:10, en komplett prosjektkalkyle med NS-koder:

Prosjektet viser en fullstendig renovering med folgende hoveddeler:
- Utstikning, drift og stilling
- Rigging mm
- Drift av byggeplassen
- Tonerrarbeid
- Betong og stein, mek. veikstoll
- Montasje av panel, vegg
- Kledning / vindskier / listverk
- Vinduer og dorer
- Gulvarbeid
- Gipsarbeid

Detaljerte linjer med NS-koder, mengder, enhetspriser og timer er synlige
men vanskelig a lese presis pa grunn av opplosning.

---

## Oppsummering — Hovedfunn

### Systematiske moenstre

1. **Svenn gir lavere rater enn SmartKalk** — Svenn er ren basismontering,
   SmartKalk inkluderer tilpasning, hjorner, avslutninger, opprydding.
   SmartKalks "komplette post" er mest representativ for faktisk tidsbruk.

2. **Gulvarbeid er systematisk overestimert** i Byggeplassen:
   - Parkett: 0.6 vs SK 0.21-0.31 (selv med prep: ~0.45)
   - Laminat: 0.5 vs SK 0.18 (med prep: ~0.35)
   - Heltregulv: 0.8 vs SK 0.25-0.42 (med sliping: ~0.55)

3. **Dorer er systematisk underestimert**:
   - Innerdor: 2.5 vs SK 4.81 (-48%)
   - Skyvedor: 4.5 vs Svenn 7.88 (-43%)

4. **Platekledning (gips, panel) er noe overestimert** (~20-30%):
   - Gips vegg: 0.45 vs SK/Svenn ~0.33
   - Panel vegg: 0.9 vs SK/Svenn ~0.65-0.68
   - Himling: 0.8 vs SK/Svenn ~0.51-0.62

5. **Dragere er sterkt overestimert**: 3.0 vs SK 1.35 (+122%)

6. **Levegg og rekkverk er noe underestimert** basert pa Svenn-data.

### Verdier som er bekreftet korrekte
- Vindu: 4.0 (SK trevegg 2.76-4.09, midt i ovre sjikt)
- Ytterdor: 4.5 (SK 4.32 trevegg)
- Gulvlister: 0.10 (SK 0.09)
- Gerikter: 0.10 (SK 0.10)
- Reisverk: 0.9 (mellom komponent og komplett)
- Terrasse: 2.5 (komplett m/underkonstruksjon)
- Takjobb: 1.8 (sammensatt rimelig)
