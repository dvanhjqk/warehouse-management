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
      <div className="space-y-5">
        {loading ? (
          <div className="py-14 flex flex-col items-center justify-center gap-2 text-[#78716C]">
            <Loader2 className="w-6 h-6 animate-spin text-[#CC785C]" />
            <p className="text-xs font-semibold">Đang tải lịch sử đặt hàng...</p>
          </div>
        ) : (
          <>
            {/* Thống kê nhanh về mặt hàng */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0]">
                <div className="flex items-center gap-1.5 text-[#166534] text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                  <span>Đã bán thành công:</span>
                </div>
                <p className="font-serif text-xl font-bold text-[#166534] mt-1 tabular-nums">
                  {totalDeliveredQty} cái
                </p>
                <p className="text-[11px] text-[#15803D] mt-0.5">
                  Doanh thu: {formatCurrency(totalDeliveredRevenue)}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FEF8EC] border border-[#FDE68A]">
                <div className="flex items-center gap-1.5 text-[#92400E] text-xs font-semibold">
                  <Clock className="w-4 h-4 text-[#B45309]" />
                  <span>Đang xử lý / Giao:</span>
                </div>
                <p className="font-serif text-xl font-bold text-[#92400E] mt-1 tabular-nums">
                  {totalPendingOrShippingQty} cái
                </p>
                <p className="text-[11px] text-[#B45309] mt-0.5">
                  Chờ hoàn tất giao hàng
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FAF2EE] border border-[#F5E4DB]">
                <div className="flex items-center gap-1.5 text-[#9B5038] text-xs font-semibold">
                  <Package className="w-4 h-4 text-[#CC785C]" />
                  <span>Tồn kho hiện tại:</span>
                </div>
                <p className="font-serif text-xl font-bold text-[#9B5038] mt-1 tabular-nums">
                  {data?.stock ?? 0} cái
                </p>
                <p className="text-[11px] text-[#CC785C] mt-0.5">
                  Giá bán: {data ? formatCurrency(data.price) : "--"}
                </p>
              </div>
            </div>

            {/* Bảng danh sách khách hàng đã đặt */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#44403C] mb-2 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#CC785C]" />
                Danh sách khách hàng ({orderItems.length} lượt đặt)
              </h4>

              {orderItems.length === 0 ? (
                <div className="p-8 text-center bg-[#FAF8F5] rounded-xl border border-dashed border-[#E8E4DC] text-[#78716C]">
                  <ShoppingBag className="w-8 h-8 mx-auto text-[#A8A296] mb-1" />
                  <p className="text-xs font-semibold text-[#191716]">
                    Chưa có khách hàng nào đặt mặt hàng này
                  </p>
                  <p className="text-[11px] text-[#78716C] mt-0.5">
                    Khi khách đặt đơn có chứa sản phẩm này, danh sách sẽ hiển thị tại đây.
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-[#E8E4DC] overflow-hidden">
                  <div className="max-h-[300px] overflow-y-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-[#FAF8F5] text-[#78716C] font-semibold text-[11px] uppercase tracking-wider sticky top-0 border-b border-[#E8E4DC] z-10">
                        <tr>
                          <th className="py-2.5 px-3">Khách hàng</th>
                          <th className="py-2.5 px-3">Mã đơn</th>
                          <th className="py-2.5 px-2 text-center">SL</th>
                          <th className="py-2.5 px-3">Thành tiền</th>
                          <th className="py-2.5 px-3">Trạng thái</th>
                          <th className="py-2.5 px-3 text-right">Ngày đặt</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F5F2EB] font-medium text-[#191716]">
                        {orderItems.map((item) => (
                          <tr
                            key={item.id}
                            className="hover:bg-[#FAF8F5] transition-colors"
                          >
                            {/* Khách hàng */}
                            <td className="py-2.5 px-3">
                              <span className="font-semibold text-[#191716] block">
                                {item.order.customer.name}
                              </span>
                              <span className="text-[11px] text-[#78716C] flex items-center gap-1 font-mono">
                                <Phone className="w-3 h-3 text-[#A8A296]" />
                                {item.order.customer.phone}
                              </span>
                            </td>

                            {/* Mã đơn */}
                            <td className="py-2.5 px-3 font-mono font-bold text-[#CC785C] text-xs">
                              #{item.order.id.slice(-6).toUpperCase()}
                            </td>

                            {/* Số lượng */}
                            <td className="py-2.5 px-2 text-center font-bold text-[#191716]">
                              x{item.quantity}
                            </td>

                            {/* Thành tiền */}
                            <td className="py-2.5 px-3 font-bold text-[#191716] tabular-nums">
                              {formatCurrency(item.price * item.quantity)}
                            </td>

                            {/* Trạng thái đơn */}
                            <td className="py-2.5 px-3">
                              <OrderStatusBadge
                                status={item.order.status}
                                showIcon={false}
                              />
                            </td>

                            {/* Ngày đặt */}
                            <td className="py-2.5 px-3 text-right text-xs text-[#78716C] tabular-nums">
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
            <div className="flex justify-end pt-2 border-t border-[#F5F2EB]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#191716] hover:bg-[#292524] text-white text-xs font-semibold shadow-xs"
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
