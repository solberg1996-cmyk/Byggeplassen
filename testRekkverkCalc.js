// Tester for materialCalc.js sin Rekkverk-kalkulator (matCalcDefs.rekkverk)
// Mengdekalkulator — ingen TEK17-kontroll eller konstruksjonsmotor.
// UX-forenklet (samme mønster som Kledning): kompakt primærresultat
// (stolper + materiale + festemidler) + detaljer bak "Vis beregningsdetaljer".
// Kjør: node testRekkverkCalc.js

eval(require('fs').readFileSync('materialCalc.js', 'utf8'));

function run(v) {
  return matCalcDefs.rekkverk.calc(v);
}

function byLabel(results, label) {
  var hit = (results || []).filter(function(r) { return r.label === label; })[0];
  return hit ? hit.value : undefined;
}

function hasText(results, text) {
  return (results || []).some(function(r) { return r.text === text; });
}

function base(jobb, extra) {
  var b = {
    rekkverkslengde: 8, rekkverkshoyde: 1000, jobb: jobb,
    stolpeavstand: 1200, stolpelengde: 1.3, stolpeDimensjon: '48x98',
    beregnHandlop: true, beregnBunnrekke: true, svinnTopBunn: 5, festemidlerPerLmTopBunn: 3
  };
  // Bruker "egendefinert" spiledimensjon + eksplisitt spilebredde=30 i de
  // fleste spiler-caser for å bevare de opprinnelige, allerede verifiserte
  // regresjonstallene (modul 130 mm) fra før preset-dropdownen ble innført.
  if (jobb === 'spiler') Object.assign(b, { spiledimensjon: 'egendefinert', spilebredde: 30, lysapning: 100, spilelengde: 1000, festemidlerPerSpile: 2, svinnSpiler: 5, handelslengdeSpiler: 0 });
  if (jobb === 'liggende') Object.assign(b, { bordDekkhoyde: 95, festemidlerPerLmBord: 3, svinnBord: 7, handelslengdeBord: 0 });
  if (jobb === 'tett') Object.assign(b, { profilPreset: 'dobbelfals_148', lmPerM2: 7.7, festemidlerPerLmTett: 3, svinnTett: 7, handelslengdeTett: 0 });
  return Object.assign(b, extra);
}

var CASES = [
  // 1. Stolper — geometrisk c/c-basert, redigerbar avstand, med emnelengde i hovedresultatet
  {
    name: '1. Stolper: 8m / c-c 1200mm → 8 stk (ceil(8000/1200)+1), à stolpelengde 1,3m',
    input: base('spiler', {}),
    expectedText: ['8 stolper à 1.3 m'],
    expected: {
      'Stolpemateriale — total løpemeter': 10.4, // 8 × 1,3
      'Stolpeavstand c/c': 1200
    }
  },
  // 2. Spilerekkverk — modul-basert, ingen TEK17-fasit i formelen, med emnelengde i hovedresultatet
  {
    name: '2. Spilerekkverk: modul 130mm (30+100) → 63 spiler geometrisk, 67 à 1000mm i hovedresultatet',
    input: base('spiler', {}),
    expectedText: ['67 spiler à 1000 mm'],
    expected: {
      'Spiler — geometrisk (modul 130 mm)': 63 // ceil(8100/130)
    }
  },
  // 3. Liggende bord — enkel radberegning ut fra høyden
  {
    name: '3. Liggende bord: høyde 1000mm / dekkhøyde 95mm → 11 rader, 94,2 lm i hovedresultatet',
    input: base('liggende', {}),
    expectedText: ['94.2 lm rekkverksbord'],
    expected: {
      'Liggende bord — antall rader': 11, // ceil(1000/95)
      'Liggende bord — netto løpemeter': 88 // 11×8
    }
  },
  // 4. Tett rekkverk — samme preset-drevne lm/m²-prinsipp som Kledning
  {
    name: '4. Tett rekkverk: 8m×1m, 19×148 Dobbelfals (7,7 lm/m²) → 66,0 lm i hovedresultatet (ceil1)',
    input: base('tett', {}),
    expectedText: ['66 lm bord/kledning', '19×148 mm Dobbelfals — inkl. 7% svinn'],
    expected: {
      'Tett rekkverk — areal': 8,
      'Tett rekkverk — netto løpemeter': 61.6, // 8 × 7,7
      'Forbruk': 7.7
    }
  },
  // 5. Svinn er separat og redigerbart per materiale
  {
    name: '5. Endret svinn (spiler 20% i stedet for 5%) endrer hovedresultatets spilertall, ikke geometrien',
    input: base('spiler', { svinnSpiler: 20 }),
    expectedText: ['76 spiler à 1000 mm'], // ceil(63×1,2)
    expected: { 'Spiler — geometrisk (modul 130 mm)': 63 } // uendret
  },
  // 6. Handelslengde bruker ceil, tydelig merket som estimat, og ligger under Flere valg (0 = ikke vis)
  {
    name: '6. Handelslengde 4m for spiler (1m lange) → 4 spiler/bord, 16 handelslengder',
    input: base('spiler', { handelslengdeSpiler: 4 }),
    expected: { 'Spiler — estimert antall handelslengder': 16 } // ceil(63/4)
  },
  // 6b. Handelslengde for liggende bord
  {
    name: '6b. Handelslengde 4m for liggende bord',
    input: base('liggende', { handelslengdeBord: 4 }),
    expected: { 'Liggende bord — estimert antall handelslengder': 24 } // ceil(94,2/4)
  },
  // 6c. Handelslengde=0 som standard → ingen handelslengde-linje
  {
    name: '6c. Handelslengde=0 (standard) → ingen handelslengde-linje i resultatet',
    input: base('spiler', {}),
    expectMissing: ['Spiler — estimert antall handelslengder']
  },
  // 7. Ett strekk om gangen — to separate 5m-strekk (c/c 2000mm) skal hver
  // for seg gi 4 stolper (kjørt som to separate kalkulasjoner), IKKE
  // ceil(10000/2000)+antallStrekk=7 som den gamle, fjernede formelen ga.
  {
    name: '7. Ett strekk om gangen: 5m / c-c 2000mm → 4 stolper (kjør per strekk, ikke summert lengde)',
    input: base('spiler', { rekkverkslengde: 5, stolpeavstand: 2000 }),
    expectedText: ['4 stolper à 1.3 m'] // to slike strekk gir riktig 4+4=8 totalt
  },
  // 7b. Korrekt feltgeometri for spiler: N×B + (N−1)×G skal faktisk dekke feltet.
  // Med L=521mm, B=30mm, G=100mm (modul 130) gir den gamle ceil(L/modul)+1
  // feilaktig 6 spiler — riktig antall er 5 (ceil((521+100)/130)=5).
  {
    name: '7b. Korrekt spilegeometri (521mm felt) → 5 spiler, ikke 6 (gammel overtelling)',
    input: base('spiler', { rekkverkslengde: 0.521, svinnSpiler: 0 }),
    expected: { 'Spiler — geometrisk (modul 130 mm)': 5 }
  },
  // 8. Toppbord/håndløper og bunnrekke er uavhengige på/av-brytere (nå under Flere valg)
  {
    name: '8. Håndløper og bunnrekke av → ingen linjer, ingen toppbord-primærlinje',
    input: base('spiler', { beregnHandlop: false, beregnBunnrekke: false }),
    expectMissing: ['Toppbord/håndløper — netto', 'Bunnrekke — netto'],
    expectedTextMissing: ['8.4 lm toppbord']
  },
  // 8b. Festemidler er to separate grupper (materiale vs. stolper), ikke ett summert tall —
  // stolpeinnfesting er en annen vare enn spile-/bordfeste og skal ikke slås sammen.
  {
    name: '8b. To festemiddelgrupper: spile-/bordfester (materiale) og stolpeinnfestinger (separat)',
    input: base('spiler', {}),
    expectedText: ['ca. 186 spile-/bordfester', '8 stolpeinnfestinger']
  },
  // 8c. Uten topp-/bunnrekke → kun spiler-festene inngår i materialgruppen, stolpegruppen uendret
  {
    name: '8c. Uten topp-/bunnrekke → materialgruppen faller til kun spiler-feste (134), stolpegruppen uendret (8)',
    input: base('spiler', { beregnHandlop: false, beregnBunnrekke: false }),
    expectedText: ['ca. 134 spile-/bordfester', '8 stolpeinnfestinger']
  },
  // 9. Ugyldige mål
  { name: '9a. Ugyldig: rekkverkslengde=0', input: base('spiler', { rekkverkslengde: 0 }), expected: null },
  { name: '9b. Ugyldig: rekkverkshøyde=0', input: base('spiler', { rekkverkshoyde: 0 }), expected: null },
  { name: '9c. Ugyldig: negativ lengde', input: base('spiler', { rekkverkslengde: -8 }), expected: null },
  // 9d. Ugyldig: tett rekkverk med egendefinert profil uten lm/m²-verdi (samme validering som Kledning)
  { name: '9d. Ugyldig: tett rekkverk, egendefinert profil uten lm/m²-verdi', input: base('tett', { profilPreset: 'egendefinert', lmPerM2: 0 }), expected: null },
  // 10. Spiledimensjon-preset fyller inn spilebredde automatisk (uten manuell overstyring)
  {
    name: '10. Spiledimensjon-preset (36×48) uten manuell spilebredde-overstyring → modul 136mm',
    input: base('spiler', { spiledimensjon: '36x48', spilebredde: undefined }),
    expected: { 'Spiler — geometrisk (modul 136 mm)': 60 }
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
  (c.expectedTextMissing || []).forEach(function(text) {
    if (hasText(res, text)) {
      errors.push('  Forventet at teksten "' + text + '" IKKE skulle finnes, men den gjorde det');
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

// 11. Spiledimensjon-preset foreslår spilebredde (DOM-mock, samme mønster som Kledning sin profil-sync)
(function testSpileSync() {
  var name = '11. Spiledimensjon foreslår spilebredde (36×48 → 36, 48×48 → 48)';
  var fakeEls = { mc_spiledimensjon: { value: '36x48' }, mc_spilebredde: { value: '36' } };
  global.document = { getElementById: function(id) { return fakeEls[id]; } };
  global.$ = function() { return null; };
  _matCalcCurrent = 'rekkverk';

  fakeEls.mc_spiledimensjon.value = '48x48';
  onRekkverkSpileChange();
  var errors = [];
  if (Number(fakeEls.mc_spilebredde.value) !== 48) {
    errors.push('  Forventet spilebredde=48 for 48×48, fikk ' + fakeEls.mc_spilebredde.value);
  }
  fakeEls.mc_spiledimensjon.value = 'egendefinert';
  onRekkverkSpileChange();
  if (Number(fakeEls.mc_spilebredde.value) !== 48) {
    errors.push('  Forventet at spilebredde forblir uendret (48) ved «Annen/egendefinert», fikk ' + fakeEls.mc_spilebredde.value);
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

// 12. Rekkverk (tett) gjenbruker Kledning sin profil→lm/m²-sync (samme feltnavn, samme funksjon)
(function testTettProfilSync() {
  var name = '12. Rekkverk (tett) gjenbruker onKledningProfilChange for profilPreset→lmPerM2';
  var fakeEls = { mc_profilPreset: { value: 'dobbelfals_148' }, mc_lmPerM2: { value: '7.7' } };
  global.document = { getElementById: function(id) { return fakeEls[id]; } };
  global.$ = function() { return null; };
  _matCalcCurrent = 'rekkverk';

  fakeEls.mc_profilPreset.value = 'dobbelfals_98';
  onKledningProfilChange();
  var errors = [];
  if (Number(fakeEls.mc_lmPerM2.value) !== 12.5) {
    errors.push('  Forventet lm/m²=12.5 for 19×98 Dobbelfals, fikk ' + fakeEls.mc_lmPerM2.value);
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
