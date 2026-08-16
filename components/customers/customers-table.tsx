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
    <div className="space-y-4">
      {deleteError && (
        <div className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C] text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#DC2626] shrink-0" />
            <span className="font-semibold">{deleteError}</span>
          </div>
          <button
            onClick={() => setDeleteError(null)}
            className="text-[#B91C1C] hover:text-[#991B1B] font-bold underline"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-[#E8E4DC] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-claude-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#A8A296] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo Tên khách, SĐT hoặc Địa chỉ..."
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
          onClick={() => {
            setEditingCustomer(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#CC785C] hover:bg-[#BA664A] text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm khách hàng</span>
        </button>
      </div>

      {/* Customers Table */}
      <div className="rounded-2xl bg-white border border-[#E8E4DC] overflow-hidden shadow-claude-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#FAF8F5] text-[#78716C] text-[11px] uppercase tracking-wider font-semibold border-b border-[#E8E4DC]">
              <tr>
                <th className="py-3 px-4 sm:px-6">Khách hàng</th>
                <th className="py-3 px-4">Số điện thoại</th>
                <th className="py-3 px-4">Địa chỉ</th>
                <th className="py-3 px-4 text-center">Số đơn đã đặt</th>
                <th className="py-3 px-4">Tổng chi tiêu (Đã giao)</th>
                <th className="py-3 px-4 sm:px-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F2EB] font-medium text-[#191716]">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-[#78716C]">
                    <Users className="w-10 h-10 mx-auto text-[#D6D1C7] mb-2" />
                    <p className="font-bold text-[#191716] text-sm">
                      Không tìm thấy khách hàng nào
                    </p>
                    <p className="text-xs text-[#78716C] mt-1">
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
                      className="hover:bg-[#FAF8F5] transition-colors group"
                    >
                      {/* Tên & Avatar */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#FAF2EE] text-[#CC785C] border border-[#F5E4DB] flex items-center justify-center font-bold text-xs shrink-0">
                            {customer.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-[#191716] block group-hover:text-[#CC785C] transition-colors">
                                {customer.name}
                              </span>
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
                            <span className="text-[11px] text-[#78716C] tabular-nums">
                              Tham gia: {formatDate(customer.createdAt)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Số điện thoại */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-[#191716]">
                        {customer.phone}
                      </td>

                      {/* Địa chỉ */}
                      <td className="py-3.5 px-4 max-w-xs truncate text-[#57534E] text-xs">
                        {customer.address || (
                          <span className="text-[#A8A296] italic">Chưa có thông tin</span>
                        )}
                      </td>

                      {/* Số đơn */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F5F2EB] text-[#44403C] tabular-nums">
                          {customer.orders.length} đơn
                        </span>
                      </td>

                      {/* Tổng chi tiêu */}
                      <td className="py-3.5 px-4 font-bold text-emerald-700 tabular-nums">
                        {formatCurrency(totalSpent)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setHistoryCustomer(customer)}
                            title="Xem lịch sử mua hàng"
                            className="p-1.5 rounded-lg text-[#78716C] hover:text-[#CC785C] hover:bg-[#FAF2EE] transition-colors"
                          >
                            <History className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setEditingCustomer(customer);
                              setIsModalOpen(true);
                            }}
                            title="Chỉnh sửa thông tin"
                            className="p-1.5 rounded-lg text-[#78716C] hover:text-[#191716] hover:bg-[#F5F2EB] transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            disabled={deletingId === customer.id}
                            onClick={() =>
                              handleDelete(customer.id, customer.name)
                            }
                            title="Xóa khách hàng"
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
