"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, Badge, Button, Timeline, Modal, Alert, Textarea } from "nagam-ui";
import { apiClient } from "@/lib/api";
import {
  ArrowLeft,
  Clock,
  MapPin,
  Building,
  User,
  Star,
  MessageSquare,
  CheckCircle2,
  Calendar,
  Download,
} from "lucide-react";
import { generateGrievanceReceiptPDF } from "@/lib/pdf-generator";

export default function ComplaintDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [complaint, setComplaint] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Comment state
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  // Feedback Modal
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const data = await apiClient<any>(`/citizen/complaints/${id}`);
      setComplaint(data);
    } catch (err: any) {
      setError(err.message || "Failed to load grievance details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetails();
  }, [id]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setCommentLoading(true);
    try {
      await apiClient(`/citizen/complaints/${id}/comments`, {
        method: "POST",
        body: JSON.stringify({ comment: newComment }),
      });
      setNewComment("");
      await fetchDetails();
    } catch (err: any) {
      alert(err.message || "Failed to add comment");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleFeedbackSubmit = async () => {
    setFeedbackLoading(true);
    try {
      await apiClient(`/citizen/complaints/${id}/feedback`, {
        method: "POST",
        body: JSON.stringify({ rating, feedback: feedbackText }),
      });
      setIsFeedbackOpen(false);
      await fetchDetails();
    } catch (err: any) {
      alert(err.message || "Failed to submit feedback");
    } finally {
      setFeedbackLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto animate-pulse">
        <div className="h-4 w-32 bg-slate-200 rounded" />
        <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-xs">
          <div className="flex justify-between items-center">
            <div className="h-6 w-48 bg-slate-200 rounded" />
            <div className="h-6 w-24 bg-slate-200 rounded-full" />
          </div>
          <div className="h-4 w-3/4 bg-slate-100 rounded" />
          <div className="h-4 w-1/2 bg-slate-100 rounded" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
            <div className="h-10 bg-slate-100 rounded" />
            <div className="h-10 bg-slate-100 rounded" />
            <div className="h-10 bg-slate-100 rounded" />
            <div className="h-10 bg-slate-100 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="space-y-4 max-w-xl mx-auto pt-8 text-center">
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl space-y-3">
          <p className="text-sm font-bold text-rose-800">{error || "Grievance record not found."}</p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button size="sm" onClick={fetchDetails} className="bg-[#142F58] text-white text-xs">
              Retry Load
            </Button>
            <a
              href="/citizen/complaints"
              className="text-xs font-bold text-slate-700 hover:text-slate-900 inline-flex items-center gap-1 bg-white border border-slate-200 px-3 py-1.5 rounded-lg"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Grievances</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  const timelineItems = (complaint.status_history || []).map((h: any, idx: number) => ({
    id: h.id,
    title: `Status: ${h.to_status}`,
    description: h.reason_or_remark || "Status updated in municipal records.",
    timestamp: new Date(h.created_at).toLocaleString("en-IN"),
    actor: h.changed_by_name,
    status: idx === 0 ? "current" : "completed",
  }));

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header Bar */}
      <div className="space-y-2">
        <a
          href="/citizen/complaints"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#245A86] hover:text-[#142F58] mb-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Grievances</span>
        </a>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono font-bold text-[#245A86] bg-blue-50 px-3 py-1 rounded">
                {complaint.reference_no}
              </span>
              <Badge variant={complaint.status as any} />
              <Badge variant={complaint.priority as any} />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-2">{complaint.title}</h1>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => {
                generateGrievanceReceiptPDF({
                  referenceNo: complaint.reference_no,
                  category: complaint.category,
                  title: complaint.title,
                  description: complaint.description,
                  status: complaint.status,
                  priority: complaint.priority,
                  wardName: complaint.ward_name,
                  addressText: complaint.address_text,
                  createdAt: complaint.created_at,
                  citizenName: complaint.citizen_name || "Citizen User",
                });
              }}
              className="text-xs font-bold gap-2 text-slate-700 hover:text-[#142F58] border-slate-300 shadow-xs"
            >
              <Download className="w-4 h-4 text-[#245A86]" />
              <span>Download PDF Receipt</span>
            </Button>

            {complaint.status === "RESOLVED" && !complaint.citizen_rating && (
              <Button
                onClick={() => setIsFeedbackOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-sm"
              >
                <Star className="w-4 h-4" />
                <span>Verify & Rate Resolution</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Info Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 p-6 space-y-4">
          <h3 className="text-base font-bold text-[#142F58]">Grievance Information</h3>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{complaint.description}</p>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block">Category</span>
              <span className="font-semibold text-slate-800">{complaint.category}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Location Landmark</span>
              <span className="font-semibold text-slate-800">{complaint.address_text || "Ward Jurisdiction"}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Assigned Ward</span>
              <span className="font-semibold text-slate-800">{complaint.ward_name || "Central Zone"}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Filing Timestamp</span>
              <span className="font-semibold text-slate-800">
                {new Date(complaint.created_at).toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </Card>

        {/* Administration Status Sidebar */}
        <Card className="p-6 space-y-4 bg-slate-50/50">
          <h4 className="text-sm font-bold text-[#142F58]">Operational Details</h4>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block">Handling Department:</span>
              <span className="font-bold text-slate-800">{complaint.department_name || "Under Triage"}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Dispatched Officer:</span>
              <span className="font-bold text-slate-800">
                {complaint.assigned_officer_name || "Awaiting Assignment"}
              </span>
            </div>
            {complaint.sla_due_at && (
              <div>
                <span className="text-slate-400 block">SLA Commitment:</span>
                <span className="font-semibold text-amber-700">
                  {new Date(complaint.sla_due_at).toLocaleDateString("en-IN")}
                </span>
              </div>
            )}
            {complaint.citizen_rating && (
              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-400 block">Citizen Rating:</span>
                <span className="font-bold text-emerald-600">★ {complaint.citizen_rating} / 5</span>
                {complaint.citizen_feedback && (
                  <p className="text-[11px] text-slate-600 italic mt-1">"{complaint.citizen_feedback}"</p>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Lifecycle Timeline */}
      <Card className="p-6 space-y-4">
        <h3 className="text-base font-bold text-[#142F58]">Audit Status Progression</h3>
        {timelineItems.length > 0 ? (
          <Timeline items={timelineItems} />
        ) : (
          <p className="text-xs text-slate-400">Grievance registered. Awaiting initial officer triage.</p>
        )}
      </Card>

      {/* Citizen & Department Comments */}
      <Card className="p-6 space-y-6">
        <h3 className="text-base font-bold text-[#142F58]">Public Progress Updates & Messages</h3>
        <div className="space-y-3">
          {(!complaint.comments || complaint.comments.length === 0) ? (
            <p className="text-xs text-slate-400 italic">No public comments recorded yet.</p>
          ) : (
            complaint.comments.map((com: any) => (
              <div key={com.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-900">{com.author_name}</span>
                  <span className="text-slate-400">{new Date(com.created_at).toLocaleString("en-IN")}</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">{com.comment}</p>
              </div>
            ))
          )}
        </div>

        {/* Add Citizen Comment */}
        <form onSubmit={handleAddComment} className="pt-4 border-t border-slate-100 space-y-3">
          <Textarea
            label="Post Citizen Note / Follow-up"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={2}
            placeholder="Add relevant instructions or clarify location for the municipal team..."
          />
          <Button type="submit" isLoading={commentLoading} size="sm" className="bg-[#142F58] text-white">
            Post Update
          </Button>
        </form>
      </Card>

      {/* Feedback Modal */}
      <Modal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        title="Rate Grievance Resolution Quality"
        description={`Reference ID: ${complaint.reference_no}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsFeedbackOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleFeedbackSubmit}
              isLoading={feedbackLoading}
              className="bg-emerald-600 text-white"
            >
              Confirm & Close Grievance
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">Resolution Satisfaction (1 to 5 Stars)</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`p-2 rounded-lg text-lg transition-colors ${
                    rating >= star ? "text-amber-500 bg-amber-50" : "text-slate-300 bg-slate-50"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <Textarea
            label="Citizen Feedback Remarks (Optional)"
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            rows={3}
            placeholder="Let the municipal corporation know if the issue was resolved properly..."
          />
        </div>
      </Modal>
    </div>
  );
}
