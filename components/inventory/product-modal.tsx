"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { createProduct, updateProduct } from "@/app/actions/product-actions";
import { Product } from "@prisma/client";
import { formatNumberInput, parseNumberInput } from "@/lib/utils";
import { AlertCircle, Loader2, Package, Tag, DollarSign, Boxes } from "lucide-react";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  onSuccess?: () => void;
}

export function ProductModal({
  isOpen,
  onClose,
  product,
  onSuccess,
}: ProductModalProps) {
  const isEditing = !!product;

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    price: "",
    stock: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        sku: product.sku || "",
        price: formatNumberInput(product.price),
        stock: product.stock.toString(),
      });
    } else {
      setFormData({
        name: "",
        sku: "",
        price: "",
        stock: "0",
      });
    }
    setError(null);
  }, [product, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const priceNum = parseNumberInput(formData.price);
      const stockNum = parseInt(formData.stock, 10);

      if (isNaN(priceNum) || priceNum < 0) {
        setError("Giá bán phải là số hợp lệ không âm.");
        setLoading(false);
        return;
      }

      if (isNaN(stockNum) || stockNum < 0) {
        setError("Số lượng tồn kho phải là số nguyên không âm.");
        setLoading(false);
        return;
      }

      let res;
      if (isEditing && product) {
        res = await updateProduct(product.id, {
          name: formData.name,
          sku: formData.sku || null,
          price: priceNum,
          stock: stockNum,
        });
      } else {
        res = await createProduct({
          name: formData.name,
          sku: formData.sku || null,
          price: priceNum,
          stock: stockNum,
        });
      }

      if (!res.success) {
        setError(res.error || "Thao tác không thành công.");
      } else {
        onSuccess?.();
        onClose();
      }
    } catch (err: unknown) {
      setError((err as Error).message || "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
      description={
        isEditing
          ? "Cập nhật thông tin chi tiết của sản phẩm trong kho"
          : "Điền các thông tin để tạo mới một mặt hàng trong kho"
      }
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C] text-xs flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* Tên sản phẩm */}
        <div>
          <label className="block text-xs font-semibold text-[#44403C] mb-1 flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-[#CC785C]" />
            Tên sản phẩm <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ví dụ: Tai Nghe Bluetooth ANC Pro Max"
            className="w-full px-3.5 py-2 rounded-xl border border-[#E8E4DC] focus:outline-none focus:ring-2 focus:ring-[#CC785C]/20 focus:border-[#CC785C] text-sm font-semibold"
          />
        </div>

        {/* Mã SKU */}
        <div>
          <label className="block text-xs font-semibold text-[#44403C] mb-1 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-[#CC785C]" />
            Mã SKU (Mã phân loại duy nhất)
          </label>
          <input
            type="text"
            value={formData.sku}
            onChange={(e) =>
              setFormData({ ...formData, sku: e.target.value.toUpperCase() })
            }
            placeholder="Ví dụ: AUDIO-PRO-01"
            className="w-full px-3.5 py-2 rounded-xl border border-[#E8E4DC] focus:outline-none focus:ring-2 focus:ring-[#CC785C]/20 focus:border-[#CC785C] text-sm font-mono font-semibold"
          />
          <p className="text-[11px] text-[#A8A296] mt-1 font-medium">
            Để trống nếu bạn không sử dụng mã phân loại SKU.
          </p>
        </div>

        {/* Giá & Tồn kho */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#44403C] mb-1 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              Giá bán (VNĐ) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                required
                value={formData.price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: formatNumberInput(e.target.value),
                  })
                }
                placeholder="Ví dụ: 1,450,000"
                className="w-full pl-3.5 pr-8 py-2 rounded-xl border border-[#E8E4DC] focus:outline-none focus:ring-2 focus:ring-[#CC785C]/20 focus:border-[#CC785C] text-sm font-bold tabular-nums"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#78716C] font-semibold">
                ₫
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#44403C] mb-1 flex items-center gap-1.5">
              <Boxes className="w-3.5 h-3.5 text-[#CC785C]" />
              Số lượng tồn ban đầu <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              required
              value={formData.stock}
              onChange={(e) =>
                setFormData({ ...formData, stock: e.target.value })
              }
              placeholder="0"
              className="w-full px-3.5 py-2 rounded-xl border border-[#E8E4DC] focus:outline-none focus:ring-2 focus:ring-[#CC785C]/20 focus:border-[#CC785C] text-sm font-bold"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F5F2EB] mt-5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#E8E4DC] text-[#44403C] hover:bg-[#F5F2EB] text-xs font-semibold transition-all"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#CC785C] hover:bg-[#BA664A] text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-50 active:scale-95"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{isEditing ? "Lưu thay đổi" : "Tạo sản phẩm"}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
