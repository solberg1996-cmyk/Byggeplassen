// Tester for materialCalc.js sin Vindu/dør-kalkulator (matCalcDefs.vindu)
// UX-forenklet etter samme mønster som Kledning/Rekkverk: kompakt
// primærresultat (foring/gerikt/vindusbrett/tetting/karmfester) + detaljer
// bak "Vis beregningsdetaljer". Ingen kappoptimalisering, ingen åpnings-/
// karmklaring-, losholt-, bærebjelke- eller brann-/lydberegning.
// Kjør: node testVinduCalc.js

eval(require('fs').readFileSync('materialCalc.js', 'utf8'));

function run(v) {
  return matCalcDefs.vindu.calc(v);
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
    jobb: jobb, bredde: 1200, hoyde: 1200, antall: 2,
    foring: '3', gerikt: '3', svinnForing: 10, svinnGerikt: 5,
    foringsbredde: '', geriktProfil: '', handelslengdeForing: 0, handelslengdeGerikt: 0,
    utvendigOmramming: 'ingen', svinnUtvendig: 10, beregnTetting: true, karmfestemidlerPerEnhet: 6
  };
  if (jobb === 'vindu') Object.assign(b, { vindusbrett: false, vindusbrettSideutstikk: 20 });
  return Object.assign(b, extra);
}

var CASES = [
  // 1. Vindu, 4 sider foring/gerikt — full omkrets 2×H+2×B
  {
    name: '1. Vindu 4 sider: 1200×1200mm, 2 stk → foring/gerikt bruker full omkrets (2H+2B)',
    input: base('vindu', { foring: '4', gerikt: '4' }),
    expectedText: ['2 stk vinduer 1200×1200', '10.6 lm foring', '10.1 lm gerikt'],
    expected: {
      'Foring — netto løpemeter': 9.6, // (2×1200+2×1200)/1000 × 2
      'Gerikt — netto løpemeter': 9.6
    }
  },
  // 2. Vindu, 3 sider (vindusbrett dekker bunnen) — omkrets 2×H+B
  {
    name: '2. Vindu 3 sider: 1200×1200mm, 2 stk → foring/gerikt bruker 2H+B',
    input: base('vindu', {}),
    expectedText: ['8 lm foring', '7.6 lm gerikt'], // 7,2×1,10=7,92 → ceil1 = 8,0
    expected: {
      'Foring — netto løpemeter': 7.2, // (2×1200+1200)/1000 × 2
      'Gerikt — netto løpemeter': 7.2
    }
  },
  // 3. Dør, 3 sider (ingen foring/gerikt mot gulv)
  {
    name: '3. Dør 3 sider: samme formel som vindu 3 sider, kun forskjellig enhetsnavn i hovedresultatet',
    input: base('dor', {}),
    expectedText: ['2 stk dører 1200×1200', '8 lm foring', '7.6 lm gerikt'],
    expected: { 'Foring — netto løpemeter': 7.2 }
  },
  // 4. Flere enheter — antall multipliserer omkretsen lineært
  {
    name: '4. Flere enheter: 5 vinduer 3 sider → 5× enhetsomkretsen',
    input: base('vindu', { antall: 5 }),
    expected: { 'Foring — netto løpemeter': 18 } // (2×1200+1200)/1000 × 5 = 3,6×5
  },
  // 5. Gerikt av → ingen gerikt-linje, foring upåvirket
  {
    name: '5. Gerikt = Ingen → ingen gerikt-primærlinje eller detalj',
    input: base('vindu', { antall: 1, gerikt: 'ingen' }),
    expectedText: ['4 lm foring'],
    expectedTextMissing: ['gerikt'],
    expectMissing: ['Gerikt — netto løpemeter']
  },
  // 6. Foring av → ingen foring-linje, gerikt upåvirket
  {
    name: '6. Foring = Ingen → ingen foring-primærlinje eller detalj',
    input: base('vindu', { antall: 1, foring: 'ingen' }),
    expectedText: ['3.8 lm gerikt'],
    expectMissing: ['Foring — netto løpemeter']
  },
  // 7. Vindusbrett — "antall à lengde", ikke bare total lm
  {
    name: '7. Vindusbrett aktivert: bredde 1200mm + 2×20mm sideutstikk → 2 stk à 1240 mm',
    input: base('vindu', { vindusbrett: true }),
    expectedText: ['2 vindusbrett à 1240 mm'],
    expected: { 'Vindusbrett — total løpemeter': 2.5 }
  },
  // 7b. Vindusbrett er kun for Vindu, ikke Dør
  {
    name: '7b. Vindusbrett-feltet finnes ikke for Dør (jobFields.dor er tom)',
    input: base('dor', {}),
    expectedTextMissing: ['vindusbrett']
  },
  // 8. Tetting rundt karm — alltid full omkrets (2H+2B), uavhengig av foring/gerikt-valg, ingen svinn
  {
    name: '8. Tetting rundt karm: full omkrets uansett foring/gerikt-valg (3 sider), ingen svinn',
    input: base('vindu', { antall: 1 }),
    expectedText: ['4.8 lm tetting rundt karm'] // (2×1200+2×1200)/1000 × 1, ingen svinn
  },
  // 8b. Tetting kan slås av under Flere valg
  {
    name: '8b. Tetting av → ingen tetting-linje',
    input: base('vindu', { antall: 1, beregnTetting: false }),
    expectedTextMissing: ['tetting rundt karm']
  },
  // 9. Svinn er separat og redigerbart for foring/gerikt
  {
    name: '9. Ulik svinn på foring (10%) og gerikt (5%) gir ulikt resultat fra samme netto-omkrets',
    input: base('vindu', { antall: 1 }),
    expectedText: ['4 lm foring', '3.8 lm gerikt'] // 3,6×1,10=3,96→4,0 vs 3,6×1,05=3,78→3,8
  },
  // 10. Karmfestemidler — redigerbart preset, skjules ved 0
  {
    name: '10a. Karmfestemidler = 6 per enhet × 2 stk → 12',
    input: base('vindu', {}),
    expectedText: ['ca. 12 karmfestemidler']
  },
  {
    name: '10b. Karmfestemidler = 0 → linjen skjules helt',
    input: base('vindu', { karmfestemidlerPerEnhet: 0 }),
    expectedTextMissing: ['karmfestemidler']
  },
  // 11. Handelslengde ligger under Flere valg, kun synlig i detaljene når satt
  {
    name: '11. Handelslengde foring 2m → estimert antall handelslengder i detaljene, ikke i hovedresultatet',
    input: base('vindu', { handelslengdeForing: 2 }),
    expected: { 'Foring — estimert antall handelslengder': 4 } // ceil(7,9/2)
  },
  // 12. Ugyldige mål
  { name: '12a. Ugyldig: bredde=0', input: base('vindu', { bredde: 0 }), expected: null },
  { name: '12b. Ugyldig: høyde=0', input: base('vindu', { hoyde: 0 }), expected: null },
  { name: '12c. Ugyldig: antall=0', input: base('vindu', { antall: 0 }), expected: null }
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

console.log('\n' + ok + ' OK, ' + fail + ' FEIL');
process.exit(fail > 0 ? 1 : 0);
