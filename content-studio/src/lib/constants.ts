import type {
  Category,
  ContentFormat,
  ContentStatus,
  IdeaKind,
  IdeaSource,
  IdeaStatus,
  Metrics,
  Platform,
  PublicationStatus,
} from "./types";

type Tone = "neutral" | "green" | "amber" | "blue" | "violet";

export const IDEA_KINDS: { value: IdeaKind; label: string; hint: string }[] = [
  { value: "content", label: "ไอเดียคอนเทนต์", hint: "อยากเล่าเป็นโพสต์" },
  { value: "knowledge", label: "ความรู้", hint: "สิ่งที่ได้เรียนรู้" },
  { value: "business", label: "แนวทางธุรกิจ", hint: "ไอเดียต่อยอดธุรกิจ" },
  { value: "task", label: "งานที่ต้องทำ", hint: "สิ่งที่ต้องลงมือ" },
];

export const IDEA_STATUSES: { value: IdeaStatus; label: string; tone: Tone }[] = [
  { value: "new", label: "ยังไม่คัดเลือก", tone: "neutral" },
  { value: "selected", label: "เลือกแล้ว", tone: "amber" },
  { value: "used", label: "นำไปทำแล้ว", tone: "green" },
];

export const IDEA_SOURCES: { value: IdeaSource; label: string }[] = [
  { value: "experience", label: "ประสบการณ์" },
  { value: "book", label: "หนังสือ" },
  { value: "person", label: "คน" },
  { value: "event", label: "เหตุการณ์" },
  { value: "other", label: "อื่น ๆ" },
];

export const CATEGORIES: { value: Category; label: string }[] = [
  { value: "health", label: "สุขภาพ" },
  { value: "growth", label: "พัฒนาตัวเอง" },
  { value: "business", label: "ธุรกิจ" },
  { value: "experience", label: "ประสบการณ์" },
  { value: "product", label: "สินค้า" },
];

export const CONTENT_STATUSES: { value: ContentStatus; label: string; tone: Tone }[] = [
  { value: "draft", label: "ร่างไอเดีย", tone: "neutral" },
  { value: "producing", label: "กำลังผลิต", tone: "amber" },
  { value: "ready", label: "พร้อมโพสต์", tone: "blue" },
  { value: "published", label: "เผยแพร่แล้ว", tone: "green" },
];

export const FORMATS: { value: ContentFormat; label: string }[] = [
  { value: "reel", label: "Reel / วิดีโอสั้น" },
  { value: "carousel", label: "Carousel" },
  { value: "photo", label: "Photo" },
  { value: "text", label: "Text" },
];

export const PLATFORMS: {
  value: Platform;
  label: string;
  short: string;
  /** Tailwind classes for the small platform mark */
  mark: string;
  dot: string;
}[] = [
  { value: "facebook", label: "Facebook", short: "FB", mark: "bg-[#E8F0FE] text-[#1F5BC6]", dot: "bg-[#3B74D9]" },
  { value: "instagram", label: "Instagram", short: "IG", mark: "bg-[#FCEBF3] text-[#B23A78]", dot: "bg-[#C9518F]" },
  { value: "tiktok", label: "TikTok", short: "TT", mark: "bg-[#ECEEEC] text-[#202923]", dot: "bg-[#202923]" },
];

export const PUBLICATION_STATUSES: { value: PublicationStatus; label: string; tone: Tone }[] = [
  { value: "draft", label: "ยังไม่กำหนด", tone: "neutral" },
  { value: "scheduled", label: "ตั้งเวลาแล้ว", tone: "blue" },
  { value: "published", label: "โพสต์แล้ว", tone: "green" },
];

export const METRIC_FIELDS: { key: keyof Metrics; label: string }[] = [
  { key: "reach", label: "ยอดเข้าถึง" },
  { key: "views", label: "ยอดดู" },
  { key: "likes", label: "Like" },
  { key: "comments", label: "Comment" },
  { key: "shares", label: "Share" },
  { key: "saves", label: "Save" },
  { key: "newFollowers", label: "ผู้ติดตามใหม่" },
];

export function labelOf<T extends string>(list: { value: T; label: string }[], value: T | null | undefined) {
  if (!value) return "";
  return list.find((x) => x.value === value)?.label ?? "";
}

export function platformMeta(p: Platform) {
  return PLATFORMS.find((x) => x.value === p)!;
}
