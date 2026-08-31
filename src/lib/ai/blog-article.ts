import 'server-only';
import { BLOG_CATEGORIES, type BlogCategory } from '@/lib/data/blog-articles';
import { clampImageWidth, type Block, type ImageLayout } from '@/lib/data/blog-content/types';

/**
 * Import d'article par IA (admin → /admin/blog/ia).
 *
 * L'administrateur dépose un texte brut, une image de bannière et, en option,
 * des images supplémentaires + des consignes SEO. Claude Sonnet re-pense
 * l'article : titraille, mise en page premium (encadrés colorés, tableaux,
 * galeries, citations), maillage interne et optimisation pour le référencement.
 *
 * La sortie est un `Block[]` STRICTEMENT identique à celui de l'éditeur manuel
 * (`blog-content/types.ts`), donc rendu par le même gabarit `ArticleRich` : un
 * article importé est indiscernable d'un article travaillé à la main, et reste
 * modifiable bloc par bloc dans l'éditeur.
 *
 * Tout ce qui sort du modèle est revalidé ici : blocs inconnus rejetés, HTML
 * réduit à une liste blanche de balises, images limitées aux fichiers déposés,
 * liens internes limités aux pages qui existent réellement.
 */

/** Pages vitrine vers lesquelles l'IA peut créer un lien interne. */
export const SITE_LINKS: { href: string; label: string; about: string }[] = [
  { href: '/', label: 'Major ECN', about: 'page d’accueil, présentation de la préparation aux EVC' },
  { href: '/methode', label: 'La méthode Major ECN', about: 'méthode de travail, pédagogie, organisation des révisions' },
  { href: '/plateforme', label: 'La plateforme', about: 'fonctionnement de la plateforme, QCM, DP, flashcards, fiches' },
  { href: '/tarifs', label: 'Tarifs', about: 'prix des formules, paiement, financement' },
  { href: '/formules/essentielle', label: 'Formule Essentielle', about: 'offre essentielle' },
  { href: '/formules/intensive', label: 'Formule Intensive', about: 'offre intensive' },
  { href: '/formules/programme-approfondi', label: 'Programme approfondi', about: 'offre approfondie, séances vidéo' },
  { href: '/specialites', label: 'Spécialités EVC', about: 'choix de spécialité, postes ouverts par spécialité' },
  { href: '/specialites/medecine-generale', label: 'EVC de médecine générale', about: 'spécialité médecine générale' },
  { href: '/espace-decouverte', label: 'Espace découverte gratuit', about: 'essai gratuit, QCM et flashcards offerts' },
  { href: '/profil-evc', label: 'Profil EVC', about: 'test de positionnement, évaluer son niveau' },
  { href: '/guide-methodologie-evc-2026', label: 'Guide de méthodologie EVC 2026', about: 'guide gratuit à télécharger' },
  { href: '/temoignages', label: 'Témoignages de lauréats', about: 'retours d’expérience de candidats admis' },
  { href: '/faq', label: 'FAQ', about: 'questions fréquentes sur les EVC et la préparation' },
  { href: '/contact', label: 'Contact', about: 'contacter l’équipe' },
  { href: '/inscription', label: 'Inscription', about: 's’inscrire à la préparation' },
  { href: '/blog', label: 'Blog Major ECN', about: 'tous les articles' },
];

export type AiImage = { url: string; name: string };

export type BlogAiSeo = { focusKeyword: string; keywords: string[]; notes: string };

export type BlogAiDraft = {
  title: string;
  slug: string;
  excerpt: string;
  category: BlogCategory;
  readingMinutes: number;
  blocks: Block[];
  seo: BlogAiSeo;
  warnings: string[];
};

/* ─────────────────────────── Prompt ─────────────────────────── */

const CATEGORY_LIST = (Object.keys(BLOG_CATEGORIES) as BlogCategory[])
  .map((k) => `- "${k}" → ${BLOG_CATEGORIES[k].label}`)
  .join('\n');

/** Consigne système : mise en page premium + SEO. */
export function buildBlogArticleSystemPrompt(): string {
  return `Tu es le directeur artistique et éditorial du blog de Major ECN, organisme français de préparation aux EVC (Épreuves de Vérification des Connaissances) destinées aux médecins à diplôme étranger (PADHUE). Tu reçois un texte brut et tu le transformes en article de blog premium, publiable tel quel.

Ta double mission :
1. LA MISE EN PAGE. L'article doit être beau, rythmé, coloré et parfaitement lisible sur mobile comme sur ordinateur. Jamais un mur de texte : on alterne titres, paragraphes courts, listes, encadrés colorés, tableaux, citations et images.
2. LE RÉFÉRENCEMENT (SEO). L'article doit être immédiatement indexable et positionné : titre porteur du mot-clé principal, méta-description vendeuse, titraille hiérarchisée qui reprend les requêtes réelles des candidats, maillage interne vers les pages du site.

────────────────────────────────────────
FORMAT DE SORTIE — JSON STRICT, RIEN D'AUTRE
────────────────────────────────────────
Réponds UNIQUEMENT par un objet JSON valide (pas de texte avant ni après) :

{
  "title": "Titre H1 (50 à 70 caractères, mot-clé principal placé au début)",
  "slug": "slug-url-en-minuscules-sans-accents",
  "excerpt": "Méta-description : 140 à 160 caractères, contient le mot-clé principal, donne envie de cliquer.",
  "category": "une des clés de catégorie listées plus bas",
  "readingMinutes": 9,
  "seo": {
    "focusKeyword": "mot-clé principal visé",
    "keywords": ["3 à 8 requêtes secondaires réellement tapées par les candidats"],
    "notes": "2 ou 3 phrases : intention de recherche visée et choix SEO faits."
  },
  "blocks": [ ... ]
}

CATÉGORIES AUTORISÉES (recopie la clé exacte) :
${CATEGORY_LIST}

────────────────────────────────────────
VOCABULAIRE DE BLOCS (aucun autre type n'existe)
────────────────────────────────────────
{"t":"h2","text":"Titre de section"}   → grande section, barre rouge à gauche, alimente le sommaire automatique
{"t":"h3","text":"Sous-titre"}   → sous-partie
{"t":"p","html":"Paragraphe. Balises autorisées : strong, em, a href, br."}
{"t":"ul","items":["Puce 1","Puce 2"]}   → puces rouges ; HTML inline autorisé dans chaque item
{"t":"ol","items":["Étape 1","Étape 2"]}   → étapes numérotées dans une pastille rouge
{"t":"table","headers":["Colonne A","Colonne B"],"rows":[["…","…"]]}   → texte brut uniquement, 2 à 4 colonnes
{"t":"callout","tone":"tip|key|warning|source","html":"…"}   → encadré coloré (voir ci-dessous)
{"t":"quote","author":"Nom","role":"Fonction","text":"Citation sans guillemets"}
{"t":"note","text":"Précision discrète, crédit photo, remarque de bas de page"}
{"t":"img","src":"URL EXACTE fournie","alt":"description précise","caption":"légende courte","layout":"full|left|right"}
{"t":"gallery","images":[{"src":"URL","alt":"…","caption":"…"}]}   → 2 ou 3 images côte à côte
{"t":"related","items":[{"label":"Titre de l'article","href":"/blog/slug"}]}   → bloc « À lire aussi »

Encadrés — chaque ton a un rendu et un rôle :
- "tip" bleu, « Conseil Major ECN » : un conseil actionnable.
- "key" vert, « En résumé » : la synthèse d'une section ou de l'article.
- "warning" ambre, « À retenir » : un piège, une date butoir, une erreur classique.
- "source" gris, « Source officielle » : renvoi au CNG, au Journal officiel, à un texte réglementaire.

────────────────────────────────────────
RÈGLES DE MISE EN PAGE (impératives)
────────────────────────────────────────
- 5 à 9 blocs "h2" : le sommaire automatique s'affiche dès 3 titres H2, il doit être riche et parlant.
- Un paragraphe = 2 à 4 phrases maximum. On coupe, on aère.
- Dès qu'une information est une énumération, une comparaison ou une chronologie → liste ou tableau, jamais un paragraphe fleuve.
- Au moins un tableau si le texte contient des dates, des chiffres, des montants ou une comparaison.
- 3 à 6 encadrés répartis dans tout l'article, de tons VARIÉS. Jamais deux encadrés consécutifs.
- Ouvre l'article par un paragraphe d'accroche qui répond immédiatement à la question du lecteur (les moteurs affichent ce passage), puis enchaîne sur le premier H2.
- Termine par un H2 de synthèse contenant un encadré "key", puis, si des articles internes existent, un bloc "related" de 2 à 4 liens.
- N'invente JAMAIS un fait, un chiffre, une date, un nom ou une citation absent du texte source. Tu réorganises, tu titres et tu rédiges ; tu n'inventes pas. Une citation ("quote") n'est possible que si le texte source en contient une, avec son auteur.
- Français soigné, accents corrects, apostrophes typographiques (’), vouvoiement du lecteur.

IMAGES
- L'image de bannière est gérée à part par le site : ne crée AUCUN bloc pour elle.
- Chaque image supplémentaire fournie doit être placée UNE seule fois, à l'endroit du texte où elle fait sens, avec un "alt" descriptif (référencement des images) et une légende.
- "src" doit être recopié CARACTÈRE POUR CARACTÈRE depuis la liste fournie. N'invente jamais d'URL d'image.
- Varie les dispositions : "full" pour une image forte, "left"/"right" pour habiller un passage de texte. Deux ou trois images de même nature → "gallery".

MAILLAGE INTERNE (décisif pour le SEO)
- Repère dans le texte source toute mention d'un sujet couvert par une page interne (liste fournie) et transforme-la en lien contextuel : un lien vers /tarifs sur l'ancre « nos formules ».
- 3 à 8 liens internes bien répartis, ancres descriptives (jamais « cliquez ici »), jamais deux fois le même lien dans le même paragraphe.
- Si le texte source contient déjà une URL du site major-ecn.fr, convertis-la en chemin relatif (/methode) et conserve-la.
- Les liens externes ne sont autorisés que vers des sources officielles déjà citées dans le texte source (CNG, Légifrance, ministère de la Santé). Aucun autre lien externe : tout autre lien sera supprimé.
- Le bloc "related" ne peut pointer que vers les slugs d'articles fournis.

SEO RÉDACTIONNEL
- Le mot-clé principal apparaît dans le title, dans l'excerpt, dans le premier paragraphe et dans au moins deux H2.
- Les H2 sont formulés comme les questions réellement tapées (« Quand s'inscrire aux EVC 2026 ? »), pas comme des titres abstraits.
- Ajoute, avant la synthèse finale, un H2 « Questions fréquentes » avec 3 à 5 H3 formulés en questions, chacun suivi d'un paragraphe de réponse courte et autonome (extraits enrichis / « Autres questions posées »).
- readingMinutes = nombre de mots ÷ 200, arrondi, entre 3 et 25.`;
}

/* ─────────────────── Révision d'un article existant ─────────────────── */

/**
 * Consigne système de la RETOUCHE : l'administrateur a relu l'article (souvent
 * issu d'un import IA) et dicte des corrections ; le modèle renvoie l'article
 * complet corrigé, dans le même vocabulaire de blocs — jamais une réécriture
 * intégrale non demandée.
 */
export function buildBlogRevisionSystemPrompt(): string {
  return `Tu es le secrétaire de rédaction du blog de Major ECN (préparation aux EVC pour médecins à diplôme étranger). Tu reçois un article de blog EXISTANT (au format JSON par blocs) et les remarques de l'administrateur qui l'a relu. Tu appliques ces remarques — corrections de fond, de forme ou de mise en page — et tu renvoies l'article complet corrigé.

RÈGLES IMPÉRATIVES
- Tu APPLIQUES les remarques, tu ne réécris pas l'article : tout bloc non concerné par une remarque est recopié À L'IDENTIQUE (même texte, même ordre), sauf faute de français manifeste.
- Tu n'inventes JAMAIS un fait, un chiffre, une date ou un nom. Si une remarque exige une information que tu n'as pas, dis-le dans "changes" au lieu d'inventer.
- Les images : tu ne peux utiliser QUE les URLs "src" déjà présentes dans l'article (tu peux les déplacer, changer leur légende, leur layout, ou les retirer si demandé). N'invente jamais d'URL.
- La clé "width" d'une image (largeur en % de la colonne, 20 à 100) a été réglée à la main par l'administrateur : RECOPIE-la telle quelle. Ne la modifie que si une remarque demande explicitement d'agrandir ou de réduire cette image, et ne l'ajoute jamais de toi-même sur une image qui n'en a pas.
- Les liens : uniquement les chemins internes du site, les slugs /blog/… fournis et les sources officielles déjà présentes. Tout autre lien sera supprimé.
- Vocabulaire de blocs INCHANGÉ (aucun autre type n'existe) :
  {"t":"h2","text":"…"} {"t":"h3","text":"…"} {"t":"p","html":"… (strong, em, a href, br)"}
  {"t":"ul","items":["…"]} {"t":"ol","items":["…"]} {"t":"table","headers":[…],"rows":[[…]]}
  {"t":"callout","tone":"tip|key|warning|source","html":"…"} {"t":"quote","author":"…","role":"…","text":"…"}
  {"t":"note","text":"…"} {"t":"img","src":"URL EXACTE","alt":"…","caption":"…","layout":"full|left|right","width":50}
  {"t":"gallery","images":[{"src":"URL","alt":"…","caption":"…"}]} {"t":"related","items":[{"label":"…","href":"/blog/slug"}]}
- Ne crée AUCUN bloc "hero" : la bannière est gérée par le site.
- Français soigné, accents corrects, apostrophes typographiques (’), vouvoiement.

FORMAT DE SORTIE — JSON STRICT, RIEN D'AUTRE :
{
  "title": "titre éventuellement corrigé (sinon recopié tel quel)",
  "excerpt": "chapô éventuellement corrigé (sinon recopié tel quel)",
  "readingMinutes": 9,
  "blocks": [ …article complet corrigé… ],
  "changes": "2 à 5 phrases en français : ce qui a été modifié, et ce qui n'a pas pu l'être (et pourquoi)."
}`;
}

/** Message utilisateur de la retouche : article actuel + remarques. */
export function buildBlogRevisionUserPrompt(input: {
  article: {
    title: string;
    excerpt: string;
    readingMinutes: number;
    blocks: Block[];
  };
  remarks: string;
  articles: { slug: string; title: string }[];
}): string {
  const internes = SITE_LINKS.map((l) => `- ${l.href} — ${l.label}`).join('\n');
  const blogInternes = input.articles.length
    ? input.articles.map((a) => `- /blog/${a.slug} — ${a.title}`).join('\n')
    : '(aucun autre article publié)';

  return `ARTICLE ACTUEL (JSON)
────────────────────────────────
${JSON.stringify(input.article, null, 1)}

LIENS INTERNES AUTORISÉS
────────────────────────────────
${internes}

ARTICLES DU BLOG PUBLIÉS
────────────────────────────────
${blogInternes}

REMARQUES DE L'ADMINISTRATEUR À APPLIQUER
────────────────────────────────
${input.remarks.trim()}

Renvoie maintenant l'objet JSON complet de l'article corrigé.`;
}

/** Message utilisateur : texte source, images déposées, maillage disponible, consignes. */
export function buildBlogArticleUserPrompt(input: {
  rawText: string;
  seoBrief?: string;
  extraImages: AiImage[];
  articles: { slug: string; title: string }[];
}): string {
  const images = input.extraImages.length
    ? input.extraImages.map((im, i) => `${i + 1}. fichier « ${im.name} » → src EXACT : ${im.url}`).join('\n')
    : '(aucune image supplémentaire — n’utilise ni bloc "img" ni bloc "gallery")';

  const internes = SITE_LINKS.map((l) => `- ${l.href} — ${l.label} (${l.about})`).join('\n');
  const blogInternes = input.articles.length
    ? input.articles.map((a) => `- /blog/${a.slug} — ${a.title}`).join('\n')
    : '(aucun article publié : n’utilise pas de bloc "related")';

  return `TEXTE SOURCE À METTRE EN PAGE
────────────────────────────────
${input.rawText.trim()}

IMAGES SUPPLÉMENTAIRES DISPONIBLES
────────────────────────────────
${images}

PAGES DU SITE POUR LE MAILLAGE INTERNE
────────────────────────────────
${internes}

ARTICLES DU BLOG DÉJÀ PUBLIÉS (bloc "related" et liens contextuels)
────────────────────────────────
${blogInternes}

CONSIGNES SEO DE L'ADMINISTRATEUR
────────────────────────────────
${input.seoBrief?.trim() || '(aucune consigne : choisis toi-même le mot-clé principal le plus pertinent au vu du texte source et de l’audience PADHUE / EVC)'}

Produis maintenant l'objet JSON complet.`;
}

/* ─────────────────────── Validation / nettoyage ─────────────────────── */

const ALLOWED_TAGS = new Set(['strong', 'b', 'em', 'i', 'a', 'br', 'code', 'sup']);

function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

/**
 * Réduit le HTML produit par l'IA à une liste blanche de balises et n'accepte
 * que des liens vers des destinations connues. Un lien refusé est dégradé en
 * texte simple : la phrase reste, seule l'ancre disparaît.
 */
export function sanitizeHtml(html: string, isHrefAllowed: (href: string) => boolean): string {
  if (typeof html !== 'string') return '';
  let out = html
    .replace(/<\s*(script|style|iframe|object|embed)[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');

  // Liens : l'ancre n'est conservée que si la cible est autorisée. Ouvertures et
  // fermetures sont appariées par une pile, pour ne jamais laisser un <a> ouvert
  // (qui transformerait la fin du paragraphe en lien).
  const open: boolean[] = [];
  out = out.replace(/<a\b([^>]*)>|<\/a\s*>/gi, (m, attrs?: string) => {
    if (m[1] === '/') return open.pop() ? '</a>' : '';
    const href = /href\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(attrs ?? '');
    const raw = (href?.[2] ?? href?.[3] ?? href?.[4] ?? '').trim();
    if (!raw || !isHrefAllowed(raw)) {
      open.push(false);
      return '';
    }
    open.push(true);
    return /^https?:\/\//i.test(raw)
      ? `<a href="${escapeAttr(raw)}" target="_blank" rel="noopener noreferrer">`
      : `<a href="${escapeAttr(raw)}">`;
  });
  // Ouverture jamais refermée par le modèle : on la referme nous-mêmes.
  out += '</a>'.repeat(open.filter(Boolean).length);

  // Toute autre balise hors liste blanche est supprimée (son texte est conservé).
  out = out.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g, (m, tag: string) => {
    const name = tag.toLowerCase();
    if (name === 'a') return m;
    return ALLOWED_TAGS.has(name) ? m : '';
  });
  return out.trim();
}

/** Retire toute balise : utilisé pour les champs affichés en texte brut. */
export function plainText(s: unknown): string {
  return typeof s === 'string' ? s.replace(/<[^>]*>/g, '').trim() : '';
}

export function slugifyArticle(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 90);
}

const LAYOUTS: ImageLayout[] = ['full', 'left', 'right'];
const TONES = ['warning', 'tip', 'key', 'source'] as const;

/** Hôtes externes tolérés dans les liens (sources officielles). */
const EXTERNAL_ALLOWLIST = [
  'cng.sante.fr', 'www.cng.sante.fr',
  'legifrance.gouv.fr', 'www.legifrance.gouv.fr',
  'sante.gouv.fr', 'solidarites-sante.gouv.fr',
  'service-public.fr', 'www.service-public.fr',
  'conseil-national.medecin.fr', 'www.conseil-national.medecin.fr',
  'has-sante.fr', 'www.has-sante.fr',
];

/**
 * Fabrique le filtre de liens : chemins internes connus (pages vitrine +
 * articles publiés) et sources officielles. Tout le reste est refusé.
 */
export function makeHrefFilter(publishedSlugs: string[]): (href: string) => boolean {
  const internal = new Set(SITE_LINKS.map((l) => l.href));
  const slugs = new Set(publishedSlugs);
  return (raw: string) => {
    const href = raw.trim();
    if (!href) return false;
    if (href.startsWith('/')) {
      const [path] = href.split(/[?#]/);
      const clean = path.length > 1 ? path.replace(/\/$/, '') : path;
      if (internal.has(clean)) return true;
      const m = /^\/blog\/([a-z0-9-]+)$/.exec(clean);
      return Boolean(m && slugs.has(m[1]));
    }
    if (/^https?:\/\//i.test(href)) {
      try {
        const url = new URL(href);
        return EXTERNAL_ALLOWLIST.includes(url.hostname.toLowerCase());
      } catch {
        return false;
      }
    }
    return false; // mailto:, javascript:, ancres nues…
  };
}

/**
 * Convertit la sortie brute du modèle en `Block[]` sûr.
 * `allowedImages` : URLs réellement téléversées pour cet article.
 */
export function normalizeBlocks(
  raw: unknown,
  opts: {
    allowedImages: Set<string>;
    isHrefAllowed: (href: string) => boolean;
    /** Import : une image déposée mais non placée est ajoutée en fin d'article.
     *  Retouche : NON (l'administrateur a pu demander sa suppression). */
    reAddForgottenImages?: boolean;
  },
): { blocks: Block[]; warnings: string[] } {
  const warnings: string[] = [];
  const usedImages = new Set<string>();
  const blocks: Block[] = [];
  if (!Array.isArray(raw)) return { blocks, warnings: ['La réponse de l’IA ne contient aucun bloc.'] };

  const html = (v: unknown) => sanitizeHtml(typeof v === 'string' ? v : '', opts.isHrefAllowed);
  const img = (v: unknown): { src: string; alt: string; caption?: string } | null => {
    const o = v as { src?: unknown; alt?: unknown; caption?: unknown };
    const src = typeof o?.src === 'string' ? o.src.trim() : '';
    if (!opts.allowedImages.has(src)) {
      if (src) warnings.push(`Image ignorée (URL inconnue) : ${src.slice(0, 80)}`);
      return null;
    }
    usedImages.add(src);
    const caption = plainText(o?.caption);
    return { src, alt: plainText(o?.alt) || 'Illustration de l’article', ...(caption ? { caption } : {}) };
  };

  for (const b of raw as Array<Record<string, unknown>>) {
    const t = typeof b?.t === 'string' ? b.t : '';
    switch (t) {
      case 'hero':
        break; // la bannière est posée par le serveur, jamais par l'IA
      case 'h2':
      case 'h3': {
        const text = plainText(b.text);
        if (text) blocks.push({ t, text } as Block);
        break;
      }
      case 'p': {
        const h = html(b.html ?? b.text);
        if (h) blocks.push({ t: 'p', html: h });
        break;
      }
      case 'ul':
      case 'ol': {
        const items = (Array.isArray(b.items) ? b.items : []).map((i) => html(i)).filter(Boolean);
        if (items.length) blocks.push({ t, items } as Block);
        break;
      }
      case 'table': {
        const headers = (Array.isArray(b.headers) ? b.headers : []).map(plainText).filter(Boolean);
        const rows = (Array.isArray(b.rows) ? b.rows : [])
          .map((r) => (Array.isArray(r) ? r.map(plainText) : []))
          .filter((r) => r.length > 0);
        if (headers.length >= 2 && rows.length) {
          blocks.push({ t: 'table', headers, rows: rows.map((r) => normalizeRow(r, headers.length)) });
        }
        break;
      }
      case 'note': {
        const text = plainText(b.text);
        if (text) blocks.push({ t: 'note', text });
        break;
      }
      case 'quote': {
        const text = plainText(b.text);
        const author = plainText(b.author);
        if (text && author) {
          const role = plainText(b.role);
          blocks.push({ t: 'quote', author, text, ...(role ? { role } : {}) });
        }
        break;
      }
      case 'callout': {
        const tone = TONES.includes(b.tone as (typeof TONES)[number]) ? (b.tone as (typeof TONES)[number]) : 'tip';
        const h = html(b.html ?? b.text);
        if (h) blocks.push({ t: 'callout', tone, html: h });
        break;
      }
      case 'img': {
        const im = img(b);
        if (im) {
          const layout = LAYOUTS.includes(b.layout as ImageLayout) ? (b.layout as ImageLayout) : 'full';
          // La largeur est réglée à la main dans l'éditeur : lors d'une retouche
          // IA, le modèle la recopie et on la conserve. Absente ou aberrante →
          // on ne fixe rien, la disposition impose sa largeur par défaut.
          const rawWidth = typeof b.width === 'number' ? b.width : Number(b.width);
          const width = Number.isFinite(rawWidth) && rawWidth > 0 ? clampImageWidth(rawWidth) : null;
          blocks.push({ t: 'img', ...im, layout, ...(width !== null ? { width } : {}) });
        }
        break;
      }
      case 'gallery': {
        const images = (Array.isArray(b.images) ? b.images : []).map(img).filter(Boolean) as {
          src: string; alt: string; caption?: string;
        }[];
        if (images.length >= 2) blocks.push({ t: 'gallery', images });
        else if (images.length === 1) blocks.push({ t: 'img', ...images[0], layout: 'full' });
        break;
      }
      case 'related': {
        const items = (Array.isArray(b.items) ? b.items : [])
          .map((i) => {
            const o = i as { label?: unknown; href?: unknown };
            const href = typeof o?.href === 'string' ? o.href.trim() : '';
            const label = plainText(o?.label);
            return label && href && opts.isHrefAllowed(href) ? { label, href } : null;
          })
          .filter(Boolean) as { label: string; href: string }[];
        if (items.length) blocks.push({ t: 'related', items });
        break;
      }
      default:
        if (t) warnings.push(`Bloc de type inconnu ignoré : « ${t} ».`);
    }
  }

  // Les images déposées mais oubliées par l'IA sont ajoutées en fin d'article
  // plutôt que perdues : l'administrateur les repositionne dans l'éditeur.
  const forgotten = (opts.reAddForgottenImages ?? true)
    ? [...opts.allowedImages].filter((u) => !usedImages.has(u))
    : [];
  for (const src of forgotten) {
    blocks.push({ t: 'img', src, alt: 'Illustration de l’article', layout: 'full' });
    warnings.push('Une image déposée n’a pas été placée par l’IA : elle a été ajoutée en fin d’article.');
  }

  return { blocks, warnings };
}

function normalizeRow(row: string[], width: number): string[] {
  const out = row.slice(0, width);
  while (out.length < width) out.push('');
  return out;
}

/** Vérifie et normalise l'enveloppe (titre, slug, extrait, catégorie…). */
export function normalizeDraftMeta(
  raw: Record<string, unknown>,
  fallbackTitle: string,
): Omit<BlogAiDraft, 'blocks' | 'warnings'> {
  const title = plainText(raw.title) || fallbackTitle;
  const excerpt = plainText(raw.excerpt).slice(0, 300);
  const cat = typeof raw.category === 'string' ? raw.category : '';
  const category = (cat in BLOG_CATEGORIES ? cat : 'conseils-methodologie') as BlogCategory;
  const minutes = Number(raw.readingMinutes);
  const seoRaw = (raw.seo ?? {}) as Record<string, unknown>;
  return {
    title,
    slug: slugifyArticle(plainText(raw.slug) || title),
    excerpt,
    category,
    readingMinutes: Number.isFinite(minutes) ? Math.min(25, Math.max(3, Math.round(minutes))) : 6,
    seo: {
      focusKeyword: plainText(seoRaw.focusKeyword),
      keywords: (Array.isArray(seoRaw.keywords) ? seoRaw.keywords : []).map(plainText).filter(Boolean).slice(0, 12),
      notes: plainText(seoRaw.notes),
    },
  };
}
