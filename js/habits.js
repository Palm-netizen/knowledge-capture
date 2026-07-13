// js/habits.js — เมนู 8: กิจวัตร (checklist กิจวัตรประจำวัน 9 ข้อ + แผนรายสัปดาห์)

const HABIT_TASKS = [
  { key: 'goal_write',  label: 'เขียนเป้าหมาย/ฝัน' },
  { key: 'audio_n21',   label: 'ฟังไฟล์เสียง N21' },
  { key: 'read_book',   label: 'อ่านหนังสือ' },
  { key: 'add_friend',  label: 'รู้จักคนเพิ่ม / Add เพื่อน' },
  { key: 'check_ford',  label: 'เช็ก FORD' },
  { key: 'appointment', label: 'แชทหรือโทรนัดหมาย' },
  { key: 'stp',         label: 'STP / แนะนำสินค้า' },
  { key: 'follow_up',   label: 'ติดตามผล บันทึกผล' },
  { key: 'post_social', label: 'โพส FB / Tiktok' }
];

const WEEKDAY_LABELS = [
  { key: 'mon', label: 'วันจันทร์' },
  { key: 'tue', label: 'วันอังคาร' },
  { key: 'wed', label: 'วันพุธ' },
  { key: 'thu', label: 'วันพฤหัสบดี' },
  { key: 'fri', label: 'วันศุกร์' },
  { key: 'sat', label: 'วันเสาร์' },
  { key: 'sun', label: 'วันอาทิตย์' }
];

let habitMonthCursor = new Date();
let currentHabitModalDate = null;
let habitActiveTab = 'daily';
let weeklyPlanWeekStart = getWeekStart(new Date());
let weeklyPlanLoadedOnce = false;
let wpTodoItems = [];

function getWeekStart(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  date.setDate(date.getDate() + diff);
  return toDateStr(date);
}

function weekRangeLabel(weekStart) {
  const start = new Date(weekStart + 'T00:00:00');
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const fmtShort = (d) => d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
  const fmtFull = (d) => d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
  return `${fmtShort(start)} – ${fmtFull(end)}`;
}

function initHabits() {
  document.getElementById('habit-tab-daily').addEventListener('click', () => switchHabitTab('daily'));
  document.getElementById('habit-tab-weekly').addEventListener('click', () => switchHabitTab('weekly'));
  document.getElementById('habit-cal-prev').addEventListener('click', () => {
    habitMonthCursor.setMonth(habitMonthCursor.getMonth() - 1);
    renderHabitCalendar();
  });
  document.getElementById('habit-cal-next').addEventListener('click', () => {
    habitMonthCursor.setMonth(habitMonthCursor.getMonth() + 1);
    renderHabitCalendar();
  });
  document.getElementById('wp-week-prev').addEventListener('click', () => {
    weeklyPlanWeekStart = addDaysToDate(weeklyPlanWeekStart, -7);
    renderWeeklyPlan();
  });
  document.getElementById('wp-week-next').addEventListener('click', () => {
    weeklyPlanWeekStart = addDaysToDate(weeklyPlanWeekStart, 7);
    renderWeeklyPlan();
  });
  document.getElementById('wp-add-priority-btn').addEventListener('click', addPriorityField);
  document.getElementById('wp-add-todo-btn').addEventListener('click', addTodoItem);
  document.getElementById('wp-todo-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addTodoItem(); }
  });
  document.getElementById('wp-save-btn').addEventListener('click', saveWeeklyPlan);
  renderHabitCalendar();
}

function refreshHabitsPage() {
  if (habitActiveTab === 'daily') renderHabitCalendar();
  else renderWeeklyPlan();
}

function switchHabitTab(tab) {
  habitActiveTab = tab;
  document.getElementById('habit-tab-daily').classList.toggle('active', tab === 'daily');
  document.getElementById('habit-tab-weekly').classList.toggle('active', tab === 'weekly');
  document.getElementById('habit-panel-daily').classList.toggle('hidden', tab !== 'daily');
  document.getElementById('habit-panel-weekly').classList.toggle('hidden', tab !== 'weekly');
  if (tab === 'weekly' && !weeklyPlanLoadedOnce) {
    weeklyPlanLoadedOnce = true;
    renderWeeklyPlan();
  }
}

// ---- Daily habit checklist (monthly calendar) -----------------------

async function renderHabitCalendar() {
  const year = habitMonthCursor.getFullYear();
  const month = habitMonthCursor.getMonth();

  document.getElementById('habit-cal-month-label').textContent =
    habitMonthCursor.toLocaleDateString('th-TH', { year: 'numeric', month: 'long' });

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startWeekday = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  const firstStr = toDateStr(firstDay);
  const lastStr = toDateStr(lastDay);
  const today = todayStr();

  const { data, error } = await db.from('habit_checks').select('*').gte('check_date', firstStr).lte('check_date', lastStr);
  const byDate = {};
  (!error && data ? data : []).forEach(row => { byDate[row.check_date] = row; });

  const grid = document.getElementById('habit-cal-grid');
  let html = CAL_DAY_NAMES.map(n => `<div class="cal-day-name">${n}</div>`).join('');
  for (let i = 0; i < startWeekday; i++) html += `<div class="cal-day empty"></div>`;

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = toDateStr(new Date(year, month, d));
    const row = byDate[dateStr];
    const doneCount = row ? HABIT_TASKS.filter(t => row[t.key]).length : 0;
    const classes = ['cal-day'];
    if (dateStr === today) classes.push('today');
    if (doneCount > 0) classes.push('has-note');
    if (doneCount === HABIT_TASKS.length) classes.push('habit-perfect');
    html += `
      <div class="${classes.join(' ')}" onclick="openHabitDayModal('${dateStr}')">
        <div class="day-num">${d}</div>
        ${doneCount > 0 ? `<span class="habit-day-count">${doneCount}/${HABIT_TASKS.length}</span>` : ''}
      </div>
    `;
  }
  grid.innerHTML = html;
}

async function openHabitDayModal(dateStr) {
  currentHabitModalDate = dateStr;
  document.getElementById('habit-day-modal-title').textContent = formatDateTH(dateStr);
  document.getElementById('habit-day-modal').style.display = 'flex';
  await loadHabitDayChecklist(dateStr);
}

function closeHabitDayModal() {
  document.getElementById('habit-day-modal').style.display = 'none';
}

async function loadHabitDayChecklist(dateStr) {
  const wrap = document.getElementById('habit-day-modal-list');
  wrap.innerHTML = skeletonNoteCardsHTML(1);
  const { data, error } = await db.from('habit_checks').select('*').eq('check_date', dateStr).single();
  const row = (!error && data) ? data : {};
  renderHabitChecklist(wrap, dateStr, row);
}

function renderHabitChecklist(wrap, dateStr, row) {
  const doneCount = HABIT_TASKS.filter(t => row[t.key]).length;
  const pct = Math.round((doneCount / HABIT_TASKS.length) * 100);
  wrap.innerHTML = `
    <div class="habit-progress-label">${doneCount} / ${HABIT_TASKS.length} ข้อ</div>
    <div class="habit-progress-bar-track"><div class="habit-progress-bar-fill${doneCount === HABIT_TASKS.length ? ' goal-reached' : ''}" style="width:${pct}%"></div></div>
    <div class="habit-checklist">
      ${HABIT_TASKS.map(t => `
        <label class="checkbox-item habit-check-item${row[t.key] ? ' checked' : ''}">
          <input type="checkbox" ${row[t.key] ? 'checked' : ''} onchange="toggleHabitTask('${dateStr}', '${t.key}', this.checked)">
          ${escapeHTML(t.label)}
        </label>
      `).join('')}
    </div>
  `;
}

async function toggleHabitTask(dateStr, taskKey, checked) {
  const payload = { check_date: dateStr, [taskKey]: checked };
  const { error } = await db.from('habit_checks').upsert(payload, { onConflict: 'check_date' });
  if (error) { showToast('บันทึกไม่สำเร็จ', 'error'); return; }
  await loadHabitDayChecklist(dateStr);
  await renderHabitCalendar();
}

// ---- Weekly plan ------------------------------------------------------

async function renderWeeklyPlan() {
  document.getElementById('wp-week-label').textContent = weekRangeLabel(weeklyPlanWeekStart);
  const { data, error } = await db.from('weekly_plans').select('*').eq('week_start', weeklyPlanWeekStart).single();
  const plan = (!error && data) ? data : { top_priorities: [], todo_items: [], study_product: '', study_done: false, day_wins: {} };

  renderPriorities(plan.top_priorities && plan.top_priorities.length ? plan.top_priorities : ['']);
  renderTodoItems(plan.todo_items || []);
  document.getElementById('wp-study-product').value = plan.study_product || '';
  document.getElementById('wp-study-done').checked = !!plan.study_done;
  document.getElementById('wp-study-done-toggle').classList.toggle('checked', !!plan.study_done);
  renderDayWins(plan.day_wins || {});
}

function renderPriorities(values) {
  const wrap = document.getElementById('wp-priorities');
  wrap.innerHTML = values.map((val, i) => `
    <div style="display:flex;gap:8px;margin-bottom:8px;align-items:center">
      <span class="wp-priority-num">${i + 1}</span>
      <input type="text" class="form-control wp-priority-input" data-idx="${i}" value="${escapeHTML(val)}" placeholder="เป้าหมายอันดับ ${i + 1}">
      ${values.length > 1 ? `<span class="btn-icon" onclick="removePriorityField(${i})">✕</span>` : ''}
    </div>
  `).join('');
}

function getCurrentPriorityValues() {
  return Array.from(document.querySelectorAll('.wp-priority-input')).map(i => i.value);
}

function addPriorityField() {
  const values = getCurrentPriorityValues();
  if (values.length >= 10) { showToast('เพิ่มได้สูงสุด 10 ข้อ', 'warn'); return; }
  values.push('');
  renderPriorities(values);
}

function removePriorityField(idx) {
  const values = getCurrentPriorityValues();
  values.splice(idx, 1);
  renderPriorities(values.length ? values : ['']);
}

function renderTodoItems(items) {
  wpTodoItems = items.map(it => ({ ...it }));
  const wrap = document.getElementById('wp-todo-list');
  if (!wpTodoItems.length) {
    wrap.innerHTML = `<div class="text-sub" style="padding:4px 0 8px">ยังไม่มีรายการ เพิ่มนัดหมายหรือ STP ที่ต้องทำสัปดาห์นี้</div>`;
    return;
  }
  wrap.innerHTML = wpTodoItems.map((it, i) => `
    <label class="checkbox-item wp-todo-item${it.done ? ' checked' : ''}">
      <input type="checkbox" ${it.done ? 'checked' : ''} onchange="toggleTodoItem(${i}, this.checked)">
      <span class="wp-todo-text">${escapeHTML(it.text)}</span>
      <span class="btn-icon" onclick="event.stopPropagation(); removeTodoItem(${i})">✕</span>
    </label>
  `).join('');
}

function toggleTodoItem(idx, done) {
  wpTodoItems[idx].done = done;
  renderTodoItems(wpTodoItems);
}

function removeTodoItem(idx) {
  wpTodoItems.splice(idx, 1);
  renderTodoItems(wpTodoItems);
}

function addTodoItem() {
  const input = document.getElementById('wp-todo-input');
  const text = input.value.trim();
  if (!text) return;
  wpTodoItems.push({ text, done: false });
  input.value = '';
  renderTodoItems(wpTodoItems);
}

function renderDayWins(wins) {
  const wrap = document.getElementById('wp-day-wins');
  wrap.innerHTML = WEEKDAY_LABELS.map(w => `
    <div class="form-group" style="margin-bottom:12px">
      <label class="form-label">${escapeHTML(w.label)}</label>
      <textarea class="form-control wp-daywin-input" data-key="${w.key}" placeholder="สิ่งที่เอาชนะวันนี้...">${escapeHTML(wins[w.key] || '')}</textarea>
    </div>
  `).join('');
}

async function saveWeeklyPlan() {
  const top_priorities = getCurrentPriorityValues().map(v => v.trim()).filter(Boolean).slice(0, 10);
  const todo_items = wpTodoItems.filter(it => it.text && it.text.trim());
  const study_product = document.getElementById('wp-study-product').value.trim();
  const study_done = document.getElementById('wp-study-done').checked;
  const day_wins = {};
  document.querySelectorAll('.wp-daywin-input').forEach(el => { day_wins[el.dataset.key] = el.value.trim(); });

  const payload = { week_start: weeklyPlanWeekStart, top_priorities, todo_items, study_product, study_done, day_wins };
  setLoading(true);
  const { error } = await db.from('weekly_plans').upsert(payload, { onConflict: 'week_start' });
  setLoading(false);
  if (error) { showToast('บันทึกไม่สำเร็จ: ' + (error.message || error), 'error'); return; }
  showToast('บันทึกแผนสัปดาห์นี้แล้ว');
}
