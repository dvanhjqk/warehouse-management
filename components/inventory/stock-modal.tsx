"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { updateStockAndPrice } from "@/app/actions/product-actions";
import { Product } from "@prisma/client";
import { AlertCircle, Loader2, Sliders, DollarSign, Boxes } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface StockModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSuccess?: () => void;
}

export function StockModal({
  isOpen,
  onClose,
  product,
  onSuccess,
}: StockModalProps) {
  const [stock, setStock] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setStock(product.stock.toString());
      setPrice(product.price.toString());
    }
    setError(null);
  }, [product, isOpen]);

  if (!product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const stockNum = parseInt(stock, 10);
      const priceNum = parseFloat(price);

      if (isNaN(stockNum) || stockNum < 0) {
        setError("Số lượng tồn kho phải là số không âm.");
        setLoading(false);
        return;
      }

      if (isNaN(priceNum) || priceNum < 0) {
        setError("Giá bán phải là số không âm.");
        setLoading(false);
        return;
      }

      const res = await updateStockAndPrice(product.id, {
        stock: stockNum,
        price: priceNum,
      });

      if (!res.success) {
        setError(res.error || "Không thể cập nhật.");
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
      title="Cập nhật nhanh Tồn kho & Giá"
      description={`Điều chỉnh số lượng thực tế và giá bán cho: ${product.name}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1.5 shadow-2xs">
          <div className="flex justify-between text-slate-500 font-medium">
            <span>Mã SKU:</span>
            <span className="font-mono font-bold text-slate-800">
              {product.sku || "(Không có)"}
            </span>
          </div>
          <div className="flex justify-between text-slate-500 font-medium">
            <span>Giá hiện tại:</span>
            <span className="font-bold text-slate-800 tabular-nums">
              {formatCurrency(product.price)}
            </span>
          </div>
          <div className="flex justify-between text-slate-500 font-medium">
            <span>Tồn kho hiện tại:</span>
            <span
              className={`font-extrabold ${
                product.stock < 5 ? "text-amber-600" : "text-emerald-600"
              }`}
            >
              {product.stock} sản phẩm
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Boxes className="w-3.5 h-3.5 text-indigo-600" />
            Số lượng tồn kho mới
          </label>
          <input
            type="number"
            min="0"
            required
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-extrabold shadow-2xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            Giá bán mới (VNĐ)
          </label>
          <input
            type="number"
            min="0"
            step="1000"
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-extrabold shadow-2xs"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all"
          >
            Đóng
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 disabled:opacity-50 transition-all active:scale-95"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Cập nhật</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
