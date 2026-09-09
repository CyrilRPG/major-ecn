"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, CalendarDays, ChevronDown, FileText, House } from "lucide-react";
import { ArenaBars as ChartNoAxesColumnIncreasing } from "./experience-icons";
import { ArenaAvatar } from "./arena-avatar";
import type { ShellNav } from "./arena-shell";

export function ExperienceNavigation({ nav }: { nav: ShellNav }) {
  const path = usePathname();
  const base = `/arena/${nav.slug}`;
  const links = [
    {
      label: "Accueil",
      icon: House,
      href: nav.participant ? `${base}/espace` : base,
      active: !path.includes("/regles") && !path.includes("/classement"),
    },
    {
      label: "Règles",
      icon: FileText,
      href: `${base}/regles`,
      active: path.includes("/regles"),
    },
    {
      label: "Calendrier",
      icon: CalendarDays,
      href: `${base}#manches`,
      active: false,
    },
    ...(nav.leaderboardEnabled
      ? [
          {
            label: "Meilleurs scores",
            icon: ChartNoAxesColumnIncreasing,
            href: `${base}/classement`,
            active: path.includes("/classement"),
          },
        ]
      : []),
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
        {links.map(({ label, icon: Icon, href, active }) => (
          <Link
            key={label}
            href={href}
            aria-current={active ? "page" : undefined}
          >
            <Icon aria-hidden />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
      <div className="arena-experience-account">
        <details className="arena-notifications">
          <summary aria-label="Informations du tournoi">
            <Bell aria-hidden />
          </summary>
          <div className="arena-account-popover">
            <strong>Votre tournoi</strong>
            {nav.updates?.length ? nav.updates.map(update => <p key={update.href}><Link href={update.href}>{update.title}</Link><small>{update.detail}</small></p>) : <p>Aucune nouvelle manche ni publication annoncée.</p>}
            <Link href={nav.participant ? `${base}/espace` : base}>
              {nav.participant ? 'Ouvrir mon espace' : 'Voir le tournoi'} <span aria-hidden>→</span>
            </Link>
          </div>
        </details>
        <Link
          className="arena-profile-link"
          href={nav.participant ? `${base}/espace#compte` : "/arena/connexion"}
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
