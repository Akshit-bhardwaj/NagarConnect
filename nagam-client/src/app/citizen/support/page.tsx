"use client";

import React, { useState } from "react";
import { Card, Badge, Button, Input } from "nagam-ui";
import {
  HelpCircle,
  Phone,
  MessageSquare,
  Mail,
  Send,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  MapPin,
  ShieldAlert,
  Search,
  ExternalLink,
  Info,
  LifeBuoy,
} from "lucide-react";

interface FAQItem {
  q: string;
  a: string;
  category: "Grievances" | "Certificates" | "SLA & Escalation";
}

const FAQS: FAQItem[] = [
  {
    category: "Grievances",
    q: "How do I lodge a municipal complaint and get an official PDF receipt?",
    a: "Navigate to 'New Complaint' in the sidebar or top navigation. Complete the 4-step wizard with location landmark, category, description, and optional photo proofs. Once submitted, an official Reference ID (e.g., CMP-2026-LUC-00121) is issued with a 1-click 'Download Official PDF Receipt' button.",
  },
  {
    category: "SLA & Escalation",
    q: "What are the statutory resolution deadlines (SLA) under UP Janhit Guarantee?",
    a: "Emergency hazards (road cave-ins, live wire sparking) carry a strict 6-hour SLA. High-priority sanitation overflow & pipeline bursts carry 24 hours. Standard civic complaints have a 48-hour statutory resolution window.",
  },
  {
    category: "Certificates",
    q: "How can I verify and track my Birth or Trade License application?",
    a: "Go to 'My Applications' to track live desk verification, hospital registry match, and inspector clearance. Once approved by the nodal desk officer, your digital certificate with a verifiable digital seal is issued directly in 'My Documents'.",
  },
  {
    category: "SLA & Escalation",
    q: "What happens if a complaint breaches the 48-hour SLA deadline?",
    a: "Our central engine automatically triggers a yellow/red alert in the Municipal Admin Command Center. Unresolved tickets automatically escalate to the Zonal Municipal Commissioner for disciplinary inquiry.",
  },
  {
    category: "Grievances",
    q: "Can I rate or challenge a resolution if the issue persists on the ground?",
    a: "Yes! When an inspector marks a complaint as 'RESOLVED', you will see a 'Verify & Rate Resolution' button on the complaint dossier. If the field work was substandard, you can give a 1-star rating with photo proof to reopen the case.",
  },
];

export default function CitizenHelpSupportPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState<string>("ALL");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  // Inquiry form states
  const [inquiryCategory, setInquiryCategory] = useState("Grievance Escalation");
  const [ticketRef, setTicketRef] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const filteredFaqs = FAQS.filter((f) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q);
    const matchesCat = selectedCat === "ALL" || f.category === selectedCat;
    return matchesSearch && matchesCat;
  });

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setMessage("");
      setTicketRef("");
    }, 600);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-[#142F58]">
                24x7 Citizen Assistance
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <LifeBuoy className="w-3.5 h-3.5" />
                Municipal Helpdesk & Escalation Cell
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142F58] tracking-tight">
              Help, Civic Support & Grievance Redressal
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Immediate helpline assistance, statutory FAQ knowledge base, and nodal officer directories.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-[#142F58] bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 shadow-xs">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>Avg Response Time: &lt;15 mins</span>
          </div>
        </div>
      </div>

      {/* Emergency Hotline Contact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <a
          href="tel:1533"
          className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-[#142F58] hover:shadow-md transition-all group block"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#142F58] group-hover:bg-[#142F58] group-hover:text-white transition-colors flex items-center justify-center mb-3">
            <Phone className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Toll-Free Control Room</span>
          <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-[#142F58]">1533 / 1913</h3>
          <p className="text-xs text-slate-500 mt-1">24x7 City Operations Center</p>
        </a>

        <a
          href="https://wa.me/919454400000"
          target="_blank"
          rel="noreferrer"
          className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-emerald-600 hover:shadow-md transition-all group block"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors flex items-center justify-center mb-3">
            <MessageSquare className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Official WhatsApp Bot</span>
          <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-emerald-700">+91 94544 00000</h3>
          <p className="text-xs text-slate-500 mt-1">Chat & Lodge Complaints instantly</p>
        </a>

        <a
          href="mailto:support@nagarconnect.gov.in"
          className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-[#142F58] hover:shadow-md transition-all group block"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors flex items-center justify-center mb-3">
            <Mail className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Grievance Cell</span>
          <h3 className="text-base font-extrabold text-slate-900 group-hover:text-[#142F58] truncate">support@lmc.gov.in</h3>
          <p className="text-xs text-slate-500 mt-1">Written documentation & RTI</p>
        </a>

        <a
          href="tel:112"
          className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-rose-600 hover:shadow-md transition-all group block"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors flex items-center justify-center mb-3">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Emergency & Disaster</span>
          <h3 className="text-xl font-extrabold text-rose-600">112 / 1090</h3>
          <p className="text-xs text-slate-500 mt-1">Police, Fire & Women Safety</p>
        </a>
      </div>

      {/* 2-Column Section: FAQs + Escalation Inquiry Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* Left Column: Interactive FAQs (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div>
            <h2 className="text-lg font-bold text-[#142F58] flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-600" />
              <span>Frequently Asked Questions</span>
            </h2>
            <p className="text-xs text-slate-500">
              Clear answers to common questions about complaints, SLAs, and certificates.
            </p>
          </div>

          {/* FAQ Filter & Search */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search FAQs by keywords..."
                className="w-full pl-10 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#142F58] bg-white shadow-xs"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
              {["ALL", "Grievances", "Certificates", "SLA & Escalation"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCat(cat)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    selectedCat === cat
                      ? "bg-white text-[#142F58] shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-3">
            {filteredFaqs.map((faq, idx) => {
              const isExpanded = expandedIndex === idx;
              return (
                <Card
                  key={faq.q}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs"
                >
                  <button
                    onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        {faq.category}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">{faq.q}</h4>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-[#142F58] shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                      {faq.a}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>

        {/* Right Column: Support & Escalation Form (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div>
            <h2 className="text-lg font-bold text-[#142F58] flex items-center gap-2">
              <Send className="w-5 h-5 text-amber-500" />
              <span>Submit Escalation or Help Ticket</span>
            </h2>
            <p className="text-xs text-slate-500">
              Need immediate intervention on a delayed complaint or certificate? Write to our nodal cell.
            </p>
          </div>

          <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
            {submitted ? (
              <div className="p-6 text-center space-y-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h3 className="text-sm font-bold text-emerald-900">
                  Escalation Ticket Registered Successfully!
                </h3>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  Your request has been routed to the Lucknow Zonal Oversight Cell. An officer will inspect the ticket within 2 hours.
                </p>
                <Button
                  onClick={() => setSubmitted(false)}
                  variant="outline"
                  className="text-xs border-emerald-300 text-emerald-800"
                >
                  Submit Another Inquiry
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSupportSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Help Inquiry Category
                  </label>
                  <select
                    value={inquiryCategory}
                    onChange={(e) => setInquiryCategory(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-white font-medium focus:ring-2 focus:ring-[#142F58]"
                  >
                    <option value="Grievance Escalation">Complaint SLA Breach / Delay Escalation</option>
                    <option value="Certificate Verification">Certificate Status / Document Inquiry</option>
                    <option value="Technical Glitch">Portal Technical Issue or Bug</option>
                    <option value="General Feedback">Suggestion / Citizen Feedback</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Complaint / Application Ref # (Optional)
                  </label>
                  <input
                    type="text"
                    value={ticketRef}
                    onChange={(e) => setTicketRef(e.target.value)}
                    placeholder="e.g. CMP-2026-LUC-00121"
                    className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#142F58]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Describe Your Issue or Concern
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Provide details about the issue, location, or why escalation is requested..."
                    className="w-full text-xs border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#142F58]"
                  />
                </div>

                <Button
                  type="submit"
                  isLoading={submitting}
                  className="w-full bg-[#142F58] hover:bg-[#1a3c6d] text-white text-xs font-bold py-2.5 shadow-sm gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send to Municipal Helpdesk</span>
                </Button>
              </form>
            )}
          </Card>

          {/* Quick Info Box */}
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-[#142F58]">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Right to Service Guarantee</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Under Section 4 of the Uttar Pradesh Janhit Redressal Guarantee, citizens have statutory right to timed grievance redressal and transparent status inspection.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
