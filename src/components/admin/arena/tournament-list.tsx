'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CalendarClock, Copy, ExternalLink, Layers, Plus, Trophy, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createTournament, duplicateTournament } from '@/app/admin/arena/actions';
import type { TournamentStatus } from '@/lib/arena/time';
import { ADMIN_ARENA, ADMIN_DISPLAY, ArenaCard, GoldBadge, SectionLabel, StatusPill } from './admin-ui';

export type TournamentListRow = {
  id: string; slug: string; title: string; specialty: string; edition: string;
  status: TournamentStatus; statusLabel: string; openRound: number | null;
  rounds: number; datedRounds: number; firstOpen: string | null; registered: number; confirmed: number; indexable: boolean;
  questionsPerRound: number;
};

const STATUS_TONE: Record<TournamentStatus, 'muted' | 'ok' | 'red' | 'gold' | 'blue' | 'amber'> = {
  draft: 'muted', scheduled: 'blue', registration_open: 'ok', round_open: 'red', round_closed: 'amber', finished: 'gold', archived: 'muted',
};

const fmt = (iso: string | null) => (iso ? new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' }).format(new Date(iso)) : 'non datée');
const selectClass = 'h-10 w-full rounded-(--radius-button) border border-(--color-border) bg-(--color-surface) px-3 text-sm text-(--color-ink)';

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
    <div className="space-y-6">
      {!mode && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-(--color-ink-soft)">{rows.length === 0 ? 'Aucun tournoi : créez le premier brouillon.' : `${rows.length} tournoi${rows.length > 1 ? 's' : ''}, du plus récent au plus ancien.`}</p>
          <Button onClick={() => open({ kind: 'create' })}><Plus className="h-4 w-4" /> Nouveau tournoi</Button>
        </div>
      )}

      {mode && (
        <ArenaCard
          number={mode.kind === 'create' ? '1' : <Copy className="h-4 w-4" />}
          title={mode.kind === 'create' ? 'Nouveau tournoi' : `Dupliquer « ${mode.from.title} »`}
          description={mode.kind === 'create'
            ? 'Le tournoi est créé en brouillon avec ses trois manches vides ; tout se règle ensuite depuis son parcours guidé.'
            : 'Repris : règles, barèmes, séquence d’emails, durées, fenêtres, Meilleurs scores, avertissements, structure des manches. Jamais repris : inscrits, réponses, scores, dates, questions. Le tournoi dupliqué démarre en brouillon.'}
        >
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="t-title">Titre du tournoi</Label><Input id="t-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="EVC Arena Médecine interne" autoFocus /><p className="text-xs text-(--color-ink-muted)">Affiché sur la landing, les emails et le classement.</p></div>
              <div className="space-y-1.5">
                <Label htmlFor="t-spe">Spécialité</Label>
                <select id="t-spe" value={specialty} onChange={(e) => setSpecialty(e.target.value)} className={selectClass}>
                  {specialties.map((s) => <option key={s.name} value={s.name}>{s.name}</option>)}
                  {!specialties.some((s) => s.name === specialty) && <option value={specialty}>{specialty}</option>}
                </select>
                <p className="text-xs text-(--color-ink-muted)">Présélectionne le collège lors de la pioche dans la banque.</p>
              </div>
              <div className="space-y-1.5"><Label htmlFor="t-ed">Édition (libellé)</Label><Input id="t-ed" value={edition} onChange={(e) => setEdition(e.target.value)} placeholder="Édition 1" /></div>
              <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="t-slug">Adresse (slug) <span className="font-normal text-(--color-ink-muted)">— facultatif</span></Label><Input id="t-slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="medecine-interne-edition-1" /><p className="text-xs text-(--color-ink-muted)">Déduite du titre si vide : /arena/<i>slug</i>.</p></div>
            </div>
            <aside className="rounded-(--radius-card) p-4 text-[#F2F3F5]" style={{ background: ADMIN_ARENA.bg, boxShadow: 'inset 0 0 0 1px rgba(212,169,74,0.35)' }}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ fontFamily: ADMIN_DISPLAY, color: ADMIN_ARENA.gold }}>Format EVC Arena</p>
              <ul className="mt-3 space-y-2.5 text-sm">
                <li className="flex items-center gap-3"><GoldBadge>3</GoldBadge> manches, datées librement</li>
                <li className="flex items-center gap-3"><GoldBadge>20</GoldBadge> questions par manche</li>
                <li className="flex items-center gap-3"><GoldBadge>1</GoldBadge> tentative par participant</li>
              </ul>
              <p className="mt-3 text-[11px]" style={{ color: ADMIN_ARENA.textMuted }}>Chronomètre par question, barème QRM/QRU/QRP réglable, classement par manche puis général.</p>
            </aside>
          </div>
          {error && <p className="mt-3 rounded-(--radius-button) border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-(--color-danger)">{error}</p>}
          <div className="mt-4 flex gap-2">
            <Button onClick={submit} disabled={pending || title.trim().length < 3}>{pending ? 'Création…' : mode.kind === 'create' ? 'Créer le brouillon' : 'Dupliquer'}</Button>
            <Button variant="ghost" onClick={() => setMode(null)}>Annuler</Button>
          </div>
        </ArenaCard>
      )}

      {rows.length > 0 && <SectionLabel>Tournois</SectionLabel>}
      <ul className="grid gap-4 md:grid-cols-2">
        {rows.map((r) => (
          <li key={r.id} className="flex flex-col overflow-hidden rounded-(--radius-card) border border-(--color-border) bg-(--color-surface) shadow-(--shadow-soft) transition-shadow hover:shadow-(--shadow-lifted)">
            <div className="flex items-start justify-between gap-3 px-5 pt-4">
              <div className="min-w-0">
                <Link href={`/admin/arena/${r.id}`} className="block truncate text-xl uppercase leading-tight text-(--color-ink) hover:underline" style={{ fontFamily: ADMIN_DISPLAY, fontWeight: 600, letterSpacing: '0.03em' }}>{r.title}</Link>
                <p className="mt-0.5 text-xs text-(--color-ink-soft)">{r.specialty}{r.edition ? ` · ${r.edition}` : ''} · <span className="font-mono">/arena/{r.slug}</span>{r.indexable ? ' · indexable' : ''}</p>
              </div>
              <StatusPill tone={STATUS_TONE[r.status]}>{r.statusLabel}{r.openRound ? ` · M${r.openRound}` : ''}</StatusPill>
            </div>
            <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-(--color-border) bg-(--color-surface-soft) px-5 py-3 text-xs">
              <div className="flex items-center gap-2"><Layers className="h-4 w-4 text-(--color-ink-muted)" /><div><dt className="text-(--color-ink-muted)">Manches</dt><dd className="font-semibold text-(--color-ink)">{r.datedRounds}/{r.rounds} datées</dd></div></div>
              <div className="flex items-center gap-2"><CalendarClock className="h-4 w-4 text-(--color-ink-muted)" /><div><dt className="text-(--color-ink-muted)">Manche 1</dt><dd className="font-semibold text-(--color-ink)">{fmt(r.firstOpen)}</dd></div></div>
              <div className="flex items-center gap-2"><Users className="h-4 w-4 text-(--color-ink-muted)" /><div><dt className="text-(--color-ink-muted)">Inscrits</dt><dd className="font-semibold text-(--color-ink)">{r.registered} <span className="font-normal text-(--color-ink-muted)">({r.confirmed} confirmés)</span></dd></div></div>
            </dl>
            <div className="mt-auto flex flex-wrap items-center justify-end gap-1 px-4 py-3">
              <Button variant="ghost" size="sm" onClick={() => open({ kind: 'duplicate', from: r })}><Copy className="h-4 w-4" /> Dupliquer</Button>
              <Button asChild variant="ghost" size="sm"><Link href={`/arena/${r.slug}`} target="_blank" title="Visible du personnel à tout statut"><ExternalLink className="h-4 w-4" /> Voir la landing</Link></Button>
              <Button asChild size="sm"><Link href={`/admin/arena/${r.id}`}><Trophy className="h-4 w-4" /> Gérer</Link></Button>
            </div>
          </li>
        ))}
        {rows.length === 0 && !mode && (
          <li className="rounded-(--radius-card) border border-dashed border-(--color-border-strong) bg-(--color-surface) px-6 py-12 text-center md:col-span-2">
            <p className="text-lg uppercase text-(--color-ink)" style={{ fontFamily: ADMIN_DISPLAY, fontWeight: 600, letterSpacing: '0.05em' }}>Aucun tournoi</p>
            <p className="mt-1 text-sm text-(--color-ink-soft)">Créez un brouillon, puis suivez le parcours guidé : paramètres, manches, questions, corrigés, publication.</p>
            <Button className="mt-4" onClick={() => open({ kind: 'create' })}><Plus className="h-4 w-4" /> Nouveau tournoi</Button>
          </li>
        )}
      </ul>
    </div>
  );
}
