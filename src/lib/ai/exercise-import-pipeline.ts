/**
 * Import d'exercices — ORCHESTRATION en étapes reprenables. Module PUR.
 *
 * POURQUOI (10/09/2026)
 * --------------------
 * La route `/api/admin/import-exercices/analyse` enchaînait l'extraction par
 * lots, la fusion, la confrontation au document et la validation dans le
 * même appel que le dernier lot ; un lot durablement en échec n'écrivait
 * jamais de résultat partiel (l'import ne finissait jamais), les erreurs de
 * lots n'étaient pas reversées dans les avertissements, le corrigé séparé
 * n'était jamais lu par la couleur, aucune image n'était rattachée et aucun
 * décompte de complétude n'existait. Ce module porte toute la LOGIQUE de
 * l'orchestration sans dépendance serveur, pour qu'elle soit testée
 * (`tests/exercise-import-route.test.ts`) : la route ne fait plus que lire
 * le stockage, appeler le modèle et persister.
 *
 * ÉTAPES (persistées dans `exercise_imports.result.etape`)
 *  1. `analyse`      : lots du modèle (inchangé), un lot en échec après
 *                      scission maximale ou trois tentatives devient un partiel
 *                      vide marqué `echec` — l'import ABOUTIT toujours, et la
 *                      plage manquante devient un écart bloquant ;
 *  2. `verification` : vérité du PDF (couleur), corrigé séparé lu par la
 *                      couleur, confrontation avec réparations, validation ;
 *  3. `images`       : extraction des figures par plages (budget par appel) et
 *                      téléversement ;
 *  4. `relance`      : si des questions du document manquent ou sont
 *                      tronquées, UNE relance des lots concernés (effort
 *                      `xhigh`, numéros attendus dans la consigne), puis
 *                      nouvelle vérification ;
 *  5. `finalisation` : rattachement des images aux questions (par la
 *                      géométrie du document et les appariements du rapport),
 *                      rapport de fiabilité, verdict, facturation → `ready`.
 *
 * REPÈRE DES COORDONNÉES. La vérité (`lireVeritePdf`) lit les ordonnées dans
 * l'espace PDF (origine en BAS, `getTextContent`) ; les images
 * (`extraireImagesPdf`) sont en points « origine en HAUT ». La matrice de vue
 * relevée par page (`VeritePdf.reperesPages`) fait la conversion exacte
 * (`versRepereHaut`) ; à défaut, on suppose une page A4.
 */

import type {
  Alerte, CorrectionsResult, ExerciseImportResult, ImportedImage, ImportedQuestion, ImportVoie, Lot,
} from './exercise-import-schema';
import { appliquerCorrections, fusionnerLots, validate } from './exercise-import-schema';
import { confronterALaSource, dedoublonnerParTexte, trierParPage, type Appariement, type Ecart, type RapportFiabilite, type Reparation } from './exercise-import-verite-rapport';
import type { ReperePage, StatutVerite, VeritePdf } from './exercise-import-verite-lecture';
import { appliquer, rattacherImages, type BlocQuestion, type Confiance } from './exercise-import-images-regles';

/* ─────────── Facturation ─────────── */

/** Marge de la plateforme sur le coût fournisseur (× 5). */
export const PRICE_MULTIPLIER = 5;
/** Marge de sécurité sur le coût réel (change, arrondis de facturation Anthropic). */
const MARGE_COUT_REEL = 1.1;

/**
 * Montant facturé pour un import : le PLUS ÉLEVÉ de l'estimation faite avant
 * l'analyse (`estimateExerciseImportCents`, sur la taille des fichiers) et du
 * coût réel constaté (USD, jetons réellement consommés, relance comprise)
 * majoré de 10 % puis multiplié par la marge de la plateforme (× 5), en
 * centimes arrondis au centime supérieur. L'estimation reste un plancher :
 * elle a été affichée à l'administrateur avant qu'il ne lance l'analyse.
 */
export function facturerImportCents(estimationCents: number, coutReelUsd: number): number {
  const estimation = Number.isFinite(estimationCents) ? Math.max(0, Math.round(estimationCents)) : 0;
  const reel = Number.isFinite(coutReelUsd) && coutReelUsd > 0 ? Math.ceil(coutReelUsd * MARGE_COUT_REEL * PRICE_MULTIPLIER * 100) : 0;
  return Math.max(estimation, reel);
}

/* ─────────── Formes persistées ─────────── */

export type Etape = 'analyse' | 'verification' | 'images' | 'relance' | 'finalisation';
export type Strategie = 'combine' | 'corrige-inclus' | 'corrige-separe';
export type Verdict = 'vert' | 'orange' | 'rouge';

/** Résultat d'un lot ; `echec: true` = lot abandonné (pages non importées). */
export type PartielLot = ExerciseImportResult & { echec?: boolean };

export type Cout = { usd: number; input_tokens: number; output_tokens: number; appels: number };

/** Une image du document, téléversée (repère : points, origine en HAUT). */
export type ImageImportee = {
  page: number; indice: number; yDebut: number; yFin: number;
  largeurPx: number; hauteurPx: number; url: string; chemin: string; sha1: string;
};

/** Ce qu'on garde de la vérité du document entre deux appels (sans les propositions). */
export type VeriteResume = {
  statut: StatutVerite;
  raison?: string;
  nbPagesDocument: number;
  nbQuestionsDocument: number;
  nbPropositionsDocument: number;
  pagesAvecImage: number[];
  nbImages: number;
  avertissements: string[];
  /** Blocs des questions du document, dans l'ordre de `VeritePdf.questions`, repère « origine en haut ». */
  blocs: Array<BlocQuestion & { numeroImprime: string; pages: number[] }>;
};

export type ResumeCorrigeSepare = { statut: StatutVerite; origine: string; nbNumeros: number; avertissements: string[] };

export type Verification = {
  questions: ImportedQuestion[];
  warnings: string[];
  alertes: Alerte[];
  rapport: RapportFiabilite;
  verite: VeriteResume;
  corrigeSepare: ResumeCorrigeSepare | null;
  /** Écarts ajoutés par l'orchestration (pages non importées). */
  ecartsPages: Ecart[];
};

export type EtatImages = {
  numPages: number;
  /** Prochaine page à traiter, `null` quand tout est extrait. */
  pageSuivante: number | null;
  images: ImageImportee[];
  signaturesDecor: string[];
  dureeMs: number;
  appels: number;
  erreur?: string;
};

export type EtatRelance = {
  lots: Lot[];
  /** Numéros imprimés attendus par lot (clé `cle(lot)`). */
  attendus: Record<string, string[]>;
  partiels: Record<string, PartielLot>;
  faite: boolean;
  motifs: string[];
};

export type Plan = {
  nbPagesSujet: number;
  nbPagesCorrige: number | null;
  strategie: Strategie;
  lots: Lot[];
  lotsCorrige: Lot[];
};

/** État d'avancement conservé dans `exercise_imports.result` jusqu'à `ready`. */
export type Progression = {
  etape: Etape;
  plan: Plan;
  partiels: Record<string, PartielLot>;
  partielsCorrige: Record<string, CorrectionsResult>;
  erreurs: Record<string, string>;
  /** Tentatives par lot (échecs autres que « trop long ») : au-delà de `MAX_TENTATIVES_LOT`, le lot est abandonné. */
  tentatives: Record<string, number>;
  avertissementsDocs: string[];
  cout: Cout;
  verrou: string | null;
  model: string;
  effort: string;
  verification?: Verification;
  images?: EtatImages;
  relance?: EtatRelance;
};

/* ─────────── Résultat final ─────────── */

export type RattachementImage = { url: string; page: number; confiance: Confiance; motif: string };

/** Question telle que persistée dans le résultat final et lue par `publish_exercise_import`. */
export type QuestionFinale = Omit<ImportedQuestion, 'images'> & {
  /** URL publiques des images du document rattachées (lues par la RPC de publication). */
  images: string[];
  /** Descriptions textuelles du modèle (jamais publiées ; pour l'écran). */
  images_modele: ImportedImage[];
  images_rattachees: RattachementImage[];
  /** Page et numéro de la question DANS LE DOCUMENT (appariement du rapport), `null` si non appariée. */
  page_document: number | null;
  numero_document: string | null;
  validee_par_admin?: boolean;
  supprimee?: boolean;
  /** Position d'origine, pour restaurer une question écartée à sa place. */
  index_origine?: number;
};

export type AlerteImport = Alerte & { page?: number | null; numeroImprime?: string | null; traitee?: boolean };

export type Fiabilite = {
  statutDocument: StatutVerite;
  questionsDocument: number;
  questionsImportees: number;
  questionsManquantes: number;
  questionsTronquees: number;
  corrigesVerifiesParCouleur: number;
  corrigesCorriges: number;
  imagesDocument: number;
  imagesRattachees: number;
  imagesDouteuses: number;
  vignettesAjoutees: number;
  alertesBloquantes: number;
  alertesARelire: number;
  verdict: Verdict;
};

export type RapportResume = Pick<RapportFiabilite, 'statutDocument' | 'compteurs' | 'ecarts' | 'reparations' | 'avertissements'>;

export type MetaImport = {
  model: string;
  effort: string;
  lots: number;
  pages: number;
  pagesCorrige: number | null;
  strategie: Strategie;
  cout: Cout;
  relances: { lots: number; pages: number[]; attendus: string[] };
  lotsEnEchec: number;
  images: { extraites: number; dureeMs: number; appels: number; erreur: string | null };
};

export type ResultatFinal = {
  etape: 'ready';
  questions: QuestionFinale[];
  questions_ecartees: QuestionFinale[];
  warnings: string[];
  alertes: AlerteImport[];
  rapport: RapportResume;
  fiabilite: Fiabilite;
  meta: MetaImport;
};

export function estProgression(v: unknown): v is Progression {
  if (!v || typeof v !== 'object') return false;
  const o = v as { etape?: string; plan?: unknown };
  return typeof o.etape === 'string' && o.etape !== 'ready' && !!o.plan;
}

export function estResultatFinal(v: unknown): v is ResultatFinal {
  if (!v || typeof v !== 'object') return false;
  const o = v as { etape?: string; questions?: unknown; fiabilite?: unknown };
  return Array.isArray(o.questions) && (o.etape === 'ready' || !!o.fiabilite);
}

/* ─────────── Lots ─────────── */

export const MAX_TENTATIVES_LOT = 3;

export const cle = (lot: Lot) => `${lot.coeurDebut}-${lot.coeurFin}`;
export const libelle = (lot: Lot) => `Pages ${lot.coeurDebut}-${lot.coeurFin}`;

/** Scinde un lot dont la réponse a débordé : deux moitiés de pages cœur, `null` pour une page seule. */
export function scinder(lot: Lot): Lot[] | null {
  const n = lot.coeurFin - lot.coeurDebut + 1;
  if (n < 2) return null;
  const milieu = lot.coeurDebut + Math.ceil(n / 2) - 1;
  const r = lot.coeurDebut - lot.debut; // recouvrement d'origine
  const mk = (cd: number, cf: number, index: number): Lot => ({
    index, coeurDebut: cd, coeurFin: cf,
    debut: Math.max(1, cd - r), fin: Math.min(lot.fin + r, cf + r),
  });
  return [mk(lot.coeurDebut, milieu, lot.index), mk(milieu + 1, lot.coeurFin, lot.index)];
}

/**
 * Abandonne un lot : partiel VIDE marqué `echec`, avec le motif dans ses
 * avertissements. L'import peut ainsi aboutir ; la plage devient un écart
 * bloquant (`ecartsPagesNonImportees`) que l'administrateur voit et traite.
 */
export function marquerLotEnEchec(partiels: Record<string, PartielLot>, lot: Lot, motif: string): PartielLot {
  const partiel: PartielLot = { questions: [], warnings: [`${libelle(lot)} non importées : ${motif}`], echec: true };
  partiels[cle(lot)] = partiel;
  return partiel;
}

/** Plages de pages (cœur) des lots abandonnés, fusionnées quand elles se touchent. */
export function plagesNonImportees(lots: Lot[], partiels: Record<string, PartielLot>): Array<{ debut: number; fin: number; motif: string }> {
  const echecs = lots.filter((l) => partiels[cle(l)]?.echec).sort((a, b) => a.coeurDebut - b.coeurDebut);
  const plages: Array<{ debut: number; fin: number; motif: string }> = [];
  for (const l of echecs) {
    const motif = partiels[cle(l)].warnings[0] ?? 'lot en échec';
    const derniere = plages[plages.length - 1];
    if (derniere && l.coeurDebut <= derniere.fin + 1) { derniere.fin = Math.max(derniere.fin, l.coeurFin); continue; }
    plages.push({ debut: l.coeurDebut, fin: l.coeurFin, motif });
  }
  return plages;
}

/** Un écart BLOQUANT par plage de pages non importées. */
export function ecartsPagesNonImportees(lots: Lot[], partiels: Record<string, PartielLot>): Ecart[] {
  return plagesNonImportees(lots, partiels).map((p) => ({
    gravite: 'bloquant', code: 'pages_non_importees', page: p.debut, numeroImprime: null, question_client_id: null,
    libelle: p.debut === p.fin ? `page ${p.debut}` : `pages ${p.debut}–${p.fin}`, nature: 'pages non importées',
    valeurDocument: null, valeurModele: null,
    message: p.debut === p.fin
      ? `Page ${p.debut} non importée : ${p.motif.replace(/^Pages \d+-\d+ non importées : /, '')} Les exercices de cette page manquent.`
      : `Pages ${p.debut}–${p.fin} non importées : ${p.motif.replace(/^Pages \d+-\d+ non importées : /, '')} Les exercices de ces pages manquent.`,
  }));
}

/* ─────────── Repère et blocs ─────────── */

const A4: ReperePage = [1, 0, 0, -1, 0, 841.89];

/**
 * Convertit une ordonnée de l'espace PDF (origine en bas, `getTextContent`)
 * vers le repère des images (origine en haut) par la matrice de vue de la
 * page ; A4 supposé quand la matrice manque.
 */
export function versRepereHaut(reperes: Record<number, ReperePage> | undefined, page: number, y: number, x = 0): number {
  const m = reperes?.[page] ?? A4;
  return appliquer(m, x, y)[1];
}

/** Hauteur d'une ligne de texte, en points, ajoutée sous la dernière ligne d'un bloc. */
const DESCENTE_LIGNE = 12;

/**
 * Blocs des questions du document pour `rattacherImages` : page de début,
 * haut du libellé et bas de la dernière proposition (repère « origine en
 * haut »). Une question à cheval sur deux pages est bornée au bas de sa
 * première page : une image de la page suivante rejoint la question par la
 * règle des voisins.
 */
export function blocsDepuisVerite(verite: Pick<VeritePdf, 'questions' | 'reperesPages'>): VeriteResume['blocs'] {
  return verite.questions.map((q) => {
    const haut = q.yDebut === null ? 0 : versRepereHaut(verite.reperesPages, q.page, q.yDebut);
    const surMemePage = q.pages.length <= 1 || q.pages[q.pages.length - 1] === q.page;
    const basBrut = q.yFin === null || !surMemePage ? null : versRepereHaut(verite.reperesPages, q.page, q.yFin) + DESCENTE_LIGNE;
    const bas = basBrut === null ? haut + DESCENTE_LIGNE * Math.max(1, q.items.length + 1) : Math.max(basBrut, haut + DESCENTE_LIGNE);
    return { page: q.page, yDebut: Math.min(haut, bas), yFin: Math.max(haut, bas), numero: q.numero, libelle: q.enonce.slice(0, 80), numeroImprime: q.numeroImprime, pages: q.pages };
  });
}

export function resumerVerite(verite: VeritePdf): VeriteResume {
  return {
    statut: verite.statut, ...(verite.raison ? { raison: verite.raison } : {}),
    nbPagesDocument: verite.nbPagesDocument, nbQuestionsDocument: verite.nbQuestionsDocument, nbPropositionsDocument: verite.nbPropositionsDocument,
    pagesAvecImage: [...verite.pagesAvecImage].sort((a, b) => a - b), nbImages: verite.images.length,
    avertissements: [...verite.avertissements], blocs: blocsDepuisVerite(verite),
  };
}

/* ─────────── Vérification (fusion + corrigé + confrontation + validation) ─────────── */

export type EntreesVerification = {
  plan: Pick<Plan, 'lots' | 'lotsCorrige' | 'strategie'>;
  partiels: Record<string, PartielLot>;
  partielsCorrige: Record<string, CorrectionsResult>;
  /** Lots d'une relance, fusionnés APRÈS les lots d'origine des mêmes pages. */
  relance?: Pick<EtatRelance, 'lots' | 'partiels'> | null;
  /** Corrigé séparé lu par la couleur ou le texte (`versCorrectionsResult`), `null` sinon. */
  corrigeSepare: { corrections: CorrectionsResult; resume: ResumeCorrigeSepare } | null;
  verite: VeritePdf;
  voie: ImportVoie;
  avertissementsDocs: string[];
  erreurs: Record<string, string>;
};

/**
 * Assemble les lots, applique les corrigés (modèle puis document : la couleur
 * prime), confronte au document avec réparations, valide. Pur et
 * déterministe : rejouable après une relance. Lève si aucun exercice n'est
 * exploitable (message français), comme `validate`.
 */
export function assemblerEtVerifier(e: EntreesVerification): Verification {
  const lots = e.plan.lots.map((l) => ({ ordre: l.coeurDebut, label: libelle(l), result: e.partiels[cle(l)] ?? { questions: [], warnings: [] } }));
  for (const l of e.relance?.lots ?? []) {
    const r = e.relance?.partiels[cle(l)];
    if (r) lots.push({ ordre: l.coeurDebut + 0.5, label: `${libelle(l)} (relance)`, result: r });
  }
  let fusion = fusionnerLots(lots);
  {
    // Ordre du document AVANT le dédoublonnage : les questions rejouées par une
    // relance retrouvent leur place, et leurs doublons deviennent voisins.
    const { questions, retirees } = dedoublonnerParTexte(trierParPage(fusion.questions));
    if (retirees > 0) fusion = { ...fusion, questions, warnings: [...fusion.warnings, `${retirees} exercice(s) rendus en double par deux lots voisins, fusionné(s) sur le texte.`] };
  }
  if (e.plan.strategie === 'corrige-separe') {
    const corrections: CorrectionsResult = {
      corrections: e.plan.lotsCorrige.flatMap((l) => e.partielsCorrige[cle(l)]?.corrections ?? []),
      warnings: e.plan.lotsCorrige.flatMap((l) => (e.partielsCorrige[cle(l)]?.warnings ?? []).map((w) => `${libelle(l)} : ${w}`)),
    };
    fusion = appliquerCorrections(fusion, corrections);
  }
  // Corrigé séparé lu dans le document (couleur, puis « Réponses : A, C ») :
  // appliqué APRÈS le corrigé du modèle, il prime sur lui.
  if (e.corrigeSepare && e.corrigeSepare.corrections.corrections.length > 0) {
    const avant = fusion.questions.map((q) => (q.items ?? []).map((i) => i.is_correct).join(''));
    fusion = appliquerCorrections(fusion, e.corrigeSepare.corrections);
    const changees = fusion.questions.filter((q, i) => (q.items ?? []).map((it) => it.is_correct).join('') !== avant[i]).length;
    fusion.warnings = fusion.warnings.filter((w) => !/^Aucun corrigé trouvé pour cet exercice/.test(w));
    for (const q of fusion.questions) q.warnings = (q.warnings ?? []).filter((w) => !/^Aucun corrigé trouvé pour cet exercice/.test(w));
    if (changees) fusion.warnings.push(`Corrigé séparé lu dans le document (${e.corrigeSepare.resume.origine}) : ${changees} question(s) dont les bonnes réponses ont été alignées sur lui.`);
  }

  const confrontation = confronterALaSource(fusion.questions, e.verite, { reparer: true });
  const ecartsPages = ecartsPagesNonImportees(e.plan.lots, e.partiels);
  if (fusion.questions.length === 0) {
    const dit = [...e.avertissementsDocs, ...fusion.warnings, ...confrontation.avertissements].filter(Boolean).slice(0, 3).join(' ');
    throw new Error(`Aucun exercice n'a été trouvé dans le document.${dit ? ' Analyse : ' + dit : ''}`);
  }
  const valide = validate({ questions: fusion.questions, warnings: fusion.warnings }, e.voie, { ecarts: [...confrontation.rapport.ecarts, ...ecartsPages] });
  const warnings = fusionnerAvertissements({
    avertissementsDocs: e.avertissementsDocs, erreurs: e.erreurs, partiels: e.partiels, lots: e.plan.lots,
    corrigeSepare: e.corrigeSepare?.resume.avertissements ?? [], confrontation: confrontation.avertissements, validation: valide.warnings,
  });
  return {
    questions: valide.questions, warnings, alertes: valide.alertes ?? [], rapport: confrontation.rapport,
    verite: resumerVerite(e.verite), corrigeSepare: e.corrigeSepare?.resume ?? null, ecartsPages,
  };
}

/**
 * Tous les avertissements en une liste, sans doublon, dans l'ordre :
 * documents, lots en échec ou abandonnés, corrigé séparé, confrontation
 * (vérité du document comprise), validation (qui porte déjà ceux des lots).
 */
export function fusionnerAvertissements(s: {
  avertissementsDocs?: string[]; erreurs?: Record<string, string>; partiels?: Record<string, PartielLot>; lots?: Lot[];
  corrigeSepare?: string[]; confrontation?: string[]; validation?: string[]; images?: string[];
}): string[] {
  const out: string[] = [];
  const ajouter = (w: string | null | undefined) => { const t = String(w ?? '').trim(); if (t && !out.includes(t)) out.push(t); };
  for (const w of s.avertissementsDocs ?? []) ajouter(w);
  for (const [k, m] of Object.entries(s.erreurs ?? {})) ajouter(`Lot pages ${k} en échec : ${m}`);
  for (const l of s.lots ?? []) { const p = s.partiels?.[cle(l)]; if (p?.echec) for (const w of p.warnings) ajouter(w); }
  for (const w of s.corrigeSepare ?? []) ajouter(w);
  for (const w of s.confrontation ?? []) ajouter(w);
  for (const w of s.validation ?? []) ajouter(w);
  for (const w of s.images ?? []) ajouter(w);
  return out;
}

/* ─────────── Relance ─────────── */

export const RELANCE_TAILLE_LOT = 8;

/**
 * Plan de relance : les pages des questions que le rapport dit manquantes ou
 * tronquées, regroupées en lots de pages cœur contiguës (≤ 8), élargis d'une
 * page de part et d'autre. `attendus[cle]` liste les numéros imprimés à
 * réclamer dans la consigne. Vide quand rien ne manque.
 */
export function planifierRelance(ecarts: Ecart[], nbPages: number, taille = RELANCE_TAILLE_LOT, recouvrement = 1): { lots: Lot[]; attendus: Record<string, string[]>; motifs: string[] } {
  const concernes = ecarts.filter((e) => (e.code === 'question_manquante' || e.code === 'propositions_tronquees') && e.page !== null && e.page >= 1 && e.page <= nbPages);
  const parPage = new Map<number, string[]>();
  for (const e of concernes) {
    const l = parPage.get(e.page as number) ?? [];
    if (e.numeroImprime && !l.includes(e.numeroImprime)) l.push(e.numeroImprime);
    parPage.set(e.page as number, l);
  }
  const pages = [...parPage.keys()].sort((a, b) => a - b);
  const lots: Lot[] = []; const attendus: Record<string, string[]> = {};
  let debut = -1; let fin = -1; let index = 0;
  const fermer = () => {
    if (debut < 0) return;
    const lot: Lot = { index: 1000 + index++, coeurDebut: debut, coeurFin: fin, debut: Math.max(1, debut - recouvrement), fin: Math.min(nbPages, fin + recouvrement) };
    lots.push(lot);
    attendus[cle(lot)] = pages.filter((p) => p >= debut && p <= fin).flatMap((p) => parPage.get(p) ?? []);
    debut = -1; fin = -1;
  };
  for (const p of pages) {
    if (debut < 0) { debut = p; fin = p; continue; }
    if (p <= fin + 1 && p - debut + 1 <= taille) { fin = p; continue; }
    fermer(); debut = p; fin = p;
  }
  fermer();
  const manquantes = concernes.filter((e) => e.code === 'question_manquante').length;
  const tronquees = concernes.filter((e) => e.code === 'propositions_tronquees').length;
  const motifs: string[] = [];
  if (lots.length) motifs.push(`Relance de ${lots.length} lot(s) (pages ${lots.map((l) => `${l.coeurDebut}-${l.coeurFin}`).join(', ')}) : ${manquantes} question(s) manquante(s), ${tronquees} liste(s) de propositions tronquée(s) d'après le document.`);
  return { lots, attendus, motifs };
}

/** Consigne supplémentaire d'un lot de relance : les numéros que le modèle a manqués. */
export function consigneRelance(attendus: string[]): string {
  const liste = attendus.length ? attendus.join(', ') : 'celles signalées';
  return `SECONDE PASSE. Une première extraction de ces pages a MANQUÉ ou TRONQUÉ des questions du document : ${liste}. `
    + 'Parcours chaque page cœur ligne à ligne, restitue TOUTES les questions qui y commencent, chacune avec la totalité de ses propositions '
    + '(une liste coupée par un saut de page continue en haut de la page suivante). Ne résume rien, n\'omets rien.';
}

/* ─────────── Rattachement des images ─────────── */

export type BilanRattachement = {
  rattachees: number; douteuses: number; nonRattachees: number;
  ecarts: Ecart[]; warnings: string[];
};

/**
 * Rattache les images téléversées aux questions importées : la géométrie du
 * document (`rattacherImages` sur les blocs de la vérité) désigne la question
 * DU DOCUMENT, l'appariement du rapport la relie à la question du modèle.
 * Écrit les URL dans `questions[].images` (et le détail dans
 * `images_rattachees`). Une image dont la question du document n'a pas été
 * importée, ou sans question, est rapportée.
 */
export function rattacherImagesAuxQuestions(
  images: ImageImportee[], verite: Pick<VeriteResume, 'blocs'>, appariements: Appariement[], questions: QuestionFinale[],
): BilanRattachement {
  const bilan: BilanRattachement = { rattachees: 0, douteuses: 0, nonRattachees: 0, ecarts: [], warnings: [] };
  if (!images.length) return bilan;
  const clientParIndexDocument = new Map<number, string>();
  for (const a of appariements) if (a.question_client_id) clientParIndexDocument.set(a.indexDocument, a.question_client_id);
  const parClient = new Map(questions.map((q) => [q.client_id, q]));
  const rattachements = rattacherImages(images.map((im) => ({ page: im.page, yDebut: im.yDebut, yFin: im.yFin, url: im.url })), verite.blocs);
  rattachements.forEach((r, i) => {
    const im = images[i];
    const numero = r.questionIndex === null ? null : verite.blocs[r.questionIndex]?.numeroImprime ?? null;
    const clientId = r.questionIndex === null ? undefined : clientParIndexDocument.get(r.questionIndex);
    const q = clientId ? parClient.get(clientId) : undefined;
    if (!q) {
      bilan.nonRattachees++;
      const sansQuestion = r.questionIndex === null;
      bilan.ecarts.push({
        gravite: sansQuestion ? 'info' : 'a_relire', code: sansQuestion ? 'image_non_rattachee' : 'image_sans_question_importee',
        page: im.page, numeroImprime: numero, question_client_id: null, libelle: numero ?? `page ${im.page}`, nature: 'image non rattachée',
        valeurDocument: `image p.${im.page} (${im.largeurPx}×${im.hauteurPx} px)`, valeurModele: null,
        message: sansQuestion
          ? `L'image de la page ${im.page} (${im.largeurPx}×${im.hauteurPx} px) n'a pu être rattachée à aucune question : ${r.motif}. Elle est disponible : ${im.url}`
          : `L'image de la page ${im.page} appartient à la question ${numero} du document, qui n'a pas été importée : ${im.url}`,
      });
      return;
    }
    if (!q.images.includes(im.url)) q.images.push(im.url);
    q.images_rattachees.push({ url: im.url, page: im.page, confiance: r.confiance, motif: r.motif });
    bilan.rattachees++;
    if (r.confiance === 'douteuse') {
      bilan.douteuses++;
      q.warnings = [...(q.warnings ?? []), `Image de la page ${im.page} rattachée avec doute (${r.motif}) : vérifiez qu'elle appartient bien à cette question.`];
      bilan.ecarts.push({
        gravite: 'a_relire', code: 'image_douteuse', page: im.page, numeroImprime: numero, question_client_id: q.client_id,
        libelle: numero ?? `page ${im.page}`, nature: 'image douteuse', valeurDocument: `image p.${im.page}`, valeurModele: null,
        message: `Question ${numero ?? ''} (p.${im.page}) : image rattachée avec doute — ${r.motif}. À vérifier.`,
      });
    }
  });
  if (bilan.rattachees) bilan.warnings.push(`${bilan.rattachees} image(s) du document rattachée(s) aux questions${bilan.douteuses ? ` (${bilan.douteuses} avec doute, à vérifier)` : ''}.`);
  if (bilan.nonRattachees) bilan.warnings.push(`${bilan.nonRattachees} image(s) du document n'ont pas pu être rattachées à une question importée.`);
  return bilan;
}

/* ─────────── Alertes, fiabilité, verdict ─────────── */

/** Alerte à partir d'un écart de l'orchestration (mêmes champs que `validate`). */
export function alerteDepuisEcart(e: Ecart): AlerteImport {
  return { gravite: e.gravite, code: e.code, message: e.message, ...(e.question_client_id ? { question_client_id: e.question_client_id } : {}), page: e.page, numeroImprime: e.numeroImprime };
}

/** Complète les alertes de `validate` avec page et numéro (écarts du rapport, puis page de la question). */
export function enrichirAlertes(alertes: Alerte[], ecarts: Ecart[], questions: Array<Pick<QuestionFinale, 'client_id' | 'page_document' | 'numero_document'>>): AlerteImport[] {
  const parClient = new Map(questions.map((q) => [q.client_id, q]));
  return alertes.map((a) => {
    const e = ecarts.find((x) => x.code === a.code && (x.question_client_id ?? undefined) === a.question_client_id)
      ?? ecarts.find((x) => x.message === a.message);
    const q = a.question_client_id ? parClient.get(a.question_client_id) : undefined;
    return { ...a, page: e?.page ?? q?.page_document ?? null, numeroImprime: e?.numeroImprime ?? q?.numero_document ?? null };
  });
}

/** Une alerte compte tant qu'elle n'est ni acquittée, ni portée par une question vérifiée ou écartée. */
export function alerteActive(a: AlerteImport, questions: Array<Pick<QuestionFinale, 'client_id' | 'validee_par_admin' | 'supprimee'>>): boolean {
  if (a.traitee) return false;
  if (!a.question_client_id) return true;
  const q = questions.find((x) => x.client_id === a.question_client_id);
  return !!q && !q.supprimee && !q.validee_par_admin;
}

/**
 * Verdict : rouge s'il reste une alerte bloquante active ; orange s'il reste
 * une alerte à relire, ou si le corrigé du document n'a pas pu être vérifié
 * (document non coloré, illisible ou en erreur) ; vert sinon.
 */
export function calculerVerdict(
  questions: Array<Pick<QuestionFinale, 'client_id' | 'validee_par_admin' | 'supprimee'>>, alertes: AlerteImport[], statutDocument: StatutVerite,
): Verdict {
  const actives = alertes.filter((a) => alerteActive(a, questions));
  if (actives.some((a) => a.gravite === 'bloquant')) return 'rouge';
  if (actives.some((a) => a.gravite === 'a_relire') || statutDocument !== 'colore') return 'orange';
  return 'vert';
}

export function calculerFiabilite(s: {
  questions: QuestionFinale[]; alertes: AlerteImport[]; rapport: Pick<RapportFiabilite, 'statutDocument' | 'compteurs'>;
  images: { extraites: number; rattachees: number; douteuses: number };
}): Fiabilite {
  const c = s.rapport.compteurs;
  const actives = s.alertes.filter((a) => alerteActive(a, s.questions));
  const colore = s.rapport.statutDocument === 'colore';
  return {
    statutDocument: s.rapport.statutDocument,
    questionsDocument: c.questionsDocument,
    questionsImportees: s.questions.filter((q) => !q.supprimee).length,
    questionsManquantes: c.manquantes,
    questionsTronquees: c.propositionsTronquees,
    corrigesVerifiesParCouleur: colore ? c.propositionsComparees : 0,
    corrigesCorriges: c.reparations.corrige,
    imagesDocument: s.images.extraites,
    imagesRattachees: s.images.rattachees,
    imagesDouteuses: s.images.douteuses,
    vignettesAjoutees: c.reparations.vignette_prefixee,
    alertesBloquantes: actives.filter((a) => a.gravite === 'bloquant').length,
    alertesARelire: actives.filter((a) => a.gravite === 'a_relire').length,
    verdict: calculerVerdict(s.questions, s.alertes, s.rapport.statutDocument),
  };
}

/** Recalcule compteurs d'alertes et verdict après une modification de l'administrateur. */
export function recalculerFiabilite(r: ResultatFinal): Fiabilite {
  const actives = r.alertes.filter((a) => alerteActive(a, r.questions));
  return {
    ...r.fiabilite,
    questionsImportees: r.questions.length,
    alertesBloquantes: actives.filter((a) => a.gravite === 'bloquant').length,
    alertesARelire: actives.filter((a) => a.gravite === 'a_relire').length,
    verdict: calculerVerdict(r.questions, r.alertes, r.fiabilite.statutDocument),
  };
}

/* ─────────── Assemblage final ─────────── */

/** Question importée → forme finale : descriptions du modèle mises de côté, page et numéro du document. */
export function versQuestionFinale(q: ImportedQuestion, appariement: Appariement | undefined, index: number): QuestionFinale {
  const { images, ...reste } = q;
  return {
    ...reste, images: [], images_modele: Array.isArray(images) ? images : [], images_rattachees: [],
    page_document: appariement?.page ?? q.source_pages?.[0] ?? null, numero_document: appariement?.numeroImprime ?? q.numero_source ?? null,
    index_origine: index,
  };
}

export type EntreesFinalisation = {
  progression: Progression;
  verification: Verification;
  images: EtatImages | null;
};

/** Résultat final (forme B), prêt à être écrit avec `status: 'ready'`. */
export function finaliser(e: EntreesFinalisation): ResultatFinal {
  const p = e.progression; const v = e.verification;
  const parClient = new Map<string, Appariement>();
  for (const a of v.rapport.appariements) if (a.question_client_id) parClient.set(a.question_client_id, a);
  const questions = v.questions.map((q, i) => versQuestionFinale(q, parClient.get(q.client_id), i));
  const alertes: AlerteImport[] = enrichirAlertes(v.alertes, [...v.rapport.ecarts, ...v.ecartsPages], questions);
  const ecarts: Ecart[] = [...v.rapport.ecarts, ...v.ecartsPages];
  const warnings = [...v.warnings];

  const images = e.images?.images ?? [];
  const bilan = rattacherImagesAuxQuestions(images, v.verite, v.rapport.appariements, questions);
  ecarts.push(...bilan.ecarts);
  for (const ec of bilan.ecarts) alertes.push(alerteDepuisEcart(ec));
  for (const w of bilan.warnings) if (!warnings.includes(w)) warnings.push(w);
  if (e.images?.erreur) {
    const message = `Les images du document n'ont pas pu être extraites : ${e.images.erreur}`;
    warnings.push(message);
    const ec: Ecart = { gravite: 'a_relire', code: 'images_non_extraites', page: null, numeroImprime: null, question_client_id: null, libelle: '—', nature: 'images non extraites', valeurDocument: null, valeurModele: null, message };
    ecarts.push(ec); alertes.push(alerteDepuisEcart(ec));
  }
  // Une question signalée « sans document » qui a maintenant une image n'est plus en défaut.
  const avecImage = new Set(questions.filter((q) => q.images.length > 0).map((q) => q.client_id));
  const alertesFinales = alertes.filter((a) => !(a.code === 'image_sans_document' && a.question_client_id && avecImage.has(a.question_client_id)));
  for (const q of questions) if (avecImage.has(q.client_id)) q.warnings = (q.warnings ?? []).filter((w) => !w.startsWith('Une image figure sur la page de cet exercice'));

  const rapport: RapportResume = { statutDocument: v.rapport.statutDocument, compteurs: v.rapport.compteurs, ecarts, reparations: v.rapport.reparations, avertissements: v.rapport.avertissements };
  const fiabilite = calculerFiabilite({ questions, alertes: alertesFinales, rapport, images: { extraites: images.length, rattachees: bilan.rattachees, douteuses: bilan.douteuses } });
  const lotsEnEchec = p.plan.lots.filter((l) => p.partiels[cle(l)]?.echec).length;
  const meta: MetaImport = {
    model: p.model, effort: p.effort, lots: p.plan.lots.length + p.plan.lotsCorrige.length, pages: p.plan.nbPagesSujet, pagesCorrige: p.plan.nbPagesCorrige,
    strategie: p.plan.strategie, cout: p.cout,
    relances: { lots: p.relance?.lots.length ?? 0, pages: (p.relance?.lots ?? []).flatMap((l) => { const out: number[] = []; for (let x = l.coeurDebut; x <= l.coeurFin; x++) out.push(x); return out; }), attendus: Object.values(p.relance?.attendus ?? {}).flat() },
    lotsEnEchec,
    images: { extraites: images.length, dureeMs: e.images?.dureeMs ?? 0, appels: e.images?.appels ?? 0, erreur: e.images?.erreur ?? null },
  };
  return { etape: 'ready', questions, questions_ecartees: [], warnings, alertes: alertesFinales, rapport, fiabilite, meta };
}

/* ─────────── Modifications de l'administrateur ─────────── */

export type PatchQuestion = {
  enonce?: string;
  items?: Array<{ lettre: string; enonce?: string; is_correct?: boolean; justification?: string }>;
  reponse_attendue?: string;
  correction_generale?: string;
  images?: string[];
  validee_par_admin?: boolean;
  supprimee?: boolean;
};

/**
 * Applique un patch de l'administrateur au résultat final (sur place) :
 * champs autorisés seulement, une question écartée passe dans
 * `questions_ecartees` (la RPC de publication ne lit que `questions`),
 * restaurée à sa place d'origine si `supprimee: false`. Journalise dans
 * `warnings`, recalcule la fiabilité. Rend la question touchée, ou `null`.
 */
export function appliquerPatchQuestion(r: ResultatFinal, clientId: string, patch: PatchQuestion, horodatage = new Date().toISOString()): { question: QuestionFinale | null; modifications: string[] } {
  r.questions_ecartees ??= [];
  let q = r.questions.find((x) => x.client_id === clientId) ?? null;
  let ecartee = false;
  if (!q) { q = r.questions_ecartees.find((x) => x.client_id === clientId) ?? null; ecartee = !!q; }
  if (!q) return { question: null, modifications: [] };
  const modifs: string[] = [];
  const repere = q.numero_document ?? q.numero_source ?? `question ${(q.index_origine ?? 0) + 1}`;

  if (typeof patch.enonce === 'string' && patch.enonce.trim() && patch.enonce !== q.enonce) { q.enonce = patch.enonce; modifs.push('énoncé'); }
  if (Array.isArray(patch.items)) {
    for (const pi of patch.items) {
      const it = q.items.find((x) => x.lettre === pi.lettre);
      if (!it) continue;
      if (typeof pi.enonce === 'string' && pi.enonce.trim() && pi.enonce !== it.enonce) { it.enonce = pi.enonce; modifs.push(`proposition ${it.lettre}`); }
      if (typeof pi.is_correct === 'boolean' && pi.is_correct !== it.is_correct) { it.is_correct = pi.is_correct; modifs.push(`proposition ${it.lettre} → ${pi.is_correct ? 'vraie' : 'fausse'}`); }
      if (typeof pi.justification === 'string' && pi.justification !== (it.justification ?? '')) { it.justification = pi.justification; modifs.push(`justification ${it.lettre}`); }
    }
  }
  if (typeof patch.reponse_attendue === 'string' && patch.reponse_attendue !== (q.reponse_attendue ?? '')) { q.reponse_attendue = patch.reponse_attendue; modifs.push('réponse attendue'); }
  if (typeof patch.correction_generale === 'string' && patch.correction_generale !== (q.correction_generale ?? '')) { q.correction_generale = patch.correction_generale; modifs.push('corrigé général'); }
  if (Array.isArray(patch.images)) {
    // Retrait ou ajout d'URL déjà connues de l'import (aucune URL étrangère).
    const connues = new Set<string>([...q.images, ...q.images_rattachees.map((i) => i.url), ...r.questions.flatMap((x) => x.images), ...r.questions_ecartees.flatMap((x) => x.images)]);
    const voulues = patch.images.filter((u) => typeof u === 'string' && connues.has(u));
    if (voulues.join('\n') !== q.images.join('\n')) { q.images = [...new Set(voulues)]; modifs.push('images'); }
  }
  if (typeof patch.validee_par_admin === 'boolean' && patch.validee_par_admin !== !!q.validee_par_admin) { q.validee_par_admin = patch.validee_par_admin; modifs.push(patch.validee_par_admin ? 'marquée vérifiée' : 'vérification retirée'); }
  if (typeof patch.supprimee === 'boolean' && patch.supprimee !== ecartee) {
    if (patch.supprimee) {
      r.questions = r.questions.filter((x) => x !== q);
      q.supprimee = true; r.questions_ecartees.push(q); modifs.push('écartée');
    } else {
      r.questions_ecartees = r.questions_ecartees.filter((x) => x !== q);
      q.supprimee = false;
      const cible = r.questions.findIndex((x) => (x.index_origine ?? Number.MAX_SAFE_INTEGER) > (q!.index_origine ?? 0));
      if (cible < 0) r.questions.push(q); else r.questions.splice(cible, 0, q);
      modifs.push('restaurée');
    }
  }
  if (modifs.length) {
    r.warnings.push(`Modifié à la main par l'administrateur (${horodatage.slice(0, 16).replace('T', ' ')}) : question ${repere} — ${modifs.join(', ')}.`);
    r.fiabilite = recalculerFiabilite(r);
  }
  return { question: q, modifications: modifs };
}

/** Acquitte (ou rouvre) une alerte globale par son index ; recalcule la fiabilité. */
export function acquitterAlerte(r: ResultatFinal, index: number, traitee: boolean, horodatage = new Date().toISOString()): AlerteImport | null {
  const a = r.alertes[index];
  if (!a) return null;
  a.traitee = traitee;
  r.warnings.push(`${traitee ? 'Alerte acquittée' : 'Alerte rouverte'} par l'administrateur (${horodatage.slice(0, 16).replace('T', ' ')}) : ${a.message.slice(0, 120)}`);
  r.fiabilite = recalculerFiabilite(r);
  return a;
}

/** Reparations d'une question, pour les badges de l'écran. */
export function reparationsDe(rapport: Pick<RapportResume, 'reparations'>, clientId: string): Reparation[] {
  return rapport.reparations.filter((x) => x.question_client_id === clientId);
}
