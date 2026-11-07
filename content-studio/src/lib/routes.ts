import type { Platform } from "./types";

/** Link to the content workspace. Query-string based so the app can be a static export (GitHub Pages). */
export function studioHref(id: string, platform?: Platform) {
  return `/studio/edit?id=${encodeURIComponent(id)}${platform ? `&v=${platform}` : ""}`;
}
