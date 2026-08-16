import React from "react";
import { getDashboardStats } from "@/app/actions/dashboard-actions";
import { StatCard } from "@/components/ui/stat-card";
import { OrderStatusBadge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import {
  Boxes,
  Clock,
  AlertTriangle,
  DollarSign,
  ArrowRight,
  ShoppingBag,
  TrendingUp,
  Package,
  CheckCircle2,
  Plus,
  PackagePlus,
  BarChart3,
  Layers,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Spotlight Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-slate-800/80">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 backdrop-blur-md">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
              <span>Hệ thống Quản lý Bán hàng Cá nhân</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Chào mừng bạn trở lại! 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              Báo cáo thời gian thực về tình hình tồn kho, đơn hàng cần đóng gói và doanh thu thực tế đã thu được.
            </p>
          </div>

          {/* Quick Action Buttons on Hero */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              href="/orders"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo đơn mới</span>
            </Link>

            <Link
              href="/inventory"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 backdrop-blur-md transition-all active:scale-95"
            >
              <PackagePlus className="w-4 h-4 text-indigo-300" />
              <span>Thêm mặt hàng</span>
            </Link>
          </div>
        </div>

        {/* Ambient Decorative Blurs */}
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-12 w-48 h-48 bg-blue-500/15 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* 4 Core Stat KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* 1. Tổng số mặt hàng */}
        <StatCard
          title="Tổng mặt hàng"
          value={stats.totalProducts}
          subtitle="Sản phẩm đang lưu kho"
          icon={Boxes}
          colorScheme="indigo"
          badgeText="Quản lý toàn bộ danh mục"
        />

        {/* 2. Đơn chờ xử lý */}
        <StatCard
          title="Đơn chờ xử lý"
          value={stats.pendingOrdersCount}
          subtitle="Cần đóng gói & giao"
          icon={Clock}
          colorScheme="amber"
          badgeText="Trạng thái PENDING"
        />

        {/* 3. Cảnh báo hàng sắp hết kho */}
        <StatCard
          title="Sắp hết kho (< 5)"
          value={stats.lowStockCount}
          subtitle="Cần nhập bổ sung sớm"
          icon={AlertTriangle}
          colorScheme="rose"
          badgeText="Tồn kho dưới 5 cái"
        />

        {/* 4. Tổng doanh thu từ đơn DELIVERED */}
        <StatCard
          title="Tổng doanh thu"
          value={formatCurrency(stats.totalRevenue)}
          subtitle="Từ các đơn ĐÃ GIAO HÀNG"
          icon={DollarSign}
          colorScheme="emerald"
          badgeText="Trạng thái DELIVERED"
        />
      </div>

      {/* 2-Column Section: Low Stock Warnings + Order Status Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cảnh báo hàng sắp hết kho (2 cols) */}
        <div className="lg:col-span-2 bento-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 shadow-2xs">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base tracking-tight">
                  Cảnh báo mặt hàng sắp hết kho
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Các sản phẩm có số lượng tồn kho dưới 5 sản phẩm
                </p>
              </div>
            </div>

            <Link
              href="/inventory"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 hover:underline"
            >
              <span>Xem kho hàng</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {stats.lowStockProducts.length === 0 ? (
            <div className="p-8 text-center bg-slate-50/80 rounded-2xl border border-dashed border-slate-200 text-slate-400">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-1.5" />
              <p className="text-xs font-bold text-slate-700">
                Kho hàng đang dồi dào!
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Không có mặt hàng nào dưới 5 sản phẩm tồn kho.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-100">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50/90 text-slate-500 font-bold text-[11px] uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Sản phẩm</th>
                    <th className="py-3 px-4">Mã SKU</th>
                    <th className="py-3 px-4">Giá bán</th>
                    <th className="py-3 px-4 text-right">Tồn kho</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {stats.lowStockProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">
                          {p.name}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500 text-xs">
                        {p.sku ? (
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                            {p.sku}
                          </span>
                        ) : (
                          "--"
                        )}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 tabular-nums">
                        {formatCurrency(p.price)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                            p.stock === 0
                              ? "bg-rose-100 text-rose-700 border border-rose-200"
                              : "bg-amber-100 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {p.stock === 0 ? "Hết hàng" : `Còn ${p.stock} cái`}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Trạng thái đơn hàng phân bổ (1 col) */}
        <div className="bento-card p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-2xs">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base tracking-tight">
                  Phân bổ đơn hàng
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Tiến độ các giai đoạn
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {[
                {
                  label: "Đang xử lý (PENDING)",
                  count: stats.statusCounts.PENDING,
                  color: "bg-amber-500",
                  textColor: "text-amber-800",
                  bgColor: "bg-amber-50/70 border-amber-200/70",
                },
                {
                  label: "Đang giao (SHIPPING)",
                  count: stats.statusCounts.SHIPPING,
                  color: "bg-blue-500",
                  textColor: "text-blue-800",
                  bgColor: "bg-blue-50/70 border-blue-200/70",
                },
                {
                  label: "Đã giao (DELIVERED)",
                  count: stats.statusCounts.DELIVERED,
                  color: "bg-emerald-500",
                  textColor: "text-emerald-800",
                  bgColor: "bg-emerald-50/70 border-emerald-200/70",
                },
                {
                  label: "Đã hủy (CANCELLED)",
                  count: stats.statusCounts.CANCELLED,
                  color: "bg-rose-500",
                  textColor: "text-rose-800",
                  bgColor: "bg-rose-50/70 border-rose-200/70",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`p-3 rounded-2xl border flex items-center justify-between ${item.bgColor} transition-all`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                    <span className={`text-xs font-bold ${item.textColor}`}>
                      {item.label}
                    </span>
                  </div>
                  <span className="font-extrabold text-sm text-slate-900 tabular-nums">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <Link
              href="/orders"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition-all"
            >
              <span>Xem chi tiết đơn hàng</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Bảng danh sách đơn hàng mới tạo gần nhất */}
      <div className="bento-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-2xs">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base tracking-tight">
                Đơn hàng mới tạo gần nhất
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Các đơn đặt hàng mới nhất được ghi nhận vào hệ thống
              </p>
            </div>
          </div>

          <Link
            href="/orders"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 hover:underline"
          >
            <span>Xem tất cả</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {stats.recentOrders.length === 0 ? (
          <div className="p-12 text-center bg-slate-50/80 rounded-2xl border border-dashed border-slate-200 text-slate-400">
            <ShoppingBag className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-slate-700">Chưa có đơn hàng nào</p>
            <p className="text-xs text-slate-400 mt-1">
              Nhấn vào nút &quot;Tạo đơn mới&quot; để tạo đơn đầu tiên.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/90 text-slate-500 font-bold text-[11px] uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Mã đơn</th>
                  <th className="py-3 px-4">Khách hàng</th>
                  <th className="py-3 px-4">Số lượng món</th>
                  <th className="py-3 px-4">Tổng tiền</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thời gian tạo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {stats.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                      #{order.id.slice(-6).toUpperCase()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">
                        {order.customer.name}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {order.customer.phone}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800">
                        {order.items.length} món
                      </span>{" "}
                      <span className="text-xs text-slate-400">
                        ({order.items.reduce((s, i) => s + i.quantity, 0)} cái)
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900 tabular-nums">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500 text-right tabular-nums">
                      {formatDate(order.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
