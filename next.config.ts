import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: { bodySizeLimit: '30mb' },
    optimizePackageImports: ["lucide-react", "framer-motion", "recharts"],
  },
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
  // Redirections 301 permanentes : anciennes URL (ancien site / liens externes
  // indexés) → URL actuelles. Préserve le SEO (le « jus » des liens est transféré)
  // et corrige les liens cassés. À compléter avec les URL listées dans Google
  // Search Console (rapport « Pages » → indexées + 404).
  async redirects() {
    return [
      // `/formules` n'a pas de page d'index (seulement /formules/<offre>) et
      // renvoyait un 404, alors que la page était liée depuis /contact et
      // explorée par Google. Les trois offres sont présentées sur /tarifs.
      { source: "/formules", destination: "/tarifs", permanent: true },
      // Ancienne URL des formules, toujours indexée et concurrente de /tarifs
      // sur la requête « préparation EVC ». Elle n'a plus de fonction propre.
      { source: "/formules-major-ecn-preparation-ecn/preparation-evc-pae-medecine", destination: "/tarifs", permanent: true },
      { source: "/formules-major-ecn-preparation-ecn/preparation-evc-pae-medecine/:path*", destination: "/tarifs", permanent: true },
      { source: "/formules-major-ecn-preparation-ecn", destination: "/tarifs", permanent: true },
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
      // Ancienne URL des témoignages (ancien site), toujours indexée par Google :
      // une recherche d'avis tombait sur un 404. Next normalise le slash final,
      // donc `.../temoignages-major-ecn-preparation-ecn/` est couvert aussi.
      { source: "/temoignages-major-ecn-preparation-ecn", destination: "/temoignages", permanent: true },

      /* ── Adresses de l'ancien site WordPress ────────────────────────────
         Les 37 URL du rapport « Introuvable (404) » de la Search Console
         (export du 31/08/2026). Elles ne sont liées nulle part sur le site
         actuel mais restent explorées et suivies depuis l'extérieur : chacune
         part vers la page qui traite le même sujet aujourd'hui.
         Les règles précises viennent AVANT les règles à motif : Next retient
         la première correspondance. */

      // Anciens articles, vers leur équivalent actuel
      { source: "/evc-pae-liste-complete-des-documents-a-fournir-et-les-regles-a-connaitre-pour-une-candidature-reussie", destination: "/blog/evc-pae-liste-documents-fournir", permanent: true },
      { source: "/evc-pae-comment-se-presenterw", destination: "/blog/comment-se-presenter-aux-evc", permanent: true },
      // Cette adresse n'est pas dans l'export mais ressort encore dans les
      // résultats de recherche, et renvoyait un 404.
      { source: "/comment-se-presenter-aux-epreuves-de-verification-des-connaissances", destination: "/blog/comment-se-presenter-aux-evc", permanent: true },
      { source: "/structures-daccueil-pour-les-laureats-pae-chu-cliniques-ou-secteur-prive", destination: "/blog/structures-accueil-laureats-pae", permanent: true },
      { source: "/quelle-remuneration-pour-un-medecin-etranger-en-pratiquant-en-france", destination: "/blog/remuneration-medecin-etranger-france", permanent: true },
      { source: "/impact-evc-acces-soins-integration-professionnels", destination: "/blog/impact-evc-acces-soins", permanent: true },
      { source: "/limpact-des-epreuves-de-verification-des-connaissances-sur-lacces-aux-soins-et-lintegration-des-professionnels-de-sante-un-regard-a-travers-le-prisme-de-major-ecn", destination: "/blog/impact-evc-acces-soins", permanent: true },
      { source: "/decryptage-des-principaux-defis-des-epreuves-de-verification-des-connaissances-evc", destination: "/blog/decryptage-defis-evc", permanent: true },
      { source: "/reforme-ecn-edn-ecos-parcours-medical", destination: "/blog/evc-edn-difference-a-ne-pas-confondre", permanent: true },
      // Article sur le stagiaire associé : aucun équivalent publié, le guide
      // couvre le sujet (parcours des médecins à diplôme étranger).
      { source: "/stagiaire-associe-une-passerelle-meconnue-mais-decisive-pour-les-medecins-etrangers-en-france", destination: "/guide-evc", permanent: true },

      // Anciennes pages vitrine
      { source: "/nous-contacter", destination: "/contact", permanent: true },
      { source: "/faq-major-ecn-preparation-ecn", destination: "/faq", permanent: true },
      { source: "/tarifs-major-ecn-preparation-ecn", destination: "/tarifs", permanent: true },
      { source: "/qui-sommes-nous-major-ecn", destination: "/methode", permanent: true },
      { source: "/qui-sommes-nous", destination: "/methode", permanent: true },
      { source: "/enseignants-major-ecn", destination: "/methode", permanent: true },
      { source: "/inscription-programme", destination: "/inscription", permanent: true },
      { source: "/conseils", destination: "/blog", permanent: true },
      { source: "/reduction-dimpot", destination: "/tarifs", permanent: true },
      // Anciennes pages « concours » : le guide est désormais la page de
      // référence sur le sujet.
      { source: "/concours-evc-pae", destination: "/guide-evc", permanent: true },
      { source: "/concours-medecins-etrangers", destination: "/guide-evc", permanent: true },

      // Anciennes offres de préparation à l'ECN (D2, D3, D4, dernier tour,
      // ECOS) : elles n'existent plus, /tarifs présente les formules actuelles.
      { source: "/formule-d3", destination: "/tarifs", permanent: true },
      { source: "/formule-d4", destination: "/tarifs", permanent: true },
      { source: "/d4-special-dernier-tour", destination: "/tarifs", permanent: true },
      { source: "/formules-major-ecn-preparation-ecn", destination: "/tarifs", permanent: true },
      { source: "/formules-major-ecn-preparation-ecn/:path*", destination: "/tarifs", permanent: true },

      // Restes de l'ancien thème WordPress : catégories du blog et fragments
      // de méga-menu, explorés comme des pages à part entière.
      { source: "/category/:path*", destination: "/blog", permanent: true },
      { source: "/megamenu/:path*", destination: "/", permanent: true },
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
    // Seule route qui lit `public/` sur disque (logo + tampon du certificat) :
    // `public/**` est exclu du trace pour toutes les fonctions (voir plus bas).
    '/api/certificate/[cours]': ['./public/major-ecn-logo.png', './public/tampon-pae-formation.png'],
    '/api/admin/campaign': ['./src/lib/email/campaigns/**/*'],
    '/api/cron/campaign-drip': ['./src/lib/email/campaigns/**/*'],
  },
  // Le tracing de Vercel embarque les assets STATIQUES de `public/` dans le
  // bundle de chaque fonction serverless. Une liste de sous-dossiers exclus
  // suffisait jusqu'à ce que `public/prive-images` (135 Mo) s'y ajoute sans
  // être exclu : la route `render-html` a atteint 252,67 Mo, au-dessus de la
  // limite de 250 Mo, et les déploiements ont échoué (03/09/2026). Ces
  // fichiers sont servis par le CDN, jamais lus par une fonction : on exclut
  // TOUT `public/`, et seule la route des certificats réinclut ses deux images
  // (`outputFileTracingIncludes` ci-dessus). Un nouveau dossier d'images ne
  // pourra plus faire déborder une fonction.
  outputFileTracingExcludes: {
    '*': [
      'Annales/**',
      'public/**',
    ],
  },
};

export default nextConfig;
