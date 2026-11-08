// Fuzzy title matching for spotting the same book/talk saved more than once
// (e.g. "วิสัยทัศน์ที่ก้าวไกล" vs "วิสัยทัศน์ที่ก้าวไกล - ray"). Only ever used to
// suggest merges — the user confirms each one.

export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFC")
    .replace(/\(.*?\)|\[.*?\]/g, "")
    .replace(/[\s\-–—_.,:;'"“”‘’!?/\\|#*]+/g, "");
}

function bigrams(s: string): Map<string, number> {
  const m = new Map<string, number>();
  for (let i = 0; i < s.length - 1; i++) {
    const b = s.slice(i, i + 2);
    m.set(b, (m.get(b) ?? 0) + 1);
  }
  return m;
}

export function titleSimilarity(a: string, b: string): number {
  const x = normalizeTitle(a);
  const y = normalizeTitle(b);
  if (!x || !y) return 0;
  if (x === y) return 1;
  // Different numbers usually mean a different part/episode ("ภาค 2", "EP3").
  const digits = (s: string) => (s.match(/\d+/g) ?? []).join(",");
  if (digits(x) !== digits(y)) return 0;

  const [short, long] = x.length <= y.length ? [x, y] : [y, x];
  if (long.includes(short) && short.length / long.length >= 0.6) return 0.9;
  if (x.length < 2 || y.length < 2) return 0;

  const bx = bigrams(x);
  const by = bigrams(y);
  let shared = 0;
  bx.forEach((count, key) => {
    shared += Math.min(count, by.get(key) ?? 0);
  });
  return (2 * shared) / (x.length - 1 + (y.length - 1));
}

export const DUPLICATE_THRESHOLD = 0.8;

export function findDuplicateGroups<T extends { id: string; title: string }>(
  items: T[],
  threshold = DUPLICATE_THRESHOLD
): T[][] {
  const parent = items.map((_, i) => i);
  const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])));

  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      if (titleSimilarity(items[i].title, items[j].title) >= threshold) {
        parent[find(i)] = find(j);
      }
    }
  }

  const groups = new Map<number, T[]>();
  items.forEach((item, i) => {
    const root = find(i);
    groups.set(root, [...(groups.get(root) ?? []), item]);
  });
  return [...groups.values()].filter((g) => g.length > 1);
}

export function groupKey(group: { id: string }[]): string {
  return group
    .map((s) => s.id)
    .sort()
    .join("|");
}
