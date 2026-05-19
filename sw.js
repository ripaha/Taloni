// Taloni Service Worker
// Tämä tiedosto pyörii selaimessa taustalla ja hallinnoi välimuistia.
// Aina kun sovellus päivitetään, vaihda CACHE_VERSION numero korkeammaksi.

const CACHE_VERSION = 'v0.7.0';
const CACHE_NAME = `taloni-${CACHE_VERSION}`;

// Tiedostot joita välimuistiin tallennetaan asennuksen yhteydessä.
// Käytännössä vain index.html, koska kaikki muu on sisällä siinä.
const ESSENTIAL_FILES = [
  './',
  './index.html'
];

// --- INSTALL ---
// Kun service worker asennetaan ensimmäistä kertaa tai päivitetään uudempaan,
// tallennetaan välttämättömät tiedostot välimuistiin.
self.addEventListener('install', (event) => {
  console.log('[SW] Asennetaan versio', CACHE_VERSION);
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ESSENTIAL_FILES);
    }).then(() => {
      // skipWaiting tekee uudesta versiosta heti aktiivisen vanhan tilalle
      // Sovellus saa erikseen tiedon ja voi pyytää lataamaan sivun uudelleen
      return self.skipWaiting();
    })
  );
});

// --- ACTIVATE ---
// Kun uusi service worker aktivoituu, poistetaan vanhat välimuistit.
self.addEventListener('activate', (event) => {
  console.log('[SW] Aktivoidaan versio', CACHE_VERSION);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('taloni-') && name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Poistetaan vanha välimuisti:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// --- FETCH ---
// Strategia: "Network first, fallback to cache"
// Yritetään aina ensin hakea netistä uusin versio. Jos ei onnistu (ei nettiä),
// palautetaan välimuistissa oleva versio. Näin sovellus toimii offline,
// mutta saa uusimmat päivitykset heti kun netti on saatavilla.
self.addEventListener('fetch', (event) => {
  // Käsitellään vain GET-pyynnöt
  if (event.request.method !== 'GET') return;

  // Ulkoiset resurssit (fontit, ikonit CDN:stä) hoidetaan eri tavalla:
  // ne haetaan vain kerran ja niistä pidetään välimuistia ikuisesti, koska
  // niiden URL sisältää version (esim. lucide@latest = oma cache-buster).
  const url = new URL(event.request.url);
  const isCrossOrigin = url.origin !== self.location.origin;

  if (isCrossOrigin) {
    // Cache first ulkopuolisille (fontit, lucide)
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Oma sovellus: Network first
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Onnistui — tallenna kopio välimuistiin tulevaa offline-käyttöä varten
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        // Ei verkkoa — palauta välimuistista
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          // Jos ei välimuistissakaan, koeta palauttaa juuri index.html
          return caches.match('./index.html');
        });
      })
  );
});

// --- MESSAGE ---
// Sovellus voi pyytää service workeria päivittymään välittömästi
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
