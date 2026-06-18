import { GraduationCap, MailX } from 'lucide-react';
import { requireAdmin } from '@/lib/auth/require-role';
import { createAdminClient } from '@/lib/supabase/admin';
import { AddProfessorDialog } from '@/components/admin/professors/add-professor-dialog';
import { ProfessorsList, type ProfessorRow } from '@/components/admin/professors/professors-list';
import { EDN_FACULTE_ID } from '@/lib/data/navigator';
import { CONTENT_TYPE_LABEL, CONTENT_TYPES, type ContentType, type PermissionLevel } from '@/lib/schemas/professor';

export const metadata = { title: 'Professeurs' };

type ProfScope = {
  role?: 'professor';
  type?: 'all' | 'college';
  colleges?: string[];
  cours?: string[];
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

function describeScope(
  scope: ProfScope,
  collegeMap: Record<string, string>,
  coursMap: Record<string, string>,
): { label: string; tone: 'muted' | 'primary' }[] {
  const tags: { label: string; tone: 'muted' | 'primary' }[] = [];
  if (!scope.type || scope.type === 'all') tags.push({ label: 'Tous les collèges', tone: 'primary' });
  else if (scope.colleges?.length) {
    for (const id of scope.colleges) tags.push({ label: collegeMap[id] ?? id, tone: 'muted' });
    if (scope.cours?.length) {
      const list = scope.cours.length <= 4
        ? scope.cours.map((id) => coursMap[id] ?? id).join(', ')
        : `${scope.cours.length} cours spécifiques`;
      tags.push({ label: `Cours : ${list}`, tone: 'muted' });
    }
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
      .select('id, first_name, last_name, email, phone, address, pseudo, cv_url, certificat_scolarite_url, carte_pro_url, permission_scope, created_at, is_active, can_download')
      .eq('role', 'professor')
      .order('last_name'),
    admin.from('facultes')
      .select('semestres(matieres(id, nom, order_index, cours(id, titre, order_index)))')
      .eq('id', EDN_FACULTE_ID)
      .maybeSingle(),
  ]);

  type MatRaw = { id: string; nom: string; order_index: number | null; cours?: { id: string; titre: string; order_index: number | null }[] | null };
  const matieres = (
    ((fac as unknown as { semestres?: { matieres?: MatRaw[] }[] } | null)?.semestres ?? [])
  )
    .flatMap((s) => s.matieres ?? [])
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
  const colleges = matieres.map((m) => ({ id: m.id, nom: m.nom }));
  const collegeMap = Object.fromEntries(colleges.map((c) => [c.id, c.nom]));
  const coursByCollege: Record<string, { id: string; titre: string }[]> = Object.fromEntries(
    matieres.map((m) => [
      m.id,
      (m.cours ?? [])
        .slice()
        .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
        .map((c) => ({ id: c.id, titre: c.titre })),
    ]),
  );
  const coursMap = Object.fromEntries(
    Object.values(coursByCollege).flat().map((c) => [c.id, c.titre]),
  );

  const rows = (profs ?? []) as unknown as Array<{
    id: string; first_name: string | null; last_name: string | null;
    email: string | null; phone: string | null;
    address: string | null; pseudo: string | null;
    cv_url: string | null; certificat_scolarite_url: string | null; carte_pro_url: string | null;
    permission_scope: unknown; created_at: string;
    is_active: boolean | null;
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
        <AddProfessorDialog colleges={colleges} coursByCollege={coursByCollege} />
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
        <ProfessorsList
          colleges={colleges}
          coursByCollege={coursByCollege}
          rows={rows.map<ProfessorRow>((p) => ({
            id: p.id,
            first_name: p.first_name,
            last_name: p.last_name,
            email: p.email,
            phone: p.phone,
            address: p.address,
            pseudo: p.pseudo,
            cv_url: p.cv_url,
            certificat_scolarite_url: p.certificat_scolarite_url,
            carte_pro_url: p.carte_pro_url,
            created_at: p.created_at,
            is_active: p.is_active !== false,
            permission_scope: p.permission_scope,
            tags: describeScope((p.permission_scope ?? {}) as ProfScope, collegeMap, coursMap),
          }))}
        />
      )}

      {/* Footnote */}
      <p className="mt-6 flex items-start gap-2 text-xs text-(--color-ink-muted)">
        <MailX className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Utilisez le bouton « Désactiver » pour révoquer l’accès sans perdre les contributions du
        professeur. La suppression définitive (icône poubelle) supprime le compte et conserve les
        messages forum sous l’auteur « ancien intervenant ».
      </p>
    </main>
  );
}
