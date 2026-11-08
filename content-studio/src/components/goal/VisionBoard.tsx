"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, RotateCcw } from "lucide-react";
import { VISION_SLOTS, type VisionKey } from "@/lib/goal-content";
import { getSupabase } from "@/lib/store/persistence";
import { useFeedback } from "@/components/ui/Feedback";
import { useStore } from "@/lib/store/StoreProvider";
import { cn } from "@/lib/utils";
import { BodyScene, NewZealandScene, StageScene } from "./Illustrations";

const BUCKET = "vision-board";
const LOCAL_KEY = (k: VisionKey) => `supperpalm-vision:${k}`;

const SCENES: Record<VisionKey, (p: { className?: string }) => React.ReactElement> = {
  stage: StageScene,
  body: BodyScene,
  nz: NewZealandScene,
};

/** Resize to max 1600px and encode as JPEG so uploads stay small. */
async function toJpeg(file: File, max = 1600): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = url;
    });
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode"))), "image/jpeg", 0.85));
  } finally {
    URL.revokeObjectURL(url);
  }
}

const blobToDataUrl = (b: Blob) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(b);
  });

/**
 * Vision board: 3 frames. Each shows an illustration until the user uploads
 * their own photo — stored in Supabase Storage (bucket "vision-board") so it
 * syncs across devices, or in this browser when Supabase isn't reachable.
 */
export function VisionBoard() {
  const { syncMode } = useStore();
  const { toast, confirm } = useFeedback();
  const [photos, setPhotos] = useState<Partial<Record<VisionKey, string>>>({});
  const [remote, setRemote] = useState(false);
  const [busy, setBusy] = useState<VisionKey | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const pending = useRef<VisionKey | null>(null);

  useEffect(() => {
    // local photos first
    const local: Partial<Record<VisionKey, string>> = {};
    VISION_SLOTS.forEach((s) => {
      try {
        const v = localStorage.getItem(LOCAL_KEY(s.key));
        if (v) local[s.key] = v;
      } catch {
        /* storage blocked */
      }
    });
    setPhotos(local);

    const sb = getSupabase();
    if (!sb || syncMode !== "supabase") return;
    sb.storage
      .from(BUCKET)
      .list("", { limit: 20 })
      .then(({ data, error }) => {
        if (error) return; // bucket not set up → stay local
        setRemote(true);
        const fromRemote: Partial<Record<VisionKey, string>> = {};
        (data ?? []).forEach((o) => {
          const key = o.name.replace(/\.jpg$/, "") as VisionKey;
          if (!VISION_SLOTS.some((s) => s.key === key)) return;
          const v = encodeURIComponent(o.updated_at ?? o.created_at ?? "");
          fromRemote[key] = `${sb.storage.from(BUCKET).getPublicUrl(o.name).data.publicUrl}?v=${v}`;
        });
        setPhotos((cur) => ({ ...cur, ...fromRemote }));
      });
  }, [syncMode]);

  const pick = (key: VisionKey) => {
    pending.current = key;
    fileRef.current?.click();
  };

  const onFile = async (file: File | undefined) => {
    const key = pending.current;
    if (!file || !key) return;
    setBusy(key);
    try {
      const jpeg = await toJpeg(file);
      const sb = getSupabase();
      if (remote && sb) {
        const { error } = await sb.storage.from(BUCKET).upload(`${key}.jpg`, jpeg, { upsert: true, contentType: "image/jpeg" });
        if (error) throw error;
        setPhotos((cur) => ({ ...cur, [key]: `${sb.storage.from(BUCKET).getPublicUrl(`${key}.jpg`).data.publicUrl}?v=${Date.now()}` }));
        try {
          localStorage.removeItem(LOCAL_KEY(key));
        } catch {
          /* ignore */
        }
        toast("อัปโหลดรูปแล้ว");
      } else {
        const dataUrl = await blobToDataUrl(await toJpeg(file, 1000));
        localStorage.setItem(LOCAL_KEY(key), dataUrl);
        setPhotos((cur) => ({ ...cur, [key]: dataUrl }));
        toast("บันทึกรูปไว้ในเครื่องนี้แล้ว");
      }
    } catch (e) {
      toast(`อัปโหลดไม่สำเร็จ${e instanceof Error ? `: ${e.message}` : ""}`, { tone: "error" });
    } finally {
      setBusy(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const reset = async (key: VisionKey) => {
    const ok = await confirm({ title: "กลับไปใช้ภาพประกอบเดิม?", description: "รูปที่อัปโหลดไว้ในกรอบนี้จะถูกลบ", confirmLabel: "ลบรูป", danger: true });
    if (!ok) return;
    const sb = getSupabase();
    if (remote && sb) await sb.storage.from(BUCKET).remove([`${key}.jpg`]);
    try {
      localStorage.removeItem(LOCAL_KEY(key));
    } catch {
      /* ignore */
    }
    setPhotos((cur) => {
      const next = { ...cur };
      delete next[key];
      return next;
    });
  };

  return (
    <section aria-label="Vision board">
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)] md:gap-4">
        {VISION_SLOTS.map((slot, i) => {
          const Scene = SCENES[slot.key];
          const photo = photos[slot.key];
          return (
            <figure
              key={slot.key}
              className={cn(
                "group relative overflow-hidden rounded-3xl bg-ink shadow-card",
                i === 0 ? "aspect-[16/10] md:aspect-auto md:h-[22rem]" : "aspect-[4/5] md:aspect-auto md:h-[22rem]",
              )}
            >
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo} alt={slot.title} className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <Scene className="absolute inset-0 h-full w-full" />
              )}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/70 to-transparent" />
              <figcaption className="absolute inset-x-0 bottom-0 p-4 text-white md:p-5">
                <p className="font-display text-lg leading-tight font-semibold md:text-xl">{slot.title}</p>
                <p className="mt-0.5 text-[13px] text-white/80">{slot.caption}</p>
              </figcaption>
              <div className="absolute top-3 right-3 flex gap-1.5 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100">
                {photo && (
                  <button
                    onClick={() => reset(slot.key)}
                    aria-label={`ใช้ภาพประกอบเดิม: ${slot.title}`}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/45 text-white backdrop-blur hover:bg-black/60"
                  >
                    <RotateCcw size={15} />
                  </button>
                )}
                <button
                  onClick={() => pick(slot.key)}
                  disabled={busy === slot.key}
                  className="flex h-9 items-center gap-1.5 rounded-xl bg-white/90 px-3 text-[13px] font-medium text-ink backdrop-blur hover:bg-white"
                >
                  {busy === slot.key ? <Loader2 size={15} className="animate-spin" /> : <ImagePlus size={15} />}
                  {photo ? "เปลี่ยนรูป" : "ใช้รูปของฉัน"}
                </button>
              </div>
            </figure>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-faint">
        แนะนำให้ใส่รูปจริงของคุณหรือสถานที่ที่อยากไป — ภาพที่เห็นทุกวันช่วยให้เป้าหมายชัดขึ้น
        {!remote && " · ตอนนี้รูปจะเก็บไว้ในเครื่องนี้"}
      </p>
    </section>
  );
}
