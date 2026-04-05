    function blankProject(){
      return {
        id:uid(), name:'', customerId:'', address:'', type:'Annet', startPref:'Snarest', status:'Utkast',
        description:'', note:'', settings:{...state.settings},
        work:{people:1,hours:8,timeRate:state.settings.timeRate,internalCost:state.settings.internalCost,risk:'Normal',actualHours:0,laborHireHours:0},
        materials:[], extras:{rental:0,waste:0,subcontractors:[],laborHire:0,rigPercent:10,misc:0,driftRate:0,scaffolding:0,drawings:0},
        offer:{included:'Arbeid, standard materialer og rydding.',excluded:'Skjulte feil og ekstraarbeid.',validity:'14 dager'},
        bebodd:false,
        operations:[], indirect:{avstandKm:0,antallDager:0,antallTurer:0,people:1,riggTimer:null,planTimer:null,oppryddingPct:3},
        offerPosts:[], ui:{openSteps:[1,2,3,4,5,6]}
      };
    }



    // compute() er flyttet til calcEngine.js

    let currentTab = 'info';

    function openProject(id){
      currentProjectId=id;
      const p=getProject(id); if(!p) return;
      $('#dashboardView').classList.add('hidden');
      $('#projectView').classList.remove('hidden');
      renderProjectView();
    }

    function renderProjectView(){
      const p=getProject(currentProjectId); if(!p) return;
      const cust=getCustomer(p.customerId);
      $('#projectTitle').textContent=p.name||'Prosjekt';
      $('#projectSubtitle').textContent=`${cust?.name||'Ingen kunde valgt'} • ${p.type} • ${p.address||'Ingen adresse'}`;
      $('#toggleEx').classList.toggle('active',p.settings.vatMode==='ex');
      $('#toggleInc').classList.toggle('active',p.settings.vatMode==='inc');
      $('#projectTopPills').innerHTML=`
        <span class="pill status-${p.status}">${p.status}</span>
        <span class="pill">Oppstart: ${escapeHtml(p.startPref)}</span>
        <span class="pill">Kunde: ${escapeHtml(cust?.name||'Ingen')}</span>`;

      const tabs=[
        {id:'info',      label:'Info'},
        {id:'materials', label:'Kalkyle'},
        {id:'offer',     label:'Tilbud'},
        {id:'preview',   label:'Tilbudsvisning'},
      ];
      const tabBar=`<div class="tab-bar">${tabs.map(t=>`<button class="tab-btn ${currentTab===t.id?'active':''}" onclick="switchTab('${t.id}')">${t.label}</button>`).join('')}<button class="tab-btn" onclick="openHandleliste()" style="margin-left:auto;font-size:11px;opacity:0.8">Handleliste</button></div>`;

      let panel='';
      if(currentTab==='info')      panel=renderTabInfo(p);
      if(currentTab==='materials') panel=renderTabMaterials(p);
       if(currentTab==='offer')     panel=renderTabOffer(p);
      if(currentTab==='preview'){
        $('#stepsContainer').innerHTML=tabBar+'<div class="tab-panel" style="padding:0">'+renderTabPreview(p)+'</div>';
        bindProjectEvents();
        initOfferPreviewTab(p);
        return;
      }

      $('#stepsContainer').innerHTML=tabBar+`<div class="tab-panel">${panel}</div>`;
      bindProjectEvents(); updateSummary(); refreshOpSummary();
    }

    function switchTab(id){
      if(id==='offer'){
        const p=getProject(state.currentProjectId);
        if(p&&p.materials&&p.materials.length>0){
          alert('Du kan ikke gå til tilbud ennå. Du har fortsatt materialer i materiallisten. Flytt dem til tilbudsposter først.');
          return;
        }
      }
      currentTab=(id==='costs'||id==='work')?'info':id; renderProjectView();
    }

    function persistAndUpdate(){ const p=getProject(currentProjectId); if(!p) return; p.updatedAt=Date.now(); saveState(); updateSummary(); }
    function persistAndRenderProject(){ const p=getProject(currentProjectId); if(!p) return; p.updatedAt=Date.now(); saveState(); renderProjectView(); renderDashboard(); }

    function updateSummary(){
      const p=getProject(currentProjectId); if(!p) return;
      const c=window.compute(p), ps=window.computeOfferPostsTotal(p);
      const vatM=p.settings.vatMode==='inc';
      // Update Tømrerarbeid display live
      const laborEl=document.getElementById('summaryLaborVal');
      if(laborEl) laborEl.textContent=currency(vatM?c.totalLaborSaleEx*1.25:c.totalLaborSaleEx);
      const totalDisplayHours=(c.hoursTotal||0)+(ps.hours||0);
      const hoursEl=document.getElementById('summaryLaborHours');
      if(hoursEl) hoursEl.textContent='Totalt: '+totalDisplayHours+'t | Tømrer: '+(c.hoursTotal||0)+'t | Poster: '+(ps.hours||0)+'t';
      const ohd=document.getElementById('offerTotalHoursDisplay');
      if(ohd) ohd.textContent=totalDisplayHours+'t';
      const oht=document.getElementById('offerTotalHoursText');
      if(oht) oht.textContent=totalDisplayHours+'t';
      const ohDetail=document.getElementById('offerTotalHoursDetail');
      if(ohDetail){
        const parts=[];
        if(c.hoursTotal>0) parts.push(c.hoursTotal+'t fra arbeid');
        if(ps.hours>0) parts.push(ps.hours+'t fra poster');
        ohDetail.textContent=parts.join(' + ');
      }
      const ohInput=document.getElementById('offerTotalHours');
      if(ohInput) ohInput.placeholder=(c.totalHours||0)+'';
      const summaryModeNote=$('#summaryModeNote'); if(summaryModeNote) summaryModeNote.textContent=(p.offerPosts&&p.offerPosts.length)?'Viser sum av tilbudsposter':(p.settings.vatMode==='inc'?'Viser inkl. mva':'Viser eks. mva');
    }

    function openDashboard(){ currentProjectId=null; $('#projectView').classList.add('hidden'); $('#dashboardView').classList.remove('hidden'); renderDashboard(); }

    function renderTabInfo(p){
      const opts=['<option value="">Velg kunde</option>'].concat(state.customers.map(c=>`<option value="${c.id}" ${p.customerId===c.id?'selected':''}>${escapeHtml(c.name)}</option>`)).join('');
      return `
        <div class="tab-section">
          <div class="tab-section-heading">Prosjektdetaljer</div>
          <div class="row">
            <div><label>Prosjektnavn</label><input id="fName" value="${escapeAttr(p.name)}" /></div>
            <div><label>Adresse</label><input id="fAddress" value="${escapeAttr(p.address)}" /></div>
          </div>
        </div>
        <div class="tab-section">
          <div class="tab-section-heading">Kunde og type</div>
          <div class="row">
            <div><label>Kunde</label><select id="fCustomer">${opts}</select></div>
            <div><label>Type jobb</label><select id="fType"><option ${sel(p.type,'Terrasse')}>Terrasse</option><option ${sel(p.type,'Lettvegg')}>Lettvegg</option><option ${sel(p.type,'Vindu')}>Vindu</option><option ${sel(p.type,'Listing')}>Listing</option><option ${sel(p.type,'Kledning')}>Kledning</option><option ${sel(p.type,'Etterisolering')}>Etterisolering</option><option ${sel(p.type,'Rehabilitering')}>Rehabilitering</option><option ${sel(p.type,'Bad')}>Bad</option><option ${sel(p.type,'Tak')}>Tak</option><option ${sel(p.type,'Annet')}>Annet</option></select></div>
          </div>
          <label style="display:flex;align-items:center;gap:8px;margin-top:12px;cursor:pointer"><input type="checkbox" id="fBebodd" style="width:auto" ${p.bebodd?'checked':''} /> Bebodd bolig (kunden bor i bygget under arbeidet)</label>
        </div>
        <div class="tab-section">
          <div class="tab-section-heading">Tidsplan og status</div>
          <div class="row">
            <div><label>Ønsket oppstart</label><select id="fStart"><option ${sel(p.startPref,'Snarest')}>Snarest</option><option ${sel(p.startPref,'Innen 2 uker')}>Innen 2 uker</option><option ${sel(p.startPref,'Innen 1 måned')}>Innen 1 måned</option><option ${sel(p.startPref,'Etter avtale')}>Etter avtale</option></select></div>
            <div><label>Status</label><select id="fStatus"><option ${sel(p.status,'Utkast')}>Utkast</option><option ${sel(p.status,'Sendt')}>Sendt</option><option ${sel(p.status,'Vunnet')}>Vunnet</option><option ${sel(p.status,'Tapt')}>Tapt</option><option ${sel(p.status,'Pågår')}>Pågår</option><option ${sel(p.status,'Ferdig')}>Ferdig</option></select></div>
          </div>
        </div>
        <div class="tab-section">
          <div class="tab-section-heading">Notater</div>
          <label>Beskrivelse</label><textarea id="fDescription">${escapeHtml(p.description)}</textarea>
          <label>Notat</label><textarea id="fNote">${escapeHtml(p.note||'')}</textarea>
        </div>
        <div class="tab-section collapsed">
          <div class="tab-section-heading tab-section-toggle" onclick="toggleSection(this)">Satser</div>
          <div class="tab-section-body">
            <div class="row">
              <div><label>Timepris eks. mva</label><input id="wTimeRate" type="number" value="${displayVatValue(p,p.work.timeRate)}" /></div>
              <div><label>Intern timekost</label><input id="wInternalCost" type="number" value="${p.work.internalCost}" /></div>
            </div>
            <div class="row-3" style="margin-top:12px">
              <div><label>Kjøring / drift per time</label><input id="sDriveCost" type="number" value="${displayVatValue(p,p.settings.driveCost)}" /></div>
              <div><label>Påslag materialer %</label><input id="wMatMarkup" type="number" value="${p.settings.materialMarkup}" /></div>
              <div><label>Rigg & drift %</label><input id="eRig" type="number" value="${p.extras.rigPercent}" /></div>
            </div>
            <div class="row" style="margin-top:12px">
              <div><label>Gyldighet tilbud (dager)</label><input id="oValidity" value="${escapeAttr(p.offer.validity||'14')}" placeholder="14" /></div>
            </div>
            <div class="footer-note" style="margin-top:8px">Timepris og satser brukes i alle kalkyler for dette prosjektet.</div>
          </div>
        </div>
        `;
    }





    // ── KALKYLEMOTOR UI ────────────────────────────────────────

    function opSelectHtml(current, factors){
      return Object.entries(factors).map(function([k,v]){
        return '<option value="'+k+'" '+(current===k?'selected':'')+'>'+v.label+'</option>';
      }).join('');
    }

    function renderOperationRow(op){
      var rateDef=productionRates[op.type]||productionRates.annet;
      var result=calcOperationHours(op);
      var id=op.id;
      // Build optgroups for operation type selector using subgroups
      var typeOptions='';
      utvendigSubgroups.forEach(function(g){
        typeOptions+='<optgroup label="Utv: '+g.label+'">';
        g.jobs.forEach(function(k){
          var v=productionRates[k];
          typeOptions+='<option value="'+k+'" '+(op.type===k?'selected':'')+'>'+(v?v.label:k)+'</option>';
        });
        typeOptions+='</optgroup>';
      });
      innvendigSubgroups.forEach(function(g){
        typeOptions+='<optgroup label="Inn: '+g.label+'">';
        g.jobs.forEach(function(k){
          var v=productionRates[k];
          typeOptions+='<option value="'+k+'" '+(op.type===k?'selected':'')+'>'+(v?v.label:k)+'</option>';
        });
        typeOptions+='</optgroup>';
      });
      return '<div class="op-row'+(op.sentToOffer?' sent':'')+'" data-opid="'+id+'">'
        +'<div class="op-row-top">'
          +'<div><label>Jobbtype</label>'
          +'<select data-field="type" onchange="updOperation(\''+id+'\',\'type\',this.value)">'
          +typeOptions
          +'</select></div>'
          +'<div><label>'+rateDef.unit+'</label>'
          +'<input type="number" data-field="mengde" value="'+(op.mengde||'')+'" placeholder="0" oninput="updOperation(\''+id+'\',\'mengde\',this.value)" /></div>'
          +'<button class="btn small secondary" onclick="toggleOpMaterials(\''+id+'\')" style="align-self:end;margin-bottom:1px">Mat</button>'
          +(op.sentToOffer?'<span class="op-sent-badge" style="align-self:end;margin-bottom:1px">Sendt</span>':'<button class="btn small danger" onclick="removeOperation(\''+id+'\')" style="align-self:end;margin-bottom:1px">Slett</button>')
        +'</div>'
        +'<div class="op-row-factors">'
          +'<div><label>Produksjonstakt</label>'
          +'<select data-field="level" onchange="updOperation(\''+id+'\',\'level\',this.value)">'
          +'<option value="low" '+(op.level==='low'?'selected':'')+'>Lav ('+rateDef.low+' t/'+rateDef.unit+')</option>'
          +'<option value="normal" '+((op.level||'normal')==='normal'?'selected':'')+'>Normal ('+rateDef.normal+' t/'+rateDef.unit+')</option>'
          +'<option value="high" '+(op.level==='high'?'selected':'')+'>Hoy ('+rateDef.high+' t/'+rateDef.unit+')</option>'
          +'</select></div>'
          +'<div><label>Tilkomst</label>'
          +'<select data-field="tilkomst" onchange="updOperation(\''+id+'\',\'tilkomst\',this.value)">'
          +opSelectHtml(op.tilkomst||'normal',accessFactors)
          +'</select></div>'
          +'<div><label>Hoyde</label>'
          +'<select data-field="hoyde" onchange="updOperation(\''+id+'\',\'hoyde\',this.value)">'
          +opSelectHtml(op.hoyde||'bakke',heightFactors)
          +'</select></div>'
          +'<div><label>Kompleksitet</label>'
          +'<select data-field="kompleksitet" onchange="updOperation(\''+id+'\',\'kompleksitet\',this.value)">'
          +opSelectHtml(op.kompleksitet||'normal',complexityFactors)
          +'</select></div>'
        +'</div>'
        +'<div class="op-result">'
          +'<span class="op-basis">Basis: '+result.baseTimer+'t'
          +(result.faktorer.samlet!==1?' | Faktor: x'+result.faktorer.samlet:'')+'</span>'
          +'<span class="op-hours">'+result.faktorTimer+' timer</span>'
        +'</div>'
        +'<div id="op-materials-'+id+'" class="op-materials-panel" style="display:none;margin-top:10px;padding:10px 14px;background:#f9fbff;border:1px solid #dce8ff;border-radius:12px">'
          +renderOpMaterials(op, id)
        +'</div>'
      +'</div>';
    }

    function renderIndirectInputs(p){
      var ind=p.indirect||{};
      return '<div class="indirect-panel">'
        +'<div class="calc-section-label">Prosjektforhold (indirekte tid)</div>'
        +'<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px">'
          +'<div><label>Avstand (km)</label>'
          +'<input type="number" value="'+(ind.avstandKm||'')+'" placeholder="0" oninput="updIndirect(\'avstandKm\',this.value)" /></div>'
          +'<div><label>Antall dager</label>'
          +'<input type="number" value="'+(ind.antallDager||'')+'" placeholder="Auto" oninput="updIndirect(\'antallDager\',this.value)" /></div>'
          +'<div><label>Antall turer</label>'
          +'<input type="number" value="'+(ind.antallTurer||'')+'" placeholder="Auto" oninput="updIndirect(\'antallTurer\',this.value)" /></div>'
          +'<div><label>Personer</label>'
          +'<input type="number" value="'+(ind.people||1)+'" placeholder="1" oninput="updIndirect(\'people\',this.value)" /></div>'
        +'</div>'
        +'<div class="row-3" style="margin-top:10px">'
          +'<div><label>Rigg (timer, blank=auto)</label>'
          +'<input type="number" value="'+(ind.riggTimer!=null?ind.riggTimer:'')+'" placeholder="Auto" oninput="updIndirect(\'riggTimer\',this.value)" /></div>'
          +'<div><label>Planlegging (timer, blank=auto)</label>'
          +'<input type="number" value="'+(ind.planTimer!=null?ind.planTimer:'')+'" placeholder="Auto" oninput="updIndirect(\'planTimer\',this.value)" /></div>'
          +'<div><label>Opprydding %</label>'
          +'<input type="number" value="'+(ind.oppryddingPct!=null?ind.oppryddingPct:3)+'" placeholder="3" oninput="updIndirect(\'oppryddingPct\',this.value)" /></div>'
        +'</div>'
      +'</div>';
    }

    function buildPriceCatalogMap(){
      var map = {};
      if(!state.priceCatalog || !state.priceCatalog.length) return map;

      state.priceCatalog.forEach(function(item){
        var productName = (item.productName || '').trim();
        var description = (item.description || '').trim();
        var fullName = (item.name || '').trim();
        var entry = {
          cost: item.userPrice || 0,
          unit: item.unit || 'stk',
          itemNo: item.itemNo || ''
        };
        // Index by productName (short)
        if(productName && !map[productName]) map[productName] = entry;
        // Index by full name (productName + description combined)
        if(fullName && !map[fullName]) map[fullName] = entry;
        // Index by "productName description" if different
        if(productName && description){
          var combined = productName + ' ' + description;
          if(!map[combined]) map[combined] = entry;
        }
      });
      return map;
    }

    function renderOpMaterials(op, opId){
      var priceCatalogMap = buildPriceCatalogMap();
      var p = getProject(currentProjectId);
      var est=window.buildOperationEstimate(op, priceCatalogMap, (p&&p.manualPrices)||{});
      if(!est || !est.materialer || est.materialer.length===0){
        return '<div style="font-size:12px;color:var(--muted);font-style:italic">Ingen materialforslag for denne jobbtypen.</div>';
      }
      var html='<div style="font-size:11px;font-weight:700;color:var(--muted);margin-bottom:6px">Materialer:</div>'
        +'<table style="width:100%;font-size:11px;border-collapse:collapse">'
        +'<thead><tr style="border-bottom:1px solid #dce8ff">'
        +'<th style="text-align:left;padding:4px;color:var(--muted)">Material</th>'
        +'<th style="text-align:right;padding:4px;color:var(--muted)">Netto</th>'
        +'<th style="text-align:right;padding:4px;color:var(--muted)">Brutto</th>'
        +'<th style="text-align:right;padding:4px;color:var(--muted)">Pris/enhet</th>'
        +'<th style="text-align:right;padding:4px;color:var(--muted)">Total</th>'
        +'</tr></thead><tbody>';
      est.materialer.forEach(function(m){
        var pricePerUnit = m.cost > 0 ? currency(m.cost) : '—';
        var totalPrice = m.totalCost > 0 ? currency(m.totalCost) : '—';
        var priceNote = m.cost === 0 ? ' style="color:var(--muted)"' : '';
        var priceClass = m.cost === 0 ? ' title="Pris ikke funnet i katalog"' : '';
        var qtyBrutto = m.qtyWithWaste || m.qty;
        var hasWaste = m.waste > 0 && qtyBrutto !== m.qty;
        html+='<tr style="border-bottom:1px solid #eef2ff">'
          +'<td style="padding:4px">'+escapeHtml(m.name)+'</td>'
          +'<td style="text-align:right;padding:4px;color:var(--muted)">'+m.qty.toFixed(1)+' '+escapeHtml(m.unit)+'</td>'
          +'<td style="text-align:right;padding:4px;font-weight:600">'+(hasWaste?qtyBrutto.toFixed(1):m.qty.toFixed(1))+' '+escapeHtml(m.unit)+(hasWaste?' <span style="color:var(--muted);font-weight:400">(+'+m.waste+'%)</span>':'')+'</td>'
          +'<td style="text-align:right;padding:4px'+priceNote+priceClass+'">'+pricePerUnit+'</td>'
          +'<td style="text-align:right;padding:4px;font-weight:700'+priceNote+priceClass+'">'+totalPrice+'</td>'
          +'</tr>';
      });
      html+='</tbody></table>';
      if(est.totalMaterialCost > 0){
        html+='<div style="margin-top:6px;padding:6px;background:#f0f7ff;border-radius:8px;font-weight:700;color:var(--blue)">'
          +'Totalt materiale: '+currency(est.totalMaterialCost)
          +'</div>';
      } else {
        var hasCatalog = state.priceCatalog && state.priceCatalog.length > 0;
        var msgStyle = hasCatalog ? 'background:#f0f7ff;color:#1e40af' : 'background:#fffbf0;color:var(--muted)';
        var msgText = hasCatalog
          ? ' Noen materialer ikke funnet i prisfil «'+state.priceFileName+'» — priser settes til 0'
          : ' Ingen prisfil lastet — last opp en prisfil for automatiske priser';
        html+='<div style="margin-top:6px;padding:6px;border-radius:8px;font-size:11px;'+msgStyle+'">'
          +msgText
          +'</div>';
      }
      if(est.errors && est.errors.length){
        html+='<div style="margin-top:6px;padding:6px;background:#fee2e2;border-radius:8px;font-size:10px;color:#991b1b">'
          +' '+escapeHtml(est.errors.join(' | '))
          +'</div>';
      }
      // Send to offer button
      html+='<div style="margin-top:8px;display:flex;gap:6px">'
        +'<button class="btn small primary" style="flex:1;background:var(--accent)" onclick="sendOperationToOffer(\''+opId+'\')">Send til tilbud</button>'
        +'</div>';
      return html;
    }

    window.toggleOpMaterials=function(opId){
      var panel=document.getElementById('op-materials-'+opId);
      if(!panel) return;
      var isHidden=panel.style.display==='none';
      panel.style.display=isHidden?'block':'none';
    };

    window.sendOperationToOffer=function(opId){
      var p=getProject(currentProjectId); if(!p) return;
      var op=(p.operations||[]).find(function(o){return o.id===opId;});
      if(!op) return;

      // Get price catalog and estimate
      var priceCatalogMap=buildPriceCatalogMap();
      var proj = getProject(currentProjectId);
      var est=window.buildOperationEstimate(op, priceCatalogMap, (proj&&proj.manualPrices)||{});
      if(!est || !est.materialer || est.materialer.length===0){
        alert('Ingen materialer å sende for denne operasjonen.');
        return;
      }

      // Create snapshot materials with prices
      var snapshotMats=est.materialer.map(function(m){
        return {
          id:uid(),
          name:m.name,
          qty:m.qty,
          unit:m.unit,
          cost:m.cost||0,
          waste:m.waste||0,
          totalCost:m.totalCost||0,
          markup:p.settings.materialMarkup||0
        };
      });

      if(!p.offerPosts) p.offerPosts=[];

      // Create offer post from operation
      var opTypeName=productionRates[op.type]?.label||op.type||'Operasjon';
      var totalPrice=est.totalMaterialCost||0;

      p.offerPosts.push({
        id:uid(),
        name:'Operasjon: '+opTypeName,
        description:snapshotMats.length+' materiallinjer fra '+escapeHtml(opTypeName),
        type:'calc',
        price:Math.round(totalPrice),
        enabled:true,
        snapshotMaterials:snapshotMats,
        snapshotCompute:{
          matSaleEx:totalPrice,
          matCost:totalPrice
        }
      });

      // Mark operation as sent to offer
      op.sentToOffer=true;

      // Ask user if they want to delete from active operations
      var shouldRemove=confirm('Operasjonen sendt til tilbud!\n\n'+snapshotMats.length+' materiallinjer lagt til som tilbudspost.\n\nØnsker du å fjerne operasjonen fra aktiv kalkyle?');
      if(shouldRemove){
        p.operations=p.operations.filter(function(o){return o.id!==opId;});
      }

      persistAndRenderProject();
    };

    function renderOperations(p){
      var ops=p.operations||[];
      if(!ops.length) return '<div class="empty" style="padding:14px">Ingen operasjoner. Klikk <strong>+ Legg til jobb</strong> for a beregne arbeidstid automatisk.</div>';

      var rows=ops.map(renderOperationRow).join('');
      var html=rows+renderIndirectInputs(p)+'<div id="opSummary"></div>';
      return html;
    }

    // Oppdater kun summerings-boksen uten full re-render
    function refreshOpSummary(){
      var el=document.getElementById('opSummary'); if(!el) return;
      var p=getProject(currentProjectId); if(!p||!p.operations||!p.operations.length){el.innerHTML='';return;}
      var r=window.calcProject(p);
      el.innerHTML='<div style="margin-top:10px;padding:14px;background:#f5f8ff;border:1px solid #dce8ff;border-radius:14px">'
        // Timer-oversikt
        +'<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:10px">'
          +'<div><div style="font-size:11px;color:var(--muted);font-weight:700">Direkte timer</div>'
          +'<div style="font-size:20px;font-weight:800">'+r.direkteTimer+'t</div></div>'
          +'<div><div style="font-size:11px;color:var(--muted);font-weight:700">Indirekte timer</div>'
          +'<div style="font-size:20px;font-weight:800">'+r.indirektTimer+'t</div></div>'
          +'<div><div style="font-size:11px;color:var(--muted);font-weight:700">Totalt</div>'
          +'<div style="font-size:22px;font-weight:800;color:var(--blue)">'+r.totalTimer+'t</div></div>'
        +'</div>'
        // Indirekte breakdown med detaljer
        +'<div style="margin-bottom:10px">'
          +r.indirekte.map(function(ip){
            return '<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid #edf2ff">'
              +'<div><span style="font-size:12px;font-weight:700">'+ip.label+'</span>'
              +(ip.detalj?'<span style="font-size:11px;color:var(--muted);margin-left:8px">'+ip.detalj+'</span>':'')
              +'</div>'
              +'<span style="font-size:13px;font-weight:800;color:var(--blue)">'+ip.timer+'t</span>'
            +'</div>';
          }).join('')
        +'</div>'
        // Pris-oversikt
        +'<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;padding-top:10px;border-top:1px solid #dce8ff">'
          +'<div><div style="font-size:11px;color:var(--muted);font-weight:700">Arbeidspris eks. mva</div>'
          +'<div style="font-size:17px;font-weight:800">'+currency(r.laborSaleEx)+'</div></div>'
          +'<div><div style="font-size:11px;color:var(--muted);font-weight:700">Din kostnad</div>'
          +'<div style="font-size:17px;font-weight:800">'+currency(r.laborCost)+'</div></div>'
          +'<div><div style="font-size:11px;color:var(--muted);font-weight:700">Margin</div>'
          +'<div style="font-size:17px;font-weight:800;color:#167a42">'+r.margin+'%</div></div>'
        +'</div>'
        +'<div style="margin-top:12px;display:flex;gap:8px">'
          +'<button class="btn small primary" onclick="applyCalcProjectHours()">Bruk '+r.totalTimer+'t som prosjekttimer</button>'
          +'<button class="btn small soft" onclick="sendCalcProjectToOffer()">Send til tilbud</button>'
        +'</div>'
      +'</div>';
    }

    window.updIndirect=function(key, val){
      var p=getProject(currentProjectId); if(!p) return;
      if(!p.indirect) p.indirect={};
      // Blank input → null (utlos auto-beregning), ellers tall
      if(val===''||val==null){
        p.indirect[key]=(key==='riggTimer'||key==='planTimer')?null:0;
      } else {
        p.indirect[key]=Number(val)||0;
      }
      p.updatedAt=Date.now(); saveState();
      refreshOpSummary();
      updateSummary();
    };

    // Oppdater resultat-stripen for en enkelt rad uten re-render
    function refreshOpRow(opId){
      var p=getProject(currentProjectId); if(!p) return;
      var op=(p.operations||[]).find(function(o){return o.id===opId;});
      if(!op) return;
      var row=document.querySelector('.op-row[data-opid="'+opId+'"]');
      if(!row) return;
      var result=calcOperationHours(op);
      var resEl=row.querySelector('.op-result');
      if(resEl){
        resEl.innerHTML='<span style="font-size:12px;color:var(--muted)">Basis: '+result.baseTimer+'t'
          +(result.faktorer.samlet!==1?' | Faktor: x'+result.faktorer.samlet:'')+'</span>'
          +'<span style="font-size:15px;font-weight:800;color:var(--blue)">'+result.faktorTimer+' timer</span>';
      }
    }

    window.addOperation=function(){
      var p=getProject(currentProjectId); if(!p) return;
      if(!p.operations) p.operations=[];
      p.operations.push(blankOperation());
      persistAndRenderProject();
    };

    window.removeOperation=function(id){
      var p=getProject(currentProjectId); if(!p) return;
      p.operations=(p.operations||[]).filter(function(o){return o.id!==id;});
      persistAndRenderProject();
    };

    // Kjerne: oppdater felt → recalc rad + summary (uten full re-render)
    window.updOperation=function(id, key, val){
      var p=getProject(currentProjectId); if(!p) return;
      var op=(p.operations||[]).find(function(o){return o.id===id;});
      if(!op) return;
      op[key]=key==='mengde'?(Number(val)||0):val;
      // Dropdown-endring av type → full re-render (enhet endres)
      if(key==='type'){
        p.updatedAt=Date.now(); saveState(); renderProjectView(); return;
      }
      // Alt annet → oppdater kun tall, behold fokus
      p.updatedAt=Date.now(); saveState();
      refreshOpRow(id);
      refreshOpSummary();
      updateSummary();
    };

    window.applyCalcProjectHours=function(){
      var p=getProject(currentProjectId); if(!p||!p.operations||!p.operations.length) return;
      var result=window.calcProject(p);
      p.work.hours=result.totalTimer;
      persistAndRenderProject();
    };

    window.sendCalcProjectToOffer=function(){
      var p=getProject(currentProjectId); if(!p||!p.operations||!p.operations.length) return;
      var result=window.calcProject(p);
      showModal(
        '<div class="section-head">'
        +'<div class="section-title">Send kalkyle til tilbud</div>'
        +'<button class="btn small secondary" onclick="closeModal()">Lukk</button>'
        +'</div>'
        +'<label>Navn pa tilbudspost</label>'
        +'<input id="calcEnginePostName" value="'+escapeAttr(p.name||'Kalkyle')+'" />'
        +'<div style="margin-top:12px;padding:12px;background:#f5f8ff;border-radius:14px;font-size:13px;color:var(--muted)">'
        +result.operasjoner.length+' operasjoner | '+result.totalTimer+' timer | '+currency(result.laborSaleEx)+' arbeid'
        +'</div>'
        +'<div class="toolbar" style="margin-top:14px">'
        +'<button class="btn primary" onclick="doSendCalcEngine()">Legg til i tilbud</button>'
        +'<button class="btn secondary" onclick="closeModal()">Avbryt</button>'
        +'</div>'
      );
    };

    window.doSendCalcEngine=function(){
      var name=document.getElementById('calcEnginePostName')?.value.trim()||'Kalkyle';
      var p=getProject(currentProjectId); if(!p) return;
      var result=window.calcProject(p);
      if(!p.offerPosts) p.offerPosts=[];
      var desc=result.operasjoner.map(function(o){return o.navn+' '+o.mengde+' '+o.enhet+' ('+o.faktorTimer+'t)';}).join(', ');
      p.offerPosts.push({
        id:uid(),
        name:name,
        description:desc,
        type:'calc',
        price:Math.round(result.laborSaleEx),
        enabled:true,
        snapshotMaterials:p.materials.map(function(m){return Object.assign({},m);}),
        snapshotCompute:{
          hoursTotal:result.totalTimer,
          laborSaleEx:result.laborSaleEx,
          laborCost:result.laborCost,
          matSaleEx:0,
          matCost:0,
          costPrice:result.laborCost,
          saleEx:result.laborSaleEx,
          saleInc:result.laborSaleEx*1.25,
          profit:result.profit,
          margin:result.margin
        }
      });
      p.materials=[];
      p.work.hours=0;
      closeModal();
      persistAndRenderProject();
    };

    function buildRecipeSettingsHtml(){
      var defs = window.calcDefs || {};
      var rates = window.productionRates || {};
      var html = '';
      Object.keys(defs).forEach(function(type){
        var def = defs[type];
        if(!def.recipe || !def.recipe.materialer) return;
        var label = (rates[type]||{}).label || def.label || type;
        var matRows = def.recipe.materialer.filter(function(m){ return m.ratio!=null && m.baseRef; }).map(function(m){
          var userOverride = ((state.calcRecipes||{})[type]||{})[m.id];
          var currentVal = userOverride && userOverride.ratio!=null ? userOverride.ratio : m.ratio;
          var isOverridden = userOverride && userOverride.ratio!=null;
          return '<div style="display:grid;grid-template-columns:1fr 80px 60px;gap:6px;align-items:center">'
            +'<label style="font-size:11px">'+(m.name||m.nameTemplate||m.id)+'</label>'
            +'<input type="number" step="0.001" value="'+currentVal+'" style="'+(isOverridden?'border-color:var(--blue);font-weight:700;color:var(--blue)':'')+'" onchange="window.updateRecipeRatio(\''+type+'\',\''+m.id+'\',this.value)" />'
            +'<span style="font-size:10px;color:var(--muted)">'+m.unit+'/'+m.baseRef+'</span>'
            +'</div>';
        }).join('');
        if(!matRows) return;
        html += '<div class="rate-section">'
          +'<div class="rate-section-toggle" onclick="toggleRateSection(this)" aria-expanded="false" role="button" tabindex="0" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();toggleRateSection(this)}">'
            +'<span>'+escapeHtml(label)+'</span>'
            +'<span class="rate-toggle-icon">&#9654;</span>'
          +'</div>'
          +'<div class="rate-section-body">'
            +'<div style="display:flex;flex-direction:column;gap:6px">'+matRows+'</div>'
          +'</div>'
        +'</div>';
      });
      return html || '<div style="font-size:11px;color:var(--muted);font-style:italic">Ingen jobbtyper med reseptmengder enda.</div>';
    }

    function renderTabMaterials(p){
      const allTpls=getAllTemplates();
      const builtIn=allTpls.filter(t=>t.builtIn);
      const userTpls=allTpls.filter(t=>!t.builtIn);
      const hasCatalog=state.priceCatalog.length>0;
      return `
        <!-- KALKYLEMOTOR (DEACTIVATED) -->
        <div class="card" style="background:#fafcff;border:1px solid var(--line);box-shadow:none;margin-bottom:14px;display:none">
          <div class="section-head">
            <div class="section-title">Kalkylemotor</div>
            <button class="btn small secondary" onclick="addOperation()">+ Legg til jobb</button>
          </div>
          ${renderOperations(p)}
        </div>

        <!-- KALKULATOR (MAIN) -->
        <div class="card" style="background:#fafcff;border:1px solid var(--line);box-shadow:none;margin-bottom:14px">
          <div class="calc-widget-header">
            <div class="section-title">Time & Material Kalkulator</div>
            <button class="btn small secondary" onclick="toggleRateSettings()">Mine erfaringstimer</button>
          </div>
          <div class="calc-info-tip">
            <span>Velg jobbtype, fyll inn mal, fa materialer og pris automatisk, deretter send til tilbud.</span>
          </div>
          <div id="calcWidget">
            <div class="calc-job-grid">
              <div class="calc-job-col calc-job-utvendig">
                <label>Utvendig arbeid</label>
                <select id="calcJobTypeUtvendig" onchange="selectCalcJobCategory('utvendig', this.value)">
                  <option value="">-- Velg utvendig jobb --</option>
                  ${utvendigSubgroups.map(g =>
                    '<optgroup label="'+g.label+'">'
                    +g.jobs.map(k => {
                      const r = productionRates[k];
                      return '<option value="'+k+'">'+(r ? r.label : k)+'</option>';
                    }).join('')
                    +'</optgroup>'
                  ).join('')}
                </select>
              </div>
              <div class="calc-job-col calc-job-innvendig">
                <label>Innvendig arbeid</label>
                <select id="calcJobTypeInnvendig" onchange="selectCalcJobCategory('innvendig', this.value)">
                  <option value="">-- Velg innvendig jobb --</option>
                  ${innvendigSubgroups.map(g =>
                    '<optgroup label="'+g.label+'">'
                    +g.jobs.map(k => {
                      const r = productionRates[k];
                      return '<option value="'+k+'">'+(r ? r.label : k)+'</option>';
                    }).join('')
                    +'</optgroup>'
                  ).join('')}
                </select>
              </div>
            </div>
            <input type="hidden" id="calcJobType" />
            <div id="calcInputs"></div>
            <div id="calcResults"></div>
            <div id="calcRateSettings" class="hidden rate-settings-panel">
              <div class="rate-settings-header">Mine egne erfaringstimer (t/m2 eller t/stk)</div>
              ${rateSettingsGroups.map((group,gi) => `
                <div class="rate-section">
                  <div class="rate-section-toggle" onclick="toggleRateSection(this)" aria-expanded="false" role="button" tabindex="0" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();toggleRateSection(this)}">
                    <span>${group.label}</span>
                    <span class="rate-toggle-icon">&#9654;</span>
                  </div>
                  <div class="rate-section-body" id="rateGroup_${gi}">
                    <div class="row-3">
                      ${group.keys.map(k => {
                        const v = calcDefaults[k];
                        if(!v) return '';
                        const rateLabel = (productionRates[k]||{}).label || k;
                        return '<div><label>'+rateLabel+' ('+v.label+')</label><input type="number" step="0.1" value="'+((state.calcRates||{})[k]!=null?(state.calcRates||{})[k]:v.tPerM2)+'" onchange="saveCalcRate(\''+k+'\',this.value);saveState();if(window.runCalcWidget)runCalcWidget()" /></div>';
                      }).join('')}
                    </div>
                  </div>
                </div>`).join('')}
              <div class="footer-note" style="margin-top:8px">Endre verdiene over for a justere timesatser basert pa din erfaring</div>
              <div class="rate-settings-header" style="margin-top:16px;padding-top:12px;border-top:1px solid var(--line)">Materialresepter (forholdstall)</div>
              <div style="font-size:11px;color:var(--muted);margin-bottom:8px">Juster mengdeforholdstall for materialer. P\u00E5virker beregning for jobbtyper med resept.</div>
              ${buildRecipeSettingsHtml()}
            </div>
          </div>
        </div>

        <!-- MALER (DEACTIVATED) -->
        <div class="card" style="background:#fafcff;border:1px solid var(--line);box-shadow:none;margin-bottom:14px;display:none">
          <div class="section-head">
            <div style="display:flex;align-items:center;gap:10px;cursor:pointer" onclick="toggleMalerSection()">
              <div class="section-title">Maler</div>
              <span id="malerToggleIcon" style="color:var(--muted);font-size:13px">▶</span>
            </div>
            <button class="btn small success" onclick="openTemplateModal()">+ Ny mal</button>
          </div>
          <div id="malerContent" style="display:none">
          <div class="footer-note" style="margin-bottom:12px;padding:10px;background:${hasCatalog?'#edfff4':'#fffbea'};border-radius:12px;border:1px solid ${hasCatalog?'#b7f0cf':'#fde68a'}">
            ${hasCatalog?` Prisfil aktiv: <strong>${escapeHtml(state.priceFileName)}</strong> (${state.priceCatalog.length} varer) — priser hentes automatisk`:' Ingen prisfil lastet opp — priser settes til 0 og må fylles inn manuelt'}
          </div>
          <div style="font-weight:800;font-size:13px;color:var(--muted);margin-bottom:8px">Innebygde maler <span style="font-weight:500;font-size:12px">— rediger og lagre som din egen for å koble til prisfilen din</span></div>
          <div class="package-grid">
            ${builtIn.map(t=>`
              <div style="display:flex;gap:6px">
                <button class="package-btn" style="flex:1" onclick="applyTemplateById('${t.id}')">${escapeHtml(t.name)}<small>${t.materials.length} materialer</small></button>
                <button style="border:none;background:none;color:var(--muted);font-size:12px;cursor:pointer;align-self:center;padding:4px 6px;white-space:nowrap" onclick="copyBuiltinTemplate('${t.id}')"></button>
              </div>`).join('')}
          </div>
          <div style="font-weight:800;font-size:13px;color:var(--muted);margin:14px 0 8px">Mine maler ${userTpls.length?'':'<span style="font-weight:500">(ingen enda)</span>'}</div>
          ${userTpls.length?`<div class="package-grid">${userTpls.map(t=>`
            <div style="display:flex;gap:6px">
              <button class="package-btn user-template" style="flex:1" onclick="applyTemplateById('${t.id}')">${escapeHtml(t.name)}<small>${t.materials.length} materialer • priser fra prisfil</small></button>
              <button style="border:none;background:none;color:var(--muted);font-size:12px;cursor:pointer;align-self:center;padding:4px 6px;white-space:nowrap" onclick='openTemplateModal(${JSON.stringify(t).replace(/'/g,"&#39;")})'  ></button>
            </div>`).join('')}</div>`
          :`<div class="footer-note">Klikk <strong>+ Ny mal</strong> for å lage din første egendefinerte mal.</div>`}
        </div>

          </div>

        <!-- PRISFIL OG SØK -->
        <div class="card" style="padding:14px;background:#fafcff;border:1px solid var(--line);box-shadow:none;margin-bottom:14px">
          <div class="row">
            <div>
              <label>Prisfil</label>
              <div class="toolbar">
                <button class="btn small secondary" onclick="document.getElementById('priceFileInput').click()">Last opp prisfil</button>
                ${state.priceCatalog.length?`<button class="btn small danger" onclick="clearPriceCatalog()">Fjern prisfil</button>`:''}
              </div>
              <input id="priceFileInput" type="file" accept=".csv,text/csv" class="hidden" />
              <div class="footer-note">${state.priceCatalog.length?`Aktiv: ${escapeHtml(state.priceFileName)} • ${state.priceCatalog.length} varer`:'Ingen prisfil lastet opp enda.'}</div>
            </div>
            <div>
              <label>Søk i prisfil — marker som favoritt</label>
              <input id="priceSearchInput" placeholder="Søk varenummer, navn eller beskrivelse" value="" />
            </div>
          </div>
          <div id="priceSearchResults" class="list" style="margin-top:12px"></div>
        </div>

        <div class="tab-section collapsed">
          <div class="tab-section-heading tab-section-toggle" onclick="toggleSection(this)">Prosjektkostnader</div>
          <div class="tab-section-body">
            <div class="row-3">
              <div><label>Leie av utstyr</label><input id="eRental" type="number" value="${displayVatValue(p,p.extras.rental)}" /></div>
              <div><label>Avfall / deponi</label><input id="eWaste" type="number" value="${displayVatValue(p,p.extras.waste)}" /></div>
              <div><label>Stillas</label><input id="eScaffolding" type="number" value="${displayVatValue(p,p.extras.scaffolding||0)}" /></div>
            </div>
            <div class="row" style="margin-top:12px">
              <div><label>Tegninger / byggesøknad</label><input id="eDrawings" type="number" value="${displayVatValue(p,p.extras.drawings||0)}" /></div>
              <div><label>Diverse</label><input id="eMisc" type="number" value="${displayVatValue(p,p.extras.misc)}" /></div>
            </div>
          </div>
        </div>

        <div class="tab-section collapsed">
          <div class="tab-section-heading tab-section-toggle" onclick="toggleSection(this)">Underentreprenører</div>
          <div class="tab-section-body">
            <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:10px">
              ${(p.extras.subcontractors||[]).map(s=>`
                <div style="display:grid;grid-template-columns:1fr 1fr auto;gap:8px;align-items:center">
                  <select onchange="updSubcontractor('${s.id}','trade',this.value)">
                    ${['Rørlegger','Elektriker','Maler','Snekker','Flislegger','Tømrer','Annet'].map(t=>`<option value="${t}" ${s.trade===t?'selected':''}>${t}</option>`).join('')}
                  </select>
                  <input type="number" placeholder="Beløp" value="${displayVatValue(p,s.amount||0)}" onchange="updSubcontractor('${s.id}','amount',this.value)" />
                  <button class="btn small danger" onclick="removeSubcontractor('${s.id}')">Slett</button>
                </div>`).join('')}
            </div>
            <button class="btn small soft" onclick="addSubcontractor()">+ Legg til underentreprenør</button>
            ${(p.extras.subcontractors||[]).length ? `<div class="footer-note" style="margin-top:8px">Total: <strong>${currency((p.extras.subcontractors||[]).reduce((s,x)=>s+(Number(x.amount)||0),0))}</strong></div>` : ''}
          </div>
        </div>

        <div class="tab-section collapsed">
          <div class="tab-section-heading tab-section-toggle" onclick="toggleSection(this)">Innleid håndverker</div>
          <div class="tab-section-body">
            <div class="row-3">
              <div><label>Timepris innleid</label><input id="wLaborHireRate" type="number" value="${displayVatValue(p,p.extras.laborHire||0)}" /></div>
              <div><label>Antall timer</label><input id="wLaborHireHours" type="number" value="${p.work.laborHireHours||0}" /></div>
              <div><label>Faktiske timer brukt (logging)</label><input id="wActualHours" type="number" value="${p.work.actualHours||0}" /></div>
            </div>
          </div>
        </div>

        ${renderMaterialSummary(p)}
        `;
    }

    var _matViewMode = 'detailed';

    window.toggleMatViewMode = function(){
      _matViewMode = _matViewMode === 'detailed' ? 'simple' : 'detailed';
      var p = getProject(currentProjectId);
      if(!p) return;
      var el = document.getElementById('matSummaryContent');
      if(el) el.innerHTML = renderMaterialSummaryContent(p);
    };

    function renderMaterialSummary(p){
      var priceCatalogMap = buildPriceCatalogMap();
      var projectEst = window.buildProjectEstimate(p, priceCatalogMap);
      if(!projectEst || !projectEst.materialer || projectEst.materialer.length===0) return '';

      var mats = projectEst.materialer;
      var totalCost = mats.reduce(function(s,m){ return s+(m.totalCost||0); },0);
      var totalLines = mats.length;
      var groups = window.groupMaterialsByCategory(mats);

      return '<div class="tab-section">'
        +'<div class="tab-section-heading tab-section-toggle" onclick="toggleSection(this)">Samlet materialoversikt <span style="font-weight:400;color:var(--muted);font-size:12px">('+totalLines+' linjer'+(totalCost>0?' \u2014 '+currency(totalCost):'')+')</span></div>'
        +'<div class="tab-section-body">'
          +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">'
            +'<div style="font-size:12px;color:var(--muted)">Materialer aggregert fra alle operasjoner, gruppert etter kategori.</div>'
            +'<div style="display:flex;gap:6px">'
              +'<button class="btn small soft" onclick="toggleMatViewMode()" style="font-size:11px" id="matViewToggleBtn">'+(_matViewMode==='detailed'?'Enkel visning':'Detaljert visning')+'</button>'
              +'<button class="btn small primary" onclick="openHandleliste()" style="font-size:11px">Handleliste</button>'
            +'</div>'
          +'</div>'
          +'<div id="matSummaryContent">'+renderMaterialSummaryContent(p)+'</div>'
        +'</div>'
      +'</div>';
    }

    function renderMaterialSummaryContent(p){
      var priceCatalogMap = buildPriceCatalogMap();
      var projectEst = window.buildProjectEstimate(p, priceCatalogMap);
      if(!projectEst || !projectEst.materialer) return '';

      var mats = projectEst.materialer;
      var totalCost = mats.reduce(function(s,m){ return s+(m.totalCost||0); },0);
      var groups = window.groupMaterialsByCategory(mats);

      // Prisdekning-indikator
      var withPrice = mats.filter(function(m){ return m.cost > 0; }).length;
      var total = mats.length;
      var pct = total > 0 ? Math.round(withPrice / total * 100) : 0;
      var color = pct >= 90 ? '#16a34a' : pct >= 50 ? '#ca8a04' : '#dc2626';
      var hasCatalog = state.priceCatalog && state.priceCatalog.length > 0;
      var coverageHtml = '<div class="price-coverage">'
        +'<span class="price-coverage-bar" style="--pct:'+pct+'%;--bar-color:'+color+'"></span>'
        +'<span class="price-coverage-text" style="color:'+color+'">'+withPrice+' av '+total+' materialer har pris ('+pct+'%)</span>'
        +(!hasCatalog ? ' <a href="#" onclick="document.getElementById(\'priceFileInput\').click();return false" style="font-size:11px;margin-left:6px">Last opp prisfil</a>' : '')
        +'</div>';

      // Update toggle button text
      var btn = document.getElementById('matViewToggleBtn');
      if(btn) btn.textContent = _matViewMode==='detailed' ? 'Enkel visning' : 'Detaljert visning';

      if(_matViewMode === 'simple'){
        return coverageHtml + renderSimpleView(groups, totalCost);
      }
      return coverageHtml + renderDetailedView(groups, totalCost);
    }

    function renderSimpleView(groups, totalCost){
      var html = '<div class="mat-category-grid">';
      groups.forEach(function(g){
        html += '<div class="mat-category-card">'
          +'<div class="mat-cat-label">'+escapeHtml(g.label)+'</div>'
          +'<div class="mat-cat-count">'+g.items.length+' materialer</div>'
          +(g.totalCost > 0 ? '<div class="mat-cat-cost">'+currency(g.totalCost)+'</div>' : '<div class="mat-cat-cost" style="color:var(--muted)">\u2014</div>')
        +'</div>';
      });
      html += '</div>';
      if(totalCost > 0){
        html += '<div class="mat-summary-total">Totalt materialer: <strong>'+currency(totalCost)+'</strong></div>';
      }
      return html;
    }

    function renderDetailedView(groups, totalCost){
      var html = '';
      groups.forEach(function(g){
        html += '<div class="mat-category-group">'
          +'<div class="mat-category-header">'
            +'<span>'+escapeHtml(g.label)+' <span style="color:var(--muted);font-weight:400;font-size:11px">('+g.items.length+')</span></span>'
            +(g.totalCost > 0 ? '<span style="font-weight:700">'+currency(g.totalCost)+'</span>' : '')
          +'</div>'
          +'<table style="width:100%;font-size:12px;border-collapse:collapse">'
            +'<thead><tr style="border-bottom:1px solid var(--line)">'
              +'<th style="text-align:left;padding:4px 8px;color:var(--muted);font-weight:600;font-size:10px">Material</th>'
              +'<th style="text-align:right;padding:4px 8px;color:var(--muted);font-weight:600;font-size:10px">Netto</th>'
              +'<th style="text-align:right;padding:4px 8px;color:var(--muted);font-weight:600;font-size:10px">Brutto</th>'
              +'<th style="text-align:right;padding:4px 8px;color:var(--muted);font-weight:600;font-size:10px">Pris</th>'
              +'<th style="text-align:right;padding:4px 8px;color:var(--muted);font-weight:600;font-size:10px">Total</th>'
            +'</tr></thead><tbody>';
        g.items.forEach(function(m){
          var hasWaste = m.waste > 0 && m.qtyWithWaste > m.qty;
          var nameKey = escapeAttr(m.name);
          var isManual = m.priceSource === 'manual';
          var priceStr;
          if(m.cost > 0){
            priceStr = '<span'+(isManual?' class="manual-price" title="Manuell pris"':'')+'>'+currency(m.cost)+'</span>';
          } else {
            priceStr = '<input type="number" class="inline-price-input" placeholder="Pris" data-mat="'+nameKey+'" data-unit="'+escapeAttr(m.unit)+'" onchange="setManualPrice(this)" />';
          }
          var totalStr = m.totalCost > 0 ? currency(m.totalCost) : '<span style="color:var(--muted)">\u2014</span>';
          var sourceTip = m.sources && m.sources.length > 1 ? ' title="Fra: '+escapeHtml(m.sources.join(', '))+'"' : '';
          html += '<tr style="border-bottom:1px solid var(--line)">'
            +'<td style="padding:5px 8px"'+sourceTip+'>'+escapeHtml(m.name)
              +(m.sources && m.sources.length > 1 ? ' <span style="color:var(--muted);font-size:10px">('+m.sources.length+')</span>' : '')
            +'</td>'
            +'<td style="text-align:right;padding:5px 8px;color:var(--muted)">'+m.qty.toFixed(1)+' '+escapeHtml(m.unit)+'</td>'
            +'<td style="text-align:right;padding:5px 8px;font-weight:600">'+(hasWaste?m.qtyWithWaste.toFixed(1):m.qty.toFixed(1))+' '+escapeHtml(m.unit)
              +(hasWaste?' <span style="color:var(--muted);font-weight:400;font-size:10px">(+'+m.waste+'%)</span>':'')
            +'</td>'
            +'<td style="text-align:right;padding:5px 8px">'+priceStr+'</td>'
            +'<td style="text-align:right;padding:5px 8px;font-weight:700">'+totalStr+'</td>'
          +'</tr>';
        });
        html += '</tbody></table></div>';
      });
      if(totalCost > 0){
        html += '<div class="mat-summary-total">Totalt materialer: <strong>'+currency(totalCost)+'</strong></div>';
      }
      return html;
    }


    window.openHandleliste = function(){
      var p = getProject(currentProjectId);
      if(!p) return;
      var priceCatalogMap = buildPriceCatalogMap();
      var projectEst = window.buildProjectEstimate(p, priceCatalogMap);
      if(!projectEst || !projectEst.materialer || projectEst.materialer.length===0){
        alert('Ingen materialer \u00E5 vise. Kj\u00F8r en kalkyle f\u00F8rst.');
        return;
      }
      var mats = projectEst.materialer;
      var groups = window.groupMaterialsByCategory(mats);
      var totalCost = mats.reduce(function(s,m){ return s+(m.totalCost||0); },0);
      var cust = getCustomer(p.customerId);

      var html = '<div class="handleliste-overlay" onclick="if(event.target===this)closeHandleliste()">'
        +'<div class="handleliste-modal">'
          +'<div class="handleliste-header">'
            +'<div>'
              +'<div style="font-size:18px;font-weight:800">Handleliste</div>'
              +'<div style="font-size:12px;color:var(--muted)">'+escapeHtml(p.name||'Prosjekt')+' \u2014 '+(cust?escapeHtml(cust.name):'Ingen kunde')+'</div>'
            +'</div>'
            +'<div style="display:flex;gap:6px">'
              +'<button class="btn small soft" onclick="exportHandlelisteCsv()">Eksporter CSV</button>'
              +'<button class="btn small soft" onclick="printHandleliste()">Skriv ut</button>'
              +'<button class="btn small soft" onclick="closeHandleliste()">\u2715</button>'
            +'</div>'
          +'</div>';

      groups.forEach(function(g){
        html += '<div class="handleliste-cat">'
          +'<div class="handleliste-cat-title">'+escapeHtml(g.label)
            +(g.totalCost>0?' <span style="font-weight:400;color:var(--muted);font-size:12px">\u2014 '+currency(g.totalCost)+'</span>':'')
          +'</div>';
        g.items.forEach(function(m){
          var qtyDisplay = m.qtyWithWaste > m.qty ? m.qtyWithWaste.toFixed(1) : m.qty.toFixed(1);
          var priceStr = m.cost > 0 ? currency(m.cost)+'/'+escapeHtml(m.unit) : '';
          var totalStr = m.totalCost > 0 ? currency(m.totalCost) : '';
          html += '<div class="handleliste-item">'
            +'<span>'+escapeHtml(m.name)+'</span>'
            +'<span class="hl-prices">'
              +'<span class="hl-qty">'+qtyDisplay+' '+escapeHtml(m.unit)+'</span>'
              +(totalStr ? '<span class="hl-total">'+totalStr+'</span>' : '')
            +'</span>'
            +'<input type="checkbox" class="hl-check" />'
          +'</div>';
        });
        html += '</div>';
      });

      if(totalCost > 0){
        html += '<div style="text-align:right;padding:12px 0;border-top:2px solid var(--line);font-size:16px;font-weight:800">Totalsum: '+currency(totalCost)+'</div>';
      }

      html += '</div></div>';
      document.getElementById('modalHost').innerHTML = html;
    };

    window.closeHandleliste = function(){
      document.getElementById('modalHost').innerHTML = '';
    };

    window.printHandleliste = function(){
      window.print();
    };

    window.exportHandlelisteCsv = function(){
      var p = getProject(currentProjectId);
      if(!p) return;
      var priceCatalogMap = buildPriceCatalogMap();
      var projectEst = window.buildProjectEstimate(p, priceCatalogMap);
      if(!projectEst || !projectEst.materialer || !projectEst.materialer.length) return;
      var mats = projectEst.materialer;
      var groups = window.groupMaterialsByCategory(mats);
      var lines = ['Material;Mengde;Enhet;Pris/enhet;Total;Kategori'];
      groups.forEach(function(g){
        g.items.forEach(function(m){
          var qty = m.qtyWithWaste > m.qty ? m.qtyWithWaste : m.qty;
          lines.push('"'+m.name.replace(/"/g,'""')+'";'+qty.toFixed(1)+';'+m.unit+';'+(m.cost||0)+';'+(m.totalCost||0)+';"'+g.label.replace(/"/g,'""')+'"');
        });
      });
      var csv = lines.join('\n');
      var blob = new Blob(['\uFEFF'+csv], {type:'text/csv;charset=utf-8'});
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = (p.name||'handleliste').replace(/[^a-zæøåA-ZÆØÅ0-9]/g,'_')+'.csv';
      a.click();
      URL.revokeObjectURL(a.href);
    };

    window.setManualPrice = function(input){
      var p = getProject(currentProjectId);
      if(!p) return;
      var matName = input.getAttribute('data-mat');
      var price = parseFloat(input.value) || 0;
      if(!p.manualPrices) p.manualPrices = {};
      if(price > 0){
        p.manualPrices[matName] = price;
      } else {
        delete p.manualPrices[matName];
      }
      saveState();
      var el = document.getElementById('matSummaryContent');
      if(el) el.innerHTML = renderMaterialSummaryContent(p);
    };

    function renderWarnings(p, c){
      var warnings=window.generateWarnings(p, c);
      if(!warnings.length) return '';
      var styles={
        danger:'background:#fef2f2;border:1px solid #fca5a5;color:#991b1b',
        warning:'background:#fffbeb;border:1px solid #fde68a;color:#92400e',
        info:'background:#eff6ff;border:1px solid #bfdbfe;color:#1e40af'
      };
      var icons={danger:'!!',warning:'!',info:'i'};
      var iconBg={danger:'#fee2e2;color:#dc2626',warning:'#fef3c7;color:#d97706',info:'#dbeafe;color:#2563eb'};
      return '<div style="display:flex;flex-direction:column;gap:6px;margin-top:14px;margin-bottom:14px">'
        +warnings.map(function(w){
          return '<div style="'+styles[w.severity]+';border-radius:12px;padding:10px 14px;display:flex;align-items:center;gap:10px;font-size:13px">'
            +'<span style="flex-shrink:0;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;background:'+iconBg[w.severity]+'">'+icons[w.severity]+'</span>'
            +'<span>'+escapeHtml(w.text)+'</span>'
          +'</div>';
        }).join('')
      +'</div>';
    }

    function renderSuggestedMaterialsForOffer(p){
      var priceCatalogMap = buildPriceCatalogMap();
      var manualPrices = (p && p.manualPrices) || {};

      // Only count operations NOT already sent to offer
      var unsentOps = (p.operations||[]).filter(function(op){ return !op.sentToOffer; });
      var opCount = 0;
      var unsentMats = [];
      unsentOps.forEach(function(op){
        var opEst = window.buildOperationEstimate(op, priceCatalogMap, manualPrices);
        if(opEst && opEst.materialer && opEst.materialer.length){
          opCount++;
          unsentMats = unsentMats.concat(opEst.materialer);
        }
      });

      if(unsentMats.length === 0){
        return '';
      }

      var totalCost = unsentMats.reduce(function(s,m){ return s + (m.totalCost||0); }, 0);

      return '<div class="card" style="margin-bottom:14px;background:#fffbf0;border:1px solid #fde68a;border-radius:16px">'
        +'<div class="section-head"><div class="section-title">Foreslåtte materialer fra operasjoner</div></div>'
        +'<div style="font-size:12px;color:var(--muted);margin-bottom:12px;line-height:1.5">'
        +'Basert på '+opCount+' operasjon'+(opCount>1?'er':'')+' som ikke er sendt til tilbud ennå.'
        +'</div>'
        +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">'
          +'<div style="padding:10px;background:var(--yellow-soft);border:1px solid rgba(196,162,58,.2);border-radius:10px">'
            +'<div style="font-size:13px;font-weight:700;color:var(--muted)">Total foreslåtte materialer:</div>'
            +'<div style="font-size:18px;font-weight:800;margin-top:4px">'+currency(totalCost)+'</div>'
            +'<div style="font-size:11px;color:var(--muted);margin-top:2px">'+unsentMats.length+' linjer</div>'
          +'</div>'
          +'<div style="padding:10px;background:var(--yellow-soft);border:1px solid rgba(196,162,58,.2);border-radius:10px">'
            +'<div style="font-size:13px;font-weight:700;color:var(--muted)">Operasjoner med forslag:</div>'
            +'<div style="font-size:18px;font-weight:800;margin-top:4px">'+opCount+'</div>'
            +'<div style="font-size:11px;color:var(--muted);margin-top:2px">stk</div>'
          +'</div>'
        +'</div>'
        +'<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">'
          +'<button class="btn small primary" onclick="window.addSuggestedMaterialsAsPost(true)" style="flex:1;background:#ff9500;border:none"> Legg alle '+unsentMats.length+' linjer som én post</button>'
          +'<button class="btn small primary" onclick="window.addSuggestedMaterialsAsPost(false)" style="flex:1;background:#a78bfa;border:none"> Legg som '+opCount+' poster</button>'
        +'</div>'
        +'</div>';
    }

    function renderTabOffer(p){
      const c=window.compute(p), ps=window.computeOfferPostsTotal(p);
      // Exclude raw p.materials from offer sums — only offer posts count
      const offerMatSaleEx=c.totalMatSaleEx-c.matSaleEx;
      const offerMatCost=c.totalMatCost-c.matCost;
      const offerSaleEx=c.totalSaleEx-c.matSaleEx;
      const offerCostPrice=c.totalCostPrice-c.matCost;
      const offerProfit=offerSaleEx-offerCostPrice;
      const offerMargin=offerSaleEx?(offerProfit/offerSaleEx*100):0;
      return `
        <div class="section-head">
          <div class="section-title">Tilbudsposter</div>
          <div class="toolbar">
            <button class="btn small secondary" onclick="addOfferPost()">+ Legg til post</button>
          </div>
        </div>
        ${renderSuggestedMaterialsForOffer(p)}
        <div class="card" style="margin-top:8px;background:#fafcff">${renderOfferPosts(p)}</div>
        ${p.materials.length?`<div class="footer-note" style="margin:10px 0;padding:10px;background:#fffbea;border:1px solid #fde68a;border-radius:12px"> Merk: Materialer i materiallisten er ikke med i tilbudssummen. Legg dem inn i tilbudsposter for å få dem med.</div>`:''}
        <div class="card" style="margin-top:14px;background:#fafcff">
          <div class="section-head"><div class="section-title">Oppsummering</div></div>

          <div class="offer-hours-bar">
            <div class="hours-value" id="offerTotalHoursDisplay">${ps.hours+c.hoursTotal}t</div>
            <div>
              <div class="hours-label"> Totalt timebruk</div>
              <div class="hours-detail" id="offerTotalHoursDetail">${c.hoursTotal>0?c.hoursTotal+'t fra arbeid':''} ${ps.hours>0&&c.hoursTotal>0?'+ ':''} ${ps.hours>0?ps.hours+'t fra poster':''}</div>
            </div>
          </div>

          <div class="row-3">
            <div class="offer-stat-card blue-theme">
              <div class="offer-stat-label"> Tømrerarbeid</div>
              <div class="offer-stat-value" id="summaryLaborVal">${currency(p.settings.vatMode==='inc'?c.totalLaborSaleEx*1.25:c.totalLaborSaleEx)}</div>
              <div class="offer-stat-detail" id="summaryLaborHours">Totalt: ${c.totalHours}t | Tømrer: ${c.hoursTotal}t | Poster: ${ps.hours}t</div>
            </div>
            <div class="offer-stat-card green-theme">
              <div class="offer-stat-label"> Materialer</div>
              <div class="offer-stat-value">${currency(p.settings.vatMode==='inc'?offerMatSaleEx*1.25:offerMatSaleEx)}</div>
              <div class="offer-stat-detail">Innkjøp: ${currency(offerMatCost)}</div>
            </div>
            <div class="offer-stat-card amber-theme">
              <div class="offer-stat-label"> Andre kostnader</div>
              <div class="offer-stat-value">${currency(p.settings.vatMode==='inc'?(c.extrasBase+c.rigEx)*1.25:(c.extrasBase+c.rigEx))}</div>
              <div class="offer-stat-detail">Kjøring, rigg m.m.</div>
            </div>
          </div>

          ${renderWarnings(p, c)}

          <div class="offer-total-panel">
            <div class="panel-label">Totaloversikt</div>
            <div class="offer-total-grid">
              <div class="offer-total-item">
                <div class="item-label">Pris til kunde eks. mva</div>
                <div class="item-value">${currency(offerSaleEx)}</div>
              </div>
              <div class="offer-total-item">
                <div class="item-label">Pris til kunde inkl. mva</div>
                <div class="item-value highlight">${currency(offerSaleEx*1.25)}</div>
              </div>
            </div>
            <div class="offer-detail-grid">
              <div class="offer-detail-item">
                <div class="detail-label">Din kostnad</div>
                <div class="detail-value">${currency(offerCostPrice)}</div>
              </div>
              <div class="offer-detail-item">
                <div class="detail-label">Fortjeneste</div>
                <div class="detail-value profit">${currency(offerProfit)}</div>
              </div>
              <div class="offer-detail-item">
                <div class="detail-label">Margin</div>
                <div class="detail-value">${percent(offerMargin)}</div>
              </div>
            </div>
            <div class="offer-total-footer">
              <div class="footer-text" id="summaryModeNote">${p.settings.vatMode==='inc'?'Viser inkl. mva':'Viser eks. mva'}</div>
            </div>
          </div>
          <div class="offer-bottom-stats">
            <div class="offer-bottom-stat"><strong>Faste poster</strong><div>${currency(ps.fixed)}</div></div>
            <div class="offer-bottom-stat"><strong>Valgte opsjoner</strong><div>${currency(ps.options)}</div></div>
            <div class="offer-bottom-stat"><strong>Tilbudssum poster</strong><div>${currency(ps.total)}</div></div>
          </div>
        </div>`;
    }
