'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireStaff } from '@/lib/auth/require-role';
import { ongletsDe } from '@/lib/auth/onglets-equipe';
import { createAdminClient } from '@/lib/supabase/admin';
import { EDN_FACULTE_ID } from '@/lib/data/navigator';
import { instantParis } from '@/lib/agenda/planning';
import { GEN_FEATURE } from '@/lib/ai/cost';
import { notifierSeance } from '@/lib/notifications/eleves';
import { AGENDA_IMPORT_MODEL, appelerImportAgenda, type Echange } from '@/lib/agenda/import-ia';
import {
  FORMULES_IMPORT, VOIES_IMPORT, montantFactureEur, verifierSeances,
  type EvenementExistant, type QuestionIa, type SeanceIa, type SeanceVerifiee, type SpecialiteCatalogue,
} from '@/lib/agenda/import-ia-regles';

/**
 * Import IA de l'agenda (/admin/agenda → « Import IA »).
 *
 * `analyserImportAgenda` : un tour avec le modèle (analyse, réponses aux
 * questions, demande de modification). `validerImportAgenda` : création des
 * séances acceptées par l'administrateur.
 *
 * Facturation IA : UNE ligne `ai_generations` par import (feature
 * `agenda_import_ia`), dont l'id sert d'identifiant d'import ; chaque tour y
 * ajoute ses jetons et son montant. Le navigateur ne reçoit que le montant
 * facturé cumulé, jamais le coût fournisseur.
 */

const MG_COLLEGE_ID = 'col-medecine-generale';
const MAX_TEXTE = 20_000;
const MAX_TOURS = 12;

async function gardeAgenda() {
  const r = await requireStaff();
  if (!r.isAdmin && !(await ongletsDe(r.profile)).agenda) return null;
  return r;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = any;

/** Spécialités proposées : mêmes choix que le formulaire de l'agenda. */
async function chargerCatalogue(db: Db): Promise<SpecialiteCatalogue[]> {
  const { data } = await db.from('facultes')
    .select('semestres(matieres(id, nom, order_index, parent_matiere_id))')
    .eq('id', EDN_FACULTE_ID).maybeSingle();
  const matieres = ((data?.semestres ?? []) as { matieres?: { id: string; nom: string; order_index: number | null; parent_matiere_id: string | null }[] }[])
    .flatMap((s) => s.matieres ?? [])
    .filter((m) => m.id !== 'col-decouverte' && (!m.parent_matiere_id || m.parent_matiere_id === MG_COLLEGE_ID))
    .sort((a, b) => Number(!!a.parent_matiere_id) - Number(!!b.parent_matiere_id) || (a.order_index ?? 0) - (b.order_index ?? 0));
  return matieres.map((m) => ({ id: m.id, nom: m.parent_matiere_id === MG_COLLEGE_ID ? `MG · ${m.nom}` : m.nom }));
}

/** Agenda des deux derniers mois et à venir : habitudes et doublons. */
async function chargerExistants(db: Db, aujourdHui: string): Promise<EvenementExistant[]> {
  const [a, m, j] = aujourdHui.split('-').map(Number);
  const depuis = new Date(Date.UTC(a, m - 1, j - 60)).toISOString().slice(0, 10);
  const { data } = await db.from('platform_events')
    .select('id, title, date, start_time, end_time, intervenant, required_offers, scope_type, scope_colleges, voies')
    .eq('faculte_id', EDN_FACULTE_ID)
    .gte('date', depuis)
    .order('date').order('start_time').order('id')
    .limit(400);
  return (data ?? []) as EvenementExistant[];
}

type LigneFacturation = { id: string; admin_id: string | null; feature: string; input_tokens: number; output_tokens: number; cost_usd: number; price_eur: number };

/** Ajoute le coût d'un tour à la ligne de facturation de l'import (créée au premier tour). */
async function facturerTour(db: Db, args: {
  importId: string | null; adminId: string; titre: string; usd: number;
  usage: { input_tokens: number; output_tokens: number; cache_read_input_tokens?: number; cache_creation_input_tokens?: number };
  model: string; erreur?: string;
}): Promise<{ importId: string | null; totalEur: number }> {
  const prix = montantFactureEur(args.usd);
  const entree = args.usage.input_tokens + (args.usage.cache_read_input_tokens ?? 0) + (args.usage.cache_creation_input_tokens ?? 0);
  let ligne: LigneFacturation | null = null;
  if (args.importId) {
    const { data } = await db.from('ai_generations')
      .select('id, admin_id, feature, input_tokens, output_tokens, cost_usd, price_eur')
      .eq('id', args.importId).maybeSingle();
    if (data && data.feature === GEN_FEATURE.agendaImport && data.admin_id === args.adminId) ligne = data as LigneFacturation;
  }
  try {
    if (ligne) {
      const total = Number(ligne.price_eur) + prix;
      await db.from('ai_generations').update({
        input_tokens: ligne.input_tokens + entree,
        output_tokens: ligne.output_tokens + args.usage.output_tokens,
        cost_usd: Number(ligne.cost_usd) + args.usd,
        price_eur: total,
        model: args.model,
        status: 'success',
        error_message: args.erreur?.slice(0, 500) ?? null,
      }).eq('id', ligne.id);
      return { importId: ligne.id, totalEur: total };
    }
    const { data, error } = await db.from('ai_generations').insert({
      admin_id: args.adminId,
      cours_id: null,
      cours_titre: args.titre,
      kind: 'agenda_import',
      feature: GEN_FEATURE.agendaImport,
      items_count: 0,
      input_tokens: entree,
      output_tokens: args.usage.output_tokens,
      cost_usd: args.usd,
      price_eur: prix,
      model: args.model,
      status: 'success',
      error_message: args.erreur?.slice(0, 500) ?? null,
    }).select('id').single();
    if (error) throw new Error(error.message);
    return { importId: (data as { id: string }).id, totalEur: prix };
  } catch (e) {
    console.error('[agenda/import-ia] facturation non enregistrée', e);
    return { importId: ligne?.id ?? args.importId, totalEur: Number(ligne?.price_eur ?? 0) + prix };
  }
}

const arrondiCentime = (eur: number) => Math.ceil(eur * 100 - 1e-9) / 100;

export type EtatImportIa = {
  importId: string | null;
  statut: 'questions' | 'proposition';
  resume: string;
  questions: QuestionIa[];
  /** Séances contrôlées, prêtes à l'affichage. */
  seances: SeanceVerifiee[];
  /** Séances telles que renvoyées par l'IA, renvoyées au tour suivant. */
  brutes: SeanceIa[];
  /** Montant cumulé de l'import (€). */
  coutEur: number;
};

const echangeSchema = z.union([
  z.object({
    genre: z.literal('reponses'),
    questions: z.array(z.object({ question: z.string().max(1000), reponse: z.string().max(2000) })).max(30),
  }),
  z.object({ genre: z.literal('modification'), consigne: z.string().min(1).max(4000) }),
]);

const analyseSchema = z.object({
  importId: z.string().uuid().nullable(),
  texte: z.string().trim().min(10, 'Décrivez au moins une séance.').max(MAX_TEXTE, 'Texte trop long : découpez-le en plusieurs imports.'),
  echanges: z.array(echangeSchema).max(MAX_TOURS, 'Trop d’échanges pour un même import : recommencez un import.'),
  proposition: z.array(z.unknown()).max(200).nullable(),
});

export async function analyserImportAgenda(input: {
  importId: string | null;
  texte: string;
  echanges: Echange[];
  proposition: SeanceIa[] | null;
}): Promise<{ ok: true; etat: EtatImportIa } | { ok: false; error: string; importId?: string | null; coutEur?: number }> {
  const garde = await gardeAgenda();
  if (!garde) return { ok: false, error: 'Accès réservé à la gestion de l’agenda.' };
  const parsed = analyseSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Données invalides.' };
  const { importId, texte, echanges, proposition } = parsed.data;

  const db = createAdminClient() as Db;
  const aujourdHui = instantParis().date;
  const [catalogue, existants] = await Promise.all([chargerCatalogue(db), chargerExistants(db, aujourdHui)]);
  const titre = `Import agenda — ${texte.split('\n').map((l) => l.trim()).find(Boolean)?.slice(0, 100) ?? 'texte libre'}`;

  try {
    const r = await appelerImportAgenda({ texte, echanges: echanges as Echange[], proposition, aujourdHui, catalogue, existants });
    const fact = await facturerTour(db, { importId, adminId: garde.profile.id, titre, usd: r.usd, usage: r.usage, model: r.model });
    const brutes = Array.isArray(r.reponse.seances) ? r.reponse.seances : [];
    const questions = (Array.isArray(r.reponse.questions) ? r.reponse.questions : [])
      .filter((q) => q && typeof q.question === 'string' && q.question.trim())
      .map((q, i) => ({ id: q.id || `q${i + 1}`, question: q.question.trim(), choix: (q.choix ?? []).filter(Boolean).slice(0, 12), multiple: !!q.multiple }));
    const statut = r.reponse.statut === 'proposition' && questions.length === 0 ? 'proposition' : 'questions';
    if (statut === 'proposition' && brutes.length === 0) {
      return { ok: false, error: 'L’IA n’a trouvé aucune séance dans ce texte. Précisez-le.', importId: fact.importId, coutEur: arrondiCentime(fact.totalEur) };
    }
    return {
      ok: true,
      etat: {
        importId: fact.importId,
        statut,
        resume: (r.reponse.resume ?? '').trim(),
        questions: statut === 'questions' ? questions : [],
        seances: verifierSeances(brutes, { aujourdHui, catalogue, existants }),
        brutes,
        coutEur: arrondiCentime(fact.totalEur),
      },
    };
  } catch (e) {
    const err = e as Error & { usd?: number; usage?: Parameters<typeof facturerTour>[1]['usage']; model?: string };
    // Un tour consommé mais inexploitable (refus, sortie tronquée) reste dû.
    if (err.usd && err.usage) {
      const fact = await facturerTour(db, { importId, adminId: garde.profile.id, titre, usd: err.usd, usage: err.usage, model: err.model ?? AGENDA_IMPORT_MODEL, erreur: err.message });
      return { ok: false, error: err.message, importId: fact.importId, coutEur: arrondiCentime(fact.totalEur) };
    }
    console.error('[agenda/import-ia] analyse impossible', err);
    return { ok: false, error: err.message || 'Analyse impossible : réessayez.' };
  }
}

/* ─────────── Validation ─────────── */

const heure = z.string().regex(/^\d{2}:\d{2}$/).nullable();
const seanceSchema = z.object({
  titre: z.string().trim().min(1).max(180),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  debut: heure,
  fin: heure,
  intervenant: z.string().max(180).nullable(),
  scope_type: z.enum(['all', 'college']),
  scope_colleges: z.array(z.string().min(1)).max(80),
  required_offers: z.array(z.enum(FORMULES_IMPORT)).min(1),
  voies: z.array(z.enum(VOIES_IMPORT)).min(1),
  notes: z.string().max(2000).nullable(),
})
  .refine((s) => !s.debut || !s.fin || s.fin > s.debut, { message: 'Une séance finit avant de commencer.' })
  .refine((s) => s.scope_type !== 'college' || s.scope_colleges.length > 0, { message: 'Une séance n’a aucune spécialité.' });

export async function validerImportAgenda(input: {
  importId: string | null;
  seances: SeanceVerifiee[];
  notifier: boolean;
}): Promise<{ ok: true; crees: number; notifies: number; avertissement?: string } | { ok: false; error: string }> {
  const garde = await gardeAgenda();
  if (!garde) return { ok: false, error: 'Accès réservé à la gestion de l’agenda.' };
  if (!Array.isArray(input.seances) || input.seances.length === 0) return { ok: false, error: 'Aucune séance à créer.' };
  if (input.seances.length > 200) return { ok: false, error: 'Trop de séances pour un seul import.' };
  if (input.seances.some((s) => (s.alertes ?? []).some((a) => a.niveau === 'bloquant'))) {
    return { ok: false, error: 'Certaines séances sont incomplètes : corrigez-les avant de valider.' };
  }

  const db = createAdminClient() as Db;
  const catalogue = new Set((await chargerCatalogue(db)).map((s) => s.id));
  const lignes = [];
  for (const brute of input.seances) {
    const p = seanceSchema.safeParse(brute);
    if (!p.success) return { ok: false, error: `« ${brute.titre ?? 'séance'} » : ${p.error.issues[0]?.message ?? 'données invalides'}` };
    const s = p.data;
    if (s.scope_colleges.some((id) => !catalogue.has(id))) return { ok: false, error: `« ${s.titre} » : spécialité inconnue.` };
    lignes.push({
      title: s.titre,
      date: s.date,
      start_time: s.debut,
      end_time: s.debut ? s.fin : null,
      college: null,
      intervenant: s.intervenant?.trim() || null,
      zoom_url: null,
      notes: s.notes?.trim() || null,
      required_offers: s.required_offers,
      scope_type: s.scope_type,
      scope_colleges: s.scope_type === 'college' ? [...new Set(s.scope_colleges)] : [],
      voies: s.voies,
      created_by: garde.user.id,
    });
  }

  const { data, error } = await db.from('platform_events').insert(lignes).select('id');
  if (error) return { ok: false, error: error.message };
  const ids = ((data ?? []) as { id: string }[]).map((r) => r.id);

  if (input.importId && z.string().uuid().safeParse(input.importId).success) {
    const { data: nomData } = await db.from('matieres').select('id, nom').in('id', [...new Set(lignes.flatMap((l) => l.scope_colleges))]);
    const noms = [...new Set(((nomData ?? []) as { nom: string }[]).map((m) => m.nom))].slice(0, 4).join(', ');
    await db.from('ai_generations')
      .update({ items_count: ids.length, cours_titre: `Import agenda — ${ids.length} séance${ids.length > 1 ? 's' : ''}${noms ? ` (${noms})` : ''}` })
      .eq('id', input.importId).eq('feature', GEN_FEATURE.agendaImport).eq('admin_id', garde.profile.id);
  }

  revalidatePath('/admin/agenda');
  revalidatePath('/agenda');
  revalidatePath('/accueil');

  let notifies = 0;
  if (input.notifier) {
    try {
      for (let i = 0; i < ids.length; i++) {
        const l = lignes[i];
        notifies = Math.max(notifies, await notifierSeance({ id: ids[i], ...l, scope_type: l.scope_type }, 'seance', { nouvelle: true }));
      }
    } catch (e) {
      return { ok: true, crees: ids.length, notifies, avertissement: `Séances créées, mais ${e instanceof Error ? e.message : 'les notifications ont échoué'}.` };
    }
  }
  return { ok: true, crees: ids.length, notifies };
}
