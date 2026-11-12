"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Landmark,
  Search,
  MapPin,
  Info,
  Users,
  BookOpen,
  ArrowRight,
  Sun,
  CloudSun,
  FileText,
  Leaf,
  UsersRound,
  ExternalLink,
  ChevronDown,
  Globe,
  Youtube,
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  X,
  Building,
  CheckCircle2,
  Clock,
  Radio,
  Shield,
  Layers,
  Navigation,
  LocateFixed,
  Loader2,
  Phone,
  Mail,
  ShieldCheck,
  Sparkles,
  Map,
  Compass,
  AlertCircle,
  LayoutDashboard,
  LogOut,
  User,
} from "lucide-react";
import { apiClient } from "@/lib/api";

interface CityData {
  id: string;
  name: string;
  state: string;
  ward_count: number;
  description?: string;
  photo_url?: string;
}

interface NoticeData {
  id: string;
  title: string;
  summary: string;
  category: string;
  status: string;
  published_at?: string;
  department_name?: string;
}

interface LocationSuggestion {
  id: string;
  title: string;
  subtitle: string;
  lat: number;
  lon: number;
  type: "MUNICIPAL_WARD" | "MAP_LOCATION" | "CITY";
  ward_number?: string;
  city_name?: string;
  source: string;
}

const CITY_FALLBACK_IMAGES: Record<string, { image: string; subtitle: string }> = {
  Lucknow: {
    image:
      "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80",
    subtitle: "Heritage • Culture • Progress",
  },
  Varanasi: {
    image:
      "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80",
    subtitle: "Spirituality • Heritage • Cleanliness",
  },
  Agra: {
    image:
      "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80",
    subtitle: "History • Tourism • Smart City",
  },
  Prayagraj: {
    image:
      "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80",
    subtitle: "Faith • Education • Development",
  },
};

const NAV_LINKS = [
  { id: "home", label: "Home", href: "#home" },
  { id: "about", label: "About Us", href: "#about" },
  { id: "public-info", label: "Public Information", href: "#public-info" },
  { id: "cities", label: "Our Cities", href: "#cities" },
  { id: "contact", label: "Contact", href: "#contact" },
];

export default function PublicWebsitePage() {
  // Navigation active state & sliding underline
  const [activeSection, setActiveSection] = useState<string>("home");
  const navContainerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number }>({
    left: 0,
    width: 0,
  });

  // Search & Map Autocomplete states
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Dynamic Weather state
  const [weatherInfo, setWeatherInfo] = useState<{
    temp: string;
    condition: string;
    locationName: string;
  }>({
    temp: "32°C",
    condition: "Sunny",
    locationName: "Lucknow, UP",
  });

  // Live Backend Data
  const [cities, setCities] = useState<CityData[]>([]);
  const [notices, setNotices] = useState<NoticeData[]>([]);
  const [noticeFilter, setNoticeFilter] = useState<"ALL" | "NOTICE" | "TENDER" | "ADVISORY">("ALL");
  const [departments, setDepartments] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  // Navigation Dropdowns
  const [loginMenuOpen, setLoginMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  // User Session state (synchronized across ports via localStorage & cookies)
  const [currentUser, setCurrentUser] = useState<{
    email: string;
    name?: string;
    user_type: string;
  } | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [locationError, setLocationError] = useState("");

  const clientPortalUrl = process.env.NEXT_PUBLIC_CLIENT_URL || "http://localhost:3001";
  const adminPortalUrl = process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3002";
  const superAdminUrl = process.env.NEXT_PUBLIC_SUPER_ADMIN_URL || "http://localhost:3003";

  // Check shared auth state on mount and listen to storage events
  useEffect(() => {
    const checkAuth = () => {
      try {
        // 1. Check cookies (shared across localhost ports)
        const cookies = document.cookie.split(";");
        const userCookie = cookies.find((c) => c.trim().startsWith("nagar_user="));
        if (userCookie) {
          const val = decodeURIComponent(userCookie.split("=")[1]);
          const parsed = JSON.parse(val);
          if (parsed && (parsed.email || parsed.id)) {
            setCurrentUser({
              email: parsed.email,
              name: parsed.citizen_profile?.first_name
                ? `${parsed.citizen_profile.first_name} ${parsed.citizen_profile.last_name || ""}`.trim()
                : parsed.email.split("@")[0],
              user_type: parsed.user_type || "CITIZEN",
            });
            return;
          }
        }

        // 2. Also check localStorage
        const stored = localStorage.getItem("user");
        const token = localStorage.getItem("access_token") || localStorage.getItem("staff_access_token");
        if (stored && token) {
          const parsed = JSON.parse(stored);
          setCurrentUser({
            email: parsed.email,
            name: parsed.citizen_profile?.first_name
              ? `${parsed.citizen_profile.first_name} ${parsed.citizen_profile.last_name || ""}`.trim()
              : parsed.email.split("@")[0],
            user_type: parsed.user_type || "CITIZEN",
          });
          return;
        }
      } catch {
        // ignore
      }
      setCurrentUser(null);
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
    localStorage.removeItem("staff_access_token");
    localStorage.removeItem("superadmin_access_token");
    document.cookie = "nagar_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "nagar_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setCurrentUser(null);
    setUserDropdownOpen(false);
  };

  // ---------------------------------------------------------------------------
  // 1. Sliding Underline Animation & Scroll-Spy
  // ---------------------------------------------------------------------------
  const updateIndicator = useCallback(() => {
    const activeEl = document.getElementById(`nav-link-${activeSection}`);
    const container = navContainerRef.current;
    if (activeEl && container) {
      const containerRect = container.getBoundingClientRect();
      const elRect = activeEl.getBoundingClientRect();
      setIndicatorStyle({
        left: elRect.left - containerRect.left,
        width: elRect.width,
      });
    }
  }, [activeSection]);

  useEffect(() => {
    updateIndicator();
    const handleResize = () => updateIndicator();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updateIndicator]);

  // Scroll spy to switch active section as user scrolls
  useEffect(() => {
    const handleScroll = () => {
      const sectionIds = ["home", "about", "public-info", "cities", "contact"];
      const scrollPos = window.scrollY + 180; // offset for sticky header

      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const id = sectionIds[i];
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          if (scrollPos >= top) {
            setActiveSection(id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Initialize from URL hash if present
    if (typeof window !== "undefined" && window.location.hash) {
      const hashId = window.location.hash.replace("#", "");
      if (NAV_LINKS.some((n) => n.id === hashId)) {
        setActiveSection(hashId);
      }
    }
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setActiveSection(id);
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
      window.history.pushState(null, "", `#${id}`);
    }
  };

  // ---------------------------------------------------------------------------
  // 2. Load Backend Data & Initial Weather
  // ---------------------------------------------------------------------------
  useEffect(() => {
    async function loadBackendData() {
      try {
        const [citiesData, noticesData, deptsData, wardsData] = await Promise.all([
          apiClient<CityData[]>("/public/cities").catch(() => []),
          apiClient<NoticeData[]>("/public/notices").catch(() => []),
          apiClient<any[]>("/public/departments").catch(() => []),
          apiClient<any[]>("/public/wards").catch(() => []),
        ]);

        if (citiesData && citiesData.length > 0) {
          setCities(citiesData);
        } else {
          setCities([
            { id: "1", name: "Lucknow", state: "Uttar Pradesh", ward_count: 110 },
            { id: "2", name: "Varanasi", state: "Uttar Pradesh", ward_count: 90 },
            { id: "3", name: "Agra", state: "Uttar Pradesh", ward_count: 100 },
            { id: "4", name: "Prayagraj", state: "Uttar Pradesh", ward_count: 80 },
          ]);
        }

        if (noticesData && noticesData.length > 0) {
          setNotices(noticesData);
        }
        setDepartments(deptsData || []);
        setWards(wardsData || []);
      } catch (err) {
        console.error("Failed to load backend public data:", err);
      }
    }

    loadBackendData();
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ---------------------------------------------------------------------------
  // 3. Dynamic Location Fetching via Free OpenStreetMap API + NagarConnect DB
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsFetchingLocation(true);
      const query = searchQuery.trim();
      const combined: LocationSuggestion[] = [];

      try {
        // A) Query Local Database Wards & Cities first
        const localMatches = wards.filter((w) => {
          const q = query.toLowerCase();
          return (
            w.ward_name?.toLowerCase().includes(q) ||
            w.ward_number?.toLowerCase().includes(q) ||
            w.city_name?.toLowerCase().includes(q)
          );
        });

        localMatches.slice(0, 3).forEach((w) => {
          combined.push({
            id: `ward-${w.id}`,
            title: `${w.ward_name} (${w.ward_number})`,
            subtitle: `${w.city_name || "Uttar Pradesh"} • Municipal Ward Office`,
            lat: 26.8467,
            lon: 80.9462,
            type: "MUNICIPAL_WARD",
            ward_number: w.ward_number,
            city_name: w.city_name,
            source: "NagarConnect Municipal Registry",
          });
        });

        // B) Query Free OpenStreetMap Nominatim Geocoding API
        const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&addressdetails=1&limit=5&countrycodes=in`;

        const res = await fetch(nominatimUrl, {
          headers: {
            "Accept-Language": "en",
          },
        });

        if (res.ok) {
          const places = await res.json();
          places.forEach((p: any) => {
            const displayNameParts = (p.display_name || "").split(",");
            const mainTitle = p.name || displayNameParts[0]?.trim() || query;
            const subtitle = displayNameParts.slice(1, 4).join(",").trim() || "India";

            // Prevent duplicate entry if already matched by ward
            if (!combined.some((c) => c.title.toLowerCase().includes(mainTitle.toLowerCase()))) {
              combined.push({
                id: `osm-${p.place_id}`,
                title: mainTitle,
                subtitle: subtitle,
                lat: parseFloat(p.lat),
                lon: parseFloat(p.lon),
                type: "MAP_LOCATION",
                city_name: p.address?.city || p.address?.town || p.address?.state_district,
                source: "OpenStreetMap Live Geocoder",
              });
            }
          });
        }
      } catch (err) {
        // Fallback to Photon geocoder if Nominatim is rate-limited
        try {
          const photonRes = await fetch(
            `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=4`
          );
          if (photonRes.ok) {
            const photonData = await photonRes.json();
            photonData.features?.forEach((f: any, idx: number) => {
              const props = f.properties || {};
              combined.push({
                id: `photon-${idx}`,
                title: props.name || query,
                subtitle: `${props.city || props.district || ""} ${props.state || "India"}`.trim(),
                lat: f.geometry?.coordinates[1] || 26.85,
                lon: f.geometry?.coordinates[0] || 80.94,
                type: "MAP_LOCATION",
                city_name: props.city,
                source: "Photon OpenStreetMap",
              });
            });
          }
        } catch {
          // ignore fallback
        }
      } finally {
        setIsFetchingLocation(false);
        setSuggestions(combined);
        setShowSuggestions(combined.length > 0);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery, wards]);

  // ---------------------------------------------------------------------------
  // 4. GPS "Detect My Location" Handler (Reverse Geocoding + Live Weather)
  // ---------------------------------------------------------------------------
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Free Nominatim Reverse Geocoding
          const revUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
          const res = await fetch(revUrl, {
            headers: { "Accept-Language": "en" },
          });

          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const locality =
              addr.suburb || addr.neighbourhood || addr.road || addr.village || "Current Location";
            const city = addr.city || addr.town || addr.state_district || "Uttar Pradesh";
            const fullLoc = `${locality}, ${city}`;

            setSearchQuery(fullLoc);
            const detectedItem: LocationSuggestion = {
              id: `gps-${Date.now()}`,
              title: locality,
              subtitle: `${city}, ${addr.state || ""} ${addr.postcode || ""}`.trim(),
              lat: latitude,
              lon: longitude,
              type: "MAP_LOCATION",
              city_name: city,
              source: "GPS Device Sensor & Reverse Geocoding",
            };
            setSelectedLocation(detectedItem);
            setShowSuggestions(false);

            // Fetch live weather from free Open-Meteo
            fetchLiveWeather(latitude, longitude, `${locality}, ${city}`);
          }
        } catch (err) {
          console.error("GPS Reverse Geocoding failed:", err);
          setSearchQuery(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } finally {
          setIsGeolocating(false);
        }
      },
      (error) => {
        setIsGeolocating(false);
        alert(`Location permission denied or unavailable: ${error.message}`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const fetchLiveWeather = async (lat: number, lon: number, placeName: string) => {
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
      );
      if (res.ok) {
        const data = await res.json();
        const cw = data.current_weather;
        if (cw) {
          const temp = `${Math.round(cw.temperature)}°C`;
          let condition = "Clear";
          if (cw.weathercode === 0) condition = "Sunny";
          else if (cw.weathercode < 4) condition = "Partly Cloudy";
          else if (cw.weathercode < 70) condition = "Rainy";
          else condition = "Overcast";

          setWeatherInfo({
            temp,
            condition,
            locationName: placeName,
          });
        }
      }
    } catch {
      // ignore
    }
  };

  const handleSelectSuggestion = (item: LocationSuggestion) => {
    setSearchQuery(item.title);
    setSelectedLocation(item);
    setShowSuggestions(false);
    fetchLiveWeather(item.lat, item.lon, `${item.title}, ${item.city_name || "UP"}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setLocationError("Please enter a locality, ward name or address first (e.g. Hazratganj).");
      return;
    }
    setLocationError("");
    if (suggestions.length > 0) {
      handleSelectSuggestion(suggestions[0]);
    } else {
      setShowSuggestions(false);
    }
  };

  const filteredNotices = notices.filter((n) => {
    if (noticeFilter === "ALL") return true;
    if (noticeFilter === "TENDER")
      return n.category === "TENDER" || n.title.toLowerCase().includes("tender");
    if (noticeFilter === "ADVISORY")
      return n.category === "PUBLIC_HEALTH" || n.title.toLowerCase().includes("advisory");
    if (noticeFilter === "NOTICE")
      return n.category !== "TENDER" && !n.title.toLowerCase().includes("advisory");
    return true;
  });

  return (
    <div className="w-full flex flex-col min-h-screen bg-white">
      {/* =====================================================================
          1. HEADER NAVIGATION (With Animated Moving Underline)
          ===================================================================== */}
      <header className="w-full bg-white/95 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Tagline */}
          <a
            href="#home"
            onClick={(e) => handleNavClick(e, "home")}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#142F58] text-white flex items-center justify-center shadow-sm group-hover:bg-[#1E3A8A] transition-colors">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-black text-[#142F58] tracking-tight leading-none">
                NagarConnect
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Better Cities. Connected Citizens.
              </p>
            </div>
          </a>

          {/* Navigation Links with Smooth Animated Underline */}
          <nav
            ref={navContainerRef}
            className="relative hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600"
          >
            {NAV_LINKS.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.id}
                  id={`nav-link-${link.id}`}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.id)}
                  className={`py-2 px-1 transition-all duration-200 relative z-10 cursor-pointer ${
                    isActive
                      ? "text-[#142F58] font-bold"
                      : "text-slate-600 hover:text-[#142F58]"
                  }`}
                >
                  {link.label}
                </a>
              );
            })}

            {/* Smooth Sliding Underline Bar */}
            <span
              className="absolute bottom-0 h-[2.5px] bg-[#142F58] rounded-full transition-all duration-300 ease-in-out pointer-events-none"
              style={{
                left: `${indicatorStyle.left}px`,
                width: `${indicatorStyle.width}px`,
                opacity: indicatorStyle.width > 0 ? 1 : 0,
              }}
            />
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3 relative">
            <button
              onClick={() => setActiveModal("search")}
              className="p-2 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-50 transition-colors"
              title="Search Portal"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="hidden sm:flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span>English</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
              {langMenuOpen && (
                <div className="absolute right-0 mt-1 w-28 bg-white border border-slate-200 rounded-lg shadow-lg py-1 text-xs z-50">
                  <button
                    onClick={() => setLangMenuOpen(false)}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 font-bold text-slate-800"
                  >
                    English
                  </button>
                  <button
                    onClick={() => setLangMenuOpen(false)}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-600"
                  >
                    हिन्दी (Hindi)
                  </button>
                </div>
              )}
            </div>

            {currentUser ? (
              /* User is logged in: Hide Login/Register, Show Dashboard Button & User Profile Avatar */
              <div className="flex items-center gap-3">
                <a
                  href={
                    currentUser.user_type === "PLATFORM_ADMIN"
                      ? `${superAdminUrl}/super-admin`
                      : currentUser.user_type === "CITIZEN"
                      ? `${clientPortalUrl}/citizen`
                      : `${adminPortalUrl}/admin`
                  }
                  className="px-4 py-2 text-xs font-bold text-white rounded-full bg-[#142F58] hover:bg-[#1a3c6d] transition-all shadow-sm flex items-center gap-2"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>
                    {currentUser.user_type === "PLATFORM_ADMIN"
                      ? "Super Admin Console"
                      : currentUser.user_type === "CITIZEN"
                      ? "Citizen Dashboard"
                      : "Municipal Admin"}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>

                {/* Profile Pill Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-1.5 p-1 rounded-full hover:bg-slate-100 transition-colors border border-slate-200"
                    title="User Session Profile"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#142F58] to-blue-600 text-white font-bold text-xs flex items-center justify-center">
                      {(currentUser.name || currentUser.email).charAt(0).toUpperCase()}
                    </div>
                    <ChevronDown className="w-3 h-3 text-slate-500 mr-1" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 text-xs z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <span className="font-bold text-slate-900 block truncate">
                          {currentUser.name || currentUser.email}
                        </span>
                        <span className="text-[10px] text-blue-600 font-semibold block capitalize">
                          {currentUser.user_type.toLowerCase().replace("_", " ")}
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {currentUser.email}
                        </span>
                      </div>

                      <div className="py-1">
                        <a
                          href={
                            currentUser.user_type === "PLATFORM_ADMIN"
                              ? `${superAdminUrl}/super-admin`
                              : currentUser.user_type === "CITIZEN"
                              ? `${clientPortalUrl}/citizen`
                              : `${adminPortalUrl}/admin`
                          }
                          className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50 font-medium"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5 text-slate-400" />
                          <span>Go to Dashboard</span>
                        </a>

                        {currentUser.user_type === "CITIZEN" && (
                          <a
                            href={`${clientPortalUrl}/citizen/profile`}
                            className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50 font-medium"
                          >
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>My Profile</span>
                          </a>
                        )}
                      </div>

                      <div className="pt-1 border-t border-slate-100">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 font-semibold"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* User is NOT logged in: Show Login & Register buttons */
              <>
                {/* Login Button with Dropdown for Portals */}
                <div className="relative">
                  <button
                    onClick={() => setLoginMenuOpen(!loginMenuOpen)}
                    className="px-5 py-2 text-xs font-bold text-[#142F58] rounded-full border border-slate-300 hover:bg-slate-50 transition-colors shadow-2xs flex items-center gap-1.5"
                  >
                    <span>Login</span>
                    <ChevronDown className="w-3 h-3 opacity-60" />
                  </button>

                  {loginMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-2 text-xs z-50 space-y-1">
                      <a
                        href={`${clientPortalUrl}/login`}
                        className="flex items-center gap-2.5 px-3 py-2 hover:bg-blue-50 text-slate-800 font-bold"
                      >
                        <Users className="w-4 h-4 text-blue-600" />
                        <div>
                          <span>Citizen Portal Login</span>
                          <span className="block text-[10px] text-slate-400 font-normal">
                            Track complaints & services
                          </span>
                        </div>
                      </a>

                      <a
                        href={`${adminPortalUrl}/login`}
                        className="flex items-center gap-2.5 px-3 py-2 hover:bg-blue-50 text-slate-800 font-bold"
                      >
                        <Building className="w-4 h-4 text-emerald-600" />
                        <div>
                          <span>Municipal Staff Console</span>
                          <span className="block text-[10px] text-slate-400 font-normal">
                            Officer & Ward Operations
                          </span>
                        </div>
                      </a>

                      <a
                        href={`${superAdminUrl}/login`}
                        className="flex items-center gap-2.5 px-3 py-2 hover:bg-purple-50 text-purple-900 font-bold"
                      >
                        <Layers className="w-4 h-4 text-purple-600" />
                        <div>
                          <span>Platform Super Admin</span>
                          <span className="block text-[10px] text-slate-400 font-normal">
                            Multi-tenant governance
                          </span>
                        </div>
                      </a>
                    </div>
                  )}
                </div>

                {/* Register Button */}
                <a
                  href={`${clientPortalUrl}/register`}
                  className="px-5 py-2 text-xs font-bold text-white rounded-full bg-[#0D2240] hover:bg-[#142F58] transition-colors shadow-sm"
                >
                  Register
                </a>
              </>
            )}
          </div>
        </div>
      </header>

      {/* =====================================================================
          2. HERO SECTION (#home) with Dynamic Geolocation & OpenStreetMap API
          ===================================================================== */}
      <section id="home" className="scroll-mt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Hero Card */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#0E2342] via-[#0C1E38] to-[#0A192E] rounded-3xl p-7 sm:p-9 text-white flex flex-col justify-between shadow-xl relative overflow-visible">
            {/* Background glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-6 relative z-10">
              {/* Top Tag Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-600/70 bg-white/5 text-[10px] font-bold tracking-widest text-slate-300 uppercase">
                <Sparkles className="w-3 h-3 text-sky-400" />
                <span>CIVIC SERVICES MADE SIMPLE</span>
              </div>

              {/* Heading */}
              <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-black tracking-tight leading-[1.15]">
                Your City. <br />
                Your Community. <br />
                <span className="text-[#38BDF8]">Connected.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal max-w-sm">
                Find trusted local information, understand your municipal services, and connect with your city administration.
              </p>

              {/* DYNAMIC LOCATION SEARCH BAR (With Free Map Geocoder & GPS) */}
              <div ref={searchContainerRef} className="relative w-full">
                <form
                  onSubmit={handleSearchSubmit}
                  className="bg-white rounded-2xl p-1.5 flex items-center shadow-2xl relative border-2 border-transparent focus-within:border-sky-400 transition-all"
                >
                  <MapPin className="w-4 h-4 text-blue-600 ml-2.5 shrink-0" />

                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => {
                      if (suggestions.length > 0) setShowSuggestions(true);
                    }}
                    placeholder="Enter locality, ward name or address (e.g. Hazratganj)..."
                    className="w-full px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
                  />

                  {/* GPS Auto-Detect Button */}
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={isGeolocating}
                    title="Detect current location using GPS"
                    className="p-2 mr-1 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-colors shrink-0"
                  >
                    {isGeolocating ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                    ) : (
                      <LocateFixed className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {/* Submit / Find Button */}
                  <button
                    type="submit"
                    disabled={isFetchingLocation}
                    className="bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shrink-0 transition-colors flex items-center gap-1 shadow-sm"
                  >
                    {isFetchingLocation ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Searching...</span>
                      </>
                    ) : (
                      <>
                        <span>Find Area</span>
                        <span>→</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Validation message if search query is empty */}
                {locationError && (
                  <p className="text-[11px] text-amber-300 font-semibold mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{locationError}</span>
                  </p>
                )}

                {/* Floating Autocomplete Dropdown (OpenStreetMap + DB) */}
                {showSuggestions && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 max-h-80 overflow-y-auto">
                    <div className="p-2.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Map className="w-3.5 h-3.5 text-blue-600" />
                        <span>Live Location Results (Free Map API)</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-normal">
                        Click to select
                      </span>
                    </div>

                    {isFetchingLocation ? (
                      <div className="p-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        <span>Searching OpenStreetMap &amp; ward database...</span>
                      </div>
                    ) : suggestions.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-500">
                        No localities found for &quot;{searchQuery}&quot;. Try typing &quot;Hazratganj&quot; or &quot;Gomti Nagar&quot;.
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {suggestions.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => handleSelectSuggestion(item)}
                            className="p-3 hover:bg-blue-50/60 cursor-pointer transition-colors flex items-start gap-3 group"
                          >
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                                item.type === "MUNICIPAL_WARD"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              <MapPin className="w-3.5 h-3.5" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-extrabold text-slate-900 group-hover:text-blue-700 truncate">
                                  {item.title}
                                </span>
                                <span
                                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                                    item.type === "MUNICIPAL_WARD"
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "bg-slate-100 text-slate-600"
                                  }`}
                                >
                                  {item.type === "MUNICIPAL_WARD" ? "Municipal Ward" : "Map Location"}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                {item.subtitle}
                              </p>
                              <span className="text-[10px] text-slate-400 font-mono">
                                Lat: {item.lat.toFixed(4)}, Lon: {item.lon.toFixed(4)} • {item.source}
                              </span>
                            </div>

                            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 shrink-0 self-center" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Selected Location Details Card */}
                {selectedLocation && (
                  <div className="mt-3 p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-xs space-y-2 text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Active Selected Location</span>
                      </div>
                      <button
                        onClick={() => setSelectedLocation(null)}
                        className="text-slate-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-slate-200">
                      <strong className="text-white block text-sm">
                        {selectedLocation.title}
                      </strong>
                      <span className="text-[11px] text-slate-300">
                        {selectedLocation.subtitle}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[11px]">
                      <a
                        href={`https://www.openstreetmap.org/?mlat=${selectedLocation.lat}&mlon=${selectedLocation.lon}#map=16/${selectedLocation.lat}/${selectedLocation.lon}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sky-300 hover:text-sky-200 flex items-center gap-1 underline"
                      >
                        <span>View on OpenStreetMap</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      <a
                        href={`${clientPortalUrl}/login`}
                        className="font-bold text-white bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded-lg transition-colors"
                      >
                        Access Ward Portal →
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 3 Bottom Action Pill Buttons */}
            <div className="grid grid-cols-3 gap-2 pt-8 relative z-10">
              <button
                onClick={() => setActiveModal("city-info")}
                className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-colors flex flex-col justify-between"
              >
                <Info className="w-4 h-4 text-sky-400 mb-2" />
                <div>
                  <p className="text-xs font-bold text-white leading-tight">City information</p>
                  <p className="text-[10px] text-slate-300 leading-tight mt-0.5">Know your area</p>
                </div>
              </button>

              <button
                onClick={() => setActiveModal("ward-contacts")}
                className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-colors flex flex-col justify-between"
              >
                <Users className="w-4 h-4 text-emerald-400 mb-2" />
                <div>
                  <p className="text-xs font-bold text-white leading-tight">Ward contacts</p>
                  <p className="text-[10px] text-slate-300 leading-tight mt-0.5">Find officials</p>
                </div>
              </button>

              <button
                onClick={() => setActiveModal("public-resources")}
                className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-colors flex flex-col justify-between"
              >
                <BookOpen className="w-4 h-4 text-amber-400 mb-2" />
                <div>
                  <p className="text-xs font-bold text-white leading-tight">Public resources</p>
                  <p className="text-[10px] text-slate-300 leading-tight mt-0.5">Important info</p>
                </div>
              </button>
            </div>
          </div>

          {/* Right Hero Panoramic Photo Card */}
          <div className="lg:col-span-7 relative rounded-3xl overflow-hidden min-h-[460px] lg:min-h-[520px] shadow-xl group">
            <img
              src="https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1600&q=85"
              alt="Panoramic Indian City Sunset at Ghats"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />

            {/* Dynamic Weather Overlay Pill top right */}
            <div className="absolute top-5 right-5 bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-full px-4 py-1.5 flex items-center gap-2 shadow-sm text-xs font-semibold">
              <Sun className="w-4 h-4 text-amber-300" />
              <span>
                {weatherInfo.temp} {weatherInfo.condition}
              </span>
              <span className="opacity-60">|</span>
              <span className="opacity-90">{weatherInfo.locationName}</span>
            </div>

            {/* Hero Overlaid Text bottom left */}
            <div className="absolute bottom-8 left-8 right-8 text-white space-y-2">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold tracking-widest uppercase">
                <span className="w-4 h-0.5 bg-amber-400 inline-block" />
                <span>NAGARCONNECT CIVICTECH PLATFORM</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                Cleaner Streets. <br />
                Brighter Tomorrows.
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 max-w-lg font-medium leading-relaxed pt-1">
                A step towards a cleaner, greener and more livable city for every citizen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. DEDICATED ABOUT US SECTION (#about)
          ===================================================================== */}
      <section
        id="about"
        className="scroll-mt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full space-y-12"
      >
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 text-[#142F58] bg-blue-50 border border-blue-200 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase">
            <Building className="w-3.5 h-3.5 text-blue-600" />
            <span>ABOUT NAGARCONNECT PLATFORM</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Empowering Citizens. <br />
            Modernizing Municipal Governance.
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            NagarConnect is an enterprise-grade, multi-tenant civic services platform built for municipal corporations, urban local bodies (ULBs), and city administrations. We connect citizens directly with their ward officers through transparent, SLA-governed workflows.
          </p>
        </div>

        {/* 4 Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-2xs hover:shadow-md transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Multi-Tenant Fabric</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Provides dedicated data isolation and custom branding for Lucknow, Varanasi, Agra, and Prayagraj municipal corporations.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-2xs hover:shadow-md transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Guaranteed SLAs</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Time-bound statutory grievance tracking with automated department escalation for garbage, streetlights, and drainage.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-2xs hover:shadow-md transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Navigation className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Hyperlocal Ward Dispatch</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Direct routing of complaints to respective Ward Sanitary Inspectors and Junior Engineers without administrative delays.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-2xs hover:shadow-md transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Verifiable Redressal</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Mandatory before-and-after photo verification and citizen sign-off prior to closing any municipal complaint.
            </p>
          </div>
        </div>

        {/* Live Platform Counters Banner */}
        <div className="rounded-3xl p-8 bg-gradient-to-r from-[#0C1B33] via-[#142F58] to-[#1E3A8A] text-white shadow-xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-white/10">
            <div className="p-2 space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-sky-400">4</div>
              <p className="text-xs font-bold text-white">Municipal Corporations</p>
              <p className="text-[10px] text-slate-300">LMC, VNN, ANN, PNN</p>
            </div>

            <div className="p-2 space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-emerald-400">380+</div>
              <p className="text-xs font-bold text-white">Urban Wards Covered</p>
              <p className="text-[10px] text-slate-300">Full Zonal Hierarchy</p>
            </div>

            <div className="p-2 space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-amber-400">48h</div>
              <p className="text-xs font-bold text-white">Average Resolution SLA</p>
              <p className="text-[10px] text-slate-300">Sanitation & Drainage</p>
            </div>

            <div className="p-2 space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-purple-400">99.98%</div>
              <p className="text-xs font-bold text-white">System Availability</p>
              <p className="text-[10px] text-slate-300">PostgreSQL 17 Powered</p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          4. SECTION: EXPLORE OUR CITIES (#cities)
          ===================================================================== */}
      <section id="cities" className="scroll-mt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-6">
        <div>
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold tracking-wider uppercase mb-1">
            <span className="w-3 h-0.5 bg-slate-400 inline-block" />
            <span>DISCOVER YOUR CITY</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Explore <span className="text-[#2563EB]">Our Cities</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Local places, civic information and community resources — all in one place.
              </p>
            </div>
          </div>
        </div>

        {/* 4 City Cards in a horizontal row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cities.map((city) => {
            const fallback = CITY_FALLBACK_IMAGES[city.name] || {
              image:
                "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80",
              subtitle: `${city.ward_count} Wards • ${city.state}`,
            };

            return (
              <div
                key={city.id}
                onClick={() => {
                  window.location.href = `${clientPortalUrl}/login`;
                }}
                className="group cursor-pointer rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xs hover:shadow-lg transition-all flex flex-col"
              >
                <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                  <img
                    src={city.photo_url || fallback.image}
                    alt={city.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-white">
                    <div>
                      <h3 className="text-lg font-bold">{city.name}</h3>
                      <p className="text-[11px] text-slate-200 font-medium">
                        {fallback.subtitle}
                      </p>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 group-hover:bg-[#2563EB] transition-colors">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =====================================================================
          5. SECTION: PUBLIC INFORMATION (#public-info)
          ===================================================================== */}
      <section
        id="public-info"
        className="scroll-mt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-8"
      >
        <div>
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold tracking-wider uppercase mb-1">
            <span className="w-3 h-0.5 bg-slate-400 inline-block" />
            <span>A SMARTER, CLEANER, MORE INCLUSIVE TOMORROW</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            A better city starts with informed citizens.
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-3xl mt-1 leading-relaxed">
            NagarConnect promotes transparent public information, easier access to civic resources and greater citizen
            participation for cleaner, greener and more livable cities.
          </p>
        </div>

        {/* Split: Clean Avenue Photo on Left & 3 Feature Cards on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Clean City Photo */}
          <div className="lg:col-span-5 rounded-3xl overflow-hidden shadow-lg h-[340px] sm:h-[380px] relative">
            <img
              src="https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80"
              alt="Clean City Avenue with Green Trees"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-5 right-5 text-white">
              <p className="text-xs font-semibold">Lucknow Heritage Boulevard</p>
              <p className="text-[11px] text-slate-200">
                Daily mechanized sweeping and green corridor upkeep
              </p>
            </div>
          </div>

          {/* Right: 3 Feature Cards */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs hover:border-slate-300 transition-all flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Transparent Information</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Easy access to municipal information, policies, contacts and public resources across city departments.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs hover:border-slate-300 transition-all flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Cleaner, Safer Neighbourhoods</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Together for cleaner streets, better infrastructure and healthier communities through quick reporting.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs hover:border-slate-300 transition-all flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <UsersRound className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Active Citizen Participation</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  An informed and involved community makes the city stronger. Track resolutions and review field inspection reports.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          6. SECTION: LATEST PUBLIC UPDATES & GAZETTES
          ===================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-[#142F58]">
              Latest Public Updates & Gazettes
            </h3>
            <p className="text-xs text-slate-500">
              Live municipal communications published across city corporations
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 text-xs">
            {(["ALL", "NOTICE", "TENDER", "ADVISORY"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setNoticeFilter(tab)}
                className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                  noticeFilter === tab
                    ? "bg-[#142F58] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab === "ALL"
                  ? "All Updates"
                  : tab === "NOTICE"
                  ? "Notices"
                  : tab === "TENDER"
                  ? "E-Tenders"
                  : "Advisories"}
              </button>
            ))}
          </div>
        </div>

        {/* Notices Cards Grid */}
        <div className="space-y-3">
          {filteredNotices.length === 0 ? (
            <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
              No public notices currently active in this category.
            </div>
          ) : (
            filteredNotices.slice(0, 4).map((n) => (
              <div
                key={n.id}
                className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white hover:border-[#142F58] hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{n.title}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        n.category === "TENDER"
                          ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                          : n.category === "PUBLIC_HEALTH"
                          ? "bg-amber-50 text-amber-800 border border-amber-200"
                          : "bg-blue-50 text-blue-800 border border-blue-200"
                      }`}
                    >
                      {n.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{n.summary}</p>
                  <span className="text-[11px] text-slate-400 block">
                    Department: {n.department_name || "Municipal General Administration"}
                  </span>
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-400">
                    {n.published_at
                      ? new Date(n.published_at).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Active"}
                  </span>
                  <a
                    href={`${clientPortalUrl}/login`}
                    className="p-2 rounded-lg bg-slate-50 hover:bg-blue-50 text-[#142F58] transition-colors"
                    title="View Notice Details"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* =====================================================================
          7. DEDICATED CONTACT & MUNICIPAL HELPLINES SECTION (#contact)
          ===================================================================== */}
      <section
        id="contact"
        className="scroll-mt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full space-y-8"
      >
        <div className="border-t border-slate-200 pt-12">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold tracking-wider uppercase mb-1">
            <Phone className="w-3.5 h-3.5 text-blue-600" />
            <span>24X7 MUNICIPAL CONTROL ROOMS & HELPLINES</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Contact Your <span className="text-[#142F58]">City Administration</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Direct phone lines, emergency assistance, and nodal grievance officers for every municipal corporation.
              </p>
            </div>
            <a
              href={`${clientPortalUrl}/login`}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Submit Grievance Online →</span>
            </a>
          </div>
        </div>

        {/* 4 Corporation Helpline Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-3 hover:border-blue-400 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-md">
                LMC • Lucknow
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-slate-900">Lucknow Municipal Corp.</h4>
              <p className="text-[11px] text-slate-500">Hazratganj Headquarters</p>
            </div>
            <div className="pt-2 border-t border-slate-100 space-y-1 text-xs">
              <div className="flex items-center gap-1.5 text-slate-700">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono font-bold text-blue-700">1800-180-1533</span>
              </div>
              <p className="text-[10px] text-slate-400">Control Room: 0522-2611116</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-3 hover:border-blue-400 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-md">
                VNN • Varanasi
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-slate-900">Varanasi Nagar Nigam</h4>
              <p className="text-[11px] text-slate-500">Sigra Central Office</p>
            </div>
            <div className="pt-2 border-t border-slate-100 space-y-1 text-xs">
              <div className="flex items-center gap-1.5 text-slate-700">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono font-bold text-blue-700">1800-180-5567</span>
              </div>
              <p className="text-[10px] text-slate-400">Control Room: 0542-2221711</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-3 hover:border-blue-400 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-900 bg-purple-50 px-2.5 py-1 rounded-md">
                ANN • Agra
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-slate-900">Agra Nagar Nigam</h4>
              <p className="text-[11px] text-slate-500">M.G. Road Corporation HQ</p>
            </div>
            <div className="pt-2 border-t border-slate-100 space-y-1 text-xs">
              <div className="flex items-center gap-1.5 text-slate-700">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono font-bold text-blue-700">1800-180-3030</span>
              </div>
              <p className="text-[10px] text-slate-400">Control Room: 0562-2520612</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-3 hover:border-blue-400 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-900 bg-sky-50 px-2.5 py-1 rounded-md">
                PNN • Prayagraj
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-slate-900">Prayagraj Nagar Nigam</h4>
              <p className="text-[11px] text-slate-500">Civil Lines Headquarters</p>
            </div>
            <div className="pt-2 border-t border-slate-100 space-y-1 text-xs">
              <div className="flex items-center gap-1.5 text-slate-700">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono font-bold text-blue-700">1800-180-4444</span>
              </div>
              <p className="text-[10px] text-slate-400">Control Room: 0532-2407551</p>
            </div>
          </div>
        </div>

        {/* Emergency & State Helplines Strip */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-6">
            <span className="font-bold text-slate-700">Quick Helplines:</span>
            <span className="text-slate-600">
              Emergency Police & Fire: <strong className="text-rose-600">112</strong>
            </span>
            <span className="text-slate-600">
              Swachhata Sanitation: <strong className="text-emerald-700">1969</strong>
            </span>
            <span className="text-slate-600">
              Ambulance: <strong className="text-blue-700">108</strong>
            </span>
          </div>

          <div className="text-slate-500 text-[11px]">
            Centralised NagarConnect Support:{" "}
            <a href="mailto:support@nagarconnect.gov.in" className="text-blue-600 hover:underline">
              support@nagarconnect.gov.in
            </a>
          </div>
        </div>
      </section>

      {/* =====================================================================
          8. CTA BANNER
          ===================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="rounded-3xl p-8 sm:p-10 border border-slate-200 bg-gradient-to-r from-blue-50/60 via-slate-50 to-blue-50/40 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 relative z-10">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold tracking-wider uppercase">
              <span className="w-3 h-0.5 bg-slate-500 inline-block" />
              <span>LET&apos;S BUILD BETTER CITIES TOGETHER</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Ready to connect with your city?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
              Explore public information about your city, or sign in to access civic services.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 relative z-10 w-full sm:w-auto">
            <button
              onClick={() => setActiveModal("public-resources")}
              className="w-full sm:w-auto px-6 py-3 rounded-full text-xs font-bold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 transition-colors shadow-2xs flex items-center justify-center gap-1.5"
            >
              <span>Explore Public Information</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            {currentUser ? (
              <a
                href={
                  currentUser.user_type === "CITIZEN"
                    ? `${clientPortalUrl}/citizen`
                    : currentUser.user_type === "PLATFORM_ADMIN"
                    ? `${superAdminUrl}/super-admin`
                    : `${adminPortalUrl}/admin`
                }
                className="w-full sm:w-auto px-6 py-3 rounded-full text-xs font-bold text-white bg-[#142F58] hover:bg-[#1a3c6d] transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Go to Dashboard</span>
                <span>→</span>
              </a>
            ) : (
              <a
                href={`${clientPortalUrl}/login`}
                className="w-full sm:w-auto px-6 py-3 rounded-full text-xs font-bold text-white bg-[#0D2240] hover:bg-[#142F58] transition-colors shadow-md flex items-center justify-center gap-1.5"
              >
                <span>Sign In to Citizen Services</span>
                <span>→</span>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================================
          9. INSTITUTIONAL FOOTER
          ===================================================================== */}
      <footer className="w-full bg-white border-t border-slate-200 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#142F58] text-white flex items-center justify-center shadow-xs">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-black text-[#142F58] tracking-tight block">
                  NagarConnect
                </span>
                <span className="text-[10px] text-slate-500 font-medium block">
                  Better Cities. Connected Citizens.
                </span>
              </div>
            </div>

            {/* Links */}
            <nav className="flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-600">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.id)}
                  className="hover:text-[#142F58] transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Language & Accessibility */}
            <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-slate-400" /> English ⌵
              </span>
              <a href="#about" onClick={(e) => handleNavClick(e, "about")} className="hover:underline">
                Accessibility
              </a>
              <a href="#about" onClick={(e) => handleNavClick(e, "about")} className="hover:underline">
                Privacy Policy
              </a>
              <a href="#about" onClick={(e) => handleNavClick(e, "about")} className="hover:underline">
                Terms of Use
              </a>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3 text-slate-400">
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-red-600 transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-slate-900 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-blue-600 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-pink-600 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-blue-700 transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
            <p>© 2026 NagarConnect. All rights reserved.</p>
            <p>CivicTech platform • Integrated with Indian Municipal Corporations</p>
          </div>
        </div>
      </footer>

      {/* =====================================================================
          10. INFORMATION MODALS
          ===================================================================== */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#142F58] flex items-center gap-2">
                {activeModal === "city-info" && <Info className="w-5 h-5 text-sky-500" />}
                {activeModal === "ward-contacts" && <Users className="w-5 h-5 text-emerald-500" />}
                {activeModal === "public-resources" && <BookOpen className="w-5 h-5 text-amber-500" />}
                {activeModal === "search" && <Search className="w-5 h-5 text-blue-600" />}
                <span>
                  {activeModal === "city-info" && "City Information & Governance"}
                  {activeModal === "ward-contacts" && "Ward Directory & Contacts"}
                  {activeModal === "public-resources" && "Municipal Public Resources"}
                  {activeModal === "search" && "Municipal Service & Ward Search"}
                </span>
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-3 max-h-80 overflow-y-auto">
              {activeModal === "city-info" && (
                <div className="space-y-3">
                  <p>
                    NagarConnect serves 4 major municipal corporations in Uttar Pradesh with standardized 48-hour grievance redressal SLAs and digital service applications:
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {cities.map((c) => (
                      <div key={c.id} className="p-2.5 rounded-lg bg-slate-50 border">
                        <strong className="text-slate-900 block">{c.name}</strong>
                        <span className="text-slate-500">{c.ward_count} Municipal Wards</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeModal === "ward-contacts" && (
                <div className="space-y-2">
                  <p className="font-semibold text-slate-800">
                    Live Nodal Ward Officers & Control Rooms:
                  </p>
                  <div className="space-y-2">
                    {[
                      { ward: "Ward 01: Hazratganj", officer: "Er. Ramesh Shukla", phone: "0522-2289101" },
                      { ward: "Ward 02: Gomti Nagar", officer: "Er. Sunita Verma", phone: "0522-2304501" },
                      { ward: "Ward 03: Chowk", officer: "Er. Mohd. Irfan", phone: "0522-2451201" },
                      { ward: "Ward 04: Aliganj", officer: "Er. Pradeep Yadav", phone: "0522-2781102" },
                    ].map((w) => (
                      <div key={w.ward} className="p-2.5 rounded-lg bg-slate-50 border flex justify-between items-center">
                        <div>
                          <strong className="text-slate-900 block">{w.ward}</strong>
                          <span className="text-slate-500">Nodal: {w.officer}</span>
                        </div>
                        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded">
                          {w.phone}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeModal === "public-resources" && (
                <div className="space-y-2">
                  <p className="font-semibold text-slate-800">
                    Active Civic Departments & Citizen Charters:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {departments.length > 0 ? (
                      departments.map((d) => (
                        <div key={d.id} className="p-2.5 rounded-lg bg-slate-50 border">
                          <strong className="text-slate-900 block">{d.name}</strong>
                          <span className="text-slate-500 text-[11px]">{d.code}</span>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="p-2.5 rounded-lg bg-slate-50 border">
                          <strong className="text-slate-900 block">Sanitation & Solid Waste</strong>
                          <span className="text-slate-500">Door-to-door collection, dumping yard</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-50 border">
                          <strong className="text-slate-900 block">Civil Engineering</strong>
                          <span className="text-slate-500">Roads, footpaths, bridges</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {activeModal === "search" && (
                <div className="space-y-3">
                  <p>
                    Use the hero search bar to find your local area or ward using OpenStreetMap geocoding, or launch the citizen portal:
                  </p>
                  <a
                    href={`${clientPortalUrl}/citizen/complaints/new`}
                    className="block p-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold text-center transition-colors"
                  >
                    File New Grievance Online →
                  </a>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
