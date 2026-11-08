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
  await removeStoredCovers([previousUrl]);
  return updated;
}

// Best effort: delete covers we uploaded ourselves so unused photos don't pile up.
async function removeStoredCovers(urls: string[]): Promise<void> {
  const marker = `/object/public/${PHOTO_BUCKET}/`;
  const paths = urls
    .map((url) => {
      const at = url.indexOf(marker);
      return at === -1 ? null : decodeURIComponent(url.slice(at + marker.length));
    })
    .filter((p): p is string => p !== null);
  if (paths.length) await supabase.storage.from(PHOTO_BUCKET).remove(paths);
}

// Folds `others` into `keep`: every session note and action item moves over,
// missing details are filled from the others, then the others are deleted.
export async function mergeSources(keep: LearningSource, others: LearningSource[]): Promise<LearningSource> {
  const ids = others.map((o) => o.id).filter((id) => id !== keep.id);
  if (ids.length === 0) return keep;

  const { error: notesError } = await supabase.from("learning_notes").update({ source_id: keep.id }).in("source_id", ids);
  if (notesError) throw notesError;
  const { error: actionsError } = await supabase.from("action_tracker").update({ source_id: keep.id }).in("source_id", ids);
  if (actionsError) throw actionsError;

  const all = [keep, ...others];
  const patch: Partial<LearningSource> = {};
  const adoptedCover = keep.cover_url ? null : others.find((o) => o.cover_url)?.cover_url ?? null;
  if (adoptedCover) patch.cover_url = adoptedCover;
  if (!keep.creator) {
    const creator = others.find((o) => o.creator)?.creator;
    if (creator) patch.creator = creator;
  }
  if (!keep.category) {
    const category = others.find((o) => o.category)?.category;
    if (category) patch.category = category;
  }
  const earliestStart = all.map((s) => s.started_at).filter((d): d is string => !!d).sort()[0];
  if (earliestStart && earliestStart !== keep.started_at) patch.started_at = earliestStart;
  if (keep.status !== "completed" && others.some((o) => o.status === "completed")) {
    patch.status = "completed";
    patch.finished_at = all.map((s) => s.finished_at).filter((d): d is string => !!d).sort().pop() ?? null;
  } else if (keep.status === "to_start" && others.some((o) => o.status === "in_progress")) {
    patch.status = "in_progress";
  }
  const tags = [...new Set(all.flatMap((s) => s.tags ?? []))];
  if (tags.length !== (keep.tags ?? []).length) patch.tags = tags;

  const merged = Object.keys(patch).length ? await updateLearningSource(keep.id, patch) : keep;

  const { error: deleteError } = await supabase.from("learning_sources").delete().in("id", ids);
  if (deleteError) throw deleteError;

  await removeStoredCovers(others.map((o) => o.cover_url).filter((url) => url && url !== adoptedCover));
  return merged;
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
