import type { CSSProperties } from 'react';
import { decrireAvatar, urlPortrait } from '@/lib/avatars/portraits';

/**
 * Un portrait du catalogue, tel quel : une image WebP détourée en disque.
 * Accepte n'importe quelle graine — un ancien code s'affiche comme le
 * portrait fixe qui lui est dérivé, jamais comme une image cassée.
 *
 * Module SANS directive 'use client' : composants serveur et client
 * l'importent à l'identique.
 */
export function PortraitAvatar({ seed, size = 40, className, style, title, decoratif = false }: {
  seed: string | null | undefined;
  size?: number;
  className?: string;
  style?: CSSProperties;
  title?: string;
  /** Image purement décorative (le nom est déjà écrit à côté). */
  decoratif?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- 320 petites images statiques déjà dimensionnées : l'optimiseur n'apporte rien
    <img
      src={urlPortrait(seed)}
      alt={decoratif ? '' : title ?? decrireAvatar(seed)}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      className={className}
      style={{ display: 'block', borderRadius: '50%', objectFit: 'cover', ...style }}
    />
  );
}
