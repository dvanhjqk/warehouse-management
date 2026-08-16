import React from "react";
import { cn } from "@/lib/utils";
import { OrderStatus } from "@prisma/client";
import { Clock, Truck, CheckCircle2, XCircle } from "lucide-react";

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
  showIcon?: boolean;
}

export function OrderStatusBadge({
  status,
  className,
  showIcon = true,
}: OrderStatusBadgeProps) {
  const config = {
    PENDING: {
      label: "Chờ xử lý",
      bg: "bg-[#FEF8EC] text-[#92400E] border-[#FDE68A]",
      icon: Clock,
      dotColor: "bg-[#D97706]",
    },
    SHIPPING: {
      label: "Đang giao",
      bg: "bg-[#F0F7FF] text-[#1E40AF] border-[#BFDBFE]",
      icon: Truck,
      dotColor: "bg-[#2563EB]",
    },
    DELIVERED: {
      label: "Đã giao (Trừ kho)",
      bg: "bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]",
      icon: CheckCircle2,
      dotColor: "bg-[#15803D]",
    },
    CANCELLED: {
      label: "Đã hủy",
      bg: "bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]",
      icon: XCircle,
      dotColor: "bg-[#DC2626]",
    },
  };

  const current = config[status] || config.PENDING;
  const Icon = current.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border transition-colors shadow-2xs",
        current.bg,
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", current.dotColor)} />
      {showIcon && <Icon className="w-3 h-3 shrink-0" />}
      <span>{current.label}</span>
    </span>
  );
}
