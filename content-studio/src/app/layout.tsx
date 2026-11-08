import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Thai, Outfit } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

const thai = IBM_Plex_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600"],
  variable: "--font-thai",
  display: "swap",
});

const num = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-num",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SUPPERPALM — Content Studio",
  description: "โต๊ะทำงานคอนเทนต์ส่วนตัว: จดไอเดีย ผลิตคอนเทนต์ วางแผนโพสต์ และเก็บผลลัพธ์",
  applicationName: "SUPPERPALM",
  // iPhone: open full-screen from the home-screen icon
  appleWebApp: { capable: true, title: "SUPPERPALM", statusBarStyle: "default" },
  formatDetection: { telephone: false },
  // older iOS versions only honour the legacy tag
  other: { "apple-mobile-web-app-capable": "yes" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F5F6F8",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${thai.variable} ${num.variable}`}>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
