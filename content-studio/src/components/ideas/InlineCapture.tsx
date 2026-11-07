"use client";

import { useState } from "react";
import { CornerDownLeft, Lightbulb } from "lucide-react";
import { IDEA_KINDS } from "@/lib/constants";
import type { IdeaKind } from "@/lib/types";
import { useStore } from "@/lib/store/StoreProvider";
import { useFeedback } from "@/components/ui/Feedback";
import { ChipGroup } from "@/components/ui/Form";
import { cn } from "@/lib/utils";

/** One-line capture: type → Enter. Kind chips appear once you start typing. */
export function InlineCapture({ placeholder = "จดไอเดียสั้น ๆ แล้วกด Enter", autoFocus }: { placeholder?: string; autoFocus?: boolean }) {
  const { addIdea } = useStore();
  const { toast } = useFeedback();
  const [text, setText] = useState("");
  const [kind, setKind] = useState<IdeaKind>("content");

  const save = () => {
    const t = text.trim();
    if (!t) return;
    addIdea({ title: t, kind });
    setText("");
    toast("บันทึกไอเดียแล้ว");
  };

  return (
    <div className="rounded-2xl border border-transparent bg-card shadow-card shadow-card transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
      <form
        className="flex items-center gap-2 pr-2 pl-3.5"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <Lightbulb size={18} className="shrink-0 text-primary" strokeWidth={1.8} />
        <input
          autoFocus={autoFocus}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          aria-label="จดไอเดีย"
          className="h-12 min-w-0 flex-1 bg-transparent text-[15px] placeholder:text-faint focus:outline-none"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-[13px] font-medium text-white transition-opacity disabled:opacity-0"
        >
          บันทึก <CornerDownLeft size={14} className="hidden sm:block" />
        </button>
      </form>
      <div inert={!text.trim()} className={cn("overflow-hidden px-3.5 transition-all", text.trim() ? "max-h-24 pb-3" : "max-h-0")}>
        <ChipGroup value={kind} onChange={(v) => v && setKind(v)} options={IDEA_KINDS} size="sm" />
      </div>
    </div>
  );
}
