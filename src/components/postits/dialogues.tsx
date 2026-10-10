'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Archive, ArrowRightLeft, CalendarCheck2, CalendarX2, ExternalLink, Home, Loader2, MapPin, Search, Trash2, Undo2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
  PAGES_ITEM, PALETTE, joursAvantPurge, libelleEmplacement, lienPostit, messageSuppression, tachesFuturesNonFaites,
  type Destination, type Postit,
} from '@/lib/postits/regles';
import { normaliser } from '@/lib/postits/recherche';
import { chargerDestinations } from './api';
import { usePostits } from './etat';
import { NotePostit, formatDate } from './note';

/** Fenêtres demandées par les Post-it (une seule ouverte à la fois). */
export function DialoguesPostits() {
  const { demande, demander, postits } = usePostits();
  const fermer = () => demander(null);
  if (!demande) return null;
  if (demande.genre === 'archiver') return <DialogueArchiver postit={demande.postit} onClose={fermer} />;
  if (demande.genre === 'supprimer') return <DialogueSupprimer postit={demande.postit} onClose={fermer} />;
  if (demande.genre === 'deplacer') return <DialogueDeplacer postit={demande.postit} mode={demande.mode} depuis={demande.depuis} onClose={fermer} />;
  const p = postits.find((x) => x.id === demande.postitId);
  return p ? <VuePostit postit={p} onClose={fermer} /> : null;
}

const bouton = 'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50';
const boutonPrincipal = `${bouton} bg-[#6E0F28] text-white hover:bg-[#5A0B20]`;
const boutonSecondaire = `${bouton} border border-(--color-border) bg-(--color-surface) text-(--color-ink) hover:bg-(--color-surface-soft)`;

/** §47 : archiver une note dont des tâches datées sont à venir pose la question. */
function DialogueArchiver({ postit, onClose }: { postit: Postit; onClose: () => void }) {
  const { appeler, aujourdHui } = usePostits();
  const [enCours, setEnCours] = useState(false);
  const futures = tachesFuturesNonFaites(postit.taches, aujourdHui);
  const archiver = async (taches: 'conserver' | 'archiver') => {
    setEnCours(true);
    const r = await appeler({ action: 'archiver', id: postit.id, taches });
    setEnCours(false);
    if (r) onClose();
  };
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Archive className="h-5 w-5 text-[#6E0F28]" /> Archiver ce Post-it ?</DialogTitle>
          <DialogDescription>
            Il quitte {postit.placements.length > 1 ? 'ses pages' : 'sa page'} et reste consultable dans « Tous mes Post-it », onglet Archivés, avec ses tâches cochées.
          </DialogDescription>
        </DialogHeader>
        {futures > 0 ? (
          <div className="space-y-2.5">
            <p className="text-sm text-(--color-ink)">
              {futures === 1 ? 'Une tâche datée n’est pas encore faite.' : `${futures} tâches datées ne sont pas encore faites.`} Que deviennent-elles dans votre agenda ?
            </p>
            <button type="button" disabled={enCours} onClick={() => archiver('conserver')} className={cn(boutonPrincipal, 'w-full justify-start')}>
              <CalendarCheck2 className="h-4 w-4" /> Conserver les tâches dans mon agenda
            </button>
            <button type="button" disabled={enCours} onClick={() => archiver('archiver')} className={cn(boutonSecondaire, 'w-full justify-start')}>
              <CalendarX2 className="h-4 w-4" /> Archiver également les tâches
            </button>
          </div>
        ) : (
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className={boutonSecondaire}>Annuler</button>
            <button type="button" disabled={enCours} onClick={() => archiver('conserver')} className={boutonPrincipal}>
              {enCours && <Loader2 className="h-4 w-4 animate-spin" />} Archiver
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DialogueSupprimer({ postit, onClose }: { postit: Postit; onClose: () => void }) {
  const { appeler } = usePostits();
  const [enCours, setEnCours] = useState(false);
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Trash2 className="h-5 w-5 text-[#9B0F2C]" /> Supprimer ce Post-it ?</DialogTitle>
          <DialogDescription>{messageSuppression(postit.taches)}</DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className={boutonSecondaire}>Annuler</button>
          <button
            type="button"
            disabled={enCours}
            onClick={async () => { setEnCours(true); const r = await appeler({ action: 'supprimer', id: postit.id }); setEnCours(false); if (r) onClose(); }}
            className={cn(bouton, 'bg-[#9B0F2C] text-white hover:bg-[#7E0B23]')}
          >
            {enCours && <Loader2 className="h-4 w-4 animate-spin" />} Mettre à la corbeille
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * « Déplacer vers une autre page » / « Afficher aussi sur… » / « Restaurer
 * sur… » (§24, §30) : accueil, page d'une spécialité, ou une page d'un item.
 */
function DialogueDeplacer({ postit, mode, depuis, onClose }: { postit: Postit; mode: 'deplacer' | 'afficherAussi' | 'restaurer'; depuis: string | null; onClose: () => void }) {
  const { appeler } = usePostits();
  const [specialites, setSpecialites] = useState<Destination[] | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [recherche, setRecherche] = useState('');
  const [matiere, setMatiere] = useState<string | null>(postit.origine.matiereId);
  const [item, setItem] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  useEffect(() => {
    let annule = false;
    chargerDestinations()
      .then((r) => { if (!annule) setSpecialites(r.specialites); })
      .catch((e) => { if (!annule) setErreur(e instanceof Error ? e.message : 'Liste indisponible.'); });
    return () => { annule = true; };
  }, []);

  const items = useMemo(() => {
    const mots = normaliser(recherche).split(' ').filter(Boolean);
    const source = (specialites ?? []).filter((s) => mots.length > 0 || !matiere || s.id === matiere);
    return source.flatMap((s) => s.items.map((i) => ({ ...i, matiere: s.nom })))
      .filter((i) => mots.every((m) => normaliser(`${i.titre} ${i.matiere}`).includes(m)))
      .slice(0, 80);
  }, [specialites, recherche, matiere]);

  const valider = async (cle: string) => {
    setEnCours(true);
    const corps = mode === 'restaurer'
      ? { action: 'restaurer', id: postit.id, vers: cle }
      : mode === 'afficherAussi'
        ? { action: 'afficherAussi', id: postit.id, vers: cle }
        : { action: 'deplacer', id: postit.id, depuis, vers: cle };
    const r = await appeler(corps);
    setEnCours(false);
    if (r) onClose();
  };

  const titre = mode === 'restaurer' ? 'Restaurer sur…' : mode === 'afficherAussi' ? 'Afficher aussi sur…' : 'Déplacer vers…';
  const choix = 'flex w-full items-center gap-2 rounded-xl border border-(--color-border) px-3 py-2 text-left text-sm transition-colors hover:border-[#6E0F28]/50 hover:bg-[#6E0F28]/5 disabled:opacity-50';

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><ArrowRightLeft className="h-5 w-5 text-[#6E0F28]" /> {titre}</DialogTitle>
          <DialogDescription>
            {mode === 'afficherAussi'
              ? 'Le même Post-it apparaîtra aux deux endroits : une modification se voit partout.'
              : 'Le Post-it garde sa position, sa taille et son origine.'}
          </DialogDescription>
        </DialogHeader>

        <button type="button" disabled={enCours} onClick={() => valider('accueil')} className={choix}>
          <Home className="h-4 w-4 text-[#6E0F28]" /> L’accueil
        </button>

        {erreur && <p className="text-sm text-[#9B0F2C]">{erreur}</p>}
        {!specialites && !erreur && <p className="flex items-center gap-2 text-sm text-(--color-ink-soft)"><Loader2 className="h-4 w-4 animate-spin" /> Chargement des spécialités…</p>}

        {specialites && !item && (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <select
                value={matiere ?? ''}
                onChange={(e) => setMatiere(e.target.value || null)}
                aria-label="Spécialité"
                className="h-9 min-w-0 flex-1 rounded-lg border border-(--color-border) bg-(--color-surface) px-2 text-sm"
              >
                <option value="">Toutes les spécialités</option>
                {specialites.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
              </select>
              <label className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-ink-muted)" />
                <input
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                  placeholder="Chercher un item"
                  aria-label="Chercher un item"
                  className="h-9 w-full rounded-lg border border-(--color-border) bg-(--color-surface) pl-8 pr-2 text-sm"
                />
              </label>
            </div>
            {matiere && !recherche && (
              <button type="button" disabled={enCours} onClick={() => valider(`matiere:${matiere}`)} className={choix}>
                <MapPin className="h-4 w-4 text-[#6E0F28]" /> Page de la spécialité « {specialites.find((s) => s.id === matiere)?.nom} »
              </button>
            )}
            <ul className="max-h-[42vh] space-y-1 overflow-y-auto pr-1">
              {items.map((i) => (
                <li key={i.id}>
                  <button type="button" onClick={() => setItem(i.id)} className={choix}>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{i.titre}</span>
                      <span className="block truncate text-[11.5px] text-(--color-ink-muted)">{i.matiere}</span>
                    </span>
                  </button>
                </li>
              ))}
              {items.length === 0 && <li className="px-1 py-3 text-sm text-(--color-ink-soft)">Aucun item ne correspond.</li>}
            </ul>
          </div>
        )}

        {specialites && item && (
          <div className="space-y-2">
            <button type="button" onClick={() => setItem(null)} className="text-[13px] font-semibold text-[#6E0F28] hover:underline">← Choisir un autre item</button>
            <p className="text-sm font-semibold text-(--color-ink)">{specialites.flatMap((s) => s.items).find((i) => i.id === item)?.titre}</p>
            <div className="grid gap-1.5 sm:grid-cols-2">
              {PAGES_ITEM.map((pg) => (
                <button key={pg.seg} type="button" disabled={enCours} onClick={() => valider(pg.seg ? `cours:${item}:${pg.seg}` : `cours:${item}`)} className={choix}>
                  {pg.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/**
 * Post-it ouvert en grand (§29) : contenu complet, tâches cochées, couleur
 * d'origine, emplacements, dates — et les actions de restauration (§30).
 */
export function VuePostit({ postit, onClose }: { postit: Postit; onClose: () => void }) {
  const { appeler, demander } = usePostits();
  const lienOrigine = lienPostit(postit.origine.cle, postit.id);
  const statut = postit.statut === 'actif' ? 'Actif' : postit.statut === 'archive' ? 'Archivé' : 'Dans la corbeille';
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="pr-8">{postit.titre || 'Post-it sans titre'}</DialogTitle>
          <DialogDescription className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11.5px] font-bold" style={{ background: PALETTE[postit.couleur].fond, color: PALETTE[postit.couleur].encre }}>
              {statut}
            </span>
            {postit.statut === 'supprime' && postit.supprimeLe && <span>Effacé définitivement dans {joursAvantPurge(postit.supprimeLe, new Date())} jour(s).</span>}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-5 md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          <NotePostit postit={postit} mode="grand" />
          <aside className="space-y-4 text-sm">
            <dl className="space-y-2.5">
              <Info label="Créé dans">
                {lienOrigine ? <Link href={lienOrigine} className="font-semibold text-[#6E0F28] hover:underline">{libelleEmplacement(postit.origine)}</Link> : libelleEmplacement(postit.origine)}
              </Info>
              <Info label="Affiché sur">
                {postit.placements.length === 0 ? <span className="text-(--color-ink-soft)">Aucune page</span> : (
                  <ul className="space-y-1">
                    {postit.placements.map((pl) => {
                      const lien = lienPostit(pl.cle, postit.id);
                      return (
                        <li key={pl.id} className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-(--color-ink-muted)" />
                          {lien && postit.statut === 'actif'
                            ? <Link href={lien} className="text-[#6E0F28] hover:underline">{libelleEmplacement(pl)}</Link>
                            : <span>{libelleEmplacement(pl)}</span>}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Info>
              <Info label="Créé le">{formatDate(postit.creeLe)}</Info>
              <Info label="Modifié le">{formatDate(postit.modifieLe)}</Info>
              {postit.archiveLe && <Info label="Archivé le">{formatDate(postit.archiveLe)}</Info>}
              {postit.supprimeLe && <Info label="Supprimé le">{formatDate(postit.supprimeLe)}</Info>}
            </dl>
            <div className="flex flex-col gap-2">
              {postit.statut === 'actif' && lienOrigine && (
                <Link href={lienOrigine} className={cn(boutonPrincipal, 'justify-start')}><ExternalLink className="h-4 w-4" /> Ouvrir dans sa page</Link>
              )}
              {postit.statut === 'actif' && (
                <>
                  <button type="button" onClick={() => demander({ genre: 'deplacer', postit, mode: 'deplacer', depuis: postit.placements[0]?.cle ?? null })} className={cn(boutonSecondaire, 'justify-start')}>
                    <ArrowRightLeft className="h-4 w-4" /> Déplacer vers une autre page…
                  </button>
                  <button type="button" onClick={() => demander({ genre: 'archiver', postit })} className={cn(boutonSecondaire, 'justify-start')}>
                    <Archive className="h-4 w-4" /> Archiver
                  </button>
                </>
              )}
              {postit.statut !== 'actif' && (
                <>
                  <button type="button" onClick={() => void appeler({ action: 'restaurer', id: postit.id })} className={cn(boutonPrincipal, 'justify-start')}>
                    <Undo2 className="h-4 w-4" /> Restaurer{postit.statut === 'supprime' ? '' : ' (redevient actif)'}
                  </button>
                  <button type="button" onClick={() => void appeler({ action: 'restaurer', id: postit.id, vers: 'accueil' })} className={cn(boutonSecondaire, 'justify-start')}>
                    <Home className="h-4 w-4" /> Restaurer sur l’accueil
                  </button>
                  <button type="button" onClick={() => demander({ genre: 'deplacer', postit, mode: 'restaurer', depuis: null })} className={cn(boutonSecondaire, 'justify-start')}>
                    <MapPin className="h-4 w-4" /> Restaurer sur une autre page…
                  </button>
                </>
              )}
              {postit.statut !== 'supprime' && (
                <button type="button" onClick={() => demander({ genre: 'supprimer', postit })} className={cn(boutonSecondaire, 'justify-start text-[#9B0F2C]')}>
                  <Trash2 className="h-4 w-4" /> Supprimer
                </button>
              )}
            </div>
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-(--color-ink-muted)">{label}</dt>
      <dd className="mt-0.5 text-(--color-ink)">{children}</dd>
    </div>
  );
}
