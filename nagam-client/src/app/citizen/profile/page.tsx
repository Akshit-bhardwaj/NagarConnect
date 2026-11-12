"use client";

import React, { useState, useEffect } from "react";
import { Button, Input, Select, Card, Alert } from "nagam-ui";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { User, ShieldCheck } from "lucide-react";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [prefLang, setPrefLang] = useState("en");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user?.citizen_profile) {
      setFirstName(user.citizen_profile.first_name || "");
      setLastName(user.citizen_profile.last_name || "");
      setAddress(user.citizen_profile.address || "");
      setPrefLang(user.citizen_profile.preferred_language || "en");
    }
  }, [user]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      await apiClient("/citizen/profile", {
        method: "PATCH",
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          address,
          preferred_language: prefLang,
        }),
      });
      await refreshUser();
      setSuccess(true);
    } catch (err: any) {
      alert(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#142F58]">Citizen Account & Profile</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Manage your verified residential address and contact details.
        </p>
      </div>

      <Card className="p-6 sm:p-8 bg-white space-y-6 rounded-2xl shadow-sm">
        {success && <Alert variant="success">Profile details updated successfully.</Alert>}

        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <Input
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>

          <Input
            label="Email Address"
            value={user?.email || ""}
            disabled
            helperText="Email is permanently bound to this citizen record."
          />

          <Input
            label="Residential Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="House/Ward address"
          />

          <Select
            label="Preferred Communication Language"
            value={prefLang}
            onChange={(e) => setPrefLang(e.target.value)}
            options={[
              { value: "en", label: "English" },
              { value: "hi", label: "हिन्दी (Hindi)" },
            ]}
          />

          <Button type="submit" isLoading={loading} className="w-full bg-[#142F58] text-white py-3">
            Save Profile Changes
          </Button>
        </form>
      </Card>
    </div>
  );
}
