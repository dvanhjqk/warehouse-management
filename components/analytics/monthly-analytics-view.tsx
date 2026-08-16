"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MonthlyAnalyticsData } from "@/app/actions/analytics-actions";
import { formatCurrency, cn } from "@/lib/utils";
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Package,
  Layers,
  Calendar,
  ChevronLeft,
  ChevronRight,
  BarChart2,
  Receipt,
} from "lucide-react";

interface MonthlyAnalyticsViewProps {
  initialData: MonthlyAnalyticsData;
}

export function MonthlyAnalyticsView({ initialData }: MonthlyAnalyticsViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [selectedYear, setSelectedYear] = useState(initialData.selectedYear);
  const [selectedMonth, setSelectedMonth] = useState(initialData.selectedMonth);

  const handleMonthChange = (month: number) => {
    setSelectedMonth(month);
    startTransition(() => {
      router.push(`/analytics?year=${selectedYear}&month=${month}`);
    });
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    startTransition(() => {
      router.push(`/analytics?year=${year}&month=${selectedMonth}`);
    });
  };

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      const newYear = selectedYear - 1;
      setSelectedYear(newYear);
      setSelectedMonth(12);
      startTransition(() => {
        router.push(`/analytics?year=${newYear}&month=12`);
      });
    } else {
      const newMonth = selectedMonth - 1;
      setSelectedMonth(newMonth);
      startTransition(() => {
        router.push(`/analytics?year=${selectedYear}&month=${newMonth}`);
      });
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      const newYear = selectedYear + 1;
      setSelectedYear(newYear);
      setSelectedMonth(1);
      startTransition(() => {
        router.push(`/analytics?year=${newYear}&month=1`);
      });
    } else {
      const newMonth = selectedMonth + 1;
      setSelectedMonth(newMonth);
      startTransition(() => {
        router.push(`/analytics?year=${selectedYear}&month=${newMonth}`);
      });
    }
  };

  const maxYearlyRevenue = Math.max(
    ...initialData.yearlyTrends.map((t) => t.revenue),
    1
  );

  return (
    <div className="space-y-6">
      {/* Header Banner & Month Selector */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 mb-2">
              <BarChart2 className="w-3.5 h-3.5" />
              Báo cáo hiệu quả kinh doanh
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Thống Kê Doanh Thu & Hàng Đã Bán Theo Tháng
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Phân tích chi tiết doanh thu thực tế và số lượng từng mặt hàng bán được trong tháng
            </p>
          </div>

          {/* Month / Year Navigator Controls */}
          <div className="flex items-center gap-2 self-start md:self-auto bg-slate-50 p-1.5 rounded-2xl border border-slate-200/80">
            <button
              onClick={handlePrevMonth}
              title="Tháng trước"
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-white transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-xl border border-slate-200 shadow-2xs font-bold text-xs sm:text-sm text-slate-900">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>
                Tháng {selectedMonth}/{selectedYear}
              </span>
            </div>

            <button
              onClick={handleNextMonth}
              title="Tháng tiếp theo"
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-white transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Year selector dropdown */}
            <select
              value={selectedYear}
              onChange={(e) => handleYearChange(parseInt(e.target.value, 10))}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none"
            >
              {initialData.availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  Năm {yr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 12 Months Fast Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-2 border-t border-slate-100">
          {Array.from({ length: 12 }, (_, i) => {
            const m = i + 1;
            const isSelected = m === selectedMonth;
            const trend = initialData.yearlyTrends.find((t) => t.month === m);
            const hasRevenue = trend && trend.revenue > 0;

            return (
              <button
                key={m}
                onClick={() => handleMonthChange(m)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 flex-1 min-w-[72px] justify-center",
                  isSelected
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                    : hasRevenue
                    ? "bg-blue-50/70 text-blue-800 hover:bg-blue-100/70 border border-blue-100"
                    : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                )}
              >
                <span>Tháng {m}</span>
                {hasRevenue && !isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4 Core Monthly KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Doanh thu tháng */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Doanh thu Tháng {selectedMonth}
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-100/80 text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-700 tracking-tight">
            {formatCurrency(initialData.totalRevenue)}
          </h3>
          <p className="text-[11px] text-slate-400">
            Từ các đơn hàng đã giao thành công (DELIVERED)
          </p>
        </div>

        {/* Số đơn hoàn tất */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Đơn hàng hoàn tất
            </span>
            <div className="p-2.5 rounded-xl bg-blue-100/80 text-blue-600">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {initialData.completedOrdersCount} đơn
          </h3>
          <p className="text-[11px] text-slate-400">
            Đã xuất kho và giao tận tay khách
          </p>
        </div>

        {/* Số lượng hàng đã bán */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Số lượng hàng đã bán
            </span>
            <div className="p-2.5 rounded-xl bg-purple-100/80 text-purple-600">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-purple-700 tracking-tight">
            {initialData.totalItemsSold} cái
          </h3>
          <p className="text-[11px] text-slate-400">
            Tổng sản phẩm đã trừ tồn kho
          </p>
        </div>

        {/* Giá trị đơn trung bình (AOV) */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Giá trị đơn TB (AOV)
            </span>
            <div className="p-2.5 rounded-xl bg-amber-100/80 text-amber-600">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-amber-700 tracking-tight">
            {formatCurrency(initialData.averageOrderValue)}
          </h3>
          <p className="text-[11px] text-slate-400">
            Doanh thu trung bình trên mỗi đơn
          </p>
        </div>
      </div>

      {/* Biểu đồ trực quan so sánh xu hướng 12 tháng trong năm */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Xu hướng doanh thu các tháng năm {selectedYear}
              </h3>
              <p className="text-xs text-slate-500">
                So sánh doanh thu thực tế giữa 12 tháng trong năm {selectedYear}
              </p>
            </div>
          </div>

          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
            Tổng cả năm:{" "}
            <b className="text-emerald-600">
              {formatCurrency(
                initialData.yearlyTrends.reduce((s, t) => s + t.revenue, 0)
              )}
            </b>
          </span>
        </div>

        {/* 12 Months Visual Bar Chart */}
        <div className="pt-6 pb-2">
          <div className="grid grid-cols-12 gap-1.5 sm:gap-3 items-end h-48 border-b border-slate-100 pb-2">
            {initialData.yearlyTrends.map((trend) => {
              const isCurrent = trend.month === selectedMonth;
              const heightPercent =
                maxYearlyRevenue > 0
                  ? Math.max((trend.revenue / maxYearlyRevenue) * 100, 6)
                  : 6;

              return (
                <div
                  key={trend.month}
                  onClick={() => handleMonthChange(trend.month)}
                  className="flex flex-col items-center gap-1.5 group cursor-pointer h-full justify-end"
                >
                  {/* Tooltip on hover */}
                  <div className="text-[10px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white px-2 py-0.5 rounded-lg shadow-md whitespace-nowrap mb-1 pointer-events-none hidden sm:block">
                    {formatCurrency(trend.revenue)} ({trend.ordersCount} đơn)
                  </div>

                  {/* Bar */}
                  <div className="w-full bg-slate-100 rounded-xl overflow-hidden flex flex-col justify-end h-32 p-0.5">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={cn(
                        "w-full rounded-lg transition-all duration-300",
                        isCurrent
                          ? "bg-blue-600 shadow-md shadow-blue-500/30"
                          : trend.revenue > 0
                          ? "bg-emerald-500 group-hover:bg-emerald-600"
                          : "bg-slate-200"
                      )}
                    />
                  </div>

                  {/* Month Label */}
                  <span
                    className={cn(
                      "text-[10px] sm:text-xs font-bold transition-colors",
                      isCurrent
                        ? "text-blue-600 font-extrabold"
                        : "text-slate-500 group-hover:text-slate-900"
                    )}
                  >
                    T{trend.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bảng Chi Tiết Mặt Hàng Đã Bán Trong Tháng */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Danh sách mặt hàng đã bán trong Tháng {selectedMonth}/{selectedYear}
              </h3>
              <p className="text-xs text-slate-500">
                Thống kê số lượng bán, doanh thu và tỷ trọng đóng góp của từng sản phẩm
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Có <b>{initialData.productsSold.length}</b> mặt hàng phát sinh doanh số
          </div>
        </div>

        {initialData.productsSold.length === 0 ? (
          <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400">
            <Package className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-700">
              Chưa có mặt hàng nào được bán trong Tháng {selectedMonth}/{selectedYear}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Doanh thu chỉ tính từ các đơn hàng có trạng thái ĐÃ GIAO (DELIVERED) trong tháng này.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold text-[11px] uppercase tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="py-3.5 px-4">#</th>
                  <th className="py-3.5 px-4">Mặt hàng</th>
                  <th className="py-3.5 px-4">Mã SKU</th>
                  <th className="py-3.5 px-4 text-center">Số lượng đã bán</th>
                  <th className="py-3.5 px-4">Doanh thu</th>
                  <th className="py-3.5 px-4">Tỷ trọng đóng góp</th>
                  <th className="py-3.5 px-4 text-right">Số đơn xuất hiện</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {initialData.productsSold.map((prod, index) => (
                  <tr
                    key={prod.productId}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-xs">
                      #{index + 1}
                    </td>

                    {/* Tên sản phẩm */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                          <Package className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-slate-900">
                          {prod.productName}
                        </span>
                      </div>
                    </td>

                    {/* Mã SKU */}
                    <td className="py-3.5 px-4 font-mono text-slate-500 text-xs">
                      {prod.sku ? (
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                          {prod.sku}
                        </span>
                      ) : (
                        "--"
                      )}
                    </td>

                    {/* Số lượng đã bán */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-extrabold bg-purple-50 text-purple-700 border border-purple-200">
                        {prod.totalQuantitySold} cái
                      </span>
                    </td>

                    {/* Doanh thu */}
                    <td className="py-3.5 px-4 font-bold text-emerald-600 text-sm">
                      {formatCurrency(prod.totalRevenue)}
                    </td>

                    {/* Tỷ trọng đóng góp */}
                    <td className="py-3.5 px-4 min-w-[140px]">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            style={{
                              width: `${Math.min(prod.percentageOfTotal, 100)}%`,
                            }}
                            className="bg-blue-600 h-full rounded-full"
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-700 shrink-0">
                          {prod.percentageOfTotal}%
                        </span>
                      </div>
                    </td>

                    {/* Số đơn hàng */}
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-bold text-slate-900">
                        {prod.ordersCount} đơn
                      </span>
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
