/* ============================================================
   HabitFly — app controller (app.js)
   Renders the tabs, the habit cards (check button + heatmap),
   and the create/edit + heatmap-detail screens. Uses Store.
   ============================================================ */

(function () {
  'use strict';

  const HEATMAP_DAYS = 112; // 16 weeks, ~4 rows × 28
  const LONG_PRESS_MS = 450;

  const App = { tab: 'today' };

  /* ---------- tiny helpers ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function reducedMotion() { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }

  /* ---------- tab switching ---------- */
  function showTab(name) {
    App.tab = name;
    document.body.setAttribute('data-tab', name);
    document.querySelectorAll('.view').forEach(function (v) {
      const match = v.id === 'view-' + name;
      v.classList.toggle('is-active', match);
      if (match) v.removeAttribute('hidden'); else v.setAttribute('hidden', '');
    });
    document.querySelectorAll('.tab').forEach(function (t) {
      const match = t.dataset.view === name;
      t.classList.toggle('is-active', match);
      if (match) t.setAttribute('aria-current', 'page'); else t.removeAttribute('aria-current');
    });
    render();
  }

  /* ---------- heatmap ---------- */
  function lastDates(n) {
    const out = [];
    const d = new Date();
    d.setHours(12, 0, 0, 0); // avoid DST edge wobble
    for (let i = n - 1; i >= 0; i--) {
      const x = new Date(d);
      x.setDate(d.getDate() - i);
      out.push(Store.dateStr(x));
    }
    return out;
  }
  function heatmapHTML(habit, opts) {
    opts = opts || {};
    const today = Store.today();
    const cells = lastDates(HEATMAP_DAYS).map(function (date) {
      const st = Store.dayState(habit, date); // empty|partial|done
      const isToday = date === today;
      return '<i class="hm-cell hm-' + st + (isToday ? ' hm-today' : '') +
        '" data-date="' + date + '"' + (opts.interactive ? ' role="button"' : '') + '></i>';
    }).join('');
    return '<div class="heatmap' + (opts.big ? ' heatmap-big' : '') + '" data-habit="' + habit.id + '">' + cells + '</div>';
  }

  /* ---------- habit card ---------- */
  function checkLabel(habit) {
    if (habit.type === 'multi') {
      const c = Store.getCount(habit.id, Store.today());
      return c + '/' + habit.target;
    }
    return '';
  }
  function cardHTML(habit) {
    const done = Store.isDoneToday(habit);
    const partial = Store.dayState(habit, Store.today()) === 'partial';
    const accent = esc(habit.colour);
    const multi = habit.type === 'multi';
    const btnState = done ? 'is-done' : (partial ? 'is-partial' : '');
    return '' +
      '<article class="card" data-habit="' + habit.id + '" data-multi="' + (multi ? 1 : 0) + '">' +
        '<div class="card-head">' +
          '<span class="habit-dot" style="background:' + accent + '"></span>' +
          '<span class="habit-name">' + esc(habit.name) + '</span>' +
          (multi ? '<span class="habit-count">' + checkLabel(habit) + '</span>' : '') +
          '<button class="check-btn ' + btnState + '" type="button" data-habit="' + habit.id + '" ' +
            'style="--accent:' + accent + '" aria-label="Complete ' + esc(habit.name) + '">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 13l4 4L19 7" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
          '</button>' +
        '</div>' +
        heatmapHTML(habit) +
      '</article>';
  }

  /* ---------- Today ---------- */
  function renderToday() {
    const host = $('#view-today .view-body');
    const todayDate = new Date();
    let list = Store.getHabits({ active: true }).filter(function (h) {
      return Store.isScheduledOn(h, todayDate);
    });
    // Incomplete first; completed slide directly below the last undone (stable).
    list = list.map(function (h, i) { return { h: h, i: i, done: Store.isDoneToday(h) }; })
               .sort(function (a, b) { return (a.done - b.done) || (a.i - b.i); })
               .map(function (x) { return x.h; });

    if (Store.count() === 0) {
      host.innerHTML = emptyStateHTML();
      return;
    }
    if (list.length === 0) {
      host.innerHTML = '<div class="placeholder-card"><p class="placeholder-text">Nothing scheduled for today.</p></div>';
      return;
    }
    host.innerHTML = list.map(cardHTML).join('');
  }

  /* ---------- Habits ---------- */
  function renderHabits() {
    const host = $('#view-habits .view-body');
    const list = Store.getHabits({ active: true });
    if (list.length === 0) {
      host.innerHTML = '<div class="placeholder-card"><p class="placeholder-text">No habits yet. Tap + to add one.</p></div>';
      return;
    }
    host.innerHTML = list.map(cardHTML).join('');
  }

  function emptyStateHTML() {
    return '<div class="empty-state"><p class="empty-title">No habits yet</p>' +
      '<p class="empty-sub">Tap + to add your first one.</p></div>';
  }

  function render() {
    if (App.tab === 'today') renderToday();
    else if (App.tab === 'habits') renderHabits();
    // settings is static for now
  }

  /* ---------- completion feedback ---------- */
  function popCard(habitId) {
    if (reducedMotion()) return;
    const card = document.querySelector('.card[data-habit="' + habitId + '"]');
    if (!card) return;
    card.classList.remove('pop');
    void card.offsetWidth; // restart animation
    card.classList.add('pop');
    setTimeout(function () { card.classList.remove('pop'); }, 200);
  }

  function completeToday(habitId) {
    const h = Store.getHabit(habitId);
    if (!h) return;
    if (h.type === 'multi') Store.incMulti(h.id, Store.today(), h.target);
    else Store.toggleBinary(h.id, Store.today());
    render();          // rebuild list/ordering first…
    popCard(habitId);  // …then animate the freshly rendered card
  }
  function undoMultiToday(habitId) {
    const h = Store.getHabit(habitId);
    if (!h || h.type !== 'multi') return;
    Store.decMulti(h.id, Store.today());
    render();
  }

  /* ---------- screens (create) ---------- */
  function dayToggleRow(schedule) {
    const labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    return '<div class="day-row" role="group" aria-label="Schedule">' + labels.map(function (l, i) {
      return '<button type="button" class="day-toggle' + (schedule[i] ? ' on' : '') + '" data-day="' + i + '">' + l + '</button>';
    }).join('') + '</div>';
  }
  function swatchRow(selected) {
    return '<div class="swatch-row" role="group" aria-label="Colour">' + Store.PALETTE.map(function (c) {
      return '<button type="button" class="swatch' + (c === selected ? ' on' : '') + '" data-colour="' + c + '" style="background:' + c + '" aria-label="' + c + '"></button>';
    }).join('') + '</div>';
  }

  function openScreen(html) {
    const root = $('#screen');
    root.innerHTML = html;
    root.classList.add('open');
    document.body.classList.add('screen-open');
  }
  function closeScreen() {
    const root = $('#screen');
    root.classList.remove('open');
    root.innerHTML = '';
    document.body.classList.remove('screen-open');
  }

  function habitFormScreen(habit) {
    const editing = !!habit;
    const model = habit || { name: '', schedule: [true, true, true, true, true, true, true], colour: Store.PALETTE[0], type: 'binary', target: 3 };
    return '' +
      '<header class="screen-head">' +
        '<button class="screen-cancel" type="button">Cancel</button>' +
        '<span class="screen-title">' + (editing ? 'Edit habit' : 'New habit') + '</span>' +
        '<button class="screen-save" type="button">Save</button>' +
      '</header>' +
      '<form class="habit-form" data-id="' + (editing ? habit.id : '') + '" autocomplete="off">' +
        '<label class="field-label">Name</label>' +
        '<input class="text-input" name="name" placeholder="e.g. Meditate" value="' + esc(model.name) + '" />' +
        '<label class="field-label">Schedule</label>' +
        dayToggleRow(model.schedule) +
        '<label class="field-label">Colour</label>' +
        swatchRow(model.colour) +
        '<label class="field-label">How often</label>' +
        '<div class="seg type-seg">' +
          '<button type="button" class="seg-btn' + (model.type === 'binary' ? ' on' : '') + '" data-type="binary">Once daily</button>' +
          '<button type="button" class="seg-btn' + (model.type === 'multi' ? ' on' : '') + '" data-type="multi">Multiple times</button>' +
        '</div>' +
        '<div class="target-field" ' + (model.type === 'multi' ? '' : 'hidden') + '>' +
          '<label class="field-label">Target per day</label>' +
          '<div class="stepper"><button type="button" class="step-down">–</button>' +
          '<span class="step-val">' + (model.target || 3) + '</span>' +
          '<button type="button" class="step-up">+</button></div>' +
        '</div>' +
      '</form>';
  }

  function readForm() {
    const form = $('.habit-form');
    const name = form.querySelector('input[name="name"]').value.trim();
    const schedule = Array.from(form.querySelectorAll('.day-toggle')).map(function (b) { return b.classList.contains('on'); });
    const colour = (form.querySelector('.swatch.on') || {}).dataset ? form.querySelector('.swatch.on').dataset.colour : Store.PALETTE[0];
    const type = form.querySelector('.seg-btn.on').dataset.type;
    const target = parseInt(form.querySelector('.step-val').textContent, 10) || 1;
    return { id: form.dataset.id, name: name, schedule: schedule, colour: colour, type: type, target: target };
  }

  function saveForm() {
    const data = readForm();
    if (!data.name) { const i = $('.habit-form input[name="name"]'); i.classList.add('err'); i.focus(); return; }
    if (!data.schedule.some(Boolean)) data.schedule = [true, true, true, true, true, true, true];
    if (data.id) Store.updateHabit(data.id, data);
    else Store.addHabit(data);
    closeScreen();
    render();
  }

  /* ---------- global event handling ---------- */
  let pressTimer = null, didLongPress = false;

  document.addEventListener('click', function (e) {
    const t = e.target;

    // tab bar
    const tab = t.closest && t.closest('.tab');
    if (tab) { showTab(tab.dataset.view); return; }

    // FAB → create
    if (t.closest && t.closest('.fab')) { openScreen(habitFormScreen(null)); return; }

    // screen header
    if (t.closest && t.closest('.screen-cancel')) { closeScreen(); return; }
    if (t.closest && t.closest('.screen-save')) { saveForm(); return; }

    // form: day toggle / swatch / type / stepper
    const day = t.closest && t.closest('.day-toggle');
    if (day) { day.classList.toggle('on'); return; }
    const sw = t.closest && t.closest('.swatch');
    if (sw) { document.querySelectorAll('.swatch').forEach(function (s) { s.classList.remove('on'); }); sw.classList.add('on'); return; }
    const seg = t.closest && t.closest('.seg-btn[data-type]');
    if (seg) {
      document.querySelectorAll('.seg-btn[data-type]').forEach(function (s) { s.classList.remove('on'); });
      seg.classList.add('on');
      const tf = $('.target-field');
      if (tf) { if (seg.dataset.type === 'multi') tf.removeAttribute('hidden'); else tf.setAttribute('hidden', ''); }
      return;
    }
    if (t.closest && t.closest('.step-up')) { const v = $('.step-val'); v.textContent = Math.min(99, (+v.textContent) + 1); return; }
    if (t.closest && t.closest('.step-down')) { const v = $('.step-val'); v.textContent = Math.max(1, (+v.textContent) - 1); return; }

    // check button (skip if a long-press just fired)
    const check = t.closest && t.closest('.check-btn');
    if (check) {
      if (didLongPress) { didLongPress = false; return; }
      completeToday(check.dataset.habit);
      return;
    }
  });

  // long-press on multi check button = −1
  document.addEventListener('pointerdown', function (e) {
    const check = e.target.closest && e.target.closest('.check-btn');
    if (!check) return;
    const card = check.closest('.card');
    if (!card || card.dataset.multi !== '1') return;
    didLongPress = false;
    pressTimer = setTimeout(function () {
      didLongPress = true;
      undoMultiToday(check.dataset.habit);
    }, LONG_PRESS_MS);
  });
  function cancelPress() { if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; } }
  document.addEventListener('pointerup', cancelPress);
  document.addEventListener('pointercancel', cancelPress);
  document.addEventListener('pointerleave', cancelPress, true);

  /* ---------- service worker ---------- */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    });
  }

  /* ---------- boot ---------- */
  window.HabitFly = { render: render, showTab: showTab };
  document.addEventListener('DOMContentLoaded', function () { showTab('today'); });
})();
