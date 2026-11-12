"use client";

import React, { useState } from "react";
import { MunicipalNavbar, MunicipalFooter } from "nagam-ui";
import { useAuth } from "@/lib/auth-context";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [lang, setLang] = useState("English");

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <MunicipalNavbar
        user={
          user
            ? {
                name: user.citizen_profile?.first_name || user.email.split("@")[0],
                email: user.email,
                role: user.user_type,
              }
            : null
        }
        onLoginClick={() => (window.location.href = "/login")}
        onRegisterClick={() => (window.location.href = "/register")}
        onLogoutClick={logout}
        language={lang}
        onLanguageToggle={() => setLang(lang === "English" ? "हिन्दी" : "English")}
      />
      <main className="flex-1">{children}</main>
      <MunicipalFooter />
    </div>
  );
}
