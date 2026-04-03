    const STORAGE_KEY = 'kalkyleapp_round6';
    const defaultSettings = { timeRate:850, internalCost:450, materialMarkup:20, driveCost:650, vatMode:'ex' };
    const defaultCompany = { name:'', address:'', zip:'', city:'', phone:'', email:'', website:'', orgNr:'', vatRegistered:true, logo:'', color:'#2e75b6', extraInfo:'' };

    function loadState(){
      try{
        const raw=localStorage.getItem(STORAGE_KEY);
        if(raw){
          const p=JSON.parse(raw);
          return {customers:p.customers||[], projects:p.projects||[], settings:{...defaultSettings,...(p.settings||{})},
            priceCatalog:p.priceCatalog||[], priceFileName:p.priceFileName||'',
            favoriteCatalogIds:p.favoriteCatalogIds||[], recentCatalogIds:p.recentCatalogIds||[],
            userTemplates:p.userTemplates||[],calcRates:p.calcRates||{},calcRecipes:p.calcRecipes||{},
            company:{...defaultCompany,...(p.company||{})}};
        // migrate old subcontractor field
        state.projects.forEach(pr=>{ if(pr.extras && pr.extras.subcontractor>0 && !pr.extras.subcontractors){ pr.extras.subcontractors=[{id:uid(),trade:'Underentreprenør',amount:pr.extras.subcontractor}]; } pr.extras.subcontractors=pr.extras.subcontractors||[]; });
        }
      }catch(e){}
      return {customers:[],projects:[],settings:{...defaultSettings},priceCatalog:[],priceFileName:'',favoriteCatalogIds:[],recentCatalogIds:[],userTemplates:[],calcRates:{},calcRecipes:{}};
    }

    let state = loadState();
    let currentProjectId = null;

    const $ = sel => document.querySelector(sel);

    function uid(){ return Math.random().toString(36).slice(2,10); }
    function currency(n){ return `${Math.round(Number(n)||0).toLocaleString('nb-NO')} kr`; }
    function percent(n){ return `${Math.round((Number(n)||0)*10)/10}%`; }
    function safe(v){ return v==null ? '' : String(v); }

    function vatFactor(p){ return (p && p.settings && p.settings.vatMode==='inc') ? 1.25 : 1; }
    function displayVatValue(p, v){ return Math.round((Number(v)||0)*vatFactor(p)*100)/100; }
    function parseVatInput(p, v){ const n=Number(v)||0; return vatFactor(p)===1.25?(n/1.25):n; }

    function parseNbNumber(value){
      if(value==null) return 0;
      const cleaned = String(value).replace(/\./g,'').replace(',','.').replace(/[^0-9.-]/g,'');
      const n = Number(cleaned);
      return isNaN(n) ? 0 : n;
    }

    function saveState(){
      localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
      if(_syncTimeout) clearTimeout(_syncTimeout);
      _syncTimeout=setTimeout(saveToCloud, 2000);
      const el=document.getElementById('syncIndicator');
      if(el){ el.textContent='☁️ Lagrer...'; el.style.color='#888'; }
    }

    function exportData(){
      const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});
      const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='byggeplassen-backup.json'; a.click(); URL.revokeObjectURL(a.href);
    }

    function importData(file){
      const reader=new FileReader();
      reader.onload=e=>{
        try{
          const p=JSON.parse(e.target.result);
          state={customers:p.customers||[],projects:p.projects||[],settings:{...defaultSettings,...(p.settings||{})},
            priceCatalog:p.priceCatalog||[],priceFileName:p.priceFileName||'',
            favoriteCatalogIds:p.favoriteCatalogIds||[],recentCatalogIds:p.recentCatalogIds||[],
            userTemplates:p.userTemplates||[],calcRates:p.calcRates||{},calcRecipes:p.calcRecipes||{},
            company:{...defaultCompany,...(p.company||{})}};
          saveState(); renderDashboard(); alert('Data importert.');
        }catch(err){ alert('Kunne ikke lese filen.'); }
      };
      reader.readAsText(file);
    }

    function getCustomer(id){ return state.customers.find(c=>c.id===id); }
    function getProject(id){ return state.projects.find(p=>p.id===id); }

    function showModal(html){ $('#modalHost').innerHTML=`<div class="modal-backdrop" onclick="backdropClose(event)"><div class="modal">${html}</div></div>`; }
    function closeModal(){ $('#modalHost').innerHTML=''; }
    function backdropClose(e){ if(e.target.classList.contains('modal-backdrop')) closeModal(); }
    function escapeHtml(str=''){ return String(str).replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s])); }
    function escapeAttr(str=''){ return escapeHtml(str); }
    function sel(a,b){ return a===b?'selected':''; }
    function toggleSection(el){ el.closest('.tab-section').classList.toggle('collapsed'); }
