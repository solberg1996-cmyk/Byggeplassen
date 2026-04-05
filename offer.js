    var _offerState = {
      postMode: 'all',
      customPosts: [],
      sections: {
        innledning: true, grunnlag: true, arbeidsomfang: true,
        ikkemedregnet: true, prisogbetaling: true, fremdrift: true, forbehold: true
      },
      texts: { innledning: '', fremdrift: '', forbehold: '' },
      // Arbeidsomfang: checked post ids + custom items
      arbeidsomfangPosts: [],   // [{id, name, checked}]
      arbeidsomfangExtra: [],   // [{id, text}] custom added lines
      // Ikke medregnet: checkboxes
      ikkemedregnet: {
        elektriker: true, rorlegger: true, maling: true,
        byggesoknad: true, avfall: true, stillas: false, custom: []
      },
      // Pris og betaling type
      prisType: 'medgaatt',  // 'medgaatt' | 'fastpris' | 'begge'
      freeSections: [],
      estDays: '',
      rigChecked: true,        // Rigg og Drift post checkbox
      extraPostsChecked: {}    // {postId: true/false} for auto-generated extra posts
    };

    function renderTabPreview(p){
      // A4 thumbnail: scale 794px wide doc to 170px = scale 0.214
      const scale=0.214;
      const docW=794, docH=1123;
      const thumbW=Math.round(docW*scale);  // ~170px
      const thumbH=Math.round(docH*scale);  // ~240px
      return '<div style="position:relative;height:calc(100vh - 130px);overflow:hidden">'
        // Full-width scrollable editor
        +'<div style="overflow-y:auto;padding:20px 220px 20px 20px;display:flex;flex-direction:column;gap:12px;height:100%" id="offerEditorPane"></div>'
        // A4 thumbnail pinned top-right
        +'<div style="position:absolute;top:16px;right:16px;display:flex;flex-direction:column;align-items:center;gap:6px;z-index:10">'
          +'<div style="font-size:10px;color:#555;font-weight:700;text-transform:uppercase;letter-spacing:.06em">Forhåndsvisning</div>'
          +'<div style="width:'+thumbW+'px;height:'+thumbH+'px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,.3);cursor:pointer;border-radius:2px;border:1px solid #bbb" title="Klikk for full visning" onclick="currentProjectId=\''+p.id+'\';openOfferFullPreview()">'
            +'<div id="offerPreviewDoc" style="width:'+docW+'px;height:'+docH+'px;background:#fff;transform:scale('+scale+');transform-origin:top left;overflow:hidden;pointer-events:none"></div>'
          +'</div>'
          +'<button onclick="currentProjectId=\''+p.id+'\';openOfferFullPreview()" style="background:var(--bg-warm);color:var(--text);border:1px solid var(--line);border-radius:5px;padding:5px 12px;font-size:10px;font-weight:700;cursor:pointer;white-space:nowrap;margin-bottom:6px">Åpne tilbud</button>'
          +'<button onclick="currentProjectId=\''+p.id+'\';downloadOfferPDF()" style="background:var(--green);color:#0F0E0C;border:none;border-radius:5px;padding:5px 12px;font-size:10px;font-weight:700;cursor:pointer;white-space:nowrap;margin-bottom:6px">Last ned PDF</button>'
          +'<button onclick="currentProjectId=\''+p.id+'\';sendOfferNow()" style="background:var(--accent);color:#0F0E0C;border:none;border-radius:5px;padding:5px 12px;font-size:10px;font-weight:700;cursor:pointer;white-space:nowrap">Send tilbud</button>'
        +'</div>'
      +'</div>';
    }

    function getExtraPosts(p){
      // Generate virtual posts from extras
      var posts=[];
      var cv=compute(p);
      var subTotal=(p.extras.subcontractors||[]).reduce(function(s,x){return s+(Number(x.amount)||0);},0);
      var lhh=Number(p.work.laborHireHours)||0, lhr=Number(p.extras.laborHire)||0;
      var laborHireTotal=lhh>0?(lhr*lhh):lhr;
      var rental=Number(p.extras.rental)||0;
      var waste=Number(p.extras.waste)||0;
      var scaffolding=Number(p.extras.scaffolding)||0;
      var drawings=Number(p.extras.drawings)||0;
      var misc=Number(p.extras.misc)||0;
      var rigEx=cv.rigEx||0;

      if(laborHireTotal>0) posts.push({id:'__laborhire',name:'Innleid håndverker',amount:laborHireTotal});
      if(subTotal>0){
        (p.extras.subcontractors||[]).forEach(function(s){
          if(Number(s.amount)>0) posts.push({id:'__sub_'+s.id,name:s.trade,amount:Number(s.amount)});
        });
      }
      if(rental>0) posts.push({id:'__rental',name:'Leie av utstyr',amount:rental});
      if(waste>0) posts.push({id:'__waste',name:'Avfall / deponi',amount:waste});
      if(scaffolding>0) posts.push({id:'__scaffolding',name:'Stillas',amount:scaffolding});
      if(drawings>0) posts.push({id:'__drawings',name:'Tegninger / byggesøknad',amount:drawings});
      if(misc>0) posts.push({id:'__misc',name:'Diverse',amount:misc});
      if(rigEx>0) posts.push({id:'__rigg',name:'Rigg og Drift',amount:rigEx});
      return posts;
    }

    function rebuildExtraPosts(p){
      var posts=getExtraPosts(p);
      // Init checked state for new posts
      posts.forEach(function(post){
        if(_offerState.extraPostsChecked[post.id]==null){
          _offerState.extraPostsChecked[post.id]=true;
        }
      });
    }

    function renderOfferEditorPane(){
      const el=document.getElementById('offerEditorPane'); if(!el) return;
      const p=getProject(currentProjectId); if(!p) return;
      const cv=compute(p);
      const ps=computeOfferPostsTotal(p);
      const os=_offerState;

      // IkkemedregnetCheckboxes
      const imStd=[
        {key:'elektriker',label:'Elektrikerarbeider'},
        {key:'rorlegger',label:'Rørleggerarbeider'},
        {key:'maling',label:'Maling og sparkling'},
        {key:'byggesoknad',label:'Byggesøknad og prosjektering'},
        {key:'avfall',label:'Avfallshåndtering'},
        {key:'stillas',label:'Stillas'},
      ];
      const imChecks=imStd.map(function(item){
        return '<label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;padding:3px 0">'
          +'<input type="checkbox" style="width:auto" '+(os.ikkemedregnet[item.key]?'checked':'')+' onchange="_offerState.ikkemedregnet.'+item.key+'=this.checked;renderOfferPreview()" />'
          +item.label+'</label>';
      }).join('');
      const imCustom=os.ikkemedregnet.custom.map(function(t,i){
        return '<div style="display:flex;gap:6px;align-items:center;margin-top:4px">'
          +'<input value="'+escapeAttr(t)+'" style="flex:1;font-size:12px;padding:5px 8px" oninput="_offerState.ikkemedregnet.custom['+i+']=this.value;renderOfferPreview()" />'
          +'<button onclick="_offerState.ikkemedregnet.custom.splice('+i+',1);renderOfferEditorPane();renderOfferPreview()" style="border:none;background:#fff1f0;color:var(--red);border-radius:6px;padding:5px 8px;cursor:pointer">✕</button>'
          +'</div>';
      }).join('');

      // Arbeidsomfang posts
      const aoRows=os.arbeidsomfangPosts.map(function(item,i){
        return '<label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;padding:3px 0">'
          +'<input type="checkbox" style="width:auto" '+(item.checked?'checked':'')+' onchange="_offerState.arbeidsomfangPosts['+i+'].checked=this.checked;renderOfferPreview()" />'
          +escapeHtml(item.name)+'</label>';
      }).join('');
      const aoExtra=os.arbeidsomfangExtra.map(function(t,i){
        return '<div style="display:flex;gap:6px;align-items:center;margin-top:4px">'
          +'<input value="'+escapeAttr(t.text)+'" placeholder="Skriv inn..." style="flex:1;font-size:12px;padding:5px 8px" oninput="_offerState.arbeidsomfangExtra['+i+'].text=this.value;renderOfferPreview()" />'
          +'<button onclick="_offerState.arbeidsomfangExtra.splice('+i+',1);renderOfferEditorPane();renderOfferPreview()" style="border:none;background:#fff1f0;color:var(--red);border-radius:6px;padding:5px 8px;cursor:pointer">✕</button>'
          +'</div>';
      }).join('');

      el.innerHTML=''

        // Header with tab title + print button
        +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">'
          +'<div style="font-size:16px;font-weight:800">Tilbudsvisning</div>'
          +'<button class="btn primary" onclick="openAndSendOffer()">Åpne og send tilbud</button>'
        +'</div>'

        // ── BOKS 1: Innledning ──────────────────────────────────────────────
        +'<div class="card" style="margin:0">'
          +'<div class="section-head"><div class="section-title">1. Innledning</div>'
            +'<label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--muted);cursor:pointer"><input type="checkbox" style="width:auto" '+(os.sections.innledning?'checked':'')+' onchange="_offerState.sections.innledning=this.checked;renderOfferPreview()" /> Vis</label>'
          +'</div>'
          +'<div style="font-size:12px;color:var(--muted);margin-bottom:6px">Tilbudet gjelder tømrerarbeider i forbindelse med...</div>'
          +'<textarea style="font-size:13px;min-height:60px" placeholder="Beskriv jobben..." oninput="_offerState.texts.innledning=this.value;renderOfferPreview()">'+escapeHtml(os.texts.innledning||p.description||'')+'</textarea>'
        +'</div>'

        // ── BOKS 2: Arbeidsomfang ───────────────────────────────────────────
        +'<div class="card" style="margin:0">'
          +'<div class="section-head"><div class="section-title">2. Arbeidsomfang</div>'
            +'<label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--muted);cursor:pointer"><input type="checkbox" style="width:auto" '+(os.sections.arbeidsomfang?'checked':'')+' onchange="_offerState.sections.arbeidsomfang=this.checked;renderOfferPreview()" /> Vis</label>'
          +'</div>'
          +'<div style="font-size:12px;color:var(--muted);margin-bottom:8px">Huk av hva som er inkludert:</div>'
          +(aoRows||'<div style="font-size:12px;color:var(--muted);font-style:italic">Ingen tilbudsposter funnet — legg til manuelt under</div>')
          +aoExtra
          +'<button class="btn small soft" style="margin-top:8px" onclick="_offerState.arbeidsomfangExtra.push({id:Math.random().toString(36).slice(2),text:\'\'});renderOfferEditorPane();renderOfferPreview()">+ Legg til linje</button>'
        +'</div>'

        // ── BOKS 3: Ikke medregnet ──────────────────────────────────────────
        +'<div class="card" style="margin:0">'
          +'<div class="section-head"><div class="section-title">3. Ikke medregnet</div>'
            +'<label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--muted);cursor:pointer"><input type="checkbox" style="width:auto" '+(os.sections.ikkemedregnet?'checked':'')+' onchange="_offerState.sections.ikkemedregnet=this.checked;renderOfferPreview()" /> Vis</label>'
          +'</div>'
          +imChecks
          +'<div style="margin-top:6px;padding:8px 10px;background:#f5f5f5;border-radius:8px;font-size:12px;color:var(--muted)">Alltid med: Arbeid som følge av skjulte feil eller mangler i eksisterende konstruksjon</div>'
          +imCustom
          +'<button class="btn small soft" style="margin-top:8px" onclick="_offerState.ikkemedregnet.custom.push(\'\');renderOfferEditorPane();renderOfferPreview()">+ Legg til linje</button>'
        +'</div>'

        // ── BOKS 4: Pris og betaling ────────────────────────────────────────
        +'<div class="card" style="margin:0">'
          +'<div class="section-head"><div class="section-title">4. Pris og betaling</div>'
            +'<label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--muted);cursor:pointer"><input type="checkbox" style="width:auto" '+(os.sections.prisogbetaling?'checked':'')+' onchange="_offerState.sections.prisogbetaling=this.checked;renderOfferPreview()" /> Vis</label>'
          +'</div>'
          +'<div style="display:flex;flex-direction:column;gap:8px">'
            +'<label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;padding:8px 10px;border-radius:10px;border:2px solid '+(os.prisType==='medgaatt'?'var(--blue)':'var(--line)')+';background:'+(os.prisType==='medgaatt'?'var(--blue-soft)':'var(--card)')+'">'
              +'<input type="radio" name="prisType" value="medgaatt" style="width:auto" '+(os.prisType==='medgaatt'?'checked':'')+' onchange="_offerState.prisType=this.value;renderOfferEditorPane();renderOfferPreview()" />'
              +'<div><div style="font-weight:700">Etter medgått tid</div><div style="font-size:11px;color:var(--muted)">Arbeidet utføres etter medgått tid og materialer</div></div>'
            +'</label>'
            +'<label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;padding:8px 10px;border-radius:10px;border:2px solid '+(os.prisType==='fastpris'?'var(--blue)':'var(--line)')+';background:'+(os.prisType==='fastpris'?'var(--blue-soft)':'var(--card)')+'">'
              +'<input type="radio" name="prisType" value="fastpris" style="width:auto" '+(os.prisType==='fastpris'?'checked':'')+' onchange="_offerState.prisType=this.value;renderOfferEditorPane();renderOfferPreview()" />'
              +'<div><div style="font-weight:700">Fastpris</div><div style="font-size:11px;color:var(--muted)">Arbeidet utføres til avtalt fastpris</div></div>'
            +'</label>'
            +'<label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;padding:8px 10px;border-radius:10px;border:2px solid '+(os.prisType==='begge'?'var(--blue)':'var(--line)')+';background:'+(os.prisType==='begge'?'var(--blue-soft)':'var(--card)')+'">'
              +'<input type="radio" name="prisType" value="begge" style="width:auto" '+(os.prisType==='begge'?'checked':'')+' onchange="_offerState.prisType=this.value;renderOfferEditorPane();renderOfferPreview()" />'
              +'<div><div style="font-weight:700">Kombinasjon</div><div style="font-size:11px;color:var(--muted)">Utføres etter medgått tid og fastpris</div></div>'
            +'</label>'
          +'</div>'
        +'</div>'

        // ── BOKS 4b: Beregnet tid ────────────────────────────────────────────
        +'<div class="card" style="margin:0">'
          +'<div class="section-head"><div class="section-title">Beregnet tid</div></div>'
          +'<div style="font-size:12px;color:var(--muted);margin-bottom:8px">Totalt beregnet: <strong>'+(ps.hours+cv.hoursTotal)+'t</strong> → ca. '+Math.ceil((ps.hours+cv.hoursTotal)/8)+' arbeidsdager á 8t</div>'
          +'<div style="display:flex;align-items:center;gap:10px">'
            +'<div style="flex:1"><label style="font-size:12px">Antall arbeidsdager i tilbudet</label>'
              +'<input type="number" placeholder="'+Math.ceil((ps.hours+cv.hoursTotal)/8)+'" value="'+escapeAttr(os.estDays||'')+'" style="font-size:20px;font-weight:800;padding:8px 12px" oninput="_offerState.estDays=this.value;renderOfferPreview()" /></div>'
            +'<div style="font-size:13px;color:var(--muted)">arbeidsdager</div>'
          +'</div>'
          +'<div style="font-size:11px;color:var(--muted);margin-top:6px">Vises i tilbudet som: Beregnet tid: XX arbeidsdager</div>'
        +'</div>'



        // ── Ekstra poster ──────────────────────────────────────────────────────
        +(function(){
          var extras=getExtraPosts(p);
          if(!extras.length) return '';
          var rows=extras.map(function(ep){
            var chk=os.extraPostsChecked[ep.id]!==false;
            return '<label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;padding:3px 0">'
              +'<input type="checkbox" style="width:auto" data-epid="'+ep.id+'" class="ep-chk" '+(chk?'checked':'')+'  />'

              +escapeHtml(ep.name)+' — '+currency(ep.amount)+'</label>';
          }).join('');
          return '<div class="card" style="margin:0">'
            +'<div class="section-head"><div class="section-title">Tilleggsposter</div></div>'
            +'<div style="font-size:12px;color:var(--muted);margin-bottom:8px">Fra prosjektkostnader og innleid:</div>'
            +rows+'</div>';
        })()

        // ── Postervisning ───────────────────────────────────────────────────
        +'<div class="card" style="margin:0">'
          +'<div class="section-head"><div class="section-title">Postervisning i tilbud</div></div>'
          +'<div style="display:flex;flex-direction:column;gap:8px">'
            +'<label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer"><input type="radio" name="offerPostMode" value="all" '+(os.postMode==='all'?'checked':'')+' onchange="setOfferPostMode(this.value)" style="width:auto"> Vis alle poster enkeltvis</label>'
            +'<label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer"><input type="radio" name="offerPostMode" value="simple" '+(os.postMode==='simple'?'checked':'')+' onchange="setOfferPostMode(this.value)" style="width:auto"> Enkel — Tømrerarbeid + Materialer</label>'
            +'<label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer"><input type="radio" name="offerPostMode" value="custom" '+(os.postMode==='custom'?'checked':'')+' onchange="setOfferPostMode(this.value)" style="width:auto"> Tilpasset — slå sammen og gi nye navn</label>'
          +'</div>'
          +'<div id="customPostEditor" style="'+(os.postMode==='custom'?'':'display:none')+';margin-top:10px"></div>'
        +'</div>'

        // ── Egne seksjoner ──────────────────────────────────────────────────
        +'<div class="card" style="margin:0">'
          +'<div class="section-head"><div class="section-title">➕ Egne seksjoner</div><button class="btn small soft" onclick="addFreeSection()">+ Legg til</button></div>'
          +'<div id="freeSectionList" style="display:flex;flex-direction:column;gap:8px;margin-top:4px">'
          +os.freeSections.map(function(fs,i){
            return '<div style="background:#f8f9fc;border:1px solid var(--line);border-radius:10px;padding:8px">'
              +'<div style="display:flex;gap:6px;margin-bottom:6px">'
              +'<input value="'+escapeAttr(fs.title)+'" placeholder="Tittel" style="flex:1;font-size:12px;padding:5px 8px;font-weight:700" oninput="_offerState.freeSections['+i+'].title=this.value;renderOfferPreview()" />'
              +'<button onclick="_offerState.freeSections.splice('+i+',1);renderOfferEditorPane();renderOfferPreview()" style="border:none;background:#fff1f0;color:var(--red);border-radius:6px;padding:5px 8px;cursor:pointer;font-size:12px">✕</button>'
              +'</div>'
              +'<textarea style="font-size:12px;min-height:60px" placeholder="Tekst..." oninput="_offerState.freeSections['+i+'].text=this.value;renderOfferPreview()">'+escapeHtml(fs.text||'')+'</textarea>'
              +'</div>';
          }).join('')
          +'</div>'
        +'</div>';

      if(os.postMode==='custom') renderCustomPostEditor();
    }


    window.setOfferPostMode=function(mode){
      _offerState.postMode=mode;
      const ed=document.getElementById('customPostEditor');
      if(ed) ed.style.display=mode==='custom'?'':'none';
      renderOfferPreview();
      if(mode==='custom') renderCustomPostEditor();
    };

    window.addFreeSection=function(){
      _offerState.freeSections.push({id:uid(),title:'Ny seksjon',text:''});
      renderOfferEditorPane();
      renderOfferPreview();
    };

    window.openAndSendOffer=function(){
      const p=getProject(currentProjectId); if(!p) return;
      const cust=getCustomer(p.customerId);
      const co=state.company||{};
      const doc=document.getElementById('offerPreviewDoc'); if(!doc) return;
      const color=(co&&co.color)||'#2e75b6';
      const css=getOfferCSS(color)+'body{padding:30px 40px}.no-print{display:flex}@media print{.no-print{display:none!important;visibility:hidden!important;height:0!important;overflow:hidden!important}body{padding:30px 40px!important;margin:0!important}}';

      // Build full HTML with print bar
      const toEmail=cust&&cust.email?cust.email:'';
      const subject='Tilbud - '+(p.name||'Prosjekt')+(co&&co.name?' - '+co.name:'');
      const body =
  'Hei,\n\n' +
  'Vedlagt finner du tilbud på ' + (p.name || 'prosjekt') + '.\n\n' +
  'Gi gjerne tilbakemelding dersom du har spørsmål.\n\n' +
  'Mvh\n' +
  (co.name || '');

const mailtoLink =
  'mailto:' + encodeURIComponent(toEmail) +
  '?subject=' + encodeURIComponent(subject) +
  '&body=' + encodeURIComponent(body);

      const html='<!DOCTYPE html><html lang="no"><head><meta charset="UTF-8"><title>Tilbud</title><style>'+css+'</style></head><body>'
        +doc.innerHTML+'</body></html>';

      const blob=new Blob([html],{type:'text/html'});
const url=URL.createObjectURL(blob);

const win = window.open(url,'_blank');

if(win){
  setTimeout(function(){
    const a=document.createElement('a');
    a.href=mailtoLink;
    a.style.display='none';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, 1200);
}

setTimeout(function(){URL.revokeObjectURL(url);},60000);
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

    function getOfferCSS(color){
      return '*{box-sizing:border-box;margin:0;padding:0}'
        +'body{font-family:Calibri,Arial,sans-serif;color:#000;font-size:11pt;line-height:1.5}'
        +'.hdr{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}'
        +'.co{text-align:left;font-size:10.5pt;line-height:1.5}'
        +'.co strong{font-size:11.5pt;display:block;font-weight:700}'
        +'.divider{border:none;border-top:2.5px solid '+color+';margin:12px 0 28px}'
        +'.custbox{border:2.5px solid '+color+';padding:16px 18px;font-size:10.5pt;line-height:2.1;display:inline-block;min-width:280px;max-width:45%;margin-bottom:28px;border-radius:4px}'
        +'.title{font-size:26pt;font-weight:700;margin-bottom:18px}'
        +'.mt{width:100%;border-collapse:collapse;margin-bottom:24px}'
        +'.mt .hr th{background:'+color+';color:#fff;padding:8px 12px;text-align:left;font-size:10pt;font-weight:600}'
        +'.mt .hr th.ac{text-align:right}'
        +'.mt td{padding:7px 12px;border-bottom:1px solid #e8e8e8;font-size:10.5pt;vertical-align:top}'
        +'.mt tr:nth-child(odd) td{background:#f0f5fb}'
        +'.mt tr:nth-child(even) td{background:#fff}'
        +'.dc{width:65%}'
        +'.ac{text-align:right;font-weight:700;white-space:nowrap}'
        +'.sum-row td{border-top:1.5px solid #aaa;font-weight:700;padding:8px 12px;background:#f0f5fb!important}'
        +'.mva-row td{color:#666;font-size:10pt;background:#fff!important}'
        +'.total-row td{background:'+color+'!important;color:#fff!important;font-weight:800;font-size:11.5pt;padding:10px 12px}'
        +'.sec{margin-bottom:18px}'
        +'.sec h3{font-size:10.5pt;font-weight:700;text-transform:uppercase;margin-bottom:6px}'
        +'.sec p{font-size:10.5pt;line-height:1.65;color:#222;margin-bottom:5px}';
    }


    function renderOfferPreview(){
      const p=getProject(currentProjectId); if(!p) return;
      rebuildExtraPosts(p);
      const cv=compute(p);
      const ps=computeOfferPostsTotal(p);
      const co=state.company||{};
      const color=co.color||'#2e75b6';
      const today=new Date().toLocaleDateString('nb-NO');
      const cust=getCustomer(p.customerId);
      const os=_offerState;
      function fmt(n){return Math.round(n||0).toLocaleString('nb-NO')+' kr';}
      function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
      function nl2br(s){return esc(s||'').replace(/\n/g,'<br>');}
      function listItems(s){
        if(!s) return '';
        return s.split('\n').filter(function(l){return l.trim();}).map(function(l){
          return '<p style="padding-left:16px">'+esc(l.replace(/^[-–]\s*/,''))+'</p>';
        }).join('');
      }

      // Build price rows
      var priceRows='', totalEx=0;
      if(os.postMode==='simple'){
        var lEx=cv.totalLaborSaleEx, mEx=cv.totalMatSaleEx, eEx=cv.extrasBase+cv.rigEx;
        if(lEx>0){priceRows+='<tr><td class="dc"><b>Tømrerarbeider</b></td><td class="ac">'+fmt(lEx)+'</td></tr>';totalEx+=lEx;}
        if(mEx>0){priceRows+='<tr><td class="dc"><b>Materialer</b></td><td class="ac">'+fmt(mEx)+'</td></tr>';totalEx+=mEx;}
        if(eEx>0){priceRows+='<tr><td class="dc"><b>Rigg og Drift</b></td><td class="ac">'+fmt(eEx)+'</td></tr>';totalEx+=eEx;}
      } else if(os.postMode==='custom'){
        os.customPosts.forEach(function(cp){priceRows+='<tr><td class="dc"><b>'+esc(cp.name||'')+'</b></td><td class="ac">'+fmt(cp.price)+'</td></tr>';totalEx+=cp.price;});
      } else {
        if(p.offerPosts&&p.offerPosts.length){
          p.offerPosts.filter(function(post){return post.type!=='option'||post.enabled;}).forEach(function(post){
            // Calc posts: show "Tømrerarbeid + Materialer" instead of timer info
            var desc='';
            if(post.type==='calc'){
              var hasLabor=post.snapshotCompute&&post.snapshotCompute.laborSaleEx>0;
              var hasMat=post.snapshotCompute&&post.snapshotCompute.matSaleEx>0;
              if(hasLabor&&hasMat) desc='Tømrerarbeid + Materialer';
              else if(hasLabor) desc='Tømrerarbeid';
              else if(hasMat) desc='Materialer';
            } else if(post.description) {
              desc=post.description;
            }
            var optBadge=post.type==='option'?'<span style="font-size:9pt;color:#a96800;font-weight:600;margin-left:6px">(Opsjon)</span>':'';
            priceRows+='<tr><td class="dc"><b>'+esc(post.name||'')+optBadge+'</b>'+(desc?'<br><span style="font-size:10pt;color:#555">'+esc(desc)+'</span>':'')+'</td><td class="ac">'+fmt(post.price||0)+'</td></tr>';
            totalEx+=Number(post.price)||0;
          });
        } else {
          var lEx2=cv.totalLaborSaleEx,mEx2=cv.totalMatSaleEx;
          if(lEx2>0){priceRows+='<tr><td class="dc"><b>Tømrerarbeider</b></td><td class="ac">'+fmt(lEx2)+'</td></tr>';totalEx+=lEx2;}
          if(mEx2>0){priceRows+='<tr><td class="dc"><b>Materialer</b></td><td class="ac">'+fmt(mEx2)+'</td></tr>';totalEx+=mEx2;}
        }
      // Add extra posts (prosjektkostnader + innleid) if checked
      getExtraPosts(p).forEach(function(ep){
        if(os.extraPostsChecked[ep.id]!==false){
          priceRows+='<tr><td class="dc"><b>'+esc(ep.name)+'</b></td><td class="ac">'+fmt(ep.amount)+'</td></tr>';
          totalEx+=ep.amount;
        }
      });
      }
      var mva=Math.round(totalEx*0.25);
      var totalInc=Math.round(totalEx*1.25);

      var logoSrc=co.logo||window._fallbackLogo||'';
      var logoHtml=logoSrc?'<div style="width:350px;height:140px;display:flex;align-items:center"><img src="'+logoSrc+'" style="max-width:100%;max-height:100%;object-fit:contain"></div>':'';
      var coBlock=
  (co.name?'<strong style="display:block;margin-bottom:4px">'+esc(co.name)+'</strong>':'')
  +(co.address?'<div>'+esc(co.address)+'</div>':'')
  +((co.zip||co.city)?'<div>'+ (esc(co.zip||'')+' '+esc(co.city||'')).trim() +'</div>':'')
  +(co.phone?'<div>Tlf: '+esc(co.phone)+'</div>':'')
  +(co.email?'<div>'+esc(co.email)+'</div>':'')
  +(co.orgNr?'<div>Org.nr: '+esc(co.orgNr)+'</div>':'');
      var custBlock=(cust?'<b>'+esc(cust.name)+'</b>':'NAVN')+'<br>'
        +(cust&&cust.phone?esc(cust.phone)+'<br>':'')
        +(p.address?esc(p.address)+'<br>':'')
        +(cust&&cust.email?esc(cust.email):'');

      function sec(key,title,content){
        if(!os.sections[key]) return '';
        return '<div class="sec"><h3>'+title+'</h3>'+content+'</div>';
      }

      var innlDesc=os.texts.innledning||p.name||'[prosjekt]';
      var innl='Tilbudet gjelder tømrerarbeider i forbindelse med '+esc(innlDesc)+'. Arbeidet utføres iht. befaring og avtalt omfang.';
      var validity=p.offer&&p.offer.validity?p.offer.validity:'14';

      var css=getOfferCSS(color);

      var html='<style>'+css+'</style>'
        +'<div class="hdr">'+logoHtml+'<div class="co">'+coBlock+'</div></div>'
        +'<hr class="divider">'
        +'<div class="custbox">'+custBlock+'</div>'
        +'<div class="title">TILBUD</div>'
        +'<table class="mt"><thead><tr class="hr"><th class="dc">BESKRIVELSE</th><th class="ac">SUM eks mva</th></tr></thead><tbody>'
        +priceRows
        +'<tr class="mva-row"><td class="dc">MVA 25%</td><td class="ac">'+fmt(mva)+'</td></tr>'
        +'<tr class="sum-row"><td class="dc">Sum eks. mva</td><td class="ac">'+fmt(totalEx)+'</td></tr>'
        +'<tr class="total-row"><td class="dc"><b>ESTIMERT TOTALPRIS INKL. MVA</b></td><td class="ac">'+fmt(totalInc)+'</td></tr>'
        +'</tbody></table>'
        +sec('innledning','Innledning','<p>'+innl+'</p>')
        +sec('grunnlag','Grunnlag for tilbudet','<p>Tilbudet er basert på befaring, mottatte tegninger/skisser og normale arbeidsforhold. Dersom forutsetningene endres eller det avdekkes forhold som ikke var synlige ved befaring, kan dette medføre endringer i pris og fremdrift.</p>')
        +sec('arbeidsomfang','Arbeidsomfang',
          '<p>Følgende arbeid er inkludert i tilbudet:</p>'
          +os.arbeidsomfangPosts.filter(function(i){return i.checked;}).map(function(i){return '<p style="padding-left:16px">- '+esc(i.name)+'</p>';}).join('')
          +os.arbeidsomfangExtra.filter(function(i){return i.text;}).map(function(i){return '<p style="padding-left:16px">- '+esc(i.text)+'</p>';}).join('')
        )
        +sec('ikkemedregnet','Ikke medregnet i tilbudet',
          '<p>Følgende arbeider er ikke inkludert dersom annet ikke er spesifisert:</p>'
          +(os.ikkemedregnet.elektriker?'<p style="padding-left:16px">- Elektrikerarbeider</p>':'')
          +(os.ikkemedregnet.rorlegger?'<p style="padding-left:16px">- Rørleggerarbeider</p>':'')
          +(os.ikkemedregnet.maling?'<p style="padding-left:16px">- Maling og sparkling</p>':'')
          +(os.ikkemedregnet.byggesoknad?'<p style="padding-left:16px">- Byggesøknad og prosjektering</p>':'')
          +(os.ikkemedregnet.avfall?'<p style="padding-left:16px">- Avfallshåndtering</p>':'')
          +(os.ikkemedregnet.stillas?'<p style="padding-left:16px">- Stillas</p>':'')
          +os.ikkemedregnet.custom.filter(function(t){return t;}).map(function(t){return '<p style="padding-left:16px">- '+esc(t)+'</p>';}).join('')
          +'<p style="padding-left:16px">- Arbeid som følge av skjulte feil eller mangler i eksisterende konstruksjon</p>'
        )
        +sec('prisogbetaling','Pris og betaling',
          '<p>Arbeidet utføres '+(os.prisType==='fastpris'?'til avtalt fastpris':os.prisType==='begge'?'etter medgått tid og fastpris':'etter medgått tid og materialer')+'. Betalingsfrist er 10 dager netto. Ved større arbeider kan det faktureres delbetaling underveis.</p>'
          +'<p>Timepris tømrer: kr '+Math.round(p.work.timeRate||850)+' eks. mva pr time</p>'
          +'<p>Påslag på materiell: '+(p.settings.materialMarkup||15)+'%</p>'
          +'<p>Arbeid utover beskrevet omfang regnes som tilleggsarbeid og utføres etter avtale med kunde.</p>'
        )
        +sec('fremdrift','Fremdrift',
          '<p>Planlagt oppstart: '+esc(p.startPref||'Etter avtale')+'</p>'
          +(os.estDays?'<p>Beregnet tid: <strong>'+esc(os.estDays)+'</strong> arbeidsdager.</p>':'')
          +'<p>Oppstart og ferdigstillelse er estimert og kan påvirkes av værforhold, leveranser og uforutsette forhold.</p>')
        +sec('forbehold','Forbehold','<p>Tilbudet er basert på dagens priser på materialer og lønn. Det tas forbehold om prisendringer fra leverandører eller uforutsette forhold utenfor entreprenørens kontroll. Riggposten omfatter transport/frakt av materialer, materialhåndtering, tildekking av konstruksjonen i byggetiden, organisering/koordinering, rigging av utstyr og verktøy, vernerunder, HMS-tiltak og retur, etc.</p>'
          +'<p>Tilbudet er gyldig i <b>'+esc(validity)+'</b> dager fra tilbudsdato, dersom annet ikke er avtalt.</p>')
        +os.freeSections.map(function(fs){
          return fs.title||fs.text?'<div class="sec"><h3>'+esc(fs.title||'')+'</h3><p>'+nl2br(fs.text)+'</p></div>':'';
        }).join('');

      var doc=document.getElementById('offerPreviewDoc');
      if(doc) doc.innerHTML=html;
    }
