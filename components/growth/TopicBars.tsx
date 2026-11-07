export default function TopicBars({ items }: { items: { tag: string; count: number; pct: number }[] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.tag}>
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink">{item.tag}</span>
            <span className="text-muted">{item.count} บันทึก</span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-secondary">
            <div
              className="h-2 rounded-full bg-linear-to-r from-primary to-accent"
              style={{ width: `${Math.max(item.pct, 4)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
