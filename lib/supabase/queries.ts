import { supabase } from "./client";
import type {
  LearningSource,
  LearningNote,
  ActionItem,
  Reflection,
  LearningGoal,
  GoalType,
  WeeklyPlanSlot,
} from "./types";

export type NoteWithSource = LearningNote & { source: LearningSource | null };

export async function fetchSourceById(id: string): Promise<LearningSource | null> {
  const { data, error } = await supabase.from("learning_sources").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ?? null;
}

export async function fetchNotesBySource(sourceId: string): Promise<LearningNote[]> {
  const { data, error } = await supabase
    .from("learning_notes")
    .select("*")
    .eq("source_id", sourceId)
    .order("captured_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchSessionStats(): Promise<
  Pick<LearningNote, "source_id" | "captured_at" | "duration_minutes">[]
> {
  const { data, error } = await supabase
    .from("learning_notes")
    .select("source_id, captured_at, duration_minutes")
    .not("source_id", "is", null)
    .limit(5000);
  if (error) throw error;
  return data ?? [];
}

export async function fetchAllSources(limit = 500): Promise<LearningSource[]> {
  const { data, error } = await supabase
    .from("learning_sources")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function fetchRecentNotes(limit = 6): Promise<NoteWithSource[]> {
  const { data, error } = await supabase
    .from("learning_notes")
    .select("*, source:learning_sources(*)")
    .order("captured_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as unknown as NoteWithSource[];
}

export async function fetchPendingActions(limit = 5): Promise<ActionItem[]> {
  const { data, error } = await supabase
    .from("action_tracker")
    .select("*")
    .in("status", ["planned", "in_progress"])
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function fetchLatestReflection(periodType: Reflection["period_type"] = "weekly"): Promise<Reflection | null> {
  const { data, error } = await supabase
    .from("reflections")
    .select("*")
    .eq("period_type", periodType)
    .order("period_start", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}

export async function fetchSourceCounts(): Promise<{ total: number; completed: number }> {
  const { count: total, error: totalError } = await supabase
    .from("learning_sources")
    .select("*", { count: "exact", head: true });
  if (totalError) throw totalError;

  const { count: completed, error: completedError } = await supabase
    .from("learning_sources")
    .select("*", { count: "exact", head: true })
    .eq("status", "completed");
  if (completedError) throw completedError;

  return { total: total ?? 0, completed: completed ?? 0 };
}

export async function fetchNotesForGrowth(
  limit = 1000
): Promise<Pick<LearningNote, "captured_at" | "duration_minutes" | "tags">[]> {
  const { data, error } = await supabase
    .from("learning_notes")
    .select("captured_at, duration_minutes, tags")
    .order("captured_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function fetchLatestAnyReflection(): Promise<Reflection | null> {
  const { data, error } = await supabase
    .from("reflections")
    .select("*")
    .order("period_start", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}

export async function fetchAllReflections(limit = 50): Promise<Reflection[]> {
  const { data, error } = await supabase
    .from("reflections")
    .select("*")
    .order("period_start", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function fetchAllActionItems(limit = 100): Promise<ActionItem[]> {
  const { data, error } = await supabase
    .from("action_tracker")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function fetchGoal(goalType: GoalType, periodIso: string): Promise<LearningGoal | null> {
  const { data, error } = await supabase
    .from("learning_goals")
    .select("*")
    .eq("goal_type", goalType)
    .eq("period_month", periodIso)
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}

export async function fetchWeeklyPlan(weekStartIso: string): Promise<WeeklyPlanSlot[]> {
  const { data, error } = await supabase
    .from("weekly_plan")
    .select("position, source_id")
    .eq("week_start", weekStartIso);
  if (error) throw error;
  return data ?? [];
}

export type QuoteNote = Pick<LearningNote, "id" | "highlight" | "learned" | "source_id" | "captured_at"> & {
  source: Pick<LearningSource, "title" | "category" | "source_type"> | null;
};

export async function fetchQuoteNotes({
  highlightsOnly = false,
  limit = 1000,
}: { highlightsOnly?: boolean; limit?: number } = {}): Promise<QuoteNote[]> {
  let query = supabase
    .from("learning_notes")
    .select("id, highlight, learned, source_id, captured_at, source:learning_sources(*)")
    .order("captured_at", { ascending: false })
    .limit(limit);
  if (highlightsOnly) query = query.neq("highlight", "");
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as QuoteNote[];
}
