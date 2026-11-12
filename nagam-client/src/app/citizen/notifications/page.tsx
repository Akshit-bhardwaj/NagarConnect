"use client";

import React, { useState } from "react";
import { Card, Badge, Button } from "nagam-ui";
import { useNotifications, NotificationItem } from "@/lib/use-notifications";
import {
  Bell,
  CheckCheck,
  ExternalLink,
  Clock,
  AlertCircle,
  FileText,
  FileCheck,
  Radio,
  Search,
  Filter,
  RefreshCw,
  Sparkles,
} from "lucide-react";

export default function CitizenNotificationsPage() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    loadNotifications,
  } = useNotifications();

  const [filterType, setFilterType] = useState<"ALL" | "UNREAD" | "GRIEVANCES" | "APPLICATIONS">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setTimeout(() => setRefreshing(false), 500);
  };

  const filteredNotifs = notifications.filter((n) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (filterType === "UNREAD") return !n.is_read;
    if (filterType === "GRIEVANCES") return n.link?.includes("/complaints");
    if (filterType === "APPLICATIONS") return n.link?.includes("/applications");

    return true;
  });

  return (
    <div className="space-y-7 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-[#142F58]">
                Real-Time Citizen Stream
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live SSE Notification Channel
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142F58] tracking-tight">
              Notifications & Status Updates
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Live updates regarding your filed complaints, field officer dispatches, and certificate approvals.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start lg:self-auto">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                onClick={markAllAsRead}
                className="text-xs gap-1.5 border-slate-200 hover:bg-slate-50"
              >
                <CheckCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Mark All Read</span>
              </Button>
            )}

            <Button
              onClick={handleRefresh}
              className="bg-[#142F58] hover:bg-[#1a3c6d] text-white text-xs gap-1.5 shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 bg-white border border-slate-200 shadow-xs rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Received</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#142F58] flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#142F58]">{notifications.length}</div>
          <p className="text-[11px] text-slate-400">Total lifetime notifications</p>
        </Card>

        <Card className="p-5 bg-white border border-slate-200 shadow-xs rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Unread Alerts</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-600">{unreadCount}</div>
          <p className="text-[11px] text-amber-700 font-semibold">Requires citizen attention</p>
        </Card>

        <Card className="p-5 bg-white border border-slate-200 shadow-xs rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Delivery Mode</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">Sub-second</div>
          <p className="text-[11px] text-emerald-700 font-semibold">Server-Sent Events active</p>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notification messages or references..."
            className="w-full pl-10 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#142F58] bg-white shadow-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
          {[
            { key: "ALL", label: `All (${notifications.length})` },
            { key: "UNREAD", label: `Unread (${unreadCount})` },
            { key: "GRIEVANCES", label: "Grievances" },
            { key: "APPLICATIONS", label: "Applications" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterType(tab.key as any)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                filterType === tab.key
                  ? "bg-white text-[#142F58] shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      {filteredNotifs.length === 0 ? (
        <Card className="p-12 text-center bg-white border border-slate-200 rounded-2xl">
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-base font-bold text-slate-800">No notifications found</p>
          <p className="text-xs text-slate-400 mt-1">
            Updates will automatically arrive here as municipal staff review your complaints.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNotifs.map((n) => {
            const isGrievance = n.link?.includes("/complaints");
            const isApp = n.link?.includes("/applications");

            return (
              <Card
                key={n.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  n.is_read
                    ? "bg-white border-slate-200"
                    : "bg-blue-50/50 border-blue-200 shadow-xs"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      !n.is_read
                        ? "bg-[#142F58] text-amber-400"
                        : isGrievance
                        ? "bg-blue-50 text-[#142F58]"
                        : "bg-emerald-50 text-emerald-600"
                    }`}
                  >
                    {isGrievance ? (
                      <FileText className="w-5 h-5" />
                    ) : isApp ? (
                      <FileCheck className="w-5 h-5" />
                    ) : (
                      <Bell className="w-5 h-5" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {isGrievance
                          ? "Grievance Triage"
                          : isApp
                          ? "Service Application"
                          : "Civic Advisory"}
                      </span>
                      {!n.is_read && (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                          NEW UPDATE
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{n.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1 font-medium">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(n.created_at).toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto border-t sm:border-t-0 pt-2 sm:pt-0">
                  {n.link && (
                    <a
                      href={n.link}
                      onClick={() => !n.is_read && markAsRead(n.id)}
                      className="inline-flex items-center gap-1.5 bg-[#142F58] hover:bg-[#1a3c6d] text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-xs"
                    >
                      <span>View Dossier</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  {!n.is_read && (
                    <button
                      onClick={() => markAsRead(n.id)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 px-3 py-2 rounded-xl hover:bg-blue-50 transition-colors"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
