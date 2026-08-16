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
  AlertTriangle,
  X,
  Crown,
  Sparkles,
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
    <div className="space-y-4 animate-in fade-in duration-200">
      {deleteError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
            <span className="font-semibold">{deleteError}</span>
          </div>
          <button
            onClick={() => setDeleteError(null)}
            className="text-rose-600 hover:text-rose-800 font-bold underline"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="bento-card p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo Tên khách, SĐT hoặc Địa chỉ..."
            className="w-full pl-9 pr-9 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          onClick={() => {
            setEditingCustomer(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm khách hàng</span>
        </button>
      </div>

      {/* Customers Table */}
      <div className="bento-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/90 text-slate-500 text-[11px] uppercase tracking-wider font-bold border-b border-slate-100">
              <tr>
                <th className="py-4 px-4 sm:px-6">Khách hàng</th>
                <th className="py-4 px-4">Số điện thoại</th>
                <th className="py-4 px-4">Địa chỉ</th>
                <th className="py-4 px-4 text-center">Số đơn đã đặt</th>
                <th className="py-4 px-4">Tổng chi tiêu (Đã giao)</th>
                <th className="py-4 px-4 sm:px-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">
                    <Users className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                    <p className="font-bold text-slate-700 text-sm">
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

                  const isVip = totalSpent >= 5000000;
                  const isLoyal = totalSpent >= 1000000 && !isVip;

                  return (
                    <tr
                      key={customer.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Tên & Avatar */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center font-extrabold text-sm shrink-0 shadow-sm shadow-indigo-500/20 ring-1 ring-white/20">
                            {customer.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 block group-hover:text-indigo-600 transition-colors">
                                {customer.name}
                              </span>
                              {isVip && (
                                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200">
                                  <Crown className="w-3 h-3 text-amber-500" />
                                  <span>VIP</span>
                                </span>
                              )}
                              {isLoyal && (
                                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                  <Sparkles className="w-3 h-3 text-indigo-500" />
                                  <span>Thân thiết</span>
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400 tabular-nums">
                              Tham gia: {formatDate(customer.createdAt)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Số điện thoại */}
                      <td className="py-4 px-4 font-mono font-bold text-slate-800">
                        {customer.phone}
                      </td>

                      {/* Địa chỉ */}
                      <td className="py-4 px-4 max-w-xs truncate text-slate-600 text-xs">
                        {customer.address || (
                          <span className="text-slate-400 italic">Chưa có thông tin</span>
                        )}
                      </td>

                      {/* Số đơn */}
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-slate-100 text-slate-800 border border-slate-200/60 tabular-nums">
                          {customer.orders.length} đơn
                        </span>
                      </td>

                      {/* Tổng chi tiêu */}
                      <td className="py-4 px-4 font-extrabold text-emerald-600 tabular-nums">
                        {formatCurrency(totalSpent)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setHistoryCustomer(customer)}
                            title="Xem lịch sử mua hàng"
                            className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all"
                          >
                            <History className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setEditingCustomer(customer);
                              setIsModalOpen(true);
                            }}
                            title="Chỉnh sửa thông tin"
                            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            disabled={deletingId === customer.id}
                            onClick={() =>
                              handleDelete(customer.id, customer.name)
                            }
                            title="Xóa khách hàng"
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all disabled:opacity-40"
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
