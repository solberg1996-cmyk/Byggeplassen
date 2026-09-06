    // ── SUPABASE ─────────────────────────────────────────────────────────────
    const _sb = supabase.createClient('https://uflwapebvmaasbzwsasv.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmbHdhcGVidm1hYXNiendzYXN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MzI5MTMsImV4cCI6MjA5MDEwODkxM30.L9rZsCRgCw3z4NR-fJwi_g2nrjyTNvUp_vTb0PRjHlQ');
    let _sbUser = null;
    let _syncTimeout = null;

    async function initAuth(){
      const {data:{session}} = await _sb.auth.getSession();
      if(session){ _sbUser=session.user; await loadFromCloud(); showApp(); }
      else { document.getElementById('loginView').style.display='flex'; document.querySelector('.app').style.display='none'; }
      _sb.auth.onAuthStateChange(async function(event,session){
        // Supabase re-fires SIGNED_IN whenever the tab/window regains focus,
        // not just on a real login. Only reload from cloud on an actual new
        // sign-in (no user, or a different user) — otherwise this clobbers
        // local edits that haven't finished their debounced cloud sync yet.
        if(event==='SIGNED_IN'&&session){
          const isNewSignIn = !_sbUser || _sbUser.id!==session.user.id;
          _sbUser=session.user;
          if(isNewSignIn){ await loadFromCloud(); showApp(); }
        }
        else if(event==='SIGNED_OUT'){ _sbUser=null; document.getElementById('loginView').style.display='flex'; document.querySelector('.app').style.display='none'; document.getElementById('appSidebar').style.display='none'; var bb=document.getElementById('bottomBar'); if(bb) bb.style.display='none'; }
      });
    }

    function showApp(){
      document.getElementById('loginView').style.display='none';
      document.getElementById('appSidebar').style.display='';
      var bb=document.getElementById('bottomBar');
      if(bb&&window._isMobile&&window._isMobile()) bb.style.display='flex';
      sidebarNav('kalkyle');
      maybeShowChangelog();
    }

    function maybeShowChangelog(){
      if(state.seenUpdateVersion===APP_UPDATE_VERSION) return;
      showModal(`
        <div class="section-head">
          <div class="section-title">Nytt i Byggeplassen</div>
        </div>
        <ul style="margin:0 0 16px;padding-left:20px;font-size:14px;line-height:1.7">
          <li>Utskrift av tilbud til PDF er fikset — krasjet appen og ga blanke sider før, fungerer nå med fargene med</li>
          <li><b>Nytt:</b> Materialpakker — lag egne faste materiallister og legg dem til i en post med ett klikk</li>
          <li><b>Nytt:</b> Tilbudsmal i Innstillinger — bestem selv rekkefølge, titler og standardtekst for alle avsnitt i tilbudet</li>
          <li><b>Nytt:</b> E-postmal i Innstillinger — tilpass emne og tekst på e-posten «Send tilbud» åpner</li>
          <li>Fikset: Rigg &amp; drift % ble ikke alltid regnet med i totalsummen — gjør det nå</li>
          <li>Fikset: Tekst i tilbud (som egne seksjoner) kunne forsvinne ved omlasting — lagres nå riktig</li>
          <li>Ryddet opp: Innstillinger havner ikke lenger «under» prosjektet du sto i</li>
        </ul>
        <div class="toolbar">
          <button class="btn primary" onclick="dismissChangelog()">Skjønner, lukk</button>
        </div>
      `);
    }

    window.dismissChangelog=function(){
      state.seenUpdateVersion=APP_UPDATE_VERSION;
      saveState();
      closeModal();
    };

    window.sidebarNav=function(view){
      // Hide all views
      document.querySelector('.app').style.display='none';
      document.getElementById('makkView').style.display='none';
      document.getElementById('befaringView').style.display='none';
      document.getElementById('docsView').style.display='none';
      // Update active state
      document.querySelectorAll('.sidebar-item[data-view]').forEach(function(btn){
        btn.classList.toggle('active',btn.dataset.view===view);
      });
      // Show selected view
      if(view==='kalkyle'){
        document.querySelector('.app').style.display='';
        renderDashboard();
      } else if(view==='makker'){
        document.getElementById('makkView').style.display='block';
        _makkerTool=null;
        renderMakkerView();
      } else if(view==='befaring'){
        document.getElementById('befaringView').style.display='flex';
      } else if(view==='dokumentasjon'){
        document.getElementById('docsView').style.display='block';
        openDocsView();
      }
    };

    // Keep old functions working for any remaining references
    window.goToKalkyle=function(){ sidebarNav('kalkyle'); };
    window.goToMakker=function(){ sidebarNav('makker'); };
    window.goToBefaring=function(){ sidebarNav('befaring'); };
    window.goToHome=function(){ sidebarNav('kalkyle'); };

    window.doLogin=async function(){
      const email=$('#loginEmail').value.trim(), pw=$('#loginPassword').value;
      const errEl=$('#loginError'); errEl.style.display='none';
      const btn=$('#loginBtn'); btn.textContent='Logger inn...'; btn.disabled=true;
      const {error}=await _sb.auth.signInWithPassword({email,password:pw});
      btn.textContent='Logg inn'; btn.disabled=false;
      if(error){ errEl.style.background='#fff1f0'; errEl.style.color='#c0392b'; errEl.textContent=error.message==='Invalid login credentials'?'Feil e-post eller passord':error.message; errEl.style.display='block'; }
    };

    window.doSignup=async function(){
      const email=$('#loginEmail').value.trim(), pw=$('#loginPassword').value;
      const errEl=$('#loginError'); errEl.style.display='none';
      if(!email||!pw){ errEl.textContent='Fyll inn e-post og passord'; errEl.style.display='block'; return; }
      if(pw.length<6){ errEl.textContent='Passord må være minst 6 tegn'; errEl.style.display='block'; return; }
      const {error}=await _sb.auth.signUp({email,password:pw});
      if(error){ errEl.textContent=error.message; errEl.style.display='block'; }
      else{ errEl.style.background='#edfff4'; errEl.style.borderColor='#b7f0cf'; errEl.style.color='#167a42'; errEl.textContent='Konto opprettet! Sjekk e-posten din for bekreftelse, eller logg inn direkte.'; errEl.style.display='block'; }
    };

    window.showSignup=function(){ $('#signupExtra').style.display='block'; $('#loginBtn').style.display='none'; };
    window.showLogin=function(){ $('#signupExtra').style.display='none'; $('#loginBtn').style.display='block'; };

    async function loadFromCloud(){
      if(!_sbUser) return;
      try{
        const {data}=await _sb.from('user_data').select('data').eq('user_id',_sbUser.id).single();
        if(data&&data.data){
          const p=data.data;
          state.customers=p.customers||[]; state.projects=p.projects||[];
          state.settings=Object.assign({},defaultSettings,p.settings||{});
          state.priceCatalog=p.priceCatalog||[]; state.priceFileName=p.priceFileName||'';
          state.favoriteCatalogIds=p.favoriteCatalogIds||[]; state.recentCatalogIds=p.recentCatalogIds||[];
          state.userTemplates=p.userTemplates||[]; state.calcRates=p.calcRates||{}; state.laborRates=p.laborRates||{}; state.calcRecipes=p.calcRecipes||{};
          state.materialPackages=p.materialPackages||[];
          state.offerTemplate=p.offerTemplate||defaultOfferTemplate();
          state.seenUpdateVersion=p.seenUpdateVersion||'';
          state.company=Object.assign({},defaultCompany,p.company||{});
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        }
      } catch(e){ console.log('Cloud load:', e); }
    }

    async function saveToCloud(){
      if(!_sbUser) return;
      try{
        await _sb.from('user_data').upsert({user_id:_sbUser.id, data:state, updated_at:new Date().toISOString()},{onConflict:'user_id'});
        updateSyncIndicator(true);
      } catch(e){ console.log('Cloud save:', e); updateSyncIndicator(false); }
    }

    // Vis/skjul bunnmeny ved resize
    window.addEventListener('resize',function(){
      var bb=document.getElementById('bottomBar');
      if(!bb||!_sbUser) return;
      bb.style.display=window._isMobile&&window._isMobile()?'flex':'none';
      if(!window._isMobile||!window._isMobile()) closeMerSheet();
    });

    function updateSyncIndicator(ok){
      const el=document.getElementById('syncIndicator');
      if(!el) return;
      el.textContent=ok?'Synkronisert':'Synkfeil';
      el.style.color=ok?'#34c759':'#ff3b30';
    }
