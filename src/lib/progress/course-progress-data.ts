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

type SerieContenuRow = SerieProgressionRow & {
  id: string;
  cours_id: string;
  qcm_questions: { count: number }[] | null;
  cours: { matiere_id: string } | null;
};

const SELECT_CONTENU =
  'id, label, type, kind, allowed_voies, allowed_offers, mg_series, is_revisions, cours_id, '
  + 'qcm_questions(count), cours!inner(matiere_id, matieres!inner(semestres!inner(faculte_id)))';
const FILTRE_FACULTE = 'cours.matieres.semestres.faculte_id';
const TRANCHE = 1000;

/**
 * Clé de regroupement : tout ce que `canStudentReadSerie` lit d'une série.
 * Le libellé n'y entre que par les quatre motifs qu'elle teste — un libellé
 * représentatif suffit ensuite pour rejouer la règle sur le lot entier.
 */
function cleLot(s: SerieContenuRow): string {
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

async function lireLotsFaculte(faculteId: string): Promise<LotQuestionsCours[]> {
  const admin = createAdminClient();
  const { count, error: countError } = await admin
    .from('qcm_series')
    .select('id, cours!inner(matieres!inner(semestres!inner(faculte_id)))', { count: 'exact', head: true })
    .eq(FILTRE_FACULTE, faculteId)
    .in('type', ['qcm', 'qroc']);
  if (countError) throw new Error(countError.message);

  const tranches: [number, number][] = [];
  for (let from = 0; from < (count ?? 0); from += TRANCHE) tranches.push([from, from + TRANCHE - 1]);
  const pages = await Promise.all(
    tranches.map(([from, to]) =>
      admin
        .from('qcm_series')
        .select(SELECT_CONTENU as 'id')
        .eq(FILTRE_FACULTE, faculteId)
        .in('type', ['qcm', 'qroc'])
        .order('id')
        .range(from, to),
    ),
  );

  const lots = new Map<string, LotQuestionsCours>();
  for (const page of pages) {
    if (page.error) throw new Error(page.error.message);
    for (const s of (page.data ?? []) as unknown as SerieContenuRow[]) {
      const n = s.qcm_questions?.[0]?.count ?? 0;
      if (n <= 0) continue;
      const cle = cleLot(s);
      const lot = lots.get(cle);
      if (lot) { lot.n += n; continue; }
      lots.set(cle, {
        cours_id: s.cours_id,
        matiere_id: s.cours?.matiere_id ?? '',
        n,
        serie: {
          label: s.label ?? '',
          type: s.type ?? null,
          kind: s.kind ?? null,
          allowed_voies: s.allowed_voies ?? null,
          allowed_offers: s.allowed_offers ?? null,
          mg_series: s.mg_series ?? null,
          is_revisions: s.is_revisions ?? null,
        },
      });
    }
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

/** Questions distinctes tentées par l'élève, par série (toutes facultés). */
export const chargerSeriesFaites = cache(async (userId: string): Promise<SerieFaite[]> => {
  const admin = createAdminClient();
  type AttemptRow = { question_id: string; qcm_questions: { serie_id: string } | null };
  const attempts = await fetchAllRows<AttemptRow>((from, to) =>
    admin
      .from('qcm_attempts')
      .select('question_id, qcm_questions!inner(serie_id)')
      .eq('user_id', userId)
      .order('id')
      .range(from, to),
  );
  const parSerie = new Map<string, Set<string>>();
  for (const a of attempts) {
    const serieId = a.qcm_questions?.serie_id;
    if (!serieId) continue;
    if (!parSerie.has(serieId)) parSerie.set(serieId, new Set());
    parSerie.get(serieId)!.add(a.question_id);
  }
  if (parSerie.size === 0) return [];

  const ids = [...parSerie.keys()];
  const LOT_IDS = 100; // borne la longueur de l'URL PostgREST
  type SerieRow = SerieProgressionRow & { id: string; cours_id: string; cours: { matiere_id: string } | null };
  const pages = await Promise.all(
    Array.from({ length: Math.ceil(ids.length / LOT_IDS) }, (_, i) =>
      admin
        .from('qcm_series')
        .select('id, label, type, kind, allowed_voies, allowed_offers, mg_series, is_revisions, cours_id, cours!inner(matiere_id)' as 'id')
        .in('id', ids.slice(i * LOT_IDS, (i + 1) * LOT_IDS)),
    ),
  );
  const faites: SerieFaite[] = [];
  for (const page of pages) {
    if (page.error) throw new Error(page.error.message);
    for (const s of (page.data ?? []) as unknown as SerieRow[]) {
      faites.push({
        serie: {
          label: s.label ?? '',
          type: s.type ?? null,
          kind: s.kind ?? null,
          allowed_voies: s.allowed_voies ?? null,
          allowed_offers: s.allowed_offers ?? null,
          mg_series: s.mg_series ?? null,
          is_revisions: s.is_revisions ?? null,
        },
        cours_id: s.cours_id,
        matiere_id: s.cours?.matiere_id ?? '',
        questionsDistinctes: parSerie.get(s.id)?.size ?? 0,
      });
    }
  }
  return faites;
});

/** Cours dont l'élève a revu au moins une flashcard (toutes facultés). */
export const chargerCoursAvecFlashcardsFaites = cache(async (userId: string): Promise<Set<string>> => {
  const admin = createAdminClient();
  type ReviewRow = { flashcards: { cours_id: string } | null };
  const rows = await fetchAllRows<ReviewRow>((from, to) =>
    admin
      .from('flashcard_reviews')
      .select('id, flashcards!inner(cours_id)')
      .eq('user_id', userId)
      .order('id')
      .range(from, to),
  );
  const set = new Set<string>();
  for (const r of rows) if (r.flashcards?.cours_id) set.add(r.flashcards.cours_id);
  return set;
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
