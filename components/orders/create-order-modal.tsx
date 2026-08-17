"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { createOrder } from "@/app/actions/order-actions";
import { Product, Customer } from "@prisma/client";
import { formatCurrency, formatNumberInput, parseNumberInput } from "@/lib/utils";
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

  // Thay đổi đơn giá tùy chỉnh có hỗ trợ phân cách dấu phẩy hàng nghìn
  const handlePriceChange = (index: number, priceStr: string) => {
    const price = parseNumberInput(priceStr);
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      price: price,
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
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C] text-xs flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* Khách hàng section */}
        <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E4DC] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#44403C] flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-[#CC785C]" />
              Khách hàng
            </span>

            {/* Toggle Existing vs New Customer */}
            <div className="inline-flex p-0.5 bg-[#E8E4DC] rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setCustomerMode("existing")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  customerMode === "existing"
                    ? "bg-white text-[#191716] shadow-2xs font-bold"
                    : "text-[#78716C] hover:text-[#191716]"
                }`}
              >
                Khách có sẵn
              </button>
              <button
                type="button"
                onClick={() => setCustomerMode("new")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  customerMode === "new"
                    ? "bg-white text-[#191716] shadow-2xs font-bold"
                    : "text-[#78716C] hover:text-[#191716]"
                }`}
              >
                + Khách mới
              </button>
            </div>
          </div>

          {customerMode === "existing" ? (
            <div>
              <label className="block text-xs font-semibold text-[#44403C] mb-1">
                Chọn khách hàng từ danh bạ
              </label>
              {customers.length === 0 ? (
                <div className="text-xs text-amber-700 font-medium py-2">
                  Chưa có khách hàng nào trong hệ thống. Vui lòng chuyển sang &quot;Khách mới&quot;.
                </div>
              ) : (
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E8E4DC] bg-white text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#CC785C]/20 focus:border-[#CC785C]"
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
                <label className="block text-xs font-semibold text-[#44403C] mb-1">
                  Họ và tên khách hàng <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn An"
                  value={newCustomer.name}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, name: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E8E4DC] bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#CC785C]/20 focus:border-[#CC785C]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#44403C] mb-1">
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
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E8E4DC] bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#CC785C]/20 focus:border-[#CC785C]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#44403C] mb-1">
                  Địa chỉ giao hàng (Tùy chọn)
                </label>
                <input
                  type="text"
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  value={newCustomer.address}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, address: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E8E4DC] bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#CC785C]/20 focus:border-[#CC785C]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Sản phẩm trong đơn */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#44403C] flex items-center gap-1.5">
              <Package className="w-4 h-4 text-[#CC785C]" />
              Sản phẩm chọn mua ({items.length})
            </span>

            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#CC785C] hover:text-[#BA664A] hover:bg-[#FAF2EE] px-2.5 py-1 rounded-lg transition-colors"
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
                  className="p-3.5 rounded-xl border border-[#E8E4DC] bg-white space-y-2"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    {/* Sản phẩm Combobox tìm kiếm thông minh */}
                    <div className="sm:col-span-5">
                      <label className="block text-[11px] font-semibold text-[#78716C] mb-1">
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
                      <label className="block text-[11px] font-semibold text-[#78716C] mb-1">
                        Số lượng
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleQuantityChange(index, e.target.value)
                        }
                        className="w-full px-2.5 py-2 rounded-xl border border-[#E8E4DC] text-xs sm:text-sm text-center font-bold focus:outline-none focus:ring-2 focus:ring-[#CC785C]/20"
                      />
                    </div>

                    {/* Đơn giá với định dạng dấu phẩy hàng nghìn */}
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-[#78716C] mb-1">
                        Đơn giá (VNĐ)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={formatNumberInput(item.price)}
                          onChange={(e) =>
                            handlePriceChange(index, e.target.value)
                          }
                          className="w-full pl-2.5 pr-6 py-2 rounded-xl border border-[#E8E4DC] text-xs sm:text-sm font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-[#CC785C]/20"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[#78716C] font-semibold pointer-events-none">
                          ₫
                        </span>
                      </div>
                    </div>

                    {/* Thành tiền & Xóa */}
                    <div className="sm:col-span-3 flex items-center justify-between sm:justify-end gap-2 pt-1 sm:pt-4">
                      <div className="text-right">
                        <span className="text-[10px] text-[#78716C] block sm:hidden">
                          Thành tiền:
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-[#191716] tabular-nums">
                          {formatCurrency(lineTotal)}
                        </span>
                      </div>

                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-1.5 text-[#A8A296] hover:text-[#B91C1C] hover:bg-[#FEF2F2] rounded-lg transition-colors"
                          title="Xóa dòng"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Cảnh báo nếu số lượng vượt quá tồn kho hiện tại */}
                  {isStockShortage && (
                    <div className="text-[11px] text-[#B45309] font-medium flex items-center gap-1">
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
        <div className="p-4 rounded-2xl bg-[#FAF2EE] border border-[#F5E4DB] text-[#191716] flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#CC785C]" />
            <div>
              <p className="text-xs font-semibold text-[#191716]">
                Tổng tiền đơn hàng
              </p>
              <p className="text-[11px] text-[#78716C]">
                Tự động tính dựa trên số lượng x đơn giá
              </p>
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-[#CC785C] tracking-tight tabular-nums">
            {formatCurrency(totalAmount)}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F5F2EB]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#E8E4DC] text-[#44403C] hover:bg-[#F5F2EB] text-xs font-semibold"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#CC785C] hover:bg-[#BA664A] text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-all active:scale-95"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Xác nhận tạo đơn hàng</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
