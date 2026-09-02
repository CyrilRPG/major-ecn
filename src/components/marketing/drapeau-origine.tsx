import { drapeauSrc, origineDe } from '@/lib/data/temoignage-origines';

/**
 * Petit drapeau du pays d'origine d'un lauréat, à poser à côté de son nom dans
 * un témoignage. N'affiche rien si l'origine n'est pas connue.
 *
 * Le composant prend le NOM AFFICHÉ, pas un code pays : les témoignages sont
 * rendus par une douzaine de composants et la correspondance est centralisée
 * dans `temoignage-origines.ts`.
 *
 * `taille` est la hauteur en pixels ; la largeur suit les proportions 4:3 des
 * SVG. Le drapeau est aligné sur la ligne de base du texte voisin. Il reste
 * délibérément discret : c'est un repère à côté du nom, jamais un visuel de la
 * carte. L'avatar d'un témoignage demeure la photo, ou les initiales à défaut.
 */
export function DrapeauOrigine({
  nom,
  taille = 9,
  className = '',
}: {
  nom: string | null | undefined;
  taille?: number;
  className?: string;
}) {
  const origine = origineDe(nom);
  if (!origine) return null;
  return (
    <img
      src={drapeauSrc(origine.code)}
      alt={origine.pays}
      title={origine.pays}
      width={Math.round((taille * 4) / 3)}
      height={taille}
      loading="lazy"
      decoding="async"
      className={`ml-1 inline-block shrink-0 rounded-[2px] align-[-0.12em] ring-1 ring-black/10 ${className}`}
      style={{ width: Math.round((taille * 4) / 3), height: taille }}
    />
  );
}
