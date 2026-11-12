import React from "react";
import { cn } from "../lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const textareaId = id || props.name;
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-semibold text-slate-700">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={props.rows || 4}
          className={cn(
            "w-full px-3.5 py-2.5 rounded-lg border text-sm transition-colors duration-150",
            "bg-white text-slate-900 placeholder:text-slate-400",
            "focus:outline-none focus:ring-2 focus:ring-[#142F58] focus:border-transparent",
            error ? "border-red-500 ring-1 ring-red-500" : "border-slate-300",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
        {helperText && !error && <p className="text-xs text-slate-500">{helperText}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
