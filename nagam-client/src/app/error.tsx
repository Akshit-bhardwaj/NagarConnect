"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function GlobalErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    const isChunkError =
      error?.name === "ChunkLoadError" ||
      error?.message?.includes("Loading chunk") ||
      error?.message?.includes("Failed to fetch dynamically imported module") ||
      error?.message?.includes("Minified React error #42");

    if (isChunkError && typeof window !== "undefined") {
      const storageKey = "last_chunk_reload";
      const lastReload = sessionStorage.getItem(storageKey);
      const now = Date.now();
      if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
        sessionStorage.setItem(storageKey, now.toString());
        window.location.reload();
      }
    }
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#142F58] mx-auto flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900">Application Reload Needed</h2>
          <p className="text-xs text-slate-500">
            Citizen portal assets were updated. Refresh to synchronize with the latest version.
          </p>
        </div>
        <div className="pt-2">
          <button
            onClick={() => window.location.reload()}
            className="w-full py-2.5 px-4 bg-[#142F58] hover:bg-[#1a3c6d] text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reload Application</span>
          </button>
        </div>
      </div>
    </div>
  );
}
