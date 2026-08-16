"use server";

import prisma from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";

export async function getDashboardStats() {
  try {
    // Chạy đồng thời tất cả truy vấn qua Promise.all để giảm số lượt roundtrip mạng từ 10 xuống còn 1
    const [
      totalProducts,
      lowStockProducts,
      lowStockCount,
      orderStatusGroups,
      deliveredRevenueAggregate,
      recentOrders,
      totalCustomers,
    ] = await Promise.all([
      // 1. Tổng số mặt hàng
      prisma.product.count(),

      // 2. Danh sách cảnh báo hàng sắp hết kho (< 5)
      prisma.product.findMany({
        where: { stock: { lt: 5 } },
        orderBy: { stock: "asc" },
        take: 8,
      }),

      // 3. Số lượng sản phẩm sắp hết kho
      prisma.product.count({
        where: { stock: { lt: 5 } },
      }),

      // 4. Gom nhóm đếm số lượng theo trạng thái đơn hàng (1 câu query duy nhất)
      prisma.order.groupBy({
        by: ["status"],
        _count: {
          _all: true,
        },
      }),

      // 5. Tổng doanh thu từ các đơn DELIVERED (tính toán aggregate trực tiếp từ DB)
      prisma.order.aggregate({
        where: { status: OrderStatus.DELIVERED },
        _sum: {
          totalAmount: true,
        },
      }),

      // 6. Đơn hàng mới nhất
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

      // 7. Tổng số khách hàng
      prisma.customer.count(),
    ]);

    // Map kết quả đếm trạng thái từ groupBy
    const statusCounts: Record<OrderStatus, number> = {
      PENDING: 0,
      SHIPPING: 0,
      DELIVERED: 0,
      CANCELLED: 0,
    };

    orderStatusGroups.forEach((g) => {
      statusCounts[g.status] = g._count._all;
    });

    const pendingOrdersCount = statusCounts.PENDING || 0;
    const totalRevenue = deliveredRevenueAggregate._sum.totalAmount || 0;

    return {
      totalProducts,
      pendingOrdersCount,
      lowStockCount,
      lowStockProducts,
      totalRevenue,
      recentOrders,
      statusCounts,
      totalCustomers,
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
