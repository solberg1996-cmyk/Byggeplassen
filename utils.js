    // ── SVG Icon System ────────────────────────────────────
    // Compact inline SVGs, 16x16, stroke-based, inherits currentColor
    const _i=(d,s=16)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;flex-shrink:0">${d}</svg>`;
    const IC={
      building:    _i('<path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/><path d="M9 9h1"/><path d="M9 13h1"/><path d="M9 17h1"/>'),
      ruler:       _i('<path d="M21.73 18l-8-14a2 2 0 00-3.48 0l-8 14A2 2 0 003.98 21h16.04a2 2 0 001.71-3z"/>', 16).replace('stroke-width="2"','stroke-width="0" fill="none"').replace(/<svg/,'<svg').replace(/<\/svg>/,'</svg>').replace(/<path/g,'<path') || _i('<path d="M2 2l20 20"/><path d="M5.5 5.5l4-4"/><path d="M9 1v4"/><path d="M1 9h4"/><path d="M18.5 18.5l4-4"/><path d="M23 15v4"/><path d="M15 23h4"/>'),
      compass:     _i('<path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>'),
      handshake:   _i('<path d="M11 17a4 4 0 01-4-4V9a4 4 0 014-4h2a4 4 0 014 4v4a4 4 0 01-4 4"/><path d="M7 13h-3a2 2 0 01-2-2V9a2 2 0 012-2h3"/><path d="M17 13h3a2 2 0 002-2V9a2 2 0 00-2-2h-3"/>'),
      search:      _i('<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>'),
      calc:        _i('<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8"/><path d="M8 10h1"/><path d="M15 10h1"/><path d="M8 14h1"/><path d="M15 14h1"/><path d="M8 18h1"/><path d="M15 18h1"/>'),
      settings:    _i('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>'),
      logout:      _i('<path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>'),
      cloud:       _i('<path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/>'),
      cloudSync:   _i('<path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/><path d="M13 14l2-2-2-2"/><path d="M11 16l-2 2 2 2"/>'),
      star:        _i('<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="currentColor"/>'),
      starEmpty:   _i('<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>'),
      clipboard:   _i('<path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>'),
      user:        _i('<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>'),
      calendar:    _i('<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>'),
      fileText:    _i('<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>'),
      doc:         _i('<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>'),
      docPreview:  _i('<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="12" y1="17" x2="8" y2="17"/>'),
      layers:      _i('<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>'),
      clock:       _i('<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>'),
      hammer:      _i('<path d="M15 12l-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 010-3L12 9"/><path d="M17.64 15L22 10.64"/><path d="M20.91 11.7l-1.25-1.25c-.6-.6-.93-1.4-.93-2.25V6.5a.5.5 0 01.5-.5H21a3 3 0 013 3v.71c0 .85-.34 1.65-.93 2.24l-1.25 1.25"/>'),
      truck:       _i('<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>'),
      alert:       _i('<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>'),
      currency:    _i('<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>'),
      printer:     _i('<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>'),
      check:       _i('<polyline points="20 6 9 17 4 12"/>'),
      checkCircle: _i('<path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>'),
      x:           _i('<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>'),
      pkg:         _i('<path d="M16.5 9.4l-9-5.19"/><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>'),
      edit:        _i('<path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>'),
      download:    _i('<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>'),
      copy:        _i('<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>'),
      image:       _i('<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>'),
      palette:     _i('<circle cx="13.5" cy="6.5" r="0.5" fill="currentColor"/><circle cx="17.5" cy="10.5" r="0.5" fill="currentColor"/><circle cx="8.5" cy="7.5" r="0.5" fill="currentColor"/><circle cx="6.5" cy="12" r="0.5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.04-.23-.29-.38-.63-.38-1.01 0-.83.67-1.5 1.5-1.5H16c3.31 0 6-2.69 6-6 0-5.17-4.49-9-10-9z"/>'),
      briefcase:   _i('<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>'),
      info:        _i('<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>'),
      save:        _i('<path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>'),
      wood:        _i('<path d="M2 20h20"/><path d="M5 20V8.5L12 4l7 4.5V20"/><path d="M9 20v-5h6v5"/><path d="M9 12h6"/>'),
    };

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
      if(el){ el.textContent='Lagrer...'; el.style.color='#888'; }
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
