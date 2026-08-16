"use client";

import React from "react";
import { Menu, Plus, ShoppingCart, PackagePlus } from "lucide-react";
import Link from "next/link";

interface HeaderProps {
  onOpenSidebar: () => void;
  title?: string;
  subtitle?: string;
}

export function Header({
  onOpenSidebar,
  title = "Hệ thống Quản lý Kho & Đơn hàng",
  subtitle = "Tổng quan tình hình kinh doanh trực tuyến của bạn",
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 h-16 bg-white/85 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between transition-all">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Mở menu điều hướng"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
            {title}
          </h2>
          <p className="hidden sm:block text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>

      {/* Quick Global Action Buttons */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/inventory?action=create"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-all hover:border-slate-300"
        >
          <PackagePlus className="w-4 h-4 text-slate-500" />
          <span className="hidden md:inline">Thêm sản phẩm</span>
        </Link>

        <Link
          href="/orders?action=create"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm shadow-blue-500/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo đơn mới</span>
        </Link>
      </div>
    </header>
  );
}
