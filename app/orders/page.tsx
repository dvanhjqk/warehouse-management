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
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-2xs">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <span>Quản lý Đơn Hàng</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Theo dõi tiến độ đơn, cập nhật trạng thái giao hàng và xử lý trừ kho tự động
          </p>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="px-4 py-2 rounded-2xl bg-amber-50 border border-amber-200/80 shadow-2xs flex items-center gap-2 text-xs font-bold text-amber-800">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Chờ xử lý: {pendingCount}</span>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-blue-50 border border-blue-200/80 shadow-2xs flex items-center gap-2 text-xs font-bold text-blue-800">
            <Truck className="w-3.5 h-3.5 text-blue-600" />
            <span>Đang giao: {shippingCount}</span>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200/80 shadow-2xs flex items-center gap-2 text-xs font-bold text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
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
