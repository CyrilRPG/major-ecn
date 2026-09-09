'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Ban, Download, MailCheck, Pencil, RotateCcw, Trash2, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { blockParticipant, deleteParticipantData, renameParticipant, resendConfirmationAdmin, resetAttempt } from '@/app/admin/arena/actions';

export type ParticipantView = {
  id: string; pseudo: string; first_name: string; last_name: string; email: string; specialty: string;
  confirmed: boolean; marketing: boolean; blocked: boolean; anonymized: boolean; source: string | null; invited: boolean;
  created_at: string; last_login_at: string | null;
  rounds: { number: number; attemptId: string | null; status: string | null; score: number | null; truncated: boolean; rank: number | null; effectifManche: number }[];
  totalScore: number; rank: number | null;
  effectifGeneral: number; reason: string | null; isFinal: boolean;
};

const fmt = (iso: string | null) => (iso ? new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' }).format(new Date(iso)) : '—');

/** Participants (§15.4) : suivi, modération, export avec filtre sur le consentement marketing (§3.1). */
export function ParticipantsTable({ tournamentId, rows }: { tournamentId: string; rows: ParticipantView[] }) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'unconfirmed' | 'marketing' | 'blocked'>('all');
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const filtered = useMemo(() => rows.filter((r) => {
    if (filter === 'confirmed' && !r.confirmed) return false;
    if (filter === 'unconfirmed' && r.confirmed) return false;
    if (filter === 'marketing' && !r.marketing) return false;
    if (filter === 'blocked' && !r.blocked) return false;
    const s = q.trim().toLowerCase();
    return !s || [r.pseudo, r.first_name, r.last_name, r.email, r.specialty].some((v) => v.toLowerCase().includes(s));
  }), [rows, filter, q]);

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) => start(async () => { const r = await fn(); if (!r.ok) setError(r.error ?? 'Erreur'); router.refresh(); });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input placeholder="Rechercher (pseudo, nom, email)" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} className="h-10 rounded-(--radius-button) border border-(--color-border) bg-(--color-surface) px-3 text-sm">
          <option value="all">Tous</option>
          <option value="confirmed">Confirmés</option>
          <option value="unconfirmed">Non confirmés</option>
          <option value="marketing">Consentement marketing (case 2)</option>
          <option value="blocked">Bloqués</option>
        </select>
        <span className="text-sm text-(--color-ink-soft)">{filtered.length} / {rows.length}</span>
        <div className="ml-auto flex gap-2">
          <a href={`/api/admin/arena/${tournamentId}/participants`}><Button variant="outline" size="sm"><Download className="mr-1 h-4 w-4" /> Export CSV (tous)</Button></a>
          <a href={`/api/admin/arena/${tournamentId}/participants?marketing=1`}><Button variant="outline" size="sm"><Download className="mr-1 h-4 w-4" /> Export prospection (case 2 uniquement)</Button></a>
        </div>
      </div>
      {error && <p className="text-sm font-semibold text-(--color-danger)">{error}</p>}
      <div className="overflow-x-auto rounded-(--radius-card) border border-(--color-border) bg-(--color-surface) shadow-(--shadow-soft)">
        <table className="w-full text-sm">
          <thead className="bg-(--color-surface-soft) text-left text-xs uppercase tracking-wide text-(--color-ink-muted)">
            <tr>
              <th className="px-3 py-2">Participant</th>
              <th className="px-3 py-2">État</th>
              <th className="px-3 py-2">Source</th>
              {rows[0]?.rounds.map((r) => <th key={r.number} className="px-3 py-2">M{r.number}</th>)}
              <th className="px-3 py-2">Cumul</th>
              <th className="px-3 py-2">Rang</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className={`border-t border-(--color-border) ${p.blocked || p.anonymized ? 'opacity-60' : ''}`}>
                <td className="px-3 py-2">
                  <div className="font-semibold">{p.pseudo}</div>
                  <div className="text-xs text-(--color-ink-soft)">{p.anonymized ? 'anonymisé' : `${p.first_name} ${p.last_name} · ${p.email}`} · {p.specialty}</div>
                  <div className="text-xs text-(--color-ink-muted)">inscrit {fmt(p.created_at)} · dernière connexion {fmt(p.last_login_at)}</div>
                </td>
                <td className="px-3 py-2 text-xs">
                  {p.confirmed ? <span className="text-emerald-700">confirmé</span> : <span className="text-amber-700">non confirmé</span>}
                  {p.marketing && <span className="ml-1 text-(--color-ink-soft)">· marketing</span>}
                  {p.blocked && <span className="ml-1 text-(--color-danger)">· bloqué</span>}
                </td>
                <td className="px-3 py-2 text-xs">{p.source ?? '—'}{p.invited ? ' (invité)' : ''}</td>
                {p.rounds.map((r) => (
                  <td key={r.number} className="px-3 py-2 text-xs">
                    {r.attemptId ? (
                      <span>{r.status === 'in_progress' ? 'en cours' : `${(r.score ?? 0).toLocaleString('fr-FR')}${r.truncated ? ' (tronq.)' : ''}`}
                        {r.status !== 'in_progress' && <button className="ml-1 text-(--color-ink-muted) hover:text-(--color-danger)" title="Réinitialiser la tentative (incident)" onClick={() => { const reason = prompt('Motif de réinitialisation :'); if (reason) run(() => resetAttempt(r.attemptId as string, reason)); }}><RotateCcw className="inline h-3 w-3" /></button>}
                      </span>
                    ) : '—'}
                    <span className="block text-(--color-ink-muted)">Rang : {r.rank ?? '—'} · effectif de manche : {r.effectifManche}</span>
                  </td>
                ))}
                <td className="px-3 py-2 font-semibold">{p.totalScore.toLocaleString('fr-FR')}</td>
                <td className="px-3 py-2">{p.rank ?? <span className="text-xs text-(--color-ink-muted)">{p.reason === 'not_enough_rounds' ? '3 manches requises' : p.reason === 'under_threshold' ? 'sous seuil' : 'non classé'}</span>}{p.isFinal && <span className="block text-xs text-(--color-ink-muted)">Effectif général : {p.effectifGeneral}</span>}</td>
                <td className="px-3 py-2">
                  <div className="flex justify-end gap-1">
                    {!p.confirmed && !p.anonymized && <Button variant="ghost" size="sm" title="Renvoyer la confirmation" disabled={pending} onClick={() => run(() => resendConfirmationAdmin(p.id))}><MailCheck className="h-4 w-4" /></Button>}
                    {!p.anonymized && <Button variant="ghost" size="sm" title="Modérer le pseudonyme" disabled={pending} onClick={() => { const v = prompt('Nouveau pseudonyme :', p.pseudo); if (v && v.trim() !== p.pseudo) run(() => renameParticipant(p.id, v)); }}><Pencil className="h-4 w-4" /></Button>}
                    {!p.anonymized && (p.blocked
                      ? <Button variant="ghost" size="sm" title="Débloquer" disabled={pending} onClick={() => run(() => blockParticipant(p.id, '', false))}><Unlock className="h-4 w-4" /></Button>
                      : <Button variant="ghost" size="sm" title="Bloquer (exclusion §10)" disabled={pending} onClick={() => { const reason = prompt('Motif du blocage :'); if (reason !== null) run(() => blockParticipant(p.id, reason, true)); }}><Ban className="h-4 w-4" /></Button>)}
                    {!p.anonymized && <Button variant="ghost" size="sm" title="Supprimer les données (anonymisation)" disabled={pending} onClick={() => { if (confirm(`Anonymiser définitivement ${p.pseudo} ?`)) run(() => deleteParticipantData(p.id)); }}><Trash2 className="h-4 w-4" /></Button>}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={7 + (rows[0]?.rounds.length ?? 0)} className="px-3 py-6 text-center text-(--color-ink-soft)">Aucun participant.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
