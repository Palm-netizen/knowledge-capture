// js/mindmap.js — เมนู 6: Mind Map อัตโนมัติ (center -> tags -> books)

let mindmapNodes = [];
let mindmapNotesCache = [];
let mindmapSelectedKey = null; // { type, label } — survives node-array rebuilds across redraws

function initMindmap() {
  renderMindmap();
  window.addEventListener('resize', () => drawMindmap());
}

// Fetches notes once, then hands off to the (synchronous, refetch-free) drawer.
async function renderMindmap() {
  const { data, error } = await db.from('notes').select('id, book_title, tags, insight, action, read_date, importance, highlights');
  if (error) return;
  mindmapNotesCache = data;
  drawMindmap();
}

function drawMindmap() {
  const canvas = document.getElementById('mindmapCanvas');
  const wrap = canvas.parentElement;
  const data = mindmapNotesCache;

  const tagToBooks = {};
  const untagged = new Set();
  const bookSet = new Set();
  data.forEach(n => {
    bookSet.add(n.book_title);
    if (!n.tags || !n.tags.length) { untagged.add(n.book_title); return; }
    n.tags.forEach(t => { (tagToBooks[t] ||= new Set()).add(n.book_title); });
  });

  if (!bookSet.size) {
    canvas.style.display = 'none';
    canvas.width = 0; canvas.height = 0;
    let empty = wrap.querySelector('.mindmap-empty');
    if (!empty) {
      empty = document.createElement('div');
      empty.className = 'mindmap-empty';
      wrap.appendChild(empty);
    }
    empty.innerHTML = emptyStateHTML({ icon: iconSVG('network', 36), title: 'ยังไม่มีข้อมูลพอสร้าง Mind Map', sub: 'เริ่มบันทึกหนังสืออย่างน้อย 1 เล่มก่อนนะ' });
    mindmapNodes = [];
    return;
  }
  wrap.querySelector('.mindmap-empty')?.remove();
  canvas.style.display = 'block';

  const groups = Object.keys(tagToBooks).map(t => ({ label: t, books: [...tagToBooks[t]] }));
  if (untagged.size) groups.push({ label: 'ไม่มีแท็ก', books: [...untagged] });

  const size = Math.max(400, Math.min(640, wrap.clientWidth || 400));
  const dpr = window.devicePixelRatio || 1;
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width = size + 'px';
  canvas.style.height = size + 'px';
  canvas._mmSize = size; // logical (CSS-pixel) size, used by the click hit-test below

  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, size, size);

  const cx = size / 2, cy = size / 2;
  // Sized so that R1 + R2 + room for a node + its label pill never
  // exceeds the canvas half-width, even for a lone book pointing
  // straight outward along an axis (the tightest case).
  const R1 = size * 0.24;
  const R2 = Math.max(40, size * 0.12);

  mindmapNodes = [{ x: cx, y: cy, r: 30, type: 'center', label: 'ห้องสมุดของฉัน' }];

  const lineColorOuter = cssVar('--primary-tint-strong');
  const lineColorInner = cssVar('--line');

  const groupAngleStep = (2 * Math.PI) / groups.length;
  groups.forEach((g, i) => {
    const angle = i * groupAngleStep - Math.PI / 2;
    const tx = cx + R1 * Math.cos(angle);
    const ty = cy + R1 * Math.sin(angle);

    drawCurve(ctx, cx, cy, tx, ty, lineColorOuter, 2.5);
    mindmapNodes.push({ x: tx, y: ty, r: 21, type: 'tag', label: g.label, books: g.books });

    const bookAngleStep = (2 * Math.PI) / g.books.length;
    g.books.forEach((book, j) => {
      // A lone book defaults to due-east regardless of where its tag
      // sits, which can swing it back toward the center or a neighbor.
      // Point it outward instead. Multi-book rings keep their original
      // symmetric spread, which doesn't have that problem.
      const bAngle = g.books.length === 1 ? angle : j * bookAngleStep;
      const bx = tx + R2 * Math.cos(bAngle);
      const by = ty + R2 * Math.sin(bAngle);
      drawCurve(ctx, tx, ty, bx, by, lineColorInner, 1.5);
      mindmapNodes.push({ x: bx, y: by, r: 15, type: 'book', label: book, tag: g.label });
    });
  });

  // draw nodes (with labels) on top of the connecting lines
  mindmapNodes.forEach(n => drawNode(ctx, n, cy));
}

// Gentle organic arc instead of a ruler-straight line.
function drawCurve(ctx, x1, y1, x2, y2, color, width) {
  const dx = x2 - x1, dy = y2 - y1;
  const dist = Math.hypot(dx, dy) || 1;
  const bow = Math.min(16, dist * 0.14);
  const mx = (x1 + x2) / 2 + (-dy / dist) * bow;
  const my = (y1 + y2) / 2 + (dx / dist) * bow;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.quadraticCurveTo(mx, my, x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.stroke();
}

function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawNode(ctx, n, cy) {
  const colors = { center: cssVar('--primary'), tag: cssVar('--violet'), book: cssVar('--accent') };
  const baseColor = colors[n.type];
  const isSelected = mindmapSelectedKey && n.type === mindmapSelectedKey.type && n.label === mindmapSelectedKey.label;

  // soft drop shadow under the sphere
  ctx.save();
  ctx.shadowColor = 'rgba(20,15,8,0.28)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 3;
  ctx.beginPath();
  ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
  ctx.fillStyle = baseColor;
  ctx.fill();
  ctx.restore();

  // glossy highlight overlay for a bit of depth
  const gloss = ctx.createRadialGradient(n.x - n.r * 0.35, n.y - n.r * 0.35, 0, n.x - n.r * 0.35, n.y - n.r * 0.35, n.r * 1.1);
  gloss.addColorStop(0, 'rgba(255,255,255,0.4)');
  gloss.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.beginPath();
  ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
  ctx.fillStyle = gloss;
  ctx.fill();

  // selection ring
  if (isSelected) {
    ctx.beginPath();
    ctx.arc(n.x, n.y, n.r + 4, 0, Math.PI * 2);
    ctx.strokeStyle = baseColor;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // label pill
  const label = n.label.length > 14 ? n.label.slice(0, 13) + '…' : n.label;
  ctx.font = n.type === 'center' ? '700 12px Prompt, sans-serif' : '600 11px Prompt, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const textW = ctx.measureText(label).width;
  const padX = 7, padY = 4;
  // Book leaves flip their label above/below to face away from the
  // canvas center, so top-half branches don't collide with the label
  // cluster underneath them. Center/tag labels stay put — they're few
  // enough not to collide, and flipping a tag would crowd its own
  // book labels sitting just beyond it.
  const above = n.type === 'book' && n.y < cy;
  const labelY = above ? n.y - n.r - 15 : n.y + n.r + 15;
  ctx.save();
  ctx.shadowColor = 'rgba(20,15,8,0.16)';
  ctx.shadowBlur = 5;
  ctx.shadowOffsetY = 1;
  ctx.fillStyle = cssVar('--paper');
  roundRectPath(ctx, n.x - textW / 2 - padX, labelY - 9 - padY, textW + padX * 2, 18 + padY, 9);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = cssVar('--ink');
  ctx.fillText(label, n.x, labelY);
}

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('mindmapCanvas');
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const logicalSize = canvas._mmSize || rect.width;
    const scaleX = logicalSize / rect.width;
    const scaleY = logicalSize / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    const hit = mindmapNodes.find(n => Math.hypot(n.x - x, n.y - y) <= n.r + 4);
    if (hit) {
      mindmapSelectedKey = { type: hit.type, label: hit.label };
      showMindmapDetail(hit);
      drawMindmap();
    }
  });
});

function showMindmapDetail(node) {
  const panel = document.getElementById('mindmap-detail');
  const accent = { center: 'var(--primary)', tag: 'var(--violet)', book: 'var(--accent)' }[node.type];
  panel.style.boxShadow = `inset 3px 0 0 ${accent}, var(--shadow)`;
  if (node.type === 'center') {
    const bookCount = new Set(mindmapNotesCache.map(n => n.book_title)).size;
    panel.innerHTML = `<strong>${iconSVG('book', 15)} ห้องสมุดความรู้ของฉัน</strong><div class="text-sub" style="margin-top:6px">รวม ${bookCount} เล่ม</div>`;
  } else if (node.type === 'tag') {
    panel.innerHTML = `
      <strong>${iconSVG('tag', 14)} ${escapeHTML(node.label)}</strong>
      <div class="text-sub" style="margin-top:6px">เชื่อมโยงหนังสือ ${node.books.length} เล่ม: ${node.books.map(escapeHTML).join(', ')}</div>
    `;
  } else {
    const notes = mindmapNotesCache.filter(n => n.book_title === node.label);
    const totalHighlights = notes.reduce((s, n) => s + (n.highlights?.length || 0), 0);
    panel.innerHTML = `
      <strong>${iconSVG('book', 14)} ${escapeHTML(node.label)}</strong>
      <div class="text-sub" style="margin-top:6px">${notes.length} บันทึก · ${totalHighlights} ไฮไลท์ · แท็ก: ${escapeHTML(node.tag)}</div>
    `;
  }
}
