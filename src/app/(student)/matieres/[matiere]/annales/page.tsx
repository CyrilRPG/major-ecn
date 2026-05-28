import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowRight, BookOpen, ClipboardCheck, FileText } from 'lucide-react';
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

  // Regroupement par année (Set pour récup des années distinctes triées desc)
  const yearsMap = new Map<number, Row[]>();
  for (const r of rows) {
    if (!yearsMap.has(r.annee)) yearsMap.set(r.annee, []);
    yearsMap.get(r.annee)!.push(r);
  }
  const years = [...yearsMap.entries()].sort(([a], [b]) => b - a);

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-7 lg:px-8">
      <header className="mb-7">
        <p className="text-xs font-medium uppercase tracking-wider text-(--color-primary)">
          {m.nom} · Annales officielles
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-(--color-ink)">Annales EVC</h1>
        <p className="mt-1 max-w-2xl text-sm text-(--color-ink-soft)">
          Tous les sujets officiels {years.length > 0 ? `${years[years.length - 1][0]} → ${years[0][0]}` : ''}.
          Sujet en PDF avec votre identité en filigrane (logo Major ECN en fond).
          Les corrigés détaillés seront publiés progressivement.
        </p>
      </header>

      <div className="space-y-4">
        {years.map(([year, items]) => (
          <section key={year} className="rounded-2xl border border-(--color-border) bg-(--color-surface) shadow-(--shadow-soft)">
            <header className="flex items-center justify-between gap-3 border-b border-(--color-border) bg-(--color-surface-soft) px-5 py-3">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-(--color-primary) font-mono text-sm font-bold text-white">
                  {String(year).slice(-2)}
                </span>
                <div>
                  <p className="font-semibold text-(--color-ink)">Session {year}</p>
                  <p className="text-xs text-(--color-ink-muted)">{items.length} épreuve{items.length > 1 ? 's' : ''}</p>
                </div>
              </div>
            </header>
            <ul className="divide-y divide-(--color-border)">
              {items.map((it) => (
                <li key={it.id} className="flex items-center gap-3 px-5 py-3">
                  <span
                    className={
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ' +
                      (it.type === 'EVCF'
                        ? 'bg-[#3B82F6]/10 text-[#3B82F6]'
                        : 'bg-[#14B8A6]/12 text-[#0F766E]')
                    }
                  >
                    {it.type === 'EVCF' ? <BookOpen className="h-4 w-4" /> : <ClipboardCheck className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-(--color-ink)">
                      {it.type === 'EVCF' ? 'Connaissances fondamentales' : 'Connaissances pratiques'}
                    </p>
                    <p className="text-xs text-(--color-ink-soft)">
                      {it.corrige_path ? 'Sujet + corrigé disponibles' : 'Sujet disponible · corrigé à venir'}
                    </p>
                  </div>
                  <Link
                    href={`/matieres/${matiere}/annales/${it.id}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-(--color-primary) px-3.5 py-2 text-xs font-semibold text-white shadow-(--shadow-soft) hover:opacity-95"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Ouvrir
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
        {years.length === 0 && (
          <div className="rounded-2xl border border-dashed border-(--color-border) px-6 py-12 text-center text-sm text-(--color-ink-muted)">
            Aucune annale disponible pour le moment.
          </div>
        )}
      </div>
    </div>
  );
}
