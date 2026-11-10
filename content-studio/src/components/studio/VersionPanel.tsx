"use client";

import { useEffect, useState } from "react";
import { ChartColumn, Check, ClipboardCopy, Layers, Link2, Plus, Trash2, Undo2, Unlink } from "lucide-react";
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
import { PostLink } from "@/components/ui/PostLink";
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
    <div className="rounded-2xl border border-line bg-card">
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
          <p className="mx-auto mt-1 max-w-xs text-[13px] text-muted">ทุกช่องทางใช้ Hook, Caption และ Hashtag ชุดเดียวกัน พิมพ์ครั้งเดียว — อยากให้ช่องไหนต่างค่อยแยกปรับทีหลัง</p>
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

/** A version with no text of its own shares the master's Hook / Caption / Hashtag. */
export function sharesMasterText(pub: Publication) {
  return !pub.hook.trim() && !pub.caption.trim() && !pub.hashtags.trim();
}

function VersionEditor({ pub, master, onDeleted }: { pub: Publication; master: ContentItem; onDeleted: () => void }) {
  const { updatePublication, deletePublication, updateContent } = useStore();
  const { confirm, toast } = useFeedback();
  const [metricsOpen, setMetricsOpen] = useState(false);
  const meta = platformMeta(pub.platform);
  const set = <K extends keyof Publication>(key: K) => (v: Publication[K]) => updatePublication(pub.id, { [key]: v } as Partial<Publication>);
  const shared = sharesMasterText(pub);

  // Older versions were created as a copy of the master: if they're still identical, make them shared.
  useEffect(() => {
    const hasText = pub.hook.trim() || pub.caption.trim() || pub.hashtags.trim();
    if (hasText && pub.hook === master.hook && pub.caption === master.caption && pub.hashtags === master.hashtags) {
      updatePublication(pub.id, { hook: "", caption: "", hashtags: "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pub.id]);

  // shared → edit the master (every platform follows); custom → edit this version only
  const text = shared
    ? { hook: master.hook, caption: master.caption, hashtags: master.hashtags }
    : { hook: pub.hook, caption: pub.caption, hashtags: pub.hashtags };
  const write = (key: "hook" | "caption" | "hashtags") => (v: string) =>
    shared ? updateContent(master.id, { [key]: v }) : updatePublication(pub.id, { [key]: v });

  const customise = () => {
    updatePublication(pub.id, { hook: master.hook, caption: master.caption, hashtags: master.hashtags });
    toast(`แยกข้อความของ ${meta.label} แล้ว — แก้ตรงนี้จะไม่กระทบแพลตฟอร์มอื่น`);
  };

  const useShared = async () => {
    const ok = await confirm({
      title: "กลับไปใช้ข้อความร่วม?",
      description: `ข้อความเฉพาะของ ${meta.label} จะถูกลบ แล้วใช้ Hook / Caption / Hashtag เดียวกับแพลตฟอร์มอื่น`,
      confirmLabel: "ใช้ข้อความร่วม",
    });
    if (!ok) return;
    updatePublication(pub.id, { hook: "", caption: "", hashtags: "" });
  };

  const copyPost = async () => {
    const out = [text.hook, text.caption, text.hashtags].filter((x) => x.trim()).join("\n\n");
    try {
      await navigator.clipboard.writeText(out);
      toast(`คัดลอกข้อความ ${meta.label} แล้ว`);
    } catch {
      toast("คัดลอกไม่สำเร็จ", { tone: "error" });
    }
  };

  const remove = async () => {
    const ok = await confirm({ title: `ลบเวอร์ชัน ${meta.label}?`, description: "วันเผยแพร่ ลิงก์ และผลลัพธ์ของเวอร์ชันนี้จะถูกลบ", confirmLabel: "ลบ", danger: true });
    if (!ok) return;
    deletePublication(pub.id);
    onDeleted();
    toast(`ลบเวอร์ชัน ${meta.label} แล้ว`);
  };

  const posted = pub.status === "published";
  const masterEmpty = !master.hook.trim() && !master.caption.trim() && !master.hashtags.trim();

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
          <Menu items={[{ label: "ลบเวอร์ชันนี้", icon: Trash2, danger: true, onSelect: remove }]} />
        </div>
      </div>

      {/* shared vs platform-specific text */}
      {shared ? (
        <div className="flex flex-wrap items-center gap-2 rounded-xl bg-primary-soft px-3 py-2.5 text-[13px]">
          <Link2 size={15} className="shrink-0 text-primary" />
          <span className="min-w-0 flex-1">
            <span className="font-semibold text-primary">ข้อความเดียวกันทั้ง 3 แพลตฟอร์ม</span>
            <span className="block text-xs text-muted">พิมพ์ที่ไหนก็เปลี่ยนทุกที่ (รวมถึงต้นฉบับ)</span>
          </span>
          <Button size="sm" variant="ghost" onClick={customise} disabled={masterEmpty} title={masterEmpty ? "เขียนข้อความร่วมก่อน แล้วค่อยแยกปรับ" : undefined}>
            ปรับเฉพาะ {meta.label}
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-line-strong px-3 py-2.5 text-[13px]">
          <Unlink size={15} className="shrink-0 text-muted" />
          <span className="min-w-0 flex-1">
            <span className="font-semibold">ข้อความเฉพาะ {meta.label}</span>
            <span className="block text-xs text-muted">แก้ตรงนี้ไม่กระทบแพลตฟอร์มอื่น</span>
          </span>
          <Button size="sm" variant="ghost" onClick={useShared}>
            ใช้ข้อความร่วม
          </Button>
        </div>
      )}

      <WriteBlock label="Hook" value={text.hook} onChange={write("hook")} placeholder="ประโยคเปิดที่หยุดนิ้วคนดู" large />
      <WriteBlock
        label="Caption"
        value={text.caption}
        onChange={write("caption")}
        placeholder="คำบรรยายใต้โพสต์"
        minRows={4}
        counter={CAPTION_LIMIT[pub.platform]}
      />
      <WriteBlock label="Hashtag" value={text.hashtags} onChange={write("hashtags")} placeholder="#แฮชแท็ก" />

      <div>
        <p className="mb-1.5 text-xs font-medium tracking-wide text-muted">รูปแบบ ({meta.label})</p>
        <ChipGroup value={pub.format} onChange={set("format")} options={FORMATS} allowClear size="sm" />
      </div>

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
        <p className="mt-3 mb-1.5 text-xs font-medium tracking-wide text-muted">ลิงก์โพสต์</p>
        <div className="flex items-center gap-1">
          <TextInput
            inputMode="url"
            aria-label="ลิงก์โพสต์"
            value={pub.postUrl ?? ""}
            onChange={(e) => set("postUrl")(e.target.value)}
            placeholder={`วางลิงก์โพสต์ ${meta.label} หลังโพสต์แล้ว`}
            className="flex-1"
          />
          <PostLink url={pub.postUrl} label="เปิด" />
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
