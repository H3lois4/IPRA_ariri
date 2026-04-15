/**
 * offline-cache.js — Cache manual de arquivos para uso offline
 * 
 * Como Service Workers requerem HTTPS (exceto localhost),
 * este módulo usa Cache API diretamente quando disponível,
 * garantindo que o app funcione offline após primeiro acesso.
 */
(function () {
  'use strict';

  var CACHE_NAME = 'ipra-ariri-v4';
  var FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/db.js',
    '/js/sync.js',
    '/js/resize.js',
    '/js/offline-cache.js',
    '/js/app.js',
    '/js/pages/splash.js',
    '/js/pages/info.js',
    '/js/pages/day-detail.js',
    '/js/pages/forms.js',
    '/js/pages/form-new.js',
    '/js/pages/diary.js',
    '/js/pages/post-new.js',
    '/js/pages/menu.js',
    '/js/pages/accounts.js',
    '/js/pages/receipt-new.js',
    '/js/pages/team.js',
    '/js/pages/volunteer-profile.js',
    '/assets/logo.png',
    '/manifest.json'
  ];

  // Also cache schedule data
  var API_TO_CACHE = ['/api/schedule'];

  function cacheAllFiles() {
    if (!('caches' in window)) return Promise.resolve();

    return caches.open(CACHE_NAME).then(function (cache) {
      var promises = FILES_TO_CACHE.map(function (url) {
        return fetch(url).then(function (resp) {
          if (resp.ok) return cache.put(url, resp);
        }).catch(function () { /* ignore */ });
      });

      // Also cache API data
      API_TO_CACHE.forEach(function (url) {
        promises.push(
          fetch(url).then(function (resp) {
            if (resp.ok) return cache.put(url, resp);
          }).catch(function () { /* ignore */ })
        );
      });

      return Promise.all(promises);
    });
  }

  // Cache files on first load
  window.addEventListener('load', function () {
    cacheAllFiles().then(function () {
      console.log('Offline cache: arquivos salvos');
    }).catch(function () {
      console.log('Offline cache: não disponível');
    });
  });

  window.OfflineCache = { cacheAllFiles: cacheAllFiles };
})();
