// js/app.js — App router & init (Knowledge Capture)

const PAGE_INIT = {
  calendar: initCalendar,
  dashboard: loadDashboard,
  review: initReview,
  search: initSearch,
  connections: initConnections,
  mindmap: initMindmap
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
  } else if (pageId === 'dashboard') {
    loadDashboard();
  } else if (pageId === 'calendar') {
    renderCalendar();
  } else if (pageId === 'review') {
    loadReviewContent(reviewActiveDays);
  } else if (pageId === 'connections') {
    loadTagConnections();
  } else if (pageId === 'mindmap') {
    renderMindmap();
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

document.addEventListener('DOMContentLoaded', () => {
  const today = new Date();
  document.getElementById('nav-date').textContent = today.toLocaleDateString('th-TH', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  initTheme();

  document.querySelectorAll('.bottom-nav a').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      showPage(a.dataset.page);
    });
  });

  const hash = location.hash.replace('#', '');
  showPage(PAGE_INIT[hash] ? hash : 'calendar');
});
