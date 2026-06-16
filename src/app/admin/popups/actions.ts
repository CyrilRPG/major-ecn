'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

/** Vérifie que l'appelant est admin, renvoie le client service-role. */
async function requireAdminClient() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');
  const { data: me } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (me?.role !== 'admin') throw new Error('Réservé aux administrateurs');
  return { admin: createAdminClient(), userId: user.id };
}

export async function createPopup(input: {
  coursId: string;
  title: string;
  videoPath: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const { admin, userId } = await requireAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (admin as any).from('item_popups').insert({
      cours_id: input.coursId,
      title: input.title.trim() || null,
      video_path: input.videoPath,
      created_by: userId,
    });
    if (error) return { ok: false, error: error.message };
    revalidatePath('/admin/popups');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Erreur' };
  }
}

export async function deletePopup(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const { admin } = await requireAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const a = admin as any;
    const { data: row } = await a.from('item_popups').select('video_path').eq('id', id).maybeSingle();
    await a.from('item_popups').delete().eq('id', id);
    if (row?.video_path) {
      await admin.storage.from('item-popups').remove([row.video_path]).catch(() => null);
    }
    revalidatePath('/admin/popups');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Erreur' };
  }
}

export async function togglePopup(id: string, active: boolean): Promise<{ ok: boolean; error?: string }> {
  try {
    const { admin } = await requireAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (admin as any).from('item_popups').update({ active }).eq('id', id);
    if (error) return { ok: false, error: error.message };
    revalidatePath('/admin/popups');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Erreur' };
  }
}
