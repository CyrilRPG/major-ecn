import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  CONTENT_TYPES, PERMISSION_LEVELS,
  UpdateProfessorScopeSchema,
  type ContentType, type PermissionLevel,
} from '@/lib/schemas/professor';

/**
 * Modifie les accès d'un professeur existant (collèges, cours, permissions par
 * type de contenu). Écrit dans `profiles.permission_scope`, lu en SSR par
 * `getProfessorScope()` → impact immédiat sur tous les guards
 * (`profCanAccessCours`, `canRead`, `canWrite`) côté pages admin/contenu.
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { data: me } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (me?.role !== 'admin') {
    return NextResponse.json({ error: 'Réservé aux administrateurs' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = UpdateProfessorScopeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Données invalides' },
      { status: 400 },
    );
  }

  const { userId, permission_type, colleges, cours, content_permissions } = parsed.data;

  let admin;
  try { admin = createAdminClient(); } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Service indisponible' },
      { status: 500 },
    );
  }

  // Vérifier que la cible est bien un professeur (anti-méprise).
  const { data: target } = await admin
    .from('profiles')
    .select('role, permission_scope')
    .eq('id', userId)
    .maybeSingle();
  if (!target || target.role !== 'professor') {
    return NextResponse.json({ error: 'Ce compte n’est pas un professeur.' }, { status: 404 });
  }

  const cleanedColleges = permission_type === 'college' ? (colleges ?? []) : [];
  const cleanedCours = permission_type === 'college' ? (cours ?? []).filter((c) => typeof c === 'string') : [];
  const cleanedPermissions: Partial<Record<ContentType, PermissionLevel>> = {};
  for (const t of CONTENT_TYPES) {
    const lvl = content_permissions?.[t];
    if (lvl && (PERMISSION_LEVELS as readonly string[]).includes(lvl) && lvl !== 'none') {
      cleanedPermissions[t] = lvl;
    }
  }

  const permission_scope = {
    role: 'professor' as const,
    type: permission_type,
    colleges: cleanedColleges,
    ...(cleanedCours.length > 0 ? { cours: cleanedCours } : {}),
    content_permissions: cleanedPermissions,
  };

  const { error } = await admin
    .from('profiles')
    .update({ permission_scope } as never)
    .eq('id', userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
