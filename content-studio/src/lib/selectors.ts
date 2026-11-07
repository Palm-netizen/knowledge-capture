import type { AppData, ContentItem, Publication } from "./types";
import { PLATFORMS } from "./constants";

export function pubsOf(data: Pick<AppData, "publications">, contentId: string): Publication[] {
  const order = PLATFORMS.map((p) => p.value);
  return data.publications
    .filter((p) => p.contentId === contentId)
    .sort((a, b) => order.indexOf(a.platform) - order.indexOf(b.platform));
}

export function contentById(data: Pick<AppData, "contents">, id: string): ContentItem | undefined {
  return data.contents.find((c) => c.id === id);
}

export function sortBySchedule(a: Publication, b: Publication) {
  const ka = `${a.scheduledDate ?? "9999"} ${a.scheduledTime ?? "99:99"}`;
  const kb = `${b.scheduledDate ?? "9999"} ${b.scheduledTime ?? "99:99"}`;
  return ka.localeCompare(kb);
}

export function hasMetrics(p: Publication) {
  return [p.reach, p.views, p.likes, p.comments, p.shares, p.saves, p.newFollowers].some((v) => v !== null);
}

/** (likes + comments + shares + saves) / reach */
export function engagementRate(p: Publication): number | null {
  if (!p.reach) return null;
  const e = (p.likes ?? 0) + (p.comments ?? 0) + (p.shares ?? 0) + (p.saves ?? 0);
  return e / p.reach;
}

/** Content completeness: how many of the key writing fields are filled. */
export function contentProgress(c: ContentItem): { done: number; total: number } {
  const fields = [c.hook, c.mainMessage, c.story, c.takeaway, c.cta, c.caption];
  return { done: fields.filter((f) => f.trim()).length + (c.format ? 1 : 0), total: fields.length + 1 };
}
