// 30-Day Scorecard — 3 levels: Daily (do) → Weekly (check) → Monthly (measure).
// Stored in app_settings:
//   checklist:YYYY-MM-DD   → string[]  ids of daily items done
//   weekly:YYYY-MM-DD      → WeeklyEntry  (key = Monday of the week)
//   scorecard:YYYY-MM      → MonthlyEntry

export const LEVELS = [
  {
    key: "daily",
    en: "Daily",
    name: "Daily Checklist",
    verb: "ลงมือทำ",
    question: "วันนี้เราทำอะไรเพื่อสร้างตัวตนและดูแลความสัมพันธ์กับผู้ติดตาม",
  },
  {
    key: "weekly",
    en: "Weekly",
    name: "Weekly Review",
    verb: "ตรวจสอบ",
    question: "สัปดาห์นี้เราทำได้ตามแผนหรือไม่ อะไรได้ผล และอะไรต้องปรับ",
  },
  {
    key: "monthly",
    en: "Monthly",
    name: "30-Day Scorecard",
    verb: "วัดผล",
    question: "30 วันที่ผ่านมา แบรนด์เติบโตขึ้นหรือไม่ มีความไว้วางใจและโอกาสทางธุรกิจเพิ่มขึ้นหรือไม่",
  },
] as const;
export type LevelKey = (typeof LEVELS)[number]["key"];

export const DAILY_GROUPS: { key: string; title: string; items: { id: string; text: string }[] }[] = [
  {
    key: "A",
    title: "Content & Personal Brand",
    items: [
      { id: "a1", text: "คิดหรือเตรียมหัวข้อคอนเทนต์" },
      { id: "a2", text: "ถ่ายหรือโพสต์คอนเทนต์ตามแผน" },
      { id: "a3", text: "ฝึกพูดหน้ากล้องหรือเล่าเรื่องด้วยภาษาตัวเอง" },
    ],
  },
  {
    key: "B",
    title: "Audience & Relationship",
    items: [
      { id: "b1", text: "ตอบคอมเมนต์และข้อความ" },
      { id: "b2", text: "มีปฏิสัมพันธ์กับผู้ติดตามหรือคนรู้จัก" },
      { id: "b3", text: "บันทึกคำถามหรือประเด็นที่คนสนใจ" },
    ],
  },
  {
    key: "C",
    title: "Health Business",
    items: [
      { id: "c1", text: "พูดคุยกับผู้สนใจเรื่องสุขภาพ" },
      { id: "c2", text: "ติดตามหรือดูแลลูกค้าเดิม" },
      { id: "c3", text: "บันทึกความต้องการและขั้นตอนถัดไปของลูกค้า" },
    ],
  },
];
export const DAILY_TOTAL = DAILY_GROUPS.reduce((n, g) => n + g.items.length, 0);

/** Weekly items; `fromDaily` = the daily item whose count this week is shown as a hint. */
export const WEEKLY_ITEMS: { id: string; text: string; fromDaily?: string; target?: number }[] = [
  { id: "w1", text: "โพสต์คอนเทนต์ครบตามแผน", fromDaily: "a2" },
  { id: "w2", text: "พูดหน้ากล้องอย่างน้อย 3 ครั้งในสัปดาห์", fromDaily: "a3", target: 3 },
  { id: "w3", text: "ตอบคอมเมนต์และข้อความ", fromDaily: "b1" },
  { id: "w4", text: "บันทึกหัวข้อที่คนสนใจ", fromDaily: "b3" },
  { id: "w5", text: "พูดคุยกับคนที่สนใจดูแลสุขภาพ", fromDaily: "c1" },
  { id: "w6", text: "ติดตามลูกค้าเดิมอย่างใส่ใจ", fromDaily: "c2" },
  { id: "w7", text: "ทบทวนผลคอนเทนต์ประจำสัปดาห์" },
];

export interface WeeklyEntry {
  done: string[];
  worked: string;
  adjust: string;
}

export interface MonthlyEntry {
  growth: string;
  trust: string;
  opportunity: string;
  next: string;
  followers: string;
  inquiries: string;
  customers: string;
}

export const EMPTY_WEEKLY: WeeklyEntry = { done: [], worked: "", adjust: "" };
export const EMPTY_MONTHLY: MonthlyEntry = { growth: "", trust: "", opportunity: "", next: "", followers: "", inquiries: "", customers: "" };

export const MONTHLY_QUESTIONS: { key: "growth" | "trust" | "opportunity" | "next"; label: string; placeholder: string }[] = [
  { key: "growth", label: "แบรนด์เติบโตขึ้นหรือไม่?", placeholder: "เช่น คนจำได้มากขึ้น มีคนแชร์ คอนเทนต์ไหนได้ผล…" },
  { key: "trust", label: "ความไว้วางใจเพิ่มขึ้นหรือไม่?", placeholder: "เช่น มีคนทักมาปรึกษา เล่าเรื่องส่วนตัวให้ฟัง ขอคำแนะนำ…" },
  { key: "opportunity", label: "โอกาสทางธุรกิจเพิ่มขึ้นหรือไม่?", placeholder: "เช่น มีผู้สนใจสินค้า ลูกค้าเก่ากลับมาซื้อ ได้รับการแนะนำต่อ…" },
  { key: "next", label: "30 วันถัดไป จะทำอะไรให้ดีขึ้น?", placeholder: "สิ่งที่จะทำต่อ / ทำเพิ่ม / เลิกทำ" },
];

export const MONTHLY_NUMBERS: { key: "followers" | "inquiries" | "customers"; label: string }[] = [
  { key: "followers", label: "ผู้ติดตามใหม่" },
  { key: "inquiries", label: "คนทักมาสอบถาม" },
  { key: "customers", label: "ลูกค้าใหม่" },
];

export const checklistKey = (date: string) => `checklist:${date}`;
export const weeklyKey = (monday: string) => `weekly:${monday}`;
export const monthlyKey = (ym: string) => `scorecard:${ym}`;
