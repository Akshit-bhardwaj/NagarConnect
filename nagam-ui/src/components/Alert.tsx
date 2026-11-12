import React from "react";
import { cn } from "../lib/utils";
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "success" | "warning" | "danger";
  title?: string;
}

const icons = {
  info: <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />,
  success: <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />,
  danger: <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />,
};

const variants = {
  info: "bg-blue-50 border-blue-200 text-blue-900",
  success: "bg-emerald-50 border-emerald-200 text-emerald-900",
  warning: "bg-amber-50 border-amber-200 text-amber-900",
  danger: "bg-red-50 border-red-200 text-red-900",
};

export const Alert: React.FC<AlertProps> = ({ variant = "info", title, children, className, ...props }) => {
  return (
    <div
      role="alert"
      className={cn("flex gap-3 p-4 rounded-lg border text-sm", variants[variant], className)}
      {...props}
    >
      {icons[variant]}
      <div className="flex-1 space-y-0.5">
        {title && <h5 className="font-semibold text-slate-900">{title}</h5>}
        <div className="text-slate-700 leading-relaxed">{children}</div>
      </div>
    </div>
  );
};
