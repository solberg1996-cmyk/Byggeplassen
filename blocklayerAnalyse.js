// ══════════════════════════════════════════════════════════════════
// Systematisk analyse av Blocklayer gable stud calculator
// Kilde: GableStuds_V2.js lastet ned fra blocklayer.com/Scripts/
// Metode: Én variabel endres om gangen fra en fast baseline
// ══════════════════════════════════════════════════════════════════

// ── Emulert browser-miljø ───────────────────────────────────────

var RAD = Math.PI / 180;
var RAD90 = Math.PI / 2;
var isValid = true;
var _domStore = {};
var _aLastValid = {};

function $(id) {
  if (!_domStore[id]) {
    _domStore[id] = {
      value: '', innerHTML: '', checked: false,
      rows: [], style: {},
      insertRow: function() {
        var row = {
          cells: [],
          insertCell: function() { var c = { innerHTML: '' }; this.cells.push(c); return c; }
        };
        _domStore[id].rows.push(row);
        return row;
      },
      deleteRow: function(i) { this.rows.splice(i, 1); }
    };
  }
  return _domStore[id];
}

function parseCheck(id, label, min, max) {
  var val = parseFloat($(id).value);
  if (isNaN(val) || val < min || val > max) { isValid = false; return 0; }
  _aLastValid[id] = val;
  return val;
}

function RoundTo(a, b) {
  if (b === 0) return Math.round(a);
  var p = Math.pow(10, b);
  return Math.round(a * p) / p;
}

function FormatMetric(s) { return String(s); }
function MinMax(a, b, c) { return Math.min(Math.max(a, b), c); }
String.prototype.TrimEnd = function(n) { return this.substring(0, this.length - n); };

var _noop = function(){};
var _canvasCtx = {
  save:_noop, restore:_noop, translate:_noop, rotate:_noop,
  beginPath:_noop, moveTo:_noop, lineTo:_noop, closePath:_noop,
  stroke:_noop, fill:_noop, fillText:_noop, drawImage:_noop,
  createPattern:function(){ return ''; }
};

// ── Blocklayer Stud-klasse og Calculate-funksjon ────────────────
// Oppsummering av logikk (ikke verbatim kopi):
//   1. Beregn vinkel, slope, cos
//   2. v = startHeight - plateThick - (plateThick/cos) * ekstraPlater
//   3. Loop fra pos=studWidth, steg=spacing, til pos >= lengthLevel
//   4. studLength = v + tan(angle) * pos
//   5. Mark-out justert med near/centre/far offset

var dangle, rangle, pitch, centersLevel, studWidth, lengthLevel, aStuds;
var inType = 'Angle', inMax = 60;

function Stud(len, runLvl, runAng) {
  this.length = len; this.runLevel = runLvl; this.runAngle = runAng;
}

function BL_Calculate() {
  var d = parseInt($('ddTopPlates').value);
  isValid = true;
  var c = parseCheck('_txtAngle', inType, 0, inMax);
  dangle = c; rangle = dangle * RAD; pitch = 12 * Math.tan(rangle);

  centersLevel = parseCheck('txtCentersLevel', 'Centres', 50, 1E4);
  studWidth = parseCheck('txtStudWidth', 'Stud Width', 10, 200);
  lengthLevel = parseCheck('txtLevelLength', 'Level Length', 1E3, 1E5);
  var q = parseCheck('txtStartHeight', 'Start Height', 0, 1E4);
  var l = parseCheck('txtPlateThick', 'Plate Thickness', 10, 100);
  var f = parseInt($('ddStart').value);
  var p = parseCheck('txtStartIn', 'StartIn', 0, 400);

  if (!isValid) return null;

  var e = l / Math.cos(rangle);
  var a = $('cbAdjustFirst').checked;
  var v = q - l - e * d;
  var g = Math.tan(rangle);
  var k = Math.cos(rangle);
  var F = g * centersLevel;

  var x = 0, y = 0;
  var z = $('ddToSide').value;
  if ('Near Side' === z) { x = studWidth; y = studWidth / k; }
  else if ('Centre' === z) { x = studWidth / 2; y = studWidth / 2 / k; }

  var b = studWidth + p;
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
    b = (b < centersLevel && a) ? b + (centersLevel - studWidth / 2) : b + centersLevel;
  }

  aStuds.push(new Stud(g * lengthLevel + v, lengthLevel, Math.round(lengthLevel / k)));

  return {
    stendere: aStuds.map(function(s, i) {
      return {
        nr: i + 1,
        length: Math.round(s.length),
        runLevel: Math.round(s.runLevel - x),
        runAngle: Math.round(s.runAngle - y)
      };
    }),
    v: Math.round(v * 100) / 100,
    oekningPerCc: Math.round(F),
    topCutSetback: Math.round(g * studWidth)
  };
}

// ── Hjelpefunksjon: Sett opp DOM og kjør ────────────────────────

function kjorTest(cfg) {
  _domStore = {};
  $('_txtAngle').value = String(cfg.angle || 30);
  $('txtCentersLevel').value = String(cfg.spacing || 600);
  $('txtStudWidth').value = String(cfg.studWidth || 48);
  $('txtLevelLength').value = String(cfg.levelLength || 5000);
  $('txtStartHeight').value = String(cfg.startHeight || 2400);
  $('txtPlateThick').value = String(cfg.plateThick || 48);
  $('ddTopPlates').value = String(cfg.topPlatesExtra || 0); // 0=1plate, 1=2plates
  $('ddStart').value = String(cfg.startMode || 0);          // 0=single, 1=double, 2=double+gap
  $('txtStartIn').value = String(cfg.startIn || 0);
  $('ddToSide').value = cfg.toSide || 'Centre';
  $('cbAdjustFirst').checked = !!cfg.alignSheets;

  // Canvas stubs
  ['cnvsGable','cnvsStud'].forEach(function(id) {
    $(id).getContext = function() { return _canvasCtx; };
    $(id).width = 800; $(id).height = 600;
  });
  $('imgBg').src = ''; $('imgAlert').src = '';

  isValid = true;
  inType = 'Angle';
  return BL_Calculate();
}

function vis(res, maxStendere) {
  if (!res) { console.log('  UGYLDIG INPUT'); return; }
  var n = maxStendere || 5;
  console.log('  v=' + res.v + '  okn/cc=' + res.oekningPerCc + '  setback=' + res.topCutSetback);
  console.log('  #   Lengde   RunLevel  RunAngle');
  res.stendere.slice(0, n).forEach(function(s) {
    console.log('  ' + pad(s.nr,3) + '  ' + pad(s.length,7) + '  ' + pad(s.runLevel,8) + '  ' + pad(s.runAngle,8));
  });
  if (res.stendere.length > n)
    console.log('  ... (' + (res.stendere.length - n) + ' flere)');
}

function pad(v, n) { var s = String(v); while (s.length < n) s = ' ' + s; return s; }

function diff(a, b, label) {
  if (!a || !b) return;
  console.log('  Endring i ' + label + ':');
  var maxLen = Math.min(a.stendere.length, b.stendere.length, 5);
  var lengdeEndret = false, runEndret = false;
  for (var i = 0; i < maxLen; i++) {
    var dL = b.stendere[i].length - a.stendere[i].length;
    var dR = b.stendere[i].runLevel - a.stendere[i].runLevel;
    var dA = b.stendere[i].runAngle - a.stendere[i].runAngle;
    if (dL !== 0) lengdeEndret = true;
    if (dR !== 0 || dA !== 0) runEndret = true;
    if (dL !== 0 || dR !== 0 || dA !== 0) {
      console.log('    #' + (i+1) + ': lengde ' + (dL>=0?'+':'') + dL
        + ', runLevel ' + (dR>=0?'+':'') + dR
        + ', runAngle ' + (dA>=0?'+':'') + dA);
    }
  }
  if (!lengdeEndret) console.log('    Stenderlengder: UENDRET');
  if (!runEndret) console.log('    Mark-out: UENDRET');
}

// ══════════════════════════════════════════════════════════════════
//  A. KARTLEGGING AV UI
// ══════════════════════════════════════════════════════════════════

console.log('');
console.log('A. KARTLEGGING AV BLOCKLAYER UI');
console.log('════════════════════════════════════════════════════════');
console.log('');
console.log('INPUTS:');
console.log('  Angle/Pitch      [_txtAngle]      Vinkel i grader ELLER pitch :12');
console.log('  Stud Thickness   [txtStudWidth]    Stenderbredde, mm (10-200)');
console.log('  Level Length     [txtLevelLength]  Total vegglengde horisontalt, mm (1000-100000)');
console.log('  Start Height     [txtStartHeight]  Vegghöyde inkl. alle plater, mm');
console.log('  Plate Thickness  [txtPlateThick]   Platetykkelse, mm (10-100)');
console.log('  Centres          [txtCentersLevel]  Senteravstand cc, mm (50-10000)');
console.log('  Top Plates       [ddTopPlates]     Dropdown: 0=1 plate, 1=2 plater');
console.log('  Start With       [ddStart]         0=Single, 1=Double, 2=Double+Gap');
console.log('  Start In         [txtStartIn]      Ekstra offset ved start, mm (0-400)');
console.log('  Run To Stud      [ddToSide]        "Near Side" / "Centre" / "Far Side"');
console.log('  Adjust First     [cbAdjustFirst]   Align Sheets checkbox');
console.log('');
console.log('OUTPUTS:');
console.log('  Tabell:     #, Stud Length, Run Level, Run Angle');
console.log('  Stud Lengths Long Side @ Centres (Level)');
console.log('  Running Points Level — To [side] of each member');
console.log('  Running Points at Angle — To [side] of each member');
console.log('');

// ══════════════════════════════════════════════════════════════════
//  B. TESTMATRISE — ÉN VARIABEL OM GANGEN
// ══════════════════════════════════════════════════════════════════

var BASELINE = {
  angle: 30, studWidth: 48, levelLength: 5000,
  startHeight: 2400, plateThick: 48, spacing: 600,
  topPlatesExtra: 0, startMode: 0, startIn: 0,
  toSide: 'Centre', alignSheets: false
};

console.log('');
console.log('B. TESTMATRISE');
console.log('════════════════════════════════════════════════════════');

// ── B0: Baseline ──
console.log('\n── B0: BASELINE ──');
console.log('  30°, 48mm stender, 5000mm vegg, 2400 startH, 48mm plate,');
console.log('  600cc, 1 topplem, single, centre, align OFF');
var base = kjorTest(BASELINE);
vis(base, 6);

// ── B1: Near Side ──
console.log('\n── B1: Endre BARE toSide → Near Side ──');
var testNear = kjorTest(Object.assign({}, BASELINE, { toSide: 'Near Side' }));
vis(testNear, 4);
diff(base, testNear, 'near vs centre');

// ── B2: Far Side ──
console.log('\n── B2: Endre BARE toSide → Far Side ──');
var testFar = kjorTest(Object.assign({}, BASELINE, { toSide: 'Far Side' }));
vis(testFar, 4);
diff(base, testFar, 'far vs centre');

// ── B3: 2 topplemmer ──
console.log('\n── B3: Endre BARE topPlates → 2 (ekstra=1) ──');
var test2Plates = kjorTest(Object.assign({}, BASELINE, { topPlatesExtra: 1 }));
vis(test2Plates, 4);
diff(base, test2Plates, '2 plater vs 1');
var plateOnAngle = 48 / Math.cos(30 * RAD);
console.log('  plateThick/cos(30°) = ' + plateOnAngle.toFixed(2) + ' mm');
console.log('  Forventet v-diff: -' + plateOnAngle.toFixed(2));
console.log('  Faktisk v-diff: ' + (test2Plates.v - base.v).toFixed(2));

// ── B4: Align Sheets PÅ ──
console.log('\n── B4: Endre BARE alignSheets → true ──');
var testAlign = kjorTest(Object.assign({}, BASELINE, { alignSheets: true }));
vis(testAlign, 4);
diff(base, testAlign, 'align ON vs OFF');

// ── B5: Double Stud ──
console.log('\n── B5: Endre BARE startMode → 1 (Double) ──');
var testDouble = kjorTest(Object.assign({}, BASELINE, { startMode: 1 }));
vis(testDouble, 5);
diff(base, testDouble, 'double vs single');

// ── B6: Double + Gap (startMode=2) ──
console.log('\n── B6: Endre BARE startMode → 2 (Double+Gap) ──');
var testDblGap = kjorTest(Object.assign({}, BASELINE, { startMode: 2 }));
vis(testDblGap, 5);
diff(base, testDblGap, 'double+gap vs single');

// ── B7: StartIn = 50mm ──
console.log('\n── B7: Endre BARE startIn → 50 mm ──');
var testStartIn = kjorTest(Object.assign({}, BASELINE, { startIn: 50 }));
vis(testStartIn, 4);
diff(base, testStartIn, 'startIn=50 vs 0');

// ── B8: 45° vinkel ──
console.log('\n── B8: Endre BARE angle → 45° ──');
var test45 = kjorTest(Object.assign({}, BASELINE, { angle: 45 }));
vis(test45, 4);

// ── B9: 2 plater ved 45° (cos-effekt tydeligere) ──
console.log('\n── B9: 45° + 2 topplemmer ──');
var test45_2p = kjorTest(Object.assign({}, BASELINE, { angle: 45, topPlatesExtra: 1 }));
vis(test45_2p, 4);
diff(test45, test45_2p, '45° 2 plater vs 1');
var plate45 = 48 / Math.cos(45 * RAD);
console.log('  plateThick/cos(45°) = ' + plate45.toFixed(2) + ' mm');
console.log('  Forventet v-diff: -' + plate45.toFixed(2));
console.log('  Faktisk v-diff: ' + (test45_2p.v - test45.v).toFixed(2));

// ══════════════════════════════════════════════════════════════════
//  C. ANALYSE OG FORKLARING
// ══════════════════════════════════════════════════════════════════

console.log('');
console.log('C. ANALYSE');
console.log('════════════════════════════════════════════════════════');

console.log('\n── C1: POSISJONERINGSLOGIKK ──');
console.log('');
console.log('Blocklayer bruker VEGGLENGDE (levelLength), ikke antall stendere.');
console.log('Stendere plasseres fra pos = studWidth til pos = levelLength.');
console.log('');
console.log('Baseline (single, centre, align OFF):');
console.log('  Stender 1 pos: studWidth = 48');
console.log('  Stender 2 pos: 48 + spacing = 648');
console.log('  Stender 3 pos: 648 + spacing = 1248');
console.log('  Siste stender: alltid ved pos = levelLength');
console.log('');
console.log('Centre-offset trekkes fra visning:');
console.log('  Vist runLevel = pos - studWidth/2 = 48-24 = 24 for stender 1');
console.log('');

console.log('── C2: STENDERLENGDE ──');
console.log('');
console.log('Formel: studLength = v + tan(angle) × pos');
console.log('  v = startHeight - plateThick - (plateThick/cos(angle)) × ekstraPlater');
console.log('');
console.log('For 1 plate (ekstra=0):');
console.log('  v = ' + base.v + '  (2400 - 48 = 2352)');
console.log('  plateThick trekkes FLATT (bunnsvill)');
console.log('');
console.log('For 2 plater (ekstra=1):');
console.log('  v = ' + test2Plates.v + '  (2400 - 48 - 48/cos(30°) = 2400 - 48 - 55.43)');
console.log('  Ekstra plate trekkes med COS-KORREKSJON');
console.log('  Fordi skrå topplem tar mer vertikal plass');
console.log('');

console.log('── C3: NEAR / CENTRE / FAR ──');
console.log('');
console.log('Faktisk test med stender #2 (pos=648):');
console.log('  Centre: lengde=' + base.stendere[1].length + ', runLevel=' + base.stendere[1].runLevel);
console.log('  Near:   lengde=' + testNear.stendere[1].length + ', runLevel=' + testNear.stendere[1].runLevel);
console.log('  Far:    lengde=' + testFar.stendere[1].length + ', runLevel=' + testFar.stendere[1].runLevel);
console.log('');
var sameLengde = (base.stendere[1].length === testNear.stendere[1].length
  && base.stendere[1].length === testFar.stendere[1].length);
console.log('  Lengde identisk alle 3: ' + (sameLengde ? 'JA' : 'NEI'));
console.log('  RunLevel diff centre→near: ' + (testNear.stendere[1].runLevel - base.stendere[1].runLevel));
console.log('  RunLevel diff centre→far:  ' + (testFar.stendere[1].runLevel - base.stendere[1].runLevel));
console.log('  = ±studWidth/2 = ±24');
console.log('');
console.log('KONKLUSJON: Near/Centre/Far endrer KUN mark-out, IKKE lengde.');
console.log('');

console.log('── C4: ALIGN SHEETS ──');
console.log('');
console.log('Uten align: stender 2 ved pos 648, runLevel(centre)=' + base.stendere[1].runLevel);
console.log('Med align:  stender 2 ved pos 624, runLevel(centre)=' + testAlign.stendere[1].runLevel);
console.log('Diff: ' + (testAlign.stendere[1].runLevel - base.stendere[1].runLevel) + ' mm');
console.log('= studWidth/2 = 24');
console.log('');
console.log('Logikk: Forste spacing endres fra cc → cc - studWidth/2');
console.log('  Normal: 48 + 600 = 648');
console.log('  Align:  48 + (600 - 24) = 624');
console.log('Resten av spacingene er uendret.');
console.log('');

console.log('── C5: DOUBLE / DOUBLE+GAP ──');
console.log('');
console.log('Single (baseline):');
console.log('  Stender 1: pos=48,  lengde=' + base.stendere[0].length);
console.log('  Stender 2: pos=648, lengde=' + base.stendere[1].length);
console.log('');
console.log('Double (ddStart=1):');
console.log('  Stender 1: pos=48,  lengde=' + testDouble.stendere[0].length);
console.log('  Stender 2: pos=96,  lengde=' + testDouble.stendere[1].length + '  ← EKSTRA ved 48+48*1');
console.log('  Stender 3: pos=648, lengde=' + testDouble.stendere[2].length);
console.log('');
console.log('Double+Gap (ddStart=2):');
console.log('  Stender 1: pos=48,  lengde=' + testDblGap.stendere[0].length);
console.log('  Stender 2: pos=144, lengde=' + testDblGap.stendere[1].length + '  ← EKSTRA ved 48+48*2');
console.log('  Stender 3: pos=648, lengde=' + testDblGap.stendere[2].length);
console.log('');
console.log('INNSIKT: Double SETTER INN en ekstra stender, forskyver IKKE resten.');
console.log('  ddStart=1: ekstra stender ved pos + studWidth*1 = 96');
console.log('  ddStart=2: ekstra stender ved pos + studWidth*2 = 144');
console.log('');

// ══════════════════════════════════════════════════════════════════
//  D. KONKLUSJON
// ══════════════════════════════════════════════════════════════════

console.log('');
console.log('D. KONKLUSJON');
console.log('════════════════════════════════════════════════════════');

console.log('\nBEKREFTET VIA OBSERVERBAR OUTPUT:');
console.log('  1. studLength = v + tan(angle) × pos');
console.log('  2. Near/Centre/Far endrer KUN mark-out (±studWidth/2)');
console.log('  3. Okning per cc = tan(angle) × spacing (konstant)');
console.log('  4. Align Sheets: forste spacing -= studWidth/2');
console.log('  5. v for 1 plate: startHeight - plateThick');
console.log('  6. Ekstra plate bruker cos-korreksjon: plateThick/cos(angle)');
console.log('     30°: 48→55mm vertikal, 45°: 48→68mm vertikal');

console.log('\nSTERK HYPOTESE:');
console.log('  1. "plateThick" = bunnsvill/bottom plate (flat, trekkes rett)');
console.log('  2. "ekstra plate" = skra topplem (cos-korrigert)');
console.log('  3. "Start Height" = total vegghoyde INKL alle plater');

console.log('\nMA FORTSATT VERIFISERES:');
console.log('  1. Hva skjer ved kombinasjon alignSheets + double?');
console.log('  2. Eksakt oppforsel av "Start In" (txtStartIn) felt');
console.log('  3. Om ddStart=2 virkelig betyr "double+gap" eller noe annet');

console.log('\nKONSEKVENS FOR VAR IMPLEMENTASJON:');
console.log('  1. MODELLENDRING: Bytt fra antallStendere til vegglengde');
console.log('     (eller tilby begge, men BL-modellen er mer byggeplass-nær)');
console.log('  2. FIKS PLATEKORREKSJON:');
console.log('     Var: topPlateTotal = plateThick × antall');
console.log('     Riktig: plateThick + plateThick/cos(angle) × (antall-1)');
console.log('  3. FIKS STARTPOSISJON:');
console.log('     Var: forste stender ved spacing');
console.log('     Riktig: forste stender ved studWidth');
console.log('  4. FIKS DOUBLE:');
console.log('     Var: forskyv alle stendere');
console.log('     Riktig: sett inn ekstra stender ved studWidth×2');
console.log('  5. NEAR/CENTRE/FAR: Var modell er korrekt (kun mark-out)');
console.log('  6. ALIGN SHEETS: Var modell er korrekt (forste cc - bredde/2)');
console.log('');
