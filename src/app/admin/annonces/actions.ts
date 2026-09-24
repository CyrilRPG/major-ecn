'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/require-role';
import { createAdminClient } from '@/lib/supabase/admin';
import { chargerAnnonces } from '@/lib/annonces/server';
import {
  SECTION_CONCOURS, SECTIONS_HERITEES, TYPES_REMPLACES, collegesVises, normaliserFiche,
  type FicheConcours,
} from '@/lib/annonces/concours';

/* eslint-disable @typescript-eslint/no-explicit-any */

type Resultat = { ok: true; message?: string } | { ok: false; error: string };

async function ensureAdmin() {
  await requireAdmin();
  return createAdminClient() as any;
}

function rafraichir() {
  revalidatePath('/admin/annonces');
  revalidatePath('/accueil');
  revalidatePath('/matieres/[matiere]', 'page');
}

/* ───────────────────────────── fiches concours ───────────────────────────── */

/** Écrit la fiche d'un collège (une ligne `concours` par collège). */
async function ecrireFiche(admin: any, collegeId: string, fiche: FicheConcours): Promise<string | null> {
  const { data: existante, error: lectureErr } = await admin
    .from('homepage_generic_data').select('id')
    .eq('section_key', SECTION_CONCOURS).eq('college_id', collegeId).maybeSingle();
  if (lectureErr) return lectureErr.message;
  const ligne = { data: fiche, updated_at: new Date().toISOString() };
  const { error } = existante
    ? await admin.from('homepage_generic_data').update(ligne).eq('id', existante.id)
    : await admin.from('homepage_generic_data').insert({ ...ligne, section_key: SECTION_CONCOURS, college_id: collegeId });
  if (error) return error.message;
  // Les anciennes sections de ce collège sont désormais portées par la fiche.
  await admin.from('homepage_generic_data').delete().eq('college_id', collegeId).in('section_key', [...SECTIONS_HERITEES]);
  return null;
}

const Champs = z.enum(['date_epreuve', 'inscriptions', 'postes', 'dates', 'note', 'lien']);
export type ChampFiche = z.infer<typeof Champs>;

const CLES_PAR_CHAMP: Record<ChampFiche, (keyof FicheConcours)[]> = {
  date_epreuve: ['date_epreuve'],
  inscriptions: ['inscription_debut', 'inscription_fin', 'inscription_texte'],
  postes: ['postes_externe', 'postes_interne'],
  dates: ['dates'],
  note: ['note'],
  lien: ['lien_label', 'lien_url'],
};

/**
 * Enregistre une fiche pour une ou plusieurs spécialités d'un coup.
 * `champs` absent : la fiche entière remplace celle de chaque spécialité.
 * `champs` présent : seuls ces champs sont copiés, le reste de chaque fiche
 * est conservé (ex. appliquer le même calendrier à dix spécialités sans
 * toucher à leurs postes).
 */
export async function enregistrerFiche(input: { colleges: string[]; fiche: unknown; champs?: ChampFiche[] }): Promise<Resultat> {
  const admin = await ensureAdmin();
  const colleges = z.array(z.string().min(1)).min(1, 'Choisis au moins une spécialité.').safeParse(input.colleges);
  if (!colleges.success) return { ok: false, error: colleges.error.issues[0]?.message ?? 'Spécialité manquante' };
  const champs = input.champs ? z.array(Champs).safeParse(input.champs) : null;
  if (champs && !champs.success) return { ok: false, error: 'Champs invalides' };
  const fiche = { ...normaliserFiche(input.fiche), retiree: false };
  if (fiche.lien_url && !/^(https?:\/\/|\/)/i.test(fiche.lien_url)) {
    return { ok: false, error: 'Le lien doit commencer par https:// (ou / pour une page du site).' };
  }
  if (fiche.inscription_debut && fiche.inscription_fin && fiche.inscription_debut > fiche.inscription_fin) {
    return { ok: false, error: 'La clôture des inscriptions précède leur ouverture.' };
  }

  // Valeurs actuelles (anciens blocs compris) pour une copie partielle.
  const actuelles = champs ? (await chargerAnnonces(admin)).fiches : null;
  for (const c of colleges.data) {
    let cible = fiche;
    if (champs && actuelles) {
      cible = { ...(actuelles.get(c) ?? normaliserFiche({})), retiree: false };
      for (const ch of champs.data) for (const k of CLES_PAR_CHAMP[ch]) (cible as Record<string, unknown>)[k] = fiche[k];
    }
    const err = await ecrireFiche(admin, c, cible);
    if (err) return { ok: false, error: err };
  }
  rafraichir();
  return { ok: true, message: colleges.data.length > 1 ? `${colleges.data.length} spécialités mises à jour.` : 'Fiche enregistrée.' };
}

/** Retire la fiche : plus rien ne s'affiche pour cette spécialité, anciens blocs compris. */
export async function retirerFiche(collegeId: string): Promise<Resultat> {
  const admin = await ensureAdmin();
  const err = await ecrireFiche(admin, collegeId, { ...normaliserFiche({}), retiree: true });
  if (err) return { ok: false, error: err };
  rafraichir();
  return { ok: true };
}

/**
 * Convertit l'ancien système en fiches : chaque spécialité alimentée par
 * d'anciens blocs reçoit sa fiche (valeurs identiques à ce que voient les
 * élèves), puis les anciennes sections et les anciens blocs ciblés sur des
 * spécialités sont supprimés. Les anciens blocs globaux restent listés.
 */
export async function convertirAnciensBlocs(): Promise<Resultat> {
  const admin = await ensureAdmin();
  const d = await chargerAnnonces(admin, { messagesMasques: true });
  for (const id of d.heritees) {
    const f = d.fiches.get(id);
    if (!f) continue;
    const err = await ecrireFiche(admin, id, f);
    if (err) return { ok: false, error: err };
  }
  await admin.from('homepage_generic_data').delete().in('section_key', [...SECTIONS_HERITEES]);
  const cibles = d.anciensBlocs.filter((b) => collegesVises(b).length > 0).map((b) => b.id);
  if (cibles.length > 0) await admin.from('homepage_announcements').delete().in('id', cibles);
  rafraichir();
  return { ok: true, message: `${d.heritees.size} fiche(s) créée(s), ${cibles.length} ancien(s) bloc(s) supprimé(s).` };
}

/* ───────────────────────────── messages libres ───────────────────────────── */

const TONE = z.enum(['red', 'green', 'blue', 'orange', 'purple', 'gray']);
const OFFER = z.enum(['essentiel', 'intensif', 'approfondi']);
const SCOPE = z.enum(['all', 'full', 'college']);
const VOIE = z.enum(['interne', 'externe']);

const MessageInput = z.object({
  title: z.string().trim().min(1, 'Titre requis').max(120),
  badge_label: z.string().trim().max(40).optional().nullable(),
  badge_tone: TONE.default('red'),
  icon_key: z.string().max(40).default('megaphone'),
  visible: z.boolean().default(true),
  data: z.object({
    subtitle: z.string().trim().max(120).optional(),
    body: z.string().trim().max(2000).optional(),
    cta_label: z.string().trim().max(60).optional(),
    cta_href: z.string().trim().max(500).optional(),
    footer_note: z.string().trim().max(500).optional(),
    fin_affichage: z.string().trim().max(10).optional(),
  }),
  min_offer: OFFER.nullable().optional(),
  target_scope: SCOPE.default('all'),
  target_colleges: z.array(z.string()).default([]),
  voies: z.array(VOIE).default(['interne', 'externe']),
}).superRefine((m, ctx) => {
  if (m.target_scope === 'college' && m.target_colleges.length === 0) {
    ctx.addIssue({ code: 'custom', message: 'Coche au moins une spécialité (ou choisis « Tous les élèves »).' });
  }
  if (m.data.cta_label && !m.data.cta_href) ctx.addIssue({ code: 'custom', message: 'Le bouton a un libellé mais pas de lien.' });
  if (m.data.cta_href && !/^(https?:\/\/|\/)/i.test(m.data.cta_href)) {
    ctx.addIssue({ code: 'custom', message: 'Le lien du bouton doit commencer par https:// (ou / pour une page du site).' });
  }
});

export type MessageInputT = z.input<typeof MessageInput>;

function nettoyer(m: z.infer<typeof MessageInput>) {
  const data = Object.fromEntries(Object.entries(m.data).filter(([, v]) => typeof v === 'string' && v.length > 0));
  return {
    ...m,
    kind: 'info' as const,
    badge_label: m.badge_label ? m.badge_label : null,
    data,
    target_colleges: m.target_scope === 'college' ? m.target_colleges : [],
    voies: m.voies.length > 0 ? m.voies : ['interne', 'externe'],
  };
}

export async function creerMessage(input: MessageInputT): Promise<Resultat> {
  const admin = await ensureAdmin();
  const parsed = MessageInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalide' };
  const { data: dernier } = await admin
    .from('homepage_announcements').select('order_index').order('order_index', { ascending: false }).limit(1).maybeSingle();
  const { error } = await admin.from('homepage_announcements').insert({ ...nettoyer(parsed.data), order_index: (dernier?.order_index ?? 0) + 10 });
  if (error) return { ok: false, error: error.message };
  rafraichir();
  return { ok: true };
}

export async function modifierMessage(id: string, input: MessageInputT): Promise<Resultat> {
  const admin = await ensureAdmin();
  if (!z.string().uuid().safeParse(id).success) return { ok: false, error: 'Identifiant invalide' };
  const parsed = MessageInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalide' };
  const { error } = await admin.from('homepage_announcements').update(nettoyer(parsed.data)).eq('id', id);
  if (error) return { ok: false, error: error.message };
  rafraichir();
  return { ok: true };
}

export async function supprimerBloc(id: string): Promise<Resultat> {
  const admin = await ensureAdmin();
  const { error } = await admin.from('homepage_announcements').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  rafraichir();
  return { ok: true };
}

export async function basculerVisibilite(id: string, visible: boolean): Promise<Resultat> {
  const admin = await ensureAdmin();
  const { error } = await admin.from('homepage_announcements').update({ visible }).eq('id', id);
  if (error) return { ok: false, error: error.message };
  rafraichir();
  return { ok: true };
}

/** Échange la position du message avec son voisin (ordre exact, sans trou). */
export async function deplacerMessage(id: string, direction: 'up' | 'down'): Promise<Resultat> {
  const admin = await ensureAdmin();
  const { data } = await admin.from('homepage_announcements').select('id, kind, order_index').order('order_index', { ascending: true });
  const liste = ((data ?? []) as { id: string; kind: string; order_index: number }[]).filter((r) => !TYPES_REMPLACES.has(r.kind));
  const i = liste.findIndex((r) => r.id === id);
  const j = direction === 'up' ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= liste.length) return { ok: true };
  // Renumérotation propre (10, 20, 30…) puis échange.
  const ordre = liste.map((r) => r.id);
  [ordre[i], ordre[j]] = [ordre[j], ordre[i]];
  for (let k = 0; k < ordre.length; k++) {
    await admin.from('homepage_announcements').update({ order_index: (k + 1) * 10 }).eq('id', ordre[k]);
  }
  rafraichir();
  return { ok: true };
}
