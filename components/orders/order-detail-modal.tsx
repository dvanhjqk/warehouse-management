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
      <div className="space-y-6">
        {/* Status & Date bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl bg-slate-50 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-bold">
              Trạng thái:
            </span>
            <OrderStatusBadge status={order.status} />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold tabular-nums">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <span>Ngày tạo: {formatDate(order.createdAt)}</span>
          </div>
        </div>

        {/* Customer Information */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <User className="w-4 h-4 text-indigo-600" />
            Thông tin khách hàng
          </h4>
          <div className="p-5 rounded-3xl border border-slate-200 bg-white space-y-2.5 text-xs sm:text-sm shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Họ và tên:</span>
              <span className="font-extrabold text-slate-900">
                {order.customer.name}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Số điện thoại:</span>
              <span className="font-bold text-slate-800 flex items-center gap-1 font-mono">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {order.customer.phone}
              </span>
            </div>
            <div className="flex items-start justify-between gap-4 pt-1 border-t border-slate-100">
              <span className="text-slate-500 shrink-0 font-medium">Địa chỉ giao hàng:</span>
              <span className="text-right text-slate-700 font-medium flex items-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                {order.customer.address || "(Chưa cung cấp địa chỉ)"}
              </span>
            </div>
          </div>
        </div>

        {/* Order Items List */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <Package className="w-4 h-4 text-indigo-600" />
            Danh sách sản phẩm trong đơn ({order.items.length})
          </h4>
          <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-500 font-bold text-[11px] uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Sản phẩm</th>
                  <th className="py-3 px-3 text-center">Số lượng</th>
                  <th className="py-3 px-3 text-right">Đơn giá</th>
                  <th className="py-3 px-4 text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {order.items.map((item) => {
                  const lineTotal = item.price * item.quantity;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">
                          {item.product.name}
                        </div>
                        {item.product.sku && (
                          <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                            SKU: {item.product.sku}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-center font-extrabold text-slate-800">
                        x{item.quantity}
                      </td>
                      <td className="py-3.5 px-3 text-right text-slate-600 tabular-nums">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-slate-900 tabular-nums">
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
        <div className="p-5 rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-600 text-white flex items-center justify-between shadow-lg shadow-indigo-500/25">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/15 backdrop-blur-md">
              <Receipt className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-indigo-100">
                Tổng tiền thanh toán
              </p>
              <p className="text-[11px] text-indigo-200">
                Bao gồm toàn bộ các mặt hàng trong đơn
              </p>
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums">
            {formatCurrency(order.totalAmount)}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          {isPending && onEdit && (
            <button
              type="button"
              onClick={() => onEdit(order)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all active:scale-95"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Chỉnh sửa đơn này</span>
            </button>
          )}

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
