import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookOpen, ClipboardCheck, FileText } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { PdfViewer } from '@/components/student/pdf-viewer';
import { AnnaleAssistantPanel } from '@/components/student/annale-assistant-panel';
import { canAccessCollege, parseScope } from '@/lib/auth/permissions';

export const metadata = { title: 'Annale EVC' };

export default async function AnnaleDetailPage({
  params,
}: {
  params: Promise<{ matiere: string; id: string }>;
}) {
  const { matiere, id } = await params;
  const { profile } = await requireUser();
  const supabase = await createClient();

  const { data: m } = await supabase.from('matieres').select('id, nom').eq('id', matiere).maybeSingle();
  if (!m) notFound();
  if (!canAccessCollege(parseScope(profile.permission_scope), m.id)) redirect('/facultes');

  const { data: row } = await supabase
    .from('medgen_annales')
    .select('id, annee, type, label, sujet_path, corrige_path')
    .eq('id', id)
    .maybeSingle();
  if (!row) notFound();

  const sujetUrl = `/api/medgen-annales/${row.id}/pdf?type=sujet`;
  const corrigeUrl = row.corrige_path ? `/api/medgen-annales/${row.id}/pdf?type=corrige` : null;

  return (
    <AnnaleAssistantPanel annaleId={row.id} annaleTitre={row.label}>
      <div className="mx-auto w-full max-w-5xl px-4 py-6 lg:px-8">
        <Link
          href={`/matieres/${matiere}/annales`}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-(--color-ink-soft) hover:text-(--color-ink)"
        >
          <ArrowLeft className="h-4 w-4" />
          Toutes les annales
        </Link>

        <header className="mb-5 border-b border-(--color-border) pb-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-(--color-primary)">
            Session {row.annee}
          </p>
          <h1 className="mt-1 inline-flex items-center gap-2 text-2xl font-semibold tracking-tight text-(--color-ink)">
            {row.type === 'EVCF' ? <BookOpen className="h-5 w-5 text-(--color-primary)" /> : <ClipboardCheck className="h-5 w-5 text-(--color-primary)" />}
            {row.label}
          </h1>
          <p className="mt-1 text-sm text-(--color-ink-soft)">
            {row.type === 'EVCF' ? 'Connaissances fondamentales' : 'Connaissances pratiques'} ·
            {' '}votre identité s’affiche en filigrane sur chaque page.
          </p>
        </header>

        <div className="mb-4 inline-flex rounded-xl border border-(--color-border) bg-(--color-surface-soft) p-1">
          <span className="rounded-lg bg-(--color-surface) px-3 py-1.5 text-sm font-semibold text-(--color-ink) shadow-sm">
            <FileText className="mr-1.5 inline-block h-3.5 w-3.5 -translate-y-px" />
            Sujet
          </span>
          <span className="px-3 py-1.5 text-sm font-medium text-(--color-ink-muted)">
            Corrigé · {corrigeUrl ? 'disponible' : 'à venir'}
          </span>
        </div>

        <PdfViewer src={sujetUrl} coursId={row.id} initiallyRead={false} />

        {!corrigeUrl && (
          <div className="mt-4 rounded-xl border border-(--color-border) bg-(--color-surface-soft) px-4 py-3 text-sm text-(--color-ink-soft)">
            <p className="font-medium text-(--color-ink)">Corrigé à venir</p>
            <p className="mt-0.5 text-xs">
              Le corrigé détaillé sera publié dès qu’il sera disponible. Nous vous notifierons par email.
            </p>
          </div>
        )}
      </div>
    </AnnaleAssistantPanel>
  );
}
