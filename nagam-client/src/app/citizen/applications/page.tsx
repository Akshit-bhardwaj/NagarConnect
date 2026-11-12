"use client";

import React, { useState, useEffect } from "react";
import { Card, Badge, Button } from "nagam-ui";
import { apiClient } from "@/lib/api";
import { FileText, PlusCircle, Clock, ArrowRight, Search, X, AlertCircle, RefreshCw } from "lucide-react";

export default function ApplicationsListPage() {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [error, setError] = useState("");

  const fetchApps = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiClient<any[]>("/citizen/applications");
      setApps(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load service applications from municipal registry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const filtered = apps.filter((a) => {
    // 1. Status Filter
    if (filter === "PENDING" && !["SUBMITTED", "PENDING", "UNDER_REVIEW"].includes(a.status)) return false;
    if (filter === "APPROVED" && a.status !== "APPROVED") return false;
    if (filter === "REJECTED" && a.status !== "REJECTED") return false;

    // 2. Search Query (Reference No, Service Title, Remarks)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchRef = a.reference_no?.toLowerCase().includes(q);
      const matchTitle = a.service_title?.toLowerCase().includes(q);
      const matchRemarks = a.remarks?.toLowerCase().includes(q);
      if (!matchRef && !matchTitle && !matchRemarks) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#142F58]">My Civic Service Applications</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Track certificate verification, fee approvals, and department processing.
          </p>
        </div>
        <Button
          onClick={() => (window.location.href = "/citizen/applications/new")}
          className="bg-[#142F58] text-white gap-2 shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Apply for New Service</span>
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
            placeholder="Search by Application Ref (APP-...), title, or remarks..."
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
            { key: "ALL", label: `All (${apps.length})` },
            { key: "PENDING", label: "In Review" },
            { key: "APPROVED", label: "Approved" },
            { key: "REJECTED", label: "Rejected" },
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
              <p className="font-bold text-sm">Failed to connect to application service</p>
              <p className="text-xs text-rose-700">{error}</p>
            </div>
          </div>
          <Button
            onClick={fetchApps}
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
            <Card key={n} className="p-6 border border-slate-200 animate-pulse space-y-3">
              <div className="flex justify-between items-center">
                <div className="w-28 h-5 bg-slate-200 rounded" />
                <div className="w-20 h-5 bg-slate-200 rounded" />
              </div>
              <div className="w-2/3 h-5 bg-slate-200 rounded" />
              <div className="w-full h-3 bg-slate-100 rounded" />
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center text-slate-500 space-y-3 bg-white border border-slate-200 rounded-2xl">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            {searchQuery ? <Search className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">
              {searchQuery ? "No matching applications found" : "No applications submitted"}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              {searchQuery
                ? `No applications match "${searchQuery}". Check your reference number.`
                : "You can apply online for birth/death certificates, water pipeline connections, and trade licenses."}
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
              onClick={() => (window.location.href = "/citizen/applications/new")}
              size="sm"
              className="bg-[#142F58] text-white text-xs font-bold"
            >
              Apply for Civic Service
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((a) => (
            <Card key={a.id} className="p-6 space-y-3 bg-white border border-slate-200 rounded-2xl shadow-2xs hover:shadow-sm transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#245A86] bg-blue-50 px-2.5 py-0.5 rounded border border-blue-100">
                    {a.reference_no}
                  </span>
                  <Badge variant={a.status as any} />
                </div>
                <span className="text-xs text-slate-400">
                  Applied: {new Date(a.created_at).toLocaleDateString("en-IN")}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900">{a.service_title}</h3>
              <p className="text-xs text-slate-600">
                <strong className="text-slate-700">Current Remarks:</strong> {a.remarks || "Under review by municipal department."}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
