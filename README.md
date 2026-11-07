# 📚 Knowledge Capture — สมุดบันทึกการเรียนรู้ส่วนตัว

แอปเว็บสำหรับจดสิ่งที่ได้เรียนรู้จากหนังสือ, Podcast/Audiobook, วิดีโอ, บทความและคอร์สเรียน แล้วเปลี่ยนความรู้ให้เป็นการลงมือทำจริง — ดีไซน์แบบ "Modern Editorial Reading Journal" เรียบ อบอุ่น ใช้งานง่าย

สร้างด้วย **Next.js (App Router) + TypeScript + Tailwind CSS**, export เป็นไฟล์ static แล้ว deploy ขึ้น GitHub Pages อัตโนมัติผ่าน GitHub Actions

## โครงสร้างไฟล์

```
./
├── app/
│   ├── page.tsx              # 01 ภาพรวม (Dashboard)
│   ├── capture/page.tsx      # 02 บันทึก (Quick Note / Deep Note)
│   ├── library/page.tsx      # 03 คลังความรู้
│   ├── reflection/page.tsx   # 04 ทบทวน
│   ├── growth/page.tsx       # 05 เติบโต
│   ├── layout.tsx            # root layout — ฟอนต์ + AppShell
│   └── globals.css           # ธีมสี/ฟอนต์ (Tailwind v4 @theme)
├── components/
│   ├── layout/                # Sidebar (desktop) / BottomNav (mobile)
│   ├── ui/                    # Card, Pill, StatTile, Loading/Error/EmptyState ฯลฯ
│   ├── sources/                # SourceCard (ใช้ใน Dashboard)
│   ├── capture/                # SourcePicker, NoteListItem
│   ├── library/                # LibraryCard
│   ├── reflection/             # ReflectionCard, ActionTrackerItem
│   └── growth/                 # ConsistencyHeatmap, TopicBars, MonthlyHoursChart
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Supabase client (public anon key)
│   │   ├── types.ts            # TypeScript types ของแต่ละตาราง
│   │   ├── queries.ts          # ฟังก์ชันอ่านข้อมูล
│   │   └── mutations.ts        # ฟังก์ชันเขียน/แก้ไข/ลบข้อมูล
│   ├── format.ts / stats.ts / learning-labels.ts
├── supabase_schema_v2.sql      # schema ใหม่ (5 เมนู) + migration จากตารางเดิม
├── supabase_schema.sql         # schema เดิม (เก็บไว้อ้างอิง ไม่ได้ใช้แล้ว)
└── .github/workflows/deploy-pages.yml   # build + deploy ขึ้น GitHub Pages
```

## โครงสร้างข้อมูล (Supabase)

| ตาราง | ใช้เก็บอะไร |
|---|---|
| `learning_sources` | หนังสือ / Podcast / Audiobook / วิดีโอ / บทความ / คอร์สเรียน |
| `learning_notes` | บันทึก Quick Note / Deep Note — สิ่งที่ได้เรียนรู้, ความคิดที่เกิดขึ้น, สิ่งที่จะนำไปใช้ |
| `action_tracker` | สิ่งที่นำไปทดลองทำ และสถานะ (ยังไม่ทำ / กำลังทำ / ทำแล้ว) |
| `reflections` | รีเฟลกชันรายวัน/รายสัปดาห์ + ข้อความสะท้อนตัวเอง |
| `learning_goals` | เป้าหมายชั่วโมงเรียนรู้รายเดือน |

ตารางเดิม `notes` และ `friends` จากแอปเวอร์ชันก่อนหน้ายังอยู่ใน Supabase project เดิม **ไม่ได้ถูกลบ** — ดูวิธี migrate ข้อมูลเก่าเข้าโครงสร้างใหม่ด้านล่าง

## ขั้นตอนติดตั้ง

### 1. รัน schema ใหม่ใน Supabase

เปิด Supabase Dashboard ของโปรเจกต์เดิม (`ubtowmtqxakjfwllcali`) → **SQL Editor** → รันไฟล์ `supabase_schema_v2.sql` ทั้งไฟล์

ไฟล์นี้จะ:
1. สร้างตารางใหม่ทั้ง 5 ตารางด้านบน
2. ย้ายข้อมูลจากตาราง `notes` เดิม (โหมดอ่าน/ฟัง/Mind/ตัวเอง) เข้าสู่ `learning_sources` + `learning_notes` + `action_tracker` อัตโนมัติ
3. ไม่แตะต้อง/ไม่ลบตาราง `notes` และ `friends` เดิม — รันซ้ำได้อย่างปลอดภัย

### 2. ตั้งค่าการเชื่อมต่อ Supabase (ออปชันนัล)

ค่าเริ่มต้นใน `lib/supabase/client.ts` ชี้ไปที่โปรเจกต์ Supabase เดิมอยู่แล้ว (public anon key — ปลอดภัยที่จะฝังในโค้ดฝั่ง client เพราะมี RLS คุม) ถ้าต้องการเปลี่ยนไปใช้โปรเจกต์อื่น ตั้งค่า environment variables แทน:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
```

### 3. รันแอปบนเครื่อง

```bash
npm install
npm run dev
```

เปิด `http://localhost:3000`

### 4. Build แบบ static export

```bash
npm run build
```

ไฟล์ static จะออกมาที่ `out/`

### 5. Deploy ขึ้น GitHub Pages

Push ขึ้น branch `main` แล้ว GitHub Actions (`.github/workflows/deploy-pages.yml`) จะ build และ deploy ให้อัตโนมัติ — ต้องเปิด **Settings → Pages → Source: GitHub Actions** ไว้ก่อน

## ฟีเจอร์หลัก (5 เมนู)

1. **ภาพรวม** — สถิติการเรียนรู้, กำลังเรียนอยู่, เรียนรู้ล่าสุด, บันทึกล่าสุด, เป้าหมายเดือนนี้, รีเฟลกชันประจำสัปดาห์
2. **บันทึก** — Quick Note (จดเร็ว) และ Deep Note (จดละเอียด: สิ่งที่ได้เรียนรู้ / ความคิดที่เกิดขึ้น / สิ่งที่จะนำไปใช้) ผูกกับแหล่งความรู้ได้ พร้อมดู/แก้ไข/ลบบันทึกย้อนหลัง
3. **คลังความรู้** — ตารางหนังสือ/Podcast/วิดีโอ/บทความทั้งหมด ค้นหาและกรองตามประเภท/สถานะได้
4. **ทบทวน** — เขียนรีเฟลกชันรายวัน/รายสัปดาห์ และติดตามสิ่งที่ต้องลงมือทำ (Action Tracker)
5. **เติบโต** — กราฟความสม่ำเสมอ, ชั่วโมงเรียนรู้รายเดือนเทียบเป้าหมาย, หัวข้อที่เรียนรู้บ่อย, และข้อความสะท้อนการเปลี่ยนแปลงในชีวิตจริง
