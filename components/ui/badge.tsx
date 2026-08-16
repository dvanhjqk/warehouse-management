import React from "react";
import { OrderStatus } from "@prisma/client";
import { ORDER_STATUS_CONFIG, cn } from "@/lib/utils";
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
  const config = ORDER_STATUS_CONFIG[status] || {
    label: status,
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
    dotClass: "bg-slate-400",
  };

  const renderIcon = () => {
    switch (status) {
      case "PENDING":
        return <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />;
      case "SHIPPING":
        return <Truck className="w-3.5 h-3.5 text-blue-600" />;
      case "DELIVERED":
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
      case "CANCELLED":
        return <XCircle className="w-3.5 h-3.5 text-rose-600" />;
      default:
        return null;
    }
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border shadow-sm transition-all",
        config.badgeClass,
        className
      )}
    >
      {showIcon && renderIcon()}
      <span>{config.label}</span>
    </span>
  );
}
