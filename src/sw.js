/* service worker file */
const CACHE_ID = 'v6';
const FILES = [
  '/',
  '/index.html',
  'https://fonts.googleapis.com/css?family=Source+Sans+Pro',
  '/clh.css',
  '/clh-loader.js',
  '/copy.css',
  '/manifest.json',
  '/android-chrome-96x96.png',
  '/apple-touch-icon.png',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/favicon.ico',
  '/safari-pinned-tab.svg',
  '/menu/clh-menu.html',
  '/menu/clh-menu.js'
];
const IMAGES = [
  '/img/picker_mask_200.png',
  '/img/hue.png',
  '/img/alpha.png',
  '/img/alpha_mask.png',
  '/img/arrow.png',
  '/img/picker.png',
  '/img/void.png',
  '/img/grain.png',
  '/img/trash-can.png',
  '/img/copy.png',
  '/img/lock.png'
];
const COMPONENTS = [
  '/components/dateTime/date-converter.html',
  '/components/dateTime/date-converter.js',
  '/components/dateTime/stop-watch.html',
  '/components/dateTime/stop-watch.js',
  '/components/dateTime/time-diff.html',
  '/components/dateTime/time-diff.js',
  '/components/graphics/color-picker.js',
  '/components/graphics/gradient-maker.html',
  '/components/graphics/gradient-maker.js',
  '/components/graphics/random-color.html',
  '/components/graphics/random-color.js',
  '/components/libs/beautify-css.js',
  '/components/libs/beautify-html.js',
  '/components/libs/beautify.js',
  '/components/libs/clipboard.js',
  '/components/libs/decimal.js',
  '/components/libs/random-color-lib.js',
  '/components/numbers/base-converter.html',
  '/components/numbers/base-converter.js',
  '/components/numbers/digit-generate.html',
  '/components/numbers/digit-generate.js',
  '/components/numbers/digit-worker.js',
  '/components/numbers/random-numbers.html',
  '/components/numbers/random-numbers.js',
  '/components/text/encode-decode.html',
  '/components/text/encode-decode.js',
  '/components/text/lorem-ipsum.html',
  '/components/text/lorem-ipsum.js',
  '/components/text/random-strings.html',
  '/components/text/random-strings.js',
  '/components/text/text-analyses.html',
  '/components/text/text-analyses.js',
  '/components/text/text-beautify.html',
  '/components/text/text-beautify.js',
  '/components/text/wordfreq.js',
  '/components/text/wordfreq.worker.js'
];

FILES.push(...IMAGES, ...COMPONENTS);

self.addEventListener('install', (installEvent) => {
  installEvent.waitUntil(
    caches.open(CACHE_ID).then((cache) => cache.addAll(FILES))
  );
});

addEventListener('activate', (activateEvent) => {
  activateEvent.waitUntil(
    caches.keys().then((keyList) => Promise.all(keyList.map((key) => {
      if (key !== CACHE_ID) {
        return caches.delete(key);
      }

      return false;
    })))
  );
});

self.addEventListener('fetch', (event) => {
  // return the cache
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
      .catch((error) => error)
  );
});
