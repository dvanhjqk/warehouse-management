"use client";

import React, { useState } from "react";
import { Order, Customer, OrderItem, Product } from "@prisma/client";
import { formatCurrency, formatDate } from "@/lib/utils";
import { OrderStatusSelect } from "./order-status-select";
import { OrderDetailModal } from "./order-detail-modal";
import { CreateOrderModal } from "./create-order-modal";
import { EditOrderModal } from "./edit-order-modal";
import { deleteOrder } from "@/app/actions/order-actions";
import {
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  AlertTriangle,
  ShoppingBag,
  User,
  Phone,
} from "lucide-react";

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
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeOrder, setActiveOrder] = useState<OrderWithRelations | null>(null);
  const [editingOrder, setEditingOrder] = useState<OrderWithRelations | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Status Tab Counts
  const counts = {
    ALL: initialOrders.length,
    PENDING: initialOrders.filter((o) => o.status === "PENDING").length,
    SHIPPING: initialOrders.filter((o) => o.status === "SHIPPING").length,
    DELIVERED: initialOrders.filter((o) => o.status === "DELIVERED").length,
    CANCELLED: initialOrders.filter((o) => o.status === "CANCELLED").length,
  };

  // Filter orders
  const filteredOrders = initialOrders.filter((order) => {
    const matchesStatus =
      selectedStatus === "ALL" || order.status === selectedStatus;

    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.phone.includes(searchTerm);

    return matchesStatus && matchesSearch;
  });

  const handleDelete = async (id: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa đơn hàng #${id.slice(-6)}?`)) {
      setDeletingId(id);
      setErrorMessage(null);
      const res = await deleteOrder(id);
      if (!res.success) {
        setErrorMessage(res.error || "Không thể xóa đơn hàng.");
      }
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Error alert message banner */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-rose-900">Không thể thực hiện:</p>
              <p className="mt-0.5 leading-relaxed">{errorMessage}</p>
            </div>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-xs font-bold text-rose-600 hover:text-rose-800 underline shrink-0"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Toolbar: Status tabs + Search + Create button */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { key: "ALL", label: "Tất cả", count: counts.ALL },
            { key: "PENDING", label: "Đang xử lý", count: counts.PENDING },
            { key: "SHIPPING", label: "Đang giao", count: counts.SHIPPING },
            { key: "DELIVERED", label: "Đã giao", count: counts.DELIVERED },
            { key: "CANCELLED", label: "Đã hủy", count: counts.CANCELLED },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedStatus(tab.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedStatus === tab.key
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  selectedStatus === tab.key
                    ? "bg-slate-700 text-white"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Action button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo Mã đơn, Tên khách hoặc SĐT..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs shadow-blue-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo đơn hàng mới</span>
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 text-slate-500 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-200/80">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Mã đơn</th>
                <th className="py-3.5 px-4">Khách hàng</th>
                <th className="py-3.5 px-4">Sản phẩm</th>
                <th className="py-3.5 px-4">Tổng tiền</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4">Ngày tạo</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <ShoppingBag className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">
                      Không có đơn hàng nào phù hợp
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Thử thay đổi bộ lọc trạng thái hoặc nhấn &quot;Tạo đơn hàng mới&quot;.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const itemCount = order.items.reduce(
                    (sum, i) => sum + i.quantity,
                    0
                  );
                  const isPending = order.status === "PENDING";

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Mã đơn */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <button
                          onClick={() => setActiveOrder(order)}
                          className="font-mono font-bold text-blue-600 hover:underline"
                        >
                          #{order.id.slice(-6).toUpperCase()}
                        </button>
                      </td>

                      {/* Khách hàng */}
                      <td className="py-3.5 px-4">
                        <div>
                          <p className="font-bold text-slate-900 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            {order.customer.name}
                          </p>
                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 font-mono">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {order.customer.phone}
                          </p>
                        </div>
                      </td>

                      {/* Sản phẩm */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-semibold">
                            {order.items.length} món ({itemCount} cái)
                          </span>
                        </div>
                      </td>

                      {/* Tổng tiền */}
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {formatCurrency(order.totalAmount)}
                      </td>

                      {/* Trạng thái dropdown tương tác */}
                      <td className="py-3.5 px-4">
                        <OrderStatusSelect
                          orderId={order.id}
                          currentStatus={order.status}
                          onError={(msg) => setErrorMessage(msg)}
                        />
                      </td>

                      {/* Ngày tạo */}
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {formatDate(order.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Nút sửa đơn khi đang PENDING */}
                          {isPending && (
                            <button
                              onClick={() => setEditingOrder(order)}
                              title="Chỉnh sửa đơn hàng (Thêm đồ, đổi số lượng)"
                              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => setActiveOrder(order)}
                            title="Xem chi tiết đơn hàng"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            disabled={deletingId === order.id}
                            onClick={() => handleDelete(order.id)}
                            title="Xóa đơn hàng"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-40"
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
      <OrderDetailModal
        isOpen={!!activeOrder}
        onClose={() => setActiveOrder(null)}
        order={activeOrder}
        onEdit={(orderToEdit) => {
          setActiveOrder(null);
          setEditingOrder(orderToEdit);
        }}
      />

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
    </div>
  );
}
