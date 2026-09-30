    function renderDashboard(){
      $('#metricCustomers').textContent=state.customers.length;
      $('#metricProjects').textContent=state.projects.length;
      $('#metricSent').textContent=state.projects.filter(p=>p.status==='Sendt').length;
      const winPct=computeWinRate(state.projects);
      $('#metricWinRate').textContent=winPct+'%';
      renderFollowUps();

      /* Update win-rate ring — circumference = 2*pi*34 = ~213.6 */
      const ring=$('#winRateRing');
      if(ring){
        const circumference=213.6;
        const filled=(winPct/100)*circumference;
        ring.setAttribute('stroke-dasharray',filled+' '+circumference);
      }

      const pLabel=$('#projectCountLabel'); if(pLabel) pLabel.textContent=state.projects.length+' prosjekter';
      const cLabel=$('#customerCountLabel'); if(cLabel) cLabel.textContent=state.customers.length+' kunder';

      /* Time-based greeting */
      const greetEl=$('#dashGreeting');
      if(greetEl){
        const h=new Date().getHours();
        const greeting=h<12?'God morgen':h<17?'God ettermiddag':'God kveld';
        greetEl.textContent=greeting+' — du har '+state.projects.length+' prosjekter og '+state.customers.length+' kunder';
      }

      const cQ=$('#customerSearch').value.trim().toLowerCase();
      const pQ=$('#projectSearch').value.trim().toLowerCase();
      const cList=$('#customerList'); cList.innerHTML='';
      const customers=state.customers.filter(c=>[c.name,c.phone,c.email].join(' ').toLowerCase().includes(cQ));
      if(!customers.length) cList.innerHTML='<div class="empty">Ingen kunder enda.</div>';
      customers.forEach(c=>{
        const div=document.createElement('div'); div.className='item';
        div.innerHTML=`<div><h4>${safe(c.name)}</h4><p>${safe(c.phone)}${c.phone&&c.email?' • ':''}${safe(c.email)}</p></div>
          <div class="inline-actions">
            <button class="ov-btn ov-btn--ghost" onclick="editCustomer('${c.id}')">Rediger</button>
            <button class="ov-btn ov-btn--danger" onclick="deleteCustomer('${c.id}')">Slett</button>
          </div>`;
        cList.appendChild(div);
      });
      const pList=$('#projectList'); pList.innerHTML='';
      const statusFilter=$('#projectStatusFilter')?$('#projectStatusFilter').value:'';
      const projects=state.projects.filter(p=>{
        if(statusFilter&&p.status!==statusFilter) return false;
        const cu=getCustomer(p.customerId);return[p.name,p.type,p.status,cu?.name||''].join(' ').toLowerCase().includes(pQ);
      }).sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0));
      if(!projects.length) pList.innerHTML='<div class="empty">Ingen prosjekter enda.</div>';
      projects.forEach(p=>{
        const calc=compute(p), cust=getCustomer(p.customerId);
        const div=document.createElement('div'); div.className='item';
        const statuses=['Utkast','Sendt','Vunnet','Tapt','Pågår','Ferdig'];
        const statusOpts=statuses.map(s=>'<option value="'+s+'" '+(p.status===s?'selected':'')+'>'+s+'</option>').join('');
        div.innerHTML='<div style="flex:1"><h4>'+safe(p.name)+'</h4><p>'+safe(cust?.name||'Ingen kunde valgt')+' • '+safe(p.type)+'</p>'
          +'<div class="ov-item-meta">'
          +'<select class="ov-status-select status-'+p.status+'"'
          +' onchange="quickChangeStatus('+"'"+p.id+"'"+',this.value)">'
          +statusOpts
          +'</select>'
          +'<span class="ov-price-tag">'+currency(calc.totalSaleEx||calc.saleEx)+'</span>'
          +'</div></div>'
          +'<div class="inline-actions"><button class="ov-btn ov-btn--open" onclick="openProject('+"'"+ p.id +"'"+')">Åpne<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button><button class="ov-btn ov-btn--danger" onclick="deleteProjectFromDashboard('+"'"+p.id+"'"+')">Slett</button></div>';
        pList.appendChild(div);
      });
      saveState();
    }

    function renderFollowUps(){
      const panel=$('#followUpPanel'); if(!panel) return;
      const followUps=getOfferFollowUps(state.projects, Date.now());
      panel.hidden=!followUps.length;
      if(!followUps.length) return;
      $('#followUpCount').textContent=followUps.length+' venter på svar';
      $('#followUpList').innerHTML=followUps.map(renderFollowUpItem).join('');
    }

    function renderFollowUpItem(f){
      const p=f.project, cust=getCustomer(p.customerId);
      const id=escapeAttr(p.id);
      const sentDate=new Date(f.sentAt).toLocaleDateString('nb-NO');
      const age=f.isSentAtKnown
        ? `Sendt ${sentDate} · ${f.daysSinceSent} dager uten svar`
        : `Sendt-dato mangler · sist endret for ${f.daysSinceSent} dager siden`;
      const mailBody=`Hei${cust&&cust.name?' '+cust.name:''},\n\nJeg følger opp tilbudet på ${p.name||'prosjektet'}${f.isSentAtKnown?' som ble sendt '+sentDate:''}. Har du fått sett på det, eller er det noe du lurer på?\n`;
      const contact=[
        cust&&cust.phone?`<a class="ov-btn ov-btn--ghost" href="tel:${escapeAttr(cust.phone.replace(/\s/g,''))}">Ring</a>`:'',
        cust&&cust.email?`<a class="ov-btn ov-btn--ghost" href="mailto:${escapeAttr(cust.email)}?subject=${encodeURIComponent('Oppfølging av tilbud – '+(p.name||''))}&body=${encodeURIComponent(mailBody)}">E-post</a>`:''
      ].join('');
      const statusOpts=['Sendt','Vunnet','Tapt'].map(s=>`<option value="${s}" ${p.status===s?'selected':''}>${s}</option>`).join('');
      return `<div class="item ov-followup-item">
          <div class="ov-followup-info">
            <h4><button class="ov-followup-name" onclick="openProject('${id}')">${escapeHtml(p.name||'Uten navn')}</button></h4>
            <p>${escapeHtml(cust?.name||'Ingen kunde')} · ${currency(compute(p).totalSaleEx||compute(p).saleEx)}</p>
            <p class="ov-followup-age">${age}</p>
          </div>
          <div class="inline-actions">
            ${contact}
            <button class="ov-btn ov-btn--ghost" title="Påminn om ${FOLLOW_UP_AFTER_DAYS} dager" aria-label="Påminn om ${FOLLOW_UP_AFTER_DAYS} dager" onclick="snoozeFollowUp('${id}')">Påminn senere</button>
            <select class="ov-status-select status-Sendt" aria-label="Endre status for ${escapeAttr(p.name||'')}" onchange="quickChangeStatus('${id}',this.value)">${statusOpts}</select>
          </div>
        </div>`;
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
      const linkAttrs=isAppleTouchDevice()?'target="_blank" rel="noopener"':`download="Følg opp ${escapeAttr(p.name||'tilbud')}.ics"`;
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
        'Tilbudet står fortsatt som sendt uten svar.',
        cust&&cust.name?'Kunde: '+cust.name:'',
        cust&&cust.phone?'Telefon: '+cust.phone:'',
        cust&&cust.email?'E-post: '+cust.email:'',
        p.address?'Adresse: '+p.address:''
      ].filter(Boolean).join('\n');
      const summary='Følg opp tilbud: '+(p.name||'prosjekt');
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
