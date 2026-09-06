// Tester for materialCalc.js sin Lekter/sløyfer-kalkulator (matCalcDefs.lekter)
// Bevarer bransjestandard lm = areal × 1000/c-c. Kjør: node testLekterCalc.js

eval(require('fs').readFileSync('materialCalc.js', 'utf8'));

function run(v) {
  return matCalcDefs.lekter.calc(v);
}

function byLabel(results, label) {
  var hit = (results || []).filter(function(r) { return r.label === label; })[0];
  return hit ? hit.value : undefined;
}

function base(jobb, extra) {
  return Object.assign({
    jobb: jobb, areal: 50, dim: '23x48', behandling: 'ubehandlet', cc: '600',
    bordlengde: '4', svinn: 10, festemidlerPerM2: 8
  }, extra);
}

var CASES = [
  // 1. Kjerneformelen bevart: lm = areal × 1000/c-c
  {
    name: '1. Sløyfer, 50m² / c-c 600 → 50×(1000/600) netto lm',
    input: base('sloeyfe', {}),
    expected: {
      'Lekt/sløyfe — netto løpemeter': 83.3,
      'Lekt/sløyfe — bestilling inkl. svinn': 91.7,
      'Dimensjon': '23x48',
      'Behandling': 'Ubehandlet'
    }
  },
  // 2. Utlekting vegg med annen c/c
  {
    name: '2. Utlekting vegg, c-c 400 → 50×(1000/400) = 125 lm netto',
    input: base('lekt_vegg', { dim: '36x48', cc: '400' }),
    expected: { 'Lekt/sløyfe — netto løpemeter': 125 }
  },
  // 3. Taklekter — eget bruksområde, egen forhåndsvalgt dimensjon/behandling
  {
    name: '3. Taklekter — forhåndsvalgt 30x48/impregnert (overstyrbart)',
    input: base('lekt_tak', { dim: '30x48', behandling: 'impregnert' }),
    expected: { 'Dimensjon': '30x48', 'Behandling': 'Trykkimpregnert' }
  },
  // 4. Krysslekting med ULIK c/c per lag — beregnes separat og summeres
  {
    name: '4. Krysslekting, lag 1 c-c 600 + lag 2 c-c 400 → separat sum',
    input: base('krysslekt', { cc: '600', cc2: '400' }),
    expected: { 'Lekt/sløyfe — netto løpemeter': 208.3 } // 50×(1000/600) + 50×(1000/400)
  },
  // 4b. Krysslekting med SAMME c/c på begge lag (referanse, tilsvarer gammel ×2-logikk)
  {
    name: '4b. Krysslekting, samme c-c 600 på begge lag',
    input: base('krysslekt', { cc: '600', cc2: '600' }),
    expected: { 'Lekt/sløyfe — netto løpemeter': 166.7 } // 2 × 83,3
  },
  // 5. Estimert antall handelslengder, tydelig merket som estimat
  {
    name: '5. Handelslengde valgt → estimert antall, merket "ikke kappplan"',
    input: base('sloeyfe', { bordlengde: '4' }),
    expected: { 'Estimert antall handelslengder (4 m)': 23 }
  },
  // 6. Ingen handelslengde valgt → ingen estimat-linje
  {
    name: '6. Handelslengde "Ikke valgt" (0) → ingen estimatlinje',
    input: base('sloeyfe', { bordlengde: '0' }),
    expectMissing: ['Estimert antall handelslengder (4 m)']
  },
  // 7. Festemidler er et enkelt, redigerbart preset — ikke komplisert
  {
    name: '7. Festemiddelpreset 8/m² gir estimert behov = areal × preset',
    input: base('sloeyfe', { festemidlerPerM2: 8 }),
    expected: { 'Estimert festemiddelbehov (8/m²)': 400 } // 50×8
  },
  {
    name: '7b. Endret festemiddelpreset (12/m²) endrer resultatet direkte',
    input: base('sloeyfe', { festemidlerPerM2: 12 }),
    expected: { 'Estimert festemiddelbehov (12/m²)': 600 }
  },
  // 8. Ugyldig areal
  { name: '8. Ugyldig: areal=0', input: base('sloeyfe', { areal: 0 }), expected: null },
  { name: '8b. Ugyldig: negativt areal', input: base('sloeyfe', { areal: -10 }), expected: null }
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
