import type { Metadata } from "next";
import { IBM_Plex_Sans_Thai, Plus_Jakarta_Sans } from "next/font/google";
import AppShell from "@/components/layout/AppShell";
import "./globals.css";

const ibmPlexThai = IBM_Plex_Sans_Thai({
  variable: "--font-ibm-plex-thai",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Knowledge Capture",
  description: "สมุดบันทึกการเรียนรู้ส่วนตัว",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="th"
      className={`${ibmPlexThai.variable} ${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-bg text-ink">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
