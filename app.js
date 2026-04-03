



    const builtinTemplates = [
      { id:'tpl_terrasse', name:'Terrasse', builtIn:true, materials:[
        {name:'Terrassebord 28x120 impregnert', unit:'lm', waste:10},
        {name:'Bjelkelag 48x198 C24', unit:'lm', waste:8},
        {name:'Terrasseskruer A2', unit:'pk', waste:0},
        {name:'Fundament / stolpesko', unit:'stk', waste:0}
      ]},
      { id:'tpl_lettvegg', name:'Lettvegg', builtIn:true, materials:[
        {name:'Virke 48×98 C24 (stender+svill/rem)', unit:'lm', waste:5},
        {name:'Gips 13 mm std', unit:'pl', waste:10},
        {name:'Mineralull 100 mm', unit:'pk', waste:5},
        {name:'Gipsskruer båndet', unit:'pk', waste:0}
      ]},
      { id:'tpl_vindu', name:'Vindu', builtIn:true, materials:[
        {name:'Karmskruer 90 mm', unit:'pk', waste:0},
        {name:'Fugeskum proff', unit:'stk', waste:0},
        {name:'Lister malt 15x58', unit:'lm', waste:10},
        {name:'Beslag / tetting', unit:'pakke', waste:0}
      ]},
      { id:'tpl_listing', name:'Listing', builtIn:true, materials:[
        {name:'Fotlist 12x58 hvitmalt', unit:'lm', waste:10},
        {name:'Dykkert 1,6x50', unit:'pk', waste:0},
        {name:'Acryl/fug hvit', unit:'stk', waste:0}
      ]},
      { id:'tpl_kledning', name:'Kledning', builtIn:true, materials:[
        {name:'D-fals 19x148 grunnet', unit:'lm', waste:12},
        {name:'Lekter 23x48', unit:'lm', waste:10},
        {name:'Vindsperre', unit:'rull', waste:5},
        {name:'Spiker / skruer utvendig', unit:'pk', waste:0}
      ]},
      { id:'tpl_etterisolering', name:'Etterisolering', builtIn:true, materials:[
        {name:'Isolasjon 50 mm', unit:'pk', waste:8},
        {name:'Lekt 48x48', unit:'lm', waste:10},
        {name:'Dampsperre', unit:'rull', waste:5},
        {name:'Tape / mansjetter', unit:'pakke', waste:0}
      ]},
      { id:'tpl_tak', name:'Tak', builtIn:true, materials:[
        {name:'Takstein / platetak', unit:'m²', waste:10},
        {name:'Sløyfer og lekter', unit:'lm', waste:8},
        {name:'Undertaksduk', unit:'rull', waste:5},
        {name:'Beslag', unit:'pakke', waste:0}
      ]}
    ];

    const addOnPackages = [
      {name:'Sparkelpakke', desc:'Sparkel, papirremse, slipepapir', items:[
        {name:'Sparkel', qty:3, unit:'spann', waste:0, markup:20},
        {name:'Papirremse', qty:2, unit:'rull', waste:0, markup:20},
        {name:'Slipepapir', qty:1, unit:'pk', waste:0, markup:20}
      ]},
      {name:'Listverkspakke', desc:'Lister og festemidler', items:[
        {name:'Listverk standard', qty:20, unit:'lm', waste:10, markup:20},
        {name:'Dykkert', qty:1, unit:'pk', waste:0, markup:20}
      ]},
      {name:'Fug og tetting', desc:'Skum, fug og tetting', items:[
        {name:'Fugemasse', qty:4, unit:'stk', waste:0, markup:20},
        {name:'Fugeskum', qty:2, unit:'stk', waste:0, markup:20}
      ]},
      {name:'Riving og avfall', desc:'Bortkjøring og avfall', items:[
        {name:'Avfallshåndtering', qty:1, unit:'jobb', waste:0, markup:10}
      ]},
      {name:'Underlagspakke', desc:'Duk, tape og overganger', items:[
        {name:'Underlagsduk', qty:1, unit:'rull', waste:5, markup:20},
        {name:'Tape / mansjetter', qty:1, unit:'pakke', waste:0, markup:20}
      ]}
    ];

    function getAllTemplates(){ return [...builtinTemplates, ...(state.userTemplates||[])]; }

    function lookupPriceForMaterial(name){
      if(!state.priceCatalog||!state.priceCatalog.length) return 0;
      const q = (name||'').toLowerCase().trim();
      if(!q) return 0;
      let match = state.priceCatalog.find(item =>
        (item.productName||item.name||'').toLowerCase()===q || (item.name||'').toLowerCase()===q
      );
      if(!match){
        match = state.priceCatalog.find(item =>
          (item.productName||item.name||'').toLowerCase().includes(q) ||
          q.includes((item.productName||item.name||'').toLowerCase().substring(0,8))
        );
      }
      return match ? (match.userPrice||0) : 0;
    }

    // Auto-kalkyle: smart price matching against priceCatalogMap
    function autoMatchPrice(name, priceCatalogMap){
      if(!name) return null;
      // 1. Exact match
      if(priceCatalogMap[name]) return priceCatalogMap[name];
      // 2. Substring match (key contains name or name contains key)
      const q=name.toLowerCase();
      const keys=Object.keys(priceCatalogMap);
      for(let i=0;i<keys.length;i++){
        const k=keys[i].toLowerCase();
        if(q.includes(k) && k.length>3) return priceCatalogMap[keys[i]];
        if(k.includes(q) && q.length>3) return priceCatalogMap[keys[i]];
      }
      // 3. Token-based: match if ≥50% of tokens hit
      const tokens=q.split(/[\s×\/\-]+/).filter(t=>t.length>2);
      if(tokens.length===0) return null;
      let bestMatch=null, bestScore=0;
      for(let i=0;i<keys.length;i++){
        const k=keys[i].toLowerCase();
        let score=0;
        for(let j=0;j<tokens.length;j++){
          if(k.includes(tokens[j])) score++;
        }
        if(score>bestScore && score>=Math.ceil(tokens.length*0.4)){
          bestScore=score;
          bestMatch=priceCatalogMap[keys[i]];
        }
      }
      return bestMatch;
    }

    window.copyArtikkelNummer=function(artnr,el){
      navigator.clipboard.writeText(artnr).then(()=>{
        if(el){
          const original=el.textContent;
          el.textContent='✓';
          setTimeout(()=>{ el.textContent=original; },1000);
        }
      }).catch(err=>console.error('Copy failed:',err));
    };

    window.openPriceSearchForCalc=function(matId){
      window._calcMatIdActive=matId;
      window._calcMatSearchActive=0;
      let modal=document.getElementById('calcMatModal');
      if(!modal){
        modal=document.createElement('div');
        modal.id='calcMatModal';
        modal.style.cssText='position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:600px;max-height:70vh;background:var(--card);border:1px solid var(--line);border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.4);z-index:2000;display:flex;flex-direction:column;overflow:hidden';
        document.body.appendChild(modal);
      }
      let backdrop=document.getElementById('calcMatBackdrop');
      if(!backdrop){
        backdrop=document.createElement('div');
        backdrop.id='calcMatBackdrop';
        backdrop.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.3);z-index:1999;cursor:pointer;pointer-events:auto';
        backdrop.addEventListener('click',function(e){
          if(e.target===backdrop) closeCalcMatModal();
        });
        document.body.appendChild(backdrop);
      }
      backdrop.style.display='block';
      modal.innerHTML=`
        <div style="padding:16px;border-bottom:1px solid #eee">
          <input type="text" id="calcMatModalSearchInput" placeholder="Søk materiale..." style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;font-size:12px" oninput="showCalcMatSearchModal(this.value)" onkeydown="handleCalcMatModalKeydown(event)" />
        </div>
        <div id="calcMatModalResults" style="flex:1;overflow-y:auto;padding:0"></div>
      `;
      modal.style.display='block';
      modal.onclick=function(e){
  e.stopPropagation();
};
      // Remove any stale outside-click listener before adding a new one
      if(window._calcMatOutsideClick){
        document.removeEventListener('click',window._calcMatOutsideClick);
      }
      setTimeout(()=>{
        window._calcMatOutsideClick=function(e){
          const modal=document.getElementById('calcMatModal');
          if(modal && modal.style.display!=='none' && !modal.contains(e.target)){
            closeCalcMatModal();
          }
        };
        document.addEventListener('click',window._calcMatOutsideClick);
      },0);
      // Global Escape handler so Escape works even before typing
      if(window._calcMatEscHandler){
        document.removeEventListener('keydown',window._calcMatEscHandler);
      }
      window._calcMatEscHandler=function(e){
        if(e.key==='Escape'){
          e.preventDefault();
          e.stopPropagation();
          closeCalcMatModal();
        }
      };
      document.addEventListener('keydown',window._calcMatEscHandler);
      document.body.style.overflow='hidden';
      document.getElementById('calcMatModalSearchInput').focus();
      showCalcMatSearchModal('');
    };

    window.showCalcMatSearchModal=function(query){
      const resultsDiv=document.getElementById('calcMatModalResults');
      if(!resultsDiv) return;

      const results=searchPriceCatalog(query).slice(0,15);
      if(!query.trim() || !results.length){
        resultsDiv.innerHTML=query.trim()?'<div style="padding:16px;text-align:center;color:var(--muted);font-size:12px">Ingen treff</div>':'<div style="padding:16px;text-align:center;color:var(--muted);font-size:12px">Skriv for å søke</div>';
        window._calcMatSearchActive=0;
        return;
      }

      resultsDiv.innerHTML=results.map((item,idx)=>`
        <div class="calcMatSearchItem" data-idx="${idx}" style="padding:14px 16px;border-bottom:1px solid var(--line);cursor:pointer;transition:background 0.1s" onmouseover="this.style.background='var(--card-hover)';window._calcMatSearchActive=${idx}" onmouseout="this.style.background='var(--card)'" onclick="selectCalcMatFromModal('${escapeHtml(item.id)}')">
          <div style="font-weight:700;color:var(--text);margin-bottom:4px;font-size:12px">${escapeHtml(item.productName||item.name)}</div>
          <div style="font-size:11px;color:var(--muted);display:flex;gap:16px;align-items:center">
            <span>${escapeHtml(item.unit||'stk')}</span>
            <span style="color:var(--accent);font-weight:600">${currency(item.userPrice||0)}</span>
            ${item.itemNo?'<span style="color:var(--muted);font-size:10px;display:flex;align-items:center;gap:6px">Art.nr: '+escapeHtml(item.itemNo)+'<button style="background:none;border:none;cursor:pointer;padding:0;font-size:12px" onclick="copyCalcItemNo(\''+escapeHtml(item.itemNo)+'\');event.stopPropagation()">📋</button></span>':''}
          </div>
        </div>
      `).join('');
      if(typeof window._calcMatSearchActive!=='number'){
        window._calcMatSearchActive=0;
      }
      updateCalcMatSearchActiveStyle();
    };

    window.selectCalcMatFromModal=function(itemId){
      const matId=window._calcMatIdActive;
      if(!matId) return;
      const item=getCatalogItem(itemId);
      if(!item) return;

      const row=document.querySelector('tr[data-mat-id="'+matId+'"]');
      if(!row) return;

      row.querySelector('.calcMatName').value=item.name||'';
      row.querySelector('.calcMatCost').value=(item.userPrice||0).toFixed(2);
      row.querySelector('.calcMatUnit').value=item.unit||'stk';
      row.querySelector('.calcMatUnit').dispatchEvent(new Event('change'));
      row.querySelector('.calcMatUnit').style.background='#e8f4ff';
      setTimeout(()=>{
        row.querySelector('.calcMatUnit').style.background='';
      },800);

      recalcCalcMaterials();
      closeCalcMatModal();
    };

    window.handleCalcMatModalKeydown=function(e){
      const resultsDiv=document.getElementById('calcMatModalResults');
      const items=resultsDiv?.querySelectorAll('.calcMatSearchItem')||[];
      if(!items.length) return;

      if(e.key==='ArrowDown'){
        e.preventDefault();
        window._calcMatSearchActive=Math.min(window._calcMatSearchActive+1,items.length-1);
        updateCalcMatSearchActiveStyle();
      }else if(e.key==='ArrowUp'){
        e.preventDefault();
        window._calcMatSearchActive=Math.max(window._calcMatSearchActive-1,0);
        updateCalcMatSearchActiveStyle();
      }else if(e.key==='Enter'){
        e.preventDefault();
        const active=items[window._calcMatSearchActive];
        if(active) active.click();
      }else if(e.key==='Escape'){
        e.preventDefault();
        closeCalcMatModal();
      }
    };

    window.updateCalcMatSearchActiveStyle=function(){
      const items=document.querySelectorAll('.calcMatSearchItem');
      items.forEach((item,idx)=>{
        if(idx===window._calcMatSearchActive){
          item.style.background='#e8f4ff';
          item.style.borderLeft='4px solid var(--accent)';
          item.style.paddingLeft='12px';
          item.scrollIntoView({block:'nearest'});
        }else{
          item.style.background='var(--card)';
          item.style.borderLeft='none';
          item.style.paddingLeft='16px';
        }
      });
    };

    window.closeCalcMatModal=function(){
      const modal=document.getElementById('calcMatModal');
      if(modal) modal.style.display='none';
      const backdrop=document.getElementById('calcMatBackdrop');
      if(backdrop) backdrop.style.display='none';
      // Clean up outside-click listener so it doesn't block reopen
      if(window._calcMatOutsideClick){
        document.removeEventListener('click',window._calcMatOutsideClick);
        window._calcMatOutsideClick=null;
      }
      // Clean up global Escape handler
      if(window._calcMatEscHandler){
        document.removeEventListener('keydown',window._calcMatEscHandler);
        window._calcMatEscHandler=null;
      }
      // Blur modal input so the material row input can receive click cleanly
      const searchInput=document.getElementById('calcMatModalSearchInput');
      if(searchInput) searchInput.blur();
      document.body.style.overflow='auto';
      window._calcMatIdActive=null;
      window._calcMatSearchActive=0;
    };

    window.copyCalcItemNo=function(itemNo){
      navigator.clipboard.writeText(itemNo).then(()=>{
        console.log('Artikkelnummer kopiert: '+itemNo);
      }).catch(err=>console.error('Copy failed:',err));
    };

    window.getCalcFavorites=function(){
      try {
        return JSON.parse(localStorage.getItem('calcFavoriteMaterials'))||[];
      } catch(e) { return []; }
    };

    window.saveCalcFavorites=function(fav){
      localStorage.setItem('calcFavoriteMaterials',JSON.stringify(fav));
    };

    window.addCalcFavorite=function(name,unit,cost,itemNo){
      let fav=getCalcFavorites();
      if(!fav.find(f=>f.name===name)){
        fav.unshift({name,unit,cost,itemNo});
        fav=fav.slice(0,20);
        saveCalcFavorites(fav);
      }
    };

    window.removeCalcFavorite=function(name){
      let fav=getCalcFavorites();
      fav=fav.filter(f=>f.name!==name);
      saveCalcFavorites(fav);
    };

    window.isCalcFavorite=function(name){
      return getCalcFavorites().some(f=>f.name===name);
    };

    window.toggleFavoriteMaterial=function(matId,name){
      if(isCalcFavorite(name)){
        removeCalcFavorite(name);
      } else {
        const priceCatalogMap=window.buildPriceCatalogMap?window.buildPriceCatalogMap():{};
        const item=priceCatalogMap[name];
        if(item) addCalcFavorite(name,item.unit||'stk',item.cost||0,item.itemNo||item.artnr||item.articleNumber||'');
      }
      showMatAutocomplete(matId,document.querySelector('.calcMatName[data-mat-id="'+matId+'"]')?.value||'');
    };

    window.toggleFavDropdown=function(dropdownId){
      const dd=document.getElementById(dropdownId);
      if(!dd) return;
      const isOpen=!dd.classList.contains('hidden');
      document.querySelectorAll('.fav-dropdown').forEach(d=>d.classList.add('hidden'));
      if(isOpen) return;
      const favs=getCalcFavorites();
      const context=dropdownId.includes('Modal')?`'modal'`:dropdownId.includes('Calc')?'true':'false';
      if(!favs.length){
        dd.innerHTML=`<div class="fav-dropdown-header">Favorittmaterialer</div>
          <div class="fav-dropdown-footer">Ingen favoritter enda.<br>Marker materialer som ⭐ i prissøk for å lagre dem her.</div>`;
      } else {
        dd.innerHTML=`<div class="fav-dropdown-header">Favorittmaterialer</div>`
          +favs.map(f=>`<button class="fav-dropdown-item" onclick="addFavToProject(${context},'${escapeHtml(f.name)}','${f.unit||'stk'}',${f.cost||0});toggleFavDropdown('${dropdownId}')">
            <span class="fav-item-name">${escapeHtml(f.name)}</span>
            <span class="fav-item-meta">${f.unit||'stk'}${f.cost?' · kr '+f.cost:''}</span>
          </button>`).join('')
          +`<div class="fav-dropdown-footer">Marker materialer som ⭐ i prissøk for å lagre dem her</div>`;
      }
      dd.classList.remove('hidden');
    };

    document.addEventListener('click',function(e){
      if(!e.target.closest('.fav-dropdown-wrap')) document.querySelectorAll('.fav-dropdown').forEach(d=>d.classList.add('hidden'));
    });

    window.addFavToProject=function(context,name,unit,cost){
      if(context==='modal'){
        // Tilpass-modal: add to window._cpm
        if(!window._cpm) return;
        window._cpm.push({id:(Math.random().toString(36).slice(2,10)),name,qty:1,unit,cost,waste:0,markup:20});
        rerenderCalcModal();
      } else if(context===true||context==='calc'){
        const result=window._lastCalcResult;
        if(!result) return;
        const p=getProject(currentProjectId);
        const calcMarkup=(p?.settings?.materialMarkup)||20;
        const newMat={matId:uid(),name,qty:1,cost,waste:0,markup:calcMarkup,unit,totalCost:cost};
        result.materialsWithPrices.push(newMat);
        runCalcWidget();
      } else {
        const p=getProject(currentProjectId);
        if(!p) return;
        p.materials.push({id:uid(),name,qty:1,unit,cost,waste:0,markup:p.settings.materialMarkup});
        persistAndRenderProject();
      }
    };

    window.showMatAutocomplete=function(matId,query){
      const dropdown=document.querySelector('.matAutocomplete[data-mat-id="'+matId+'"]');
      if(!dropdown) return;
      const q=query?query.toLowerCase().trim():'';
      const priceCatalogMap=window.buildPriceCatalogMap?window.buildPriceCatalogMap():{};

      let matches=[];
      if(q.length>0){
        matches=Object.entries(priceCatalogMap).filter(([name,item])=>{
          const artnr=(item.itemNo||item.artnr||item.articleNumber||'').toLowerCase();
          return name.toLowerCase().includes(q)||artnr.includes(q);
        });

        // Sort: name start > artnr match > contains
        matches.sort((a,b)=>{
          const aName=a[0].toLowerCase();
          const bName=b[0].toLowerCase();
          const aArtnr=(a[1].itemNo||a[1].artnr||a[1].articleNumber||'').toLowerCase();
          const bArtnr=(b[1].itemNo||b[1].artnr||b[1].articleNumber||'').toLowerCase();
          const isNumQuery=/^\d+$/.test(q);

          const aNameStart=aName.startsWith(q);
          const bNameStart=bName.startsWith(q);
          if(aNameStart!==bNameStart) return bNameStart?1:-1;

          const aArtnrMatch=aArtnr.includes(q);
          const bArtnrMatch=bArtnr.includes(q);
          if(isNumQuery&&aArtnrMatch!==bArtnrMatch) return bArtnrMatch?1:-1;

          return aName.localeCompare(bName);
        });

        matches=matches.slice(0,8);
      }

      // Add favorites at top if no search
      let allItems=matches;
      if(!q){
        const favs=getCalcFavorites();
        const favMatches=favs.map(f=>{
          const cat=Object.entries(priceCatalogMap).find(([n])=>n===f.name);
          return cat?cat:[f.name,{unit:f.unit,cost:f.cost,itemNo:f.itemNo}];
        });
        allItems=[...favMatches,...matches].slice(0,8);
      }

      if(!allItems.length){
        dropdown.style.display='none';
        return;
      }
      dropdown.style.minWidth='400px';
      dropdown.style.maxHeight='250px';
      dropdown.innerHTML=allItems.map(([name,item],idx)=>{
        const artnr=item.itemNo||item.artnr||item.articleNumber;
        const isFav=isCalcFavorite(name);
        return `<div class="matDropdownItem" data-idx="${idx}" data-name="${escapeHtml(name)}" style="padding:12px 14px;border-bottom:1px solid var(--line);cursor:pointer;font-size:11px;transition:background 0.15s;background:${isFav?'var(--yellow-soft)':'var(--card)'}" onmouseover="setMatAutocompleteActive('${matId}',${idx})" onclick="selectMatByIndex('${matId}',${idx})">
          <div style="font-weight:700;color:var(--text);margin-bottom:4px;display:flex;gap:8px;align-items:center">
            <span style="cursor:pointer;font-size:14px;user-select:none" onclick="event.stopPropagation(); toggleFavoriteMaterial('${matId}','${escapeHtml(name)}')" title="Favoritt">${isFav?'⭐':'☆'}</span>
            ${escapeHtml(name)}
          </div>
          <div style="font-size:10px;color:var(--muted);display:flex;gap:12px;align-items:center">
            <span>${escapeHtml(item.unit||'stk')}</span>
            <span style="color:var(--accent);font-weight:600">${currency(item.cost||0)}</span>
            ${artnr?'<span style="color:var(--muted);cursor:pointer;display:flex;gap:4px;align-items:center" onclick="event.stopPropagation(); copyArtikkelNummer(\''+escapeHtml(artnr)+'\', this)">Art.nr: '+escapeHtml(artnr)+' 📋</span>':''}
          </div>
        </div>`;
      }).join('');
      dropdown.style.display='block';
      window._matAutocompleteActive={matId,idx:0};
      setMatAutocompleteActive(matId,0);
    };

    window.selectMat=function(matId,name){
      const row=document.querySelector('tr[data-mat-id="'+matId+'"]');
      const priceCatalogMap=window.buildPriceCatalogMap?window.buildPriceCatalogMap():{};
      const item=priceCatalogMap[name];
      if(!item) return;

      row.querySelector('.calcMatName').value=name;
      row.querySelector('.calcMatCost').value=(item.cost||0).toFixed(2);
      row.querySelector('.calcMatUnit').value=item.unit||'stk';

      document.querySelector('.matAutocomplete[data-mat-id="'+matId+'"]').style.display='none';
      recalcCalcMaterials();
    };

    window.selectMatByIndex=function(matId,idx){
      const dropdown=document.querySelector('.matAutocomplete[data-mat-id="'+matId+'"]');
      if(!dropdown) return;
      const items=dropdown.querySelectorAll('.matDropdownItem');
      if(items[idx]){
        const name=items[idx].dataset.name;
        if(name) selectMat(matId,name);
      }
    };

    window.setMatAutocompleteActive=function(matId,idx){
      const dropdown=document.querySelector('.matAutocomplete[data-mat-id="'+matId+'"]');
      if(!dropdown) return;
      const items=dropdown.querySelectorAll('.matDropdownItem');
      items.forEach((item,i)=>{
        if(i===idx){
          item.style.background='var(--accent-soft)';
          item.style.borderLeft='3px solid var(--accent)';
        } else {
          item.style.background='var(--card)';
          item.style.borderLeft='3px solid transparent';
        }
      });
      window._matAutocompleteActive={matId,idx};
    };

    // ── MATERIAL AUTOCOMPLETE ────────────────────────────────

        window.addCalcMaterial=function(){
      const result=window._lastCalcResult;
      if(!result) return;
      const p=getProject(currentProjectId);
      const calcMarkup=(p?.settings?.materialMarkup)||20;
      const newMat={matId:uid(),name:'',qty:1,cost:0,waste:0,markup:calcMarkup,unit:'stk',totalCost:0};
      result.materialsWithPrices.push(newMat);
      const tbody=document.getElementById('calcMaterialsTableBody');
      if(tbody){
        const newRow=document.createElement('tr');
        newRow.style.borderBottom='1px solid #eef2ff';
        newRow.dataset.matId=newMat.matId;
        newRow.innerHTML=`<td style="padding:8px;min-width:200px;position:relative">
          <input type="text" class="calcMatName" data-mat-id="${newMat.matId}" value="" placeholder="Søk materiale..." style="width:100%;padding:6px;border:1px solid #ddd;border-radius:6px;font-size:11px;cursor:pointer" onclick="openPriceSearchForCalc('${newMat.matId}')" readonly />
        </td>
        <td style="text-align:center;padding:8px">
          <input type="number" class="calcMatQty" data-mat-id="${newMat.matId}" value="1" step="0.1" min="0" style="width:55px;padding:6px;border:1px solid #ddd;border-radius:6px;font-size:11px;text-align:right" onchange="recalcCalcMaterials()" oninput="recalcCalcMaterials()" />
        </td>
        <td style="text-align:center;padding:8px">
          <select class="calcMatUnit" data-mat-id="${newMat.matId}" style="padding:6px;border:1px solid #ddd;border-radius:6px;font-size:11px;width:60px" onchange="recalcCalcMaterials()">
            ${['stk','lm','m2','m3','pk','rull','sett','kg','l'].map(u=>'<option value="'+u+'" '+(u==='stk'?'selected':'')+'> '+u+'</option>').join('')}
          </select>
        </td>
        <td style="text-align:center;padding:8px;color:var(--muted);font-size:11px" class="calcMatBrutto" data-mat-id="${newMat.matId}">1.0</td>
        <td style="text-align:right;padding:8px">
          <input type="number" class="calcMatCost" data-mat-id="${newMat.matId}" value="0.00" step="0.01" min="0" style="width:65px;padding:6px;border:1px solid #ddd;border-radius:6px;font-size:11px;text-align:right" onchange="recalcCalcMaterials()" oninput="recalcCalcMaterials()" />
        </td>
        <td style="text-align:center;padding:8px">
          <input type="number" class="calcMatWaste" data-mat-id="${newMat.matId}" value="0" step="1" min="0" max="100" style="width:50px;padding:6px;border:1px solid #ddd;border-radius:6px;font-size:11px;text-align:right" onchange="recalcCalcMaterials()" oninput="recalcCalcMaterials()" />
        </td>
        <td style="text-align:center;padding:8px">
          <input type="number" class="calcMatMarkup" data-mat-id="${newMat.matId}" value="${calcMarkup}" step="1" min="0" style="width:50px;padding:6px;border:1px solid #ddd;border-radius:6px;font-size:11px;text-align:right" onchange="recalcCalcMaterials()" oninput="recalcCalcMaterials()" />
        </td>
        <td style="text-align:right;padding:8px;font-weight:700;min-width:75px">
          <span class="calcMatRowTotal" data-mat-id="${newMat.matId}" style="color:#0a84ff">kr 0</span>
        </td>
        <td style="text-align:center;padding:8px">
          <button class="btn small" style="padding:4px 8px;font-size:10px;background:#ffebee;color:#c62828;border:1px solid #ef5350;border-radius:4px;cursor:pointer" onclick="deleteCalcMaterial('${newMat.matId}')">✕</button>
        </td>`;
        tbody.appendChild(newRow);
        newRow.querySelector('.calcMatName').focus();
      }
    };


    window.closeMatAutocomplete=function(matId){
      const dropdown=document.querySelector('.matAutocomplete[data-mat-id="'+matId+'"]');
      if(dropdown) dropdown.style.display='none';
    };

    window.handleMatKeydown=function(e,matId){
      const dropdown=document.querySelector('.matAutocomplete[data-mat-id="'+matId+'"]');
      if(!dropdown||dropdown.style.display==='none'){
        if(e.key==='Escape') return;
        return;
      }

      const active=window._matAutocompleteActive;
      const items=dropdown.querySelectorAll('.matDropdownItem');
      if(!items.length) return;

      if(e.key==='ArrowDown'){
        e.preventDefault();
        const nextIdx=Math.min((active?.idx||0)+1,items.length-1);
        setMatAutocompleteActive(matId,nextIdx);
      } else if(e.key==='ArrowUp'){
        e.preventDefault();
        const prevIdx=Math.max((active?.idx||0)-1,0);
        setMatAutocompleteActive(matId,prevIdx);
      } else if(e.key==='Enter'){
        e.preventDefault();
        selectMatByIndex(matId,active?.idx||0);
      } else if(e.key==='Escape'){
        closeMatAutocomplete(matId);
      }
    };

    window.calcMatRowTotal=function(m){
      const qty=Number(m.qty)||0;
      const cost=Number(m.cost)||0;
      const waste=Number(m.waste)||0;
      const markup=Number(m.markup)||0;
      return Math.round(qty*cost*(1+waste/100)*(1+markup/100));
    };

     window.recalcCalcMaterials=function(){
      const result=window._lastCalcResult;
      if(!result||!result.materialsWithPrices) return;
      const rows=Array.from(document.querySelectorAll('tr[data-mat-id]'));
      const newMaterials=[];
      rows.forEach(row=>{
        const matId=row.dataset.matId;
        const name=row.querySelector('.calcMatName')?.value||'';
        const qty=parseFloat(row.querySelector('.calcMatQty')?.value)||0;
        const cost=parseFloat(row.querySelector('.calcMatCost')?.value)||0;
        const waste=parseFloat(row.querySelector('.calcMatWaste')?.value)||0;
        const markup=parseFloat(row.querySelector('.calcMatMarkup')?.value)||0;
        const unit=row.querySelector('.calcMatUnit')?.value||'stk';
        const totalCost=Math.round(qty*cost*(1+waste/100)*(1+markup/100));
        newMaterials.push({matId,name,qty,cost,waste,markup,unit,totalCost});
        const totalSpan=row.querySelector('.calcMatRowTotal');
        if(totalSpan) totalSpan.textContent=currency(totalCost);
        const bruttoCell=row.querySelector('.calcMatBrutto');
        if(bruttoCell) bruttoCell.textContent=(waste>0?Math.ceil(qty*(1+waste/100)*10)/10:qty).toFixed(1);
      });
      result.materialsWithPrices=newMaterials;
      result.totalMatCost=newMaterials.reduce((s,m)=>s+(m.totalCost||0),0);
      const p=getProject(currentProjectId);
      const laborSaleEx=result.laborSaleEx;
      const totalSaleEx=laborSaleEx+result.totalMatCost;
      const laborCost=Math.round(result.directTimer*(p?.work.internalCost||450));
      const totalCost=laborCost+result.totalMatCost;
      const profit=totalSaleEx-totalCost;
      const margin=totalSaleEx>0?Math.round(profit/totalSaleEx*100):0;
      result.profit=profit; result.margin=margin; result.totalSaleEx=totalSaleEx; result.totalCost=totalCost;
      const matGridDiv=document.querySelector('div[style*="grid-template-columns:repeat(3"]');
      if(matGridDiv){
        matGridDiv.innerHTML=`<div><div style="font-size:11px;color:var(--muted);font-weight:700">🔨 Arbeid (eks. mva)</div><div style="font-size:16px;font-weight:800;color:#0a84ff;margin-top:2px">${currency(laborSaleEx)}</div></div>
          <div><div style="font-size:11px;color:var(--muted);font-weight:700">🪵 Materialer</div><div style="font-size:16px;font-weight:800;color:#167a42;margin-top:2px">${currency(result.totalMatCost)}</div></div>
          <div><div style="font-size:11px;color:var(--muted);font-weight:700">💰 Totalt (eks. mva)</div><div style="font-size:16px;font-weight:800;color:#2e7d32;margin-top:2px">${currency(totalSaleEx)}</div></div>`;
      }
      const marginDiv=document.querySelector('div[style*="background:#f0f7ff"][style*="margin"]');
      if(marginDiv){
        const marginValueEl=marginDiv.querySelector('div[style*="font-size:22px"]');
        const profitEl=marginDiv.querySelector('div[style*="font-size:10px"]');
        if(marginValueEl) marginValueEl.textContent=margin+'%';
        if(profitEl) profitEl.textContent='Fortjeneste: '+currency(profit);
      }
      result.sentToOffer=false;
      updateCalcSendButtonUI();
    };


    function parsePriceCsv(text){
      const rows = text.split(/\r?\n/).filter(Boolean);
      const catalog = [];
      rows.forEach(line => {
        const cols = line.split(';');
        if(cols.length < 8) return;
        const itemNo=(cols[0]||'').trim(), name=(cols[1]||'').trim(), desc=(cols[2]||'').trim();
        const regularPrice=parseNbNumber(cols[4]), discountPercent=parseNbNumber(cols[5]), userPrice=parseNbNumber(cols[6]);
        const unit=(cols[7]||'').trim();
        const fullText=`${name} ${desc}`.trim();
        if(!itemNo && !fullText) return;
        catalog.push({id:itemNo||uid(), itemNo, name:fullText||name||desc||'Uten navn', productName:name, description:desc, regularPrice, discountPercent, userPrice, unit});
      });
      return catalog;
    }

    function importPriceFile(file){
      const reader = new FileReader();
      reader.onload = e => {
        const catalog = parsePriceCsv(e.target.result||'');
        state.priceCatalog=catalog; state.priceFileName=file.name||'Prisfil';
        saveState(); renderProjectView();
        alert(`Prisfil lastet inn: ${catalog.length} varer.`);
      };
      reader.readAsText(file,'utf-8');
    }

    function clearPriceCatalog(){ state.priceCatalog=[]; state.priceFileName=''; saveState(); renderProjectView(); }

    function normalizeSearchText(str){
      return (str||'').toLowerCase().trim()
        .replace(/\s+/g,' ')
        .replace(/\b0+(\d)/g,'$1');           // 048x098 → 48x98
    }

    function searchPriceCatalog(query){
      const raw=(query||'').trim(); if(!raw) return [];
      const q=normalizeSearchText(raw);
      const words=q.split(/\s+/).filter(Boolean);
      if(!words.length) return [];

      const scored=[];
      state.priceCatalog.forEach(item=>{
        const name=normalizeSearchText(item.productName||item.name||'');
        const desc=normalizeSearchText(item.description||'');
        const itemNo=normalizeSearchText(item.itemNo||'');
        const full=name+' '+desc+' '+itemNo;

        // Check all words match somewhere
        const allMatch=words.every(w=>full.includes(w));
        if(!allMatch) return;

        let score=0;

        // Exact full query in text
        if(full.includes(q)) score+=100;

        // Name starts with full query
        if(name.startsWith(q)) score+=50;

        // Name starts with first search word (bonus)
        if(name.startsWith(words[0])) score+=15;

        // All words matched (base)
        score+=30;

        // Per-word bonus
        words.forEach(w=>{
          if(full.includes(w)) score+=10;
        });

        // Exact dimension match (e.g. 48x98)
        words.forEach(w=>{
          if(/\d+x\d+/.test(w) && full.includes(w)) score+=20;
        });

        // Exact itemNo match
        if(itemNo===q) score+=80;

        scored.push({item,score});
      });

      scored.sort((a,b)=>b.score-a.score);
      return scored.slice(0,20).map(s=>s.item);
    }

    function renderPriceSearchResults(query){
      const host=$('#priceSearchResults'); if(!host) return;
      const results=searchPriceCatalog(query);
      if(!query||!query.trim()){ host.innerHTML=''; return; }
      if(!state.priceCatalog.length){ host.innerHTML='<div class="empty">Last opp en prisfil for å søke i varer.</div>'; return; }
      if(!results.length){ host.innerHTML='<div class="empty">Ingen treff.</div>'; return; }
      host.innerHTML=results.map(item=>`
        <div class="item">
          <div>
            <h4>${escapeHtml(item.productName||item.name)}</h4>
            <p>${escapeHtml(item.description||'')}</p>
            <div class="pills" style="margin-top:8px">
              <span class="pill">Varenr: ${escapeHtml(item.itemNo)}</span>
              <span class="pill">Enhet: ${escapeHtml(item.unit||'-')}</span>
              <span class="pill">Din pris: ${currency(item.userPrice)}</span>
              ${item.regularPrice?`<span class="pill">Ord. pris: ${currency(item.regularPrice)}</span>`:''}
              ${item.discountPercent?`<span class="pill">Rabatt: ${item.discountPercent}%</span>`:''}
            </div>
          </div>
          <div class="inline-actions">
            <button class="btn small ${isFavoriteCatalog(item.id)?'success':'secondary'}" onclick="toggleFavoriteCatalog('${escapeHtml(item.id)}')">${isFavoriteCatalog(item.id)?'★ Favoritt':'☆ Legg til favoritt'}</button>
          </div>
        </div>
      `).join('');
    }

    function getCatalogItem(id){ return state.priceCatalog.find(x=>String(x.id)===String(id)); }
    function getFavoriteCatalogItems(){ return (state.favoriteCatalogIds||[]).map(getCatalogItem).filter(Boolean).slice(0,12); }
    function getRecentCatalogItems(){ return (state.recentCatalogIds||[]).map(getCatalogItem).filter(Boolean).slice(0,10); }
    function isFavoriteCatalog(id){ return (state.favoriteCatalogIds||[]).includes(String(id)); }

    function toggleFavoriteCatalog(id){
      const key=String(id); state.favoriteCatalogIds=state.favoriteCatalogIds||[];
      const item=getCatalogItem(id);
      const name=item?(item.name||item.productName||''):'';
      if(state.favoriteCatalogIds.includes(key)){
        state.favoriteCatalogIds=state.favoriteCatalogIds.filter(x=>x!==key);
        if(name) removeCalcFavorite(name);
      } else {
        state.favoriteCatalogIds.unshift(key);
        if(item) addCalcFavorite(name,item.unit||'stk',item.userPrice||0,item.itemNo||'');
      }
      state.favoriteCatalogIds=[...new Set(state.favoriteCatalogIds)].slice(0,30);
      saveState();
      // Update button in-place instead of re-rendering (preserves search panel)
      const isFav=state.favoriteCatalogIds.includes(key);
      const btns=document.querySelectorAll(`button[onclick="toggleFavoriteCatalog('${key}')"]`);
      btns.forEach(btn=>{
        btn.className=`btn small ${isFav?'success':'secondary'}`;
        btn.textContent=isFav?'★ Favoritt':'☆ Legg til favoritt';
      });
    }

    function rememberRecentCatalog(id){
      const key=String(id);
      state.recentCatalogIds=[key].concat((state.recentCatalogIds||[]).filter(x=>x!==key)).slice(0,20);
      saveState();
    }

    function renderQuickCatalogButtons(items, emptyText){
      if(!items.length) return `<div class="footer-note">${emptyText}</div>`;
      return items.map(item=>`
        <button class="package-btn" onclick="addCatalogMaterial('${escapeHtml(item.id)}')">
          ${escapeHtml(item.productName||item.name)}
          <small>Varenr: ${escapeHtml(item.itemNo||'-')} • ${escapeHtml(item.unit||'-')} • Din pris: ${currency(item.userPrice||0)}</small>
        </button>
      `).join('');
    }





    // Apply accent color from company settings
    if(state.company?.color){
      document.documentElement.style.setProperty('--blue', state.company.color);
    }



    function openProjectModal(){
      const p=blankProject();
      const opts=['<option value="">Velg kunde</option>'].concat(state.customers.map(c=>`<option value="${c.id}">${escapeHtml(c.name)}</option>`)).join('');
      showModal(`
        <div class="section-head"><div class="section-title">Nytt prosjekt</div><button class="btn small secondary" onclick="closeModal()">Lukk</button></div>
        <div class="row">
          <div><label>Prosjektnavn</label><input id="mPN" /></div>
          <div><label>Kunde</label><select id="mPC">${opts}</select></div>
        </div>
        <div class="row">
          <div><label>Adresse</label><input id="mPA" /></div>
          <div><label>Type jobb</label><select id="mPT"><option>Terrasse</option><option>Lettvegg</option><option>Vindu</option><option>Listing</option><option>Kledning</option><option>Etterisolering</option><option>Rehabilitering</option><option>Bad</option><option>Tak</option><option>Annet</option></select></div>
        </div>
        <div class="row">
          <div><label>Ønsket oppstart</label><select id="mPS"><option>Snarest</option><option>Innen 2 uker</option><option>Innen 1 måned</option><option>Etter avtale</option></select></div>
          <div><label>Status</label><select id="mPSt"><option>Utkast</option><option>Sendt</option><option>Vunnet</option><option>Tapt</option><option>Pågår</option><option>Ferdig</option></select></div>
        </div>
        <label>Beskrivelse</label><textarea id="mPD"></textarea>
        <div class="toolbar" style="margin-top:14px"><button class="btn primary" id="saveProjBtn">Opprett prosjekt</button></div>
      `);
      $('#mPC').addEventListener('change',()=>{ const cu=getCustomer($('#mPC').value); if($('#mPA')&&cu) $('#mPA').value=cu.address||''; });
      $('#saveProjBtn').onclick=()=>{
        p.name=$('#mPN').value.trim(); p.customerId=$('#mPC').value; p.address=$('#mPA').value.trim();
        if(!p.address&&p.customerId){const cu=getCustomer(p.customerId);if(cu)p.address=cu.address||'';}
        p.type=$('#mPT').value; p.startPref=$('#mPS').value; p.status=$('#mPSt').value; p.description=$('#mPD').value.trim();
        if(!p.name){alert('Skriv inn prosjektnavn.');return;}
        p.updatedAt=Date.now(); state.projects.unshift(p); saveState(); closeModal(); renderDashboard(); openProject(p.id);
      };
    }

    // Apply template: use itemNo for exact price lookup when available
    function applyTemplateById(tplId){
      const p=getProject(currentProjectId); if(!p) return;
      const tpl=getAllTemplates().find(t=>t.id===tplId); if(!tpl) return;
      const newMats=tpl.materials.map(m=>{
        let cost=0;
        if(m.itemNo && state.priceCatalog.length){
          const byItemNo=state.priceCatalog.find(x=>String(x.itemNo)===String(m.itemNo));
          cost=byItemNo?(byItemNo.userPrice||0):lookupPriceForMaterial(m.name);
        } else if(m.cost){
          cost=m.cost;
        } else {
          cost=lookupPriceForMaterial(m.name);
        }
        return {id:uid(), name:m.name, itemNo:m.itemNo||'', qty:m.qty||1, unit:m.unit||'stk', cost, waste:m.waste||0, markup:p.settings.materialMarkup};
      });
      p.materials=[...p.materials,...newMats];
      const matched=newMats.filter(m=>m.cost>0).length;
      persistAndRenderProject();
      if(matched<newMats.length&&state.priceCatalog.length){
        alert(`Mal "${tpl.name}" lagt til.\n${matched} av ${newMats.length} materialer fikk pris.\nSjekk oransje felt og fyll inn manglende priser.`);
      }
    }

    // Template editor modal with price catalog search
    function openTemplateModal(existing){
      const tpl=existing?{...existing,materials:existing.materials.map(m=>({...m}))}:{id:uid(),name:'',builtIn:false,materials:[]};
      window._editingTpl=tpl;

      function rows(){
        if(!tpl.materials.length) return '<div class="empty" style="padding:14px">Ingen materialer lagt til enda. Søk opp varer nedenfor.</div>';
        return tpl.materials.map((m,i)=>`
          <div style="display:grid;grid-template-columns:1fr auto auto;gap:8px;margin-bottom:8px;align-items:center;padding:10px;background:var(--bg-warm);border:1px solid var(--line);border-radius:12px">
            <div>
              <div style="font-weight:700;font-size:14px">${escapeHtml(m.name)}</div>
              <div style="font-size:12px;color:var(--muted);margin-top:2px">${m.itemNo?`Varenr: ${escapeHtml(m.itemNo)} • `:''}${escapeHtml(m.unit||'stk')}${m.cost?` • ${currency(m.cost)}`:'  • Pris fra prisfil ved bruk'}</div>
            </div>
            <input type="number" value="${m.waste||0}" placeholder="Svinn%" title="Svinn %" style="width:70px;padding:8px;font-size:13px;text-align:center" oninput="window._editingTpl.materials[${i}].waste=Number(this.value)" />
            <button class="btn small danger" onclick="tplRemoveRow(${i})" style="padding:8px">✕</button>
          </div>`).join('');
      }

      function searchRows(q){
        const results=searchPriceCatalog(q);
        const host=document.getElementById('tplSearchResults'); if(!host) return;
        if(!q.trim()){host.innerHTML='';return;}
        if(!state.priceCatalog.length){host.innerHTML='<div class="empty">Last opp prisfil for å søke.</div>';return;}
        if(!results.length){host.innerHTML='<div class="empty">Ingen treff.</div>';return;}
        host.innerHTML=results.map(item=>`
          <div class="item" style="padding:10px">
            <div>
              <div style="font-weight:700;font-size:13px">${escapeHtml(item.productName||item.name)}</div>
              <div style="font-size:12px;color:var(--muted)">${escapeHtml(item.itemNo||'')} • ${escapeHtml(item.unit||'-')} • ${currency(item.userPrice||0)}</div>
            </div>
            <button class="btn small primary" onclick="tplAddFromCatalog('${escapeHtml(item.id)}')">+ Legg til</button>
          </div>`).join('');
      }

      showModal(`
        <div class="section-head">
          <div class="section-title">${existing?'Rediger mal':'Ny mal'}</div>
          <button class="btn small secondary" onclick="closeModal()">Lukk</button>
        </div>
        <label>Malnavn</label>
        <input id="tplNameInput" value="${escapeAttr(tpl.name)}" placeholder="F.eks. Bad komplett" />

        <div style="margin-top:16px;padding:14px;background:#f0f7ff;border:1px solid #cde2ff;border-radius:14px">
          <label style="margin:0 0 8px">🔍 Søk i prisfil og legg til materialer</label>
          <input id="tplSearchInput" placeholder="Søk varenummer eller navn..." />
          <div id="tplSearchResults" class="list" style="margin-top:10px;max-height:220px;overflow-y:auto"></div>
        </div>

        <div style="margin-top:14px">
          <div style="font-weight:800;font-size:14px;margin-bottom:8px">Materialer i malen <span style="font-size:12px;color:var(--muted);font-weight:500">(svinn % kan endres per materiale)</span></div>
          <div id="tplRowsContainer">${rows()}</div>
        </div>

        <div class="toolbar" style="margin-top:16px">
          <button class="btn primary" id="saveTplBtn">Lagre mal</button>
          ${existing&&!existing.builtIn?`<button class="btn danger" onclick="deleteUserTemplate('${tpl.id}')">Slett mal</button>`:''}
        </div>
      `);

      document.getElementById('tplSearchInput').addEventListener('input', e=>searchRows(e.target.value));

      window.tplAddFromCatalog=(itemId)=>{
        const item=getCatalogItem(itemId); if(!item) return;
        window._editingTpl.materials.push({
          id:uid(), name:item.productName||item.name, itemNo:item.itemNo||'',
          unit:item.unit||'stk', cost:item.userPrice||0, waste:0
        });
        document.getElementById('tplRowsContainer').innerHTML=rows();
        const si=document.getElementById('tplSearchInput');
        if(si){si.value=''; document.getElementById('tplSearchResults').innerHTML='';}
      };

      window.tplRemoveRow=(i)=>{ window._editingTpl.materials.splice(i,1); document.getElementById('tplRowsContainer').innerHTML=rows(); };

      $('#saveTplBtn').onclick=()=>{
        const name=$('#tplNameInput').value.trim();
        if(!name){alert('Skriv inn malnavn.');return;}
        window._editingTpl.name=name;
        if(!window._editingTpl.materials.length){alert('Legg til minst ett materiale.');return;}
        state.userTemplates=state.userTemplates||[];
        const idx=state.userTemplates.findIndex(t=>t.id===window._editingTpl.id);
        if(idx>-1) state.userTemplates[idx]=window._editingTpl; else state.userTemplates.push(window._editingTpl);
        saveState(); closeModal(); renderProjectView();
      };
    }

    function deleteUserTemplate(id){
      if(!confirm('Slette denne malen?')) return;
      state.userTemplates=(state.userTemplates||[]).filter(t=>t.id!==id);
      saveState(); closeModal(); renderProjectView();
    }

    function addSubcontractor(){
      const p=getProject(currentProjectId); if(!p) return;
      p.extras.subcontractors=p.extras.subcontractors||[];
      p.extras.subcontractors.push({id:uid(), trade:'Rørlegger', amount:0});
      persistAndRenderProject();
    }
    function removeSubcontractor(id){
      const p=getProject(currentProjectId); if(!p) return;
      p.extras.subcontractors=(p.extras.subcontractors||[]).filter(s=>s.id!==id);
      persistAndRenderProject();
    }
    function updSubcontractor(id,key,val){
      const p=getProject(currentProjectId); if(!p) return;
      const s=(p.extras.subcontractors||[]).find(x=>x.id===id); if(!s) return;
      s[key]=key==='amount'?(parseVatInput(p,val)):val;
      persistAndUpdate();
    }
    // ---- CALC POST MODAL ----
    function renderCalcModal(){
      const p=getProject(currentProjectId);
      const mats=window._cpm||[];

      function matTotal(){
        return mats.reduce((s,m)=>{
          const base=(Number(m.qty)||1)*(Number(m.cost)||0)*(1+(Number(m.waste)||0)/100);
          return s+base*(1+(Number(m.markup)||0)/100);
        },0);
      }

      const pctOpts=[0,5,8,10,12,15,20,25,30];

      const rows=mats.length ? mats.map((m,i)=>{
        const rowBg=m.groupColor?(m.groupColor+'18'):(m.cost===0?'var(--yellow-soft)':'var(--bg-warm)');
        const rowBorder=m.groupColor?(m.groupColor+'40'):(m.cost===0?'rgba(196,162,58,.2)':'var(--line)');
        return `
        <div style="display:grid;grid-template-columns:1fr 64px 64px 72px 68px 68px 32px;gap:5px;align-items:center;padding:8px;background:${rowBg};border:1px solid ${rowBorder};border-radius:12px;margin-bottom:5px${m.groupColor?';border-left:3px solid '+m.groupColor:''}">
          <div>
            <input value="${escapeAttr(m.name||'')}" placeholder="Materialenavn..." style="font-weight:700;font-size:13px;border:1px solid var(--line);border-radius:9px;padding:6px;width:100%" onchange="window._cpm[${i}].name=this.value" />
            ${m.groupName?`<div style="font-size:10px;color:${m.groupColor||'var(--muted)'};margin-top:1px">${escapeHtml(m.groupName)}</div>`:''}
            ${m.itemNo?`<div style="font-size:11px;color:var(--muted)">🔖 ${escapeHtml(m.itemNo)}</div>`:''}
          </div>
          <input type="number" value="${m.qty||1}" title="Antall" style="padding:6px;font-size:13px;text-align:center;border:1px solid var(--line);border-radius:9px;width:100%" onchange="window._cpm[${i}].qty=Number(this.value);rerenderCalcModal()" />
          <input value="${escapeHtml(m.unit||'stk')}" title="Enhet" style="padding:6px;font-size:13px;border:1px solid var(--line);border-radius:9px;width:100%" onchange="window._cpm[${i}].unit=this.value" />
          <input type="number" value="${m.cost||0}" title="Innpris" style="padding:6px;font-size:13px;text-align:right;border:1px solid var(--line);border-radius:9px;width:100%" onchange="window._cpm[${i}].cost=Number(this.value);rerenderCalcModal()" />
          <select title="Svinn %" style="padding:6px;font-size:13px;border:1px solid var(--line);border-radius:9px;width:100%" onchange="window._cpm[${i}].waste=Number(this.value);rerenderCalcModal()">
            ${pctOpts.map(v=>`<option value="${v}" ${(m.waste||0)==v?'selected':''}>${v}%</option>`).join('')}
          </select>
          <select title="Påslag %" style="padding:6px;font-size:13px;border:1px solid var(--line);border-radius:9px;width:100%" onchange="window._cpm[${i}].markup=Number(this.value);rerenderCalcModal()">
            ${pctOpts.map(v=>`<option value="${v}" ${(m.markup||20)==v?'selected':''}>${v}%</option>`).join('')}
          </select>
          <button style="border:none;background:var(--red-soft);color:var(--red);border-radius:8px;padding:6px 8px;cursor:pointer;font-size:12px;width:100%" onclick="window._cpm.splice(${i},1);rerenderCalcModal()">✕</button>
        </div>`;
      }).join('')
        : '<div class="empty">Ingen materialer enda.</div>';

      const searchResults=window._cpmSearch ? searchPriceCatalog(window._cpmSearch) : [];
      const searchHtml = window._cpmSearch ? (
        searchResults.length
          ? searchResults.map(item=>`
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 10px;background:var(--card);border:1px solid var(--line);border-radius:10px;margin-bottom:5px">
              <div>
                <div style="font-weight:700;font-size:13px">${escapeHtml(item.productName||item.name)}</div>
                <div style="font-size:11px;color:var(--muted)">${escapeHtml(item.itemNo||'')} • ${escapeHtml(item.unit||'-')} • ${currency(item.userPrice||0)}</div>
              </div>
              <button class="btn small primary" onclick="addFromCatalogToCalcModal('${escapeHtml(item.id)}')">+ Legg til</button>
            </div>`).join('')
          : '<div class="empty" style="padding:10px">Ingen treff.</div>'
      ) : '';

      const postId=window._cpmPostId;
      const offerPost=postId&&getProject(currentProjectId)?.offerPosts?.find(x=>x.id===postId);
      const calcHours=offerPost?.snapshotCompute?.hoursTotal||0;
      const currentHours=offerPost?Number(offerPost.hours)||calcHours:0;
      const laborGrps=offerPost&&offerPost.laborGroups&&offerPost.laborGroups.length?offerPost.laborGroups:null;
      const laborGroupsHtml=laborGrps?laborGrps.map((g,gi)=>`
        <div style="background:${g.groupColor+'18'};border:1px solid ${g.groupColor+'40'};border-left:3px solid ${g.groupColor};border-radius:12px;padding:12px;margin-bottom:8px;display:flex;align-items:center;gap:16px">
          <div style="flex:1">
            <div style="font-size:13px;font-weight:800;margin-bottom:2px;color:${g.groupColor}">⏱️ Timer ${escapeHtml(g.groupName)}</div>
            <div style="font-size:12px;color:var(--muted)">Beregnet: ${g.hours||0}t</div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:center;gap:4px">
            <button onclick="adjustLaborGroupHours(${gi},1)" style="border:none;background:${g.groupColor+'30'};border-radius:8px;padding:4px 12px;cursor:pointer;font-size:16px;font-weight:800;width:100%">▲</button>
            <div id="laborGroupHours_${gi}" style="font-size:28px;font-weight:800;color:${g.groupColor};min-width:70px;text-align:center">${g.hours||0}</div>
            <button onclick="adjustLaborGroupHours(${gi},-1)" style="border:none;background:${g.groupColor+'30'};border-radius:8px;padding:4px 12px;cursor:pointer;font-size:16px;font-weight:800;width:100%">▼</button>
          </div>
          <div style="font-size:12px;color:var(--muted)">timer</div>
        </div>`).join(''):'';

      const html=`
        <div class="section-head">
          <div class="section-title">✏️ Tilpass post</div>
          <button class="btn small secondary" onclick="closeModal()">Lukk</button>
        </div>
        ${laborGrps?`
        <div style="font-size:12px;font-weight:700;color:var(--muted);margin-bottom:6px;text-transform:uppercase;letter-spacing:.04em">Arbeid per gruppe</div>
        ${laborGroupsHtml}
        <div style="padding:8px 12px;background:#f5f8ff;border-radius:10px;border:1px solid #dce8ff;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:12px;font-weight:700;color:var(--muted)">Sum timer</span>
          <span id="laborGroupTotalHours" style="font-size:16px;font-weight:800">${laborGrps.reduce((s,g)=>s+(g.hours||0),0)}t</span>
        </div>
        `:(offerPost?`
        <div style="background:var(--yellow-soft);border:1px solid rgba(196,162,58,.2);border-radius:12px;padding:12px;margin-bottom:12px;display:flex;align-items:center;gap:16px">
          <div style="flex:1">
            <div style="font-size:13px;font-weight:800;margin-bottom:2px">⏱️ Timer for denne posten</div>
            <div style="font-size:12px;color:var(--muted)">${calcHours?'Kalkyle beregnet: '+calcHours+'t':''}</div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:center;gap:4px">
            <button onclick="adjustModalHours(1)" style="border:none;background:#fde68a;border-radius:8px;padding:4px 12px;cursor:pointer;font-size:16px;font-weight:800;width:100%">▲</button>
            <div id="postHoursDisplay" style="font-size:28px;font-weight:800;color:#a96800;min-width:70px;text-align:center">${currentHours||calcHours||0}</div>
            <button onclick="adjustModalHours(-1)" style="border:none;background:#fde68a;border-radius:8px;padding:4px 12px;cursor:pointer;font-size:16px;font-weight:800;width:100%">▼</button>
          </div>
          <div style="font-size:12px;color:var(--muted)">timer<br><span style="font-size:10px">Fra kalkyle: ${calcHours||0}t</span></div>
        </div>`:``)}



        <div style="background:#f0f7ff;border:1px solid #cde2ff;border-radius:14px;padding:12px;margin-bottom:14px">
          <label style="margin:0 0 6px">🔍 Søk i prisfil og legg til</label>
          <input id="calcModalSearch" placeholder="Søk varenummer eller navn..." value="${escapeAttr(window._cpmSearch||'')}"
            oninput="window._cpmSearch=this.value;rerenderCalcModal()" style="margin:0" />
          <div style="margin-top:8px;max-height:180px;overflow-y:auto">${searchHtml}</div>
        </div>

        <div style="font-size:12px;color:var(--muted);margin-bottom:8px">Ant. • Enhet • Innpris • Svinn% • Påslag%</div>
        <div id="calcMatRows">${rows}</div>
        <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">
          <button class="btn small soft" onclick="addBlankToCalcModal()">+ Tom rad</button>
          <div class="fav-dropdown-wrap" style="position:relative">
            <button class="btn small soft" onclick="toggleFavDropdown('favDropdownModal')">⭐ Favoritter</button>
            <div id="favDropdownModal" class="fav-dropdown hidden"></div>
          </div>
        </div>

        <div style="margin-top:14px;padding:12px 16px;background:#f5f8ff;border-radius:14px;border:1px solid #dce8ff;display:flex;justify-content:space-between;align-items:center">
          <div style="font-size:13px;font-weight:700;color:var(--muted)">Materialsum (salgsverdi)</div>
          <div style="font-size:22px;font-weight:800;color:var(--blue)">${currency(matTotal())}</div>
        </div>
        <div class="toolbar" style="margin-top:14px">
          <button class="btn primary" onclick="saveCalcPostMaterials()">💾 Lagre og oppdater tilbud</button>
          <button class="btn secondary" onclick="closeModal()">Avbryt</button>
        </div>`;

      showModal(html);
      // Re-focus search if it was active
      const si=document.getElementById('calcModalSearch');
      if(si && window._cpmSearch){ si.focus(); si.setSelectionRange(si.value.length,si.value.length); }
    }

    function rerenderCalcModal(){ renderCalcModal(); }
    window.rerenderCalcModal=rerenderCalcModal;

    window.addBlankToCalcModal=function(){
      window._cpm.push({id:(Math.random().toString(36).slice(2,10)),name:'',qty:1,unit:'stk',cost:0,waste:0,markup:20});
      rerenderCalcModal();
      setTimeout(()=>{
        const rows=document.querySelectorAll('#calcMatRows > div');
        const last=rows[rows.length-1];
        if(last){ const inp=last.querySelector('input'); if(inp){ inp.focus(); inp.placeholder='Skriv materialenavn...'; } }
      },50);
    };

    window.adjustTotalHours=function(delta){
      const p=getProject(currentProjectId); if(!p) return;
      const c=compute(p);
      // Use current displayed totalHours as base, store in hoursOverride
      const current=Number(p.work.hoursOverride)>0 ? Number(p.work.hoursOverride) : c.totalHours;
      p.work.hoursOverride=Math.max(0, current+delta);
      persistAndUpdate();
    };

    // ── OFFER VIEW STATE ─────────────────────────────────────────────────────
        function initOfferPreviewTab(p){
      if(!p) return;
      _offerState.texts.innledning = _offerState.texts.innledning || (p.description||'');
      _offerState.texts.fremdrift = _offerState.texts.fremdrift || ('Planlagt oppstart: '+(p.startPref||'Etter avtale')+'\nOppstart og ferdigstillelse er estimert og kan påvirkes av værforhold, leveranser og uforutsette forhold.');
      _offerState.texts.forbehold = _offerState.texts.forbehold || ('Tilbudet er gyldig i '+(p.offer&&p.offer.validity?p.offer.validity:'14')+' dager fra tilbudsdato, dersom annet ikke er avtalt.');
      // Init arbeidsomfang from offer posts
      if(!_offerState.arbeidsomfangPosts.length && p.offerPosts&&p.offerPosts.length){
        _offerState.arbeidsomfangPosts = p.offerPosts.map(function(post){
          return {id:post.id, name:post.name, checked:true};
        });
      }
      // Init customPosts for postervisning
      if(!_offerState.customPosts.length && p.offerPosts&&p.offerPosts.length){
        _offerState.customPosts = p.offerPosts.map(function(post){
          return {id:uid(), name:post.name, price:post.price||0, sourceIds:[post.id]};
        });
      }
      // Build extra posts from prosjektkostnader + innleid
      rebuildExtraPosts(p);
      renderOfferEditorPane();
      renderOfferPreview();
    }

        window.openOfferView=function(){
      const p=getProject(currentProjectId); if(!p) return;
      // Init texts from project offer data
      _offerState.texts.innledning = p.description||'';
      _offerState.texts.arbeidsomfang = p.offer&&p.offer.included?p.offer.included:'';
      _offerState.texts.ikkemedregnet = p.offer&&p.offer.excluded?p.offer.excluded:'- Elektrikerarbeider\n- Rørleggerarbeider\n- Maling og sparkling\n- Byggesøknad og prosjektering';
      _offerState.texts.fremdrift = 'Planlagt oppstart: '+(p.startPref||'Etter avtale')+'\nOppstart og ferdigstillelse er estimert og kan påvirkes av værforhold, leveranser og uforutsette forhold.';
      _offerState.texts.forbehold = 'Tilbudet er basert på dagens priser på materialer og lønn. Det tas forbehold om prisendringer fra leverandører eller uforutsette forhold utenfor entreprenørens kontroll.\n\nTilbudet er gyldig i '+(p.offer&&p.offer.validity?p.offer.validity:'14 dager')+' fra tilbudsdato, dersom annet ikke er avtalt.';
      // Init custom posts from offer posts
      if(!_offerState.customPosts.length && p.offerPosts&&p.offerPosts.length){
        _offerState.customPosts = p.offerPosts.map(function(post){
          return {id:uid(), name:post.name, price:post.price||0, sourceIds:[post.id]};
        });
      }
      // Show view
      $('#projectView').classList.add('hidden');
      $('#offerView').classList.remove('hidden');
      $('#offerViewTitle').textContent = 'Tilbud — '+(p.name||'');
      renderOfferEditor();
      renderOfferPreview();
    };

    document.getElementById('backFromOfferBtn')&&document.getElementById('backFromOfferBtn').addEventListener('click',function(){
      $('#offerView').classList.add('hidden');
      $('#projectView').classList.remove('hidden');
    });

    window.setOfferPostMode=function(mode){
      _offerState.postMode=mode;
      document.getElementById('customPostEditor').style.display=mode==='custom'?'':'none';
      renderOfferPreview();
      if(mode==='custom') renderCustomPostEditor();
    };

    function renderCustomPostEditor(){
      const p=getProject(currentProjectId); if(!p) return;
      const el=document.getElementById('customPostEditor'); if(!el) return;
      const posts=p.offerPosts||[];
      el.innerHTML='<div style="font-size:11px;color:var(--muted);margin-bottom:8px">Slå sammen poster og gi nye navn:</div>'
        +_offerState.customPosts.map(function(cp,i){
          return '<div style="display:flex;gap:6px;align-items:center;margin-bottom:6px">'
            +'<input value="'+escapeAttr(cp.name)+'" style="flex:1;font-size:12px;padding:6px 8px" oninput="_offerState.customPosts['+i+'].name=this.value;renderOfferPreview()" />'
            +'<button onclick="removeCustomPost('+i+')" style="border:none;background:var(--red-soft);color:var(--red);border-radius:6px;padding:6px 8px;cursor:pointer;font-size:12px">✕</button>'
            +'</div>';
        }).join('')
        +'<button class="btn small soft" style="width:100%;margin-top:4px" onclick="mergeAllCustomPosts()">Slå sammen alle til én</button>';
    }

    window.removeCustomPost=function(idx){
      _offerState.customPosts.splice(idx,1);
      renderCustomPostEditor();
      renderOfferPreview();
    };

    window.mergeAllCustomPosts=function(){
      const p=getProject(currentProjectId); if(!p) return;
      const total=_offerState.customPosts.reduce(function(s,cp){return s+cp.price;},0);
      _offerState.customPosts=[{id:uid(),name:p.name||'Tilbudssum',price:total,sourceIds:[]}];
      renderCustomPostEditor();
      renderOfferPreview();
    };

    function renderOfferEditor(){
      // Section toggles
      const toggleEl=document.getElementById('sectionToggles'); if(!toggleEl) return;
      const sectionLabels={
        innledning:'Innledning', grunnlag:'Grunnlag for tilbudet',
        arbeidsomfang:'Arbeidsomfang', ikkemedregnet:'Ikke medregnet',
        prisogbetaling:'Pris og betaling', fremdrift:'Fremdrift', forbehold:'Forbehold'
      };
      toggleEl.innerHTML=Object.keys(sectionLabels).map(function(key){
        return '<label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer">'
          +'<input type="checkbox" style="width:auto" '+((_offerState.sections[key])?'checked':'')+' onchange="_offerState.sections.'+key+'=this.checked;renderOfferPreview()" />'
          +sectionLabels[key]+'</label>';
      }).join('');

      // Editable text fields
      const textEl=document.getElementById('offerTextFields'); if(!textEl) return;
      const editableLabels={
        innledning:'Innledning', arbeidsomfang:'Inkludert i tilbudet',
        ikkemedregnet:'Ikke inkludert'
      };
      textEl.innerHTML=Object.keys(editableLabels).map(function(key){
        return '<div><label style="font-size:11px;font-weight:700;color:var(--muted)">'
          +editableLabels[key]+'</label>'
          +'<textarea style="font-size:12px;min-height:70px;margin-top:4px" oninput="_offerState.texts.'+key+'=this.value;renderOfferPreview()">'+escapeHtml(_offerState.texts[key]||'')+'</textarea></div>';
      }).join('');

      renderFreeSectionList();
    }

    window.addFreeSection=function(){
      _offerState.freeSections.push({id:uid(),title:'Ny seksjon',text:''});
      renderFreeSectionList();
      renderOfferPreview();
    };

    function renderFreeSectionList(){
      const el=document.getElementById('freeSectionList'); if(!el) return;
      el.innerHTML=_offerState.freeSections.map(function(sec,i){
        return '<div style="background:#f8f9fc;border:1px solid var(--line);border-radius:10px;padding:8px">'
          +'<div style="display:flex;gap:6px;margin-bottom:6px">'
          +'<input value="'+escapeAttr(sec.title)+'" placeholder="Tittel" style="flex:1;font-size:12px;padding:5px 8px;font-weight:700" oninput="_offerState.freeSections['+i+'].title=this.value;renderOfferPreview()" />'
          +'<button onclick="_offerState.freeSections.splice('+i+',1);renderFreeSectionList();renderOfferPreview()" style="border:none;background:var(--red-soft);color:var(--red);border-radius:6px;padding:5px 8px;cursor:pointer;font-size:12px">✕</button>'
          +'</div>'
          +'<textarea style="font-size:12px;min-height:60px" placeholder="Tekst..." oninput="_offerState.freeSections['+i+'].text=this.value;renderOfferPreview()">'+escapeHtml(sec.text||'')+'</textarea>'
          +'</div>';
      }).join('');
    }




        window.openOfferFullPreview=function(){
      const doc=document.getElementById('offerPreviewDoc'); if(!doc) return;
      const co=state.company||{};
      const color=co.color||'#2e75b6';
      var css=getOfferCSS(color);
      var html='<!DOCTYPE html><html lang="no"><head><meta charset="UTF-8"><title>Tilbud</title><style>'+css
        +'body{padding:30px 40px}@media print{.no-print{display:none!important}}'
        +'</style></head><body>'
        +'<div style="text-align:center;margin-bottom:20px" class="no-print">'
        +'<button onclick="window.print()" style="background:'+color+';color:#fff;border:none;border-radius:6px;padding:12px 32px;font-size:14px;font-weight:700;cursor:pointer">🖨️ Skriv ut / Lagre som PDF</button>'
        +'</div>'
        +doc.innerHTML+'</body></html>';
      var blob=new Blob([html],{type:'text/html'});
      var url=URL.createObjectURL(blob);
      window.open(url,'_blank');
      setTimeout(function(){URL.revokeObjectURL(url);},30000);
    };

    window.downloadOfferPDF=function(){
      const p=getProject(currentProjectId); if(!p) return;
      const doc=document.getElementById('offerPreviewDoc'); if(!doc) return;
      const co=state.company||{};
      const color=co.color||'#2e75b6';
      var css=getOfferCSS(color);
      var html='<!DOCTYPE html><html lang="no"><head><meta charset="UTF-8"><title>Tilbud</title><style>'+css
        +'body{padding:30px 40px}@media print{.no-print{display:none!important}}'
        +'</style></head><body>'
        +doc.innerHTML+'</body></html>';
      var blob=new Blob([html],{type:'text/html'});
      var url=URL.createObjectURL(blob);
      var name=(p.name||'prosjekt').replace(/[^\wæøåÆØÅ0-9-]/g,'_');
      var a=document.createElement('a');
      a.href=url;
      a.download='Tilbud_'+name+'.html';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function(){URL.revokeObjectURL(url);},30000);
    };

    window.sendOfferNow=function(){
      const p=getProject(currentProjectId); if(!p) return;
      const cust=getCustomer(p.customerId);
      const co=state.company||{};
      const toEmail=cust&&cust.email?cust.email:'';
      const subject='Tilbud - '+(p.name||'Prosjekt')+(co.name?' - '+co.name:'');
      const body=
        'Hei,\n\n'
        +'Vedlagt finner du tilbud på '+(p.name||'prosjekt')+'.\n\n'
        +'Gi gjerne tilbakemelding dersom du har spørsmål.\n\n'
        +'Mvh\n'
        +(co.name||'');
      const mailtoLink=
        'mailto:'+encodeURIComponent(toEmail)
        +'?subject='+encodeURIComponent(subject)
        +'&body='+encodeURIComponent(body);

      openOfferFullPreview();

      setTimeout(function(){
        window.location.href=mailtoLink;
      },1000);
    };

    window.printOffer=function(){
      openOfferFullPreview();
    };




        window.generateOfferPDF=function(){
      const p=getProject(currentProjectId); if(!p) return;
      const cust=getCustomer(p.customerId);
      const cv=compute(p);
      const ps=computeOfferPostsTotal(p);
      const co=state.company||{};
      const color=co.color||'#2e75b6';
      const today=new Date().toLocaleDateString('nb-NO');
      const validity=p.offer&&p.offer.validity?p.offer.validity:'14 dager';
      function fmt(n){return Math.round(n||0).toLocaleString('nb-NO')+' kr';}
      function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
      function nl(s){return esc(s||'').replace(/\n/g,'<br>');}

      // Price rows
      var priceRows='';
      if(p.offerPosts&&p.offerPosts.length){
        p.offerPosts.filter(function(post){return post.type!=='option'||post.enabled;}).forEach(function(post){
          priceRows+='<tr><td class="dc"><b>'+esc(post.name||'')+'</b>'+(post.description?'<br><span style="font-size:10pt;color:#555">'+esc(post.description)+'</span>':'')+(post.type==='option'?'<span style="font-size:9pt;color:#a96800;margin-left:6px">(opsjon)</span>':'')+'</td><td class="ac">'+fmt(post.price||0)+'</td></tr>';
        });
      } else {
        priceRows='<tr><td class="dc"><b>Tomrerarbeider</b><br><span style="font-size:10pt;color:#555">'+cv.totalHours+' timer</span></td><td class="ac">'+fmt(cv.totalLaborSaleEx)+'</td></tr>';
        if(cv.totalMatSaleEx>0) priceRows+='<tr><td class="dc"><b>Materialer</b></td><td class="ac">'+fmt(cv.totalMatSaleEx)+'</td></tr>';
        if(cv.extrasBase+cv.rigEx>0) priceRows+='<tr><td class="dc"><b>Rigg og drift</b></td><td class="ac">'+fmt(cv.extrasBase+cv.rigEx)+'</td></tr>';
      }
      var totalEx=p.offerPosts&&p.offerPosts.length?ps.total:cv.totalSaleEx;
      var totalInc=Math.round(totalEx*1.25);
      var mva=Math.round(totalEx*0.25);

      // Logo: use uploaded logo from settings, or fallback
      var logoSrc=co.logo||window._fallbackLogo||'';
      var logoHtml=logoSrc?'<div style="width:350px;height:140px;display:flex;align-items:center"><img src="'+logoSrc+'" style="max-width:100%;max-height:100%;object-fit:contain"></div>':'';
      // Company block
     var coBlock=
  (co.name?'<strong style="display:block;margin-bottom:4px">'+esc(co.name)+'</strong>':'')
  +(co.address?'<div>'+esc(co.address)+'</div>':'')
  +((co.zip||co.city)?'<div>'+ (esc(co.zip||'')+' '+esc(co.city||'')).trim() +'</div>':'')
  +(co.phone?'<div>Tlf: '+esc(co.phone)+'</div>':'')
  +(co.email?'<div>'+esc(co.email)+'</div>':'')
  +(co.orgNr?'<div>Org.nr: '+esc(co.orgNr)+'</div>':'');

      var custBlock=(cust?esc(cust.name):'NAVN')+'<br>'
        +(cust&&cust.phone?esc(cust.phone)+'<br>':'')
        +(p.address?esc(p.address)+'<br>':'')
        +(cust&&cust.email?esc(cust.email):'');

      var c1=color;
      var css='*{box-sizing:border-box;margin:0;padding:0}'
        +'body{font-family:Calibri,Arial,sans-serif;color:#000;font-size:11pt;line-height:1.5}'
        +'.page{max-width:800px;margin:0 auto;padding:30px 40px 50px}'
        +'.hdr{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}'
        +'.co{text-align:left;font-size:10.5pt;line-height:1.5}'
        +'.co strong{font-size:11.5pt;display:block}'
        +'.divider{border:none;border-top:2.5px solid '+c1+';margin:10px 0 24px}'
        +'.boxes{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:32px}'
        +'.box{border:2.5px solid '+c1+';padding:16px 18px;font-size:10.5pt;line-height:2.1;min-height:90px;border-radius:4px}'
        +'.title{font-size:26pt;font-weight:700;margin-bottom:18px}'
        +'.mt{width:100%;border-collapse:collapse;margin-bottom:20px}'
        +'.mt .hr th{background:'+c1+';color:#fff;padding:8px 12px;text-align:left;font-size:10pt;font-weight:600}'
        +'.mt .hr th.ac{text-align:right}'
        +'.mt td{padding:7px 12px;border-bottom:1px solid #e8e8e8;font-size:10.5pt;vertical-align:top}'
        +'.mt tr:nth-child(odd) td{background:#f4f8fd}'
        +'.mt tr:nth-child(even) td{background:#fff}'
        +'.dc{width:65%}'
        +'.ac{text-align:right;font-weight:700;white-space:nowrap}'
        +'.sum-row td{border-top:1.5px solid #aaa;font-weight:700;background:#f4f8fd!important}'
        +'.mva-row td{color:#666;font-size:10pt;background:#fff!important}'
        +'.total-row td{background:'+c1+'!important;color:#fff!important;font-weight:800;font-size:12pt;padding:10px 12px}'
        +'.sec{margin-bottom:16px}'
        +'.sec h3{font-size:10.5pt;font-weight:700;text-transform:uppercase;margin-bottom:5px}'
        +'.sec p{font-size:10.5pt;line-height:1.65;color:#222;margin-bottom:6px}'
        +'.print-btn{display:block;margin:28px auto 0;background:'+c1+';color:#fff;border:none;border-radius:6px;padding:13px 36px;font-size:14px;font-weight:700;cursor:pointer}'
        +'@media print{.print-btn{display:none!important}.page{padding:20px 30px}}';

      var body='<div class="page">'
        +'<div class="hdr">'+logoHtml+'<div class="co">'+coBlock+'</div></div>'
        +'<hr class="divider">'
        +'<div class="boxes"><div class="box">'+custBlock+'</div><div class="box">Deres ref.<br><br>Dato: '+today+'<br>Prosjekt: '+esc(p.name||'')+'</div></div>'
        +'<div class="title">TILBUD</div>'
        +'<table class="mt"><thead><tr class="hr"><th class="dc">BESKRIVELSE</th><th class="ac">SUM eks mva</th></tr></thead><tbody>'
        +priceRows
        +'<tr class="mva-row"><td class="dc">MVA 25%</td><td class="ac">'+fmt(mva)+'</td></tr>'
        +'<tr class="sum-row"><td class="dc">Sum eks. mva</td><td class="ac">'+fmt(totalEx)+'</td></tr>'
        +'<tr class="total-row"><td class="dc">TOTALPRIS INKL. MVA</td><td class="ac">'+fmt(totalInc)+'</td></tr>'
        +'</tbody></table>'
        +'<div class="sec"><h3>Innledning</h3><p>Tilbudet gjelder tomrerarbeider i forbindelse med '+esc(p.name||'')+'. '+esc(p.description||'Arbeidet utfores iht. befaring og avtalt omfang.')+'</p></div>'
        +'<div class="sec"><h3>Grunnlag for tilbudet</h3><p>Tilbudet er basert pa befaring, mottatte tegninger og normale arbeidsforhold.</p></div>'
        +'<div class="sec"><h3>Arbeidsomfang</h3><p>'+nl(p.offer&&p.offer.included?p.offer.included:'Folgende arbeid er inkludert i tilbudet:')+'</p></div>'
        +'<div class="sec"><h3>Ikke medregnet i tilbudet</h3><p>'+nl(p.offer&&p.offer.excluded?p.offer.excluded:'- Elektrikerarbeider\n- Rorleggerarbeider\n- Maling og sparkling\n- Byggesoknad og prosjektering')+'</p></div>'
        +'<div class="sec"><h3>Pris og betaling</h3><p>Arbeidet utfores til avtalt fastpris eller etter medgatt tid og materialer. Betalingsfrist er 10 dager netto.</p>'
        +'<p>Timepris tomrer: kr '+Math.round(p.work.timeRate||850)+' eks. mva pr time</p>'
        +'<p>- Paslag pa materiell: '+(p.settings.materialMarkup||15)+'%</p></div>'
        +'<div class="sec"><h3>Fremdrift</h3><p>Planlagt oppstart: '+esc(p.startPref||'Etter avtale')+'<br>Oppstart er estimert og kan pavirkes av vaerforhold og leveranser.</p></div>'
        +'<div class="sec"><h3>Forbehold</h3><p>Tilbudet er basert pa dagens priser. Tilbudet er gyldig i <strong>'+esc(validity)+'</strong> fra tilbudsdato.</p></div>'
        +(p.note?'<div class="sec"><h3>Notat</h3><p>'+nl(p.note)+'</p></div>':'')
        +'</div>'
        +'<button class="print-btn" onclick="window.print()">Skriv ut / Lagre som PDF</button>';

      var html='<!DOCTYPE html><html lang="no"><head><meta charset="UTF-8"><title>Tilbud</title><style>'+css+'</style></head><body>'+body+'</body></html>';
      var blob=new Blob([html],{type:'text/html'});
      var url=URL.createObjectURL(blob);
      var win=window.open(url,'_blank');
      setTimeout(function(){URL.revokeObjectURL(url);},30000);
    };;

        window.resetTotalHours=function(){
      const p=getProject(currentProjectId); if(!p) return;
      p.work.hoursOverride=0;
      persistAndUpdate();
    };

        window.toggleMalerSection=function(){
      const el=document.getElementById('malerContent');
      const icon=document.getElementById('malerToggleIcon');
      if(!el) return;
      const hidden=el.style.display==='none';
      el.style.display=hidden?'':'none';
      if(icon) icon.textContent=hidden?'▼':'▶';
    };

        window.updateCalcModalHours=function(val){
      const p=getProject(currentProjectId); if(!p||!p.offerPosts) return;
      const post=p.offerPosts.find(x=>x.id===window._cpmPostId); if(!post) return;
      post.hours=Number(val)||0;
      persistAndUpdate();
    };

        window.addFromCatalogToCalcModal=function(itemId){
      const p=getProject(currentProjectId);
      const item=getCatalogItem(itemId); if(!item) return;
      window._cpm.push({
        id:(Math.random().toString(36).slice(2,10)),
        name:item.productName||item.name,
        itemNo:item.itemNo||'',
        unit:item.unit||'stk',
        cost:item.userPrice||0,
        waste:0,
        markup:p?p.settings.materialMarkup:20
      });
      window._cpmSearch='';
      rerenderCalcModal();
    };

    // ---- MATERIALKALKULATOR ----
    // difficultyFactors, calcDefaults, getCalcRate → moved to productionData.js / calcEngine.js

    // calcDefs, saveCalcRate → moved to productionData.js / calcEngine.js

        window.toggleCalcWidget=function(){
      const el=document.getElementById('calcWidget');
      if(el) el.classList.toggle('hidden');
    };

    window.toggleRateSettings=function(){
      const el=document.getElementById('calcRateSettings');
      if(el) el.classList.toggle('hidden');
    };

    window.toggleRateSection=function(toggleEl){
      const isOpen=toggleEl.classList.toggle('open');
      toggleEl.setAttribute('aria-expanded',isOpen);
      const body=toggleEl.nextElementSibling;
      if(body) body.classList.toggle('open',isOpen);
    };

    window.selectCalcJobCategory=function(category, value){
      const otherCategory = category === 'utvendig' ? 'innvendig' : 'utvendig';
      const otherSelect = document.getElementById('calcJobType' + otherCategory.charAt(0).toUpperCase() + otherCategory.slice(1));
      if(otherSelect) otherSelect.value = '';
      const hiddenField = document.getElementById('calcJobType');
      if(hiddenField) hiddenField.value = value;
      updateCalcWidget();
    };

    window.updateCalcWidget=function(){
      const type=document.getElementById('calcJobType')?.value;
      const def=calcDefs[type];
      const inputsEl=document.getElementById('calcInputs');
      const resultsEl=document.getElementById('calcResults');
      if(!inputsEl||!resultsEl) return;
      if(!def){ inputsEl.innerHTML=''; resultsEl.innerHTML=''; return; }
      inputsEl.innerHTML=`
        <div class="calc-inputs-section">
          <label>Vanskelighetsgrad</label>
          <div class="diff-grid">
            ${Object.entries(difficultyFactors).map(([k,d])=>`
              <button class="diff-btn ${k==='normal'?'active':''}" id="diffBtn_${k}"
                onclick="selectDifficulty('${k}')">
                <div class="diff-label">${d.label}</div>
                <div class="diff-desc">${d.desc}</div>
                <div class="diff-factor">${d.factor}</div>
              </button>`).join('')}
          </div>
        </div>
        ${def.materialOptions&&def.materialOptions.length?`
        <div class="row-3 calc-inputs-section">
          ${def.materialOptions.map(opt=>`
            <div>
              <label>${opt.label}</label>
              <select id="calcMat_${opt.id}" onchange="runCalcWidget()">
                ${opt.options.map(o=>`<option value="${o}">${o}</option>`).join('')}
              </select>
            </div>`).join('')}
        </div>`:''}
        <div class="row-3 calc-inputs-section">
          ${def.inputs.map(inp=>`
            <div>
              <label>${inp.label}</label>
              <input type="number" id="calcInput_${inp.id}" value="${inp.default}" oninput="runCalcWidget()" />
            </div>`).join('')}
        </div>
        <div class="calc-section-divider">
          <div class="row-3">
            <div>
              <label>Avstand (km)</label>
              <input type="number" id="calcDistance" value="0" placeholder="0" oninput="runCalcWidget()" />
            </div>
            <div>
              <label style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
                <input type="checkbox" id="calcOccupied" style="width:auto" onchange="runCalcWidget()" />
                Bebodd bolig
              </label>
            </div>
          </div>
        </div>
        <div class="calc-section-divider">
          <div class="calc-section-label">Indirekte tid (timer)</div>
          <div class="row-3">
            <div>
              <label>Rigg</label>
              <input type="number" id="calcRigging" value="0" placeholder="Auto" oninput="runCalcWidget()" />
            </div>
            <div>
              <label>Planlegging</label>
              <input type="number" id="calcPlanning" value="0" placeholder="Auto" oninput="runCalcWidget()" />
            </div>
            <div>
              <label>Opprydding %</label>
              <input type="number" id="calcCleanup" value="3" placeholder="3" oninput="runCalcWidget()" />
            </div>
          </div>
          <div class="footer-note" style="margin-top:6px">Blank = automatisk beregning</div>
        </div>`;
      window._calcDifficulty='normal';
      runCalcWidget();
    };

    window.selectDifficulty=function(key){
      window._calcDifficulty=key;
      Object.keys(difficultyFactors).forEach(k=>{
        const btn=document.getElementById('diffBtn_'+k);
        if(!btn) return;
        if(k===key) btn.classList.add('active');
        else btn.classList.remove('active');
      });
      runCalcWidget();
    };

    function buildRecipeView(type, result, def){
      if(!result._computed || !def.recipe) return '';
      const recipe = def.recipe;
      const computed = result._computed;

      // Computed values section
      let computedHtml = '';
      if(recipe.computed){
        computedHtml = Object.entries(recipe.computed).map(([key,comp])=>{
          const val = computed[key];
          if(val==null) return '';
          return `<span class="recipe-computed-tag">${comp.label}: <strong>${(Math.round(val*10)/10)}</strong> ${comp.unit}</span>`;
        }).filter(Boolean).join('');
      }

      // Material ratios section
      const matRows = (result.materialer||[]).filter(m=>m.id).map(m=>{
        const recipeMat = recipe.materialer.find(rm=>rm.id===m.id);
        if(!recipeMat) return '';
        const hasRatio = recipeMat.ratio!=null && m.baseRef;
        const userRatio = m.userRatio;
        const defaultRatio = recipeMat.ratio;
        const isOverridden = userRatio!=null;
        if(!hasRatio && !recipeMat.ratioExpr) return '';

        if(hasRatio){
          return `<tr>
            <td style="padding:5px 8px;font-size:12px">${escapeHtml(m.name)}</td>
            <td style="padding:5px 8px;text-align:center;font-size:11px;color:var(--muted)">${(Math.round(m.baseVal*10)/10)} ${recipeMat.baseRef}</td>
            <td style="padding:5px 8px;text-align:center;font-size:11px">\u00D7</td>
            <td style="padding:5px 8px;text-align:center">
              <input type="number" step="0.001" style="width:70px;padding:4px 6px;border:1px solid ${isOverridden?'var(--blue)':'#ddd'};border-radius:6px;font-size:12px;text-align:center;${isOverridden?'font-weight:700;color:var(--blue)':''}"
                value="${isOverridden?userRatio:defaultRatio}" onchange="updateRecipeRatio('${type}','${m.id}',this.value)" />
            </td>
            <td style="padding:5px 8px;text-align:center;font-size:11px;color:var(--muted)">${recipeMat.unit}/${recipeMat.baseRef}</td>
            <td style="padding:5px 8px;text-align:right;font-weight:600;font-size:12px">= ${(Math.round(m.qty*10)/10)} ${m.unit}</td>
            <td style="padding:5px 4px;text-align:center">${isOverridden?`<button style="border:none;background:none;cursor:pointer;font-size:10px;color:var(--muted)" onclick="resetRecipeRatioUI('${type}','${m.id}')" title="Tilbakestill">\u21A9</button>`:''}</td>
          </tr>`;
        } else {
          return `<tr>
            <td style="padding:5px 8px;font-size:12px">${escapeHtml(m.name)}</td>
            <td colspan="5" style="padding:5px 8px;font-size:11px;color:var(--muted);font-style:italic">${recipeMat.desc||'Beregnet fra formel'}</td>
            <td></td>
          </tr>`;
        }
      }).filter(Boolean).join('');

      if(!matRows && !computedHtml) return '';

      return `<div class="tab-section" style="margin-bottom:14px">
        <div class="tab-section-heading tab-section-toggle" onclick="toggleSection(this)" style="font-size:12px;padding:8px 12px">
          Reseptmengder <span style="font-weight:400;color:var(--muted)">\u2014 juster forholdstall fra erfaring</span>
        </div>
        <div class="tab-section-body" style="padding:8px">
          ${computedHtml?`<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px">${computedHtml}</div>`:''}
          <table style="width:100%;border-collapse:collapse">
            <thead><tr style="border-bottom:1px solid var(--line)">
              <th style="text-align:left;padding:4px 8px;font-size:10px;color:var(--muted);font-weight:600">Material</th>
              <th style="text-align:center;padding:4px 8px;font-size:10px;color:var(--muted);font-weight:600">Grunnlag</th>
              <th style="padding:4px"></th>
              <th style="text-align:center;padding:4px 8px;font-size:10px;color:var(--muted);font-weight:600">Forholdstall</th>
              <th style="text-align:center;padding:4px 8px;font-size:10px;color:var(--muted);font-weight:600">Enhet</th>
              <th style="text-align:right;padding:4px 8px;font-size:10px;color:var(--muted);font-weight:600">Resultat</th>
              <th style="padding:4px"></th>
            </tr></thead>
            <tbody>${matRows}</tbody>
          </table>
          <div style="font-size:10px;color:var(--muted);margin-top:6px;padding:4px 8px">Endre forholdstall for \u00E5 justere mengder basert p\u00E5 din erfaring. Endringer lagres og brukes p\u00E5 alle nye beregninger.</div>
        </div>
      </div>`;
    }

    window.updateRecipeRatio=function(type, matId, val){
      window.saveRecipeRatio(type, matId, val);
      saveState();
      runCalcWidget();
    };

    window.resetRecipeRatioUI=function(type, matId){
      window.resetRecipeRatio(type, matId);
      saveState();
      runCalcWidget();
    };

    window.runCalcWidget=function(){
      const type=document.getElementById('calcJobType')?.value;
      const def=calcDefs[type];
      const resultsEl=document.getElementById('calcResults');
      if(!def||!resultsEl) return;

      // Get input values
      const vals={};
      def.inputs.forEach(inp=>{
        vals[inp.id]=parseFloat(document.getElementById('calcInput_'+inp.id)?.value)||inp.default;
      });
      const mats={};
      (def.materialOptions||[]).forEach(opt=>{
        const el=document.getElementById('calcMat_'+opt.id);
        if(el) mats[opt.id]=el.value;
      });

      // Get project factors
      const difficulty=window._calcDifficulty||'normal';
      const diffFactor=difficultyFactors[difficulty]?.factor||1;
      const accessFactor=1; // Fixed to normal
      const heightFactor=1; // Fixed to ground
      const complexityFactor=1; // Fixed to normal
      const distance=parseFloat(document.getElementById('calcDistance')?.value)||0;
      const occupied=document.getElementById('calcOccupied')?.checked||false;
      const occupiedFactor=occupied?1.25:1;

      // Calculate base result — use recipe engine if available
      let result;
      let isRecipe = false;
      try{
        if(def.recipe && window.calcFromRecipe){
          result=window.calcFromRecipe(type, vals, mats);
          isRecipe = result && result._recipe;
        }
        if(!result){
          result=def.calc(vals,mats);
        }
      } catch(e){ console.error(e); return; }

      // Calculate direct time with all factors
      const baseTimer=result.timer;
      const directTimer=Math.round(baseTimer*diffFactor*accessFactor*heightFactor*complexityFactor);

      // Calculate indirect time
      let rigTimer=parseFloat(document.getElementById('calcRigging')?.value)||0;
      let planTimer=parseFloat(document.getElementById('calcPlanning')?.value)||0;
      const cleanupPct=parseFloat(document.getElementById('calcCleanup')?.value)||3;

      const drivingTimer=Math.round(distance*2*0.5); // 30 min per 10km round trip
      const cleanupTimer=Math.round(directTimer*cleanupPct/100);
      const indirectTimer=rigTimer+planTimer+drivingTimer+cleanupTimer;
      const totalTimer=directTimer+indirectTimer;

      // Get materials with prices (auto-kalkyle: smart matching + markup + waste)
      const priceCatalogMap=window.buildPriceCatalogMap?window.buildPriceCatalogMap():{};
      const p=getProject(currentProjectId);
      const calcMarkup=(p?.settings?.materialMarkup)||20;
      const materialsWithPrices=result.materialer.map(m=>{
        const priceMatch=autoMatchPrice(m.name, priceCatalogMap);
        const cost=priceMatch?.cost||lookupPriceForMaterial(m.name)||0;
        const unit=m.unit||priceMatch?.unit||'stk';
        const waste=m.waste||0;
        const markup=m.markup!=null?m.markup:calcMarkup;
        const totalCost=calcMatRowTotal({qty:m.qty,cost,waste,markup});
        return {...m, cost, unit, waste, markup, totalCost, matId:uid()};
      });
      const totalMatCost=materialsWithPrices.reduce((s,m)=>s+m.totalCost,0);

      // Calculate prices
      const timeRate=(p?.work.timeRate)||850;
      const laborSaleEx=Math.round(directTimer*timeRate*occupiedFactor);
      const totalSaleEx=laborSaleEx+totalMatCost;
      const laborCost=Math.round(directTimer*(p?.work.internalCost||450));
      const totalCost=laborCost+totalMatCost;
      const profit=totalSaleEx-totalCost;
      const margin=totalSaleEx>0?Math.round(profit/totalSaleEx*100):0;

      // Save result
      window._lastCalcResult={
        ...result,
        directTimer, indirectTimer, totalTimer,
        materialsWithPrices, totalMatCost,
        laborSaleEx, totalSaleEx, profit, margin,
        type, sentToOffer:false, isRecipe,
        factors:{difficulty,distance,occupied}
      };

      // Build results HTML
      resultsEl.innerHTML=`
        <div class="calc-result-card">
          <div class="calc-result-header">Estimat — ${def.label} — ${result.areal}</div>
          <div class="calc-result-sub">${result.info||''}</div>

          <div class="calc-stat-grid">
            <div class="calc-stat-box blue">
              <div class="stat-label">Direkte timer</div>
              <div class="stat-value">${directTimer}t</div>
              <div class="stat-detail">${baseTimer}t x ${diffFactor}</div>
            </div>
            <div class="calc-stat-box orange">
              <div class="stat-label">Indirekte timer</div>
              <div class="stat-value">${indirectTimer}t</div>
              <div class="stat-detail">Rigg: ${rigTimer}t + Plan: ${planTimer}t + Kjoring: ${drivingTimer}t + Opprydding: ${cleanupTimer}t</div>
            </div>
          </div>

          <table class="calc-mat-table">
            <thead><tr><th>Materiale</th><th>Netto</th><th>Enhet</th><th>Brutto</th><th>Pris</th><th>Svinn%</th><th>Paslag%</th><th style="text-align:right">Total</th><th></th></tr></thead>
            <tbody id="calcMaterialsTableBody">
              ${materialsWithPrices.map(m=>{
                const p=getProject(currentProjectId);
                const calcMarkup=(p?.settings?.materialMarkup)||20;
                return `<tr data-mat-id="${m.matId}">
                  <td>
                    <input type="text" class="calcMatName mat-name-input" data-mat-id="${m.matId}" value="${escapeHtml(m.name||'')}" placeholder="Sok materiale..." onclick="openPriceSearchForCalc('${m.matId}')" readonly />
                  </td>
                  <td style="text-align:center">
                    <input type="number" class="calcMatQty mat-num-input" data-mat-id="${m.matId}" value="${(m.qty||0).toFixed(1)}" step="0.1" min="0" onchange="recalcCalcMaterials()" oninput="recalcCalcMaterials()" />
                  </td>
                  <td style="text-align:center">
                    <select class="calcMatUnit mat-unit-select" data-mat-id="${m.matId}" onchange="recalcCalcMaterials()">
                      ${['stk','lm','m2','m3','pk','rull','sett','kg','l'].map(u=>'<option value="'+u+'" '+(u===(m.unit||'stk')?'selected':'')+'> '+u+'</option>').join('')}
                    </select>
                  </td>
                  <td style="text-align:center;color:var(--muted);font-size:11px" class="calcMatBrutto" data-mat-id="${m.matId}">
                    ${(m.waste>0?Math.ceil((m.qty||0)*(1+m.waste/100)*10)/10:(m.qty||0)).toFixed(1)}
                  </td>
                  <td style="text-align:right">
                    <input type="number" class="calcMatCost mat-num-input" data-mat-id="${m.matId}" value="${(m.cost||0).toFixed(2)}" step="0.01" min="0" onchange="recalcCalcMaterials()" oninput="recalcCalcMaterials()" />
                  </td>
                  <td style="text-align:center">
                    <input type="number" class="calcMatWaste mat-num-input" data-mat-id="${m.matId}" value="${m.waste||0}" step="1" min="0" max="100" style="width:50px" onchange="recalcCalcMaterials()" oninput="recalcCalcMaterials()" />
                  </td>
                  <td style="text-align:center">
                    <input type="number" class="calcMatMarkup mat-num-input" data-mat-id="${m.matId}" value="${m.markup||calcMarkup}" step="1" min="0" style="width:50px" onchange="recalcCalcMaterials()" oninput="recalcCalcMaterials()" />
                  </td>
                  <td class="mat-total">
                    <span class="calcMatRowTotal" data-mat-id="${m.matId}">${currency(calcMatRowTotal(m))}</span>
                  </td>
                  <td style="text-align:center">
                    <button class="mat-delete" onclick="deleteCalcMaterial('${m.matId}')">&#10005;</button>
                  </td>
                </tr>`
              }).join('')}
            </tbody>
          </table>
          <div class="mat-add-row" style="margin-bottom:14px">
            <button class="calc-add-mat-btn" onclick="addCalcMaterial()" style="flex:1">+ Legg til materiale</button>
            <div class="fav-dropdown-wrap" style="flex:1;position:relative">
              <button class="calc-add-mat-btn" onclick="toggleFavDropdown('favDropdownCalc')" style="width:100%">⭐ Favoritter</button>
              <div id="favDropdownCalc" class="fav-dropdown hidden"></div>
            </div>
          </div>

          ${isRecipe ? buildRecipeView(type, result, def) : ''}

          <div class="calc-price-grid">
            <div class="calc-price-item">
              <div class="price-label">Arbeid (eks. mva)</div>
              <div class="price-value" style="color:var(--blue)">${currency(laborSaleEx)}</div>
            </div>
            <div class="calc-price-item">
              <div class="price-label">Materialer</div>
              <div class="price-value" style="color:#167a42">${currency(totalMatCost)}</div>
            </div>
            <div class="calc-price-item">
              <div class="price-label">Totalt (eks. mva)</div>
              <div class="price-value" style="color:#2e7d32">${currency(totalSaleEx)}</div>
            </div>
          </div>

          <div class="calc-totals-grid">
            <div class="calc-total-box green">
              <div class="total-label">Totalt timer</div>
              <div class="total-value">${totalTimer}t</div>
            </div>
            <div class="calc-total-box blue-border">
              <div class="total-label">Margin</div>
              <div class="total-value">${margin}%</div>
              <div class="stat-detail" style="margin-top:2px">Fortjeneste: ${currency(profit)}</div>
            </div>
          </div>

          <div class="calc-actions">
            ${window._lastCalcResult?.sentToOffer
              ?`<button class="btn success" disabled style="cursor:not-allowed">Sendt til tilbud</button>
                <button class="btn secondary" onclick="doAddCalcToMaterials()">Legg i materialliste</button>`
              :`<button class="btn primary" style="background:var(--blue)" onclick="doSendCalcToOffer()">Send til tilbud</button>
                <button class="btn secondary" onclick="doAddCalcToMaterials()">Legg i materialliste</button>`
            }
          </div>
          ${window._lastCalcResult?.sentToOffer
            ?`<div class="calc-sent-msg">Denne kalkylen er sendt til tilbud. Endre inputfelt for a kunne sende en ny kalkyle.</div>`
            :''
          }
        </div>`;
    };

    window.doSendCalcToOffer=function(){
      const p=getProject(currentProjectId); if(!p) return;
      const result=window._lastCalcResult; if(!result) return;
      // Safety check: prevent double submission
      if(result.sentToOffer){
        alert('Denne kalkylen er allerede sendt til tilbud. Endre inputfelt for å sende en ny kalkyle.');
        return;
      }

      // Build price catalog for snapshot
      const priceCatalogMap=window.buildPriceCatalogMap?window.buildPriceCatalogMap():{};

      // Create snapshot materials from calculated materials with prices
      const snapshotMats=result.materialsWithPrices.map(m=>({
        id:uid(),
        name:m.name,
        qty:m.qty,
        unit:m.unit,
        cost:m.cost||0,
        waste:m.waste||0,
        totalCost:m.totalCost||0,
        markup:p.settings.materialMarkup||0
      }));

      if(!p.offerPosts) p.offerPosts=[];

      // Create offer post from calculation — let user edit name
      const defaultName=window.calcDefs[result.type]?.label||result.type||'Kalkyle';
      const calcName=prompt('Navn på posten i tilbudet:',defaultName);
      if(calcName===null) return;
      const totalPrice=result.totalMatCost||0;
      const calcHours=result.timer||0;
      const calcLaborSaleEx=Math.round(calcHours*(Number(p.work.timeRate)||850));
      const calcLaborCost=Math.round(calcHours*(Number(p.work.internalCost)||0));
      const calcSaleEx=calcLaborSaleEx+totalPrice;

      p.offerPosts.push({
        id:uid(),
        name:calcName||defaultName,
        description:calcHours+'t + '+snapshotMats.length+' materialer',
        type:'calc',
        price:Math.round(calcSaleEx),
        enabled:true,
        snapshotMaterials:snapshotMats,
        snapshotCompute:{
          hoursTotal:calcHours,
          laborSaleEx:calcLaborSaleEx,
          laborCost:calcLaborCost,
          matSaleEx:totalPrice,
          matCost:totalPrice,
          saleEx:calcSaleEx,
          costPrice:calcLaborCost+totalPrice
        }
      });

      // Mark calculation as sent to offer
      result.sentToOffer=true;
      window._lastCalcResult=result;

      // Confirm to user and ask if they want to clear old materials
      const matCount=snapshotMats.length;
      const msg='✅ Kalkyle sendt til tilbud!\n\n'+matCount+' materiallinjer lagt til som tilbudspost.\n\nØnsker du å fjerne gamle materialer fra materiallisten?';
      const shouldClear=confirm(msg);
      if(shouldClear){
        p.materials=[];
      }

      persistAndRenderProject();

      // Reset calc widget for next calculation (don't hide it)
      const jobSelect=document.getElementById('calcJobType');
      if(jobSelect) jobSelect.value='';
      const jobSelectU=document.getElementById('calcJobTypeUtvendig');
      if(jobSelectU) jobSelectU.value='';
      const jobSelectI=document.getElementById('calcJobTypeInnvendig');
      if(jobSelectI) jobSelectI.value='';
      const inputsEl=document.getElementById('calcInputs');
      if(inputsEl) inputsEl.innerHTML='';
      const resultsEl=document.getElementById('calcResults');
      if(resultsEl) resultsEl.innerHTML='';
      window._lastCalcResult=null;
    };

    window.doAddCalcToMaterials=function(){
      if(window._lastCalcResult) window.addCalcResultToProject(window._lastCalcResult);
    };

    window.doAddCalcResult=function(){
      if(window._lastCalcResult) window.addCalcResultToProject(window._lastCalcResult);
    };

        window.addCalcResultToProject=function(result){
      const p=getProject(currentProjectId); if(!p) return;
      // Add materials with best-effort price lookup
      const newMats=result.materialer.map(m=>({
        id:uid(), name:m.name, qty:m.qty, unit:m.unit,
        cost:lookupPriceForMaterial(m.name)||0,
        waste:m.waste, markup:p.settings.materialMarkup
      }));
      p.materials.push(...newMats);
      // Store calculator timer → divide by people so hoursTotal = timer
      p.work.hours = Math.round(result.timer / Math.max(Number(p.work.people)||1, 1));
      persistAndRenderProject();
      document.getElementById('calcWidget')?.classList.add('hidden');

      // Check how many are missing price
      const missing=newMats.filter(m=>m.cost===0);
      if(missing.length){
        openCalcPriceLookupModal(missing, p);
      }
    };

    function openCalcPriceLookupModal(missingMats, p){
      let idx=0;
      function renderStep(){
        if(idx>=missingMats.length){ closeModal(); persistAndRenderProject(); return; }
        const m=missingMats[idx];
        const mat=p.materials.find(x=>x.id===m.id);

        function searchHtml(q){
          if(!q) return '';
          const res=searchPriceCatalog(q);
          if(!res.length) return '<div class="empty" style="padding:8px">Ingen treff</div>';
          return res.map(item=>`
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 10px;background:var(--card);border:1px solid var(--line);border-radius:10px;margin-bottom:5px">
              <div>
                <div style="font-weight:700;font-size:13px">${escapeHtml(item.productName||item.name)}</div>
                <div style="font-size:11px;color:var(--muted)">${escapeHtml(item.itemNo||'')} • ${escapeHtml(item.unit||'-')} • ${currency(item.userPrice||0)}</div>
              </div>
              <button class="btn small primary" onclick="setPriceFromCatalog('${m.id}','${escapeHtml(item.id)}')">Velg</button>
            </div>`).join('');
        }

        showModal(`
          <div class="section-head">
            <div class="section-title">💰 Sett pris (${idx+1}/${missingMats.length})</div>
            <button class="btn small secondary" onclick="skipPriceLookup()">Hopp over alle</button>
          </div>
          <div style="padding:10px;background:var(--yellow-soft);border:1px solid rgba(196,162,58,.2);border-radius:12px;margin-bottom:12px">
            <div style="font-weight:800">${escapeHtml(m.name)}</div>
            <div style="font-size:12px;color:var(--muted)">${m.qty} ${m.unit} — mangler pris</div>
          </div>
          <div style="margin-bottom:8px;display:flex;gap:8px">
            <input id="calcPriceManual" type="number" placeholder="Skriv inn pris manuelt..."
              style="flex:1" onchange="setManualPrice('${m.id}',this.value)" />
            <button class="btn small soft" onclick="setManualPrice('${m.id}',document.getElementById('calcPriceManual').value)">OK</button>
          </div>
          <div style="background:#f0f7ff;border:1px solid #cde2ff;border-radius:12px;padding:12px">
            <label style="margin:0 0 6px">🔍 Søk i prisfil</label>
            <input id="calcPriceSearch" placeholder="Søk varenummer eller navn..."
              oninput="document.getElementById('calcPriceResults').innerHTML=window._calcSearchHtml(this.value)" />
            <div id="calcPriceResults" style="margin-top:8px;max-height:200px;overflow-y:auto"></div>
          </div>
          <div class="toolbar" style="margin-top:14px">
            <button class="btn secondary" onclick="skipOnePriceLookup()">Hopp over denne</button>
          </div>
        `);

        window._calcSearchHtml=searchHtml;
        window._calcMissingMats=missingMats;
        window._calcPriceIdx=()=>idx;
        window._calcStep=renderStep;
        window._calcP=p;
      }

      window.setPriceFromCatalog=function(matId, itemId){
        const item=getCatalogItem(itemId); if(!item) return;
        const mat=p.materials.find(x=>x.id===matId); if(!mat) return;
        mat.cost=item.userPrice||0;
        mat.itemNo=item.itemNo||'';
        mat.name=item.productName||item.name;
        idx++; renderStep();
      };
      window.setManualPrice=function(matId, val){
        const price=parseFloat(val)||0; if(!price) return;
        const mat=p.materials.find(x=>x.id===matId); if(!mat) return;
        mat.cost=price;
        idx++; renderStep();
      };
      window.skipOnePriceLookup=function(){ idx++; renderStep(); };
      window.skipPriceLookup=function(){ closeModal(); persistAndRenderProject(); };

      renderStep();
    }

    window.adjustModalHours=function(delta){
      const p=getProject(currentProjectId); if(!p) return;
      const postId=window._cpmPostId;
      const post=postId&&p.offerPosts&&p.offerPosts.find(x=>x.id===postId);
      const calcHours=post?.snapshotCompute?.hoursTotal||0;
      // Start from: pending override → saved hours → calc hours (placeholder)
      const base=window._pendingPostHours!=null
        ? window._pendingPostHours
        : (post?.hours||calcHours||0);
      const newVal=Math.max(0, base+delta);
      window._pendingPostHours=newVal;
      const el=document.getElementById('postHoursDisplay');
      if(el) el.textContent=newVal+'t';
    };

    window.adjustLaborGroupHours=function(groupIdx,delta){
      const p=getProject(currentProjectId); if(!p) return;
      const postId=window._cpmPostId;
      const post=postId&&p.offerPosts&&p.offerPosts.find(x=>x.id===postId);
      if(!post||!post.laborGroups||!post.laborGroups[groupIdx]) return;
      var g=post.laborGroups[groupIdx];
      g.hours=Math.max(0,(g.hours||0)+delta);
      var el=document.getElementById('laborGroupHours_'+groupIdx);
      if(el) el.textContent=g.hours;
      var totalEl=document.getElementById('laborGroupTotalHours');
      if(totalEl){
        var sum=post.laborGroups.reduce(function(s,lg){return s+(lg.hours||0);},0);
        totalEl.textContent=sum+'t';
      }
    };

        window.saveCalcPostMaterials=function(){
      const p=getProject(currentProjectId); if(!p||!p.offerPosts) return;
      const post=p.offerPosts.find(x=>x.id===window._cpmPostId); if(!post) return;
      const mats=window._cpm.map(m=>({...m}));
      post.snapshotMaterials=mats;

      // Recalculate snapshotCompute from updated materials
      let matCost=0, matSaleEx=0;
      mats.forEach(m=>{
        const qty=Number(m.qty)||1, cost=Number(m.cost)||0;
        const waste=Number(m.waste)||0, markup=Number(m.markup)||20;
        const withWaste=qty*cost*(1+waste/100);
        matCost+=withWaste;
        matSaleEx+=withWaste*(1+markup/100);
      });

      // Use pending hours (from ▲▼ buttons) or fall back to existing
      const timeRate=Number(p.work.timeRate)||850;
      const internalCost=Number(p.work.internalCost)||0;
      const prev=post.snapshotCompute||{};

      // If labor groups exist, sum hours from groups; otherwise use pending/existing
      let hoursTotal;
      if(post.laborGroups&&post.laborGroups.length){
        hoursTotal=post.laborGroups.reduce(function(s,g){return s+(g.hours||0);},0);
        // Recalc each group's labor values
        post.laborGroups.forEach(function(g){
          g.laborSaleEx=Math.round((g.hours||0)*timeRate);
          g.laborCost=Math.round((g.hours||0)*internalCost);
        });
      } else {
        hoursTotal=window._pendingPostHours!=null
          ? window._pendingPostHours
          : (prev.hoursTotal||0);
      }
      window._pendingPostHours=null;
      // Recalculate labor from hours
      const laborSaleEx=hoursTotal*timeRate;
      const laborCost=hoursTotal*internalCost;
      const saleEx=laborSaleEx+matSaleEx;
      const costPrice=laborCost+matCost;
      const profit=saleEx-costPrice;
      const margin=saleEx?(profit/saleEx*100):0;

      post.snapshotCompute={
        hoursTotal,
        laborSaleEx,
        laborCost,
        matSaleEx,
        matCost,
        costPrice,
        saleEx,
        saleInc:saleEx*1.25,
        profit,
        margin
      };
      post.hours=hoursTotal; // sync post.hours with snapshot
      // Update post price to match new total
      post.price=Math.round(p.settings.vatMode==='inc'?saleEx*1.25:saleEx);

      window._cpmSearch='';
      closeModal();
      persistAndRenderProject();
    };

        function restoreCalcPost(postId){
      window._pendingPostHours=null;
      const p=getProject(currentProjectId); if(!p||!p.offerPosts) return;
      const post=p.offerPosts.find(x=>x.id===postId); if(!post) return;
      window._cpm=[...(post.snapshotMaterials||[]).map(m=>({...m}))];
      window._cpmPostId=postId;
      window._cpmSearch='';
      renderCalcModal();
    }
    window.restoreCalcPost=restoreCalcPost;

        window.quickChangeStatus=function(projectId, newStatus){
      const p=getProject(projectId); if(!p) return;
      if(newStatus==='Ferdig'){
        openProjectCompleteModal(p);
      } else {
        p.status=newStatus;
        p.updatedAt=Date.now();
        saveState(); renderDashboard();
      }
    };

    function openProjectCompleteModal(p){
      const c=compute(p);
      showModal(`
        <div class="section-head">
          <div class="section-title">✅ Fullfør prosjekt</div>
          <button class="btn small secondary" onclick="closeModal()">Lukk</button>
        </div>
        <div style="background:#edfff4;border:1px solid #b7f0cf;border-radius:14px;padding:12px;margin-bottom:14px;font-size:13px;color:#167a42;font-weight:700">
          Fyll inn faktiske tall — dette hjelper kalkulatoren å bli bedre over tid.
        </div>
        <div class="row">
          <div><label>Faktiske timer brukt</label><input id="fcActualHours" type="number" placeholder="Estimert: ${c.totalHours||c.hoursTotal}" value="${p.work.actualHours||''}" /></div>
          <div><label>Faktisk materialkostnad (kr)</label><input id="fcActualMatCost" type="number" placeholder="Estimert: ${Math.round(c.totalMatCost||c.matCost)}" value="${p.actualMatCost||''}" /></div>
        </div>
        <div class="row">
          <div><label>Faktisk totalpris til kunde (kr)</label><input id="fcActualTotal" type="number" placeholder="Tilbudssum: ${Math.round(c.totalSaleEx||c.saleEx)}" value="${p.actualTotal||''}" /></div>
          <div><label>Antall reklamasjoner / avvik</label><input id="fcIssues" type="number" placeholder="0" value="${p.completionData?.issues||0}" /></div>
        </div>
        <label>Notater / læring fra dette prosjektet</label>
        <textarea id="fcNotes" placeholder="Hva gikk bra? Hva tok lengre tid enn estimert? Tips til neste gang...">${p.completionData?.notes||''}</textarea>
        <div style="margin-top:14px;padding:12px;background:#f5f8ff;border-radius:14px;border:1px solid #dce8ff">
          <div style="font-size:13px;font-weight:800;margin-bottom:8px">📊 Avvik fra estimat</div>
          <div class="row-3" style="font-size:13px">
            <div>Timer estimert: <strong>${c.totalHours||c.hoursTotal}</strong></div>
            <div>Materialer estimert: <strong>${currency(c.totalMatCost||c.matCost)}</strong></div>
            <div>Pris estimert: <strong>${currency(c.totalSaleEx||c.saleEx)}</strong></div>
          </div>
        </div>
        <div class="toolbar" style="margin-top:14px">
          <button class="btn primary" onclick="saveProjectComplete('${p.id}')">✅ Merk som ferdig og lagre</button>
          <button class="btn secondary" onclick="closeModal()">Avbryt</button>
        </div>
      `);
    }

    window.saveProjectComplete=function(projectId){
      const p=getProject(projectId); if(!p) return;
      const actualHours=Number(document.getElementById('fcActualHours')?.value)||0;
      const actualMatCost=Number(document.getElementById('fcActualMatCost')?.value)||0;
      const actualTotal=Number(document.getElementById('fcActualTotal')?.value)||0;
      const issues=Number(document.getElementById('fcIssues')?.value)||0;
      const notes=document.getElementById('fcNotes')?.value||'';
      if(actualHours) p.work.actualHours=actualHours;
      p.actualMatCost=actualMatCost;
      p.actualTotal=actualTotal;
      p.completionData={issues, notes, completedAt:Date.now()};
      p.status='Ferdig';
      p.updatedAt=Date.now();
      saveState(); closeModal(); renderDashboard();
    };

    // Material editor for any offer post (fast/option)
    window.openPostMaterialEditor=function(postId){
      const p=getProject(currentProjectId); if(!p||!p.offerPosts) return;
      const post=p.offerPosts.find(x=>x.id===postId); if(!post) return;
      // Reuse the calc modal system
      window._cpm=[...(post.snapshotMaterials||[]).map(m=>({...m}))];
      window._cpmPostId=postId;
      window._cpmSearch='';
      renderCalcModal();
    };

        window.updateOfferHours=function(val){
      const p=getProject(currentProjectId); if(!p) return;
      const hours=Number(val)||0;
      p.work.hours=hours;
      // Also update snapshotCompute in calc posts proportionally if only one post
      persistAndRenderProject();
    };

        window.addSubcontractor=addSubcontractor;
    window.removeSubcontractor=removeSubcontractor;
    window.updSubcontractor=updSubcontractor;

        function copyBuiltinTemplate(tplId){
      const tpl=builtinTemplates.find(t=>t.id===tplId); if(!tpl) return;
      // Create editable copy with blank itemNo/cost so user fills from prisfil
      const copy={
        id:uid(),
        name:tpl.name + ' (min)',
        builtIn:false,
        materials: tpl.materials.map(m=>({
          id:uid(),
          name:m.name,
          itemNo:'',
          unit:m.unit||'stk',
          cost:0,
          waste:m.waste||0
        }))
      };
      openTemplateModal(copy);
    }
    window.copyBuiltinTemplate=copyBuiltinTemplate;

        window.switchTab=switchTab;



    function renderPostExtra(post){
      var id=post.id;
      if(post.type==='option'){
        var chk=post.enabled?'checked':'';
        return '<label style="display:flex;align-items:center;gap:8px;margin-top:10px">'
          +'<input style="width:auto" type="checkbox" '+chk
          +' onchange="togglePost(\x27'+id+'\x27,this.checked)" /> Valgt opsjon</label>'
          +'<div style="margin-top:8px"><button class="btn small secondary" style="font-size:12px" onclick="openPostMaterialEditor(\x27'+id+'\x27)">✏️ Tilpass</button></div>';
      } else if(post.type==='calc'){
        return '<div style="margin-top:6px;font-size:12px;color:var(--muted)">📦 Materialer + ⏱️ arbeid inkludert</div>'
          +'<button class="btn small soft" style="font-size:12px;margin-top:6px" onclick="restoreCalcPost(\x27'+id+'\x27)">✏️ Tilpass</button>';
      } else {
        return '<div style="margin-top:8px">'
          +'<button class="btn small secondary" style="font-size:12px" onclick="openPostMaterialEditor(\x27'+id+'\x27)">✏️ Tilpass</button>'
          +'</div>';
      }
    }

        function renderOfferPosts(p){
      if(!p.offerPosts) p.offerPosts=[];
      if(!p.offerPosts.length) return `<div class="empty">Ingen tilbudsposter lagt til enda.</div>`;
      const vatLbl='eks. mva';
      const selCount=Object.keys(window._mergeSelected||{}).filter(function(id){return window._mergeSelected[id];}).length;
      const mergeBar=p.offerPosts.length>=2?`<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;padding:8px 12px;background:#f5f8ff;border:1px solid #dce8ff;border-radius:10px">
        <span style="font-size:12px;color:var(--muted);flex:1">Velg poster å slå sammen (${selCount} valgt)</span>
        <button class="btn small primary" onclick="doMergeSelected()" ${selCount<2?'disabled style="opacity:0.5"':''}>Slå sammen</button>
      </div>`:'';
      return mergeBar+p.offerPosts.map(post=>{
        const isOpen=post._open===true; // default closed
        const typeLabel=post.type==='calc'?'Kalkyle':post.type==='option'?'Opsjon':'Fast';
        const isMergeSel=!!(window._mergeSelected&&window._mergeSelected[post.id]);

        const header=`<div style="display:flex;align-items:center;gap:10px;padding:12px 14px;cursor:pointer;background:${isOpen?'var(--bg-warm)':'var(--card)'};border-radius:${isOpen?'14px 14px 0 0':'14px'}">
          <input type="checkbox" style="width:auto;flex-shrink:0" ${isMergeSel?'checked':''} onclick="event.stopPropagation();toggleMergeSelect('${post.id}')" title="Velg for sammenslåing" />
          <div style="flex:1;min-width:0" onclick="toggleOfferPost('${post.id}')">
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
              <span style="font-weight:800;font-size:14px">${escapeHtml(post.name||'Ny post')}</span>
              <span style="font-size:11px;color:var(--muted);background:var(--bg-warm);border-radius:4px;padding:1px 6px">${typeLabel}</span>
              ${post.type==='option'&&post.enabled?'<span style="font-size:11px;background:var(--green-soft);color:var(--green);border-radius:4px;padding:1px 6px;font-weight:700">✅ Valgt</span>':''}
            </div>
            ${post.description&&!isOpen?`<div style="font-size:12px;color:var(--muted);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escapeHtml(post.description)}</div>`:''}
          </div>
          <div style="text-align:right;flex-shrink:0" onclick="toggleOfferPost('${post.id}')">
            <div style="font-size:17px;font-weight:800;color:${post.type==='option'&&!post.enabled?'var(--muted)':'#0a84ff'}">${currency(displayVatValue(p,post.price||0))}</div>
            <div style="font-size:10px;color:var(--muted)">${vatLbl}</div>
          </div>
          <div style="color:var(--muted);font-size:13px;margin-left:2px;cursor:pointer" onclick="toggleOfferPost('${post.id}')">${isOpen?'▲':'▼'}</div>
        </div>`;

        const body=isOpen?`<div style="padding:12px 14px 14px;border-top:1px solid var(--line)">
          <div class="row-3">
            <div><label>Navn</label><input value="${escapeAttr(post.name||'')}" onchange="updatePost('${post.id}','name',this.value)" /></div>
            <div><label>Type</label><select onchange="updatePost('${post.id}','type',this.value)">
              <option value="fast" ${post.type==='fast'?'selected':''}>Fastpris</option>
              <option value="calc" ${post.type==='calc'?'selected':''}>Kalkyle</option>
              <option value="option" ${post.type==='option'?'selected':''}>Opsjon</option>
            </select></div>
            <div><label>Pris ${vatLbl}</label>
              ${post.type==='calc'
                ? `<div style="padding:12px 14px;background:#f5f8ff;border:1px solid #dce8ff;border-radius:14px;font-size:18px;font-weight:800">${currency(displayVatValue(p,post.price||0))} <span style="font-size:11px;color:var(--muted);font-weight:500">🔒</span></div>`
                : `<input type="number" value="${post.price||0}" onchange="updatePost('${post.id}','price',this.value)" />`
              }
            </div>
          </div>
          <div class="row" style="margin-top:10px">
            <div><label>Beskrivelse</label><input value="${escapeAttr(post.description||'')}" onchange="updatePost('${post.id}','description',this.value)" /></div>
            <div>${renderPostExtra(post)}</div>
          </div>
          <div class="inline-actions" style="margin-top:10px;justify-content:flex-end">
            <button class="btn small secondary" onclick="movePost('${post.id}',-1)">↑</button>
            <button class="btn small secondary" onclick="movePost('${post.id}',1)">↓</button>
            <button class="btn small danger" onclick="removePost('${post.id}')">Slett</button>
          </div>
        </div>`:'';

        return `<div style="border:1.5px solid ${isOpen?'rgba(107,159,204,.25)':'var(--line)'};border-radius:14px;overflow:hidden;background:var(--card);margin-bottom:6px">${header}${body}</div>`;
      }).join('');
    }

    // computeOfferPostsTotal() er flyttet til calcEngine.js

    function addOfferPost(){
      const p=getProject(currentProjectId); if(!p) return;
      if(!p.offerPosts) p.offerPosts=[];
      const newId=uid();
      p.offerPosts.push({id:newId,name:'',description:'',type:'fast',price:0,enabled:true,_open:true});
      persistAndRenderProject();
      setTimeout(()=>{
        const nameInput=document.querySelector('input[onchange*="'+newId+'"][onchange*="name"]');
        if(nameInput){ nameInput.focus(); nameInput.placeholder='Skriv inn postnavn...'; }
      },50);
    }

    function addSuggestedMaterialsAsPost(allOperations){
      const p=getProject(currentProjectId); if(!p) return;
      const priceCatalogMap=window.buildPriceCatalogMap?window.buildPriceCatalogMap():{};

      if(!p.offerPosts) p.offerPosts=[];

      if(allOperations){
        // One combined post for all operations
        var projectEst=window.buildProjectEstimate(p, priceCatalogMap);
        if(!projectEst || !projectEst.materialer || !projectEst.materialer.length){
          alert('Ingen foreslåtte materialer å legge til.');
          return;
        }
        var matCount=projectEst.materialer.length;
        var totalPrice=projectEst.totalMaterialCost||0;
        if(!confirm('Legge til '+matCount+' materiallinjer som en tilbudspost?\n\nTotal: '+currency(totalPrice)+' (eks. mva)')){
          return;
        }

        var suggestedMats=projectEst.materialer.map(function(m){
          return {
            name:m.name,
            qty:m.qty,
            unit:m.unit,
            cost:m.cost||0,
            waste:m.waste||0,
            totalCost:m.totalCost||0
          };
        });

        p.offerPosts.push({
          id:uid(),
          name:'Foreslåtte materialer',
          description:matCount+' materiallinjer fra operasjoner',
          type:'calc',
          price:Math.round(totalPrice),
          enabled:true,
          snapshotMaterials:suggestedMats,
          snapshotCompute:{
            matSaleEx:totalPrice,
            matCost:totalPrice
          }
        });
      } else {
        // One post per operation
        var addedPosts=[];
        (p.operations||[]).forEach(function(op){
          var opEst=window.buildOperationEstimate(op, priceCatalogMap);
          if(opEst && opEst.materialer && opEst.materialer.length){
            var suggestedMats=opEst.materialer.map(function(m){
              return {
                name:m.name,
                qty:m.qty,
                unit:m.unit,
                cost:m.cost||0,
                waste:m.waste||0,
                totalCost:m.totalCost||0
              };
            });
            var opPrice=opEst.totalMaterialCost||0;
            addedPosts.push({
              type:op.type,
              count:suggestedMats.length,
              price:opPrice
            });
            p.offerPosts.push({
              id:uid(),
              name:'Materialer: '+productionRates[op.type].label,
              description:suggestedMats.length+' linjer',
              type:'calc',
              price:Math.round(opPrice),
              enabled:true,
              snapshotMaterials:suggestedMats,
              snapshotCompute:{
                matSaleEx:opPrice,
                matCost:opPrice
              }
            });
          }
        });
        if(addedPosts.length===0){
          alert('Ingen foreslåtte materialer å legge til.');
          return;
        }
        var summary=addedPosts.map(function(ap){return ap.count+' linjer '+ap.type;}).join(', ');
        var totalAdded=addedPosts.reduce(function(s,ap){return s+ap.price;},0);
        alert('Lagt til '+addedPosts.length+' tilbudsposter:\n'+summary+'\n\nTotalt: '+currency(totalAdded)+' (eks. mva)');
      }

      persistAndRenderProject();
    }


    window.toggleOfferPost=function(id){
      const p=getProject(currentProjectId); if(!p||!p.offerPosts) return;
      const post=p.offerPosts.find(x=>x.id===id); if(!post) return;
      post._open=!post._open;
      persistAndRenderProject();
    };

        function updatePost(id,key,val){ const p=getProject(currentProjectId); if(!p||!p.offerPosts) return; const post=p.offerPosts.find(x=>x.id===id); if(!post) return; post[key]=key==='price'?parseVatInput(p,val):val; persistAndUpdate(); }

    window.updatePostHours=function(id,val){
      const p=getProject(currentProjectId); if(!p||!p.offerPosts) return;
      const post=p.offerPosts.find(x=>x.id===id); if(!post) return;
      post.hours=Number(val)||0;
      const timeRate=Number(p.work.timeRate)||850;
      const hrs=post.hours||post.snapshotCompute?.hoursTotal||0;
      const matSaleEx=post.snapshotCompute?.matSaleEx||0;
      post.price=Math.round(hrs*timeRate+matSaleEx);
      saveState(); updateSummary();
    };
    function togglePost(id,val){ const p=getProject(currentProjectId); if(!p||!p.offerPosts) return; const post=p.offerPosts.find(x=>x.id===id); if(!post) return; post.enabled=!!val; persistAndUpdate(); }
    function removePost(id){ const p=getProject(currentProjectId); if(!p||!p.offerPosts) return; p.offerPosts=p.offerPosts.filter(x=>x.id!==id); persistAndRenderProject(); }
    function movePost(id,dir){ const p=getProject(currentProjectId); if(!p||!p.offerPosts) return; const idx=p.offerPosts.findIndex(x=>x.id===id); if(idx<0) return; const ni=idx+dir; if(ni<0||ni>=p.offerPosts.length) return; [p.offerPosts[idx],p.offerPosts[ni]]=[p.offerPosts[ni],p.offerPosts[idx]]; persistAndRenderProject(); }

    var MERGE_GROUP_COLORS=['#4a90d9','#e67e22','#27ae60','#8e44ad','#c0392b','#16a085','#d4ac0d','#2c3e50'];
    window._mergeSelected={};

    window.toggleMergeSelect=function(id){
      if(window._mergeSelected[id]) delete window._mergeSelected[id];
      else window._mergeSelected[id]=true;
      persistAndRenderProject();
    };

    window.mergeOfferLines=function(postIds){
      var p=getProject(currentProjectId); if(!p||!p.offerPosts) return;
      if(!postIds||postIds.length<2) return;
      var posts=postIds.map(function(id){return p.offerPosts.find(function(x){return x.id===id;});}).filter(Boolean);
      if(posts.length<2) return;

      var mergedMats=[], mergedHours=0, mergedLaborSaleEx=0, mergedLaborCost=0;
      var mergedMatCost=0, mergedMatSaleEx=0, mergedPrice=0;
      var laborGroups=[];
      var colorIdx=0;

      posts.forEach(function(post){
        var color=MERGE_GROUP_COLORS[colorIdx % MERGE_GROUP_COLORS.length];
        colorIdx++;
        (post.snapshotMaterials||[]).forEach(function(m){
          var tagged={};
          Object.keys(m).forEach(function(k){tagged[k]=m[k];});
          tagged.groupId=post.id;
          tagged.groupName=post.name||'Post';
          tagged.groupColor=color;
          mergedMats.push(tagged);
        });
        var sc=post.snapshotCompute||{};
        var postHours=Number(post.hours)||sc.hoursTotal||0;
        mergedHours+=postHours;
        mergedLaborSaleEx+=sc.laborSaleEx||0;
        mergedLaborCost+=sc.laborCost||0;
        mergedMatCost+=sc.matCost||0;
        mergedMatSaleEx+=sc.matSaleEx||0;
        mergedPrice+=Number(post.price)||0;
        laborGroups.push({
          groupId:post.id,
          groupName:post.name||'Post',
          groupColor:color,
          hours:postHours,
          laborSaleEx:sc.laborSaleEx||0,
          laborCost:sc.laborCost||0
        });
      });

      var names=posts.map(function(post){return post.name||'Post';});
      var mergedName=names.join(' + ');

      var newPost={
        id:uid(),
        name:mergedName,
        description:'Sammenslått fra '+posts.length+' poster',
        type:'calc',
        price:Math.round(mergedPrice),
        enabled:true,
        snapshotMaterials:mergedMats,
        laborGroups:laborGroups,
        snapshotCompute:{
          hoursTotal:mergedHours,
          laborSaleEx:mergedLaborSaleEx,
          laborCost:mergedLaborCost,
          matCost:mergedMatCost,
          matSaleEx:mergedMatSaleEx
        }
      };

      p.offerPosts=p.offerPosts.filter(function(x){return postIds.indexOf(x.id)===-1;});
      p.offerPosts.push(newPost);
      window._mergeSelected={};
      persistAndRenderProject();
    };

    window.doMergeSelected=function(){
      var ids=Object.keys(window._mergeSelected).filter(function(id){return window._mergeSelected[id];});
      if(ids.length<2){alert('Velg minst 2 poster å slå sammen.');return;}
      mergeOfferLines(ids);
    };

    function bindProjectEvents(){
      const p=getProject(currentProjectId); if(!p) return;
      bindVal('#fName',v=>p.name=v);
      bindVal('#fCustomer',v=>{ p.customerId=v; const cu=getCustomer(v); p.address=cu?(cu.address||''):''; const el=$('#fAddress'); if(el) el.value=p.address; });
      bindVal('#fAddress',v=>p.address=v); bindVal('#fType',v=>p.type=v); bindVal('#fStart',v=>p.startPref=v);
      bindVal('#fStatus',v=>p.status=v); bindVal('#fDescription',v=>p.description=v); bindVal('#fNote',v=>p.note=v);
      const beb=$('#fBebodd'); if(beb) beb.addEventListener('change',()=>{ p.bebodd=beb.checked; persistAndUpdate(); });
      const sT=$('#sTimeRate'); if(sT) sT.addEventListener('input',()=>{ p.settings.timeRate=parseVatInput(p,sT.value); p.work.timeRate=p.settings.timeRate; const l=$('#wTimeRate'); if(l&&document.activeElement!==l) l.value=displayVatValue(p,p.work.timeRate); persistAndUpdate(); });
      const sI=$('#sInternalCost'); if(sI) sI.addEventListener('input',()=>{ p.settings.internalCost=Number(sI.value)||0; p.work.internalCost=p.settings.internalCost; const l=$('#wInternalCost'); if(l&&document.activeElement!==l) l.value=p.work.internalCost; persistAndUpdate(); });
      const sD=$('#sDriveCost'); if(sD) sD.addEventListener('input',()=>{ p.settings.driveCost=parseVatInput(p,sD.value); p.extras.driveCost=p.settings.driveCost; p.extras.driftRate=p.settings.driveCost; const l=$('#eDrive'); if(l&&document.activeElement!==l) l.value=displayVatValue(p,p.extras.driveCost); persistAndUpdate(); });
      bindNum('#wActualHours',v=>p.work.actualHours=v);
      bindNum('#wLaborHireHours',v=>p.work.laborHireHours=v); bindNumVat('#wLaborHireRate',v=>p.extras.laborHire=v);
      bindNumVat('#wTimeRate',v=>p.work.timeRate=v); bindNum('#wInternalCost',v=>p.work.internalCost=v);
      bindNum('#eDriftRate',v=>p.extras.driftRate=v);
      bindNumVat('#eRental',v=>p.extras.rental=v);
      bindNumVat('#eWaste',v=>p.extras.waste=v); bindNumVat('#eScaffolding',v=>p.extras.scaffolding=v); bindNumVat('#eDrawings',v=>p.extras.drawings=v);
      // subcontractors handled via onclick
      bindNum('#eRig',v=>p.extras.rigPercent=v);
      bindNum('#wMatMarkup',v=>p.settings.materialMarkup=v); bindNumVat('#eMisc',v=>p.extras.misc=v);
      bindVal('#oValidity',v=>p.offer.validity=v);
      const pfi=$('#priceFileInput');
      if(pfi){ pfi.addEventListener('change',e=>{ const f=e.target.files[0]; if(f) importPriceFile(f); e.target.value=''; },{once:true}); }
      const psi=$('#priceSearchInput');
      if(psi){ psi.addEventListener('input',()=>renderPriceSearchResults(psi.value)); }
    }

    function bindVal(sel,fn){ const el=$(sel); if(el) el.addEventListener('input',()=>{ fn(el.value); persistAndUpdate(); }); }
    function bindNum(sel,fn){ const el=$(sel); if(el) el.addEventListener('input',()=>{ fn(Number(el.value)||0); persistAndUpdate(); }); }
    function bindNumVat(sel,fn){ const el=$(sel); if(el) el.addEventListener('input',()=>{ fn(parseVatInput(getProject(currentProjectId),el.value)); persistAndUpdate(); }); }

    function toggleStep(n){ const p=getProject(currentProjectId); if(!p) return; if(p.ui.openSteps.includes(n)) p.ui.openSteps=p.ui.openSteps.filter(x=>x!==n); else p.ui.openSteps.push(n); saveState(); renderProjectView(); }
    function addMaterial(){ const p=getProject(currentProjectId); if(!p) return; p.materials.push({id:uid(),name:'Nytt materiale',qty:1,unit:'stk',cost:0,waste:0,markup:p.settings.materialMarkup}); persistAndRenderProject(); }
    function updMaterial(id,key,value){ const p=getProject(currentProjectId); if(!p) return; const m=p.materials.find(x=>x.id===id); if(!m) return; m[key]=['qty','cost','waste','markup'].includes(key)?(Number(value)||0):value; persistAndUpdate(); }
    function removeMaterial(id){ const p=getProject(currentProjectId); if(!p) return; p.materials=p.materials.filter(m=>m.id!==id); persistAndRenderProject(); }
    function addPackage(idx){ const p=getProject(currentProjectId); if(!p) return; addOnPackages[idx].items.forEach(item=>{ p.materials.push({...item,id:uid(),cost:lookupPriceForMaterial(item.name)||0}); }); persistAndRenderProject(); }
    function setAllMarkup(v){ const p=getProject(currentProjectId); if(!p) return; p.materials=p.materials.map(m=>({...m,markup:v})); persistAndRenderProject(); }
    function setAllWaste(v){ const p=getProject(currentProjectId); if(!p) return; p.materials=p.materials.map(m=>({...m,waste:v})); persistAndRenderProject(); }
    function duplicateLastMaterial(){ const p=getProject(currentProjectId); if(!p||!p.materials.length) return; const last=p.materials[p.materials.length-1]; p.materials.push({...last,id:uid(),name:last.name+' kopi'}); persistAndRenderProject(); }
    function addCatalogMaterial(id){ const p=getProject(currentProjectId); if(!p) return; const item=getCatalogItem(id); if(!item) return; p.materials.push({id:uid(),name:item.name,qty:1,unit:item.unit||'stk',cost:item.userPrice||0,waste:0,markup:p.settings.materialMarkup,itemNo:item.itemNo||'',regularPrice:item.regularPrice||0,discountPercent:item.discountPercent||0}); rememberRecentCatalog(id); persistAndRenderProject(); const s=$('#priceSearchInput'); if(s) s.value=''; renderPriceSearchResults(''); }
    function deleteCurrentProject(){ if(!confirm('Slette prosjektet?')) return; state.projects=state.projects.filter(p=>p.id!==currentProjectId); saveState(); openDashboard(); }



    // Logo file input
    document.getElementById('logoFileInput')?.addEventListener('change',function(e){
      const file=e.target.files[0]; if(!file) return;
      if(file.size>2*1024*1024){ alert('Logo er for stor (maks 2MB)'); return; }
      const reader=new FileReader();
      reader.onload=function(ev){
        state.company.logo=ev.target.result;
        showLogoPreview(ev.target.result);
      };
      reader.readAsDataURL(file);
      e.target.value='';
    });

    document.addEventListener('change',function(e){
      if(e.target.classList.contains('ep-chk')){
        var epid=e.target.getAttribute('data-epid');
        if(epid) _offerState.extraPostsChecked[epid]=e.target.checked;
        renderOfferPreview();
      }
    });

    document.addEventListener('click',e=>{
      const t=e.target;
      if(t.id==='newCustomerBtn'||t.id==='newCustomerBtn2') openCustomerModal();
      if(t.id==='newProjectBtn'||t.id==='newProjectBtn2') openProjectModal();
      if(t.id==='backToDashboard') openDashboard();
      if(t.id==='saveProjectBtn'){ persistAndRenderProject(); alert('Prosjekt lagret.'); }
      if(t.id==='deleteProjectBtn') deleteCurrentProject();
      if(t.id==='settingsBtn') openSettings();
      if(t.id==='saveSettingsBtn') saveSettings();
      if(t.id==='backToOverviewBtn'){ $('#settingsView').classList.add('hidden'); $('#dashboardView').classList.remove('hidden'); renderDashboard(); }
      if(t.id==='backupBtn') exportData();
      if(t.id==='importBtn') $('#importFile').click();
      if(t.id==='toggleEx'){ const p=getProject(currentProjectId); if(p){ p.settings.vatMode='ex'; persistAndRenderProject(); } }
      if(t.id==='toggleInc'){ const p=getProject(currentProjectId); if(p){ p.settings.vatMode='inc'; persistAndRenderProject(); } }
    });
    $('#importFile').addEventListener('change',e=>{ const f=e.target.files[0]; if(f) importData(f); e.target.value=''; });
    $('#customerSearch').addEventListener('input',renderDashboard);
    $('#projectSearch').addEventListener('input',renderDashboard);

    window.editCustomer=editCustomer; window.deleteCustomer=deleteCustomer; window.openProject=openProject;
    window.toggleStep=toggleStep; window.updMaterial=updMaterial; window.removeMaterial=removeMaterial;
    window.addMaterial=addMaterial; window.addPackage=addPackage; window.setAllMarkup=setAllMarkup;
    window.setAllWaste=setAllWaste; window.addCatalogMaterial=addCatalogMaterial; window.clearPriceCatalog=clearPriceCatalog;
    window.toggleFavoriteCatalog=toggleFavoriteCatalog; window.duplicateLastMaterial=duplicateLastMaterial;
    window.applyTemplateById=applyTemplateById; window.openTemplateModal=openTemplateModal; window.deleteUserTemplate=deleteUserTemplate;
    window.addOfferPost=addOfferPost; window.addSuggestedMaterialsAsPost=addSuggestedMaterialsAsPost; window.updatePost=updatePost;
    window.togglePost=togglePost; window.removePost=removePost; window.movePost=movePost;
    window.closeModal=closeModal; window.backdropClose=backdropClose;

    // Hide app until auth verified
    document.querySelector('.app').style.display='none';
    initAuth();

    // ── DELETE MATERIAL FROM CALC ──────────────────────
window.deleteCalcMaterial=function(matId){
  const result=window._lastCalcResult;
  if(!result || !result.materialsWithPrices) return;

  // fjern fra data
  result.materialsWithPrices = result.materialsWithPrices.filter(m => m.matId !== matId);

  // fjern fra UI
  const row=document.querySelector('tr[data-mat-id="'+matId+'"]');
  if(row) row.remove();

  // recalc etter slett
  recalcCalcMaterials();
};

window.updateCalcSendButtonUI=function(){
  // gjør ingenting foreløpig – bare unngår crash
};
