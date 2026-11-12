"use client";

import React, { useState, useEffect } from "react";
import { Card, Badge, Button, Input } from "nagam-ui";
import { apiClient } from "@/lib/api";
import {
  Users,
  Search,
  Filter,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Building,
  UserCheck,
  Lock,
  AlertCircle,
  X,
} from "lucide-react";

export default function SuperAdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState("ALL");
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient<any[]>("/super-admin/users");
      setUsers(data || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to retrieve user directory from system.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleStatus = async (user: any) => {
    try {
      await apiClient(`/super-admin/users/${user.id}/status`, {
        method: "PATCH",
      });
      loadUsers();
    } catch (err: any) {
      alert(err.message || "Failed to update user status");
    }
  };

  const filtered = users.filter((u) => {
    const matchesSearch =
      !search ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.organization_name &&
        u.organization_name.toLowerCase().includes(search.toLowerCase())) ||
      (u.designation && u.designation.toLowerCase().includes(search.toLowerCase()));

    const matchesType =
      userTypeFilter === "ALL" || u.user_type === userTypeFilter;

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
            Identity & Access Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Cross-Tenant User & Role Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Total {users.length} accounts indexed across platform super admins, municipal staff, and citizens.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadUsers}
          className="text-xs border-slate-700 text-slate-300 hover:bg-slate-800"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span className="ml-1.5">Refresh Users</span>
        </Button>
      </div>

      {/* Error state banner if fetch fails */}
      {error && (
        <div className="p-4 bg-rose-950/60 border border-rose-800 rounded-xl flex items-center justify-between text-xs text-rose-300 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={loadUsers}
            className="text-xs border-rose-700 hover:bg-rose-900/50 text-rose-200"
          >
            Retry Fetch
          </Button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { key: "ALL", label: `All Users (${users.length})` },
            { key: "PLATFORM_ADMIN", label: "Platform Super Admins" },
            { key: "STAFF", label: "Municipal Staff & Admins" },
            { key: "CITIZEN", label: "Registered Citizens" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setUserTypeFilter(item.key)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                userTypeFilter === item.key
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email, municipal corporation, or designation..."
            className="w-full pl-9 pr-8 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300 p-0.5 rounded-full"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="p-4">User Email & Type</th>
                <th className="p-4">Municipal Organization</th>
                <th className="p-4">Assigned Roles</th>
                <th className="p-4">Designation</th>
                <th className="p-4">Account Status</th>
                <th className="p-4">Registered Date</th>
                <th className="p-4 text-right">Access Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              {loading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="p-4"><div className="w-36 h-4 bg-slate-800 rounded mb-1" /><div className="w-20 h-3 bg-slate-800/60 rounded" /></td>
                    <td className="p-4"><div className="w-32 h-4 bg-slate-800 rounded mb-1" /><div className="w-16 h-3 bg-slate-800/60 rounded" /></td>
                    <td className="p-4"><div className="w-20 h-4 bg-slate-800 rounded" /></td>
                    <td className="p-4"><div className="w-24 h-4 bg-slate-800 rounded" /></td>
                    <td className="p-4"><div className="w-16 h-5 bg-slate-800 rounded-full" /></td>
                    <td className="p-4"><div className="w-20 h-4 bg-slate-800 rounded" /></td>
                    <td className="p-4 text-right"><div className="w-16 h-6 bg-slate-800 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    <div className="max-w-sm mx-auto space-y-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                        <Search className="w-5 h-5" />
                      </div>
                      <p className="text-sm font-bold text-white">
                        {search ? `No accounts matching "${search}"` : "No accounts found"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {search || userTypeFilter !== "ALL"
                          ? "Try modifying search terms or resetting role filters."
                          : "No users exist in the platform database."}
                      </p>
                      {(search || userTypeFilter !== "ALL") && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSearch("");
                            setUserTypeFilter("ALL");
                          }}
                          className="text-xs border-slate-700 text-slate-300 hover:bg-slate-800 mx-auto mt-2"
                        >
                          Reset Filters
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-white">{u.email}</p>
                      <span
                        className={`inline-block text-[10px] font-bold px-1.5 py-0.2 rounded mt-0.5 ${
                          u.user_type === "PLATFORM_ADMIN"
                            ? "bg-purple-950 text-purple-300 border border-purple-800"
                            : u.user_type === "STAFF"
                            ? "bg-blue-950 text-blue-300 border border-blue-800"
                            : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                        }`}
                      >
                        {u.user_type}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className="font-medium text-slate-300 block">
                        {u.organization_name}
                      </span>
                      <span className="text-[10px] font-mono text-purple-400">
                        {u.organization_code}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {u.roles && u.roles.length > 0 ? (
                          u.roles.map((r: string) => (
                            <span
                              key={r}
                              className="text-[10px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-300"
                            >
                              {r}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-500 text-[11px]">Citizen</span>
                        )}
                      </div>
                    </td>

                    <td className="p-4 text-slate-400">
                      {u.designation || "N/A"}
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          u.is_active
                            ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800"
                            : "bg-rose-950/80 text-rose-400 border border-rose-800"
                        }`}
                      >
                        {u.is_active ? "ACTIVE" : "SUSPENDED"}
                      </span>
                    </td>

                    <td className="p-4 text-slate-500">
                      {u.created_at
                        ? new Date(u.created_at).toLocaleDateString("en-IN")
                        : "Seeded"}
                    </td>

                    <td className="p-4 text-right">
                      {u.user_type !== "PLATFORM_ADMIN" ? (
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`text-xs font-bold px-2.5 py-1 rounded transition-colors ${
                            u.is_active
                              ? "text-rose-400 hover:bg-rose-950/50"
                              : "text-emerald-400 hover:bg-emerald-950/50"
                          }`}
                        >
                          {u.is_active ? "Suspend" : "Activate"}
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">
                          Protected Root
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
