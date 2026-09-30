'use client';

import Link from 'next/link';
import { etatBandeau, formatJour, libelleJ } from '@/lib/evc-calendrier/dates';
import type { CalendrierEvc } from '@/lib/evc-calendrier/types';
import { useMaintenant } from '@/lib/evc-calendrier/use-maintenant';
import { JAKARTA, MANROPE } from './home-ui';

/* ============================================================
   BANDEAU COMPTE À REBOURS — prochaine épreuve de la session (B2, B5).

   Alimenté par la table `evc_calendrier` (et elle seule), il se met à jour
   seul : dès qu'une date est passée, la spécialité suivante s'affiche et le
   compteur se recalcule ; le jour d'une épreuve, la spécialité du jour reste
   affichée avec « Jour J » ; après la dernière épreuve, tant que la session
   suivante n'est pas publiée : « Session N+1 : calendrier à paraître ».
   Calcul en jours calendaires de Paris (B6), recalculé au moins toutes les
   heures et pile au passage de minuit à Paris (useMaintenant).
   ============================================================ */

export function HomeCountdown({ calendrier, rendu }: { calendrier: CalendrierEvc; rendu: number }) {
  return <BandeauEvc calendrier={calendrier} maintenant={useMaintenant(rendu)} />;
}

/** Rendu du bandeau pour un instant donné (accueil, et aperçu « simuler la date » de l'administration). */
export function BandeauEvc({ calendrier, maintenant }: { calendrier: CalendrierEvc; maintenant: number }) {
  const etat = etatBandeau(calendrier, maintenant);
  const lien = calendrier.reglages.url_deroule;

  let badge: string | null = null;
  let prefixe: string | null = null;
  let titre: string;
  let suite: string | null = null;
  let cta = 'Voir la date de ma spécialité';
  let ctaCourt = 'Ma date →';
  if (etat.etat === 'a_paraitre') {
    titre = `Session ${etat.annee} : calendrier à paraître.`;
    cta = 'Consulter le déroulé de la session en cours →';
    ctaCourt = 'Le déroulé →';
  } else {
    const noms = etat.epreuves.map((e) => e.nom).join(', ');
    const lieu = etat.epreuves[0]?.lieu ?? 'Espace Jean Monnet, Rungis';
    badge = etat.etat === 'jour_j' ? 'Jour J' : libelleJ(etat.jours);
    prefixe = `${etat.etat === 'jour_j' ? 'Épreuve EVC aujourd’hui' : 'Prochaine épreuve EVC'} : `;
    titre = `${noms}, ${formatJour(etat.date)}`;
    suite = `${lieu}. Chaque spécialité a sa propre date.`;
  }

  // Sur téléphone, le bandeau tient sur deux lignes au plus (compteur à gauche, spécialité et
  // date, lien court) : la phrase complète repoussait le hero de trois lignes vers le bas.
  return (
    <aside
      aria-label={`Calendrier des épreuves EVC ${calendrier.reglages.session_en_cours}`}
      className="relative z-10"
      style={{ fontFamily: JAKARTA, background: 'linear-gradient(100deg, #6B0F1E 0%, #A5122A 45%, #C0112E 100%)' }}
    >
      <div className="mx-auto flex max-w-[88rem] flex-row items-center gap-3 px-4 py-2.5 text-left sm:flex-col sm:gap-y-3 sm:px-6 sm:py-3.5 sm:text-center lg:flex-row lg:justify-center lg:gap-x-6 lg:px-8 lg:text-left">
        {badge && (
          <p className="shrink-0 whitespace-nowrap rounded-lg bg-white/15 px-2.5 py-1 text-[13px] font-black tabular-nums text-white sm:px-3.5 sm:py-1.5 sm:text-[15px]">
            {badge}
          </p>
        )}
        <p className="min-w-0 flex-1 text-[12.5px] leading-snug text-white/90 sm:flex-none sm:text-[13.5px]" style={{ fontFamily: MANROPE }}>
          <span className="font-black text-white" style={{ fontFamily: JAKARTA }}>
            {prefixe && <span className="hidden sm:inline">{prefixe}</span>}
            {titre}
          </span>
          {suite && <span className="hidden sm:inline">{' — '}{suite}</span>}
          <Link href={lien} className="ml-1.5 whitespace-nowrap font-black text-white underline underline-offset-2 sm:hidden">
            {ctaCourt}
          </Link>
        </p>
        <Link
          href={lien}
          className="hidden shrink-0 rounded-lg bg-white px-4 py-2 text-[12.5px] font-black tracking-tight transition-transform hover:scale-[1.03] sm:inline-block"
          style={{ color: '#8B0E22' }}
        >
          {cta}
        </Link>
      </div>
    </aside>
  );
}
