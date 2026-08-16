import React from "react";
import { getOrders } from "@/app/actions/order-actions";
import { getProducts } from "@/app/actions/product-actions";
import { getCustomers } from "@/app/actions/customer-actions";
import { OrdersTable } from "@/components/orders/orders-table";
import { ShoppingBag, CheckCircle2, Clock, Truck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const [orders, products, customers] = await Promise.all([
    getOrders(),
    getProducts(),
    getCustomers(),
  ]);

  const pendingCount = orders.filter((o) => o.status === "PENDING").length;
  const shippingCount = orders.filter((o) => o.status === "SHIPPING").length;
  const deliveredCount = orders.filter((o) => o.status === "DELIVERED").length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-7 h-7 text-blue-600" />
            Quản lý Đơn Hàng
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Theo dõi tiến độ đơn, cập nhật trạng thái giao hàng và xử lý trừ kho tự động
          </p>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200/80 shadow-xs flex items-center gap-1.5 text-xs font-semibold text-amber-700">
            <Clock className="w-3.5 h-3.5" />
            <span>Chờ xử lý: {pendingCount}</span>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-blue-50 border border-blue-200/80 shadow-xs flex items-center gap-1.5 text-xs font-semibold text-blue-700">
            <Truck className="w-3.5 h-3.5" />
            <span>Đang giao: {shippingCount}</span>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/80 shadow-xs flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Đã giao: {deliveredCount}</span>
          </div>
        </div>
      </div>

      {/* Orders Table with Transaction Status Updater and Create Modal */}
      <OrdersTable
        initialOrders={orders}
        products={products}
        customers={customers}
      />
    </div>
  );
}
