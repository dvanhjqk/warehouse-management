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
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-blue-100 backdrop-blur-md mb-3 border border-white/10">
            <TrendingUp className="w-3.5 h-3.5" />
            Hệ thống Quản lý Bán hàng Cá nhân
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Chào mừng trở lại! 👋
          </h1>
          <p className="mt-2 text-sm text-blue-100/90 leading-relaxed">
            Dưới đây là bức tranh toàn cảnh về tình hình kho hàng, số lượng đơn chờ xử lý và doanh thu thực tế đã giao hôm nay.
          </p>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute right-0 top-0 -bottom-8 w-96 bg-gradient-to-l from-blue-500/20 to-transparent pointer-events-none rounded-full blur-2xl" />
      </div>

      {/* 4 Core Stat KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* 1. Tổng số mặt hàng */}
        <StatCard
          title="Tổng mặt hàng"
          value={stats.totalProducts}
          subtitle="Sản phẩm đang lưu kho"
          icon={Boxes}
          colorScheme="blue"
          badgeText="Quản lý toàn bộ danh mục"
        />

        {/* 2. Số lượng đơn chờ xử lý */}
        <StatCard
          title="Đơn chờ xử lý"
          value={stats.pendingOrdersCount}
          subtitle="Cần xác nhận & đóng gói"
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
          badgeText="Tồn kho dưới 5 sản phẩm"
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

      {/* 2-Column Section: Low Stock Warning + Order Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cảnh báo hàng sắp hết kho (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Cảnh báo mặt hàng sắp hết kho
                </h3>
                <p className="text-xs text-slate-500">
                  Các sản phẩm có số lượng tồn kho dưới 5 cái
                </p>
              </div>
            </div>

            <Link
              href="/inventory"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
            >
              <span>Xem kho hàng</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {stats.lowStockProducts.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-1" />
              <p className="text-xs font-semibold text-slate-700">
                Kho hàng đang dồi dào!
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Không có mặt hàng nào dưới 5 sản phẩm tồn kho.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-500 font-semibold text-[11px] uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-2.5 px-3">Sản phẩm</th>
                    <th className="py-2.5 px-3">Mã SKU</th>
                    <th className="py-2.5 px-3">Giá bán</th>
                    <th className="py-2.5 px-3 text-right">Tồn kho</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {stats.lowStockProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900 block">
                          {p.name}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500 text-xs">
                        {p.sku || "--"}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        {formatCurrency(p.price)}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                            p.stock === 0
                              ? "bg-rose-100 text-rose-700"
                              : "bg-amber-100 text-amber-800"
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
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Phân bổ đơn hàng
              </h3>
              <p className="text-xs text-slate-500">
                Thống kê theo 4 trạng thái
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {[
              {
                label: "Đang xử lý (PENDING)",
                count: stats.statusCounts.PENDING,
                color: "bg-amber-500",
                textColor: "text-amber-700",
                bgColor: "bg-amber-50",
              },
              {
                label: "Đang giao (SHIPPING)",
                count: stats.statusCounts.SHIPPING,
                color: "bg-blue-500",
                textColor: "text-blue-700",
                bgColor: "bg-blue-50",
              },
              {
                label: "Đã giao (DELIVERED)",
                count: stats.statusCounts.DELIVERED,
                color: "bg-emerald-500",
                textColor: "text-emerald-700",
                bgColor: "bg-emerald-50",
              },
              {
                label: "Đã hủy (CANCELLED)",
                count: stats.statusCounts.CANCELLED,
                color: "bg-rose-500",
                textColor: "text-rose-700",
                bgColor: "bg-rose-50",
              },
            ].map((item) => (
              <div
                key={item.label}
                className={`p-3 rounded-xl border border-slate-100 flex items-center justify-between ${item.bgColor}`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                  <span className={`text-xs font-semibold ${item.textColor}`}>
                    {item.label}
                  </span>
                </div>
                <span className="font-extrabold text-sm text-slate-900">
                  {item.count}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <Link
              href="/orders"
              className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all"
            >
              <span>Xem chi tiết đơn hàng</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Bảng danh sách các đơn hàng mới tạo gần nhất */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Đơn hàng mới tạo gần nhất
              </h3>
              <p className="text-xs text-slate-500">
                Các đơn đặt hàng mới nhất được ghi nhận vào hệ thống
              </p>
            </div>
          </div>

          <Link
            href="/orders"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
          >
            <span>Xem tất cả</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {stats.recentOrders.length === 0 ? (
          <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400">
            <ShoppingBag className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-700">Chưa có đơn hàng nào</p>
            <p className="text-xs text-slate-400 mt-1">
              Nhấn vào nút &quot;Tạo đơn mới&quot; trên thanh Header để tạo đơn đầu tiên.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold text-[11px] uppercase tracking-wider border-b border-slate-200/80">
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
                  <tr key={order.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
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
                      {order.items.length} mặt hàng (
                      {order.items.reduce((s, i) => s + i.quantity, 0)} cái)
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500 text-right">
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
