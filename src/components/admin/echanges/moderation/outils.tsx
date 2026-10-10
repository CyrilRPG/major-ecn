'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Bouton, champ, Libelle, useMessage } from '@/components/admin/cockpit/ui';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

/**
 * Outils communs des écrans de modération du back-office des Échanges :
 * dates à l'heure de Paris, appel des actions serveur avec retour bref,
 * sélection multiple et fenêtre de confirmation avec motif.
 */

export type ResultatAction<T = unknown> = { ok: true; data?: T } | { ok: false; erreur: string };

const FORMAT_PARIS = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'Europe/Paris', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
});
const FORMAT_JOUR = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', day: 'numeric', month: 'short', year: 'numeric' });

/**
 * Date lisible à l'heure de Paris. Assemblée à partir des parties (et non du
 * `format` global) pour un rendu identique côté serveur et navigateur.
 */
export function dateParis(iso: string | null | undefined, avecHeure = true): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return '—';
  const p = Object.fromEntries((avecHeure ? FORMAT_PARIS : FORMAT_JOUR).formatToParts(d).map((x) => [x.type, x.value]));
  const jour = `${p.day} ${p.month} ${p.year}`;
  return avecHeure ? `${jour} · ${p.hour}:${p.minute}` : jour;
}

/** Appel d'une action serveur : état « en cours » par clé, message bref, rafraîchissement de la page. */
export function useActionServeur() {
  const router = useRouter();
  const [message, setMessage] = useMessage();
  const [enCours, setEnCours] = React.useState<string | null>(null);

  const lancer = async <T,>(
    cle: string,
    f: () => Promise<ResultatAction<T>>,
    succes: string | ((data: T | undefined) => string),
  ): Promise<ResultatAction<T>> => {
    setEnCours(cle);
    let r: ResultatAction<T>;
    try {
      r = await f();
    } catch (e) {
      r = { ok: false, erreur: e instanceof Error ? e.message : 'Action impossible.' };
    }
    setEnCours(null);
    if (r.ok) {
      setMessage(typeof succes === 'function' ? succes(r.data) : succes);
      router.refresh();
    } else {
      setMessage(r.erreur);
    }
    return r;
  };

  return { message, setMessage, enCours, lancer, rafraichir: () => router.refresh() };
}

/** Sélection multiple limitée aux lignes encore présentes (les autres disparaissent après rafraîchissement). */
export function useSelection(ids: string[]) {
  const [choix, setChoix] = React.useState<Set<string>>(() => new Set());
  const choisis = ids.filter((id) => choix.has(id));
  const tous = ids.length > 0 && choisis.length === ids.length;
  return {
    choisis,
    tous,
    estChoisi: (id: string) => choix.has(id),
    basculer: (id: string) => setChoix((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    }),
    basculerTous: () => setChoix(tous ? new Set() : new Set(ids)),
    vider: () => setChoix(new Set()),
  };
}

export function CaseACocher({ coche, onChange, libelle, className }: { coche: boolean; onChange: () => void; libelle: string; className?: string }) {
  return (
    <input
      type="checkbox"
      checked={coche}
      onChange={onChange}
      aria-label={libelle}
      className={cn('h-4 w-4 shrink-0 cursor-pointer accent-(--color-primary)', className)}
    />
  );
}

/** Nom + e-mail d'une personne (auteur, signaleur, modérateur). */
export function Personne({ p, vide = 'Compte supprimé' }: { p: { nom: string; email: string | null } | null; vide?: string }) {
  if (!p) return <span className="text-(--color-ink-muted)">{vide}</span>;
  return (
    <span className="min-w-0">
      <span className="font-medium text-(--color-ink)">{p.nom}</span>
      {p.email && <span className="ml-1.5 break-all text-[12px] text-(--color-ink-muted)">{p.email}</span>}
    </span>
  );
}

/** Contenu d'un message, replié au-delà de quelques lignes. */
export function Contenu({ texte, className }: { texte: string; className?: string }) {
  const [deplie, setDeplie] = React.useState(false);
  const long = texte.length > 420 || texte.split('\n').length > 6;
  return (
    <div className={className}>
      <p className={cn('whitespace-pre-wrap break-words text-[13.5px] leading-relaxed text-(--color-ink)', long && !deplie && 'line-clamp-6')}>{texte}</p>
      {long && (
        <button type="button" onClick={() => setDeplie((v) => !v)} className="mt-1 text-[12px] font-medium text-(--color-primary) hover:underline focus-ring">
          {deplie ? 'Replier' : 'Lire la suite'}
        </button>
      )}
    </div>
  );
}

/**
 * Fenêtre de confirmation avec motif (facultatif ou obligatoire). Montée à
 * l'ouverture seulement : son état repart de zéro à chaque fois.
 */
export function FenetreMotif({
  titre, description, libelleMotif = 'Motif', aideMotif, placeholder, motifObligatoire = false, motifInitial = '',
  libelleAction, variante = 'plein', enCours, onConfirmer, onFermer, children,
}: {
  titre: string;
  description?: React.ReactNode;
  libelleMotif?: string;
  aideMotif?: string;
  placeholder?: string;
  motifObligatoire?: boolean;
  motifInitial?: string;
  libelleAction: string;
  variante?: 'plein' | 'danger';
  enCours?: boolean;
  onConfirmer: (motif: string | null) => void;
  onFermer: () => void;
  children?: React.ReactNode;
}) {
  const [motif, setMotif] = React.useState(motifInitial);
  const id = React.useId();
  const valide = !motifObligatoire || motif.trim().length > 0;
  return (
    <Dialog open onOpenChange={(o) => { if (!o) onFermer(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{titre}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
        <div>
          <Libelle htmlFor={id} aide={aideMotif ?? (motifObligatoire ? undefined : '(facultatif)')}>{libelleMotif}</Libelle>
          <textarea id={id} value={motif} onChange={(e) => setMotif(e.target.value)} rows={3} maxLength={1000} placeholder={placeholder} className={champ} />
        </div>
        <DialogFooter>
          <Bouton type="button" variante="fantome" onClick={onFermer}>Annuler</Bouton>
          <Bouton type="button" variante={variante} enCours={enCours} disabled={!valide} onClick={() => onConfirmer(motif.trim() || null)}>
            {libelleAction}
          </Bouton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Barre d'actions groupées (sélection multiple). */
export function BarreSelection({ total, choisis, tous, onTous, children }: {
  total: number; choisis: number; tous: boolean; onTous: () => void; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-(--color-border) px-4 py-2.5 sm:px-5">
      <label className="inline-flex cursor-pointer items-center gap-2 text-[13px] text-(--color-ink-soft)">
        <CaseACocher coche={tous} onChange={onTous} libelle="Tout sélectionner" />
        {choisis > 0 ? `${choisis} sélectionné${choisis > 1 ? 's' : ''} sur ${total}` : `Tout sélectionner (${total})`}
      </label>
      <div className="ml-auto flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}
