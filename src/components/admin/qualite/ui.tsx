'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { EFFECTIF_FAIBLE, type Taux } from '@/lib/qualite/indicateurs';

/** Composants partagés de l'espace « Qualité & Suivi des candidats ». */

const ONGLETS = [
  { href: '/admin/qualite', label: 'Vue générale', exact: true },
  { href: '/admin/qualite/enquetes', label: 'Enquêtes' },
  { href: '/admin/qualite/candidats', label: 'Candidats' },
  { href: '/admin/qualite/remarques', label: 'Remarques' },
  { href: '/admin/qualite/enseignants', label: 'Enseignants' },
  { href: '/admin/qualite/contenus', label: 'Contenus' },
  { href: '/admin/qualite/alertes', label: 'Alertes' },
  { href: '/admin/qualite/reclamations', label: 'Réclamations' },
  { href: '/admin/qualite/actions', label: 'Actions correctives' },
  { href: '/admin/qualite/seances', label: 'Séances' },
  { href: '/admin/qualite/exports', label: 'Exports & journal' },
  { href: '/admin/qualite/parametres', label: 'Paramètres' },
];

export function OngletsQualite({ actif }: { actif: boolean }) {
  const pathname = usePathname() ?? '';
  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-5 lg:px-8">
      {!actif && (
        <div className="mb-3 rounded-(--radius-card) border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
          Module <strong>éteint</strong> : aucun questionnaire n&apos;est envoyé, aucun e-mail ne part, rien n&apos;est bloqué.{' '}
          <Link href="/admin/qualite/parametres" className="font-semibold underline">Activer dans les paramètres</Link>
        </div>
      )}
      <nav aria-label="Qualité" className="-mb-px flex gap-1 overflow-x-auto border-b border-(--color-border)">
        {ONGLETS.map((t) => {
          const a = t.exact ? pathname === t.href : pathname.startsWith(t.href);
          return (
            <Link key={t.href} href={t.href}
              className={cn('shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
                a ? 'border-(--color-primary) text-(--color-primary)' : 'border-transparent text-(--color-ink-soft) hover:text-(--color-ink)')}>
              {t.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function Kpi({ label, valeur, detail, href, ton }: { label: string; valeur: React.ReactNode; detail?: React.ReactNode; href?: string; ton?: 'alerte' | 'ok' }) {
  const corps = (
    <div className={cn('h-full rounded-(--radius-card) border bg-(--color-surface) p-4 shadow-(--shadow-soft)',
      ton === 'alerte' ? 'border-red-300 dark:border-red-800' : 'border-(--color-border)', href && 'hover:border-(--color-primary)')}>
      <p className="text-xs font-medium uppercase tracking-wide text-(--color-ink-muted)">{label}</p>
      <p className={cn('mt-1 text-2xl font-semibold', ton === 'alerte' ? 'text-red-600' : 'text-(--color-ink)')}>{valeur}</p>
      {detail && <p className="mt-0.5 text-xs text-(--color-ink-soft)">{detail}</p>}
    </div>
  );
  return href ? <Link href={href} className="block">{corps}</Link> : corps;
}

/** Un taux n'est jamais affiché sans ses effectifs (§17). */
export function TauxTexte({ t, inverse }: { t: Taux; inverse?: boolean }) {
  if (t.pct === null) return <span className="text-(--color-ink-muted)">— <span className="text-xs">(0/0)</span></span>;
  const faible = t.total < EFFECTIF_FAIBLE;
  return (
    <span title={faible ? 'Effectif faible : à interpréter avec prudence' : undefined}>
      <span className={cn('font-semibold', inverse && t.pct > 20 ? 'text-red-600' : '')}>{t.pct} %</span>{' '}
      <span className="text-xs text-(--color-ink-muted)">({t.n}/{t.total}){faible ? ' *' : ''}</span>
    </span>
  );
}

const NIVEAU: Record<string, string> = {
  critique: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  vigilance: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  recurrence: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300',
  negatif: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  mixte: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  positif: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  neutre: 'bg-(--color-surface-soft) text-(--color-ink-soft)',
  ok: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
};
export function Pastille({ ton, children }: { ton: string; children: React.ReactNode }) {
  return <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', NIVEAU[ton] ?? 'border border-(--color-border) text-(--color-ink-soft)')}>{children}</span>;
}

export function Carte({ titre, description, action, children, className }: { titre: string; description?: React.ReactNode; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn('rounded-(--radius-card) border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-soft)', className)}>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-(--color-ink)">{titre}</h2>
          {description && <p className="mt-0.5 text-sm text-(--color-ink-soft)">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function EnTete({ titre, description, action }: { titre: string; description?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-(--color-border) pb-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-(--color-ink)">{titre}</h1>
        {description && <p className="mt-1 max-w-3xl text-sm text-(--color-ink-soft)">{description}</p>}
      </div>
      {action}
    </header>
  );
}

export const champ = 'h-9 rounded-(--radius-button) border border-(--color-border) bg-(--color-surface) px-2 text-sm text-(--color-ink) focus-ring';

export type OptionFiltre = { cle: string; label: string; options?: { v: string; l: string }[]; type?: 'date' | 'texte' };

/** Barre de filtres combinables (§32) : simple formulaire GET sur la page. */
export function BarreFiltres({ filtres }: { filtres: OptionFiltre[] }) {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname() ?? '';
  return (
    <form
      className="mb-5 flex flex-wrap items-end gap-2 rounded-(--radius-card) border border-(--color-border) bg-(--color-surface-soft) p-3"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const u = new URLSearchParams();
        for (const [k, v] of fd.entries()) if (typeof v === 'string' && v.trim()) u.set(k, v.trim());
        router.push(`${pathname}${u.toString() ? `?${u}` : ''}`);
      }}
    >
      {filtres.map((f) => (
        <label key={f.cle} className="flex flex-col gap-1 text-xs text-(--color-ink-muted)">
          {f.label}
          {f.options ? (
            <select name={f.cle} defaultValue={sp?.get(f.cle) ?? ''} className={champ}>
              <option value="">Tous</option>
              {f.options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
            </select>
          ) : (
            <input name={f.cle} type={f.type === 'date' ? 'date' : 'text'} defaultValue={sp?.get(f.cle) ?? ''} className={cn(champ, f.type === 'date' ? 'w-36' : 'w-44')} />
          )}
        </label>
      ))}
      <Button type="submit" size="sm">Filtrer</Button>
      <Button type="button" size="sm" variant="ghost" onClick={() => router.push(pathname)}>Réinitialiser</Button>
    </form>
  );
}

export type ChampAction = { nom: string; label: string; type?: 'texte' | 'long' | 'date' | 'datetime' | 'select' | 'nombre'; options?: { v: string; l: string }[]; requis?: boolean; defaut?: string };

/**
 * Bouton qui appelle une server action, avec petit formulaire facultatif
 * (motif, date…). Le résultat `{ ok, error }` s'affiche à côté ; la page est
 * rafraîchie en cas de succès.
 */
export function BoutonAction({ label, action, champs, variant = 'outline', confirmer, taille = 'sm' }: {
  label: string;
  action: (donnees: Record<string, string>) => Promise<{ ok: boolean; error?: string; message?: string }>;
  champs?: ChampAction[];
  variant?: 'primary' | 'outline' | 'ghost' | 'danger' | 'secondary';
  confirmer?: string;
  taille?: 'sm' | 'md';
}) {
  const router = useRouter();
  const [ouvert, setOuvert] = React.useState(false);
  const [occupe, setOccupe] = React.useState(false);
  const [msg, setMsg] = React.useState<{ ok: boolean; t: string } | null>(null);
  async function lancer(donnees: Record<string, string>) {
    if (confirmer && !window.confirm(confirmer)) return;
    setOccupe(true); setMsg(null);
    try {
      const r = await action(donnees);
      if (r.ok) { setMsg(r.message ? { ok: true, t: r.message } : null); setOuvert(false); router.refresh(); }
      else setMsg({ ok: false, t: r.error ?? 'Échec' });
    } catch (e) {
      setMsg({ ok: false, t: e instanceof Error ? e.message : 'Échec' });
    } finally { setOccupe(false); }
  }
  if (!champs?.length) {
    return (
      <span className="inline-flex flex-col gap-1">
        <Button type="button" size={taille} variant={variant} disabled={occupe} onClick={() => lancer({})}>{occupe && <Loader2 className="animate-spin" />}{label}</Button>
        {msg && <span className={cn('text-xs', msg.ok ? 'text-green-700' : 'text-(--color-danger)')}>{msg.t}</span>}
      </span>
    );
  }
  return (
    <span className="inline-flex flex-col gap-1">
      <Button type="button" size={taille} variant={variant} onClick={() => setOuvert((o) => !o)}>{label}</Button>
      {ouvert && (
        <form
          className="mt-1 flex min-w-64 flex-col gap-2 rounded-(--radius-button) border border-(--color-border) bg-(--color-surface) p-3 shadow-(--shadow-soft)"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const d: Record<string, string> = {};
            for (const [k, v] of fd.entries()) d[k] = String(v);
            lancer(d);
          }}
        >
          {champs.map((c) => (
            <label key={c.nom} className="flex flex-col gap-1 text-xs text-(--color-ink-soft)">
              {c.label}
              {c.type === 'long' ? <textarea name={c.nom} required={c.requis} defaultValue={c.defaut} rows={3} className="rounded-(--radius-button) border border-(--color-border) bg-(--color-surface) p-2 text-sm text-(--color-ink)" />
                : c.type === 'select' ? (
                  <select name={c.nom} required={c.requis} defaultValue={c.defaut} className={champ}>
                    {!c.requis && <option value="">—</option>}
                    {(c.options ?? []).map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
                  </select>
                ) : <input name={c.nom} required={c.requis} defaultValue={c.defaut} type={c.type === 'date' ? 'date' : c.type === 'datetime' ? 'datetime-local' : c.type === 'nombre' ? 'number' : 'text'} className={champ} />}
            </label>
          ))}
          <div className="flex gap-2">
            <Button type="submit" size="sm" variant={variant === 'outline' ? 'primary' : variant} disabled={occupe}>{occupe && <Loader2 className="animate-spin" />}Valider</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setOuvert(false)}>Annuler</Button>
          </div>
        </form>
      )}
      {msg && <span className={cn('text-xs', msg.ok ? 'text-green-700' : 'text-(--color-danger)')}>{msg.t}</span>}
    </span>
  );
}

export function Vide({ children }: { children: React.ReactNode }) {
  return <p className="py-6 text-center text-sm text-(--color-ink-muted)">{children}</p>;
}
