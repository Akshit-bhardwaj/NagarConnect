/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["nagam-ui"],
  images: {
    domains: ["images.unsplash.com"],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
    NEXT_PUBLIC_CLIENT_URL: process.env.NEXT_PUBLIC_CLIENT_URL || "http://localhost:3001",
    NEXT_PUBLIC_ADMIN_URL: process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3002",
    NEXT_PUBLIC_SUPER_ADMIN_URL: process.env.NEXT_PUBLIC_SUPER_ADMIN_URL || "http://localhost:3003",
  },
};

export default nextConfig;
