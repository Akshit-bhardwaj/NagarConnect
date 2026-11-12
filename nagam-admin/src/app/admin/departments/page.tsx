"use client";

import React, { useState, useEffect } from "react";
import { Card, Badge, Button } from "nagam-ui";
import { apiClient } from "@/lib/api";
import {
  Building,
  RefreshCw,
  Search,
  Users,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  Clock,
  Layers,
  ArrowRight,
} from "lucide-react";

export default function DepartmentsAdminPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const data = await apiClient<any[]>("/admin/departments");
      setDepartments(data || []);
    } catch (err) {
      console.error("Failed to load departments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const filteredDepts = departments.filter((d) => {
    const q = searchQuery.toLowerCase();
    return (
      (d.name && d.name.toLowerCase().includes(q)) ||
      (d.code && d.code.toLowerCase().includes(q)) ||
      (d.description && d.description.toLowerCase().includes(q))
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
                Municipal Engineering & Operations
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-500">Zonal Wings</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142F58] tracking-tight">
              Municipal Departments & Cadres
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Departmental rosters, technical engineering divisions, and zonal redressal units.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              onClick={loadDepartments}
              className="bg-[#142F58] hover:bg-[#1a3c6d] text-white text-xs gap-1.5 shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh Cadres</span>
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 bg-white border border-slate-200 shadow-xs rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Functional Wings</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#142F58] flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#142F58]">{departments.length}</div>
          <p className="text-[11px] text-slate-400">Core civic engineering divisions</p>
        </Card>

        <Card className="p-5 bg-white border border-slate-200 shadow-xs rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Field Response Teams</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">24 Zonal Crews</div>
          <p className="text-[11px] text-emerald-700 font-semibold">Active shift deployment</p>
        </Card>

        <Card className="p-5 bg-white border border-slate-200 shadow-xs rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Charter SLA Standard</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#142F58]">48.0 hrs</div>
          <p className="text-[11px] text-slate-400">Statutory resolution ceiling</p>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search departments by name, department code, or function..."
          className="w-full pl-10 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#142F58] bg-white shadow-xs"
        />
      </div>

      {/* Departments Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="w-6 h-6 border-2 border-[#142F58] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span>Loading municipal department cadres...</span>
        </div>
      ) : filteredDepts.length === 0 ? (
        <Card className="p-12 text-center bg-white border border-slate-200 rounded-2xl">
          <Building className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-base font-bold text-slate-800">No departments found</p>
          <p className="text-xs text-slate-400 mt-1">Try searching for a different department code.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDepts.map((d) => (
            <Card
              key={d.id}
              className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-[#142F58] hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-extrabold text-[#142F58] bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                    {d.code}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    OPERATIONAL
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-[#142F58]">
                    {d.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {d.description || "Designated municipal agency responsible for public works and field grievance resolution."}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Nodal Head:</span>
                  <strong className="text-slate-800">Chief Municipal Engineer</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Jurisdiction:</span>
                  <strong className="text-slate-800">All Corporation Wards</strong>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
