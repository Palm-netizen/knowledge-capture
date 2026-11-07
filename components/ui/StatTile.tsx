export default function StatTile({
  label,
  value,
  sublabel,
}: {
  label: string;
  value: string;
  sublabel?: string;
}) {
  return (
    <div className="rounded-[14px] border border-border bg-card px-4 py-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 font-display text-2xl text-ink">{value}</p>
      {sublabel ? <p className="mt-0.5 text-xs text-muted">{sublabel}</p> : null}
    </div>
  );
}
