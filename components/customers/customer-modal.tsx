"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { createCustomer, updateCustomer } from "@/app/actions/customer-actions";
import { Customer } from "@prisma/client";
import { AlertCircle, Loader2, User, Phone, MapPin } from "lucide-react";

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
      title={isEditing ? "Chỉnh sửa thông tin khách hàng" : "Thêm khách hàng mới"}
      description={
        isEditing
          ? "Cập nhật thông tin liên hệ của khách hàng"
          : "Thêm thông tin khách hàng mới vào danh bạ"
      }
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-indigo-600" />
            Họ và tên khách hàng <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ví dụ: Nguyễn Văn An"
            className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-semibold shadow-2xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-indigo-600" />
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
            className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-mono font-bold shadow-2xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-indigo-600" />
            Địa chỉ nhận hàng
          </label>
          <textarea
            rows={3}
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
            className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium shadow-2xs"
          />
        </div>

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
            <span>{isEditing ? "Lưu thay đổi" : "Tạo khách hàng"}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
