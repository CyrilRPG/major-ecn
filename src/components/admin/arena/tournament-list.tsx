'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Copy, Eye, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createTournament, duplicateTournament } from '@/app/admin/arena/actions';
import type { TournamentStatus } from '@/lib/arena/time';

export type TournamentListRow = {
  id: string; slug: string; title: string; specialty: string; edition: string;
  status: TournamentStatus; statusLabel: string; openRound: number | null;
  rounds: number; firstOpen: string | null; registered: number; confirmed: number; indexable: boolean;
};

const STATUS_CLASS: Record<TournamentStatus, string> = {
  draft: 'bg-gray-100 text-gray-700',
  scheduled: 'bg-blue-50 text-blue-700',
  registration_open: 'bg-emerald-50 text-emerald-700',
  round_open: 'bg-red-50 text-red-700',
  round_closed: 'bg-amber-50 text-amber-700',
  finished: 'bg-slate-100 text-slate-700',
  archived: 'bg-gray-100 text-gray-500',
};

const fmt = (iso: string | null) => (iso ? new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' }).format(new Date(iso)) : '—');

export function TournamentList({ rows, specialties }: { rows: TournamentListRow[]; specialties: { id: string | null; name: string }[] }) {
  const router = useRouter();
  const [mode, setMode] = useState<null | { kind: 'create' } | { kind: 'duplicate'; from: TournamentListRow }>(null);
  const [title, setTitle] = useState('');
  const [specialty, setSpecialty] = useState(specialties[0]?.name ?? '');
  const [edition, setEdition] = useState('');
  const [slug, setSlug] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const open = (m: NonNullable<typeof mode>) => {
    setMode(m);
    setError(null);
    if (m.kind === 'duplicate') {
      setTitle(`${m.from.title} (copie)`);
      setSpecialty(m.from.specialty);
      setEdition('');
      setSlug('');
    } else {
      setTitle('');
      setEdition('Édition 1');
      setSlug('');
    }
  };

  const submit = () => {
    if (!mode) return;
    setError(null);
    start(async () => {
      const spec = specialties.find((s) => s.name === specialty);
      const r = mode.kind === 'create'
        ? await createTournament({ title, specialty, specialty_id: spec?.id ?? null, edition_label: edition, slug: slug || undefined, rounds: 3 })
        : await duplicateTournament(mode.from.id, { title, specialty, edition_label: edition, slug: slug || undefined });
      if (!r.ok) { setError(r.error); return; }
      setMode(null);
      router.push(`/admin/arena/${r.id}`);
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button onClick={() => open({ kind: 'create' })}><Plus className="mr-1.5 h-4 w-4" /> Nouveau tournoi</Button>
      </div>

      {mode && (
        <div className="rounded-(--radius-card) border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-soft)">
          <h2 className="text-base font-bold text-(--color-ink)">{mode.kind === 'create' ? 'Nouveau tournoi' : `Dupliquer « ${mode.from.title} »`}</h2>
          {mode.kind === 'duplicate' && (
            <p className="mt-1 text-xs text-(--color-ink-soft)">Repris : règles, barèmes, séquence d’emails, durées, fenêtres, Meilleurs scores, avertissements, structure des manches. Jamais repris : inscrits, réponses, scores, dates, questions. Le tournoi dupliqué démarre en brouillon.</p>
          )}
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label htmlFor="t-title">Titre</Label><Input id="t-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="EVC Arena Médecine interne" /></div>
            <div className="space-y-1.5">
              <Label htmlFor="t-spe">Spécialité</Label>
              <select id="t-spe" value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="h-10 w-full rounded-(--radius-button) border border-(--color-border) bg-(--color-surface) px-3 text-sm">
                {specialties.map((s) => <option key={s.name} value={s.name}>{s.name}</option>)}
                {!specialties.some((s) => s.name === specialty) && <option value={specialty}>{specialty}</option>}
              </select>
            </div>
            <div className="space-y-1.5"><Label htmlFor="t-ed">Édition (libellé)</Label><Input id="t-ed" value={edition} onChange={(e) => setEdition(e.target.value)} placeholder="Édition 1" /></div>
            <div className="space-y-1.5"><Label htmlFor="t-slug">URL (slug, facultatif)</Label><Input id="t-slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="medecine-interne-edition-1" /></div>
          </div>
          {error && <p className="mt-3 text-sm font-semibold text-(--color-danger)">{error}</p>}
          <div className="mt-4 flex gap-2">
            <Button onClick={submit} disabled={pending || title.trim().length < 3}>{pending ? 'Création…' : mode.kind === 'create' ? 'Créer le brouillon' : 'Dupliquer'}</Button>
            <Button variant="ghost" onClick={() => setMode(null)}>Annuler</Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-(--radius-card) border border-(--color-border) bg-(--color-surface) shadow-(--shadow-soft)">
        <table className="w-full text-sm">
          <thead className="bg-(--color-surface-soft) text-left text-xs uppercase tracking-wide text-(--color-ink-muted)">
            <tr>
              <th className="px-4 py-3">Tournoi</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Manches</th>
              <th className="px-4 py-3">M1</th>
              <th className="px-4 py-3">Inscrits</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-(--color-ink-soft)">Aucun tournoi. Créez le premier brouillon.</td></tr>}
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-(--color-border)">
                <td className="px-4 py-3">
                  <Link href={`/admin/arena/${r.id}`} className="font-semibold text-(--color-ink) hover:underline">{r.title}</Link>
                  <div className="text-xs text-(--color-ink-soft)">{r.specialty}{r.edition ? ` · ${r.edition}` : ''} · /arena/{r.slug}{r.indexable ? ' · indexable' : ''}</div>
                </td>
                <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_CLASS[r.status]}`}>{r.statusLabel}{r.openRound ? ` (M${r.openRound})` : ''}</span></td>
                <td className="px-4 py-3">{r.rounds}</td>
                <td className="px-4 py-3 whitespace-nowrap">{fmt(r.firstOpen)}</td>
                <td className="px-4 py-3">{r.registered} <span className="text-xs text-(--color-ink-muted)">({r.confirmed} confirmés)</span></td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => open({ kind: 'duplicate', from: r })} title="Dupliquer"><Copy className="h-4 w-4" /></Button>
                    <Link href={`/arena/${r.slug}`} target="_blank" title="Voir la landing (visible du personnel à tout statut)"><Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button></Link>
                    <Link href={`/admin/arena/${r.id}`}><Button variant="outline" size="sm">Gérer</Button></Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
