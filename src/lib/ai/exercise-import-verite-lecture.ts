/**
 * Import d'exercices — lecture STRUCTURELLE d'un document d'exercices, à
 * partir de ses lignes de texte colorées. Module PUR : la lecture du PDF
 * (pdf.js) vit dans `exercise-import-verite.ts`, ce module reçoit des
 * `PageLue[]` et peut donc être testé sur des pages synthétiques.
 *
 * Ce qu'il reconnaît :
 *  - titres de session (« I. Session 1 »), de sujet (« A. Sujet 3 », « Quiz »,
 *    « Dossier progressif 2 », « Cas clinique 4 ») ;
 *  - questions : « 12/ », « 12. », « 12) », « 12 - », « Q12 », « Question 12 »,
 *    « QCM 12 », « QI 12 », « DP 2 – Q4 » ;
 *  - propositions : « a) », « A. », « A) », « A - », « A : », « a/ », cases
 *    « ☐ □ ▢ » (avec ou sans lettre) ;
 *  - la vignette d'un sujet (texte entre son titre et sa première question) et
 *    les compléments intermédiaires (texte entre la dernière proposition d'une
 *    question et la question suivante, s'il dépasse 120 caractères) ;
 *  - le corrigé par la COULEUR (vert #00b050 = proposition exacte) ;
 *  - les en-têtes et pieds de page, écartés par leur couleur (#2f5496 bleu,
 *    #ff0000 rouge) ou par leur répétition (même texte sur ≥ 40 % des pages) ;
 *  - les images, rattachées à la question dont elles occupent la zone.
 *
 * Il ne lève jamais : tout ce qui n'est pas compris est consigné dans
 * `avertissements` (en français, pour un non-technicien) et `reperesIgnores`.
 */

/* ─────────── Entrées ─────────── */

/** Couleur des propositions exactes dans les supports Major ECN. */
export const VERT_CORRIGE = '#00b050';
/** En-tête bleu, pied de page rouge, gris de décor : hors contenu. */
export const COULEURS_HORS_CONTENU: ReadonlySet<string> = new Set(['#2f5496', '#ff0000', '#365f91', '#113367', '#c0c0c0']);
/** Couleur attribuée à un caractère dont la couleur n'a pas pu être résolue. */
export const COULEUR_INCONNUE = 'inconnue';
/** Un bloc libre plus long que cela, entre deux questions, est une vignette. */
export const LONGUEUR_MIN_VIGNETTE = 120;

/** Une ligne de texte telle que lue sur la page. */
export type LigneLue = {
  texte: string;
  /** Une couleur (« #rrggbb » ou `COULEUR_INCONNUE`) par caractère de `texte`. */
  couleurs: string[];
  /** Abscisse de début (points PDF), `null` si inconnue. */
  x: number | null;
  /** Ordonnée de la ligne de base (points PDF, croît vers le HAUT), `null` si inconnue. */
  y: number | null;
};

export type ImageLue = {
  l: number; h: number;
  /** Bas et haut de l'image sur la page (points PDF), `null` si inconnus. */
  yBas: number | null; yHaut: number | null;
};

/**
 * Matrice de la vue de la page à l'échelle 1 (`page.getViewport({ scale: 1 }).transform`
 * de pdf.js) : convertit un point de l'espace PDF (origine en BAS) vers le
 * repère « origine en HAUT, y vers le bas » des images (`exercise-import-images`).
 */
export type ReperePage = [number, number, number, number, number, number];

export type PageLue = { page: number; lignes: LigneLue[]; images: ImageLue[]; repere?: ReperePage };

/* ─────────── Sorties ─────────── */

export type PropositionSource = {
  lettre: string;
  texte: string;
  /** Couleur dominante verte → proposition exacte. */
  juste: boolean;
  /** Part des caractères verts (0 à 1). */
  partVert: number;
  page: number;
  y: number | null;
};

export type SujetSource = {
  /** Titre tel qu'imprimé (« A. Sujet 1 », « Quiz », « DP 2 »). */
  titre: string;
  page: number;
  /** Bloc de texte entre le titre et la première question (« » si aucun). */
  vignette: string;
};

export type QuestionSource = {
  /** Numéro de la question dans son sujet (4 pour « DP 2 – Q4 »). */
  numero: number;
  /** Numéro du dossier quand la question le porte (« DP 2 – Q4 » → 2). */
  dossier: number | null;
  /** Repère tel qu'imprimé : « 12/ », « Q12 », « DP 2 – Q4 ». */
  numeroImprime: string;
  /** Première page de la question. */
  page: number;
  /** Toutes les pages sur lesquelles elle s'étend. */
  pages: number[];
  /** Intitulé de la question (sans la vignette du sujet). */
  enonce: string;
  items: PropositionSource[];
  /** Ordonnée de la première ligne (sur `page`) et de la dernière (sur `pages.at(-1)`). */
  yDebut: number | null;
  yFin: number | null;
  /** Index dans `VeritePdf.sujets`, `null` si aucun titre de sujet ne la précède. */
  sujetIndex: number | null;
  /** Bloc de texte (> 120 caractères) situé juste avant elle, après la question précédente. */
  complement: string | null;
  /** Une question sans proposition est rédactionnelle. */
  formatDetecte: 'qcm' | 'qroc';
};

export type ImageSource = {
  page: number; l: number; h: number; yBas: number | null; yHaut: number | null;
  /** Index dans `VeritePdf.questions` de la question qui la porte, `null` si aucune. */
  questionIndex: number | null;
};

export type StatutVerite = 'colore' | 'non-colore' | 'illisible' | 'erreur';

export type VeritePdf = {
  statut: StatutVerite;
  /** Explication du statut quand il n'est pas `colore` (français). */
  raison?: string;
  /** Compatibilité : `statut === 'colore'`. */
  colore: boolean;
  nbPagesDocument: number;
  /** Plage lue quand la lecture a été découpée, `null` pour tout le document. */
  pagesLues: [number, number] | null;
  nbQuestionsDocument: number;
  nbPropositionsDocument: number;
  sujets: SujetSource[];
  questions: QuestionSource[];
  images: ImageSource[];
  /** Pages portant au moins une image de contenu (numérotation du document). */
  pagesAvecImage: Set<number>;
  /** Avertissements lisibles par un non-technicien. */
  avertissements: string[];
  /** Repères qui ressemblaient à une question ou une proposition mais ont été écartés. */
  reperesIgnores: Array<{ page: number; texte: string; motif: string }>;
  /** Caractères verts hors espaces (mesure de « coloration » du document). */
  volumeVert: number;
  /** Caractères de contenu lus (hors en-têtes). */
  volumeTexte: number;
  /** Propositions lues en tête d'une plage, avant toute question (recollées par `fusionnerVerites`). */
  orphelinsEnTete: PropositionSource[];
  /** Matrice de vue par page (cf. `ReperePage`), quand la lecture l'a relevée. */
  reperesPages?: Record<number, ReperePage>;
};

/* ─────────── Repères ─────────── */

const RE_SESSION = /^(?:[IVXLC]+\s*[.)]\s*)?(?:session|partie|séance|seance|chapitre)\s+(\d+)\b/i;
/** « A. Sujet 1 », « Sujet 1 », « Quiz », « Dossier progressif 2 », « Cas clinique n°3 », « DP 2 ». */
const RE_SUJET = /^(?:[A-Z]\s*[.)]\s*)?(sujet|cas clinique|cas|dossier progressif|dossier|dp|quiz|exercice|énoncé|enonce|vignette)\b\s*(?:n°|no|n)?\s*(\d+)?\s*[:.\-–—]?\s*(.*)$/i;
/** « DP 2 – Q4 », « Dossier 3, question 2 », « Cas 1 - QCM 5 ». */
const RE_Q_DOSSIER = /^(?:dp|dossier(?: progressif)?|cas(?: clinique)?|sujet)\s*(?:n°\s*)?(\d+)\s*[-–—:,.]?\s*(?:q(?:uestion|cm|i)?)\s*\.?\s*(?:n°\s*)?(\d{1,3})\s*[/.):\-–—]?\s*(.*)$/i;
/** « Q12 », « Question 12 », « QCM 12 », « QI 12 », « Q 12 : ». */
const RE_Q_FORT = /^(?:q(?:uestion|cm|i)?)\s*\.?\s*(?:n°\s*)?(\d{1,3})\s*[/.):\-–—]?\s*(.*)$/i;
/** « 12/ », « 12. », « 12) », « 12 - » — formes faibles, soumises à la cohérence des numéros. */
const RE_Q_FAIBLE = /^(\d{1,3})\s*(?:([/.)])|([-–—])(?=\s))\s*(.*)$/;
/** « a) », « A. », « A) », « A - », « A : », « a/ », précédés ou non d'une case. */
const RE_ITEM = /^(?:[☐□▢◻■●○•]\s*)?([a-kA-K])\s*(?:([)./:])|([-–—])(?=\s))\s*(.*)$/;
/** Case sans lettre : « ☐ Proposition ». */
const RE_ITEM_CASE = /^[☐□▢◻]\s*(.+)$/;
/** Numéro de page seul, « Page 3 », « 3 / 131 ». */
const RE_PAGE = /^(?:page\s*)?\d{1,3}(?:\s*\/\s*\d{1,3})?$/i;
/** Repère de proposition au MILIEU d'une ligne, collé à une ponctuation : « mmol/L.d) Au moins ». */
const RE_ITEM_INTERNE = /[.;:,!?»)]\s*([a-kA-K])\)\s/g;

const LETTRES = 'ABCDEFGHIJK';
const finitPhrase = (s: string) => /[.!?;:]\s*[»")]?\s*$/.test(s.trim());

/** Espaces réduits à un seul, couleurs maintenues alignées sur le texte. */
export function normaliserLigne(l: LigneLue): LigneLue {
  let texte = ''; const couleurs: string[] = [];
  for (let i = 0; i < l.texte.length; i++) {
    const ch = l.texte[i];
    if (/\s/.test(ch)) { if (!texte || texte.endsWith(' ')) continue; texte += ' '; couleurs.push(l.couleurs[i] ?? COULEUR_INCONNUE); continue; }
    texte += ch; couleurs.push(l.couleurs[i] ?? COULEUR_INCONNUE);
  }
  if (texte.endsWith(' ')) { texte = texte.slice(0, -1); couleurs.pop(); }
  return { texte, couleurs, x: l.x, y: l.y };
}

type Repere =
  | { type: 'session'; numero: number; reste: string }
  | { type: 'sujet'; titre: string; reste: string }
  | { type: 'question'; numero: number; dossier: number | null; imprime: string; reste: string; fort: boolean }
  | { type: 'item'; lettre: string; reste: string; sansLettre: boolean }
  | { type: 'page' }
  | null;

/** Classe une ligne (déjà nettoyée des en-têtes). */
export function reconnaitreRepere(texte: string): Repere {
  const t = texte.trim();
  if (!t) return null;
  if (RE_PAGE.test(t)) return { type: 'page' };
  let m: RegExpExecArray | null;
  if ((m = RE_SESSION.exec(t))) return { type: 'session', numero: Number(m[1]), reste: t };
  if ((m = RE_Q_DOSSIER.exec(t))) return { type: 'question', numero: Number(m[2]), dossier: Number(m[1]), imprime: t.slice(0, t.length - m[3].length).trim(), reste: m[3], fort: true };
  if ((m = RE_Q_FORT.exec(t))) return { type: 'question', numero: Number(m[1]), dossier: null, imprime: t.slice(0, t.length - m[2].length).trim(), reste: m[2], fort: true };
  if ((m = RE_SUJET.exec(t))) {
    // « Dossier 2 » ouvre un sujet ; « Dossier 2 Q1 » aurait été pris plus haut.
    // Un mot seul en tête de phrase (« Cas particulier : … », « Dossier de
    // l'enfant… ») n'est un titre que numéroté ou précédé d'une lettre (« A. Sujet »).
    const motCle = m[1].toLowerCase();
    const prefixeLettre = /^[A-Z]\s*[.)]/.test(t);
    const sansNumeroAdmis = motCle === 'quiz' || motCle === 'cas clinique' || motCle === 'dossier progressif';
    if (sansNumeroAdmis || m[2] !== undefined || prefixeLettre) {
      const titre = t.slice(0, t.length - m[3].length).trim().replace(/[\s:.\-–—]+$/, '');
      return { type: 'sujet', titre, reste: m[3] };
    }
  }
  if ((m = RE_Q_FAIBLE.exec(t))) {
    // « 3.900 kg » ou « 12.5 % » ne sont pas des questions.
    const reste = m[4];
    if (!(m[2] === '.' && /^\d/.test(reste))) {
      return { type: 'question', numero: Number(m[1]), dossier: null, imprime: t.slice(0, t.length - reste.length).trim(), reste, fort: false };
    }
  }
  if ((m = RE_ITEM.exec(t))) return { type: 'item', lettre: m[1].toUpperCase(), reste: m[4], sansLettre: false };
  if ((m = RE_ITEM_CASE.exec(t))) return { type: 'item', lettre: '', reste: m[1], sansLettre: true };
  return null;
}

/* ─────────── En-têtes et pieds de page ─────────── */

const cleRepetition = (s: string) => s.replace(/\d+/g, '#').replace(/\s+/g, ' ').trim().toLowerCase();

/** Couleur dominante d'une ligne (hors espaces). */
export function couleurDominante(l: LigneLue): string {
  const comptes = new Map<string, number>();
  for (let i = 0; i < l.texte.length; i++) {
    if (!/\S/.test(l.texte[i])) continue;
    const c = l.couleurs[i] ?? COULEUR_INCONNUE;
    comptes.set(c, (comptes.get(c) ?? 0) + 1);
  }
  let meilleure = '#000000'; let max = -1;
  for (const [c, n] of comptes) if (n > max) { max = n; meilleure = c; }
  return meilleure;
}

/**
 * Lignes à écarter avant lecture : couleur hors contenu, ou texte répété à
 * l'identique (numéros mis à part) sur ≥ 40 % des pages (au moins 3 pages).
 * Seules les lignes situées aux EXTRÉMITÉS de la page (trois premières ou
 * trois dernières dans l'ordre de lecture) sont candidates, et jamais une
 * ligne qui ouvre une question ou une proposition : « a) Vrai », « b) Faux »
 * ou « 4/ Que faites-vous ? » reviennent légitimement sur toutes les pages.
 */
export function detecterLignesDecor(pages: PageLue[]): { estDecor: (l: LigneLue) => boolean; repetees: string[] } {
  const pagesParCle = new Map<string, Set<number>>();
  for (const p of pages) {
    const n = p.lignes.length;
    p.lignes.forEach((l, i) => {
      if (i >= 3 && i < n - 3) return;
      const texte = l.texte.replace(/\s+/g, ' ').trim();
      const cle = cleRepetition(texte);
      if (cle.length < 6) return;
      const r = reconnaitreRepere(texte);
      if (r && r.type !== 'page') return;
      const s = pagesParCle.get(cle) ?? new Set<number>();
      s.add(p.page); pagesParCle.set(cle, s);
    });
  }
  const seuil = Math.max(3, Math.ceil(pages.length * 0.4));
  const repetees = new Set<string>();
  if (pages.length >= 3) for (const [cle, s] of pagesParCle) if (s.size >= seuil) repetees.add(cle);
  return {
    estDecor: (l) => COULEURS_HORS_CONTENU.has(couleurDominante(l)) || repetees.has(cleRepetition(l.texte)),
    repetees: [...repetees],
  };
}

/* ─────────── Lecture ─────────── */

export type OptionsAnalyse = {
  nbPagesDocument?: number;
  pagesLues?: [number, number] | null;
};

type Bloc = { texte: string; page: number; y: number | null };

/**
 * Construit la vérité du document à partir de ses pages lues. Ne lève jamais.
 */
export function analyserPages(pages: PageLue[], options: OptionsAnalyse = {}): VeritePdf {
  const nbPagesDocument = options.nbPagesDocument ?? pages.length;
  const avertissements: string[] = [];
  const reperesIgnores: VeritePdf['reperesIgnores'] = [];
  const sujets: SujetSource[] = [];
  const questions: QuestionSource[] = [];
  const { estDecor, repetees } = detecterLignesDecor(pages);
  if (repetees.length) avertissements.push(`${repetees.length} ligne(s) d'en-tête ou de pied de page répétée(s) sur la plupart des pages ont été écartées.`);

  let volumeVert = 0; let volumeTexte = 0; let couleursInconnues = 0;
  let sujetIndex: number | null = null;
  let courante: QuestionSource | null = null;
  // État dans un objet : TypeScript ne voit pas les affectations faites dans
  // les fermetures ci-dessous et rétrécirait à tort le type d'une variable.
  const etat: { mode: 'libre' | 'vignette' | 'enonce' | 'items' } = { mode: 'libre' };
  let bloc: Bloc | null = null;
  let attendu = 1;
  let xItem: number | null = null;

  const ajouterAuBloc = (texte: string, page: number, y: number | null) => {
    if (!bloc) bloc = { texte, page, y };
    else bloc.texte = `${bloc.texte} ${texte}`;
  };
  const fermerBloc = (): Bloc | null => { const b = bloc; bloc = null; return b; };
  const fermerQuestion = () => {
    if (courante) {
      courante.enonce = courante.enonce.replace(/\s+/g, ' ').trim();
      for (const it of courante.items) it.texte = it.texte.replace(/\s+/g, ' ').trim();
      courante.formatDetecte = courante.items.length ? 'qcm' : 'qroc';
    }
    courante = null; xItem = null;
  };
  const ouvrirSujet = (titre: string, page: number, reste: string, y: number | null) => {
    fermerQuestion();
    fermerBloc();
    sujets.push({ titre, page, vignette: '' });
    sujetIndex = sujets.length - 1;
    attendu = 1;
    etat.mode = 'vignette';
    if (reste.trim()) ajouterAuBloc(reste.trim(), page, y);
  };
  const compterCouleurs = (l: LigneLue, de: number, a: number) => {
    let vert = 0; let autre = 0; let inconnues = 0;
    for (let i = de; i < a; i++) {
      if (!/\S/.test(l.texte[i])) continue;
      const c = l.couleurs[i] ?? COULEUR_INCONNUE;
      if (c === COULEUR_INCONNUE) inconnues++;
      if (c === VERT_CORRIGE) vert++; else autre++;
    }
    return { vert, autre, inconnues };
  };
  /** Décomptes de couleur par proposition, mis à jour quand une ligne de suite s'y ajoute. */
  const comptes = new Map<PropositionSource, { vert: number; autre: number }>();
  const poserCouleur = (item: PropositionSource, vert: number, autre: number) => {
    const c = comptes.get(item) ?? { vert: 0, autre: 0 };
    c.vert += vert; c.autre += autre; comptes.set(item, c);
    item.juste = c.vert > c.autre;
    item.partVert = c.vert + c.autre ? c.vert / (c.vert + c.autre) : 0;
  };
  /** Propositions lues avant toute question (début d'une plage) : la fusion les rend à la question précédente. */
  const orphelinsEnTete: PropositionSource[] = [];
  const ajouterItem = (lettre: string, texte: string, page: number, y: number | null, x: number | null, vert: number, autre: number) => {
    if (!courante) return;
    const item: PropositionSource = { lettre, texte, juste: false, partVert: 0, page, y };
    poserCouleur(item, vert, autre);
    courante.items.push(item);
    if (!courante.pages.includes(page)) courante.pages.push(page);
    courante.yFin = y;
    xItem = x;
    etat.mode = 'items';
  };
  /** Un repère faible (« 12/ », « 12. ») hors séquence n'est retenu que si une proposition « a) » le suit de près. */
  const suiviDePropositions = (lignes: LigneLue[], depuis: number) => {
    for (let k = depuis + 1; k < Math.min(lignes.length, depuis + 5); k++) {
      const r = reconnaitreRepere(lignes[k].texte.replace(/\s+/g, ' ').trim());
      if (!r) continue;
      if (r.type === 'item') return r.lettre === 'A' || r.sansLettre;
      if (r.type !== 'page') return false;
    }
    return false;
  };

  for (const p of pages) {
    for (let iLigne = 0; iLigne < p.lignes.length; iLigne++) {
      const brute = p.lignes[iLigne];
      const ligne = normaliserLigne(brute);
      const texte = ligne.texte;
      if (!texte) continue;
      if (estDecor(ligne)) continue;
      volumeTexte += texte.replace(/\s/g, '').length;
      const { vert, inconnues } = compterCouleurs(ligne, 0, ligne.texte.length);
      volumeVert += vert; couleursInconnues += inconnues;

      const repere = reconnaitreRepere(texte);
      if (repere?.type === 'page') continue;

      if (repere?.type === 'session') {
        fermerQuestion(); fermerBloc();
        sujetIndex = null; attendu = 1; etat.mode = 'libre';
        continue;
      }
      if (repere?.type === 'sujet') { ouvrirSujet(repere.titre, p.page, repere.reste, ligne.y); continue; }

      if (repere?.type === 'question') {
        // Hors séquence, un repère faible n'est retenu que si aucune question
        // n'est ouverte ET que des propositions le suivent : un document qui
        // commence à « 7/ ». Dans l'énoncé d'une question ouverte, « 140/75
        // mmHg » suivi de « a) » volerait les propositions de la question.
        const coherent = repere.fort || repere.numero === attendu || repere.numero === 1
          || (courante === null && suiviDePropositions(p.lignes, iLigne));
        if (!coherent) {
          reperesIgnores.push({ page: p.page, texte: texte.slice(0, 80), motif: `numéro ${repere.numero} inattendu (${attendu} attendu)` });
        } else {
          fermerQuestion();
          // « DP 2 – Q4 » sans titre de sujet : le dossier ouvre un sujet implicite.
          if (repere.dossier !== null) {
            const titre = `Dossier ${repere.dossier}`;
            if (sujetIndex === null || sujets[sujetIndex].titre !== titre) {
              const b = fermerBloc();
              sujets.push({ titre, page: p.page, vignette: b && b.texte.length >= LONGUEUR_MIN_VIGNETTE ? b.texte : '' });
              sujetIndex = sujets.length - 1;
              etat.mode = 'libre';
            }
          }
          const b = fermerBloc();
          let complement: string | null = null;
          if (b) {
            if (etat.mode === 'vignette' && sujetIndex !== null) sujets[sujetIndex].vignette = b.texte;
            else if (b.texte.length >= LONGUEUR_MIN_VIGNETTE) complement = b.texte;
          }
          courante = {
            numero: repere.numero, dossier: repere.dossier, numeroImprime: repere.imprime,
            page: p.page, pages: [p.page], enonce: repere.reste, items: [],
            yDebut: ligne.y, yFin: ligne.y, sujetIndex, complement, formatDetecte: 'qroc',
          };
          questions.push(courante);
          attendu = repere.numero + 1;
          etat.mode = 'enonce';
          continue;
        }
      }

      if (repere?.type === 'item' && courante) {
        const attendue = LETTRES[courante.items.length] ?? '';
        const lettre = repere.sansLettre ? attendue : repere.lettre;
        if (lettre && lettre === attendue) {
          const { vert: v, autre } = compterCouleurs(ligne, 0, ligne.texte.length);
          // Une proposition peut en cacher une autre sur la même ligne : « …mmol/L.d) Au moins ».
          const internes = decouperItemsInternes(repere.reste, lettre);
          if (internes.length > 1) {
            let offset = ligne.texte.length - repere.reste.length;
            for (const part of internes) {
              const de = ligne.texte.indexOf(part.texte, offset); const a = de >= 0 ? de + part.texte.length : ligne.texte.length;
              const c = de >= 0 ? compterCouleurs(ligne, de, a) : { vert: 0, autre: 1 };
              ajouterItem(part.lettre, part.texte, p.page, ligne.y, ligne.x, c.vert, c.autre);
              offset = a;
            }
          } else {
            ajouterItem(lettre, repere.reste, p.page, ligne.y, ligne.x, v, autre);
          }
          continue;
        }
        if (etat.mode === 'items' && lettre !== attendue) {
          reperesIgnores.push({ page: p.page, texte: texte.slice(0, 80), motif: `lettre ${lettre || '?'} hors séquence (${attendue || 'aucune'} attendue)` });
        }
        // Une lettre hors séquence est du texte ordinaire : on retombe ci-dessous.
      } else if (repere?.type === 'item' && !courante) {
        if (questions.length === 0 && (options.pagesLues?.[0] ?? 1) > 1) {
          // Début d'une plage : la question est sur la plage précédente.
          const { vert: v, autre } = compterCouleurs(ligne, 0, ligne.texte.length);
          const item: PropositionSource = { lettre: repere.lettre, texte: repere.reste, juste: false, partVert: 0, page: p.page, y: ligne.y };
          poserCouleur(item, v, autre);
          orphelinsEnTete.push(item);
          continue;
        }
        reperesIgnores.push({ page: p.page, texte: texte.slice(0, 80), motif: 'proposition sans question ouverte' });
      }

      // ── Ligne de texte ordinaire ──
      if (etat.mode === 'enonce' && courante) {
        courante.enonce = `${courante.enonce} ${texte}`;
        if (!courante.pages.includes(p.page)) courante.pages.push(p.page);
        courante.yFin = ligne.y;
        continue;
      }
      if (etat.mode === 'items' && courante) {
        // Suite d'une proposition coupée par un retour à la ligne (ou un saut
        // de page), ou nouveau bloc (nouveaux éléments du dossier, corrigé) ?
        // Le retrait tranche quand il est connu : plus en retrait que le repère
        // de la proposition = suite ; moins en retrait = bloc. Sans retrait,
        // la ponctuation finale et l'initiale minuscule décident.
        const dernier = courante.items[courante.items.length - 1];
        const minuscule = /^[a-zà-ÿ(]/.test(texte);
        let continuation: boolean;
        if (ligne.x !== null && xItem !== null && Math.abs(ligne.x - xItem) > 4) continuation = ligne.x > xItem;
        else continuation = (!finitPhrase(dernier.texte) && (minuscule || texte.length < 80)) || (minuscule && texte.length < 80);
        if (continuation) {
          dernier.texte = `${dernier.texte} ${texte}`;
          { const c = compterCouleurs(ligne, 0, ligne.texte.length); poserCouleur(dernier, c.vert, c.autre); }
          if (!courante.pages.includes(p.page)) courante.pages.push(p.page);
          courante.yFin = ligne.y;
          continue;
        }
        etat.mode = 'libre';
      }
      // mode libre ou vignette : le texte s'accumule dans le bloc courant.
      ajouterAuBloc(texte, p.page, ligne.y);
    }
  }
  fermerQuestion();
  {
    const b = fermerBloc();
    if (b && etat.mode === 'vignette' && sujetIndex !== null) sujets[sujetIndex].vignette = b.texte;
  }

  // ── Images : rattachées à la question dont elles occupent la zone ──
  const images = rattacherImages(pages, questions, nbPagesDocument);
  const pagesAvecImage = new Set(images.map((i) => i.page));

  // ── Statut ──
  const nbPropositions = questions.reduce((n, q) => n + q.items.length, 0);
  const questionsCorrigees = questions.filter((q) => q.items.some((i) => i.juste)).length;
  let statut: StatutVerite; let raison: string | undefined;
  if (volumeTexte < 200) {
    statut = 'illisible';
    raison = pages.length === 0
      ? 'Aucune page n’a été lue.'
      : 'Le document ne contient presque aucun texte lisible : il s’agit probablement d’un scan (images de pages) et non d’un PDF texte.';
  } else if (questions.length === 0) {
    statut = 'illisible';
    raison = 'Aucune question numérotée n’a été reconnue dans le texte du document (formats attendus : « 12/ », « 12. », « Q12 », « Question 12 », « DP 2 – Q4 »…).';
  } else if (estColore(volumeVert, volumeTexte, questionsCorrigees, questions.length)) {
    statut = 'colore';
  } else {
    statut = 'non-colore';
    raison = questionsCorrigees > 0
      ? `Seules ${questionsCorrigees} question(s) sur ${questions.length} portent une proposition en vert : le corrigé par la couleur est incomplet.`
      : 'Le document ne porte pas de corrigé par la couleur (aucune proposition écrite en vert #00b050).';
  }

  // ── Avertissements lisibles ──
  if (statut === 'non-colore') avertissements.push(`Le document ne porte pas de corrigé par la couleur : les bonnes réponses viennent de la lecture du modèle et doivent être relues. ${raison ?? ''}`.trim());
  if (statut === 'illisible') avertissements.push(`Le document n’a pas pu être lu comme un sujet d’exercices : ${raison} La confrontation au document est impossible ; tout vient de la lecture du modèle.`);
  if (statut === 'colore' && questionsCorrigees < questions.length) {
    avertissements.push(`${questions.length - questionsCorrigees} question(s) du document n’ont aucune proposition en vert : leur corrigé n’a pas pu être vérifié par la couleur.`);
  }
  const melangees = questions.flatMap((q) => q.items.filter((i) => i.partVert > 0.15 && i.partVert < 0.85).map((i) => `p.${i.page} ${q.numeroImprime} ${i.lettre}`));
  if (melangees.length) avertissements.push(`${melangees.length} proposition(s) mêlent du vert et du noir dans le document (couleur dominante retenue, à relire) : ${melangees.slice(0, 8).join(', ')}${melangees.length > 8 ? '…' : ''}.`);
  const sansItems = questions.filter((q) => q.items.length === 0).length;
  if (sansItems && sansItems < questions.length) avertissements.push(`${sansItems} question(s) du document n’ont aucune proposition reconnue (question rédactionnelle, ou propositions dans un format non reconnu).`);
  const peuItems = questions.filter((q) => q.items.length > 0 && q.items.length < 3);
  if (peuItems.length) avertissements.push(`${peuItems.length} question(s) du document n’ont que 1 ou 2 propositions reconnues : ${peuItems.slice(0, 6).map((q) => `${q.numeroImprime} p.${q.page}`).join(', ')}.`);
  if (couleursInconnues > 0) avertissements.push(`La couleur de ${couleursInconnues} caractère(s) n’a pas pu être résolue ; ils ont été comptés comme non verts.`);
  if (reperesIgnores.length) avertissements.push(`${reperesIgnores.length} repère(s) ressemblant à une question ou une proposition ont été écartés (numéro ou lettre hors séquence) : ${reperesIgnores.slice(0, 4).map((r) => `p.${r.page} « ${r.texte.slice(0, 30)} »`).join(', ')}${reperesIgnores.length > 4 ? '…' : ''}.`);
  const sansPorteuse = images.filter((i) => i.questionIndex === null);
  if (sansPorteuse.length) avertissements.push(`${sansPorteuse.length} image(s) du document ne sont dans la zone d’aucune question (pages ${[...new Set(sansPorteuse.map((i) => i.page))].join(', ')}).`);

  const reperesPages: Record<number, ReperePage> = {};
  for (const p of pages) if (p.repere) reperesPages[p.page] = p.repere;
  return {
    statut, raison, colore: statut === 'colore',
    nbPagesDocument, pagesLues: options.pagesLues ?? null,
    nbQuestionsDocument: questions.length, nbPropositionsDocument: nbPropositions,
    sujets, questions, images, pagesAvecImage, avertissements, reperesIgnores, volumeVert, volumeTexte,
    orphelinsEnTete, reperesPages,
  };
}

/**
 * Un document « coloré » a du vert sur une part notable de son texte ET sur la
 * moitié au moins de ses questions : en deçà, c'est une couleur d'accent (un
 * titre vert) et non un corrigé.
 */
function estColore(volumeVert: number, volumeTexte: number, questionsCorrigees: number, nbQuestions: number): boolean {
  if (nbQuestions === 0 || volumeVert < 20) return false;
  if (volumeVert / Math.max(1, volumeTexte) < 0.02) return false;
  return questionsCorrigees >= Math.max(1, Math.ceil(nbQuestions * 0.5));
}

/** Découpe « Au moins 2. e) Autre » en propositions successives, lettres en séquence. */
function decouperItemsInternes(reste: string, premiere: string): Array<{ lettre: string; texte: string }> {
  const parts: Array<{ lettre: string; texte: string }> = [];
  let lettre = premiere; let debut = 0;
  RE_ITEM_INTERNE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = RE_ITEM_INTERNE.exec(reste))) {
    const suivante = m[1].toUpperCase();
    if (suivante !== LETTRES[LETTRES.indexOf(lettre) + 1]) continue;
    parts.push({ lettre, texte: reste.slice(debut, m.index + 1).trim() });
    lettre = suivante; debut = m.index + m[0].length;
  }
  parts.push({ lettre, texte: reste.slice(debut).trim() });
  return parts;
}

/**
 * Décor contre document : un bandeau, un filet ou un logo reviennent à
 * l'identique (même géométrie) sur presque toutes les pages. Les images
 * restantes sont rattachées à la question dont la zone verticale les contient,
 * sinon à la dernière question ouverte au-dessus d'elles sur la page.
 */
function rattacherImages(pages: PageLue[], questions: QuestionSource[], nbPagesDocument: number): ImageSource[] {
  const pagesParGeometrie = new Map<string, Set<number>>();
  for (const p of pages) for (const d of p.images) {
    const cle = `${d.l}x${d.h}`;
    const s = pagesParGeometrie.get(cle) ?? new Set<number>(); s.add(p.page); pagesParGeometrie.set(cle, s);
  }
  const seuilDecor = Math.max(3, Math.ceil(Math.min(nbPagesDocument, pages.length) * 0.4));
  const images: ImageSource[] = [];
  for (const p of pages) for (const d of p.images) {
    if (d.h <= 2 || d.l <= 2) continue;                                          // filet
    if (d.l < 90 && d.h < 90) continue;                                          // puce, pictogramme
    if (pages.length >= 3 && (pagesParGeometrie.get(`${d.l}x${d.h}`)?.size ?? 0) >= seuilDecor) continue; // décor
    images.push({ page: p.page, l: d.l, h: d.h, yBas: d.yBas, yHaut: d.yHaut, questionIndex: porteuse(questions, p.page, d) });
  }
  return images;
}

function porteuse(questions: QuestionSource[], page: number, d: ImageLue): number | null {
  const centre = d.yBas !== null && d.yHaut !== null ? (d.yBas + d.yHaut) / 2 : null;
  let derniereAuDessus: number | null = null; let derniereSurPage: number | null = null;
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    if (!q.pages.includes(page)) continue;
    derniereSurPage = i;
    if (centre === null) continue;
    const haut = q.page === page ? q.yDebut : Number.POSITIVE_INFINITY;           // commence plus haut sur une page précédente
    const bas = q.pages[q.pages.length - 1] === page ? q.yFin : Number.NEGATIVE_INFINITY; // finit plus bas sur une page suivante
    if (haut !== null && bas !== null && centre <= haut + 4 && centre >= bas - 4) return i;
    if (haut !== null && centre <= haut) derniereAuDessus = i;
  }
  return derniereAuDessus ?? derniereSurPage;
}

/* ─────────── Fusion de lectures par plages ─────────── */

/**
 * Fusionne des lectures faites par plages de pages (dans l'ordre des pages).
 * Les questions d'une plage qui commencent AVANT tout titre de sujet héritent
 * du dernier sujet de la plage précédente.
 */
export function fusionnerVerites(parts: VeritePdf[]): VeritePdf {
  const tri = [...parts].sort((a, b) => (a.pagesLues?.[0] ?? 0) - (b.pagesLues?.[0] ?? 0));
  if (tri.length === 0) return analyserPages([]);
  if (tri.length === 1) return tri[0];
  const sujets: SujetSource[] = []; const questions: QuestionSource[] = []; const images: ImageSource[] = [];
  const avertissements: string[] = []; const reperesIgnores: VeritePdf['reperesIgnores'] = [];
  let volumeVert = 0; let volumeTexte = 0; let nbPagesDocument = 0;
  const erreurs: string[] = [];
  const reperesPages: Record<number, ReperePage> = {};
  for (const part of tri) {
    nbPagesDocument = Math.max(nbPagesDocument, part.nbPagesDocument);
    if (part.statut === 'erreur') { erreurs.push(part.raison ?? 'erreur inconnue'); continue; }
    Object.assign(reperesPages, part.reperesPages ?? {});
    const decalageSujets = sujets.length; const decalageQuestions = questions.length;
    const dernierSujet = sujets.length ? sujets.length - 1 : null;
    // Propositions coupées par la frontière de plages : rendues à la dernière
    // question de la plage précédente si elles poursuivent sa séquence.
    const precedente = questions[questions.length - 1];
    if (precedente) {
      for (const it of part.orphelinsEnTete) {
        if (it.lettre !== LETTRES[precedente.items.length]) break;
        precedente.items.push(it);
        if (!precedente.pages.includes(it.page)) precedente.pages.push(it.page);
        precedente.yFin = it.y; precedente.formatDetecte = 'qcm';
      }
    }
    sujets.push(...part.sujets);
    for (const q of part.questions) {
      questions.push({ ...q, sujetIndex: q.sujetIndex === null ? dernierSujet : q.sujetIndex + decalageSujets });
    }
    for (const im of part.images) images.push({ ...im, questionIndex: im.questionIndex === null ? null : im.questionIndex + decalageQuestions });
    reperesIgnores.push(...part.reperesIgnores);
    volumeVert += part.volumeVert; volumeTexte += part.volumeTexte;
    for (const a of part.avertissements) if (!/^Le document ne porte pas|^Le document n’a pas pu être lu|^\d+ ligne\(s\) d'en-tête/.test(a)) avertissements.push(a);
  }
  const questionsCorrigees = questions.filter((q) => q.items.some((i) => i.juste)).length;
  let statut: StatutVerite; let raison: string | undefined;
  if (erreurs.length === tri.length) { statut = 'erreur'; raison = erreurs[0]; }
  else if (volumeTexte < 200) { statut = 'illisible'; raison = 'Le document ne contient presque aucun texte lisible (scan ?).'; }
  else if (questions.length === 0) { statut = 'illisible'; raison = 'Aucune question numérotée n’a été reconnue dans le texte du document.'; }
  else if (estColore(volumeVert, volumeTexte, questionsCorrigees, questions.length)) statut = 'colore';
  else { statut = 'non-colore'; raison = 'Le document ne porte pas de corrigé par la couleur (aucune proposition écrite en vert #00b050).'; }
  if (erreurs.length) avertissements.unshift(`${erreurs.length} plage(s) de pages n’ont pas pu être lues : ${erreurs[0]}`);
  if (statut === 'non-colore') avertissements.unshift(`Le document ne porte pas de corrigé par la couleur : les bonnes réponses viennent de la lecture du modèle et doivent être relues. ${raison ?? ''}`.trim());
  if (statut === 'illisible') avertissements.unshift(`Le document n’a pas pu être lu comme un sujet d’exercices : ${raison}`);
  return {
    statut, raison, colore: statut === 'colore', nbPagesDocument, pagesLues: null,
    nbQuestionsDocument: questions.length, nbPropositionsDocument: questions.reduce((n, q) => n + q.items.length, 0),
    sujets, questions, images, pagesAvecImage: new Set(images.map((i) => i.page)),
    avertissements: [...new Set(avertissements)], reperesIgnores, volumeVert, volumeTexte,
    orphelinsEnTete: tri[0].orphelinsEnTete, reperesPages,
  };
}

/** Une vérité « erreur », pour un document qui n'a pas pu être ouvert. */
export function veriteEnErreur(raison: string, nbPagesDocument = 0): VeritePdf {
  return {
    statut: 'erreur', raison, colore: false, nbPagesDocument, pagesLues: null,
    nbQuestionsDocument: 0, nbPropositionsDocument: 0, sujets: [], questions: [], images: [], pagesAvecImage: new Set(),
    avertissements: [`Le document n’a pas pu être lu automatiquement : ${raison}. La confrontation au document est impossible ; tout vient de la lecture du modèle.`],
    reperesIgnores: [], volumeVert: 0, volumeTexte: 0, orphelinsEnTete: [],
  };
}

/* ─────────── Corrigé séparé ─────────── */

/** Clé de numéro comparable à `normaliserNumero` du schéma : chiffres joints par « - ». */
export function cleNumero(q: Pick<QuestionSource, 'numero' | 'dossier'>): string {
  return q.dossier !== null ? `${q.dossier}-${q.numero}` : String(q.numero);
}

/** Lettres justes lues dans un corrigé, par clé de numéro. */
export type LettresJustesParNumero = Record<string, { lettres: string[]; page: number; forme: string }>;

/** « Réponses : A, C, E », « Bonnes réponses : ACD », « Réponse : B », « Réponse(s) exacte(s) : A B ». */
const RE_REPONSES = /\b(?:bonnes?\s+)?r[ée]ponses?(?:\s*\(s\))?(?:\s+(?:exactes?|justes?|correctes?|attendues?)(?:\s*\(s\))?)?\s*[:=]\s*([A-Ka-k](?:\s*(?:[,;/]|et|-|–)?\s*[A-Ka-k])*)\b(?![\w'])/i;
/** Ligne-tableau « 1 : ACE », « Q12 – A, C », « 12. BD », « DP 2 – Q4 : AE ». */
const RE_TABLEAU = /^(?:(?:dp|dossier|cas)\s*(\d+)\s*[-–—:,.]?\s*)?(?:q(?:uestion|cm|i)?\s*)?(\d{1,3})\s*[:\-–—.)/]\s*([A-Ka-k](?:\s*(?:[,;/]|et|-|–)?\s*[A-Ka-k])*)\s*\.?$/i;

function lettresDe(brut: string): string[] {
  const out: string[] = [];
  for (const c of brut.toUpperCase()) if (/[A-K]/.test(c) && !out.includes(c)) out.push(c);
  return out;
}

/**
 * Cherche dans le texte d'un corrigé les lettres justes écrites en toutes
 * lettres : lignes-tableau « 1 : ACE » ou mentions « Réponses : A, C, E »
 * rattachées à la question numérotée qui précède. Ne lève jamais.
 */
export function extraireLettresJustesDuTexte(pages: PageLue[]): LettresJustesParNumero {
  const out: LettresJustesParNumero = {};
  const { estDecor } = detecterLignesDecor(pages);
  let courante: { cle: string } | null = null;
  const poser = (cle: string, lettres: string[], page: number, forme: string) => {
    if (!lettres.length || out[cle]) return;
    out[cle] = { lettres, page, forme };
  };
  for (const p of pages) for (const l of p.lignes) {
    const t = l.texte.replace(/\s+/g, ' ').trim();
    if (!t || estDecor(l)) continue;
    const tab = RE_TABLEAU.exec(t);
    if (tab) { poser(tab[1] ? `${Number(tab[1])}-${Number(tab[2])}` : String(Number(tab[2])), lettresDe(tab[3]), p.page, 'tableau'); continue; }
    const rep = reconnaitreRepere(t);
    if (rep?.type === 'question') courante = { cle: rep.dossier !== null ? `${rep.dossier}-${rep.numero}` : String(rep.numero) };
    else if (rep?.type === 'sujet' || rep?.type === 'session') courante = null;
    const m = RE_REPONSES.exec(t);
    if (m && courante) poser(courante.cle, lettresDe(m[1]), p.page, 'mention');
  }
  return out;
}

export type CorrigeSepare = {
  statut: StatutVerite;
  /** D'où viennent les lettres : couleur du corrigé, motifs textuels, les deux, ou rien. */
  origine: 'couleur' | 'texte' | 'couleur+texte' | 'aucune';
  /** Lettres justes par clé de numéro (« 12 », « 2-4 »). */
  lettresJustes: Record<string, string[]>;
  avertissements: string[];
  verite: VeritePdf;
};

/**
 * Compose le corrigé d'un document de corrections séparé : d'abord la couleur
 * (quand le document est coloré), puis les motifs textuels pour les numéros
 * qui n'en ont pas. Un désaccord couleur/texte est signalé, la couleur prime.
 */
export function composerCorrigeSepare(verite: VeritePdf, pages: PageLue[]): CorrigeSepare {
  const lettresJustes: Record<string, string[]> = {};
  const avertissements: string[] = [];
  let parCouleur = 0; let parTexte = 0; let desaccords = 0;
  if (verite.statut === 'colore') {
    for (const q of verite.questions) {
      const justes = q.items.filter((i) => i.juste).map((i) => i.lettre);
      if (justes.length) { lettresJustes[cleNumero(q)] = justes; parCouleur++; }
    }
  }
  const texte = extraireLettresJustesDuTexte(pages);
  for (const [cle, v] of Object.entries(texte)) {
    if (lettresJustes[cle]) {
      if (lettresJustes[cle].join('') !== v.lettres.join('')) { desaccords++; avertissements.push(`Corrigé ${cle} : la couleur dit ${lettresJustes[cle].join(', ')} mais le texte dit ${v.lettres.join(', ')} (p.${v.page}) ; la couleur a été retenue.`); }
      continue;
    }
    lettresJustes[cle] = v.lettres; parTexte++;
  }
  const origine: CorrigeSepare['origine'] = parCouleur && parTexte ? 'couleur+texte' : parCouleur ? 'couleur' : parTexte ? 'texte' : 'aucune';
  if (origine === 'aucune') avertissements.push('Aucune bonne réponse n’a pu être lue dans le document de corrections (ni couleur verte, ni « Réponses : A, C »). Le corrigé viendra de la lecture du modèle et doit être relu.');
  else avertissements.push(`Corrigé séparé : ${Object.keys(lettresJustes).length} question(s) avec des lettres justes lues dans le document (${parCouleur} par la couleur, ${parTexte} par le texte${desaccords ? `, ${desaccords} désaccord(s)` : ''}).`);
  return { statut: verite.statut, origine, lettresJustes, avertissements: [...verite.avertissements, ...avertissements], verite };
}
