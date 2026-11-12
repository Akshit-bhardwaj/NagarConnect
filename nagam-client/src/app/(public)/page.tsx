"use client";

import React, { useState, useEffect } from "react";
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from "nagam-ui";
import {
  Search,
  MapPin,
  FileText,
  AlertTriangle,
  Building,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Droplet,
  Trash2,
  Lightbulb,
  PhoneCall,
  Sparkles,
} from "lucide-react";
import { apiClient } from "@/lib/api";

interface CityItem {
  id: string;
  name: string;
  state: string;
  pin_code: string;
  description: string;
  photo_url: string;
  ward_count: number;
}

interface NoticeItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  created_at: string;
}

export default function HomePage() {
  const [cities, setCities] = useState<CityItem[]>([]);
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [citiesData, noticesData] = await Promise.all([
          apiClient<CityItem[]>("/public/cities"),
          apiClient<NoticeItem[]>("/public/notices"),
        ]);
        setCities(citiesData || []);
        setNotices(noticesData.slice(0, 3) || []);
      } catch (err) {
        console.error("Failed to load public portal data:", err);
      }
    }
    loadData();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      // Lookup wards matching query
      const wards = await apiClient<any[]>(`/public/wards`);
      const matched = wards.filter(
        (w) =>
          w.ward_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          w.ward_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
          w.localities.some((l: any) => l.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setSearchResults(matched);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="w-full flex flex-col space-y-16 pb-20">
      {/* 1. Dark Navy Citizen-Focused Hero Panel */}
      <section className="relative w-full bg-gradient-to-b from-[#142F58] via-[#102547] to-[#0A182F] text-white py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle geometric civic watermarks */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="max-w-6xl mx-auto text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-amber-300">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Digital Urban Transformation for Indian Cities</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight sm:leading-tight">
            Transparent, Responsive <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-sky-200 to-white">
              Municipal Civic Services
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
            Report local grievances, track official department resolution in real time, apply for vital municipal
            services, and view verified city schedules across Lucknow, Varanasi, Agra, and Prayagraj.
          </p>

          {/* Quick Search Panel */}
          <div className="max-w-3xl mx-auto bg-white rounded-2xl p-2.5 sm:p-3 shadow-2xl border border-white/20 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1 flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your Ward, Locality, or Colony (e.g. Hazratganj, Assi, Gomti Nagar)..."
                className="w-full pl-12 pr-4 py-3 rounded-xl text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none"
              />
            </div>
            <Button
              type="button"
              onClick={handleSearch}
              isLoading={isSearching}
              className="bg-[#142F58] hover:bg-[#1C417A] text-white px-6 py-3 font-semibold text-sm rounded-xl"
            >
              Search Locality
            </Button>
          </div>

          {/* Search Result Box if any */}
          {searchResults.length > 0 && (
            <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-xl p-4 text-left text-slate-900 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-xs font-bold uppercase text-[#142F58]">
                  Found {searchResults.length} Ward Result(s)
                </span>
                <button onClick={() => setSearchResults([])} className="text-xs text-slate-400 hover:text-slate-600">
                  Close
                </button>
              </div>
              <div className="max-w-full divide-y max-h-60 overflow-y-auto">
                {searchResults.map((w: any) => (
                  <div key={w.id} className="py-2.5 text-xs flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-900">
                        {w.ward_number}: {w.ward_name} ({w.zone_name})
                      </p>
                      <p className="text-slate-500">
                        Localities: {w.localities?.map((l: any) => l.name).join(", ")}
                      </p>
                    </div>
                    <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded">
                      Helpline: {w.contact_phone || "1800-180-1553"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trust Metrics Badge Strip */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <p className="text-2xl font-bold text-white">48 Hours</p>
              <p className="text-xs text-slate-300">Standard Grievance SLA</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <p className="text-2xl font-bold text-white">100%</p>
              <p className="text-xs text-slate-300">Geotagged Field Inspection</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <p className="text-2xl font-bold text-white">4 Cities</p>
              <p className="text-xs text-slate-300">Active Corporation Support</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <p className="text-2xl font-bold text-white">Zero Trust</p>
              <p className="text-xs text-slate-300">Private Data Isolation</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. City Discovery Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-[#245A86] tracking-wider uppercase mb-1">
              Participating Municipal Corporations
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#142F58]">
              Explore Your Municipal Administration
            </h2>
          </div>
          <p className="text-sm text-slate-500 max-w-md">
            Click on any municipal corporation to view ward boundaries, emergency control rooms, and published
            cleanliness schedules.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cities.map((city) => (
            <Card key={city.id} className="overflow-hidden flex flex-col group border-slate-200 hover:border-[#245A86]">
              <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                <img
                  src={city.photo_url || "https://images.unsplash.com/photo-1596176530529-78163a4f7af2"}
                  alt={city.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="text-xs uppercase tracking-wider font-semibold text-amber-300">
                    {city.state}
                  </span>
                  <h3 className="text-xl font-bold">{city.name}</h3>
                </div>
              </div>

              <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{city.description}</p>
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
                    <span>Managed Wards:</span>
                    <span className="font-bold text-[#142F58]">{city.ward_count} Wards</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
                    <span>PIN Code:</span>
                    <span className="font-mono text-slate-700">{city.pin_code}</span>
                  </div>
                  <a
                    href={`/directory?city=${encodeURIComponent(city.name)}`}
                    className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-lg bg-[#EAF1F6] text-[#142F58] text-xs font-bold hover:bg-[#d5e4f0] transition-colors"
                  >
                    <span>View Wards & Directory</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 3. Core Citizen Grievance Categories & Features */}
      <section className="w-full bg-[#EAF1F6]/50 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-[#245A86] uppercase tracking-wider">
              Citizen Redressal System
            </span>
            <h2 className="text-3xl font-extrabold text-[#142F58]">
              Direct Resolution Across Essential Public Services
            </h2>
            <p className="text-sm text-slate-600">
              Citizens can register grievances with photo attachments and exact coordinates, tracked by ward officers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Trash2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Solid Waste & Sanitation</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Garbage heap overflow, road sweeping negligence, door-to-door vehicle skipping, and carcass clearance.
              </p>
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded inline-block">
                SLA: 24-48 Hours
              </span>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Droplet className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Jal Sansthan (Water & Drain)</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Drinking water pipeline bursts, sewage backflow, open manhole covers, and drain desilting requests.
              </p>
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded inline-block">
                SLA: 12-24 Hours
              </span>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Lightbulb className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Street Lighting & LED Grids</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Non-functional pole luminaires, sparking cable hazards, and unlit public dark spots in colonies.
              </p>
              <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded inline-block">
                SLA: 24 Hours
              </span>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Building className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Roads, Footpaths & Civil Works</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Dangerous potholes on thoroughfares, damaged storm culverts, unauthorized road digging, and encroachment.
              </p>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded inline-block">
                SLA: 72 Hours
              </span>
            </div>
          </div>

          <div className="text-center pt-4">
            <Button
              onClick={() => (window.location.href = "/register")}
              size="lg"
              className="bg-[#142F58] hover:bg-[#1E457E] text-white px-8"
            >
              Sign Up to File a Grievance
            </Button>
          </div>
        </div>
      </section>

      {/* 4. Latest Public Notices & Tenders Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <span className="text-xs font-bold text-[#245A86] uppercase tracking-wider">Public Notices</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#142F58]">
              Active Tenders & Municipal Advisories
            </h2>
          </div>
          <a
            href="/notices"
            className="text-xs font-bold text-[#245A86] hover:text-[#142F58] flex items-center gap-1"
          >
            <span>View All Public Notices</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {notices.map((n) => (
            <Card key={n.id} className="p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <Badge variant="SUBMITTED" status={n.category} />
                  <span className="text-[11px] text-slate-400">
                    {new Date(n.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <h4 className="text-base font-bold text-[#142F58] line-clamp-2 leading-snug">{n.title}</h4>
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{n.summary}</p>
              </div>
              <a
                href={`/notices?id=${n.id}`}
                className="text-xs font-bold text-[#245A86] hover:underline flex items-center gap-1 pt-2 border-t border-slate-100"
              >
                <span>Read Official Notice</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
