import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  // Chromium (rendu PDF des fiches) : @sparticuz/chromium-min ne contient pas
  // le binaire (téléchargé au cold-start depuis Github), mais on garde quand
  // même `serverExternalPackages` pour ne pas faire passer puppeteer-core et
  // le SDK chromium-min par le bundler Turbopack (qui sinon tente de tracer
  // tout l'arbre de deps).
  serverExternalPackages: ["@sparticuz/chromium-min", "puppeteer-core"],
  // Vercel ne bundle pas les fichiers hors src/public par défaut.
  // On force l'inclusion des PDFs d'annales pour que la route watermark
  // puisse les lire en runtime (process.cwd()/data/medgen-annales).
  outputFileTracingIncludes: {
    '/api/medgen-annales/[id]/pdf': ['./data/medgen-annales/**/*'],
  },
};

export default nextConfig;
