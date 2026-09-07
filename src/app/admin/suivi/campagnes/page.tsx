import Link from 'next/link';
import { Plus } from 'lucide-react';
import { requireSuiviPage } from '@/lib/suivi/roles';
import { listAllMembers, listAppointments, listCampaigns } from '@/lib/suivi/db';
import { fmtDateShort } from '@/lib/suivi/format';
import { CAMPAIGN_STATUS_LABEL, OFFER_SHORT_LABEL, SELECTION_MODE_LABEL, isOccupying, roleCan } from '@/lib/suivi/types';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const dynamic = 'force-dynamic';

/** Liste des campagnes (§2) — plusieurs campagnes peuvent être actives simultanément. */
export default async function CampagnesPage() {
  const { role } = await requireSuiviPage('view');
  const [campaigns, members, appointments] = await Promise.all([listCampaigns(), listAllMembers(), listAppointments()]);
  const byCampaign = (id: string) => {
    const ms = members.filter((m) => m.campaign_id === id);
    const as = appointments.filter((a) => a.campaign_id === id);
    return {
      targeted: ms.length,
      invited: ms.filter((m) => m.invited_at).length,
      booked: new Set(as.filter((a) => isOccupying(a.status)).map((a) => a.user_id)).size,
      done: as.filter((a) => a.status === 'done').length,
    };
  };
  const variant = (s: string) => (s === 'active' ? 'success' : s === 'closed' ? 'muted' : 'outline');

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-(--color-border) pb-5">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-(--color-ink)">Campagnes de suivi</h1>
          <p className="mt-1 text-sm text-(--color-ink-soft)">Une campagne cible une population (spécialité, formule, voie, cohorte ou sélection manuelle), ouvre des créneaux et invite les candidats.</p>
        </div>
        {roleCan(role, 'manage') && (
          <Link href="/admin/suivi/campagnes/nouvelle" className="inline-flex h-10 items-center gap-2 rounded-(--radius-button) bg-(--color-primary) px-4 text-sm font-medium text-(--color-primary-fg) shadow-(--shadow-soft)">
            <Plus className="h-4 w-4" /> Nouvelle campagne
          </Link>
        )}
      </header>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Campagne</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Ciblage</TableHead>
            <TableHead>Période</TableHead>
            <TableHead className="text-center">Ciblés</TableHead>
            <TableHead className="text-center">Invités</TableHead>
            <TableHead className="text-center">Réservés</TableHead>
            <TableHead className="text-center">Réalisés</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((c) => {
            const s = byCampaign(c.id);
            const target = [
              c.specialties.length > 0 ? c.specialties.join(', ') : 'Toutes spécialités',
              c.offers.length > 0 ? c.offers.map((o) => OFFER_SHORT_LABEL[o] ?? o).join(', ') : null,
              c.voies.length > 0 ? c.voies.join(' / ') : null,
              c.selection_mode !== 'all' ? SELECTION_MODE_LABEL[c.selection_mode] : null,
            ].filter(Boolean).join(' · ');
            return (
              <TableRow key={c.id}>
                <TableCell>
                  <Link href={`/admin/suivi/campagnes/${c.id}`} className="font-medium text-(--color-ink) underline-offset-4 hover:underline">{c.name}</Link>
                  <p className="text-xs text-(--color-ink-muted)">Créée le {fmtDateShort(c.created_at)}{c.invited_at ? ` · invitations ${fmtDateShort(c.invited_at)}` : ''}</p>
                </TableCell>
                <TableCell><Badge variant={variant(c.status)}>{CAMPAIGN_STATUS_LABEL[c.status]}</Badge></TableCell>
                <TableCell className="max-w-xs text-xs text-(--color-ink-soft)">{target}</TableCell>
                <TableCell className="text-xs text-(--color-ink-soft)">{c.period_start ? fmtDateShort(`${c.period_start}T12:00:00Z`) : '—'} → {c.period_end ? fmtDateShort(`${c.period_end}T12:00:00Z`) : '—'}</TableCell>
                <TableCell className="text-center tabular-nums">{s.targeted}</TableCell>
                <TableCell className="text-center tabular-nums">{s.invited}</TableCell>
                <TableCell className="text-center tabular-nums">{s.booked}</TableCell>
                <TableCell className="text-center tabular-nums">{s.done}</TableCell>
              </TableRow>
            );
          })}
          {campaigns.length === 0 && (
            <TableRow><TableCell colSpan={8} className="py-10 text-center text-(--color-ink-soft)">Aucune campagne. Créez la première pour cibler des candidats.</TableCell></TableRow>
          )}
        </TableBody>
      </Table>
    </main>
  );
}
