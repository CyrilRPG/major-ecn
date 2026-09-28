import { NextResponse } from 'next/server';
import { getBearerUser } from '@/lib/auth/bearer';
import { assertDeviceSlot, DEVICE_HEADER } from '@/lib/auth/device';
import { createAdminClient } from '@/lib/supabase/admin';
import { fetchAllRows } from '@/lib/supabase/fetch-all';
import { canAccessCollege, canAccessCours, parseScope } from '@/lib/auth/permissions';
import { EDN_FACULTE_ID } from '@/lib/data/faculte';
import { chargerProgressionCours } from '@/lib/progress/course-progress-data';
import { getMaintienStats, getStudiedSpecialties, loadStudentAttempts } from '@/lib/pedago/maintien';
import { sessionSizesFor } from '@/lib/pedago/status';
import { estTitreRevisions } from '@/lib/videos/revisions';
import { chargerAnnonces } from '@/lib/annonces/server';
import {
  datesAVenir, epreuvePassee, etatInscription, messageVisiblePour, specialitesDeLEleve,
} from '@/lib/annonces/concours';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/mobile/accueil?tz=<fuseau IANA> — le tableau de bord de l'accueil,
 * calculé SERVEUR, en un JSON compact.
 *
 * POURQUOI UNE ROUTE. L'accueil web s'appuie sur des fonctions serveur qu'une
 * SPA Capacitor ne peut pas rejouer sans télécharger des milliers de lignes :
 * spécialités étudiées (toutes les tentatives de l'élève), maintien des acquis,
 * priorités (formule de progression commune, catalogue complet des séries),
 * fiches concours (`chargerAnnonces`, lecture de l'administration). La route
 * réutilise EXACTEMENT ces fonctions : le téléphone affiche les mêmes chiffres
 * que le navigateur.
 *
 * JOURS EN HEURE LOCALE. `platform_time_tracking.session_date` et le RPC
 * `get_accueil_stats` sont en date UTC : une révision à 0 h 30 comptait pour la
 * veille. Ici, les jours d'activité sont calculés à partir des horodatages
 * (tentatives QCM, flashcards) dans le fuseau du téléphone (`tz`, Paris par
 * défaut). Seul le temps de connexion reste à la granularité du jour UTC (la
 * table ne stocke rien de plus fin).
 *
 * Réponse : voir `AccueilServeur` côté app (features/accueil/accueil-logic.ts).
 */

const JOURS_HISTORIQUE = 60;
/** Une journée « d'étude » : au moins une question ou une carte, ou 5 min de travail mesuré. */
const SECONDES_JOUR_ACTIF = 300;

type Scope = ReturnType<typeof parseScope>;

function fuseauValide(tz: string | null): string {
  if (!tz) return 'Europe/Paris';
  try {
    new Intl.DateTimeFormat('fr-FR', { timeZone: tz });
    return tz;
  } catch {
    return 'Europe/Paris';
  }
}

/** Ajoute n jours à une date calendaire AAAA-MM-JJ (arithmétique UTC, sans fuseau). */
function ajouterJours(iso: string, n: number): string {
  const [a, m, j] = iso.split('-').map(Number);
  return new Date(Date.UTC(a, m - 1, j + n)).toISOString().slice(0, 10);
}

/** Lundi de la semaine d'une date calendaire. */
function lundiDe(iso: string): string {
  const jour = new Date(`${iso}T00:00:00Z`).getUTCDay();
  return ajouterJours(iso, -((jour + 6) % 7));
}

export async function GET(req: Request) {
  const auth = await getBearerUser(req);
  if (!auth) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const check = await assertDeviceSlot(auth.user.id, req.headers.get(DEVICE_HEADER));
  if (!check.ok) return check.response;

  const userId = auth.user.id;
  const tz = fuseauValide(new URL(req.url).searchParams.get('tz'));
  const jourDe = (d: Date) =>
    new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = admin as any;

  const { data: profile } = await db
    .from('profiles').select('role, permission_scope').eq('id', userId).maybeSingle();
  const scope: Scope = parseScope(profile?.permission_scope);
  // Parité web : seul l'administrateur lève les restrictions de périmètre.
  const isAdmin = profile?.role === 'admin';

  const maintenant = new Date();
  const aujourdHui = jourDe(maintenant);
  const debutHistorique = ajouterJours(aujourdHui, -(JOURS_HISTORIQUE - 1));
  const lundi = lundiDe(aujourdHui);
  // Borne d'horodatage large (un jour de marge pour les fuseaux) ; le filtre
  // exact se fait ensuite sur la date locale.
  const depuisIso = new Date(maintenant.getTime() - (JOURS_HISTORIQUE + 1) * 86_400_000).toISOString();

  type MatRow = { id: string; nom: string; access_type: 'all' | 'specific' };
  type CoursRow = { id: string; titre: string; matiere_id: string; access_type: 'all' | 'specific' };
  type ProgressRow = { cours_id: string; video_watched: boolean | null; fiche_read: boolean | null };

  const [
    attempts, reviews, tempsRes, maintien, matieres, coursRaw, progressRaw, annonces, seriesRes,
  ] = await Promise.all([
    loadStudentAttempts(db, userId),
    fetchAllRows<{ reviewed_at: string }>((from, to) => db.from('flashcard_reviews')
      .select('reviewed_at, id')
      .eq('user_id', userId)
      .gte('reviewed_at', depuisIso)
      .order('reviewed_at', { ascending: true })
      .order('id', { ascending: true })
      .range(from, to)),
    db.from('platform_time_tracking')
      .select('session_date, total_seconds')
      .eq('user_id', userId)
      .gte('session_date', debutHistorique) as Promise<{ data: { session_date: string; total_seconds: number | null }[] | null }>,
    getMaintienStats(db, userId),
    fetchAllRows<MatRow>((from, to) => db.from('matieres')
      .select('id, nom, access_type, semestres!inner(faculte_id)')
      .eq('semestres.faculte_id', EDN_FACULTE_ID)
      .order('id')
      .range(from, to)),
    fetchAllRows<CoursRow>((from, to) => db.from('cours')
      .select('id, titre, matiere_id, access_type')
      .order('id')
      .range(from, to)),
    fetchAllRows<ProgressRow>((from, to) => db.from('course_progress')
      .select('cours_id, video_watched, fiche_read')
      .eq('user_id', userId)
      .order('cours_id')
      .range(from, to)),
    chargerAnnonces(db).catch(() => null),
    db.from('qcm_sessions').select('id', { count: 'exact', head: true }).eq('user_id', userId) as Promise<{ count: number | null }>,
  ]);

  /* ── Jours d'activité (fuseau du téléphone) ── */
  type Jour = { questions: number; cartes: number; secondes: number };
  const jours = new Map<string, Jour>();
  const jour = (d: string): Jour => {
    let j = jours.get(d);
    if (!j) { j = { questions: 0, cartes: 0, secondes: 0 }; jours.set(d, j); }
    return j;
  };
  for (const a of attempts) {
    if (a.attempted_at < depuisIso) continue;
    const d = jourDe(new Date(a.attempted_at));
    if (d >= debutHistorique) jour(d).questions++;
  }
  for (const r of reviews) {
    const d = jourDe(new Date(r.reviewed_at));
    if (d >= debutHistorique) jour(d).cartes++;
  }
  const temps = tempsRes.data ?? [];
  for (const t of temps) jour(t.session_date.slice(0, 10)).secondes += Math.max(0, t.total_seconds ?? 0);

  const actif = (d: string) => {
    const j = jours.get(d);
    return !!j && (j.questions + j.cartes > 0 || j.secondes >= SECONDES_JOUR_ACTIF);
  };
  // Série : jours consécutifs jusqu'à aujourd'hui ; une journée pas encore
  // travaillée ne casse pas la série avant minuit (on repart d'hier).
  let serie = 0;
  for (let d = actif(aujourdHui) ? aujourdHui : ajouterJours(aujourdHui, -1); actif(d); d = ajouterJours(d, -1)) serie++;

  const semaineSecondes = temps
    .filter((t) => t.session_date.slice(0, 10) >= lundi)
    .reduce((s, t) => s + Math.max(0, t.total_seconds ?? 0), 0);

  /* ── Spécialités étudiées & révision du jour ── */
  const studied = await getStudiedSpecialties(db, userId, scope, attempts);
  const collegesAccessibles = matieres.filter((m) => isAdmin || canAccessCollege(scope, m.id, m.access_type));
  const sizes = sessionSizesFor(studied.length);
  const estimation = sizes.daily <= 25 ? '15 minutes' : sizes.daily <= 30 ? '15 à 20 minutes' : sizes.daily <= 35 ? '20 minutes' : '20 à 25 minutes';

  /* ── Progression (formule commune) et priorités ── */
  const collegeOk = new Set(collegesAccessibles.map((m) => m.id));
  const nomCollege = new Map(matieres.map((m) => [m.id, m.nom]));
  const coursAccessibles = coursRaw
    .filter((c) => collegeOk.has(c.matiere_id))
    .filter((c) => isAdmin || canAccessCours(scope, c.matiere_id, c.id, c.access_type));
  const progressParCours = new Map(progressRaw.map((p) => [p.cours_id, p]));
  const progression = await chargerProgressionCours({
    userId,
    faculteId: EDN_FACULTE_ID,
    scope,
    staff: isAdmin,
    cours: coursAccessibles.map((c) => {
      const cp = progressParCours.get(c.id);
      return { id: c.id, course_progress: cp ? [{ video_watched: cp.video_watched, fiche_read: cp.fiche_read }] : [] };
    }),
  });

  const tentativesParCours = new Map<string, number>();
  for (const a of attempts) {
    const id = a.qcm_questions.qcm_series.cours_id;
    tentativesParCours.set(id, (tentativesParCours.get(id) ?? 0) + 1);
  }
  const scores = coursAccessibles.map((c) => ({
    id: c.id,
    titre: c.titre,
    matiere: nomCollege.get(c.matiere_id) ?? '',
    pct: progression.get(c.id)?.progression ?? 0,
    tentatives: tentativesParCours.get(c.id) ?? 0,
  }));
  // Même sélection que l'accueil web : points faibles réellement travaillés,
  // puis items non commencés des spécialités entamées, puis le reste. Les
  // replays de révisions et les annales ne se « travaillent » pas : écartés.
  const aTravailler = scores.filter((c) => !estTitreRevisions(c.titre) && !/^\s*annales\b/i.test(c.titre));
  const entamees = new Set(aTravailler.filter((c) => c.tentatives > 0).map((c) => c.matiere));
  const parPct = (a: { pct: number }, b: { pct: number }) => a.pct - b.pct;
  const priorites = [
    ...aTravailler.filter((c) => c.tentatives > 0).sort(parPct),
    ...aTravailler.filter((c) => c.tentatives === 0 && entamees.has(c.matiere)).sort(parPct),
    ...aTravailler.filter((c) => c.tentatives === 0 && !entamees.has(c.matiere)).sort(parPct),
  ].slice(0, 5).map(({ id, titre, matiere, pct }) => ({ id, titre, matiere, pct }));

  let questionsAccessibles = 0;
  let questionsFaites = 0;
  for (const p of progression.values()) {
    questionsAccessibles += p.input.questionsAccessibles;
    questionsFaites += p.input.questionsFaites;
  }

  /* ── Annonces concours de SES spécialités + messages libres ── */
  const ts = maintenant.getTime();
  let fiches: unknown[] = [];
  let messages: unknown[] = [];
  const epreuves: Record<string, string> = {};
  if (annonces) {
    const specialites = specialitesDeLEleve(scope, annonces.parentDe);
    const nomDe = new Map(annonces.specialites.map((c) => [c.id, c.nom]));
    const concernees = [...annonces.fiches.entries()]
      .filter(([id]) => specialites === null || specialites.includes(id))
      .filter(([, f]) => !epreuvePassee(f, ts));
    for (const [id, f] of concernees) if (f.date_epreuve) epreuves[id] = f.date_epreuve.slice(0, 10);
    fiches = concernees
      .sort(([, a], [, b]) => (a.date_epreuve ?? '9999').localeCompare(b.date_epreuve ?? '9999'))
      .map(([id, f]) => {
        const inscription = etatInscription(f, ts);
        return {
          id,
          nom: nomDe.get(id) ?? id,
          dateEpreuve: f.date_epreuve ? f.date_epreuve.slice(0, 10) : null,
          inscription: inscription && inscription.etat !== 'close' ? inscription : null,
          postes: { externe: f.postes_externe, interne: f.postes_interne },
          dates: datesAVenir(f, ts),
          note: f.note,
          lien: f.lien_label && f.lien_url ? { label: f.lien_label, url: f.lien_url } : null,
        };
      });
    messages = annonces.messages
      .filter((m) => m.visible && messageVisiblePour(m, scope, specialites, ts))
      .sort((a, b) => a.order_index - b.order_index)
      .map((m) => {
        const d = (m.data ?? {}) as Record<string, unknown>;
        const texte = (k: string) => (typeof d[k] === 'string' && (d[k] as string).trim() ? (d[k] as string).trim() : null);
        const ctaLabel = texte('cta_label');
        const ctaHref = texte('cta_href');
        return {
          id: m.id,
          titre: m.title,
          sousTitre: texte('subtitle'),
          badge: m.badge_label,
          corps: texte('body'),
          cta: ctaLabel && ctaHref ? { label: ctaLabel, url: ctaHref } : null,
          note: texte('footer_note'),
        };
      });
  }

  return NextResponse.json({
    v: 1,
    tz,
    aujourdHui,
    lundi,
    jours: [...jours.entries()]
      .filter(([d]) => d >= debutHistorique && d <= aujourdHui)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, j]) => ({ date, questions: j.questions, cartes: j.cartes, secondes: j.secondes, actif: actif(date) })),
    serie,
    semaineSecondes,
    objectif: { questions: sizes.daily, faitesAujourdhui: jours.get(aujourdHui)?.questions ?? 0 },
    revisionDuJour: {
      daily: sizes.daily,
      recommended: sizes.recommended,
      intensive: sizes.intensive,
      estimation,
    },
    specialites: {
      terminees: studied.filter((s) => s.isFinished).length,
      enCours: studied.filter((s) => !s.isFinished).length,
      accessibles: Math.max(0, collegesAccessibles.length - studied.length),
      validationsEnAttente: studied.filter((s) => s.awaitingValidation).map((s) => ({ id: s.matiereId, nom: s.nom })),
    },
    maintien: {
      revisions30j: maintien.revisions30d,
      joursDepuis: maintien.daysSinceLast,
      meilleureSerie: maintien.bestStreak,
    },
    priorites,
    indicateurs: {
      questionsFaites,
      questionsAccessibles,
      series: seriesRes.count ?? 0,
      itemsMaitrises: scores.filter((c) => c.pct >= 75).length,
      itemsTotal: scores.length,
    },
    annonces: { fiches, messages },
    epreuves,
  });
}
