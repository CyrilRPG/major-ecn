'use client';

import { useMemo, useState, useTransition } from 'react';
import { Search, ShieldCheck, GraduationCap, Pencil, Plus, Trash2, RefreshCw, Undo2, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { restoreFromLogAction } from '@/app/admin/contenu/[cours]/qcm-actions';

export type LogRow = {
  id: string;
  created_at: string;
  actor_name: string | null;
  actor_email: string | null;
  actor_role: string | null;
  action: 'create' | 'update' | 'delete' | 'replace' | string;
  entity_type: string;
  entity_id: string | null;
  cours_titre: string | null;
  matiere_nom: string | null;
  description: string | null;
  diff: Record<string, unknown> | null;
};

const ACTION_THEME: Record<string, { bg: string; fg: string; Icon: typeof Plus; label: string }> = {
  create:  { bg: '#E7F6EC', fg: '#16793C', Icon: Plus,    label: 'Création' },
  update:  { bg: '#E5F1FF', fg: '#1E4D8B', Icon: Pencil,  label: 'Modification' },
  replace: { bg: '#FEF3E2', fg: '#B26A00', Icon: RefreshCw, label: 'Remplacement' },
  delete:  { bg: '#FDE7E9', fg: '#C0001F', Icon: Trash2,  label: 'Suppression' },
};

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

export function LogsTable({ logs }: { logs: LogRow[] }) {
  const [q, setQ] = useState('');
  const [action, setAction] = useState<string>('all');
  const [role, setRole] = useState<string>('all');

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return logs.filter((l) => {
      if (action !== 'all' && l.action !== action) return false;
      if (role !== 'all' && l.actor_role !== role) return false;
      if (!qq) return true;
      const haystack = [
        l.actor_name, l.actor_email, l.entity_type, l.description,
        l.cours_titre, l.matiere_nom,
      ].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(qq);
    });
  }, [logs, q, action, role]);

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-(--color-ink-soft)" />
          <Input
            className="pl-9"
            placeholder="Rechercher dans le journal (acteur, action, cours, description)…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <Select value={action} onValueChange={setAction}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Action" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes actions</SelectItem>
            <SelectItem value="create">Création</SelectItem>
            <SelectItem value="update">Modification</SelectItem>
            <SelectItem value="replace">Remplacement</SelectItem>
            <SelectItem value="delete">Suppression</SelectItem>
          </SelectContent>
        </Select>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Rôle" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous rôles</SelectItem>
            <SelectItem value="admin">Administrateur</SelectItem>
            <SelectItem value="professor">Professeur</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="mb-3 text-xs text-(--color-ink-muted)">
        {filtered.length.toLocaleString('fr-FR')} entrée{filtered.length > 1 ? 's' : ''} sur {logs.length.toLocaleString('fr-FR')} (1000 plus récentes).
      </p>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-44">Horodatage</TableHead>
            <TableHead>Acteur</TableHead>
            <TableHead className="w-32">Action</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="hidden lg:table-cell">Cours / Matière</TableHead>
            <TableHead className="w-28 text-right">Restaurer</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center text-(--color-ink-soft)">
                Aucune entrée correspondant aux filtres.
              </TableCell>
            </TableRow>
          ) : filtered.map((l) => {
            const theme = ACTION_THEME[l.action] ?? { bg: '#F2F3F5', fg: '#475569', Icon: Pencil, label: l.action };
            const ActionIcon = theme.Icon;
            const isAdmin = l.actor_role === 'admin';
            return (
              <TableRow key={l.id}>
                <TableCell className="font-mono text-[11px] text-(--color-ink-soft) tabular-nums whitespace-nowrap">
                  {fmtDate(l.created_at)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                      style={{ background: isAdmin ? '#FFE4E8' : '#E5F1FF', color: isAdmin ? '#C0001F' : '#1E4D8B' }}
                      title={isAdmin ? 'Administrateur' : 'Professeur'}
                    >
                      {isAdmin ? <ShieldCheck className="h-3.5 w-3.5" /> : <GraduationCap className="h-3.5 w-3.5" />}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-(--color-ink)">{l.actor_name ?? '—'}</p>
                      <p className="truncate text-[11px] text-(--color-ink-muted)">{l.actor_email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold"
                    style={{ background: theme.bg, color: theme.fg }}
                  >
                    <ActionIcon className="h-3 w-3" />
                    {theme.label}
                  </span>
                  <p className="mt-0.5 text-[10px] text-(--color-ink-muted)">{l.entity_type}</p>
                </TableCell>
                <TableCell className="text-sm text-(--color-ink) max-w-md">
                  {l.description ?? <span className="text-(--color-ink-muted) italic">—</span>}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {l.cours_titre ? (
                    <div className="flex flex-col gap-0.5">
                      <Badge variant="muted">{l.cours_titre}</Badge>
                      {l.matiere_nom && <span className="text-[10px] text-(--color-ink-muted)">{l.matiere_nom}</span>}
                    </div>
                  ) : (
                    <span className="text-xs text-(--color-ink-muted)">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {l.action === 'delete' && (l.diff as { snapshot?: unknown } | null)?.snapshot ? (
                    <RestoreButton logId={l.id} />
                  ) : (
                    <span className="text-[10px] text-(--color-ink-muted)">—</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
}

function RestoreButton({ logId }: { logId: string }) {
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const onClick = () => {
    if (done) return;
    if (!confirm('Restaurer cet élément depuis le journal ?')) return;
    setErr(null);
    start(async () => {
      const res = await restoreFromLogAction(logId);
      if ('error' in res) setErr(res.error);
      else { setDone(true); setTimeout(() => window.location.reload(), 700); }
    });
  };
  if (done) return <span className="text-[11px] font-semibold text-[#16793C]">Restauré ✓</span>;
  return (
    <>
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        title="Restaurer cet élément (recrée la flashcard / question / série)"
        className="inline-flex items-center gap-1 rounded-md border border-(--color-border) bg-white px-2 py-1 text-[11px] font-semibold text-(--color-ink) hover:border-[#16A34A] hover:text-[#16793C] disabled:opacity-50"
      >
        {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Undo2 className="h-3 w-3" />}
        Restaurer
      </button>
      {err && <p className="mt-1 text-[10px] text-(--color-danger)">{err}</p>}
    </>
  );
}
