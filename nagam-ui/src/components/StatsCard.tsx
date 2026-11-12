import React from "react";
import { cn } from "../lib/utils";
import { Card } from "./Card";

export interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, subtitle, icon, trend, className }) => {
  return (
    <Card className={cn("p-6 relative overflow-hidden", className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        {icon && <div className="p-2.5 rounded-lg bg-[#EAF1F6] text-[#142F58]">{icon}</div>}
      </div>
      <div className="mt-3">
        <h4 className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</h4>
        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        {trend && (
          <p className={cn("text-xs font-semibold mt-2", trend.isPositive ? "text-emerald-600" : "text-rose-600")}>
            {trend.isPositive ? "↑" : "↓"} {trend.value}
          </p>
        )}
      </div>
    </Card>
  );
};
