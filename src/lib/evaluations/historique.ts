import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { fetchAllRows } from '@/lib/supabase/fetch-all-pure';
import { EDN_FACULTE_ID } from '@/lib/data/faculte';
import { parseScope, hasMedecineGeneraleAccess } from '@/lib/auth/permissions';
import { fetchContentAccessForScope } from '@/lib/auth/formula-permissions';
import { isExamTargeted, type ExamTargeting } from '@/lib/exams/targeting';
import { examWindow, type ExamScheduling } from '@/lib/exams/window';
import { checkupRecommendation } from '@/lib/checkup/server/service';
import { chargerTableauEleves } from '@/lib/suivi/eleves';
import type { SuiviActor } from '@/lib/suivi/roles';
import {
  COLONNES_VUE, filtrer, normaliser, type EvalSource, type Evaluation, type Filtres,
} from './historique-core';

/**
 * Lecture de l'historique des évaluations (vue `evaluations_historique`,
 * service-role seulement) et de son journal de traçabilité. Toujours borné à
 * la plateforme (`faculte_id`) : le projet Supabase est partagé.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = () => createAdminClient() as any;

export type Requete = Filtres & {
  userId?: string;
  promotion?: string | null;
  /** Nom, prénom ou e-mail du candidat. */
  recherche?: string | null;
};

/** Veille/lendemain d'un jour AAAA-MM-JJ : borne SQL large, la borne exacte (heure de Paris) est appliquée par `filtrer`. */
function decaler(jour: string, jours: number): string {
  const d = new Date(`${jour}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + jours);
  return d.toISOString().slice(0, 10);
}

/** Échappe une saisie pour un filtre `or()` PostgREST (virgules, parenthèses, jokers). */
function motCle(s: string): string {
  return s.replace(/[,()*%\\:"']/g, ' ').trim().slice(0, 80);
}

/** Toutes les tentatives correspondant aux filtres, de la plus récente à la plus ancienne (sans plafond de 1000 lignes). */
export async function chargerEvaluations(q: Requete): Promise<Evaluation[]> {
  const brut = await fetchAllRows<Record<string, unknown>>((from, to) => {
    let r = db().from('evaluations_historique').select(COLONNES_VUE).eq('faculte_id', EDN_FACULTE_ID);
    if (q.userId) r = r.eq('user_id', q.userId);
    if (q.du) r = r.gte('date_evaluation', decaler(q.du, -1));
    if (q.au) r = r.lt('date_evaluation', decaler(q.au, 2));
    if (q.types && q.types.length > 0) r = r.in('type', q.types);
    else if (!q.entrainement) r = r.neq('type', 'entrainement');
    if (q.specialite) r = r.eq('specialite_id', q.specialite);
    if (q.statut) r = r.eq('statut', q.statut);
    if (q.promotion) r = r.eq('promotion', q.promotion);
    const mot = q.recherche ? motCle(q.recherche) : '';
    if (mot) r = r.or(`last_name.ilike.*${mot}*,first_name.ilike.*${mot}*,email.ilike.*${mot}*`);
    return r.order('date_evaluation', { ascending: false }).order('cle', { ascending: true }).range(from, to);
  });
  return filtrer(brut.map(normaliser), q);
}

/* ─── Journal de traçabilité (administration) ─── */

export type Correction = {
  id: string; source: EvalSource; sourceId: string; champ: string;
  ancienne: unknown; nouvelle: unknown; le: string; auteur: string | null; motif: string | null;
};
export type Archive = {
  id: string; source: EvalSource; sourceId: string; raison: string; le: string; auteur: string | null; motif: string | null;
  contexte: Record<string, unknown>;
};

export async function chargerJournal(userId: string): Promise<{ corrections: Correction[]; archives: Archive[] }> {
  const [{ data: c, error: e1 }, { data: a, error: e2 }] = await Promise.all([
    db().from('evaluation_corrections')
      .select('id, source, source_id, champ, ancienne_valeur, nouvelle_valeur, corrige_le, auteur_libelle, motif')
      .eq('user_id', userId).order('corrige_le', { ascending: false }).limit(1000),
    db().from('evaluation_archives')
      .select('id, source, source_id, raison, archived_at, auteur_libelle, motif, contexte')
      .eq('user_id', userId).order('archived_at', { ascending: false }).limit(1000),
  ]);
  if (e1 || e2) throw new Error((e1 ?? e2).message);
  return {
    corrections: ((c ?? []) as Record<string, unknown>[]).map((r) => ({
      id: String(r.id), source: r.source as EvalSource, sourceId: String(r.source_id), champ: String(r.champ),
      ancienne: r.ancienne_valeur, nouvelle: r.nouvelle_valeur, le: String(r.corrige_le),
      auteur: (r.auteur_libelle as string | null) ?? null, motif: (r.motif as string | null) ?? null,
    })),
    archives: ((a ?? []) as Record<string, unknown>[]).map((r) => ({
      id: String(r.id), source: r.source as EvalSource, sourceId: String(r.source_id), raison: String(r.raison), le: String(r.archived_at),
      auteur: (r.auteur_libelle as string | null) ?? null, motif: (r.motif as string | null) ?? null,
      contexte: (r.contexte as Record<string, unknown>) ?? {},
    })),
  };
}

/* ─── Évaluations prévues non réalisées ─── */

export type Prevue = { cle: string; nature: string; intitule: string; etat: string; date: string | null; lien: string | null };

type Eleve = { id: string; role: string | null; permission_scope: unknown; promotion: string | null };

/**
 * Ce que le parcours de l'élève prévoit et qu'il n'a pas (encore) fait :
 * épreuves blanches publiées qui le ciblent, interrogations officielles de ses
 * spécialités, Check-up recommandé, niveaux ouverts du Parcours du Major.
 */
export async function chargerPrevues(eleve: Eleve, faites: Evaluation[]): Promise<Prevue[]> {
  const scope = parseScope(eleve.permission_scope);
  const now = Date.now();
  const examensFaits = new Set(faites.filter((e) => e.source === 'epreuve' && !e.archive).map((e) => e.examId));
  const parcoursFaits = new Set(faites.filter((e) => e.source === 'parcours_major').map((e) => e.numero));

  const [{ data: exams }, reco, parcoursOuvert, { data: niveaux }] = await Promise.all([
    db().from('mock_exams')
      .select('id, title, specialite_id, cours_id, status, publish_at, min_offer, target_colleges, voies, target_promos, target_user_ids, exam_mode, duration_minutes, open_at, close_at, absence_mode, rattrapage_open_at, rattrapage_close_at, results_publish_mode, results_publish_at')
      .eq('status', 'published').is('cours_id', null),
    checkupRecommendation(eleve.id).catch(() => ({ recommend: false, reason: null })),
    eleve.role === 'admin'
      ? Promise.resolve(true)
      : fetchContentAccessForScope(scope).then((a) => a.parcoursMajor && hasMedecineGeneraleAccess(eleve.permission_scope)).catch(() => false),
    db().from('major_parcours').select('numero, titre, available_at').eq('active', true).lte('available_at', new Date(now).toISOString()).order('numero'),
  ]);

  const res: Prevue[] = [];
  const matieres = await nomsMatieres();
  for (const e of (exams ?? []) as (ExamScheduling & Record<string, unknown>)[]) {
    if (examensFaits.has(String(e.id))) continue;
    if (e.specialite_id) {
      // Interrogation officielle : prévue pour les spécialités de l'élève (en fin de spécialité).
      if (scope.type === 'all' || !scope.colleges.includes(String(e.specialite_id))) continue;
      res.push({
        cle: `exam:${e.id}`, nature: 'Interrogation de spécialité',
        intitule: String(e.title ?? `Interrogation — ${matieres.get(String(e.specialite_id)) ?? ''}`),
        etat: 'À passer à la fin de la spécialité', date: null, lien: `/admin/epreuves-blanches/${e.id}/resultats`,
      });
      continue;
    }
    if (!isExamTargeted(e as ExamTargeting, scope, eleve.promotion, eleve.id)) continue;
    if (e.publish_at && Date.parse(String(e.publish_at)) > now) continue;
    const w = examWindow(e, null, now, false);
    const etat = w.reason === 'before' ? `Ouvre le ${jourHeure(w.opensAt)}`
      : w.reason === 'after' ? `Non réalisée — fermée le ${jourHeure(w.closesAt)}`
        : w.closesAt ? `Ouverte jusqu’au ${jourHeure(w.closesAt)}` : 'Ouverte (épreuve libre)';
    res.push({ cle: `exam:${e.id}`, nature: 'Épreuve blanche', intitule: String(e.title ?? 'Épreuve blanche'), etat, date: (w.opensAt ?? w.closesAt)?.toISOString() ?? null, lien: `/admin/epreuves-blanches/${e.id}/resultats` });
  }

  if (reco.recommend) {
    res.push({ cle: 'checkup', nature: 'Évaluation diagnostique', intitule: 'Nouveau EVC Check-up recommandé', etat: reco.reason ?? 'Recommandé par le moteur pédagogique', date: null, lien: null });
  }

  if (parcoursOuvert) {
    const restants = ((niveaux ?? []) as { numero: number; titre: string; available_at: string }[]).filter((p) => !parcoursFaits.has(p.numero));
    for (const p of restants) {
      res.push({ cle: `parcours:${p.numero}`, nature: 'Parcours du Major', intitule: `Niveau ${p.numero} : ${p.titre}`, etat: 'Ouvert, non réalisé', date: p.available_at, lien: null });
    }
  }
  return res;
}

function jourHeure(d: Date | null): string {
  if (!d) return '—';
  return d.toLocaleString('fr-FR', { timeZone: 'Europe/Paris', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/* ─── Périmètre de l'équipe ─── */

/**
 * Élèves qu'un membre de l'équipe du suivi peut consulter (spécialités,
 * formules, population : même règle que le tableau du suivi individuel) ;
 * null = tous (administrateur).
 */
export async function elevesVisibles(actor: SuiviActor): Promise<Set<string> | null> {
  if (actor.role === 'admin') return null;
  const t = await chargerTableauEleves(actor);
  return new Set(t.lignes.map((l) => l.id));
}

/* ─── Référentiels ─── */

/** Spécialités (collèges) de la plateforme : identifiant → nom ; un sous-collège est préfixé de son parent (« Médecine générale › Cardiologie »). */
export async function nomsMatieres(): Promise<Map<string, string>> {
  const { data } = await db().from('matieres').select('id, nom, parent_matiere_id, semestres!inner(faculte_id)').eq('semestres.faculte_id', EDN_FACULTE_ID);
  const rows = (data ?? []) as { id: string; nom: string; parent_matiere_id: string | null }[];
  const nom = new Map(rows.map((m) => [m.id, m.nom]));
  return new Map(rows.map((m) => [m.id, m.parent_matiere_id && nom.has(m.parent_matiere_id) ? `${nom.get(m.parent_matiere_id)} › ${m.nom}` : m.nom]));
}

/** Promotions présentes chez les élèves (filtre « cohorte »). */
export async function promotions(): Promise<string[]> {
  const rows = await fetchAllRows<{ promotion: string | null }>((from, to) =>
    db().from('profiles').select('promotion').eq('role', 'student').eq('faculte_id', EDN_FACULTE_ID).not('promotion', 'is', null).order('id').range(from, to));
  return [...new Set(rows.map((r) => r.promotion).filter((p): p is string => !!p && p.trim() !== ''))].sort((a, b) => b.localeCompare(a, 'fr'));
}

/** Volume d'entraînement d'un élève (questions répondues), hors évaluations. */
export async function volumeEntrainement(userId: string): Promise<{ j7: number; j30: number; total: number }> {
  const depuis = (j: number) => new Date(Date.now() - j * 86_400_000).toISOString();
  const compte = (j: number | null) => {
    let r = db().from('qcm_attempts').select('id', { count: 'exact', head: true }).eq('user_id', userId);
    if (j !== null) r = r.gte('attempted_at', depuis(j));
    return r.then((x: { count: number | null }) => x.count ?? 0);
  };
  const [j7, j30, total] = await Promise.all([compte(7), compte(30), compte(null)]);
  return { j7, j30, total };
}
