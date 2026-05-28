import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  // Vercel ne bundle pas les fichiers hors src/public par défaut.
  // On force l'inclusion des PDFs d'annales pour que la route watermark
  // puisse les lire en runtime (process.cwd()/data/medgen-annales).
  outputFileTracingIncludes: {
    '/api/medgen-annales/[id]/pdf': ['./data/medgen-annales/**/*'],
  },
};

export default nextConfig;
