"use client";

import React, { useState, useEffect } from "react";
import {
  Menu,
  Plus,
  PackagePlus,
  Calendar,
  Sparkles,
  Search,
} from "lucide-react";
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
  const [currentDateStr, setCurrentDateStr] = useState("");

  useEffect(() => {
    const now = new Date();
    const formatted = new Intl.DateTimeFormat("vi-VN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(now);
    setCurrentDateStr(formatted);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between transition-all shadow-xs">
      <div className="flex items-center gap-3.5">
        {/* Mobile menu trigger */}
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2.5 rounded-2xl bg-slate-100/80 text-slate-700 hover:bg-slate-200 transition-colors"
          aria-label="Mở menu điều hướng"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-tight">
              {title}
            </h2>
          </div>
          {currentDateStr && (
            <p className="text-[11px] text-slate-500 font-medium capitalize flex items-center gap-1.5 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              <span>{currentDateStr}</span>
            </p>
          )}
        </div>
      </div>

      {/* Global Quick Action Buttons */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/inventory"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white/90 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition-all hover:border-slate-300"
        >
          <PackagePlus className="w-4 h-4 text-indigo-600" />
          <span className="hidden sm:inline">Thêm sản phẩm</span>
        </Link>

        <Link
          href="/orders"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo đơn mới</span>
        </Link>
      </div>
    </header>
  );
}
