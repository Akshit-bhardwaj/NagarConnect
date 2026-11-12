"use client";

import React, { useState, useEffect } from "react";
import { Button, Input, Select, Card, Alert } from "nagam-ui";
import { apiClient } from "@/lib/api";
import { ArrowLeft, FileText, CheckCircle2 } from "lucide-react";

export default function NewApplicationPage() {
  const [services, setServices] = useState<any[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadServices() {
      try {
        const data = await apiClient<any[]>("/public/services");
        setServices(data || []);
        if (data.length > 0) {
          // Check URL query param if present
          const urlParams = new URLSearchParams(window.location.search);
          const srvId = urlParams.get("service_id");
          setSelectedServiceId(srvId || data[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadServices();
  }, []);

  const currentService = services.find((s) => s.id === selectedServiceId);

  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await apiClient("/citizen/applications", {
        method: "POST",
        body: JSON.stringify({
          service_id: selectedServiceId,
          form_data: formData,
        }),
      });
      window.location.href = "/citizen/applications";
    } catch (err: any) {
      setError(err.message || "Failed to submit application. Please review form entries.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="space-y-1">
        <a
          href="/citizen/applications"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#245A86] hover:text-[#142F58] mb-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Applications</span>
        </a>
        <h1 className="text-2xl font-extrabold text-[#142F58]">Apply for Municipal Service</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Electronic submission under Public Services Guarantee Act.
        </p>
      </div>

      <Card className="p-6 sm:p-8 bg-white space-y-6 rounded-2xl shadow-sm">
        {error && <Alert variant="danger">{error}</Alert>}

        <div className="space-y-2">
          <Select
            label="Select Civic Service"
            value={selectedServiceId}
            onChange={(e) => {
              setSelectedServiceId(e.target.value);
              setFormData({});
            }}
            options={services.map((s) => ({ value: s.id, label: `${s.title} (SLA: ${s.sla_days} days)` }))}
            required
          />
          {currentService && (
            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
              {currentService.description}
            </p>
          )}
        </div>

        {currentService && (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-slate-100">
            <h4 className="text-sm font-bold text-[#142F58]">Required Application Information</h4>
            {currentService.form_schema?.fields?.map((field: any) => (
              <Input
                key={field.name}
                label={field.label}
                type={field.type === "date" ? "date" : field.type === "number" ? "number" : "text"}
                value={formData[field.name] || ""}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                required={field.required}
              />
            ))}

            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-900 space-y-1">
              <p className="font-bold">Required Documents for Verification:</p>
              <ul className="list-disc pl-4 space-y-0.5">
                {currentService.required_documents?.map((doc: any) => (
                  <li key={doc.code}>{doc.title}</li>
                ))}
              </ul>
            </div>

            <Button type="submit" isLoading={loading} className="w-full bg-[#142F58] text-white py-3">
              Submit Application
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
