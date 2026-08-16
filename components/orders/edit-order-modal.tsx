"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { updateOrder } from "@/app/actions/order-actions";
import { Product, Customer, Order, OrderItem } from "@prisma/client";
import { formatCurrency } from "@/lib/utils";
import { ProductCombobox } from "@/components/ui/product-combobox";
import {
  Plus,
  Trash2,
  AlertCircle,
  Loader2,
  UserCheck,
  Receipt,
  Package,
} from "lucide-react";

type OrderWithRelations = Order & {
  customer: Customer;
  items: (OrderItem & {
    product: Product;
  })[];
};

interface OrderLineItem {
  productId: string;
  quantity: number;
  price: number;
  availableStock?: number;
  name?: string;
}

interface EditOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderWithRelations | null;
  products: Product[];
  customers: Customer[];
  onSuccess?: () => void;
}

export function EditOrderModal({
  isOpen,
  onClose,
  order,
  products,
  customers,
  onSuccess,
}: EditOrderModalProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [items, setItems] = useState<OrderLineItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (order) {
      setSelectedCustomerId(order.customerId);
      setItems(
        order.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          availableStock: item.product?.stock ?? 0,
          name: item.product?.name ?? "",
        }))
      );
    }
    setError(null);
  }, [order, isOpen]);

  if (!order) return null;

  // Thêm dòng sản phẩm mới
  const handleAddItem = () => {
    const defaultProduct = products[0];
    if (!defaultProduct) return;

    setItems([
      ...items,
      {
        productId: defaultProduct.id,
        quantity: 1,
        price: defaultProduct.price,
        availableStock: defaultProduct.stock,
        name: defaultProduct.name,
      },
    ]);
  };

  // Xóa 1 dòng sản phẩm
  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  // Thay đổi sản phẩm được chọn trên dòng qua Combobox tìm kiếm
  const handleProductChange = (index: number, productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      productId: prod.id,
      price: prod.price,
      availableStock: prod.stock,
      name: prod.name,
    };
    setItems(newItems);
  };

  // Thay đổi số lượng trên dòng
  const handleQuantityChange = (index: number, qtyStr: string) => {
    const qty = parseInt(qtyStr, 10);
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      quantity: isNaN(qty) ? 1 : Math.max(1, qty),
    };
    setItems(newItems);
  };

  // Thay đổi đơn giá tùy chỉnh
  const handlePriceChange = (index: number, priceStr: string) => {
    const price = parseFloat(priceStr);
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      price: isNaN(price) ? 0 : Math.max(0, price),
    };
    setItems(newItems);
  };

  // Tính tổng tiền đơn hàng sau khi sửa
  const totalAmount = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (items.length === 0) {
        setError("Đơn hàng phải có ít nhất 1 sản phẩm.");
        setLoading(false);
        return;
      }

      const res = await updateOrder({
        orderId: order.id,
        customerId: selectedCustomerId,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          price: i.price,
        })),
      });

      if (!res.success) {
        setError(res.error);
      } else {
        onSuccess?.();
        onClose();
      }
    } catch (err: unknown) {
      setError((err as Error).message || "Có lỗi xảy ra khi cập nhật đơn hàng.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chỉnh sửa đơn hàng (Đang xử lý)"
      description={`Cập nhật danh sách sản phẩm hoặc khách hàng cho đơn #${order.id.slice(-6).toUpperCase()}`}
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* Khách hàng selector */}
        <div className="p-5 rounded-3xl bg-slate-50/80 border border-slate-200/80 space-y-2 shadow-2xs">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-1">
            <UserCheck className="w-4 h-4 text-indigo-600" />
            Khách hàng
          </label>
          <select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs"
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} - 📱 {c.phone} {c.address ? `(${c.address})` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Danh sách sản phẩm */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-indigo-600" />
              Sản phẩm trong đơn ({items.length})
            </span>

            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 px-3 py-1.5 rounded-xl border border-indigo-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Thêm mặt hàng</span>
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => {
              const lineTotal = item.price * item.quantity;
              const prod = products.find((p) => p.id === item.productId);
              const currentStock = prod ? prod.stock : 0;
              const isStockShortage = item.quantity > currentStock;

              return (
                <div
                  key={index}
                  className="p-4 rounded-2xl border border-slate-200/80 bg-white space-y-2 shadow-2xs hover:border-slate-300 transition-all"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    {/* Sản phẩm Combobox tìm kiếm thông minh */}
                    <div className="sm:col-span-5">
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">
                        Sản phẩm (Tìm theo tên / SKU)
                      </label>
                      <ProductCombobox
                        products={products}
                        value={item.productId}
                        onChange={(newProdId) =>
                          handleProductChange(index, newProdId)
                        }
                      />
                    </div>

                    {/* Số lượng */}
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">
                        Số lượng
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleQuantityChange(index, e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-center font-extrabold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    {/* Đơn giá */}
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">
                        Đơn giá (VNĐ)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={item.price}
                        onChange={(e) =>
                          handlePriceChange(index, e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    {/* Thành tiền & Nút xóa dòng */}
                    <div className="sm:col-span-3 flex items-center justify-between sm:justify-end gap-2 pt-1 sm:pt-4">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block sm:hidden">
                          Thành tiền:
                        </span>
                        <span className="text-xs sm:text-sm font-extrabold text-slate-900 tabular-nums">
                          {formatCurrency(lineTotal)}
                        </span>
                      </div>

                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          title="Xóa dòng này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Cảnh báo tồn kho */}
                  {isStockShortage && (
                    <div className="text-[11px] text-amber-600 font-bold flex items-center gap-1.5 pt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        Lưu ý: Kho hiện chỉ còn <b>{currentStock}</b> cái. Bạn cần bổ sung tồn kho trước khi đổi trạng thái sang Giao hàng (DELIVERED).
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Tổng thanh toán mới */}
        <div className="p-5 rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-600 text-white flex items-center justify-between shadow-lg shadow-indigo-500/25">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/15 backdrop-blur-md">
              <Receipt className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-indigo-100">
                Tổng tiền đơn hàng mới
              </p>
              <p className="text-[11px] text-indigo-200">
                Đã tự động tính lại theo danh sách sản phẩm
              </p>
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums">
            {formatCurrency(totalAmount)}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
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
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 disabled:opacity-50 transition-all active:scale-95"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Lưu thay đổi đơn hàng</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
