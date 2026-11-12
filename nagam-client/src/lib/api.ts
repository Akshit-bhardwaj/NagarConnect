const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export class ApiError extends Error {
  code: string;
  status: number;
  extra?: any;

  constructor(message: string, status: number, code: string = "API_ERROR", extra?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.extra = extra;
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint}`;
  
  // Retrieve token if present in localStorage or cookies
  let token: string | null = null;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("access_token");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: "include", // for HttpOnly refresh cookie
  };

  const res = await fetch(url, config);

  if (!res.ok) {
    let errBody: any = null;
    try {
      errBody = await res.json();
    } catch {
      // ignore
    }

    const message = errBody?.error?.message || errBody?.detail || res.statusText || "Request failed";
    const code = errBody?.error?.code || `HTTP_${res.status}`;
    throw new ApiError(message, res.status, code, errBody?.error?.extra);
  }

  // If 204 No Content
  if (res.status === 204) {
    return {} as T;
  }

  return res.json() as Promise<T>;
}
