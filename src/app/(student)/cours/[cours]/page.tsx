import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowRight, ClipboardCheck, FileText, Layers3, MonitorPlay, type LucideIcon } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { canAccessCollege, parseScope } from '@/lib/auth/permissions';
import { UpgradeBanner } from '@/components/student/upgrade-banner';

type Action = {
  href: string;
  label: string;
  desc: string;
  Icon: LucideIcon;
  available: boolean;
  /** Couleur primaire de la carte (accent + icône). */
  accent: string;
  /** Fond pastel doux pour le conteneur d'icône. */
  bg: string;
};

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

  // 4 cartes du parcours pédagogique : vidéo, fiche, DP&QI, flashcards.
  // Les annales EVC restent accessibles via la sidebar (entrée transversale
  // sous chaque collège) — pas de carte dédiée ici.
  const actions: Action[] = [
    {
      href: `/cours/${coursId}/video`, label: 'Cours vidéo',
      desc: 'Le cours filmé, aligné sur les recommandations HAS.',
      Icon: MonitorPlay, accent: '#E4002B', bg: '#FDE7E9',
      available: (c.videos ?? []).some((v) => !!v.storage_path),
    },
    {
      href: `/cours/${coursId}/fiche`, label: 'Fiche de cours exhaustive',
      desc: 'L’intégralité du programme, hiérarchisée rang A / rang B.',
      Icon: FileText, accent: '#7C3AED', bg: '#F1E8FD',
      available: (c.fiches ?? []).some((f) => !!f.storage_path),
    },
    {
      href: `/cours/${coursId}/qcm`, label: 'Dossiers progressifs & QI',
      desc: 'Entraînement au format EVC, corrigé et justifié item par item.',
      Icon: ClipboardCheck, accent: '#D97706', bg: '#FEF3E2',
      available: (c.qcm_series ?? []).some((s) => s.type === 'qcm'),
    },
    {
      href: `/cours/${coursId}/flashcards`, label: 'Flashcards',
      desc: 'Révisez et mémorisez les points clés du programme.',
      Icon: Layers3, accent: '#16A34A', bg: '#E7F6EC',
      available: (c.flashcards?.length ?? 0) > 0,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-6 lg:px-8">
      {c.description && (
        <div className="mb-6 rounded-2xl border border-(--color-border) bg-gradient-to-br from-(--color-primary-soft) to-transparent p-5">
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
            aria-disabled={!a.available || undefined}
            className="group relative flex min-h-[170px] flex-col justify-between overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-(--shadow-soft) transition-all hover:-translate-y-0.5 hover:shadow-(--shadow-lifted) focus-ring"
          >
            {/* Halo pastel doux dégradant depuis la droite — couleur du
                thème, jamais opaque sur le texte. */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-60"
              style={{ background: `linear-gradient(135deg, transparent 55%, ${a.bg} 100%)` }}
            />

            {/* Icône organe géante en watermark à droite. */}
            <span
              aria-hidden
              className="pointer-events-none absolute -right-6 bottom-0 select-none opacity-[0.10]"
              style={{ color: a.accent }}
            >
              <a.Icon className="h-44 w-44" strokeWidth={1.4} />
            </span>

            <div className="relative flex items-start justify-between">
              <span
                className="flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ background: a.bg, color: a.accent }}
              >
                <a.Icon className="h-6 w-6" />
              </span>
              {!a.available && (
                <span
                  className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em]"
                  style={{ background: a.bg, color: a.accent }}
                >
                  Bientôt
                </span>
              )}
            </div>
            <div className="relative mt-5">
              <h3 className="text-lg font-bold text-(--color-ink)">{a.label}</h3>
              <p className="mt-1.5 max-w-[80%] text-sm leading-relaxed text-(--color-ink-soft)">{a.desc}</p>
            </div>
            <span
              className="relative mt-4 inline-flex items-center gap-1.5 text-sm font-semibold"
              style={{ color: a.accent }}
            >
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
