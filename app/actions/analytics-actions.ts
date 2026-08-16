"use server";

import prisma from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";

export interface MonthlyProductSales {
  productId: string;
  productName: string;
  sku: string | null;
  unitPrice: number;
  totalQuantitySold: number;
  totalRevenue: number;
  ordersCount: number;
  percentageOfTotal: number;
}

export interface MonthlyTrendData {
  month: number;
  monthName: string;
  revenue: number;
  ordersCount: number;
  itemsSold: number;
}

export interface MonthlyAnalyticsData {
  selectedYear: number;
  selectedMonth: number;
  totalRevenue: number;
  completedOrdersCount: number;
  totalItemsSold: number;
  averageOrderValue: number;
  productsSold: MonthlyProductSales[];
  yearlyTrends: MonthlyTrendData[];
  availableYears: number[];
}

/**
 * Lấy báo cáo thống kê doanh thu và mặt hàng đã bán theo từng tháng
 */
export async function getMonthlyAnalytics(
  year?: number,
  month?: number
): Promise<MonthlyAnalyticsData> {
  try {
    const now = new Date();
    const currentYear = year || now.getFullYear();
    const currentMonth = month !== undefined ? month : now.getMonth() + 1; // 1-indexed (1 to 12)

    // Xác định khoảng thời gian đầu tháng và cuối tháng được chọn
    const startOfMonth = new Date(currentYear, currentMonth - 1, 1, 0, 0, 0, 0);
    const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

    // Xác định khoảng thời gian cả năm để vẽ biểu đồ xu hướng 12 tháng
    const startOfYear = new Date(currentYear, 0, 1, 0, 0, 0, 0);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59, 999);

    // Chạy song song truy vấn đơn hàng DELIVERED trong tháng & cả năm
    const [monthOrders, yearOrders, allDeliveredOrders] = await Promise.all([
      // 1. Các đơn hàng DELIVERED trong tháng được chọn
      prisma.order.findMany({
        where: {
          status: OrderStatus.DELIVERED,
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        include: {
          customer: true,
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),

      // 2. Các đơn hàng DELIVERED trong cả năm để tính xu hướng 12 tháng
      prisma.order.findMany({
        where: {
          status: OrderStatus.DELIVERED,
          createdAt: {
            gte: startOfYear,
            lte: endOfYear,
          },
        },
        include: {
          items: true,
        },
      }),

      // 3. Lấy danh sách các năm có phát sinh đơn hàng
      prisma.order.findMany({
        where: { status: OrderStatus.DELIVERED },
        select: { createdAt: true },
      }),
    ]);

    // Danh sách các năm có dữ liệu (mặc định luôn có năm hiện tại)
    const yearSet = new Set<number>([currentYear]);
    allDeliveredOrders.forEach((o) => {
      yearSet.add(new Date(o.createdAt).getFullYear());
    });
    const availableYears = Array.from(yearSet).sort((a, b) => b - a);

    // 1. Tổng hợp số liệu trong tháng được chọn
    const totalRevenue = monthOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const completedOrdersCount = monthOrders.length;
    let totalItemsSold = 0;

    // Map gom nhóm thống kê theo từng sản phẩm đã bán trong tháng
    const productStatsMap = new Map<
      string,
      {
        productId: string;
        productName: string;
        sku: string | null;
        unitPrice: number;
        totalQuantitySold: number;
        totalRevenue: number;
        orderIds: Set<string>;
      }
    >();

    monthOrders.forEach((order) => {
      order.items.forEach((item) => {
        totalItemsSold += item.quantity;
        const lineTotal = item.price * item.quantity;

        const existing = productStatsMap.get(item.productId);
        if (existing) {
          existing.totalQuantitySold += item.quantity;
          existing.totalRevenue += lineTotal;
          existing.orderIds.add(order.id);
        } else {
          productStatsMap.set(item.productId, {
            productId: item.productId,
            productName: item.product.name,
            sku: item.product.sku,
            unitPrice: item.price,
            totalQuantitySold: item.quantity,
            totalRevenue: lineTotal,
            orderIds: new Set([order.id]),
          });
        }
      });
    });

    const productsSold: MonthlyProductSales[] = Array.from(
      productStatsMap.values()
    )
      .map((item) => ({
        productId: item.productId,
        productName: item.productName,
        sku: item.sku,
        unitPrice: item.unitPrice,
        totalQuantitySold: item.totalQuantitySold,
        totalRevenue: item.totalRevenue,
        ordersCount: item.orderIds.size,
        percentageOfTotal:
          totalRevenue > 0
            ? Math.round((item.totalRevenue / totalRevenue) * 1000) / 10
            : 0,
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue); // Sắp xếp theo doanh thu giảm dần

    const averageOrderValue =
      completedOrdersCount > 0 ? Math.round(totalRevenue / completedOrdersCount) : 0;

    // 2. Tổng hợp xu hướng doanh thu 12 tháng trong năm
    const yearlyTrends: MonthlyTrendData[] = Array.from({ length: 12 }, (_, i) => {
      const m = i + 1;
      const monthOrdersOfYear = yearOrders.filter((o) => {
        const d = new Date(o.createdAt);
        return d.getMonth() + 1 === m;
      });

      const mRevenue = monthOrdersOfYear.reduce((sum, o) => sum + o.totalAmount, 0);
      const mItemsSold = monthOrdersOfYear.reduce(
        (sum, o) => sum + o.items.reduce((iSum, it) => iSum + it.quantity, 0),
        0
      );

      return {
        month: m,
        monthName: `T${m}`,
        revenue: mRevenue,
        ordersCount: monthOrdersOfYear.length,
        itemsSold: mItemsSold,
      };
    });

    return {
      selectedYear: currentYear,
      selectedMonth: currentMonth,
      totalRevenue,
      completedOrdersCount,
      totalItemsSold,
      averageOrderValue,
      productsSold,
      yearlyTrends,
      availableYears,
    };
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu thống kê theo tháng:", error);
    return {
      selectedYear: year || new Date().getFullYear(),
      selectedMonth: month || new Date().getMonth() + 1,
      totalRevenue: 0,
      completedOrdersCount: 0,
      totalItemsSold: 0,
      averageOrderValue: 0,
      productsSold: [],
      yearlyTrends: Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        monthName: `T${i + 1}`,
        revenue: 0,
        ordersCount: 0,
        itemsSold: 0,
      })),
      availableYears: [new Date().getFullYear()],
    };
  }
}
