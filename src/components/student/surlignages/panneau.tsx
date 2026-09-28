'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Check, CloudOff, Highlighter, Loader2, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TEINTES_SURLIGNAGE, type Surlignage } from '@/lib/fiches/surlignages-pure';
import { useSurlignagesOptionnel, type EtatSauvegarde } from './contexte';

function extrait(texte: string, max = 140): string {
  const t = texte.replace(/\s+/g, ' ').trim();
  return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t;
}

function LibelleSauvegarde({ etat }: { etat: EtatSauvegarde }) {
  if (etat === 'enregistrement' || etat === 'modifie') {
    return (
      <span className="inline-flex items-center gap-1 text-(--color-ink-soft)">
        <Loader2 className="h-3 w-3 animate-spin" /> Enregistrement…
      </span>
    );
  }
  if (etat === 'erreur') {
    return (
      <span className="inline-flex items-center gap-1 text-(--color-danger)">
        <CloudOff className="h-3 w-3" /> Hors ligne — nouvel essai automatique
      </span>
    );
  }
  if (etat === 'enregistre') {
    return (
      <span className="inline-flex items-center gap-1 text-(--color-ink-soft)">
        <Check className="h-3 w-3" /> Enregistré
      </span>
    );
  }
  return null;
}

function Ligne({ s, onAller, onSupprimer }: { s: Surlignage; onAller?: () => void; onSupprimer: () => void }) {
  return (
    <li className="group flex items-start gap-2 rounded-lg px-2 py-1.5 hover:bg-(--color-sand-100)">
      <span
        aria-hidden
        className="mt-1 block h-3 w-3 shrink-0 rounded-full border border-black/10"
        style={{ background: TEINTES_SURLIGNAGE[s.couleur] }}
      />
      <button
        type="button"
        onClick={onAller}
        disabled={!onAller}
        className="min-w-0 flex-1 text-left text-[12.5px] leading-snug text-(--color-ink) disabled:cursor-default"
      >
        <span className="mr-1 font-semibold text-(--color-ink-soft) tabular-nums">p. {s.page}</span>
        {extrait(s.citation)}
      </button>
      <button
        type="button"
        onClick={onSupprimer}
        aria-label="Retirer ce surlignage"
        title="Retirer"
        className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-(--color-ink-soft) hover:bg-(--color-surface) hover:text-(--color-danger)"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </li>
  );
}

/**
 * Bouton « Surlignages » de la barre du lecteur + liste déroulante : tous les
 * passages surlignés (clic = aller à la page), l'état de la sauvegarde, et les
 * passages ORPHELINS — introuvables dans la version actuelle de la fiche après
 * une mise à jour par l'équipe pédagogique : conservés avec leur texte, jamais
 * redessinés au hasard.
 */
export function PanneauSurlignages() {
  const ctx = useSurlignagesOptionnel();
  const [ouvert, setOuvert] = useState(false);
  const racineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ouvert) return;
    const dehors = (e: PointerEvent) => {
      if (!racineRef.current?.contains(e.target as Node)) setOuvert(false);
    };
    const echap = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOuvert(false);
    };
    document.addEventListener('pointerdown', dehors);
    document.addEventListener('keydown', echap);
    return () => {
      document.removeEventListener('pointerdown', dehors);
      document.removeEventListener('keydown', echap);
    };
  }, [ouvert]);

  if (!ctx || ctx.sauvegarde === 'indisponible') return null;

  const orphelins = ctx.surlignages.filter((s) => ctx.etats[s.id] === 'orphelin');
  const places = ctx.surlignages.filter((s) => ctx.etats[s.id] !== 'orphelin');
  const total = ctx.surlignages.length;

  return (
    // Pas de `relative` ici : la liste s'ancre au bord droit de la BARRE du
    // lecteur (positionnée), sinon elle déborderait à gauche de la carte.
    <div ref={racineRef}>
      <Button
        size="sm"
        variant={ouvert ? 'secondary' : 'ghost'}
        onClick={() => setOuvert((v) => !v)}
        aria-expanded={ouvert}
        aria-label={`Mes surlignages (${total})`}
        title="Mes surlignages"
        disabled={ctx.sauvegarde === 'chargement'}
        className="relative px-2.5"
      >
        <Highlighter />
        <span className="hidden xl:inline">Surlignages</span>
        {total > 0 && (
          <span className="min-w-4 rounded-full bg-(--color-primary-soft) px-1 text-[10.5px] font-bold tabular-nums text-(--color-accent)">
            {total}
          </span>
        )}
        {orphelins.length > 0 && (
          <span aria-hidden className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-amber-500" />
        )}
      </Button>

      {ouvert && (
        <div
          role="dialog"
          aria-label="Mes surlignages"
          className="absolute right-2 top-full z-40 mt-1.5 flex max-h-[min(60vh,28rem)] w-[min(22rem,calc(100%-1rem))] flex-col overflow-hidden rounded-xl border border-(--color-border) bg-(--color-surface) shadow-(--shadow-lifted)"
        >
          <div className="flex items-center gap-2 border-b border-(--color-border) px-3 py-2">
            <p className="text-sm font-bold text-(--color-ink)">Mes surlignages</p>
            <span className="ml-auto text-[11px]">
              <LibelleSauvegarde etat={ctx.sauvegarde} />
            </span>
            <button
              type="button"
              onClick={() => setOuvert(false)}
              aria-label="Fermer"
              className="grid h-6 w-6 place-items-center rounded-md text-(--color-ink-soft) hover:bg-(--color-sand-100)"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-1.5">
            {total === 0 && (
              <p className="px-2 py-3 text-[12.5px] leading-relaxed text-(--color-ink-soft)">
                Sélectionnez un passage de la fiche (appui long sur téléphone), puis choisissez
                une couleur. Vos surlignages sont enregistrés automatiquement et retrouvés à
                chaque ouverture, sur tous vos appareils.
              </p>
            )}

            {places.length > 0 && (
              <ul className="space-y-0.5">
                {places.map((s) => (
                  <Ligne
                    key={s.id}
                    s={s}
                    onAller={() => {
                      ctx.allerALaPage(s.page);
                      setOuvert(false);
                    }}
                    onSupprimer={() => ctx.supprimer(s.id)}
                  />
                ))}
              </ul>
            )}

            {orphelins.length > 0 && (
              <div className="mt-1.5 rounded-lg border border-amber-200 bg-amber-50/70 p-1.5 dark:border-amber-900/50 dark:bg-amber-950/20">
                <p className="flex items-start gap-1.5 px-1.5 pb-1 pt-0.5 text-[11.5px] leading-snug text-amber-900 dark:text-amber-200">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  La fiche a été mise à jour : ces passages n’y figurent plus à l’identique.
                  Ils sont conservés ici pour mémoire.
                </p>
                <ul className="space-y-0.5">
                  {orphelins.map((s) => (
                    <Ligne key={s.id} s={s} onSupprimer={() => ctx.supprimer(s.id)} />
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
