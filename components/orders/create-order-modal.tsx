"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { createOrder } from "@/app/actions/order-actions";
import { Product, Customer } from "@prisma/client";
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

interface OrderLineItem {
  productId: string;
  quantity: number;
  price: number;
  availableStock?: number;
  name?: string;
}

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  customers: Customer[];
  onSuccess?: () => void;
}

export function CreateOrderModal({
  isOpen,
  onClose,
  products,
  customers,
  onSuccess,
}: CreateOrderModalProps) {
  const [customerMode, setCustomerMode] = useState<"existing" | "new">(
    customers.length > 0 ? "existing" : "new"
  );
  const [selectedCustomerId, setSelectedCustomerId] = useState(
    customers[0]?.id || ""
  );

  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    address: "",
  });

  const [items, setItems] = useState<OrderLineItem[]>([
    {
      productId: products[0]?.id || "",
      quantity: 1,
      price: products[0]?.price || 0,
      availableStock: products[0]?.stock || 0,
      name: products[0]?.name || "",
    },
  ]);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  // Thay đổi đơn giá tùy chỉnh nếu cần
  const handlePriceChange = (index: number, priceStr: string) => {
    const price = parseFloat(priceStr);
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      price: isNaN(price) ? 0 : Math.max(0, price),
    };
    setItems(newItems);
  };

  // Tổng tiền đơn hàng
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

      const payload = {
        customerId: customerMode === "existing" ? selectedCustomerId : undefined,
        newCustomer:
          customerMode === "new"
            ? {
                name: newCustomer.name,
                phone: newCustomer.phone,
                address: newCustomer.address || null,
              }
            : undefined,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          price: i.price,
        })),
      };

      const res = await createOrder(payload);

      if (!res.success) {
        setError(res.error);
      } else {
        onSuccess?.();
        onClose();
      }
    } catch (err: unknown) {
      setError((err as Error).message || "Có lỗi xảy ra khi tạo đơn hàng.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tạo đơn hàng mới"
      description="Nhập thông tin khách hàng và tìm kiếm sản phẩm để tạo đơn"
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Khách hàng section */}
        <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-blue-600" />
              Khách hàng
            </span>

            {/* Toggle Existing vs New Customer */}
            <div className="inline-flex p-1 bg-slate-200/70 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setCustomerMode("existing")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  customerMode === "existing"
                    ? "bg-white text-blue-600 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Khách có sẵn
              </button>
              <button
                type="button"
                onClick={() => setCustomerMode("new")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  customerMode === "new"
                    ? "bg-white text-blue-600 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                + Khách mới
              </button>
            </div>
          </div>

          {customerMode === "existing" ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Chọn khách hàng từ danh bạ
              </label>
              {customers.length === 0 ? (
                <div className="text-xs text-amber-600 font-medium py-2">
                  Chưa có khách hàng nào trong hệ thống. Vui lòng chuyển sang &quot;Khách mới&quot;.
                </div>
              ) : (
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} - 📱 {c.phone} {c.address ? `(${c.address})` : ""}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Họ và tên khách hàng <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={newCustomer.name}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, name: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Số điện thoại <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Ví dụ: 0901234567"
                  value={newCustomer.phone}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, phone: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Địa chỉ giao hàng (Tùy chọn)
                </label>
                <input
                  type="text"
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  value={newCustomer.address}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, address: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Sản phẩm trong đơn */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-blue-600" />
              Sản phẩm chọn mua ({items.length})
            </span>

            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm mặt hàng</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {items.map((item, index) => {
              const lineTotal = item.price * item.quantity;
              const prod = products.find((p) => p.id === item.productId);
              const currentStock = prod ? prod.stock : 0;
              const isStockShortage = item.quantity > currentStock;

              return (
                <div
                  key={index}
                  className="p-3.5 rounded-xl border border-slate-200/80 bg-white space-y-2"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    {/* Sản phẩm Combobox tìm kiếm thông minh */}
                    <div className="sm:col-span-5">
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Sản phẩm (Gõ để tìm nhanh)
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
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Số lượng
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleQuantityChange(index, e.target.value)
                        }
                        className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-center font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    {/* Đơn giá */}
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
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
                        className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    {/* Thành tiền & Xóa */}
                    <div className="sm:col-span-3 flex items-center justify-between sm:justify-end gap-2 pt-1 sm:pt-4">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block sm:hidden">
                          Thành tiền:
                        </span>
                        <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                          {formatCurrency(lineTotal)}
                        </span>
                      </div>

                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Xóa dòng"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Cảnh báo nếu số lượng vượt quá tồn kho hiện tại */}
                  {isStockShortage && (
                    <div className="text-[11px] text-amber-600 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>
                        Lưu ý: Kho chỉ còn <b>{currentStock}</b> cái. Bạn vẫn có thể tạo đơn PENDING, nhưng sẽ cần bổ sung tồn kho trước khi giao hàng (DELIVERED).
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Tổng thanh toán */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <Receipt className="w-6 h-6 opacity-80" />
            <div>
              <p className="text-xs font-medium text-blue-100">
                Tổng tiền đơn hàng
              </p>
              <p className="text-[11px] text-blue-200">
                Tự động tính dựa trên số lượng x đơn giá
              </p>
            </div>
          </div>
          <div className="text-2xl font-extrabold tracking-tight">
            {formatCurrency(totalAmount)}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Xác nhận tạo đơn hàng</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
