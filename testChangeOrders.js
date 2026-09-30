// ── Endringsmeldinger / tillegg: summering ─────────────────────
// Kjør: node testChangeOrders.js

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

function createPost(overrides) {
  return Object.assign({
    id: Math.random().toString(36).slice(2, 10),
    type: 'calc', price: 0, enabled: true, hours: 0,
    snapshotMaterials: [], snapshotCompute: {}
  }, overrides);
}

function createChangeOrder(status, price, hours) {
  return createPost({
    type: CHANGE_ORDER_TYPE, price: price, hours: hours,
    snapshotCompute: { hoursTotal: hours, laborSaleEx: price, laborCost: 0, matSaleEx: 0, matCost: 0 },
    changeOrder: { number: 1, status: status, pricing: 'fastpris' }
  });
}

function createProject(offerPosts) {
  return {
    work: { timeRate: 1000, internalCost: 450, hours: 0 },
    settings: { vatMode: 'ex', materialMarkup: 20 },
    extras: { rental: 0, waste: 0, scaffolding: 0, drawings: 0, rigPercent: 0, misc: 0, subcontractors: [] },
    materials: [], operations: [], indirect: {},
    offerPosts: offerPosts
  };
}

var basePost = createPost({
  price: 11000, hours: 10,
  snapshotCompute: { hoursTotal: 10, laborSaleEx: 10000, laborCost: 4500, matSaleEx: 1000, matCost: 800 }
});

// ── isPostInTotal ──
assertEqual(isPostInTotal(createChangeOrder('godkjent', 5000, 5)), false,
  'should exclude approved change order from offer total');
assertEqual(isPostInTotal(basePost), true,
  'should include regular post in offer total');

// ── computeOfferPostsTotal ──
var mixedProject = createProject([
  basePost,
  createChangeOrder('godkjent', 5000, 5),
  createChangeOrder('sendt', 3000, 3)
]);
assertEqual(computeOfferPostsTotal(mixedProject).total, 11000,
  'should keep change orders out of offer post total');
assertEqual(computeOfferPostsTotal(mixedProject).hours, 10,
  'should keep change order hours out of offer post hours');

// ── compute (hovedoppsummering) ──
assertEqual(compute(mixedProject).totalLaborSaleEx, 10000,
  'should keep change orders out of project labor sale value');

// ── computeChangeOrdersTotal ──
var changeOrderProject = createProject([
  basePost,
  createChangeOrder('godkjent', 5000, 5),
  createChangeOrder('godkjent', 2000, 2),
  createChangeOrder('sendt', 3000, 3),
  createChangeOrder('utkast', 1000, 1),
  createChangeOrder('avvist', 9000, 9)
]);
assertEqual(computeChangeOrdersTotal(changeOrderProject).approved, 7000,
  'should sum approved change orders');
assertEqual(computeChangeOrdersTotal(changeOrderProject).pending, 4000,
  'should sum draft and sent change orders as pending');
assertEqual(computeChangeOrdersTotal(changeOrderProject).approvedCount, 2,
  'should count approved change orders');
assertEqual(computeChangeOrdersTotal(changeOrderProject).pendingCount, 2,
  'should not count rejected change orders as pending');
assertEqual(computeChangeOrdersTotal(createProject([basePost])).approved, 0,
  'should return zero approved when project has no change orders');

console.log('\n' + totalOk + ' OK, ' + totalFail + ' feil');
if (totalFail > 0) process.exit(1);
