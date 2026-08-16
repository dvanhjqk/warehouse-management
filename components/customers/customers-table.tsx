"use client";

import React, { useState } from "react";
import { Customer, Order, OrderItem, Product } from "@prisma/client";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  History,
  Phone,
  MapPin,
  Users,
  ShoppingBag,
  AlertTriangle,
} from "lucide-react";
import { CustomerModal } from "./customer-modal";
import { CustomerHistoryModal } from "./customer-history-modal";
import { deleteCustomer } from "@/app/actions/customer-actions";

type CustomerWithOrders = Customer & {
  orders: (Order & {
    items: (OrderItem & {
      product: Product;
    })[];
  })[];
};

interface CustomersTableProps {
  initialCustomers: CustomerWithOrders[];
}

export function CustomersTable({ initialCustomers }: CustomersTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [historyCustomer, setHistoryCustomer] =
    useState<CustomerWithOrders | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Filter customers
  const filteredCustomers = initialCustomers.filter((customer) => {
    const term = searchTerm.toLowerCase();
    return (
      customer.name.toLowerCase().includes(term) ||
      customer.phone.includes(term) ||
      (customer.address && customer.address.toLowerCase().includes(term))
    );
  });

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa khách hàng "${name}"?`)) {
      setDeletingId(id);
      setDeleteError(null);
      const res = await deleteCustomer(id);
      if (!res.success) {
        setDeleteError(res.error || "Không thể xóa khách hàng.");
      }
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {deleteError && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{deleteError}</span>
          </div>
          <button
            onClick={() => setDeleteError(null)}
            className="text-rose-500 hover:text-rose-700 font-semibold underline"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo Tên khách, SĐT hoặc Địa chỉ..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <button
          onClick={() => {
            setEditingCustomer(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs shadow-blue-500/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm khách hàng</span>
        </button>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 text-slate-500 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-200/80">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Khách hàng</th>
                <th className="py-3.5 px-4">Số điện thoại</th>
                <th className="py-3.5 px-4">Địa chỉ</th>
                <th className="py-3.5 px-4 text-center">Số đơn đã đặt</th>
                <th className="py-3.5 px-4">Tổng chi tiêu (Đã giao)</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">
                      Không tìm thấy khách hàng nào
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Thử thay đổi từ khóa hoặc bấm &quot;Thêm khách hàng&quot;.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => {
                  const totalSpent = customer.orders
                    .filter((o) => o.status === "DELIVERED")
                    .reduce((sum, o) => sum + o.totalAmount, 0);

                  return (
                    <tr
                      key={customer.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Tên & Avatar */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {customer.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">
                              {customer.name}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              Tham gia: {formatDate(customer.createdAt)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Số điện thoại */}
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-800">
                        {customer.phone}
                      </td>

                      {/* Địa chỉ */}
                      <td className="py-3.5 px-4 max-w-xs truncate text-slate-600 text-xs">
                        {customer.address || (
                          <span className="text-slate-400 italic">Chưa có</span>
                        )}
                      </td>

                      {/* Số đơn */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
                          {customer.orders.length} đơn
                        </span>
                      </td>

                      {/* Tổng chi tiêu */}
                      <td className="py-3.5 px-4 font-bold text-emerald-600">
                        {formatCurrency(totalSpent)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setHistoryCustomer(customer)}
                            title="Xem lịch sử mua hàng"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <History className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setEditingCustomer(customer);
                              setIsModalOpen(true);
                            }}
                            title="Chỉnh sửa thông tin"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            disabled={deletingId === customer.id}
                            onClick={() =>
                              handleDelete(customer.id, customer.name)
                            }
                            title="Xóa khách hàng"
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
      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCustomer(null);
        }}
        customer={editingCustomer}
      />

      <CustomerHistoryModal
        isOpen={!!historyCustomer}
        onClose={() => setHistoryCustomer(null)}
        customer={historyCustomer}
      />
    </div>
  );
}
