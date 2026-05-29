import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowRight, Award, BookOpen, Calendar, ClipboardCheck, FileText, Sparkles, Trophy } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { canAccessCollege, parseScope } from '@/lib/auth/permissions';

export const metadata = { title: 'Annales EVC' };

type Row = { id: string; annee: number; type: 'EVCF' | 'EVCP'; label: string; corrige_path: string | null };

export default async function AnnalesIndexPage({ params }: { params: Promise<{ matiere: string }> }) {
  const { matiere } = await params;
  const { profile } = await requireUser();
  const supabase = await createClient();

  const { data: m } = await supabase.from('matieres').select('id, nom').eq('id', matiere).maybeSingle();
  if (!m) notFound();
  if (!canAccessCollege(parseScope(profile.permission_scope), m.id)) redirect('/facultes');

  const { data: rowsRaw } = await supabase
    .from('medgen_annales')
    .select('id, annee, type, label, corrige_path')
    .order('annee', { ascending: false });
  const rows = (rowsRaw ?? []) as Row[];

  const yearsMap = new Map<number, Row[]>();
  for (const r of rows) {
    if (!yearsMap.has(r.annee)) yearsMap.set(r.annee, []);
    yearsMap.get(r.annee)!.push(r);
  }
  const years = [...yearsMap.entries()].sort(([a], [b]) => b - a);
  const totalSujets = rows.length;
  const totalAnnees = years.length;
  const latestYear = years[0]?.[0];

  // Couleur subtilement différente par tranche d'années (plus récente
  // = plus saturée), pour donner du rythme visuel à la liste.
  const yearTheme = (idx: number) => {
    const palettes = [
      { ribbon: 'linear-gradient(180deg,#E4002B 0%,#F97316 100%)', tile: '#FDE7E9', text: '#C0001F', dot: '#E4002B' },
      { ribbon: 'linear-gradient(180deg,#7C3AED 0%,#A855F7 100%)', tile: '#F1E8FD', text: '#5B2BB8', dot: '#7C3AED' },
      { ribbon: 'linear-gradient(180deg,#2563EB 0%,#06B6D4 100%)', tile: '#E5F1FF', text: '#1E4D8B', dot: '#2563EB' },
      { ribbon: 'linear-gradient(180deg,#16A34A 0%,#84CC16 100%)', tile: '#E7F6EC', text: '#16793C', dot: '#16A34A' },
      { ribbon: 'linear-gradient(180deg,#D97706 0%,#F59E0B 100%)', tile: '#FEF3E2', text: '#B26A00', dot: '#D97706' },
      { ribbon: 'linear-gradient(180deg,#0EA5E9 0%,#3B82F6 100%)', tile: '#E0F2FE', text: '#0369A1', dot: '#0EA5E9' },
    ];
    return palettes[idx % palettes.length];
  };

  const typeTheme = (type: 'EVCF' | 'EVCP') =>
    type === 'EVCF'
      ? { Icon: BookOpen,       bg: '#E5F1FF', fg: '#1E4D8B', sub: '#BBD7F7', title: 'Connaissances fondamentales' }
      : { Icon: ClipboardCheck, bg: '#E0F2EF', fg: '#0F6F66', sub: '#BADFD8', title: 'Connaissances pratiques' };

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-7 lg:px-8">
      {/* ─────────────── Hero ─────────────── */}
      <section
        className="relative overflow-hidden rounded-3xl border border-(--color-border) p-7 shadow-(--shadow-soft) sm:p-9"
        style={{
          background:
            'linear-gradient(135deg, #FFFFFF 0%, #FFF3F4 40%, #F0EAFF 75%, #E3EFFF 100%)',
        }}
      >
        {/* Décorations : cercles flous colorés pour donner de la profondeur. */}
        <span aria-hidden className="pointer-events-none absolute -right-16 -top-12 h-56 w-56 rounded-full bg-[#E4002B] opacity-[0.08] blur-3xl" />
        <span aria-hidden className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-[#7C3AED] opacity-[0.08] blur-3xl" />
        <span aria-hidden className="pointer-events-none absolute bottom-10 right-20 h-32 w-32 rounded-full bg-[#0EA5E9] opacity-[0.10] blur-2xl" />

        <div className="relative grid gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-(--color-primary) backdrop-blur">
              <Trophy className="h-3.5 w-3.5" />
              {m.nom} · Annales officielles
            </span>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-(--color-ink) sm:text-4xl">
              Annales EVC
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-(--color-ink-soft) sm:text-base">
              Toutes les sessions précédentes en conditions concours, avec sujet et
              corrigé. Chaque annale est rejouée à l’identique pour t’entraîner
              comme le jour J.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-(--color-ink) shadow-(--shadow-soft)">
                <Sparkles className="h-3.5 w-3.5 text-(--color-primary)" />
                Sujets + corrigés détaillés
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-(--color-ink) shadow-(--shadow-soft)">
                <FileText className="h-3.5 w-3.5 text-[#7C3AED]" />
                Format EVC respecté
              </span>
            </div>
          </div>

          {/* Stats à droite — 3 mini KPIs dans des cartes blanches floues. */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 lg:grid-cols-1">
            {[
              { Icon: Calendar, value: totalAnnees, label: 'années couvertes', accent: '#E4002B', bg: '#FDE7E9' },
              { Icon: FileText, value: totalSujets, label: 'sujets disponibles', accent: '#7C3AED', bg: '#F1E8FD' },
              { Icon: Award,    value: latestYear ?? '—', label: 'session la plus récente', accent: '#16A34A', bg: '#E7F6EC' },
            ].map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/85 px-3 py-2.5 shadow-(--shadow-soft) backdrop-blur"
              >
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: s.bg, color: s.accent }}
                >
                  <s.Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xl font-bold leading-none tabular-nums" style={{ color: s.accent }}>
                    {s.value}
                  </p>
                  <p className="mt-1 text-[10px] leading-tight text-(--color-ink-muted) sm:text-[11px]">
                    {s.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────── Frise des années ─────────────── */}
      {years.length > 0 && (
        <div className="mt-7 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-(--color-ink-muted)">
            Sessions :
          </span>
          {years.map(([year], idx) => {
            const t = yearTheme(idx);
            return (
              <a
                key={year}
                href={`#session-${year}`}
                className="rounded-full px-3 py-1 text-xs font-semibold tabular-nums transition-transform hover:scale-105"
                style={{ background: t.tile, color: t.text }}
              >
                {year}
              </a>
            );
          })}
        </div>
      )}

      {/* ─────────────── Liste des sessions ─────────────── */}
      <div className="mt-6 space-y-5">
        {years.map(([year, items], idx) => {
          const t = yearTheme(idx);
          return (
            <section
              key={year}
              id={`session-${year}`}
              className="group relative overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface) shadow-(--shadow-soft) transition-shadow hover:shadow-(--shadow-lifted)"
            >
              {/* Ruban vertical coloré à gauche — distinct par tranche d'année. */}
              <span aria-hidden className="absolute inset-y-0 left-0 w-1.5" style={{ background: t.ribbon }} />

              <header
                className="flex items-center justify-between gap-3 border-b border-(--color-border) px-5 py-4"
                style={{
                  background:
                    `linear-gradient(90deg, ${t.tile} 0%, transparent 70%)`,
                }}
              >
                <div className="flex items-center gap-3.5">
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-2xl font-mono text-base font-bold text-white shadow-(--shadow-soft)"
                    style={{ background: t.ribbon }}
                  >
                    {String(year).slice(-2)}
                  </span>
                  <div>
                    <p className="text-lg font-bold text-(--color-ink)">Session {year}</p>
                    <p className="text-xs text-(--color-ink-muted)">
                      {items.length} épreuve{items.length > 1 ? 's' : ''} · format officiel EVC
                    </p>
                  </div>
                </div>
                {year === latestYear && (
                  <span
                    className="hidden rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-(--shadow-soft) sm:inline-flex"
                    style={{ background: t.ribbon }}
                  >
                    Récente
                  </span>
                )}
              </header>

              <ul className="divide-y divide-(--color-border)">
                {items.map((it) => {
                  const tt = typeTheme(it.type);
                  return (
                    <li
                      key={it.id}
                      className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-(--color-sand-100)"
                    >
                      <span
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                        style={{ background: tt.bg, color: tt.fg }}
                      >
                        <tt.Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-bold text-(--color-ink)">
                            {tt.title}
                          </p>
                          <span
                            className="rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                            style={{ background: tt.sub, color: tt.fg }}
                          >
                            {it.type}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-(--color-ink-soft)">
                          {it.corrige_path
                            ? 'Sujet + corrigé disponibles'
                            : 'Sujet disponible · corrigé à venir'}
                        </p>
                      </div>
                      <Link
                        href={`/matieres/${matiere}/annales/${it.id}`}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[linear-gradient(90deg,#E4002B_0%,#F97316_100%)] px-3.5 py-2 text-xs font-semibold text-white shadow-(--shadow-soft) transition-transform hover:scale-105"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        Ouvrir
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}

        {years.length === 0 && (
          <div className="rounded-2xl border border-dashed border-(--color-border) bg-(--color-surface)/50 px-6 py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-(--color-primary-soft) text-(--color-primary)">
              <FileText className="h-6 w-6" />
            </div>
            <p className="mt-3 text-sm font-medium text-(--color-ink)">
              Aucune annale disponible pour le moment
            </p>
            <p className="mt-1 text-xs text-(--color-ink-muted)">
              Les sessions seront publiées progressivement.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
