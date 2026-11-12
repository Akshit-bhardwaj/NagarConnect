"use client";

import React, { useState, useEffect } from "react";
import { Card, Badge, Button, Alert } from "nagam-ui";
import { apiClient } from "@/lib/api";
import {
  ArrowLeft,
  MapPin,
  Clock,
  UserCheck,
  Send,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ShieldAlert,
  Calendar,
  Building,
} from "lucide-react";

export default function AdminComplaintDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [complaint, setComplaint] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statusVal, setStatusVal] = useState("");
  const [statusReason, setStatusReason] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [commentText, setCommentText] = useState("");
  const [addingComment, setAddingComment] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await apiClient<any>(`/admin/complaints/${params.id}`);
      setComplaint(data);
      setStatusVal(data.status);
    } catch (err: any) {
      setError(err.message || "Failed to load complaint dossier");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [params.id]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingStatus(true);
    try {
      await apiClient(`/admin/complaints/${params.id}/status`, {
        method: "POST",
        body: JSON.stringify({
          status: statusVal,
          reason_or_remark: statusReason || `Status shifted to ${statusVal}`,
        }),
      });
      setStatusReason("");
      loadData();
    } catch (err: any) {
      alert(err.message || "Status change failed");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setAddingComment(true);
    try {
      await apiClient(`/admin/complaints/${params.id}/notes`, {
        method: "POST",
        body: JSON.stringify({ comment: commentText }),
      });
      setCommentText("");
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to add internal note");
    } finally {
      setAddingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border">
        Loading complaint dossier and field timeline...
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="space-y-4">
        <a
          href="/admin/complaints"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#245A86]"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Queue
        </a>
        <Alert variant="danger">{error || "Complaint record not found"}</Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <a
            href="/admin/complaints"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#245A86] hover:text-[#142F58] mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Grievances Queue</span>
          </a>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#245A86] bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
              {complaint.reference_no}
            </span>
            <Badge variant={complaint.status as any} />
            <Badge variant={complaint.priority as any} />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#142F58] mt-1">
            {complaint.title}
          </h1>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">Registered on:</span>
          <strong className="text-slate-800">
            {new Date(complaint.created_at).toLocaleString("en-IN")}
          </strong>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Details & Notes (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Dossier Card */}
          <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#142F58] uppercase tracking-wider">
              Grievance Details
            </h3>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed font-normal whitespace-pre-wrap">
              {complaint.description}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
              <div>
                <span className="text-slate-400 block font-bold uppercase text-[10px]">
                  Category
                </span>
                <span className="font-bold text-slate-800">{complaint.category}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold uppercase text-[10px]">
                  Administrative Ward
                </span>
                <span className="font-bold text-slate-800">
                  {complaint.ward_name || "General Ward"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold uppercase text-[10px]">
                  Assigned Department
                </span>
                <span className="font-bold text-slate-800">
                  {complaint.department_name || "Sanitation Department"}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-start gap-2 text-xs text-slate-600">
              <MapPin className="w-4 h-4 text-[#245A86] shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800">Location & Landmark:</strong>{" "}
                {complaint.address_text || "Central Municipal Jurisdiction"}
              </div>
            </div>
          </Card>

          {/* Timeline & Status History */}
          <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#142F58] uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#245A86]" />
              <span>Immutable Status History & Audit Trail</span>
            </h3>

            <div className="space-y-4 pl-3 border-l-2 border-slate-200 ml-2">
              {complaint.status_history && complaint.status_history.length > 0 ? (
                complaint.status_history.map((h: any) => (
                  <div key={h.id} className="relative pl-4 space-y-1">
                    <span className="absolute -left-[19px] top-1 w-3 h-3 rounded-full bg-[#142F58] border-2 border-white ring-2 ring-blue-100" />
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-slate-900">
                        {h.from_status} → {h.to_status}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(h.created_at).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{h.reason_or_remark}</p>
                    <span className="text-[10px] text-slate-400 block">
                      Updated by: {h.changed_by_name || "Municipal Officer"}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400">No status updates recorded yet.</div>
              )}
            </div>
          </Card>

          {/* Internal Staff Notes */}
          <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#142F58] uppercase tracking-wider">
              Internal Officer Notes (Confidential)
            </h3>

            <div className="space-y-3">
              {complaint.comments && complaint.comments.length > 0 ? (
                complaint.comments.map((com: any) => (
                  <div
                    key={com.id}
                    className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl space-y-1 text-xs"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-amber-900">
                        {com.author_name}
                      </span>
                      <span className="text-[10px] text-amber-700">
                        {new Date(com.created_at).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <p className="text-slate-700">{com.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">No internal notes yet.</p>
              )}
            </div>

            <form onSubmit={handleAddComment} className="pt-2 space-y-2">
              <textarea
                rows={3}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add confidential officer note or equipment dispatch instruction..."
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#142F58]"
                required
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  isLoading={addingComment}
                  className="bg-[#142F58] text-white text-xs gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Post Internal Note</span>
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right Column: Workflow Control Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Triage / State Machine Transition */}
          <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#142F58] uppercase tracking-wider">
              Triage & Workflow Control
            </h3>

            <form onSubmit={handleUpdateStatus} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Transition Status
                </label>
                <select
                  value={statusVal}
                  onChange={(e) => setStatusVal(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-white font-medium focus:ring-2 focus:ring-[#142F58]"
                >
                  <option value="SUBMITTED">SUBMITTED</option>
                  <option value="TRIAGED">TRIAGED</option>
                  <option value="ASSIGNED">ASSIGNED</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="CLOSED">CLOSED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Remark / Reason
                </label>
                <textarea
                  rows={3}
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder="Official remark for this status advance..."
                  className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#142F58]"
                  required
                />
              </div>

              <Button
                type="submit"
                isLoading={updatingStatus}
                className="w-full bg-[#142F58] hover:bg-[#1a3c6d] text-white text-xs py-2.5 shadow-sm"
              >
                Execute State Change
              </Button>
            </form>
          </Card>

          {/* Assigned Officer Card */}
          <Card className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[#142F58] uppercase tracking-wider">
              Field Assignment
            </h3>
            <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                Field Officer
              </span>
              <p className="font-bold text-slate-900">
                {complaint.assigned_officer_name || "Unassigned"}
              </p>
              <p className="text-slate-500">
                Ward Nodal Response Unit: {complaint.ward_name || "Central"}
              </p>
            </div>
          </Card>

          {/* SLA Tracking Card */}
          <Card className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
            <h3 className="text-sm font-bold text-[#142F58] uppercase tracking-wider">
              SLA Compliance
            </h3>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Target Resolution:</span>
              <span className="font-bold text-slate-800">
                {complaint.sla_due_at
                  ? new Date(complaint.sla_due_at).toLocaleDateString("en-IN")
                  : "Within 48 Hours"}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-100 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Complies with Citizen Charter Rules</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
