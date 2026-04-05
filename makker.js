   console.log('MAKKER JS LASTET');
    // ── TRAPPEKALKULATOR — BEREGNINGSMOTOR (alt i mm) ────────────────────────

    // Faktisk opptrinn = total høyde delt på antall opptrinn.
    // Returnerer null hvis input mangler eller antall < 1.
    //
    // beregnFaktiskOpptrinn(2800, 16)  → 175.0
    // beregnFaktiskOpptrinn(2750, 16)  → 171.875
    // beregnFaktiskOpptrinn(2400, 14)  → 171.428...
    // beregnFaktiskOpptrinn(0, 16)     → null
    // beregnFaktiskOpptrinn(2800, 0)   → null
    function beregnFaktiskOpptrinn(totalHoydeMm, antallOpptrinn) {
      if (!totalHoydeMm || !antallOpptrinn || antallOpptrinn < 1) return null;
      return totalHoydeMm / antallOpptrinn;
    }

    // Antall inntrinn er alltid ett mindre enn antall opptrinn.
    // Toppgulv regnes som øverste nivå — ikke eget inntrinn.
    //
    // beregnAntallInntrinn(16) → 15
    // beregnAntallInntrinn(14) → 13
    // beregnAntallInntrinn(1)  → 0
    // beregnAntallInntrinn(0)  → null
    function beregnAntallInntrinn(antallOpptrinn) {
      if (!antallOpptrinn || antallOpptrinn < 1) return null;
      return antallOpptrinn - 1;
    }

    // Total innløp = horisontal lengde trappen opptar.
    // = inntrinnsdybde × antall inntrinn.
    //
    // beregnTotalInnlop(250, 15) → 3750
    // beregnTotalInnlop(260, 13) → 3380
    // beregnTotalInnlop(0, 15)   → null
    // beregnTotalInnlop(250, 0)  → null
    function beregnTotalInnlop(inntrinnMm, antallInntrinn) {
      if (!inntrinnMm || !antallInntrinn || antallInntrinn < 1) return null;
      return inntrinnMm * antallInntrinn;
    }

    // Trappeformelen: 2 × opptrinn + inntrinn.
    // Anbefalt område: 600–640 mm.
    //
    // beregnTrappeformel(175, 250) → 600
    // beregnTrappeformel(180, 250) → 610
    // beregnTrappeformel(190, 250) → 630
    // beregnTrappeformel(175, 0)   → null
    // beregnTrappeformel(0, 250)   → null
    function beregnTrappeformel(opptrinnMm, inntrinnMm) {
      if (!opptrinnMm || !inntrinnMm) return null;
      return 2 * opptrinnMm + inntrinnMm;
    }

    // Teoretisk vangelengde = hypotenusen av total høyde og total innløp.
    // Dette er minimumslengden på råmaterialet, uten kappetillegg.
    //
    // beregnVangeLengde(2800, 3750) → 4683.6...
    // beregnVangeLengde(2400, 3380) → 4143.0...
    // beregnVangeLengde(2800, 0)    → null
    // beregnVangeLengde(0, 3750)    → null
    function beregnVangeLengde(totalHoydeMm, totalInnlopMm) {
      if (!totalHoydeMm || !totalInnlopMm) return null;
      return Math.sqrt(totalHoydeMm * totalHoydeMm + totalInnlopMm * totalInnlopMm);
    }

    // Stigningsvinkel i grader fra horisontal.
    // Grunnlag: atan(høyde / innløp).
    // Anbefalt område for trappevinkel: 25°–45°.
    //
    // beregnTrappeVinkelGrader(2800, 3750) → 36.65...
    // beregnTrappeVinkelGrader(2400, 3380) → 35.39...
    // beregnTrappeVinkelGrader(175, 250)   → 34.99...  (per trinn — samme vinkel)
    // beregnTrappeVinkelGrader(2800, 0)    → null
    // beregnTrappeVinkelGrader(0, 3750)    → null
    // Kappvinkler V1: begge = 90° - trappevinkel
    function beregnToppVinkelGrader(trappevinkelGrader) {
      if (trappevinkelGrader === null || !isFinite(trappevinkelGrader)) return null;
      return 90 - trappevinkelGrader;
    }
    function beregnBunnVinkelGrader(trappevinkelGrader) {
      if (trappevinkelGrader === null || !isFinite(trappevinkelGrader)) return null;
      return 90 - trappevinkelGrader;
    }

    function beregnTrappeVinkelGrader(totalHoydeMm, totalInnlopMm) {
      if (!totalHoydeMm || !totalInnlopMm) return null;
      return Math.atan2(totalHoydeMm, totalInnlopMm) * (180 / Math.PI);
    }

    // Trinnplater V1: antall = antall inntrinn, mål direkte fra input
    // Genererer koordinatliste for merking av hakk på vangen.
    // Startpunkt (0,0) = bunn av første trinn.
    // x = horisontal posisjon, y = loddrett posisjon — begge i mm.
    function beregnVangeHakk(antallInntrinn, opptrinnMm, inntrinnMm) {
      if (!antallInntrinn || antallInntrinn < 1 || !opptrinnMm || !inntrinnMm) return [];
      var hakk = [];
      var x = 0, y = 0;
      for (var i = 0; i < antallInntrinn; i++) {
        x += inntrinnMm;
        y += opptrinnMm;
        hakk.push({ nr: i + 1, xMm: x, yMm: y, opptrinnMm: opptrinnMm, inntrinnMm: inntrinnMm,
          avstandLangsVangeMm: Math.sqrt(x * x + y * y) });
      }
      return hakk;
    }

    function beregnAntallTrinnplater(antallInntrinn) {
      if (antallInntrinn === null || antallInntrinn < 0) return null;
      return antallInntrinn;
    }
    function beregnTrinnplateDybde(inntrinnMm) {
      if (!inntrinnMm || !isFinite(inntrinnMm)) return null;
      return inntrinnMm;
    }
    function beregnTrinnplateBredde(trappebreddeMm) {
      if (!trappebreddeMm || !isFinite(trappebreddeMm)) return null;
      return trappebreddeMm;
    }
    function beregnTrinnplateTykkelse(trinnTykkelseMm) {
      if (!trinnTykkelseMm || !isFinite(trinnTykkelseMm)) return null;
      return trinnTykkelseMm;
    }

    // ── TRAPP — ANBEFALTE GRENSER (mm) ───────────────────────────────────────
    var MIN_OPPTRINN_MM     = 150;
    var MAX_OPPTRINN_MM     = 220;
    var MIN_INNTRINN_MM     = 250;
    var MIN_TRAPPEFORMEL_MM = 600;
    var MAX_TRAPPEFORMEL_MM = 640;

    // Returnerer true/false hvis verdi er gyldig, null hvis input mangler
    function erOpptrinnInnenfor(opptrinnMm) {
      if (opptrinnMm === null || !isFinite(opptrinnMm)) return null;
      return opptrinnMm >= MIN_OPPTRINN_MM && opptrinnMm <= MAX_OPPTRINN_MM;
    }
    function erInntrinnInnenfor(inntrinnMm) {
      if (inntrinnMm === null || !isFinite(inntrinnMm)) return null;
      return inntrinnMm >= MIN_INNTRINN_MM;
    }
    function erTrappeformelInnenfor(trappeformelMm) {
      if (trappeformelMm === null || !isFinite(trappeformelMm)) return null;
      return trappeformelMm >= MIN_TRAPPEFORMEL_MM && trappeformelMm <= MAX_TRAPPEFORMEL_MM;
    }

    // ── KLEDNING BEREGNINGSMOTOR ──────────────────────────────────────────
    // Modell: Dekningsmål = underliggerBredde + overliggerBredde - 50
    // Omlegg minimum = 15mm, anbefalt ~25mm

    function byggLosning(startOver, feltLengde, underliggerBredde, overliggerBredde, ideeltDekningsmaal) {
      var dekningsmaalCandidate, antallDekningsmaal, antallUnderliggere, antallOverliggere, redusertFeltlengde;

      if (startOver) {
        // Over-over
        redusertFeltlengde = feltLengde - overliggerBredde;
      } else {
        // Under-under
        redusertFeltlengde = feltLengde - underliggerBredde;
      }

      // Test floor
      dekningsmaalCandidate = Math.floor(redusertFeltlengde / ideeltDekningsmaal);
      if (dekningsmaalCandidate < 1) dekningsmaalCandidate = 1;
      antallDekningsmaal = dekningsmaalCandidate;

      if (startOver) {
        antallUnderliggere = antallDekningsmaal;
        antallOverliggere = antallDekningsmaal + 1;
      } else {
        antallUnderliggere = antallDekningsmaal + 1;
        antallOverliggere = antallDekningsmaal;
      }

      var justertDekningsmaal = redusertFeltlengde / antallDekningsmaal;

      return {
        kandidat: 'floor',
        antallDekningsmaal: antallDekningsmaal,
        antallUnderliggere: antallUnderliggere,
        antallOverliggere: antallOverliggere,
        justertDekningsmaal: justertDekningsmaal
      };
    }
// ⚠️ IKKE ENDRE beregnTommermannskledning uten å kjøre testKledningMedFasit()
// Denne funksjonen matcher ekstern kalkulator 1:1
function beregnTommermannskledning(input) {
  var L = input.feltLengdeMm;
  var U = input.underliggerBreddeMm;
  var O = input.overliggerBreddeMm;
  var startOver = input.startType === 'overligger';
  var sluttOver = input.stoppType === 'overligger';

  if (!L || L <= 0) {
    return { feil: true, feiltekst: 'Feltlengde må være > 0' };
  }

  var ideelt = U + O - 50;

  function bygg(k) {
    if (k < 1) return null;

    // 1. fjern startbord (IKKE slutt)
    var redusert = L - (startOver ? O : U);

    // 2. fordel likt
    var dekningsmaal = redusert / k;

    // 3. regn omlegg
    var omlegg = (U + O - dekningsmaal) / 2;

    if (omlegg < 15) return null;

    // 4. antall bord
    var under = startOver ? k : k + 1;
    var over = startOver ? k + 1 : k;

    // juster for slutt
    if (sluttOver) over++;
    else under++;

    // 5. offset
    var offset = startOver ? (O - omlegg) : 0;

    // 6. posisjoner
    var pos = [];
    for (var i = 0; i < under; i++) {
      pos.push({
        nr: i + 1,
        posisjonMm: i * dekningsmaal + offset
      });
    

    return {
      antallDekningsmaal: k,
      justertDekningsmaalMm: dekningsmaal,
      justertOmleggMm: omlegg,
      antallUnderliggere: under,
      antallOverliggere: over,
      oppmerkingsliste: pos
    };
  }

  var redusert = L - (startOver ? O : U);
  var ratio = redusert / ideelt;

  var a = bygg(Math.floor(ratio));
  var b = bygg(Math.ceil(ratio));

  function score(x) {
    return Math.abs(x.justertOmleggMm - 25);
  }

  var anbefalt = null;
  var alternativ = null;

  if (a && b) {
    if (score(a) < score(b)) {
      anbefalt = a;
      alternativ = b;
    } else {
      anbefalt = b;
      alternativ = a;
    }
  } else {
    anbefalt = a || b;
  }

  return {
    feil: false,
    ideeltDekningsmaalMm: ideelt,
    anbefalt: anbefalt,
    alternativ: alternativ
  };
}
  var feltLengdeMm = input.feltLengdeMm;
  var underliggerBreddeMm = input.underliggerBreddeMm;
  var overliggerBreddeMm = input.overliggerBreddeMm;
  var startType = input.startType;
  var stoppType = input.stoppType;

  if (!feltLengdeMm || feltLengdeMm <= 0) {
    return { feil: true, feiltekst: 'Feltlengde må være et positivt tall større enn 0.' };
  }

  var ideeltDekningsmaalMm = underliggerBreddeMm + overliggerBreddeMm - 50;

  function byggLosning(k) {
    if (k <= 0) return null;

    var startOver = startType === 'overligger';
    var sluttOver = stoppType === 'overligger';

    var divisor = 2 * k + (startOver ? 1 : 0) + (sluttOver ? 1 : 0);

    var omlegg =
      (
        k * (underliggerBreddeMm + overliggerBreddeMm) +
        (startOver ? overliggerBreddeMm : 0) +
        (sluttOver ? overliggerBreddeMm : underliggerBreddeMm) -
        feltLengdeMm
      ) / divisor;

    if (omlegg < 15) return null;

    var dekningsmaal = underliggerBreddeMm + overliggerBreddeMm - 2 * omlegg;

    var underAnt = k + 1;
    var overAnt = underAnt - 1 + (startOver ? 1 : 0) + (sluttOver ? 1 : 0);

    var offset = startOver ? (overliggerBreddeMm - omlegg) : 0;

    var pos = [];
    for (var i = 0; i < underAnt; i++) {
      pos.push({
        nr: i + 1,
        posisjonMm: i * dekningsmaal + offset
      });
    }

    return {
      antallDekningsmaal: k,
      justertDekningsmaalMm: dekningsmaal,
      justertOmleggMm: omlegg,
      antallUnderliggere: underAnt,
      antallOverliggere: overAnt,
      oppmerkingsliste: pos
    };
  }

var startOver = startType === 'overligger';

var justertLengde = feltLengdeMm - (startOver ? overliggerBreddeMm : 0);

var ratio = justertLengde / ideeltDekningsmaalMm;
  var a = byggLosning(Math.floor(ratio));
  var b = byggLosning(Math.ceil(ratio));

  return {
    feil: false,
    ideeltDekningsmaalMm: ideeltDekningsmaalMm,
    anbefalt: a || b,
    alternativ: null
  };
}

function testKledningMedFasit() {
  var tester = [
    {
      navn: 'Over -> Under',
      input: {
        feltLengdeMm: 6213,
        underliggerBreddeMm: 148,
        overliggerBreddeMm: 148,
        startType: 'overligger',
        stoppType: 'underligger'
      },
      forventet: {
        dekningsmaalCm: '24.8',
        omleggCm: '2.4',
        under: 25,
        over: 25,
        dekningsmaalTotalt: 24
      }
    },
    {
      navn: 'Over -> Over',
      input: {
        feltLengdeMm: 6213,
        underliggerBreddeMm: 148,
        overliggerBreddeMm: 148,
        startType: 'overligger',
        stoppType: 'overligger'
      },
      forventet: {
        dekningsmaalCm: '24.9',
        omleggCm: '2.4',
        under: 25,
        over: 26,
        dekningsmaalTotalt: 24
      }
    }
  ];

  console.log('--- TEST MED FASIT START ---');

  for (var i = 0; i < tester.length; i++) {
    var t = tester[i];
    var res = beregnTommermannskledning(t.input);

    if (!res || res.feil || !res.anbefalt) {
      console.error(t.navn + ': FEIL', res);
      continue;
    }

    var faktisk = {
      dekningsmaalCm: (res.anbefalt.justertDekningsmaalMm / 10).toFixed(1),
      omleggCm: (res.anbefalt.justertOmleggMm / 10).toFixed(1),
      under: res.anbefalt.antallUnderliggere,
      over: res.anbefalt.antallOverliggere,
      dekningsmaalTotalt: res.anbefalt.antallDekningsmaal
    };

    var ok =
      faktisk.dekningsmaalCm === t.forventet.dekningsmaalCm &&
      faktisk.omleggCm === t.forventet.omleggCm &&
      faktisk.under === t.forventet.under &&
      faktisk.over === t.forventet.over &&
      faktisk.dekningsmaalTotalt === t.forventet.dekningsmaalTotalt;

    if (ok) {
      console.log('✅ ' + t.navn + ' OK', faktisk);
    } else {
      console.error('❌ ' + t.navn + ' FEIL');
      console.log('Forventet:', t.forventet);
      console.log('Faktisk:', faktisk);
    }
  }

  console.log('--- TEST MED FASIT SLUTT ---');
}

    // ── KLEDNINGSKALKULATOR ───────────────────────────────────────────────

var _kledningInput = {
  feltLengde: 3000,
  underliggerBredde: 148,
  overliggerBredde: 148,
  startType: 'underligger',
  stoppType: 'underligger'
};

function renderKledningTool() {
  var inp = 'width:100%;padding:12px 14px;border:1.5px solid var(--line);border-radius:var(--radius-xs);font-size:16px;box-sizing:border-box;font-family:inherit;background-color:var(--card);transition:border-color var(--dur-fast) var(--ease)';
  var lbl = 'display:block;font-size:12px;font-weight:700;margin-bottom:6px;color:var(--muted);text-transform:uppercase;letter-spacing:0.3px';
  var select = 'width:100%;padding:12px 38px 12px 14px;border:1.5px solid var(--line);border-radius:var(--radius-xs);font-size:16px;box-sizing:border-box;font-family:inherit;background-color:var(--card);transition:border-color var(--dur-fast) var(--ease)';
  var unit = 'position:absolute;right:14px;top:50%;transform:translateY(-50%);font-size:12px;font-weight:600;color:var(--muted);pointer-events:none';
  var inputWrap = 'position:relative';

  return '<div style="width:100%;max-width:540px;margin:0 auto;padding:20px 16px">'

    // Header
    + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;gap:12px">'
    + '<div style="display:flex;align-items:center;gap:10px;flex:1">'
    + makkerBackBtn('openMakkerTool(null)')
    + '<h1 style="font-size:20px;font-weight:800;margin:0;color:var(--text);font-family:var(--font-display)">Tømmermannskledning</h1>'
    + '</div>'
    + '<button onclick="openKledningInfoModal()" style="background:var(--bg-warm);border:1.5px solid var(--line);color:var(--muted-strong);font-size:12px;font-weight:700;cursor:pointer;padding:6px 12px;border-radius:var(--radius-xs);transition:background var(--dur-normal) var(--ease)">Info</button>'
    + '</div>'

    // Input Card
    + '<div style="background:var(--card);border:1.5px solid var(--line);border-radius:var(--radius-sm);padding:20px;margin-bottom:24px;box-shadow:var(--shadow-sm)">'

    // Feltlengde — full width, primary input
    + '<div style="margin-bottom:16px">'
    + '<label style="' + lbl + '">Feltlengde</label>'
    + '<div style="' + inputWrap + '">'
    + '<input id="kledFeltlengde" type="number" value="' + _kledningInput.feltLengde + '" oninput="calcKledning()" style="' + inp + ';padding-right:42px" placeholder="3000" />'
    + '<span style="' + unit + '">mm</span>'
    + '</div>'
    + '</div>'

    // Bredder — side by side
    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">'
    + '<div>'
    + '<label style="' + lbl + '">Underligger</label>'
    + '<div style="' + inputWrap + '">'
    + '<input id="kledUnderligger" type="number" value="' + _kledningInput.underliggerBredde + '" oninput="calcKledning()" style="' + inp + ';padding-right:42px" placeholder="148" />'
    + '<span style="' + unit + '">mm</span>'
    + '</div>'
    + '</div>'
    + '<div>'
    + '<label style="' + lbl + '">Overligger</label>'
    + '<div style="' + inputWrap + '">'
    + '<input id="kledOverligger" type="number" value="' + _kledningInput.overliggerBredde + '" oninput="calcKledning()" style="' + inp + ';padding-right:42px" placeholder="148" />'
    + '<span style="' + unit + '">mm</span>'
    + '</div>'
    + '</div>'
    + '</div>'

    // Start/stopp — side by side
    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">'
    + '<div>'
    + '<label style="' + lbl + '">Start med</label>'
    + '<select id="kledStartType" onchange="calcKledning()" style="' + select + '">'
    + '<option value="underligger" ' + (_kledningInput.startType === 'underligger' ? 'selected' : '') + '>Underligger</option>'
    + '<option value="overligger" ' + (_kledningInput.startType === 'overligger' ? 'selected' : '') + '>Overligger</option>'
    + '</select>'
    + '</div>'
    + '<div>'
    + '<label style="' + lbl + '">Avslutt med</label>'
    + '<select id="kledStoppType" onchange="calcKledning()" style="' + select + '">'
    + '<option value="underligger" ' + (_kledningInput.stoppType === 'underligger' ? 'selected' : '') + '>Underligger</option>'
    + '<option value="overligger" ' + (_kledningInput.stoppType === 'overligger' ? 'selected' : '') + '>Overligger</option>'
    + '</select>'
    + '</div>'
    + '</div>'

    + '</div>'

    // Results area
    + '<div id="kledResultat" style="min-height:60px;display:flex;flex-direction:column;align-items:center;justify-content:center">'
    + '<div style="color:var(--muted);font-size:14px">Fyll inn verdier for \u00e5 beregne...</div>'
    + '</div>'

    + '</div>'

    // Info modal
    + '<div id="kledningInfoModal" style="display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:9999;overflow:auto" onclick="if(event.target.id===\'kledningInfoModal\')closeKledningInfoModal()">'
    + '<div style="background:var(--card);border-radius:var(--radius);margin:40px auto;padding:24px;max-width:500px;width:90%;box-shadow:var(--shadow-xl)">'
    + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">'
    + '<h2 style="font-size:18px;font-weight:800;margin:0;font-family:var(--font-display)">Forklaring av m\u00e5l og begreper</h2>'
    + '<button onclick="closeKledningInfoModal()" style="background:var(--bg-warm);border:1.5px solid var(--line);color:var(--muted-strong);width:32px;height:32px;border-radius:var(--radius-xs);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px;font-family:var(--font-body)">X</button>'
    + '</div>'
    + '<p style="color:var(--muted);font-size:14px;line-height:1.6;margin-bottom:20px">Her er en visuell forklaring av de viktigste m\u00e5lene og begrepene brukt i t\u00f8mmermannskledning.</p>'
    + '<div style="display:grid;gap:16px">'
    + '<div style="text-align:center">'
    + '<img src="img/kledning-info-1.jpg" style="width:100%;border-radius:var(--radius-xs);background:var(--bg-warm)" alt="M\u00e5l og oppbygging" />'
    + '<p style="font-size:12px;color:var(--muted);margin-top:8px;margin-bottom:0">M\u00e5l og oppbygging</p>'
    + '</div>'
    + '<div style="text-align:center">'
    + '<img src="img/kledning-info-2.jpg" style="width:100%;border-radius:var(--radius-xs);background:var(--bg-warm)" alt="Begreper og plassering" />'
    + '<p style="font-size:12px;color:var(--muted);margin-top:8px;margin-bottom:0">Begreper og plassering</p>'
    + '</div>'
    + '</div>'
    + '<button onclick="closeKledningInfoModal()" style="width:100%;padding:12px;margin-top:20px;background:var(--accent-soft);border:1.5px solid var(--line);border-radius:var(--radius-xs);font-weight:700;color:var(--accent-hover);cursor:pointer;font-size:14px;transition:all var(--dur-normal) var(--ease)">Lukk</button>'
    + '</div>'
    + '</div>'

    + '</div>';
}
    console.log('renderKledningTool definert', typeof renderKledningTool);

    // ── Kledning Modal ────────────────────────────────────────────────────
    window.openKledningInfoModal = function() {
      var modal = document.getElementById('kledningInfoModal');
      if (modal) modal.style.display = 'block';
    };

    window.closeKledningInfoModal = function() {
      var modal = document.getElementById('kledningInfoModal');
      if (modal) modal.style.display = 'none';
    };

    // ── Kledning Resultat UI ──────────────────────────────────────────────
    function renderKledningResultatUI(res) {
      if (res.feil) {
        return '<div style="background:var(--red-soft);border:1.5px solid rgba(196,91,91,.25);border-radius:var(--radius-sm);padding:16px;color:var(--red);font-weight:700;font-size:14px">'
          + res.feiltekst
          + '</div>';
      }

      var a = res.anbefalt;
      var alt = res.alternativ;
      var unit = '<span style="font-size:12px;font-weight:600;color:var(--muted);margin-left:2px">';
      var h = '';

      // ── Anbefalt: hero measurement card (full width) ──
      h += '<div style="width:100%;background:var(--card);border:1.5px solid var(--accent);border-radius:var(--radius);padding:0;overflow:hidden;margin-bottom:16px;box-shadow:var(--shadow)">';

      // Accent top bar with label
      h += '<div style="background:var(--accent);padding:10px 20px;display:flex;align-items:center;justify-content:space-between">'
        + '<span style="font-family:var(--font-display);font-size:13px;font-weight:800;color:var(--text);text-transform:uppercase;letter-spacing:0.5px">Anbefalt</span>'
        + '<span style="font-family:var(--font-mono);font-size:13px;font-weight:700;color:var(--text)">'
        + (a.antallUnderliggere + a.antallOverliggere) + ' bord totalt</span>'
        + '</div>';

      // Hero numbers: dekningsmal + omlegg side by side, large
      h += '<div style="padding:24px 20px 20px;display:flex;gap:0">';

      // Dekningsmal -- primary large number
      h += '<div style="flex:1;border-right:1px solid var(--line);padding-right:20px">'
        + '<div style="font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.3px;margin-bottom:6px">Dekningsm\u00e5l</div>'
        + '<div style="font-family:var(--font-display);font-size:36px;font-weight:800;color:var(--text);line-height:1;font-variant-numeric:tabular-nums">'
        + (a.justertDekningsmaalMm / 10).toFixed(1)
        + unit + 'cm</span></div>'
        + '</div>';

      // Omlegg
      h += '<div style="flex:1;padding-left:20px">'
        + '<div style="font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.3px;margin-bottom:6px">Omlegg</div>'
        + '<div style="font-family:var(--font-display);font-size:36px;font-weight:800;color:var(--text);line-height:1;font-variant-numeric:tabular-nums">'
        + (a.justertOmleggMm / 10).toFixed(1)
        + unit + 'cm</span></div>'
        + '</div>';

      h += '</div>';

      // Board breakdown row
      h += '<div style="padding:0 20px 20px;display:flex;gap:12px">'
        + '<div style="flex:1;background:var(--bg);border-radius:var(--radius-xs);padding:10px 14px;display:flex;justify-content:space-between;align-items:baseline">'
        + '<span style="font-size:12px;font-weight:600;color:var(--muted)">Underliggere</span>'
        + '<span style="font-family:var(--font-mono);font-size:15px;font-weight:800;color:var(--text);font-variant-numeric:tabular-nums">' + a.antallUnderliggere + unit + 'stk</span></span>'
        + '</div>'
        + '<div style="flex:1;background:var(--bg);border-radius:var(--radius-xs);padding:10px 14px;display:flex;justify-content:space-between;align-items:baseline">'
        + '<span style="font-size:12px;font-weight:600;color:var(--muted)">Overliggere</span>'
        + '<span style="font-family:var(--font-mono);font-size:15px;font-weight:800;color:var(--text);font-variant-numeric:tabular-nums">' + a.antallOverliggere + unit + 'stk</span></span>'
        + '</div>'
        + '</div>';

      h += '</div>';

      // ── Utdelingsmal: directly below Anbefalt (full width) ──
      if (a.oppmerkingsliste && a.oppmerkingsliste.length > 0) {
        h += '<div style="width:100%;background:var(--card);border:1px solid var(--line);border-radius:var(--radius);padding:0;overflow:hidden;margin-bottom:16px">';

        // Header
        h += '<div style="padding:14px 20px 12px;border-bottom:1px solid var(--line);display:flex;align-items:baseline;justify-content:space-between">'
          + '<span style="font-size:11px;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:0.5px">Utdelingsm\u00e5l</span>'
          + '<span style="font-size:11px;font-weight:600;color:var(--muted)">' + a.oppmerkingsliste.length + ' merker</span>'
          + '</div>';

        // Sequential measurement strip
        h += '<div style="padding:16px 20px;overflow-x:auto;-webkit-overflow-scrolling:touch">'
          + '<div style="display:flex;align-items:stretch;min-width:min-content;position:relative">';

        for (var i = 0; i < a.oppmerkingsliste.length; i++) {
          var m = a.oppmerkingsliste[i];
          var isLast = i === a.oppmerkingsliste.length - 1;

          // Each measurement marker
          h += '<div style="display:flex;align-items:stretch;flex-shrink:0">';

          // The marker itself
          h += '<div style="display:flex;flex-direction:column;align-items:center;padding:0 2px;min-width:56px">'
            + '<div style="font-size:10px;font-weight:700;color:var(--muted);margin-bottom:4px">U' + m.nr + '</div>'
            + '<div style="width:2px;height:12px;background:var(--accent);border-radius:1px;margin-bottom:4px"></div>'
            + '<div style="font-family:var(--font-mono);font-size:15px;font-weight:800;color:var(--text);font-variant-numeric:tabular-nums;white-space:nowrap">'
            + (m.posisjonMm / 10).toFixed(1) + '</div>'
            + '</div>';

          // Connecting line to next marker
          if (!isLast) {
            h += '<div style="display:flex;align-items:center;padding:0 2px;align-self:center;margin-top:12px">'
              + '<div style="width:16px;height:1px;background:var(--line-strong)"></div>'
              + '</div>';
          }

          h += '</div>';
        }

        h += '</div></div>';

        // Unit label at bottom
        h += '<div style="padding:8px 20px 12px;border-top:1px solid var(--line);background:var(--bg)">'
          + '<span style="font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.3px">Alle m\u00e5l i cm fra venstre kant</span>'
          + '</div>';

        h += '</div>';
      }

      // ── Alternativ: compact secondary card (full width) ──
      if (alt) {
        h += '<div style="width:100%;background:var(--card);border:1px solid var(--line);border-radius:var(--radius-sm);padding:16px 20px">'
          + '<div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:12px">'
          + '<span style="font-size:11px;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:0.5px">Alternativ</span>'
          + '<span style="font-family:var(--font-mono);font-size:12px;font-weight:600;color:var(--muted)">'
          + (alt.antallUnderliggere + alt.antallOverliggere) + ' bord</span>'
          + '</div>';

        // Compact row layout -- all 4 values in a single line with separators
        h += '<div style="display:flex;gap:0;align-items:baseline;flex-wrap:wrap">'
          + '<div style="flex:1;min-width:0;padding-right:16px">'
          + '<div style="font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.2px;margin-bottom:2px">Dekningsm\u00e5l</div>'
          + '<div style="font-family:var(--font-display);font-size:22px;font-weight:800;color:var(--text);font-variant-numeric:tabular-nums;line-height:1.1">'
          + (alt.justertDekningsmaalMm / 10).toFixed(1) + unit + 'cm</span></div>'
          + '</div>'
          + '<div style="width:1px;height:28px;background:var(--line);margin-right:16px;flex-shrink:0"></div>'
          + '<div style="flex:1;min-width:0;padding-right:16px">'
          + '<div style="font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.2px;margin-bottom:2px">Omlegg</div>'
          + '<div style="font-family:var(--font-display);font-size:22px;font-weight:800;color:var(--text);font-variant-numeric:tabular-nums;line-height:1.1">'
          + (alt.justertOmleggMm / 10).toFixed(1) + unit + 'cm</span></div>'
          + '</div>'
          + '<div style="width:1px;height:28px;background:var(--line);margin-right:16px;flex-shrink:0"></div>'
          + '<div style="display:flex;gap:16px">'
          + '<div>'
          + '<div style="font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.2px;margin-bottom:2px">Underl.</div>'
          + '<div style="font-family:var(--font-mono);font-size:15px;font-weight:800;color:var(--text)">' + alt.antallUnderliggere + '</div>'
          + '</div>'
          + '<div>'
          + '<div style="font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.2px;margin-bottom:2px">Overl.</div>'
          + '<div style="font-family:var(--font-mono);font-size:15px;font-weight:800;color:var(--text)">' + alt.antallOverliggere + '</div>'
          + '</div>'
          + '</div>'
          + '</div>';

        h += '</div>';
      }

      return h;
    }

    window.calcKledning = function() {
  if (!document.getElementById('kledFeltlengde')) return;

  _kledningInput.feltLengde = Number(document.getElementById('kledFeltlengde').value);
  _kledningInput.underliggerBredde = Number(document.getElementById('kledUnderligger').value);
  _kledningInput.overliggerBredde = Number(document.getElementById('kledOverligger').value);
  _kledningInput.startType = document.getElementById('kledStartType').value;
  _kledningInput.stoppType = document.getElementById('kledStoppType').value;

  var res = beregnTommermannskledning({
    feltLengdeMm: _kledningInput.feltLengde,
    underliggerBreddeMm: _kledningInput.underliggerBredde,
    overliggerBreddeMm: _kledningInput.overliggerBredde,
    startType: _kledningInput.startType,
    stoppType: _kledningInput.stoppType
  });

  var el = document.getElementById('kledResultat');
  if (!el) return;

  // Bruk den nye renderKledningResultatUI() for å generere resultatet
  el.innerHTML = renderKledningResultatUI(res);
};


    // ── INNDELINGSKALKULATOR ────────────────────────────────────────────────

    var _inndelingModus = 'lik'; // 'lik' | 'begge' | 'en'
    var _inndelingAntallJustering = 0; // +/- justering fra beregnet antall

    // Beregningslogikk for tre moduser
    function beregnInndeling(totalLengde, materialBredde, mellomrom, modus, antallJustering) {
      if (!totalLengde || totalLengde <= 0 || !materialBredde || materialBredde <= 0 || !mellomrom || mellomrom <= 0) {
        return null;
      }

      if (modus === 'lik') {
        // Materialbredde er fast, kun mellomrom justeres
        // Mønster: [M][G][M][G]...[M]
        // totalLengde = n * materialBredde + (n-1) * gap
        var nBeregnet = Math.round((totalLengde + mellomrom) / (materialBredde + mellomrom));
        nBeregnet += antallJustering;
        if (nBeregnet < 1) nBeregnet = 1;

        var antall = nBeregnet;
        var faktiskMellomrom = 0;
        if (antall > 1) {
          faktiskMellomrom = (totalLengde - antall * materialBredde) / (antall - 1);
        }

        return {
          modus: 'lik',
          antall: antall,
          faktiskBredde: materialBredde,
          faktiskMellomrom: faktiskMellomrom
        };
      }

      if (modus === 'begge') {
        // Full bredde i midten, start og slutt kappes likt
        // Mønster: [E][G][M][G][M]...[M][G][E]
        // Finn antall hele materialer i midten
        // totalLengde = 2*e + 2*g + (n-1)*(materialBredde + mellomrom) + materialBredde  (for n>=1 midtstykker)
        // Enklere: legg ut fulle bord + mellomrom, se hva som er til overs for endene
        var plassPerBord = materialBredde + mellomrom;
        // Minimum: 2 endestykker + 1 mellomrom på hver side
        // totalLengde = 2*endeBredde + antallMidt*materialBredde + (antallMidt+1)*mellomrom
        // Start med å finne antall midtstykker
        var tilgjengeligForMidt = totalLengde - 2 * mellomrom; // trekk fra mellomrom ved endene
        var antallMidt = Math.floor(tilgjengeligForMidt / plassPerBord);
        if (antallMidt < 0) antallMidt = 0;

        var bruktAvMidt = antallMidt * materialBredde + (antallMidt > 0 ? (antallMidt - 1) : 0) * mellomrom;
        var restTilEnder = totalLengde - bruktAvMidt - (antallMidt > 0 ? 2 : 0) * mellomrom;
        if (antallMidt === 0) restTilEnder = totalLengde;
        var endeBredde = restTilEnder / 2;

        // Hvis endeBredde er negativ eller for smal, juster
        if (endeBredde <= 0) {
          antallMidt = Math.max(0, antallMidt - 1);
          bruktAvMidt = antallMidt * materialBredde + (antallMidt > 0 ? (antallMidt - 1) : 0) * mellomrom;
          restTilEnder = totalLengde - bruktAvMidt - (antallMidt > 0 ? 2 : 0) * mellomrom;
          if (antallMidt === 0) restTilEnder = totalLengde;
          endeBredde = restTilEnder / 2;
        }

        return {
          modus: 'begge',
          antallMidt: antallMidt,
          antallTotalt: antallMidt + 2,
          endeBredde: endeBredde,
          materialBredde: materialBredde,
          mellomrom: mellomrom
        };
      }

      if (modus === 'en') {
        // Full bredde + fullt mellomrom fra start, rest på slutten
        var plassPerEnhet = materialBredde + mellomrom;
        var antallHele = Math.floor(totalLengde / plassPerEnhet);
        if (antallHele < 1) antallHele = 1;
        var brukt = antallHele * materialBredde + (antallHele - 1) * mellomrom;
        var restBredde = totalLengde - brukt - mellomrom; // siste mellomrom før rest-stykket

        // Hvis rest-stykket er negativt betyr det at siste mellomrom + rest ikke får plass
        if (restBredde <= 0) {
          antallHele = Math.max(1, antallHele - 1);
          brukt = antallHele * materialBredde + (antallHele - 1) * mellomrom;
          restBredde = totalLengde - brukt - mellomrom;
        }

        return {
          modus: 'en',
          antallHele: antallHele,
          antallTotalt: antallHele + 1,
          restBredde: restBredde,
          materialBredde: materialBredde,
          mellomrom: mellomrom
        };
      }

      return null;
    }

    function renderInndelingTool() {
      var inp = 'width:100%;padding:12px 14px;border:1.5px solid var(--line);border-radius:10px;font-size:16px;box-sizing:border-box;font-family:inherit;background:var(--card)';
      var lbl = 'display:block;font-size:12px;font-weight:700;margin-bottom:8px;color:var(--muted);text-transform:uppercase;letter-spacing:0.3px';

      var moduser = [
        { id: 'lik',   name: 'Lik fordeling',  desc: 'Alt likt — material og mellomrom samme mål', img: 'img/inndeling/lik.png' },
        { id: 'begge', name: 'Begge ender',     desc: 'Endestykker kappes likt, resten full bredde', img: 'img/inndeling/begge.png' },
        { id: 'en',    name: 'En ende',          desc: 'Full bredde fra start, viser rest på slutten', img: 'img/inndeling/en.png' }
      ];

      var h = '<div style="width:100%;max-width:540px;margin:0 auto;padding:20px 16px">'

        // Header
        + '<div style="display:flex;align-items:center;gap:10px;margin-bottom:28px">'
        + makkerBackBtn('openMakkerTool(null)')
        + '<h1 style="font-size:20px;font-weight:800;margin:0;font-family:var(--font-display)">Inndeling</h1>'
        + '</div>'

        // Modus-velger
        + '<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:24px">';

      moduser.forEach(function(m) {
        var aktiv = _inndelingModus === m.id;
        h += '<button onclick="velgInndelingModus(\'' + m.id + '\')" style="'
          + 'display:flex;align-items:center;gap:14px;'
          + 'background:' + (aktiv ? 'var(--accent-soft)' : 'var(--card)') + ';'
          + 'border:1.5px solid ' + (aktiv ? 'var(--accent)' : 'var(--line)') + ';'
          + 'border-radius:12px;padding:14px 16px;text-align:left;cursor:pointer;'
          + 'transition:all 0.15s">'
          + '<div style="width:100px;height:68px;border-radius:8px;flex-shrink:0;padding:10px;box-sizing:border-box;'
          + 'background:' + (aktiv ? 'var(--accent-soft)' : 'var(--bg)') + ';'
          + 'border:1px solid ' + (aktiv ? 'var(--accent)' : 'var(--line)') + ';display:flex;align-items:center;justify-content:center">'
          + '<img src="' + m.img + '" alt="' + m.name + '" style="width:100%;height:100%;object-fit:contain" />'
          + '</div>'
          + '<div>'
          + '<div style="font-size:15px;font-weight:700;color:' + (aktiv ? 'var(--accent)' : 'var(--text)') + '">' + m.name + '</div>'
          + '<div style="font-size:12px;color:var(--muted);margin-top:2px">' + m.desc + '</div>'
          + '</div>'
          + '</button>';
      });

      h += '</div>'

        // Input-felt
        + '<div style="background:var(--card);border:1.5px solid var(--line);border-radius:14px;padding:20px;margin-bottom:20px">'
        + '<div style="display:grid;gap:16px">'

        + '<div>'
        + '<label style="' + lbl + '">Total lengde (mm)</label>'
        + '<input id="innTotalLengde" type="number" inputmode="numeric" value="3000" oninput="calcInndeling()" style="' + inp + '" placeholder="3000" />'
        + '</div>'

        + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">'
        + '<div>'
        + '<label style="' + lbl + '">Materialbredde (mm)</label>'
        + '<input id="innMaterialBredde" type="number" inputmode="numeric" value="23" oninput="calcInndeling()" style="' + inp + '" placeholder="23" />'
        + '</div>'
        + '<div>'
        + '<label style="' + lbl + '">Mellomrom (mm)</label>'
        + '<input id="innMellomrom" type="number" inputmode="numeric" value="5" oninput="calcInndeling()" style="' + inp + '" placeholder="5" />'
        + '</div>'
        + '</div>'

        + '</div>'
        + '</div>';

      // +/- knapper for lik fordeling
      if (_inndelingModus === 'lik') {
        h += '<div id="innPlusMinus" style="display:flex;align-items:center;justify-content:center;gap:16px;margin-bottom:20px">'
          + '<button onclick="justerInndelingAntall(-1)" style="width:48px;height:48px;border-radius:50%;border:1.5px solid var(--line);background:var(--card);font-size:22px;font-weight:700;cursor:pointer;color:var(--text);display:flex;align-items:center;justify-content:center">−</button>'
          + '<span id="innAntallVis" style="font-size:20px;font-weight:800;min-width:60px;text-align:center;color:var(--text)">–</span>'
          + '<button onclick="justerInndelingAntall(1)" style="width:48px;height:48px;border-radius:50%;border:1.5px solid var(--line);background:var(--card);font-size:22px;font-weight:700;cursor:pointer;color:var(--text);display:flex;align-items:center;justify-content:center">+</button>'
          + '</div>';
      }

      // Resultat
      h += '<div id="innResultat" style="min-height:60px"></div>'
        + '</div>';

      return h;
    }

    function calcInndeling() {
      var totalEl = document.getElementById('innTotalLengde');
      if (!totalEl) return;

      var totalLengde = Number(totalEl.value);
      var materialBredde = Number(document.getElementById('innMaterialBredde').value);
      var mellomrom = Number(document.getElementById('innMellomrom').value);

      var res = beregnInndeling(totalLengde, materialBredde, mellomrom, _inndelingModus, _inndelingAntallJustering);

      var el = document.getElementById('innResultat');
      if (!el) return;

      if (!res) {
        el.innerHTML = '<div style="text-align:center;color:var(--muted);font-size:14px;padding:20px">Fyll inn verdier for å beregne...</div>';
        return;
      }

      var h = '<div style="background:var(--card);border:1.5px solid var(--line);border-radius:14px;padding:20px">';

      function rad(label, verdi, ekstra) {
        return '<div style="display:flex;justify-content:space-between;align-items:baseline;padding:10px 0;border-bottom:1px solid var(--line)">'
          + '<span style="font-size:14px;color:var(--muted)">' + label + '</span>'
          + '<div style="text-align:right">'
          + '<span style="font-size:18px;font-weight:800;color:var(--text)">' + verdi + '</span>'
          + (ekstra ? '<div style="font-size:11px;color:var(--muted);margin-top:2px">' + ekstra + '</div>' : '')
          + '</div></div>';
      }

      if (res.modus === 'lik') {
        var antallVis = document.getElementById('innAntallVis');
        if (antallVis) antallVis.textContent = res.antall + ' stk';

        h += rad('Antall', res.antall + ' stk', null);
        h += rad('Materialbredde', res.faktiskBredde.toFixed(1) + ' mm',
          res.faktiskBredde !== materialBredde ? 'Justert fra ' + materialBredde + ' mm' : null);
        h += rad('Mellomrom', res.faktiskMellomrom.toFixed(1) + ' mm',
          res.faktiskMellomrom !== mellomrom ? 'Justert fra ' + mellomrom + ' mm' : null);
      }

      if (res.modus === 'begge') {
        h += rad('Antall totalt', res.antallTotalt + ' stk', res.antallMidt + ' hele + 2 endestykker');
        h += rad('Endestykker', res.endeBredde.toFixed(1) + ' mm', 'Kappes likt i hver ende');
        h += rad('Materialbredde', res.materialBredde + ' mm', 'Full bredde i midten');
        h += rad('Mellomrom', res.mellomrom + ' mm', null);
      }

      if (res.modus === 'en') {
        h += rad('Antall totalt', res.antallTotalt + ' stk', res.antallHele + ' hele + 1 reststykke');
        h += rad('Reststykke', res.restBredde.toFixed(1) + ' mm', 'Bredde på siste stykke');
        h += rad('Materialbredde', res.materialBredde + ' mm', 'Full bredde');
        h += rad('Mellomrom', res.mellomrom + ' mm', null);
      }

      h += '</div>';
      el.innerHTML = h;
    }

    window.velgInndelingModus = function(modus) {
      _inndelingModus = modus;
      _inndelingAntallJustering = 0;
      renderMakkerView();
    };

    window.justerInndelingAntall = function(delta) {
      _inndelingAntallJustering += delta;
      calcInndeling();
    };

    // ── MAKKER ───────────────────────────────────────────────────────────────

    var _makkerTool = null; // null = viser hjem-skjerm
    var _trappType = null;  // 'gulv' | 'forlengelse' | 'ned'
    var _trappModus = null; // 'fri' | 'fast'
    var _trappTrinn = 0;    // antall trinn, justeres med +/-
    var _trappTrinnJustering = 0; // +/- fra beregnet antall

    var _makkerTools = [
      { id: 'trapp',     name: 'Trappekalkulator',    desc: 'Beregn stigning, inntrinn og antall trinn' },
      { id: 'inndeling', name: 'Inndelingskalkulator', desc: 'Fordel materialer jevnt over en lengde' },
      { id: 'trekant',   name: 'Rettvinklet trekant',   desc: 'Beregn lengder og vinkler i rettvinklet trekant' },
      { id: 'kledning',  name: 'Tømmermannskledning', desc: 'Beregn tømmermannskledning' },
      { id: 'taksperre', name: 'Taksperre',           desc: 'Beregn sperrelengde, loddskjær og garpehakk' },
      { id: 'gavl',      name: 'Gavelvegg - stendere', desc: 'Stenderlengder for skrå gavlvegg' },
    ];

    function renderMakkerView(){
  var el = document.getElementById('makkContent');
  if(!el) return;

  el.innerHTML = _makkerTool ? renderMakkerTool(_makkerTool) : renderMakkerHome();

  if (_makkerTool === 'kledning' && typeof window.calcKledning === 'function') {
    window.calcKledning();
  }
  if (_makkerTool === 'inndeling') {
    calcInndeling();
  }
  if (_makkerTool === 'trapp' && _trappType && _trappModus) {
    calcTrapp();
  }
  if (_makkerTool === 'trekant') {
    calcTrekant();
  }
  if (_makkerTool === 'taksperre') {
    calcTaksperre();
  }
  if (_makkerTool === 'gavl') {
    calcGavl();
  }
}

    function makkerBackBtn(onclick) {
      return '<button onclick="' + onclick + '" style="background:var(--bg-warm);border:1.5px solid var(--line);color:var(--muted-strong);width:36px;height:36px;border-radius:var(--radius-xs);cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background var(--dur-normal) var(--ease)">'
        + '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>'
        + '</button>';
    }

    function renderMakkerHome(){
      return '<div style="width:100%;max-width:480px;margin:0 auto;padding:24px">'
        + '<div style="display:flex;align-items:center;gap:12px;margin-bottom:28px">'
        + '<button onclick="goToHome()" style="background:var(--bg-warm);border:1.5px solid var(--line);color:var(--muted-strong);width:36px;height:36px;border-radius:var(--radius-xs);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:18px;font-family:var(--font-body);transition:background var(--dur-normal) var(--ease)">'
        + '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>'
        + '</button>'
        + '<div><div style="font-size:22px;font-weight:800;font-family:var(--font-display)">Makker</div>'
        + '<div style="font-size:13px;color:var(--muted)">Verktøy for håndverkeren</div></div>'
        + '</div>'
        + '<div style="display:flex;flex-direction:column;gap:10px">'
        + _makkerTools.map(function(t){
            return '<button onclick="openMakkerTool(\'' + t.id + '\')"'
              + ' style="background:var(--card);border:1.5px solid var(--line);border-radius:var(--radius);padding:18px 20px;text-align:left;cursor:pointer;box-shadow:var(--shadow-sm);transition:border-color var(--dur-normal) var(--ease),box-shadow var(--dur-normal) var(--ease)">'
              + '<div style="font-size:15px;font-weight:700;font-family:var(--font-display);color:var(--text)">' + t.name + '</div>'
              + '<div style="font-size:12px;color:var(--muted);margin-top:4px;font-family:var(--font-body)">' + t.desc + '</div>'
              + '</button>';
          }).join('')
        + '</div>'
        + '</div>';
    }

    function renderMakkerTool(id){
      if(id==='trapp') return renderTrappModul();
      if(id==='kledning') return renderKledningTool();
      if(id==='inndeling') return renderInndelingTool();
      if(id==='trekant') return renderTrekantTool();
      if(id==='taksperre') return renderTaksperreKalkulator();
      if(id==='gavl') return renderGavlTool();
      var t = _makkerTools.find(function(x){ return x.id===id; });
      if(!t) return renderMakkerHome();
      return '<div style="width:100%;max-width:480px;margin:0 auto;padding:24px">'
        + '<div style="display:flex;align-items:center;gap:12px;margin-bottom:28px">'
        + makkerBackBtn('openMakkerTool(null)')
        + '<div><div style="font-size:22px;font-weight:800;font-family:var(--font-display)">' + t.name + '</div></div>'
        + '</div>'
        + '<div style="background:var(--card);border:1.5px solid var(--line);border-radius:var(--radius);padding:24px;text-align:center;color:var(--muted)">'
        + '<div style="font-size:15px;font-weight:600">Kommer snart</div>'
        + '<div style="font-size:13px;margin-top:4px">' + t.desc + '</div>'
        + '</div>'
        + '</div>';
    }

    // ── TRAPPEKALKULATOR — NY ──────────────────────────────────────────────

    var _trappTyper = [
      { id: 'gulv',        name: 'Gulv til gulv',   desc: 'Vange fra gulv til gulv, trinn mellom vangene', img: 'img/trapp/GULV TIL GULV.png' },
      { id: 'forlengelse', name: 'Gulvforlengelse',  desc: 'Øverste trinn i flukt med toppgulvet',         img: 'img/trapp/GULVFORLENGELSE.png' },
      { id: 'ned',         name: 'Ett trinn ned',    desc: 'Øverste trinn ett hakk under toppgulv',        img: 'img/trapp/ETT TRINN NED.JPG' },
    ];

    function renderTrappModul() {
      if (!_trappType) return renderTrappTypeVelger();
      if (!_trappModus) return renderTrappModusVelger();
      return renderTrappKalkulator();
    }

    function renderTrappTypeVelger() {
      var h = '<div style="width:100%;max-width:540px;margin:0 auto;padding:20px 16px">'
        + '<div style="display:flex;align-items:center;gap:10px;margin-bottom:28px">'
        + makkerBackBtn('openMakkerTool(null)')
        + '<h1 style="font-size:20px;font-weight:800;margin:0;font-family:var(--font-display)">Trappekalkulator</h1>'
        + '</div>'
        + '<div style="display:flex;flex-direction:column;gap:10px">';

      _trappTyper.forEach(function(t) {
        h += '<button onclick="velgTrappType(\'' + t.id + '\')" style="'
          + 'display:flex;align-items:center;gap:14px;'
          + 'background:var(--card);border:1.5px solid var(--line);border-radius:12px;'
          + 'padding:14px 16px;text-align:left;cursor:pointer;transition:all 0.15s">'
          + '<img src="' + t.img + '" alt="' + t.name + '" style="width:80px;height:60px;border-radius:8px;object-fit:cover;flex-shrink:0;border:1px solid var(--line)" />'
          + '<div>'
          + '<div style="font-size:15px;font-weight:700;color:var(--text)">' + t.name + '</div>'
          + '<div style="font-size:12px;color:var(--muted);margin-top:2px">' + t.desc + '</div>'
          + '</div></button>';
      });

      h += '</div></div>';
      return h;
    }

    function renderTrappModusVelger() {
      var type = _trappTyper.find(function(t) { return t.id === _trappType; });
      var h = '<div style="width:100%;max-width:540px;margin:0 auto;padding:20px 16px">'
        + '<div style="display:flex;align-items:center;gap:10px;margin-bottom:28px">'
        + makkerBackBtn('velgTrappType(null)')
        + '<div><h1 style="font-size:20px;font-weight:800;margin:0;font-family:var(--font-display)">' + (type ? type.name : 'Trapp') + '</h1>'
        + '<div style="font-size:13px;color:var(--muted)">Velg beregningsmodus</div></div>'
        + '</div>'
        + '<div style="display:flex;flex-direction:column;gap:10px">'

        + '<button onclick="velgTrappModus(\'fri\')" style="'
        + 'background:var(--card);border:1.5px solid var(--line);border-radius:12px;'
        + 'padding:18px 20px;text-align:left;cursor:pointer">'
        + '<div style="font-size:15px;font-weight:700;color:var(--text)">Uten faste mål</div>'
        + '<div style="font-size:12px;color:var(--muted);margin-top:4px">Du kjenner lengde og høyde — juster antall trinn med +/−</div>'
        + '</button>'

        + '<button onclick="velgTrappModus(\'fast\')" style="'
        + 'background:var(--card);border:1.5px solid var(--line);border-radius:12px;'
        + 'padding:18px 20px;text-align:left;cursor:pointer">'
        + '<div style="font-size:15px;font-weight:700;color:var(--text)">Med faste mål</div>'
        + '<div style="font-size:12px;color:var(--muted);margin-top:4px">Du kjenner høyde per trinn, dybde per trinn og totalhøyde</div>'
        + '</button>'

        + '</div></div>';
      return h;
    }

    function renderTrappKalkulator() {
      var type = _trappTyper.find(function(t) { return t.id === _trappType; });
      var inp = 'width:100%;padding:12px 14px;border:1.5px solid var(--line);border-radius:10px;font-size:16px;box-sizing:border-box;font-family:inherit;background:var(--card)';
      var lbl = 'display:block;font-size:12px;font-weight:700;margin-bottom:8px;color:var(--muted);text-transform:uppercase;letter-spacing:0.3px';

      var h = '<div style="width:100%;max-width:540px;margin:0 auto;padding:20px 16px">'
        + '<div style="display:flex;align-items:center;gap:10px;margin-bottom:28px">'
        + makkerBackBtn('velgTrappModus(null)')
        + '<div><h1 style="font-size:20px;font-weight:800;margin:0;font-family:var(--font-display)">' + (type ? type.name : 'Trapp') + '</h1>'
        + '<div style="font-size:13px;color:var(--muted)">' + (_trappModus === 'fast' ? 'Med faste mål' : 'Uten faste mål') + '</div></div>'
        + '</div>';

      // Input-felt
      h += '<div style="background:var(--card);border:1.5px solid var(--line);border-radius:14px;padding:20px;margin-bottom:20px">'
        + '<div style="display:grid;gap:16px">';

      if (_trappModus === 'fri') {
        h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">'
          + '<div>'
          + '<label style="' + lbl + '">Total lengde (mm)</label>'
          + '<input id="trappLengde" type="number" inputmode="numeric" oninput="calcTrapp()" style="' + inp + '" placeholder="3750" />'
          + '</div>'
          + '<div>'
          + '<label style="' + lbl + '">Total høyde (mm)</label>'
          + '<input id="trappHoyde" type="number" inputmode="numeric" oninput="calcTrapp()" style="' + inp + '" placeholder="2800" />'
          + '</div></div>';
        if (_trappType === 'gulv') {
          h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">'
            + '<div>'
            + '<label style="' + lbl + '">Topptrinn (mm)</label>'
            + '<input id="trappTopptrinn" type="number" inputmode="numeric" oninput="calcTrapp()" style="' + inp + '" placeholder="28" />'
            + '</div>'
            + '<div>'
            + '<label style="' + lbl + '">Vange (mm)</label>'
            + '<input id="trappVange" type="number" inputmode="numeric" oninput="calcTrapp()" style="' + inp + '" placeholder="198" />'
            + '</div></div>';
        }
      } else {
        h += '<div>'
          + '<label style="' + lbl + '">Høyde per trinn (mm)</label>'
          + '<input id="trappOpptrinn" type="number" inputmode="numeric" oninput="calcTrapp()" style="' + inp + '" placeholder="175" />'
          + '</div>'
          + '<div>'
          + '<label style="' + lbl + '">Dybde per trinn (mm)</label>'
          + '<input id="trappInntrinn" type="number" inputmode="numeric" oninput="calcTrapp()" style="' + inp + '" placeholder="250" />'
          + '</div>'
          + '<div>'
          + '<label style="' + lbl + '">Total høyde (mm)</label>'
          + '<input id="trappHoyde" type="number" inputmode="numeric" oninput="calcTrapp()" style="' + inp + '" placeholder="2800" />'
          + '</div>';
        if (_trappType === 'gulv') {
          h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">'
            + '<div>'
            + '<label style="' + lbl + '">Topptrinn (mm)</label>'
            + '<input id="trappTopptrinn" type="number" inputmode="numeric" oninput="calcTrapp()" style="' + inp + '" placeholder="28" />'
            + '</div>'
            + '<div>'
            + '<label style="' + lbl + '">Vange (mm)</label>'
            + '<input id="trappVange" type="number" inputmode="numeric" oninput="calcTrapp()" style="' + inp + '" placeholder="198" />'
            + '</div></div>';
        }
      }

      h += '</div></div>';

      // +/- for fri modus
      if (_trappModus === 'fri') {
        h += '<div style="display:flex;align-items:center;justify-content:center;gap:16px;margin-bottom:20px">'
          + '<button onclick="justerTrappTrinn(-1)" style="width:48px;height:48px;border-radius:50%;border:1.5px solid var(--line);background:var(--card);font-size:22px;font-weight:700;cursor:pointer;color:var(--text);display:flex;align-items:center;justify-content:center">−</button>'
          + '<span id="trappAntallVis" style="font-size:20px;font-weight:800;min-width:80px;text-align:center;color:var(--text)">–</span>'
          + '<button onclick="justerTrappTrinn(1)" style="width:48px;height:48px;border-radius:50%;border:1.5px solid var(--line);background:var(--card);font-size:22px;font-weight:700;cursor:pointer;color:var(--text);display:flex;align-items:center;justify-content:center">+</button>'
          + '</div>';
      }

      // Resultat
      h += '<div id="trappResultat" style="min-height:60px"></div></div>';
      return h;
    }

    // Trapp beregning — felles for alle typer og moduser
    function calcTrapp() {
      var el = document.getElementById('trappResultat');
      if (!el) return;

      var hoyde, inntrinn, opptrinn, antall, innlop, vangeHoyde;
      var topptrinnEl = document.getElementById('trappTopptrinn');
      var vangeEl = document.getElementById('trappVange');
      var topptrinn = topptrinnEl ? Number(topptrinnEl.value) || 0 : 0;
      var vangeBredde = vangeEl ? Number(vangeEl.value) || 0 : 0;

      // Tommelregel: "ned" bruker antall-1 inntrinn, de andre bruker antall
      var brukAntallMinusEn = (_trappType === 'ned');

      if (_trappModus === 'fast') {
        var opptrinnInput = Number(document.getElementById('trappOpptrinn').value);
        inntrinn = Number(document.getElementById('trappInntrinn').value);
        hoyde = Number(document.getElementById('trappHoyde').value);
        if (!opptrinnInput || !inntrinn || !hoyde || opptrinnInput <= 0 || hoyde <= 0) {
          el.innerHTML = '<div style="text-align:center;color:var(--muted);font-size:14px;padding:20px">Fyll inn verdier for å beregne...</div>';
          return;
        }
        var effektivHoyde = hoyde + topptrinn;
        antall = Math.round(effektivHoyde / opptrinnInput);
        if (antall < 1) antall = 1;
        opptrinn = opptrinnInput;

        if (brukAntallMinusEn) {
          innlop = (antall - 1) * inntrinn;
        } else {
          innlop = antall * inntrinn;
        }
      } else {
        var lengde = Number(document.getElementById('trappLengde').value);
        hoyde = Number(document.getElementById('trappHoyde').value);
        if (!lengde || !hoyde || lengde <= 0 || hoyde <= 0) {
          el.innerHTML = '<div style="text-align:center;color:var(--muted);font-size:14px;padding:20px">Fyll inn verdier for å beregne...</div>';
          return;
        }
        var effektivHoyde = hoyde + topptrinn;
        if (!_trappTrinn) {
          _trappTrinn = Math.round(effektivHoyde / 180);
          if (_trappTrinn < 2) _trappTrinn = 2;
          _trappTrinnJustering = 0;
        }
        antall = Math.max(2, _trappTrinn + _trappTrinnJustering);
        opptrinn = effektivHoyde / antall;

        if (brukAntallMinusEn) {
          inntrinn = lengde / (antall - 1);
        } else {
          inntrinn = lengde / antall;
        }
        innlop = lengde;
      }

      // Vangehøyde avhenger av type
      if (_trappType === 'ned') {
        vangeHoyde = (antall - 1) * opptrinn;
      } else {
        vangeHoyde = hoyde + topptrinn;
      }

      var formel = 2 * opptrinn + inntrinn;
      var vangeLengde = Math.sqrt(vangeHoyde * vangeHoyde + innlop * innlop);
      var vinkel = Math.atan2(opptrinn, inntrinn) * (180 / Math.PI);
      var kappVinkelTopp = 90 - vinkel;
      var kappVinkelBunn = vinkel;

      // Oppdater +/- visning
      var antallVis = document.getElementById('trappAntallVis');
      if (antallVis) antallVis.textContent = antall + ' trinn';

      // Fargekoder
      var GRONN = 'var(--green, #167a42)';
      var ROD = 'var(--red, #c0392b)';
      var GUL = 'var(--amber, #f0a202)';

      function farge(verdi, min, max) {
        if (verdi >= min && verdi <= max) return GRONN;
        return ROD;
      }

      var opptrinnFarge = farge(opptrinn, 150, 220);
      var inntrinnFarge = inntrinn ? farge(inntrinn, 220, 300) : 'var(--muted)';
      var formelFarge = formel ? farge(formel, 600, 640) : 'var(--muted)';

      function rad(label, verdi, note, noteFarge) {
        return '<div style="display:flex;justify-content:space-between;align-items:baseline;padding:10px 0;border-bottom:1px solid var(--line)">'
          + '<span style="font-size:14px;color:var(--muted)">' + label + '</span>'
          + '<div style="text-align:right">'
          + '<span style="font-size:18px;font-weight:800">' + verdi + '</span>'
          + (note ? '<div style="font-size:11px;color:' + (noteFarge || 'var(--muted)') + ';margin-top:2px">' + note + '</div>' : '')
          + '</div></div>';
      }

      var h = '<div style="background:var(--card);border:1.5px solid var(--line);border-radius:14px;padding:20px">';

      h += rad('Antall trinn', antall + ' stk', null);
      h += rad('Opptrinn', '<span style="color:' + opptrinnFarge + '">' + opptrinn.toFixed(1) + ' mm</span>',
        opptrinn >= 150 && opptrinn <= 220 ? 'OK — innenfor (150–220 mm)' : 'Utenfor (150–220 mm)', opptrinnFarge);

      if (inntrinn) {
        h += rad('Inntrinn', '<span style="color:' + inntrinnFarge + '">' + inntrinn.toFixed(1) + ' mm</span>',
          inntrinn >= 220 && inntrinn <= 300 ? 'OK — innenfor (220–300 mm)' : 'Utenfor (220–300 mm)', inntrinnFarge);
      }

      h += rad('Trappeformel', '<span style="color:' + formelFarge + '">' + formel.toFixed(0) + ' mm</span>',
        formel >= 600 && formel <= 640 ? 'OK — innenfor (600–640 mm)' : 'Utenfor (600–640 mm)', formelFarge);

      // Mellomrom trinn langs vange
      var mellomromVange = Math.sqrt(opptrinn * opptrinn + inntrinn * inntrinn);

      h += rad('Vinkel', vinkel.toFixed(1) + '°', null);
      h += rad('Vangelengde', (vangeLengde / 1000).toFixed(2) + ' m', vangeLengde.toFixed(0) + ' mm');
      h += rad('Total innløp', (innlop / 1000).toFixed(2) + ' m', innlop.toFixed(0) + ' mm');
      h += rad('Mellomrom langs vange', mellomromVange.toFixed(1) + ' mm', null);
      h += rad('Kappvinkel topp', kappVinkelTopp.toFixed(1) + '°', null);
      h += rad('Kappvinkel bunn', kappVinkelBunn.toFixed(1) + '°', null);
      if (vangeBredde > 0) {
        h += rad('Vange bredde', vangeBredde + ' mm', null);
      }

      h += '</div>';
      el.innerHTML = h;
    }

    // ── RETTVINKLET TREKANT ────────────────────────────────────────────────

    var _trekantLocked = []; // ids of the two user-filled fields

    function renderTrekantTool() {
      var inp = 'width:100%;padding:12px 14px;border:1.5px solid var(--line);border-radius:10px;font-size:16px;box-sizing:border-box;font-family:inherit;background:var(--card)';
      var inpDisabled = inp + ';background:var(--bg);color:var(--muted);opacity:0.7';
      var lbl = 'font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.3px';

      var fields = [
        { id: 'trekA', label: 'a', ph: 'mm' },
        { id: 'trekB', label: 'b', ph: 'mm' },
        { id: 'trekC', label: 'c', ph: 'mm' },
        { id: 'trekVinkelA', label: 'A', ph: '°' },
        { id: 'trekVinkelB', label: 'B', ph: '°' },
      ];

      var h = '<div style="width:100%;max-width:480px;margin:0 auto;padding:24px">'
        + '<div style="display:flex;align-items:center;gap:12px;margin-bottom:24px">'
        + makkerBackBtn('openMakkerTool(null)')
        + '<div><div style="font-size:22px;font-weight:800;font-family:var(--font-display)">Rettvinklet trekant</div>'
        + '<div style="font-size:13px;color:var(--muted)">Fyll inn 2 verdier — resten beregnes</div></div>'
        + '</div>';

      // SVG illustration
      h += '<div style="background:var(--card);border:1.5px solid var(--line);border-radius:14px;padding:24px 20px;margin-bottom:16px">'
        + '<svg viewBox="0 0 300 230" style="width:100%;max-width:320px;height:auto;display:block;margin:0 auto">'
        // Subtle fill
        + '<polygon points="40,185 260,185 260,35" fill="var(--accent-soft)" stroke="none" />'
        // Triangle outline
        + '<polygon points="40,185 260,185 260,35" fill="none" stroke="var(--text)" stroke-width="2.5" stroke-linejoin="round" />'
        // Right angle marker (18x18 square)
        + '<polyline points="242,185 242,167 260,167" fill="none" stroke="var(--muted)" stroke-width="1.5" />'
        // 90° inside the right-angle square
        + '<text x="251" y="179" text-anchor="middle" font-size="9" font-weight="600" font-family="DM Sans, sans-serif" fill="var(--muted)">90°</text>'
        // Angle arc A at (40,185) — inside: from bottom edge toward hypotenuse
        // Hypotenuse angle ≈ atan2(150,220) ≈ 34.3°, r=28
        + '<path d="M 68,185 A 28,28 0 0,0 63,169" fill="none" stroke="var(--blue)" stroke-width="2" />'
        // Angle arc B at (260,35) — inside: from hypotenuse toward right edge
        + '<path d="M 237,52 A 28,28 0 0,0 260,63" fill="none" stroke="var(--blue)" stroke-width="2" />'
        // Side label: a (bottom, katet)
        + '<text x="150" y="210" text-anchor="middle" font-size="16" font-weight="800" font-family="DM Sans, sans-serif" fill="var(--text)">a</text>'
        // Side label: b (right, katet)
        + '<text x="276" y="115" text-anchor="start" font-size="16" font-weight="800" font-family="DM Sans, sans-serif" fill="var(--text)">b</text>'
        // Side label: c (hypotenuse)
        + '<text x="138" y="100" text-anchor="end" font-size="16" font-weight="800" font-family="DM Sans, sans-serif" fill="var(--text)">c</text>'
        // Angle label A (inside triangle, near arc)
        + '<text x="78" y="174" text-anchor="start" font-size="14" font-weight="700" font-family="DM Sans, sans-serif" fill="var(--blue)">A</text>'
        // Angle label B (inside triangle, near arc)
        + '<text x="248" y="72" text-anchor="end" font-size="14" font-weight="700" font-family="DM Sans, sans-serif" fill="var(--blue)">B</text>'
        // Decorative: small dots at vertices
        + '<circle cx="40" cy="185" r="3" fill="var(--text)" />'
        + '<circle cx="260" cy="185" r="3" fill="var(--text)" />'
        + '<circle cx="260" cy="35" r="3" fill="var(--text)" />'
        + '</svg>'
        + '</div>';

      // Input fields
      h += '<div style="background:var(--card);border:1.5px solid var(--line);border-radius:14px;padding:20px;margin-bottom:16px">'
        + '<div style="font-size:12px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.3px;margin-bottom:14px">Kateter</div>'
        + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">';

      // a and b
      for (var i = 0; i < 2; i++) {
        var f = fields[i];
        var isLocked = _trekantLocked.indexOf(f.id) !== -1;
        var isDisabled = _trekantLocked.length >= 2 && !isLocked;
        h += '<div>'
          + '<label style="' + lbl + '">' + f.label + ' (' + f.ph + ')</label>'
          + '<input id="' + f.id + '" type="number" inputmode="decimal" oninput="onTrekantInput(\'' + f.id + '\')"'
          + ' style="' + (isDisabled ? inpDisabled : inp) + '"'
          + (isDisabled ? ' disabled' : '')
          + ' placeholder="' + f.ph + '" />'
          + '</div>';
      }

      h += '</div>'
        + '<div style="font-size:12px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.3px;margin-bottom:14px">Hypotenus</div>';

      // c
      var fc = fields[2];
      var isLockedC = _trekantLocked.indexOf(fc.id) !== -1;
      var isDisabledC = _trekantLocked.length >= 2 && !isLockedC;
      h += '<div style="margin-bottom:16px">'
        + '<label style="' + lbl + '">' + fc.label + ' (' + fc.ph + ')</label>'
        + '<input id="' + fc.id + '" type="number" inputmode="decimal" oninput="onTrekantInput(\'' + fc.id + '\')"'
        + ' style="' + (isDisabledC ? inpDisabled : inp) + '"'
        + (isDisabledC ? ' disabled' : '')
        + ' placeholder="' + fc.ph + '" />'
        + '</div>';

      h += '<div style="font-size:12px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.3px;margin-bottom:6px">Vinkler</div>'
        + '<div style="font-size:11px;color:var(--muted);margin-bottom:14px">A = takvinkel (fra horisontal) · B = mønevinkel (fra loddrett)</div>'
        + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">';

      // A and B
      for (var j = 3; j < 5; j++) {
        var fv = fields[j];
        var isLockedV = _trekantLocked.indexOf(fv.id) !== -1;
        var isDisabledV = _trekantLocked.length >= 2 && !isLockedV;
        h += '<div>'
          + '<label style="' + lbl + '">' + fv.label + ' (' + fv.ph + ')</label>'
          + '<input id="' + fv.id + '" type="number" inputmode="decimal" oninput="onTrekantInput(\'' + fv.id + '\')"'
          + ' style="' + (isDisabledV ? inpDisabled : inp) + '"'
          + (isDisabledV ? ' disabled' : '')
          + ' placeholder="' + fv.ph + '" />'
          + '</div>';
      }

      h += '</div></div>';

      // Nullstill button
      h += '<button onclick="nullstillTrekant()" style="width:100%;padding:12px;background:none;border:1.5px solid var(--line);border-radius:10px;font-weight:600;font-size:13px;color:var(--muted);cursor:pointer;margin-bottom:16px;transition:all 0.15s;letter-spacing:0.2px">Nullstill</button>';

      // Result area
      h += '<div id="trekantResultat"></div>';

      // Simulate button + dynamic view
      h += '<div id="trekantSimulering" style="margin-top:16px"></div>';

      h += '</div>';
      return h;
    }

    function calcTrekant() {
      var el = document.getElementById('trekantResultat');
      if (!el) return;

      if (_trekantLocked.length < 2) {
        el.innerHTML = '<div style="text-align:center;color:var(--muted);font-size:14px;padding:20px">Fyll inn 2 verdier for å beregne...</div>';
        document.getElementById('trekantSimulering').innerHTML = '';
        return;
      }

      var a = Number(document.getElementById('trekA').value) || 0;
      var b = Number(document.getElementById('trekB').value) || 0;
      var c = Number(document.getElementById('trekC').value) || 0;
      var A = Number(document.getElementById('trekVinkelA').value) || 0;
      var B = Number(document.getElementById('trekVinkelB').value) || 0;

      var DEG = Math.PI / 180;
      var solved = solveTrekant(a, b, c, A, B, DEG);

      if (!solved) {
        el.innerHTML = '<div style="text-align:center;color:var(--red, #c0392b);font-size:14px;padding:20px">Ugyldig kombinasjon — kan ikke løse trekanten</div>';
        document.getElementById('trekantSimulering').innerHTML = '';
        return;
      }

      a = solved.a; b = solved.b; c = solved.c; A = solved.A; B = solved.B;

      // Fill computed fields
      var ids = ['trekA', 'trekB', 'trekC', 'trekVinkelA', 'trekVinkelB'];
      var vals = [a, b, c, A, B];
      for (var i = 0; i < ids.length; i++) {
        if (_trekantLocked.indexOf(ids[i]) === -1) {
          var inputEl = document.getElementById(ids[i]);
          if (inputEl) inputEl.value = vals[i] % 1 === 0 ? vals[i] : vals[i].toFixed(2);
        }
      }

      // Result display
      function rad(label, verdi, enhet, farge) {
        return '<div style="display:flex;justify-content:space-between;align-items:baseline;padding:11px 0;border-bottom:1px solid var(--line)">'
          + '<span style="font-size:14px;color:var(--muted)">' + label + '</span>'
          + '<span style="font-size:17px;font-weight:800;color:' + (farge || 'var(--text)') + '">' + verdi + ' <span style="font-size:13px;font-weight:600;color:var(--muted)">' + enhet + '</span></span>'
          + '</div>';
      }

      var h = '<div style="background:var(--card);border:1.5px solid var(--line);border-radius:14px;padding:20px">'
        + '<div style="font-size:12px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.3px;margin-bottom:6px">Resultat</div>'
        + rad('a', a.toFixed(2), 'mm')
        + rad('b', b.toFixed(2), 'mm')
        + rad('c', c.toFixed(2), 'mm')
        + rad('A', A.toFixed(2), '°', 'var(--blue)')
        + rad('B', B.toFixed(2), '°', 'var(--blue)')
        + '<div style="height:8px"></div>'
        + rad('Areal', (0.5 * a * b).toFixed(2), 'mm²')
        + rad('Omkrets', (a + b + c).toFixed(2), 'mm')
        + '</div>';

      el.innerHTML = h;

      // Show simulate button
      var simEl = document.getElementById('trekantSimulering');
      if (simEl) {
        simEl.innerHTML = '<button onclick="simulerTrekant()" style="width:100%;padding:13px;background:var(--accent-soft);border:1.5px solid var(--accent-muted);border-radius:10px;font-weight:700;font-size:14px;color:var(--accent-hover);cursor:pointer;transition:all 0.2s">Vis trekant</button>'
          + '<div id="trekantSimSvg" style="margin-top:16px"></div>';
      }
    }

    function solveTrekant(a, b, c, A, B, DEG) {
      var known = _trekantLocked.slice();
      var k0 = known[0];
      var k1 = known[1];

      // Konvensjon:
      // A = vinkel nede til venstre (takvinkel), motstående side = b (vertikal)
      // B = vinkel oppe til høyre (mønevinkel), motstående side = a (horisontal)
      // sin(A) = b/c, cos(A) = a/c, tan(A) = b/a

      // Two sides known
      if (k0 === 'trekA' && k1 === 'trekB' || k1 === 'trekA' && k0 === 'trekB') {
        if (a <= 0 || b <= 0) return null;
        c = Math.sqrt(a * a + b * b);
        A = Math.atan2(b, a) / DEG;
        B = 90 - A;
        return { a: a, b: b, c: c, A: A, B: B };
      }
      if (k0 === 'trekA' && k1 === 'trekC' || k1 === 'trekA' && k0 === 'trekC') {
        if (a <= 0 || c <= 0 || a >= c) return null;
        b = Math.sqrt(c * c - a * a);
        A = Math.acos(a / c) / DEG;
        B = 90 - A;
        return { a: a, b: b, c: c, A: A, B: B };
      }
      if (k0 === 'trekB' && k1 === 'trekC' || k1 === 'trekB' && k0 === 'trekC') {
        if (b <= 0 || c <= 0 || b >= c) return null;
        a = Math.sqrt(c * c - b * b);
        A = Math.asin(b / c) / DEG;
        B = 90 - A;
        return { a: a, b: b, c: c, A: A, B: B };
      }

      // One side + one angle
      // sin(A) = b/c → b = c*sin(A), c = b/sin(A)
      // cos(A) = a/c → a = c*cos(A), c = a/cos(A)
      if (hasKnown('trekA', 'trekVinkelA')) {
        if (a <= 0 || A <= 0 || A >= 90) return null;
        B = 90 - A;
        c = a / Math.cos(A * DEG);
        b = c * Math.sin(A * DEG);
        return { a: a, b: b, c: c, A: A, B: B };
      }
      if (hasKnown('trekA', 'trekVinkelB')) {
        if (a <= 0 || B <= 0 || B >= 90) return null;
        A = 90 - B;
        c = a / Math.cos(A * DEG);
        b = c * Math.sin(A * DEG);
        return { a: a, b: b, c: c, A: A, B: B };
      }
      if (hasKnown('trekB', 'trekVinkelA')) {
        if (b <= 0 || A <= 0 || A >= 90) return null;
        B = 90 - A;
        c = b / Math.sin(A * DEG);
        a = c * Math.cos(A * DEG);
        return { a: a, b: b, c: c, A: A, B: B };
      }
      if (hasKnown('trekB', 'trekVinkelB')) {
        if (b <= 0 || B <= 0 || B >= 90) return null;
        A = 90 - B;
        c = b / Math.sin(A * DEG);
        a = c * Math.cos(A * DEG);
        return { a: a, b: b, c: c, A: A, B: B };
      }
      if (hasKnown('trekC', 'trekVinkelA')) {
        if (c <= 0 || A <= 0 || A >= 90) return null;
        B = 90 - A;
        a = c * Math.cos(A * DEG);
        b = c * Math.sin(A * DEG);
        return { a: a, b: b, c: c, A: A, B: B };
      }
      if (hasKnown('trekC', 'trekVinkelB')) {
        if (c <= 0 || B <= 0 || B >= 90) return null;
        A = 90 - B;
        a = c * Math.cos(A * DEG);
        b = c * Math.sin(A * DEG);
        return { a: a, b: b, c: c, A: A, B: B };
      }

      // Two angles
      if (hasKnown('trekVinkelA', 'trekVinkelB')) {
        if (A <= 0 || B <= 0 || Math.abs(A + B - 90) > 0.01) return null;
        // Cannot solve without at least one side
        return null;
      }

      return null;

      function hasKnown(id1, id2) {
        return (k0 === id1 && k1 === id2) || (k0 === id2 && k1 === id1);
      }
    }

    function simulerTrekant() {
      var svgEl = document.getElementById('trekantSimSvg');
      if (!svgEl) return;

      var a = Number(document.getElementById('trekA').value) || 0;
      var b = Number(document.getElementById('trekB').value) || 0;
      if (a <= 0 || b <= 0) return;

      var A = Number(document.getElementById('trekVinkelA').value) || 0;
      var B = Number(document.getElementById('trekVinkelB').value) || 0;
      var c = Number(document.getElementById('trekC').value) || 0;

      // ── LAYOUT REGEL ──────────────────────────────────────────────
      // Alle labels plasseres UTENFOR trekanten, vinkelrett forskjøvet
      // fra nærmeste linje. Ingen tekst krysser noen linje.
      //   - Side-labels: midtpunkt av siden + offset langs utover-normalen
      //   - Vinkel-labels: utenfor vertex, langs vinkelhalberende bort fra trekanten
      //   - 90°: inne i rettvinkelboksen (eneste unntak, den er liten nok)
      // Minimum offset fra linje til tekst: 14px
      // ──────────────────────────────────────────────────────────────

      var LABEL_OFFSET = 18;
      var FONT = 'font-weight="700" font-family="DM Sans, sans-serif"';

      // Scale to fit — generous padding for outside labels
      var maxSide = Math.max(a, b);
      var scale = 180 / maxSide;
      var sa = Math.max(a * scale, 40);
      var sb = Math.max(b * scale, 40);
      var pad = 60;

      var w = sa + pad * 2 + 30;
      var hh = sb + pad * 2 + 20;

      // Vertices: bottom-left, bottom-right (right angle), top-right
      var x1 = pad;
      var y1 = pad + sb;
      var x2 = pad + sa;
      var y2 = pad + sb;
      var x3 = pad + sa;
      var y3 = pad;

      // Right-angle marker size, scaled but clamped
      var rm = Math.min(18, Math.min(sa, sb) * 0.15);
      var hypLen = Math.sqrt(sa * sa + sb * sb);

      // ── Outward normals for each side ─────────────────────────────
      // a (bottom): outward = down (0, +1)
      // b (right): outward = right (+1, 0)
      // c (hypotenuse): outward = upper-left, perpendicular away from right angle
      var cNormX = -sb / hypLen;
      var cNormY = -sa / hypLen;

      // ── Side label positions (midpoint + outward offset) ──────────
      var aLabelX = (x1 + x2) / 2;
      var aLabelY = y1 + LABEL_OFFSET;

      var bLabelX = x2 + LABEL_OFFSET;
      var bLabelY = (y2 + y3) / 2;

      var cMidX = (x1 + x3) / 2;
      var cMidY = (y1 + y3) / 2;
      var cLabelX = cMidX + LABEL_OFFSET * cNormX;
      var cLabelY = cMidY + LABEL_OFFSET * cNormY;

      // ── Angle label positions (outside vertex) ────────────────────
      // A at bottom-left: push left and down from vertex
      var aAngleX = x1 - 8;
      var aAngleY = y1 + LABEL_OFFSET;

      // B at top-right: push right and up from vertex
      var bAngleX = x3 + LABEL_OFFSET;
      var bAngleY = y3 - 4;

      // ── Arc radius for angle indicators (inside triangle) ────────
      var ar = Math.min(25, Math.min(sa, sb) * 0.15);

      // Angle A arc: from bottom edge to hypotenuse, inside
      var arcA1x = x1 + ar;
      var arcA1y = y1;
      var arcA2x = x1 + ar * (sa / hypLen);
      var arcA2y = y1 - ar * (sb / hypLen);

      // Angle B arc: from hypotenuse to right edge, inside
      var arcB1x = x3 - ar * (sa / hypLen);
      var arcB1y = y3 + ar * (sb / hypLen);
      var arcB2x = x3;
      var arcB2y = y3 + ar;

      // 90° text inside the right-angle square
      var tx90 = x2 - rm / 2;
      var ty90 = y2 - rm / 2 + 3;
      var fs90 = Math.max(7, Math.min(9, rm * 0.55));

      var svg = '<svg viewBox="0 0 ' + w + ' ' + hh + '" style="width:100%;height:auto;display:block;background:var(--card);border-radius:14px;border:1.5px solid var(--line)">'
        // Fill
        + '<polygon points="' + x1 + ',' + y1 + ' ' + x2 + ',' + y2 + ' ' + x3 + ',' + y3 + '" fill="var(--accent-soft)" stroke="none" />'
        // Outline
        + '<polygon points="' + x1 + ',' + y1 + ' ' + x2 + ',' + y2 + ' ' + x3 + ',' + y3 + '" fill="none" stroke="var(--text)" stroke-width="2.5" stroke-linejoin="round" />'
        // Right angle marker
        + '<polyline points="' + (x2 - rm) + ',' + y2 + ' ' + (x2 - rm) + ',' + (y2 - rm) + ' ' + x2 + ',' + (y2 - rm) + '" fill="none" stroke="var(--muted)" stroke-width="1.5" />'
        // 90° inside square
        + '<text x="' + tx90 + '" y="' + ty90 + '" text-anchor="middle" font-size="' + fs90 + '" font-weight="600" font-family="DM Sans, sans-serif" fill="var(--muted)">90°</text>'
        // Angle arcs (inside triangle)
        + '<path d="M ' + arcA1x.toFixed(1) + ',' + arcA1y.toFixed(1) + ' A ' + ar + ',' + ar + ' 0 0,0 ' + arcA2x.toFixed(1) + ',' + arcA2y.toFixed(1) + '" fill="none" stroke="var(--blue)" stroke-width="2" />'
        + '<path d="M ' + arcB1x.toFixed(1) + ',' + arcB1y.toFixed(1) + ' A ' + ar + ',' + ar + ' 0 0,0 ' + arcB2x.toFixed(1) + ',' + arcB2y.toFixed(1) + '" fill="none" stroke="var(--blue)" stroke-width="2" />'
        // Vertex dots
        + '<circle cx="' + x1 + '" cy="' + y1 + '" r="3" fill="var(--text)" />'
        + '<circle cx="' + x2 + '" cy="' + y2 + '" r="3" fill="var(--text)" />'
        + '<circle cx="' + x3 + '" cy="' + y3 + '" r="3" fill="var(--text)" />'
        // ── Side labels (outside, perpendicular to side) ────────────
        // a: below bottom edge
        + '<text x="' + aLabelX + '" y="' + aLabelY + '" text-anchor="middle" font-size="13" ' + FONT + ' fill="var(--text)">a = ' + a.toFixed(1) + '</text>'
        // b: right of right edge
        + '<text x="' + bLabelX + '" y="' + bLabelY + '" text-anchor="start" font-size="13" ' + FONT + ' fill="var(--text)">b = ' + b.toFixed(1) + '</text>'
        // c: offset perpendicular from hypotenuse, upper-left side
        + '<text x="' + cLabelX.toFixed(1) + '" y="' + cLabelY.toFixed(1) + '" text-anchor="middle" font-size="13" ' + FONT + ' fill="var(--text)">c = ' + c.toFixed(1) + '</text>'
        // ── Angle labels (outside vertex) ───────────────────────────
        // A: below-left of bottom-left vertex
        + '<text x="' + aAngleX + '" y="' + aAngleY + '" text-anchor="end" font-size="12" ' + FONT + ' fill="var(--blue)">A = ' + A.toFixed(1) + '°</text>'
        // B: right of top-right vertex
        + '<text x="' + bAngleX + '" y="' + bAngleY + '" text-anchor="start" font-size="12" ' + FONT + ' fill="var(--blue)">B = ' + B.toFixed(1) + '°</text>'
        + '</svg>';

      svgEl.innerHTML = svg;
    }

    window.onTrekantInput = function(fieldId) {
      var val = Number(document.getElementById(fieldId).value);

      if (!val || val <= 0) {
        // Remove from locked if cleared
        var idx = _trekantLocked.indexOf(fieldId);
        if (idx !== -1) _trekantLocked.splice(idx, 1);
      } else {
        // Add to locked if not already
        if (_trekantLocked.indexOf(fieldId) === -1) {
          if (_trekantLocked.length >= 2) return; // already locked
          _trekantLocked.push(fieldId);
        }
      }

      // Update disabled state
      var allIds = ['trekA', 'trekB', 'trekC', 'trekVinkelA', 'trekVinkelB'];
      for (var i = 0; i < allIds.length; i++) {
        var inputEl = document.getElementById(allIds[i]);
        if (!inputEl) continue;
        var isLocked = _trekantLocked.indexOf(allIds[i]) !== -1;
        var shouldDisable = _trekantLocked.length >= 2 && !isLocked;
        inputEl.disabled = shouldDisable;
        inputEl.style.opacity = shouldDisable ? '0.7' : '1';
        inputEl.style.background = shouldDisable ? 'var(--bg)' : 'var(--card)';
      }

      calcTrekant();
    };

    window.nullstillTrekant = function() {
      _trekantLocked = [];
      var allIds = ['trekA', 'trekB', 'trekC', 'trekVinkelA', 'trekVinkelB'];
      for (var i = 0; i < allIds.length; i++) {
        var inputEl = document.getElementById(allIds[i]);
        if (inputEl) {
          inputEl.value = '';
          inputEl.disabled = false;
          inputEl.style.opacity = '1';
          inputEl.style.background = 'var(--card)';
        }
      }
      var resEl = document.getElementById('trekantResultat');
      if (resEl) resEl.innerHTML = '<div style="text-align:center;color:var(--muted);font-size:14px;padding:20px">Fyll inn 2 verdier for å beregne...</div>';
      var simEl = document.getElementById('trekantSimulering');
      if (simEl) simEl.innerHTML = '';
    };

    window.simulerTrekant = simulerTrekant;



    // ── TAKSPERRE ────────────────────────────────────────────────────────

    var _taksperreDebounce = null;

    function renderTaksperreKalkulator() {
      var inp = 'width:100%;padding:12px 14px;border:1.5px solid var(--line);border-radius:10px;font-size:16px;box-sizing:border-box;font-family:inherit;background-color:var(--card)';
      var lbl = 'display:block;font-size:12px;font-weight:700;margin-bottom:8px;color:var(--muted);text-transform:uppercase;letter-spacing:0.3px';
      var chipBase = 'padding:8px 14px;border-radius:8px;border:1.5px solid var(--line);background:var(--card);font-size:14px;font-weight:600;cursor:pointer;font-family:inherit';

      var h = '<div style="width:100%;max-width:540px;margin:0 auto;padding:20px 16px">'

        // Header
        + '<div style="display:flex;align-items:center;gap:10px;margin-bottom:28px">'
        + makkerBackBtn('openMakkerTool(null)')
        + '<div><h1 style="font-size:20px;font-weight:800;margin:0;font-family:var(--font-display)">Taksperre</h1>'
        + '<div style="font-size:13px;color:var(--muted)">Kappemål, loddskjær og garpehakk</div></div>'
        + '</div>'

        // Input
        + '<div style="background:var(--card);border:1.5px solid var(--line);border-radius:14px;padding:20px;margin-bottom:20px">'
        + '<div style="display:grid;gap:16px">'

        // Run + vinkel (påkrevd, side om side)
        + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">'
        + '<div>'
        + '<label style="' + lbl + '">Avstand møne–vegg (mm)</label>'
        + '<input id="tsRun" type="number" inputmode="numeric" oninput="calcTaksperreDebounce()" style="' + inp + '" placeholder="3000" />'
        + '</div>'
        + '<div>'
        + '<label style="' + lbl + '">Takvinkel (°)</label>'
        + '<input id="tsVinkel" type="number" inputmode="decimal" oninput="calcTaksperreDebounce()" style="' + inp + '" placeholder="30" />'
        + '</div></div>'

        // Utstikk + sperrehøyde
        + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">'
        + '<div>'
        + '<label style="' + lbl + '">Utstikk (mm)</label>'
        + '<input id="tsUtstikk" type="number" inputmode="numeric" oninput="calcTaksperreDebounce()" style="' + inp + '" value="300" />'
        + '</div>'
        + '<div>'
        + '<label style="' + lbl + '">Sperrehøyde (mm)</label>'
        + '<select id="tsSperrehoyde" onchange="calcTaksperre()" style="' + inp + '">'
        + '<option value="148">148</option>'
        + '<option value="198" selected>198</option>'
        + '<option value="248">248</option>'
        + '<option value="298">298</option>'
        + '</select>'
        + '</div></div>'

        // Fuglehakk
        + '<div>'
        + '<label style="' + lbl + '">Garpehakk bredde (mm)</label>'
        + '<div style="display:flex;gap:8px;margin-bottom:8px">'
        + '<button onclick="settFuglehakk(73)" style="' + chipBase + '">73</button>'
        + '<button onclick="settFuglehakk(98)" style="' + chipBase + '">98</button>'
        + '<button onclick="settFuglehakk(100)" style="' + chipBase + '">100</button>'
        + '<button onclick="settFuglehakk(148)" style="' + chipBase + '">148</button>'
        + '<button onclick="settFuglehakk(198)" style="' + chipBase + '">198</button>'
        + '</div>'
        + '<input id="tsFuglehakk" type="number" inputmode="numeric" oninput="calcTaksperreDebounce()" style="' + inp + '" value="100" />'
        + '</div>'

        + '</div></div>'

        // Resultat
        + '<div id="taksperreResultat" style="min-height:60px"></div>'

        + '</div>';
      return h;
    }

    function calcTaksperreDebounce() {
      if (_taksperreDebounce) clearTimeout(_taksperreDebounce);
      _taksperreDebounce = setTimeout(calcTaksperre, 300);
    }

    function calcTaksperre() {
      var el = document.getElementById('taksperreResultat');
      if (!el) return;

      var run = Number(document.getElementById('tsRun').value);
      var vinkel = Number(document.getElementById('tsVinkel').value);
      var utstikk = Number(document.getElementById('tsUtstikk').value);
      var sperrehoyde = Number(document.getElementById('tsSperrehoyde').value);
      var fuglehakk = Number(document.getElementById('tsFuglehakk').value);

      var res = beregnTaksperre({
        run: run,
        takvinkel: vinkel,
        utstikk: utstikk,
        sperrehoyde: sperrehoyde,
        fuglehakkBredde: fuglehakk
      });

      if (!res.gyldig) {
        el.innerHTML = '<div style="text-align:center;color:var(--muted);font-size:14px;padding:20px">Fyll inn avstand og takvinkel</div>';
        return;
      }

      var h = '';

      // Blokk 1 — Sperrelengde
      h += '<div style="background:var(--card);border:1.5px solid var(--line);border-radius:14px;padding:20px;margin-bottom:12px">'
        + '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--muted);margin-bottom:12px">Sperrelengde</div>'
        + '<div style="font-size:36px;font-weight:900;color:var(--text);line-height:1">' + res.sperreTopLengde + ' <span style="font-size:18px;font-weight:600">mm</span></div>'
        + '<div style="font-size:13px;color:var(--muted);margin-top:4px">Overside (Rafter Top Length)</div>'
        + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px;padding-top:16px;border-top:1px solid var(--line)">'
        + taksperreRad('Total lengde', res.sperreTotalLengde + ' mm')
        + taksperreRad('Loddskjær avmerking', res.loddskjaerSetback + ' mm')
        + taksperreRad('Sagvinkel (loddskjær)', res.loddskjaerVinkel + '°')
        + taksperreRad('Kuttlengde loddskjær', res.kuttlengde + ' mm')
        + '</div></div>';

      // Blokk 2 — Garpehakk
      h += '<div style="background:var(--card);border:1.5px solid var(--line);border-radius:14px;padding:20px;margin-bottom:12px">'
        + '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--muted);margin-bottom:12px">Garpehakk</div>'
        + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">'
        + taksperreRad('Bredde (seat)', res.fuglehakkBredde + ' mm')
        + taksperreRad('Dybde', res.fuglehakkDybde + ' mm')
        + taksperreRad('Loddsnitt', res.loddskjaerVinkel + '°')
        + taksperreRad('Vannrett snitt', res.fuglehakkVinkel + '°')
        + '</div>';

      // Advarsel
      if (res.advarsler.length > 0) {
        h += '<div style="margin-top:12px;padding:10px 14px;background:var(--yellow-soft);border:1.5px solid var(--amber);border-radius:var(--radius-xs);font-size:13px;color:var(--text)">';
        for (var i = 0; i < res.advarsler.length; i++) {
          var tekst = res.advarsler[i].replace(/^[A-Z_]+:\s*/, '');
          h += '<div style="display:flex;align-items:baseline;gap:6px"><span style="font-weight:700;color:var(--amber);flex-shrink:0">OBS</span> ' + tekst + '</div>';
        }
        h += '</div>';
      }
      h += '</div>';

      // Blokk 3 — Høyder og avstander
      h += '<div style="background:var(--card);border:1.5px solid var(--line);border-radius:14px;padding:20px">'
        + '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--muted);margin-bottom:12px">Høyder og avstander</div>'
        + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">'
        + taksperreRad('Rise', res.rise + ' mm')
        + taksperreRad('HAP (Height Above Plate)', res.hap + ' mm')
        + taksperreRad('Total fall', res.totalFall + ' mm')
        + taksperreRad('Utstikk fall', res.utstikkFall + ' mm')
        + taksperreRad('Total run', res.totalRun + ' mm')
        + taksperreRad('Utstikk langs sperre', res.utstikkLangsSperre + ' mm')
        + taksperreRad('Underkant stigning', res.underkantStigning + ' mm')
        + taksperreRad('Sperrehøyde', res.input.sperrehoyde + ' mm')
        + '</div></div>';

      el.innerHTML = taksperreDiagram(res) + h;
    }

    function taksperreRad(label, verdi) {
      return '<div>'
        + '<div style="font-size:11px;color:var(--muted)">' + label + '</div>'
        + '<div style="font-size:18px;font-weight:800;color:var(--text)">' + verdi + '</div>'
        + '</div>';
    }

    function taksperreDiagram(res) {
      return '<div style="border-radius:12px;overflow:hidden;border:1.5px solid var(--line);margin-bottom:12px">'
        + '<img src="img/Sperre-ref/rafter3.png" style="width:100%;display:block" alt="Taksperre-diagram" />'
        + '</div>';
    }

    window.settFuglehakk = function(verdi) {
      var el = document.getElementById('tsFuglehakk');
      if (el) {
        el.value = verdi;
        calcTaksperre();
      }
    };

    window.calcTaksperre = calcTaksperre;
    window.calcTaksperreDebounce = calcTaksperreDebounce;

    // ── TRAPP EVENT HANDLERS ──────────────────────────────────────────────

    window.velgTrappType = function(id) {
      _trappType = id;
      _trappModus = null;
      _trappTrinn = 0;
      _trappTrinnJustering = 0;
      renderMakkerView();
    };

    window.velgTrappModus = function(modus) {
      _trappModus = modus;
      _trappTrinn = 0;
      _trappTrinnJustering = 0;
      renderMakkerView();
    };

    window.justerTrappTrinn = function(delta) {
      _trappTrinnJustering += delta;
      calcTrapp();
    };

    // ── GAVLSTENDER ────────────────────────────────────────────────

    var _gavlFields = [
      { id: 'angleDeg', label: 'Takvinkel (°)', type: 'number', placeholder: '30', def: 30, group: 'Hovedmål', hint: 'Grader (0–90)' },
      { id: 'startHeight', label: 'Starthøyde (mm)', type: 'number', placeholder: '2400', def: 2400, group: 'Hovedmål', hint: 'Gulv til overkant toppsvill' },
      { id: 'lengthLevel', label: 'Vegglengde (mm)', type: 'number', placeholder: '5000', def: 5000, group: 'Hovedmål', hint: 'Total gavlvegg-lengde' },
      { id: 'spacing', label: 'Senteravstand c/c', type: 'select', opts: [
        { v: '300', l: '300 mm' }, { v: '400', l: '400 mm' }, { v: '600', l: '600 mm (standard)' }
      ], def: '600', group: 'Dimensjoner' },
      { id: 'studWidth', label: 'Stenderbredde', type: 'select', opts: [
        { v: '36', l: '36 mm' }, { v: '48', l: '48 mm (standard)' }
      ], def: '48', group: 'Dimensjoner' },
      { id: 'plateThick', label: 'Toppsvill-tykkelse', type: 'select', opts: [
        { v: '36', l: '36 mm' }, { v: '48', l: '48 mm (standard)' }
      ], def: '48', group: 'Dimensjoner' },
      { id: 'topPlateCount', label: 'Antall toppsviller', type: 'select', opts: [
        { v: '1', l: '1 (standard)' }, { v: '2', l: '2' }
      ], def: '1', group: 'Dimensjoner' },
      { id: 'measurePoint', label: 'Oppmerkingspunkt', type: 'select', opts: [
        { v: 'near', l: 'Nær side' }, { v: 'centre', l: 'Senter (standard)' }, { v: 'far', l: 'Fjern side' }
      ], def: 'centre', group: 'Oppmerking' },
      { id: 'alignSheets', label: 'Juster for platekant', type: 'checkbox', def: false, group: 'Oppmerking' },
      { id: 'startMode', label: 'Startmodus', type: 'select', opts: [
        { v: 'single', l: 'Enkel stender' }, { v: 'double', l: 'Dobbel stender' }, { v: 'doubleGap', l: 'Dobbel + gap' }
      ], def: 'single', group: 'Oppmerking' }
    ];

    function renderGavlTool() {
      var inp = 'width:100%;padding:12px 14px;border:1.5px solid var(--line);border-radius:10px;font-size:16px;box-sizing:border-box;font-family:inherit;background-color:var(--card);color:var(--text)';
      var lbl = 'display:block;font-size:12px;font-weight:700;margin-bottom:4px;color:var(--muted);text-transform:uppercase;letter-spacing:0.3px';
      var hnt = 'display:block;font-size:11px;color:var(--muted);margin-bottom:6px;font-weight:400';
      var grpHdr = 'font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.06em;margin:18px 0 8px;padding-bottom:4px;border-bottom:1px solid var(--line)';

      var h = '<div style="width:100%;max-width:540px;margin:0 auto;padding:20px 16px">'
        + '<div style="display:flex;align-items:center;gap:10px;margin-bottom:28px">'
        + makkerBackBtn('openMakkerTool(null)')
        + '<div>'
        + '<h1 style="font-size:20px;font-weight:800;margin:0;font-family:var(--font-display)">Gavelvegg - stendere</h1>'
        + '</div>'
        + '</div>';

      // Felt gruppert
      h += '<div style="background:var(--card);border:1.5px solid var(--line);border-radius:14px;padding:20px;margin-bottom:20px">';
      var currentGroup = null;
      _gavlFields.forEach(function(f) {
        if (f.group !== currentGroup) {
          currentGroup = f.group;
          h += '<div style="' + grpHdr + (f.group === 'Hovedmål' ? ';margin-top:0' : '') + '">' + f.group + '</div>';
        }
        h += '<div style="margin-bottom:12px">';
        h += '<label style="' + lbl + '" for="gv_' + f.id + '">' + f.label + '</label>';
        if (f.hint) h += '<span style="' + hnt + '">' + f.hint + '</span>';
        if (f.type === 'select') {
          h += '<select id="gv_' + f.id + '" onchange="calcGavl()" style="' + inp + '">';
          f.opts.forEach(function(o) {
            var sel = String(f.def) === o.v ? ' selected' : '';
            h += '<option value="' + o.v + '"' + sel + '>' + o.l + '</option>';
          });
          h += '</select>';
        } else if (f.type === 'checkbox') {
          h += '<label style="display:flex;align-items:center;gap:8px;font-size:14px;font-weight:600;color:var(--text);cursor:pointer;margin-top:4px">'
            + '<input type="checkbox" id="gv_' + f.id + '"' + (f.def ? ' checked' : '') + ' onchange="calcGavl()" style="width:20px;height:20px;accent-color:var(--accent)" /> Ja</label>';
        } else {
          h += '<input type="number" inputmode="numeric" id="gv_' + f.id + '" value="' + (f.def || '') + '" placeholder="' + (f.placeholder || '') + '" oninput="calcGavl()" style="' + inp + '" />';
        }
        h += '</div>';
      });
      h += '</div>';

      // Resultat
      h += '<div id="gavlResultat"></div>'
        + '</div>';
      return h;
    }

    var _lastGavlResult = null;

    function gcSummaryCard(label, value, unit, isAccent) {
      var cls = 'gc-summary-item' + (isAccent ? ' gc-summary-accent' : '');
      return '<div class="' + cls + '">'
        + '<span class="gc-summary-label">' + label + '</span>'
        + '<span class="gc-summary-value">' + value + ' <span class="mc-result-unit">' + unit + '</span></span>'
        + '</div>';
    }

    function renderGavlDiagram(res) {
      var stendere = res.stendere;
      if (stendere.length < 2) return '';

      var s = res.sammendrag;
      var W = 580;
      var H = 150;
      var pad = 20;
      var floorY = H - pad;

      var maxRun = stendere[stendere.length - 1].runLevel;
      var maxH = s.lengste;
      var minH = s.korteste;
      if (maxRun <= 0 || maxH <= 0) return '';

      var scaleX = (W - 2 * pad) / maxRun;
      var scaleY = (H - 2 * pad) / maxH;
      var scale = Math.min(scaleX, scaleY);
      var drawW = maxRun * scale;
      var offsetX = pad;

      var svg = '<div class="gc-diagram-wrap">';
      svg += '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Gavelvegg sidevisning">';

      // Gulvlinje
      svg += '<line x1="' + (offsetX - 5) + '" y1="' + floorY + '" x2="' + (offsetX + drawW + 5) + '" y2="' + floorY + '" stroke="var(--muted)" stroke-width="1.5" stroke-dasharray="4,3"/>';

      // Taklinje
      var firstX = offsetX + stendere[0].runLevel * scale;
      var firstTopY = floorY - minH * scale;
      var lastX = offsetX + stendere[stendere.length - 1].runLevel * scale;
      var lastTopY = floorY - maxH * scale;
      svg += '<line x1="' + (firstX - 8) + '" y1="' + (firstTopY + 4) + '" x2="' + (lastX + 8) + '" y2="' + (lastTopY - 4) + '" stroke="var(--accent)" stroke-width="1.5"/>';

      // Stendere
      stendere.forEach(function(st, i) {
        var x = offsetX + st.runLevel * scale;
        var topY = floorY - st.lengdeLangside * scale;
        var isFirst = i === 0;
        var isLast = i === stendere.length - 1;
        var color = isFirst ? 'var(--accent)' : (isLast ? 'var(--blue)' : 'var(--muted)');
        var opacity = (isFirst || isLast) ? '1' : '0.35';
        var w = (isFirst || isLast) ? 2 : 1;
        svg += '<line x1="' + x + '" y1="' + floorY + '" x2="' + x + '" y2="' + topY + '" stroke="' + color + '" stroke-width="' + w + '" opacity="' + opacity + '"/>';
      });

      svg += '</svg></div>';
      return svg;
    }

    function copyGavlTable() {
      if (!_lastGavlResult) return;
      var lines = ['Nr\tLangside (mm)\tKortside (mm)\tOppmerking (mm)\tLangs toppsvill (mm)'];
      _lastGavlResult.stendere.forEach(function(st) {
        lines.push(st.nr + '\t' + st.lengdeLangside + '\t' + st.lengdeKortside + '\t' + st.runLevel + '\t' + st.runAngle);
      });
      navigator.clipboard.writeText(lines.join('\n')).then(function() {
        var btn = document.querySelector('.gc-copy-btn');
        if (!btn) return;
        btn.classList.add('gc-copy-btn--done');
        btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Kopiert!';
        setTimeout(function() {
          btn.classList.remove('gc-copy-btn--done');
          btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg> Kopier tabell';
        }, 2000);
      });
    }
    window.copyGavlTable = copyGavlTable;

    function calcGavl() {
      var v = {};
      _gavlFields.forEach(function(f) {
        var el = document.getElementById('gv_' + f.id);
        if (!el) return;
        v[f.id] = f.type === 'checkbox' ? el.checked : el.value;
      });

      var angleDeg = Number(v.angleDeg) || 0;
      var startHeight = Number(v.startHeight) || 0;
      var container = document.getElementById('gavlResultat');
      if (!container) return;

      if (angleDeg <= 0 || startHeight <= 0) {
        container.innerHTML = '<div style="padding:24px;text-align:center;background:var(--bg-warm);border:1px dashed var(--line);border-radius:12px;font-size:13px;color:var(--muted);font-weight:600">Fyll inn takvinkel og starthøyde</div>';
        return;
      }

      var res = beregnGavlStendere({
        angleDeg: angleDeg,
        startHeight: startHeight,
        lengthLevel: Number(v.lengthLevel) || 5000,
        spacing: Number(v.spacing) || 600,
        studWidth: Number(v.studWidth) || 48,
        plateThick: Number(v.plateThick) || 48,
        topPlateCount: Number(v.topPlateCount) === 2 ? 2 : 1,
        measurePoint: v.measurePoint || 'centre',
        alignSheets: !!v.alignSheets,
        startMode: v.startMode || 'single'
      });

      if (!res.gyldig) {
        container.innerHTML = '<div style="padding:24px;text-align:center;background:var(--bg-warm);border:1px dashed var(--line);border-radius:12px;font-size:13px;color:var(--muted);font-weight:600">Ugyldig input</div>';
        return;
      }

      _lastGavlResult = res;
      var s = res.sammendrag;
      var html = '';

      // SVG diagram
      html += renderGavlDiagram(res);

      // Sammendrag
      html += '<div class="gc-summary">';
      html += gcSummaryCard('Antall', s.antall, 'stk', true);
      html += gcSummaryCard('Korteste', s.korteste, 'mm');
      html += gcSummaryCard('Lengste', s.lengste, 'mm');
      html += gcSummaryCard('Økning/c/c', s.oekningPerCc, 'mm');
      html += gcSummaryCard('Toppkutt', s.toppkuttVinkel, '°');
      html += gcSummaryCard('Setback', s.topCutSetback, 'mm');
      html += '</div>';

      // Kopier-knapp
      html += '<div class="gc-actions">';
      html += '<button class="gc-copy-btn" onclick="copyGavlTable()" aria-label="Kopier tabell">';
      html += '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>';
      html += ' Kopier tabell</button></div>';

      // Stendertabell
      html += '<div class="gc-table-wrap"><table class="gc-table">';
      html += '<thead><tr><th>Nr</th><th class="gc-th-r">Langside (mm)</th><th class="gc-th-r">Kortside (mm)</th><th class="gc-th-r">Oppmerking (mm)</th><th class="gc-th-r">Langs toppsvill (mm)</th></tr></thead>';
      html += '<tbody>';
      var last = res.stendere.length - 1;
      res.stendere.forEach(function(st, i) {
        var rowClass = i === 0 ? ' class="gc-row-first"' : (i === last ? ' class="gc-row-last"' : '');
        html += '<tr' + rowClass + '>';
        html += '<td class="gc-nr">' + st.nr + '</td>';
        html += '<td class="gc-td-r gc-len">' + st.lengdeLangside + '</td>';
        html += '<td class="gc-td-r gc-len">' + st.lengdeKortside + '</td>';
        html += '<td class="gc-td-r">' + st.runLevel + '</td>';
        html += '<td class="gc-td-r">' + st.runAngle + '</td>';
        html += '</tr>';
      });
      html += '</tbody></table></div>';

      // Advarsler
      if (res.advarsler.length > 0) {
        html += '<div class="gc-warnings">';
        res.advarsler.forEach(function(a) {
          html += '<div class="gc-warning">' + a + '</div>';
        });
        html += '</div>';
      }

      container.innerHTML = html;
    }

    window.calcGavl = calcGavl;

    window.openMakkerTool = function(id) {
      _makkerTool = id;
      if (id !== 'trapp') {
        _trappType = null;
        _trappModus = null;
        _trappTrinn = 0;
        _trappTrinnJustering = 0;
      }
      renderMakkerView();
    };

    // (gammel trapp-kode fjernet)
