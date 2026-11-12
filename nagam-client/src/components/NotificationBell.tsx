"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bell, CheckCheck, ExternalLink, X, AlertCircle } from "lucide-react";
import { useNotifications } from "@/lib/use-notifications";

export default function NotificationBell() {
  const {
    notifications,
    unreadCount,
    activeToast,
    dismissToast,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <>
      {/* Floating SSE Real-Time Toast Alert */}
      {activeToast && (
        <div className="fixed top-20 right-5 z-50 max-w-sm w-full bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
              <Bell className="w-4 h-4 animate-bounce" />
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                  Real-time Update (SSE)
                </span>
                <button onClick={dismissToast} className="text-slate-400 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs font-bold text-white leading-tight">{activeToast.title}</p>
              <p className="text-[11px] text-slate-300 leading-snug">{activeToast.message}</p>
              {activeToast.link && (
                <a
                  href={activeToast.link}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-400 hover:underline pt-1"
                >
                  <span>View Details</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notification Bell Icon & Dropdown Menu */}
      <div ref={containerRef} className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 rounded-xl text-slate-600 hover:text-[#142F58] hover:bg-slate-100 transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <CheckCheck className="w-3 h-3" />
                  <span>Mark all read</span>
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  No notifications yet. You will be notified in real-time as your applications and grievances update.
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3.5 transition-colors flex items-start gap-3 ${
                      n.is_read ? "bg-white opacity-75" : "bg-blue-50/40"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        n.is_read ? "bg-slate-100 text-slate-500" : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      <AlertCircle className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <strong className="text-xs text-slate-900 block truncate">{n.title}</strong>
                        {!n.is_read && (
                          <button
                            onClick={() => markAsRead(n.id)}
                            className="text-[10px] text-blue-600 hover:underline shrink-0 font-medium"
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">{n.message}</p>
                      <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                        <span>
                          {new Date(n.created_at).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {n.link && (
                          <a href={n.link} className="text-blue-600 font-bold hover:underline">
                            Open Details →
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
              <a
                href="/citizen/notifications"
                onClick={() => setIsOpen(false)}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center gap-1"
              >
                <span>View All in Notification Center →</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
