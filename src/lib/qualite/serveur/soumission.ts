import 'server-only';
import { analyserCommentaire } from '../analyse-regles';
import { analyserReponse } from '../alertes-regles';
import { cleEnseignant } from '../indicateurs';
import { exploiterReponse } from '../reponses';
import { STATUTS_OUVERTS, type BlockingScope, type Famille, type Question, type StatutEnvoi } from '../types';
import { journaliser, lireParametres, qdb } from './base';
import { creerAlertes, envoyerAlertesCritiques } from './alertes';
import { retirerNotification } from './communication';
import { hacherJeton, jetonValideFormat } from './jetons';

/**
 * Côté candidat : lecture d'un questionnaire, brouillon, report technique et
 * soumission. Une réponse est enregistrée UNE fois (index unique sur l'envoi)
 * et n'est jamais redemandée. La soumission déclenche immédiatement l'analyse :
 * commentaires (règles), alertes, fiche de suivi.
 */

export type EnvoiCandidat = {
  id: string;
  user_id: string;
  famille: Famille;
  titre: string;
  intro: string | null;
  questions: Question[];
  statut: StatutEnvoi;
  obligatoire: boolean;
  blocking_scope: BlockingScope;
  priorite: number;
  programme_pour: string;
  echeance: string | null;
  contexte: Record<string, unknown>;
  brouillon: Record<string, unknown> | null;
  suspendu_jusqu_au: string | null;
  complete_at: string | null;
  seance_id: string | null;
  exam_session_id: string | null;
  questionnaire_code: string | null;
  questionnaire_version: number | null;
  jeton_expire_at?: string | null;
};

const SELECT = 'id, user_id, famille, titre, intro, questions, statut, obligatoire, blocking_scope, priorite, programme_pour, echeance, contexte, brouillon, suspendu_jusqu_au, complete_at, seance_id, exam_session_id, questionnaire_code, questionnaire_version, jeton_expire_at';

export async function envoiDuCandidat(userId: string, envoiId: string): Promise<EnvoiCandidat | null> {
  if (!/^[0-9a-f-]{36}$/i.test(envoiId)) return null;
  const { data } = await qdb().from('qualite_envois').select(SELECT).eq('id', envoiId).eq('user_id', userId).maybeSingle();
  return (data as EnvoiCandidat | null) ?? null;
}

export async function envoiParJeton(jeton: string): Promise<EnvoiCandidat | null> {
  if (!jetonValideFormat(jeton)) return null;
  const { data } = await qdb().from('qualite_envois').select(SELECT).eq('jeton_hash', hacherJeton(jeton)).maybeSingle();
  const e = data as EnvoiCandidat | null;
  if (!e) return null;
  if (e.jeton_expire_at && Date.parse(e.jeton_expire_at) < Date.now() && e.statut !== 'complete') return null;
  return e;
}

/** Questionnaires visibles par le candidat (à faire, puis faits). */
export async function envoisDuCandidat(userId: string): Promise<EnvoiCandidat[]> {
  const { data } = await qdb().from('qualite_envois').select(SELECT).eq('user_id', userId)
    .in('statut', ['envoye', 'affiche', 'commence', 'complete'])
    .lte('programme_pour', new Date().toISOString())
    .order('priorite', { ascending: false }).order('programme_pour', { ascending: false }).limit(100);
  return (data ?? []) as EnvoiCandidat[];
}

/** Données minimales de la garde du layout (requête indexée, très légère). */
export async function envoisOuvertsGarde(userId: string) {
  const { data } = await qdb().from('qualite_envois')
    .select('id, famille, titre, statut, obligatoire, priorite, blocking_scope, programme_pour, suspendu_jusqu_au')
    .eq('user_id', userId).in('statut', STATUTS_OUVERTS as string[]).lte('programme_pour', new Date().toISOString())
    .order('priorite', { ascending: false }).limit(20);
  return (data ?? []) as { id: string; famille: Famille; titre: string; statut: StatutEnvoi; obligatoire: boolean; priorite: number; blocking_scope: 'aucun' | 'activites' | 'pedagogie'; programme_pour: string; suspendu_jusqu_au: string | null }[];
}

export async function marquerAffiche(e: EnvoiCandidat): Promise<void> {
  if (e.statut !== 'envoye') return;
  const now = new Date().toISOString();
  const { data } = await qdb().from('qualite_envois').update({ statut: 'affiche', affiche_at: now, updated_at: now }).eq('id', e.id).eq('statut', 'envoye').select('id');
  if (data?.length) await journaliser({ objet_type: 'envoi', objet_id: e.id, action: 'affiche', user_id: e.user_id });
}

export async function enregistrerBrouillon(e: EnvoiCandidat, brut: Record<string, unknown>): Promise<{ ok: boolean; error?: string }> {
  if (!STATUTS_OUVERTS.includes(e.statut)) return { ok: false, error: 'Ce questionnaire n’est plus ouvert.' };
  const v = exploiterReponse(e.questions, brut, true);
  if (!v.ok) return { ok: false, error: 'Brouillon invalide' };
  const now = new Date().toISOString();
  const patch: Record<string, unknown> = { brouillon: v.valeur.reponses, updated_at: now };
  if (e.statut !== 'commence') { patch.statut = 'commence'; patch.commence_at = now; }
  await qdb().from('qualite_envois').update(patch).eq('id', e.id).in('statut', STATUTS_OUVERTS as string[]);
  if (e.statut !== 'commence') await journaliser({ objet_type: 'envoi', objet_id: e.id, action: 'commence', user_id: e.user_id });
  return { ok: true };
}

/** Problème technique / accessibilité signalé par le candidat : blocage levé temporairement, une fois. */
export async function reporterBlocage(e: EnvoiCandidat, motif: string): Promise<{ ok: boolean; error?: string; jusquAu?: string }> {
  const params = await lireParametres();
  if (!e.obligatoire || !STATUTS_OUVERTS.includes(e.statut)) return { ok: false, error: 'Aucun blocage à lever.' };
  const { count } = await qdb().from('qualite_journal').select('id', { count: 'exact', head: true })
    .eq('objet_type', 'envoi').eq('objet_id', e.id).eq('action', 'report_candidat');
  if ((count ?? 0) >= params.candidat.report_max) return { ok: false, error: 'Le report a déjà été utilisé pour ce questionnaire. Contactez l’équipe si le problème persiste.' };
  const jusquAu = new Date(Date.now() + params.candidat.report_technique_heures * 3_600_000).toISOString();
  await qdb().from('qualite_envois').update({ suspendu_jusqu_au: jusquAu, suspendu_motif: `Candidat : ${motif.slice(0, 300)}`, updated_at: new Date().toISOString() }).eq('id', e.id);
  await journaliser({ objet_type: 'envoi', objet_id: e.id, action: 'report_candidat', user_id: e.user_id, auteur_id: e.user_id, auteur_nom: 'Candidat', details: { motif: motif.slice(0, 300), jusquAu } });
  await creerAlertes([{
    niveau: 'vigilance', type: 'difficulte', cle: `report:${e.id}`, user_id: e.user_id,
    titre: 'Problème technique signalé sur un questionnaire', detail: `${e.titre} — « ${motif.slice(0, 200)} »`,
  }]);
  return { ok: true, jusquAu };
}

type ProfilContexte = { promotion: string | null };

export async function soumettre(e: EnvoiCandidat, brut: Record<string, unknown>, canal: 'web' | 'lien' | 'app'):
  Promise<{ ok: true } | { ok: false; error: string; erreurs?: Record<string, string> }> {
  if (e.statut === 'complete') return { ok: false, error: 'Vous avez déjà répondu à ce questionnaire. Merci !' };
  if (!(STATUTS_OUVERTS.includes(e.statut) || e.statut === 'expire')) return { ok: false, error: 'Ce questionnaire n’est plus ouvert.' };
  const v = exploiterReponse(e.questions, brut);
  if (!v.ok) return { ok: false, error: 'Certaines réponses sont requises.', erreurs: v.erreurs };
  const r = v.valeur;
  const db = qdb();
  const ctx = (e.contexte ?? {}) as { seance?: { enseignant?: string | null; enseignant_cle?: string | null; type?: string; colleges?: string[]; titre?: string }; mode?: string; candidat?: { voie?: string | null; formules?: string[]; colleges?: string[] } };
  const { data: prof } = await db.from('profiles').select('promotion').eq('id', e.user_id).maybeSingle();
  const promotion = (prof as ProfilContexte | null)?.promotion ?? null;
  const enseignantNom = ctx.seance?.enseignant ?? null;
  const enseignantCle = ctx.seance?.enseignant_cle ?? cleEnseignant(enseignantNom);
  const colleges = ctx.seance?.colleges?.length ? ctx.seance.colleges : ctx.candidat?.colleges ?? [];
  const now = new Date().toISOString();

  const { data: rep, error } = await db.from('qualite_reponses').insert({
    envoi_id: e.id, user_id: e.user_id, famille: e.famille, questionnaire_code: e.questionnaire_code, questionnaire_version: e.questionnaire_version,
    questions: e.questions, reponses: r.reponses, note_globale: r.noteGlobale, notes: r.notes, note_min: r.noteMin,
    difficulte: r.difficulte, demande_contact: r.demandeContact, recommandation: r.recommandation,
    seance_id: e.seance_id, enseignant_nom: enseignantNom, enseignant_cle: enseignantCle, mode: ctx.mode ?? null, type_seance: ctx.seance?.type ?? null,
    colleges, voie: ctx.candidat?.voie ?? null, formule: ctx.candidat?.formules?.join('+') ?? null, promotion, exam_session_id: e.exam_session_id, canal,
  }).select('id').single();
  if (error) {
    if (/duplicate|unique/i.test(error.message)) return { ok: false, error: 'Vous avez déjà répondu à ce questionnaire. Merci !' };
    return { ok: false, error: 'Enregistrement impossible, réessayez dans un instant.' };
  }
  const reponseId = (rep as { id: string }).id;
  await db.from('qualite_envois').update({ statut: 'complete', complete_at: now, brouillon: null, suspendu_jusqu_au: null, updated_at: now }).eq('id', e.id);
  await retirerNotification(e.user_id, `enquete:${e.id}`);

  // Commentaires : texte original + classification par règles (l'IA affinera).
  const analyses = r.commentaires.map((c) => analyserCommentaire(c.texte, r.noteGlobale));
  let commentaireIds: string[] = [];
  if (r.commentaires.length) {
    const { data: coms } = await db.from('qualite_commentaires').insert(r.commentaires.map((c, i) => {
      const a = analyses[i];
      return {
        reponse_id: reponseId, user_id: e.user_id, famille: e.famille, question_id: c.questionId, question_libelle: c.libelle,
        texte: c.texte, note_associee: r.noteGlobale, seance_id: e.seance_id, enseignant_nom: enseignantNom, enseignant_cle: enseignantCle,
        colleges, voie: ctx.candidat?.voie ?? null, promotion,
        contenu_type: a.contenuType, sentiment: a.sentiment, sujet: a.sujet, categories: a.categories,
        theme_cle: a.themeCle, theme_libelle: a.themeLibelle, gravite: a.gravite, demande_intervention: a.demandeIntervention,
        nature: a.nature, analyse_source: 'regles', analyse_at: now,
      };
    })).select('id');
    commentaireIds = ((coms ?? []) as { id: string }[]).map((x) => x.id);
  }

  // Alertes et difficultés.
  const { data: ouvertes } = await db.from('qualite_difficultes').select('cle_dedup, occurrences').eq('user_id', e.user_id).in('statut', ['ouverte', 'en_cours']);
  const analyse = analyserReponse({
    reponseId, famille: e.famille, titreContexte: ctx.seance?.titre ?? e.titre, exploitee: r, analyses,
    difficultesOuvertes: ((ouvertes ?? []) as { cle_dedup: string | null; occurrences: number }[]).map((d) => ({ cle: d.cle_dedup, occurrences: d.occurrences })),
  });
  const alertes = await creerAlertes(analyse.alertes.map((a) => ({
    niveau: a.niveau, type: a.type, titre: a.titre, detail: a.detail, cle: a.cle, user_id: e.user_id,
    seance_id: e.seance_id, enseignant_cle: enseignantCle, enseignant_nom: enseignantNom,
    reponse_id: reponseId, commentaire_id: a.commentaireIndex !== undefined ? commentaireIds[a.commentaireIndex] ?? null : null,
    theme_cle: a.commentaireIndex !== undefined ? analyses[a.commentaireIndex]?.themeCle ?? null : null,
    contenu_type: a.commentaireIndex !== undefined ? analyses[a.commentaireIndex]?.contenuType ?? null : null,
  })));
  for (const d of analyse.difficultes) {
    const { data: ex } = await db.from('qualite_difficultes').select('id, occurrences, niveau')
      .eq('user_id', e.user_id).eq('cle_dedup', d.cle).in('statut', ['ouverte', 'en_cours']).maybeSingle();
    if (ex) {
      const x = ex as { id: string; occurrences: number };
      await db.from('qualite_difficultes').update({ occurrences: x.occurrences + 1, niveau: d.niveau, derniere_at: now, reponse_id: reponseId, updated_at: now }).eq('id', x.id);
    } else {
      await db.from('qualite_difficultes').insert({
        user_id: e.user_id, source: 'enquete', categorie: d.categorie, libelle: d.libelle, detail: d.detail, niveau: d.niveau,
        cle_dedup: d.cle, reponse_id: reponseId, alerte_id: alertes[0]?.id ?? null,
      });
    }
  }
  if (analyse.difficultes.length) {
    const niveau = analyse.difficultes.some((d) => d.niveau === 'prioritaire') ? 'prioritaire' : analyse.difficultes.some((d) => d.niveau === 'persistante') ? 'persistant' : 'ponctuel';
    const { data: etat } = await db.from('qualite_candidats').select('niveau_suivi').eq('user_id', e.user_id).maybeSingle();
    const ordre = ['aucun', 'ponctuel', 'persistant', 'prioritaire'];
    const actuel = (etat as { niveau_suivi?: string } | null)?.niveau_suivi ?? 'aucun';
    if (ordre.indexOf(niveau) > ordre.indexOf(actuel)) {
      await db.from('qualite_candidats').upsert({ user_id: e.user_id, niveau_suivi: niveau, updated_at: now }, { onConflict: 'user_id' });
    }
  }
  // Résultat EVC déclaré (suivi différé) : distinct d'un résultat vérifié.
  if (r.resultatDeclare) {
    const { data: etat } = await db.from('qualite_candidats').select('resultat_evc_statut').eq('user_id', e.user_id).maybeSingle();
    if ((etat as { resultat_evc_statut?: string } | null)?.resultat_evc_statut !== 'verifie') {
      await db.from('qualite_candidats').upsert({ user_id: e.user_id, resultat_evc: r.resultatDeclare.slice(0, 500), resultat_evc_statut: 'declare', resultat_evc_at: now, updated_at: now }, { onConflict: 'user_id' });
    }
  }
  await journaliser({
    objet_type: 'envoi', objet_id: e.id, action: 'complete', user_id: e.user_id, auteur_id: e.user_id, auteur_nom: 'Candidat',
    details: { reponse_id: reponseId, canal, alertes: alertes.length, commentaires: commentaireIds.length, en_retard: e.statut === 'expire' },
  });
  if (alertes.some((a) => a.niveau === 'critique')) {
    try { await envoyerAlertesCritiques(); } catch (err) { console.error('[qualite] e-mail critique', err); }
  }
  return { ok: true };
}
