import 'server-only';
import { jourParis } from '@/lib/evc-calendrier/dates';
import { bornes, type Filtres } from '../filtres';
import { estAnalysable } from '../analyse-regles';
import {
  moyenne, moyennesParCritere, nps, serieMensuelle, tauxCommentairesNegatifs, tauxNotesDefavorables, tauxParticipation,
  tauxSatisfaction, tauxVigilance, type ReponseStat, type Taux,
} from '../indicateurs';
import { regrouper, type CommentaireRecurrence, type GroupeRecurrence } from '../recurrence';
import { actionEnRetard } from '../workflow';
import type { Critere, Famille, Sentiment, StatutAction, StatutEnvoi } from '../types';
import { lireParametres, nomComplet, qdb, toutesLesLignes, tranches } from './base';
import { chargerContextes } from './candidats';

/**
 * Chargeurs de l'espace d'administration (tableaux, statistiques, fiches).
 * Les filtres de période passent en SQL ; les autres, combinables, en mémoire.
 */

export type Reponse = ReponseStat & {
  id: string; envoi_id: string | null; famille: Famille; questionnaire_code: string | null; reponses: Record<string, unknown>;
  questions: { id: string; libelle: string; type: string }[];
  difficulte: boolean | null; demande_contact: boolean | null; recommandation: number | null; enseignant_nom: string | null;
  enseignant_cle: string | null; seance_id: string | null; mode: string | null; type_seance: string | null; colleges: string[];
  voie: string | null; formule: string | null; promotion: string | null; exam_session_id: string | null; canal: string;
};

export type Commentaire = {
  id: string; reponse_id: string | null; user_id: string | null; famille: string; question_libelle: string | null; texte: string;
  note_associee: number | null; seance_id: string | null; enseignant_nom: string | null; enseignant_cle: string | null; colleges: string[];
  voie: string | null; promotion: string | null; contenu_type: string | null; contenu_id: string | null; contenu_label: string | null;
  sentiment: Sentiment | null; sujet: string | null; categories: string[]; theme_cle: string | null; theme_libelle: string | null;
  gravite: string | null; demande_intervention: boolean; nature: string; analyse_source: string | null; corrige_at: string | null;
  reclamation_id: string | null; created_at: string;
};

const SELECT_REPONSE = 'id, envoi_id, user_id, famille, questionnaire_code, questions, reponses, note_globale, notes, note_min, difficulte, demande_contact, recommandation, seance_id, enseignant_nom, enseignant_cle, mode, type_seance, colleges, voie, formule, promotion, exam_session_id, canal, soumis_at';

function filtrerContexte<T extends { colleges?: string[]; voie?: string | null; promotion?: string | null; enseignant_cle?: string | null; seance_id?: string | null; famille?: string }>(rows: T[], f: Filtres): T[] {
  return rows.filter((r) =>
    (!f.college || (r.colleges ?? []).includes(f.college))
    && (!f.voie || r.voie === f.voie)
    && (!f.promotion || r.promotion === f.promotion)
    && (!f.enseignant || r.enseignant_cle === f.enseignant)
    && (!f.seance || r.seance_id === f.seance)
    && (!f.famille || r.famille === f.famille));
}

export async function chargerReponses(f: Filtres): Promise<Reponse[]> {
  const { depuis, jusqua } = bornes(f);
  const rows = await toutesLesLignes<Reponse>((a, b) => {
    let q = qdb().from('qualite_reponses').select(SELECT_REPONSE);
    if (depuis) q = q.gte('soumis_at', depuis);
    if (jusqua) q = q.lte('soumis_at', jusqua);
    if (f.famille) q = q.eq('famille', f.famille);
    return q.order('soumis_at', { ascending: false }).order('id').range(a, b);
  });
  return filtrerContexte(rows, f)
    .filter((r) => (!f.formule || (r.formule ?? '').split('+').includes(f.formule))
      && (!f.session || r.exam_session_id === f.session)
      && (!f.typeSeance || r.type_seance === f.typeSeance));
}

export async function chargerCommentaires(f: Filtres): Promise<Commentaire[]> {
  const { depuis, jusqua } = bornes(f);
  const rows = await toutesLesLignes<Commentaire>((a, b) => {
    let q = qdb().from('qualite_commentaires').select('*');
    if (depuis) q = q.gte('created_at', depuis);
    if (jusqua) q = q.lte('created_at', jusqua);
    if (f.famille) q = q.eq('famille', f.famille);
    if (f.sentiment) q = q.eq('sentiment', f.sentiment);
    if (f.gravite) q = q.eq('gravite', f.gravite);
    if (f.theme) q = q.eq('theme_cle', f.theme);
    return q.order('created_at', { ascending: false }).order('id').range(a, b);
  });
  const texte = f.q?.toLowerCase();
  return filtrerContexte(rows, f).filter((c) =>
    (!f.categorie || c.categories.some((x) => x === f.categorie || x.startsWith(`${f.categorie}:`)))
    && (!f.contenu || c.contenu_id === f.contenu || c.contenu_type === f.contenu)
    && (!texte || c.texte.toLowerCase().includes(texte)));
}

export type EnvoiAdmin = {
  id: string; user_id: string; famille: Famille; titre: string; statut: StatutEnvoi; obligatoire: boolean; priorite: number;
  blocking_scope: string; programme_pour: string; echeance: string | null; envoye_at: string | null; complete_at: string | null;
  neutralise_motif: string | null; dispense_motif: string | null; suspendu_jusqu_au: string | null; relances: number;
  contexte: { candidat?: { colleges?: string[]; voie?: string | null; formules?: string[]; promotion?: string | null }; seance?: { enseignant_cle?: string | null; titre?: string } };
  seance_id: string | null; exam_session_id: string | null; created_at: string;
};

export async function chargerEnvois(f: Filtres, opts: { userId?: string } = {}): Promise<EnvoiAdmin[]> {
  const { depuis, jusqua } = bornes(f);
  const rows = await toutesLesLignes<EnvoiAdmin>((a, b) => {
    let q = qdb().from('qualite_envois').select('id, user_id, famille, titre, statut, obligatoire, priorite, blocking_scope, programme_pour, echeance, envoye_at, complete_at, neutralise_motif, dispense_motif, suspendu_jusqu_au, relances, contexte, seance_id, exam_session_id, created_at');
    if (opts.userId) q = q.eq('user_id', opts.userId);
    if (depuis) q = q.gte('programme_pour', depuis);
    if (jusqua) q = q.lte('programme_pour', jusqua);
    if (f.famille) q = q.eq('famille', f.famille);
    if (f.statut) q = q.eq('statut', f.statut);
    return q.order('programme_pour', { ascending: false }).order('id').range(a, b);
  });
  return rows.filter((e) => {
    const c = e.contexte?.candidat ?? {};
    return (!f.college || (c.colleges ?? []).includes(f.college))
      && (!f.voie || c.voie === f.voie)
      && (!f.formule || (c.formules ?? []).includes(f.formule))
      && (!f.promotion || c.promotion === f.promotion)
      && (!f.session || e.exam_session_id === f.session)
      && (!f.enseignant || e.contexte?.seance?.enseignant_cle === f.enseignant)
      && (!f.seance || e.seance_id === f.seance);
  });
}

export async function nomsCandidats(ids: string[]): Promise<Map<string, { nom: string; email: string | null; promotion: string | null }>> {
  const out = new Map<string, { nom: string; email: string | null; promotion: string | null }>();
  for (const lot of tranches(Array.from(new Set(ids.filter(Boolean))))) {
    const { data } = await qdb().from('profiles').select('id, first_name, last_name, email, promotion').in('id', lot);
    for (const p of (data ?? []) as { id: string; first_name: string | null; last_name: string | null; email: string | null; promotion: string | null }[]) {
      out.set(p.id, { nom: nomComplet(p), email: p.email, promotion: p.promotion });
    }
  }
  return out;
}

export type Indicateurs = {
  participation: Taux;
  satisfaction: Taux;
  vigilance: Taux;
  defavorables: Taux;
  commentairesNegatifs: Taux;
  moyenne: { moyenne: number | null; n: number };
  criteres: Partial<Record<Critere, { moyenne: number | null; n: number }>>;
  nps: { score: number | null; n: number };
  repondants: number;
  reponses: number;
  serie: { mois: string; moyenne: number | null; n: number }[];
};

export function calculerIndicateurs(reponses: Reponse[], commentaires: Commentaire[], envois: { statut: StatutEnvoi }[]): Indicateurs {
  return {
    participation: tauxParticipation(envois),
    satisfaction: tauxSatisfaction(reponses),
    vigilance: tauxVigilance(reponses),
    defavorables: tauxNotesDefavorables(reponses),
    commentairesNegatifs: tauxCommentairesNegatifs(commentaires, estAnalysable),
    moyenne: moyenne(reponses.map((r) => r.note_globale)),
    criteres: moyennesParCritere(reponses),
    nps: nps(reponses.map((r) => r.recommandation)),
    repondants: new Set(reponses.map((r) => r.user_id).filter(Boolean)).size,
    reponses: reponses.length,
    serie: serieMensuelle(reponses),
  };
}

export async function groupesRecurrence(f: Filtres): Promise<GroupeRecurrence[]> {
  const params = await lireParametres();
  const coms = await chargerCommentaires({ ...f, sentiment: null });
  const lignes: CommentaireRecurrence[] = coms.map((c) => ({
    id: c.id, user_id: c.user_id, theme_cle: c.theme_cle, sentiment: c.sentiment, created_at: c.created_at,
    enseignant_cle: c.enseignant_cle, enseignant_nom: c.enseignant_nom, contenu_id: c.contenu_id ?? (c.contenu_label ? `label:${c.contenu_label.toLowerCase()}` : null),
    contenu_label: c.contenu_label, seance_id: c.seance_id,
  }));
  return regrouper(lignes, { now: Date.now(), seuil: params.alertes.recurrence_seuil, fenetreJours: params.alertes.recurrence_jours });
}

/** Tableau de bord (§25, §31). */
export async function vueGenerale() {
  const db = qdb();
  const depuis = new Date(Date.now() - 90 * 86_400_000).toISOString().slice(0, 10);
  const f: Filtres = { du: depuis, au: null, famille: null, college: null, voie: null, formule: null, promotion: null, session: null, enseignant: null, seance: null, typeSeance: null, contenu: null, categorie: null, theme: null, sentiment: null, gravite: null, statut: null, niveau: null, q: null };
  const [reponses, commentaires, envois, alertes, actions, reclamations, difficultes, verifs, params] = await Promise.all([
    chargerReponses(f), chargerCommentaires(f), chargerEnvois(f),
    db.from('qualite_alertes').select('id, niveau, type, titre, detail, user_id, created_at, statut').in('statut', ['nouvelle', 'en_cours']).order('created_at', { ascending: false }).limit(500),
    db.from('qualite_actions').select('id, numero, titre, statut, echeance, responsable_nom').not('statut', 'in', '(cloture,sans_suite)').order('echeance', { ascending: true, nullsFirst: false }),
    db.from('cockpit_reclamations').select('id, sujet, candidat_label, priorite, statut, created_at, origine').in('statut', ['a_traiter', 'a_analyser', 'en_cours']).order('created_at', { ascending: false }).limit(50),
    db.from('qualite_difficultes').select('id, user_id, libelle, niveau, statut, derniere_at').in('statut', ['ouverte', 'en_cours']).in('niveau', ['persistante', 'prioritaire']).order('derniere_at', { ascending: false }).limit(50),
    db.from('qualite_verifications').select('id, numero, contenu_label, statut, nature, created_at').in('statut', ['a_verifier', 'en_verification', 'decide']).order('created_at', { ascending: false }).limit(50),
    lireParametres(),
  ]);
  const ind = calculerIndicateurs(reponses, commentaires, envois);
  const parFamille = (['HOT', 'PROGRESS', 'FINAL', 'POST_EXAM', 'FOLLOW_UP', 'FUNDER_SURVEY'] as Famille[]).map((fam) => ({
    famille: fam, ...tauxParticipation(envois.filter((e) => e.famille === fam)),
  }));
  const aujourdHui = jourParis(Date.now());
  const listeActions = (actions.data ?? []) as { id: string; numero: number; titre: string; statut: StatutAction; echeance: string | null; responsable_nom: string | null }[];
  const al = (alertes.data ?? []) as { id: string; niveau: string; type: string; titre: string; detail: string | null; user_id: string | null; created_at: string; statut: string }[];
  const diffs = (difficultes.data ?? []) as { id: string; user_id: string; libelle: string; niveau: string; statut: string; derniere_at: string }[];
  const noms = await nomsCandidats([...al.map((a) => a.user_id ?? ''), ...diffs.map((d) => d.user_id)]);
  return {
    params,
    indicateurs: ind,
    parFamille,
    alertesCritiques: al.filter((a) => a.niveau === 'critique' && a.statut === 'nouvelle'),
    alertesAExaminer: al.length,
    recurrences: al.filter((a) => a.niveau === 'recurrence'),
    reclamations: (reclamations.data ?? []) as { id: string; sujet: string; candidat_label: string; priorite: string; statut: string; created_at: string; origine: string | null }[],
    actionsEnCours: listeActions,
    actionsEnRetard: listeActions.filter((a) => actionEnRetard(a, aujourdHui)),
    ameliorationsAValider: listeActions.filter((a) => a.statut === 'efficacite_a_verifier' || a.statut === 'realise'),
    candidatsAccompagnement: diffs,
    verifications: (verifs.data ?? []) as { id: string; numero: number; contenu_label: string; statut: string; nature: string; created_at: string }[],
    noms,
  };
}

export type OptionsFiltres = {
  colleges: { v: string; l: string }[];
  promotions: { v: string; l: string }[];
  enseignants: { v: string; l: string }[];
  sessions: { v: string; l: string }[];
};

/** Valeurs proposées par la barre de filtres. */
export async function optionsFiltres(): Promise<OptionsFiltres> {
  const db = qdb();
  const [{ data: mats }, profils, { data: seances }, { data: sessions }] = await Promise.all([
    db.from('matieres').select('id, nom, parent_matiere_id').like('id', 'col-%').order('nom'),
    toutesLesLignes<{ promotion: string | null }>((a, b) => db.from('profiles').select('promotion').eq('role', 'student').not('promotion', 'is', null).order('id').range(a, b)),
    db.from('qualite_seances').select('enseignant_cle, enseignant_nom').not('enseignant_cle', 'is', null),
    db.from('qualite_envois').select('exam_session_id').not('exam_session_id', 'is', null).limit(1000),
  ]);
  const ens = new Map<string, string>();
  for (const s of (seances ?? []) as { enseignant_cle: string; enseignant_nom: string | null }[]) if (!ens.has(s.enseignant_cle)) ens.set(s.enseignant_cle, s.enseignant_nom ?? s.enseignant_cle);
  return {
    colleges: ((mats ?? []) as { id: string; nom: string; parent_matiere_id: string | null }[]).filter((m) => !m.parent_matiere_id).map((m) => ({ v: m.id, l: m.nom })),
    promotions: Array.from(new Set(profils.map((p) => p.promotion as string))).sort().reverse().map((p) => ({ v: p, l: p })),
    enseignants: Array.from(ens.entries()).sort((a, b) => a[1].localeCompare(b[1])).map(([v, l]) => ({ v, l })),
    sessions: Array.from(new Set(((sessions ?? []) as { exam_session_id: string }[]).map((s) => s.exam_session_id))).sort().map((s) => ({ v: s, l: s })),
  };
}

export type LigneCandidat = {
  userId: string; nom: string; email: string | null; promotion: string | null; formules: string[]; voie: string | null; specialites: string[];
  colleges: string[]; actif: boolean; premiereEpreuve: string | null; progression: number | null; niveauSuivi: string; inactivitePalier: number;
  derniereActivite: string | null; attendus: number; completes: number; ouverts: number; derniereNote: number | null;
  difficultes: number; difficulteMax: string | null; alertes: number; enPause: boolean; sansBlocage: boolean;
};

/** Liste des candidats suivis (formules payantes) avec leurs indicateurs qualité. */
export async function listeCandidats(): Promise<LigneCandidat[]> {
  const ctxs = Array.from((await chargerContextes()).values()).filter((c) => !c.decouverte);
  const db = qdb();
  const [envois, diffs, alertes, reps] = await Promise.all([
    toutesLesLignes<{ user_id: string; statut: StatutEnvoi }>((a, b) => db.from('qualite_envois').select('user_id, statut').order('id').range(a, b)),
    toutesLesLignes<{ user_id: string; niveau: string }>((a, b) => db.from('qualite_difficultes').select('user_id, niveau').in('statut', ['ouverte', 'en_cours']).order('id').range(a, b)),
    toutesLesLignes<{ user_id: string }>((a, b) => db.from('qualite_alertes').select('user_id').in('statut', ['nouvelle', 'en_cours']).not('user_id', 'is', null).order('id').range(a, b)),
    toutesLesLignes<{ user_id: string; note_globale: number | null; soumis_at: string }>((a, b) => db.from('qualite_reponses').select('user_id, note_globale, soumis_at').not('note_globale', 'is', null).order('soumis_at', { ascending: false }).order('id').range(a, b)),
  ]);
  const grp = <T extends { user_id: string }>(l: T[]) => { const m = new Map<string, T[]>(); for (const x of l) (m.get(x.user_id) ?? m.set(x.user_id, []).get(x.user_id)!).push(x); return m; };
  const ge = grp(envois); const gd = grp(diffs); const ga = grp(alertes); const gr = grp(reps);
  const ordre = ['ponctuelle', 'persistante', 'prioritaire'];
  return ctxs.map((c) => {
    const e = ge.get(c.userId) ?? [];
    const d = gd.get(c.userId) ?? [];
    return {
      userId: c.userId, nom: nomComplet({ first_name: c.prenom, last_name: c.nom, email: c.email }), email: c.email, promotion: c.promotion,
      formules: c.formules, voie: c.voie, specialites: c.specialites, colleges: c.colleges, actif: c.actif, premiereEpreuve: c.premiereEpreuve,
      progression: c.etat.progression_pedago, niveauSuivi: c.etat.niveau_suivi, inactivitePalier: c.etat.inactivite_palier,
      derniereActivite: c.etat.derniere_activite_at,
      attendus: e.filter((x) => ['envoye', 'affiche', 'commence', 'complete', 'expire'].includes(x.statut)).length,
      completes: e.filter((x) => x.statut === 'complete').length,
      ouverts: e.filter((x) => ['envoye', 'affiche', 'commence'].includes(x.statut)).length,
      derniereNote: gr.get(c.userId)?.[0]?.note_globale ?? null,
      difficultes: d.length,
      difficulteMax: d.length ? d.map((x) => x.niveau).sort((a, b) => ordre.indexOf(b) - ordre.indexOf(a))[0] : null,
      alertes: (ga.get(c.userId) ?? []).length,
      enPause: c.enPause, sansBlocage: c.sansBlocage,
    };
  });
}

/** Fiche de suivi centralisée d'un candidat (§10, §13). */
export async function ficheCandidat(userId: string) {
  const db = qdb();
  const ctx = (await chargerContextes({ userIds: [userId] })).get(userId) ?? null;
  if (!ctx) return null;
  const { loadPlatformSnapshot } = await import('@/lib/suivi/platform');
  const [snap, presences, visionnages, evaluations, envois, reponses, commentaires, difficultes, interventions, alertes, reclamations, journal, notes] = await Promise.all([
    loadPlatformSnapshot(userId, ctx.scopeBrut).catch(() => null),
    db.from('session_presences').select('event_title, event_date, start_time, intervenant, marked_at').eq('user_id', userId).order('event_date', { ascending: false }).limit(50),
    db.from('qualite_visionnages').select('video_id, ratio_max, seuil_atteint_at, updated_at').eq('user_id', userId).order('updated_at', { ascending: false }).limit(50),
    db.from('evaluations_historique').select('cle, type, intitule, date_evaluation, score, score_max, pourcentage, statut').eq('user_id', userId).eq('archive', false).order('date_evaluation', { ascending: false }).limit(20),
    db.from('qualite_envois').select('id, famille, titre, statut, programme_pour, complete_at, neutralise_motif, dispense_motif, suspendu_jusqu_au, obligatoire').eq('user_id', userId).order('programme_pour', { ascending: false }),
    db.from('qualite_reponses').select('id, envoi_id, famille, note_globale, notes, difficulte, demande_contact, soumis_at, questions, reponses').eq('user_id', userId).order('soumis_at', { ascending: false }),
    db.from('qualite_commentaires').select('id, reponse_id, question_libelle, texte, sentiment, theme_libelle, gravite, nature, created_at').eq('user_id', userId).order('created_at', { ascending: false }),
    db.from('qualite_difficultes').select('*').eq('user_id', userId).order('derniere_at', { ascending: false }),
    db.from('qualite_interventions').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    db.from('qualite_alertes').select('id, numero, niveau, type, titre, statut, created_at, traitement').eq('user_id', userId).order('created_at', { ascending: false }).limit(50),
    db.from('cockpit_reclamations').select('id, sujet, statut, priorite, created_at, decision, cloturee_at').eq('candidat_id', userId).order('created_at', { ascending: false }),
    db.from('qualite_journal').select('id, objet_type, action, auteur_nom, details, at').eq('user_id', userId).order('at', { ascending: false }).limit(80),
    db.from('pedagogical_notes').select('id, contact_type, motif, observations, actions_recommandees, author_name, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(30),
  ]);
  const vids = ((visionnages.data ?? []) as { video_id: string }[]).map((v) => v.video_id);
  const { data: titres } = vids.length ? await db.from('videos').select('id, titre').in('id', vids) : { data: [] };
  return {
    ctx,
    snap,
    presences: (presences.data ?? []) as { event_title: string | null; event_date: string | null; start_time: string | null; intervenant: string | null; marked_at: string | null }[],
    visionnages: ((visionnages.data ?? []) as { video_id: string; ratio_max: number; seuil_atteint_at: string | null; updated_at: string }[])
      .map((v) => ({ ...v, titre: ((titres ?? []) as { id: string; titre: string }[]).find((t) => t.id === v.video_id)?.titre ?? 'Vidéo' })),
    evaluations: (evaluations.data ?? []) as { cle: string; type: string; intitule: string | null; date_evaluation: string | null; score: number | null; score_max: number | null; pourcentage: number | null; statut: string }[],
    envois: (envois.data ?? []) as { id: string; famille: string; titre: string; statut: string; programme_pour: string; complete_at: string | null; neutralise_motif: string | null; dispense_motif: string | null; suspendu_jusqu_au: string | null; obligatoire: boolean }[],
    reponses: (reponses.data ?? []) as { id: string; envoi_id: string | null; famille: string; note_globale: number | null; notes: Record<string, number>; difficulte: boolean | null; demande_contact: boolean | null; soumis_at: string; questions: { id: string; libelle: string; type: string }[]; reponses: Record<string, unknown> }[],
    commentaires: (commentaires.data ?? []) as { id: string; reponse_id: string | null; question_libelle: string | null; texte: string; sentiment: string | null; theme_libelle: string | null; gravite: string | null; nature: string; created_at: string }[],
    difficultes: (difficultes.data ?? []) as { id: string; source: string; libelle: string; detail: string | null; niveau: string; statut: string; occurrences: number; premiere_at: string; derniere_at: string }[],
    interventions: (interventions.data ?? []) as { id: string; type: string; action: string; traite_par_nom: string | null; statut: string; signale_at: string | null; prevue_le: string | null; realisee_at: string | null; resultat: string | null; retour_candidat: string | null; retour_commentaire: string | null; created_at: string; difficulte_id: string | null }[],
    alertes: (alertes.data ?? []) as { id: string; numero: number; niveau: string; type: string; titre: string; statut: string; created_at: string; traitement: string | null }[],
    reclamations: (reclamations.data ?? []) as { id: string; sujet: string; statut: string; priorite: string; created_at: string; decision: string | null; cloturee_at: string | null }[],
    journal: (journal.data ?? []) as { id: number; objet_type: string; action: string; auteur_nom: string | null; details: Record<string, unknown>; at: string }[],
    notes: (notes.data ?? []) as { id: string; contact_type: string | null; motif: string | null; observations: string | null; actions_recommandees: string | null; author_name: string | null; created_at: string }[],
  };
}
