// ============================================================
// projectFiles.js — Bilder/dokumenter for prosjekter (project_files)
// ============================================================
// Opplasting (kamera + galleri) med status per fil og feil/prøv-igjen,
// pluss et persistert galleri: tidligere opplastede bilder hentes fra
// project_files når fanen åpnes, med kategori-filter, fullskjermvisning
// og (myk) sletting. Kategori/kommentar er redigerbare når som helst,
// ikke bare rett etter opplasting.
//
// Avhenger av: _sb/_sbUser (auth.js), getProject/uid/showModal/closeModal
// (utils.js). Leser ALDRI en global "aktivt prosjekt"-variabel — kalleren
// (kalkulasjonsmodulen eller dokumentasjonsmodulen) sender alltid inn
// prosjektet/prosjekt-id-en eksplisitt. Det gjør denne filen fri for
// skjult navigasjonskobling til hvilken arbeidsflate som kaller den.
// Lastes etter: auth.js, før docs.js (som kaller renderTabBilder)
// ============================================================

var PROJECT_FILE_CATEGORIES=[
  {key:'for_arbeid',label:'Før arbeid'},
  {key:'under_arbeid',label:'Under arbeid'},
  {key:'skjult_arbeid',label:'Skjult arbeid'},
  {key:'ferdig_arbeid',label:'Ferdig arbeid'},
  {key:'avvik_skade',label:'Avvik/skade'},
  {key:'materialer',label:'Materialer'},
  {key:'annet',label:'Annet'},
];
var DEFAULT_FILE_CATEGORY='annet';
var MAX_IMAGE_BYTES=20*1024*1024; // 20MB — se begrunnelse i supabase-migrations/001_project_files.sql
var PF_SIGNED_URL_TTL=3600; // 1 time

// Køen holder BÅDE tidligere opplastede bilder (hentet fra DB når fanen
// åpnes) og bilder lastet opp i denne økten — ett samlet galleri, ikke to
// separate lister. Nullstilles/hentes på nytt hver gang fanen åpnes.
var _pfQueue=[];
var _pfCategoryFilter='alle';
var _pfGalleryLoading=false;

function pfExt(filename,mime){
  var m=/\.([a-zA-Z0-9]+)$/.exec(filename||'');
  if(m) return m[1].toLowerCase();
  var map={'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/heic':'heic','image/heif':'heif'};
  return map[mime]||'bin';
}

function pfHumanizeError(err){
  var msg=(err&&(err.message||err.error_description||String(err)))||'';
  if(/exceeded the maximum allowed size|payload too large/i.test(msg)) return 'Filen er for stor (maks 20MB).';
  if(/mime type.*not supported|not allowed/i.test(msg)) return 'Denne filtypen er ikke tillatt.';
  if(/failed to fetch|network/i.test(msg)) return 'Ingen nettforbindelse — sjekk mobildekningen og prøv igjen.';
  return 'Opplasting feilet — prøv igjen.';
}

// renderTabBilder(project) — ren funksjon av prosjektet den mottar. Leser
// aldri en global "currently open project"-variabel, så den kan brukes fra
// hvilken som helst arbeidsflate (kalkulasjon eller dokumentasjon) uten at
// modulene deler navigasjons-state.
function renderTabBilder(p){
  var pid=escapeAttr(p.id);
  var html=`
    <div class="section-head">
      <div class="section-title">Bilder</div>
    </div>
    <div class="pf-upload-actions" style="display:flex;gap:8px;margin-bottom:16px">
      <button class="btn primary" style="flex:1" onclick="document.getElementById('pfCameraInput').click()">📷 Ta bilde</button>
      <button class="btn secondary" style="flex:1" onclick="document.getElementById('pfGalleryInput').click()">🖼️ Velg fra galleri</button>
    </div>
    <input type="file" id="pfCameraInput" accept="image/*" capture="environment" style="display:none" onchange="pfHandleFileSelect(this.files,'${pid}');this.value=''" />
    <input type="file" id="pfGalleryInput" accept="image/*" multiple style="display:none" onchange="pfHandleFileSelect(this.files,'${pid}');this.value=''" />
    <div id="pfCategoryFilter" style="display:flex;gap:6px;overflow-x:auto;padding-bottom:4px;margin-bottom:12px"></div>
    <div id="pfQueueList"></div>
  `;
  pfLoadGallery(p);
  return html;
}

// Henter tidligere opplastede bilder for prosjektet fra project_files
// (kun aktive rader, nyeste først) og bygger signerte URL-er for dem.
// Kjøres asynkront etter at renderTabBilder sitt skall er satt inn i DOM-en.
async function pfLoadGallery(p){
  // Behold ev. opplastinger som er i gang akkurat nå — unngår at en fersk
  // "Ta bilde"-opplasting forsvinner fra lista hvis den treffer midt i
  // dette DB-oppslaget (som er et nettverkskall og tar litt tid).
  var inFlight=_pfQueue.filter(function(e){ return e.status==='uploading'; });
  _pfCategoryFilter='alle';
  _pfGalleryLoading=true;
  pfRenderQueue();
  var fetched=[];
  try{
    var res=await _sb.from('project_files')
      .select('*')
      .eq('user_id',_sbUser.id)
      .eq('project_id',p.id)
      .eq('file_type','image')
      .is('deleted_at',null)
      .order('created_at',{ascending:false});
    if(res.error) throw res.error;
    var rows=res.data||[];
    var signedByPath={};
    if(rows.length){
      var signRes=await _sb.storage.from('project-files').createSignedUrls(
        rows.map(function(r){return r.storage_path;}), PF_SIGNED_URL_TTL
      );
      (signRes.data||[]).forEach(function(s){ if(s&&s.signedUrl) signedByPath[s.path]=s.signedUrl; });
    }
    fetched=rows.map(function(row){
      return {
        clientId:row.id,
        projectId:p.id,
        file:{name:row.original_filename},
        status:'done',
        errorMsg:'',
        row:row,
        signedUrl:signedByPath[row.storage_path]||''
      };
    });
  }catch(err){
    console.error('Kunne ikke hente bilder:',err);
  }
  _pfQueue=inFlight.concat(fetched);
  _pfGalleryLoading=false;
  pfRenderQueue();
}

// pfHandleFileSelect(fileList, projectId) — tar imot prosjekt-id-en
// eksplisitt fra kalleren (se onchange over) i stedet for å anta et globalt
// "aktivt prosjekt". projectId lagres også på hver kø-oppføring slik at
// pfRetry kan slå opp samme prosjekt senere uten en global variabel.
function pfHandleFileSelect(fileList,projectId){
  var p=getProject(projectId);
  if(!p||!_sbUser){ alert('Fant ikke prosjektet eller du er ikke innlogget.'); return; }
  Array.from(fileList||[]).forEach(function(file){
    var entry={
      clientId:uid(),
      projectId:projectId,
      file:file,
      status:'uploading', // 'uploading' | 'done' | 'failed'
      errorMsg:'',
      row:null,
      signedUrl:''
    };
    if(file.size>MAX_IMAGE_BYTES){
      entry.status='failed';
      entry.errorMsg='Filen er for stor (maks 20MB).';
      _pfQueue.unshift(entry);
      pfRenderQueue();
      return;
    }
    _pfQueue.unshift(entry);
    pfRenderQueue();
    pfUploadOne(entry, p);
  });
}

async function pfUploadOne(entry,p){
  try{
    var ext=pfExt(entry.file.name,entry.file.type);
    var fileId=(window.crypto&&crypto.randomUUID)?crypto.randomUUID():uid()+uid();
    var storagePath=_sbUser.id+'/'+p.id+'/image/'+fileId+'.'+ext;

    var upRes=await _sb.storage.from('project-files').upload(storagePath,entry.file,{
      contentType:entry.file.type||'application/octet-stream',
      upsert:false
    });
    if(upRes.error) throw upRes.error;

    var insRes=await _sb.from('project_files').insert({
      user_id:_sbUser.id,
      project_id:p.id,
      file_type:'image',
      category:DEFAULT_FILE_CATEGORY,
      storage_path:storagePath,
      original_filename:entry.file.name||'bilde',
      mime_type:entry.file.type||'application/octet-stream',
      file_size:entry.file.size
    }).select().single();
    if(insRes.error) throw insRes.error;

    entry.row=insRes.data;
    entry.storagePath=storagePath;

    var signRes=await _sb.storage.from('project-files').createSignedUrl(storagePath,3600);
    entry.signedUrl=(signRes.data&&signRes.data.signedUrl)||'';
    entry.status='done';
  }catch(err){
    entry.status='failed';
    entry.errorMsg=pfHumanizeError(err);
  }
  pfRenderQueue();
}

window.pfRetry=function(clientId){
  var entry=_pfQueue.find(function(e){return e.clientId===clientId;});
  var p=entry&&getProject(entry.projectId);
  if(!entry||!p) return;
  entry.status='uploading';
  entry.errorMsg='';
  pfRenderQueue();
  pfUploadOne(entry,p);
};

window.pfDismiss=function(clientId){
  _pfQueue=_pfQueue.filter(function(e){return e.clientId!==clientId;});
  pfRenderQueue();
};

// Listeraden og fullskjermmodalen kan i teorien begge ha et
// pfMetaStatus-element for samme bilde samtidig (modalen dekker listen
// visuelt, men listen forblir i DOM-en) — oppdater begge hvis de finnes,
// i stedet for å stole på getElementById som kun finner den første.
function pfSetMetaStatus(clientId,text,color){
  ['pfMetaStatus_','pfMetaStatusModal_'].forEach(function(prefix){
    var el=document.getElementById(prefix+clientId);
    if(el){ el.textContent=text; el.style.color=color; }
  });
}

window.pfUpdateMeta=function(clientId,field,value){
  var entry=_pfQueue.find(function(e){return e.clientId===clientId;});
  if(!entry||!entry.row) return;
  var prev=entry.row[field];
  entry.row[field]=value; // optimistisk
  pfSetMetaStatus(clientId,'Lagrer…','var(--muted)');
  var payload={updated_at:new Date().toISOString()};
  payload[field]=value;
  _sb.from('project_files').update(payload).eq('id',entry.row.id).then(function(res){
    if(res.error){
      entry.row[field]=prev; // revert
      pfSetMetaStatus(clientId,'Feil — prøv igjen','var(--red)');
      return;
    }
    pfSetMetaStatus(clientId,'Lagret','var(--muted)');
    // Oppdater listen i bakgrunnen (filter-antall, kategori-select) — trygt
    // selv om fullskjermmodalen er åpen, siden den lever i en egen container.
    pfRenderQueue();
    setTimeout(function(){ pfSetMetaStatus(clientId,'',''); },1500);
  });
};

function pfCategoryCounts(){
  var counts={};
  _pfQueue.forEach(function(e){
    if(e.status!=='done') return;
    var k=e.row.category||DEFAULT_FILE_CATEGORY;
    counts[k]=(counts[k]||0)+1;
  });
  return counts;
}

function pfRenderCategoryFilter(){
  var el=document.getElementById('pfCategoryFilter');
  if(!el) return;
  var doneCount=_pfQueue.filter(function(e){return e.status==='done';}).length;
  if(!doneCount){ el.innerHTML=''; return; }
  var counts=pfCategoryCounts();
  var pills=[{key:'alle',label:'Alle ('+doneCount+')'}]
    .concat(PROJECT_FILE_CATEGORIES.filter(function(c){return counts[c.key];}).map(function(c){
      return {key:c.key,label:c.label+' ('+counts[c.key]+')'};
    }));
  el.innerHTML=pills.map(function(c){
    var active=_pfCategoryFilter===c.key;
    return '<button class="btn small '+(active?'primary':'soft')+'" style="white-space:nowrap" onclick="pfSetCategoryFilter(\''+c.key+'\')">'+escapeHtml(c.label)+'</button>';
  }).join('');
}

window.pfSetCategoryFilter=function(key){
  _pfCategoryFilter=key;
  pfRenderQueue();
};

function pfRenderQueue(){
  var el=document.getElementById('pfQueueList');
  if(!el) return;
  pfRenderCategoryFilter();

  var visible=_pfQueue.filter(function(e){
    return e.status!=='done'||_pfCategoryFilter==='alle'||(e.row.category||DEFAULT_FILE_CATEGORY)===_pfCategoryFilter;
  });

  if(!visible.length){
    el.innerHTML='<div class="footer-note">'
      +(_pfGalleryLoading?'Henter bilder…':(_pfCategoryFilter==='alle'?'Ingen bilder lastet opp enda.':'Ingen bilder i denne kategorien.'))
      +'</div>';
    return;
  }
  el.innerHTML=visible.map(function(entry){
    if(entry.status==='uploading'){
      return '<div class="card pf-card pf-card--status">'
        +'<div class="pf-thumb pf-thumb--status">⏳</div>'
        +'<div><div class="pf-name pf-name--plain">'+escapeHtml(entry.file.name||'Bilde')+'</div>'
        +'<div class="footer-note">Laster opp…</div></div>'
      +'</div>';
    }
    if(entry.status==='failed'){
      return '<div class="card pf-card pf-card--status" style="border-color:var(--red)">'
        +'<div class="pf-thumb pf-thumb--status" style="background:var(--red-soft)">⚠️</div>'
        +'<div style="flex:1"><div class="pf-name pf-name--plain">'+escapeHtml(entry.file.name||'Bilde')+'</div>'
        +'<div class="footer-note" style="color:var(--red)">'+escapeHtml(entry.errorMsg||'Opplasting feilet')+'</div></div>'
        +'<div class="pf-retry-actions">'
          +'<button class="btn small primary" onclick="pfRetry(\''+entry.clientId+'\')">Prøv igjen</button>'
          +'<button class="btn small secondary" onclick="pfDismiss(\''+entry.clientId+'\')">Fjern</button>'
        +'</div>'
      +'</div>';
    }
    // done
    var catOptions=PROJECT_FILE_CATEGORIES.map(function(c){
      return '<option value="'+c.key+'" '+(entry.row.category===c.key?'selected':'')+'>'+escapeHtml(c.label)+'</option>';
    }).join('');
    return '<div class="card pf-card">'
      +'<div class="pf-thumb" onclick="pfOpenFullscreen(\''+entry.clientId+'\')">'
        +'<img src="'+escapeAttr(entry.signedUrl)+'" alt="" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'" />'
        +'<div class="pf-thumb-fallback">📄<span>'+escapeHtml((pfExt(entry.row.original_filename,entry.row.mime_type)||'').toUpperCase())+'</span></div>'
      +'</div>'
      +'<div class="pf-body">'
        +'<div class="pf-name">'
          +'<span onclick="pfOpenFullscreen(\''+entry.clientId+'\')">'+escapeHtml(entry.row.original_filename||'Bilde')+'</span>'
        +'</div>'
        +'<div class="pf-meta-row">'
          +'<select class="pf-cat-select" onchange="pfUpdateMeta(\''+entry.clientId+'\',\'category\',this.value)">'+catOptions+'</select>'
          +'<input type="text" class="pf-comment-input" placeholder="Kommentar…" value="'+escapeAttr(entry.row.description||'')+'" onchange="pfUpdateMeta(\''+entry.clientId+'\',\'description\',this.value)" />'
        +'</div>'
        +'<div class="pf-footer">'
          +'<div id="pfMetaStatus_'+entry.clientId+'" class="footer-note" style="min-height:14px"></div>'
          +'<button class="btn small danger pf-delete-btn" onclick="pfDeleteFile(\''+entry.clientId+'\')">Slett</button>'
        +'</div>'
      +'</div>'
    +'</div>';
  }).join('');
}

window.pfOpenFullscreen=function(clientId){
  var entry=_pfQueue.find(function(e){return e.clientId===clientId;});
  if(!entry||!entry.row) return;
  var catOptions=PROJECT_FILE_CATEGORIES.map(function(c){
    return '<option value="'+c.key+'" '+(entry.row.category===c.key?'selected':'')+'>'+escapeHtml(c.label)+'</option>';
  }).join('');
  showModal(
    '<div style="text-align:center">'
      +(entry.signedUrl
        ? '<img src="'+escapeAttr(entry.signedUrl)+'" style="max-width:100%;max-height:60vh;border-radius:10px;object-fit:contain" />'
        : '<div class="footer-note">Forhåndsvisning ikke tilgjengelig for denne filtypen.</div>')
      +'<div style="font-weight:700;margin-top:10px">'+escapeHtml(entry.row.original_filename||'Bilde')+'</div>'
      +'<div class="footer-note">'+(entry.row.created_at?new Date(entry.row.created_at).toLocaleString('nb-NO'):'')+'</div>'
    +'</div>'
    +'<div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap">'
      +'<select style="flex:1;min-width:140px" onchange="pfUpdateMeta(\''+clientId+'\',\'category\',this.value)">'+catOptions+'</select>'
    +'</div>'
    +'<textarea placeholder="Kommentar…" style="margin-top:8px;min-height:70px;width:100%" onchange="pfUpdateMeta(\''+clientId+'\',\'description\',this.value)">'+escapeHtml(entry.row.description||'')+'</textarea>'
    +'<div id="pfMetaStatusModal_'+clientId+'" class="footer-note" style="min-height:14px;margin-top:4px"></div>'
    +'<div class="toolbar" style="margin-top:10px">'
      +(entry.signedUrl?'<a class="btn secondary" href="'+escapeAttr(entry.signedUrl)+'" target="_blank">Åpne i ny fane</a>':'')
      +'<button class="btn danger" onclick="pfConfirmDeleteAndClose(\''+clientId+'\')">Slett bilde</button>'
      +'<button class="btn secondary" onclick="closeModal()">Lukk</button>'
    +'</div>'
  );
};

window.pfDeleteFile=function(clientId){
  var entry=_pfQueue.find(function(e){return e.clientId===clientId;});
  if(!entry||!entry.row) return;
  if(!confirm('Slette dette bildet? Det fjernes fra galleriet, men kan gjenopprettes av support ved behov.')) return;
  _sb.from('project_files').update({deleted_at:new Date().toISOString()}).eq('id',entry.row.id).then(function(res){
    if(res.error){ alert('Kunne ikke slette bildet — prøv igjen.'); return; }
    _pfQueue=_pfQueue.filter(function(e){return e.clientId!==clientId;});
    pfRenderQueue();
  });
};

// Samme som pfDeleteFile, men lukker fullskjermmodalen KUN når slettingen
// faktisk lykkes — trykker du Avbryt på bekreftelsen, blir du stående i
// modalen i stedet for at den lukkes uansett.
window.pfConfirmDeleteAndClose=function(clientId){
  var entry=_pfQueue.find(function(e){return e.clientId===clientId;});
  if(!entry||!entry.row) return;
  if(!confirm('Slette dette bildet? Det fjernes fra galleriet, men kan gjenopprettes av support ved behov.')) return;
  _sb.from('project_files').update({deleted_at:new Date().toISOString()}).eq('id',entry.row.id).then(function(res){
    if(res.error){ alert('Kunne ikke slette bildet — prøv igjen.'); return; }
    _pfQueue=_pfQueue.filter(function(e){return e.clientId!==clientId;});
    pfRenderQueue();
    closeModal();
  });
};
