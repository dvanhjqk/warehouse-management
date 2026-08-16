"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  MonthlyAnalyticsData,
  MonthlyProductSales,
} from "@/app/actions/analytics-actions";
import { formatCurrency } from "@/lib/utils";
import {
  DollarSign,
  TrendingUp,
  Package,
  Calendar,
  ShoppingBag,
  Award,
  Layers,
  Sparkles,
} from "lucide-react";

interface MonthlyAnalyticsViewProps {
  initialData: MonthlyAnalyticsData;
}

export function MonthlyAnalyticsView({
  initialData,
}: MonthlyAnalyticsViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    selectedYear,
    selectedMonth,
    totalRevenue,
    completedOrdersCount,
    totalItemsSold,
    averageOrderValue,
    productsSold,
    yearlyTrends,
    availableYears,
  } = initialData;

  const [currentYear, setCurrentYear] = useState(selectedYear);

  const handleYearChange = (year: number) => {
    setCurrentYear(year);
    startTransition(() => {
      router.push(`/analytics?year=${year}&month=${selectedMonth}`);
    });
  };

  const handleMonthChange = (month: number) => {
    startTransition(() => {
      router.push(`/analytics?year=${currentYear}&month=${month}`);
    });
  };

  const maxYearlyRevenue = Math.max(
    ...yearlyTrends.map((t) => t.revenue),
    1
  );

  const yearlyTotalRevenue = yearlyTrends.reduce((sum, t) => sum + t.revenue, 0);
  const yearlyTotalOrders = yearlyTrends.reduce((sum, t) => sum + t.ordersCount, 0);

  return (
    <div className="space-y-6">
      {/* Header with Year Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#191716] tracking-tight flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FAF2EE] text-[#CC785C] border border-[#F5E4DB]">
              <Calendar className="w-5 h-5" />
            </div>
            <span>Báo Cáo Doanh Thu Tháng {selectedMonth}/{currentYear}</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#78716C] mt-1">
            Tổng hợp doanh thu thực tế và sản lượng các mặt hàng đã giao thành công
          </p>
        </div>

        {/* Year Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-[#78716C]">
            Chọn năm:
          </label>
          <select
            value={currentYear}
            onChange={(e) => handleYearChange(parseInt(e.target.value, 10))}
            className="px-3.5 py-1.5 rounded-xl border border-[#E8E4DC] bg-white text-xs font-bold text-[#191716] focus:outline-none focus:ring-2 focus:ring-[#CC785C]/20 shadow-claude-xs"
          >
            {availableYears.map((y) => (
              <option key={y} value={y}>
                Năm {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 12-Month Quick Selector Pill Tabs */}
      <div className="p-2.5 rounded-2xl bg-white border border-[#E8E4DC] shadow-claude-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {yearlyTrends.map((t) => {
            const isSelected = t.month === selectedMonth;
            const hasRevenue = t.revenue > 0;

            return (
              <button
                key={t.month}
                onClick={() => handleMonthChange(t.month)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex flex-col items-center gap-0.5 flex-1 min-w-[65px] ${
                  isSelected
                    ? "bg-[#FAF2EE] text-[#9B5038] border border-[#F5E4DB] shadow-2xs font-bold"
                    : "text-[#78716C] hover:text-[#191716] hover:bg-[#FAF8F5] border border-transparent"
                }`}
              >
                <span>Tháng {t.month}</span>
                <span
                  className={`text-[10px] tabular-nums font-bold ${
                    hasRevenue
                      ? isSelected
                        ? "text-[#CC785C]"
                        : "text-emerald-700"
                      : "text-[#A8A296]"
                  }`}
                >
                  {hasRevenue ? `${Math.round(t.revenue / 1000)}k` : "0đ"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4 Selected Month KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Doanh thu tháng */}
        <div className="p-5 rounded-2xl bg-white border border-[#E8E4DC] shadow-claude-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-[#78716C]">
            <span>Doanh thu Tháng {selectedMonth}</span>
            <div className="p-2 rounded-xl bg-[#FAF2EE] text-[#CC785C] border border-[#F5E4DB]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-[#191716] tracking-tight tabular-nums">
            {formatCurrency(totalRevenue)}
          </p>
          <p className="text-[11px] text-[#78716C]">
            Từ các đơn ĐÃ GIAO
          </p>
        </div>

        {/* Số đơn hoàn tất */}
        <div className="p-5 rounded-2xl bg-white border border-[#E8E4DC] shadow-claude-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-[#78716C]">
            <span>Số đơn hoàn tất</span>
            <div className="p-2 rounded-xl bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-[#191716] tracking-tight tabular-nums">
            {completedOrdersCount} đơn
          </p>
          <p className="text-[11px] text-[#78716C]">
            Giao hàng thành công
          </p>
        </div>

        {/* Số lượng sản phẩm bán ra */}
        <div className="p-5 rounded-2xl bg-white border border-[#E8E4DC] shadow-claude-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-[#78716C]">
            <span>Mặt hàng xuất kho</span>
            <div className="p-2 rounded-xl bg-[#FAF2EE] text-[#CC785C] border border-[#F5E4DB]">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-[#191716] tracking-tight tabular-nums">
            {totalItemsSold} cái
          </p>
          <p className="text-[11px] text-[#78716C]">
            Tổng số lượng các mặt hàng
          </p>
        </div>

        {/* Giá trị trung bình đơn */}
        <div className="p-5 rounded-2xl bg-white border border-[#E8E4DC] shadow-claude-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-[#78716C]">
            <span>Giá trị trung bình / đơn</span>
            <div className="p-2 rounded-xl bg-[#F0F7FF] text-[#2563EB] border border-[#BFDBFE]">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-[#191716] tracking-tight tabular-nums">
            {formatCurrency(averageOrderValue)}
          </p>
          <p className="text-[11px] text-[#78716C]">
            Doanh thu / Tổng số đơn
          </p>
        </div>
      </div>

      {/* 2-Column: 12-Month Bar Chart + Top Products Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Biểu đồ cột 12 tháng (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-white border border-[#E8E4DC] p-6 space-y-4 shadow-claude-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#CC785C]" />
              <h3 className="font-serif font-bold text-[#191716] text-base">
                Biểu đồ doanh thu 12 tháng năm {currentYear}
              </h3>
            </div>
            <span className="text-xs font-bold text-[#78716C] tabular-nums">
              Tổng năm: {formatCurrency(yearlyTotalRevenue)}
            </span>
          </div>

          {/* Bar chart visualization */}
          <div className="h-64 pt-6 flex items-end justify-between gap-1 sm:gap-2 border-b border-[#E8E4DC] pb-2">
            {yearlyTrends.map((item) => {
              const heightPercent =
                maxYearlyRevenue > 0
                  ? Math.max((item.revenue / maxYearlyRevenue) * 100, 4)
                  : 4;
              const isSelected = item.month === selectedMonth;

              return (
                <div
                  key={item.month}
                  onClick={() => handleMonthChange(item.month)}
                  className="flex-1 flex flex-col items-center gap-2 h-full justify-end group cursor-pointer"
                >
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-[#191716] bg-white px-1.5 py-0.5 rounded-md border border-[#E8E4DC] shadow-xs pointer-events-none whitespace-nowrap mb-1">
                    {formatCurrency(item.revenue)}
                  </div>

                  {/* The bar */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-lg transition-all ${
                      isSelected
                        ? "bg-[#CC785C]"
                        : item.revenue > 0
                        ? "bg-[#E0AA94] hover:bg-[#CC785C]"
                        : "bg-[#F5F2EB]"
                    }`}
                  />

                  {/* Label */}
                  <span
                    className={`text-[11px] font-bold ${
                      isSelected
                        ? "text-[#CC785C]"
                        : "text-[#78716C] group-hover:text-[#191716]"
                    }`}
                  >
                    T{item.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top sản phẩm bán chạy nhất trong tháng (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-white border border-[#E8E4DC] p-6 space-y-4 shadow-claude-xs">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#CC785C]" />
            <div>
              <h3 className="font-serif font-bold text-[#191716] text-base">
                Mặt hàng bán chạy (Tháng {selectedMonth})
              </h3>
              <p className="text-xs text-[#78716C]">
                Xếp hạng theo doanh số đóng góp
              </p>
            </div>
          </div>

          {productsSold.length === 0 ? (
            <div className="p-8 text-center bg-[#FAF8F5] rounded-xl border border-dashed border-[#E8E4DC] text-[#78716C]">
              <Package className="w-8 h-8 mx-auto text-[#A8A296] mb-1" />
              <p className="text-xs font-semibold text-[#191716]">
                Chưa có dữ liệu bán hàng tháng {selectedMonth}
              </p>
              <p className="text-[11px] text-[#78716C] mt-0.5">
                Các đơn hàng hoàn tất trong tháng này sẽ được thống kê tại đây.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {productsSold.map((p, idx) => {
                const medals = ["🥇", "🥈", "🥉"];
                return (
                  <div
                    key={p.productId}
                    className="p-3 rounded-xl border border-[#E8E4DC] bg-[#FAF8F5] hover:bg-white hover:border-[#CC785C]/40 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base shrink-0">
                        {medals[idx] || `#${idx + 1}`}
                      </span>
                      <div className="truncate">
                        <span className="font-semibold text-xs text-[#191716] block truncate">
                          {p.productName}
                        </span>
                        <span className="text-[11px] text-[#78716C] tabular-nums">
                          Đã bán: <b>{p.totalQuantitySold}</b> cái ({p.percentageOfTotal}%)
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-bold text-xs text-[#191716] tabular-nums block">
                        {formatCurrency(p.totalRevenue)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
