"use client";

import React, { useState, useEffect } from "react";
import { Card, Badge, Button, Input, Alert } from "nagam-ui";
import { apiClient } from "@/lib/api";
import {
  Building,
  PlusCircle,
  Search,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

export default function SuperAdminOrganizationsPage() {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal 1: Provision Organization
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [state, setState] = useState("Uttar Pradesh");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");

  // Modal 2: Onboard Admin for Organization
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminDesignation, setAdminDesignation] = useState("Municipal Commissioner");
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [adminSuccess, setAdminSuccess] = useState("");

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      const data = await apiClient<any[]>("/super-admin/organizations");
      setOrganizations(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrganizations();
  }, []);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    setCreateLoading(true);

    try {
      await apiClient("/super-admin/organizations", {
        method: "POST",
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          name: name.trim(),
          state: state.trim(),
          branding: { primary_color: "#142F58" },
          config: { default_sla_hours: 48 },
          is_active: true,
        }),
      });

      setCreateModalOpen(false);
      setCode("");
      setName("");
      loadOrganizations();
    } catch (err: any) {
      setCreateError(err.message || "Failed to provision municipal corporation");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError("");
    setAdminSuccess("");
    setAdminLoading(true);

    try {
      await apiClient(`/super-admin/organizations/${selectedOrgId}/admin`, {
        method: "POST",
        body: JSON.stringify({
          email: adminEmail.trim().toLowerCase(),
          password: adminPassword,
          employee_id: `ADM-${Date.now().toString().slice(-4)}`,
          designation: adminDesignation,
        }),
      });

      setAdminSuccess(`Admin account ${adminEmail} created successfully!`);
      setTimeout(() => {
        setAdminModalOpen(false);
        setAdminEmail("");
        setAdminPassword("");
        setAdminSuccess("");
      }, 2000);
    } catch (err: any) {
      setAdminError(err.message || "Failed to onboard municipal administrator");
    } finally {
      setAdminLoading(false);
    }
  };

  const handleToggleActive = async (org: any) => {
    try {
      await apiClient(`/super-admin/organizations/${org.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          is_active: !org.is_active,
        }),
      });
      loadOrganizations();
    } catch (err: any) {
      alert(err.message || "Failed to update tenant status");
    }
  };

  const filtered = organizations.filter(
    (o) =>
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.code.toLowerCase().includes(search.toLowerCase()) ||
      o.state.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
            Multi-Tenant Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Municipal Corporation Tenants
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Provision new municipal entities, configure SLA baselines, and assign nodal administrators.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setCreateModalOpen(true)}
            className="bg-purple-600 hover:bg-purple-500 text-white text-xs gap-1.5 shadow-lg shadow-purple-900/30"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Provision New Corporation</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={loadOrganizations}
            className="text-xs border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by corporation name, code (e.g. LMC), or state..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Organizations Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="p-4">Tenant Code</th>
                <th className="p-4">Corporation Name</th>
                <th className="p-4">State / Jurisdiction</th>
                <th className="p-4">Status</th>
                <th className="p-4">Default SLA</th>
                <th className="p-4">Created Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Loading municipal corporations...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No municipal corporations found.
                  </td>
                </tr>
              ) : (
                filtered.map((org) => (
                  <tr key={org.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-purple-300">
                      <span className="bg-purple-950/70 px-2 py-0.5 rounded border border-purple-800/60">
                        {org.code}
                      </span>
                    </td>

                    <td className="p-4 font-bold text-white">{org.name}</td>

                    <td className="p-4 text-slate-400">{org.state}</td>

                    <td className="p-4">
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          org.is_active
                            ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800"
                            : "bg-rose-950/80 text-rose-400 border border-rose-800"
                        }`}
                      >
                        {org.is_active ? "ACTIVE" : "SUSPENDED"}
                      </span>
                    </td>

                    <td className="p-4 font-mono">
                      {org.config?.default_sla_hours || 48} Hours
                    </td>

                    <td className="p-4 text-slate-400">
                      {org.created_at
                        ? new Date(org.created_at).toLocaleDateString("en-IN")
                        : "Seeded"}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedOrgId(org.id);
                            setAdminModalOpen(true);
                          }}
                          className="text-[11px] py-1 px-2 border-slate-700 text-purple-300 hover:bg-purple-950/40"
                        >
                          <UserPlus className="w-3 h-3 mr-1" />
                          <span>Add Admin</span>
                        </Button>

                        <button
                          onClick={() => handleToggleActive(org)}
                          title={org.is_active ? "Suspend Tenant" : "Activate Tenant"}
                          className="p-1 rounded text-slate-400 hover:text-white"
                        >
                          {org.is_active ? (
                            <ToggleRight className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <ToggleLeft className="w-5 h-5 text-slate-600" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Provision Organization */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">
                  Provision Municipal Corporation
                </h3>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {createError && <Alert variant="danger">{createError}</Alert>}

            <form onSubmit={handleCreateOrg} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Corporation Code (Unique Acronym)
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. KMC"
                  maxLength={10}
                  className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono uppercase focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Full Corporation Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Kanpur Municipal Corporation"
                  className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  State / Union Territory
                </label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateModalOpen(false)}
                  className="text-xs border-slate-700 text-slate-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={createLoading}
                  className="bg-purple-600 hover:bg-purple-500 text-white text-xs"
                >
                  Create Corporation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Onboard Admin */}
      {adminModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">
                  Onboard Municipal Administrator
                </h3>
              </div>
              <button
                onClick={() => setAdminModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {adminError && <Alert variant="danger">{adminError}</Alert>}
            {adminSuccess && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded-xl text-emerald-400 text-xs font-bold">
                {adminSuccess}
              </div>
            )}

            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Administrator Official Email
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="e.g. commissioner@kmc.gov.in"
                  className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Initial Temporary Password
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Designation / Official Title
                </label>
                <input
                  type="text"
                  value={adminDesignation}
                  onChange={(e) => setAdminDesignation(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAdminModalOpen(false)}
                  className="text-xs border-slate-700 text-slate-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={adminLoading}
                  className="bg-purple-600 hover:bg-purple-500 text-white text-xs"
                >
                  Create Admin Account
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
