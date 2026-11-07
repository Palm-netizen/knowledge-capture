import { supabase, PHOTO_BUCKET } from "./client";
import type { LearningSource, LearningNote, ActionItem, Reflection, LearningGoal } from "./types";

export async function createLearningSource(input: {
  title: string;
  source_type: LearningSource["source_type"];
  category?: string;
}): Promise<LearningSource> {
  const row: Partial<LearningSource> = {
    title: input.title,
    source_type: input.source_type,
    status: "in_progress",
  };
  if (input.category) row.category = input.category;
  const { data, error } = await supabase.from("learning_sources").insert(row).select("*").single();
  if (error) throw error;
  return data;
}

export async function setSourcesCategory(ids: string[], category: string): Promise<void> {
  if (ids.length === 0) return;
  const { error } = await supabase.from("learning_sources").update({ category }).in("id", ids);
  if (error) throw error;
}

export async function uploadSourceCover(
  sourceId: string,
  image: Blob,
  previousUrl: string
): Promise<LearningSource> {
  const path = `covers/${sourceId}-${Date.now()}.jpg`;
  const bucket = supabase.storage.from(PHOTO_BUCKET);
  const { error: uploadError } = await bucket.upload(path, image, {
    contentType: "image/jpeg",
    cacheControl: "31536000",
  });
  if (uploadError) throw uploadError;

  const publicUrl = bucket.getPublicUrl(path).data.publicUrl;
  const updated = await updateLearningSource(sourceId, { cover_url: publicUrl });

  // Best effort: drop the cover this one replaced so old photos don't pile up.
  const marker = `/object/public/${PHOTO_BUCKET}/`;
  const at = previousUrl.indexOf(marker);
  if (at !== -1) {
    await bucket.remove([decodeURIComponent(previousUrl.slice(at + marker.length))]);
  }
  return updated;
}

export async function updateLearningSource(id: string, patch: Partial<LearningSource>): Promise<LearningSource> {
  const { data, error } = await supabase.from("learning_sources").update(patch).eq("id", id).select("*").single();
  if (error) throw error;
  return data;
}

export async function deleteLearningSource(id: string): Promise<void> {
  const { error } = await supabase.from("learning_sources").delete().eq("id", id);
  if (error) throw error;
}

export async function createLearningNote(input: Partial<LearningNote>): Promise<LearningNote> {
  const { data, error } = await supabase.from("learning_notes").insert(input).select("*").single();
  if (error) throw error;
  return data;
}

export async function updateLearningNote(id: string, patch: Partial<LearningNote>): Promise<LearningNote> {
  const { data, error } = await supabase.from("learning_notes").update(patch).eq("id", id).select("*").single();
  if (error) throw error;
  return data;
}

export async function deleteLearningNote(id: string): Promise<void> {
  const { error } = await supabase.from("learning_notes").delete().eq("id", id);
  if (error) throw error;
}

export async function createActionItems(
  items: { note_id: string | null; source_id: string | null; action_text: string }[]
): Promise<void> {
  if (items.length === 0) return;
  const { error } = await supabase.from("action_tracker").insert(items);
  if (error) throw error;
}

export async function updateActionItem(id: string, patch: Partial<ActionItem>): Promise<ActionItem> {
  const { data, error } = await supabase.from("action_tracker").update(patch).eq("id", id).select("*").single();
  if (error) throw error;
  return data;
}

export async function deleteActionItem(id: string): Promise<void> {
  const { error } = await supabase.from("action_tracker").delete().eq("id", id);
  if (error) throw error;
}

export async function createReflection(input: Partial<Reflection>): Promise<Reflection> {
  const { data, error } = await supabase.from("reflections").insert(input).select("*").single();
  if (error) throw error;
  return data;
}

export async function updateReflection(id: string, patch: Partial<Reflection>): Promise<Reflection> {
  const { data, error } = await supabase.from("reflections").update(patch).eq("id", id).select("*").single();
  if (error) throw error;
  return data;
}

export async function upsertMonthlyHoursGoal(periodMonthIso: string, targetHours: number): Promise<LearningGoal> {
  const { data, error } = await supabase
    .from("learning_goals")
    .upsert(
      { goal_type: "hours", period_month: periodMonthIso, target_value: targetHours },
      { onConflict: "goal_type,period_month" }
    )
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteReflection(id: string): Promise<void> {
  const { error } = await supabase.from("reflections").delete().eq("id", id);
  if (error) throw error;
}
