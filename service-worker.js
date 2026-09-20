const CACHE='root-rpg-v06';
const ASSETS=[
  './',
  './index.html',
  './styles.css?v=6',
  './characters.js?v=1',
  './app.js?v=6',
  './manifest.webmanifest',
  './icon.svg',
  './icons.svg',
  './portrait-thief.svg',
  './portrait-ranger.svg',
  './portrait-tinker.svg',
  './forest-silhouette.svg',
  './woodland-pattern.svg'
];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  event.respondWith(
    fetch(event.request).then(response=>{
      const copy=response.clone();
      caches.open(CACHE).then(cache=>cache.put(event.request,copy)).catch(()=>{});
      return response;
    }).catch(()=>caches.match(event.request).then(r=>r||caches.match('./index.html')))
  );
});