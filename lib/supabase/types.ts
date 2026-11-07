export type SourceType = "book" | "podcast" | "audiobook" | "video" | "article" | "course";
export type SourceStatus = "to_start" | "in_progress" | "completed";
export type NoteLevel = "quick" | "deep";
export type ActionStatus = "planned" | "in_progress" | "done";
export type ReflectionPeriod = "daily" | "weekly";
export type GoalType = "hours" | "notes" | "sources";

export interface LearningSource {
  id: string;
  source_type: SourceType;
  title: string;
  creator: string;
  cover_url: string;
  status: SourceStatus;
  started_at: string | null;
  finished_at: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface LearningNote {
  id: string;
  source_id: string | null;
  note_level: NoteLevel;
  captured_at: string;
  highlight: string;
  learned: string;
  thought: string;
  will_apply: string;
  duration_minutes: number | null;
  importance: number;
  tags: string[];
  image_urls: string[];
  created_at: string;
  updated_at: string;
}

export interface ActionItem {
  id: string;
  note_id: string | null;
  source_id: string | null;
  action_text: string;
  status: ActionStatus;
  result_note: string;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Reflection {
  id: string;
  period_type: ReflectionPeriod;
  period_start: string;
  period_end: string | null;
  key_lessons: string;
  applied_summary: string;
  improve_summary: string;
  reflection_text: string;
  created_at: string;
  updated_at: string;
}

export interface LearningGoal {
  id: string;
  goal_type: GoalType;
  period_month: string;
  target_value: number;
  created_at: string;
  updated_at: string;
}
