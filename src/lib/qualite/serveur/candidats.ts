import 'server-only';
import { EDN_FACULTE_ID } from '@/lib/data/faculte';
import { getAccessInfo } from '@/lib/auth/access';
import { parseScope, scopeOffers } from '@/lib/auth/permissions';
import { jourParis } from '@/lib/evc-calendrier/dates';
import { qdb, toutesLesLignes, tranches } from './base';

/**
 * Contexte d'un candidat pour le module Qualité (Learning Engine en LECTURE) :
 * identité, formule(s), voie, spécialités, période de formation, épreuves,
 * pause et aménagements. Les dates corrigées par l'administration
 * (`qualite_candidats`) priment sur les dates calculées.
 *
 *   début de formation  = correction, sinon `access_start`, sinon création du compte ;
 *   fin de formation    = correction, sinon fin d'accès effective (`access_end`,
 *                         sinon fin par défaut de la session EVC du compte),
 *                         sinon la dernière épreuve du candidat ;
 *   épreuves            = calendrier officiel `evc_calendrier` (session en cours)
 *                         des spécialités de la formule : la première et la dernière.
 */

export type ContexteCandidat = {
  userId: string;
  prenom: string | null;
  nom: string | null;
  email: string | null;
  promotion: string | null;
  formules: string[];
  /** `permission_scope` brut (progression pédagogique, droits). */
  scopeBrut: unknown;
  voie: 'interne' | 'externe' | null;
  colleges: string[];
  specialites: string[];
  decouverte: boolean;
  actif: boolean;
  expire: boolean;
  inscription: string;
  debutFormation: string | null;
  finFormation: string | null;
  premiereEpreuve: string | null;
  derniereEpreuve: string | null;
  examSessionId: string | null;
  epreuvesCorrigees: boolean;
  enPause: boolean;
  pause: { du: string | null; au: string | null; motif: string | null } | null;
  sansBlocage: boolean;
  excluRelances: boolean;
  etat: {
    progression_pedago: number | null;
    progression_calendaire: number | null;
    progression_at: string | null;
    derniere_activite_at: string | null;
    inactivite_palier: number;
    inactivite_palier_at: string | null;
    niveau_suivi: string;
    resultat_evc: string | null;
    resultat_evc_statut: string | null;
    notes: string | null;
  };
};

type Profil = {
  id: string; first_name: string | null; last_name: string | null; email: string | null; promotion: string | null;
  permission_scope: unknown; created_at: string; is_active: boolean | null; access_start: string | null; access_end: string | null;
  evc_session: { default_access_end: string } | { default_access_end: string }[] | null;
};
type EtatLigne = {
  user_id: string; debut_formation: string | null; fin_formation: string | null; premiere_epreuve: string | null; derniere_epreuve: string | null;
  exam_session_id: string | null; pause_du: string | null; pause_au: string | null; pause_motif: string | null; sans_blocage: boolean; exclu_relances: boolean;
  progression_pedago: number | null; progression_calendaire: number | null; progression_at: string | null; derniere_activite_at: string | null;
  inactivite_palier: number; inactivite_palier_at: string | null; niveau_suivi: string; resultat_evc: string | null; resultat_evc_statut: string | null; notes: string | null;
};

const SELECT_PROFIL = 'id, first_name, last_name, email, promotion, permission_scope, created_at, is_active, access_start, access_end, evc_session:evc_sessions(default_access_end)';

export async function chargerContextes(opts: { userIds?: string[]; now?: number } = {}): Promise<Map<string, ContexteCandidat>> {
  const db = qdb();
  const now = opts.now ?? Date.now();
  let profils: Profil[];
  if (opts.userIds) {
    profils = [];
    for (const lot of tranches(opts.userIds)) {
      const { data } = await db.from('profiles').select(SELECT_PROFIL).in('id', lot).eq('role', 'student');
      profils.push(...((data ?? []) as Profil[]));
    }
  } else {
    profils = await toutesLesLignes<Profil>((f, t) => db.from('profiles').select(SELECT_PROFIL)
      .eq('role', 'student').eq('faculte_id', EDN_FACULTE_ID).order('id').range(f, t));
  }
  const ids = profils.map((p) => p.id);
  const etats = new Map<string, EtatLigne>();
  const principales = new Map<string, string>();
  for (const lot of tranches(ids)) {
    const [{ data: e }, { data: pp }] = await Promise.all([
      db.from('qualite_candidats').select('*').in('user_id', lot),
      db.from('candidate_pedago_profile').select('user_id, main_specialite_id').in('user_id', lot),
    ]);
    for (const r of (e ?? []) as EtatLigne[]) etats.set(r.user_id, r);
    for (const r of (pp ?? []) as { user_id: string; main_specialite_id: string | null }[]) if (r.main_specialite_id) principales.set(r.user_id, r.main_specialite_id);
  }

  const [{ data: cal }, { data: reglages }, { data: mats }] = await Promise.all([
    db.from('evc_calendrier').select('college_id, date_epreuve, session, nom, actif'),
    db.from('evc_calendrier_sessions').select('session_en_cours').limit(1).maybeSingle(),
    db.from('matieres').select('id, nom, parent_matiere_id'),
  ]);
  const sessionEnCours = (reglages as { session_en_cours?: number } | null)?.session_en_cours ?? null;
  const epreuves = ((cal ?? []) as { college_id: string | null; date_epreuve: string | null; session: number; nom: string; actif: boolean }[])
    .filter((c) => c.actif && c.college_id && c.date_epreuve && (sessionEnCours === null || c.session === sessionEnCours));
  const parCollege = new Map(epreuves.map((c) => [c.college_id as string, c]));
  const matieres = new Map(((mats ?? []) as { id: string; nom: string; parent_matiere_id: string | null }[]).map((m) => [m.id, m]));

  const out = new Map<string, ContexteCandidat>();
  for (const p of profils) {
    const scope = parseScope(p.permission_scope);
    const formules = scopeOffers(scope);
    const decouverte = formules.every((f) => f === 'decouverte');
    const session = Array.isArray(p.evc_session) ? p.evc_session[0] : p.evc_session;
    const acces = getAccessInfo({ role: 'student', access_end: p.access_end, evc_session: session ?? null });
    let colleges = scope.type === 'college' ? scope.colleges.filter((c) => c !== 'col-decouverte') : [];
    if (scope.type === 'all' && principales.get(p.id)) colleges = [principales.get(p.id) as string];
    // Un sous-collège (MG…) porte l'épreuve de son collège parent.
    const avecParents = new Set(colleges);
    for (const c of colleges) { const par = matieres.get(c)?.parent_matiere_id; if (par) avecParents.add(par); }
    const dates = Array.from(avecParents).map((c) => parCollege.get(c)?.date_epreuve).filter((d): d is string => !!d).sort();
    const e = etats.get(p.id);
    const finCalculee = acces.accessEnd ? jourParis(Date.parse(acces.accessEnd)) : null;
    const debut = e?.debut_formation ?? (p.access_start ? jourParis(Date.parse(p.access_start)) : jourParis(Date.parse(p.created_at)));
    const aujourdHui = jourParis(now);
    const enPause = !!(e?.pause_du && e.pause_du <= aujourdHui && (!e.pause_au || e.pause_au >= aujourdHui));
    const nomsSpecialites = Array.from(new Set(colleges.map((c) => matieres.get(c)?.nom ?? c)));
    out.set(p.id, {
      userId: p.id,
      prenom: p.first_name, nom: p.last_name, email: p.email, promotion: p.promotion,
      formules, scopeBrut: p.permission_scope, voie: scope.voie ?? null, colleges, specialites: nomsSpecialites,
      decouverte,
      actif: p.is_active !== false && !acces.expired && !decouverte,
      expire: acces.expired,
      inscription: p.created_at,
      debutFormation: debut,
      // Aucun compte n'a de fin d'accès en base (10/10/2026) : la préparation s'achève
      // alors avec la dernière épreuve du calendrier officiel.
      finFormation: e?.fin_formation ?? finCalculee ?? e?.derniere_epreuve ?? dates[dates.length - 1] ?? null,
      premiereEpreuve: e?.premiere_epreuve ?? dates[0] ?? null,
      derniereEpreuve: e?.derniere_epreuve ?? dates[dates.length - 1] ?? e?.premiere_epreuve ?? null,
      examSessionId: e?.exam_session_id ?? (dates.length || e?.premiere_epreuve ? `evc-${sessionEnCours ?? (e?.premiere_epreuve ?? dates[0]).slice(0, 4)}` : null),
      epreuvesCorrigees: !!(e?.premiere_epreuve || e?.derniere_epreuve),
      enPause,
      pause: e?.pause_du ? { du: e.pause_du, au: e.pause_au, motif: e.pause_motif } : null,
      sansBlocage: !!e?.sans_blocage,
      excluRelances: !!e?.exclu_relances,
      etat: {
        progression_pedago: e?.progression_pedago ?? null,
        progression_calendaire: e?.progression_calendaire ?? null,
        progression_at: e?.progression_at ?? null,
        derniere_activite_at: e?.derniere_activite_at ?? null,
        inactivite_palier: e?.inactivite_palier ?? 0,
        inactivite_palier_at: e?.inactivite_palier_at ?? null,
        niveau_suivi: e?.niveau_suivi ?? 'aucun',
        resultat_evc: e?.resultat_evc ?? null,
        resultat_evc_statut: e?.resultat_evc_statut ?? null,
        notes: e?.notes ?? null,
      },
    });
  }
  return out;
}

/** Mise à jour (upsert) de l'état qualité d'un candidat. */
export async function majEtatCandidat(userId: string, patch: Record<string, unknown>): Promise<void> {
  const { error } = await qdb().from('qualite_candidats').upsert({ user_id: userId, ...patch, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
  if (error) console.error('[qualite] état candidat :', error.message);
}

export function libelleFormules(f: string[]): string {
  const L: Record<string, string> = { essentiel: 'Essentiel', intensif: 'Intensif', approfondi: 'Approfondi', decouverte: 'Découverte' };
  return f.map((x) => L[x] ?? x).join(' + ');
}
