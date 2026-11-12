"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    try {
      const token = localStorage.getItem("superadmin_access_token");
      if (token) {
        router.replace("/super-admin");
      } else {
        router.replace("/login");
      }
    } catch {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080E1A] text-slate-300">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold">Loading NagarConnect Super Admin...</span>
      </div>
    </div>
  );
}
