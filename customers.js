    const GREETING_MORNING_END_HOUR=12;
    const GREETING_AFTERNOON_END_HOUR=17;
    const FOLLOW_UP_PREVIEW_COUNT=3;
    const PROJECT_PREVIEW_COUNT=8;
    // Prosjektets gang som prikker på kortet. Tapt vises uten steg.
    const PROJECT_STEPS=['Utkast','Sendt','Vunnet','Pågår','Ferdig'];
    const STATUS_TONES={Utkast:'draft', Sendt:'sent', Vunnet:'won', Pågår:'active', Ferdig:'done', Tapt:'lost'};
    const AVATAR_TONES=['blue','mint','peach','lilac'];
    const WIN_RING_RADIUS=50;
    const PHONE_ICON='<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2"/></svg>';
    const MAIL_ICON='<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>';
    let _showAllProjects=false;
    let _showAllFollowUps=false;

    // Forsiden: hilsen, kontrakter i arbeid, følg opp, vinnerate, prosjekter og kunder.
    function renderDashboard(){
      renderDashboardHeader();
      renderContractsCard();
      renderFollowUps();
      renderWinRateCard();
      renderDashboardLists();
      saveState();
    }

    // Søk og statusfilter tegner bare listene på nytt (og lagrer ikke).
    function renderDashboardLists(){
      renderProjectCards();
      renderCustomerCards();
    }

    function renderDashboardHeader(){
      const now=new Date();
      const hour=now.getHours();
      $('#dashDate').textContent=capitalize(now.toLocaleDateString('nb-NO',{weekday:'long',day:'numeric',month:'long'}));
      $('#dashGreeting').textContent=hour<GREETING_MORNING_END_HOUR?'God morgen':hour<GREETING_AFTERNOON_END_HOUR?'God ettermiddag':'God kveld';
    }

    function renderContractsCard(){
      const marginGoal=Number(state.settings.marginGoal)||DEFAULT_MARGIN_GOAL_PCT;
      const summary=computeDashboardSummary(state.projects, readOfferState, marginGoal);
      const activity=[summary.inProgressCount?summary.inProgressCount+' pågår':'', summary.wonCount?summary.wonCount+' vunnet':''].filter(Boolean).join(' · ')||'Ingen i arbeid';
      const hasMargin=summary.marginPct!==null;
      const isGoalMet=hasMargin&&summary.marginPct>=marginGoal;
      $('#dashContracts').innerHTML=`
        <div class="dash-card-head">
          <div>
            <h2 class="dash-card-label" id="dashContractsTitle">Kontrakter i arbeid · eks. mva</h2>
            <div class="dash-big">${formatNumber(summary.contractsEx)} <span>kr</span></div>
          </div>
          <span class="dash-pill">${activity}</span>
        </div>
        ${summary.hoursProgress.map(renderHoursProgress).join('')}
        <div class="dash-tiles">
          <div class="dash-tile"><div class="dash-tile-label">Prisoverslag ute</div><div class="dash-tile-value">${formatNumber(summary.sentEx)}</div><div class="dash-tile-note">${summary.sentCount} venter på svar</div></div>
          <div class="dash-tile"><div class="dash-tile-label">Snitt margin</div><div class="dash-tile-value">${hasMargin?Math.round(summary.marginPct)+'&nbsp;%':'–'}</div><div class="dash-tile-note${hasMargin?(isGoalMet?' is-good':' is-warn'):''}">mål ${marginGoal}&nbsp;%${hasMargin?(isGoalMet?' · nådd':' · ikke nådd'):''}</div></div>
          <div class="dash-tile"><div class="dash-tile-label">Opsjoner</div><div class="dash-tile-value">${formatNumber(summary.optionsEx)}</div><div class="dash-tile-note">ikke besluttet</div></div>
        </div>`;
    }

    function renderHoursProgress(item){
      const isOver=item.actualHours>item.estimatedHours;
      const share=Math.min(item.actualHours/item.estimatedHours,1);
      return `<div class="dash-progress${isOver?' is-over':''}">
          <div class="dash-progress-head"><span>Timer brukt · ${escapeHtml(item.name)}</span><span>${formatHours(item.actualHours)} av ${formatHours(item.estimatedHours)}&nbsp;t${isOver?' · over estimatet':''}</span></div>
          <div class="dash-progress-bar" aria-hidden="true"><span style="width:${(share*100).toFixed(1)}%"></span></div>
        </div>`;
    }

    function renderFollowUps(){
      const followUps=getOfferFollowUps(state.projects, Date.now());
      const shown=_showAllFollowUps?followUps:followUps.slice(0,FOLLOW_UP_PREVIEW_COUNT);
      $('#followUpPanel').innerHTML=`
        <div class="dash-card-head">
          <h2 class="dash-card-title" id="followUpTitle">Følg opp</h2>
          <span class="dash-card-count">${followUps.length}</span>
        </div>
        ${followUps.length
          ? `<ul class="dash-followups">${shown.map(renderFollowUpItem).join('')}</ul>`
          : '<p class="dash-card-note">Ingen prisoverslag venter på svar.</p>'}
        ${followUps.length>FOLLOW_UP_PREVIEW_COUNT?`<button class="dash-link" onclick="toggleAllFollowUps()">${_showAllFollowUps?'Vis færre':'Vis alle ('+followUps.length+')'}</button>`:''}`;
    }

    // Raden åpner alle handlingene; knappen til høyre ringer eller sender e-post direkte.
    function renderFollowUpItem(f){
      const p=f.project, cust=getCustomer(p.customerId), id=escapeAttr(p.id);
      const customerName=escapeAttr(cust&&cust.name||'kunden');
      const quickAction=cust&&cust.phone
        ? `<a class="dash-icon-btn" href="tel:${escapeAttr(cust.phone.replace(/\s/g,''))}" aria-label="Ring ${customerName}">${PHONE_ICON}</a>`
        : cust&&cust.email
          ? `<a class="dash-icon-btn" href="${getFollowUpMailHref(f,cust)}" aria-label="Send e-post til ${customerName}">${MAIL_ICON}</a>`
          : '';
      return `<li class="dash-followup">
          <button class="dash-followup-main" onclick="openFollowUpActions('${id}')" aria-haspopup="dialog">
            <span class="dash-followup-name">${escapeHtml(p.name||'Uten navn')}</span>
            <span class="dash-followup-age">${f.daysSinceSent} dager uten svar</span>
          </button>
          ${quickAction}
        </li>`;
    }

    function getFollowUpMailHref(f,cust){
      const p=f.project;
      const sentDate=new Date(f.sentAt).toLocaleDateString('nb-NO');
      const body=`Hei${cust.name?' '+cust.name:''},\n\nJeg følger opp prisoverslaget på ${p.name||'prosjektet'}${f.isSentAtKnown?' som ble sendt '+sentDate:''}. Har du fått sett på det, eller er det noe du lurer på?\n`;
      return `mailto:${escapeAttr(cust.email)}?subject=${encodeURIComponent('Oppfølging av prisoverslag – '+(p.name||''))}&body=${encodeURIComponent(body)}`;
    }

    window.openFollowUpActions=function(projectId){
      const f=getOfferFollowUps(state.projects, Date.now()).find(item=>item.project.id===projectId); if(!f) return;
      const p=f.project, cust=getCustomer(p.customerId), id=escapeAttr(p.id);
      const sentDate=new Date(f.sentAt).toLocaleDateString('nb-NO');
      const age=f.isSentAtKnown
        ? `Sendt ${sentDate} · ${f.daysSinceSent} dager uten svar`
        : `Sendt-dato mangler · sist endret for ${f.daysSinceSent} dager siden`;
      showModal(`
        <div class="section-head">
          <div class="section-title">${escapeHtml(p.name||'Uten navn')}</div>
          <button class="btn small secondary" onclick="closeModal()">Lukk</button>
        </div>
        <p class="followup-sheet-meta">${escapeHtml(cust&&cust.name||'Ingen kunde')} · ${currency(computeOfferDocumentTotal(p, readOfferState(p)))} eks. mva<br>${age}</p>
        <div class="followup-sheet-actions">
          ${cust&&cust.phone?`<a class="btn secondary" href="tel:${escapeAttr(cust.phone.replace(/\s/g,''))}">Ring ${escapeHtml(cust.phone)}</a>`:''}
          ${cust&&cust.email?`<a class="btn secondary" href="${getFollowUpMailHref(f,cust)}">Send e-post</a>`:''}
          <button class="btn secondary" onclick="closeModal();snoozeFollowUp('${id}')">Påminn meg om ${FOLLOW_UP_AFTER_DAYS} dager</button>
          <button class="btn secondary" onclick="closeModal();quickChangeStatus('${id}','Vunnet')">Marker som vunnet</button>
          <button class="btn secondary" onclick="closeModal();quickChangeStatus('${id}','Tapt')">Marker som tapt</button>
          <button class="btn primary" onclick="closeModal();openProject('${id}')">Åpne prosjektet</button>
        </div>`);
    };

    window.toggleAllFollowUps=function(){ _showAllFollowUps=!_showAllFollowUps; renderFollowUps(); };

    function renderWinRateCard(){
      const {won, decided}=countDecidedOffers(state.projects);
      const pct=computeWinRate(state.projects);
      const circumference=2*Math.PI*WIN_RING_RADIUS;
      $('#dashWinRate').innerHTML=`
        <div class="dash-ring">
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <circle class="dash-ring-track" cx="60" cy="60" r="${WIN_RING_RADIUS}"/>
            ${pct?`<circle class="dash-ring-fill" cx="60" cy="60" r="${WIN_RING_RADIUS}" stroke-dasharray="${(pct/100*circumference).toFixed(1)} ${circumference.toFixed(1)}" transform="rotate(-90 60 60)"/>`:''}
          </svg>
          <span class="dash-ring-value">${pct}%</span>
        </div>
        <h2 class="dash-card-title" id="dashWinTitle">Vinnerate</h2>
        <p class="dash-card-note">${decided?`${won} av ${decided} avgjorte prisoverslag`:'Ingen avgjorte prisoverslag ennå'}</p>`;
    }

    function getDashboardQuery(){
      return ($('#dashSearch').value||'').trim().toLowerCase();
    }

    function renderProjectCards(){
      const query=getDashboardQuery();
      const statusFilter=$('#projectStatusFilter').value;
      const projects=state.projects.filter(p=>{
        if(statusFilter&&p.status!==statusFilter) return false;
        const cust=getCustomer(p.customerId);
        return [p.name,p.type,p.status,p.address,cust?.name||''].join(' ').toLowerCase().includes(query);
      }).sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0));
      const isFiltered=!!(query||statusFilter);
      const shown=isFiltered||_showAllProjects?projects:projects.slice(0,PROJECT_PREVIEW_COUNT);
      $('#projectCountLabel').textContent=isFiltered?projects.length+' av '+state.projects.length:state.projects.length;
      $('#projectList').innerHTML=projects.length
        ? shown.map(renderProjectCard).join('')
        : `<div class="dash-empty">${isFiltered?'Ingen prosjekter passer søket.':'Ingen prosjekter ennå. Trykk «+ Nytt prosjekt» for å starte.'}</div>`;
      const showAll=$('#dashShowAll');
      showAll.hidden=isFiltered||projects.length<=PROJECT_PREVIEW_COUNT;
      showAll.textContent=_showAllProjects?'Vis færre':'Se alle ('+projects.length+')';
    }

    // Vunne prosjekter viser kontraktssummen (med godkjente tillegg), resten prisoverslaget.
    function renderProjectCard(p){
      const cust=getCustomer(p.customerId), id=escapeAttr(p.id);
      const os=readOfferState(p);
      const amount=WON_STATUSES.includes(p.status)?computeContractSum(p,os):computeOfferDocumentTotal(p,os);
      const tone=STATUS_TONES[p.status]||STATUS_TONES.Utkast;
      return `<button class="dash-project" onclick="openProject('${id}')">
          <span class="dash-project-top">
            <span class="dash-avatar dash-avatar--${getAvatarTone(p.id)}" aria-hidden="true">${escapeHtml(getInitials(p.name))}</span>
            <span class="dash-status dash-status--${tone}">${escapeHtml(p.status||'Utkast')}</span>
          </span>
          <span class="dash-project-text">
            <span class="dash-project-name">${escapeHtml(p.name||'Uten navn')}</span>
            <span class="dash-project-customer">${escapeHtml(cust?.name||'Ingen kunde valgt')}</span>
          </span>
          <span class="dash-project-bottom">
            <span class="dash-project-amount">${formatNumber(amount)}&nbsp;kr</span>
            ${renderProjectSteps(p.status, tone)}
          </span>
        </button>`;
    }

    function renderProjectSteps(status, tone){
      const current=PROJECT_STEPS.indexOf(status);
      if(current<0) return '';
      return `<span class="dash-steps dash-steps--${tone}" role="img" aria-label="Steg ${current+1} av ${PROJECT_STEPS.length}">${PROJECT_STEPS.map((step,i)=>`<span class="${i<current?'is-done':i===current?'is-current':''}"></span>`).join('')}</span>`;
    }

    function getInitials(name){
      const words=String(name||'').trim().split(/\s+/).filter(Boolean);
      return (words.slice(0,2).map(word=>word.charAt(0)).join('')||'?').toUpperCase();
    }

    // Fast farge per prosjekt, så kortet er lett å kjenne igjen.
    function getAvatarTone(id){
      const hash=String(id).split('').reduce((sum,ch)=>sum+ch.charCodeAt(0),0);
      return AVATAR_TONES[hash%AVATAR_TONES.length];
    }

    window.toggleAllProjects=function(){ _showAllProjects=!_showAllProjects; renderProjectCards(); };

    function renderCustomerCards(){
      const query=getDashboardQuery();
      const customers=state.customers.filter(c=>[c.name,c.phone,c.email].join(' ').toLowerCase().includes(query));
      $('#customerCountLabel').textContent=query?customers.length+' av '+state.customers.length:state.customers.length;
      $('#customerList').innerHTML=customers.length
        ? customers.map(c=>{
            const id=escapeAttr(c.id);
            const contact=[c.phone,c.email].filter(Boolean).map(escapeHtml).join(' · ');
            return `<div class="dash-customer">
                <div class="dash-customer-text">
                  <div class="dash-customer-name">${escapeHtml(c.name||'Uten navn')}</div>
                  <div class="dash-customer-contact">${contact||'Ingen kontaktinfo'}</div>
                </div>
                <div class="dash-customer-actions">
                  <button class="btn small soft" onclick="editCustomer('${id}')">Rediger</button>
                  <button class="btn small danger" onclick="deleteCustomer('${id}')">Slett</button>
                </div>
              </div>`;
          }).join('')
        : `<div class="dash-empty">${query?'Ingen kunder passer søket.':'Ingen kunder ennå.'}</div>`;
    }

    const FOLLOW_UP_REMINDER_HOUR=8;
    const FOLLOW_UP_EVENT_MINUTES=15;

    window.snoozeFollowUp=function(projectId){
      const p=getProject(projectId); if(!p) return;
      p.followUpSnoozedUntil=Date.now()+FOLLOW_UP_AFTER_DAYS*DAY_MS;
      saveState(); renderDashboard();
      offerCalendarReminder(p);
    };

    // Nettsider får ikke skrive til Påminnelser/Kalender direkte. En .ics-fil
    // med varsel kan derimot legges i Kalender, og synkes til telefonen via iCloud.
    function offerCalendarReminder(p){
      const start=new Date(p.followUpSnoozedUntil);
      start.setHours(FOLLOW_UP_REMINDER_HOUR,0,0,0);
      const url=URL.createObjectURL(new Blob([buildFollowUpIcs(p,start)],{type:'text/calendar;charset=utf-8'}));
      const dateLabel=start.toLocaleDateString('nb-NO',{weekday:'long',day:'numeric',month:'long'});
      // iOS åpner kalenderfilen i en visning med «Legg til»; andre steder lastes den ned.
      const linkAttrs=isAppleTouchDevice()?'target="_blank" rel="noopener"':`download="Følg opp ${escapeAttr(p.name||'prisoverslag')}.ics"`;
      showModal(`
        <div class="section-head"><div class="section-title">Utsatt til ${escapeHtml(dateLabel)}</div></div>
        <p style="margin:0 0 14px;color:var(--muted)">Vil du også få varsel i kalenderen (og på telefonen via iCloud) kl. ${String(FOLLOW_UP_REMINDER_HOUR).padStart(2,'0')}:00 den dagen?</p>
        <div class="toolbar">
          <a class="btn primary" href="${url}" ${linkAttrs} onclick="setTimeout(closeModal,300)" style="text-decoration:none">📅 Legg i kalender</a>
          <button class="btn secondary" onclick="closeModal()">Nei takk</button>
        </div>`);
    }

    function buildFollowUpIcs(p,start){
      const cust=getCustomer(p.customerId);
      const end=new Date(start.getTime()+FOLLOW_UP_EVENT_MINUTES*60*1000);
      const details=[
        'Prisoverslaget står fortsatt som sendt uten svar.',
        cust&&cust.name?'Kunde: '+cust.name:'',
        cust&&cust.phone?'Telefon: '+cust.phone:'',
        cust&&cust.email?'E-post: '+cust.email:'',
        p.address?'Adresse: '+p.address:''
      ].filter(Boolean).join('\n');
      const summary='Følg opp prisoverslag: '+(p.name||'prosjekt');
      return [
        'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Byggeplassen//Tilbudsoppfolging//NO','CALSCALE:GREGORIAN','METHOD:PUBLISH',
        'BEGIN:VEVENT',
        'UID:'+p.id+'-'+start.getTime()+'@byggeplassen',
        'DTSTAMP:'+toIcsUtc(new Date()),
        'DTSTART:'+toIcsUtc(start),
        'DTEND:'+toIcsUtc(end),
        'SUMMARY:'+escapeIcsText(summary),
        'DESCRIPTION:'+escapeIcsText(details),
        'BEGIN:VALARM','ACTION:DISPLAY','TRIGGER:PT0M','DESCRIPTION:'+escapeIcsText(summary),'END:VALARM',
        'END:VEVENT','END:VCALENDAR'
      ].map(foldIcsLine).join('\r\n');
    }

    function toIcsUtc(date){
      return date.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
    }

    // RFC 5545: \, ; , og linjeskift må escapes i tekstfelt.
    function escapeIcsText(text){
      return String(text).replace(/\\/g,'\\\\').replace(/;/g,'\\;').replace(/,/g,'\\,').replace(/\n/g,'\\n');
    }

    // RFC 5545: linjer over 75 bytes brytes med linjeskift + mellomrom. 60 tegn
    // gir margin for æøå, som tar 2 bytes hver.
    function foldIcsLine(line){
      const parts=[];
      for(let i=0;i<line.length;i+=60) parts.push((i?' ':'')+line.slice(i,i+60));
      return parts.join('\r\n');
    }

    // iPadOS rapporterer seg som Mac, men har berøringsskjerm.
    function isAppleTouchDevice(){
      return /iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
    }

    function openCustomerModal(existing){
      const c=existing||{id:uid(),name:'',phone:'',email:'',address:''};
      showModal(`
        <div class="section-head"><div class="section-title">${existing?'Rediger kunde':'Ny kunde'}</div><button class="btn small secondary" onclick="closeModal()">Lukk</button></div>
        <label>Navn</label><input id="mCN" value="${escapeAttr(c.name)}" />
        <label>Telefon</label><input id="mCP" value="${escapeAttr(c.phone)}" />
        <label>E-post</label><input id="mCE" value="${escapeAttr(c.email)}" />
        <label>Adresse</label><input id="mCA" value="${escapeAttr(c.address)}" />
        <div class="toolbar" style="margin-top:14px"><button class="btn primary" id="saveCustBtn">Lagre kunde</button></div>
      `);
      $('#saveCustBtn').onclick=()=>{
        c.name=$('#mCN').value.trim(); c.phone=$('#mCP').value.trim(); c.email=$('#mCE').value.trim(); c.address=$('#mCA').value.trim();
        if(!c.name){alert('Skriv inn kundenavn.');return;}
        const idx=state.customers.findIndex(x=>x.id===c.id);
        if(idx>-1) state.customers[idx]=c; else state.customers.unshift(c);
        saveState(); closeModal(); renderDashboard();
      };
    }

    function editCustomer(id){ const c=getCustomer(id); if(c) openCustomerModal({...c}); }
    function deleteCustomer(id){
      if(!confirm('Slette denne kunden?')) return;
      state.customers=state.customers.filter(c=>c.id!==id);
      state.projects=state.projects.map(p=>p.customerId===id?{...p,customerId:''}:p);
      saveState(); renderDashboard();
    }
