"use client";

import React, { useState } from "react";
import { Order, Customer, OrderItem, Product, OrderStatus } from "@prisma/client";
import { formatCurrency, formatDate } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Eye,
  Trash2,
  AlertCircle,
  ShoppingBag,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  Edit2,
  X,
} from "lucide-react";
import { CreateOrderModal } from "./create-order-modal";
import { EditOrderModal } from "./edit-order-modal";
import { OrderDetailModal } from "./order-detail-modal";
import {
  updateOrderStatus,
  deleteOrder,
} from "@/app/actions/order-actions";

type OrderWithRelations = Order & {
  customer: Customer;
  items: (OrderItem & {
    product: Product;
  })[];
};

interface OrdersTableProps {
  initialOrders: OrderWithRelations[];
  products: Product[];
  customers: Customer[];
}

export function OrdersTable({
  initialOrders,
  products,
  customers,
}: OrdersTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<OrderWithRelations | null>(
    null
  );
  const [viewingOrder, setViewingOrder] = useState<OrderWithRelations | null>(
    null
  );
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Lọc đơn hàng theo từ khóa và trạng thái
  const filteredOrders = initialOrders.filter((order) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      order.id.toLowerCase().includes(term) ||
      order.customer.name.toLowerCase().includes(term) ||
      order.customer.phone.includes(term) ||
      order.items.some(
        (item) =>
          item.product.name.toLowerCase().includes(term) ||
          (item.product.sku && item.product.sku.toLowerCase().includes(term))
      );

    const matchesStatus =
      statusFilter === "ALL" ? true : order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Cập nhật trạng thái đơn hàng (Tự động trừ/cộng kho nếu chuyển sang/rời DELIVERED)
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    setErrorMessage(null);

    const res = await updateOrderStatus(orderId, newStatus);
    if (!res.success) {
      setErrorMessage(res.error || "Không thể cập nhật trạng thái.");
    }
    setUpdatingId(null);
  };

  // Xóa đơn hàng
  const handleDelete = async (id: string) => {
    if (
      confirm(
        `Bạn có chắc chắn muốn xóa đơn hàng #${id.slice(-6).toUpperCase()}?`
      )
    ) {
      setDeletingId(id);
      setErrorMessage(null);
      const res = await deleteOrder(id);
      if (!res.success) {
        setErrorMessage(res.error || "Không thể xóa đơn hàng.");
      }
      setDeletingId(null);
    }
  };

  const statusTabs = [
    { key: "ALL", label: "Tất cả", count: initialOrders.length },
    {
      key: "PENDING",
      label: "Chờ xử lý",
      count: initialOrders.filter((o) => o.status === "PENDING").length,
      icon: Clock,
      activeClass: "text-[#B45309] border-[#B45309]",
    },
    {
      key: "SHIPPING",
      label: "Đang giao",
      count: initialOrders.filter((o) => o.status === "SHIPPING").length,
      icon: Truck,
      activeClass: "text-[#2563EB] border-[#2563EB]",
    },
    {
      key: "DELIVERED",
      label: "Đã giao",
      count: initialOrders.filter((o) => o.status === "DELIVERED").length,
      icon: CheckCircle2,
      activeClass: "text-[#15803D] border-[#15803D]",
    },
    {
      key: "CANCELLED",
      label: "Đã hủy",
      count: initialOrders.filter((o) => o.status === "CANCELLED").length,
      icon: XCircle,
      activeClass: "text-[#B91C1C] border-[#B91C1C]",
    },
  ];

  return (
    <div className="space-y-4">
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C] text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-[#B91C1C] hover:text-[#991B1B] font-bold underline"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Tabs & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-[#E8E4DC] space-y-3 shadow-claude-xs">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#F5F2EB]">
          {statusTabs.map((tab) => {
            const isActive = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? "bg-[#FAF2EE] text-[#9B5038] border border-[#F5E4DB]"
                    : "text-[#78716C] hover:text-[#191716] hover:bg-[#FAF8F5]"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive
                      ? "bg-[#CC785C] text-white"
                      : "bg-[#F5F2EB] text-[#78716C]"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Add button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#A8A296] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo Mã đơn, Tên khách, SĐT hoặc Tên sản phẩm..."
              className="w-full pl-9 pr-9 py-2 rounded-xl border border-[#E8E4DC] text-xs sm:text-sm bg-[#FAF8F5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#CC785C]/20 focus:border-[#CC785C] transition-all font-medium"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8A296] hover:text-[#57534E] p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#CC785C] hover:bg-[#BA664A] text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo đơn hàng mới</span>
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl bg-white border border-[#E8E4DC] overflow-hidden shadow-claude-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#FAF8F5] text-[#78716C] font-semibold text-[11px] uppercase tracking-wider border-b border-[#E8E4DC]">
              <tr>
                <th className="py-3 px-4 sm:px-6">Mã đơn</th>
                <th className="py-3 px-4">Khách hàng</th>
                <th className="py-3 px-4">Sản phẩm đặt</th>
                <th className="py-3 px-4">Tổng tiền</th>
                <th className="py-3 px-4">Trạng thái (Đổi nhanh)</th>
                <th className="py-3 px-4 sm:px-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F2EB] font-medium text-[#191716]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-[#78716C]">
                    <ShoppingBag className="w-10 h-10 mx-auto text-[#D6D1C7] mb-2" />
                    <p className="font-bold text-[#191716] text-sm">
                      Không tìm thấy đơn hàng nào
                    </p>
                    <p className="text-xs text-[#78716C] mt-1">
                      Thử thay đổi bộ lọc hoặc bấm nút &quot;Tạo đơn hàng mới&quot;.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const totalItems = order.items.reduce(
                    (sum, item) => sum + item.quantity,
                    0
                  );
                  const isPending = order.status === "PENDING";

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-[#FAF8F5] transition-colors group"
                    >
                      {/* Mã đơn */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <span className="font-mono font-bold text-xs text-[#CC785C] block">
                          #{order.id.slice(-6).toUpperCase()}
                        </span>
                        <span className="text-[11px] text-[#78716C] tabular-nums">
                          {formatDate(order.createdAt)}
                        </span>
                      </td>

                      {/* Khách hàng */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-[#191716] block group-hover:text-[#CC785C] transition-colors">
                          {order.customer.name}
                        </span>
                        <span className="text-xs text-[#78716C] font-mono">
                          {order.customer.phone}
                        </span>
                      </td>

                      {/* Sản phẩm đặt */}
                      <td className="py-3.5 px-4">
                        <div className="text-xs text-[#44403C] space-y-0.5">
                          <span className="font-semibold text-[#191716]">
                            {order.items.length} loại ({totalItems} cái)
                          </span>
                          <p className="text-[11px] text-[#78716C] max-w-[200px] truncate">
                            {order.items
                              .map(
                                (i) => `${i.product.name} (x${i.quantity})`
                              )
                              .join(", ")}
                          </p>
                        </div>
                      </td>

                      {/* Tổng tiền */}
                      <td className="py-3.5 px-4 font-bold text-[#191716] tabular-nums">
                        {formatCurrency(order.totalAmount)}
                      </td>

                      {/* Trạng thái đơn với Select cập nhật ngay */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <select
                            disabled={updatingId === order.id}
                            value={order.status}
                            onChange={(e) =>
                              handleStatusChange(
                                order.id,
                                e.target.value as OrderStatus
                              )
                            }
                            className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-colors cursor-pointer focus:outline-none ${
                              order.status === "PENDING"
                                ? "bg-[#FEF8EC] text-[#92400E] border-[#FDE68A]"
                                : order.status === "SHIPPING"
                                ? "bg-[#F0F7FF] text-[#1E40AF] border-[#BFDBFE]"
                                : order.status === "DELIVERED"
                                ? "bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]"
                                : "bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]"
                            }`}
                          >
                            <option value="PENDING">Chờ xử lý (PENDING)</option>
                            <option value="SHIPPING">Đang giao (SHIPPING)</option>
                            <option value="DELIVERED">
                              Đã giao - Trừ kho (DELIVERED)
                            </option>
                            <option value="CANCELLED">
                              Đã hủy (CANCELLED)
                            </option>
                          </select>
                        </div>
                      </td>

                      {/* Thao tác */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Chỉnh sửa đơn khi còn PENDING */}
                          {isPending && (
                            <button
                              onClick={() => setEditingOrder(order)}
                              title="Chỉnh sửa mặt hàng / khách hàng"
                              className="p-1.5 rounded-lg text-[#78716C] hover:text-[#CC785C] hover:bg-[#FAF2EE] transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}

                          {/* Xem chi tiết */}
                          <button
                            onClick={() => setViewingOrder(order)}
                            title="Xem chi tiết đơn hàng"
                            className="p-1.5 rounded-lg text-[#78716C] hover:text-[#191716] hover:bg-[#F5F2EB] transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Xóa đơn hàng */}
                          <button
                            disabled={deletingId === order.id}
                            onClick={() => handleDelete(order.id)}
                            title="Xóa đơn hàng"
                            className="p-1.5 rounded-lg text-[#A8A296] hover:text-[#B91C1C] hover:bg-[#FEF2F2] transition-colors disabled:opacity-40"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <CreateOrderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        products={products}
        customers={customers}
      />

      <EditOrderModal
        isOpen={!!editingOrder}
        onClose={() => setEditingOrder(null)}
        order={editingOrder}
        products={products}
        customers={customers}
      />

      <OrderDetailModal
        isOpen={!!viewingOrder}
        onClose={() => setViewingOrder(null)}
        order={viewingOrder}
        onEdit={(order) => {
          setViewingOrder(null);
          setEditingOrder(order);
        }}
      />
    </div>
  );
}
