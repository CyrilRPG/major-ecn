'use server';

import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';

export async function startAnnaleAction(formData: FormData) {
  const coursId = String(formData.get('coursId') ?? '');
  const serieId = String(formData.get('serieId') ?? '');
  const mode = formData.get('training') ? 'training' : 'live';
  if (!coursId || !serieId) return;

  const { user } = await requireUser();
  const supabase = await createClient();

  const { count } = await supabase
    .from('qcm_questions')
    .select('id', { count: 'exact', head: true })
    .eq('serie_id', serieId);

  const { data: session } = await supabase
    .from('qcm_sessions')
    .insert({
      user_id: user.id,
      serie_id: serieId,
      score_correct: 0,
      score_total: count ?? 0,
    })
    .select('id')
    .single();

  if (!session) return;
  redirect(`/cours/${coursId}/annales/${serieId}?session=${session.id}&mode=${mode}`);
}
