import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowRight, FileText } from 'lucide-react';
import { ArenaPage } from '@/components/arena/arena-shell';
import { arenaMetadata, loadArenaPage } from '@/lib/arena/page-context';
import { listAttemptsForRounds } from '@/lib/arena/db';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) {
  const ctx = await loadArenaPage((await params).slug);
  return arenaMetadata(ctx.snap, { title: 'Toutes mes corrections', noindex: true });
}
export default async function CorrectionsOverview({ params }: Props) {
  const { slug } = await params;
  const ctx = await loadArenaPage(slug);
  if (!ctx.participant) redirect('/arena/connexion');
  const played = new Set((await listAttemptsForRounds(ctx.snap.rounds.map(r => r.id))).filter(a => a.participant_id === ctx.participant!.id && a.status !== 'in_progress').map(a => a.round_id));
  return <ArenaPage nav={ctx.nav} immersive><section className="ae-document max-w-4xl mx-auto my-10 p-8">
    <h1 className="text-3xl font-bold">Toutes mes corrections</h1><p className="mt-3 mb-6">Revivez vos manches en détail et retrouvez les explications de chaque réponse.</p>
    <div className="grid gap-4">{ctx.snap.rounds.map(r => <article key={r.id} className="rounded-xl border border-slate-600 p-5"><h2 className="text-xl font-semibold">Manche {r.number} — {r.theme}</h2><p className="mt-2 text-slate-300">{played.has(r.id) ? 'Manche disputée · vos réponses sont conservées.' : 'Manche non jouée.'}</p>{r.results_published_at ? <Link className="ae-button mt-4" href={`/arena/${slug}/manche/${r.number}/corrections`}><FileText aria-hidden />Voir les corrections<ArrowRight aria-hidden /></Link> : <p className="mt-4">Les corrections seront disponibles après publication des résultats.</p>}</article>)}</div>
    <Link className="inline-block mt-6 underline" href={`/arena/${slug}/espace`}>Revenir à mon bilan</Link>
  </section></ArenaPage>;
}
