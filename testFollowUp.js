// ── Tilbudsoppfølging og vinnerate ─────────────────────────────
// Kjør: node testFollowUp.js

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

var NOW = Date.UTC(2026, 8, 30, 12);

function daysAgo(days) {
  return NOW - days * DAY_MS;
}

function createProject(overrides) {
  return Object.assign({ id: Math.random().toString(36).slice(2, 10), status: 'Utkast', updatedAt: NOW }, overrides);
}

// ── setProjectStatus ──
var draft = createProject();
setProjectStatus(draft, 'Sendt', NOW);
assertEqual(draft.sentAt, NOW, 'should record sent date when status changes to Sendt');

var alreadySent = createProject({ status: 'Sendt', sentAt: daysAgo(10) });
setProjectStatus(alreadySent, 'Sendt', NOW);
assertEqual(alreadySent.sentAt, daysAgo(10), 'should keep original sent date when status is already Sendt');

var snoozed = createProject({ status: 'Utkast', followUpSnoozedUntil: NOW + DAY_MS });
setProjectStatus(snoozed, 'Sendt', NOW);
assertEqual(snoozed.followUpSnoozedUntil, 0, 'should clear snooze when offer is sent again');

// ── getOfferFollowUps ──
assertEqual(getOfferFollowUps([createProject({ status: 'Sendt', sentAt: daysAgo(8) })], NOW).length, 1,
  'should include offer sent more than 7 days ago');
assertEqual(getOfferFollowUps([createProject({ status: 'Sendt', sentAt: daysAgo(3) })], NOW).length, 0,
  'should exclude offer sent less than 7 days ago');
assertEqual(getOfferFollowUps([createProject({ status: 'Vunnet', sentAt: daysAgo(30) })], NOW).length, 0,
  'should exclude offers that are no longer Sendt');
assertEqual(getOfferFollowUps([createProject({ status: 'Sendt', sentAt: daysAgo(30), followUpSnoozedUntil: NOW + DAY_MS })], NOW).length, 0,
  'should exclude snoozed offers until snooze expires');
assertEqual(getOfferFollowUps([createProject({ status: 'Sendt', updatedAt: daysAgo(9) })], NOW)[0].isSentAtKnown, false,
  'should fall back to updatedAt for legacy offers without sent date');

var ordered = getOfferFollowUps([
  createProject({ id: 'newer', status: 'Sendt', sentAt: daysAgo(8) }),
  createProject({ id: 'older', status: 'Sendt', sentAt: daysAgo(20) })
], NOW);
assertEqual(ordered[0].project.id, 'older', 'should list oldest unanswered offer first');

// ── computeWinRate ──
var decided = [
  createProject({ status: 'Vunnet' }), createProject({ status: 'Ferdig' }), createProject({ status: 'Pågår' }),
  createProject({ status: 'Tapt' }), createProject({ status: 'Sendt' })
];
assertEqual(computeWinRate(decided), 75, 'should compute win rate from won and lost offers only');
assertEqual(computeWinRate([createProject({ status: 'Vunnet' }), createProject({ status: 'Vunnet' }), createProject({ status: 'Sendt' })]), 100,
  'should never exceed 100 percent when offers are pending');
assertEqual(computeWinRate([createProject({ status: 'Sendt' })]), 0,
  'should return zero when no offers are decided');

console.log('\n' + totalOk + ' OK, ' + totalFail + ' feil');
if (totalFail > 0) process.exit(1);
