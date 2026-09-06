// ============================================================
// docs.js — Dokumentasjonsmodul (egen arbeidsflate, se index.html #docsView)
// ============================================================
// Bevisst atskilt fra Kalkulasjon/Tilbud: egen navigasjons-state
// (currentDocsProjectId), IKKE den globale currentProjectId som
// projects.js/offer.js bruker. Samme underliggende prosjektdata
// (state.projects, samme p.id) — kun UI-arbeidsflaten er separat.
//
// V1-scope: prosjektliste → prosjektoversikt → Bilder (gjenbruker
// renderTabBilder fra projectFiles.js, som tar prosjektet eksplisitt som
// parameter — ingen avhengighet til denne modulens navigasjons-state).
// Dokumenter/Notater/Endringer kommer i senere steg.
// ============================================================

let currentDocsProjectId = null;

function openDocsView(){
  currentDocsProjectId=null;
  const list=document.getElementById('docsProjectList');
  const detail=document.getElementById('docsProjectDetail');
  if(detail) detail.classList.add('hidden');
  if(list) list.classList.remove('hidden');
  renderDocsProjectList();
}

function renderDocsProjectList(){
  const host=document.getElementById('docsProjectListBody');
  if(!host) return;
  const q=(document.getElementById('docsSearch')?.value||'').toLowerCase().trim();
  const projects=(state.projects||[]).filter(function(p){
    if(!q) return true;
    const cust=getCustomer(p.customerId);
    return (p.name||'').toLowerCase().includes(q)
      ||(cust&&cust.name||'').toLowerCase().includes(q)
      ||(p.address||'').toLowerCase().includes(q);
  }).sort(function(a,b){ return (b.updatedAt||0)-(a.updatedAt||0); });

  if(!projects.length){
    host.innerHTML='<div class="empty">Ingen prosjekter funnet.</div>';
    return;
  }
  host.innerHTML=projects.map(function(p){
    const cust=getCustomer(p.customerId);
    const updated=p.updatedAt?new Date(p.updatedAt).toLocaleDateString('nb-NO'):'';
    return '<div class="card" style="margin-bottom:8px;cursor:pointer" onclick="openDocsProject(\''+p.id+'\')">'
      +'<div style="display:flex;justify-content:space-between;align-items:center;gap:10px">'
        +'<div>'
          +'<div style="font-weight:700;font-family:var(--font-display)">'+escapeHtml(p.name||'Uten navn')+'</div>'
          +'<div class="footer-note">'+escapeHtml(cust?.name||'Ingen kunde')+(p.address?' · '+escapeHtml(p.address):'')+'</div>'
        +'</div>'
        +'<span class="pill status-'+escapeHtml(p.status||'')+'">'+escapeHtml(p.status||'')+'</span>'
      +'</div>'
      +(updated?'<div class="footer-note" style="margin-top:6px">Sist oppdatert '+updated+'</div>':'')
    +'</div>';
  }).join('');
}

window.openDocsProject=function(id){
  currentDocsProjectId=id;
  const list=document.getElementById('docsProjectList');
  const detail=document.getElementById('docsProjectDetail');
  if(list) list.classList.add('hidden');
  if(detail) detail.classList.remove('hidden');
  renderDocsProjectDetail();
};

window.closeDocsProject=function(){
  openDocsView();
};

function renderDocsProjectDetail(){
  const p=getProject(currentDocsProjectId);
  const host=document.getElementById('docsProjectDetailBody');
  if(!p||!host){ closeDocsProject(); return; }
  const cust=getCustomer(p.customerId);
  host.innerHTML=
    '<div class="card" style="margin-bottom:16px">'
      +'<div style="font-family:var(--font-display);font-size:20px;font-weight:800">'+escapeHtml(p.name||'Uten navn')+'</div>'
      +'<div class="footer-note" style="margin-top:4px">'+escapeHtml(cust?.name||'Ingen kunde')+'</div>'
      +(p.address?'<div class="footer-note">'+escapeHtml(p.address)+'</div>':'')
      +'<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">'
        +'<span class="pill status-'+escapeHtml(p.status||'')+'">'+escapeHtml(p.status||'')+'</span>'
        +(p.startPref?'<span class="pill">Oppstart: '+escapeHtml(p.startPref)+'</span>':'')
      +'</div>'
    +'</div>'
    +renderTabBilder(p);
  pfRenderQueue(); // fyll ut kø-placeholderen med en gang panelet er satt inn i DOM-en
}
