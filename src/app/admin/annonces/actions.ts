'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/require-role';
import { createAdminClient } from '@/lib/supabase/admin';

const KIND = z.enum(['countdown', 'event_list', 'info', 'stat', 'text']);
const TONE = z.enum(['red', 'green', 'blue', 'orange', 'purple', 'gray']);
const OFFER = z.enum(['essentiel', 'intensif', 'approfondi']);
const SCOPE = z.enum(['all', 'full', 'college']);
const VOIE = z.enum(['interne', 'externe']);

const Base = z.object({
  kind: KIND,
  title: z.string().min(1, 'Titre requis').max(120),
  badge_label: z.string().max(40).optional().nullable(),
  badge_tone: TONE.default('red'),
  icon_key: z.string().max(40).default('megaphone'),
  visible: z.boolean().default(true),
  order_index: z.number().int().default(0),
  /** Champ libre — validé selon le kind ci-dessous. */
  data: z.record(z.string(), z.unknown()).default({}),
  /** Audience — qui voit cette annonce. */
  min_offer: OFFER.nullable().optional(),
  target_scope: SCOPE.default('all'),
  target_colleges: z.array(z.string()).default([]),
  /** Voies ciblées. Vide ou les deux = toutes les voies. */
  voies: z.array(VOIE).default(['interne', 'externe']),
});

const CreateInput = Base;
const UpdateInput = Base.extend({ id: z.string().uuid() });

export type AnnouncementInput = z.infer<typeof CreateInput>;

async function ensureAdmin() {
  await requireAdmin();
  return createAdminClient();
}

export async function createAnnouncement(input: AnnouncementInput) {
  const admin = await ensureAdmin();
  const parsed = CreateInput.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0]?.message ?? 'Invalide' };

  const { error } = await (admin as any).from("homepage_announcements").insert(parsed.data);
  if (error) return { ok: false as const, error: error.message };

  revalidatePath('/admin/annonces');
  revalidatePath('/accueil');
  return { ok: true as const };
}

export async function updateAnnouncement(input: AnnouncementInput & { id: string }) {
  const admin = await ensureAdmin();
  const parsed = UpdateInput.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0]?.message ?? 'Invalide' };

  const { id, ...patch } = parsed.data;
  const { error } = await (admin as any).from("homepage_announcements").update(patch).eq('id', id);
  if (error) return { ok: false as const, error: error.message };

  revalidatePath('/admin/annonces');
  revalidatePath('/accueil');
  return { ok: true as const };
}

export async function deleteAnnouncement(id: string) {
  const admin = await ensureAdmin();
  const { error } = await (admin as any).from("homepage_announcements").delete().eq('id', id);
  if (error) return { ok: false as const, error: error.message };

  revalidatePath('/admin/annonces');
  revalidatePath('/accueil');
  return { ok: true as const };
}

export async function toggleVisibility(id: string, visible: boolean) {
  const admin = await ensureAdmin();
  const { error } = await (admin as any).from("homepage_announcements").update({ visible }).eq('id', id);
  if (error) return { ok: false as const, error: error.message };

  revalidatePath('/admin/annonces');
  revalidatePath('/accueil');
  return { ok: true as const };
}

export async function moveAnnouncement(id: string, direction: 'up' | 'down') {
  const admin = await ensureAdmin();
  // Trick simple : ré-numéroter par décrément/incrément de 10.
  const delta = direction === 'up' ? -15 : 15;
  const { data: current } = await (admin as unknown as { from: (t: string) => { select: (c: string) => { eq: (k: string, v: string) => { maybeSingle: () => Promise<{ data: { order_index: number } | null }> } } } })
    .from('homepage_announcements').select('order_index').eq('id', id).maybeSingle();
  const newIndex = (current?.order_index ?? 0) + delta;
  await (admin as any).from("homepage_announcements").update({ order_index: newIndex }).eq('id', id);

  revalidatePath('/admin/annonces');
  revalidatePath('/accueil');
  return { ok: true as const };
}
