/**
 * PRISMA — Service Worker Registration (js/sw-register.js)
 * Registers sw.js and handles page reload on controller change.
 */

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => console.error('SW error', err));
  });
  let refreshing = false;
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    if (hadController) {
      window.location.reload();
    }
  });
}
