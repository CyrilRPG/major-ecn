import 'server-only';
import { siteUrl } from '@/lib/email/send';
import { loadPlatformSnapshot } from '@/lib/suivi/platform';
import { planifier, progressionParcours, type Creation, type EnvoiExistant, type ParticipationAEvaluer } from '../orchestrateur';
import type { Parametres } from '../parametres';
import { FAMILLE_LABEL, TYPE_SEANCE_LABEL, type Famille, type StatutEnvoi, type TypeSeance } from '../types';
import { journaliser, lireParametres, qdb, toutesLesLignes, tranches, type EntreeJournal } from './base';
import { chargerContextes, majEtatCandidat, type ContexteCandidat } from './candidats';
import { emailQuestionnaire, notifier } from './communication';
import { nouveauJeton } from './jetons';
import { composer, listerQuestionnaires, type QuestionnaireLigne } from './questionnaires';
import type { SeanceLigne } from './seances';

/**
 * Application des décisions de l'orchestrateur pur (`../orchestrateur.ts`) :
 * création des envois (avec la copie des questions), activations,
 * reprogrammations, neutralisations, expirations, diffusion (cloche + e-mail),
 * relances. Tout est journalisé.
 */

/** Familles sans connexion : réponse par lien sécurisé reçu par e-mail. */
export const FAMILLES_PAR_LIEN: Famille[] = ['POST_EXAM', 'FOLLOW_UP', 'FUNDER_SURVEY'];
/** Familles annoncées par e-mail en plus de la cloche. */
const FAMILLES_EMAIL: Famille[] = ['PROGRESS', 'FINAL', 'POST_EXAM', 'FOLLOW_UP', 'FUNDER_SURVEY'];

type EnvoiBase = {
  id: string; user_id: string; famille: Famille; statut: StatutEnvoi; cle: string; titre: string;
  programme_pour: string; echeance: string | null; created_at: string; relances: number; envoye_at: string | null;
};

export type BilanOrchestration = {
  candidats: number; crees: number; actives: number; neutralises: number; expires: number; reprogrammes: number;
  progressionsCalculees: number; diffusions: number; erreurs: string[];
};

function titreEnvoi(famille: Famille, seance: SeanceLigne | null, seuil?: number): string {
  if (famille === 'HOT') return seance ? `Votre avis sur la séance : ${seance.titre}` : 'Votre avis sur la séance';
  if (famille === 'PROGRESS') return `Bilan intermédiaire — ${seuil ?? ''} % du parcours`.replace(' —  %', '');
  return FAMILLE_LABEL[famille];
}

function contexte(ctx: ContexteCandidat, c: Creation, seance: SeanceLigne | null) {
  return {
    candidat: { voie: ctx.voie, formules: ctx.formules, specialites: ctx.specialites, colleges: ctx.colleges, promotion: ctx.promotion },
    ...(seance ? {
      seance: {
        id: seance.id, titre: seance.titre, theme: seance.theme, type: seance.type_seance,
        type_label: TYPE_SEANCE_LABEL[seance.type_seance as TypeSeance] ?? seance.type_seance,
        enseignant: seance.enseignant_nom, enseignant_cle: seance.enseignant_cle, specialite: seance.specialite_label,
        colleges: seance.colleges, date: seance.debut_at, event_id: seance.event_id, video_id: seance.video_id,
      },
      mode: c.mode,
    } : {}),
    ...(c.seuil ? { seuil: c.seuil } : {}),
    ...(c.examSessionId ? { exam_session_id: c.examSessionId, premiere_epreuve: ctx.premiereEpreuve, derniere_epreuve: ctx.derniereEpreuve } : {}),
  };
}

/** Annonce un envoi devenu exigible : cloche + e-mail (lien sécurisé si la famille se passe de connexion). */
export async function diffuser(envoi: { id: string; user_id: string; famille: Famille; titre: string; relances?: number }, ctx: ContexteCandidat | undefined, params: Parametres): Promise<boolean> {
  const db = qdb();
  const now = new Date();
  const parLien = FAMILLES_PAR_LIEN.includes(envoi.famille);
  let url = `${siteUrl()}/enquetes/${envoi.id}`;
  const patch: Record<string, unknown> = { updated_at: now.toISOString() };
  if (parLien) {
    const { jeton, hash } = nouveauJeton();
    patch.jeton_hash = hash;
    patch.jeton_expire_at = new Date(now.getTime() + params.follow_up.validite_lien_jours * 86_400_000).toISOString();
    url = `${siteUrl()}/questionnaire/${jeton}`;
  }
  await notifier([{
    userId: envoi.user_id, groupKey: `enquete:${envoi.id}`, kind: 'enquete', titre: envoi.titre,
    corps: params.familles[envoi.famille].obligatoire ? 'Questionnaire à compléter' : 'Questionnaire facultatif',
    ctaLabel: 'Répondre', ctaHref: `/enquetes/${envoi.id}`,
  }]);
  let emailOk = false;
  if (FAMILLES_EMAIL.includes(envoi.famille) && ctx?.email) {
    const r = await emailQuestionnaire({ envoiId: envoi.id, to: ctx.email, prenom: ctx.prenom, famille: envoi.famille, titre: envoi.titre, url, relance: envoi.relances ?? 0 });
    emailOk = r.ok;
    if (r.ok) patch.email_envoye_at = now.toISOString();
    else console.error('[qualite] e-mail questionnaire :', r.error);
  }
  await db.from('qualite_envois').update(patch).eq('id', envoi.id);
  return emailOk;
}

/** Progression pédagogique (formule commune `lib/progress`) des candidats les moins récemment calculés. */
async function rafraichirProgressions(ctxs: ContexteCandidat[], max: number, now: number): Promise<number> {
  const aCalculer = ctxs
    .filter((c) => c.actif && !c.enPause)
    .filter((c) => !c.etat.progression_at || now - Date.parse(c.etat.progression_at) > 20 * 3_600_000)
    .sort((a, b) => (a.etat.progression_at ?? '').localeCompare(b.etat.progression_at ?? ''))
    .slice(0, max);
  let n = 0;
  for (const c of aCalculer) {
    try {
      const snap = await loadPlatformSnapshot(c.userId, c.scopeBrut);
      const cal = progressionParcours('calendaire', null, c.debutFormation, c.finFormation, now);
      c.etat.progression_pedago = snap.progression;
      c.etat.progression_calendaire = cal;
      c.etat.progression_at = new Date(now).toISOString();
      await majEtatCandidat(c.userId, { progression_pedago: snap.progression, progression_calendaire: cal, progression_at: c.etat.progression_at });
      n++;
    } catch (err) {
      console.error('[qualite] progression', c.userId, err);
    }
  }
  return n;
}

export async function executerOrchestration(opts: { now?: number; userIds?: string[]; maxProgressions?: number } = {}): Promise<BilanOrchestration> {
  const now = opts.now ?? Date.now();
  const bilan: BilanOrchestration = { candidats: 0, crees: 0, actives: 0, neutralises: 0, expires: 0, reprogrammes: 0, progressionsCalculees: 0, diffusions: 0, erreurs: [] };
  const params = await lireParametres();
  if (!params.actif) return bilan;
  const db = qdb();
  const questionnaires: QuestionnaireLigne[] = await listerQuestionnaires();
  const ctxMap = await chargerContextes({ userIds: opts.userIds, now });
  const ctxs = Array.from(ctxMap.values()).filter((c) => !c.decouverte);
  const ids = ctxs.map((c) => c.userId);

  const envois: EnvoiBase[] = [];
  const participations: { seance_id: string; user_id: string; mode: 'direct' | 'replay'; participe_at: string | null }[] = [];
  for (const lot of tranches(ids)) {
    const [e, p] = await Promise.all([
      toutesLesLignes<EnvoiBase>((f, t) => db.from('qualite_envois')
        .select('id, user_id, famille, statut, cle, titre, programme_pour, echeance, created_at, relances, envoye_at')
        .in('user_id', lot).order('id').range(f, t)),
      toutesLesLignes<{ seance_id: string; user_id: string; mode: 'direct' | 'replay'; participe_at: string | null }>((f, t) => db.from('qualite_participations')
        .select('seance_id, user_id, mode, participe_at').in('user_id', lot).eq('statut', 'valide').order('id').range(f, t)),
    ]);
    envois.push(...e); participations.push(...p);
  }
  const envoisPar = new Map<string, EnvoiBase[]>();
  for (const e of envois) (envoisPar.get(e.user_id) ?? envoisPar.set(e.user_id, []).get(e.user_id)!).push(e);
  const clesHot = new Set(envois.filter((e) => e.famille === 'HOT').map((e) => `${e.user_id}|${e.cle}`));
  const partPar = new Map<string, ParticipationAEvaluer[]>();
  for (const p of participations) {
    if (!p.participe_at || clesHot.has(`${p.user_id}|HOT:${p.seance_id}`)) continue;
    (partPar.get(p.user_id) ?? partPar.set(p.user_id, []).get(p.user_id)!).push({ seanceId: p.seance_id, mode: p.mode, disponibleAt: p.participe_at });
  }
  const seanceIds = Array.from(new Set(Array.from(partPar.values()).flat().map((p) => p.seanceId)));
  const seances = new Map<string, SeanceLigne>();
  for (const lot of tranches(seanceIds)) {
    const { data } = await db.from('qualite_seances').select('*').in('id', lot);
    for (const s of (data ?? []) as SeanceLigne[]) seances.set(s.id, s);
  }

  if (params.progress.mode !== 'calendaire' && params.familles.PROGRESS.actif) {
    bilan.progressionsCalculees = await rafraichirProgressions(ctxs, opts.maxProgressions ?? 40, now);
  }

  const journal: EntreeJournal[] = [];
  const aDiffuser: { id: string; user_id: string; famille: Famille; titre: string }[] = [];

  for (const ctx of ctxs) {
    const existants = envoisPar.get(ctx.userId) ?? [];
    const pedago = ctx.etat.progression_pedago;
    const progression = progressionParcours(params.progress.mode, pedago, ctx.debutFormation, ctx.finFormation, now);
    const decision = planifier({
      now, params, actif: ctx.actif,
      debutFormation: ctx.debutFormation, finFormation: ctx.finFormation,
      premiereEpreuve: ctx.premiereEpreuve, derniereEpreuve: ctx.derniereEpreuve, examSessionId: ctx.examSessionId,
      enPause: ctx.enPause, progression,
      participations: partPar.get(ctx.userId) ?? [],
      envois: existants.map<EnvoiExistant>((e) => ({ id: e.id, cle: e.cle, famille: e.famille, statut: e.statut, programme_pour: e.programme_pour, echeance: e.echeance, created_at: e.created_at })),
    });
    if (!decision.creations.length && !decision.misesAJour.length) continue;
    bilan.candidats++;

    // Créations
    const lignes = [];
    for (const c of decision.creations) {
      const seance = c.seanceId ? seances.get(c.seanceId) ?? null : null;
      const q = composer(questionnaires, c.famille, { seuil: c.seuil, typeSeance: (seance?.type_seance as TypeSeance) ?? null });
      if (!q) { bilan.erreurs.push(`questionnaire ${c.famille} introuvable`); continue; }
      const pf = params.familles[c.famille];
      lignes.push({
        user_id: ctx.userId, famille: c.famille, questionnaire_id: q.questionnaireId, questionnaire_code: q.code, questionnaire_version: q.version,
        titre: titreEnvoi(c.famille, seance, c.seuil), intro: q.intro, questions: q.questions, cle: c.cle,
        seance_id: c.seanceId ?? null, exam_session_id: c.examSessionId ?? null, contexte: contexte(ctx, c, seance),
        statut: c.statut, obligatoire: pf.obligatoire, priorite: pf.priorite, blocking_scope: pf.blocking_scope,
        programme_pour: c.programmePour, echeance: c.echeance,
        envoye_at: c.statut === 'envoye' ? new Date(now).toISOString() : null,
        neutralise_at: c.statut === 'neutralise' ? new Date(now).toISOString() : null,
        neutralise_motif: c.statut === 'neutralise' ? c.motif ?? null : null,
      });
    }
    if (lignes.length) {
      const { data, error } = await db.from('qualite_envois').upsert(lignes, { onConflict: 'user_id,cle', ignoreDuplicates: true }).select('id, user_id, famille, statut, cle, titre');
      if (error) bilan.erreurs.push(error.message);
      for (const r of (data ?? []) as { id: string; user_id: string; famille: Famille; statut: StatutEnvoi; cle: string; titre: string }[]) {
        bilan.crees++;
        journal.push({ objet_type: 'envoi', objet_id: r.id, action: `cree_${r.statut}`, user_id: r.user_id, details: { famille: r.famille, cle: r.cle } });
        if (r.statut === 'envoye') aDiffuser.push(r);
      }
    }
    if (decision.notes.length) journal.push({ objet_type: 'orchestrateur', objet_id: ctx.userId, action: 'note', user_id: ctx.userId, details: { notes: decision.notes } });

    // Mises à jour
    for (const m of decision.misesAJour) {
      const iso = new Date(now).toISOString();
      const e = existants.find((x) => x.id === m.id);
      if (!e) continue;
      let patch: Record<string, unknown>;
      if (m.type === 'activer') { patch = { statut: 'envoye', envoye_at: iso }; bilan.actives++; aDiffuser.push({ id: e.id, user_id: e.user_id, famille: e.famille, titre: e.titre }); }
      else if (m.type === 'expirer') { patch = { statut: 'expire', expire_at: iso }; bilan.expires++; }
      else if (m.type === 'neutraliser') { patch = { statut: 'neutralise', neutralise_at: iso, neutralise_motif: m.motif }; bilan.neutralises++; }
      else { patch = { programme_pour: m.programmePour, echeance: m.echeance }; bilan.reprogrammes++; }
      // Garde de concurrence : on ne modifie que si le statut n'a pas bougé entre-temps.
      const { data } = await db.from('qualite_envois').update({ ...patch, updated_at: iso }).eq('id', e.id).eq('statut', e.statut).select('id');
      if (data?.length) {
        journal.push({ objet_type: 'envoi', objet_id: e.id, action: m.type, user_id: e.user_id, details: m.type === 'neutraliser' ? { motif: m.motif } : m.type === 'reprogrammer' ? { programme_pour: m.programmePour, echeance: m.echeance } : {} });
        if (m.type === 'expirer' || m.type === 'neutraliser') {
          await db.from('pedago_notifications').update({ dismissed_at: iso }).eq('user_id', e.user_id).eq('group_key', `enquete:${e.id}`);
        }
      } else if (m.type === 'activer') {
        aDiffuser.pop();
        bilan.actives--;
      }
    }
  }

  for (const d of aDiffuser) {
    try { await diffuser(d, ctxMap.get(d.user_id), params); bilan.diffusions++; } catch (err) { bilan.erreurs.push(String(err)); }
  }
  await journaliser(journal);
  return bilan;
}

/** Relances e-mail des questionnaires restés sans réponse (au plus deux par questionnaire). */
export async function relancer(now = Date.now()): Promise<number> {
  const params = await lireParametres();
  if (!params.actif) return 0;
  const db = qdb();
  const ouverts = await toutesLesLignes<EnvoiBase>((f, t) => db.from('qualite_envois')
    .select('id, user_id, famille, statut, cle, titre, programme_pour, echeance, created_at, relances, envoye_at')
    .in('statut', ['envoye', 'affiche', 'commence']).lt('relances', 2).order('id').range(f, t));
  const dus = ouverts.filter((e) => {
    const r = params.familles[e.famille].relance_jours;
    if (!r || !e.envoye_at || !FAMILLES_EMAIL.includes(e.famille)) return false;
    return now >= Date.parse(e.envoye_at) + r * 86_400_000 * (e.relances + 1);
  }).slice(0, 100);
  if (!dus.length) return 0;
  const ctxs = await chargerContextes({ userIds: Array.from(new Set(dus.map((d) => d.user_id))), now });
  let n = 0;
  for (const e of dus) {
    const relances = e.relances + 1;
    const { data } = await db.from('qualite_envois').update({ relances, derniere_relance_at: new Date(now).toISOString() }).eq('id', e.id).eq('relances', e.relances).select('id');
    if (!data?.length) continue;
    await diffuser({ ...e, relances }, ctxs.get(e.user_id), params);
    await journaliser({ objet_type: 'envoi', objet_id: e.id, action: 'relance', user_id: e.user_id, details: { relance: relances } });
    n++;
  }
  return n;
}
