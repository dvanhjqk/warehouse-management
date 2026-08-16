"use client";

import React from "react";
import { Modal } from "@/components/ui/modal";
import { OrderStatusBadge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Order, Customer, OrderItem, Product } from "@prisma/client";
import {
  User,
  Phone,
  MapPin,
  Calendar,
  Package,
  Receipt,
  Edit2,
} from "lucide-react";

type OrderWithRelations = Order & {
  customer: Customer;
  items: (OrderItem & {
    product: Product;
  })[];
};

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderWithRelations | null;
  onEdit?: (order: OrderWithRelations) => void;
}

export function OrderDetailModal({
  isOpen,
  onClose,
  order,
  onEdit,
}: OrderDetailModalProps) {
  if (!order) return null;

  const isPending = order.status === "PENDING";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chi tiết đơn hàng"
      description={`Mã đơn: #${order.id.slice(-6).toUpperCase()}`}
      maxWidth="2xl"
    >
      <div className="space-y-5">
        {/* Status & Date bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E8E4DC]">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#78716C] font-semibold">
              Trạng thái:
            </span>
            <OrderStatusBadge status={order.status} />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#78716C] font-medium tabular-nums">
            <Calendar className="w-4 h-4 text-[#CC785C]" />
            <span>Ngày tạo: {formatDate(order.createdAt)}</span>
          </div>
        </div>

        {/* Customer Information */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#78716C] mb-2 flex items-center gap-1.5">
            <User className="w-4 h-4 text-[#CC785C]" />
            Thông tin khách hàng
          </h4>
          <div className="p-4 rounded-2xl border border-[#E8E4DC] bg-white space-y-2 text-xs sm:text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[#78716C]">Họ và tên:</span>
              <span className="font-bold text-[#191716]">
                {order.customer.name}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#78716C]">Số điện thoại:</span>
              <span className="font-bold text-[#191716] flex items-center gap-1 font-mono">
                <Phone className="w-3.5 h-3.5 text-[#A8A296]" />
                {order.customer.phone}
              </span>
            </div>
            <div className="flex items-start justify-between gap-4 pt-1 border-t border-[#F5F2EB]">
              <span className="text-[#78716C] shrink-0">Địa chỉ giao hàng:</span>
              <span className="text-right text-[#44403C] font-medium flex items-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#A8A296] shrink-0 mt-0.5" />
                {order.customer.address || "(Chưa cung cấp địa chỉ)"}
              </span>
            </div>
          </div>
        </div>

        {/* Order Items List */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#78716C] mb-2 flex items-center gap-1.5">
            <Package className="w-4 h-4 text-[#CC785C]" />
            Danh sách sản phẩm trong đơn ({order.items.length})
          </h4>
          <div className="rounded-xl border border-[#E8E4DC] overflow-hidden">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#FAF8F5] text-[#78716C] font-semibold text-[11px] uppercase tracking-wider border-b border-[#E8E4DC]">
                <tr>
                  <th className="py-2.5 px-3.5">Sản phẩm</th>
                  <th className="py-2.5 px-3 text-center">Số lượng</th>
                  <th className="py-2.5 px-3 text-right">Đơn giá</th>
                  <th className="py-2.5 px-3.5 text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F2EB] font-medium text-[#191716]">
                {order.items.map((item) => {
                  const lineTotal = item.price * item.quantity;
                  return (
                    <tr key={item.id} className="hover:bg-[#FAF8F5]">
                      <td className="py-3 px-3.5">
                        <div className="font-semibold text-[#191716]">
                          {item.product.name}
                        </div>
                        {item.product.sku && (
                          <div className="text-[11px] font-mono text-[#78716C]">
                            SKU: {item.product.sku}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-[#191716]">
                        x{item.quantity}
                      </td>
                      <td className="py-3 px-3 text-right text-[#44403C] tabular-nums">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="py-3 px-3.5 text-right font-bold text-[#191716] tabular-nums">
                        {formatCurrency(lineTotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Total Summary */}
        <div className="p-4 rounded-2xl bg-[#FAF2EE] border border-[#F5E4DB] text-[#191716] flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#CC785C]" />
            <div>
              <p className="text-xs font-semibold text-[#191716]">
                Tổng tiền thanh toán
              </p>
              <p className="text-[11px] text-[#78716C]">
                Bao gồm toàn bộ các mặt hàng trong đơn
              </p>
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-[#CC785C] tracking-tight tabular-nums">
            {formatCurrency(order.totalAmount)}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F5F2EB]">
          {isPending && onEdit && (
            <button
              type="button"
              onClick={() => onEdit(order)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#CC785C] hover:bg-[#BA664A] text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Chỉnh sửa đơn này</span>
            </button>
          )}

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
