// ============================================================
// befaring.js — Mobil befaringsapp
// ============================================================
// Avhenger av utils.js (uid, escapeHtml, $) og auth.js (_sb).
// Egen steg-flyt, localStorage-utkast, Supabase-sync.
// ============================================================

var BEF_STORAGE_KEY = 'byggeplassen_befaringer';
var BEF_DRAFT_KEY = 'byggeplassen_befaring_draft';

var befState = {
  list: [],         // saved befaringer (synced from Supabase)
  draft: null,      // current in-progress befaring
  step: 0,          // current step index
  view: 'list',     // 'list' | 'flow' | 'detail'
  detailId: null,
  customers: [],    // shared customer list
};

var STEPS = ['kunde', 'oppdrag', 'maal', 'materialer', 'bilder', 'oppsummering'];
var STEP_LABELS = ['Kunde', 'Oppdrag', 'Mål & forhold', 'Materialer', 'Bilder & notater', 'Oppsummering'];
var TOTAL_STEPS = STEPS.length;

// ── INIT ────────────────────────────────────────────────────

window.addEventListener('DOMContentLoaded', function() {
  initBefaring();
});

async function initBefaring() {
  var session = await _sb.auth.getSession();
  if (session.data.session) {
    _sbUser = session.data.session.user;
    await loadBefData();
    showBefApp();
  } else {
    document.getElementById('loginView').style.display = 'flex';
  }

  _sb.auth.onAuthStateChange(async function(event, session) {
    if (event === 'SIGNED_IN' && session) {
      _sbUser = session.user;
      await loadBefData();
      showBefApp();
    } else if (event === 'SIGNED_OUT') {
      _sbUser = null;
      document.getElementById('befApp').style.display = 'none';
      document.getElementById('loginView').style.display = 'flex';
    }
  });
}

function showBefApp() {
  document.getElementById('loginView').style.display = 'none';
  document.getElementById('befApp').style.display = 'block';
  loadDraftFromStorage();
  renderCurrentView();
}

window.doLogin = async function() {
  var email = document.getElementById('loginEmail').value.trim();
  var pw = document.getElementById('loginPassword').value;
  var errEl = document.getElementById('loginError');
  errEl.style.display = 'none';
  var btn = document.getElementById('loginBtn');
  btn.textContent = 'Logger inn...';
  btn.disabled = true;
  var result = await _sb.auth.signInWithPassword({ email: email, password: pw });
  btn.textContent = 'Logg inn';
  btn.disabled = false;
  if (result.error) {
    errEl.textContent = result.error.message === 'Invalid login credentials'
      ? 'Feil e-post eller passord' : result.error.message;
    errEl.style.display = 'block';
  }
};

window.doLogout = async function() {
  await _sb.auth.signOut();
};


// ── DATA LOADING ────────────────────────────────────────────

async function loadBefData() {
  await loadCustomers();
  await loadBefaringer();
}

async function loadCustomers() {
  try {
    var result = await _sb.from('user_data').select('data').eq('user_id', _sbUser.id).single();
    if (result.data && result.data.data) {
      befState.customers = result.data.data.customers || [];
    }
  } catch (e) {
    // Fallback: try localStorage
    try {
      var raw = localStorage.getItem('kalkyleapp_round6');
      if (raw) {
        var parsed = JSON.parse(raw);
        befState.customers = parsed.customers || [];
      }
    } catch (e2) { /* ignore */ }
  }
}

async function loadBefaringer() {
  try {
    var result = await _sb.from('befaringer')
      .select('*')
      .eq('user_id', _sbUser.id)
      .order('created_at', { ascending: false });
    if (result.data) {
      befState.list = result.data;
    }
  } catch (e) {
    // Load from localStorage fallback
    loadListFromStorage();
  }
}

function loadListFromStorage() {
  try {
    var raw = localStorage.getItem(BEF_STORAGE_KEY);
    if (raw) befState.list = JSON.parse(raw);
  } catch (e) { /* ignore */ }
}

function saveListToStorage() {
  localStorage.setItem(BEF_STORAGE_KEY, JSON.stringify(befState.list));
}


// ── DRAFT MANAGEMENT ────────────────────────────────────────

function blankBefaring() {
  return {
    id: uid(),
    user_id: _sbUser ? _sbUser.id : null,
    status: 'utkast',
    created_at: new Date().toISOString(),
    customer: { id: '', name: '', address: '', phone: '', isNew: false },
    oppdragstype: '',
    maal: {
      mode: 'rask',
      sizeRange: '',
      lengde: '',
      bredde: '',
      hoyde: '',
    },
    underlag: '',
    tilkomst: '',
    material: '',
    tilvalg: {
      rekkverk: false,
      trapp: false,
      riving: false,
      innkassing: false,
      skjort: false,
      levegg: false,
    },
    bilder: [],    // [{ id, dataUrl, comment }]
    notater: '',
  };
}

function saveDraftToStorage() {
  if (!befState.draft) return;
  localStorage.setItem(BEF_DRAFT_KEY, JSON.stringify({
    draft: befState.draft,
    step: befState.step,
  }));
}

function loadDraftFromStorage() {
  try {
    var raw = localStorage.getItem(BEF_DRAFT_KEY);
    if (raw) {
      var parsed = JSON.parse(raw);
      befState.draft = parsed.draft;
      befState.step = parsed.step || 0;
    }
  } catch (e) { /* ignore */ }
}

function clearDraft() {
  befState.draft = null;
  befState.step = 0;
  localStorage.removeItem(BEF_DRAFT_KEY);
}


// ── NAVIGATION ──────────────────────────────────────────────

function renderCurrentView() {
  if (befState.view === 'list') renderListView();
  else if (befState.view === 'flow') renderFlowView();
  else if (befState.view === 'detail') renderDetailView();
}

window.goBack = function() {
  if (befState.view === 'flow') {
    if (befState.step > 0) {
      prevStep();
    } else {
      if (confirm('Vil du avbryte befaringen? Utkastet lagres.')) {
        saveDraftToStorage();
        befState.view = 'list';
        renderCurrentView();
      }
    }
  } else if (befState.view === 'detail') {
    befState.view = 'list';
    befState.detailId = null;
    renderCurrentView();
  }
};

window.nextStep = function() {
  collectStepData();
  saveDraftToStorage();

  if (befState.step < TOTAL_STEPS - 1) {
    befState.step++;
    renderFlowView();
  }
};

window.prevStep = function() {
  collectStepData();
  saveDraftToStorage();

  if (befState.step > 0) {
    befState.step--;
    renderFlowView();
  }
};


// ── LIST VIEW ───────────────────────────────────────────────

function renderListView() {
  var topTitle = document.getElementById('topbarTitle');
  var topBack = document.getElementById('topbarBack');
  var topLogout = document.getElementById('topbarLogout');
  topTitle.textContent = 'Befaringer';
  topBack.style.display = 'none';
  topLogout.style.display = '';
  document.getElementById('befProgress').style.display = 'none';
  document.getElementById('befBottomNav').style.display = 'none';

  var main = document.getElementById('befMain');
  var items = befState.list;

  // Check if there's a draft to resume
  var draftHtml = '';
  if (befState.draft) {
    draftHtml = '<div class="bef-list-item" onclick="resumeDraft()" style="border:2px solid var(--accent)">'
      + '<div class="bef-list-icon bef-list-icon--draft">&#9998;</div>'
      + '<div class="bef-list-info">'
      + '<div class="bef-list-name">Fortsett utkast</div>'
      + '<div class="bef-list-meta">' + escapeHtml(befState.draft.customer.name || 'Ingen kunde ennå')
      + ' &middot; Steg ' + (befState.step + 1) + ' av ' + TOTAL_STEPS + '</div>'
      + '</div>'
      + '<span class="bef-list-badge bef-list-badge--draft">Utkast</span>'
      + '</div>';
  }

  if (!items.length && !befState.draft) {
    main.innerHTML = '<div class="bef-list-empty">'
      + '<div class="bef-list-empty-icon">&#128203;</div>'
      + '<p>Ingen befaringer ennå</p>'
      + '</div>'
      + '<button class="bef-fab" onclick="startNew()">+</button>';
    return;
  }

  var listHtml = draftHtml;
  for (var i = 0; i < items.length; i++) {
    var b = items[i];
    var data = b.data || b;
    var name = (data.customer && data.customer.name) || 'Ukjent kunde';
    var type = data.oppdragstype || 'Terrasse';
    var date = formatDate(b.created_at || data.created_at);
    var isDraft = (b.status || data.status) === 'utkast';
    var iconClass = isDraft ? 'bef-list-icon--draft' : 'bef-list-icon--done';
    var icon = isDraft ? '&#9998;' : '&#10003;';
    var badgeClass = isDraft ? 'bef-list-badge--draft' : 'bef-list-badge--done';
    var badgeText = isDraft ? 'Utkast' : 'Fullfort';

    listHtml += '<div class="bef-list-item" onclick="openDetail(\'' + (b.id || data.id) + '\')">'
      + '<div class="bef-list-icon ' + iconClass + '">' + icon + '</div>'
      + '<div class="bef-list-info">'
      + '<div class="bef-list-name">' + escapeHtml(name) + '</div>'
      + '<div class="bef-list-meta">' + escapeHtml(type) + ' &middot; ' + escapeHtml(date) + '</div>'
      + '</div>'
      + '<span class="bef-list-badge ' + badgeClass + '">' + badgeText + '</span>'
      + '</div>';
  }

  main.innerHTML = listHtml + '<button class="bef-fab" onclick="startNew()">+</button>';
}

window.startNew = function() {
  befState.draft = blankBefaring();
  befState.step = 0;
  befState.view = 'flow';
  saveDraftToStorage();
  renderCurrentView();
};

window.resumeDraft = function() {
  befState.view = 'flow';
  renderCurrentView();
};

window.openDetail = function(id) {
  befState.detailId = id;
  befState.view = 'detail';
  renderCurrentView();
};


// ── FLOW VIEW ───────────────────────────────────────────────

function renderFlowView() {
  var topTitle = document.getElementById('topbarTitle');
  var topBack = document.getElementById('topbarBack');
  var topLogout = document.getElementById('topbarLogout');
  topTitle.textContent = STEP_LABELS[befState.step];
  topBack.style.display = '';
  topLogout.style.display = 'none';

  // Progress
  var progress = document.getElementById('befProgress');
  progress.style.display = '';
  var pct = Math.round(((befState.step + 1) / TOTAL_STEPS) * 100);
  document.getElementById('progressFill').style.width = pct + '%';
  document.getElementById('progressLabel').textContent = 'Steg ' + (befState.step + 1) + ' av ' + TOTAL_STEPS;

  // Bottom nav
  var bottomNav = document.getElementById('befBottomNav');
  var navPrev = document.getElementById('navPrev');
  var navNext = document.getElementById('navNext');
  var isLast = befState.step === TOTAL_STEPS - 1;

  if (isLast) {
    bottomNav.style.display = 'none';
  } else {
    bottomNav.style.display = '';
    navPrev.style.display = befState.step === 0 ? 'none' : '';
    navNext.textContent = 'Neste';
    navNext.className = 'bef-nav-btn bef-nav-btn--primary';
  }

  // Render step
  var main = document.getElementById('befMain');
  var d = befState.draft;

  switch (STEPS[befState.step]) {
    case 'kunde':      main.innerHTML = renderStepKunde(d); break;
    case 'oppdrag':    main.innerHTML = renderStepOppdrag(d); break;
    case 'maal':       main.innerHTML = renderStepMaal(d); break;
    case 'materialer': main.innerHTML = renderStepMaterialer(d); break;
    case 'bilder':     main.innerHTML = renderStepBilder(d); break;
    case 'oppsummering': main.innerHTML = renderStepOppsummering(d); break;
  }

  // Scroll to top
  window.scrollTo(0, 0);
}


// ── STEP 1: KUNDE ───────────────────────────────────────────

function renderStepKunde(d) {
  var searchHtml = '<div class="bef-field">'
    + '<label class="bef-label">Sok etter eksisterende kunde</label>'
    + '<input class="bef-input" type="search" id="befCustSearch" placeholder="Navn, telefon eller adresse..." oninput="searchCustomers(this.value)" />'
    + '</div>'
    + '<div id="befCustResults" class="bef-search-results"></div>';

  var selected = '';
  if (d.customer.id && !d.customer.isNew) {
    selected = '<div class="bef-search-item selected">'
      + '<div><div class="bef-search-name">' + escapeHtml(d.customer.name) + '</div>'
      + '<div class="bef-search-detail">' + escapeHtml(d.customer.phone) + ' &middot; ' + escapeHtml(d.customer.address) + '</div></div>'
      + '</div>';
    searchHtml += selected;
  }

  var newHtml = '<div class="bef-or-divider">eller opprett ny</div>'
    + '<div class="bef-field">'
    + '<label class="bef-label">Navn <span class="bef-required">*</span></label>'
    + '<input class="bef-input" type="text" id="befNewName" value="' + escapeHtml(d.customer.isNew ? d.customer.name : '') + '" placeholder="Kundens navn" />'
    + '</div>'
    + '<div class="bef-field">'
    + '<label class="bef-label">Adresse <span class="bef-required">*</span></label>'
    + '<input class="bef-input" type="text" id="befNewAddress" value="' + escapeHtml(d.customer.isNew ? d.customer.address : '') + '" placeholder="Gate, postnr, sted" />'
    + '</div>'
    + '<div class="bef-field">'
    + '<label class="bef-label">Telefon</label>'
    + '<input class="bef-input" type="tel" id="befNewPhone" value="' + escapeHtml(d.customer.isNew ? d.customer.phone : '') + '" placeholder="Telefonnummer" />'
    + '</div>';

  return '<h2 class="bef-step-title">Velg kunde</h2>'
    + '<p class="bef-step-desc">Sok etter eksisterende eller opprett ny kunde</p>'
    + searchHtml + newHtml;
}

window.searchCustomers = function(query) {
  var results = document.getElementById('befCustResults');
  if (!results) return;
  var q = (query || '').toLowerCase().trim();
  if (!q) { results.innerHTML = ''; return; }

  var matches = befState.customers.filter(function(c) {
    return [c.name, c.phone, c.email, c.address || ''].join(' ').toLowerCase().indexOf(q) >= 0;
  }).slice(0, 5);

  if (!matches.length) {
    results.innerHTML = '<div style="padding:8px 0;color:var(--muted);font-size:13px">Ingen treff</div>';
    return;
  }

  results.innerHTML = matches.map(function(c) {
    return '<div class="bef-search-item" onclick="selectCustomer(\'' + c.id + '\')">'
      + '<div><div class="bef-search-name">' + escapeHtml(c.name) + '</div>'
      + '<div class="bef-search-detail">' + escapeHtml(c.phone || '') + (c.address ? ' &middot; ' + escapeHtml(c.address) : '') + '</div></div>'
      + '</div>';
  }).join('');
};

window.selectCustomer = function(id) {
  var c = befState.customers.find(function(x) { return x.id === id; });
  if (!c) return;
  befState.draft.customer = {
    id: c.id,
    name: c.name,
    address: c.address || '',
    phone: c.phone || '',
    isNew: false,
  };
  saveDraftToStorage();
  renderFlowView();
};


// ── STEP 2: OPPDRAGSTYPE ───────────────────────────────────

function renderStepOppdrag(d) {
  var types = ['Ny terrasse', 'Utvidelse', 'Rehabilitering', 'Bytte dekke'];
  var opts = types.map(function(t) {
    var sel = d.oppdragstype === t ? ' selected' : '';
    return '<div class="bef-opt' + sel + '" onclick="pickOppdrag(\'' + t + '\')">' + escapeHtml(t) + '</div>';
  }).join('');

  return '<h2 class="bef-step-title">Type oppdrag</h2>'
    + '<p class="bef-step-desc">Hva slags terrassejobb er dette?</p>'
    + '<div class="bef-options">' + opts + '</div>';
}

window.pickOppdrag = function(type) {
  befState.draft.oppdragstype = type;
  saveDraftToStorage();
  // Re-render to show selection, then auto-advance after short delay
  renderFlowView();
  setTimeout(function() { nextStep(); }, 250);
};


// ── STEP 3: MÅL & FORHOLD ──────────────────────────────────

function renderStepMaal(d) {
  var isExact = d.maal.mode === 'eksakt';

  var modeToggle = '<div class="bef-mode-toggle">'
    + '<button class="bef-mode-btn' + (!isExact ? ' active' : '') + '" onclick="setMaalMode(\'rask\')">Rask</button>'
    + '<button class="bef-mode-btn' + (isExact ? ' active' : '') + '" onclick="setMaalMode(\'eksakt\')">Eksakt</button>'
    + '</div>';

  var sizeHtml = '';
  if (!isExact) {
    var ranges = ['< 10 m\u00B2', '10\u201320 m\u00B2', '20\u201340 m\u00B2', '40+ m\u00B2'];
    sizeHtml = '<div class="bef-section-label">Ca. storrelse</div>'
      + '<div class="bef-options">' + ranges.map(function(r) {
        var sel = d.maal.sizeRange === r ? ' selected' : '';
        return '<div class="bef-opt' + sel + '" onclick="pickSize(\'' + r + '\')">' + r + '</div>';
      }).join('') + '</div>';
  } else {
    sizeHtml = '<div class="bef-section-label">Eksakte mal</div>'
      + '<div class="bef-input-row">'
      + '<div class="bef-field"><label class="bef-label">Lengde (m)</label>'
      + '<input class="bef-input" type="number" id="befLengde" value="' + (d.maal.lengde || '') + '" placeholder="f.eks. 6" inputmode="decimal" /></div>'
      + '<div class="bef-field"><label class="bef-label">Bredde (m)</label>'
      + '<input class="bef-input" type="number" id="befBredde" value="' + (d.maal.bredde || '') + '" placeholder="f.eks. 4" inputmode="decimal" /></div>'
      + '</div>';
  }

  var hoydeOpts = ['Lav (< 50 cm)', 'Middels (50\u2013120 cm)', 'Hoy (> 120 cm)'];
  var hoydeHtml = '<div class="bef-section-label">Hoyde fra bakken</div>'
    + '<div class="bef-options">' + hoydeOpts.map(function(h) {
      var sel = d.maal.hoyde === h ? ' selected' : '';
      return '<div class="bef-opt' + sel + '" onclick="pickHoyde(\'' + h + '\')">' + h + '</div>';
    }).join('') + '</div>';

  var underlagOpts = ['Jord', 'Grus', 'Fjell', 'Betong', 'Annet'];
  var underlagHtml = '<div class="bef-section-label">Underlag / fundament</div>'
    + '<div class="bef-options">' + underlagOpts.map(function(u) {
      var sel = d.underlag === u ? ' selected' : '';
      return '<div class="bef-opt' + sel + '" onclick="pickUnderlag(\'' + u + '\')">' + u + '</div>';
    }).join('') + '</div>';

  var tilkomstOpts = ['God', 'Begrenset', 'Vanskelig'];
  var tilkomstHtml = '<div class="bef-section-label">Tilkomst</div>'
    + '<div class="bef-options">' + tilkomstOpts.map(function(t) {
      var sel = d.tilkomst === t ? ' selected' : '';
      return '<div class="bef-opt' + sel + '" onclick="pickTilkomst(\'' + t + '\')">' + t + '</div>';
    }).join('') + '</div>';

  return '<h2 class="bef-step-title">Mal og forhold</h2>'
    + '<p class="bef-step-desc">Storrelse, hoyde og forutsetninger</p>'
    + modeToggle + sizeHtml + hoydeHtml + underlagHtml + tilkomstHtml;
}

window.setMaalMode = function(mode) {
  befState.draft.maal.mode = mode;
  saveDraftToStorage();
  renderFlowView();
};

window.pickSize = function(range) {
  befState.draft.maal.sizeRange = range;
  saveDraftToStorage();
  document.querySelectorAll('.bef-opt').forEach(function(el) { el.classList.remove('selected'); });
  event.target.classList.add('selected');
};

window.pickHoyde = function(h) {
  befState.draft.maal.hoyde = h;
  saveDraftToStorage();
  renderFlowView();
};

window.pickUnderlag = function(u) {
  befState.draft.underlag = u;
  saveDraftToStorage();
  renderFlowView();
};

window.pickTilkomst = function(t) {
  befState.draft.tilkomst = t;
  saveDraftToStorage();
  renderFlowView();
};


// ── STEP 4: MATERIALER & TILVALG ────────────────────────────

function renderStepMaterialer(d) {
  var preset = '<div class="bef-preset" onclick="applyStandardPreset()">'
    + '<span class="bef-preset-icon">&#9889;</span>'
    + '<div><strong>Standard terrasse</strong><br/><span style="font-size:12px;font-weight:400;color:var(--muted)">Trykkimpregnert, ingen tilvalg</span></div>'
    + '</div>';

  var mats = ['Trykkimpregnert', 'Royalimpregnert', 'Kebony', 'Accoya', 'Annet'];
  var matHtml = '<div class="bef-section-label">Materialvalg</div>'
    + '<div class="bef-options">' + mats.map(function(m) {
      var sel = d.material === m ? ' selected' : '';
      return '<div class="bef-opt' + sel + '" onclick="pickMaterial(\'' + m + '\')">' + m + '</div>';
    }).join('') + '</div>';

  var tilvalg = [
    { key: 'rekkverk', label: 'Rekkverk' },
    { key: 'trapp', label: 'Trapp' },
    { key: 'riving', label: 'Riving' },
    { key: 'innkassing', label: 'Innkassing' },
    { key: 'skjort', label: 'Skjort' },
    { key: 'levegg', label: 'Levegg' },
  ];
  var tilvalgHtml = '<div class="bef-section-label">Tilvalg</div>'
    + '<div class="bef-checks">' + tilvalg.map(function(t) {
      var checked = d.tilvalg[t.key] ? ' checked' : '';
      return '<div class="bef-check' + checked + '" onclick="toggleTilvalg(\'' + t.key + '\')">'
        + '<span class="bef-check-box"></span>'
        + escapeHtml(t.label)
        + '</div>';
    }).join('') + '</div>';

  return '<h2 class="bef-step-title">Materialer og tilvalg</h2>'
    + '<p class="bef-step-desc">Hva onsker kunden?</p>'
    + preset + matHtml + tilvalgHtml;
}

window.applyStandardPreset = function() {
  var d = befState.draft;
  d.material = 'Trykkimpregnert';
  d.tilvalg = { rekkverk: false, trapp: false, riving: false, innkassing: false, skjort: false, levegg: false };
  saveDraftToStorage();
  renderFlowView();
  showToast('Standard terrasse valgt');
};

window.pickMaterial = function(m) {
  befState.draft.material = m;
  saveDraftToStorage();
  renderFlowView();
};

window.toggleTilvalg = function(key) {
  befState.draft.tilvalg[key] = !befState.draft.tilvalg[key];
  saveDraftToStorage();
  renderFlowView();
};


// ── STEP 5: BILDER & NOTATER ────────────────────────────────

function renderStepBilder(d) {
  var photosHtml = '';
  if (d.bilder.length) {
    photosHtml = '<div class="bef-photos">' + d.bilder.map(function(b, i) {
      return '<div class="bef-photo">'
        + '<img src="' + b.dataUrl + '" alt="Bilde ' + (i + 1) + '" />'
        + '<button class="bef-photo-remove" onclick="removePhoto(' + i + ')">&times;</button>'
        + (b.comment ? '<div class="bef-photo-comment">' + escapeHtml(b.comment) + '</div>' : '')
        + '</div>';
    }).join('') + '</div>';
  }

  var addBtn = '<label class="bef-add-photo">'
    + '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>'
    + 'Ta bilde eller velg fra galleri'
    + '<input type="file" accept="image/*" capture="environment" multiple style="display:none" onchange="addPhotos(this.files)" />'
    + '</label>';

  var commentHtml = '';
  if (d.bilder.length) {
    commentHtml = '<div class="bef-field" style="margin-top:12px">'
      + '<label class="bef-label">Kommentar til siste bilde</label>'
      + '<input class="bef-input" type="text" id="befPhotoComment" placeholder="f.eks. Ratten bjelke ved hjorne" value="' + escapeHtml(d.bilder[d.bilder.length - 1].comment || '') + '" onchange="updateLastPhotoComment(this.value)" />'
      + '</div>';
  }

  var notatHtml = '<div class="bef-field" style="margin-top:20px">'
    + '<label class="bef-label">Notater</label>'
    + '<textarea class="bef-input" id="befNotater" placeholder="Beskriv det du ser. Trykk mikrofon pa tastaturet for a snakke." rows="4">' + escapeHtml(d.notater || '') + '</textarea>'
    + '</div>';

  return '<h2 class="bef-step-title">Bilder og notater</h2>'
    + '<p class="bef-step-desc">Dokumenter det du ser</p>'
    + photosHtml + addBtn + commentHtml + notatHtml;
}

window.addPhotos = function(files) {
  if (!files || !files.length) return;
  var remaining = files.length;

  for (var i = 0; i < files.length; i++) {
    (function(file) {
      var reader = new FileReader();
      reader.onload = function(e) {
        resizeImage(e.target.result, 1200, function(resized) {
          befState.draft.bilder.push({
            id: uid(),
            dataUrl: resized,
            comment: '',
          });
          remaining--;
          if (remaining === 0) {
            saveDraftToStorage();
            renderFlowView();
          }
        });
      };
      reader.readAsDataURL(file);
    })(files[i]);
  }
};

window.removePhoto = function(index) {
  befState.draft.bilder.splice(index, 1);
  saveDraftToStorage();
  renderFlowView();
};

window.updateLastPhotoComment = function(val) {
  var bilder = befState.draft.bilder;
  if (bilder.length) {
    bilder[bilder.length - 1].comment = val;
    saveDraftToStorage();
  }
};

function resizeImage(dataUrl, maxWidth, callback) {
  var img = new Image();
  img.onload = function() {
    var w = img.width;
    var h = img.height;
    if (w > maxWidth) {
      h = Math.round(h * (maxWidth / w));
      w = maxWidth;
    }
    var canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    canvas.getContext('2d').drawImage(img, 0, 0, w, h);
    callback(canvas.toDataURL('image/jpeg', 0.8));
  };
  img.src = dataUrl;
}


// ── STEP 6: OPPSUMMERING ────────────────────────────────────

function renderStepOppsummering(d) {
  var missing = getMissingFields(d);
  var warningHtml = '';
  if (missing.length) {
    warningHtml = '<div class="bef-warning">'
      + '<span class="bef-warning-icon">&#9888;</span>'
      + '<div>Mangler: ' + missing.join(', ') + '</div>'
      + '</div>';
  }

  // Kunde
  var kundeHtml = '<div class="bef-summary-section">'
    + '<div class="bef-summary-title">Kunde</div>'
    + summaryRow('Navn', d.customer.name)
    + summaryRow('Adresse', d.customer.address)
    + summaryRow('Telefon', d.customer.phone)
    + '</div>';

  // Oppdrag
  var oppdragHtml = '<div class="bef-summary-section">'
    + '<div class="bef-summary-title">Oppdrag</div>'
    + summaryRow('Type', d.oppdragstype)
    + '</div>';

  // Mål
  var sizeVal = d.maal.mode === 'rask' ? d.maal.sizeRange : (d.maal.lengde && d.maal.bredde ? d.maal.lengde + ' x ' + d.maal.bredde + ' m' : '');
  var maalHtml = '<div class="bef-summary-section">'
    + '<div class="bef-summary-title">Mal og forhold</div>'
    + summaryRow('Storrelse', sizeVal)
    + summaryRow('Hoyde', d.maal.hoyde)
    + summaryRow('Underlag', d.underlag)
    + summaryRow('Tilkomst', d.tilkomst)
    + '</div>';

  // Materialer
  var tilvalgList = Object.keys(d.tilvalg).filter(function(k) { return d.tilvalg[k]; });
  var tilvalgStr = tilvalgList.length ? tilvalgList.join(', ') : 'Ingen';
  var matHtml = '<div class="bef-summary-section">'
    + '<div class="bef-summary-title">Materialer</div>'
    + summaryRow('Material', d.material)
    + summaryRow('Tilvalg', tilvalgStr)
    + '</div>';

  // Bilder
  var bilderHtml = '';
  if (d.bilder.length) {
    bilderHtml = '<div class="bef-summary-section">'
      + '<div class="bef-summary-title">Bilder (' + d.bilder.length + ')</div>'
      + '<div class="bef-summary-photos">' + d.bilder.map(function(b) {
        return '<img src="' + b.dataUrl + '" alt="Bilde" />';
      }).join('') + '</div>'
      + '</div>';
  }

  // Notater
  var notatHtml = '';
  if (d.notater) {
    notatHtml = '<div class="bef-summary-section">'
      + '<div class="bef-summary-title">Notater</div>'
      + '<p style="font-size:14px;white-space:pre-wrap">' + escapeHtml(d.notater) + '</p>'
      + '</div>';
  }

  // Action buttons
  var actionsHtml = '<div style="display:flex;flex-direction:column;gap:10px;margin-top:20px">'
    + '<button class="bef-nav-btn bef-nav-btn--green" onclick="submitBefaring()" style="width:100%">'
    + (missing.length ? 'Fullfør likevel' : 'Fullfør befaring') + '</button>'
    + '<button class="bef-nav-btn" onclick="saveDraftAndExit()" style="width:100%">Lagre som utkast</button>'
    + '<button class="bef-delete-btn" onclick="deleteDraft()">Slett befaring</button>'
    + '</div>';

  // Navigation back
  var backNav = '<div style="display:flex;gap:10px;margin-top:8px">'
    + '<button class="bef-nav-btn" onclick="goToStep(0)" style="flex:1;font-size:13px">Rediger kunde</button>'
    + '<button class="bef-nav-btn" onclick="goToStep(2)" style="flex:1;font-size:13px">Rediger mal</button>'
    + '<button class="bef-nav-btn" onclick="goToStep(3)" style="flex:1;font-size:13px">Rediger materialer</button>'
    + '</div>';

  return '<h2 class="bef-step-title">Oppsummering</h2>'
    + '<p class="bef-step-desc">Se over og fullfør</p>'
    + warningHtml + kundeHtml + oppdragHtml + maalHtml + matHtml + bilderHtml + notatHtml + backNav + actionsHtml;
}

window.goToStep = function(step) {
  collectStepData();
  saveDraftToStorage();
  befState.step = step;
  renderFlowView();
};

function summaryRow(key, val) {
  var display = val || '<span style="color:var(--red)">Mangler</span>';
  return '<div class="bef-summary-row">'
    + '<span class="bef-summary-key">' + escapeHtml(key) + '</span>'
    + '<span class="bef-summary-val">' + (val ? escapeHtml(val) : display) + '</span>'
    + '</div>';
}

function getMissingFields(d) {
  var missing = [];
  if (!d.customer.name) missing.push('kunde');
  if (!d.customer.address) missing.push('adresse');
  if (!d.oppdragstype) missing.push('oppdragstype');
  if (d.maal.mode === 'rask' && !d.maal.sizeRange) missing.push('storrelse');
  if (d.maal.mode === 'eksakt' && (!d.maal.lengde || !d.maal.bredde)) missing.push('mal');
  if (!d.maal.hoyde) missing.push('hoyde');
  if (!d.tilkomst) missing.push('tilkomst');
  if (!d.material) missing.push('materialvalg');
  return missing;
}


// ── SUBMIT / SAVE ───────────────────────────────────────────

window.submitBefaring = async function() {
  collectStepData();
  var d = befState.draft;
  d.status = 'fullfort';
  d.completed_at = new Date().toISOString();

  // If new customer, add to shared customer list
  if (d.customer.isNew && d.customer.name) {
    await addNewCustomer(d.customer);
  }

  // Try to save to Supabase
  var saved = await saveBefToSupabase(d);
  if (saved) {
    befState.list.unshift({ id: d.id, data: d, status: 'fullfort', created_at: d.created_at, user_id: d.user_id });
    clearDraft();
    befState.view = 'list';
    renderCurrentView();
    showToast('Befaring lagret!');
  } else {
    // Save locally
    befState.list.unshift({ id: d.id, data: d, status: 'fullfort', created_at: d.created_at, user_id: d.user_id });
    saveListToStorage();
    clearDraft();
    befState.view = 'list';
    renderCurrentView();
    showToast('Lagret lokalt — synces nar nett er tilbake');
  }
};

window.saveDraftAndExit = function() {
  collectStepData();
  saveDraftToStorage();
  befState.view = 'list';
  renderCurrentView();
  showToast('Utkast lagret');
};

window.deleteDraft = function() {
  if (confirm('Er du sikker pa at du vil slette denne befaringen?')) {
    clearDraft();
    befState.view = 'list';
    renderCurrentView();
  }
};

async function saveBefToSupabase(d) {
  if (!_sbUser) return false;
  try {
    var result = await _sb.from('befaringer').upsert({
      id: d.id,
      user_id: _sbUser.id,
      status: d.status,
      data: d,
      created_at: d.created_at,
      completed_at: d.completed_at || null,
    }, { onConflict: 'id' });
    return !result.error;
  } catch (e) {
    return false;
  }
}

async function addNewCustomer(customer) {
  if (!_sbUser) return;
  var newCust = {
    id: customer.id || uid(),
    name: customer.name,
    phone: customer.phone,
    address: customer.address,
    email: '',
  };

  // Add to local state for main app
  try {
    var result = await _sb.from('user_data').select('data').eq('user_id', _sbUser.id).single();
    if (result.data && result.data.data) {
      var appData = result.data.data;
      appData.customers = appData.customers || [];
      appData.customers.push(newCust);
      await _sb.from('user_data').upsert({
        user_id: _sbUser.id,
        data: appData,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
    }
  } catch (e) {
    console.log('Could not save customer to main app:', e);
  }

  // Also update local customer list
  befState.customers.push(newCust);
}


// ── DETAIL VIEW ─────────────────────────────────────────────

function renderDetailView() {
  var item = befState.list.find(function(b) { return (b.id || (b.data && b.data.id)) === befState.detailId; });
  if (!item) { befState.view = 'list'; renderCurrentView(); return; }

  var d = item.data || item;

  document.getElementById('topbarTitle').textContent = 'Befaring';
  document.getElementById('topbarBack').style.display = '';
  document.getElementById('topbarLogout').style.display = 'none';
  document.getElementById('befProgress').style.display = 'none';
  document.getElementById('befBottomNav').style.display = 'none';

  var main = document.getElementById('befMain');

  // Reuse summary rendering
  var sizeVal = d.maal.mode === 'rask' ? d.maal.sizeRange : (d.maal.lengde && d.maal.bredde ? d.maal.lengde + ' x ' + d.maal.bredde + ' m' : '');
  var tilvalgList = Object.keys(d.tilvalg || {}).filter(function(k) { return d.tilvalg[k]; });
  var tilvalgStr = tilvalgList.length ? tilvalgList.join(', ') : 'Ingen';

  var html = '<h2 class="bef-step-title">' + escapeHtml(d.customer.name || 'Ukjent kunde') + '</h2>'
    + '<p class="bef-step-desc">' + escapeHtml(d.oppdragstype || 'Terrasse') + ' &middot; ' + formatDate(d.created_at) + '</p>';

  html += '<div class="bef-summary-section">'
    + '<div class="bef-summary-title">Kunde</div>'
    + summaryRow('Navn', d.customer.name)
    + summaryRow('Adresse', d.customer.address)
    + summaryRow('Telefon', d.customer.phone)
    + '</div>';

  html += '<div class="bef-summary-section">'
    + '<div class="bef-summary-title">Oppdrag</div>'
    + summaryRow('Type', d.oppdragstype)
    + summaryRow('Storrelse', sizeVal)
    + summaryRow('Hoyde', d.maal.hoyde)
    + summaryRow('Underlag', d.underlag)
    + summaryRow('Tilkomst', d.tilkomst)
    + '</div>';

  html += '<div class="bef-summary-section">'
    + '<div class="bef-summary-title">Materialer</div>'
    + summaryRow('Material', d.material)
    + summaryRow('Tilvalg', tilvalgStr)
    + '</div>';

  if (d.bilder && d.bilder.length) {
    html += '<div class="bef-summary-section">'
      + '<div class="bef-summary-title">Bilder (' + d.bilder.length + ')</div>'
      + '<div class="bef-summary-photos">' + d.bilder.map(function(b) {
        return '<img src="' + b.dataUrl + '" alt="Bilde" />';
      }).join('') + '</div>'
      + '</div>';
  }

  if (d.notater) {
    html += '<div class="bef-summary-section">'
      + '<div class="bef-summary-title">Notater</div>'
      + '<p style="font-size:14px;white-space:pre-wrap">' + escapeHtml(d.notater) + '</p>'
      + '</div>';
  }

  main.innerHTML = html;
}


// ── COLLECT DATA FROM CURRENT STEP ──────────────────────────

function collectStepData() {
  var d = befState.draft;
  if (!d) return;

  switch (STEPS[befState.step]) {
    case 'kunde':
      var newName = document.getElementById('befNewName');
      var newAddr = document.getElementById('befNewAddress');
      var newPhone = document.getElementById('befNewPhone');
      if (newName && newName.value.trim() && !d.customer.id) {
        d.customer = {
          id: d.customer.id || uid(),
          name: newName.value.trim(),
          address: newAddr ? newAddr.value.trim() : '',
          phone: newPhone ? newPhone.value.trim() : '',
          isNew: true,
        };
      } else if (newName && newName.value.trim() && d.customer.isNew) {
        d.customer.name = newName.value.trim();
        d.customer.address = newAddr ? newAddr.value.trim() : d.customer.address;
        d.customer.phone = newPhone ? newPhone.value.trim() : d.customer.phone;
      }
      break;

    case 'maal':
      if (d.maal.mode === 'eksakt') {
        var lengde = document.getElementById('befLengde');
        var bredde = document.getElementById('befBredde');
        if (lengde) d.maal.lengde = lengde.value;
        if (bredde) d.maal.bredde = bredde.value;
      }
      break;

    case 'bilder':
      var notater = document.getElementById('befNotater');
      if (notater) d.notater = notater.value;
      var photoComment = document.getElementById('befPhotoComment');
      if (photoComment && d.bilder.length) {
        d.bilder[d.bilder.length - 1].comment = photoComment.value;
      }
      break;
  }
}


// ── HELPERS ─────────────────────────────────────────────────

function formatDate(isoStr) {
  if (!isoStr) return '';
  var d = new Date(isoStr);
  var day = String(d.getDate()).padStart(2, '0');
  var month = String(d.getMonth() + 1).padStart(2, '0');
  var year = d.getFullYear();
  return day + '.' + month + '.' + year;
}

function showToast(msg) {
  var existing = document.querySelector('.bef-sync-msg');
  if (existing) existing.remove();

  var el = document.createElement('div');
  el.className = 'bef-sync-msg';
  el.textContent = msg;
  document.body.appendChild(el);

  requestAnimationFrame(function() {
    el.classList.add('visible');
  });

  setTimeout(function() {
    el.classList.remove('visible');
    setTimeout(function() { el.remove(); }, 300);
  }, 2500);
}
