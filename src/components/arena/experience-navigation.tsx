"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useSyncExternalStore, useTransition } from "react";
import { Bell, CalendarDays, ChevronDown, FileText, House, LogIn, LogOut, UserRound, Trophy } from "lucide-react";
import { ArenaBars as ChartNoAxesColumnIncreasing } from "./experience-icons";
import { ArenaAvatar } from "./arena-avatar";
import { logoutArena } from "@/app/(arena)/arena/[slug]/actions";
import { activeArenaSection, arenaSectionHref, type ArenaNavigation } from "@/lib/arena/navigation";

function subscribeHash(onChange: () => void) {
  window.addEventListener('hashchange', onChange);
  window.addEventListener('popstate', onChange);
  return () => {
    window.removeEventListener('hashchange', onChange);
    window.removeEventListener('popstate', onChange);
  };
}
const readHash = () => window.location.hash;
const serverHash = () => '';

/** Ferme un menu déroulant (<details>) au clic extérieur ou sur Échap, en rendant le focus au déclencheur. */
function useDismiss(ref: React.RefObject<HTMLDetailsElement | null>) {
  useEffect(() => {
    function dismiss(event: PointerEvent | KeyboardEvent) {
      const menu = ref.current;
      if (!menu?.open) return;
      if (event instanceof KeyboardEvent) {
        if (event.key !== 'Escape') return;
        menu.querySelector('summary')?.focus();
      } else if (menu.contains(event.target as Node)) return;
      menu.open = false;
    }
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', dismiss);
    return () => {
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('keydown', dismiss);
    };
  }, [ref]);
}

/**
 * En-tête unique de l'arène (maquettes client du 24/09/2026) : casque +
 * wordmark, Accueil · Règles · Calendrier · Meilleurs scores, cloche des
 * annonces du tournoi (manches ouvertes / à venir, résultats publiés) et menu
 * du compte (Mon espace, Mon profil, Se déconnecter). Aucun bouton mort : sans
 * annonce, la cloche le dit et renvoie au calendrier.
 */
export function ExperienceNavigation({ nav }: { nav: ArenaNavigation }) {
  const path = usePathname();
  const query = useSearchParams();
  const router = useRouter();
  const hash = useSyncExternalStore(subscribeHash, readHash, serverHash);
  const notifications = useRef<HTMLDetailsElement>(null);
  const account = useRef<HTMLDetailsElement>(null);
  const [leaving, startLeaving] = useTransition();
  useDismiss(notifications);
  useDismiss(account);
  const base = arenaSectionHref(nav.slug, 'accueil');
  const home = arenaSectionHref(nav.slug, 'accueil', Boolean(nav.participant));
  const calendar = arenaSectionHref(nav.slug, 'calendrier');
  const active = activeArenaSection(path, hash, query.get('vue'));
  const person = nav.participant ?? nav.account ?? null;
  const links = [
    { label: "Accueil", icon: House, href: home, active: active === 'accueil' },
    { label: "Règles", icon: FileText, href: arenaSectionHref(nav.slug, 'regles'), active: active === 'regles' },
    { label: "Calendrier", icon: CalendarDays, href: calendar, active: active === 'calendrier' },
    { label: "Meilleurs scores", icon: ChartNoAxesColumnIncreasing, href: arenaSectionHref(nav.slug, 'classement'), active: active === 'classement' },
  ];
  const updates = nav.updates ?? [];
  const loginHref = nav.slug ? `/arena/connexion?tournoi=${encodeURIComponent(nav.slug)}` : '/arena/connexion';
  return (
    <header className="arena-experience-header">
      <Link className="arena-experience-brand" href={base} aria-label="EVC Arena — accueil">
        <span className="ae-reference-wordmark" role="img" aria-label="EVC Arena by Major ECN" />
      </Link>
      <nav className="arena-experience-nav" aria-label="Navigation de l’arène">
        {links.map(({ label, icon: Icon, href, active }) => {
          // Native anchor navigation also notifies hash subscribers and scrolls
          // to the calendar after a document load, including without JavaScript.
          const NavigationLink = href.includes('#') || (path === href && hash) ? 'a' : Link;
          return <NavigationLink key={label} href={href} aria-current={active ? "page" : undefined}>
            <Icon aria-hidden />
            <span>{label}</span>
          </NavigationLink>;
        })}
      </nav>
      <div className="arena-experience-account">
        <details className="arena-notifications" ref={notifications}>
          <summary aria-label={updates.length ? `Annonces du tournoi (${updates.length})` : 'Annonces du tournoi'}>
            <Bell aria-hidden />
            {updates.length > 0 && <span className="arena-bell-dot" aria-hidden />}
          </summary>
          <div className="arena-account-popover arena-menu" onClick={(event) => { if ((event.target as HTMLElement).closest('a') && notifications.current) notifications.current.open = false; }}>
            <p className="arena-menu-title">{nav.slug ? nav.title : 'Les tournois EVC Arena'}</p>
            {updates.length ? <ul className="arena-menu-updates">
              {updates.map(update => <li key={update.href + update.title}>
                <Link href={update.href}><strong>{update.title}</strong><small>{update.detail}</small></Link>
              </li>)}
            </ul> : <p className="arena-menu-empty">Aucune nouvelle manche ni publication annoncée.</p>}
            <Link className="arena-menu-more" href={calendar}>
              <CalendarDays aria-hidden />Voir le calendrier des tournois
            </Link>
          </div>
        </details>
        {person ? (
          <details className="arena-profile-menu" ref={account}>
            <summary className="arena-profile-link" aria-label={`Mon compte — ${person.pseudo}`}>
              <ArenaAvatar seed={person.avatar_seed ?? "casque"} rank={nav.participant?.rank} distinction={nav.participant?.distinction} size={50} />
              <span>{person.pseudo}</span>
              <ChevronDown aria-hidden size={20} />
            </summary>
            <div className="arena-account-popover arena-menu arena-menu--account" onClick={(event) => { if ((event.target as HTMLElement).closest('a') && account.current) account.current.open = false; }}>
              <p className="arena-menu-title">{person.pseudo}</p>
              <ul className="arena-menu-list">
                {nav.participant ? <>
                  <li><Link href={home}><House aria-hidden />Mon espace</Link></li>
                  <li><Link href={`${home}#compte`}><UserRound aria-hidden />Mon profil</Link></li>
                  <li><Link href={`${home}#palmares-title`}><Trophy aria-hidden />Mon palmarès</Link></li>
                </> : nav.account && <li><Link href={nav.account.href}><House aria-hidden />{nav.account.href.endsWith('/inscription') ? 'M’inscrire à ce tournoi' : 'Mon espace'}</Link></li>}
                <li>
                  <button type="button" disabled={leaving} onClick={() => startLeaving(async () => {
                    await logoutArena();
                    if (account.current) account.current.open = false;
                    router.push(nav.slug ? `/arena/${nav.slug}` : '/arena');
                    router.refresh();
                  })}><LogOut aria-hidden />{leaving ? 'Déconnexion…' : 'Se déconnecter'}</button>
                </li>
              </ul>
            </div>
          </details>
        ) : (
          <Link className="arena-profile-link" href={loginHref} aria-label="Connexion">
            <ArenaAvatar seed="casque" size={50} />
            <span>Connexion</span>
            <LogIn aria-hidden size={20} />
          </Link>
        )}
      </div>
      {nav.staffPreview && (
        <p className="arena-preview-strip">
          Mode prévisualisation — aucun score n’est enregistré
        </p>
      )}
    </header>
  );
}
