// ── Taksperre-kalkulator — beregningsmotor ──────────────────────
// Alle lengder i mm (heltall), vinkler i grader (én desimal).
// Formler verifisert mot 27 Blocklayer-cases (maks avvik ±0.5 mm).
//
// beregnTaksperre({ run: 3000, takvinkel: 30 })
//   → { gyldig: true, sperreTopLengde: 3811, ... }
//
// beregnTaksperre({ run: 0, takvinkel: 0 })
//   → { gyldig: false, sperreTopLengde: null, ... }

var TAKSPERRE_STANDARDVERDIER = {
  utstikk: 300,
  sperrehoyde: 198,
  fuglehakkBredde: 100
};

function beregnTaksperre(input) {
  var inp = byggInput(input);
  var advarsler = [];

  if (!erGyldigInput(inp)) {
    return ugyldigResultat(inp);
  }

  var rad = tilRadianer(inp.takvinkel);

  var totalRun = inp.run + inp.utstikk;
  var sperreTopLengde = totalRun / Math.cos(rad);
  var loddskjaerSetback = inp.sperrehoyde * Math.tan(rad);
  var sperreTotalLengde = sperreTopLengde + loddskjaerSetback;
  var kuttlengde = inp.sperrehoyde / Math.cos(rad);
  var fuglehakkDybde = inp.fuglehakkBredde * Math.tan(rad);
  var hap = kuttlengde - fuglehakkDybde;
  var rise = inp.run * Math.tan(rad) + hap;
  var totalFall = totalRun * Math.tan(rad);
  var utstikkFall = inp.utstikk * Math.tan(rad);
  var utstikkLangsSperre = inp.utstikk / Math.cos(rad);
  var underkantStigning = rise - kuttlengde;

  var maksFuglehakkDybde = inp.sperrehoyde / 3;

  if (fuglehakkDybde > maksFuglehakkDybde) {
    advarsler.push(
      'GARPEHAKK_FOR_DYPT: Garpehakket er dypere enn 1/3 av sperrehøyden'
      + ' (dybde ' + avrundLengde(fuglehakkDybde) + ' mm,'
      + ' maks ' + avrundLengde(maksFuglehakkDybde) + ' mm)'
    );
  }

  return {
    gyldig: true,
    input: inp,

    sperreTopLengde: avrundLengde(sperreTopLengde),
    sperreTotalLengde: avrundLengde(sperreTotalLengde),

    loddskjaerSetback: avrundLengde(loddskjaerSetback),
    loddskjaerVinkel: avrundVinkel(inp.takvinkel),
    kuttlengde: avrundLengde(kuttlengde),

    fuglehakkBredde: avrundLengde(inp.fuglehakkBredde),
    fuglehakkDybde: avrundLengde(fuglehakkDybde),
    fuglehakkVinkel: avrundVinkel(90 - inp.takvinkel),
    maksFuglehakkDybde: avrundLengde(maksFuglehakkDybde),

    totalRun: avrundLengde(totalRun),
    rise: avrundLengde(rise),
    totalFall: avrundLengde(totalFall),
    utstikkFall: avrundLengde(utstikkFall),
    utstikkLangsSperre: avrundLengde(utstikkLangsSperre),
    underkantStigning: avrundLengde(underkantStigning),
    hap: avrundLengde(hap),

    advarsler: advarsler
  };
}


// ── Hjelpefunksjoner ────────────────────────────────────────────

function byggInput(input) {
  input = input || {};
  return {
    run: Number(input.run) || 0,
    takvinkel: Number(input.takvinkel) || 0,
    utstikk: finnVerdi(input.utstikk, TAKSPERRE_STANDARDVERDIER.utstikk),
    sperrehoyde: finnVerdi(input.sperrehoyde, TAKSPERRE_STANDARDVERDIER.sperrehoyde),
    fuglehakkBredde: finnVerdi(input.fuglehakkBredde, TAKSPERRE_STANDARDVERDIER.fuglehakkBredde)
  };
}

function finnVerdi(verdi, standard) {
  var tall = Number(verdi);
  return (tall > 0) ? tall : standard;
}

function erGyldigInput(inp) {
  return inp.run > 0
    && inp.takvinkel > 0
    && inp.takvinkel < 90
    && inp.sperrehoyde > 0
    && inp.fuglehakkBredde >= 0;
}

function tilRadianer(grader) {
  return grader * Math.PI / 180;
}

function avrundLengde(mm) {
  return Math.round(mm);
}

function avrundVinkel(grader) {
  return Math.round(grader * 10) / 10;
}

function ugyldigResultat(inp) {
  return {
    gyldig: false,
    input: inp,

    sperreTopLengde: null,
    sperreTotalLengde: null,

    loddskjaerSetback: null,
    loddskjaerVinkel: null,
    kuttlengde: null,

    fuglehakkBredde: null,
    fuglehakkDybde: null,
    fuglehakkVinkel: null,
    maksFuglehakkDybde: null,

    totalRun: null,
    rise: null,
    totalFall: null,
    utstikkFall: null,
    utstikkLangsSperre: null,
    underkantStigning: null,
    hap: null,

    advarsler: []
  };
}
