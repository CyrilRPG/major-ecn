import 'server-only';
import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { fetchAllRows } from '@/lib/supabase/fetch-all';
import { scopeOffers } from '@/lib/auth/permissions';
import { GERIATRIE_COLLEGE_ID, MG_COLLEGE_ID } from '@/lib/auth/geriatrie-mg-bonus';
import type { PermissionScope } from '@/types/domain';
import {
  calculerProgression,
  compterQuestionsAccessibles,
  questionAccessible,
  type ContexteProgression,
  type LotQuestions,
  type ProgressionInput,
  type SerieProgressionRow,
} from './course-progress';

/**
 * Chargement des données de progression — le pendant serveur de
 * `course-progress.ts` (la formule, pure et testée).
 *
 * POURQUOI ce module. Chaque page recomptait les questions à sa façon, par
 * une lecture `qcm_questions` jointe à `qcm_series` sous la RLS de l'élève,
 * sans pagination : PostgREST plafonne à 1 000 lignes et la faculté EDN compte
 * 107 472 questions dans 17 156 séries (10/09/2026). Les dénominateurs des
 * pages faculté/collèges étaient donc tronqués en silence, et une jointure
 * sous RLS pouvait faire disparaître les tentatives d'une élève.
 *
 * Deux sources, une seule formule :
 *  1. le CONTENU (questions par série, identique pour tous) — lu avec le
 *     client service-role, par tranches parallèles, puis RÉDUIT en « lots »
 *     par cours et classe d'accès (~3 300 lots pour toute la faculté) et mis en
 *     cache global une heure, comme `getFaculteContentTotals` ;
 *  2. l'ÉLÈVE (questions distinctes tentées, flashcards revues) — lu par
 *     requête, sans plafond (`fetchAllRows`), mémoïsé pour le rendu courant
 *     (`react/cache`) : le navigateur, l'accueil, la grille des collèges et la
 *     bague d'un item se partagent la même lecture.
 *
 * Les règles d'accès (voie, formule, bonus Gériatrie) sont rejouées en
 * TypeScript sur ces lots par `questionAccessible` : c'est le même périmètre
 * que l'onglet DP · QI.
 */

/** Un lot de questions d'un cours partageant la même classe d'accès. */
export type LotQuestionsCours = LotQuestions & { cours_id: string; matiere_id: string };

/** Une série tentée par l'élève, avec ses questions distinctes faites. */
export type SerieFaite = {
  serie: SerieProgressionRow;
  cours_id: string;
  matiere_id: string;
  questionsDistinctes: number;
};

const FILTRE_FACULTE = 'cours.matieres.semestres.faculte_id';

/** Ligne renvoyée par les RPC de progression : une série (ou un lot) et son nombre de questions. */
type SerieAgregeeRow = SerieProgressionRow & { cours_id: string; matiere_id: string; n: number };

function serieProgression(s: SerieAgregeeRow): SerieProgressionRow {
  return {
    label: s.label ?? '',
    type: s.type ?? null,
    kind: s.kind ?? null,
    allowed_voies: s.allowed_voies ?? null,
    allowed_offers: s.allowed_offers ?? null,
    mg_series: s.mg_series ?? null,
    is_revisions: s.is_revisions ?? null,
  };
}

/**
 * Clé de regroupement : tout ce que `canStudentReadSerie` lit d'une série.
 * Le libellé n'y entre que par les quatre motifs qu'elle teste — un libellé
 * représentatif suffit ensuite pour rejouer la règle sur le lot entier.
 */
function cleLot(s: SerieAgregeeRow): string {
  const label = s.label ?? '';
  return [
    s.cours_id,
    s.type ?? '',
    s.kind ?? '',
    /entra[iî]nement/i.test(label) ? 'E' : '',
    /^dp/i.test(label) ? 'D' : '',
    /g[eé]riatrie/i.test(label) ? 'G' : '',
    /^annales?\b/i.test(label) ? 'A' : '',
    JSON.stringify(s.allowed_voies ?? null),
    JSON.stringify(s.allowed_offers ?? null),
    s.mg_series ? '1' : '0',
    s.is_revisions ? '1' : '0',
  ].join('|');
}

/**
 * Les séries sont regroupées en SQL (`progression_lots_questions`, migration
 * 20260929140000) : une requête, ~0,7 s. L'ancienne lecture PostgREST par
 * tranches OFFSET coûtait ~40 s de base à chaque recalcul — 45 % du temps de la
 * base la semaine du 22/09/2026. Le regroupement est rejoué ici par `cleLot`
 * (idempotent) pour ne pas dépendre de la forme exacte des lots SQL.
 */
async function lireLotsFaculte(faculteId: string): Promise<LotQuestionsCours[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (createAdminClient() as any).rpc('progression_lots_questions', { p_faculte_id: faculteId });
  if (error) throw new Error(error.message);

  const lots = new Map<string, LotQuestionsCours>();
  for (const s of (data ?? []) as SerieAgregeeRow[]) {
    if (s.n <= 0) continue;
    const cle = cleLot(s);
    const lot = lots.get(cle);
    if (lot) { lot.n += s.n; continue; }
    lots.set(cle, { cours_id: s.cours_id, matiere_id: s.matiere_id ?? '', n: s.n, serie: serieProgression(s) });
  }
  return [...lots.values()];
}

/**
 * Lots de questions d'une faculté, cache global une heure (tag
 * `progression-questions`, à invalider à la publication de contenu si l'on
 * veut voir un nouveau dénominateur sans attendre).
 */
export const getLotsQuestionsFaculte = unstable_cache(
  async (faculteId: string): Promise<LotQuestionsCours[]> => lireLotsFaculte(faculteId),
  ['progression-lots-questions-v1'],
  { revalidate: 3600, tags: ['progression-questions', 'faculte-content-totals'] },
);

/**
 * Questions distinctes tentées par l'élève, par série (toutes facultés).
 * Agrégat SQL `progression_series_faites` : un aller-retour au lieu de la
 * relecture de toutes ses tentatives par tranches à chaque page.
 */
export const chargerSeriesFaites = cache(async (userId: string): Promise<SerieFaite[]> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (createAdminClient() as any).rpc('progression_series_faites', { p_user_id: userId });
  if (error) throw new Error(error.message);
  return ((data ?? []) as SerieAgregeeRow[]).map((s) => ({
    serie: serieProgression(s),
    cours_id: s.cours_id,
    matiere_id: s.matiere_id ?? '',
    questionsDistinctes: s.n,
  }));
});

/** Cours dont l'élève a revu au moins une flashcard (toutes facultés) — agrégat SQL. */
export const chargerCoursAvecFlashcardsFaites = cache(async (userId: string): Promise<Set<string>> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (createAdminClient() as any).rpc('progression_cours_flashcards_faites', { p_user_id: userId });
  if (error) throw new Error(error.message);
  return new Set((data ?? []) as string[]);
});

/**
 * Cours d'une faculté ayant au moins une vidéo avec une source (Bunny ou
 * fichier) : la vidéo vue devient alors une étape de couverture.
 */
export const chargerCoursAvecVideo = cache(async (faculteId: string): Promise<Set<string>> => {
  const admin = createAdminClient();
  type VideoRow = { cours_id: string };
  const rows = await fetchAllRows<VideoRow>((from, to) =>
    admin
      .from('videos')
      .select('id, cours_id, cours!inner(matieres!inner(semestres!inner(faculte_id)))')
      .eq(FILTRE_FACULTE, faculteId)
      .or('storage_path.not.is.null,bunny_video_id.not.is.null')
      .order('id')
      .range(from, to),
  );
  return new Set(rows.map((r) => r.cours_id));
});

/** Collèges de Médecine générale (parent + sous-collèges), pour le bonus Gériatrie. */
const chargerMatieresMg = cache(async (): Promise<Set<string>> => {
  const { data, error } = await createAdminClient()
    .from('matieres')
    .select('id')
    .or(`id.eq.${MG_COLLEGE_ID},parent_matiere_id.eq.${MG_COLLEGE_ID}`);
  if (error) throw new Error(error.message);
  return new Set((data ?? []).map((m) => m.id));
});

export type ContexteEleve = ContexteProgression & {
  /** Collèges où le bonus Gériatrie → MG s'applique (null = élève non concerné). */
  matieresBonusGeriatrie: Set<string> | null;
};

/**
 * Contexte de progression d'un élève à partir de sa portée. Le staff (admin
 * qui parcourt l'espace élève) n'est soumis à aucune règle : tout compte.
 */
export async function contexteEleve(scope: PermissionScope, { staff = false } = {}): Promise<ContexteEleve> {
  if (staff) return { voie: null, matieresBonusGeriatrie: null };
  // Même critère que `buildQcmAccessContext` (colleges bruts du scope).
  const geriatrie = scope.type === 'college' && scope.colleges.includes(GERIATRIE_COLLEGE_ID);
  return {
    voie: scope.voie ?? null,
    offers: scopeOffers(scope),
    matieresBonusGeriatrie: geriatrie ? await chargerMatieresMg() : null,
  };
}

function contexteCours(ctx: ContexteEleve, matiereId: string): ContexteProgression {
  return {
    voie: ctx.voie,
    offers: ctx.offers,
    geriatrieMgBonus: ctx.matieresBonusGeriatrie?.has(matiereId) ?? false,
  };
}

export type ComptesQuestions = { accessibles: number; faites: number };

/**
 * Questions accessibles et faites par cours, sur le périmètre de l'élève.
 * `faites` ne retient que les séries accessibles et reste ≤ `accessibles`.
 */
export function comptesQuestionsParCours(
  lots: readonly LotQuestionsCours[],
  seriesFaites: readonly SerieFaite[],
  ctx: ContexteEleve,
): Map<string, ComptesQuestions> {
  const parCours = new Map<string, ComptesQuestions>();
  const lotsParCours = new Map<string, LotQuestionsCours[]>();
  for (const lot of lots) {
    if (!lotsParCours.has(lot.cours_id)) lotsParCours.set(lot.cours_id, []);
    lotsParCours.get(lot.cours_id)!.push(lot);
  }
  for (const [coursId, l] of lotsParCours) {
    const accessibles = compterQuestionsAccessibles(l, contexteCours(ctx, l[0].matiere_id));
    parCours.set(coursId, { accessibles, faites: 0 });
  }
  for (const f of seriesFaites) {
    const comptes = parCours.get(f.cours_id);
    if (!comptes || comptes.accessibles === 0) continue;
    if (!questionAccessible({ ...contexteCours(ctx, f.matiere_id), serie: f.serie })) continue;
    comptes.faites = Math.min(comptes.accessibles, comptes.faites + f.questionsDistinctes);
  }
  return parCours;
}

/** Ligne `cours` minimale (avec sa progression fiche/vidéo, portée par la RLS). */
export type CoursProgressionSource = {
  id: string;
  course_progress?: { video_watched: boolean | null; fiche_read: boolean | null }[] | null;
};

export type ProgressionCours = { progression: number; input: ProgressionInput };

/**
 * Progression de chaque cours listé, pour l'élève — LE point d'entrée des
 * pages. `userId` null (visiteur non identifié) = aucune activité.
 */
export async function chargerProgressionCours(params: {
  userId: string | null;
  faculteId: string;
  scope: PermissionScope;
  staff?: boolean;
  cours: readonly CoursProgressionSource[];
}): Promise<Map<string, ProgressionCours>> {
  const { userId, faculteId, scope, staff = false, cours } = params;
  const [lots, seriesFaites, flashcardsFaites, coursAvecVideo, ctx] = await Promise.all([
    getLotsQuestionsFaculte(faculteId),
    userId ? chargerSeriesFaites(userId) : Promise.resolve([] as SerieFaite[]),
    userId ? chargerCoursAvecFlashcardsFaites(userId) : Promise.resolve(new Set<string>()),
    chargerCoursAvecVideo(faculteId),
    contexteEleve(scope, { staff }),
  ]);
  const comptes = comptesQuestionsParCours(lots, seriesFaites, ctx);

  const result = new Map<string, ProgressionCours>();
  for (const c of cours) {
    const cp = c.course_progress?.[0];
    const q = comptes.get(c.id);
    const input: ProgressionInput = {
      questionsAccessibles: q?.accessibles ?? 0,
      questionsFaites: q?.faites ?? 0,
      ficheLue: !!cp?.fiche_read,
      flashcardsFaites: flashcardsFaites.has(c.id),
      videoVue: !!cp?.video_watched,
      aVideo: coursAvecVideo.has(c.id),
    };
    result.set(c.id, { progression: calculerProgression(input), input });
  }
  return result;
}
