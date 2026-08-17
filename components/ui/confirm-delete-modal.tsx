"use client";

import React, { useEffect } from "react";
import { Trash2, AlertTriangle, X, Loader2 } from "lucide-react";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  itemName?: string;
  itemType?: string; // "sản phẩm" | "đơn hàng" | "khách hàng"
  warningMessage?: string;
  isLoading?: boolean;
}

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  itemType = "mục này",
  warningMessage = "Hành động này sẽ xóa dữ liệu vĩnh viễn và không thể khôi phục lại.",
  isLoading = false,
}: ConfirmDeleteModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const defaultTitle = title || `Xác nhận xóa ${itemType}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/45 transition-opacity animate-in fade-in duration-150"
        onClick={() => {
          if (!isLoading) onClose();
        }}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#E8E4DC] overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150 p-6 space-y-5">
        {/* Top Header Row with Icon and Close */}
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center text-[#B91C1C] shrink-0 shadow-2xs">
            <Trash2 className="w-6 h-6" />
          </div>

          <button
            disabled={isLoading}
            onClick={onClose}
            className="p-1.5 text-[#A8A296] hover:text-[#191716] hover:bg-[#F5F2EB] rounded-xl transition-colors disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Section */}
        <div className="space-y-2">
          <h3 className="font-serif text-lg sm:text-xl font-bold text-[#191716] tracking-tight">
            {defaultTitle}
          </h3>

          <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed">
            Bạn có chắc chắn muốn xóa {itemType}{" "}
            {itemName && (
              <span className="font-bold text-[#191716] bg-[#FAF2EE] text-[#9B5038] px-2 py-0.5 rounded-lg border border-[#F5E4DB] mx-1 inline-block">
                &ldquo;{itemName}&rdquo;
              </span>
            )}
            không?
          </p>

          {/* Warning Notice Box */}
          <div className="p-3 rounded-xl bg-[#FEF8EC] border border-[#FDE68A] flex items-start gap-2 text-xs text-[#92400E] font-medium mt-2">
            <AlertTriangle className="w-4 h-4 text-[#B45309] shrink-0 mt-0.5" />
            <span>{warningMessage}</span>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#F5F2EB]">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#E8E4DC] text-[#44403C] hover:bg-[#F5F2EB] text-xs font-semibold transition-all disabled:opacity-50"
          >
            Hủy bỏ
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold shadow-xs transition-all active:scale-95 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang xóa...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xác nhận xóa</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
