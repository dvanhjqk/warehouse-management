"use server";

import prisma from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";

export async function getDashboardStats() {
  try {
    // Tối ưu hóa tối đa: Giảm từ 7 queries xuống 3 queries chạy song song
    const [
      totalProducts,
      lowStockProducts,
      orderGroups,
      recentOrders,
    ] = await Promise.all([
      // 1. Tổng số mặt hàng
      prisma.product.count(),

      // 2. Danh sách cảnh báo hàng sắp hết kho (< 5)
      prisma.product.findMany({
        where: { stock: { lt: 5 } },
        orderBy: { stock: "asc" },
        take: 8,
      }),

      // 3. Gom nhóm đếm số lượng VÀ tính tổng tiền trong 1 query duy nhất!
      prisma.order.groupBy({
        by: ["status"],
        _count: {
          _all: true,
        },
        _sum: {
          totalAmount: true,
        },
      }),

      // 4. 5 đơn hàng mới nhất
      prisma.order.findMany({
        include: {
          customer: true,
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    // Map kết quả đếm trạng thái & doanh thu từ groupBy
    const statusCounts: Record<OrderStatus, number> = {
      PENDING: 0,
      SHIPPING: 0,
      DELIVERED: 0,
      CANCELLED: 0,
    };

    let totalRevenue = 0;

    orderGroups.forEach((g) => {
      statusCounts[g.status] = g._count._all;
      if (g.status === OrderStatus.DELIVERED) {
        totalRevenue = g._sum.totalAmount || 0;
      }
    });

    return {
      totalProducts,
      pendingOrdersCount: statusCounts.PENDING || 0,
      lowStockCount: lowStockProducts.length,
      lowStockProducts,
      totalRevenue,
      recentOrders,
      statusCounts,
      totalCustomers: 0,
    };
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu Dashboard:", error);
    return {
      totalProducts: 0,
      pendingOrdersCount: 0,
      lowStockCount: 0,
      lowStockProducts: [],
      totalRevenue: 0,
      recentOrders: [],
      statusCounts: { PENDING: 0, SHIPPING: 0, DELIVERED: 0, CANCELLED: 0 },
      totalCustomers: 0,
    };
  }
}
