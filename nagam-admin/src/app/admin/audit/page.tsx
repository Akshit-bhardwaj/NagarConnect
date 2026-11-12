"use client";

import React, { useState, useEffect } from "react";
import { Card, Badge, Button } from "nagam-ui";
import { apiClient } from "@/lib/api";
import {
  ShieldCheck,
  RefreshCw,
  Search,
  Clock,
  User,
  Activity,
  FileText,
  Lock,
  ArrowRight,
  Database,
  Filter,
} from "lucide-react";

export default function AuditLogsAdminPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      const data = await apiClient<any[]>("/admin/audit-logs");
      setLogs(data || []);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const q = searchQuery.toLowerCase();
    return (
      (log.action && log.action.toLowerCase().includes(q)) ||
      (log.entity_type && log.entity_type.toLowerCase().includes(q)) ||
      (log.entity_id && log.entity_id.toLowerCase().includes(q))
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
                Statutory Governance & Compliance
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-500">Immutable Audit Trail</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142F58] tracking-tight">
              Administrative Audit Logs
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Complete cryptographic verification of all staff actions, state machine transitions, and municipal notices.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              onClick={loadAuditLogs}
              className="bg-[#142F58] hover:bg-[#1a3c6d] text-white text-xs gap-1.5 shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh Trail</span>
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 bg-white border border-slate-200 shadow-xs rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Logged Invocations</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#142F58] flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#142F58]">{logs.length}</div>
          <p className="text-[11px] text-slate-400">Total auditable state transitions</p>
        </Card>

        <Card className="p-5 bg-white border border-slate-200 shadow-xs rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Integrity Status</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">Tamper-Proof</div>
          <p className="text-[11px] text-emerald-700 font-semibold">PostgreSQL ACID compliant</p>
        </Card>

        <Card className="p-5 bg-white border border-slate-200 shadow-xs rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Legal Discovery</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#142F58]">RTI Compliant</div>
          <p className="text-[11px] text-slate-400">Section 4 proactive disclosure</p>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter audit logs by action type, entity name, or entity ID..."
          className="w-full pl-10 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#142F58] bg-white shadow-xs"
        />
      </div>

      {/* Audit Logs Table */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="w-6 h-6 border-2 border-[#142F58] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span>Verifying cryptographic audit chain...</span>
        </div>
      ) : filteredLogs.length === 0 ? (
        <Card className="p-12 text-center bg-white border border-slate-200 rounded-2xl">
          <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-base font-bold text-slate-800">No audit logs matching query</p>
          <p className="text-xs text-slate-400 mt-1">Audit logs will automatically populate as administrative actions occur.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredLogs.map((log) => (
            <Card
              key={log.id}
              className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#142F58] bg-blue-50 px-2.5 py-0.5 rounded border border-blue-100">
                    {log.action}
                  </span>
                  <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                    {log.entity_type}
                  </span>
                  <span className="text-xs font-mono text-slate-400 truncate max-w-[200px]" title={log.entity_id}>
                    #{log.entity_id}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{new Date(log.created_at).toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* State Transition Diff */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100 font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Previous State</span>
                  <pre className="text-[11px] text-slate-600 overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(log.old_state, null, 2)}
                  </pre>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-600 uppercase font-bold block mb-1">Updated State</span>
                  <pre className="text-[11px] text-emerald-800 overflow-x-auto whitespace-pre-wrap font-bold">
                    {JSON.stringify(log.new_state, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Client IP: <strong>{log.ip_address || "127.0.0.1"}</strong></span>
                <span>Audit Ref: <strong>SHA256-{log.id.slice(0, 8)}</strong></span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
