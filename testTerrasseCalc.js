// Tester for materialCalc.js sin Terrasse-kalkulator (matCalcDefs.terrasse)
// UX-forenklet (samme mønster som Gips/Gulv): kompakt primærresultat
// (terrassebord bestilling-lm, bjelkelag total-lm, festemidler) + detaljer
// bak "Vis beregningsdetaljer". Beregningsmotoren er uendret bortsett fra
// standard avstand mellom bord (fuge), som er endret fra 5 til 3 mm.
// Kjør: node testTerrasseCalc.js

eval(require('fs').readFileSync('materialCalc.js', 'utf8'));

function run(v) {
  return matCalcDefs.terrasse.calc(v);
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
    lengde: 5, bredde: 3, bordType: '28x120-impregnert', bordretning: 'lengde',
    fuge: 3, feste: 'synlig', perKryss: 2, festemiddelSvinn: 0, spesialklipsTillegg: 0,
    bjelkeCC: '600', bjelkeDim: '48x148', svinn: 10
  }, extra);
}

var CASES = [
  // 1. Synlig feste, uten festemiddelsvinn — geometrisk behov skal IKKE arve bordsvinnet
  {
    name: '1. Synlig feste, uten festemiddelsvinn (geometrisk behov) → kompakt primærresultat',
    input: base({}),
    expectedText: ['134.2 lm terrassebord', '30 lm bjelkelag (48x148)', 'ca. 500 terrasseskruer'],
    expected: {
      'Antall bord — geometrisk': 25,
      'Festemidler — geometrisk behov': 500
    }
  },
  // 2. Samme jobb, men med eget festemiddel-tillegg på 5 %
  {
    name: '2. Synlig feste, 5% eget festemiddeltillegg',
    input: base({ festemiddelSvinn: 5 }),
    expectedText: ['ca. 525 terrasseskruer'] // ceil(500*1.05)
  },
  // 3. Skjult feste, redigerbart 1/kryss + eget tillegg — ikke universell fasit
  {
    name: '3. Skjult feste, 1/kryss + 8% tillegg → primærresultat sier "hovedklips"',
    input: base({ feste: 'skjult', perKryss: 1, festemiddelSvinn: 8 }),
    expectedText: ['ca. 270 hovedklips'] // ceil(25*10*1 * 1.08) = ceil(270)
  },
  // 3b. Skjult feste med separat spesialklips-tillegg (start/slutt) — egen primærlinje kun når > 0
  {
    name: '3b. Skjult feste + 10% spesialklips-tillegg → egen primærlinje for start-/sluttklips',
    input: base({ feste: 'skjult', perKryss: 1, festemiddelSvinn: 8, spesialklipsTillegg: 10 }),
    expectedText: ['ca. 270 hovedklips', 'ca. 27 start-/sluttklips'] // ceil(270*0.10)
  },
  // 4a. Bordretning langs lengden (6x4m)
  {
    name: '4a. Bordretning langs lengden (6x4m) — geometri uendret av UX-omskrivingen',
    input: base({ lengde: 6, bredde: 4, festemiddelSvinn: 0 }),
    expectedText: ['214.7 lm terrassebord', '44 lm bjelkelag (48x148)', 'ca. 726 terrasseskruer'],
    expected: {
      'Antall bord — geometrisk': 33,
      'Antall bjelkeløp': 11,
      'Festemidler — geometrisk behov': 726
    }
  },
  // 4b. Samme mål, men bordretning langs bredden — skal gi ANNET resultat, samme formel
  {
    name: '4b. Bordretning langs bredden (6x4m, samme mål som 4a) — gir annet, men fortsatt riktig, resultat',
    input: base({ lengde: 6, bredde: 4, bordretning: 'bredde', festemiddelSvinn: 0 }),
    expectedText: ['214.7 lm terrassebord', '48 lm bjelkelag (48x148)', 'ca. 784 terrasseskruer'],
    expected: {
      'Antall bord — geometrisk': 49,
      'Antall bjelkeløp': 8,
      'Festemidler — geometrisk behov': 784
    }
  },
  // 5. Endret avstand mellom bord (8mm i stedet for default 3mm) skal gi mindre dekkbredde → mer bordlengde
  {
    name: '5. Endret avstand mellom bord til 8mm',
    input: base({ fuge: 8, festemiddelSvinn: 0 }),
    expectedText: ['129 lm terrassebord'],
    expected: {
      'Terrassebord netto': 117.2,
      'Terrassebord bestilling': 129,
      'Avstand mellom bord': 8
    }
  },
  // 6. Eksakt c/c-multippel (6m med c/c 600 → 6000/600=10 nøyaktig)
  {
    name: '6. Eksakt c/c-multippel (P=6m, c/c 600)',
    input: base({ lengde: 6, bredde: 3, festemiddelSvinn: 0 }),
    expected: { 'Antall bjelkeløp': 11 } // ceil(6000/600)+1 = 10+1
  },
  // 7. Mål som ikke går opp i c/c (5.2m med c/c 600)
  {
    name: '7. Mål som ikke går opp i c/c (P=5.2m, c/c 600)',
    input: base({ lengde: 5.2, bredde: 3, festemiddelSvinn: 0 }),
    expected: { 'Antall bjelkeløp': 10 } // ceil(5200/600)+1 = 9+1
  },
  // 8. Ugyldige mål
  { name: '8a. Ugyldig: lengde=0', input: base({ lengde: 0 }), expected: null },
  { name: '8b. Ugyldig: bredde=0', input: base({ bredde: 0 }), expected: null },
  { name: '8c. Ugyldig: negativ lengde', input: base({ lengde: -5 }), expected: null },
  // 9. Standardvalg 28×120 trykkimpregnert skal gi 3mm avstand mellom bord og 600mm bjelke c/c
  // når feltene ikke overstyres (dvs. samme verdier som feltenes egne defaults)
  {
    name: '9. Standard 28×120 trykkimpregnert → 3mm avstand mellom bord, 600mm bjelke c/c',
    input: base({}),
    expected: { 'Avstand mellom bord': 3, 'Bjelke c/c': 600 }
  },
  // 10. Bjelkelag presenteres som total lm, IKKE som en påstått bestilling av N hele emner —
  // "N bjelker à C m"-formatet skal ikke lenger finnes noe sted i resultatet
  {
    name: '10. Bjelkelag vises som total lm med forbehold, ikke "N bjelker à C m"',
    input: base({}),
    expectedText: ['30 lm bjelkelag (48x148)'],
    expected: { 'Bjelkelag — forbehold': 'Geometrisk materialbehov. Dimensjonering av spenn og understøtting inngår ikke i beregningen.' }
  },
  // 11. Terrassebord i hovedresultatet er bestillings-lm (inkl. svinn), ikke netto-lm
  {
    name: '11. Hovedresultatet for terrassebord bruker bestillings-lm, ikke netto-lm',
    input: base({}),
    expectedText: ['134.2 lm terrassebord'], // IKKE 122 (netto)
    expected: { 'Terrassebord netto': 122, 'Terrassebord bestilling': 134.2 }
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

// 12. Bytte av Feste oppdaterer perKryss-preset (2 synlig / 1 skjult) — DOM-mock
(function testFesteSync() {
  var name = '12. Bytte av Feste oppdaterer perKryss-preset (2 synlig / 1 skjult)';
  var fakeEls = { mc_feste: { value: 'synlig' }, mc_perKryss: { value: '2' } };
  global.document = { getElementById: function(id) { return fakeEls[id]; } };
  global.$ = function() { return null; };
  _matCalcCurrent = 'terrasse';

  var errors = [];
  fakeEls.mc_feste.value = 'skjult';
  onFesteChange();
  if (Number(fakeEls.mc_perKryss.value) !== 1) {
    errors.push('  Forventet perKryss=1 ved skjult feste, fikk ' + fakeEls.mc_perKryss.value);
  }
  fakeEls.mc_feste.value = 'synlig';
  onFesteChange();
  if (Number(fakeEls.mc_perKryss.value) !== 2) {
    errors.push('  Forventet perKryss=2 ved synlig feste, fikk ' + fakeEls.mc_perKryss.value);
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

// 13. Conditional visibility: spesialklipsTillegg skal kun være synlig under
// «Flere valg» når feste=skjult er valgt
(function testTerrasseFeltSynlighet() {
  var name = '13. Conditional visibility: spesialklipsTillegg skjult ved synlig feste, synlig ved skjult feste';
  var fakeWraps = { mcfield_spesialklipsTillegg: { style: {} } };
  var fakeEls = { mc_feste: { value: 'synlig' } };
  global.document = {
    getElementById: function(id) {
      if (fakeEls[id]) return fakeEls[id];
      if (fakeWraps[id]) return fakeWraps[id];
      return undefined;
    }
  };
  global.$ = function() { return null; };
  _matCalcCurrent = 'terrasse';

  var errors = [];

  fakeEls.mc_feste.value = 'synlig';
  updateTerrasseFeltSynlighet();
  if (fakeWraps.mcfield_spesialklipsTillegg.style.display !== 'none') {
    errors.push('  Forventet spesialklipsTillegg skjult ved synlig feste, fikk display="' + fakeWraps.mcfield_spesialklipsTillegg.style.display + '"');
  }

  fakeEls.mc_feste.value = 'skjult';
  updateTerrasseFeltSynlighet();
  if (fakeWraps.mcfield_spesialklipsTillegg.style.display === 'none') {
    errors.push('  Forventet spesialklipsTillegg synlig ved skjult feste');
  }

  fakeEls.mc_feste.value = 'synlig';
  updateTerrasseFeltSynlighet();
  if (fakeWraps.mcfield_spesialklipsTillegg.style.display !== 'none') {
    errors.push('  Forventet spesialklipsTillegg skjult igjen etter tilbakebytte til synlig feste');
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
