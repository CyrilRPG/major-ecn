'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DownloadButton, NativeSelect } from './ui';
import { candidateFiltersToQuery } from '@/lib/suivi/export-filters';
import { CANDIDATE_STATUS_LABEL, filterCandidates, type CandidateFilters, type CandidateState } from '@/lib/suivi/stats';
import { fmtDateShort, fmtDateTime } from '@/lib/suivi/format';
import { CANDIDATE_FILTER_KEYS, CANDIDATE_FILTER_LABEL, OFFER_KEYS, OFFER_SHORT_LABEL, VOIE_LABEL, type AppointmentRow, type CandidateFilterKey } from '@/lib/suivi/types';

const STATUS_VARIANT: Record<CandidateState['status'], 'primary' | 'success' | 'danger' | 'warning' | 'muted' | 'outline'> = {
  never_contacted: 'muted', invited: 'outline', scheduled: 'primary', done: 'success', no_show: 'danger', to_recall: 'warning', cancelled: 'muted',
};

/** Vue globale des candidats (§10), recherche (§11), exports (§17). */
export function CandidatesTable({ candidates, appointments, campaigns, specialties, initialQuery }: {
  candidates: CandidateState[];
  appointments: AppointmentRow[];
  campaigns: { id: string; name: string }[];
  specialties: string[];
  initialQuery?: string;
}) {
  const [f, setF] = useState<CandidateFilters>({ key: 'all', q: initialQuery ?? '' });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const set = <K extends keyof CandidateFilters>(k: K, v: CandidateFilters[K]) => setF((p) => ({ ...p, [k]: v }));

  const rows = useMemo(() => filterCandidates(candidates, f, appointments), [candidates, f, appointments]);
  const campaignName = useMemo(() => new Map(campaigns.map((c) => [c.id, c.name])), [campaigns]);
  const allChecked = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const exportQuery = candidateFiltersToQuery({ ...f, ids: undefined });
  const selectedIds = rows.filter((r) => selected.has(r.id)).map((r) => r.id);

  return (
    <div className="space-y-3">
      <div className="grid gap-3 rounded-(--radius-card) border border-(--color-border) bg-(--color-surface) p-4 md:grid-cols-3 lg:grid-cols-6">
        <label className="flex flex-col gap-1 text-xs font-medium text-(--color-ink-soft) lg:col-span-2">Recherche
          <Input className="h-9" value={f.q ?? ''} onChange={(e) => set('q', e.target.value)} placeholder="Nom ou email…" autoFocus={!!initialQuery} />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-(--color-ink-soft)">Situation
          <NativeSelect className="h-9" value={f.key ?? 'all'} onChange={(e) => set('key', e.target.value as CandidateFilterKey)}>
            {CANDIDATE_FILTER_KEYS.map((k) => <option key={k} value={k}>{CANDIDATE_FILTER_LABEL[k]}</option>)}
          </NativeSelect>
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-(--color-ink-soft)">Spécialité
          <NativeSelect className="h-9" value={f.specialty ?? ''} onChange={(e) => set('specialty', e.target.value || undefined)}>
            <option value="">Toutes</option>{specialties.map((s) => <option key={s} value={s}>{s}</option>)}
          </NativeSelect>
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-(--color-ink-soft)">Formule
          <NativeSelect className="h-9" value={f.offer ?? ''} onChange={(e) => set('offer', e.target.value || undefined)}>
            <option value="">Toutes</option>{OFFER_KEYS.map((o) => <option key={o} value={o}>{OFFER_SHORT_LABEL[o]}</option>)}
          </NativeSelect>
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-(--color-ink-soft)">Voie
          <NativeSelect className="h-9" value={f.voie ?? ''} onChange={(e) => set('voie', e.target.value || undefined)}>
            <option value="">Toutes</option>{Object.entries(VOIE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </NativeSelect>
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-(--color-ink-soft)">Campagne
          <NativeSelect className="h-9" value={f.campaignId ?? ''} onChange={(e) => set('campaignId', e.target.value || undefined)}>
            <option value="">Toutes</option>{campaigns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </NativeSelect>
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-(--color-ink-soft)">Période du
          <Input className="h-9" type="date" value={f.from ?? ''} onChange={(e) => set('from', e.target.value || undefined)} />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-(--color-ink-soft)">au
          <Input className="h-9" type="date" value={f.to ?? ''} onChange={(e) => set('to', e.target.value || undefined)} />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-(--color-ink-soft)">Suivis min.
          <Input className="h-9" type="number" min={0} value={f.minFollowUps ?? ''} onChange={(e) => set('minFollowUps', e.target.value ? Number(e.target.value) : undefined)} placeholder="0" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-(--color-ink-soft)">Présence
          <NativeSelect className="h-9" value={f.presence ?? ''} onChange={(e) => set('presence', (e.target.value || undefined) as CandidateFilters['presence'])}>
            <option value="">Indifférent</option><option value="present">Au moins un entretien réalisé</option><option value="absent">Dernier rendez-vous : absent</option>
          </NativeSelect>
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-(--color-ink-soft)">Actions
          <NativeSelect className="h-9" value={f.action ?? ''} onChange={(e) => set('action', (e.target.value || undefined) as CandidateFilters['action'])}>
            <option value="">Indifférent</option><option value="open">Avec actions ouvertes</option><option value="late">Avec actions en retard</option><option value="none">Sans action ouverte</option>
          </NativeSelect>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-(--color-ink-soft)">{rows.length} candidat(s){selected.size > 0 ? ` · ${selectedIds.length} sélectionné(s)` : ''}</span>
        <span className="ml-auto flex flex-wrap gap-2">
          <DownloadButton href={`/api/admin/suivi/export${exportQuery}`} filename="suivi-candidats.csv" label="Export CSV (liste filtrée)" />
          <DownloadButton href={`/api/admin/suivi/fiches/pdf${selectedIds.length > 0 ? `?ids=${selectedIds.join(',')}` : exportQuery}`} filename="fiches-suivi.pdf"
            label={selectedIds.length > 0 ? `PDF des ${selectedIds.length} sélectionné(s)` : 'PDF de la liste filtrée'} disabled={rows.length === 0} />
        </span>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10"><Checkbox checked={allChecked} onCheckedChange={() => setSelected((p) => { const n = new Set(p); if (allChecked) rows.forEach((r) => n.delete(r.id)); else rows.forEach((r) => n.add(r.id)); return n; })} aria-label="Tout sélectionner" /></TableHead>
            <TableHead>Candidat</TableHead>
            <TableHead>Spécialité</TableHead>
            <TableHead>Dernier suivi</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-center">Suivis</TableHead>
            <TableHead>Prochain rendez-vous</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.slice(0, 500).map((c) => (
            <TableRow key={c.id}>
              <TableCell><Checkbox checked={selected.has(c.id)} onCheckedChange={() => setSelected((p) => { const n = new Set(p); if (n.has(c.id)) n.delete(c.id); else n.add(c.id); return n; })} /></TableCell>
              <TableCell>
                <Link href={`/admin/suivi/candidats/${c.id}`} className="font-medium text-(--color-ink) underline-offset-4 hover:underline">{c.name}</Link>
                <p className="text-xs text-(--color-ink-muted)">{c.email} · {OFFER_SHORT_LABEL[c.offer] ?? c.offer}{c.voie ? ` · ${c.voie}` : ''}{c.campaignIds.length > 0 ? ` · ${c.campaignIds.map((id) => campaignName.get(id)).filter(Boolean).join(', ')}` : ''}</p>
              </TableCell>
              <TableCell className="text-(--color-ink-soft)">{c.specialty || '—'}</TableCell>
              <TableCell className="text-xs text-(--color-ink-soft)">{c.lastFollowUp ? fmtDateShort(c.lastFollowUp) : 'Jamais'}</TableCell>
              <TableCell><Badge variant={STATUS_VARIANT[c.status]}>{CANDIDATE_STATUS_LABEL[c.status]}</Badge></TableCell>
              <TableCell className="text-center tabular-nums">{c.doneCount}</TableCell>
              <TableCell className="text-xs text-(--color-ink-soft)">{c.nextAppointment ? fmtDateTime(c.nextAppointment.starts_at) : '—'}</TableCell>
              <TableCell className="text-xs">
                {c.openActions > 0 ? <span className={c.lateActions > 0 ? 'text-(--color-danger)' : 'text-(--color-ink-soft)'}>{c.openActions} ouverte(s){c.lateActions > 0 ? `, ${c.lateActions} en retard` : ''}</span> : <span className="text-(--color-ink-muted)">—</span>}
              </TableCell>
            </TableRow>
          ))}
          {rows.length === 0 && <TableRow><TableCell colSpan={8} className="py-10 text-center text-(--color-ink-soft)">Aucun candidat ne correspond à ces filtres.</TableCell></TableRow>}
        </TableBody>
      </Table>
      {rows.length > 500 && <p className="text-xs text-(--color-ink-muted)">Affichage limité aux 500 premiers ; affinez les filtres ou utilisez l’export CSV.</p>}
    </div>
  );
}
