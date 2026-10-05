/**
 * Couronne de laurier de la maquette : deux branches en arc d'ellipse, une
 * feuille extérieure et une feuille intérieure par nœud, tiges croisées en
 * bas (géométrie calculée une fois, déterministe).
 */
type Leaf = { x: number; y: number; a: number; l: number; w: number };
const LCX = 36; const LCY = 31; const LRX = 23.5; const LRY = 24.5;
const rad = (d: number) => (d * Math.PI) / 180;
function leftBranch(): { leaves: Leaf[]; stem: string } {
  const leaves: Leaf[] = [];
  const pt = (phi: number) => ({ x: LCX + LRX * Math.cos(rad(phi)), y: LCY + LRY * Math.sin(rad(phi)) });
  const tangent = (phi: number) => (Math.atan2(LRY * Math.cos(rad(phi)), -LRX * Math.sin(rad(phi))) * 180) / Math.PI;
  const nodes = [112, 129, 146, 163, 180, 197, 213];
  nodes.forEach((phi, i) => {
    const p = pt(phi);
    const t = tangent(phi);
    const size = 1 - i * 0.045;
    const lo = 12 * size; const wo = 3.4 * size;
    const li = 10.6 * size; const wi = 3.15 * size;
    const ao = t - 31; const ai = t + 41;
    // Base de la feuille légèrement décollée de la tige : un fin liseré clair sépare les feuilles.
    leaves.push({ x: p.x + (lo / 2 + 0.6) * Math.cos(rad(ao)), y: p.y + (lo / 2 + 0.6) * Math.sin(rad(ao)), a: ao, l: lo, w: wo });
    if (i < nodes.length - 1) leaves.push({ x: p.x + (li / 2 + 0.6) * Math.cos(rad(ai)), y: p.y + (li / 2 + 0.6) * Math.sin(rad(ai)), a: ai, l: li, w: wi });
  });
  const tip = pt(224);
  const tt = tangent(224) + 4;
  leaves.push({ x: tip.x + 5.2 * Math.cos(rad(tt)), y: tip.y + 5.2 * Math.sin(rad(tt)), a: tt, l: 10, w: 2.7 });
  const s0 = pt(224); const s1 = pt(103);
  const stem = `M${s0.x.toFixed(2)} ${s0.y.toFixed(2)} A${LRX} ${LRY} 0 0 0 ${s1.x.toFixed(2)} ${s1.y.toFixed(2)} L42.4 59.2`;
  return { leaves, stem };
}
const BRANCH = leftBranch();
const leafPath = (l: Leaf) => `M${(-l.l / 2).toFixed(2)} 0Q0 ${(-l.w * 1.35).toFixed(2)} ${(l.l / 2).toFixed(2)} 0Q0 ${(l.w * 1.35).toFixed(2)} ${(-l.l / 2).toFixed(2)} 0Z`;

export function LaurelMark({ className, color = 'currentColor' }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 72 66" className={className} aria-hidden="true" fill={color}>
      {[1, -1].map((side) => (
        <g key={side} transform={side === -1 ? 'translate(72 0) scale(-1 1)' : undefined}>
          <path d={BRANCH.stem} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          {BRANCH.leaves.map((l, i) => (
            <path key={i} d={leafPath(l)} transform={`translate(${l.x.toFixed(2)} ${l.y.toFixed(2)}) rotate(${l.a.toFixed(1)})`} />
          ))}
        </g>
      ))}
    </svg>
  );
}
