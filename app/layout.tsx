import type { Metadata } from "next";
import "./globals.css";
import { AppLayoutShell } from "@/components/layout/app-layout-shell";

export const metadata: Metadata = {
  title: "MiniKho Pro - Hệ thống Quản lý Kho & Bán hàng Online",
  description:
    "Hệ thống quản lý kho và bán hàng thu nhỏ dành riêng cho người bán hàng online, tối ưu hóa trên Next.js 15, Supabase và Vercel.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="antialiased font-sans">
        <AppLayoutShell>{children}</AppLayoutShell>
      </body>
    </html>
  );
}
