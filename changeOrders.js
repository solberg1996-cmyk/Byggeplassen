    // ── ENDRINGSMELDINGER / TILLEGG ─────────────────────────────────────────
    // Tillegg lagres som offerPosts med type 'tillegg' (CHANGE_ORDER_TYPE), slik
    // at «Tilpass post», timepris-omregning og sky-synk virker uten særbehandling.
    // De holdes utenfor det opprinnelige tilbudet via isPostInTotal.

    const ChangeOrderPricing={ Fixed:'fastpris', TimeAndMaterials:'medgatt' };

    // Merkene har alltid tekst (ikke bare farge); fargen kommer fra .co-status--<status>.
    const CHANGE_ORDER_STATUS_META={
      utkast:  {label:'Utkast'},
      sendt:   {label:'Sendt'},
      godkjent:{label:'Godkjent'},
      avvist:  {label:'Avvist'}
    };

    const VAT_RATE=0.25;
    const CHANGE_ORDER_PHOTO_CATEGORY='endring';
    // Signerte URL-er varer PF_SIGNED_URL_TTL (1 t) — forny litt før de går ut.
    const PHOTO_URL_REUSE_MS=50*60*1000;

    const _photoUrlCache={};   // storagePath -> {url, signedAt}
    const _uploadingCount={};  // changeOrderId -> antall bilder under opplasting

    function renderChangeOrders(p){
      const changeOrders=(p.offerPosts||[]).filter(isChangeOrder);
      const list=changeOrders.length
        ? `<div class="offer-table offer-table--changes">
            <div class="offer-table-head" aria-hidden="true"><div class="offer-row-cells"><span>Nr.</span><span>Tillegg</span><span class="offer-col-wide">Prising</span><span class="offer-col-wide">Status</span><span class="offer-col-num">Sum ${getVatLabel(p)}</span><span></span></div></div>
            ${changeOrders.map(post=>renderChangeOrderItem(p,post)).join('')}
          </div>`
        : '<div class="offer-empty">Ingen tillegg registrert. Legg til et tillegg når kunden ønsker endringer underveis.</div>';
      return `<section class="offer-card" aria-labelledby="changeOrdersTitle">
          <div class="offer-card-head">
            <h2 class="offer-card-title" id="changeOrdersTitle">Endringer og tillegg</h2>
            <button class="btn small soft" onclick="addChangeOrder()" aria-label="Nytt tillegg">+ Tillegg</button>
          </div>
          ${list}
        </section>`;
    }

    // Kalles etter at kortene er satt inn i DOM-en: henter visnings-URL-er for
    // bilder i åpne tillegg (samme mønster som pfLoadGallery i projectFiles.js).
    function loadOpenChangeOrderPhotos(p){
      (p.offerPosts||[]).filter(post=>isChangeOrder(post)&&post._open).forEach(post=>refreshChangeOrderPhotos(post.id));
    }

    function renderChangeOrderItem(p,post){
      const isOpen=post._open===true;
      return `<div class="offer-item${isOpen?' is-open':''}">${renderChangeOrderRow(p,post)}${isOpen?renderChangeOrderDetail(p,post):''}</div>`;
    }

    function renderChangeOrderRow(p,post){
      const co=post.changeOrder||{};
      const status=CHANGE_ORDER_STATUS_META[co.status]?co.status:ChangeOrderStatus.Draft;
      const id=escapeAttr(post.id);
      const isRejected=status===ChangeOrderStatus.Rejected;
      const isTimeAndMaterials=co.pricing===ChangeOrderPricing.TimeAndMaterials;
      const pricingLabel=isTimeAndMaterials?'Medgått tid':'Fastpris';
      const statusBadge=`<span class="co-status co-status--${status}">${CHANGE_ORDER_STATUS_META[status].label}</span>`;
      return `<div class="offer-row${isRejected?' is-muted':''}" id="changeOrderRow_${id}">
        <button type="button" class="offer-row-cells" aria-expanded="${post._open===true}" onclick="toggleOfferPost('${id}')">
          <span class="co-number"><span class="visually-hidden">Nr. </span>${co.number||'?'}</span>
          <span class="offer-cell-name">
            <span class="offer-name">${escapeHtml(post.name||'Nytt tillegg')}</span>
            <span class="offer-cell-desc">${formatChangeOrderDate(co.createdDate)}${isTimeAndMaterials?' · estimert sum':''}</span>
            <span class="offer-cell-compact">${pricingLabel} · ${statusBadge}</span>
          </span>
          <span class="offer-col-wide">${pricingLabel}</span>
          <span class="offer-col-wide">${statusBadge}</span>
          <span class="offer-col-num offer-cell-sum${isRejected?' is-struck':''}">${formatNumber(displayVatValue(p,post.price||0))}</span>
          <span class="offer-chevron">${CHEVRON_DOWN_ICON}</span>
        </button>
      </div>`;
    }

    function renderChangeOrderDetail(p,post){
      const co=post.changeOrder||{};
      const id=escapeAttr(post.id);
      const hours=getChangeOrderHours(post);
      return `<div class="offer-row-detail">
          <div class="row">
            <div><label>Navn på tillegget</label><input value="${escapeAttr(post.name||'')}" placeholder="F.eks. Ekstra vindu på gavl" aria-label="Navn på tillegget" onchange="updatePost('${id}','name',this.value)" /></div>
            <div><label>Prising</label><select aria-label="Prising" onchange="updateChangeOrder('${id}','pricing',this.value)">
              <option value="${ChangeOrderPricing.Fixed}" ${co.pricing!==ChangeOrderPricing.TimeAndMaterials?'selected':''}>Fastpris</option>
              <option value="${ChangeOrderPricing.TimeAndMaterials}" ${co.pricing===ChangeOrderPricing.TimeAndMaterials?'selected':''}>Etter medgått tid</option>
            </select></div>
          </div>
          <label>Beskrivelse av endringen</label>
          <textarea placeholder="Hva skal gjøres, og hvorfor?" aria-label="Beskrivelse av endringen" onchange="updatePost('${id}','description',this.value)">${escapeHtml(post.description||'')}</textarea>
          <div class="row">
            <div><label>Konsekvens for fremdrift</label><input value="${escapeAttr(co.scheduleImpact||'')}" placeholder="F.eks. +2 arbeidsdager" aria-label="Konsekvens for fremdrift" onchange="updateChangeOrder('${id}','scheduleImpact',this.value)" /></div>
            <div><label>Status</label><select aria-label="Status" onchange="updateChangeOrder('${id}','status',this.value)">
              ${Object.keys(CHANGE_ORDER_STATUS_META).map(s=>`<option value="${s}" ${co.status===s?'selected':''}>${CHANGE_ORDER_STATUS_META[s].label}</option>`).join('')}
            </select></div>
          </div>
          ${co.status===ChangeOrderStatus.Approved?`
          <div class="row">
            <div><label>Godkjent av</label><input value="${escapeAttr(co.approvedBy||'')}" placeholder="Kundens navn" aria-label="Godkjent av" onchange="updateChangeOrder('${id}','approvedBy',this.value)" /></div>
            <div><label>Godkjent dato</label><input type="date" aria-label="Godkjent dato" value="${escapeAttr(co.approvedDate||'')}" onchange="updateChangeOrder('${id}','approvedDate',this.value)" /></div>
          </div>
          <div style="font-size:12px;color:var(--muted);margin-top:6px">Godkjent pris er låst og endres ikke om timeprisen justeres senere.</div>`:''}
          <label>Bilder</label>
          <div class="co-photos" id="coPhotos_${id}">${renderPhotoThumbs(post)}</div>
          <div class="toolbar" style="margin-top:8px">
            <button class="btn small secondary" onclick="document.getElementById('coPhotoInput_${id}').click()">📷 Legg til bilde</button>
            <button class="btn small soft" onclick="openChangeOrderPhotoPicker('${id}')">Velg fra prosjektbildene</button>
          </div>
          <input type="file" id="coPhotoInput_${id}" accept="image/*" multiple hidden aria-label="Legg til bilde" onchange="handleChangeOrderPhotoSelect('${id}',this.files);this.value=''" />
          <div style="margin-top:10px;padding:10px 12px;background:var(--blue-soft);border:1px solid var(--line);border-radius:var(--radius-xs);font-size:13px">
            ${hours?`${hours}t × ${currency(getChangeOrderRate(p,post))}`:'Ingen timer lagt inn'} · Materialer ${currency(post.snapshotCompute?.matSaleEx||0)}
            <button class="btn small soft" style="font-size:12px;margin-left:8px" onclick="restoreCalcPost('${id}')">Tilpass</button>
          </div>
          <div class="inline-actions" style="margin-top:10px;justify-content:flex-end;flex-wrap:wrap">
            <button class="btn small secondary" onclick="movePost('${id}',-1)">↑</button>
            <button class="btn small secondary" onclick="movePost('${id}',1)">↓</button>
            <button class="btn small danger" onclick="removeChangeOrder('${id}')">Slett</button>
            <button class="btn small secondary" onclick="showChangeOrderDocument('${id}')">Vis / skriv ut</button>
            <button class="btn small primary" onclick="sendChangeOrder('${id}')">Send på e-post</button>
          </div>
        </div>`;
    }

    window.addChangeOrder=function(){
      const p=getProject(currentProjectId); if(!p) return;
      if(!p.offerPosts) p.offerPosts=[];
      const lastNumber=p.offerPosts.filter(isChangeOrder).reduce((max,post)=>Math.max(max,(post.changeOrder||{}).number||0),0);
      p.offerPosts.push({
        id:uid(), name:'', description:'', type:CHANGE_ORDER_TYPE, price:0, enabled:true, _open:true,
        snapshotMaterials:[], snapshotCompute:{},
        changeOrder:{
          number:lastNumber+1,
          createdDate:todayIsoDate(),
          status:ChangeOrderStatus.Draft,
          pricing:ChangeOrderPricing.Fixed,
          scheduleImpact:'', approvedBy:'', approvedDate:''
        }
      });
      persistAndRenderProject();
    };

    window.updateChangeOrder=function(id,key,val){
      const post=findChangeOrder(id); if(!post) return;
      post.changeOrder[key]=val;
      if(key==='status'&&val===ChangeOrderStatus.Approved&&!post.changeOrder.approvedDate){
        post.changeOrder.approvedDate=todayIsoDate();
      }
      if(key==='status'||key==='pricing') persistAndRenderProject();
      else persistAndUpdate();
    };

    window.removeChangeOrder=function(id){
      const post=findChangeOrder(id); if(!post) return;
      if(!confirm('Slette tillegg nr. '+(post.changeOrder.number||'')+'?')) return;
      removePost(id);
    };

    window.showChangeOrderDocument=async function(id){
      const p=getProject(currentProjectId); const post=findChangeOrder(id); if(!p||!post) return;
      await ensurePhotoUrls(getPhotos(post));
      openOfferFullPreview(buildChangeOrderHtml(p,post), changeOrderFileTitle(p,post));
    };

    window.sendChangeOrder=async function(id){
      const p=getProject(currentProjectId); const post=findChangeOrder(id); if(!p||!post) return;
      if(post.changeOrder.status===ChangeOrderStatus.Draft){
        post.changeOrder.status=ChangeOrderStatus.Sent;
        persistAndRenderProject();
      }
      const cust=getCustomer(p.customerId);
      const number=post.changeOrder.number;
      const subject='Endringsmelding nr. '+number+' – '+(p.name||'prosjekt');
      const body='Hei'+(cust&&cust.name?' '+cust.name:'')+',\n\n'
        +'Vedlagt er endringsmelding nr. '+number+(post.name?' ('+post.name+')':'')+' for '+(p.name||'prosjektet')+'.\n\n'
        // Ingen hilsen/signatur — e-postappen legger til brukerens egen.
        +'Gi gjerne en kort bekreftelse på at endringen er godkjent, så setter vi i gang.\n';
      await showChangeOrderDocument(id);
      // Samme mønster som sendOfferNow: vis dokumentet først, så åpnes e-post.
      setTimeout(function(){
        const a=document.createElement('a');
        a.href='mailto:'+encodeURIComponent(cust&&cust.email?cust.email:'')
          +'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
        a.style.display='none';
        document.body.appendChild(a); a.click(); a.remove();
      },1000);
    };

    function buildChangeOrderHtml(p,post){
      const co=post.changeOrder||{};
      const company=state.company||{};
      const esc=escapeHtml;
      const fmt=n=>Math.round(n||0).toLocaleString('nb-NO')+' kr';
      const priceEx=Number(post.price)||0;
      const isTimeAndMaterials=co.pricing===ChangeOrderPricing.TimeAndMaterials;
      const hours=getChangeOrderHours(post);
      const matSaleEx=post.snapshotCompute?.matSaleEx||0;

      const priceRows=isTimeAndMaterials
        ? '<tr><td class="dc">Timepris tømrer</td><td class="ac">'+fmt(getChangeOrderRate(p,post))+' / t</td></tr>'
          +'<tr><td class="dc">Estimert tidsbruk</td><td class="ac">'+hours+' t</td></tr>'
          +(matSaleEx?'<tr><td class="dc">Materialer (estimat)</td><td class="ac">'+fmt(matSaleEx)+'</td></tr>':'')
          +'<tr class="sum-row"><td class="dc">Estimert sum eks. mva</td><td class="ac">'+fmt(priceEx)+'</td></tr>'
          +'<tr class="mva-row"><td class="dc">MVA 25%</td><td class="ac">'+fmt(priceEx*VAT_RATE)+'</td></tr>'
          +'<tr class="total-row"><td class="dc"><b>ESTIMERT TOTAL INKL. MVA</b></td><td class="ac">'+fmt(priceEx*(1+VAT_RATE))+'</td></tr>'
        : '<tr><td class="dc"><b>'+esc(post.name||'Tillegg')+'</b></td><td class="ac">'+fmt(priceEx)+'</td></tr>'
          +'<tr class="mva-row"><td class="dc">MVA 25%</td><td class="ac">'+fmt(priceEx*VAT_RATE)+'</td></tr>'
          +'<tr class="sum-row"><td class="dc">Sum eks. mva</td><td class="ac">'+fmt(priceEx)+'</td></tr>'
          +'<tr class="total-row"><td class="dc"><b>TOTALPRIS INKL. MVA</b></td><td class="ac">'+fmt(priceEx*(1+VAT_RATE))+'</td></tr>';

      const pricingText=isTimeAndMaterials
        ? 'Arbeidet utføres og faktureres etter medgått tid og materialer. Beløpene over er et estimat.'
        : 'Arbeidet utføres til avtalt fastpris som angitt over.';
      const isApproved=co.status===ChangeOrderStatus.Approved;
      const signLine='border-top:1px solid #000;padding-top:4px;margin-top:36px;font-size:10pt';

      // Ingen <style> her — fullskjermvisningen legger på dokument-CSS scopet
      // til seg selv (openOfferFullPreview).
      return buildOfferLetterheadHtml(p)
        +'<div class="title">ENDRINGSMELDING NR. '+esc(co.number||'')+'</div>'
        +'<div class="sec"><p><b>Prosjekt:</b> '+esc(p.name||'')+(p.address?' – '+esc(p.address):'')+'<br>'
          +'<b>Dato:</b> '+formatChangeOrderDate(co.createdDate)+'</p>'
          +'<p>Denne endringsmeldingen gjelder tillegg/endring til opprinnelig avtale for prosjektet over.</p></div>'
        +'<div class="sec"><h3>Beskrivelse av endringen</h3>'
          +'<p><b>'+esc(post.name||'')+'</b></p>'
          +(post.description?'<p>'+esc(post.description).replace(/\n/g,'<br>')+'</p>':'')
        +'</div>'
        +'<table class="mt"><thead><tr class="hr"><th class="dc">PRIS</th><th class="ac">SUM</th></tr></thead><tbody>'
        +priceRows
        +'</tbody></table>'
        +'<div class="sec"><p>'+pricingText+'</p></div>'
        +buildPhotoSectionHtml(post)
        +(co.scheduleImpact?'<div class="sec"><h3>Konsekvens for fremdrift</h3><p>'+esc(co.scheduleImpact)+'</p></div>':'')
        +'<div class="sec"><h3>Godkjenning</h3>'
          +'<p>Arbeidet igangsettes når endringen er godkjent av kunde.</p>'
          +'<div style="display:flex;gap:40px;margin-top:8px">'
            +'<div style="flex:1"><div style="min-height:20px">'+(company.name?esc(company.name):'')+'</div><div style="'+signLine+'">For utførende</div></div>'
            +'<div style="flex:1"><div style="min-height:20px">'+(isApproved?esc(co.approvedBy||'')+' · '+formatChangeOrderDate(co.approvedDate):'')+'</div><div style="'+signLine+'">Godkjent av kunde (navn, dato)</div></div>'
          +'</div>'
        +'</div>';
    }

    function buildPhotoSectionHtml(post){
      const imgs=getPhotos(post).map(photo=>cachedPhotoUrl(photo.storagePath)).filter(Boolean)
        .map(url=>'<img src="'+escapeAttr(url)+'" alt="Bilde av endringen" style="width:100%;height:220px;object-fit:cover;border-radius:4px">');
      if(!imgs.length) return '';
      return '<div class="sec"><h3>Bilder</h3><div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px">'+imgs.join('')+'</div></div>';
    }

    // ── Bilder ──────────────────────────────────────────────────────────────
    // Bildene lastes opp som vanlige prosjektbilder (kategori «Endring/tillegg»),
    // så de også ligger i prosjektets dokumentasjon. Tillegget lagrer kun
    // referanser; å fjerne et bilde her sletter det ikke fra dokumentasjonen.

    function getPhotos(post){
      return (post.changeOrder&&post.changeOrder.photos)||[];
    }

    function renderPhotoThumbs(post){
      const id=escapeAttr(post.id);
      const thumbs=getPhotos(post).map(photo=>{
        const url=cachedPhotoUrl(photo.storagePath);
        const img=url
          ? `<img src="${escapeAttr(url)}" alt="Bilde av endringen" width="88" height="88" loading="lazy">`
          : '<div class="co-photo-placeholder" aria-hidden="true"></div>';
        return `<div class="co-photo">${img}<button class="co-photo-remove" aria-label="Fjern bilde fra tillegget" onclick="removeChangeOrderPhoto('${id}','${escapeAttr(photo.id)}')"><span class="co-photo-remove-icon" aria-hidden="true">×</span></button></div>`;
      });
      const uploading=Array.from({length:_uploadingCount[post.id]||0},()=>'<div class="co-photo"><div class="co-photo-placeholder">Laster opp…</div></div>');
      const all=thumbs.concat(uploading);
      return all.length?all.join(''):'<div class="co-photos-empty">Ingen bilder ennå.</div>';
    }

    async function refreshChangeOrderPhotos(id){
      const post=findChangeOrder(id); if(!post) return;
      const render=()=>{ const el=document.getElementById('coPhotos_'+id); if(el) el.innerHTML=renderPhotoThumbs(post); };
      render();
      await ensurePhotoUrls(getPhotos(post));
      render();
    }

    async function ensurePhotoUrls(photos){
      const missing=photos.map(photo=>photo.storagePath).filter(path=>!cachedPhotoUrl(path));
      if(!missing.length||!_sbUser) return;
      try{
        const signed=await signProjectFilePaths(missing);
        Object.keys(signed).forEach(path=>{ _photoUrlCache[path]={url:signed[path],signedAt:Date.now()}; });
      }catch(err){
        console.error('Kunne ikke hente bilder til tillegg:',err);
      }
    }

    function cachedPhotoUrl(path){
      const hit=_photoUrlCache[path];
      return hit&&(Date.now()-hit.signedAt<PHOTO_URL_REUSE_MS)?hit.url:'';
    }

    function attachPhoto(post,row){
      if(!post.changeOrder.photos) post.changeOrder.photos=[];
      if(post.changeOrder.photos.some(photo=>photo.id===row.id)) return;
      post.changeOrder.photos.push({id:row.id,storagePath:row.storage_path});
    }

    window.handleChangeOrderPhotoSelect=async function(id,fileList){
      const p=getProject(currentProjectId); const post=findChangeOrder(id); if(!p||!post) return;
      if(!_sbUser||!navigator.onLine){ alert('Bilder krever nettforbindelse. Prøv igjen når du har dekning.'); return; }
      const files=Array.from(fileList||[]);
      _uploadingCount[id]=(_uploadingCount[id]||0)+files.length;
      refreshChangeOrderPhotos(id);
      for(const file of files){
        try{ attachPhoto(post, await uploadProjectImage(p,file,CHANGE_ORDER_PHOTO_CATEGORY)); }
        catch(err){ alert(pfHumanizeError(err)); }
        finally{ _uploadingCount[id]--; }
      }
      persistAndUpdate();
      refreshChangeOrderPhotos(id);
    };

    window.removeChangeOrderPhoto=function(id,photoId){
      const post=findChangeOrder(id); if(!post) return;
      post.changeOrder.photos=getPhotos(post).filter(photo=>photo.id!==photoId);
      persistAndUpdate();
      refreshChangeOrderPhotos(id);
    };

    window.openChangeOrderPhotoPicker=async function(id){
      const p=getProject(currentProjectId); const post=findChangeOrder(id); if(!p||!post) return;
      showModal(`
        <div class="section-head">
          <div class="section-title">Velg bilder til tillegg nr. ${post.changeOrder.number||''}</div>
          <button class="btn small primary" onclick="closeModal()">Ferdig</button>
        </div>
        <div class="co-photos co-photos--picker" id="coPhotoPicker"><div class="co-photos-empty">Henter bilder…</div></div>`);
      const grid=()=>document.getElementById('coPhotoPicker');
      let rows;
      try{
        rows=await listProjectImages(p);
        await ensurePhotoUrls(rows.map(row=>({storagePath:row.storage_path})));
      }catch(err){
        if(grid()) grid().innerHTML='<div class="co-photos-empty">Kunne ikke hente bilder – sjekk nettforbindelsen.</div>';
        return;
      }
      window._coPickerRows=rows;
      renderPhotoPicker(id);
    };

    function renderPhotoPicker(id){
      const post=findChangeOrder(id); const el=document.getElementById('coPhotoPicker'); if(!post||!el) return;
      const rows=window._coPickerRows||[];
      if(!rows.length){ el.innerHTML='<div class="co-photos-empty">Prosjektet har ingen bilder ennå. Bruk «Legg til bilde» i tillegget.</div>'; return; }
      const selected=new Set(getPhotos(post).map(photo=>photo.id));
      el.innerHTML=rows.map(row=>{
        const isSelected=selected.has(row.id);
        const url=cachedPhotoUrl(row.storage_path);
        return `<button class="co-photo co-photo--pick${isSelected?' is-selected':''}" aria-pressed="${isSelected}" aria-label="${isSelected?'Fjern':'Legg til'} bilde" onclick="toggleChangeOrderPhoto('${escapeAttr(id)}','${escapeAttr(row.id)}')">
          ${url?`<img src="${escapeAttr(url)}" alt="" width="88" height="88" loading="lazy">`:'<div class="co-photo-placeholder"></div>'}
          ${isSelected?'<span class="co-photo-check" aria-hidden="true">✓</span>':''}
        </button>`;
      }).join('');
    }

    window.toggleChangeOrderPhoto=function(id,rowId){
      const post=findChangeOrder(id); if(!post) return;
      const row=(window._coPickerRows||[]).find(r=>r.id===rowId); if(!row) return;
      if(getPhotos(post).some(photo=>photo.id===rowId)) post.changeOrder.photos=getPhotos(post).filter(photo=>photo.id!==rowId);
      else attachPhoto(post,row);
      persistAndUpdate();
      renderPhotoPicker(id);
      refreshChangeOrderPhotos(id);
    };

    function getChangeOrderHours(post){
      return Number(post.hours)||(post.snapshotCompute&&post.snapshotCompute.hoursTotal)||0;
    }

    // Faktisk timepris i tillegget — for godkjente tillegg er dette den avtalte
    // prisen, som kan avvike fra prosjektets nåværende timepris.
    function getChangeOrderRate(p,post){
      const hours=getChangeOrderHours(post);
      const laborSaleEx=post.snapshotCompute&&post.snapshotCompute.laborSaleEx;
      if(hours&&laborSaleEx) return laborSaleEx/hours;
      return Number(p.work.timeRate)||0;
    }

    function findChangeOrder(id){
      const p=getProject(currentProjectId);
      const post=p&&(p.offerPosts||[]).find(x=>x.id===id);
      return isChangeOrder(post)?post:null;
    }

    function changeOrderFileTitle(p,post){
      return 'Endringsmelding '+(post.changeOrder.number||'')+' '+offerFileTitle(p);
    }

    // sv-SE gir ISO-format (YYYY-MM-DD) i lokal tid, som <input type="date"> krever.
    function todayIsoDate(){
      return new Date().toLocaleDateString('sv-SE');
    }

    function formatChangeOrderDate(iso){
      if(!iso) return '';
      const [y,m,d]=iso.split('-');
      return d+'.'+m+'.'+y;
    }
