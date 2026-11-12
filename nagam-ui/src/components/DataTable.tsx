import React from "react";
import { cn } from "../lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
  className?: string;
  onRowClick?: (item: T) => void;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = "No records found.",
  className,
  onRowClick,
}: DataTableProps<T>) {
  return (
    <div className={cn("w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm", className)}>
      <table className="w-full text-left text-sm text-slate-700">
        <thead className="bg-[#EAF1F6] text-xs font-bold uppercase tracking-wider text-[#142F58] border-b border-slate-200">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={cn("px-6 py-3.5", col.className)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr
                key={keyExtractor(item)}
                onClick={() => onRowClick && onRowClick(item)}
                className={cn(
                  "hover:bg-slate-50/80 transition-colors duration-150",
                  onRowClick && "cursor-pointer"
                )}
              >
                {columns.map((col) => (
                  <td key={col.key} className={cn("px-6 py-4", col.className)}>
                    {col.render ? col.render(item) : (item as any)[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
