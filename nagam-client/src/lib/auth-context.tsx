"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { apiClient } from "./api";

export interface User {
  id: string;
  email: string;
  phone?: string;
  user_type: string;
  roles: string[];
  citizen_profile?: {
    first_name: string;
    last_name: string;
    address: string;
    city_id?: string;
    ward_id?: string;
    preferred_language: string;
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      const me = await apiClient<User>("/auth/me");
      setUser(me);
      localStorage.setItem("user", JSON.stringify(me));
      document.cookie = `nagar_token=${token}; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = `nagar_user=${encodeURIComponent(JSON.stringify(me))}; path=/; max-age=604800; SameSite=Lax`;
    } catch {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      document.cookie = "nagar_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "nagar_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem("access_token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    document.cookie = `nagar_token=${token}; path=/; max-age=604800; SameSite=Lax`;
    document.cookie = `nagar_user=${encodeURIComponent(JSON.stringify(userData))}; path=/; max-age=604800; SameSite=Lax`;
    setUser(userData);
  };

  const logout = async () => {
    try {
      await apiClient("/auth/logout", { method: "POST" });
    } catch {
      // ignore
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      document.cookie = "nagar_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "nagar_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      setUser(null);
      window.location.href = "/";
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
