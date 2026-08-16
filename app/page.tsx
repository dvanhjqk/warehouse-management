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
  Sparkles,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      {/* Claude Editorial Welcome Banner */}
      <div className="rounded-2xl bg-[#FAF2EE] border border-[#F5E4DB] p-6 sm:p-7 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-xl space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white text-[#9B5038] border border-[#EBC7B8] shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#CC785C]" />
              <span>Hệ thống Quản lý Bán hàng Cá nhân</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#191716]">
              Chào mừng bạn trở lại!
            </h1>
            <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed">
              Báo cáo tổng quan về tình hình tồn kho, các đơn hàng cần xử lý và doanh thu thực tế đã thu được.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              href="/orders"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#CC785C] hover:bg-[#BA664A] text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo đơn mới</span>
            </Link>

            <Link
              href="/inventory"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-[#F5F2EB] text-[#44403C] text-xs font-semibold border border-[#E8E4DC] transition-all"
            >
              <PackagePlus className="w-4 h-4 text-[#78716C]" />
              <span>Thêm mặt hàng</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Core Stat KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Tổng số mặt hàng */}
        <StatCard
          title="Tổng mặt hàng"
          value={stats.totalProducts}
          subtitle="Sản phẩm đang lưu kho"
          icon={Boxes}
          colorScheme="claude"
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
        <div className="lg:col-span-2 rounded-2xl bg-white border border-[#E8E4DC] p-6 space-y-4 shadow-claude-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#FEF8EC] text-[#B45309] border border-[#FDE68A]">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-[#191716] text-base tracking-tight">
                  Cảnh báo mặt hàng sắp hết kho
                </h3>
                <p className="text-xs text-[#78716C]">
                  Các sản phẩm có số lượng tồn kho dưới 5 sản phẩm
                </p>
              </div>
            </div>

            <Link
              href="/inventory"
              className="text-xs font-semibold text-[#CC785C] hover:text-[#BA664A] flex items-center gap-1 hover:underline"
            >
              <span>Xem kho hàng</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {stats.lowStockProducts.length === 0 ? (
            <div className="p-8 text-center bg-[#FAF8F5] rounded-xl border border-dashed border-[#E8E4DC] text-[#78716C]">
              <CheckCircle2 className="w-7 h-7 mx-auto text-emerald-600 mb-1" />
              <p className="text-xs font-semibold text-[#191716]">
                Kho hàng đang dồi dào!
              </p>
              <p className="text-[11px] text-[#78716C] mt-0.5">
                Không có mặt hàng nào dưới 5 sản phẩm tồn kho.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[#E8E4DC]">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#FAF8F5] text-[#78716C] font-semibold text-[11px] uppercase tracking-wider border-b border-[#E8E4DC]">
                  <tr>
                    <th className="py-2.5 px-3.5">Sản phẩm</th>
                    <th className="py-2.5 px-3.5">Mã SKU</th>
                    <th className="py-2.5 px-3.5">Giá bán</th>
                    <th className="py-2.5 px-3.5 text-right">Tồn kho</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F2EB] font-medium">
                  {stats.lowStockProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="py-3 px-3.5 font-medium text-[#191716]">
                        {p.name}
                      </td>
                      <td className="py-3 px-3.5 font-mono text-[#78716C] text-xs">
                        {p.sku ? (
                          <span className="px-2 py-0.5 rounded bg-[#F5F2EB] text-[#44403C] font-semibold">
                            {p.sku}
                          </span>
                        ) : (
                          "--"
                        )}
                      </td>
                      <td className="py-3 px-3.5 font-semibold text-[#191716] tabular-nums">
                        {formatCurrency(p.price)}
                      </td>
                      <td className="py-3 px-3.5 text-right">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            p.stock === 0
                              ? "bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]"
                              : "bg-[#FEF8EC] text-[#B45309] border border-[#FDE68A]"
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
        <div className="rounded-2xl bg-white border border-[#E8E4DC] p-6 space-y-4 shadow-claude-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-3.5">
              <div className="p-2 rounded-xl bg-[#FAF2EE] text-[#CC785C] border border-[#F5E4DB]">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-[#191716] text-base tracking-tight">
                  Phân bổ đơn hàng
                </h3>
                <p className="text-xs text-[#78716C]">
                  Tiến độ các giai đoạn
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {[
                {
                  label: "Đang xử lý (PENDING)",
                  count: stats.statusCounts.PENDING,
                  color: "bg-[#D97706]",
                  textColor: "text-[#92400E]",
                  bgColor: "bg-[#FEF8EC] border-[#FDE68A]",
                },
                {
                  label: "Đang giao (SHIPPING)",
                  count: stats.statusCounts.SHIPPING,
                  color: "bg-[#2563EB]",
                  textColor: "text-[#1E40AF]",
                  bgColor: "bg-[#F0F7FF] border-[#BFDBFE]",
                },
                {
                  label: "Đã giao (DELIVERED)",
                  count: stats.statusCounts.DELIVERED,
                  color: "bg-[#15803D]",
                  textColor: "text-[#166534]",
                  bgColor: "bg-[#F0FDF4] border-[#BBF7D0]",
                },
                {
                  label: "Đã hủy (CANCELLED)",
                  count: stats.statusCounts.CANCELLED,
                  color: "bg-[#DC2626]",
                  textColor: "text-[#991B1B]",
                  bgColor: "bg-[#FEF2F2] border-[#FECACA]",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`p-2.5 rounded-xl border flex items-center justify-between ${item.bgColor} transition-colors`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${item.color}`} />
                    <span className={`text-xs font-semibold ${item.textColor}`}>
                      {item.label}
                    </span>
                  </div>
                  <span className="font-bold text-sm text-[#191716] tabular-nums">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/orders"
              className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-xl border border-[#E8E4DC] hover:bg-[#F5F2EB] text-[#44403C] text-xs font-semibold transition-colors"
            >
              <span>Xem chi tiết đơn hàng</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Bảng danh sách đơn hàng mới tạo gần nhất */}
      <div className="rounded-2xl bg-white border border-[#E8E4DC] p-6 space-y-4 shadow-claude-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FAF2EE] text-[#CC785C] border border-[#F5E4DB]">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-[#191716] text-base tracking-tight">
                Đơn hàng mới tạo gần nhất
              </h3>
              <p className="text-xs text-[#78716C]">
                Các đơn đặt hàng mới nhất được ghi nhận vào hệ thống
              </p>
            </div>
          </div>

          <Link
            href="/orders"
            className="text-xs font-semibold text-[#CC785C] hover:text-[#BA664A] flex items-center gap-1 hover:underline"
          >
            <span>Xem tất cả</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {stats.recentOrders.length === 0 ? (
          <div className="p-10 text-center bg-[#FAF8F5] rounded-xl border border-dashed border-[#E8E4DC] text-[#78716C]">
            <ShoppingBag className="w-8 h-8 mx-auto text-[#A8A296] mb-2" />
            <p className="font-semibold text-[#191716]">Chưa có đơn hàng nào</p>
            <p className="text-xs text-[#78716C] mt-0.5">
              Nhấn vào nút &quot;Tạo đơn mới&quot; để tạo đơn đầu tiên.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#E8E4DC]">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#FAF8F5] text-[#78716C] font-semibold text-[11px] uppercase tracking-wider border-b border-[#E8E4DC]">
                <tr>
                  <th className="py-2.5 px-3.5">Mã đơn</th>
                  <th className="py-2.5 px-3.5">Khách hàng</th>
                  <th className="py-2.5 px-3.5">Số lượng món</th>
                  <th className="py-2.5 px-3.5">Tổng tiền</th>
                  <th className="py-2.5 px-3.5">Trạng thái</th>
                  <th className="py-2.5 px-3.5 text-right">Thời gian tạo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F2EB] font-medium text-[#191716]">
                {stats.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="py-3 px-3.5 font-mono font-bold text-[#CC785C]">
                      #{order.id.slice(-6).toUpperCase()}
                    </td>
                    <td className="py-3 px-3.5">
                      <span className="font-bold text-[#191716] block">
                        {order.customer.name}
                      </span>
                      <span className="text-xs text-[#78716C] font-mono">
                        {order.customer.phone}
                      </span>
                    </td>
                    <td className="py-3 px-3.5">
                      <span className="font-medium text-[#44403C]">
                        {order.items.length} món ({order.items.reduce((s, i) => s + i.quantity, 0)} cái)
                      </span>
                    </td>
                    <td className="py-3 px-3.5 font-bold text-[#191716] tabular-nums">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="py-3 px-3.5">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="py-3 px-3.5 text-xs text-[#78716C] text-right tabular-nums">
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
