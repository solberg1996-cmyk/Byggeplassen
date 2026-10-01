// ── Forsiden: kontrakter i arbeid, prisoverslag ute, margin og vinnerate ──
// Kjør: node testDashboard.js

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
var MARGIN_GOAL = 30;

function createCalcPost(id, hours, matSaleEx, overrides) {
  return Object.assign({
    id: id, name: id, type: 'calc', enabled: true, hours: hours, price: hours * TIME_RATE + matSaleEx,
    snapshotCompute: { hoursTotal: hours, laborSaleEx: hours * TIME_RATE, laborCost: hours * INTERNAL_COST, matSaleEx: matSaleEx, matCost: matSaleEx }
  }, overrides);
}

function createProject(id, status, posts, overrides) {
  return Object.assign({
    id: id, name: id, status: status,
    work: { hours: 0, timeRate: TIME_RATE, internalCost: INTERNAL_COST, actualHours: 0 },
    extras: { subcontractors: [] }, materials: [], operations: [], indirect: {},
    offerPosts: posts
  }, overrides);
}

function offerStateFor() {
  return { postMode: 'all', customPosts: [], extraPostsChecked: {}, ikkemedregnet: {} };
}

var approvedChange = { id: 'co1', type: CHANGE_ORDER_TYPE, price: 16800, changeOrder: { number: 1, status: ChangeOrderStatus.Approved } };
var unselectedOption = createCalcPost('terrasse', 30, 15000, { type: 'option', enabled: false });

var projects = [
  createProject('tilbygg', 'Pågår', [createCalcPost('vegger', 90, 10000), unselectedOption, approvedChange], { work: { timeRate: TIME_RATE, internalCost: INTERNAL_COST, actualHours: 56 } }),
  createProject('garasje', 'Vunnet', [createCalcPost('garasje', 40, 20000)]),
  createProject('terrasse', 'Sendt', [createCalcPost('terrasse', 60, 25000)]),
  createProject('bad', 'Sendt', [createCalcPost('bad', 100, 42500)]),
  createProject('utkast', 'Utkast', [createCalcPost('utkast', 10, 0)]),
  createProject('ferdig', 'Ferdig', [createCalcPost('ferdig', 10, 0)]),
  createProject('tapt', 'Tapt', [createCalcPost('tapt', 10, 0)])
];
var summary = computeDashboardSummary(projects, offerStateFor, MARGIN_GOAL);

// ── computeContractSum ──
assertEqual(computeContractSum(projects[0], offerStateFor()), 116800,
  'should add approved change orders to the offer total');

// ── computeDashboardSummary ──
assertEqual(summary.contractsEx, 176800,
  'should sum contract sums of won and in-progress projects');
assertEqual(summary.inProgressCount, 1,
  'should count projects in progress');
assertEqual(summary.wonCount, 1,
  'should count won projects not yet started');
assertEqual(summary.sentEx, 227500,
  'should sum offers waiting for an answer');
assertEqual(summary.sentCount, 2,
  'should count offers waiting for an answer');
assertEqual(summary.optionsEx, 45000,
  'should sum unselected options in open projects');
assertEqual(summary.hoursProgress[0].actualHours, 56,
  'should report hours spent on projects in progress');
assertEqual(summary.hoursProgress[0].estimatedHours, 90,
  'should compare hours spent with the offer hours');
// Fortjeneste 49 500 + 22 000 + 33 000 + 55 000 = 159 500 av 387 500 i pris.
assertEqual(Math.round(summary.marginPct * 10) / 10, 41.2,
  'should weight the average margin by offer size');
assertEqual(computeDashboardSummary([projects[4]], offerStateFor, MARGIN_GOAL).marginPct, null,
  'should have no margin when no offers are open');

// ── countDecidedOffers ──
assertEqual(countDecidedOffers(projects).won, 3,
  'should count won, in-progress and finished projects as won');
assertEqual(countDecidedOffers(projects).decided, 4,
  'should count lost projects as decided');

console.log('\n' + totalOk + ' OK, ' + totalFail + ' feil');
if (totalFail > 0) process.exit(1);
