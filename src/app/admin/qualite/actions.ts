'use server';

import { revalidatePath } from 'next/cache';
import { themeParCle } from '@/lib/qualite/analyse-regles';
import { mesurerEfficacite } from '@/lib/qualite/efficacite';
import { differencesParametres, normaliserParametres } from '@/lib/qualite/parametres';
import { modeleDefaut } from '@/lib/qualite/questionnaires-defaut';
import {
  CONTENUS_TYPES, GRAVITES, NATURES_COMMENTAIRE, SENTIMENTS, STATUTS_ACTION, STATUTS_ALERTE, STATUTS_DIFFICULTE,
  STATUTS_VERIFICATION, DECISIONS_VERIFICATION, NATURES_VERIFICATION, TYPES_INTERVENTION, TYPES_SEANCE, TYPES_QUESTION,
  type Question, type StatutAction,
} from '@/lib/qualite/types';
import { verifierTransition } from '@/lib/qualite/workflow';
import { journaliser, lireParametres, qdb } from '@/lib/qualite/serveur/base';
import { balayageQualite } from '@/lib/qualite/serveur/balayage';
import { majEtatCandidat } from '@/lib/qualite/serveur/candidats';
import { requireQualiteAction } from '@/lib/qualite/serveur/droits';
import { diffuser } from '@/lib/qualite/serveur/orchestration';
import { corrigerParticipation } from '@/lib/qualite/serveur/participations';
import { chargerContextes } from '@/lib/qualite/serveur/candidats';
import { surveillerInactivite } from '@/lib/qualite/serveur/surveillance';
import { cleEnseignant } from '@/lib/qualite/indicateurs';

/**
 * Actions de l'espace « Qualité & Suivi des candidats ». Chacune vérifie
 * d'abord les droits (administrateur), puis écrit en service-role et
 * journalise (qui, quand, quoi). Retour uniforme `{ ok, error?, message? }`.
 */

type R = { ok: boolean; error?: string; message?: string };
const OK = (message?: string): R => ({ ok: true, message });
const KO = (e: unknown): R => ({ ok: false, error: e instanceof Error ? e.message : String(e) });
const uuid = (s: unknown) => typeof s === 'string' && /^[0-9a-f-]{36}$/i.test(s);
const txt = (v: unknown, max = 4000) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null);
const dans = <T extends string>(liste: readonly T[], v: unknown): T | null => (typeof v === 'string' && (liste as readonly string[]).includes(v) ? (v as T) : null);
const rev = () => revalidatePath('/admin/qualite', 'layout');

/* ─────────────────────────── paramètres ─────────────────────────── */

export async function enregistrerParametresAction(json: string, motif: string): Promise<R> {
  try {
    const a = await requireQualiteAction();
    let brut: unknown;
    try { brut = JSON.parse(json); } catch { return { ok: false, error: 'Configuration illisible.' }; }
    const avant = await lireParametres();
    const apres = normaliserParametres(brut);
    // La date d'activation se pose au premier allumage : aucune enquête rétroactive.
    if (apres.actif && !avant.actif && !apres.demarrage) apres.demarrage = new Date().toISOString();
    if (apres.actif && !apres.demarrage) apres.demarrage = avant.demarrage ?? new Date().toISOString();
    const diffs = differencesParametres(avant, apres);
    if (!diffs.length) return OK('Aucune modification.');
    const db = qdb();
    const { error } = await db.from('qualite_parametres').upsert({ id: 1, config: apres, updated_by: a.id, updated_at: new Date().toISOString() });
    if (error) throw new Error(error.message);
    await db.from('qualite_parametres_historique').insert({ avant, apres, auteur_id: a.id, auteur_nom: a.nom, motif: txt(motif, 500) });
    await journaliser({ objet_type: 'parametres', action: 'modification', auteur_id: a.id, auteur_nom: a.nom, details: { differences: diffs, motif: txt(motif, 500) } });
    rev();
    return OK(`${diffs.length} paramètre(s) modifié(s).`);
  } catch (e) { return KO(e); }
}

export async function simulerInactiviteAction(): Promise<R & { lignes?: { action: string; n: number }[] }> {
  try {
    await requireQualiteAction();
    const params = await lireParametres();
    const b = await surveillerInactivite(params, { simuler: true });
    const parAction = new Map<string, number>();
    for (const s of b.simulation ?? []) parAction.set(s.action, (parAction.get(s.action) ?? 0) + 1);
    return { ok: true, lignes: Array.from(parAction.entries()).map(([action, n]) => ({ action, n })), message: `${b.evalues} candidats évalués.` };
  } catch (e) { return KO(e); }
}

export async function lancerBalayageAction(): Promise<R> {
  try {
    const a = await requireQualiteAction();
    const bilan = await balayageQualite();
    await journaliser({ objet_type: 'balayage', action: 'lancement_manuel', auteur_id: a.id, auteur_nom: a.nom });
    rev();
    const o = bilan.orchestration as { crees?: number; actives?: number } | undefined;
    return OK(bilan.actif === false ? 'Module éteint : seules les séances ont été synchronisées.' : `Passage effectué${o ? ` : ${o.crees ?? 0} questionnaire(s) créé(s), ${o.actives ?? 0} activé(s)` : ''}.`);
  } catch (e) { return KO(e); }
}

/* ─────────────────────────── questionnaires ─────────────────────────── */

function validerQuestions(brut: unknown): Question[] {
  if (!Array.isArray(brut) || !brut.length) throw new Error('Au moins une question est requise.');
  const ids = new Set<string>();
  return brut.map((q, i) => {
    const o = q as Record<string, unknown>;
    const id = txt(o.id, 60);
    if (!id || !/^[a-z0-9_]+$/.test(id)) throw new Error(`Question ${i + 1} : identifiant invalide (minuscules, chiffres, _).`);
    if (ids.has(id)) throw new Error(`Identifiant en double : ${id}`);
    ids.add(id);
    const type = dans(TYPES_QUESTION, o.type);
    if (!type) throw new Error(`Question ${id} : type inconnu.`);
    const libelle = txt(o.libelle, 500);
    if (!libelle) throw new Error(`Question ${id} : libellé requis.`);
    const options = Array.isArray(o.options) ? o.options.map((x) => String(x).trim()).filter(Boolean).slice(0, 30) : undefined;
    if ((type === 'choix_multiple' || type === 'choix_unique') && !options?.length) throw new Error(`Question ${id} : options requises.`);
    return {
      id, libelle, type, obligatoire: !!o.obligatoire,
      ...(txt(o.aide, 300) ? { aide: txt(o.aide, 300) as string } : {}),
      ...(options ? { options } : {}),
      ...(typeof o.critere === 'string' && o.critere ? { critere: o.critere as Question['critere'] } : {}),
      ...(typeof o.role === 'string' && o.role ? { role: o.role as Question['role'] } : {}),
      ...(txt(o.siQuestion, 60) ? { siQuestion: txt(o.siQuestion, 60) as string, siValeur: txt(o.siValeur, 200) ?? 'true' } : {}),
    };
  });
}

export async function majQuestionnaireAction(id: string, donnees: { titre: string; intro: string; questions: string; actif: boolean }): Promise<R> {
  try {
    const a = await requireQualiteAction();
    if (!uuid(id)) throw new Error('Questionnaire inconnu');
    const titre = txt(donnees.titre, 200);
    if (!titre) throw new Error('Titre requis.');
    let qs: unknown;
    try { qs = JSON.parse(donnees.questions); } catch { throw new Error('Questions : JSON illisible.'); }
    const questions = validerQuestions(qs);
    const db = qdb();
    const { data: cur } = await db.from('qualite_questionnaires').select('version, code').eq('id', id).single();
    const version = ((cur as { version: number }).version ?? 1) + 1;
    const { error } = await db.from('qualite_questionnaires').update({ titre, intro: txt(donnees.intro, 2000), questions, actif: !!donnees.actif, version, updated_by: a.id, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) throw new Error(error.message);
    await db.from('qualite_questionnaires_versions').insert({ questionnaire_id: id, version, titre, intro: txt(donnees.intro, 2000), questions, auteur_id: a.id });
    await journaliser({ objet_type: 'questionnaire', objet_id: id, action: 'nouvelle_version', auteur_id: a.id, auteur_nom: a.nom, details: { version, code: (cur as { code: string }).code } });
    rev();
    return OK(`Version ${version} enregistrée. Les questionnaires déjà envoyés gardent leur version.`);
  } catch (e) { return KO(e); }
}

export async function retablirQuestionnaireAction(id: string, code: string): Promise<R> {
  const m = modeleDefaut(code);
  if (!m) return { ok: false, error: 'Aucun modèle d’origine pour ce questionnaire.' };
  return majQuestionnaireAction(id, { titre: m.titre, intro: m.intro, questions: JSON.stringify(m.questions), actif: true });
}

/* ─────────────────────────── envois ─────────────────────────── */

async function majEnvoi(id: string, patch: Record<string, unknown>, action: string, details: Record<string, unknown>, statutsPermis?: string[]): Promise<R> {
  const a = await requireQualiteAction();
  if (!uuid(id)) throw new Error('Envoi inconnu');
  const db = qdb();
  let q = db.from('qualite_envois').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id);
  if (statutsPermis) q = q.in('statut', statutsPermis);
  const { data, error } = await q.select('id, user_id');
  if (error) throw new Error(error.message);
  if (!data?.length) throw new Error('Ce questionnaire n’est plus dans un état modifiable.');
  const userId = (data[0] as { user_id: string }).user_id;
  if (patch.statut === 'dispense' || patch.statut === 'neutralise') {
    await db.from('pedago_notifications').update({ dismissed_at: new Date().toISOString() }).eq('user_id', userId).eq('group_key', `enquete:${id}`);
  }
  await journaliser({ objet_type: 'envoi', objet_id: id, action, user_id: userId, auteur_id: a.id, auteur_nom: a.nom, details });
  rev();
  return OK();
}

const OUVERTS = ['programme', 'envoye', 'affiche', 'commence'];

export async function dispenserEnvoiAction(id: string, d: Record<string, string>): Promise<R> {
  try {
    const motif = txt(d.motif, 500);
    if (!motif) throw new Error('Motif requis.');
    const a = await requireQualiteAction();
    return await majEnvoi(id, { statut: 'dispense', dispense_at: new Date().toISOString(), dispense_motif: motif, dispense_par: a.id }, 'dispense', { motif }, OUVERTS);
  } catch (e) { return KO(e); }
}

export async function suspendreEnvoiAction(id: string, d: Record<string, string>): Promise<R> {
  try {
    const motif = txt(d.motif, 500);
    const jusqu = d.jusqu_au ? new Date(d.jusqu_au) : null;
    if (!motif || !jusqu || Number.isNaN(jusqu.getTime())) throw new Error('Motif et date de fin requis.');
    const a = await requireQualiteAction();
    return await majEnvoi(id, { suspendu_jusqu_au: jusqu.toISOString(), suspendu_motif: motif, suspendu_par: a.id }, 'suspension_temporaire', { motif, jusqu_au: jusqu.toISOString() }, OUVERTS);
  } catch (e) { return KO(e); }
}

export async function neutraliserEnvoiAction(id: string, d: Record<string, string>): Promise<R> {
  try {
    const motif = txt(d.motif, 500);
    if (!motif) throw new Error('Motif requis.');
    return await majEnvoi(id, { statut: 'neutralise', neutralise_at: new Date().toISOString(), neutralise_motif: `Administration : ${motif}` }, 'neutralise', { motif }, OUVERTS);
  } catch (e) { return KO(e); }
}

export async function renvoyerEnvoiAction(id: string): Promise<R> {
  try {
    const a = await requireQualiteAction();
    const db = qdb();
    const { data } = await db.from('qualite_envois').select('id, user_id, famille, titre, statut, relances').eq('id', id).single();
    const e = data as { id: string; user_id: string; famille: 'HOT'; titre: string; statut: string; relances: number } | null;
    if (!e || !['envoye', 'affiche', 'commence'].includes(e.statut)) throw new Error('Seul un questionnaire en attente peut être renvoyé.');
    const ctx = (await chargerContextes({ userIds: [e.user_id] })).get(e.user_id);
    const relances = e.relances + 1;
    await db.from('qualite_envois').update({ relances, derniere_relance_at: new Date().toISOString() }).eq('id', id);
    const emailOk = await diffuser({ ...e, relances }, ctx, await lireParametres());
    await journaliser({ objet_type: 'envoi', objet_id: id, action: 'relance_manuelle', user_id: e.user_id, auteur_id: a.id, auteur_nom: a.nom, details: { email: emailOk } });
    rev();
    return OK(emailOk ? 'Relance envoyée (notification + e-mail).' : 'Notification envoyée.');
  } catch (e) { return KO(e); }
}

/* ─────────────────────────── alertes ─────────────────────────── */

export async function traiterAlerteAction(id: string, d: Record<string, string>): Promise<R> {
  try {
    const a = await requireQualiteAction();
    const statut = dans(STATUTS_ALERTE, d.statut);
    if (!statut || !uuid(id)) throw new Error('Statut inconnu.');
    const traitement = txt(d.traitement, 2000);
    if ((statut === 'traitee' || statut === 'classee') && !traitement) throw new Error('Décrivez le traitement ou le motif du classement.');
    const now = new Date().toISOString();
    const patch: Record<string, unknown> = { statut, updated_at: now };
    if (traitement) patch.traitement = traitement;
    if (statut === 'traitee' || statut === 'classee') { patch.traitee_par = a.id; patch.traitee_at = now; }
    if (statut === 'en_cours') patch.responsable_id = a.id;
    const { data, error } = await qdb().from('qualite_alertes').update(patch).eq('id', id).select('user_id');
    if (error) throw new Error(error.message);
    await journaliser({ objet_type: 'alerte', objet_id: id, action: `statut_${statut}`, user_id: (data?.[0] as { user_id?: string } | undefined)?.user_id ?? null, auteur_id: a.id, auteur_nom: a.nom, details: { traitement } });
    rev();
    return OK();
  } catch (e) { return KO(e); }
}

/* ─────────────────────────── commentaires ─────────────────────────── */

export async function corrigerCommentaireAction(id: string, d: Record<string, string>): Promise<R> {
  try {
    const a = await requireQualiteAction();
    if (!uuid(id)) throw new Error('Commentaire inconnu');
    const theme = d.theme_cle ? themeParCle(d.theme_cle) : null;
    const patch: Record<string, unknown> = {
      sentiment: dans(SENTIMENTS, d.sentiment),
      gravite: dans(GRAVITES, d.gravite),
      nature: dans(NATURES_COMMENTAIRE, d.nature) ?? 'remarque',
      theme_cle: theme?.cle ?? null,
      theme_libelle: theme?.libelle ?? null,
      contenu_type: dans(CONTENUS_TYPES, d.contenu_type),
      contenu_id: txt(d.contenu_id, 200),
      contenu_label: txt(d.contenu_label, 300),
      categories: (d.categories ?? '').split(',').map((x) => x.trim()).filter((x) => /^[a-z_]+(:[a-z_]+)?$/.test(x)).slice(0, 5),
      analyse_source: 'manuel', corrige_par: a.id, corrige_at: new Date().toISOString(),
    };
    if (theme && !(patch.categories as string[]).includes(theme.categorie)) (patch.categories as string[]).unshift(theme.categorie);
    const db = qdb();
    const { data: avant } = await db.from('qualite_commentaires').select('sentiment, theme_cle, gravite, nature, categories, contenu_type, contenu_label').eq('id', id).single();
    const { error } = await db.from('qualite_commentaires').update(patch).eq('id', id);
    if (error) throw new Error(error.message);
    await journaliser({ objet_type: 'commentaire', objet_id: id, action: 'classification_corrigee', auteur_id: a.id, auteur_nom: a.nom, details: { avant, apres: patch } });
    rev();
    return OK('Classification corrigée (le texte original est inchangé).');
  } catch (e) { return KO(e); }
}

const CATEGORIE_RECLAMATION: Record<string, string> = {
  enseignants: 'pedagogie', contenus: 'contenu', entrainements: 'contenu', plateforme: 'technique', organisation: 'service',
  accompagnement: 'service', formation: 'autre', reclamations: 'autre',
};

/** Requalifie une remarque en réclamation formelle (§22) : registre unique partagé avec le cockpit. */
export async function requalifierReclamationAction(commentaireId: string, d: Record<string, string>): Promise<R> {
  try {
    const a = await requireQualiteAction();
    const db = qdb();
    const { data } = await db.from('qualite_commentaires').select('id, user_id, texte, categories, reponse_id, reclamation_id, colleges').eq('id', commentaireId).single();
    const c = data as { id: string; user_id: string | null; texte: string; categories: string[]; reponse_id: string | null; reclamation_id: string | null; colleges: string[] } | null;
    if (!c) throw new Error('Commentaire introuvable');
    if (c.reclamation_id) throw new Error('Déjà requalifié en réclamation.');
    const { data: p } = c.user_id ? await db.from('profiles').select('first_name, last_name, email').eq('id', c.user_id).maybeSingle() : { data: null };
    const pr = p as { first_name: string | null; last_name: string | null; email: string | null } | null;
    const label = pr ? `${pr.first_name ?? ''} ${pr.last_name ?? ''}`.trim() || pr.email || 'Candidat' : 'Candidat supprimé';
    const cat = CATEGORIE_RECLAMATION[(c.categories[0] ?? '').split(':')[0]] ?? 'autre';
    const { data: rec, error } = await db.from('cockpit_reclamations').insert({
      created_by: a.id, candidat_id: c.user_id, candidat_label: label.slice(0, 200), specialite: c.colleges?.[0] ?? null,
      categorie: cat, type_probleme: 'individuel', sujet: txt(d.sujet, 300) ?? c.texte.slice(0, 120), description: c.texte,
      canal: 'messagerie', priorite: ['basse', 'normale', 'haute', 'urgente'].includes(d.priorite) ? d.priorite : 'normale',
      statut: 'a_traiter', origine: 'qualite', commentaire_id: c.id, reponse_id: c.reponse_id, motif: txt(d.motif, 1000),
      assignee_id: a.id,
    }).select('id').single();
    if (error) throw new Error(error.message);
    const recId = (rec as { id: string }).id;
    await db.from('qualite_commentaires').update({ nature: 'reclamation', reclamation_id: recId, corrige_par: a.id, corrige_at: new Date().toISOString() }).eq('id', c.id);
    await db.from('qualite_liens').insert({ de_type: 'reclamation', de_id: recId, vers_type: 'commentaire', vers_id: c.id, created_by: a.id });
    await journaliser({ objet_type: 'reclamation', objet_id: recId, action: 'creee_depuis_remarque', user_id: c.user_id, auteur_id: a.id, auteur_nom: a.nom, details: { commentaire_id: c.id } });
    rev();
    return OK('Réclamation créée.');
  } catch (e) { return KO(e); }
}

/* ─────────────────────────── réclamations ─────────────────────────── */

export async function majReclamationAction(id: string, d: Record<string, string>): Promise<R> {
  try {
    const a = await requireQualiteAction();
    if (!uuid(id)) throw new Error('Réclamation inconnue');
    const now = new Date().toISOString();
    const patch: Record<string, unknown> = { updated_at: now };
    if (['a_traiter', 'a_analyser', 'en_cours', 'resolu', 'cloturee'].includes(d.statut)) patch.statut = d.statut;
    if (['basse', 'normale', 'haute', 'urgente'].includes(d.priorite)) patch.priorite = d.priorite;
    if (txt(d.decision)) patch.decision = txt(d.decision);
    if (txt(d.motif)) patch.motif = txt(d.motif, 1000);
    if (patch.statut === 'resolu') patch.resolue_at = now;
    if (patch.statut === 'cloturee') {
      if (!patch.decision) {
        const { data } = await qdb().from('cockpit_reclamations').select('decision').eq('id', id).single();
        if (!(data as { decision?: string | null })?.decision) throw new Error('Renseignez la décision ou la solution avant de clôturer.');
      }
      patch.cloturee_at = now;
    }
    const { data, error } = await qdb().from('cockpit_reclamations').update(patch).eq('id', id).select('candidat_id');
    if (error) throw new Error(error.message);
    await journaliser({ objet_type: 'reclamation', objet_id: id, action: 'mise_a_jour', user_id: (data?.[0] as { candidat_id?: string } | undefined)?.candidat_id ?? null, auteur_id: a.id, auteur_nom: a.nom, details: patch });
    rev();
    return OK();
  } catch (e) { return KO(e); }
}

/** Historique des échanges d'une réclamation : note datée et signée (journal inaltérable). */
export async function noterReclamationAction(id: string, d: Record<string, string>): Promise<R> {
  try {
    const a = await requireQualiteAction();
    const texte = txt(d.texte);
    if (!uuid(id) || !texte) throw new Error('Texte requis.');
    const canal = txt(d.canal, 40);
    await journaliser({ objet_type: 'reclamation', objet_id: id, action: 'echange', auteur_id: a.id, auteur_nom: a.nom, details: { texte, canal } });
    rev();
    return OK();
  } catch (e) { return KO(e); }
}

export async function creerReclamationAction(d: Record<string, string>): Promise<R> {
  try {
    const a = await requireQualiteAction();
    const sujet = txt(d.sujet, 300);
    if (!sujet) throw new Error('Sujet requis.');
    let candidatId: string | null = null;
    let label = txt(d.candidat, 200) ?? 'Candidat';
    if (d.candidat && d.candidat.includes('@')) {
      const { data } = await qdb().from('profiles').select('id, first_name, last_name').eq('email', d.candidat.trim().toLowerCase()).maybeSingle();
      const p = data as { id: string; first_name: string | null; last_name: string | null } | null;
      if (p) { candidatId = p.id; label = `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || label; }
    }
    const { data, error } = await qdb().from('cockpit_reclamations').insert({
      created_by: a.id, candidat_id: candidatId, candidat_label: label, sujet, description: txt(d.description), motif: txt(d.motif, 1000),
      categorie: ['fonctionnalite', 'contenu', 'pedagogie', 'technique', 'service', 'facturation', 'autre'].includes(d.categorie) ? d.categorie : 'autre',
      canal: ['telephone', 'email', 'messagerie', 'courrier', 'autre'].includes(d.canal) ? d.canal : 'autre',
      priorite: ['basse', 'normale', 'haute', 'urgente'].includes(d.priorite) ? d.priorite : 'normale',
      statut: 'a_traiter', origine: 'qualite', assignee_id: a.id,
    }).select('id').single();
    if (error) throw new Error(error.message);
    await journaliser({ objet_type: 'reclamation', objet_id: (data as { id: string }).id, action: 'creee', user_id: candidatId, auteur_id: a.id, auteur_nom: a.nom });
    rev();
    return OK('Réclamation enregistrée.');
  } catch (e) { return KO(e); }
}

/* ─────────────────────────── actions correctives ─────────────────────────── */

export async function creerActionAction(d: Record<string, string>): Promise<R & { id?: string }> {
  try {
    const a = await requireQualiteAction();
    const titre = txt(d.titre, 300);
    const probleme = txt(d.probleme);
    if (!titre || !probleme) throw new Error('Titre et problème constaté requis.');
    const cible = ['enseignant', 'seance', 'contenu', 'theme', 'plateforme', 'organisation', 'global'].includes(d.cible_type) ? d.cible_type : 'global';
    const db = qdb();
    const { data, error } = await db.from('qualite_actions').insert({
      titre, probleme, cible_type: cible, cible_cle: txt(d.cible_cle, 200), cible_label: txt(d.cible_label, 300),
      theme_cle: themeParCle(d.theme_cle)?.cle ?? null, echeance: /^\d{4}-\d{2}-\d{2}$/.test(d.echeance ?? '') ? d.echeance : null, created_by: a.id,
    }).select('id, numero').single();
    if (error) throw new Error(error.message);
    const act = data as { id: string; numero: number };
    const liens: { de_type: string; de_id: string; vers_type: string; vers_id: string; created_by: string }[] = [];
    for (const [cle, type] of [['alerte_id', 'alerte'], ['commentaire_id', 'commentaire'], ['reclamation_id', 'reclamation']] as const) {
      if (uuid(d[cle])) liens.push({ de_type: 'action', de_id: act.id, vers_type: type, vers_id: d[cle], created_by: a.id });
    }
    for (const id of (d.commentaires ?? '').split(',').filter(uuid)) liens.push({ de_type: 'action', de_id: act.id, vers_type: 'commentaire', vers_id: id, created_by: a.id });
    if (liens.length) await db.from('qualite_liens').upsert(liens, { onConflict: 'de_type,de_id,vers_type,vers_id', ignoreDuplicates: true });
    if (uuid(d.alerte_id)) await db.from('qualite_alertes').update({ action_id: act.id, statut: 'en_cours', updated_at: new Date().toISOString() }).eq('id', d.alerte_id);
    if (uuid(d.reclamation_id)) await db.from('cockpit_reclamations').update({ qualite_action_id: act.id }).eq('id', d.reclamation_id);
    await journaliser({ objet_type: 'action', objet_id: act.id, action: 'creee', auteur_id: a.id, auteur_nom: a.nom, details: { numero: act.numero, liens: liens.length } });
    rev();
    return { ok: true, id: act.id, message: `Action n° ${act.numero} créée.` };
  } catch (e) { return KO(e); }
}

export async function majActionAction(id: string, d: Record<string, string>): Promise<R> {
  try {
    const a = await requireQualiteAction();
    if (!uuid(id)) throw new Error('Action inconnue');
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    for (const k of ['titre', 'probleme', 'cause', 'action_decidee', 'efficacite_constat', 'cible_label'] as const) if (k in d) patch[k] = txt(d[k]);
    if ('echeance' in d) patch.echeance = /^\d{4}-\d{2}-\d{2}$/.test(d.echeance) ? d.echeance : null;
    if ('responsable_id' in d) {
      if (uuid(d.responsable_id)) {
        const { data } = await qdb().from('profiles').select('first_name, last_name, email').eq('id', d.responsable_id).maybeSingle();
        const p = data as { first_name: string | null; last_name: string | null; email: string | null } | null;
        patch.responsable_id = d.responsable_id;
        patch.responsable_nom = p ? `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || p.email : null;
      } else { patch.responsable_id = null; patch.responsable_nom = txt(d.responsable_nom, 200); }
    }
    if ('date_reference' in d) patch.date_reference = d.date_reference ? new Date(d.date_reference).toISOString() : null;
    const { error } = await qdb().from('qualite_actions').update(patch).eq('id', id);
    if (error) throw new Error(error.message);
    await journaliser({ objet_type: 'action', objet_id: id, action: 'mise_a_jour', auteur_id: a.id, auteur_nom: a.nom, details: patch });
    rev();
    return OK('Enregistré.');
  } catch (e) { return KO(e); }
}

export async function transitionActionAction(id: string, vers: string, d: Record<string, string>): Promise<R> {
  try {
    const a = await requireQualiteAction();
    const db = qdb();
    const { data } = await db.from('qualite_actions').select('*').eq('id', id).single();
    const act = data as { statut: StatutAction; cause: string | null; action_decidee: string | null; responsable_id: string | null; responsable_nom: string | null; echeance: string | null; efficacite_constat: string | null; date_reference: string | null } | null;
    if (!act) throw new Error('Action introuvable');
    const cible = dans(STATUTS_ACTION, vers);
    if (!cible) throw new Error('Statut inconnu');
    const champs = {
      cause: act.cause, action_decidee: act.action_decidee, responsable_id: act.responsable_id ?? (act.responsable_nom ? 'nom' : null), echeance: act.echeance,
      efficacite_constat: txt(d.efficacite_constat) ?? act.efficacite_constat, justification_sans_suite: txt(d.justification_sans_suite),
    };
    const err = verifierTransition(act.statut, cible, champs);
    if (err) throw new Error(err);
    const now = new Date().toISOString();
    const patch: Record<string, unknown> = { statut: cible, updated_at: now };
    if (cible === 'realise') { patch.realisee_at = now; if (!act.date_reference) patch.date_reference = now; }
    if (cible === 'sans_suite') patch.justification_sans_suite = champs.justification_sans_suite;
    if (cible === 'cloture') {
      patch.cloture_par = a.id; patch.cloture_at = now; patch.efficacite_constat = champs.efficacite_constat;
      patch.efficace = d.efficace === 'oui' ? true : d.efficace === 'non' ? false : null;
    }
    const { error } = await db.from('qualite_actions').update(patch).eq('id', id).eq('statut', act.statut);
    if (error) throw new Error(error.message);
    if (cible === 'cloture' || cible === 'sans_suite') {
      const { data: liens } = await db.from('qualite_liens').select('vers_id').eq('de_type', 'action').eq('de_id', id).eq('vers_type', 'alerte');
      const ids = ((liens ?? []) as { vers_id: string }[]).map((l) => l.vers_id);
      if (ids.length) await db.from('qualite_alertes').update({ statut: 'traitee', traitee_par: a.id, traitee_at: now, traitement: `Action corrective ${cible === 'cloture' ? 'clôturée' : 'classée sans suite'}` }).in('id', ids).in('statut', ['nouvelle', 'en_cours']);
    }
    await journaliser({ objet_type: 'action', objet_id: id, action: `statut_${cible}`, auteur_id: a.id, auteur_nom: a.nom, details: { de: act.statut, vers: cible, ...(champs.justification_sans_suite ? { justification: champs.justification_sans_suite } : {}) } });
    rev();
    return OK();
  } catch (e) { return KO(e); }
}

/** Mesure avant / après (§24) : enregistrée sur l'action, la clôture reste humaine. */
export async function mesurerActionAction(id: string): Promise<R> {
  try {
    const a = await requireQualiteAction();
    const db = qdb();
    const { data } = await db.from('qualite_actions').select('*').eq('id', id).single();
    const act = data as { cible_type: string; cible_cle: string | null; theme_cle: string | null; date_reference: string | null; realisee_at: string | null } | null;
    if (!act) throw new Error('Action introuvable');
    const ref = act.date_reference ?? act.realisee_at;
    if (!ref) throw new Error('Indiquez la date de référence (réalisation de l’action) avant de mesurer.');
    const debut = new Date(Date.parse(ref) - 120 * 86_400_000).toISOString();
    let qr = db.from('qualite_reponses').select('soumis_at, note_globale, user_id').gte('soumis_at', debut).limit(5000);
    let qc = db.from('qualite_commentaires').select('created_at, theme_cle, sentiment, user_id').gte('created_at', debut).limit(5000);
    if (act.cible_type === 'enseignant' && act.cible_cle) { qr = qr.eq('enseignant_cle', act.cible_cle); qc = qc.eq('enseignant_cle', act.cible_cle); }
    if (act.cible_type === 'seance' && act.cible_cle) { qr = qr.eq('seance_id', act.cible_cle); qc = qc.eq('seance_id', act.cible_cle); }
    if (act.cible_type === 'contenu' && act.cible_cle) { qc = qc.eq('contenu_id', act.cible_cle); }
    const [{ data: reps }, { data: coms }] = await Promise.all([qr, qc]);
    const m = mesurerEfficacite({
      dateReference: ref, fenetreJours: 60, now: Date.now(),
      reponses: (reps ?? []) as { soumis_at: string; note_globale: number | null; user_id: string | null }[],
      commentaires: (coms ?? []) as { created_at: string; theme_cle: string | null; sentiment: string | null; user_id: string | null }[],
      themeCle: act.theme_cle,
    });
    await db.from('qualite_actions').update({ mesure_avant: m.avant, mesure_apres: { ...m.apres, verdict: m.verdict, explication: m.explication }, mesure_at: new Date().toISOString() }).eq('id', id);
    await journaliser({ objet_type: 'action', objet_id: id, action: 'mesure_efficacite', auteur_id: a.id, auteur_nom: a.nom, details: { verdict: m.verdict, explication: m.explication } });
    rev();
    return OK(`Mesure : ${m.explication}`);
  } catch (e) { return KO(e); }
}

export async function ajouterDocumentAction(objetType: string, objetId: string, form: FormData): Promise<R> {
  try {
    const a = await requireQualiteAction();
    if (!['action', 'verification', 'reclamation', 'intervention'].includes(objetType) || !uuid(objetId)) throw new Error('Objet inconnu');
    const fichier = form.get('fichier');
    const url = txt(form.get('url'), 1000);
    const nom = txt(form.get('nom'), 200);
    const db = qdb();
    if (fichier instanceof File && fichier.size > 0) {
      if (fichier.size > 4 * 1024 * 1024) throw new Error('Fichier trop lourd (4 Mo maximum ; au-delà, déposez un lien).');
      const sur = fichier.name.replace(/[^A-Za-z0-9._-]+/g, '_').slice(-120);
      const chemin = `${objetType}/${objetId}/${Date.now()}-${sur}`;
      const { error } = await db.storage.from('qualite').upload(chemin, Buffer.from(await fichier.arrayBuffer()), { contentType: fichier.type || 'application/octet-stream' });
      if (error) throw new Error(error.message);
      await db.from('qualite_documents').insert({ objet_type: objetType, objet_id: objetId, nom: nom ?? fichier.name, chemin, taille: fichier.size, mime: fichier.type, ajoute_par: a.id });
    } else if (url && /^https?:\/\//.test(url)) {
      await db.from('qualite_documents').insert({ objet_type: objetType, objet_id: objetId, nom: nom ?? url, url, ajoute_par: a.id });
    } else throw new Error('Joignez un fichier ou un lien.');
    await journaliser({ objet_type: objetType, objet_id: objetId, action: 'document_ajoute', auteur_id: a.id, auteur_nom: a.nom, details: { nom } });
    rev();
    return OK('Document ajouté.');
  } catch (e) { return KO(e); }
}

/* ─────────────────────────── vérifications de contenu ─────────────────────────── */

export async function creerVerificationAction(d: Record<string, string>): Promise<R> {
  try {
    const a = await requireQualiteAction();
    const label = txt(d.contenu_label, 300);
    const demande = txt(d.demande);
    if (!label || !demande) throw new Error('Contenu et demande requis.');
    const db = qdb();
    const ids = (d.commentaires ?? '').split(',').filter(uuid);
    const { data, error } = await db.from('qualite_verifications').insert({
      nature: dans(NATURES_VERIFICATION, d.nature) ?? 'erreur', contenu_type: dans(CONTENUS_TYPES, d.contenu_type) ?? 'autre',
      contenu_id: txt(d.contenu_id, 200), contenu_label: label, demande, source_citee: txt(d.source_citee, 1000),
      responsable_nom: txt(d.responsable_nom, 200), signalements: Math.max(1, ids.length), created_by: a.id,
    }).select('id, numero').single();
    if (error) throw new Error(error.message);
    const v = data as { id: string; numero: number };
    if (ids.length) await db.from('qualite_liens').insert(ids.map((c) => ({ de_type: 'verification', de_id: v.id, vers_type: 'commentaire', vers_id: c, created_by: a.id })));
    await journaliser({ objet_type: 'verification', objet_id: v.id, action: 'creee', auteur_id: a.id, auteur_nom: a.nom, details: { numero: v.numero, signalements: ids.length } });
    rev();
    return OK(`Vérification n° ${v.numero} créée.`);
  } catch (e) { return KO(e); }
}

export async function majVerificationAction(id: string, d: Record<string, string>): Promise<R> {
  try {
    const a = await requireQualiteAction();
    if (!uuid(id)) throw new Error('Vérification inconnue');
    const now = new Date().toISOString();
    const patch: Record<string, unknown> = { updated_at: now };
    const statut = dans(STATUTS_VERIFICATION, d.statut);
    if (statut) patch.statut = statut;
    const decision = dans(DECISIONS_VERIFICATION, d.decision);
    if (decision) { patch.decision = decision; patch.verifiee_at = now; if (!statut) patch.statut = 'decide'; }
    for (const k of ['decision_detail', 'version_corrigee', 'source_citee', 'responsable_nom'] as const) if (txt(d[k])) patch[k] = txt(d[k], 2000);
    if (patch.statut === 'mis_a_jour') {
      if (!txt(d.version_corrigee)) throw new Error('Indiquez la version du contenu corrigé.');
      patch.mise_a_jour_at = now;
    }
    // Une remarque de candidat n'est jamais une preuve : la décision exige un professionnel (§20).
    if ((patch.statut === 'decide' || patch.statut === 'mis_a_jour') && !decision) {
      const { data } = await qdb().from('qualite_verifications').select('decision').eq('id', id).single();
      if (!(data as { decision?: string | null })?.decision) throw new Error('Une décision (fondé / non fondé) est requise.');
    }
    const { error } = await qdb().from('qualite_verifications').update(patch).eq('id', id);
    if (error) throw new Error(error.message);
    await journaliser({ objet_type: 'verification', objet_id: id, action: 'mise_a_jour', auteur_id: a.id, auteur_nom: a.nom, details: patch });
    rev();
    return OK();
  } catch (e) { return KO(e); }
}

/* ─────────────────────────── candidats ─────────────────────────── */

export async function majCandidatAction(userId: string, d: Record<string, string>): Promise<R> {
  try {
    const a = await requireQualiteAction();
    if (!uuid(userId)) throw new Error('Candidat inconnu');
    const date = (v: string | undefined) => (v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null);
    const patch: Record<string, unknown> = { updated_by: a.id };
    for (const k of ['debut_formation', 'fin_formation', 'premiere_epreuve', 'derniere_epreuve', 'pause_du', 'pause_au'] as const) if (k in d) patch[k] = date(d[k]);
    if ('exam_session_id' in d) patch.exam_session_id = txt(d.exam_session_id, 60);
    if ('pause_motif' in d) patch.pause_motif = txt(d.pause_motif, 500);
    if ('sans_blocage' in d) { patch.sans_blocage = d.sans_blocage === 'oui'; patch.sans_blocage_motif = txt(d.sans_blocage_motif, 500); if (patch.sans_blocage && !patch.sans_blocage_motif) throw new Error('Motif de l’aménagement requis.'); }
    if ('exclu_relances' in d) patch.exclu_relances = d.exclu_relances === 'oui';
    if ('notes' in d) patch.notes = txt(d.notes);
    if ('resultat_evc' in d) { patch.resultat_evc = txt(d.resultat_evc, 500); patch.resultat_evc_statut = patch.resultat_evc ? (d.resultat_evc_statut === 'verifie' ? 'verifie' : 'declare') : null; patch.resultat_evc_at = new Date().toISOString(); }
    if ('niveau_suivi' in d && ['aucun', 'ponctuel', 'persistant', 'prioritaire'].includes(d.niveau_suivi)) patch.niveau_suivi = d.niveau_suivi;
    await majEtatCandidat(userId, patch);
    await journaliser({ objet_type: 'candidat', objet_id: userId, action: 'mise_a_jour', user_id: userId, auteur_id: a.id, auteur_nom: a.nom, details: patch });
    rev();
    return OK('Fiche mise à jour.');
  } catch (e) { return KO(e); }
}

export async function ajouterInterventionAction(userId: string, d: Record<string, string>): Promise<R> {
  try {
    const a = await requireQualiteAction();
    const action = txt(d.action);
    if (!uuid(userId) || !action) throw new Error('Décrivez l’action proposée.');
    const realisee = d.statut === 'realisee';
    const { data, error } = await qdb().from('qualite_interventions').insert({
      user_id: userId, difficulte_id: uuid(d.difficulte_id) ? d.difficulte_id : null, alerte_id: uuid(d.alerte_id) ? d.alerte_id : null,
      signale_at: d.signale_at ? new Date(d.signale_at).toISOString() : new Date().toISOString(),
      type: dans(TYPES_INTERVENTION, d.type) ?? 'autre', action, traite_par: a.id, traite_par_nom: a.nom,
      statut: realisee ? 'realisee' : 'prevue', prevue_le: /^\d{4}-\d{2}-\d{2}$/.test(d.prevue_le ?? '') ? d.prevue_le : null,
      realisee_at: realisee ? new Date().toISOString() : null, resultat: txt(d.resultat), retour_demande: d.retour_demande === 'oui',
    }).select('id').single();
    if (error) throw new Error(error.message);
    if (uuid(d.difficulte_id)) await qdb().from('qualite_difficultes').update({ statut: 'en_cours', updated_at: new Date().toISOString() }).eq('id', d.difficulte_id).eq('statut', 'ouverte');
    await journaliser({ objet_type: 'intervention', objet_id: (data as { id: string }).id, action: 'creee', user_id: userId, auteur_id: a.id, auteur_nom: a.nom, details: { type: d.type, statut: realisee ? 'realisee' : 'prevue' } });
    rev();
    return OK('Intervention enregistrée.');
  } catch (e) { return KO(e); }
}

export async function majInterventionAction(id: string, d: Record<string, string>): Promise<R> {
  try {
    const a = await requireQualiteAction();
    if (!uuid(id)) throw new Error('Intervention inconnue');
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (['prevue', 'realisee', 'annulee'].includes(d.statut)) { patch.statut = d.statut; if (d.statut === 'realisee') patch.realisee_at = new Date().toISOString(); }
    if (txt(d.resultat)) patch.resultat = txt(d.resultat);
    if (['utile', 'partiellement', 'pas_utile'].includes(d.retour_candidat)) { patch.retour_candidat = d.retour_candidat; patch.retour_at = new Date().toISOString(); patch.retour_commentaire = txt(d.retour_commentaire); }
    const { data, error } = await qdb().from('qualite_interventions').update(patch).eq('id', id).select('user_id');
    if (error) throw new Error(error.message);
    await journaliser({ objet_type: 'intervention', objet_id: id, action: 'mise_a_jour', user_id: (data?.[0] as { user_id?: string } | undefined)?.user_id ?? null, auteur_id: a.id, auteur_nom: a.nom, details: patch });
    rev();
    return OK();
  } catch (e) { return KO(e); }
}

export async function majDifficulteAction(id: string, d: Record<string, string>): Promise<R> {
  try {
    const a = await requireQualiteAction();
    const statut = dans(STATUTS_DIFFICULTE, d.statut);
    if (!uuid(id) || !statut) throw new Error('Statut inconnu');
    const now = new Date().toISOString();
    const patch: Record<string, unknown> = { statut, updated_at: now };
    if (statut === 'resolue' || statut === 'classee') { patch.resolue_at = now; patch.resolue_par = a.id; }
    if (['ponctuelle', 'persistante', 'prioritaire'].includes(d.niveau)) patch.niveau = d.niveau;
    const { data, error } = await qdb().from('qualite_difficultes').update(patch).eq('id', id).select('user_id');
    if (error) throw new Error(error.message);
    await journaliser({ objet_type: 'difficulte', objet_id: id, action: `statut_${statut}`, user_id: (data?.[0] as { user_id?: string } | undefined)?.user_id ?? null, auteur_id: a.id, auteur_nom: a.nom, details: { commentaire: txt(d.commentaire) } });
    rev();
    return OK();
  } catch (e) { return KO(e); }
}

export async function creerDifficulteAction(userId: string, d: Record<string, string>): Promise<R> {
  try {
    const a = await requireQualiteAction();
    const libelle = txt(d.libelle, 300);
    if (!uuid(userId) || !libelle) throw new Error('Libellé requis.');
    const { data, error } = await qdb().from('qualite_difficultes').insert({
      user_id: userId, source: 'manuel', categorie: txt(d.categorie, 60), libelle, detail: txt(d.detail),
      niveau: ['ponctuelle', 'persistante', 'prioritaire'].includes(d.niveau) ? d.niveau : 'ponctuelle',
    }).select('id').single();
    if (error) throw new Error(error.message);
    await journaliser({ objet_type: 'difficulte', objet_id: (data as { id: string }).id, action: 'creee_manuellement', user_id: userId, auteur_id: a.id, auteur_nom: a.nom });
    rev();
    return OK('Difficulté enregistrée.');
  } catch (e) { return KO(e); }
}

/* ─────────────────────────── séances ─────────────────────────── */

export async function majSeanceAction(id: string, d: Record<string, string>): Promise<R> {
  try {
    const a = await requireQualiteAction();
    if (!uuid(id)) throw new Error('Séance inconnue');
    const db = qdb();
    const patch: Record<string, unknown> = { lien: 'manuel', updated_at: new Date().toISOString() };
    if (dans(TYPES_SEANCE, d.type_seance)) patch.type_seance = d.type_seance;
    if ('enseignant_nom' in d) { patch.enseignant_nom = txt(d.enseignant_nom, 200); patch.enseignant_cle = cleEnseignant(txt(d.enseignant_nom, 200)); }
    if ('theme' in d) patch.theme = txt(d.theme, 300);
    if ('video_id' in d) {
      if (d.video_id && !uuid(d.video_id)) throw new Error('Identifiant de vidéo invalide.');
      const videoId = d.video_id || null;
      if (videoId) {
        // La vidéo quitte sa séance « replay seul » éventuelle (sans évaluation déjà reçue).
        const { data: autre } = await db.from('qualite_seances').select('id, event_id').eq('video_id', videoId).neq('id', id).maybeSingle();
        const o = autre as { id: string; event_id: string | null } | null;
        if (o) {
          if (o.event_id) throw new Error('Cette vidéo est déjà rattachée à une autre séance en direct.');
          const { count } = await db.from('qualite_envois').select('id', { count: 'exact', head: true }).eq('seance_id', o.id);
          if ((count ?? 0) > 0) throw new Error('Ce replay a déjà reçu des questionnaires : rattachement impossible sans perdre la traçabilité.');
          await db.from('qualite_seances').delete().eq('id', o.id);
        }
      }
      patch.video_id = videoId;
    }
    const { error } = await db.from('qualite_seances').update(patch).eq('id', id);
    if (error) throw new Error(error.message);
    await journaliser({ objet_type: 'seance', objet_id: id, action: 'correction', auteur_id: a.id, auteur_nom: a.nom, details: patch });
    rev();
    return OK('Séance mise à jour.');
  } catch (e) { return KO(e); }
}

export async function corrigerParticipationAction(seanceId: string, d: Record<string, string>): Promise<R> {
  try {
    const a = await requireQualiteAction();
    const motif = txt(d.motif, 500);
    if (!uuid(seanceId) || !motif) throw new Error('Motif requis.');
    let userId = d.user_id;
    if (!uuid(userId) && d.email) {
      const { data } = await qdb().from('profiles').select('id').eq('email', d.email.trim().toLowerCase()).maybeSingle();
      userId = (data as { id?: string } | null)?.id ?? '';
    }
    if (!uuid(userId)) throw new Error('Candidat introuvable (e-mail du compte).');
    const r = await corrigerParticipation({
      seanceId, userId, mode: d.mode === 'replay' ? 'replay' : 'direct', statut: d.statut === 'annule' ? 'annule' : 'valide',
      motif, auteurId: a.id, auteurNom: a.nom,
    });
    rev();
    return OK(r.envoiNeutralise ? 'Participation annulée ; le questionnaire non répondu a été neutralisé.' : 'Participation corrigée.');
  } catch (e) { return KO(e); }
}

