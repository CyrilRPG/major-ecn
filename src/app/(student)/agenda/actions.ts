'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';

/**
 * CRUD pour les événements personnels d'agenda. Aucune validation côté
 * UI ne doit être considérée comme suffisante : le serveur revalide tout
 * via Zod avant tout INSERT/UPDATE.
 */

const eventSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(120),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  start_time: z.string().regex(/^\d{2}:\d{2}$/).optional().or(z.literal('')),
  end_time:   z.string().regex(/^\d{2}:\d{2}$/).optional().or(z.literal('')),
  category: z.enum(['Révision', 'Examen', 'Stage', 'Autre']).default('Révision'),
  color_key: z.enum(['violet', 'rose', 'bleu', 'vert', 'orange', 'turquoise']).default('violet'),
  notes: z.string().max(1000).optional().or(z.literal('')),
});

export type AgendaEventInput = z.infer<typeof eventSchema>;

export async function upsertAgendaEvent(form: FormData) {
  const { user } = await requireUser();
  const raw = {
    id: form.get('id')?.toString() || undefined,
    title: form.get('title')?.toString() ?? '',
    date: form.get('date')?.toString() ?? '',
    start_time: form.get('start_time')?.toString() ?? '',
    end_time: form.get('end_time')?.toString() ?? '',
    category: (form.get('category')?.toString() as AgendaEventInput['category']) ?? 'Révision',
    color_key: (form.get('color_key')?.toString() as AgendaEventInput['color_key']) ?? 'violet',
    notes: form.get('notes')?.toString() ?? '',
  };
  const parsed = eventSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: 'Données invalides' };
  }
  const data = parsed.data;
  const supabase = await createClient();
  const payload = {
    user_id: user.id,
    title: data.title,
    date: data.date,
    start_time: data.start_time || null,
    end_time: data.end_time || null,
    category: data.category,
    color_key: data.color_key,
    notes: data.notes || null,
  };
  // Les types Supabase générés n'incluent pas encore user_agenda_events
  // (nouvelle migration) → cast vers any le temps que `pnpm gen:types`
  // tourne. Le RLS côté DB garantit déjà la sécurité.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  if (data.id) {
    const { error } = await db.from('user_agenda_events').update(payload).eq('id', data.id).eq('user_id', user.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await db.from('user_agenda_events').insert(payload);
    if (error) return { error: error.message };
  }
  revalidatePath('/agenda');
  return { ok: true };
}

export async function deleteAgendaEvent(id: string) {
  const { user } = await requireUser();
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { error } = await db.from('user_agenda_events').delete().eq('id', id).eq('user_id', user.id);
  if (error) return { error: error.message };
  revalidatePath('/agenda');
  return { ok: true };
}
