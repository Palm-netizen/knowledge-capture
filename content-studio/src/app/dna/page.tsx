"use client";

import { AlertTriangle, ArrowRight, Footprints, Lightbulb, Power, Star } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/PageHeader";
import { Highlight } from "@/components/goal/Highlight";
import { CycleRing, Iceberg, MarketPyramid } from "@/components/dna/Figures";
import {
  BRAND,
  CORE_MESSAGE,
  DNA_CYCLE,
  DNA_CYCLE_NOTE,
  DNA_STEPS,
  MARKET_LEVELS,
  MARKET_TITLE,
  PILLARS,
  RECEIVED,
  RECOVERY_LINE,
  REMEMBER,
  REMEMBER_NOTE,
  SEEN,
  STRATEGY,
  STRATEGY_POINT,
  STRATEGY_TITLE,
  STRENGTHS,
  WARNINGS,
} from "@/lib/dna-content";
import { cn } from "@/lib/utils";

const STEP_STYLE = [
  { icon: Power, ring: "border-[#4C74FF]/40 bg-[#4C74FF]/10", text: "text-[#9DB5FF]" },
  { icon: Footprints, ring: "border-[#22A06B]/40 bg-[#22A06B]/10", text: "text-[#7DDBAF]" },
  { icon: Lightbulb, ring: "border-[#8B74FF]/40 bg-[#8B74FF]/10", text: "text-[#C2B6FF]" },
];

function SectionHead({ eyebrow, title }: { eyebrow?: string; title: string }) {
  return (
    <div className="mb-4">
      {eyebrow && <p className="text-xs font-medium tracking-wide text-muted uppercase">{eyebrow}</p>}
      <h2 className="font-display text-[22px] font-semibold tracking-tight md:text-[26px]">{title}</h2>
    </div>
  );
}

export default function DnaPage() {
  return (
    <PageContainer wide>
      <PageHeader title="PALM DNA" description="แกนหลักของ Personal Brand — กลับมาอ่านเมื่อไม่แน่ใจว่าจะเล่าอะไร เพื่อไม่ให้หลุดทาง" />

      {/* ---------- 1. Content DNA ---------- */}
      <section className="overflow-hidden rounded-3xl bg-ink p-5 text-white md:p-8">
        <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,1fr)_15rem]">
          <div>
            <p className="font-display text-sm font-semibold tracking-wide text-white/60">PALM Content DNA</p>
            <div className="mt-4 grid grid-cols-3 gap-2.5 md:gap-3">
              {DNA_STEPS.map((s, i) => {
                const st = STEP_STYLE[i];
                const Icon = st.icon;
                return (
                  <div key={s.key} className={cn("flex flex-col items-center rounded-2xl border px-2 py-4 text-center md:py-5", st.ring)}>
                    <Icon size={20} className={st.text} />
                    <p className="mt-2 text-lg font-semibold md:text-xl">{s.th}</p>
                    <p className="text-xs text-white/60">{s.en}</p>
                  </div>
                );
              })}
            </div>
            <p className="mt-5 text-center font-display text-lg font-semibold md:text-2xl">
              {DNA_CYCLE.map((c, i) => (
                <span key={c}>
                  {c}
                  {i < DNA_CYCLE.length - 1 && <span className="mx-2 text-white/40">→</span>}
                </span>
              ))}
            </p>
            <p className="mt-1.5 text-center text-[13px] text-white/60">{DNA_CYCLE_NOTE}</p>
          </div>
          <CycleRing labels={DNA_CYCLE} className="mx-auto hidden w-56 lg:block" />
        </div>
      </section>

      {/* ---------- 2. Core message ---------- */}
      <section className="mt-6 rounded-3xl bg-gradient-to-br from-primary to-violet p-6 text-center text-white md:p-10">
        <p className="text-sm font-medium text-white/70">Core Message</p>
        <p className="mx-auto mt-2 max-w-3xl font-display text-[24px] leading-snug font-semibold md:text-[34px]">
          <Highlight text={CORE_MESSAGE} tone="light" />
        </p>
      </section>

      {/* ---------- 3. Brand identity ---------- */}
      <section className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
        {BRAND.map((b) => (
          <div key={b.label} className="rounded-3xl bg-card p-5 shadow-card">
            <p className="text-xs font-medium text-primary">{b.label}</p>
            <p className="text-[11px] text-faint">{b.th}</p>
            <p className="mt-2 text-[16px] leading-relaxed font-medium">{b.value}</p>
          </div>
        ))}
      </section>

      {/* ---------- 4. Market levels ---------- */}
      <section className="mt-10">
        <SectionHead eyebrow="มองตลาดเป็น 3 ระดับ" title={MARKET_TITLE} />
        <div className="grid items-start gap-5 rounded-3xl bg-card p-5 shadow-card md:p-7 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <MarketPyramid className="mx-auto w-56 lg:w-full" />
          <div className="space-y-3">
            {MARKET_LEVELS.map((l) =>
              l.level === 3 ? (
                <div key={l.level} className="rounded-2xl border-2 border-orange/60 bg-gradient-to-br from-orange-soft to-violet-soft p-5">
                  <p className="flex items-center gap-2 text-sm font-semibold text-[#B65A00]">
                    <Star size={15} className="fill-orange text-orange" /> ระดับ 3 · พื้นที่ของ PALM
                  </p>
                  <p className="mt-1.5 text-[18px] leading-snug font-semibold">{l.who}</p>
                  <p className="mt-2 text-[15px] leading-relaxed">
                    <Highlight text={l.need} />
                  </p>
                  <p className="mt-3 border-t border-orange/20 pt-3 text-[14px] leading-relaxed text-ink">
                    <Highlight text={l.note} />
                  </p>
                </div>
              ) : (
                <div key={l.level} className="flex gap-4 rounded-2xl bg-subtle/70 p-4">
                  <span className={cn("font-display text-2xl font-semibold", l.level === 2 ? "text-primary" : "text-faint")}>{l.level}</span>
                  <div>
                    <p className="text-[15px] font-semibold">{l.who}</p>
                    <p className="mt-0.5 text-[14px] text-muted">{l.need}</p>
                    <p className="mt-1 text-[13px] text-faint">{l.note}</p>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* ---------- 5. Strengths ---------- */}
      <section className="mt-10">
        <SectionHead eyebrow="จุดแข็ง" title="3 องค์ประกอบที่ PALM นำเสนอ" />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
          {STRENGTHS.map((s) =>
            s.core ? (
              <div key={s.name} className="relative overflow-hidden rounded-3xl bg-ink p-6 text-white md:order-none">
                <div className="pointer-events-none absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-orange/40 blur-2xl" aria-hidden />
                <span className="relative inline-flex items-center gap-1 rounded-full bg-orange px-2.5 py-1 text-[11px] font-semibold">
                  <Star size={11} className="fill-white" /> หัวใจของแบรนด์
                </span>
                <p className="relative mt-3 font-display text-2xl font-semibold">{s.name}</p>
                <p className="relative text-[13px] text-white/60">{s.th}</p>
                <p className="relative mt-3 text-[16px] leading-relaxed">{s.offer}</p>
              </div>
            ) : (
              <div key={s.name} className="rounded-3xl bg-card p-6 shadow-card">
                <p className="font-display text-xl font-semibold">{s.name}</p>
                <p className="text-[13px] text-muted">{s.th}</p>
                <p className="mt-3 text-[15px] leading-relaxed">{s.offer}</p>
              </div>
            ),
          )}
        </div>
        <p className="mt-4 rounded-2xl bg-orange-soft/70 px-5 py-4 text-center text-[16px] leading-relaxed">
          <Highlight text={RECOVERY_LINE} />
        </p>
      </section>

      {/* ---------- 6. Strategy ---------- */}
      <section className="mt-10">
        <SectionHead eyebrow="Strategy" title={STRATEGY_TITLE} />
        <div className="overflow-hidden rounded-3xl bg-card shadow-card">
          <div className="grid grid-cols-[minmax(0,1fr)_2rem_minmax(0,1.3fr)] bg-subtle text-xs font-medium md:grid-cols-[minmax(0,1fr)_3rem_minmax(0,1.3fr)]">
            <span className="px-4 py-3 text-muted md:px-6">คอนเทนต์สุขภาพทั่วไป</span>
            <span />
            <span className="bg-primary-soft px-4 py-3 text-primary md:px-6">คอนเทนต์แบบ PALM</span>
          </div>
          {STRATEGY.map((r) => (
            <div key={r.general} className="grid grid-cols-[minmax(0,1fr)_2rem_minmax(0,1.3fr)] border-t border-line md:grid-cols-[minmax(0,1fr)_3rem_minmax(0,1.3fr)]">
              <span className="px-4 py-3.5 text-[14px] text-muted md:px-6">{r.general}</span>
              <span className="flex items-center justify-center text-faint">
                <ArrowRight size={15} />
              </span>
              <span className="bg-primary-soft/40 px-4 py-3.5 text-[15px] font-semibold md:px-6">{r.palm}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[16px] leading-relaxed">
          <Highlight text={STRATEGY_POINT} tone="blue" />
        </p>
      </section>

      {/* ---------- 7. Pillars ---------- */}
      <section className="mt-10">
        <SectionHead eyebrow="Content Pillars" title="บทบาทของคอนเทนต์แต่ละเสา" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {PILLARS.map((p, i) => (
            <div
              key={p.name}
              className={cn(
                "flex flex-col rounded-3xl p-5",
                p.main ? "col-span-2 bg-ink text-white md:col-span-1" : "bg-card shadow-card",
              )}
            >
              {/* pillar capital */}
              <span className={cn("mb-4 h-1.5 w-10 rounded-full", p.main ? "bg-orange" : ["", "bg-primary", "bg-success", "bg-violet", "bg-[#D2559A]"][i])} />
              <p className={cn("font-display text-[16px] leading-tight font-semibold", p.main && "text-lg")}>{p.name}</p>
              <p className={cn("mt-2 text-[14px] leading-relaxed", p.main ? "text-white/80" : "text-muted")}>{p.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- 8. Seen vs received ---------- */}
      <section className="mt-10">
        <SectionHead eyebrow="ภูเขาน้ำแข็งของแบรนด์" title="สิ่งที่คนเห็น vs สิ่งที่คนได้รับ" />
        <div className="grid items-center gap-5 rounded-3xl bg-card p-5 shadow-card md:grid-cols-[minmax(0,1fr)_10rem_minmax(0,1fr)] md:p-7">
          <div>
            <p className="mb-2 text-sm font-semibold text-muted">สิ่งที่คนเห็นจากคุณ · เหนือน้ำ</p>
            <ul className="space-y-1.5">
              {SEEN.map((s) => (
                <li key={s} className="flex items-center gap-2 text-[15px] text-muted">
                  <span className="h-1.5 w-1.5 rounded-full bg-line-strong" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <Iceberg className="mx-auto w-32 md:w-full" />
          <div className="rounded-2xl bg-violet-soft/60 p-4">
            <p className="mb-2 text-sm font-semibold text-violet">สิ่งที่คนได้รับจากคุณ · ใต้น้ำ</p>
            <ul className="space-y-1.5">
              {RECEIVED.map((s) => (
                <li key={s} className="flex items-center gap-2 text-[15px] font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ---------- 9. Remember ---------- */}
      <section className="mt-10 rounded-3xl bg-ink p-6 text-white md:p-10">
        <p className="text-sm font-medium text-white/60">จำประโยคนี้ไว้</p>
        <p className="mt-3 max-w-4xl font-display text-[21px] leading-snug font-semibold md:text-[28px]">
          <Highlight text={REMEMBER} tone="light" />
        </p>
        <p className="mt-4 text-[14px] text-white/70">{REMEMBER_NOTE}</p>
      </section>

      {/* ---------- 10. Warnings ---------- */}
      <section className="mt-10">
        <h2 className="mb-4 flex items-center gap-2 font-display text-[22px] font-semibold tracking-tight md:text-[26px]">
          <AlertTriangle size={20} className="text-orange" /> สิ่งที่ควรระวัง 3 อย่าง
        </h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
          {WARNINGS.map((w, i) => (
            <div key={w.title} className="rounded-3xl border-l-4 border-orange bg-card p-5 shadow-card">
              <p className="font-display text-sm text-faint">0{i + 1}</p>
              <p className="mt-1 text-[16px] font-semibold">{w.title}</p>
              <p className="mt-1.5 text-[14px] text-muted">{w.body}</p>
            </div>
          ))}
        </div>
      </section>
    </PageContainer>
  );
}
