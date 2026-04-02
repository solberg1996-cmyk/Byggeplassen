// ============================================================
// calcEngine.js — All beregningslogikk, ingen UI
// ============================================================
// Avhenger av productionData.js (lastes for denne filen).
// Bruker globale: productionRates, accessFactors, heightFactors,
//   complexityFactors, calcDefaults, state, uid()
// ============================================================

// ── HJELPEFUNKSJON ───────────────────────────────────────────

function round1(n) { return Math.round((Number(n) || 0) * 10) / 10; }


// ── BASISTID-OPPSLAG ─────────────────────────────────────────

/**
 * Hent basistid for en jobbtype og et niva.
 * @param {string} jobType  - Nokkel i productionRates (f.eks. 'terrasse')
 * @param {string} [level]  - 'low' | 'normal' | 'high'  (default: 'normal')
 * @returns {number} Timer per enhet
 */
function getBaseTime(jobType, level) {
  var entry = productionRates[jobType] || productionRates.annet;
  var lvl = (level && entry[level] != null) ? level : 'normal';
  return entry[lvl];
}

/**
 * Henter effektiv produksjonsrate for en operasjonstype.
 * Bruker brukerens erfaringstall hvis lagret, ellers standard.
 */
function getProductionRate(type) {
  const userRate = (state.calcRates || {})[type];
  if (userRate != null) return userRate;
  return getBaseTime(type, 'normal');
}

/**
 * Henter rate for materialkalkulator.
 * Bruker brukerens erfaringstall, ellers calcDefaults.
 */
function getCalcRate(type){
  const user=(state.calcRates||{})[type];
  return user!=null ? user : calcDefaults[type]?.tPerM2 ?? 1;
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
  var stillas = harHoyde ? round1(Math.max(direkteTimer * 0.04, 1)) : 0;

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


// ── OPERASJONSBEREGNING ──────────────────────────────────────

/**
 * Beregner direkte timer for en enkelt operasjon.
 */
function calcOperationHours(op) {
  const userRate = (state.calcRates || {})[op.type || 'annet'];
  const rate = userRate != null ? userRate : getBaseTime(op.type || 'annet', op.level || 'normal');
  const mengde = Number(op.mengde) || 0;

  const baseTimer = mengde * rate;

  const af = (accessFactors[op.tilkomst] || accessFactors.normal).factor;
  const hf = (heightFactors[op.hoyde] || heightFactors.bakke).factor;
  const cf = (complexityFactors[op.kompleksitet] || complexityFactors.normal).factor;

  const samletFaktor = af * hf * cf;
  const faktorTimer = round1(baseTimer * samletFaktor);

  return {
    baseTimer: round1(baseTimer),
    faktorTimer,
    faktorer: { tilkomst: af, hoyde: hf, kompleksitet: cf, samlet: Math.round(samletFaktor * 100) / 100 },
  };
}

/**
 * Hovedfunksjon: beregn hele prosjektet fra operations.
 */
function calcProject(project) {
  if (!project) return { direkteTimer: 0, indirektTimer: 0, totalTimer: 0, operasjoner: [], indirekte: [], laborSaleEx: 0, laborCost: 0, profit: 0, margin: 0, riskFactor: 1.1, timeRate: 850, internalCost: 450 };

  var work = project.work || {};
  const ops = project.operations || [];
  const riskFactor = { Lav: 1, Normal: 1.1, 'Høy': 1.2 }[work.risk] || 1.1;
  const timeRate = Number(work.timeRate) || 850;
  const internalCost = Number(work.internalCost) || 450;

  var direkteTimer = 0;
  var breakdown = ops.map(function(op) {
    if (!op) return null;
    var result = calcOperationHours(op);
    direkteTimer += result.faktorTimer;
    var rateDef = (productionRates && productionRates[op.type]) || (productionRates && productionRates.annet) || { label: '', unit: '' };
    return {
      id: op.id,
      navn: op.navn || (rateDef && rateDef.label) || '',
      type: op.type,
      mengde: op.mengde,
      enhet: (rateDef && rateDef.unit) || '',
      baseTimer: result.baseTimer,
      faktorTimer: result.faktorTimer,
      faktorer: result.faktorer,
    };
  }).filter(function(x) { return x != null; });
  direkteTimer = round1(direkteTimer);

  var indirect = calcIndirectTime(project, direkteTimer);
  var totalTimer = round1(direkteTimer + indirect.totalIndirekte);

  var laborSaleEx = Math.round(totalTimer * timeRate * riskFactor);
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
    riskFactor,
    timeRate,
    internalCost,
  };
}


// ── FINANSIELL KALKYLE (tidl. compute() i projects.js) ───────

function compute(project){
  if (!project) return { hoursTotal: 0, laborCost: 0, laborSaleEx: 0, matCost: 0, matSaleEx: 0, extrasBase: 0, rigEx: 0, costPrice: 0, saleEx: 0, saleInc: 0, vat: 0, profit: 0, margin: 0, db: 0, driftCost: 0, totalMatCost: 0, totalMatSaleEx: 0, totalHours: 0, totalLaborSaleEx: 0, totalLaborCost: 0, totalCostPrice: 0, totalSaleEx: 0, totalProfit: 0, totalMargin: 0 };

  var work = project.work || {};
  var materials = project.materials || [];
  var extras = project.extras || {};
  var offerPosts = project.offerPosts || [];

  const riskFactor={Lav:1,Normal:1.1,'Høy':1.2}[work.risk]||1.1;
  const hoursTotal=Number(work.hours)||0;
  const laborCost=hoursTotal*(Number(work.internalCost)||0);
  const laborSaleEx=hoursTotal*(Number(work.timeRate)||0)*riskFactor;
  let matCost=0, matSaleEx=0;
  materials.forEach(m=>{
    const qty=Number(m.qty)||0,cost=Number(m.cost)||0,waste=Number(m.waste)||0,markup=Number(m.markup)||0;
    const withWaste=qty*cost*(1+waste/100);
    matCost+=withWaste; matSaleEx+=withWaste*(1+markup/100);
  });
  const lhh=Number(work.laborHireHours)||0, lhr=Number(extras.laborHire)||0;
  const laborHireTotal=lhh>0?(lhr*lhh):lhr;
  const driftCost=hoursTotal*(Number(extras.driftRate)||0);
  const subTotal=((extras.subcontractors)||[]).reduce((s,x)=>s+(Number(x.amount)||0),0);
  const extrasBase=(Number(extras.rental)||0)+(Number(extras.waste)||0)+subTotal+laborHireTotal+(Number(extras.misc)||0)+(Number(extras.scaffolding)||0)+(Number(extras.drawings)||0)+driftCost;
  const rigEx=(laborSaleEx+matSaleEx)*((Number(extras.rigPercent)||0)/100);
  const costPrice=laborCost+matCost+extrasBase+rigEx;
  const saleEx=laborSaleEx+matSaleEx+extrasBase+rigEx;
  const saleInc=saleEx*1.25, profit=saleEx-costPrice;
  const margin=saleEx?(profit/saleEx*100):0;

  let snapMatCost=0, snapMatSaleEx=0, snapHours=0, snapLaborSaleEx=0, snapLaborCost=0;
  offerPosts.forEach(post=>{
    if(post && post.snapshotCompute){
      snapMatCost+=post.snapshotCompute.matCost||0;
      snapMatSaleEx+=post.snapshotCompute.matSaleEx||0;
      const postHours=Number(post.hours)||post.snapshotCompute.hoursTotal||0;
      snapHours+=postHours;
      const riskFactor={Lav:1,Normal:1.1,'Høy':1.2}[work.risk]||1.1;
      const rate=(post.snapshotCompute.laborSaleEx||0)/(post.snapshotCompute.hoursTotal||1)/riskFactor;
      const internalRate=(post.snapshotCompute.laborCost||0)/(post.snapshotCompute.hoursTotal||1);
      snapLaborSaleEx+=postHours*rate*riskFactor;
      snapLaborCost+=postHours*internalRate;
    }
  });
  const totalMatCost=matCost+snapMatCost;
  const totalMatSaleEx=matSaleEx+snapMatSaleEx;
  const computedTotal=hoursTotal+snapHours;
  const totalHours=Number(work.hoursOverride)>0
    ? Number(work.hoursOverride)
    : computedTotal;
  const ratePerHour=(Number(work.timeRate)||0)*riskFactor;
  const costPerHour=(Number(work.internalCost)||0);
  const totalLaborSaleEx=hoursTotal*ratePerHour + snapLaborSaleEx;
  const totalLaborCost=hoursTotal*costPerHour + snapLaborCost;
  const totalCostPrice=totalLaborCost+totalMatCost+extrasBase+rigEx;
  const totalSaleEx=totalLaborSaleEx+totalMatSaleEx+extrasBase+rigEx;
  const totalProfit=totalSaleEx-totalCostPrice;
  const totalMargin=totalSaleEx?(totalProfit/totalSaleEx*100):0;

  return {hoursTotal,laborCost,laborSaleEx,matCost,matSaleEx,extrasBase,rigEx,costPrice,saleEx,saleInc,vat:saleEx*0.25,profit,margin,db:margin,driftCost,
    totalMatCost,totalMatSaleEx,totalHours,totalLaborSaleEx,totalLaborCost,totalCostPrice,totalSaleEx,totalProfit,totalMargin};
}


// ── TILBUDSPOST-SUMMERING (tidl. computeOfferPostsTotal() i app.js) ──

function computeOfferPostsTotal(p){
  if(!p || !p.offerPosts || !p.offerPosts.length) return {fixed:0,options:0,total:0,hours:0};
  let fixed=0,options=0,hours=0;
  p.offerPosts.forEach(post=>{
    if(!post) return;
    hours+=Number(post.snapshotCompute?.hoursTotal)||0;
    const price=Number(post.price)||0;
    if(post.type==='option'){if(post.enabled)options+=price;}else fixed+=price;
  });
  return {fixed,options,total:fixed+options,hours};
}


// ── HJELPEFUNKSJONER ─────────────────────────────────────────

/** Opprett en blank operasjon */
function blankOperation() {
  return {
    id: uid(),
    type: 'annet',
    navn: '',
    mengde: 0,
    level: 'normal',
    tilkomst: 'normal',
    hoyde: 'bakke',
    kompleksitet: 'normal',
  };
}

/** Rask oversikt: estimert timer for en type+mengde (uten faktorer) */
function quickEstimate(type, mengde) {
  var rate = getProductionRate(type);
  return Math.round(mengde * rate * 10) / 10;
}

/** Lagre brukerens erfaringsrate (ren data, ingen UI) */
function saveCalcRate(type, val){
  state.calcRates=state.calcRates||{};
  state.calcRates[type]=parseFloat(val)||calcDefaults[type]?.tPerM2||1;
}


// ── WARNINGS ─────────────────────────────────────────────────

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
    var work = project.work || {};
    if (work.risk === 'Lav') {
      w.push({ severity: 'warning', text: 'Hoydearbeid med lav risikofaktor — vurder Normal eller Hoy.' });
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
    w.push({ severity: 'danger', text: 'Margin under 10% (' + Math.round(margin) + '%) — hoy risiko for tap.' });
  } else if (c.totalSaleEx > 0 && margin < 20) {
    w.push({ severity: 'warning', text: 'Margin under 20% (' + Math.round(margin) + '%) — vurder om prisene dekker uforutsett.' });
  }

  var allMats = materials.concat(
    offerPosts.reduce(function(acc, post) {
      return acc.concat((post && post.snapshotMaterials) || []);
    }, [])
  );
  var utenPris = allMats.filter(function(m) { return m && (!m.cost || m.cost === 0); });
  if (utenPris.length > 0) {
    w.push({ severity: 'warning', text: utenPris.length + ' materiale(r) mangler pris — tilbudet kan bli for lavt.' });
  }

  var totalHours = c.totalHours || 0;
  if (totalHours === 0 && offerPosts.length > 0) {
    w.push({ severity: 'danger', text: 'Tilbud uten timer — har du lagt inn arbeidstid?' });
  }

  if (!(indirect.avstandKm > 0) && ops.length > 0) {
    w.push({ severity: 'info', text: 'Ingen avstand oppgitt — kjoring er ikke med i kalkylen.' });
  }

  if (indirect.avstandKm > 60) {
    w.push({ severity: 'warning', text: 'Lang reisevei (' + ind.avstandKm + ' km) — vurder om kjoring dekkes i tilbudet.' });
  }

  if (!offerPosts.length && materials.length > 0) {
    w.push({ severity: 'info', text: 'Materialer finnes, men ingen tilbudsposter — husk a sende til tilbud.' });
  }

  var harEkstremt = ops.some(function(op) { return op && op.kompleksitet === 'ekstremt'; });
  var work = project.work || {};
  if (harEkstremt && work.risk !== 'Høy') {
    w.push({ severity: 'warning', text: 'Ekstrem kompleksitet uten hoy risikofaktor — vurder a oke risiko.' });
  }

  var order = { danger: 0, warning: 1, info: 2 };
  w.sort(function(a, b) { return (order[a.severity] || 9) - (order[b.severity] || 9); });

  return w;
}


// ── SAMLET OPERASJONSESTIMATE (timer + materialer) ─────────────

/**
 * Beregn komplett estimate for en operasjon (timer + materialer + kostnad)
 * @param {Object} op - operasjon {type, mengde, level, tilkomst, hoyde, kompleksitet, materialValues, materialChoices}
 * @param {Object} priceCatalog - {materialName: {cost, unit}, ...} eller tom {}
 * @returns {Object} {direkteTimer, materialer: [{name, qty, unit, waste, cost, totalCost}, ...], totalMaterialCost, errors: []}
 */
function buildOperationEstimate(op, priceCatalog) {
  if (!op) return { direkteTimer: 0, materialer: [], totalMaterialCost: 0, errors: [] };

  priceCatalog = priceCatalog || {};
  var errors = [];

  // 1. BEREGN TIMER fra operasjonsdata
  var timeResult = calcOperationHours(op);
  var direkteTimer = timeResult.faktorTimer;

  // 2. FORESLÅ MATERIALER (hvis calcDefs finnes for denne typen)
  var materialer = [];
  var totalMaterialCost = 0;

  if (window.calcDefs && window.calcDefs[op.type]) {
    var calcDef = window.calcDefs[op.type];
    try {
      // Sett opp inputs fra operasjons materialValues eller calcDef defaults
      var inputs = {};
      (calcDef.inputs || []).forEach(function(inp) {
        inputs[inp.id] = (op.materialValues && op.materialValues[inp.id]) != null
          ? op.materialValues[inp.id]
          : inp.default;
      });

      // Sett opp material-valg fra operasjons materialChoices
      var mats = op.materialChoices || {};

      // Kjør material-kalkulatoren for denne operasjonstypen
      var calcResult = calcDef.calc(inputs, mats);

      // Konverter til material-objekt med pris
      materialer = (calcResult.materialer || []).map(function(m) {
        var catalogEntry = priceCatalog[m.name] || { cost: 0, unit: m.unit };
        var qty = Number(m.qty) || 0;
        var cost = Number(catalogEntry.cost) || 0;
        var waste = Number(m.waste) || 0;

        // Kostnad = mengde * pris * (1 + waste%)
        var withWaste = qty * cost * (1 + waste / 100);
        totalMaterialCost += withWaste;

        return {
          name: m.name,
          qty: qty,
          unit: m.unit || catalogEntry.unit || 'stk',
          waste: waste,
          cost: cost,
          totalCost: Math.round(withWaste)
        };
      });
    } catch (e) {
      errors.push('Material-beregning feilet for ' + op.type + ': ' + e.message);
    }
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
  var errors = [];

  // 1. BEREGN TIMER via calcProject()
  var timeCalc = window.calcProject(project);

  // 2. BEREGN MATERIALER for hver operasjon
  var ops = project.operations || [];
  var operationEstimates = [];
  var totalMaterialCost = 0;

  ops.forEach(function(op) {
    if (!op) return;
    var opEst = buildOperationEstimate(op, priceCatalog);
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
  var riskFactor = { Lav: 1, Normal: 1.1, 'Høy': 1.2 }[work.risk] || 1.1;

  var laborCost = timeCalc.totalTimer * internalCost;
  var laborSaleEx = Math.round(timeCalc.totalTimer * timeRate * riskFactor);

  var totalCost = laborCost + totalMaterialCost;
  var totalSaleEx = laborSaleEx + totalMaterialCost;
  var profit = totalSaleEx - totalCost;
  var margin = totalSaleEx > 0 ? Math.round(profit / totalSaleEx * 1000) / 10 : 0;

  return {
    direkteTimer: timeCalc.direkteTimer,
    indirektTimer: timeCalc.indirektTimer,
    totalTimer: timeCalc.totalTimer,

    laborCost: Math.round(laborCost),
    laborSaleEx: laborSaleEx,

    operations: operationEstimates,
    totalMaterialCost: Math.round(totalMaterialCost),
    totalCost: Math.round(totalCost),
    totalSaleEx: totalSaleEx,
    profit: Math.round(profit),
    margin: margin,

    errors: errors
  };
}


// ── EKSPORTER TIL GLOBALT SCOPE ──────────────────────────────

window.round1 = round1;
window.getBaseTime = getBaseTime;
window.getProductionRate = getProductionRate;
window.getCalcRate = getCalcRate;
window.calculateDrivingTime = calculateDrivingTime;
window.calculateRiggingTime = calculateRiggingTime;
window.calculatePlanningTime = calculatePlanningTime;
window.calcIndirectTime = calcIndirectTime;
window.calcOperationHours = calcOperationHours;
window.calcProject = calcProject;
window.compute = compute;
window.computeOfferPostsTotal = computeOfferPostsTotal;
window.blankOperation = blankOperation;
window.quickEstimate = quickEstimate;
window.saveCalcRate = saveCalcRate;
window.generateWarnings = generateWarnings;
window.buildOperationEstimate = buildOperationEstimate;
window.buildProjectEstimate = buildProjectEstimate;
