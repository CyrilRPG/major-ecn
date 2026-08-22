import Link from 'next/link';
import { ArrowRight, ClipboardList, GraduationCap, PenLine, ScrollText, Sparkles, Star, Trophy } from 'lucide-react';

/**
 * Carte d'une série dans l'onglet DP · QI.
 *
 * Partagée entre la liste de l'item et la liste d'une année d'annales, pour que
 * les deux écrans ne divergent pas — même palette, même badge, même score.
 */

type Theme = {
  bar: string; bg: string; fg: string;
  Icon: typeof ScrollText;
  kindLabel: string;
};

// « Annales - <Collège> - <Année> - <Type> » : annales EVC officielles corrigées
// par Major ECN. Catégorie à part entière (ambre), distincte des banques maison.
export const isAnnaleLabel = (label: string) => /^annales?\b/i.test(label);
// Voie externe : QROC (« QROC — Série N ») et DP-QROC (« DP QROC N · … »)
// partagent une identité visuelle « teal » distincte des QCM/DP (voie interne).
const isDpQrocLabel = (label: string) => /^dp\s*qroc/i.test(label);
const isQrocLabel = (label: string) => /^qroc/i.test(label);
// « DP 1 » (DP QCM) → traitement rouge + icône DP.
const isDpLabel = (label: string) => /^dp\b/i.test(label);
const isEntrainementLabel = (label: string) => /entra[iî]nement/i.test(label);
/** Les 2 nouveaux DP QROC premium portent une étoile (les anciens sont en ≥ 3). */
export const isStarredDpQroc = (label: string) => /^dp\s*qroc\s*[12]\b/i.test(label);

export function serieTheme(s: { label: string; type?: string | null }): Theme {
  // Ambre=Annale EVC, violet=Séance, vert=Entraînement,
  // teal=QROC/DP-QROC (voie externe), rouge=DP, bleu=QCM standard (voie interne).
  if (isAnnaleLabel(s.label)) return { bar: '#B45309', bg: '#FEF3C7', fg: '#92400E', Icon: ScrollText, kindLabel: 'Annale' };
  if (s.type === 'seance') return { bar: '#7C3AED', bg: '#F3EAFF', fg: '#5B21B6', Icon: Sparkles, kindLabel: 'Séance du prof' };
  if (isEntrainementLabel(s.label)) return { bar: '#16A34A', bg: '#E7F6EC', fg: '#16793C', Icon: Trophy, kindLabel: 'Entraînement' };
  if (isDpQrocLabel(s.label)) return { bar: '#0D9488', bg: '#CCFBF1', fg: '#0F766E', Icon: ClipboardList, kindLabel: 'DP QROC' };
  if (isQrocLabel(s.label)) return { bar: '#0D9488', bg: '#CCFBF1', fg: '#0F766E', Icon: PenLine, kindLabel: 'QROC' };
  if (isDpLabel(s.label)) return { bar: '#E4002B', bg: '#FDE7E9', fg: '#C0001F', Icon: ClipboardList, kindLabel: 'DP' };
  return { bar: '#2563EB', bg: '#E5F1FF', fg: '#1E4D8B', Icon: GraduationCap, kindLabel: 'QCM' };
}

/** Couleur du score : rouge < 50 %, orange < 80 %, vert ≥ 80 %. */
export function scoreTheme(correct: number, total: number) {
  const r = total > 0 ? correct / total : 0;
  if (r < 0.5) return { bg: '#FDE7E9', fg: '#C0001F' };
  if (r < 0.8) return { bg: '#FEF3E2', fg: '#B26A00' };
  return { bg: '#E7F6EC', fg: '#16793C' };
}

/**
 * Ligne cliquable : barre colorée, icône, rang, libellé, badge de type ou score.
 * `titre` permet d'afficher un libellé raccourci sans toucher au libellé réel.
 */
export function SerieCard({
  href, label, titre, type, qCount, rang, dernierScore,
}: {
  href: string;
  label: string;
  titre?: string;
  type?: string | null;
  qCount: number;
  rang: number;
  dernierScore?: { score_correct: number; score_total: number } | null;
}) {
  const theme = serieTheme({ label, type });
  const st = dernierScore ? scoreTheme(dernierScore.score_correct, dernierScore.score_total) : null;
  return (
    <Link
      href={href}
      className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface) px-4 py-3.5 shadow-(--shadow-soft) transition-all hover:-translate-y-0.5 hover:shadow-(--shadow-lifted) focus-ring"
    >
      {/* Barre verticale colorée à gauche selon le type. */}
      <span aria-hidden className="absolute inset-y-0 left-0 w-1.5" style={{ background: theme.bar }} />
      <span
        className="ml-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{ background: theme.bg, color: theme.fg }}
      >
        <theme.Icon className="h-5 w-5" />
      </span>
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold"
        style={{ background: theme.bg, color: theme.fg }}
      >
        {String(rang).padStart(2, '0')}
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 truncate text-[15px] font-semibold text-(--color-ink)">
          {/* Étoile distinctive sur les nouveaux DP QROC (voie externe). */}
          {isStarredDpQroc(label) && <Star className="h-4 w-4 shrink-0 fill-[#F5B301] text-[#F5B301]" aria-label="Nouveau dossier QROC" />}
          <span className="truncate">{titre ?? label}</span>
        </p>
        <p className="text-xs text-(--color-ink-muted)">
          {qCount} questions · environ {Math.max(1, qCount)} min
        </p>
      </div>
      {st && dernierScore ? (
        <span
          className="shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums"
          style={{ background: st.bg, color: st.fg }}
        >
          {dernierScore.score_correct} / {dernierScore.score_total}
        </span>
      ) : (
        <span
          className="shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold"
          style={{ background: theme.bg, color: theme.fg }}
        >
          {theme.kindLabel}
        </span>
      )}
      <ArrowRight className="h-4 w-4 shrink-0 text-(--color-ink-muted) transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
