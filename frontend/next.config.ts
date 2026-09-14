import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This repo has two lockfiles (the repo root and frontend/), so Next infers
  // the workspace root as C:\edubridge-ai instead of frontend/ and warns about
  // it. Pin both roots to this directory so resolution and output tracing stay
  // inside the app.
  outputFileTracingRoot: __dirname,
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
