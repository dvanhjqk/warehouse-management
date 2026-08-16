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
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#191716] tracking-tight flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FAF2EE] text-[#CC785C] border border-[#F5E4DB]">
              <Users className="w-5 h-5" />
            </div>
            <span>Danh Bạ Khách Hàng</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#78716C] mt-1">
            Quản lý thông tin liên hệ, địa chỉ giao hàng và lịch sử các đơn hàng đã đặt
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-white border border-[#E8E4DC] shadow-claude-xs flex items-center gap-2 text-xs font-semibold">
            <UserCheck className="w-4 h-4 text-[#CC785C]" />
            <span className="text-[#78716C]">Tổng khách hàng:</span>
            <span className="text-[#191716] font-bold tabular-nums">{customers.length} người</span>
          </div>
        </div>
      </div>

      {/* Customers Table Component */}
      <CustomersTable initialCustomers={customers} />
    </div>
  );
}
