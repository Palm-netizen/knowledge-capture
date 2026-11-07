import type { NextConfig } from "next";

// Static export so the app can be hosted on GitHub Pages.
// NEXT_PUBLIC_BASE_PATH is set by the Pages workflow (e.g. "/knowledge-capture/studio");
// leave it unset for local dev / Vercel.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
  // This repo also has a root-level package-lock.json (the Knowledge
  // Capture app at /), which makes Turbopack guess the wrong workspace
  // root for this app. Pin it explicitly.
  turbopack: { root: __dirname },
};

export default nextConfig;
