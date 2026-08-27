import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  experimental: {
    serverActions: {
      // Default is 1MB, which real photos (jersey cutouts, certificate
      // scans) routinely exceed. The uploadAsset action itself already
      // enforces a 5MB cap post-parse; this just has to clear that with
      // headroom for multipart overhead.
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;
