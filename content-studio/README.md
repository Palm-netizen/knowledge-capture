# SUPPERPALM — Content Studio

โต๊ะทำงานคอนเทนต์ส่วนตัว: **จดไอเดีย → ผลิตคอนเทนต์หลัก → แตกเวอร์ชัน Facebook / Instagram / TikTok → วางปฏิทิน → บันทึกผล**

Next.js (App Router) · TypeScript · Tailwind CSS v4 · Supabase (ไม่บังคับ)

## เริ่มใช้งาน

```bash
cd content-studio
npm install
npm run dev        # http://localhost:3000
```

ถ้ายังไม่ตั้งค่า Supabase แอปจะเก็บข้อมูลไว้ในเบราว์เซอร์ (localStorage) และทุกฟังก์ชันใช้งานได้ครบ

## เชื่อม Supabase

1. Supabase → SQL Editor → รัน `supabase/schema.sql` (สร้าง 3 ตาราง: `ideas`, `content_items`, `content_publications`)
2. `cp .env.example .env.local` แล้วใส่ `NEXT_PUBLIC_SUPABASE_URL` และ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. รีสตาร์ท `npm run dev` — แถบด้านล่างของ Sidebar จะขึ้นว่า “ซิงก์กับ Supabase”

การบันทึกเป็นแบบอัตโนมัติ (รวมคำขอหลายครั้งที่พิมพ์ต่อเนื่องเป็นครั้งเดียวทุก ~0.7 วินาที) และมีสำเนาใน localStorage เสมอ
ถ้าเชื่อมไม่ได้ (เช่น ยังไม่ได้รัน SQL) แอปจะใช้ข้อมูลในเครื่องแทนโดยอัตโนมัติ

> RLS ตั้งเป็น allow-all สำหรับใช้งานคนเดียว ถ้าจะเปิดให้หลายคนใช้ ให้เพิ่ม `user_id` + Supabase Auth ก่อน

## Deploy
Vercel → Import repo → ตั้ง **Root Directory = `content-studio`** → ใส่ env 2 ตัวข้างบน

## โครงสร้าง

```
src/
├── app/                       # 5 เมนู
│   ├── page.tsx               # Overview — สิ่งที่ต้องทำวันนี้
│   ├── ideas/                 # Idea Inbox
│   ├── studio/                # Content Studio (รายการ)
│   │   └── [id]/              # ห้องผลิต: ต้นฉบับ + เวอร์ชันแพลตฟอร์ม
│   ├── calendar/              # ปฏิทิน สัปดาห์ / เดือน
│   └── performance/           # บันทึกผล + บทเรียน
├── components/
│   ├── layout/                # Sidebar, MobileNav, PageHeader, AppShell
│   ├── ui/                    # Button, Badge, Card, Modal, Form, Menu, Feedback (toast/confirm)
│   ├── capture/               # Quick Capture (ปุ่ม/คีย์ N จากทุกหน้า)
│   ├── ideas/ studio/ calendar/ performance/
└── lib/
    ├── types.ts               # โมเดลข้อมูล (ตรงกับ 3 ตาราง)
    ├── constants.ts           # ป้ายสถานะ หมวดหมู่ แพลตฟอร์ม
    ├── store/                 # StoreProvider + persistence (localStorage / Supabase)
    └── date.ts, selectors.ts, utils.ts
```

## Workflow
- **Capture Everything** — ปุ่ม “บันทึกไอเดีย” อยู่ทุกหน้า (มือถือเป็นปุ่มลอย, คอมพิวเตอร์กด `N`) พิมพ์แล้ว Enter เลือกประเภทได้: ไอเดียคอนเทนต์ / ความรู้ / แนวทางธุรกิจ / งานที่ต้องทำ
- **Idea → Content** — กด “ทำคอนเทนต์” บนไอเดีย จะสร้าง Master Content และเปลี่ยนสถานะไอเดียเป็น “นำไปทำแล้ว”
- **Master → Versions** — แต่ละเวอร์ชันเริ่มจาก Hook/Caption/Hashtag ของต้นฉบับ แล้วแก้แยกกันได้ (รวมรูปแบบ วันที่ เวลา สถานะ และผลลัพธ์)
- เมื่อทุกเวอร์ชัน “โพสต์แล้ว” คอนเทนต์หลักจะเปลี่ยนเป็น “เผยแพร่แล้ว” อัตโนมัติ
