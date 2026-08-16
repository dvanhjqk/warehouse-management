import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  colorScheme: "blue" | "amber" | "emerald" | "rose" | "purple";
  badgeText?: string;
  onClick?: () => void;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  colorScheme,
  badgeText,
  onClick,
}: StatCardProps) {
  const schemeStyles = {
    blue: {
      iconBg: "bg-blue-100/80 text-blue-600",
      borderHover: "hover:border-blue-300",
      accent: "text-blue-600",
    },
    amber: {
      iconBg: "bg-amber-100/80 text-amber-600",
      borderHover: "hover:border-amber-300",
      accent: "text-amber-600",
    },
    emerald: {
      iconBg: "bg-emerald-100/80 text-emerald-600",
      borderHover: "hover:border-emerald-300",
      accent: "text-emerald-600",
    },
    rose: {
      iconBg: "bg-rose-100/80 text-rose-600",
      borderHover: "hover:border-rose-300",
      accent: "text-rose-600",
    },
    purple: {
      iconBg: "bg-purple-100/80 text-purple-600",
      borderHover: "hover:border-purple-300",
      accent: "text-purple-600",
    },
  };

  const style = schemeStyles[colorScheme];

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm transition-all duration-200 hover:shadow-md",
        style.borderHover,
        onClick && "cursor-pointer"
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            {title}
          </p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {value}
          </h3>
          {subtitle && (
            <p className="mt-1.5 text-xs text-slate-500 font-medium">
              {subtitle}
            </p>
          )}
        </div>
        <div
          className={cn(
            "p-3.5 rounded-xl flex items-center justify-center shadow-inner",
            style.iconBg
          )}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {badgeText && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{badgeText}</span>
        </div>
      )}
    </div>
  );
}
