'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import Link from 'next/link';
import {
  Archive, ArrowRightLeft, Copy, ExternalLink, Home, Minus, MoreHorizontal, Palette, Trash2, Undo2, X,
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
  COULEURS, DIMENSIONS, PALETTE, TAILLES, libelleEmplacement, lienPostit, type Couleur, type Placement, type Postit, type TaillePreset,
} from '@/lib/postits/regles';
import { dateParis } from '@/lib/postits/recherche';
import { usePostits } from './etat';
import { ListeTaches } from './taches';
import { policeManuscrite } from './police';

/**
 * Un Post-it : bandeau (poignée de déplacement, titre, menu), contenu en
 * écriture manuscrite, tâches, origine. Trois présentations :
 *  · `flottant` : posé sur la page (le calque gère position et taille) ;
 *  · `liste`    : empilé (téléphone, liste d'un item) ;
 *  · `grand`    : ouvert en grand (bibliothèque).
 * Titre et contenu s'enregistrent seuls (700 ms après la frappe, et en quittant
 * le champ).
 */
export function NotePostit({
  postit, mode, placement = null, surPoignee, surReduire, surbrillance = false, bandeauSupplementaire, className, style,
}: {
  postit: Postit;
  mode: 'flottant' | 'liste' | 'grand';
  /** Placement affiché (mode flottant / liste d'une page). */
  placement?: Placement | null;
  /** Début de glisser-déposer depuis le bandeau. */
  surPoignee?: (e: ReactPointerEvent<HTMLDivElement>) => void;
  surReduire?: () => void;
  surbrillance?: boolean;
  bandeauSupplementaire?: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const { appeler, cleCourante } = usePostits();
  const c = PALETTE[postit.couleur];
  const lectureSeule = postit.statut !== 'actif';
  const [titre, setTitre] = useState(postit.titre);
  const [contenu, setContenu] = useState(postit.contenu);
  const enAttente = useRef<{ titre?: string; contenu?: string }>({});
  const minuterie = useRef<ReturnType<typeof setTimeout> | null>(null);

  const appelerRef = useRef(appeler);
  useEffect(() => { appelerRef.current = appeler; }, [appeler]);

  const enregistrer = useCallback(() => {
    if (minuterie.current) clearTimeout(minuterie.current);
    minuterie.current = null;
    const patch = enAttente.current;
    enAttente.current = {};
    if (patch.titre === undefined && patch.contenu === undefined) return;
    void appelerRef.current({ action: 'modifier', id: postit.id, ...patch });
  }, [postit.id]);
  const planifier = (patch: { titre?: string; contenu?: string }) => {
    enAttente.current = { ...enAttente.current, ...patch };
    if (minuterie.current) clearTimeout(minuterie.current);
    minuterie.current = setTimeout(enregistrer, 700);
  };
  // Départ de la page / fermeture : on n'abandonne pas une frappe en cours.
  useEffect(() => () => enregistrer(), [enregistrer]);

  const origineAilleurs = postit.origine.cle !== (placement?.cle ?? cleCourante);

  return (
    <article
      aria-label={`Post-it ${postit.titre || 'sans titre'}`}
      className={cn(
        'relative flex flex-col overflow-hidden rounded-[3px] text-left',
        mode === 'flottant' && 'h-full',
        mode === 'liste' && 'min-h-[150px]',
        mode === 'grand' && 'min-h-[360px]',
        surbrillance && 'ring-4 ring-[#6E0F28]/70 ring-offset-2 ring-offset-transparent',
        className,
      )}
      style={{
        background: `linear-gradient(180deg, ${c.fond} 0%, ${c.fond} 82%, color-mix(in srgb, ${c.fond} 88%, #000) 100%)`,
        boxShadow: `0 1px 1px rgba(0,0,0,0.08), 0 10px 24px -8px ${c.ombre}, 0 2px 6px -2px rgba(0,0,0,0.18)`,
        color: c.encre,
        ...style,
      }}
    >
      {/* Bandeau : poignée de déplacement (mode flottant), titre, actions. */}
      <div
        onPointerDown={surPoignee}
        className={cn('flex shrink-0 items-center gap-1 px-2 py-1', surPoignee && 'cursor-grab touch-none active:cursor-grabbing')}
        style={{ background: c.bandeau }}
      >
        <input
          value={titre}
          readOnly={lectureSeule}
          onChange={(e) => { setTitre(e.target.value); planifier({ titre: e.target.value }); }}
          onBlur={enregistrer}
          onPointerDown={(e) => e.stopPropagation()}
          maxLength={200}
          placeholder="Titre"
          aria-label="Titre du Post-it"
          className="min-w-0 flex-1 bg-transparent font-(family-name:--font-jakarta) text-[13.5px] font-bold outline-none placeholder:font-semibold placeholder:opacity-50"
          style={{ color: c.encre }}
        />
        {bandeauSupplementaire}
        {surReduire && (
          <BoutonBandeau label="Réduire" onClick={surReduire} encre={c.encre}><Minus className="h-4 w-4" /></BoutonBandeau>
        )}
        <MenuNote postit={postit} placement={placement} />
      </div>

      <div className={cn('flex min-h-0 flex-1 flex-col gap-1.5 px-3 pb-2 pt-1.5', mode === 'flottant' && 'overflow-y-auto overscroll-contain')}>
        <textarea
          value={contenu}
          readOnly={lectureSeule}
          onChange={(e) => { setContenu(e.target.value); planifier({ contenu: e.target.value }); }}
          onBlur={enregistrer}
          maxLength={20000}
          rows={mode === 'flottant' ? 3 : 4}
          placeholder={lectureSeule ? '' : 'Écrivez ici…'}
          aria-label="Contenu du Post-it"
          className={cn(
            policeManuscrite.className,
            'w-full resize-none bg-transparent text-[21px] leading-[28px] outline-none placeholder:opacity-45',
            mode === 'grand' ? 'min-h-[140px]' : 'min-h-[84px]',
            mode === 'flottant' && 'field-sizing-content',
          )}
          style={{
            color: c.encre,
            // Papier ligné discret, qui défile avec le texte.
            backgroundImage: 'repeating-linear-gradient(transparent 0 27px, rgba(0,0,0,0.075) 27px 28px)',
            backgroundAttachment: 'local',
          }}
        />
        <ListeTaches postit={postit} encre={c.encre} lectureSeule={lectureSeule} police={policeManuscrite.className} />
      </div>

      <footer className="flex shrink-0 items-center gap-2 px-3 pb-1.5 pt-0.5 text-[10.5px] font-medium opacity-70">
        <span className="min-w-0 flex-1 truncate" title={`Créé dans : ${libelleEmplacement(postit.origine)}`}>
          {origineAilleurs ? <>Créé dans : {libelleEmplacement(postit.origine)}</> : <>Créé le {formatDate(postit.creeLe)}</>}
        </span>
        {origineAilleurs && <span className="shrink-0">{formatDate(postit.creeLe)}</span>}
      </footer>
      {/* Coin corné */}
      <span aria-hidden className="pointer-events-none absolute bottom-0 right-0 h-4 w-4" style={{ background: `linear-gradient(135deg, transparent 50%, color-mix(in srgb, ${c.fond} 70%, #000) 50%)`, opacity: 0.35 }} />
    </article>
  );
}

export function formatDate(iso: string): string {
  const d = dateParis(iso);
  const [a, m, j] = d.split('-').map(Number);
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(a, m - 1, j, 12)));
}

function BoutonBandeau({ label, onClick, encre, children }: { label: string; onClick: () => void; encre: string; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      onPointerDown={(e) => e.stopPropagation()}
      aria-label={label}
      title={label}
      className="grid h-7 w-7 shrink-0 place-items-center rounded-md transition-colors hover:bg-black/10 focus-ring"
      style={{ color: encre }}
    >
      {children}
    </button>
  );
}

/** Menu « ⋯ » d'un Post-it : couleur, taille, emplacements, archivage, corbeille. */
export function MenuNote({ postit, placement }: { postit: Postit; placement: Placement | null }) {
  const { appeler, cleCourante, demander, remplacer } = usePostits();
  const c = PALETTE[postit.couleur];
  const ici = placement?.cle ?? null;
  const surAccueil = postit.placements.some((p) => p.cle === 'accueil');
  const lienOrigine = lienPostit(postit.origine.cle, postit.id);
  const actif = postit.statut === 'actif';

  const changerTaille = (t: TaillePreset) => {
    if (!placement) return void appeler({ action: 'modifier', id: postit.id, taille: t });
    const dims = { w: DIMENSIONS[t].w, h: DIMENSIONS[t].h };
    remplacer({ ...postit, taille: t, placements: postit.placements.map((p) => (p.id === placement.id ? { ...p, ...dims } : p)) });
    void appeler({ action: 'placer', placementId: placement.id, ...dims, taille: t });
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          aria-label="Actions du Post-it"
          title="Actions"
          className="grid h-7 w-7 shrink-0 place-items-center rounded-md transition-colors hover:bg-black/10 focus-ring"
          style={{ color: c.encre }}
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-[60] w-64">
        {actif && (
          <>
            <DropdownMenuLabel className="flex items-center gap-1.5"><Palette className="h-3.5 w-3.5" /> Couleur</DropdownMenuLabel>
            <div className="flex flex-wrap gap-1.5 px-3 pb-2">
              {COULEURS.map((k: Couleur) => (
                <button
                  key={k}
                  type="button"
                  aria-label={PALETTE[k].label}
                  aria-pressed={postit.couleur === k}
                  onClick={() => void appeler({ action: 'modifier', id: postit.id, couleur: k })}
                  className={cn('h-6 w-6 rounded-full ring-offset-2 transition-transform hover:scale-110', postit.couleur === k && 'ring-2 ring-[#6E0F28]')}
                  style={{ background: PALETTE[k].fond, boxShadow: `inset 0 0 0 1px ${PALETTE[k].bandeau}` }}
                />
              ))}
            </div>
            <DropdownMenuLabel>Taille</DropdownMenuLabel>
            <div className="flex gap-1 px-3 pb-2">
              {TAILLES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => changerTaille(t)}
                  className={cn(
                    'flex-1 rounded-lg border px-2 py-1 text-[12px] font-semibold transition-colors',
                    postit.taille === t ? 'border-[#6E0F28] bg-[#6E0F28] text-white' : 'border-(--color-border) hover:bg-(--color-surface-soft)',
                  )}
                >
                  {DIMENSIONS[t].label}
                </button>
              ))}
            </div>
            <DropdownMenuSeparator />
            {ici !== 'accueil' && (
              <DropdownMenuItem onSelect={() => void appeler({ action: 'deplacer', id: postit.id, depuis: ici, vers: 'accueil' })}>
                <Home /> Déplacer vers l’accueil
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onSelect={() => demander({ genre: 'deplacer', postit, mode: 'deplacer', depuis: ici })}>
              <ArrowRightLeft /> Déplacer vers une autre page…
            </DropdownMenuItem>
            {!surAccueil && (
              <DropdownMenuItem onSelect={() => void appeler({ action: 'afficherAussi', id: postit.id, vers: 'accueil' })}>
                <Copy /> Afficher aussi sur l’accueil
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onSelect={() => demander({ genre: 'deplacer', postit, mode: 'afficherAussi', depuis: ici })}>
              <Copy /> Afficher aussi sur une autre page…
            </DropdownMenuItem>
            {ici && postit.placements.length > 1 && (
              <DropdownMenuItem onSelect={() => void appeler({ action: 'retirer', id: postit.id, emplacement: ici })}>
                <X /> Retirer de cette page
              </DropdownMenuItem>
            )}
          </>
        )}
        {lienOrigine && postit.origine.cle !== cleCourante && (
          <DropdownMenuItem asChild>
            <Link href={lienOrigine}><ExternalLink /> Ouvrir dans sa page</Link>
          </DropdownMenuItem>
        )}
        {cleCourante && (
          <DropdownMenuItem asChild>
            <Link href={`/mes-post-it?postit=${postit.id}`}><ExternalLink /> Voir dans Tous mes Post-it</Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        {actif ? (
          <DropdownMenuItem onSelect={() => demander({ genre: 'archiver', postit })}>
            <Archive /> Archiver
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onSelect={() => void appeler({ action: 'restaurer', id: postit.id })}>
            <Undo2 /> Restaurer
          </DropdownMenuItem>
        )}
        {postit.statut !== 'supprime' && (
          <DropdownMenuItem onSelect={() => demander({ genre: 'supprimer', postit })} className="text-[#9B0F2C]">
            <Trash2 /> Supprimer
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
