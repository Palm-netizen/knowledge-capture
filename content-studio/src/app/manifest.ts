import type { MetadataRoute } from "next";

// Static export (GitHub Pages): paths must include the base path, e.g. /knowledge-capture/studio
const base = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: `${base}/`,
    name: "SUPPERPALM — Content Studio",
    short_name: "SUPPERPALM",
    description: "โต๊ะทำงานคอนเทนต์ส่วนตัว: Goal, บันทึกประจำวัน, ไอเดีย, ผลิตคอนเทนต์ และปฏิทิน",
    start_url: `${base}/`,
    scope: `${base}/`,
    display: "standalone",
    orientation: "portrait",
    background_color: "#F5F6F8",
    theme_color: "#F5F6F8",
    lang: "th",
    icons: [
      { src: `${base}/icons/icon-192.png`, sizes: "192x192", type: "image/png", purpose: "any" },
      { src: `${base}/icons/icon-512.png`, sizes: "512x512", type: "image/png", purpose: "any" },
      { src: `${base}/icons/maskable-512.png`, sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "บันทึกวันนี้", short_name: "วันนี้", url: `${base}/journal/` },
      { name: "Goal", url: `${base}/goal/` },
      { name: "Idea Inbox", short_name: "ไอเดีย", url: `${base}/ideas/` },
    ],
  };
}
