// ── laborQty / enhetsmismatch: Verifisering ────────────────────
// Kjør: node testLaborQty.js
//
// Tester at:
// 1. qty brukes direkte når unit === laborUnit
// 2. laborQty brukes når unit !== laborUnit
// 3. console.warn ved enhetsmismatch uten laborQty
// 4. takdetaljer regner meter riktig
// 5. listverk bruker riktig laborQty
// 6. rekkverk/trapp ikke dobbeltteller arbeid
// 7. sett→stk normalisering og stk-varianter (vinkel_beslag, gjerde_bord)
// 8. laborQty for platting, spesialinnredning, kasser_nisjer
// 9. garderobe: ingen dobbeltelling (skyvedør, sidegavler)
// 10. 0 warnings for alle 61 calcDefs

// ── Setup: browser-globals for Node ─────────────────────────────
// Kjør alle filer i én eval slik at de deler scope —
// tilsvarer at browseren laster dem i rekkefølge.
var window = globalThis;
var state = { laborRates: {} };
window.state = state;

var fs = require('fs');
eval(
  fs.readFileSync('productionData.js', 'utf8') + '\n' +
  fs.readFileSync('recipes.js', 'utf8') + '\n' +
  fs.readFileSync('calcEngine.js', 'utf8')
);

var totalOk = 0;
var totalFail = 0;

function assert(condition, name, detail) {
  if (condition) {
    console.log('\u2713 ' + name);
    totalOk++;
  } else {
    console.log('\u2717 ' + name + (detail ? ' — ' + detail : ''));
    totalFail++;
  }
}

function approx(a, b, tol) {
  return Math.abs(a - b) < (tol || 0.001);
}

function suppressWarnings(fn) {
  var origWarn = console.warn;
  var warnings = [];
  console.warn = function(msg) { warnings.push(msg); };
  var result = fn();
  console.warn = origWarn;
  return { result: result, warnings: warnings };
}

// Hjelpefunksjon: kjør calc med standardverdier
function runCalc(type, overrides) {
  var def = calcDefs[type];
  var inputs = {};
  (def.inputs || []).forEach(function(i) { inputs[i.id] = i.default; });
  Object.assign(inputs, overrides || {});
  var mats = {};
  (def.materialOptions || []).forEach(function(o) { mats[o.id] = o.options[0]; });
  return def.calc(inputs, mats);
}

// Hjelpefunksjon: kjør calc med spesifikke materialvalg
function runCalcWithMats(type, inputOverrides, matOverrides) {
  var def = calcDefs[type];
  var inputs = {};
  (def.inputs || []).forEach(function(i) { inputs[i.id] = i.default; });
  Object.assign(inputs, inputOverrides || {});
  var mats = {};
  (def.materialOptions || []).forEach(function(o) { mats[o.id] = o.options[0]; });
  Object.assign(mats, matOverrides || {});
  return def.calc(inputs, mats);
}

console.log('══════════════════════════════════════════════════════');
console.log('  laborQty / enhetsmismatch-tester');
console.log('══════════════════════════════════════════════════════\n');


// ── 1. qty brukes direkte når unit === laborUnit ────────────────

console.log('── 1. qty brukes når unit === laborUnit ──');

(function() {
  var line = { name: 'Test lm', qty: 25, unit: 'lm', laborRate: 0.04 };
  var hours = calcLineHours(line);
  assert(approx(hours, 25 * 0.04), 'qty=25 × laborRate=0.04 = 1.0', 'fikk ' + hours);
})();

(function() {
  var line = { name: 'Test stk', qty: 6, unit: 'stk', laborRate: 0.25 };
  var hours = calcLineHours(line);
  assert(approx(hours, 6 * 0.25), 'qty=6 × laborRate=0.25 = 1.5', 'fikk ' + hours);
})();

(function() {
  var line = { name: 'Test m²', qty: 44, unit: 'm²', laborRate: 0.10 };
  var hours = calcLineHours(line);
  assert(approx(hours, 44 * 0.10), 'qty=44 × laborRate=0.10 = 4.4', 'fikk ' + hours);
})();

(function() {
  // Verifiser laborData-oppslag for en ID som finnes
  var line = { name: 'Gulvlist', qty: 25, unit: 'lm', laborId: 'gulvlist' };
  var rate = laborData.gulvlist.rate;
  var hours = calcLineHours(line);
  assert(approx(hours, 25 * rate), 'laborData gulvlist: qty=25 × rate=' + rate, 'fikk ' + hours);
})();


// ── 2. laborQty brukes når unit !== laborUnit ───────────────────

console.log('\n── 2. laborQty brukes ved enhetsmismatch ──');

(function() {
  var line = { name: 'Tetteremse', qty: 10, unit: 'lm', laborRate: 1.5, laborQty: 3 };
  var hours = calcLineHours(line);
  assert(approx(hours, 3 * 1.5), 'laborQty=3 overstyrer qty=10', 'fikk ' + hours);
})();

(function() {
  var line = { name: 'Undertaksduk', qty: 2, unit: 'rull', laborRate: 0.024, laborQty: 40 };
  var hours = calcLineHours(line);
  assert(approx(hours, 40 * 0.024), 'laborQty=40 m² (ikke 2 rull)', 'fikk ' + hours);
})();

(function() {
  var line = { name: 'Lakk', qty: 4, unit: 'l', laborRate: 0.30, laborQty: 14 };
  var hours = calcLineHours(line);
  assert(approx(hours, 14 * 0.30), 'laborQty=14 trinn (ikke 4 liter)', 'fikk ' + hours);
})();

(function() {
  var line = { name: 'Kledning', qty: 50, unit: 'lm', laborRate: 0.20, laborQty: 5.4 };
  var hours = calcLineHours(line);
  assert(approx(hours, 5.4 * 0.20), 'laborQty=5.4 m² (ikke 50 lm)', 'fikk ' + hours);
})();

(function() {
  var line = { name: 'Gips', qty: 0, unit: 'pl', laborRate: 0.10, laborQty: 0 };
  var hours = calcLineHours(line);
  assert(approx(hours, 0), 'laborQty=0 → 0 timer', 'fikk ' + hours);
})();


// ── 3. console.warn ved enhetsmismatch uten laborQty ────────────

console.log('\n── 3. warn ved mismatch uten laborQty ──');

(function() {
  // levegg_kledning: t/m², men linje har unit=lm uten laborQty
  var w = suppressWarnings(function() {
    calcLineHours({ name: 'Test', qty: 5, unit: 'lm', laborId: 'levegg_kledning' });
  });
  assert(w.warnings.length === 1, 'warn ved lm → t/m² uten laborQty', 'warnings: ' + w.warnings.length);
  assert(w.warnings[0] && w.warnings[0].indexOf('enhetsmismatch') !== -1, 'melding inneholder "enhetsmismatch"', w.warnings[0] || '(ingen)');
})();

(function() {
  // gulvlist: t/lm, linje har unit=lm — matcher
  var w = suppressWarnings(function() {
    calcLineHours({ name: 'Test', qty: 10, unit: 'lm', laborId: 'gulvlist' });
  });
  assert(w.warnings.length === 0, 'ingen warn ved lm → t/lm (match)', 'warnings: ' + w.warnings.length);
})();

(function() {
  // stk mot t/m² — mismatch
  var w = suppressWarnings(function() {
    calcLineHours({ name: 'Test', qty: 2, unit: 'stk', laborId: 'levegg_kledning' });
  });
  assert(w.warnings.length === 1, 'warn ved stk → t/m² uten laborQty', 'warnings: ' + w.warnings.length);
})();

(function() {
  // Mismatch MED laborQty → ingen warn
  var w = suppressWarnings(function() {
    calcLineHours({ name: 'Test', qty: 5, unit: 'lm', laborId: 'levegg_kledning', laborQty: 3 });
  });
  assert(w.warnings.length === 0, 'ingen warn ved mismatch MED laborQty', 'warnings: ' + w.warnings.length);
})();

(function() {
  // Ukjent laborId → warn fra getLaborRate
  var w = suppressWarnings(function() {
    calcLineHours({ name: 'Test', qty: 5, unit: 'lm', laborId: 'finnes_ikke_xyz' });
  });
  assert(w.warnings.length === 1, 'warn ved ukjent laborId', 'warnings: ' + w.warnings.length);
  assert(w.warnings[0] && w.warnings[0].indexOf('ukjent') !== -1, 'melding inneholder "ukjent"', w.warnings[0] || '(ingen)');
})();


// ── 4. Takdetaljer regner meter riktig fra flate ────────────────

console.log('\n── 4. takdetaljer: strukturell korrekthet ──');

(function() {
  var faktor = 1 / Math.cos(22 * Math.PI / 180);
  var areal = 8 * 5 * faktor;
  var result = runCalc('takjobb', { lengde: 8, bredde: 5, helning: 22, sperrer: 14 });
  var mats = result.materialer;

  // Undertak: qty=rull, men laborQty=areal
  var undertak = mats.find(function(m) { return m.laborId === 'undertak_duk'; });
  assert(undertak != null, 'takjobb har undertak-linje (undertak_duk)');
  assert(undertak && undertak.unit === 'rull', 'undertak unit = rull (innkjøp)');
  assert(undertak && approx(undertak.laborQty, areal), 'undertak laborQty = areal (' + areal.toFixed(1) + ')', 'fikk ' + (undertak && undertak.laborQty));
  assert(undertak && undertak.laborUnit === 'm²', 'undertak laborUnit = m²');
})();

(function() {
  var result = runCalc('vindskier', { lopemeter: 16, israft: 8 });
  var mats = result.materialer;

  var vindski = mats.find(function(m) { return m.laborId === 'vindskibord'; });
  assert(vindski && vindski.unit === 'lm', 'vindskibord unit = lm');
  assert(vindski && vindski.laborQty == null, 'vindskibord trenger ikke laborQty (lm→t/lm)');

  var israft = mats.find(function(m) { return m.laborId === 'forkantbord'; });
  assert(israft && israft.unit === 'lm', 'forkantbord unit = lm');
  assert(israft && israft.laborQty == null, 'forkantbord trenger ikke laborQty (lm→t/lm)');
})();

(function() {
  var result = runCalc('takrenner', { rennelm: 16, nedlop: 2, nedlophoyde: 4 });
  var mats = result.materialer;

  assert(mats.find(function(m) { return m.laborId === 'takrenne'; }).unit === 'lm', 'takrenne unit = lm');
  assert(mats.find(function(m) { return m.laborId === 'rennekrok'; }).unit === 'stk', 'rennekrok unit = stk');
  assert(mats.find(function(m) { return m.laborId === 'nedlopsror'; }).unit === 'lm', 'nedløpsrør unit = lm');
  assert(mats.find(function(m) { return m.laborId === 'nedlopstrakt'; }).qty === 2, 'nedløpstrakt: 2 stk');
})();


// ── 5. Listverk bruker riktig qty til timer ─────────────────────

console.log('\n── 5. listverk: korrekt qty-overføring ──');

(function() {
  var result = runCalc('gulvlister', { lopemeter: 25 });
  var list = result.materialer.find(function(m) { return m.laborId === 'gulvlist'; });
  assert(list && list.unit === 'lm', 'gulvlist unit = lm');
  assert(list && list.laborQty == null, 'gulvlist trenger ikke laborQty');
  assert(list && list.qty === Math.ceil(25 * 1.1), 'gulvlist qty = ceil(25×1.1) = 28', 'fikk ' + (list && list.qty));
})();

(function() {
  var result = runCalc('taklister', { lopemeter: 20 });
  var list = result.materialer.find(function(m) { return m.laborId === 'taklist'; });
  assert(list && list.unit === 'lm', 'taklist unit = lm');
  assert(list && list.qty === Math.ceil(20 * 1.1), 'taklist qty = ceil(20×1.1) = 22', 'fikk ' + (list && list.qty));
})();

(function() {
  var result = runCalcWithMats('gerikter', { antallDorer: 4, antallVinduer: 2 }, {});
  var list = result.materialer.find(function(m) { return m.laborId === 'karmlist'; });
  assert(list != null, 'gerikter har karmlist-linje');
  assert(list && list.unit === 'lm', 'gerikter karmlist unit = lm');
})();

(function() {
  var result = runCalc('hjornelister', { lopemeter: 10 });
  var list = result.materialer.find(function(m) { return m.laborId === 'hjornelist'; });
  assert(list && list.unit === 'lm', 'hjornelist unit = lm');
  assert(list && list.qty === Math.ceil(10 * 1.08), 'hjornelist qty = ceil(10×1.08) = 11', 'fikk ' + (list && list.qty));
})();

(function() {
  // vindu foring: utforing laborId, lm ut
  var result = runCalcWithMats('vindu',
    { antall: 3, bredde: 100, hoyde: 120 },
    { foring: 'Inkludert foring og lister' }
  );
  var foring = result.materialer.find(function(m) { return m.laborId === 'utforing'; });
  assert(foring != null, 'vindu har utforing-linje');
  assert(foring && foring.unit === 'lm', 'utforing unit = lm');
  assert(foring && foring.laborQty == null, 'utforing trenger ikke laborQty (lm→t/lm)');
})();


// ── 6. Rekkverk og trapp: ingen dobbeltelling ──────────────────

console.log('\n── 6. ingen dobbeltelling trapp/rekkverk ──');

(function() {
  // utv_trapp: opptrinn skal IKKE ha laborId
  var result = runCalc('utv_trapp', { antallTrinn: 6, bredde: 100, opptrinn: 180, inntrinn: 280 });
  var mats = result.materialer;

  var trinnLine = mats.find(function(m) { return m.name.indexOf('Trinn') === 0; });
  var opptLine = mats.find(function(m) { return m.name.indexOf('Opptrinn') === 0; });

  assert(trinnLine && trinnLine.laborId === 'montering_trappetrinn', 'utv_trapp trinn har laborId=montering_trappetrinn');
  assert(trinnLine && trinnLine.qty === 6, 'utv_trapp trinn qty = 6');
  assert(opptLine && !opptLine.laborId, 'utv_trapp opptrinn har IKKE laborId');

  var w = suppressWarnings(function() { return calcLineHours(opptLine); });
  assert(approx(w.result, 0), 'utv_trapp opptrinn gir 0 timer', 'fikk ' + w.result);
})();

(function() {
  // inn_trapp: opptrinn skal IKKE ha laborId
  var result = runCalc('inn_trapp', { antallTrinn: 14, bredde: 90 });
  var mats = result.materialer;

  var trinnLine = mats.find(function(m) { return m.name.indexOf('Trinn') === 0; });
  var opptLine = mats.find(function(m) { return m.name === 'Opptrinn'; });

  assert(trinnLine && trinnLine.laborId === 'montering_trappetrinn', 'inn_trapp trinn har laborId=montering_trappetrinn');
  assert(trinnLine && trinnLine.qty === 14, 'inn_trapp trinn qty = 14');
  assert(opptLine && !opptLine.laborId, 'inn_trapp opptrinn har IKKE laborId');

  var w = suppressWarnings(function() { return calcLineHours(opptLine); });
  assert(approx(w.result, 0), 'inn_trapp opptrinn gir 0 timer', 'fikk ' + w.result);
})();

(function() {
  // rehab_trapp: behandling bruker laborQty (antall trinn), ikke qty (liter)
  var result = runCalcWithMats('rehab_trapp',
    { antallTrinn: 14, bredde: 90 },
    { omfang: 'Nye trinn på eksisterende', overflate: 'Lakk' }
  );
  var mats = result.materialer;
  var behandling = mats.find(function(m) { return m.laborId === 'rehab_trapp_overflate'; });

  assert(behandling != null, 'rehab_trapp har behandling-linje');
  assert(behandling && behandling.unit === 'l', 'behandling unit = l (liter)');
  assert(behandling && behandling.laborQty === 14, 'behandling laborQty = antallTrinn (14)', 'fikk ' + (behandling && behandling.laborQty));

  var hours = calcLineHours(behandling);
  assert(approx(hours, 14 * 0.30), 'timer = laborQty(14) × rate(0.30) = 4.2', 'fikk ' + hours);
})();

(function() {
  // rekkverk: alle linjer med laborId — ingen dobbeltelling
  var result = runCalcWithMats('rekkverk',
    { lopemeter: 6, hoyde: 1.0 },
    { type: 'Tre stolpe + sprosser' }
  );
  var mats = result.materialer;

  var stolper = mats.find(function(m) { return m.laborId === 'rekkverksstolper'; });
  var handloper = mats.find(function(m) { return m.laborId === 'handloper'; });
  var sprosser = mats.find(function(m) { return m.laborId === 'rekkverksspiler_stk'; });

  assert(stolper && stolper.unit === 'stk', 'rekkverk stolper unit = stk');
  assert(handloper && handloper.unit === 'lm', 'rekkverk håndløper unit = lm');
  assert(sprosser && sprosser.unit === 'stk', 'rekkverk sprosser unit = stk');

  // Ingen laborQty nødvendig — enheter matcher direkte
  assert(stolper && stolper.laborQty == null, 'stolper trenger ikke laborQty');
  assert(handloper && handloper.laborQty == null, 'håndløper trenger ikke laborQty');
  assert(sprosser && sprosser.laborQty == null, 'sprosser trenger ikke laborQty');

  // Ingen dupliserte laborId-er
  var laborIds = mats.filter(function(m) { return m.laborId; }).map(function(m) { return m.laborId; });
  var unique = laborIds.filter(function(id, i) { return laborIds.indexOf(id) === i; });
  assert(laborIds.length === unique.length, 'rekkverk: ingen dupliserte laborId-er', 'ids: ' + laborIds.join(', '));
})();

(function() {
  // levegg standard: kledning bruker laborQty=areal (ikke qty i lm)
  var result = runCalcWithMats('levegg',
    { lengde: 3, hoyde: 1.8 },
    { type: 'Stående bord 19×148' }
  );
  var mats = result.materialer;
  var kledning = mats.find(function(m) { return m.laborId === 'levegg_kledning'; });
  var areal = 3 * 1.8;

  assert(kledning && kledning.unit === 'lm', 'levegg kledning unit = lm (innkjøp)');
  assert(kledning && approx(kledning.laborQty, areal), 'levegg kledning laborQty = areal (5.4)', 'fikk ' + (kledning && kledning.laborQty));

  var hours = calcLineHours(kledning);
  assert(approx(hours, areal * 0.20), 'timer = areal(5.4) × rate(0.20) = 1.08', 'fikk ' + hours);
})();

(function() {
  // levegg glass+tre: kledningsandelen bruker laborQty=areal*0.4
  var result = runCalcWithMats('levegg',
    { lengde: 3, hoyde: 1.8 },
    { type: 'Glass + tre' }
  );
  var mats = result.materialer;
  var kledning = mats.find(function(m) { return m.laborId === 'levegg_kledning'; });
  var areal = 3 * 1.8;

  assert(kledning && approx(kledning.laborQty, areal * 0.4), 'glass+tre laborQty = areal×0.4 = ' + (areal * 0.4).toFixed(2), 'fikk ' + (kledning && kledning.laborQty));
})();


// ── 7. sett→stk normalisering og stk-varianter ────────────────────

console.log('\n── 7. sett→stk og stk-varianter ──');

// 7a. sett→stk: skyvedør, kjøkken, hvitevarer, garderobe, bad
(function() {
  var skyvedor = runCalc('skyvedor', { antall: 2 });
  var skinne = skyvedor.materialer.find(function(m) { return m.laborId === 'skyvedor_montering'; });
  assert(skinne && skinne.unit === 'stk', 'skyvedor skinne unit = stk (normalisert fra sett)');
  assert(skinne && skinne.qty === 2, 'skyvedor skinne qty = antall', 'fikk ' + (skinne && skinne.qty));
})();

(function() {
  var kj = runCalc('kjokken', { lopemeter: 4, hoyskap: 1 });
  var vask = kj.materialer.find(function(m) { return m.laborId === 'oppvaskbenk'; });
  assert(vask && vask.unit === 'stk', 'kjøkken vask unit = stk (normalisert fra sett)');
})();

(function() {
  var hv = runCalc('hvitevarer', { antall: 3 });
  var line = hv.materialer.find(function(m) { return m.laborId === 'hvitevare_montering'; });
  assert(line && line.unit === 'stk', 'hvitevarer unit = stk (normalisert fra sett)');
  assert(line && line.qty === 3, 'hvitevarer qty = antall', 'fikk ' + (line && line.qty));
})();

(function() {
  var gard = runCalc('garderobe', { antall: 2, bredde: 200, hoyde: 240 });
  var skinne = gard.materialer.find(function(m) { return m.laborId === 'garderobe_skyvedor'; });
  assert(skinne && skinne.unit === 'stk', 'garderobe skinne unit = stk (normalisert fra sett)');

  var innr = gard.materialer.find(function(m) { return m.laborId === 'garderobeskap'; });
  assert(innr && innr.unit === 'stk', 'garderobe innredning unit = stk (normalisert fra sett)');
})();

(function() {
  var bad = runCalc('badeinnredning', { antall: 1 });
  var feste = bad.materialer.find(function(m) { return m.laborId === 'badeinnredning_montering'; });
  assert(feste && feste.unit === 'stk', 'badeinnredning feste unit = stk (normalisert fra sett)');
})();

// 7b. vinkel_beslag_stk brukes i reisverk og bærevegger
(function() {
  var rv = runCalc('reisverk', { lengde: 8, hoyde: 2.4 });
  var beslag = rv.materialer.find(function(m) { return m.laborId === 'vinkel_beslag_stk'; });
  assert(beslag != null, 'reisverk bruker vinkel_beslag_stk');
  assert(beslag && beslag.unit === 'stk', 'vinkelbeslag unit = stk');

  var entry = laborData.vinkel_beslag_stk;
  assert(entry && entry.unit === 't/stk', 'laborData vinkel_beslag_stk enhet = t/stk');
})();

(function() {
  var bv = runCalc('baerevegger', { lengde: 4, hoyde: 2.4 });
  var beslag = bv.materialer.find(function(m) { return m.laborId === 'vinkel_beslag_stk'; });
  assert(beslag != null, 'bærevegger bruker vinkel_beslag_stk');
})();

// 7c. gjerde: lukket→gjerde_bord (lm), stakitt→gjerde_bord_stk (stk)
(function() {
  var lukket = runCalcWithMats('gjerde',
    { lengde: 10, hoyde: 1.2, ccStolpe: 1.8 },
    { type: 'Plankgjerde lukket' }
  );
  var bord = lukket.materialer.find(function(m) { return (m.laborId || '').indexOf('gjerde_bord') !== -1; });
  assert(bord && bord.laborId === 'gjerde_bord', 'lukket gjerde → gjerde_bord (lm)', 'fikk ' + (bord && bord.laborId));
  assert(bord && bord.unit === 'lm', 'lukket gjerde unit = lm');
})();

(function() {
  var stakitt = runCalcWithMats('gjerde',
    { lengde: 10, hoyde: 1.2, ccStolpe: 1.8 },
    { type: 'Stakittgjerde' }
  );
  var bord = stakitt.materialer.find(function(m) { return (m.laborId || '').indexOf('gjerde_bord') !== -1; });
  assert(bord && bord.laborId === 'gjerde_bord_stk', 'stakittgjerde → gjerde_bord_stk (stk)', 'fikk ' + (bord && bord.laborId));
  assert(bord && bord.unit === 'stk', 'stakittgjerde unit = stk');
})();


// ── 8. laborQty for platting, spesialinnredning, kasser ────────────

console.log('\n── 8. laborQty for platting/innredning/kasser ──');

(function() {
  var result = runCalc('platting', { lengde: 5, bredde: 3 });
  var sand = result.materialer.find(function(m) { return m.laborId === 'platting_grunn'; });
  assert(sand && sand.unit === 'm³', 'platting sand unit = m³ (innkjøp)');
  assert(sand && sand.laborQty === 15, 'platting sand laborQty = areal (15)', 'fikk ' + (sand && sand.laborQty));
  assert(sand && sand.laborUnit === 'm²', 'platting sand laborUnit = m²');
})();

(function() {
  var result = runCalc('spesialinnredning', { antall: 2, bredde: 200, hoyde: 220, dybde: 40 });
  var plate = result.materialer.find(function(m) { return m.laborId === 'spesialinnredning_montering'; });
  assert(plate && plate.unit === 'm²', 'spesialinnredning plate unit = m² (innkjøp)');
  assert(plate && plate.laborQty === 2, 'spesialinnredning laborQty = antall (2)', 'fikk ' + (plate && plate.laborQty));
  assert(plate && plate.laborUnit === 'stk', 'spesialinnredning laborUnit = stk');

  // Hyller skal IKKE ha laborId (dekket av platemateriell-linjen)
  var hyller = result.materialer.find(function(m) { return m.name.indexOf('Hyller') !== -1; });
  assert(hyller && !hyller.laborId, 'spesialinnredning hyller har IKKE laborId (unngår dobbeltelling)');
})();

(function() {
  var result = runCalc('kasser_nisjer', { antall: 2, bredde: 60, hoyde: 80, dybde: 15 });
  var plate = result.materialer.find(function(m) { return m.laborId === 'kasse_nisje'; });
  assert(plate && plate.unit === 'pl', 'kasser plate unit = pl (innkjøp)');
  assert(plate && plate.laborQty === 2, 'kasser laborQty = antall (2)', 'fikk ' + (plate && plate.laborQty));
  assert(plate && plate.laborUnit === 'stk', 'kasser laborUnit = stk');
})();


// ── 9. garderobe: ingen dobbeltelling ──────────────────────────────

console.log('\n── 9. garderobe dobbeltelling ──');

(function() {
  var gard = runCalc('garderobe', { antall: 2, bredde: 200, hoyde: 240 });
  var mats = gard.materialer;

  // Skyvedør-paneler skal IKKE ha laborId (dekket av skinne-linjen)
  var dorer = mats.filter(function(m) { return m.name.indexOf('Skyvedør') !== -1 && m.name.indexOf('skinne') === -1; });
  dorer.forEach(function(d) {
    assert(!d.laborId, 'skyvedørpanel "' + d.name + '" har IKKE laborId');
  });

  // Sidegavler skal IKKE ha laborId (dekket av innredning)
  var gavler = mats.find(function(m) { return m.name.indexOf('Sidegavler') !== -1; });
  assert(gavler && !gavler.laborId, 'sidegavler har IKKE laborId');

  // Ingen dupliserte laborId-er
  var laborIds = mats.filter(function(m) { return m.laborId; }).map(function(m) { return m.laborId; });
  var unique = laborIds.filter(function(id, i) { return laborIds.indexOf(id) === i; });
  assert(laborIds.length === unique.length, 'garderobe: ingen dupliserte laborId-er', 'ids: ' + laborIds.join(', '));
})();


// ── 10. Ingen warnings for korrigerte linjer ───────────────────────

console.log('\n── 10. 0 warnings for alle 61 calcDefs ──');

(function() {
  var allDefs = Object.keys(calcDefs);
  var w = suppressWarnings(function() {
    allDefs.forEach(function(type) {
      var def = calcDefs[type];
      if (!def || !def.calc) return;
      var inputs = {};
      (def.inputs || []).forEach(function(inp) { inputs[inp.id] = inp.default; });
      var result = def.calc(inputs, {});
      if (!result || !result.materialer) return;
      calcDirectBaseHours(result.materialer);
    });
  });
  assert(w.warnings.length === 0, allDefs.length + ' calcDefs gir 0 warnings', 'fikk ' + w.warnings.length + ': ' + w.warnings.slice(0, 3).join(' | '));
})();


// ── Oppsummering ────────────────────────────────────────────────

console.log('\n══════════════════════════════════════════════════════');
console.log('  Resultat: ' + totalOk + ' OK, ' + totalFail + ' FEIL');
console.log('══════════════════════════════════════════════════════');
process.exit(totalFail > 0 ? 1 : 0);
