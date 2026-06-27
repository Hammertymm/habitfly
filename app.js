/* ============================================================
   HabitFly — app entry (ISSUE-00)
   Job for this slice: switch between the 3 tab views, and
   register the service worker so the app works fully offline.
   ============================================================ */

(function () {
  'use strict';

  /* ---- Tab switching ----
     Each tab button has data-view="today|habits|settings".
     We show the matching <section id="view-..."> and hide the rest. */
  const tabs = document.querySelectorAll('.tab');
  const views = document.querySelectorAll('.view');

  function showView(name) {
    views.forEach(function (view) {
      const isMatch = view.id === 'view-' + name;
      view.classList.toggle('is-active', isMatch);
      // `hidden` keeps it out of the accessibility tree too.
      if (isMatch) {
        view.removeAttribute('hidden');
      } else {
        view.setAttribute('hidden', '');
      }
    });

    tabs.forEach(function (tab) {
      const isMatch = tab.dataset.view === name;
      tab.classList.toggle('is-active', isMatch);
      if (isMatch) {
        tab.setAttribute('aria-current', 'page');
      } else {
        tab.removeAttribute('aria-current');
      }
    });
  }

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      showView(tab.dataset.view);
    });
  });

  /* ---- Service worker (offline) ----
     Registering sw.js lets the browser serve the cached app
     shell when there's no network. */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function (err) {
        // Non-fatal: the app still runs online if registration fails.
        console.warn('Service worker registration failed:', err);
      });
    });
  }
})();
