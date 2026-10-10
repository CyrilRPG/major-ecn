'use client';

import * as React from 'react';
import { Check, Copy, Inbox, Lock, Mail, MessageSquare, PhoneCall } from 'lucide-react';
import { CANAL_LABEL } from '@/lib/cockpit/regles';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Bouton } from '@/components/admin/cockpit/ui';

/**
 * Outils partagés des dossiers du cockpit (demandes clients, réclamations,
 * améliorations) : fenêtre modale aux couleurs du kit, dates en heure de
 * Paris (identiques côté serveur et navigateur), synchronisation discrète de
 * l'adresse, copie dans le presse-papiers.
 */

const FUSEAU = 'Europe/Paris';

export function dateCourte(iso: string | null | undefined): string {
  if (!iso) return '—';
  // Une date calendaire (AAAA-MM-JJ) s'affiche sans conversion de fuseau.
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
  }
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', timeZone: FUSEAU });
}

export function dateHeure(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: FUSEAU });
}

/** Instant ISO → valeur d'un champ `datetime-local` (heure locale du navigateur). */
export function versChampLocal(iso: string | null | undefined): string {
  const d = iso ? new Date(iso) : new Date();
  if (Number.isNaN(d.getTime())) return '';
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** Valeur d'un champ `datetime-local` → instant ISO (avec fuseau), ou chaîne vide. */
export function depuisChampLocal(v: string): string {
  if (!v) return '';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString();
}

export const numero3 = (n: number | null | undefined) => String(n ?? 0).padStart(3, '0');

/** Met à jour la barre d'adresse sans recharger la page (Next synchronise useSearchParams). */
export function majUrl(changes: Record<string, string | null>) {
  const url = new URL(window.location.href);
  for (const [k, v] of Object.entries(changes)) {
    if (v === null || v === '') url.searchParams.delete(k);
    else url.searchParams.set(k, v);
  }
  window.history.replaceState(null, '', url.pathname + url.search);
}

export function Fenetre({
  ouvert, onOuvert, titre, sousTitre, large, children,
}: {
  ouvert: boolean;
  onOuvert: (o: boolean) => void;
  titre: React.ReactNode;
  sousTitre?: React.ReactNode;
  large?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Dialog open={ouvert} onOpenChange={onOuvert}>
      <DialogContent
        className={cn(
          'gap-0 rounded-2xl border border-(--color-border) bg-(--color-surface) p-0 text-(--color-ink) shadow-[0_24px_64px_-24px_rgba(60,20,30,0.35)]',
          large ? 'max-w-3xl' : 'max-w-2xl',
        )}
      >
        <div className="border-b border-(--color-border) px-5 pb-3 pt-5 pr-12 sm:px-6">
          <DialogTitle className="text-[20px] font-semibold leading-snug text-(--color-ink)">{titre}</DialogTitle>
          {sousTitre ? (
            <DialogDescription asChild>
              <div className="mt-1 text-[13px] text-(--color-ink-soft)">{sousTitre}</div>
            </DialogDescription>
          ) : (
            <DialogDescription className="sr-only">Fenêtre du cockpit</DialogDescription>
          )}
        </div>
        <div className="px-5 py-4 sm:px-6">{children}</div>
      </DialogContent>
    </Dialog>
  );
}

export function BoutonCopier({ texte, className }: { texte: string; className?: string }) {
  const [copie, setCopie] = React.useState(false);
  return (
    <Bouton
      type="button"
      variante="contour"
      taille="sm"
      className={className}
      disabled={!texte}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(texte);
          setCopie(true);
          setTimeout(() => setCopie(false), 2000);
        } catch {
          setCopie(false);
        }
      }}
    >
      {copie ? <Check /> : <Copy />}
      {copie ? 'Copié' : 'Copier'}
    </Bouton>
  );
}

/** Mention de confidentialité des informations financières (demandes comptables). */
export function NoteConfidentielle({ className }: { className?: string }) {
  return (
    <p className={cn('flex items-start gap-1.5 rounded-lg bg-(--color-primary-soft)/60 px-2.5 py-1.5 text-[12px] text-(--color-primary)', className)}>
      <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      Visible uniquement par les administrateurs, l’auteur et la personne chargée du traitement.
    </p>
  );
}

/** Ligne « libellé : valeur » des fiches de détail. */
export function Info({ libelle, children, className }: { libelle: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('min-w-0', className)}>
      <dt className="text-[11.5px] font-medium uppercase tracking-wide text-(--color-ink-muted)">{libelle}</dt>
      <dd className="mt-0.5 break-words text-[13.5px] text-(--color-ink)">{children}</dd>
    </div>
  );
}

/** Tuile d'indicateur cliquable (bandeau de KPI). */
export function Tuile({
  libelle, valeur, ton = 'bordeaux', actif, onClick, icone: Icone,
}: {
  libelle: string;
  valeur: number;
  ton?: 'bordeaux' | 'rouge' | 'orange' | 'bleu' | 'vert' | 'violet';
  actif?: boolean;
  onClick?: () => void;
  icone: React.ComponentType<{ className?: string }>;
}) {
  const teintes: Record<string, string> = {
    bordeaux: 'bg-(--color-primary-soft) text-(--color-primary)',
    rouge: 'bg-[#FCE4E4] text-[#B42318]',
    orange: 'bg-[#FFF0E1] text-[#C2570C]',
    bleu: 'bg-[#E8F0FC] text-[#2F5DA8]',
    vert: 'bg-[#E6F4EA] text-[#1F7A3E]',
    violet: 'bg-[#F1EDF7] text-[#6B4FA0]',
  };
  const Balise = onClick ? 'button' : 'div';
  return (
    <Balise
      {...(onClick ? { type: 'button' as const, onClick, 'aria-pressed': !!actif } : {})}
      className={cn(
        'flex min-w-0 items-center gap-3 rounded-2xl border bg-(--color-surface) px-4 py-3 text-left shadow-[0_1px_2px_rgba(60,20,30,0.04)] transition-colors',
        actif ? 'border-(--color-primary) ring-2 ring-(--color-primary)/15' : 'border-(--color-border)',
        onClick && 'hover:border-(--color-border) focus-ring',
      )}
    >
      <span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-xl', teintes[ton])}>
        <Icone className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-[22px] font-semibold leading-none tracking-tight text-(--color-ink)">{valeur}</span>
        <span className="mt-1 block truncate text-[12.5px] text-(--color-ink-soft)">{libelle}</span>
      </span>
    </Balise>
  );
}

/** Puce de filtre (pilule sélectionnable). */
export function Puce({ actif, onClick, children }: { actif: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={actif}
      className={cn(
        'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium transition-colors focus-ring',
        actif ? 'bg-(--color-primary) text-white' : 'border border-(--color-border) bg-white text-(--color-ink-soft) hover:bg-(--color-primary-soft) hover:text-(--color-primary)',
      )}
    >
      {children}
    </button>
  );
}

export const selectFiltre =
  'h-8 rounded-lg border border-(--color-border) bg-white px-2.5 text-[13px] text-(--color-ink) focus:border-(--color-primary) focus:outline-none focus:ring-2 focus:ring-(--color-primary)/15';

export const estEnRetard = (l: { echeance: string | null; statut: string }, aujourdHui: string) =>
  l.statut !== 'terminee' && !!l.echeance && l.echeance < aujourdHui;

export function IconeCanal({ canal, className }: { canal: string; className?: string }) {
  const I = canal === 'telephone' ? PhoneCall : canal === 'email' ? Mail : canal === 'messagerie' ? MessageSquare : Inbox;
  return <I className={className} aria-label={CANAL_LABEL[canal] ?? canal} />;
}
