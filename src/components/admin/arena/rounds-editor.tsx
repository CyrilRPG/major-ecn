'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { publishRoundResults, updateRound } from '@/app/admin/arena/actions';
import type { RoundRow, TournamentRow } from '@/lib/arena/types';

/**
 * Manches (§2.1, §12) : dates libres et indépendantes, durée, délai de
 * publication, contenu éditorial des corrections (encadré méthodo, erreurs
 * fréquentes, références) et PDF.
 *
 * Les dates sont saisies en heure de Paris (§5.1) et stockées en UTC.
 */

/** ISO UTC → valeur `datetime-local` en heure de Paris. */
function toParisLocal(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '00';
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
}

/** `datetime-local` (heure de Paris) → ISO UTC, DST compris. */
function fromParisLocal(local: string): string | null {
  if (!local) return null;
  const [date, time] = local.split('T');
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  // Décalage Paris/UTC à cette date : on part d'une estimation UTC et on corrige.
  const guess = Date.UTC(y, m - 1, d, hh, mm);
  const offset = (dt: number) => {
    const p = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Paris', hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).formatToParts(new Date(dt));
    const g = (t: string) => Number(p.find((x) => x.type === t)?.value ?? 0);
    const asUtc = Date.UTC(g('year'), g('month') - 1, g('day'), g('hour') % 24, g('minute'));
    return asUtc - dt;
  };
  let utc = guess - offset(guess);
  utc = guess - offset(utc);
  return new Date(utc).toISOString();
}

export function RoundsEditor({ t, rounds, slug, questionCounts, hasAttempts }: { t: TournamentRow; rounds: RoundRow[]; slug: string; questionCounts: Record<string, number>; hasAttempts: Record<string, boolean> }) {
  return (
    <div className="space-y-6">
      {rounds.map((r) => (
        <RoundCard key={r.id} t={t} r={r} slug={slug} count={questionCounts[r.id] ?? 0} started={hasAttempts[r.id] ?? false} />
      ))}
    </div>
  );
}

function RoundCard({ t, r, slug, count, started }: { t: TournamentRow; r: RoundRow; slug: string; count: number; started: boolean }) {
  const router = useRouter();
  const [form, setForm] = useState({
    theme: r.theme, opens: toParisLocal(r.opens_at), closes: toParisLocal(r.closes_at), duration: r.duration_minutes ?? '',
    delay: r.results_publish_delay_minutes, intro: r.corrections_intro, methodo: r.corrections_methodo, errors: r.corrections_errors, refs: r.corrections_references,
  });
  const [force, setForce] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const locked = t.status !== 'draft' && t.status !== 'scheduled';

  const save = () => {
    setMsg(null); setError(null);
    start(async () => {
      const res = await updateRound(r.id, {
        theme: form.theme,
        opens_at: fromParisLocal(form.opens),
        closes_at: fromParisLocal(form.closes),
        duration_minutes: form.duration === '' ? null : Number(form.duration),
        results_publish_delay_minutes: Number(form.delay) || 0,
        corrections_intro: form.intro, corrections_methodo: form.methodo, corrections_errors: form.errors, corrections_references: form.refs,
        force,
      });
      if (res.ok) { setMsg('Enregistré.'); setForce(false); router.refresh(); } else setError(res.error);
    });
  };

  const fillWindow = () => {
    if (!form.opens) return;
    const o = new Date(fromParisLocal(form.opens) as string);
    setForm((f) => ({ ...f, closes: toParisLocal(new Date(o.getTime() + 24 * 3600 * 1000).toISOString()) }));
  };

  return (
    <section className="rounded-(--radius-card) border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-soft)">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-(--color-ink)">Manche {r.number}</h3>
          <p className="text-xs text-(--color-ink-soft)">
            {count} / {t.questions_per_round} questions · {r.bareme_locked_at ? 'barème verrouillé' : 'barème du tournoi'} · {r.results_published_at ? 'résultats publiés' : 'résultats non publiés'}{started ? ' · a des participants' : ''}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/arena/${slug}/manche/${r.number}?preview=1`} target="_blank"><Button variant="outline" size="sm">Prévisualiser en candidat ↗</Button></Link>
          {r.closes_at && new Date(r.closes_at) < new Date() && !r.results_published_at && (
            <Button size="sm" disabled={pending} onClick={() => start(async () => { const res = await publishRoundResults(r.id); if (!res.ok) setError(res.error); router.refresh(); })}>Publier les résultats maintenant</Button>
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1.5 lg:col-span-2"><Label htmlFor={`th-${r.id}`}>Thème</Label><Input id={`th-${r.id}`} value={form.theme} onChange={(e) => setForm((f) => ({ ...f, theme: e.target.value }))} placeholder="Vascularites et maladies systémiques" /></div>
        <div className="space-y-1.5"><Label htmlFor={`op-${r.id}`}>Ouverture (heure de Paris)</Label><Input id={`op-${r.id}`} type="datetime-local" value={form.opens} onChange={(e) => setForm((f) => ({ ...f, opens: e.target.value }))} /></div>
        <div className="space-y-1.5">
          <Label htmlFor={`cl-${r.id}`}>Clôture (heure de Paris)</Label>
          <div className="flex gap-2">
            <Input id={`cl-${r.id}`} type="datetime-local" value={form.closes} onChange={(e) => setForm((f) => ({ ...f, closes: e.target.value }))} />
            <Button type="button" variant="ghost" size="sm" onClick={fillWindow} title="Ouverture + 24 h">+24 h</Button>
          </div>
        </div>
        <div className="space-y-1.5"><Label htmlFor={`du-${r.id}`}>Durée (min)</Label><Input id={`du-${r.id}`} type="number" min={1} max={240} value={form.duration} placeholder={String(t.round_duration_minutes)} onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))} /></div>
        <div className="space-y-1.5"><Label htmlFor={`de-${r.id}`}>Publication des résultats (min après clôture)</Label><Input id={`de-${r.id}`} type="number" min={0} value={form.delay} onChange={(e) => setForm((f) => ({ ...f, delay: Number(e.target.value) || 0 }))} /></div>
      </div>

      <details className="mt-4">
        <summary className="cursor-pointer text-sm font-semibold text-(--color-ink)">Contenu des corrections (§12.1)</summary>
        <div className="mt-3 grid gap-4">
          <div className="space-y-1.5"><Label htmlFor={`ci-${r.id}`}>Introduction</Label><Textarea id={`ci-${r.id}`} rows={2} value={form.intro} onChange={(e) => setForm((f) => ({ ...f, intro: e.target.value }))} /></div>
          <div className="space-y-1.5"><Label htmlFor={`cm-${r.id}`}>Encadré méthodologique sur le thème</Label><Textarea id={`cm-${r.id}`} rows={4} value={form.methodo} onChange={(e) => setForm((f) => ({ ...f, methodo: e.target.value }))} /></div>
          <div className="space-y-1.5"><Label htmlFor={`ce-${r.id}`}>Erreurs les plus fréquentes (qualitatif, sans effectif ni pourcentage)</Label><Textarea id={`ce-${r.id}`} rows={3} value={form.errors} onChange={(e) => setForm((f) => ({ ...f, errors: e.target.value }))} /></div>
          <div className="space-y-1.5"><Label htmlFor={`cr-${r.id}`}>Références officielles</Label><Textarea id={`cr-${r.id}`} rows={2} value={form.refs} onChange={(e) => setForm((f) => ({ ...f, refs: e.target.value }))} /></div>
        </div>
      </details>

      {locked && (
        <label className="mt-4 flex items-center gap-2 text-sm text-(--color-danger)">
          <input type="checkbox" checked={force} onChange={(e) => setForce(e.target.checked)} />
          Forcer la modification des dates (inscriptions ouvertes) — tracée, les inscrits seront informés par email.
        </label>
      )}
      {error && <p className="mt-3 text-sm font-semibold text-(--color-danger)">{error}</p>}
      <div className="mt-4 flex items-center gap-3">
        <Button onClick={save} disabled={pending}>{pending ? 'Enregistrement…' : 'Enregistrer la manche'}</Button>
        {msg && <span className="text-sm font-semibold text-emerald-700">{msg}</span>}
      </div>
    </section>
  );
}
