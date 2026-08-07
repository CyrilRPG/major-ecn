'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/require-role';
import { createAdminClient } from '@/lib/supabase/admin';

export type GenericSectionKey = 'countdown' | 'inscription' | 'postes' | 'dates_cles';

export type GenericEntry = {
  college_id: string;
  data: Record<string, unknown>;
};

export async function saveGenericSection(
  sectionKey: GenericSectionKey,
  entries: GenericEntry[],
) {
  await requireAdmin();
  const admin = createAdminClient();

  for (const entry of entries) {
    const hasData = Object.values(entry.data).some((v) =>
      v !== '' && v !== null && v !== undefined && v !== 0,
    );

    if (hasData) {
      await (admin as any)
        .from('homepage_generic_data')
        .upsert(
          {
            section_key: sectionKey,
            college_id: entry.college_id,
            data: entry.data,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'section_key,college_id' },
        );
    } else {
      await (admin as any)
        .from('homepage_generic_data')
        .delete()
        .eq('section_key', sectionKey)
        .eq('college_id', entry.college_id);
    }
  }

  revalidatePath('/admin/annonces');
  revalidatePath('/accueil');
  return { ok: true as const };
}

export async function loadGenericSection(sectionKey: GenericSectionKey) {
  await requireAdmin();
  const admin = createAdminClient();

  const { data } = await (admin as any)
    .from('homepage_generic_data')
    .select('college_id, data')
    .eq('section_key', sectionKey);

  return (data ?? []) as { college_id: string; data: Record<string, unknown> }[];
}
