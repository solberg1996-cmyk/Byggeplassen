// ── Gavlstender-kalkulator: Verifisering mot Blocklayer ────────
// Kjør: node testGavlCalc.js
//
// Sammenligner vår gavlCalc.js mot en emulert versjon av
// Blocklayers GableStuds_V2.js for eksakt paritet.

eval(require('fs').readFileSync('gavlCalc.js', 'utf8'));

// ── Blocklayer-emulator ────────────────────────────────────────
// Direkte oversettelse av Blocklayers BL_Calculate(), med
// minimale forenklinger for testbarhet.

function blCalc(opts) {
  var angleDeg = opts.angleDeg;
  var spacing = opts.spacing || 600;
  var studWidth = opts.studWidth || 48;
  var lengthLevel = opts.lengthLevel || 5000;
  var startHeight = opts.startHeight;
  var plateThick = opts.plateThick || 48;
  var topPlateCount = opts.topPlateCount || 1;
  var toSide = opts.measurePoint || 'centre';
  var adjustFirst = !!opts.alignSheets;
  var ddStart = 0;
  if (opts.startMode === 'double') ddStart = 1;
  else if (opts.startMode === 'doubleGap') ddStart = 2;
  var startIn = opts.startIn || 0;

  var rangle = angleDeg * Math.PI / 180;
  var g = Math.tan(rangle);
  var k = Math.cos(rangle);
  var e = plateThick / k;
  var v = startHeight - plateThick - e * topPlateCount;
  var f = ddStart;
  var p = startIn;

  var x = 0, y = 0;
  if (toSide === 'near') { x = studWidth; y = studWidth / k; }
  else if (toSide === 'centre') { x = studWidth / 2; y = studWidth / 2 / k; }

  var b = studWidth + p;
  var aStuds = [];

  while (b < lengthLevel - 0.001) {
    var h, pos;
    if (b < lengthLevel - studWidth) {
      pos = b;
      h = v + g * b;
    } else {
      pos = lengthLevel - studWidth;
      h = v + g * pos;
    }
    var ra = Math.round(pos / k);
    aStuds.push({ length: Math.round(h), runLevel: Math.round(pos - x), runAngle: Math.round(ra - y) });

    if (b === studWidth + p && f > 0) {
      var dp = b + studWidth * f;
      var hd = v + g * dp;
      var rad = Math.round(dp / k);
      aStuds.push({ length: Math.round(hd), runLevel: Math.round(dp - x), runAngle: Math.round(rad - y) });
    }

    if (b < spacing && adjustFirst) {
      b = b + (spacing - studWidth / 2);
    } else {
      b = b + spacing;
    }
  }

  var hLast = v + g * lengthLevel;
  var raLast = Math.round(lengthLevel / k);
  aStuds.push({ length: Math.round(hLast), runLevel: Math.round(lengthLevel - x), runAngle: Math.round(raLast - y) });

  aStuds.forEach(function(s, i) { s.nr = i + 1; });
  return aStuds;
}


// ── Testcases ──────────────────────────────────────────────────

var CASES = [
  // ── Vinkelmatrise: 15°, 30°, 45° ────────────────────────────

  {
    navn: '15° centre 1plate 5000mm',
    input: { angleDeg: 15, startHeight: 2400, lengthLevel: 5000 }
  },
  {
    navn: '30° centre 1plate 5000mm',
    input: { angleDeg: 30, startHeight: 2400, lengthLevel: 5000 }
  },
  {
    navn: '45° centre 1plate 5000mm',
    input: { angleDeg: 45, startHeight: 2400, lengthLevel: 5000 }
  },

  // ── 2 topplemmer + near side ─────────────────────────────────

  {
    navn: '30° near 2plates 5000mm',
    input: { angleDeg: 30, startHeight: 2400, lengthLevel: 5000, topPlateCount: 2, measurePoint: 'near' }
  },

  // ── Far side ─────────────────────────────────────────────────

  {
    navn: '30° far 1plate 5000mm',
    input: { angleDeg: 30, startHeight: 2400, lengthLevel: 5000, measurePoint: 'far' }
  },

  // ── Kortere vegg (færre stendere) ───────────────────────────

  {
    navn: '30° centre 1plate 3600mm',
    input: { angleDeg: 30, startHeight: 2400, lengthLevel: 3600 }
  },

  // ── AlignSheets ──────────────────────────────────────────────

  {
    navn: '30° alignSheets centre 5000mm',
    input: { angleDeg: 30, startHeight: 2400, lengthLevel: 5000, alignSheets: true }
  },

  // ── Double stud ──────────────────────────────────────────────

  {
    navn: '30° double centre 5000mm',
    input: { angleDeg: 30, startHeight: 2400, lengthLevel: 5000, startMode: 'double' }
  },

  // ── Edge case: lengthLevel nær eksakt spacing-multippel ──────

  {
    navn: '30° centre 1plate 1248mm (eksakt 2 stendere + final)',
    input: { angleDeg: 30, startHeight: 2400, lengthLevel: 1248 }
  },

  // ── Edge case: klamp-triggering ──────────────────────────────

  {
    navn: '30° centre 1plate 3090mm (near-end clamp)',
    input: { angleDeg: 30, startHeight: 2400, lengthLevel: 3090 }
  },

  // ── Edge case: kort vegg, kun 1 stender + final ──────────────

  {
    navn: '30° centre 1plate 600mm',
    input: { angleDeg: 30, startHeight: 2400, lengthLevel: 600 }
  },

  // ── Ugyldig input ────────────────────────────────────────────

  {
    navn: 'vinkel 0 → ugyldig',
    input: { angleDeg: 0, startHeight: 2400, lengthLevel: 5000 },
    expectInvalid: true
  },
  {
    navn: 'vinkel 90 → ugyldig',
    input: { angleDeg: 90, startHeight: 2400, lengthLevel: 5000 },
    expectInvalid: true
  },
  {
    navn: 'negativ vinkel → ugyldig',
    input: { angleDeg: -15, startHeight: 2400, lengthLevel: 5000 },
    expectInvalid: true
  }
];


// ── Kjøring ────────────────────────────────────────────────────

var totalOk = 0;
var totalFail = 0;

console.log('══════════════════════════════════════════════════════');
console.log('  Gavlstender-kalkulator: Verifisering mot Blocklayer');
console.log('══════════════════════════════════════════════════════\n');

CASES.forEach(function(c) {
  // Vår kalkulator
  var res = beregnGavlStendere(c.input);

  if (c.expectInvalid) {
    if (!res.gyldig) {
      console.log('\u2713 ' + c.navn);
      totalOk++;
    } else {
      console.log('\u2717 ' + c.navn + ' — forventet ugyldig, fikk gyldig');
      totalFail++;
    }
    return;
  }

  if (!res.gyldig) {
    console.log('\u2717 ' + c.navn + ' — vår kalkulator returnerte ugyldig');
    totalFail++;
    return;
  }

  // Blocklayer-emulator
  var blStuds = blCalc(c.input);

  // Sammenlign
  var errors = [];

  if (res.stendere.length !== blStuds.length) {
    errors.push('  antall: BL=' + blStuds.length + ' vår=' + res.stendere.length);
  }

  var count = Math.min(res.stendere.length, blStuds.length);
  for (var i = 0; i < count; i++) {
    var bl = blStuds[i];
    var vr = res.stendere[i];

    if (vr.lengdeLangside !== bl.length) {
      errors.push('  #' + (i + 1) + ' lengde: BL=' + bl.length + ' vår=' + vr.lengdeLangside);
    }
    if (vr.runLevel !== bl.runLevel) {
      errors.push('  #' + (i + 1) + ' runLevel: BL=' + bl.runLevel + ' vår=' + vr.runLevel);
    }
    if (vr.runAngle !== bl.runAngle) {
      errors.push('  #' + (i + 1) + ' runAngle: BL=' + bl.runAngle + ' vår=' + vr.runAngle);
    }
  }

  if (errors.length === 0) {
    console.log('\u2713 ' + c.navn + ' (' + res.stendere.length + ' stendere — MATCH)');
    totalOk++;
  } else {
    console.log('\u2717 ' + c.navn);
    errors.forEach(function(e) { console.log(e); });
    totalFail++;
  }
});


// ── Pitch-konvertering ─────────────────────────────────────────

console.log('\n── Pitch-konvertering ──');

var pitchCases = [
  { pitch: 12, forventet: 45 },
  { pitch: 6, forventet: 26.6 },
  { pitch: 4, forventet: 18.4 }
];

pitchCases.forEach(function(c) {
  var got = Math.round(pitchTilGrader(c.pitch) * 10) / 10;
  if (got === c.forventet) {
    console.log('\u2713 pitch ' + c.pitch + ':12 = ' + got + '\u00b0');
    totalOk++;
  } else {
    console.log('\u2717 pitch ' + c.pitch + ':12: forventet ' + c.forventet + ', fikk ' + got);
    totalFail++;
  }
});

var rt = graderTilPitch(pitchTilGrader(7));
if (Math.abs(rt - 7) < 0.001) {
  console.log('\u2713 roundtrip pitch 7 → vinkel → pitch = ' + rt.toFixed(3));
  totalOk++;
} else {
  console.log('\u2717 roundtrip feilet: ' + rt);
  totalFail++;
}


// ── Verifikasjonstabell ────────────────────────────────────────

console.log('\n══════════════════════════════════════════════════════');
console.log('  Detaljert verifikasjonstabell (3 hovedcaser)');
console.log('══════════════════════════════════════════════════════\n');

var detailCases = [
  { navn: '30° single centre 1plate', input: { angleDeg: 30, startHeight: 2400, lengthLevel: 5000 } },
  { navn: '45° single centre 1plate', input: { angleDeg: 45, startHeight: 2400, lengthLevel: 5000 } },
  { navn: '30° near 2plates',         input: { angleDeg: 30, startHeight: 2400, lengthLevel: 5000, topPlateCount: 2, measurePoint: 'near' } }
];

detailCases.forEach(function(c) {
  var res = beregnGavlStendere(c.input);
  var blStuds = blCalc(c.input);

  console.log('── ' + c.navn + ' ──');
  console.log(padR('Nr', 4) + padR('BL len', 8) + padR('Vår len', 8) + padR('BL run', 8) + padR('Vår run', 8) + padR('BL rAng', 8) + padR('Vår rAng', 9) + 'Status');
  console.log('-'.repeat(61));

  var count = Math.max(res.stendere.length, blStuds.length);
  for (var i = 0; i < count; i++) {
    var bl = blStuds[i] || { length: '-', runLevel: '-', runAngle: '-' };
    var vr = res.stendere[i] || { lengdeLangside: '-', runLevel: '-', runAngle: '-' };

    var match = (vr.lengdeLangside === bl.length && vr.runLevel === bl.runLevel && vr.runAngle === bl.runAngle);
    console.log(
      padR('#' + (i + 1), 4) +
      padR(bl.length, 8) +
      padR(vr.lengdeLangside, 8) +
      padR(bl.runLevel, 8) +
      padR(vr.runLevel, 8) +
      padR(bl.runAngle, 8) +
      padR(vr.runAngle, 9) +
      (match ? 'MATCH' : 'FAIL')
    );
  }
  console.log('');
});


// ── Resultat ───────────────────────────────────────────────────

console.log('══════════════════════════════════════════════════════');
console.log('  ' + totalOk + ' OK, ' + totalFail + ' FEIL');
console.log('══════════════════════════════════════════════════════');

process.exit(totalFail > 0 ? 1 : 0);


function padR(s, n) {
  s = String(s);
  while (s.length < n) s += ' ';
  return s;
}
