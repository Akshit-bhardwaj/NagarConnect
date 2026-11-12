import React from "react";
import { cn } from "../lib/utils";
import { Check, Clock, AlertCircle } from "lucide-react";

export interface TimelineItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  actor?: string;
  status?: "completed" | "current" | "upcoming";
}

export interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({ items, className }) => {
  return (
    <div className={cn("relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200", className)}>
      {items.map((item, idx) => {
        const isCompleted = item.status === "completed" || idx < items.length - 1;
        return (
          <div key={item.id} className="relative group">
            <div
              className={cn(
                "absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center text-white ring-4 ring-white",
                isCompleted ? "bg-emerald-600" : "bg-[#245A86]"
              )}
            >
              {isCompleted ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h5 className="text-sm font-bold text-slate-900">{item.title}</h5>
                <span className="text-xs text-slate-400">{item.timestamp}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
              {item.actor && <p className="text-[11px] font-medium text-slate-400">By {item.actor}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
};
