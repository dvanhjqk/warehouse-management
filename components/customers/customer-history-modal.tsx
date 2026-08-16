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
      <div className="space-y-5">
        {/* Customer Header Details Card */}
        <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E4DC] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E8E4DC] pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FAF2EE] text-[#CC785C] border border-[#F5E4DB] flex items-center justify-center font-bold text-sm">
                {customer.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-[#191716] text-sm sm:text-base">
                    {customer.name}
                  </h4>
                  {isVip && (
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.2 rounded-full text-[10px] font-bold bg-[#FEF8EC] text-[#92400E] border border-[#FDE68A]">
                      <Crown className="w-2.5 h-2.5 text-[#B45309]" />
                      <span>VIP</span>
                    </span>
                  )}
                  {isLoyal && (
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.2 rounded-full text-[10px] font-bold bg-[#FAF2EE] text-[#9B5038] border border-[#F5E4DB]">
                      <Sparkles className="w-2.5 h-2.5 text-[#CC785C]" />
                      <span>Thân thiết</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#78716C] flex items-center gap-1 font-mono">
                  <Phone className="w-3 h-3 text-[#A8A296]" />
                  {customer.phone}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-[#78716C] block">Ngày tham gia:</span>
              <span className="text-xs font-semibold text-[#191716] tabular-nums">
                {formatDate(customer.createdAt)}
              </span>
            </div>
          </div>

          <div className="text-xs text-[#44403C] flex items-start gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#A8A296] shrink-0 mt-0.5" />
            <span>{customer.address || "(Chưa có thông tin địa chỉ)"}</span>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-white border border-[#E8E4DC]">
              <span className="text-[11px] text-[#78716C] font-semibold block">
                Tổng số đơn đã đặt
              </span>
              <span className="text-lg font-bold text-[#191716] tabular-nums">
                {customer.orders.length} đơn
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-[#E8E4DC]">
              <span className="text-[11px] text-[#78716C] font-semibold block">
                Tổng tiền đã chi (Đã giao)
              </span>
              <span className="text-lg font-bold text-emerald-700 tabular-nums">
                {formatCurrency(totalSpent)}
              </span>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#44403C] mb-2 flex items-center gap-1.5">
            <ShoppingBag className="w-4 h-4 text-[#CC785C]" />
            Lịch sử các đơn hàng ({customer.orders.length})
          </h4>

          {customer.orders.length === 0 ? (
            <div className="p-8 text-center bg-[#FAF8F5] rounded-xl border border-dashed border-[#E8E4DC] text-[#78716C]">
              <Package className="w-8 h-8 mx-auto text-[#A8A296] mb-1" />
              <p className="text-xs font-semibold text-[#191716]">
                Khách hàng chưa có đơn hàng nào
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {customer.orders.map((order) => (
                <div
                  key={order.id}
                  className="p-3.5 rounded-xl border border-[#E8E4DC] bg-white hover:border-[#CC785C]/40 transition-all space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F5F2EB] pb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-[#CC785C]">
                        #{order.id.slice(-6).toUpperCase()}
                      </span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <span className="text-xs text-[#78716C] tabular-nums">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>

                  {/* Items in order */}
                  <div className="space-y-1">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-xs text-[#44403C]"
                      >
                        <span className="text-[#191716]">
                          • {item.product.name} (x{item.quantity})
                        </span>
                        <span className="font-semibold text-[#191716] tabular-nums">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-1.5 border-t border-[#F5F2EB] text-xs">
                    <span className="text-[#78716C] font-semibold">
                      Tổng tiền đơn:
                    </span>
                    <span className="font-bold text-[#191716] text-sm tabular-nums">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-[#F5F2EB]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#191716] hover:bg-[#292524] text-white text-xs font-semibold shadow-xs"
          >
            Đóng
          </button>
        </div>
      </div>
    </Modal>
  );
}
