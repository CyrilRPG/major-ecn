'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireStaff } from '@/lib/auth/require-role';
import { ongletsDe } from '@/lib/auth/onglets-equipe';
import { notifierSeance } from '@/lib/notifications/eleves';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * CRUD admin pour les évènements plateforme (cours en visio, ECOS, concours blancs…).
 * Chaque évènement porte un scope de permissions (offres + collèges) qui
 * détermine côté étudiant si l'évènement est affiché dans l'agenda.
 *
 * Ouvert aux administrateurs et au personnel doté du module « Agenda »
 * (Gestionnaire de l'agenda, 08/10/2026). La RLS de `platform_events`
 * n'autorise l'écriture qu'aux administrateurs : le droit est vérifié ici,
 * puis l'écriture passe par le client service-role.
 */

async function gardeAgenda() {
  const r = await requireStaff();
  if (!r.isAdmin && !(await ongletsDe(r.profile)).agenda) return null;
  return r;
}

const eventSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(180),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  start_time: z.string().regex(/^\d{2}:\d{2}$/).optional().or(z.literal('')),
  end_time:   z.string().regex(/^\d{2}:\d{2}$/).optional().or(z.literal('')),
  college: z.string().max(80).optional().or(z.literal('')),
  intervenant: z.string().max(180).optional().or(z.literal('')),
  // https seulement : le lien est remis tel quel à l'élève après émargement.
  zoom_url: z.string().trim().max(500).regex(/^https:\/\/\S+$/, 'Le lien de la visio doit commencer par https://').optional().or(z.literal('')),
  notes: z.string().max(2000).optional().or(z.literal('')),
  required_offers: z.array(z.enum(['essentiel', 'intensif', 'approfondi'])).min(1),
  scope_type: z.enum(['all', 'college']),
  scope_colleges: z.array(z.string().min(1)).default([]),
  voies: z.array(z.enum(['interne', 'externe'])).min(1),
})
  // 18:00 → 17:00 s'affichait « 18h00 - 17h00 (23 h) » dans le planning.
  .refine((d) => !d.start_time || !d.end_time || d.end_time > d.start_time, {
    message: 'L’heure de fin doit être après l’heure de début.',
  })
  // « Spécialités ciblées » sans aucune case était visible de TOUS les élèves
  // alors que la carte admin annonçait « 0 collège ».
  .refine((d) => d.scope_type !== 'college' || d.scope_colleges.length > 0, {
    message: 'Cochez au moins une spécialité, ou choisissez « Toutes les spécialités ».',
  });

export type AdminEventInput = z.infer<typeof eventSchema>;

function parseForm(form: FormData): unknown {
  return {
    id: form.get('id')?.toString() || undefined,
    title: form.get('title')?.toString() ?? '',
    date: form.get('date')?.toString() ?? '',
    start_time: form.get('start_time')?.toString() ?? '',
    end_time: form.get('end_time')?.toString() ?? '',
    college: form.get('college')?.toString() ?? '',
    intervenant: form.get('intervenant')?.toString() ?? '',
    zoom_url: form.get('zoom_url')?.toString() ?? '',
    notes: form.get('notes')?.toString() ?? '',
    required_offers: form.getAll('required_offers').map((v) => v.toString()),
    scope_type: form.get('scope_type')?.toString() ?? 'all',
    scope_colleges: form.getAll('scope_colleges').map((v) => v.toString()),
    voies: form.getAll('voies').map((v) => v.toString()),
  };
}

/** Cases « notifier » du formulaire (hors schéma : elles ne sont pas stockées). */
const coche = (form: FormData, nom: string) => form.get(nom)?.toString() === 'on';

export async function upsertPlatformEvent(form: FormData) {
  const garde = await gardeAgenda();
  if (!garde) return { error: 'Accès réservé à la gestion de l’agenda.' };
  const { user } = garde;
  const parsed = eventSchema.safeParse(parseForm(form));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Données invalides.' };
  const d = parsed.data;
  const payload = {
    title: d.title,
    date: d.date,
    start_time: d.start_time || null,
    end_time: d.end_time || null,
    college: d.college || null,
    intervenant: d.intervenant || null,
    zoom_url: d.zoom_url || null,
    notes: d.notes || null,
    required_offers: d.required_offers,
    scope_type: d.scope_type,
    scope_colleges: d.scope_type === 'college' ? d.scope_colleges : [],
    voies: d.voies,
    created_by: user.id,
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any;
  if (d.id) {
    const { error } = await db.from('platform_events').update(payload).eq('id', d.id);
    if (error) return { error: error.message };
    // Les émargements gardent un instantané de la séance : une séance déplacée
    // ou renommée doit l'être aussi sur les feuilles déjà signées.
    const { error: snapErr } = await db
      .from('session_presences')
      .update({
        event_title: payload.title,
        event_date: payload.date,
        start_time: payload.start_time,
        end_time: payload.end_time,
        college: payload.college,
        intervenant: payload.intervenant,
      })
      .eq('event_id', d.id);
    if (snapErr) console.error('[agenda] instantané des émargements non mis à jour', snapErr.message);
  }
  let id = d.id;
  if (!id) {
    const { data, error } = await db.from('platform_events').insert(payload).select('id').single();
    if (error) return { error: error.message };
    id = (data as { id: string }).id;
  }
  revalidatePath('/admin/agenda');
  revalidatePath('/agenda');
  revalidatePath('/accueil');

  // Notifications de l'espace élève, sur demande seulement.
  const evenement = { id: id!, ...payload, scope_type: payload.scope_type as 'all' | 'college' };
  let notifies = 0;
  try {
    if (coche(form, 'notifier_lien') && payload.zoom_url) notifies = Math.max(notifies, await notifierSeance(evenement, 'lien'));
    if (coche(form, 'notifier')) notifies = Math.max(notifies, await notifierSeance(evenement, 'seance', { nouvelle: !d.id }));
  } catch (e) {
    return { ok: true, avertissement: `Évènement enregistré, mais ${e instanceof Error ? e.message : 'les notifications ont échoué'}.` };
  }
  return { ok: true, notifies };
}

export async function deletePlatformEvent(id: string) {
  if (!(await gardeAgenda())) return { error: 'Accès réservé à la gestion de l’agenda.' };
  if (!z.string().uuid().safeParse(id).success) return { error: 'Évènement introuvable.' };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any;
  const { error } = await db.from('platform_events').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/agenda');
  revalidatePath('/agenda');
  revalidatePath('/accueil');
  return { ok: true };
}
