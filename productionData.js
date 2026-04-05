// ============================================================
// productionData.js — All ren data for kalkylemotoren
// ============================================================
// Ingen logikk her — bare datastrukturer og faktorer.
// Lastes for calcEngine.js i script-rekkefolgen.
// ============================================================

// ── PRODUKSJONSTALL (basistimer per enhet) ───────────────────
// «normal» er standardverdien brukt i kalkyler.
// «low» = rutinearbeid, god flyt.  «high» = forstyrrelser, ekstra tilpasning.

const productionRates = {
  // ── UTVENDIGE JOBBER ──────────────────────────────────────
  grunnarbeid:    { low: 1.5, normal: 2.0, high: 3.0, unit: 'm²',  label: 'Grunnarbeid' },
  reisverk:       { low: 0.6, normal: 0.9, high: 1.3, unit: 'm²',  label: 'Reisverk' },
  bjelkelag:      { low: 0.5, normal: 0.8, high: 1.2, unit: 'm²',  label: 'Bjelkelag' },
  dragere:        { low: 1.2, normal: 2.0, high: 3.0, unit: 'stk', label: 'Dragere/bæring' },
  kledning:       { low: 0.85,normal: 1.1, high: 1.5, unit: 'm²',  label: 'Montering av kledning' },
  etterisolering: { low: 0.7, normal: 1.0, high: 1.4, unit: 'm²',  label: 'Etterisolering' },
  utv_listing:    { low: 0.08,normal: 0.12,high: 0.18,unit: 'lm',  label: 'Utvendige belisting' },
  hjornekasser:   { low: 0.8, normal: 1.2, high: 1.8, unit: 'stk', label: 'Hjørnekasser' },
  vindu:          { low: 3.0, normal: 4.0, high: 5.5, unit: 'stk', label: 'Vindu' },
  ytterdor:       { low: 3.0, normal: 4.5, high: 6.5, unit: 'stk', label: 'Ytterdør/terrassedør' },
  takjobb:        { low: 1.4, normal: 1.8, high: 2.4, unit: 'm²',  label: 'Takjobb' },
  vindskier:      { low: 0.12,normal: 0.2, high: 0.3, unit: 'lm',  label: 'Vindskier/israft' },
  takrenner:      { low: 0.1, normal: 0.15,high: 0.25,unit: 'lm',  label: 'Takrenner og nedløp' },
  terrasse:       { low: 2.0, normal: 2.5, high: 3.2, unit: 'm²',  label: 'Terrasse' },
  platting:       { low: 0.6, normal: 0.9, high: 1.3, unit: 'm²',  label: 'Platting' },
  rekkverk:       { low: 0.6, normal: 1.0, high: 1.4, unit: 'lm',  label: 'Rekkverk' },
  levegg:         { low: 1.0, normal: 1.4, high: 2.0, unit: 'm²',  label: 'Levegg' },
  utv_trapp:      { low: 8.0, normal: 12.0,high: 18.0,unit: 'stk', label: 'Trapp (utvendig)' },
  pergola:        { low: 1.5, normal: 2.0, high: 3.0, unit: 'm²',  label: 'Pergola' },
  garasje:        { low: 2.0, normal: 3.0, high: 4.5, unit: 'm²',  label: 'Garasje' },
  carport:        { low: 1.5, normal: 2.0, high: 3.0, unit: 'm²',  label: 'Carport' },
  bod:            { low: 2.0, normal: 2.8, high: 4.0, unit: 'm²',  label: 'Bod' },
  inngangsparti:  { low: 4.0, normal: 6.0, high: 9.0, unit: 'stk', label: 'Inngangsparti' },
  tilbygg:        { low: 3.0, normal: 4.0, high: 6.0, unit: 'm²',  label: 'Tilbygg' },
  gjerde:         { low: 0.3, normal: 0.5, high: 0.8, unit: 'lm',  label: 'Gjerde' },
  // ── INNVENDIGE JOBBER ─────────────────────────────────────
  // Vegger og konstruksjon
  innevegger:       { low: 0.7, normal: 1.0, high: 1.4, unit: 'm²',  label: 'Innevegger' },
  baerevegger:      { low: 0.8, normal: 1.2, high: 1.7, unit: 'm²',  label: 'Bærevegger' },
  inn_bjelkelag:    { low: 0.5, normal: 0.8, high: 1.2, unit: 'm²',  label: 'Bjelkelag og gulvoppbygging' },
  gulvavretting:    { low: 0.3, normal: 0.5, high: 0.8, unit: 'm²',  label: 'Gulvavretting' },
  inn_isolering:    { low: 0.4, normal: 0.6, high: 0.9, unit: 'm²',  label: 'Isolering vegger/tak/etasjeskiller' },
  utlekting_vegg:   { low: 0.15,normal: 0.25,high: 0.35,unit: 'm²',  label: 'Utlekting innervegger' },
  nedlekting_tak:   { low: 0.2, normal: 0.3, high: 0.45,unit: 'm²',  label: 'Nedlekting tak' },
  // Plater og kledning
  gips_vegg:        { low: 0.25,normal: 0.35,high: 0.55,unit: 'm²',  label: 'Gipsplater vegger' },
  gips_tak:         { low: 0.30,normal: 0.45,high: 0.65,unit: 'm²',  label: 'Gipsplater tak' },
  panel_vegg:       { low: 0.5, normal: 0.7, high: 1.0, unit: 'm²',  label: 'Panel/MDF vegger' },
  himling:          { low: 0.45,normal: 0.65,high: 0.9, unit: 'm²',  label: 'Himling' },
  // Vinduer innvendig
  inn_vindu:        { low: 2.5, normal: 3.5, high: 5.0, unit: 'stk', label: 'Vindu (innvendig)' },
  inn_foring:       { low: 0.4, normal: 0.7, high: 1.0, unit: 'stk', label: 'Innvendige foringer' },
  vindulisting:     { low: 0.06,normal: 0.1, high: 0.15,unit: 'lm',  label: 'Listing rundt vinduer' },
  vindusbrett:      { low: 0.3, normal: 0.5, high: 0.8, unit: 'stk', label: 'Vindusbrett' },
  // Dører
  innerdor:         { low: 2.5, normal: 4.0, high: 5.5, unit: 'stk', label: 'Innerdører' },
  skyvedor:         { low: 4.0, normal: 6.0, high: 8.0, unit: 'stk', label: 'Skyvedører/pocket' },
  // Gulv
  parkett:          { low: 0.3, normal: 0.45,high: 0.65,unit: 'm²',  label: 'Parkett' },
  laminat:          { low: 0.2, normal: 0.35,high: 0.5, unit: 'm²',  label: 'Laminat' },
  heltregulv:       { low: 0.4, normal: 0.55,high: 0.8, unit: 'm²',  label: 'Heltregulv' },
  // Trapper
  inn_trapp:        { low: 10,  normal: 14,  high: 20,  unit: 'stk', label: 'Trapper' },
  rehab_trapp:      { low: 8,   normal: 12,  high: 18,  unit: 'stk', label: 'Rehabilitering trapp' },
  inn_rekkverk:     { low: 0.4, normal: 0.7, high: 1.0, unit: 'lm',  label: 'Rekkverk og håndløpere' },
  // Kjøkken og innredning
  kjokken:          { low: 0.8, normal: 1.2, high: 1.8, unit: 'lm',  label: 'Kjøkkeninnredning' },
  benkeplater:      { low: 0.5, normal: 0.8, high: 1.2, unit: 'lm',  label: 'Benkeplater' },
  hvitevarer:       { low: 0.5, normal: 0.8, high: 1.2, unit: 'stk', label: 'Integrerte hvitevarer' },
  garderobe:        { low: 1.0, normal: 1.5, high: 2.2, unit: 'stk', label: 'Garderober/skyvedørsløsn.' },
  spesialinnredning:{ low: 1.5, normal: 2.5, high: 4.0, unit: 'stk', label: 'Spesialtilpasset innredning' },
  // Bad og våtrom
  vatromsplater:    { low: 0.3, normal: 0.5, high: 0.7, unit: 'm²',  label: 'Våtromsplater' },
  innkassing:       { low: 0.4, normal: 0.6, high: 0.9, unit: 'lm',  label: 'Innkassing rør/sisterner' },
  kasser_nisjer:    { low: 1.0, normal: 1.5, high: 2.5, unit: 'stk', label: 'Kasser, nisjer, innredn.løsn.' },
  badeinnredning:   { low: 1.5, normal: 2.5, high: 4.0, unit: 'stk', label: 'Baderomsinnredning' },
  // Listverk
  gulvlister:       { low: 0.06,normal: 0.1, high: 0.15,unit: 'lm',  label: 'Gulvlister' },
  taklister:        { low: 0.08,normal: 0.12,high: 0.18,unit: 'lm',  label: 'Taklister' },
  gerikter:         { low: 0.06,normal: 0.1, high: 0.15,unit: 'lm',  label: 'Gerikter dører/vinduer' },
  hjornelister:     { low: 0.05,normal: 0.08,high: 0.12,unit: 'lm',  label: 'Hjørne-/overgangslister' },
  // Generelt
  annet:            { low: 0.7, normal: 1.0, high: 1.5, unit: 'stk', label: 'Annet' },
};

// ── JOBBKATEGORIER (Utvendig / Innvendig) ───────────────────
// Nøklene refererer til productionRates og calcDefs.
// Legg til nye jobber her for at de skal dukke opp i dropdowns.

const jobCategories = {
  utvendig: {
    label: 'Utvendig arbeid',
    jobs: [
      'grunnarbeid','reisverk','bjelkelag','dragere','kledning',
      'etterisolering','utv_listing','hjornekasser','vindu','ytterdor',
      'takjobb','vindskier','takrenner','terrasse','platting',
      'rekkverk','levegg','utv_trapp','pergola','garasje',
      'carport','bod','inngangsparti','tilbygg','gjerde',
    ],
  },
  innvendig: {
    label: 'Innvendig arbeid',
    jobs: [
      'innevegger','baerevegger','inn_bjelkelag','gulvavretting','inn_isolering',
      'utlekting_vegg','nedlekting_tak',
      'gips_vegg','gips_tak','panel_vegg','himling',
      'inn_vindu','inn_foring','vindulisting','vindusbrett',
      'innerdor','skyvedor',
      'parkett','laminat','heltregulv',
      'inn_trapp','rehab_trapp','inn_rekkverk',
      'kjokken','benkeplater','hvitevarer','garderobe','spesialinnredning',
      'vatromsplater','innkassing','kasser_nisjer','badeinnredning',
      'gulvlister','taklister','gerikter','hjornelister',
    ],
  },
};

// ── UNDERGRUPPER FOR DROPDOWNS ──────────────────────────────
// Brukes til optgroup i dropdown-menyer for bedre skanning.

const utvendigSubgroups = [
  {label:'Grunn og konstruksjon', jobs:['grunnarbeid','reisverk','bjelkelag','dragere']},
  {label:'Fasade og kledning', jobs:['kledning','etterisolering','utv_listing','hjornekasser']},
  {label:'Vinduer og dorer', jobs:['vindu','ytterdor','inngangsparti']},
  {label:'Tak', jobs:['takjobb','vindskier','takrenner']},
  {label:'Terrasse og uteplass', jobs:['terrasse','platting','rekkverk','levegg','utv_trapp','pergola']},
  {label:'Bygg', jobs:['garasje','carport','bod','tilbygg','gjerde']},
];

const innvendigSubgroups = [
  {label:'Vegger og konstruksjon', jobs:['innevegger','baerevegger','inn_bjelkelag','gulvavretting','inn_isolering','utlekting_vegg','nedlekting_tak']},
  {label:'Plater og kledning', jobs:['gips_vegg','gips_tak','panel_vegg','himling']},
  {label:'Vinduer innvendig', jobs:['inn_vindu','inn_foring','vindulisting','vindusbrett']},
  {label:'Dorer', jobs:['innerdor','skyvedor']},
  {label:'Gulv', jobs:['parkett','laminat','heltregulv']},
  {label:'Trapper', jobs:['inn_trapp','rehab_trapp','inn_rekkverk']},
  {label:'Kjokken og innredning', jobs:['kjokken','benkeplater','hvitevarer','garderobe','spesialinnredning']},
  {label:'Bad og vatrom', jobs:['vatromsplater','innkassing','kasser_nisjer','badeinnredning']},
  {label:'Listverk', jobs:['gulvlister','taklister','gerikter','hjornelister']},
];

// Grupperte erfaringstimer-kategorier for innstillingspanelet
const rateSettingsGroups = [
  {label:'Utvendig — Grunn og konstruksjon', keys:['grunnarbeid','reisverk','bjelkelag','dragere']},
  {label:'Utvendig — Fasade og kledning', keys:['kledning','etterisolering','utv_listing','hjornekasser']},
  {label:'Utvendig — Vinduer og dorer', keys:['vindu','ytterdor','inngangsparti']},
  {label:'Utvendig — Tak', keys:['takjobb','vindskier','takrenner']},
  {label:'Utvendig — Terrasse og uteplass', keys:['terrasse','platting','rekkverk','levegg','utv_trapp','pergola']},
  {label:'Utvendig — Bygg', keys:['garasje','carport','bod','tilbygg','gjerde']},
  {label:'Innvendig — Vegger og konstruksjon', keys:['innevegger','baerevegger','inn_bjelkelag','gulvavretting','inn_isolering','utlekting_vegg','nedlekting_tak']},
  {label:'Innvendig — Plater og kledning', keys:['gips_vegg','gips_tak','panel_vegg','himling']},
  {label:'Innvendig — Vinduer', keys:['inn_vindu','inn_foring','vindulisting','vindusbrett']},
  {label:'Innvendig — Dorer', keys:['innerdor','skyvedor']},
  {label:'Innvendig — Gulv', keys:['parkett','laminat','heltregulv']},
  {label:'Innvendig — Trapper', keys:['inn_trapp','rehab_trapp','inn_rekkverk']},
  {label:'Innvendig — Kjokken og innredning', keys:['kjokken','benkeplater','hvitevarer','garderobe','spesialinnredning']},
  {label:'Innvendig — Bad og vatrom', keys:['vatromsplater','innkassing','kasser_nisjer','badeinnredning']},
  {label:'Innvendig — Listverk', keys:['gulvlister','taklister','gerikter','hjornelister']},
];

// ── JUSTERINGSFAKTORER ───────────────────────────────────────

const accessFactors = {
  god:      { factor: 0.9,  label: 'God tilkomst' },
  normal:   { factor: 1.0,  label: 'Normal tilkomst' },
  vanskelig:{ factor: 1.2,  label: 'Vanskelig tilkomst' },
  svart:    { factor: 1.4,  label: 'Svart vanskelig' },
};

const heightFactors = {
  bakke:   { factor: 1.0,  label: 'Bakkeniva' },
  lav:     { factor: 1.05, label: 'Lav hoyde (< 3m)' },
  middels: { factor: 1.15, label: 'Middels hoyde (3-6m)' },
  hoy:     { factor: 1.3,  label: 'Stor hoyde (> 6m)' },
};

const complexityFactors = {
  enkel:     { factor: 0.85, label: 'Enkel — rette flater, standard' },
  normal:    { factor: 1.0,  label: 'Normal — noen tilpasninger' },
  kompleks:  { factor: 1.2,  label: 'Kompleks — mange hjorner/detaljer' },
  ekstremt:  { factor: 1.45, label: 'Ekstremt — spesialtilpasning' },
};

// ── MATERIALKALKULATORENS VANSKELIGHETSGRADER ────────────────

const difficultyFactors = {
  enkel:    {label:'Enkel',   factor:0.85, desc:'God tilkomst, rett flate'},
  normal:   {label:'Normal',  factor:1.0,  desc:'Standard forhold'},
  vanskelig:{label:'Vanskelig',factor:1.25, desc:'Høyde, skråtak, trangt'},
  ekstremt: {label:'Ekstremt',factor:1.5,  desc:'Særlig krevende forhold'},
};

// ── STANDARDRATER FOR MATERIALKALKULATOR ─────────────────────

const calcDefaults = {
  // Utvendig
  grunnarbeid:   {tPerM2:2.0,  label:'t/m²'},
  reisverk:      {tPerM2:0.9,  label:'t/m²'},
  bjelkelag:     {tPerM2:0.8,  label:'t/m²'},
  dragere:       {tPerM2:3.0,  label:'t/stk'},
  kledning:      {tPerM2:1.3,  label:'t/m²'},
  etterisolering:{tPerM2:0.9,  label:'t/m²'},
  utv_listing:   {tPerM2:0.12, label:'t/lm'},
  hjornekasser:  {tPerM2:1.2,  label:'t/stk'},
  vindu:         {tPerM2:4.0,  label:'t/stk'},
  ytterdor:      {tPerM2:4.5,  label:'t/stk'},
  takjobb:       {tPerM2:1.8,  label:'t/m²'},
  vindskier:     {tPerM2:0.2,  label:'t/lm'},
  takrenner:     {tPerM2:0.15, label:'t/lm'},
  terrasse:      {tPerM2:2.5,  label:'t/m²'},
  platting:      {tPerM2:1.2,  label:'t/m²'},
  rekkverk:      {tPerM2:0.8,  label:'t/lm'},
  levegg:        {tPerM2:1.2,  label:'t/m²'},
  utv_trapp:     {tPerM2:12.0, label:'t/stk'},
  pergola:       {tPerM2:2.0,  label:'t/m²'},
  garasje:       {tPerM2:3.0,  label:'t/m²'},
  carport:       {tPerM2:2.0,  label:'t/m²'},
  bod:           {tPerM2:2.8,  label:'t/m²'},
  inngangsparti: {tPerM2:6.0,  label:'t/stk'},
  tilbygg:       {tPerM2:4.0,  label:'t/m²'},
  gjerde:        {tPerM2:0.5,  label:'t/lm'},
  // Innvendig
  innevegger:       {tPerM2:1.0,  label:'t/m²'},
  baerevegger:      {tPerM2:1.2,  label:'t/m²'},
  inn_bjelkelag:    {tPerM2:0.8,  label:'t/m²'},
  gulvavretting:    {tPerM2:0.5,  label:'t/m²'},
  inn_isolering:    {tPerM2:0.6,  label:'t/m²'},
  utlekting_vegg:   {tPerM2:0.25, label:'t/m²'},
  nedlekting_tak:   {tPerM2:0.3,  label:'t/m²'},
  gips_vegg:        {tPerM2:0.45, label:'t/m²'},
  gips_tak:         {tPerM2:0.55, label:'t/m²'},
  panel_vegg:       {tPerM2:0.9,  label:'t/m²'},
  himling:          {tPerM2:0.8,  label:'t/m²'},
  inn_vindu:        {tPerM2:3.5,  label:'t/stk'},
  inn_foring:       {tPerM2:0.5,  label:'t/stk'},
  vindulisting:     {tPerM2:0.1,  label:'t/lm'},
  vindusbrett:      {tPerM2:0.5,  label:'t/stk'},
  innerdor:         {tPerM2:2.5,  label:'t/stk'},
  skyvedor:         {tPerM2:4.5,  label:'t/stk'},
  parkett:          {tPerM2:0.6,  label:'t/m²'},
  laminat:          {tPerM2:0.5,  label:'t/m²'},
  heltregulv:       {tPerM2:0.8,  label:'t/m²'},
  inn_trapp:        {tPerM2:14.0, label:'t/stk'},
  rehab_trapp:      {tPerM2:12.0, label:'t/stk'},
  inn_rekkverk:     {tPerM2:0.7,  label:'t/lm'},
  kjokken:          {tPerM2:1.2,  label:'t/lm'},
  benkeplater:      {tPerM2:0.8,  label:'t/lm'},
  hvitevarer:       {tPerM2:0.8,  label:'t/stk'},
  garderobe:        {tPerM2:1.5,  label:'t/stk'},
  spesialinnredning:{tPerM2:2.5,  label:'t/stk'},
  vatromsplater:    {tPerM2:0.5,  label:'t/m²'},
  innkassing:       {tPerM2:0.6,  label:'t/lm'},
  kasser_nisjer:    {tPerM2:1.5,  label:'t/stk'},
  badeinnredning:   {tPerM2:2.5,  label:'t/stk'},
  gulvlister:       {tPerM2:0.1,  label:'t/lm'},
  taklister:        {tPerM2:0.12, label:'t/lm'},
  gerikter:         {tPerM2:0.1,  label:'t/lm'},
  hjornelister:     {tPerM2:0.08, label:'t/lm'},
};

// ── MATERIALKALKULATORENS DEFINISJONER ───────────────────────
// calcDefs inneholder material-templates med beregningsfunksjoner.
// Disse bruker getCalcRate() fra calcEngine.js, som lastes etter
// denne filen men for UI-filene som kaller calcDefs[type].calc().

const calcDefs = {
  // ══════════════════════════════════════════════════════════
  // UTVENDIGE JOBBER
  // ══════════════════════════════════════════════════════════

  grunnarbeid: {
    label:'Grunnarbeid',
    materialOptions:[
      {id:'type',label:'Fundamenttype',options:['Stripefundament','Punktfundament','Ringmur','Platting på mark']},
      {id:'betong',label:'Betongkvalitet',options:['B30 M60','B35 M45','Ferdigblandet sekk']},
    ],
    inputs:[
      {id:'lengde',label:'Lengde (m)',default:8},
      {id:'bredde',label:'Bredde (m)',default:0.4},
      {id:'dybde',label:'Dybde/høyde (m)',default:0.8},
    ],
    calc(v,mats){
      const volum=v.lengde*v.bredde*v.dybde;
      const forskalingsAreal=(v.dybde*2+v.bredde)*v.lengde;
      const fType=mats.type||'Stripefundament';
      const isPunkt=fType==='Punktfundament';
      return {
        areal:volum.toFixed(1)+' m³',
        info:fType,
        materialer:[
          {name:`Betong ${mats.betong||'B30 M60'}`,qty:Math.ceil(volum*1.05),unit:'m³',waste:5},
          {name:'Armering Ø12 kamstål',qty:Math.ceil(v.lengde*4*1.1),unit:'lm',waste:10},
          {name:'Forskalingsbord 22×98',qty:isPunkt?0:Math.ceil(forskalingsAreal*8),unit:'lm',waste:15},
          {name:'Fiberduk',qty:Math.ceil(v.lengde*v.bredde*2),unit:'m²',waste:10},
          {name:'Pukk/singel 8-16',qty:Math.ceil(volum*0.5),unit:'m³',waste:0},
          {name:'Bolter M12×250 gjengestang',qty:Math.ceil(v.lengde/1.2),unit:'stk',waste:0},
        ],
        timer:Math.round(v.lengde*v.bredde*getCalcRate('grunnarbeid')),
      };
    }
  },

  reisverk: {
    label:'Reisverk',
    materialOptions:[
      {id:'stender',label:'Stenderdimensjon',options:['48×98','48×148','48×198','36×98','36×148']},
      {id:'cc',label:'C/C-avstand',options:['300 mm','400 mm','600 mm']},
    ],
    inputs:[
      {id:'lengde',label:'Vegglengde (m)',default:8},
      {id:'hoyde',label:'Vegghøyde (m)',default:2.4},
    ],
    calc(v,mats){
      const areal=v.lengde*v.hoyde;
      const ccStr=mats.cc||'600 mm';
      const ccM=parseInt(ccStr)/1000;
      const antStendere=Math.ceil(v.lengde/ccM)+1;
      const stenderLm=Math.ceil(antStendere*v.hoyde*1.05);
      const svilLm=Math.ceil(v.lengde*2*1.1);
      const stDim=mats.stender||'48×148';
      const isoTykkelse=parseInt(stDim.split('×')[1])||148;
      const totalVirke=stenderLm+svilLm;
      return {
        areal:areal.toFixed(1)+' m²',
        info:`${stDim} c/c ${ccStr}`,
        materialer:[
          {name:`Virke ${stDim} C24 (stender+svill/rem)`,qty:totalVirke,unit:'lm',waste:5},
          {name:'Vindsperre 1,5×50m',qty:Math.ceil(areal/50),unit:'rull',waste:5},
          {name:'Vindsperre tape 60mm',qty:Math.ceil(v.lengde*2+v.hoyde*4),unit:'lm',waste:5},
          {name:'Dampsperre 1,5×50m',qty:Math.ceil(areal/50),unit:'rull',waste:5},
          {name:'Dampsperre tape',qty:Math.ceil(areal*0.15),unit:'lm',waste:5},
          {name:`Isolasjon ${isoTykkelse}mm`,qty:Math.ceil(areal*1.05),unit:'m²',waste:5},
          {name:'Spiker / skruer montasje',qty:Math.ceil(antStendere*0.3),unit:'pk',waste:0},
          {name:'Vinkelbeslag',qty:antStendere*2,unit:'stk',waste:0},
        ],
        timer:Math.round(areal*getCalcRate('reisverk')),
      };
    },
    recipe:{
      computed:{
        veggAreal:  {expr:'lengde * hoyde',            label:'Vegg-areal',    unit:'m\u00B2'},
        antStendere:{expr:'ceil(lengde / cc) + 1',     label:'Ant. stendere', unit:'stk'},
        stenderLm:  {expr:'ceil(antStendere * hoyde * 1.05)', label:'Stender lm', unit:'lm'},
        svilLm:     {expr:'ceil(lengde * 2 * 1.1)',    label:'Svill/rem lm',  unit:'lm'},
      },
      materialer:[
        {id:'virke',     nameTemplate:'Virke {stender} C24 (stender+svill/rem)', ratioExpr:'stenderLm + svilLm', unit:'lm', waste:5, desc:'Stendere + svill/rem samlet i lm'},
        {id:'vindsperre',name:'Vindsperre 1,5\u00D750m', baseRef:'veggAreal', ratio:0.02, roundUp:true, unit:'rull', waste:5, desc:'1 rull per 50 m\u00B2'},
        {id:'vindsperretape',name:'Vindsperre tape 60mm', baseRef:'veggAreal', ratio:0.3, unit:'lm', waste:5, desc:'Skjøter + kanter'},
        {id:'dampsperre',name:'Dampsperre 1,5\u00D750m', baseRef:'veggAreal', ratio:0.02, roundUp:true, unit:'rull', waste:5, desc:'1 rull per 50 m\u00B2'},
        {id:'dampsperretape',name:'Dampsperre tape', baseRef:'veggAreal', ratio:0.15, unit:'lm', waste:5, desc:'Skjøter + gjennomføringer'},
        {id:'isolasjon',nameTemplate:'Isolasjon {isoTykkelse}mm', baseRef:'veggAreal', ratio:1, unit:'m\u00B2', waste:5, desc:'Mineralull i stenderverk'},
        {id:'spiker',    name:'Spiker / skruer montasje', baseRef:'antStendere', ratio:0.3, roundUp:true, unit:'pk', waste:0, desc:'0.3 pk per stender'},
        {id:'beslag',    name:'Vinkelbeslag',             baseRef:'antStendere', ratio:2,   unit:'stk', waste:0, desc:'2 stk per stender'},
      ]
    }
  },

  bjelkelag: {
    label:'Bjelkelag',
    materialOptions:[
      {id:'bjelke',label:'Bjelkedimensjon',options:['48×198 C24','48×248 C24','73×198 C24','73×248 C24','I-bjelke 45×300']},
      {id:'cc',label:'C/C-avstand',options:['400 mm','600 mm']},
    ],
    inputs:[
      {id:'lengde',label:'Lengde (m)',default:8},
      {id:'bredde',label:'Bredde (m)',default:5},
    ],
    calc(v,mats){
      const areal=v.lengde*v.bredde;
      const ccStr=mats.cc||'600 mm';
      const ccM=parseInt(ccStr)/1000;
      const antBjelker=Math.ceil(v.lengde/ccM)+1;
      const bjelkeDim=mats.bjelke||'48×198 C24';
      const bjelkeLm=Math.ceil(antBjelker*v.bredde*1.05);
      const rimLm=Math.ceil(v.lengde*2*1.1);
      return {
        areal:areal.toFixed(1)+' m²',
        info:`${bjelkeDim} c/c ${ccStr}`,
        materialer:[
          {name:`Virke ${bjelkeDim} (bjelke+rim)`,qty:bjelkeLm+rimLm,unit:'lm',waste:5},
          {name:'Bjelkesko / beslag',qty:antBjelker*2,unit:'stk',waste:0},
          {name:'Spiker / skruer montasje',qty:Math.ceil(antBjelker/5),unit:'pk',waste:0},
          {name:'Undergulv 18mm OSB/spon',qty:Math.ceil(areal/2.97*1.08),unit:'pl',waste:8},
        ],
        timer:Math.round(areal*getCalcRate('bjelkelag')),
      };
    }
  },

  dragere: {
    label:'Dragere/bæring',
    materialOptions:[
      {id:'type',label:'Dragertype',options:['Limtre GL30c','Stålbjelke HEA/IPE','Dobbel 48×248 C24','LVL-bjelke']},
      {id:'dim',label:'Dimensjon',options:['Beregnes av ingeniør','90×270','115×270','115×360','140×405','Stål etter beregning']},
    ],
    inputs:[
      {id:'antall',label:'Antall dragere',default:1},
      {id:'lengde',label:'Lengde per drager (m)',default:4},
    ],
    calc(v,mats){
      const dragerType=mats.type||'Limtre GL30c';
      const dim=mats.dim||'Beregnes av ingeniør';
      return {
        areal:v.antall+' drager(e)',
        info:`${dragerType} ${dim}`,
        materialer:[
          {name:`${dragerType} ${dim}`,qty:v.antall,unit:'stk',waste:0},
          {name:'Stolpesko / fundament',qty:v.antall*2,unit:'stk',waste:0},
          {name:'Gjengestang M16 + mutter',qty:v.antall*2,unit:'stk',waste:0},
          {name:'Bolter / skruer montasje',qty:v.antall,unit:'pk',waste:0},
        ],
        timer:Math.round(v.antall*getCalcRate('dragere')),
      };
    }
  },

  kledning: {
    label:'Montering av kledning',
    materialOptions:[
      {id:'type',label:'Kledningstype',options:['D-fals 19×148','D-fals 19×120','Stående kledning 19×148','Liggende kledning 19×98','Villmarkspanel 19×148']},
      {id:'sloeyfe',label:'Sløyfe/lekt',options:['23×36 sløyfe + 23×48 lekt','23×48 lekt','36×48 lekt']},
    ],
    inputs:[
      {id:'bredde',label:'Veggbredde (m)',default:6},
      {id:'hoyde',label:'Vegghøyde (m)',default:2.5},
      {id:'vinduer',label:'Antall åpninger',default:1},
    ],
    calc(v,mats){
      const brutto=v.bredde*v.hoyde;
      const netto=Math.max(brutto-v.vinduer*1.8,1);
      const kledType=mats.type||'D-fals 19×148';
      const breddemm=kledType.includes('98')?98:kledType.includes('120')?120:148;
      const lmPerM2=1000/breddemm*1.12;
      const kledningLm=Math.ceil(netto*lmPerM2);
      const sloeyfe=mats.sloeyfe||'23×36 sløyfe + 23×48 lekt';
      const harSloeyfe=sloeyfe.includes('sløyfe');
      return {
        areal:netto.toFixed(1)+' m² netto',
        info:`${kledType} • ${sloeyfe}`,
        materialer:[
          {name:kledType,qty:kledningLm,unit:'lm',waste:12},
          ...(harSloeyfe?[{name:'Sløyfe 23×36',qty:Math.ceil(netto/0.6*1.1),unit:'lm',waste:10}]:[]),
          {name:`Lekter ${sloeyfe.includes('36×48')?'36×48':'23×48'}`,qty:Math.ceil(netto/0.6*1.1),unit:'lm',waste:10},
          {name:'Vindsperre',qty:Math.ceil(netto/50),unit:'rull',waste:5},
          {name:'Vindsperre tape 60mm',qty:Math.ceil(netto*0.3),unit:'lm',waste:5},
          {name:'Spiker ringspiker A2 50mm',qty:Math.ceil(netto/10),unit:'pk',waste:0},
        ],
        timer:Math.round(netto*getCalcRate('kledning')),
      };
    },
    recipe:{
      computed:{
        brutto:    {expr:'bredde * hoyde',                          label:'Brutto areal', unit:'m\u00B2'},
        netto:     {expr:'max(bredde * hoyde - vinduer * 1.8, 1)',  label:'Netto areal',  unit:'m\u00B2'},
        lmPerM2:   {expr:'1000 / 148 * 1.12',                      label:'lm/m\u00B2',   unit:'lm'},
      },
      materialer:[
        {id:'kledning',  nameTemplate:'{type}',                       baseRef:'netto', ratio:7.57, roundUp:true, unit:'lm', waste:12, desc:'lm kledning per m\u00B2 netto (148mm bredde)'},
        {id:'sloeyfe',   name:'Sl\u00F8yfe 23\u00D736',              baseRef:'netto', ratio:1.83, roundUp:true, unit:'lm', waste:10, desc:'lm sl\u00F8yfe per m\u00B2 (c/c 600)'},
        {id:'lekter',    name:'Lekter 23\u00D748',                   baseRef:'netto', ratio:1.83, roundUp:true, unit:'lm', waste:10, desc:'lm lekt per m\u00B2 (c/c 600)'},
        {id:'vindsperre',name:'Vindsperre',                          baseRef:'netto', ratio:0.02, roundUp:true, unit:'rull', waste:5, desc:'1 rull per 50 m\u00B2'},
        {id:'vindsperretape',name:'Vindsperre tape 60mm',           baseRef:'netto', ratio:0.3,  unit:'lm', waste:5, desc:'Skj\u00F8ter og kanter'},
        {id:'spiker',    name:'Spiker ringspiker A2 50mm',           baseRef:'netto', ratio:0.1,  roundUp:true, unit:'pk', waste:0, desc:'1 pk per 10 m\u00B2'},
      ]
    }
  },

  etterisolering: {
    label:'Etterisolering',
    materialOptions:[
      {id:'type',label:'Isolasjonstype',options:['Mineralull','Steinull','Isopor EPS','Trefiberisolasjon']},
    ],
    inputs:[
      {id:'areal',label:'Areal (m²)',default:20},
      {id:'tykkelse',label:'Tykkelse (mm)',default:50},
    ],
    calc(v,mats){
      const isolType=mats.type||'Mineralull';
      return {
        areal:v.areal+' m²',
        info:`${isolType} ${v.tykkelse} mm`,
        materialer:[
          {name:`${isolType} ${v.tykkelse} mm`,qty:Math.ceil(v.areal/5.76),unit:'pk',waste:8},
          {name:'Lekt 48×48',qty:Math.ceil(v.areal/0.6*1.1),unit:'lm',waste:10},
          {name:'Vindsperre',qty:Math.ceil(v.areal/50),unit:'rull',waste:5},
          {name:'Tape / mansjetter',qty:1,unit:'pakke',waste:0},
        ],
        timer:Math.round(v.areal*getCalcRate('etterisolering')),
      };
    },
    recipe:{
      computed:{
        areal:{expr:'areal', label:'Areal', unit:'m\u00B2'},
      },
      materialer:[
        {id:'isolasjon',  nameTemplate:'{type} {tykkelse} mm', baseRef:'areal', ratio:0.174, roundUp:true, unit:'pk', waste:8, desc:'1 pk per 5.76 m\u00B2'},
        {id:'lekt',       name:'Lekt 48\u00D748',             baseRef:'areal', ratio:1.83,  roundUp:true, unit:'lm', waste:10, desc:'lm lekt per m\u00B2 (c/c 600)'},
        {id:'vindsperre', name:'Vindsperre',                   baseRef:'areal', ratio:0.02,  roundUp:true, unit:'rull', waste:5, desc:'1 rull per 50 m\u00B2'},
        {id:'tape',       name:'Tape / mansjetter',            fixedQty:1,                   unit:'pakke', waste:0, desc:'1 pakke per jobb'},
      ]
    }
  },

  utv_listing: {
    label:'Utvendige belisting',
    materialOptions:[
      {id:'type',label:'Listtype',options:['Vannbord 19×123','Vannbord 19×148','Belistning 19×48','Vinduslist 19×68','Overgangslist 19×73']},
      {id:'profil',label:'Profil',options:['Rett','Fas','Rundet']},
    ],
    inputs:[
      {id:'lopemeter',label:'Løpemeter (lm)',default:30},
    ],
    calc(v,mats){
      const listType=mats.type||'Vannbord 19×123';
      return {
        areal:v.lopemeter+' lm',
        info:listType,
        materialer:[
          {name:listType,qty:Math.ceil(v.lopemeter*1.12),unit:'lm',waste:12},
          {name:'Skruer A2 utvendig',qty:Math.ceil(v.lopemeter/15),unit:'pk',waste:0},
          {name:'Grunning / maling',qty:Math.ceil(v.lopemeter/20),unit:'l',waste:0},
        ],
        timer:Math.round(v.lopemeter*getCalcRate('utv_listing')),
      };
    },
    recipe:{
      computed:{
        lopemeter:{expr:'lopemeter', label:'L\u00F8pemeter', unit:'lm'},
      },
      materialer:[
        {id:'list',   nameTemplate:'{type}',          baseRef:'lopemeter', ratio:1.12, roundUp:true, unit:'lm', waste:12, desc:'1.12 lm per lm (12% kapp)'},
        {id:'skruer', name:'Skruer A2 utvendig',      baseRef:'lopemeter', ratio:0.067, roundUp:true, unit:'pk', waste:0, desc:'1 pk per 15 lm'},
        {id:'maling', name:'Grunning / maling',       baseRef:'lopemeter', ratio:0.05,  roundUp:true, unit:'l', waste:0, desc:'1 l per 20 lm'},
      ]
    }
  },

  hjornekasser: {
    label:'Hjørnekasser',
    materialOptions:[
      {id:'type',label:'Kassetype',options:['Bord 19×123+19×148','Bord 19×148+19×148','Ferdig hjørnekasse aluminium']},
    ],
    inputs:[
      {id:'antall',label:'Antall hjørner',default:4},
      {id:'hoyde',label:'Høyde per hjørne (m)',default:2.5},
    ],
    calc(v,mats){
      const lm=v.antall*v.hoyde;
      const kasseType=mats.type||'Bord 19×123+19×148';
      return {
        areal:v.antall+' hjørne(r)',
        info:kasseType,
        materialer:[
          {name:`Hjørnekasse ${kasseType}`,qty:Math.ceil(lm*2*1.1),unit:'lm',waste:10},
          {name:'Skruer A2 utvendig',qty:Math.ceil(v.antall*0.5),unit:'pk',waste:0},
          {name:'Grunning / maling',qty:Math.ceil(lm/10),unit:'l',waste:0},
        ],
        timer:Math.round(v.antall*getCalcRate('hjornekasser')),
      };
    }
  },

  vindu: {
    label:'Vindu',
    materialOptions:[
      {id:'type',label:'Vindustype',options:['Standard 2-lags','Energi 3-lags','Fastkarm','Kippvindu']},
      {id:'foring',label:'Foring',options:['Inkludert foring og lister','Kun montering']},
    ],
    inputs:[
      {id:'antall',label:'Antall vinduer',default:1},
      {id:'bredde',label:'Bredde (cm)',default:100},
      {id:'hoyde',label:'Høyde (cm)',default:120},
    ],
    calc(v,mats){
      const karmLm=Math.ceil((v.bredde*2+v.hoyde*2)/100*1.2);
      const totalLm=karmLm*v.antall;
      const foringType=mats.foring||'Inkludert foring og lister';
      const ekstraMat=foringType.includes('foring')?[
        {name:'Utforing furu',qty:Math.ceil(totalLm*1.05),unit:'lm',waste:5},
        {name:'Karmlist',qty:Math.ceil(totalLm*1.05),unit:'lm',waste:5},
        {name:'Bunnfyllingslist',qty:Math.ceil(v.bredde/100*v.antall*1.1),unit:'lm',waste:10},
      ]:[];
      return {
        areal:v.antall+' vindu(er)',
        info:`${mats.type||'Standard 2-lags'} • ${foringType}`,
        materialer:[
          {name:'Karmskruer 90mm',qty:v.antall,unit:'pk',waste:0},
          {name:'Fugeskum proff',qty:v.antall*2,unit:'stk',waste:0},
          {name:'Dynaform tetteremse',qty:Math.ceil(totalLm),unit:'lm',waste:5},
          {name:'Fugemasse',qty:Math.ceil(v.antall*0.5),unit:'stk',waste:0},
          {name:'Alu. utsidelist',qty:Math.ceil(totalLm),unit:'lm',waste:5},
          ...ekstraMat,
        ],
        timer:Math.round(v.antall*getCalcRate('vindu')),
      };
    }
  },

  ytterdor: {
    label:'Ytterdør/terrassedør',
    materialOptions:[
      {id:'type',label:'Dørtype',options:['Ytterdør enkel','Ytterdør dobbel','Terrassedør skyve','Terrassedør sving','Balkongdør']},
      {id:'arbeid',label:'Arbeidsomfang',options:['Komplett inkl. foring og lister','Kun montering i åpning','Montering + karmsetting']},
    ],
    inputs:[
      {id:'antall',label:'Antall dører',default:1},
      {id:'bredde',label:'Bredde (cm)',default:100},
      {id:'hoyde',label:'Høyde (cm)',default:210},
    ],
    calc(v,mats){
      const omfar=Math.ceil((v.bredde*2+v.hoyde*2)/100*1.2);
      const arbeid=mats.arbeid||'Komplett inkl. foring og lister';
      const ekstraMat=arbeid.includes('foring')?[
        {name:'Foring/listverk utvendig',qty:omfar*v.antall,unit:'lm',waste:10},
      ]:[];
      return {
        areal:v.antall+' dør(er)',
        info:`${mats.type||'Ytterdør enkel'} • ${arbeid}`,
        materialer:[
          {name:'Karmskruer 120mm',qty:v.antall,unit:'pk',waste:0},
          {name:'Fugeskum proff',qty:v.antall*2,unit:'stk',waste:0},
          {name:'Tettestripe / membranband',qty:v.antall*2,unit:'stk',waste:0},
          {name:'Terskel / beslag',qty:v.antall,unit:'stk',waste:0},
          ...ekstraMat,
        ],
        timer:Math.round(v.antall*getCalcRate('ytterdor')),
      };
    }
  },

  takjobb: {
    label:'Takjobb',
    materialOptions:[
      {id:'tekking',label:'Taktekking',options:['Takstein betong','Takstein leire','Ståltak/platetak','Shingel','Papp/folie flatt tak']},
      {id:'undertak',label:'Undertak',options:['Undertaksduk diffusjonsåpen','Undertak plater','Asfalt undertaksplater']},
    ],
    inputs:[
      {id:'lengde',label:'Møne-/takkjellengde (m)',default:8},
      {id:'bredde',label:'Takflatens bredde (m)',default:5},
      {id:'helning',label:'Takvinkel (grader)',default:22},
      {id:'sperrer',label:'Antall taksperrer (stk)',default:14},
    ],
    calc(v,mats){
      const faktor=1/Math.cos(v.helning*Math.PI/180);
      const areal=v.lengde*v.bredde*faktor;
      const tekking=mats.tekking||'Takstein betong';
      return {
        areal:areal.toFixed(1)+' m²',
        info:tekking,
        materialer:[
          {name:`Taksperrer 48×198 C24`,qty:Math.ceil(v.sperrer*v.bredde*faktor*1.05),unit:'lm',waste:5},
          {name:mats.undertak||'Undertaksduk diffusjonsåpen',qty:Math.ceil(areal/50),unit:'rull',waste:5},
          {name:'Sløyfer 36×48 impr.',qty:Math.ceil(v.sperrer*v.bredde*faktor*1.1),unit:'lm',waste:8},
          {name:'Lekter 36×48',qty:Math.ceil(areal/0.35*1.1),unit:'lm',waste:8},
          {name:tekking,qty:Math.ceil(areal*1.1),unit:'m²',waste:10},
          {name:'Mønekam / mønebeslag',qty:Math.ceil(v.lengde*1.1),unit:'lm',waste:5},
          {name:'Festemateriell / beslag',qty:Math.ceil(areal/10),unit:'pk',waste:0},
        ],
        timer:Math.round(areal*getCalcRate('takjobb')),
      };
    }
  },

  vindskier: {
    label:'Vindskier/israft',
    materialOptions:[
      {id:'type',label:'Vindskitype',options:['19×148 grunnet','19×198 grunnet','19×148 + 19×98 dobbel','Ferdig aluminium']},
    ],
    inputs:[
      {id:'lopemeter',label:'Løpemeter vindski (lm)',default:16},
      {id:'israft',label:'Løpemeter israft (lm)',default:8},
    ],
    calc(v,mats){
      const totLm=v.lopemeter+v.israft;
      const vindskiType=mats.type||'19×148 grunnet';
      const erDobbel=vindskiType.includes('dobbel');
      return {
        areal:totLm+' lm totalt',
        info:vindskiType,
        materialer:[
          {name:`Vindskibord ${vindskiType}`,qty:Math.ceil(v.lopemeter*(erDobbel?2:1)*1.1),unit:'lm',waste:10},
          {name:'Israftbord 19×148',qty:Math.ceil(v.israft*1.1),unit:'lm',waste:10},
          {name:'Underbeslag / vindskibeslag',qty:Math.ceil(totLm/1.2),unit:'stk',waste:5},
          {name:'A2 skruer / spiker',qty:Math.ceil(totLm/15),unit:'pk',waste:0},
        ],
        timer:Math.round(totLm*getCalcRate('vindskier')),
      };
    }
  },

  takrenner: {
    label:'Takrenner og nedløp',
    materialOptions:[
      {id:'type',label:'Rennetype',options:['Stål plastbelagt','Stål sinkkobber','Kobber','Aluminium','Plast']},
      {id:'dim',label:'Dimensjon',options:['100 mm halvrund','125 mm halvrund','125 mm kasserenne']},
    ],
    inputs:[
      {id:'rennelm',label:'Takrenne (lm)',default:16},
      {id:'nedlop',label:'Antall nedløp',default:2},
      {id:'nedlophoyde',label:'Nedløpshøyde (m)',default:4},
    ],
    calc(v,mats){
      const renneType=mats.type||'Stål plastbelagt';
      return {
        areal:v.rennelm+' lm renne',
        info:`${renneType} ${mats.dim||'125 mm halvrund'}`,
        materialer:[
          {name:`Takrenne ${renneType}`,qty:Math.ceil(v.rennelm*1.05),unit:'lm',waste:5},
          {name:'Rennekroker',qty:Math.ceil(v.rennelm/0.6),unit:'stk',waste:0},
          {name:'Nedløpsrør',qty:Math.ceil(v.nedlop*v.nedlophoyde*1.1),unit:'lm',waste:10},
          {name:'Nedløpstrakt',qty:v.nedlop,unit:'stk',waste:0},
          {name:'Nedløpsfeste / braketter',qty:v.nedlop*Math.ceil(v.nedlophoyde/1.0),unit:'stk',waste:0},
          {name:'Endebunner',qty:2,unit:'stk',waste:0},
          {name:'Skjøteskruer / popnagler',qty:1,unit:'pk',waste:0},
        ],
        timer:Math.round(v.rennelm*getCalcRate('takrenner')),
      };
    }
  },

  terrasse: {
    label:'Terrasse',
    materialOptions:[
      {id:'bord',label:'Terrassebord',options:['28×120 impregnert','28×120 trykkimpregnert','28×145 impregnert','45×120 kebony','Kompositt 25×140']},
      {id:'fundament',label:'Fundamenttype',options:['Punktfundament betong','Skruefundament','Bjelkesko på plate']},
    ],
    inputs:[
      {id:'lengde',label:'Lengde (m)',default:4},
      {id:'bredde',label:'Bredde (m)',default:3},
    ],
    calc(v,mats){
      const areal=v.lengde*v.bredde;
      const bordValg=mats.bord||'28×120 impregnert';
      const breddemm=bordValg.includes('145')?145:bordValg.includes('140')?140:120;
      const lmPerM2=1000/breddemm*1.05;
      const bordLm=Math.ceil(areal*lmPerM2*1.1);
      const bjelkeLm=Math.ceil((v.bredde/0.6)*v.lengde*1.1);
      const antFund=Math.ceil(areal/2.5);
      return {
        areal:areal.toFixed(1)+' m²',
        info:`Bord: ${bordValg}`,
        materialer:[
          {name:`Terrassebord ${bordValg}`,qty:bordLm,unit:'lm',waste:10},
          {name:'Spikerslag 23×48',qty:Math.ceil(areal*1.8),unit:'lm',waste:10},
          {name:'Bjelkelag 48×198 C24',qty:bjelkeLm,unit:'lm',waste:8},
          {name:'Kantsargbord 48×198 impr.',qty:Math.ceil((v.lengde+v.bredde)*2*1.1),unit:'lm',waste:10},
          {name:'Fundament / stolpesko',qty:antFund,unit:'stk',waste:0},
          {name:'Terrasseskruer A2',qty:Math.ceil(areal/4),unit:'pk',waste:0},
          {name:'Beslag / bjelkesko',qty:Math.ceil(bjelkeLm/v.lengde)*2,unit:'stk',waste:0},
        ],
        timer:Math.round(areal*getCalcRate('terrasse')),
      };
    }
  },

  platting: {
    label:'Platting',
    materialOptions:[
      {id:'type',label:'Belegg',options:['Belegningsstein 60mm','Heller betong 40mm','Heller naturstein','Grus/singel komprimert']},
      {id:'kant',label:'Kantavslutning',options:['Kantstein betong','Stålkant','Trekant impregnert','Ingen']},
    ],
    inputs:[
      {id:'lengde',label:'Lengde (m)',default:5},
      {id:'bredde',label:'Bredde (m)',default:3},
    ],
    calc(v,mats){
      const areal=v.lengde*v.bredde;
      const omk=(v.lengde+v.bredde)*2;
      const plattType=mats.type||'Belegningsstein 60mm';
      const kantType=mats.kant||'Kantstein betong';
      const kantMat=kantType!=='Ingen'?[{name:kantType,qty:Math.ceil(omk*1.1),unit:'lm',waste:10}]:[];
      return {
        areal:areal.toFixed(1)+' m²',
        info:plattType,
        materialer:[
          {name:plattType,qty:Math.ceil(areal*1.05),unit:'m²',waste:5},
          {name:'Settsand 0-8',qty:Math.ceil(areal*0.05),unit:'m³',waste:0},
          {name:'Forsterkningslag pukk 8-32',qty:Math.ceil(areal*0.15),unit:'m³',waste:0},
          {name:'Fiberduk',qty:Math.ceil(areal*1.1),unit:'m²',waste:10},
          ...kantMat,
        ],
        timer:Math.round(areal*getCalcRate('platting')),
      };
    }
  },

  rekkverk: {
    label:'Rekkverk',
    materialOptions:[
      {id:'type',label:'Rekkverkstype',options:['Tre stolpe + sprosser','Tre med glass','Stålrekkverk','Wirespenn']},
      {id:'stolpe',label:'Stolpedimensjon',options:['73×73 impregnert','98×98 impregnert','73×73 lerk','Stålstolpe 40×40']},
    ],
    inputs:[
      {id:'lopemeter',label:'Løpemeter (lm)',default:6},
      {id:'hoyde',label:'Høyde (m)',default:1.0},
    ],
    calc(v,mats){
      const antStolper=Math.ceil(v.lopemeter/1.2)+1;
      const rkType=mats.type||'Tre stolpe + sprosser';
      const erGlass=rkType.includes('glass');
      const erStaal=rkType.includes('Stål')||rkType.includes('Wire');
      return {
        areal:v.lopemeter+' lm',
        info:rkType,
        materialer:[
          {name:`Stolpe ${mats.stolpe||'73×73 impregnert'}`,qty:antStolper,unit:'stk',waste:0},
          {name:'Håndlist',qty:Math.ceil(v.lopemeter*1.1),unit:'lm',waste:10},
          ...(erGlass?[{name:'Glassrekkverk herdet',qty:Math.ceil(v.lopemeter/1.2),unit:'stk',waste:0}]:[]),
          ...(!erGlass&&!erStaal?[{name:'Sprosser 23×73',qty:Math.ceil(v.lopemeter/0.12),unit:'stk',waste:5}]:[]),
          {name:'Stolpebeslag / montasje',qty:antStolper,unit:'stk',waste:0},
          {name:'Skruer A2 utvendig',qty:Math.ceil(v.lopemeter/5),unit:'pk',waste:0},
        ],
        timer:Math.round(v.lopemeter*getCalcRate('rekkverk')),
      };
    }
  },

  levegg: {
    label:'Levegg',
    materialOptions:[
      {id:'type',label:'Kledning',options:['Stående bord 19×148','Liggende bord 19×123','Spaltepanel','Glass + tre']},
      {id:'stolpe',label:'Stolpe',options:['98×98 impregnert','73×73 impregnert','Stålstolpe']},
    ],
    inputs:[
      {id:'lengde',label:'Lengde (m)',default:3},
      {id:'hoyde',label:'Høyde (m)',default:1.8},
    ],
    calc(v,mats){
      const areal=v.lengde*v.hoyde;
      const antStolper=Math.ceil(v.lengde/1.2)+1;
      const kledType=mats.type||'Stående bord 19×148';
      const erGlass=kledType.includes('Glass');
      return {
        areal:areal.toFixed(1)+' m²',
        info:kledType,
        materialer:[
          {name:`Stolpe ${mats.stolpe||'98×98 impregnert'}`,qty:antStolper,unit:'stk',waste:0},
          ...(erGlass?[
            {name:'Herdet glass 6mm',qty:Math.ceil(areal*0.6),unit:'m²',waste:5},
            {name:'Kledning tre',qty:Math.ceil(areal*0.4*8),unit:'lm',waste:10},
          ]:[
            {name:kledType,qty:Math.ceil(areal*1000/148*1.12),unit:'lm',waste:12},
          ]),
          {name:'Rigler 48×98',qty:Math.ceil(v.lengde*3*1.1),unit:'lm',waste:10},
          {name:'Stolpesko / fundament',qty:antStolper,unit:'stk',waste:0},
          {name:'Skruer A2 utvendig',qty:Math.ceil(areal/8),unit:'pk',waste:0},
        ],
        timer:Math.round(areal*getCalcRate('levegg')),
      };
    }
  },

  utv_trapp: {
    label:'Trapp (utvendig)',
    materialOptions:[
      {id:'type',label:'Trappetype',options:['Rettløp tre','L-trapp tre','Betongtrapp med trekledd','Ståltrapp med tretrinn']},
      {id:'materiale',label:'Tremateriale',options:['Impregnert furu','Lerk','Kebony','Eik']},
    ],
    inputs:[
      {id:'antallTrinn',label:'Antall trinn',default:6},
      {id:'bredde',label:'Trappens bredde (cm)',default:100},
      {id:'opptrinn',label:'Opptrinns høyde (mm)',default:180},
      {id:'inntrinn',label:'Inntrinns dybde (mm)',default:280},
    ],
    calc(v,mats){
      const mat=mats.materiale||'Impregnert furu';
      const brM=v.bredde/100;
      return {
        areal:v.antallTrinn+' trinn',
        info:`${mats.type||'Rettløp tre'} • ${mat}`,
        materialer:[
          {name:`Trinn ${mat} 48×${v.inntrinn>250?'300':'250'}`,qty:v.antallTrinn,unit:'stk',waste:5},
          {name:`Vange/bæring ${mat}`,qty:2,unit:'stk',waste:0},
          {name:'Opptrinn bord 22×148',qty:v.antallTrinn,unit:'stk',waste:5},
          {name:'Vinkeljern / trinnbeslag',qty:v.antallTrinn*2,unit:'stk',waste:0},
          {name:'Bolter / skruer A2',qty:1,unit:'pk',waste:0},
          {name:'Fundamentering (plate/punkt)',qty:2,unit:'stk',waste:0},
        ],
        timer:Math.round(getCalcRate('utv_trapp')),
      };
    }
  },

  pergola: {
    label:'Pergola',
    materialOptions:[
      {id:'stolpe',label:'Stolpe',options:['98×98 trykkimpregnert','123×123 lerk','Stålstolpe 100×100']},
      {id:'bjelke',label:'Toppbjelke',options:['48×198 C24','73×198 C24','Limtre 90×200']},
      {id:'tak',label:'Taktype',options:['Åpne sperrer (uten tak)','Klar polykarbonat','Seilduk','Stålplater']},
    ],
    inputs:[
      {id:'lengde',label:'Lengde (m)',default:4},
      {id:'bredde',label:'Bredde (m)',default:3},
      {id:'hoyde',label:'Høyde (m)',default:2.4},
    ],
    calc(v,mats){
      const areal=v.lengde*v.bredde;
      const antStolper=((Math.ceil(v.lengde/2.5)+1)*2);
      const antSperrer=Math.ceil(v.lengde/0.6)+1;
      const takType=mats.tak||'Åpne sperrer (uten tak)';
      const harTak=!takType.includes('uten tak');
      return {
        areal:areal.toFixed(1)+' m²',
        info:`${mats.stolpe||'98×98'} • ${takType}`,
        materialer:[
          {name:`Stolpe ${mats.stolpe||'98×98 trykkimpregnert'}`,qty:antStolper,unit:'stk',waste:0},
          {name:`Toppbjelke ${mats.bjelke||'48×198 C24'}`,qty:Math.ceil((v.lengde+v.bredde)*2*1.1),unit:'lm',waste:10},
          {name:'Sperrer 48×148',qty:Math.ceil(antSperrer*v.bredde*1.05),unit:'lm',waste:5},
          ...(harTak?[{name:takType,qty:Math.ceil(areal*1.1),unit:'m²',waste:10}]:[]),
          {name:'Stolpesko / fundament',qty:antStolper,unit:'stk',waste:0},
          {name:'Bolter / beslag montasje',qty:Math.ceil(antStolper*1.5),unit:'pk',waste:0},
        ],
        timer:Math.round(areal*getCalcRate('pergola')),
      };
    }
  },

  garasje: {
    label:'Garasje',
    materialOptions:[
      {id:'vegg',label:'Veggkonstruksjon',options:['Bindingsverk 48×148','Bindingsverk 48×98','Massivtre/laft']},
      {id:'kledning',label:'Utvendig kledning',options:['D-fals 19×148','Stående panel 19×148','Villmarkspanel','Plater']},
      {id:'tak',label:'Taktype',options:['Saltak takstein','Saltak ståltak','Pulttak ståltak','Flatt tak membran']},
      {id:'port',label:'Garasjeport',options:['Elektrisk seksjonalport','Manuell seksjonalport','Sving garasjeport','Dobbel port']},
    ],
    inputs:[
      {id:'lengde',label:'Lengde (m)',default:6},
      {id:'bredde',label:'Bredde (m)',default:4},
      {id:'vegghoyde',label:'Vegghøyde (m)',default:2.4},
    ],
    calc(v,mats){
      const gulvAreal=v.lengde*v.bredde;
      const omk=(v.lengde+v.bredde)*2;
      const veggAreal=omk*v.vegghoyde;
      const takAreal=v.lengde*v.bredde*1.15;
      const veggType=mats.vegg||'Bindingsverk 48×148';
      const dim=veggType.includes('98')?'48×98':'48×148';
      const antStendere=Math.ceil(omk/0.6);
      const stenderLm=Math.ceil(antStendere*v.vegghoyde*1.05);
      const svilLm=Math.ceil(omk*2*1.1);
      return {
        areal:gulvAreal.toFixed(0)+' m² grunnflate',
        info:`${veggType} • ${mats.tak||'Saltak takstein'}`,
        materialer:[
          {name:`Virke ${dim} C24 (stender+svill/rem)`,qty:stenderLm+svilLm,unit:'lm',waste:5},
          {name:mats.kledning||'D-fals 19×148',qty:Math.ceil(veggAreal*1000/148*1.12),unit:'lm',waste:12},
          {name:'Vindsperre',qty:Math.ceil(veggAreal/50),unit:'rull',waste:5},
          {name:'Taksperrer 48×198 C24',qty:Math.ceil((Math.ceil(v.lengde/0.6)+1)*v.bredde*1.05),unit:'lm',waste:5},
          {name:mats.tak||'Saltak takstein',qty:Math.ceil(takAreal*1.1),unit:'m²',waste:10},
          {name:'Undertaksplater / duk',qty:Math.ceil(takAreal/50),unit:'rull',waste:5},
          {name:mats.port||'Elektrisk seksjonalport',qty:1,unit:'stk',waste:0},
          {name:'Betong ringmur/plate',qty:Math.ceil(omk*0.4*0.8),unit:'m³',waste:5},
          {name:'Festemateriell / beslag',qty:Math.ceil(gulvAreal/5),unit:'pk',waste:0},
        ],
        timer:Math.round(gulvAreal*getCalcRate('garasje')),
      };
    }
  },

  carport: {
    label:'Carport',
    materialOptions:[
      {id:'stolpe',label:'Stolper',options:['98×98 trykkimpregnert','123×123 limtre','Stålstolpe 100×100']},
      {id:'tak',label:'Taktype',options:['Pulttak stålplater','Pulttak polykarbonat','Flatt tak membran']},
    ],
    inputs:[
      {id:'lengde',label:'Lengde (m)',default:6},
      {id:'bredde',label:'Bredde (m)',default:3},
      {id:'hoyde',label:'Høyde forkant (m)',default:2.4},
    ],
    calc(v,mats){
      const areal=v.lengde*v.bredde;
      const antStolper=Math.ceil(v.lengde/2.5)+1;
      return {
        areal:areal.toFixed(1)+' m²',
        info:`${mats.stolpe||'98×98'} • ${mats.tak||'Pulttak stålplater'}`,
        materialer:[
          {name:`Stolpe ${mats.stolpe||'98×98 trykkimpregnert'}`,qty:antStolper*2,unit:'stk',waste:0},
          {name:'Drager/bæring 73×198 C24',qty:Math.ceil(v.bredde*antStolper*1.1),unit:'lm',waste:10},
          {name:'Åser/sperrer 48×198',qty:Math.ceil((Math.ceil(v.lengde/0.9)+1)*v.bredde*1.05),unit:'lm',waste:5},
          {name:mats.tak||'Pulttak stålplater',qty:Math.ceil(areal*1.1),unit:'m²',waste:10},
          {name:'Stolpesko / fundament',qty:antStolper*2,unit:'stk',waste:0},
          {name:'Bolter / beslag',qty:Math.ceil(antStolper*2),unit:'pk',waste:0},
        ],
        timer:Math.round(areal*getCalcRate('carport')),
      };
    }
  },

  bod: {
    label:'Bod',
    materialOptions:[
      {id:'vegg',label:'Veggkonstruksjon',options:['Bindingsverk 48×98','Bindingsverk 48×148','Massivtre']},
      {id:'kledning',label:'Utvendig kledning',options:['D-fals 19×148','Stående panel 19×148','Villmarkspanel']},
      {id:'tak',label:'Taktype',options:['Pulttak shingel','Pulttak ståltak','Saltak takstein']},
    ],
    inputs:[
      {id:'lengde',label:'Lengde (m)',default:3},
      {id:'bredde',label:'Bredde (m)',default:2},
      {id:'vegghoyde',label:'Vegghøyde (m)',default:2.2},
    ],
    calc(v,mats){
      const gulvAreal=v.lengde*v.bredde;
      const omk=(v.lengde+v.bredde)*2;
      const veggAreal=omk*v.vegghoyde;
      const dim=mats.vegg&&mats.vegg.includes('98')?'48×98':'48×148';
      const antStendere=Math.ceil(omk/0.6);
      const stenderLm=Math.ceil(antStendere*v.vegghoyde*1.05);
      const svilLm=Math.ceil(omk*2*1.1);
      return {
        areal:gulvAreal.toFixed(0)+' m² grunnflate',
        info:`${dim} • ${mats.tak||'Pulttak shingel'}`,
        materialer:[
          {name:`Virke ${dim} C24 (stender+svill/rem)`,qty:stenderLm+svilLm,unit:'lm',waste:5},
          {name:mats.kledning||'D-fals 19×148',qty:Math.ceil(veggAreal*1000/148*1.12),unit:'lm',waste:12},
          {name:'Gulv 22mm spon/OSB',qty:Math.ceil(gulvAreal/2.97*1.08),unit:'pl',waste:8},
          {name:'Bjelkelag 48×148',qty:Math.ceil((Math.ceil(v.lengde/0.6)+1)*v.bredde*1.05),unit:'lm',waste:5},
          {name:'Taktekking',qty:Math.ceil(gulvAreal*1.15),unit:'m²',waste:10},
          {name:'Dør bod 90×200',qty:1,unit:'stk',waste:0},
          {name:'Festemateriell / beslag',qty:Math.ceil(gulvAreal/3),unit:'pk',waste:0},
        ],
        timer:Math.round(gulvAreal*getCalcRate('bod')),
      };
    }
  },

  inngangsparti: {
    label:'Inngangsparti',
    materialOptions:[
      {id:'tak',label:'Taktype over inngang',options:['Pulttak tekking','Flatt tak membran','Buet glasstak']},
      {id:'gulv',label:'Gulv/trinn',options:['Betongtrinn','Tretrinn impregnert','Naturstein','Belegningsstein']},
    ],
    inputs:[
      {id:'bredde',label:'Bredde (m)',default:2},
      {id:'dybde',label:'Dybde (m)',default:1.5},
      {id:'antallTrinn',label:'Antall trinn',default:2},
    ],
    calc(v,mats){
      const takAreal=v.bredde*v.dybde;
      const takType=mats.tak||'Pulttak tekking';
      const gulvType=mats.gulv||'Betongtrinn';
      return {
        areal:takAreal.toFixed(1)+' m² tak',
        info:`${takType} • ${gulvType}`,
        materialer:[
          {name:'Stolper 98×98 impregnert',qty:2,unit:'stk',waste:0},
          {name:'Bjelke/drager 48×198',qty:Math.ceil(v.bredde*1.1),unit:'lm',waste:10},
          {name:'Sperrer 48×148',qty:Math.ceil((Math.ceil(v.bredde/0.6)+1)*v.dybde*1.05),unit:'lm',waste:5},
          {name:`Taktekking (${takType})`,qty:Math.ceil(takAreal*1.15),unit:'m²',waste:10},
          {name:gulvType,qty:v.antallTrinn,unit:'stk',waste:0},
          {name:'Beslag / montasjemateriell',qty:1,unit:'pk',waste:0},
        ],
        timer:Math.round(getCalcRate('inngangsparti')),
      };
    }
  },

  tilbygg: {
    label:'Tilbygg',
    materialOptions:[
      {id:'vegg',label:'Veggkonstruksjon',options:['Bindingsverk 48×148','Bindingsverk 48×198','Bindingsverk 48×248']},
      {id:'kledning',label:'Utvendig kledning',options:['D-fals 19×148','Stående panel 19×148','Liggende panel']},
      {id:'tak',label:'Taktype',options:['Pulttak mot eksisterende','Saltak','Flatt tak']},
      {id:'isolasjon',label:'Isolasjon',options:['150 mm mineralull','200 mm mineralull','250 mm mineralull']},
    ],
    inputs:[
      {id:'lengde',label:'Lengde (m)',default:5},
      {id:'bredde',label:'Bredde (m)',default:4},
      {id:'vegghoyde',label:'Vegghøyde (m)',default:2.4},
    ],
    calc(v,mats){
      const gulvAreal=v.lengde*v.bredde;
      const omk=(v.lengde+v.bredde)*2;
      const veggAreal=omk*v.vegghoyde;
      const takAreal=gulvAreal*1.15;
      const dim=mats.vegg?mats.vegg.split(' ')[1]:'48×148';
      const antStendere=Math.ceil(omk/0.6);
      const stenderLm=Math.ceil(antStendere*v.vegghoyde*1.05);
      const svilLm=Math.ceil(omk*2*1.1);
      const isolStr=mats.isolasjon||'200 mm mineralull';
      const isolMm=parseInt(isolStr);
      return {
        areal:gulvAreal.toFixed(0)+' m² grunnflate',
        info:`${dim} • ${mats.tak||'Pulttak'}`,
        materialer:[
          {name:'Betong fundament',qty:Math.ceil(omk*0.4*0.8),unit:'m³',waste:5},
          {name:'Armering Ø12',qty:Math.ceil(omk*4),unit:'lm',waste:10},
          {name:`Virke ${dim} C24 (stender+svill/rem)`,qty:stenderLm+svilLm,unit:'lm',waste:5},
          {name:`Isolasjon ${isolMm} mm`,qty:Math.ceil(veggAreal/5.76),unit:'pk',waste:8},
          {name:'Vindsperre',qty:Math.ceil(veggAreal/50),unit:'rull',waste:5},
          {name:mats.kledning||'D-fals 19×148',qty:Math.ceil(veggAreal*1000/148*1.12),unit:'lm',waste:12},
          {name:'Virke 48×198 C24 (bjelke+sperrer)',qty:Math.ceil((Math.ceil(v.lengde/0.6)+1)*v.bredde*1.05)*2,unit:'lm',waste:5},
          {name:'Undergulv 22mm spon',qty:Math.ceil(gulvAreal/2.97*1.08),unit:'pl',waste:8},
          {name:'Taktekking',qty:Math.ceil(takAreal*1.1),unit:'m²',waste:10},
          {name:'Vinduer (snitt)',qty:Math.ceil(gulvAreal/8),unit:'stk',waste:0},
          {name:'Festemateriell / beslag',qty:Math.ceil(gulvAreal/3),unit:'pk',waste:0},
        ],
        timer:Math.round(gulvAreal*getCalcRate('tilbygg')),
      };
    }
  },

  gjerde: {
    label:'Gjerde',
    materialOptions:[
      {id:'type',label:'Gjerdetype',options:['Stakittgjerde','Skigard','Plankgjerde lukket','Spilegjerde','Flettverksgjerde']},
      {id:'stolpe',label:'Stolpe',options:['73×73 trykkimpregnert','98×98 trykkimpregnert','Stålstolpe 60×60']},
    ],
    inputs:[
      {id:'lengde',label:'Lengde (m)',default:10},
      {id:'hoyde',label:'Høyde (m)',default:1.2},
      {id:'ccStolpe',label:'Avstand mellom stolper (m)',default:1.8},
    ],
    calc(v,mats){
      const antStolper=Math.ceil(v.lengde/v.ccStolpe)+1;
      const gjerdeType=mats.type||'Stakittgjerde';
      const erLukket=gjerdeType.includes('lukket');
      const antRigler=v.hoyde>1.2?3:2;
      const bordLm=erLukket?Math.ceil(v.lengde*v.hoyde*1000/123*1.1):Math.ceil(v.lengde/0.08);
      return {
        areal:v.lengde+' lm',
        info:`${gjerdeType} • h=${v.hoyde}m`,
        materialer:[
          {name:`Stolpe ${mats.stolpe||'73×73 trykkimpregnert'}`,qty:antStolper,unit:'stk',waste:0},
          {name:'Rigler 48×98 impregnert',qty:Math.ceil(v.lengde*antRigler*1.1),unit:'lm',waste:10},
          {name:`Bord/spiler gjerde ${gjerdeType}`,qty:bordLm,unit:erLukket?'lm':'stk',waste:10},
          {name:'Stolpesko / fundament',qty:antStolper,unit:'stk',waste:0},
          {name:'Skruer A2 utvendig',qty:Math.ceil(v.lengde/5),unit:'pk',waste:0},
        ],
        timer:Math.round(v.lengde*getCalcRate('gjerde')),
      };
    }
  },

  // ══════════════════════════════════════════════════════════
  // INNVENDIGE JOBBER
  // ══════════════════════════════════════════════════════════

  // ── 1. Innevegger ─────────────────────────────────────────
  innevegger: {
    label:'Innevegger',
    materialOptions:[
      {id:'stender',label:'Stenderdimensjon',options:['48×70','48×98','36×98','48×148']},
      {id:'cc',label:'C/C-avstand',options:['300 mm','400 mm','600 mm']},
      {id:'gips',label:'Gipstype',options:['Standard 13 mm','Brannhemmende 15 mm','Fuktbestandig 13 mm','Ingen (kun reisverk)']},
      {id:'isolasjon',label:'Isolasjon',options:['70 mm mineralull','100 mm mineralull','Ingen']},
    ],
    inputs:[
      {id:'lengde',label:'Vegglengde (m)',default:4},
      {id:'hoyde',label:'Vegghøyde (m)',default:2.4},
    ],
    calc(v,mats){
      const areal=v.lengde*v.hoyde;
      const ccM=parseInt(mats.cc||'600')/1000;
      const antStendere=Math.ceil(v.lengde/ccM)+2;
      const stDim=mats.stender||'48×98';
      const gipsType=mats.gips||'Standard 13 mm';
      const harGips=!gipsType.includes('Ingen');
      const gipsPlater=harGips?Math.ceil(areal/2.88*2*1.1):0;
      const isolType=mats.isolasjon||'100 mm mineralull';
      const isolMat=isolType!=='Ingen'?[{name:`Mineralull ${isolType.replace(' mineralull','')}`,qty:Math.ceil(areal/5.76),unit:'pk',waste:5}]:[];
      return {
        areal:areal.toFixed(1)+' m²',
        info:`${stDim} c/c ${mats.cc||'600 mm'} • ${gipsType}`,
        materialer:[
          {name:`Virke ${stDim} C24 (stender+svill/rem)`,qty:Math.ceil(antStendere*v.hoyde*1.05)+Math.ceil(v.lengde*2*1.1),unit:'lm',waste:5},
          ...(harGips?[
            {name:`Gips ${gipsType}`,qty:gipsPlater,unit:'pl',waste:10},
            {name:'Gipsskruer båndet',qty:Math.ceil(areal/20),unit:'pk',waste:0},
            {name:'Sparkelpasta',qty:Math.ceil(areal/15),unit:'spann',waste:0},
            {name:'Fugebånd papir',qty:Math.ceil(v.lengde*3+v.hoyde*2),unit:'lm',waste:5},
          ]:[]),
          ...isolMat,
          {name:'Spiker / skruer montasje',qty:Math.ceil(antStendere/10),unit:'pk',waste:0},
        ],
        timer:Math.round(areal*getCalcRate('innevegger')),
      };
    },
    recipe:{
      computed:{
        veggAreal:   {expr:'lengde * hoyde',           label:'Vegg-areal',    unit:'m\u00B2'},
        antStendere: {expr:'ceil(lengde / cc) + 2',    label:'Ant. stendere', unit:'stk'},
        stenderLm:   {expr:'ceil(antStendere * hoyde * 1.05)', label:'Stender lm', unit:'lm'},
        svilLm:      {expr:'ceil(lengde * 2 * 1.1)',   label:'Svill/rem lm',  unit:'lm'},
      },
      materialer:[
        {id:'virke',      nameTemplate:'Virke {stender} C24 (stender+svill/rem)', ratioExpr:'stenderLm + svilLm', unit:'lm', waste:5, desc:'Stendere + svill/rem samlet'},
        {id:'gips',       nameTemplate:'Gips {gips}',    baseRef:'veggAreal', ratio:0.764, roundUp:true, unit:'pl', waste:10, desc:'2 sider x 1 pl/2.88m\u00B2 x 1.1', condition:{matNotEquals:{field:'gips',value:'Ingen'}}},
        {id:'isolasjon',  nameTemplate:'Mineralull {isolasjon}', baseRef:'veggAreal', ratio:0.174, roundUp:true, unit:'pk', waste:5, desc:'1 pk per 5.76 m\u00B2', condition:{matNotEquals:{field:'isolasjon',value:'Ingen'}}},
        {id:'gipsskruer', name:'Gipsskruer b\u00E5ndet',baseRef:'veggAreal', ratio:0.05, roundUp:true, unit:'pk', waste:0, desc:'1 pk per 20 m\u00B2', condition:{matNotEquals:{field:'gips',value:'Ingen'}}},
        {id:'sparkel',    name:'Sparkelpasta',             baseRef:'veggAreal', ratio:0.067, roundUp:true, unit:'spann', waste:0, desc:'1 spann per 15 m\u00B2', condition:{matNotEquals:{field:'gips',value:'Ingen'}}},
        {id:'fugebaand',  name:'Fugeb\u00E5nd papir',     baseRef:'veggAreal', ratio:0.5,  unit:'lm', waste:5, desc:'Skj\u00F8ter mellom gipsplater', condition:{matNotEquals:{field:'gips',value:'Ingen'}}},
        {id:'spiker',     name:'Spiker / skruer montasje', baseRef:'antStendere', ratio:0.1, roundUp:true, unit:'pk', waste:0, desc:'1 pk per 10 stendere'},
      ]
    }
  },

  // ── 2. Bærevegger ─────────────────────────────────────────
  baerevegger: {
    label:'Bærevegger',
    materialOptions:[
      {id:'stender',label:'Stenderdimensjon',options:['48×98','48×148','48×198','73×98']},
      {id:'cc',label:'C/C-avstand',options:['300 mm','400 mm','600 mm']},
    ],
    inputs:[
      {id:'lengde',label:'Vegglengde (m)',default:4},
      {id:'hoyde',label:'Vegghøyde (m)',default:2.4},
    ],
    calc(v,mats){
      const areal=v.lengde*v.hoyde;
      const ccM=parseInt(mats.cc||'600')/1000;
      const antStendere=Math.ceil(v.lengde/ccM)+2;
      const stDim=mats.stender||'48×148';
      return {
        areal:areal.toFixed(1)+' m²',
        info:`${stDim} c/c ${mats.cc||'600 mm'}`,
        materialer:[
          {name:`Virke ${stDim} C24 (stender+svill/rem)`,qty:Math.ceil(antStendere*v.hoyde*1.05)+Math.ceil(v.lengde*2*1.1),unit:'lm',waste:5},
          {name:'Vinkelbeslag',qty:antStendere*2,unit:'stk',waste:0},
          {name:'Spiker / skruer montasje',qty:Math.ceil(antStendere/8),unit:'pk',waste:0},
        ],
        timer:Math.round(areal*getCalcRate('baerevegger')),
      };
    }
  },

  // ── 3. Bjelkelag og gulvoppbygging ────────────────────────
  inn_bjelkelag: {
    label:'Bjelkelag og gulvoppbygging',
    materialOptions:[
      {id:'bjelke',label:'Bjelkedimensjon',options:['48×148 C24','48×198 C24','48×248 C24','73×198 C24','I-bjelke 45×250']},
      {id:'cc',label:'C/C-avstand',options:['400 mm','600 mm']},
      {id:'undergulv',label:'Undergulv',options:['22 mm sponplate','18 mm OSB','22 mm kryssfiner','Ingen']},
    ],
    inputs:[
      {id:'lengde',label:'Lengde (m)',default:6},
      {id:'bredde',label:'Bredde (m)',default:4},
    ],
    calc(v,mats){
      const areal=v.lengde*v.bredde;
      const ccM=parseInt(mats.cc||'600')/1000;
      const antBjelker=Math.ceil(v.lengde/ccM)+1;
      const bjelkeDim=mats.bjelke||'48×198 C24';
      const ugType=mats.undergulv||'22 mm sponplate';
      const harUg=!ugType.includes('Ingen');
      const bjelkeLm=Math.ceil(antBjelker*v.bredde*1.05);
      const rimLm=Math.ceil(v.lengde*2*1.1);
      return {
        areal:areal.toFixed(1)+' m²',
        info:`${bjelkeDim} c/c ${mats.cc||'600 mm'}`,
        materialer:[
          {name:`Virke ${bjelkeDim} (bjelke+rim)`,qty:bjelkeLm+rimLm,unit:'lm',waste:5},
          ...(harUg?[{name:`Undergulv ${ugType}`,qty:Math.ceil(areal/2.97*1.08),unit:'pl',waste:8}]:[]),
          {name:'Bjelkesko / beslag',qty:antBjelker*2,unit:'stk',waste:0},
          {name:'Skruer / spiker montasje',qty:Math.ceil(antBjelker/6),unit:'pk',waste:0},
        ],
        timer:Math.round(areal*getCalcRate('inn_bjelkelag')),
      };
    }
  },

  // ── 4. Gulvavretting ──────────────────────────────────────
  gulvavretting: {
    label:'Gulvavretting',
    materialOptions:[
      {id:'type',label:'Avrettingsmetode',options:['Selvutjevnende masse','Sponplater på strøer','Kryssfiner på strøer','Lettklinker + avrett']},
    ],
    inputs:[
      {id:'areal',label:'Areal (m²)',default:15},
      {id:'tykkelse',label:'Gj.snitt tykkelse (mm)',default:10},
    ],
    calc(v,mats){
      const metode=mats.type||'Selvutjevnende masse';
      const erMasse=metode.includes('masse')||metode.includes('Lettklinker');
      const erStroer=metode.includes('strøer');
      return {
        areal:v.areal+' m²',
        info:metode,
        materialer:[
          ...(erMasse?[
            {name:'Selvutjevnende masse',qty:Math.ceil(v.areal*v.tykkelse/1000*1600/25),unit:'sekk',waste:5},
            {name:'Primer',qty:Math.ceil(v.areal/15),unit:'l',waste:0},
          ]:[]),
          ...(erStroer?[
            {name:'Strøer 48×48 / kiler',qty:Math.ceil(v.areal/0.4*1.1),unit:'lm',waste:10},
            {name:`${metode.includes('Kryssfiner')?'Kryssfiner 18mm':'Sponplate 22mm'}`,qty:Math.ceil(v.areal/2.97*1.08),unit:'pl',waste:8},
            {name:'Skruer montasje',qty:Math.ceil(v.areal/15),unit:'pk',waste:0},
          ]:[]),
          ...(metode.includes('Lettklinker')?[
            {name:'Lettklinker (Leca)',qty:Math.ceil(v.areal*v.tykkelse/1000),unit:'m³',waste:5},
          ]:[]),
        ],
        timer:Math.round(v.areal*getCalcRate('gulvavretting')),
      };
    }
  },

  // ── 5. Isolering vegger/tak/etasjeskiller ─────────────────
  inn_isolering: {
    label:'Isolering vegger/tak/etasjeskiller',
    materialOptions:[
      {id:'type',label:'Isolasjonstype',options:['Mineralull','Steinull','Glassull','Trefiberisolasjon']},
      {id:'omraade',label:'Område',options:['Vegger','Tak/himling','Etasjeskiller','Gulv mot grunn']},
    ],
    inputs:[
      {id:'areal',label:'Areal (m²)',default:20},
      {id:'tykkelse',label:'Tykkelse (mm)',default:100},
    ],
    calc(v,mats){
      const isolType=mats.type||'Mineralull';
      const omraade=mats.omraade||'Vegger';
      const pkAreal=5.76;
      return {
        areal:v.areal+' m²',
        info:`${isolType} ${v.tykkelse} mm — ${omraade}`,
        materialer:[
          {name:`${isolType} ${v.tykkelse} mm`,qty:Math.ceil(v.areal/pkAreal),unit:'pk',waste:8},
          {name:'Dampsperre PE-folie 0,2mm',qty:Math.ceil(v.areal/37.5),unit:'rull',waste:10},
          {name:'Dampsperre-tape 50mm',qty:Math.ceil(v.areal/30),unit:'rull',waste:0},
          {name:'Stifter / festemateriell',qty:Math.ceil(v.areal/30),unit:'pk',waste:0},
        ],
        timer:Math.round(v.areal*getCalcRate('inn_isolering')),
      };
    }
  },

  // ── 6. Utlekting innervegger ──────────────────────────────
  utlekting_vegg: {
    label:'Utlekting innervegger',
    materialOptions:[
      {id:'lekt',label:'Lektdimensjon',options:['23×48','36×48','48×48']},
      {id:'cc',label:'C/C-avstand',options:['300 mm','400 mm','600 mm']},
    ],
    inputs:[
      {id:'areal',label:'Veggareal (m²)',default:15},
    ],
    calc(v,mats){
      const lektDim=mats.lekt||'36×48';
      const ccM=parseInt(mats.cc||'600')/1000;
      const lektLm=Math.ceil(v.areal/ccM*1.1);
      return {
        areal:v.areal+' m²',
        info:`${lektDim} c/c ${mats.cc||'600 mm'}`,
        materialer:[
          {name:`Lekt ${lektDim}`,qty:lektLm,unit:'lm',waste:10},
          {name:'Spiker / skruer montasje',qty:Math.ceil(lektLm/30),unit:'pk',waste:0},
          {name:'Kiler/justerbrikker',qty:Math.ceil(v.areal/5),unit:'stk',waste:0},
        ],
        timer:Math.round(v.areal*getCalcRate('utlekting_vegg')),
      };
    }
  },

  // ── 7. Nedlekting tak ─────────────────────────────────────
  nedlekting_tak: {
    label:'Nedlekting tak',
    materialOptions:[
      {id:'lekt',label:'Lektdimensjon',options:['36×48','48×48','48×70']},
      {id:'cc',label:'C/C-avstand',options:['300 mm','400 mm','600 mm']},
      {id:'pendel',label:'Feste',options:['Direkte på bjelke','Pendler/fjærstropp','Opphengt systemhimling']},
    ],
    inputs:[
      {id:'areal',label:'Takareal (m²)',default:20},
    ],
    calc(v,mats){
      const lektDim=mats.lekt||'36×48';
      const ccM=parseInt(mats.cc||'400')/1000;
      const lektLm=Math.ceil(v.areal/ccM*1.1);
      const feste=mats.pendel||'Direkte på bjelke';
      const erPendel=feste.includes('Pendler')||feste.includes('Opphengt');
      return {
        areal:v.areal+' m²',
        info:`${lektDim} c/c ${mats.cc||'400 mm'} • ${feste}`,
        materialer:[
          {name:`Lekt ${lektDim}`,qty:lektLm,unit:'lm',waste:10},
          ...(erPendel?[{name:'Pendler/fjærstropp',qty:Math.ceil(v.areal/0.8),unit:'stk',waste:5}]:[]),
          {name:'Skruer montasje',qty:Math.ceil(lektLm/30),unit:'pk',waste:0},
          {name:'Kiler/justerbrikker',qty:Math.ceil(v.areal/3),unit:'stk',waste:0},
        ],
        timer:Math.round(v.areal*getCalcRate('nedlekting_tak')),
      };
    }
  },

  // ── 8. Gipsplater vegger ──────────────────────────────────
  gips_vegg: {
    label:'Gipsplater vegger',
    materialOptions:[
      {id:'type',label:'Gipstype',options:['Standard 13 mm','Brannhemmende 15 mm (EI30)','Fuktbestandig 13 mm','Vindgips 9 mm','Dobbelt lag 2×13 mm']},
    ],
    inputs:[
      {id:'areal',label:'Veggareal (m²)',default:20},
      {id:'sider',label:'Antall sider',default:2},
    ],
    calc(v,mats){
      const gipsType=mats.type||'Standard 13 mm';
      const erDobbel=gipsType.includes('Dobbelt');
      const lagFaktor=erDobbel?2:1;
      const totAreal=v.areal*v.sider;
      const plater=Math.ceil(totAreal/2.88*lagFaktor*1.1);
      return {
        areal:totAreal.toFixed(1)+' m² ('+v.sider+' side(r))',
        info:gipsType,
        materialer:[
          {name:`Gips ${gipsType}`,qty:plater,unit:'pl',waste:10},
          {name:'Gipsskruer båndet',qty:Math.ceil(totAreal*lagFaktor/20),unit:'pk',waste:0},
          {name:'Sparkelmasse',qty:Math.ceil(totAreal*lagFaktor/30),unit:'spann',waste:5},
          {name:'Papirtape / fibertape',qty:Math.ceil(totAreal*lagFaktor/20),unit:'rull',waste:0},
        ],
        timer:Math.round(totAreal*getCalcRate('gips_vegg')),
      };
    }
  },

  // ── 9. Gipsplater tak ─────────────────────────────────────
  gips_tak: {
    label:'Gipsplater tak',
    materialOptions:[
      {id:'type',label:'Gipstype',options:['Standard 13 mm','Brannhemmende 15 mm (EI30)','Fuktbestandig 13 mm','Dobbelt lag 2×13 mm']},
    ],
    inputs:[
      {id:'areal',label:'Takareal (m²)',default:20},
    ],
    calc(v,mats){
      const gipsType=mats.type||'Standard 13 mm';
      const erDobbel=gipsType.includes('Dobbelt');
      const lagFaktor=erDobbel?2:1;
      const plater=Math.ceil(v.areal/2.88*lagFaktor*1.1);
      return {
        areal:v.areal+' m²',
        info:gipsType,
        materialer:[
          {name:`Gips ${gipsType}`,qty:plater,unit:'pl',waste:10},
          {name:'Gipsskruer båndet',qty:Math.ceil(v.areal*lagFaktor/18),unit:'pk',waste:0},
          {name:'Sparkelmasse',qty:Math.ceil(v.areal*lagFaktor/30),unit:'spann',waste:5},
          {name:'Papirtape / fibertape',qty:Math.ceil(v.areal*lagFaktor/20),unit:'rull',waste:0},
        ],
        timer:Math.round(v.areal*getCalcRate('gips_tak')),
      };
    }
  },

  // ── 10. Panel/MDF vegger ──────────────────────────────────
  panel_vegg: {
    label:'Panel/MDF vegger',
    materialOptions:[
      {id:'type',label:'Paneltype',options:['Furupanel 14×95','Furupanel 14×121','Gran glattbørstet 12×120','MDF panel 8×142','Sponningspanel 19×148']},
      {id:'retning',label:'Retning',options:['Stående','Liggende']},
    ],
    inputs:[
      {id:'areal',label:'Veggareal (m²)',default:15},
    ],
    calc(v,mats){
      const panelType=mats.type||'Furupanel 14×121';
      const breddemm=panelType.includes('95')?95:panelType.includes('120')?120:panelType.includes('121')?121:panelType.includes('142')?142:148;
      const lmPerM2=1000/breddemm*1.08;
      return {
        areal:v.areal+' m²',
        info:`${panelType} (${mats.retning||'Stående'})`,
        materialer:[
          {name:panelType,qty:Math.ceil(v.areal*lmPerM2),unit:'lm',waste:10},
          {name:'Lekter 23×48',qty:Math.ceil(v.areal/0.6*1.1),unit:'lm',waste:8},
          {name:'Dykkert 40mm',qty:Math.ceil(v.areal/12),unit:'pk',waste:0},
        ],
        timer:Math.round(v.areal*getCalcRate('panel_vegg')),
      };
    }
  },

  // ── 11. Himling ───────────────────────────────────────────
  himling: {
    label:'Himling',
    materialOptions:[
      {id:'type',label:'Himlingstype',options:['Panel 14×95 furu','Panel 14×121 furu','MDF takpanel','Takess/systemhimling','Gips 13 mm']},
    ],
    inputs:[
      {id:'areal',label:'Takareal (m²)',default:20},
    ],
    calc(v,mats){
      const himType=mats.type||'Panel 14×95 furu';
      const erPanel=himType.includes('Panel')||himType.includes('MDF');
      const erTakess=himType.includes('Takess');
      if(erPanel){
        const breddemm=himType.includes('95')?95:himType.includes('121')?121:120;
        const lmPerM2=1000/breddemm*1.08;
        return {
          areal:v.areal+' m²',info:himType,
          materialer:[
            {name:himType,qty:Math.ceil(v.areal*lmPerM2),unit:'lm',waste:10},
            {name:'Lekter 23×48',qty:Math.ceil(v.areal/0.4*1.1),unit:'lm',waste:8},
            {name:'Dykkert 40mm',qty:Math.ceil(v.areal/12),unit:'pk',waste:0},
          ],
          timer:Math.round(v.areal*getCalcRate('himling')),
        };
      }
      if(erTakess){
        return {
          areal:v.areal+' m²',info:himType,
          materialer:[
            {name:'Takessplater 600×600',qty:Math.ceil(v.areal/0.36*1.05),unit:'stk',waste:5},
            {name:'T-profil bæreskinne',qty:Math.ceil(v.areal/0.6*1.1),unit:'lm',waste:8},
            {name:'Pendler/oppheng',qty:Math.ceil(v.areal/0.8),unit:'stk',waste:0},
            {name:'Kantprofil',qty:Math.ceil(Math.sqrt(v.areal)*4*1.1),unit:'lm',waste:10},
          ],
          timer:Math.round(v.areal*getCalcRate('himling')),
        };
      }
      return {
        areal:v.areal+' m²',info:himType,
        materialer:[
          {name:`Gips 13 mm`,qty:Math.ceil(v.areal/2.88*1.1),unit:'pl',waste:10},
          {name:'Gipsskruer båndet',qty:Math.ceil(v.areal/18),unit:'pk',waste:0},
          {name:'Sparkelmasse',qty:Math.ceil(v.areal/30),unit:'spann',waste:5},
        ],
        timer:Math.round(v.areal*getCalcRate('himling')),
      };
    }
  },

  // ── 12. Vindu (innvendig) ─────────────────────────────────
  inn_vindu: {
    label:'Vindu (innvendig)',
    materialOptions:[
      {id:'type',label:'Vindustype',options:['Standard 2-lags','Energi 3-lags','Fastkarm','Toppsvingvindu','Sidehengslet']},
    ],
    inputs:[
      {id:'antall',label:'Antall vinduer',default:1},
      {id:'bredde',label:'Bredde (cm)',default:100},
      {id:'hoyde',label:'Høyde (cm)',default:120},
    ],
    calc(v,mats){
      return {
        areal:v.antall+' vindu(er)',
        info:mats.type||'Standard 2-lags',
        materialer:[
          {name:'Karmskruer 90mm',qty:v.antall,unit:'pk',waste:0},
          {name:'Fugeskum proff',qty:v.antall*2,unit:'stk',waste:0},
          {name:'Tettestripe',qty:v.antall,unit:'stk',waste:0},
        ],
        timer:Math.round(v.antall*getCalcRate('inn_vindu')),
      };
    }
  },

  // ── 13. Innvendige foringer ───────────────────────────────
  inn_foring: {
    label:'Innvendige foringer',
    materialOptions:[
      {id:'type',label:'Foringsmateriale',options:['MDF 12mm grunnet','Furu 15mm','Kryssfiner 12mm','Spon laminert']},
      {id:'dybde',label:'Foringsdybde',options:['50 mm','70 mm','100 mm','120 mm','150 mm']},
    ],
    inputs:[
      {id:'antall',label:'Antall vinduer å fore',default:3},
      {id:'bredde',label:'Snitt bredde vindu (cm)',default:100},
      {id:'hoyde',label:'Snitt høyde vindu (cm)',default:120},
    ],
    calc(v,mats){
      const omfarPrVindu=(v.bredde+v.hoyde*2)/100;
      const totLm=Math.ceil(omfarPrVindu*v.antall*1.1);
      const forType=mats.type||'MDF 12mm grunnet';
      return {
        areal:v.antall+' vindu(er)',
        info:`${forType} • ${mats.dybde||'100 mm'}`,
        materialer:[
          {name:`Foring ${forType}`,qty:totLm,unit:'lm',waste:10},
          {name:'Skruer / lim montasje',qty:Math.ceil(v.antall/3),unit:'pk',waste:0},
          {name:'Fugeskum / tetting',qty:v.antall,unit:'stk',waste:0},
        ],
        timer:Math.round(v.antall*getCalcRate('inn_foring')),
      };
    }
  },

  // ── 14. Listing rundt vinduer ─────────────────────────────
  vindulisting: {
    label:'Listing rundt vinduer',
    materialOptions:[
      {id:'type',label:'Listtype',options:['Glatt MDF 12×58','Profilert furu 12×58','Bred dekorlist 15×70','Glatt MDF 12×45']},
    ],
    inputs:[
      {id:'antall',label:'Antall vinduer',default:3},
      {id:'bredde',label:'Snitt bredde vindu (cm)',default:100},
      {id:'hoyde',label:'Snitt høyde vindu (cm)',default:120},
    ],
    calc(v,mats){
      const lmPrVindu=(v.bredde*2+v.hoyde*2)/100;
      const totLm=Math.ceil(lmPrVindu*v.antall*1.12);
      const listType=mats.type||'Glatt MDF 12×58';
      return {
        areal:totLm+' lm',
        info:listType,
        materialer:[
          {name:listType,qty:totLm,unit:'lm',waste:12},
          {name:'Dykkert 30mm',qty:Math.ceil(v.antall/4),unit:'pk',waste:0},
          {name:'Fugemasse / lim',qty:Math.ceil(v.antall/5)+1,unit:'tube',waste:0},
        ],
        timer:Math.round(totLm*getCalcRate('vindulisting')),
      };
    }
  },

  // ── 15. Vindusbrett ───────────────────────────────────────
  vindusbrett: {
    label:'Vindusbrett',
    materialOptions:[
      {id:'type',label:'Brettmateriale',options:['MDF grunnet 22mm','Furu 22mm','Eik massiv 22mm','Laminert plate','Marmor/kompositt']},
    ],
    inputs:[
      {id:'antall',label:'Antall vindusbrett',default:3},
      {id:'bredde',label:'Snitt bredde brett (cm)',default:20},
      {id:'lengde',label:'Snitt lengde brett (cm)',default:110},
    ],
    calc(v,mats){
      const brettType=mats.type||'MDF grunnet 22mm';
      return {
        areal:v.antall+' stk',
        info:brettType,
        materialer:[
          {name:`Vindusbrett ${brettType}`,qty:v.antall,unit:'stk',waste:5},
          {name:'Fugeskum / lim',qty:Math.ceil(v.antall/3)+1,unit:'stk',waste:0},
          {name:'Vinkelbeslag / konsoll',qty:v.antall*2,unit:'stk',waste:0},
        ],
        timer:Math.round(v.antall*getCalcRate('vindusbrett')),
      };
    }
  },

  // ── 16. Innerdører ────────────────────────────────────────
  innerdor: {
    label:'Innerdører',
    materialOptions:[
      {id:'type',label:'Dørtype',options:['Fyllingsdør hvitmalt','Glatt dør hvitmalt','Speiledør','Glassdør','Dobbeldør']},
      {id:'karm',label:'Karmtype',options:['Standard fôrkarm','Stålkarm','Trekarm massiv']},
      {id:'arbeid',label:'Arbeidsomfang',options:['Komplett inkl. listverk','Montering + karmsetting','Kun montering i åpning']},
    ],
    inputs:[
      {id:'antall',label:'Antall dører',default:1},
    ],
    calc(v,mats){
      const arbeid=mats.arbeid||'Komplett inkl. listverk';
      const harList=arbeid.includes('listverk');
      return {
        areal:v.antall+' dør(er)',
        info:`${mats.type||'Fyllingsdør hvitmalt'} • ${mats.karm||'Standard fôrkarm'}`,
        materialer:[
          {name:'Karmskruer 90mm',qty:v.antall,unit:'pk',waste:0},
          {name:'Fugeskum proff',qty:v.antall,unit:'stk',waste:0},
          ...(harList?[{name:'Gerikter/listverk',qty:v.antall*5,unit:'lm',waste:10}]:[]),
          {name:'Hengsler (3 per dør)',qty:v.antall*3,unit:'stk',waste:0},
          {name:'Dørvrider / håndtak',qty:v.antall,unit:'sett',waste:0},
        ],
        timer:Math.round(v.antall*getCalcRate('innerdor')),
      };
    }
  },

  // ── 17. Skyvedører/pocket ─────────────────────────────────
  skyvedor: {
    label:'Skyvedører/pocket',
    materialOptions:[
      {id:'type',label:'Dørtype',options:['Pocketdør enkelt','Pocketdør dobbelt','Skyvedør på vegg','Skyvedør dobbeltsporet']},
      {id:'materiale',label:'Dørblad',options:['Glatt hvitmalt','Fyllingsdør','Glassdør','Speiledør']},
    ],
    inputs:[
      {id:'antall',label:'Antall dører',default:1},
      {id:'bredde',label:'Lysåpning bredde (cm)',default:90},
    ],
    calc(v,mats){
      const dorType=mats.type||'Pocketdør enkelt';
      const erPocket=dorType.includes('Pocket');
      return {
        areal:v.antall+' dør(er)',
        info:`${dorType} • ${mats.materiale||'Glatt hvitmalt'}`,
        materialer:[
          {name:'Skyveskinne/kassett',qty:v.antall,unit:'sett',waste:0},
          ...(erPocket?[{name:'Pocketkassett (stålramme)',qty:v.antall,unit:'stk',waste:0}]:[]),
          {name:'Hengerullsett',qty:v.antall,unit:'sett',waste:0},
          {name:'Gipstilpasning (foring)',qty:erPocket?v.antall*4:0,unit:'pl',waste:10},
          {name:'Skruer / festemateriell',qty:v.antall,unit:'pk',waste:0},
          {name:'Gerikter/listverk',qty:v.antall*5,unit:'lm',waste:10},
        ],
        timer:Math.round(v.antall*getCalcRate('skyvedor')),
      };
    }
  },

  // ── 18. Parkett ───────────────────────────────────────────
  parkett: {
    label:'Parkett',
    materialOptions:[
      {id:'type',label:'Parketttype',options:['3-stav eik 14mm','1-stav eik 14mm','Bambus 14mm','Ask 14mm','Flersjikts 11mm']},
      {id:'underlag',label:'Underlag',options:['Trinnlydmatte 3mm','Trinnlydmatte + fuktsperre','Eksisterende ok']},
    ],
    inputs:[
      {id:'areal',label:'Areal (m²)',default:20},
    ],
    calc(v,mats){
      const parkettType=mats.type||'3-stav eik 14mm';
      const underlag=mats.underlag||'Trinnlydmatte 3mm';
      const harUnderlag=!underlag.includes('Eksisterende');
      return {
        areal:v.areal+' m²',
        info:parkettType,
        materialer:[
          {name:parkettType,qty:Math.ceil(v.areal*1.08),unit:'m²',waste:8},
          ...(harUnderlag?[{name:underlag,qty:Math.ceil(v.areal*1.05),unit:'m²',waste:5}]:[]),
          {name:'Parkett-/bruksanvisningslim',qty:Math.ceil(v.areal/20),unit:'stk',waste:0},
          {name:'Distansekiler',qty:1,unit:'sett',waste:0},
        ],
        timer:Math.round(v.areal*getCalcRate('parkett')),
      };
    }
  },

  // ── 19. Laminat ───────────────────────────────────────────
  laminat: {
    label:'Laminat',
    materialOptions:[
      {id:'type',label:'Laminattype',options:['Laminat 8mm AC4','Laminat 10mm AC5','Laminat 12mm AC5','Vinyl/SPC 5mm']},
      {id:'underlag',label:'Underlag',options:['Trinnlydmatte 2mm','Trinnlydmatte + fuktsperre','Eksisterende ok']},
    ],
    inputs:[
      {id:'areal',label:'Areal (m²)',default:20},
    ],
    calc(v,mats){
      const lamType=mats.type||'Laminat 8mm AC4';
      const underlag=mats.underlag||'Trinnlydmatte 2mm';
      const harUnderlag=!underlag.includes('Eksisterende');
      return {
        areal:v.areal+' m²',
        info:lamType,
        materialer:[
          {name:lamType,qty:Math.ceil(v.areal*1.1),unit:'m²',waste:10},
          ...(harUnderlag?[{name:underlag,qty:Math.ceil(v.areal*1.05),unit:'m²',waste:5}]:[]),
          {name:'PE-folie fuktsperre',qty:underlag.includes('fuktsperre')?0:Math.ceil(v.areal/25),unit:'rull',waste:5},
          {name:'Distansekiler',qty:1,unit:'sett',waste:0},
        ],
        timer:Math.round(v.areal*getCalcRate('laminat')),
      };
    }
  },

  // ── 20. Heltregulv ────────────────────────────────────────
  heltregulv: {
    label:'Heltregulv',
    materialOptions:[
      {id:'type',label:'Gulvtype',options:['Furu 22×120','Furu 22×145','Eik 22×120','Eik 22×140','Ask 22×120']},
      {id:'montasje',label:'Montasje',options:['Spikret i strøer','Limt på undergulv','Skrudd i strøer']},
    ],
    inputs:[
      {id:'areal',label:'Areal (m²)',default:15},
    ],
    calc(v,mats){
      const gulvType=mats.type||'Furu 22×120';
      const breddemm=gulvType.includes('145')?145:gulvType.includes('140')?140:120;
      const lmPerM2=1000/breddemm*1.08;
      const montasje=mats.montasje||'Spikret i strøer';
      const erStroer=montasje.includes('strøer');
      return {
        areal:v.areal+' m²',
        info:`${gulvType} • ${montasje}`,
        materialer:[
          {name:gulvType,qty:Math.ceil(v.areal*lmPerM2),unit:'lm',waste:10},
          ...(erStroer?[{name:'Strøer 48×48',qty:Math.ceil(v.areal/0.45*1.1),unit:'lm',waste:10}]:[]),
          {name:montasje.includes('Limt')?'Gulvlim elastisk':'Gulvspiker / skruer',qty:Math.ceil(v.areal/10),unit:montasje.includes('Limt')?'tube':'pk',waste:0},
        ],
        timer:Math.round(v.areal*getCalcRate('heltregulv')),
      };
    }
  },

  // ── 21. Trapper ───────────────────────────────────────────
  inn_trapp: {
    label:'Trapper',
    materialOptions:[
      {id:'type',label:'Trappetype',options:['Rettløp','L-trapp m/repos','U-trapp','Svingt trapp','Spiraltrapp']},
      {id:'materiale',label:'Materiale',options:['Furu ubehandlet','Eik','Hvitmalt MDF','Hvitmalt furu','Stål med tretrinn']},
    ],
    inputs:[
      {id:'antallTrinn',label:'Antall trinn',default:14},
      {id:'bredde',label:'Bredde (cm)',default:90},
    ],
    calc(v,mats){
      const trappType=mats.type||'Rettløp';
      const mat=mats.materiale||'Furu ubehandlet';
      return {
        areal:v.antallTrinn+' trinn',
        info:`${trappType} • ${mat}`,
        materialer:[
          {name:`Trinn ${mat}`,qty:v.antallTrinn,unit:'stk',waste:5},
          {name:'Opptrinn',qty:v.antallTrinn,unit:'stk',waste:5},
          {name:'Vange / bæring',qty:2,unit:'stk',waste:0},
          {name:'Håndlist',qty:Math.ceil(v.antallTrinn*0.22),unit:'lm',waste:5},
          {name:'Spindler / balustre',qty:v.antallTrinn*2,unit:'stk',waste:0},
          {name:'Startnegl / endepunkt',qty:2,unit:'stk',waste:0},
          {name:'Skruer / lim montasje',qty:1,unit:'pk',waste:0},
        ],
        timer:Math.round(getCalcRate('inn_trapp')),
      };
    }
  },

  // ── 22. Rehabilitering trapp ──────────────────────────────
  rehab_trapp: {
    label:'Rehabilitering trapp',
    materialOptions:[
      {id:'omfang',label:'Omfang',options:['Nye trinn på eksisterende','Ny håndlist + spindler','Komplett oppussing','Kun sliping + behandling']},
      {id:'overflate',label:'Overflatebehandling',options:['Lakk','Olje','Maling','Beis + lakk']},
    ],
    inputs:[
      {id:'antallTrinn',label:'Antall trinn',default:14},
      {id:'bredde',label:'Bredde (cm)',default:90},
    ],
    calc(v,mats){
      const omfang=mats.omfang||'Nye trinn på eksisterende';
      const overfl=mats.overflate||'Lakk';
      const nyeTrinn=omfang.includes('trinn')||omfang.includes('Komplett');
      const nyRekkverk=omfang.includes('håndlist')||omfang.includes('Komplett');
      return {
        areal:v.antallTrinn+' trinn',
        info:`${omfang} • ${overfl}`,
        materialer:[
          ...(nyeTrinn?[{name:'Nye trinn / pålimt trinntoppplate',qty:v.antallTrinn,unit:'stk',waste:5}]:[]),
          ...(nyRekkverk?[
            {name:'Håndlist',qty:Math.ceil(v.antallTrinn*0.22),unit:'lm',waste:5},
            {name:'Spindler',qty:v.antallTrinn*2,unit:'stk',waste:0},
          ]:[]),
          {name:`${overfl} / behandling`,qty:Math.ceil(v.antallTrinn*0.3),unit:'l',waste:5},
          {name:'Slipepapir / materiell',qty:1,unit:'pk',waste:0},
          {name:'Skruer / lim',qty:1,unit:'pk',waste:0},
        ],
        timer:Math.round(getCalcRate('rehab_trapp')),
      };
    }
  },

  // ── 23. Rekkverk og håndløpere ────────────────────────────
  inn_rekkverk: {
    label:'Rekkverk og håndløpere',
    materialOptions:[
      {id:'type',label:'Type',options:['Tre med spindler','Glass i treskinne','Stålrekkverk','Wire i trestolpe','Kun håndløper (vegg)']},
      {id:'materiale',label:'Materiale',options:['Furu hvitmalt','Eik','Hvitmalt MDF','Stål pulverlakkert']},
    ],
    inputs:[
      {id:'lopemeter',label:'Løpemeter (lm)',default:4},
      {id:'hoyde',label:'Høyde (m)',default:0.9},
    ],
    calc(v,mats){
      const rkType=mats.type||'Tre med spindler';
      const erKunHandl=rkType.includes('Kun');
      const erGlass=rkType.includes('Glass');
      const antStolper=erKunHandl?0:Math.ceil(v.lopemeter/1.2)+1;
      return {
        areal:v.lopemeter+' lm',
        info:rkType,
        materialer:[
          {name:'Håndløper',qty:Math.ceil(v.lopemeter*1.1),unit:'lm',waste:10},
          ...(!erKunHandl?[{name:'Stolper',qty:antStolper,unit:'stk',waste:0}]:[]),
          ...(erGlass?[{name:'Herdet glass 8mm',qty:Math.ceil(v.lopemeter/1.0),unit:'stk',waste:0}]:[]),
          ...(!erKunHandl&&!erGlass?[{name:'Spindler / sprosser',qty:Math.ceil(v.lopemeter/0.12),unit:'stk',waste:5}]:[]),
          {name:'Veggfeste / beslag',qty:erKunHandl?Math.ceil(v.lopemeter/0.8):antStolper,unit:'stk',waste:0},
          {name:'Skruer / bolter',qty:Math.ceil(v.lopemeter/4),unit:'pk',waste:0},
        ],
        timer:Math.round(v.lopemeter*getCalcRate('inn_rekkverk')),
      };
    }
  },

  // ── 24. Kjøkkeninnredning ─────────────────────────────────
  kjokken: {
    label:'Kjøkkeninnredning',
    materialOptions:[
      {id:'type',label:'Kjøkkentype',options:['Standard skap/skuffer','Premium skap/skuffer','IKEA-type flatpakke']},
      {id:'overskap',label:'Overskap',options:['Ja, full lengde','Ja, delvis','Nei']},
    ],
    inputs:[
      {id:'lopemeter',label:'Løpemeter benk (lm)',default:4},
      {id:'hoyskap',label:'Antall høyskap',default:2},
    ],
    calc(v,mats){
      const kjType=mats.type||'Standard skap/skuffer';
      const harOverskap=!(mats.overskap||'').includes('Nei');
      const delvisOverskap=(mats.overskap||'').includes('delvis');
      const overskapLm=harOverskap?(delvisOverskap?v.lopemeter*0.5:v.lopemeter):0;
      return {
        areal:v.lopemeter+' lm benk',
        info:kjType,
        materialer:[
          {name:'Underskap m/skuffer',qty:Math.ceil(v.lopemeter/0.6),unit:'stk',waste:0},
          ...(harOverskap?[{name:'Overskap',qty:Math.ceil(overskapLm/0.6),unit:'stk',waste:0}]:[]),
          {name:'Høyskap',qty:v.hoyskap,unit:'stk',waste:0},
          {name:'Benkeplate',qty:Math.ceil(v.lopemeter*1.05),unit:'lm',waste:5},
          {name:'Fester / veggskinner',qty:Math.ceil(v.lopemeter/1.5)+1,unit:'stk',waste:0},
          {name:'Skruer / beslag',qty:Math.ceil(v.lopemeter/2),unit:'pk',waste:0},
          {name:'Vask + blandebatteri',qty:1,unit:'sett',waste:0},
        ],
        timer:Math.round(v.lopemeter*getCalcRate('kjokken')),
      };
    }
  },

  // ── 25. Benkeplater ───────────────────────────────────────
  benkeplater: {
    label:'Benkeplater',
    materialOptions:[
      {id:'type',label:'Platetype',options:['Laminat 28mm','Laminat 40mm','Massiv eik 40mm','Massiv furu 40mm','Kompositt/kvarts','Corian/Hi-Macs']},
    ],
    inputs:[
      {id:'lopemeter',label:'Løpemeter (lm)',default:3},
      {id:'dybde',label:'Dybde (cm)',default:62},
      {id:'utsparinger',label:'Antall utsparinger (vask/koketopp)',default:1},
    ],
    calc(v,mats){
      const plateType=mats.type||'Laminat 28mm';
      return {
        areal:v.lopemeter+' lm',
        info:plateType,
        materialer:[
          {name:`Benkeplate ${plateType}`,qty:Math.ceil(v.lopemeter*1.05),unit:'lm',waste:5},
          {name:'Skjøtejern / -bolt',qty:Math.max(Math.ceil(v.lopemeter/2)-1,0),unit:'stk',waste:0},
          {name:'Fugemasse / lim',qty:v.utsparinger+1,unit:'tube',waste:0},
          {name:'Benkeplatelim / silikon',qty:Math.ceil(v.lopemeter/3)+1,unit:'tube',waste:0},
        ],
        timer:Math.round(v.lopemeter*getCalcRate('benkeplater')),
      };
    }
  },

  // ── 26. Integrerte hvitevarer ─────────────────────────────
  hvitevarer: {
    label:'Integrerte hvitevarer',
    materialOptions:[
      {id:'type',label:'Hvitevaretype',options:['Integrert oppvaskmaskin','Integrert kjøl/frys','Integrert komfyr/ovn','Integrert mikro','Integrert vifte/ventilator']},
    ],
    inputs:[
      {id:'antall',label:'Antall enheter',default:1},
    ],
    calc(v,mats){
      return {
        areal:v.antall+' enhet(er)',
        info:mats.type||'Integrert oppvaskmaskin',
        materialer:[
          {name:'Tilpasningslister / dekorfront',qty:v.antall,unit:'sett',waste:0},
          {name:'Fester / beslag',qty:v.antall,unit:'sett',waste:0},
          {name:'Vanntilkobling / el (materiell)',qty:v.antall,unit:'sett',waste:0},
        ],
        timer:Math.round(v.antall*getCalcRate('hvitevarer')),
      };
    }
  },

  // ── 27. Garderober/skyvedørsløsninger ─────────────────────
  garderobe: {
    label:'Garderober/skyvedørsløsninger',
    materialOptions:[
      {id:'type',label:'Type',options:['Skyvedørsgarderobe','Innvendig system + slagdører','Walk-in innredning','Åpent hylle-/stangoppheng']},
      {id:'dorer',label:'Skyvedørfront',options:['Speil','Hvit melamin','Glass/speil kombi','Tre/MDF']},
    ],
    inputs:[
      {id:'antall',label:'Antall garderobeskap',default:1},
      {id:'bredde',label:'Bredde per skap (cm)',default:200},
      {id:'hoyde',label:'Høyde (cm)',default:240},
    ],
    calc(v,mats){
      const gType=mats.type||'Skyvedørsgarderobe';
      const erSkyvedor=gType.includes('Skyvedør');
      const antDorer=erSkyvedor?Math.ceil(v.bredde/100)*v.antall:0;
      return {
        areal:v.antall+' skap',
        info:`${gType} ${v.bredde}×${v.hoyde}cm`,
        materialer:[
          ...(erSkyvedor?[
            {name:'Skyvedørskinne topp+bunn',qty:v.antall,unit:'sett',waste:0},
            {name:`Skyvedør ${mats.dorer||'Speil'}`,qty:antDorer,unit:'stk',waste:0},
          ]:[]),
          {name:'Innvendig innredning (hyller/stang)',qty:v.antall,unit:'sett',waste:0},
          {name:'Sidegavler / mellomvegger',qty:v.antall*2+Math.max(v.antall-1,0),unit:'stk',waste:0},
          {name:'Skruer / beslag / fester',qty:v.antall,unit:'pk',waste:0},
        ],
        timer:Math.round(v.antall*getCalcRate('garderobe')),
      };
    }
  },

  // ── 28. Spesialtilpasset innredning ───────────────────────
  spesialinnredning: {
    label:'Spesialtilpasset innredning',
    materialOptions:[
      {id:'type',label:'Innredningstype',options:['Bokhylle/reol','Vegg-til-vegg skap','Sittekasse/benk','Mediamøbel','Vaskerom innredning','Annet tilpasset']},
      {id:'materiale',label:'Materiale',options:['MDF malt','Kryssfiner bjørk','Eik massiv','Furu malt','Melaminplate']},
    ],
    inputs:[
      {id:'antall',label:'Antall enheter',default:1},
      {id:'bredde',label:'Bredde (cm)',default:200},
      {id:'hoyde',label:'Høyde (cm)',default:220},
      {id:'dybde',label:'Dybde (cm)',default:40},
    ],
    calc(v,mats){
      const mat=mats.materiale||'MDF malt';
      const platemM2=(v.bredde*v.hoyde*2+v.bredde*v.dybde*4+v.hoyde*v.dybde*2)/10000;
      const totPlate=Math.ceil(platemM2*v.antall*1.15);
      return {
        areal:v.antall+' enhet(er)',
        info:`${mats.type||'Bokhylle/reol'} • ${mat}`,
        materialer:[
          {name:`Platemateriell ${mat}`,qty:totPlate,unit:'m²',waste:15},
          {name:'Lister / kantband',qty:Math.ceil((v.bredde+v.hoyde)*2*v.antall/100*1.1),unit:'lm',waste:10},
          {name:'Hyller / innredning',qty:Math.ceil(v.hoyde/30)*v.antall,unit:'stk',waste:0},
          {name:'Skruer / lim / beslag',qty:v.antall,unit:'pk',waste:0},
          {name:'Hengsler / glidere',qty:v.antall*4,unit:'stk',waste:0},
        ],
        timer:Math.round(v.antall*getCalcRate('spesialinnredning')),
      };
    }
  },

  // ── 29. Våtromsplater ─────────────────────────────────────
  vatromsplater: {
    label:'Våtromsplater',
    materialOptions:[
      {id:'type',label:'Platetype',options:['Fibersemet våtromsplate 12mm','XPS våtromsplate 6mm','Wedi byggeplate 20mm','Fermacell våtrom 12,5mm']},
    ],
    inputs:[
      {id:'areal',label:'Areal vegger (m²)',default:15},
      {id:'gulvareal',label:'Areal gulv (m²)',default:5},
    ],
    calc(v,mats){
      const plateType=mats.type||'Fibersemet våtromsplate 12mm';
      const totAreal=v.areal+v.gulvareal;
      return {
        areal:totAreal+' m² (vegg+gulv)',
        info:plateType,
        materialer:[
          {name:plateType,qty:Math.ceil(totAreal/2.88*1.1),unit:'pl',waste:10},
          {name:'Skruer våtrom (korrosjonsfri)',qty:Math.ceil(totAreal/15),unit:'pk',waste:0},
          {name:'Våtromsmembran / flytende',qty:Math.ceil(totAreal/5),unit:'l',waste:5},
          {name:'Fugetape membranband',qty:Math.ceil(totAreal/8),unit:'lm',waste:5},
          {name:'Slukmansjett',qty:1,unit:'stk',waste:0},
        ],
        timer:Math.round(totAreal*getCalcRate('vatromsplater')),
      };
    }
  },

  // ── 30. Innkassing rør/sisterner ──────────────────────────
  innkassing: {
    label:'Innkassing rør/sisterner',
    materialOptions:[
      {id:'type',label:'Kassemateriale',options:['Gips standard 13mm','Gips fuktbestandig 13mm','Våtromsplate','MDF/spon']},
    ],
    inputs:[
      {id:'lopemeter',label:'Løpemeter kasse (lm)',default:4},
      {id:'bredde',label:'Kassebredde (cm)',default:30},
      {id:'dybde',label:'Kassedybde (cm)',default:20},
    ],
    calc(v,mats){
      const kasseType=mats.type||'Gips standard 13mm';
      const platearealM2=(v.bredde+v.dybde)*2/100*v.lopemeter;
      return {
        areal:v.lopemeter+' lm',
        info:`${kasseType} ${v.bredde}×${v.dybde}cm`,
        materialer:[
          {name:`Plate ${kasseType}`,qty:Math.ceil(platearealM2/2.88*1.15),unit:'pl',waste:15},
          {name:'Stendere/lekter 36×48',qty:Math.ceil(v.lopemeter*4*1.1),unit:'lm',waste:10},
          {name:'Skruer montasje',qty:Math.ceil(v.lopemeter/5),unit:'pk',waste:0},
          {name:'Inspeksjonsluke',qty:Math.ceil(v.lopemeter/3),unit:'stk',waste:0},
        ],
        timer:Math.round(v.lopemeter*getCalcRate('innkassing')),
      };
    }
  },

  // ── 31. Kasser, nisjer, innredningsløsninger ──────────────
  kasser_nisjer: {
    label:'Kasser, nisjer, innredn.løsn.',
    materialOptions:[
      {id:'type',label:'Type',options:['Vegg-nisje (innfelt)','Hyllenisje','Sittekasse/benk','Forhøyning','Dekorveggelement']},
      {id:'materiale',label:'Materiale',options:['Gips + sparkling','MDF malt','Kryssfiner','Våtromsplate']},
    ],
    inputs:[
      {id:'antall',label:'Antall enheter',default:1},
      {id:'bredde',label:'Bredde (cm)',default:60},
      {id:'hoyde',label:'Høyde (cm)',default:80},
      {id:'dybde',label:'Dybde (cm)',default:15},
    ],
    calc(v,mats){
      const mat=mats.materiale||'Gips + sparkling';
      const platemM2=(v.bredde*v.hoyde*2+v.bredde*v.dybde*2+v.hoyde*v.dybde*2)/10000;
      return {
        areal:v.antall+' enhet(er)',
        info:`${mats.type||'Vegg-nisje'} • ${mat}`,
        materialer:[
          {name:`Plater ${mat}`,qty:Math.ceil(platemM2*v.antall/2.88*1.15),unit:'pl',waste:15},
          {name:'Stendere/lekt ramme',qty:Math.ceil((v.bredde+v.hoyde)*2*v.antall/100*1.1),unit:'lm',waste:10},
          {name:'Skruer / lim',qty:v.antall,unit:'pk',waste:0},
          {name:'Sparkel / overflatebehandling',qty:Math.ceil(v.antall/2)+1,unit:'spann',waste:0},
        ],
        timer:Math.round(v.antall*getCalcRate('kasser_nisjer')),
      };
    }
  },

  // ── 32. Baderomsinnredning ────────────────────────────────
  badeinnredning: {
    label:'Baderomsinnredning',
    materialOptions:[
      {id:'type',label:'Innredningstype',options:['Servant + underskap','Dobbelservant','Servant på plate','Speilskap med lys','Høyskap bad']},
    ],
    inputs:[
      {id:'antall',label:'Antall enheter',default:1},
    ],
    calc(v,mats){
      const innrType=mats.type||'Servant + underskap';
      return {
        areal:v.antall+' enhet(er)',
        info:innrType,
        materialer:[
          {name:'Feste / veggskinner',qty:v.antall,unit:'sett',waste:0},
          {name:'Silikon sanitær',qty:v.antall,unit:'tube',waste:0},
          {name:'Avløpskoblinger',qty:v.antall,unit:'sett',waste:0},
          {name:'Vannkoblinger / slange',qty:v.antall*2,unit:'stk',waste:0},
          {name:'Skruer korrosjonsfri',qty:v.antall,unit:'pk',waste:0},
        ],
        timer:Math.round(v.antall*getCalcRate('badeinnredning')),
      };
    }
  },

  // ── 33. Gulvlister ────────────────────────────────────────
  gulvlister: {
    label:'Gulvlister',
    materialOptions:[
      {id:'type',label:'Listtype',options:['MDF fotlist 12×56','MDF fotlist 15×70','Furu fotlist 12×56','Høy fotlist 19×90','Flex/vinyl fotlist']},
    ],
    inputs:[
      {id:'lopemeter',label:'Løpemeter (lm)',default:25},
    ],
    calc(v,mats){
      const listType=mats.type||'MDF fotlist 12×56';
      return {
        areal:v.lopemeter+' lm',
        info:listType,
        materialer:[
          {name:listType,qty:Math.ceil(v.lopemeter*1.1),unit:'lm',waste:10},
          {name:'Dykkert 30mm',qty:Math.ceil(v.lopemeter/25),unit:'pk',waste:0},
          {name:'Fugemasse / lim',qty:Math.ceil(v.lopemeter/20),unit:'tube',waste:0},
          {name:'Hjørneklosser/endestopp',qty:Math.ceil(v.lopemeter/3),unit:'stk',waste:5},
        ],
        timer:Math.round(v.lopemeter*getCalcRate('gulvlister')),
      };
    }
  },

  // ── 34. Taklister ─────────────────────────────────────────
  taklister: {
    label:'Taklister',
    materialOptions:[
      {id:'type',label:'Listtype',options:['MDF taklist 21×40','MDF taklist 30×30','Furu profilert 21×45','Bred dekorlist 40×60','Stuckatur/gips profilert']},
    ],
    inputs:[
      {id:'lopemeter',label:'Løpemeter (lm)',default:20},
    ],
    calc(v,mats){
      const listType=mats.type||'MDF taklist 21×40';
      return {
        areal:v.lopemeter+' lm',
        info:listType,
        materialer:[
          {name:listType,qty:Math.ceil(v.lopemeter*1.1),unit:'lm',waste:10},
          {name:'Dykkert 40mm',qty:Math.ceil(v.lopemeter/25),unit:'pk',waste:0},
          {name:'Fugemasse / lim',qty:Math.ceil(v.lopemeter/15),unit:'tube',waste:0},
        ],
        timer:Math.round(v.lopemeter*getCalcRate('taklister')),
      };
    }
  },

  // ── 35. Gerikter dører/vinduer ────────────────────────────
  gerikter: {
    label:'Gerikter dører/vinduer',
    materialOptions:[
      {id:'type',label:'Gerikttype',options:['Glatt MDF 12×58','Profilert furu 12×58','Bred gerikt 15×70','Glatt MDF 12×45','Symmetrisk 12×58']},
    ],
    inputs:[
      {id:'antallDorer',label:'Antall dører',default:4},
      {id:'antallVinduer',label:'Antall vinduer',default:2},
    ],
    calc(v,mats){
      const geriktType=mats.type||'Glatt MDF 12×58';
      const lmDor=v.antallDorer*5;
      const lmVindu=v.antallVinduer*4.4;
      const totLm=Math.ceil((lmDor+lmVindu)*1.1);
      return {
        areal:totLm+' lm',
        info:`${geriktType} • ${v.antallDorer}d + ${v.antallVinduer}v`,
        materialer:[
          {name:geriktType,qty:totLm,unit:'lm',waste:10},
          {name:'Dykkert 30mm',qty:Math.ceil(totLm/30),unit:'pk',waste:0},
          {name:'Fugemasse / lim',qty:Math.ceil((v.antallDorer+v.antallVinduer)/4),unit:'tube',waste:0},
        ],
        timer:Math.round(totLm*getCalcRate('gerikter')),
      };
    }
  },

  // ── 36. Hjørne-/overgangslister ───────────────────────────
  hjornelister: {
    label:'Hjørne-/overgangslister',
    materialOptions:[
      {id:'type',label:'Listtype',options:['Hjørnelist 21×21 MDF','Hjørnelist 28×28 furu','Overgangslist alu','T-list/overgang gulv','Skjøtelist flat']},
    ],
    inputs:[
      {id:'lopemeter',label:'Løpemeter (lm)',default:10},
    ],
    calc(v,mats){
      const listType=mats.type||'Hjørnelist 21×21 MDF';
      return {
        areal:v.lopemeter+' lm',
        info:listType,
        materialer:[
          {name:listType,qty:Math.ceil(v.lopemeter*1.08),unit:'lm',waste:8},
          {name:'Stifter / dykkert / lim',qty:Math.ceil(v.lopemeter/25),unit:'pk',waste:0},
        ],
        timer:Math.round(v.lopemeter*getCalcRate('hjornelister')),
      };
    }
  },
};

// ── EKSPORTER TIL GLOBALT SCOPE ──────────────────────────────

window.productionRates = productionRates;
window.jobCategories = jobCategories;
window.accessFactors = accessFactors;
window.heightFactors = heightFactors;
window.complexityFactors = complexityFactors;
window.difficultyFactors = difficultyFactors;
window.calcDefaults = calcDefaults;
window.calcDefs = calcDefs;
