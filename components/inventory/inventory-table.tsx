"use client";

import React, { useState } from "react";
import { Product } from "@prisma/client";
import { formatCurrency } from "@/lib/utils";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Boxes,
  Users,
  AlertTriangle,
  X,
} from "lucide-react";
import { ProductModal } from "./product-modal";
import { StockModal } from "./stock-modal";
import { ProductOrdersModal } from "./product-orders-modal";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { deleteProduct } from "@/app/actions/product-actions";

interface InventoryTableProps {
  initialProducts: Product[];
}

export function InventoryTable({ initialProducts }: InventoryTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [stockModalProduct, setStockModalProduct] = useState<Product | null>(
    null
  );
  const [historyModalProduct, setHistoryModalProduct] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // State xác nhận xóa sản phẩm
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Lọc sản phẩm
  const filteredProducts = initialProducts.filter((product) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      product.name.toLowerCase().includes(term) ||
      (product.sku && product.sku.toLowerCase().includes(term));
    const matchesStock = filterLowStock ? product.stock < 5 : true;
    return matchesSearch && matchesStock;
  });

  const confirmDelete = async () => {
    if (!deletingProduct) return;
    setIsDeleting(true);
    setDeleteError(null);

    const res = await deleteProduct(deletingProduct.id);
    if (!res.success) {
      setDeleteError(res.error || "Không thể xóa sản phẩm.");
    } else {
      setDeletingProduct(null);
    }
    setIsDeleting(false);
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

      {/* Toolbar / Search & Filter */}
      <div className="p-4 rounded-2xl bg-white border border-[#E8E4DC] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-claude-xs">
        <div className="flex flex-1 items-center gap-2 max-w-lg">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#A8A296] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo Tên hoặc Mã SKU..."
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
            type="button"
            onClick={() => setFilterLowStock(!filterLowStock)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all shrink-0 ${
              filterLowStock
                ? "bg-[#FEF8EC] text-[#92400E] border-[#FDE68A]"
                : "bg-[#FAF8F5] text-[#57534E] border-[#E8E4DC] hover:bg-[#F5F2EB]"
            }`}
          >
            Sắp hết (&lt; 5)
          </button>
        </div>

        <button
          onClick={() => {
            setEditingProduct(null);
            setIsProductModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#CC785C] hover:bg-[#BA664A] text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm sản phẩm</span>
        </button>
      </div>

      {/* Table Products */}
      <div className="rounded-2xl bg-white border border-[#E8E4DC] overflow-hidden shadow-claude-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#FAF8F5] text-[#78716C] font-semibold text-[11px] uppercase tracking-wider border-b border-[#E8E4DC]">
              <tr>
                <th className="py-3 px-4 sm:px-6">Tên sản phẩm</th>
                <th className="py-3 px-4">Mã SKU</th>
                <th className="py-3 px-4">Giá bán</th>
                <th className="py-3 px-4">Tồn kho</th>
                <th className="py-3 px-4 sm:px-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F2EB] font-medium text-[#191716]">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-14 text-center text-[#78716C]">
                    <Boxes className="w-10 h-10 mx-auto text-[#D6D1C7] mb-2" />
                    <p className="font-bold text-[#191716] text-sm">
                      Không tìm thấy sản phẩm nào
                    </p>
                    <p className="text-xs text-[#78716C] mt-1">
                      Thử tìm từ khóa khác hoặc bấm nút &quot;Thêm sản phẩm&quot;.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const isOutOfStock = product.stock === 0;
                  const isLowStock = product.stock < 5;

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-[#FAF8F5] transition-colors group"
                    >
                      {/* Tên sản phẩm */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="font-semibold text-[#191716] group-hover:text-[#CC785C] transition-colors">
                          {product.name}
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="py-3.5 px-4">
                        {product.sku ? (
                          <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-[#F5F2EB] text-[#44403C] font-semibold">
                            {product.sku}
                          </span>
                        ) : (
                          <span className="text-[#A8A296] text-xs">--</span>
                        )}
                      </td>

                      {/* Giá */}
                      <td className="py-3.5 px-4 font-bold text-[#191716] tabular-nums">
                        {formatCurrency(product.price)}
                      </td>

                      {/* Tồn kho */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            isOutOfStock
                              ? "bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]"
                              : isLowStock
                              ? "bg-[#FEF8EC] text-[#B45309] border border-[#FDE68A]"
                              : "bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]"
                          }`}
                        >
                          {isOutOfStock
                            ? "Hết hàng (0)"
                            : `Còn ${product.stock} cái`}
                        </span>
                      </td>

                      {/* Thao tác */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Xem khách đã mua */}
                          <button
                            onClick={() =>
                              setHistoryModalProduct({
                                id: product.id,
                                name: product.name,
                              })
                            }
                            title="Xem khách hàng đã mua món này"
                            className="p-1.5 rounded-lg text-[#78716C] hover:text-[#CC785C] hover:bg-[#FAF2EE] transition-colors"
                          >
                            <Users className="w-4 h-4" />
                          </button>

                          {/* Chỉnh sửa thông tin */}
                          <button
                            onClick={() => {
                              setEditingProduct(product);
                              setIsProductModalOpen(true);
                            }}
                            title="Sửa tên / SKU / Giá"
                            className="p-1.5 rounded-lg text-[#78716C] hover:text-[#191716] hover:bg-[#F5F2EB] transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Cập nhật nhanh Tồn kho / Giá */}
                          <button
                            onClick={() => setStockModalProduct(product)}
                            title="Cập nhật nhanh Tồn & Giá"
                            className="p-1.5 rounded-lg text-[#78716C] hover:text-[#15803D] hover:bg-[#F0FDF4] transition-colors"
                          >
                            <Boxes className="w-4 h-4" />
                          </button>

                          {/* Xóa sản phẩm với Modal xác nhận đẹp */}
                          <button
                            onClick={() => setDeletingProduct(product)}
                            title="Xóa sản phẩm"
                            className="p-1.5 rounded-lg text-[#A8A296] hover:text-[#B91C1C] hover:bg-[#FEF2F2] transition-colors"
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
        isOpen={!!stockModalProduct}
        onClose={() => setStockModalProduct(null)}
        product={stockModalProduct}
      />

      <ProductOrdersModal
        isOpen={!!historyModalProduct}
        onClose={() => setHistoryModalProduct(null)}
        productId={historyModalProduct?.id || null}
        productName={historyModalProduct?.name || ""}
      />

      {/* Cửa sổ xác nhận xóa sản phẩm cao cấp */}
      <ConfirmDeleteModal
        isOpen={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa mặt hàng"
        itemType="sản phẩm"
        itemName={deletingProduct?.name}
        warningMessage="Toàn bộ thông tin tồn kho và giá của sản phẩm này sẽ bị xóa khỏi kho hàng."
        isLoading={isDeleting}
      />
    </div>
  );
}
