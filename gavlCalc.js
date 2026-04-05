// ── Gavlstender-kalkulator — eksakt Blocklayer-replikasjon ─────
// Ref: https://www.blocklayer.com/gable-studs
// Alle lengder i mm, vinkler i grader.
//
// Denne implementasjonen speiler Blocklayers interne algoritme
// steg for steg — inkludert iterasjonslogikk, plate-korreksjon
// og dobbel-avrunding av runAngle.
//
// beregnGavlStendere({ angleDeg: 30, startHeight: 2400, lengthLevel: 5000 })
//   → { gyldig: true, stendere: [...], ... }
//
// Returnert resultat er FROSSET (Object.freeze). UI-laget må
// ikke mutere det — kopier verdiene du trenger.

// ── Resultatkontrakt ��──────────────────────────────────────────
//
// @typedef {'single'|'double'|'doubleGap'} StartMode
// @typedef {'near'|'centre'|'far'} MeasurePoint
//
// @typedef {Object} GavlStenderInput
// @property {number} angleDeg        - Takvinkel i grader (0–90 eksklusivt)
// @property {number} startHeight     - Starthøyde inkl. plater (mm) — BL: "Start Height including plates"
// @property {number} studWidth       - Stenderbredde (mm)
// @property {number} plateThick      - Topplem-tykkelse (mm)
// @property {1|2}    topPlateCount   - Antall topplemmer
// @property {number} spacing         - Senteravstand c/c (mm) — BL: centersLevel
// @property {number} lengthLevel     - Vegglengde (mm) — BL itererer stendere inntil denne
// @property {StartMode}   startMode
// @property {MeasurePoint} measurePoint
// @property {boolean} alignSheets    - Juster for platekant — BL: cbAdjustFirst
// @property {number} startIn         - Offset fra veggkant (mm) — BL: txtStartIn
//
// @typedef {Object} Stender
// @property {number} nr              - 1-basert stendernummer
// @property {number} lengdeLangside  - Langside-lengde (mm, heltall)
// @property {number} lengdeKortside  - Kortside-lengde (mm, heltall)
// @property {number} runLevel        - Horisontal oppmerking justert for measurePoint (mm)
// @property {number} runAngle        - Oppmerking langs skrå topplem (mm, dobbel-avrundet)
//
// @typedef {Object} GavlSammendrag
// @property {number}      antall
// @property {number|null} korteste
// @property {number|null} lengste
// @property {number|null} oekningPerCc    - Høydeøkning per senteravstand (mm)
// @property {number|null} topCutSetback   - tan(angle) * studWidth (mm)
// @property {number|null} toppkuttVinkel  - Takvinkel avrundet til 1 desimal
// @property {number|null} topPlateTotal   - Samlet platetykkelse (mm, opprundet)
// @property {number|null} baseHeight      - v = startHeight - plateThick - plateOnAngle*extra
//
// @typedef {Object} GavlStenderResultat
// @property {true}              gyldig
// @property {GavlStenderInput}  input
// @property {Stender[]}         stendere
// @property {GavlSammendrag}    sammendrag
// @property {string[]}          advarsler
//
// @typedef {Object} GavlStenderFeil
// @property {false}             gyldig
// @property {GavlStenderInput}  input
// @property {Array}             stendere   - alltid tom
// @property {GavlSammendrag}    sammendrag - alle verdier null
// @property {string[]}          advarsler  - alltid tom
//
// @typedef {GavlStenderResultat|GavlStenderFeil} GavlStenderOutput

var GAVL_STANDARDVERDIER = {
  studWidth: 48,
  plateThick: 48,
  topPlateCount: 1,
  spacing: 600,
  lengthLevel: 5000,
  startMode: 'single',
  measurePoint: 'centre',
  alignSheets: false,
  startIn: 0
};


function beregnGavlStendere(input) {
  var inp = byggGavlInput(input);
  var advarsler = [];

  if (!erGyldigGavlInput(inp)) {
    return ugyldigGavlResultat(inp);
  }

  // ── Geometri ──
  var angleRad = inp.angleDeg * Math.PI / 180;
  var slope = Math.tan(angleRad);
  var cosAngle = Math.cos(angleRad);

  // ── Plate-korreksjon (Blocklayer-modell) ──
  // plateThick = bunnsvill (loddrett)
  // plateOnAngle * topPlateCount = topplemmer (skråjustert vertikalprojeksjon)
  var plateOnAngle = inp.plateThick / cosAngle;
  var v = inp.startHeight - inp.plateThick - plateOnAngle * inp.topPlateCount;

  // ── MeasurePoint-offset ──
  // Internt er b = ytterkant (far side) av stender.
  // Visningsposisjon justeres avhengig av measurePoint.
  var mpLevel = 0;
  var mpAngle = 0;
  if (inp.measurePoint === 'near') {
    mpLevel = inp.studWidth;
    mpAngle = inp.studWidth / cosAngle;
  } else if (inp.measurePoint === 'centre') {
    mpLevel = inp.studWidth / 2;
    mpAngle = inp.studWidth / 2 / cosAngle;
  }

  // ── Startmodus → f-verdi (Blocklayer ddStart) ──
  var f = 0;
  if (inp.startMode === 'double') f = 1;
  else if (inp.startMode === 'doubleGap') f = 2;

  // ── Stender-iterasjon ──
  // b starter ved studWidth (ytterkant av første stender)
  // og øker med spacing for hver påfølgende stender.
  // Siste stender plasseres alltid ved lengthLevel.
  var b = inp.studWidth + inp.startIn;
  var stendere = [];
  var topCutSetback = slope * inp.studWidth;

  while (b < inp.lengthLevel - 0.001) {
    var h, pos;

    if (b < inp.lengthLevel - inp.studWidth) {
      pos = b;
      h = v + slope * b;
    } else {
      // Klamp: stender nær enden flyttes til lengthLevel - studWidth
      pos = inp.lengthLevel - inp.studWidth;
      h = v + slope * pos;
    }

    stendere.push(lagStender(h, pos, topCutSetback, cosAngle, mpLevel, mpAngle));

    // Dobbel stender: kun etter første stender
    if (b === inp.studWidth + inp.startIn && f > 0) {
      var doublePos = b + inp.studWidth * f;
      var hDouble = v + slope * doublePos;
      stendere.push(lagStender(hDouble, doublePos, topCutSetback, cosAngle, mpLevel, mpAngle));
    }

    // Neste posisjon
    if (b < inp.spacing && inp.alignSheets) {
      b = b + (inp.spacing - inp.studWidth / 2);
    } else {
      b = b + inp.spacing;
    }
  }

  // Siste stender ved lengthLevel (alltid)
  var hLast = v + slope * inp.lengthLevel;
  stendere.push(lagStender(hLast, inp.lengthLevel, topCutSetback, cosAngle, mpLevel, mpAngle));

  // Nummerer stendere
  for (var i = 0; i < stendere.length; i++) {
    stendere[i].nr = i + 1;
  }

  if (inp.angleDeg > 60) {
    advarsler.push('BRATT_VINKEL: Vinkel over 60° gir svært lange stendere');
  }

  return frysResultat({
    gyldig: true,
    input: inp,
    stendere: stendere,
    sammendrag: {
      antall: stendere.length,
      korteste: stendere.length > 0 ? stendere[0].lengdeLangside : null,
      lengste: stendere.length > 0 ? stendere[stendere.length - 1].lengdeLangside : null,
      oekningPerCc: Math.round(slope * inp.spacing),
      topCutSetback: Math.round(topCutSetback),
      toppkuttVinkel: Math.round(inp.angleDeg * 10) / 10,
      topPlateTotal: Math.ceil(inp.plateThick + plateOnAngle * inp.topPlateCount),
      baseHeight: Math.round(v)
    },
    advarsler: advarsler
  });
}


// ── Lag stender-objekt med Blocklayer-avrunding ────────────────
// NOTE: runAngle bruker dobbel-avrunding for å matche Blocklayer.
// Blocklayer lagrer Math.round(pos/cos) internt, deretter subtraherer
// mpAngle (float) og runder igjen. Dette gir ±1mm avvik vs direkte
// beregning, men er nødvendig for eksakt paritet.

function lagStender(h, pos, topCutSetback, cosAngle, mpLevel, mpAngle) {
  var runAngleInternal = Math.round(pos / cosAngle);
  return {
    nr: 0,
    lengdeLangside: Math.round(h),
    lengdeKortside: Math.round(h - topCutSetback),
    runLevel: Math.round(pos - mpLevel),
    runAngle: Math.round(runAngleInternal - mpAngle)
  };
}


// ── Input-bygging ──────────────────────────────────────────────

function byggGavlInput(input) {
  input = input || {};
  var std = GAVL_STANDARDVERDIER;
  return {
    angleDeg: Number(input.angleDeg) || 0,
    startHeight: Number(input.startHeight) || 0,
    studWidth: positivEllerStandard(input.studWidth, std.studWidth),
    plateThick: positivEllerStandard(input.plateThick, std.plateThick),
    topPlateCount: (input.topPlateCount === 2) ? 2 : 1,
    spacing: positivEllerStandard(input.spacing, std.spacing),
    lengthLevel: positivEllerStandard(input.lengthLevel, std.lengthLevel),
    startMode: input.startMode || std.startMode,
    measurePoint: input.measurePoint || std.measurePoint,
    alignSheets: !!input.alignSheets,
    startIn: Number(input.startIn) || 0
  };
}

function positivEllerStandard(verdi, standard) {
  var tall = Number(verdi);
  return (tall > 0) ? tall : standard;
}


// ── Validering ─────────────────────────────────────────────────

function erGyldigGavlInput(inp) {
  return inp.angleDeg > 0
    && inp.angleDeg < 90
    && inp.startHeight > 0
    && inp.studWidth > 0
    && inp.plateThick > 0
    && inp.spacing > 0
    && inp.lengthLevel > inp.studWidth;
}

function ugyldigGavlResultat(inp) {
  return frysResultat({
    gyldig: false,
    input: inp,
    stendere: [],
    sammendrag: {
      antall: 0, korteste: null, lengste: null,
      oekningPerCc: null, topCutSetback: null,
      toppkuttVinkel: null, topPlateTotal: null,
      baseHeight: null
    },
    advarsler: []
  });
}


// ── Deep freeze ────────────────────────────────────────────────
// Fryser resultatet rekursivt slik at UI-laget ikke kan mutere
// beregningsverdier ved en feil. Alle tall, arrays og nestede
// objekter blir uforanderlige.

function frysResultat(obj) {
  Object.freeze(obj);
  Object.freeze(obj.input);
  Object.freeze(obj.sammendrag);
  Object.freeze(obj.advarsler);
  Object.freeze(obj.stendere);
  for (var i = 0; i < obj.stendere.length; i++) {
    Object.freeze(obj.stendere[i]);
  }
  return obj;
}


// ── Pitch ↔ vinkel ─────────────────────────────────────────────

function pitchTilGrader(pitch) {
  return Math.atan(pitch / 12) * 180 / Math.PI;
}

function graderTilPitch(grader) {
  return 12 * Math.tan(grader * Math.PI / 180);
}
