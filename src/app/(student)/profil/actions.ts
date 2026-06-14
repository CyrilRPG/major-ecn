'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { generatePseudo } from '@/lib/auth/pseudo';

type Result = { ok: true } | { error: string };

// Étudiants : pseudo "kebab/.dot" (sans espace). Professeurs : pseudos plus
// expressifs (« Professeur Cardiologie ») — donc on autorise lettres
// accentuées, chiffres, espaces et ponctuation simple.
const PSEUDO_STUDENT_RE = /^[a-z0-9._-]{3,40}$/i;
const PSEUDO_PROF_RE = /^[\p{L}\p{N} ._'-]{3,60}$/u;

export async function updatePseudoAction(formData: FormData): Promise<Result> {
  const { user, profile } = await requireUser();
  const isStaff = profile.role === 'professor' || profile.role === 'admin';
  const raw = String(formData.get('pseudo') ?? '').trim();
  const normalized = isStaff ? raw.replace(/\s+/g, ' ') : raw.toLowerCase();
  if (!normalized) return { error: 'Le pseudo ne peut pas être vide.' };

  const re = isStaff ? PSEUDO_PROF_RE : PSEUDO_STUDENT_RE;
  if (!re.test(normalized)) {
    return {
      error: isStaff
        ? '3–60 caractères, lettres (accents OK), chiffres, espace, point, tiret, underscore ou apostrophe.'
        : '3–40 caractères, lettres, chiffres, point, tiret ou underscore uniquement.',
    };
  }

  const supabase = await createClient();

  const { data: clash } = await supabase
    .from('profiles')
    .select('id')
    .ilike('pseudo', normalized)
    .neq('id', user.id)
    .maybeSingle();
  if (clash) return { error: 'Ce pseudo est déjà pris. Essayez-en un autre.' };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await supabase
    .from('profiles')
    .update({ pseudo: normalized } as any)
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
