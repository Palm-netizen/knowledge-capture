import type { SourceStatus, SourceType, NoteLevel, ActionStatus } from "./supabase/types";

export const SOURCE_TYPE_LABEL: Record<SourceType, string> = {
  book: "หนังสือ",
  podcast: "Podcast",
  audiobook: "Audiobook",
  video: "วิดีโอ",
  article: "บทความ",
  course: "คอร์สเรียน",
};

export const SOURCE_STATUS_LABEL: Record<SourceStatus, string> = {
  to_start: "ยังไม่เริ่ม",
  in_progress: "กำลังเรียน",
  completed: "เรียนจบแล้ว",
};

export const NOTE_LEVEL_LABEL: Record<NoteLevel, string> = {
  quick: "Quick Note",
  deep: "Deep Note",
};

export const ACTION_STATUS_LABEL: Record<ActionStatus, string> = {
  planned: "ยังไม่ทำ",
  in_progress: "กำลังทำ",
  done: "ทำแล้ว",
};
