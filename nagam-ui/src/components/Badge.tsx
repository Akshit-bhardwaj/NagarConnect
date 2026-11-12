import React from "react";
import { cn } from "../lib/utils";

export type BadgeVariant =
  | "SUBMITTED"
  | "TRIAGED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "NEEDS_INFORMATION"
  | "RESOLVED"
  | "CLOSED"
  | "REOPENED"
  | "REJECTED"
  | "HIGH"
  | "MEDIUM"
  | "LOW"
  | "EMERGENCY"
  | "DEFAULT";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: string;
  variant?: BadgeVariant;
  dot?: boolean;
}

const statusMap: Record<string, { bg: string; text: string; label: string }> = {
  SUBMITTED: { bg: "bg-amber-100", text: "text-amber-800", label: "Submitted" },
  TRIAGED: { bg: "bg-purple-100", text: "text-purple-800", label: "Triaged" },
  ASSIGNED: { bg: "bg-blue-100", text: "text-blue-800", label: "Assigned" },
  IN_PROGRESS: { bg: "bg-indigo-100", text: "text-indigo-800", label: "In Progress" },
  NEEDS_INFORMATION: { bg: "bg-orange-100", text: "text-orange-800", label: "Needs Info" },
  RESOLVED: { bg: "bg-emerald-100", text: "text-emerald-800", label: "Resolved" },
  CLOSED: { bg: "bg-slate-100", text: "text-slate-800", label: "Closed" },
  REOPENED: { bg: "bg-rose-100", text: "text-rose-800", label: "Reopened" },
  REJECTED: { bg: "bg-red-100", text: "text-red-800", label: "Rejected" },
  UNDER_REVIEW: { bg: "bg-sky-100", text: "text-sky-800", label: "Under Review" },
  APPROVED: { bg: "bg-emerald-100", text: "text-emerald-800", label: "Approved" },
  EMERGENCY: { bg: "bg-red-600 text-white", text: "text-white font-bold", label: "Emergency" },
  HIGH: { bg: "bg-red-100", text: "text-red-800", label: "High" },
  MEDIUM: { bg: "bg-amber-100", text: "text-amber-800", label: "Medium" },
  LOW: { bg: "bg-slate-100", text: "text-slate-700", label: "Low" },
};

export const Badge: React.FC<BadgeProps> = ({ status, variant, dot = true, children, className, ...props }) => {
  const key = (variant || status || "DEFAULT").toUpperCase();
  const meta = statusMap[key] || { bg: "bg-slate-100", text: "text-slate-800", label: key };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold",
        meta.bg,
        meta.text,
        className
      )}
      {...props}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />}
      {children || meta.label}
    </span>
  );
};
