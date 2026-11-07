// Drag-and-drop helpers for moving a post (platform version) to another day.
export const DRAG_TYPE = "application/x-supperpalm-pub";

export function startPostDrag(e: React.DragEvent, pubId: string) {
  e.dataTransfer.setData(DRAG_TYPE, pubId);
  e.dataTransfer.setData("text/plain", pubId);
  e.dataTransfer.effectAllowed = "move";
}

export function isPostDrag(e: React.DragEvent) {
  return Array.from(e.dataTransfer.types).includes(DRAG_TYPE);
}
