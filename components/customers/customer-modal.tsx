"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { createCustomer, updateCustomer } from "@/app/actions/customer-actions";
import { Customer } from "@prisma/client";
import { AlertCircle, Loader2 } from "lucide-react";

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: Customer | null;
  onSuccess?: () => void;
}

export function CustomerModal({
  isOpen,
  onClose,
  customer,
  onSuccess,
}: CustomerModalProps) {
  const isEditing = !!customer;

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        phone: customer.phone,
        address: customer.address || "",
      });
    } else {
      setFormData({
        name: "",
        phone: "",
        address: "",
      });
    }
    setError(null);
  }, [customer, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let res;
      if (isEditing && customer) {
        res = await updateCustomer(customer.id, {
          name: formData.name,
          phone: formData.phone,
          address: formData.address || null,
        });
      } else {
        res = await createCustomer({
          name: formData.name,
          phone: formData.phone,
          address: formData.address || null,
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
      title={isEditing ? "Chỉnh sửa khách hàng" : "Thêm khách hàng mới"}
      description={
        isEditing
          ? "Cập nhật thông tin liên hệ của khách hàng"
          : "Thêm thông tin khách hàng mới vào danh bạ"
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Họ và tên khách hàng <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ví dụ: Nguyễn Văn A"
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Số điện thoại <span className="text-rose-500">*</span>
          </label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            placeholder="Ví dụ: 0901234567"
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Địa chỉ nhận hàng
          </label>
          <textarea
            rows={3}
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm disabled:opacity-50"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{isEditing ? "Lưu thay đổi" : "Tạo khách hàng"}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
