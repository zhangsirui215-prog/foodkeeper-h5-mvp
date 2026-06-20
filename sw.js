/**
 * AI食材管家 - Service Worker
 * 使用 Cache-First 策略缓存静态资源，支持离线访问
 */

const CACHE_NAME = 'foodkeeper-v1';
const CACHE_URLS = [
  '/',
  '/index.html',
  '/health-demo.js',
  '/health-demo.css',
  '/manifest.webmanifest',
  '/js/app.js',
  '/js/store.js',
  '/js/state.js',
  '/js/data/index.js',
  '/js/ingredients.js',
  '/js/recipes.js',
  '/js/health.js',
  '/js/family.js',
  '/js/ui.js',
  '/js/charts.js',
  '/js/badges.js',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg'
];

/**
 * 安装事件：预缓存所有静态资源
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CACHE_URLS);
    })
  );
  // 立即激活
  self.skipWaiting();
});

/**
 * 激活事件：清理旧缓存
 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  // 控制所有客户端
  self.clients.claim();
});

/**
 * 拦截请求：Cache-First 策略
 */
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    })
  );
});