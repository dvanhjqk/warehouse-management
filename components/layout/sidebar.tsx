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
      href: "/",
      icon: LayoutDashboard,
      active: pathname === "/",
    },
    {
      name: "Quản lý kho",
      href: "/inventory",
      icon: Boxes,
      active: pathname.startsWith("/inventory"),
    },
    {
      name: "Đơn hàng",
      href: "/orders",
      icon: ShoppingBag,
      active: pathname.startsWith("/orders"),
    },
    {
      name: "Khách hàng",
      href: "/customers",
      icon: Users,
      active: pathname.startsWith("/customers"),
    },
    {
      name: "Thống kê doanh thu",
      href: "/analytics",
      icon: BarChart3,
      active: pathname.startsWith("/analytics"),
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 border-r border-slate-800",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3 bg-slate-950/40">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <Warehouse className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-base text-white tracking-tight leading-tight">
              MiniKho Pro
            </h1>
            <p className="text-[11px] text-blue-400 font-medium">
              Quản lý kho & Bán hàng
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Menu Quản Lý
          </p>
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 group relative",
                  item.active
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 transition-colors",
                    item.active ? "text-white" : "text-slate-400 group-hover:text-blue-400"
                  )}
                />
                <span className="flex-1">{item.name}</span>
                {item.active && (
                  <div className="w-1.5 h-4 rounded-full bg-white/80 absolute right-2" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Pro Banner Footer */}
        <div className="p-4 m-3 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-800/40 border border-slate-700/50">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Next.js 15 & Supabase</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Hệ thống quản lý kho Serverless tối ưu cho người bán hàng online.
          </p>
        </div>
      </aside>
    </>
  );
}
