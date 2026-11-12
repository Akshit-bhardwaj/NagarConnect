import React from "react";
import { Landmark, Phone, Mail, MapPin, ShieldCheck, HeartHandshake } from "lucide-react";

export const MunicipalFooter: React.FC = () => {
  return (
    <footer className="w-full bg-[#0D1E38] text-slate-300 pt-16 pb-12 border-t-4 border-[#245A86]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-700/60">
          {/* Col 1: About */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#245A86] text-white flex items-center justify-center">
                <Landmark className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">NagarConnect</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              An enterprise-grade civic technology platform enabling citizen grievance redressal, public notices, and municipal service applications across urban local bodies.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Multi-Tenant Local Governance Architecture</span>
            </div>
          </div>

          {/* Col 2: Emergency Helplines */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Emergency Helplines</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>Central Municipal Control Room: <strong>1800-180-1553</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-blue-400" />
                <span>Jal Sansthan (Water Emergency): <strong>0522-2623344</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Solid Waste & Health: <strong>0522-2611116</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-rose-400" />
                <span>Ambulance: <strong>108</strong> | Fire: <strong>101</strong></span>
              </li>
            </ul>
          </div>

          {/* Col 3: Civic Services */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Civic Portals</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="/notices" className="hover:text-white transition-colors">Tenders & Public Advisories</a></li>
              <li><a href="/directory" className="hover:text-white transition-colors">Ward & Locality Directory</a></li>
              <li><a href="/services" className="hover:text-white transition-colors">Birth & Death Certificates</a></li>
              <li><a href="/services" className="hover:text-white transition-colors">Property Tax Mutation</a></li>
              <li><a href="/about" className="hover:text-white transition-colors">Citizen Charter & SLA Policies</a></li>
            </ul>
          </div>

          {/* Col 4: Platform Disclaimer */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Concept & Architecture</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Designed as a configurable platform ready for deployment across Indian Municipal Corporations including Lucknow, Varanasi, Agra, and Prayagraj.
            </p>
            <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 text-[11px] text-amber-300">
              ⚠️ <strong>Demo Platform:</strong> All sample data, notices, and metrics are illustrative for evaluation purposes.
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 NagarConnect CivicTech Platform. Built for Local Urban Governance.</p>
          <div className="flex gap-6">
            <a href="/privacy" className="hover:text-slate-400">Privacy Policy</a>
            <a href="/terms" className="hover:text-slate-400">Terms of Use</a>
            <a href="/accessibility" className="hover:text-slate-400">Accessibility Statement</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
