const CACHE = 'led-layout-checker-v8';
const SHELL = ['/', '/favicon.svg', '/manifest.webmanifest', '/icon-192.png', '/assets/hero-routing-600.webp'];

const SECURITY_HEADERS = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' blob: data:; connect-src 'self' https://api.sociobot.in; worker-src 'self'; manifest-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self' https://api.sociobot.in; frame-ancestors 'none'",
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'X-Content-Type-Options': 'nosniff',
};

async function cleanResponse(response) {
  const headers = new Headers({
    'Content-Type': response.headers.get('content-type') || 'application/octet-stream',
    'Cache-Control': response.headers.get('cache-control') || 'public, max-age=86400',
  });
  for (const [name, fallback] of Object.entries(SECURITY_HEADERS)) {
    headers.set(name, response.headers.get(name) || fallback);
  }
  return new Response(await response.arrayBuffer(), {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    const response = await fetch('/');
    const html = await response.clone().text();
    const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((match) => match[1]);
    await cache.put('/', await cleanResponse(response));
    const files = [...new Set([...SHELL.filter((url) => url !== '/'), ...assets])];
    await Promise.all(files.map(async (url) => {
      const fresh = await fetch(new Request(url, { cache: 'reload' }));
      if (!fresh.ok) throw new Error(`Could not cache ${url}`);
      await cache.put(url, await cleanResponse(fresh));
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(caches.match('/').then((shell) => shell || fetch('/')));
    return;
  }
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
    if (response.ok) {
      const copy = response.clone();
      caches.open(CACHE).then((cache) => cache.put(event.request, copy));
    }
    return response;
  })));
});
