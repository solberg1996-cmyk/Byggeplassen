// ============================================================
// productionData.js — Ren data for kalkylemotoren
// ============================================================
// Inneholder:
//   - rateSettingsGroups (UI-konfig for laborData-rater)
//   - adjustmentFactors (additive justeringsfaktorer)
//   - laborData (grunntider per arbeidskomponent)
//
// Ingen logikk. Lastes før recipes.js og calcEngine.js.
// ============================================================

// Grupperte erfaringstimer-kategorier for innstillingspanelet
const rateSettingsGroups = [
  {label:'Grunn og fundament', keys:['grunnarbeid_betong','grunnarbeid_armering','grunnarbeid_forskal','grunnarbeid_graving']},
  {label:'Konstruksjon', keys:['bindingsverk','reisverk_innervegg','bjelkelag','svill','svillemembran','limtre','spikerslag','kubbing','opening_i_bindingsverk','taksperrer_48x148','takstoler']},
  {label:'Membran og tetting', keys:['vindsperre','vindsperre_tape','vindsperre_trefiberplate','dampsperre','dampsperre_tape','dyttemasse','dyttestrimmel','fugemasse','bunnfyllingslist']},
  {label:'Isolasjon', keys:['isolasjon_50mm','isolasjon_generell','isolasjon_150mm','isolasjon_200mm','isolasjon_250mm','isolasjon_etasjeskiller','tillegg_mineralull']},
  {label:'Kledning utvendig', keys:['kledning_dobbelfals_liggende','kledning_staende','tommermannskledning','skyggepanel','kledning_gesims']},
  {label:'Kledning innvendig', keys:['kledning_innvendig_vegg','gips_vegg','gips_himling','gips_sparkling']},
  {label:'Lekting og sløyfer', keys:['sloyfer','lekter_tak','lekter_himling','utlekting_innvendig_48mm','krysslekter','sloyfer_tak']},
  {label:'Tak', keys:['takstein','takplate','takshingel','undertak_duk','undertak_asfalt','monepanner','vindskibord','forkantbord','takrenne','nedlopsror','snofanger','taktekking_enkel']},
  {label:'Terrasse og uteplass', keys:['terrassebord','terrassebord_bredere','dragere','bjelkesko','kantsarg','stolpesko','stolpesko_stk']},
  {label:'Rekkverk og gjerde', keys:['rekkverksstolper','handloper','rekkverksbord','rekkverksspiler','rekkverksspiler_stk','gjerdepaler','gjerde_bord_stk','kledning_liggende_gjerde','kledning_staende_gjerde']},
  {label:'Vinduer', keys:['montering_vindu','montering_vindu_tillegg','utforing','karmlist','vindu_tetting','takvindu','utvendig_tekking_takvindu']},
  {label:'Dører', keys:['ytterdor','innerdor','innerdor_brann','dorkarm','dorterskel','utforing_dor','innerdor_hengsler','innerdor_vrider']},
  {label:'Trapp', keys:['montering_trappetrinn','montering_stusstrinn','montering_trappevange','montering_trappeseksjon','montering_trapperepos','trappefornying_rette_trinn','trappefornying_buet_trinn','loftstrapp','rehab_trapp_overflate']},
  {label:'Kjøkken og innredning', keys:['underskap','overskap','hoyskap','skuffeseksjon','oppvaskbenk','benkeplate_montering','dekkside','foring_innredning','garderobeskap','hvitevare_montering','spesialinnredning_montering']},
  {label:'Gulv', keys:['parkett','laminat','heltregulv','fiskebensgulv','parkettunderlag','undergulv_spon','trinnlydsplater','gulvavretting_masse','gulvavretting_stroer']},
  {label:'Himling', keys:['gips_himling','himlingspanel','mdf_panel_himling','lekter_himling','himling_takess','himling_pendel']},
  {label:'Listverk', keys:['gulvlist','taklist','karmlist','feielist','utvendig_omramming','utvendig_omramming_vindu_dor','utforing','hjornelist']},
  {label:'Beslag', keys:['bordtakbeslag','fotplate','overgangsbeslag','vannbrett','vinkel_beslag','vinkel_beslag_stk','vindskibeslag','vindusbeslag']},
  {label:'Våtrom', keys:['vatromsplater_vegg','underpanel_vatrom','smoremembran_gulv','smoremembran_vegg','sveisemembran']},
  {label:'Levegg og pergola', keys:['levegg_stolpe','levegg_kledning','levegg_glass','levegg_rigle','stolper_pergola','baerebjelke_pergola','tak_pergola','pergola_sperre']},
  {label:'Diverse', keys:['garasjeport','bod_dor','skyvedor_montering','skyvedor_pocket','garderobe_skyvedor','innkassing','innkassing_reisverk','kasse_nisje','badeinnredning_montering','stillas_montering','stillas_demontering']},
];

// ── JUSTERINGSFAKTORER (additivt påslag) ────────────────────
// Ny modell: adjustedHours = baseHours × (1 + tilkomst + hoyde + kompleksitet)

const adjustmentFactors = {
  tilkomst: {
    god:       { pct: -0.10, label: 'God tilkomst' },
    normal:    { pct: 0,     label: 'Normal tilkomst' },
    vanskelig: { pct: 0.15,  label: 'Vanskelig tilkomst' },
    svart:     { pct: 0.30,  label: 'Svært vanskelig' },
  },
  hoyde: {
    bakke:   { pct: 0,    label: 'Bakkenivå' },
    lav:     { pct: 0.05, label: 'Lav høyde (< 3m)' },
    middels: { pct: 0.15, label: 'Middels høyde (3-6m)' },
    hoy:     { pct: 0.30, label: 'Stor høyde (> 6m)' },
  },
  kompleksitet: {
    enkel:    { pct: -0.10, label: 'Enkel — rette flater' },
    normal:   { pct: 0,     label: 'Normal' },
    kompleks: { pct: 0.15,  label: 'Kompleks — mange detaljer' },
    ekstremt: { pct: 0.30,  label: 'Ekstremt — spesialtilpasning' },
  },
};


// ── ARBEIDSTIDSDATA PER MATERIALE/OPERASJON ─────────────────
// Sentral oppslagstabell: grunntid (timer per enhet) per materialtype.
// Svenn-grunntider brukes som basis der tilgjengelig.
// Rate-prioritet: line.laborRate → state.laborRates[id] → laborData[id].rate → 0

const laborData = {

  // ── Beslag (Svenn) ────────────────────────────────────────
  bordtakbeslag:    { rate: 0.045, unit: 't/lm', label: 'Bordtakbeslag', category: 'beslag', source: 'svenn', confidence: 'medium' },
  fotplate:         { rate: 0.051, unit: 't/lm', label: 'Fotplate', category: 'beslag', source: 'svenn', confidence: 'medium' },
  overgangsbeslag:  { rate: 0.052, unit: 't/lm', label: 'Overgangsbeslag', category: 'beslag', source: 'svenn', confidence: 'medium' },
  vannbrett:        { rate: 0.104, unit: 't/lm', label: 'Vannbrett', category: 'beslag', source: 'svenn', confidence: 'high' },
  vinkel_beslag:    { rate: 0.055, unit: 't/lm', label: 'Vinkelbeslag', category: 'beslag', source: 'svenn', confidence: 'medium' },
  vindskibeslag:    { rate: 0.052, unit: 't/lm', label: 'Vindskibeslag', category: 'beslag', source: 'svenn', confidence: 'high' },
  vindusbeslag:     { rate: 0.052, unit: 't/lm', label: 'Vindusbeslag', category: 'beslag', source: 'svenn', confidence: 'high' },

  // ── Dør (Svenn) ───────────────────────────────────────────
  dorkarm:          { rate: 0.016, unit: 't/stk', label: 'Dørkarm', category: 'dor', source: 'svenn', confidence: 'medium' },
  dorterskel:       { rate: 0.067, unit: 't/stk', label: 'Dørterskel', category: 'dor', source: 'svenn', confidence: 'medium' },
  innerdor:         { rate: 0.239, unit: 't/stk', label: 'Innerdør', category: 'dor', source: 'svenn', confidence: 'high' },
  innerdor_brann:   { rate: 0.425, unit: 't/stk', label: 'Innerdør brann', category: 'dor', source: 'svenn', confidence: 'high' },
  ytterdor:         { rate: 0.397, unit: 't/stk', label: 'Ytterdør', category: 'dor', source: 'svenn', confidence: 'high' },

  // ── Gulv (Svenn) ──────────────────────────────────────────
  fiskebensgulv:    { rate: 0.156, unit: 't/m²', label: 'Fiskebensgulv', category: 'gulv', source: 'svenn', confidence: 'high' },
  heltregulv:       { rate: 0.203, unit: 't/m²', label: 'Heltregulv', category: 'gulv', source: 'svenn', confidence: 'high' },
  laminat:          { rate: 0.126, unit: 't/m²', label: 'Laminat', category: 'gulv', source: 'svenn', confidence: 'high' },
  parkett:          { rate: 0.126, unit: 't/m²', label: 'Parkett', category: 'gulv', source: 'svenn', confidence: 'high' },
  parkettunderlag:  { rate: 0.015, unit: 't/m²', label: 'Parkettunderlag', category: 'gulv', source: 'svenn', confidence: 'medium' },
  tildekking:       { rate: 0.015, unit: 't/m²', label: 'Tildekking', category: 'gulv', source: 'svenn', confidence: 'medium' },
  trinnlydsplater:  { rate: 0.024, unit: 't/m²', label: 'Trinnlydsplater', category: 'gulv', source: 'svenn', confidence: 'medium' },
  ujevnt_underlag_tillegg: { rate: 0.5, unit: 't/m²', label: 'Tillegg ujevnt underlag', category: 'gulv', source: 'svenn', confidence: 'medium' },
  undergulv_spon:   { rate: 0.066, unit: 't/m²', label: 'Undergulv sponplate', category: 'gulv', source: 'svenn', confidence: 'high' },

  // ── Himling (Svenn) ───────────────────────────────────────
  gips_himling:     { rate: 0.642, unit: 't/m²', label: 'Gips himling', category: 'himling', source: 'svenn', confidence: 'high' },
  himlingspanel:    { rate: 0.155, unit: 't/m²', label: 'Himlingspanel', category: 'himling', source: 'svenn', confidence: 'high' },
  lekter_himling:   { rate: 0.084, unit: 't/lm', label: 'Lekter himling', category: 'himling', source: 'svenn', confidence: 'high' },
  mdf_panel_himling:{ rate: 0.155, unit: 't/m²', label: 'MDF panel himling', category: 'himling', source: 'svenn', confidence: 'high' },
  tillegg_montering_plater_himling: { rate: 0.017, unit: 't/m²', label: 'Tillegg plater i himling', category: 'himling', source: 'svenn', confidence: 'medium' },
  tillegg_panel_himling: { rate: 0.014, unit: 't/m²', label: 'Tillegg panel i himling', category: 'himling', source: 'svenn', confidence: 'medium' },

  // ── Isolasjon (Svenn) ─────────────────────────────────────
  isolasjon_50mm:   { rate: 0.068, unit: 't/m²', label: 'Isolasjon 50 mm', category: 'isolasjon', source: 'svenn', confidence: 'high' },
  isolasjon_150mm:  { rate: 0.048, unit: 't/m²', label: 'Isolasjon 150 mm', category: 'isolasjon', source: 'svenn', confidence: 'high' },
  isolasjon_200mm:  { rate: 0.038, unit: 't/m²', label: 'Isolasjon 200 mm', category: 'isolasjon', source: 'svenn', confidence: 'high' },
  isolasjon_etasjeskiller: { rate: 0.038, unit: 't/m²', label: 'Isolasjon etasjeskiller', category: 'isolasjon', source: 'svenn', confidence: 'medium' },
  isolasjon_generell: { rate: 0.058, unit: 't/m²', label: 'Isolasjon generell', category: 'isolasjon', source: 'svenn', confidence: 'medium' },
  tillegg_mineralull: { rate: 0.01, unit: 't/m²', label: 'Tillegg mineralull', category: 'isolasjon', source: 'svenn', confidence: 'medium' },

  // ── Kjøkken (Svenn) ───────────────────────────────────────
  benkeplate_montering: { rate: 0.21, unit: 't/lm', label: 'Benkeplate montering', category: 'kjokken', source: 'svenn', confidence: 'high' },
  dekkside:         { rate: 0.21, unit: 't/stk', label: 'Dekkside', category: 'kjokken', source: 'svenn', confidence: 'medium' },
  foring_innredning:{ rate: 0.082, unit: 't/lm', label: 'Foring innredning', category: 'kjokken', source: 'svenn', confidence: 'medium' },
  hoyskap:          { rate: 0.849, unit: 't/stk', label: 'Høyskap', category: 'kjokken', source: 'svenn', confidence: 'high' },
  hoyskap_storre:   { rate: 0.98, unit: 't/stk', label: 'Høyskap større', category: 'kjokken', source: 'svenn', confidence: 'medium' },
  lys_gesimslister: { rate: 0.23, unit: 't/lm', label: 'Lys- og gesimslister', category: 'kjokken', source: 'svenn', confidence: 'medium' },
  oppvaskbenk:      { rate: 1.467, unit: 't/stk', label: 'Oppvaskbenk', category: 'kjokken', source: 'svenn', confidence: 'high' },
  overskap:         { rate: 0.424, unit: 't/stk', label: 'Overskap', category: 'kjokken', source: 'svenn', confidence: 'high' },
  overskap_storre:  { rate: 0.576, unit: 't/stk', label: 'Overskap større', category: 'kjokken', source: 'svenn', confidence: 'medium' },
  skuffeseksjon:    { rate: 0.837, unit: 't/stk', label: 'Skuffeseksjon', category: 'kjokken', source: 'svenn', confidence: 'high' },
  underskap:        { rate: 0.637, unit: 't/stk', label: 'Underskap', category: 'kjokken', source: 'svenn', confidence: 'high' },

  // ── Kledning (Svenn) ──────────────────────────────────────
  kledning_dobbelfals_liggende: { rate: 0.109, unit: 't/m²', label: 'Kledning dobbelfals liggende', category: 'kledning', source: 'svenn', confidence: 'high' },
  kledning_gesims:  { rate: 1.012, unit: 't/m²', label: 'Kledning gesims', category: 'kledning', source: 'svenn', confidence: 'high' },
  kledning_innvendig_vegg: { rate: 0.064, unit: 't/m²', label: 'Kledning innvendig vegg', category: 'kledning', source: 'svenn', confidence: 'medium' },
  kledning_liggende_gjerde: { rate: 0.21, unit: 't/lm', label: 'Liggende kledning gjerde', category: 'kledning', source: 'svenn', confidence: 'medium' },
  kledning_staende: { rate: 0.2, unit: 't/m²', label: 'Stående kledning', category: 'kledning', source: 'svenn', confidence: 'high' },
  kledning_staende_gjerde: { rate: 0.42, unit: 't/lm', label: 'Stående kledning gjerde', category: 'kledning', source: 'svenn', confidence: 'medium' },
  skyggepanel:      { rate: 0.182, unit: 't/m²', label: 'Skyggepanel', category: 'kledning', source: 'svenn', confidence: 'high' },
  tommermannskledning: { rate: 0.215, unit: 't/m²', label: 'Tømmermannskledning', category: 'kledning', source: 'svenn', confidence: 'high' },

  // ── Konstruksjon (Svenn) ──────────────────────────────────
  bjelkelag:        { rate: 0.088, unit: 't/m²', label: 'Bjelkelag', category: 'konstruksjon', source: 'svenn', confidence: 'high' },
  bjelkelag_gulv:   { rate: 0.088, unit: 't/lm', label: 'Bjelkelag gulv', category: 'konstruksjon', source: 'svenn', confidence: 'medium' },
  bjelkelag_terrasse: { rate: 0.088, unit: 't/m²', label: 'Bjelkelag terrasse', category: 'konstruksjon', source: 'svenn', confidence: 'high' },
  bjelker_loft:     { rate: 0.063, unit: 't/m²', label: 'Bjelker loft', category: 'konstruksjon', source: 'svenn', confidence: 'medium' },
  bindingsverk:     { rate: 0.039, unit: 't/m²', label: 'Bindingsverk', category: 'konstruksjon', source: 'svenn', confidence: 'medium' },
  bindingsverk_komplett: { rate: 0.242, unit: 't/m²', label: 'Bindingsverk komplett', category: 'konstruksjon', source: 'svenn', confidence: 'medium' },
  ekstra_toppsvill: { rate: 0.021, unit: 't/m²', label: 'Ekstra toppsvill', category: 'konstruksjon', source: 'svenn', confidence: 'medium' },
  kubbing:          { rate: 0.028, unit: 't/lm', label: 'Kubbing', category: 'konstruksjon', source: 'svenn', confidence: 'medium' },
  kubbing_loft:     { rate: 0.12, unit: 't/stk', label: 'Kubbing loft', category: 'konstruksjon', source: 'svenn', confidence: 'medium' },
  kubbing_terrasse: { rate: 0.044, unit: 't/stk', label: 'Kubbing terrasse', category: 'konstruksjon', source: 'svenn', confidence: 'medium' },
  limtre:           { rate: 0.455, unit: 't/lm', label: 'Limtre', category: 'konstruksjon', source: 'svenn', confidence: 'high' },
  opening_i_bindingsverk: { rate: 0.45, unit: 't/stk', label: 'Åpning i bindingsverk', category: 'konstruksjon', source: 'svenn', confidence: 'high' },
  reisverk_innervegg: { rate: 0.284, unit: 't/m²', label: 'Reisverk innervegg', category: 'konstruksjon', source: 'svenn', confidence: 'medium' },
  skrastag:         { rate: 0.17, unit: 't/lm', label: 'Skråstag', category: 'konstruksjon', source: 'svenn', confidence: 'medium' },
  spikerslag:       { rate: 0.03, unit: 't/lm', label: 'Spikerslag', category: 'konstruksjon', source: 'svenn', confidence: 'high' },
  spikerslag_rekkverk: { rate: 0.034, unit: 't/lm', label: 'Spikerslag rekkverk', category: 'konstruksjon', source: 'svenn', confidence: 'medium' },
  svill:            { rate: 0.055, unit: 't/lm', label: 'Svill', category: 'konstruksjon', source: 'svenn', confidence: 'high' },
  svillemembran:    { rate: 0.056, unit: 't/lm', label: 'Svillemembran', category: 'konstruksjon', source: 'svenn', confidence: 'high' },
  taksperrer_48x148:{ rate: 0.13, unit: 't/m²', label: 'Taksperrer 48×148', category: 'konstruksjon', source: 'svenn', confidence: 'high' },
  taksperrer_48x300:{ rate: 0.13, unit: 't/m²', label: 'Taksperrer 48×300', category: 'konstruksjon', source: 'svenn', confidence: 'high' },
  takstoler:        { rate: 0.222, unit: 't/lm', label: 'Takstoler', category: 'konstruksjon', source: 'svenn', confidence: 'high' },
  takstoler_23_3m:  { rate: 0.29, unit: 't/lm', label: 'Takstoler 2,3–3 m', category: 'konstruksjon', source: 'svenn', confidence: 'medium' },

  // ── Listverk (Svenn) ──────────────────────────────────────
  feielist:         { rate: 0.037, unit: 't/lm', label: 'Feielist', category: 'listverk', source: 'svenn', confidence: 'medium' },
  gulvlist:         { rate: 0.052, unit: 't/lm', label: 'Gulvlist', category: 'listverk', source: 'svenn', confidence: 'high' },
  karmlist:         { rate: 0.041, unit: 't/lm', label: 'Karmlist', category: 'listverk', source: 'svenn', confidence: 'high' },
  taklist:          { rate: 0.066, unit: 't/lm', label: 'Taklist', category: 'listverk', source: 'svenn', confidence: 'high' },
  utvendig_omramming: { rate: 0.04, unit: 't/lm', label: 'Utvendig omramming', category: 'listverk', source: 'svenn', confidence: 'high' },
  utvendig_omramming_vindu_dor: { rate: 0.176, unit: 't/lm', label: 'Utvendig omramming vindu/dør', category: 'listverk', source: 'svenn', confidence: 'medium' },
  utvendig_foring:  { rate: 0, unit: 't/lm', label: 'Utvendig foring', category: 'listverk', source: 'svenn', confidence: 'medium' },
  utforing:         { rate: 0.041, unit: 't/lm', label: 'Utforing', category: 'listverk', source: 'svenn', confidence: 'high' },
  utforing_dor:     { rate: 0.035, unit: 't/lm', label: 'Utforing dør', category: 'listverk', source: 'svenn', confidence: 'medium' },

  // ── Membran (Svenn) ───────────────────────────────────────
  bunnfyllingslist: { rate: 0.012, unit: 't/lm', label: 'Bunnfyllingslist', category: 'membran', source: 'svenn', confidence: 'high' },
  brannfuge:        { rate: 0.03, unit: 't/lm', label: 'Brannfuge', category: 'membran', source: 'svenn', confidence: 'medium' },
  dampsperre:       { rate: 0.021, unit: 't/m²', label: 'Dampsperre', category: 'membran', source: 'svenn', confidence: 'high' },
  dampsperre_tape:  { rate: 0.012, unit: 't/lm', label: 'Dampsperre tape', category: 'membran', source: 'svenn', confidence: 'high' },
  dyttemasse:       { rate: 0.045, unit: 't/lm', label: 'Dyttemasse', category: 'membran', source: 'svenn', confidence: 'high' },
  dyttestrimmel:    { rate: 0.045, unit: 't/lm', label: 'Dyttestrimmel', category: 'membran', source: 'svenn', confidence: 'high' },
  fugemasse:        { rate: 0.03, unit: 't/lm', label: 'Fugemasse', category: 'membran', source: 'svenn', confidence: 'high' },
  fuktsperre_tak:   { rate: 0.019, unit: 't/m²', label: 'Fuktsperre tak', category: 'membran', source: 'svenn', confidence: 'medium' },
  smoremembran_gulv:{ rate: 0.82, unit: 't/m²', label: 'Smøremembran gulv', category: 'membran', source: 'svenn', confidence: 'high' },
  smoremembran_vegg:{ rate: 0.67, unit: 't/m²', label: 'Smøremembran vegg', category: 'membran', source: 'svenn', confidence: 'high' },
  sveisemembran:    { rate: 1.5, unit: 't/m²', label: 'Sveisemembran', category: 'membran', source: 'svenn', confidence: 'high' },
  underlagsduk:     { rate: 0.019, unit: 't/m²', label: 'Underlagsduk', category: 'membran', source: 'svenn', confidence: 'medium' },
  vindsperre:       { rate: 0.21, unit: 't/lm', label: 'Vindsperre', category: 'membran', source: 'svenn', confidence: 'medium' },
  vindsperre_tape:  { rate: 0.012, unit: 't/lm', label: 'Vindsperre tape', category: 'membran', source: 'svenn', confidence: 'high' },
  vindsperre_trefiberplate: { rate: 0.08, unit: 't/m²', label: 'Vindsperre trefiberplate', category: 'membran', source: 'svenn', confidence: 'high' },
  vindtettingstape_trefiberplate: { rate: 0.012, unit: 't/lm', label: 'Vindtettingstape trefiberplate', category: 'membran', source: 'svenn', confidence: 'medium' },

  // ── Rekkverk (Svenn) ──────────────────────────────────────
  handloper:        { rate: 0.18, unit: 't/lm', label: 'Håndløper', category: 'rekkverk', source: 'svenn', confidence: 'high' },
  rekkverksbord:    { rate: 0.168, unit: 't/lm', label: 'Rekkverksbord', category: 'rekkverk', source: 'svenn', confidence: 'high' },
  rekkverksbord_gjerde: { rate: 0.08, unit: 't/lm', label: 'Rekkverksbord gjerde', category: 'rekkverk', source: 'svenn', confidence: 'medium' },
  rekkverksspiler:  { rate: 0.16, unit: 't/lm', label: 'Rekkverksspiler', category: 'rekkverk', source: 'svenn', confidence: 'medium' },
  rekkverksspiler_storre: { rate: 0.22, unit: 't/lm', label: 'Rekkverksspiler større', category: 'rekkverk', source: 'svenn', confidence: 'medium' },
  rekkverksstolper: { rate: 0.171, unit: 't/stk', label: 'Rekkverksstolper', category: 'rekkverk', source: 'svenn', confidence: 'high' },
  stolpe:           { rate: 0.1, unit: 't/lm', label: 'Stolpe', category: 'rekkverk', source: 'svenn', confidence: 'medium' },
  stolpesko:        { rate: 0.24, unit: 't/lm', label: 'Stolpesko', category: 'rekkverk', source: 'svenn', confidence: 'medium' },
  svill_under_handloper: { rate: 0.18, unit: 't/lm', label: 'Svill under håndløper', category: 'rekkverk', source: 'svenn', confidence: 'medium' },

  // ── Stillas (Svenn) ───────────────────────────────────────
  stillas_montering:   { rate: 0.074, unit: 't/m²', label: 'Montering lettstillas', category: 'stillas', source: 'svenn', confidence: 'high' },
  stillas_demontering: { rate: 0.074, unit: 't/m²', label: 'Demontering lettstillas', category: 'stillas', source: 'svenn', confidence: 'high' },
  justering_av_bein:   { rate: 0.066, unit: 't/m²', label: 'Justering av bein', category: 'stillas', source: 'svenn', confidence: 'high' },

  // ── Tak (Svenn) ───────────────────────────────────────────
  forankring_snofanger: { rate: 0.026, unit: 't/lm', label: 'Forankring snøfanger', category: 'tak', source: 'svenn', confidence: 'medium' },
  forkantbord:      { rate: 0.061, unit: 't/lm', label: 'Forkantbord', category: 'tak', source: 'svenn', confidence: 'high' },
  fugleband:        { rate: 0.018, unit: 't/lm', label: 'Fuglebånd', category: 'tak', source: 'svenn', confidence: 'medium' },
  kilrenne:         { rate: 0.052, unit: 't/lm', label: 'Kilrenne', category: 'tak', source: 'svenn', confidence: 'high' },
  lekter_tak:       { rate: 0.026, unit: 't/lm', label: 'Lekter tak', category: 'tak', source: 'svenn', confidence: 'high' },
  monepanner:       { rate: 0.041, unit: 't/lm', label: 'Mønepanner', category: 'tak', source: 'svenn', confidence: 'high' },
  moneplate:        { rate: 0.051, unit: 't/lm', label: 'Møneplate', category: 'tak', source: 'svenn', confidence: 'medium' },
  nedlopsror:       { rate: 0.089, unit: 't/lm', label: 'Nedløpsrør', category: 'tak', source: 'svenn', confidence: 'high' },
  sloyfer_tak:      { rate: 0.015, unit: 't/m²', label: 'Sløyfer tak', category: 'tak', source: 'svenn', confidence: 'high' },
  snofanger:        { rate: 0.365, unit: 't/lm', label: 'Snøfanger', category: 'tak', source: 'svenn', confidence: 'high' },
  snofanger_gitter: { rate: 0.01, unit: 't/stk', label: 'Snøfanger gitter', category: 'tak', source: 'svenn', confidence: 'medium' },
  takplate:         { rate: 0.095, unit: 't/m²', label: 'Takplate', category: 'tak', source: 'svenn', confidence: 'high' },
  takrenne:         { rate: 0.09, unit: 't/lm', label: 'Takrenne', category: 'tak', source: 'svenn', confidence: 'high' },
  takshingel:       { rate: 0.085, unit: 't/m²', label: 'Takshingel', category: 'tak', source: 'svenn', confidence: 'high' },
  takstein:         { rate: 0.066, unit: 't/m²', label: 'Takstein', category: 'tak', source: 'svenn', confidence: 'high' },
  torvhaldstokk:    { rate: 0.104, unit: 't/m²', label: 'Torvhaldstokk', category: 'tak', source: 'svenn', confidence: 'medium' },
  torvkrok:         { rate: 0.09, unit: 't/m²', label: 'Torvkrok', category: 'tak', source: 'svenn', confidence: 'medium' },
  torvsekker:       { rate: 0.28, unit: 't/m²', label: 'Torvsekker', category: 'tak', source: 'svenn', confidence: 'high' },
  undertak_asfalt:  { rate: 0.029, unit: 't/m²', label: 'Undertak asfalt', category: 'tak', source: 'svenn', confidence: 'high' },
  undertak_duk:     { rate: 0.019, unit: 't/m²', label: 'Undertak duk', category: 'tak', source: 'svenn', confidence: 'high' },
  undertak_underpanel: { rate: 0.092, unit: 't/lm', label: 'Undertak underpanel', category: 'tak', source: 'svenn', confidence: 'medium' },
  utkaster:         { rate: 0, unit: 't/stk', label: 'Utkaster', category: 'tak', source: 'svenn', confidence: 'medium' },
  vindskibord:      { rate: 0.061, unit: 't/lm', label: 'Vindskibord', category: 'tak', source: 'svenn', confidence: 'high' },

  // ── Terrasse (Svenn) ──────────────────────────────────────
  bjelkesko:        { rate: 0.059, unit: 't/stk', label: 'Bjelkesko', category: 'terrasse', source: 'svenn', confidence: 'high' },
  dragere:          { rate: 0.05, unit: 't/lm', label: 'Dragere', category: 'terrasse', source: 'svenn', confidence: 'high' },
  terrassebord:     { rate: 0.155, unit: 't/m²', label: 'Terrassebord', category: 'terrasse', source: 'svenn', confidence: 'high' },
  terrassebord_bredere: { rate: 0.124, unit: 't/m²', label: 'Terrassebord bredere', category: 'terrasse', source: 'svenn', confidence: 'medium' },

  // ── Trapp (Svenn) ─────────────────────────────────────────
  loftstrapp:       { rate: 1.048, unit: 't/stk', label: 'Loftstrapp', category: 'trapp', source: 'svenn', confidence: 'high' },
  montering_trappevange: { rate: 1.5, unit: 't/stk', label: 'Montering trappevange', category: 'trapp', source: 'svenn', confidence: 'medium' },
  montering_trapperepos: { rate: 0.561, unit: 't/stk', label: 'Montering trapperepos', category: 'trapp', source: 'svenn', confidence: 'high' },
  montering_trappeseksjon: { rate: 1.5, unit: 't/stk', label: 'Montering trappeseksjon', category: 'trapp', source: 'svenn', confidence: 'high' },
  montering_trappetrinn: { rate: 0.102, unit: 't/stk', label: 'Montering trappetrinn', category: 'trapp', source: 'svenn', confidence: 'high' },
  montering_stusstrinn: { rate: 0.061, unit: 't/stk', label: 'Montering stusstrinn', category: 'trapp', source: 'svenn', confidence: 'high' },
  trappefornying_buet_trinn: { rate: 0.75, unit: 't/stk', label: 'Trappefornying buet trinn', category: 'trapp', source: 'svenn', confidence: 'high' },
  trappefornying_rette_trinn: { rate: 0.57, unit: 't/stk', label: 'Trappefornying rette trinn', category: 'trapp', source: 'svenn', confidence: 'high' },
  trapperepos:      { rate: 0.561, unit: 't/stk', label: 'Trapperepos', category: 'trapp', source: 'svenn', confidence: 'high' },
  trappetrinn:      { rate: 0.102, unit: 't/stk', label: 'Trappetrinn', category: 'trapp', source: 'svenn', confidence: 'high' },
  trappevange:      { rate: 0.15, unit: 't/stk', label: 'Trappevange', category: 'trapp', source: 'svenn', confidence: 'medium' },
  trappevange_storre: { rate: 0.25, unit: 't/stk', label: 'Trappevange større', category: 'trapp', source: 'svenn', confidence: 'medium' },
  trappevange_meter:{ rate: 0.1, unit: 't/lm', label: 'Trappevange per meter', category: 'trapp', source: 'svenn', confidence: 'medium' },
  trappevange_meter_storre: { rate: 0.35, unit: 't/lm', label: 'Trappevange per meter større', category: 'trapp', source: 'svenn', confidence: 'medium' },

  // ── Utvendig (Svenn) ──────────────────────────────────────
  avstivning_pergola: { rate: 0.21, unit: 't/stk', label: 'Avstivning pergola', category: 'utvendig', source: 'svenn', confidence: 'medium' },
  baerebjelke_pergola: { rate: 0.1, unit: 't/lm', label: 'Bærebjelke pergola', category: 'utvendig', source: 'svenn', confidence: 'medium' },
  garderobeskap:    { rate: 0.849, unit: 't/stk', label: 'Garderobeskap', category: 'utvendig', source: 'svenn', confidence: 'medium' },
  garderobeskap_storre: { rate: 0.98, unit: 't/stk', label: 'Garderobeskap større', category: 'utvendig', source: 'svenn', confidence: 'medium' },
  gjerdepaler:      { rate: 0.2, unit: 't/stk', label: 'Gjerdepåler', category: 'utvendig', source: 'svenn', confidence: 'medium' },
  hengsler_port:    { rate: 0.12, unit: 't/stk', label: 'Hengsler port', category: 'utvendig', source: 'svenn', confidence: 'medium' },
  las_port:         { rate: 0.08, unit: 't/stk', label: 'Lås port', category: 'utvendig', source: 'svenn', confidence: 'medium' },
  ramme_port:       { rate: 0.75, unit: 't/stk', label: 'Ramme port', category: 'utvendig', source: 'svenn', confidence: 'medium' },
  stolper_pergola:  { rate: 0.35, unit: 't/stk', label: 'Stolper pergola', category: 'utvendig', source: 'svenn', confidence: 'medium' },
  tak_pergola:      { rate: 0.23, unit: 't/m²', label: 'Tak pergola', category: 'utvendig', source: 'svenn', confidence: 'medium' },

  // ── Våtrom (Svenn) ────────────────────────────────────────
  underpanel_vatrom:{ rate: 0.155, unit: 't/m²', label: 'Underpanel våtrom', category: 'vatrom', source: 'svenn', confidence: 'high' },
  vatromsplater_vegg: { rate: 0.205, unit: 't/m²', label: 'Våtromsplater vegg', category: 'vatrom', source: 'svenn', confidence: 'high' },

  // ── Vegg (Svenn) ──────────────────────────────────────────
  klemlist:         { rate: 0.072, unit: 't/lm', label: 'Klemlist', category: 'vegg', source: 'svenn', confidence: 'high' },
  krysslekter:      { rate: 0.13, unit: 't/m²', label: 'Krysslekter', category: 'vegg', source: 'svenn', confidence: 'medium' },
  lekter_gulv:      { rate: 0.07, unit: 't/m²', label: 'Lekter gulv', category: 'vegg', source: 'svenn', confidence: 'medium' },
  sloyfer:          { rate: 0.05, unit: 't/lm', label: 'Sløyfer', category: 'vegg', source: 'svenn', confidence: 'medium' },
  sloyfer_m2:       { rate: 0.041, unit: 't/m²', label: 'Sløyfer (m²)', category: 'vegg', source: 'svenn', confidence: 'medium' },
  underkledning_asfaltplater: { rate: 0.08, unit: 't/m²', label: 'Underkledning asfaltplater', category: 'vegg', source: 'svenn', confidence: 'high' },
  utlekting_innvendig_48mm: { rate: 0.104, unit: 't/lm', label: 'Utlekting innvendig 48 mm', category: 'vegg', source: 'svenn', confidence: 'high' },

  // ── Vindu (Svenn) ─────────────────────────────────────────
  montering_vindu:  { rate: 0.19, unit: 't/stk', label: 'Montering vindu', category: 'vindu', source: 'svenn', confidence: 'medium' },
  montering_vindu_tillegg: { rate: 0.064, unit: 't/lm', label: 'Tillegg montering vindu', category: 'vindu', source: 'svenn', confidence: 'high' },
  skrakapping:      { rate: 0.15, unit: 't/stk', label: 'Skråkapping', category: 'vindu', source: 'svenn', confidence: 'medium' },
  skrakapping_storre: { rate: 0.3, unit: 't/stk', label: 'Skråkapping større', category: 'vindu', source: 'svenn', confidence: 'medium' },
  takvindu:         { rate: 0.75, unit: 't/stk', label: 'Takvindu', category: 'vindu', source: 'svenn', confidence: 'high' },
  utvendig_tekking_takvindu: { rate: 0.6, unit: 't/stk', label: 'Utvendig tekking takvindu', category: 'vindu', source: 'svenn', confidence: 'high' },


  // ═══════════════════════════════════════════════════════════
  // RESEPT-KOMPATIBLE OPPFØRINGER (ikke i Svenn)
  // Disse dekker operasjoner som Svenn-data ikke inkluderer,
  // men som brukes av materialreseptene i recipes.js.
  // ═══════════════════════════════════════════════════════════

  // ── Grunnarbeid / fundament ───────────────────────────────
  grunnarbeid_betong:   { rate: 0.80, unit: 't/m³', label: 'Betongarbeid fundament', category: 'grunnarbeid', source: 'estimate' },
  grunnarbeid_armering: { rate: 0.05, unit: 't/lm', label: 'Armering', category: 'grunnarbeid', source: 'estimate' },
  grunnarbeid_forskal:  { rate: 0.04, unit: 't/lm', label: 'Forskaling', category: 'grunnarbeid', source: 'estimate' },
  grunnarbeid_graving:  { rate: 0.30, unit: 't/m²', label: 'Graving/klargjøring', category: 'grunnarbeid', source: 'estimate' },

  // ── Isolasjon (utvidet) ───────────────────────────────────
  isolasjon_250mm:      { rate: 0.08, unit: 't/m²', label: 'Isolasjon 250 mm', category: 'isolasjon', source: 'estimate' },

  // ── Gips ──────────────────────────────────────────────────
  gips_vegg:            { rate: 0.10, unit: 't/m²', label: 'Gips vegg montering', category: 'gips', source: 'estimate' },
  gips_sparkling:       { rate: 0.04, unit: 't/m²', label: 'Gips sparkling', category: 'gips', source: 'estimate' },

  // ── Drager / bæring ───────────────────────────────────────
  drager_montering:     { rate: 2.5, unit: 't/stk', label: 'Drager montering', category: 'konstruksjon', source: 'estimate' },

  // ── Tetting / fuging ──────────────────────────────────────
  vindu_tetting:        { rate: 0.15, unit: 't/stk', label: 'Vindu tetting', category: 'vindu', source: 'estimate' },
  dor_tetting:          { rate: 0.20, unit: 't/stk', label: 'Dør tetting', category: 'dor', source: 'estimate' },

  // ── Terrasse (utvidet) ────────────────────────────────────
  kantsarg:             { rate: 0.03, unit: 't/lm', label: 'Kantsarg', category: 'terrasse', source: 'estimate' },

  // ── Takrenner (utvidet) ───────────────────────────────────
  rennekrok:            { rate: 0.02, unit: 't/stk', label: 'Rennekrok', category: 'tak', source: 'estimate' },
  nedlopstrakt:         { rate: 0.10, unit: 't/stk', label: 'Nedløpstrakt', category: 'tak', source: 'estimate' },

  // ── Platting ──────────────────────────────────────────────
  platting_belegg:      { rate: 0.35, unit: 't/m²', label: 'Platting/belegg legging', category: 'platting', source: 'estimate' },
  platting_grunn:       { rate: 0.25, unit: 't/m²', label: 'Grunnarbeid platting', category: 'platting', source: 'estimate' },
  platting_kant:        { rate: 0.08, unit: 't/lm', label: 'Kantsetting', category: 'platting', source: 'estimate' },

  // ── Levegg ────────────────────────────────────────────────
  levegg_stolpe:        { rate: 0.30, unit: 't/stk', label: 'Leveggstolpe montering', category: 'levegg', source: 'estimate' },
  levegg_kledning:      { rate: 0.20, unit: 't/m²', label: 'Levegg kledning', category: 'levegg', source: 'estimate' },
  levegg_glass:         { rate: 0.35, unit: 't/m²', label: 'Levegg glass', category: 'levegg', source: 'estimate' },
  levegg_rigle:         { rate: 0.015, unit: 't/lm', label: 'Rigler montering', category: 'levegg', source: 'estimate' },

  // ── Trapp (utvidet) ───────────────────────────────────────
  utv_trapp_fundament:  { rate: 0.50, unit: 't/stk', label: 'Trappefundament', category: 'trapp', source: 'estimate' },
  rehab_trapp_overflate:{ rate: 0.30, unit: 't/stk', label: 'Trapp sliping/behandling', category: 'trapp', source: 'estimate' },

  // ── Pergola (utvidet) ─────────────────────────────────────
  pergola_sperre:       { rate: 0.02, unit: 't/lm', label: 'Sperrer pergola', category: 'utvendig', source: 'estimate' },

  // ── Bygninger ─────────────────────────────────────────────
  garasjeport:          { rate: 3.0, unit: 't/stk', label: 'Garasjeport montering', category: 'bygning', source: 'estimate' },
  bod_dor:              { rate: 1.5, unit: 't/stk', label: 'Boddør montering', category: 'bygning', source: 'estimate' },
  taktekking_enkel:     { rate: 0.12, unit: 't/m²', label: 'Taktekking enkel', category: 'tak', source: 'estimate' },

  // ── Tilbygg ───────────────────────────────────────────────
  tilbygg_fundament:    { rate: 0.50, unit: 't/m³', label: 'Tilbygg fundament', category: 'grunnarbeid', source: 'estimate' },

  // ── Gjerde (utvidet) ──────────────────────────────────────
  gjerde_rigle:         { rate: 0.015, unit: 't/lm', label: 'Gjerderigle', category: 'utvendig', source: 'estimate' },
  gjerde_bord:          { rate: 0.008, unit: 't/lm', label: 'Gjerdebord/spiler', category: 'utvendig', source: 'estimate' },

  // ── Gulvavretting ─────────────────────────────────────────
  gulvavretting_masse:  { rate: 0.20, unit: 't/m²', label: 'Selvutjevnende masse', category: 'gulv', source: 'estimate' },
  gulvavretting_stroer: { rate: 0.25, unit: 't/m²', label: 'Strøer og plater', category: 'gulv', source: 'estimate' },

  // ── Himling (utvidet) ─────────────────────────────────────
  himling_takess:       { rate: 0.08, unit: 't/m²', label: 'Takessplater/system', category: 'himling', source: 'estimate' },
  himling_pendel:       { rate: 0.03, unit: 't/stk', label: 'Pendler/oppheng', category: 'himling', source: 'estimate' },

  // ── Innerdør (utvidet) ────────────────────────────────────
  innerdor_hengsler:    { rate: 0.05, unit: 't/stk', label: 'Hengsel montering', category: 'dor', source: 'estimate' },
  innerdor_vrider:      { rate: 0.17, unit: 't/sett', label: 'Dørvrider montering', category: 'dor', source: 'estimate' },

  // ── Skyvedør ──────────────────────────────────────────────
  skyvedor_montering:   { rate: 2.5, unit: 't/stk', label: 'Skyvedør montering', category: 'dor', source: 'estimate' },
  skyvedor_pocket:      { rate: 1.0, unit: 't/stk', label: 'Pocketkassett montering', category: 'dor', source: 'estimate' },

  // ── Hvitevarer ────────────────────────────────────────────
  hvitevare_montering:  { rate: 0.80, unit: 't/stk', label: 'Hvitevare integrering', category: 'kjokken', source: 'estimate' },

  // ── Garderobe ─────────────────────────────────────────────
  garderobe_skyvedor:   { rate: 0.40, unit: 't/stk', label: 'Skyvedør garderobe', category: 'innredning', source: 'estimate' },

  // ── Spesialinnredning ─────────────────────────────────────
  spesialinnredning_montering: { rate: 2.5, unit: 't/stk', label: 'Spesialtilpasset montering', category: 'innredning', source: 'estimate' },

  // ── Innkassing ────────────────────────────────────────────
  innkassing:           { rate: 0.15, unit: 't/lm', label: 'Innkassing rør', category: 'vatrom', source: 'estimate' },
  innkassing_reisverk:  { rate: 0.015, unit: 't/lm', label: 'Innkassing stendere/lekter', category: 'vatrom', source: 'estimate' },

  // ── Bad ───────────────────────────────────────────────────
  badeinnredning_montering: { rate: 2.5, unit: 't/stk', label: 'Baderomsinnredning montering', category: 'vatrom', source: 'estimate' },
  kasse_nisje:          { rate: 1.5, unit: 't/stk', label: 'Kasse/nisje montering', category: 'vatrom', source: 'estimate' },

  // ── Listverk (utvidet) ────────────────────────────────────
  hjornelist:           { rate: 0.03, unit: 't/lm', label: 'Hjørnelist', category: 'listverk', source: 'estimate' },

  // ── Vindu (utvidet) ───────────────────────────────────────
  vindusbrett_montering:{ rate: 0.30, unit: 't/stk', label: 'Vindusbrett montering', category: 'vindu', source: 'estimate' },

  // ── Rekkverk (utvidet) ────────────────────────────────────
  rekkverk_glass:       { rate: 0.30, unit: 't/stk', label: 'Glassrekkverk montering', category: 'rekkverk', source: 'estimate' },

  // ── Stk-varianter for Svenn-data som har feil enhet for recipes ──
  // Svenn har stolpesko: 0.24 t/lm (meter grunnmur), men recipes bruker stk (per stolpe).
  // Svenn har rekkverksspiler: 0.16 t/lm, men recipes bruker stk (per spile).
  stolpesko_stk:        { rate: 0.15, unit: 't/stk', label: 'Stolpesko montering (stk)', category: 'rekkverk', source: 'estimate' },
  rekkverksspiler_stk:  { rate: 0.03, unit: 't/stk', label: 'Rekkverksspile montering (stk)', category: 'rekkverk', source: 'estimate' },
  // Svenn har vinkel_beslag: 0.055 t/lm, men recipes bruker stk (per beslag).
  vinkel_beslag_stk:    { rate: 0.015, unit: 't/stk', label: 'Vinkelbeslag montering (stk)', category: 'beslag', source: 'estimate' },
  // Svenn har gjerde_bord: 0.008 t/lm, men stakittgjerde-spiler er stk.
  gjerde_bord_stk:      { rate: 0.01, unit: 't/stk', label: 'Gjerdespile montering (stk)', category: 'utvendig', source: 'estimate' },
};

// ── EKSPORTER TIL GLOBALT SCOPE ──────────────────────────────

window.adjustmentFactors = adjustmentFactors;
window.laborData = laborData;
