import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { todayFor } from '@/lib/moteur/server/today';
import { parseScope } from '@/lib/auth/permissions';
import { isExamTargeted, type ExamTargeting } from '@/lib/exams/targeting';
import { ajouterJours, evenementVisiblePourEleve, instantParis, type EvenementPlateformeBrut } from '@/lib/agenda/planning';
import { choisirConseil, CONSEIL_CLES, type Conseil, type ConseilCle, type FaitsConseil } from './conseil-core';

/**
 * Faits du « conseil du jour » (lib/student/conseil-core), lus en base en
 * parallèle : de petites requêtes (une ligne, ou un simple comptage) sur les
 * données de l'élève. Aucune configuration : tout vient de son activité.
 */
export async function chargerConseil(
  userId: string,
  opts: { permissionScope: unknown; promotion: string | null; engine: boolean; checkup: boolean; planning: boolean; parcours: boolean },
): Promise<Conseil | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- tables hors types générés
  const db = createAdminClient() as any;
  const scope = parseScope(opts.permissionScope);
  const maintenant = instantParis();
  const aujourdhui = maintenant.date;
  const depuis30 = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const compte = (q: PromiseLike<{ count: number | null; error: unknown }>) => Promise.resolve(q).then((r) => (r.error ? 0 : (r.count ?? 0))).catch(() => 0);
  const existe = (q: PromiseLike<{ data: unknown[] | null; error: unknown }>) => Promise.resolve(q).then((r) => !r.error && (r.data?.length ?? 0) > 0).catch(() => false);

  const [
    view, reperes, questions30j, erreurs, entrainementCibleFait, revisionCibleeFaite, transversalesFaites, questionsMisesDeCote, notes,
    parcoursTermines, remises, examens, exercices, checkupFait, planningCree, seances,
  ] = await Promise.all([
    opts.engine ? todayFor(userId).catch(() => null) : Promise.resolve(null),
    Promise.resolve(db.from('student_guide_marks').select('cle, first_at').eq('user_id', userId))
      .then((r: { data: { cle: string; first_at: string }[] | null }) => r.data ?? []).catch(() => [] as { cle: string; first_at: string }[]),
    compte(db.from('qcm_attempts').select('id', { count: 'exact', head: true }).eq('user_id', userId).gte('attempted_at', depuis30)),
    Promise.resolve(db.from('qcm_attempts').select('qcm_questions!inner(qcm_series!inner(cours!inner(matieres!inner(nom))))')
      .eq('user_id', userId).eq('is_correct', false).gte('attempted_at', depuis30).limit(400))
      .then((r: { data: { qcm_questions: { qcm_series: { cours: { matieres: { nom: string } } } } }[] | null }) => r.data ?? [])
      .catch(() => []),
    existe(db.from('qcm_attempts').select('id').eq('user_id', userId).eq('origin', 'entrainement_cible').limit(1)),
    existe(db.from('qcm_attempts').select('id').eq('user_id', userId).eq('origin', 'revision_ciblee').limit(1)),
    compte(db.from('transversal_sessions').select('id', { count: 'exact', head: true }).eq('user_id', userId).not('completed_at', 'is', null)),
    compte(db.from('student_saved_questions').select('question_id', { count: 'exact', head: true }).eq('user_id', userId)),
    compte(db.from('course_notes').select('id', { count: 'exact', head: true }).eq('user_id', userId)),
    opts.parcours ? compte(db.from('major_parcours_completions').select('id', { count: 'exact', head: true }).eq('user_id', userId)) : Promise.resolve(0),
    Promise.resolve(db.from('mock_exam_submissions').select('exam_id').eq('user_id', userId).in('status', ['submitted', 'graded']))
      .then((r: { data: { exam_id: string }[] | null }) => new Set((r.data ?? []).map((x) => x.exam_id))).catch(() => new Set<string>()),
    // Épreuves blanches : même lecture que la page (RLS : publiées de la faculté), même ciblage.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- colonnes de ciblage hors types générés
    createClient().then((sb) => (sb as any).from('mock_exams')
      .select('id, publish_at, min_offer, target_colleges, voies, target_promos, target_user_ids')
      .is('cours_id', null).is('specialite_id', null))
      .then((r: { data: (ExamTargeting & { id: string; publish_at: string | null })[] | null }) => (r.data ?? [])
        .filter((e) => (!e.publish_at || Date.parse(e.publish_at) <= Date.now()) && isExamTargeted(e, scope, opts.promotion, userId)))
      .catch(() => [] as { id: string }[]),
    Promise.resolve(db.from('student_exercises').select('id', { count: 'exact', head: true }).eq('user_id', userId))
      .then((r: { count: number | null; error: unknown }) => (r.error ? null : (r.count ?? 0))).catch(() => null),
    opts.checkup ? existe(db.from('checkup_sessions').select('id').eq('user_id', userId).in('status', ['completed', 'expired', 'pending_self_review']).limit(1)) : Promise.resolve(false),
    opts.planning ? existe(db.from('plan_profiles').select('user_id').eq('user_id', userId).eq('onboarding_done', true).limit(1)) : Promise.resolve(false),
    Promise.resolve(db.from('platform_events')
      .select('id, title, date, start_time, end_time, college, intervenant, zoom_url, notes, required_offers, scope_type, scope_colleges, voies')
      .gte('date', aujourdhui).lte('date', ajouterJours(aujourdhui, 7)).order('date').order('start_time').limit(40))
      .then((r: { data: EvenementPlateformeBrut[] | null }) => (r.data ?? []).filter((e) => evenementVisiblePourEleve(e, scope)))
      .catch(() => [] as EvenementPlateformeBrut[]),
  ]);

  const parCollege = new Map<string, number>();
  for (const a of erreurs) {
    const nom = a.qcm_questions?.qcm_series?.cours?.matieres?.nom;
    if (nom) parCollege.set(nom, (parCollege.get(nom) ?? 0) + 1);
  }
  const marques = new Map(reperes.map((r) => [r.cle, r.first_at]));
  const vues: Partial<Record<ConseilCle, string>> = {};
  const masques = new Set<string>();
  for (const cle of CONSEIL_CLES) {
    const vu = marques.get(`suggestion-vue:${cle}`);
    if (vu) vues[cle] = vu;
    if (marques.has(`suggestion-masquee:${cle}`)) masques.add(cle);
  }
  // Prochaine séance à venir (une séance d'aujourd'hui déjà commencée ne compte plus).
  const prochaine = seances.find((e) => e.date > aujourdhui || (e.start_time ?? '23:59') > maintenant.heure) ?? null;
  const exam = view?.ctx.examDate ?? null;

  const faits: FaitsConseil = {
    joursAvantEvc: exam ? Math.round((Date.parse(`${exam}T12:00:00Z`) - Date.parse(`${aujourdhui}T12:00:00Z`)) / 86_400_000) : null,
    ouverts: { checkup: opts.checkup, moteur: opts.engine, planning: opts.planning, parcours: opts.parcours, mesEntrainements: exercices !== null },
    checkupFait: checkupFait || !!view?.lastCheckup || !!view?.pendingCorrection,
    planningCree,
    itemsAttention: view?.attention ?? 0,
    topItem: view?.priorities[0]?.name ?? null,
    revisionCibleeFaite,
    transversalesFaites,
    questions30j,
    erreursParCollege: [...parCollege.entries()].map(([nom, n]) => ({ nom, erreurs: n })).sort((a, b) => b.erreurs - a.erreurs),
    entrainementCibleFait,
    questionsMisesDeCote,
    notes,
    parcoursTermines,
    epreuvesRemises: remises.size,
    epreuvesDisponibles: examens.filter((e) => !remises.has(e.id)).length,
    exercicesPerso: exercices ?? 0,
    prochaineSeance: prochaine ? {
      titre: prochaine.title,
      jour: new Date(`${prochaine.date}T12:00:00Z`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Paris' }),
      heure: prochaine.start_time ? prochaine.start_time.slice(0, 5).replace(':', 'h') : null,
    } : null,
    agendaOuvert: marques.has('vu:agenda'),
    prioritesOuvertes: marques.has('vu:priorites'),
  };
  return choisirConseil(faits, { aujourdhui, vues, masques });
}
