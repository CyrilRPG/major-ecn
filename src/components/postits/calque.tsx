'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Layers, Library, Loader2, Plus, StickyNote, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  PALETTE, contraindre, positionInitiale, tailleDepuisDimensions,
  type ContextePage, type Couleur, type Geometrie, type Placement, type Postit,
} from '@/lib/postits/regles';
import { postitsDeLItem } from '@/lib/postits/recherche';
import { chargerEmplacement, chargerPostitsCours } from './api';
import { FournisseurPostits, usePostits } from './etat';
import { DialoguesPostits } from './dialogues';
import { NotePostit } from './note';
import { policeManuscrite } from './police';

/**
 * Calque « Mes Post-it » d'une page (accueil, spécialité, item et ses
 * ressources). Monté par `chargeur.tsx` APRÈS le rendu de la page (import
 * dynamique, client seulement) : il ne ralentit jamais un contenu
 * pédagogique (§23).
 *
 *  · ordinateur / tablette : notes posées sur la page, déplaçables et
 *    redimensionnables, toujours ramenées dans la fenêtre (§33) ;
 *  · téléphone : notes empilées dans un tiroir (§34) ;
 *  · un onglet discret au bord droit : nouveau Post-it, masquer / réafficher
 *    (mémorisé par élève et par appareil), « Mes Post-it sur cet item » (§32).
 */
export default function CalquePostits({ contexte, chemin, userId }: { contexte: ContextePage; chemin: string; userId: string }) {
  const [postits, setPostits] = useState<Postit[]>([]);
  return (
    <FournisseurPostits postits={postits} setPostits={setPostits} cleCourante={contexte.cle}>
      <Calque contexte={contexte} chemin={chemin} userId={userId} setPostits={setPostits} />
      <DialoguesPostits />
    </FournisseurPostits>
  );
}

const cleMasques = (userId: string) => `mecn_postits_masques:${userId}`;
const cleCouleur = 'mecn_postits_couleur';

function lireStockage(cle: string): string | null {
  try { return window.localStorage.getItem(cle); } catch { return null; }
}
function ecrireStockage(cle: string, v: string) {
  try { window.localStorage.setItem(cle, v); } catch { /* mode privé */ }
}

function useFenetre() {
  const [f, setF] = useState(() => ({ vw: window.innerWidth, vh: window.innerHeight }));
  useEffect(() => {
    const maj = () => setF({ vw: window.innerWidth, vh: window.innerHeight });
    window.addEventListener('resize', maj);
    return () => window.removeEventListener('resize', maj);
  }, []);
  return { ...f, mobile: f.vw < 768 };
}

function Calque({ contexte, chemin, userId, setPostits }: { contexte: ContextePage; chemin: string; userId: string; setPostits: (f: (l: Postit[]) => Postit[]) => void }) {
  const { postits, appeler, signaler } = usePostits();
  const { vw, vh, mobile } = useFenetre();
  const [charge, setCharge] = useState(false);
  const [masques, setMasques] = useState(() => lireStockage(cleMasques(userId)) === '1');
  const [menu, setMenu] = useState(false);
  const [tiroir, setTiroir] = useState(false);
  const [panneauItem, setPanneauItem] = useState(false);
  const [cibleId, setCibleId] = useState<string | null>(null);
  const [surbrillance, setSurbrillance] = useState<string | null>(null);
  const [creation, setCreation] = useState(false);
  const onglet = useRef<HTMLDivElement>(null);

  // Le menu se ferme au clic ailleurs et à Échap.
  useEffect(() => {
    if (!menu) return;
    const dehors = (e: PointerEvent) => { if (!onglet.current?.contains(e.target as Node)) setMenu(false); };
    const echap = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenu(false); };
    window.addEventListener('pointerdown', dehors);
    window.addEventListener('keydown', echap);
    return () => { window.removeEventListener('pointerdown', dehors); window.removeEventListener('keydown', echap); };
  }, [menu]);

  // Chargement par page (une requête), et « Ouvrir dans sa page » (?postit=).
  useEffect(() => {
    const ctrl = new AbortController();
    const demande = new URLSearchParams(window.location.search).get('postit');
    chargerEmplacement(contexte.cle, demande, ctrl.signal)
      .then((r) => {
        setPostits(() => (r.cible ? [...r.postits, r.cible] : r.postits));
        setCibleId(r.cible?.id ?? null);
        setCharge(true);
        if (demande && (r.cible || r.postits.some((p) => p.id === demande))) {
          setMasques(false);
          setSurbrillance(demande);
          if (window.innerWidth < 768) setTiroir(true);
          setTimeout(() => setSurbrillance(null), 4000);
        }
      })
      .catch((e) => { if (!ctrl.signal.aborted) { setCharge(true); console.warn('[postits]', e); } });
    return () => ctrl.abort();
  }, [contexte.cle, setPostits]);

  const basculerMasques = useCallback(() => {
    setMasques((m) => { ecrireStockage(cleMasques(userId), m ? '0' : '1'); return !m; });
    setMenu(false);
  }, [userId]);

  // Notes de CETTE page : actives et placées ici (+ la note demandée par lien).
  const ici = useMemo(() => postits
    .filter((p) => p.statut === 'actif' && (p.placements.some((pl) => pl.cle === contexte.cle) || p.id === cibleId)),
  [postits, contexte.cle, cibleId]);

  async function creer() {
    if (creation) return;
    setCreation(true);
    setMenu(false);
    setMasques(false);
    ecrireStockage(cleMasques(userId), '0');
    const couleur = (lireStockage(cleCouleur) as Couleur | null) ?? 'jaune';
    const g = positionInitiale(ici.length, 'moyen', vw, vh);
    const r = await appeler({ action: 'creer', emplacement: contexte.cle, chemin, couleur: couleur in PALETTE ? couleur : 'jaune', taille: 'moyen', ...g });
    setCreation(false);
    if (r?.postit) {
      setSurbrillance(r.postit.id);
      setTimeout(() => setSurbrillance(null), 1500);
      if (mobile) setTiroir(true);
      // Le titre du nouveau Post-it prend le focus.
      const id = r.postit.id;
      setTimeout(() => document.querySelector<HTMLInputElement>(`[data-postit="${id}"] input[aria-label="Titre du Post-it"]`)?.focus(), 80);
    } else {
      signaler('Création impossible pour le moment.');
    }
  }

  const estItem = contexte.coursId != null;
  const nb = ici.length;

  return (
    <>
      {/* Notes posées sur la page (ordinateur, tablette). */}
      {!mobile && !masques && charge && (
        <div className={'pointer-events-none fixed inset-0 z-[39]'} aria-label="Mes Post-it de cette page">
          {[...ici]
            .sort((a, b) => (placementIci(a, contexte.cle)?.z ?? 0) - (placementIci(b, contexte.cle)?.z ?? 0))
            .map((p) => (
              <NoteFlottante
                key={p.id}
                postit={p}
                placement={placementIci(p, contexte.cle)}
                temporaire={p.id === cibleId && !p.placements.some((pl) => pl.cle === contexte.cle)}
                cle={contexte.cle}
                vw={vw}
                vh={vh}
                surbrillance={surbrillance === p.id}
                zMax={Math.max(0, ...ici.map((x) => placementIci(x, contexte.cle)?.z ?? 0))}
                surFermer={() => setCibleId(null)}
              />
            ))}
        </div>
      )}

      {/* Onglet au bord droit : discret, hors des zones de saisie et des boutons de validation. */}
      <div ref={onglet} className="fixed right-0 top-[38%] z-[41] flex flex-col items-end">
        <button
          type="button"
          onClick={() => (mobile ? setTiroir(true) : setMenu((m) => !m))}
          aria-expanded={mobile ? tiroir : menu}
          aria-label={`Mes Post-it (${nb} sur cette page)`}
          title="Mes Post-it"
          className="group flex flex-col items-center gap-1 rounded-l-xl border border-r-0 border-black/10 py-2 pl-1.5 pr-1 shadow-[0_8px_24px_-10px_rgba(110,15,40,0.55)] transition-[padding] hover:pl-2.5"
          style={{ background: masques ? '#EDE6DC' : PALETTE.jaune.fond }}
        >
          {masques ? <EyeOff className="h-[18px] w-[18px] text-[#6E0F28]" /> : <StickyNote className="h-[18px] w-[18px] text-[#6E0F28]" />}
          <span className="min-w-[18px] rounded-full bg-[#6E0F28] px-1 text-center text-[10.5px] font-bold leading-[18px] text-white tabular-nums">{charge ? nb : '·'}</span>
        </button>

        {menu && !mobile && (
          <div role="menu" className="absolute right-full top-0 mr-2 w-64 rounded-2xl border border-(--color-border) bg-(--color-surface) p-1.5 shadow-(--shadow-lifted)">
            <p className="px-3 pb-1 pt-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-(--color-ink-muted)">Mes Post-it</p>
            <ItemMenu onClick={creer} icon={creation ? Loader2 : Plus} iconClass={creation ? 'animate-spin' : ''}>Nouveau Post-it sur cette page</ItemMenu>
            <ItemMenu onClick={basculerMasques} icon={masques ? Eye : EyeOff}>
              {masques ? `Réafficher les Post-it${nb ? ` (${nb})` : ''}` : 'Masquer tous les Post-it'}
            </ItemMenu>
            {estItem && <ItemMenu onClick={() => { setPanneauItem(true); setMenu(false); }} icon={Layers}>Mes Post-it sur cet item</ItemMenu>}
            <Link href="/mes-post-it" onClick={() => setMenu(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-(--color-ink) hover:bg-(--color-surface-soft)">
              <Library className="h-4 w-4 text-[#6E0F28]" /> Tous mes Post-it
            </Link>
          </div>
        )}
      </div>

      {/* Téléphone : tiroir des notes de la page. */}
      {mobile && tiroir && (
        <Tiroir titre={`Post-it de cette page (${nb})`} onClose={() => setTiroir(false)}>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={creer} disabled={creation} className="inline-flex items-center gap-1.5 rounded-xl bg-[#6E0F28] px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
              {creation ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Nouveau
            </button>
            {estItem && (
              <button type="button" onClick={() => { setTiroir(false); setPanneauItem(true); }} className="inline-flex items-center gap-1.5 rounded-xl border border-(--color-border) px-3 py-2 text-sm font-semibold text-(--color-ink)">
                <Layers className="h-4 w-4" /> Sur cet item
              </button>
            )}
            <Link href="/mes-post-it" className="inline-flex items-center gap-1.5 rounded-xl border border-(--color-border) px-3 py-2 text-sm font-semibold text-(--color-ink)">
              <Library className="h-4 w-4" /> Tous
            </Link>
          </div>
          <div className="mt-3 space-y-3">
            {ici.length === 0 && <p className="py-6 text-center text-sm text-(--color-ink-soft)">Aucun Post-it sur cette page.</p>}
            {ici.map((p) => (
              <div key={p.id} data-postit={p.id}>
                <NotePostit postit={p} mode="liste" placement={placementIci(p, contexte.cle)} surbrillance={surbrillance === p.id} />
              </div>
            ))}
          </div>
        </Tiroir>
      )}

      {panneauItem && contexte.coursId && (
        <PanneauItem coursId={contexte.coursId} mobile={mobile} onClose={() => setPanneauItem(false)} />
      )}
    </>
  );
}

function placementIci(p: Postit, cle: string): Placement | null {
  return p.placements.find((pl) => pl.cle === cle) ?? null;
}

function ItemMenu({ onClick, icon: Icon, iconClass, children }: { onClick: () => void; icon: typeof Plus; iconClass?: string; children: ReactNode }) {
  return (
    <button type="button" role="menuitem" onClick={onClick} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-(--color-ink) hover:bg-(--color-surface-soft)">
      <Icon className={cn('h-4 w-4 shrink-0 text-[#6E0F28]', iconClass)} /> {children}
    </button>
  );
}

/**
 * Note posée sur la page : déplacement par le bandeau, redimensionnement par
 * le coin, premier plan au toucher, état réduit. Position et taille sont
 * enregistrées au lâcher (§23), et toujours ramenées dans la fenêtre.
 */
function NoteFlottante({
  postit, placement, temporaire, cle, vw, vh, surbrillance, zMax, surFermer,
}: {
  postit: Postit; placement: Placement | null; temporaire: boolean; cle: string; vw: number; vh: number; surbrillance: boolean; zMax: number;
  /** Ferme une note montrée temporairement (« Ouvrir dans sa page » d'une note placée ailleurs). */
  surFermer: () => void;
}) {
  const { appeler, majPlacement, remplacer } = usePostits();
  const base: Geometrie = placement ?? postit.placements[0] ?? { x: vw - 300, y: 120, w: 260, h: 250 };
  const [glisse, setGlisse] = useState<Geometrie | null>(null);
  const depart = useRef<{ px: number; py: number; g: Geometrie; genre: 'deplacer' | 'redimensionner' } | null>(null);
  const g = contraindre(glisse ?? base, vw, vh);
  const reduit = placement?.reduit ?? false;

  function commencer(genre: 'deplacer' | 'redimensionner', e: ReactPointerEvent<HTMLElement>) {
    if (e.button !== 0) return;
    const cibleEl = e.target as HTMLElement;
    if (genre === 'deplacer' && cibleEl.closest('input, textarea, button, a')) return;
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    depart.current = { px: e.clientX, py: e.clientY, g, genre };
    setGlisse(g);
    if (placement && placement.z < zMax) majPlacement(postit.id, placement.id, { z: zMax + 1 });
  }
  const bouger = (e: ReactPointerEvent<HTMLElement>) => {
    const d = depart.current;
    if (!d) return;
    const dx = e.clientX - d.px;
    const dy = e.clientY - d.py;
    setGlisse(d.genre === 'deplacer' ? { ...d.g, x: d.g.x + dx, y: d.g.y + dy } : { ...d.g, w: d.g.w + dx, h: d.g.h + dy });
  };
  const lacher = () => {
    const d = depart.current;
    depart.current = null;
    if (!d || !glisse) { setGlisse(null); return; }
    const fin = contraindre(glisse, vw, vh);
    setGlisse(null);
    if (!placement) return;
    const patch = d.genre === 'deplacer' ? { x: fin.x, y: fin.y } : { w: fin.w, h: fin.h };
    const bouge = d.genre === 'deplacer' ? (fin.x !== placement.x || fin.y !== placement.y) : (fin.w !== placement.w || fin.h !== placement.h);
    const z = Math.max(placement.z, zMax + (placement.z < zMax ? 1 : 0));
    majPlacement(postit.id, placement.id, { ...patch, z });
    if (d.genre === 'redimensionner') remplacer({ ...postit, taille: tailleDepuisDimensions(fin.w, fin.h), placements: postit.placements.map((p) => (p.id === placement.id ? { ...p, ...patch, z } : p)) });
    if (bouge || z !== placement.z) {
      void appeler({ action: 'placer', placementId: placement.id, ...patch, z, ...(d.genre === 'redimensionner' ? { taille: tailleDepuisDimensions(fin.w, fin.h) } : {}) });
    }
  };

  const basculerReduit = () => {
    if (!placement) return;
    majPlacement(postit.id, placement.id, { reduit: !reduit });
    void appeler({ action: 'placer', placementId: placement.id, reduit: !reduit });
  };

  const c = PALETTE[postit.couleur];
  if (reduit && placement) {
    return (
      <button
        type="button"
        onClick={basculerReduit}
        title="Déplier le Post-it"
        className="pointer-events-auto absolute flex max-w-[220px] items-center gap-1.5 rounded-[3px] px-2.5 py-1.5 text-left text-[12.5px] font-bold shadow-[0_6px_16px_-6px_rgba(0,0,0,0.35)] transition-transform hover:-translate-y-0.5"
        style={{ left: g.x, top: g.y, background: c.bandeau, color: c.encre }}
      >
        <StickyNote className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{postit.titre || 'Post-it'}</span>
      </button>
    );
  }

  return (
    <div
      data-postit={postit.id}
      className="pointer-events-auto absolute"
      style={{ left: g.x, top: g.y, width: g.w, height: g.h }}
      onPointerMove={bouger}
      onPointerUp={lacher}
      onPointerCancel={lacher}
    >
      <NotePostit
        postit={postit}
        mode="flottant"
        placement={placement}
        surPoignee={(e) => commencer('deplacer', e)}
        surReduire={placement ? basculerReduit : undefined}
        surbrillance={surbrillance}
        bandeauSupplementaire={temporaire ? (
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => void appeler({ action: 'afficherAussi', id: postit.id, vers: cle })}
            className="shrink-0 rounded-md bg-black/10 px-1.5 py-0.5 text-[10.5px] font-bold hover:bg-black/20"
            style={{ color: c.encre }}
            title="Ce Post-it est affiché ailleurs : l’afficher aussi sur cette page"
          >
            Garder ici
          </button>
        ) : undefined}
      />
      {temporaire && (
        <button
          type="button"
          onClick={surFermer}
          aria-label="Fermer"
          className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-[#2A0A14] text-white shadow"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
      {/* Poignée de redimensionnement libre. */}
      {placement && (
        <span
          role="separator"
          aria-label="Redimensionner le Post-it"
          onPointerDown={(e) => commencer('redimensionner', e)}
          className="absolute bottom-0 right-0 z-10 h-5 w-5 cursor-nwse-resize touch-none"
        />
      )}
    </div>
  );
}

function Tiroir({ titre, onClose, children }: { titre: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const echap = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', echap);
    return () => window.removeEventListener('keydown', echap);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[48]" role="dialog" aria-modal="true" aria-label={titre}>
      <button type="button" aria-label="Fermer" onClick={onClose} className="absolute inset-0 bg-black/35" />
      <div className="absolute inset-x-0 bottom-0 flex max-h-[86dvh] flex-col rounded-t-3xl bg-[#FBF7F1] shadow-2xl">
        <div className="flex items-center justify-between gap-2 border-b border-black/10 px-4 py-3">
          <p className="flex items-center gap-2 text-[15px] font-bold text-[#2A0A14]"><StickyNote className="h-4 w-4 text-[#6E0F28]" /> {titre}</p>
          <button type="button" onClick={onClose} aria-label="Fermer" className="grid h-8 w-8 place-items-center rounded-lg hover:bg-black/5"><X className="h-4 w-4" /></button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-3">{children}</div>
      </div>
    </div>
  );
}

/**
 * « Mes Post-it sur cet item » (§32) : toutes les notes de l'item, archivées
 * comprises (grisées), sans quitter la page. Un clic ouvre la note en grand.
 */
function PanneauItem({ coursId, mobile, onClose }: { coursId: string; mobile: boolean; onClose: () => void }) {
  const { postits, demander, remplacer } = usePostits();
  const [liste, setListe] = useState<Postit[] | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    let annule = false;
    chargerPostitsCours(coursId)
      // Les notes de l'item rejoignent l'état partagé (pour les ouvrir en grand) ;
      // celles qui ne sont pas placées ici ne s'affichent pas sur la page.
      .then((r) => { if (!annule) { setListe(r.postits); r.postits.forEach(remplacer); } })
      .catch((e) => { if (!annule) setErreur(e instanceof Error ? e.message : 'Liste indisponible.'); });
    return () => { annule = true; };
  }, [coursId, remplacer]);

  // Les notes ouvertes en grand vivent dans l'état partagé : on affiche leur version à jour.
  const affichees = liste ? postitsDeLItem(liste.map((p) => postits.find((x) => x.id === p.id) ?? p), coursId) : null;

  const contenu = (
    <>
      {erreur && <p className="text-sm text-[#9B0F2C]">{erreur}</p>}
      {!affichees && !erreur && <p className="flex items-center gap-2 text-sm text-(--color-ink-soft)"><Loader2 className="h-4 w-4 animate-spin" /> Chargement…</p>}
      {affichees && affichees.length === 0 && <p className="py-6 text-center text-sm text-(--color-ink-soft)">Aucun Post-it sur cet item pour l’instant.</p>}
      <ul className="space-y-2.5">
        {affichees?.map((p) => {
          const c = PALETTE[p.couleur];
          return (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => demander({ genre: 'ouvrir', postitId: p.id })}
                className={cn('block w-full rounded-[3px] p-3 text-left shadow-[0_6px_16px_-8px_rgba(0,0,0,0.35)] transition-transform hover:-translate-y-0.5', p.statut !== 'actif' && 'opacity-55 grayscale-[35%]')}
                style={{ background: c.fond, color: c.encre }}
              >
                <span className="flex items-center gap-2 text-[13px] font-bold">
                  <span className="min-w-0 flex-1 truncate">{p.titre || 'Post-it sans titre'}</span>
                  {p.statut === 'archive' && <span className="rounded-full bg-black/10 px-1.5 text-[10.5px]">Archivé</span>}
                </span>
                {p.contenu && <span className={cn(policeManuscrite.className, 'mt-0.5 line-clamp-3 block text-[18px] leading-[1.2]')}>{p.contenu}</span>}
                {p.taches.length > 0 && <span className="mt-1 block text-[11.5px] font-semibold opacity-75">{p.taches.filter((t) => t.fait).length}/{p.taches.length} tâche(s) faite(s)</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );

  if (mobile) return <Tiroir titre="Mes Post-it sur cet item" onClose={onClose}>{contenu}</Tiroir>;
  return (
    <aside className="fixed bottom-4 right-14 top-20 z-[47] flex w-[340px] flex-col overflow-hidden rounded-2xl border border-(--color-border) bg-[#FBF7F1] shadow-(--shadow-lifted)" aria-label="Mes Post-it sur cet item">
      <div className="flex items-center justify-between gap-2 border-b border-black/10 px-4 py-3">
        <p className="flex items-center gap-2 text-[14px] font-bold text-[#2A0A14]"><Layers className="h-4 w-4 text-[#6E0F28]" /> Mes Post-it sur cet item</p>
        <button type="button" onClick={onClose} aria-label="Fermer" className="grid h-8 w-8 place-items-center rounded-lg hover:bg-black/5"><X className="h-4 w-4" /></button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">{contenu}</div>
    </aside>
  );
}
