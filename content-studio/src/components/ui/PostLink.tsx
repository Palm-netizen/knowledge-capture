import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

/** Accepts "facebook.com/…" or a full URL; returns a safe http(s) URL or null. */
export function normalizeUrl(raw: string | null | undefined): string | null {
  const s = (raw ?? "").trim();
  if (!s) return null;
  const withScheme = /^https?:\/\//i.test(s) ? s : `https://${s}`;
  try {
    const u = new URL(withScheme);
    return u.protocol === "http:" || u.protocol === "https:" ? u.toString() : null;
  } catch {
    return null;
  }
}

export function hostLabel(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\.|^m\./, "");
  } catch {
    return url;
  }
}

/** Small "open the real post" link. Renders nothing when there's no valid URL. */
export function PostLink({ url, label, className }: { url: string | null | undefined; label?: string; className?: string }) {
  const href = normalizeUrl(url);
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      title={`เปิดโพสต์: ${href}`}
      className={cn(
        "relative z-10 inline-flex items-center gap-1 rounded-lg text-xs font-medium text-primary hover:underline",
        label ? "px-1.5 py-1" : "h-8 w-8 justify-center hover:bg-primary-soft",
        className,
      )}
    >
      <ExternalLink size={14} />
      {label}
    </a>
  );
}
