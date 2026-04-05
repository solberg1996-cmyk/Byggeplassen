// Testcases verifisert mot Blocklayer rafter calculator
// Kjør: node testRafterCalc.js

eval(require('fs').readFileSync('rafterCalc.js', 'utf8'));

var CASES = [
  // Fra Blocklayer-screenshot (brukerverifisert)
  {
    input: { run: 3000, takvinkel: 30, utstikk: 350, sperrehoyde: 198, fuglehakkBredde: 98 },
    expected: {
      sperreTopLengde: 3868, sperreTotalLengde: 3983, loddskjaerSetback: 114,
      kuttlengde: 229, fuglehakkDybde: 57, rise: 1904, hap: 172,
      totalRun: 3350, totalFall: 1934, utstikkLangsSperre: 404
    }
  },
  // Standardverdier (run=3000, vinkel=30, utstikk=300, depth=198, seat=100)
  {
    input: { run: 3000, takvinkel: 30, utstikk: 300, sperrehoyde: 198, fuglehakkBredde: 100 },
    expected: {
      sperreTopLengde: 3811, sperreTotalLengde: 3925, loddskjaerSetback: 114,
      kuttlengde: 229, fuglehakkDybde: 58, rise: 1903, hap: 171,
      totalRun: 3300, totalFall: 1905, utstikkLangsSperre: 346
    }
  },
  // Bratt tak (45°)
  {
    input: { run: 2500, takvinkel: 45, utstikk: 400, sperrehoyde: 198, fuglehakkBredde: 100 },
    expected: {
      sperreTopLengde: 4101, sperreTotalLengde: 4299, loddskjaerSetback: 198,
      kuttlengde: 280, fuglehakkDybde: 100, rise: 2680, hap: 180,
      totalRun: 2900, totalFall: 2900, utstikkLangsSperre: 566
    }
  },
  // Slakt tak (15°)
  {
    input: { run: 4000, takvinkel: 15, utstikk: 300, sperrehoyde: 148, fuglehakkBredde: 100 },
    expected: {
      sperreTopLengde: 4452, sperreTotalLengde: 4491, loddskjaerSetback: 40,
      kuttlengde: 153, fuglehakkDybde: 27, rise: 1198, hap: 126,
      totalRun: 4300, totalFall: 1152, utstikkLangsSperre: 311
    }
  },
  // Liten sperre (98mm stender)
  {
    input: { run: 2000, takvinkel: 22, utstikk: 250, sperrehoyde: 98, fuglehakkBredde: 70 },
    expected: {
      sperreTopLengde: 2427, sperreTotalLengde: 2466, loddskjaerSetback: 40,
      kuttlengde: 106, fuglehakkDybde: 28, rise: 885, hap: 77,
      totalRun: 2250, totalFall: 909, utstikkLangsSperre: 270
    }
  },
  // Bred sperre (248mm)
  {
    input: { run: 3500, takvinkel: 35, utstikk: 500, sperrehoyde: 248, fuglehakkBredde: 120 },
    expected: {
      sperreTopLengde: 4883, sperreTotalLengde: 5057, loddskjaerSetback: 174,
      kuttlengde: 303, fuglehakkDybde: 84, rise: 2669, hap: 219,
      totalRun: 4000, totalFall: 2801, utstikkLangsSperre: 610
    }
  },
  // Ugyldig input — skal gi gyldig=false
  {
    input: { run: 0, takvinkel: 30 },
    expected: { gyldig: false }
  },
  {
    input: { run: 3000, takvinkel: 0 },
    expected: { gyldig: false }
  },
  {
    input: { run: 3000, takvinkel: 90 },
    expected: { gyldig: false }
  }
];

var ok = 0;
var fail = 0;

CASES.forEach(function(c, i) {
  var res = beregnTaksperre(c.input);
  var errors = [];

  Object.keys(c.expected).forEach(function(key) {
    var exp = c.expected[key];
    var got = res[key];
    if (exp !== got) {
      errors.push('  ' + key + ': forventet ' + exp + ', fikk ' + got);
    }
  });

  var label = 'Case ' + (i + 1) + ' (vinkel=' + c.input.takvinkel + ', run=' + c.input.run + ')';
  if (errors.length === 0) {
    console.log('✓ ' + label);
    ok++;
  } else {
    console.log('✗ ' + label);
    errors.forEach(function(e) { console.log(e); });
    fail++;
  }
});

console.log('\n' + ok + ' OK, ' + fail + ' FEIL');
process.exit(fail > 0 ? 1 : 0);
