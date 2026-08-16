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
  Warehouse,
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
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 w-72 bg-slate-950 text-slate-200 flex flex-col transition-all duration-300 ease-in-out lg:translate-x-0 border-r border-slate-800/80 shadow-2xl",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="h-20 flex items-center px-6 border-b border-slate-800/60 gap-3.5 bg-gradient-to-b from-slate-900/80 to-slate-950">
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
              <Warehouse className="w-6 h-6" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-950 ring-1 ring-emerald-400/50" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-base text-white tracking-tight">
                MiniKho Pro
              </h1>
              <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
                v2.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Quản lý Kho & Đơn hàng
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-6 px-3.5 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Hệ thống quản lý
            </p>
            <div className="w-2 h-2 rounded-full bg-indigo-500/40" />
          </div>

          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                prefetch={true}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3.5 px-3.5 py-3 rounded-2xl font-medium text-sm transition-all duration-200 group relative",
                  item.active
                    ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-white/15"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/80"
                )}
              >
                <div
                  className={cn(
                    "p-2 rounded-xl transition-all duration-200",
                    item.active
                      ? "bg-white/15 text-white"
                      : "bg-slate-900 text-slate-400 group-hover:bg-slate-800 group-hover:text-indigo-400"
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs sm:text-sm tracking-tight truncate leading-snug">
                    {item.name}
                  </div>
                  <div
                    className={cn(
                      "text-[10px] truncate leading-tight mt-0.5",
                      item.active ? "text-indigo-200" : "text-slate-400"
                    )}
                  >
                    {item.description}
                  </div>
                </div>

                {item.active ? (
                  <div className="w-1.5 h-6 rounded-full bg-white/90 shadow-sm" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-all duration-150 transform group-hover:translate-x-0.5" />
                )}
              </Link>
            );
          })}
        </div>

        {/* System Health / Status Card */}
        <div className="p-3.5 m-3 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[11px] font-bold text-slate-300">
                Hệ thống hoạt động
              </span>
            </div>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="text-[10px] text-slate-400 leading-relaxed">
            Kết nối Supabase & Vercel Edge cực nhanh.
          </div>
        </div>
      </aside>
    </>
  );
}
