export default function MonthlyHoursChart({
  data,
  goalHours,
}: {
  data: { label: string; minutes: number }[];
  goalHours: number | null;
}) {
  const hours = data.map((d) => d.minutes / 60);
  const max = Math.max(...hours, goalHours ?? 0, 1);

  return (
    <div className="relative flex h-40 items-end gap-3">
      {goalHours ? (
        <div
          className="absolute inset-x-0 border-t border-dashed border-accent"
          style={{ bottom: `${(goalHours / max) * 100}%` }}
        >
          <span className="absolute -top-4 right-0 text-[10px] text-accent">เป้าหมาย {goalHours} ชม.</span>
        </div>
      ) : null}
      {data.map((d) => {
        const h = d.minutes / 60;
        const heightPct = max > 0 ? (h / max) * 100 : 0;
        return (
          <div key={d.label} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
            <div
              title={`${d.label} — ${h.toFixed(1)} ชม.`}
              className="w-full max-w-8 rounded-t-[4px] bg-primary"
              style={{ height: `${Math.max(heightPct, h > 0 ? 3 : 0)}%` }}
            />
            <span className="text-[11px] text-muted">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}
