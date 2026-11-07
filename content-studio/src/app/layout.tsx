import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Thai } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

const thai = IBM_Plex_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600"],
  variable: "--font-thai",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SUPPERPALM — Content Studio",
  description: "โต๊ะทำงานคอนเทนต์ส่วนตัว: จดไอเดีย ผลิตคอนเทนต์ วางแผนโพสต์ และเก็บผลลัพธ์",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F8FAF8",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={thai.variable}>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
