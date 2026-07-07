'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';

/**
 * CRUD admin pour les évènements plateforme (cours en visio, ECOS, concours blancs…).
 * Chaque évènement porte un scope de permissions (offres + collèges) qui
 * détermine côté étudiant si l'évènement est affiché dans l'agenda.
 */

const eventSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(180),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  start_time: z.string().regex(/^\d{2}:\d{2}$/).optional().or(z.literal('')),
  end_time:   z.string().regex(/^\d{2}:\d{2}$/).optional().or(z.literal('')),
  college: z.string().max(80).optional().or(z.literal('')),
  intervenant: z.string().max(180).optional().or(z.literal('')),
  zoom_url: z.string().url().max(500).optional().or(z.literal('')),
  notes: z.string().max(2000).optional().or(z.literal('')),
  required_offers: z.array(z.enum(['essentiel', 'intensif', 'approfondi'])).min(1),
  scope_type: z.enum(['all', 'college']),
  scope_colleges: z.array(z.string().min(1)).default([]),
  voies: z.array(z.enum(['interne', 'externe'])).min(1),
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

export async function upsertPlatformEvent(form: FormData) {
  const { user } = await requireAdmin();
  const parsed = eventSchema.safeParse(parseForm(form));
  if (!parsed.success) return { error: 'Données invalides : ' + parsed.error.issues[0]?.message };
  const d = parsed.data;
  const supabase = await createClient();
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
  const db = supabase as any;
  if (d.id) {
    const { error } = await db.from('platform_events').update(payload).eq('id', d.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await db.from('platform_events').insert(payload);
    if (error) return { error: error.message };
  }
  revalidatePath('/admin/agenda');
  revalidatePath('/agenda');
  return { ok: true };
}

export async function deletePlatformEvent(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { error } = await db.from('platform_events').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/agenda');
  revalidatePath('/agenda');
  return { ok: true };
}
