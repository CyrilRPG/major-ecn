"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { Bell, CalendarDays, ChevronDown, FileText, House } from "lucide-react";
import { ArenaBars as ChartNoAxesColumnIncreasing } from "./experience-icons";
import { ArenaAvatar } from "./arena-avatar";
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

export function ExperienceNavigation({ nav }: { nav: ArenaNavigation }) {
  const path = usePathname();
  const query = useSearchParams();
  const hash = useSyncExternalStore(subscribeHash, readHash, serverHash);
  const notifications = useRef<HTMLDetailsElement>(null);
  const base = arenaSectionHref(nav.slug, 'accueil');
  const home = arenaSectionHref(nav.slug, 'accueil', Boolean(nav.participant));
  const active = activeArenaSection(path, hash, query.get('vue'));
  useEffect(() => {
    function dismiss(event: PointerEvent | KeyboardEvent) {
      const menu = notifications.current;
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
  }, []);
  const links = [
    {
      label: "Accueil",
      icon: House,
      href: home,
      active: active === 'accueil',
    },
    {
      label: "Règles",
      icon: FileText,
      href: arenaSectionHref(nav.slug, 'regles'),
      active: active === 'regles',
    },
    {
      label: "Calendrier",
      icon: CalendarDays,
      href: arenaSectionHref(nav.slug, 'calendrier'),
      active: active === 'calendrier',
    },
    {
      label: "Meilleurs scores",
      icon: ChartNoAxesColumnIncreasing,
      href: arenaSectionHref(nav.slug, 'classement'),
      active: active === 'classement',
    },
  ];
  return (
    <header className="arena-experience-header">
      <Link
        className="arena-experience-brand"
        href={base}
        aria-label="EVC Arena — accueil"
      >
        <span
          className="ae-reference-wordmark"
          role="img"
          aria-label="EVC Arena by Major ECN"
        />
      </Link>
      <nav className="arena-experience-nav" aria-label="Navigation de l’arène">
        {links.map(({ label, icon: Icon, href, active }) => {
          // Native anchor navigation also notifies hash subscribers and scrolls
          // to the calendar after a document load, including without JavaScript.
          const NavigationLink = href.includes('#') || (path === href && hash) ? 'a' : Link;
          return <NavigationLink
            key={label}
            href={href}
            aria-current={active ? "page" : undefined}
          >
            <Icon aria-hidden />
            <span>{label}</span>
          </NavigationLink>;
        })}
      </nav>
      <div className="arena-experience-account">
        <details className="arena-notifications" ref={notifications}>
          <summary aria-label="Informations du tournoi">
            <Bell aria-hidden />
          </summary>
          <div className="arena-account-popover" onClick={event => {
            if ((event.target as HTMLElement).closest('a') && notifications.current) notifications.current.open = false;
          }}>
            <strong>{nav.slug ? nav.title : 'Les tournois EVC Arena'}</strong>
            {nav.updates?.length ? nav.updates.map(update => <p key={update.href}><Link href={update.href}>{update.title}</Link><small>{update.detail}</small></p>) : <p>Aucune nouvelle manche ni publication annoncée.</p>}
            <Link href={home}>
              {nav.participant ? 'Ouvrir mon espace' : nav.slug ? 'Voir le tournoi' : 'Choisir un tournoi'} <span aria-hidden>→</span>
            </Link>
          </div>
        </details>
        <Link
          className="arena-profile-link"
          href={nav.participant ? `${home}#compte` : nav.slug ? `/arena/connexion?tournoi=${encodeURIComponent(nav.slug)}` : '/arena/connexion'}
          aria-label={nav.participant ? `Mon profil — ${nav.participant.pseudo}` : 'Connexion'}
        >
          <ArenaAvatar
            seed={nav.participant?.avatar_seed ?? "casque"}
            rank={nav.participant?.rank}
            size={50}
          />
          <span>{nav.participant?.pseudo ?? "Connexion"}</span>
          <ChevronDown aria-hidden size={20} />
        </Link>
      </div>
      {nav.staffPreview && (
        <p className="arena-preview-strip">
          Mode prévisualisation — aucun score n’est enregistré
        </p>
      )}
    </header>
  );
}
