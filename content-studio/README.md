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

## Supabase

เชื่อมกับ Supabase project ของ Content Studio แล้ว (แยกจาก Knowledge Capture):
`https://nnyyrzojdujpwwdhwgxj.supabase.co` — ค่าอยู่ในไฟล์ `.env` (publishable key เปิดเผยได้ สิทธิ์ถูกคุมด้วย RLS)

- ตารางถูกสร้างแล้วจาก `supabase/schema.sql` (รันซ้ำได้ปลอดภัย ถ้าต้องสร้าง project ใหม่)
- ถ้าจะชี้ไป project อื่น สร้าง `.env.local` แล้วใส่ `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` (จะทับค่าใน `.env`)
- **ห้าม**ใส่ service_role / secret key ในไฟล์ใด ๆ ของแอปนี้

การบันทึกเป็นแบบอัตโนมัติ (รวมการพิมพ์ต่อเนื่องเป็นคำขอเดียวทุก ~0.7 วินาที) และมีสำเนาใน localStorage เสมอ
ถ้าเชื่อม Supabase ไม่ได้ (เช่น ออฟไลน์) แอปจะใช้ข้อมูลในเครื่องแทน และ Sidebar จะแสดงว่า “เก็บในเครื่องนี้”

> RLS ตั้งเป็น allow-all สำหรับใช้งานคนเดียว ใครมีลิงก์เว็บก็อ่าน/เขียนได้ ถ้าจะเปิดสาธารณะหรือหลายคน ให้เพิ่ม Supabase Auth + `user_id` ก่อน

## Deploy (GitHub Pages)

ทุกครั้งที่ merge เข้า `main` workflow `.github/workflows/deploy-pages.yml` จะ build แอปนี้แบบ static export แล้วเผยแพร่ที่
**https://palm-netizen.github.io/knowledge-capture/studio/** (แอป Knowledge Capture เดิมยังอยู่ที่ `/knowledge-capture/`)

- ค่า Supabase อ่านจาก `.env` ตอน build อัตโนมัติ
- หน้าห้องผลิตใช้ลิงก์แบบ `/studio/edit/?id=…` เพื่อให้เป็นไฟล์ static ได้
- build เองในเครื่อง: `NEXT_PUBLIC_BASE_PATH=/knowledge-capture/studio npm run build` → ไฟล์อยู่ใน `out/`

## โครงสร้าง

```
src/
├── app/                       # 5 เมนู
│   ├── page.tsx               # Overview — สิ่งที่ต้องทำวันนี้
│   ├── ideas/                 # Idea Inbox
│   ├── studio/                # Content Studio (รายการ)
│   │   └── edit/              # ห้องผลิต (?id=…): ต้นฉบับ + เวอร์ชันแพลตฟอร์ม
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
