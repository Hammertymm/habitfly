/* ============================================================
   HabitFly — data layer (store.js)
   All habits + completions live in localStorage under one key.
   Exposes a global `Store` used by app.js.

   Shapes
     Habit       { id, name, schedule[7], colour, type, target, archived, order }
                 schedule = 7 booleans, index 0=Mon … 6=Sun
                 type     = 'binary' | 'multi'
     Completions completions[habitId][ 'YYYY-MM-DD' ] = count   (count >= 1; 0 is never stored)
   ============================================================ */

const Store = (function () {
  'use strict';

  const KEY = 'habitfly.v1';

  // ~8 Fly-family accent colours (card accent only — never the heatmap).
  const PALETTE = [
    '#06f03c', // green
    '#0a84ff', // blue
    '#bf5af2', // purple
    '#ff9f0a', // orange
    '#ff453a', // red
    '#ffd60a', // yellow
    '#30d158', // mint
    '#ff375f'  // pink
  ];

  let corrupt = false;

  function defaultState() {
    return { habits: [], completions: {}, onboarded: false, settings: { theme: 'dark', version: '1.0.0' } };
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return defaultState();
      const s = JSON.parse(raw);
      // Minimal shape guard.
      if (!s || typeof s !== 'object' || !Array.isArray(s.habits)) throw new Error('bad shape');
      if (!s.completions || typeof s.completions !== 'object' || Array.isArray(s.completions)) s.completions = {};
      s.settings = s.settings || { theme: 'dark', version: '1.0.0' };
      return s;
    } catch (e) {
      corrupt = true; // app.js (ISSUE-10) reads this to offer recovery
      return defaultState();
    }
  }

  let state = load();

  /* ---- persistence (ISSUE-10) ---- */
  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      // Non-fatal: keep the in-memory state usable, but surface for diagnostics
      // instead of silently re-running the same failing write.
      console.warn('HabitFly: could not persist data to localStorage.', e);
    }
  }

  /* ---- dates ---- */
  function dateStr(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  }
  function today() { return dateStr(new Date()); }
  // Day-of-week with Monday = 0 … Sunday = 6.
  function weekdayMon0(d) { return (d.getDay() + 6) % 7; }
  function isScheduledOn(habit, d) { return !!habit.schedule[weekdayMon0(d)]; }

  function uuid() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    return 'h-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  }

  /* ---- habits ---- */
  function getHabits(opts) {
    opts = opts || {};
    let list = state.habits.slice();
    if (opts.active) list = list.filter(function (h) { return !h.archived; });
    if (opts.archived) list = list.filter(function (h) { return h.archived; });
    list.sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
    return list;
  }
  function getHabit(id) { return state.habits.find(function (h) { return h.id === id; }); }

  function addHabit(data) {
    const maxOrder = state.habits.reduce(function (m, h) { return Math.max(m, h.order || 0); }, -1);
    const habit = {
      id: uuid(),
      name: (data.name || '').trim(),
      schedule: data.schedule.slice(),
      colour: data.colour,
      type: data.type === 'multi' ? 'multi' : 'binary',
      target: data.type === 'multi' ? Math.max(1, data.target | 0) : 1,
      archived: false,
      order: maxOrder + 1
    };
    state.habits.push(habit);
    save();
    return habit;
  }

  function updateHabit(id, patch) {
    const h = getHabit(id);
    if (!h) return;
    if (patch.name != null) h.name = patch.name.trim();
    if (patch.schedule) h.schedule = patch.schedule.slice();
    if (patch.colour) h.colour = patch.colour;
    if (patch.type) h.type = patch.type === 'multi' ? 'multi' : 'binary';
    if (h.type === 'binary') h.target = 1;
    else if (patch.target != null) h.target = Math.max(1, patch.target | 0);
    // Lowering a multi target below today's count → cap today (PRD §10).
    if (h.type === 'multi') {
      const c = getCount(id, today());
      if (c > h.target) setCount(id, today(), h.target);
    }
    save();
    return h;
  }

  function archiveHabit(id) { const h = getHabit(id); if (h) { h.archived = true; save(); } }
  function restoreHabit(id) {
    const h = getHabit(id);
    if (!h) return;
    h.archived = false;
    const maxOrder = state.habits.reduce(function (m, x) { return Math.max(m, x.order || 0); }, -1);
    h.order = maxOrder + 1; // lands at the bottom (PRD §10)
    save();
  }
  function deleteAllData() { state = defaultState(); save(); }

  function reorder(idsInOrder) {
    idsInOrder.forEach(function (id, i) { const h = getHabit(id); if (h) h.order = i; });
    save();
  }

  /* ---- completions ---- */
  function getCount(habitId, date) {
    const m = state.completions[habitId];
    return (m && m[date]) ? m[date] : 0;
  }
  function setCount(habitId, date, count) {
    if (count <= 0) {
      if (state.completions[habitId]) { delete state.completions[habitId][date]; }
    } else {
      if (!state.completions[habitId]) state.completions[habitId] = {};
      state.completions[habitId][date] = count;
    }
    save();
  }
  function toggleBinary(habitId, date) {
    setCount(habitId, date, getCount(habitId, date) >= 1 ? 0 : 1);
  }
  function incMulti(habitId, date, target) {
    setCount(habitId, date, Math.min(target, getCount(habitId, date) + 1));
  }
  function decMulti(habitId, date) {
    setCount(habitId, date, Math.max(0, getCount(habitId, date) - 1));
  }

  // 'empty' | 'partial' | 'done' for a habit on a date.
  function dayState(habit, date) {
    const c = getCount(habit.id, date);
    if (c <= 0) return 'empty';
    if (habit.type === 'multi' && c < habit.target) return 'partial';
    return 'done';
  }
  function isDoneToday(habit) { return dayState(habit, today()) === 'done'; }

  /* ---- export / import / about ---- */
  function exportJSON() { return JSON.stringify(state, null, 2); }
  function importJSON(text) {
    const s = JSON.parse(text);
    if (!s || !Array.isArray(s.habits)) throw new Error('Not a HabitFly backup');
    if (!s.completions || typeof s.completions !== 'object' || Array.isArray(s.completions)) s.completions = {};
    s.settings = s.settings || { theme: 'dark', version: '1.0.0' };
    state = s;
    save();
  }

  function setOnboarded(v) { state.onboarded = !!v; save(); }
  function isOnboarded() { return !!state.onboarded; }
  function isCorrupt() { return corrupt; }
  function clearCorrupt() { corrupt = false; }
  function count() { return state.habits.length; }

  return {
    PALETTE: PALETTE,
    dateStr: dateStr, today: today, isScheduledOn: isScheduledOn,
    getHabits: getHabits, getHabit: getHabit, addHabit: addHabit, updateHabit: updateHabit,
    archiveHabit: archiveHabit, restoreHabit: restoreHabit, reorder: reorder, deleteAllData: deleteAllData,
    getCount: getCount, setCount: setCount, toggleBinary: toggleBinary, incMulti: incMulti, decMulti: decMulti,
    dayState: dayState, isDoneToday: isDoneToday,
    exportJSON: exportJSON, importJSON: importJSON,
    setOnboarded: setOnboarded, isOnboarded: isOnboarded, isCorrupt: isCorrupt, clearCorrupt: clearCorrupt, count: count
  };
})();
