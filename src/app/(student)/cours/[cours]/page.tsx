import Image from 'next/image';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Award, ArrowRight, ClipboardCheck, FileText, Layers3, Lock, MonitorPlay, NotebookPen, Sparkles, Video, type LucideIcon } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { canAccessCollege, canAccessCours, parseScope } from '@/lib/auth/permissions';
import { UpgradeBanner } from '@/components/student/upgrade-banner';
import { DiscoveryLockedCard } from '@/components/espace-decouverte/discovery-locked-card';
import { ItemPopups, type ItemPopup } from '@/components/student/item-popups';
import { LockedSeanceApprofondieCard } from '@/components/student/locked-seance-approfondie-card';

const PNEUMO_COURS_ID = '33579977-020e-4c94-a561-dee9d3c7bc70';
const DECOUVERTE_COLLEGE_ID = 'col-decouverte';
/** Cours « Méthodologie EVC » dans le collège Découverte : on n'affiche
 *  qu'une carte « Cours vidéo » marquée « À venir ». */
const METHODOLOGIE_COURS_ID = '6b321ef6-ef8a-4174-945a-1e1c60f22c5d';

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
  const isApprofondi = scope.offer === 'approfondi' || profile.role === 'admin';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: seanceApprofondieVideos } = isApprofondi
    ? await (supabase as any)
        .from('videos')
        .select('id, bunny_video_id, titre')
        .eq('cours_id', coursId)
        .eq('type', 'seance_approfondie')
    : { data: [] };
  const hasSeanceApprofondie = (seanceApprofondieVideos ?? []).length > 0;

  // Vérifier si toutes les séances du prof sont terminées (pour débloquer séance approfondie).
  let allSeancesCompleted = false;
  if (hasSeanceApprofondie && isApprofondi) {
    const { data: seanceSeries } = await supabase
      .from('qcm_series')
      .select('id')
      .eq('cours_id', coursId)
      .eq('type', 'seance');
    const seanceIds = (seanceSeries ?? []).map((s) => s.id);
    if (seanceIds.length > 0) {
      const { data: completedSessions } = await supabase
        .from('qcm_sessions')
        .select('serie_id')
        .eq('user_id', user.id)
        .in('serie_id', seanceIds)
        .not('finished_at', 'is', null);
      const completedSerieIds = new Set((completedSessions ?? []).map((s) => s.serie_id));
      allSeancesCompleted = seanceIds.every((id) => completedSerieIds.has(id));
    } else {
      allSeancesCompleted = true;
    }
  }

  // Mode Découverte : on retire « Cours vidéo » et « Interrogation »
  // (la vidéo est remplacée par une carte cadenas → popup tarifs).
  const isDecouverte = c.matiere_id === DECOUVERTE_COLLEGE_ID;
  // Cas spécial : cours « Méthodologie EVC » dans le collège Découverte —
  // on n'affiche QU'une seule carte « Cours vidéo » avec un état « À venir ».
  const isMethodologie = coursId === METHODOLOGIE_COURS_ID;

  // Pour les abonnés : critères d'allDone classiques (vidéo + fiche + QCM + flashcards).
  // Pour la Découverte : on retire la vidéo (verrouillée) et l'interrogation
  // (supprimée). allDone = fiche lue + au moins 1 QCM + au moins 1 flashcard.
  const allDone = isDecouverte
    ? !!cpRow?.fiche_read && (qcmAttempts ?? 0) > 0 && (flashReviews ?? 0) > 0
    : !!cpRow?.video_watched && !!cpRow?.fiche_read &&
      (qcmAttempts ?? 0) > 0 && (flashReviews ?? 0) > 0;
  const interrogationUnlocked = allDone || coursId === PNEUMO_COURS_ID;

  // Cartes du parcours dans l'ordre pédagogique :
  //  - Méthodologie : une seule carte « Cours vidéo » à venir
  //  - Découverte   : fiche → vidéo (LOCKED popup) → DP & QI → flashcards
  //  - Standard     : fiche → vidéo → DP & QI → flashcards → interrogation
  let actions: Action[] = isMethodologie
    ? [
        {
          // Cours vidéo « À venir » : carte non cliquable, badge orange.
          href: '#video-coming-soon', label: 'Cours vidéo',
          desc: 'Méthodologie EVC : ce qui est attendu et comment structurer vos réponses.',
          Icon: MonitorPlay, accent: '#E4002B', bg: '#FDE7E9',
          available: false,
          locked: true,
        },
      ]
    : isDecouverte
    ? [
        {
          href: `/cours/${coursId}/fiche`, label: 'Fiche de cours exhaustive',
          desc: "L’intégralité du programme, hiérarchisée rang A / rang B.",
          Icon: FileText, accent: '#7C3AED', bg: '#F1E8FD',
          available: (c.fiches ?? []).some((f) => !!f.storage_path),
        },
        {
          // Cours vidéo verrouillé — clic = popup LockedContentModal.
          href: '#locked-video', label: 'Cours vidéo',
          desc: 'Le cours filmé, aligné sur les recommandations HAS.',
          Icon: MonitorPlay, accent: '#E4002B', bg: '#FDE7E9',
          available: false,
          locked: true,
        },
        {
          href: `/cours/${coursId}/qcm`, label: 'Dossiers progressifs & QI',
          desc: 'Entraînement au format EVC, corrigé et justifié item par item.',
          Icon: ClipboardCheck, accent: '#D97706', bg: '#FEF3E2',
          available: (c.qcm_series ?? []).some((s) => s.type === 'qcm' || s.type === 'seance'),
        },
        {
          href: `/cours/${coursId}/flashcards`, label: 'Flashcards',
          desc: 'Révisez et mémorisez les points clés du programme.',
          Icon: Layers3, accent: '#16A34A', bg: '#E7F6EC',
          available: (c.flashcards?.length ?? 0) > 0,
        },
        {
          href: `/cours/${coursId}/notes`, label: 'Prise de notes',
          desc: 'Vos notes personnelles sur cet item — sauvegardées et imprimables.',
          Icon: NotebookPen, accent: '#CA8A04', bg: '#FEF9C3',
          available: true,
        },
      ]
    : (() => {
        const standardActions: Action[] = [];
        // Séance approfondie en 1ère position (visible uniquement Programme Approfondi).
        if (hasSeanceApprofondie && isApprofondi) {
          standardActions.push({
            href: allSeancesCompleted ? `/cours/${coursId}/seance-approfondie` : '#locked-seance-approfondie',
            label: 'Séance approfondie',
            desc: allSeancesCompleted
              ? 'Cours vidéo approfondis par le professeur pour aller plus loin.'
              : 'Complétez d\'abord toutes les séances du professeur (DP & QI) pour débloquer les vidéos.',
            Icon: allSeancesCompleted ? Video : Lock,
            accent: '#7C3AED',
            bg: '#F3EAFF',
            available: allSeancesCompleted,
            locked: !allSeancesCompleted,
          });
        }
        standardActions.push(
          {
            href: `/cours/${coursId}/fiche`, label: 'Fiche de cours exhaustive',
            desc: "L’intégralité du programme, hiérarchisée rang A / rang B.",
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
            available: (c.qcm_series ?? []).some((s) => s.type === 'qcm' || s.type === 'seance'),
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
          {
            href: `/cours/${coursId}/notes`, label: 'Prise de notes',
            desc: 'Vos notes personnelles sur cet item — sauvegardées et imprimables.',
            Icon: NotebookPen, accent: '#CA8A04', bg: '#FEF9C3',
            available: true,
          },
        );
        return standardActions;
      })();

  // Ordre d'affichage personnalisé par l'admin (arborescence → cours_content_slots).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: slotRows } = await (supabase as any)
    .from('cours_content_slots')
    .select('content_type, position')
    .eq('cours_id', coursId)
    .order('position', { ascending: true });
  const slotOrder = new Map<string, number>();
  ((slotRows ?? []) as { content_type: string; position: number }[]).forEach((s, i) => {
    if (!slotOrder.has(s.content_type)) slotOrder.set(s.content_type, i);
  });
  if (slotOrder.size > 0) {
    const typeOf = (href: string): string | null =>
      href.endsWith('/fiche') ? 'fiche'
      : href.endsWith('/video') ? 'video'
      : href.endsWith('/qcm') ? 'qcm'
      : href.endsWith('/flashcards') ? 'flashcards'
      : null;
    actions = actions
      .map((a, i) => ({ a, i }))
      .sort((x, y) => {
        const tx = typeOf(x.a.href);
        const ty = typeOf(y.a.href);
        const rx = tx && slotOrder.has(tx) ? (slotOrder.get(tx) as number) : 100 + x.i;
        const ry = ty && slotOrder.has(ty) ? (slotOrder.get(ty) as number) : 100 + y.i;
        return rx - ry || x.i - y.i;
      })
      .map((r) => r.a);
  }

  // Popups vidéo de l'item (actives, non encore vues par l'élève).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const { data: popupRows } = await sb
    .from('item_popups')
    .select('id, title, video_path')
    .eq('cours_id', coursId)
    .eq('active', true);
  let itemPopups: ItemPopup[] = [];
  const pRows = (popupRows ?? []) as { id: string; title: string | null; video_path: string }[];
  if (pRows.length > 0) {
    const { data: seen } = await sb
      .from('popup_views')
      .select('popup_id')
      .eq('user_id', user.id)
      .in('popup_id', pRows.map((r) => r.id));
    const seenSet = new Set(((seen ?? []) as { popup_id: string }[]).map((s) => s.popup_id));
    itemPopups = pRows
      .filter((r) => !seenSet.has(r.id))
      .map((r) => ({
        id: r.id,
        title: r.title,
        videoUrl: supabase.storage.from('item-popups').getPublicUrl(r.video_path).data.publicUrl,
      }));
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-6 lg:px-8">
      {itemPopups.length > 0 && <ItemPopups popups={itemPopups} />}
      {c.description && (
        <div className="mb-6 rounded-2xl border border-(--color-border) bg-gradient-to-br from-(--color-primary-soft) to-transparent p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-(--color-accent-deep)">
            {c.matieres.nom}
          </p>
          <p className="mt-2 leading-relaxed text-pretty text-(--color-ink)">{c.description}</p>
        </div>
      )}

      <div className={`grid gap-4 ${isMethodologie ? 'mx-auto sm:grid-cols-1 max-w-2xl' : 'sm:grid-cols-2'}`}>
        {actions.map((a) => {
          // Séance approfondie verrouillée → popup invitation DP/QI.
          if (a.href === '#locked-seance-approfondie') {
            return (
              <LockedSeanceApprofondieCard
                key={a.href}
                label={a.label}
                desc={a.desc}
                accent={a.accent}
                bg={a.bg}
              />
            );
          }

          // Découverte : la carte « Cours vidéo » est verrouillée et ouvre la
          // popup tarifs (DiscoveryLockedCard est un client component).
          if (isDecouverte && a.href === '#locked-video') {
            return (
              <DiscoveryLockedCard
                key={a.href}
                label={a.label}
                desc={a.desc}
                accent={a.accent}
                bg={a.bg}
              />
            );
          }

          // Méthodologie EVC (Découverte) : carte « Cours vidéo » non cliquable
          // avec badge orange « À venir » au lieu de « Verrouillé ».
          if (a.href === '#video-coming-soon') {
            return (
              <div
                key={a.href}
                aria-disabled
                className="group relative flex min-h-[170px] cursor-not-allowed flex-col justify-between overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 opacity-90 shadow-(--shadow-soft)"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-50"
                  style={{ background: `linear-gradient(135deg, transparent 55%, ${a.bg} 100%)` }}
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-6 bottom-0 select-none opacity-[0.08]"
                  style={{ color: a.accent }}
                >
                  <a.Icon className="h-44 w-44" strokeWidth={1.4} />
                </span>
                <div className="relative flex items-start justify-between">
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-xl opacity-90"
                    style={{ background: a.bg, color: a.accent }}
                  >
                    <a.Icon className="h-6 w-6" />
                  </span>
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em]"
                    style={{ background: '#FEF3E2', color: '#D97706' }}
                  >
                    <Sparkles className="h-3 w-3" />
                    À venir
                  </span>
                </div>
                <div className="relative mt-5">
                  <h3 className="text-lg font-bold text-(--color-ink)">{a.label}</h3>
                  <p className="mt-1.5 max-w-[80%] text-sm leading-relaxed text-(--color-ink-soft)">{a.desc}</p>
                </div>
                <span
                  className="relative mt-4 inline-flex items-center gap-1.5 text-sm font-semibold"
                  style={{ color: '#D97706' }}
                >
                  <Sparkles className="h-4 w-4" /> Bientôt disponible
                </span>
              </div>
            );
          }

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

      {/* Bandeau "tout le contenu de ce collège" (UpgradeBanner) :
          - Affiché à la fin du parcours seulement (allDone) en Découverte ;
          - Affiché en permanence pour les autres contextes (essai standard). */}
      {(!isDecouverte || allDone) && (
        <div className="mt-8">
          <UpgradeBanner context="cours" profile={profile} />
        </div>
      )}

      {/* CTA secondaire toujours visible en Découverte (mini-bannière /tarifs)
          pour offrir un accès rapide à l'achat même en cours de parcours. */}
      {isDecouverte && !allDone && (
        <div className="mt-8 overflow-hidden rounded-2xl border bg-[linear-gradient(135deg,#FFF1F3_0%,#FDE7E9_100%)] p-5 shadow-(--shadow-soft) sm:p-6"
          style={{ borderColor: 'rgba(192,17,46,0.20)' }}
        >
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ background: '#FDEEEF', color: '#C0112E' }}
              >
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[15px] font-extrabold leading-tight" style={{ color: '#0F1F4D' }}>
                  Vous testez l'aperçu Découverte
                </p>
                <p className="mt-1 text-[13px] leading-relaxed" style={{ color: '#52607A' }}>
                  Déverrouillez la totalité de la plateforme et préparez sereinement vos EVC.
                </p>
              </div>
            </div>
            <Link
              href="/tarifs"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-extrabold text-white shadow-[0_10px_25px_-10px_rgba(192,17,46,0.55)] transition-transform hover:scale-[1.02]"
              style={{ background: 'linear-gradient(90deg,#8B0E22 0%,#C0112E 100%)' }}
            >
              Voir les formules <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
