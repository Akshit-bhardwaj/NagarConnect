import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import SmoothScroll from "@/components/SmoothScroll";

export const metadata: Metadata = {
  title: "NagarConnect Administration Console",
  description: "Municipal Operations, Ward Triage, and Civic Governance Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-100">
        <AuthProvider>
          <SmoothScroll>
            {children}
          </SmoothScroll>
        </AuthProvider>
      </body>
    </html>
  );
}
