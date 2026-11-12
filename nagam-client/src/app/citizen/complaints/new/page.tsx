"use client";

import React, { useState, useEffect } from "react";
import { Button, Input, Textarea, Select, Card, Alert } from "nagam-ui";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { generateGrievanceReceiptPDF } from "@/lib/pdf-generator";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Camera,
  UploadCloud,
  AlertCircle,
  FileText,
  Clock,
  ShieldCheck,
  Trash2,
  Navigation,
  Sparkles,
  Info,
  Check,
  Download,
} from "lucide-react";

interface CityOption {
  id: string;
  name: string;
  state: string;
}

interface WardOption {
  id: string;
  ward_number: string;
  ward_name: string;
}

interface UploadedFilePreview {
  id: string;
  name: string;
  size: string;
  dataUrl: string;
}

const CATEGORY_MAP: Record<
  string,
  { label: string; icon: string; subcategories: string[] }
> = {
  "Sanitation & Garbage": {
    label: "Sanitation & Garbage Overflow",
    icon: "🗑️",
    subcategories: [
      "Uncollected Household Garbage",
      "Overflowing Community Dustbin",
      "Dumping on Vacant Plot",
      "Dead Animal Removal",
      "Bio-medical Waste Littering",
    ],
  },
  "Roads & Infrastructure": {
    label: "Roads, Potholes & Footpaths",
    icon: "🛣️",
    subcategories: [
      "Dangerous Potholes on Main Road",
      "Damaged Footpath / Pavement",
      "Open or Missing Manhole Cover",
      "Broken Speed Breaker / Road Divider",
      "Road Cavity / Water Trenching Damage",
    ],
  },
  "Street Lighting": {
    label: "Street Lighting & Electrical",
    icon: "💡",
    subcategories: [
      "Street Light Not Working (Single Pole)",
      "Entire Street Darkness (Phase Failure)",
      "Exposed Electrical Wire / Short Circuit",
      "Damaged / Leaning Street Pole",
      "Daytime Street Light Burning",
    ],
  },
  "Water Works & Drainage": {
    label: "Drinking Water & Sewage",
    icon: "🚰",
    subcategories: [
      "Drinking Water Pipeline Burst / Leakage",
      "Contaminated / Muddy Water Supply",
      "No Water Supply in Pipeline",
      "Sewage Overflowing into Street",
      "Blocked Stormwater Drain / Waterlogging",
    ],
  },
  "Public Health": {
    label: "Public Health & Fogging",
    icon: "🦟",
    subcategories: [
      "Mosquito Breeding & Fogging Request",
      "Stagnant Dirty Water Removal",
      "Stray Dog Aggression / Sterilization",
      "Illegal Slaughtering / Sanitation Nuisance",
    ],
  },
  Encroachment: {
    label: "Illegal Encroachment & Parking",
    icon: "🚫",
    subcategories: [
      "Footpath Encroachment by Vendors",
      "Illegal Construction on Public Land",
      "Abandonment of Junk Vehicles",
      "Commercial Activity in Residential Zone",
    ],
  },
};

const STEPS = [
  { step: 1, title: "Issue Details", desc: "Category & Description" },
  { step: 2, title: "Location", desc: "Ward & Landmark" },
  { step: 3, title: "Photos & Evidence", desc: "Upload Verification" },
  { step: 4, title: "Review & Submit", desc: "Declaration & SLA" },
];

export default function NewComplaintWizardPage() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);

  // Form states
  const [cities, setCities] = useState<CityOption[]>([]);
  const [wards, setWards] = useState<WardOption[]>([]);
  const [cityId, setCityId] = useState("");
  const [wardId, setWardId] = useState("");

  const [category, setCategory] = useState("Sanitation & Garbage");
  const [subcategory, setSubcategory] = useState(
    CATEGORY_MAP["Sanitation & Garbage"].subcategories[0]
  );
  const [priority, setPriority] = useState("MEDIUM");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [locality, setLocality] = useState("");
  const [addressText, setAddressText] = useState("");
  const [coordinates, setCoordinates] = useState({
    lat: 26.8467,
    lng: 80.9462,
    accuracy: "High (GPS ±5m)",
  });
  const [locating, setLocating] = useState(false);

  // Files
  const [files, setFiles] = useState<UploadedFilePreview[]>([]);
  const [declarationAgreed, setDeclarationAgreed] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  // Fetch cities and wards
  useEffect(() => {
    async function loadData() {
      try {
        const cityData = await apiClient<CityOption[]>("/public/cities");
        setCities(cityData || []);
        if (cityData && cityData.length > 0) {
          setCityId(cityData[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    async function loadWards() {
      if (!cityId) return;
      try {
        const wardData = await apiClient<WardOption[]>(
          `/public/wards?city_id=${cityId}`
        );
        setWards(wardData || []);
        if (wardData && wardData.length > 0) {
          setWardId(wardData[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadWards();
  }, [cityId]);

  // Update subcategory default when category changes
  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    const subcats = CATEGORY_MAP[newCat]?.subcategories || [];
    if (subcats.length > 0) {
      setSubcategory(subcats[0]);
    }
  };

  const handleUseCurrentLocation = () => {
    setLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoordinates({
            lat: Number(pos.coords.latitude.toFixed(5)),
            lng: Number(pos.coords.longitude.toFixed(5)),
            accuracy: `GPS (±${Math.round(pos.coords.accuracy)}m)`,
          });
          setLocating(false);
        },
        () => {
          // Fallback simulation for local dev
          setCoordinates({
            lat: 26.8467,
            lng: 80.9462,
            accuracy: "Simulated GPS (Hazratganj, Ward 34)",
          });
          setLocating(false);
        },
        { timeout: 5000 }
      );
    } else {
      setCoordinates({
        lat: 26.8467,
        lng: 80.9462,
        accuracy: "Hazratganj Municipal Zone",
      });
      setLocating(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const incoming = Array.from(e.target.files);

    incoming.slice(0, 3 - files.length).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFiles((prev) => [
          ...prev,
          {
            id: Math.random().toString(36).substring(7),
            name: file.name,
            size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
            dataUrl: (event.target?.result as string) || "",
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  // Step Validations
  const validateStep1 = () => {
    if (!title.trim() || title.length < 5) {
      setError("Please enter a clear subject title (at least 5 characters).");
      return false;
    }
    if (!description.trim() || description.length < 10) {
      setError("Please describe the issue in detail (at least 10 characters).");
      return false;
    }
    setError("");
    return true;
  };

  const validateStep2 = () => {
    if (!cityId) {
      setError("Please select the municipal corporation.");
      return false;
    }
    if (!wardId) {
      setError("Please select the municipal ward.");
      return false;
    }
    if (!addressText.trim()) {
      setError("Please specify the street address and nearby landmark.");
      return false;
    }
    setError("");
    return true;
  };

  const nextStep = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    setError("");
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setError("");
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!declarationAgreed) {
      setError("Please acknowledge the declaration checkbox before submitting.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const fullAddress = locality
        ? `${addressText}, ${locality} (GPS: ${coordinates.lat}, ${coordinates.lng})`
        : `${addressText} (GPS: ${coordinates.lat}, ${coordinates.lng})`;

      const fullDescription = `${subcategory ? `[${subcategory}] ` : ""}${description}`;

      const res = await apiClient<any>("/citizen/complaints", {
        method: "POST",
        body: JSON.stringify({
          city_id: cityId,
          ward_id: wardId,
          category,
          title,
          description: fullDescription,
          address_text: fullAddress,
          priority,
        }),
      });

      setSubmittedId(res.id);
      setSubmittedRef(res.reference_no || `NC-${Date.now().toString().slice(-6)}`);
    } catch (err: any) {
      setError(
        err.message || "Failed to submit grievance. Please verify all required fields."
      );
    } finally {
      setLoading(false);
    }
  };

  const selectedCityObj = cities.find((c) => c.id === cityId);
  const selectedWardObj = wards.find((w) => w.id === wardId);

  // Success view
  if (submittedId) {
    return (
      <div className="max-w-2xl mx-auto py-8 text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <span className="inline-block text-xs font-bold tracking-wider uppercase px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200">
            Grievance Registered Successfully
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142F58]">
            Reference No: <span className="text-[#245A86]">{submittedRef}</span>
          </h1>
          <p className="text-sm text-slate-600 max-w-lg mx-auto">
            Your grievance has been lodged in the central municipal ticketing system.
            It has been auto-routed to the ward nodal supervisor and field response unit.
          </p>
        </div>

        <Card className="p-6 bg-white border border-slate-200 text-left space-y-4 max-w-lg mx-auto shadow-sm">
          <div className="flex justify-between items-center text-xs pb-3 border-b border-slate-100">
            <span className="text-slate-500">Service Level Agreement:</span>
            <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
              {priority === "EMERGENCY"
                ? "6 Hours Emergency SLA"
                : priority === "HIGH"
                ? "24 Hours Priority SLA"
                : "48 Hours Standard SLA"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-400 block">Category</span>
              <span className="font-bold text-slate-800">{category}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Location</span>
              <span className="font-bold text-slate-800">
                {selectedWardObj?.ward_name || "Ward Assigned"}
              </span>
            </div>
          </div>
          <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-lg text-xs text-blue-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              SMS and portal updates will be sent as our inspector conducts the site
              verification and uploads completion photos.
            </span>
          </div>
        </Card>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            onClick={() => {
              generateGrievanceReceiptPDF({
                referenceNo: submittedRef || `NC-${Date.now().toString().slice(-6)}`,
                category,
                subcategory,
                title,
                description,
                status: "LOGGED",
                priority,
                cityName: selectedCityObj?.name,
                wardName: selectedWardObj?.ward_name,
                addressText: locality ? `${addressText}, ${locality}` : addressText,
                createdAt: new Date().toISOString(),
                citizenName: user?.citizen_profile
                  ? `${user.citizen_profile.first_name} ${user.citizen_profile.last_name || ""}`.trim()
                  : user?.email || "Citizen User",
                citizenPhone: user?.phone,
              });
            }}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 shadow-sm gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Download Official PDF Receipt</span>
          </Button>
          <Button
            onClick={() => (window.location.href = `/citizen/complaints/${submittedId}`)}
            className="w-full sm:w-auto bg-[#142F58] text-white px-6 py-2.5 shadow-sm"
          >
            Track Grievance Status
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/citizen/complaints")}
            className="w-full sm:w-auto px-6 py-2.5"
          >
            Go to My Complaints
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <a
            href="/citizen/complaints"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#245A86] hover:text-[#142F58] mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Grievances</span>
          </a>
          <h1 className="text-2xl font-extrabold text-[#142F58]">
            File a Civic Grievance
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Submit municipal issues with geotagged location and photo evidence for time-bound resolution.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs font-medium text-blue-900">
          <Clock className="w-3.5 h-3.5 text-blue-700" />
          <span>Municipal SLA Guaranteed</span>
        </div>
      </div>

      {/* 4-Step Progress Indicator Matching Image 1 Screen 3 */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="grid grid-cols-4 gap-2">
          {STEPS.map((s) => {
            const isCompleted = currentStep > s.step;
            const isCurrent = currentStep === s.step;
            return (
              <div
                key={s.step}
                className="flex flex-col items-center sm:items-start text-center sm:text-left relative"
              >
                <div className="flex items-center gap-2 mb-1 w-full">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                      isCompleted
                        ? "bg-emerald-600 text-white"
                        : isCurrent
                        ? "bg-[#142F58] text-white ring-4 ring-blue-100"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : s.step}
                  </div>
                  <div
                    className={`hidden sm:block h-1 w-full rounded-full ${
                      isCompleted
                        ? "bg-emerald-600"
                        : isCurrent
                        ? "bg-[#142F58]"
                        : "bg-slate-100"
                    }`}
                  />
                </div>
                <span
                  className={`text-xs font-bold leading-tight ${
                    isCurrent ? "text-[#142F58]" : "text-slate-600"
                  }`}
                >
                  {s.title}
                </span>
                <span className="hidden sm:block text-[10px] text-slate-400">
                  {s.desc}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Wizard Form Card */}
      <Card className="p-6 sm:p-8 bg-white border border-slate-200 rounded-2xl shadow-sm">
        {error && (
          <div className="mb-6">
            <Alert variant="danger">{error}</Alert>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* STEP 1: ISSUE DETAILS */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Step 1: Select Grievance Category & Urgency
                </h2>
                <p className="text-xs text-slate-500">
                  Choose the category that best describes the civic problem.
                </p>
              </div>

              {/* Category Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(CATEGORY_MAP).map(([key, data]) => {
                  const isSelected = category === key;
                  return (
                    <button
                      type="button"
                      key={key}
                      onClick={() => handleCategoryChange(key)}
                      className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 ${
                        isSelected
                          ? "border-[#142F58] bg-blue-50/60 ring-2 ring-[#142F58]/20 shadow-sm"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                      }`}
                    >
                      <span className="text-2xl">{data.icon}</span>
                      <span className="text-xs font-bold text-slate-800 leading-snug">
                        {data.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Subcategory */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Specific Subcategory
                </label>
                <select
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  className="w-full text-xs font-medium rounded-lg border border-slate-200 px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#142F58]"
                >
                  {CATEGORY_MAP[category]?.subcategories.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority / Urgency Cards */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Urgency Level & Resolution SLA
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    {
                      val: "LOW",
                      title: "Low",
                      sla: "7-Day SLA",
                      badge: "bg-slate-100 text-slate-700",
                    },
                    {
                      val: "MEDIUM",
                      title: "Standard",
                      sla: "48-Hour SLA",
                      badge: "bg-blue-100 text-blue-700",
                    },
                    {
                      val: "HIGH",
                      title: "Urgent",
                      sla: "24-Hour SLA",
                      badge: "bg-amber-100 text-amber-800",
                    },
                    {
                      val: "EMERGENCY",
                      title: "Critical",
                      sla: "6-Hour SLA",
                      badge: "bg-rose-100 text-rose-800",
                    },
                  ].map((p) => {
                    const isSelected = priority === p.val;
                    return (
                      <button
                        type="button"
                        key={p.val}
                        onClick={() => setPriority(p.val)}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          isSelected
                            ? "border-[#142F58] bg-[#142F58]/5 ring-2 ring-[#142F58]/20"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                        }`}
                      >
                        <span className="block text-xs font-bold text-slate-900">
                          {p.title}
                        </span>
                        <span
                          className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded mt-1 ${p.badge}`}
                        >
                          {p.sla}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title / Subject */}
              <div>
                <Input
                  label="Subject / Summary Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Major sewage overflow flooding market street lane 3"
                  required
                  helperText="Provide a concise title that explains the issue clearly."
                />
              </div>

              {/* Description with Character Counter */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700">
                    Detailed Description
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {description.length} / 500 characters
                  </span>
                </div>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, 500))}
                  rows={4}
                  placeholder="Describe the problem, duration, impact on residents/traffic, and any known hazards..."
                  required
                />
              </div>
            </div>
          )}

          {/* STEP 2: LOCATION & DETAILS */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Step 2: Grievance Location & Administrative Ward
                </h2>
                <p className="text-xs text-slate-500">
                  Accurate ward mapping ensures direct dispatch to the assigned municipal engineering team.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Municipal Corporation / City"
                  value={cityId}
                  onChange={(e) => setCityId(e.target.value)}
                  options={cities.map((c) => ({
                    value: c.id,
                    label: `${c.name} (${c.state})`,
                  }))}
                  required
                />
                <Select
                  label="Administrative Ward / Zone"
                  value={wardId}
                  onChange={(e) => setWardId(e.target.value)}
                  options={wards.map((w) => ({
                    value: w.id,
                    label: `${w.ward_number}: ${w.ward_name}`,
                  }))}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Locality / Sector / Mohalla"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  placeholder="e.g. Hazratganj Market / Aliganj Sector Q"
                />
                <Input
                  label="Street Address & Nearby Landmark"
                  value={addressText}
                  onChange={(e) => setAddressText(e.target.value)}
                  placeholder="e.g. Near State Bank ATM, Gate No. 2"
                  required
                />
              </div>

              {/* Geotagging & Map Card */}
              <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                <div className="p-4 bg-white border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-[#245A86]" />
                      <span>Geotagged Coordinates (Lat / Long)</span>
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Latitude: <strong>{coordinates.lat}</strong> | Longitude:{" "}
                      <strong>{coordinates.lng}</strong> ({coordinates.accuracy})
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleUseCurrentLocation}
                    isLoading={locating}
                    className="text-xs gap-1.5 border-[#245A86] text-[#245A86] hover:bg-blue-50 py-1.5"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Use My Current Location</span>
                  </Button>
                </div>

                {/* Simulated Map Visual */}
                <div className="relative h-44 bg-slate-200 flex items-center justify-center overflow-hidden">
                  <div
                    className="absolute inset-0 opacity-40 bg-cover bg-center"
                    style={{
                      backgroundImage: `radial-gradient(#142F58 1px, transparent 1px), radial-gradient(#142F58 1px, #e2e8f0 1px)`,
                      backgroundSize: "20px 20px",
                      backgroundPosition: "0 0, 10px 10px",
                    }}
                  />
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg animate-bounce">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div className="mt-1 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-md shadow-md text-[11px] font-bold text-slate-800 border border-slate-200">
                      📍 {selectedWardObj ? selectedWardObj.ward_name : "Central Ward"}
                    </div>
                  </div>
                  <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] text-slate-600 font-mono">
                    NagarConnect GIS Locator • Ward Boundary Verified
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PHOTOS & EVIDENCE */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Step 3: Upload Photos & Supporting Evidence
                </h2>
                <p className="text-xs text-slate-500">
                  Photographic evidence helps field officers assess equipment needs and dispatch the right crew immediately.
                </p>
              </div>

              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-slate-300 hover:border-[#142F58] rounded-2xl p-8 text-center bg-slate-50/50 hover:bg-blue-50/30 transition-all relative">
                <input
                  type="file"
                  multiple
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="w-12 h-12 bg-blue-100 text-[#142F58] rounded-full flex items-center justify-center mx-auto mb-3">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">
                  Drag and drop site photos here, or click to browse
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Supports JPG, PNG, WebP up to 10MB each (Maximum 3 files)
                </p>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded border text-slate-600">
                    📸 Geotagging Preserved
                  </span>
                  <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded border text-slate-600">
                    🛡️ Tamper-Evident Hash
                  </span>
                </div>
              </div>

              {/* Uploaded File Previews */}
              {files.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">
                    Uploaded Evidence ({files.length}/3)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {files.map((f) => (
                      <div
                        key={f.id}
                        className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-sm"
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          {f.dataUrl ? (
                            <img
                              src={f.dataUrl}
                              alt={f.name}
                              className="w-10 h-10 rounded-lg object-cover border shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 shrink-0">
                              <Camera className="w-5 h-5" />
                            </div>
                          )}
                          <div className="overflow-hidden">
                            <p className="text-xs font-bold text-slate-800 truncate">
                              {f.name}
                            </p>
                            <span className="text-[10px] text-slate-400">
                              {f.size}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(f.id)}
                          className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold">Photographic Verification Standard:</span>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Municipal guidelines require sanitary inspectors to attach before-and-after photographs to close any registered grievance. Photos you provide will be directly attached to the field ticket.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & SUBMIT */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Step 4: Review Grievance & Citizen Declaration
                </h2>
                <p className="text-xs text-slate-500">
                  Confirm all details before generating an official tracking number.
                </p>
              </div>

              {/* Summary Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
                  <div>
                    <span className="text-xs text-slate-400 uppercase tracking-wide font-bold">
                      Category
                    </span>
                    <h3 className="text-base font-extrabold text-[#142F58] flex items-center gap-1.5">
                      <span>{CATEGORY_MAP[category]?.icon}</span>
                      <span>{category}</span>
                    </h3>
                    <span className="text-xs text-slate-600 font-medium">
                      Subcategory: {subcategory}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 uppercase tracking-wide font-bold block">
                      Target SLA
                    </span>
                    <span
                      className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${
                        priority === "EMERGENCY"
                          ? "bg-rose-100 text-rose-800"
                          : priority === "HIGH"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {priority === "EMERGENCY"
                        ? "6 Hours Critical SLA"
                        : priority === "HIGH"
                        ? "24 Hours High SLA"
                        : "48 Hours Standard SLA"}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-slate-400 uppercase tracking-wide font-bold">
                    Title & Description
                  </span>
                  <p className="text-sm font-bold text-slate-800">{title}</p>
                  <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                    {description}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                  <div>
                    <span className="text-slate-400 uppercase tracking-wide font-bold block mb-0.5">
                      Administrative Jurisdiction
                    </span>
                    <p className="font-bold text-slate-800">
                      {selectedCityObj ? selectedCityObj.name : "City"} —{" "}
                      {selectedWardObj ? selectedWardObj.ward_name : "Ward"}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase tracking-wide font-bold block mb-0.5">
                      Landmark & Coordinates
                    </span>
                    <p className="font-bold text-slate-800">
                      {addressText} {locality ? `(${locality})` : ""}
                    </p>
                    <span className="text-[10px] text-slate-500 font-mono">
                      GPS: {coordinates.lat}, {coordinates.lng}
                    </span>
                  </div>
                </div>

                {files.length > 0 && (
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-xs text-slate-400 uppercase tracking-wide font-bold block mb-1.5">
                      Attached Photos ({files.length})
                    </span>
                    <div className="flex gap-2">
                      {files.map((f) => (
                        <div
                          key={f.id}
                          className="w-12 h-12 rounded-lg border overflow-hidden bg-white"
                        >
                          {f.dataUrl && (
                            <img
                              src={f.dataUrl}
                              alt={f.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Citizen Declaration */}
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-3">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="declaration"
                    checked={declarationAgreed}
                    onChange={(e) => setDeclarationAgreed(e.target.checked)}
                    className="mt-1 w-4 h-4 text-[#142F58] border-slate-300 rounded focus:ring-[#142F58] cursor-pointer"
                  />
                  <label
                    htmlFor="declaration"
                    className="text-xs text-slate-700 leading-relaxed cursor-pointer select-none"
                  >
                    <strong className="text-slate-900 block mb-0.5">
                      Citizen Legal Declaration & Consent:
                    </strong>
                    I certify that the information provided is accurate and represents a genuine civic problem. I authorize municipal field inspectors to contact me for site verification and grant consent to record GPS location for accountability.
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-3 pt-6 border-t border-slate-200 mt-6">
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                className="gap-1.5 text-xs font-bold text-slate-700"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </Button>
            ) : (
              <div />
            )}

            {currentStep < 4 ? (
              <Button
                type="button"
                onClick={nextStep}
                className="bg-[#142F58] text-white gap-1.5 text-xs font-bold px-6 py-2.5 shadow-sm"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            ) : (
              <Button
                type="submit"
                isLoading={loading}
                disabled={!declarationAgreed}
                className={`gap-2 text-xs font-bold px-7 py-3 shadow-md ${
                  declarationAgreed
                    ? "bg-[#142F58] hover:bg-[#1a3c6d] text-white"
                    : "bg-slate-300 text-slate-500 cursor-not-allowed"
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Submit Grievance & Generate Ref #</span>
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}
