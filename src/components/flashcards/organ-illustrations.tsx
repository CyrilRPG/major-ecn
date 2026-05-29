// Illustrations anatomiques détaillées — inspirées des maquettes designer.
// Chaque composant est un SVG dessiné main : multi-paths, détails anatomiques
// (bronches, valvules, néphrons, lobes, gyri, etc.) pour rendre les
// flashcards beaucoup plus illustratives que des icônes Lucide plates.
//
// Toutes les illustrations partagent la même API (LucideProps) :
// `className`, `strokeWidth`, `width`/`height` via className.

import type { LucideProps } from 'lucide-react';

const base = (p: LucideProps, viewBox = '0 0 64 64') => ({
  viewBox,
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  strokeWidth: p.strokeWidth ?? 1.5,
  className: p.className,
});

/* ────────────────────────────────────────────────────────────────────────── */
/*  PNEUMOLOGIE — Poumons avec arbre bronchique                              */
/* ────────────────────────────────────────────────────────────────────────── */
export function LungsArt(p: LucideProps) {
  return (
    <svg {...base(p)}>
      {/* trachée + carène */}
      <path d="M32 6v18" />
      <path d="M32 18c-2 2-3 4-3 7" />
      <path d="M32 18c2 2 3 4 3 7" />
      {/* poumon gauche */}
      <path d="M28 24c-6 0-10 4-12 10-2 8-2 16 1 22 1.5 3 4 4 7 3 3-1 5-3 6-6 1-3 1-7 1-10V24Z" />
      {/* poumon droit */}
      <path d="M36 24c6 0 10 4 12 10 2 8 2 16-1 22-1.5 3-4 4-7 3-3-1-5-3-6-6-1-3-1-7-1-10V24Z" />
      {/* bronches gauches */}
      <path d="M28 28c-2 1-3.5 2.5-4.5 5" />
      <path d="M28 34c-2.5 1-4.5 3-6 6" />
      <path d="M28 40c-2.5 1.5-4 3.5-5 6" />
      {/* bronches droites */}
      <path d="M36 28c2 1 3.5 2.5 4.5 5" />
      <path d="M36 34c2.5 1 4.5 3 6 6" />
      <path d="M36 40c2.5 1.5 4 3.5 5 6" />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  CARDIOLOGIE — Cœur anatomique avec gros vaisseaux                        */
/* ────────────────────────────────────────────────────────────────────────── */
export function HeartArt(p: LucideProps) {
  return (
    <svg {...base(p)}>
      {/* silhouette du cœur */}
      <path d="M32 18c-3-6-10-8-15-4-5 4-5 12 0 18l15 18 15-18c5-6 5-14 0-18-5-4-12-2-15 4Z" />
      {/* aorte */}
      <path d="M28 12c-1-3 0-6 2-7" />
      <path d="M30 5c2 0 4 2 4 4" />
      {/* artère pulmonaire */}
      <path d="M36 14c1-2 3-3 5-3" />
      {/* coronaires (gauche / droite) */}
      <path d="M22 28c4 2 7 5 8 9" />
      <path d="M42 28c-4 2-7 5-8 9" />
      {/* sillon interventriculaire */}
      <path d="M32 22v22" />
      {/* veines caves */}
      <path d="M18 22c-3-1-5-3-5-5" />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  NÉPHROLOGIE / UROLOGIE — Reins avec pyramides et hile                    */
/* ────────────────────────────────────────────────────────────────────────── */
export function KidneyArt(p: LucideProps) {
  return (
    <svg {...base(p)}>
      {/* rein gauche */}
      <path d="M20 12c-7 0-11 7-11 16 0 11 5 22 13 22 5 0 8-4 8-10 0-4-3-7-3-12s3-8 3-12c0-2-2-4-4-4h-6Z" />
      {/* rein droit */}
      <path d="M44 12c7 0 11 7 11 16 0 11-5 22-13 22-5 0-8-4-8-10 0-4 3-7 3-12s-3-8-3-12c0-2 2-4 4-4h6Z" />
      {/* hile + artère/veine gauche */}
      <path d="M24 30c-3 0-5 1-6 3" />
      <path d="M22 33h-6" />
      <path d="M22 28h-8" />
      {/* hile droit */}
      <path d="M40 30c3 0 5 1 6 3" />
      <path d="M42 33h6" />
      <path d="M42 28h8" />
      {/* pyramides rénales (petits arcs) */}
      <path d="M16 24c1.5 1 2.5 2.5 2.5 4.5" />
      <path d="M16 36c1.5-1 2.5-2.5 2.5-4.5" />
      <path d="M48 24c-1.5 1-2.5 2.5-2.5 4.5" />
      <path d="M48 36c-1.5-1-2.5-2.5-2.5-4.5" />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  GASTRO-ENTÉROLOGIE — Estomac + duodénum                                  */
/* ────────────────────────────────────────────────────────────────────────── */
export function StomachArt(p: LucideProps) {
  return (
    <svg {...base(p)}>
      {/* œsophage */}
      <path d="M20 8v4c0 3 2 5 5 5" />
      {/* corps de l'estomac */}
      <path d="M25 17c-8 0-14 7-14 17 0 11 6 18 16 18 8 0 14-4 16-11 2-7-1-14-7-17" />
      {/* grande courbure (interne) */}
      <path d="M18 32c4 4 9 6 14 6" />
      {/* pylore */}
      <path d="M36 24c4-1 8 1 10 4" />
      {/* duodénum */}
      <path d="M46 28c3 2 5 6 5 10s-3 7-7 7-7-3-7-7" />
      {/* plis gastriques */}
      <path d="M18 24c1 1 2 1.5 3 1.5" />
      <path d="M16 28c1 1 2 1.5 3 1.5" />
      <path d="M18 36c1 1 2 1.5 3 1.5" />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  HÉMATOLOGIE — Globules rouges (cluster)                                  */
/* ────────────────────────────────────────────────────────────────────────── */
export function BloodCellsArt(p: LucideProps) {
  return (
    <svg {...base(p)}>
      {/* globule rouge biconcave (creux central) */}
      {[
        { cx: 20, cy: 22, r: 7 },
        { cx: 34, cy: 16, r: 6 },
        { cx: 44, cy: 26, r: 7 },
        { cx: 24, cy: 38, r: 6 },
        { cx: 38, cy: 40, r: 7 },
        { cx: 50, cy: 42, r: 5 },
        { cx: 16, cy: 50, r: 5 },
        { cx: 30, cy: 52, r: 5 },
      ].map((c, i) => (
        <g key={i}>
          <circle cx={c.cx} cy={c.cy} r={c.r} />
          <circle cx={c.cx} cy={c.cy} r={c.r * 0.45} />
        </g>
      ))}
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  DERMATOLOGIE — Coupe de peau (épiderme + derme + follicule)              */
/* ────────────────────────────────────────────────────────────────────────── */
export function SkinLayerArt(p: LucideProps) {
  return (
    <svg {...base(p)}>
      {/* épiderme — ligne ondulée en haut */}
      <path d="M6 14c4-3 8-3 12 0s8 3 12 0 8-3 12 0 8 3 12 0" />
      <path d="M6 18c4-3 8-3 12 0s8 3 12 0 8-3 12 0 8 3 12 0" />
      {/* derme */}
      <path d="M6 24h52" />
      <path d="M6 30h52" />
      {/* hypoderme */}
      <path d="M6 36h52" />
      {/* follicule pileux */}
      <path d="M20 12v-4" />
      <ellipse cx="20" cy="34" rx="3" ry="6" />
      {/* glande sébacée */}
      <circle cx="28" cy="28" r="2.5" />
      {/* glande sudoripare */}
      <path d="M44 22v18" />
      <circle cx="44" cy="42" r="3" />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  ORL — Oreille en coupe (pavillon + canal + cochlée)                      */
/* ────────────────────────────────────────────────────────────────────────── */
export function EarArt(p: LucideProps) {
  return (
    <svg {...base(p)}>
      {/* pavillon */}
      <path d="M22 12c-8 0-14 7-14 18 0 8 4 16 10 20 4 3 8 4 12 3 3-1 5-3 5-7 0-3-2-5-5-5-2 0-3-1-3-3s2-4 5-4c4 0 7-3 7-7 0-9-6-15-14-15h-3Z" />
      {/* hélix interne */}
      <path d="M22 20c-4 0-7 4-7 9 0 4 2 7 5 9" />
      {/* anti-hélix */}
      <path d="M22 28c-2 0-4 2-4 4" />
      {/* conduit auditif */}
      <path d="M30 32h10" />
      {/* cochlée (spirale) */}
      <path d="M48 30a4 4 0 1 1-4 4" />
      <path d="M50 28a7 7 0 1 1-7 7" />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  OPHTALMOLOGIE — Œil détaillé (iris + pupille + paupières + cils)         */
/* ────────────────────────────────────────────────────────────────────────── */
export function EyeArt(p: LucideProps) {
  return (
    <svg {...base(p)}>
      {/* paupière supérieure */}
      <path d="M6 32c4-10 14-16 26-16s22 6 26 16" />
      {/* paupière inférieure */}
      <path d="M6 32c4 10 14 16 26 16s22-6 26-16" />
      {/* iris */}
      <circle cx="32" cy="32" r="10" />
      {/* pupille */}
      <circle cx="32" cy="32" r="4" fill="currentColor" />
      {/* reflet */}
      <circle cx="29" cy="29" r="1.5" fill="white" stroke="none" />
      {/* cils */}
      <path d="M14 22l-2-3" />
      <path d="M22 18v-3" />
      <path d="M32 16v-3" />
      <path d="M42 18v-3" />
      <path d="M50 22l2-3" />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  NEUROLOGIE — Cerveau avec gyri                                           */
/* ────────────────────────────────────────────────────────────────────────── */
export function BrainArt(p: LucideProps) {
  return (
    <svg {...base(p)}>
      {/* hémisphère gauche */}
      <path d="M30 12c-4-2-9-2-12 1-3 3-4 7-3 11-2 1-3 3-3 6 0 4 3 7 6 7 0 3 2 6 5 7 1 4 5 6 9 5 2 2 4 3 6 3v-40c-2 0-5 1-8 0Z" />
      {/* hémisphère droit */}
      <path d="M34 12c4-2 9-2 12 1 3 3 4 7 3 11 2 1 3 3 3 6 0 4-3 7-6 7 0 3-2 6-5 7-1 4-5 6-9 5-2 2-4 3-6 3v-40c2 0 5 1 8 0Z" />
      {/* gyri */}
      <path d="M22 22c2 2 4 2 6 0" />
      <path d="M20 30c2 2 4 2 6 0" />
      <path d="M22 38c2 2 4 2 6 0" />
      <path d="M36 22c2 2 4 2 6 0" />
      <path d="M38 30c2 2 4 2 6 0" />
      <path d="M36 38c2 2 4 2 6 0" />
      {/* sillon central */}
      <path d="M32 12v40" />
      {/* tronc cérébral */}
      <path d="M32 52c-2 2-2 4-2 6" />
      <path d="M32 52c2 2 2 4 2 6" />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  GYNÉCOLOGIE — Utérus + trompes + ovaires                                 */
/* ────────────────────────────────────────────────────────────────────────── */
export function UterusArt(p: LucideProps) {
  return (
    <svg {...base(p)}>
      {/* corps utérin */}
      <path d="M22 22c0 12 4 22 10 22s10-10 10-22" />
      {/* fond utérin */}
      <path d="M22 22c0-3 1-5 3-6" />
      <path d="M42 22c0-3-1-5-3-6" />
      {/* trompe gauche */}
      <path d="M25 16c-2-2-6-3-9-1-2 1-3 4-2 6" />
      {/* trompe droite */}
      <path d="M39 16c2-2 6-3 9-1 2 1 3 4 2 6" />
      {/* ovaire gauche */}
      <ellipse cx="12" cy="20" rx="4" ry="3" transform="rotate(-20 12 20)" />
      {/* franges de la trompe gauche */}
      <path d="M8 18l-2-2" />
      <path d="M9 22l-3 1" />
      {/* ovaire droit */}
      <ellipse cx="52" cy="20" rx="4" ry="3" transform="rotate(20 52 20)" />
      <path d="M56 18l2-2" />
      <path d="M55 22l3 1" />
      {/* col + vagin */}
      <path d="M30 44h4" />
      <path d="M30 48h4" />
      <path d="M30 52h4" />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  OBSTÉTRIQUE — Silhouette femme enceinte                                  */
/* ────────────────────────────────────────────────────────────────────────── */
export function PregnantWomanArt(p: LucideProps) {
  return (
    <svg {...base(p)}>
      {/* tête */}
      <circle cx="32" cy="12" r="5" />
      {/* cheveux */}
      <path d="M27 11c-1-4 2-7 5-7s6 3 5 7" />
      {/* corps + ventre (courbe prononcée à droite) */}
      <path d="M27 18c-1 3-2 8-2 14 0 0-3 2-3 6" />
      <path d="M37 18c1 3 2 8 2 14 0 0 6 1 8 10s-3 14-11 14h-8c-5 0-8-4-8-9 0-3 1-5 3-7" />
      {/* bébé dans le ventre (cercle) */}
      <circle cx="38" cy="38" r="6" />
      {/* jambes */}
      <path d="M26 52v8" />
      <path d="M34 52v8" />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  PÉDIATRIE — Enfant avec doudou                                           */
/* ────────────────────────────────────────────────────────────────────────── */
export function ChildArt(p: LucideProps) {
  return (
    <svg {...base(p)}>
      {/* tête */}
      <circle cx="24" cy="20" r="7" />
      {/* yeux */}
      <circle cx="22" cy="19" r="0.7" fill="currentColor" />
      <circle cx="26" cy="19" r="0.7" fill="currentColor" />
      {/* sourire */}
      <path d="M22 22c1 1 3 1 4 0" />
      {/* corps */}
      <path d="M18 28c-2 3-3 7-3 10v8h18v-8c0-3-1-7-3-10" />
      {/* bras */}
      <path d="M18 32l-4 6" />
      <path d="M30 32l4 6" />
      {/* jambes */}
      <path d="M20 46v8" />
      <path d="M28 46v8" />
      {/* doudou (ours) */}
      <circle cx="46" cy="38" r="8" />
      <circle cx="42" cy="34" r="2" />
      <circle cx="50" cy="34" r="2" />
      <circle cx="45" cy="38" r="0.7" fill="currentColor" />
      <circle cx="47" cy="38" r="0.7" fill="currentColor" />
      <path d="M44 41c1 1 3 1 4 0" />
      {/* pied de l'ours / lien */}
      <path d="M40 46v4" />
      <path d="M52 46v4" />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  GÉRIATRIE — Silhouette personne âgée avec canne                          */
/* ────────────────────────────────────────────────────────────────────────── */
export function ElderlyArt(p: LucideProps) {
  return (
    <svg {...base(p)}>
      {/* tête */}
      <circle cx="28" cy="14" r="5" />
      {/* corps légèrement courbé */}
      <path d="M24 19c-2 3-4 8-3 12 1 4 3 7 2 11-1 4-3 8-2 12" />
      <path d="M32 19c1 3 2 8 1 12-1 4-3 7-2 11 1 4 3 8 2 12" />
      {/* bras avec canne */}
      <path d="M32 26l8-2" />
      <path d="M40 24v32" />
      <path d="M40 24c1-1 3-1 4 0" />
      {/* jambes */}
      <path d="M21 54v6" />
      <path d="M31 54v6" />
      {/* lunettes */}
      <circle cx="26" cy="13" r="1.5" />
      <circle cx="30" cy="13" r="1.5" />
      <path d="M27.5 13h1" />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  URGENCES — Tracé ECG avec moniteur                                       */
/* ────────────────────────────────────────────────────────────────────────── */
export function HeartbeatArt(p: LucideProps) {
  return (
    <svg {...base(p)}>
      {/* moniteur */}
      <rect x="6" y="14" width="52" height="32" rx="3" />
      <rect x="6" y="14" width="52" height="6" />
      <circle cx="10" cy="17" r="0.8" fill="currentColor" />
      <circle cx="13" cy="17" r="0.8" fill="currentColor" />
      <circle cx="16" cy="17" r="0.8" fill="currentColor" />
      {/* tracé ECG */}
      <path d="M10 32h10l3-8 4 16 3-10 2 4 2-2h20" />
      {/* pied du moniteur */}
      <path d="M28 46v6h8v-6" />
      <path d="M22 52h20" />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  INFECTIOLOGIE — Cluster de virus (spikes)                                */
/* ────────────────────────────────────────────────────────────────────────── */
export function VirusArt(p: LucideProps) {
  const virus = (cx: number, cy: number, r: number, spikes: number) => (
    <g>
      <circle cx={cx} cy={cy} r={r} />
      {[...Array(spikes)].map((_, i) => {
        const a = (i / spikes) * Math.PI * 2;
        const x1 = cx + Math.cos(a) * r;
        const y1 = cy + Math.sin(a) * r;
        const x2 = cx + Math.cos(a) * (r + 3);
        const y2 = cy + Math.sin(a) * (r + 3);
        return (
          <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} />
            <circle cx={x2} cy={y2} r={1} />
          </g>
        );
      })}
      {/* matériel génétique interne */}
      <circle cx={cx} cy={cy} r={r * 0.35} />
    </g>
  );
  return (
    <svg {...base(p)}>
      {virus(22, 22, 7, 8)}
      {virus(44, 18, 5, 6)}
      {virus(46, 42, 7, 8)}
      {virus(20, 46, 6, 7)}
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  ENDOCRINOLOGIE — Glande thyroïde (papillon)                              */
/* ────────────────────────────────────────────────────────────────────────── */
export function ThyroidArt(p: LucideProps) {
  return (
    <svg {...base(p)}>
      {/* lobe gauche */}
      <path d="M12 24c-2 0-4 2-4 6 0 8 6 16 14 16 3 0 5-2 5-5 0-2 0-5-2-7-3-3-5-7-5-10 0-1-1-2-2-2H12Z" />
      {/* lobe droit */}
      <path d="M52 24c2 0 4 2 4 6 0 8-6 16-14 16-3 0-5-2-5-5 0-2 0-5 2-7 3-3 5-7 5-10 0-1 1-2 2-2h6Z" />
      {/* isthme */}
      <path d="M27 32c2 2 8 2 10 0" />
      {/* cartilage thyroïde au-dessus */}
      <path d="M24 18c2-3 6-4 8-4s6 1 8 4" />
      <path d="M24 18h16" />
      <path d="M28 18v6" />
      <path d="M36 18v6" />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  RHUMATOLOGIE — Articulation (genou)                                      */
/* ────────────────────────────────────────────────────────────────────────── */
export function JointArt(p: LucideProps) {
  return (
    <svg {...base(p)}>
      {/* fémur (os supérieur) */}
      <path d="M20 6c0 8 2 14 3 20 1 3 4 4 8 4h2c4 0 7-1 8-4 1-6 3-12 3-20" />
      {/* rotule */}
      <circle cx="32" cy="30" r="4" />
      {/* tibia (os inférieur) */}
      <path d="M20 58c0-8 2-14 3-20 1-3 4-4 8-4h2c4 0 7 1 8 4 1 6 3 12 3 20" />
      {/* ligaments croisés */}
      <path d="M26 30l12 6" />
      <path d="M38 30l-12 6" />
      {/* méniscat */}
      <ellipse cx="32" cy="34" rx="9" ry="1.5" />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  ALLERGOLOGIE — Pissenlit (graines en vol)                                */
/* ────────────────────────────────────────────────────────────────────────── */
export function PollenArt(p: LucideProps) {
  return (
    <svg {...base(p)}>
      {/* tige */}
      <path d="M32 38v22" />
      {/* feuilles */}
      <path d="M32 48c-3 0-6-2-7-4" />
      <path d="M32 54c3 0 6-2 7-4" />
      {/* cœur du pissenlit */}
      <circle cx="32" cy="22" r="3" />
      {/* aigrettes (rayons) */}
      {[...Array(16)].map((_, i) => {
        const a = (i / 16) * Math.PI * 2 - Math.PI / 2;
        const x1 = 32 + Math.cos(a) * 6;
        const y1 = 22 + Math.sin(a) * 6;
        const x2 = 32 + Math.cos(a) * 13;
        const y2 = 22 + Math.sin(a) * 13;
        return (
          <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} />
            <circle cx={x2} cy={y2} r={1.2} />
          </g>
        );
      })}
      {/* graines qui s'envolent */}
      <circle cx="50" cy="10" r="1" />
      <circle cx="14" cy="14" r="1" />
      <circle cx="54" cy="20" r="1" />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  MÉDECINE INTERNE — Corps humain en vue antérieure                        */
/* ────────────────────────────────────────────────────────────────────────── */
export function HumanBodyArt(p: LucideProps) {
  return (
    <svg {...base(p)}>
      {/* tête */}
      <circle cx="32" cy="10" r="5" />
      {/* cou */}
      <path d="M32 15v3" />
      {/* tronc + bras */}
      <path d="M22 22h20" />
      <path d="M22 22c-2 6-5 10-7 14" />
      <path d="M42 22c2 6 5 10 7 14" />
      {/* thorax */}
      <path d="M22 22c0 8 3 15 10 18 7-3 10-10 10-18" />
      {/* mains */}
      <circle cx="14" cy="38" r="1.5" />
      <circle cx="50" cy="38" r="1.5" />
      {/* hanches + jambes */}
      <path d="M24 40v4h16v-4" />
      <path d="M26 44c-1 6-3 12-3 18" />
      <path d="M38 44c1 6 3 12 3 18" />
      {/* organes internes schématisés */}
      <path d="M28 28c1 2 3 3 4 3s3-1 4-3" />
      <circle cx="28" cy="34" r="1" fill="currentColor" />
      <circle cx="36" cy="34" r="1" fill="currentColor" />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  CANCÉROLOGIE — Ruban de sensibilisation                                  */
/* ────────────────────────────────────────────────────────────────────────── */
export function RibbonArt(p: LucideProps) {
  return (
    <svg {...base(p)}>
      {/* boucle gauche du ruban */}
      <path d="M22 10c-4 4-4 10 0 14l10 12-4 8c-1 2-3 4-6 4-3 0-5-3-3-6l8-10" />
      {/* boucle droite */}
      <path d="M42 10c4 4 4 10 0 14l-10 12 4 8c1 2 3 4 6 4 3 0 5-3 3-6l-8-10" />
      {/* nœud */}
      <path d="M28 30h8v6h-8z" />
      <path d="M28 30c-1 2-1 4 0 6" />
      <path d="M36 30c1 2 1 4 0 6" />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  PHARMACOLOGIE — Gélule + comprimé                                        */
/* ────────────────────────────────────────────────────────────────────────── */
export function PillArt(p: LucideProps) {
  return (
    <svg {...base(p)}>
      {/* gélule oblique */}
      <rect x="10" y="20" width="32" height="14" rx="7" transform="rotate(-25 26 27)" />
      <path d="M22 18l10 22" transform="rotate(-25 26 27)" />
      {/* petits points dans la moitié droite */}
      <circle cx="36" cy="22" r="0.8" fill="currentColor" />
      <circle cx="40" cy="20" r="0.8" fill="currentColor" />
      <circle cx="38" cy="26" r="0.8" fill="currentColor" />
      {/* comprimé rond */}
      <circle cx="46" cy="46" r="10" />
      <path d="M40 46h12" />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  MÉDECINE GÉNÉRALE — Stéthoscope                                          */
/* ────────────────────────────────────────────────────────────────────────── */
export function StethoscopeArt(p: LucideProps) {
  return (
    <svg {...base(p)}>
      {/* embouts auriculaires */}
      <path d="M12 6v10c0 8 6 14 14 14" />
      <path d="M28 6v10c0 8-2 12-6 14" />
      {/* tubes */}
      <path d="M26 30c0 6 4 12 10 14" />
      {/* pavillon */}
      <circle cx="42" cy="46" r="6" />
      <circle cx="42" cy="46" r="3" />
      {/* bouchons d'oreille */}
      <circle cx="12" cy="6" r="2" />
      <circle cx="28" cy="6" r="2" />
    </svg>
  );
}
