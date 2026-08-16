"use client";

import React from "react";
import { Modal } from "@/components/ui/modal";
import { OrderStatusBadge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Customer, Order, OrderItem, Product } from "@prisma/client";
import { User, Phone, MapPin, ShoppingBag, Package } from "lucide-react";

type CustomerWithOrders = Customer & {
  orders: (Order & {
    items: (OrderItem & {
      product: Product;
    })[];
  })[];
};

interface CustomerHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerWithOrders | null;
}

export function CustomerHistoryModal({
  isOpen,
  onClose,
  customer,
}: CustomerHistoryModalProps) {
  if (!customer) return null;

  const totalSpent = customer.orders
    .filter((o) => o.status === "DELIVERED")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Lịch sử khách hàng & Đơn mua"
      description={`Khách hàng: ${customer.name}`}
      maxWidth="3xl"
    >
      <div className="space-y-6">
        {/* Customer Header Details Card */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-base">
                {customer.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                  {customer.name}
                </h4>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  {customer.phone}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">Ngày tham gia:</span>
              <span className="text-xs font-semibold text-slate-700">
                {formatDate(customer.createdAt)}
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-600 flex items-start gap-1.5">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>{customer.address || "(Chưa có thông tin địa chỉ)"}</span>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-white border border-slate-200">
              <span className="text-[11px] text-slate-500 font-semibold block">
                Tổng số đơn đã đặt
              </span>
              <span className="text-lg font-extrabold text-slate-900">
                {customer.orders.length} đơn
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200">
              <span className="text-[11px] text-slate-500 font-semibold block">
                Tổng tiền đã chi (Đã giao)
              </span>
              <span className="text-lg font-extrabold text-emerald-600">
                {formatCurrency(totalSpent)}
              </span>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
            <ShoppingBag className="w-4 h-4 text-blue-600" />
            Lịch sử các đơn hàng ({customer.orders.length})
          </h4>

          {customer.orders.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400">
              <Package className="w-8 h-8 mx-auto text-slate-300 mb-1" />
              <p className="text-xs font-semibold text-slate-600">
                Khách hàng chưa có đơn hàng nào
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {customer.orders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 transition-all space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-blue-600">
                        #{order.id.slice(-6).toUpperCase()}
                      </span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <span className="text-xs text-slate-400">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>

                  {/* Items in order */}
                  <div className="space-y-1">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-xs text-slate-700"
                      >
                        <span className="text-slate-800">
                          • {item.product.name} (x{item.quantity})
                        </span>
                        <span className="font-semibold text-slate-900">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span className="text-slate-500 font-semibold">
                      Tổng tiền đơn:
                    </span>
                    <span className="font-extrabold text-slate-900 text-sm">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
          >
            Đóng
          </button>
        </div>
      </div>
    </Modal>
  );
}
