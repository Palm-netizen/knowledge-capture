// js/appointments.js — เมนู 7: นัดหมายคุยงาน (ปฏิทินแยกจาก notes + เป้าหมายรายเดือน)

let apptMonthCursor = new Date();
let currentApptModalDate = null;
let apptGoalTarget = 0;

const APPT_STATUS_META = {
  pending:   { label: 'รอคุย',   dotClass: 'appt-dot-pending',   badgeClass: 'appt-status-pending' },
  confirmed: { label: 'คุยแล้ว', dotClass: 'appt-dot-confirmed', badgeClass: 'appt-status-confirmed' },
  cancelled: { label: 'ยกเลิก',  dotClass: 'appt-dot-cancelled', badgeClass: 'appt-status-cancelled' }
};

function apptMonthKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function initAppointments() {
  document.getElementById('appt-cal-prev').addEventListener('click', () => {
    apptMonthCursor.setMonth(apptMonthCursor.getMonth() - 1);
    renderApptCalendar();
  });
  document.getElementById('appt-cal-next').addEventListener('click', () => {
    apptMonthCursor.setMonth(apptMonthCursor.getMonth() + 1);
    renderApptCalendar();
  });
  document.getElementById('appt-goal-edit-btn').addEventListener('click', openGoalEditor);
  document.getElementById('appt-goal-save-btn').addEventListener('click', saveGoalTarget);
  renderApptCalendar();
}

async function renderApptCalendar() {
  const year = apptMonthCursor.getFullYear();
  const month = apptMonthCursor.getMonth();
  const mKey = apptMonthKey(apptMonthCursor);

  document.getElementById('appt-cal-month-label').textContent =
    apptMonthCursor.toLocaleDateString('th-TH', { year: 'numeric', month: 'long' });

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startWeekday = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  const firstStr = toDateStr(firstDay);
  const lastStr = toDateStr(lastDay);
  const today = todayStr();

  const [{ data: monthAppts, error }, { data: goalRow }] = await Promise.all([
    db.from('appointments').select('appt_date, status').gte('appt_date', firstStr).lte('appt_date', lastStr),
    db.from('appointment_goals').select('target').eq('month', mKey).single()
  ]);

  apptGoalTarget = goalRow?.target || 0;
  const confirmedCount = (!error && monthAppts ? monthAppts : []).filter(a => a.status === 'confirmed').length;
  renderGoalProgress(confirmedCount, apptGoalTarget);

  const dateStatusMap = {};
  (!error && monthAppts ? monthAppts : []).forEach(a => {
    (dateStatusMap[a.appt_date] ||= new Set()).add(a.status);
  });

  const grid = document.getElementById('appt-cal-grid');
  let html = CAL_DAY_NAMES.map(n => `<div class="cal-day-name">${n}</div>`).join('');
  for (let i = 0; i < startWeekday; i++) html += `<div class="cal-day empty"></div>`;

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = toDateStr(new Date(year, month, d));
    const statuses = dateStatusMap[dateStr];
    const classes = ['cal-day'];
    if (dateStr === today) classes.push('today');
    if (statuses) classes.push('has-note');
    html += `
      <div class="${classes.join(' ')}" onclick="openApptDayModal('${dateStr}')">
        <div class="day-num">${d}</div>
        ${statuses ? `<span class="appt-day-dots">${[...statuses].map(s => `<span class="appt-dot ${APPT_STATUS_META[s].dotClass}"></span>`).join('')}</span>` : ''}
      </div>
    `;
  }
  grid.innerHTML = html;
}

function renderGoalProgress(count, target) {
  document.getElementById('appt-goal-count').textContent = count;
  document.getElementById('appt-goal-target').textContent = target;
  const pct = target > 0 ? Math.min(100, Math.round((count / target) * 100)) : 0;
  const fill = document.getElementById('appt-goal-bar-fill');
  fill.style.width = pct + '%';
  fill.classList.toggle('goal-reached', target > 0 && count >= target);
}

function openGoalEditor() {
  const input = document.getElementById('appt-goal-input');
  input.value = apptGoalTarget || '';
  document.getElementById('appt-goal-display').classList.add('hidden');
  document.getElementById('appt-goal-editor').classList.remove('hidden');
  input.focus();
}

async function saveGoalTarget() {
  const mKey = apptMonthKey(apptMonthCursor);
  const val = Math.max(0, parseInt(document.getElementById('appt-goal-input').value, 10) || 0);
  setLoading(true);
  const { error } = await db.from('appointment_goals').upsert({ month: mKey, target: val }, { onConflict: 'month' });
  setLoading(false);
  if (error) { showToast('ตั้งเป้าหมายไม่สำเร็จ', 'error'); return; }
  document.getElementById('appt-goal-editor').classList.add('hidden');
  document.getElementById('appt-goal-display').classList.remove('hidden');
  await renderApptCalendar();
}

// ---- Day modal: list appointments of a clicked date ---------------

async function openApptDayModal(dateStr) {
  currentApptModalDate = dateStr;
  document.getElementById('appt-day-modal-title').textContent = formatDateTH(dateStr);
  document.getElementById('appt-day-modal').style.display = 'flex';
  await loadApptDayList(dateStr);
}

function closeApptDayModal() {
  document.getElementById('appt-day-modal').style.display = 'none';
}

async function loadApptDayList(dateStr) {
  const wrap = document.getElementById('appt-day-modal-list');
  wrap.innerHTML = skeletonNoteCardsHTML(1);
  const { data, error } = await db.from('appointments').select('*').eq('appt_date', dateStr).order('appt_time', { ascending: true });
  if (error) { wrap.innerHTML = '<div class="text-sub">โหลดข้อมูลไม่สำเร็จ</div>'; return; }
  if (!data.length) {
    wrap.innerHTML = emptyStateHTML({ icon: iconSVG('calendar', 36), title: 'ยังไม่มีนัดหมายวันนี้', sub: 'แตะปุ่มด้านล่างเพื่อเพิ่มนัดหมายใหม่' });
    return;
  }
  wrap.innerHTML = data.map(renderApptCard).join('');
}

function renderApptCard(appt) {
  const meta = APPT_STATUS_META[appt.status] || APPT_STATUS_META.pending;
  return `
    <div class="note-card appt-card">
      <div class="note-card-head">
        <div>
          <div class="note-book">${escapeHTML(appt.person_name)}</div>
          <div class="note-date">${appt.appt_time ? escapeHTML(appt.appt_time) + ' น. · ' : ''}<span class="appt-status-badge ${meta.badgeClass}">${meta.label}</span></div>
        </div>
      </div>
      <div class="appt-detail-grid">
        ${appt.fb_name ? `<div>${iconSVG('link', 13)} ${escapeHTML(appt.fb_name)}</div>` : ''}
        ${appt.age ? `<div>อายุ ${appt.age} ปี</div>` : ''}
        ${appt.job ? `<div>${iconSVG('briefcase', 13)} ${escapeHTML(appt.job)}</div>` : ''}
        ${appt.study_place ? `<div>${iconSVG('book', 13)} ${escapeHTML(appt.study_place)}</div>` : ''}
        ${appt.location ? `<div>${iconSVG('pin', 13)} ${escapeHTML(appt.location)}</div>` : ''}
      </div>
      <div class="note-actions-row">
        <button class="btn btn-outline btn-sm" onclick="setApptStatus('${appt.id}', 'confirmed')">cf นัด</button>
        <button class="btn btn-outline btn-sm" onclick="setApptStatus('${appt.id}', 'cancelled')">ยกเลิกนัด</button>
        <button class="btn btn-outline btn-sm" onclick="openApptForm('${appt.appt_date}', '${appt.id}')">แก้ไข</button>
        <button class="btn btn-outline btn-sm" onclick="deleteAppt('${appt.id}', '${appt.appt_date}')">ลบ</button>
      </div>
    </div>
  `;
}

async function setApptStatus(id, status) {
  setLoading(true);
  const { error } = await db.from('appointments').update({ status }).eq('id', id);
  setLoading(false);
  if (error) { showToast('อัปเดตสถานะไม่สำเร็จ', 'error'); return; }
  showToast(status === 'confirmed' ? 'ยืนยันนัดแล้ว' : 'ยกเลิกนัดแล้ว');
  await refreshAfterApptChange(currentApptModalDate);
}

async function deleteAppt(id, dateStr) {
  if (!id) return;
  if (!confirm('ลบนัดหมายนี้ใช่หรือไม่?')) return;
  setLoading(true);
  const { error } = await db.from('appointments').delete().eq('id', id);
  setLoading(false);
  if (error) { showToast('ลบไม่สำเร็จ', 'error'); return; }
  showToast('ลบนัดหมายแล้ว');
  closeApptForm();
  await refreshAfterApptChange(dateStr);
}

async function refreshAfterApptChange(dateStr) {
  await renderApptCalendar();
  if (dateStr && document.getElementById('appt-day-modal').style.display === 'flex') {
    await loadApptDayList(dateStr);
  }
}

// ---- Entry form: add / edit an appointment -------------------------

async function openApptForm(dateStr, apptId) {
  document.getElementById('appt-id').value = apptId || '';
  document.getElementById('appt-name').value = '';
  document.getElementById('appt-fb').value = '';
  document.getElementById('appt-age').value = '';
  document.getElementById('appt-job').value = '';
  document.getElementById('appt-study').value = '';
  document.getElementById('appt-date').value = dateStr || todayStr();
  document.getElementById('appt-time').value = '';
  document.getElementById('appt-location').value = '';
  document.getElementById('appt-delete-btn').classList.add('hidden');
  document.getElementById('appt-modal-title').textContent = 'เพิ่มนัดหมายใหม่';

  if (apptId) {
    setLoading(true);
    const { data, error } = await db.from('appointments').select('*').eq('id', apptId).single();
    setLoading(false);
    if (error) { showToast('โหลดข้อมูลไม่สำเร็จ', 'error'); return; }
    document.getElementById('appt-name').value = data.person_name;
    document.getElementById('appt-fb').value = data.fb_name || '';
    document.getElementById('appt-age').value = data.age || '';
    document.getElementById('appt-job').value = data.job || '';
    document.getElementById('appt-study').value = data.study_place || '';
    document.getElementById('appt-date').value = data.appt_date;
    document.getElementById('appt-time').value = data.appt_time || '';
    document.getElementById('appt-location').value = data.location || '';
    document.getElementById('appt-delete-btn').classList.remove('hidden');
    document.getElementById('appt-modal-title').textContent = 'แก้ไขนัดหมาย';
  }

  document.getElementById('appt-modal').style.display = 'flex';
}

function closeApptForm() {
  document.getElementById('appt-modal').style.display = 'none';
}

async function saveAppt() {
  const id = document.getElementById('appt-id').value;
  const name = document.getElementById('appt-name').value.trim();
  const date = document.getElementById('appt-date').value;
  if (!name) { showToast('กรุณาใส่ชื่อคน', 'warn'); return; }
  if (!date) { showToast('กรุณาเลือกวันที่นัด', 'warn'); return; }

  const payload = {
    person_name: name,
    fb_name: document.getElementById('appt-fb').value.trim(),
    age: parseInt(document.getElementById('appt-age').value, 10) || null,
    job: document.getElementById('appt-job').value.trim(),
    study_place: document.getElementById('appt-study').value.trim(),
    appt_date: date,
    appt_time: document.getElementById('appt-time').value,
    location: document.getElementById('appt-location').value.trim()
  };

  setLoading(true);
  let error;
  if (id) {
    ({ error } = await db.from('appointments').update(payload).eq('id', id));
  } else {
    ({ error } = await db.from('appointments').insert({ ...payload, status: 'pending' }));
  }
  setLoading(false);
  if (error) { showToast('บันทึกไม่สำเร็จ: ' + (error.message || error), 'error'); return; }

  showToast('บันทึกนัดหมายสำเร็จ');
  closeApptForm();
  await refreshAfterApptChange(date);
}
