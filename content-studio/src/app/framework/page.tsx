"use client";

import { useEffect, useState } from "react";
import { Camera, Coffee, Smile, Video } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/PageHeader";
import { Highlight } from "@/components/goal/Highlight";
import {
  CONNECT_EXAMPLE,
  CONNECT_NOTE,
  CONNECT_TITLE,
  CONTENT_MIX,
  FUNNY_NOTE,
  HOLD_ON,
  CORE,
  FIRST_30,
  FORMAT_LABEL,
  FORMAT_SPLIT,
  FORMAT_WHY,
  GOAL_LINE,
  PILLARS,
  PILLARS_NOTE,
  PLAN_NOTE,
  REST_NOTE,
  VIDEO_TYPES,
  WEEK,
  type DayFormat,
} from "@/lib/framework-content";
import { cn } from "@/lib/utils";

const FORMAT_ICON: Record<DayFormat, typeof Video> = { video: Video, photo: Camera, rest: Coffee };

function Head({ eyebrow, title }: { eyebrow?: string; title: string }) {
  return (
    <div className="mb-4">
      {eyebrow && <p className="text-xs font-medium tracking-wide text-muted uppercase">{eyebrow}</p>}
      <h2 className="font-display text-[22px] font-semibold tracking-tight">{title}</h2>
    </div>
  );
}

export default function FrameworkPage() {
  const [today, setToday] = useState<number | null>(null);
  useEffect(() => setToday(new Date().getDay()), []);
  const videos = WEEK.filter((d) => d.format === "video").length;
  const photos = WEEK.filter((d) => d.format === "photo").length;

  return (
    <PageContainer>
      <PageHeader title="Framework" description="PALM Personal Brand — Weekly Content Framework · 5 วัน 5 หมวดคอนเทนต์" />
      <p className="-mt-3 mb-6 text-[14px] text-muted">หมวดประจำสัปดาห์ สำหรับแบรนด์พัฒนาตัวเอง วินัย และคุณภาพชีวิต</p>

      {/* ---------- week ---------- */}
      <section className="overflow-hidden rounded-3xl bg-card shadow-card">
        {WEEK.map((d) => {
          const isToday = today === d.dow;
          const Icon = FORMAT_ICON[d.format];
          if (d.format === "rest") {
            return (
              <div key={d.en} className={cn("flex items-center gap-4 border-b border-line px-5 py-3 last:border-0 md:px-6", isToday && "bg-subtle")}>
                <span className="w-24 shrink-0">
                  <span className="block font-display text-[11px] tracking-wider text-faint">{d.en}</span>
                  <span className="text-[13px] text-muted">{d.th}</span>
                </span>
                <span className="flex flex-1 items-center gap-2 text-[13px] text-muted">
                  <Icon size={14} className="shrink-0" /> {REST_NOTE}
                </span>
                {isToday && <TodayTag />}
              </div>
            );
          }
          return (
            <div
              key={d.en}
              className={cn(
                "grid grid-cols-[6rem_minmax(0,1fr)] gap-x-4 gap-y-2 border-b border-line px-5 py-4 last:border-0 md:grid-cols-[6rem_minmax(0,1fr)_9rem] md:px-6",
                isToday && "bg-primary-soft/50",
              )}
            >
              <span>
                <span className="block font-display text-[11px] font-semibold tracking-wider text-ink">{d.en}</span>
                <span className="text-[13px] text-muted">{d.th}</span>
                {isToday && (
                  <span className="mt-1 block">
                    <TodayTag />
                  </span>
                )}
              </span>
              <span>
                <span className="block text-[16px] font-semibold">{d.title}</span>
                <span className="block text-[13px] text-muted">{d.category}</span>
                <span className="mt-1 block text-[14px] leading-relaxed">{d.body}</span>
              </span>
              <span className="col-start-2 md:col-start-auto md:text-right">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-xs text-ink">
                  <Icon size={13} /> {FORMAT_LABEL[d.format]}
                </span>
              </span>
            </div>
          );
        })}
      </section>
      <p className="mt-3 flex flex-wrap items-center gap-2 text-[13px] text-muted">
        <span className="rounded-full bg-ink px-3 py-1 font-medium text-white">
          รวม {videos} วิดีโอ + {photos} โพสต์รูปภาพ
        </span>
        <Highlight text={PLAN_NOTE} tone="blue" />
      </p>

      {/* ---------- funny is part of the brand ---------- */}
      <section className="mt-6 rounded-3xl border border-orange/40 bg-orange-soft/50 p-5 md:p-6">
        <p className="flex items-center gap-2 text-[16px] font-semibold">
          <Smile size={18} className="text-orange" /> {FUNNY_NOTE.title}
        </p>
        <p className="mt-2 text-[15px] leading-relaxed">
          <Highlight text={FUNNY_NOTE.lead} />
        </p>
        <p className="mt-2 text-[14px] leading-relaxed text-muted">
          <Highlight text={FUNNY_NOTE.why} />
        </p>
      </section>

      {/* ---------- pillars ---------- */}
      <section className="mt-10">
        <Head eyebrow="6 เสาหลัก" title="หลายมิติ แกนกลางเดียว" />
        <div className="grid items-center gap-6 rounded-3xl bg-card p-5 shadow-card md:grid-cols-[16rem_minmax(0,1fr)] md:p-7">
          <PillarHub />
          <div>
            <p className="text-[16px] leading-relaxed">
              <Highlight text={PILLARS_NOTE} tone="blue" />
            </p>
            <ul className="mt-4 grid grid-cols-1 gap-1.5 text-[14px] sm:grid-cols-2">
              {PILLARS.map((p, i) => (
                <li key={p} className="flex items-center gap-2">
                  <span className="font-display text-xs text-faint">{i + 1}</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ---------- ratios ---------- */}
      <section className="mt-10">
        <Head eyebrow="สัดส่วนที่ให้ยึดเป็นหลัก" title="สัดส่วนคอนเทนต์ที่แนะนำ" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <RatioCard title="รูปแบบ" parts={FORMAT_SPLIT} note={FORMAT_WHY} />
          <MixCard />
        </div>
        <div className="mt-4 rounded-3xl border border-line bg-card p-5 md:p-6">
          <p className="text-xs font-semibold text-muted">สิ่งที่อยากเน้น · 30 วันแรก</p>
          <p className="mt-1.5 text-[15px] leading-relaxed">
            <Highlight text={FIRST_30} tone="blue" />
          </p>
          <p className="mt-3 border-t border-line pt-3 text-[15px] leading-relaxed">
            <Highlight text={GOAL_LINE} tone="blue" />
          </p>
        </div>
      </section>

      {/* ---------- video types ---------- */}
      <section className="mt-10">
        <Head title="วิดีโอควรทำแบบไหน?" />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {VIDEO_TYPES.map((v) => (
            <div key={v.name} className="rounded-3xl bg-card p-5 shadow-card">
              <p className="text-[16px] font-semibold">{v.name}</p>
              <p className="mt-1 text-[14px] text-muted">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- what people should feel ---------- */}
      <section className="mt-10 rounded-3xl bg-ink p-6 text-white md:p-8">
        <p className="text-sm font-medium text-white/60">สิ่งที่อยากให้ยึดไว้</p>
        <p className="mt-2 font-display text-[20px] leading-snug font-semibold md:text-[24px]">{HOLD_ON.lead}</p>
        <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {HOLD_ON.items.map((t) => (
            <li key={t} className="flex items-start gap-2.5 rounded-2xl bg-white/5 px-4 py-3 text-[15px]">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-orange" />
              {t}
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- connected content ---------- */}
      <section className="mt-10">
        <Head eyebrow="สิ่งที่อยากให้ทำเป็นพิเศษ" title={CONNECT_TITLE} />
        <p className="mb-4 text-[15px] leading-relaxed">
          <Highlight text={CONNECT_NOTE} tone="blue" />
        </p>
        <div className="rounded-3xl bg-card p-5 shadow-card md:p-7">
          <p className="text-[13px] text-muted">ตัวอย่างหัวข้อเดียว</p>
          <p className="font-display text-xl font-semibold">{CONNECT_EXAMPLE.topic}</p>
          <ol className="mt-5">
            {CONNECT_EXAMPLE.steps.map((s, i) => (
              <li key={s.title} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-3">
                <span className="flex flex-col items-center">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-ink font-display text-sm font-semibold">{i + 1}</span>
                  {i < CONNECT_EXAMPLE.steps.length - 1 && <span className="my-1 w-px flex-1 bg-line-strong" />}
                </span>
                <span className="pb-5">
                  <span className="block text-[16px] font-semibold">{s.title}</span>
                  <span className="mt-0.5 block text-[14px] leading-relaxed text-muted">{s.body}</span>
                </span>
              </li>
            ))}
          </ol>
          <p className="border-t border-line pt-3 text-[13px] text-muted">{CONNECT_EXAMPLE.note}</p>
        </div>
      </section>
    </PageContainer>
  );
}

function TodayTag() {
  return <span className="inline-block rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-white">วันนี้</span>;
}

function RatioCard({ title, parts, note }: { title: string; parts: { pct: number; label: string }[]; note?: string }) {
  return (
    <div className="rounded-3xl bg-card p-5 shadow-card md:p-6">
      <p className="text-xs font-semibold text-muted">{title}</p>
      <div className="mt-3 flex h-3 gap-0.5 overflow-hidden rounded-full">
        {parts.map((p, i) => (
          <span key={p.label} className={i === 0 ? "bg-ink" : "bg-line-strong"} style={{ width: `${p.pct}%` }} />
        ))}
      </div>
      <div className="mt-4 space-y-2">
        {parts.map((p, i) => (
          <p key={p.label} className="flex items-baseline gap-3">
            <span className={cn("w-16 shrink-0 font-display text-2xl font-semibold tabular-nums", i > 0 && "text-muted")}>{p.pct}%</span>
            <span className="text-[14px]">{p.label}</span>
          </p>
        ))}
      </div>
      {note && (
        <p className="mt-3 border-t border-line pt-3 text-[13px] leading-relaxed text-muted">
          <Highlight text={note} tone="blue" />
        </p>
      )}
    </div>
  );
}

/** 6 pillars around one core — quiet line drawing. */
function PillarHub() {
  const R = 92;
  const pts = PILLARS.map((_, i) => {
    const a = (-90 + i * 60) * (Math.PI / 180);
    return { x: 128 + R * Math.cos(a), y: 128 + R * Math.sin(a) };
  });
  return (
    <svg viewBox="0 0 256 256" className="mx-auto w-56 md:w-full" role="img" aria-label={`6 เสาหลัก แกนกลาง: ${CORE}`}>
      {pts.map((p, i) => (
        <line key={i} x1="128" y1="128" x2={p.x} y2={p.y} stroke="var(--color-line-strong)" strokeWidth="1.5" />
      ))}
      {pts.map((p, i) => (
        <g key={PILLARS[i]}>
          <circle cx={p.x} cy={p.y} r="16" fill="var(--color-card)" stroke="var(--color-ink)" strokeWidth="1.5" />
          <text x={p.x} y={p.y + 4.5} textAnchor="middle" fontSize="12" fontWeight="600" fill="var(--color-ink)">
            {i + 1}
          </text>
        </g>
      ))}
      <circle cx="128" cy="128" r="46" fill="var(--color-ink)" />
      <text x="128" y="123" textAnchor="middle" fontSize="11" fill="#fff" fontWeight="600">
        การพัฒนาชีวิต
      </text>
      <text x="128" y="140" textAnchor="middle" fontSize="11" fill="#fff" fontWeight="600">
        อย่างมีระบบ
      </text>
    </svg>
  );
}

/** Mix across all content: 5 categories, quiet bars, Funny accented as a brand trait. */
function MixCard() {
  return (
    <div className="rounded-3xl bg-card p-5 shadow-card md:p-6">
      <p className="text-xs font-semibold text-muted">ภายในคอนเทนต์ทั้งหมด</p>
      <div className="mt-3 flex h-3 gap-0.5 overflow-hidden rounded-full" aria-hidden>
        {CONTENT_MIX.map((m, i) => (
          <span
            key={m.name}
            className={m.funny ? "bg-orange" : ""}
            style={{ width: `${m.pct}%`, background: m.funny ? undefined : `rgb(21 23 28 / ${0.85 - i * 0.15})` }}
          />
        ))}
      </div>
      <div className="mt-4 space-y-3">
        {CONTENT_MIX.map((m) => (
          <div key={m.name}>
            <p className="flex items-baseline justify-between gap-3">
              <span className={cn("text-[15px] font-semibold", m.funny && "text-[#B65A00]")}>{m.name}</span>
              <span className="font-display text-lg font-semibold tabular-nums">{m.pct}%</span>
            </p>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-subtle">
              <div className={cn("h-full rounded-full", m.funny ? "bg-orange" : "bg-ink")} style={{ width: `${m.pct}%` }} />
            </div>
            <p className="mt-1 text-[13px] text-muted">{m.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
