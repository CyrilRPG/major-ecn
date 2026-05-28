import { GraduationCap, MailX } from 'lucide-react';
import { requireAdmin } from '@/lib/auth/require-role';
import { createAdminClient } from '@/lib/supabase/admin';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { initials } from '@/lib/utils';
import { AddProfessorDialog } from '@/components/admin/professors/add-professor-dialog';
import { DeleteAccountButton } from '@/components/admin/delete-account-button';
import { EDN_FACULTE_ID } from '@/lib/data/navigator';
import { CONTENT_TYPE_LABEL, CONTENT_TYPES, type ContentType, type PermissionLevel } from '@/lib/schemas/professor';

export const metadata = { title: 'Professeurs' };

type ProfScope = {
  role?: 'professor';
  type?: 'all' | 'college';
  colleges?: string[];
  /** Nouveau format : permission par type. */
  content_permissions?: Partial<Record<ContentType, PermissionLevel>>;
  /** Ancien format (rétrocompat) : liste de types accessibles (équivalent rw). */
  content_types?: ContentType[];
};

const LEVEL_SHORT: Record<PermissionLevel, string> = {
  none: '—',
  read: 'lecture',
  write: 'écriture',
  rw: 'lecture+écriture',
};

function describeScope(scope: ProfScope, collegeMap: Record<string, string>): { label: string; tone: 'muted' | 'primary' }[] {
  const tags: { label: string; tone: 'muted' | 'primary' }[] = [];
  if (!scope.type || scope.type === 'all') tags.push({ label: 'Tous les collèges', tone: 'primary' });
  else if (scope.colleges?.length) {
    for (const id of scope.colleges) tags.push({ label: collegeMap[id] ?? id, tone: 'muted' });
  } else tags.push({ label: 'Aucun collège', tone: 'muted' });

  // Permissions par type (nouveau format prioritaire)
  if (scope.content_permissions) {
    for (const t of CONTENT_TYPES) {
      const lvl = scope.content_permissions[t];
      if (lvl && lvl !== 'none') {
        tags.push({ label: `${CONTENT_TYPE_LABEL[t]} · ${LEVEL_SHORT[lvl]}`, tone: 'muted' });
      }
    }
  } else if (scope.content_types?.length) {
    // Ancien format : rétrocompat (équivalent rw)
    for (const t of scope.content_types) tags.push({ label: `${CONTENT_TYPE_LABEL[t]} · lecture+écriture`, tone: 'muted' });
  } else {
    tags.push({ label: 'Tous contenus', tone: 'muted' });
  }
  return tags;
}

export default async function ProfessorsPage() {
  await requireAdmin();
  const admin = createAdminClient();

  const [{ data: profs }, { data: fac }] = await Promise.all([
    admin.from('profiles')
      .select('id, first_name, last_name, email, phone, permission_scope, created_at')
      .eq('role', 'professor')
      .order('last_name'),
    admin.from('facultes')
      .select('semestres(matieres(id, nom, order_index))')
      .eq('id', EDN_FACULTE_ID)
      .maybeSingle(),
  ]);

  const colleges = (
    ((fac as unknown as { semestres?: { matieres?: { id: string; nom: string; order_index: number | null }[] }[] } | null)?.semestres ?? [])
  )
    .flatMap((s) => s.matieres ?? [])
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    .map((m) => ({ id: m.id, nom: m.nom }));
  const collegeMap = Object.fromEntries(colleges.map((c) => [c.id, c.nom]));

  const rows = (profs ?? []) as Array<{
    id: string; first_name: string | null; last_name: string | null;
    email: string | null; phone: string | null;
    permission_scope: unknown; created_at: string;
  }>;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-(--color-border) pb-5">
        <div>
          <p className="text-xs font-medium text-(--color-ink-muted)">Administration</p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-(--color-ink)">Professeurs</h1>
          <p className="mt-0.5 text-sm text-(--color-ink-soft)">
            {rows.length} prestataire{rows.length > 1 ? 's' : ''} pédagogique{rows.length > 1 ? 's' : ''}. Les profs n’accèdent qu’à
            l’onglet « Questions / Réponses » de l’admin.
          </p>
        </div>
        <AddProfessorDialog colleges={colleges} />
      </header>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) px-5 py-12 text-center">
          <GraduationCap className="mx-auto h-7 w-7 text-(--color-primary)" />
          <p className="mt-3 text-sm font-medium text-(--color-ink)">Aucun professeur pour l’instant.</p>
          <p className="mt-1 text-xs text-(--color-ink-soft)">
            Ajoutez un professeur depuis le bouton ci-dessus. Il reçoit un email d’activation pour
            choisir son mot de passe.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((p) => {
            const scope = (p.permission_scope ?? {}) as ProfScope;
            const tags = describeScope(scope, collegeMap);
            return (
              <li key={p.id} className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-(--shadow-soft) sm:p-5">
                <div className="flex flex-wrap items-start gap-4">
                  <Avatar className="h-11 w-11 shrink-0">
                    <AvatarFallback>{initials(p.first_name, p.last_name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-(--color-ink)">{p.first_name} {p.last_name}</p>
                    <p className="truncate font-mono text-xs text-(--color-ink-soft)">{p.email}</p>
                    {p.phone && (
                      <p className="mt-0.5 text-xs text-(--color-ink-muted)">{p.phone}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-1 max-w-full">
                    <Badge variant="primary">Professeur</Badge>
                    <DeleteAccountButton
                      userId={p.id}
                      displayName={`${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || p.email || 'professeur'}
                    />
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1 border-t border-(--color-border) pt-3">
                  {tags.map((t, i) => (
                    <Badge key={i} variant={t.tone}>{t.label}</Badge>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Footnote */}
      <p className="mt-6 flex items-start gap-2 text-xs text-(--color-ink-muted)">
        <MailX className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Pour révoquer l’accès d’un professeur, supprimez son compte côté Supabase Auth — toutes ses
        réponses au forum restent en place (auteur passe sur « ancien intervenant »).
      </p>
    </main>
  );
}
