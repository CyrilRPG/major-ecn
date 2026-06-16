/**
 * <DrawnAvatar /> — avatar « dessin » procédural en SVG (isomorphe : utilisable
 * côté serveur et client). Le rendu est déterministe pour une graine donnée.
 */
import { avatarParams } from '@/lib/avatar';

export function DrawnAvatar({
  seed,
  size = 40,
  className,
  title,
}: {
  seed: string;
  size?: number;
  className?: string;
  title?: string;
}) {
  const p = avatarParams(seed);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label={title ?? 'Avatar'}
    >
      {/* Fond */}
      <rect x="0" y="0" width="100" height="100" rx="50" fill={p.bg} />

      {/* Cou */}
      <rect x="42" y="70" width="16" height="16" rx="7" fill={p.skin} />

      {/* Cheveux arrière (selon style) */}
      {p.hairStyle >= 3 && <ellipse cx="50" cy="52" rx="33" ry="34" fill={p.hair} />}

      {/* Tête */}
      <circle cx="50" cy="50" r="28" fill={p.skin} />

      {/* Oreilles */}
      <circle cx="22" cy="52" r="5" fill={p.skin} />
      <circle cx="78" cy="52" r="5" fill={p.skin} />

      {/* Cheveux avant (variantes) */}
      <Hair style={p.hairStyle} color={p.hair} />

      {/* Joues */}
      {p.freckles && (
        <>
          <circle cx="34" cy="58" r="4.2" fill="#FCA5A5" opacity="0.55" />
          <circle cx="66" cy="58" r="4.2" fill="#FCA5A5" opacity="0.55" />
        </>
      )}

      {/* Yeux */}
      <Eyes style={p.eyes} />

      {/* Lunettes */}
      {p.glasses && (
        <g stroke="#1F2937" strokeWidth="2.2" fill="none">
          <circle cx="40" cy="48" r="7" />
          <circle cx="60" cy="48" r="7" />
          <line x1="47" y1="48" x2="53" y2="48" />
        </g>
      )}

      {/* Bouche */}
      <Mouth style={p.mouth} />
    </svg>
  );
}

function Hair({ style, color }: { style: number; color: string }) {
  switch (style) {
    case 0: // frange courte
      return <path d="M22 44 Q50 16 78 44 Q70 34 50 34 Q30 34 22 44 Z" fill={color} />;
    case 1: // mèche sur le côté
      return <path d="M24 46 Q34 20 62 26 Q80 30 76 46 Q66 30 46 32 Q30 33 24 46 Z" fill={color} />;
    case 2: // bandeau / cheveux plats
      return <path d="M22 42 Q50 22 78 42 L78 36 Q50 18 22 36 Z" fill={color} />;
    case 3: // mi-longs (avec arrière déjà dessiné)
      return <path d="M20 48 Q50 18 80 48 Q72 30 50 30 Q28 30 20 48 Z" fill={color} />;
    default: // touffu / bouclé
      return (
        <g fill={color}>
          <circle cx="32" cy="34" r="9" />
          <circle cx="44" cy="28" r="10" />
          <circle cx="56" cy="28" r="10" />
          <circle cx="68" cy="34" r="9" />
        </g>
      );
  }
}

function Eyes({ style }: { style: number }) {
  switch (style) {
    case 0: // points
      return (
        <g fill="#1F2937">
          <circle cx="40" cy="50" r="3.2" />
          <circle cx="60" cy="50" r="3.2" />
        </g>
      );
    case 1: // grands yeux avec reflet
      return (
        <g>
          <circle cx="40" cy="50" r="4.5" fill="#1F2937" />
          <circle cx="60" cy="50" r="4.5" fill="#1F2937" />
          <circle cx="41.6" cy="48.4" r="1.4" fill="#fff" />
          <circle cx="61.6" cy="48.4" r="1.4" fill="#fff" />
        </g>
      );
    case 2: // yeux fermés / contents
      return (
        <g stroke="#1F2937" strokeWidth="2.4" fill="none" strokeLinecap="round">
          <path d="M35 51 Q40 46 45 51" />
          <path d="M55 51 Q60 46 65 51" />
        </g>
      );
    default: // clin d'œil
      return (
        <g stroke="#1F2937" strokeWidth="2.4" fill="#1F2937">
          <circle cx="40" cy="50" r="3.2" stroke="none" />
          <path d="M55 51 Q60 46 65 51" fill="none" strokeLinecap="round" />
        </g>
      );
  }
}

function Mouth({ style }: { style: number }) {
  switch (style) {
    case 0: // sourire
      return <path d="M40 64 Q50 73 60 64" stroke="#9B3D3D" strokeWidth="2.6" fill="none" strokeLinecap="round" />;
    case 1: // sourire ouvert
      return <path d="M40 63 Q50 75 60 63 Z" fill="#9B3D3D" />;
    case 2: // trait neutre
      return <line x1="43" y1="66" x2="57" y2="66" stroke="#9B3D3D" strokeWidth="2.6" strokeLinecap="round" />;
    case 3: // petit « o »
      return <circle cx="50" cy="66" r="3.4" fill="#9B3D3D" />;
    default: // grand sourire
      return (
        <g>
          <path d="M38 63 Q50 77 62 63 Z" fill="#9B3D3D" />
          <path d="M41 64 Q50 67 59 64" stroke="#fff" strokeWidth="2" fill="none" />
        </g>
      );
  }
}
