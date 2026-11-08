export default function NotePhotos({ urls }: { urls: string[] }) {
  if (!urls?.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {urls.map((url, i) => (
        <a
          key={url}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="block h-20 w-20 overflow-hidden rounded-xl border border-border"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt={`รูปที่ ${i + 1}`} loading="lazy" className="h-full w-full object-cover" />
        </a>
      ))}
    </div>
  );
}

export function HighlightList({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="space-y-1.5">
      {items.map((text, i) => (
        <li key={i} className="flex gap-2 text-sm text-ink">
          <span className="mt-0.5 shrink-0 text-accent">&ldquo;</span>
          <span>{text}</span>
        </li>
      ))}
    </ul>
  );
}
