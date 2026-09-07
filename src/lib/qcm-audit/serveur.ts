import 'server-only';

/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Audit des corrigés QCM — côté serveur : chargement des questions,
 * soumission des Message Batches, récolte des résultats en constats.
 *
 * Tout est REPRENABLE : un audit garde la liste des collèges restant à
 * soumettre (`restants`) et l'état de chacun de ses lots (`batches`). Une
 * fonction coupée par son délai reprend au collège ou au lot suivant.
 */
import Anthropic from '@anthropic-ai/sdk';
import { createAdminClient } from '@/lib/supabase/admin';
import { usageToUsd } from '@/lib/ai/cost';
import {
  construireRequetes, decouperEnBatches, lireConstats, estimerCoutUsd, QCM_AUDIT_MODEL_DEFAUT,
  construireRequetesRedaction, lireJustifications, questionsARediger, justificationARediger,
  estimerCoutRedactionUsd, QCM_AUDIT_MODEL_REDACTION_DEFAUT,
  type QuestionAuditee, type Constat, type Proposition, type AuditKind,
} from './regles';

/** Modèle du passage de cohérence (lecture) : rapide et peu coûteux. */
export const QCM_AUDIT_MODEL = process.env.QCM_AUDIT_MODEL?.trim() || QCM_AUDIT_MODEL_DEFAUT;
/** Modèle du passage de rédaction : la qualité médicale du texte prime. */
export const QCM_AUDIT_MODEL_REDACTION = process.env.QCM_AUDIT_MODEL_REDACTION?.trim() || QCM_AUDIT_MODEL_REDACTION_DEFAUT;
export const modelePourKind = (kind: AuditKind) => (kind === 'justifications' ? QCM_AUDIT_MODEL_REDACTION : QCM_AUDIT_MODEL);

export type AuditBatch = {
  id: string;
  college_id: string;
  requests: number;
  collected: boolean;
  succeeded?: number;
  errored?: number;
};

export type AuditRun = {
  id: string;
  college_id: string | null;
  college_nom: string | null;
  model: string;
  kind: AuditKind;
  status: 'preparation' | 'en_cours' | 'termine' | 'echec' | 'annule';
  batches: AuditBatch[];
  restants: string[];
  nb_questions: number;
  nb_items: number;
  nb_requetes: number;
  nb_constats: number;
  cout_estime_usd: number | null;
  cout_usd: number;
  input_tokens: number;
  output_tokens: number;
  error_message: string | null;
  created_at: string;
  finished_at: string | null;
};

export function estTableAuditAbsente(error: { code?: string; message?: string } | null | undefined): boolean {
  if (!error) return false;
  return error.code === '42P01' || error.code === 'PGRST205' || /qcm_audit_(runs|findings).*(does not exist|schema cache)/i.test(error.message ?? '');
}

export const MESSAGE_AUDIT_TABLE_ABSENTE =
  'L’audit des corrigés sera disponible après la mise à jour de la base de données (migration 20260907110000_qcm_audit_corriges).';

let client: Anthropic | null = null;
export function clientAnthropic(): Anthropic {
  if (client) return client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY n’est pas configurée côté serveur.');
  client = new Anthropic({ apiKey, maxRetries: 2, timeout: 120_000 });
  return client;
}

/* ─────────── Périmètre ─────────── */

export type CollegeAudit = { id: string; nom: string; parentId: string | null; nbCours: number };

export async function listerColleges(): Promise<CollegeAudit[]> {
  const admin = createAdminClient() as any;
  const { data, error } = await admin.from('matieres').select('id, nom, parent_matiere_id, order_index, cours(id)').order('order_index');
  if (error) throw new Error(error.message);
  return ((data ?? []) as Array<{ id: string; nom: string; parent_matiere_id: string | null; cours: { id: string }[] | null }>)
    .filter((m) => (m.cours ?? []).length > 0)
    .map((m) => ({ id: m.id, nom: m.nom, parentId: m.parent_matiere_id, nbCours: m.cours?.length ?? 0 }));
}

async function coursDuCollege(admin: any, collegeId: string): Promise<string[]> {
  const { data, error } = await admin.from('cours').select('id').eq('matiere_id', collegeId).order('order_index');
  if (error) throw new Error(error.message);
  return ((data ?? []) as { id: string }[]).map((c) => c.id);
}

/** Questions (avec propositions) d'un item, paginées par sécurité. */
async function questionsDuCours(admin: any, coursId: string, collegeId: string): Promise<QuestionAuditee[]> {
  const PAGE = 1000;
  const out: QuestionAuditee[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await admin
      .from('qcm_questions')
      .select('id, format, enonce, qcm_items(id, lettre, enonce, is_correct, justification), qcm_series!inner(cours_id)')
      .eq('qcm_series.cours_id', coursId)
      .eq('format', 'qcm')
      .order('id')
      .range(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    for (const q of (data ?? []) as Array<{ id: string; enonce: string; qcm_items: Array<{ id: string; lettre: string; enonce: string; is_correct: boolean; justification: string }> | null }>) {
      const items = (q.qcm_items ?? []).slice().sort((a, b) => a.lettre.localeCompare(b.lettre));
      if (items.length === 0) continue;
      out.push({ id: q.id, cours_id: coursId, college_id: collegeId, enonce: q.enonce ?? '', items });
    }
    if (!data || data.length < PAGE) break;
  }
  return out;
}

export async function chargerQuestionsDuCollege(collegeId: string): Promise<QuestionAuditee[]> {
  const admin = createAdminClient() as any;
  const cours = await coursDuCollege(admin, collegeId);
  const out: QuestionAuditee[] = [];
  // Quelques items de front : la latence PostgREST domine largement.
  const CONC = 6;
  for (let i = 0; i < cours.length; i += CONC) {
    const tranche = await Promise.all(cours.slice(i, i + CONC).map((c) => questionsDuCours(admin, c, collegeId)));
    for (const t of tranche) out.push(...t);
  }
  return out;
}

/**
 * Compte questions / propositions d'un périmètre, pour l'estimation.
 * Passage « justifications » : seules les propositions vides ou recopiées
 * comptent ; il faut les lire, donc charger — sur toute la plateforme, on
 * s'arrête au délai et on le dit (`partiel`).
 */
export async function compterPerimetre(collegeId: string | null, kind: AuditKind = 'coherence', delaiMs = 200_000): Promise<{ nbQuestions: number; nbItems: number; partiel: boolean }> {
  const admin = createAdminClient() as any;
  if (kind === 'justifications') {
    const debut = Date.now();
    const colleges = collegeId ? [collegeId] : (await listerColleges()).map((c) => c.id);
    let nbQuestions = 0, nbItems = 0, partiel = false;
    for (const id of colleges) {
      if (Date.now() - debut > delaiMs) { partiel = true; break; }
      const qs = questionsARediger(await chargerQuestionsDuCollege(id));
      nbQuestions += qs.length;
      nbItems += qs.reduce((n, q) => n + q.items.filter(justificationARediger).length, 0);
    }
    return { nbQuestions, nbItems, partiel };
  }
  if (collegeId === null) {
    const [q, i] = await Promise.all([
      admin.from('qcm_questions').select('id', { count: 'exact', head: true }).eq('format', 'qcm'),
      admin.from('qcm_items').select('id', { count: 'exact', head: true }),
    ]);
    if (q.error) throw new Error(q.error.message);
    if (i.error) throw new Error(i.error.message);
    return { nbQuestions: q.count ?? 0, nbItems: i.count ?? 0, partiel: false };
  }
  const questions = await chargerQuestionsDuCollege(collegeId);
  return { nbQuestions: questions.length, nbItems: questions.reduce((n, q) => n + q.items.length, 0), partiel: false };
}

export function estimerSelonKind(kind: AuditKind, nbQuestions: number, nbItems: number): number {
  return kind === 'justifications'
    ? estimerCoutRedactionUsd(nbQuestions, nbItems, QCM_AUDIT_MODEL_REDACTION)
    : estimerCoutUsd(nbQuestions, nbItems, QCM_AUDIT_MODEL);
}

/* ─────────── Soumission ─────────── */

export async function lireRun(runId: string): Promise<AuditRun | null> {
  const admin = createAdminClient() as any;
  const { data, error } = await admin.from('qcm_audit_runs').select('*').eq('id', runId).maybeSingle();
  if (error) throw new Error(estTableAuditAbsente(error) ? MESSAGE_AUDIT_TABLE_ABSENTE : error.message);
  return (data as AuditRun | null) ?? null;
}

async function majRun(runId: string, patch: Record<string, unknown>) {
  const admin = createAdminClient() as any;
  const { error } = await admin.from('qcm_audit_runs').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', runId);
  if (error) throw new Error(error.message);
}

/**
 * Soumet les collèges restants d'un audit, un par un, tant que `peutContinuer`
 * l'autorise. Chaque collège : chargement → requêtes → un ou plusieurs
 * Message Batches → mise à jour du run (le collège quitte `restants`).
 */
export async function soumettreRestants(run: AuditRun, peutContinuer: () => boolean): Promise<AuditRun> {
  const c = clientAnthropic();
  let courant = run;
  while (courant.restants.length > 0 && peutContinuer()) {
    const collegeId = courant.restants[0];
    const toutes = await chargerQuestionsDuCollege(collegeId);
    // Passage « justifications » : seules les questions ayant une proposition
    // vide ou recopiée sont soumises, et seules ces propositions sont comptées.
    const questions = courant.kind === 'justifications' ? questionsARediger(toutes) : toutes;
    const prefixe = `${courant.id.slice(0, 8)}-${collegeId}`;
    const requetes = courant.kind === 'justifications'
      ? construireRequetesRedaction(questions, courant.model, prefixe)
      : construireRequetes(questions, courant.model, prefixe);
    const nouveaux: AuditBatch[] = [];
    for (const groupe of decouperEnBatches(requetes)) {
      const batch = await c.messages.batches.create({ requests: groupe as unknown as Anthropic.Messages.Batches.BatchCreateParams['requests'] });
      nouveaux.push({ id: batch.id, college_id: collegeId, requests: groupe.length, collected: false });
    }
    const nbItems = courant.kind === 'justifications'
      ? questions.reduce((n, q) => n + q.items.filter(justificationARediger).length, 0)
      : questions.reduce((n, q) => n + q.items.length, 0);
    const patch = {
      batches: [...courant.batches, ...nouveaux],
      restants: courant.restants.slice(1),
      nb_questions: courant.nb_questions + questions.length,
      nb_items: courant.nb_items + nbItems,
      nb_requetes: courant.nb_requetes + requetes.length,
      status: 'en_cours' as const,
    };
    await majRun(courant.id, patch);
    courant = { ...courant, ...patch };
  }
  return courant;
}

/* ─────────── Récolte ─────────── */

async function insererConstats(run: AuditRun, constats: Constat[]): Promise<number> {
  if (constats.length === 0) return 0;
  const admin = createAdminClient() as any;
  let inseres = 0;
  const parId = new Map(constats.map((c) => [c.item_id, c]));
  const ids = [...parId.keys()];
  for (let i = 0; i < ids.length; i += 150) {
    const tranche = ids.slice(i, i + 150);
    const { data, error } = await admin
      .from('qcm_items')
      .select('id, lettre, enonce, is_correct, justification, question_id, qcm_questions!inner(id, enonce, qcm_series!inner(cours_id, cours!inner(matiere_id)))')
      .in('id', tranche);
    if (error) throw new Error(error.message);
    const lignes = ((data ?? []) as Array<any>).map((it) => {
      const c = parId.get(String(it.id).toLowerCase())!;
      return {
        run_id: run.id,
        item_id: it.id,
        question_id: it.question_id,
        cours_id: it.qcm_questions?.qcm_series?.cours_id ?? null,
        college_id: it.qcm_questions?.qcm_series?.cours?.matiere_id ?? null,
        lettre: it.lettre,
        is_correct_actuel: it.is_correct,
        polarite_justification: c.polarite_justification,
        gravite: c.gravite,
        motif: c.motif,
        enonce_question: it.qcm_questions?.enonce ?? null,
        enonce_item: it.enonce,
        justification: it.justification,
      };
    });
    if (lignes.length === 0) continue;
    const { error: insErr, data: inserted } = await admin
      .from('qcm_audit_findings')
      .upsert(lignes, { onConflict: 'run_id,item_id', ignoreDuplicates: true })
      .select('id');
    if (insErr) throw new Error(insErr.message);
    inseres += (inserted ?? []).length;
  }
  return inseres;
}

/** Propositions de justification (passage « justifications ») → constats `gravite = 'justification'`. */
async function insererPropositions(run: AuditRun, propositions: Proposition[]): Promise<number> {
  if (propositions.length === 0) return 0;
  const admin = createAdminClient() as any;
  let inseres = 0;
  const parId = new Map(propositions.map((p) => [p.item_id, p]));
  const ids = [...parId.keys()];
  for (let i = 0; i < ids.length; i += 150) {
    const tranche = ids.slice(i, i + 150);
    const { data, error } = await admin
      .from('qcm_items')
      .select('id, lettre, enonce, is_correct, justification, question_id, qcm_questions!inner(id, enonce, qcm_series!inner(cours_id, cours!inner(matiere_id)))')
      .in('id', tranche);
    if (error) throw new Error(error.message);
    const lignes = ((data ?? []) as Array<any>)
      // On ne propose que pour les propositions qui en ont encore besoin.
      .filter((it) => justificationARediger({ enonce: it.enonce, justification: it.justification }))
      .map((it) => ({
        run_id: run.id, item_id: it.id, question_id: it.question_id,
        cours_id: it.qcm_questions?.qcm_series?.cours_id ?? null,
        college_id: it.qcm_questions?.qcm_series?.cours?.matiere_id ?? null,
        lettre: it.lettre, is_correct_actuel: it.is_correct,
        polarite_justification: 'indeterminee', gravite: 'justification', motif: null,
        proposition: parId.get(String(it.id).toLowerCase())!.justification,
        enonce_question: it.qcm_questions?.enonce ?? null, enonce_item: it.enonce, justification: it.justification,
      }));
    if (lignes.length === 0) continue;
    const { error: insErr, data: inserted } = await admin
      .from('qcm_audit_findings')
      .upsert(lignes, { onConflict: 'run_id,item_id', ignoreDuplicates: true })
      .select('id');
    if (insErr) throw new Error(insErr.message);
    inseres += (inserted ?? []).length;
  }
  return inseres;
}

/**
 * Récolte les lots terminés d'un audit. Un lot est lu en entier puis marqué
 * `collected` ; la fonction s'arrête proprement quand `peutContinuer` passe à
 * faux et reprendra au lot suivant.
 */
export async function recolterRun(run: AuditRun, peutContinuer: () => boolean): Promise<AuditRun> {
  const c = clientAnthropic();
  let courant = run;
  for (const b of courant.batches) {
    if (b.collected) continue;
    if (!peutContinuer()) break;
    const etat = await c.messages.batches.retrieve(b.id);
    if (etat.processing_status !== 'ended') continue;

    const constats: Constat[] = [];
    const propositions: Proposition[] = [];
    let cout = 0, inTok = 0, outTok = 0, succeeded = 0, errored = 0;
    const flux = await c.messages.batches.results(b.id);
    for await (const r of flux) {
      if (r.result.type === 'succeeded') {
        succeeded++;
        const m = r.result.message;
        const texte = m.content.filter((x): x is Anthropic.Messages.TextBlock => x.type === 'text').map((x) => x.text).join('');
        if (courant.kind === 'justifications') propositions.push(...lireJustifications(texte));
        else constats.push(...lireConstats(texte));
        inTok += m.usage.input_tokens; outTok += m.usage.output_tokens;
        // Tarif Batch : moitié du tarif standard.
        cout += usageToUsd({ input_tokens: m.usage.input_tokens, output_tokens: m.usage.output_tokens }, m.model) * 0.5;
      } else {
        errored++;
      }
    }
    const nouveaux = courant.kind === 'justifications'
      ? await insererPropositions(courant, propositions)
      : await insererConstats(courant, constats);
    const batches = courant.batches.map((x) => (x.id === b.id ? { ...x, collected: true, succeeded, errored } : x));
    const patch = {
      batches,
      nb_constats: courant.nb_constats + nouveaux,
      cout_usd: Number(courant.cout_usd) + cout,
      input_tokens: Number(courant.input_tokens) + inTok,
      output_tokens: Number(courant.output_tokens) + outTok,
    };
    await majRun(courant.id, patch);
    courant = { ...courant, ...patch };
  }

  if (courant.restants.length === 0 && courant.batches.length > 0 && courant.batches.every((x) => x.collected) && courant.status === 'en_cours') {
    await majRun(courant.id, { status: 'termine', finished_at: new Date().toISOString() });
    courant = { ...courant, status: 'termine' };
  }
  return courant;
}

/** Annule les lots encore en cours chez Anthropic et clôt l'audit. */
export async function annulerRun(run: AuditRun): Promise<void> {
  const c = clientAnthropic();
  for (const b of run.batches) {
    if (b.collected) continue;
    try { await c.messages.batches.cancel(b.id); } catch { /* déjà terminé : rien à annuler */ }
  }
  await majRun(run.id, { status: 'annule', finished_at: new Date().toISOString() });
}

export { estimerCoutUsd, estimerCoutRedactionUsd };
