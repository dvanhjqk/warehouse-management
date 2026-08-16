import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { OrderStatus } from "@prisma/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format số tiền sang định dạng tiền tệ Việt Nam (VNĐ)
 * Ví dụ: 1450000 -> "1.450.000 ₫"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format ngày tháng sang định dạng tiếng Việt
 * Ví dụ: "15/08/2026, 21:30"
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/**
 * Thông tin hiển thị trực quan cho từng trạng thái đơn hàng
 */
export const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  {
    label: string;
    description: string;
    badgeClass: string;
    dotClass: string;
    textClass: string;
  }
> = {
  PENDING: {
    label: "Đang xử lý",
    description: "Đơn mới tiếp nhận, chờ đóng gói",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20",
    dotClass: "bg-amber-500",
    textClass: "text-amber-700",
  },
  SHIPPING: {
    label: "Đang giao hàng",
    description: "Đã xuất kho, đang vận chuyển",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/20",
    dotClass: "bg-blue-500",
    textClass: "text-blue-700",
  },
  DELIVERED: {
    label: "Đã giao hàng",
    description: "Giao thành công & Đã trừ kho",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20",
    dotClass: "bg-emerald-500",
    textClass: "text-emerald-700",
  },
  CANCELLED: {
    label: "Đã hủy",
    description: "Đơn hàng đã bị hủy bỏ",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20",
    dotClass: "bg-rose-500",
    textClass: "text-rose-700",
  },
};
