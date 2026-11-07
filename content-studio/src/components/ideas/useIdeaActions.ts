"use client";

import { useRouter } from "next/navigation";
import type { Idea } from "@/lib/types";
import { useStore } from "@/lib/store/StoreProvider";
import { useFeedback } from "@/components/ui/Feedback";
import { studioHref } from "@/lib/routes";

export function useIdeaActions() {
  const store = useStore();
  const { toast, confirm } = useFeedback();
  const router = useRouter();

  return {
    async remove(idea: Idea) {
      const ok = await confirm({
        title: "ลบไอเดียนี้?",
        description: `“${idea.title}” จะถูกลบถาวร (คอนเทนต์ที่สร้างจากไอเดียนี้จะยังอยู่)`,
        confirmLabel: "ลบ",
        danger: true,
      });
      if (!ok) return;
      store.deleteIdea(idea.id);
      toast("ลบไอเดียแล้ว");
    },
    toContent(idea: Idea) {
      const existing = store.contents.find((c) => c.ideaId === idea.id);
      if (existing) {
        router.push(studioHref(existing.id));
        return;
      }
      const item = store.createContentFromIdea(idea.id);
      if (item) {
        toast("สร้างคอนเทนต์จากไอเดียแล้ว");
        router.push(studioHref(item.id));
      }
    },
  };
}
