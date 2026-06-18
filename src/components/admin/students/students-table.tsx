'use client';

import { useMemo, useState } from 'react';
import { Award, Download, Mail, Search } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ImpersonateAction } from './impersonate-action';
import { EditStudentDialog } from './edit-student-dialog';
import { BulkEmailDialog } from './bulk-email-dialog';
import { initials } from '@/lib/utils';
import { parseScope, offerLabel } from '@/lib/auth/permissions';
import type { Offer } from '@/types/domain';
import { DeleteAccountButton } from '@/components/admin/delete-account-button';
import { ToggleActiveButton } from '@/components/admin/toggle-active-button';
import { ResendActivationButton } from '@/components/admin/resend-activation-button';

export type Student = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  address?: string | null;
  pseudo?: string | null;
  promotion: string | null;
  permission_scope: unknown;
  is_active?: boolean | null;
  created_at?: string;
};

const PROMOS = ['D2', 'D3', 'D4', 'PAE', 'Autre'];

/** Catégories d'abonnement (ordre d'affichage). */
const OFFER_CATS: { value: Offer; label: string }[] = [
  { value: 'decouverte', label: 'Découverte' },
  { value: 'essentiel', label: 'Essentiel' },
  { value: 'intensif', label: 'Approfondi' },
  { value: 'premium', label: 'Premium / Intensive' },
];

type RawScope = {
  paid_specialty?: string;
  specialty_wish?: string | null;
  paid_at?: string;
  paid_offer?: string;
  signup?: { specialty?: string; voie?: string | null; session?: string; country?: string; passed_evc?: string };
};
function rawScope(s: Student): RawScope {
  return (s.permission_scope ?? {}) as RawScope;
}
function specialtyOf(s: Student): string {
  const r = rawScope(s);
  return (r.signup?.specialty || r.paid_specialty || r.specialty_wish || '').toString().trim();
}
function voieOf(s: Student): string {
  return (rawScope(s).signup?.voie ?? '').toString().trim();
}
function offerOf(s: Student): Offer {
  return parseScope(s.permission_scope).offer;
}
function isPaid(s: Student): boolean {
  const r = rawScope(s);
  return offerOf(s) !== 'decouverte' || !!r.paid_at || !!r.paid_offer;
}
function isActive(s: Student): boolean {
  return s.is_active !== false;
}
function fmtDate(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}
function withinPeriod(iso: string | undefined, period: string): boolean {
  if (period === 'all') return true;
  if (!iso) return false;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return false;
  const now = Date.now();
  const days = period === '7' ? 7 : period === '30' ? 30 : period === '90' ? 90 : period === '365' ? 365 : 0;
  return now - t <= days * 86_400_000;
}

export function StudentsTable({
  students,
  colleges,
}: {
  students: Student[];
  colleges: { id: string; nom: string }[];
}) {
  const [q, setQ] = useState('');
  const [promo, setPromo] = useState('all');
  const [specialty, setSpecialty] = useState('all');
  const [offer, setOffer] = useState<'all' | Offer>('all');
  const [payment, setPayment] = useState('all'); // all | paid | free
  const [period, setPeriod] = useState('all'); // all | 7 | 30 | 90 | 365
  const [access, setAccess] = useState('all'); // all | active | expired
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [emailOpen, setEmailOpen] = useState(false);

  /** Liste triée des spécialités présentes. */
  const specialties = useMemo(() => {
    const set = new Set<string>();
    for (const s of students) { const sp = specialtyOf(s); if (sp) set.add(sp); }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'fr'));
  }, [students]);

  /** Compte par catégorie d'abonnement (sur l'ensemble). */
  const offerCounts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const s of students) { const o = offerOf(s); m[o] = (m[o] ?? 0) + 1; }
    return m;
  }, [students]);

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const full = `${s.first_name ?? ''} ${s.last_name ?? ''} ${s.email ?? ''} ${specialtyOf(s)}`.toLowerCase();
      if (q && !full.includes(q.toLowerCase())) return false;
      if (promo !== 'all' && s.promotion !== promo) return false;
      if (specialty !== 'all' && specialtyOf(s) !== specialty) return false;
      if (offer !== 'all' && offerOf(s) !== offer) return false;
      if (payment === 'paid' && !isPaid(s)) return false;
      if (payment === 'free' && isPaid(s)) return false;
      if (access === 'active' && !isActive(s)) return false;
      if (access === 'expired' && isActive(s)) return false;
      if (!withinPeriod(s.created_at, period)) return false;
      return true;
    });
  }, [students, q, promo, specialty, offer, payment, access, period]);

  const filteredIds = useMemo(() => filtered.map((s) => s.id), [filtered]);
  const allSelected = filtered.length > 0 && filtered.every((s) => selected.has(s.id));
  const selectedInFilter = filteredIds.filter((id) => selected.has(id));

  function toggleAll() {
    setSelected((prev) => {
      const n = new Set(prev);
      if (allSelected) filteredIds.forEach((id) => n.delete(id));
      else filteredIds.forEach((id) => n.add(id));
      return n;
    });
  }
  function toggleOne(id: string) {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  }

  /** Destinataires du message groupé : la sélection si non vide, sinon la liste filtrée. */
  const emailTargets = selectedInFilter.length > 0 ? selectedInFilter : filteredIds;
  const emailContext =
    selectedInFilter.length > 0
      ? `${selectedInFilter.length} élève(s) sélectionné(s)`
      : `${filteredIds.length} élève(s) (liste filtrée)`;

  async function exportXlsx() {
    const XLSX = await import('xlsx');
    const rows = filtered.map((s) => ({
      'Nom': s.last_name ?? '',
      'Prénom': s.first_name ?? '',
      'Spécialité': specialtyOf(s) || '—',
      'Voie': voieOf(s),
      'Abonnement': offerLabel(offerOf(s)),
      'Paiement': isPaid(s) ? 'Payé' : 'Gratuit (Découverte)',
      'Accès': isActive(s) ? 'Actif' : 'Expiré / Inactif',
      'Promotion': s.promotion ?? '',
      'Adresse': s.address ?? '',
      'Téléphone': s.phone ?? '',
      'Email': s.email ?? '',
      'Inscription': fmtDate(s.created_at),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [
      { wch: 16 }, { wch: 14 }, { wch: 26 }, { wch: 10 }, { wch: 20 }, { wch: 18 },
      { wch: 14 }, { wch: 10 }, { wch: 28 }, { wch: 16 }, { wch: 28 }, { wch: 14 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Élèves');
    XLSX.writeFile(wb, `eleves-major-ecn-${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  return (
    <>
      {/* Catégories d'abonnement (cliquables → filtre). */}
      <div className="mb-4 flex flex-wrap gap-2">
        <CategoryChip label={`Tous (${students.length})`} active={offer === 'all'} onClick={() => setOffer('all')} />
        {OFFER_CATS.map((c) => (
          <CategoryChip
            key={c.value}
            label={`${c.label} (${offerCounts[c.value] ?? 0})`}
            active={offer === c.value}
            onClick={() => setOffer(c.value)}
          />
        ))}
      </div>

      {/* Recherche + filtres */}
      <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-(--color-ink-soft)" />
          <Input className="pl-9" placeholder="Rechercher (nom, prénom, email, spécialité)…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={specialty} onValueChange={setSpecialty}>
          <SelectTrigger className="w-full lg:w-52"><SelectValue placeholder="Spécialité" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes spécialités</SelectItem>
            {specialties.map((sp) => <SelectItem key={sp} value={sp}>{sp}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={offer} onValueChange={(v) => setOffer(v as 'all' | Offer)}>
          <SelectTrigger className="w-full lg:w-44"><SelectValue placeholder="Abonnement" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous abonnements</SelectItem>
            {OFFER_CATS.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={payment} onValueChange={setPayment}>
          <SelectTrigger className="w-full lg:w-40"><SelectValue placeholder="Paiement" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tout paiement</SelectItem>
            <SelectItem value="paid">Payé</SelectItem>
            <SelectItem value="free">Gratuit (Découverte)</SelectItem>
          </SelectContent>
        </Select>
        <Select value={access} onValueChange={setAccess}>
          <SelectTrigger className="w-full lg:w-36"><SelectValue placeholder="Accès" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tout accès</SelectItem>
            <SelectItem value="active">Actif</SelectItem>
            <SelectItem value="expired">Expiré / Inactif</SelectItem>
          </SelectContent>
        </Select>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-full lg:w-44"><SelectValue placeholder="Inscription" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toute date</SelectItem>
            <SelectItem value="7">7 derniers jours</SelectItem>
            <SelectItem value="30">30 derniers jours</SelectItem>
            <SelectItem value="90">90 derniers jours</SelectItem>
            <SelectItem value="365">Cette année</SelectItem>
          </SelectContent>
        </Select>
        <Select value={promo} onValueChange={setPromo}>
          <SelectTrigger className="w-full lg:w-32"><SelectValue placeholder="Promo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes promos</SelectItem>
            {PROMOS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Barre d'actions */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-sm text-(--color-ink-soft)">
          {filtered.length} résultat{filtered.length > 1 ? 's' : ''}
          {selectedInFilter.length > 0 && ` · ${selectedInFilter.length} sélectionné(s)`}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setEmailOpen(true)}
            disabled={emailTargets.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg bg-(--color-primary) px-3 py-2 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50"
          >
            <Mail className="h-3.5 w-3.5" />
            {selectedInFilter.length > 0 ? `Message groupé (${selectedInFilter.length})` : 'Message à la liste'}
          </button>
          <button
            onClick={exportXlsx}
            disabled={filtered.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-xs font-bold text-(--color-ink) hover:bg-(--color-sand-100) disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" /> Exporter Excel
          </button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8">
              <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Tout sélectionner" className="h-4 w-4" />
            </TableHead>
            <TableHead>Élève</TableHead>
            <TableHead className="hidden lg:table-cell">Spécialité</TableHead>
            <TableHead className="hidden md:table-cell">Email</TableHead>
            <TableHead className="hidden lg:table-cell">Téléphone</TableHead>
            <TableHead className="hidden md:table-cell">Abonnement</TableHead>
            <TableHead className="hidden lg:table-cell">Inscription</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="py-10 text-center text-(--color-ink-soft)">
                Aucun élève ne correspond à ces filtres.
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((s) => {
              const scope = parseScope(s.permission_scope);
              const sp = specialtyOf(s);
              const voie = voieOf(s);
              return (
                <TableRow key={s.id} data-state={selected.has(s.id) ? 'selected' : undefined}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selected.has(s.id)}
                      onChange={() => toggleOne(s.id)}
                      aria-label={`Sélectionner ${s.first_name ?? ''} ${s.last_name ?? ''}`}
                      className="h-4 w-4"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarFallback>{initials(s.first_name, s.last_name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{s.first_name} {s.last_name}</p>
                        <p className="truncate font-mono text-[11px] text-(--color-ink-soft) md:hidden">{s.email}</p>
                        <p className="truncate text-[11px] text-(--color-ink-soft) lg:hidden">
                          {sp ? `${sp}${voie ? ` (${voie})` : ''}` : '—'}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-1 md:hidden">
                          {!isActive(s) && <Badge variant="muted">Inactif</Badge>}
                          <Badge variant={scope.offer === 'essentiel' ? 'outline' : 'primary'}>{offerLabel(scope.offer)}</Badge>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className="text-sm">{sp ? `${sp}${voie ? ` (${voie})` : ''}` : '—'}</span>
                  </TableCell>
                  <TableCell className="hidden font-mono text-xs text-(--color-ink-soft) md:table-cell">{s.email}</TableCell>
                  <TableCell className="hidden text-(--color-ink-soft) lg:table-cell">{s.phone ?? 'Non renseigné'}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex flex-wrap items-center gap-1">
                      <Badge variant={scope.offer === 'essentiel' ? 'outline' : 'primary'}>{offerLabel(scope.offer)}</Badge>
                      {isPaid(s) ? <Badge variant="muted">Payé</Badge> : <Badge variant="muted">Gratuit</Badge>}
                      {!isActive(s) && <Badge variant="muted">Inactif</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className="text-xs text-(--color-ink-soft)">{fmtDate(s.created_at)}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/api/admin/certificates/${s.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Télécharger tous les certificats signés de cet élève"
                        className="inline-flex h-8 items-center gap-1 rounded-md border border-(--color-border) bg-(--color-surface) px-2 text-xs font-bold text-(--color-ink-soft) hover:border-[#7C3AED] hover:text-[#7C3AED]"
                      >
                        <Award className="h-3.5 w-3.5" />
                        <span className="hidden lg:inline">Certificats</span>
                      </Link>
                      <EditStudentDialog student={s} colleges={colleges} />
                      <ImpersonateAction
                        studentId={s.id}
                        studentName={`${s.first_name ?? ''} ${s.last_name ?? ''}`.trim() || s.email || 'élève'}
                      />
                      <ResendActivationButton
                        userId={s.id}
                        displayName={`${s.first_name ?? ''} ${s.last_name ?? ''}`.trim() || s.email || 'élève'}
                      />
                      <ToggleActiveButton
                        userId={s.id}
                        displayName={`${s.first_name ?? ''} ${s.last_name ?? ''}`.trim() || s.email || 'élève'}
                        isActive={s.is_active !== false}
                      />
                      <DeleteAccountButton
                        userId={s.id}
                        displayName={`${s.first_name ?? ''} ${s.last_name ?? ''}`.trim() || s.email || 'élève'}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <BulkEmailDialog
        open={emailOpen}
        onClose={() => setEmailOpen(false)}
        studentIds={emailTargets}
        contextLabel={emailContext}
      />
    </>
  );
}

function CategoryChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${
        active
          ? 'border-(--color-primary) bg-(--color-primary) text-white'
          : 'border-(--color-border) bg-(--color-surface) text-(--color-ink) hover:bg-(--color-sand-100)'
      }`}
    >
      {label}
    </button>
  );
}
