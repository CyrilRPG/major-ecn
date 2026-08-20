'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Award, CalendarClock, Download, Loader2, Mail, Search } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ImpersonateAction } from './impersonate-action';
import { EditStudentDialog } from './edit-student-dialog';
import { EmargementsDialog } from './emargements-dialog';
import { BulkEmailDialog } from './bulk-email-dialog';
import { initials } from '@/lib/utils';
import { parseScope, offerLabel } from '@/lib/auth/permissions';
import type { Offer } from '@/types/domain';
import { DeleteAccountButton } from '@/components/admin/delete-account-button';
import { ToggleActiveButton } from '@/components/admin/toggle-active-button';
import { ResendActivationButton } from '@/components/admin/resend-activation-button';
import { fetchAvecJetonFrais } from '@/lib/auth/fresh-token';

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
  /** Vrai si l'élève ne s'est jamais connecté (auth.users.last_sign_in_at nul). */
  never_connected?: boolean | null;
  /** Droit d'impression global (toutes spécialités). */
  can_download?: boolean | null;
  /** Spécialités où l'impression est autorisée (si pas de droit global). */
  download_colleges?: string[] | null;
  /** Session EVC de rattachement (fin d'accès par défaut). */
  evc_session_id?: string | null;
  access_start?: string | null;
  /** Fin d'accès individuelle — prime sur la date de la session. */
  access_end?: string | null;
};

export type EvcSessionOption = { id: string; label: string; default_access_end: string; is_default?: boolean };

const PROMOS = ['D2', 'D3', 'D4', 'PAE', 'Autre'];

/** Catégories d'abonnement (ordre d'affichage). */
const OFFER_CATS: { value: Offer; label: string }[] = [
  { value: 'decouverte', label: 'Découverte' },
  { value: 'essentiel', label: 'Essentiel' },
  { value: 'intensif', label: 'Intensif' },
  { value: 'approfondi', label: 'Approfondi' },
];

type RawScope = {
  paid_specialty?: string;
  paid_voie?: string | null;
  specialty_wish?: string | null;
  paid_at?: string;
  paid_offer?: string;
  type?: string;
  colleges?: string[];
  signup?: { specialty?: string; voie?: string | null; session?: string; country?: string; passed_evc?: string };
};
function rawScope(s: Student): RawScope {
  return (s.permission_scope ?? {}) as RawScope;
}

const COLLEGE_TO_SPECIALTY: Record<string, string> = {
  'col-medecine-generale': 'Médecine générale',
  'col-cardiologie': 'Cardiologie',
  'col-pediatrie': 'Pédiatrie',
  'col-mir': "Médecine d'urgence",
  'col-pneumologie': 'Pneumologie',
  'col-geriatrie': 'Gériatrie',
  'col-neurologie': 'Neurologie',
  'col-medecine-interne': 'Médecine interne polyvalente',
  'col-psychiatrie': 'Psychiatrie',
  'col-gynecologie': 'Gynécologie-obstétrique',
  'col-orthopedie': 'Orthopédie',
  'col-odontologie': 'Odontologie',
};

function specialtyFromColleges(colleges: string[]): string {
  const names = colleges
    .map((c) => COLLEGE_TO_SPECIALTY[c])
    .filter(Boolean);
  return names.join(', ');
}

function specialtyOf(s: Student): string {
  const r = rawScope(s);
  const explicit = (r.paid_specialty || r.signup?.specialty || r.specialty_wish || '').toString().trim();
  if (explicit) return explicit;
  if (r.type === 'college' && Array.isArray(r.colleges)) {
    const real = r.colleges.filter((c) => c !== 'col-decouverte');
    if (real.length > 0) return specialtyFromColleges(real);
  }
  return '';
}
function voieOf(s: Student): string {
  const r = rawScope(s);
  return (r.paid_voie || r.signup?.voie || '').toString().trim();
}
/** Voie normalisée pour le filtre : accepte 'interne'/'externe' comme les
 *  libellés bruts des formulaires ('Voie interne'), cf. parseVoie côté auth. */
function voieKeyOf(s: Student): 'interne' | 'externe' | '' {
  const n = voieOf(s).toLowerCase().replace(/^voie\s+/, '');
  return n === 'interne' || n === 'externe' ? n : '';
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
/** Fin d'accès effective : date individuelle sinon date par défaut de la session. */
function effectiveAccessEnd(s: Student, sessionsById: Map<string, EvcSessionOption>): string | null {
  if (s.access_end) return s.access_end;
  if (s.evc_session_id) return sessionsById.get(s.evc_session_id)?.default_access_end ?? null;
  return null;
}
function isAccessExpired(s: Student, sessionsById: Map<string, EvcSessionOption>): boolean {
  const end = effectiveAccessEnd(s, sessionsById);
  return !!end && new Date(end).getTime() < Date.now();
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
  offers,
  sessions = [],
}: {
  students: Student[];
  colleges: { id: string; nom: string; parentId?: string | null }[];
  offers: { id: 'essentiel' | 'intensif' | 'approfondi'; label: string; unlocks: string[] }[];
  sessions?: EvcSessionOption[];
}) {
  const [q, setQ] = useState('');
  const [promo, setPromo] = useState('all');
  const [specialty, setSpecialty] = useState('all');
  const [voie, setVoie] = useState('all'); // all | interne | externe | none
  const [offer, setOffer] = useState<'all' | Offer>('all');
  const [payment, setPayment] = useState('all'); // all | paid | free
  const [period, setPeriod] = useState('all'); // all | 7 | 30 | 90 | 365
  const [access, setAccess] = useState('all'); // all | active | expired
  const [connexion, setConnexion] = useState('all'); // all | never
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [emailOpen, setEmailOpen] = useState(false);
  const [exportEnCours, setExportEnCours] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);

  const sessionsById = useMemo(() => new Map(sessions.map((s) => [s.id, s])), [sessions]);

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
      if (voie !== 'all' && voieKeyOf(s) !== (voie === 'none' ? '' : voie)) return false;
      if (offer !== 'all' && offerOf(s) !== offer) return false;
      if (payment === 'paid' && !isPaid(s)) return false;
      if (payment === 'free' && isPaid(s)) return false;
      if (access === 'active' && (!isActive(s) || isAccessExpired(s, sessionsById))) return false;
      if (access === 'expired' && isActive(s) && !isAccessExpired(s, sessionsById)) return false;
      if (connexion === 'never' && !s.never_connected) return false;
      if (!withinPeriod(s.created_at, period)) return false;
      return true;
    });
  }, [students, q, promo, specialty, voie, offer, payment, access, connexion, period, sessionsById]);

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

  /**
   * Export Excel.
   *
   * `import('xlsx')` télécharge ~400 Ko puis construit le classeur : une à
   * trois secondes pendant lesquelles le bouton ne montrait STRICTEMENT rien.
   * L'administrateur croyait son clic perdu et recliquait. On affiche l'état
   * d'avancement et on verrouille le bouton le temps de la génération.
   */
  async function exportXlsx() {
    if (exportEnCours) return;
    setExportEnCours(true);
    try {
      await genererXlsx();
    } finally {
      setExportEnCours(false);
    }
  }

  async function genererXlsx() {
    const XLSX = await import('xlsx');
    const rows = filtered.map((s) => ({
      'Nom': s.last_name ?? '',
      'Prénom': s.first_name ?? '',
      'Spécialité': specialtyOf(s) || '—',
      'Voie': voieOf(s),
      'Abonnement': offerLabel(offerOf(s)),
      'Paiement': isPaid(s) ? 'Payé' : 'Gratuit (Découverte)',
      'Accès': !isActive(s) ? 'Inactif' : isAccessExpired(s, sessionsById) ? 'Expiré' : 'Actif',
      'Session EVC': (s.evc_session_id && sessionsById.get(s.evc_session_id)?.label) || '—',
      'Accès jusqu\'au': fmtDate(effectiveAccessEnd(s, sessionsById) ?? undefined),
      'Promotion': s.promotion ?? '',
      'Adresse': s.address ?? '',
      'Téléphone': s.phone ?? '',
      'Email': s.email ?? '',
      'Inscription': fmtDate(s.created_at),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [
      { wch: 16 }, { wch: 14 }, { wch: 26 }, { wch: 10 }, { wch: 20 }, { wch: 18 },
      { wch: 14 }, { wch: 18 }, { wch: 14 }, { wch: 10 }, { wch: 28 }, { wch: 16 }, { wch: 28 }, { wch: 14 },
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
        <Select value={voie} onValueChange={setVoie}>
          <SelectTrigger className="w-full lg:w-40"><SelectValue placeholder="Voie" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes voies</SelectItem>
            <SelectItem value="interne">Voie interne</SelectItem>
            <SelectItem value="externe">Voie externe</SelectItem>
            <SelectItem value="none">Non renseignée</SelectItem>
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
        <Select value={connexion} onValueChange={setConnexion}>
          <SelectTrigger className="w-full lg:w-44"><SelectValue placeholder="Connexion" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toute connexion</SelectItem>
            <SelectItem value="never">Jamais connecté</SelectItem>
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
            onClick={() => setAssignOpen(true)}
            disabled={emailTargets.length === 0 || sessions.length === 0}
            title={sessions.length === 0 ? 'Créez d’abord une session dans Sessions EVC' : undefined}
            className="inline-flex items-center gap-1.5 rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-xs font-bold text-(--color-ink) hover:bg-(--color-sand-100) disabled:opacity-50"
          >
            <CalendarClock className="h-3.5 w-3.5" />
            {selectedInFilter.length > 0 ? `Affecter à une session (${selectedInFilter.length})` : 'Affecter la liste à une session'}
          </button>
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
            disabled={filtered.length === 0 || exportEnCours}
            className="inline-flex items-center gap-1.5 rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-xs font-bold text-(--color-ink) hover:bg-(--color-sand-100) disabled:opacity-50"
          >
            {exportEnCours
              ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Génération…</>
              : <><Download className="h-3.5 w-3.5" /> Exporter Excel</>}
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
              const voieLabel = voieOf(s);
              const accessEnd = effectiveAccessEnd(s, sessionsById);
              const accessExpired = isAccessExpired(s, sessionsById);
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
                        <p className="flex items-center gap-1.5 truncate font-medium">
                          <span className="truncate">{s.first_name} {s.last_name}</span>
                          {s.never_connected && (
                            <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">Jamais connecté</span>
                          )}
                        </p>
                        <p className="truncate font-mono text-[11px] text-(--color-ink-soft) md:hidden">{s.email}</p>
                        <p className="truncate text-[11px] text-(--color-ink-soft) lg:hidden">
                          {sp ? `${sp}${voieLabel ? ` (${voieLabel})` : ''}` : '—'}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-1 md:hidden">
                          {!isActive(s) && <Badge variant="muted">Inactif</Badge>}
                          {accessExpired && (
                            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">Expiré</span>
                          )}
                          <Badge variant={scope.offer === 'essentiel' ? 'outline' : 'primary'}>{offerLabel(scope.offer)}</Badge>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className="text-sm">{sp ? `${sp}${voieLabel ? ` (${voieLabel})` : ''}` : '—'}</span>
                  </TableCell>
                  <TableCell className="hidden font-mono text-xs text-(--color-ink-soft) md:table-cell">{s.email}</TableCell>
                  <TableCell className="hidden text-(--color-ink-soft) lg:table-cell">{s.phone ?? 'Non renseigné'}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex flex-wrap items-center gap-1">
                      <Badge variant={scope.offer === 'essentiel' ? 'outline' : 'primary'}>{offerLabel(scope.offer)}</Badge>
                      {isPaid(s) ? <Badge variant="muted">Payé</Badge> : <Badge variant="muted">Gratuit</Badge>}
                      {!isActive(s) && <Badge variant="muted">Inactif</Badge>}
                      {accessExpired && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">Expiré</span>
                      )}
                    </div>
                    {accessEnd && (
                      <p className={`mt-0.5 text-[11px] ${accessExpired ? 'text-red-700' : 'text-(--color-ink-soft)'}`}>
                        Accès jusqu&apos;au {fmtDate(accessEnd)}
                      </p>
                    )}
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
                      <EmargementsDialog
                        studentId={s.id}
                        studentName={`${s.first_name ?? ''} ${s.last_name ?? ''}`.trim() || s.email || 'élève'}
                      />
                      <EditStudentDialog student={s} colleges={colleges} offers={offers} sessions={sessions} />
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

      <AssignSessionDialog
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        studentIds={emailTargets}
        contextLabel={emailContext}
        sessions={sessions}
      />
    </>
  );
}

/** Affectation en masse d'une session EVC (fin d'accès par défaut). */
function AssignSessionDialog({
  open,
  onClose,
  studentIds,
  contextLabel,
  sessions,
}: {
  open: boolean;
  onClose: () => void;
  studentIds: string[];
  contextLabel: string;
  sessions: EvcSessionOption[];
}) {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string>('none');
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const submit = () => {
    setError(null);
    start(async () => {
      const res = await fetchAvecJetonFrais('/api/admin/assign-session', { student_ids: studentIds, evc_session_id: sessionId === 'none' ? null : sessionId });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setError(j.error ?? 'Une erreur est survenue.');
        return;
      }
      onClose();
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-(--color-accent)" />
            Affecter à une session EVC
          </DialogTitle>
          <DialogDescription>
            {contextLabel} — la date de fin d&apos;accès par défaut de la session s&apos;appliquera
            (sauf date individuelle définie sur l&apos;élève).
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Select value={sessionId} onValueChange={setSessionId}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Session" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Aucune session (pas d&apos;expiration)</SelectItem>
              {sessions.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.label} — fin {fmtDate(s.default_access_end)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error && (
            <p className="text-sm text-(--color-danger) bg-red-500/10 border border-(--color-danger)/30 rounded-lg px-3 py-2">{error}</p>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose} disabled={pending}>Annuler</Button>
          <Button type="button" onClick={submit} disabled={pending || studentIds.length === 0}>
            {pending ? <Loader2 className="animate-spin" /> : <CalendarClock />}
            Affecter ({studentIds.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
