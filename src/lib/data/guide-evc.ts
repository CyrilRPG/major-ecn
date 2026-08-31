/**
 * Page hub « Guide EVC » (/guide-evc) — structure éditoriale et répartition
 * des articles du blog en sections thématiques.
 *
 * Règle de maillage : TOUT article publié — statique (blog-articles.ts) ou créé
 * depuis /admin/blog (base de données, import IA compris) — doit être atteignable
 * depuis le hub. La répartition est donc automatique :
 *   1. dérogation explicite par slug (SECTION_BY_SLUG) ;
 *   2. à défaut, section par défaut de la catégorie (SECTION_BY_CATEGORY).
 * Un nouvel article publié apparaît ainsi dans le hub sans intervention — c'est
 * la « procédure de mise à jour » de la page (aucun article orphelin possible).
 * Le garde-fou est vérifié par tests/guide-evc.test.ts.
 */

// Ce module reste PUR (aucun accès base de données) : il est chargé par les
// tests et par des composants clients. La fusion avec les articles créés en
// administration vit dans guide-evc-sections.ts (serveur uniquement).
import type { BlogArticleMeta, BlogCategory } from './blog-articles';

export const GUIDE_EVC_PATH = '/guide-evc';
export const GUIDE_EVC_LABEL = 'Guide EVC';

export type GuideSectionId =
  | 'comprendre'
  | 's-inscrire'
  | 'se-preparer'
  | 'par-specialite'
  | 'jour-de-l-epreuve'
  | 'apres-les-evc'
  | 'carriere';

export type GuideSectionDef = {
  /** Ancre (#id) — sert aussi de cible au sommaire. */
  id: GuideSectionId;
  /** Titre H2 de la section. */
  title: string;
  /** Libellé court dans le sommaire ancré. */
  navLabel: string;
  /** Phrase courte affichée sous le libellé dans le sommaire. */
  navHint: string;
  /** Texte rédigé d'introduction : la section n'est jamais une simple liste de liens. */
  intro: string[];
  /** Liens vers des pages du site (hors blog) complétant la section. */
  pageLinks?: { label: string; href: string; description: string }[];
};

/** Les sept sections du guide, dans l'ordre de lecture (parcours du candidat). */
export const GUIDE_SECTIONS: GuideSectionDef[] = [
  {
    id: 'comprendre',
    title: 'Comprendre les EVC',
    navLabel: 'Comprendre les EVC',
    navHint: 'Ce que sont les épreuves, à qui elles s’adressent',
    intro: [
      "Les Épreuves de Vérification des Connaissances (EVC) sont le passage obligé de la procédure d'autorisation d'exercice (PAE) pour les médecins titulaires d'un diplôme obtenu hors Union européenne. Elles ne mesurent pas votre expérience clinique : elles vérifient que vos connaissances correspondent au référentiel français, spécialité par spécialité.",
      "Deux voies coexistent, avec des épreuves et des publics différents — la voie interne, réservée aux praticiens déjà en poste et évaluée par questions à choix multiples, et la voie externe, ouverte plus largement et évaluée par une épreuve rédactionnelle. Les confondre, ou confondre les EVC avec les EDN destinées aux étudiants français, conduit à préparer le mauvais concours.",
      "Les articles ci-dessous posent les bases : ce que sont réellement ces épreuves, à qui elles s'adressent, ce qu'elles évaluent, et pourquoi elles pèsent autant sur l'accès aux soins en France.",
    ],
  },
  {
    id: 's-inscrire',
    title: "S'inscrire aux EVC",
    navLabel: "S'inscrire",
    navHint: 'Calendrier CNG, éligibilité, pièces du dossier',
    intro: [
      "L'inscription se fait auprès du Centre national de gestion (CNG), dans une fenêtre de dépôt courte et sans tolérance : un dossier incomplet à la date de clôture est un dossier écarté, quelle que soit la qualité du candidat.",
      "Trois points concentrent l'essentiel des refus : l'éligibilité (liste A ou liste B, nombre de tentatives déjà consommées), les pièces justificatives — diplômes, traductions, attestations d'exercice, niveau de langue — et le choix de la voie et de la spécialité, qui vous engage pour toute la session.",
      "Ces articles détaillent le calendrier, la procédure pas à pas et la liste complète des documents à réunir, avec les règles qui décident de la recevabilité de votre candidature.",
    ],
  },
  {
    id: 'se-preparer',
    title: 'Se préparer aux épreuves',
    navLabel: 'Se préparer',
    navHint: 'Méthode, QCM, QROC, organisation des révisions',
    intro: [
      "C'est ici que se joue le résultat. La difficulté des EVC n'est pas le niveau des questions prises une à une, mais le volume du programme, la logique de notation propre à chaque voie et le temps disponible quand on prépare le concours tout en travaillant.",
      "Une préparation efficace repose sur quatre appuis : un rétroplanning tenable jusqu'au jour de l'épreuve, un entraînement régulier sur des QCM et des QROC calibrés au niveau réel du concours, la maîtrise des attendus de la correction — mots-clés, structure de réponse, urgences vitales — et l'analyse des erreurs qui coûtent le plus de points.",
      "Vous trouverez dans cette section la méthodologie de la voie interne et de la voie externe, l'organisation des révisions, la gestion du stress sur la durée et les retours d'expérience de candidats lauréats.",
    ],
    pageLinks: [
      {
        label: 'Espace découverte gratuit',
        href: '/espace-decouverte',
        description: 'QCM, dossiers cliniques et flashcards calibrés au niveau réel des EVC, sans engagement.',
      },
      {
        label: 'Guide méthodologique EVC 2026',
        href: '/guide-methodologie-evc-2026',
        description: 'La méthode complète pour gagner des points en voie interne comme en voie externe, à télécharger.',
      },
    ],
  },
  {
    id: 'par-specialite',
    title: 'Choisir et préparer sa spécialité',
    navLabel: 'Par spécialité',
    navHint: 'Choisir sa spécialité et réviser son programme',
    intro: [
      "Le choix de la spécialité est la décision la plus structurante de votre candidature : il détermine le programme à réviser, le format des épreuves, la concurrence que vous affrontez et le poste que vous occuperez ensuite.",
      "Le nombre de postes ouverts est un mauvais critère pris isolément : c'est le rapport entre les candidats inscrits et les postes offerts qui décide, et une spécialité réputée « ouverte » attire mécaniquement plus de candidats. À cela s'ajoutent votre parcours réel, la spécialité dans laquelle vous exercez déjà et les débouchés visés.",
      "Les articles de cette section comparent les spécialités les plus demandées par les médecins PADHUE et donnent une méthode de décision plutôt qu'un classement tout fait.",
    ],
    pageLinks: [
      {
        label: 'Toutes les spécialités préparées par Major ECN',
        href: '/specialites',
        description: 'Le détail des programmes et des supports disponibles pour chaque spécialité du concours.',
      },
    ],
  },
  {
    id: 'jour-de-l-epreuve',
    title: "Le jour de l'épreuve",
    navLabel: "Le jour de l'épreuve",
    navHint: 'Règlement, déroulement, réflexes qui sauvent des points',
    intro: [
      "Le jour du concours, la connaissance n'est plus la variable d'ajustement : la gestion du temps, la lecture des énoncés et la présentation de la copie le sont. Des candidats parfaitement préparés perdent des points sur des mécanismes purement techniques — consigne survolée, question laissée blanche, réponse juste mais illisible pour le correcteur.",
      "Les épreuves se déroulent dans des centres désignés par le CNG, sur une durée fixe et sans matériel personnel. Anticiper la logistique — convocation, pièce d'identité, trajet, horaires — libère l'attention pour ce qui compte réellement pendant les heures d'épreuve.",
      "Cette section rassemble ce qui se joue pendant l'épreuve elle-même, et les réflexes qui protègent votre note.",
    ],
  },
  {
    id: 'apres-les-evc',
    title: 'Après les EVC : affectation et parcours de consolidation',
    navLabel: 'Après les EVC',
    navHint: 'Affectation, parcours de consolidation, structures',
    intro: [
      "Réussir les épreuves n'ouvre pas immédiatement le plein exercice : les lauréats suivent un parcours de consolidation des compétences dans une structure d'accueil, avant l'autorisation d'exercice définitive et l'inscription à l'Ordre des médecins.",
      "Le type de structure — centre hospitalier universitaire, hôpital général, établissement privé — change la nature de vos fonctions, votre encadrement et la suite de votre carrière. Ce choix se prépare avant les résultats, pas après.",
      "Les articles ci-dessous décrivent ce qui attend un lauréat une fois le concours passé.",
    ],
  },
  {
    id: 'carriere',
    title: 'Carrière et rémunération en France',
    navLabel: 'Carrière et rémunération',
    navHint: 'Statuts, grilles de salaire, modes d’exercice',
    intro: [
      "La rémunération d'un médecin à diplôme étranger dépend de son statut : praticien associé pendant le parcours de consolidation, puis praticien hospitalier, praticien contractuel ou exercice libéral une fois l'autorisation d'exercice obtenue. Les écarts entre ces statuts sont considérables.",
      "Connaître les grilles, les compléments liés aux gardes et les perspectives d'évolution permet d'aborder une négociation de contrat sans se sous-estimer, et de mesurer ce que représente réellement la réussite du concours.",
      "Cette section traite des statuts, des salaires et des modes d'exercice ouverts après les EVC.",
    ],
  },
];

/** Section par défaut d'un article, déduite de sa catégorie de blog. */
export const SECTION_BY_CATEGORY: Record<BlogCategory, GuideSectionId> = {
  'epreuves-evc': 'comprendre',
  'candidature-dossier': 's-inscrire',
  'conseils-methodologie': 'se-preparer',
  'specialites': 'par-specialite',
  'exercice-medical': 'apres-les-evc',
  'carriere-remuneration': 'carriere',
  'medecins-etrangers': 'comprendre',
};

/**
 * Dérogations : articles dont la catégorie de blog ne correspond pas à l'étape
 * du parcours qu'ils traitent réellement (un article « Épreuves EVC » sur la
 * logique des QCM relève de la préparation, pas de la découverte du concours).
 * Les slugs peuvent désigner un article statique ou un article créé en base.
 */
export const SECTION_BY_SLUG: Record<string, GuideSectionId> = {
  // Articles statiques
  'voie-interne-evc-logique-qcm': 'se-preparer',
  'comment-rediger-qroc-evc': 'se-preparer',
  '7-erreurs-points-evc': 'jour-de-l-epreuve',
  'evc-ratio-candidats-postes-choix-specialite-2026': 'par-specialite',
  // Articles publiés depuis l'administration
  'calendrier-evc-2026-dates-epreuves-specialites': 's-inscrire',
  'jour-j-evc-reglement-epreuve-rungis': 'jour-de-l-epreuve',
  'echec-evc-tentatives-recours-statut': 'apres-les-evc',
  'dernieres-semaines-avant-les-evc': 'se-preparer',
  'reviser-evc-psychiatrie-10-semaines': 'se-preparer',
};

/** Section d'accueil des articles dont la catégorie serait inconnue (article DB mal typé). */
const FALLBACK_SECTION: GuideSectionId = 'comprendre';

/**
 * Spécialités du concours reconnues dans les slugs. Sert à rattacher
 * automatiquement les monographies « EVC <spécialité> <année> » à la section
 * « Par spécialité » : elles sont publiées en catégorie « Épreuves EVC », qui
 * les enverrait sinon dans la section « Comprendre les EVC ».
 */
const SPECIALTY_KEYWORDS = [
  'anesthesie', 'reanimation', 'cardiologie', 'cardiovasculaire', 'chirurgie',
  'dermatologie', 'endocrinologie', 'gastro', 'hepato', 'geriatrie', 'gynecologie',
  'hematologie', 'infectiologie', 'medecine-generale', 'medecine-interne',
  'medecine-urgence', 'mipic', 'nephrologie', 'neurologie', 'odontologie',
  'oncologie', 'ophtalmologie', 'orl', 'orthopedique', 'orthopedie', 'pediatrie',
  'pneumologie', 'psychiatrie', 'radiologie', 'rhumatologie', 'sante-publique',
  'urologie',
];

/** Monographie de spécialité : slug « evc-<spécialité>-<année>… ». */
export function isSpecialtyArticleSlug(slug: string): boolean {
  return (
    /^evc-/.test(slug) &&
    /-20\d\d(-|$)/.test(slug) &&
    SPECIALTY_KEYWORDS.some((k) => slug.includes(k))
  );
}

export function sectionIdForArticle(article: BlogArticleMeta): GuideSectionId {
  if (SECTION_BY_SLUG[article.slug]) return SECTION_BY_SLUG[article.slug];
  if (isSpecialtyArticleSlug(article.slug)) return 'par-specialite';
  return SECTION_BY_CATEGORY[article.category] ?? FALLBACK_SECTION;
}

export type GuideSection = GuideSectionDef & { articles: BlogArticleMeta[] };

/** Répartition pure (testable) d'une liste d'articles dans les sections du guide. */
export function buildGuideSections(articles: BlogArticleMeta[]): GuideSection[] {
  const byId = new Map<GuideSectionId, BlogArticleMeta[]>(
    GUIDE_SECTIONS.map((s) => [s.id, [] as BlogArticleMeta[]]),
  );
  for (const article of articles) {
    byId.get(sectionIdForArticle(article))!.push(article);
  }
  return GUIDE_SECTIONS.map((s) => ({
    ...s,
    articles: (byId.get(s.id) ?? []).sort((a, b) =>
      (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''),
    ),
  }));
}

/** Questions fréquentes de la page hub — affichées ET publiées en JSON-LD (FAQPage). */
export const GUIDE_EVC_FAQ: { q: string; a: string }[] = [
  {
    q: 'Que sont les EVC et à qui s’adressent-elles ?',
    a: "Les Épreuves de Vérification des Connaissances (EVC) sont le concours d'entrée de la procédure d'autorisation d'exercice (PAE) en France. Elles s'adressent aux médecins, chirurgiens-dentistes, pharmaciens et sages-femmes titulaires d'un diplôme obtenu hors Union européenne qui souhaitent exercer en France. Elles vérifient que le candidat maîtrise le référentiel français de sa spécialité.",
  },
  {
    q: 'Quelle est la différence entre la voie interne et la voie externe ?',
    a: "La voie interne s'adresse aux praticiens justifiant d'une durée d'exercice en France et repose sur des questions à choix multiples. La voie externe est ouverte plus largement et repose sur une épreuve rédactionnelle de type dossiers cliniques et questions à réponse ouverte courte. Le programme, la logique de notation et la sélectivité diffèrent : la préparation ne peut pas être la même.",
  },
  {
    q: 'Faut-il confondre les EVC et les EDN ?',
    a: "Non. Les EDN (Épreuves Dématérialisées Nationales) concernent les étudiants en médecine formés en France en fin de deuxième cycle. Les EVC concernent les médecins déjà diplômés hors Union européenne. Les deux concours n'ont ni le même public, ni le même format, ni les mêmes attendus : préparer l'un en pensant à l'autre est une erreur coûteuse.",
  },
  {
    q: 'Comment s’inscrire aux EVC et quels documents fournir ?',
    a: "L'inscription se fait en ligne auprès du Centre national de gestion (CNG) pendant une fenêtre de dépôt annuelle. Le dossier comprend notamment les diplômes et leurs traductions, les justificatifs d'exercice, une pièce d'identité et les attestations exigées selon la liste (A ou B) dont vous relevez. Un dossier incomplet à la clôture est irrecevable : la liste complète des pièces est détaillée dans la section « S'inscrire ».",
  },
  {
    q: 'Combien de fois peut-on se présenter aux EVC ?',
    a: "Le nombre de présentations est limité par la réglementation et se décompte sur l'ensemble de votre parcours, toutes spécialités confondues. C'est un paramètre à intégrer avant de choisir votre spécialité et votre voie : une tentative consommée sur un choix mal calibré ne se rattrape pas.",
  },
  {
    q: 'Combien de temps faut-il pour préparer les EVC ?',
    a: "La plupart des candidats préparent le concours en travaillant à temps plein, sur six à douze mois. Ce qui distingue les préparations qui aboutissent n'est pas le nombre d'heures cumulées mais leur régularité, la place donnée à l'entraînement sur des questions du niveau du concours, et l'analyse systématique des erreurs plutôt que la relecture passive du programme.",
  },
  {
    q: 'Que se passe-t-il après la réussite aux EVC ?',
    a: "Les lauréats choisissent un poste puis accomplissent un parcours de consolidation des compétences dans une structure d'accueil, sous statut de praticien associé. À l'issue de ce parcours et après avis favorable, l'autorisation d'exercice est délivrée et permet l'inscription à l'Ordre des médecins, donc le plein exercice.",
  },
  {
    q: 'Comment Major ECN prépare-t-il aux EVC ?',
    a: "Major ECN prépare les médecins à diplôme étranger depuis 2011 et a accompagné plus de 9 000 candidats. La préparation couvre toutes les spécialités du concours : cours conformes aux référentiels, QCM et QROC corrigés, dossiers cliniques, révisions transversales, épreuves blanches et suivi pédagogique assuré par des praticiens hospitaliers.",
  },
];
