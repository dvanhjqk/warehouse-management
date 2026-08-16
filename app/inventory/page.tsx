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
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-2xs">
              <Boxes className="w-6 h-6" />
            </div>
            <span>Quản lý Kho Hàng</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Theo dõi danh mục sản phẩm, mã SKU, giá bán và số lượng tồn kho khả dụng
          </p>
        </div>

        {/* Quick Inventory Metrics Summary */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="px-4 py-2 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-2 text-xs font-bold">
            <PackageCheck className="w-4 h-4 text-indigo-600" />
            <span className="text-slate-500 font-medium">Tổng tồn:</span>
            <span className="text-slate-900 tabular-nums">{totalStock} cái</span>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-2 text-xs font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="text-slate-500 font-medium">Sắp hết (&lt; 5):</span>
            <span className="text-amber-600 tabular-nums">{lowStockCount} loại</span>
          </div>

          {outOfStockCount > 0 && (
            <div className="px-4 py-2 rounded-2xl bg-rose-50 border border-rose-200 shadow-2xs flex items-center gap-2 text-xs font-extrabold text-rose-700">
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
