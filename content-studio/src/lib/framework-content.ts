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
    title: "ข้อคิดและหนังสือ",
    category: "Mindset & Book",
    body: "แนวคิด มุมมอง บทเรียนจากหนังสือและสิ่งที่เรียนรู้",
    format: "photo",
  },
  {
    dow: 2,
    en: "TUESDAY",
    th: "อังคาร",
    title: "ประสบการณ์และเรื่องราวชีวิต",
    category: "My Experience",
    body: "เรื่องจริง ความผิดพลาด การทำงาน ธุรกิจ และบทเรียนส่วนตัว",
    format: "video",
  },
  {
    dow: 3,
    en: "WEDNESDAY",
    th: "พุธ",
    title: "ทดลองและลงมือทำ",
    category: "Practice & Experiment",
    body: "ทดลองพฤติกรรมใหม่ ฝึกวินัย ทดสอบแนวคิด และแชร์ผลลัพธ์",
    format: "video",
  },
  { dow: 4, en: "THURSDAY", th: "พฤหัสบดี", format: "rest" },
  {
    dow: 5,
    en: "FRIDAY",
    th: "ศุกร์",
    title: "สุขภาพและคุณภาพชีวิต",
    category: "Health & Lifestyle",
    body: "อาหาร การออกกำลังกาย การนอน พลังงาน และการดูแลตัวเอง",
    format: "photo",
  },
  { dow: 6, en: "SATURDAY", th: "เสาร์", format: "rest" },
  {
    dow: 0,
    en: "SUNDAY",
    th: "อาทิตย์",
    title: "ธุรกิจ สินค้า และโอกาส",
    category: "Business & Product",
    body: "ความรู้สินค้า ประสบการณ์ใช้ ระบบธุรกิจ ทักษะและโอกาสเติบโต",
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
export const PILLARS = ["Mindset & Book", "My Experience", "Practice & Experiment", "Health & Lifestyle", "Business & Product", "ชีวิตประจำวัน"];

export const PLAN_NOTE = "โพสต์ ==5 วันต่อสัปดาห์== ไม่ต้องโพสต์ทุกวันจนเหนื่อย แต่ต้อง==รักษาความสม่ำเสมอ==";

export const CONTENT_SPLIT = [
  { pct: 80, label: "ให้ความรู้ ประสบการณ์ และสร้างความสัมพันธ์" },
  { pct: 20, label: "สินค้า ธุรกิจ และโอกาส" },
];

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
