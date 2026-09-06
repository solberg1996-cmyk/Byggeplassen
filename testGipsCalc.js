// Tester for materialCalc.js sin Gips-kalkulator (matCalcDefs.gips)
// UX-forenklet (samme mønster som Kledning/Rekkverk/Vindu-dør): kompakt
// primærresultat (plater/festemidler/tape/sparkel — BESTILLINGSMENGDER, ikke
// geometrisk/netto) + detaljer bak "Vis beregningsdetaljer". Beregningsmotoren
// er uendret — kun hvordan resultatet presenteres.
// Kjør: node testGipsCalc.js

eval(require('fs').readFileSync('materialCalc.js', 'utf8'));

function run(v) {
  return matCalcDefs.gips.calc(v);
}

function byLabel(results, label) {
  var hit = (results || []).filter(function(r) { return r.label === label; })[0];
  return hit ? hit.value : undefined;
}

function hasText(results, text) {
  return (results || []).some(function(r) { return r.text === text; });
}

function base(extra) {
  return Object.assign({
    jobb: 'vegg', flatebredde: 4.8, flatehoyde: 2.4, orientering: 'staaende',
    plateformat: '1200x2400', platebredde: 1.2, platelengde: 2.4,
    tykkelse: '12.5', platetype: 'standard', lag: '1', apningerM2: 0,
    underlag: 'tre', festetetthetHoved: 20, festetetthetIndre: 6,
    skruelengdeLag1: 25, skruelengdeLag2: 41,
    svinnPlater: 10, svinnFestemidler: 5, tapeTillegg: 20, sparkelKgPerLmTape: 0.3
  }, extra);
}

var CASES = [
  // 1. 4,8x2,4m vegg med 1200x2400 stående plater — full eksempelverifisering
  {
    name: '1. 4,8×2,4m vegg, 1200×2400 stående → bestillingsmengder i hovedresultatet',
    input: base({}),
    expectedText: [
      '5 gipsplater',
      'ca. 242 festemidler',
      '8.7 lm papirremse/tape',
      '2.6 kg sparkel',
      '1200 × 2400 mm · Standard · 12.5 mm · inkl. 10% svinn'
    ],
    expected: {
      'Flate (4.8 × 2.4 m)': 11.52,
      'Gipsplater — geometrisk (4 kolonner × 1 rader × 1 lag)': 4,
      'Festemidler — geometrisk behov — Gipsskrue for tre, 25 mm': 231 // ceil(11,52×20=230,4), IKKE 230
    }
  },
  // 3. Vegghøyde høyere enn valgt platelengde → 2 rader
  {
    name: '3. Vegghøyde 2,8m > platelengde 2,4m → 2 rader, 9 plater i hovedresultatet',
    input: base({ flatehoyde: 2.8 }),
    expectedText: ['9 gipsplater'],
    expected: { 'Gipsplater — geometrisk (4 kolonner × 2 rader × 1 lag)': 8 }
  },
  // 4a/4b. Stående vs. liggende plateorientering bytter kolonner/rader
  {
    name: '4a. Stående orientering (4,8×2,4m)',
    input: base({ orientering: 'staaende' }),
    expected: { 'Gipsplater — geometrisk (4 kolonner × 1 rader × 1 lag)': 4 }
  },
  {
    name: '4b. Liggende orientering (samme vegg) → kolonner/rader byttes, samme platetall',
    input: base({ orientering: 'liggende' }),
    expected: { 'Gipsplater — geometrisk (2 kolonner × 2 rader × 1 lag)': 4 }
  },
  // 5. Ett lag → ett samlet festemiddeltall i hovedresultatet
  {
    name: '5. Ett lag → ett festemiddeltall',
    input: base({ lag: '1' }),
    expectedText: ['ca. 242 festemidler'],
    expected: { 'Festemidler — geometrisk behov — Gipsskrue for tre, 25 mm': 231 },
    expectMissing: ['Festemidler lag 1 (indre) — geometrisk behov — Gipsskrue for tre, 25 mm']
  },
  // 6. To lag → TO forskjellige festemiddellinjer i hovedresultatet (ulik skruelengde = ulik vare)
  {
    name: '6. To lag → separate skruelinjer i hovedresultatet, ikke ett summert tall',
    input: base({ lag: '2' }),
    expectedText: ['9 gipsplater', 'ca. 73 skruer — lag 1 (indre)', 'ca. 242 skruer — lag 2 (ytterste)'],
    expected: {
      'Gipsplater — geometrisk (4 kolonner × 1 rader × 2 lag)': 8,
      'Festemidler lag 1 (indre) — geometrisk behov — Gipsskrue for tre, 25 mm': 70,
      'Festemidler lag 1 (indre) — bestilling inkl. tillegg': 73, // ceil(69,12×1,05)
      'Festemidler lag 2 (ytterste) — geometrisk behov — Gipsskrue for tre, 41 mm': 231,
      'Festemidler lag 2 (ytterste) — bestilling inkl. tillegg': 242, // ceil(230,4×1,05)
      'Festemidler totalt (begge lag, bestilling)': 315
    }
  },
  // 7. Treunderlag → "Gipsskrue for tre"
  {
    name: '7. Treunderlag gir riktig skruetype',
    input: base({ underlag: 'tre' }),
    expected: { 'Festemidler — geometrisk behov — Gipsskrue for tre, 25 mm': 231 }
  },
  // 8. Stålunderlag → "Gipsskrue for stål" (IKKE antatt borspiss-type uten videre)
  {
    name: '8. Stålunderlag gir riktig skruetype',
    input: base({ underlag: 'staal' }),
    expected: { 'Festemidler — geometrisk behov — Gipsskrue for stål, 25 mm': 231 },
    expectMissing: ['Festemidler — geometrisk behov — Gipsskrue for tre, 25 mm']
  },
  // 9. Vegg vs. himling (tak) — ulike feltnavn, samme geometri-prinsipp
  {
    name: '9. Himling (tak) 4,8×3,6m, 1200×2400 stående',
    input: base({ jobb: 'tak', flatebredde: 4.8, flatehoyde: 3.6, festetetthetHoved: 25 }),
    expectedText: ['9 gipsplater'],
    expected: {
      'Himlingsflate (4.8 × 3.6 m)': 17.28,
      'Gipsplater — geometrisk (4 kolonner × 2 rader × 1 lag)': 8
    }
  },
  // 10. Netto (geometrisk) plater vs. bestillingsmengde med svinn — geometrisk ligger
  // fortsatt i detaljene, bestilling er det som vises fremtredende i hovedresultatet
  {
    name: '10. Geometrisk platetall (detalj) og bestilling (hovedresultat) er ulike tall',
    input: base({}),
    expectedText: ['5 gipsplater'],
    expected: { 'Gipsplater — geometrisk (4 kolonner × 1 rader × 1 lag)': 4 }
  },
  // 11. Endret plateformat via egendefinerte platebredde/-lengde (ikke avhengig av presetliste)
  {
    name: '11. Egendefinert plateformat (0,9 × 3,0 m) uavhengig av forhåndsvalg',
    input: base({ platebredde: 0.9, platelengde: 3.0 }),
    expected: {
      'Gipsplater — geometrisk (6 kolonner × 1 rader × 1 lag)': 6,
      'Plateformat': '900 × 3000 mm, 12.5 mm'
    }
  },
  // 12. Ugyldige dimensjoner
  { name: '12a. Ugyldig: veggbredde=0', input: base({ flatebredde: 0 }), expected: null },
  { name: '12b. Ugyldig: platebredde=0', input: base({ platebredde: 0 }), expected: null },
  { name: '12c. Ugyldig: vegghøyde=0', input: base({ flatehoyde: 0 }), expected: null }
];

var ok = 0;
var fail = 0;

CASES.forEach(function(c) {
  if (c.skip) return;
  var res = run(c.input);

  if (c.expected === null) {
    if (res === null) {
      console.log('✓ ' + c.name);
      ok++;
    } else {
      console.log('✗ ' + c.name + ' — forventet null, fikk ' + JSON.stringify(res));
      fail++;
    }
    return;
  }

  var errors = [];
  Object.keys(c.expected || {}).forEach(function(label) {
    var exp = c.expected[label];
    var got = byLabel(res, label);
    if (exp !== got) {
      errors.push('  "' + label + '": forventet ' + JSON.stringify(exp) + ', fikk ' + JSON.stringify(got));
    }
  });
  (c.expectedText || []).forEach(function(text) {
    if (!hasText(res, text)) {
      errors.push('  Forventet primær-/sekundærtekst "' + text + '" ble ikke funnet');
    }
  });
  (c.expectMissing || []).forEach(function(label) {
    var hit = (res || []).some(function(r) { return r.label === label; });
    if (hit) {
      errors.push('  Forventet at "' + label + '" IKKE skulle finnes, men den gjorde det');
    }
  });

  if (errors.length === 0) {
    console.log('✓ ' + c.name);
    ok++;
  } else {
    console.log('✗ ' + c.name);
    errors.forEach(function(e) { console.log(e); });
    fail++;
  }
});

// Case 2 (egen sjekk, sammenligner to kjøringer direkte i stedet for faste tall)
(function testPlateformatChangesRowCount() {
  var name = '2. Samme vegg (2,5m høy): 1200×2400 gir flere rader enn 1200×2700';
  var med2400 = run(base({ flatehoyde: 2.5, plateformat: '1200x2400', platebredde: 1.2, platelengde: 2.4 }));
  var med2700 = run(base({ flatehoyde: 2.5, plateformat: '1200x2700', platebredde: 1.2, platelengde: 2.7 }));
  var plater2400 = byLabel(med2400, 'Gipsplater — geometrisk (4 kolonner × 2 rader × 1 lag)');
  var plater2700 = byLabel(med2700, 'Gipsplater — geometrisk (4 kolonner × 1 rader × 1 lag)');
  if (plater2400 === 8 && plater2700 === 4) {
    console.log('✓ ' + name);
    ok++;
  } else {
    console.log('✗ ' + name + ' — fikk ' + plater2400 + ' / ' + plater2700);
    fail++;
  }
})();

// ── Skrue-oppslagstabell (GIPS_SKRUE_TABELL / gipsSkruePreset) ─────────────
// Ren funksjonstest, ingen DOM nødvendig.
(function testGipsSkruePreset() {
  var presetCases = [
    { name: '13a. 12,5mm standard, tre, 1 lag → 32mm', args: ['standard', '12.5', 'tre', 1, 1], expected: 32 },
    { name: '13b. 12,5mm standard, stål, 1 lag → 25mm', args: ['standard', '12.5', 'staal', 1, 1], expected: 25 },
    { name: '13c. 12,5mm standard, tre, 2 lag — lag 1 → 32mm', args: ['standard', '12.5', 'tre', 1, 2], expected: 32 },
    { name: '13d. 12,5mm standard, tre, 2 lag — lag 2 → 41mm', args: ['standard', '12.5', 'tre', 2, 2], expected: 41 },
    { name: '13e. 12,5mm standard, stål, 2 lag — lag 1 → 25mm', args: ['standard', '12.5', 'staal', 1, 2], expected: 25 },
    { name: '13f. 12,5mm standard, stål, 2 lag — lag 2 → 38mm', args: ['standard', '12.5', 'staal', 2, 2], expected: 38 },
    { name: '13g. Ukjent kombinasjon (brannplate 9,5mm) → ingen gjettet verdi (null)', args: ['brann', '9.5', 'tre', 1, 1], expected: null },
    { name: '13h. Ukjent kombinasjon (standard 9,5mm, ikke i tabellen) → null', args: ['standard', '9.5', 'tre', 1, 1], expected: null },
    { name: '13m. 15mm standard, tre, 1 lag → 41mm (Gyproc Protect F, IKKE 32mm arvet fra 12,5mm)', args: ['standard', '15', 'tre', 1, 1], expected: 41 },
    { name: '13n. 15mm standard, tre, 2 lag — lag 2 → null (ikke verifisert, ikke gjettet)', args: ['standard', '15', 'tre', 2, 2], expected: null },
    { name: '13o. 15mm standard, stål → null (ingen kilde funnet for denne kombinasjonen)', args: ['standard', '15', 'staal', 1, 1], expected: null }
  ];
  presetCases.forEach(function(c) {
    var got = gipsSkruePreset.apply(null, c.args);
    if (got === c.expected) {
      console.log('✓ ' + c.name);
      ok++;
    } else {
      console.log('✗ ' + c.name + ' — forventet ' + c.expected + ', fikk ' + got);
      fail++;
    }
  });
})();

// ── calc() viser kontrollhenvisning i stedet for å gjette når skruelengde mangler ──
(function testUkjentPresetIKalkulasjon() {
  var name = '13i. Ukjent skruekombinasjon i calc() → kontrollhenvisning, ikke oppdiktet lengde';
  var res = run(base({ tykkelse: '9.5', platetype: 'brann', skruelengdeLag1: '', skruelengdeLag2: '' }));
  var hit = (res || []).filter(function(r) { return r.label && r.label.indexOf('Festemidler —') === 0; })[0];
  if (hit && hit.label.indexOf('kontroller produsentens skrueanvisning') >= 0) {
    console.log('✓ ' + name);
    ok++;
  } else {
    console.log('✗ ' + name + ' — fikk ' + JSON.stringify(hit));
    fail++;
  }
})();

// ── onGipsSkrueRelevantChange() — DOM-mock, samme mønster som Terrasse sin onFesteChange-test ──
(function testOnGipsSkrueRelevantChange() {
  var fakeEls = {
    mc_tykkelse: { value: '12.5' },
    mc_platetype: { value: 'standard' },
    mc_underlag: { value: 'tre' },
    mc_lag: { value: '1' },
    mc_skruelengdeLag1: { value: '' },
    mc_skruelengdeLag2: { value: '' }
  };
  global.document = { getElementById: function(id) { return fakeEls[id]; } };
  global.$ = function() { return null; };
  _matCalcCurrent = 'gips';

  var errors = [];

  // 14a. Tre, 1 lag → lag1 fylles med 32
  onGipsSkrueRelevantChange();
  if (Number(fakeEls.mc_skruelengdeLag1.value) !== 32) {
    errors.push('  14a: forventet lag1=32 (tre, 1 lag), fikk ' + fakeEls.mc_skruelengdeLag1.value);
  }

  // 14b. Bytte til Stål oppdaterer presetet automatisk
  fakeEls.mc_underlag.value = 'staal';
  onGipsSkrueRelevantChange();
  if (Number(fakeEls.mc_skruelengdeLag1.value) !== 25) {
    errors.push('  14b: forventet lag1=25 etter bytte til stål, fikk ' + fakeEls.mc_skruelengdeLag1.value);
  }

  // 14c. Brukeren overstyrer manuelt etterpå — verdien skal IKKE overskrives
  // med mindre en av trigger-feltene faktisk endres på nytt.
  fakeEls.mc_skruelengdeLag1.value = '99';
  if (Number(fakeEls.mc_skruelengdeLag1.value) !== 99) {
    errors.push('  14c: manuell overstyring ble ikke beholdt');
  }

  // 14d. To lag, tre → lag1=32, lag2=41
  fakeEls.mc_underlag.value = 'tre';
  fakeEls.mc_lag.value = '2';
  onGipsSkrueRelevantChange();
  if (Number(fakeEls.mc_skruelengdeLag1.value) !== 32 || Number(fakeEls.mc_skruelengdeLag2.value) !== 41) {
    errors.push('  14d: forventet lag1=32/lag2=41 (tre, 2 lag), fikk ' + fakeEls.mc_skruelengdeLag1.value + '/' + fakeEls.mc_skruelengdeLag2.value);
  }

  // 14e. Ukjent kombinasjon tømmer feltet i stedet for å beholde forrige tall
  fakeEls.mc_tykkelse.value = '9.5';
  fakeEls.mc_platetype.value = 'brann';
  onGipsSkrueRelevantChange();
  if (fakeEls.mc_skruelengdeLag1.value !== '') {
    errors.push('  14e: forventet tomt felt for ukjent kombinasjon, fikk ' + fakeEls.mc_skruelengdeLag1.value);
  }

  var name = '14. onGipsSkrueRelevantChange() — auto-preset, bytte Tre↔Stål, overstyring, ukjent kombinasjon';
  if (errors.length === 0) {
    console.log('✓ ' + name);
    ok++;
  } else {
    console.log('✗ ' + name);
    errors.forEach(function(e) { console.log(e); });
    fail++;
  }
})();

// ── Conditional visibility: festetetthetIndre/skruelengdeLag2/tapeInnerste
// skal kun være synlige under «Flere valg» når lag=2 er valgt ──────────────
(function testGipsLagFeltSynlighet() {
  var name = '15. Lag-avhengig synlighet: festetetthetIndre/skruelengdeLag2/tapeInnerste skjules ved 1 lag, vises ved 2 lag';
  var fakeWraps = {
    mcfield_festetetthetIndre: { style: {} },
    mcfield_skruelengdeLag2: { style: {} },
    mcfield_tapeInnerste: { style: {} }
  };
  var fakeEls = { mc_lag: { value: '1' } };
  global.document = {
    getElementById: function(id) {
      if (fakeEls[id]) return fakeEls[id];
      if (fakeWraps[id]) return fakeWraps[id];
      return undefined;
    }
  };
  global.$ = function() { return null; };
  _matCalcCurrent = 'gips';

  var errors = [];

  fakeEls.mc_lag.value = '1';
  updateGipsLagFeltSynlighet();
  ['mcfield_festetetthetIndre', 'mcfield_skruelengdeLag2', 'mcfield_tapeInnerste'].forEach(function(id) {
    if (fakeWraps[id].style.display !== 'none') {
      errors.push('  Forventet ' + id + ' skjult ved 1 lag, fikk display="' + fakeWraps[id].style.display + '"');
    }
  });

  fakeEls.mc_lag.value = '2';
  updateGipsLagFeltSynlighet();
  ['mcfield_festetetthetIndre', 'mcfield_skruelengdeLag2', 'mcfield_tapeInnerste'].forEach(function(id) {
    if (fakeWraps[id].style.display === 'none') {
      errors.push('  Forventet ' + id + ' synlig ved 2 lag, fikk display="' + fakeWraps[id].style.display + '"');
    }
  });

  if (errors.length === 0) {
    console.log('✓ ' + name);
    ok++;
  } else {
    console.log('✗ ' + name);
    errors.forEach(function(e) { console.log(e); });
    fail++;
  }
})();

console.log('\n' + ok + ' OK, ' + fail + ' FEIL');
process.exit(fail > 0 ? 1 : 0);
