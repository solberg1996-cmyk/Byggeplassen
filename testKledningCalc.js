// Tester for materialCalc.js sin Kledning-kalkulator (matCalcDefs.kledning)
// UX-forenklet: profil/dimensjon-preset styrer lm/m² (verifisert produktdata),
// kompakt primærresultat (lm + festemidler) + detaljer bak "Vis beregningsdetaljer".
// Kjør: node testKledningCalc.js

eval(require('fs').readFileSync('materialCalc.js', 'utf8'));

function run(v) {
  return matCalcDefs.kledning.calc(v);
}

function byLabel(results, label) {
  var hit = (results || []).filter(function(r) { return r.label === label; })[0];
  return hit ? hit.value : undefined;
}

function hasText(results, text) {
  return (results || []).some(function(r) { return r.text === text; });
}

function staaendeBase(extra) {
  return Object.assign({
    veggbredde: 6, vegghoyde: 2.4, apningerM2: 0, jobb: 'staaende',
    profilPreset: 'dobbelfals_148', lmPerM2: 7.7, bordlengde: 0,
    lektCC: 600, festemidlerPerKryss: 1, svinnBord: 10, svinnFestemidler: 5
  }, extra);
}

function liggendeBase(extra) {
  return Object.assign({
    veggbredde: 6, vegghoyde: 2.4, apningerM2: 0, jobb: 'liggende',
    profilPreset: 'dobbelfals_148', lmPerM2: 7.7, bordlengde: 0,
    lektCC: 600, festemidlerPerKryss: 1, svinnBord: 7, svinnFestemidler: 5
  }, extra);
}

function tommermannBase(extra) {
  return Object.assign({
    veggbredde: 6, vegghoyde: 2.4, apningerM2: 0, jobb: 'tommermann',
    underliggerBredde: '148', overliggerBredde: '123', overlapp: 25, ekstraOverliggere: 0,
    bordlengde: 0, lektCC: 600,
    festemidlerPerKryssUnderligger: 1, festemidlerPerKryssOverligger: 2,
    svinnBord: 12, svinnFestemidler: 5
  }, extra);
}

var CASES = [
  // 1. Stående enkeltlag — preset-drevet lm/m² (19×148 Dobbelfals, verifisert 7,7 lm/m²)
  {
    name: '1. Stående enkeltlag, 6×2,4m, 19×148 Dobbelfals (7,7 lm/m²) → kompakt primærresultat',
    input: staaendeBase({}),
    expectedText: ['122 lm kledning', 'ca. 247 festemidler', '19×148 mm Dobbelfals — inkl. 10% svinn'],
    expected: {
      'Kledning — netto løpemeter': 110.9,
      'Forbruk': 7.7,
      'Dekkbredde (utledet)': 129.9,
      'Antall bord (info)': 47,
      'Festemidler — geometrisk behov': 235
    }
  },
  // 2. Liggende enkeltlag — samme preset, egen svinnprosent (7%) og radgeometri
  {
    name: '2. Liggende enkeltlag, 6×2,4m, samme profil, 7% svinn-preset',
    input: liggendeBase({}),
    expectedText: ['118.7 lm kledning', 'ca. 220 festemidler', '19×148 mm Dobbelfals — inkl. 7% svinn'],
    expected: {
      'Kledning — netto løpemeter': 110.9,
      'Antall bordrader (info)': 19,
      'Festemidler — geometrisk behov': 209
    }
  },
  // 3. Tømmermannskledning — separat underligger/overligger, verifisert 25mm overlapp
  {
    name: '3. Tømmermann, underligger 148mm / overligger 123mm / overlapp 25mm (Bergene Holm-verifisert)',
    input: tommermannBase({}),
    expectedText: ['Underligger: 73 lm', 'Overligger: 73 lm', 'Festemidler: ca. 431 stk', '148×123 mm tømmermannskledning — inkl. 12% svinn'],
    expected: {
      'Underligger — netto løpemeter (senteravstand 221 mm)': 65.2,
      'Overligger — netto løpemeter (inkl. 0 ekstra à 2.4 m)': 65.2,
      'Festemidler underligger': 147,
      'Festemidler overligger': 284
    }
  },
  // 4. Ekstra overliggere legges til som enkelt lm-tillegg
  {
    name: '4. Tømmermann + 1 ekstra avslutningsoverligger + handelslengde 4m',
    input: tommermannBase({ ekstraOverliggere: 1, bordlengde: 4 }),
    expectedText: ['Underligger: 73 lm', 'Overligger: 75.7 lm', 'Festemidler: ca. 441 stk'],
    expected: {
      'Overligger — netto løpemeter (inkl. 1 ekstra à 2.4 m)': 67.6,
      'Estimert antall handelslengder underligger (4 m)': 19,
      'Estimert antall handelslengder overligger (4 m)': 19
    }
  },
  // 5. Åpningsareal reduserer nettoarealet som brukes i mengdeberegningen
  {
    name: '5. Åpningsareal (2m²) reduserer netto løpemeter og hovedresultatet',
    input: staaendeBase({ apningerM2: 2 }),
    expectedText: ['105.1 lm kledning'],
    expected: {
      'Nettoareal vegg (6 × 2.4 m − åpninger)': 12.4,
      'Kledning — netto løpemeter': 95.5
    }
  },
  // 6. Egendefinert profil krever manuelt lm/m², dekkbredde utledes
  {
    name: '6. Egendefinert profil med lm/m²=9 → dekkbredde utledes (111,1mm), egen sekundærtekst',
    input: staaendeBase({ profilPreset: 'egendefinert', lmPerM2: 9, bordlengde: 4 }),
    expectedText: ['142.6 lm kledning', 'Egendefinert profil — inkl. 10% svinn'],
    expected: {
      'Dekkbredde (utledet)': 111.1,
      'Estimert antall handelslengder (4 m)': 36
    }
  },
  // 7. Handelslengde er av som standard (0 = ikke vis) — ingen handelslengde-linje
  {
    name: '7. Handelslengde=0 som standard → ingen handelslengde-linje i resultatet',
    input: staaendeBase({}),
    expectMissing: ['Estimert antall handelslengder (0 m)', '⚠ Bordlengde kortere enn vegghøyde']
  },
  // 8. Bordlengde kortere enn vegghøyde → informativt varsel, kun når handelslengde er satt
  {
    name: '8. Handelslengde 3m er kortere enn vegghøyde 3,2m → varsel, beregning fortsetter',
    input: staaendeBase({ bordlengde: 3, vegghoyde: 3.2 }),
    expectedText: ['162.7 lm kledning'],
    expected: {
      '⚠ Bordlengde kortere enn vegghøyde': 'Valgt bordlengde (3 m) er kortere enn vegghøyden (3.2 m) — bord må skjøtes hvis dette ikke er tilsiktet.'
    }
  },
  // 8b. Handelslengde satt og tilstrekkelig → ingen varsel, men handelslengde-linjen vises
  {
    name: '8b. Handelslengde 4m er lang nok for vegghøyde 2,4m → ingen varsel',
    input: staaendeBase({ bordlengde: 4, vegghoyde: 2.4 }),
    expectMissing: ['⚠ Bordlengde kortere enn vegghøyde'],
    expected: { 'Estimert antall handelslengder (4 m)': 31 }
  },
  // 9. Festemiddeltillegg er separat fra bordsvinn
  {
    name: '9a. Uten noe tillegg (0%/0%)',
    input: staaendeBase({ svinnBord: 0, svinnFestemidler: 0 }),
    expected: { 'Festemidler — geometrisk behov': 235 }
  },
  {
    name: '9b. Høyt bordsvinn (50%) endrer IKKE festemiddeltallet',
    input: staaendeBase({ svinnBord: 50, svinnFestemidler: 0 }),
    expectedText: ['ca. 235 festemidler'],
    expected: { 'Festemidler — geometrisk behov': 235 }
  },
  // 10. Ugyldige mål
  { name: '10a. Ugyldig: veggbredde=0', input: staaendeBase({ veggbredde: 0 }), expected: null },
  { name: '10b. Ugyldig: vegghøyde=0', input: staaendeBase({ vegghoyde: 0 }), expected: null },
  { name: '10c. Ugyldig: negativ veggbredde', input: staaendeBase({ veggbredde: -6 }), expected: null },
  // 11. Ugyldig: lm/m²=0 (egendefinert uten verdi) skal ikke krasje, men returnere null
  { name: '11. Ugyldig: egendefinert profil uten lm/m²-verdi', input: staaendeBase({ profilPreset: 'egendefinert', lmPerM2: 0 }), expected: null }
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

// 12. Profil/dimensjon-valg foreslår lm/m² (DOM-mock, samme mønster som andre sync-tester)
(function testProfilSync() {
  var name = '12. Profil/dimensjon foreslår lm/m² (19×98 Dobbelfals → 12,5 lm/m²)';
  var fakeEls = { mc_profilPreset: { value: 'dobbelfals_148' }, mc_lmPerM2: { value: '7.7' } };
  global.document = { getElementById: function(id) { return fakeEls[id]; } };
  global.$ = function() { return null; };
  _matCalcCurrent = 'kledning';

  fakeEls.mc_profilPreset.value = 'dobbelfals_98';
  onKledningProfilChange();
  var errors = [];
  if (Number(fakeEls.mc_lmPerM2.value) !== 12.5) {
    errors.push('  Forventet lm/m²=12.5 for 19×98 Dobbelfals, fikk ' + fakeEls.mc_lmPerM2.value);
  }
  fakeEls.mc_profilPreset.value = 'egendefinert';
  onKledningProfilChange();
  if (Number(fakeEls.mc_lmPerM2.value) !== 12.5) {
    errors.push('  Forventet at lm/m² forblir uendret (12.5) ved "Annen/egendefinert", fikk ' + fakeEls.mc_lmPerM2.value);
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
