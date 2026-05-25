import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowRight, ClipboardCheck, FileText, History, Layers3, MonitorPlay, type LucideIcon } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { canAccessCollege, parseScope } from '@/lib/auth/permissions';
import { UpgradeBanner } from '@/components/student/upgrade-banner';

type Action = { href: string; label: string; desc: string; Icon: LucideIcon; available: boolean };

export default async function CoursApercuPage({ params }: { params: Promise<{ cours: string }> }) {
  const { cours: coursId } = await params;
  const { user, profile } = await requireUser();
  const supabase = await createClient();

  const { data: c } = await supabase
    .from('cours')
    .select(`
      id, titre, description, matiere_id,
      matieres(nom),
      videos(storage_path), fiches(storage_path), qcm_series(type), flashcards(id)
    `)
    .eq('id', coursId)
    .maybeSingle();

  if (!c || !c.matieres) notFound();
  if (!canAccessCollege(parseScope(profile.permission_scope), c.matiere_id)) redirect('/facultes');

  await supabase
    .from('course_progress')
    .upsert(
      { user_id: user.id, cours_id: coursId, last_seen_at: new Date().toISOString() },
      { onConflict: 'user_id,cours_id', ignoreDuplicates: false },
    );

  const actions: Action[] = [
    { href: `/cours/${coursId}/video`, label: 'Cours vidéo', desc: 'Le cours filmé, aligné sur les recommandations HAS.', Icon: MonitorPlay, available: (c.videos ?? []).some((v) => !!v.storage_path) },
    { href: `/cours/${coursId}/fiche`, label: 'Fiche de synthèse', desc: 'Le résumé hiérarchisé rang A / rang B.', Icon: FileText, available: (c.fiches ?? []).some((f) => !!f.storage_path) },
    { href: `/cours/${coursId}/qcm`, label: 'Dossiers progressifs & QI', desc: 'Entraînement au format EVC, corrigé et justifié item par item.', Icon: ClipboardCheck, available: (c.qcm_series ?? []).some((s) => s.type === 'qcm') },
    { href: `/cours/${coursId}/annales`, label: 'Annales EVC', desc: 'Les sujets des sessions précédentes, en conditions concours.', Icon: History, available: (c.qcm_series ?? []).some((s) => s.type === 'annale') },
    { href: `/cours/${coursId}/flashcards`, label: 'Flashcards', desc: 'Révision espacée pondérée par votre niveau de difficulté.', Icon: Layers3, available: (c.flashcards?.length ?? 0) > 0 },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 lg:px-10">
      {c.description && (
        <div className="mb-8 rounded-2xl border border-(--color-border) bg-gradient-to-br from-(--color-primary-soft) to-transparent p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-(--color-accent-deep)">
            {c.matieres.nom}
          </p>
          <p className="mt-2 leading-relaxed text-pretty text-(--color-ink)">{c.description}</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {actions.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-(--shadow-soft) transition-all hover:-translate-y-0.5 hover:border-(--color-accent) hover:shadow-(--shadow-lifted) focus-ring"
          >
            <span
              aria-hidden
              className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-(--color-primary) to-(--color-accent) transition-transform duration-300 group-hover:scale-x-100"
            />
            <div className="flex items-start justify-between">
              <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-(--color-primary-soft) text-(--color-primary) transition-colors group-hover:bg-(--color-primary) group-hover:text-white">
                <a.Icon className="h-7 w-7" />
              </span>
              {!a.available && (
                <span className="rounded-full bg-(--color-sand-200) px-2.5 py-0.5 text-[10px] uppercase tracking-wide text-(--color-ink-muted)">
                  Bientôt
                </span>
              )}
            </div>
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-(--color-ink)">{a.label}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-(--color-ink-soft)">{a.desc}</p>
            </div>
            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-(--color-accent-deep)">
              Ouvrir
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <UpgradeBanner context="cours" profile={profile} />
      </div>
    </div>
  );
}
