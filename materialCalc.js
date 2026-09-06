// ── Materialkalkulator ─────────────────────────────────
// Frittstående hjelpeverktøy for raske materialberegninger.
// Ikke koblet til hovedkalkylen.

// Ett konsekvent avrundingsprinsipp for kontinuerlige lm-mengder (brukes IKKE
// for m²/pakker/stk — kun løpemeter):
// - round1: visningsmengde (netto/informasjon) — nærmeste 0,1.
// - ceil1: bestillingsmengde — rundes OPPOVER til nærmeste 0,1, ikke til
//   nærmeste hele meter. Unngår at f.eks. 65,1 lm blir bestilt som 66 lm.
// Udelelige enheter (skruer, plater, pakker, stolper) bruker fortsatt vanlig
// Math.ceil() til helt tall, ikke disse.
function round1(x) { return Math.round(x * 10) / 10; }
function ceil1(x) { return Math.ceil(x * 10) / 10; }

// Strukturert stenderdimensjon-data — tykkelsen ligger i et eget felt, ikke
// parset fra "value"-strengen (f.eks. "48x148") eller labelteksten. Samme
// prinsipp som resten av produktkatalogene i denne filen.
var STENDER_DIM_OPTIONS = [
  { value: '36x98', label: '36 × 98 mm (lett skillevegg)', tykkelseMm: 36 },
  { value: '48x98', label: '48 × 98 mm', tykkelseMm: 48 },
  { value: '36x148', label: '36 × 148 mm (lett skillevegg)', tykkelseMm: 36 },
  { value: '48x148', label: '48 × 148 mm', tykkelseMm: 48 },
  { value: '48x198', label: '48 × 198 mm', tykkelseMm: 48 }
];

// Strukturert terrassebord-data (bredde brukt i formler) — IKKE parset fra labeltekst.
var TERRASSE_BORD_OPTIONS = [
  { value: '28x120-impregnert', label: '28 × 120 mm trykkimpregnert', bredde: 120, materiale: 'Trykkimpregnert furu' },
  { value: '28x120-royal', label: '28 × 120 mm royalimpregnert', bredde: 120, materiale: 'Royalimpregnert furu' },
  { value: '28x145-royal', label: '28 × 145 mm royalimpregnert', bredde: 145, materiale: 'Royalimpregnert furu' },
  { value: '28x120-kompositt', label: '28 × 120 mm kompositt', bredde: 120, materiale: 'Kompositt' },
  { value: '26x118-furu', label: '26 × 118 mm furu trykkimpregnert', bredde: 118, materiale: 'Trykkimpregnert furu' }
];

// Delt beregning for "nytt fast undertak" (brukt av både Tak→Shingel og
// Tak→Takpapp, som begge kan trenge et nytt solid underlag). Låser IKKE til
// ett produkt (f.eks. OSB) — plateunderlag og rupanel er likeverdige valg
// med egne, redigerbare produktdata.
function takNyttUndertakLinjer(areal, svinnUndertak, materiale, plateM2, rupanelDekkbreddeMm) {
  var rows = [];
  if (materiale === 'rupanel') {
    var lmPerM2 = 1000 / (rupanelDekkbreddeMm || 148);
    var lmGeometrisk = areal * lmPerM2;
    rows.push({ label: 'Nytt undertak (rupanel) — geometrisk behov', value: round1(lmGeometrisk), unit: 'lm' });
    rows.push({ label: 'Nytt undertak (rupanel) — bestilling', value: ceil1(lmGeometrisk * (1 + svinnUndertak / 100)), unit: 'lm' });
  } else {
    var pm2 = plateM2 || 2.98;
    var antGeometrisk = Math.ceil(areal / pm2);
    var antBestilling = Math.ceil((areal * (1 + svinnUndertak / 100)) / pm2);
    rows.push({ label: 'Nytt undertak (plateunderlag) — geometrisk behov', value: antGeometrisk, unit: 'stk à ' + pm2 + ' m²' });
    rows.push({ label: 'Nytt undertak (plateunderlag) — bestilling', value: antBestilling, unit: 'stk à ' + pm2 + ' m²' });
  }
  return rows;
}

// Strukturert gipsplate-data — IKKE parset fra labeltekst. bredde/lengde i meter.
var GIPS_PLATE_OPTIONS = [
  { value: '1200x2400', label: '1200 × 2400 mm', bredde: 1.2, lengde: 2.4 },
  { value: '1200x2700', label: '1200 × 2700 mm', bredde: 1.2, lengde: 2.7 },
  { value: '900x2400', label: '900 × 2400 mm', bredde: 0.9, lengde: 2.4 }
];

// Delt geometri for gipsplating (vegg og himling bruker samme prinsipp,
// bare med ulike feltnavn i UI — se matCalcDefs.gips). Beregner faktisk
// antall hele plater fra flatemål og plateformat, IKKE areal/plateareal.
// Ingen kappoptimalisering/gjenbruk av restbiter ennå — kun hele plater.
function gipsPlateGeometri(breddeM, hoydeM, platebreddeM, platelengdeM, staaende) {
  var kolonner, rader;
  if (staaende) {
    kolonner = Math.ceil(breddeM / platebreddeM);
    rader = Math.ceil(hoydeM / platelengdeM);
  } else {
    kolonner = Math.ceil(breddeM / platelengdeM);
    rader = Math.ceil(hoydeM / platebreddeM);
  }
  return { kolonner: kolonner, rader: rader, platerPerLag: kolonner * rader };
}

// Sentral skrueanbefaling for gips — verifiserte produsentverdier der de
// finnes, nøklet på platetype → tykkelse → underlag → lag-posisjon. IKKE spre
// disse tallene rundt i beregningskoden — legg nye/korrigerte verdier her.
// Kombinasjoner som mangler en verifisert verdi skal IKKE gjette et tall —
// gipsSkruePreset returnerer da null, og UI/resultat viser i stedet
// "Kontroller produsentens skrueanvisning".
var GIPS_SKRUE_TABELL = {
  standard: {
    '12.5': {
      tre: { single: 32, lag1: 32, lag2: 41 },
      staal: { single: 25, lag1: 25, lag2: 38 }
    },
    // 15 mm (Gyproc Protect F): tre hopper til QT41 selv i enkelt lag — IKKE
    // samme lengde som 12,5 mm. lag2/stål er ikke verifisert (Gyproc sitt
    // 15 mm-sortiment i kilden var brannplate uten oppgitt stål-skrue for
    // denne kombinasjonen) — eksplisitt null, ikke gjettet, se
    // gipsSkruePreset()/onGipsSkrueRelevantChange() for hvordan null håndteres.
    '15': {
      tre: { single: 41, lag1: 41, lag2: null }
    }
  }
};

function gipsSkruePreset(platetype, tykkelse, underlag, hvilketLag, totaltAntallLag) {
  var t = GIPS_SKRUE_TABELL[platetype];
  var k = t && t[tykkelse];
  var u = k && k[underlag];
  if (!u) return null;
  if (totaltAntallLag === 1) return u.single;
  return hvilketLag === 2 ? u.lag2 : u.lag1;
}

// Delt fotlist-beregning — brukes av Listverk (primær) og Gulv sin valgfrie
// fotlist-snarvei, slik at det kun finnes ÉN formel for denne størrelsen.
// Tar total døråpningsbredde direkte (m) i stedet for antall dører × en antatt
// dørbredde — det fjerner en skjult antakelse om hvor brede døråpningene er.
function calcFotlist(omkretsM, dorapningBreddeM, svinnPct) {
  var fotNetto = Math.max(0, omkretsM - (dorapningBreddeM || 0));
  var bestilling = fotNetto * (1 + (svinnPct || 0) / 100);
  return { netto: fotNetto, bestilling: ceil1(bestilling) };
}

// Kledningsprofil-katalog — strukturert, kildesporet produktdata. IKKE lest
// fra labeltekst. lm/m² er primærverdien (jf. hvordan produsenter/forhandlere
// selv oppgir forbruk); dekkbredde utledes ved behov som 1000/lmPerM2.
// Fungerer for både stående og liggende montering (samme bord, ulik retning).
//
// Kilder (hentet/kryssjekket 22.08.2026):
// - Dobbelfals: Monter.no "Hvor mye kledning trenger du" (lm/m² per bordbredde,
//   vanlig ettlags stående/liggende montering). 19×148 mm (7,7 lm/m² =
//   130 mm dekkbredde) kryssjekket mot produktsider hos Gaus, Byggern,
//   Byggmakker og trepriser.no som alle oppgir 130 mm dekkbredde for
//   Moelven 19×148 dobbelfals.
// - "Annen/egendefinert": ingen kilde — brukeren fyller inn lm/m² selv.
//
// RETTET 2026-08-22: Monter.no sin "Rektangulær/glattkant"-tabell (20,8 / 10,2 /
// 8,2 / 6,8 / 5,8 lm/m² for 73/123/148/173/198 mm) ble først feilaktig lagt inn
// her som ettlags-preset. Tallene er faktisk SAMLET forbruk (under- + overligger)
// for rektangulær kledning montert MED 25 mm overlapp — ikke flush ettlags
// bordkledning. Bekreftet ved at tallene er nøyaktig 2× vår egen tømmermanns-
// formel for symmetrisk bredde: 1000/(2w−50) × 2 = 1000/(w−25) (Bergene Holm
// oppgir samme tømmermanns-tabell med 25 mm beregningsgrunnlag). En vanlig
// glattkant uten definert overlapp har ingen universell lm/m²-verdi. Disse
// breddene finnes derfor ikke som egen preset-liste her — de dekkes allerede
// korrekt av Tømmermannskledning ved å velge samme bredde for under- og
// overligger (se KLEDNING_TOMMERMANN_BREDDER under).
var KLEDNING_PROFIL_PRESETS = [
  { value: 'dobbelfals_98', label: '19×98 mm Dobbelfals', bordbreddeMm: 98, lmPerM2: 12.5, kilde: 'Monter.no' },
  { value: 'dobbelfals_123', label: '19×123 mm Dobbelfals', bordbreddeMm: 123, lmPerM2: 9.6, kilde: 'Monter.no' },
  { value: 'dobbelfals_148', label: '19×148 mm Dobbelfals', bordbreddeMm: 148, lmPerM2: 7.7, kilde: 'Monter.no, kryssjekket mot Gaus/Byggern/Byggmakker/trepriser.no' },
  { value: 'dobbelfals_173', label: '19×173 mm Dobbelfals', bordbreddeMm: 173, lmPerM2: 6.5, kilde: 'Monter.no' },
  { value: 'egendefinert', label: 'Annen / egendefinert', bordbreddeMm: null, lmPerM2: null, kilde: null }
];

// Rekkverk — generiske material-presets for spiler og stolper (vanlige,
// sagede trelastdimensjoner — IKKE ferdige rekkverkssystemer og ikke en
// konstruksjonsmessig fasit). Ferdige merkevaresystemer (f.eks. T-Railing,
// Plastmo, Veranda, Glassystem) har egne, produktspesifikke mål og dekkes
// ikke her — én produsents system skal ikke fremstilles som universell
// standard for rekkverk generelt.
// Kilder (research 22.08.2026): 36×48 mm selges eksplisitt som
// "rekkverksspile" hos Byggmakker og Maxbo (Bergene Holm). 48×98 mm er
// ordinært C24 impregnert konstruksjonsvirke i vanlig bruk som
// rekkverksstolpe (Byggmakker/Monter/Obs Bygg/Byggmax). 48×48 (spile) og
// 98×98 (stolpe) er vanlige generiske dimensjoner, men noe svakere bekreftet
// enkeltvis som ferdig navngitt "rekkverks"-produkt.
var REKKVERK_SPILE_PRESETS = [
  { value: '36x48', label: '36×48 mm', spilebreddeMm: 36 },
  { value: '48x48', label: '48×48 mm', spilebreddeMm: 48 },
  { value: 'egendefinert', label: 'Annen / egendefinert', spilebreddeMm: null }
];
var REKKVERK_STOLPE_PRESETS = [
  { value: '48x98', label: '48×98 mm', dimensjonLabel: '48×98 mm' },
  { value: '98x98', label: '98×98 mm', dimensjonLabel: '98×98 mm' },
  { value: 'egendefinert', label: 'Annen / egendefinert', dimensjonLabel: '' }
];

// Tømmermannskledning-bredder — samme bredde-sett som i Bergene Holm sin
// verifiserte "LM pr. dimensjon"-tabell for kledning med over-/underligger
// (bergeneholm.no/dokumentasjon/beregning-kledningsdimensjoner). Tabellen
// viser lm/m² = 1000/(bredde1+bredde2−50), som tilsvarer vår eksisterende
// formel med et totalt overlapp på 50 mm (25 mm på hver side) — bekrefter
// formelen og gir en verifisert standardverdi for overlapp. Ved symmetrisk
// bredde (samme under- og overligger) reproduserer denne formelen (×2, for
// begge lag samlet) nøyaktig Monter.no sine "Rektangulær"-tall over.
var KLEDNING_TOMMERMANN_BREDDER = [48, 73, 98, 123, 148, 173, 198];

var matCalcDefs = {
  stender: {
    label: 'Stender',
    icon: '',
    desc: 'Beregn stendere, bunnsvill og toppsvill for en veggstrekning. Ett sammenhengende veggstrekk om gangen — kjør kalkulatoren separat per strekk og bruk «Ekstra stendere» til å justere for hjørner/åpninger, ikke summer flere strekk sammen i ett tall.',
    customRender: true,
    fields: [
      { id: 'veggLengde', label: 'Vegglengde (m)', type: 'number', placeholder: '6',
        hint: 'Ett sammenhengende veggstrekk om gangen. Hjørner mot andre vegger og åpninger for vinduer/dører legges til separat under «Ekstra stendere» i Flere valg.' },
      { id: 'veggHoyde', label: 'Vegghøyde (m)', type: 'number', placeholder: '2.4', default: 2.4,
        hint: 'Total ferdig reisverkshøyde (gulv til toppsvill), ikke stenderlengden. Stenderlengden beregnes automatisk ved å trekke fra svilltykkelsen(e).' },
      { id: 'dim', label: 'Dimensjon', type: 'select', options: STENDER_DIM_OPTIONS.map(function(o) {
        return { value: o.value, label: o.label };
      }), default: '48x148', hint: '48×98 og 48×148 er begge sentrale valg — vurder ut fra om veggen er innervegg eller yttervegg/bærevegg, ikke fordi én dimensjon er "standard".' },
      { id: 'cc', label: 'Senteravstand c/c', type: 'select', options: [
        { value: '300', label: '300 mm' },
        { value: '400', label: '400 mm' },
        { value: '600', label: '600 mm (standard)' }
      ], default: '600' },
      { id: 'toppsvill', label: 'Toppsvill', type: 'select', options: [
        { value: 'enkel', label: 'Enkel' },
        { value: 'dobbel', label: 'Dobbel' }
      ], default: 'enkel' },
      { id: 'bunnsvillBehandling', label: 'Bunnsvill — behandling', type: 'select', options: [
        { value: 'ubehandlet', label: 'Ubehandlet' },
        { value: 'impregnert', label: 'Trykkimpregnert' }
      ], default: 'ubehandlet', advanced: true,
        hint: 'Bør normalt være trykkimpregnert mot betong/grunnmur — avhenger av underlaget, ikke satt automatisk.' },
      { id: 'toppsvillBehandling', label: 'Toppsvill — behandling', type: 'select', options: [
        { value: 'ubehandlet', label: 'Ubehandlet' },
        { value: 'impregnert', label: 'Trykkimpregnert' }
      ], default: 'ubehandlet', advanced: true },
      { id: 'svinnSvill', label: 'Svinn/kapp svill (%)', type: 'number', placeholder: '5', default: 5, advanced: true,
        hint: 'Dekker kapp og skjøt i hjørner — svill selges normalt i lange lengder med lite spill. Gjelder både bunnsvill og toppsvill.' },
      { id: 'ekstra', label: 'Ekstra stendere (hjørner, åpninger)', type: 'number', placeholder: '0', default: 0, advanced: true },
      { id: 'svillCC', label: 'Svillfeste — maks avstand c/c (mm)', type: 'select', options: [
        { value: '300', label: '300 mm' },
        { value: '400', label: '400 mm' },
        { value: '600', label: '600 mm' }
      ], default: '400', advanced: true,
        hint: 'Brukes til å beregne antall festepunkter (inkl. start/slutt), ikke selve materialmengden. Bunnsvill mot betong/grunnmur og toppsvill mot stenderverk kan kreve helt ulik festemiddeltype — kalkulatoren viser kun antall, ikke type.' }
    ],
    calc: function(v) {
      var lengde = Number(v.veggLengde) || 0;
      var hoyde = v.veggHoyde === '' || v.veggHoyde === undefined ? 2.4 : Number(v.veggHoyde);
      var cc = Number(v.cc) || 600;
      var ekstra = Number(v.ekstra) || 0;
      var svillCC = Number(v.svillCC) || 400;
      var svinnSvill = Number(v.svinnSvill) || 0;
      if (!(lengde > 0)) return null;

      var dobbelTopp = v.toppsvill === 'dobbel';
      var dimOpt = STENDER_DIM_OPTIONS.filter(function(o) { return o.value === v.dim; })[0] || STENDER_DIM_OPTIONS[3];
      var tykkelse = dimOpt.tykkelseMm;

      // Vegghøyde = total ferdig reisverkshøyde (gulv til toppsvill), ikke
      // stenderlengden. Stenderen kappes kortere enn vegghøyden — trekk fra
      // bunnsvill (1 lag) og toppsvill (1 eller 2 lag), begge i valgt
      // virkesdimensjons tykkelse.
      var svillLagTotalt = 1 + (dobbelTopp ? 2 : 1);
      var stenderLengdeMm = Math.round(hoyde * 1000) - tykkelse * svillLagTotalt;
      if (!(stenderLengdeMm > 0)) return null;
      // Emnelengde i meter, ingen prosent-påslag — hver stender kappes til
      // nøyaktig denne lengden, ikke matchet mot en antatt handelslengde.
      var emnelengdeStender = stenderLengdeMm / 1000;

      var antStender = Math.ceil((lengde * 1000) / cc) + 1 + ekstra;
      var stenderLm = antStender * emnelengdeStender;

      var bunnsvillLmNetto = lengde;
      var toppsvillLmNetto = lengde * (dobbelTopp ? 2 : 1);
      var bunnsvillBestilling = ceil1(bunnsvillLmNetto * (1 + svinnSvill / 100));
      var toppsvillBestilling = ceil1(toppsvillLmNetto * (1 + svinnSvill / 100));

      var bunnBehandlingLabel = v.bunnsvillBehandling === 'impregnert' ? 'trykkimpregnert' : 'ubehandlet';
      var toppBehandlingLabel = v.toppsvillBehandling === 'impregnert' ? 'trykkimpregnert' : 'ubehandlet';

      // Stenderfeste: enkel, generisk snekkerkonvensjon (2 spiker/skruer i
      // bunn + 2 i topp per stender) — ikke en produsentverifisert preset,
      // men universell nok til å ikke trenge et eget redigerbart felt.
      var stenderFeste = antStender * 4;

      // Svillfeste: c/c skal representere MAKS avstand mellom festepunkter,
      // som krever et punkt i hver ende i tillegg til intervallene (+1) —
      // ikke bare antall intervaller. Bunnsvill og toppsvill vises separat
      // siden de typisk festes til ulikt underlag med ulikt festemiddel —
      // fastholdt som detaljer, ikke hovedresultat, siden festemiddeltypen
      // (betongskruer/ekspansjonsbolter mot grunnmur vs. spiker/skruer til
      // stenderverk) er for systemavhengig til å presenteres som "hva kjøpe".
      var antFestepunkter = Math.ceil((lengde * 1000) / svillCC) + 1;
      var bunnsvillFeste = antFestepunkter;
      var toppsvillFeste = antFestepunkter; // feste av (nederste) toppsvill-lag til stenderverket

      var results = [];
      var details = [];

      results.push({ primary: true, text: antStender + ' stendere à ' + (Math.round(emnelengdeStender * 1000) / 1000) + ' m' });
      results.push({ primary: true, text: bunnsvillBestilling + ' lm bunnsvill (' + bunnBehandlingLabel + ')' });
      results.push({ primary: true, text: toppsvillBestilling + ' lm ' + (dobbelTopp ? 'dobbel' : 'enkel') + ' toppsvill (' + toppBehandlingLabel + ')' });
      results.push({ primary: true, text: 'ca. ' + stenderFeste + ' festemidler (stender)' });
      results.push({ secondary: true, text: dimOpt.label + ' · c/c ' + cc + ' mm · ' + (dobbelTopp ? 'dobbel' : 'enkel') + ' toppsvill · inkl. ' + svinnSvill + '% svinn' });

      details.push({ label: 'Stendere løpemeter', value: round1(stenderLm), unit: 'lm' });
      details.push({ label: 'Bunnsvill — netto', value: round1(bunnsvillLmNetto), unit: 'lm' });
      details.push({ label: 'Toppsvill — netto', value: round1(toppsvillLmNetto), unit: 'lm' });
      details.push({ label: 'Dimensjon', value: dimOpt.value, unit: 'mm' });
      details.push({ label: 'Bunnsvillfeste — antall festepunkter', value: bunnsvillFeste, unit: 'stk (maks c/c ' + svillCC + ' mm, mot underlag)' });
      details.push({ label: 'Toppsvillfeste — antall festepunkter', value: toppsvillFeste, unit: 'stk (maks c/c ' + svillCC + ' mm, til stenderverk)' });
      if (dobbelTopp) {
        details.push({ label: 'Innfesting mellom toppsvill-lag (estimat, samme c/c)', value: antFestepunkter, unit: 'stk' });
      }

      return results.concat(details);
    },
    renderResult: renderCompactMcResult
  },

  kledning: {
    label: 'Kledning',
    icon: '',
    desc: 'Velg profil/dimensjon — kalkulatoren fyller inn kjent forbruk (lm/m²) automatisk. Beregner materialmengde og festemidler, ikke en kappplan. Avgjør ikke korrekt profil, spikertype, lufting eller innfesting for den konkrete konstruksjonen.',
    customRender: true,
    fields: [
      { id: 'jobb', label: 'Kledningstype', type: 'select', options: [
        { value: 'liggende', label: 'Liggende' },
        { value: 'staaende', label: 'Stående' },
        { value: 'tommermann', label: 'Tømmermannskledning' }
      ], default: 'liggende' },
      { id: 'veggbredde', label: 'Veggbredde (m)', type: 'number', placeholder: '6' },
      { id: 'vegghoyde', label: 'Vegghøyde (m)', type: 'number', placeholder: '2.4' },
      { id: 'apningerM2', label: 'Åpningsareal (m², valgfritt)', type: 'number', placeholder: '0', default: 0, advanced: true,
        hint: 'Trekkes fra bruttoareal og brukes i mengdeberegningen. Ved mange eller små åpninger kan faktisk kappsvinn bli høyere enn arealfratrekket tilsier — juster svinnprosenten ved behov.' }
    ],
    jobFields: {
      liggende: [
        { id: 'profilPreset', label: 'Profil/dimensjon', type: 'select', options: KLEDNING_PROFIL_PRESETS.map(function(p) {
          return { value: p.value, label: p.label };
        }), default: 'dobbelfals_148',
          hint: 'Fyller automatisk inn kjent forbruk (lm/m²) — se «Flere valg» for å overstyre eller sette et eget tall.' },
        { id: 'lmPerM2', label: 'Forbruk (lm/m²)', type: 'number', placeholder: '7.7', default: 7.7, advanced: true,
          hint: 'Fylles automatisk fra valgt profil/dimensjon. Overstyr her ved «Annen/egendefinert» eller hvis du har et annet, kjent forbrukstall.' },
        { id: 'lektCC', label: 'Lekt c/c (mm, vertikal utlekting)', type: 'number', placeholder: '600', default: 600, advanced: true },
        { id: 'festemidlerPerKryss', label: 'Festemidler per kryss (stk)', type: 'number', placeholder: '1', default: 1, advanced: true,
          hint: 'Produktdata/preset, ikke en byggfaglig fasit.' },
        { id: 'svinnBord', label: 'Svinn/kapp bord (%)', type: 'number', placeholder: '7', default: 7, advanced: true,
          hint: 'Bransjepreset for liggende kledning (Monter.no) — juster fritt.' },
        { id: 'svinnFestemidler', label: 'Tillegg festemidler (%)', type: 'number', placeholder: '5', default: 5, advanced: true },
        { id: 'bordlengde', label: 'Handelslengde (m, 0 = ikke vis)', type: 'number', placeholder: '0', default: 0, advanced: true,
          hint: 'Gir kun et grovt anslag på antall handelslengder — ikke en kappplan.' }
      ],
      staaende: [
        { id: 'profilPreset', label: 'Profil/dimensjon', type: 'select', options: KLEDNING_PROFIL_PRESETS.map(function(p) {
          return { value: p.value, label: p.label };
        }), default: 'dobbelfals_148',
          hint: 'Fyller automatisk inn kjent forbruk (lm/m²) — se «Flere valg» for å overstyre eller sette et eget tall.' },
        { id: 'lmPerM2', label: 'Forbruk (lm/m²)', type: 'number', placeholder: '7.7', default: 7.7, advanced: true,
          hint: 'Fylles automatisk fra valgt profil/dimensjon. Overstyr her ved «Annen/egendefinert» eller hvis du har et annet, kjent forbrukstall.' },
        { id: 'lektCC', label: 'Lekt c/c (mm)', type: 'number', placeholder: '600', default: 600, advanced: true },
        { id: 'festemidlerPerKryss', label: 'Festemidler per kryss (stk)', type: 'number', placeholder: '1', default: 1, advanced: true,
          hint: 'Produktdata/preset, ikke en byggfaglig fasit — juster etter valgt festesystem.' },
        { id: 'svinnBord', label: 'Svinn/kapp bord (%)', type: 'number', placeholder: '10', default: 10, advanced: true,
          hint: 'Bransjepreset for stående kledning (Monter.no) — juster fritt.' },
        { id: 'svinnFestemidler', label: 'Tillegg festemidler (%)', type: 'number', placeholder: '5', default: 5, advanced: true },
        { id: 'bordlengde', label: 'Handelslengde (m, 0 = ikke vis)', type: 'number', placeholder: '0', default: 0, advanced: true,
          hint: 'Gir kun et grovt anslag på antall handelslengder — ikke en kappplan. Bør minst dekke vegghøyden hvis skjøt ikke ønskes.' }
      ],
      tommermann: [
        { id: 'underliggerBredde', label: 'Underligger — bredde (mm)', type: 'select', options: KLEDNING_TOMMERMANN_BREDDER.map(function(mm) {
          return { value: String(mm), label: mm + ' mm' };
        }), default: '148' },
        { id: 'overliggerBredde', label: 'Overligger — bredde (mm)', type: 'select', options: KLEDNING_TOMMERMANN_BREDDER.map(function(mm) {
          return { value: String(mm), label: mm + ' mm' };
        }), default: '123' },
        { id: 'overlapp', label: 'Overlapp (mm)', type: 'number', placeholder: '25', default: 25, advanced: true,
          hint: 'Bergene Holm oppgir 15–25 mm overlapp avhengig av dimensjon; 25 mm er brukt som beregningsgrunnlag i deres kombinasjonstabell. Juster fritt.' },
        { id: 'ekstraOverliggere', label: 'Ekstra overliggere / avslutninger (stk)', type: 'number', placeholder: '0', default: 0, advanced: true,
          hint: 'Enkelt manuelt tillegg for hjørner/avslutninger.' },
        { id: 'lektCC', label: 'Lekt c/c (mm, horisontal utlekting)', type: 'number', placeholder: '600', default: 600, advanced: true },
        { id: 'festemidlerPerKryssUnderligger', label: 'Festemidler per kryss — underligger (stk)', type: 'number', placeholder: '1', default: 1, advanced: true,
          hint: 'Produktdata/preset, ikke en byggfaglig fasit.' },
        { id: 'festemidlerPerKryssOverligger', label: 'Festemidler per kryss — overligger (stk)', type: 'number', placeholder: '2', default: 2, advanced: true,
          hint: 'Produktdata/preset, ikke en byggfaglig fasit.' },
        { id: 'svinnBord', label: 'Svinn/kapp bord (%)', type: 'number', placeholder: '12', default: 12, advanced: true,
          hint: 'Bransjepreset — dobbelt lag gir normalt noe mer kapp enn enkeltlag. Juster fritt.' },
        { id: 'svinnFestemidler', label: 'Tillegg festemidler (%)', type: 'number', placeholder: '5', default: 5, advanced: true },
        { id: 'bordlengde', label: 'Handelslengde (m, 0 = ikke vis)', type: 'number', placeholder: '0', default: 0, advanced: true,
          hint: 'Gir kun et grovt anslag på antall handelslengder — ikke en kappplan.' }
      ]
    },
    calc: function(v) {
      var veggbredde = Number(v.veggbredde) || 0;
      var vegghoyde = Number(v.vegghoyde) || 0;
      if (!(veggbredde > 0) || !(vegghoyde > 0)) return null;

      var jobb = v.jobb || 'liggende';
      var bruttoAreal = veggbredde * vegghoyde;
      var apningerM2 = Number(v.apningerM2) || 0;
      var nettoAreal = Math.max(0, bruttoAreal - apningerM2);
      var lektCC = (Number(v.lektCC) || 600) / 1000;
      var bordlengde = Number(v.bordlengde) || 0;
      var svinnFeste = Number(v.svinnFestemidler) || 0;

      var results = [];
      results.push({ label: 'Nettoareal vegg (' + veggbredde + ' × ' + vegghoyde + ' m' + (apningerM2 > 0 ? ' − åpninger' : '') + ')', value: Math.round(nettoAreal * 100) / 100, unit: 'm²' });

      if (jobb === 'staaende' || jobb === 'liggende') {
        var presetValue = v.profilPreset || 'dobbelfals_148';
        var preset = KLEDNING_PROFIL_PRESETS.filter(function(p) { return p.value === presetValue; })[0] || KLEDNING_PROFIL_PRESETS[2];
        var lmPerM2 = Number(v.lmPerM2) || preset.lmPerM2 || 0;
        if (!(lmPerM2 > 0)) return null;
        var dekkbreddeMm = 1000 / lmPerM2;
        var svinnBord = Number(v.svinnBord) || 0;
        var festePerKryss = Number(v.festemidlerPerKryss) || 0;

        // Bransjestandard: areal × lm/m² (verifisert produktdata), IKKE en
        // per-bord/per-rad kappoptimalisering.
        var nettoLm = nettoAreal * lmPerM2;
        var bestillingLm = ceil1(nettoLm * (1 + svinnBord / 100));

        var antEnheter, festeGeometrisk;
        if (jobb === 'staaende') {
          antEnheter = Math.ceil(veggbredde / (dekkbreddeMm / 1000));
          var antHorisontaleLekterader = Math.ceil(vegghoyde / lektCC) + 1;
          festeGeometrisk = antEnheter * antHorisontaleLekterader * festePerKryss;
        } else {
          antEnheter = Math.ceil(vegghoyde / (dekkbreddeMm / 1000));
          var antVertikaleLekterader = Math.ceil(veggbredde / lektCC) + 1;
          festeGeometrisk = antEnheter * antVertikaleLekterader * festePerKryss;
        }
        var festeBestilling = Math.ceil(festeGeometrisk * (1 + svinnFeste / 100));

        results.push({ primary: true, text: bestillingLm + ' lm kledning' });
        results.push({ primary: true, text: 'ca. ' + festeBestilling + ' festemidler' });
        results.push({ secondary: true, text: (preset.value === 'egendefinert' ? 'Egendefinert profil' : preset.label) + ' — inkl. ' + svinnBord + '% svinn' });

        results.push({ label: 'Kledning — netto løpemeter', value: Math.round(nettoLm * 10) / 10, unit: 'lm' });
        results.push({ label: 'Forbruk', value: Math.round(lmPerM2 * 100) / 100, unit: 'lm/m²' });
        results.push({ label: 'Dekkbredde (utledet)', value: Math.round(dekkbreddeMm * 10) / 10, unit: 'mm' });
        results.push({ label: jobb === 'staaende' ? 'Antall bord (info)' : 'Antall bordrader (info)', value: antEnheter, unit: jobb === 'staaende' ? 'stk à ' + vegghoyde + ' m' : 'rader' });
        results.push({ label: 'Festemidler — geometrisk behov', value: festeGeometrisk, unit: 'stk' });
        if (bordlengde > 0) {
          results.push({ label: 'Estimert antall handelslengder (' + bordlengde + ' m)', value: Math.ceil(bestillingLm / bordlengde), unit: 'stk (grovt estimat, ikke kappplan)' });
          if (jobb === 'staaende' && bordlengde < vegghoyde) {
            results.push({ label: '⚠ Bordlengde kortere enn vegghøyde', value: 'Valgt bordlengde (' + bordlengde + ' m) er kortere enn vegghøyden (' + vegghoyde + ' m) — bord må skjøtes hvis dette ikke er tilsiktet.', unit: '' });
          }
        }
      } else if (jobb === 'tommermann') {
        var underliggerBreddeMm = Number(v.underliggerBredde) || 148;
        var overliggerBreddeMm = Number(v.overliggerBredde) || 123;
        var overlappMm = Number(v.overlapp) || 25;
        var ekstraOverliggere = Math.round(Number(v.ekstraOverliggere) || 0);
        var svinnBord = Number(v.svinnBord) || 0;
        var festeUnderligger = Number(v.festemidlerPerKryssUnderligger) || 0;
        var festeOverligger = Number(v.festemidlerPerKryssOverligger) || 0;

        // Verifisert bransjeformel (Bergene Holm): overligger dekker gapet
        // mellom underliggerne (G = overliggerbredde − 2×overlapp), så
        // senteravstanden (pitch) for BEGGE lag blir U + G.
        var gapMm = overliggerBreddeMm - 2 * overlappMm;
        var senteravstandMm = underliggerBreddeMm + gapMm;
        if (!(senteravstandMm > 0)) return null;

        var lmPerM2Tommer = 1000 / senteravstandMm;
        var underliggerNettoLm = nettoAreal * lmPerM2Tommer;
        var overliggerNettoLm = nettoAreal * lmPerM2Tommer + ekstraOverliggere * vegghoyde;

        var underBestillingLm = ceil1(underliggerNettoLm * (1 + svinnBord / 100));
        var overBestillingLm = ceil1(overliggerNettoLm * (1 + svinnBord / 100));

        var antUnderliggere = Math.ceil(veggbredde / (senteravstandMm / 1000));
        var antOverliggere = Math.max(0, antUnderliggere - 1) + ekstraOverliggere;
        var antHorisontaleLekterader = Math.ceil(vegghoyde / lektCC) + 1;
        var festeUnderGeometrisk = antUnderliggere * antHorisontaleLekterader * festeUnderligger;
        var festeOverGeometrisk = antOverliggere * antHorisontaleLekterader * festeOverligger;
        var festeUnderBestilling = Math.ceil(festeUnderGeometrisk * (1 + svinnFeste / 100));
        var festeOverBestilling = Math.ceil(festeOverGeometrisk * (1 + svinnFeste / 100));

        results.push({ primary: true, text: 'Underligger: ' + underBestillingLm + ' lm' });
        results.push({ primary: true, text: 'Overligger: ' + overBestillingLm + ' lm' });
        results.push({ primary: true, text: 'Festemidler: ca. ' + (festeUnderBestilling + festeOverBestilling) + ' stk' });
        results.push({ secondary: true, text: underliggerBreddeMm + '×' + overliggerBreddeMm + ' mm tømmermannskledning — inkl. ' + svinnBord + '% svinn' });

        results.push({ label: 'Underligger — netto løpemeter (senteravstand ' + senteravstandMm + ' mm)', value: Math.round(underliggerNettoLm * 10) / 10, unit: 'lm' });
        results.push({ label: 'Overligger — netto løpemeter (inkl. ' + ekstraOverliggere + ' ekstra à ' + vegghoyde + ' m)', value: Math.round(overliggerNettoLm * 10) / 10, unit: 'lm' });
        results.push({ label: 'Horisontale lekterader', value: antHorisontaleLekterader, unit: 'rader' });
        results.push({ label: 'Festemidler underligger', value: festeUnderBestilling, unit: 'stk' });
        results.push({ label: 'Festemidler overligger', value: festeOverBestilling, unit: 'stk' });
        if (bordlengde > 0) {
          results.push({ label: 'Estimert antall handelslengder underligger (' + bordlengde + ' m)', value: Math.ceil(underBestillingLm / bordlengde), unit: 'stk' });
          results.push({ label: 'Estimert antall handelslengder overligger (' + bordlengde + ' m)', value: Math.ceil(overBestillingLm / bordlengde), unit: 'stk' });
          if (bordlengde < vegghoyde) {
            results.push({ label: '⚠ Bordlengde kortere enn vegghøyde', value: 'Valgt bordlengde (' + bordlengde + ' m) er kortere enn vegghøyden (' + vegghoyde + ' m) — under-/overligger må skjøtes hvis dette ikke er tilsiktet.', unit: '' });
          }
        }
      }

      return results;
    },
    renderResult: renderCompactMcResult
  },

  gips: {
    label: 'Gips',
    icon: '',
    desc: 'Beregn antall gipsplater, festemidler, sparkel og tape ut fra faktisk flatemål og plateformat — ikke bare areal/plateareal. Kalkulatoren beregner materialmengde. Valgt plate må kontrolleres mot krav til brann, lyd og våtromssystem — "Brannplate" alene dokumenterer ikke en brannklassifisert konstruksjon.',
    fields: [
      { id: 'jobb', label: 'Plassering', type: 'select', options: [
        { value: 'vegg', label: 'Vegg' },
        { value: 'tak', label: 'Tak (himling)' }
      ], default: 'vegg' }
    ],
    // Vegg og tak/himling bruker samme geometri (se gipsPlateGeometri), men
    // holdes som separate felt-sett for å gi tydelige, entydige feltnavn —
    // "Tak" her betyr KUN gips i himling, ikke takkalkulatorens tekking.
    jobFields: {
      vegg: [
        { id: 'flatebredde', label: 'Veggbredde (m)', type: 'number', placeholder: '4.8' },
        { id: 'flatehoyde', label: 'Vegghøyde (m)', type: 'number', placeholder: '2.4' },
        { id: 'plateformat', label: 'Platevalg (forhåndsvalg)', type: 'select', options: GIPS_PLATE_OPTIONS.map(function(o) {
          return { value: o.value, label: o.label };
        }), default: '1200x2400' },
        { id: 'tykkelse', label: 'Platetykkelse (mm)', type: 'select', options: [
          { value: '9.5', label: '9,5 mm' },
          { value: '12.5', label: '12,5 mm' },
          { value: '15', label: '15 mm' }
        ], default: '12.5' },
        { id: 'platetype', label: 'Platetype', type: 'select', options: [
          { value: 'standard', label: 'Standard' },
          { value: 'brann', label: 'Brannplate' },
          { value: 'vatrom', label: 'Fuktbestandig / våtromsplate' }
        ], default: 'standard' },
        { id: 'lag', label: 'Antall lag', type: 'select', options: [
          { value: '1', label: '1 lag' },
          { value: '2', label: '2 lag' }
        ], default: '1', hint: 'Ved 2 lag forutsettes forskjøvede skjøter mellom platelagene. Kontroller valgt brann-/lyd-/platesystem.' },
        { id: 'underlag', label: 'Underlag', type: 'select', options: [
          { value: 'tre', label: 'Tre' },
          { value: 'staal', label: 'Stål' }
        ], default: 'tre' },
        { id: 'orientering', label: 'Plateorientering', type: 'select', options: [
          { value: 'staaende', label: 'Stående plater' },
          { value: 'liggende', label: 'Liggende plater' }
        ], default: 'staaende', advanced: true },
        { id: 'platebredde', label: 'Platebredde (m)', type: 'number', placeholder: '1.2', default: 1.2, advanced: true,
          hint: 'Fylles automatisk fra platevalg, men kan overstyres fritt — kalkulatoren er ikke avhengig av at produktet finnes i listen.' },
        { id: 'platelengde', label: 'Platelengde (m)', type: 'number', placeholder: '2.4', default: 2.4, advanced: true,
          hint: 'Fylles automatisk fra platevalg, men kan overstyres fritt.' },
        { id: 'apningerM2', label: 'Åpninger (m², kun informasjon)', type: 'number', placeholder: '0', default: 0, advanced: true,
          hint: 'Påvirker kun nettoareal-informasjonen, IKKE det geometriske platetallet — platene må uansett skjæres til rundt åpninger, og gir normalt like mye kapp som om åpningen ikke fantes.' },
        { id: 'festetetthetHoved', label: 'Festetetthet — enkelt/ytterste lag (stk/m²)', type: 'number', placeholder: '20', default: 20, advanced: true,
          hint: 'Kalkulasjonspreset, ikke en produsentfasit — Gyproc og Norgips bruker ulike prinsipper (Gyproc oppgir stk/m² som varierer med platebredde, Norgips en c/c-avstandsregel uten vegg/tak-forskjell). Kontroller alltid valgt platesystems monteringsanvisning.' },
        { id: 'festetetthetIndre', label: 'Festetetthet — indre lag ved 2 lag (stk/m²)', type: 'number', placeholder: '6', default: 6, advanced: true },
        { id: 'skruelengdeLag1', label: 'Skruelengde lag 1 (mm)', type: 'number', placeholder: '32', default: 32, advanced: true,
          hint: 'Foreslås automatisk fra platetype+tykkelse+underlag+lag (verifisert produsentdata der tilgjengelig), men kan overstyres. Enkelt lag, eller indre lag ved 2 lag.' },
        { id: 'skruelengdeLag2', label: 'Skruelengde lag 2 / ytterste (mm)', type: 'number', placeholder: '41', default: 41, advanced: true,
          hint: 'Foreslås automatisk ved 2 lag — må være lang nok til å gå gjennom begge platelagene. Kan overstyres.' },
        { id: 'svinnPlater', label: 'Svinn/kapp plater (%)', type: 'number', placeholder: '10', default: 10, advanced: true },
        { id: 'svinnFestemidler', label: 'Tillegg festemidler (%)', type: 'number', placeholder: '5', default: 5, advanced: true },
        { id: 'tapeTillegg', label: 'Tape — tillegg for hjørner/kanter (%, estimert)', type: 'number', placeholder: '20', default: 20, advanced: true,
          hint: 'Beregnes fra faktiske skjøter mellom platene (kolonner/rader), pluss et estimert tillegg for innv./utv. hjørner og kanter. Juster etter erfaring.' },
        { id: 'sparkelKgPerLmTape', label: 'Sparkel — forbruk per lm tape (kg/lm, estimert)', type: 'number', placeholder: '0.3', default: 0.3, advanced: true,
          hint: 'Grovt estimat knyttet til skjøtelengde, ikke totalt flateareal — varierer med skjøtemetode og overflatekrav.' },
        { id: 'tapeInnerste', label: 'Skjøtebehandle innerste lag også (sjeldent)', type: 'checkbox', default: false, advanced: true,
          hint: 'Standard er kun ytterste/synlige lag tapet/sparklet. Kryss av kun hvis valgt system faktisk krever behandling av indre lag også.' }
      ],
      tak: [
        { id: 'flatebredde', label: 'Taklengde (m)', type: 'number', placeholder: '4.8' },
        { id: 'flatehoyde', label: 'Takbredde (m)', type: 'number', placeholder: '3.6' },
        { id: 'plateformat', label: 'Platevalg (forhåndsvalg)', type: 'select', options: GIPS_PLATE_OPTIONS.map(function(o) {
          return { value: o.value, label: o.label };
        }), default: '1200x2400' },
        { id: 'tykkelse', label: 'Platetykkelse (mm)', type: 'select', options: [
          { value: '9.5', label: '9,5 mm' },
          { value: '12.5', label: '12,5 mm' },
          { value: '15', label: '15 mm' }
        ], default: '12.5' },
        { id: 'platetype', label: 'Platetype', type: 'select', options: [
          { value: 'standard', label: 'Standard' },
          { value: 'brann', label: 'Brannplate' },
          { value: 'vatrom', label: 'Fuktbestandig / våtromsplate' }
        ], default: 'standard' },
        { id: 'lag', label: 'Antall lag', type: 'select', options: [
          { value: '1', label: '1 lag' },
          { value: '2', label: '2 lag' }
        ], default: '1', hint: 'Ved 2 lag forutsettes forskjøvede skjøter mellom platelagene. Kontroller valgt brann-/lyd-/platesystem.' },
        { id: 'underlag', label: 'Underlag', type: 'select', options: [
          { value: 'tre', label: 'Tre' },
          { value: 'staal', label: 'Stål' }
        ], default: 'tre' },
        { id: 'orientering', label: 'Plateretning', type: 'select', options: [
          { value: 'staaende', label: 'Langs takbredden' },
          { value: 'liggende', label: 'Langs taklengden' }
        ], default: 'staaende', advanced: true },
        { id: 'platebredde', label: 'Platebredde (m)', type: 'number', placeholder: '1.2', default: 1.2, advanced: true,
          hint: 'Fylles automatisk fra platevalg, men kan overstyres fritt.' },
        { id: 'platelengde', label: 'Platelengde (m)', type: 'number', placeholder: '2.4', default: 2.4, advanced: true,
          hint: 'Fylles automatisk fra platevalg, men kan overstyres fritt.' },
        { id: 'apningerM2', label: 'Åpninger (m², kun informasjon)', type: 'number', placeholder: '0', default: 0, advanced: true,
          hint: 'Påvirker kun nettoareal-informasjonen, IKKE det geometriske platetallet — platene må uansett skjæres til rundt åpninger, og gir normalt like mye kapp som om åpningen ikke fantes.' },
        { id: 'festetetthetHoved', label: 'Festetetthet — enkelt/ytterste lag (stk/m²)', type: 'number', placeholder: '25', default: 25, advanced: true,
          hint: 'Kalkulasjonspreset, ikke en produsentfasit — Gyproc og Norgips bruker ulike prinsipper, og Gyproc oppgir faktisk lavere tetthet på tak enn vegg for 1200mm-plater (drevet av platebredde, ikke plassering). Kontroller alltid valgt platesystems monteringsanvisning.' },
        { id: 'festetetthetIndre', label: 'Festetetthet — indre lag ved 2 lag (stk/m²)', type: 'number', placeholder: '6', default: 6, advanced: true },
        { id: 'skruelengdeLag1', label: 'Skruelengde lag 1 (mm)', type: 'number', placeholder: '32', default: 32, advanced: true,
          hint: 'Foreslås automatisk fra platetype+tykkelse+underlag+lag (verifisert produsentdata der tilgjengelig), men kan overstyres. Enkelt lag, eller indre lag ved 2 lag.' },
        { id: 'skruelengdeLag2', label: 'Skruelengde lag 2 / ytterste (mm)', type: 'number', placeholder: '41', default: 41, advanced: true,
          hint: 'Foreslås automatisk ved 2 lag — må være lang nok til å gå gjennom begge platelagene. Kan overstyres.' },
        { id: 'svinnPlater', label: 'Svinn/kapp plater (%)', type: 'number', placeholder: '10', default: 10, advanced: true },
        { id: 'svinnFestemidler', label: 'Tillegg festemidler (%)', type: 'number', placeholder: '5', default: 5, advanced: true },
        { id: 'tapeTillegg', label: 'Tape — tillegg for hjørner/kanter (%, estimert)', type: 'number', placeholder: '20', default: 20, advanced: true,
          hint: 'Beregnes fra faktiske skjøter mellom platene, pluss estimert tillegg for kanter.' },
        { id: 'sparkelKgPerLmTape', label: 'Sparkel — forbruk per lm tape (kg/lm, estimert)', type: 'number', placeholder: '0.3', default: 0.3, advanced: true },
        { id: 'tapeInnerste', label: 'Skjøtebehandle innerste lag også (sjeldent)', type: 'checkbox', default: false, advanced: true,
          hint: 'Standard er kun ytterste/synlige lag tapet/sparklet. Kryss av kun hvis valgt system faktisk krever behandling av indre lag også.' }
      ]
    },
    customRender: true,
    calc: function(v) {
      var breddeM = Number(v.flatebredde) || 0;
      var hoydeM = Number(v.flatehoyde) || 0;
      var platebreddeM = Number(v.platebredde) || 0;
      var platelengdeM = Number(v.platelengde) || 0;
      if (!(breddeM > 0) || !(hoydeM > 0) || !(platebreddeM > 0) || !(platelengdeM > 0)) return null;

      var jobb = v.jobb || 'vegg';
      var staaende = v.orientering !== 'liggende';
      var lag = Number(v.lag) || 1;
      var svinnPlater = Number(v.svinnPlater) || 0;
      var svinnFeste = Number(v.svinnFestemidler) || 0;
      var apningerM2 = Number(v.apningerM2) || 0;

      var areal = breddeM * hoydeM;
      var geo = gipsPlateGeometri(breddeM, hoydeM, platebreddeM, platelengdeM, staaende);
      var platerGeometriskTotalt = geo.platerPerLag * lag;
      var platerBestilling = Math.ceil(platerGeometriskTotalt * (1 + svinnPlater / 100));

      var flateLabel = jobb === 'tak' ? 'Himlingsflate' : 'Flate';
      var results = [];
      var details = [];

      details.push({ label: flateLabel + ' (' + breddeM + ' × ' + hoydeM + ' m)', value: Math.round(areal * 100) / 100, unit: 'm²' });
      if (apningerM2 > 0) {
        details.push({ label: 'Nettoareal — info (fratrukket åpninger, påvirker IKKE platetallet)', value: Math.max(0, Math.round((areal - apningerM2) * 100) / 100), unit: 'm²' });
      }

      results.push({ primary: true, text: platerBestilling + ' gipsplater' });
      details.push({ label: 'Gipsplater — geometrisk (' + geo.kolonner + ' kolonner × ' + geo.rader + ' rader × ' + lag + ' lag)', value: platerGeometriskTotalt, unit: 'stk' });
      details.push({ label: 'Plateformat', value: (platebreddeM * 1000) + ' × ' + (platelengdeM * 1000) + ' mm, ' + (v.tykkelse || '12.5') + ' mm', unit: '' });

      var platetypeLabel = { standard: 'Standard', brann: 'Brannplate', vatrom: 'Fuktbestandig/våtromsplate' }[v.platetype] || 'Standard';
      var plateformatOpt = GIPS_PLATE_OPTIONS.filter(function(o) { return o.value === v.plateformat; })[0];
      var plateformatLabel = plateformatOpt ? plateformatOpt.label : (platebreddeM * 1000) + ' × ' + (platelengdeM * 1000) + ' mm';
      results.push({ secondary: true, text: plateformatLabel + ' · ' + platetypeLabel + ' · ' + (v.tykkelse || '12.5') + ' mm · inkl. ' + svinnPlater + '% svinn' });

      // Festemidler — to lag gir to forskjellige skruebehov (indre lag festes
      // gjennom ett platelag, ytterste lag må gå gjennom begge). Underlag
      // avgjør skruetype (tre/stål) og skrueLENGDE-preset — IKKE festetetthet,
      // som forblir egne, sentrale systemverdier uavhengig av tre/stål.
      var skruetype = v.underlag === 'staal' ? 'Gipsskrue for stål' : 'Gipsskrue for tre';
      var tetthetHoved = Number(v.festetetthetHoved) || 0;
      var tetthetIndre = Number(v.festetetthetIndre) || 0;

      // Skruelengde: bruker feltverdien hvis satt (auto-fylt fra GIPS_SKRUE_TABELL
      // ved bytte av platetype/tykkelse/underlag/lag, se onGipsSkrueRelevantChange,
      // men fritt overstyrbar). Er feltet tomt (ingen verifisert preset funnet
      // for kombinasjonen), vises en kontrollhenvisning i stedet for å gjette.
      var skruelengdeLag1Raw = Number(v.skruelengdeLag1);
      var skruelengdeLag2Raw = Number(v.skruelengdeLag2);
      var lag1Kjent = skruelengdeLag1Raw > 0;
      var lag2Kjent = skruelengdeLag2Raw > 0;
      var lag1Tekst = lag1Kjent ? (skruelengdeLag1Raw + ' mm') : 'lengde ukjent — kontroller produsentens skrueanvisning';
      var lag2Tekst = lag2Kjent ? (skruelengdeLag2Raw + ' mm') : 'lengde ukjent — kontroller produsentens skrueanvisning';

      // Udelelige bestillingsenheter (skruer) skal ALLTID rundes opp (Math.ceil),
      // aldri Math.round — 230,4 skruer er i praksis 231, ikke 230. Tillegg/
      // svinn beregnes dessuten separat per lag (ulik skruelengde), ikke på en
      // samlet totalsum, siden lag 1 og lag 2 er to forskjellige varelinjer.
      if (lag === 2) {
        var skruerLag1Raw = areal * tetthetIndre;
        var skruerLag2Raw = areal * tetthetHoved;
        var lag1Bestilling = Math.ceil(skruerLag1Raw * (1 + svinnFeste / 100));
        var lag2Bestilling = Math.ceil(skruerLag2Raw * (1 + svinnFeste / 100));
        results.push({ primary: true, text: 'ca. ' + lag1Bestilling + ' skruer — lag 1 (indre)' });
        results.push({ primary: true, text: 'ca. ' + lag2Bestilling + ' skruer — lag 2 (ytterste)' });
        details.push({ label: 'Festemidler lag 1 (indre) — geometrisk behov — ' + skruetype + ', ' + lag1Tekst, value: Math.ceil(skruerLag1Raw), unit: 'stk (' + tetthetIndre + '/m²)' });
        details.push({ label: 'Festemidler lag 1 (indre) — bestilling inkl. tillegg', value: lag1Bestilling, unit: 'stk' });
        details.push({ label: 'Festemidler lag 2 (ytterste) — geometrisk behov — ' + skruetype + ', ' + lag2Tekst, value: Math.ceil(skruerLag2Raw), unit: 'stk (' + tetthetHoved + '/m²)' });
        details.push({ label: 'Festemidler lag 2 (ytterste) — bestilling inkl. tillegg', value: lag2Bestilling, unit: 'stk' });
        details.push({ label: 'Festemidler totalt (begge lag, bestilling)', value: lag1Bestilling + lag2Bestilling, unit: 'stk' });
      } else {
        var skruerRaw = areal * tetthetHoved;
        var skruerBestilling = Math.ceil(skruerRaw * (1 + svinnFeste / 100));
        results.push({ primary: true, text: 'ca. ' + skruerBestilling + ' festemidler' });
        details.push({ label: 'Festemidler — geometrisk behov — ' + skruetype + ', ' + lag1Tekst, value: Math.ceil(skruerRaw), unit: 'stk (' + tetthetHoved + '/m²)' });
        details.push({ label: 'Festemidler — bestilling inkl. tillegg (estimert festemiddelbehov)', value: skruerBestilling, unit: 'stk' });
      }

      // Skjøtebehandling — estimert fra faktisk platelayout (skjøter mellom
      // kolonner og rader), ikke en fast lm/m²- eller kg/m²-antakelse løsrevet
      // fra geometrien. Fortsatt et estimat — fanger ikke opp innv./utv.
      // hjørner presist, derfor tapeTillegg-feltet. Standard er kun ytterste/
      // synlige lag (forutsetter forskjøvede skjøter mellom platelag) — kan
      // slås på for indre lag også via "tapeInnerste".
      var skjoterLmGeometrisk = Math.max(0, (geo.kolonner - 1) * hoydeM + (geo.rader - 1) * breddeM);
      var tapeTillegg = Number(v.tapeTillegg) || 0;
      var lagMedSkjotebehandling = (lag === 2 && v.tapeInnerste) ? 2 : 1;
      var tapeLm = ceil1(skjoterLmGeometrisk * (1 + tapeTillegg / 100)) * lagMedSkjotebehandling;
      var sparkelKgPerLmTape = Number(v.sparkelKgPerLmTape) || 0;
      var sparkelKg = Math.round(tapeLm * sparkelKgPerLmTape * 10) / 10;
      results.push({ primary: true, text: tapeLm + ' lm papirremse/tape' });
      results.push({ primary: true, text: sparkelKg + ' kg sparkel' });
      details.push({ label: 'Skjøtelengde — beregningsgrunnlag' + (lagMedSkjotebehandling === 2 ? ' (begge lag)' : ''), value: Math.round(skjoterLmGeometrisk * 10) / 10, unit: 'lm' });

      return results.concat(details);
    },
    renderResult: renderCompactMcResult
  },

  isolasjon: {
    label: 'Isolasjon',
    icon: '',
    desc: 'Beregn isolasjonsmengde etter bransjestandard prinsipp: netto areal × (1 + svinn). Kalkulatoren regner mengden av tykkelsen du velger — den avgjør ikke om tykkelsen er byggteknisk riktig for konstruksjonen.',
    fields: [
      { id: 'jobb', label: 'Bruksområde', type: 'select', options: [
        { value: 'vegg', label: 'Vegg' },
        { value: 'tak', label: 'Tak / himling' },
        { value: 'bjelkelag', label: 'Etasjeskille / bjelkelag' },
        { value: 'grunn', label: 'Gulv mot grunn' }
      ], default: 'vegg' }
    ],
    jobFields: {
      vegg: [
        { id: 'areal', label: 'Areal (m²)', type: 'number', placeholder: '30' },
        { id: 'isolasjonstype', label: 'Isolasjonstype', type: 'select', options: [
          { value: 'mineralull', label: 'Mineralull' }, { value: 'trykkfast', label: 'Trykkfast plate' }
        ], default: 'mineralull' },
        { id: 'tykkelse', label: 'Tykkelse (mm)', type: 'number', placeholder: '150', default: 150,
          hint: 'Vanlige mål: 50, 70, 100, 150, 200, 250, 300 mm — fritt redigerbart, ikke låst til en fasit.' },
        { id: 'm2perPakke', label: 'm² per pakke (0 = vis ikke pakkeantall)', type: 'number', placeholder: '5.76', default: 5.76,
          hint: 'Varierer sterkt med produsent, produkt og tykkelse — sett inn faktisk verdi fra valgt produkts emballasje.' },
        { id: 'svinn', label: 'Svinn (%)', type: 'number', placeholder: '5', default: 5 },
        { id: 'beregnVindsperre', label: 'Beregn vindsperre', type: 'checkbox', default: false,
          hint: 'Konstruksjonsoppbygning, ikke selve isolasjonsmengden — spesielt ved rehabilitering er dette ikke alltid riktig å anta. Av som standard.' },
        { id: 'vindsperreSvinn', label: 'Vindsperre — svinn/omlegg (%)', type: 'number', placeholder: '10', default: 10, advanced: true,
          hint: 'Generelt estimat, ikke produsentdata — kun brukt når «Beregn vindsperre» er aktivert.' },
        { id: 'vindsperreRullM2', label: 'Vindsperre — effektiv dekning per rull (m²)', type: 'number', placeholder: '37.5', default: 37.5, advanced: true,
          hint: 'Produktavhengig, ikke verifisert mot et bestemt produkt — sett inn faktisk verdi fra valgt rull. Kun brukt når «Beregn vindsperre» er aktivert.' }
      ],
      tak: [
        { id: 'areal', label: 'Areal (m²)', type: 'number', placeholder: '30' },
        { id: 'isolasjonstype', label: 'Isolasjonstype', type: 'select', options: [
          { value: 'mineralull', label: 'Mineralull' }, { value: 'trykkfast', label: 'Trykkfast plate' }
        ], default: 'mineralull' },
        { id: 'tykkelse', label: 'Tykkelse (mm)', type: 'number', placeholder: '200', default: 200,
          hint: 'Vanlige mål: 50, 70, 100, 150, 200, 250, 300 mm — fritt redigerbart.' },
        { id: 'm2perPakke', label: 'm² per pakke (0 = vis ikke pakkeantall)', type: 'number', placeholder: '5.76', default: 5.76,
          hint: 'Varierer sterkt med produsent, produkt og tykkelse — sett inn faktisk verdi.' },
        { id: 'svinn', label: 'Svinn (%)', type: 'number', placeholder: '5', default: 5 },
        { id: 'beregnDampsperre', label: 'Beregn dampsperre', type: 'checkbox', default: false,
          hint: 'Konstruksjonsoppbygning, ikke selve isolasjonsmengden. Av som standard.' },
        { id: 'dampsperreSvinn', label: 'Dampsperre — svinn/omlegg (%)', type: 'number', placeholder: '15', default: 15, advanced: true,
          hint: 'Generelt estimat, ikke produsentdata — kun brukt når «Beregn dampsperre» er aktivert.' }
      ],
      bjelkelag: [
        { id: 'areal', label: 'Areal (m²)', type: 'number', placeholder: '30' },
        { id: 'isolasjonstype', label: 'Isolasjonstype', type: 'select', options: [
          { value: 'mineralull', label: 'Mineralull' }, { value: 'trykkfast', label: 'Trykkfast plate' }
        ], default: 'mineralull' },
        { id: 'tykkelse', label: 'Tykkelse (mm)', type: 'number', placeholder: '200', default: 200,
          hint: 'Vanlige mål: 50, 70, 100, 150, 200, 250, 300 mm — fritt redigerbart.' },
        { id: 'm2perPakke', label: 'm² per pakke (0 = vis ikke pakkeantall)', type: 'number', placeholder: '5.76', default: 5.76,
          hint: 'Varierer sterkt med produsent, produkt og tykkelse — sett inn faktisk verdi.' },
        { id: 'svinn', label: 'Svinn (%)', type: 'number', placeholder: '5', default: 5 }
      ],
      grunn: [
        { id: 'areal', label: 'Areal (m²)', type: 'number', placeholder: '30' },
        { id: 'isolasjonstype', label: 'Isolasjonstype', type: 'select', options: [
          { value: 'trykkfast', label: 'Trykkfast plate' }, { value: 'mineralull', label: 'Mineralull' }
        ], default: 'trykkfast' },
        { id: 'tykkelse', label: 'Tykkelse (mm)', type: 'number', placeholder: '100', default: 100,
          hint: 'Kun et utgangspunkt, ikke en fasit for gulv mot grunn — velg tykkelse ut fra konstruksjonen.' },
        { id: 'm2perPakke', label: 'm² per pakke (0 = vis ikke pakkeantall)', type: 'number', placeholder: '5.76', default: 5.76,
          hint: 'Varierer sterkt med produsent, produkt og tykkelse — sett inn faktisk verdi.' },
        { id: 'svinn', label: 'Svinn (%)', type: 'number', placeholder: '5', default: 5 }
      ]
    },
    calc: function(v) {
      var areal = Number(v.areal) || 0;
      if (!(areal > 0)) return null;

      var jobb = v.jobb || 'vegg';
      var svinn = Number(v.svinn) || 0;
      var tykkelse = Number(v.tykkelse) || 0;
      var m2perPakke = Number(v.m2perPakke) || 0;
      var typeLabel = v.isolasjonstype === 'trykkfast' ? 'Trykkfast plate' : 'Mineralull';

      var arealBrutto = areal * (1 + svinn / 100);

      var results = [
        { label: 'Isolasjon — netto behov', value: Math.round(areal * 100) / 100, unit: 'm²' },
        { label: 'Isolasjon — bestilling inkl. svinn', value: Math.round(arealBrutto * 100) / 100, unit: 'm²' }
      ];

      if (m2perPakke > 0) {
        var antPakker = Math.ceil(arealBrutto / m2perPakke);
        results.push({ label: 'Pakningsinnhold', value: m2perPakke, unit: 'm²/pk' });
        results.push({ label: 'Bestilling', value: antPakker, unit: 'pakker' });
      }

      results.push({ label: 'Valgt tykkelse', value: tykkelse, unit: 'mm' });
      results.push({ label: 'Isolasjonstype', value: typeLabel, unit: '' });

      // Vindsperre/dampsperre er en konstruksjonsoppbygning, ikke selve
      // isolasjonsmengden — kun med hvis brukeren eksplisitt krysser av.
      // Svinn/rullstørrelse er redigerbare felt under «Flere valg», ikke
      // skjulte konstanter — ingen av tallene er produsentverifisert.
      if (jobb === 'vegg' && v.beregnVindsperre) {
        var vindsperreSvinn = Number(v.vindsperreSvinn) || 0;
        var vindsperreRullM2 = Number(v.vindsperreRullM2) || 0;
        var vindsperreM2 = Math.ceil(areal * (1 + vindsperreSvinn / 100));
        results.push({ label: 'Vindsperre (valgfritt)', value: vindsperreM2, unit: 'm²' });
        if (vindsperreRullM2 > 0) {
          results.push({ label: 'Vindsperreruller (valgfritt)', value: Math.ceil(vindsperreM2 / vindsperreRullM2), unit: 'rull à ' + vindsperreRullM2 + ' m²' });
        }
      }
      if (jobb === 'tak' && v.beregnDampsperre) {
        var dampsperreSvinn = Number(v.dampsperreSvinn) || 0;
        var dampsperreM2 = Math.ceil(areal * (1 + dampsperreSvinn / 100));
        results.push({ label: 'Dampsperre (valgfritt)', value: dampsperreM2, unit: 'm²' });
      }

      return results;
    }
  },

  gulv: {
    label: 'Gulv',
    icon: '',
    desc: 'Beregn gulvmengde etter bransjestandard prinsipp: netto areal × (1 + svinn). Kalkulatoren beregner materialmengde. Kontroller produsentens krav til svinn, underlag, fuktsperre og leggemetode.',
    customRender: true,
    fields: [
      { id: 'lengde', label: 'Romlengde (m)', type: 'number', placeholder: '5' },
      { id: 'bredde', label: 'Rombredde (m)', type: 'number', placeholder: '4' },
      { id: 'gulvtype', label: 'Gulvtype', type: 'select', options: [
        { value: 'parkett', label: 'Parkett' },
        { value: 'laminat', label: 'Laminat' },
        { value: 'heltre', label: 'Heltregulv' },
        { value: 'vinylplank', label: 'Vinylplank' }
      ], default: 'parkett' },
      { id: 'leggemonster', label: 'Leggemønster', type: 'select', options: [
        { value: 'rett', label: 'Rett' },
        { value: 'diagonal', label: 'Diagonal' },
        { value: 'fiskebein', label: 'Fiskebein / annet' }
      ], default: 'rett', hint: 'Brukes kun til å foreslå en svinnprosent — ingen mønstergeometri beregnes.' },
      { id: 'm2perPakke', label: 'Pakningsinnhold (m²)', type: 'number', placeholder: 'Les av pakken',
        hint: 'Står på pakken/emballasjen — varierer sterkt med produsent og produkt, ingen god universell default finnes. Uten denne vises bestilling kun i m².' },
      { id: 'svinn', label: 'Svinn/kapp (%)', type: 'number', placeholder: '10', default: 10, advanced: true,
        hint: 'Tarkett-verifisert: ca. 10 % ved rett legging, ca. 15 % ved mønster/diagonal. Foreslås automatisk ut fra valgt leggemønster, men fritt overstyrbar.' },
      { id: 'bordbredde', label: 'Bordbredde heltregulv (mm, valgfritt)', type: 'number', placeholder: '120', default: 120, advanced: true,
        hint: 'Kun brukt til en estimert løpemeter-linje ved heltregulv — bestillingen baseres fortsatt på m² (som er normal salgsenhet).' },
      { id: 'inkluderUnderlag', label: 'Ta med gulvunderlag', type: 'checkbox', default: false, advanced: true,
        hint: 'Ikke alle gulv trenger samme underlag — av som standard, ikke antatt automatisk.' },
      { id: 'svinnUnderlag', label: 'Underlag — svinn (%)', type: 'number', placeholder: '5', default: 5, advanced: true },
      { id: 'underlagM2perPakke', label: 'Underlag — m² per pakke (0 = vis ikke pakkeantall)', type: 'number', placeholder: '10', default: 10, advanced: true },
      { id: 'inkluderFuktsperre', label: 'Ta med fuktsperre', type: 'checkbox', default: false, advanced: true,
        hint: 'Ikke koblet automatisk til gulvtype — av som standard.' },
      { id: 'svinnFuktsperre', label: 'Fuktsperre — svinn/omlegg (%)', type: 'number', placeholder: '15', default: 15, advanced: true },
      { id: 'inkluderFotlist', label: 'Ta med fotlister', type: 'checkbox', default: false, advanced: true,
        hint: 'Bruker samme fotlistberegning som Listverk-kalkulatoren — ingen egen, duplisert formel.' },
      { id: 'dorapningBredde', label: 'Total bredde på døråpninger (m, kun for fotlist)', type: 'number', placeholder: '0.9', default: 0, advanced: true,
        hint: 'Total bredde, ikke antall dører × en antatt dørbredde — unngår en skjult antakelse.' }
    ],
    calc: function(v) {
      var lengde = Number(v.lengde) || 0;
      var bredde = Number(v.bredde) || 0;
      if (!(lengde > 0) || !(bredde > 0)) return null;

      var areal = lengde * bredde;
      var svinn = Number(v.svinn) || 0;
      var bestilling = areal * (1 + svinn / 100);
      var bestillingRundet = Math.round(bestilling * 100) / 100;
      var m2perPakke = Number(v.m2perPakke) || 0;
      var gulvtypeLabel = { parkett: 'Parkett', laminat: 'Laminat', heltre: 'Heltregulv', vinylplank: 'Vinylplank' }[v.gulvtype] || 'Parkett';
      var monsterLabel = { rett: 'Rett', diagonal: 'Diagonal', fiskebein: 'Fiskebein / annet' }[v.leggemonster] || 'Rett';

      var results = [];
      var details = [
        { label: 'Gulvareal — netto', value: Math.round(areal * 100) / 100, unit: 'm²' },
        { label: 'Gulvareal — bestilling inkl. svinn', value: bestillingRundet, unit: 'm²' },
        { label: 'Svinn/kapp', value: svinn, unit: '%' }
      ];

      // Pakketall er hovedresultatet når pakningsinnhold faktisk er oppgitt —
      // uten det er m²-bestillingen det eneste reelle kjøpstallet. Ikke vis
      // et pakketall basert på en antatt standardverdi.
      if (m2perPakke > 0) {
        var antPakker = Math.ceil(bestilling / m2perPakke);
        results.push({ primary: true, text: antPakker + ' pakker gulv' });
        results.push({ secondary: true, text: 'Gulv – ' + bestillingRundet + ' m² bestilling' });
        details.push({ label: 'Pakningsinnhold', value: m2perPakke, unit: 'm²/pk' });
        details.push({ label: 'Bestilling', value: antPakker, unit: 'pakker' });
      } else {
        results.push({ primary: true, text: bestillingRundet + ' m² gulv' });
      }

      results.push({ secondary: true, text: gulvtypeLabel + ' · ' + monsterLabel + ' legging · inkl. ' + svinn + '% svinn' });
      details.push({ label: 'Leggemønster', value: monsterLabel, unit: '' });

      // Ren informasjonslinje for alle andre gulvtyper (ingen bord-/kapp-
      // optimalisering) — men når brukeren aktivt har valgt Heltregulv er
      // estimert løpemeter et reelt kjøpsrelevant tall, derfor primærresultat
      // her. Selve beregningen er uendret, kun hvor tallet vises.
      var bordbredde = Number(v.bordbredde) || 0;
      if (v.gulvtype === 'heltre' && bordbredde > 0) {
        var estimertLm = Math.round((areal * 1000 / bordbredde) * 10) / 10;
        results.push({ primary: true, text: 'ca. ' + estimertLm + ' lm heltregulv' });
      }

      if (v.inkluderUnderlag) {
        var svinnUnderlag = Number(v.svinnUnderlag) || 0;
        var underlagBestilling = areal * (1 + svinnUnderlag / 100);
        var underlagBestillingRundet = Math.round(underlagBestilling * 100) / 100;
        var underlagM2perPakke = Number(v.underlagM2perPakke) || 0;
        if (underlagM2perPakke > 0) {
          var underlagPakker = Math.ceil(underlagBestilling / underlagM2perPakke);
          results.push({ primary: true, text: underlagPakker + ' pakker underlag' });
          results.push({ secondary: true, text: 'Underlag – ' + underlagBestillingRundet + ' m² bestilling' });
          details.push({ label: 'Gulvunderlag — bestilling', value: underlagPakker, unit: 'pakker' });
        } else {
          results.push({ primary: true, text: underlagBestillingRundet + ' m² underlag' });
        }
        details.push({ label: 'Gulvunderlag — bestilling inkl. svinn', value: underlagBestillingRundet, unit: 'm²' });
      }

      if (v.inkluderFuktsperre) {
        var svinnFukt = Number(v.svinnFuktsperre) || 0;
        var fuktsperreM2 = Math.ceil(areal * (1 + svinnFukt / 100));
        results.push({ primary: true, text: fuktsperreM2 + ' m² fuktsperre' });
        details.push({ label: 'Dampsperre/fuktsperre — bestilling inkl. svinn/omlegg', value: fuktsperreM2, unit: 'm²' });
      }

      if (v.inkluderFotlist) {
        var omkrets = (lengde + bredde) * 2;
        var dorapningBredde = Number(v.dorapningBredde) || 0;
        var fotlistBestilling = calcFotlist(omkrets, dorapningBredde, svinn).bestilling;
        results.push({ primary: true, text: fotlistBestilling + ' lm fotlister' });
        details.push({ label: 'Fotlister (valgfritt)', value: fotlistBestilling, unit: 'lm' });
      }

      return results.concat(details);
    },
    renderResult: renderCompactMcResult
  },

  tak: {
    label: 'Tak',
    icon: '',
    desc: 'Beregn materialbehov for taktekking. Kalkulatoren beregner materialmengde — ikke om lekting, undertak, platevalg eller sperredimensjon er konstruksjonsmessig riktig for din takkonstruksjon, snø-/vindlast eller lokale krav.',
    customRender: true,
    fields: [
      { id: 'jobb', label: 'Tekkingstype', type: 'select', options: [
        { value: 'shingel', label: 'Shingel' },
        { value: 'staaltak', label: 'Ståltak (profilerte plater)' },
        { value: 'takstein', label: 'Takstein' },
        { value: 'takpapp', label: 'Takpapp' }
      ], default: 'shingel' },
      { id: 'taktype', label: 'Taktype', type: 'select', options: [
        { value: 'pulttak', label: 'Pulttak (1 takflate)' },
        { value: 'saltak', label: 'Saltak (2 takflater)' }
      ], default: 'saltak' },
      { id: 'taklengde', label: 'Taklengde langs raft/møne (m)', type: 'number', placeholder: '8',
        hint: 'Faktisk takflatemål inkl. overheng — IKKE bygningens yttermål.' },
      { id: 'skralengde', label: 'Skrålengde raft–møne (m)', type: 'number', placeholder: '4',
        hint: 'Faktisk skrå takflatelengde inkl. overheng ved raft — ikke bygningens takhøyde. Ved saltak antas lik skrålengde på BEGGE sider — kontroller at det stemmer for din konstruksjon.' }
    ],
    // Shingel, ståltak, takstein og takpapp er fire forskjellige oppbygninger,
    // ikke variasjoner av samme formel — hver har eget felt-sett.
    jobFields: {
      shingel: [
        { id: 'shingelUndertak', label: 'Fast undertak', type: 'select', options: [
          { value: 'eksisterende', label: 'Eksisterende' },
          { value: 'nytt', label: 'Nytt' }
        ], default: 'eksisterende' },
        { id: 'inkluderUnderlagspapp', label: 'Ta med underlagsbelegg', type: 'checkbox', default: true,
          hint: 'Behovet for underlagsbelegg under shingel avhenger av takfall, værbelastning og eksisterende tekking — kalkulatoren har ikke nok informasjon til å avgjøre dette automatisk. Slå av hvis jobben ikke skal ha det.' },
        { id: 'undertaksmateriale', label: 'Nytt fast undertak — materiale', type: 'select', options: [
          { value: 'plate', label: 'Plateunderlag' },
          { value: 'rupanel', label: 'Rupanel' }
        ], default: 'plate', advanced: true, hint: 'Kun brukt ved «Nytt» fast undertak. Låser ikke til ett bestemt produkt.' },
        { id: 'undertaksplateM2', label: 'Plateunderlag — areal per plate (m²)', type: 'number', placeholder: '2.98', default: 2.98, advanced: true,
          hint: 'Kun brukt ved plateunderlag. Produktavhengig.' },
        { id: 'rupanelDekkbredde', label: 'Rupanel — dekkbredde (mm)', type: 'number', placeholder: '148', default: 148, advanced: true,
          hint: 'Kun brukt ved rupanel. Produktavhengig.' },
        { id: 'shingelPakkeM2', label: 'Shingel — dekning per pakke (m²)', type: 'number', placeholder: '3', default: 3, advanced: true,
          hint: 'Produktdata — varierer mellom fabrikat, men rimelig robust default på tvers av vanlige produkter.' },
        { id: 'underlagspappRullM2', label: 'Effektiv dekning per rull (m²)', type: 'number', placeholder: 'Les av produktet', advanced: true,
          hint: 'Bruk effektiv dekning etter omlegg, ikke rullens bruttoareal. Uten denne vises behovet i m² i stedet for antall ruller.' },
        { id: 'shingelSpikerPerM2', label: 'Shingelspiker per m²', type: 'number', placeholder: '35', default: 35, advanced: true,
          hint: 'Verifisert mot Mataki og IKO sine monteringsanvisninger (~35 stk/m²). Juster ved avvikende produkt/nagleplan.' },
        { id: 'moneStrimmelDekningM', label: 'Møne — dekning per pakke (lm)', type: 'number', placeholder: 'Les av pakken', advanced: true,
          hint: 'Produktdata varierer betydelig (Mataki ca. 7,2–7,5 lm/pk, Icopal ca. 10 lm/pk for enkelte produkter). Uten denne vises mønebehovet i lm i stedet for antall pakker. Kun brukt ved saltak.' },
        { id: 'svinnTekking', label: 'Svinn tekking (%)', type: 'number', placeholder: '10', default: 10, advanced: true },
        { id: 'svinnUndertak', label: 'Svinn nytt fast undertak (%)', type: 'number', placeholder: '10', default: 10, advanced: true,
          hint: 'Gjelder kun det nye plate-/rupanelundertaket, ikke underlagsbelegget (som bruker «Svinn tekking»).' },
        { id: 'svinnFestemidler', label: 'Tillegg festemidler (%)', type: 'number', placeholder: '5', default: 5, advanced: true },
        { id: 'moneSvinn', label: 'Svinn/overlapp møne (%)', type: 'number', placeholder: '10', default: 10, advanced: true }
      ],
      staaltak: [
        { id: 'staalDekkbredde', label: 'Effektiv dekkbredde per plate (mm)', type: 'number', placeholder: '1050', default: 1050,
          hint: 'Produktavhengig — sjekk fabrikat. Forutsetter hele plater i skråretningen (raft til møne i ett stykke).' },
        { id: 'staalPlatelengde', label: 'Platelengde (m)', type: 'number', placeholder: 'Minst skrålengden',
          hint: 'Må være minst like lang som skrålengden — kalkulatoren støtter foreløpig kun plater i ett stykke fra raft til møne, ikke skjøting.' },
        { id: 'staalBrukerLekter', label: 'Ta med lekter', type: 'checkbox', default: false,
          hint: 'Avgjør om en hel materialgruppe (lekter under platene) skal beregnes.' },
        { id: 'staalLekteCC', label: 'Lekte c/c (mm)', type: 'number', placeholder: '600', default: 600, advanced: true },
        { id: 'svinnLekter', label: 'Svinn/kapp lekter (%)', type: 'number', placeholder: '10', default: 10, advanced: true },
        { id: 'staalFesteHoved', label: 'Takplateskruer — til lekter/bærekonstruksjon (stk/m²)', type: 'number', placeholder: '9', default: 9, advanced: true,
          hint: 'Produktavhengig — Verform oppgir 8–10 stk/m², Plannja ca. 8/m², Royal/Regent ca. 6–7/m² samlet. Sjekk valgt profils monteringsanvisning.' },
        { id: 'staalFesteBeslag', label: 'Skjøt-/beslagskruer — sideomlegg og topplater (stk/m²)', type: 'number', placeholder: '3', default: 3, advanced: true,
          hint: 'Egen skruetype fra takplateskruene — Verform oppgir 2–4 stk/m² til overlapp/beslag. Sjekk valgt profils monteringsanvisning.' },
        { id: 'svinnFestemidler', label: 'Tillegg festemidler (%)', type: 'number', placeholder: '5', default: 5, advanced: true },
        { id: 'moneBeslagLengde', label: 'Mønebeslag — lengde per stk (m)', type: 'number', placeholder: '2', default: 2, advanced: true,
          hint: 'Produktdata. Kun brukt ved saltak.' },
        { id: 'moneSvinn', label: 'Svinn/overlapp møne (%)', type: 'number', placeholder: '10', default: 10, advanced: true }
      ],
      takstein: [
        { id: 'steinPerM2', label: 'Stein per m²', type: 'number', placeholder: '10', default: 10,
          hint: 'Produktavhengig — varierer typisk mellom 9 og 13+ stein/m² avhengig av stein-/tegltype. Kontroller alltid mot valgt produkts tekniske blad, ikke en universell verdi.' },
        { id: 'lekteavstand', label: 'Lekte c/c (mm)', type: 'number', placeholder: '300', default: 300, advanced: true,
          hint: 'Produktdata fra steinleverandøren, ikke en fast standard.' },
        { id: 'sperreCC', label: 'Sløyfer c/c (mm)', type: 'number', placeholder: '600', default: 600, advanced: true,
          hint: 'Normalt lik sperreavstanden.' },
        { id: 'moneSteinPerLm', label: 'Mønestein/møneløsning per lm', type: 'number', placeholder: '3', default: 3, advanced: true,
          hint: 'Produktdata — effektiv dekning per stk. Kun brukt ved saltak.' },
        { id: 'svinnStein', label: 'Svinn stein (%)', type: 'number', placeholder: '5', default: 5, advanced: true },
        { id: 'svinnTrevirke', label: 'Svinn/kapp lekter og sløyfer (%)', type: 'number', placeholder: '10', default: 10, advanced: true },
        { id: 'moneSvinn', label: 'Svinn/overlapp mønestein (%)', type: 'number', placeholder: '5', default: 5, advanced: true }
      ],
      takpapp: [
        { id: 'pappUndertak', label: 'Fast undertak', type: 'select', options: [
          { value: 'eksisterende', label: 'Eksisterende' },
          { value: 'nytt', label: 'Nytt' }
        ], default: 'eksisterende' },
        { id: 'pappRullM2', label: 'Effektiv dekning per rull (m²)', type: 'number', placeholder: 'Les av produktet',
          hint: 'Bruk effektiv dekning etter omlegg, ikke rullens bruttoareal. Uten denne vises behovet i m² i stedet for antall ruller.' },
        { id: 'undertaksmateriale', label: 'Nytt fast undertak — materiale', type: 'select', options: [
          { value: 'plate', label: 'Plateunderlag' },
          { value: 'rupanel', label: 'Rupanel' }
        ], default: 'plate', advanced: true, hint: 'Kun brukt ved «Nytt» fast undertak. Låser ikke til ett bestemt produkt.' },
        { id: 'undertaksplateM2', label: 'Plateunderlag — areal per plate (m²)', type: 'number', placeholder: '2.98', default: 2.98, advanced: true,
          hint: 'Kun brukt ved plateunderlag. Produktavhengig.' },
        { id: 'rupanelDekkbredde', label: 'Rupanel — dekkbredde (mm)', type: 'number', placeholder: '148', default: 148, advanced: true,
          hint: 'Kun brukt ved rupanel. Produktavhengig.' },
        { id: 'pappSpikerPerM2', label: 'Festemidler takbelegg (stk/m²)', type: 'number', placeholder: 'Se monteringsanvisning', advanced: true,
          hint: 'Innfesting varierer med takbelegg og system. Kan være pappstift eller skrue/skive.' },
        { id: 'svinnTekking', label: 'Svinn tekking (%)', type: 'number', placeholder: '10', default: 10, advanced: true },
        { id: 'svinnUndertak', label: 'Svinn nytt fast undertak (%)', type: 'number', placeholder: '10', default: 10, advanced: true,
          hint: 'Gjelder kun det nye plate-/rupanelundertaket, ikke selve takbelegget (som bruker «Svinn tekking»).' },
        { id: 'svinnFestemidler', label: 'Tillegg festemidler (%)', type: 'number', placeholder: '5', default: 5, advanced: true },
        { id: 'moneSvinn', label: 'Svinn/overlapp møne (%)', type: 'number', placeholder: '10', default: 10, advanced: true }
      ]
    },
    calc: function(v) {
      var taktype = v.taktype === 'pulttak' ? 'pulttak' : 'saltak';
      var antallFlater = taktype === 'pulttak' ? 1 : 2;
      var taklengde = Number(v.taklengde) || 0;
      var skralengde = Number(v.skralengde) || 0;
      if (!(taklengde > 0) || !(skralengde > 0)) return null;

      var areal = taklengde * skralengde * antallFlater;
      var jobb = v.jobb || 'shingel';

      var results = [];
      var details = [];
      details.push({ label: 'Takflateareal (geometrisk)', value: Math.round(areal * 100) / 100, unit: 'm²' });
      details.push({ label: 'Antall takflater (' + taktype + ')', value: antallFlater, unit: 'stk' });

      if (jobb === 'shingel') {
        var svinnTekking = Number(v.svinnTekking) || 0;
        var svinnUndertak = Number(v.svinnUndertak) || 0;
        var svinnFeste = Number(v.svinnFestemidler) || 0;
        var shingelPakkeM2 = Number(v.shingelPakkeM2) || 3;
        var shingelSpikerPerM2 = Number(v.shingelSpikerPerM2) || 35;

        if (v.shingelUndertak === 'nytt') {
          var undertakLinjer = takNyttUndertakLinjer(areal, svinnUndertak, v.undertaksmateriale, Number(v.undertaksplateM2), Number(v.rupanelDekkbredde));
          if (v.undertaksmateriale === 'rupanel') {
            results.push({ primary: true, text: undertakLinjer[1].value + ' lm nytt fast undertak (rupanel)' });
          } else {
            results.push({ primary: true, text: undertakLinjer[1].value + ' plater nytt fast undertak' });
          }
          details.push(undertakLinjer[0]);
          details.push(undertakLinjer[1]);
        }

        // Underlagsbelegg — kun med hvis brukeren aktivt har valgt det (kalkulatoren
        // kjenner ikke takfall/værbelastning nok til å avgjøre behovet selv). Tom
        // rulledekning gir m²-behov i stedet for et oppdiktet rulletall.
        if (v.inkluderUnderlagspapp) {
          var underlagspappRullM2 = Number(v.underlagspappRullM2) || 0;
          var underlagBestillingM2 = areal * (1 + svinnTekking / 100);
          if (underlagspappRullM2 > 0) {
            var underlagRuller = Math.ceil(underlagBestillingM2 / underlagspappRullM2);
            results.push({ primary: true, text: underlagRuller + ' ruller underlagsbelegg' });
            results.push({ secondary: true, text: (Math.round(underlagBestillingM2 * 10) / 10) + ' m² beregnet behov (underlagsbelegg)' });
            details.push({ label: 'Underlagsbelegg — geometrisk behov', value: Math.ceil(areal / underlagspappRullM2), unit: 'rull à ' + underlagspappRullM2 + ' m²' });
            details.push({ label: 'Underlagsbelegg — bestilling', value: underlagRuller, unit: 'rull à ' + underlagspappRullM2 + ' m²' });
          } else {
            results.push({ primary: true, text: (Math.round(underlagBestillingM2 * 10) / 10) + ' m² underlagsbelegg' });
            details.push({ label: 'Underlagsbelegg — bestilling', value: Math.round(underlagBestillingM2 * 10) / 10, unit: 'm²' });
          }
        }

        var shingelBestillingPk = Math.ceil((areal * (1 + svinnTekking / 100)) / shingelPakkeM2);
        results.push({ primary: true, text: shingelBestillingPk + ' pakker shingel' });
        details.push({ label: 'Shingel — geometrisk behov', value: Math.ceil(areal / shingelPakkeM2), unit: 'pk à ' + shingelPakkeM2 + ' m²' });
        details.push({ label: 'Shingel — bestilling', value: shingelBestillingPk, unit: 'pk à ' + shingelPakkeM2 + ' m²' });

        var shingelSpikerBestilling = Math.ceil(areal * shingelSpikerPerM2 * (1 + svinnFeste / 100));
        results.push({ primary: true, text: 'ca. ' + shingelSpikerBestilling + ' shingelspiker' });
        details.push({ label: 'Shingelspiker — geometrisk behov', value: Math.ceil(areal * shingelSpikerPerM2), unit: 'stk' });
        details.push({ label: 'Shingelspiker — bestilling', value: shingelSpikerBestilling, unit: 'stk' });
      } else if (jobb === 'staaltak') {
        var dekkbreddeM = (Number(v.staalDekkbredde) || 1050) / 1000;
        var platelengdeRaw = Number(v.staalPlatelengde) || 0;
        var svinnFesteStaal = Number(v.svinnFestemidler) || 0;
        var festeHovedPerM2 = Number(v.staalFesteHoved) || 0;
        var festeBeslagPerM2 = Number(v.staalFesteBeslag) || 0;

        if (!(platelengdeRaw > 0)) {
          results.push({ primary: true, text: '⚠ Angi platelengde for å beregne materialmengde (bør være minst ' + skralengde + ' m — skrålengden).' });
          return results.concat(details);
        }

        if (platelengdeRaw < skralengde) {
          // Kalkulatoren støtter foreløpig kun plater i ett stykke fra raft til
          // møne. Gir IKKE et tilsynelatende gyldig antall plater i denne
          // kombinasjonen — skjøting er ikke implementert.
          results.push({ primary: true, text: '⚠ Platelengden (' + platelengdeRaw + ' m) er kortere enn skrålengden (' + skralengde + ' m). Kalkulatoren støtter ikke skjøting av takplater. Angi platelengde på minst ' + skralengde + ' m.' });
          return results.concat(details);
        }

        var antPlater = Math.ceil(taklengde / dekkbreddeM) * antallFlater;
        results.push({ primary: true, text: antPlater + ' plater' });
        details.push({ label: 'Plater (forutsetter hele plater i skråretningen)', value: antPlater, unit: 'stk à ' + dekkbreddeM + ' m dekkbredde' });

        // To adskilte festemiddelgrupper — takplateskruer (til lekter/bærekonstruksjon)
        // og skjøt-/beslagskruer (sideomlegg/topplater) er ulik vare i praksis
        // (Verform/Plannja), ikke ett tall per plate som ikke skalerer med platelengde.
        var festeHovedGeometrisk = Math.ceil(areal * festeHovedPerM2);
        var festeBeslagGeometrisk = Math.ceil(areal * festeBeslagPerM2);
        var festeHovedBestilling = Math.ceil(festeHovedGeometrisk * (1 + svinnFesteStaal / 100));
        var festeBeslagBestilling = Math.ceil(festeBeslagGeometrisk * (1 + svinnFesteStaal / 100));
        results.push({ primary: true, text: 'ca. ' + festeHovedBestilling + ' takplateskruer' });
        results.push({ primary: true, text: 'ca. ' + festeBeslagBestilling + ' skjøt-/beslagskruer' });
        details.push({ label: 'Takplateskruer — geometrisk behov', value: festeHovedGeometrisk, unit: 'stk (' + festeHovedPerM2 + '/m²)' });
        details.push({ label: 'Takplateskruer — bestilling inkl. tillegg', value: festeHovedBestilling, unit: 'stk' });
        details.push({ label: 'Skjøt-/beslagskruer — geometrisk behov', value: festeBeslagGeometrisk, unit: 'stk (' + festeBeslagPerM2 + '/m²)' });
        details.push({ label: 'Skjøt-/beslagskruer — bestilling inkl. tillegg', value: festeBeslagBestilling, unit: 'stk' });

        if (v.staalBrukerLekter) {
          var staalLekteCCm = (Number(v.staalLekteCC) || 600) / 1000;
          var svinnLekter = Number(v.svinnLekter) || 0;
          var antRaderPerFlateStaal = Math.ceil(skralengde / staalLekteCCm) + 1;
          var antRaderTotaltStaal = antRaderPerFlateStaal * antallFlater;
          var lekterLmGeomStaal = antRaderTotaltStaal * taklengde;
          var lekterBestillingStaal = ceil1(lekterLmGeomStaal * (1 + svinnLekter / 100));
          results.push({ primary: true, text: lekterBestillingStaal + ' lm lekter' });
          details.push({ label: 'Lekter under plater — rader per takflate', value: antRaderPerFlateStaal, unit: 'rader' });
          details.push({ label: 'Lekter under plater — rader totalt (alle takflater)', value: antRaderTotaltStaal, unit: 'rader' });
          details.push({ label: 'Lekter — geometrisk løpemeter', value: round1(lekterLmGeomStaal), unit: 'lm' });
          details.push({ label: 'Lekter — bestilling inkl. svinn', value: lekterBestillingStaal, unit: 'lm' });
        }
      } else if (jobb === 'takstein') {
        var steinPerM2 = Number(v.steinPerM2) || 10;
        var lekteavstandM = (Number(v.lekteavstand) || 300) / 1000;
        var sperreCCm = (Number(v.sperreCC) || 600) / 1000;
        var svinnStein = Number(v.svinnStein) || 0;
        var svinnTrevirke = Number(v.svinnTrevirke) || 0;

        var steinGeometrisk = Math.ceil(areal * steinPerM2);
        var steinBestilling = Math.ceil(areal * steinPerM2 * (1 + svinnStein / 100));
        results.push({ primary: true, text: steinBestilling + ' stk takstein' });
        details.push({ label: 'Takstein — geometrisk behov', value: steinGeometrisk, unit: 'stk (' + steinPerM2 + '/m²)' });
        details.push({ label: 'Takstein — bestilling', value: steinBestilling, unit: 'stk' });

        // Lekter: antall rader ut fra skrålengde og lekteavstand (ikke areal/cc-approksimasjon)
        var antLekteraderPerFlate = Math.ceil(skralengde / lekteavstandM) + 1;
        var antLekteraderTotalt = antLekteraderPerFlate * antallFlater;
        var lekterLmGeometrisk = antLekteraderTotalt * taklengde;
        var lekterBestilling = ceil1(lekterLmGeometrisk * (1 + svinnTrevirke / 100));
        results.push({ primary: true, text: lekterBestilling + ' lm lekter' });
        details.push({ label: 'Lekter — rader per takflate', value: antLekteraderPerFlate, unit: 'rader' });
        details.push({ label: 'Lekter — rader totalt (alle takflater)', value: antLekteraderTotalt, unit: 'rader' });
        details.push({ label: 'Lekter — geometrisk løpemeter', value: round1(lekterLmGeometrisk), unit: 'lm' });
        details.push({ label: 'Lekter — bestilling inkl. svinn', value: lekterBestilling, unit: 'lm' });

        // Sløyfer: antall linjer ut fra taklengde og sperre c/c, hver linje = skrålengde
        var antSloyferPerFlate = Math.ceil(taklengde / sperreCCm) + 1;
        var antSloyferTotalt = antSloyferPerFlate * antallFlater;
        var sloyferLmGeometrisk = antSloyferTotalt * skralengde;
        var sloyferBestilling = ceil1(sloyferLmGeometrisk * (1 + svinnTrevirke / 100));
        results.push({ primary: true, text: sloyferBestilling + ' lm sløyfer' });
        details.push({ label: 'Sløyfer — linjer per takflate', value: antSloyferPerFlate, unit: 'linjer' });
        details.push({ label: 'Sløyfer — linjer totalt (alle takflater)', value: antSloyferTotalt, unit: 'linjer' });
        details.push({ label: 'Sløyfer — geometrisk løpemeter', value: round1(sloyferLmGeometrisk), unit: 'lm' });
        details.push({ label: 'Sløyfer — bestilling inkl. svinn', value: sloyferBestilling, unit: 'lm' });

        details.push({ label: 'Festemidler takstein', value: 'Innfesting av takstein er ikke beregnet. Behovet må bestemmes etter valgt taksteinsystem, takvinkel og vindforhold.', unit: '' });
      } else if (jobb === 'takpapp') {
        var svinnTekkingPapp = Number(v.svinnTekking) || 0;
        var svinnUndertakPapp = Number(v.svinnUndertak) || 0;
        var svinnFestePapp = Number(v.svinnFestemidler) || 0;
        var pappRullM2 = Number(v.pappRullM2) || 0;
        var pappSpikerPerM2 = Number(v.pappSpikerPerM2) || 0;

        if (v.pappUndertak === 'nytt') {
          var undertakLinjerPapp = takNyttUndertakLinjer(areal, svinnUndertakPapp, v.undertaksmateriale, Number(v.undertaksplateM2), Number(v.rupanelDekkbredde));
          if (v.undertaksmateriale === 'rupanel') {
            results.push({ primary: true, text: undertakLinjerPapp[1].value + ' lm nytt fast undertak (rupanel)' });
          } else {
            results.push({ primary: true, text: undertakLinjerPapp[1].value + ' plater nytt fast undertak' });
          }
          details.push(undertakLinjerPapp[0]);
          details.push(undertakLinjerPapp[1]);
        }

        // Tom rulledekning gir m²-behov i stedet for et oppdiktet rulletall —
        // samme prinsipp som underlagsbelegg i shingel og pakningsinnhold i Gulv.
        var pappBestillingM2 = areal * (1 + svinnTekkingPapp / 100);
        if (pappRullM2 > 0) {
          var pappRuller = Math.ceil(pappBestillingM2 / pappRullM2);
          results.push({ primary: true, text: pappRuller + ' ruller takbelegg' });
          results.push({ secondary: true, text: (Math.round(pappBestillingM2 * 10) / 10) + ' m² beregnet behov (takbelegg)' });
          details.push({ label: 'Takpapp — geometrisk behov', value: Math.ceil(areal / pappRullM2), unit: 'rull à ' + pappRullM2 + ' m²' });
          details.push({ label: 'Takpapp — bestilling', value: pappRuller, unit: 'rull à ' + pappRullM2 + ' m²' });
        } else {
          results.push({ primary: true, text: (Math.round(pappBestillingM2 * 10) / 10) + ' m² takbelegg' });
          details.push({ label: 'Takpapp — bestilling', value: Math.round(pappBestillingM2 * 10) / 10, unit: 'm²' });
        }

        // Festemidler kun beregnet når brukeren faktisk har oppgitt stk/m² — ikke
        // gjettet, og ikke kalt "pappspiker" siden systemet kan bruke skrue/skive.
        if (pappSpikerPerM2 > 0) {
          var pappFesteBestilling = Math.ceil(areal * pappSpikerPerM2 * (1 + svinnFestePapp / 100));
          results.push({ primary: true, text: 'ca. ' + pappFesteBestilling + ' festemidler' });
          details.push({ label: 'Festemidler takbelegg — geometrisk behov', value: Math.ceil(areal * pappSpikerPerM2), unit: 'stk' });
          details.push({ label: 'Festemidler takbelegg — bestilling', value: pappFesteBestilling, unit: 'stk' });
        }
      }

      // Møne — kun saltak (pulttak har ikke vanlig møne), og typeavhengig materiale.
      // Mønelengden i seg selv er alltid geometrisk (= taklengde) — det er
      // BESTILLINGEN (pakker/stk/beslag) som skal ta hensyn til produktets
      // effektive dekning og eget svinn/overlapp, ikke anta 1:1 kjøpt = lagt.
      if (taktype === 'saltak') {
        var moneLengdeGeometrisk = taklengde;
        details.push({ label: 'Mønelengde — geometrisk', value: round1(moneLengdeGeometrisk), unit: 'm' });
        var moneSvinn = Number(v.moneSvinn) || 0;

        if (jobb === 'shingel') {
          // Tom pakkedekning gir lm-behov i stedet for et oppdiktet pakketall.
          var strimmelDekning = Number(v.moneStrimmelDekningM) || 0;
          var moneBestillingLmShingel = ceil1(moneLengdeGeometrisk * (1 + moneSvinn / 100));
          if (strimmelDekning > 0) {
            var moneStrimmelPk = Math.ceil(moneBestillingLmShingel / strimmelDekning);
            results.push({ primary: true, text: moneStrimmelPk + ' pakker møne' });
            details.push({ label: 'Mønestrimmel (shingel) — bestilling', value: moneStrimmelPk, unit: 'pk à ' + strimmelDekning + ' lm' });
          } else {
            results.push({ primary: true, text: moneBestillingLmShingel + ' lm møne' });
            details.push({ label: 'Mønestrimmel (shingel) — bestilling', value: moneBestillingLmShingel, unit: 'lm' });
          }
        } else if (jobb === 'staaltak') {
          var beslagLengde = Number(v.moneBeslagLengde) || 2;
          var moneBeslagBestilling = Math.ceil((moneLengdeGeometrisk * (1 + moneSvinn / 100)) / beslagLengde);
          results.push({ primary: true, text: moneBeslagBestilling + ' mønebeslag' });
          details.push({ label: 'Mønebeslag — bestilling', value: moneBeslagBestilling, unit: 'stk à ' + beslagLengde + ' m' });
        } else if (jobb === 'takstein') {
          var moneSteinPerLm = Number(v.moneSteinPerLm) || 3;
          var moneSteinGeometrisk = Math.ceil(moneLengdeGeometrisk * moneSteinPerLm);
          var moneSteinBestilling = Math.ceil(moneLengdeGeometrisk * moneSteinPerLm * (1 + moneSvinn / 100));
          results.push({ primary: true, text: moneSteinBestilling + ' stk mønestein' });
          details.push({ label: 'Mønestein/møneløsning — geometrisk behov', value: moneSteinGeometrisk, unit: 'stk (' + moneSteinPerLm + '/lm)' });
          details.push({ label: 'Mønestein/møneløsning — bestilling', value: moneSteinBestilling, unit: 'stk' });
        } else if (jobb === 'takpapp') {
          var moneDetaljBestilling = Math.ceil(moneLengdeGeometrisk * (1 + moneSvinn / 100));
          results.push({ primary: true, text: moneDetaljBestilling + ' lm mønedetalj (grovt anslag)' });
          details.push({ label: 'Mønedetalj (systemavhengig — sjekk produktblad) — bestilling', value: moneDetaljBestilling, unit: 'lm (grovt anslag)' });
        }
      }

      return results.concat(details);
    },
    renderResult: renderCompactMcResult
  },

  lekter: {
    label: 'Lekter / sløyfer',
    icon: '',
    desc: 'Beregn lekter og sløyfer etter bransjestandard prinsipp: areal × 1000/c-c. Kalkulatoren beregner materialmengde — ikke konstruksjonsmessig riktig dimensjon ut fra spenn, vindlast eller valgt taktekking. Tak-kalkulatorens produktspesifikke lekting (shingel/ståltak/takstein) ligger fortsatt der — dette er det generelle, frittstående verktøyet.',
    fields: [
      { id: 'jobb', label: 'Bruksområde', type: 'select', options: [
        { value: 'sloeyfe', label: 'Sløyfer (vertikale, for kledning)' },
        { value: 'lekt_vegg', label: 'Utlekting vegg (horisontale)' },
        { value: 'lekt_tak', label: 'Taklekter' },
        { value: 'krysslekt', label: 'Krysslekting (to lag, hver sin retning)' }
      ], default: 'sloeyfe' }
    ],
    // Dimensjon og behandling er forhåndsvalgt per bruksområde (typisk praksis),
    // men ALDRI presentert som universelt riktig — begge er frie, overstyrbare
    // valg. Krysslekting har to separate c/c-felt siden lagene kan ha ulik avstand.
    jobFields: {
      sloeyfe: [
        { id: 'areal', label: 'Areal (m²)', type: 'number', placeholder: '50' },
        { id: 'dim', label: 'Dimensjon', type: 'select', options: [
          { value: '23x48', label: '23 × 48 mm' }, { value: '30x48', label: '30 × 48 mm' },
          { value: '36x48', label: '36 × 48 mm' }, { value: '48x48', label: '48 × 48 mm' }
        ], default: '23x48', hint: 'Forhåndsvalg for sløyfer — ikke en fasit. Velg det som faktisk brukes på jobben.' },
        { id: 'behandling', label: 'Behandling', type: 'select', options: [
          { value: 'ubehandlet', label: 'Ubehandlet' }, { value: 'impregnert', label: 'Trykkimpregnert' }
        ], default: 'ubehandlet' },
        { id: 'cc', label: 'Senteravstand c/c', type: 'select', options: [
          { value: '300', label: '300 mm' }, { value: '400', label: '400 mm' }, { value: '600', label: '600 mm (standard)' }
        ], default: '600' },
        { id: 'bordlengde', label: 'Handelslengde (m, valgfritt)', type: 'select', options: [
          { value: '0', label: 'Ikke valgt' }, { value: '3', label: '3,0 m' }, { value: '3.6', label: '3,6 m' },
          { value: '4', label: '4,0 m' }, { value: '4.8', label: '4,8 m' }, { value: '5.4', label: '5,4 m' }
        ], default: '4' },
        { id: 'svinn', label: 'Svinn (%)', type: 'number', placeholder: '10', default: 10 },
        { id: 'festemidlerPerM2', label: 'Festemidler per m² (stk, estimert preset)', type: 'number', placeholder: '8', default: 8,
          hint: 'Redigerbart preset, ikke basert på en bestemt produsentanvisning — juster etter valgt system.' }
      ],
      lekt_vegg: [
        { id: 'areal', label: 'Areal (m²)', type: 'number', placeholder: '50' },
        { id: 'dim', label: 'Dimensjon', type: 'select', options: [
          { value: '23x48', label: '23 × 48 mm' }, { value: '30x48', label: '30 × 48 mm' },
          { value: '36x48', label: '36 × 48 mm' }, { value: '48x48', label: '48 × 48 mm' }
        ], default: '36x48', hint: 'Forhåndsvalg for utlekting vegg — ikke en fasit.' },
        { id: 'behandling', label: 'Behandling', type: 'select', options: [
          { value: 'ubehandlet', label: 'Ubehandlet' }, { value: 'impregnert', label: 'Trykkimpregnert' }
        ], default: 'ubehandlet' },
        { id: 'cc', label: 'Senteravstand c/c', type: 'select', options: [
          { value: '300', label: '300 mm' }, { value: '400', label: '400 mm' }, { value: '600', label: '600 mm (standard)' }
        ], default: '600' },
        { id: 'bordlengde', label: 'Handelslengde (m, valgfritt)', type: 'select', options: [
          { value: '0', label: 'Ikke valgt' }, { value: '3', label: '3,0 m' }, { value: '3.6', label: '3,6 m' },
          { value: '4', label: '4,0 m' }, { value: '4.8', label: '4,8 m' }, { value: '5.4', label: '5,4 m' }
        ], default: '4' },
        { id: 'svinn', label: 'Svinn (%)', type: 'number', placeholder: '10', default: 10 },
        { id: 'festemidlerPerM2', label: 'Festemidler per m² (stk, estimert preset)', type: 'number', placeholder: '8', default: 8,
          hint: 'Redigerbart preset, ikke basert på en bestemt produsentanvisning.' }
      ],
      lekt_tak: [
        { id: 'areal', label: 'Areal (m²)', type: 'number', placeholder: '50' },
        { id: 'dim', label: 'Dimensjon', type: 'select', options: [
          { value: '23x48', label: '23 × 48 mm' }, { value: '30x48', label: '30 × 48 mm' },
          { value: '36x48', label: '36 × 48 mm' }, { value: '48x48', label: '48 × 48 mm' }
        ], default: '30x48', hint: 'Forhåndsvalg for generelle taklekter — ikke en fasit. Produktspesifikk taklekting for shingel/ståltak/takstein ligger i Tak-kalkulatoren.' },
        { id: 'behandling', label: 'Behandling', type: 'select', options: [
          { value: 'ubehandlet', label: 'Ubehandlet' }, { value: 'impregnert', label: 'Trykkimpregnert' }
        ], default: 'impregnert' },
        { id: 'cc', label: 'Senteravstand c/c', type: 'select', options: [
          { value: '300', label: '300 mm' }, { value: '400', label: '400 mm' }, { value: '600', label: '600 mm (standard)' }
        ], default: '600' },
        { id: 'bordlengde', label: 'Handelslengde (m, valgfritt)', type: 'select', options: [
          { value: '0', label: 'Ikke valgt' }, { value: '3', label: '3,0 m' }, { value: '3.6', label: '3,6 m' },
          { value: '4', label: '4,0 m' }, { value: '4.8', label: '4,8 m' }, { value: '5.4', label: '5,4 m' }
        ], default: '4' },
        { id: 'svinn', label: 'Svinn (%)', type: 'number', placeholder: '10', default: 10 },
        { id: 'festemidlerPerM2', label: 'Festemidler per m² (stk, estimert preset)', type: 'number', placeholder: '8', default: 8,
          hint: 'Redigerbart preset, ikke basert på en bestemt produsentanvisning.' }
      ],
      krysslekt: [
        { id: 'areal', label: 'Areal (m²)', type: 'number', placeholder: '50' },
        { id: 'dim', label: 'Dimensjon (begge lag)', type: 'select', options: [
          { value: '23x48', label: '23 × 48 mm' }, { value: '30x48', label: '30 × 48 mm' },
          { value: '36x48', label: '36 × 48 mm' }, { value: '48x48', label: '48 × 48 mm' }
        ], default: '36x48', hint: 'Forhåndsvalg — ikke en fasit.' },
        { id: 'behandling', label: 'Behandling (begge lag)', type: 'select', options: [
          { value: 'ubehandlet', label: 'Ubehandlet' }, { value: 'impregnert', label: 'Trykkimpregnert' }
        ], default: 'ubehandlet' },
        { id: 'cc', label: 'Senteravstand c/c — lag 1', type: 'select', options: [
          { value: '300', label: '300 mm' }, { value: '400', label: '400 mm' }, { value: '600', label: '600 mm (standard)' }
        ], default: '600' },
        { id: 'cc2', label: 'Senteravstand c/c — lag 2', type: 'select', options: [
          { value: '300', label: '300 mm' }, { value: '400', label: '400 mm' }, { value: '600', label: '600 mm (standard)' }
        ], default: '600', hint: 'De to lagene kan ha ulik c/c — beregnes og summeres separat.' },
        { id: 'bordlengde', label: 'Handelslengde (m, valgfritt)', type: 'select', options: [
          { value: '0', label: 'Ikke valgt' }, { value: '3', label: '3,0 m' }, { value: '3.6', label: '3,6 m' },
          { value: '4', label: '4,0 m' }, { value: '4.8', label: '4,8 m' }, { value: '5.4', label: '5,4 m' }
        ], default: '4' },
        { id: 'svinn', label: 'Svinn (%)', type: 'number', placeholder: '10', default: 10 },
        { id: 'festemidlerPerM2', label: 'Festemidler per m² (stk, estimert preset)', type: 'number', placeholder: '8', default: 8,
          hint: 'Redigerbart preset, ikke basert på en bestemt produsentanvisning.' }
      ]
    },
    calc: function(v) {
      var areal = Number(v.areal) || 0;
      if (!(areal > 0)) return null;

      var jobb = v.jobb || 'sloeyfe';
      var svinn = Number(v.svinn) || 0;
      var dim = v.dim || '36x48';
      var behandlingLabel = v.behandling === 'impregnert' ? 'Trykkimpregnert' : 'Ubehandlet';
      var festemidlerPerM2 = Number(v.festemidlerPerM2) || 0;

      // Bransjestandard: lm = areal × 1000/c-c. Krysslekting = to lag beregnet
      // separat (hver sin c/c) og summert — ikke en blind ×2 av ett lag.
      var lmNetto;
      if (jobb === 'krysslekt') {
        var cc1 = Number(v.cc) || 600;
        var cc2 = Number(v.cc2) || 600;
        lmNetto = areal * (1000 / cc1) + areal * (1000 / cc2);
      } else {
        var cc = Number(v.cc) || 600;
        lmNetto = areal * (1000 / cc);
      }
      var lmBestilling = ceil1(lmNetto * (1 + svinn / 100));

      var results = [
        { label: 'Lekt/sløyfe — netto løpemeter', value: Math.round(lmNetto * 10) / 10, unit: 'lm' },
        { label: 'Lekt/sløyfe — bestilling inkl. svinn', value: lmBestilling, unit: 'lm' },
        { label: 'Dimensjon', value: dim, unit: 'mm' },
        { label: 'Behandling', value: behandlingLabel, unit: '' }
      ];

      var bordlengde = Number(v.bordlengde) || 0;
      if (bordlengde > 0) {
        results.push({ label: 'Estimert antall handelslengder (' + bordlengde + ' m)', value: Math.ceil(lmBestilling / bordlengde), unit: 'stk (grovt estimat, ikke kappplan)' });
      }

      results.push({ label: 'Estimert festemiddelbehov (' + festemidlerPerM2 + '/m²)', value: Math.ceil(areal * festemidlerPerM2), unit: 'stk' });

      return results;
    }
  },

  terrasse: {
    label: 'Terrasse',
    icon: '',
    desc: 'Beregn terrassebord, bjelkelag og festemidler.',
    customRender: true,
    fields: [
      { id: 'lengde', label: 'Terrasselengde (m)', type: 'number', placeholder: '5' },
      { id: 'bredde', label: 'Terrassebredde (m)', type: 'number', placeholder: '3' },
      { id: 'bordType', label: 'Terrassebord', type: 'select', options: TERRASSE_BORD_OPTIONS.map(function(o) {
        return { value: o.value, label: o.label };
      }), default: '28x120-impregnert' },
      { id: 'bordretning', label: 'Bordretning', type: 'select', options: [
        { value: 'lengde', label: 'Langs terrasselengden' },
        { value: 'bredde', label: 'Langs terrassebredden' }
      ], default: 'lengde', hint: 'Styrer bordenes emnelengde, bjelkeretningen og antall festepunkter.' },
      { id: 'feste', label: 'Feste', type: 'select', options: [
        { value: 'synlig', label: 'Synlige skruer' },
        { value: 'skjult', label: 'Skjult feste / klips' }
      ], default: 'synlig' },
      { id: 'bjelkeCC', label: 'Bjelke c/c', type: 'select', options: [
        { value: '400', label: '400 mm' },
        { value: '600', label: '600 mm' }
      ], default: '600',
        hint: 'Dagens bordkatalog mangler nok produktdata (tykkelse, dokumentert maks c/c) til at valgt terrassebord trygt kan foreslå denne automatisk — velges derfor aktivt her, ikke gjemt under «Flere valg».' },
      { id: 'fuge', label: 'Avstand mellom bord (mm)', type: 'number', placeholder: '3', default: 3, advanced: true,
        hint: 'Tilpasses bordtype og fuktinnhold ved montering.' },
      { id: 'svinn', label: 'Svinn bord til innkjøp (%)', type: 'number', placeholder: '10', default: 10, advanced: true },
      { id: 'perKryss', label: 'Festemidler per kryss (stk)', type: 'number', placeholder: '2', default: 2, advanced: true,
        hint: 'Grovberegning, ikke en fasit — foreslås automatisk ut fra valgt feste (2 synlig / 1 skjult), men kan overstyres. Kontroller alltid produsentens monteringsanvisning ved skjult innfesting.' },
      { id: 'festemiddelSvinn', label: 'Tillegg/svinn festemidler (%)', type: 'number', placeholder: '5', default: 5, advanced: true,
        hint: 'Dekker kapp, feilfeste og tapte skruer/klips. Regnes på faktisk antall monterte bord, ikke på bord kjøpt inkl. svinn.' },
      { id: 'spesialklipsTillegg', label: 'Tillegg spesialklips start/slutt (%, valgfritt)', type: 'number', placeholder: '0', default: 0, advanced: true,
        hint: 'Kun relevant ved skjult feste med egne start-/endeklips. La stå på 0 hvis systemet ikke bruker dette.' },
      { id: 'bjelkeDim', label: 'Bjelkedimensjon', type: 'select', options: [
        { value: '48x148', label: '48 × 148 mm' },
        { value: '48x198', label: '48 × 198 mm' },
        { value: '73x198', label: '73 × 198 mm' }
      ], default: '48x148', advanced: true,
        hint: 'Kalkulatoren beregner materialmengde. Valgt dimensjon må vurderes ut fra spenn, belastning og konstruksjon.' }
    ],
    calc: function(v) {
      var lengde = Number(v.lengde) || 0;
      var bredde = Number(v.bredde) || 0;
      var svinnBord = Number(v.svinn) || 10;
      var bjelkeCC = Number(v.bjelkeCC) || 600;
      var fuge = v.fuge === '' || v.fuge === undefined ? 3 : Number(v.fuge);
      var perKryss = Number(v.perKryss) || 2;
      var festemiddelSvinn = Number(v.festemiddelSvinn) || 0;
      var spesialTillegg = Number(v.spesialklipsTillegg) || 0;
      if (lengde <= 0 || bredde <= 0) return null;
      var areal = lengde * bredde;

      // Terrassebord — bordbredde hentes fra strukturert data (ikke tekststreng), avstand mellom bord er eget felt
      var bordOpt = TERRASSE_BORD_OPTIONS.filter(function(o) { return o.value === v.bordType; })[0] || TERRASSE_BORD_OPTIONS[0];
      var dekkBr = bordOpt.bredde + fuge;
      var lmPerM2 = 1000 / dekkBr;
      var bordLmNetto = areal * lmPerM2;
      var bordLmBrutto = bordLmNetto * (1 + svinnBord / 100);
      var bordLmBruttoRundet = ceil1(bordLmBrutto);

      // Bordretning normaliseres til P (retningen bordene ligger langs, = bordenes
      // emnelengde) og C (tverretningen bjelkene spenner over). Bjelker står alltid
      // på tvers av bordretningen og er spredt langs P. Samme formler brukes uansett
      // hvilken retning som er valgt — kun P/C bytter plass.
      var bordretning = v.bordretning === 'bredde' ? 'bredde' : 'lengde';
      var P = bordretning === 'bredde' ? bredde : lengde;
      var C = bordretning === 'bredde' ? lengde : bredde;
      var bordretningLabel = bordretning === 'bredde' ? 'langs terrassebredden' : 'langs terrasselengden';

      // Faktisk antall monterte bordrader (basert på NETTO lm, ikke innkjøpsmengde
      // inkl. svinn — de ekstra bordene som kjøpes for kapp monteres ikke, og skal
      // derfor ikke telle med i festemiddelbehovet).
      var antallBordNetto = Math.ceil(bordLmNetto / P);

      // Bjelker — geometrisk materialbehov (antall × nødvendig lengde). Kalkulatoren
      // kjenner ikke tilgjengelige handelslengder, skjøting, understøtting eller
      // faktisk dimensjonerende spenn — tallet presenteres derfor som total lm, ikke
      // som en påstått bestilling av N hele emner.
      var antBjelker = Math.ceil((P * 1000) / bjelkeCC) + 1;
      var emnelengdeBjelke = C;
      var bjelkeLm = antBjelker * emnelengdeBjelke;
      var bjelkeLmRundet = round1(bjelkeLm);
      var bjelkeDimLabel = v.bjelkeDim || '48x148';

      // Festemidler — geometrisk behov (monterte bord × bjelkekryss × per kryss)
      // FØRST, deretter eget, redigerbart tillegg. Arver ikke bordenes innkjøpssvinn.
      var festeGeometrisk = antallBordNetto * antBjelker * perKryss;
      var festeTotal = Math.ceil(festeGeometrisk * (1 + festemiddelSvinn / 100));
      var spesialklips = spesialTillegg > 0 ? Math.ceil(festeTotal * spesialTillegg / 100) : 0;

      var erSkjult = v.feste === 'skjult';
      var hovedfesteNoun = erSkjult ? 'hovedklips' : 'terrasseskruer';

      var results = [];
      var details = [];

      results.push({ primary: true, text: bordLmBruttoRundet + ' lm terrassebord' });
      results.push({ secondary: true, text: bordOpt.label + ' · ' + bordretningLabel + ' · ' + fuge + ' mm mellom bord · inkl. ' + svinnBord + '% svinn' });

      results.push({ primary: true, text: bjelkeLmRundet + ' lm bjelkelag (' + bjelkeDimLabel + ')' });
      results.push({ secondary: true, text: antBjelker + ' bjelkeløp × ' + emnelengdeBjelke + ' m · c/c ' + bjelkeCC });

      results.push({ primary: true, text: 'ca. ' + festeTotal + ' ' + hovedfesteNoun });
      if (spesialklips > 0) {
        results.push({ primary: true, text: 'ca. ' + spesialklips + ' start-/sluttklips' });
      }

      details.push({ label: 'Terrasseareal', value: Math.round(areal * 10) / 10, unit: 'm²' });
      details.push({ label: 'Terrassebord netto', value: round1(bordLmNetto), unit: 'lm' });
      details.push({ label: 'Terrassebord bestilling', value: bordLmBruttoRundet, unit: 'lm' });
      details.push({ label: 'Antall bord — geometrisk', value: antallBordNetto, unit: 'stk à ' + P + ' m' });
      details.push({ label: 'Avstand mellom bord', value: fuge, unit: 'mm' });
      details.push({ label: 'Svinn terrassebord', value: svinnBord, unit: '%' });
      details.push({ label: 'Antall bjelkeløp', value: antBjelker, unit: 'stk' });
      details.push({ label: 'Lengde per geometrisk bjelkeløp', value: emnelengdeBjelke, unit: 'm' });
      details.push({ label: 'Total bjelke-lm', value: bjelkeLmRundet, unit: 'lm' });
      details.push({ label: 'Bjelke c/c', value: bjelkeCC, unit: 'mm' });
      details.push({ label: 'Bjelkedimensjon', value: bjelkeDimLabel, unit: '' });
      details.push({ label: 'Bjelkelag — forbehold', value: 'Geometrisk materialbehov. Dimensjonering av spenn og understøtting inngår ikke i beregningen.', unit: '' });
      details.push({ label: 'Festemidler per kryss', value: perKryss, unit: 'stk' });
      details.push({ label: 'Festemidler — geometrisk behov', value: festeGeometrisk, unit: 'stk' });
      details.push({ label: 'Tillegg festemidler', value: festemiddelSvinn, unit: '%' });
      if (spesialklips > 0) {
        details.push({ label: 'Tillegg spesialklips', value: spesialTillegg, unit: '%' });
      }

      return results.concat(details);
    },
    renderResult: renderCompactMcResult
  },

  rekkverk: {
    label: 'Rekkverk',
    icon: '',
    desc: 'Beregner materialmengde. Kontroller høyde, åpninger, dimensjoner og innfesting mot aktuell konstruksjon og gjeldende krav.',
    customRender: true,
    fields: [
      { id: 'jobb', label: 'Rekkverkstype', type: 'select', options: [
        { value: 'spiler', label: 'Spilerekkverk' },
        { value: 'liggende', label: 'Liggende bord' },
        { value: 'tett', label: 'Tett – kledningsbord' }
      ], default: 'spiler' },
      { id: 'rekkverkslengde', label: 'Lengde (m)', type: 'number', placeholder: '8',
        hint: 'Ett sammenhengende rekkverksstrekk om gangen. Har du flere separate strekk, kjør kalkulatoren én gang per strekk — å summere lengder på tvers av strekk kan underberegne antall stolper/spiler.' },
      { id: 'rekkverkshoyde', label: 'Høyde (mm)', type: 'number', placeholder: '1000', default: 1000 },
      { id: 'stolpeavstand', label: 'Stolpeavstand c/c (mm)', type: 'number', placeholder: '1200', default: 1200, advanced: true,
        hint: 'Redigerbar — ikke en konstruksjonsmessig fasit. Faktisk avstand må vurderes ut fra last og valgt system.' },
      { id: 'stolpelengde', label: 'Stolpelengde (m)', type: 'number', placeholder: '1.3', default: 1.3, advanced: true,
        hint: 'Inkluder gjerne lengde til forankring/nedstøping i tillegg til synlig høyde — skriv inn ønsket total lengde direkte.' },
      { id: 'stolpeDimensjon', label: 'Stolpe — dimensjon (kun til materialliste)', type: 'select', options: REKKVERK_STOLPE_PRESETS.map(function(p) {
        return { value: p.value, label: p.label };
      }), default: '48x98', advanced: true,
        hint: 'Generisk trelastdimensjon, ikke et konstruksjonssystem — kalkulatoren avgjør ikke om dimensjonen er sterk nok.' },
      { id: 'beregnHandlop', label: 'Beregn toppbord/håndløper', type: 'checkbox', default: true, advanced: true },
      { id: 'beregnBunnrekke', label: 'Beregn bunnrekke', type: 'checkbox', default: true, advanced: true },
      { id: 'svinnTopBunn', label: 'Svinn topp-/bunnrekke (%)', type: 'number', placeholder: '5', default: 5, advanced: true },
      { id: 'festemidlerPerLmTopBunn', label: 'Festemidler per lm topp-/bunnrekke (stk, preset)', type: 'number', placeholder: '3', default: 3, advanced: true,
        hint: 'Redigerbart preset, ikke en fasit.' }
    ],
    // Spilerekkverk, liggende bord og tett rekkverk har ulik geometri — egne
    // felt-sett, ikke variasjoner av samme formel.
    jobFields: {
      spiler: [
        { id: 'spiledimensjon', label: 'Spiledimensjon', type: 'select', options: REKKVERK_SPILE_PRESETS.map(function(p) {
          return { value: p.value, label: p.label };
        }), default: '36x48', hint: 'Fyller automatisk inn spilebredde — se «Flere valg» for å overstyre.' },
        { id: 'lysapning', label: 'Ønsket lysåpning (mm)', type: 'number', placeholder: '100', default: 100,
          hint: 'Fritt redigerbar — kalkulatoren håndhever ingen regelverkskrav. Kontroller ønsket åpning mot gjeldende krav for konstruksjonen.' },
        { id: 'spilebredde', label: 'Spilebredde (mm)', type: 'number', placeholder: '36', default: 36, advanced: true,
          hint: 'Fylles automatisk fra valgt spiledimensjon. Overstyr her ved «Annen/egendefinert» eller ved avvikende mål.' },
        { id: 'spilelengde', label: 'Spilelengde (mm)', type: 'number', placeholder: '1000', default: 1000, advanced: true,
          hint: 'Kan tilsvare rekkverkshøyde minus topp-/bunnkonstruksjon dersom relevant for din løsning — beregnes ikke automatisk.' },
        { id: 'festemidlerPerSpile', label: 'Festemidler per spile (stk, preset)', type: 'number', placeholder: '2', default: 2, advanced: true,
          hint: 'Geometrisk grovestimat (topp+bunn), ikke en bestemt skrue-/boltetype.' },
        { id: 'svinnSpiler', label: 'Svinn spiler (%)', type: 'number', placeholder: '5', default: 5, advanced: true },
        { id: 'handelslengdeSpiler', label: 'Handelslengde spilemateriale (m, 0 = ikke vis)', type: 'number', placeholder: '0', default: 0, advanced: true,
          hint: 'Gir kun et grovt estimat på antall handelslengder — ikke en kappplan.' }
      ],
      liggende: [
        { id: 'bordDekkhoyde', label: 'Borddimensjon — dekkhøyde (mm)', type: 'number', placeholder: '95', default: 95,
          hint: 'Faktisk synlig høyde per bord inkl. evt. åpning mellom bordene — samme prinsipp som senteravstand ellers i appen.' },
        { id: 'festemidlerPerLmBord', label: 'Festemidler per løpemeter (stk, preset)', type: 'number', placeholder: '3', default: 3, advanced: true,
          hint: 'Redigerbart preset, ikke en fasit.' },
        { id: 'svinnBord', label: 'Svinn liggende bord (%)', type: 'number', placeholder: '7', default: 7, advanced: true },
        { id: 'handelslengdeBord', label: 'Handelslengde bord (m, 0 = ikke vis)', type: 'number', placeholder: '0', default: 0, advanced: true,
          hint: 'Gir kun et grovt estimat på antall handelslengder — ikke en kappplan.' }
      ],
      tett: [
        { id: 'profilPreset', label: 'Materiale/profil', type: 'select', options: KLEDNING_PROFIL_PRESETS.map(function(p) {
          return { value: p.value, label: p.label };
        }), default: 'dobbelfals_148',
          hint: 'Samme verifiserte kledningsprofiler som i Kledning-kalkulatoren — fyller automatisk inn forbruk (lm/m²).' },
        { id: 'lmPerM2', label: 'Forbruk (lm/m²)', type: 'number', placeholder: '7.7', default: 7.7, advanced: true,
          hint: 'Fylles automatisk fra valgt profil. Overstyr her ved «Annen/egendefinert» eller hvis du har et annet, kjent forbrukstall.' },
        { id: 'festemidlerPerLmTett', label: 'Festemidler per løpemeter (stk, preset)', type: 'number', placeholder: '3', default: 3, advanced: true,
          hint: 'Redigerbart preset, ikke en fasit.' },
        { id: 'svinnTett', label: 'Svinn tett rekkverk (%)', type: 'number', placeholder: '7', default: 7, advanced: true },
        { id: 'handelslengdeTett', label: 'Handelslengde (m, 0 = ikke vis)', type: 'number', placeholder: '0', default: 0, advanced: true,
          hint: 'Gir kun et grovt estimat på antall handelslengder — ikke en kappplan.' }
      ]
    },
    calc: function(v) {
      var lengde = Number(v.rekkverkslengde) || 0;
      var hoydeMm = Number(v.rekkverkshoyde) || 0;
      if (!(lengde > 0) || !(hoydeMm > 0)) return null;

      var jobb = v.jobb || 'spiler';
      var stolpeavstandMm = Number(v.stolpeavstand) || 1200;
      var stolpelengde = Number(v.stolpelengde) || 0;

      // Ett sammenhengende rekkverksstrekk om gangen — samme c/c+endepunkt-
      // prinsipp som ellers i appen. Flere separate strekk med ulik lengde
      // skal kjøres som egne beregninger, ikke summeres inn i én lengde her
      // (det kan underberegne stolpeantallet).
      var antStolper = Math.ceil((lengde * 1000) / stolpeavstandMm) + 1;
      var stolpeLmTotal = antStolper * stolpelengde;

      // To festemiddelgrupper, ikke ett samlet tall — stolpeinnfesting og
      // spile-/bordfeste er ulik vare i praksis. Toppbord/bunnrekke bruker
      // samme generiske festemiddeltype som infill-materialet og telles
      // derfor i materialgruppen, ikke sammen med stolpene.
      var festeMateriale = 0;
      var festeStolper = antStolper; // 1 stolpeinnfesting per stolpe, geometrisk grovestimat

      var results = [];
      results.push({ primary: true, text: antStolper + ' stolper à ' + stolpelengde + ' m' });

      var details = [
        { label: 'Stolpemateriale — total løpemeter', value: round1(stolpeLmTotal), unit: 'lm à ' + stolpelengde + ' m per stolpe' },
        { label: 'Stolpe — dimensjon', value: (REKKVERK_STOLPE_PRESETS.filter(function(p) { return p.value === v.stolpeDimensjon; })[0] || {}).dimensjonLabel || v.stolpeDimensjon || '', unit: '' },
        { label: 'Stolpeavstand c/c', value: stolpeavstandMm, unit: 'mm' }
      ];

      if (jobb === 'spiler') {
        var spilePreset = REKKVERK_SPILE_PRESETS.filter(function(p) { return p.value === v.spiledimensjon; })[0];
        var spilebredde = Number(v.spilebredde) || (spilePreset && spilePreset.spilebreddeMm) || 0;
        var lysapning = Number(v.lysapning) || 0;
        var modul = spilebredde + lysapning;
        if (!(modul > 0)) return null;

        // N spiler + (N−1) mellomrom skal faktisk dekke feltbredden:
        // N×B + (N−1)×G ≥ L  ⇒  N ≥ (L+G)/(B+G). Vanlig ceil(L/modul)+1
        // kan legge inn én spile for mye — dette er fortsatt enkel geometri,
        // bare riktig utledet. Ikke en kontroll av lovlig åpning, kun et
        // mengdeestimat.
        var antSpiler = Math.ceil((lengde * 1000 + lysapning) / modul);
        var spilelengdeMm = Number(v.spilelengde) || hoydeMm;
        var svinnSpiler = Number(v.svinnSpiler) || 0;
        var spilerBestilling = Math.ceil(antSpiler * (1 + svinnSpiler / 100));
        var festePerSpile = Number(v.festemidlerPerSpile) || 0;
        festeMateriale += spilerBestilling * festePerSpile;

        results.push({ primary: true, text: spilerBestilling + ' spiler à ' + spilelengdeMm + ' mm' });
        results.push({ secondary: true, text: (spilePreset && spilePreset.value !== 'egendefinert' ? spilePreset.label + ' spiler' : 'Egendefinert spiledimensjon') + ' — lysåpning ' + lysapning + ' mm, inkl. ' + svinnSpiler + '% svinn' });

        details.push({ label: 'Spiler — geometrisk (modul ' + modul + ' mm)', value: antSpiler, unit: 'stk à ' + spilelengdeMm + ' mm' });
        var handelslengdeSpiler = Number(v.handelslengdeSpiler) || 0;
        if (handelslengdeSpiler > 0) {
          var spilerPerHandelslengde = Math.floor(handelslengdeSpiler / (spilelengdeMm / 1000));
          if (spilerPerHandelslengde > 0) {
            details.push({ label: 'Spiler — estimert antall handelslengder', value: Math.ceil(antSpiler / spilerPerHandelslengde), unit: 'stk à ' + handelslengdeSpiler + ' m (grovt estimat, ikke kappplan)' });
          }
        }
      } else if (jobb === 'liggende') {
        var bordDekkhoydeMm = Number(v.bordDekkhoyde) || 0;
        if (!(bordDekkhoydeMm > 0)) return null;

        var antRader = Math.ceil(hoydeMm / bordDekkhoydeMm);
        var nettoLm = antRader * lengde;
        var svinnBord = Number(v.svinnBord) || 0;
        var bestillingLm = ceil1(nettoLm * (1 + svinnBord / 100));
        var festePerLmBord = Number(v.festemidlerPerLmBord) || 0;
        festeMateriale += Math.ceil(bestillingLm * festePerLmBord);

        results.push({ primary: true, text: bestillingLm + ' lm rekkverksbord' });
        results.push({ secondary: true, text: bordDekkhoydeMm + ' mm dekkhøyde — inkl. ' + svinnBord + '% svinn' });

        details.push({ label: 'Liggende bord — antall rader', value: antRader, unit: 'rader' });
        details.push({ label: 'Liggende bord — netto løpemeter', value: Math.round(nettoLm * 10) / 10, unit: 'lm' });
        var handelslengdeBord = Number(v.handelslengdeBord) || 0;
        if (handelslengdeBord > 0) {
          details.push({ label: 'Liggende bord — estimert antall handelslengder', value: Math.ceil(bestillingLm / handelslengdeBord), unit: 'stk à ' + handelslengdeBord + ' m (grovt estimat, ikke kappplan)' });
        }
      } else if (jobb === 'tett') {
        var tettPreset = KLEDNING_PROFIL_PRESETS.filter(function(p) { return p.value === v.profilPreset; })[0] || KLEDNING_PROFIL_PRESETS[2];
        var lmPerM2 = Number(v.lmPerM2) || tettPreset.lmPerM2 || 0;
        if (!(lmPerM2 > 0)) return null;

        var arealM2 = lengde * (hoydeMm / 1000);
        var nettoLmTett = arealM2 * lmPerM2;
        var svinnTett = Number(v.svinnTett) || 0;
        var bestillingLmTett = ceil1(nettoLmTett * (1 + svinnTett / 100));
        var festePerLmTett = Number(v.festemidlerPerLmTett) || 0;
        festeMateriale += Math.ceil(bestillingLmTett * festePerLmTett);

        results.push({ primary: true, text: bestillingLmTett + ' lm bord/kledning' });
        results.push({ secondary: true, text: (tettPreset.value === 'egendefinert' ? 'Egendefinert profil' : tettPreset.label) + ' — inkl. ' + svinnTett + '% svinn' });

        details.push({ label: 'Tett rekkverk — areal', value: Math.round(arealM2 * 100) / 100, unit: 'm²' });
        details.push({ label: 'Tett rekkverk — netto løpemeter', value: Math.round(nettoLmTett * 10) / 10, unit: 'lm' });
        details.push({ label: 'Forbruk', value: Math.round(lmPerM2 * 100) / 100, unit: 'lm/m²' });
        var handelslengdeTett = Number(v.handelslengdeTett) || 0;
        if (handelslengdeTett > 0) {
          details.push({ label: 'Tett rekkverk — estimert antall handelslengder', value: Math.ceil(bestillingLmTett / handelslengdeTett), unit: 'stk à ' + handelslengdeTett + ' m (grovt estimat, ikke kappplan)' });
        }
      }

      var svinnTopBunn = Number(v.svinnTopBunn) || 0;
      var festePerLmTopBunn = Number(v.festemidlerPerLmTopBunn) || 0;
      if (v.beregnHandlop) {
        var toppbordBestillingLm = ceil1(lengde * (1 + svinnTopBunn / 100));
        results.push({ primary: true, text: toppbordBestillingLm + ' lm toppbord' });
        details.push({ label: 'Toppbord/håndløper — netto', value: round1(lengde), unit: 'lm' });
        details.push({ label: 'Toppbord/håndløper — bestilling inkl. svinn', value: toppbordBestillingLm, unit: 'lm' });
        festeMateriale += Math.ceil(toppbordBestillingLm * festePerLmTopBunn);
      }
      if (v.beregnBunnrekke) {
        var bunnrekkeBestillingLm = ceil1(lengde * (1 + svinnTopBunn / 100));
        details.push({ label: 'Bunnrekke — netto', value: round1(lengde), unit: 'lm' });
        details.push({ label: 'Bunnrekke — bestilling inkl. svinn', value: bunnrekkeBestillingLm, unit: 'lm' });
        festeMateriale += Math.ceil(bunnrekkeBestillingLm * festePerLmTopBunn);
      }

      results.push({ primary: true, text: 'ca. ' + festeMateriale + ' spile-/bordfester' });
      results.push({ primary: true, text: festeStolper + ' stolpeinnfestinger' });
      details.push({ label: 'Festemidler — materiale (spiler/bord/toppbord/bunnrekke)', value: festeMateriale, unit: 'stk' });
      details.push({ label: 'Festemidler — stolper', value: festeStolper, unit: 'stk' });
      return results.concat(details);
    },
    renderResult: renderCompactMcResult
  },

  listverk: {
    label: 'Listverk',
    icon: '',
    desc: 'Beregn fotlist og taklist etter bransjestandard prinsipp: omkrets × (1 + svinn). Gerikter og foringer rundt vindu/dør ligger i Vindu/dør-kalkulatoren, ikke her. Kalkulatoren beregner materialmengde, ikke en kappplan for hjørner — vanlig gjæring i hjørner håndteres gjennom svinnet.',
    fields: [
      { id: 'romLengde', label: 'Romlengde (m)', type: 'number', placeholder: '5' },
      { id: 'romBredde', label: 'Rombredde (m)', type: 'number', placeholder: '4' },
      { id: 'beregnFotlist', label: 'Beregn fotlist', type: 'checkbox', default: true },
      { id: 'fotlistProfil', label: 'Fotlist — profil/dimensjon', type: 'text', placeholder: 'f.eks. 12×40 mm',
        hint: 'Kun til visning i materiallisten — påvirker ikke løpemeterberegningen. Ingen profil er satt som standard.' },
      { id: 'fotlistHandelslengde', label: 'Fotlist — handelslengde (m, 0 = ikke valgt)', type: 'number', placeholder: '0', default: 0 },
      { id: 'dorapningBredde', label: 'Total bredde på døråpninger (m, påvirker kun fotlist)', type: 'number', placeholder: '0.9', default: 0,
        hint: 'Total bredde, ikke antall dører × en antatt dørbredde — unngår en skjult antakelse.' },
      { id: 'beregnTaklist', label: 'Beregn taklist', type: 'checkbox', default: true },
      { id: 'taklistProfil', label: 'Taklist — profil/dimensjon', type: 'text', placeholder: 'f.eks. 15×21 mm',
        hint: 'Kun til visning i materiallisten — påvirker ikke løpemeterberegningen.' },
      { id: 'taklistHandelslengde', label: 'Taklist — handelslengde (m, 0 = ikke valgt)', type: 'number', placeholder: '0', default: 0 },
      { id: 'svinn', label: 'Svinn/kapp (%)', type: 'number', placeholder: '10', default: 10 },
      { id: 'inkluderFestemidler', label: 'Inkluder festemidler (valgfritt)', type: 'checkbox', default: false },
      { id: 'festemidlerPerLm', label: 'Festemidler per løpemeter (stk, preset)', type: 'number', placeholder: '3', default: 3,
        hint: 'Redigerbart preset, ikke en fasit — juster etter spikeravstand/system.' }
    ],
    calc: function(v) {
      var lengde = Number(v.romLengde) || 0;
      var bredde = Number(v.romBredde) || 0;
      if (!(lengde > 0) || !(bredde > 0)) return null;

      var omkrets = 2 * lengde + 2 * bredde;
      var svinn = Number(v.svinn) || 0;
      var results = [];

      if (v.beregnFotlist) {
        var dorapningBredde = Number(v.dorapningBredde) || 0;
        var fl = calcFotlist(omkrets, dorapningBredde, svinn);
        results.push({ label: 'Fotlist — netto', value: Math.round(fl.netto * 10) / 10, unit: 'lm' });
        results.push({ label: 'Fotlist — bestilling inkl. svinn', value: fl.bestilling, unit: 'lm' });
        if (v.fotlistProfil) results.push({ label: 'Fotlist — valgt profil/dimensjon', value: v.fotlistProfil, unit: '' });
        var fotHandelslengde = Number(v.fotlistHandelslengde) || 0;
        if (fotHandelslengde > 0) {
          results.push({ label: 'Fotlist — estimert antall handelslengder', value: Math.ceil(fl.bestilling / fotHandelslengde), unit: 'stk à ' + fotHandelslengde + ' m (grovt estimat, ikke kappplan)' });
        }
        if (v.inkluderFestemidler) {
          var festePerLm = Number(v.festemidlerPerLm) || 0;
          results.push({ label: 'Fotlist — estimert festemiddelbehov', value: Math.ceil(fl.bestilling * festePerLm), unit: 'stk' });
        }
      }

      if (v.beregnTaklist) {
        var taklistBestilling = ceil1(omkrets * (1 + svinn / 100));
        results.push({ label: 'Taklist — netto', value: Math.round(omkrets * 10) / 10, unit: 'lm' });
        results.push({ label: 'Taklist — bestilling inkl. svinn', value: taklistBestilling, unit: 'lm' });
        if (v.taklistProfil) results.push({ label: 'Taklist — valgt profil/dimensjon', value: v.taklistProfil, unit: '' });
        var takHandelslengde = Number(v.taklistHandelslengde) || 0;
        if (takHandelslengde > 0) {
          results.push({ label: 'Taklist — estimert antall handelslengder', value: Math.ceil(taklistBestilling / takHandelslengde), unit: 'stk à ' + takHandelslengde + ' m (grovt estimat, ikke kappplan)' });
        }
        if (v.inkluderFestemidler) {
          var festePerLmTak = Number(v.festemidlerPerLm) || 0;
          results.push({ label: 'Taklist — estimert festemiddelbehov', value: Math.ceil(taklistBestilling * festePerLmTak), unit: 'stk' });
        }
      }

      return results;
    }
  },

  vindu: {
    label: 'Vindu / dør',
    icon: '',
    desc: 'Beregner materialmengde for foring, gerikt, vindusbrett og tetting rundt karm — ikke åpning/karmklaring, losholt, bærebjelke, brann-/lydkrav, beslag eller monteringsmetode. Kontroller dette mot aktuell konstruksjon.',
    customRender: true,
    fields: [
      { id: 'jobb', label: 'Type', type: 'select', options: [
        { value: 'vindu', label: 'Vindu' },
        { value: 'dor', label: 'Dør' }
      ], default: 'vindu' },
      { id: 'bredde', label: 'Bredde (mm)', type: 'number', placeholder: '1200' },
      { id: 'hoyde', label: 'Høyde (mm)', type: 'number', placeholder: '1200' },
      { id: 'antall', label: 'Antall', type: 'number', placeholder: '1', default: 1 },
      { id: 'foring', label: 'Foring', type: 'select', options: [
        { value: 'ingen', label: 'Ingen' },
        { value: '3', label: '3 sider' },
        { value: '4', label: '4 sider' }
      ], default: '3' },
      { id: 'gerikt', label: 'Gerikt', type: 'select', options: [
        { value: 'ingen', label: 'Ingen' },
        { value: '3', label: '3 sider' },
        { value: '4', label: '4 sider' }
      ], default: '3' },
      { id: 'svinnForing', label: 'Svinn foring (%)', type: 'number', placeholder: '10', default: 10, advanced: true,
        hint: 'Generelt estimat for innvendig kapp/tilpasning rundt karm — ikke produsentdata. Juster fritt.' },
      { id: 'svinnGerikt', label: 'Svinn gerikt (%)', type: 'number', placeholder: '5', default: 5, advanced: true,
        hint: 'Generelt estimat, gjerne lavere enn foring siden gjæring i hjørner normalt gir mindre kapp. Juster fritt.' },
      { id: 'foringsbredde', label: 'Foringsdimensjon/-bredde (kun til materialliste)', type: 'text', placeholder: 'f.eks. 12×95 mm', advanced: true,
        hint: 'Påvirker ikke lm-beregningen — kalkulatoren regner ikke ut foringsbredde fra veggtykkelse/karm.' },
      { id: 'geriktProfil', label: 'Geriktprofil/dimensjon (kun til materialliste)', type: 'text', placeholder: 'f.eks. 12×56 mm', advanced: true,
        hint: 'Kun til visning i materiallisten — påvirker ikke lm-beregningen.' },
      { id: 'handelslengdeForing', label: 'Handelslengde foring (m, 0 = ikke vis)', type: 'number', placeholder: '0', default: 0, advanced: true,
        hint: 'Gir kun et grovt estimat på antall handelslengder — ikke en kappplan.' },
      { id: 'handelslengdeGerikt', label: 'Handelslengde gerikt (m, 0 = ikke vis)', type: 'number', placeholder: '0', default: 0, advanced: true,
        hint: 'Gir kun et grovt estimat på antall handelslengder — ikke en kappplan.' },
      { id: 'utvendigOmramming', label: 'Utvendig omramming', type: 'select', options: [
        { value: 'ingen', label: 'Ingen' },
        { value: '3', label: '3 sider' },
        { value: '4', label: '4 sider' }
      ], default: 'ingen', advanced: true,
        hint: 'Separat fra innvendig gerikt — samme enkle omkretsformel, eget svinn.' },
      { id: 'svinnUtvendig', label: 'Svinn utvendig omramming (%)', type: 'number', placeholder: '10', default: 10, advanced: true },
      { id: 'beregnTetting', label: 'Beregn tetting rundt karm', type: 'checkbox', default: true, advanced: true,
        hint: 'Beregner kun løpemeter rundt hele karmen — avgjør ikke om dette skal være fugeskum, mineralull, tape eller fugebånd.' },
      { id: 'karmfestemidlerPerEnhet', label: 'Karmfestemidler per enhet (stk, preset)', type: 'number', placeholder: '6', default: 6, advanced: true,
        hint: 'Redigerbart preset, ikke en fasit. Faktisk antall styres normalt av avstandskrav (typisk maks ca. 500–700 mm mellom festepunkt) og størrelse, ikke et fast tall — sett til 0 for å skjule linjen.' }
    ],
    jobFields: {
      vindu: [
        { id: 'vindusbrett', label: 'Vindusbrett', type: 'checkbox', default: false },
        { id: 'vindusbrettSideutstikk', label: 'Vindusbrett — sideutstikk (mm, per side)', type: 'number', placeholder: '20', default: 20, advanced: true,
          hint: 'Redigerbart preset for hvor mye brettet stikker ut forbi karmen på hver side.' }
      ],
      dor: []
    },
    calc: function(v) {
      var breddeMm = Number(v.bredde) || 0;
      var hoydeMm = Number(v.hoyde) || 0;
      var antall = Number(v.antall) || 0;
      if (!(breddeMm > 0) || !(hoydeMm > 0) || !(antall > 0)) return null;

      var jobb = v.jobb || 'vindu';
      var omkrets3Mm = 2 * hoydeMm + breddeMm;
      var omkrets4Mm = 2 * hoydeMm + 2 * breddeMm;

      function sideOmkretsMm(valg) {
        if (valg === '4') return omkrets4Mm;
        if (valg === '3') return omkrets3Mm;
        return 0;
      }

      var results = [];
      var enhetLabel = jobb === 'dor' ? 'dører' : 'vinduer';
      results.push({ primary: true, text: antall + ' stk ' + enhetLabel + ' ' + breddeMm + '×' + hoydeMm });

      var details = [];
      var secondaryBits = [];

      var foringValg = v.foring || 'ingen';
      if (foringValg !== 'ingen') {
        var svinnForing = Number(v.svinnForing) || 0;
        var foringNettoLm = (sideOmkretsMm(foringValg) / 1000) * antall;
        var foringBestillingLm = ceil1(foringNettoLm * (1 + svinnForing / 100));
        results.push({ primary: true, text: foringBestillingLm + ' lm foring' });
        details.push({ label: 'Foring — netto løpemeter', value: Math.round(foringNettoLm * 10) / 10, unit: 'lm' });
        if (v.foringsbredde) details.push({ label: 'Foring — valgt dimensjon', value: v.foringsbredde, unit: '' });
        var handelslengdeForing = Number(v.handelslengdeForing) || 0;
        if (handelslengdeForing > 0) {
          details.push({ label: 'Foring — estimert antall handelslengder', value: Math.ceil(foringBestillingLm / handelslengdeForing), unit: 'stk à ' + handelslengdeForing + ' m (grovt estimat, ikke kappplan)' });
        }
        secondaryBits.push('foring ' + foringValg + ' sider (' + svinnForing + '% svinn)');
      }

      var geriktValg = v.gerikt || 'ingen';
      if (geriktValg !== 'ingen') {
        var svinnGerikt = Number(v.svinnGerikt) || 0;
        var geriktNettoLm = (sideOmkretsMm(geriktValg) / 1000) * antall;
        var geriktBestillingLm = ceil1(geriktNettoLm * (1 + svinnGerikt / 100));
        results.push({ primary: true, text: geriktBestillingLm + ' lm gerikt' });
        details.push({ label: 'Gerikt — netto løpemeter', value: Math.round(geriktNettoLm * 10) / 10, unit: 'lm' });
        if (v.geriktProfil) details.push({ label: 'Gerikt — valgt profil/dimensjon', value: v.geriktProfil, unit: '' });
        var handelslengdeGerikt = Number(v.handelslengdeGerikt) || 0;
        if (handelslengdeGerikt > 0) {
          details.push({ label: 'Gerikt — estimert antall handelslengder', value: Math.ceil(geriktBestillingLm / handelslengdeGerikt), unit: 'stk à ' + handelslengdeGerikt + ' m (grovt estimat, ikke kappplan)' });
        }
        secondaryBits.push('gerikt ' + geriktValg + ' sider (' + svinnGerikt + '% svinn)');
      }

      if (jobb === 'vindu' && v.vindusbrett) {
        var sideutstikkMm = Number(v.vindusbrettSideutstikk) || 0;
        var vindusbrettLengdeMm = Math.round(breddeMm + 2 * sideutstikkMm);
        results.push({ primary: true, text: antall + ' vindusbrett à ' + vindusbrettLengdeMm + ' mm' });
        details.push({ label: 'Vindusbrett — total løpemeter', value: Math.round((vindusbrettLengdeMm / 1000) * antall * 10) / 10, unit: 'lm' });
      }

      if (v.beregnTetting) {
        var tettingLm = ceil1((omkrets4Mm / 1000) * antall);
        results.push({ primary: true, text: tettingLm + ' lm tetting rundt karm' });
      }

      var utvendigValg = v.utvendigOmramming || 'ingen';
      if (utvendigValg !== 'ingen') {
        var svinnUtvendig = Number(v.svinnUtvendig) || 0;
        var utvendigNettoLm = (sideOmkretsMm(utvendigValg) / 1000) * antall;
        var utvendigBestillingLm = ceil1(utvendigNettoLm * (1 + svinnUtvendig / 100));
        details.push({ label: 'Utvendig omramming — netto løpemeter', value: Math.round(utvendigNettoLm * 10) / 10, unit: 'lm' });
        details.push({ label: 'Utvendig omramming — bestilling inkl. svinn', value: utvendigBestillingLm, unit: 'lm' });
      }

      var festePerEnhet = Number(v.karmfestemidlerPerEnhet) || 0;
      if (festePerEnhet > 0) {
        results.push({ primary: true, text: 'ca. ' + (antall * festePerEnhet) + ' karmfestemidler' });
      }

      if (secondaryBits.length) {
        results.push({ secondary: true, text: secondaryBits.join(', ') });
      }

      return results.concat(details);
    },
    renderResult: renderCompactMcResult
  }
};

// ── Festemiddelkalkulator (verifikasjon) ───────────────
// Én samlet kalkulator for å dobbeltsjekke antall skruer/spiker.
// Felt-sett tilpasses valgt jobbtype. Kilder: Spigerverket, Gyproc,
// Maxbo, Byggmakker m.fl.
//
// NOTE: Bruker customRender fordi felter endres dynamisk ved jobbtype-bytte.

matCalcDefs.festemidler = {
  label: 'Festemidler',
  desc: 'Velg type jobb → antall skruer/spiker basert på norsk byggpraksis.',
  fields: [
    { id: 'jobb', label: 'Type jobb', type: 'select', options: [
      { value: 'bjelkelag', label: 'Bjelkelag (bjelkesko)' }
    ], default: 'bjelkelag' }
  ],
  // Dynamisk felt-sett per jobbtype.
  // NB: "terrasse", "stender", "gips" og "kledning" er fjernet herfra —
  // festemidler for disse beregnes nå kun inne i vertskalkulatorene sine
  // (matCalcDefs.terrasse/.stender/.gips/.kledning), som har riktig/mer
  // presis geometrisk formel. Denne kalkulatoren hadde tidligere egne,
  // avvikende formler som ga et annet svar enn vertskalkulatoren for samme
  // jobb (opptil ~23 % avvik for terrasse) — to kilder til samme tall fjernes
  // etter hvert som hver kalkulator migreres, ikke dupliseres videre. Kun
  // "bjelkelag" gjenstår, siden det ennå ikke har en egen vertskalkulator.
  jobFields: {
    bjelkelag: [
      { id: 'antBjelker', label: 'Antall bjelker', type: 'number', placeholder: '10' },
      { id: 'antSider', label: 'Antall bjelkesko per bjelke', type: 'select', options: [
        { value: '1', label: '1 (én ende)' },
        { value: '2', label: '2 (begge ender)' }
      ], default: '2' },
      { id: 'skruerPerSko', label: 'Skruer per bjelkesko', type: 'select', options: [
        { value: '8', label: '8 (lett last)' },
        { value: '10', label: '10 (standard)' },
        { value: '12', label: '12 (tung last)' }
      ], default: '10' }
    ]
  },
  calc: function(v) {
    var jobb = v.jobb || 'bjelkelag';
    if (jobb === 'bjelkelag') {
      var antBjelker = Number(v.antBjelker) || 0;
      var antSider = Number(v.antSider) || 2;
      var perSko = Number(v.skruerPerSko) || 10;
      if (antBjelker <= 0) return null;
      var antSko = antBjelker * antSider;
      return [
        { label: 'Bjelkesko-skruer', value: antSko * perSko, unit: 'stk' },
        { label: 'Antall bjelkesko', value: antSko, unit: 'stk' },
        { label: 'Formel', value: antBjelker + ' bjelker × ' + antSider + ' sko × ' + perSko + ' skruer', unit: '' }
      ];
    }
    return null;
  }
};

var _matCalcCurrent = 'stender';

var _matCalcCategories = [
  { id: 'reisverk', label: 'Reisverk', items: ['stender'] },
  { id: 'utvendig', label: 'Utvendig', items: ['kledning', 'lekter', 'tak', 'terrasse', 'rekkverk'] },
  { id: 'innvendig', label: 'Innvendig', items: ['gips', 'isolasjon', 'gulv', 'listverk', 'vindu'] },
  { id: 'verifikasjon', label: 'Verifikasjon', items: ['festemidler'] }
];

function openMatCalc() {
  var el = $('#matCalcModal');
  if (el) {
    el.classList.remove('hidden');
    renderMatCalcNav();
    renderMatCalcBody();
  }
}

function closeMatCalc() {
  var el = $('#matCalcModal');
  if (el) el.classList.add('hidden');
}

function switchMatCalc(id) {
  _matCalcCurrent = id;
  renderMatCalcNav();
  renderMatCalcBody();
  // Nav er en horisontal skrollstripe på mobil (vertikal sidebar på desktop) —
  // sentrer den nye aktive kategorien i visningen slik at man ikke må gjette
  // seg til å skrolle for å se hva som ble valgt.
  var active = document.querySelector('.mc-nav-item-active');
  if (active) active.scrollIntoView({behavior:'smooth', block:'nearest', inline:'center'});
}

function renderMatCalcNav() {
  var container = $('#matCalcNav');
  if (!container) return;
  var html = '';
  _matCalcCategories.forEach(function(cat) {
    html += '<div class="mc-nav-group">';
    html += '<div class="mc-nav-label">' + cat.label + '</div>';
    cat.items.forEach(function(key) {
      var d = matCalcDefs[key];
      if (!d) return;
      var active = key === _matCalcCurrent ? ' mc-nav-item-active' : '';
      html += '<button class="mc-nav-item' + active + '" onclick="switchMatCalc(\'' + key + '\')">';
      if (d.icon) html += '<span class="mc-nav-icon">' + d.icon + '</span>';
      html += d.label;
      html += '</button>';
    });
    html += '</div>';
  });
  container.innerHTML = html;
}

function renderMatCalcBody() {
  var container = $('#matCalcBody');
  if (!container) return;
  var def = matCalcDefs[_matCalcCurrent];
  if (!def) return;

  // Slå sammen faste felter + dynamiske felter basert på jobbtype-valg
  var fields = (def.fields || []).slice();
  if (def.jobFields) {
    var jobbField = def.fields && def.fields.find(function(f){return f.id==='jobb';});
    var currentJobb = jobbField ? jobbField.default : Object.keys(def.jobFields)[0];
    fields = fields.concat(def.jobFields[currentJobb] || []);
  }

  var html = '<div class="mc-desc">' + def.desc + '</div>';
  html += '<div id="mcFieldsWrap" class="mc-fields">';
  html += renderMatCalcFields(fields);
  html += '</div>';
  html += '<div id="matCalcResult" class="mc-result mc-result-empty"><div class="mc-result-placeholder">Fyll inn verdier for å se resultat</div></div>';
  container.innerHTML = html;

  calcMatCalc();
}

// Kompakt hovedresultat: primary/secondary-tekstlinjer øverst ("hva må jeg
// kjøpe"), alle label/value/unit-mellomregninger samlet bak "Vis
// beregningsdetaljer". Delt mellom Kledning og Rekkverk — begge trenger
// samme "få tydelige kjøpslinjer, resten skjult"-mønster, men dette er en
// bevisst egen løsning for disse to (ikke en generell mc-result-grid-flagg).
function renderCompactMcResult(results) {
  var primary = results.filter(function(r) { return r.primary; });
  var secondary = results.filter(function(r) { return r.secondary; });
  var details = results.filter(function(r) { return !r.primary && !r.secondary; });

  var html = '<div class="mc-result-primary-group">';
  primary.forEach(function(r) {
    html += '<div class="mc-result-primary">' + r.text + '</div>';
  });
  html += '</div>';
  secondary.forEach(function(r) {
    html += '<div class="mc-result-secondary">' + r.text + '</div>';
  });
  if (details.length) {
    html += '<div class="tab-section collapsed mc-result-details">'
      + '<div class="tab-section-heading tab-section-toggle" onclick="toggleSection(this)">Vis beregningsdetaljer</div>'
      + '<div class="tab-section-body"><div class="mc-result-grid">';
    details.forEach(function(r) {
      html += '<div class="mc-result-item">';
      html += '<div class="mc-result-label">' + r.label + '</div>';
      html += '<div class="mc-result-value">' + r.value + ' <span class="mc-result-unit">' + r.unit + '</span></div>';
      html += '</div>';
    });
    html += '</div></div></div>';
  }
  return html;
}

function renderMcField(f) {
  var html = '<div class="mc-field" id="mcfield_' + f.id + '">';
  html += '<label for="mc_' + f.id + '">' + f.label + '</label>';
  if (f.hint) html += '<span class="mc-field-hint">' + f.hint + '</span>';
  // Jobb-selector re-rendrer felter ved endring. Feste-selector (Terrasse)
  // foreslår nytt preset for "festemidler per kryss". Gips sync'er skruepreset.
  // Kledning/Rekkverk (tett) sync'er lm/m² fra valgt profil/dimensjon-preset
  // (samme KLEDNING_PROFIL_PRESETS-katalog, samme feltnavn). Rekkverk (spiler)
  // sync'er spilebredde fra valgt spiledimensjon-preset.
  var gipsSkrueTriggerFelt = ['tykkelse', 'platetype', 'underlag', 'lag'];
  var erGipsSkrueTrigger = _matCalcCurrent === 'gips' && gipsSkrueTriggerFelt.indexOf(f.id) >= 0;
  var erProfilPresetTrigger = (_matCalcCurrent === 'kledning' || _matCalcCurrent === 'rekkverk') && f.id === 'profilPreset';
  var erGulvLeggemonsterTrigger = _matCalcCurrent === 'gulv' && f.id === 'leggemonster';
  var erRekkverkSpileTrigger = _matCalcCurrent === 'rekkverk' && f.id === 'spiledimensjon';
  var changeHandler = f.id === 'jobb' ? 'onJobbChange()'
    : (f.id === 'feste' ? 'onFesteChange()'
    : (f.id === 'plateformat' ? 'onPlateformatChange()'
    : (erGipsSkrueTrigger ? 'onGipsSkrueRelevantChange()'
    : (erProfilPresetTrigger ? 'onKledningProfilChange()'
    : (erGulvLeggemonsterTrigger ? 'onGulvLeggemonsterChange()'
    : (erRekkverkSpileTrigger ? 'onRekkverkSpileChange()'
    : 'calcMatCalc()'))))));

  if (f.type === 'select') {
    html += '<select id="mc_' + f.id + '" onchange="' + changeHandler + '">';
    f.options.forEach(function(opt) {
      var sel = (f.default !== undefined && String(f.default) === opt.value) ? ' selected' : '';
      html += '<option value="' + opt.value + '"' + sel + '>' + opt.label + '</option>';
    });
    html += '</select>';
  } else if (f.type === 'checkbox') {
    var checked = f.default ? ' checked' : '';
    html += '<label class="mc-checkbox"><input type="checkbox" id="mc_' + f.id + '"' + checked + ' onchange="calcMatCalc()" /> Ja</label>';
  } else if (f.type === 'text') {
    var textDefVal = f.default !== undefined ? ' value="' + escapeAttr(f.default) + '"' : '';
    html += '<input type="text" id="mc_' + f.id + '" placeholder="' + escapeAttr(f.placeholder || '') + '"' + textDefVal + ' oninput="calcMatCalc()" />';
  } else {
    var defVal = f.default !== undefined ? ' value="' + f.default + '"' : '';
    html += '<input type="number" inputmode="decimal" id="mc_' + f.id + '" placeholder="' + (f.placeholder || '') + '"' + defVal + ' oninput="calcMatCalc()" />';
  }
  html += '</div>';
  return html;
}

// Felt markert med advanced:true grupperes i en sammenleggbar "Flere valg"-
// seksjon (samme .tab-section-mønster som brukes andre steder i appen, f.eks.
// prosjektvisningens "Satser"/"Manuelle priser") i stedet for å vises flatt
// sammen med normalvisningens felt. Mange muligheter, få samtidige valg.
function renderMatCalcFields(fields) {
  var html = '';
  var advancedHtml = '';
  fields.forEach(function(f) {
    if (f.advanced) {
      advancedHtml += renderMcField(f);
    } else {
      html += renderMcField(f);
    }
  });
  if (advancedHtml) {
    html += '<div class="tab-section collapsed">'
      + '<div class="tab-section-heading tab-section-toggle" onclick="toggleSection(this)">Flere valg</div>'
      + '<div class="tab-section-body">' + advancedHtml + '</div>'
      + '</div>';
  }
  return html;
}

function onJobbChange() {
  var def = matCalcDefs[_matCalcCurrent];
  if (!def || !def.jobFields) return;
  var jobb = document.getElementById('mc_jobb').value;
  var baseFields = (def.fields || []).slice();
  var newFields = baseFields.concat(def.jobFields[jobb] || []);
  var wrap = document.getElementById('mcFieldsWrap');
  if (wrap) wrap.innerHTML = renderMatCalcFields(newFields);
  calcMatCalc();
}

// Foreslår nytt preset for "festemidler per kryss" når Feste (synlig/skjult)
// endres i Terrasse — feltet forblir et vanlig, redigerbart tallfelt, dette
// er kun en hjelpsom default ved bytte, ikke en låst verdi.
function onFesteChange() {
  var festeEl = document.getElementById('mc_feste');
  var perKryssEl = document.getElementById('mc_perKryss');
  if (festeEl && perKryssEl) {
    perKryssEl.value = festeEl.value === 'skjult' ? 1 : 2;
  }
  calcMatCalc();
}

// Foreslår svinnprosent for Gulv ut fra valgt leggemønster — kun et forvalg,
// ingen mønstergeometri beregnes. Feltet forblir fritt redigerbart.
function onGulvLeggemonsterChange() {
  var monsterEl = document.getElementById('mc_leggemonster');
  var svinnEl = document.getElementById('mc_svinn');
  if (monsterEl && svinnEl) {
    var presetter = { rett: 10, diagonal: 15, fiskebein: 15 };
    svinnEl.value = presetter[monsterEl.value] !== undefined ? presetter[monsterEl.value] : 10;
  }
  calcMatCalc();
}

// Sync'er Kledning sin lm/m² fra valgt profil/dimensjon-preset. Feltet
// forblir et vanlig, redigerbart tallfelt etterpå — dette er kun et
// hjelpsomt forvalg, ikke en låst verdi.
function onKledningProfilChange() {
  var presetEl = document.getElementById('mc_profilPreset');
  var lmPerM2El = document.getElementById('mc_lmPerM2');
  if (presetEl && lmPerM2El) {
    var opt = KLEDNING_PROFIL_PRESETS.filter(function(p) { return p.value === presetEl.value; })[0];
    if (opt && opt.lmPerM2) lmPerM2El.value = opt.lmPerM2;
  }
  calcMatCalc();
}

// Sync'er Rekkverk (spiler) sin spilebredde fra valgt spiledimensjon-preset.
// Feltet forblir et vanlig, redigerbart tallfelt etterpå — kun et hjelpsomt
// forvalg, ikke en låst verdi.
function onRekkverkSpileChange() {
  var presetEl = document.getElementById('mc_spiledimensjon');
  var spilebreddeEl = document.getElementById('mc_spilebredde');
  if (presetEl && spilebreddeEl) {
    var opt = REKKVERK_SPILE_PRESETS.filter(function(p) { return p.value === presetEl.value; })[0];
    if (opt && opt.spilebreddeMm) spilebreddeEl.value = opt.spilebreddeMm;
  }
  calcMatCalc();
}

// Foreslår skruelengde for gips fra GIPS_SKRUE_TABELL når platetype, tykkelse,
// underlag eller antall lag endres. Feltene forblir vanlige, redigerbare
// tallfelt — auto-utfylling er kun et hjelpsomt forvalg. Finnes ingen
// verifisert verdi for kombinasjonen, tømmes feltet (calc() viser da en
// kontrollhenvisning i stedet for å gjette et tall).
function onGipsSkrueRelevantChange() {
  var tykkEl = document.getElementById('mc_tykkelse');
  var typeEl = document.getElementById('mc_platetype');
  var underlagEl = document.getElementById('mc_underlag');
  var lagEl = document.getElementById('mc_lag');
  var lag1El = document.getElementById('mc_skruelengdeLag1');
  var lag2El = document.getElementById('mc_skruelengdeLag2');
  if (tykkEl && typeEl && underlagEl && lagEl && lag1El && lag2El) {
    var totaltAntallLag = Number(lagEl.value) || 1;
    var p1 = gipsSkruePreset(typeEl.value, tykkEl.value, underlagEl.value, 1, totaltAntallLag);
    lag1El.value = p1 !== null ? p1 : '';
    if (totaltAntallLag === 2) {
      var p2 = gipsSkruePreset(typeEl.value, tykkEl.value, underlagEl.value, 2, totaltAntallLag);
      lag2El.value = p2 !== null ? p2 : '';
    }
  }
  calcMatCalc();
}

// Skjuler festetetthetIndre/skruelengdeLag2/tapeInnerste under «Flere valg»
// når Gips står på 1 lag — feltene er meningsløse ved enkeltlag. Enkel
// visning/skjuling av eksisterende feltnoder (via id satt i renderMcField),
// ikke en generell conditional-field-motor. Kalles fra calcMatCalc() ved
// hver re-beregning, så tilstanden er alltid riktig etter både feltendring
// og full re-render (bytte av Vegg/Tak).
function updateGipsLagFeltSynlighet() {
  if (_matCalcCurrent !== 'gips') return;
  var lagEl = document.getElementById('mc_lag');
  var erToLag = lagEl && lagEl.value === '2';
  ['festetetthetIndre', 'skruelengdeLag2', 'tapeInnerste'].forEach(function(id) {
    var wrap = document.getElementById('mcfield_' + id);
    if (wrap) wrap.style.display = erToLag ? '' : 'none';
  });
}

// Skjuler felt under «Flere valg» i Gulv som kun er relevante ved bestemte
// valg — samme lette mønster som updateGipsLagFeltSynlighet(), fire
// uavhengige betingelser i stedet for én. Ikke en generell conditional-
// field-motor, bare enkel visning/skjuling av kjente feltnoder.
function updateGulvFeltSynlighet() {
  if (_matCalcCurrent !== 'gulv') return;
  function vis(id, synlig) {
    var wrap = document.getElementById('mcfield_' + id);
    if (wrap) wrap.style.display = synlig ? '' : 'none';
  }
  var gulvtypeEl = document.getElementById('mc_gulvtype');
  vis('bordbredde', gulvtypeEl && gulvtypeEl.value === 'heltre');

  var underlagEl = document.getElementById('mc_inkluderUnderlag');
  var visUnderlag = underlagEl && underlagEl.checked;
  vis('svinnUnderlag', visUnderlag);
  vis('underlagM2perPakke', visUnderlag);

  var fuktsperreEl = document.getElementById('mc_inkluderFuktsperre');
  vis('svinnFuktsperre', fuktsperreEl && fuktsperreEl.checked);

  var fotlistEl = document.getElementById('mc_inkluderFotlist');
  vis('dorapningBredde', fotlistEl && fotlistEl.checked);
}

// Skjuler spesialklipsTillegg under «Flere valg» i Terrasse med mindre skjult
// feste er valgt — feltet er uten funksjon ved synlig feste. Samme lette
// mønster som Gips/Gulv, én betingelse.
function updateTerrasseFeltSynlighet() {
  if (_matCalcCurrent !== 'terrasse') return;
  var festeEl = document.getElementById('mc_feste');
  var wrap = document.getElementById('mcfield_spesialklipsTillegg');
  if (wrap) wrap.style.display = (festeEl && festeEl.value === 'skjult') ? '' : 'none';
}

// Skjuler felt under «Flere valg» i Tak som kun er relevante ved bestemte
// tekkingstype-/taktype-valg. Forgrener på gjeldende jobb siden felt-id-er
// (undertaksmateriale, undertaksplateM2, rupanelDekkbredde, moneSvinn) er
// felles for flere jobFields-sett. Samme lette mønster som Gips/Gulv/
// Terrasse, ikke en generell conditional-field-motor.
function updateTakFeltSynlighet() {
  if (_matCalcCurrent !== 'tak') return;
  function vis(id, synlig) {
    var wrap = document.getElementById('mcfield_' + id);
    if (wrap) wrap.style.display = synlig ? '' : 'none';
  }
  var jobbEl = document.getElementById('mc_jobb');
  var jobb = jobbEl ? jobbEl.value : 'shingel';
  var taktypeEl = document.getElementById('mc_taktype');
  var erSaltak = taktypeEl && taktypeEl.value === 'saltak';

  if (jobb === 'shingel' || jobb === 'takpapp') {
    var undertakEl = document.getElementById(jobb === 'shingel' ? 'mc_shingelUndertak' : 'mc_pappUndertak');
    var erNyttUndertak = undertakEl && undertakEl.value === 'nytt';
    vis('undertaksmateriale', erNyttUndertak);
    var materialeEl = document.getElementById('mc_undertaksmateriale');
    var erPlate = !materialeEl || materialeEl.value !== 'rupanel';
    vis('undertaksplateM2', erNyttUndertak && erPlate);
    vis('rupanelDekkbredde', erNyttUndertak && !erPlate);
    vis('moneSvinn', erSaltak);
    if (jobb === 'shingel') {
      var underlagEl = document.getElementById('mc_inkluderUnderlagspapp');
      vis('underlagspappRullM2', underlagEl && underlagEl.checked);
      vis('moneStrimmelDekningM', erSaltak);
    }
  } else if (jobb === 'staaltak') {
    var lekterEl = document.getElementById('mc_staalBrukerLekter');
    var brukerLekter = lekterEl && lekterEl.checked;
    vis('staalLekteCC', brukerLekter);
    vis('svinnLekter', brukerLekter);
    vis('moneBeslagLengde', erSaltak);
    vis('moneSvinn', erSaltak);
  } else if (jobb === 'takstein') {
    vis('moneSteinPerLm', erSaltak);
    vis('moneSvinn', erSaltak);
  }
}

// Fyller platebredde/-lengde fra valgt platevalg (Gips) — feltene forblir
// vanlige, redigerbare tallfelt etterpå, dette er kun et hjelpsomt forvalg.
function onPlateformatChange() {
  var formatEl = document.getElementById('mc_plateformat');
  var breddeEl = document.getElementById('mc_platebredde');
  var lengdeEl = document.getElementById('mc_platelengde');
  if (formatEl && breddeEl && lengdeEl) {
    var opt = GIPS_PLATE_OPTIONS.filter(function(o) { return o.value === formatEl.value; })[0];
    if (opt) {
      breddeEl.value = opt.bredde;
      lengdeEl.value = opt.lengde;
    }
  }
  calcMatCalc();
}

function calcMatCalc() {
  var def = matCalcDefs[_matCalcCurrent];
  if (!def) return;
  updateGipsLagFeltSynlighet();
  updateGulvFeltSynlighet();
  updateTerrasseFeltSynlighet();
  updateTakFeltSynlighet();
  var values = {};
  var fields = (def.fields || []).slice();
  if (def.jobFields) {
    var jobbEl = document.getElementById('mc_jobb');
    var jobb = jobbEl ? jobbEl.value : Object.keys(def.jobFields)[0];
    fields = fields.concat(def.jobFields[jobb] || []);
  }
  fields.forEach(function(f) {
    var el = document.getElementById('mc_' + f.id);
    if (!el) return;
    if (f.type === 'checkbox') {
      values[f.id] = el.checked;
    } else {
      values[f.id] = el.value;
    }
  });

  var results = def.calc(values);
  var container = $('#matCalcResult');
  if (!container) return;

  if (!results) {
    container.className = 'mc-result mc-result-empty';
    container.innerHTML = '<div class="mc-result-placeholder">Fyll inn verdier for å se resultat</div>';
    return;
  }

  container.className = 'mc-result mc-result-filled';

  if (def.customRender && def.renderResult) {
    container.innerHTML = '<div class="mc-result-title">Resultat</div>' + def.renderResult(results);
    return;
  }

  var html = '<div class="mc-result-title">Resultat</div>';
  html += '<div class="mc-result-grid">';
  results.forEach(function(r) {
    html += '<div class="mc-result-item">';
    html += '<div class="mc-result-label">' + r.label + '</div>';
    html += '<div class="mc-result-value">' + r.value + ' <span class="mc-result-unit">' + r.unit + '</span></div>';
    html += '</div>';
  });
  html += '</div>';
  container.innerHTML = html;
}
