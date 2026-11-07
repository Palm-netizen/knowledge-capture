"use client";

import type { Publication } from "@/lib/types";
import { platformMeta } from "@/lib/constants";
import { useStore } from "@/lib/store/StoreProvider";
import { useFeedback } from "@/components/ui/Feedback";

/** Remove-from-calendar (undoable) and delete-version (confirmed) for a post. */
export function usePostActions() {
  const store = useStore();
  const { toast, confirm } = useFeedback();

  return {
    unschedule(pub: Publication) {
      const prev = { scheduledDate: pub.scheduledDate, scheduledTime: pub.scheduledTime };
      store.updatePublication(pub.id, { scheduledDate: null, scheduledTime: null });
      toast("นำออกจากปฏิทินแล้ว", { action: { label: "เลิกทำ", onClick: () => store.updatePublication(pub.id, prev) } });
    },
    async remove(pub: Publication): Promise<boolean> {
      const meta = platformMeta(pub.platform);
      const title = store.contents.find((c) => c.id === pub.contentId)?.title ?? "";
      const ok = await confirm({
        title: `ลบเวอร์ชัน ${meta.label}?`,
        description: `ข้อความ วันเผยแพร่ และผลลัพธ์ของ “${title}” บน ${meta.label} จะถูกลบ (คอนเทนต์ต้นฉบับยังอยู่)`,
        confirmLabel: "ลบ",
        danger: true,
      });
      if (!ok) return false;
      store.deletePublication(pub.id);
      toast(`ลบเวอร์ชัน ${meta.label} แล้ว`);
      return true;
    },
  };
}
