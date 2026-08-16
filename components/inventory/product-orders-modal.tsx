"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { OrderStatusBadge } from "@/components/ui/badge";
import { getProductOrders } from "@/app/actions/product-actions";
import { Product, Customer, Order, OrderItem } from "@prisma/client";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Users,
  ShoppingBag,
  Package,
  Phone,
  Loader2,
  Clock,
  CheckCircle2,
} from "lucide-react";

type ProductWithOrders = Product & {
  orderItems: (OrderItem & {
    order: Order & {
      customer: Customer;
    };
  })[];
};

interface ProductOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string | null;
  productName: string;
}

export function ProductOrdersModal({
  isOpen,
  onClose,
  productId,
  productName,
}: ProductOrdersModalProps) {
  const [data, setData] = useState<ProductWithOrders | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (productId && isOpen) {
      setLoading(true);
      getProductOrders(productId)
        .then((res) => {
          setData(res as ProductWithOrders | null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setData(null);
    }
  }, [productId, isOpen]);

  if (!isOpen) return null;

  // Tính toán số liệu thống kê sản phẩm
  const orderItems = data?.orderItems || [];

  const totalDeliveredQty = orderItems
    .filter((item) => item.order.status === "DELIVERED")
    .reduce((sum, item) => sum + item.quantity, 0);

  const totalPendingOrShippingQty = orderItems
    .filter(
      (item) =>
        item.order.status === "PENDING" || item.order.status === "SHIPPING"
    )
    .reduce((sum, item) => sum + item.quantity, 0);

  const totalDeliveredRevenue = orderItems
    .filter((item) => item.order.status === "DELIVERED")
    .reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Khách hàng đã đặt mặt hàng này"
      description={`Lịch sử đặt hàng chi tiết của: ${productName}`}
      maxWidth="3xl"
    >
      <div className="space-y-6">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            <p className="text-xs font-bold">Đang tải lịch sử đặt hàng...</p>
          </div>
        ) : (
          <>
            {/* Thống kê nhanh về mặt hàng */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-3xl bg-emerald-50/90 border border-emerald-200/80 shadow-2xs">
                <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Đã bán thành công:</span>
                </div>
                <p className="text-2xl font-extrabold text-emerald-700 mt-1 tabular-nums">
                  {totalDeliveredQty} cái
                </p>
                <p className="text-[11px] text-emerald-600/90 mt-0.5 font-medium">
                  Doanh thu: {formatCurrency(totalDeliveredRevenue)}
                </p>
              </div>

              <div className="p-4 rounded-3xl bg-amber-50/90 border border-amber-200/80 shadow-2xs">
                <div className="flex items-center gap-2 text-amber-700 text-xs font-bold">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Đang xử lý / Giao hàng:</span>
                </div>
                <p className="text-2xl font-extrabold text-amber-700 mt-1 tabular-nums">
                  {totalPendingOrShippingQty} cái
                </p>
                <p className="text-[11px] text-amber-600/90 mt-0.5 font-medium">
                  Chờ hoàn tất giao hàng
                </p>
              </div>

              <div className="p-4 rounded-3xl bg-indigo-50/90 border border-indigo-200/80 shadow-2xs">
                <div className="flex items-center gap-2 text-indigo-700 text-xs font-bold">
                  <Package className="w-4 h-4 text-indigo-600" />
                  <span>Tồn kho hiện tại:</span>
                </div>
                <p className="text-2xl font-extrabold text-indigo-700 mt-1 tabular-nums">
                  {data?.stock ?? 0} cái
                </p>
                <p className="text-[11px] text-indigo-600/90 mt-0.5 font-medium">
                  Giá bán: {data ? formatCurrency(data.price) : "--"}
                </p>
              </div>
            </div>

            {/* Bảng danh sách khách hàng đã đặt */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-600" />
                Danh sách khách hàng ({orderItems.length} lượt đặt)
              </h4>

              {orderItems.length === 0 ? (
                <div className="p-12 text-center bg-slate-50/80 rounded-3xl border border-dashed border-slate-200 text-slate-400">
                  <ShoppingBag className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p className="text-xs font-bold text-slate-700">
                    Chưa có khách hàng nào đặt mặt hàng này
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                    Khi khách đặt đơn có chứa sản phẩm này, danh sách sẽ hiển thị tại đây.
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                  <div className="max-h-[340px] overflow-y-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-slate-50/90 text-slate-500 font-bold text-[11px] uppercase tracking-wider sticky top-0 border-b border-slate-200 z-10">
                        <tr>
                          <th className="py-3 px-4">Khách hàng</th>
                          <th className="py-3 px-4">Mã đơn</th>
                          <th className="py-3 px-3 text-center">SL mua</th>
                          <th className="py-3 px-4">Thành tiền</th>
                          <th className="py-3 px-4">Trạng thái đơn</th>
                          <th className="py-3 px-4 text-right">Ngày đặt</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {orderItems.map((item) => (
                          <tr
                            key={item.id}
                            className="hover:bg-slate-50/70 transition-colors"
                          >
                            {/* Khách hàng */}
                            <td className="py-3.5 px-4">
                              <span className="font-bold text-slate-900 block">
                                {item.order.customer.name}
                              </span>
                              <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono mt-0.5">
                                <Phone className="w-3 h-3 text-slate-400" />
                                {item.order.customer.phone}
                              </span>
                            </td>

                            {/* Mã đơn */}
                            <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 text-xs">
                              #{item.order.id.slice(-6).toUpperCase()}
                            </td>

                            {/* Số lượng */}
                            <td className="py-3.5 px-3 text-center font-extrabold text-slate-900">
                              x{item.quantity}
                            </td>

                            {/* Thành tiền */}
                            <td className="py-3.5 px-4 font-bold text-slate-900 tabular-nums">
                              {formatCurrency(item.price * item.quantity)}
                            </td>

                            {/* Trạng thái đơn */}
                            <td className="py-3.5 px-4">
                              <OrderStatusBadge
                                status={item.order.status}
                                showIcon={false}
                              />
                            </td>

                            {/* Ngày đặt */}
                            <td className="py-3.5 px-4 text-right text-xs text-slate-500 tabular-nums">
                              {formatDate(item.order.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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
          </>
        )}
      </div>
    </Modal>
  );
}
