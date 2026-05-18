import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowRight, ClipboardCheck, FileText, History, Layers3, MonitorPlay, type LucideIcon } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { ContentRefreshDialog } from '@/components/student/content-refresh-dialog';
import { canAccessFaculte, parseScope } from '@/lib/auth/permissions';

type Action = { href: string; label: string; desc: string; Icon: LucideIcon; available: boolean };

export default async function CoursApercuPage({ params }: { params: Promise<{ cours: string }> }) {
  const { cours: coursId } = await params;
  const { user, profile } = await requireUser();
  const supabase = await createClient();

  const { data: c } = await supabase
    .from('cours')
    .select(`
      id, titre, description, matiere_id,
      matieres(nom, semestres(faculte_id)),
      videos(storage_path), fiches(storage_path), qcm_series(type), flashcards(id),
      course_progress(video_watched, fiche_read)
    `)
    .eq('id', coursId)
    .maybeSingle();

  if (!c || !c.matieres || !c.matieres.semestres) notFound();
  const facId = c.matieres.semestres.faculte_id;
  if (!canAccessFaculte(parseScope(profile.permission_scope), facId)) redirect('/facultes');

  await supabase
    .from('course_progress')
    .upsert(
      { user_id: user.id, cours_id: coursId, last_seen_at: new Date().toISOString() },
      { onConflict: 'user_id,cours_id', ignoreDuplicates: false },
    );

  const actions: Action[] = [
    { href: `/cours/${coursId}/video`, label: 'Cours vidéo', desc: 'Le cours filmé, aligné sur les recommandations HAS.', Icon: MonitorPlay, available: (c.videos ?? []).some((v) => !!v.storage_path) },
    { href: `/cours/${coursId}/fiche`, label: 'Fiche de synthèse', desc: 'Le résumé hiérarchisé rang A / rang B.', Icon: FileText, available: (c.fiches ?? []).some((f) => !!f.storage_path) },
    { href: `/cours/${coursId}/qcm`, label: 'Dossiers progressifs & QI', desc: 'Entraînement au format EDN, corrigé justifié.', Icon: ClipboardCheck, available: (c.qcm_series ?? []).some((s) => s.type === 'qcm') },
    { href: `/cours/${coursId}/annales`, label: 'Annales EDN', desc: 'Les sujets des sessions précédentes.', Icon: History, available: (c.qcm_series ?? []).some((s) => s.type === 'annale') },
    { href: `/cours/${coursId}/flashcards`, label: 'Flashcards', desc: 'Révision espacée pondérée par difficulté.', Icon: Layers3, available: (c.flashcards?.length ?? 0) > 0 },
  ];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 lg:px-8">
      {c.description && (
        <p className="text-(--color-ink-soft) leading-relaxed text-pretty">{c.description}</p>
      )}

      <div className="mt-6">
        <ContentRefreshDialog coursId={coursId} coursTitre={c.titre} />
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {actions.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="group flex items-start gap-3 rounded-xl border border-(--color-border) bg-(--color-surface) p-4 transition-colors hover:border-(--color-accent) focus-ring"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-(--color-primary-soft) text-(--color-primary)">
              <a.Icon className="h-4.5 w-4.5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2 font-medium text-(--color-ink)">
                {a.label}
                {!a.available && (
                  <span className="rounded-full bg-(--color-sand-200) px-2 py-0.5 text-[10px] uppercase tracking-wide text-(--color-ink-muted)">
                    Bientôt
                  </span>
                )}
              </span>
              <span className="mt-0.5 block text-xs text-(--color-ink-soft)">{a.desc}</span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-(--color-ink-muted) transition-transform group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>
    </div>
  );
}
