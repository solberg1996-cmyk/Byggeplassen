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
  var inp = 'width:100%;padding:12px 14px;border:1.5px solid #e0e8f5;border-radius:10px;font-size:16px;box-sizing:border-box;font-family:inherit;background:var(--bg-warm)';
  var lbl = 'display:block;font-size:12px;font-weight:700;margin-bottom:8px;color:#555;text-transform:uppercase;letter-spacing:0.3px';
  var select = 'width:100%;padding:12px 14px;border:1.5px solid #e0e8f5;border-radius:10px;font-size:16px;box-sizing:border-box;font-family:inherit;background:var(--bg-warm)';
  var helperText = 'display:block;font-size:11px;color:#999;margin-top:4px;font-weight:500';

  return '<div style="width:100%;max-width:540px;margin:0 auto;padding:20px 16px">'

    // Header
    + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:28px;gap:12px">'
    + '<div style="display:flex;align-items:center;gap:10px;flex:1">'
    + '<button onclick="openMakkerTool(null)" style="background:none;border:none;color:#999;font-size:24px;cursor:pointer;padding:4px;display:flex;align-items:center;justify-content:center">←</button>'
    + '<h1 style="font-size:20px;font-weight:800;margin:0;color:#1a1a1a">🪵 Tømmermann-kledning</h1>'
    + '</div>'
    + '<button onclick="openKledningInfoModal()" style="background:none;border:none;color:#999;font-size:20px;cursor:pointer;padding:8px;display:flex;align-items:center;justify-content:center;transition:color 0.2s">ℹ️</button>'
    + '</div>'

    // Input Card
    + '<div style="background:var(--card);border:1.5px solid var(--line);border-radius:14px;padding:20px;margin-bottom:24px;box-shadow:0 2px 8px rgba(0,0,0,0.04)">'
    + '<div style="display:grid;gap:16px">'

    + '<div>'
    + '<label style="' + lbl + '">Feltlengde</label>'
    + '<input id="kledFeltlengde" type="number" value="' + _kledningInput.feltLengde + '" oninput="calcKledning()" style="' + inp + '" placeholder="3000" />'
    + '<span style="' + helperText + '">Høyde fra underkant til øverkant (mm)</span>'
    + '</div>'

    + '<div>'
    + '<label style="' + lbl + '">Underligger-bredde</label>'
    + '<input id="kledUnderligger" type="number" value="' + _kledningInput.underliggerBredde + '" oninput="calcKledning()" style="' + inp + '" placeholder="125" />'
    + '<span style="' + helperText + '">Bredde på underligger (mm)</span>'
    + '</div>'

    + '<div>'
    + '<label style="' + lbl + '">Overligger-bredde</label>'
    + '<input id="kledOverligger" type="number" value="' + _kledningInput.overliggerBredde + '" oninput="calcKledning()" style="' + inp + '" placeholder="100" />'
    + '<span style="' + helperText + '">Bredde på overligger (mm)</span>'
    + '</div>'

    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">'
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
    + '</div>'

    + '<div id="kledResultat" style="min-height:60px;display:flex;align-items:center;justify-content:center">'
    + '<div style="color:#ccc;font-size:14px">Fylg inn verdier for å beregne...</div>'
    + '</div>'

    + '</div>'

    + '<div id="kledningInfoModal" style="display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:9999;overflow:auto" onclick="if(event.target.id===\'kledningInfoModal\')closeKledningInfoModal()">'
    + '<div style="background:var(--card);border-radius:16px;margin:40px auto;padding:24px;max-width:500px;width:90%;box-shadow:0 10px 40px rgba(0,0,0,0.2)">'
    + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">'
    + '<h2 style="font-size:18px;font-weight:800;margin:0">Forklaring av mål og begreper</h2>'
    + '<button onclick="closeKledningInfoModal()" style="background:none;border:none;font-size:24px;color:#999;cursor:pointer;padding:0">✕</button>'
    + '</div>'
    + '<p style="color:#666;font-size:14px;line-height:1.6;margin-bottom:20px">Her er en visuell forklaring av de viktigste målene og begrepene brukt i tømmermannskledning.</p>'
    + '<div style="display:grid;gap:16px">'
    + '<div style="text-align:center">'
    + '<img src="img/kledning-info-1.jpg" style="width:100%;border-radius:8px;background:var(--bg-warm)" alt="Mål og oppbygging" />'
    + '<p style="font-size:12px;color:#999;margin-top:8px;margin-bottom:0">Mål og oppbygging</p>'
    + '</div>'
    + '<div style="text-align:center">'
    + '<img src="img/kledning-info-2.jpg" style="width:100%;border-radius:8px;background:var(--bg-warm)" alt="Begreper og plassering" />'
    + '<p style="font-size:12px;color:#999;margin-top:8px;margin-bottom:0">Begreper og plassering</p>'
    + '</div>'
    + '</div>'
    + '<button onclick="closeKledningInfoModal()" style="width:100%;padding:12px;margin-top:20px;background:var(--accent-soft);border:1.5px solid var(--line);border-radius:10px;font-weight:700;color:var(--accent);cursor:pointer;font-size:14px;transition:all 0.2s">Lukk</button>'
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
        return '<div style="background:var(--red-soft);border:1.5px solid rgba(196,91,91,.25);border-radius:12px;padding:16px;color:var(--red);font-weight:700;font-size:14px">'
          + res.feiltekst
          + '</div>';
      }

      var a = res.anbefalt;
      var alt = res.alternativ;
      var h = '';

      // Anbefalt card (primary)
      h += '<div style="background:linear-gradient(135deg,#f0f4ff 0%,#e8eeff 100%);border:2px solid #d0deff;border-radius:14px;padding:18px;margin-bottom:16px;box-shadow:0 4px 12px rgba(79,100,233,0.1)">'
        + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:14px">'
        + '<span style="font-size:18px">✓</span>'
        + '<span style="font-size:14px;font-weight:800;color:#4a5fc1;text-transform:uppercase;letter-spacing:0.3px">Anbefalt løsning</span>'
        + '</div>'
        + '<div style="display:grid;gap:10px">'
        + '<div style="display:flex;justify-content:space-between;align-items:center">'
        + '<span style="font-size:13px;font-weight:700;color:#666">Dekningsmål</span>'
        + '<span style="font-size:18px;font-weight:800;color:#1a1a1a">' + (a.justertDekningsmaalMm / 10).toFixed(1) + ' <span style="font-size:12px;font-weight:600;color:#999">cm</span></span>'
        + '</div>'
        + '<div style="display:flex;justify-content:space-between;align-items:center">'
        + '<span style="font-size:13px;font-weight:700;color:#666">Omlegg</span>'
        + '<span style="font-size:18px;font-weight:800;color:#1a1a1a">' + (a.justertOmleggMm / 10).toFixed(1) + ' <span style="font-size:12px;font-weight:600;color:#999">cm</span></span>'
        + '</div>'
        + '<div style="border-top:1px solid rgba(79,100,233,0.2);padding-top:10px;margin-top:10px">'
        + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">'
        + '<span style="font-size:13px;color:#666">Underliggere</span>'
        + '<span style="font-size:16px;font-weight:800">' + a.antallUnderliggere + '</span>'
        + '</div>'
        + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">'
        + '<span style="font-size:13px;color:#666">Overliggere</span>'
        + '<span style="font-size:16px;font-weight:800">' + a.antallOverliggere + '</span>'
        + '</div>'
        + '<div style="display:flex;justify-content:space-between;align-items:center;font-weight:700">'
        + '<span style="font-size:13px">Totalt bord</span>'
        + '<span style="font-size:18px;color:#4a5fc1">' + (a.antallUnderliggere + a.antallOverliggere) + '</span>'
        + '</div>'
        + '</div>'
        + '</div>'
        + '</div>';

      // Alternativ card (secondary)
      if (alt) {
        h += '<div style="background:var(--card);border:1.5px solid var(--line);border-radius:14px;padding:16px;margin-bottom:16px">'
          + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">'
          + '<span style="font-size:14px;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:0.3px">Alternativ løsning</span>'
          + '</div>'
          + '<div style="display:grid;gap:10px">'
          + '<div style="display:flex;justify-content:space-between;align-items:center">'
          + '<span style="font-size:13px;font-weight:700;color:#666">Dekningsmål</span>'
          + '<span style="font-size:16px;font-weight:800;color:#1a1a1a">' + (alt.justertDekningsmaalMm / 10).toFixed(1) + ' <span style="font-size:12px;font-weight:600;color:#999">cm</span></span>'
          + '</div>'
          + '<div style="display:flex;justify-content:space-between;align-items:center">'
          + '<span style="font-size:13px;font-weight:700;color:#666">Omlegg</span>'
          + '<span style="font-size:16px;font-weight:800;color:#1a1a1a">' + (alt.justertOmleggMm / 10).toFixed(1) + ' <span style="font-size:12px;font-weight:600;color:#999">cm</span></span>'
          + '</div>'
          + '<div style="border-top:1px solid #e0e8f5;padding-top:10px;margin-top:10px">'
          + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">'
          + '<span style="font-size:13px;color:#666">Underliggere</span>'
          + '<span style="font-size:16px;font-weight:800">' + alt.antallUnderliggere + '</span>'
          + '</div>'
          + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">'
          + '<span style="font-size:13px;color:#666">Overliggere</span>'
          + '<span style="font-size:16px;font-weight:800">' + alt.antallOverliggere + '</span>'
          + '</div>'
          + '<div style="display:flex;justify-content:space-between;align-items:center;font-weight:700">'
          + '<span style="font-size:13px">Totalt bord</span>'
          + '<span style="font-size:16px">' + (alt.antallUnderliggere + alt.antallOverliggere) + '</span>'
          + '</div>'
          + '</div>'
          + '</div>'
          + '</div>';
      }

      // Utdelingsmål section
      h += '<div style="background:var(--card);border:1.5px solid var(--line);border-radius:14px;padding:16px">'
        + '<div style="font-size:13px;font-weight:800;color:#1a1a1a;margin-bottom:14px;text-transform:uppercase;letter-spacing:0.3px">Utdelingsmål</div>';

      if (a.oppmerkingsliste && a.oppmerkingsliste.length > 0) {
        h += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px">';
        for (var i = 0; i < a.oppmerkingsliste.length; i++) {
          var m = a.oppmerkingsliste[i];
          h += '<div style="background:var(--bg-warm);border:1px solid var(--line);border-radius:8px;padding:10px;text-align:center">'
            + '<div style="font-weight:800;color:#4a5fc1;font-size:14px">U' + m.nr + '</div>'
            + '<div style="font-size:12px;color:var(--muted);margin-top:4px">' + (m.posisjonMm / 10).toFixed(1) + ' cm</div>'
            + '</div>';
        }
        h += '</div>';
      } else {
        h += '<div style="color:#999;font-size:13px;font-style:italic">Ingen oppmerking</div>';
      }

      h += '</div>';

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
        + '<button onclick="openMakkerTool(null)" style="background:none;border:none;color:var(--muted);font-size:24px;cursor:pointer;padding:4px;display:flex;align-items:center;justify-content:center">←</button>'
        + '<h1 style="font-size:20px;font-weight:800;margin:0">📏 Inndeling</h1>'
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
      { id: 'trapp',     icon: '🪜', name: 'Trappekalkulator',    desc: 'Beregn stigning, inntrinn og antall trinn' },
      { id: 'inndeling', icon: '📏', name: 'Inndelingskalkulator', desc: 'Fordel materialer jevnt over en lengde' },
      { id: 'vinkel',    icon: '📐', name: 'Vinkelkalkulator',     desc: 'Beregn vinkler og lengder' },
      { id: 'kledning',  icon: '🪵', name: 'Tømmermannskledning', desc: 'Beregn tømmermannskledning' },
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
}

    function renderMakkerHome(){
      return '<div style="width:100%;max-width:480px;margin:0 auto;padding:24px">'
        + '<div style="display:flex;align-items:center;gap:12px;margin-bottom:28px">'
        + '<button onclick="goToHome()" style="background:none;border:none;color:var(--muted);font-size:20px;cursor:pointer;padding:4px">←</button>'
        + '<div><div style="font-size:22px;font-weight:800">Makker</div>'
        + '<div style="font-size:13px;color:var(--muted)">Verktøy for håndverkeren</div></div>'
        + '</div>'
        + '<div style="display:flex;flex-direction:column;gap:10px">'
        + _makkerTools.map(function(t){
            return '<button onclick="openMakkerTool(\'' + t.id + '\')"'
              + ' style="background:var(--card);border:1.5px solid var(--line);border-radius:16px;padding:18px 20px;text-align:left;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.06)">'
              + '<div style="font-size:20px;margin-bottom:4px">' + t.icon + '</div>'
              + '<div style="font-size:16px;font-weight:800">' + t.name + '</div>'
              + '<div style="font-size:12px;color:var(--muted);margin-top:2px">' + t.desc + '</div>'
              + '</button>';
          }).join('')
        + '</div>'
        + '</div>';
    }

    function renderMakkerTool(id){
      if(id==='trapp') return renderTrappModul();
      if(id==='kledning') return renderKledningTool();
      if(id==='inndeling') return renderInndelingTool();
      var t = _makkerTools.find(function(x){ return x.id===id; });
      if(!t) return renderMakkerHome();
      return '<div style="width:100%;max-width:480px;margin:0 auto;padding:24px">'
        + '<div style="display:flex;align-items:center;gap:12px;margin-bottom:28px">'
        + '<button onclick="openMakkerTool(null)" style="background:none;border:none;color:var(--muted);font-size:20px;cursor:pointer;padding:4px">←</button>'
        + '<div><div style="font-size:22px;font-weight:800">' + t.icon + ' ' + t.name + '</div></div>'
        + '</div>'
        + '<div style="background:var(--card);border:1.5px solid var(--line);border-radius:16px;padding:24px;text-align:center;color:var(--muted)">'
        + '<div style="font-size:32px;margin-bottom:10px">' + t.icon + '</div>'
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
        + '<button onclick="openMakkerTool(null)" style="background:none;border:none;color:var(--muted);font-size:24px;cursor:pointer;padding:4px;display:flex;align-items:center;justify-content:center">←</button>'
        + '<h1 style="font-size:20px;font-weight:800;margin:0">🪜 Trappekalkulator</h1>'
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
        + '<button onclick="velgTrappType(null)" style="background:none;border:none;color:var(--muted);font-size:24px;cursor:pointer;padding:4px;display:flex;align-items:center;justify-content:center">←</button>'
        + '<div><h1 style="font-size:20px;font-weight:800;margin:0">🪜 ' + (type ? type.name : 'Trapp') + '</h1>'
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
        + '<button onclick="velgTrappModus(null)" style="background:none;border:none;color:var(--muted);font-size:24px;cursor:pointer;padding:4px;display:flex;align-items:center;justify-content:center">←</button>'
        + '<div><h1 style="font-size:20px;font-weight:800;margin:0">🪜 ' + (type ? type.name : 'Trapp') + '</h1>'
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
      var GUL = '#f0a202';

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
        opptrinn >= 150 && opptrinn <= 220 ? '✓ Innenfor (150–220 mm)' : '✗ Utenfor (150–220 mm)', opptrinnFarge);

      if (inntrinn) {
        h += rad('Inntrinn', '<span style="color:' + inntrinnFarge + '">' + inntrinn.toFixed(1) + ' mm</span>',
          inntrinn >= 220 && inntrinn <= 300 ? '✓ Innenfor (220–300 mm)' : '✗ Utenfor (220–300 mm)', inntrinnFarge);
      }

      h += rad('Trappeformel', '<span style="color:' + formelFarge + '">' + formel.toFixed(0) + ' mm</span>',
        formel >= 600 && formel <= 640 ? '✓ Innenfor (600–640 mm)' : '✗ Utenfor (600–640 mm)', formelFarge);

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
