"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChartColumn, Check, ChevronLeft, ChevronRight, Lightbulb, Wrench } from "lucide-react";
import { useStore } from "@/lib/store/StoreProvider";
import { PageContainer, PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, SectionTitle } from "@/components/ui/Card";
import { ChipGroup, Segmented } from "@/components/ui/Form";
import { EmptyState } from "@/components/ui/EmptyState";
import { PlatformMark } from "@/components/ui/Badge";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { MetricsDialog } from "@/components/performance/MetricsDialog";
import { METRIC_FIELDS, PLATFORMS } from "@/lib/constants";
import type { Platform, Publication } from "@/lib/types";
import { fmt, isoToDateStr, parseDateStr, relativeDayLabel, todayStr } from "@/lib/date";
import { engagementRate, hasMetrics } from "@/lib/selectors";
import { cn, formatNumber } from "@/lib/utils";
import { studioHref } from "@/lib/routes";
import { PostLink } from "@/components/ui/PostLink";

type Filter = "pending" | "recorded" | "all";

const postedDate = (p: Publication) => (p.publishedAt ? isoToDateStr(p.publishedAt) : p.scheduledDate ?? "");
const sum = (list: Publication[], k: keyof Publication) => list.reduce((n, p) => n + ((p[k] as number | null) ?? 0), 0);

export default function PerformancePage() {
  const store = useStore();
  const { updatePublication } = store;
  const [filter, setFilter] = useState<Filter>("all");
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [month, setMonth] = useState<Date | null>(() => new Date());
  const [editing, setEditing] = useState<Publication | null>(null);

  const today = todayStr();
  const monthKey = month ? `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}` : null;

  const published = useMemo(
    () =>
      store.publications
        .filter((p) => p.status === "published")
        .filter((p) => !platform || p.platform === platform)
        .filter((p) => !monthKey || postedDate(p).startsWith(monthKey))
        .sort((a, b) => postedDate(b).localeCompare(postedDate(a))),
    [store.publications, platform, monthKey],
  );

  const overdue = store.publications.filter((p) => p.status === "scheduled" && p.scheduledDate && p.scheduledDate < today);
  // posted at least a day ago but no numbers yet → time to record results
  const needResults = store.publications.filter(
    (p) => p.status === "published" && !hasMetrics(p) && postedDate(p) && postedDate(p) < today,
  );

  const recorded = published.filter(hasMetrics);
  const list = filter === "pending" ? published.filter((p) => !hasMetrics(p)) : filter === "recorded" ? recorded : published;

  const rates = recorded.map(engagementRate).filter((x): x is number => x !== null);
  const avgRate = rates.length ? rates.reduce((a, b) => a + b, 0) / rates.length : null;

  const lessons = recorded.filter((p) => p.learnings || p.improvements).slice(0, 6);

  if (!store.ready) return <PageSkeleton />;

  const title = (p: Publication) => store.contents.find((c) => c.id === p.contentId)?.title ?? "—";

  return (
    <PageContainer wide>
      <PageHeader title="Performance" description="บันทึกผลหลังโพสต์ แล้วเรียนรู้ว่าคอนเทนต์แบบไหนได้ผล" />

      {needResults.length > 0 && filter !== "pending" && (
        <Card className="mb-6 flex flex-wrap items-center gap-3 border border-primary/20 bg-primary-soft p-4">
          <ChartColumn size={18} className="text-primary" />
          <p className="min-w-0 flex-1 text-sm">
            <span className="font-semibold">{needResults.length} โพสต์</span> โพสต์ไปแล้วเกิน 1 วัน ยังไม่ได้บันทึกยอด — เปิดโพสต์ดูตัวเลข แล้วกรอกได้เลย
          </p>
          <Button
            size="sm"
            variant="primary"
            onClick={() => {
              setMonth(null);
              setFilter("pending");
            }}
          >
            ดูรายการ
          </Button>
        </Card>
      )}

      {overdue.length > 0 && (
        <Card className="mb-6 border-[#EBD9B4] bg-[#FDF9F0] p-4">
          <p className="text-sm font-medium">โพสต์ที่เลยกำหนดแล้ว — โพสต์ไปหรือยัง?</p>
          <div className="mt-2 space-y-1">
            {overdue.map((p) => (
              <div key={p.id} className="flex items-center gap-3 py-1">
                <PlatformMark platform={p.platform} size="xs" />
                <Link href={studioHref(p.contentId, p.platform)} className="min-w-0 flex-1 truncate text-[13px] hover:text-primary">
                  {title(p)} <span className="text-muted">· {relativeDayLabel(p.scheduledDate!)}</span>
                </Link>
                <Button
                  size="sm"
                  onClick={() => {
                    updatePublication(p.id, { status: "published", publishedAt: new Date(`${p.scheduledDate}T12:00:00`).toISOString() });
                  }}
                >
                  <Check size={13} /> โพสต์แล้ว
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Button size="icon" variant="secondary" aria-label="เดือนก่อน" onClick={() => setMonth((m) => new Date((m ?? new Date()).getFullYear(), (m ?? new Date()).getMonth() - 1, 1))}>
            <ChevronLeft size={17} />
          </Button>
          <Button size="icon" variant="secondary" aria-label="เดือนถัดไป" onClick={() => setMonth((m) => new Date((m ?? new Date()).getFullYear(), (m ?? new Date()).getMonth() + 1, 1))}>
            <ChevronRight size={17} />
          </Button>
          <h2 className="ml-1 text-[15px] font-semibold">{month ? fmt.month(month) : "ทุกช่วงเวลา"}</h2>
          <Button size="sm" variant="ghost" onClick={() => setMonth((m) => (m ? null : new Date()))}>
            {month ? "ดูทั้งหมด" : "เดือนนี้"}
          </Button>
        </div>
        <ChipGroup value={platform} onChange={setPlatform} options={PLATFORMS.map((p) => ({ value: p.value, label: p.label }))} allowClear size="sm" />
      </div>

      {/* summary: plain numbers, no decorative charts */}
      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        <Stat label="โพสต์แล้ว" value={formatNumber(published.length)} hint={`บันทึกผล ${recorded.length}`} />
        <Stat label="ยอดเข้าถึงรวม" value={formatNumber(sum(recorded, "reach"))} />
        <Stat label="ยอดดูรวม" value={formatNumber(sum(recorded, "views"))} />
        <Stat label="อัตรามีส่วนร่วมเฉลี่ย" value={avgRate === null ? "–" : `${(avgRate * 100).toFixed(1)}%`} hint="(Like+Comment+Share+Save) ÷ เข้าถึง" />
        <Stat label="ผู้ติดตามใหม่" value={formatNumber(sum(recorded, "newFollowers"))} />
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-[15px] font-semibold">ผลรายโพสต์</h2>
            <Segmented<Filter>
              value={filter}
              onChange={setFilter}
              options={[
                { value: "all", label: "ทั้งหมด", count: published.length },
                { value: "pending", label: "รอบันทึกผล", count: published.length - recorded.length },
                { value: "recorded", label: "บันทึกแล้ว", count: recorded.length },
              ]}
              className="mx-0 px-0"
            />
          </div>

          {list.length === 0 ? (
            <EmptyState
              icon={ChartColumn}
              title={published.length === 0 ? "ยังไม่มีโพสต์ที่เผยแพร่ในช่วงนี้" : "ไม่มีรายการในตัวกรองนี้"}
              description="เมื่อโพสต์แล้ว กด “โพสต์แล้ว” ในปฏิทินหรือห้องผลิต จากนั้นกลับมาบันทึกยอดที่นี่"
            />
          ) : (
            <>
              {/* desktop table */}
              <Card className="hidden overflow-x-auto md:block">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-line text-left text-xs text-muted">
                      <th className="px-4 py-3 font-medium">คอนเทนต์</th>
                      {METRIC_FIELDS.map((m) => (
                        <th key={m.key} className="px-2 py-3 text-right font-medium whitespace-nowrap">
                          {m.label}
                        </th>
                      ))}
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {list.map((p) => (
                      <tr key={p.id} className="hover:bg-subtle/50">
                        <td className="max-w-64 px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <PlatformMark platform={p.platform} size="xs" />
                            <div className="min-w-0">
                              <Link href={studioHref(p.contentId, p.platform)} className="block truncate font-medium hover:text-primary">
                                {title(p)}
                              </Link>
                              <span className="text-xs text-muted">{postedDate(p) ? fmt.short(parseDateStr(postedDate(p))) : ""}</span>
                            </div>
                          </div>
                        </td>
                        {METRIC_FIELDS.map((m) => (
                          <td key={m.key} className={cn("px-2 py-3 text-right tabular-nums", p[m.key] === null && "text-faint")}>
                            {formatNumber(p[m.key])}
                          </td>
                        ))}
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <PostLink url={p.postUrl} />
                          <Button size="sm" variant={hasMetrics(p) ? "ghost" : "secondary"} onClick={() => setEditing(p)}>
                            {hasMetrics(p) ? "แก้ไข" : "บันทึกผล"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
              {/* mobile cards */}
              <div className="space-y-2 md:hidden">
                {list.map((p) => {
                  const er = engagementRate(p);
                  return (
                    <Card key={p.id} className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <PlatformMark platform={p.platform} />
                        <div className="min-w-0 flex-1">
                          <Link href={studioHref(p.contentId, p.platform)} className="block truncate text-sm font-medium">
                            {title(p)}
                          </Link>
                          <span className="text-xs text-muted">{postedDate(p) ? relativeDayLabel(postedDate(p)) : ""}</span>
                        </div>
                        <PostLink url={p.postUrl} />
                        <Button size="sm" variant={hasMetrics(p) ? "ghost" : "primary"} onClick={() => setEditing(p)}>
                          {hasMetrics(p) ? "แก้ไข" : "บันทึกผล"}
                        </Button>
                      </div>
                      {hasMetrics(p) && (
                        <div className="mt-3 grid grid-cols-4 gap-2 border-t border-line pt-3 text-center">
                          <Mini label="เข้าถึง" value={formatNumber(p.reach)} />
                          <Mini label="ดู" value={formatNumber(p.views)} />
                          <Mini label="Save" value={formatNumber(p.saves)} />
                          <Mini label="มีส่วนร่วม" value={er === null ? "–" : `${(er * 100).toFixed(1)}%`} />
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </section>

        <aside className="space-y-6">
          <section>
            <SectionTitle title="แยกตามช่องทาง" />
            <Card className="divide-y divide-line">
              {PLATFORMS.map((pl) => {
                const items = recorded.filter((p) => p.platform === pl.value);
                const r = items.map(engagementRate).filter((x): x is number => x !== null);
                return (
                  <div key={pl.value} className="flex items-center gap-3 px-4 py-3">
                    <PlatformMark platform={pl.value} size="xs" />
                    <span className="flex-1 text-[13px]">{pl.label}</span>
                    <span className="text-right text-xs text-muted tabular-nums">
                      {items.length} โพสต์ · เข้าถึง {formatNumber(sum(items, "reach"))}
                      <br />
                      มีส่วนร่วม {r.length ? `${((r.reduce((a, b) => a + b, 0) / r.length) * 100).toFixed(1)}%` : "–"}
                    </span>
                  </div>
                );
              })}
            </Card>
          </section>

          <section>
            <SectionTitle title="บทเรียนล่าสุด" />
            {lessons.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-line-strong px-4 py-5 text-center text-[13px] text-muted">
                ตอนบันทึกผล ลองเขียน “สิ่งที่ได้เรียนรู้” และ “สิ่งที่จะปรับปรุง” สั้น ๆ — จะสรุปไว้ตรงนี้
              </p>
            ) : (
              <div className="space-y-2">
                {lessons.map((p) => (
                  <Card key={p.id} className="space-y-2 p-3.5 text-[13px]">
                    <button onClick={() => setEditing(p)} className="flex w-full items-center gap-2 text-left text-xs text-muted hover:text-ink">
                      <PlatformMark platform={p.platform} size="xs" />
                      <span className="truncate">{title(p)}</span>
                    </button>
                    {p.learnings && (
                      <p className="flex gap-2">
                        <Lightbulb size={14} className="mt-1 shrink-0 text-[#D39A3A]" />
                        <span className="whitespace-pre-line">{p.learnings}</span>
                      </p>
                    )}
                    {p.improvements && (
                      <p className="flex gap-2">
                        <Wrench size={14} className="mt-1 shrink-0 text-primary" />
                        <span className="whitespace-pre-line">{p.improvements}</span>
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </section>
        </aside>
      </div>

      <MetricsDialog pub={editing} onClose={() => setEditing(null)} />
    </PageContainer>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1.5 text-2xl font-semibold tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-[11px] text-faint">{hint}</p>}
    </Card>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-semibold tabular-nums">{value}</p>
      <p className="text-[11px] text-muted">{label}</p>
    </div>
  );
}
