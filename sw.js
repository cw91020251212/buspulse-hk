/* BusPulse HK — service worker
   只 cache app shell（HTML/manifest/icon），令離線都開得到個框。
   到站數據永遠走網絡，絕不 cache（cache 咗就會顯示過期時間）。 */
const SHELL = 'buspulse-hk-shell-v2';
const FILES = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(SHELL).then(c => c.addAll(FILES)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== SHELL).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // 所有 API 呼叫：純網絡，唔碰 cache
  if (url.hostname.endsWith('gov.hk')) return;

  // 同源 shell：network-first，失敗才用 cache（保證改動即時見到）
  if (url.origin === self.location.origin) {
    e.respondWith(
      fetch(req)
        .then(r => {
          const copy = r.clone();
          caches.open(SHELL).then(c => c.put(req, copy)).catch(() => {});
          return r;
        })
        .catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
    );
  }
});
