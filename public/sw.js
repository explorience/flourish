// Flourish Service Worker — offline support + background sync
const CACHE_NAME = 'flourish-v1';
const QUEUE_STORE = 'flourish_offline_queue';
const DB_NAME = 'flourish-sw';

const STATIC_ASSETS = ['/', '/manifest.json'];

// ─── IndexedDB helpers ────────────────────────────────────────────────────────
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(QUEUE_STORE, { keyPath: 'timestamp' });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getQueue() {
  const db = await openDB();
  return db.getAll(QUEUE_STORE);
}

async function removeFromQueue(item) {
  const db = await openDB();
  const all = await db.getAll(QUEUE_STORE);
  const tx = db.transaction(QUEUE_STORE, 'readwrite');
  const store = tx.objectStore(QUEUE_STORE);
  for (let i = 0; i < all.length; i++) {
    const entry = all[i];
    if (entry.url === item.url && entry.timestamp === item.timestamp) {
      store.delete(i);
      break;
    }
  }
  await new Promise((res, rej) => { tx.oncomplete = res; tx.onerror = rej; });
}

async function addToQueue(item) {
  const db = await openDB();
  const tx = db.transaction(QUEUE_STORE, 'readwrite');
  tx.objectStore(QUEUE_STORE).put(item);
  await new Promise((res, rej) => { tx.oncomplete = res; tx.onerror = rej; });
}

// ─── Install ────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// ─── Activate ────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ─── Fetch ─────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin (except API for background sync)
  if (request.method !== 'GET' && !(request.method === 'POST' || request.method === 'PUT')) return;
  if (request.method === 'GET' && url.origin !== location.origin) return;

  // ── API: queue POST/PUT when offline ──
  if ((request.method === 'POST' || request.method === 'PUT') &&
      url.origin === location.origin && url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request.clone()).catch(async () => {
        const body = await request.json().catch(() => null);
        await addToQueue({ url: request.url, method: request.method, body, timestamp: Date.now() });
        if ('sync' in self.registration) {
          self.registration.sync.register('flourish-queue').catch(() => {});
        }
        return new Response(JSON.stringify({ queued: true }), {
          headers: { 'Content-Type': 'application/json' },
        });
      })
    );
    return;
  }

  // ── POST detail pages — cache-first, fallback to offline page ──
  if (request.method === 'GET' && url.pathname.startsWith('/post/')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        try {
          const response = await fetch(request);
          if (response.ok) cache.put(request, response.clone());
          return response;
        } catch {
          return new Response(
            `<html><body style="font-family:sans-serif;padding:2rem;text-align:center;color:#555">
              <h2>You're offline</h2>
              <p>This page isn't cached yet. Check your connection and try again.</p>
              <a href="/" style="color:#EA7000">Go home</a>
            </body></html>`,
            { headers: { 'Content-Type': 'text/html' } }
          );
        }
      })
    );
    return;
  }

  // ── Home / map — network-first with cache fallback ──
  if (request.method === 'GET' && (url.pathname === '/' || url.pathname === '/map')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        try {
          const response = await fetch(request);
          if (response.ok) cache.put(request, response.clone());
          return response;
        } catch {
          const cached = await cache.match(request);
          return cached || new Response('Offline', { status: 503 });
        }
      })
    );
    return;
  }

  // ── Static assets — cache-first ──
  if (request.method === 'GET') {
    event.respondWith(
      caches.match(request).then((cached) =>
        cached ||
        fetch(request).then((response) => {
          if (response.ok) caches.open(CACHE_NAME).then((c) => c.put(request, response.clone()));
          return response;
        })
      )
    );
  }
});

// ─── Background Sync ─────────────────────────────────────────────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'flourish-queue') {
    event.waitUntil(replayQueuedRequests());
  }
});

async function replayQueuedRequests() {
  const queue = await getQueue();
  for (const item of queue) {
    try {
      await fetch(item.url, {
        method: item.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.body),
      });
      await removeFromQueue(item);
    } catch {
      break; // stop on first failure, will retry next sync
    }
  }
}
