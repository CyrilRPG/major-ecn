import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import { requireAdmin } from '@/lib/auth/require-role';
import { createAdminClient } from '@/lib/supabase/admin';
import { Badge } from '@/components/ui/badge';
import type { FormField } from '@/lib/schemas/satisfaction';

export const metadata = { title: 'Formulaire — réponses' };

export default async function FormResponsesPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const admin = createAdminClient();

  const { data: form } = await admin.from('satisfaction_forms').select('*').eq('id', id).maybeSingle();
  if (!form) notFound();

  const { data: responses } = await admin
    .from('satisfaction_responses')
    .select('id, user_id, answers, file_path, skipped, submitted_at, profiles:user_id(first_name, last_name, email, promotion)')
    .eq('form_id', id)
    .order('submitted_at', { ascending: false });

  type Resp = {
    id: string;
    user_id: string;
    answers: Record<string, unknown>;
    file_path: string | null;
    skipped: boolean;
    submitted_at: string;
    profiles: { first_name: string | null; last_name: string | null; email: string | null; promotion: string | null } | null;
  };
  const rows = (responses ?? []) as unknown as Resp[];
  const fields = (form.fields ?? []) as FormField[];

  const completed = rows.filter((r) => !r.skipped);
  const skipped = rows.filter((r) => r.skipped);

  // Pre-sign upload URLs (60 min) for the file_path of each response
  const signed = new Map<string, string>();
  await Promise.all(completed.map(async (r) => {
    if (!r.file_path) return;
    const { data } = await admin.storage.from('satisfaction-uploads').createSignedUrl(r.file_path, 3600);
    if (data?.signedUrl) signed.set(r.id, data.signedUrl);
  }));

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <Link
        href="/admin/formulaires"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-(--color-ink-soft) hover:text-(--color-ink)"
      >
        <ArrowLeft className="h-4 w-4" /> Tous les formulaires
      </Link>

      <header className="mb-6 border-b border-(--color-border) pb-5">
        <h1 className="text-xl font-semibold tracking-tight text-(--color-ink)">{form.title}</h1>
        {form.intro_text && (
          <p className="mt-1 max-w-2xl text-sm text-(--color-ink-soft)">{form.intro_text}</p>
        )}
        <div className="mt-3 flex flex-wrap gap-1">
          <Badge variant="primary">{completed.length} réponse{completed.length > 1 ? 's' : ''}</Badge>
          {skipped.length > 0 && <Badge variant="muted">{skipped.length} skip{skipped.length > 1 ? 's' : ''}</Badge>}
          {form.mandatory && <Badge variant="danger">Obligatoire</Badge>}
          <Badge variant={form.active ? 'success' : 'muted'}>{form.active ? 'Actif' : 'Inactif'}</Badge>
        </div>
      </header>

      {completed.length === 0 ? (
        <p className="rounded-2xl border border-(--color-border) bg-(--color-surface) px-5 py-10 text-center text-sm text-(--color-ink-soft)">
          Aucune réponse pour l’instant.
        </p>
      ) : (
        <ul className="space-y-4">
          {completed.map((r) => (
            <li key={r.id} className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-soft)">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm">
                  <p className="font-medium text-(--color-ink)">
                    {r.profiles?.first_name} {r.profiles?.last_name}
                  </p>
                  <p className="text-xs text-(--color-ink-muted)">
                    {r.profiles?.email} {r.profiles?.promotion ? ` · ${r.profiles.promotion}` : ''}
                  </p>
                </div>
                <p className="text-xs text-(--color-ink-muted)">
                  {new Date(r.submitted_at).toLocaleString('fr-FR')}
                </p>
              </div>
              <dl className="grid gap-3 sm:grid-cols-2">
                {fields.map((f) => (
                  <div key={f.key}>
                    <dt className="text-xs font-semibold text-(--color-ink-muted)">{f.label}</dt>
                    <dd className="mt-0.5 whitespace-pre-wrap text-sm text-(--color-ink)">
                      {formatValue(r.answers?.[f.key])}
                    </dd>
                  </div>
                ))}
                {r.file_path && (
                  <div>
                    <dt className="text-xs font-semibold text-(--color-ink-muted)">Fichier</dt>
                    <dd className="mt-0.5">
                      {signed.get(r.id) ? (
                        <a
                          href={signed.get(r.id)!}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-(--color-primary) hover:underline"
                        >
                          <Download className="h-3.5 w-3.5" /> Télécharger
                        </a>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs text-(--color-ink-muted)">
                          <FileText className="h-3 w-3" /> Lien indisponible
                        </span>
                      )}
                    </dd>
                  </div>
                )}
              </dl>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

function formatValue(v: unknown): string {
  if (v == null || v === '') return '—';
  if (typeof v === 'number') return v.toString();
  if (typeof v === 'boolean') return v ? 'Oui' : 'Non';
  if (Array.isArray(v)) return v.join(', ');
  return String(v);
}
