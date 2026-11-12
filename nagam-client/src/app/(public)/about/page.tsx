"use client";

import React from "react";
import { Card, CardContent } from "nagam-ui";
import { ShieldCheck, Users, Landmark, Clock, CheckCircle2 } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-4">
        <span className="text-xs font-bold text-[#245A86] uppercase tracking-wider">About NagarConnect</span>
        <h1 className="text-4xl font-extrabold text-[#142F58]">Empowering Citizens & City Administrations</h1>
        <p className="text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          NagarConnect is a configurable, multi-tenant civic services technology platform designed specifically for
          Indian Municipal Corporations and Urban Local Bodies.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-xl bg-[#EAF1F6] text-[#142F58] flex items-center justify-center">
            <Landmark className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Multi-Tenant Architecture</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            One cohesive platform powers multiple municipal corporations with strict tenant isolation, customizable
            branding, and tailored SLAs.
          </p>
        </Card>

        <Card className="p-6 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Zero-Trust Security</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Citizens can only access their private grievances and applications. Cross-ward and cross-tenant access is
            strictly prohibited.
          </p>
        </Card>

        <Card className="p-6 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Automated SLA Engine</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Every grievance has a statutory time limit. Unresolved issues escalate automatically through department and
            ward hierarchies.
          </p>
        </Card>
      </div>

      <div className="p-8 rounded-2xl bg-[#EAF1F6] text-slate-800 space-y-4">
        <h3 className="text-xl font-bold text-[#142F58]">Citizen Service Charter & Guiding Principles</h3>
        <ul className="space-y-2.5 text-sm text-slate-700">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span><strong>Transparent Tracking:</strong> Unique human-readable reference number for every complaint.</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span><strong>Proof-Based Resolution:</strong> Field officers must provide photographic verification before resolution.</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span><strong>Citizen Verification:</strong> Citizens can rate resolution quality or dispute and reopen cases.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
