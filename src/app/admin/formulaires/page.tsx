import Link from 'next/link';
import { ClipboardList, Lock, MessageSquareWarning } from 'lucide-react';
import { requireAdmin } from '@/lib/auth/require-role';
import { createAdminClient } from '@/lib/supabase/admin';
import { Badge } from '@/components/ui/badge';
import { FormBuilderDialog } from '@/components/admin/forms/form-builder-dialog';
import { ToggleActiveButton, DeleteFormButton } from '@/components/admin/forms/form-row-actions';
import type { FormField } from '@/lib/schemas/satisfaction';

export const metadata = { title: 'Formulaires de satisfaction' };

type FormRow = {
  id: string;
  title: string;
  intro_text: string | null;
  mandatory: boolean;
  active: boolean;
  target_promo: string | null;
  target_offer: string | null;
  target_college: string | null;
  fields: FormField[];
  allow_file_upload: boolean;
  created_at: string;
};

export default async function FormulairesAdminPage() {
  await requireAdmin();
  const admin = createAdminClient();
  const [{ data: forms }, { data: colleges }, { data: responses }] = await Promise.all([
    admin.from('satisfaction_forms').select('*').order('created_at', { ascending: false }),
    admin.from('matieres').select('id, nom').order('nom'),
    admin.from('satisfaction_responses').select('form_id, skipped'),
  ]);

  const collegeMap = Object.fromEntries((colleges ?? []).map((c) => [c.id, c.nom]));
  const countsByForm = new Map<string, { responses: number; skips: number }>();
  for (const r of (responses ?? []) as { form_id: string; skipped: boolean }[]) {
    const cur = countsByForm.get(r.form_id) ?? { responses: 0, skips: 0 };
    if (r.skipped) cur.skips++;
    else cur.responses++;
    countsByForm.set(r.form_id, cur);
  }

  const rows = (forms ?? []) as unknown as FormRow[];

  const offerLabel = (o: string | null) =>
    !o ? 'Toutes les formules' : ({ essentiel: 'Essentiel', premium: 'Premium', intensif: 'Intensif' } as Record<string, string>)[o] ?? o;
  const collegeLabel = (c: string | null) =>
    !c ? 'Tous les élèves' : c === 'all-access' ? 'Toute l’offre uniquement' : collegeMap[c] ?? c;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-(--color-border) pb-5">
        <div>
          <p className="text-xs font-medium text-(--color-ink-muted)">Administration</p>
          <h1 className="mt-1 flex items-center gap-2 text-xl font-semibold tracking-tight text-(--color-ink)">
            <ClipboardList className="h-5 w-5 text-(--color-primary)" />
            Formulaires de satisfaction
          </h1>
          <p className="mt-0.5 text-sm text-(--color-ink-soft)">
            Recueillez le retour de vos élèves : champs libres, choix multiples, upload de fichier.
          </p>
        </div>
        <FormBuilderDialog colleges={(colleges ?? []).map((c) => ({ id: c.id, nom: c.nom }))} />
      </header>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) px-5 py-12 text-center">
          <MessageSquareWarning className="mx-auto h-7 w-7 text-(--color-primary)" />
          <p className="mt-3 text-sm font-medium text-(--color-ink)">Aucun formulaire pour l’instant.</p>
          <p className="mt-1 text-xs text-(--color-ink-soft)">
            Cliquez sur « Nouveau formulaire » pour créer votre premier sondage de satisfaction.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((f) => {
            const counts = countsByForm.get(f.id) ?? { responses: 0, skips: 0 };
            return (
              <li key={f.id} className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-(--shadow-soft) sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/admin/formulaires/${f.id}`}
                        className="text-base font-semibold text-(--color-ink) hover:text-(--color-primary)"
                      >
                        {f.title}
                      </Link>
                      {f.mandatory && (
                        <Badge variant="danger" className="gap-1">
                          <Lock className="h-3 w-3" /> Obligatoire
                        </Badge>
                      )}
                      <Badge variant={f.active ? 'success' : 'muted'}>{f.active ? 'Actif' : 'Inactif'}</Badge>
                    </div>
                    {f.intro_text && (
                      <p className="mt-1 line-clamp-2 text-sm text-(--color-ink-soft)">{f.intro_text}</p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-1 text-[11px]">
                      <Badge variant="muted">{f.target_promo ?? 'Toutes promos'}</Badge>
                      <Badge variant="muted">{offerLabel(f.target_offer)}</Badge>
                      <Badge variant="muted">{collegeLabel(f.target_college)}</Badge>
                      <Badge variant="primary">{f.fields.length} champ{f.fields.length > 1 ? 's' : ''}</Badge>
                      {f.allow_file_upload && <Badge variant="muted">+ fichier</Badge>}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <div className="text-right text-xs text-(--color-ink-soft)">
                      <div><strong className="text-(--color-ink)">{counts.responses}</strong> réponse{counts.responses > 1 ? 's' : ''}</div>
                      {counts.skips > 0 && <div>{counts.skips} skip{counts.skips > 1 ? 's' : ''}</div>}
                    </div>
                    <ToggleActiveButton id={f.id} active={f.active} />
                    <DeleteFormButton id={f.id} title={f.title} />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
