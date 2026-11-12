"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  Landmark,
  LayoutDashboard,
  PlusCircle,
  FileText,
  FileCheck,
  FolderOpen,
  Bell,
  User,
  HelpCircle,
  Search,
  ChevronDown,
  LogOut,
} from "lucide-react";
import NotificationBell from "@/components/NotificationBell";

export default function CitizenLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const pathname = usePathname();
  const [selectedCity, setSelectedCity] = useState("Lucknow, UP");

  useEffect(() => {
    if (!isLoading && !user) {
      window.location.href = "/login";
    }
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-medium">
        Loading NagarConnect citizen session...
      </div>
    );
  }

  if (!user) return null;

  const citizenName = user.citizen_profile?.first_name
    ? `${user.citizen_profile.first_name} ${user.citizen_profile.last_name || ""}`.trim()
    : "Rajesh Verma";

  const navItems = [
    { label: "Dashboard", href: "/citizen", icon: <LayoutDashboard className="w-4 h-4" />, exact: true },
    { label: "New Complaint", href: "/citizen/complaints/new", icon: <PlusCircle className="w-4 h-4" /> },
    { label: "My Complaints", href: "/citizen/complaints", icon: <FileText className="w-4 h-4" />, exact: true },
    { label: "My Applications", href: "/citizen/applications", icon: <FileCheck className="w-4 h-4" /> },
    { label: "My Documents", href: "/citizen/documents", icon: <FolderOpen className="w-4 h-4" /> },
    { label: "Notifications", href: "/citizen/notifications", icon: <Bell className="w-4 h-4" /> },
    { label: "My Profile", href: "/citizen/profile", icon: <User className="w-4 h-4" /> },
    { label: "Help & Support", href: "/citizen/support", icon: <HelpCircle className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* 1. Top Navbar */}
      <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <a href="/citizen" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#142F58] text-white flex items-center justify-center shadow-xs">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <span className="text-base font-black text-[#142F58] tracking-tight">NagarConnect</span>
              <span className="text-[10px] text-blue-600 font-bold block uppercase tracking-wider">
                Citizen Portal
              </span>
            </div>
          </a>

          {/* Center Links with dynamic active highlighting */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <a
              href="/citizen"
              className={pathname === "/citizen" ? "text-blue-600 font-bold" : "hover:text-blue-600 transition-colors"}
            >
              Home
            </a>
            <a
              href="/citizen/complaints"
              className={pathname.startsWith("/citizen/complaints") ? "text-blue-600 font-bold" : "hover:text-blue-600 transition-colors"}
            >
              My Complaints
            </a>
            <a
              href="/citizen/applications"
              className={pathname.startsWith("/citizen/applications") ? "text-blue-600 font-bold" : "hover:text-blue-600 transition-colors"}
            >
              My Applications
            </a>
            <a
              href="/citizen/notifications"
              className={pathname === "/citizen/notifications" ? "text-blue-600 font-bold" : "hover:text-blue-600 transition-colors"}
            >
              Notifications
            </a>
            <a
              href="/citizen/documents"
              className={pathname === "/citizen/documents" ? "text-blue-600 font-bold" : "hover:text-blue-600 transition-colors"}
            >
              My Documents
            </a>
            <a
              href="/citizen/support"
              className={pathname === "/citizen/support" ? "text-blue-600 font-bold" : "hover:text-blue-600 transition-colors"}
            >
              Help & Support
            </a>
          </nav>

          {/* Right Section: Search, Bell, User Profile */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center bg-slate-100 rounded-full px-3 py-1.5 border border-slate-200">
              <Search className="w-3.5 h-3.5 text-slate-400 mr-2" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none w-32"
              />
            </div>

            <NotificationBell />

            {/* User Profile Avatar */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs flex items-center justify-center">
                {citizenName.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-xs font-bold text-slate-900 block leading-tight">{citizenName}</span>
                <span className="text-[10px] text-slate-500 font-medium block">Citizen</span>
              </div>
              <button
                onClick={logout}
                title="Sign Out"
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Body with Sidebar + Content */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Left Sidebar: Sticky and neatly proportioned */}
        <aside className="w-56 bg-white border-r border-slate-200 shrink-0 p-4 space-y-1 hidden md:block sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || (item.href !== "/citizen" && pathname.startsWith(item.href));

            return (
              <a
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#EAF1F6] text-[#142F58] font-bold shadow-xs"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span className={isActive ? "text-[#142F58]" : "text-slate-400"}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </a>
            );
          })}
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}


