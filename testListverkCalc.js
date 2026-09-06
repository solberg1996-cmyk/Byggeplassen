// Tester for materialCalc.js sin Listverk-kalkulator (matCalcDefs.listverk)
// Bevisst holdt nøktern — kun fotlist og taklist, ingen hjørne-/kappoptimalisering.
// Kjør: node testListverkCalc.js

eval(require('fs').readFileSync('materialCalc.js', 'utf8'));

function run(v) {
  return matCalcDefs.listverk.calc(v);
}

function byLabel(results, label) {
  var hit = (results || []).filter(function(r) { return r.label === label; })[0];
  return hit ? hit.value : undefined;
}

function base(extra) {
  return Object.assign({
    romLengde: 5, romBredde: 4,
    beregnFotlist: true, fotlistProfil: '', fotlistHandelslengde: 0,
    dorapningBredde: 0,
    beregnTaklist: true, taklistProfil: '', taklistHandelslengde: 0,
    svinn: 10, inkluderFestemidler: false, festemidlerPerLm: 3
  }, extra);
}

var CASES = [
  // 1. Vanlig rektangulært rom — omkrets = 2×5 + 2×4 = 18 lm
  {
    name: '1. Rektangulært rom 5×4m, ingen døråpning → fotlist = taklist = 18 lm netto',
    input: base({}),
    expected: {
      'Fotlist — netto': 18,
      'Fotlist — bestilling inkl. svinn': 19.8, // faktisk beregnet mengde, IKKE avrundet til hele emner ennå
      'Taklist — netto': 18,
      'Taklist — bestilling inkl. svinn': 19.8
    }
  },
  // 2. Fotlist med døråpning — total bredde trekkes direkte fra, ikke antall × antatt bredde
  {
    name: '2. Døråpning 0,9m bred → fotlist netto 17,1 lm (18 − 0,9)',
    input: base({ dorapningBredde: 0.9 }),
    expected: { 'Fotlist — netto': 17.1, 'Fotlist — bestilling inkl. svinn': 18.9 } // 17,1×1,10=18,81 → ceil1
  },
  // 3. Taklist påvirkes IKKE av døråpning
  {
    name: '3. Taklist uendret av døråpning (fortsatt 18 lm netto)',
    input: base({ dorapningBredde: 0.9 }),
    expected: { 'Taklist — netto': 18, 'Taklist — bestilling inkl. svinn': 19.8 }
  },
  // 4. Fotlist og taklist samtidig — begge beregnes uavhengig i samme kjøring
  {
    name: '4. Fotlist og taklist samtidig, begge til stede i resultatet',
    input: base({ dorapningBredde: 0.9 }),
    expected: {
      'Fotlist — netto': 17.1,
      'Taklist — netto': 18
    }
  },
  // 5. 0% svinn → netto = bestilling
  {
    name: '5. 0% svinn gir netto = bestilling for begge',
    input: base({ svinn: 0 }),
    expected: { 'Fotlist — bestilling inkl. svinn': 18, 'Taklist — bestilling inkl. svinn': 18 }
  },
  // 6. Svinnpåslag endrer bestillingsmengden
  {
    name: '6. 15% svinn gir høyere bestillingsmengde enn 10%',
    input: base({ svinn: 15 }),
    expected: { 'Taklist — bestilling inkl. svinn': 20.7 } // 18×1,15, IKKE avrundet til heltall
  },
  // 7. Handelslengde bruker ceil KUN på antall handelslengder, ikke på selve lm-mengden
  {
    name: '7. Handelslengde 4,4m → bestilling 19,0 lm (ceil1), 5 stk (ceil, grovt estimat)',
    input: base({ dorapningBredde: 0.8, fotlistHandelslengde: 4.4 }),
    expected: {
      'Fotlist — netto': 17.2,
      'Fotlist — bestilling inkl. svinn': 19, // 17,2×1,10=18,92 → ceil1 = 19,0
      'Fotlist — estimert antall handelslengder': 5 // ceil(19/4,4)
    }
  },
  // 8. calcFotlist() gir samme resultat i Gulv og Listverk (delt formel, ikke duplisert)
  {
    name: '8. calcFotlist() er identisk mellom Gulv og Listverk for samme input',
    input: null,
    customCheck: function() {
      var omkrets = 18, dorApning = 0.9, svinn = 10;
      var direkte = calcFotlist(omkrets, dorApning, svinn).bestilling;
      var listverkResultat = byLabel(run(base({ dorapningBredde: dorApning, svinn: svinn })), 'Fotlist — bestilling inkl. svinn');
      var gulvResultat = byLabel(matCalcDefs.gulv.calc({
        lengde: 5, bredde: 4, gulvtype: 'parkett', leggemonster: 'rett', bordbredde: 120,
        m2perPakke: 2.4, svinn: 7, inkluderUnderlag: false, svinnUnderlag: 5, underlagM2perPakke: 10,
        inkluderFuktsperre: false, svinnFuktsperre: 15, inkluderFotlist: true, dorapningBredde: dorApning
      }), 'Fotlister (valgfritt)');
      // NB: Gulv bruker sin egen svinn (7%) til fotlist, så vi sammenligner mot en direkte calcFotlist-kjøring med samme %.
      var gulvDirekte = calcFotlist(omkrets, dorApning, 7).bestilling;
      return direkte === listverkResultat && gulvResultat === gulvDirekte;
    }
  },
  // 9. Ugyldige mål
  { name: '9a. Ugyldig: romlengde=0', input: base({ romLengde: 0 }), expected: null },
  { name: '9b. Ugyldig: negativ rombredde', input: base({ romBredde: -4 }), expected: null }
];

var ok = 0;
var fail = 0;

CASES.forEach(function(c) {
  if (c.customCheck) {
    var passed = c.customCheck();
    if (passed) {
      console.log('✓ ' + c.name);
      ok++;
    } else {
      console.log('✗ ' + c.name);
      fail++;
    }
    return;
  }

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

  if (errors.length === 0) {
    console.log('✓ ' + c.name);
    ok++;
  } else {
    console.log('✗ ' + c.name);
    errors.forEach(function(e) { console.log(e); });
    fail++;
  }
});

console.log('\n' + ok + ' OK, ' + fail + ' FEIL');
process.exit(fail > 0 ? 1 : 0);
