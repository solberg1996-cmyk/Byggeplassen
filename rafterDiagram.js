// ── Taksperre-diagram — SVG-overlay på rafter3.png ─────────────
// Viser dynamiske mål og tekster over et statisk bakgrunnsbilde.
//
// Bruk:
//   var data = beregnTaksperre({ run: 3000, takvinkel: 30 });
//   renderRafterDiagram('rafter-container', data);
//
// Bildet (rafter3.png) er 2360×1640 px. ViewBox matcher 1:1.

var RAFTER_VIEWBOX = { w: 2360, h: 1640 };

// ── Ankerpunkter i bildet (px-koordinater) ─────────────────────
// Juster disse for å flytte etiketter uten å endre kode.
var RAFTER_ANCHORS = {
  ridgePlumb:   { x: 205,  y: 155 },   // loddlinje topp (møne)
  ridgeRafter:  { x: 140,  y: 215 },   // sperre øvre kant, topp
  wallOutside:  { x: 1800, y: 985 },   // yttervegg topp
  wallBottom:   { x: 1800, y: 1385 },  // yttervegg bunn
  tailEnd:      { x: 2195, y: 1200 },  // utstikk ytterpunkt
  birdsmouthTop:{ x: 1750, y: 985 },   // fuglehakk øvre hjørne
  birdsmouthBtm:{ x: 1800, y: 1060 },  // fuglehakk nedre hjørne
  bottomLeft:   { x: 205,  y: 1385 },  // bunn venstre
  bottomRight:  { x: 2195, y: 1385 }   // bunn høyre
};

var RAFTER_COLORS = {
  dim: '#2563eb',       // målelinje/tekst
  dimLight: '#93c5fd',  // hjelpelinje
  accent: '#dc2626',    // vinkel/viktige verdier
  bg: 'rgba(255,255,255,0.85)' // tekst-bakgrunn
};

// ── Hovedfunksjon ──────────────────────────────────────────────

function renderRafterDiagram(containerId, data) {
  var container = document.getElementById(containerId);
  if (!container || !data || !data.gyldig) return;

  container.innerHTML = '';
  container.classList.add('rafter-diagram');

  var img = document.createElement('img');
  img.src = 'img/Sperre-ref/rafter3.png';
  img.alt = 'Sperretegning';
  img.classList.add('rafter-diagram__img');
  img.draggable = false;

  var svgNS = 'http://www.w3.org/2000/svg';
  var svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', '0 0 ' + RAFTER_VIEWBOX.w + ' ' + RAFTER_VIEWBOX.h);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.classList.add('rafter-diagram__svg');

  var defs = createSvgDefs(svgNS);
  svg.appendChild(defs);

  var labels = buildLabels(data);
  labels.forEach(function(label) {
    var el = createLabel(svgNS, label);
    if (el) svg.appendChild(el);
  });

  var dimLines = buildDimensionLines(data);
  dimLines.forEach(function(dim) {
    var g = createDimensionLine(svgNS, dim);
    if (g) svg.appendChild(g);
  });

  container.appendChild(img);
  container.appendChild(svg);
}


// ── Etiketter (tekst med bakgrunn) ─────────────────────────────

function buildLabels(data) {
  var a = RAFTER_ANCHORS;
  var pitch = data.input.takvinkel;
  var pitchRatio = '1:' + (1 / Math.tan(pitch * Math.PI / 180)).toFixed(2);

  return [
    // Takvinkel — ved møne
    {
      x: 380, y: 320,
      text: pitch + '°',
      fontSize: 52,
      color: RAFTER_COLORS.accent,
      rotate: 0
    },
    {
      x: 380, y: 380,
      text: 'pitch ' + pitchRatio,
      fontSize: 36,
      color: RAFTER_COLORS.accent,
      rotate: 0
    },

    // HAP — ved vegg
    {
      x: a.wallOutside.x + 55, y: a.wallOutside.y - 45,
      text: 'HAP ' + data.hap + ' mm',
      fontSize: 34,
      color: RAFTER_COLORS.dim,
      rotate: 0
    },

    // Fuglehakk — ved birdsmouth
    {
      x: a.birdsmouthTop.x - 220, y: a.birdsmouthBtm.y + 55,
      text: 'Fuglehakk ' + data.fuglehakkBredde + '×' + data.fuglehakkDybde,
      fontSize: 32,
      color: RAFTER_COLORS.dim,
      rotate: 0
    },

    // Loddskjær setback — ved møne topp
    {
      x: a.ridgePlumb.x - 10, y: a.ridgePlumb.y - 25,
      text: 'Setback ' + data.loddskjaerSetback + ' mm',
      fontSize: 32,
      color: RAFTER_COLORS.dim,
      rotate: 0
    }
  ];
}


// ── Målelinjer med verdi ───────────────────────────────────────

function buildDimensionLines(data) {
  var a = RAFTER_ANCHORS;
  var offsetY = 80; // avstand under bildelinjer

  return [
    // Run (til yttervegg) — horisontal under bildet
    {
      x1: a.ridgePlumb.x, y1: a.wallBottom.y + offsetY,
      x2: a.wallOutside.x, y2: a.wallBottom.y + offsetY,
      text: 'Run ' + data.input.run + ' mm',
      fontSize: 36
    },

    // Utstikk — horisontal
    {
      x1: a.wallOutside.x, y1: a.wallBottom.y + offsetY,
      x2: a.tailEnd.x, y2: a.wallBottom.y + offsetY,
      text: data.input.utstikk + ' mm',
      fontSize: 32
    },

    // Total run — horisontal nederst
    {
      x1: a.ridgePlumb.x, y1: a.wallBottom.y + offsetY * 2.5,
      x2: a.tailEnd.x, y2: a.wallBottom.y + offsetY * 2.5,
      text: 'Total run ' + data.totalRun + ' mm',
      fontSize: 36
    },

    // Rise — vertikal venstre
    {
      x1: a.ridgePlumb.x - offsetY, y1: a.ridgePlumb.y,
      x2: a.ridgePlumb.x - offsetY, y2: a.wallBottom.y,
      text: 'Rise ' + data.rise + ' mm',
      fontSize: 34,
      vertical: true
    },

    // Sperre total lengde — langs sperre
    {
      x1: a.ridgeRafter.x - 40, y1: a.ridgeRafter.y - 40,
      x2: a.tailEnd.x - 40, y2: a.tailEnd.y - 40,
      text: 'Total ' + data.sperreTotalLengde + ' mm',
      fontSize: 36,
      alongRafter: true,
      pitch: data.input.takvinkel
    },

    // Sperre topp lengde — langs sperre (innside)
    {
      x1: a.ridgePlumb.x + 90, y1: a.ridgePlumb.y + 120,
      x2: a.wallOutside.x + 20, y2: a.wallOutside.y + 50,
      text: 'Topp ' + data.sperreTopLengde + ' mm',
      fontSize: 34,
      alongRafter: true,
      pitch: data.input.takvinkel
    }
  ];
}


// ── SVG-fabrikk ────────────────────────────────────────────────

function createSvgDefs(ns) {
  var defs = document.createElementNS(ns, 'defs');

  // Pilhode for målelinjer
  var marker = document.createElementNS(ns, 'marker');
  marker.setAttribute('id', 'dim-arrow');
  marker.setAttribute('viewBox', '0 0 10 10');
  marker.setAttribute('refX', '10');
  marker.setAttribute('refY', '5');
  marker.setAttribute('markerWidth', '8');
  marker.setAttribute('markerHeight', '8');
  marker.setAttribute('orient', 'auto-start-reverse');

  var path = document.createElementNS(ns, 'path');
  path.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
  path.setAttribute('fill', RAFTER_COLORS.dim);
  marker.appendChild(path);
  defs.appendChild(marker);

  return defs;
}

function createLabel(ns, cfg) {
  var g = document.createElementNS(ns, 'g');

  var text = document.createElementNS(ns, 'text');
  text.setAttribute('x', cfg.x);
  text.setAttribute('y', cfg.y);
  text.setAttribute('font-size', cfg.fontSize || 36);
  text.setAttribute('font-family', "'DM Sans', sans-serif");
  text.setAttribute('fill', cfg.color || RAFTER_COLORS.dim);
  text.setAttribute('font-weight', '600');

  if (cfg.rotate) {
    text.setAttribute('transform',
      'rotate(' + cfg.rotate + ' ' + cfg.x + ' ' + cfg.y + ')');
  }

  // Bakgrunn via filter for lesbarhet
  text.setAttribute('paint-order', 'stroke');
  text.setAttribute('stroke', RAFTER_COLORS.bg);
  text.setAttribute('stroke-width', '8');
  text.setAttribute('stroke-linejoin', 'round');

  text.textContent = cfg.text;
  g.appendChild(text);

  return g;
}

function createDimensionLine(ns, cfg) {
  var g = document.createElementNS(ns, 'g');

  // Hovedlinje
  var line = document.createElementNS(ns, 'line');
  line.setAttribute('x1', cfg.x1);
  line.setAttribute('y1', cfg.y1);
  line.setAttribute('x2', cfg.x2);
  line.setAttribute('y2', cfg.y2);
  line.setAttribute('stroke', RAFTER_COLORS.dim);
  line.setAttribute('stroke-width', '3');
  line.setAttribute('marker-start', 'url(#dim-arrow)');
  line.setAttribute('marker-end', 'url(#dim-arrow)');
  g.appendChild(line);

  // Endemarker (tverrstreker)
  var tickLen = 20;
  if (!cfg.alongRafter) {
    if (cfg.vertical) {
      addTick(ns, g, cfg.x1, cfg.y1, tickLen, true);
      addTick(ns, g, cfg.x2, cfg.y2, tickLen, true);
    } else {
      addTick(ns, g, cfg.x1, cfg.y1, tickLen, false);
      addTick(ns, g, cfg.x2, cfg.y2, tickLen, false);
    }
  }

  // Tekst midt på linjen
  var mx = (cfg.x1 + cfg.x2) / 2;
  var my = (cfg.y1 + cfg.y2) / 2;

  var text = document.createElementNS(ns, 'text');
  text.setAttribute('font-size', cfg.fontSize || 34);
  text.setAttribute('font-family', "'DM Sans', sans-serif");
  text.setAttribute('fill', RAFTER_COLORS.dim);
  text.setAttribute('font-weight', '600');
  text.setAttribute('text-anchor', 'middle');
  text.setAttribute('paint-order', 'stroke');
  text.setAttribute('stroke', RAFTER_COLORS.bg);
  text.setAttribute('stroke-width', '10');
  text.setAttribute('stroke-linejoin', 'round');

  if (cfg.alongRafter && cfg.pitch) {
    var angle = cfg.pitch;
    text.setAttribute('x', mx);
    text.setAttribute('y', my - 20);
    text.setAttribute('transform',
      'rotate(' + angle + ' ' + mx + ' ' + (my - 20) + ')');
  } else if (cfg.vertical) {
    text.setAttribute('x', mx - 20);
    text.setAttribute('y', my);
    text.setAttribute('transform',
      'rotate(-90 ' + (mx - 20) + ' ' + my + ')');
  } else {
    text.setAttribute('x', mx);
    text.setAttribute('y', my - 18);
  }

  text.textContent = cfg.text;
  g.appendChild(text);

  return g;
}

function addTick(ns, parent, x, y, len, horizontal) {
  var tick = document.createElementNS(ns, 'line');
  if (horizontal) {
    tick.setAttribute('x1', x - len);
    tick.setAttribute('y1', y);
    tick.setAttribute('x2', x + len);
    tick.setAttribute('y2', y);
  } else {
    tick.setAttribute('x1', x);
    tick.setAttribute('y1', y - len);
    tick.setAttribute('x2', x);
    tick.setAttribute('y2', y + len);
  }
  tick.setAttribute('stroke', RAFTER_COLORS.dim);
  tick.setAttribute('stroke-width', '3');
  parent.appendChild(tick);
}
