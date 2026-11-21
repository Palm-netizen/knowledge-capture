"use client";

import { useEffect, useState } from "react";
import { Calculator } from "lucide-react";
import { useStore } from "@/lib/store/StoreProvider";
import { cn } from "@/lib/utils";
import { fmtNum, parseNum } from "./GoalsFive";

/** ตารางการจ่ายส่วนลดประจำเดือน — BV = PV × 3.23, bonus = BV × % (ไม่รวม core plus) */
export const BV_PER_PV = 3.23;
export const TIERS = [
  { pct: 3, pv: 2_500 },
  { pct: 6, pv: 5_000 },
  { pct: 9, pv: 15_000 },
  { pct: 12, pv: 30_000 },
  { pct: 15, pv: 55_000 },
  { pct: 18, pv: 90_000 },
  { pct: 21, pv: 150_000 },
].map((t) => {
  const bv = Math.round(t.pv * BV_PER_PV * 100) / 100;
  return { ...t, bv, bonus: Math.round(bv * t.pct) / 100 };
});

const KEY = "bv-current";
const money = (n: number) => n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function BonusTable() {
  const store = useStore();
  const saved = store.getSetting<number | null>(KEY, null);
  const [draft, setDraft] = useState(saved != null ? String(saved) : "");
  useEffect(() => setDraft(saved != null ? String(saved) : ""), [saved]);

  const bv = parseNum(draft) ?? 0;
  const reachedIdx = TIERS.reduce((acc, t, i) => (bv >= t.bv ? i : acc), -1);
  const reached = reachedIdx >= 0 ? TIERS[reachedIdx] : null;
  const next = TIERS[reachedIdx + 1] ?? null;
  const bonus = reached ? (bv * reached.pct) / 100 : 0;

  const commit = () => {
    const n = parseNum(draft);
    if (n !== saved) store.saveSetting(KEY, n);
  };

  return (
    <section className="rounded-3xl bg-card p-5 shadow-card md:p-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs font-medium tracking-wide text-muted uppercase">Bonus Calculator</p>
          <h2 className="font-display text-[22px] font-semibold tracking-tight">ตารางการจ่ายส่วนลดประจำเดือน</h2>
        </div>
        <p className="text-[12px] text-faint">BV = PV × {BV_PER_PV} · โบนัส = BV × % (ไม่รวม core plus)</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
        {/* calculator */}
        <div className="rounded-2xl bg-subtle/70 p-4">
          <label htmlFor="bv-now" className="flex items-center gap-1.5 text-[13px] font-medium">
            <Calculator size={15} className="text-primary" /> BV ของฉันเดือนนี้
          </label>
          <input
            id="bv-now"
            inputMode="decimal"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => e.key === "Enter" && (e.currentTarget as HTMLInputElement).blur()}
            placeholder="เช่น 30,000"
            className="mt-2 h-12 w-full rounded-xl border border-line bg-card px-3 font-display text-xl font-semibold tabular-nums focus:border-primary focus:outline-none"
          />
          <p className="mt-1 text-[12px] text-faint">≈ {fmtNum(Math.round((bv / BV_PER_PV) * 100) / 100)} PV</p>

          <dl className="mt-4 space-y-3 text-[14px]">
            <div className="flex items-baseline justify-between gap-2">
              <dt className="text-muted">ขั้นที่ถึงแล้ว</dt>
              <dd className="font-display text-lg font-semibold">{reached ? `${reached.pct}%` : "ยังไม่ถึง 3%"}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <dt className="text-muted">โบนัสโดยประมาณ</dt>
              <dd className="font-display text-lg font-semibold text-primary" data-testid="bonus-estimate">
                ฿{money(bonus)}
              </dd>
            </div>
            {next ? (
              <div className="rounded-xl bg-card p-3">
                <p className="text-[13px] text-muted">ขั้นถัดไป {next.pct}% ({fmtNum(next.bv)} BV)</p>
                <p className="mt-0.5" data-testid="bv-gap">
                  เหลืออีก <span className="font-semibold">{fmtNum(Math.round((next.bv - bv) * 100) / 100)} BV</span>
                  <span className="text-muted"> · ≈ {fmtNum(Math.ceil((next.bv - bv) / BV_PER_PV))} PV</span>
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-subtle">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-violet"
                    style={{ width: `${Math.max(0, Math.min(1, (bv - (reached?.bv ?? 0)) / (next.bv - (reached?.bv ?? 0)))) * 100}%` }}
                  />
                </div>
                <p className="mt-2 text-[12px] text-faint">ถึงขั้นนี้ได้โบนัส ≈ ฿{money(next.bonus)}</p>
              </div>
            ) : (
              <p className="rounded-xl bg-card p-3 font-semibold text-success">ถึงขั้นสูงสุด 21% แล้ว 🎉</p>
            )}
          </dl>
        </div>

        {/* table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[22rem] text-[14px] tabular-nums">
            <thead>
              <tr className="border-b border-line text-left text-[12px] text-muted">
                <th className="py-2 pr-2 font-medium">%</th>
                <th className="py-2 pr-2 text-right font-medium">PV</th>
                <th className="py-2 pr-2 text-right font-medium">BV</th>
                <th className="py-2 text-right font-medium">โบนัส (บาท)</th>
              </tr>
            </thead>
            <tbody>
              {TIERS.map((t, i) => (
                <tr
                  key={t.pct}
                  data-reached={i <= reachedIdx || undefined}
                  className={cn(
                    "border-b border-line/60",
                    i === reachedIdx && "bg-primary-soft font-semibold text-primary",
                    i < reachedIdx && "text-muted",
                    next && t.pct === next.pct && "outline-2 -outline-offset-2 outline-dashed outline-primary/40",
                  )}
                >
                  <td className="py-2.5 pr-2 pl-2 font-display font-semibold">{t.pct}%</td>
                  <td className="py-2.5 pr-2 text-right">{fmtNum(t.pv)}</td>
                  <td className="py-2.5 pr-2 text-right">{fmtNum(t.bv)}</td>
                  <td className="py-2.5 pr-2 text-right">{money(t.bonus)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-[12px] text-faint">แถวสีฟ้า = ขั้นที่ถึงแล้ว · กรอบประ = ขั้นถัดไป</p>
        </div>
      </div>
    </section>
  );
}
