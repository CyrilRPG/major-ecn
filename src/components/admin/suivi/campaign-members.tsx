'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmailComposeDialog, type ComposeResult } from './email-compose-dialog';
import { InlineStatus, MemberStatusBadge, NativeSelect } from './ui';
import { announcePlanning, inviteMembers, markNoShow, remindMembers, removeMember, setMemberStatus } from '@/app/admin/suivi/campagnes/actions';
import { fmtDateShort, fmtDateTime } from '@/lib/suivi/format';
import { matchesCandidateFilter, type CandidateState } from '@/lib/suivi/stats';
import { CANDIDATE_FILTER_KEYS, CANDIDATE_FILTER_LABEL, MEMBER_STATUS_LABEL, OFFER_SHORT_LABEL, type CandidateFilterKey, type MemberStatus } from '@/lib/suivi/types';

export type MemberView = {
  memberId: string;
  memberStatus: MemberStatus;
  invitedAt: string | null;
  lastReminderAt: string | null;
  reminderCount: number;
  candidate: CandidateState;
  /** Dernier rendez-vous PASSÉ encore « planifié » dans cette campagne (à qualifier). */
  pastPlannedAppointmentId: string | null;
};

type Templates = Record<'planning_announce' | 'invite' | 'reminder_no_booking' | 'absence', { subject: string; body: string }>;
type Mode = 'announce' | 'invite' | 'remind' | null;

/** Candidats d'une campagne (§10 filtres, §14 relances / absences). */
export function CampaignMembers({ campaignId, rows, templates, canManage }: { campaignId: string; rows: MemberView[]; templates: Templates; canManage: boolean }) {
  const router = useRouter();
  const [filter, setFilter] = useState<CandidateFilterKey>('all');
  const [memberFilter, setMemberFilter] = useState<'' | MemberStatus>('');
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<Mode>(null);
  const [absenceFor, setAbsenceFor] = useState<MemberView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const filtered = useMemo(() => rows.filter((r) => {
    if (!matchesCandidateFilter(r.candidate, filter)) return false;
    if (memberFilter && r.memberStatus !== memberFilter) return false;
    const s = q.trim().toLowerCase();
    if (s && !`${r.candidate.name} ${r.candidate.email ?? ''}`.toLowerCase().includes(s)) return false;
    return true;
  }), [rows, filter, memberFilter, q]);

  const allChecked = filtered.length > 0 && filtered.every((r) => selected.has(r.candidate.id));
  const targets = selected.size > 0 ? filtered.filter((r) => selected.has(r.candidate.id)).map((r) => r.candidate.id) : filtered.map((r) => r.candidate.id);
  const targetLabel = selected.size > 0 ? `${targets.length} sélectionné(s)` : `${targets.length} candidat(s) de la liste filtrée`;

  function toggleAll() {
    setSelected((prev) => {
      const n = new Set(prev);
      if (allChecked) filtered.forEach((r) => n.delete(r.candidate.id)); else filtered.forEach((r) => n.add(r.candidate.id));
      return n;
    });
  }

  async function sendMode(override: { subject: string; body: string }): Promise<ComposeResult> {
    const fn = mode === 'announce' ? announcePlanning : mode === 'invite' ? inviteMembers : remindMembers;
    const r = await fn(campaignId, targets, override);
    if (r.ok) router.refresh();
    return r.ok ? { ok: true, sent: r.sent, failed: r.failed } : r;
  }

  function run(label: string, fn: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null); setStatus(null);
    start(async () => {
      const r = await fn();
      if (!r.ok) { setError(r.error ?? 'Erreur'); return; }
      setStatus(label);
      router.refresh();
    });
  }

  const templateFor = (m: Mode) => (m === 'announce' ? templates.planning_announce : m === 'invite' ? templates.invite : templates.reminder_no_booking);
  const titleFor = (m: Mode) => (m === 'announce' ? 'Annoncer le planning' : m === 'invite' ? 'Envoyer les invitations' : 'Relancer sans réservation');

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs font-medium text-(--color-ink-soft)">Situation
          <NativeSelect className="h-9 w-64" value={filter} onChange={(e) => setFilter(e.target.value as CandidateFilterKey)}>
            {CANDIDATE_FILTER_KEYS.map((k) => <option key={k} value={k}>{CANDIDATE_FILTER_LABEL[k]}</option>)}
          </NativeSelect>
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-(--color-ink-soft)">Statut campagne
          <NativeSelect className="h-9 w-56" value={memberFilter} onChange={(e) => setMemberFilter(e.target.value as '' | MemberStatus)}>
            <option value="">Tous</option>
            {(Object.keys(MEMBER_STATUS_LABEL) as MemberStatus[]).map((k) => <option key={k} value={k}>{MEMBER_STATUS_LABEL[k]}</option>)}
          </NativeSelect>
        </label>
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nom ou email…" className="h-9 max-w-xs" />
        <span className="ml-auto text-sm text-(--color-ink-soft)">{filtered.length} / {rows.length}</span>
      </div>

      {canManage && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg bg-(--color-surface-soft) p-2.5">
          <span className="mr-1 text-xs text-(--color-ink-soft)">Cible : {targetLabel}</span>
          <Button size="sm" variant="outline" disabled={targets.length === 0 || pending} onClick={() => setMode('announce')}>Annoncer le planning</Button>
          <Button size="sm" disabled={targets.length === 0 || pending} onClick={() => setMode('invite')}>Envoyer les invitations</Button>
          <Button size="sm" variant="secondary" disabled={targets.length === 0 || pending} onClick={() => setMode('remind')}>Relancer</Button>
          {selected.size > 0 && (
            <Button size="sm" variant="ghost" disabled={pending} onClick={() => run('Statut mis à jour.', async () => {
              for (const r of filtered.filter((x) => selected.has(x.candidate.id))) {
                const res = await setMemberStatus(r.memberId, 'unreachable');
                if (!res.ok) return res;
              }
              return { ok: true };
            })}>Marquer injoignable</Button>
          )}
          {pending && <Loader2 className="h-4 w-4 animate-spin text-(--color-ink-muted)" />}
        </div>
      )}
      <InlineStatus error={error} status={status} />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10"><Checkbox checked={allChecked} onCheckedChange={toggleAll} aria-label="Tout sélectionner" /></TableHead>
            <TableHead>Candidat</TableHead>
            <TableHead>Spécialité</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Invité / relances</TableHead>
            <TableHead>Dernier suivi</TableHead>
            <TableHead className="text-center">Suivis</TableHead>
            <TableHead>Prochain RDV</TableHead>
            {canManage && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((r) => {
            const c = r.candidate;
            return (
              <TableRow key={r.memberId}>
                <TableCell><Checkbox checked={selected.has(c.id)} onCheckedChange={() => setSelected((p) => { const n = new Set(p); if (n.has(c.id)) n.delete(c.id); else n.add(c.id); return n; })} /></TableCell>
                <TableCell>
                  <Link href={`/admin/suivi/candidats/${c.id}`} className="font-medium text-(--color-ink) underline-offset-4 hover:underline">{c.name}</Link>
                  <p className="text-xs text-(--color-ink-muted)">{c.email} · {OFFER_SHORT_LABEL[c.offer] ?? c.offer}{c.voie ? ` · ${c.voie}` : ''}</p>
                </TableCell>
                <TableCell className="text-(--color-ink-soft)">{c.specialty || '—'}</TableCell>
                <TableCell><MemberStatusBadge status={r.memberStatus} /></TableCell>
                <TableCell className="text-xs text-(--color-ink-soft)">
                  {r.invitedAt ? fmtDateShort(r.invitedAt) : '—'}{r.reminderCount > 0 && <span> · {r.reminderCount} relance(s){r.lastReminderAt ? ` (${fmtDateShort(r.lastReminderAt)})` : ''}</span>}
                </TableCell>
                <TableCell className="text-xs text-(--color-ink-soft)">{c.lastFollowUp ? fmtDateShort(c.lastFollowUp) : '—'}</TableCell>
                <TableCell className="text-center tabular-nums">{c.doneCount}</TableCell>
                <TableCell className="text-xs text-(--color-ink-soft)">{c.nextAppointment ? fmtDateTime(c.nextAppointment.starts_at) : '—'}</TableCell>
                {canManage && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {r.pastPlannedAppointmentId && (
                        <Button size="sm" variant="outline" onClick={() => setAbsenceFor(r)}>Marquer absent</Button>
                      )}
                      <Button size="sm" variant="ghost" disabled={pending} onClick={() => { setSelected(new Set([c.id])); setMode('remind'); }}>Relancer</Button>
                      {r.memberStatus === 'targeted' && (
                        <Button size="sm" variant="ghost" disabled={pending} onClick={() => run('Candidat retiré.', () => removeMember(r.memberId))}>Retirer</Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
          {filtered.length === 0 && (
            <TableRow><TableCell colSpan={canManage ? 9 : 8} className="py-8 text-center text-(--color-ink-soft)">Aucun candidat dans cette situation.</TableCell></TableRow>
          )}
        </TableBody>
      </Table>

      {mode && (
        <EmailComposeDialog
          open onOpenChange={(o) => { if (!o) setMode(null); }}
          title={titleFor(mode)}
          description={`${targets.length} destinataire(s). Le texte peut être modifié avant l’envoi ; les variables sont remplacées pour chaque candidat.`}
          template={templateFor(mode)}
          onSend={sendMode}
        />
      )}
      {absenceFor && absenceFor.pastPlannedAppointmentId && (
        <EmailComposeDialog
          open onOpenChange={(o) => { if (!o) setAbsenceFor(null); }}
          title={`Marquer absent : ${absenceFor.candidate.name}`}
          description="Le rendez-vous passe en « Absent / injoignable » et l’email ci-dessous est envoyé au candidat."
          template={templates.absence}
          sendLabel="Marquer absent et envoyer"
          onSend={async (ov) => {
            const r = await markNoShow(absenceFor.pastPlannedAppointmentId!, true, ov);
            if (r.ok) router.refresh();
            return r.ok ? { ok: true } : r;
          }}
        />
      )}
    </div>
  );
}
