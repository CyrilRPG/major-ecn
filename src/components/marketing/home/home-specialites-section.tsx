'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CALENDRIER_ARTICLE, VOIES_ARTICLE } from './evc-calendrier-2026';
import { lienSpecialite } from '@/lib/data/pages-specialites';
import { bornesSession, epreuvesSession, formatJour, nombreFr, totauxPostes } from '@/lib/evc-calendrier/dates';
import type { CalendrierEvc, EpreuveEvc } from '@/lib/evc-calendrier/types';
import {
  BORDER, INK_MUTED, INK_SOFT, JAKARTA, MANROPE, NAVY, RED, RED_DEEP,
  RED_GRADIENT,
} from './home-ui';

/* ============================================================
   BLOC POSTES — un chiffre focal, puis la donnée dense.

   Données : table `evc_calendrier` (session en cours) et totaux officiels
   des réglages — plus aucun chiffre écrit dans ce composant.

   Les DEUX listes sont rendues en permanence, y compris côté serveur :
   la bascule ne fait que masquer l'inactive en CSS. Un système d'onglets
   qui construirait la liste au clic ferait disparaître la moitié du
   contenu pour les moteurs de recherche.
   ============================================================ */

// Chaque ligne mène à la spécialité elle-même : l'URL saisie dans le
// calendrier, sinon sa page dédiée ou sa carte dans l'annuaire.
const lien = (e: EpreuveEvc) => e.url_page ?? lienSpecialite(e.slug);

/** Ligne dense : nom, barre proportionnelle, chiffre. La barre rend
    l'écart entre spécialités lisible d'un coup d'œil. */
function Ligne({
  nom, valeur, max, href, couleur, date,
}: { nom: string; valeur: number; max: number; href: string; couleur: string; date?: string }) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 border-b px-2 py-3.5 transition-colors last:border-b-0 hover:bg-white sm:gap-5 sm:px-4"
      style={{ borderColor: BORDER }}
    >
      <span className="min-w-0 flex-1 truncate text-[14px] font-bold" style={{ color: NAVY, fontFamily: MANROPE }}>
        {nom}
      </span>
      {date && (
        <span className="hidden shrink-0 text-[12px] lg:block" style={{ color: INK_MUTED, fontFamily: MANROPE }}>
          {date}
        </span>
      )}
      <span
        aria-hidden
        className="hidden h-2 w-28 shrink-0 overflow-hidden rounded-full sm:block lg:w-44"
        style={{ background: '#EDEFF4' }}
      >
        <span className="block h-full rounded-full" style={{ width: `${Math.max(4, (valeur / max) * 100)}%`, background: couleur }} />
      </span>
      <span className="w-12 shrink-0 text-right text-[17px] font-black tabular-nums" style={{ color: NAVY }}>
        {valeur}
      </span>
    </Link>
  );
}

export function HomeSpecialitesSection({ calendrier }: { calendrier: CalendrierEvc }) {
  const [voie, setVoie] = useState<'externe' | 'interne'>('externe');
  const session = calendrier.reglages.session_en_cours;
  const lignes = epreuvesSession(calendrier);
  const totaux = totauxPostes(calendrier);
  const bornes = bornesSession(lignes);
  const source = calendrier.reglages.source_postes;

  // Voie externe : les trois spécialités les plus dotées en vedette, les autres en liste.
  const externe = lignes.filter((e) => (e.postes_externe ?? 0) > 0).sort((a, b) => b.postes_externe! - a.postes_externe!);
  const externeVedettes = externe.slice(0, 3);
  const externeLignes = externe.slice(3);
  const aucuneChirurgie = !externe.some((e) => /chirurg/i.test(e.nom));
  // Voie interne : les dix spécialités les plus dotées, par volume décroissant.
  const interneLignes = lignes.filter((e) => (e.postes_interne ?? 0) > 0).sort((a, b) => b.postes_interne! - a.postes_interne!).slice(0, 10);
  const maxExterne = Math.max(1, ...externeLignes.map((e) => e.postes_externe!));
  const maxInterne = Math.max(1, ...interneLignes.map((e) => e.postes_interne!));

  return (
    <section id="specialites" className="py-16 sm:py-20 lg:py-24" style={{ fontFamily: JAKARTA, background: 'linear-gradient(180deg, #FFFFFF 0%, #FBFBFD 100%)' }}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Point focal : un seul chiffre, très gros. */}
        <div className="text-center">
          <p className="text-[11.5px] font-black uppercase tracking-[0.16em]" style={{ color: RED }}>
            Postes ouverts — session {session}
          </p>
          <p className="mt-4 text-[3.4rem] font-black leading-none tabular-nums sm:text-[5rem]" style={{ color: NAVY, letterSpacing: '-0.04em' }}>
            {nombreFr(totaux.externe + totaux.interne)}
          </p>
          <p className="mt-3 text-[16px] font-black tracking-tight sm:text-[18px]" style={{ color: RED_DEEP }}>
            postes ouverts aux EVC {session}
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-[14px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: MANROPE }}>
            <span className="font-bold" style={{ color: NAVY }}>{nombreFr(totaux.externe)} en voie externe</span>, répartis entre{' '}
            {totaux.specialitesExterne} spécialités{aucuneChirurgie ? ' médicales — aucune spécialité chirurgicale' : ''}.{' '}
            <span className="font-bold" style={{ color: NAVY }}>{nombreFr(totaux.interne)} en voie interne</span>, ouverte à plus de
            quarante spécialités.{source ? ` ${source}.` : ''}
          </p>
        </div>

        {/* Bascule en CSS : les deux listes restent dans le HTML servi. */}
        <div className="mt-10">
          <div role="tablist" aria-label="Voie de préparation" className="mx-auto flex max-w-md gap-2 rounded-full p-1.5" style={{ background: '#EDEFF4' }}>
            {([['externe', 'Voie externe', RED], ['interne', 'Voie interne', NAVY]] as const).map(([cle, libelle, couleur]) => (
              <button
                key={cle}
                type="button"
                role="tab"
                aria-selected={voie === cle}
                aria-controls={`postes-${cle}`}
                onClick={() => setVoie(cle)}
                className={'flex-1 rounded-full px-4 py-2.5 text-center text-[13.5px] font-black tracking-tight transition-colors ' + (voie === cle ? 'bg-white shadow-sm' : '')}
                style={{ color: voie === cle ? couleur : INK_MUTED }}
              >
                {libelle}
              </button>
            ))}
          </div>

          {/* ---------- Voie externe ---------- */}
          <div id="postes-externe" role="tabpanel" className={voie === 'externe' ? 'block' : 'hidden'}>
            <p className="mt-6 text-center text-[13px]" style={{ color: INK_MUTED, fontFamily: MANROPE }}>
              {nombreFr(totaux.externe)} postes · {totaux.specialitesExterne} spécialités
              {bornes && <> · épreuves du {formatJour(bornes.premiere, { semaine: false })} au {formatJour(bornes.derniere, { semaine: false })}</>}
            </p>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {externeVedettes.map((s) => (
                <Link
                  key={s.slug}
                  href={lien(s)}
                  className="flex flex-col rounded-2xl bg-white px-6 py-6 transition-transform duration-300 hover:-translate-y-1"
                  style={{ border: `1px solid ${BORDER}`, boxShadow: '0 24px 60px -58px rgba(15,27,61,0.55)' }}
                >
                  {s.note && (
                    <p className="text-[10.5px] font-black uppercase tracking-[0.1em]" style={{ color: RED }}>{s.note}</p>
                  )}
                  <p className={'text-[15px] font-black leading-tight tracking-tight ' + (s.note ? 'mt-2' : '')} style={{ color: NAVY }}>
                    {s.nom}
                  </p>
                  <p className="mt-4 text-[2.4rem] font-black leading-none tabular-nums" style={{ color: RED_DEEP, letterSpacing: '-0.03em' }}>
                    {s.postes_externe}
                  </p>
                  <p className="text-[12.5px]" style={{ color: INK_SOFT, fontFamily: MANROPE }}>
                    postes en voie externe{s.postes_interne != null ? ` · ${s.postes_interne} en interne` : ''}
                  </p>
                  <p className="mt-4 border-t pt-3 text-[12px]" style={{ borderColor: BORDER, color: INK_MUTED, fontFamily: MANROPE }}>
                    {s.date_epreuve
                      ? <>Épreuve le <span className="font-black" style={{ color: NAVY }}>{formatJour(s.date_epreuve)}</span></>
                      : 'Date d’épreuve à paraître'}
                  </p>
                </Link>
              ))}
            </div>

            <div className="mt-4 rounded-2xl bg-white px-2 py-1 sm:px-3" style={{ border: `1px solid ${BORDER}` }}>
              {externeLignes.map((s) => (
                <Ligne
                  key={s.slug}
                  nom={s.nom}
                  valeur={s.postes_externe!}
                  max={maxExterne}
                  href={lien(s)}
                  couleur={RED}
                  date={s.date_epreuve ? formatJour(s.date_epreuve) : undefined}
                />
              ))}
            </div>
          </div>

          {/* ---------- Voie interne ---------- */}
          <div id="postes-interne" role="tabpanel" className={voie === 'interne' ? 'block' : 'hidden'}>
            <p className="mt-6 text-center text-[13px]" style={{ color: INK_MUTED, fontFamily: MANROPE }}>
              {nombreFr(totaux.interne)} postes · plus de 40 spécialités
            </p>

            <div className="mt-6 rounded-2xl bg-white px-2 py-1 sm:px-3" style={{ border: `1px solid ${BORDER}` }}>
              {interneLignes.map((s) => (
                <Ligne key={s.slug} nom={s.nom} valeur={s.postes_interne!} max={maxInterne} href={lien(s)} couleur={NAVY} />
              ))}
            </div>

            <p className="mt-4 text-center text-[13px] leading-relaxed" style={{ color: INK_MUTED, fontFamily: MANROPE }}>
              Les dix spécialités les plus dotées en voie interne. La voie interne en compte plus de quarante.{' '}
              <Link href="/specialites" className="font-bold underline underline-offset-2" style={{ color: NAVY }}>
                Voir toutes les spécialités →
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-5 rounded-3xl px-6 py-7 sm:px-9 lg:flex-row lg:items-center lg:justify-between" style={{ background: '#FDF1F3' }}>
          <p className="text-[14px] leading-relaxed" style={{ color: NAVY, fontFamily: MANROPE }}>
            <span className="block text-[16px] font-black tracking-tight" style={{ fontFamily: JAKARTA }}>
              Le nombre de postes ne fait pas tout.
            </span>
            Le ratio candidats/postes et la nouveauté d’une spécialité comptent autant — et votre
            date d’épreuve détermine le temps qu’il vous reste.
          </p>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <Link
              href={`/blog/${VOIES_ARTICLE}`}
              className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3.5 text-[13.5px] font-black tracking-tight transition-colors hover:bg-white/70"
              style={{ border: `1.5px solid ${RED}`, color: RED }}
            >
              Comparer les deux voies
            </Link>
            <Link
              href={`/blog/${CALENDRIER_ARTICLE}`}
              className="inline-flex items-center justify-center rounded-xl px-6 py-3.5 text-[13.5px] font-black tracking-tight text-white transition-transform hover:scale-[1.02]"
              style={{ background: RED_GRADIENT }}
            >
              Calendrier par spécialité
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
