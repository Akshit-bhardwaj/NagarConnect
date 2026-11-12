import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import SmoothScroll from "@/components/SmoothScroll";

export const metadata: Metadata = {
  title: "NagarConnect | Unified Municipal Corporation Portal",
  description: "Official digital municipal services portal for citizens to register grievances, track civic applications, and access public notices.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50">
        <AuthProvider>
          <SmoothScroll>
            {children}
          </SmoothScroll>
        </AuthProvider>
      </body>
    </html>
  );
}
