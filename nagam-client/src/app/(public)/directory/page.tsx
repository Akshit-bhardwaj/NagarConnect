"use client";

import React, { useState, useEffect } from "react";
import { Card } from "nagam-ui";
import { apiClient } from "@/lib/api";
import { Phone } from "lucide-react";

interface WardItem {
  id: string;
  ward_number: string;
  ward_name: string;
  zone_name: string;
  office_address: string;
  contact_phone: string;
  localities: { id: string; name: string; postal_code: string }[];
}

export default function DirectoryPage() {
  const [wards, setWards] = useState<WardItem[]>([]);
  const [filterText, setFilterText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWards() {
      try {
        const data = await apiClient<WardItem[]>("/public/wards");
        setWards(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadWards();
  }, []);

  const filtered = wards.filter(
    (w) =>
      w.ward_name.toLowerCase().includes(filterText.toLowerCase()) ||
      w.ward_number.toLowerCase().includes(filterText.toLowerCase()) ||
      w.localities.some((l) => l.name.toLowerCase().includes(filterText.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <span className="text-xs font-bold text-[#245A86] uppercase tracking-wider">Ward & Locality Directory</span>
        <h1 className="text-3xl font-extrabold text-[#142F58]">Municipal Ward Administration & Helplines</h1>
        <p className="text-sm text-slate-500 mt-1">
          Locate your ward office, assigned administrative zone, and direct telephone helpline.
        </p>
      </div>

      <div className="max-w-md">
        <input
          type="text"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          placeholder="Filter by ward name, number, or locality..."
          className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#142F58]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 p-12 text-center text-slate-400">Loading ward directory...</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-2 p-12 text-center text-slate-500 bg-white rounded-xl border">
            No wards match your search filter.
          </div>
        ) : (
          filtered.map((w) => (
            <Card key={w.id} className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-mono font-bold text-[#245A86] bg-blue-50 px-2 py-0.5 rounded">
                    {w.ward_number}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">{w.ward_name}</h3>
                  <span className="text-xs text-slate-500 font-medium">{w.zone_name}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{w.contact_phone || "1800-180-1553"}</span>
                </div>
              </div>

              <div className="text-xs text-slate-600 space-y-1">
                <p><strong>Ward Office:</strong> {w.office_address || "Ward Administrative Office"}</p>
                <div className="pt-2">
                  <span className="font-semibold text-slate-700">Covered Localities:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {w.localities.map((loc) => (
                      <span key={loc.id} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                        {loc.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
