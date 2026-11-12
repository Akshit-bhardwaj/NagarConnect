"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { apiClient } from "@/lib/api";
import {
  Landmark,
  LayoutDashboard,
  AlertCircle,
  FileCheck,
  Building,
  MapPin,
  FileText,
  ShieldCheck,
  LogOut,
  Bell,
  Layers,
  ChevronRight,
  Shield,
  Activity,
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const pathname = usePathname();
  const [counts, setCounts] = useState<{ complaints?: number; applications?: number }>({});

  useEffect(() => {
    if (!isLoading && !user) {
      window.location.href = "/login";
    }
  }, [user, isLoading]);

  useEffect(() => {
    if (user) {
      apiClient<any>("/admin/dashboard/stats")
        .then((data) => {
          if (data) {
            setCounts({
              complaints: data.submitted ?? data.total_complaints,
              applications: data.pending_applications ?? 0,
            });
          }
        })
        .catch(() => {});
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-300 font-medium">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <span>Authenticating municipal administrative console...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const navItems = [
    {
      label: "Overview",
      href: "/admin",
      icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
      exact: true,
    },
    {
      label: "Grievances Queue",
      href: "/admin/complaints",
      icon: <AlertCircle className="w-4 h-4 shrink-0" />,
      badge: counts.complaints !== undefined && counts.complaints > 0 ? `${counts.complaints}` : null,
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    },
    {
      label: "Service Applications",
      href: "/admin/applications",
      icon: <FileCheck className="w-4 h-4 shrink-0" />,
      badge: counts.applications !== undefined && counts.applications > 0 ? `${counts.applications}` : null,
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    },
    {
      label: "Departments",
      href: "/admin/departments",
      icon: <Building className="w-4 h-4 shrink-0" />,
    },
    {
      label: "Wards & Geography",
      href: "/admin/wards",
      icon: <MapPin className="w-4 h-4 shrink-0" />,
    },
    {
      label: "Notices & Tenders",
      href: "/admin/notices",
      icon: <FileText className="w-4 h-4 shrink-0" />,
    },
    {
      label: "Audit Logs",
      href: "/admin/audit",
      icon: <ShieldCheck className="w-4 h-4 shrink-0" />,
    },
  ];

  const officerName = user.email;

  const designation =
    user.staff_profile?.designation ||
    (user.roles && user.roles[0]) ||
    "Municipal Administrative Officer";

  return (
    <div className="h-screen flex flex-col md:flex-row bg-[#F1F5F9] overflow-hidden">
      {/* Sleek, proportional sidebar covering exact page height */}
      <aside className="w-full md:w-64 bg-[#0B192C] text-white flex flex-col justify-between shrink-0 shadow-xl border-r border-[#1B2F4C] z-30 h-screen overflow-y-auto">
        <div className="p-4 sm:p-5 space-y-5">
          {/* Header Branding */}
          <div className="flex items-center gap-3 pb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-[#0B192C] flex items-center justify-center font-black shadow-md shadow-amber-500/10 shrink-0">
              <Landmark className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black tracking-tight text-white truncate">NagarConnect</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              </div>
              <span className="text-[10px] text-amber-400 font-extrabold block uppercase tracking-wider">
                Municipal Console
              </span>
            </div>
          </div>

          {/* Current Officer Identity Card */}
          <div className="p-3 rounded-xl bg-[#142640] border border-[#233F68]/60 space-y-1.5 shadow-inner">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Shield className="w-3 h-3 text-amber-400" />
                Officer
              </span>
              <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded-full border border-emerald-700/60 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-emerald-400" />
                ACTIVE
              </span>
            </div>
            <p className="text-xs font-bold text-white truncate" title={officerName}>
              {officerName}
            </p>
            <p className="text-[11px] text-amber-300 font-medium truncate">
              {designation}
            </p>
            <div className="pt-1.5 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
              <span className="truncate">Lucknow Nagar Nigam</span>
              <span className="font-mono text-[9px] text-slate-500 shrink-0">Zone-01</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));

              return (
                <a
                  key={item.label}
                  href={item.href}
                  className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-[#1E40AF] text-white shadow-md shadow-blue-900/30 border-l-4 border-amber-400"
                      : "text-slate-300 hover:bg-[#142640] hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`shrink-0 transition-colors duration-200 ${
                        isActive ? "text-amber-300" : "text-slate-400 group-hover:text-amber-300"
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="truncate tracking-wide">{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.badge && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${item.badgeColor || "bg-white/10 text-white"}`}
                      >
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isActive
                          ? "text-amber-400 translate-x-0.5"
                          : "text-slate-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5"
                      }`}
                    />
                  </div>
                </a>
              );
            })}
          </nav>

          {/* Platform Super Admin Shortcut if authorized */}
          {user.user_type === "PLATFORM_ADMIN" && (
            <div className="pt-2 border-t border-[#1B2F4C]">
              <a
                href="/super-admin/organizations"
                className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-purple-300 bg-purple-950/40 hover:bg-purple-900/60 border border-purple-800/60 transition-colors shadow-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Layers className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span className="truncate">Platform Super Admin</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              </a>
            </div>
          )}
        </div>

        {/* Footer with Session Control */}
        <div className="p-4 border-t border-[#1B2F4C] bg-[#081322]/50">
          <button
            onClick={logout}
            className="flex items-center gap-2 text-xs font-bold text-rose-300 hover:text-rose-100 hover:bg-rose-950/40 px-3 py-2 rounded-xl w-full text-left transition-colors border border-transparent hover:border-rose-900/40"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>

      {/* Main Administrative Workplace */}
      <main className="flex-1 h-screen overflow-y-auto p-4 sm:p-6 lg:p-8 w-full min-w-0">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
