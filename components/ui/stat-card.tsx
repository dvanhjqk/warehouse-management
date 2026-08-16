import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  colorScheme: "blue" | "amber" | "emerald" | "rose" | "purple" | "indigo";
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
      iconBg: "bg-blue-50 text-blue-600 border-blue-100",
      borderHover: "hover:border-blue-300 hover:shadow-glow-brand",
      glowBg: "bg-blue-500/5",
      badgeColor: "text-blue-700 bg-blue-50 border-blue-100",
    },
    indigo: {
      iconBg: "bg-indigo-50 text-indigo-600 border-indigo-100",
      borderHover: "hover:border-indigo-300 hover:shadow-glow-brand",
      glowBg: "bg-indigo-500/5",
      badgeColor: "text-indigo-700 bg-indigo-50 border-indigo-100",
    },
    amber: {
      iconBg: "bg-amber-50 text-amber-600 border-amber-100",
      borderHover: "hover:border-amber-300 hover:shadow-glow-amber",
      glowBg: "bg-amber-500/5",
      badgeColor: "text-amber-700 bg-amber-50 border-amber-100",
    },
    emerald: {
      iconBg: "bg-emerald-50 text-emerald-600 border-emerald-100",
      borderHover: "hover:border-emerald-300 hover:shadow-glow-emerald",
      glowBg: "bg-emerald-500/5",
      badgeColor: "text-emerald-700 bg-emerald-50 border-emerald-100",
    },
    rose: {
      iconBg: "bg-rose-50 text-rose-600 border-rose-100",
      borderHover: "hover:border-rose-300 hover:shadow-glow-rose",
      glowBg: "bg-rose-500/5",
      badgeColor: "text-rose-700 bg-rose-50 border-rose-100",
    },
    purple: {
      iconBg: "bg-purple-50 text-purple-600 border-purple-100",
      borderHover: "hover:border-purple-300 hover:shadow-glow-brand",
      glowBg: "bg-purple-500/5",
      badgeColor: "text-purple-700 bg-purple-50 border-purple-100",
    },
  };

  const style = schemeStyles[colorScheme] || schemeStyles.blue;

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs transition-all duration-300 overflow-hidden group",
        style.borderHover,
        onClick && "cursor-pointer active:scale-98"
      )}
    >
      {/* Subtle background ambient glow */}
      <div
        className={cn(
          "absolute -right-8 -top-8 w-28 h-28 rounded-full blur-2xl transition-opacity duration-300 opacity-60 group-hover:opacity-100 pointer-events-none",
          style.glowBg
        )}
      />

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="space-y-1.5 flex-1 min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">
            {title}
          </p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums truncate">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-400 font-medium truncate">
              {subtitle}
            </p>
          )}
        </div>

        <div
          className={cn(
            "p-3.5 rounded-2xl border flex items-center justify-center shrink-0 shadow-2xs transition-transform duration-300 group-hover:scale-105",
            style.iconBg
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {badgeText && (
        <div className="relative z-10 mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between">
          <span
            className={cn(
              "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border",
              style.badgeColor
            )}
          >
            {badgeText}
          </span>
        </div>
      )}
    </div>
  );
}
