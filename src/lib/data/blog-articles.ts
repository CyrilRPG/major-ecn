/**
 * Données statiques des articles du blog Major ECN.
 * Chaque article a sa propre structure de rendu (template-specific
 * components dans src/components/marketing/blog/articles/). Cette table
 * sert d'index pour la liste, le SEO et les métadonnées partagées.
 */

export type BlogCategory =
  | 'epreuves-evc'
  | 'candidature-dossier'
  | 'exercice-medical'
  | 'carriere-remuneration'
  | 'medecins-etrangers'
  | 'conseils-methodologie';

export const BLOG_CATEGORIES: Record<BlogCategory, { label: string; tone: string; bg: string; fg: string }> = {
  'epreuves-evc':         { label: 'Épreuves EVC',           tone: 'red',    bg: '#FDE7E9', fg: '#C0001F' },
  'candidature-dossier':  { label: 'Candidature & Dossier',  tone: 'blue',   bg: '#E5F1FF', fg: '#1E4D8B' },
  'exercice-medical':     { label: 'Exercice médical en France', tone: 'green', bg: '#E7F6EC', fg: '#16793C' },
  'carriere-remuneration':{ label: 'Carrière & Rémunération', tone: 'orange',bg: '#FEF3E2', fg: '#B26A00' },
  'medecins-etrangers':   { label: 'Médecins étrangers',     tone: 'violet', bg: '#EDE9FE', fg: '#6D28D9' },
  'conseils-methodologie':{ label: 'Conseils & Méthodologie', tone: 'amber',bg: '#FEF3C7', fg: '#92400E' },
};

/**
 * Image de couverture par catégorie — toutes les photos du blog sont au format
 * carré (1:1). Utilisé pour les vignettes (« à la une », articles similaires)
 * afin d'afficher un visuel pertinent par thématique plutôt qu'un placeholder.
 */
export const BLOG_CATEGORY_IMAGE: Record<BlogCategory, string> = {
  'epreuves-evc':          '/blog/medecins-essentiels-doctor-patient.jpg',
  'candidature-dossier':   '/blog/practitioners/practitioner-female-laptop.jpg',
  'exercice-medical':      '/blog/medecins-essentiels-corridor.jpg',
  'carriere-remuneration': '/blog/practitioners/practitioner-male-tie.jpg',
  'medecins-etrangers':    '/blog/practitioners/practitioner-male-glasses.jpg',
  'conseils-methodologie': '/blog/reussir-evc-asian-laptop.jpg',
};

export type BlogArticleMeta = {
  slug: string;
  title: string;
  excerpt: string;
  category: BlogCategory;
  readingMinutes: number;
  readers?: number;
  publishedAt?: string;
  featured?: boolean;
  popularRank?: number; // 1..5 — utilisé par l'aside « Articles les plus consultés »
};

export const BLOG_ARTICLES: BlogArticleMeta[] = [
  {
    slug: 'comment-reussir-les-evc-conseils-laureats',
    title: 'Comment réussir les EVC : les conseils que les lauréats auraient aimé connaître plus tôt',
    excerpt: "Méthode, gestion du temps, examens blancs, posture face au correcteur : les leçons clés tirées des retours de candidats lauréats pour préparer efficacement les Épreuves de Vérification des Connaissances.",
    category: 'conseils-methodologie',
    readingMinutes: 10,
    readers: 1845,
    publishedAt: '2026-06-07',
    featured: true,
    popularRank: 2,
  },
  {
    slug: 'comment-se-presenter-aux-evc',
    title: 'EVC PAE : comment s\'inscrire aux Épreuves de Vérification des Connaissances ?',
    excerpt: 'Conditions d\'inscription, liste A et liste B, documents à fournir, nombre de tentatives et procédure auprès de l\'ARS : le guide complet pour réussir votre candidature aux EVC.',
    category: 'candidature-dossier',
    readingMinutes: 5,
    readers: 2232,
    publishedAt: '2026-04-12',
    featured: true,
    popularRank: 1,
  },
  {
    slug: 'evc-pae-liste-documents-fournir',
    title: 'EVC PAE : liste complète des documents à fournir et les règles à connaître pour une candidature réussie',
    excerpt: 'Tous les documents nécessaires pour votre inscription aux Épreuves de Vérification des Connaissances (EVC), les justificatifs acceptés, les exigences linguistiques, le nombre de tentatives autorisées et les règles essentielles pour constituer un dossier conforme.',
    category: 'candidature-dossier',
    readingMinutes: 11,
    readers: 2610,
    publishedAt: '2026-03-28',
    popularRank: 2,
  },
  {
    slug: 'decryptage-defis-evc',
    title: 'Pourquoi les candidats échouent-ils aux EVC ? Les 5 défis majeurs identifiés par Major ECN depuis plus de 15 ans',
    excerpt: 'Manque de méthode, isolement, pénurie de supports d\'entraînement ou difficulté à hiérarchiser les recommandations : les principaux obstacles observés par Major ECN auprès de plus de 9 000 médecins accompagnés.',
    category: 'epreuves-evc',
    readingMinutes: 5,
    readers: 1870,
    publishedAt: '2026-05-08',
    popularRank: 3,
  },
  {
    slug: 'remuneration-medecin-etranger-france',
    title: 'Quelle rémunération pour un médecin étranger en pratiquant en France ?',
    excerpt: 'Grilles salariales, différences selon les structures et perspectives d’évolution après la réussite des EVC.',
    category: 'carriere-remuneration',
    readingMinutes: 9,
    readers: 4016,
    publishedAt: '2026-02-15',
    popularRank: 4,
  },
  {
    slug: 'structures-accueil-laureats-pae',
    title: 'Structures d’accueil pour les lauréats PAE : CHU, cliniques ou secteur privé ?',
    excerpt: 'Comprendre les différences entre les principaux modes d’exercice après la réussite des EVC.',
    category: 'exercice-medical',
    readingMinutes: 12,
    readers: 3245,
    publishedAt: '2026-05-02',
    popularRank: 5,
  },
  {
    slug: 'evc-ratio-candidats-postes-choix-specialite-2026',
    title: 'EVC 2026 : pourquoi le nombre de postes ne doit pas (à lui seul) guider ton choix de spécialité',
    excerpt: 'EVC PADHUE 2026 : le nombre de postes par spécialité peut tromper. Ratio candidats/postes, effet de troupeau, données CNG — comment vraiment choisir.',
    category: 'epreuves-evc',
    readingMinutes: 8,
    readers: 0,
    publishedAt: '2026-06-24',
    featured: true,
  },
  {
    slug: 'impact-evc-acces-soins',
    title: 'EVC PAE : pourquoi les médecins diplômés hors UE sont essentiels à l\'accès aux soins en France',
    excerpt: 'Les Épreuves de Vérification des Connaissances (EVC) jouent un rôle clé dans l\'intégration des médecins PADHUE et contribuent au renforcement de l\'offre de soins sur l\'ensemble du territoire français.',
    category: 'epreuves-evc',
    readingMinutes: 3,
    readers: 1922,
    publishedAt: '2026-05-10',
  },
];

export function getArticleBySlug(slug: string): BlogArticleMeta | null {
  return BLOG_ARTICLES.find((a) => a.slug === slug) ?? null;
}

export function getRelatedArticles(slug: string, limit = 3): BlogArticleMeta[] {
  const current = getArticleBySlug(slug);
  if (!current) return BLOG_ARTICLES.slice(0, limit);
  return BLOG_ARTICLES
    .filter((a) => a.slug !== slug)
    .sort((a, b) => {
      // priorité : même catégorie d'abord, puis lecteurs DESC
      const aSame = a.category === current.category ? 0 : 1;
      const bSame = b.category === current.category ? 0 : 1;
      if (aSame !== bSame) return aSame - bSame;
      return (b.readers ?? 0) - (a.readers ?? 0);
    })
    .slice(0, limit);
}

export const BLOG_TOP_THEMES = [
  { label: 'Candidature EVC',         href: '/blog?cat=candidature-dossier',   icon: 'ClipboardCheck' },
  { label: 'Exercice médical en France', href: '/blog?cat=exercice-medical',  icon: 'Building2' },
  { label: 'Médecins étrangers',      href: '/blog?cat=medecins-etrangers',    icon: 'Globe2' },
  { label: 'Carrière & rémunération', href: '/blog?cat=carriere-remuneration', icon: 'Euro' },
  { label: 'Méthodologie EVC',        href: '/blog?cat=conseils-methodologie', icon: 'BookOpen' },
] as const;
