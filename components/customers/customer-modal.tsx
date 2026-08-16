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
          <div className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C] text-xs flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-[#44403C] mb-1 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-[#CC785C]" />
            Họ và tên khách hàng <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ví dụ: Nguyễn Văn An"
            className="w-full px-3.5 py-2 rounded-xl border border-[#E8E4DC] focus:outline-none focus:ring-2 focus:ring-[#CC785C]/20 focus:border-[#CC785C] text-sm font-semibold"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#44403C] mb-1 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-[#CC785C]" />
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
            className="w-full px-3.5 py-2 rounded-xl border border-[#E8E4DC] focus:outline-none focus:ring-2 focus:ring-[#CC785C]/20 focus:border-[#CC785C] text-sm font-mono font-semibold"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#44403C] mb-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#CC785C]" />
            Địa chỉ nhận hàng
          </label>
          <textarea
            rows={3}
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
            className="w-full px-3.5 py-2 rounded-xl border border-[#E8E4DC] focus:outline-none focus:ring-2 focus:ring-[#CC785C]/20 focus:border-[#CC785C] text-sm font-medium"
          />
        </div>

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
            <span>{isEditing ? "Lưu thay đổi" : "Tạo khách hàng"}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
