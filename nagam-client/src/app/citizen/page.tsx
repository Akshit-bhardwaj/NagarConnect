"use client";

import React, { useState } from "react";
import {
  PlusCircle,
  FileText,
  Search,
  Bell,
  MapPin,
  ChevronDown,
  ArrowRight,
  ExternalLink,
  Droplet,
  Trash2,
  Phone,
  FileCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Layers,
} from "lucide-react";

export default function CitizenDashboardPage() {
  const [complaintTab, setComplaintTab] = useState("All");
  const [city, setCity] = useState("Lucknow, UP");
  const [areaSearch, setAreaSearch] = useState("");

  const complaints = [
    {
      id: "NC-2024-001234",
      title: "Street Light Not Working",
      ward: "Ward 12",
      date: "16 Oct 2024",
      status: "In Progress",
      statusColor: "bg-blue-50 text-blue-700 border-blue-200",
      dotColor: "bg-blue-600",
    },
    {
      id: "NC-2024-001189",
      title: "Garbage Collection Issue",
      ward: "Ward 8",
      date: "10 Oct 2024",
      status: "Resolved",
      statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dotColor: "bg-emerald-600",
    },
    {
      id: "NC-2024-001145",
      title: "Water Supply Interruption",
      ward: "Ward 5",
      date: "05 Oct 2024",
      status: "Closed",
      statusColor: "bg-slate-100 text-slate-700 border-slate-200",
      dotColor: "bg-slate-500",
    },
  ];

  const applications = [
    {
      id: "APP-2024-000892",
      title: "Birth Certificate",
      date: "12 Oct 2024",
      status: "Under Review",
      statusColor: "bg-amber-50 text-amber-700 border-amber-200",
      actionText: null,
    },
    {
      id: "APP-2024-000845",
      title: "Water Connection",
      date: "10 Oct 2024",
      status: "Approved",
      statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      actionText: "View Certificate",
    },
    {
      id: "APP-2024-000801",
      title: "Property Tax Query",
      date: "15 Sep 2024",
      status: "Additional Info",
      statusColor: "bg-orange-50 text-orange-700 border-orange-200",
      actionText: null,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Greeting Banner + City Dropdown (Matches Image 1 Screen 2) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Good Morning, Rohan!</h1>
          <p className="text-xs text-slate-500 mt-0.5">Let&apos;s make your city better together.</p>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs w-fit">
          <MapPin className="w-3.5 h-3.5 text-blue-600" />
          <span>{city}</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>

      {/* 2. 4 Action Cards with Vibrant Icons (Matches Image 1 Screen 2) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Card 1: Register New Complaint */}
        <a
          href="/citizen/complaints/new"
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between group"
        >
          <div className="w-11 h-11 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
            <PlusCircle className="w-6 h-6" />
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold text-slate-900 leading-snug">Register</p>
            <p className="text-xs font-bold text-slate-900 leading-snug">New Complaint</p>
          </div>
        </a>

        {/* Card 2: Apply for Service */}
        <a
          href="/citizen/applications"
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between group"
        >
          <div className="w-11 h-11 rounded-2xl bg-[#059669] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
            <FileText className="w-6 h-6" />
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold text-slate-900 leading-snug">Apply for</p>
            <p className="text-xs font-bold text-slate-900 leading-snug">Service</p>
          </div>
        </a>

        {/* Card 3: Track Application */}
        <a
          href="/citizen/applications"
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between group"
        >
          <div className="w-11 h-11 rounded-2xl bg-[#D97706] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
            <Search className="w-6 h-6" />
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold text-slate-900 leading-snug">Track</p>
            <p className="text-xs font-bold text-slate-900 leading-snug">Application</p>
          </div>
        </a>

        {/* Card 4: View Notifications */}
        <a
          href="#notifications"
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-purple-400 hover:shadow-md transition-all flex flex-col justify-between group"
        >
          <div className="w-11 h-11 rounded-2xl bg-[#7C3AED] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
            <Bell className="w-6 h-6" />
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold text-slate-900 leading-snug">View</p>
            <p className="text-xs font-bold text-slate-900 leading-snug">Notifications</p>
          </div>
        </a>
      </div>

      {/* 3. Main Split Section (Matches Image 1 Screen 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Complaints & Applications) (approx 7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* My Complaints Block */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">My Complaints</h3>
              <a href="/citizen/complaints" className="text-xs font-bold text-blue-600 hover:underline">
                View All →
              </a>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 border-b border-slate-100 pb-2 text-xs font-semibold">
              {["All (5)", "In Progress (2)", "Resolved (2)", "Closed (1)"].map((tab) => {
                const isActive = complaintTab === tab.split(" ")[0];
                return (
                  <button
                    key={tab}
                    onClick={() => setComplaintTab(tab.split(" ")[0])}
                    className={`px-3 py-1 rounded-lg transition-colors ${
                      isActive
                        ? "bg-[#142F58] text-white font-bold"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            {/* Complaint Item Cards */}
            <div className="space-y-2.5">
              {complaints.map((c) => (
                <a
                  key={c.id}
                  href={`/citizen/complaints/${c.id}`}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-white border border-slate-200 text-amber-600 shrink-0 mt-0.5">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-400">{c.id}</span>
                      <h4 className="text-xs font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
                        {c.title}
                      </h4>
                      <p className="text-[11px] text-slate-500">{c.ward} • {c.date}</p>
                    </div>
                  </div>

                  <div className={`px-2.5 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1.5 shrink-0 ${c.statusColor}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${c.dotColor}`} />
                    <span>{c.status}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* My Applications Block */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">My Applications</h3>
              <a href="/citizen/applications" className="text-xs font-bold text-blue-600 hover:underline">
                View All →
              </a>
            </div>

            <div className="space-y-2.5">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-white border border-slate-200 text-blue-600 shrink-0 mt-0.5">
                      <FileCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-400">{app.id}</span>
                      <h4 className="text-xs font-bold text-slate-900">{app.title}</h4>
                      <p className="text-[11px] text-slate-500">Submitted on {app.date}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${app.statusColor}`}>
                      {app.status}
                    </span>
                    {app.actionText && (
                      <button className="text-xs font-bold text-blue-600 hover:underline">
                        {app.actionText}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Track Your Area + Quick Links) (approx 5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Track Your Area Widget (Matches Image 1 Screen 2 Map Widget) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3.5 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900">Track Your Area</h3>

            {/* Input */}
            <div className="relative">
              <input
                type="text"
                value={areaSearch}
                onChange={(e) => setAreaSearch(e.target.value)}
                placeholder="Enter ward, locality or property ID"
                className="w-full pl-3 pr-8 py-2 rounded-xl text-xs border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
            </div>

            {/* Simulated Map Container with Ward 12 Pin (Matches Image 1 Screen 2) */}
            <div className="relative h-44 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
              {/* Map Canvas Background */}
              <div className="absolute inset-0 bg-[#E5EDF4] [background-image:linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-70" />

              {/* Polygon Representation of Ward 12 */}
              <div className="absolute top-8 left-14 w-36 h-28 bg-blue-500/20 border-2 border-blue-600/60 rounded-xl pointer-events-none" />

              {/* Pin Pill: Ward 12 */}
              <div className="absolute top-14 left-24 bg-[#142F58] text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-md flex items-center gap-1">
                <MapPin className="w-3 h-3 text-sky-300" />
                <span>Ward 12</span>
              </div>

              {/* Map controls */}
              <div className="absolute bottom-2 right-2 bg-white rounded-md shadow-xs border text-[11px] font-bold text-slate-600 flex flex-col">
                <button className="px-2 py-0.5 hover:bg-slate-100 border-b">+</button>
                <button className="px-2 py-0.5 hover:bg-slate-100">-</button>
              </div>

              <div className="absolute bottom-2 left-2 text-[10px] text-slate-500 bg-white/90 px-1.5 py-0.5 rounded">
                Hazratganj Zone
              </div>
            </div>
          </div>

          {/* Quick Links Block (Matches Image 1 Screen 2 Quick Links) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900">Quick Links</h3>

            <div className="space-y-2 text-xs">
              <a
                href="#property-tax"
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5 font-bold text-slate-700">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Pay Property Tax</span>
                </div>
                <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-semibold">
                  Coming Soon
                </span>
              </a>

              <a
                href="#water-supply"
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors flex items-center gap-2.5 font-bold text-slate-700"
              >
                <Droplet className="w-4 h-4 text-sky-600" />
                <span>Water Supply Information</span>
              </a>

              <a
                href="#waste-schedule"
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors flex items-center gap-2.5 font-bold text-slate-700"
              >
                <Trash2 className="w-4 h-4 text-emerald-600" />
                <span>Waste Collection Schedule</span>
              </a>

              <a
                href="#contacts"
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors flex items-center gap-2.5 font-bold text-slate-700"
              >
                <Phone className="w-4 h-4 text-amber-600" />
                <span>Important Contacts</span>
              </a>

              <a
                href="#notices"
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors flex items-center gap-2.5 font-bold text-slate-700"
              >
                <Bell className="w-4 h-4 text-purple-600" />
                <span>Public Notices</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
