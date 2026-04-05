// Kjører Blocklayers faktiske beregningslogikk lokalt
// ved å emulere nødvendige browser-funksjoner.
// Formål: verifisere vår gavlCalc.js mot originalen.
//
// Kjør: node blocklayerVerify.js

eval(require('fs').readFileSync('gavlCalc.js', 'utf8'));

// ── Emulert DOM for Blocklayer ──────────────────────────────────

var RAD = Math.PI / 180;
var RAD90 = Math.PI / 2;
var isValid = true;

var _domStore = {};
function $(id) {
  if (!_domStore[id]) {
    _domStore[id] = { value: '', innerHTML: '', checked: false, rows: [], style: {} };
    _domStore[id].insertRow = function() {
      var row = { cells: [], insertCell: function() { var c = { innerHTML: '' }; this.cells.push(c); return c; } };
      _domStore[id].rows.push(row);
      return row;
    };
    _domStore[id].deleteRow = function() { _domStore[id].rows.pop(); };
  }
  return _domStore[id];
}

function parseCheck(id, label, min, max) {
  var val = parseFloat($(id).value);
  if (isNaN(val) || val < min || val > max) { isValid = false; return 0; }
  return val;
}

function RoundTo(a, b) {
  if (b === 0) return Math.round(a);
  var p = Math.pow(10, b);
  return Math.round(a * p) / p;
}

function FormatMetric(s) { return s; }
function MinMax(a, b, c) { return Math.min(Math.max(a, b), c); }

String.prototype.TrimEnd = function(n) { return this.substring(0, this.length - n); };

// Stub for canvas — vi trenger bare beregningsverdiene, ikke tegningen
var _canvasCtx = {
  save:function(){}, restore:function(){}, translate:function(){}, rotate:function(){},
  beginPath:function(){}, moveTo:function(){}, lineTo:function(){}, closePath:function(){},
  stroke:function(){}, fill:function(){}, fillText:function(){}, drawImage:function(){},
  createPattern:function(){ return ''; }
};
var _canvasEl = {
  width: 800, height: 600,
  getContext: function() { return _canvasCtx; }
};

// ── Blocklayer Calculate() — kopi fra GableStuds_V2.js ──────────

var dangle, rangle, pitch, centersLevel, studWidth, inMax = 60, inType = 'Angle', maxRise = 15E3, aStuds, lengthLevel;

function Stud(d, c, q) { this.length = d; this.runLevel = c; this.runAngle = q; }

function BL_Calculate() {
  var d = parseInt($('ddTopPlates').value);
  isValid = true;

  var c = parseCheck('_txtAngle', 'Angle', 0, inMax);
  if ('Angle' === inType) {
    dangle = c; rangle = dangle * RAD; pitch = 12 * Math.tan(rangle);
  } else {
    rangle = Math.atan(c / 12); dangle = rangle / RAD; pitch = c;
  }

  centersLevel = parseCheck('txtCentersLevel', 'Centres', 50, 1E4);
  studWidth = parseCheck('txtStudWidth', 'Stud Width', 10, 200);
  lengthLevel = parseCheck('txtLevelLength', 'Level Length', 1E3, 1E5);

  var q = parseCheck('txtStartHeight', 'Start Height including plates', 0, 1E4);
  var l = parseCheck('txtPlateThick', 'Plate Thickness', 10, 100);
  var f = parseInt($('ddStart').value);
  var p = parseCheck('txtStartIn', 'StartIn', 0, 400);

  if (!isValid) return null;

  var e = l / Math.cos(rangle);
  var t_plateTotal = Math.ceil(l + e * d);

  var a = $('cbAdjustFirst').checked;
  var v = q - l - e * d;   // NOTE: v = startHeight minus plate stack
  var g = Math.tan(rangle);
  var k = Math.cos(rangle);
  var F = g * centersLevel;

  var x = 0, y = 0;
  var z = $('ddToSide').value;
  if ('Near Side' === z) { x = studWidth; y = studWidth / k; }
  else if ('Centre' === z) { x = studWidth / 2; y = studWidth / 2 / k; }

  var b = studWidth;
  b += p;
  aStuds = [];

  var D = false;
  while (b < lengthLevel - 0.001) {
    var h;
    if (b < lengthLevel - studWidth) {
      h = v + g * b;
      aStuds.push(new Stud(h, b, Math.round(b / k)));
    } else {
      h = v + g * (lengthLevel - studWidth);
      aStuds.push(new Stud(h, lengthLevel - studWidth, Math.round((lengthLevel - studWidth) / k)));
      D = true;
    }

    if (b === studWidth + p && f > 0) {
      h = v + g * (b + studWidth * f);
      aStuds.push(new Stud(h, b + studWidth * f, Math.round((b + studWidth * f) / k)));
    }

    if (b < centersLevel && a) {
      b = b + (centersLevel - studWidth / 2);
    } else {
      b = b + centersLevel;
    }
  }

  // Siste stender
  var fLast = g * lengthLevel + v;
  aStuds.push(new Stud(fLast, lengthLevel, Math.round(lengthLevel / k)));

  // Returner resultater
  return {
    stendere: aStuds.map(function(s, i) {
      return {
        nr: i + 1,
        length: Math.round(s.length),
        runLevel: Math.round(s.runLevel - x),
        runAngle: Math.round(s.runAngle - y)
      };
    }),
    oekningPerStender: Math.round(F),
    topCutSetback: Math.round(g * studWidth),
    v_baseHeight: v
  };
}

// ── Sett opp og kjør testcases ──────────────────────────────────

var TEST_CASES = [
  {
    navn: 'Test 1: Grunncase 30° single centre',
    dom: {
      '_txtAngle': '30', 'txtCentersLevel': '600', 'txtStudWidth': '48',
      'txtLevelLength': '5000', 'txtStartHeight': '2400', 'txtPlateThick': '48',
      'ddTopPlates': '0',  // 0 = "1 plate minus 1" → ekstra plater
      'ddStart': '0', 'txtStartIn': '0',
      'ddToSide': 'Centre', 'cbAdjustFirst': false
    }
  },
  {
    navn: 'Test 2: Near Side',
    dom: {
      '_txtAngle': '30', 'txtCentersLevel': '600', 'txtStudWidth': '48',
      'txtLevelLength': '5000', 'txtStartHeight': '2400', 'txtPlateThick': '48',
      'ddTopPlates': '0', 'ddStart': '0', 'txtStartIn': '0',
      'ddToSide': 'Near Side', 'cbAdjustFirst': false
    }
  },
  {
    navn: 'Test 3: Far Side',
    dom: {
      '_txtAngle': '30', 'txtCentersLevel': '600', 'txtStudWidth': '48',
      'txtLevelLength': '5000', 'txtStartHeight': '2400', 'txtPlateThick': '48',
      'ddTopPlates': '0', 'ddStart': '0', 'txtStartIn': '0',
      'ddToSide': 'Far Side', 'cbAdjustFirst': false
    }
  },
  {
    navn: 'Test 4: 2 topplemmer',
    dom: {
      '_txtAngle': '30', 'txtCentersLevel': '600', 'txtStudWidth': '48',
      'txtLevelLength': '5000', 'txtStartHeight': '2400', 'txtPlateThick': '48',
      'ddTopPlates': '1', 'ddStart': '0', 'txtStartIn': '0',
      'ddToSide': 'Centre', 'cbAdjustFirst': false
    }
  },
  {
    navn: 'Test 5: Align Sheets PA',
    dom: {
      '_txtAngle': '30', 'txtCentersLevel': '600', 'txtStudWidth': '48',
      'txtLevelLength': '5000', 'txtStartHeight': '2400', 'txtPlateThick': '48',
      'ddTopPlates': '0', 'ddStart': '0', 'txtStartIn': '0',
      'ddToSide': 'Centre', 'cbAdjustFirst': true
    }
  },
  {
    navn: 'Test 6: Double Stud (ddStart=1)',
    dom: {
      '_txtAngle': '30', 'txtCentersLevel': '600', 'txtStudWidth': '48',
      'txtLevelLength': '5000', 'txtStartHeight': '2400', 'txtPlateThick': '48',
      'ddTopPlates': '0', 'ddStart': '1', 'txtStartIn': '0',
      'ddToSide': 'Centre', 'cbAdjustFirst': false
    }
  },
];

// ── Kjør ─────────────────────────────────────────────────────────

console.log('══════════════════════════════════════════════════════');
console.log('  Blocklayer-verifisering (emulert JS-motor)');
console.log('══════════════════════════════════════════════════════\n');

// ddTopPlates = antall topplemmer (1 eller 2), IKKE ekstra plater.
// BL dropdown: value="1" for 1 plate, value="2" for 2 plates.
// Formel: v = startHeight - plateThick(bunnsvill) - plateOnAngle * d(topplemmer)

TEST_CASES.forEach(function(tc) {
  // Reset DOM
  _domStore = {};
  Object.keys(tc.dom).forEach(function(key) {
    if (key === 'cbAdjustFirst') {
      $(key).checked = tc.dom[key];
    } else {
      $(key).value = tc.dom[key];
    }
  });

  // Stub canvas elements
  $('cnvsGable').getContext = function() { return _canvasCtx; };
  $('cnvsGable').width = 800;
  $('cnvsGable').height = 600;
  $('cnvsStud').getContext = function() { return _canvasCtx; };
  $('cnvsStud').width = 200;
  $('cnvsStud').height = 400;
  $('imgBg').src = '';
  $('imgAlert').src = '';

  isValid = true;
  inType = 'Angle';

  var res = BL_Calculate();

  console.log('── ' + tc.navn + ' ──');
  if (!res) {
    console.log('  FEIL: Blocklayer returnerte null (ugyldig input)\n');
    return;
  }

  console.log('  Økning per cc: ' + res.oekningPerStender + ' mm');
  console.log('  Toppkutt setback: ' + res.topCutSetback + ' mm');
  console.log('  v (baseHeight): ' + Math.round(res.v_baseHeight) + ' mm');
  console.log('  Stendere (' + res.stendere.length + '):');
  res.stendere.forEach(function(s) {
    console.log('    #' + s.nr + '  lengde=' + s.length + '  runLevel=' + s.runLevel + '  runAngle=' + s.runAngle);
  });
  console.log('');
});

// ── Nå sammenlign med vår kalkulator ────────────────────────────

console.log('══════════════════════════════════════════════════════');
console.log('  Sammenligning: Blocklayer vs gavlCalc.js');
console.log('══════════════════════════════════════════════════════\n');

// Blocklayer bruker en ANNEN modell enn vi antok!
// Nøkkelinnsikt fra kildekoden:
//   v = startHeight - plateThick - (plateThick/cos(angle)) * extraPlates
//   studLength = v + tan(angle) * runLevel
//   plateOnAngle = plateThick / cos(angle)
//
// "Start Height including plates" betyr at startHeight INKLUDERER bunnsvill + stender + topplem
// v er netto stenderhøyde ved x=0 (start)
//
// Vår formel:
//   studLength = startHoyde + runLevel * slope - topPlateTotal
//
// Blocklayers formel:
//   v = startHeight - plateThick - (plateThick/cos(angle)) * d
//   studLength = v + tan(angle) * runLevel
//
// Forskjellen: Blocklayer bruker plateThick/cos(angle) for skrå plate,
// ikke bare plateThick!

console.log('VIKTIG FUNN: Blocklayer sin plate-korreksjon er:');
console.log('  v = startHeight - plateThick - (plateThick/cos(angle)) * ekstraPlater');
console.log('  Der plateThick/cos(angle) er tykkelsen til topplem MALT VERTIKALT');
console.log('  (fordi topplemmen ligger skratt, tar den mer vertikal plass)');
console.log('');
console.log('  Var formel bruker: topPlateTotal = plateThick * antallTopplem');
console.log('  Blocklayer bruker: plateThick + (plateThick/cos(angle)) * ekstra');
console.log('');

// Test 1 sammenligning
_domStore = {};
$('_txtAngle').value = '30';
$('txtCentersLevel').value = '600';
$('txtStudWidth').value = '48';
$('txtLevelLength').value = '5000';
$('txtStartHeight').value = '2400';
$('txtPlateThick').value = '48';
$('ddTopPlates').value = '0';
$('ddStart').value = '0';
$('txtStartIn').value = '0';
$('ddToSide').value = 'Centre';
$('cbAdjustFirst').checked = false;
$('cnvsGable').getContext = function() { return _canvasCtx; };
$('cnvsGable').width = 800; $('cnvsGable').height = 600;
$('cnvsStud').getContext = function() { return _canvasCtx; };
$('cnvsStud').width = 200; $('cnvsStud').height = 400;
$('imgBg').src = ''; $('imgAlert').src = '';
isValid = true; inType = 'Angle';

var blRes = BL_Calculate();

// Vår kalkulator med samme input
var vaarRes = beregnGavlStendere({
  takvinkel: 30, startHoyde: 2400, stenderBredde: 48,
  topplemTykkelse: 48, antallTopplem: 1,
  senteravstand: 600, antallStendere: 8
});

console.log('── Grunncase 30°, 600cc, 1 topplem ──');
console.log('');

// Blocklayers v (netto starthøyde):
var blAngleRad = 30 * Math.PI / 180;
var blPlateOnAngle = 48 / Math.cos(blAngleRad);
var blV = 2400 - 48 - blPlateOnAngle * 0;  // 0 ekstra plater
console.log('Blocklayer:');
console.log('  plateOnAngle = 48/cos(30) = ' + blPlateOnAngle.toFixed(2) + ' mm');
console.log('  v = 2400 - 48 - ' + blPlateOnAngle.toFixed(2) + '*0 = ' + blV.toFixed(2) + ' mm');
console.log('  (1 plate = bunnsvill? Eller topplem? Se koden...)');
console.log('');

console.log('Var kalkulator:');
console.log('  topPlateTotal = 48 * 1 = 48 mm');
console.log('  startHoyde - topPlateTotal = 2400 - 48 = 2352 mm');
console.log('');

if (blRes && vaarRes.gyldig) {
  console.log(padR('Stender', 8) + padR('BL lengde', 12) + padR('Var lengde', 12) + padR('Diff', 8) + padR('BL run', 10) + padR('Var run', 10));
  console.log('-'.repeat(60));

  var maxStuds = Math.min(blRes.stendere.length, vaarRes.stendere.length);
  for (var i = 0; i < maxStuds; i++) {
    var bl = blRes.stendere[i];
    var vr = vaarRes.stendere[i];
    if (!bl || !vr) break;
    var diff = bl.length - vr.lengdeLang;
    console.log(
      padR('#' + bl.nr, 8) +
      padR(bl.length, 12) +
      padR(vr.lengdeLang, 12) +
      padR(diff, 8) +
      padR(bl.runLevel, 10) +
      padR(vr.runLevel, 10)
    );
  }
}

function padR(s, n) {
  s = String(s);
  while (s.length < n) s += ' ';
  return s;
}
