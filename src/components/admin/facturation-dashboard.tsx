'use client';

import { useMemo, useState } from 'react';
import {
  Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts';
import {
  BadgePercent, ClipboardList, FileText, Layers3, type LucideIcon,
  MessageSquare, PencilRuler, Receipt, Sparkles, TrendingDown, UploadCloud, Wallet,
} from 'lucide-react';

export type CourseLine = {
  id: string;
  titre: string;
  matiere: string;
  /** Prix € déjà calculés (proportionnels pour Médecine générale). */
  fichePrice: number;
  qcmPrice: number;
  flashPrice: number;
  nSeries: number;
  nFlash: number;
  isMg: boolean;
  decouverte: boolean;
};

type Tarifs = { fiche: number; qcm: number; flash: number; ia: number };
type CatKey = 'fiche' | 'qcm' | 'flash' | 'ia' | 'epreuves' | 'generations' | 'imports';
export type ExerciseImportBillingLine = { id: string; title: string; cents: number; questions: number; createdAt: string };

// Tarifs Épreuves blanches : 1 centime fixe / épreuve + 0,5 centime / QROC.
const EPREUVE_FIXED_EUR = 0.01;
const QROC_RATE_EUR = 0.005;

// Générations IA facturées au forfait, par génération réussie.
const GEN_INTERRO_EUR = 0.3;
const GEN_EPREUVE_EUR = 1.3;

const CAT: Record<CatKey, { label: string; short: string; color: string; soft: string; Icon: LucideIcon }> = {
  fiche: { label: 'Fiches', short: 'Fiche', color: '#2563EB', soft: 'rgba(37,99,235,0.12)', Icon: FileText },
  qcm: { label: 'QCM + DP', short: 'QCM', color: '#F59E0B', soft: 'rgba(245,158,11,0.14)', Icon: ClipboardList },
  flash: { label: 'Flashcards', short: 'Flashcards', color: '#E4002B', soft: 'rgba(228,0,43,0.12)', Icon: Layers3 },
  ia: { label: 'Réponses IA', short: 'IA', color: '#8B5CF6', soft: 'rgba(139,92,246,0.14)', Icon: MessageSquare },
  epreuves: { label: 'Épreuves blanches', short: 'Épreuves', color: '#0D9488', soft: 'rgba(13,148,136,0.14)', Icon: PencilRuler },
  generations: { label: 'Générations IA', short: 'Générations', color: '#7C3AED', soft: 'rgba(124,58,237,0.14)', Icon: Sparkles },
  imports: { label: 'Import d’exercices', short: 'Imports', color: '#0284C7', soft: 'rgba(2,132,199,0.14)', Icon: UploadCloud },
};

const CAT_KEYS: CatKey[] = ['fiche', 'qcm', 'flash', 'ia', 'epreuves', 'generations', 'imports'];

// Lignes manuelles ajoutées au brut DP/QI (catégorie « QCM + DP »).
const MANUAL_QCM_LINES = [
  { label: 'QROC Voies externes', montant: 300 },
  // DP QROC voie externe — 2 nouveaux dossiers de 7 questions par item (874 séries).
  { label: 'QROC Voies externes — DP QROC', montant: 67 },
];
const MANUAL_QCM_TOTAL = MANUAL_QCM_LINES.reduce((s, l) => s + l.montant, 0);

const PALIERS = [
  { seuil: 1500, pct: 10 },
  { seuil: 3000, pct: 16 },
  { seuil: 7000, pct: 25 },
  { seuil: 10000, pct: 29 },
  { seuil: 15000, pct: 35 },
  { seuil: 20000, pct: 38 },
  { seuil: 22500, pct: 40 },
];

const eur = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);
const eur0 = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

/** Remise = min(40, 10 × log₂(Montant/1500 + 1)). */
function remisePct(montant: number): number {
  if (montant <= 0) return 0;
  return Math.min(40, 10 * Math.log2(montant / 1500 + 1));
}

export function FacturationDashboard({
  lines, aiResponses, tarifs, epreuves = { exams: 0, qroc: 0 },
  generations = { interrogations: 0, epreuves: 0 },
  exerciseImports = [],
}: {
  lines: CourseLine[]; aiResponses: number; tarifs: Tarifs;
  epreuves?: { exams: number; qroc: number };
  /** Générations IA réussies, facturées au forfait. */
  generations?: { interrogations: number; epreuves: number };
  exerciseImports?: ExerciseImportBillingLine[];
}) {
  const [sel, setSel] = useState<CatKey | null>(null);

  const data = useMemo(() => {
    const epreuvesTotal = epreuves.exams * EPREUVE_FIXED_EUR + epreuves.qroc * QROC_RATE_EUR;
    const generationsTotal =
      generations.interrogations * GEN_INTERRO_EUR + generations.epreuves * GEN_EPREUVE_EUR;
    const counts = {
      fiche: lines.filter((l) => l.fichePrice > 0).length,
      qcm: lines.filter((l) => l.qcmPrice > 0).length + MANUAL_QCM_LINES.length,
      flash: lines.filter((l) => l.flashPrice > 0).length,
      ia: aiResponses,
      epreuves: epreuves.exams,
      generations: generations.interrogations + generations.epreuves,
      imports: exerciseImports.length,
    };
    const totals = {
      fiche: lines.reduce((s, l) => s + l.fichePrice, 0),
      // Brut DP/QI = QCM/DP calculés + lignes manuelles (ex. QROC Voies externes).
      qcm: lines.reduce((s, l) => s + l.qcmPrice, 0) + MANUAL_QCM_TOTAL,
      flash: lines.reduce((s, l) => s + l.flashPrice, 0),
      ia: aiResponses * tarifs.ia,
      epreuves: epreuvesTotal,
      generations: generationsTotal,
      imports: exerciseImports.reduce((sum, row) => sum + row.cents / 100, 0),
    };
    const grand = totals.fiche + totals.qcm + totals.flash + totals.ia + totals.epreuves + totals.generations + totals.imports;

    // Coût par collège (pour analyse).
    const byCollege = new Map<string, number>();
    for (const l of lines) {
      const c = l.fichePrice + l.qcmPrice + l.flashPrice;
      byCollege.set(l.matiere, (byCollege.get(l.matiere) ?? 0) + c);
    }
    for (const ml of MANUAL_QCM_LINES) byCollege.set(ml.label, (byCollege.get(ml.label) ?? 0) + ml.montant);
    if (totals.ia > 0) byCollege.set('Réponses IA', (byCollege.get('Réponses IA') ?? 0) + totals.ia);
    if (totals.epreuves > 0) byCollege.set('Épreuves blanches', (byCollege.get('Épreuves blanches') ?? 0) + totals.epreuves);
    if (totals.generations > 0) byCollege.set('Générations IA', (byCollege.get('Générations IA') ?? 0) + totals.generations);
    if (totals.imports > 0) byCollege.set('Import d’exercices', (byCollege.get('Import d’exercices') ?? 0) + totals.imports);

    return { counts, totals, grand, byCollege };
  }, [lines, aiResponses, tarifs, epreuves, generations, exerciseImports]);

  const pct = remisePct(data.grand);
  const remiseEur = (data.grand * pct) / 100;
  const net = data.grand - remiseEur;
  const tarifOf: Record<CatKey, number> = { fiche: tarifs.fiche, qcm: tarifs.qcm, flash: tarifs.flash, ia: tarifs.ia, epreuves: EPREUVE_FIXED_EUR, generations: GEN_EPREUVE_EUR, imports: 0 };

  const pieData = CAT_KEYS
    .map((k) => ({ key: k, name: CAT[k].label, value: data.totals[k], color: CAT[k].color }))
    .filter((d) => d.value > 0);

  const barData = Array.from(data.byCollege.entries())
    .map(([name, value]) => ({ name, value }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);

  // Courses du tableau selon la catégorie sélectionnée.
  const rows = useMemo(() => {
    if (sel === 'ia' || sel === 'epreuves' || sel === 'generations' || sel === 'imports') return [];
    const keep = (l: CourseLine) =>
      sel === null ? l.fichePrice > 0 || l.qcmPrice > 0 || l.flashPrice > 0
        : sel === 'fiche' ? l.fichePrice > 0 : sel === 'qcm' ? l.qcmPrice > 0 : l.flashPrice > 0;
    return lines
      .filter(keep)
      .map((l) => {
        const items: { k: CatKey; price: number }[] = [];
        if ((sel === null || sel === 'fiche') && l.fichePrice > 0) items.push({ k: 'fiche', price: l.fichePrice });
        if ((sel === null || sel === 'qcm') && l.qcmPrice > 0) items.push({ k: 'qcm', price: l.qcmPrice });
        if ((sel === null || sel === 'flash') && l.flashPrice > 0) items.push({ k: 'flash', price: l.flashPrice });
        return { ...l, items, sub: items.reduce((s, i) => s + i.price, 0) };
      })
      .sort((a, b) => a.matiere.localeCompare(b.matiere) || a.titre.localeCompare(b.titre));
  }, [lines, sel]);

  const activePalier = [...PALIERS].reverse().find((p) => data.grand >= p.seuil) ?? null;
  const nextPalier = PALIERS.find((p) => data.grand < p.seuil) ?? null;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      {/* Header */}
      <header className="mb-6 flex items-start gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-(--color-primary-soft) text-(--color-primary)">
          <Receipt className="h-5 w-5" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-(--color-ink)">Facturation IA</h1>
          <p className="text-sm text-(--color-ink-soft)">
            Analyse des coûts du contenu généré par IA sur la plateforme. Inclut tous les collèges actifs.
            Fiche 10 € · QCM + DP 3 €/cours · Flashcards 5 €/cours · Réponse IA 0,10 €.
            Médecine générale : facturée par spécialité — 1 fiche (10 €) + QCM/DP au prorata (10 séries = 3 €)
            + flashcards au prorata (200 = 5 €). Découverte : fiche seule facturée. Séances approfondies (vidéo) non comptées.
          </p>
        </div>
      </header>

      {/* HERO — geste commercial */}
      <section className="mb-6 overflow-hidden rounded-3xl border border-(--color-border) bg-[linear-gradient(135deg,#1A0F2E_0%,#241046_45%,#3A0A1E_100%)] p-6 text-white shadow-(--shadow-soft) sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/90">
              <Sparkles className="h-3.5 w-3.5" /> Geste commercial
            </span>
            <p className="mt-4 text-sm font-medium text-white/70">Total à régler après remise</p>
            <p className="font-display text-5xl font-bold tracking-tight tabular-nums sm:text-6xl">{eur(net)}</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              <span className="text-white/60 line-through">{eur(data.grand)}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#22C55E]/20 px-2.5 py-1 font-semibold text-[#86EFAC]">
                <TrendingDown className="h-3.5 w-3.5" /> −{pct.toFixed(1)} %
              </span>
              <span className="font-semibold text-[#86EFAC]">soit {eur(remiseEur)} économisés</span>
            </div>
          </div>
          {/* mini jauge paliers */}
          <div className="rounded-2xl bg-white/8 p-4 ring-1 ring-white/10">
            <div className="flex items-center justify-between text-xs text-white/70">
              <span>Remise appliquée</span>
              <span className="font-semibold text-white">{pct.toFixed(1)} % {activePalier ? `· palier ${activePalier.pct} %` : ''}</span>
            </div>
            <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#86EFAC,#22C55E)]"
                style={{ width: `${(pct / 40) * 100}%` }}
              />
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-white/50">
              <span>0 %</span><span>plafond 40 %</span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-white/70">
              {nextPalier
                ? <>Plus que <span className="font-semibold text-white">{eur0(nextPalier.seuil - data.grand)}</span> de contenu pour atteindre le palier <span className="font-semibold text-white">{nextPalier.pct} %</span>.</>
                : <>Palier maximum atteint (40 %).</>}
            </p>
          </div>
        </div>
      </section>

      {/* CATEGORIES (cliquables) */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-(--color-ink-muted)">Coûts par catégorie</h2>
        {sel && (
          <button onClick={() => setSel(null)} className="text-xs font-semibold text-(--color-primary) hover:underline">
            Réinitialiser le filtre
          </button>
        )}
      </div>
      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        {CAT_KEYS.map((k) => {
          const c = CAT[k];
          const active = sel === k;
          const meta = k === 'ia' ? `${data.counts[k]} rép. · ${tarifOf[k].toFixed(2)} €`
            : k === 'epreuves' ? `${data.counts[k]} épreuve${data.counts[k] > 1 ? 's' : ''} · 1c + 0,5c/QROC`
            : k === 'generations' ? `${data.counts[k]} génération${data.counts[k] > 1 ? 's' : ''} · 0,30 € / 1,30 €`
            : k === 'imports' ? `${data.counts[k]} import${data.counts[k] > 1 ? 's' : ''}`
            : `${data.counts[k]} cours · ${tarifOf[k] % 1 === 0 ? tarifOf[k] : tarifOf[k].toFixed(2)} €`;
          return (
            <button
              key={k}
              onClick={() => setSel(active ? null : k)}
              style={{ borderColor: active ? c.color : undefined, boxShadow: active ? `0 0 0 1px ${c.color}` : undefined }}
              className={
                'group relative overflow-hidden rounded-2xl border bg-(--color-surface) p-4 text-left transition ' +
                (active ? '' : 'border-(--color-border) hover:border-(--color-border-strong)')
              }
            >
              <span className="absolute inset-x-0 top-0 h-1" style={{ background: c.color }} />
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: c.soft, color: c.color }}>
                  <c.Icon className="h-4 w-4" />
                </span>
                <span className="text-[11px] font-semibold tabular-nums text-(--color-ink-muted)">{meta}</span>
              </div>
              <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-(--color-ink-muted)">{c.label}</p>
              <p className="mt-0.5 font-display text-2xl font-bold tracking-tight tabular-nums text-(--color-ink)">{eur(data.totals[k])}</p>
              <p className="mt-1 text-[11px] text-(--color-ink-soft)">
                {data.grand > 0 ? `${((data.totals[k] / data.grand) * 100).toFixed(0)} % du total` : '—'}
              </p>
            </button>
          );
        })}
      </div>

      {/* CHARTS */}
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5">
          <h3 className="mb-1 text-sm font-semibold text-(--color-ink)">Répartition des coûts</h3>
          <p className="mb-2 text-xs text-(--color-ink-soft)">Part de chaque catégorie dans le total HT.</p>
          <div className="relative h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={105} paddingAngle={2} stroke="none">
                  {pieData.map((d) => <Cell key={d.key} fill={d.color} />)}
                </Pie>
                <Tooltip
                  formatter={(v, n) => [eur(Number(v) || 0), String(n)]}
                  contentStyle={{ borderRadius: 12, border: '1px solid #ECEEF1', fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-(--color-ink-muted)">Total HT</span>
              <span className="font-display text-2xl font-bold tabular-nums text-(--color-ink)">{eur(data.grand)}</span>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
            {CAT_KEYS.map((k) => (
              <span key={k} className="inline-flex items-center gap-1.5 text-xs text-(--color-ink-soft)">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: CAT[k].color }} />
                {CAT[k].label}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5">
          <h3 className="mb-1 text-sm font-semibold text-(--color-ink)">Coût par collège</h3>
          <p className="mb-2 text-xs text-(--color-ink-soft)">Ventilation du contenu facturé par matière.</p>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
                <XAxis type="number" tickFormatter={(v) => eur0(v)} tick={{ fontSize: 11, fill: '#9AA1AE' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => [eur(Number(v) || 0), 'Coût']} cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                  contentStyle={{ borderRadius: 12, border: '1px solid #ECEEF1', fontSize: 12 }} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} fill="#E4002B" maxBarSize={26} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* GESTE COMMERCIAL — détail */}
      <section className="mb-6 grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[rgba(34,197,94,0.12)] text-[#16A34A]">
              <BadgePercent className="h-4 w-4" />
            </span>
            <h3 className="text-sm font-semibold text-(--color-ink)">Paliers de remise</h3>
          </div>
          <p className="mb-3 rounded-lg bg-(--color-surface-soft) px-3 py-2 text-center font-mono text-xs text-(--color-ink-soft)">
            Remise (%) = min(40 ; 10 × log₂(Montant ÷ 1500 + 1))
          </p>
          <div className="overflow-hidden rounded-xl border border-(--color-border)">
            <table className="w-full text-sm">
              <thead className="bg-(--color-surface-soft) text-[11px] uppercase tracking-wider text-(--color-ink-muted)">
                <tr><th className="px-3 py-2 text-left font-semibold">Montant ≥</th><th className="px-3 py-2 text-right font-semibold">Remise</th></tr>
              </thead>
              <tbody className="divide-y divide-(--color-border)">
                {PALIERS.map((p) => {
                  const on = activePalier?.seuil === p.seuil;
                  return (
                    <tr key={p.seuil} className={on ? 'bg-[rgba(34,197,94,0.10)]' : ''}>
                      <td className="px-3 py-2 tabular-nums text-(--color-ink)">
                        {eur0(p.seuil)} {p.seuil === 22500 && <span className="text-(--color-ink-muted)">(plafond)</span>}
                      </td>
                      <td className="px-3 py-2 text-right font-semibold tabular-nums" style={{ color: on ? '#16A34A' : undefined }}>
                        {p.pct} %{on && ' ◄'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* avant / après */}
        <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-(--color-ink)">
            <Wallet className="h-4 w-4 text-(--color-primary)" /> Total avant / après geste commercial
          </h3>
          <dl className="space-y-2.5 text-sm">
            <Row label="Fiches" value={eur(data.totals.fiche)} />
            <Row label="QCM + DP" value={eur(data.totals.qcm)} />
            <Row label="Flashcards" value={eur(data.totals.flash)} />
            <Row label="Réponses IA" value={eur(data.totals.ia)} />
            <Row label="Épreuves blanches" value={eur(data.totals.epreuves)} />
            <Row label="Générations IA" value={eur(data.totals.generations)} />
            <Row label="Import d’exercices" value={eur(data.totals.imports)} />
            <div className="my-2 border-t border-dashed border-(--color-border)" />
            <Row label="Total avant remise" value={eur(data.grand)} strong />
            <Row label={`Geste commercial (−${pct.toFixed(1)} %)`} value={`− ${eur(remiseEur)}`} accent />
          </dl>
          <div className="mt-4 flex items-end justify-between rounded-2xl bg-[linear-gradient(135deg,#16A34A,#0F7A37)] px-5 py-4 text-white">
            <span className="text-sm font-medium text-white/85">Total à régler</span>
            <span className="font-display text-3xl font-bold tabular-nums">{eur(net)}</span>
          </div>
        </div>
      </section>

      {/* DETAIL TABLE */}
      <div className="rounded-2xl border border-(--color-border) bg-(--color-surface)">
        <div className="flex items-center justify-between border-b border-(--color-border) px-5 py-3">
          <h3 className="text-sm font-semibold text-(--color-ink)">
            {sel === null ? 'Détail par cours' : sel === 'ia' ? 'Réponses de l’assistant IA' : sel === 'epreuves' ? 'Épreuves blanches' : sel === 'generations' ? 'Générations IA' : sel === 'imports' ? 'Import d’exercices' : `Cours facturés — ${CAT[sel].label}`}
          </h3>
          <span className="text-xs text-(--color-ink-soft)">
            {sel === 'ia' ? `${aiResponses} réponse${aiResponses > 1 ? 's' : ''}`
              : sel === 'epreuves' ? `${epreuves.exams} épreuve${epreuves.exams > 1 ? 's' : ''}`
              : sel === 'generations' ? `${data.counts.generations} génération${data.counts.generations > 1 ? 's' : ''}`
              : sel === 'imports' ? `${exerciseImports.length} import${exerciseImports.length > 1 ? 's' : ''}`
              : `${rows.length} cours`}
          </span>
        </div>

        {sel === 'ia' ? (
          <div className="px-5 py-10 text-center text-sm text-(--color-ink-soft)">
            <MessageSquare className="mx-auto mb-2 h-6 w-6 text-(--color-ink-muted)" />
            {aiResponses} réponse{aiResponses > 1 ? 's' : ''} de l’assistant IA facturée{aiResponses > 1 ? 's' : ''} à 0,10 € —
            soit <span className="font-semibold text-(--color-ink)">{eur(data.totals.ia)}</span>.
          </div>
        ) : sel === 'epreuves' ? (
          <div className="px-5 py-10 text-center text-sm text-(--color-ink-soft)">
            <PencilRuler className="mx-auto mb-2 h-6 w-6 text-(--color-ink-muted)" />
            {epreuves.exams} épreuve{epreuves.exams > 1 ? 's' : ''} · {epreuves.qroc} QROC — facturées 1&nbsp;c / épreuve + 0,5&nbsp;c / QROC,
            soit <span className="font-semibold text-(--color-ink)">{eur(data.totals.epreuves)}</span>.
          </div>
        ) : sel === 'generations' ? (
          <div className="px-5 py-8 text-sm text-(--color-ink-soft)">
            <Sparkles className="mx-auto mb-3 h-6 w-6 text-(--color-ink-muted)" />
            <div className="mx-auto max-w-sm space-y-1.5">
              <Row
                label={`Interrogations générées — ${generations.interrogations} × 0,30 €`}
                value={eur(generations.interrogations * GEN_INTERRO_EUR)}
              />
              <Row
                label={`Épreuves blanches générées — ${generations.epreuves} × 1,30 €`}
                value={eur(generations.epreuves * GEN_EPREUVE_EUR)}
              />
              <div className="border-t border-(--color-border) pt-1.5">
                <Row label="Total" value={eur(data.totals.generations)} strong />
              </div>
            </div>
            <p className="mt-4 text-center text-xs text-(--color-ink-muted)">
              Forfait par génération réussie. Une génération en échec n’est pas facturée.
            </p>
          </div>
        ) : sel === 'imports' ? (
          <div className="divide-y divide-(--color-border)">
            {exerciseImports.length === 0 ? <p className="px-5 py-10 text-center text-sm text-(--color-ink-soft)">Aucun import facturé.</p> : exerciseImports.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
                <div><p className="font-medium text-(--color-ink)">{item.title}</p><p className="text-xs text-(--color-ink-muted)">{item.questions} exercice{item.questions > 1 ? 's' : ''} · {new Date(item.createdAt).toLocaleDateString('fr-FR')}</p></div>
                <span className="font-semibold tabular-nums text-(--color-ink)">{eur(item.cents / 100)}</span>
              </div>
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-(--color-ink-soft)">Aucun cours dans cette catégorie.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-(--color-surface-soft) text-[11px] uppercase tracking-wider text-(--color-ink-muted)">
                <tr>
                  <th className="px-4 py-2.5 text-left font-semibold">Cours</th>
                  <th className="hidden px-4 py-2.5 text-left font-semibold sm:table-cell">Collège</th>
                  <th className="px-4 py-2.5 text-left font-semibold">Contenus facturés</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Sous-total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--color-border)">
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-2.5">
                      <p className="truncate font-medium text-(--color-ink)">{r.titre}</p>
                      {r.decouverte && <span className="text-[11px] text-(--color-ink-muted)">Découverte · fiche seule</span>}
                    </td>
                    <td className="hidden px-4 py-2.5 text-(--color-ink-soft) sm:table-cell">{r.matiere}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex flex-wrap gap-1">
                        {r.items.map((it) => (
                          <span key={it.k} className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
                            style={{ background: CAT[it.k].soft, color: CAT[it.k].color }}>
                            {CAT[it.k].short} · {it.price % 1 === 0 ? it.price : it.price.toFixed(2)} €
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-(--color-ink)">{eur(r.sub)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, strong, accent }: { label: string; value: string; strong?: boolean; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className={(strong ? 'font-semibold text-(--color-ink)' : 'text-(--color-ink-soft)')}>{label}</dt>
      <dd
        className={
          'tabular-nums ' +
          (accent ? 'font-semibold text-[#16A34A]' : strong ? 'font-bold text-(--color-ink)' : 'text-(--color-ink)')
        }
      >
        {value}
      </dd>
    </div>
  );
}
