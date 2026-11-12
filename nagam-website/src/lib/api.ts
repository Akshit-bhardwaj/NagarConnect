const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint}`;

  // Retrieve token if present in localStorage or cookies
  let token: string | null = null;
  if (typeof window !== "undefined") {
    token =
      localStorage.getItem("access_token") ||
      localStorage.getItem("staff_access_token") ||
      localStorage.getItem("superadmin_access_token");

    if (!token && typeof document !== "undefined") {
      const match = document.cookie.match(/(?:^|;\s*)nagar_token=([^;]+)/);
      if (match) {
        token = decodeURIComponent(match[1]);
      }
    }
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: "include", // for HttpOnly cross-port session cookies from FastAPI
  });

  if (!res.ok) {
    let errDetail = res.statusText;
    try {
      const errJson = await res.json();
      if (errJson?.detail) errDetail = errJson.detail;
    } catch {
      // ignore
    }
    throw new Error(`API Error: ${errDetail}`);
  }

  return res.json() as Promise<T>;
}
