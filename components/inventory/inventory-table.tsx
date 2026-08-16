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
  X,
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

      {/* Toolbar & Filter Bar */}
      <div className="bento-card p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search input with Clear Icon */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên sản phẩm hoặc mã SKU..."
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

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setLowStockFilter(!lowStockFilter)}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all ${
              lowStockFilter
                ? "bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
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
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm sản phẩm</span>
          </button>
        </div>
      </div>

      {/* Product Table */}
      <div className="bento-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/90 text-slate-500 text-[11px] uppercase tracking-wider font-bold border-b border-slate-100">
              <tr>
                <th className="py-4 px-4 sm:px-6">Sản phẩm</th>
                <th className="py-4 px-4">Mã SKU</th>
                <th className="py-4 px-4">Giá bán</th>
                <th className="py-4 px-4">Tình trạng tồn kho</th>
                <th className="py-4 px-4">Ngày tạo</th>
                <th className="py-4 px-4 sm:px-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">
                    <Package className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                    <p className="font-bold text-slate-700 text-sm">
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
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3.5">
                          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100/80 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                            <Layers className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block group-hover:text-indigo-600 transition-colors">
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
                                  className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-indigo-100/80 transition-colors"
                                >
                                  <Users className="w-3 h-3" />
                                  <span>{orderCount} lượt đặt</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-mono text-slate-600">
                        {product.sku ? (
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200/60">
                            {product.sku}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs font-semibold">--</span>
                        )}
                      </td>
                      <td className="py-4 px-4 font-extrabold text-slate-900 tabular-nums">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold border ${
                              isOutOfStock
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : isLowStock
                                ? "bg-amber-50 text-amber-800 border-amber-200"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}
                          >
                            {isOutOfStock
                              ? "Hết hàng (0)"
                              : `${product.stock} cái`}
                          </span>
                          {isLowStock && !isOutOfStock && (
                            <span className="text-[10px] text-amber-600 font-bold hidden md:inline">
                              (Sắp hết)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-500 tabular-nums">
                        {formatDate(product.createdAt)}
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Nút xem danh sách khách đã đặt */}
                          <button
                            onClick={() =>
                              setViewOrdersProduct({
                                id: product.id,
                                name: product.name,
                              })
                            }
                            title="Xem khách đã đặt món này"
                            className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all"
                          >
                            <Users className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setStockProduct(product)}
                            title="Điều chỉnh kho & Giá"
                            className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all"
                          >
                            <Sliders className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setEditingProduct(product);
                              setIsProductModalOpen(true);
                            }}
                            title="Chỉnh sửa sản phẩm"
                            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            disabled={deletingId === product.id}
                            onClick={() => handleDelete(product.id, product.name)}
                            title="Xóa sản phẩm"
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
