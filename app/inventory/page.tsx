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
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Boxes className="w-7 h-7 text-blue-600" />
            Quản lý Kho Hàng
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Theo dõi danh mục sản phẩm, mã SKU, giá bán và số lượng tồn kho khả dụng
          </p>
        </div>

        {/* Quick Inventory Metrics Summary */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-2 text-xs font-semibold">
            <PackageCheck className="w-4 h-4 text-blue-600" />
            <span className="text-slate-500">Tổng tồn:</span>
            <span className="text-slate-900 font-bold">{totalStock} cái</span>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-2 text-xs font-semibold">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="text-slate-500">Sắp hết (&lt; 5):</span>
            <span className="text-amber-600 font-bold">{lowStockCount} loại</span>
          </div>

          {outOfStockCount > 0 && (
            <div className="px-3.5 py-1.5 rounded-xl bg-rose-50 border border-rose-200 shadow-xs flex items-center gap-2 text-xs font-semibold text-rose-700">
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
