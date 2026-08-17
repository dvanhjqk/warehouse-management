import type { Metadata } from "next";
import { Newsreader, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppLayoutShell } from "@/components/layout/app-layout-shell";

const newsreader = Newsreader({
  subsets: ["latin", "vietnamese"],
  variable: "--font-newsreader",
  display: "swap",
  weight: ["400", "600", "700"],
});

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "vietnamese"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "MiniKho Pro - Quản lý Kho & Bán hàng Tối giản",
  description:
    "Hệ thống quản lý kho và bán hàng thu nhỏ dành riêng cho người bán hàng online, tối ưu hóa trên Next.js 15, Supabase và Vercel.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${inter.variable} ${newsreader.variable} ${jetbrainsMono.variable}`}
    >
      <body className="antialiased font-sans bg-[#FAF8F5] text-[#191716]">
        <AppLayoutShell>{children}</AppLayoutShell>
      </body>
    </html>
  );
}
