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
  function cardHTML(habit, opts) {
    opts = opts || {};
    const done = Store.isDoneToday(habit);
    const partial = Store.dayState(habit, Store.today()) === 'partial';
    const accent = esc(habit.colour);
    const multi = habit.type === 'multi';
    const btnState = done ? 'is-done' : (partial ? 'is-partial' : '');
    return '' +
      '<article class="card" data-habit="' + habit.id + '" data-multi="' + (multi ? 1 : 0) + '">' +
        '<div class="card-head">' +
          (opts.handle ? '<span class="drag-handle" aria-label="Reorder">⠿</span>' : '') +
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
  function emptyHabits(msg) {
    return '<div class="placeholder-card"><p class="placeholder-text">' + msg + '</p></div>';
  }
  function archivedRowHTML(habit) {
    return '<div class="arch-row">' +
      '<span class="habit-dot" style="background:' + esc(habit.colour) + '"></span>' +
      '<span class="habit-name">' + esc(habit.name) + '</span>' +
      '<button class="restore-btn" type="button" data-id="' + habit.id + '">Restore</button>' +
      '</div>';
  }
  function renderHabits() {
    const host = $('#view-habits .view-body');
    const seg = App.habitsSeg || 'active';
    let html = '<div class="seg habits-seg">' +
      '<button class="seg-btn' + (seg === 'active' ? ' on' : '') + '" data-seg="active">Active</button>' +
      '<button class="seg-btn' + (seg === 'archived' ? ' on' : '') + '" data-seg="archived">Archived</button>' +
      '</div>';
    if (seg === 'active') {
      const list = Store.getHabits({ active: true });
      if (list.length >= 40) html += '<div class="scale-note">You have a lot of habits — consider archiving ones you no longer track.</div>';
      html += list.length
        ? '<div class="habit-list">' + list.map(function (h) { return cardHTML(h, { handle: true }); }).join('') + '</div>'
        : emptyHabits('No habits yet. Tap + to add one.');
    } else {
      const list = Store.getHabits({ archived: true });
      html += list.length
        ? '<div class="archived-list">' + list.map(archivedRowHTML).join('') + '</div>'
        : emptyHabits('No archived habits.');
    }
    host.innerHTML = html;
  }

  /* ---------- Settings (ISSUE-08) ---------- */
  function renderSettings() {
    const host = $('#view-settings .view-body');
    host.innerHTML =
      '<div class="settings-group">' +
        '<button class="settings-row" data-act="export">Export data</button>' +
        '<button class="settings-row" data-act="import">Import data</button>' +
        '<button class="settings-row danger" data-act="delete-all">Delete all data</button>' +
      '</div>' +
      '<div class="about">' +
        '<img class="about-logo" src="habitfly_logo.png" alt="" />' +
        '<div class="about-name">Habit<span class="wordmark-accent">Fly</span></div>' +
        '<div class="about-tag">Habits anywhere. Simple.</div>' +
        '<div class="about-ver">Version 1.0.0</div>' +
      '</div>';
  }

  function downloadBackup() {
    const blob = new Blob([Store.exportJSON()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'habitfly-backup-' + Store.today() + '.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }
  function doImport(file) {
    const reader = new FileReader();
    reader.onload = function () {
      try {
        if (!confirm('Replace all current data with this backup?')) return;
        Store.importJSON(String(reader.result));
        Store.clearCorrupt();
        const rec = document.getElementById('recovery');
        if (rec) rec.remove();
        render();
        alert('Backup imported.');
      } catch (e) { alert('Could not import: ' + e.message); }
    };
    reader.readAsText(file);
  }

  /* ---------- onboarding + recovery (ISSUE-09 / ISSUE-10) ---------- */
  function showOnboarding() {
    const el = document.createElement('div');
    el.className = 'onboarding'; el.id = 'onboarding';
    el.innerHTML =
      '<div class="onb-inner">' +
        '<img class="onb-logo" src="habitfly_logo.png" alt="" />' +
        '<div class="onb-word">Habit<span class="wordmark-accent">Fly</span></div>' +
        '<div class="onb-tag">Habits anywhere. Simple.</div>' +
        '<button class="onb-cta" type="button">Create your first habit</button>' +
      '</div>';
    document.body.appendChild(el);
  }
  function showRecovery() {
    const el = document.createElement('div');
    el.className = 'onboarding'; el.id = 'recovery';
    el.innerHTML =
      '<div class="onb-inner">' +
        '<div class="onb-word">Couldn’t read your data</div>' +
        '<div class="onb-tag">Your saved data looks corrupted. Restore from a backup, or start fresh.</div>' +
        '<button class="onb-cta" type="button" data-rec="import">Import a backup</button>' +
        '<button class="onb-secondary" type="button" data-rec="fresh">Start fresh</button>' +
      '</div>';
    document.body.appendChild(el);
  }

  function emptyStateHTML() {
    return '<div class="empty-state"><p class="empty-title">No habits yet</p>' +
      '<p class="empty-sub">Tap + to add your first one.</p></div>';
  }

  function render() {
    if (App.tab === 'today') renderToday();
    else if (App.tab === 'habits') renderHabits();
    else if (App.tab === 'settings') renderSettings();
  }
  function openEdit(id) { const h = Store.getHabit(id); if (h) openScreen(habitFormScreen(h)); }

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
    const before = Store.getCount(h.id, Store.today());
    if (h.type === 'multi') Store.incMulti(h.id, Store.today(), h.target);
    else Store.toggleBinary(h.id, Store.today());
    render();                                   // rebuild list/ordering first…
    if (Store.getCount(h.id, Store.today()) !== before) popCard(habitId); // …only animate a real change
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
      '<form class="habit-form" data-id="' + (editing ? habit.id : '') + '" data-colour="' + esc(model.colour) + '" autocomplete="off">' +
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
    const selectedSwatch = form.querySelector('.swatch.on');
    const colour = selectedSwatch ? selectedSwatch.dataset.colour : (form.dataset.colour || Store.PALETTE[0]);
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

  /* ---------- heatmap detail + backdating (ISSUE-05) ---------- */
  function fmtDate(date) {
    const d = new Date(date + 'T12:00:00');
    return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
  }
  function detailScreen(habit) {
    return '' +
      '<header class="screen-head">' +
        '<button class="screen-back" type="button">‹ Back</button>' +
        '<span class="screen-title">' + esc(habit.name) + '</span>' +
        '<button class="screen-edit" type="button" data-id="' + habit.id + '">Edit</button>' +
      '</header>' +
      '<div class="detail-body">' +
        '<p class="detail-hint">Tap a day to add or remove it.</p>' +
        '<div id="detail-hm">' + heatmapHTML(habit, { big: true, interactive: true }) + '</div>' +
      '</div>';
  }
  function openDetail(id) {
    const h = Store.getHabit(id);
    if (!h) return;
    App.detailId = id;
    openScreen(detailScreen(h));
  }
  function refreshDetail() {
    const h = App.detailId && Store.getHabit(App.detailId);
    const host = $('#detail-hm');
    if (h && host) host.innerHTML = heatmapHTML(h, { big: true, interactive: true });
  }
  function handleDayEdit(habitId, date) {
    const h = Store.getHabit(habitId);
    if (!h) return;
    if (h.type === 'binary') { Store.toggleBinary(habitId, date); refreshDetail(); render(); }
    else openDayPop(habitId, date);
  }
  function openDayPop(habitId, date) {
    closeDayPop(); // never stack two popovers (e.g. rapid double-tap)
    const h = Store.getHabit(habitId);
    const c = Store.getCount(habitId, date);
    const pop = document.createElement('div');
    pop.className = 'daypop-backdrop';
    pop.innerHTML =
      '<div class="daypop">' +
        '<div class="daypop-date">' + fmtDate(date) + '</div>' +
        '<div class="stepper"><button type="button" class="dp-down">–</button>' +
        '<span class="dp-val">' + c + '</span>' +
        '<button type="button" class="dp-up">+</button></div>' +
        '<div class="dp-target">of ' + h.target + '</div>' +
        '<button type="button" class="dp-done">Done</button>' +
      '</div>';
    document.body.appendChild(pop);
    App.dayPop = { habitId: habitId, date: date };
  }
  function closeDayPop() {
    const p = document.querySelector('.daypop-backdrop');
    if (p) p.remove();
    App.dayPop = null;
  }

  /* ---------- global event handling ---------- */
  let pressTimer = null, didLongPress = false;

  document.addEventListener('click', function (e) {
    const t = e.target;

    // a swipe/drag just happened on this element — swallow the click
    if (App._gestureGuard && App._gestureGuard()) return;

    // onboarding / recovery overlay buttons
    const onb = t.closest && t.closest('.onb-cta, .onb-secondary');
    if (onb) {
      if (onb.dataset.rec === 'import') { document.getElementById('import-file').click(); return; }
      if (onb.dataset.rec === 'fresh') {
        Store.deleteAllData(); Store.clearCorrupt();
        const r = document.getElementById('recovery'); if (r) r.remove();
        render(); return;
      }
      // plain onboarding CTA → create first habit
      Store.setOnboarded(true);
      const o = document.getElementById('onboarding'); if (o) o.remove();
      openScreen(habitFormScreen(null));
      return;
    }

    // tab bar
    const tab = t.closest && t.closest('.tab');
    if (tab) { showTab(tab.dataset.view); return; }

    // FAB → create
    if (t.closest && t.closest('.fab')) { openScreen(habitFormScreen(null)); return; }

    // screen header
    if (t.closest && t.closest('.screen-cancel')) { closeScreen(); return; }
    if (t.closest && t.closest('.screen-save')) { saveForm(); return; }
    if (t.closest && t.closest('.screen-back')) { App.detailId = null; closeScreen(); return; }
    if (t.closest && t.closest('.screen-edit')) {
      const h = Store.getHabit(t.closest('.screen-edit').dataset.id);
      if (h) openScreen(habitFormScreen(h));
      return;
    }

    // day popover (multi-count backdating)
    if (t.closest && t.closest('.daypop')) {
      if (t.closest('.dp-up') || t.closest('.dp-down')) {
        const h = Store.getHabit(App.dayPop.habitId);
        const cur = Store.getCount(App.dayPop.habitId, App.dayPop.date);
        const next = t.closest('.dp-up') ? Math.min(h.target, cur + 1) : Math.max(0, cur - 1);
        Store.setCount(App.dayPop.habitId, App.dayPop.date, next);
        $('.dp-val').textContent = next;
        refreshDetail(); render();
      } else if (t.closest('.dp-done')) {
        closeDayPop();
      }
      return;
    }
    if (t.classList && t.classList.contains('daypop-backdrop')) { closeDayPop(); return; }

    // interactive heatmap cell (detail screen) → backdate
    const bigCell = t.closest && t.closest('.heatmap-big .hm-cell');
    if (bigCell) { handleDayEdit(bigCell.closest('.heatmap').dataset.habit, bigCell.dataset.date); return; }

    // Habits segmented control
    const segTab = t.closest && t.closest('.seg-btn[data-seg]');
    if (segTab) { App.habitsSeg = segTab.dataset.seg; renderHabits(); return; }

    // Restore archived habit
    const restore = t.closest && t.closest('.restore-btn');
    if (restore) { Store.restoreHabit(restore.dataset.id); renderHabits(); return; }

    // Settings actions
    const sRow = t.closest && t.closest('.settings-row');
    if (sRow) {
      const act = sRow.dataset.act;
      if (act === 'export') downloadBackup();
      else if (act === 'import') $('#import-file').click();
      else if (act === 'delete-all') {
        if (confirm('Delete ALL habits and history? This cannot be undone.')) { Store.deleteAllData(); App.habitsSeg = 'active'; showTab('today'); }
      }
      return;
    }

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

    // tap card body (not the check button) → expand heatmap for backdating
    const cardEl = t.closest && t.closest('.card');
    if (cardEl) { openDetail(cardEl.dataset.habit); return; }
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

  // import file chosen
  document.addEventListener('change', function (e) {
    if (e.target && e.target.id === 'import-file' && e.target.files[0]) {
      doImport(e.target.files[0]);
      e.target.value = '';
    }
  });

  /* ---------- Habits tab: swipe (archive/edit) + drag reorder (ISSUE-07) ---------- */
  let gesture = null, justGestured = false;
  document.addEventListener('pointerdown', function (e) {
    if (App.tab !== 'habits' || (App.habitsSeg || 'active') !== 'active') return;
    const card = e.target.closest && e.target.closest('.habit-list .card');
    if (!card || e.target.closest('.check-btn')) return;
    const onHandle = !!e.target.closest('.drag-handle');
    gesture = { card: card, id: card.dataset.habit, x: e.clientX, y: e.clientY, mode: onHandle ? 'drag' : null, moved: false };
    if (onHandle) card.classList.add('dragging');
  });
  document.addEventListener('pointermove', function (e) {
    if (!gesture) return;
    const dx = e.clientX - gesture.x, dy = e.clientY - gesture.y;
    if (gesture.mode === null) {
      if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) gesture.mode = 'swipe';
      else if (Math.abs(dy) > 10) { gesture = null; return; } // vertical scroll
      else return;
    }
    if (gesture.mode === 'swipe') {
      gesture.moved = true;
      gesture.card.style.transition = 'none';
      gesture.card.style.transform = 'translateX(' + dx + 'px)';
      gesture.card.classList.toggle('swipe-archive', dx < -40);
      gesture.card.classList.toggle('swipe-edit', dx > 40);
    } else if (gesture.mode === 'drag') {
      gesture.moved = true;
      gesture.card.style.opacity = '0.7';
      const container = gesture.card.parentNode;
      const sibs = Array.prototype.slice.call(container.querySelectorAll('.card')).filter(function (c) { return c !== gesture.card; });
      const after = sibs.find(function (s) { const r = s.getBoundingClientRect(); return e.clientY < r.top + r.height / 2; });
      if (after) container.insertBefore(gesture.card, after); else container.appendChild(gesture.card);
    }
  });
  document.addEventListener('pointerup', function (e) {
    if (!gesture) return;
    const g = gesture; gesture = null;
    if (g.mode === 'swipe') {
      const dx = e.clientX - g.x;
      g.card.style.transition = 'transform 0.2s ease';
      g.card.classList.remove('swipe-archive', 'swipe-edit');
      if (dx < -80) { justGestured = true; Store.archiveHabit(g.id); renderHabits(); }
      else if (dx > 80) { justGestured = true; openEdit(g.id); }
      else { g.card.style.transform = ''; }
    } else if (g.mode === 'drag') {
      g.card.classList.remove('dragging'); g.card.style.opacity = '';
      const ids = Array.prototype.slice.call(g.card.parentNode.querySelectorAll('.card')).map(function (c) { return c.dataset.habit; });
      Store.reorder(ids);
      justGestured = true;
    }
    if (g.moved) justGestured = true;
  });
  App._gestureGuard = function () { if (justGestured) { justGestured = false; return true; } return false; };

  // Each NEW pointer interaction clears stale guard flags, so a flag set by a
  // gesture that produced no click (a drag, or a long-press with no trailing
  // click) can't swallow a later, unrelated tap. Capture phase = runs first.
  document.addEventListener('pointerdown', function () {
    justGestured = false;
    didLongPress = false;
  }, true);

  /* ---------- service worker ---------- */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    });
  }

  /* ---------- boot ---------- */
  function boot() {
    showTab('today');
    if (Store.isCorrupt()) { showRecovery(); return; }
    if (!Store.isOnboarded() && Store.count() === 0) showOnboarding();
  }
  window.HabitFly = { render: render, showTab: showTab, showOnboarding: showOnboarding };
  document.addEventListener('DOMContentLoaded', boot);
})();
