"use client";

import React, { useState, useEffect } from "react";
import { Card, Badge, Button, Input, Select } from "nagam-ui";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import {
  Search,
  Filter,
  Download,
  Clock,
  ArrowRight,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Eye,
  Edit,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  ArrowUpDown,
  Building,
  X,
} from "lucide-react";

export default function ComplaintsManagementPage() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [wardFilter, setWardFilter] = useState("ALL");
  const [slaFilter, setSlaFilter] = useState("ALL");

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Triage / Action Modal state
  const [actionModal, setActionModal] = useState<{
    open: boolean;
    complaint: any | null;
    actionType: "STATUS" | "ASSIGN" | "NOTE" | null;
  }>({
    open: false,
    complaint: null,
    actionType: null,
  });

  const [newStatus, setNewStatus] = useState("IN_PROGRESS");
  const [statusRemark, setStatusRemark] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [assignedOfficer, setAssignedOfficer] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [queueError, setQueueError] = useState<string | null>(null);

  const loadComplaints = async () => {
    try {
      setLoading(true);
      setQueueError(null);
      const data = await apiClient<any[]>("/admin/complaints");
      setComplaints(data || []);
    } catch (err: any) {
      console.error(err);
      setQueueError(err.message || "Failed to retrieve complaints from the server. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  // Filter logic
  const now = new Date();
  const filtered = complaints.filter((c) => {
    // Search
    const matchesSearch =
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.reference_no.toLowerCase().includes(search.toLowerCase()) ||
      (c.ward_name && c.ward_name.toLowerCase().includes(search.toLowerCase())) ||
      (c.assigned_officer_name &&
        c.assigned_officer_name.toLowerCase().includes(search.toLowerCase()));

    // Status
    const matchesStatus =
      statusFilter === "ALL" || c.status.toUpperCase() === statusFilter.toUpperCase();

    // Priority
    const matchesPriority =
      priorityFilter === "ALL" || c.priority.toUpperCase() === priorityFilter.toUpperCase();

    // Category
    const matchesCat =
      categoryFilter === "ALL" || c.category.toUpperCase() === categoryFilter.toUpperCase();

    // Ward
    const matchesWard =
      wardFilter === "ALL" || (c.ward_name && c.ward_name.includes(wardFilter));

    // SLA
    let matchesSla = true;
    if (slaFilter === "BREACHED") {
      matchesSla =
        Boolean(c.sla_due_at) &&
        new Date(c.sla_due_at) < now &&
        !["RESOLVED", "CLOSED"].includes(c.status);
    } else if (slaFilter === "ON_TRACK") {
      matchesSla =
        !c.sla_due_at ||
        new Date(c.sla_due_at) >= now ||
        ["RESOLVED", "CLOSED"].includes(c.status);
    }

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPriority &&
      matchesCat &&
      matchesWard &&
      matchesSla
    );
  });

  // Select All toggle
  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((c) => c.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleExportCSV = () => {
    const headers =
      "Reference No,Title,Category,Ward,Priority,Status,Assigned Officer,Created At\n";
    const rows = filtered
      .map(
        (c) =>
          `"${c.reference_no}","${c.title}","${c.category}","${c.ward_name || "General"}","${c.priority}","${c.status}","${c.assigned_officer_name || "Unassigned"}","${c.created_at}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `NagarConnect_Complaints_Export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionModal.complaint) return;
    setActionError("");

    if (actionModal.actionType === "STATUS" && ["RESOLVED", "CLOSED"].includes(newStatus) && !statusRemark.trim()) {
      setActionError("Please provide an official resolution remark or closure summary.");
      return;
    }
    if (actionModal.actionType === "NOTE" && !internalNote.trim()) {
      setActionError("Internal note comment cannot be empty.");
      return;
    }

    setActionLoading(true);

    try {
      if (actionModal.actionType === "STATUS") {
        await apiClient(`/admin/complaints/${actionModal.complaint.id}/status`, {
          method: "POST",
          body: JSON.stringify({
            status: newStatus,
            reason_or_remark: statusRemark || `Status updated to ${newStatus} by staff`,
          }),
        });
      } else if (actionModal.actionType === "NOTE") {
        await apiClient(`/admin/complaints/${actionModal.complaint.id}/notes`, {
          method: "POST",
          body: JSON.stringify({
            comment: internalNote,
          }),
        });
      }
      setActionModal({ open: false, complaint: null, actionType: null });
      setStatusRemark("");
      setInternalNote("");
      loadComplaints();
    } catch (err: any) {
      setActionError(err.message || "Failed to execute update action.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header matching Image 1 Screen 5 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#245A86] uppercase tracking-wider">
            Operational Grievance Redressal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142F58] tracking-tight">
            Complaints Management Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Total {complaints.length} registered grievances • Multi-tier ward & department filter
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="text-xs gap-1.5 border-slate-200"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </Button>

          <Button
            size="sm"
            onClick={loadComplaints}
            className="bg-[#142F58] text-white text-xs gap-1.5 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Queue</span>
          </Button>
        </div>
      </div>

      {/* Error state banner if fetch fails */}
      {queueError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-xs text-rose-800 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{queueError}</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={loadComplaints}
            className="text-xs border-rose-300 hover:bg-rose-100 text-rose-800"
          >
            Retry Fetch
          </Button>
        </div>
      )}

      {/* Filter Bar matching Image 1 Screen 5 */}
      <Card className="p-4 sm:p-5 bg-white border border-slate-200 shadow-xs space-y-4 rounded-xl">
        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { key: "ALL", label: "All Tickets" },
            { key: "SUBMITTED", label: "New / Submitted" },
            { key: "TRIAGED", label: "Triaged" },
            { key: "ASSIGNED", label: "Assigned" },
            { key: "IN_PROGRESS", label: "In Progress" },
            { key: "RESOLVED", label: "Resolved" },
            { key: "CLOSED", label: "Closed" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setStatusFilter(item.key)}
              className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-all ${
                statusFilter === item.key
                  ? "bg-[#142F58] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Dropdown Filters & Search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2 border-t border-slate-100">
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reference #, subject, ward, citizen..."
              className="w-full pl-9 pr-8 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#142F58]"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-slate-700 font-medium focus:ring-2 focus:ring-[#142F58]"
            >
              <option value="ALL">All Categories</option>
              <option value="Sanitation & Garbage">Sanitation & Garbage</option>
              <option value="Roads & Infrastructure">Roads & Infrastructure</option>
              <option value="Street Lighting">Street Lighting</option>
              <option value="Water Works & Drainage">Water Works & Drainage</option>
              <option value="Public Health">Public Health</option>
            </select>
          </div>

          <div>
            <select
              value={wardFilter}
              onChange={(e) => setWardFilter(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-slate-700 font-medium focus:ring-2 focus:ring-[#142F58]"
            >
              <option value="ALL">All Wards / Zones</option>
              <option value="Hazratganj">Ward 01: Hazratganj</option>
              <option value="Gomti Nagar">Ward 02: Gomti Nagar</option>
              <option value="Chowk">Ward 03: Chowk</option>
              <option value="Aliganj">Ward 04: Aliganj</option>
            </select>
          </div>

          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-slate-700 font-medium focus:ring-2 focus:ring-[#142F58]"
            >
              <option value="ALL">All Priorities</option>
              <option value="EMERGENCY">Emergency (6h SLA)</option>
              <option value="HIGH">High (24h SLA)</option>
              <option value="MEDIUM">Medium (48h SLA)</option>
              <option value="LOW">Low (7d SLA)</option>
            </select>
          </div>
        </div>

        {/* Active Filters Summary Strip */}
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between p-2.5 bg-blue-50/70 border border-blue-200 rounded-lg text-xs text-blue-900">
            <span className="font-bold">
              {selectedIds.length} ticket(s) selected
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedIds([])}
                className="text-xs py-1 px-2 border-blue-300"
              >
                Clear Selection
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Full Grievances Data Table matching Image 1 Screen 5 */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={
                      filtered.length > 0 && selectedIds.length === filtered.length
                    }
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 text-[#142F58] focus:ring-[#142F58]"
                  />
                </th>
                <th className="p-4">Reference & Date</th>
                <th className="p-4">Grievance Subject</th>
                <th className="p-4">Category & Ward</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Assigned Officer</th>
                <th className="p-4">SLA Clock</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="p-4"><div className="w-4 h-4 bg-slate-200 rounded" /></td>
                    <td className="p-4"><div className="w-24 h-4 bg-slate-200 rounded mb-1" /><div className="w-16 h-3 bg-slate-100 rounded" /></td>
                    <td className="p-4"><div className="w-44 h-4 bg-slate-200 rounded mb-1" /><div className="w-28 h-3 bg-slate-100 rounded" /></td>
                    <td className="p-4"><div className="w-24 h-4 bg-slate-200 rounded mb-1" /><div className="w-16 h-3 bg-slate-100 rounded" /></td>
                    <td className="p-4"><div className="w-16 h-5 bg-slate-200 rounded-full" /></td>
                    <td className="p-4"><div className="w-20 h-4 bg-slate-200 rounded" /></td>
                    <td className="p-4"><div className="w-16 h-4 bg-slate-200 rounded" /></td>
                    <td className="p-4"><div className="w-20 h-5 bg-slate-200 rounded-full" /></td>
                    <td className="p-4 text-right"><div className="w-16 h-7 bg-slate-200 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center">
                    <div className="max-w-sm mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                        <Search className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800">
                        {search ? `No tickets matching "${search}"` : "No complaints found"}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {search || statusFilter !== "ALL" || categoryFilter !== "ALL" || wardFilter !== "ALL"
                          ? "Try clearing some filters or refining your search keywords."
                          : "No municipal grievances have been registered in this queue yet."}
                      </p>
                      {(search || statusFilter !== "ALL" || categoryFilter !== "ALL" || wardFilter !== "ALL") && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSearch("");
                            setStatusFilter("ALL");
                            setCategoryFilter("ALL");
                            setWardFilter("ALL");
                            setPriorityFilter("ALL");
                            setSlaFilter("ALL");
                          }}
                          className="text-xs mx-auto"
                        >
                          Reset All Filters
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const isBreached =
                    Boolean(c.sla_due_at) &&
                    new Date(c.sla_due_at) < now &&
                    !["RESOLVED", "CLOSED"].includes(c.status);

                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(c.id)}
                          onChange={() => toggleSelectOne(c.id)}
                          className="rounded border-slate-300 text-[#142F58] focus:ring-[#142F58]"
                        />
                      </td>

                      <td className="p-4 font-mono">
                        <a
                          href={`/admin/complaints/${c.id}`}
                          className="font-bold text-[#245A86] hover:underline block"
                        >
                          {c.reference_no}
                        </a>
                        <span className="text-[10px] text-slate-400">
                          {new Date(c.created_at).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </td>

                      <td className="p-4 max-w-xs">
                        <p className="font-bold text-slate-900 truncate">{c.title}</p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {c.description}
                        </p>
                      </td>

                      <td className="p-4">
                        <span className="font-medium text-slate-800 block">
                          {c.category}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {c.ward_name || "Central Zone"}
                        </span>
                      </td>

                      <td className="p-4">
                        <Badge variant={c.priority as any} />
                      </td>

                      <td className="p-4">
                        {c.assigned_officer_name ? (
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="font-medium text-slate-800">
                              {c.assigned_officer_name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            Unassigned
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        {isBreached ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            <Clock className="w-3 h-3 text-rose-600" />
                            <span>BREACHED</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>On Track</span>
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        <Badge variant={c.status as any} />
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            title="Update Status"
                            onClick={() =>
                              setActionModal({
                                open: true,
                                complaint: c,
                                actionType: "STATUS",
                              })
                            }
                            className="p-1.5 rounded-md hover:bg-slate-200 text-slate-600 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            title="Add Internal Note"
                            onClick={() =>
                              setActionModal({
                                open: true,
                                complaint: c,
                                actionType: "NOTE",
                              })
                            }
                            className="p-1.5 rounded-md hover:bg-slate-200 text-slate-600 transition-colors"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>

                          <a
                            href={`/admin/complaints/${c.id}`}
                            className="p-1.5 rounded-md hover:bg-slate-200 text-[#142F58] font-bold transition-colors"
                            title="Open Dossier"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer & Pagination */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>
            Showing <strong>1 to {filtered.length}</strong> of{" "}
            <strong>{filtered.length}</strong> entries
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled
              className="text-xs p-1.5 border-slate-200"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="font-bold text-[#142F58]">Page 1 of 1</span>
            <Button
              variant="outline"
              size="sm"
              disabled
              className="text-xs p-1.5 border-slate-200"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Action Modal (Status Update or Internal Note) */}
      {actionModal.open && actionModal.complaint && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-mono font-bold text-[#245A86]">
                  {actionModal.complaint.reference_no}
                </span>
                <h3 className="text-base font-bold text-[#142F58]">
                  {actionModal.actionType === "STATUS"
                    ? "Advance Grievance Status"
                    : "Add Staff Internal Note"}
                </h3>
              </div>
              <button
                onClick={() =>
                  setActionModal({ open: false, complaint: null, actionType: null })
                }
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {actionError && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {actionError}
              </div>
            )}

            <form onSubmit={handleSaveAction} className="space-y-4">
              {actionModal.actionType === "STATUS" && (
                <>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Target State Transition
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-white font-medium focus:ring-2 focus:ring-[#142F58]"
                    >
                      <option value="TRIAGED">TRIAGED (Accepted by Supervisor)</option>
                      <option value="ASSIGNED">ASSIGNED (Sent to Field Officer)</option>
                      <option value="IN_PROGRESS">IN_PROGRESS (Under Inspection/Repair)</option>
                      <option value="RESOLVED">RESOLVED (Site Work Complete)</option>
                      <option value="CLOSED">CLOSED (Final Closure)</option>
                      <option value="REJECTED">REJECTED (Invalid / Duplicate)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Reason / Field Inspection Note
                    </label>
                    <textarea
                      rows={3}
                      value={statusRemark}
                      onChange={(e) => setStatusRemark(e.target.value)}
                      placeholder="e.g. Field inspection conducted by sanitation crew. Dustbin cleared."
                      className="w-full text-xs border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-[#142F58]"
                      required
                    />
                  </div>
                </>
              )}

              {actionModal.actionType === "NOTE" && (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Internal Note (Visible to Municipal Staff Only)
                  </label>
                  <textarea
                    rows={4}
                    value={internalNote}
                    onChange={(e) => setInternalNote(e.target.value)}
                    placeholder="Enter confidential notes, procurement requirements, or contractor notes..."
                    className="w-full text-xs border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-[#142F58]"
                    required
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setActionModal({ open: false, complaint: null, actionType: null })
                  }
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={actionLoading}
                  className="bg-[#142F58] hover:bg-[#1a3c6d] text-white text-xs"
                >
                  Confirm & Update
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
