"use client";

import React, { useState, useEffect } from "react";
import { Card, Badge, Button } from "nagam-ui";
import { apiClient } from "@/lib/api";
import { PlusCircle, Search, Clock, ArrowRight, Loader2, AlertCircle, RefreshCw, X } from "lucide-react";

export default function ComplaintsListPage() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadComplaints = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiClient<any[]>("/citizen/complaints");
      setComplaints(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load complaints from municipal servers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const filtered = complaints.filter((c) => {
    // 1. Tab filter
    if (filter === "ACTIVE" && !["SUBMITTED", "TRIAGED", "ASSIGNED", "IN_PROGRESS"].includes(c.status)) return false;
    if (filter === "RESOLVED" && !["RESOLVED", "CLOSED"].includes(c.status)) return false;

    // 2. Search query filter (Reference No, Title, Category, Ward, Description)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchRef = c.reference_no?.toLowerCase().includes(q);
      const matchTitle = c.title?.toLowerCase().includes(q);
      const matchCat = c.category?.toLowerCase().includes(q);
      const matchWard = c.ward_name?.toLowerCase().includes(q);
      const matchDesc = c.description?.toLowerCase().includes(q);
      if (!matchRef && !matchTitle && !matchCat && !matchWard && !matchDesc) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#142F58]">My Registered Grievances</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            View history, officer notes, and track field inspection progress.
          </p>
        </div>
        <Button
          onClick={() => (window.location.href = "/citizen/complaints/new")}
          className="bg-[#142F58] text-white gap-2 shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>File New Grievance</span>
        </Button>
      </div>

      {/* Search Bar & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        {/* Search input with live searching state */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID (e.g. CMP-...), title, landmark, or category..."
            className="w-full pl-10 pr-9 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#142F58] bg-slate-50/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl shrink-0">
          {[
            { key: "ALL", label: `All (${complaints.length})` },
            { key: "ACTIVE", label: "Active" },
            { key: "RESOLVED", label: "Resolved" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                filter === f.key
                  ? "bg-white text-[#142F58] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error State with Retry Button */}
      {error && (
        <Card className="p-6 bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-rose-600 shrink-0" />
            <div>
              <p className="font-bold text-sm">Failed to connect to grievance service</p>
              <p className="text-xs text-rose-700">{error}</p>
            </div>
          </div>
          <Button
            onClick={loadComplaints}
            variant="outline"
            size="sm"
            className="border-rose-300 text-rose-900 hover:bg-rose-100 gap-1.5 shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </Button>
        </Card>
      )}

      {/* Loading Skeleton State */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <Card key={n} className="p-5 border border-slate-200 animate-pulse space-y-3">
              <div className="flex justify-between items-center">
                <div className="w-28 h-5 bg-slate-200 rounded" />
                <div className="w-20 h-5 bg-slate-200 rounded" />
              </div>
              <div className="w-3/4 h-5 bg-slate-200 rounded" />
              <div className="w-full h-3 bg-slate-100 rounded" />
              <div className="flex gap-4 pt-1">
                <div className="w-24 h-3 bg-slate-100 rounded" />
                <div className="w-24 h-3 bg-slate-100 rounded" />
              </div>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        /* Empty States (Search empty vs Category empty) */
        <Card className="p-12 text-center text-slate-500 space-y-3 bg-white border border-slate-200 rounded-2xl">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            {searchQuery ? <Search className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base">
              {searchQuery ? "No matching grievances found" : "No grievances in this category"}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `No grievances match "${searchQuery}". Try checking for typos or searching by Reference ID.`
                : "Grievances registered by you will appear here with live tracking status."}
            </p>
          </div>
          {searchQuery ? (
            <Button
              onClick={() => setSearchQuery("")}
              variant="outline"
              size="sm"
              className="text-xs border-slate-300"
            >
              Clear Search Query
            </Button>
          ) : (
            <Button
              onClick={() => (window.location.href = "/citizen/complaints/new")}
              size="sm"
              className="bg-[#142F58] text-white text-xs font-bold"
            >
              Lodge a Complaint
            </Button>
          )}
        </Card>
      ) : (
        /* Results List */
        <div className="space-y-3">
          {filtered.map((c) => (
            <Card
              key={c.id}
              onClick={() => (window.location.href = `/citizen/complaints/${c.id}`)}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:border-[#142F58] transition-all bg-white border border-slate-200 rounded-2xl shadow-2xs hover:shadow-sm"
            >
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#245A86] bg-blue-50 px-2.5 py-0.5 rounded border border-blue-100">
                    {c.reference_no}
                  </span>
                  <Badge variant={c.status as any} />
                  <Badge variant={c.priority as any} />
                </div>
                <h3 className="text-base font-bold text-slate-900">{c.title}</h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{c.description}</p>
                <div className="flex flex-wrap gap-4 text-xs text-slate-400 pt-1">
                  <span>Category: <strong className="text-slate-600">{c.category}</strong></span>
                  <span>Ward: <strong className="text-slate-600">{c.ward_name || "Central"}</strong></span>
                  <span>Registered: <strong className="text-slate-600">{new Date(c.created_at).toLocaleDateString("en-IN")}</strong></span>
                </div>
              </div>

              <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-3 sm:pt-0">
                {c.sla_due_at && (
                  <div className="flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 font-semibold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>SLA: {new Date(c.sla_due_at).toLocaleDateString("en-IN")}</span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-xs font-bold text-[#142F58] hover:underline">
                  <span>Track Dossier</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
