'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AlertTriangle, BarChart3, BookOpen, CalendarClock, CalendarDays, ChevronDown, Clapperboard, ClipboardList, Cog, Eye, GraduationCap, Library, ListTree, Mail, Megaphone, MessageCircle, MessagesSquare, MonitorPlay, Newspaper, PencilRuler, Receipt, ScrollText, ShieldCheck, Trophy, Upload, UserCog, Users, X } from 'lucide-react';
import { BrandLogo } from '@/components/brand/brand-logo';
import { cn } from '@/lib/utils';
import type { Profile } from '@/lib/auth/get-profile';
import { hasAnyContentAccess, type ContentType, type PermissionLevel } from '@/lib/schemas/professor';

type Item = { href: string; label: string; Icon: typeof Users; staff?: boolean; profContent?: boolean; adminOnly?: boolean };
type Group = { key: string; label: string; Icon: typeof Users; items: Item[] };

const GROUPS: Group[] = [
  {
    key: 'utilisateurs',
    label: 'Utilisateurs',
    Icon: Users,
    items: [
      { href: '/admin/eleves', label: 'Élèves', Icon: Users },
      { href: '/admin/professeurs', label: 'Professeurs', Icon: GraduationCap },
      { href: '/admin/leads', label: 'Leads', Icon: Users, adminOnly: true },
      { href: '/admin/leads-methodologie', label: 'Leads méthodo', Icon: Users, adminOnly: true },
    ],
  },
  {
    key: 'pedagogie',
    label: 'Pédagogie',
    Icon: BookOpen,
    items: [
      { href: '/admin/arborescence', label: 'Arborescence', Icon: ListTree },
      { href: '/admin/contenu', label: 'Contenu', Icon: Library, profContent: true },
      { href: '/admin/import-exercices', label: 'Import d’exercices', Icon: Upload, adminOnly: true },
      { href: '/admin/videos', label: 'Vidéos', Icon: Clapperboard, profContent: true },
      { href: '/admin/epreuves-blanches', label: 'Épreuves blanches', Icon: PencilRuler, adminOnly: true },
      { href: '/admin/interrogations', label: 'Interrogations de spécialité', Icon: ClipboardList, adminOnly: true },
      { href: '/admin/parcours', label: 'Parcours du Major', Icon: Trophy, adminOnly: true },
      { href: '/admin/qa', label: 'Questions / Réponses', Icon: MessagesSquare, staff: true },
    ],
  },
  {
    key: 'planning',
    label: 'Planning',
    Icon: CalendarDays,
    items: [
      { href: '/admin/sessions', label: 'Sessions EVC', Icon: CalendarClock, adminOnly: true },
      { href: '/admin/agenda', label: 'Agenda', Icon: CalendarDays },
    ],
  },
  {
    key: 'communication',
    label: 'Communication',
    Icon: MessageCircle,
    items: [
      { href: '/admin/annonces', label: 'Annonces', Icon: Megaphone },
      { href: '/admin/blog', label: 'Blog', Icon: Newspaper, adminOnly: true },
      { href: '/admin/popups', label: 'Popups', Icon: MonitorPlay, adminOnly: true },
      { href: '/admin/emails', label: 'Envoi d’emails', Icon: Mail },
      { href: '/admin/formulaires', label: 'Formulaires', Icon: ClipboardList },
    ],
  },
  {
    key: 'suivi',
    label: 'Suivi & analyse',
    Icon: BarChart3,
    items: [
      { href: '/admin/alertes', label: 'Alertes pédagogiques', Icon: AlertTriangle },
      { href: '/admin/crm', label: 'CRM pédagogique', Icon: UserCog },
      { href: '/admin/stats', label: 'Stats', Icon: BarChart3 },
      { href: '/admin/facturation', label: 'Facturation IA', Icon: Receipt },
      { href: '/admin/logs', label: 'Logs', Icon: ScrollText, adminOnly: true },
    ],
  },
  {
    key: 'configuration',
    label: 'Configuration',
    Icon: Cog,
    items: [
      { href: '/admin/permissions', label: 'Config. Permissions', Icon: ShieldCheck, adminOnly: true },
    ],
  },
];

// Item spécial affiché à part (bascule de vue, hors catégories).
const STUDENT_VIEW: Item = { href: '/accueil', label: 'Vue étudiant', Icon: Eye, adminOnly: true };

type ProfScopeRaw = {
  role?: 'professor';
  content_permissions?: Partial<Record<ContentType, PermissionLevel>>;
  content_types?: ContentType[];
};
function readProfContentAccess(scope: unknown): boolean {
  if (!scope || typeof scope !== 'object') return false;
  const s = scope as ProfScopeRaw;
  if (s.content_permissions && Object.values(s.content_permissions).some((p) => p && p !== 'none')) return true;
  if (s.content_types && s.content_types.length > 0) return true;
  return hasAnyContentAccess(s as never);
}

const BG = 'linear-gradient(180deg, #0E1626 0%, #161336 40%, #2A1130 75%, #2D0518 100%)';

function filterItems(items: Item[], isProf: boolean, profHasContent: boolean): Item[] {
  if (!isProf) return items;
  return items.filter((i) => i.staff || (i.profContent && profHasContent));
}

export function AdminSidebar({ profile }: { profile: Profile }) {
  const path = usePathname();
  const isActive = (href: string) => path === href || path.startsWith(href + '/');

  const isProf = profile.role === 'professor';
  const profHasContent = isProf && readProfContentAccess(profile.permission_scope);

  // Groupes visibles (au moins un item accessible après filtrage) + item Vue étudiant.
  const visibleGroups = useMemo(
    () =>
      GROUPS.map((g) => ({ ...g, items: filterItems(g.items, isProf, profHasContent) }))
        .filter((g) => g.items.length > 0),
    [isProf, profHasContent],
  );
  const showStudentView = !isProf; // adminOnly

  // Groupes ouverts : la persistance se fait par utilisateur (localStorage).
  // Par défaut tout est replié ; la catégorie contenant la page active s'ouvre
  // toute seule pour que l'onglet courant reste visible.
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem('admin:sidebar:open');
      if (raw) setOpen(JSON.parse(raw));
    } catch {
      // ignorer un JSON corrompu
    }
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem('admin:sidebar:open', JSON.stringify(open));
    } catch {
      // quota / mode privé : peu importe
    }
  }, [open, hydrated]);

  const activeGroupKey = useMemo(() => {
    for (const g of visibleGroups) {
      if (g.items.some((it) => isActive(it.href))) return g.key;
    }
    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleGroups, path]);

  const toggle = (key: string) => setOpen((o) => ({ ...o, [key]: !o[key] }));

  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    setMobileOpen(false);
  }, [path]);

  const groupsList = (variant: 'desktop' | 'mobile') => (
    <nav className="space-y-1 px-2 pb-4">
      {visibleGroups.map((g) => {
        const isOpen = open[g.key] ?? g.key === activeGroupKey;
        const groupHasActive = g.key === activeGroupKey;
        return (
          <div key={g.key}>
            <button
              type="button"
              onClick={() => toggle(g.key)}
              aria-expanded={isOpen}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] font-semibold uppercase tracking-[0.08em] transition-colors focus-ring',
                groupHasActive ? 'text-white' : 'text-white/60 hover:text-white/90 hover:bg-white/5',
              )}
            >
              <g.Icon className="h-[16px] w-[16px] shrink-0" />
              <span className="flex-1 truncate">{g.label}</span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 shrink-0 transition-transform',
                  isOpen ? 'rotate-0' : '-rotate-90',
                )}
              />
            </button>
            {isOpen && (
              <div className="mt-1 space-y-1 pl-2">
                {g.items.map((it) => (
                  <Link
                    key={it.href}
                    href={it.href}
                    onClick={() => variant === 'mobile' && setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-[14px] font-medium transition-colors focus-ring',
                      isActive(it.href)
                        ? 'bg-[linear-gradient(90deg,#E4002B_0%,#F97316_100%)] text-white shadow-[0_6px_20px_-8px_rgba(228,0,43,0.6)]'
                        : 'text-white/75 hover:bg-white/10 hover:text-white',
                    )}
                  >
                    <it.Icon className="h-[18px] w-[18px]" />
                    {it.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
      {showStudentView && (
        <div className="pt-3">
          <Link
            href={STUDENT_VIEW.href}
            onClick={() => variant === 'mobile' && setMobileOpen(false)}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] font-medium transition-colors focus-ring',
              isActive(STUDENT_VIEW.href)
                ? 'bg-[linear-gradient(90deg,#E4002B_0%,#F97316_100%)] text-white shadow-[0_6px_20px_-8px_rgba(228,0,43,0.6)]'
                : 'text-white/75 hover:bg-white/10 hover:text-white',
            )}
          >
            <STUDENT_VIEW.Icon className="h-[18px] w-[18px]" />
            {STUDENT_VIEW.label}
          </Link>
        </div>
      )}
    </nav>
  );

  const sidebarBody = (
    <>
      <div className="flex h-20 items-center justify-center border-b border-white/10 px-4">
        <BrandLogo className="h-16 w-auto [filter:brightness(0)_invert(1)]" />
      </div>
      <p className="px-5 pb-2 pt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
        Administration
      </p>
      <div className="min-h-0 flex-1 overflow-y-auto">{groupsList('desktop')}</div>
    </>
  );

  return (
    <>
      {/* Desktop : rail sombre à gauche */}
      <aside
        className="hidden w-60 shrink-0 flex-col text-white lg:flex"
        style={{ background: BG }}
      >
        {sidebarBody}
      </aside>

      {/* Mobile : barre supérieure sombre + drawer */}
      <header
        className="sticky top-0 z-30 flex items-center gap-2 px-3 py-2 text-white sm:gap-3 sm:px-4 sm:py-2.5 lg:hidden"
        style={{ background: BG }}
      >
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Ouvrir le menu"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-white/85 hover:bg-white/10 focus-ring"
        >
          <ListTree className="h-5 w-5" />
        </button>
        <BrandLogo className="h-9 w-auto shrink-0 sm:h-10 [filter:brightness(0)_invert(1)]" />
        <span className="ml-2 truncate text-xs font-semibold uppercase tracking-[0.14em] text-white/60 sm:text-sm">
          Administration
        </span>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Fermer le menu"
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div
            className="absolute inset-y-0 left-0 flex w-[280px] flex-col text-white shadow-(--shadow-lifted)"
            style={{ background: BG }}
          >
            <div className="relative flex h-16 items-center justify-center border-b border-white/10 px-4">
              <BrandLogo className="h-12 w-auto [filter:brightness(0)_invert(1)]" />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Fermer"
                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 focus-ring"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="px-5 pb-2 pt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
              Administration
            </p>
            <div className="min-h-0 flex-1 overflow-y-auto">{groupsList('mobile')}</div>
          </div>
        </div>
      )}
    </>
  );
}
