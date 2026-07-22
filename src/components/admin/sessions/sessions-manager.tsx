'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarClock, Loader2, Pencil, Plus, Save, Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader,
  DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export type EvcSession = {
  id: string;
  label: string;
  default_access_end: string;
  is_default: boolean;
  created_at: string;
};

/** 'YYYY-MM-DD' (input date) → ISO fin de journée, heure locale de l'admin. */
function dateToEndOfDayIso(date: string): string {
  return new Date(`${date}T23:59:59`).toISOString();
}
function isoToDateInput(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function fmtEnd(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

export function SessionsManager({ sessions, counts }: { sessions: EvcSession[]; counts: Record<string, number> }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  async function call(method: string, url: string, body?: unknown): Promise<boolean> {
    setError(null);
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      setError(j.error ?? 'Une erreur est survenue.');
      return false;
    }
    router.refresh();
    return true;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        {error ? (
          <p className="text-sm text-(--color-danger) bg-red-500/10 border border-(--color-danger)/30 rounded-lg px-3 py-2">{error}</p>
        ) : <span />}
        <SessionDialog
          trigger={
            <Button>
              <Plus /> Nouvelle session
            </Button>
          }
          title="Créer une session EVC"
          onSubmit={(v) => call('POST', '/api/admin/evc-sessions', v)}
          withId
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Session</TableHead>
            <TableHead>Fin d&apos;accès par défaut</TableHead>
            <TableHead className="hidden md:table-cell">Élèves</TableHead>
            <TableHead className="hidden md:table-cell">Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="py-10 text-center text-(--color-ink-soft)">
                Aucune session. Créez la première (ex. « Session EVC 2026 ») puis marquez-la « par défaut »
                pour qu&apos;elle soit affectée automatiquement aux nouveaux achats.
              </TableCell>
            </TableRow>
          ) : (
            sessions.map((s) => {
              const expired = new Date(s.default_access_end).getTime() < Date.now();
              return (
                <TableRow key={s.id}>
                  <TableCell>
                    <p className="font-medium">{s.label}</p>
                    <p className="font-mono text-[11px] text-(--color-ink-soft)">{s.id}</p>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 text-sm">
                      <CalendarClock className="h-3.5 w-3.5 text-(--color-ink-soft)" />
                      {fmtEnd(s.default_access_end)}
                    </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{counts[s.id] ?? 0}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {s.is_default && <Badge variant="primary">Par défaut</Badge>}
                      {expired && <Badge variant="muted">Échue</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {!s.is_default && (
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Définir comme session par défaut (nouveaux achats)"
                          aria-label="Définir comme session par défaut"
                          disabled={pending}
                          onClick={() => start(async () => { await call('PATCH', `/api/admin/evc-sessions/${s.id}`, { is_default: true }); })}
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                      )}
                      <SessionDialog
                        trigger={
                          <Button variant="ghost" size="icon" aria-label="Modifier la session" title="Modifier la session">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        }
                        title="Modifier la session"
                        initial={s}
                        onSubmit={(v) => call('PATCH', `/api/admin/evc-sessions/${s.id}`, { label: v.label, default_access_end: v.default_access_end })}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Supprimer la session"
                        aria-label="Supprimer la session"
                        disabled={pending}
                        onClick={() => {
                          if (!window.confirm(`Supprimer la session « ${s.label} » ?`)) return;
                          start(async () => { await call('DELETE', `/api/admin/evc-sessions/${s.id}`); });
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-(--color-danger)" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function SessionDialog({
  trigger,
  title,
  initial,
  onSubmit,
  withId,
}: {
  trigger: React.ReactNode;
  title: string;
  initial?: EvcSession;
  onSubmit: (v: { id: string; label: string; default_access_end: string; is_default?: boolean }) => Promise<boolean>;
  withId?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [id, setId] = useState(initial?.id ?? '');
  const [label, setLabel] = useState(initial?.label ?? '');
  const [endDate, setEndDate] = useState(initial ? isoToDateInput(initial.default_access_end) : '');
  const [isDefault, setIsDefault] = useState(initial?.is_default ?? false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!label.trim()) { setLocalError('Libellé requis.'); return; }
    if (!endDate) { setLocalError('Date de fin requise.'); return; }
    if (withId && !/^[a-z0-9-]+$/.test(id)) { setLocalError('Identifiant : minuscules, chiffres et tirets uniquement (ex. evc-2026).'); return; }
    start(async () => {
      const ok = await onSubmit({
        id,
        label: label.trim(),
        default_access_end: dateToEndOfDayIso(endDate),
        ...(withId ? { is_default: isDefault } : {}),
      });
      if (ok) setOpen(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-(--color-accent)" />
            {title}
          </DialogTitle>
          <DialogDescription>
            Au-delà de la date de fin, l&apos;accès des élèves rattachés est bloqué (web et application mobile,
            y compris hors connexion), sauf date individuelle définie sur l&apos;élève.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          {withId && (
            <div className="space-y-1.5">
              <Label htmlFor="session-id">Identifiant</Label>
              <Input id="session-id" value={id} onChange={(e) => setId(e.target.value)} placeholder="evc-2026" />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="session-label">Libellé</Label>
            <Input id="session-label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Session EVC 2026" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="session-end">Fin d&apos;accès (incluse)</Label>
            <Input id="session-end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          {withId && (
            <label className="flex items-start gap-3 rounded-xl border border-(--color-border) px-3 py-2.5 cursor-pointer hover:bg-(--color-primary-soft)">
              <Checkbox checked={isDefault} onCheckedChange={(v) => setIsDefault(!!v)} />
              <span>
                <span className="block text-sm font-semibold text-(--color-ink)">Session par défaut</span>
                <span className="block text-[12px] text-(--color-ink-soft)">
                  Affectée automatiquement aux nouveaux achats (et remplace l&apos;actuelle session par défaut).
                </span>
              </span>
            </label>
          )}
          {localError && (
            <p className="text-sm text-(--color-danger) bg-red-500/10 border border-(--color-danger)/30 rounded-lg px-3 py-2">{localError}</p>
          )}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={pending}>Annuler</Button>
            <Button type="submit" disabled={pending}>
              {pending ? <Loader2 className="animate-spin" /> : <Save />}
              Enregistrer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
