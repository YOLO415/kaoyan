// 考研工作台 Service Worker —— 离线缓存，使 PWA 可安装、可离线使用
const CACHE = "kaoyan-workbench-v1";

self.addEventListener("install", (e) => {
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((ks) =>
      Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return; // 只缓存同源资源
  e.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(e.request);
      const network = fetch(e.request)
        .then((r) => {
          if (r && r.status === 200) cache.put(e.request, r.clone());
          return r;
        })
        .catch(() => cached);
      return cached || network || caches.match("index.html");
    })()
  );
});
