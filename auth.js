    // ── SUPABASE ─────────────────────────────────────────────────────────────
    const _sb = supabase.createClient('https://uflwapebvmaasbzwsasv.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmbHdhcGVidm1hYXNiendzYXN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MzI5MTMsImV4cCI6MjA5MDEwODkxM30.L9rZsCRgCw3z4NR-fJwi_g2nrjyTNvUp_vTb0PRjHlQ');
    let _sbUser = null;
    let _syncTimeout = null;

    async function initAuth(){
      const {data:{session}} = await _sb.auth.getSession();
      if(session){ _sbUser=session.user; await loadFromCloud(); showApp(); }
      else { document.getElementById('loginView').style.display='flex'; document.querySelector('.app').style.display='none'; }
      _sb.auth.onAuthStateChange(async function(event,session){
        if(event==='SIGNED_IN'&&session){ _sbUser=session.user; await loadFromCloud(); showApp(); }
        else if(event==='SIGNED_OUT'){ _sbUser=null; document.getElementById('loginView').style.display='flex'; document.querySelector('.app').style.display='none'; }
      });
    }

    function showApp(){
      document.getElementById('loginView').style.display='none';
      document.getElementById('homeView').style.display='flex';
    }

    window.goToKalkyle=function(){
      document.getElementById('homeView').style.display='none';
      document.querySelector('.app').style.display='';
      renderDashboard();
    };
    window.goToMakker=function(){
      document.getElementById('homeView').style.display='none';
      document.getElementById('makkView').style.display='block';
      _makkerTool=null;
      renderMakkerView();
    };
    window.goToBefaring=function(){
      document.getElementById('homeView').style.display='none';
      document.getElementById('befaringView').style.display='flex';
    };
    window.goToHome=function(){
      document.getElementById('makkView').style.display='none';
      document.getElementById('befaringView').style.display='none';
      document.querySelector('.app').style.display='none';
      document.getElementById('homeView').style.display='flex';
    };

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
          state.userTemplates=p.userTemplates||[]; state.calcRates=p.calcRates||{}; state.calcRecipes=p.calcRecipes||{};
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

    function updateSyncIndicator(ok){
      const el=document.getElementById('syncIndicator');
      if(!el) return;
      el.textContent=ok?'☁️ Synkronisert':'⚠️ Synkfeil';
      el.style.color=ok?'#34c759':'#ff3b30';
    }
