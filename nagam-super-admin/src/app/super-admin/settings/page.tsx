"use client";

import React, { useState } from "react";
import { Card, Button, Input, Alert } from "nagam-ui";
import {
  Settings,
  ShieldCheck,
  Save,
  CheckCircle2,
  Database,
  Cpu,
  Layers,
  Bell,
  Sparkles,
} from "lucide-react";

export default function SuperAdminSettingsPage() {
  const [defaultSla, setDefaultSla] = useState("48");
  const [mandatoryPhoto, setMandatoryPhoto] = useState(true);
  const [geotaggingRequired, setGeotaggingRequired] = useState(true);
  const [smsGateway, setSmsGateway] = useState(true);
  const [aiTriage, setAiTriage] = useState(true);
  const [citizenRatings, setCitizenRatings] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
          Platform Governance
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          System Feature Flags & SLA Defaults
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Global baseline configurations inherited by newly provisioned municipal corporations.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>System configuration and feature flags successfully updated!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core SLA Baselines */}
        <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Settings className="w-4 h-4 text-purple-400" />
            <span>Service Level Agreement (SLA) Engine</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Standard Resolution Target (Hours)
              </label>
              <input
                type="number"
                value={defaultSla}
                onChange={(e) => setDefaultSla(e.target.value)}
                className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                required
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Standard SLA for solid waste, street lighting, and roads.
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Critical / Emergency Target (Hours)
              </label>
              <input
                type="number"
                value="6"
                disabled
                className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-500 font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Hardcoded 6h ceiling for live electrical wires and flood risks.
              </span>
            </div>
          </div>
        </div>

        {/* Feature Flags */}
        <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-purple-400" />
            <span>Operational Feature Flags</span>
          </h2>

          <div className="space-y-3">
            {[
              {
                title: "Mandatory Geotagging on Grievance Lodging",
                desc: "Prevents lodging complaints without verified latitude/longitude coordinates to avoid false reports.",
                val: geotaggingRequired,
                toggle: () => setGeotaggingRequired(!geotaggingRequired),
              },
              {
                title: "Mandatory Photographic Evidence for Resolution",
                desc: "Requires sanitation and engineering inspectors to upload before-and-after photos prior to marking ticket RESOLVED.",
                val: mandatoryPhoto,
                toggle: () => setMandatoryPhoto(!mandatoryPhoto),
              },
              {
                title: "Citizen SMS & Portal Status Updates",
                desc: "Dispatches automated tracking SMS upon status progression from TRIAGED to RESOLVED.",
                val: smsGateway,
                toggle: () => setSmsGateway(!smsGateway),
              },
              {
                title: "AI Auto-Categorization & Duplicate Detection",
                desc: "Analyzes grievance description to suggest municipal department and flags recurring issues in same ward.",
                val: aiTriage,
                toggle: () => setAiTriage(!aiTriage),
              },
              {
                title: "Citizen Redressal Rating & Satisfaction Score",
                desc: "Invites citizens to rate field repair quality (1 to 5 stars) within 72 hours of ticket closure.",
                val: citizenRatings,
                toggle: () => setCitizenRatings(!citizenRatings),
              },
            ].map((flag) => (
              <div
                key={flag.title}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-4"
              >
                <div>
                  <h3 className="text-xs font-bold text-white">{flag.title}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">{flag.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={flag.toggle}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    flag.val ? "bg-purple-600 justify-end" : "bg-slate-800 justify-start"
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Database & Runtime Specs */}
        <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-purple-400" />
            <span>Platform Infrastructure Topology</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Database</span>
              <strong className="text-white">PostgreSQL 17</strong>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Backend API</span>
              <strong className="text-white">FastAPI Async</strong>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Auth Scheme</span>
              <strong className="text-white">Argon2id + JWT</strong>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Host Mode</span>
              <strong className="text-emerald-400">Native macOS</strong>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            className="bg-purple-600 hover:bg-purple-500 text-white text-xs gap-1.5 px-6 py-2.5 shadow-lg shadow-purple-900/30"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Platform Settings</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
