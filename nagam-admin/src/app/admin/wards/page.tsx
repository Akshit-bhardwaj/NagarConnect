"use client";

import React, { useState, useEffect } from "react";
import { Card, Badge, Button } from "nagam-ui";
import { apiClient } from "@/lib/api";
import {
  MapPin,
  RefreshCw,
  Search,
  Users,
  Compass,
  Building,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Shield,
} from "lucide-react";

export default function WardsGeographyAdminPage() {
  const [wards, setWards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const loadWards = async () => {
    try {
      setLoading(true);
      const data = await apiClient<any[]>("/admin/wards");
      setWards(data || []);
    } catch (err) {
      console.error("Failed to load wards:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWards();
  }, []);

  const filteredWards = wards.filter((w) => {
    const q = searchQuery.toLowerCase();
    return (
      (w.ward_name && w.ward_name.toLowerCase().includes(q)) ||
      (w.ward_number && w.ward_number.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-7">
      {/* Page Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-[#142F58]">
                Territorial Administration
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-500">Zonal Demarcation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142F58] tracking-tight">
              Wards & Geographic Jurisdictions
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Corporation ward boundaries, municipal field engineer assignments, and territorial demographic triage.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              onClick={loadWards}
              className="bg-[#142F58] hover:bg-[#1a3c6d] text-white text-xs gap-1.5 shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Sync Wards</span>
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 bg-white border border-slate-200 shadow-xs rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Demarcated Wards</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#142F58] flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#142F58]">{wards.length}</div>
          <p className="text-[11px] text-slate-400">Total municipal constituencies</p>
        </Card>

        <Card className="p-5 bg-white border border-slate-200 shadow-xs rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Field Response Units</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">100% Covered</div>
          <p className="text-[11px] text-emerald-700 font-semibold">Active nodal supervisors</p>
        </Card>

        <Card className="p-5 bg-white border border-slate-200 shadow-xs rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Population Reach</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#142F58]">2.8M+ Citizens</div>
          <p className="text-[11px] text-slate-400">Under urban local body governance</p>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search wards by ward number (e.g. W-01) or ward locality name..."
          className="w-full pl-10 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#142F58] bg-white shadow-xs"
        />
      </div>

      {/* Wards Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="w-6 h-6 border-2 border-[#142F58] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span>Loading territorial wards...</span>
        </div>
      ) : filteredWards.length === 0 ? (
        <Card className="p-12 text-center bg-white border border-slate-200 rounded-2xl">
          <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-base font-bold text-slate-800">No wards match your search</p>
          <p className="text-xs text-slate-400 mt-1">Try searching with a different ward identifier.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredWards.map((w) => (
            <Card
              key={w.id}
              className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-[#142F58] hover:shadow-md transition-all space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-black text-[#142F58] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                  {w.ward_number}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  ACTIVE ZONE
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {w.ward_name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Municipal Zonal Ward Constituency
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Assigned Team:</span>
                  <strong className="text-slate-800">Rapid Response Unit {w.ward_number.replace(/\D/g, "") || "1"}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Supervisory Desk:</span>
                  <strong className="text-slate-800">Zonal Sanitary Officer</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Active SLA Redressal:</span>
                  <span className="font-bold text-emerald-600">96.4% Compliance</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
