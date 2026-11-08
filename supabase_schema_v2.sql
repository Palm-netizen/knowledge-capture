-- ============================================================
-- Knowledge Capture v2 — โครงสร้างข้อมูลใหม่ (5 เมนู)
-- รันในโปรเจกต์ Supabase เดิม (ubtowmtqxakjfwllcali) ผ่าน SQL Editor
-- ไม่แก้ไขหรือลบตาราง notes / friends เดิม — เก็บไว้เผื่อย้อนดูได้เสมอ
-- Safe to re-run ทั้งไฟล์
-- ============================================================

create extension if not exists pgcrypto;

-- เจ้าของข้อมูล: บัญชีเดียวที่อ่าน/เขียนได้ (ล็อกอินด้วยชื่อผู้ใช้ diamondpalm
-- ซึ่งแอปแปลงเป็นอีเมล diamondpalm@example.com) — ถ้าเปลี่ยนอีเมลล็อกอิน แก้ที่นี่ที่เดียว
create or replace function is_owner()
returns boolean
language sql
stable
as $$
  select coalesce(auth.jwt() ->> 'email', '') = 'diamondpalm@example.com';
$$;

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ------------------------------------------------------------
-- 1) learning_sources — หนังสือ / Podcast / Audiobook / วิดีโอ / บทความ / คอร์ส
-- ------------------------------------------------------------
create table if not exists learning_sources (
  id            uuid primary key default gen_random_uuid(),
  source_type   text not null default 'book'
                check (source_type in ('book', 'podcast', 'audiobook', 'video', 'article', 'course')),
  title         text not null,
  creator       text not null default '',
  cover_url     text not null default '',
  status        text not null default 'in_progress'
                check (status in ('to_start', 'in_progress', 'completed')),
  started_at    date,
  finished_at   date,
  tags          text[] not null default '{}',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists learning_sources_type_idx on learning_sources (source_type);
create index if not exists learning_sources_status_idx on learning_sources (status);
create index if not exists learning_sources_title_idx on learning_sources (title);

-- หมวด (เช่น "N21 Mobile") — แยกจากประเภทสื่อ (source_type)
alter table learning_sources add column if not exists category text not null default '';
create index if not exists learning_sources_category_idx on learning_sources (category);
-- No full-text GIN index here: the app's search (Library page, source
-- picker) filters client-side, so Postgres full-text search is unused.

drop trigger if exists learning_sources_set_updated_at on learning_sources;
create trigger learning_sources_set_updated_at
  before update on learning_sources
  for each row execute function set_updated_at();

alter table learning_sources enable row level security;
drop policy if exists "allow all" on learning_sources;
drop policy if exists "owner only" on learning_sources;
create policy "owner only" on learning_sources for all to authenticated
  using ((select is_owner())) with check ((select is_owner()));

-- ------------------------------------------------------------
-- 2) learning_notes — Quick Note / Deep Note
-- ------------------------------------------------------------
create table if not exists learning_notes (
  id               uuid primary key default gen_random_uuid(),
  source_id        uuid references learning_sources(id) on delete set null,
  note_level       text not null default 'quick' check (note_level in ('quick', 'deep')),
  captured_at      timestamptz not null default now(),
  highlight        text not null default '',
  learned          text not null default '',
  thought          text not null default '',
  will_apply       text not null default '',
  duration_minutes smallint,
  importance       smallint not null default 3 check (importance between 1 and 5),
  tags             text[] not null default '{}',
  image_urls       text[] not null default '{}',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint learning_notes_image_urls_max_2 check (array_length(image_urls, 1) is null or array_length(image_urls, 1) <= 2)
);

create index if not exists learning_notes_source_idx on learning_notes (source_id);
create index if not exists learning_notes_captured_at_idx on learning_notes (captured_at);
create index if not exists learning_notes_tags_idx on learning_notes using gin (tags);
-- No full-text GIN index here either — same reason as learning_sources.

drop trigger if exists learning_notes_set_updated_at on learning_notes;
create trigger learning_notes_set_updated_at
  before update on learning_notes
  for each row execute function set_updated_at();

alter table learning_notes enable row level security;
drop policy if exists "allow all" on learning_notes;
drop policy if exists "owner only" on learning_notes;
create policy "owner only" on learning_notes for all to authenticated
  using ((select is_owner())) with check ((select is_owner()));

-- ------------------------------------------------------------
-- 3) action_tracker — สิ่งที่นำไปทดลองทำ / งานที่ต้องตามต่อ
-- ------------------------------------------------------------
create table if not exists action_tracker (
  id            uuid primary key default gen_random_uuid(),
  note_id       uuid references learning_notes(id) on delete set null,
  source_id     uuid references learning_sources(id) on delete set null,
  action_text   text not null,
  status        text not null default 'planned' check (status in ('planned', 'in_progress', 'done')),
  result_note   text not null default '',
  due_date      date,
  completed_at  date,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists action_tracker_status_idx on action_tracker (status);
create index if not exists action_tracker_note_idx on action_tracker (note_id);

drop trigger if exists action_tracker_set_updated_at on action_tracker;
create trigger action_tracker_set_updated_at
  before update on action_tracker
  for each row execute function set_updated_at();

alter table action_tracker enable row level security;
drop policy if exists "allow all" on action_tracker;
drop policy if exists "owner only" on action_tracker;
create policy "owner only" on action_tracker for all to authenticated
  using ((select is_owner())) with check ((select is_owner()));

-- ------------------------------------------------------------
-- 4) reflections — ทบทวนประจำวัน/สัปดาห์ + Growth Timeline
-- ------------------------------------------------------------
create table if not exists reflections (
  id               uuid primary key default gen_random_uuid(),
  period_type      text not null default 'weekly' check (period_type in ('daily', 'weekly')),
  period_start     date not null default current_date,
  period_end       date,
  key_lessons      text not null default '',
  applied_summary  text not null default '',
  improve_summary  text not null default '',
  reflection_text  text not null default '',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists reflections_period_start_idx on reflections (period_start);

drop trigger if exists reflections_set_updated_at on reflections;
create trigger reflections_set_updated_at
  before update on reflections
  for each row execute function set_updated_at();

alter table reflections enable row level security;
drop policy if exists "allow all" on reflections;
drop policy if exists "owner only" on reflections;
create policy "owner only" on reflections for all to authenticated
  using ((select is_owner())) with check ((select is_owner()));

-- ------------------------------------------------------------
-- 5) learning_goals — เป้าหมายการเรียนรู้รายเดือน (goal vs. result)
-- ------------------------------------------------------------
create table if not exists learning_goals (
  id            uuid primary key default gen_random_uuid(),
  goal_type     text not null default 'hours' check (goal_type in ('hours', 'notes', 'sources')),
  period_month  date not null,
  target_value  numeric not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (goal_type, period_month)
);

drop trigger if exists learning_goals_set_updated_at on learning_goals;
create trigger learning_goals_set_updated_at
  before update on learning_goals
  for each row execute function set_updated_at();

alter table learning_goals enable row level security;
drop policy if exists "allow all" on learning_goals;
drop policy if exists "owner only" on learning_goals;
create policy "owner only" on learning_goals for all to authenticated
  using ((select is_owner())) with check ((select is_owner()));

-- เป้าหมายรายสัปดาห์ "จำนวนไฟล์ N21 Mobile ที่จะฟัง" ใช้ตาราง learning_goals
-- เดิม: goal_type = 'sources', period_month = วันจันทร์ของสัปดาห์นั้น

-- ------------------------------------------------------------
-- 6) weekly_plan — หัวข้อ N21 Mobile ที่ตั้งใจเรียนในสัปดาห์ (3 ช่อง)
-- ------------------------------------------------------------
create table if not exists weekly_plan (
  id          uuid primary key default gen_random_uuid(),
  week_start  date not null,
  position    smallint not null check (position between 1 and 3),
  source_id   uuid not null references learning_sources(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (week_start, position)
);

alter table weekly_plan enable row level security;
drop policy if exists "allow all" on weekly_plan;
drop policy if exists "owner only" on weekly_plan;
create policy "owner only" on weekly_plan for all to authenticated
  using ((select is_owner())) with check ((select is_owner()));

-- ============================================================
-- Migration — ย้ายข้อมูลเดิมจากตาราง notes เข้าโครงสร้างใหม่
-- ไม่แก้ไข/ลบตาราง notes หรือ friends เดิม
-- รันซ้ำได้อย่างปลอดภัย (ข้าม record ที่ย้ายไปแล้ว โดยเช็คจาก tag "orig_note:<id>")
-- ทั้งบล็อกอยู่ใน IF ที่เช็คว่าตาราง notes มีอยู่จริงก่อน — ถ้าไม่มี (เช่น
-- รันผิดโปรเจกต์) จะข้ามส่วนนี้ไปเฉย ๆ แทนที่จะ error จนตารางใหม่ด้านบน
-- ถูก rollback ไปด้วย (ทั้งสคริปต์รันเป็น transaction เดียว)
-- ============================================================

do $$
begin
  if to_regclass('public.notes') is null then
    raise notice 'Skipping migration: table "notes" does not exist in this project.';
    return;
  end if;

  -- 5a) สร้าง learning_sources จากหนังสือ/สิ่งที่ฟัง (media_type: reading, listening)
  insert into learning_sources (source_type, title, status, tags, created_at, updated_at)
  select
    grp.source_type,
    grp.title,
    'in_progress',
    '{}'::text[],
    grp.created_at,
    grp.updated_at
  from (
    select
      case n.media_type when 'listening' then 'podcast' else 'book' end as source_type,
      n.book_title as title,
      min(n.created_at) as created_at,
      max(n.updated_at) as updated_at
    from notes n
    where n.media_type in ('reading', 'listening')
      and n.book_title is not null
      and n.book_title <> ''
    group by 1, 2
  ) grp
  where not exists (
    select 1 from learning_sources ls
    where ls.title = grp.title and ls.source_type = grp.source_type
  );

  -- 5b) ย้าย notes → learning_notes ผูกกับ learning_sources ที่สร้างไว้ (reading/listening)
  --     ส่วน mind/self ไม่มีแหล่งข้อมูลภายนอก จึงย้ายเป็น learning_notes แบบไม่ผูก source
  --     และใส่ tag เดิม (mind/self) ไว้เพื่อไม่ให้ข้อมูลเดิมหายไป
  insert into learning_notes (
    source_id, note_level, captured_at, highlight, learned, thought, will_apply,
    importance, tags, image_urls, created_at, updated_at
  )
  select
    ls.id as source_id,
    case when coalesce(n.insight, '') <> '' or coalesce(n.action, '') <> '' then 'deep' else 'quick' end as note_level,
    n.created_at as captured_at,
    array_to_string(n.highlights, ' / ') as highlight,
    coalesce(n.insight, '') as learned,
    '' as thought,
    coalesce(n.action, '') as will_apply,
    n.importance,
    n.tags || array['migrated:' || n.media_type, 'orig_note:' || n.id::text] as tags,
    n.image_urls,
    n.created_at,
    n.updated_at
  from notes n
  left join learning_sources ls
    on ls.title = n.book_title
   and ls.source_type = case n.media_type when 'listening' then 'podcast' else 'book' end
   and n.media_type in ('reading', 'listening')
  where not exists (
    select 1 from learning_notes ln
    where ('orig_note:' || n.id::text) = any (ln.tags)
  );

  -- 5c) ย้าย action ของแต่ละ note (ที่มีข้อความ) ไปเป็นรายการใน action_tracker
  insert into action_tracker (note_id, source_id, action_text, status, created_at, updated_at)
  select
    ln.id as note_id,
    ln.source_id,
    n.action,
    case when n.action_done then 'done' else 'planned' end as status,
    n.created_at,
    n.updated_at
  from notes n
  join learning_notes ln on ('orig_note:' || n.id::text) = any (ln.tags)
  where coalesce(n.action, '') <> ''
    and not exists (
      select 1 from action_tracker at2 where at2.note_id = ln.id
    );
end $$;

-- ============================================================
-- Storage: bucket สาธารณะสำหรับรูปปก (แอปบีบอัดเป็น JPEG ~30KB ก่อนอัปโหลด)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('knowledge-photos', 'knowledge-photos', true)
on conflict (id) do update set public = true;

drop policy if exists "kc photos read" on storage.objects;
create policy "kc photos read" on storage.objects
  for select using (bucket_id = 'knowledge-photos');

drop policy if exists "kc photos insert" on storage.objects;
create policy "kc photos insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'knowledge-photos' and (select is_owner()));

drop policy if exists "kc photos delete" on storage.objects;
create policy "kc photos delete" on storage.objects
  for delete to authenticated using (bucket_id = 'knowledge-photos' and (select is_owner()));

-- ตารางเดิมจากแอปเวอร์ชันแรก (ยังมีข้อมูลจริงอยู่) — ล็อกให้เจ้าของเท่านั้นเช่นกัน
do $$
declare t text;
begin
  foreach t in array array['notes', 'friends'] loop
    if to_regclass('public.' || t) is not null then
      execute format('alter table %I enable row level security', t);
      execute format('drop policy if exists "allow all" on %I', t);
      execute format('drop policy if exists "owner only" on %I', t);
      execute format('create policy "owner only" on %I for all to authenticated using ((select is_owner())) with check ((select is_owner()))', t);
    end if;
  end loop;
end $$;

-- ============================================================
-- หมายเหตุ: ตาราง friends เดิม (เมนูเพื่อน) ไม่มีเมนูใหม่ที่รองรับตามสเปค 5 เมนู
-- จึงเก็บตาราง friends ไว้เฉย ๆ โดยไม่ลบและไม่ migrate เข้าโครงสร้างใหม่
-- ============================================================
