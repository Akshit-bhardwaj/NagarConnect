"use client";

import React, { useState, useEffect } from "react";
import { Card, Badge } from "nagam-ui";
import { apiClient } from "@/lib/api";
import { Calendar } from "lucide-react";

interface NoticeItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  department_name?: string;
  created_at: string;
}

export default function NoticesPage() {
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotices() {
      try {
        setLoading(true);
        const url = categoryFilter ? `/public/notices?category=${categoryFilter}` : "/public/notices";
        const data = await apiClient<NoticeItem[]>(url);
        setNotices(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchNotices();
  }, [categoryFilter]);

  const categories = ["ALL", "GENERAL", "TENDER", "ADVISORY", "WATER", "SANITATION"];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <span className="text-xs font-bold text-[#245A86] uppercase tracking-wider">Public Notices</span>
        <h1 className="text-3xl font-extrabold text-[#142F58]">Notices, Tenders & Official Advisories</h1>
        <p className="text-sm text-slate-500 mt-1">
          Stay informed on municipal tenders, scheduled pipeline maintenance, and public health advisories.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat === "ALL" ? "" : cat)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              (categoryFilter === "" && cat === "ALL") || categoryFilter === cat
                ? "bg-[#142F58] text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading published notices...</div>
        ) : notices.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-500">
            No notices found for the selected category.
          </div>
        ) : (
          notices.map((n) => (
            <Card key={n.id} className="p-6 space-y-4 hover:border-[#142F58] transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Badge variant="SUBMITTED" status={n.category} />
                  {n.department_name && (
                    <span className="text-xs font-semibold text-slate-500">{n.department_name}</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {new Date(n.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900 leading-snug">{n.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{n.summary}</p>
                <div className="mt-3 p-4 rounded-lg bg-slate-50 text-xs text-slate-700 whitespace-pre-line border border-slate-100">
                  {n.content}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
