import { NextResponse } from 'next/server';
import { requireAdminRequest } from '@/lib/auth/api-guard';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  CONTENT_TYPES, PERMISSION_LEVELS, QCM_KINDS,
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
  const guard = await requireAdminRequest(req);
  if (!guard.ok) return guard.error;

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

  // Auto-include child sub-matières so permission checks pass for nested matières
  if (cleanedColleges.length > 0) {
    const { data: childMats } = await admin
      .from('matieres')
      .select('id')
      .in('parent_matiere_id', cleanedColleges);
    if (childMats) {
      for (const ch of childMats) {
        if (!cleanedColleges.includes(ch.id)) cleanedColleges.push(ch.id);
      }
    }
  }
  // On persiste AUSSI les « none » explicites. Sans cela, retirer un accès
  // revenait à supprimer la clé — indistinguable d'un scope ancien où la clé
  // n'a jamais existé —, et la rétrocompat de `effectiveLevel()` faisait
  // réhériter DP/QROC du niveau « qcm » : l'accès révoqué revenait tout seul.
  const cleanedPermissions: Partial<Record<ContentType, PermissionLevel>> = {};
  for (const t of CONTENT_TYPES) {
    const lvl = content_permissions?.[t];
    if (lvl && (PERMISSION_LEVELS as readonly string[]).includes(lvl)) {
      cleanedPermissions[t] = lvl;
    }
  }
  // Un enregistrement depuis l'admin décrit un état complet : les sous-types
  // QCM/DP/QROC non transmis sont explicitement « aucun accès », jamais hérités.
  for (const t of QCM_KINDS) {
    if (cleanedPermissions[t] === undefined) cleanedPermissions[t] = 'none';
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
