// ── Prisoverslag: dokumentsum, sammendrag og sjekkliste ─────────
// Kjør: node testOfferSummary.js

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

function assertEqual(actual, expected, name) {
  if (actual === expected) {
    console.log('✓ ' + name);
    totalOk++;
  } else {
    console.log('✗ ' + name + ' — fikk ' + actual + ', forventet ' + expected);
    totalFail++;
  }
}

var TIME_RATE = 1000;
var INTERNAL_COST = 450;

function createCalcPost(id, hours, matSaleEx, matCost, overrides) {
  return Object.assign({
    id: id, name: id, type: 'calc', enabled: true, hours: hours,
    price: hours * TIME_RATE + matSaleEx,
    snapshotMaterials: [],
    snapshotCompute: { hoursTotal: hours, laborSaleEx: hours * TIME_RATE, laborCost: hours * INTERNAL_COST, matSaleEx: matSaleEx, matCost: matCost }
  }, overrides);
}

function createFixedPost(id, price) {
  return { id: id, name: id, type: 'fast', enabled: true, price: price };
}

function createApprovedChangeOrder(number, price) {
  return {
    id: 'co' + number, name: 'Ekstra vindu', type: CHANGE_ORDER_TYPE, enabled: true, price: price,
    snapshotCompute: {}, changeOrder: { number: number, status: ChangeOrderStatus.Approved, pricing: 'fastpris' }
  };
}

// Tilbygg: 90 t + 10 000 materialer, container 3 500 og 5 % rigg og drift.
function createProject(overrides) {
  return Object.assign({
    id: 'p1',
    work: { hours: 0, timeRate: TIME_RATE, internalCost: INTERNAL_COST },
    settings: { vatMode: 'ex' },
    extras: { rental: 0, waste: 3500, scaffolding: 0, drawings: 0, rigPercent: 5, misc: 0, subcontractors: [] },
    materials: [], operations: [], indirect: {},
    offerPosts: [createCalcPost('vegger', 90, 10000, 8000)]
  }, overrides);
}

function createOfferState(overrides) {
  return Object.assign({
    postMode: 'all', customPosts: [], extraPostsChecked: {},
    ikkemedregnet: { avfall: false, stillas: false, byggesoknad: false }
  }, overrides);
}

function withPosts(extraPosts) {
  return createProject({ offerPosts: [createCalcPost('vegger', 90, 10000, 8000)].concat(extraPosts) });
}

// ── computeOfferDocumentTotal ──
assertEqual(computeOfferDocumentTotal(createProject(), createOfferState()), 108500,
  'should add included posts, container and rig percent in all mode');
assertEqual(computeOfferDocumentTotal(withPosts([createCalcPost('terrasse', 30, 15000, 12500, { type: 'option', enabled: false })]), createOfferState()), 108500,
  'should leave out options that are not selected');
assertEqual(computeOfferDocumentTotal(withPosts([createFixedPost('riving', 20000)]), createOfferState()), 128500,
  'should include fixed posts without calculation in all mode');
assertEqual(computeOfferDocumentTotal(createProject(), createOfferState({ extraPostsChecked: { __waste: false } })), 105000,
  'should leave out project costs unchecked in the preview');
assertEqual(computeOfferDocumentTotal(withPosts([createFixedPost('riving', 20000)]), createOfferState({ postMode: 'custom', customPosts: [{ name: 'Alt', sourceIds: ['vegger', 'riving'] }] })), 128500,
  'should sum merged groups in custom mode');
assertEqual(computeOfferDocumentTotal(withPosts([createFixedPost('riving', 20000)]), createOfferState({ postMode: 'simple' })), 108500,
  'should follow calculation totals in simple mode like the document');
assertEqual(computeOfferDocumentTotal(createProject({ extras: { waste: 3500, scaffolding: 4000, rigPercent: 5, subcontractors: [] }, operations: [{ type: 'stillas' }] }), createOfferState()), 108500,
  'should not count the scaffolding field when a scaffolding operation exists');

// ── computeOfferSummary ──
var mixedProject = withPosts([createFixedPost('riving', 20000)]);
mixedProject.extras.subcontractors = [{ id: 's1', trade: 'Elektriker', amount: 12000 }];
var mixedSummary = computeOfferSummary(mixedProject, createOfferState(), 30);
var mixedParts = mixedSummary.parts;
assertEqual(Math.round(mixedParts.labor + mixedParts.material + mixedParts.fixed + mixedParts.rig + mixedParts.waste + mixedParts.other), Math.round(mixedSummary.totalEx),
  'should split the total into parts that add up to the total');

var summary = computeOfferSummary(createProject(), createOfferState(), 30);
assertEqual(summary.hours, 90,
  'should count hours from the posts');
assertEqual(Math.round(summary.costEx), 57000,
  'should compute cost from labor, materials, container and rig');
assertEqual(Math.round(summary.marginPct * 10) / 10, 47.5,
  'should compute margin from the document total');
assertEqual(Math.round(summary.earningsPerHour), 572,
  'should compute earnings per hour from profit and hours');
assertEqual(Math.round(summary.discountRoomEx), 27071,
  'should give discount room down to the margin goal');
assertEqual(Math.round(computeOfferSummary(createProject(), createOfferState(), 50).discountRoomEx), -5500,
  'should give negative discount room when the price is under the goal');
assertEqual(Math.round(computeOfferSummary(withPosts([createFixedPost('riving', 20000)]), createOfferState(), 30).profitEx), 51500,
  'should count fixed posts without calculation as having no profit');
assertEqual(computeOfferSummary(withPosts([createFixedPost('riving', 20000)]), createOfferState(), 30).uncalculatedPostCount, 1,
  'should count fixed posts without calculation');
assertEqual(computeOfferSummary(withPosts([createCalcPost('terrasse', 30, 15000, 12500, { type: 'option', enabled: false })]), createOfferState(), 30).options[0].totalEx, 155750,
  'should price an unselected option including its rig percent');
assertEqual(computeOfferSummary(withPosts([createApprovedChangeOrder(1, 16800)]), createOfferState(), 30).changeOrders.approvedEx, 16800,
  'should sum approved change orders for the contract sum');
assertEqual(computeOfferSummary(withPosts([createApprovedChangeOrder(1, 16800)]), createOfferState(), 30).totalEx, 108500,
  'should keep change orders out of the document total');

// ── getOfferReadiness ──
function findItem(items, id) {
  return items.filter(function(item) { return item.id === id; })[0];
}
var unpricedPost = createCalcPost('vegger', 90, 10000, 8000, { snapshotMaterials: [{ name: 'Svill', cost: 0 }, { name: 'Stender', cost: 120 }] });
assertEqual(findItem(getOfferReadiness(createProject({ offerPosts: [unpricedPost] }), createOfferState(), { email: 'kari@example.no' }), 'materialPrices').text, '1 materiale mangler pris',
  'should report materials without price');
assertEqual(findItem(getOfferReadiness(createProject({ extras: { waste: 0, rigPercent: 0, subcontractors: [] } }), createOfferState(), null), 'rig').isOk, false,
  'should report missing rig and operations');
assertEqual(findItem(getOfferReadiness(createProject(), createOfferState({ ikkemedregnet: { avfall: true } }), null), 'notIncluded').text, 'Avfall er priset, men står under «Ikke medregnet»',
  'should report waste that is priced but listed as not included');
assertEqual(findItem(getOfferReadiness(createProject(), createOfferState(), null), 'notIncluded').isOk, true,
  'should accept priced waste that is not listed as not included');
assertEqual(findItem(getOfferReadiness(createProject({ extras: { waste: 3500, drawings: 9000, rigPercent: 5, subcontractors: [] } }), createOfferState({ ikkemedregnet: { avfall: true, byggesoknad: true } }), null), 'notIncluded').text, 'Avfall og byggesøknad er priset, men står under «Ikke medregnet»',
  'should name several conflicts together');
assertEqual(findItem(getOfferReadiness(createProject(), createOfferState(), { name: 'Kari Nordmann' }), 'customerEmail').text, 'Kunden mangler e-post',
  'should report customer without email');

// ── generateWarnings ──
var farProject = createProject({ indirect: { avstandKm: 80 } });
assertEqual(generateWarnings(farProject, compute(farProject)).some(function(w) { return w.text.indexOf('80 km') >= 0; }), true,
  'should warn about long travel instead of crashing');

console.log('\n' + totalOk + ' OK, ' + totalFail + ' feil');
if (totalFail > 0) process.exit(1);
