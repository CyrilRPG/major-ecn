import Image from 'next/image';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Award, ArrowRight, BookMarked, ClipboardCheck, FileText, Layers3, Lock, MonitorPlay, NotebookPen, Paperclip, Sparkles, Video, type LucideIcon } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { canAccessCollege, canAccessCours, parseScope, scopeOffers } from '@/lib/auth/permissions';
import { fetchContentAccessForScope } from '@/lib/auth/formula-permissions';
import { parseHiddenBlocks, type BlocKey } from '@/lib/student/blocs';
import { UpgradeBanner } from '@/components/student/upgrade-banner';
import { DiscoveryLockedCard } from '@/components/espace-decouverte/discovery-locked-card';
import { ItemPopups, type ItemPopup } from '@/components/student/item-popups';
import { LockedSeanceApprofondieCard } from '@/components/student/locked-seance-approfondie-card';
import { ApercuCoachmark } from '@/components/student/apercu-coachmark';

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
      id, titre, description, matiere_id, access_type, hidden_blocks,
      matieres(nom, access_type),
      videos(id, titre, type, storage_path, bunny_video_id, order_index, video_supports(id)),
      fiches(storage_path), qcm_series(type), flashcards(id)
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
  const isAdmin = profile.role === 'admin';
  const access = isAdmin ? undefined : await fetchContentAccessForScope(scope);
  const isApprofondi = scopeOffers(scope).includes('approfondi') || isAdmin;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [{ data: seanceApprofondieVideos }, { data: seanceSeries }] = isApprofondi
    ? await Promise.all([
        (supabase as any)
          .from('videos')
          .select('id, bunny_video_id, titre, serie_id, video_supports(id)')
          .eq('cours_id', coursId)
          .eq('type', 'seance_approfondie')
          // Ordre choisi par l'administrateur (Contenu › Séances approfondies).
          .order('order_index', { ascending: true })
          .order('created_at', { ascending: true }),
        supabase
          .from('qcm_series')
          .select('id, label, order_index')
          .eq('cours_id', coursId)
          .eq('type', 'seance')
          .order('order_index'),
      ])
    : [{ data: [] }, { data: [] }];
  const hasSeanceApprofondie = (seanceApprofondieVideos ?? []).length > 0;

  let allSeancesCompleted = false;
  let completedSerieIds = new Set<string>();
  const seanceLabelById = new Map<string, string>(
    ((seanceSeries ?? []) as { id: string; label: string }[]).map((s) => [s.id, s.label]),
  );
  if (hasSeanceApprofondie && isApprofondi) {
    const seanceIds = (seanceSeries ?? []).map((s: { id: string }) => s.id);
    if (seanceIds.length > 0) {
      const { data: completedSessions } = await supabase
        .from('qcm_sessions')
        .select('serie_id')
        .eq('user_id', user.id)
        .in('serie_id', seanceIds)
        .not('finished_at', 'is', null);
      completedSerieIds = new Set((completedSessions ?? []).map((s) => s.serie_id));
      allSeancesCompleted = seanceIds.every((id: string) => completedSerieIds.has(id));
    } else {
      allSeancesCompleted = true;
    }
  }

  /**
   * Déblocage PROGRESSIF : une vidéo rattachée à une séance (`videos.serie_id`)
   * s'ouvre dès que CETTE séance est terminée. Sans rattachement, on garde
   * l'ancienne règle (toutes les séances du cours) pour ne pas ouvrir
   * rétroactivement les vidéos déjà en ligne.
   */
  /** Vidéos de COURS de l'item (plusieurs possibles, ordonnées côté admin). */
  const coursVideos = ((c.videos ?? []) as unknown as {
    id: string; titre: string; type: string | null;
    storage_path: string | null; bunny_video_id: string | null;
    order_index: number | null; video_supports?: { id: string }[] | null;
  }[])
    .filter((v) => (v.type ?? 'cours') === 'cours')
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
  // Une vidéo Bunny n'a pas de storage_path : les deux hébergements comptent.
  const coursVideosDisponibles = coursVideos.some((v) => !!v.storage_path || !!v.bunny_video_id);

  type SAVid = { id: string; titre: string; bunny_video_id: string | null; serie_id: string | null; video_supports?: { id: string }[] | null };
  const saVids = ((seanceApprofondieVideos ?? []) as SAVid[]);
  const isVideoUnlocked = (v: SAVid) =>
    isAdmin || (v.serie_id ? completedSerieIds.has(v.serie_id) : allSeancesCompleted);

  // Mode Découverte : on retire « Cours vidéo » et « Interrogation »
  // (la vidéo est remplacée par une carte cadenas → popup tarifs).
  const isDecouverte = c.matiere_id === DECOUVERTE_COLLEGE_ID;
  // Cas spécial : cours « Méthodologie EVC » dans le collège Découverte —
  // on n'affiche QU'une seule carte « Cours vidéo » avec un état « À venir ».
  const isMethodologie = coursId === METHODOLOGIE_COURS_ID;

  const allDone = isDecouverte
    ? !!cpRow?.fiche_read && (qcmAttempts ?? 0) > 0 && (flashReviews ?? 0) > 0
    : (!access || access.video ? !!cpRow?.video_watched : true)
      && (!access || access.fiche ? !!cpRow?.fiche_read : true)
      && (qcmAttempts ?? 0) > 0
      && (!access || access.flashcards ? (flashReviews ?? 0) > 0 : true);
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
          desc: "L'intégralité du programme, hiérarchisée rang A / rang B.",
          Icon: FileText, accent: '#2563EB', bg: '#EFF6FF',
          available: (c.fiches ?? []).some((f) => !!f.storage_path),
        },
        {
          href: `/cours/${coursId}/fiche-express`, label: 'Fiche éclair',
          desc: "L'essentiel du cours en un coup d'œil — la page de synthèse.",
          Icon: BookMarked, accent: '#0891B2', bg: '#ECFEFF',
          available: (c.fiches ?? []).some((f) => !!f.storage_path),
        },
        {
          href: `/cours/${coursId}/qcm`, label: 'Dossiers progressifs & QI',
          desc: 'Entraînement au format EVC, corrigé et justifié item par item.',
          Icon: ClipboardCheck, accent: '#D97706', bg: '#FEF3E2',
          available: (c.qcm_series ?? []).some((s) => s.type === 'qcm' || s.type === 'seance'),
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
        // Ordre pédagogique fixe : Fiche -> Fiche éclair -> DP/QI -> Séance
        // approfondie -> Cours vidéo -> Flashcards -> Interrogation -> Notes.
        const standardActions: Action[] = [];
        if (!access || access.fiche) {
          standardActions.push(
            {
              href: `/cours/${coursId}/fiche`, label: 'Fiche de cours exhaustive',
              desc: "L'intégralité du programme, hiérarchisée rang A / rang B.",
              Icon: FileText, accent: '#2563EB', bg: '#EFF6FF',
              available: (c.fiches ?? []).some((f) => !!f.storage_path),
            },
          );
        }
        if (!access || access.ficheExpress) {
          standardActions.push(
            {
              href: `/cours/${coursId}/fiche-express`, label: 'Fiche éclair',
              desc: "L'essentiel du cours en un coup d'œil — la page de synthèse.",
              Icon: BookMarked, accent: '#0891B2', bg: '#ECFEFF',
              available: (c.fiches ?? []).some((f) => !!f.storage_path),
            },
          );
        }
        standardActions.push(
          {
            href: `/cours/${coursId}/qcm`, label: 'Dossiers progressifs & QI',
            desc: 'Entraînement au format EVC, corrigé et justifié item par item.',
            Icon: ClipboardCheck, accent: '#D97706', bg: '#FEF3E2',
            available: (c.qcm_series ?? []).some((s) => s.type === 'qcm' || s.type === 'seance'),
          },
        );
        if (hasSeanceApprofondie && isApprofondi) {
          // Une carte PAR séance approfondie : l'élève voit d'un coup d'œil
          // laquelle est ouverte, et par quelle séance du professeur.
          const plusieurs = saVids.length > 1;
          saVids.forEach((v, i) => {
            const unlocked = isVideoUnlocked(v);
            const gate = v.serie_id ? seanceLabelById.get(v.serie_id) : null;
            standardActions.push({
              href: unlocked
                ? `/cours/${coursId}/seance-approfondie?v=${v.id}`
                : '#locked-seance-approfondie',
              // Le titre de la vidéo prime ; à défaut on numérote dans l'ordre.
              label: v.titre?.trim()
                ? v.titre.trim()
                : plusieurs ? `Séance approfondie ${i + 1}` : 'Séance approfondie',
              desc: unlocked
                ? 'Cours vidéo approfondi par le professeur pour aller plus loin.'
                : gate
                  ? `Terminez « ${gate} » pour débloquer cette vidéo.`
                  : 'Complétez d\'abord les séances du professeur (DP & QI) pour débloquer cette vidéo.',
              Icon: unlocked ? Video : Lock,
              accent: '#7C3AED',
              bg: '#F3EAFF',
              available: unlocked,
              locked: !unlocked,
            });
            // Support de la séance, juste après elle.
            if ((v.video_supports ?? []).length > 0) {
              standardActions.push({
                href: `/cours/${coursId}/support/${v.id}`,
                label: `Supports — ${v.titre?.trim() || `Séance approfondie ${i + 1}`}`,
                desc: 'Les documents de la séance, consultables en ligne (non téléchargeables).',
                Icon: Paperclip,
                accent: '#7C3AED',
                bg: '#F3EAFF',
                available: true,
              });
            }
          });
        }
        if (!access || access.video) {
          standardActions.push(
            {
              href: `/cours/${coursId}/video`, label: 'Cours vidéo',
              desc: 'Le cours filmé, aligné sur les recommandations HAS.',
              Icon: MonitorPlay, accent: '#E4002B', bg: '#FDE7E9',
              available: coursVideosDisponibles,
            },
          );
          for (const v of coursVideos.filter((x) => (x.video_supports ?? []).length > 0)) {
            standardActions.push({
              href: `/cours/${coursId}/support/${v.id}`,
              label: `Supports — ${v.titre?.trim() || 'Cours vidéo'}`,
              desc: 'Les documents du cours, consultables en ligne (non téléchargeables).',
              Icon: Paperclip, accent: '#E4002B', bg: '#FDE7E9',
              available: true,
            });
          }
        }
        if (!access || access.flashcards) {
          standardActions.push(
            {
              href: `/cours/${coursId}/flashcards`, label: 'Flashcards',
              desc: 'Révisez et mémorisez les points clés du programme.',
              Icon: Layers3, accent: '#16A34A', bg: '#E7F6EC',
              available: (c.flashcards?.length ?? 0) > 0,
            },
          );
        }
        if (!access || access.interrogation) {
          standardActions.push(
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
          );
        }
        standardActions.push(
          {
            href: `/cours/${coursId}/notes`, label: 'Prise de notes',
            desc: 'Vos notes personnelles sur cet item — sauvegardées et imprimables.',
            Icon: NotebookPen, accent: '#CA8A04', bg: '#FEF9C3',
            available: true,
          },
        );
        return standardActions;
      })();

  // Blocs masqués pour cet item par l'administration : les cartes
  // correspondantes disparaissent de l'aperçu, comme les onglets.
  const hiddenBlocks = parseHiddenBlocks((c as unknown as { hidden_blocks?: unknown }).hidden_blocks);
  if (hiddenBlocks.length > 0) {
    const blocOf = (href: string): BlocKey | null =>
      href.endsWith('/fiche-express') ? 'fiche-express'
      : href.endsWith('/fiche') ? 'fiche'
      : href.endsWith('/video') || href === '#locked-video' || href === '#video-coming-soon' ? 'video'
      : href.endsWith('/qcm') ? 'qcm'
      : href.endsWith('/flashcards') ? 'flashcards'
      : href.endsWith('/interrogation') ? 'interrogation'
      : href.endsWith('/notes') ? 'notes'
      : href.includes('/seance-approfondie') || href === '#locked-seance-approfondie' ? 'seance-approfondie'
      : null;
    actions = actions.filter((a) => {
      const b = blocOf(a.href);
      return !b || !hiddenBlocks.includes(b);
    });
  }

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
      href.endsWith('/fiche-express') ? 'fiche-express'
      : href.endsWith('/fiche') ? 'fiche'
      : href.endsWith('/video') ? 'video'
      : href.endsWith('/qcm') ? 'qcm'
      : href.endsWith('/flashcards') ? 'flashcards'
      : href.endsWith('/seance-approfondie') || href === '#locked-seance-approfondie' ? 'seance-approfondie'
      : null;
    // Ordre canonique de repli (types non gérés par les slots admin). Fiche
    // éclair colle à la Fiche, Séance approfondie colle aux DP/QI.
    const CANON: Record<string, number> = { fiche: 0, 'fiche-express': 1, qcm: 2, 'seance-approfondie': 3, video: 4, flashcards: 5 };
    const rankOf = (t: string | null, i: number): number => {
      if (t === 'fiche-express') return (slotOrder.has('fiche') ? (slotOrder.get('fiche') as number) : CANON.fiche) + 0.5;
      if (t === 'seance-approfondie') return (slotOrder.has('qcm') ? (slotOrder.get('qcm') as number) : CANON.qcm) + 0.5;
      if (t && slotOrder.has(t)) return slotOrder.get(t) as number;
      if (t && t in CANON) return CANON[t];
      return 100 + i; // Notes / Interrogation : toujours en fin
    };
    actions = actions
      .map((a, i) => ({ a, i }))
      .sort((x, y) => (rankOf(typeOf(x.a.href), x.i) - rankOf(typeOf(y.a.href), y.i)) || x.i - y.i)
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

      <ApercuCoachmark />
      <div data-tour="apercu-content" className={`grid gap-4 ${isMethodologie ? 'mx-auto sm:grid-cols-1 max-w-2xl' : 'sm:grid-cols-2'}`}>
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
