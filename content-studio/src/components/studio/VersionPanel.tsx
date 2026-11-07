"use client";

import { useState } from "react";
import { ChartColumn, Check, ClipboardCopy, Layers, Plus, RefreshCw, Trash2, Undo2 } from "lucide-react";
import { FORMATS, PLATFORMS, platformMeta } from "@/lib/constants";
import type { ContentItem, Platform, Publication } from "@/lib/types";
import { useStore } from "@/lib/store/StoreProvider";
import { hasMetrics, pubsOf } from "@/lib/selectors";
import { PlatformMark, PublicationStatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ChipGroup, TextInput } from "@/components/ui/Form";
import { Menu } from "@/components/ui/Menu";
import { useFeedback } from "@/components/ui/Feedback";
import { MetricsDialog } from "@/components/performance/MetricsDialog";
import { cn, formatNumber } from "@/lib/utils";
import { WriteBlock } from "./EditorBlocks";

const CAPTION_LIMIT: Record<Platform, number> = { facebook: 63206, instagram: 2200, tiktok: 4000 };
const PLATFORM_TIP: Record<Platform, string> = {
  facebook: "เล่าเรื่องยาวได้ ชวนคุยในคอมเมนต์",
  instagram: "ประโยคแรกต้องหยุดนิ้ว · Hashtag 3–5 อันพอ",
  tiktok: "Hook 3 วินาทีแรกสำคัญที่สุด · Caption สั้น",
};

/** Platform versions of one master content — tabs + independent editor per platform. */
export function VersionPanel({
  item,
  activeId,
  onActiveChange,
}: {
  item: ContentItem;
  activeId: string | null;
  onActiveChange: (id: string | null) => void;
}) {
  const store = useStore();
  const pubs = pubsOf(store, item.id);
  const missing = PLATFORMS.filter((p) => !pubs.some((x) => x.platform === p.value));
  const active = pubs.find((p) => p.id === activeId) ?? pubs[0] ?? null;

  const add = (platform: Platform) => onActiveChange(store.addPublication(item.id, platform).id);

  return (
    <div className="rounded-xl border border-line bg-card">
      <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Layers size={16} className="text-primary" /> เวอร์ชันแพลตฟอร์ม
        </h2>
        {missing.length > 0 && pubs.length > 0 && (
          <div className="flex gap-1">
            {missing.map((p) => (
              <button
                key={p.value}
                onClick={() => add(p.value)}
                title={`เพิ่มเวอร์ชัน ${p.label}`}
                className="flex h-7 items-center gap-1 rounded-md border border-dashed border-line-strong px-2 text-xs text-muted hover:border-primary hover:text-primary"
              >
                <Plus size={12} /> {p.short}
              </button>
            ))}
          </div>
        )}
      </div>

      {pubs.length === 0 ? (
        <div className="px-5 py-8 text-center">
          <p className="text-sm font-medium">แตกต้นฉบับเป็นเวอร์ชันของแต่ละช่องทาง</p>
          <p className="mx-auto mt-1 max-w-xs text-[13px] text-muted">เริ่มจาก Hook, Caption และ Hashtag ของต้นฉบับ แล้วปรับให้เหมาะกับแต่ละแพลตฟอร์ม</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {PLATFORMS.map((p) => (
              <Button key={p.value} size="sm" onClick={() => add(p.value)}>
                <PlatformMark platform={p.value} size="xs" /> {p.label}
              </Button>
            ))}
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="mt-2"
            onClick={() => {
              const created = PLATFORMS.map((p) => store.addPublication(item.id, p.value));
              onActiveChange(created[0].id);
            }}
          >
            สร้างครบทั้ง 3 ช่องทาง
          </Button>
        </div>
      ) : (
        <>
          <div role="tablist" className="scrollbar-none flex gap-1 overflow-x-auto border-b border-line px-3 pt-2">
            {pubs.map((p) => {
              const on = p.id === active?.id;
              return (
                <button
                  key={p.id}
                  role="tab"
                  aria-selected={on}
                  onClick={() => onActiveChange(p.id)}
                  className={cn(
                    "-mb-px flex items-center gap-2 border-b-2 px-2.5 pt-1 pb-2.5 text-[13px] whitespace-nowrap transition-colors",
                    on ? "border-primary font-medium text-ink" : "border-transparent text-muted hover:text-ink",
                  )}
                >
                  <PlatformMark platform={p.platform} size="xs" />
                  {platformMeta(p.platform).label}
                  {p.status !== "draft" && <span className={cn("h-1.5 w-1.5 rounded-full", p.status === "published" ? "bg-primary" : "bg-[#4E82C9]")} />}
                </button>
              );
            })}
          </div>
          {active && <VersionEditor key={active.id} pub={active} master={item} onDeleted={() => onActiveChange(null)} />}
        </>
      )}
    </div>
  );
}

function VersionEditor({ pub, master, onDeleted }: { pub: Publication; master: ContentItem; onDeleted: () => void }) {
  const { updatePublication, deletePublication } = useStore();
  const { confirm, toast } = useFeedback();
  const [metricsOpen, setMetricsOpen] = useState(false);
  const meta = platformMeta(pub.platform);
  const set = <K extends keyof Publication>(key: K) => (v: Publication[K]) => updatePublication(pub.id, { [key]: v } as Partial<Publication>);

  const pullFromMaster = async () => {
    const dirty = pub.hook || pub.caption || pub.hashtags;
    if (dirty) {
      const ok = await confirm({
        title: "ดึงข้อความจากต้นฉบับ?",
        description: `Hook, Caption, Hashtag และรูปแบบของเวอร์ชัน ${meta.label} จะถูกแทนที่ด้วยต้นฉบับ`,
        confirmLabel: "แทนที่",
      });
      if (!ok) return;
    }
    updatePublication(pub.id, { hook: master.hook, caption: master.caption, hashtags: master.hashtags, format: master.format });
    toast("ดึงจากต้นฉบับแล้ว");
  };

  const copyPost = async () => {
    const text = [pub.hook, pub.caption, pub.hashtags].filter((x) => x.trim()).join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      toast(`คัดลอกข้อความ ${meta.label} แล้ว`);
    } catch {
      toast("คัดลอกไม่สำเร็จ", { tone: "error" });
    }
  };

  const remove = async () => {
    const ok = await confirm({ title: `ลบเวอร์ชัน ${meta.label}?`, description: "ข้อความ วันเผยแพร่ และผลลัพธ์ของเวอร์ชันนี้จะถูกลบ", confirmLabel: "ลบ", danger: true });
    if (!ok) return;
    deletePublication(pub.id);
    onDeleted();
    toast(`ลบเวอร์ชัน ${meta.label} แล้ว`);
  };

  const posted = pub.status === "published";

  return (
    <div className="space-y-5 p-4 md:p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <PublicationStatusBadge status={pub.status} />
          <p className="mt-1.5 text-xs text-muted">{PLATFORM_TIP[pub.platform]}</p>
        </div>
        <div className="flex items-center gap-0.5">
          <Button size="sm" variant="ghost" onClick={copyPost} title="คัดลอก Hook + Caption + Hashtag ไปวางในแอป">
            <ClipboardCopy size={14} /> คัดลอก
          </Button>
          <Menu
            items={[
              { label: "ดึงข้อความจากต้นฉบับ", icon: RefreshCw, onSelect: pullFromMaster },
              { label: "ลบเวอร์ชันนี้", icon: Trash2, danger: true, onSelect: remove },
            ]}
          />
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-xs font-medium tracking-wide text-muted">รูปแบบ</p>
        <ChipGroup value={pub.format} onChange={set("format")} options={FORMATS} allowClear size="sm" />
      </div>

      <WriteBlock
        label="Hook"
        value={pub.hook}
        onChange={set("hook")}
        placeholder={master.hook ? `ต้นฉบับ: ${master.hook}` : "ประโยคเปิดสำหรับช่องทางนี้"}
        large
      />
      <WriteBlock
        label="Caption"
        value={pub.caption}
        onChange={set("caption")}
        placeholder={master.caption ? `ต้นฉบับ: ${master.caption.slice(0, 80)}…` : "Caption สำหรับช่องทางนี้"}
        minRows={4}
        counter={CAPTION_LIMIT[pub.platform]}
      />
      <WriteBlock label="Hashtag" value={pub.hashtags} onChange={set("hashtags")} placeholder={master.hashtags || "#แฮชแท็ก"} />

      <div className="rounded-lg bg-subtle/70 p-3.5">
        <p className="mb-2 text-xs font-medium tracking-wide text-muted">วันเผยแพร่</p>
        <div className="flex gap-2">
          <TextInput
            type="date"
            aria-label="วันที่"
            value={pub.scheduledDate ?? ""}
            onChange={(e) => set("scheduledDate")(e.target.value || null)}
            className="flex-1"
          />
          <TextInput type="time" aria-label="เวลา" value={pub.scheduledTime ?? ""} onChange={(e) => set("scheduledTime")(e.target.value || null)} className="w-32" />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {posted ? (
            <>
              <Button size="sm" variant="primary" onClick={() => setMetricsOpen(true)}>
                <ChartColumn size={14} /> {hasMetrics(pub) ? "แก้ไขผลลัพธ์" : "บันทึกผลลัพธ์"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => updatePublication(pub.id, { status: "scheduled" })}>
                <Undo2 size={14} /> ยังไม่ได้โพสต์
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={() => updatePublication(pub.id, { status: "published" })}>
              <Check size={14} /> ทำเครื่องหมายว่าโพสต์แล้ว
            </Button>
          )}
        </div>
        {posted && hasMetrics(pub) && (
          <p className="mt-3 text-xs text-muted">
            เข้าถึง {formatNumber(pub.reach)} · ดู {formatNumber(pub.views)} · Like {formatNumber(pub.likes)} · Save {formatNumber(pub.saves)}
          </p>
        )}
      </div>

      <MetricsDialog pub={metricsOpen ? pub : null} onClose={() => setMetricsOpen(false)} />
    </div>
  );
}
