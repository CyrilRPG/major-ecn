export type ImageLayout = 'full' | 'left' | 'right';

/** Largeur d'une image, en % de la colonne d'article (bureau uniquement : sur
 *  mobile une image reste toujours pleine largeur, sous peine d'être illisible).
 *  Absente = largeur par défaut de la disposition (100 % en « full »,
 *  46 % en « left » / « right »). */
export const IMAGE_WIDTH_MIN = 20;
export const IMAGE_WIDTH_MAX = 100;

/** Largeur par défaut d'une image selon sa disposition, quand aucune n'est fixée. */
export function defaultImageWidth(layout: ImageLayout | undefined): number {
  return layout === 'left' || layout === 'right' ? 46 : 100;
}

/** Ramène une largeur quelconque dans les bornes autorisées (entier). */
export function clampImageWidth(value: number): number {
  return Math.min(IMAGE_WIDTH_MAX, Math.max(IMAGE_WIDTH_MIN, Math.round(value)));
}

export type Block =
  | { t: 'hero'; src: string; alt: string }
  | { t: 'h2'; text: string }
  | { t: 'h3'; text: string }
  | { t: 'p'; html: string }
  | { t: 'ul'; items: string[] }
  | { t: 'ol'; items: string[] }
  | { t: 'img'; src: string; alt: string; caption?: string; layout?: ImageLayout; width?: number }
  | { t: 'gallery'; images: { src: string; alt: string; caption?: string }[] }
  | { t: 'table'; headers: string[]; rows: string[][] }
  | { t: 'note'; text: string }
  | { t: 'quote'; author: string; role?: string; text: string }
  | { t: 'callout'; tone: 'warning' | 'tip' | 'key' | 'source'; html: string }
  | { t: 'related'; items: { label: string; href: string }[] };
