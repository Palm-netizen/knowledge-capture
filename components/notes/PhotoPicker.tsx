"use client";

import { useRef, useState } from "react";
import { compressImage } from "@/lib/image";

export type PendingPhoto = { blob: Blob; previewUrl: string };

export const MAX_NOTE_PHOTOS = 2;

// Photos are compressed on pick (≈1280px JPEG) and only uploaded when the
// note is saved, so cancelled notes don't leave files behind.
export default function PhotoPicker({
  photos,
  onChange,
}: {
  photos: PendingPhoto[];
  onChange: (photos: PendingPhoto[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = [...(e.target.files ?? [])].slice(0, MAX_NOTE_PHOTOS - photos.length);
    e.target.value = "";
    if (files.length === 0) return;
    setBusy(true);
    setErr(null);
    try {
      const added: PendingPhoto[] = [];
      for (const file of files) {
        const blob = await compressImage(file, 1280, 1280, 0.7);
        added.push({ blob, previewUrl: URL.createObjectURL(blob) });
      }
      onChange([...photos, ...added]);
    } catch {
      setErr("อ่านรูปไม่สำเร็จ ลองเลือกรูปอื่น");
    } finally {
      setBusy(false);
    }
  }

  function remove(index: number) {
    URL.revokeObjectURL(photos[index].previewUrl);
    onChange(photos.filter((_, i) => i !== index));
  }

  return (
    <div>
      <label className="text-sm text-muted">
        รูปภาพ (ไม่เกิน {MAX_NOTE_PHOTOS} รูป)
      </label>
      <div className="mt-1 flex flex-wrap gap-3">
        {photos.map((p, i) => (
          <div key={p.previewUrl} className="relative h-24 w-24 overflow-hidden rounded-xl border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.previewUrl} alt={`รูปที่ ${i + 1}`} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => remove(i)}
              aria-label={`ลบรูปที่ ${i + 1}`}
              className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-nav/70 text-sm text-white"
            >
              ×
            </button>
          </div>
        ))}
        {photos.length < MAX_NOTE_PHOTOS ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="flex h-24 w-24 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card text-xs text-muted transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
          >
            <span className="text-xl">+</span>
            {busy ? "กำลังย่อรูป..." : "เพิ่มรูป"}
          </button>
        ) : null}
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
      {err ? <p className="mt-1 text-xs text-danger">{err}</p> : null}
    </div>
  );
}
