"use client";

import React, { useState, useEffect } from "react";
import {
  Menu,
  Plus,
  PackagePlus,
  Calendar,
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
    <header className="sticky top-0 z-30 h-16 bg-[#FAF8F5]/95 border-b border-[#E8E4DC] px-4 sm:px-8 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-xl bg-white border border-[#E8E4DC] text-[#44403C] hover:bg-[#F5F2EB] transition-colors"
          aria-label="Mở menu điều hướng"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div>
          <h2 className="font-serif text-base sm:text-lg font-bold text-[#191716] tracking-tight leading-tight">
            {title}
          </h2>
          {currentDateStr && (
            <p className="text-[11px] text-[#78716C] font-medium capitalize flex items-center gap-1.5 mt-0.5">
              <Calendar className="w-3 h-3 text-[#CC785C]" />
              <span>{currentDateStr}</span>
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        <Link
          href="/inventory"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8E4DC] bg-white hover:bg-[#F5F2EB] text-[#44403C] text-xs font-semibold shadow-xs transition-colors"
        >
          <PackagePlus className="w-3.5 h-3.5 text-[#78716C]" />
          <span className="hidden sm:inline">Thêm sản phẩm</span>
        </Link>

        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#CC785C] hover:bg-[#BA664A] text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tạo đơn mới</span>
        </Link>
      </div>
    </header>
  );
}
