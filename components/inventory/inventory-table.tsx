"use client";

import React, { useState } from "react";
import { Product } from "@prisma/client";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Search,
  Plus,
  Edit2,
  Sliders,
  Trash2,
  AlertTriangle,
  Package,
  Layers,
  Users,
} from "lucide-react";
import { ProductModal } from "./product-modal";
import { StockModal } from "./stock-modal";
import { ProductOrdersModal } from "./product-orders-modal";
import { deleteProduct } from "@/app/actions/product-actions";

type ProductWithCount = Product & {
  _count?: {
    orderItems: number;
  };
};

interface InventoryTableProps {
  initialProducts: ProductWithCount[];
}

export function InventoryTable({ initialProducts }: InventoryTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [lowStockFilter, setLowStockFilter] = useState(false);

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [stockProduct, setStockProduct] = useState<Product | null>(null);
  const [viewOrdersProduct, setViewOrdersProduct] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Filtered products list
  const filteredProducts = initialProducts.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesLowStock = lowStockFilter ? product.stock < 5 : true;

    return matchesSearch && matchesLowStock;
  });

  const lowStockTotal = initialProducts.filter((p) => p.stock < 5).length;

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${name}"?`)) {
      setDeletingId(id);
      setDeleteError(null);
      const res = await deleteProduct(id);
      if (!res.success) {
        setDeleteError(res.error || "Không thể xóa sản phẩm.");
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

      {/* Toolbar & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên sản phẩm hoặc mã SKU..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Filter & Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setLowStockFilter(!lowStockFilter)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              lowStockFilter
                ? "bg-amber-500 text-white border-amber-500 shadow-xs shadow-amber-500/20"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Sắp hết kho ({lowStockTotal})</span>
          </button>

          <button
            onClick={() => {
              setEditingProduct(null);
              setIsProductModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs shadow-blue-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm sản phẩm</span>
          </button>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 text-slate-500 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-200/80">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Sản phẩm</th>
                <th className="py-3.5 px-4">Mã SKU</th>
                <th className="py-3.5 px-4">Giá bán</th>
                <th className="py-3.5 px-4">Tồn kho</th>
                <th className="py-3.5 px-4">Ngày tạo</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Package className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">
                      Không tìm thấy sản phẩm nào
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Thử thay đổi từ khóa tìm kiếm hoặc nhấn &quot;Thêm sản phẩm&quot; để tạo mới.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const isLowStock = product.stock < 5;
                  const isOutOfStock = product.stock === 0;
                  const orderCount = product._count?.orderItems ?? 0;

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                            <Layers className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">
                              {product.name}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                              {product.sku && (
                                <span className="text-[11px] text-slate-400 font-mono sm:hidden">
                                  {product.sku}
                                </span>
                              )}
                              {orderCount > 0 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setViewOrdersProduct({
                                      id: product.id,
                                      name: product.name,
                                    })
                                  }
                                  className="text-[10px] font-semibold text-indigo-600 hover:underline flex items-center gap-0.5"
                                >
                                  <Users className="w-3 h-3" />
                                  <span>{orderCount} lượt khách đặt</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {product.sku ? (
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-xs font-semibold">
                            {product.sku}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">--</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              isOutOfStock
                                ? "bg-rose-100 text-rose-700 border border-rose-200"
                                : isLowStock
                                ? "bg-amber-100 text-amber-800 border border-amber-200"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            }`}
                          >
                            {isOutOfStock
                              ? "Hết hàng (0)"
                              : `${product.stock} cái`}
                          </span>
                          {isLowStock && !isOutOfStock && (
                            <span className="text-[10px] text-amber-600 font-semibold hidden md:inline">
                              (Sắp hết)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {formatDate(product.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Nút xem danh sách khách đã đặt mặt hàng này */}
                          <button
                            onClick={() =>
                              setViewOrdersProduct({
                                id: product.id,
                                name: product.name,
                              })
                            }
                            title="Xem những ai đã đặt mặt hàng này"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          >
                            <Users className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setStockProduct(product)}
                            title="Điều chỉnh kho / giá"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Sliders className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setEditingProduct(product);
                              setIsProductModalOpen(true);
                            }}
                            title="Chỉnh sửa sản phẩm"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            disabled={deletingId === product.id}
                            onClick={() => handleDelete(product.id, product.name)}
                            title="Xóa sản phẩm"
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
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        product={editingProduct}
      />

      <StockModal
        isOpen={!!stockProduct}
        onClose={() => setStockProduct(null)}
        product={stockProduct}
      />

      <ProductOrdersModal
        isOpen={!!viewOrdersProduct}
        onClose={() => setViewOrdersProduct(null)}
        productId={viewOrdersProduct?.id || null}
        productName={viewOrdersProduct?.name || ""}
      />
    </div>
  );
}
