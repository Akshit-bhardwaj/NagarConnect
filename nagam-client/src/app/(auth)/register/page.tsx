"use client";

import React, { useState, useEffect } from "react";
import { Button, Input, Select, Card, Alert } from "nagam-ui";
import { Landmark, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function RegisterPage() {
  const { user, isLoading, login } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [cityId, setCityId] = useState("");
  const [wardId, setWardId] = useState("");
  const [address, setAddress] = useState("");

  const [cities, setCities] = useState<{ value: string; label: string }[]>([]);
  const [wards, setWards] = useState<{ value: string; label: string }[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isLoading && user) {
      window.location.href = "/citizen";
    }
  }, [user, isLoading]);

  useEffect(() => {
    async function loadCities() {
      try {
        const data = await apiClient<any[]>("/public/cities");
        setCities(data.map((c) => ({ value: c.id, label: `${c.name} (${c.state})` })));
        if (data.length > 0) {
          setCityId(data[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadCities();
  }, []);

  useEffect(() => {
    async function loadWards() {
      if (!cityId) return;
      try {
        const data = await apiClient<any[]>(`/public/wards?city_id=${cityId}`);
        setWards(data.map((w) => ({ value: w.id, label: `${w.ward_number} - ${w.ward_name}` })));
        if (data.length > 0) {
          setWardId(data[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadWards();
  }, [cityId]);

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
    const errs: Record<string, string> = {};
    if (!firstName.trim() || firstName.trim().length < 2) {
      errs.firstName = "First name must be at least 2 characters.";
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = "Please enter a valid email address.";
    }
    if (phone && !/^\d{10}$/.test(phone.replace(/[\s-]/g, ""))) {
      errs.phone = "Phone number must be a valid 10-digit mobile number.";
    }
    if (!password || password.length < 6) {
      errs.password = "Password must be at least 6 characters long.";
    }
    if (!cityId) {
      errs.cityId = "Please select your municipal city.";
    }
    if (!wardId) {
      errs.wardId = "Please select your municipal ward.";
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const data = await apiClient<any>("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim(),
          password,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone: phone ? phone.trim() : null,
          city_id: cityId || null,
          ward_id: wardId || null,
          address: address.trim(),
        }),
      });
      login(data.access_token, data.user);
      window.location.href = "/citizen";
    } catch (err: any) {
      setError(err.message || "Registration failed. Please check the provided details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#142F58] to-[#0A182F] flex flex-col justify-center items-center p-4 sm:p-6 py-12">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <a href="/" className="inline-flex items-center gap-2 text-white hover:text-slate-300 text-xs font-semibold mb-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Public Homepage</span>
          </a>
          <div className="w-12 h-12 mx-auto rounded-xl bg-white text-[#142F58] flex items-center justify-center shadow-lg">
            <Landmark className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Register Citizen Profile</h1>
          <p className="text-xs text-slate-300">Create an official citizen account to register and track grievances</p>
        </div>

        <Card className="p-6 sm:p-8 space-y-6 bg-white rounded-2xl shadow-2xl border-0">
          {error && <Alert variant="danger">{error}</Alert>}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Rajesh"
                required
              />
              <Input
                label="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Verma"
                required
              />
            </div>

            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rajesh@example.com"
              required
            />

            <Input
              label="Mobile Number (Optional)"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="9876543210"
            />

            <Input
              label="Create Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Select City"
                value={cityId}
                onChange={(e) => setCityId(e.target.value)}
                options={cities}
                required
              />
              <Select
                label="Select Ward"
                value={wardId}
                onChange={(e) => setWardId(e.target.value)}
                options={wards}
                required
              />
            </div>

            <Input
              label="Residential Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="House/Flat number, Colony, Landmark"
            />

            <Button type="submit" isLoading={loading} className="w-full bg-[#142F58] text-white py-3 mt-2">
              Create Citizen Account
            </Button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-600">
              Already registered?{" "}
              <a href="/login" className="font-bold text-[#142F58] hover:underline">
                Sign in here
              </a>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
