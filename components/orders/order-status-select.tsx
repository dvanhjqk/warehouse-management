"use client";

import React, { useState } from "react";
import { OrderStatus } from "@prisma/client";
import { updateOrderStatus } from "@/app/actions/order-actions";
import { Loader2 } from "lucide-react";
import { ORDER_STATUS_CONFIG } from "@/lib/utils";

interface OrderStatusSelectProps {
  orderId: string;
  currentStatus: OrderStatus;
  onError?: (msg: string) => void;
}

export function OrderStatusSelect({
  orderId,
  currentStatus,
  onError,
}: OrderStatusSelectProps) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [loading, setLoading] = useState(false);

  const handleChange = async (newStatus: OrderStatus) => {
    if (newStatus === status) return;

    setLoading(true);
    try {
      const res = await updateOrderStatus(orderId, newStatus);
      if (!res.success) {
        const errorMsg = res.error || "Không thể cập nhật trạng thái đơn hàng.";
        if (onError) {
          onError(errorMsg);
        } else {
          alert(`❌ Không thể cập nhật trạng thái:\n${errorMsg}`);
        }
        // Giữ nguyên trạng thái cũ nếu thất bại
        setStatus(status);
      } else {
        setStatus(newStatus);
      }
    } catch (err: unknown) {
      const msg = (err as Error).message || "Lỗi không xác định khi cập nhật.";
      if (onError) onError(msg);
      else alert(`❌ ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const currentConfig = ORDER_STATUS_CONFIG[status];

  return (
    <div className="relative inline-flex items-center">
      {loading && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center rounded-lg z-10">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
        </div>
      )}
      <select
        value={status}
        disabled={loading}
        onChange={(e) => handleChange(e.target.value as OrderStatus)}
        className={`px-2.5 py-1 text-xs font-bold rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer transition-all ${currentConfig?.badgeClass}`}
      >
        <option value="PENDING">🕒 Đang xử lý</option>
        <option value="SHIPPING">🚚 Đang giao hàng</option>
        <option value="DELIVERED">✅ Đã giao (Trừ kho)</option>
        <option value="CANCELLED">❌ Đã hủy</option>
      </select>
    </div>
  );
}
