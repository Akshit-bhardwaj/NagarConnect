/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["nagam-ui"],
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
