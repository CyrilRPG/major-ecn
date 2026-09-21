import type { CSSProperties } from 'react';
import { CADRAGES, contenuAvatar, type Cadrage } from '@/lib/avatars/dessin';
import { decrireAvatar } from '@/lib/avatars/traits';

/**
 * Médaillon composé : le portrait peint de la planche Major ECN, entouré des
 * ornements choisis dans l'atelier.
 *
 * Le dessin vient de `lib/avatars/dessin` sous forme de chaîne, pour que la
 * page React et la route d'image `/api/avatar` produisent exactement le même
 * médaillon. Le contenu est entièrement dérivé d'indices bornés : aucune
 * donnée saisie n'y entre, l'injection est donc sans objet.
 *
 * Module SANS directive 'use client' : composants serveur et client
 * l'importent à l'identique.
 */
export function ComposedAvatarSvg({ seed, size = 40, className, style, title, cadrage = 'buste' }: {
  seed: string;
  size?: number;
  className?: string;
  style?: CSSProperties;
  title?: string;
  cadrage?: Cadrage;
}) {
  return (
    <svg
      viewBox={CADRAGES[cadrage]}
      width={size}
      height={size}
      className={className}
      style={style}
      role="img"
      aria-label={title ?? decrireAvatar(seed)}
      dangerouslySetInnerHTML={{ __html: contenuAvatar(seed) }}
    />
  );
}
