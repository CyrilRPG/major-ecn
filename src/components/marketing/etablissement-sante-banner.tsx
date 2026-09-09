import Link from 'next/link';
import { Building2, FileText, Settings, Users } from 'lucide-react';

/**
 * Bandeau « Prise en charge établissement de santé ».
 *
 * EMPLACEMENT. Sous CHAQUE bloc tarifaire du site, une seule fois par bloc,
 * à l'intérieur de la section formules (juste avant sa fermeture) ou, sur
 * /tarifs, juste après le comparatif des trois formules. Jamais dans une
 * carte de formule, jamais dans les tableaux de prix des FAQ.
 *
 * TEXTE. Imposé par le client, mot pour mot : les constantes ci-dessous sont
 * la seule source ; ne rien reformuler dans le JSX.
 *
 * DESIGN. Carte blanche à bords arrondis et fine bordure grise ; à gauche
 * une pastille circulaire rose très pâle avec un bâtiment hospitalier au
 * trait bordeaux ; au centre le titre gras bordeaux, le sous-titre gris
 * foncé et la ligne d'avantages (petites icônes bordeaux séparées par de
 * fins traits verticaux) ; à droite le bouton plein bordeaux. La maquette
 * porte des pictogrammes Lucide : décision prise de la respecter partout,
 * y compris sur les pages qui n'en ont aucun ailleurs.
 *
 * RESPONSIVE. Desktop : une ligne horizontale. Sous 768 px : composition
 * verticale titre → texte → avantages en colonne → bouton pleine largeur,
 * sans réduire excessivement les polices (titre ≥ 22 px, texte ≥ 16 px).
 *
 * LARGEUR. `largeur="specialite"` reprend le conteneur des pages de
 * spécialité (`max-w-[88rem]`) ; `largeur="site"` (défaut) celui du reste
 * du site (`max-w-7xl`). Le bandeau porte son propre conteneur puisqu'il
 * est inséré après la fermeture du conteneur de la section.
 */

export const ETABLISSEMENT_TITRE = 'Vous exercez en établissement de santé ?';
export const ETABLISSEMENT_SOUS_TITRE = 'Cette formation peut être prise en charge par votre hôpital.';
export const ETABLISSEMENT_AVANTAGES = [
  { Icon: FileText, texte: 'Prise en charge possible' },
  { Icon: Users, texte: 'Accompagnement dans vos démarches' },
  { Icon: Settings, texte: 'Devis personnalisé' },
] as const;
export const ETABLISSEMENT_CTA = 'Demander un devis →';
export const ETABLISSEMENT_LIEN = '/contact?motif=etablissement';

/** Bordeaux du thème (`--color-primary`), sa déclinaison foncée et le rose pâle de la pastille. */
export const ETABLISSEMENT_COULEURS = {
  bordeaux: '#6B1A2A',
  bordeauxFonce: '#4D121E',
  rosePale: '#F9F0F2',
  texte: '#3F4757',
  bordure: '#E4E7EF',
  filet: '#D9DDE6',
} as const;

const FONT = "'Plus Jakarta Sans', sans-serif";
const FONT_BODY = "'Manrope', sans-serif";

const CONTENEURS = {
  specialite: 'mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8',
  site: 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8',
} as const;

export type EtablissementSanteBannerProps = {
  /** Conteneur horizontal : `specialite` (88rem) pour les pages de spécialité, `site` (7xl) ailleurs. */
  largeur?: keyof typeof CONTENEURS;
};

export function EtablissementSanteBanner({ largeur = 'site' }: EtablissementSanteBannerProps) {
  const c = ETABLISSEMENT_COULEURS;
  return (
    <div className={`${CONTENEURS[largeur]} mt-10 sm:mt-12`} style={{ fontFamily: FONT }}>
      <aside
        aria-labelledby="etablissement-sante-titre"
        className="flex flex-col gap-6 rounded-[1.25rem] bg-white px-6 py-7 sm:px-8 md:flex-row md:items-center md:gap-7 lg:px-10 lg:py-8"
        style={{ border: `1px solid ${c.bordure}` }}
      >
        <span
          aria-hidden
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full lg:h-[4.5rem] lg:w-[4.5rem]"
          style={{ background: c.rosePale, color: c.bordeaux }}
        >
          <Building2 className="h-8 w-8 lg:h-9 lg:w-9" strokeWidth={1.75} />
        </span>

        <div className="min-w-0 flex-1">
          <h3
            id="etablissement-sante-titre"
            className="text-[22px] font-black leading-tight tracking-tight sm:text-[26px] lg:text-[28px]"
            style={{ color: c.bordeaux, letterSpacing: '-0.02em' }}
          >
            {ETABLISSEMENT_TITRE}
          </h3>
          <p className="mt-2 text-[16px] leading-snug sm:text-[18px] lg:text-[20px]" style={{ color: c.texte, fontFamily: FONT_BODY }}>
            {ETABLISSEMENT_SOUS_TITRE}
          </p>
          <ul className="mt-4 flex flex-col gap-2.5 md:flex-row md:flex-wrap md:items-center md:gap-y-2">
            {ETABLISSEMENT_AVANTAGES.map((a, i) => (
              <li
                key={a.texte}
                className={`flex items-center gap-2.5 md:pr-5 ${i > 0 ? 'md:border-l md:pl-5' : ''}`}
                style={{ borderColor: c.filet }}
              >
                <a.Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2} style={{ color: c.bordeaux }} aria-hidden />
                <span className="text-[16px] font-bold leading-snug" style={{ color: c.texte, fontFamily: FONT_BODY }}>
                  {a.texte}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <Link
          href={ETABLISSEMENT_LIEN}
          className="inline-flex w-full shrink-0 items-center justify-center rounded-[14px] bg-[#6B1A2A] px-7 py-4 text-[16px] font-black tracking-tight text-white transition-colors duration-200 hover:bg-[#4D121E] md:w-auto"
        >
          {ETABLISSEMENT_CTA}
        </Link>
      </aside>
    </div>
  );
}
