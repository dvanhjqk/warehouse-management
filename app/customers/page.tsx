import React from "react";
import { getCustomers } from "@/app/actions/customer-actions";
import { CustomersTable } from "@/components/customers/customers-table";
import { Users, UserCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const customers = await getCustomers();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-2xs">
              <Users className="w-6 h-6" />
            </div>
            <span>Danh Bạ Khách Hàng</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Quản lý thông tin liên hệ, địa chỉ giao hàng và lịch sử các đơn hàng đã đặt
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-2 text-xs font-bold">
            <UserCheck className="w-4 h-4 text-indigo-600" />
            <span className="text-slate-500 font-medium">Tổng khách hàng:</span>
            <span className="text-slate-900 tabular-nums">{customers.length} người</span>
          </div>
        </div>
      </div>

      {/* Customers Table Component */}
      <CustomersTable initialCustomers={customers} />
    </div>
  );
}
