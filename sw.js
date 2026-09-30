// Service worker: lar appen starte og brukes uten dekning (byggeplass).
// Egne filer hentes fra nett først, så oppdateringer kommer med en gang når
// det er dekning — cache brukes kun som reserve. Data synkes separat
// (localStorage + Supabase, se auth.js), og Supabase-kall går aldri via cachen.

const CACHE_NAME = 'byggeplassen-v1';
const NETWORK_TIMEOUT_MS = 4000;

// NOTE: Nye skript i index.html bør legges til her, ellers er de ikke
// tilgjengelige uten nett før appen har vært åpnet med dekning én gang.
const APP_SHELL = [
  './', 'index.html', 'style.css', 'manifest.json',
  'utils.js', 'settings.js', 'customers.js', 'auth.js', 'offer.js', 'changeOrders.js',
  'projectFiles.js', 'docs.js', 'productionData.js', 'recipes.js', 'calcEngine.js',
  'projects.js', 'rafterCalc.js', 'gavlCalc.js', 'gavlParityGuard.js', 'makker.js',
  'materialCalc.js', 'app.js',
  'befaring/index.html', 'befaring/befaring.js', 'befaring/befaring.css',
  'img/icons/apple-touch-icon.png', 'img/icons/icon-192.png', 'img/icons/icon-512.png'
];

// Tredjeparts-filer appen trenger for å starte (Supabase-klient og fonter).
const CDN_HOSTS = ['cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (url.origin === self.location.origin) {
    event.respondWith(networkFirst(request));
  } else if (CDN_HOSTS.includes(url.hostname)) {
    event.respondWith(staleWhileRevalidate(request));
  }
  // Alt annet (Supabase API/lagring) går rett til nett.
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetchWithTimeout(request, NETWORK_TIMEOUT_MS);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch (err) {
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return cached;
    if (request.mode === 'navigate') return cache.match('index.html');
    throw err;
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then(response => {
      if (response.ok || response.type === 'opaque') cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);
  return cached || network;
}

// Svak dekning gir ofte hengende forespørsler i stedet for feil — gi opp
// etter en stund og bruk lagret versjon.
function fetchWithTimeout(request, timeoutMs) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Tidsavbrudd')), timeoutMs);
    fetch(request).then(
      response => { clearTimeout(timer); resolve(response); },
      err => { clearTimeout(timer); reject(err); }
    );
  });
}
