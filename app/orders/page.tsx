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
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#191716] tracking-tight flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FAF2EE] text-[#CC785C] border border-[#F5E4DB]">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span>Quản lý Đơn Hàng</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#78716C] mt-1">
            Theo dõi tiến độ đơn, cập nhật trạng thái giao hàng và xử lý trừ kho tự động
          </p>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          <div className="px-3.5 py-1.5 rounded-xl bg-[#FEF8EC] border border-[#FDE68A] shadow-claude-xs flex items-center gap-2 text-xs font-semibold text-[#92400E]">
            <Clock className="w-3.5 h-3.5 text-[#B45309]" />
            <span>Chờ xử lý: {pendingCount}</span>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-[#F0F7FF] border border-[#BFDBFE] shadow-claude-xs flex items-center gap-2 text-xs font-semibold text-[#1E40AF]">
            <Truck className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Đang giao: {shippingCount}</span>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] shadow-claude-xs flex items-center gap-2 text-xs font-semibold text-[#166534]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D]" />
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
