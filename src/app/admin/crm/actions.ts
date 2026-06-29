'use server';

import { createClient } from '@/lib/supabase/server';

type NoteInput = {
  user_id: string;
  contact_type: string;
  motif: string;
  observations: string | null;
  difficultes: string | null;
  actions_recommandees: string | null;
  relance_date: string | null;
};

type NoteRow = {
  id: string;
  user_id: string;
  contact_type: string;
  motif: string;
  observations: string | null;
  difficultes: string | null;
  actions_recommandees: string | null;
  relance_date: string | null;
  created_at: string;
};

export async function addNote(
  input: NoteInput,
): Promise<{ ok: true; note: NoteRow } | { ok: false; error: string }> {
  const supa = await createClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return { ok: false, error: 'Non authentifié' };

  const row = {
    user_id: input.user_id,
    author_id: user.id,
    contact_type: input.contact_type,
    motif: input.motif,
    observations: input.observations,
    difficultes: input.difficultes,
    actions_recommandees: input.actions_recommandees,
    relance_date: input.relance_date,
  };

  const { data, error } = await (supa as unknown as {
    from: (t: string) => {
      insert: (v: Record<string, unknown>) => {
        select: () => {
          single: () => Promise<{ data: NoteRow | null; error: { message: string } | null }>;
        };
      };
    };
  }).from('pedagogical_notes').insert(row).select().single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, note: data! };
}
