'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { generatePseudo } from '@/lib/auth/pseudo';

type Result = { ok: true } | { error: string };

const PSEUDO_RE = /^[a-z0-9._-]{3,40}$/i;

export async function updatePseudoAction(formData: FormData): Promise<Result> {
  const raw = String(formData.get('pseudo') ?? '').trim().toLowerCase();
  if (!raw) return { error: 'Le pseudo ne peut pas être vide.' };
  if (!PSEUDO_RE.test(raw)) {
    return { error: '3–40 caractères, lettres, chiffres, point, tiret ou underscore uniquement.' };
  }

  const { user } = await requireUser();
  const supabase = await createClient();

  const { data: clash } = await supabase
    .from('profiles')
    .select('id')
    .ilike('pseudo', raw)
    .neq('id', user.id)
    .maybeSingle();
  if (clash) return { error: 'Ce pseudo est déjà pris. Essayez-en un autre.' };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await supabase
    .from('profiles')
    .update({ pseudo: raw } as any)
    .eq('id', user.id);
  if (error) return { error: error.message };

  revalidatePath('/profil');
  return { ok: true };
}

export async function regeneratePseudoAction(): Promise<Result> {
  const { user, profile } = await requireUser();
  const supabase = await createClient();
  const base = generatePseudo(
    profile.first_name ?? '',
    profile.last_name ?? '',
    profile.promotion ?? 'X',
  );

  // Find a free variant
  let candidate = base;
  for (let i = 0; i < 50; i++) {
    const trial = i === 0 ? candidate : `${base}-${i + 1}`;
    const { data: clash } = await supabase
      .from('profiles')
      .select('id')
      .ilike('pseudo', trial)
      .neq('id', user.id)
      .maybeSingle();
    if (!clash) { candidate = trial; break; }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await supabase
    .from('profiles')
    .update({ pseudo: candidate } as any)
    .eq('id', user.id);
  if (error) return { error: error.message };

  revalidatePath('/profil');
  return { ok: true };
}
