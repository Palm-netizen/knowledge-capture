import { N21_CATEGORY } from "./learning-labels";
import type { LearningSource, SourceType } from "./supabase/types";

// The three ways the user captures learning. Derived from a source's
// category/type rather than stored, so existing items sort themselves.
export type CaptureKind = "reading" | "n21" | "podcast";

export const CAPTURE_KINDS: {
  value: CaptureKind;
  label: string;
  pickerLabel: string;
  createAs: { source_type: SourceType; category?: string };
}[] = [
  { value: "reading", label: "การอ่าน", pickerLabel: "หนังสือ / บทความ", createAs: { source_type: "book" } },
  {
    value: "n21",
    label: "ไฟล์ N21",
    pickerLabel: "ไฟล์ N21 Mobile",
    createAs: { source_type: "podcast", category: N21_CATEGORY },
  },
  { value: "podcast", label: "Podcast", pickerLabel: "Podcast", createAs: { source_type: "podcast" } },
];

export function kindOf(source: Pick<LearningSource, "source_type" | "category">): CaptureKind | null {
  if (source.category === N21_CATEGORY) return "n21";
  if (source.source_type === "book" || source.source_type === "article") return "reading";
  if (source.source_type === "podcast" || source.source_type === "audiobook") return "podcast";
  return null;
}
