"use client";

import React, { useState, useEffect } from "react";
import { Button, Input, Card, Alert } from "nagam-ui";
import { ShieldCheck, ShieldAlert, KeyRound, Building, Layers, Lock, Loader2, CheckCircle2 } from "lucide-react";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function SuperAdminLoginPage() {
  const { user, isLoading, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  useEffect(() => {
    if (!isLoading && user) {
      window.location.href = "/super-admin";
    }
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#060D17] via-[#0C1B33] to-[#0A182F] flex items-center justify-center text-white text-xs font-semibold gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
        <span>Verifying central root authority...</span>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#060D17] via-[#0C1B33] to-[#0A182F] flex flex-col items-center justify-center text-white text-xs font-semibold gap-3 p-4">
        <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        <p className="text-sm font-bold">Root Session Authenticated</p>
        <p className="text-slate-300">Signed in as {user.email}. Redirecting to Super Admin Console...</p>
        <a href="/super-admin" className="text-purple-400 underline font-bold mt-2">Click here if not redirected automatically</a>
      </div>
    );
  }

  const validateForm = () => {
    const errs: { email?: string; password?: string } = {};
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = "Please enter a valid administrator email.";
    }
    if (!password || password.length < 6) {
      errs.password = "Security password must be at least 6 characters.";
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

      if (data.user.user_type !== "PLATFORM_ADMIN") {
        throw new Error("Access denied. Only Platform Super Administrators can access this console.");
      }

      login(data.access_token, data.user);
      window.location.href = "/super-admin";
    } catch (err: any) {
      setError(err.message || "Super Admin authentication failed. Verify credentials.");
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = () => {
    setEmail("superadmin@nagarconnect.gov.in");
    setPassword("NagarConnect@2026");
    setFieldErrors({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#060D17] via-[#0C1B33] to-[#0A182F] flex flex-col justify-center items-center p-4 sm:p-6 text-white">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-2xl ring-4 ring-purple-500/20">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <span className="text-[10px] font-bold tracking-widest uppercase text-purple-400 bg-purple-950/60 border border-purple-800 px-2.5 py-0.5 rounded-full inline-block">
            Central Platform Governance
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight">
            NagarConnect Super Admin
          </h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Multi-Tenant Corporation Provisioning, Staff Permissions & System-Wide Orchestration
          </p>
        </div>

        <Card className="p-6 sm:p-8 space-y-6 bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-2xl">
          {error && <Alert variant="danger">{error}</Alert>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Root Super Admin Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="superadmin@nagarconnect.gov.in"
                className="w-full text-xs bg-slate-950 border border-slate-700 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Master Security Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full text-xs bg-slate-950 border border-slate-700 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                required
              />
            </div>

            <Button
              type="submit"
              isLoading={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-3 font-bold text-xs shadow-lg shadow-purple-900/30 border-0"
            >
              Authenticate Root Session
            </Button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <button
              type="button"
              onClick={setDemoCredentials}
              className="w-full p-2.5 rounded-lg bg-purple-950/40 hover:bg-purple-900/40 border border-purple-800/60 text-purple-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5 text-purple-400" />
              <span>Use Seeded Super Admin Credentials</span>
            </button>
            <p className="text-[10px] text-slate-500 text-center">
              Account: superadmin@nagarconnect.gov.in (Full multi-tenant root privileges)
            </p>
          </div>
        </Card>

        {/* Port routing info */}
        <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Port 3003: Platform Super Admin</span>
          <a
            href="http://localhost:3002/login"
            className="text-purple-400 hover:underline flex items-center gap-1"
          >
            <span>Municipal Admin (3002) →</span>
          </a>
        </div>
      </div>
    </div>
  );
}
