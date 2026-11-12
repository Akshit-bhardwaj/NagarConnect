"use client";

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "./api";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeToast, setActiveToast] = useState<{
    id: string;
    title: string;
    message: string;
    link?: string;
  } | null>(null);

  const loadNotifications = useCallback(async () => {
    try {
      const data = await apiClient<NotificationItem[]>("/notifications");
      setNotifications(data || []);
      setUnreadCount((data || []).filter((n) => !n.is_read).length);
    } catch {
      // not logged in or endpoint unavailable
    }
  }, []);

  // Real-Time SSE Stream Listener
  useEffect(() => {
    loadNotifications();

    if (typeof window === "undefined") return;
    const token = localStorage.getItem("access_token");
    if (!token) return;

    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
    const eventSource = new EventSource(`${apiBase}/notifications/stream?token=${encodeURIComponent(token)}`);

    const handleEvent = (event: MessageEvent) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload && payload.title) {
          // Trigger instant visual toast
          setActiveToast({
            id: payload.id || String(Date.now()),
            title: payload.title,
            message: payload.message,
            link: payload.link,
          });

          // Add to notifications list
          setNotifications((prev) => [
            {
              id: payload.id || String(Date.now()),
              title: payload.title,
              message: payload.message,
              link: payload.link,
              is_read: false,
              created_at: payload.created_at || new Date().toISOString(),
            },
            ...prev,
          ]);

          setUnreadCount((prev) => prev + 1);

          // Auto dismiss toast after 6 seconds
          setTimeout(() => {
            setActiveToast(null);
          }, 6000);
        }
      } catch (err) {
        console.error("SSE parse error:", err);
      }
    };

    eventSource.addEventListener("notification", handleEvent);
    eventSource.addEventListener("COMPLAINT_STATUS_UPDATED", handleEvent);
    eventSource.addEventListener("APPLICATION_DECISION", handleEvent);
    eventSource.addEventListener("COMPLAINT_ASSIGNED", handleEvent);
    eventSource.addEventListener("COMPLAINT_SUBMITTED", handleEvent);

    return () => {
      eventSource.close();
    };
  }, [loadNotifications]);

  const markAsRead = async (id: string) => {
    try {
      await apiClient(`/notifications/${id}/read`, { method: "PATCH" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient("/notifications/read-all", { method: "POST" });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  return {
    notifications,
    unreadCount,
    activeToast,
    dismissToast: () => setActiveToast(null),
    markAsRead,
    markAllAsRead,
    refreshNotifications: loadNotifications,
    loadNotifications,
  };
}
