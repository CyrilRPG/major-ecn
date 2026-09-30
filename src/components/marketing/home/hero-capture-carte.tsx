'use client';

import type { CSSProperties, ReactNode } from 'react';
import { CalendarDays } from 'lucide-react';
import {
  epreuveCapture, etatCompteur, etatInscriptionEvc, formatInstantParis, libelleJ,
} from '@/lib/evc-calendrier/dates';
import type { CalendrierEvc } from '@/lib/evc-calendrier/types';
import { JAKARTA, MANROPE } from './home-ui';

/* ============================================================
   CARTE VIVANTE DE LA CAPTURE DU HERO (brief B3).

   La capture `hero-plateforme-docteur.png` est la vraie capture du tableau de
   bord élève, dont on a effacé (scripts/nettoyer-hero-plateforme.py) tout ce
   qui dépend du calendrier : le titre de la carte de droite, l'encart « Il
   vous reste J-N », la période d'inscription, les postes, et la seconde carte
   « EVC (PAE) 2026 ». Ce bloc les redessine À L'IDENTIQUE, par-dessus, à
   partir de la table `evc_calendrier` — le J-N n'est plus jamais figé.

   Positionnement : tout est exprimé en pixels NATIFS de la capture
   (1 504 × 914) convertis par `--u` = 100cqw / 1 504 : l'enveloppe de l'image
   est un conteneur de requête (container-type: inline-size), la typographie
   et les marges suivent donc exactement la taille affichée de l'image.
   ============================================================ */

const LARGEUR = 1504;
const HAUTEUR = 914;
/** Carte de droite dans la capture (pixels natifs). */
const CARTE = { x: 968, y: 89, l: 218, h: 308 };

const ROUGE = '#E8141C';
const ENCRE = '#0F1733';
const GRIS = '#646F8E';
const BORD = '#E6E9F0';

const u = (n: number) => `calc(var(--u) * ${n})`;
const pos = (x: number, y: number, extra: CSSProperties = {}): CSSProperties => ({ position: 'absolute', left: u(x), top: u(y), ...extra });

function Etiquette({ children, y }: { children: ReactNode; y: number }) {
  return (
    <p style={pos(15, y, { fontSize: u(7.6), letterSpacing: '0.08em', fontWeight: 600, color: GRIS, fontFamily: MANROPE, lineHeight: 1 })}>
      {children}
    </p>
  );
}

function CasePostes({ x, libelle, valeur }: { x: number; libelle: string; valeur: number | null }) {
  return (
    <div
      style={pos(x, 240, {
        width: u(89), height: u(51), borderRadius: u(7), border: `max(1px, ${u(1)}) solid ${BORD}`, background: '#FFFFFF',
      })}
    >
      <p style={pos(9, 8, { fontSize: u(8.4), color: GRIS, fontFamily: MANROPE, lineHeight: 1.2, whiteSpace: 'nowrap' })}>{libelle}</p>
      <p style={pos(9, 22, { fontSize: u(17), color: ROUGE, fontWeight: 800, fontFamily: JAKARTA, lineHeight: 1.15, letterSpacing: '-0.01em' })}>
        {valeur ?? '—'}
      </p>
    </div>
  );
}

function B({ children }: { children: ReactNode }) {
  return <strong style={{ color: ENCRE, fontWeight: 700 }}>{children}</strong>;
}

export function HeroCaptureCarte({ calendrier, maintenant }: { calendrier: CalendrierEvc; maintenant: number }) {
  const e = epreuveCapture(calendrier, maintenant);
  if (!e) return null;
  const compteur = etatCompteur(e, maintenant);
  const insc = etatInscriptionEvc(e, calendrier.reglages, maintenant);

  let inscription: ReactNode;
  if (insc.etat === 'ouverte' && insc.debut && insc.fin) {
    const d = formatInstantParis(insc.debut);
    const f = formatInstantParis(insc.fin);
    inscription = <>Du <B>{d.jour} à {d.heure}</B> (heure de Paris) au <B>{f.jour} inclus, à {f.heure}.</B></>;
  } else if (insc.etat === 'ouverte' && insc.fin) {
    const f = formatInstantParis(insc.fin);
    inscription = <>Ouvertes jusqu’au <B>{f.jour} inclus, à {f.heure}</B> (heure de Paris).</>;
  } else if (insc.etat === 'a_venir') {
    const d = formatInstantParis(insc.debut);
    inscription = <>{insc.session !== e.session && <>Session {insc.session}&nbsp;: </>}Ouverture le <B>{d.jour} à {d.heure}</B> (heure de Paris).</>;
  } else if (insc.etat === 'close') {
    inscription = <B>Inscriptions closes pour la session {insc.session}.</B>;
  } else {
    inscription = <>Dates à paraître.</>;
  }

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute select-none"
      style={{
        // 1 pixel natif de la capture, à la taille affichée.
        ['--u' as string]: `calc(100cqw / ${LARGEUR})`,
        left: `${(CARTE.x / LARGEUR) * 100}%`,
        top: `${(CARTE.y / HAUTEUR) * 100}%`,
        width: u(CARTE.l),
        height: u(CARTE.h),
        color: GRIS,
        // L'enveloppe est un <button> : son centrage par défaut ne doit pas descendre ici.
        textAlign: 'left',
      }}
    >
      {/* En-tête, à droite de l'icône conservée dans la capture. */}
      <div style={pos(57, 9, { width: u(152) })}>
        {/* Interligne 1,35 : un interligne serré rognerait les accents (overflow du tronquage). */}
        <p className="truncate" style={{ fontSize: u(10.2), fontWeight: 700, color: ENCRE, fontFamily: JAKARTA, lineHeight: 1.35 }}>
          {e.nom}
        </p>
        <p style={{ marginTop: u(4.5), fontSize: u(10.2), fontWeight: 700, color: ROUGE, fontFamily: JAKARTA, lineHeight: 1.35 }}>
          EVC – Session {e.session}
        </p>
      </div>

      {/* Encart rose du compte à rebours — masqué après l'épreuve (B5). */}
      <div
        style={pos(15, 71, {
          width: u(189), height: u(67), borderRadius: u(8),
          background: compteur.etat === 'masque' ? '#F4F5F9' : 'linear-gradient(90deg, #FFF2F3 0%, #FDEDEF 100%)',
        })}
      >
        <CalendarDays
          style={pos(147, 14, { width: u(40), height: u(40), color: compteur.etat === 'masque' ? '#DADDE6' : '#F8C4CA' })}
          strokeWidth={1.6}
        />
        {compteur.etat === 'masque' ? (
          <>
            <p style={pos(9, 12, { fontSize: u(8.4), color: GRIS, fontFamily: MANROPE, lineHeight: 1 })}>Session {e.session + 1}</p>
            <p style={pos(9, 26, { fontSize: u(12.5), fontWeight: 800, color: ENCRE, fontFamily: JAKARTA, lineHeight: 1.1 })}>Calendrier à paraître</p>
            <p style={pos(9, 47, { fontSize: u(8.4), color: GRIS, fontFamily: MANROPE, lineHeight: 1 })}>épreuve {e.session} passée</p>
          </>
        ) : (
          <>
            <p style={pos(9, 12, { fontSize: u(8.4), color: GRIS, fontFamily: MANROPE, lineHeight: 1 })}>
              {compteur.etat === 'jour_j' ? 'C’est aujourd’hui' : 'Il vous reste'}
            </p>
            <p style={pos(9, 24, { fontSize: u(17.5), fontWeight: 800, color: ROUGE, fontFamily: JAKARTA, lineHeight: 1.1, letterSpacing: '-0.01em' })}>
              {compteur.etat === 'jour_j' ? 'Jour J' : libelleJ(compteur.jours)}
            </p>
            <p style={pos(9, 48, { fontSize: u(8.4), color: GRIS, fontFamily: MANROPE, lineHeight: 1 })}>
              {compteur.etat === 'jour_j' ? 'épreuve écrite' : 'avant l’épreuve écrite'}
            </p>
          </>
        )}
      </div>

      <Etiquette y={155}>PÉRIODE D’INSCRIPTION</Etiquette>
      <p
        style={pos(15, 165, {
          width: u(192), fontSize: u(9.1), lineHeight: u(19.5), color: GRIS, fontFamily: MANROPE,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        })}
      >
        {inscription}
      </p>

      <Etiquette y={224}>NOMBRE DE POSTES</Etiquette>
      <CasePostes x={15} libelle="Voie externe" valeur={e.postes_externe} />
      <CasePostes x={113} libelle="Voie interne" valeur={e.postes_interne} />
    </div>
  );
}

