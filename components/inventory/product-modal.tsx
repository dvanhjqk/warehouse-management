"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { createProduct, updateProduct } from "@/app/actions/product-actions";
import { Product } from "@prisma/client";
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
        price: product.price.toString(),
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
      const priceNum = parseFloat(formData.price);
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
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* Tên sản phẩm */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-indigo-600" />
            Tên sản phẩm <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ví dụ: Tai Nghe Bluetooth ANC Pro Max"
            className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-semibold shadow-2xs"
          />
        </div>

        {/* Mã SKU */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-indigo-600" />
            Mã SKU (Mã phân loại duy nhất)
          </label>
          <input
            type="text"
            value={formData.sku}
            onChange={(e) =>
              setFormData({ ...formData, sku: e.target.value.toUpperCase() })
            }
            placeholder="Ví dụ: AUDIO-PRO-01"
            className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-mono font-bold shadow-2xs"
          />
          <p className="text-[11px] text-slate-400 mt-1 font-medium">
            Để trống nếu bạn không sử dụng mã phân loại SKU.
          </p>
        </div>

        {/* Giá & Tồn kho */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              Giá bán (VNĐ) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="1000"
              required
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              placeholder="Ví dụ: 1450000"
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-extrabold shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Boxes className="w-3.5 h-3.5 text-indigo-600" />
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
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-extrabold shadow-2xs"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 active:scale-95"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{isEditing ? "Lưu thay đổi" : "Tạo sản phẩm"}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
