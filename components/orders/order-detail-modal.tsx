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
      description={`Mã đơn: #${order.id}`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Status & Date bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold">
              Trạng thái:
            </span>
            <OrderStatusBadge status={order.status} />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Ngày tạo: {formatDate(order.createdAt)}</span>
          </div>
        </div>

        {/* Customer Information */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <User className="w-4 h-4 text-blue-600" />
            Thông tin khách hàng
          </h4>
          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs sm:text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Họ và tên:</span>
              <span className="font-bold text-slate-900">
                {order.customer.name}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Số điện thoại:</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {order.customer.phone}
              </span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <span className="text-slate-500 shrink-0">Địa chỉ giao hàng:</span>
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
            <Package className="w-4 h-4 text-blue-600" />
            Danh sách sản phẩm trong đơn ({order.items.length})
          </h4>
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold text-[11px] uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Sản phẩm</th>
                  <th className="py-2.5 px-3 text-center">Số lượng</th>
                  <th className="py-2.5 px-3 text-right">Đơn giá</th>
                  <th className="py-2.5 px-4 text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {order.items.map((item) => {
                  const lineTotal = item.price * item.quantity;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">
                          {item.product.name}
                        </div>
                        {item.product.sku && (
                          <div className="text-[11px] font-mono text-slate-400">
                            SKU: {item.product.sku}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-800">
                        x{item.quantity}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-600">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
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
        <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-900 font-bold">
            <Receipt className="w-5 h-5 text-blue-600" />
            <span>Tổng tiền thanh toán:</span>
          </div>
          <div className="text-xl font-extrabold text-blue-700">
            {formatCurrency(order.totalAmount)}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          {isPending && onEdit && (
            <button
              type="button"
              onClick={() => onEdit(order)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Chỉnh sửa đơn này</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs"
          >
            Đóng
          </button>
        </div>
      </div>
    </Modal>
  );
}
