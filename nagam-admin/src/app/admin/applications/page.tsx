"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, Badge, Button, Input } from "nagam-ui";
import { apiClient } from "@/lib/api";
import {
  FileCheck,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  User,
  Building,
  Calendar,
  AlertCircle,
  Download,
  RefreshCw,
  Eye,
  Check,
  X,
} from "lucide-react";

export default function ServiceApplicationsAdminPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Decision Modal State
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [decisionAction, setDecisionAction] = useState<"APPROVED" | "REJECTED">("APPROVED");
  const [decisionRemarks, setDecisionRemarks] = useState("");
  const [modalError, setModalError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [successToast, setSuccessToast] = useState("");
  const [fetchError, setFetchError] = useState<string | null>(null);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const data = await apiClient<any[]>("/admin/applications");
      setApplications(data || []);
    } catch (err: any) {
      console.error("Failed to load service applications:", err);
      setFetchError(err.message || "Failed to load service applications from municipal registry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleDecisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    if (decisionAction === "REJECTED" && !decisionRemarks.trim()) {
      setModalError("Rejection remarks are mandatory to inform the applicant why their application was rejected.");
      return;
    }
    setModalError("");

    try {
      setActionLoading(true);
      await apiClient(`/admin/applications/${selectedApp.id}/decide`, {
        method: "POST",
        body: JSON.stringify({
          status: decisionAction,
          reason_or_remark: decisionRemarks || `Application ${decisionAction.toLowerCase()} by municipal administration.`,
        }),
      });

      setSuccessToast(`Application #${selectedApp.application_number} marked as ${decisionAction}!`);
      setTimeout(() => setSuccessToast(""), 3500);
      setSelectedApp(null);
      setDecisionRemarks("");
      await loadApplications();
    } catch (err: any) {
      setModalError(err.message || "Failed to submit decision.");
    } finally {
      setActionLoading(false);
    }
  };

  // Filter applications
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        (app.application_number && app.application_number.toLowerCase().includes(q)) ||
        (app.service_name && app.service_name.toLowerCase().includes(q)) ||
        (app.citizen_name && app.citizen_name.toLowerCase().includes(q));
      const matchesStatus = statusFilter === "ALL" || app.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [applications, searchQuery, statusFilter]);

  // Dynamic KPI Stats
  const totalCount = applications.length;
  const pendingCount = applications.filter((a) => a.status === "SUBMITTED" || a.status === "UNDER_REVIEW").length;
  const approvedCount = applications.filter((a) => a.status === "APPROVED").length;
  const rejectedCount = applications.filter((a) => a.status === "REJECTED").length;

  return (
    <div className="space-y-7">
      {/* Success Notification Banner */}
      {successToast && (
        <div className="p-4 rounded-xl bg-emerald-500 text-white font-bold text-xs flex items-center justify-between shadow-lg animate-in slide-in-from-top-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast("")} className="text-white/80 hover:text-white">✕</button>
        </div>
      )}

      {/* Page Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-[#142F58]">
                Municipal Citizen Services
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-500">Live Verification Desk</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142F58] tracking-tight">
              Service Applications & E-Permits
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Scrutinize, verify KYC documentation, and issue digital municipal certificates and licenses.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              onClick={loadApplications}
              className="bg-[#142F58] hover:bg-[#1a3c6d] text-white text-xs gap-1.5 shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh Records</span>
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-white border border-slate-200 shadow-xs rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Received</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#142F58] flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#142F58]">{totalCount}</div>
          <p className="text-[11px] text-slate-400">All statutory citizen service filings</p>
        </Card>

        <Card className="p-5 bg-white border border-slate-200 shadow-xs rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Action</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-600">{pendingCount}</div>
          <p className="text-[11px] text-amber-700 font-semibold">Requires desk verification</p>
        </Card>

        <Card className="p-5 bg-white border border-slate-200 shadow-xs rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Approved & Issued</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">{approvedCount}</div>
          <p className="text-[11px] text-emerald-700 font-semibold">E-Certificates dispatched</p>
        </Card>

        <Card className="p-5 bg-white border border-slate-200 shadow-xs rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rejected</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-600">{rejectedCount}</div>
          <p className="text-[11px] text-rose-700 font-semibold">Deficient documentation</p>
        </Card>
      </div>

      {/* Error state banner if fetch fails */}
      {fetchError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-xs text-rose-800 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{fetchError}</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={loadApplications}
            className="text-xs border-rose-300 hover:bg-rose-100 text-rose-800"
          >
            Retry Fetch
          </Button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by application #, service title, or citizen name..."
            className="w-full pl-10 pr-8 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#142F58] bg-white shadow-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs border border-slate-200 rounded-xl px-3.5 py-2 bg-white text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-[#142F58] shadow-xs"
        >
          <option value="ALL">All Statuses ({applications.length})</option>
          <option value="SUBMITTED">Submitted ({applications.filter((a) => a.status === "SUBMITTED").length})</option>
          <option value="UNDER_REVIEW">Under Review ({applications.filter((a) => a.status === "UNDER_REVIEW").length})</option>
          <option value="APPROVED">Approved ({applications.filter((a) => a.status === "APPROVED").length})</option>
          <option value="REJECTED">Rejected ({applications.filter((a) => a.status === "REJECTED").length})</option>
        </select>
      </div>

      {/* Applications Table / Cards */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Card key={idx} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs animate-pulse flex flex-col lg:flex-row justify-between gap-4">
              <div className="space-y-2.5 flex-1">
                <div className="flex gap-2">
                  <div className="w-24 h-4 bg-slate-200 rounded" />
                  <div className="w-16 h-4 bg-slate-200 rounded" />
                </div>
                <div className="w-64 h-5 bg-slate-200 rounded" />
                <div className="flex gap-4">
                  <div className="w-28 h-3 bg-slate-100 rounded" />
                  <div className="w-20 h-3 bg-slate-100 rounded" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-20 h-8 bg-slate-200 rounded-lg" />
                <div className="w-20 h-8 bg-slate-200 rounded-lg" />
              </div>
            </Card>
          ))}
        </div>
      ) : filteredApps.length === 0 ? (
        <Card className="p-12 text-center bg-white border border-slate-200 rounded-2xl">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <p className="text-base font-bold text-slate-800">
            {searchQuery ? `No applications matching "${searchQuery}"` : "No matching applications found"}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {searchQuery || statusFilter !== "ALL"
              ? "Try adjusting search query or status filter."
              : "No service filings currently logged in municipal jurisdiction."}
          </p>
          {(searchQuery || statusFilter !== "ALL") && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("ALL");
              }}
              className="text-xs mx-auto mt-4"
            >
              Reset Filters
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredApps.map((app) => (
            <Card
              key={app.id}
              className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-[#142F58] transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#245A86] bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                    {app.application_number}
                  </span>
                  <Badge variant={app.status as any} />
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{new Date(app.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {app.service_name || "Municipal Certificate / Clearance"}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                    <span>Citizen: <strong className="text-slate-800">{app.citizen_name || "Citizen Applicant"}</strong></span>
                    <span>City: <strong className="text-slate-800">{app.city_name || "Lucknow"}</strong></span>
                    <span>Ward: <strong className="text-slate-800">{app.ward_name || "Central Jurisdiction"}</strong></span>
                  </div>
                </div>

                {app.remarks && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                    <strong>Nodal Remarks:</strong> {app.remarks}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0">
                {app.status === "SUBMITTED" || app.status === "UNDER_REVIEW" ? (
                  <>
                    <Button
                      onClick={() => {
                        setSelectedApp(app);
                        setDecisionAction("APPROVED");
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 px-4 py-2 shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedApp(app);
                        setDecisionAction("REJECTED");
                      }}
                      className="text-rose-600 border-rose-200 hover:bg-rose-50 text-xs gap-1.5 px-4 py-2"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </Button>
                  </>
                ) : (
                  <span className="text-xs font-bold text-slate-400 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                    Decision Concluded
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Decision Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#142F58] flex items-center gap-2">
                {decisionAction === "APPROVED" ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-600" />
                )}
                <span>Confirm Application {decisionAction}</span>
              </h3>
              <button onClick={() => setSelectedApp(null)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
            </div>

            <div className="text-xs space-y-2">
              <p className="text-slate-600">
                You are about to issue a statutory decision on application{" "}
                <strong className="text-slate-900">{selectedApp.application_number}</strong> ({selectedApp.service_name}).
              </p>
              <div className="p-3 rounded-lg bg-blue-50 text-[#142F58] border border-blue-100">
                <span>The applicant will receive an immediate real-time SSE notification and updated certificate status.</span>
              </div>
            </div>

            <form onSubmit={handleDecisionSubmit} className="space-y-4 pt-1">
              {modalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Official Remarks / Justification {decisionAction === "REJECTED" && <span className="text-rose-500">*</span>}
                </label>
                <textarea
                  rows={3}
                  value={decisionRemarks}
                  onChange={(e) => setDecisionRemarks(e.target.value)}
                  placeholder={
                    decisionAction === "APPROVED"
                      ? "All submitted KYC documents verified. Clearance granted under municipal charter."
                      : "Document mismatch in identity proof. Please resubmit with valid municipal affidavit."
                  }
                  className="w-full text-xs border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#142F58]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setSelectedApp(null)} className="text-xs">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={actionLoading}
                  className={`text-xs text-white ${
                    decisionAction === "APPROVED" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
                  }`}
                >
                  Confirm & Submit Decision
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
