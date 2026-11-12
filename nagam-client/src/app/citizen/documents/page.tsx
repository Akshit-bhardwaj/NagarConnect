"use client";

import React, { useState, useEffect } from "react";
import { Card, Badge, Button, Input } from "nagam-ui";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { generateGrievanceReceiptPDF } from "@/lib/pdf-generator";
import {
  FolderOpen,
  FileText,
  Download,
  UploadCloud,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Search,
  Filter,
  Trash2,
  Eye,
  Plus,
  Calendar,
  AlertCircle,
  FileCheck,
} from "lucide-react";

interface StoredDocument {
  id: string;
  title: string;
  category: "KYC" | "RECEIPT" | "CERTIFICATE" | "PROPERTY";
  filename: string;
  size: string;
  date: string;
  status: "VERIFIED" | "PENDING" | "ISSUED";
  downloadHandler?: () => void;
}

export default function MyDocumentsPage() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // Upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadCat, setUploadCat] = useState<"KYC" | "CERTIFICATE" | "PROPERTY">("KYC");
  const [uploadedFiles, setUploadedFiles] = useState<StoredDocument[]>([
    {
      id: "doc-aadhaar",
      title: "Resident Identity Proof (Aadhaar Card)",
      category: "KYC",
      filename: "Aadhaar_Verified_DigiLocker.pdf",
      size: "1.4 MB",
      date: "10 Oct 2026",
      status: "VERIFIED",
    },
    {
      id: "doc-prop-tax",
      title: "Municipal Property Tax Assessment Receipt",
      category: "PROPERTY",
      filename: "Property_Tax_Receipt_2026.pdf",
      size: "820 KB",
      date: "14 Oct 2026",
      status: "VERIFIED",
    },
    {
      id: "doc-birth-cert",
      title: "Digital Birth Certificate Application Proof",
      category: "CERTIFICATE",
      filename: "Birth_Cert_Acknowledgment.pdf",
      size: "650 KB",
      date: "18 Oct 2026",
      status: "PENDING",
    },
  ]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await apiClient<any[]>("/citizen/complaints");
        setComplaints(data || []);
      } catch (err) {
        console.error("Failed to load complaints for receipts:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Merge complaints into official receipts
  const receiptDocuments: StoredDocument[] = complaints.map((c) => ({
    id: `receipt-${c.id}`,
    title: `Official Grievance Receipt — #${c.reference_no}`,
    category: "RECEIPT",
    filename: `${c.reference_no}-Receipt.pdf`,
    size: "420 KB",
    date: new Date(c.created_at).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    status: c.status === "RESOLVED" ? "VERIFIED" : "ISSUED",
    downloadHandler: () => {
      generateGrievanceReceiptPDF({
        referenceNo: c.reference_no,
        category: c.category,
        title: c.title,
        description: c.description,
        status: c.status,
        priority: c.priority,
        wardName: c.ward_name,
        addressText: c.address_text,
        createdAt: c.created_at,
        citizenName: user?.citizen_profile
          ? `${user.citizen_profile.first_name} ${user.citizen_profile.last_name || ""}`.trim()
          : user?.email || "Citizen User",
        citizenPhone: user?.phone,
      });
    },
  }));

  const allDocuments = [...uploadedFiles, ...receiptDocuments];

  const filteredDocs = allDocuments.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.filename.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === "ALL" || doc.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) return;

    const newDoc: StoredDocument = {
      id: `doc-${Date.now()}`,
      title: uploadTitle,
      category: uploadCat,
      filename: `${uploadTitle.replace(/\s+/g, "_")}.pdf`,
      size: "1.2 MB",
      date: new Date().toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      status: "PENDING",
    };

    setUploadedFiles((prev) => [newDoc, ...prev]);
    setUploadTitle("");
    setIsUploadOpen(false);
  };

  const handleDelete = (id: string) => {
    setUploadedFiles((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className="space-y-7 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-[#142F58]">
                Citizen Digital Vault
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                DigiLocker & Municipal Verified
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142F58] tracking-tight">
              My Municipal Documents & PDF Receipts
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Access certified grievance receipts, property certificates, and identity records anytime.
            </p>
          </div>

          <Button
            onClick={() => setIsUploadOpen(true)}
            className="bg-[#142F58] hover:bg-[#1a3c6d] text-white text-xs gap-2 px-5 py-2.5 shadow-sm self-start lg:self-auto"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload New Document</span>
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 bg-white border border-slate-200 shadow-xs rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Documents</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#142F58] flex items-center justify-center">
              <FolderOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#142F58]">{allDocuments.length}</div>
          <p className="text-[11px] text-slate-400">Secured in municipal electronic archive</p>
        </Card>

        <Card className="p-5 bg-white border border-slate-200 shadow-xs rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Official PDF Receipts</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">{receiptDocuments.length}</div>
          <p className="text-[11px] text-emerald-700 font-semibold">1-Click official PDF download</p>
        </Card>

        <Card className="p-5 bg-white border border-slate-200 shadow-xs rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Verified Records</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#142F58]">
            {allDocuments.filter((d) => d.status === "VERIFIED").length} Verified
          </div>
          <p className="text-[11px] text-slate-400">Government recognized electronic proofs</p>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents by title, receipt number or file name..."
            className="w-full pl-10 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#142F58] bg-white shadow-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
          {[
            { key: "ALL", label: "All Docs" },
            { key: "RECEIPT", label: "Official Receipts" },
            { key: "KYC", label: "Identity & KYC" },
            { key: "PROPERTY", label: "Property & Tax" },
            { key: "CERTIFICATE", label: "Certificates" },
          ].map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                selectedCategory === cat.key
                  ? "bg-white text-[#142F58] shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid / Table */}
      {filteredDocs.length === 0 ? (
        <Card className="p-12 text-center bg-white border border-slate-200 rounded-2xl">
          <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-base font-bold text-slate-800">No documents found</p>
          <p className="text-xs text-slate-400 mt-1">Try resetting the search filters or upload a new record.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredDocs.map((doc) => (
            <Card
              key={doc.id}
              className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-[#142F58] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    doc.category === "RECEIPT"
                      ? "bg-emerald-50 text-emerald-600"
                      : doc.category === "PROPERTY"
                      ? "bg-amber-50 text-amber-600"
                      : "bg-blue-50 text-[#142F58]"
                  }`}
                >
                  <FileText className="w-5 h-5" />
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      {doc.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        doc.status === "VERIFIED"
                          ? "bg-emerald-100 text-emerald-800"
                          : doc.status === "ISSUED"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {doc.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{doc.title}</h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-0.5">
                    <span>File: <strong className="text-slate-600 font-mono">{doc.filename}</strong></span>
                    <span>Size: {doc.size}</span>
                    <span>Date: {doc.date}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto border-t sm:border-t-0 pt-2 sm:pt-0">
                {doc.downloadHandler ? (
                  <Button
                    onClick={doc.downloadHandler}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 px-4 py-2 shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => alert(`Opening ${doc.filename} from municipal electronic locker...`)}
                    className="text-xs gap-1.5 border-slate-200 px-4 py-2 hover:bg-slate-50"
                  >
                    <Download className="w-3.5 h-3.5 text-[#142F58]" />
                    <span>Download</span>
                  </Button>
                )}

                {doc.id.startsWith("doc-") && !doc.id.includes("aadhaar") && (
                  <button
                    onClick={() => handleDelete(doc.id)}
                    title="Delete document"
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#142F58] flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-blue-600" />
                <span>Upload to Municipal Locker</span>
              </h3>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Document Description / Title
                </label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. Electricity Bill (Proof of Residence)"
                  className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#142F58]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Document Category
                </label>
                <select
                  value={uploadCat}
                  onChange={(e: any) => setUploadCat(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#142F58]"
                >
                  <option value="KYC">Identity & Address Proof (KYC)</option>
                  <option value="PROPERTY">Property Deed / Tax Records</option>
                  <option value="CERTIFICATE">Municipal Certificates & Affidavits</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Select File (PDF, JPG, PNG up to 10MB)
                </label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-[#142F58] transition-colors cursor-pointer bg-slate-50">
                  <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">Click to browse or drop file here</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Encrypted with AES-256 for municipal privacy</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setIsUploadOpen(false)} className="text-xs">
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#142F58] text-white text-xs">
                  Save Document
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
