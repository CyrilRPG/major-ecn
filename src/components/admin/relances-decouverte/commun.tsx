'use client';

import * as React from 'react';
import { Download, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { fetchAuthentifie } from '@/lib/auth/fresh-token';
import { STATUT_COULEUR, STATUT_LABEL, type Statut } from '@/lib/decouverte/types';

/** Petits composants partagés du module de relances de l'Offre Découverte. */

export const API = '/api/admin/relances-decouverte';

/** Appel JSON authentifié (Bearer frais) : lève une erreur lisible. */
export async function appelJson<T>(url: string, init?: { method?: string; body?: unknown }): Promise<T> {
  const res = await fetchAuthentifie(url, {
    method: init?.method ?? (init?.body !== undefined ? 'POST' : 'GET'),
    ...(init?.body !== undefined ? { body: JSON.stringify(init.body), headers: { 'content-type': 'application/json' } } : {}),
  });
  const j = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(j.error ?? `Erreur ${res.status}`);
  return j;
}

/** Clé d'idempotence d'une opération : générée UNE fois par intention d'envoi. */
export function nouvelleCle(): string {
  const c = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return c.replace(/[^A-Za-z0-9_-]/g, '');
}

export function StatutBadge({ statut, className }: { statut: Statut; className?: string }) {
  const c = STATUT_COULEUR[statut];
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-semibold', className)} style={{ background: c.fond, color: c.texte }}>
      <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: statut === 'BLOQUE' ? '#fff' : c.point }} />
      {STATUT_LABEL[statut]}
    </span>
  );
}

export function Message({ erreur, info }: { erreur?: string | null; info?: string | null }) {
  if (erreur) return <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">{erreur}</p>;
  if (info) return <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">{info}</p>;
  return null;
}

export function Panneau({ titre, description, action, children, className }: { titre: string; description?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn('rounded-(--radius-card) border border-(--color-border) bg-(--color-surface) p-4 shadow-(--shadow-soft) sm:p-5', className)}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-(--color-ink)">{titre}</h2>
          {description && <p className="mt-0.5 text-sm text-(--color-ink-soft)">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export const champ = 'h-10 w-full rounded-(--radius-button) border border-(--color-border) bg-(--color-surface) px-3 text-sm text-(--color-ink) focus-ring disabled:opacity-50';

export function Libelle({ label, aide, children, className }: { label: string; aide?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn('flex min-w-0 flex-col gap-1', className)}>
      <span className="text-xs font-medium text-(--color-ink-soft)">{label}</span>
      {children}
      {aide && <span className="text-[11px] text-(--color-ink-muted)">{aide}</span>}
    </label>
  );
}

/** Téléchargement authentifié d'un export (Bearer frais : un simple lien enverrait un cookie périmé). */
export function BoutonExport({ href, nom, label }: { href: string; nom: string; label: string }) {
  const [occupe, setOccupe] = React.useState(false);
  const [erreur, setErreur] = React.useState<string | null>(null);
  async function lancer() {
    setOccupe(true); setErreur(null);
    try {
      const res = await fetchAuthentifie(href);
      if (!res.ok) throw new Error(((await res.json().catch(() => ({}))) as { error?: string }).error ?? `Erreur ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = nom; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch (e) {
      setErreur(e instanceof Error ? e.message : 'Téléchargement impossible');
    } finally {
      setOccupe(false);
    }
  }
  return (
    <span className="inline-flex flex-col gap-1">
      <Button type="button" variant="outline" size="sm" onClick={lancer} disabled={occupe}>
        {occupe ? <Loader2 className="animate-spin" /> : <Download />}
        {label}
      </Button>
      {erreur && <span className="text-xs text-(--color-danger)">{erreur}</span>}
    </span>
  );
}
