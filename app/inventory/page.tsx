import React from "react";
import { getProducts } from "@/app/actions/product-actions";
import { InventoryTable } from "@/components/inventory/inventory-table";
import { Boxes, PackageCheck, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const products = await getProducts();

  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const lowStockCount = products.filter((p) => p.stock < 5).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  return (
    <div className="space-y-6">
      {/* Header Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#191716] tracking-tight flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FAF2EE] text-[#CC785C] border border-[#F5E4DB]">
              <Boxes className="w-5 h-5" />
            </div>
            <span>Quản lý Kho Hàng</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#78716C] mt-1">
            Theo dõi danh mục sản phẩm, mã SKU, giá bán và số lượng tồn kho khả dụng
          </p>
        </div>

        {/* Quick Inventory Metrics Summary */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          <div className="px-3.5 py-1.5 rounded-xl bg-white border border-[#E8E4DC] shadow-claude-xs flex items-center gap-2 text-xs font-semibold">
            <PackageCheck className="w-4 h-4 text-[#CC785C]" />
            <span className="text-[#78716C]">Tổng tồn:</span>
            <span className="text-[#191716] font-bold tabular-nums">{totalStock} cái</span>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-white border border-[#E8E4DC] shadow-claude-xs flex items-center gap-2 text-xs font-semibold">
            <AlertTriangle className="w-4 h-4 text-[#B45309]" />
            <span className="text-[#78716C]">Sắp hết (&lt; 5):</span>
            <span className="text-[#B45309] font-bold tabular-nums">{lowStockCount} loại</span>
          </div>

          {outOfStockCount > 0 && (
            <div className="px-3.5 py-1.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] shadow-claude-xs flex items-center gap-2 text-xs font-bold text-[#B91C1C]">
              <span>Hết hàng: {outOfStockCount} loại</span>
            </div>
          )}
        </div>
      </div>

      {/* Inventory Table Component */}
      <InventoryTable initialProducts={products} />
    </div>
  );
}
