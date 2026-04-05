// ── Gavlstender parity guard ───────────────────────────────────
// Hardkodede Blocklayer-verifiserte snapshots.
// Kjør: node gavlParityGuard.js
// Eller i nettleser: gavlParityGuard() returnerer { ok, failures }
//
// Disse verdiene er oppdatert 2026-04-05 etter korrigering av
// plate-korreksjon: v = startHeight - plateThick - plateOnAngle * topPlateCount
// (ikke extraPlates). Verifisert mot Blocklayer-nettside via browser-agent.

var GAVL_PARITY_SNAPSHOTS = [
  // ── Snapshot 1: 30° centre 1plate 5000mm ─────────────────────
  // Dekker: grunncase, standard parametere
  {
    navn: '30° centre 1plate 5000mm',
    input: { angleDeg: 30, startHeight: 2400, lengthLevel: 5000 },
    stendere: [
      { nr: 1,  lengdeLangside: 2324, runLevel: 24,   runAngle: 27 },
      { nr: 2,  lengdeLangside: 2671, runLevel: 624,  runAngle: 720 },
      { nr: 3,  lengdeLangside: 3017, runLevel: 1224, runAngle: 1413 },
      { nr: 4,  lengdeLangside: 3364, runLevel: 1824, runAngle: 2106 },
      { nr: 5,  lengdeLangside: 3710, runLevel: 2424, runAngle: 2799 },
      { nr: 6,  lengdeLangside: 4056, runLevel: 3024, runAngle: 3492 },
      { nr: 7,  lengdeLangside: 4403, runLevel: 3624, runAngle: 4184 },
      { nr: 8,  lengdeLangside: 4749, runLevel: 4224, runAngle: 4877 },
      { nr: 9,  lengdeLangside: 5096, runLevel: 4824, runAngle: 5570 },
      { nr: 10, lengdeLangside: 5183, runLevel: 4976, runAngle: 5746 }
    ]
  },

  // ── Snapshot 2: 45° centre 1plate 5000mm ─────────────────────
  // Dekker: brattere vinkel, slope=1.0
  {
    navn: '45° centre 1plate 5000mm',
    input: { angleDeg: 45, startHeight: 2400, lengthLevel: 5000 },
    stendere: [
      { nr: 1,  lengdeLangside: 2332, runLevel: 24,   runAngle: 34 },
      { nr: 2,  lengdeLangside: 2932, runLevel: 624,  runAngle: 882 },
      { nr: 3,  lengdeLangside: 3532, runLevel: 1224, runAngle: 1731 },
      { nr: 4,  lengdeLangside: 4132, runLevel: 1824, runAngle: 2579 },
      { nr: 5,  lengdeLangside: 4732, runLevel: 2424, runAngle: 3428 },
      { nr: 6,  lengdeLangside: 5332, runLevel: 3024, runAngle: 4277 },
      { nr: 7,  lengdeLangside: 5932, runLevel: 3624, runAngle: 5125 },
      { nr: 8,  lengdeLangside: 6532, runLevel: 4224, runAngle: 5974 },
      { nr: 9,  lengdeLangside: 7132, runLevel: 4824, runAngle: 6822 },
      { nr: 10, lengdeLangside: 7284, runLevel: 4976, runAngle: 7037 }
    ]
  },

  // ── Snapshot 3: 30° near 2plates 5000mm ──────────────────────
  // Dekker: plate-korreksjon (skrå plater), measurePoint=near
  {
    navn: '30° near 2plates 5000mm',
    input: { angleDeg: 30, startHeight: 2400, lengthLevel: 5000, topPlateCount: 2, measurePoint: 'near' },
    stendere: [
      { nr: 1,  lengdeLangside: 2269, runLevel: 0,    runAngle: 0 },
      { nr: 2,  lengdeLangside: 2615, runLevel: 600,  runAngle: 693 },
      { nr: 3,  lengdeLangside: 2962, runLevel: 1200, runAngle: 1386 },
      { nr: 4,  lengdeLangside: 3308, runLevel: 1800, runAngle: 2079 },
      { nr: 5,  lengdeLangside: 3655, runLevel: 2400, runAngle: 2772 },
      { nr: 6,  lengdeLangside: 4001, runLevel: 3000, runAngle: 3465 },
      { nr: 7,  lengdeLangside: 4347, runLevel: 3600, runAngle: 4157 },
      { nr: 8,  lengdeLangside: 4694, runLevel: 4200, runAngle: 4850 },
      { nr: 9,  lengdeLangside: 5040, runLevel: 4800, runAngle: 5543 },
      { nr: 10, lengdeLangside: 5128, runLevel: 4952, runAngle: 5719 }
    ]
  },

  // ── Snapshot 4: 10° near 2plates 4800mm (BL-nettside-verifisert) ─
  // Dekker: lav vinkel, tynn plate (13mm), 2 plater, near side
  // Verifisert direkte mot blocklayer.com via browser-agent
  {
    navn: '10° near 2plates 4800mm (BL-verifisert)',
    input: {
      angleDeg: 10, startHeight: 2400, lengthLevel: 4800,
      spacing: 600, studWidth: 48, plateThick: 13,
      topPlateCount: 2, measurePoint: 'near', startIn: 0
    },
    stendere: [
      { nr: 1, lengdeLangside: 2369, runLevel: 0,    runAngle: 0 },
      { nr: 2, lengdeLangside: 2475, runLevel: 600,  runAngle: 609 },
      { nr: 3, lengdeLangside: 2581, runLevel: 1200, runAngle: 1218 },
      { nr: 4, lengdeLangside: 2686, runLevel: 1800, runAngle: 1828 },
      { nr: 5, lengdeLangside: 2792, runLevel: 2400, runAngle: 2437 },
      { nr: 6, lengdeLangside: 2898, runLevel: 3000, runAngle: 3046 },
      { nr: 7, lengdeLangside: 3004, runLevel: 3600, runAngle: 3655 },
      { nr: 8, lengdeLangside: 3110, runLevel: 4200, runAngle: 4265 },
      { nr: 9, lengdeLangside: 3207, runLevel: 4752, runAngle: 4825 }
    ]
  }
];


// ── Kjør guard ─────────────────────────────────────────────────
// Returnerer { ok: boolean, failures: string[] }
// Krever at beregnGavlStendere() er tilgjengelig globalt.

function gavlParityGuard() {
  var failures = [];

  GAVL_PARITY_SNAPSHOTS.forEach(function(snap) {
    var res = beregnGavlStendere(snap.input);

    if (!res.gyldig) {
      failures.push(snap.navn + ': kalkulator returnerte ugyldig');
      return;
    }

    if (res.stendere.length !== snap.stendere.length) {
      failures.push(snap.navn + ': antall=' + res.stendere.length + ' forventet=' + snap.stendere.length);
      return;
    }

    for (var i = 0; i < snap.stendere.length; i++) {
      var exp = snap.stendere[i];
      var got = res.stendere[i];
      if (got.lengdeLangside !== exp.lengdeLangside) {
        failures.push(snap.navn + ' #' + exp.nr + ' lengde: ' + got.lengdeLangside + ' != ' + exp.lengdeLangside);
      }
      if (got.runLevel !== exp.runLevel) {
        failures.push(snap.navn + ' #' + exp.nr + ' runLevel: ' + got.runLevel + ' != ' + exp.runLevel);
      }
      if (got.runAngle !== exp.runAngle) {
        failures.push(snap.navn + ' #' + exp.nr + ' runAngle: ' + got.runAngle + ' != ' + exp.runAngle);
      }
    }
  });

  return {
    ok: failures.length === 0,
    failures: failures
  };
}


// ── CLI-modus ──────────────────────────────────────────────────

if (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
  eval(require('fs').readFileSync('gavlCalc.js', 'utf8'));

  var result = gavlParityGuard();

  if (result.ok) {
    console.log('PARITY GUARD: ' + GAVL_PARITY_SNAPSHOTS.length + '/' + GAVL_PARITY_SNAPSHOTS.length + ' snapshots OK');
  } else {
    console.log('PARITY GUARD FAILED:');
    result.failures.forEach(function(f) { console.log('  ' + f); });
    process.exit(1);
  }
}


// ── Nettleser dev-modus ────────────────────────────────────────
// Kjører automatisk ved ?debug i URL. Ellers stille.

if (typeof window !== 'undefined' && typeof beregnGavlStendere === 'function') {
  if (window.location.search.indexOf('debug') !== -1) {
    var _pgResult = gavlParityGuard();
    if (_pgResult.ok) {
      console.log('%c GAVL PARITY GUARD: 3/3 OK ', 'background:#3A8A50;color:#fff;border-radius:3px');
    } else {
      console.error('GAVL PARITY GUARD FAILED:', _pgResult.failures);
    }
  }
}
