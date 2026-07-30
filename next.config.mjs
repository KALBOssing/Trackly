/** @type {import('next').NextConfig} */
const nextConfig = {
  // "standalone" output is only for the self-hosted Docker build (see Dockerfile,
  // which sets DOCKER_BUILD=true). On Vercel this must be left unset — Vercel uses its
  // own build output format, and "standalone" causes every route to 404 there.
  output: process.env.DOCKER_BUILD === "true" ? "standalone" : undefined,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb",
    },
  },
};

export default nextConfig;
