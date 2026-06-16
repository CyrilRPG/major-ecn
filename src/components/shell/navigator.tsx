'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowRight, CalendarDays, ChevronRight, FileText, Home, Lock, MessagesSquare,
  MousePointerClick, RefreshCcw, Sparkles, Target, Trophy, X,
} from 'lucide-react';
import { iconFromKey } from '@/lib/icons';
import { cn } from '@/lib/utils';
import type { NavCollege } from '@/lib/data/navigator';
import { LockedContentModal } from '@/components/espace-decouverte/locked-content-modal';

/** Active pill : dégradé rouge → orange identique sur tous les items
 *  (top-level et sub-items). Reflète la maquette du client. */
const ACTIVE_GRADIENT =
  'bg-[linear-gradient(90deg,#E4002B_0%,#F97316_100%)] text-white shadow-[0_6px_20px_-8px_rgba(228,0,43,0.6)]';

/** Identifiant du collège « Découverte » (mode Espace découverte). */
const DECOUVERTE_COLLEGE_ID = 'col-decouverte';
/** Clé localStorage : coachmark « Cliquez sur Découverte » montré une seule fois. */
const DECOUVERTE_COACHMARK_KEY = 'mecn_decouverte_coachmark_v1';

function ProgressDot({ value, active }: { value: number; active?: boolean }) {
  const v = Math.min(100, Math.max(0, value));
  const fill = active ? '#FFFFFF' : '#E4002B';
  const track = active ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.18)';
  return (
    <span className="flex shrink-0 items-center gap-1.5">
      <span
        className={
          active
            ? 'w-7 text-right text-[11px] font-semibold tabular-nums text-white'
            : 'w-7 text-right text-[11px] font-medium tabular-nums text-white/55'
        }
      >
        {v}%
      </span>
      <span
        className="h-4 w-4 shrink-0 rounded-full ring-1 ring-white/25"
        style={{ background: `conic-gradient(${fill} ${v * 3.6}deg, ${track} 0)` }}
        aria-hidden
      />
    </span>
  );
}

/** Encadré Découverte compact pour la sidebar — dégradé doré + CTA blanc
 *  vers /tarifs. Affiché au-dessus d'Accueil quand le profil est en mode
 *  Découverte. */
function DiscoverySidebarCta() {
  return (
    <Link
      href="/tarifs"
      className="group mb-2 flex items-center gap-2.5 rounded-xl border px-2.5 py-2.5 transition-all hover:scale-[1.01]"
      style={{
        background: 'linear-gradient(135deg, rgba(245,200,75,0.18) 0%, rgba(192,17,46,0.22) 100%)',
        borderColor: 'rgba(245,200,75,0.32)',
      }}
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
        style={{
          background: 'linear-gradient(135deg, #F5C84B 0%, #E8742C 100%)',
          color: '#1F2937',
        }}
      >
        <Trophy className="h-4 w-4" strokeWidth={2.5} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[12.5px] font-extrabold leading-tight text-white">
          Espace découverte
        </p>
        <p className="text-[10.5px] leading-tight text-white/70">
          Voir les formules
        </p>
      </div>
      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-white/70 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

export function Navigator({
  tree,
  role = 'student',
  isDecouverte = false,
}: {
  tree: NavCollege[];
  role?: 'student' | 'admin' | 'professor';
  /** Mode Découverte : Entraînement / Révisions / Agenda / Annales EVC
   *  deviennent des boutons cadenas qui ouvrent LockedContentModal. */
  isDecouverte?: boolean;
}) {
  // Pour les profs : seulement les collèges/cours, pas Accueil/Agenda/etc.
  const isProf = role === 'professor';
  const pathname = usePathname();
  const activeCoursId = pathname.startsWith('/cours/') ? pathname.split('/')[2] : null;
  const activeCollegeId = pathname.startsWith('/matieres/') ? pathname.split('/')[2] : null;
  // Détection de /matieres/<col>/annales — pour surligner « Annales EVC »
  // dans le sous-menu du bon collège.
  const activeAnnaleCollege =
    pathname.startsWith('/matieres/') && pathname.split('/')[3] === 'annales'
      ? pathname.split('/')[2]
      : null;

  const expanded = useMemo(() => {
    const set = new Set<string>();
    for (const col of tree) {
      if (
        col.id === activeCollegeId ||
        col.id === activeAnnaleCollege ||
        col.cours.some((c) => c.id === activeCoursId)
      ) {
        set.add(col.id);
      }
    }
    return set;
  }, [tree, activeCollegeId, activeCoursId, activeAnnaleCollege]);

  const [open, setOpen] = useState<Set<string>>(expanded);
  const isOpen = (id: string) => open.has(id) || expanded.has(id);
  const toggle = (id: string) =>
    setOpen((prev) => {
      const n = new Set(prev);
      if (n.has(id) || expanded.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  /** State du popup "Ce contenu est réservé" en mode Découverte. */
  const [lockedOpen, setLockedOpen] = useState(false);

  /** Collège « Découverte » à mettre en avant (coachmark). */
  const decouverteColId = useMemo(() => {
    const c = tree.find(
      (col) => col.id === DECOUVERTE_COLLEGE_ID || /d[ée]couverte/i.test(col.nom),
    );
    return c?.id ?? null;
  }, [tree]);

  /** Coachmark « Cliquez sur Découverte » — affiché une seule fois (localStorage). */
  const [showCoachmark, setShowCoachmark] = useState(false);
  useEffect(() => {
    if (isProf || !isDecouverte || !decouverteColId) return;
    let raf = 0;
    try {
      if (window.localStorage.getItem(DECOUVERTE_COACHMARK_KEY) !== '1') {
        // rAF : évite un setState synchrone dans l'effet (et tout mismatch
        // d'hydratation) — le coachmark apparaît juste après le 1er rendu.
        raf = requestAnimationFrame(() => setShowCoachmark(true));
      }
    } catch {
      /* localStorage indisponible (mode privé) : on n'affiche pas le coachmark. */
    }
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [isProf, isDecouverte, decouverteColId]);

  const dismissCoachmark = useCallback(() => {
    setShowCoachmark(false);
    try {
      window.localStorage.setItem(DECOUVERTE_COACHMARK_KEY, '1');
    } catch {
      /* noop */
    }
  }, []);

  const homeActive = pathname === '/accueil';
  const trainActive = pathname.startsWith('/entrainement');
  const transversalActive = pathname.startsWith('/revisions-transversales');
  const agendaActive = pathname.startsWith('/agenda');

  const topLevelClass = (active: boolean) =>
    cn(
      'mb-1 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-left font-medium transition-colors',
      active ? ACTIVE_GRADIENT : 'text-white/85 hover:bg-white/10 hover:text-white',
    );

  /** Helper : rendu d'un item top-level verrouillé en Découverte.
   *  Apparence : icône grisée + badge cadenas rouge + clic = popup. */
  const renderLockedTop = (Icon: typeof Target, label: string) => (
    <button
      type="button"
      onClick={() => setLockedOpen(true)}
      className="mb-1 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-left font-medium text-white/55 transition-colors hover:bg-white/10 hover:text-white/80"
    >
      <Icon className="h-[18px] w-[18px] shrink-0" />
      <span className="flex-1 truncate">{label}</span>
      <span
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
        style={{ background: 'rgba(192,17,46,0.20)', color: '#FCA5A5' }}
      >
        <Lock className="h-3 w-3" />
      </span>
    </button>
  );

  return (
    <nav aria-label="Navigation" className="space-y-0.5 px-2 pb-8 text-[15px]">
      {/* Encadré Espace découverte — juste au-dessus de Accueil. */}
      {isDecouverte && !isProf && <DiscoverySidebarCta />}

      {/* Accueil : présent pour tous, mais redirige vers la page d'accueil
          adaptée au rôle (ProfWelcome pour les profs). */}
      <Link href="/accueil" className={topLevelClass(homeActive)}>
        <Home className="h-[18px] w-[18px] shrink-0" />
        Accueil
      </Link>

      {!isProf && (
        <>
          {isDecouverte ? (
            <>
              {renderLockedTop(Target, 'Entraînement ciblé')}
              {renderLockedTop(RefreshCcw, 'Révisions transversales')}
              {renderLockedTop(CalendarDays, 'Agenda')}
            </>
          ) : (
            <>
              <Link href="/entrainement" className={topLevelClass(trainActive)}>
                <Target className="h-[18px] w-[18px] shrink-0" />
                Entraînement ciblé
              </Link>

              <Link href="/revisions-transversales" className={topLevelClass(transversalActive)}>
                <RefreshCcw className="h-[18px] w-[18px] shrink-0" />
                Révisions transversales
              </Link>

              <Link href="/agenda" className={topLevelClass(agendaActive)}>
                <CalendarDays className="h-[18px] w-[18px] shrink-0" />
                Agenda
              </Link>
            </>
          )}
        </>
      )}

      <p className="px-3 pb-2 pt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
        {isProf ? 'Mes collèges' : 'Médecine'}
      </p>
      {tree.length === 0 && (
        <p className="px-3 py-6 text-sm text-white/50">Aucun contenu accessible.</p>
      )}
      {tree.map((col) => {
        const Icon = iconFromKey(col.iconKey ?? undefined);
        const o = isOpen(col.id);
        const isDecouverteCol = col.id === decouverteColId;
        return (
          <div key={col.id} className={isDecouverteCol ? 'relative' : undefined}>
            <button
              type="button"
              onClick={() => {
                toggle(col.id);
                if (isDecouverteCol) dismissCoachmark();
              }}
              className="group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-left font-medium text-white/85 transition-colors hover:bg-white/10 hover:text-white"
            >
              <ChevronRight
                className={cn(
                  'h-4 w-4 shrink-0 text-white/45 transition-transform',
                  o && 'rotate-90',
                )}
              />
              <Icon className="h-[18px] w-[18px] shrink-0 text-white" />
              <span className="flex-1 truncate">{col.nom}</span>
              <span className="rounded-full bg-white/10 px-1.5 py-px text-[11px] font-semibold tabular-nums text-white/70">
                {col.cours.length}
              </span>
            </button>

            {/* Coachmark « Cliquez sur Découverte » — une seule fois. */}
            {isDecouverteCol && showCoachmark && (
              <div className="relative z-30 ml-6 mr-1 mt-2">
                {/* Flèche pointant vers l'item Découverte au-dessus. */}
                <span
                  aria-hidden
                  className="absolute -top-1.5 left-6 h-3 w-3 rotate-45 rounded-[3px] bg-white"
                />
                <div className="relative rounded-xl bg-white p-3 pr-7 shadow-[0_18px_45px_-12px_rgba(0,0,0,0.45)]">
                  <button
                    type="button"
                    onClick={dismissCoachmark}
                    aria-label="Fermer"
                    className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  <p className="flex items-start gap-1.5 text-[12.5px] leading-snug" style={{ color: '#1F2937' }}>
                    <MousePointerClick className="mt-px h-4 w-4 shrink-0" style={{ color: '#C0112E' }} />
                    <span>
                      Cliquez sur{' '}
                      <span className="font-extrabold" style={{ color: '#C0112E' }}>Découverte</span>{' '}
                      pour accéder au contenu mis en ligne dans le cadre de la découverte de la plateforme.
                    </span>
                  </p>
                </div>
              </div>
            )}

            {o && (
              <>
                {/* Annales EVC : entrée transversale, en tête du sous-menu
                    du collège. En Découverte → cadenas + popup. */}
                {isDecouverte ? (
                  <button
                    type="button"
                    onClick={() => setLockedOpen(true)}
                    className="flex w-full items-center gap-2 rounded-lg py-2 pl-10 pr-2.5 text-left text-white/55 transition-colors hover:bg-white/10 hover:text-white/80"
                  >
                    <FileText className="h-3.5 w-3.5 shrink-0 text-white/45" />
                    <span className="flex-1 truncate">Annales EVC</span>
                    <span
                      className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
                      style={{ background: 'rgba(192,17,46,0.20)', color: '#FCA5A5' }}
                    >
                      <Lock className="h-2.5 w-2.5" />
                    </span>
                  </button>
                ) : (
                  <Link
                    href={`/matieres/${col.id}/annales`}
                    className={cn(
                      'flex items-center gap-2 rounded-lg py-2 pl-10 pr-2.5 transition-colors',
                      col.id === activeAnnaleCollege
                        ? `${ACTIVE_GRADIENT} font-medium`
                        : 'text-white/75 hover:bg-white/10 hover:text-white',
                    )}
                  >
                    <FileText
                      className={cn(
                        'h-3.5 w-3.5 shrink-0',
                        col.id === activeAnnaleCollege ? 'text-white' : 'text-white/55',
                      )}
                    />
                    <span className="flex-1 truncate">Annales EVC</span>
                    <span
                      className={cn(
                        'rounded-full px-1.5 py-px text-[10px] font-semibold uppercase tracking-wider',
                        col.id === activeAnnaleCollege
                          ? 'bg-white/15 text-white'
                          : 'bg-white/10 text-white/60',
                      )}
                    >
                      Officiel
                    </span>
                  </Link>
                )}

                {col.cours.map((c) => (
                  <Link
                    key={c.id}
                    href={`/cours/${c.id}`}
                    className={cn(
                      'flex items-center gap-2 rounded-lg py-2 pl-10 pr-2.5 transition-colors',
                      c.id === activeCoursId
                        ? `${ACTIVE_GRADIENT} font-medium`
                        : 'text-white/70 hover:bg-white/10 hover:text-white',
                    )}
                  >
                    <span className="flex-1 truncate">{c.titre}</span>
                    <ProgressDot value={c.progress} active={c.id === activeCoursId} />
                  </Link>
                ))}
              </>
            )}
          </div>
        );
      })}

      {/* Popup "Ce contenu est réservé" (LockedContentModal) — affichée
          quand l'utilisateur Découverte clique sur Entraînement/Révisions/
          Agenda/Annales EVC dans le menu. */}
      <LockedContentModal open={lockedOpen} onClose={() => setLockedOpen(false)} />
    </nav>
  );
}
