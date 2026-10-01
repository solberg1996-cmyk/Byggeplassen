// ============================================================
// calcEngine.js — Beregningsmotor (timer, pris, økonomi)
// ============================================================
// Avhenger av:
//   - productionData.js (laborData, adjustmentFactors)
//   - recipes.js (calcDefs, calcFromRecipe)
// Bruker globale: laborData, adjustmentFactors, calcDefs, state, uid()
// ============================================================

// ── HJELPEFUNKSJON ───────────────────────────────────────────

function round1(n) { return Math.round((Number(n) || 0) * 10) / 10; }


// ── ARBEIDSTID PER MATERIALLINJE ────────────────────────────
// Rate-prioritet: line.laborRate → state.laborRates[id] → laborData[id].rate → 0

/**
 * Hent laborRate for en laborId.
 * Bruker brukerens erfaringstall hvis lagret, ellers laborData.
 */
function getLaborRate(laborId) {
  if (!laborId) return 0;
  var userRate = (state.laborRates || {})[laborId];
  if (userRate != null) return userRate;
  var entry = laborData[laborId];
  if (!entry) {
    console.warn('getLaborRate: ukjent laborId "' + laborId + '" — returnerer 0');
    return 0;
  }
  return entry.rate;
}

/**
 * Lagre brukerens egen laborRate for et materiale.
 */
function saveLaborRate(laborId, val) {
  state.laborRates = state.laborRates || {};
  state.laborRates[laborId] = parseFloat(val);
}

/**
 * Beregn timer for én materiallinje. Full presisjon (ingen avrunding).
 * Validerer at unit matcher laborData-enhet — advarer hvis laborQty mangler ved mismatch.
 */
function calcLineHours(line) {
  var qty = Number(line.laborQty != null ? line.laborQty : line.qty) || 0;
  if (line.laborRate != null) return qty * line.laborRate;
  // Valider enhetsmatch når laborQty ikke er eksplisitt satt
  if (line.laborId && line.laborQty == null && line.unit) {
    var entry = laborData[line.laborId];
    if (entry) {
      var laborUnit = entry.unit.replace('t/', '');
      if (line.unit !== laborUnit) {
        console.warn('calcLineHours: enhetsmismatch for "' + (line.name || '') + '" — unit="' + line.unit + '" men laborData.' + line.laborId + ' er ' + entry.unit + '. Mangler laborQty?');
      }
    }
  }
  return qty * getLaborRate(line.laborId);
}

/**
 * Summer timer for alle materiallinjer. Full presisjon.
 * Advarer hvis samme laborId forekommer med ulike enheter — mulig dobbeltelling.
 */
function calcDirectBaseHours(materialLines) {
  var total = 0;
  var seenIds = {};
  for (var i = 0; i < materialLines.length; i++) {
    var line = materialLines[i];
    total += calcLineHours(line);
    if (line.laborId) {
      var effectiveUnit = line.laborQty != null ? 'laborQty' : line.unit;
      if (seenIds[line.laborId] && seenIds[line.laborId] !== effectiveUnit) {
        console.warn('calcDirectBaseHours: laborId "' + line.laborId + '" brukt med ulike enheter (' + seenIds[line.laborId] + ' og ' + effectiveUnit + ') — mulig dobbeltelling i "' + (line.name || '') + '"');
      }
      seenIds[line.laborId] = effectiveUnit;
    }
  }
  return total;
}

/**
 * Beregn additivt påslag basert på tilkomst, høyde, kompleksitet.
 * Returnerer detaljer + uavrundet tillegg.
 */
function calcAdjustments(baseHours, factors) {
  var t = (adjustmentFactors.tilkomst[(factors && factors.tilkomst) || 'normal'] || adjustmentFactors.tilkomst.normal).pct;
  var h = (adjustmentFactors.hoyde[(factors && factors.hoyde) || 'bakke'] || adjustmentFactors.hoyde.bakke).pct;
  var k = (adjustmentFactors.kompleksitet[(factors && factors.kompleksitet) || 'normal'] || adjustmentFactors.kompleksitet.normal).pct;
  var sumPct = t + h + k;
  return {
    tilkomst: t,
    hoyde: h,
    kompleksitet: k,
    sumPct: sumPct,
    tillegg: baseHours * sumPct,
  };
}

/**
 * Beregn justerte direkte timer = baseHours × (1 + sumPåslag). Full presisjon.
 */
function calcAdjustedDirectHours(baseHours, factors) {
  var adj = calcAdjustments(baseHours, factors);
  return baseHours + adj.tillegg;
}

/**
 * Hent materiallinjer for en operasjon via calcDefs.
 */
function getMaterialLines(op) {
  var def = window.calcDefs && window.calcDefs[op.type];
  if (!def) return [];
  var inputs = {};
  (def.inputs || []).forEach(function(inp) {
    inputs[inp.id] = (op.materialValues && op.materialValues[inp.id]) != null
      ? op.materialValues[inp.id] : inp.default;
  });
  var mats = op.materialChoices || {};
  var result;
  if (def.recipe) {
    result = window.calcFromRecipe(op.type, inputs, mats);
  } else if (def.calc) {
    result = def.calc(inputs, mats);
  }
  return (result && result.materialer) || [];
}


// ── INDIREKTE TID ────────────────────────────────────────────

/**
 * Kjoring: tur/retur per dag, 80 km/t snitt.
 */
function calculateDrivingTime(project, direkteTimer) {
  var indirect = (project && project.indirect) || {};
  var work = (project && project.work) || {};
  var km = Number(indirect.avstandKm) || 0;
  var people = Number(indirect.people) || Number(work.people) || 1;
  var timerPerDag = 7.5;

  var dager = Number(indirect.antallDager) || Math.max(Math.ceil(direkteTimer / (timerPerDag * people)), 1);
  var turer = Number(indirect.antallTurer) || dager;
  var totalKm = turer * km * 2;
  var timer = km > 0 ? round1(totalKm / 80) : 0;

  return {
    timer: timer,
    km: totalKm,
    turer: turer,
    dager: dager,
    label: 'Kjoring',
  };
}

/**
 * Rigg og nedrigg: fast grunnkostnad + skalering med prosjektstorrelse.
 */
function calculateRiggingTime(project, direkteTimer) {
  var ind = project.indirect || {};

  if (ind.riggTimer != null && Number(ind.riggTimer) >= 0) {
    var forced = Number(ind.riggTimer);
    return { timer: forced, grunn: forced, lopende: 0, stillas: 0, label: 'Rigg og nedrigg' };
  }

  var grunn = 2;
  var lopende = round1(direkteTimer / 8 * 0.5);

  var ops = project.operations || [];
  var harHoyde = ops.some(function(op) { return op.hoyde && op.hoyde !== 'bakke'; });
  var harStillasOp = ops.some(function(op) { return op && op.type === 'stillas'; });
  var stillas = (harHoyde && !harStillasOp) ? round1(Math.max(direkteTimer * 0.04, 1)) : 0;

  return {
    timer: round1(grunn + lopende + stillas),
    grunn: grunn,
    lopende: lopende,
    stillas: stillas,
    label: 'Rigg og nedrigg',
  };
}

/**
 * Planlegging, opprydding og kvalitetskontroll.
 */
function calculatePlanningTime(project, direkteTimer) {
  var ind = project.indirect || {};

  if (ind.planTimer != null && Number(ind.planTimer) >= 0) {
    var forced = Number(ind.planTimer);
    return { timer: forced, planlegging: forced, opprydding: 0, kvalitet: 0, label: 'Planlegging m.m.' };
  }

  var planlegging = round1(1 + direkteTimer * 0.03);
  var oppryddingPct = ind.oppryddingPct != null ? Number(ind.oppryddingPct) : 3;
  var opprydding = round1(direkteTimer * oppryddingPct / 100);
  var kvalitet = round1(direkteTimer * 0.02);

  return {
    timer: round1(planlegging + opprydding + kvalitet),
    planlegging: planlegging,
    opprydding: opprydding,
    kvalitet: kvalitet,
    label: 'Planlegging m.m.',
  };
}

/**
 * Samle alle indirekte poster og returner total + breakdown.
 */
function calcIndirectTime(project, direkteTimer) {
  var driving = calculateDrivingTime(project, direkteTimer);
  var rigging = calculateRiggingTime(project, direkteTimer);
  var planning = calculatePlanningTime(project, direkteTimer);

  var poster = [];

  if (driving.timer > 0) {
    poster.push({
      key: 'kjoring',
      label: driving.label,
      timer: driving.timer,
      detalj: driving.turer + ' turer x ' + ((project.indirect || {}).avstandKm || 0) + ' km = ' + driving.km + ' km',
    });
  }

  poster.push({
    key: 'rigging',
    label: rigging.label,
    timer: rigging.timer,
    detalj: 'Grunn ' + rigging.grunn + 't + lopende ' + rigging.lopende + 't'
      + (rigging.stillas > 0 ? ' + stillas ' + rigging.stillas + 't' : ''),
  });

  poster.push({
    key: 'planlegging',
    label: 'Planlegging',
    timer: planning.planlegging,
    detalj: '1t grunnlag + 3% av ' + direkteTimer + 't',
  });

  poster.push({
    key: 'opprydding',
    label: 'Opprydding',
    timer: planning.opprydding,
    detalj: ((project.indirect || {}).oppryddingPct || 3) + '% av ' + direkteTimer + 't',
  });

  poster.push({
    key: 'kvalitet',
    label: 'Kvalitetskontroll',
    timer: planning.kvalitet,
    detalj: '2% av ' + direkteTimer + 't',
  });

  var totalIndirekte = round1(poster.reduce(function(s, p) { return s + p.timer; }, 0));

  return { poster: poster, totalIndirekte: totalIndirekte };
}


// ── OPERASJONSBEREGNING (materiallinjebasert) ───────────────

/**
 * Beregner direkte timer for en enkelt operasjon fra materiallinjer.
 * Erstatter gamle calcOperationHours() som brukte jobbtype-rater.
 */
function calcOperationHours(op) {
  var materialLines = getMaterialLines(op);
  var baseHours = calcDirectBaseHours(materialLines);
  var factors = { tilkomst: op.tilkomst, hoyde: op.hoyde, kompleksitet: op.kompleksitet };
  var adj = calcAdjustments(baseHours, factors);
  var adjustedHours = baseHours + adj.tillegg;

  return {
    baseTimer: round1(baseHours),
    faktorTimer: round1(adjustedHours),
    adjustedHours: adjustedHours,
    faktorer: adj,
    materialLines: materialLines,
  };
}

/**
 * Hovedfunksjon: beregn hele prosjektet fra operations.
 */
function calcProject(project) {
  if (!project) return { direkteTimer: 0, indirektTimer: 0, totalTimer: 0, operasjoner: [], indirekte: [], laborSaleEx: 0, laborCost: 0, profit: 0, margin: 0, timeRate: 850, internalCost: 450 };

  var work = project.work || {};
  var ops = project.operations || [];
  var timeRate = Number(work.timeRate) || 850;
  var internalCost = Number(work.internalCost) || 450;

  var direkteTimer = 0;
  var breakdown = ops.map(function(op) {
    if (!op) return null;
    var result = calcOperationHours(op);
    direkteTimer += result.adjustedHours;
    var labelDef = (window.calcDefs && window.calcDefs[op.type]) || {};
    return {
      id: op.id,
      navn: op.navn || labelDef.label || '',
      type: op.type,
      mengde: op.mengde,
      enhet: '',
      baseTimer: result.baseTimer,
      faktorTimer: result.faktorTimer,
      faktorer: result.faktorer,
      materialLines: result.materialLines,
    };
  }).filter(function(x) { return x != null; });
  direkteTimer = round1(direkteTimer);

  var indirect = calcIndirectTime(project, direkteTimer);
  var totalTimer = round1(direkteTimer + indirect.totalIndirekte);

  var laborSaleEx = Math.round(totalTimer * timeRate);
  var laborCost = Math.round(totalTimer * internalCost);
  var profit = laborSaleEx - laborCost;
  var margin = laborSaleEx > 0 ? Math.round(profit / laborSaleEx * 1000) / 10 : 0;

  return {
    direkteTimer,
    indirektTimer: indirect.totalIndirekte,
    totalTimer,
    operasjoner: breakdown,
    indirekte: indirect.poster,
    laborSaleEx,
    laborCost,
    profit,
    margin,
    timeRate,
    internalCost,
  };
}


// ── FINANSIELL KALKYLE (tidl. compute() i projects.js) ───────

function compute(project){
  if (!project) return { hoursTotal: 0, laborCost: 0, laborSaleEx: 0, matCost: 0, matSaleEx: 0, extrasBase: 0, rigEx: 0, costPrice: 0, saleEx: 0, saleInc: 0, vat: 0, profit: 0, margin: 0, db: 0, totalMatCost: 0, totalMatSaleEx: 0, totalHours: 0, totalLaborSaleEx: 0, totalLaborCost: 0, totalCostPrice: 0, totalSaleEx: 0, totalProfit: 0, totalMargin: 0 };

  var work = project.work || {};
  var materials = project.materials || [];
  var extras = project.extras || {};
  var offerPosts = project.offerPosts || [];
  var indirect = project.indirect || {};

  const hoursTotal=Number(work.hours)||0;
  const timeRateNum=Number(work.timeRate)||0;
  const internalCostNum=Number(work.internalCost)||0;
  const laborCost=hoursTotal*internalCostNum;
  const laborSaleEx=hoursTotal*timeRateNum;

  // Rigg-timer: kun eksplisitt satt verdi (>0) flyttes til egen rigg-post.
  // Auto-beregnet rigg (riggTimer=null) forblir del av work.hours som i dag.
  const rigHoursExplicit=(indirect.riggTimer!=null && Number(indirect.riggTimer)>0)
    ? Number(indirect.riggTimer) : 0;
  const rigHoursSale=rigHoursExplicit*timeRateNum;
  const rigHoursCost=rigHoursExplicit*internalCostNum;
  const laborSaleExAdj=Math.max(0, laborSaleEx-rigHoursSale);
  const laborCostAdj=Math.max(0, laborCost-rigHoursCost);
  let matCost=0, matSaleEx=0;
  materials.forEach(m=>{
    const qty=Number(m.qty)||0,cost=Number(m.cost)||0,waste=Number(m.waste)||0,markup=Number(m.markup)||0;
    const withWaste=qty*cost*(1+waste/100);
    matCost+=withWaste; matSaleEx+=withWaste*(1+markup/100);
  });
  const subTotal=((extras.subcontractors)||[]).reduce((s,x)=>s+(Number(x.amount)||0),0);
  const extrasFixed=(Number(extras.rental)||0)+(Number(extras.waste)||0)+subTotal+(Number(extras.misc)||0)+(Number(extras.scaffolding)||0)+(Number(extras.drawings)||0);

  let snapMatCost=0, snapMatSaleEx=0, snapHours=0, snapLaborSaleEx=0, snapLaborCost=0;
  offerPosts.forEach(post=>{
    if(post && post.snapshotCompute && isPostInTotal(post)){
      snapMatCost+=post.snapshotCompute.matCost||0;
      snapMatSaleEx+=post.snapshotCompute.matSaleEx||0;
      const postHours=Number(post.hours)||post.snapshotCompute.hoursTotal||0;
      snapHours+=postHours;
      const rate=(post.snapshotCompute.laborSaleEx||0)/(post.snapshotCompute.hoursTotal||1);
      const internalRate=(post.snapshotCompute.laborCost||0)/(post.snapshotCompute.hoursTotal||1);
      snapLaborSaleEx+=postHours*rate;
      snapLaborCost+=postHours*internalRate;
    }
  });
  const totalMatCost=matCost+snapMatCost;
  const totalMatSaleEx=matSaleEx+snapMatSaleEx;
  const computedTotal=hoursTotal+snapHours;
  const totalHours=Number(work.hoursOverride)>0
    ? Number(work.hoursOverride)
    : computedTotal;

  const extrasBase=extrasFixed;

  const totalLaborSaleEx=laborSaleExAdj + snapLaborSaleEx;
  const totalLaborCost=laborCostAdj + snapLaborCost;

  // Rigg-% regnes av HELE jobbens salgsverdi (arbeid + materialer), inkludert
  // poster sendt til tilbud fra kalkulasjonsmotoren — ikke bare p.materials/
  // p.work.hours, som ofte står på 0 når alt er sendt til tilbud som poster.
  const rigPercentNum=(Number(extras.rigPercent)||0)/100;
  const rigPercentSale=(totalLaborSaleEx+totalMatSaleEx)*rigPercentNum;
  const rigEx=rigHoursSale+rigPercentSale;
  // Prosent-rigg har null margin (kost=salg). Rigg-timer har normal margin via internalCost.
  const rigCost=rigHoursCost+rigPercentSale;
  const costPrice=laborCostAdj+matCost+extrasBase+rigCost;
  const saleEx=laborSaleExAdj+matSaleEx+extrasBase+rigEx;
  const saleInc=saleEx*1.25, profit=saleEx-costPrice;
  const margin=saleEx?(profit/saleEx*100):0;

  const totalCostPrice=totalLaborCost+totalMatCost+extrasBase+rigCost;
  const totalSaleEx=totalLaborSaleEx+totalMatSaleEx+extrasBase+rigEx;
  const totalProfit=totalSaleEx-totalCostPrice;
  const totalMargin=totalSaleEx?(totalProfit/totalSaleEx*100):0;

  const totalWorkHours=Math.max(0, totalHours - rigHoursExplicit);
  return {hoursTotal,laborCost,laborSaleEx,matCost,matSaleEx,extrasBase,rigEx,rigCost,rigHours:rigHoursExplicit,costPrice,saleEx,saleInc,vat:saleEx*0.25,profit,margin,db:margin,
    totalMatCost,totalMatSaleEx,totalHours,totalWorkHours,totalLaborSaleEx,totalLaborCost,totalCostPrice,totalSaleEx,totalProfit,totalMargin};
}


const CHANGE_ORDER_TYPE='tillegg';
const ChangeOrderStatus={ Draft:'utkast', Sent:'sendt', Approved:'godkjent', Rejected:'avvist' };

function isChangeOrder(post){
  return !!post && post.type===CHANGE_ORDER_TYPE;
}

// Opsjoner vises i tilbudet, men regnes kun med når kunden har valgt dem.
// Tillegg (endringsmeldinger) står utenfor det opprinnelige tilbudet og
// summeres separat i computeChangeOrdersTotal.
function isPostInTotal(post){
  if(isChangeOrder(post)) return false;
  return post.type!=='option' || !!post.enabled;
}

function computeChangeOrdersTotal(p){
  let approved=0, pending=0, approvedCount=0, pendingCount=0;
  ((p&&p.offerPosts)||[]).filter(isChangeOrder).forEach(post=>{
    const price=Number(post.price)||0;
    const status=(post.changeOrder||{}).status;
    if(status===ChangeOrderStatus.Approved){ approved+=price; approvedCount++; }
    else if(status!==ChangeOrderStatus.Rejected){ pending+=price; pendingCount++; }
  });
  return {approved, pending, approvedCount, pendingCount};
}

// ── TILBUDSPOST-SUMMERING (tidl. computeOfferPostsTotal() i app.js) ──

function computeOfferPostsTotal(p){
  if(!p || !p.offerPosts || !p.offerPosts.length) return {fixed:0,options:0,total:0,hours:0};
  let fixed=0,options=0,hours=0;
  p.offerPosts.forEach(post=>{
    if(!post || !isPostInTotal(post)) return;
    hours+=Number(post.snapshotCompute?.hoursTotal)||0;
    const price=Number(post.price)||0;
    if(post.type==='option') options+=price; else fixed+=price;
  });
  return {fixed,options,total:fixed+options,hours};
}

// Egendefinerte tilbudsposter peker på ekte poster via sourceIds, så prisen
// følger postene (f.eks. ved endret timepris). cp.price er kun fallback for
// poster uten kobling.
function getCustomPostPrice(p, cp, isTotalOnly){
  const ids=cp.sourceIds||[];
  if(!ids.length) return Number(cp.price)||0;
  return (p.offerPosts||[])
    .filter(post=>post&&ids.includes(post.id)&&(!isTotalOnly||isPostInTotal(post)))
    .reduce((s,post)=>s+(Number(post.price)||0),0);
}


// ── PRISOVERSLAGETS SUM OG SAMMENDRAG ────────────────────────

const EXTRA_POST_IDS={ rig:'__rigg', waste:'__waste', scaffolding:'__scaffolding', drawings:'__drawings', rental:'__rental', misc:'__misc' };
// Over dette blir «rabattrom» meningsløst (kostnaden deles på nær null).
const MAX_MARGIN_GOAL_PCT=90;

function isMaterialWithoutPrice(m){
  return !!m && !(Number(m.cost)>0);
}

// Prosjektkostnader (rigg/drift, UE, leie m.m.) som egne linjer i prisoverslaget.
// Stillas prises via stillas-operasjonen når den finnes, så feltet telles da ikke.
function getExtraPosts(p){
  var posts=[];
  var extras=p.extras||{};
  var cv=compute(p);
  var rental=Number(extras.rental)||0;
  var waste=Number(extras.waste)||0;
  var harStillasOp=(p.operations||[]).some(function(op){ return op && op.type==='stillas'; });
  var scaffolding=harStillasOp ? 0 : (Number(extras.scaffolding)||0);
  var drawings=Number(extras.drawings)||0;
  var misc=Number(extras.misc)||0;
  var rigEx=cv.rigEx||0;
  var subTotal=(extras.subcontractors||[]).reduce(function(s,x){return s+(Number(x.amount)||0);},0);

  if(subTotal>0){
    (extras.subcontractors||[]).forEach(function(s){
      if(Number(s.amount)>0) posts.push({id:'__sub_'+s.id,name:s.trade,amount:Number(s.amount)});
    });
  }
  if(rental>0) posts.push({id:EXTRA_POST_IDS.rental,name:'Leie av utstyr',amount:rental});
  if(waste>0) posts.push({id:EXTRA_POST_IDS.waste,name:'Avfall / deponi',amount:waste});
  if(scaffolding>0) posts.push({id:EXTRA_POST_IDS.scaffolding,name:'Stillas',amount:scaffolding});
  if(drawings>0) posts.push({id:EXTRA_POST_IDS.drawings,name:'Tegninger / byggesøknad',amount:drawings});
  if(misc>0) posts.push({id:EXTRA_POST_IDS.misc,name:'Diverse',amount:misc});
  if(rigEx>0) posts.push({id:EXTRA_POST_IDS.rig,name:'Rigg og Drift',amount:rigEx});
  return posts;
}

function isExtraPostChecked(os, extraPost){
  return os.extraPostsChecked[extraPost.id]!==false;
}

// Summen kunden ser i prisoverslaget, eks. mva. Samme regler som dokumentet
// for hver postvisning, så Prisoverslag-fanen og PDF-en alltid viser samme tall.
function computeOfferDocumentTotal(p, os){
  const cv=compute(p);
  const sumPositive=values=>values.filter(v=>v>0).reduce((s,v)=>s+v,0);
  if(os.postMode==='simple') return sumPositive([cv.totalLaborSaleEx, cv.totalMatSaleEx, cv.extrasBase+cv.rigEx]);
  let total=0;
  if(os.postMode==='custom'){
    (os.customPosts||[]).forEach(cp=>{ total+=getCustomPostPrice(p,cp,true); });
  } else if(p.offerPosts&&p.offerPosts.length){
    p.offerPosts.filter(post=>!isChangeOrder(post)&&isPostInTotal(post)).forEach(post=>{ total+=Number(post.price)||0; });
  } else {
    total+=sumPositive([cv.totalLaborSaleEx, cv.totalMatSaleEx]);
  }
  getExtraPosts(p).forEach(ep=>{ if(isExtraPostChecked(os,ep)) total+=ep.amount; });
  return total;
}

// Tallene i sammendraget på Prisoverslag-fanen. Totalen er dokumentets sum, og
// fordelingen regnes fra de samme postene og prosjektkostnadene, så delene
// alltid summerer til totalen.
function computeOfferSummary(p, os, marginGoalPct){
  const totalEx=computeOfferDocumentTotal(p, os);
  const mix=os.postMode==='simple' ? getSimpleOfferMix(p) : getPostOfferMix(p, os);
  const profitEx=totalEx-mix.costEx;
  const goalShare=Math.min(Math.max(Number(marginGoalPct)||0,0),MAX_MARGIN_GOAL_PCT)/100;
  return {
    totalEx,
    parts:mix.parts,
    hours:mix.hours,
    costEx:mix.costEx,
    profitEx,
    marginPct:totalEx ? profitEx/totalEx*100 : 0,
    earningsPerHour:mix.hours ? profitEx/mix.hours : 0,
    // Hvor mye prisen kan settes ned før marginen går under målet
    // (negativt: hvor mye som mangler for å nå det).
    discountRoomEx:totalEx-mix.costEx/(1-goalShare),
    uncalculatedPostCount:mix.uncalculatedPostCount,
    options:getOfferOptionTotals(p, os),
    changeOrders:getChangeOrderSummary(p)
  };
}

function getSimpleOfferMix(p){
  const cv=compute(p);
  const waste=Number((p.extras||{}).waste)||0;
  return {
    parts:{labor:cv.totalLaborSaleEx, material:cv.totalMatSaleEx, fixed:0, rig:cv.rigEx, waste, other:cv.extrasBase-waste},
    hours:cv.totalHours,
    costEx:cv.totalCostPrice,
    uncalculatedPostCount:0
  };
}

function getPostOfferMix(p, os){
  const cv=compute(p);
  const parts={labor:0, material:0, fixed:0, rig:0, waste:0, other:0};
  let hours=cv.rigHours, costEx=cv.rigCost, uncalculatedPostCount=0;
  const fallbackInternalRate=Number((p.work||{}).internalCost)||0;
  getDocumentPricedPosts(p, os).forEach(item=>{
    const split=item.post ? splitOfferPost(item.post, fallbackInternalRate) : splitUncalculatedPrice(item.price);
    parts.labor+=split.labor; parts.material+=split.material; parts.fixed+=split.fixed;
    hours+=split.hours; costEx+=split.costEx;
    if(!split.isCalculated) uncalculatedPostCount++;
  });
  if(!(p.offerPosts&&p.offerPosts.length)&&os.postMode!=='custom'){
    parts.labor+=Math.max(cv.totalLaborSaleEx,0); parts.material+=Math.max(cv.totalMatSaleEx,0);
    hours+=cv.totalWorkHours; costEx+=cv.totalLaborCost+cv.totalMatCost;
  }
  // Prosjektkostnadene koster det samme selv om de er tatt ut av dokumentet.
  getExtraPosts(p).forEach(ep=>{
    if(ep.id!==EXTRA_POST_IDS.rig) costEx+=ep.amount;
    if(!isExtraPostChecked(os,ep)) return;
    if(ep.id===EXTRA_POST_IDS.rig) parts.rig+=ep.amount;
    else if(ep.id===EXTRA_POST_IDS.waste) parts.waste+=ep.amount;
    else parts.other+=ep.amount;
  });
  return {parts, hours, costEx, uncalculatedPostCount};
}

// Postene som utgjør postdelen av dokumentets sum, i samme utvalg som
// computeOfferDocumentTotal: sammenslåtte grupper eller alle poster som er med.
function getDocumentPricedPosts(p, os){
  const posts=p.offerPosts||[];
  if(os.postMode==='custom'){
    return (os.customPosts||[]).flatMap(cp=>{
      const ids=cp.sourceIds||[];
      if(!ids.length) return [{post:null, price:Number(cp.price)||0}];
      return posts.filter(post=>post&&ids.includes(post.id)&&isPostInTotal(post)).map(post=>({post, price:Number(post.price)||0}));
    });
  }
  return posts.filter(post=>!isChangeOrder(post)&&isPostInTotal(post)).map(post=>({post, price:Number(post.price)||0}));
}

// Deler en posts pris i arbeid og materialer. Poster uten kalkyle (manuell
// fastpris) har ukjent kostnad og regnes uten fortjeneste.
function splitOfferPost(post, fallbackInternalRate){
  const price=Number(post.price)||0;
  const sc=post.snapshotCompute||{};
  const snapshotHours=Number(sc.hoursTotal)||0;
  const hours=Number(post.hours)||snapshotHours;
  const material=Number(sc.matSaleEx)||0;
  if(!hours&&!material) return splitUncalculatedPrice(price);
  const internalRate=snapshotHours ? (Number(sc.laborCost)||0)/snapshotHours : fallbackInternalRate;
  return {labor:price-material, material, fixed:0, hours, costEx:hours*internalRate+(Number(sc.matCost)||0), isCalculated:true};
}

function splitUncalculatedPrice(price){
  return {labor:0, material:0, fixed:price, hours:0, costEx:price, isCalculated:false};
}

// Hva prisoverslaget blir om kunden velger en opsjon (rigg-% følger med).
function getOfferOptionTotals(p, os){
  return (p.offerPosts||[]).filter(post=>post&&post.type==='option'&&!post.enabled).map(option=>{
    const withOption={...p, offerPosts:p.offerPosts.map(post=>post===option ? {...post, enabled:true} : post)};
    return {id:option.id, name:option.name||'Opsjon', totalEx:computeOfferDocumentTotal(withOption, os)};
  });
}

function getChangeOrderSummary(p){
  const totals=computeChangeOrdersTotal(p);
  const approved=(p.offerPosts||[])
    .filter(post=>isChangeOrder(post)&&(post.changeOrder||{}).status===ChangeOrderStatus.Approved)
    .map(post=>({id:post.id, number:(post.changeOrder||{}).number, name:post.name||'Tillegg', priceEx:Number(post.price)||0}));
  return {approved, approvedEx:totals.approved, pendingCount:totals.pendingCount, pendingEx:totals.pending};
}

// Sjekkliste før prisoverslaget sendes. Hvert punkt har tekst både for ok og
// for mangel, så status aldri bare vises med farge.
function getOfferReadiness(p, os, customer){
  const posts=(p.offerPosts||[]).filter(post=>post&&!isChangeOrder(post));
  const missingPrices=posts.reduce((n,post)=>n+(post.snapshotMaterials||[]).filter(isMaterialWithoutPrice).length,0);
  const pricedExtraIds=getPricedExtraIds(p, os);
  const hasRig=pricedExtraIds.includes(EXTRA_POST_IDS.rig);
  const conflicts=getNotIncludedConflicts(p, os, pricedExtraIds);
  const hasEmail=!!(customer&&String(customer.email||'').trim());
  return [
    {id:'materialPrices', isOk:!missingPrices,
      text:!missingPrices ? 'Alle materialer har pris' : missingPrices+(missingPrices===1?' materiale mangler pris':' materialer mangler pris')},
    {id:'rig', isOk:hasRig, text:hasRig ? 'Rigg og drift er med' : 'Rigg og drift er ikke med'},
    {id:'notIncluded', isOk:!conflicts.length,
      text:!conflicts.length ? '«Ikke medregnet» stemmer med prisen' : capitalize(joinWithAnd(conflicts))+' er priset, men står under «Ikke medregnet»'},
    {id:'customerEmail', isOk:hasEmail, text:hasEmail ? 'Kunden har e-post' : (customer ? 'Kunden mangler e-post' : 'Ingen kunde er valgt')}
  ];
}

// Prosjektkostnadene som faktisk står i dokumentet. Enkel visning slår dem
// sammen uten avkrysning; de andre visningene følger avkrysningen.
function getPricedExtraIds(p, os){
  const extras=getExtraPosts(p);
  return (os.postMode==='simple' ? extras : extras.filter(ep=>isExtraPostChecked(os,ep))).map(ep=>ep.id);
}

// Punkter som både er priset og står som «ikke medregnet» — kunden får da
// motstridende beskjed.
function getNotIncludedConflicts(p, os, pricedExtraIds){
  const notIncluded=os.ikkemedregnet||{};
  const hasScaffoldingOperation=(p.operations||[]).some(op=>op&&op.type==='stillas');
  const conflicts=[];
  if(notIncluded.avfall&&pricedExtraIds.includes(EXTRA_POST_IDS.waste)) conflicts.push('avfall');
  if(notIncluded.stillas&&(hasScaffoldingOperation||pricedExtraIds.includes(EXTRA_POST_IDS.scaffolding))) conflicts.push('stillas');
  if(notIncluded.byggesoknad&&pricedExtraIds.includes(EXTRA_POST_IDS.drawings)) conflicts.push('byggesøknad');
  return conflicts;
}

function joinWithAnd(words){
  return words.length>1 ? words.slice(0,-1).join(', ')+' og '+words[words.length-1] : (words[0]||'');
}

function capitalize(text){
  return text.charAt(0).toUpperCase()+text.slice(1);
}


// ── TILBUDSOPPFØLGING ────────────────────────────────────────

const FOLLOW_UP_AFTER_DAYS=7;
const DAY_MS=24*60*60*1000;
const WON_STATUSES=['Vunnet','Pågår','Ferdig'];

// Setter status og husker når tilbudet ble sendt — grunnlaget for oppfølging.
function setProjectStatus(p, status, now){
  if(status==='Sendt'&&p.status!=='Sendt'){
    p.sentAt=now;
    p.followUpSnoozedUntil=0;
  }
  p.status=status;
}

// Sendte tilbud uten svar i FOLLOW_UP_AFTER_DAYS dager, eldste først.
// Eldre prosjekter uten sentAt bruker updatedAt som beste anslag.
function getOfferFollowUps(projects, now){
  return (projects||[])
    .filter(p=>p.status==='Sendt'&&!((p.followUpSnoozedUntil||0)>now))
    .map(p=>{
      const sentAt=p.sentAt||p.updatedAt||now;
      return {project:p, sentAt, isSentAtKnown:!!p.sentAt, daysSinceSent:Math.floor((now-sentAt)/DAY_MS)};
    })
    .filter(f=>f.daysSinceSent>=FOLLOW_UP_AFTER_DAYS)
    .sort((a,b)=>a.sentAt-b.sentAt);
}

// Andel vunnet av avgjorte tilbud (vunnet + tapt). Tilbud som venter på svar
// teller ikke, ellers ville raten falle hver gang et nytt tilbud sendes.
function computeWinRate(projects){
  const {won, decided}=countDecidedOffers(projects);
  return decided?Math.round(won/decided*100):0;
}

function countDecidedOffers(projects){
  const won=(projects||[]).filter(p=>WON_STATUSES.includes(p.status)).length;
  const lost=(projects||[]).filter(p=>p.status==='Tapt').length;
  return {won, decided:won+lost};
}

// Kontraktssummen: prisoverslaget pluss godkjente tillegg.
function computeContractSum(p, os){
  return computeOfferDocumentTotal(p, os)+computeChangeOrdersTotal(p).approved;
}

// Nøkkeltallene på forsiden. offerStateFor(p) gir prisoverslagets
// innstillinger, så summene er de samme som i dokumentene.
function computeDashboardSummary(projects, offerStateFor, marginGoalPct){
  const list=projects||[];
  const inProgress=list.filter(p=>p.status==='Pågår');
  const won=list.filter(p=>p.status==='Vunnet');
  const sent=list.filter(p=>p.status==='Sendt');
  const open=sent.concat(won, inProgress);
  const summaries=new Map(open.map(p=>[p, computeOfferSummary(p, offerStateFor(p), marginGoalPct)]));
  const sum=(items, fn)=>items.reduce((s,item)=>s+fn(item),0);
  const openTotalEx=sum(open, p=>summaries.get(p).totalEx);
  return {
    contractsEx:sum(won.concat(inProgress), p=>computeContractSum(p, offerStateFor(p))),
    inProgressCount:inProgress.length,
    wonCount:won.length,
    sentEx:sum(sent, p=>summaries.get(p).totalEx),
    sentCount:sent.length,
    // Vektet snitt over åpne prisoverslag: samlet fortjeneste delt på samlet pris.
    marginPct:openTotalEx ? sum(open, p=>summaries.get(p).profitEx)/openTotalEx*100 : null,
    optionsEx:sum(open, p=>(p.offerPosts||[]).filter(post=>post&&post.type==='option'&&!post.enabled).reduce((s,post)=>s+(Number(post.price)||0),0)),
    hoursProgress:inProgress
      .map(p=>({id:p.id, name:p.name||'Uten navn', actualHours:Number((p.work||{}).actualHours)||0, estimatedHours:summaries.get(p).hours}))
      .filter(item=>item.estimatedHours>0)
  };
}


// ── HJELPEFUNKSJONER ─────────────────────────────────────────

/** Opprett en blank operasjon */
function blankOperation() {
  return {
    id: uid(),
    type: 'annet',
    navn: '',
    mengde: 0,
    tilkomst: 'normal',
    hoyde: 'bakke',
    kompleksitet: 'normal',
  };
}


// ── WARNINGS ─────────────────────────────────────────────────

// Varsler med kode vises også i sammendraget på Prisoverslag-fanen, som
// filtrerer dem bort fra varsellisten så de ikke står to ganger.
const WarningCode={ Margin:'margin', MaterialPrice:'materialPrice' };

function generateWarnings(project, computeResult) {
  if (!project) return [];

  var ops = project.operations || [];
  var indirect = project.indirect || {};
  var extras = project.extras || {};
  var materials = project.materials || [];
  var offerPosts = project.offerPosts || [];
  var c = computeResult || {};
  var type = (project.type || '').toLowerCase();
  var margin = c.totalMargin || c.margin || 0;
  var w = [];

  var isRehab = type === 'rehabilitering' || type === 'bad';
  if (isRehab) {
    var harRiving = ops.some(function(op) { return op && op.type === 'riving'; });
    if (!harRiving) {
      w.push({ severity: 'warning', text: 'Rehabilitering uten riving — har du husket rivearbeid?' });
    }
    if (!(extras.waste > 0)) {
      w.push({ severity: 'warning', text: 'Ingen avfallskostnad — rehab genererer vanligvis avfall.' });
    }
  }

  var harVanskelig = ops.some(function(op) {
    return op && (op.tilkomst === 'vanskelig' || op.tilkomst === 'svart');
  });
  if (harVanskelig && !(extras.scaffolding > 0) && !(extras.rental > 0)) {
    w.push({ severity: 'warning', text: 'Vanskelig tilkomst uten stillas eller utstyrsleie — vurder ekstra kostnad.' });
  }

  var harHoy = ops.some(function(op) {
    return op && (op.hoyde === 'middels' || op.hoyde === 'hoy');
  });
  if (harHoy) {
    if (!(extras.scaffolding > 0)) {
      w.push({ severity: 'danger', text: 'Arbeid i hoyde uten stillas — dette er et HMS-krav over 2 meter.' });
    }
  }

  if (project.bebodd) {
    w.push({ severity: 'info', text: 'Bebodd bolig — husk stovtetting, tildekning og ekstra ryddetid.' });
    var oppryddingPct = indirect.oppryddingPct != null ? Number(indirect.oppryddingPct) : 3;
    if (oppryddingPct < 5) {
      w.push({ severity: 'warning', text: 'Bebodd bolig med kun ' + oppryddingPct + '% opprydding — anbefalt minst 5%.' });
    }
  }

  if (c.totalSaleEx > 0 && margin < 10) {
    w.push({ severity: 'danger', code: WarningCode.Margin, text: 'Margin under 10% (' + Math.round(margin) + '%) — hoy risiko for tap.' });
  } else if (c.totalSaleEx > 0 && margin < 20) {
    w.push({ severity: 'warning', code: WarningCode.Margin, text: 'Margin under 20% (' + Math.round(margin) + '%) — vurder om prisene dekker uforutsett.' });
  }

  var allMats = materials.concat(
    offerPosts.reduce(function(acc, post) {
      return acc.concat((post && post.snapshotMaterials) || []);
    }, [])
  );
  var utenPris = allMats.filter(isMaterialWithoutPrice);
  if (utenPris.length > 0) {
    w.push({ severity: 'warning', code: WarningCode.MaterialPrice, text: utenPris.length + ' materiale(r) mangler pris — prisoverslaget kan bli for lavt.' });
  }

  var totalHours = c.totalHours || 0;
  if (totalHours === 0 && offerPosts.length > 0) {
    w.push({ severity: 'danger', text: 'Prisoverslag uten timer — har du lagt inn arbeidstid?' });
  }

  if (!(indirect.avstandKm > 0) && ops.length > 0) {
    w.push({ severity: 'info', text: 'Ingen avstand oppgitt — kjoring er ikke med i kalkulasjonen.' });
  }

  if (indirect.avstandKm > 60) {
    w.push({ severity: 'warning', text: 'Lang reisevei (' + indirect.avstandKm + ' km) — vurder om kjoring dekkes i prisoverslaget.' });
  }

  if (!offerPosts.length && materials.length > 0) {
    w.push({ severity: 'info', text: 'Materialer finnes, men ingen poster — husk å sende til prisoverslag.' });
  }


  var order = { danger: 0, warning: 1, info: 2 };
  w.sort(function(a, b) { return (order[a.severity] || 9) - (order[b.severity] || 9); });

  return w;
}


// ── SAMLET OPERASJONSESTIMATE (timer + materialer) ─────────────

// ── PRISOPPSLAG MED FALLBACK ─────────────────────────────────

function findCatalogPrice(name, priceCatalog, manualPrices) {
  var unit = 'stk';
  // 1. Manuelle prisoverrides (prosjektnivå)
  if (manualPrices) {
    var normKey = normalizeMaterialName(name);
    for (var mk in manualPrices) {
      if (manualPrices.hasOwnProperty(mk) && normalizeMaterialName(mk) === normKey) {
        return { cost: Number(manualPrices[mk]) || 0, unit: unit, source: 'manual' };
      }
    }
  }
  if (!priceCatalog || typeof priceCatalog !== 'object') return { cost: 0, unit: unit, source: 'none' };

  // 2. Eksakt match
  if (priceCatalog[name]) return { cost: priceCatalog[name].cost || 0, unit: priceCatalog[name].unit || unit, source: 'exact' };

  // 3. Match uten parenteser og normalisert
  var stripped = (name || '').replace(/\s*\([^)]*\)\s*/g, ' ').trim();
  if (stripped !== name && priceCatalog[stripped]) return { cost: priceCatalog[stripped].cost || 0, unit: priceCatalog[stripped].unit || unit, source: 'normalized' };

  // 4. Fuzzy: substring + token-matching (samme logikk som autoMatchPrice)
  var q = (name || '').toLowerCase().replace(/\s*\([^)]*\)\s*/g, ' ').trim();
  var keys = Object.keys(priceCatalog);
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i].toLowerCase();
    if (q.includes(k) && k.length > 3) return { cost: priceCatalog[keys[i]].cost || 0, unit: priceCatalog[keys[i]].unit || unit, source: 'fuzzy' };
    if (k.includes(q) && q.length > 3) return { cost: priceCatalog[keys[i]].cost || 0, unit: priceCatalog[keys[i]].unit || unit, source: 'fuzzy' };
  }

  // 5. Token-based: match if ≥40% of tokens hit
  var tokens = q.split(/[\s×x\/\-]+/).filter(function(t) { return t.length > 2; });
  if (tokens.length > 0) {
    var bestMatch = null, bestScore = 0;
    for (var j = 0; j < keys.length; j++) {
      var kk = keys[j].toLowerCase();
      var score = 0;
      for (var t = 0; t < tokens.length; t++) {
        if (kk.includes(tokens[t])) score++;
      }
      if (score > bestScore && score >= Math.ceil(tokens.length * 0.4)) {
        bestScore = score;
        bestMatch = priceCatalog[keys[j]];
      }
    }
    if (bestMatch) return { cost: bestMatch.cost || 0, unit: bestMatch.unit || unit, source: 'token' };
  }

  return { cost: 0, unit: unit, source: 'none' };
}


function buildOperationEstimate(op, priceCatalog, manualPrices) {
  if (!op) return { direkteTimer: 0, materialer: [], totalMaterialCost: 0, errors: [] };

  priceCatalog = priceCatalog || {};
  var errors = [];

  // 1. BEREGN TIMER fra materiallinjer (ny modell)
  var timeResult = calcOperationHours(op);
  var direkteTimer = timeResult.faktorTimer;

  // 2. PRIS-OPPSLAG for materiallinjene
  var materialLines = timeResult.materialLines || [];
  var materialer = [];
  var totalMaterialCost = 0;

  try {
    materialer = materialLines.map(function(m) {
      var catalogEntry = findCatalogPrice(m.name, priceCatalog, manualPrices);
      var qty = Number(m.qty) || 0;
      var cost = m.cost != null ? (Number(m.cost) || 0) : (Number(catalogEntry.cost) || 0);
      var waste = Number(m.waste) || 0;

      var withWaste = qty * cost * (1 + waste / 100);
      totalMaterialCost += withWaste;

      var qtyWithWaste = Math.ceil(qty * (1 + waste / 100) * 10) / 10;
      return {
        name: m.name,
        qty: qty,
        qtyWithWaste: qtyWithWaste,
        unit: m.unit || catalogEntry.unit || 'stk',
        waste: waste,
        cost: cost,
        totalCost: Math.round(withWaste),
        priceSource: catalogEntry.source || 'none',
        laborId: m.laborId || null,
        lineHours: round1(calcLineHours(m)),
      };
    });
  } catch (e) {
    errors.push('Material-beregning feilet for ' + op.type + ': ' + e.message);
  }

  return {
    direkteTimer: direkteTimer,
    timeResult: timeResult,
    materialer: materialer,
    totalMaterialCost: Math.round(totalMaterialCost),
    errors: errors
  };
}


/**
 * Beregn komplett estimate for hele prosjektet (kombinert timer + materialer)
 * @param {Object} project - prosjekt {operations, work, extras, materials}
 * @param {Object} priceCatalog - {materialName: {cost, unit}, ...}
 * @returns {Object} {direkteTimer, indirektTimer, totalTimer, operations: [], totalMaterialCost, totalCost, ...}
 */
function buildProjectEstimate(project, priceCatalog) {
  if (!project) return { direkteTimer: 0, indirektTimer: 0, totalTimer: 0, operations: [], totalMaterialCost: 0, errors: [] };

  priceCatalog = priceCatalog || {};
  var manualPrices = (project && project.manualPrices) || {};
  var errors = [];

  // 1. BEREGN TIMER via calcProject()
  var timeCalc = window.calcProject(project);

  // 2. BEREGN MATERIALER for hver operasjon
  var ops = project.operations || [];
  var operationEstimates = [];
  var totalMaterialCost = 0;

  ops.forEach(function(op) {
    if (!op) return;
    var opEst = buildOperationEstimate(op, priceCatalog, manualPrices);
    totalMaterialCost += opEst.totalMaterialCost || 0;

    operationEstimates.push({
      operationId: op.id,
      navn: op.navn || '',
      type: op.type,
      estimate: opEst
    });

    if (opEst.errors && opEst.errors.length) {
      errors = errors.concat(opEst.errors);
    }
  });

  // 3. BEREGN TOTALKOSTNADER
  var work = project.work || {};
  var timeRate = Number(work.timeRate) || 850;
  var internalCost = Number(work.internalCost) || 450;
  var laborCost = timeCalc.totalTimer * internalCost;
  var laborSaleEx = Math.round(timeCalc.totalTimer * timeRate);

  var totalCost = laborCost + totalMaterialCost;
  var totalSaleEx = laborSaleEx + totalMaterialCost;
  var profit = totalSaleEx - totalCost;
  var margin = totalSaleEx > 0 ? Math.round(profit / totalSaleEx * 1000) / 10 : 0;

  // 4. INKLUDER MATERIALER FRA TILBUDSPOSTER (snapshotMaterials)
  var offerPostMats = [];
  (project.offerPosts || []).forEach(function(post) {
    if (!post || !post.snapshotMaterials || !post.snapshotMaterials.length) return;
    var postMats = post.snapshotMaterials.map(function(m) {
      var qty = Number(m.qty) || 0;
      var waste = Number(m.waste) || 0;
      var qtyWithWaste = Math.ceil(qty * (1 + waste / 100) * 10) / 10;
      return {
        name: m.name || '',
        qty: qty,
        qtyWithWaste: qtyWithWaste,
        unit: m.unit || 'stk',
        waste: waste,
        cost: Number(m.cost) || 0,
        totalCost: Number(m.totalCost) || 0
      };
    });
    offerPostMats.push({
      operationId: post.id,
      navn: post.name || 'Post',
      type: 'offerPost',
      estimate: { materialer: postMats }
    });
    totalMaterialCost += postMats.reduce(function(s, m) { return s + (m.totalCost || 0); }, 0);
  });

  var allEstimates = operationEstimates.concat(offerPostMats);
  var materialer = aggregateMaterials(allEstimates);

  return {
    direkteTimer: timeCalc.direkteTimer,
    indirektTimer: timeCalc.indirektTimer,
    totalTimer: timeCalc.totalTimer,

    laborCost: Math.round(laborCost),
    laborSaleEx: laborSaleEx,

    operations: operationEstimates,
    materialer: materialer,
    totalMaterialCost: Math.round(totalMaterialCost),
    totalCost: Math.round(totalCost),
    totalSaleEx: totalSaleEx,
    profit: Math.round(profit),
    margin: margin,

    errors: errors
  };
}


// ── MATERIALSAMMENSLÅING ──────────────────────────────────────

// Dimension pattern: 48×198, 48x198, 48×98 etc.
var DIMENSION_RE = /(\d{2,3})\s*[×x]\s*(\d{2,3})/;

function extractDimension(name) {
  var m = (name || '').match(DIMENSION_RE);
  return m ? m[1] + 'x' + m[2] : null;
}

// Lumber prefixes that describe the same physical material when dimensions match
var LUMBER_PREFIXES = ['virke','bjelke','bjelkelag','stender','svill','rem','sperrer','taksperrer','åser','drager'];

function normalizeMaterialName(name) {
  var s = (name || '').trim().toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/×/g, 'x')
    .replace(/\s*\/\s*/g, '/')
    .replace(/\s*mm\b/g, 'mm')
    .replace(/\s*c24\b/gi, ' c24')
    .replace(/trykkimpregnert/g, 'impregnert')
    .replace(/\s*\([^)]*\)\s*/g, ' ')
    .trim();

  // For dimensional lumber, normalize to "virke <dim>" so identical dimensions merge
  var dim = extractDimension(s);
  if (dim) {
    var firstWord = s.split(/\s/)[0].replace(/[^a-zæøå]/g, '');
    if (LUMBER_PREFIXES.indexOf(firstWord) !== -1) {
      var hasC24 = /c24/.test(s);
      s = 'virke ' + dim + (hasC24 ? ' c24' : '');
    }
  }
  return s;
}

function aggregateMaterials(operationEstimates) {
  var map = {};
  var order = [];

  operationEstimates.forEach(function(opEst) {
    var mats = (opEst.estimate && opEst.estimate.materialer) || [];
    mats.forEach(function(m) {
      var normName = normalizeMaterialName(m.name);
      var key = normName + '|' + (m.unit || 'stk');
      if (!map[key]) {
        // Build display name: for merged lumber use "Virke <dim> [C24]"
        var dim = extractDimension(m.name);
        var displayName = m.name;
        if (dim && normName.indexOf('virke') === 0) {
          var hasC24 = /c24/i.test(m.name);
          displayName = 'Virke ' + dim.replace('x', '×') + (hasC24 ? ' C24' : '');
        }
        map[key] = {
          name: displayName,
          qty: 0,
          qtyWithWaste: 0,
          unit: m.unit || 'stk',
          waste: 0,
          cost: m.cost || 0,
          totalCost: 0,
          priceSource: 'none',
          sources: []
        };
        order.push(key);
      }
      var entry = map[key];
      entry.qty += m.qty || 0;
      entry.qtyWithWaste += m.qtyWithWaste || 0;
      entry.totalCost += m.totalCost || 0;
      entry.waste = Math.max(entry.waste, m.waste || 0);
      if (m.cost > 0) { entry.cost = m.cost; entry.priceSource = m.priceSource || 'catalog'; }
      entry.sources.push(opEst.navn || opEst.type || '');
    });
  });

  return order.map(function(key) {
    var e = map[key];
    return {
      name: e.name,
      qty: Math.round(e.qty * 10) / 10,
      qtyWithWaste: Math.round(e.qtyWithWaste * 10) / 10,
      unit: e.unit,
      waste: e.waste,
      cost: e.cost,
      totalCost: Math.round(e.totalCost),
      priceSource: e.priceSource,
      sources: e.sources
    };
  });
}


// ── MATERIALKATEGORISERING ────────────────────────────────────

var MATERIAL_CATEGORIES = [
  {id:'treverk',   label:'Treverk / konstruksjon', keywords:['virke','stender','svill','rem','bjelke','sperr','drager','lekt','sl\u00F8yf','str\u00F8','stolpe','\u00E5s','rim','list','panel','kledning','fals','villmark','bord','vannbord','belistning','vinduslist','overgangslist','hj\u00F8rne','foring','terskel','h\u00E5ndl','trinn','trinns','terrassebord','rekkverksbord','sprosseverk','spindl','balust','trespon']},
  {id:'plater',    label:'Plater / undergulv',     keywords:['gips','osb','spon','kryssfin','undergulv','fiberplate','mdf','hunton','vindsperre']},
  {id:'isolasjon', label:'Isolasjon / tetting',    keywords:['isolasjon','mineralull','steinull','isopor','trefiber','dampsperre','pe-folie','fuktsperre','tape','mansjett','membran','fugetape','tettestr','pakn','fugesk']},
  {id:'betong',    label:'Betong / fundament',      keywords:['betong','armering','forskaling','fundament','mur','pukk','grus','drenering','radon','ringmur']},
  {id:'tak',       label:'Tak / tekking',           keywords:['takstein','takpanne','shingel','st\u00E5ltak','polykarb','membran','takpapp','tekking','undertaks','m\u00F8ne','beslag takfot','renne','nedl\u00F8p']},
  {id:'overflate', label:'Overflatebehandling',     keywords:['maling','grunning','beis','lakk','olje','sparkelmasse']},
  {id:'fest',      label:'Festemateriell',          keywords:['spiker','skruer','bolt','beslag','vinkel','bjelkesko','stolpesko','festemateriell','stift','dykkert','karmskruer','klammer','nagle','ankerskrue','montasje']},
  {id:'vvs',       label:'VVS / r\u00F8r',          keywords:['r\u00F8r','sluk','avl\u00F8p','membran v\u00E5t','flis','flislim','fugemasse']},
  {id:'dorer',     label:'D\u00F8rer / vinduer',    keywords:['d\u00F8r','vindu','karm','glass','port','hengsle']},
  {id:'annet',     label:'Annet',                    keywords:[]}
];

function categorizeMaterial(name) {
  var lower = (name || '').toLowerCase();
  for (var i = 0; i < MATERIAL_CATEGORIES.length - 1; i++) {
    var cat = MATERIAL_CATEGORIES[i];
    for (var j = 0; j < cat.keywords.length; j++) {
      if (lower.indexOf(cat.keywords[j]) !== -1) return cat.id;
    }
  }
  return 'annet';
}

function groupMaterialsByCategory(materials) {
  var groups = {};
  MATERIAL_CATEGORIES.forEach(function(cat) { groups[cat.id] = []; });
  materials.forEach(function(m) {
    var catId = categorizeMaterial(m.name);
    groups[catId].push(m);
  });
  return MATERIAL_CATEGORIES.filter(function(cat) {
    return groups[cat.id].length > 0;
  }).map(function(cat) {
    var items = groups[cat.id];
    var catCost = items.reduce(function(s, m) { return s + (m.totalCost || 0); }, 0);
    return { id: cat.id, label: cat.label, items: items, totalCost: catCost };
  });
}




// ── EKSPORTER TIL GLOBALT SCOPE ──────────────────────────────

window.round1 = round1;
window.getLaborRate = getLaborRate;
window.saveLaborRate = saveLaborRate;
window.calcLineHours = calcLineHours;
window.calcDirectBaseHours = calcDirectBaseHours;
window.calcAdjustments = calcAdjustments;
window.calcAdjustedDirectHours = calcAdjustedDirectHours;
window.getMaterialLines = getMaterialLines;
window.calculateDrivingTime = calculateDrivingTime;
window.calculateRiggingTime = calculateRiggingTime;
window.calculatePlanningTime = calculatePlanningTime;
window.calcIndirectTime = calcIndirectTime;
window.calcOperationHours = calcOperationHours;
window.calcProject = calcProject;
window.compute = compute;
window.computeOfferPostsTotal = computeOfferPostsTotal;
window.getCustomPostPrice = getCustomPostPrice;
window.isPostInTotal = isPostInTotal;
window.isChangeOrder = isChangeOrder;
window.setProjectStatus = setProjectStatus;
window.getOfferFollowUps = getOfferFollowUps;
window.computeWinRate = computeWinRate;
window.FOLLOW_UP_AFTER_DAYS = FOLLOW_UP_AFTER_DAYS;
window.DAY_MS = DAY_MS;
window.computeChangeOrdersTotal = computeChangeOrdersTotal;
window.CHANGE_ORDER_TYPE = CHANGE_ORDER_TYPE;
window.ChangeOrderStatus = ChangeOrderStatus;
window.blankOperation = blankOperation;
window.generateWarnings = generateWarnings;
window.findCatalogPrice = findCatalogPrice;
window.buildOperationEstimate = buildOperationEstimate;
window.buildProjectEstimate = buildProjectEstimate;
window.aggregateMaterials = aggregateMaterials;
window.normalizeMaterialName = normalizeMaterialName;
window.MATERIAL_CATEGORIES = MATERIAL_CATEGORIES;
window.categorizeMaterial = categorizeMaterial;
window.groupMaterialsByCategory = groupMaterialsByCategory;
