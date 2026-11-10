// PALM Personal Brand — Weekly Content Framework. Text wrapped in ==…== is highlighted.

export type DayFormat = "photo" | "video" | "rest";

export interface FrameworkDay {
  dow: number; // 0 = Sunday … 6 = Saturday (JS getDay)
  en: string;
  th: string; // day name
  title?: string; // Thai category
  category?: string; // English category
  body?: string;
  format: DayFormat;
}

/** Monday-first week. */
export const WEEK: FrameworkDay[] = [
  {
    dow: 1,
    en: "MONDAY",
    th: "จันทร์",
    title: "Mindset / ข้อคิด",
    category: "Knowledge & Mindset",
    body: "แนวคิด มุมมอง บทเรียนจากหนังสือและสิ่งที่เรียนรู้",
    format: "photo",
  },
  {
    dow: 2,
    en: "TUESDAY",
    th: "อังคาร",
    title: "เล่าประสบการณ์",
    category: "Experience & Story",
    body: "เรื่องจริง ความผิดพลาด การทำงาน ธุรกิจ และบทเรียนส่วนตัว",
    format: "video",
  },
  {
    dow: 3,
    en: "WEDNESDAY",
    th: "พุธ",
    title: "Funny / ชีวิตจริง",
    category: "Funny & Entertainment",
    body: "มุกชีวิตประจำวัน ความเปิ่น ความฮา — เรื่องจริงที่ทำให้คนยิ้มได้",
    format: "video",
  },
  { dow: 4, en: "THURSDAY", th: "พฤหัสบดี", format: "rest" },
  {
    dow: 5,
    en: "FRIDAY",
    th: "ศุกร์",
    title: "Health / Lifestyle",
    category: "Health & Lifestyle",
    body: "อาหาร การออกกำลังกาย การนอน พลังงาน และการดูแลตัวเอง",
    format: "photo",
  },
  { dow: 6, en: "SATURDAY", th: "เสาร์", format: "rest" },
  {
    dow: 0,
    en: "SUNDAY",
    th: "อาทิตย์",
    title: "Business / Product แบบสนุก",
    category: "Business & Product",
    body: "ความรู้สินค้า ประสบการณ์ใช้ ระบบธุรกิจ ทักษะและโอกาสเติบโต — เล่าแบบสนุก ไม่ขายแข็ง",
    format: "video",
  },
];

export const FORMAT_LABEL: Record<DayFormat, string> = {
  photo: "รูปภาพ 1 โพสต์",
  video: "วิดีโอ 1 คลิป",
  rest: "พัก",
};

export const REST_NOTE = "พัก หรือแชร์ภาพชีวิตประจำวันแบบไม่ต้องสร้างคอนเทนต์หนัก";

export const CORE = "การพัฒนาชีวิตอย่างมีระบบ";
export const PILLARS_NOTE = "ให้คนรู้จักคุณในหลายมิติ แต่ทุกเสามีแกนกลางเดียวกัน คือ ==การพัฒนาชีวิตอย่างมีระบบ==";
/** 5 content categories + everyday life (Thu / Sat). */
export const PILLARS = ["Knowledge & Mindset", "Experience & Story", "Funny & Entertainment", "Health & Lifestyle", "Business & Product", "ชีวิตประจำวัน"];

export const PLAN_NOTE = "โพสต์ ==5 วันต่อสัปดาห์== ไม่ต้องโพสต์ทุกวันจนเหนื่อย แต่ต้อง==รักษาความสม่ำเสมอ==";

/** Recommended mix across all content (sums to 100). */
export const CONTENT_MIX: { name: string; pct: number; body: string; funny?: boolean }[] = [
  { name: "Knowledge & Mindset", pct: 25, body: "ความรู้ ความคิด หนังสือ และมุมมอง" },
  { name: "Experience & Story", pct: 20, body: "เรื่องจริง ประสบการณ์ และบทเรียน" },
  { name: "Funny & Entertainment", pct: 20, body: "มุกชีวิตประจำวัน ความเปิ่น ความฮา", funny: true },
  { name: "Health & Lifestyle", pct: 20, body: "สุขภาพ การออกกำลังกาย และไลฟ์สไตล์" },
  { name: "Business & Product", pct: 15, body: "ธุรกิจ สินค้า และการต่อยอดรายได้" },
];

export const FUNNY_NOTE = {
  title: "Funny คือเอกลักษณ์ของแบรนด์",
  lead: "Funny ควรเป็น==หนึ่งในเอกลักษณ์ของแบรนด์คุณเลย== ไม่ใช่แค่คอนเทนต์แทรกเป็นครั้งคราว",
  why: "เพราะถ้าเราวางภาพตัวเองเป็นคนพัฒนาตัวเอง มีวินัย คิดเป็นระบบ และจริงจังกับชีวิตมากเกินไป คนอาจรู้สึกว่า==เข้าถึงยาก หรือดูเคร่งเครียดตลอดเวลา==",
};

export const HOLD_ON = {
  lead: "อย่าให้คนจำคุณได้แค่เพราะมีความรู้ แต่ให้เขารู้สึกว่า",
  items: ["ได้ความรู้เมื่อเข้ามาติดตาม", "ได้แรงบันดาลใจจากสิ่งที่คุณลงมือทำ", "ยิ้มได้จากเรื่องราวของคุณ", "รู้สึกว่าเป็นคนธรรมดาที่พัฒนาตัวเองไปด้วยกันได้"],
};

export const FORMAT_SPLIT = [
  { pct: 60, label: "วิดีโอ" },
  { pct: 40, label: "รูปภาพ" },
];
export const FORMAT_WHY =
  "เป้าหมายไม่ได้มีแค่ให้คนเห็นโพสต์ แต่ต้องการให้คน==จดจำตัวตน คุ้นเคยกับการพูด และเชื่อใจในสิ่งที่คุณแบ่งปัน==";
export const FIRST_30 =
  "ช่วง 30 วันแรก อย่าเพิ่งวัดว่ารูปหรือวิดีโอแบบไหนยอดไลก์ดีกว่า ให้==ใช้วิดีโอฝึกความกล้าและสร้างความคุ้นเคย== ส่วน==รูปภาพใช้ถ่ายทอดความคิดและตัวตน=="
export const GOAL_LINE = "เป้าหมายคือทำให้คนเห็นเราบ่อยพอ จนเริ่มรู้ว่า==เราเป็นคนแบบไหน และติดตามเราเพราะอะไร==";

export const VIDEO_TYPES = [
  { name: "พูดหน้ากล้อง", body: "สร้างความคุ้นเคยและความน่าเชื่อถือ" },
  { name: "คลิป Lifestyle", body: "ออกกำลังกาย ทำงานในสวน ใช้ชีวิต พร้อมข้อความสั้น ๆ" },
  { name: "คลิปเล่าประสบการณ์", body: "เล่าเรื่องที่เคยเจอและบทเรียนที่ได้" },
];

export const CONNECT_TITLE = "สร้างคอนเทนต์แบบเชื่อมโยงกัน";
export const CONNECT_NOTE = "ทำให้คอนเทนต์ไม่ใช่เรื่องที่แยกขาดจากกัน — ==หนึ่งเรื่อง แตกออกเป็น 5 คอนเทนต์==";
export const CONNECT_EXAMPLE = {
  topic: "การเอาชนะความอยาก",
  steps: [
    { title: "ข้อคิดจากหนังสือ", body: "ทำไมมนุษย์จึงมักเลือกความสุขระยะสั้นแทนสิ่งที่ดีในระยะยาว" },
    { title: "ประสบการณ์ส่วนตัว", body: "เมื่อก่อนผมชอบกินขนมระหว่างวัน แต่เริ่มสังเกตว่าพฤติกรรมนี้ส่งผลต่อการกินและความรู้สึกอย่างไร" },
    { title: "ทดลองนำไปใช้", body: "ทดลองลดขนมและน้ำตาล 7 วัน พร้อมบันทึกความหิว ความอยาก และพลังงาน" },
    { title: "เชื่อมโยงสุขภาพ", body: "ทำไมการเลือกอาหารและการจัดมื้อให้เหมาะสมจึงเป็นส่วนหนึ่งของการดูแลตัวเอง" },
    { title: "เชื่อมโยงสินค้า", body: "เล่าเรื่องการวางแผนโปรตีนในแต่ละวัน และผลิตภัณฑ์ที่คุณใช้เป็นตัวช่วย โดยอธิบายความเหมาะสมและข้อจำกัด" },
  ],
  note: "นี่คือตัวอย่างการต่อยอดหัวข้อเดียว ไม่จำเป็นต้องโพสต์ครบทั้ง 5 ชิ้นทุกครั้ง",
};
