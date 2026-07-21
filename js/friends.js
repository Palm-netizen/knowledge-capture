// js/friends.js — เมนู 7: เพื่อน (Name List — รายชื่อคนที่เพิ่งรู้จัก + STP)

let friendsCache = [];
let currentListFieldFriendId = null;
let currentListFieldName = null; // 'connections' | 'extra_info'
let listFieldItems = [];

const LISTFIELD_LABELS = { connections: 'เรื่องที่เชื่อมกัน', extra_info: 'ข้อมูลเพิ่มเติม' };

function initFriends() {
  document.getElementById('friends-add-btn').addEventListener('click', () => openFriendForm());
  document.getElementById('friends-month-filter').addEventListener('change', renderFriendsList);
  document.getElementById('friends-search-input').addEventListener('input', renderFriendsList);
  loadFriends();
}

async function loadFriends() {
  const wrap = document.getElementById('friends-list');
  wrap.innerHTML = skeletonNoteCardsHTML(2);
  const { data, error } = await db.from('friends').select('*').order('met_date', { ascending: false });
  if (error) { wrap.innerHTML = '<div class="text-sub">โหลดข้อมูลไม่สำเร็จ</div>'; return; }
  friendsCache = data || [];
  populateMonthFilter(friendsCache);
  renderFriendsList();
}

function populateMonthFilter(friends) {
  const months = [...new Set(friends.map(f => f.met_date.slice(0, 7)))].sort().reverse();
  const sel = document.getElementById('friends-month-filter');
  const current = sel.value || 'all';
  sel.innerHTML = '<option value="all">ทุกเดือน</option>' + months.map(m => {
    const label = new Date(m + '-01T00:00:00').toLocaleDateString('th-TH', { year: 'numeric', month: 'long' });
    return `<option value="${m}">${label}</option>`;
  }).join('');
  sel.value = (current === 'all' || months.includes(current)) ? current : 'all';
}

function renderFriendsList() {
  const monthFilter = document.getElementById('friends-month-filter').value;
  const query = document.getElementById('friends-search-input').value.trim().toLowerCase();
  const filtered = friendsCache.filter(f => {
    const matchMonth = monthFilter === 'all' || f.met_date.slice(0, 7) === monthFilter;
    const matchQuery = !query || f.name.toLowerCase().includes(query);
    return matchMonth && matchQuery;
  });

  document.getElementById('friends-total-count').textContent = friendsCache.length;

  const wrap = document.getElementById('friends-list');
  if (!filtered.length) {
    wrap.innerHTML = emptyStateHTML({
      icon: iconSVG('user', 36),
      title: friendsCache.length ? 'ไม่พบรายชื่อที่ตรงกับตัวกรอง' : 'ยังไม่มีรายชื่อ',
      sub: friendsCache.length ? 'ลองเปลี่ยนเดือนหรือคำค้นหาดูสิ' : 'เริ่มเพิ่มเพื่อนใหม่คนแรกของคุณ',
      ctaLabel: friendsCache.length ? '' : '+ เพิ่มรายชื่อ',
      ctaOnClick: 'openFriendForm()'
    });
    return;
  }
  wrap.innerHTML = filtered.map(renderFriendCard).join('');
}

function renderFriendCard(f) {
  const connCount = (f.connections || []).length;
  const infoCount = (f.extra_info || []).length;
  return `
    <div class="note-card">
      <div class="note-card-head">
        <div>
          <div class="note-book">${escapeHTML(f.name)}${f.age ? `<span class="friend-age-badge">อายุ ${f.age}</span>` : ''}</div>
          <div class="note-date">${formatDateTH(f.met_date)}${f.occupation ? ' · ' + escapeHTML(f.occupation) : ''}</div>
        </div>
      </div>
      ${f.met_where ? `<div class="note-insight">${iconSVG('pin', 14)} ${escapeHTML(f.met_where)}</div>` : ''}
      <div class="note-actions-row">
        <button class="btn btn-outline btn-sm" onclick="openFriendListField('${f.id}', 'connections')">${iconSVG('link', 13)} เรื่องที่เชื่อม (${connCount})</button>
        <button class="btn btn-outline btn-sm" onclick="openFriendListField('${f.id}', 'extra_info')">${iconSVG('list', 13)} ข้อมูลเพิ่ม (${infoCount})</button>
      </div>
      <div class="note-actions-row">
        <button class="btn btn-outline btn-sm" onclick="openFriendForm('${f.id}')">แก้ไข</button>
        <button class="btn btn-outline btn-sm" onclick="quickDeleteFriend('${f.id}')">ลบ</button>
      </div>
    </div>
  `;
}

// ---- Add / edit friend ----------------------------------------------

function openFriendForm(friendId) {
  document.getElementById('friend-id').value = friendId || '';
  document.getElementById('friend-met-date').value = todayStr();
  document.getElementById('friend-name').value = '';
  document.getElementById('friend-age').value = '';
  document.getElementById('friend-occupation').value = '';
  document.getElementById('friend-met-where').value = '';
  document.getElementById('friend-delete-btn').classList.add('hidden');
  document.getElementById('friend-modal-title').textContent = 'เพื่อนใหม่';

  if (friendId) {
    const f = friendsCache.find(x => x.id === friendId);
    if (f) {
      document.getElementById('friend-met-date').value = f.met_date;
      document.getElementById('friend-name').value = f.name;
      document.getElementById('friend-age').value = f.age || '';
      document.getElementById('friend-occupation').value = f.occupation || '';
      document.getElementById('friend-met-where').value = f.met_where || '';
      document.getElementById('friend-delete-btn').classList.remove('hidden');
      document.getElementById('friend-modal-title').textContent = 'แก้ไขข้อมูลเพื่อน';
    }
  }

  document.getElementById('friend-modal').style.display = 'flex';
}

function closeFriendForm() {
  document.getElementById('friend-modal').style.display = 'none';
}

async function saveFriend() {
  const id = document.getElementById('friend-id').value;
  const name = document.getElementById('friend-name').value.trim();
  const metDate = document.getElementById('friend-met-date').value;
  if (!name) { showToast('กรุณาใส่ชื่อ', 'warn'); return; }
  if (!metDate) { showToast('กรุณาเลือกวันที่', 'warn'); return; }

  const payload = {
    name,
    met_date: metDate,
    age: parseInt(document.getElementById('friend-age').value, 10) || null,
    occupation: document.getElementById('friend-occupation').value.trim(),
    met_where: document.getElementById('friend-met-where').value.trim()
  };

  setLoading(true);
  let error;
  if (id) {
    ({ error } = await db.from('friends').update(payload).eq('id', id));
  } else {
    ({ error } = await db.from('friends').insert({ ...payload, connections: [], extra_info: [] }));
  }
  setLoading(false);
  if (error) { showToast('บันทึกไม่สำเร็จ: ' + (error.message || error), 'error'); return; }

  showToast('บันทึกสำเร็จ');
  closeFriendForm();
  await loadFriends();
}

async function quickDeleteFriend(id) {
  if (!confirm('ลบรายชื่อนี้ใช่หรือไม่?')) return;
  setLoading(true);
  const { error } = await db.from('friends').delete().eq('id', id);
  setLoading(false);
  if (error) { showToast('ลบไม่สำเร็จ', 'error'); return; }
  showToast('ลบแล้ว');
  await loadFriends();
}

async function deleteFriend(id) {
  if (!id) return;
  await quickDeleteFriend(id);
  closeFriendForm();
}

// ---- เรื่องที่เชื่อม / ข้อมูลเพิ่มเติม (shared list-field modal) -------

function openFriendListField(friendId, field) {
  const f = friendsCache.find(x => x.id === friendId);
  if (!f) return;
  currentListFieldFriendId = friendId;
  currentListFieldName = field;
  listFieldItems = [...(f[field] || [])];
  document.getElementById('friend-listfield-title').textContent = `${f.name}: ${LISTFIELD_LABELS[field]}`;
  document.getElementById('friend-listfield-input').value = '';
  renderFriendListFieldItems();
  document.getElementById('friend-listfield-modal').style.display = 'flex';
}

function closeFriendListField() {
  document.getElementById('friend-listfield-modal').style.display = 'none';
}

function renderFriendListFieldItems() {
  const wrap = document.getElementById('friend-listfield-items');
  if (!listFieldItems.length) {
    wrap.innerHTML = `<div class="text-sub" style="padding:4px 0 8px">ยังไม่มีรายการ</div>`;
    return;
  }
  wrap.innerHTML = listFieldItems.map((text, i) => `
    <div class="friend-listfield-item">
      <span class="friend-listfield-text">${escapeHTML(text)}</span>
      <span class="btn-icon" onclick="editFriendListFieldItem(${i})">${iconSVG('edit', 14)}</span>
      <span class="btn-icon" onclick="removeFriendListFieldItem(${i})">${iconSVG('trash', 14)}</span>
    </div>
  `).join('');
}

function addFriendListFieldItem() {
  const input = document.getElementById('friend-listfield-input');
  const text = input.value.trim();
  if (!text) return;
  listFieldItems.push(text);
  input.value = '';
  renderFriendListFieldItems();
}

function editFriendListFieldItem(idx) {
  document.getElementById('friend-listfield-input').value = listFieldItems[idx];
  listFieldItems.splice(idx, 1);
  renderFriendListFieldItems();
}

function removeFriendListFieldItem(idx) {
  listFieldItems.splice(idx, 1);
  renderFriendListFieldItems();
}

async function saveFriendListField() {
  if (!currentListFieldFriendId) return;
  setLoading(true);
  const { error } = await db.from('friends').update({ [currentListFieldName]: listFieldItems }).eq('id', currentListFieldFriendId);
  setLoading(false);
  if (error) { showToast('บันทึกไม่สำเร็จ', 'error'); return; }
  showToast('บันทึกการเปลี่ยนแปลงแล้ว');
  closeFriendListField();
  await loadFriends();
}
