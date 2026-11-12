"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  ShieldCheck,
  Building,
  Users,
  Layers,
  Settings,
  LogOut,
  ExternalLink,
  Activity,
  Globe,
  Landmark,
} from "lucide-react";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      window.location.href = "/login";
    }
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400 font-medium text-xs">
        Verifying platform super-admin privileges...
      </div>
    );
  }

  if (!user) return null;

  const navItems = [
    {
      label: "Platform Overview",
      href: "/super-admin",
      icon: <Activity className="w-4 h-4" />,
    },
    {
      label: "Municipal Tenants",
      href: "/super-admin/organizations",
      icon: <Building className="w-4 h-4" />,
    },
    {
      label: "Cross-Tenant Users",
      href: "/super-admin/users",
      icon: <Users className="w-4 h-4" />,
    },
    {
      label: "System & Flags",
      href: "/super-admin/settings",
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#080E1A] text-slate-100">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#0B1322] border-r border-slate-800/80 flex flex-col justify-between shrink-0 shadow-2xl">
        <div className="p-6 space-y-6">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-900/30 font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-white block">
                NagarConnect
              </span>
              <span className="text-[10px] text-purple-400 font-bold block uppercase tracking-wider">
                Super Admin Console
              </span>
            </div>
          </div>

          {/* Super Admin Session Card */}
          <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-800/40 space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-purple-300 uppercase">
                Platform Root
              </span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800">
                ACTIVE
              </span>
            </div>
            <p className="text-xs font-bold text-white truncate">{user.email}</p>
            <p className="text-[10px] text-slate-400">Master Multi-Tenant Access</p>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800/60 hover:text-white transition-colors"
              >
                {item.icon}
                <span>{item.label}</span>
              </a>
            ))}
          </nav>

          {/* Inter-App Cross Links */}
          <div className="pt-4 border-t border-slate-800/80 space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block px-1">
              Switch Subsystem
            </span>
            <div className="space-y-1 text-xs">
              <a
                href="http://localhost:3002/admin"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900/60 hover:bg-slate-800/60 text-slate-300 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Landmark className="w-3.5 h-3.5 text-blue-400" />
                  <span>Municipal Admin (3002)</span>
                </div>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>

              <a
                href="http://localhost:3001/citizen"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900/60 hover:bg-slate-800/60 text-slate-300 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Citizen Portal (3001)</span>
                </div>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>

              <a
                href="http://localhost:3000"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900/60 hover:bg-slate-800/60 text-slate-300 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-amber-400" />
                  <span>Public Website (3000)</span>
                </div>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-800/80">
          <button
            onClick={logout}
            className="flex items-center gap-2 text-xs font-bold text-rose-400 hover:text-rose-300 py-1.5 w-full text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Terminate Super Session</span>
          </button>
        </div>
      </aside>

      {/* Main Workplace */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
