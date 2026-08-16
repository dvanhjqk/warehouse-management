"use client";

import React from "react";
import { Modal } from "@/components/ui/modal";
import { OrderStatusBadge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Customer, Order, OrderItem, Product } from "@prisma/client";
import { User, Phone, MapPin, ShoppingBag, Package, Crown, Sparkles } from "lucide-react";

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

  const isVip = totalSpent >= 5000000;
  const isLoyal = totalSpent >= 1000000 && !isVip;

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
        <div className="p-5 rounded-3xl bg-slate-50/90 border border-slate-200/80 space-y-4 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/60 pb-3.5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center font-extrabold text-base shadow-md shadow-indigo-500/25 ring-1 ring-white/20">
                {customer.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-slate-900 text-base">
                    {customer.name}
                  </h4>
                  {isVip && (
                    <span className="inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200">
                      <Crown className="w-3 h-3 text-amber-500" />
                      <span>VIP</span>
                    </span>
                  )}
                  {isLoyal && (
                    <span className="inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      <Sparkles className="w-3 h-3 text-indigo-500" />
                      <span>Thân thiết</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 font-mono mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {customer.phone}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-slate-400 block font-medium">Ngày tham gia:</span>
              <span className="text-xs font-bold text-slate-700 tabular-nums">
                {formatDate(customer.createdAt)}
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-600 flex items-start gap-2">
            <MapPin className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <span className="font-medium">{customer.address || "(Chưa có thông tin địa chỉ)"}</span>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[11px] text-slate-500 font-bold block uppercase tracking-wider">
                Tổng số đơn đã đặt
              </span>
              <span className="text-xl font-extrabold text-slate-900 tabular-nums">
                {customer.orders.length} đơn
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[11px] text-slate-500 font-bold block uppercase tracking-wider">
                Tổng tiền đã chi (Đã giao)
              </span>
              <span className="text-xl font-extrabold text-emerald-600 tabular-nums">
                {formatCurrency(totalSpent)}
              </span>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
            <ShoppingBag className="w-4 h-4 text-indigo-600" />
            Lịch sử các đơn hàng ({customer.orders.length})
          </h4>

          {customer.orders.length === 0 ? (
            <div className="p-10 text-center bg-slate-50/80 rounded-3xl border border-dashed border-slate-200 text-slate-400">
              <Package className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-bold text-slate-600">
                Khách hàng chưa có đơn hàng nào
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {customer.orders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 rounded-2xl border border-slate-200/80 bg-white hover:border-slate-300 transition-all space-y-2.5 shadow-2xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-indigo-600">
                        #{order.id.slice(-6).toUpperCase()}
                      </span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <span className="text-xs text-slate-400 tabular-nums">
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
                        <span className="text-slate-800 font-medium">
                          • {item.product.name} (x{item.quantity})
                        </span>
                        <span className="font-bold text-slate-900 tabular-nums">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span className="text-slate-500 font-bold">
                      Tổng tiền đơn:
                    </span>
                    <span className="font-extrabold text-slate-900 text-sm tabular-nums">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md"
          >
            Đóng
          </button>
        </div>
      </div>
    </Modal>
  );
}
