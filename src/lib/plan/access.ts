import 'server-only';
import { canAccessCollege, hasMedecineGeneraleAccess, parseScope } from '@/lib/auth/permissions';
import { fetchContentAccessForScope } from '@/lib/auth/formula-permissions';
import { MG_COLLEGE_ID } from '@/lib/auth/geriatrie-mg-bonus';
import { chargerAnnonces } from '@/lib/annonces/server';
import { examDateFromCalendar } from '@/lib/moteur/server/candidate';
import { PLAN_STUDENT_ENABLED } from '@/lib/modules-flags';
import { listColleges, listItems, listPreparations, planDb } from './db';
import type { PlanPreparation, Voie } from './types';

/**
 * Qui peut utiliser le planificateur, sur quelle préparation.
 *
 * Données, jamais le nom d'une spécialité dans le code : une préparation
 * (`plan_preparations`) est proposée aux élèves si `student_enabled` est vrai,
 * si elle a au moins un item ACTIF relié à un contenu, et si l'élève y a accès.
 * Règle d'accès de la Médecine générale (29/09/2026) : celle du Parcours du
 * Major — spécialité payée = MG, ou collèges MG sans le bonus Gériatrie → MG —
 * ou un accès intégral. Le personnel voit toutes les préparations dotées
 * d'items (recette), même fermées aux élèves.
 */

export function voieOfScope(permissionScope: unknown): Voie | null {
  return parseScope(permissionScope).voie ?? null;
}

/** L'élève a-t-il accès à cette préparation (collège de premier niveau) ? */
export function canAccessPreparation(permissionScope: unknown, specialiteId: string): boolean {
  const scope = parseScope(permissionScope);
  if (scope.type === 'all') return true;
  if (specialiteId === MG_COLLEGE_ID) return hasMedecineGeneraleAccess(permissionScope);
  return canAccessCollege(scope, specialiteId);
}

type Plannable = { at: number; preparations: PlanPreparation[]; withItems: Set<string> };
let plannableCache: Plannable | null = null;

/** Préparations et celles qui ont un programme réel (items actifs reliés à un contenu) — 5 min en mémoire. */
async function plannable(): Promise<Plannable> {
  if (plannableCache && Date.now() - plannableCache.at < 5 * 60_000) return plannableCache;
  const [preparations, colleges, items] = await Promise.all([listPreparations(), listColleges(), listItems({ activeOnly: true })]);
  const parent = new Map(colleges.map((c) => [c.id, c.parent_matiere_id]));
  const withItems = new Set(items.map((i) => parent.get(i.specialite_id) ?? i.specialite_id));
  plannableCache = { at: Date.now(), preparations, withItems };
  return plannableCache;
}
export function invalidatePlannable(): void { plannableCache = null; }

/** Préparations proposées à ce compte (onboarding, changement de spécialité). */
export async function preparationsFor(permissionScope: unknown, opts: { staff?: boolean } = {}): Promise<PlanPreparation[]> {
  const { preparations, withItems } = await plannable();
  return preparations.filter((p) => withItems.has(p.specialite_id)
    && (opts.staff || (p.student_enabled && canAccessPreparation(permissionScope, p.specialite_id))));
}

/** « Mon planning » est-il proposé à cet élève (menu, pages, actions, API) ? */
export async function planAvailableFor(permissionScope: unknown, opts: { staff?: boolean } = {}): Promise<boolean> {
  if (!opts.staff && !PLAN_STUDENT_ENABLED) return false;
  return (await preparationsFor(permissionScope, opts)).length > 0;
}

/** Parcours du Major ouvert à ce compte (même règle que /parcours) : coachings proposables. */
export async function hasParcoursAccess(permissionScope: unknown, opts: { staff?: boolean } = {}): Promise<boolean> {
  if (opts.staff) return true;
  try {
    const access = await fetchContentAccessForScope(parseScope(permissionScope));
    return access.parcoursMajor && hasMedecineGeneraleAccess(permissionScope);
  } catch {
    return false;
  }
}

/**
 * Date de l'épreuve écrite d'une spécialité, 'YYYY-MM-DD' : calendrier EVC
 * (source unique, /admin/calendrier-evc, même lecture que le moteur central),
 * à défaut la fiche concours de l'accueil. Gardée 5 minutes en mémoire.
 */
const examCache = new Map<string, { at: number; date: string | null }>();
export async function examDateForCollege(collegeId: string): Promise<string | null> {
  const hit = examCache.get(collegeId);
  if (hit && Date.now() - hit.at < 5 * 60_000) return hit.date;
  let date: string | null = null;
  try {
    date = await examDateFromCalendar(collegeId);
  } catch { /* calendrier indisponible : fiche concours */ }
  if (!date) {
    try {
      const [colleges, { fiches }] = await Promise.all([listColleges(), chargerAnnonces(planDb())]);
      const top = colleges.find((c) => c.id === collegeId)?.parent_matiere_id ?? collegeId;
      const f = fiches.get(top) ?? fiches.get(collegeId);
      date = f?.date_epreuve ? f.date_epreuve.slice(0, 10) : null;
    } catch { date = null; }
  }
  examCache.set(collegeId, { at: Date.now(), date });
  return date;
}
