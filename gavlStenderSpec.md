# Gavlstender-kalkulator — Formelspesifikasjon

Alle lengder i mm, vinkler i grader.

---

## A. Geometri (bekreftet)

```
angleRad  = angleDeg × π / 180
slope     = tan(angleRad)

// Pitch ↔ vinkel:
angleDeg  = atan(rise / run) × 180 / π
pitch     = 12 × tan(angleRad)          // rise per 12" run (US-konvensjon)

topPlateTotal = plateThickness × topPlateCount
```

**Status: BEKREFTET** — standard trigonometri, stemmer med alle kilder.

---

## B. Stenderlengder (bekreftet)

Hovedformel for langside-lengde ved horisontal posisjon `runLevel`:

```
studLengthLongSide = startHeight + runLevel × slope - topPlateTotal
```

- `startHeight` = vegghøyde ved x=0 (inkludert bunnsvill, ekskludert topplem)
- `runLevel` = horisontal avstand fra referansepunkt til stendersenter
- `slope` = tan(angleRad) — høydeøkning per mm horisontalavstand
- `topPlateTotal` = samlet tykkelse på topplem(mer) som trekkes fra

Kortside-lengde (der topplemmen kutter stenderen kortere på den ene kanten):

```
studLengthShortSide = studLengthLongSide - studThickness × slope
```

**Status: BEKREFTET** — dette er ren trigonometri. `runLevel × slope` gir
høydeøkningen, `topPlateTotal` trekkes fra fordi stenderen stopper under
topplemmen.

### Viktig presisering

`measurePoint` (near/centre/far) påvirker IKKE stenderlengden.
Blocklayer viser "Stud Lengths Long Side @ Centres" — altså alltid
langside uansett mark-out-innstilling.

---

## C. Mark-out (bekreftet prinsipp, detaljer må verifiseres)

Mark-out = utstikningspunkter for å merke opp på bunnsvill/gulv.

### C.1 Horisontal posisjon (runLevel)

```
runLevel[0] = firstRun                          // avstand til første stender
runLevel[n] = firstRun + n × spacing            // påfølgende stendere
```

`firstRun` avhenger av startlogikk (se seksjon D).

### C.2 Merket posisjon til valgt side (runLevelMarked)

`measurePoint` bestemmer hvor på stenderen vi måler TIL:

```
runToOffset =
  near:    0
  centre:  studThickness / 2
  far:     studThickness

runLevelMarked[n] = runLevel[n] + runToOffset
```

### C.3 Langs vinkel (runAngleMarked)

Avstand målt langs underkant av skrå topplem (hypotenus):

```
runAngleMarked[n] = runLevelMarked[n] / cos(angleRad)
```

**Status: PRINSIPP BEKREFTET** — `1/cos` konverterer horisontal til
hypotenusavstand. Offset-logikken for near/centre/far er logisk men
bør verifiseres mot Blocklayer-output.

---

## D. Startlogikk (ARBEIDSHYPOTESER — må verifiseres)

### D.1 `startMode`

| Mode          | Hypotese for `firstRun`                     |
|---------------|---------------------------------------------|
| `single`      | `spacing`                                   |
| `double`      | `spacing + studThickness`                   |
| `doubleGap`   | `spacing + studThickness + gapWidth`        |

**Resonnement:** Dobbel stender ved start betyr at neste stender-cc
flyttes ut med bredden av den ekstra stenderen (+ evt. gap).

### D.2 `alignSheets`

```
// Hypotese:
firstRun = spacing - studThickness / 2
```

**Resonnement:** Platekant (1200mm gips/OSB) treffer midt på stender
når første cc er forskjøvet ½ stenderbredde innover.

### D.3 Kombinasjon alignSheets + startMode

Ukjent om disse kombineres additivt. Må testes.

**Status: ALT I SEKSJON D ER HYPOTESER** — logisk utledet men ikke
verifisert mot faktiske Blocklayer-outputs.

---

## E. Toppkutt

Stenderen kuttes med vinkel mot skrå topplem:

```
toppkuttVinkel = angleDeg     // vinkel fra loddrett
// eller: 90 - angleDeg fra horisontalt
```

**Status: BEKREFTET** — standard geometri.

---

## F. Edge cases

1. `angleDeg <= 0` eller `angleDeg >= 90` → ugyldig
2. `spacing <= 0` → ugyldig
3. `startHeight <= topPlateTotal` → stender har negativ lengde, ugyldig
4. `studCount < 1` → ugyldig
5. Vinkel nær 90° gir ekstreme lengder — advarsel ved >60°

---

## Verifiseringsplan

For å bekrefte hypotesene i seksjon D, test følgende mot Blocklayer:

| # | Test                                      | Hva vi lærer                    |
|---|-------------------------------------------|---------------------------------|
| 1 | single + near, 30°, 600cc, 48mm stender  | Baseline stenderlengder         |
| 2 | Endre til centre, alt annet likt          | Påvirker lengde eller kun mark-out? |
| 3 | Endre til far, alt annet likt             | Bekrefter near/centre/far-teori |
| 4 | double + centre, alt annet likt           | firstRun-offset for dobbel      |
| 5 | alignSheets PÅ, single + centre           | alignSheets offset              |
| 6 | 2 topplemmer vs 1                         | Bekrefter topPlateTotal-formel  |
