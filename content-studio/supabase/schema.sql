-- ============================================================
-- SUPPERPALM — Content Studio : Supabase schema (3 tables)
--   ideas                 → เก็บไอเดีย / สิ่งที่บันทึกด่วน
--   content_items         → Master Content + สถานะการผลิต
--   content_publications  → เวอร์ชันแต่ละแพลตฟอร์ม + วันเผยแพร่ + ผลตอบรับ
-- รันไฟล์นี้ใน Supabase → SQL Editor (รันซ้ำได้ปลอดภัย)
-- ============================================================

create extension if not exists pgcrypto;

-- ---------- ideas ----------
create table if not exists ideas (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  details     text not null default '',
  kind        text not null default 'content'
              check (kind in ('content', 'knowledge', 'business', 'task')),
  source      text check (source in ('experience', 'book', 'person', 'event', 'other')),
  source_note text not null default '',
  category    text check (category in ('health', 'growth', 'business', 'experience', 'product')),
  status      text not null default 'new' check (status in ('new', 'selected', 'used')),
  image_url   text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists ideas_status_idx on ideas (status);
create index if not exists ideas_created_idx on ideas (created_at desc);

-- ---------- content_items (Master Content) ----------
create table if not exists content_items (
  id            uuid primary key default gen_random_uuid(),
  idea_id       uuid references ideas (id) on delete set null,
  title         text not null,
  category      text check (category in ('health', 'growth', 'business', 'experience', 'product')),
  status        text not null default 'draft'
                check (status in ('draft', 'producing', 'ready', 'published')),
  -- 1. วางแนวคิด
  objective     text not null default '',
  audience      text not null default '',
  pain_point    text not null default '',
  -- 2. วางเนื้อหา
  hook          text not null default '',
  main_message  text not null default '',
  story         text not null default '',
  takeaway      text not null default '',
  cta           text not null default '',
  -- 3. เตรียมชิ้นงาน
  format        text check (format in ('reel', 'carousel', 'photo', 'text')),
  script        text not null default '',
  on_image_text text not null default '',
  caption       text not null default '',
  hashtags      text not null default '',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists content_items_status_idx on content_items (status);
create index if not exists content_items_idea_idx on content_items (idea_id);

-- ---------- content_publications (Platform Versions) ----------
create table if not exists content_publications (
  id             uuid primary key default gen_random_uuid(),
  content_id     uuid not null references content_items (id) on delete cascade,
  platform       text not null check (platform in ('facebook', 'instagram', 'tiktok')),
  hook           text not null default '',
  caption        text not null default '',
  hashtags       text not null default '',
  format         text check (format in ('reel', 'carousel', 'photo', 'text')),
  scheduled_date date,
  scheduled_time text,
  status         text not null default 'draft' check (status in ('draft', 'scheduled', 'published')),
  published_at   timestamptz,
  -- ผลตอบรับหลังโพสต์
  reach          integer,
  views          integer,
  likes          integer,
  comments       integer,
  shares         integer,
  saves          integer,
  new_followers  integer,
  learnings      text not null default '',
  improvements   text not null default '',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (content_id, platform)
);
create index if not exists content_publications_date_idx on content_publications (scheduled_date);
create index if not exists content_publications_content_idx on content_publications (content_id);

-- ---------- Row Level Security ----------
-- เริ่มต้นแบบ "allow all" สำหรับใช้งานส่วนตัว (anon key)
-- ถ้าจะเปิดหลายผู้ใช้ ให้เพิ่มคอลัมน์ user_id และผูก policy กับ auth.uid()
alter table ideas enable row level security;
alter table content_items enable row level security;
alter table content_publications enable row level security;

drop policy if exists "allow all ideas" on ideas;
create policy "allow all ideas" on ideas for all to anon, authenticated using (true) with check (true);
drop policy if exists "allow all content_items" on content_items;
create policy "allow all content_items" on content_items for all to anon, authenticated using (true) with check (true);
drop policy if exists "allow all content_publications" on content_publications;
create policy "allow all content_publications" on content_publications for all to anon, authenticated using (true) with check (true);

grant select, insert, update, delete on ideas, content_items, content_publications to anon, authenticated;

-- ---------- daily_logs (Daily Journal: 5 to-dos + daily experience) ----------
create table if not exists daily_logs (
  id          uuid primary key default gen_random_uuid(),
  date        date not null unique,
  todos       jsonb not null default '[]'::jsonb,
  experience  text not null default '',
  lesson      text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table daily_logs enable row level security;
drop policy if exists "allow all daily_logs" on daily_logs;
create policy "allow all daily_logs" on daily_logs for all to anon, authenticated using (true) with check (true);
grant select, insert, update, delete on daily_logs to anon, authenticated;

-- ---------- Storage: vision-board photos (Goal page) ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('vision-board', 'vision-board', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;
drop policy if exists "vision-board read" on storage.objects;
create policy "vision-board read" on storage.objects for select to anon, authenticated using (bucket_id = 'vision-board');
drop policy if exists "vision-board insert" on storage.objects;
create policy "vision-board insert" on storage.objects for insert to anon, authenticated with check (bucket_id = 'vision-board');
drop policy if exists "vision-board update" on storage.objects;
create policy "vision-board update" on storage.objects for update to anon, authenticated using (bucket_id = 'vision-board') with check (bucket_id = 'vision-board');
drop policy if exists "vision-board delete" on storage.objects;
create policy "vision-board delete" on storage.objects for delete to anon, authenticated using (bucket_id = 'vision-board');

-- ---------- Gratitude (Goal page) ----------
alter table daily_logs add column if not exists gratitude jsonb not null default '[]'::jsonb;

-- ---------- app_settings (small key → JSON values, e.g. advance-gratitude) ----------
create table if not exists app_settings (
  id          text primary key,
  value       jsonb not null default 'null'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table app_settings enable row level security;
drop policy if exists "allow all app_settings" on app_settings;
create policy "allow all app_settings" on app_settings for all to anon, authenticated using (true) with check (true);
grant select, insert, update, delete on app_settings to anon, authenticated;
