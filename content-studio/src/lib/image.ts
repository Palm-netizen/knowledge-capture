// Photo helpers shared by the vision board and the 5 goals.
import { getSupabase } from "./store/persistence";

export const PHOTO_BUCKET = "vision-board";

/** Resize to `max` px on the long side and encode as JPEG so uploads stay small. */
export async function toJpeg(file: File, max = 1600): Promise<Blob> {
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

export const blobToDataUrl = (b: Blob) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(b);
  });

/**
 * Upload a photo to Supabase Storage at `path` (overwriting) and return its public URL.
 * When Supabase isn't reachable, returns a small data URL instead so it still works on this device.
 */
export async function savePhoto(path: string, file: File, opts: { remote: boolean }): Promise<{ url: string; remote: boolean }> {
  const sb = getSupabase();
  if (opts.remote && sb) {
    const jpeg = await toJpeg(file);
    const { error } = await sb.storage.from(PHOTO_BUCKET).upload(path, jpeg, { upsert: true, contentType: "image/jpeg" });
    if (!error) return { url: `${sb.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl}?v=${Date.now()}`, remote: true };
  }
  return { url: await blobToDataUrl(await toJpeg(file, 900)), remote: false };
}

export async function deletePhoto(path: string) {
  const sb = getSupabase();
  if (sb) await sb.storage.from(PHOTO_BUCKET).remove([path]);
}
