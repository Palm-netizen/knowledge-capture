// js/supabase.js — Supabase client config (Knowledge Capture — แยกอิสระจาก VegFarm)
// แก้ SUPABASE_URL และ SUPABASE_ANON_KEY ให้ตรงกับโปรเจกต์ Supabase ของแอปนี้ (คนละโปรเจกต์กับ VegFarm)

const SUPABASE_URL = 'https://ubtowmtqxakjfwllcali.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVidG93bXRxeGFramZ3bGxjYWxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyMDIyODksImV4cCI6MjA5ODc3ODI4OX0.L73GYomVHytMZe9lquWhTgGFrurqmZWcXCCxt0utno4';

const PHOTO_BUCKET = 'knowledge-photos';
const PRESET_TAGS = ['ธุรกิจ', 'การเงิน', 'จิตวิทยา', 'สุขภาพ'];

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ---- Mode: อ่าน (reading) / ฟัง (listening) / Mind (dharma) / ตัวเอง (self) -----
// Same table, same six menus — filtered by `media_type` and relabeled.

const MODE_KEY = 'kc-mode';

const MODE_META = {
  reading: {
    label: 'อ่าน', icon: 'book', appSubtitle: 'สกัดความรู้จากหนังสือ',
    calendarTitle: 'ปฏิทินการอ่าน', calendarSub: 'แตะวันที่เพื่อบันทึกหรือดูสิ่งที่อ่านในวันนั้น',
    dashboardSub: 'สรุปพฤติกรรมการอ่านและความรู้ที่สะสมมาทั้งหมด',
    dashboardCountLabel: 'สรุปแล้ว', dashboardUnit: 'เล่ม',
    entryNewTitle: 'บันทึกการอ่านเล่มใหม่', entryEditTitle: 'แก้ไขบันทึกการอ่าน',
    titleFieldLabel: 'ชื่อหนังสือ', titlePlaceholder: 'เช่น Atomic Habits',
    dateFieldLabel: 'วันที่อ่าน', highlightsFieldLabel: 'ไฮไลท์วันนี้ (1-5 ข้อ)',
    searchSub: 'ลองถามด้วยประโยคธรรมชาติ เช่น "หนังสือที่พูดเรื่องวินัย" หรือ "สรุปทุกไฮไลท์เกี่ยวกับการขาย"',
    connectionsSub: 'หนังสือที่มีแนวคิดเชื่อมโยงกัน จัดกลุ่มจากแท็กที่ใช้ร่วมกัน',
    mindmapSub: 'แผนผังความรู้ที่สร้างอัตโนมัติจากแท็กและหนังสือที่บันทึกไว้',
    mindmapCenterLabel: 'ห้องสมุดของฉัน', mindmapCenterDetail: 'ห้องสมุดความรู้ของฉัน', mindmapLeafLegend: 'หนังสือ',
    dayModalEmptyTitle: 'ยังไม่มีบันทึกในวันนี้', dayModalEmptySub: 'แตะปุ่มด้านล่างเพื่อบันทึกหนังสือที่อ่านในวันนี้',
    dayModalCta: '+ บันทึกหนังสือเล่มใหม่',
    recentEmptyTitle: 'ยังไม่มีบันทึก', recentEmptySub: 'เริ่มบันทึกสิ่งที่ได้เรียนรู้จากหนังสือเล่มแรกของคุณ', recentEmptyCta: '+ บันทึกเล่มแรก',
    connectionsEmptyTitle: 'ยังไม่มีหนังสือที่เชื่อมโยงกัน', connectionsEmptySub: 'ลองใส่แท็กเดียวกันให้หนังสือหลายเล่มดูสิ',
    connectionsUnitText: (n) => `หนังสือ ${n} เล่มมีแนวคิดเชื่อมโยงกันผ่านแท็กนี้`,
    mindmapEmptyTitle: 'ยังไม่มีข้อมูลพอสร้าง Mind Map', mindmapEmptySub: 'เริ่มบันทึกหนังสืออย่างน้อย 1 เล่มก่อนนะ',
    quoteSourcePrefix: 'จากหนังสือ', noHighlightsYet: 'ยังไม่มีไฮไลท์ในระบบ เริ่มบันทึกเล่มแรกกันเลย!',
    reviewVerb: 'อ่าน', highlightUnitWord: 'ไฮไลท์',
    mindmapTagDetailText: (n) => `เชื่อมโยงหนังสือ ${n} เล่ม`,
    validateTitleMsg: 'กรุณาใส่ชื่อหนังสือ', validateDateMsg: 'กรุณาเลือกวันที่อ่าน', validateHighlightsMsg: 'กรุณาใส่ไฮไลท์อย่างน้อย 1 ข้อ',
  },
  listening: {
    label: 'ฟัง', icon: 'headphones', appSubtitle: 'สกัดความรู้จากการฟัง',
    calendarTitle: 'ปฏิทินการฟัง', calendarSub: 'แตะวันที่เพื่อบันทึกหรือดูสิ่งที่ฟังในวันนั้น',
    dashboardSub: 'สรุปพฤติกรรมการฟังและความรู้ที่สะสมมาทั้งหมด',
    dashboardCountLabel: 'ฟังแล้ว', dashboardUnit: 'รายการ',
    entryNewTitle: 'บันทึกการฟังใหม่', entryEditTitle: 'แก้ไขบันทึกการฟัง',
    titleFieldLabel: 'ชื่อ Podcast / รายการที่ฟัง', titlePlaceholder: 'เช่น The Tim Ferriss Show',
    dateFieldLabel: 'วันที่ฟัง', highlightsFieldLabel: 'ประเด็นที่ได้ยินวันนี้ (1-5 ข้อ)',
    searchSub: 'ลองถามด้วยประโยคธรรมชาติ เช่น "รายการที่พูดเรื่องวินัย" หรือ "สรุปทุกประเด็นเกี่ยวกับการขาย"',
    connectionsSub: 'รายการที่มีแนวคิดเชื่อมโยงกัน จัดกลุ่มจากแท็กที่ใช้ร่วมกัน',
    mindmapSub: 'แผนผังความรู้ที่สร้างอัตโนมัติจากแท็กและรายการที่บันทึกไว้',
    mindmapCenterLabel: 'คลังการฟังของฉัน', mindmapCenterDetail: 'คลังความรู้จากการฟังของฉัน', mindmapLeafLegend: 'รายการ',
    dayModalEmptyTitle: 'ยังไม่มีบันทึกในวันนี้', dayModalEmptySub: 'แตะปุ่มด้านล่างเพื่อบันทึกรายการที่ฟังในวันนี้',
    dayModalCta: '+ บันทึกรายการใหม่',
    recentEmptyTitle: 'ยังไม่มีบันทึก', recentEmptySub: 'เริ่มบันทึกสิ่งที่ได้เรียนรู้จากรายการแรกที่คุณฟัง', recentEmptyCta: '+ บันทึกรายการแรก',
    connectionsEmptyTitle: 'ยังไม่มีรายการที่เชื่อมโยงกัน', connectionsEmptySub: 'ลองใส่แท็กเดียวกันให้หลายรายการดูสิ',
    connectionsUnitText: (n) => `${n} รายการมีแนวคิดเชื่อมโยงกันผ่านแท็กนี้`,
    mindmapEmptyTitle: 'ยังไม่มีข้อมูลพอสร้าง Mind Map', mindmapEmptySub: 'เริ่มบันทึกรายการที่ฟังอย่างน้อย 1 รายการก่อนนะ',
    quoteSourcePrefix: 'จากรายการ', noHighlightsYet: 'ยังไม่มีประเด็นในระบบ เริ่มบันทึกรายการแรกกันเลย!',
    reviewVerb: 'ฟัง', highlightUnitWord: 'ประเด็น',
    mindmapTagDetailText: (n) => `เชื่อมโยง ${n} รายการ`,
    validateTitleMsg: 'กรุณาใส่ชื่อ Podcast หรือรายการที่ฟัง', validateDateMsg: 'กรุณาเลือกวันที่ฟัง', validateHighlightsMsg: 'กรุณาใส่ประเด็นที่ได้ยินอย่างน้อย 1 ข้อ',
  },
  mind: {
    label: 'Mind', icon: 'flower', appSubtitle: 'สกัดข้อคิดจากธรรมะ',
    calendarTitle: 'ปฏิทิน Mind', calendarSub: 'แตะวันที่เพื่อบันทึกหรือดูสิ่งที่ฟังธรรมในวันนั้น',
    dashboardSub: 'สรุปพฤติกรรมการฟังธรรมและข้อคิดที่สะสมมาทั้งหมด',
    dashboardCountLabel: 'ฟังแล้ว', dashboardUnit: 'ตอน',
    entryNewTitle: 'บันทึกธรรมะใหม่', entryEditTitle: 'แก้ไขบันทึกธรรมะ',
    titleFieldLabel: 'ชื่อธรรมบรรยาย / พระอาจารย์', titlePlaceholder: 'เช่น หลวงพ่อปราโมทย์ - การเจริญสติ',
    dateFieldLabel: 'วันที่ฟังธรรม', highlightsFieldLabel: 'ข้อคิดที่ได้วันนี้ (1-5 ข้อ)',
    searchSub: 'ลองถามด้วยประโยคธรรมชาติ เช่น "ธรรมะที่พูดเรื่องการปล่อยวาง" หรือ "สรุปทุกข้อคิดเกี่ยวกับสติ"',
    connectionsSub: 'ธรรมบรรยายที่มีแนวคิดเชื่อมโยงกัน จัดกลุ่มจากแท็กที่ใช้ร่วมกัน',
    mindmapSub: 'แผนผังความรู้ที่สร้างอัตโนมัติจากแท็กและธรรมบรรยายที่บันทึกไว้',
    mindmapCenterLabel: 'คลัง Mind ของฉัน', mindmapCenterDetail: 'คลังข้อคิดธรรมะของฉัน', mindmapLeafLegend: 'เรื่อง',
    dayModalEmptyTitle: 'ยังไม่มีบันทึกในวันนี้', dayModalEmptySub: 'แตะปุ่มด้านล่างเพื่อบันทึกธรรมะที่ฟังในวันนี้',
    dayModalCta: '+ บันทึกธรรมะใหม่',
    recentEmptyTitle: 'ยังไม่มีบันทึก', recentEmptySub: 'เริ่มบันทึกข้อคิดจากธรรมะเรื่องแรกของคุณ', recentEmptyCta: '+ บันทึกเรื่องแรก',
    connectionsEmptyTitle: 'ยังไม่มีธรรมบรรยายที่เชื่อมโยงกัน', connectionsEmptySub: 'ลองใส่แท็กเดียวกันให้หลายเรื่องดูสิ',
    connectionsUnitText: (n) => `${n} เรื่องมีแนวคิดเชื่อมโยงกันผ่านแท็กนี้`,
    mindmapEmptyTitle: 'ยังไม่มีข้อมูลพอสร้าง Mind Map', mindmapEmptySub: 'เริ่มบันทึกธรรมะที่ฟังอย่างน้อย 1 เรื่องก่อนนะ',
    quoteSourcePrefix: 'จาก', noHighlightsYet: 'ยังไม่มีข้อคิดในระบบ เริ่มบันทึกเรื่องแรกกันเลย!',
    reviewVerb: 'ฟังธรรม', highlightUnitWord: 'ข้อคิด',
    mindmapTagDetailText: (n) => `เชื่อมโยง ${n} เรื่อง`,
    validateTitleMsg: 'กรุณาใส่ชื่อธรรมบรรยายหรือพระอาจารย์', validateDateMsg: 'กรุณาเลือกวันที่ฟังธรรม', validateHighlightsMsg: 'กรุณาใส่ข้อคิดที่ได้อย่างน้อย 1 ข้อ',
  },
  self: {
    label: 'ตัวเอง', icon: 'user', appSubtitle: 'สกัดข้อคิดจากการทบทวนตัวเอง',
    calendarTitle: 'ปฏิทินตัวเอง', calendarSub: 'แตะวันที่เพื่อบันทึกหรือดูสิ่งที่ทบทวนตัวเองในวันนั้น',
    dashboardSub: 'สรุปพฤติกรรมการทบทวนตัวเองและข้อคิดที่สะสมมาทั้งหมด',
    dashboardCountLabel: 'ทบทวนแล้ว', dashboardUnit: 'ครั้ง',
    entryNewTitle: 'บันทึกทบทวนตัวเองใหม่', entryEditTitle: 'แก้ไขบันทึกทบทวนตัวเอง',
    titleFieldLabel: 'หัวข้อที่ทบทวน', titlePlaceholder: 'เช่น ความสัมพันธ์กับครอบครัว',
    dateFieldLabel: 'วันที่ทบทวน', highlightsFieldLabel: 'ข้อคิดที่ได้วันนี้ (1-5 ข้อ)',
    searchSub: 'ลองถามด้วยประโยคธรรมชาติ เช่น "เรื่องที่ทบทวนเกี่ยวกับความมั่นใจ" หรือ "สรุปทุกข้อคิดเกี่ยวกับความสัมพันธ์"',
    connectionsSub: 'หัวข้อทบทวนตัวเองที่มีแนวคิดเชื่อมโยงกัน จัดกลุ่มจากแท็กที่ใช้ร่วมกัน',
    mindmapSub: 'แผนผังความรู้ที่สร้างอัตโนมัติจากแท็กและหัวข้อที่ทบทวนไว้',
    mindmapCenterLabel: 'คลังตัวเองของฉัน', mindmapCenterDetail: 'คลังข้อคิดเกี่ยวกับตัวเองของฉัน', mindmapLeafLegend: 'หัวข้อ',
    dayModalEmptyTitle: 'ยังไม่มีบันทึกในวันนี้', dayModalEmptySub: 'แตะปุ่มด้านล่างเพื่อบันทึกสิ่งที่ทบทวนตัวเองในวันนี้',
    dayModalCta: '+ บันทึกการทบทวนใหม่',
    recentEmptyTitle: 'ยังไม่มีบันทึก', recentEmptySub: 'เริ่มบันทึกข้อคิดจากการทบทวนตัวเองครั้งแรกของคุณ', recentEmptyCta: '+ บันทึกครั้งแรก',
    connectionsEmptyTitle: 'ยังไม่มีหัวข้อที่เชื่อมโยงกัน', connectionsEmptySub: 'ลองใส่แท็กเดียวกันให้หลายหัวข้อดูสิ',
    connectionsUnitText: (n) => `${n} หัวข้อมีแนวคิดเชื่อมโยงกันผ่านแท็กนี้`,
    mindmapEmptyTitle: 'ยังไม่มีข้อมูลพอสร้าง Mind Map', mindmapEmptySub: 'เริ่มบันทึกการทบทวนตัวเองอย่างน้อย 1 ครั้งก่อนนะ',
    quoteSourcePrefix: 'จาก', noHighlightsYet: 'ยังไม่มีข้อคิดในระบบ เริ่มบันทึกครั้งแรกกันเลย!',
    reviewVerb: 'ทบทวน', highlightUnitWord: 'ข้อคิด',
    mindmapTagDetailText: (n) => `เชื่อมโยง ${n} หัวข้อ`,
    validateTitleMsg: 'กรุณาใส่หัวข้อที่ทบทวน', validateDateMsg: 'กรุณาเลือกวันที่ทบทวน', validateHighlightsMsg: 'กรุณาใส่ข้อคิดที่ได้อย่างน้อย 1 ข้อ',
  }
};

function getCurrentMode() {
  const v = localStorage.getItem(MODE_KEY);
  return (v === 'listening' || v === 'mind' || v === 'self') ? v : 'reading';
}

function setCurrentMode(mode) {
  localStorage.setItem(MODE_KEY, mode);
}

function modeMeta() {
  return MODE_META[getCurrentMode()];
}

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

// Long free-text fields (insight/action) sometimes arrive as one run-on
// paragraph with "* " used as an informal bullet marker instead of real
// line breaks — split those into separate lines so they don't read as
// one wall of text, and mark up "quoted" phrases as bold/highlighted
// callouts since those are usually the sentence worth remembering.
function formatNoteBody(text) {
  if (!text) return '';
  const lines = String(text)
    .split(/\r?\n+|\s*\*\s+/)
    .map(s => s.trim())
    .filter(Boolean);
  return lines.map(line => `<div class="note-body-line">${highlightQuotes(escapeHTML(line))}</div>`).join('');
}

function highlightQuotes(escapedText) {
  return escapedText
    .replace(/“([^”]{2,})”/g, '<mark class="note-callout">$1</mark>')
    .replace(/&quot;([^&]{2,}?)&quot;/g, '<mark class="note-callout">$1</mark>');
}

// Reads a CSS custom property from :root — used so canvas-drawn content
// (Chart.js, Mind Map) follows the current light/dark theme.
function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

// ---- Minimal line icons (stroke-only, single color) — replaces emoji ------

const ICON_PATHS = {
  book: '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
  headphones: '<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H4a1 1 0 0 1-1-1v-4a9 9 0 1 1 18 0v4a1 1 0 0 1-1 1h-2a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>',
  calendar: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
  chart: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
  repeat: '<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  network: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98"/><path d="m15.41 6.51-6.82 3.98"/>',
  flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  sparkle: '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.287 1.288L3 12l5.8 1.9a2 2 0 0 1 1.288 1.287L12 21l1.9-5.8a2 2 0 0 1 1.287-1.288L21 12l-5.8-1.9a2 2 0 0 1-1.288-1.287Z"/>',
  target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  lightbulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5A5.5 5.5 0 1 0 7 12.5c.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
  tag: '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
  camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  star: '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
  briefcase: '<rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
  pin: '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  flower: '<path d="M12 7.5a4.5 4.5 0 1 1 4.5 4.5"/><path d="M12 7.5A4.5 4.5 0 1 0 7.5 12"/><path d="M12 16.5a4.5 4.5 0 1 1-4.5-4.5"/><path d="M12 16.5a4.5 4.5 0 1 0 4.5-4.5"/><circle cx="12" cy="12" r="2.5"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  checkSquare: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 12 2 2 4-4"/>',
  list: '<path d="M3 5h.01"/><path d="M3 12h.01"/><path d="M3 19h.01"/><path d="M8 5h13"/><path d="M8 12h13"/><path d="M8 19h13"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>'
};

function iconSVG(name, size = 18, strokeWidth = 2) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;vertical-align:-3px">${ICON_PATHS[name] || ''}</svg>`;
}

// Richer empty-state block with optional title/sub/CTA button.
function emptyStateHTML({ icon = iconSVG('book', 36), title = '', sub = '', ctaLabel = '', ctaOnClick = '' } = {}) {
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

// ---- Lightbox: full-size photo viewer for note thumbnails --------

function openLightbox(src) {
  document.getElementById('lightbox-img').src = src;
  document.getElementById('lightbox-overlay').style.display = 'flex';
}

function closeLightbox() {
  document.getElementById('lightbox-overlay').style.display = 'none';
  document.getElementById('lightbox-img').src = '';
}

async function uploadNoteImage(file) {
  const ext = file.name.split('.').pop();
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await db.storage.from(PHOTO_BUCKET).upload(path, file);
  if (error) throw error;
  const { data } = db.storage.from(PHOTO_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
