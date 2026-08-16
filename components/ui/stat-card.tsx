import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  colorScheme: "blue" | "amber" | "emerald" | "rose" | "purple" | "indigo" | "claude";
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
    claude: {
      iconBg: "bg-[#FAF2EE] text-[#CC785C] border-[#F5E4DB]",
      badgeColor: "text-[#9B5038] bg-[#FAF2EE] border-[#F5E4DB]",
    },
    amber: {
      iconBg: "bg-[#FEF8EC] text-[#B45309] border-[#FDE68A]",
      badgeColor: "text-[#92400E] bg-[#FEF8EC] border-[#FDE68A]",
    },
    emerald: {
      iconBg: "bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]",
      badgeColor: "text-[#166534] bg-[#F0FDF4] border-[#BBF7D0]",
    },
    rose: {
      iconBg: "bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]",
      badgeColor: "text-[#991B1B] bg-[#FEF2F2] border-[#FECACA]",
    },
    blue: {
      iconBg: "bg-[#F0F7FF] text-[#2563EB] border-[#BFDBFE]",
      badgeColor: "text-[#1E40AF] bg-[#F0F7FF] border-[#BFDBFE]",
    },
    indigo: {
      iconBg: "bg-[#FAF2EE] text-[#CC785C] border-[#F5E4DB]",
      badgeColor: "text-[#9B5038] bg-[#FAF2EE] border-[#F5E4DB]",
    },
    purple: {
      iconBg: "bg-[#FAF5FF] text-[#7E22CE] border-[#E9D5FF]",
      badgeColor: "text-[#6B21A8] bg-[#FAF5FF] border-[#E9D5FF]",
    },
  };

  const style = schemeStyles[colorScheme] || schemeStyles.claude;

  return (
    <div
      onClick={onClick}
      className={cn(
        "p-5 rounded-2xl bg-white border border-[#E8E4DC] shadow-claude-xs hover:border-[#D6D1C7] transition-all",
        onClick && "cursor-pointer active:scale-98"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 flex-1 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#78716C] truncate">
            {title}
          </p>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#191716] tracking-tight tabular-nums truncate">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-[#78716C] font-normal truncate">
              {subtitle}
            </p>
          )}
        </div>

        <div
          className={cn(
            "p-3 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs",
            style.iconBg
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {badgeText && (
        <div className="mt-3.5 pt-3 border-t border-[#F5F2EB] flex items-center justify-between">
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
