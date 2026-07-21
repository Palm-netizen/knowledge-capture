-- ============================================================
-- Knowledge Capture — Supabase schema
-- แอปนี้แยกอิสระจาก VegFarm ทั้งหมด แนะนำให้สร้าง Supabase project ใหม่
-- ============================================================

create extension if not exists pgcrypto;

create table if not exists notes (
  id             uuid primary key default gen_random_uuid(),
  media_type     text not null default 'reading' check (media_type in ('reading', 'listening', 'mind', 'self')),
  book_title     text not null,
  read_date      date not null default current_date,
  highlights     text[] not null default '{}',
  insight        text default '',
  action         text default '',
  action_done    boolean not null default false,
  importance     smallint not null default 3 check (importance between 1 and 5),
  tags           text[] not null default '{}',
  image_urls     text[] not null default '{}',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint highlights_max_5 check (array_length(highlights, 1) is null or array_length(highlights, 1) <= 5),
  constraint image_urls_max_2 check (array_length(image_urls, 1) is null or array_length(image_urls, 1) <= 2)
);

-- Migration for projects that already ran an earlier version of this file
-- (before the "อ่าน / ฟัง" mode split, or before the "Mind" / "ตัวเอง"
-- modes were added) — safe to re-run, adds the column only if it isn't
-- there yet and widens the check constraint to allow the new modes.
alter table notes add column if not exists media_type text not null default 'reading';
alter table notes drop constraint if exists notes_media_type_check;
alter table notes add constraint notes_media_type_check check (media_type in ('reading', 'listening', 'mind', 'self'));

create index if not exists notes_read_date_idx on notes (read_date);
create index if not exists notes_tags_idx on notes using gin (tags);
create index if not exists notes_book_title_idx on notes (book_title);
create index if not exists notes_media_type_idx on notes (media_type);
create index if not exists notes_search_idx on notes using gin (
  to_tsvector('simple',
    coalesce(book_title, '') || ' ' ||
    coalesce(insight, '') || ' ' ||
    coalesce(action, '') || ' ' ||
    array_to_string(highlights, ' ') || ' ' ||
    array_to_string(tags, ' ')
  )
);

-- Keep updated_at fresh
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists notes_set_updated_at on notes;
create trigger notes_set_updated_at
  before update on notes
  for each row execute function set_updated_at();

-- RLS — เปิดใช้งานแบบ "allow all" เพื่อความง่ายในการเริ่มต้น (ดูคำเตือนใน README)
alter table notes enable row level security;

drop policy if exists "allow all" on notes;
create policy "allow all" on notes for all using (true) with check (true);

-- ============================================================
-- เมนู 7: เพื่อน — Name List (รายชื่อคนที่เพิ่งรู้จัก + STP)
-- ============================================================

create table if not exists friends (
  id            uuid primary key default gen_random_uuid(),
  met_date      date not null default current_date,
  name          text not null,
  age           smallint,
  occupation    text default '',
  met_where     text default '',
  connections   jsonb not null default '[]',  -- เรื่องที่เชื่อมกัน — [ "ข้อความ", ... ]
  extra_info    jsonb not null default '[]',  -- ข้อมูลเพิ่มเติม — [ "ข้อความ", ... ]
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists friends_met_date_idx on friends (met_date);
create index if not exists friends_name_idx on friends (name);

drop trigger if exists friends_set_updated_at on friends;
create trigger friends_set_updated_at
  before update on friends
  for each row execute function set_updated_at();

alter table friends enable row level security;
drop policy if exists "allow all" on friends;
create policy "allow all" on friends for all using (true) with check (true);

-- ============================================================
-- Storage: สร้าง bucket ชื่อ "knowledge-photos" (Public) ผ่าน Dashboard → Storage
-- ใช้เก็บรูปสูงสุด 2 รูปต่อบันทึก
-- ============================================================
