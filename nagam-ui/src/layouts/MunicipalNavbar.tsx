import React from "react";
import { cn } from "../lib/utils";
import { Landmark, Bell, User, LogOut, ChevronDown, Menu } from "lucide-react";

export interface NavbarProps {
  appName?: string;
  portalSubtitle?: string;
  links?: { label: string; href: string }[];
  user?: { name: string; email: string; role?: string } | null;
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
  onLogoutClick?: () => void;
  language?: string;
  onLanguageToggle?: () => void;
  className?: string;
}

export const MunicipalNavbar: React.FC<NavbarProps> = ({
  appName = "NagarConnect",
  portalSubtitle = "Unified Municipal Corporation Portal",
  links = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Notices & Tenders", href: "/notices" },
    { label: "Civic Services", href: "/services" },
    { label: "Directory", href: "/directory" },
  ],
  user,
  onLoginClick,
  onRegisterClick,
  onLogoutClick,
  language = "English",
  onLanguageToggle,
  className,
}) => {
  return (
    <header className={cn("w-full bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs", className)}>
      {/* Top Government Strip */}
      <div className="w-full bg-[#142F58] text-white text-xs py-1 px-4 sm:px-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="font-semibold tracking-wide">MUNICIPAL GOVERNANCE PLATFORM</span>
          <span className="hidden sm:inline text-slate-300">|</span>
          <span className="hidden sm:inline text-slate-200">Demonstration Model for Indian Municipal Corporations</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={onLanguageToggle}
            className="hover:underline cursor-pointer flex items-center gap-1 text-slate-200"
          >
            <span>Language: {language}</span>
          </button>
          <span className="text-amber-400 font-medium">Helpline: 1800-180-1553</span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand identity */}
        <a href="/" className="flex items-center gap-3.5 group">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#142F58] to-[#245A86] text-white flex items-center justify-center shadow-md">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-[#142F58]">{appName}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                CivicTech
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">{portalSubtitle}</p>
          </div>
        </a>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-700">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="hover:text-[#142F58] transition-colors py-1 hover:border-b-2 hover:border-[#142F58]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <a
                href="/citizen"
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#EAF1F6] text-[#142F58] hover:bg-[#d6e5f1] transition-colors"
              >
                My Portal
              </a>
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-800">{user.name}</span>
                <span className="text-[10px] text-slate-500">{user.role || "Citizen"}</span>
              </div>
              <button
                onClick={onLogoutClick}
                title="Logout"
                className="p-2 text-slate-500 hover:text-red-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onLoginClick}
                className="px-4 py-2 text-sm font-semibold text-[#142F58] hover:bg-[#EAF1F6] rounded-lg transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={onRegisterClick}
                className="px-4 py-2 text-sm font-semibold text-white bg-[#142F58] hover:bg-[#1E457E] rounded-lg shadow-sm transition-colors"
              >
                Register Citizen
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
