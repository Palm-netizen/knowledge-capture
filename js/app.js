// js/app.js — App router & init (Knowledge Capture)

const PAGE_INIT = {
  calendar: initCalendar,
  dashboard: loadDashboard,
  review: initReview,
  search: initSearch,
  connections: initConnections,
  mindmap: initMindmap,
  friends: initFriends
};

// Re-entrant refresh for a page that's already initialized (listeners
// already attached) — used both when revisiting a tab and after an
// อ่าน/ฟัง mode switch, so we never re-run PAGE_INIT and double up
// event listeners.
const PAGE_REFRESH = {
  calendar: renderCalendar,
  dashboard: loadDashboard,
  review: () => loadReviewContent(reviewActiveDays),
  connections: loadTagConnections,
  mindmap: renderMindmap,
  friends: loadFriends,
  search: () => {
    document.getElementById('search-input').value = '';
    document.getElementById('search-results').innerHTML = '';
  }
};

const initialized = new Set();

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.bottom-nav a').forEach(a => a.classList.remove('active'));

  document.getElementById(`page-${pageId}`).classList.add('active');
  document.getElementById(`nav-${pageId}`).classList.add('active');

  window.scrollTo(0, 0);

  if (!initialized.has(pageId)) {
    PAGE_INIT[pageId]?.();
    initialized.add(pageId);
  } else {
    PAGE_REFRESH[pageId]?.();
  }

  location.hash = pageId;
}

// ---- Theme (dark / light) -----------------------------------------

const THEME_KEY = 'kc-theme';

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'dark' || saved === 'light') {
    document.documentElement.setAttribute('data-theme', saved);
  }
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
}

function toggleTheme() {
  const root = document.documentElement;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const current = root.getAttribute('data-theme') || (prefersDark ? 'dark' : 'light');
  const next = current === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  localStorage.setItem(THEME_KEY, next);
  refreshActivePageVisuals();
}

// Canvas-drawn content (Chart.js, Mind Map) doesn't repaint on CSS
// changes by itself, so re-render it right after a theme switch.
function refreshActivePageVisuals() {
  const activeEl = document.querySelector('.page.active');
  const pageId = activeEl?.id.replace('page-', '');
  if (pageId === 'mindmap') renderMindmap();
  else if (pageId === 'dashboard') loadDashboard();
}

// ---- Mode (อ่าน / ฟัง) ----------------------------------------------

function applyModeLabels() {
  const meta = modeMeta();
  document.getElementById('app-subtitle').textContent = meta.appSubtitle;
  document.getElementById('logo-mark-icon').innerHTML = iconSVG(meta.icon, 22);
  document.getElementById('calendar-title-text').textContent = meta.calendarTitle;
  document.getElementById('calendar-sub-text').textContent = meta.calendarSub;
  document.getElementById('dashboard-sub-text').textContent = meta.dashboardSub;
  document.getElementById('dash-books-icon').innerHTML = iconSVG(meta.icon, 20);
  document.getElementById('dash-books-label').textContent = meta.dashboardCountLabel;
  document.getElementById('dash-books-unit').textContent = meta.dashboardUnit;
  document.getElementById('search-sub-text').textContent = meta.searchSub;
  document.getElementById('connections-sub-text').textContent = meta.connectionsSub;
  document.getElementById('mindmap-sub-text').textContent = meta.mindmapSub;
  document.getElementById('mindmap-legend-leaf').textContent = meta.mindmapLeafLegend;
  document.getElementById('day-modal-cta').textContent = meta.dayModalCta;
  document.getElementById('title-field-icon').innerHTML = iconSVG(meta.icon, 14);
  document.getElementById('title-field-label').textContent = meta.titleFieldLabel;
  document.getElementById('date-field-label').textContent = meta.dateFieldLabel;
  document.getElementById('highlights-field-label').textContent = meta.highlightsFieldLabel;
  document.getElementById('entry-book').placeholder = meta.titlePlaceholder;

  document.querySelectorAll('.mode-switch-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === getCurrentMode());
  });
}

function initModeSwitch() {
  applyModeLabels();
  document.querySelectorAll('.mode-switch-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;
      if (mode === getCurrentMode()) return;
      setCurrentMode(mode);
      applyModeLabels();

      // Refresh every tab that's already been visited — its data (and
      // in the mindmap/calendar's case, canvas labels) depends on the
      // mode. `initialized` is only read here, never touched: clearing
      // it would make a later visit re-run PAGE_INIT, which for
      // calendar/search/mindmap re-attaches listeners to DOM nodes
      // that already have one, double-firing every click afterward.
      initialized.forEach(pageId => PAGE_REFRESH[pageId]?.());
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const today = new Date();
  document.getElementById('nav-date').textContent = today.toLocaleDateString('th-TH', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  initTheme();
  initModeSwitch();

  document.querySelectorAll('.bottom-nav a').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      showPage(a.dataset.page);
    });
  });

  const hash = location.hash.replace('#', '');
  showPage(PAGE_INIT[hash] ? hash : 'calendar');
});
