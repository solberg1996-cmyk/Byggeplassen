    function defaultOfferState(){
      return {
        postMode: 'all',
        customPosts: [],
        // Seksjonsrekkefølge og titler — sås fra state.offerTemplate ved
        // første init (se applyOfferTemplateDefaults i app.js), redigerbare
        // per prosjekt deretter.
        sectionOrder: OFFER_SECTION_ORDER_DEFAULT.slice(),
        sectionTitles: {},
        sections: {
          innledning: true, grunnlag: true, arbeidsomfang: true,
          ikkemedregnet: true, prisogbetaling: true, fremdrift: true, forbehold: true
        },
        texts: { innledning: '', grunnlag: '', prisogbetaling: '', fremdrift: '', forbehold: '' },
        innledningTemplate: null, // firmamalens setningsmal for innledning, sås ved init
        // Arbeidsomfang: checked post ids + custom items
        arbeidsomfangPosts: [],   // [{id, name, checked}]
        arbeidsomfangExtra: [],   // [{id, text}] custom added lines
        // Ikke medregnet: checkboxes
        ikkemedregnet: {
          elektriker: true, rorlegger: true, maling: true,
          byggesoknad: true, avfall: true, stillas: true,
          skjultefeil: true, prisokning: true, custom: []
        },
        // Pris og betaling type
        prisType: 'medgaatt',  // 'medgaatt' | 'fastpris' | 'begge'
        freeSections: [],
        estDays: '',
        rigChecked: true,        // Rigg og Drift post checkbox
        extraPostsChecked: {},   // {postId: true/false} for auto-generated extra posts
        templateApplied: false,  // sikrer at firmamalen kun sås inn én gang
        terminology: OFFER_TERMINOLOGY // nye prosjekter har allerede prisoverslag-tekster
      };
    }
    // Prisoverslagets innstillinger for summer og sammendrag. Leser uten å
    // opprette p.offerState — det skjer først i Forhåndsvisning, der
    // arbeidsomfanget fylles ut fra postene.
    function readOfferState(p){
      return {...defaultOfferState(), ...(p.offerState||{})};
    }

    // Faste valg under «Ikke medregnet» — samme liste brukes i redigering og
    // i tilbudsdokumentet. Standardvalg for nye tilbud settes i defaultOfferState;
    // eksisterende tilbud beholder sine valg.
    const IKKE_MEDREGNET_ITEMS=[
      {key:'elektriker',label:'Elektrikerarbeider'},
      {key:'rorlegger',label:'Rørleggerarbeider'},
      {key:'maling',label:'Maling og sparkling'},
      {key:'murerflis',label:'Murer- og flisarbeid'},
      {key:'graving',label:'Graving, grunnarbeid og drenering'},
      {key:'byggesoknad',label:'Byggesøknad og prosjektering'},
      {key:'gebyrer',label:'Kommunale gebyrer og saksbehandling'},
      {key:'ansvarsrett',label:'Ansvarsrett og uavhengig kontroll'},
      {key:'kjokken',label:'Kjøkken, garderobe og hvitevarer'},
      {key:'avfall',label:'Avfallshåndtering'},
      {key:'stillas',label:'Stillas'},
      {key:'byggestrom',label:'Byggestrøm og vann (stilles til disposisjon av kunde)'},
      {key:'vintertiltak',label:'Vintertiltak (oppvarming, tildekking, uttørking og snørydding)'},
      {key:'skjultefeil',label:'Arbeid som følge av skjulte feil eller mangler i eksisterende konstruksjon'},
      {key:'rate',label:'Utbedring av råteskader i eksisterende konstruksjon'},
      {key:'miljosanering',label:'Miljøsanering (asbest, PCB o.l.)'},
      {key:'prisokning',label:'Prisøkning på materialer fra leverandør etter at prisoverslaget er gitt'},
    ];

    // Peker til aktivt prosjekts offerState (settes i initOfferPreviewTab) —
    // redigeringer muterer prosjektet direkte og lagres via saveState.
    var _offerState = defaultOfferState();
    var _offerSaveTimer = null;
    var _previewResizeObserver = null;
    const OFFER_DOC_WIDTH = 794;

    // Forhåndsvisning: redigeringen til venstre, prisoverslaget slik det sendes
    // til høyre — samme dokument som PDF-en, bare skalert ned.
    function renderTabPreview(p){
      const pid=escapeAttr(p.id);
      return '<div class="offer-editor">'
        +'<div class="offer-editor-main" id="offerEditorPane"></div>'
        +'<aside class="offer-preview-panel" aria-label="Prisoverslaget slik det sendes">'
          +'<div class="offer-preview-head">'
            +'<span class="offer-preview-title">Slik prisoverslaget sendes</span>'
            +'<div class="offer-preview-actions">'
              +'<button class="btn small secondary" onclick="currentProjectId=\''+pid+'\';downloadOfferPDF()">Last ned HTML</button>'
              +'<button class="btn small soft" onclick="currentProjectId=\''+pid+'\';openOfferFullPreview()">Full visning</button>'
            +'</div>'
          +'</div>'
          +'<div class="offer-preview-frame" id="offerPreviewFrame">'
            +'<div class="offer-preview-paper" id="offerPreviewPaper">'
              +'<div id="offerPreviewDoc" style="width:'+OFFER_DOC_WIDTH+'px;background:#fff;transform-origin:top left;pointer-events:none"></div>'
            +'</div>'
          +'</div>'
        +'</aside>'
      +'</div>';
    }

    // Dokumentet er A4-bredt (794 px) og skaleres ned til forhåndsvisningen.
    // transform endrer ikke layout, så arket får skalert bredde og høyde selv.
    function fitOfferPreview(){
      const frame=document.getElementById('offerPreviewFrame');
      const paper=document.getElementById('offerPreviewPaper');
      const doc=document.getElementById('offerPreviewDoc');
      if(!frame||!paper||!doc) return;
      const frameStyle=getComputedStyle(frame);
      const available=frame.clientWidth-parseFloat(frameStyle.paddingLeft)-parseFloat(frameStyle.paddingRight);
      const scale=Math.min(available/OFFER_DOC_WIDTH,1);
      doc.style.transform='scale('+scale+')';
      paper.style.width=Math.floor(OFFER_DOC_WIDTH*scale)+'px';
      paper.style.height=Math.ceil(doc.offsetHeight*scale)+'px';
    }

    // Skalerer på nytt når vinduet endrer bredde (delt skjerm) eller
    // dokumentet endrer høyde (f.eks. når logoen er lastet).
    function watchOfferPreviewSize(){
      if(_previewResizeObserver) _previewResizeObserver.disconnect();
      const frame=document.getElementById('offerPreviewFrame');
      const doc=document.getElementById('offerPreviewDoc');
      if(!frame||!doc||!window.ResizeObserver) return;
      _previewResizeObserver=new ResizeObserver(fitOfferPreview);
      _previewResizeObserver.observe(frame);
      _previewResizeObserver.observe(doc);
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

      function visToggle(key){
        return '<label class="offer-toggle" title="Vis i prisoverslaget">'
          +'Vis<input type="checkbox" role="switch" class="switch" '+(os.sections[key]?'checked':'')
          +' onchange="_offerState.sections.'+key+'=this.checked;renderOfferPreview()" /></label>';
      }


      // Avkryssede øverst, resten under. Sorteres kun når fanen tegnes, så et
      // punkt ikke hopper bort i det man trykker på det.
      function imCheckRow(item){
        return '<label class="offer-check">'
          +'<input type="checkbox" '+(os.ikkemedregnet[item.key]?'checked':'')
          +' onchange="_offerState.ikkemedregnet.'+item.key+'=this.checked;renderOfferPreview()" />'
          +'<span>'+item.label+'</span></label>';
      }
      const imSelected=IKKE_MEDREGNET_ITEMS.filter(function(item){return os.ikkemedregnet[item.key];});
      const imOthers=IKKE_MEDREGNET_ITEMS.filter(function(item){return !os.ikkemedregnet[item.key];});
      const imChecks=(imSelected.length?'<div class="offer-check-group-label">Med i prisoverslaget · '+imSelected.length+'</div>'+imSelected.map(imCheckRow).join(''):'')
        +(imOthers.length?'<div class="offer-check-group-label">Andre valg · '+imOthers.length+'</div>'+imOthers.map(imCheckRow).join(''):'');
      const imCustom=os.ikkemedregnet.custom.map(function(t,i){
        return '<div class="offer-line-row">'
          +'<input class="offer-input small" value="'+escapeAttr(t)+'" placeholder="Legg til punkt..."'
          +' oninput="_offerState.ikkemedregnet.custom['+i+']=this.value;renderOfferPreview()" />'
          +'<button class="offer-line-remove" title="Fjern" onclick="_offerState.ikkemedregnet.custom.splice('+i+',1);renderOfferEditorPane();renderOfferPreview()">✕</button>'
          +'</div>';
      }).join('');

      const aoRows=os.arbeidsomfangPosts.map(function(item,i){
        return '<label class="offer-check">'
          +'<input type="checkbox" '+(item.checked?'checked':'')
          +' onchange="_offerState.arbeidsomfangPosts['+i+'].checked=this.checked;renderOfferPreview()" />'
          +'<span>'+escapeHtml(item.name)+'</span></label>';
      }).join('');
      const aoExtra=os.arbeidsomfangExtra.map(function(t,i){
        return '<div class="offer-line-row">'
          +'<input class="offer-input small" value="'+escapeAttr(t.text)+'" placeholder="Skriv inn..."'
          +' oninput="_offerState.arbeidsomfangExtra['+i+'].text=this.value;renderOfferPreview()" />'
          +'<button class="offer-line-remove" title="Fjern" onclick="_offerState.arbeidsomfangExtra.splice('+i+',1);renderOfferEditorPane();renderOfferPreview()">✕</button>'
          +'</div>';
      }).join('');

      // Pristype som valgknapper, med forklaring til valget under
      const priceTypes=[
        {value:'medgaatt', title:'Medgått tid', desc:'Arbeidet utføres etter medgått tid og materialer'},
        {value:'fastpris', title:'Fastpris', desc:'Arbeidet utføres til avtalt fastpris'},
        {value:'begge', title:'Kombinasjon', desc:'Utføres etter medgått tid og fastpris'}
      ];
      const selectedPriceType=priceTypes.find(function(t){return t.value===os.prisType;})||priceTypes[0];
      const priceTypeControl='<div class="segmented" role="radiogroup" aria-label="Pris og betaling">'
        +priceTypes.map(function(t){
          const isSelected=t===selectedPriceType;
          return '<label class="segmented-option'+(isSelected?' is-active':'')+'">'
            +'<input type="radio" name="prisType" value="'+t.value+'" '+(isSelected?'checked':'')
            +' onchange="_offerState.prisType=this.value;renderOfferEditorPane();renderOfferPreview()" />'
            +'<span>'+t.title+'</span></label>';
        }).join('')
        +'</div>'
        +'<div class="offer-card-hint offer-pricetype-hint">'+selectedPriceType.desc+'</div>';

      // Ekstra poster (Tilleggsposter)
      function renderExtrasCard(){
        const extras=getExtraPosts(p);
        if(!extras.length) return '';
        const rows=extras.map(function(ep){
          const chk=os.extraPostsChecked[ep.id]!==false;
          return '<label class="offer-check">'
            +'<input type="checkbox" data-epid="'+ep.id+'" class="ep-chk" '+(chk?'checked':'')+' />'
            +'<span>'+escapeHtml(ep.name)+' — '+currency(ep.amount)+'</span></label>';
        }).join('');
        return ''
          +'<div class="offer-card">'
            +'<div class="offer-card-head"><div class="offer-card-title">Tilleggsposter</div></div>'
            +'<div class="offer-card-hint">Fra prosjektkostnader:</div>'
            +'<div class="offer-card-list">'+rows+'</div>'
          +'</div>';
      }

      // Beregnet tid
      const beregnetTimer=ps.hours+cv.hoursTotal;
      const beregnetDager=Math.ceil(beregnetTimer/8);

      el.innerHTML=''

        // ═══ SONE 1: INNHOLD ═══════════════════════════════════════
        +'<section class="offer-zone">'
          +'<div class="offer-zone-head">'
            +'<h2>Innhold</h2>'
            +'<div class="zone-hint">Hva prisoverslaget sier til kunden</div>'
          +'</div>'

          // Innledning
          +'<div class="offer-card">'
            +'<div class="offer-card-head">'
              +'<div class="offer-card-title">Innledning</div>'
              +visToggle('innledning')
            +'</div>'
            +'<div class="offer-card-hint">Prisoverslaget gjelder tømrerarbeider i forbindelse med…</div>'
            +'<textarea class="offer-textarea" placeholder="Beskriv jobben..."'
            +' oninput="_offerState.texts.innledning=this.value;renderOfferPreview()">'
            +escapeHtml(os.texts.innledning||p.description||'')+'</textarea>'
          +'</div>'

          // Arbeidsomfang
          +'<div class="offer-card">'
            +'<div class="offer-card-head">'
              +'<div class="offer-card-title">Arbeidsomfang</div>'
              +visToggle('arbeidsomfang')
            +'</div>'
            +'<div class="offer-card-hint">Huk av hva som er inkludert:</div>'
            +'<div class="offer-card-list">'
            +(aoRows||'<div class="offer-card-hint" style="font-style:italic;margin:0">Ingen poster funnet — legg til manuelt under</div>')
            +'</div>'
            +aoExtra
            +'<button class="offer-add-line" onclick="_offerState.arbeidsomfangExtra.push({id:Math.random().toString(36).slice(2),text:\'\'});renderOfferEditorPane();renderOfferPreview()">+ Legg til linje</button>'
          +'</div>'

          // Ikke medregnet
          +'<div class="offer-card">'
            +'<div class="offer-card-head">'
              +'<div class="offer-card-title">Ikke medregnet</div>'
              +visToggle('ikkemedregnet')
            +'</div>'
            +'<div class="offer-card-list offer-card-list--grid">'+imChecks+'</div>'
            +imCustom
            +'<button class="offer-add-line" onclick="_offerState.ikkemedregnet.custom.push(\'\');renderOfferEditorPane();renderOfferPreview()">+ Legg til linje</button>'
          +'</div>'

          // Egne seksjoner
          +'<div class="offer-card">'
            +'<div class="offer-card-head">'
              +'<div class="offer-card-title">Egne seksjoner</div>'
              +'<button class="offer-add-line" style="margin-top:0" onclick="addFreeSection()">+ Legg til</button>'
            +'</div>'
            +'<div class="offer-card-hint">Frie tekst-seksjoner du kan legge til i prisoverslaget.</div>'
            +'<div class="offer-freesection-list" id="freeSectionList">'
            +os.freeSections.map(function(fs,i){
              return '<div class="offer-freesection">'
                +'<div class="offer-freesection-head">'
                  +'<input class="offer-freesection-title" value="'+escapeAttr(fs.title)+'" placeholder="Tittel"'
                  +' oninput="_offerState.freeSections['+i+'].title=this.value;renderOfferPreview()" />'
                  +'<button class="offer-line-remove" title="Fjern seksjon" onclick="_offerState.freeSections.splice('+i+',1);renderOfferEditorPane();renderOfferPreview()">✕</button>'
                +'</div>'
                +'<textarea class="offer-textarea" placeholder="Tekst..."'
                +' oninput="_offerState.freeSections['+i+'].text=this.value;renderOfferPreview()">'+escapeHtml(fs.text||'')+'</textarea>'
              +'</div>';
            }).join('')
            +'</div>'
          +'</div>'
        +'</section>'

        // ═══ SONE 2: PRIS OG OPPGJØR ═══════════════════════════════
        +'<section class="offer-zone">'
          +'<div class="offer-zone-head">'
            +'<h2>Pris og oppgjør</h2>'
            +'<div class="zone-hint">Hvordan prisoverslaget regnes og presenteres</div>'
          +'</div>'

          // Pris og betaling
          +'<div class="offer-card">'
            +'<div class="offer-card-head">'
              +'<div class="offer-card-title">Pris og betaling</div>'
              +visToggle('prisogbetaling')
            +'</div>'
            +priceTypeControl
          +'</div>'

          // Beregnet tid
          +'<div class="offer-card">'
            +'<div class="offer-card-head"><div class="offer-card-title">Beregnet tid</div></div>'
            +'<div class="offer-days-total">Totalt beregnet: <strong>'+beregnetTimer+'t</strong> → ca. '+beregnetDager+' arbeidsdager á 8t</div>'
            +'<div class="offer-days-row">'
              +'<label>Arbeidsdager i prisoverslaget'
                +'<input type="number" class="offer-input numeric" placeholder="'+beregnetDager+'" value="'+escapeAttr(os.estDays||'')+'"'
                +' oninput="_offerState.estDays=this.value;renderOfferPreview()" /></label>'
              +'<div class="days-unit">arbeidsdager</div>'
            +'</div>'
            +'<div class="offer-card-hint" style="margin:10px 0 0">Vises som: <em>Beregnet tid: XX arbeidsdager</em></div>'
          +'</div>'

          // Tilleggsposter
          +renderExtrasCard()

          // Postervisning
          +'<div class="offer-card">'
            +'<div class="offer-card-head"><div class="offer-card-title">Postervisning</div></div>'
            +'<div class="offer-card-hint">Hvordan postene vises i pristabellen.</div>'
            +'<div class="offer-postmode-list">'
              +'<label class="offer-check"><input type="radio" name="offerPostMode" value="all" '+(os.postMode==='all'?'checked':'')+' onchange="setOfferPostMode(this.value)" /><span>Vis alle poster enkeltvis</span></label>'
              +'<label class="offer-check"><input type="radio" name="offerPostMode" value="simple" '+(os.postMode==='simple'?'checked':'')+' onchange="setOfferPostMode(this.value)" /><span>Enkel — Tømrerarbeid + Materialer</span></label>'
              +'<label class="offer-check"><input type="radio" name="offerPostMode" value="custom" '+(os.postMode==='custom'?'checked':'')+' onchange="setOfferPostMode(this.value)" /><span>Tilpasset — slå sammen og gi nye navn</span></label>'
            +'</div>'
            +'<div id="customPostEditor"'+(os.postMode==='custom'?'':' style="display:none"')+'></div>'
          +'</div>'
        +'</section>';

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

    window.sendOfferNow=function(){
      const p=getProject(currentProjectId); if(!p) return;
      if(p.status==='Utkast'){ setProjectStatus(p,'Sendt',Date.now()); persistAndUpdate(); }
      const cust=getCustomer(p.customerId);
      const co=state.company||{};
      const toEmail=cust&&cust.email?cust.email:'';
      const tpl=state.offerTemplate||defaultOfferTemplate();
      const emailCtx={
        prosjekt: p.name||'Prosjekt',
        firma: co.name||'',
        kunde: cust&&cust.name?cust.name:''
      };
      const subject=resolveOfferTokens(tpl.emailSubject||defaultOfferTemplate().emailSubject,emailCtx);
      const body=resolveOfferTokens(tpl.emailBody||defaultOfferTemplate().emailBody,emailCtx);
      const mailtoLink=
        'mailto:'+encodeURIComponent(toEmail)
        +'?subject='+encodeURIComponent(subject)
        +'&body='+encodeURIComponent(body);

      openOfferFullPreview();

      setTimeout(function(){
        var a=document.createElement('a');
        a.href=mailtoLink;
        a.style.display='none';
        document.body.appendChild(a);
        a.click();
        a.remove();
      },1000);
    };

    // Seksjoner med generert (ikke ren tekst) innhold — kan flyttes/omdøpes
    // via malen, men teksten deres bygges fra prosjektdata, ikke fra os.texts.
    var OFFER_STRUCTURED_SECTIONS=['arbeidsomfang','ikkemedregnet'];

    function resolveOfferTokens(text,ctx){
      return String(text||'').replace(/\{\{(\w+)\}\}/g,function(_,key){
        return ctx[key]!=null?String(ctx[key]):'';
      });
    }

    function offerSectionTitle(os,key){
      return (os.sectionTitles&&os.sectionTitles[key])
        ||(defaultOfferTemplate().sections[key]||{}).title
        ||key;
    }

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


    // Dokumentet vises i appen (forhåndsvisning og utskrift til PDF), der appens
    // generelle regler for th og .title tidligere har gitt det skrift og farger.
    // Her låses de til nøyaktig slik PDF-en har sett ut, så et nytt app-design
    // aldri endrer dokumentet. Brukes ikke i «Last ned HTML» (uten app-CSS).
    function getOfferAppLockCSS(){
      var displayFont="'Bricolage Grotesque','DM Sans',system-ui,sans-serif";
      return '.title{font-family:'+displayFont+';color:#162736;letter-spacing:-.03em;line-height:1.15}'
        +'.mt .hr th{font-family:'+displayFont+';text-transform:uppercase;letter-spacing:.04em;border-bottom:1px solid #DDE6EC;vertical-align:top}';
    }

    // Logo, firmainfo og kundeboks — felles for tilbud og endringsmelding.
    function buildOfferLetterheadHtml(p){
      const co=state.company||{};
      const cust=getCustomer(p.customerId);
      const esc=escapeHtml;
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
      return '<div class="hdr">'+logoHtml+'<div class="co">'+coBlock+'</div></div>'
        +'<hr class="divider">'
        +'<div class="custbox">'+custBlock+'</div>';
    }

    function renderOfferPreview(){
      const p=getProject(currentProjectId); if(!p) return;
      // Alle redigeringshandlere ender her — lagre prosjektet (debounced,
      // saveState håndterer selv sky-synk)
      if(_offerSaveTimer) clearTimeout(_offerSaveTimer);
      _offerSaveTimer=setTimeout(saveState, 800);
      rebuildExtraPosts(p);
      const cv=compute(p);
      const ps=computeOfferPostsTotal(p);
      const co=state.company||{};
      const color=co.color||'#2e75b6';
      const today=new Date().toLocaleDateString('nb-NO');
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
      var priceRows='';
      if(os.postMode==='simple'){
        var lEx=cv.totalLaborSaleEx, mEx=cv.totalMatSaleEx, eEx=cv.extrasBase+cv.rigEx;
        if(lEx>0) priceRows+='<tr><td class="dc"><b>Tømrerarbeider</b></td><td class="ac">'+fmt(lEx)+'</td></tr>';
        if(mEx>0) priceRows+='<tr><td class="dc"><b>Materialer</b></td><td class="ac">'+fmt(mEx)+'</td></tr>';
        if(eEx>0) priceRows+='<tr><td class="dc"><b>Rigg og Drift</b></td><td class="ac">'+fmt(eEx)+'</td></tr>';
      } else {
        if(os.postMode==='custom'){
          os.customPosts.forEach(function(cp){priceRows+='<tr><td class="dc"><b>'+esc(cp.name||'')+'</b></td><td class="ac">'+fmt(getCustomPostPrice(p,cp))+'</td></tr>';});
        } else if(p.offerPosts&&p.offerPosts.length){
          p.offerPosts.filter(function(post){return !isChangeOrder(post);}).forEach(function(post){
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
            var isIncluded=isPostInTotal(post);
            var optBadge=post.type==='option'?'<span style="font-size:9pt;color:#a96800;font-weight:600;margin-left:6px">'+(isIncluded?'(Opsjon)':'(Opsjon – ikke med i totalsum)')+'</span>':'';
            priceRows+='<tr><td class="dc"><b>'+esc(post.name||'')+optBadge+'</b>'+(desc?'<br><span style="font-size:10pt;color:#555">'+esc(desc)+'</span>':'')+'</td><td class="ac">'+fmt(post.price||0)+'</td></tr>';
          });
        } else {
          var lEx2=cv.totalLaborSaleEx,mEx2=cv.totalMatSaleEx;
          if(lEx2>0) priceRows+='<tr><td class="dc"><b>Tømrerarbeider</b></td><td class="ac">'+fmt(lEx2)+'</td></tr>';
          if(mEx2>0) priceRows+='<tr><td class="dc"><b>Materialer</b></td><td class="ac">'+fmt(mEx2)+'</td></tr>';
        }
        // Prosjektkostnader (rigg/drift, underentreprenører, leie, m.m.) — vises
        // for 'all' og 'custom', ikke 'simple' (som allerede slår dem sammen over).
        getExtraPosts(p).forEach(function(ep){
          if(isExtraPostChecked(os,ep)){
            priceRows+='<tr><td class="dc"><b>'+esc(ep.name)+'</b></td><td class="ac">'+fmt(ep.amount)+'</td></tr>';
          }
        });
      }
      var totalEx=computeOfferDocumentTotal(p, os);
      var mva=Math.round(totalEx*0.25);
      var totalInc=Math.round(totalEx*1.25);

      var validity=p.offer&&p.offer.validity?p.offer.validity:'14';

      var tokenCtx={
        beskrivelse: os.texts.innledning||p.name||'[prosjekt]',
        betalingsform: os.prisType==='fastpris'?'til avtalt fastpris':os.prisType==='begge'?'etter medgått tid og fastpris':'etter medgått tid og materialer',
        timepris: Math.round(p.work.timeRate||850),
        material_paslag: p.settings.materialMarkup||15,
        oppstart: p.startPref||'Etter avtale',
        gyldighet: validity
      };

      function textToParagraphs(text){
        return String(text||'').split(/\n\s*\n/).filter(function(b){return b.trim();}).map(function(block){
          return '<p>'+nl2br(block)+'</p>';
        }).join('');
      }

      function structuredSectionBody(key){
        if(key==='arbeidsomfang'){
          return '<p>Følgende arbeid er inkludert i prisoverslaget:</p>'
            +os.arbeidsomfangPosts.filter(function(i){return i.checked;}).map(function(i){return '<p style="padding-left:16px">- '+esc(i.name)+'</p>';}).join('')
            +os.arbeidsomfangExtra.filter(function(i){return i.text;}).map(function(i){return '<p style="padding-left:16px">- '+esc(i.text)+'</p>';}).join('');
        }
        if(key==='ikkemedregnet'){
          return '<p>Følgende arbeider er ikke inkludert dersom annet ikke er spesifisert:</p>'
            +IKKE_MEDREGNET_ITEMS.filter(function(item){return os.ikkemedregnet[item.key];})
              .map(function(item){return '<p style="padding-left:16px">- '+esc(item.label)+'</p>';}).join('')
            +os.ikkemedregnet.custom.filter(function(t){return t;}).map(function(t){return '<p style="padding-left:16px">- '+esc(t)+'</p>';}).join('');
        }
        return '';
      }

      // Bygger seksjonene i rekkefølgen fra firmamalen (os.sectionOrder).
      // 'arbeidsomfang'/'ikkemedregnet' har generert innhold og bruker ikke
      // os.texts; 'innledning' kombinerer setningsmalen med prosjektets korte
      // beskrivelse (samme redigerbare felt som før). De øvrige er ren
      // maltekst med {{token}}-erstatning.
      var tplDefaults=defaultOfferTemplate().sections;
      var order=(os.sectionOrder&&os.sectionOrder.length)?os.sectionOrder:OFFER_SECTION_ORDER_DEFAULT;
      var sectionsHtml=order.map(function(key){
        if(!os.sections[key]) return '';
        var title=offerSectionTitle(os,key);
        var body='';
        if(OFFER_STRUCTURED_SECTIONS.indexOf(key)>=0){
          body=structuredSectionBody(key);
        } else if(key==='innledning'){
          var innlTpl=os.innledningTemplate!=null?os.innledningTemplate:((tplDefaults.innledning||{}).text||'');
          body=textToParagraphs(resolveOfferTokens(innlTpl,tokenCtx));
        } else {
          var raw=(os.texts[key]!=null&&os.texts[key]!=='')?os.texts[key]:((tplDefaults[key]||{}).text||'');
          body=textToParagraphs(resolveOfferTokens(raw,tokenCtx));
          if(key==='fremdrift'&&os.estDays) body+='<p>Beregnet tid: <strong>'+esc(os.estDays)+'</strong> arbeidsdager.</p>';
        }
        if(!body) return '';
        return '<div class="sec"><h3>'+esc(title)+'</h3>'+body+'</div>';
      }).join('');

      var css=getOfferCSS(color);

      // Scopet til forhåndsvisningen — ellers overstyrer dokumentets .title,
      // .hdr osv. appens egne klasser (f.eks. prosjekttittelen).
      var html='<style>'+scopeOfferCSS(css+getOfferAppLockCSS(),'#offerPreviewDoc')+'</style>'
        +buildOfferLetterheadHtml(p)
        +'<div class="title">PRISOVERSLAG</div>'
        +'<table class="mt"><thead><tr class="hr"><th class="dc">BESKRIVELSE</th><th class="ac">SUM eks mva</th></tr></thead><tbody>'
        +priceRows
        +'<tr class="mva-row"><td class="dc">MVA 25%</td><td class="ac">'+fmt(mva)+'</td></tr>'
        +'<tr class="sum-row"><td class="dc">Sum eks. mva</td><td class="ac">'+fmt(totalEx)+'</td></tr>'
        +'<tr class="total-row"><td class="dc"><b>ESTIMERT TOTALPRIS INKL. MVA</b></td><td class="ac">'+fmt(totalInc)+'</td></tr>'
        +'</tbody></table>'
        +sectionsHtml
        +os.freeSections.map(function(fs){
          return fs.title||fs.text?'<div class="sec"><h3>'+esc(fs.title||'')+'</h3><p>'+nl2br(fs.text)+'</p></div>':'';
        }).join('');

      var doc=document.getElementById('offerPreviewDoc');
      if(doc) doc.innerHTML=html;
      fitOfferPreview();
    }
