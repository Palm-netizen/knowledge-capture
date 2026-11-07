"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Cloud, Copy, FileQuestion, HardDrive, Loader2, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store/StoreProvider";
import { CONTENT_STATUSES } from "@/lib/constants";
import type { ContentStatus } from "@/lib/types";
import { pubsOf } from "@/lib/selectors";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ButtonLink } from "@/components/ui/Button";
import { Menu } from "@/components/ui/Menu";
import { AutoTextarea } from "@/components/ui/Form";
import { MasterEditor } from "@/components/studio/MasterEditor";
import { VersionPanel } from "@/components/studio/VersionPanel";
import { RelationStrip } from "@/components/studio/RelationStrip";
import { useContentActions } from "@/components/studio/ContentRow";
import { cn } from "@/lib/utils";

export default function ContentWorkspacePage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Workspace />
    </Suspense>
  );
}

function Workspace() {
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  const router = useRouter();
  const store = useStore();
  const actions = useContentActions();

  const item = store.contents.find((c) => c.id === id);
  const pubs = item ? pubsOf(store, item.id) : [];
  const idea = item?.ideaId ? store.ideas.find((i) => i.id === item.ideaId) : undefined;

  const [activePub, setActivePub] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<"master" | "versions">("master");

  // ?v=instagram → open that platform's version (from the calendar)
  const v = params.get("v");
  useEffect(() => {
    if (!v || !item) return;
    const target = store.publications.find((p) => p.contentId === item.id && p.platform === v);
    if (target) {
      setActivePub(target.id);
      setMobileTab("versions");
    }
    // only on first resolve
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v, item?.id, store.ready]);

  if (!store.ready) return <PageSkeleton />;

  if (!item) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-16">
        <EmptyState
          icon={FileQuestion}
          title="ไม่พบคอนเทนต์นี้"
          description="อาจถูกลบไปแล้ว หรือลิงก์ไม่ถูกต้อง"
          action={<ButtonLink href="/studio" variant="primary">กลับไป Content Studio</ButtonLink>}
        />
      </div>
    );
  }

  const openVersion = (pubId: string) => {
    setActivePub(pubId);
    setMobileTab("versions");
    if (window.matchMedia("(min-width: 1280px)").matches) {
      document.getElementById("versions")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-4 pb-36 md:px-8 md:pt-6 md:pb-16">
      {/* top bar */}
      <div className="mb-4 flex items-center gap-2">
        <Link href="/studio" className="-ml-2 flex h-9 items-center gap-1.5 rounded-md px-2 text-[13px] text-muted hover:bg-subtle hover:text-ink">
          <ArrowLeft size={16} /> Content Studio
        </Link>
        <span className="ml-auto">
          <SaveIndicator />
        </span>
        <select
          aria-label="สถานะการผลิต"
          value={item.status}
          onChange={(e) => store.updateContent(item.id, { status: e.target.value as ContentStatus })}
          className={cn(
            "h-9 rounded-lg border px-2.5 text-[13px] font-medium",
            item.status === "published" ? "border-primary/30 bg-primary-soft text-primary" : "border-line bg-card text-ink",
          )}
        >
          {CONTENT_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <Menu
          items={[
            { label: "ทำสำเนา", icon: Copy, onSelect: () => actions.duplicate(item) },
            { label: "ลบคอนเทนต์", icon: Trash2, danger: true, onSelect: () => actions.remove(item, () => router.push("/studio")) },
          ]}
        />
      </div>

      {/* title */}
      <AutoTextarea
        bare
        minRows={1}
        value={item.title}
        onChange={(e) => store.updateContent(item.id, { title: e.target.value.replace(/\n/g, " ") })}
        onBlur={(e) => !e.target.value.trim() && store.updateContent(item.id, { title: "ไม่มีชื่อ" })}
        aria-label="ชื่อคอนเทนต์"
        placeholder="ชื่อคอนเทนต์"
        className="text-2xl! leading-snug font-semibold tracking-tight md:text-[28px]!"
      />

      <div className="mt-3 mb-5">
        <RelationStrip idea={idea} item={item} pubs={pubs} activeId={activePub ?? pubs[0]?.id ?? null} onSelect={openVersion} />
      </div>

      {/* mobile / tablet tabs */}
      <div className="sticky top-14 z-20 -mx-4 mb-2 border-b border-line bg-panel/95 px-4 backdrop-blur md:top-0 xl:hidden">
        <div className="flex gap-4">
          {(
            [
              ["master", "ต้นฉบับ"],
              ["versions", `เวอร์ชันแพลตฟอร์ม (${pubs.length})`],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setMobileTab(key)}
              className={cn(
                "-mb-px border-b-2 py-3 text-sm",
                mobileTab === key ? "border-primary font-medium text-ink" : "border-transparent text-muted",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_420px] xl:gap-10">
        <div className={cn(mobileTab !== "master" && "hidden xl:block")}>
          <MasterEditor item={item} onOpenVersion={openVersion} />
        </div>
        <div id="versions" className={cn("pt-4 xl:pt-6", mobileTab !== "versions" && "hidden xl:block")}>
          <div className="xl:sticky xl:top-6">
            <VersionPanel item={item} activeId={activePub} onActiveChange={setActivePub} />
          </div>
        </div>
      </div>
    </div>
  );
}

function SaveIndicator() {
  const { syncMode, syncStatus } = useStore();
  if (syncMode === "supabase" && syncStatus === "saving") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-muted">
        <Loader2 size={13} className="animate-spin" /> กำลังบันทึก…
      </span>
    );
  }
  if (syncMode === "supabase" && syncStatus === "error") {
    return <span className="text-xs text-danger">บันทึกขึ้น Supabase ไม่สำเร็จ</span>;
  }
  return (
    <span className="hidden items-center gap-1.5 text-xs text-faint sm:flex">
      {syncMode === "supabase" ? <Cloud size={13} /> : <HardDrive size={13} />}
      บันทึกอัตโนมัติ
    </span>
  );
}
