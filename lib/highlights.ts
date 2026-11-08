// Highlights ("ข้อความที่ประทับใจ") are stored in learning_notes.highlight as one
// sentence per line. Notes migrated from the old app joined them with " / ",
// so both separators are accepted when reading.
export function splitHighlights(text: string | null | undefined): string[] {
  return (text ?? "")
    .split(/\n| \/ /)
    .map((t) => t.trim())
    .filter(Boolean);
}

export function joinHighlights(list: string[]): string {
  return list
    .map((t) => t.trim())
    .filter(Boolean)
    .join("\n");
}
