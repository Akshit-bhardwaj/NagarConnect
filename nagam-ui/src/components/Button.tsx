import React from "react";
import { cn } from "../lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-lg";
    
    const variants = {
      primary: "bg-[#142F58] text-white hover:bg-[#1E457E] focus-visible:ring-[#142F58] shadow-sm",
      secondary: "bg-[#245A86] text-white hover:bg-[#2D6F9C] focus-visible:ring-[#245A86]",
      outline: "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 focus-visible:ring-[#142F58]",
      ghost: "text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-400",
      danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600 shadow-sm",
      success: "bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-600 shadow-sm",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-10 px-4 text-sm gap-2",
      lg: "h-12 px-6 text-base gap-2.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {!isLoading && leftIcon}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);
Button.displayName = "Button";
