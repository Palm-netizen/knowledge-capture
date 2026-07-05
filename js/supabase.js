// js/supabase.js — Supabase client config (Knowledge Capture — แยกอิสระจาก VegFarm)
// แก้ SUPABASE_URL และ SUPABASE_ANON_KEY ให้ตรงกับโปรเจกต์ Supabase ของแอปนี้ (คนละโปรเจกต์กับ VegFarm)

const SUPABASE_URL = 'https://YOUR_KC_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_KC_ANON_KEY_HERE';

const PHOTO_BUCKET = 'knowledge-photos';
const PRESET_TAGS = ['ธุรกิจ', 'การเงิน', 'จิตวิทยา', 'สุขภาพ'];

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ---- Helpers -------------------------------------------------

function formatDateTH(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
}

function todayStr() {
  return toDateStr(new Date());
}

function toDateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDaysToDate(dateStr, days) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return toDateStr(d);
}

function daysAgoStr(days) {
  return addDaysToDate(todayStr(), -days);
}

// Seeded pseudo-random (deterministic per string, e.g. per day) — for Quote of the Day
function seededRandom(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  return () => {
    h = (Math.imul(h ^ (h >>> 15), 1 | h) + 0x6d2b79f5) | 0;
    let t = Math.imul(h ^ (h >>> 7), 61 | h);
    t = (t ^ (t >>> 14)) >>> 0;
    return t / 4294967296;
  };
}

function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.className = `toast toast-${type} show`;
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function setLoading(show) {
  const loader = document.getElementById('loader');
  if (loader) loader.style.display = show ? 'flex' : 'none';
}

function escapeHTML(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

// Reads a CSS custom property from :root — used so canvas-drawn content
// (Chart.js, Mind Map) follows the current light/dark theme.
function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

// Richer empty-state block with optional title/sub/CTA button.
function emptyStateHTML({ icon = '📖', title = '', sub = '', ctaLabel = '', ctaOnClick = '' } = {}) {
  return `
    <div class="empty-state">
      <div class="empty-icon">${icon}</div>
      ${title ? `<div class="empty-title">${escapeHTML(title)}</div>` : ''}
      ${sub ? `<div class="empty-sub">${escapeHTML(sub)}</div>` : ''}
      ${ctaLabel ? `<button type="button" class="btn btn-primary empty-cta" onclick="${ctaOnClick}">${escapeHTML(ctaLabel)}</button>` : ''}
    </div>
  `;
}

// Skeleton placeholder cards shown while a list of notes/results is loading.
function skeletonNoteCardsHTML(n = 2) {
  return Array.from({ length: n }).map(() => `
    <div class="skeleton-card">
      <div class="skeleton-block skeleton-line-title"></div>
      <div class="skeleton-block skeleton-line"></div>
      <div class="skeleton-block skeleton-line short"></div>
      <div class="skeleton-block skeleton-line shorter"></div>
    </div>
  `).join('');
}

function starsHTML(level, max = 5) {
  let out = '';
  for (let i = 1; i <= max; i++) out += i <= level ? '★' : '☆';
  return out;
}

async function uploadNoteImage(file) {
  const ext = file.name.split('.').pop();
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await db.storage.from(PHOTO_BUCKET).upload(path, file);
  if (error) throw error;
  const { data } = db.storage.from(PHOTO_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
