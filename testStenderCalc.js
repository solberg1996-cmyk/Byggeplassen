// Tester for materialCalc.js sin Stender-kalkulator (matCalcDefs.stender)
// UX-forenklet (samme mønster som Gips/Gulv/Terrasse/Tak): kompakt
// primærresultat (bestillingsmengder) + detaljer bak "Vis beregningsdetaljer".
// Ny i denne runden: svinn/kapp på svill (var 0% før — reelt hull, nå 5%
// default), strukturert STENDER_DIM_OPTIONS (ikke lenger parset fra
// "value"-strengen). Stenderlengde-formelen (vegghøyde − svilltykkelser) og
// stender-geometrien (ceil(L/cc)+1) er UENDRET.
// Kjør: node testStenderCalc.js

eval(require('fs').readFileSync('materialCalc.js', 'utf8'));

function run(v) {
  return matCalcDefs.stender.calc(v);
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
    veggLengde: 6, veggHoyde: 2.4, dim: '48x148', cc: '600',
    toppsvill: 'enkel', bunnsvillBehandling: 'ubehandlet', toppsvillBehandling: 'ubehandlet',
    ekstra: 0, svillCC: '400', svinnSvill: 5
  }, extra);
}

var CASES = [
  // 1. Standardcase — kompakt primærresultat med bestillingsmengder, ikke geometri
  {
    name: '1. Standardcase 6m/2,4m, 48x148, enkel toppsvill → primærresultat',
    input: base({}),
    expectedText: [
      '11 stendere à 2.304 m',
      '6.4 lm bunnsvill (ubehandlet)',
      '6.4 lm enkel toppsvill (ubehandlet)',
      'ca. 44 festemidler (stender)',
      '48 × 148 mm · c/c 600 mm · enkel toppsvill · inkl. 5% svinn'
    ],
    expected: { 'Stendere løpemeter': 25.3, 'Bunnsvill — netto': 6, 'Toppsvill — netto': 6 }
  },
  // 2. Vegghøyde → korrekt stenderlengde (2400mm − 48mm bunnsvill − 48mm enkel toppsvill = 2304mm)
  {
    name: '2. Vegghøyde 2400mm, 48mm virke, enkel toppsvill → stenderlengde 2304mm',
    input: base({}),
    expectedText: ['11 stendere à 2.304 m']
  },
  // 3. Dobbel toppsvill — brukerens eget referanseeksempel: 2400 − 48×3 = 2256mm
  {
    name: '3. Vegghøyde 2400mm, 48mm virke, dobbel toppsvill → stenderlengde 2256mm (referanseeksempel)',
    input: base({ toppsvill: 'dobbel' }),
    expectedText: ['11 stendere à 2.256 m', '12.7 lm dobbel toppsvill (ubehandlet)'],
    expected: { 'Toppsvill — netto': 12 } // dobbelt av bunnsvill, FØR svinn
  },
  // 4. 36mm virke skal gi et annet (mindre) fratrekk enn 48mm
  {
    name: '4a. 36mm virke, enkel toppsvill → fratrekk 2×36mm → 2328mm',
    input: base({ dim: '36x148' }),
    expectedText: ['11 stendere à 2.328 m']
  },
  {
    name: '4b. 36mm virke, dobbel toppsvill → fratrekk 3×36mm → 2292mm',
    input: base({ dim: '36x148', toppsvill: 'dobbel' }),
    expectedText: ['11 stendere à 2.292 m']
  },
  // 5. Forskjellige c/c gir forskjellig stenderantall — se egen sammenligningstest (5b) nedenfor
  // 6. Vegglengde som går NØYAKTIG opp i c/c (6m / c/c 600mm = eksakt 10 intervaller)
  {
    name: '6. Vegglengde 6m går eksakt opp i c/c 600mm → 11 stendere (10 intervaller + 1)',
    input: base({ veggLengde: 6, cc: '600' }),
    expectedText: ['11 stendere à 2.304 m']
  },
  // 7. Vegglengde som IKKE går opp i c/c — siste stender trekkes inn, ikke overskyter veggen
  {
    name: '7. Vegglengde 5,3m (ikke eksakt mot c/c 600mm) → 10 stendere, ikke 11',
    input: base({ veggLengde: 5.3, cc: '600', svillCC: '600' }),
    expectedText: ['10 stendere à 2.304 m'],
    expected: { 'Bunnsvill — netto': 5.3, 'Toppsvill — netto': 5.3 }
  },
  // 8. Svillfeste 6m / c/c 400 skal telle BÅDE intervaller og endepunkt (+1), ikke bare intervaller
  {
    name: '8. Svillfeste 6m / c/c 400 → 16 festepunkter (ikke 15)',
    input: base({}),
    expected: {
      'Bunnsvillfeste — antall festepunkter': 16, // ceil(6000/400)+1 = 15+1
      'Toppsvillfeste — antall festepunkter': 16
    }
  },
  // 9. Svinn på svill — ny i denne runden. 0% skal gi netto = bestilling; 5% skal gi mer
  {
    name: '9a. 0% svinn på svill → bestilling lik netto (6 lm)',
    input: base({ svinnSvill: 0 }),
    expectedText: ['6 lm bunnsvill (ubehandlet)', '6 lm enkel toppsvill (ubehandlet)'],
    expected: { 'Bunnsvill — netto': 6 }
  },
  {
    name: '9b. 5% svinn på svill → bestilling 6,4 lm (6×1,05=6,3 → ceil1 = 6,3... faktisk 6,4 grunnet avrunding oppover)',
    input: base({ svinnSvill: 5 }),
    expectedText: ['6.4 lm bunnsvill (ubehandlet)']
  },
  {
    name: '9c. Svinn påvirker IKKE stenderantall eller stenderlengde (kun svill er kontinuerlig materiale)',
    input: base({ svinnSvill: 20 }),
    expectedText: ['11 stendere à 2.304 m']
  },
  // 10. Udelelige enheter (stendere, festemidler, festepunkter) er alltid hele tall — se egen test (10b) nedenfor
  // 11. Ugyldige mål
  { name: '11a. Ugyldig: vegghøyde=0', input: base({ veggHoyde: 0 }), expected: null },
  { name: '11b. Ugyldig: negativ vegghøyde', input: base({ veggHoyde: -1 }), expected: null },
  { name: '11c. Ugyldig: vegghøyde mindre enn svilltykkelsen', input: base({ veggHoyde: 0.05 }), expected: null },
  { name: '11d. Ugyldig: vegglengde=0', input: base({ veggLengde: 0 }), expected: null },
  // 11e/11f. Valideringen må stoppe også ved dobbel toppsvill (tre svill-lag, ikke to)
  { name: '11e. Ugyldig ved dobbel toppsvill: nøyaktig 0mm stenderlengde (144mm=144mm)', input: base({ toppsvill: 'dobbel', veggHoyde: 0.144 }), expected: null },
  { name: '11f. Gyldig ved dobbel toppsvill rett over grensen (145mm)', input: base({ toppsvill: 'dobbel', veggHoyde: 0.145 }), expectedText: ['11 stendere à 0.001 m'] },
  // 12. Blank vegghøyde faller tilbake til 2,4m (dokumentert, reell bransjestandard — IKKE endret i denne runden)
  {
    name: '12. Blank vegghøyde (tom streng) faller tilbake til 2,4m standard reisverkshøyde',
    input: base({ veggHoyde: '' }),
    expectedText: ['11 stendere à 2.304 m']
  }
];

var ok = 0;
var fail = 0;

CASES.forEach(function(c) {
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

  if (errors.length === 0) {
    console.log('✓ ' + c.name);
    ok++;
  } else {
    console.log('✗ ' + c.name);
    errors.forEach(function(e) { console.log(e); });
    fail++;
  }
});

// 5b. c/c 300mm gir flere stendere enn c/c 600mm (direkte sammenligning, ikke faste tall)
(function testCcSammenligning() {
  var name = '5b. c/c 300mm gir flere stendere enn c/c 600mm (samme vegg)';
  var resCc300 = run(base({ cc: '300' }));
  var resCc600 = run(base({ cc: '600' }));
  var hentAntall = function(res) {
    var hit = (res || []).filter(function(r) { return r.primary && /^\d+ stendere/.test(r.text); })[0];
    return hit ? parseInt(hit.text, 10) : undefined;
  };
  var antall300 = hentAntall(resCc300);
  var antall600 = hentAntall(resCc600);
  if (antall300 > antall600) {
    console.log('✓ ' + name + ' (' + antall300 + ' vs. ' + antall600 + ')');
    ok++;
  } else {
    console.log('✗ ' + name + ' — fikk ' + antall300 + ' (c/c 300) vs. ' + antall600 + ' (c/c 600)');
    fail++;
  }
})();

// 10b. Udelelige enheter er alltid hele tall
(function testHeleTall() {
  var name = '10b. Festemidler, stenderantall og festepunkter er alltid hele tall';
  var res = run(base({ veggLengde: 5.37, svillCC: '300' }));
  var antStendereText = (res || []).filter(function(r) { return r.primary && /^\d+ stendere/.test(r.text); })[0];
  var antFesteText = (res || []).filter(function(r) { return r.primary && r.text.indexOf('festemidler (stender)') >= 0; })[0];
  var errors = [];
  if (!antStendereText || !Number.isInteger(parseFloat(antStendereText.text))) errors.push('  Stenderantall er ikke et helt tall: ' + JSON.stringify(antStendereText));
  var festeVerdi = antFesteText ? parseInt(antFesteText.text.replace(/[^\d]/g, ''), 10) : NaN;
  if (!Number.isInteger(festeVerdi)) errors.push('  Festemiddeltall er ikke et helt tall: ' + JSON.stringify(antFesteText));
  var bunnsvillfeste = byLabel(res, 'Bunnsvillfeste — antall festepunkter');
  if (!Number.isInteger(bunnsvillfeste)) errors.push('  Bunnsvillfeste er ikke et helt tall: ' + bunnsvillfeste);

  if (errors.length === 0) {
    console.log('✓ ' + name);
    ok++;
  } else {
    console.log('✗ ' + name);
    errors.forEach(function(e) { console.log(e); });
    fail++;
  }
})();

// 13. compact-result: bestillingsmengde (inkl. svinn) vises som primær, netto/geometri kun i detaljene
(function testCompactResultStruktur() {
  var name = '13. Compact-result: bestilling er primær, netto/geometri ligger i detaljene';
  var res = run(base({ svinnSvill: 10 }));
  var errors = [];
  var primaryTexts = (res || []).filter(function(r) { return r.primary; }).map(function(r) { return r.text; });
  var detailLabels = (res || []).filter(function(r) { return !r.primary && !r.secondary; }).map(function(r) { return r.label; });

  if (!primaryTexts.some(function(t) { return t.indexOf('lm bunnsvill') >= 0; })) {
    errors.push('  Forventet bunnsvill-bestilling som primærresultat');
  }
  if (detailLabels.indexOf('Bunnsvill — netto') === -1) {
    errors.push('  Forventet "Bunnsvill — netto" i detaljene, ikke i hovedresultatet');
  }
  if (detailLabels.indexOf('Stendere løpemeter') === -1) {
    errors.push('  Forventet "Stendere løpemeter" (ren mellomregning) i detaljene');
  }
  // Bestilling skal faktisk avvike fra netto når svinn > 0 (ellers testes ikke reell inkl.-svinn-logikk)
  var bunnsvillNetto = byLabel(res, 'Bunnsvill — netto');
  var bunnsvillPrimaryMatch = primaryTexts.filter(function(t) { return t.indexOf('lm bunnsvill') >= 0; })[0];
  var bunnsvillBestillingVerdi = bunnsvillPrimaryMatch ? parseFloat(bunnsvillPrimaryMatch) : NaN;
  if (!(bunnsvillBestillingVerdi > bunnsvillNetto)) {
    errors.push('  Forventet at bestilling (' + bunnsvillBestillingVerdi + ') > netto (' + bunnsvillNetto + ') ved 10% svinn');
  }

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
