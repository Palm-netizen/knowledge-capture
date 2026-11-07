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
    <div className="rounded-[20px] bg-panel px-6 py-5">
      <p className="text-sm font-medium text-ink">{label}</p>
      <p className="mt-6 font-display text-4xl text-ink">{value}</p>
      {sublabel ? <p className="mt-1 text-xs text-muted">{sublabel}</p> : null}
    </div>
  );
}
