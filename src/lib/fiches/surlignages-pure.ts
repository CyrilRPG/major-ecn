/**
 * Surlignages des fiches de cours par les élèves — logique PURE (aucune
 * dépendance DOM, serveur ou navigateur), partagée par la route API, le
 * lecteur PDF et les tests.
 *
 * Principe d'ancrage. Le PDF d'une fiche est RÉGÉNÉRÉ quand un enseignant la
 * modifie : des coordonnées seules dessineraient alors le surlignage sur un
 * autre passage. Chaque surlignage mémorise donc :
 *  - la CITATION exacte et quelques caractères de contexte avant/après ;
 *  - la page et la position (décalage dans le texte de la page), simple indice ;
 *  - les rectangles normalisés (0–1 de la page) au moment de la création ;
 *  - l'EMPREINTE du texte de la page à ce moment-là.
 *
 * À l'ouverture : si la page a exactement le même texte (même empreinte) et la
 * citation est au même endroit, les rectangles mémorisés sont redessinés tels
 * quels — rendu strictement identique. Sinon la citation est recherchée (sa
 * page d'abord, puis les autres), départagée par le contexte ; les rectangles
 * sont alors recalculés sur la couche texte. Introuvable : le surlignage passe
 * dans la liste des « orphelins », il n'est jamais dessiné au hasard ni perdu.
 *
 * Le texte d'une page est construit à partir des éléments `getTextContent()`
 * de pdf.js, dans l'ordre exact où pdf.js crée les <span> de la couche texte
 * (un span par élément de texte non vide) : un décalage dans ce texte se
 * convertit donc en (span, caractère) et inversement.
 */

// ─── Couleurs ────────────────────────────────────────────────────────────────

export const COULEURS_SURLIGNAGE = ['jaune', 'vert', 'bleu', 'rose'] as const;
export type CouleurSurlignage = (typeof COULEURS_SURLIGNAGE)[number];
export const COULEUR_PAR_DEFAUT: CouleurSurlignage = 'jaune';

/** Teintes posées en `mix-blend-mode: multiply` : le blanc du papier prend la
 *  couleur, le texte noir reste noir — la mise en forme n'est jamais altérée. */
export const TEINTES_SURLIGNAGE: Record<CouleurSurlignage, string> = {
  jaune: '#ffe866',
  vert: '#b4f0c0',
  bleu: '#bddcff',
  rose: '#ffc6e2',
};

export const LIBELLES_COULEUR: Record<CouleurSurlignage, string> = {
  jaune: 'Jaune',
  vert: 'Vert',
  bleu: 'Bleu',
  rose: 'Rose',
};

export function estCouleur(v: unknown): v is CouleurSurlignage {
  return typeof v === 'string' && (COULEURS_SURLIGNAGE as readonly string[]).includes(v);
}

// ─── Modèle ──────────────────────────────────────────────────────────────────

/** Rectangle normalisé : fractions de la largeur/hauteur de la page (0–1). */
export type RectNorm = { x: number; y: number; w: number; h: number };

export type Surlignage = {
  id: string;
  couleur: CouleurSurlignage;
  /** Page (1 = première) où le passage a été trouvé en dernier. */
  page: number;
  /** Décalage du début de la citation dans le texte de la page (indice). */
  debut: number;
  /** Passage surligné, tel qu'extrait du texte de la page. */
  citation: string;
  /** Contexte immédiat, pour départager plusieurs occurrences. */
  avant: string;
  apres: string;
  /** Rectangles au dernier ancrage — repli si la couche texte manque. */
  rects: RectNorm[];
  /** Empreinte du texte de la page au dernier ancrage. */
  empreinte: string;
  creeLe: string;
};

export type FichierSurlignages = {
  version: 1;
  surlignages: Surlignage[];
  majLe: string | null;
};

// Plafonds : un élève très assidu surligne quelques centaines de passages sur
// une fiche de 40 pages ; ces bornes laissent une marge large tout en gardant
// le fichier très loin du plafond Vercel (4,5 Mo par requête).
export const MAX_SURLIGNAGES = 1500;
export const MAX_CITATION = 2000;
export const LONGUEUR_CONTEXTE = 40;
export const MAX_RECTS = 80;
export const MAX_OCTETS_FICHIER = 1_000_000;
export const MAX_PAGES = 2000;

const ID_RE = /^[A-Za-z0-9_-]{1,64}$/;

// ─── Validation (route API) ──────────────────────────────────────────────────

function arrondi(n: number): number {
  return Math.round(n * 100000) / 100000;
}

function borne01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

function validerRect(v: unknown): RectNorm | null {
  if (!v || typeof v !== 'object') return null;
  const r = v as Record<string, unknown>;
  const nums = [r.x, r.y, r.w, r.h];
  if (!nums.every((n) => typeof n === 'number' && Number.isFinite(n))) return null;
  const x = borne01(r.x as number);
  const y = borne01(r.y as number);
  const w = Math.min(1 - x, Math.max(0, r.w as number));
  const h = Math.min(1 - y, Math.max(0, r.h as number));
  if (w <= 0 || h <= 0) return null;
  return { x: arrondi(x), y: arrondi(y), w: arrondi(w), h: arrondi(h) };
}

function texteBorne(v: unknown, max: number): string | null {
  if (typeof v !== 'string') return null;
  return v.length > max ? v.slice(0, max) : v;
}

/** Valide un surlignage reçu du client ; `null` s'il est inexploitable. */
export function validerSurlignage(v: unknown): Surlignage | null {
  if (!v || typeof v !== 'object') return null;
  const s = v as Record<string, unknown>;
  if (typeof s.id !== 'string' || !ID_RE.test(s.id)) return null;
  if (!estCouleur(s.couleur)) return null;
  if (typeof s.page !== 'number' || !Number.isInteger(s.page) || s.page < 1 || s.page > MAX_PAGES) return null;
  const debut = typeof s.debut === 'number' && Number.isInteger(s.debut) && s.debut >= 0 ? s.debut : 0;
  if (typeof s.citation !== 'string') return null;
  const citation = s.citation;
  if (!citation.trim() || citation.length > MAX_CITATION) return null;
  const avant = texteBorne(s.avant ?? '', LONGUEUR_CONTEXTE * 2) ?? '';
  const apres = texteBorne(s.apres ?? '', LONGUEUR_CONTEXTE * 2) ?? '';
  const rectsBruts = Array.isArray(s.rects) ? s.rects.slice(0, MAX_RECTS) : [];
  const rects = rectsBruts.map(validerRect).filter((r): r is RectNorm => r !== null);
  const empreinte = typeof s.empreinte === 'string' && /^[0-9a-f]{1,16}$/.test(s.empreinte) ? s.empreinte : '';
  const creeLe =
    typeof s.creeLe === 'string' && s.creeLe.length <= 40 && !Number.isNaN(Date.parse(s.creeLe))
      ? s.creeLe
      : new Date(0).toISOString();
  return { id: s.id, couleur: s.couleur, page: s.page, debut, citation, avant, apres, rects, empreinte, creeLe };
}

/**
 * Valide la liste complète envoyée par le client. Les entrées invalides sont
 * écartées une à une (une seule donnée abîmée ne doit pas coûter tous les
 * surlignages de l'élève) ; les identifiants en double ne gardent que la
 * première occurrence. Erreur seulement si la forme globale est fausse.
 */
export function validerListe(
  v: unknown,
): { ok: true; surlignages: Surlignage[]; ecartes: number } | { ok: false; erreur: string } {
  if (!v || typeof v !== 'object' || !Array.isArray((v as { surlignages?: unknown }).surlignages)) {
    return { ok: false, erreur: 'Format attendu : { surlignages: [...] }' };
  }
  const brut = (v as { surlignages: unknown[] }).surlignages;
  if (brut.length > MAX_SURLIGNAGES) {
    return { ok: false, erreur: `Trop de surlignages sur cette fiche (maximum ${MAX_SURLIGNAGES}).` };
  }
  const vus = new Set<string>();
  const surlignages: Surlignage[] = [];
  for (const item of brut) {
    const s = validerSurlignage(item);
    if (!s || vus.has(s.id)) continue;
    vus.add(s.id);
    surlignages.push(s);
  }
  return { ok: true, surlignages, ecartes: brut.length - surlignages.length };
}

/** Relit un fichier stocké (tolérant : un fichier illisible = aucun surlignage). */
export function lireFichier(v: unknown): FichierSurlignages {
  const res = validerListe(v);
  const majLe = v && typeof v === 'object' && typeof (v as { majLe?: unknown }).majLe === 'string'
    ? (v as { majLe: string }).majLe
    : null;
  return { version: 1, surlignages: res.ok ? res.surlignages : [], majLe };
}

// ─── Versions stockées ───────────────────────────────────────────────────────

const VERSION_RE = /^(\d{15})-[a-z0-9]{1,12}\.json$/;

/**
 * Nom d'une version stockée : horodatage sur 15 chiffres (ordre alphabétique =
 * ordre chronologique) + suffixe aléatoire (deux écritures dans la même
 * milliseconde ne se marchent pas dessus). Cf. surlignages-stockage.ts.
 */
export function nomVersionSurlignages(maintenantMs: number, alea: number): string {
  const suffixe = Math.floor(Math.abs(alea) * 36 ** 6).toString(36).padStart(6, '0').slice(0, 6);
  return `${Math.max(0, Math.floor(maintenantMs)).toString().padStart(15, '0')}-${suffixe}.json`;
}

/** Noms de versions valides, de la plus récente à la plus ancienne. */
export function trierVersionsSurlignages(noms: readonly string[]): string[] {
  return noms.filter((n) => VERSION_RE.test(n)).sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));
}

// ─── Texte d'une page ────────────────────────────────────────────────────────

/** Élément de `getTextContent()` (seuls les champs utiles). */
export type ElementTexte = { str?: string; hasEOL?: boolean; transform?: number[] };

/** Correspondance entre un <span> de la couche texte et le texte de la page. */
export type Segment = {
  /** Rang du <span> parmi les spans de texte de la couche (ordre du DOM). */
  span: number;
  debut: number;
  fin: number;
  /** Texte écarté (filigrane incliné) : aucun caractère dans le texte. */
  ignore: boolean;
};

export type TextePage = { texte: string; segments: Segment[]; empreinte: string };

/**
 * Texte incliné : le filigrane au nom de l'élève (28°) est du vrai texte PDF.
 * On l'écarte du texte de la page — il ne doit ni se sélectionner, ni entrer
 * dans une citation, ni changer l'empreinte d'un élève à l'autre.
 */
export function estTexteIncline(item: ElementTexte): boolean {
  const t = item.transform;
  if (!t || t.length < 4) return false;
  return Math.abs(t[1]) > 1e-3 || Math.abs(t[2]) > 1e-3;
}

/**
 * Construit le texte d'une page tel que les décalages des surlignages s'y
 * réfèrent. pdf.js crée un <span> pour chaque élément de texte NON VIDE (et un
 * <br> après chaque fin de ligne) : les segments suivent exactement ce rang.
 */
export function construireTextePage(items: readonly unknown[]): TextePage {
  let texte = '';
  const segments: Segment[] = [];
  let span = 0;
  for (const brut of items) {
    if (!brut || typeof brut !== 'object') continue;
    const item = brut as ElementTexte;
    if (typeof item.str !== 'string') continue; // contenu marqué : pas de texte
    const ignore = estTexteIncline(item);
    if (item.str !== '') {
      const debut = texte.length;
      if (!ignore) texte += item.str;
      segments.push({ span, debut, fin: texte.length, ignore });
      span += 1;
    }
    if (item.hasEOL && !ignore) texte += '\n';
  }
  return { texte, segments, empreinte: empreinteTexte(texte) };
}

/** FNV-1a 32 bits sur le texte aux espaces normalisés, en hexadécimal. */
export function empreinteTexte(texte: string): string {
  const norm = normaliser(texte).norm;
  let h = 0x811c9dc5;
  for (let i = 0; i < norm.length; i++) {
    h ^= norm.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

// ─── Normalisation ───────────────────────────────────────────────────────────

/**
 * Remplace toute suite d'espaces (dont les retours à la ligne) par UNE espace
 * et supprime les espaces de tête/fin : après une réédition, le même passage
 * peut être coupé à un autre endroit de la ligne. `carte[i]` donne l'indice
 * dans le texte d'origine du i-ème caractère normalisé.
 */
export function normaliser(texte: string): { norm: string; carte: number[] } {
  let norm = '';
  const carte: number[] = [];
  let espaceEnAttente = -1;
  for (let i = 0; i < texte.length; i++) {
    const c = texte[i];
    if (/\s/.test(c)) {
      if (espaceEnAttente < 0) espaceEnAttente = i;
      continue;
    }
    if (espaceEnAttente >= 0 && norm.length > 0) {
      norm += ' ';
      carte.push(espaceEnAttente);
    }
    espaceEnAttente = -1;
    norm += c;
    carte.push(i);
  }
  return { norm, carte };
}

function prefixeCommun(a: string, b: string): number {
  const n = Math.min(a.length, b.length);
  let i = 0;
  while (i < n && a[i] === b[i]) i++;
  return i;
}

function suffixeCommun(a: string, b: string): number {
  const n = Math.min(a.length, b.length);
  let i = 0;
  while (i < n && a[a.length - 1 - i] === b[b.length - 1 - i]) i++;
  return i;
}

// ─── Ancrage ─────────────────────────────────────────────────────────────────

export type Ancre = { debut: number; fin: number; score: number };

/** Ce qu'il faut pour retrouver un passage (sous-ensemble d'un Surlignage). */
export type Citation = Pick<Surlignage, 'citation' | 'avant' | 'apres' | 'debut'>;

/** Longueur (normalisée) sous laquelle une citation ne suffit plus seule :
 *  « HTA » ou « Diagnostic » existent partout, le contexte doit confirmer. */
export const CITATION_COURTE = 12;
/** Contexte minimal (de chaque côté) pour retrouver un passage réédité. */
const CONTEXTE_MIN_REEDITION = 16;
const MAX_OCCURRENCES = 500;

/**
 * Cherche la citation dans le texte d'une page. Renvoie les bornes dans le
 * texte BRUT (non normalisé) de la meilleure occurrence : plus long contexte
 * commun d'abord, puis la plus proche de l'ancienne position.
 */
export function ancrerDansTexte(c: Citation, texte: string): Ancre | null {
  const cible = normaliser(c.citation).norm;
  if (!cible) return null;
  const { norm, carte } = normaliser(texte);
  if (!norm) return null;
  const avant = normaliser(c.avant).norm;
  const apres = normaliser(c.apres).norm;

  // Position de l'indice (texte brut) ramenée dans le texte normalisé.
  let indice = 0;
  while (indice < carte.length && carte[indice] < c.debut) indice++;

  let meilleure: { i: number; score: number; distance: number } | null = null;
  let depuis = 0;
  for (let n = 0; n < MAX_OCCURRENCES; n++) {
    const i = norm.indexOf(cible, depuis);
    if (i < 0) break;
    depuis = i + 1;
    const gauche = norm.slice(Math.max(0, i - avant.length - 1), i).trimEnd();
    const droite = norm.slice(i + cible.length, i + cible.length + apres.length + 1).trimStart();
    const score = suffixeCommun(avant.trimEnd(), gauche) + prefixeCommun(apres.trimStart(), droite);
    const distance = Math.abs(i - indice);
    if (!meilleure || score > meilleure.score || (score === meilleure.score && distance < meilleure.distance)) {
      meilleure = { i, score, distance };
    }
  }
  if (!meilleure) return null;
  const debut = carte[meilleure.i];
  const fin = carte[meilleure.i + cible.length - 1] + 1;
  return { debut, fin, score: meilleure.score };
}

/**
 * Passage RETOUCHÉ (coquille corrigée par l'enseignant) : la citation exacte
 * n'existe plus, mais son contexte avant ET après est intact, encadrant un
 * passage de longueur voisine. Accepté seulement si l'encadrement est unique —
 * sinon mieux vaut un orphelin qu'un surlignage au mauvais endroit.
 */
export function ancrerParContexte(c: Citation, texte: string): Ancre | null {
  const avant = normaliser(c.avant).norm.slice(-24);
  const apres = normaliser(c.apres).norm.slice(0, 24);
  const longueur = normaliser(c.citation).norm.length;
  if (avant.length < CONTEXTE_MIN_REEDITION || apres.length < CONTEXTE_MIN_REEDITION || !longueur) return null;
  const { norm, carte } = normaliser(texte);
  const min = Math.floor(longueur * 0.7);
  const max = Math.ceil(longueur * 1.3) + 10;
  const trouvees: Array<{ d: number; f: number }> = [];
  let depuis = 0;
  for (let n = 0; n < MAX_OCCURRENCES; n++) {
    const a = norm.indexOf(avant, depuis);
    if (a < 0) break;
    depuis = a + 1;
    let d = a + avant.length;
    if (norm[d] === ' ') d += 1;
    const b = norm.indexOf(apres, d + Math.max(0, min - 1));
    if (b < 0) continue;
    let f = b;
    if (f > d && norm[f - 1] === ' ') f -= 1;
    const l = f - d;
    if (l >= min && l <= max) trouvees.push({ d, f });
    if (trouvees.length > 1) return null;
  }
  if (trouvees.length !== 1) return null;
  const { d, f } = trouvees[0];
  if (f <= d) return null;
  return { debut: carte[d], fin: carte[f - 1] + 1, score: avant.length + apres.length };
}

export type Localisation = { page: number; debut: number; fin: number };

/**
 * Retrouve un surlignage dans le document : sa page d'abord, puis les autres
 * par distance croissante. `pages[i]` = texte de la page i+1, `null` si pas
 * encore connu. Renvoie `null` si introuvable dans les pages connues.
 */
export function localiser(c: Citation & { page: number }, pages: readonly (string | null)[]): Localisation | null {
  const courte = normaliser(c.citation).norm.length < CITATION_COURTE;
  // Pages par distance croissante à la page mémorisée — y compris quand le
  // document a raccourci et que cette page n'existe plus.
  const ordre: number[] = [];
  const portee = Math.max(c.page, pages.length);
  for (let d = 0; d <= portee; d++) {
    for (const p of d === 0 ? [c.page] : [c.page - d, c.page + d]) {
      if (p >= 1 && p <= pages.length) ordre.push(p);
    }
  }
  for (const p of ordre) {
    const texte = pages[p - 1];
    if (texte == null) continue;
    const a = ancrerDansTexte(c, texte);
    if (!a) continue;
    // Sur une AUTRE page, une citation courte doit être confirmée par son contexte.
    if (p !== c.page && courte && a.score < 8) continue;
    return { page: p, debut: a.debut, fin: a.fin };
  }
  for (const p of ordre) {
    const texte = pages[p - 1];
    if (texte == null) continue;
    const a = ancrerParContexte(c, texte);
    if (a) return { page: p, debut: a.debut, fin: a.fin };
  }
  return null;
}

// ─── Réancrage d'une liste ───────────────────────────────────────────────────

/**
 * État d'un surlignage face à la version du PDF affichée :
 *  - `intact`   : même page, même texte → rectangles mémorisés redessinés tels quels ;
 *  - `a-redessiner` : retrouvé (même page ou déplacé) mais la page a changé →
 *     rectangles à recalculer sur la couche texte avant de dessiner ;
 *  - `orphelin` : introuvable dans la version actuelle (toutes pages lues) ;
 *  - `inconnu`  : texte des pages pas encore lu.
 */
export type EtatAncrage = 'intact' | 'a-redessiner' | 'orphelin' | 'inconnu';

/** Vérifie la citation à sa place exacte dans le texte de sa page. */
export function citationEnPlace(s: Pick<Surlignage, 'citation' | 'debut'>, texte: string): boolean {
  return texte.slice(s.debut, s.debut + s.citation.length) === s.citation;
}

/**
 * Confronte chaque surlignage aux textes des pages. Renvoie la liste
 * (éventuellement mise à jour : page/position/citation d'un passage retrouvé
 * ailleurs) et l'état de chacun. Ne touche jamais aux surlignages dont la
 * page n'est pas connue.
 */
export function reancrer(
  surlignages: readonly Surlignage[],
  pages: readonly (TextePage | null)[],
): { surlignages: Surlignage[]; etats: Record<string, EtatAncrage>; modifies: boolean } {
  const textes = pages.map((p) => (p ? p.texte : null));
  const toutesConnues = pages.length > 0 && pages.every((p) => p !== null);
  const etats: Record<string, EtatAncrage> = {};
  let modifies = false;
  const sortie = surlignages.map((s) => {
    const page = s.page <= pages.length ? pages[s.page - 1] : null;
    if (page && citationEnPlace(s, page.texte)) {
      etats[s.id] = page.empreinte === s.empreinte && s.rects.length > 0 ? 'intact' : 'a-redessiner';
      return s;
    }
    if (!toutesConnues && !page) {
      etats[s.id] = 'inconnu';
      return s;
    }
    const loc = localiser(s, textes);
    if (!loc) {
      etats[s.id] = toutesConnues ? 'orphelin' : 'inconnu';
      return s;
    }
    const texte = textes[loc.page - 1] ?? '';
    const ctx = extraireContexte(texte, loc.debut, loc.fin);
    etats[s.id] = 'a-redessiner';
    modifies = true;
    return {
      ...s,
      page: loc.page,
      debut: loc.debut,
      citation: texte.slice(loc.debut, loc.fin),
      avant: ctx.avant,
      apres: ctx.apres,
    };
  });
  return { surlignages: sortie, etats, modifies };
}

// ─── Création ────────────────────────────────────────────────────────────────

export function extraireContexte(texte: string, debut: number, fin: number): { avant: string; apres: string } {
  return {
    avant: texte.slice(Math.max(0, debut - LONGUEUR_CONTEXTE), debut),
    apres: texte.slice(fin, fin + LONGUEUR_CONTEXTE),
  };
}

/** Retire les espaces en bordure d'une sélection ; `null` si elle est vide. */
export function rognerBornes(texte: string, debut: number, fin: number): { debut: number; fin: number } | null {
  let d = Math.max(0, Math.min(debut, texte.length));
  let f = Math.max(0, Math.min(fin, texte.length));
  if (f < d) [d, f] = [f, d];
  while (d < f && /\s/.test(texte[d])) d++;
  while (f > d && /\s/.test(texte[f - 1])) f--;
  return f > d ? { debut: d, fin: f } : null;
}

export function creerSurlignage(args: {
  id: string;
  couleur: CouleurSurlignage;
  page: number;
  textePage: TextePage;
  debut: number;
  fin: number;
  rects: RectNorm[];
  maintenant: string;
}): Surlignage | null {
  const bornes = rognerBornes(args.textePage.texte, args.debut, args.fin);
  if (!bornes) return null;
  let { fin } = bornes;
  const { debut } = bornes;
  if (fin - debut > MAX_CITATION) fin = debut + MAX_CITATION;
  const texte = args.textePage.texte;
  const ctx = extraireContexte(texte, debut, fin);
  return {
    id: args.id,
    couleur: args.couleur,
    page: args.page,
    debut,
    citation: texte.slice(debut, fin),
    avant: ctx.avant,
    apres: ctx.apres,
    rects: fusionnerRects(args.rects).slice(0, MAX_RECTS),
    empreinte: args.textePage.empreinte,
    creeLe: args.maintenant,
  };
}

// ─── Décalages ⇄ spans ───────────────────────────────────────────────────────

/** Morceaux de spans couverts par [debut, fin) : (rang du span, de, à). */
export function morceauxDeSpans(
  segments: readonly Segment[],
  debut: number,
  fin: number,
): Array<{ span: number; de: number; a: number }> {
  const out: Array<{ span: number; de: number; a: number }> = [];
  for (const s of segments) {
    if (s.ignore || s.fin <= debut || s.debut >= fin) continue;
    out.push({ span: s.span, de: Math.max(debut, s.debut) - s.debut, a: Math.min(fin, s.fin) - s.debut });
  }
  return out;
}

/** Décalage dans le texte de la page d'une position (span, caractère). */
export function decalageDepuisSpan(segments: readonly Segment[], span: number, caractere: number): number | null {
  const s = segments.find((x) => x.span === span);
  if (!s) return null;
  if (s.ignore) return s.debut;
  return s.debut + Math.max(0, Math.min(caractere, s.fin - s.debut));
}

// ─── Rectangles ──────────────────────────────────────────────────────────────

/**
 * Fusionne les rectangles d'une même ligne (spans voisins d'un même passage)
 * et écarte les miettes. Moins de rectangles = un fichier plus léger et aucun
 * liseré plus foncé entre deux morceaux d'une ligne.
 */
export function fusionnerRects(rects: readonly RectNorm[]): RectNorm[] {
  const propres = rects
    .filter((r) => r.w > 0.0005 && r.h > 0.0005)
    .map((r) => ({ ...r }))
    .sort((a, b) => a.y - b.y || a.x - b.x);
  const out: RectNorm[] = [];
  for (const r of propres) {
    const prec = out[out.length - 1];
    if (prec) {
      const recouvrementV = Math.min(prec.y + prec.h, r.y + r.h) - Math.max(prec.y, r.y);
      const memeLigne = recouvrementV >= 0.5 * Math.min(prec.h, r.h);
      const ecart = r.x - (prec.x + prec.w);
      if (memeLigne && ecart <= 0.012 && r.x + r.w >= prec.x - 0.012) {
        const x = Math.min(prec.x, r.x);
        const y = Math.min(prec.y, r.y);
        const x2 = Math.max(prec.x + prec.w, r.x + r.w);
        const y2 = Math.max(prec.y + prec.h, r.y + r.h);
        prec.x = x;
        prec.y = y;
        prec.w = x2 - x;
        prec.h = y2 - y;
        continue;
      }
    }
    out.push(r);
  }
  return out.map((r) => ({ x: arrondi(r.x), y: arrondi(r.y), w: arrondi(r.w), h: arrondi(r.h) }));
}

/** Surlignage (le plus récent) sous un point normalisé de la page. */
export function surlignageSousPoint<T extends { rects: readonly RectNorm[] }>(
  surlignages: readonly T[],
  x: number,
  y: number,
  tolerance = 0.002,
): T | null {
  for (let i = surlignages.length - 1; i >= 0; i--) {
    const s = surlignages[i];
    for (const r of s.rects) {
      if (
        x >= r.x - tolerance && x <= r.x + r.w + tolerance &&
        y >= r.y - tolerance && y <= r.y + r.h + tolerance
      ) {
        return s;
      }
    }
  }
  return null;
}

/** Ordre de lecture : page, puis position dans la page. */
export function trierSurlignages<T extends Pick<Surlignage, 'page' | 'debut'>>(liste: readonly T[]): T[] {
  return liste.slice().sort((a, b) => a.page - b.page || a.debut - b.debut);
}
