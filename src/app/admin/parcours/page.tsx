import Link from 'next/link';
import { CalendarClock, ChevronRight, Trophy } from 'lucide-react';
import { requireAdmin } from '@/lib/auth/require-role';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatOuverture } from '@/lib/parcours/parcours';

export const metadata = { title: 'Parcours du Major' };
export const dynamic = 'force-dynamic';

export default async function AdminParcoursPage() {
  await requireAdmin();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any;

  const { data: rows } = await admin
    .from('major_parcours')
    .select('id, numero, titre, sous_titre, available_at, active, major_parcours_questions(count)')
    .order('numero', { ascending: true });

  type Row = {
    id: string; numero: number; titre: string; sous_titre: string | null;
    available_at: string; active: boolean;
    major_parcours_questions?: { count: number }[];
  };
  const parcours = (rows ?? []) as Row[];
  const now = new Date().getTime();

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <header className="mb-8 border-b border-(--color-border) pb-5">
        <p className="text-xs font-medium text-(--color-ink-muted)">Administration · Pédagogie</p>
        <h1 className="mt-1 flex items-center gap-2 text-xl font-semibold tracking-tight text-(--color-ink)">
          <Trophy className="h-5 w-5" style={{ color: '#B8860B' }} /> Parcours du Major
        </h1>
        <p className="mt-0.5 text-sm text-(--color-ink-soft)">
          {parcours.length} parcours. Deux s’ouvrent chaque lundi 10h ; les deux premiers sont
          ouverts dès maintenant. Réglez le contenu, les questions et la date d’ouverture de chacun.
          L’onglet élève est réservé aux admins pour l’instant.
        </p>
      </header>

      <ul className="space-y-2">
        {parcours.map((p) => {
          const nbQ = p.major_parcours_questions?.[0]?.count ?? 0;
          const future = new Date(p.available_at).getTime() > now;
          return (
            <li key={p.id}>
              <Link
                href={`/admin/parcours/${p.id}`}
                className="flex items-center gap-3 rounded-xl border border-(--color-border) bg-(--color-surface) px-4 py-3 transition-colors hover:bg-(--color-sand-100)"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-black" style={{ background: '#FFF7E0', color: '#B8860B' }}>
                  {p.numero}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-(--color-ink)">
                    {p.titre}
                    {!p.active && <span className="ml-2 rounded bg-(--color-surface-soft) px-1.5 py-0.5 text-[10px] font-semibold text-(--color-ink-muted)">Masqué</span>}
                  </p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11.5px] text-(--color-ink-muted)">
                    <span className="inline-flex items-center gap-1">
                      <CalendarClock className="h-3 w-3" />
                      {future ? 'Ouvre ' : 'Ouvert · '}{formatOuverture(p.available_at)}
                    </span>
                    <span>{nbQ} question{nbQ > 1 ? 's' : ''}</span>
                    {future && <span className="rounded-full bg-[#FEF3C7] px-1.5 text-[10px] font-bold text-[#B8860B]">À venir</span>}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-(--color-ink-muted)" />
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
