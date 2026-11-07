import { formatThaiDate } from "@/lib/format";
import type { HeatmapCell } from "@/lib/stats";

function levelClass(count: number) {
  if (count === 0) return "bg-secondary";
  if (count === 1) return "bg-primary/25";
  if (count === 2) return "bg-primary/50";
  if (count === 3) return "bg-primary/75";
  return "bg-primary";
}

export default function ConsistencyHeatmap({ weeksGrid }: { weeksGrid: HeatmapCell[][] }) {
  return (
    <div className="overflow-x-auto">
      <div className="grid grid-flow-col gap-1" style={{ gridTemplateRows: "repeat(7, 12px)" }}>
        {weeksGrid.map((week, wIdx) =>
          week.map((cell, dIdx) => (
            <div
              key={`${wIdx}-${dIdx}`}
              title={`${formatThaiDate(cell.date.toISOString(), { short: true })} — ${cell.count} บันทึก`}
              className={`h-3 w-3 rounded-[3px] ${levelClass(cell.count)}`}
            />
          ))
        )}
      </div>
    </div>
  );
}
