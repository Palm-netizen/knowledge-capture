import { supabase } from "./client";
import type { LearningSource, LearningNote, ActionItem, Reflection } from "./types";

export async function createLearningSource(input: {
  title: string;
  source_type: LearningSource["source_type"];
}): Promise<LearningSource> {
  const { data, error } = await supabase
    .from("learning_sources")
    .insert({ title: input.title, source_type: input.source_type, status: "in_progress" })
    .select("*")
    .single();
  if (error) throw error;
  return data;
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

export async function deleteReflection(id: string): Promise<void> {
  const { error } = await supabase.from("reflections").delete().eq("id", id);
  if (error) throw error;
}
