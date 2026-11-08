// Domain types — mirror the 3 Supabase tables (see supabase/schema.sql).
// Field names are camelCase here; src/lib/store/mappers.ts converts to snake_case.

export type IdeaKind = "content" | "knowledge" | "business" | "task";
export type IdeaStatus = "new" | "selected" | "used";
export type IdeaSource = "experience" | "book" | "person" | "event" | "other";
export type Category = "health" | "growth" | "business" | "experience" | "product";

export interface Idea {
  id: string;
  title: string;
  details: string;
  kind: IdeaKind;
  source: IdeaSource | null;
  sourceNote: string;
  category: Category | null;
  status: IdeaStatus;
  imageUrl: string | null;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export type ContentStatus = "draft" | "producing" | "ready" | "published";
export type ContentFormat = "reel" | "carousel" | "photo" | "text";

export interface ContentItem {
  id: string;
  ideaId: string | null;
  title: string;
  category: Category | null;
  status: ContentStatus;
  // 1. วางแนวคิด
  objective: string;
  audience: string;
  painPoint: string;
  // 2. วางเนื้อหา
  hook: string;
  mainMessage: string;
  story: string;
  takeaway: string;
  cta: string;
  // 3. เตรียมชิ้นงาน
  format: ContentFormat | null;
  script: string;
  onImageText: string;
  caption: string;
  hashtags: string;
  createdAt: string;
  updatedAt: string;
}

export type Platform = "facebook" | "instagram" | "tiktok";
export type PublicationStatus = "draft" | "scheduled" | "published";

export interface Metrics {
  reach: number | null;
  views: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  saves: number | null;
  newFollowers: number | null;
}

export interface Publication extends Metrics {
  id: string;
  contentId: string;
  platform: Platform;
  hook: string;
  caption: string;
  hashtags: string;
  format: ContentFormat | null;
  scheduledDate: string | null; // YYYY-MM-DD
  scheduledTime: string | null; // HH:mm
  status: PublicationStatus;
  publishedAt: string | null; // ISO
  learnings: string;
  improvements: string;
  createdAt: string;
  updatedAt: string;
}

export interface TodoItem {
  text: string;
  done: boolean;
}

/** One row per day: 5 to-dos + the day's experience journal. */
export interface DailyLog {
  id: string;
  date: string; // YYYY-MM-DD
  todos: TodoItem[]; // always 5 slots
  experience: string;
  lesson: string;
  gratitude: string[]; // 3 things I'm grateful for today
  createdAt: string;
  updatedAt: string;
}

/** Small key → JSON value store (e.g. "advance-gratitude"). */
export interface AppSetting {
  id: string;
  value: unknown;
  createdAt: string;
  updatedAt: string;
}

export interface AppData {
  ideas: Idea[];
  contents: ContentItem[];
  publications: Publication[];
  dailyLogs: DailyLog[];
  settings: AppSetting[];
}
