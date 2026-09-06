// Tester for materialCalc.js sin Gulv-kalkulator (matCalcDefs.gulv)
// UX-forenklet (samme mønster som Gips): kompakt primærresultat
// (bestillingsmengder — pakker der pakningsinnhold er oppgitt, ellers m²) +
// detaljer bak "Vis beregningsdetaljer". Beregningsmotoren er uendret.
// Kjør: node testGulvCalc.js

eval(require('fs').readFileSync('materialCalc.js', 'utf8'));

function run(v) {
  return matCalcDefs.gulv.calc(v);
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
    lengde: 5, bredde: 4, gulvtype: 'parkett', leggemonster: 'rett',
    bordbredde: 120, m2perPakke: 2.4, svinn: 7,
    inkluderUnderlag: false, svinnUnderlag: 5, underlagM2perPakke: 10,
    inkluderFuktsperre: false, svinnFuktsperre: 15,
    inkluderFotlist: false, dorapningBredde: 0.9
  }, extra);
}

var CASES = [
  // 1. Grunnmodell: areal × svinn, pakketall i hovedresultatet når pakningsinnhold er oppgitt
  {
    name: '1. Rom 5×4m, 7% svinn, 2,4 m²/pk → 9 pakker i hovedresultatet, 21,4 m² som sekundærinfo',
    input: base({}),
    expectedText: ['9 pakker gulv', 'Gulv – 21.4 m² bestilling', 'Parkett · Rett legging · inkl. 7% svinn'],
    expected: {
      'Gulvareal — netto': 20,
      'Gulvareal — bestilling inkl. svinn': 21.4,
      'Pakningsinnhold': 2.4,
      'Bestilling': 9
    }
  },
  // 2. Pakkeavrunding skal bruke ceil (11,15 pakker → 12, ikke 11)
  {
    name: '2. Pakkeavrunding runder OPP (26,75/2,4 = 11,15 → 12 pakker)',
    input: base({ lengde: 5, bredde: 5 }),
    expectedText: ['12 pakker gulv'],
    expected: { 'Gulvareal — bestilling inkl. svinn': 26.75, 'Bestilling': 12 }
  },
  // 3. 0% svinn → netto = bestilling
  {
    name: '3. 0% svinn gir netto = bestilling',
    input: base({ svinn: 0 }),
    expected: { 'Gulvareal — netto': 20, 'Gulvareal — bestilling inkl. svinn': 20 }
  },
  // 4. Ulik pakningsstørrelse gir ulikt antall pakker (ikke hardkodet per gulvtype)
  {
    name: '4. Endret m²/pk (1,9 i stedet for 2,4) gir flere pakker',
    input: base({ m2perPakke: 1.9 }),
    expected: { 'Bestilling': 12 } // ceil(21,4/1,9)
  },
  // 4b. Manglende pakningsinnhold (0) → hovedresultatet faller tilbake til m², IKKE et
  // pakketall basert på en antatt standardverdi
  {
    name: '4b. Pakningsinnhold = 0 → hovedresultat faller tilbake til m² gulv, ingen pakkelinjer',
    input: base({ m2perPakke: 0 }),
    expectedText: ['21.4 m² gulv'],
    expectedTextMissing: ['pakker gulv'],
    expectMissing: ['Pakningsinnhold', 'Bestilling']
  },
  // 5. Gulvunderlag er valgfritt, av som standard
  {
    name: '5a. Underlag av som standard → ingen linjer, ingen primærresultat',
    input: base({ inkluderUnderlag: false }),
    expectMissing: ['Gulvunderlag — bestilling inkl. svinn', 'Gulvunderlag — bestilling'],
    expectedTextMissing: ['underlag']
  },
  {
    name: '5b. Underlag aktivert med pakningsinnhold → pakker i hovedresultatet',
    input: base({ inkluderUnderlag: true, svinnUnderlag: 5, underlagM2perPakke: 10 }),
    expectedText: ['3 pakker underlag', 'Underlag – 21 m² bestilling'],
    expected: { 'Gulvunderlag — bestilling inkl. svinn': 21, 'Gulvunderlag — bestilling': 3 }
  },
  {
    name: '5c. Underlag aktivert UTEN pakningsinnhold → faller tilbake til m² underlag',
    input: base({ inkluderUnderlag: true, svinnUnderlag: 5, underlagM2perPakke: 0 }),
    expectedText: ['21 m² underlag'],
    expectedTextMissing: ['pakker underlag'],
    expectMissing: ['Gulvunderlag — bestilling']
  },
  // 6. Fuktsperre — primærresultat når aktivert
  {
    name: '6a. Fuktsperre av som standard → ingen linje',
    input: base({ inkluderFuktsperre: false }),
    expectMissing: ['Dampsperre/fuktsperre — bestilling inkl. svinn/omlegg']
  },
  {
    name: '6b. Fuktsperre aktivert → m²-primærresultat, matcher detaljlinjen eksakt',
    input: base({ inkluderFuktsperre: true, svinnFuktsperre: 15 }),
    expectedText: ['23 m² fuktsperre'],
    expected: { 'Dampsperre/fuktsperre — bestilling inkl. svinn/omlegg': 23 }
  },
  // 7. Fotlist — primærresultat når aktivert, bruker samme calcFotlist() som Listverk
  {
    name: '7a. Fotlist av som standard → ingen linje',
    input: base({ inkluderFotlist: false }),
    expectMissing: ['Fotlister (valgfritt)']
  },
  {
    name: '7b. Fotlist aktivert → lm-primærresultat matcher calcFotlist() eksakt',
    input: base({ inkluderFotlist: true, dorapningBredde: 0.9, svinn: 7 }),
    expected: { 'Fotlister (valgfritt)': calcFotlist((5 + 4) * 2, 0.9, 7).bestilling }
  },
  // 8. Heltregulv: estimert lm er PRIMÆRRESULTAT (ikke gjemt i detaljer) når
  // brukeren aktivt har valgt heltregulv og oppgitt bordbredde — pakketall/m²
  // for hovedgulvet vises fortsatt samtidig, uendret beregning
  {
    name: '8a. Heltregulv med bordbredde → estimert lm vises som eget primærresultat',
    input: base({ gulvtype: 'heltre', bordbredde: 120 }),
    expectedText: ['ca. 166.7 lm heltregulv', '9 pakker gulv', 'Heltregulv · Rett legging · inkl. 7% svinn'],
    expected: { 'Gulvareal — bestilling inkl. svinn': 21.4 } // fortsatt m²-basert i detaljene
  },
  {
    name: '8b. Heltregulv UTEN bordbredde → ingen lm-linje, men gulvresultatet vises fortsatt',
    input: base({ gulvtype: 'heltre', bordbredde: 0 }),
    expectedText: ['9 pakker gulv'],
    expectedTextMissing: ['lm heltregulv']
  },
  {
    name: '8c. Andre gulvtyper enn heltre → ingen lm-linje uansett bordbredde',
    input: base({ gulvtype: 'parkett', bordbredde: 120 }),
    expectedTextMissing: ['lm heltregulv']
  },
  // 9. Ugyldige mål
  { name: '9a. Ugyldig: romlengde=0', input: base({ lengde: 0 }), expected: null },
  { name: '9b. Ugyldig: negativ rombredde', input: base({ bredde: -4 }), expected: null }
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
  (c.expectedTextMissing || []).forEach(function(fragment) {
    var hit = (res || []).some(function(r) { return r.text && r.text.indexOf(fragment) >= 0; });
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

// 10. Leggemønster foreslår svinnprosent (DOM-mock, samme mønster som andre sync-tester)
(function testLeggemonsterSync() {
  var name = '10. Leggemønster foreslår svinnprosent (Tarkett-verifisert: rett=10, diagonal=15, fiskebein=15)';
  var fakeEls = { mc_leggemonster: { value: 'rett' }, mc_svinn: { value: '10' } };
  global.document = { getElementById: function(id) { return fakeEls[id]; } };
  global.$ = function() { return null; };
  _matCalcCurrent = 'gulv';

  fakeEls.mc_leggemonster.value = 'fiskebein';
  onGulvLeggemonsterChange();
  var errors = [];
  if (Number(fakeEls.mc_svinn.value) !== 15) {
    errors.push('  Forventet svinn=15 for fiskebein, fikk ' + fakeEls.mc_svinn.value);
  }
  fakeEls.mc_leggemonster.value = 'diagonal';
  onGulvLeggemonsterChange();
  if (Number(fakeEls.mc_svinn.value) !== 15) {
    errors.push('  Forventet svinn=15 for diagonal, fikk ' + fakeEls.mc_svinn.value);
  }
  fakeEls.mc_leggemonster.value = 'rett';
  onGulvLeggemonsterChange();
  if (Number(fakeEls.mc_svinn.value) !== 10) {
    errors.push('  Forventet svinn=10 for rett, fikk ' + fakeEls.mc_svinn.value);
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

// 11. Conditional visibility: bordbredde/svinnUnderlag/underlagM2perPakke/
// svinnFuktsperre/dorapningBredde skal kun være synlige under «Flere valg»
// når respektiv driver-felt faktisk gjør dem relevante.
(function testGulvFeltSynlighet() {
  var name = '11. Conditional visibility: 4 uavhengige betingelser (gulvtype/underlag/fuktsperre/fotlist)';
  var fakeWraps = {
    mcfield_bordbredde: { style: {} },
    mcfield_svinnUnderlag: { style: {} },
    mcfield_underlagM2perPakke: { style: {} },
    mcfield_svinnFuktsperre: { style: {} },
    mcfield_dorapningBredde: { style: {} }
  };
  var fakeEls = {
    mc_gulvtype: { value: 'parkett' },
    mc_inkluderUnderlag: { checked: false },
    mc_inkluderFuktsperre: { checked: false },
    mc_inkluderFotlist: { checked: false }
  };
  global.document = {
    getElementById: function(id) {
      if (fakeEls[id]) return fakeEls[id];
      if (fakeWraps[id]) return fakeWraps[id];
      return undefined;
    }
  };
  global.$ = function() { return null; };
  _matCalcCurrent = 'gulv';

  var errors = [];

  // 11a. Alt av/parkett som standard → alle fire skjult
  updateGulvFeltSynlighet();
  ['mcfield_bordbredde', 'mcfield_svinnUnderlag', 'mcfield_underlagM2perPakke', 'mcfield_svinnFuktsperre', 'mcfield_dorapningBredde'].forEach(function(id) {
    if (fakeWraps[id].style.display !== 'none') {
      errors.push('  11a: forventet ' + id + ' skjult som standard, fikk display="' + fakeWraps[id].style.display + '"');
    }
  });

  // 11b. Gulvtype=heltre → kun bordbredde vises
  fakeEls.mc_gulvtype.value = 'heltre';
  updateGulvFeltSynlighet();
  if (fakeWraps.mcfield_bordbredde.style.display === 'none') {
    errors.push('  11b: forventet bordbredde synlig ved gulvtype=heltre');
  }
  if (fakeWraps.mcfield_svinnUnderlag.style.display !== 'none') {
    errors.push('  11b: svinnUnderlag skal fortsatt være skjult (uavhengig betingelse)');
  }

  // 11c. Underlag på → svinnUnderlag/underlagM2perPakke vises
  fakeEls.mc_inkluderUnderlag.checked = true;
  updateGulvFeltSynlighet();
  if (fakeWraps.mcfield_svinnUnderlag.style.display === 'none' || fakeWraps.mcfield_underlagM2perPakke.style.display === 'none') {
    errors.push('  11c: forventet svinnUnderlag/underlagM2perPakke synlige når underlag er på');
  }

  // 11d. Fuktsperre på → svinnFuktsperre vises
  fakeEls.mc_inkluderFuktsperre.checked = true;
  updateGulvFeltSynlighet();
  if (fakeWraps.mcfield_svinnFuktsperre.style.display === 'none') {
    errors.push('  11d: forventet svinnFuktsperre synlig når fuktsperre er på');
  }

  // 11e. Fotlist på → dorapningBredde vises
  fakeEls.mc_inkluderFotlist.checked = true;
  updateGulvFeltSynlighet();
  if (fakeWraps.mcfield_dorapningBredde.style.display === 'none') {
    errors.push('  11e: forventet dorapningBredde synlig når fotlist er på');
  }

  // 11f. Slår alt av igjen → alle fem skjules igjen (uavhengig av tidligere tilstand)
  fakeEls.mc_gulvtype.value = 'parkett';
  fakeEls.mc_inkluderUnderlag.checked = false;
  fakeEls.mc_inkluderFuktsperre.checked = false;
  fakeEls.mc_inkluderFotlist.checked = false;
  updateGulvFeltSynlighet();
  ['mcfield_bordbredde', 'mcfield_svinnUnderlag', 'mcfield_underlagM2perPakke', 'mcfield_svinnFuktsperre', 'mcfield_dorapningBredde'].forEach(function(id) {
    if (fakeWraps[id].style.display !== 'none') {
      errors.push('  11f: forventet ' + id + ' skjult etter at alt er slått av igjen');
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
