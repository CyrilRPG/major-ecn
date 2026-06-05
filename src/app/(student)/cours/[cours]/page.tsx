import Image from 'next/image';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Award, ArrowRight, ClipboardCheck, FileText, Layers3, Lock, MonitorPlay, type LucideIcon } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { canAccessCollege, canAccessCours, parseScope } from '@/lib/auth/permissions';
import { UpgradeBanner } from '@/components/student/upgrade-banner';

const PNEUMO_COURS_ID = '33579977-020e-4c94-a561-dee9d3c7bc70';

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
  /** Image décorative latérale optionnelle (remplace le watermark Lucide). */
  decorImage?: string;
  /** Carte verrouillée (parcours pas terminé) → grisée, lien désactivé. */
  locked?: boolean;
};

export default async function CoursApercuPage({ params }: { params: Promise<{ cours: string }> }) {
  const { cours: coursId } = await params;
  const { user, profile } = await requireUser();
  const supabase = await createClient();

  const { data: c } = await supabase
    .from('cours')
    .select(`
      id, titre, description, matiere_id, access_type,
      matieres(nom, access_type),
      videos(storage_path), fiches(storage_path), qcm_series(type), flashcards(id)
    `)
    .eq('id', coursId)
    .maybeSingle();

  if (!c || !c.matieres) notFound();
  const scope = parseScope(profile.permission_scope);
  const collegeAccess = (c.matieres as unknown as { access_type?: 'all' | 'specific' }).access_type ?? 'all';
  const coursAccess  = (c as unknown as { access_type?: 'all' | 'specific' }).access_type ?? 'all';
  if (!canAccessCollege(scope, c.matiere_id, collegeAccess)) redirect('/facultes');
  // Filtrage fin : si le prof est limité à certains cours, on bloque les autres.
  if (!canAccessCours(scope, c.matiere_id, coursId, coursAccess)) redirect(`/matieres/${c.matiere_id}`);

  await supabase
    .from('course_progress')
    .upsert(
      { user_id: user.id, cours_id: coursId, last_seen_at: new Date().toISOString() },
      { onConflict: 'user_id,cours_id', ignoreDuplicates: false },
    );

  // Etat de complétion du parcours pour débloquer l'Interrogation (5e contenu).
  // Critères : vidéo vue + fiche lue + au moins 1 QCM attempt + au moins 1 flashcard review.
  // Bypass pour Pneumologie (test de la fonctionnalité).
  const [{ data: cpRow }, { count: qcmAttempts }, { count: flashReviews }] = await Promise.all([
    supabase.from('course_progress')
      .select('video_watched, fiche_read')
      .eq('user_id', user.id).eq('cours_id', coursId).maybeSingle(),
    supabase.from('qcm_attempts')
      .select('id, qcm_questions!inner(qcm_series!inner(cours_id))', { count: 'exact', head: true })
      .eq('user_id', user.id).eq('qcm_questions.qcm_series.cours_id', coursId),
    supabase.from('flashcard_reviews')
      .select('id, flashcards!inner(cours_id)', { count: 'exact', head: true })
      .eq('user_id', user.id).eq('flashcards.cours_id', coursId),
  ]);
  const allDone =
    !!cpRow?.video_watched && !!cpRow?.fiche_read &&
    (qcmAttempts ?? 0) > 0 && (flashReviews ?? 0) > 0;
  const interrogationUnlocked = allDone || coursId === PNEUMO_COURS_ID;

  // 5 cartes du parcours dans l'ordre pédagogique :
  // fiche → vidéo → DP & QI → flashcards → interrogation.
  const actions: Action[] = [
    {
      href: `/cours/${coursId}/fiche`, label: 'Fiche de cours exhaustive',
      desc: 'L’intégralité du programme, hiérarchisée rang A / rang B.',
      Icon: FileText, accent: '#7C3AED', bg: '#F1E8FD',
      available: (c.fiches ?? []).some((f) => !!f.storage_path),
    },
    {
      href: `/cours/${coursId}/video`, label: 'Cours vidéo',
      desc: 'Le cours filmé, aligné sur les recommandations HAS.',
      Icon: MonitorPlay, accent: '#E4002B', bg: '#FDE7E9',
      available: (c.videos ?? []).some((v) => !!v.storage_path),
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
    {
      href: `/cours/${coursId}/interrogation`,
      label: 'Interrogation',
      desc: interrogationUnlocked
        ? 'Test final du parcours — signez le certificat à l\'issue.'
        : 'Terminez vidéo, fiche, QCM et flashcards pour débloquer le test final.',
      Icon: interrogationUnlocked ? Award : Lock,
      accent: interrogationUnlocked ? '#7C3AED' : '#9AA3B8',
      bg: interrogationUnlocked ? '#EDE9FE' : '#F1F5F9',
      available: interrogationUnlocked,
      locked: !interrogationUnlocked,
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
        {actions.map((a) => {
          const Tag = a.locked ? 'div' : Link;
          const tagProps = a.locked
            ? { 'aria-disabled': true as const }
            : { href: a.href };
          return (
          <Tag
            key={a.href}
            {...(tagProps as { href: string })}
            className={`group relative flex min-h-[170px] flex-col justify-between overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-(--shadow-soft) transition-all focus-ring ${a.locked ? 'cursor-not-allowed opacity-70' : 'hover:-translate-y-0.5 hover:shadow-(--shadow-lifted)'}`}
          >
            {/* Halo pastel doux dégradant depuis la droite — couleur du
                thème, jamais opaque sur le texte. */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-60"
              style={{ background: `linear-gradient(135deg, transparent 55%, ${a.bg} 100%)` }}
            />

            {/* Watermark latéral droit : image décorative si fournie
                (ex. flashcards), sinon icône Lucide géante en couleur du thème. */}
            {a.decorImage ? (
              <span
                aria-hidden
                className="pointer-events-none absolute -right-4 bottom-0 select-none opacity-[0.10]"
              >
                <Image
                  src={a.decorImage}
                  alt=""
                  width={320}
                  height={320}
                  className="h-44 w-auto object-contain"
                />
              </span>
            ) : (
              <span
                aria-hidden
                className="pointer-events-none absolute -right-6 bottom-0 select-none opacity-[0.10]"
                style={{ color: a.accent }}
              >
                <a.Icon className="h-44 w-44" strokeWidth={1.4} />
              </span>
            )}

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
              {a.locked ? <><Lock className="h-4 w-4" /> Verrouillé</> : <>Ouvrir <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></>}
            </span>
          </Tag>
          );
        })}
      </div>

      <div className="mt-8">
        <UpgradeBanner context="cours" profile={profile} />
      </div>
    </div>
  );
}
