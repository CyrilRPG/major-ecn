'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ChevronDown, ChevronRight, ClipboardList, FileText, Layers3, PlayCircle, Search, X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { iconFromKey } from '@/lib/icons';
import { ItemImportanceButton, ImportanceStars } from './item-importance-button';
import { NewItemButton } from './new-item-button';

/**
 * Explorateur du contenu pédagogique.
 *
 * La page affichait d'un bloc les 510 items de tous les collèges : autant de
 * cartes rendues, d'étoiles et de pastilles, avant que l'administrateur puisse
 * seulement cliquer sur celui qu'il cherchait. Les collèges sont désormais
 * repliés par défaut — on n'ouvre que celui dont on a besoin — et une barre de
 * recherche permet d'atteindre directement un collège ou un item par son nom.
 */

export type ItemAvecCompteurs = {
  id: string;
  titre: string;
  has_video: boolean;
  has_fiche: boolean;
  qcm_count: number;
  annale_count: number;
  flashcard_count: number;
  importance: number;
};

export type SousCollege = {
  id: string;
  nom: string;
  colorHex: string | null;
  cours: ItemAvecCompteurs[];
};

export type CollegeAffiche = {
  id: string;
  nom: string;
  iconKey: string | null;
  colorHex: string | null;
  cours: ItemAvecCompteurs[];
  enfants: SousCollege[];
};

/** Normalise pour une recherche tolérante aux accents et à la casse :
 *  « gériatrie », « Gériatrie » et « geriatrie » doivent tous trouver. */
function normaliser(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export function ContenuExplorer({
  colleges,
  isAdmin,
}: {
  colleges: CollegeAffiche[];
  isAdmin: boolean;
}) {
  const [recherche, setRecherche] = useState('');
  const [ouverts, setOuverts] = useState<Set<string>>(new Set());

  const q = normaliser(recherche.trim());

  // Résultat de recherche : un collège est retenu si son nom correspond (on
  // montre alors tous ses items) ou si l'un de ses items correspond (on ne
  // montre alors que ceux-là).
  const resultats = useMemo(() => {
    if (!q) return colleges;
    const filtrerItems = (items: ItemAvecCompteurs[]) =>
      items.filter((i) => normaliser(i.titre).includes(q));

    return colleges
      .map((c) => {
        const collegeCorrespond = normaliser(c.nom).includes(q);
        const enfants = c.enfants
          .map((e) => ({
            ...e,
            cours: collegeCorrespond || normaliser(e.nom).includes(q) ? e.cours : filtrerItems(e.cours),
          }))
          .filter((e) => e.cours.length > 0 || normaliser(e.nom).includes(q));
        return {
          ...c,
          cours: collegeCorrespond ? c.cours : filtrerItems(c.cours),
          enfants,
        };
      })
      .filter((c) => c.cours.length > 0 || c.enfants.length > 0 || normaliser(c.nom).includes(q));
  }, [colleges, q]);

  const nbItemsTrouves = resultats.reduce(
    (n, c) => n + c.cours.length + c.enfants.reduce((m, e) => m + e.cours.length, 0),
    0,
  );

  const basculer = (id: string) =>
    setOuverts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-ink-muted)" />
        <input
          type="search"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Rechercher un collège ou un item…"
          aria-label="Rechercher un collège ou un item"
          className="w-full rounded-xl border border-(--color-border) bg-(--color-surface) py-2.5 pl-9 pr-9 text-sm text-(--color-ink) outline-none transition-colors focus:border-(--color-accent)"
        />
        {recherche && (
          <button
            type="button"
            onClick={() => setRecherche('')}
            aria-label="Effacer la recherche"
            className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-(--color-ink-muted) hover:bg-(--color-sand-100) hover:text-(--color-ink)"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {q && (
        <p className="text-sm text-(--color-ink-soft)">
          {resultats.length === 0
            ? 'Aucun collège ni item ne correspond.'
            : `${nbItemsTrouves} item${nbItemsTrouves > 1 ? 's' : ''} dans ${resultats.length} collège${resultats.length > 1 ? 's' : ''}.`}
        </p>
      )}

      <div className="space-y-3">
        {resultats.map((college) => {
          const Icon = iconFromKey(college.iconKey);
          const nbTotal = college.cours.length
            + college.enfants.reduce((n, e) => n + e.cours.length, 0);
          // Une recherche en cours ouvre d'office les collèges retenus : sinon
          // l'utilisateur verrait des résultats qu'il faudrait encore déplier.
          const ouvert = q ? true : ouverts.has(college.id);

          return (
            <section
              key={college.id}
              className="overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface)"
            >
              <div className="flex items-center gap-3 p-3 sm:p-4">
                <button
                  type="button"
                  onClick={() => basculer(college.id)}
                  aria-expanded={ouvert}
                  disabled={!!q}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left disabled:cursor-default"
                >
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${college.colorHex ?? 'var(--color-accent)'} 16%, transparent)`,
                      color: college.colorHex ?? 'var(--color-accent)',
                    }}
                  >
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-semibold tracking-tight text-(--color-ink)">
                      {college.nom}
                    </span>
                    <span className="block text-xs text-(--color-ink-muted)">
                      {nbTotal} item{nbTotal > 1 ? 's' : ''}
                      {college.enfants.length > 0 && ` · ${college.enfants.length} sous-collège${college.enfants.length > 1 ? 's' : ''}`}
                    </span>
                  </span>
                  {!q && (
                    <span className="ml-auto shrink-0 text-(--color-ink-muted)">
                      {ouvert ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                    </span>
                  )}
                </button>
                {isAdmin && (
                  <div className="shrink-0">
                    <NewItemButton matiereId={college.id} matiereNom={college.nom} />
                  </div>
                )}
              </div>

              {ouvert && (
                <div className="border-t border-(--color-border) bg-(--color-surface-soft) p-3 sm:p-4">
                  {college.cours.length > 0 && <GrilleItems cours={college.cours} />}
                  {college.cours.length === 0 && college.enfants.length === 0 && (
                    <p className="text-sm text-(--color-ink-muted)">Aucun item dans ce collège.</p>
                  )}

                  {college.enfants.length > 0 && (
                    <div className="mt-4 space-y-5 border-l-2 border-(--color-border) pl-3 sm:pl-4">
                      {college.enfants.map((e) => (
                        <div key={e.id}>
                          <div className="mb-2 flex items-center gap-2">
                            <span
                              className="h-2.5 w-2.5 shrink-0 rounded-full"
                              style={{ backgroundColor: e.colorHex ?? 'var(--color-accent)' }}
                            />
                            <h3 className="text-sm font-semibold tracking-tight text-(--color-ink) break-words">
                              {e.nom}
                            </h3>
                            <span className="text-xs text-(--color-ink-muted)">{e.cours.length} items</span>
                            {isAdmin && (
                              <div className="ml-auto shrink-0">
                                <NewItemButton matiereId={e.id} matiereNom={`${college.nom} · ${e.nom}`} />
                              </div>
                            )}
                          </div>
                          {e.cours.length > 0 ? (
                            <GrilleItems cours={e.cours} />
                          ) : (
                            <p className="text-sm text-(--color-ink-muted)">Aucun item dans ce sous-collège.</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

/** Grille des items d'un collège (ou d'un sous-collège). */
function GrilleItems({ cours }: { cours: ItemAvecCompteurs[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      {cours.map((c) => (
        <div
          key={c.id}
          className="group relative rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-(--shadow-soft) transition-all hover:-translate-y-0.5 hover:border-(--color-accent) hover:shadow-(--shadow-lifted)"
        >
          <Link
            href={`/admin/contenu/${c.id}`}
            aria-label={c.titre}
            className="absolute inset-0 z-0 rounded-2xl focus-ring"
          />
          <div className="relative z-10 flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold leading-snug text-(--color-ink) break-words">{c.titre}</h3>
              <ImportanceStars value={c.importance} className="mt-1" />
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <ItemImportanceButton coursId={c.id} titre={c.titre} importance={c.importance} />
              <ChevronRight className="h-4 w-4 text-(--color-ink-muted) transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>
          <div className="relative z-10 mt-3 flex flex-wrap gap-1.5 text-xs">
            <Badge variant={c.has_video ? 'success' : 'muted'}>
              <PlayCircle className="h-3 w-3" /> {c.has_video ? 'Vidéo' : 'Pas de vidéo'}
            </Badge>
            <Badge variant={c.has_fiche ? 'success' : 'muted'}>
              <FileText className="h-3 w-3" /> {c.has_fiche ? 'Fiche' : 'Pas de fiche'}
            </Badge>
            <Badge variant={c.qcm_count + c.annale_count > 0 ? 'primary' : 'muted'}>
              <ClipboardList className="h-3 w-3" /> {c.qcm_count + c.annale_count} séries
            </Badge>
            <Badge variant={c.flashcard_count > 0 ? 'primary' : 'muted'}>
              <Layers3 className="h-3 w-3" /> {c.flashcard_count} cartes
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
