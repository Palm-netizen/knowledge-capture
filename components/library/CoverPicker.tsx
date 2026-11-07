"use client";

import { useRef, useState } from "react";
import SourceCover from "@/components/sources/SourceCover";
import { compressImage } from "@/lib/image";
import { uploadSourceCover } from "@/lib/supabase/mutations";
import type { LearningSource } from "@/lib/supabase/types";

export default function CoverPicker({
  source,
  onUpdated,
}: {
  source: LearningSource;
  onUpdated: (s: LearningSource) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setErr(null);
    try {
      const image = await compressImage(file);
      onUpdated(await uploadSourceCover(source.id, image, source.cover_url));
    } catch {
      setErr("อัปโหลดรูปไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-24 shrink-0 sm:w-28">
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        aria-label="เลือกรูปหน้าปก"
        className="relative block w-full"
      >
        <SourceCover source={source} className="aspect-[3/4] rounded-xl" />
        <span className="absolute inset-x-0 bottom-0 rounded-b-xl bg-nav/70 py-1 text-center text-[11px] text-white">
          {busy ? "กำลังอัปโหลด..." : source.cover_url ? "เปลี่ยนรูป" : "ใส่รูปปก"}
        </span>
      </button>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      {err ? <p className="mt-1 text-xs text-danger">{err}</p> : null}
    </div>
  );
}
