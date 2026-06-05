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
    slug: 'comment-se-presenter-aux-evc',
    title: 'Comment se présenter aux Épreuves de Vérification des Connaissances (EVC) ?',
    excerpt: 'Toutes les étapes essentielles pour déposer une candidature conforme.',
    category: 'candidature-dossier',
    readingMinutes: 7,
    readers: 5840,
    publishedAt: '2026-04-12',
    featured: true,
    popularRank: 1,
  },
  {
    slug: 'evc-pae-liste-documents-fournir',
    title: 'EVC PAE : liste complète des documents à fournir et les règles à connaître pour une candidature réussie',
    excerpt: 'Checklist pratique pour préparer votre dossier administratif.',
    category: 'candidature-dossier',
    readingMinutes: 6,
    readers: 4220,
    publishedAt: '2026-03-28',
    popularRank: 2,
  },
  {
    slug: 'decryptage-defis-evc',
    title: 'Décryptage des principaux défis des Épreuves de Vérification des Connaissances (EVC)',
    excerpt: 'Les difficultés les plus fréquentes rencontrées par les candidats et les solutions pour les surmonter.',
    category: 'epreuves-evc',
    readingMinutes: 6,
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
    slug: 'impact-evc-acces-soins',
    title: 'L’impact des Épreuves de Vérification des Connaissances (EVC) sur l’accès aux soins et l’intégration des professionnels de santé',
    excerpt: 'Un regard à travers le prisme de Major-ECN sur la manière dont les EVC renforcent le système de santé français.',
    category: 'epreuves-evc',
    readingMinutes: 8,
    readers: 1920,
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
