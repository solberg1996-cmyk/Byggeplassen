// ── Gavlstender-kalkulator — eksakt Blocklayer-replikasjon ─────
// Ref: https://www.blocklayer.com/gable-studs
// Alle lengder i mm, vinkler i grader.
//
// TypeScript-versjon med typer. Runtime-koden er gavlCalc.js.
// Returnerte resultater er dypt frosset (Object.freeze) —
// UI-laget må behandle dem som readonly.

// ── Typer ───────────────────────────────────────────────────────

type StartMode = 'single' | 'double' | 'doubleGap';
type MeasurePoint = 'near' | 'centre' | 'far';

interface GavlStenderInput {
  angleDeg: number;
  startHeight: number;       // "Start Height including plates" (BL-definisjon)
  studWidth: number;
  plateThick: number;
  topPlateCount: 1 | 2;
  spacing: number;           // centersLevel i BL
  lengthLevel: number;       // total vegglengde — BL itererer stendere inntil denne
  startMode: StartMode;
  measurePoint: MeasurePoint;
  alignSheets: boolean;
  startIn: number;           // offset fra veggkant (BL: txtStartIn)
}

interface Stender {
  nr: number;
  lengdeLangside: number;    // stenderlengde langside (BL: "Stud Length Long Side")
  lengdeKortside: number;    // langside - topCutSetback
  runLevel: number;          // horisontal posisjon justert for measurePoint
  runAngle: number;          // posisjon langs skrå topplem, justert for measurePoint
}

interface GavlSammendrag {
  antall: number;
  korteste: number | null;
  lengste: number | null;
  oekningPerCc: number | null;    // høydeøkning per senteravstand
  topCutSetback: number | null;   // tan(angle) * studWidth
  toppkuttVinkel: number | null;
  topPlateTotal: number | null;   // Math.ceil(plateThick + plateOnAngle * extra)
  baseHeight: number | null;      // v = startHeight - plateThick - plateOnAngle * extra
}

interface GavlStenderResultat {
  readonly gyldig: true;
  readonly input: Readonly<GavlStenderInput>;
  readonly stendere: ReadonlyArray<Readonly<Stender>>;
  readonly sammendrag: Readonly<GavlSammendrag>;
  readonly advarsler: ReadonlyArray<string>;
}

interface GavlStenderFeil {
  readonly gyldig: false;
  readonly input: Readonly<GavlStenderInput>;
  readonly stendere: ReadonlyArray<never>;
  readonly sammendrag: Readonly<GavlSammendrag>;
  readonly advarsler: ReadonlyArray<string>;
}

type GavlStenderOutput = GavlStenderResultat | GavlStenderFeil;

// ── Standardverdier ─────────────────────────────────────────────

const GAVL_STANDARDVERDIER = {
  studWidth: 48,
  plateThick: 48,
  topPlateCount: 1 as const,
  spacing: 600,
  lengthLevel: 5000,
  startMode: 'single' as StartMode,
  measurePoint: 'centre' as MeasurePoint,
  alignSheets: false,
  startIn: 0,
};

// ── Hovedfunksjon ───────────────────────────────────────────────

function beregnGavlStendere(
  input: Partial<GavlStenderInput> & { angleDeg: number; startHeight: number }
): GavlStenderOutput {
  const inp = byggGavlInput(input);
  const advarsler: string[] = [];

  if (!erGyldigGavlInput(inp)) {
    return ugyldigGavlResultat(inp);
  }

  // ── Geometri ──
  const angleRad = inp.angleDeg * Math.PI / 180;
  const slope = Math.tan(angleRad);
  const cosAngle = Math.cos(angleRad);

  // ── Plate-korreksjon (Blocklayer-modell) ──
  // Første plate: loddrett tykkelse (plateThick)
  // Ekstra plater: skråjustert (plateThick / cos(angle))
  const extraPlates = inp.topPlateCount - 1;
  const plateOnAngle = inp.plateThick / cosAngle;
  const v = inp.startHeight - inp.plateThick - plateOnAngle * extraPlates;

  // ── MeasurePoint-offset ──
  // Internt er b = ytterkant (far side) av stender.
  // Visningsposisjon justeres avhengig av measurePoint.
  let mpLevel = 0;
  let mpAngle = 0;
  if (inp.measurePoint === 'near') {
    mpLevel = inp.studWidth;
    mpAngle = inp.studWidth / cosAngle;
  } else if (inp.measurePoint === 'centre') {
    mpLevel = inp.studWidth / 2;
    mpAngle = inp.studWidth / 2 / cosAngle;
  }

  // ── Startmodus → f-verdi (Blocklayer ddStart) ──
  let f = 0;
  if (inp.startMode === 'double') f = 1;
  else if (inp.startMode === 'doubleGap') f = 2;

  // ── Stender-iterasjon (Blocklayer-logikk) ──
  let b = inp.studWidth + inp.startIn;
  const stendere: Stender[] = [];
  const topCutSetback = slope * inp.studWidth;

  while (b < inp.lengthLevel - 0.001) {
    let h: number;
    let pos: number;

    if (b < inp.lengthLevel - inp.studWidth) {
      pos = b;
      h = v + slope * b;
    } else {
      pos = inp.lengthLevel - inp.studWidth;
      h = v + slope * pos;
    }

    stendere.push(lagStender(h, pos, topCutSetback, cosAngle, mpLevel, mpAngle));

    // Dobbel stender: kun etter første stender
    if (b === inp.studWidth + inp.startIn && f > 0) {
      const doublePos = b + inp.studWidth * f;
      const hDouble = v + slope * doublePos;
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
  const hLast = v + slope * inp.lengthLevel;
  stendere.push(lagStender(hLast, inp.lengthLevel, topCutSetback, cosAngle, mpLevel, mpAngle));

  // Nummerer stendere
  for (let i = 0; i < stendere.length; i++) {
    stendere[i].nr = i + 1;
  }

  if (inp.angleDeg > 60) {
    advarsler.push('BRATT_VINKEL: Vinkel over 60° gir svært lange stendere');
  }

  return frysResultat({
    gyldig: true as const,
    input: inp,
    stendere,
    sammendrag: {
      antall: stendere.length,
      korteste: stendere.length > 0 ? stendere[0].lengdeLangside : null,
      lengste: stendere.length > 0 ? stendere[stendere.length - 1].lengdeLangside : null,
      oekningPerCc: Math.round(slope * inp.spacing),
      topCutSetback: Math.round(topCutSetback),
      toppkuttVinkel: Math.round(inp.angleDeg * 10) / 10,
      topPlateTotal: Math.ceil(inp.plateThick + plateOnAngle * extraPlates),
      baseHeight: Math.round(v),
    },
    advarsler,
  });
}

// ── Lag stender med Blocklayer-avrunding ────────────────────────
// NOTE: runAngle bruker dobbel-avrunding for å matche Blocklayer.

function lagStender(
  h: number, pos: number, topCutSetback: number,
  cosAngle: number, mpLevel: number, mpAngle: number
): Stender {
  const runAngleInternal = Math.round(pos / cosAngle);
  return {
    nr: 0,
    lengdeLangside: Math.round(h),
    lengdeKortside: Math.round(h - topCutSetback),
    runLevel: Math.round(pos - mpLevel),
    runAngle: Math.round(runAngleInternal - mpAngle),
  };
}

// ── Hjelpefunksjoner ────────────────────────────────────────────

function byggGavlInput(
  input: Partial<GavlStenderInput> & { angleDeg: number; startHeight: number }
): GavlStenderInput {
  return {
    angleDeg: input.angleDeg,
    startHeight: input.startHeight,
    studWidth: input.studWidth ?? GAVL_STANDARDVERDIER.studWidth,
    plateThick: input.plateThick ?? GAVL_STANDARDVERDIER.plateThick,
    topPlateCount: input.topPlateCount ?? GAVL_STANDARDVERDIER.topPlateCount,
    spacing: input.spacing ?? GAVL_STANDARDVERDIER.spacing,
    lengthLevel: input.lengthLevel ?? GAVL_STANDARDVERDIER.lengthLevel,
    startMode: input.startMode ?? GAVL_STANDARDVERDIER.startMode,
    measurePoint: input.measurePoint ?? GAVL_STANDARDVERDIER.measurePoint,
    alignSheets: input.alignSheets ?? GAVL_STANDARDVERDIER.alignSheets,
    startIn: input.startIn ?? GAVL_STANDARDVERDIER.startIn,
  };
}

function erGyldigGavlInput(inp: GavlStenderInput): boolean {
  return (
    inp.angleDeg > 0 &&
    inp.angleDeg < 90 &&
    inp.startHeight > 0 &&
    inp.studWidth > 0 &&
    inp.plateThick > 0 &&
    inp.spacing > 0 &&
    inp.lengthLevel > inp.studWidth
  );
}

function ugyldigGavlResultat(inp: GavlStenderInput): GavlStenderFeil {
  return frysResultat({
    gyldig: false as const,
    input: inp,
    stendere: [] as never[],
    sammendrag: {
      antall: 0, korteste: null, lengste: null,
      oekningPerCc: null, topCutSetback: null,
      toppkuttVinkel: null, topPlateTotal: null,
      baseHeight: null,
    },
    advarsler: [],
  });
}

// ── Deep freeze ────────────────────────────────────────────────

function frysResultat<T extends GavlStenderOutput>(obj: T): T {
  Object.freeze(obj);
  Object.freeze(obj.input);
  Object.freeze(obj.sammendrag);
  Object.freeze(obj.advarsler);
  Object.freeze(obj.stendere);
  for (let i = 0; i < obj.stendere.length; i++) {
    Object.freeze(obj.stendere[i]);
  }
  return obj;
}

// ── Konvertering ───────────────────────────────────────────────

function pitchTilGrader(pitch: number): number {
  return Math.atan(pitch / 12) * 180 / Math.PI;
}

function graderTilPitch(angleDeg: number): number {
  return 12 * Math.tan(angleDeg * Math.PI / 180);
}

export {
  beregnGavlStendere,
  pitchTilGrader,
  graderTilPitch,
  GavlStenderInput,
  GavlStenderOutput,
  GavlStenderResultat,
  GavlStenderFeil,
  GavlSammendrag,
  Stender,
  StartMode,
  MeasurePoint,
};
