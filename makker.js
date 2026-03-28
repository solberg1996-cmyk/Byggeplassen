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

    function lagFeilKledning(feiltekst) {
      return { feil: true, feiltekst: feiltekst };
    }

    function beregnStatus(justertOmleggMm, tykkelseMm) {
      var gronnMin = tykkelseMm + 5;
      var gronnMax = tykkelseMm + 15;
      var gulMin1 = tykkelseMm - 5;
      var gulMax1 = tykkelseMm + 4;
      var gulMin2 = tykkelseMm + 16;
      var gulMax2 = tykkelseMm + 25;

      if (justertOmleggMm >= gronnMin && justertOmleggMm <= gronnMax) {
        return 'grønn';
      }
      if ((justertOmleggMm >= gulMin1 && justertOmleggMm <= gulMax1) ||
          (justertOmleggMm >= gulMin2 && justertOmleggMm <= gulMax2)) {
        return 'gul';
      }
      return 'rød';
    }

    function beregnTommermannskledning(input) {
      var feltLengdeMm = input.feltLengdeMm;
      var bordbreddeMm = input.bordbreddeMm;
      var tykkelseMm = input.tykkelseMm;
      var startStoppType = input.startStoppType;

      if (!feltLengdeMm || feltLengdeMm <= 0) return lagFeilKledning('Feltlengde må være større enn 0');
      if (!bordbreddeMm || bordbreddeMm <= 0) return lagFeilKledning('Bordbredde må være større enn 0');
      if (!tykkelseMm || tykkelseMm <= 0) return lagFeilKledning('Tykkelse må være større enn 0');
      if (!startStoppType) return lagFeilKledning('Start/Stopp-type mangler');

      var redusertFeltlengde = feltLengdeMm - bordbreddeMm;
      if (redusertFeltlengde <= 0) return lagFeilKledning('Feldlengde må være større enn bordbredde');

      // Ideelt omlegg (overlap) basert på tykkelse
      var anbefalOmleggMm = tykkelseMm + 10;

      // Antall dekningsmål (spacings)
      var antallDekningsmaal = Math.ceil(redusertFeltlengde / (bordbreddeMm - anbefalOmleggMm));
      if (antallDekningsmaal < 1) antallDekningsmaal = 1;

      // Justert dekningsmål
      var justertDekningsmaalMm = redusertFeltlengde / antallDekningsmaal;
      var justertOmleggMm = bordbreddeMm - justertDekningsmaalMm;

      // Status basert på overlap og tykkelse
      var status = beregnStatus(justertOmleggMm, tykkelseMm);

      // Antall underliggere og overliggere
      var antallUnderliggere = 0;
      var antallOverliggere = 0;

      if (startStoppType === 'under-under') {
        antallUnderliggere = antallDekningsmaal + 1;
        antallOverliggere = antallDekningsmaal;
      } else if (startStoppType === 'over-over') {
        antallUnderliggere = antallDekningsmaal;
        antallOverliggere = antallDekningsmaal + 1;
      }

      // Oppmerkingsliste: position av underliggere
      var oppmerkingsliste = [];
      if (startStoppType === 'under-under') {
        for (var i = 0; i <= antallDekningsmaal; i++) {
          var pos = i * justertDekningsmaalMm;
          oppmerkingsliste.push({ nr: i + 1, posisjonMm: pos });
        }
      } else if (startStoppType === 'over-over') {
        for (var i = 0; i < antallDekningsmaal; i++) {
          var pos = bordbreddeMm + (i * justertDekningsmaalMm);
          oppmerkingsliste.push({ nr: i + 1, posisjonMm: pos });
        }
      }

      return {
        feil: false,
        status: status,
        anbefalOmleggMm: anbefalOmleggMm,
        justertOmleggMm: justertOmleggMm,
        ideeltDekningsmaalMm: justertDekningsmaalMm,
        justertDekningsmaalMm: justertDekningsmaalMm,
        antallUnderliggere: antallUnderliggere,
        antallOverliggere: antallOverliggere,
        oppmerkingsliste: oppmerkingsliste
      };
    }

    // ── KLEDNINGSKALKULATOR ───────────────────────────────────────────────

    var _kledningInput = { feltLengde: 3000, bordBredde: 125, tykkelse: 19, startStopp: 'under-under' };

    function renderKledningTool() {
      var inp = 'width:100%;padding:10px 14px;border:1.5px solid #dce8ff;border-radius:12px;font-size:16px;box-sizing:border-box';
      var lbl = 'display:block;font-size:13px;font-weight:700;margin-bottom:6px';
      var select = 'width:100%;padding:10px 14px;border:1.5px solid #dce8ff;border-radius:12px;font-size:16px;box-sizing:border-box';
      return '<div style="width:100%;max-width:480px;margin:0 auto;padding:24px"><div style="display:flex;align-items:center;gap:12px;margin-bottom:20px"><button onclick="openMakkerTool(null)" style="background:none;border:none;color:#888;font-size:20px;cursor:pointer;padding:4px">←</button><div><div style="font-size:22px;font-weight:800">🪵 Kledningskalkulator</div></div></div><div style="background:#fff;border:1.5px solid var(--line);border-radius:16px;padding:16px;margin-bottom:16px"><div style="display:grid;gap:14px"><div><label style="' + lbl + '">Feltlengde (mm)</label><input id="kledFeltlengde" type="number" value="' + _kledningInput.feltLengde + '" oninput="calcKledning()" style="' + inp + '" /></div><div><label style="' + lbl + '">Bordbredde (mm)</label><input id="kledBordbredde" type="number" value="' + _kledningInput.bordBredde + '" oninput="calcKledning()" style="' + inp + '" /></div><div><label style="' + lbl + '">Tykkelse (mm)</label><input id="kledTykkelse" type="number" value="' + _kledningInput.tykkelse + '" oninput="calcKledning()" style="' + inp + '" /></div><div><label style="' + lbl + '">Start / Stopp</label><select id="kledStartStopp" onchange="calcKledning()" style="' + select + '"><option value="under-under" ' + (_kledningInput.startStopp === 'under-under' ? 'selected' : '') + '>Underligger → Underligger</option><option value="over-over" ' + (_kledningInput.startStopp === 'over-over' ? 'selected' : '') + '>Overligger → Overligger</option></select></div></div></div><div id="kledResultat"></div></div>';
    }
    console.log('renderKledningTool definert', typeof renderKledningTool);

    window.calcKledning = function() {
      _kledningInput.feltLengde = Number(document.getElementById('kledFeltlengde').value);
      _kledningInput.bordBredde = Number(document.getElementById('kledBordbredde').value);
      _kledningInput.tykkelse = Number(document.getElementById('kledTykkelse').value);
      _kledningInput.startStopp = document.getElementById('kledStartStopp').value;
      var res = beregnTommermannskledning({ feltLengdeMm: _kledningInput.feltLengde, bordbreddeMm: _kledningInput.bordBredde, tykkelseMm: _kledningInput.tykkelse, startStoppType: _kledningInput.startStopp });
      var el = document.getElementById('kledResultat');
      if (!el) return;
      if (res.feil) { el.innerHTML = '<div style="background:#fee;border:1.5px solid #c33;border-radius:14px;padding:16px;color:#c33;font-weight:700">' + res.feiltekst + '</div>'; return; }
      var h = '<div style="background:#f5f8ff;border:1.5px solid #dce8ff;border-radius:14px;padding:16px;margin-top:16px"><div style="display:flex;justify-content:space-between"><span style="font-size:13px;font-weight:700;color:#888">Status</span><span style="font-size:18px;font-weight:800;color:' + (res.status === 'grønn' ? '#167a42' : (res.status === 'gul' ? '#f0a202' : '#c0392b')) + '">● ' + res.status + '</span></div><div style="display:flex;justify-content:space-between;padding-top:10px;border-top:1px solid #dce8ff"><span style="font-size:13px;font-weight:700;color:#888">Anbefalt omlegg</span><span style="font-size:16px;font-weight:800">' + res.anbefalOmleggMm.toFixed(1) + ' mm</span></div><div style="display:flex;justify-content:space-between"><span style="font-size:13px;font-weight:700;color:#888">Justert omlegg</span><span style="font-size:16px;font-weight:800">' + res.justertOmleggMm.toFixed(1) + ' mm</span></div><div style="display:flex;justify-content:space-between"><span style="font-size:13px;font-weight:700;color:#888">Ideelt dekningsmål</span><span style="font-size:16px;font-weight:800">' + res.ideeltDekningsmaalMm.toFixed(1) + ' mm</span></div><div style="display:flex;justify-content:space-between"><span style="font-size:13px;font-weight:700;color:#888">Justert dekningsmål</span><span style="font-size:16px;font-weight:800">' + res.justertDekningsmaalMm.toFixed(1) + ' mm</span></div><div style="display:flex;justify-content:space-between;padding-top:10px;border-top:1px solid #dce8ff"><span style="font-size:13px;font-weight:700;color:#888">Underliggere</span><span style="font-size:16px;font-weight:800">' + res.antallUnderliggere + '</span></div><div style="display:flex;justify-content:space-between"><span style="font-size:13px;font-weight:700;color:#888">Overliggere</span><span style="font-size:16px;font-weight:800">' + res.antallOverliggere + '</span></div></div><div style="background:#fff;border:1.5px solid #dce8ff;border-radius:14px;padding:16px;margin-top:16px"><div style="font-size:13px;font-weight:700;margin-bottom:14px">Oppmerkingsliste</div><div style="font-size:12px;line-height:1.8">';
      if (res.oppmerkingsliste && res.oppmerkingsliste.length > 0) { for (var i = 0; i < res.oppmerkingsliste.length; i++) { var m = res.oppmerkingsliste[i]; h += 'U' + m.nr + ' @ ' + m.posisjonMm.toFixed(1) + ' mm<br>'; } } else { h += 'Ingen oppmerking'; }
      h += '</div></div>';
      el.innerHTML = h;
    };

    // ── MAKKER ───────────────────────────────────────────────────────────────

    var _makkerTool = null; // null = viser hjem-skjerm
    var _trappeType = null; // null = viser typevelger
    var _vangeMode = null;  // null = viser modus-velger for vange
    var valgtTrappetype = null; // 'vange-mellom' | 'vange-ned' | 'vange-gulv'
    var _vangeTrinn      = 5;     // antall trinn, justeres manuelt
    var _visVangeInfo    = false; // viser/skjuler info-panel i vange-kalkulator
    var _visAvansertVange       = false; // enkel/avansert-visning i vange-kalkulator
    var _visVangeArbeidsvisning = false; // viser/skjuler arbeidsvisning

    var _makkerTools = [
      { id: 'trapp',    icon: '🪜', name: 'Trappekalkulator',   desc: 'Beregn stigning, inntrinn og antall trinn' },
      { id: 'spile',    icon: '📏', name: 'Spilekalkulator',    desc: 'Beregn spileavstand og antall spiler' },
      { id: 'vinkel',   icon: '📐', name: 'Vinkelkalkulator',   desc: 'Beregn vinkler og lengder' },
      { id: 'kledning', icon: '🪵', name: 'Kledningskalkulator',desc: 'Beregn kledningsbehov og svinn' },
    ];

    function renderMakkerView(){
      var el = document.getElementById('makkContent');
      if(!el) return;
      el.innerHTML = _makkerTool ? renderMakkerTool(_makkerTool) : renderMakkerHome();
    }

    function renderMakkerHome(){
      return '<div style="width:100%;max-width:480px;margin:0 auto;padding:24px">'
        + '<div style="display:flex;align-items:center;gap:12px;margin-bottom:28px">'
        + '<button onclick="goToHome()" style="background:none;border:none;color:#888;font-size:20px;cursor:pointer;padding:4px">←</button>'
        + '<div><div style="font-size:22px;font-weight:800">Makker</div>'
        + '<div style="font-size:13px;color:#888">Verktøy for håndverkeren</div></div>'
        + '</div>'
        + '<div style="display:flex;flex-direction:column;gap:10px">'
        + _makkerTools.map(function(t){
            return '<button onclick="openMakkerTool(\'' + t.id + '\')"'
              + ' style="background:#fff;border:1.5px solid #dce8ff;border-radius:16px;padding:18px 20px;text-align:left;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.06)">'
              + '<div style="font-size:20px;margin-bottom:4px">' + t.icon + '</div>'
              + '<div style="font-size:16px;font-weight:800">' + t.name + '</div>'
              + '<div style="font-size:12px;color:#888;margin-top:2px">' + t.desc + '</div>'
              + '</button>';
          }).join('')
        + '</div>'
        + '</div>';
    }

    function renderMakkerTool(id){
      if(id==='trapp') return renderTrappModul();
      if(id==='kledning') return renderKledningTool();
      var t = _makkerTools.find(function(x){ return x.id===id; });
      if(!t) return renderMakkerHome();
      return '<div style="width:100%;max-width:480px;margin:0 auto;padding:24px">'
        + '<div style="display:flex;align-items:center;gap:12px;margin-bottom:28px">'
        + '<button onclick="openMakkerTool(null)" style="background:none;border:none;color:#888;font-size:20px;cursor:pointer;padding:4px">←</button>'
        + '<div><div style="font-size:22px;font-weight:800">' + t.icon + ' ' + t.name + '</div></div>'
        + '</div>'
        + '<div style="background:#fff;border:1.5px solid var(--line);border-radius:16px;padding:24px;text-align:center;color:#aaa">'
        + '<div style="font-size:32px;margin-bottom:10px">' + t.icon + '</div>'
        + '<div style="font-size:15px;font-weight:600">Kommer snart</div>'
        + '<div style="font-size:13px;margin-top:4px">' + t.desc + '</div>'
        + '</div>'
        + '</div>';
    }

    // ── TRAPP-MODUL — NY STRUKTUR ─────────────────────────────────────────────

    var _trappeKatalog = [
      { id: 'vange',   name: 'Vangetrapp',  img: 'img/trapp/vange.png'   },
      { id: 'tett',    name: 'Tett trapp',  img: 'img/trapp/kasse.png'   },
      { id: 'loft',    name: 'Loftstrapp',  img: 'img/trapp/utvendig.png'},
    ];

    // Hovedrender — viser kalkulator direkte
    function renderTrappModul() {
      if (!_trappeType) _trappeType = 'vange';
      if (!valgtTrappetype) valgtTrappetype = 'vange-gulv';
      return '<div style="width:100%;max-width:480px;margin:0 auto;padding:24px">'
        + '<div style="display:flex;align-items:center;gap:12px;margin-bottom:24px">'
        + '<button onclick="openMakkerTool(null)" style="background:none;border:none;color:#888;font-size:20px;cursor:pointer;padding:4px">←</button>'
        + '<div style="font-size:22px;font-weight:800">🪜 Trapp</div>'
        + '</div>'
        + renderTrappTypeVelger()
        + '<div id="trappKalkulator" style="margin-top:20px">'
        + renderValgtTrappetype()
        + '</div>'
        + '</div>';
    }

    // Rad med klikkbare typekort
    function renderTrappTypeVelger() {
      return '<div style="display:flex;gap:10px;overflow-x:auto;padding-bottom:4px">'
        + _trappeKatalog.map(function(t) {
            var aktiv = _trappeType === t.id;
            var ramme = aktiv ? 'border:2px solid #3b82f6' : 'border:1.5px solid #dce8ff';
            var tekst = aktiv ? 'color:#1d4ed8;font-weight:800' : 'color:#555;font-weight:600';
            return '<button onclick="velgTrappetype(\'' + t.id + '\')"'
              + ' style="flex:0 0 auto;width:110px;padding:10px 8px;border-radius:14px;background:#fff;' + ramme + ';cursor:pointer;text-align:center">'
              + '<img src="' + t.img + '" alt="' + t.name + '" style="width:100%;height:64px;object-fit:cover;border-radius:8px;display:block;margin-bottom:8px" />'
              + '<div style="font-size:12px;' + tekst + '">' + t.name + '</div>'
              + '</button>';
          }).join('')
        + '</div>';
    }

    // Router til riktig kalkulator basert på valgt type
    function renderValgtTrappetype() {
      if (_trappeType === 'vange') return renderVangeTrapp();
      return '<div style="background:#fff;border:1.5px solid var(--line);border-radius:16px;padding:24px;text-align:center;color:#aaa">'
        + '<div style="font-size:13px;font-weight:600">Kommer senere</div>'
        + '</div>';
    }

    // Arbeidsvisning — ryddig oppsummering av alle viktige mål
    function renderVangeArbeidsvisning(d) {
      function fmt(v, des, enhet) {
        if (v === null || v === undefined || !isFinite(v)) return '—';
        return v.toFixed(des) + (enhet || '');
      }
      function rad(label, verdi) {
        return '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f2f4f8">'
          + '<span style="font-size:13px;color:#555">' + label + '</span>'
          + '<span style="font-size:14px;font-weight:700;color:#1a1a1a">' + verdi + '</span>'
          + '</div>';
      }
      function seksjon(tittel, innhold) {
        return '<div style="margin-bottom:20px">'
          + '<div style="font-size:11px;font-weight:800;color:#aaa;letter-spacing:.06em;margin-bottom:2px">' + tittel + '</div>'
          + innhold
          + '</div>';
      }
      if (!d) {
        return '<div style="font-size:13px;color:#aaa">Legg inn målene for å se arbeidsvisning.</div>';
      }
      var grunnmal = seksjon('GRUNNMÅL',
        rad('Høyde gulv til gulv', fmt(d.totalHoydeMm, 0, ' mm'))
        + rad('Antall trinn',      d.antallOpptrinn !== null ? d.antallOpptrinn : '—')
        + rad('Høyde per trinn',   fmt(d.faktisk,    1, ' mm'))
        + rad('Dybde på trinn',    fmt(d.inntrinnMm, 0, ' mm'))
        + rad('Lengde',            fmt(d.innlop,     0, ' mm'))
        + rad('Vangelengde',       fmt(d.vangeLengde,0, ' mm'))
        + rad('Vinkel',            fmt(d.vinkel,     1, '°'))
      );
      var kapping = seksjon('KAPPING',
        rad('Vinkel oppe', fmt(d.vinkelOppe, 1, '°'))
        + rad('Vinkel nede', fmt(d.vinkelNede, 1, '°'))
      );
      var trinn = seksjon('TRINN',
        rad('Antall trinnplater', d.antallTrinnplater !== null ? String(d.antallTrinnplater) : '—')
        + rad('Bredde',   fmt(d.trinnplateBredde,   0, ' mm'))
        + rad('Dybde',    fmt(d.trinnplateDybde,    0, ' mm'))
        + rad('Tykkelse', fmt(d.trinnplateTykkelse, 0, ' mm'))
      );
      var oppmTekst;
      if (d.faktisk && d.inntrinnMm && d.antallInn) {
        oppmTekst = '<div style="font-size:13px;color:#333;line-height:1.8">'
          + '1. Start nederst p\u00e5 vangen.<br>'
          + '2. M\u00e5l ' + d.inntrinnMm.toFixed(0) + '\u00a0mm bort og ' + d.faktisk.toFixed(1) + '\u00a0mm opp.<br>'
          + '3. Gjenta for alle ' + d.antallInn + ' trinn.'
          + '</div>';
      } else {
        oppmTekst = '<div style="font-size:13px;color:#aaa">Mangler m\u00e5l.</div>';
      }
      return '<div style="font-size:16px;font-weight:800;margin-bottom:20px">Arbeidsvisning</div>'
        + grunnmal + kapping + trinn + seksjon('OPPMERKING', oppmTekst);
    }

    // ── LAGRING — localStorage-helpers ───────────────────────────────────────

    var LAGRE_NOKKEL = 'makker_trapper';

    function hentLagredeTrapper() {
      try {
        return JSON.parse(localStorage.getItem(LAGRE_NOKKEL) || '[]');
      } catch(e) { return []; }
    }

    function lagreTrapp(trappObj) {
      var liste = hentLagredeTrapper();
      liste.unshift(trappObj); // nyeste først
      try { localStorage.setItem(LAGRE_NOKKEL, JSON.stringify(liste)); } catch(e) {}
    }

    function slettLagretTrapp(id) {
      var liste = hentLagredeTrapper().filter(function(t) { return t.id !== id; });
      try { localStorage.setItem(LAGRE_NOKKEL, JSON.stringify(liste)); } catch(e) {}
    }

    function hentLagretTrapp(id) {
      return hentLagredeTrapper().find(function(t) { return t.id === id; }) || null;
    }

    function formaterDato(isoStr) {
      try {
        var d = new Date(isoStr);
        var dd = String(d.getDate()).padStart(2,'0');
        var mm = String(d.getMonth()+1).padStart(2,'0');
        var yy = d.getFullYear();
        return dd + '.' + mm + '.' + yy;
      } catch(e) { return isoStr; }
    }

    // Liste over lagrede trapper
    function renderLagredeTrapper() {
      var liste = hentLagredeTrapper();
      if (liste.length === 0) {
        return '<div style="font-size:13px;color:#aaa;padding:4px 0">Ingen lagrede trapper.</div>';
      }
      return liste.map(function(t) {
        return '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #f2f4f8;gap:8px">'
          + '<div style="flex:1;min-width:0">'
          + '<div style="font-size:14px;font-weight:700;color:#1a1a1a;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + (t.navn || 'Uten navn') + '</div>'
          + '<div style="font-size:12px;color:#aaa;margin-top:2px">' + formaterDato(t.opprettetDato) + '</div>'
          + '</div>'
          + '<div style="display:flex;gap:6px;flex-shrink:0">'
          + '<button onclick="apneVangeTrapp(\'' + t.id + '\')" style="padding:6px 12px;border-radius:8px;border:1.5px solid #3b82f6;background:#eff6ff;color:#1d4ed8;font-size:12px;font-weight:700;cursor:pointer">Åpne</button>'
          + '<button onclick="slettVangeTrapp(\'' + t.id + '\')" style="padding:6px 10px;border-radius:8px;border:1.5px solid #fee2e2;background:#fff5f5;color:#dc2626;font-size:12px;font-weight:700;cursor:pointer">Slett</button>'
          + '</div>'
          + '</div>';
      }).join('');
    }

    // Lagre gjeldende vange-trapp
    window.lagreVangeTrapp = function() {
      var navnEl = document.getElementById('vt_lagreNavn');
      var navn   = (navnEl && navnEl.value.trim()) ? navnEl.value.trim() : 'Trapp uten navn';
      var v      = getVangeInputVerdier();
      lagreTrapp({
        id:            String(Date.now()),
        navn:          navn,
        trappetype:    'vange',
        opprettetDato: new Date().toISOString(),
        data: {
          totalHoydeMm:    v.totalHoydeMm,
          inntrinnMm:      v.inntrinnMm,
          trappebreddeMm:  v.trappebreddeMm,
          trinnTykkelseMm: v.trinnTykkelseMm,
          antallOpptrinn:  v.antallOpptrinn,
        },
      });
      if (navnEl) navnEl.value = '';
      var el = document.getElementById('vtr_lagredeContainer');
      if (el) el.innerHTML = renderLagredeTrapper();
    };

    // Åpne lagret trapp — fyll inn verdier og kjør beregning
    window.apneVangeTrapp = function(id) {
      var t = hentLagretTrapp(id);
      if (!t || !t.data) return;
      var d = t.data;
      function fyll(elId, verdi) {
        var el = document.getElementById(elId);
        if (el && verdi !== null && verdi !== undefined) el.value = verdi;
      }
      fyll('vt_totalHoyde', d.totalHoydeMm);
      fyll('vt_inntrinn',   d.inntrinnMm);
      fyll('vt_bredde',     d.trappebreddeMm);
      fyll('vt_trinnTypp',  d.trinnTykkelseMm);
      if (d.antallOpptrinn && d.antallOpptrinn >= 1) {
        _vangeTrinn = d.antallOpptrinn;
        var trinnEl = document.getElementById('vt_antallTrinn');
        if (trinnEl) trinnEl.textContent = _vangeTrinn;
      }
      oppdaterVangeGrunnberegning();
      // Scroll inputfelter i sikte
      var inp = document.getElementById('vt_totalHoyde');
      if (inp) inp.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };

    // Slett lagret trapp og oppdater listen
    window.slettVangeTrapp = function(id) {
      slettLagretTrapp(id);
      var el = document.getElementById('vtr_lagredeContainer');
      if (el) el.innerHTML = renderLagredeTrapper();
    };

    // Toggle arbeidsvisning uten å re-rendre inputfelter
    window.toggleVangeArbeidsvisning = function() {
      _visVangeArbeidsvisning = !_visVangeArbeidsvisning;
      var el  = document.getElementById('vtr_arbeidsvisningContainer');
      var btn = document.getElementById('vangeArbeidBtn');
      if (el)  el.style.display = _visVangeArbeidsvisning ? '' : 'none';
      if (btn) {
        btn.textContent   = _visVangeArbeidsvisning ? 'Skjul' : 'Arbeidsvisning';
        btn.style.background = _visVangeArbeidsvisning ? '#1d4ed8' : '#3b82f6';
      }
      if (_visVangeArbeidsvisning) oppdaterVangeGrunnberegning();
    };

    // Vange-kalkulator — samlet struktur
    function renderVangeTrapp() {
      var btnTekst = _visVangeInfo ? 'Lukk' : 'ℹ Info';
      var tBase = 'padding:6px 18px;border-radius:20px;font-size:13px;font-weight:700;cursor:pointer;border:1.5px solid ';
      var tPa  = tBase + '#3b82f6;background:#eff6ff;color:#1d4ed8';
      var tAv  = tBase + '#dce8ff;background:#fff;color:#888';
      var enkStil = !_visAvansertVange ? tPa : tAv;
      var avStil  =  _visAvansertVange ? tPa : tAv;
      var arbBtnTekst = _visVangeArbeidsvisning ? 'Skjul' : 'Arbeidsvisning';
      var arbBtnStil  = 'background:' + (_visVangeArbeidsvisning ? '#1d4ed8' : '#3b82f6') + ';color:#fff;border:none;border-radius:10px;padding:8px 16px;font-size:13px;font-weight:700;cursor:pointer;width:100%';
      var arbContDisplay = _visVangeArbeidsvisning ? '' : 'display:none;';
      var sCard = 'background:#fff;border:1.5px solid #dce8ff;border-radius:12px;padding:12px;text-align:center;cursor:pointer;flex:1';
      var sCardActive = 'background:#fff;border:2px solid #3b82f6;border-radius:12px;padding:12px;text-align:center;cursor:pointer;flex:1;background:#eff6ff';
      return '<div style="display:flex;flex-direction:column;gap:16px">'
        + '<div style="display:flex;gap:8px;margin-bottom:4px">'
        + '<button onclick="velgVangeVariant(\'vange-mellom\')" style="' + (valgtTrappetype === 'vange-mellom' ? sCardActive : sCard) + '"><div style="font-size:24px;margin-bottom:4px">📐</div><div style="font-size:11px;font-weight:700">Åpen</div></button>'
        + '<button onclick="velgVangeVariant(\'vange-ned\')" style="' + (valgtTrappetype === 'vange-ned' ? sCardActive : sCard) + '"><div style="font-size:24px;margin-bottom:4px">⬇️</div><div style="font-size:11px;font-weight:700">Ned</div></button>'
        + '<button onclick="velgVangeVariant(\'vange-gulv\')" style="' + (valgtTrappetype === 'vange-gulv' ? sCardActive : sCard) + '"><div style="font-size:24px;margin-bottom:4px">⬆️</div><div style="font-size:11px;font-weight:700">Gulv</div></button>'
        + '</div>'
        + '<div style="display:flex;justify-content:space-between;align-items:center">'
        + '<div style="font-size:18px;font-weight:800">Vange trapp</div>'
        + '<button id="vangeInfoBtn" onclick="toggleVangeInfo()" style="background:none;border:1.5px solid #dce8ff;border-radius:8px;padding:4px 12px;font-size:13px;cursor:pointer;color:#555">' + btnTekst + '</button>'
        + '</div>'
        + '<div style="display:flex;gap:8px">'
        + '<button id="vange_enkelBtn" onclick="toggleVangeAvansert(false)" style="' + enkStil + '">Enkel</button>'
        + '<button id="vange_avansertBtn" onclick="toggleVangeAvansert(true)" style="' + avStil + '">Avansert</button>'
        + '</div>'
        + '<div id="vangeInfoPanel">' + (_visVangeInfo ? renderVangeInfoPanel() : '') + '</div>'
        + renderVangeInputseksjon()
        + renderVangeResultatseksjon()
        + '<button id="vangeArbeidBtn" onclick="toggleVangeArbeidsvisning()" style="' + arbBtnStil + '">' + arbBtnTekst + '</button>'
        + '<div id="vtr_arbeidsvisningContainer" style="' + arbContDisplay + 'background:#fff;border:1.5px solid var(--line);border-radius:16px;padding:20px">'
        + renderVangeArbeidsvisning(null)
        + '</div>'
        // LAGRE-seksjon
        + '<div style="background:#fff;border:1.5px solid var(--line);border-radius:16px;padding:16px">'
        + '<div style="font-size:11px;font-weight:800;color:#aaa;letter-spacing:.06em;margin-bottom:12px">LAGRE TRAPP</div>'
        + '<div style="display:flex;gap:8px">'
        + '<input id="vt_lagreNavn" type="text" placeholder="Navn på trapp" style="flex:1;padding:10px 14px;border:1.5px solid #dce8ff;border-radius:12px;font-size:14px;box-sizing:border-box" />'
        + '<button onclick="lagreVangeTrapp()" style="padding:10px 16px;border-radius:12px;border:none;background:#22c55e;color:#fff;font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap">Lagre</button>'
        + '</div>'
        + '</div>'
        // LAGREDE TRAPPER
        + '<div style="background:#fff;border:1.5px solid var(--line);border-radius:16px;padding:16px">'
        + '<div style="font-size:11px;font-weight:800;color:#aaa;letter-spacing:.06em;margin-bottom:4px">LAGREDE TRAPPER</div>'
        + '<div id="vtr_lagredeContainer">' + renderLagredeTrapper() + '</div>'
        + '</div>'
        + '</div>';
    }

    // Info-panel med målebilde og forklaringsliste
    function renderVangeInfoPanel() {
      return '<div style="background:#f0f7ff;border:1.5px solid #dce8ff;border-radius:14px;padding:16px">'
        + '<img src="img/trapp/vange-mal.png" alt="Vange trapp mål" style="width:100%;border-radius:10px;display:block;margin-bottom:14px" />'
        + '<ul style="margin:0;padding-left:18px;display:flex;flex-direction:column;gap:6px">'
        + '<li style="font-size:13px;color:#444">Total høyde: fra ferdig gulv nede til ferdig gulv oppe</li>'
        + '<li style="font-size:13px;color:#444">Opptrinn: loddrett høyde per trinn</li>'
        + '<li style="font-size:13px;color:#444">Inntrinn: horisontal dybde nese til nese</li>'
        + '<li style="font-size:13px;color:#444">Alle mål legges inn i mm</li>'
        + '</ul>'
        + '</div>';
    }

    // Inputseksjon — grunnmål og antall trinn
    function renderVangeInputseksjon() {
      var inp = 'width:100%;padding:10px 14px;border:1.5px solid #dce8ff;border-radius:12px;font-size:16px;box-sizing:border-box';
      var lbl = 'display:block;font-size:13px;font-weight:700;margin-bottom:6px';
      var btn = 'width:34px;height:34px;border-radius:8px;border:1.5px solid #dce8ff;background:#fff;font-size:20px;cursor:pointer';
      return '<div style="background:#fff;border:1.5px solid var(--line);border-radius:16px;padding:16px">'
        + '<div style="font-size:11px;font-weight:800;color:#aaa;letter-spacing:.06em;margin-bottom:14px">GRUNNMÅL</div>'
        + '<div style="display:flex;flex-direction:column;gap:12px">'
        + '<div><label style="' + lbl + '">Total høyde (mm)</label>'
        + '<input id="vt_totalHoyde" type="number" inputmode="decimal" placeholder="f.eks. 2800" oninput="oppdaterVangeGrunnberegning()" style="' + inp + '" /></div>'
        + '<div><label style="' + lbl + '">Inntrinn (mm)</label>'
        + '<input id="vt_inntrinn" type="number" inputmode="decimal" placeholder="f.eks. 250" oninput="oppdaterVangeGrunnberegning()" style="' + inp + '" /></div>'
        + '<div><label style="' + lbl + '">Trappebredde (mm)</label>'
        + '<input id="vt_bredde" type="number" inputmode="decimal" placeholder="f.eks. 900" oninput="oppdaterVangeGrunnberegning()" style="' + inp + '" /></div>'
        + '<div><label style="' + lbl + '">Trinntykkelse (mm)</label>'
        + '<input id="vt_trinnTypp" type="number" inputmode="decimal" placeholder="f.eks. 36" oninput="oppdaterVangeGrunnberegning()" style="' + inp + '" /></div>'
        + '<div style="display:flex;justify-content:space-between;align-items:center;padding-top:4px">'
        + '<span style="' + lbl + ';margin-bottom:0">Antall trinn</span>'
        + '<div style="display:flex;align-items:center;gap:12px">'
        + '<button onclick="vangeTrinnJuster(-1)" style="' + btn + '">−</button>'
        + '<span id="vt_antallTrinn" style="font-size:20px;font-weight:800;min-width:28px;text-align:center">' + _vangeTrinn + '</span>'
        + '<button onclick="vangeTrinnJuster(1)" style="' + btn + '">+</button>'
        + '</div></div>'
        + '</div>'
        + '</div>';
    }

    // Resultatseksjon — kontroll alltid synlig, avansert seksjoner bak toggle
    function renderVangeResultatseksjon() {
      function rad(label, id) {
        return '<div style="display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid #f2f4f8">'
          + '<span style="font-size:13px;color:#555">' + label + '</span>'
          + '<span id="' + id + '" style="font-size:14px;font-weight:700;color:#ccc">—</span>'
          + '</div>';
      }
      var avHide  = _visAvansertVange ? '' : 'display:none;';
      var avBlock = _visAvansertVange ? 'display:flex;flex-direction:column;gap:12px' : 'display:none';
      return '<div style="display:flex;flex-direction:column;gap:12px">'
        // KONTROLL — alltid synlig
        + '<div style="background:#fff;border:1.5px solid var(--line);border-radius:16px;padding:16px">'
        + '<div style="font-size:11px;font-weight:800;color:#aaa;letter-spacing:.06em;margin-bottom:8px">KONTROLL</div>'
        + rad('Høyde per trinn',       'vtr_faktiskOpptrinn')
        + rad('Trappeformel (2×O+I)',  'vtr_trappeformel')
        + rad('Vinkel',                'vtr_trappevinkel')
        + rad('Opptrinn status',       'vtr_opptrinnsStatus')
        + rad('Inntrinn status',       'vtr_inntrinnStatus')
        + '<div id="vange_radAntallInntrinn" style="' + avHide + '">'
        + rad('Antall inntrinn',       'vtr_antallInntrinn')
        + '</div>'
        + '</div>'
        // MÅL — alltid synlig
        + '<div style="background:#fff;border:1.5px solid var(--line);border-radius:16px;padding:16px">'
        + '<div style="font-size:11px;font-weight:800;color:#aaa;letter-spacing:.06em;margin-bottom:8px">MÅL</div>'
        + rad('Lengde',      'vtr_totalInnlop')
        + rad('Vangelengde', 'vtr_vangelengde')
        + '</div>'
        // MERKEGUIDE — bare synlig i enkel modus
        + '<div id="vtr_merkeguideContainer" style="background:#fff;border:1.5px solid var(--line);border-radius:16px;padding:16px' + (_visAvansertVange ? ';display:none' : '') + '">'
        + '<div style="font-size:11px;font-weight:800;color:#aaa;letter-spacing:.06em;margin-bottom:8px">SLIK MERKER DU OPP</div>'
        + renderVangeMerkeguide(null, null, null, null)
        + '</div>'
        // AVANSERT — skjult i enkel-modus
        + '<div id="vange_avansertSeksjoner" style="' + avBlock + '">'
        // VANGE — kappvinklar og mål
        + '<div style="background:#fff;border:1.5px solid var(--line);border-radius:16px;padding:16px">'
        + '<div style="font-size:11px;font-weight:800;color:#aaa;letter-spacing:.06em;margin-bottom:8px">VANGE</div>'
        + rad('Vinkel oppe',   'vtr_vinkelOppe')
        + rad('Vinkel nede',   'vtr_vinkelNede')
        + '<div id="vtr_kappeContainer"></div>'
        + '</div>'
        // TRINN — produksjonsmål
        + '<div style="background:#fff;border:1.5px solid var(--line);border-radius:16px;padding:16px">'
        + '<div style="font-size:11px;font-weight:800;color:#aaa;letter-spacing:.06em;margin-bottom:8px">TRINN</div>'
        + rad('Antall',   'vtr_antallTrinnplater')
        + rad('Dybde',    'vtr_trinnplateDybde')
        + rad('Bredde',   'vtr_trinnplateBredde')
        + rad('Tykkelse', 'vtr_trinnplateTykkelse')
        + '</div>'
        // OPPMERKING — hakk-liste
        + '<div style="background:#fff;border:1.5px solid var(--line);border-radius:16px;padding:16px">'
        + '<div style="font-size:11px;font-weight:800;color:#aaa;letter-spacing:.06em;margin-bottom:10px">OPPMERKING</div>'
        + '<div id="vtr_hakkContainer"><div style="font-size:13px;color:#aaa">Ingen data</div></div>'
        + '</div>'
        + '</div>'
        + '</div>';
    }

    // Enkel oppmerking steg-for-steg — bare synlig i enkel modus
    function renderVangeMerkeguide(faktisk, inntrinnMm, vinkel, antallInn) {
      if (!faktisk || !inntrinnMm || !vinkel || !antallInn || antallInn < 1) {
        return '<div style="font-size:13px;color:#aaa">Legg inn målene for å få oppmerkingstips.</div>';
      }
      var kappvinkel = (90 - vinkel).toFixed(1);
      var steg = [
        { tekst: 'Start nederst på vangen.' },
        { tekst: 'Mål ' + inntrinnMm.toFixed(0) + '\u00a0mm bort og ' + faktisk.toFixed(1) + '\u00a0mm opp — marker hakket.' },
        { tekst: 'Gjenta for alle ' + antallInn + ' trinn.' },
        { tekst: 'Kapp begge ender i ' + kappvinkel + '°.' },
      ];
      var stegHtml = steg.map(function(s, i) {
        return '<div style="display:flex;gap:10px;padding:8px 0;border-bottom:1px solid #f2f4f8;align-items:flex-start">'
          + '<span style="flex-shrink:0;width:20px;height:20px;border-radius:50%;background:#3b82f6;color:#fff;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;margin-top:1px">' + (i + 1) + '</span>'
          + '<span style="font-size:13px;color:#333;line-height:1.4">' + s.tekst + '</span>'
          + '</div>';
      }).join('');
      return stegHtml;
    }

    // Hakk-liste — Punkt / Bort / Opp / Langs vange
    function renderVangeHakkListe(hakkListe) {
      if (!hakkListe || hakkListe.length === 0) {
        return '<div style="font-size:13px;color:#aaa;padding:4px 0">Ingen data</div>';
      }
      var th  = 'style="padding:4px 8px;font-size:12px;font-weight:700;color:#aaa;text-align:right"';
      var thL = 'style="padding:4px 8px;font-size:12px;font-weight:700;color:#aaa;text-align:left"';
      var siste = hakkListe[hakkListe.length - 1];
      return '<table style="width:100%;border-collapse:collapse">'
        + '<thead><tr>'
        + '<th ' + thL + '>Trinn</th>'
        + '<th ' + th + '>Bort (mm)</th>'
        + '<th ' + th + '>Opp (mm)</th>'
        + '<th ' + th + '>Langs vange</th>'
        + '</tr></thead>'
        + '<tbody>'
        + '<tr style="background:#f8fff8">'
        + '<td style="padding:7px 8px;font-size:13px;font-weight:700;color:#167a42;border-top:1px solid #f2f4f8">Start</td>'
        + '<td style="padding:7px 8px;font-size:13px;text-align:right;border-top:1px solid #f2f4f8">0</td>'
        + '<td style="padding:7px 8px;font-size:13px;text-align:right;border-top:1px solid #f2f4f8">0</td>'
        + '<td style="padding:7px 8px;font-size:13px;text-align:right;border-top:1px solid #f2f4f8">0</td>'
        + '</tr>'
        + hakkListe.map(function(h) {
            var erTopp = h === siste;
            var bg  = erTopp ? 'background:#f0f7ff;' : '';
            var td  = 'style="' + bg + 'padding:7px 8px;font-size:13px;text-align:right;border-top:1px solid #f2f4f8"';
            var tdL = 'style="' + bg + 'padding:7px 8px;font-size:13px;font-weight:700;border-top:1px solid #f2f4f8;color:' + (erTopp ? '#1d4ed8' : '#1a1a1a') + '"';
            return '<tr>'
              + '<td ' + tdL + '>' + (erTopp ? 'Topp' : h.nr) + '</td>'
              + '<td ' + td + '>' + h.xMm.toFixed(0) + '</td>'
              + '<td ' + td + '>' + h.yMm.toFixed(0) + '</td>'
              + '<td ' + td + '>' + h.avstandLangsVangeMm.toFixed(1) + '</td>'
              + '</tr>';
          }).join('')
        + '</tbody></table>';
    }

    // Kappemål til VANGE-seksjonen i avansert modus
    function renderVangeKappeseksjon(hakkListe, vangeLengdeMm) {
      if (!hakkListe || hakkListe.length === 0 || !vangeLengdeMm) return '';
      var siste = hakkListe[hakkListe.length - 1];
      function rad(label, verdi) {
        return '<div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #f2f4f8;font-size:13px">'
          + '<span style="color:#555">' + label + '</span>'
          + '<span style="font-weight:700">' + verdi + '</span>'
          + '</div>';
      }
      return rad('Kapp ved', siste.avstandLangsVangeMm.toFixed(1) + ' mm')
           + rad('Total lengde', vangeLengdeMm.toFixed(0) + ' mm');
    }

    // Binder oninput og kjører første beregning etter render
    function bindVangeTrappEvents() {
      oppdaterVangeGrunnberegning();
    }

    // Toggle info-panel uten å re-rendre inputfelter
    window.toggleVangeInfo = function() {
      _visVangeInfo = !_visVangeInfo;
      var panel = document.getElementById('vangeInfoPanel');
      if (panel) panel.innerHTML = _visVangeInfo ? renderVangeInfoPanel() : '';
      var btn = document.getElementById('vangeInfoBtn');
      if (btn) btn.textContent = _visVangeInfo ? 'Lukk' : 'ℹ Info';
    };

    // Bytter mellom enkel og avansert visning uten å re-rendre inputfelter
    window.toggleVangeAvansert = function(avansert) {
      _visAvansertVange = !!avansert;
      var tBase = 'padding:6px 18px;border-radius:20px;font-size:13px;font-weight:700;cursor:pointer;border:1.5px solid ';
      var tPa   = tBase + '#3b82f6;background:#eff6ff;color:#1d4ed8';
      var tAv   = tBase + '#dce8ff;background:#fff;color:#888';
      var enkBtn = document.getElementById('vange_enkelBtn');
      var avBtn  = document.getElementById('vange_avansertBtn');
      if (enkBtn) enkBtn.style.cssText = !_visAvansertVange ? tPa : tAv;
      if (avBtn)  avBtn.style.cssText  =  _visAvansertVange ? tPa : tAv;
      var avSek = document.getElementById('vange_avansertSeksjoner');
      if (avSek) avSek.style.display = _visAvansertVange ? 'flex' : 'none';
      if (avSek && _visAvansertVange) avSek.style.flexDirection = 'column';
      if (avSek && _visAvansertVange) avSek.style.gap = '12px';
      var radAnt = document.getElementById('vange_radAntallInntrinn');
      if (radAnt) radAnt.style.display = _visAvansertVange ? '' : 'none';
      var merkEl = document.getElementById('vtr_merkeguideContainer');
      if (merkEl) merkEl.style.display = _visAvansertVange ? 'none' : '';
    };

    // +/- for antall trinn — oppdaterer display og kjører beregning
    window.vangeTrinnJuster = function(delta) {
      _vangeTrinn = Math.max(1, _vangeTrinn + delta);
      var el = document.getElementById('vt_antallTrinn');
      if (el) el.textContent = _vangeTrinn;
      oppdaterVangeGrunnberegning();
    };

    // Leser inputverdier trygt fra DOM
    function getVangeInputVerdier() {
      function les(id) {
        var el = document.getElementById(id);
        var v = el ? Number(el.value) : 0;
        return (isFinite(v) && v > 0) ? v : null;
      }
      return {
        totalHoydeMm:    les('vt_totalHoyde'),
        inntrinnMm:      les('vt_inntrinn'),
        trappebreddeMm:  les('vt_bredde'),
        trinnTykkelseMm: les('vt_trinnTypp'),
        antallOpptrinn:  (_vangeTrinn >= 1) ? _vangeTrinn : null,
      };
    }

    // Beregner og oppdaterer de tre første resultatfeltene
    window.oppdaterVangeGrunnberegning = function() {
      var v = getVangeInputVerdier();

      var faktisk   = beregnFaktiskOpptrinn(v.totalHoydeMm, v.antallOpptrinn);
      var antallInn = beregnAntallInntrinn(v.antallOpptrinn);
      var innlop    = beregnTotalInnlop(v.inntrinnMm, antallInn);

      function sett(id, verdi, desimaler, enhet) {
        var el = document.getElementById(id);
        if (!el) return;
        if (verdi === null || !isFinite(verdi)) {
          el.textContent = '—';
          el.style.color = '#ccc';
        } else {
          el.textContent = verdi.toFixed(desimaler) + (enhet || '');
          el.style.color = '#1a1a1a';
        }
      }

      sett('vtr_faktiskOpptrinn', faktisk,   1, ' mm');
      sett('vtr_antallInntrinn',  antallInn, 0, '');
      sett('vtr_totalInnlop',     innlop,    0, ' mm');

      // Trappeformel og statuser — class-basert fargekode
      var formel      = beregnTrappeformel(faktisk, v.inntrinnMm);
      var formelOk    = erTrappeformelInnenfor(formel);
      var opptrinnsOk = erOpptrinnInnenfor(faktisk);
      var inntrinnOk  = erInntrinnInnenfor(v.inntrinnMm);

      function settStatus(id, tekst, ok) {
        var el = document.getElementById(id);
        if (!el) return;
        el.textContent = tekst !== null ? tekst : '—';
        el.className   = ok === true ? 'status-ok' : ok === false ? 'status-feil' : '';
      }

      settStatus('vtr_trappeformel',
        formel !== null ? formel.toFixed(0) + ' mm' : null,
        formelOk);
      settStatus('vtr_opptrinnsStatus',
        opptrinnsOk === null ? null : (opptrinnsOk ? 'Innenfor' : 'Utenfor'),
        opptrinnsOk);
      settStatus('vtr_inntrinnStatus',
        inntrinnOk === null ? null : (inntrinnOk ? 'Innenfor' : 'For lite'),
        inntrinnOk);

      // Trappevinkel og teoretisk vangelengde
      var vinkel      = beregnTrappeVinkelGrader(v.totalHoydeMm, innlop);
      var vangeLengde = beregnVangeLengde(v.totalHoydeMm, innlop);
      sett('vtr_trappevinkel', vinkel,      1, '°');
      sett('vtr_vangelengde',  vangeLengde, 0, ' mm');

      // Kappvinkler — bruker allerede beregnet trappevinkel
      sett('vtr_vinkelOppe', beregnToppVinkelGrader(vinkel), 1, '°');
      sett('vtr_vinkelNede', beregnBunnVinkelGrader(vinkel), 1, '°');

      // Trinnplater
      sett('vtr_antallTrinnplater',  beregnAntallTrinnplater(antallInn),        0, '');
      sett('vtr_trinnplateDybde',    beregnTrinnplateDybde(v.inntrinnMm),       0, ' mm');
      sett('vtr_trinnplateBredde',   beregnTrinnplateBredde(v.trappebreddeMm),  0, ' mm');
      sett('vtr_trinnplateTykkelse', beregnTrinnplateTykkelse(v.trinnTykkelseMm), 0, ' mm');

      // Hakk-liste for vange
      var hakk   = beregnVangeHakk(antallInn, faktisk, v.inntrinnMm);
      var hakkEl = document.getElementById('vtr_hakkContainer');
      if (hakkEl) hakkEl.innerHTML = renderVangeHakkListe(hakk);
      var kappeEl = document.getElementById('vtr_kappeContainer');
      if (kappeEl) kappeEl.innerHTML = renderVangeKappeseksjon(hakk, vangeLengde);

      // Arbeidsvisning — oppdater hvis synlig
      if (_visVangeArbeidsvisning) {
        var arbEl = document.getElementById('vtr_arbeidsvisningContainer');
        if (arbEl) arbEl.innerHTML = renderVangeArbeidsvisning({
          totalHoydeMm:      v.totalHoydeMm,
          antallOpptrinn:    v.antallOpptrinn,
          faktisk:           faktisk,
          inntrinnMm:        v.inntrinnMm,
          innlop:            innlop,
          vangeLengde:       vangeLengde,
          vinkel:            vinkel,
          vinkelOppe:        beregnToppVinkelGrader(vinkel),
          vinkelNede:        beregnBunnVinkelGrader(vinkel),
          antallTrinnplater: beregnAntallTrinnplater(antallInn),
          trinnplateDybde:   beregnTrinnplateDybde(v.inntrinnMm),
          trinnplateBredde:  beregnTrinnplateBredde(v.trappebreddeMm),
          trinnplateTykkelse:beregnTrinnplateTykkelse(v.trinnTykkelseMm),
          antallInn:         antallInn,
        });
      }

      // Merkeguide — oppdater med beregnede verdier
      var merkEl = document.getElementById('vtr_merkeguideContainer');
      if (merkEl) {
        var guideHtml = renderVangeMerkeguide(faktisk, v.inntrinnMm, vinkel, antallInn);
        merkEl.innerHTML = '<div style="font-size:11px;font-weight:800;color:#aaa;letter-spacing:.06em;margin-bottom:8px">SLIK MERKER DU OPP</div>' + guideHtml;
      }
    };

    // Setter valgt type og re-rendrer hele trapp-modulen
    window.velgTrappetype = function(id) {
      _trappeType = id;
      renderMakkerView();
    };

    // Velg vange-variant og oppdater beregning
    window.velgVangeVariant = function(id) {
      valgtTrappetype = id;
      calcVange();
    };

    // ─────────────────────────────────────────────────────────────────────────

    var _trappeTyper = [
      { id: 'vange',    name: 'Vangetrapp',    desc: 'Trinn festet mellom to vanger', img: 'img/trapp/vange.png' },
      { id: 'kasse',    name: 'Kassetrapp',    desc: 'Lukket trapp med sideplater',   img: 'img/trapp/kasse.png' },
      { id: 'utvendig', name: 'Utvendig trapp',desc: 'Trapp til terrasse eller inngang', img: 'img/trapp/utvendig.png' },
    ];

    function renderTrappeTypeSelect(){
      return '<div style="width:100%;max-width:480px;margin:0 auto;padding:24px">'
        + '<div style="display:flex;align-items:center;gap:12px;margin-bottom:28px">'
        + '<button onclick="openMakkerTool(null)" style="background:none;border:none;color:#888;font-size:20px;cursor:pointer;padding:4px">←</button>'
        + '<div><div style="font-size:22px;font-weight:800">🪜 Trappekalkulator</div>'
        + '<div style="font-size:13px;color:#888">Velg trappetype</div></div>'
        + '</div>'
        + '<div style="display:flex;flex-direction:column;gap:12px">'
        + _trappeTyper.map(function(t){
            return '<button onclick="selectTrappeType(\'' + t.id + '\')"'
              + ' style="background:#fff;border:1.5px solid #dce8ff;border-radius:16px;overflow:hidden;text-align:left;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.06);display:flex;align-items:center;gap:0;padding:0">'
              + '<img src="' + t.img + '" alt="' + t.name + '"'
              + ' style="width:100px;height:80px;object-fit:cover;flex-shrink:0;border-radius:14px 0 0 14px" />'
              + '<div style="padding:14px 16px">'
              + '<div style="font-size:16px;font-weight:800">' + t.name + '</div>'
              + '<div style="font-size:12px;color:#888;margin-top:3px">' + t.desc + '</div>'
              + '</div>'
              + '</button>';
          }).join('')
        + '</div>'
        + '</div>';
    }

    function renderTrappeTypePlaceholder(typeId){
      var t = _trappeTyper.find(function(x){ return x.id===typeId; });
      return '<div style="width:100%;max-width:480px;margin:0 auto;padding:24px">'
        + '<div style="display:flex;align-items:center;gap:12px;margin-bottom:28px">'
        + '<button onclick="selectTrappeType(null)" style="background:none;border:none;color:#888;font-size:20px;cursor:pointer;padding:4px">←</button>'
        + '<div><div style="font-size:22px;font-weight:800">🪜 ' + (t?t.name:'Trappekalkulator') + '</div></div>'
        + '</div>'
        + '<div style="background:#fff;border:1.5px solid var(--line);border-radius:16px;padding:24px;text-align:center;color:#aaa">'
        + '<div style="font-size:32px;margin-bottom:10px">🪜</div>'
        + '<div style="font-size:15px;font-weight:600">Kommer snart</div>'
        + '<div style="font-size:13px;margin-top:4px">' + (t?t.desc:'') + '</div>'
        + '</div>'
        + '</div>';
    }

    function renderVangeModeSelect(){
      return '<div style="width:100%;max-width:480px;margin:0 auto;padding:24px">'
        + '<div style="display:flex;align-items:center;gap:12px;margin-bottom:28px">'
        + '<button onclick="selectTrappeType(null)" style="background:none;border:none;color:#888;font-size:20px;cursor:pointer;padding:4px">←</button>'
        + '<div><div style="font-size:22px;font-weight:800">🪜 Vangetrapp</div>'
        + '<div style="font-size:13px;color:#888">Velg modus</div></div>'
        + '</div>'
        + '<div style="display:flex;flex-direction:column;gap:12px">'
        + '<button onclick="selectVangeMode(\'fast\')"'
        + ' style="background:#fff;border:1.5px solid #dce8ff;border-radius:16px;overflow:hidden;text-align:left;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.06);padding:0;width:100%">'
        + '<img src="img/trapp-fast.png" alt="Med faste mål" style="width:100%;height:120px;object-fit:cover;display:block" />'
        + '<div style="padding:14px 18px">'
        + '<div style="font-size:16px;font-weight:800">📐 Med faste mål</div>'
        + '<div style="font-size:12px;color:#888;margin-top:4px">Du vet opptrinn og inntrinn fra før</div>'
        + '</div>'
        + '</button>'
        + '<button onclick="selectVangeMode(\'fri\')"'
        + ' style="background:#fff;border:1.5px solid #dce8ff;border-radius:16px;overflow:hidden;text-align:left;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.06);padding:0;width:100%">'
        + '<img src="img/trapp-auto.png" alt="Uten faste mål" style="width:100%;height:120px;object-fit:cover;display:block" />'
        + '<div style="padding:14px 18px">'
        + '<div style="font-size:16px;font-weight:800">🔧 Uten faste mål</div>'
        + '<div style="font-size:12px;color:#888;margin-top:4px">Du vet kun høyde – appen beregner resten</div>'
        + '</div>'
        + '</button>'
        + '</div>'
        + '</div>';
    }

    function renderVangeAuto(){
  return ''
    + '<div style="width:100%;max-width:480px;margin:0 auto;padding:24px">'
    + '  <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">'
    + '    <button onclick="selectVangeMode(null)" style="background:none;border:none;color:#888;font-size:20px;cursor:pointer;padding:4px">←</button>'
    + '    <div>'
    + '      <div style="font-size:22px;font-weight:800">🪜 Vange trapp</div>'
    + '      <div style="font-size:13px;color:#888">Uten faste mål</div>'
    + '    </div>'
    + '  </div>'

    + '  <div style="background:#fff;border:1.5px solid var(--line);border-radius:16px;padding:16px;margin-bottom:16px">'
    + '    <img src="img/trapp/vange-mal.png" alt="Vange trapp mål" style="width:100%;border-radius:12px" />'
    + '  </div>'

    + '  <div style="background:#fff;border:1.5px solid var(--line);border-radius:16px;padding:16px">'
    + '    <div style="display:grid;gap:12px">'
    + '      <div>'
    + '        <label style="display:block;font-size:13px;font-weight:700;margin-bottom:6px">Høyde trinn (cm)</label>'
    + '        <input id="vangeAutoRise" type="number" inputmode="decimal" placeholder="F.eks. 18" style="width:100%" />'
    + '      </div>'
    + '      <div>'
    + '        <label style="display:block;font-size:13px;font-weight:700;margin-bottom:6px">Dybde trinn (cm)</label>'
    + '        <input id="vangeAutoRun" type="number" inputmode="decimal" placeholder="F.eks. 25" style="width:100%" />'
    + '      </div>'
    + '      <div>'
    + '        <label style="display:block;font-size:13px;font-weight:700;margin-bottom:6px">Total høyde (cm)</label>'
    + '        <input id="vangeAutoTotalHeight" type="number" inputmode="decimal" placeholder="F.eks. 120" style="width:100%" />'
    + '      </div>'
    + '      <div>'
    + '        <label style="display:block;font-size:13px;font-weight:700;margin-bottom:6px">Topptrinn (mm)</label>'
    + '        <input id="vangeAutoTopStep" type="number" inputmode="decimal" placeholder="F.eks. 36" style="width:100%" />'
    + '      </div>'
    + '      <div>'
    + '        <label style="display:block;font-size:13px;font-weight:700;margin-bottom:6px">Vange (mm)</label>'
    + '        <input id="vangeAutoStringer" type="number" inputmode="decimal" placeholder="F.eks. 48" style="width:100%" />'
    + '      </div>'
    + '    </div>'
    + '  </div>'
    + '</div>';
}   
    function renderVangeView(){
      var inp = 'width:100%;padding:10px 14px;border:1.5px solid #dce8ff;border-radius:12px;font-size:16px;box-sizing:border-box';
      var lbl = 'display:block;font-size:13px;font-weight:700;margin-bottom:6px';
      var fastActive = _vangeMode === 'fast';
      var tabBase = 'flex:1;padding:10px;border-radius:10px;font-size:13px;cursor:pointer;';
      var tabOn  = tabBase + 'border:1.5px solid #3b82f6;background:#eff6ff;font-weight:800;color:#1d4ed8';
      var tabOff = tabBase + 'border:1.5px solid #dce8ff;background:#fff;font-weight:600;color:#888';

      var fastInputs = '<div style="display:flex;flex-direction:column;gap:14px">'
        + '<div><label style="' + lbl + '">Total høyde (mm)</label>'
        + '<input id="trappeHoyde" type="number" placeholder="f.eks. 2800" oninput="calcVange();oppdaterFaktiskOpptrinn()" style="' + inp + '" /></div>'
        + '<div><label style="' + lbl + '">Ønsket opptrinn (mm)</label>'
        + '<input id="trappeOpptrinn" type="number" placeholder="f.eks. 175" oninput="calcVange()" style="' + inp + '" /></div>'
        + '<div><label style="' + lbl + '">Inntrinn (mm)</label>'
        + '<input id="trappeInntrinn" type="number" placeholder="f.eks. 250" oninput="calcVange()" style="' + inp + '" /></div>'
        + '</div>';

      var friInputs = '<div style="display:flex;flex-direction:column;gap:14px">'
        + '<div><label style="' + lbl + '">Høyde trinn (cm)</label>'
        + '<input id="vangeAutoRise" type="number" inputmode="decimal" placeholder="F.eks. 18" oninput="calcVange()" style="' + inp + '" /></div>'
        + '<div><label style="' + lbl + '">Dybde trinn (cm)</label>'
        + '<input id="vangeAutoRun" type="number" inputmode="decimal" placeholder="F.eks. 25" oninput="calcVange()" style="' + inp + '" /></div>'
        + '<div><label style="' + lbl + '">Total høyde (mm)</label>'
        + '<input id="vangeAutoTotalHeight" type="number" inputmode="decimal" placeholder="F.eks. 2800" oninput="calcVange();oppdaterFaktiskOpptrinn()" style="' + inp + '" /></div>'
        + '<div><label style="' + lbl + '">Topptrinn (mm)</label>'
        + '<input id="vangeAutoTopStep" type="number" inputmode="decimal" placeholder="F.eks. 36" style="' + inp + '" /></div>'
        + '<div><label style="' + lbl + '">Vange (mm)</label>'
        + '<input id="vangeAutoStringer" type="number" inputmode="decimal" placeholder="F.eks. 48" style="' + inp + '" /></div>'
        + '</div>';

      return '<div style="width:100%;max-width:480px;margin:0 auto;padding:24px">'
        + '<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">'
        + '<button onclick="selectTrappeType(null)" style="background:none;border:none;color:#888;font-size:20px;cursor:pointer;padding:4px">←</button>'
        + '<div><div style="font-size:22px;font-weight:800">🪜 Vangetrapp</div></div>'
        + '</div>'
        + '<div style="background:#fff;border:1.5px solid var(--line);border-radius:16px;padding:16px;margin-bottom:16px">'
        + '<img src="img/trapp/vange-mal.png" alt="Vange trapp mål" style="width:100%;border-radius:12px" />'
        + '</div>'
        + '<div style="display:flex;gap:8px;margin-bottom:16px">'
        + '<button onclick="selectVangeMode(\'fast\')" style="' + (fastActive ? tabOn : tabOff) + '">📐 Med faste mål</button>'
        + '<button onclick="selectVangeMode(\'fri\')" style="' + (!fastActive ? tabOn : tabOff) + '">🔧 Uten faste mål</button>'
        + '</div>'
        + '<div style="background:#fff;border:1.5px solid var(--line);border-radius:16px;padding:14px 16px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center">'
        + '<span style="font-size:13px;font-weight:700">Antall trinn</span>'
        + '<div style="display:flex;align-items:center;gap:12px">'
        + '<button onclick="vangeJusterTrinn(-1)" style="width:34px;height:34px;border-radius:8px;border:1.5px solid #dce8ff;background:#fff;font-size:20px;cursor:pointer">−</button>'
        + '<span id="vangeTrinnVisning" style="font-size:22px;font-weight:800;min-width:28px;text-align:center">' + _vangeTrinn + '</span>'
        + '<button onclick="vangeJusterTrinn(1)" style="width:34px;height:34px;border-radius:8px;border:1.5px solid #dce8ff;background:#fff;font-size:20px;cursor:pointer">+</button>'
        + '</div></div>'
        + '<div style="background:#fff;border:1.5px solid var(--line);border-radius:16px;padding:14px 16px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center">'
        + '<span style="font-size:13px;font-weight:700;color:#888">Faktisk opptrinn</span>'
        + '<span id="vangeFaktiskOpptrinn" style="font-size:18px;font-weight:800">—</span>'
        + '</div>'
        + '<div style="background:#fff;border:1.5px solid var(--line);border-radius:16px;padding:16px">'
        + (fastActive ? fastInputs : friInputs)
        + '</div>'
        + '<div id="vangeResultat"></div>'
        + '</div>';
    }

    function renderTrappeTool(){
      if(!_trappeType) return renderTrappeTypeSelect();
      if(_trappeType !== 'vange') return renderTrappeTypePlaceholder(_trappeType);
      if(!_vangeMode) _vangeMode = 'fri';
      return renderVangeView();
    }

    window.calcTrappe = function(){
      var hoyde = Number(document.getElementById('trappeHoyde').value);
      var onsket = Number(document.getElementById('trappeOpptrinn').value);
      var inntrinn = Number(document.getElementById('trappeInntrinn').value);
      var el = document.getElementById('trappeResultat');
      if(!hoyde || !onsket || hoyde<=0 || onsket<=0){ el.innerHTML=''; return; }
      var antall = Math.round(hoyde / onsket);
      if(antall < 1){ el.innerHTML=''; return; }
      var faktisk = hoyde / antall;
      var vurdering, farge;
      if(faktisk < 160){       vurdering='Lavt opptrinn';   farge='#f0a202'; }
      else if(faktisk <= 190){ vurdering='Normalt opptrinn'; farge='#167a42'; }
      else {                   vurdering='Høyt opptrinn';    farge='#c0392b'; }
      var resultat = '<div style="background:#f5f8ff;border:1.5px solid #dce8ff;border-radius:14px;padding:16px;display:flex;flex-direction:column;gap:10px">'
        + '<div style="display:flex;justify-content:space-between;align-items:center">'
        + '<span style="font-size:13px;font-weight:700;color:#888">Antall opptrinn</span>'
        + '<span style="font-size:22px;font-weight:800">' + antall + '</span>'
        + '</div>'
        + '<div style="display:flex;justify-content:space-between;align-items:center">'
        + '<span style="font-size:13px;font-weight:700;color:#888">Faktisk opptrinn</span>'
        + '<span style="font-size:22px;font-weight:800">' + faktisk.toFixed(1) + ' mm</span>'
        + '</div>'
        + '<div style="display:flex;justify-content:space-between;align-items:center;padding-top:10px;border-top:1px solid #dce8ff">'
        + '<span style="font-size:13px;font-weight:700;color:#888">Vurdering opptrinn</span>'
        + '<span style="font-size:14px;font-weight:800;color:' + farge + '">' + vurdering + '</span>'
        + '</div>';
      if(inntrinn > 0){
        var formel = 2 * faktisk + inntrinn;
        var fVurdering, fFarge;
        if(formel < 600){       fVurdering='Bratt trapp'; fFarge='#c0392b'; }
        else if(formel <= 640){ fVurdering='God trapp';   fFarge='#167a42'; }
        else {                  fVurdering='Slak trapp';  fFarge='#f0a202'; }
        resultat += '<div style="display:flex;justify-content:space-between;align-items:center;padding-top:10px;border-top:1px solid #dce8ff">'
          + '<span style="font-size:13px;font-weight:700;color:#888">Trappeformel (2×O+I)</span>'
          + '<span style="font-size:22px;font-weight:800">' + formel.toFixed(1) + ' mm</span>'
          + '</div>'
          + '<div style="display:flex;justify-content:space-between;align-items:center">'
          + '<span style="font-size:13px;font-weight:700;color:#888">Vurdering trapp</span>'
          + '<span style="font-size:14px;font-weight:800;color:' + fFarge + '">' + fVurdering + '</span>'
          + '</div>';
      }
      el.innerHTML = resultat + '</div>';
    };

    window.openMakkerTool = function(id){
      _makkerTool = id;
      if(id !== 'trapp') _trappeType = null;
      renderMakkerView();
    };

    window.selectTrappeType = function(id){
      _trappeType = id;
      _vangeMode = null;
      renderMakkerView();
    };

    window.selectVangeMode = function(mode){
      _vangeMode = mode;
      _vangeTrinn = null;
      renderMakkerView();
    };

    window.calcVange = function(){
      var mode = _vangeMode || 'fri';
      var hoyde, inntrinn;
      if(mode === 'fast'){
        hoyde   = Number(document.getElementById('trappeHoyde').value);
        var ons = Number(document.getElementById('trappeOpptrinn').value);
        inntrinn = Number(document.getElementById('trappeInntrinn').value);
        if(!hoyde || !ons){ document.getElementById('vangeResultat').innerHTML=''; _vangeTrinn=null; return; }
        _vangeTrinn = Math.max(1, Math.round(hoyde / ons));
        if (valgtTrappetype !== 'vange-gulv') _vangeTrinn = Math.max(1, _vangeTrinn - 1);
      } else {
        var tot = Number(document.getElementById('vangeAutoTotalHeight').value);
        var ris = Number(document.getElementById('vangeAutoRise').value);
        inntrinn = Number(document.getElementById('vangeAutoRun').value) * 10;
        if(!tot || !ris){ document.getElementById('vangeResultat').innerHTML=''; _vangeTrinn=null; return; }
        hoyde = tot;
        _vangeTrinn = Math.max(1, Math.round(hoyde / (ris * 10)));
        if (valgtTrappetype !== 'vange-gulv') _vangeTrinn = Math.max(1, _vangeTrinn - 1);
      }
      vangeVisResultat(hoyde, inntrinn);
    };

    window.vangeJusterTrinn = function(delta){
      _vangeTrinn = Math.max(1, _vangeTrinn + delta);
      var vis = document.getElementById('vangeTrinnVisning');
      if(vis) vis.textContent = _vangeTrinn;
      oppdaterFaktiskOpptrinn();
      var mode = _vangeMode || 'fri';
      var hoyde, inntrinn;
      if(mode === 'fast'){
        hoyde    = Number(document.getElementById('trappeHoyde').value);
        inntrinn = Number(document.getElementById('trappeInntrinn').value);
      } else {
        hoyde    = Number(document.getElementById('vangeAutoTotalHeight').value) * 10;
        inntrinn = Number(document.getElementById('vangeAutoRun').value) * 10;
      }
      vangeVisResultat(hoyde, inntrinn);
    };

    window.oppdaterFaktiskOpptrinn = function(){
      var el = document.getElementById('vangeFaktiskOpptrinn');
      if(!el) return;
      var mode = _vangeMode || 'fri';
      var feltId = mode === 'fast' ? 'trappeHoyde' : 'vangeAutoTotalHeight';
      var felt = document.getElementById(feltId);
      var hoyde = felt ? Number(felt.value) : 0;
      if(!hoyde || !_vangeTrinn || _vangeTrinn < 1) { el.textContent = '—'; return; }
      el.textContent = (hoyde / _vangeTrinn).toFixed(1) + ' mm';
    };

    function vangeVisResultat(hoyde, inntrinn){
      var el = document.getElementById('vangeResultat');
      if(!el || !_vangeTrinn || !hoyde) return;

      var faktiskH = hoyde / _vangeTrinn;
      var formel   = inntrinn ? 2 * faktiskH + inntrinn : null;
      var step     = inntrinn ? Math.sqrt(faktiskH*faktiskH + inntrinn*inntrinn) : null;
      var lengde   = step ? step * _vangeTrinn : null;
      var vinkel   = inntrinn ? Math.atan2(faktiskH, inntrinn) * 180 / Math.PI : null;

      var fFarge = formel  ? (formel  >= 600 && formel  <= 640 ? '#167a42' : '#c0392b') : '#aaa';
      var hFarge = (faktiskH >= 160 && faktiskH <= 190) ? '#167a42' : '#c0392b';
      var dFarge = inntrinn ? ((inntrinn >= 220 && inntrinn <= 280) ? '#167a42' : '#c0392b') : '#aaa';

      var btn = 'width:34px;height:34px;border-radius:8px;border:1.5px solid #dce8ff;background:#fff;font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center';
      var sep = 'display:flex;justify-content:space-between;align-items:flex-start;padding-top:10px;border-top:1px solid #dce8ff';
      function row(label, val, note, noteColor){
        return '<div style="' + sep + '">'
          + '<span style="font-size:13px;font-weight:700;color:#888;padding-top:2px">' + label + '</span>'
          + '<div style="text-align:right">'
          + '<div style="font-size:18px;font-weight:800">' + val + '</div>'
          + (note ? '<div style="font-size:11px;color:' + (noteColor||'#aaa') + ';margin-top:1px">' + note + '</div>' : '')
          + '</div></div>';
      }

      var h = '<div style="background:#f5f8ff;border:1.5px solid #dce8ff;border-radius:14px;padding:16px;margin-top:14px">';

      h += '<div style="display:flex;justify-content:space-between;align-items:center">'
        + '<span style="font-size:13px;font-weight:700;color:#888">Antall trinn</span>'
        + '<div style="display:flex;align-items:center;gap:10px">'
        + '<button onclick="vangeJusterTrinn(-1)" style="' + btn + '">−</button>'
        + '<span style="font-size:22px;font-weight:800;min-width:28px;text-align:center">' + _vangeTrinn + '</span>'
        + '<button onclick="vangeJusterTrinn(1)" style="' + btn + '">+</button>'
        + '</div></div>';

      h += row('Høyde trinn',  faktiskH.toFixed(1) + ' mm', 'Anbefalt: 160–190 mm', hFarge);
      if(inntrinn) h += row('Dybde trinn', inntrinn.toFixed(0) + ' mm', 'Anbefalt: 220–280 mm', dFarge);
      if(formel)   h += row('Trappeformel (2×O+I)',
                     '<span style="color:' + fFarge + '">' + formel.toFixed(0) + ' mm</span>',
                     formel >= 600 && formel <= 640 ? '✓ Innenfor (600–640 mm)' : '✗ Utenfor (600–640 mm)', fFarge);
      if(step)     h += row('Mellomrom langs vange', step.toFixed(0) + ' mm', null, null);
      if(lengde)   h += row('Lengde vange', (lengde / 1000).toFixed(2) + ' m', null, null);
      if(vinkel !== null) {
        h += row('Grader nede', vinkel.toFixed(1) + '°', null, null);
        h += row('Grader oppe', (90 - vinkel).toFixed(1) + '°', null, null);
      }

      h += '</div>';
      el.innerHTML = h;
    }
