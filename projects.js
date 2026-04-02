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
        {id:'info',      label:'📋 Info'},
        {id:'work',      label:'🔨 Arbeid og kostnader'},
        {id:'materials', label:'🪵 Utregning og materialer'},
        {id:'offer',     label:'📄 Tilbud'},
        {id:'preview',   label:'📑 Tilbudsvisning'},
      ];
      const tabBar=`<div class="tab-bar">${tabs.map(t=>`<button class="tab-btn ${currentTab===t.id?'active':''}" onclick="switchTab('${t.id}')">${t.label}</button>`).join('')}</div>`;

      let panel='';
      if(currentTab==='info')      panel=renderTabInfo(p);
      if(currentTab==='work')      panel=renderTabWork(p);
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
      currentTab=(id==='costs'?'work':id); renderProjectView();
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
        <div class="row">
          <div><label>Prosjektnavn</label><input id="fName" value="${escapeAttr(p.name)}" /></div>
          <div><label>Kunde</label><select id="fCustomer">${opts}</select></div>
        </div>
        <div class="row">
          <div><label>Adresse</label><input id="fAddress" value="${escapeAttr(p.address)}" /></div>
          <div><label>Type jobb</label><select id="fType"><option ${sel(p.type,'Terrasse')}>Terrasse</option><option ${sel(p.type,'Lettvegg')}>Lettvegg</option><option ${sel(p.type,'Vindu')}>Vindu</option><option ${sel(p.type,'Listing')}>Listing</option><option ${sel(p.type,'Kledning')}>Kledning</option><option ${sel(p.type,'Etterisolering')}>Etterisolering</option><option ${sel(p.type,'Rehabilitering')}>Rehabilitering</option><option ${sel(p.type,'Bad')}>Bad</option><option ${sel(p.type,'Tak')}>Tak</option><option ${sel(p.type,'Annet')}>Annet</option></select></div>
        </div>
        <div class="row">
          <div><label>Ønsket oppstart</label><select id="fStart"><option ${sel(p.startPref,'Snarest')}>Snarest</option><option ${sel(p.startPref,'Innen 2 uker')}>Innen 2 uker</option><option ${sel(p.startPref,'Innen 1 måned')}>Innen 1 måned</option><option ${sel(p.startPref,'Etter avtale')}>Etter avtale</option></select></div>
          <div><label>Status</label><select id="fStatus"><option ${sel(p.status,'Utkast')}>Utkast</option><option ${sel(p.status,'Sendt')}>Sendt</option><option ${sel(p.status,'Vunnet')}>Vunnet</option><option ${sel(p.status,'Tapt')}>Tapt</option><option ${sel(p.status,'Pågår')}>Pågår</option><option ${sel(p.status,'Ferdig')}>Ferdig</option></select></div>
        </div>
        <label style="display:flex;align-items:center;gap:8px;margin-top:8px;cursor:pointer"><input type="checkbox" id="fBebodd" style="width:auto" ${p.bebodd?'checked':''} /> Bebodd bolig (kunden bor i bygget under arbeidet)</label>
        <label>Beskrivelse</label><textarea id="fDescription">${escapeHtml(p.description)}</textarea>
        <label>Notat</label><textarea id="fNote">${escapeHtml(p.note||'')}</textarea>
        `;
    }



        function renderTabWork(p){
      const cv=window.compute(p);
      return `
        <div style="font-size:13px;font-weight:800;color:var(--muted);margin-bottom:10px">⚙️ Satser</div>
        <div class="row-3">
          <div><label>Timepris eks. mva</label><input id="wTimeRate" type="number" value="${displayVatValue(p,p.work.timeRate)}" /></div>
          <div><label>Intern timekost</label><input id="wInternalCost" type="number" value="${p.work.internalCost}" /></div>
          <div><label>Risikofaktor</label><select id="wRisk"><option ${sel(p.work.risk,'Lav')}>Lav (×1.0)</option><option ${sel(p.work.risk,'Normal')}>Normal (×1.1)</option><option ${sel(p.work.risk,'Høy')}>Høy (×1.2)</option></select></div>
        </div>
        <div class="row-3" style="margin-top:8px">
          <div><label>Gyldighet tilbud (dager)</label><input id="oValidity" value="${escapeAttr(p.offer.validity||'14')}" placeholder="14" /></div>
          <div></div><div></div>
        </div>
        <div class="row-3" style="margin-top:8px">
          <div><label>Kjøring / drift per time</label><input id="sDriveCost" type="number" value="${displayVatValue(p,p.settings.driveCost)}" /></div>
          <div><label>Påslag materialer %</label><input id="wMatMarkup" type="number" value="${p.settings.materialMarkup}" /></div>
          <div><label>Rigg & drift %</label><input id="eRig" type="number" value="${p.extras.rigPercent}" /></div>
        </div>

        <div style="margin-top:18px;padding-top:14px;border-top:1px solid var(--line)">
          <div style="font-size:13px;font-weight:800;color:var(--muted);margin-bottom:10px">📋 Prosjektkostnader</div>
          <div class="row-3">
            <div><label>Leie av utstyr</label><input id="eRental" type="number" value="${displayVatValue(p,p.extras.rental)}" /></div>
            <div><label>Avfall / deponi</label><input id="eWaste" type="number" value="${displayVatValue(p,p.extras.waste)}" /></div>
            <div><label>🏗️ Stillas</label><input id="eScaffolding" type="number" value="${displayVatValue(p,p.extras.scaffolding||0)}" /></div>
          </div>
          <div class="row-3" style="margin-top:8px">
            <div><label>📐 Tegninger / byggesøknad</label><input id="eDrawings" type="number" value="${displayVatValue(p,p.extras.drawings||0)}" /></div>
            <div><label>Diverse</label><input id="eMisc" type="number" value="${displayVatValue(p,p.extras.misc)}" /></div>
            <div></div>
          </div>
          <div style="margin-top:10px">
            <label>🔧 Underentreprenører</label>
            <div style="display:flex;flex-direction:column;gap:8px;margin-top:6px;margin-bottom:8px">
              ${(p.extras.subcontractors||[]).map(s=>`
                <div style="display:grid;grid-template-columns:1fr 1fr auto;gap:8px;align-items:center">
                  <select onchange="updSubcontractor('${s.id}','trade',this.value)" style="padding:10px 12px">
                    ${['Rørlegger','Elektriker','Maler','Snekker','Flislegger','Tømrer','Annet'].map(t=>`<option value="${t}" ${s.trade===t?'selected':''}>${t}</option>`).join('')}
                  </select>
                  <input type="number" placeholder="Beløp" value="${displayVatValue(p,s.amount||0)}" onchange="updSubcontractor('${s.id}','amount',this.value)" />
                  <button class="btn small danger" onclick="removeSubcontractor('${s.id}')">Slett</button>
                </div>`).join('')}
            </div>
            <button class="btn small soft" onclick="addSubcontractor()">+ Legg til underentreprenør</button>
            ${(p.extras.subcontractors||[]).length ? `<div class="footer-note" style="margin-top:6px">Total: <strong>${currency((p.extras.subcontractors||[]).reduce((s,x)=>s+(Number(x.amount)||0),0))}</strong></div>` : ''}
          </div>
        </div>

        <div style="margin-top:18px;padding-top:14px;border-top:1px solid var(--line)">
          <div style="font-size:13px;font-weight:800;color:var(--muted);margin-bottom:10px">👷 Innleid håndverker</div>
          <div class="row-3">
            <div><label>Timepris innleid</label><input id="wLaborHireRate" type="number" value="${displayVatValue(p,p.extras.laborHire||0)}" /></div>
            <div><label>Antall timer</label><input id="wLaborHireHours" type="number" value="${p.work.laborHireHours||0}" /></div>
            <div><label>Faktiske timer brukt (logging)</label><input id="wActualHours" type="number" value="${p.work.actualHours||0}" /></div>
          </div>
        </div>
        <div class="footer-note" style="margin-top:8px">Timepris og satser brukes i alle kalkyler for dette prosjektet.</div>`;
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
      return '<div class="op-row" data-opid="'+id+'" style="border:1px solid var(--line);border-radius:12px;padding:12px;margin-bottom:8px;background:'+(op.sentToOffer?'#f0fdf4':'#fff')+'">'
        // Rad 1: type + mengde + materialer + slett
        +'<div style="display:grid;grid-template-columns:1fr 80px auto auto auto;gap:8px;align-items:end;margin-bottom:8px">'
          +'<div><label style="font-size:11px;color:var(--muted)">Jobbtype</label>'
          +'<select data-field="type" onchange="updOperation(\''+id+'\',\'type\',this.value)">'
          +Object.entries(productionRates).map(function([k,v]){
            return '<option value="'+k+'" '+(op.type===k?'selected':'')+'>'+v.label+'</option>';
          }).join('')
          +'</select></div>'
          +'<div><label style="font-size:11px;color:var(--muted)">'+rateDef.unit+'</label>'
          +'<input type="number" data-field="mengde" value="'+(op.mengde||'')+'" placeholder="0" oninput="updOperation(\''+id+'\',\'mengde\',this.value)" /></div>'
          +'<button class="btn small secondary" onclick="toggleOpMaterials(\''+id+'\')" style="margin-bottom:2px">🛠️ Mat</button>'
          +(op.sentToOffer?'<span style="padding:6px 10px;background:#d1fae5;color:#065f46;border-radius:6px;font-size:11px;font-weight:700;margin-bottom:2px;white-space:nowrap">✓ Sendt</span>':'<button class="btn small danger" onclick="removeOperation(\''+id+'\')" style="margin-bottom:2px">Slett</button>')
        +'</div>'
        // Rad 2: level + tilkomst + hoyde + kompleksitet
        +'<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px">'
          +'<div><label style="font-size:11px;color:var(--muted)">Produksjonstakt</label>'
          +'<select data-field="level" onchange="updOperation(\''+id+'\',\'level\',this.value)">'
          +'<option value="low" '+(op.level==='low'?'selected':'')+'>Lav ('+rateDef.low+' t/'+rateDef.unit+')</option>'
          +'<option value="normal" '+((op.level||'normal')==='normal'?'selected':'')+'>Normal ('+rateDef.normal+' t/'+rateDef.unit+')</option>'
          +'<option value="high" '+(op.level==='high'?'selected':'')+'>Hoy ('+rateDef.high+' t/'+rateDef.unit+')</option>'
          +'</select></div>'
          +'<div><label style="font-size:11px;color:var(--muted)">Tilkomst</label>'
          +'<select data-field="tilkomst" onchange="updOperation(\''+id+'\',\'tilkomst\',this.value)">'
          +opSelectHtml(op.tilkomst||'normal',accessFactors)
          +'</select></div>'
          +'<div><label style="font-size:11px;color:var(--muted)">Hoyde</label>'
          +'<select data-field="hoyde" onchange="updOperation(\''+id+'\',\'hoyde\',this.value)">'
          +opSelectHtml(op.hoyde||'bakke',heightFactors)
          +'</select></div>'
          +'<div><label style="font-size:11px;color:var(--muted)">Kompleksitet</label>'
          +'<select data-field="kompleksitet" onchange="updOperation(\''+id+'\',\'kompleksitet\',this.value)">'
          +opSelectHtml(op.kompleksitet||'normal',complexityFactors)
          +'</select></div>'
        +'</div>'
        // Rad 3: resultat for denne raden
        +'<div class="op-result" style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;padding:8px 12px;background:#f0f7ff;border-radius:10px">'
          +'<span style="font-size:12px;color:var(--muted)">Basis: '+result.baseTimer+'t'
          +(result.faktorer.samlet!==1?' | Faktor: x'+result.faktorer.samlet:'')+'</span>'
          +'<span style="font-size:15px;font-weight:800;color:var(--blue)">'+result.faktorTimer+' timer</span>'
        +'</div>'
        // Material-panel (skjult per default)
        +'<div id="op-materials-'+id+'" class="op-materials-panel" style="display:none;margin-top:8px;padding:8px 12px;background:#f9fbff;border:1px solid #dce8ff;border-radius:10px">'
          +renderOpMaterials(op, id)
        +'</div>'
      +'</div>';
    }

    function renderIndirectInputs(p){
      var ind=p.indirect||{};
      return '<div style="margin-top:12px;padding:12px;background:#fffbf0;border:1px solid #fde68a;border-radius:14px">'
        +'<div style="font-size:13px;font-weight:800;color:var(--muted);margin-bottom:8px">Prosjektforhold (indirekte tid)</div>'
        +'<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px">'
          +'<div><label style="font-size:11px;color:var(--muted)">Avstand (km en vei)</label>'
          +'<input type="number" value="'+(ind.avstandKm||'')+'" placeholder="0" oninput="updIndirect(\'avstandKm\',this.value)" /></div>'
          +'<div><label style="font-size:11px;color:var(--muted)">Antall dager</label>'
          +'<input type="number" value="'+(ind.antallDager||'')+'" placeholder="Auto" oninput="updIndirect(\'antallDager\',this.value)" /></div>'
          +'<div><label style="font-size:11px;color:var(--muted)">Antall turer</label>'
          +'<input type="number" value="'+(ind.antallTurer||'')+'" placeholder="Auto" oninput="updIndirect(\'antallTurer\',this.value)" /></div>'
          +'<div><label style="font-size:11px;color:var(--muted)">Personer</label>'
          +'<input type="number" value="'+(ind.people||1)+'" placeholder="1" oninput="updIndirect(\'people\',this.value)" /></div>'
        +'</div>'
        +'<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:8px">'
          +'<div><label style="font-size:11px;color:var(--muted)">Rigg (timer, blank=auto)</label>'
          +'<input type="number" value="'+(ind.riggTimer!=null?ind.riggTimer:'')+'" placeholder="Auto" oninput="updIndirect(\'riggTimer\',this.value)" /></div>'
          +'<div><label style="font-size:11px;color:var(--muted)">Planlegging (timer, blank=auto)</label>'
          +'<input type="number" value="'+(ind.planTimer!=null?ind.planTimer:'')+'" placeholder="Auto" oninput="updIndirect(\'planTimer\',this.value)" /></div>'
          +'<div><label style="font-size:11px;color:var(--muted)">Opprydding %</label>'
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
      var est=window.buildOperationEstimate(op, priceCatalogMap);
      if(!est || !est.materialer || est.materialer.length===0){
        return '<div style="font-size:12px;color:var(--muted);font-style:italic">Ingen materialforslag for denne jobbtypen.</div>';
      }
      var html='<div style="font-size:11px;font-weight:700;color:var(--muted);margin-bottom:6px">Materialer:</div>'
        +'<table style="width:100%;font-size:11px;border-collapse:collapse">'
        +'<thead><tr style="border-bottom:1px solid #dce8ff">'
        +'<th style="text-align:left;padding:4px;color:var(--muted)">Material</th>'
        +'<th style="text-align:right;padding:4px;color:var(--muted)">Mengde</th>'
        +'<th style="text-align:right;padding:4px;color:var(--muted)">Pris/enhet</th>'
        +'<th style="text-align:right;padding:4px;color:var(--muted)">Total</th>'
        +'</tr></thead><tbody>';
      est.materialer.forEach(function(m){
        var pricePerUnit = m.cost > 0 ? currency(m.cost) : '—';
        var totalPrice = m.totalCost > 0 ? currency(m.totalCost) : '—';
        var priceNote = m.cost === 0 ? ' style="color:var(--muted)"' : '';
        var priceClass = m.cost === 0 ? ' title="Pris ikke funnet i katalog"' : '';
        html+='<tr style="border-bottom:1px solid #eef2ff">'
          +'<td style="padding:4px">'+escapeHtml(m.name)+' '+( m.waste>0?'<span style="color:var(--muted)">(+'+m.waste+'%)</span>':'')+' </td>'
          +'<td style="text-align:right;padding:4px">'+m.qty.toFixed(1)+' '+escapeHtml(m.unit)+'</td>'
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
          ? '⚠️ Noen materialer ikke funnet i prisfil «'+state.priceFileName+'» — priser settes til 0'
          : '⚠️ Ingen prisfil lastet — last opp en prisfil for automatiske priser';
        html+='<div style="margin-top:6px;padding:6px;border-radius:8px;font-size:11px;'+msgStyle+'">'
          +msgText
          +'</div>';
      }
      if(est.errors && est.errors.length){
        html+='<div style="margin-top:6px;padding:6px;background:#fee2e2;border-radius:8px;font-size:10px;color:#991b1b">'
          +'⚠️ '+escapeHtml(est.errors.join(' | '))
          +'</div>';
      }
      // Send to offer button
      html+='<div style="margin-top:8px;display:flex;gap:6px">'
        +'<button class="btn small primary" style="flex:1;background:#0a84ff" onclick="sendOperationToOffer(\''+opId+'\')">📤 Send til tilbud</button>'
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
      var est=window.buildOperationEstimate(op, priceCatalogMap);
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
          <div class="section-head">
            <div class="section-title">📐 Time & Material Kalkulator</div>
            <span style="font-size:11px;color:#0a84ff;font-weight:700;margin-left:auto">← Eneste kalkylesystem</span>
          </div>
          <div style="padding:10px 14px;background:#eaf3ff;border-radius:10px;margin-bottom:12px;font-size:12px;color:#0a5fa8">
            💡 <strong>Bruk denne kalkulatoren for å estimere arbeid:</strong> Velg jobbtype, fyll inn mål, få materialer og pris automatisk, deretter send til tilbud.
          </div>
          <div id="calcWidget">
            <div style="display:flex;justify-content:flex-end;margin-bottom:8px">
              <button class="btn small secondary" onclick="document.getElementById('calcRateSettings').classList.toggle('hidden')">⚙️ Mine erfaringstimer</button>
            </div>
            <div style="margin-bottom:12px">
              <label>Velg jobbtype</label>
              <select id="calcJobType" onchange="updateCalcWidget()">
                <option value="">-- Velg --</option>
                <option value="terrasse">Terrasse</option>
                <option value="kledning">Kledning</option>
                <option value="tak">Tak</option>
                <option value="lettvegg">Lettvegg</option>
                <option value="etterisolering">Etterisolering</option>
                <option value="vindu">Vindu</option>
                <option value="gulv">Gulvlegging</option>
                <option value="panel">Innvendig panel</option>
                <option value="dor">Dørmontering</option>
                <option value="trapp">Trapp</option>
                <option value="bad">Bad / våtrom</option>
              </select>
            </div>
            <div id="calcInputs"></div>
            <div id="calcResults"></div>
            <div id="calcRateSettings" class="hidden" style="margin-top:14px;padding:14px;background:#fffbea;border:1px solid #fde68a;border-radius:14px">
              <div style="font-weight:800;font-size:13px;margin-bottom:10px">⚙️ Mine egne erfaringstimer (t/m² eller t/stk)</div>
              <div class="row-3">
                ${Object.entries(calcDefaults).map(([k,v])=>`
                  <div>
                    <label>${k.charAt(0).toUpperCase()+k.slice(1)} (${v.label})</label>
                    <input type="number" step="0.1" value="${(state.calcRates||{})[k]??v.tPerM2}"
                      onchange="saveCalcRate('${k}',this.value);saveState();if(window.runCalcWidget)runCalcWidget()" />
                  </div>`).join('')}
              </div>
              <div class="footer-note">Standard: Terrasse 2,5 • Kledning 1,3 • Tak 1,8 • Lettvegg 1,0 • Etterisolering 0,9 • Vindu 4,0 t/stk</div>
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
            ${hasCatalog?`✅ Prisfil aktiv: <strong>${escapeHtml(state.priceFileName)}</strong> (${state.priceCatalog.length} varer) — priser hentes automatisk`:'⚠️ Ingen prisfil lastet opp — priser settes til 0 og må fylles inn manuelt'}
          </div>
          <div style="font-weight:800;font-size:13px;color:var(--muted);margin-bottom:8px">Innebygde maler <span style="font-weight:500;font-size:12px">— rediger og lagre som din egen for å koble til prisfilen din</span></div>
          <div class="package-grid">
            ${builtIn.map(t=>`
              <div style="display:flex;gap:6px">
                <button class="package-btn" style="flex:1" onclick="applyTemplateById('${t.id}')">${escapeHtml(t.name)}<small>${t.materials.length} materialer</small></button>
                <button style="border:none;background:none;color:var(--muted);font-size:12px;cursor:pointer;align-self:center;padding:4px 6px;white-space:nowrap" onclick="copyBuiltinTemplate('${t.id}')">✏️</button>
              </div>`).join('')}
          </div>
          <div style="font-weight:800;font-size:13px;color:var(--muted);margin:14px 0 8px">Mine maler ${userTpls.length?'':'<span style="font-weight:500">(ingen enda)</span>'}</div>
          ${userTpls.length?`<div class="package-grid">${userTpls.map(t=>`
            <div style="display:flex;gap:6px">
              <button class="package-btn user-template" style="flex:1" onclick="applyTemplateById('${t.id}')">${escapeHtml(t.name)}<small>${t.materials.length} materialer • priser fra prisfil</small></button>
              <button style="border:none;background:none;color:var(--muted);font-size:12px;cursor:pointer;align-self:center;padding:4px 6px;white-space:nowrap" onclick='openTemplateModal(${JSON.stringify(t).replace(/'/g,"&#39;")})'  >✏️</button>
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
              <label>Søk i materialregister</label>
              <input id="priceSearchInput" placeholder="Søk varenummer, navn eller beskrivelse" value="" />
            </div>
          </div>
          <div id="priceSearchResults" class="list" style="margin-top:12px"></div>
        </div>

        <!-- FAVORITTER OG SIST BRUKT -->
        <div class="section-head"><div class="section-title">Favoritter fra prisfil</div></div>
        <div class="package-grid">${renderQuickCatalogButtons(getFavoriteCatalogItems(),'Ingen favoritter valgt enda.')}</div>
        <div class="section-head" style="margin-top:14px"><div class="section-title">Sist brukte varer</div></div>
        <div class="package-grid">${renderQuickCatalogButtons(getRecentCatalogItems(),'Ingen varer brukt fra prisfil enda.')}</div>

        <!-- TILLEGGSPAKKER (skjult midlertidig) -->

        <!-- VERKTØYLINJE -->
        <div class="toolbar" style="margin-top:14px;align-items:center">
          <div style="display:flex;align-items:center;gap:8px;background:#f3f6fb;border:1px solid var(--line);border-radius:12px;padding:6px 10px">
            <span style="font-size:13px;font-weight:700;color:var(--muted);white-space:nowrap">Alle påslag:</span>
            <select onchange="setAllMarkup(Number(this.value))" style="border:none;background:transparent;font-weight:700;font-size:13px;padding:4px 6px;cursor:pointer">
              <option value="">Velg %</option>
              ${[5,8,10,12,15,20,25,30].map(v=>`<option value="${v}">${v}%</option>`).join('')}
            </select>
          </div>
          <div style="display:flex;align-items:center;gap:8px;background:#f3f6fb;border:1px solid var(--line);border-radius:12px;padding:6px 10px">
            <span style="font-size:13px;font-weight:700;color:var(--muted);white-space:nowrap">Alle svinn:</span>
            <select onchange="setAllWaste(Number(this.value))" style="border:none;background:transparent;font-weight:700;font-size:13px;padding:4px 6px;cursor:pointer">
              <option value="">Velg %</option>
              ${[0,5,8,10,12,15,20,25,30].map(v=>`<option value="${v}">${v}%</option>`).join('')}
            </select>
          </div>
          <button class="btn small secondary" onclick="duplicateLastMaterial()">Kopier siste</button>
          <button class="btn small secondary" onclick="addMaterial()">+ Legg til materiale</button>
          <button class="btn small soft" onclick="openSendCalcToOfferModal()">📄 Send arbeid til tilbud</button>
        </div>

        <!-- MATERIALETABELL -->
        <div class="table-wrap" style="margin-top:14px">
          <table>
            <thead><tr><th>Navn / Varenr</th><th>Antall</th><th>Enhet</th><th>Innpris</th><th>Svinn %</th><th>Påslag %</th><th></th></tr></thead>
            <tbody>
              ${p.materials.length?p.materials.map(m=>`
                <tr>
                  <td>
                    <input value="${escapeAttr(m.name)}" onchange="updMaterial('${m.id}','name',this.value)" />
                    ${m.itemNo?`<div style="font-size:11px;color:var(--muted);margin-top:3px;padding-left:2px">🔖 ${escapeHtml(m.itemNo)}</div>`:''}
                  </td>
                  <td><input type="number" value="${m.qty}" onchange="updMaterial('${m.id}','qty',this.value)" /></td>
                  <td><input value="${escapeAttr(m.unit)}" onchange="updMaterial('${m.id}','unit',this.value)" /></td>
                  <td><input type="number" value="${displayVatValue(p,m.cost)}" onchange="updMaterial('${m.id}','cost',this.value)" style="${m.cost===0?'border-color:#f0a202;background:#fffbea':''}" /></td>
                  <td><input type="number" value="${m.waste}" onchange="updMaterial('${m.id}','waste',this.value)" /></td>
                  <td><input type="number" value="${m.markup}" onchange="updMaterial('${m.id}','markup',this.value)" /></td>
                  <td><button class="btn small danger" onclick="removeMaterial('${m.id}')">Slett</button></td>
                </tr>`).join(''):`<tr><td colspan="7"><div class="empty">Ingen materialer lagt til enda.</div></td></tr>`}
            </tbody>
          </table>
        </div>
        ${p.materials.some(m=>m.cost===0)?`<div class="footer-note" style="color:var(--yellow);margin-top:8px">⚠️ Gule felt mangler pris — fyll inn manuelt eller last opp prisfil.</div>`:''}`;
    }


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
      var projectEst = window.buildProjectEstimate(p, priceCatalogMap);

      if(!projectEst || !projectEst.materialer || projectEst.materialer.length===0){
        return '';
      }

      // Count how many operations have suggestions
      var opCount=0;
      (p.operations||[]).forEach(function(op){
        var opEst=window.buildOperationEstimate(op, priceCatalogMap);
        if(opEst && opEst.materialer && opEst.materialer.length) opCount++;
      });

      return '<div class="card" style="margin-bottom:14px;background:#fffbf0;border:1px solid #fde68a;border-radius:16px">'
        +'<div class="section-head"><div class="section-title">💡 Foreslåtte materialer fra operasjoner</div></div>'
        +'<div style="font-size:12px;color:var(--muted);margin-bottom:12px;line-height:1.5">'
        +'Basert på operasjoner og deres inndata. '
        +'<strong>Disse er IKKE automatisk med i tilbudssummen ennå.</strong>'
        +'</div>'
        +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">'
          +'<div style="padding:10px;background:#fff;border:1px solid #fde68a;border-radius:10px">'
            +'<div style="font-size:13px;font-weight:700;color:var(--muted)">Total foreslåtte materialer:</div>'
            +'<div style="font-size:18px;font-weight:800;margin-top:4px">'+currency(projectEst.totalMaterialCost||0)+'</div>'
            +'<div style="font-size:11px;color:var(--muted);margin-top:2px">'+projectEst.materialer.length+' linjer</div>'
          +'</div>'
          +'<div style="padding:10px;background:#fff;border:1px solid #fde68a;border-radius:10px">'
            +'<div style="font-size:13px;font-weight:700;color:var(--muted)">Operasjoner med forslag:</div>'
            +'<div style="font-size:18px;font-weight:800;margin-top:4px">'+opCount+'</div>'
            +'<div style="font-size:11px;color:var(--muted);margin-top:2px">stk</div>'
          +'</div>'
        +'</div>'
        +'<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">'
          +'<button class="btn small primary" onclick="window.addSuggestedMaterialsAsPost(true)" style="flex:1;background:#ff9500;border:none">📦 Legg alle '+projectEst.materialer.length+' linjer som én post</button>'
          +'<button class="btn small primary" onclick="window.addSuggestedMaterialsAsPost(false)" style="flex:1;background:#a78bfa;border:none">📦 Legg som '+opCount+' poster</button>'
        +'</div>'
        +'<div style="font-size:11px;color:var(--muted);font-style:italic;padding:10px;background:#f9f7f0;border-radius:8px">'
        +'💬 Etter at du legger til, kan du valgfritt slette de manuelle materialene fra «Utregning og materialer»-fanen.'
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
            <button class="btn small secondary" onclick="addCalcPost()">Bruk kalkyle som post</button>
          </div>
        </div>
        ${renderSuggestedMaterialsForOffer(p)}
        <div class="card" style="margin-top:8px;background:#fafcff">${renderOfferPosts(p)}</div>
        ${p.materials.length?`<div class="footer-note" style="margin:10px 0;padding:10px;background:#fffbea;border:1px solid #fde68a;border-radius:12px">⚠️ Merk: Materialer i materiallisten er ikke med i tilbudssummen. Legg dem inn i tilbudsposter for å få dem med.</div>`:''}
        <div class="card" style="margin-top:14px;background:#fafcff">
          <div class="section-head"><div class="section-title">Oppsummering</div></div>

          <div style="display:flex;align-items:center;gap:12px;background:#f5f8ff;border:1px solid #dce8ff;border-radius:14px;padding:12px 16px;margin-bottom:14px">
            <div id="offerTotalHoursDisplay" style="font-size:28px;font-weight:800;color:#0a84ff">${ps.hours+c.hoursTotal}t</div>
            <div>
              <div style="font-size:13px;font-weight:800">⏱️ Totalt timebruk</div>
              <div id="offerTotalHoursDetail" style="font-size:12px;color:var(--muted)">${c.hoursTotal>0?c.hoursTotal+'t fra arbeid':''} ${ps.hours>0&&c.hoursTotal>0?'+ ':''} ${ps.hours>0?ps.hours+'t fra poster':''}</div>
            </div>
          </div>

          <div class="row-3">
            <div style="padding:12px;background:#f5f8ff;border-radius:14px;border:1px solid #dce8ff">
              <div style="font-size:12px;color:var(--muted);font-weight:700;margin-bottom:4px">🔨 Tømrerarbeid</div>
              <div id="summaryLaborVal" style="font-size:20px;font-weight:800">${currency(p.settings.vatMode==='inc'?c.totalLaborSaleEx*1.25:c.totalLaborSaleEx)}</div>
              <div id="summaryLaborHours" style="font-size:11px;color:var(--muted);margin-top:4px">Totalt: ${c.totalHours}t | Tømrer: ${c.hoursTotal}t | Poster: ${ps.hours}t</div>
            </div>
            <div style="padding:12px;background:#f5fff8;border-radius:14px;border:1px solid #c3f0d5">
              <div style="font-size:12px;color:var(--muted);font-weight:700;margin-bottom:4px">🪵 Materialer</div>
              <div style="font-size:20px;font-weight:800">${currency(p.settings.vatMode==='inc'?offerMatSaleEx*1.25:offerMatSaleEx)}</div>
              <div style="font-size:12px;color:var(--muted);margin-top:4px">Innkjøp: ${currency(offerMatCost)}</div>
            </div>
            <div style="padding:12px;background:#fffbf0;border-radius:14px;border:1px solid #fde68a">
              <div style="font-size:12px;color:var(--muted);font-weight:700;margin-bottom:4px">🚗 Andre kostnader</div>
              <div style="font-size:20px;font-weight:800">${currency(p.settings.vatMode==='inc'?(c.extrasBase+c.rigEx)*1.25:(c.extrasBase+c.rigEx))}</div>
              <div style="font-size:12px;color:var(--muted);margin-top:4px">Kjøring, rigg m.m.</div>
            </div>
          </div>

          ${renderWarnings(p, c)}

          <div style="margin-top:14px;padding:16px;background:linear-gradient(135deg,#0f1728,#1a2540);border-radius:16px;color:#fff">
            <div style="font-size:11px;color:rgba(255,255,255,.5);margin-bottom:10px;font-weight:700;letter-spacing:.05em">TOTALOVERSIKT</div>
            <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:12px">
              <div style="background:rgba(255,255,255,.07);border-radius:12px;padding:12px">
                <div style="font-size:11px;color:rgba(255,255,255,.6);font-weight:700">Pris til kunde eks. mva</div>
                <div style="font-size:20px;font-weight:800;margin-top:4px">${currency(offerSaleEx)}</div>
              </div>
              <div style="background:rgba(255,255,255,.08);border-radius:12px;padding:12px">
                <div style="font-size:11px;color:rgba(255,255,255,.6);font-weight:700">Pris til kunde inkl. mva</div>
                <div style="font-size:22px;font-weight:800;margin-top:4px;color:#6ee7a0">${currency(offerSaleEx*1.25)}</div>
              </div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,.1)">
              <div>
                <div style="font-size:11px;color:rgba(255,255,255,.6);font-weight:700">Din kostnad</div>
                <div style="font-size:16px;font-weight:800;margin-top:4px">${currency(offerCostPrice)}</div>
              </div>
              <div>
                <div style="font-size:11px;color:rgba(255,255,255,.6);font-weight:700">Fortjeneste</div>
                <div style="font-size:16px;font-weight:800;margin-top:4px;color:#6ee7a0">${currency(offerProfit)}</div>
              </div>
              <div>
                <div style="font-size:11px;color:rgba(255,255,255,.6);font-weight:700">Margin</div>
                <div style="font-size:16px;font-weight:800;margin-top:4px">${percent(offerMargin)}</div>
              </div>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;padding-top:10px;border-top:1px solid rgba(255,255,255,.1)">
              <div style="font-size:12px;color:rgba(255,255,255,.5)" id="summaryModeNote">${p.settings.vatMode==='inc'?'Viser inkl. mva':'Viser eks. mva'}</div>
            </div>
          </div>
          <div class="row-3" style="margin-top:12px">
            <div><strong>Faste poster</strong><div>${currency(ps.fixed)}</div></div>
            <div><strong>Valgte opsjoner</strong><div>${currency(ps.options)}</div></div>
            <div><strong>Tilbudssum poster</strong><div>${currency(ps.total)}</div></div>
          </div>
        </div>`;
    }
