/**
 * EVC Arena — filigrane dynamique de la « Correction détaillée ».
 *
 * Texte répété en diagonale sur la correction affichée :
 * « Prénom Nom (ou pseudo) · identifiant court du compte · EVC Arena – Major ECN ».
 * Module pur (client et serveur, sans dépendance) : le motif est un SVG
 * encodé en data URI, posé en `background-image` répété par la visionneuse.
 */

export const WATERMARK_BRAND = 'EVC Arena – Major ECN';

export type WatermarkIdentity = {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  pseudo: string;
};

/** Identifiant court (8 premiers caractères de l'UUID, en majuscules) — suffisant pour tracer une fuite. */
export function shortParticipantId(id: string): string {
  return id.replace(/-/g, '').slice(0, 8).toUpperCase();
}

/** Nom affiché : « Prénom Nom » si connu, sinon le pseudonyme (comptes anonymisés). */
export function watermarkDisplayName(p: Pick<WatermarkIdentity, 'first_name' | 'last_name' | 'pseudo'>): string {
  const name = [p.first_name, p.last_name].map((s) => (s ?? '').trim()).filter(Boolean).join(' ');
  return name || p.pseudo.trim();
}

export function watermarkLabel(p: WatermarkIdentity): string {
  return `${watermarkDisplayName(p)} · ${shortParticipantId(p.id)} · ${WATERMARK_BRAND}`;
}

/** Filigrane du personnel en prévisualisation (aucun participant). */
export function staffWatermarkLabel(staffLabel: string): string {
  return `${staffLabel.trim() || 'Personnel'} · Prévisualisation · ${WATERMARK_BRAND}`;
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

export type WatermarkTileOptions = {
  /** Largeur de la tuile répétée (px). */
  width?: number;
  /** Hauteur de la tuile répétée (px). */
  height?: number;
  /** Angle de rotation (degrés, négatif = montant vers la droite). */
  angle?: number;
  /** Couleur du texte (avec alpha : le filigrane doit rester discret). */
  color?: string;
  fontSize?: number;
};

const TILE_DEFAULTS: Required<WatermarkTileOptions> = {
  width: 440,
  height: 300,
  angle: -28,
  color: 'rgba(255,255,255,0.075)',
  fontSize: 15,
};

/** Tuile SVG : le libellé, deux fois en quinconce, tourné en diagonale. */
export function watermarkTileSvg(label: string, opts: WatermarkTileOptions = {}): string {
  const o = { ...TILE_DEFAULTS, ...opts };
  const text = escapeXml(label);
  const font = "font-family='Inter, Roboto, Helvetica, Arial, sans-serif'";
  const common = `${font} font-size='${o.fontSize}' font-weight='600' fill='${escapeXml(o.color)}' letter-spacing='0.06em' text-anchor='middle'`;
  const cx = o.width / 2;
  const y1 = o.height * 0.3;
  const y2 = o.height * 0.8;
  return `<svg xmlns='http://www.w3.org/2000/svg' width='${o.width}' height='${o.height}' viewBox='0 0 ${o.width} ${o.height}'>` +
    `<text x='${cx}' y='${y1}' ${common} transform='rotate(${o.angle} ${cx} ${y1})'>${text}</text>` +
    `<text x='${cx}' y='${y2}' ${common} transform='rotate(${o.angle} ${cx} ${y2})'>${text}</text>` +
    `</svg>`;
}

/** `background-image` prêt à l'emploi pour la surcouche de la visionneuse. */
export function watermarkDataUri(label: string, opts?: WatermarkTileOptions): string {
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(watermarkTileSvg(label, opts))}")`;
}
