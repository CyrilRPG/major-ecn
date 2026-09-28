import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getBearerUser } from '@/lib/auth/bearer';
import { assertDeviceSlot, DEVICE_HEADER } from '@/lib/auth/device';
import { createAdminClient } from '@/lib/supabase/admin';
import { PLAN_STUDENT_ENABLED } from '@/lib/modules-flags';
import { collegeFamily, getProfile, listActivity, listColleges, listGenerations, listItems, planTablesReady } from '@/lib/plan/db';
import {
  acknowledgeFirstPlan, acknowledgeInsufficient, claimExtraActivity, closeDay, collegesForStudent, completeOnboarding, completeSession,
  examDateForCollege, loadEvaluation, loadStudentContext, logFreeWork, postponeSession, publicEvaluation, regeneratePlan, selfPosition, startEvaluation,
  startSession, submitEvaluation, syncMasteryFromPlatform, updateAvailability, voieOfScope, type StudentContext,
} from '@/lib/plan/service';
import { paceMessage, RELIABLE_CONFIDENCE } from '@/lib/plan/mastery';
import { fmtMinutes } from '@/lib/plan/analytics';
import { figuresOf } from '@/lib/plan/figures';
import { addDaysKey } from '@/lib/plan/revision';
import { todayKey } from '@/lib/suivi/format';
import {
  DAY_DONE_CONTINUE, DAY_DONE_QUESTION, DAY_DONE_STOP, DAY_DONE_TITLE, DECLARED_LEVELS, DECLARED_LEVEL_LABEL, DEFAULT_AVAILABILITY,
  EXTRA_TIME_LABEL, FIRST_PLAN_BUTTON, FIRST_PLAN_TEXT, FIRST_PLAN_TITLE, FORECAST_NOTICE, INSUFFICIENT_EDIT, INSUFFICIENT_KEEP,
  INSUFFICIENT_TEXT, MASTERY_STATUS_LABEL, PRIORITY_TIER_LABEL, REFERENCE_STATEMENT, REMINDER_SHORT, SESSION_KIND_LABEL,
  SPECIALTY_LEVELS, START_NOW_LABEL, TRIGGER_LABEL, VOIE_LABEL, type PlanSession, type SessionKind,
} from '@/lib/plan/types';
import type { EvalAnswer } from '@/lib/plan/assessment';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Planificateur adaptatif EVC — pendant mobile des pages et server actions de
 * `(student)/planificateur/**` (addendum Médecine générale 2026 compris).
 *
 * Tout le moteur (priorité, planning, file de travail) reste SERVEUR : l'app
 * n'affiche que des projections et déclenche les mêmes actions, avec la même
 * validation et les mêmes garde-fous — notamment le drapeau de mise en service
 * (`PLAN_STUDENT_ENABLED`), qui vaut pour le téléphone comme pour le navigateur.
 *
 * GET  → état complet de l'espace candidat (ou données du premier lancement).
 * GET  ?evaluation=<id> → une évaluation courte et ses questions.
 * POST → une action (`action` dans le corps).
 */

const Minutes = z.number({ message: 'Durée invalide' }).int('Durée invalide').min(0, 'Durée invalide').max(960, 'Pas plus de 16 h par jour');
const Availability = z.object({ '1': Minutes, '2': Minutes, '3': Minutes, '4': Minutes, '5': Minutes, '6': Minutes, '7': Minutes });
const DayKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date invalide');

/** Textes imposés (addendum §8, §9, §10, pop-up validé) : l'app les affiche tels quels. */
const TEXTES = {
  reference: REFERENCE_STATEMENT, rappel: REMINDER_SHORT, previsionnel: FORECAST_NOTICE,
  premierPlanning: { titre: FIRST_PLAN_TITLE, paragraphes: FIRST_PLAN_TEXT, bouton: FIRST_PLAN_BUTTON },
  tempsInsuffisant: { texte: INSUFFICIENT_TEXT, conserver: INSUFFICIENT_KEEP, modifier: INSUFFICIENT_EDIT },
  journeeTerminee: { titre: DAY_DONE_TITLE, question: DAY_DONE_QUESTION, continuer: DAY_DONE_CONTINUE, terminer: DAY_DONE_STOP },
  tempsSupplementaire: EXTRA_TIME_LABEL, commencerMaintenant: START_NOW_LABEL,
};

async function identifier(req: Request) {
  const auth = await getBearerUser(req);
  if (!auth) return { erreur: NextResponse.json({ error: 'Non authentifié' }, { status: 401 }) } as const;
  const check = await assertDeviceSlot(auth.user.id, req.headers.get(DEVICE_HEADER));
  if (!check.ok) return { erreur: check.response } as const;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any;
  const { data: profile } = await db
    .from('profiles').select('role, is_active, permission_scope').eq('id', auth.user.id).maybeSingle();
  if (profile?.is_active === false) {
    return { erreur: NextResponse.json({ error: 'Compte désactivé' }, { status: 403 }) } as const;
  }
  // Même règle que le web : tant que le module est fermé, seuls les élèves en sont exclus.
  const staff = !!profile && profile.role !== 'student';
  return {
    userId: auth.user.id,
    permissionScope: profile?.permission_scope ?? null,
    staff,
    ouvert: PLAN_STUDENT_ENABLED || staff,
  } as const;
}

/** Projection d'une séance — jamais d'information sur un autre candidat. */
function vueSeance(ctx: StudentContext, s: PlanSession, coursIds: Map<string, string | null>) {
  const item = s.item_id ? ctx.items.find((i) => i.id === s.item_id) ?? null : null;
  const m = s.item_id ? ctx.mastery.get(s.item_id) : undefined;
  return {
    id: s.id, day: s.day, minutes: s.minutes, minutesLabel: fmtMinutes(s.minutes),
    kind: s.kind, kindLabel: SESSION_KIND_LABEL[s.kind], status: s.status, reason: s.reason,
    priorityTier: s.priority_tier, part: s.part, parts: s.parts,
    itemId: s.item_id, itemName: item?.nom_item ?? 'Item du programme',
    coursId: s.item_id ? coursIds.get(s.item_id) ?? null : null,
    masteryScore: m && Number(m.confidence) > 0 ? Number(m.mastery_score) : null,
    fiable: !!m && Number(m.confidence) >= RELIABLE_CONFIDENCE,
    canEvaluate: !!item && ctx.evaluable.has(item.id),
    actualMinutes: s.actual_minutes,
    isFuture: s.day > ctx.today,
    origin: s.origin ?? 'planning',
    plannedDay: s.planned_day ?? null,
  };
}

export async function GET(req: Request) {
  const id = await identifier(req);
  if ('erreur' in id) return id.erreur;
  if (!id.ouvert) return NextResponse.json({ ouvert: false });
  if (!(await planTablesReady())) return NextResponse.json({ ouvert: true, tablesPretes: false });

  const url = new URL(req.url);
  const evaluationId = url.searchParams.get('evaluation');
  if (evaluationId) {
    const vue = await loadEvaluation(id.userId, id.permissionScope, evaluationId);
    if (!vue) return NextResponse.json({ error: 'Évaluation introuvable' }, { status: 404 });
    return NextResponse.json({ ouvert: true, tablesPretes: true, evaluation: publicEvaluation(vue) });
  }

  const profil = await getProfile(id.userId);
  if (!profil?.onboarding_done) {
    // Premier lancement : disponibilités + niveau par spécialité ; voie et date connues.
    const [colleges, all, items] = await Promise.all([collegesForStudent(id.permissionScope), listColleges(), listItems({ activeOnly: true })]);
    const voie = voieOfScope(id.permissionScope);
    return NextResponse.json({
      ouvert: true, tablesPretes: true, onboarded: false,
      onboarding: {
        today: todayKey(),
        niveaux: SPECIALTY_LEVELS,
        niveauxLabels: DECLARED_LEVEL_LABEL,
        disponibilitesParDefaut: DEFAULT_AVAILABILITY,
        voie, voieLabel: voie ? VOIE_LABEL[voie] : null,
        colleges: await Promise.all(colleges.map(async (c) => {
          const famille = collegeFamily(c.id, all);
          const nb = new Map<string, number>();
          for (const i of items) if (famille.includes(i.specialite_id)) nb.set(i.specialite_id, (nb.get(i.specialite_id) ?? 0) + 1);
          return {
            id: c.id, nom: c.nom, items: Array.from(nb.values()).reduce((a, b) => a + b, 0), examDate: await examDateForCollege(c.id),
            specialites: all.filter((m) => famille.includes(m.id) && (nb.get(m.id) ?? 0) > 0)
              .map((m) => ({ id: m.id, nom: m.id === c.id ? `${m.nom} (tronc commun)` : m.nom, items: nb.get(m.id) ?? 0 }))
              .sort((a, b) => a.nom.localeCompare(b.nom, 'fr')),
          };
        })),
      },
      textes: TEXTES,
    });
  }

  await syncMasteryFromPlatform(id.userId).catch(() => 0);
  const ctx = await loadStudentContext(id.userId);
  if (!ctx) return NextResponse.json({ ouvert: true, tablesPretes: true, onboarded: false });

  const coursIds = new Map(ctx.items.map((i) => [i.id, i.cours_id]));
  const visible = (s: PlanSession) => s.status !== 'annulee' && s.status !== 'reportee';
  const jours = Array.from({ length: 7 }, (_, i) => addDaysKey(ctx.today, i)).filter((d) => !ctx.profile.exam_date || d < ctx.profile.exam_date);
  const activite = await listActivity(id.userId, { from: `${addDaysKey(ctx.today, -30)}T00:00:00Z` });
  const minutes30 = activite
    .filter((a) => a.kind === 'seance_terminee' || a.kind === 'travail_libre')
    .reduce((n, a) => n + (a.minutes ?? 0), 0);
  const prochaineSeance = new Map<string, string>();
  for (const s of ctx.sessions) {
    if (s.status === 'planifiee' && s.item_id && s.day >= ctx.today && !prochaineSeance.has(s.item_id)) prochaineSeance.set(s.item_id, s.day);
  }
  const insuffisants = new Set(ctx.coverage.insufficientIds);
  const nonProgrammes = new Set(ctx.program.remainingIds);
  const travailles = new Set(ctx.program.workedIds);
  const programmes = new Set(ctx.program.scheduledIds);
  const [derniere] = await listGenerations(id.userId, 1);
  const nomCollege = new Map(ctx.colleges.map((c) => [c.id, c.nom]));
  const aujourdhui = ctx.sessions.filter((s) => s.day === ctx.today && visible(s)).map((s) => vueSeance(ctx, s, coursIds));
  const summary = ctx.summary;

  // Jusqu'à l'EVC : synthèse par semaine.
  const lundi = (day: string) => { const [y, m, d] = day.split('-').map(Number); const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay() || 7; return addDaysKey(day, 1 - wd); };
  const semaines = new Map<string, PlanSession[]>();
  for (const s of ctx.sessions) if (s.day >= ctx.today && visible(s) && s.status !== 'sautee') semaines.set(lundi(s.day), [...(semaines.get(lundi(s.day)) ?? []), s]);

  return NextResponse.json({
    ouvert: true,
    tablesPretes: true,
    onboarded: true,
    textes: TEXTES,
    contexte: {
      today: ctx.today,
      daysLeft: ctx.daysLeft,
      college: ctx.college?.nom ?? null,
      voie: ctx.voie, voieLabel: ctx.voie ? VOIE_LABEL[ctx.voie] : null,
      profil: {
        availability: ctx.profile.availability,
        unavailable_days: ctx.profile.unavailable_days,
        exam_date: ctx.profile.exam_date,
        exam_date_modifiable: ctx.profile.exam_date_source === 'candidat',
        start_date: ctx.profile.start_date,
        voie: ctx.profile.voie,
        specialite_id: ctx.profile.specialite_id,
        specialty_levels: ctx.profile.specialty_levels,
        niveauxDeclares: Object.entries(ctx.profile.specialty_levels).map(([sid, l]) => ({ id: sid, nom: nomCollege.get(sid) ?? sid, niveau: l, label: DECLARED_LEVEL_LABEL[l] })),
        first_plan_ack_at: ctx.profile.first_plan_ack_at,
        insufficient_ack_at: ctx.profile.insufficient_ack_at,
        day_closed_on: ctx.profile.day_closed_on,
      },
      // Pop-ups : première génération à valider, programme du jour terminé.
      popups: {
        premierPlanning: !ctx.profile.first_plan_ack_at,
        tempsInsuffisant: !!summary?.insufficientTime,
        rappelInsuffisant: !!summary?.insufficientTime && !!ctx.profile.first_plan_ack_at && !ctx.profile.insufficient_ack_at,
        journeeTerminee: aujourdhui.length > 0 && aujourdhui.every((s) => s.status === 'terminee') && ctx.profile.day_closed_on !== ctx.today,
        journeeClose: ctx.profile.day_closed_on === ctx.today,
        chiffres: figuresOf(summary ?? { daysLeft: ctx.daysLeft, totalAvailableMinutes: 0 }),
      },
      aujourdhui,
      prochainsJours: {
        debut: jours[0], fin: jours[jours.length - 1],
        jours: jours.map((jour) => ({
          jour,
          indisponible: ctx.profile.unavailable_days.includes(jour),
          seances: ctx.sessions.filter((s) => s.day === jour && visible(s)).map((s) => vueSeance(ctx, s, coursIds)),
        })),
      },
      jusquaEvc: Array.from(semaines.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([debut, list]) => {
        const parType: Partial<Record<SessionKind, number>> = {};
        for (const s of list) parType[s.kind] = (parType[s.kind] ?? 0) + s.minutes;
        return {
          debut, fin: addDaysKey(debut, 6), minutes: list.reduce((n, s) => n + s.minutes, 0), parType,
          nouveauxItems: Array.from(new Set(list.filter((s) => s.kind === 'apprentissage' && s.part === 1 && s.item_id).map((s) => ctx.items.find((i) => i.id === s.item_id)?.nom_item ?? ''))).filter(Boolean),
        };
      }),
      semaine: { planned: ctx.weekExecution.planned, done: ctx.weekExecution.done, pct: ctx.weekExecution.pct, plannedMinutes: ctx.weekExecution.plannedMinutes, doneMinutes: ctx.weekExecution.doneMinutes },
      couvertureProgramme: {
        total: ctx.program.total, travailles: ctx.program.workedIds.length, programmes: ctx.program.scheduledIds.length,
        restants: ctx.program.remainingIds.length, pct: ctx.program.coveragePct, pctTravailles: ctx.program.workedPct,
      },
      couverture: {
        total: ctx.coverage.total,
        coveragePct: ctx.coverage.coveragePct,
        counts: ctx.coverage.counts,
        insufficientIds: ctx.coverage.insufficientIds,
      },
      resume: {
        insufficientTime: !!summary?.insufficientTime, uncovered: summary?.uncoveredItemIds?.length ?? 0,
        firstCoverageDoneOn: summary?.firstCoverageDoneOn ?? null, finalRevisionDays: summary?.finalRevisionDays ?? 0,
        rythme: summary?.pace ? paceMessage(summary.pace) : null,
        dernierRecalcul: derniere ? { at: derniere.created_at, trigger: TRIGGER_LABEL[derniere.trigger] ?? 'recalcul', version: derniere.plan_version } : null,
        minutesPrevues: ctx.sessions.filter((s) => s.status !== 'annulee').reduce((n, s) => n + s.minutes, 0),
        minutesRealisees: ctx.sessions.filter((s) => s.status === 'terminee').reduce((n, s) => n + (s.actual_minutes ?? s.minutes), 0),
      },
      estimatedMastery: ctx.estimatedMastery,
      minutes30,
      programme: ctx.statuses.map((r) => {
        const priorite = ctx.priorities.get(r.item.id);
        return {
          id: r.item.id,
          nom: r.item.nom_item,
          coursId: r.item.cours_id,
          status: r.status,
          statusLabel: MASTERY_STATUS_LABEL[r.status],
          mastery: r.mastery?.score ?? null,
          niveau: priorite?.level ?? null,
          priorityTier: priorite?.tier ?? 'normale',
          priorityLabel: PRIORITY_TIER_LABEL[priorite?.tier ?? 'normale'],
          priorityScore: priorite?.score ?? 0,
          raison: priorite?.reasons?.[0] ?? null,
          prochaine: prochaineSeance.get(r.item.id) ?? null,
          insuffisant: insuffisants.has(r.item.id),
          nonProgramme: nonProgrammes.has(r.item.id),
          travaille: travailles.has(r.item.id),
          programmeAvantEpreuve: programmes.has(r.item.id),
        };
      }),
      items: ctx.items.map((i) => ({ id: i.id, name: i.nom_item })),
      niveaux: DECLARED_LEVELS,
    },
  });
}

const CorpsSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('onboarding'),
    specialite_id: z.string().min(1, 'Choisissez votre spécialité'),
    voie: z.enum(['interne', 'externe']).nullable(),
    exam_date: DayKey.nullable(),
    availability: Availability,
    unavailable_days: z.array(DayKey).max(400),
    specialty_levels: z.record(z.string(), z.enum(DECLARED_LEVELS)),
  }),
  z.object({ action: z.literal('availability'), availability: Availability, unavailable_days: z.array(DayKey).max(400), exam_date: DayKey.nullable().optional() }),
  z.object({ action: z.literal('ack-first-plan'), insufficient: z.boolean() }),
  z.object({ action: z.literal('ack-insufficient') }),
  z.object({ action: z.literal('extra-time'), budget: z.number().int().min(5).max(480).nullable() }),
  z.object({ action: z.literal('close-day') }),
  z.object({ action: z.literal('start-session'), sessionId: z.string().uuid() }),
  z.object({ action: z.literal('complete-session'), sessionId: z.string().uuid(), actualMinutes: z.number().min(0, 'Durée invalide').max(960, 'Durée invalide').transform((v) => Math.round(v)).nullable() }),
  z.object({ action: z.literal('postpone-session'), sessionId: z.string().uuid() }),
  z.object({ action: z.literal('free-work'), itemId: z.string().uuid(), minutes: z.number({ message: 'Durée invalide' }).min(5, 'Indiquez au moins 5 minutes.').max(600, 'Pas plus de 600 minutes.').transform((v) => Math.round(v)) }),
  z.object({ action: z.literal('regenerate') }),
  z.object({ action: z.literal('self-position'), itemId: z.string().uuid(), level: z.enum(DECLARED_LEVELS) }),
  z.object({ action: z.literal('start-evaluation'), itemId: z.string().uuid() }),
  z.object({
    action: z.literal('submit-evaluation'),
    evaluationId: z.string().uuid(),
    answers: z.record(z.string(), z.discriminatedUnion('kind', [
      z.object({ kind: z.literal('qcm'), selected: z.array(z.string().max(2)).max(10) }),
      z.object({ kind: z.literal('qroc'), text: z.string().max(5000), self: z.enum(['juste', 'partiel', 'faux']) }),
    ])),
  }),
]);

export async function POST(req: Request) {
  const id = await identifier(req);
  if ('erreur' in id) return id.erreur;
  if (!id.ouvert) return NextResponse.json({ error: 'Le planificateur n’est pas encore ouvert.' }, { status: 403 });
  if (!(await planTablesReady())) return NextResponse.json({ error: 'Planificateur indisponible' }, { status: 503 });

  const parsed = CorpsSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Données invalides' }, { status: 400 });
  }
  const body = parsed.data;
  const aujourdhui = todayKey();

  try {
    switch (body.action) {
      case 'onboarding': {
        if (Object.values(body.availability).every((v) => v === 0)) return NextResponse.json({ error: 'Indiquez au moins un jour disponible.' }, { status: 400 });
        // La voie du profil fait foi ; celle du formulaire ne sert que si le profil n'en a pas.
        const voie = voieOfScope(id.permissionScope) ?? body.voie;
        const r = await completeOnboarding(id.userId, { ...body, voie, permissionScope: id.permissionScope });
        if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });
        return NextResponse.json({ ok: true, insufficient: !!r.summary?.insufficientTime });
      }
      case 'availability': {
        if (Object.values(body.availability).every((v) => v === 0)) return NextResponse.json({ error: 'Indiquez au moins un jour disponible.' }, { status: 400 });
        if (body.exam_date && body.exam_date <= aujourdhui) {
          return NextResponse.json({ error: 'La date des épreuves doit être postérieure à aujourd’hui.' }, { status: 400 });
        }
        const summary = await updateAvailability(id.userId, body);
        return NextResponse.json({ ok: true, insufficient: !!summary?.insufficientTime, chiffres: summary ? figuresOf(summary) : null });
      }
      case 'ack-first-plan':
        await acknowledgeFirstPlan(id.userId, body.insufficient);
        return NextResponse.json({ ok: true });
      case 'ack-insufficient':
        await acknowledgeInsufficient(id.userId);
        return NextResponse.json({ ok: true });
      case 'extra-time': {
        const r = await claimExtraActivity(id.userId, body.budget);
        if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });
        return NextResponse.json({ ok: true, sessionId: r.sessionId, itemId: r.activity.itemId, coursId: r.coursId, itemName: r.itemName, kind: r.activity.kind, kindLabel: SESSION_KIND_LABEL[r.activity.kind], minutes: r.activity.minutes, reason: r.activity.reason });
      }
      case 'close-day':
        await closeDay(id.userId);
        return NextResponse.json({ ok: true });
      case 'start-session':
        await startSession(id.userId, body.sessionId);
        return NextResponse.json({ ok: true });
      case 'complete-session':
        await completeSession(id.userId, body.sessionId, body.actualMinutes);
        return NextResponse.json({ ok: true });
      case 'postpone-session':
        await postponeSession(id.userId, body.sessionId);
        return NextResponse.json({ ok: true });
      case 'free-work':
        await logFreeWork(id.userId, body.itemId, body.minutes);
        return NextResponse.json({ ok: true });
      case 'regenerate':
        await regeneratePlan(id.userId, 'demande_candidat');
        return NextResponse.json({ ok: true });
      case 'self-position':
        await selfPosition(id.userId, body.itemId, body.level);
        return NextResponse.json({ ok: true });
      case 'start-evaluation': {
        const r = await startEvaluation(id.userId, id.permissionScope, body.itemId);
        if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });
        return NextResponse.json({ ok: true, id: r.id });
      }
      case 'submit-evaluation': {
        const r = await submitEvaluation(
          id.userId, id.permissionScope, body.evaluationId,
          body.answers as Record<string, EvalAnswer>,
        );
        if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });
        return NextResponse.json({ ok: true, pct: r.pct, result: r.result });
      }
    }
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Erreur' }, { status: 500 });
  }
}
