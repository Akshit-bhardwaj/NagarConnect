"use client";

import React, { useState, useEffect } from "react";
import { Button, Input, Card, Alert } from "nagam-ui";
import { Landmark, ShieldAlert, UserCheck, Shield, Loader2, CheckCircle2 } from "lucide-react";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function AdminLoginPage() {
  const { user, isLoading, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  useEffect(() => {
    if (!isLoading && user) {
      if (user.user_type === "PLATFORM_ADMIN") {
        window.location.href = "/super-admin/organizations";
      } else {
        window.location.href = "/admin";
      }
    }
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F1E36] via-[#142F58] to-[#0A182F] flex items-center justify-center text-white text-xs font-semibold gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
        <span>Authenticating administrative session...</span>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F1E36] via-[#142F58] to-[#0A182F] flex flex-col items-center justify-center text-white text-xs font-semibold gap-3 p-4">
        <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        <p className="text-sm font-bold">Already Authenticated</p>
        <p className="text-slate-300">Signed in as {user.email}. Redirecting to Municipal Console...</p>
        <a href="/admin" className="text-amber-400 underline font-bold mt-2">Click here if not redirected automatically</a>
      </div>
    );
  }

  const validateForm = () => {
    const errs: { email?: string; password?: string } = {};
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = "Please enter a valid staff email address.";
    }
    if (!password || password.length < 6) {
      errs.password = "Password must be at least 6 characters.";
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const data = await apiClient<any>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (data.user.user_type === "CITIZEN") {
        throw new Error("Citizens must log in via the nagam-client portal");
      }

      login(data.access_token, data.user);

      if (data.user.user_type === "PLATFORM_ADMIN") {
        window.location.href = "/super-admin/organizations";
      } else {
        window.location.href = "/admin";
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed. Check your staff credentials.");
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (e: string, p: string = "NagarConnect@2026") => {
    setEmail(e);
    setPassword(p);
    setFieldErrors({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F1E36] via-[#142F58] to-[#0A182F] flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-white text-[#142F58] flex items-center justify-center shadow-xl">
            <Landmark className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Municipal Administration Console</h1>
          <p className="text-xs text-slate-300">
            Secure access for Corporation Officers, Department Leads, Ward Teams & System Administrators
          </p>
        </div>

        <Card className="p-6 sm:p-8 space-y-6 bg-white rounded-2xl shadow-2xl border-0">
          {error && <Alert variant="danger">{error}</Alert>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                label="Official Staff Email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder="e.g. officer@lmc.gov.in"
              />
              {fieldErrors.email && (
                <p className="text-[11px] text-rose-600 font-semibold mt-1">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div>
              <Input
                label="Staff Password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
                }}
                placeholder="••••••••••••"
              />
              {fieldErrors.password && (
                <p className="text-[11px] text-rose-600 font-semibold mt-1">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <Button type="submit" isLoading={loading} className="w-full bg-[#142F58] text-white py-3 font-bold">
              Sign In to Administration Console
            </Button>
          </form>

          {/* Quick Demo Credentials Strip */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center">
              Quick Test Accounts (Seeded)
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setDemoCredentials("admin@lmc.gov.in")}
                className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:bg-[#EAF1F6] text-left transition-colors"
              >
                <span className="font-bold block text-[#142F58]">Municipal Admin</span>
                <span className="text-[10px] text-slate-500">Corporation-wide scope</span>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials("officer.sanitation@lmc.gov.in")}
                className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:bg-[#EAF1F6] text-left transition-colors"
              >
                <span className="font-bold block text-blue-800">Dept Officer</span>
                <span className="text-[10px] text-slate-500">Sanitation Dept scope</span>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials("ward.hazratganj@lmc.gov.in")}
                className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:bg-[#EAF1F6] text-left transition-colors"
              >
                <span className="font-bold block text-emerald-800">Ward Officer</span>
                <span className="text-[10px] text-slate-500">Ward 01 (Hazratganj)</span>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials("superadmin@nagarconnect.gov.in")}
                className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:bg-[#EAF1F6] text-left transition-colors"
              >
                <span className="font-bold block text-purple-800">Platform Super Admin</span>
                <span className="text-[10px] text-slate-500">Cross-tenant platform</span>
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
