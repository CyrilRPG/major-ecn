import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      // Supabase Storage (héros/images d'articles de blog uploadés via l'éditeur
      // admin). Sans ce host, next/image bloque le rendu → vignettes cassées.
      { protocol: "https", hostname: "mrrgfnirpwsknuyiwcqy.supabase.co" },
    ],
  },
  // Tree-shaking ciblé des grosses librairies (icônes / animation / charts) :
  // n'embarque que les symboles réellement importés → moins de JS livré.
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "recharts"],
  },
  // Redirections 301 permanentes : anciennes URL (ancien site / liens externes
  // indexés) → URL actuelles. Préserve le SEO (le « jus » des liens est transféré)
  // et corrige les liens cassés. À compléter avec les URL listées dans Google
  // Search Console (rapport « Pages » → indexées + 404).
  async redirects() {
    return [
      // Lien cassé signalé : ancienne URL de l'article « documents de candidature ».
      { source: "/evc-pae-documents-candidature", destination: "/blog/evc-pae-liste-documents-fournir", permanent: true },
      { source: "/evc-pae-liste-documents", destination: "/blog/evc-pae-liste-documents-fournir", permanent: true },
      // Anciennes URL d'articles potentiellement à la racine → /blog/<slug>.
      { source: "/comment-reussir-les-evc-conseils-laureats", destination: "/blog/comment-reussir-les-evc-conseils-laureats", permanent: true },
      { source: "/comment-se-presenter-aux-evc", destination: "/blog/comment-se-presenter-aux-evc", permanent: true },
      { source: "/decryptage-defis-evc", destination: "/blog/decryptage-defis-evc", permanent: true },
      { source: "/remuneration-medecin-etranger-france", destination: "/blog/remuneration-medecin-etranger-france", permanent: true },
      { source: "/structures-accueil-laureats-pae", destination: "/blog/structures-accueil-laureats-pae", permanent: true },
      { source: "/impact-evc-acces-soins", destination: "/blog/impact-evc-acces-soins", permanent: true },
      // Ancien chemin « Nos conseils » indexé par Google — redirige vers le blog.
      { source: "/nos-conseils", destination: "/blog", permanent: true },
      { source: "/nos-conseils/:slug*", destination: "/blog", permanent: true },
    ];
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
    '/api/admin/campaign': ['./src/lib/email/campaigns/**/*'],
    '/api/cron/campaign-drip': ['./src/lib/email/campaigns/**/*'],
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
