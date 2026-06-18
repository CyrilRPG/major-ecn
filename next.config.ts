import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  // Tree-shaking ciblé des grosses librairies (icônes / animation / charts) :
  // n'embarque que les symboles réellement importés → moins de JS livré.
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "recharts"],
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
  // Le tracing de Vercel embarquait des assets STATIQUES lourds (vidéos
  // témoignages, images formules, PDF d'annales racine) dans le bundle des
  // fonctions serverless — ce qui faisait dépasser la limite de 300 Mo à la
  // route `render-html` (~354 Mo = public/ + Annales/). Ces fichiers sont
  // servis par le CDN, jamais lus par une fonction : on les exclut du trace.
  outputFileTracingExcludes: {
    '*': [
      'Annales/**',
      'public/temoignages/**',
      'public/formules/**',
      'public/flashcards-decor/**',
      'public/flashcards/**',
      'public/Flashcards images/**',
      'public/plateforme/**',
      'public/team/**',
      'public/blog/**',
      'public/fonts/**',
      'public/**/*.mp4',
    ],
  },
};

export default nextConfig;
