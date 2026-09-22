import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getBearerUser } from '@/lib/auth/bearer';
import { assertDeviceSlot, DEVICE_HEADER } from '@/lib/auth/device';
import { createAdminClient } from '@/lib/supabase/admin';
import { parseScope } from '@/lib/auth/permissions';
import { PLAN_STUDENT_ENABLED } from '@/lib/modules-flags';
import {
  collegeFamily, getConfig, getProfile, listActivity, listColleges, listGenerations, listItems, planTablesReady,
} from '@/lib/plan/db';
import {
  collegesForStudent, completeOnboarding, completeSession, loadEvaluation, loadStudentContext, logFreeWork,
  postponeSession, regeneratePlan, selfPosition, startEvaluation, startSession, submitEvaluation,
  syncMasteryFromPlatform, updateAvailability, type StudentContext,
} from '@/lib/plan/service';
import { RELIABLE_CONFIDENCE } from '@/lib/plan/mastery';
import { fmtMinutes } from '@/lib/plan/analytics';
import { addDaysKey } from '@/lib/plan/revision';
import { isoWeekday, todayKey } from '@/lib/suivi/format';
import {
  CONSENT_CHECKBOX, CONSENT_TEXT, CONSENT_TITLE, DECLARED_LEVELS, DECLARED_LEVEL_LABEL, DEFAULT_AVAILABILITY,
  MASTERY_STATUS_LABEL, PRIORITY_TIER_LABEL, REFERENCE_STATEMENT, REMINDER_SHORT,
  SESSION_KIND_LABEL, type PlanSession,
} from '@/lib/plan/types';
import type { EvalAnswer } from '@/lib/plan/assessment';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Planificateur adaptatif EVC — pendant mobile des pages et server actions de
 * `(student)/planificateur/**`.
 *
 * Tout le moteur (priorité, prérequis, planning, révision) reste SERVEUR :
 * l'app n'affiche que des projections et déclenche les mêmes actions, avec la
 * même validation et les mêmes garde-fous — notamment le drapeau de mise en
 * service (`PLAN_STUDENT_ENABLED`), qui vaut pour le téléphone comme pour le
 * navigateur : tant qu'il est fermé, seul le personnel y accède.
 *
 * GET  → état complet de l'espace candidat (ou données d'onboarding).
 * GET  ?evaluation=<id> → une évaluation courte et ses questions.
 * POST → une action (`action` dans le corps).
 */

const Availability = z.object({
  '1': z.number().min(0).max(960), '2': z.number().min(0).max(960), '3': z.number().min(0).max(960),
  '4': z.number().min(0).max(960), '5': z.number().min(0).max(960), '6': z.number().min(0).max(960),
  '7': z.number().min(0).max(960),
});
const DayKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date invalide');

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
  const staff = profile?.role === 'admin' || profile?.role === 'professor';
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
    canEvaluate: !!item,
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
    return NextResponse.json({ ouvert: true, tablesPretes: true, evaluation: vue });
  }

  const profil = await getProfile(id.userId);
  if (!profil?.onboarding_done) {
    // Première utilisation : de quoi composer le questionnaire d'installation.
    const [colleges, all, items, config] = await Promise.all([
      collegesForStudent(id.permissionScope), listColleges(), listItems({ activeOnly: true }), getConfig(),
    ]);
    const nomDe = new Map(all.map((c) => [c.id, c.nom]));
    return NextResponse.json({
      ouvert: true, tablesPretes: true, onboarded: false,
      onboarding: {
        today: todayKey(),
        niveaux: DECLARED_LEVELS,
        niveauxLabels: DECLARED_LEVEL_LABEL,
        disponibilitesParDefaut: DEFAULT_AVAILABILITY,
        consentement: { titre: CONSENT_TITLE, paragraphes: CONSENT_TEXT, case: CONSENT_CHECKBOX },
        consentVersion: config.consent_version,
        voie: parseScope(id.permissionScope).voie ?? null,
        colleges: colleges.map((c) => {
          const famille = new Set(collegeFamily(c.id, all));
          return {
            id: c.id, nom: c.nom,
            items: items.filter((i) => famille.has(i.specialite_id))
              .sort((a, b) => a.nom_item.localeCompare(b.nom_item, 'fr'))
              .map((i) => ({ id: i.id, name: i.nom_item, group: i.specialite_id === c.id ? c.nom : nomDe.get(i.specialite_id) ?? '' })),
          };
        }),
      },
      textes: { reference: REFERENCE_STATEMENT, rappel: REMINDER_SHORT },
    });
  }

  await syncMasteryFromPlatform(id.userId).catch(() => 0);
  const ctx = await loadStudentContext(id.userId);
  if (!ctx) return NextResponse.json({ ouvert: true, tablesPretes: true, onboarded: false });

  const coursIds = new Map(ctx.items.map((i) => [i.id, i.cours_id]));
  const debutSemaine = addDaysKey(ctx.today, 1 - isoWeekday(ctx.today));
  const jours = Array.from({ length: 7 }, (_, i) => addDaysKey(debutSemaine, i));
  const [gen] = await listGenerations(id.userId, 1);
  const resume = (gen?.summary ?? {}) as { insufficientTime?: boolean; uncovered?: number };
  const activite = await listActivity(id.userId, { from: `${addDaysKey(ctx.today, -30)}T00:00:00Z` });
  const minutes30 = activite
    .filter((a) => a.kind === 'seance_terminee' || a.kind === 'travail_libre')
    .reduce((n, a) => n + (a.minutes ?? 0), 0);

  const prochaineSeance = new Map<string, string>();
  for (const s of ctx.sessions) {
    if (s.status === 'planifiee' && s.item_id && s.day >= ctx.today && !prochaineSeance.has(s.item_id)) {
      prochaineSeance.set(s.item_id, s.day);
    }
  }
  const insuffisants = new Set(ctx.coverage.insufficientIds);

  return NextResponse.json({
    ouvert: true,
    tablesPretes: true,
    onboarded: true,
    textes: { reference: REFERENCE_STATEMENT, rappel: REMINDER_SHORT },
    contexte: {
      today: ctx.today,
      daysLeft: ctx.daysLeft,
      college: ctx.college?.nom ?? null,
      profil: {
        availability: ctx.profile.availability,
        exam_date: ctx.profile.exam_date,
        start_date: ctx.profile.start_date,
        voie: ctx.profile.voie,
        specialite_id: ctx.profile.specialite_id,
        consent_accepted_at: ctx.profile.consent_accepted_at,
        consent_version: ctx.profile.consent_version,
      },
      aujourdhui: ctx.sessions
        .filter((s) => s.day === ctx.today && s.status !== 'annulee')
        .map((s) => vueSeance(ctx, s, coursIds)),
      semaine: {
        debut: jours[0], fin: jours[6],
        jours: jours.map((jour) => ({
          jour,
          seances: ctx.sessions
            .filter((s) => s.day === jour && s.status !== 'annulee')
            .map((s) => vueSeance(ctx, s, coursIds)),
        })),
        planned: ctx.weekExecution.planned,
        done: ctx.weekExecution.done,
        pct: ctx.weekExecution.pct,
        plannedMinutes: ctx.weekExecution.plannedMinutes,
        doneMinutes: ctx.weekExecution.doneMinutes,
      },
      couverture: {
        total: ctx.coverage.total,
        coveragePct: ctx.coverage.coveragePct,
        counts: ctx.coverage.counts,
        insufficientIds: ctx.coverage.insufficientIds,
      },
      resume: { insufficientTime: !!resume.insufficientTime, uncovered: resume.uncovered ?? 0 },
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
          priorityTier: priorite?.tier ?? 'normale',
          priorityLabel: PRIORITY_TIER_LABEL[priorite?.tier ?? 'normale'],
          priorityScore: priorite?.score ?? 0,
          raison: priorite?.reasons?.[0] ?? null,
          prochaine: prochaineSeance.get(r.item.id) ?? null,
          insuffisant: insuffisants.has(r.item.id),
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
    exam_date: DayKey,
    start_date: DayKey,
    availability: Availability,
    levels: z.record(z.string(), z.enum(DECLARED_LEVELS)),
    consent: z.literal(true, { message: 'Vous devez confirmer avoir lu l’information.' }),
  }),
  z.object({ action: z.literal('availability'), availability: Availability, exam_date: DayKey.nullable() }),
  z.object({ action: z.literal('start-session'), sessionId: z.string().uuid() }),
  z.object({ action: z.literal('complete-session'), sessionId: z.string().uuid(), actualMinutes: z.number().int().min(0).max(960).nullable() }),
  z.object({ action: z.literal('postpone-session'), sessionId: z.string().uuid() }),
  z.object({ action: z.literal('free-work'), itemId: z.string().uuid(), minutes: z.number().int().min(5).max(960) }),
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
        if (body.exam_date <= aujourdhui) {
          return NextResponse.json({ error: 'La date des épreuves doit être postérieure à aujourd’hui.' }, { status: 400 });
        }
        const config = await getConfig();
        const r = await completeOnboarding(id.userId, { ...body, consentVersion: config.consent_version });
        if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });
        return NextResponse.json({ ok: true });
      }
      case 'availability': {
        if (body.exam_date && body.exam_date <= aujourdhui) {
          return NextResponse.json({ error: 'La date des épreuves doit être postérieure à aujourd’hui.' }, { status: 400 });
        }
        await updateAvailability(id.userId, body.availability, body.exam_date);
        return NextResponse.json({ ok: true });
      }
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
