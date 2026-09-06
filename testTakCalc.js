// Tester for materialCalc.js sin Tak-kalkulator (matCalcDefs.tak)
// UX-forenklet (samme mønster som Gips/Gulv/Terrasse): kompakt primærresultat
// (bestillingsmengder) + detaljer bak "Vis beregningsdetaljer", per tekkingstype.
// Fjernet falske "universelle" defaults for underlagsbelegg-rulledekning,
// møne-pakkedekning (shingel), ståltak-platelengde, takpapp-rulledekning og
// takpapp-festemidler — disse starter nå tomme med m²/lm-fallback, samme
// prinsipp som Gulv sitt pakningsinnhold.
// Kjør: node testTakCalc.js

eval(require('fs').readFileSync('materialCalc.js', 'utf8'));

function run(v) {
  return matCalcDefs.tak.calc(v);
}

function byLabel(results, label) {
  var hit = (results || []).filter(function(r) { return r.label === label; })[0];
  return hit ? hit.value : undefined;
}

function hasText(results, text) {
  return (results || []).some(function(r) { return r.text === text; });
}

function hasLabel(results, needle) {
  return (results || []).some(function(r) { return r.label && r.label.indexOf(needle) >= 0; });
}

function shingelBase(extra) {
  return Object.assign({
    jobb: 'shingel', taktype: 'saltak', taklengde: 8, skralengde: 4,
    shingelUndertak: 'eksisterende', inkluderUnderlagspapp: true,
    undertaksmateriale: 'plate', undertaksplateM2: 2.98, rupanelDekkbredde: 148,
    shingelPakkeM2: 3, underlagspappRullM2: '', shingelSpikerPerM2: 35, moneStrimmelDekningM: '',
    svinnTekking: 10, svinnUndertak: 10, svinnFestemidler: 5, moneSvinn: 10
  }, extra);
}

function staaltakBase(extra) {
  return Object.assign({
    jobb: 'staaltak', taktype: 'saltak', taklengde: 9, skralengde: 5,
    staalDekkbredde: 900, staalPlatelengde: 5, staalBrukerLekter: false, staalLekteCC: 600,
    svinnLekter: 10, staalFesteHoved: 9, staalFesteBeslag: 3, svinnFestemidler: 0,
    moneBeslagLengde: 2, moneSvinn: 10
  }, extra);
}

function taksteinBase(extra) {
  return Object.assign({
    jobb: 'takstein', taktype: 'saltak', taklengde: 10, skralengde: 6,
    steinPerM2: 10, lekteavstand: 300, sperreCC: 600, moneSteinPerLm: 3,
    svinnStein: 0, svinnTrevirke: 0, moneSvinn: 0
  }, extra);
}

function takpappBase(extra) {
  return Object.assign({
    jobb: 'takpapp', taktype: 'pulttak', taklengde: 6, skralengde: 3,
    pappUndertak: 'eksisterende', undertaksmateriale: 'plate', undertaksplateM2: 2.98, rupanelDekkbredde: 148,
    pappRullM2: '', pappSpikerPerM2: '',
    svinnTekking: 10, svinnUndertak: 10, svinnFestemidler: 5, moneSvinn: 10
  }, extra);
}

var CASES = [];
var ok = 0;
var fail = 0;

function addCase(c) { CASES.push(c); }

// ── SHINGEL ──────────────────────────────────────────────────────────────
addCase({
  name: 'S1. Shingel 8x4m saltak, standardverdier → 24 pakker shingel, ca. 2352 spiker',
  input: shingelBase({}),
  expectedText: ['24 pakker shingel', 'ca. 2352 shingelspiker'],
  expected: { 'Shingel — bestilling': 24, 'Shingelspiker — bestilling': 2352 }
});
addCase({
  name: 'S2. Shingelspiker default fortsatt 35/m² (Mataki/IKO-verifisert, ikke rørt)',
  input: shingelBase({}),
  expected: { 'Shingelspiker — geometrisk behov': 2240 } // 64 m² × 35
});
addCase({
  name: 'S3. Shingel — dekning per pakke default fortsatt 3 m²',
  input: shingelBase({}),
  expected: { 'Shingel — geometrisk behov': 22 } // ceil(64/3)
});
addCase({
  name: 'S4. Ta med underlagsbelegg = av → ingen underlagsbelegg-linje i det hele tatt',
  input: shingelBase({ inkluderUnderlagspapp: false }),
  expectMissing: ['Underlagsbelegg — bestilling'],
  expectedTextMissing: ['underlagsbelegg']
});
addCase({
  name: 'S5. Underlagsbelegg på, men rulledekning ikke oppgitt → m²-fallback, IKKE et oppdiktet rulletall',
  input: shingelBase({ inkluderUnderlagspapp: true, underlagspappRullM2: '' }),
  expectedText: ['70.4 m² underlagsbelegg'],
  expectedTextMissing: ['ruller underlagsbelegg'],
  expectMissing: ['Underlagsbelegg — geometrisk behov']
});
addCase({
  name: 'S6. Underlagsbelegg på, rulledekning 15m² oppgitt → viser ruller + m² sekundært',
  input: shingelBase({ inkluderUnderlagspapp: true, underlagspappRullM2: 15 }),
  expectedText: ['5 ruller underlagsbelegg', '70.4 m² beregnet behov (underlagsbelegg)'],
  expected: { 'Underlagsbelegg — bestilling': 5 }
});
addCase({
  name: 'S7. Møne-pakkedekning ikke oppgitt → lm-fallback, IKKE et oppdiktet pakketall',
  input: shingelBase({ moneStrimmelDekningM: '' }),
  expectedText: ['8.8 lm møne'],
  expectedTextMissing: ['pakker møne']
});
addCase({
  name: 'S8. Møne-pakkedekning 5 lm oppgitt → viser pakketall',
  input: shingelBase({ moneStrimmelDekningM: 5 }),
  expectedText: ['2 pakker møne']
});
addCase({
  name: 'S9. Nytt fast undertak, plate → egen primærlinje "plater nytt fast undertak"',
  input: shingelBase({ shingelUndertak: 'nytt', undertaksmateriale: 'plate' }),
  expectedText: ['24 plater nytt fast undertak'],
  expected: { 'Nytt undertak (plateunderlag) — bestilling': 24 }
});
addCase({
  name: 'S10. Nytt fast undertak, rupanel → egen primærlinje i lm',
  input: shingelBase({ shingelUndertak: 'nytt', undertaksmateriale: 'rupanel' }),
  expectedText: ['475.7 lm nytt fast undertak (rupanel)']
});
addCase({
  name: 'S11. Eksisterende fast undertak → ingen "nytt undertak"-primærlinje',
  input: shingelBase({ shingelUndertak: 'eksisterende' }),
  expectedTextMissing: ['nytt fast undertak']
});
addCase({
  name: 'S12. Pulttak har ikke møne → ingen mønelinje for shingel',
  input: shingelBase({ taktype: 'pulttak' }),
  expectedTextMissing: ['møne']
});

// ── STÅLTAK ──────────────────────────────────────────────────────────────
addCase({
  name: 'T1. Ståltak 9x5m saltak, standardverdier → 20 plater, 810/270 skruer (uendret 9+3-modell)',
  input: staaltakBase({}),
  expectedText: ['20 plater', 'ca. 810 takplateskruer', 'ca. 270 skjøt-/beslagskruer'],
  expected: {
    'Takplateskruer — geometrisk behov': 810, // 90 m² × 9/m²
    'Skjøt-/beslagskruer — geometrisk behov': 270 // 90 m² × 3/m²
  }
});
addCase({
  name: 'T2. Ta med lekter = av som standard → ingen lekterlinje',
  input: staaltakBase({ staalBrukerLekter: false }),
  expectedTextMissing: ['lm lekter'],
  expectMissing: ['Lekter under plater — rader per takflate']
});
addCase({
  name: 'T3. Ta med lekter = på → egen primærlinje for lekter-lm',
  input: staaltakBase({ staalBrukerLekter: true }),
  expectedText: ['198.1 lm lekter']
});
addCase({
  name: 'T4. Blank platelengde → tydelig "angi platelengde"-varsel, IKKE tolket som "for kort"',
  input: staaltakBase({ staalPlatelengde: '' }),
  expectedText: ['⚠ Angi platelengde for å beregne materialmengde (bør være minst 5 m — skrålengden).'],
  expectMissing: ['Plater (forutsetter hele plater i skråretningen)']
});
addCase({
  name: 'T5. For kort platelengde (4m < 5m skrålengde) → konkret, handlingsorientert varsel',
  input: staaltakBase({ staalPlatelengde: 4 }),
  expectedText: ['⚠ Platelengden (4 m) er kortere enn skrålengden (5 m). Kalkulatoren støtter ikke skjøting av takplater. Angi platelengde på minst 5 m.'],
  expectMissing: ['Plater (forutsetter hele plater i skråretningen)']
});
addCase({
  name: 'T6. Gyldig platelengde (nøyaktig lik skrålengde) → normalt resultat',
  input: staaltakBase({ staalPlatelengde: 5, skralengde: 5 }),
  expectedText: ['20 plater'],
  expectMissing: ['⚠ Angi platelengde for å beregne materialmengde (bør være minst 5 m — skrålengden).']
});

// ── TAKSTEIN ─────────────────────────────────────────────────────────────
addCase({
  name: 'K1. Takstein 10x6m saltak, standardverdier → 1200 stein, 420 lm lekter, 216 lm sløyfer',
  input: taksteinBase({}),
  expectedText: ['1200 stk takstein', '420 lm lekter', '216 lm sløyfer'],
  expected: { 'Takstein — geometrisk behov': 1200 }
});
addCase({
  name: 'K2. Takstein har bevisst INGEN festemiddelmengde — kun en merknad i detaljene',
  input: taksteinBase({}),
  expectedTextMissing: ['festemidler', 'spiker', 'skrue'],
  expected: { 'Festemidler takstein': 'Innfesting av takstein er ikke beregnet. Behovet må bestemmes etter valgt taksteinsystem, takvinkel og vindforhold.' }
});
addCase({
  name: 'K3. Saltak → egen mønestein-primærlinje',
  input: taksteinBase({ taktype: 'saltak' }),
  expectedText: ['30 stk mønestein']
});
addCase({
  name: 'K4. Pulttak → ingen mønestein-linje',
  input: taksteinBase({ taktype: 'pulttak' }),
  expectedTextMissing: ['mønestein']
});

// ── TAKPAPP ──────────────────────────────────────────────────────────────
addCase({
  name: 'P1. Rulledekning ikke oppgitt → m²-fallback, IKKE et oppdiktet rulletall',
  input: takpappBase({ pappRullM2: '' }),
  expectedText: ['19.8 m² takbelegg'],
  expectedTextMissing: ['ruller takbelegg'],
  expectMissing: ['Takpapp — geometrisk behov']
});
addCase({
  name: 'P2. Rulledekning 10m² oppgitt → viser ruller + m² sekundært',
  input: takpappBase({ pappRullM2: 10 }),
  expectedText: ['2 ruller takbelegg', '19.8 m² beregnet behov (takbelegg)'],
  expected: { 'Takpapp — bestilling': 2 }
});
addCase({
  name: 'P3. Festemiddelforbruk ikke oppgitt → INGEN falsk festemiddellinje',
  input: takpappBase({ pappSpikerPerM2: '' }),
  expectedTextMissing: ['festemidler'],
  expectMissing: ['Festemidler takbelegg — bestilling']
});
addCase({
  name: 'P4. Festemiddelforbruk 8/m² oppgitt → viser "ca. X festemidler", IKKE kalt "pappspiker"',
  input: takpappBase({ pappSpikerPerM2: 8 }),
  expectedText: ['ca. 152 festemidler'],
  expectedTextMissing: ['pappspiker']
});
addCase({
  name: 'P5. Nytt fast undertak (rupanel) → egen primærlinje',
  input: takpappBase({ pappUndertak: 'nytt', undertaksmateriale: 'rupanel' }),
  expectedText: ['133.8 lm nytt fast undertak (rupanel)']
});

// ── Regresjonstester (tidligere godkjente scenarioer, uendret formel) ────
addCase({ name: 'R1. Pulttak (8x4m) = 1 takflate, areal 32m²', input: shingelBase({ taktype: 'pulttak' }), expected: { 'Takflateareal (geometrisk)': 32, 'Antall takflater (pulttak)': 1 } });
addCase({ name: 'R2. Saltak (8x4m) = 2 takflater, areal dobles til 64m²', input: shingelBase({ taktype: 'saltak' }), expected: { 'Takflateareal (geometrisk)': 64, 'Antall takflater (saltak)': 2 } });
addCase({ name: 'R5a. Ugyldig: taklengde=0', input: shingelBase({ taklengde: 0 }), expected: null });
addCase({ name: 'R5b. Ugyldig: skrålengde=0', input: shingelBase({ skralengde: 0 }), expected: null });
addCase({ name: 'R5c. Ugyldig: negativ taklengde', input: shingelBase({ taklengde: -5 }), expected: null });
addCase({ name: 'R6. Shingelspiker geometrisk behov runder OPP ved brøktall (323,2 → 324, ikke 323)', input: shingelBase({ taktype: 'pulttak', taklengde: 8, skralengde: 4, shingelSpikerPerM2: 10.1 }), expected: { 'Shingelspiker — geometrisk behov': 324 } });
addCase({ name: 'R7. Takstein geometrisk behov runder OPP ved brøktall (1200,12 → 1201, ikke 1200)', input: taksteinBase({ taklengde: 10, skralengde: 6, steinPerM2: 10.001 }), expected: { 'Takstein — geometrisk behov': 1201 } });
addCase({ name: 'R9. Mønestein geometrisk behov runder OPP ved brøktall (30,01 → 31, ikke 30)', input: taksteinBase({ taklengde: 10, skralengde: 6, moneSteinPerLm: 3.001 }), expected: { 'Mønestein/møneløsning — geometrisk behov': 31 } });

// ── Kjør alle CASES ────────────────────────────────────────────────────
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
  (c.expectedTextMissing || []).forEach(function(fragment) {
    var hit = (res || []).some(function(r) { return r.text && r.text.toLowerCase().indexOf(fragment.toLowerCase()) >= 0; });
    if (hit) {
      errors.push('  Forventet at ingen tekst skulle inneholde "' + fragment + '", men det gjorde den');
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

// ── Delt normalvisning-rekkefølge: jobb → taktype → taklengde → skralengde ──
(function testDeltFeltrekkefolge() {
  var name = 'N1. Delt normalvisning i riktig rekkefølge (jobb, taktype, taklengde, skralengde)';
  var ids = matCalcDefs.tak.fields.map(function(f) { return f.id; });
  var expectedOrder = ['jobb', 'taktype', 'taklengde', 'skralengde'];
  var match = ids.length === expectedOrder.length && ids.every(function(id, i) { return id === expectedOrder[i]; });
  if (match) {
    console.log('✓ ' + name);
    ok++;
  } else {
    console.log('✗ ' + name + ' — fikk rekkefølge ' + JSON.stringify(ids));
    fail++;
  }
})();

// ── Conditional visibility per gren — DOM-mock, samme mønster som Gips/Gulv/Terrasse ──
(function testTakFeltSynlighet() {
  var name = 'N2. Conditional visibility per tekkingstype (shingel/ståltak/takstein/takpapp)';
  var fakeWraps = {};
  ['undertaksmateriale', 'undertaksplateM2', 'rupanelDekkbredde', 'underlagspappRullM2', 'moneStrimmelDekningM',
    'moneSvinn', 'staalLekteCC', 'svinnLekter', 'moneBeslagLengde', 'moneSteinPerLm'
  ].forEach(function(id) { fakeWraps['mcfield_' + id] = { style: {} }; });
  var fakeEls = {
    mc_jobb: { value: 'shingel' },
    mc_taktype: { value: 'pulttak' },
    mc_shingelUndertak: { value: 'eksisterende' },
    mc_pappUndertak: { value: 'eksisterende' },
    mc_undertaksmateriale: { value: 'plate' },
    mc_inkluderUnderlagspapp: { checked: false },
    mc_staalBrukerLekter: { checked: false }
  };
  global.document = {
    getElementById: function(id) {
      if (fakeEls[id]) return fakeEls[id];
      if (fakeWraps[id]) return fakeWraps[id];
      return undefined;
    }
  };
  global.$ = function() { return null; };
  _matCalcCurrent = 'tak';

  var errors = [];
  function isHidden(id) { return fakeWraps['mcfield_' + id].style.display === 'none'; }

  // Shingel, pulttak, eksisterende undertak, underlag av → alt skjult
  updateTakFeltSynlighet();
  ['undertaksmateriale', 'undertaksplateM2', 'rupanelDekkbredde', 'underlagspappRullM2', 'moneStrimmelDekningM', 'moneSvinn'].forEach(function(id) {
    if (!isHidden(id)) errors.push('  Forventet ' + id + ' skjult (shingel, pulttak, eksisterende, underlag av)');
  });

  // Shingel, nytt undertak, plate → undertaksmateriale + undertaksplateM2 synlig, rupanel skjult
  fakeEls.mc_shingelUndertak.value = 'nytt';
  updateTakFeltSynlighet();
  if (isHidden('undertaksmateriale')) errors.push('  Forventet undertaksmateriale synlig ved nytt undertak');
  if (isHidden('undertaksplateM2')) errors.push('  Forventet undertaksplateM2 synlig ved nytt+plate');
  if (!isHidden('rupanelDekkbredde')) errors.push('  Forventet rupanelDekkbredde skjult ved plate');

  // Bytt til rupanel → motsatt
  fakeEls.mc_undertaksmateriale.value = 'rupanel';
  updateTakFeltSynlighet();
  if (!isHidden('undertaksplateM2')) errors.push('  Forventet undertaksplateM2 skjult ved rupanel');
  if (isHidden('rupanelDekkbredde')) errors.push('  Forventet rupanelDekkbredde synlig ved rupanel');

  // Underlagsbelegg på → underlagspappRullM2 synlig
  fakeEls.mc_inkluderUnderlagspapp.checked = true;
  updateTakFeltSynlighet();
  if (isHidden('underlagspappRullM2')) errors.push('  Forventet underlagspappRullM2 synlig når underlagsbelegg er på');

  // Saltak → mønefelt synlige
  fakeEls.mc_taktype.value = 'saltak';
  updateTakFeltSynlighet();
  if (isHidden('moneStrimmelDekningM') || isHidden('moneSvinn')) errors.push('  Forventet mønefelt synlige ved saltak (shingel)');

  // Bytt til ståltak — lekterfelt følger staalBrukerLekter
  fakeEls.mc_jobb.value = 'staaltak';
  updateTakFeltSynlighet();
  if (!isHidden('staalLekteCC') || !isHidden('svinnLekter')) errors.push('  Forventet lekterfelt skjult når "Ta med lekter" er av (ståltak)');
  fakeEls.mc_staalBrukerLekter.checked = true;
  updateTakFeltSynlighet();
  if (isHidden('staalLekteCC') || isHidden('svinnLekter')) errors.push('  Forventet lekterfelt synlige når "Ta med lekter" er på (ståltak)');
  if (isHidden('moneBeslagLengde')) errors.push('  Forventet moneBeslagLengde synlig ved saltak (ståltak)');

  // Bytt til takstein — kun mønefelt er conditional
  fakeEls.mc_jobb.value = 'takstein';
  updateTakFeltSynlighet();
  if (isHidden('moneSteinPerLm')) errors.push('  Forventet moneSteinPerLm synlig ved saltak (takstein)');
  fakeEls.mc_taktype.value = 'pulttak';
  updateTakFeltSynlighet();
  if (!isHidden('moneSteinPerLm')) errors.push('  Forventet moneSteinPerLm skjult ved pulttak (takstein)');

  // Bytt til takpapp — samme undertak-mønster som shingel, delt feltnavn
  fakeEls.mc_jobb.value = 'takpapp';
  fakeEls.mc_pappUndertak.value = 'nytt';
  fakeEls.mc_undertaksmateriale.value = 'plate';
  updateTakFeltSynlighet();
  if (isHidden('undertaksmateriale') || isHidden('undertaksplateM2')) errors.push('  Forventet undertaksmateriale/undertaksplateM2 synlige ved takpapp nytt+plate');

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
