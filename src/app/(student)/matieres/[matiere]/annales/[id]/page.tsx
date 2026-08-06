import { notFound, redirect } from 'next/navigation';
import { FileText } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { PdfViewer } from '@/components/student/pdf-viewer';
import { AnnaleAssistantPanel } from '@/components/student/annale-assistant-panel';
import {
  ANNALES_EVC_COLLEGE_ID,
  canAccessAnnalesEvc,
  parseScope,
} from '@/lib/auth/permissions';

export const metadata = { title: 'Annale EVC' };

export default async function AnnaleDetailPage({
  params,
}: {
  params: Promise<{ matiere: string; id: string }>;
}) {
  const { matiere, id } = await params;
  const { profile } = await requireUser();
  const supabase = await createClient();

  const scope = parseScope(profile.permission_scope);
  if (!canAccessAnnalesEvc(scope)) redirect('/facultes');
  if (matiere !== ANNALES_EVC_COLLEGE_ID) {
    redirect(`/matieres/${ANNALES_EVC_COLLEGE_ID}/annales/${id}`);
  }

  const [{ data: m }, { data: row }] = await Promise.all([
    supabase.from('matieres').select('id, nom').eq('id', matiere).maybeSingle(),
    supabase
      .from('medgen_annales')
      .select('id, annee, type, label, sujet_path, corrige_path')
      .eq('id', id)
      .maybeSingle(),
  ]);
  if (!m) notFound();
  if (!row) notFound();

  const sujetUrl = `/api/medgen-annales/${row.id}/pdf?type=sujet`;
  const corrigeUrl = row.corrige_path ? `/api/medgen-annales/${row.id}/pdf?type=corrige` : null;
  const context = `${m.nom} · ${row.type === 'EVCF' ? 'Connaissances fondamentales' : 'Connaissances pratiques'} · Session ${row.annee}`;

  return (
    <AnnaleAssistantPanel
      annaleId={row.id}
      annaleTitre={row.label}
      context={context}
      backHref={`/matieres/${matiere}/annales`}
      backLabel="Annales"
    >
      <div className="mx-auto w-full max-w-5xl px-4 py-6 lg:px-8">
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
