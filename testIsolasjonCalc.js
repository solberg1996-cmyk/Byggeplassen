// Tester for materialCalc.js sin Isolasjon-kalkulator (matCalcDefs.isolasjon)
// Bevisst holdt enkel — bransjestandard netto areal × (1 + svinn), ingen
// avansert geometri. Kjør: node testIsolasjonCalc.js

eval(require('fs').readFileSync('materialCalc.js', 'utf8'));

function run(v) {
  return matCalcDefs.isolasjon.calc(v);
}

function byLabel(results, label) {
  var hit = (results || []).filter(function(r) { return r.label === label; })[0];
  return hit ? hit.value : undefined;
}

function base(jobb, extra) {
  return Object.assign({
    jobb: jobb, areal: 52, isolasjonstype: 'mineralull', tykkelse: 150,
    m2perPakke: 5.76, svinn: 5, beregnVindsperre: false, beregnDampsperre: false,
    vindsperreSvinn: 10, vindsperreRullM2: 37.5, dampsperreSvinn: 15
  }, extra);
}

var CASES = [
  // 1. Hovedeksempel — netto/bestilling/pakker skal matche referanseeksempelet nøyaktig
  {
    name: '1. Areal 52m², 5% svinn, 5,76 m²/pk → 52 / 54,6 / 10 pakker',
    input: base('vegg', {}),
    expected: {
      'Isolasjon — netto behov': 52,
      'Isolasjon — bestilling inkl. svinn': 54.6,
      'Pakningsinnhold': 5.76,
      'Bestilling': 10,
      'Valgt tykkelse': 150,
      'Isolasjonstype': 'Mineralull'
    }
  },
  // 2. Pakkeavrunding skal bruke ceil (5,46 pakker → 6, ikke 5)
  {
    name: '2. Pakkeavrunding runder OPP (31,5/5,76 = 5,47 → 6 pakker)',
    input: base('vegg', { areal: 30 }),
    expected: { 'Isolasjon — bestilling inkl. svinn': 31.5, 'Bestilling': 6 }
  },
  // 3. 0% svinn → netto og bestilling er identiske
  {
    name: '3. 0% svinn gir netto = bestilling',
    input: base('vegg', { areal: 30, svinn: 0 }),
    expected: { 'Isolasjon — netto behov': 30, 'Isolasjon — bestilling inkl. svinn': 30 }
  },
  // 4. Ulik pakningsstørrelse gir ulikt antall pakker
  {
    name: '4. Mindre pakke (3,6 m²/pk i stedet for 5,76) gir flere pakker',
    input: base('vegg', { areal: 30, m2perPakke: 3.6 }),
    expected: { 'Bestilling': 9 } // ceil(31,5/3,6)
  },
  // 5. De fire bruksområdene fungerer og gir riktig forhåndsvalgt type
  {
    name: '5a. Vegg — mineralull',
    input: base('vegg', {}),
    expected: { 'Isolasjonstype': 'Mineralull' }
  },
  {
    name: '5b. Tak/himling — mineralull',
    input: base('tak', { tykkelse: 200 }),
    expected: { 'Isolasjonstype': 'Mineralull' }
  },
  {
    name: '5c. Etasjeskille/bjelkelag — mineralull',
    input: base('bjelkelag', { tykkelse: 200 }),
    expected: { 'Isolasjonstype': 'Mineralull' }
  },
  {
    name: '5d. Gulv mot grunn — forhåndsvalgt trykkfast plate (ikke automatisk "riktig")',
    input: base('grunn', { isolasjonstype: 'trykkfast', tykkelse: 100 }),
    expected: { 'Isolasjonstype': 'Trykkfast plate' }
  },
  // 6. Vindsperre/dampsperre er valgfritt, av som standard
  {
    name: '6a. Vindsperre av som standard → ingen linje',
    input: base('vegg', { beregnVindsperre: false }),
    expectMissing: ['Vindsperre (valgfritt)']
  },
  {
    name: '6b. Vindsperre eksplisitt aktivert → egen linje',
    input: base('vegg', { areal: 20, beregnVindsperre: true }),
    expected: { 'Vindsperre (valgfritt)': 22 } // ceil(20×1,1)
  },
  {
    name: '6c. Dampsperre av som standard (tak) → ingen linje',
    input: base('tak', { tykkelse: 200, beregnDampsperre: false }),
    expectMissing: ['Dampsperre (valgfritt)']
  },
  // 6d. Vindsperre-svinn og rullstørrelse er redigerbare felt, ikke skjulte
  // konstanter — 20% svinn og 20 m²/rull skal faktisk endre resultatet
  {
    name: '6d. Vindsperre-svinn (20% i stedet for 10%) endrer resultatet',
    input: base('vegg', { areal: 20, beregnVindsperre: true, vindsperreSvinn: 20 }),
    expected: { 'Vindsperre (valgfritt)': 24 } // ceil(20×1,2)
  },
  {
    name: '6e. Vindsperre-rullstørrelse (20 m²/rull i stedet for 37,5) endrer rulltallet',
    input: base('vegg', { areal: 20, beregnVindsperre: true, vindsperreRullM2: 20 }),
    expected: { 'Vindsperreruller (valgfritt)': 2 } // ceil(22/20)
  },
  {
    name: '6f. Dampsperre-svinn (25% i stedet for 15%) endrer resultatet',
    input: base('tak', { tykkelse: 200, areal: 20, beregnDampsperre: true, dampsperreSvinn: 25 }),
    expected: { 'Dampsperre (valgfritt)': 25 } // ceil(20×1,25)
  },
  // 7. m²/pk = 0 skjuler pakkelinjene helt (ingen tvungen pakkeberegning)
  {
    name: '7. m²/pk satt til 0 → ingen pakningslinjer vises',
    input: base('vegg', { m2perPakke: 0 }),
    expectMissing: ['Pakningsinnhold', 'Bestilling']
  },
  // 8. Ugyldige verdier
  { name: '8a. Ugyldig: areal=0', input: base('vegg', { areal: 0 }), expected: null },
  { name: '8b. Ugyldig: negativt areal', input: base('vegg', { areal: -10 }), expected: null }
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
