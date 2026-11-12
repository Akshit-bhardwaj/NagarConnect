"use client";

import React, { useState, useEffect } from "react";
import { Card, Button } from "nagam-ui";
import { apiClient } from "@/lib/api";
import { Clock, ArrowRight } from "lucide-react";

interface ServiceItem {
  id: string;
  code: string;
  title: string;
  description: string;
  department_name?: string;
  sla_days: number;
  fee_amount: number;
}

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchServices() {
      try {
        const data = await apiClient<ServiceItem[]>("/public/services");
        setServices(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <span className="text-xs font-bold text-[#245A86] uppercase tracking-wider">Citizen Directory</span>
        <h1 className="text-3xl font-extrabold text-[#142F58]">Municipal Civic Services Directory</h1>
        <p className="text-sm text-slate-500 mt-1">
          Apply online for vital municipal certificates, domestic water connections, and property tax mutations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 p-12 text-center text-slate-400">Loading civic services...</div>
        ) : (
          services.map((s) => (
            <Card key={s.id} className="p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono font-bold text-[#245A86] bg-blue-50 px-2 py-0.5 rounded">
                    {s.code}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-slate-500 font-semibold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>SLA: {s.sla_days} Days</span>
                  </div>
                </div>
                <h3 className="text-base font-bold text-[#142F58] leading-snug">{s.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{s.description}</p>
                {s.department_name && (
                  <p className="text-[11px] font-semibold text-slate-400">Dept: {s.department_name}</p>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Statutory Fee</span>
                  <span className="text-sm font-extrabold text-slate-900">
                    {s.fee_amount > 0 ? `₹${s.fee_amount}` : "Free"}
                  </span>
                </div>
                <Button
                  onClick={() => (window.location.href = `/citizen/applications/new?service_id=${s.id}`)}
                  size="sm"
                  className="bg-[#142F58] text-white gap-1"
                >
                  <span>Apply Online</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
