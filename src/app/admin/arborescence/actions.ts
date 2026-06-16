'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

/* ============================================================
   Helpers
   ============================================================ */
async function requireAdminClient() {
  // Vérifie que l'utilisateur courant est admin, puis utilise le client admin
  // (service_role) pour les écritures — évite les soucis de RLS.
  const supa = await createClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) throw new Error('Non authentifié');
  const { data: profile } = await supa
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();
  if (profile?.role !== 'admin') throw new Error('Accès admin requis');
  return createAdminClient();
}

const SLUG = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/* ============================================================
   COLLÈGES (matieres)
   ============================================================ */
export async function createCollege(input: {
  nom: string;
  icon_key?: string;
  color_hex?: string;
  min_offer?: 'essentiel' | 'premium' | 'intensif' | null;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  try {
    const admin = await requireAdminClient();
    const baseId = SLUG(input.nom);
    let id = `col-${baseId}`;
    // Vérifier unicité de l'id
    let attempt = 0;
    while (attempt < 10) {
      const { data: exists } = await admin.from('matieres').select('id').eq('id', id).maybeSingle();
      if (!exists) break;
      attempt++;
      id = `col-${baseId}-${attempt + 1}`;
    }
    // semestre cible : par convention 1er semestre de la faculté EDN
    const { data: sem } = await admin
      .from('semestres')
      .select('id')
      .eq('faculte_id', 'major-ecn')
      .order('numero', { ascending: true })
      .limit(1)
      .maybeSingle();
    if (!sem) return { ok: false, error: 'Aucun semestre trouvé (faculté major-ecn)' };

    // order_index = max + 1
    const { data: maxRow } = await admin
      .from('matieres')
      .select('order_index')
      .order('order_index', { ascending: false })
      .limit(1)
      .maybeSingle();
    const order_index = (maxRow?.order_index ?? 0) + 1;

    const payload: Record<string, unknown> = {
      id,
      semestre_id: sem.id,
      nom: input.nom.trim(),
      icon_key: input.icon_key ?? 'book-open',
      color_hex: input.color_hex ?? '#E4002B',
      order_index,
    };
    if (input.min_offer) payload.min_offer = input.min_offer;

    const { error } = await (admin as unknown as {
      from: (t: string) => { insert: (v: Record<string, unknown>) => Promise<{ error: { message: string } | null }> };
    }).from('matieres').insert(payload);
    if (error) return { ok: false, error: error.message };
    revalidatePath('/admin/arborescence');
    revalidatePath('/admin/contenu');
    return { ok: true, id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Erreur inconnue' };
  }
}

export async function renameCollege(id: string, nom: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const admin = await requireAdminClient();
    const { error } = await admin.from('matieres').update({ nom: nom.trim() }).eq('id', id);
    if (error) return { ok: false, error: error.message };
    revalidatePath('/admin/arborescence');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Erreur' };
  }
}

export async function updateCollegePermission(
  id: string,
  min_offer: 'essentiel' | 'premium' | 'intensif' | null,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const admin = await requireAdminClient();
    const { error } = await (admin as unknown as {
      from: (t: string) => { update: (v: Record<string, unknown>) => { eq: (c: string, v: string) => Promise<{ error: { message: string } | null }> } };
    })
      .from('matieres')
      .update({ min_offer })
      .eq('id', id);
    if (error) return { ok: false, error: error.message };
    revalidatePath('/admin/arborescence');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Erreur' };
  }
}

/** Périmètre d'accès du collège ('all' = toute l'offre / 'specific' = collège spécifique). */
export async function updateCollegeAccessType(
  id: string,
  access_type: 'all' | 'specific',
): Promise<{ ok: boolean; error?: string }> {
  try {
    const admin = await requireAdminClient();
    const { error } = await (admin as unknown as {
      from: (t: string) => { update: (v: Record<string, unknown>) => { eq: (c: string, v: string) => Promise<{ error: { message: string } | null }> } };
    })
      .from('matieres')
      .update({ access_type })
      .eq('id', id);
    if (error) return { ok: false, error: error.message };
    revalidatePath('/admin/arborescence');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Erreur' };
  }
}

/** Périmètre d'accès du cours (item) — même sémantique que pour les collèges. */
export async function updateCoursAccessType(
  id: string,
  access_type: 'all' | 'specific',
): Promise<{ ok: boolean; error?: string }> {
  try {
    const admin = await requireAdminClient();
    const { error } = await (admin as unknown as {
      from: (t: string) => { update: (v: Record<string, unknown>) => { eq: (c: string, v: string) => Promise<{ error: { message: string } | null }> } };
    })
      .from('cours')
      .update({ access_type })
      .eq('id', id);
    if (error) return { ok: false, error: error.message };
    revalidatePath('/admin/arborescence');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Erreur' };
  }
}

export async function deleteCollege(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const admin = await requireAdminClient();
    const { error } = await admin.from('matieres').delete().eq('id', id);
    if (error) return { ok: false, error: error.message };
    revalidatePath('/admin/arborescence');
    revalidatePath('/admin/contenu');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Erreur' };
  }
}

/* ============================================================
   ITEMS (cours)
   ============================================================ */
const DEFAULT_SLOTS: { label: string; content_type: 'video' | 'fiche' | 'qcm' | 'flashcards' }[] = [
  { label: 'Cours vidéo',                content_type: 'video' },
  { label: 'Fiche de cours exhaustive',  content_type: 'fiche' },
  { label: 'Dossiers progressifs & QI',  content_type: 'qcm' },
  { label: 'Flashcards',                 content_type: 'flashcards' },
];

export async function createItem(input: {
  matiere_id: string;
  titre: string;
  description?: string;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  try {
    const admin = await requireAdminClient();
    const { data: maxRow } = await admin
      .from('cours')
      .select('order_index')
      .eq('matiere_id', input.matiere_id)
      .order('order_index', { ascending: false })
      .limit(1)
      .maybeSingle();
    const order_index = (maxRow?.order_index ?? 0) + 1;
    const { data: created, error } = await admin
      .from('cours')
      .insert({
        matiere_id: input.matiere_id,
        titre: input.titre.trim(),
        description: input.description ?? null,
        order_index,
      })
      .select('id')
      .single();
    if (error || !created) return { ok: false, error: error?.message ?? 'Échec création' };
    // Crée les 4 slots par défaut
    const slots = DEFAULT_SLOTS.map((s, i) => ({
      cours_id: created.id,
      label: s.label,
      content_type: s.content_type,
      position: i,
    }));
    await (admin as unknown as {
      from: (t: string) => { insert: (v: unknown) => Promise<{ error: { message: string } | null }> };
    })
      .from('cours_content_slots')
      .insert(slots);
    revalidatePath('/admin/arborescence');
    revalidatePath('/admin/contenu');
    return { ok: true, id: created.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Erreur' };
  }
}

export async function renameItem(id: string, titre: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const admin = await requireAdminClient();
    const { error } = await admin.from('cours').update({ titre: titre.trim() }).eq('id', id);
    if (error) return { ok: false, error: error.message };
    revalidatePath('/admin/arborescence');
    revalidatePath('/admin/contenu');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Erreur' };
  }
}

export async function deleteItem(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const admin = await requireAdminClient();
    const { error } = await admin.from('cours').delete().eq('id', id);
    if (error) return { ok: false, error: error.message };
    revalidatePath('/admin/arborescence');
    revalidatePath('/admin/contenu');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Erreur' };
  }
}

export async function duplicateItem(id: string): Promise<{ ok: true; new_id: string } | { ok: false; error: string }> {
  try {
    const admin = await requireAdminClient();
    const { data: src } = await admin
      .from('cours')
      .select('matiere_id, titre, description, order_index')
      .eq('id', id)
      .maybeSingle();
    if (!src) return { ok: false, error: 'Item introuvable' };
    const { data: created, error } = await admin
      .from('cours')
      .insert({
        matiere_id: src.matiere_id,
        titre: `${src.titre} (copie)`,
        description: src.description,
        order_index: (src.order_index ?? 0) + 1,
      })
      .select('id')
      .single();
    if (error || !created) return { ok: false, error: error?.message ?? 'Échec duplication' };
    // Duplique aussi les slots
    const { data: slots } = await (admin as unknown as {
      from: (t: string) => { select: (s: string) => { eq: (c: string, v: string) => Promise<{ data: Array<{ label: string; content_type: string; position: number }> | null }> } };
    })
      .from('cours_content_slots')
      .select('label, content_type, position')
      .eq('cours_id', id);
    if (slots && slots.length > 0) {
      await (admin as unknown as {
        from: (t: string) => { insert: (v: unknown) => Promise<{ error: { message: string } | null }> };
      })
        .from('cours_content_slots')
        .insert(slots.map((s) => ({ ...s, cours_id: created.id })));
    }
    revalidatePath('/admin/arborescence');
    revalidatePath('/admin/contenu');
    return { ok: true, new_id: created.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Erreur' };
  }
}

export async function moveItem(id: string, target_matiere_id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const admin = await requireAdminClient();
    const { error } = await admin
      .from('cours')
      .update({ matiere_id: target_matiere_id })
      .eq('id', id);
    if (error) return { ok: false, error: error.message };
    revalidatePath('/admin/arborescence');
    revalidatePath('/admin/contenu');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Erreur' };
  }
}

/* ============================================================
   SLOTS DE CONTENU (cours_content_slots)
   ============================================================ */
export async function addSlot(input: {
  cours_id: string;
  label: string;
  content_type: 'video' | 'fiche' | 'qcm' | 'flashcards';
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const admin = await requireAdminClient();
    const adminAny = admin as unknown as {
      from: (t: string) => {
        select: (s: string) => {
          eq: (c: string, v: string) => {
            order: (c: string, o: { ascending: boolean }) => {
              limit: (n: number) => { maybeSingle: () => Promise<{ data: { position: number } | null }> };
            };
          };
        };
        insert: (v: unknown) => Promise<{ error: { message: string } | null }>;
      };
    };
    const { data: maxRow } = await adminAny
      .from('cours_content_slots')
      .select('position')
      .eq('cours_id', input.cours_id)
      .order('position', { ascending: false })
      .limit(1)
      .maybeSingle();
    const position = (maxRow?.position ?? -1) + 1;
    const { error } = await adminAny.from('cours_content_slots').insert({
      cours_id: input.cours_id,
      label: input.label.trim(),
      content_type: input.content_type,
      position,
    });
    if (error) return { ok: false, error: error.message };
    revalidatePath('/admin/arborescence');
    revalidatePath('/admin/contenu');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Erreur' };
  }
}

export async function deleteSlot(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const admin = await requireAdminClient();
    const { error } = await (admin as unknown as {
      from: (t: string) => { delete: () => { eq: (c: string, v: string) => Promise<{ error: { message: string } | null }> } };
    })
      .from('cours_content_slots')
      .delete()
      .eq('id', id);
    if (error) return { ok: false, error: error.message };
    revalidatePath('/admin/arborescence');
    revalidatePath('/admin/contenu');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Erreur' };
  }
}

/** Réordonne un contenu (slot) au sein de son item : échange la position avec
 *  le contenu voisin (haut / bas). C'est cet ordre qui pilote l'affichage des
 *  cartes côté élève sur l'accueil du parcours. */
export async function moveSlot(
  id: string,
  direction: 'up' | 'down',
): Promise<{ ok: boolean; error?: string }> {
  try {
    const admin = await requireAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const a = admin as any;
    const { data: cur } = await a
      .from('cours_content_slots')
      .select('id, cours_id, position')
      .eq('id', id)
      .maybeSingle();
    if (!cur) return { ok: false, error: 'Contenu introuvable' };

    const { data: siblings } = await a
      .from('cours_content_slots')
      .select('id, position')
      .eq('cours_id', cur.cours_id)
      .order('position', { ascending: true });
    const list = (siblings ?? []) as { id: string; position: number }[];
    const idx = list.findIndex((s) => s.id === id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (idx < 0 || swapIdx < 0 || swapIdx >= list.length) return { ok: true };

    const other = list[swapIdx];
    await a.from('cours_content_slots').update({ position: other.position }).eq('id', cur.id);
    await a.from('cours_content_slots').update({ position: cur.position }).eq('id', other.id);
    revalidatePath('/admin/arborescence');
    revalidatePath('/admin/contenu');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Erreur' };
  }
}
