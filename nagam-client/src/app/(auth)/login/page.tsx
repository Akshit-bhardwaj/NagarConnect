"use client";

import React, { useState, useEffect } from "react";
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, Alert } from "nagam-ui";
import { Landmark, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const { user, isLoading, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  useEffect(() => {
    if (!isLoading && user) {
      window.location.href = "/citizen";
    }
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#142F58] to-[#0A182F] flex items-center justify-center text-white text-xs font-semibold gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
        <span>Verifying citizen session...</span>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#142F58] to-[#0A182F] flex flex-col items-center justify-center text-white text-xs font-semibold gap-3 p-4">
        <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        <p className="text-sm font-bold">Already Signed In</p>
        <p className="text-slate-300">Logged in as {user.email}. Redirecting to Citizen Portal...</p>
        <a href="/citizen" className="text-sky-300 underline font-bold mt-2">Click here if not redirected automatically</a>
      </div>
    );
  }

  const validateForm = () => {
    const errors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "Please enter a valid email format (e.g. name@example.com).";
    }

    if (!password) {
      errors.password = "Password is required.";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters long.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
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
      login(data.access_token, data.user);
      window.location.href = "/citizen";
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCitizen = () => {
    setEmail("citizen@example.com");
    setPassword("Citizen@2026");
    setFieldErrors({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#142F58] to-[#0A182F] flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <a href="/" className="inline-flex items-center gap-2 text-white hover:text-slate-300 text-xs font-semibold mb-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Public Homepage</span>
          </a>
          <div className="w-12 h-12 mx-auto rounded-xl bg-white text-[#142F58] flex items-center justify-center shadow-lg">
            <Landmark className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Citizen Portal Login</h1>
          <p className="text-xs text-slate-300">Access your registered complaints, track status, and view civic records</p>
        </div>

        <Card className="p-6 sm:p-8 space-y-6 bg-white rounded-2xl shadow-2xl border-0">
          {error && <Alert variant="danger">{error}</Alert>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                label="Registered Email Address"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder="e.g. rajesh.verma@example.com"
              />
              {fieldErrors.email && (
                <p className="text-[11px] text-rose-600 font-semibold mt-1">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div>
              <Input
                label="Password"
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

            <Button type="submit" isLoading={loading} className="w-full bg-[#142F58] text-white py-3">
              Sign In to Citizen Portal
            </Button>
          </form>

          {/* Demo Account Quick Fill helper */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <p className="text-xs text-slate-500 text-center font-medium">Evaluating the platform demo?</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={fillDemoCitizen}
              className="w-full text-xs text-[#142F58] font-bold"
            >
              Fill Demo Citizen Credentials (Rajesh Verma)
            </Button>
          </div>

          <div className="text-center pt-2">
            <p className="text-xs text-slate-600">
              New citizen user?{" "}
              <a href="/register" className="font-bold text-[#142F58] hover:underline">
                Register an account
              </a>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
