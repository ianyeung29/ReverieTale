/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 'postgres' is a server-only dependency; keep it out of the client bundle.
  serverExternalPackages: ["postgres"],
};

export default nextConfig;
