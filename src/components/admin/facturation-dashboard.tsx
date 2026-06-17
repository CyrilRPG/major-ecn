'use client';

import { useMemo, useState } from 'react';
import {
  Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts';
import {
  BadgePercent, ClipboardList, FileText, Layers3, type LucideIcon,
  MessageSquare, Receipt, Sparkles, TrendingDown, Wallet,
} from 'lucide-react';

export type CourseLine = {
  id: string;
  titre: string;
  matiere: string;
  fiche: boolean;
  qcm: boolean;
  flash: boolean;
  decouverte: boolean;
};

type Tarifs = { fiche: number; qcm: number; flash: number; ia: number };
type CatKey = 'fiche' | 'qcm' | 'flash' | 'ia';

const CAT: Record<CatKey, { label: string; short: string; color: string; soft: string; Icon: LucideIcon }> = {
  fiche: { label: 'Fiches', short: 'Fiche', color: '#2563EB', soft: 'rgba(37,99,235,0.12)', Icon: FileText },
  qcm: { label: 'QCM + DP', short: 'QCM', color: '#F59E0B', soft: 'rgba(245,158,11,0.14)', Icon: ClipboardList },
  flash: { label: 'Flashcards', short: 'Flashcards', color: '#E4002B', soft: 'rgba(228,0,43,0.12)', Icon: Layers3 },
  ia: { label: 'Réponses IA', short: 'IA', color: '#8B5CF6', soft: 'rgba(139,92,246,0.14)', Icon: MessageSquare },
};

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
  lines, aiResponses, tarifs,
}: { lines: CourseLine[]; aiResponses: number; tarifs: Tarifs }) {
  const [sel, setSel] = useState<CatKey | null>(null);

  const data = useMemo(() => {
    const counts = {
      fiche: lines.filter((l) => l.fiche).length,
      qcm: lines.filter((l) => l.qcm).length,
      flash: lines.filter((l) => l.flash).length,
      ia: aiResponses,
    };
    const totals = {
      fiche: counts.fiche * tarifs.fiche,
      qcm: counts.qcm * tarifs.qcm,
      flash: counts.flash * tarifs.flash,
      ia: counts.ia * tarifs.ia,
    };
    const grand = totals.fiche + totals.qcm + totals.flash + totals.ia;

    // Coût par collège (pour analyse).
    const byCollege = new Map<string, number>();
    for (const l of lines) {
      const c =
        (l.fiche ? tarifs.fiche : 0) +
        (l.qcm ? tarifs.qcm : 0) +
        (l.flash ? tarifs.flash : 0);
      byCollege.set(l.matiere, (byCollege.get(l.matiere) ?? 0) + c);
    }
    if (totals.ia > 0) byCollege.set('Réponses IA', (byCollege.get('Réponses IA') ?? 0) + totals.ia);

    return { counts, totals, grand, byCollege };
  }, [lines, aiResponses, tarifs]);

  const pct = remisePct(data.grand);
  const remiseEur = (data.grand * pct) / 100;
  const net = data.grand - remiseEur;
  const tarifOf: Record<CatKey, number> = { fiche: tarifs.fiche, qcm: tarifs.qcm, flash: tarifs.flash, ia: tarifs.ia };

  const pieData = (['fiche', 'qcm', 'flash', 'ia'] as CatKey[])
    .map((k) => ({ key: k, name: CAT[k].label, value: data.totals[k], color: CAT[k].color }))
    .filter((d) => d.value > 0);

  const barData = Array.from(data.byCollege.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Courses du tableau selon la catégorie sélectionnée.
  const rows = useMemo(() => {
    if (sel === 'ia') return [];
    const keep = (l: CourseLine) =>
      sel === null ? l.fiche || l.qcm || l.flash : sel === 'fiche' ? l.fiche : sel === 'qcm' ? l.qcm : l.flash;
    return lines
      .filter(keep)
      .map((l) => {
        const items: { k: CatKey; price: number }[] = [];
        if ((sel === null || sel === 'fiche') && l.fiche) items.push({ k: 'fiche', price: tarifs.fiche });
        if ((sel === null || sel === 'qcm') && l.qcm) items.push({ k: 'qcm', price: tarifs.qcm });
        if ((sel === null || sel === 'flash') && l.flash) items.push({ k: 'flash', price: tarifs.flash });
        return { ...l, items, sub: items.reduce((s, i) => s + i.price, 0) };
      })
      .sort((a, b) => a.matiere.localeCompare(b.matiere) || a.titre.localeCompare(b.titre));
  }, [lines, sel, tarifs]);

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
            Analyse des coûts du contenu disponible. Périmètre : Cardiologie, Découverte et Médecine générale (voie
            interne). Fiche 10 € · QCM + DP 3 € · Flashcards 5 € · Réponse IA 0,10 €.
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
      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {(['fiche', 'qcm', 'flash', 'ia'] as CatKey[]).map((k) => {
          const c = CAT[k];
          const active = sel === k;
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
                <span className="text-[11px] font-semibold tabular-nums text-(--color-ink-muted)">
                  {data.counts[k]} {k === 'ia' ? 'rép.' : 'cours'} · {tarifOf[k] % 1 === 0 ? tarifOf[k] : tarifOf[k].toFixed(2)} €
                </span>
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
                  formatter={(v: number, n) => [eur(v), n as string]}
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
            {(['fiche', 'qcm', 'flash', 'ia'] as CatKey[]).map((k) => (
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
                <Tooltip formatter={(v: number) => [eur(v), 'Coût']} cursor={{ fill: 'rgba(0,0,0,0.04)' }}
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
            {sel === null ? 'Détail par cours' : sel === 'ia' ? 'Réponses de l’assistant IA' : `Cours facturés — ${CAT[sel].label}`}
          </h3>
          <span className="text-xs text-(--color-ink-soft)">
            {sel === 'ia' ? `${aiResponses} réponse${aiResponses > 1 ? 's' : ''}` : `${rows.length} cours`}
          </span>
        </div>

        {sel === 'ia' ? (
          <div className="px-5 py-10 text-center text-sm text-(--color-ink-soft)">
            <MessageSquare className="mx-auto mb-2 h-6 w-6 text-(--color-ink-muted)" />
            {aiResponses} réponse{aiResponses > 1 ? 's' : ''} de l’assistant IA facturée{aiResponses > 1 ? 's' : ''} à 0,10 € —
            soit <span className="font-semibold text-(--color-ink)">{eur(data.totals.ia)}</span>.
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
                            {CAT[it.k].short} · {it.price} €
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
