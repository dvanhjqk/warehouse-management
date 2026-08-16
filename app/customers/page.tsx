import React from "react";
import { getCustomers } from "@/app/actions/customer-actions";
import { CustomersTable } from "@/components/customers/customers-table";
import { Users, UserCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const customers = await getCustomers();

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-7 h-7 text-blue-600" />
            Danh Bạ Khách Hàng
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Quản lý thông tin liên hệ, địa chỉ giao hàng và lịch sử các đơn hàng đã đặt
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-2 text-xs font-semibold">
            <UserCheck className="w-4 h-4 text-blue-600" />
            <span className="text-slate-500">Tổng khách hàng:</span>
            <span className="text-slate-900 font-bold">{customers.length} người</span>
          </div>
        </div>
      </div>

      {/* Customers Table Component */}
      <CustomersTable initialCustomers={customers} />
    </div>
  );
}
