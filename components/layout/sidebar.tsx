"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Boxes,
  ShoppingBag,
  Users,
  BarChart3,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const navigation = [
    {
      name: "Tổng quan",
      description: "Bảng điều khiển chính",
      href: "/",
      icon: LayoutDashboard,
      active: pathname === "/",
    },
    {
      name: "Quản lý kho",
      description: "Tồn kho & Mặt hàng",
      href: "/inventory",
      icon: Boxes,
      active: pathname.startsWith("/inventory"),
    },
    {
      name: "Đơn hàng",
      description: "Xử lý & Giao vận",
      href: "/orders",
      icon: ShoppingBag,
      active: pathname.startsWith("/orders"),
    },
    {
      name: "Khách hàng",
      description: "Danh bạ & Lịch sử",
      href: "/customers",
      icon: Users,
      active: pathname.startsWith("/customers"),
    },
    {
      name: "Thống kê doanh thu",
      description: "Báo cáo theo tháng",
      href: "/analytics",
      icon: BarChart3,
      active: pathname.startsWith("/analytics"),
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#1F1D1A] text-[#EDE8E1] flex flex-col transition-transform duration-200 ease-out lg:translate-x-0 border-r border-[#2E2A26]",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-5 border-b border-[#2E2A26] gap-3">
          {/* Claude Terracotta Logo Mark */}
          <div className="w-8 h-8 rounded-lg bg-[#CC785C] flex items-center justify-center text-white font-serif font-bold text-lg shadow-sm">
            ✦
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-serif text-lg font-bold text-[#FAF8F5] tracking-tight">
                MiniKho Pro
              </h1>
            </div>
            <p className="text-[11px] text-[#A8A296] font-medium leading-none mt-0.5">
              Claude Minimal Theme
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-4 px-2.5 space-y-1 overflow-y-auto">
          <p className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-[#8A8477] mb-2">
            Hệ thống quản lý
          </p>

          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                prefetch={true}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors group relative",
                  item.active
                    ? "bg-[#2D2925] text-[#FAF8F5] font-semibold"
                    : "text-[#B8B2A6] hover:text-[#FAF8F5] hover:bg-[#282420]"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 transition-colors",
                    item.active ? "text-[#CC785C]" : "text-[#8A8477] group-hover:text-[#CC785C]"
                  )}
                />

                <span className="flex-1 text-[13px]">{item.name}</span>

                {item.active && (
                  <div className="w-1.5 h-1.5 rounded-full bg-[#CC785C]" />
                )}
              </Link>
            );
          })}
        </div>

        {/* System Status Footer */}
        <div className="p-3 m-2.5 rounded-xl bg-[#26221E] border border-[#332E29] space-y-1">
          <div className="flex items-center justify-between text-[11px] font-semibold text-[#D6D1C7]">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span>Hệ thống trực tuyến</span>
            </div>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-[10px] text-[#8A8477]">
            Tối ưu siêu nhanh & mượt mà
          </p>
        </div>
      </aside>
    </>
  );
}
