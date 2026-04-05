// ── Testcases for gavlstender-kalkulator ────────────────────────
// Kjør: npx tsx testGavlStenderCalc.ts
//   eller: npx ts-node testGavlStenderCalc.ts

import { beregnGavlStendere, pitchTilVinkel, vinkelTilPitch } from './gavlStenderCalc';

interface TestCase {
  navn: string;
  input: Parameters<typeof beregnGavlStendere>[0];
  forventet: {
    gyldig: boolean;
    stenderLengder?: number[];       // langside-lengder (avrundet mm)
    runLevels?: number[];
    oekningPerSenter?: number;
    toppkuttVinkel?: number;
  };
}

// ── Matematiske tester (ren trigonometri) ───────────────────────

const MATH_CASES: TestCase[] = [
  {
    navn: '30° enkel, 600cc, 3 stendere — grunncase',
    input: {
      angleDeg: 30,
      startHeight: 2400,
      plateThickness: 48,
      topPlateCount: 1,
      spacing: 600,
      studThickness: 48,
      studCount: 3,
      startMode: 'single',
      measurePoint: 'centre',
      alignSheets: false,
    },
    // tan(30°) = 0.57735
    // topPlateTotal = 48
    // firstRun = 600 (single, no align)
    // stender 1: 2400 + 600*0.57735 - 48 = 2698.4 → 2698
    // stender 2: 2400 + 1200*0.57735 - 48 = 3044.8 → 3045
    // stender 3: 2400 + 1800*0.57735 - 48 = 3391.2 → 3391
    // økning: 600 * 0.57735 = 346.4
    forventet: {
      gyldig: true,
      stenderLengder: [2698, 3045, 3391],
      runLevels: [600, 1200, 1800],
      oekningPerSenter: 346.4,
      toppkuttVinkel: 30,
    },
  },

  {
    navn: '45° — slope=1.0, enkel kontroll',
    input: {
      angleDeg: 45,
      startHeight: 2400,
      plateThickness: 36,
      topPlateCount: 2,
      spacing: 600,
      studThickness: 36,
      studCount: 2,
      startMode: 'single',
      measurePoint: 'near',
      alignSheets: false,
    },
    // tan(45°) = 1.0
    // topPlateTotal = 72
    // stender 1: 2400 + 600*1.0 - 72 = 2928
    // stender 2: 2400 + 1200*1.0 - 72 = 3528
    forventet: {
      gyldig: true,
      stenderLengder: [2928, 3528],
      oekningPerSenter: 600,
    },
  },

  {
    navn: '22.5° — vanlig norsk tak',
    input: {
      angleDeg: 22.5,
      startHeight: 2400,
      plateThickness: 48,
      topPlateCount: 1,
      spacing: 600,
      studThickness: 48,
      studCount: 4,
      startMode: 'single',
      measurePoint: 'centre',
      alignSheets: false,
    },
    // tan(22.5°) = 0.41421
    // stender 1: 2400 + 600*0.41421 - 48 = 2600.5 → 2601
    // stender 2: 2400 + 1200*0.41421 - 48 = 2849.1 → 2849
    // stender 3: 2400 + 1800*0.41421 - 48 = 3097.6 → 3098
    // stender 4: 2400 + 2400*0.41421 - 48 = 3346.1 → 3346
    // økning: 600 * 0.41421 = 248.5
    forventet: {
      gyldig: true,
      stenderLengder: [2601, 2849, 3098, 3346],
      oekningPerSenter: 248.5,
    },
  },
];

// ── Mark-out tester ─────────────────────────────────────────────

const MARKOUT_CASES: TestCase[] = [
  {
    navn: 'Mark-out: near vs centre vs far påvirker IKKE lengde',
    input: {
      angleDeg: 30,
      startHeight: 2400,
      plateThickness: 48,
      topPlateCount: 1,
      spacing: 600,
      studThickness: 48,
      studCount: 1,
      startMode: 'single',
      measurePoint: 'near', // endres i testen
      alignSheets: false,
    },
    // Alle tre measurePoints skal gi SAMME stenderlengde
    forventet: {
      gyldig: true,
      stenderLengder: [2698],
    },
  },
];

// ── Edge case tester ────────────────────────────────────────────

const EDGE_CASES: TestCase[] = [
  {
    navn: 'Vinkel 0° → ugyldig',
    input: { angleDeg: 0, startHeight: 2400 },
    forventet: { gyldig: false },
  },
  {
    navn: 'Vinkel 90° → ugyldig',
    input: { angleDeg: 90, startHeight: 2400 },
    forventet: { gyldig: false },
  },
  {
    navn: 'Negativ vinkel → ugyldig',
    input: { angleDeg: -15, startHeight: 2400 },
    forventet: { gyldig: false },
  },
  {
    navn: 'startHeight < topPlateTotal → ugyldig',
    input: { angleDeg: 30, startHeight: 40, plateThickness: 48, topPlateCount: 1 },
    forventet: { gyldig: false },
  },
];

// ── Blocklayer-verifiseringstester ──────────────────────────────
// Disse er ment å fylles inn med faktiske verdier fra Blocklayer
// for å bekrefte/avkrefte hypotesene i seksjon D av spec.

const BLOCKLAYER_CASES: TestCase[] = [
  // TODO(thomas): Fyll inn verdier fra Blocklayer
  // Test 1: single + near, 30°, 600cc, 48mm stender
  //   → sammenlign stenderlengder og mark-out
  // Test 2: single + centre, ellers likt
  //   → bekrefter at lengde er lik, men runLevelMarked endres
  // Test 3: single + far, ellers likt
  //   → bekrefter near/centre/far-teori
  // Test 4: double + centre
  //   → avslører firstRun-offset for dobbel start
  // Test 5: alignSheets PÅ, single + centre
  //   → bekrefter alignSheets-offset
  // Test 6: 2 topplemmer vs 1
  //   → bekrefter topPlateTotal-formel
];

// ── Pitch-konvertering tester ───────────────────────────────────

function testPitchKonvertering(): { ok: number; fail: number } {
  let ok = 0;
  let fail = 0;

  const cases = [
    { pitch: 12, expectedAngle: 45 },
    { pitch: 6, expectedAngle: 26.6 },  // atan(6/12) = 26.565°
    { pitch: 4, expectedAngle: 18.4 },  // atan(4/12) = 18.435°
    { pitch: 0, expectedAngle: 0 },
  ];

  cases.forEach(c => {
    const angle = pitchTilVinkel(c.pitch);
    const rounded = Math.round(angle * 10) / 10;
    if (rounded === c.expectedAngle) {
      console.log(`  ✓ pitch ${c.pitch}:12 → ${rounded}°`);
      ok++;
    } else {
      console.log(`  ✗ pitch ${c.pitch}:12 → ${rounded}° (forventet ${c.expectedAngle}°)`);
      fail++;
    }
  });

  // Roundtrip
  const rt = vinkelTilPitch(pitchTilVinkel(7));
  if (Math.abs(rt - 7) < 0.001) {
    console.log(`  ✓ roundtrip pitch 7 → vinkel → pitch = ${rt.toFixed(3)}`);
    ok++;
  } else {
    console.log(`  ✗ roundtrip feilet: ${rt}`);
    fail++;
  }

  return { ok, fail };
}

// ── Testkjøring ─────────────────────────────────────────────────

function runTests(label: string, cases: TestCase[]): { ok: number; fail: number } {
  console.log(`\n── ${label} ──`);
  let ok = 0;
  let fail = 0;

  cases.forEach(c => {
    const res = beregnGavlStendere(c.input);
    const errors: string[] = [];

    if (res.gyldig !== c.forventet.gyldig) {
      errors.push(`  gyldig: forventet ${c.forventet.gyldig}, fikk ${res.gyldig}`);
    }

    if (res.gyldig && c.forventet.gyldig) {
      if (c.forventet.stenderLengder) {
        const faktisk = res.stendere.map(s => s.lengdeLangside);
        c.forventet.stenderLengder.forEach((exp, i) => {
          if (faktisk[i] !== exp) {
            errors.push(`  stender ${i + 1} lengde: forventet ${exp}, fikk ${faktisk[i]}`);
          }
        });
      }

      if (c.forventet.runLevels) {
        const faktisk = res.stendere.map(s => s.runLevel);
        c.forventet.runLevels.forEach((exp, i) => {
          if (faktisk[i] !== exp) {
            errors.push(`  stender ${i + 1} runLevel: forventet ${exp}, fikk ${faktisk[i]}`);
          }
        });
      }

      if (c.forventet.oekningPerSenter !== undefined) {
        if (res.oekningPerSenter !== c.forventet.oekningPerSenter) {
          errors.push(`  økning/cc: forventet ${c.forventet.oekningPerSenter}, fikk ${res.oekningPerSenter}`);
        }
      }

      if (c.forventet.toppkuttVinkel !== undefined) {
        if (res.toppkuttVinkel !== c.forventet.toppkuttVinkel) {
          errors.push(`  toppkutt: forventet ${c.forventet.toppkuttVinkel}, fikk ${res.toppkuttVinkel}`);
        }
      }
    }

    if (errors.length === 0) {
      console.log(`✓ ${c.navn}`);
      ok++;
    } else {
      console.log(`✗ ${c.navn}`);
      errors.forEach(e => console.log(e));
      fail++;
    }
  });

  return { ok, fail };
}

// ── Mark-out spesialtest ────────────────────────────────────────

function testMarkoutIkkeEndrerLengde(): { ok: number; fail: number } {
  console.log('\n── Mark-out påvirker ikke lengde ──');

  const base = {
    angleDeg: 30,
    startHeight: 2400,
    plateThickness: 48,
    topPlateCount: 1 as const,
    spacing: 600,
    studThickness: 48,
    studCount: 2,
    startMode: 'single' as const,
    alignSheets: false,
  };

  const near = beregnGavlStendere({ ...base, measurePoint: 'near' });
  const centre = beregnGavlStendere({ ...base, measurePoint: 'centre' });
  const far = beregnGavlStendere({ ...base, measurePoint: 'far' });

  let ok = 0;
  let fail = 0;

  if (!near.gyldig || !centre.gyldig || !far.gyldig) {
    console.log('✗ En av beregningene er ugyldig');
    return { ok: 0, fail: 1 };
  }

  // Lengder skal være identiske
  for (let i = 0; i < 2; i++) {
    const nL = near.stendere[i].lengdeLangside;
    const cL = centre.stendere[i].lengdeLangside;
    const fL = far.stendere[i].lengdeLangside;
    if (nL === cL && cL === fL) {
      console.log(`✓ Stender ${i + 1}: lengde ${nL} mm — lik for near/centre/far`);
      ok++;
    } else {
      console.log(`✗ Stender ${i + 1}: near=${nL}, centre=${cL}, far=${fL} — ULIKE!`);
      fail++;
    }
  }

  // Mark-out skal være ulike
  const n1 = near.stendere[0].runLevelMarked;
  const c1 = centre.stendere[0].runLevelMarked;
  const f1 = far.stendere[0].runLevelMarked;
  if (n1 < c1 && c1 < f1) {
    console.log(`✓ Mark-out offset: near=${n1}, centre=${c1}, far=${f1}`);
    ok++;
  } else {
    console.log(`✗ Mark-out offset uventet: near=${n1}, centre=${c1}, far=${f1}`);
    fail++;
  }

  return { ok, fail };
}

// ── Kjør alt ────────────────────────────────────────────────────

let totalOk = 0;
let totalFail = 0;

console.log('── Pitch-konvertering ──');
const pitchRes = testPitchKonvertering();
totalOk += pitchRes.ok;
totalFail += pitchRes.fail;

const groups: [string, TestCase[]][] = [
  ['Matematiske tester', MATH_CASES],
  ['Edge cases', EDGE_CASES],
];

groups.forEach(([label, cases]) => {
  const res = runTests(label, cases);
  totalOk += res.ok;
  totalFail += res.fail;
});

const markoutRes = testMarkoutIkkeEndrerLengde();
totalOk += markoutRes.ok;
totalFail += markoutRes.fail;

console.log(`\n════════════════════════`);
console.log(`${totalOk} OK, ${totalFail} FEIL`);
process.exit(totalFail > 0 ? 1 : 0);
