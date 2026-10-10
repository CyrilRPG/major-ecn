'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Bell, BellOff, CalendarDays, ExternalLink, Loader2, MapPin, Plus, Search, StickyNote, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  PALETTE, joursAvantPurge, libelleEmplacement, lienPostit, type PreferencesPostit, type Postit,
} from '@/lib/postits/regles';
import {
  anneesPresentes, filtrerPostits, specialitesPresentes, type Onglet, type Periode,
} from '@/lib/postits/recherche';
import { FournisseurPostits, usePostits } from './etat';
import { DialoguesPostits } from './dialogues';
import { formatDate } from './note';
import { policeManuscrite } from './police';

/**
 * Bibliothèque « Tous mes Post-it » (§26-31) : onglets, recherche, filtres de
 * date (jour, mois, année, période personnalisée), notes archivées grisées,
 * ouverture en grand, corbeille avec compte à rebours.
 */
export function BibliothequePostits({ initiaux, preferences, ouvrir }: { initiaux: Postit[]; preferences: PreferencesPostit; ouvrir: string | null }) {
  const [postits, setPostits] = useState(initiaux);
  return (
    <FournisseurPostits postits={postits} setPostits={setPostits} cleCourante={null}>
      <Bibliotheque preferences={preferences} ouvrir={ouvrir} />
      <DialoguesPostits />
    </FournisseurPostits>
  );
}

const ONGLETS: { cle: Onglet; label: string }[] = [
  { cle: 'tous', label: 'Tous' },
  { cle: 'actifs', label: 'Actifs' },
  { cle: 'archives', label: 'Archivés' },
  { cle: 'corbeille', label: 'Corbeille' },
];

type GenrePeriode = Periode['genre'];

function Bibliotheque({ preferences, ouvrir }: { preferences: PreferencesPostit; ouvrir: string | null }) {
  const { postits, demander, appeler, aujourdHui } = usePostits();
  const [onglet, setOnglet] = useState<Onglet>('tous');
  const [texte, setTexte] = useState('');
  const [matiereId, setMatiereId] = useState('');
  const [emplacement, setEmplacement] = useState('');
  const [genrePeriode, setGenrePeriode] = useState<GenrePeriode>('tout');
  const [jour, setJour] = useState(aujourdHui);
  const [mois, setMois] = useState(aujourdHui.slice(0, 7));
  const [annee, setAnnee] = useState(aujourdHui.slice(0, 4));
  const [du, setDu] = useState('');
  const [au, setAu] = useState('');
  const [rappels, setRappels] = useState(preferences.rappelsActifs);
  const [creation, setCreation] = useState(false);

  // « Voir dans Tous mes Post-it » : la note demandée s'ouvre en grand.
  useEffect(() => {
    if (ouvrir && postits.some((p) => p.id === ouvrir)) demander({ genre: 'ouvrir', postitId: ouvrir });
    // Une seule fois, à l'arrivée.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const periode: Periode = genrePeriode === 'jour' ? { genre: 'jour', date: jour }
    : genrePeriode === 'mois' ? { genre: 'mois', mois }
      : genrePeriode === 'annee' ? { genre: 'annee', annee }
        : genrePeriode === 'perso' ? { genre: 'perso', du: du || null, au: au || null }
          : { genre: 'tout' };

  const resultats = useMemo(
    () => filtrerPostits(postits, { onglet, texte, matiereId: matiereId || null, emplacement: emplacement || null, periode }),
    // `periode` est recalculé à chaque rendu : on dépend de ses composantes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [postits, onglet, texte, matiereId, emplacement, genrePeriode, jour, mois, annee, du, au],
  );
  const compte = (o: Onglet) => filtrerPostits(postits, { onglet: o }).length;
  const specialites = useMemo(() => specialitesPresentes(postits), [postits]);
  const annees = useMemo(() => {
    const a = anneesPresentes(postits);
    return a.includes(aujourdHui.slice(0, 4)) ? a : [aujourdHui.slice(0, 4), ...a];
  }, [postits, aujourdHui]);
  const filtresActifs = !!(texte || matiereId || emplacement || genrePeriode !== 'tout');

  async function basculerRappels() {
    const v = !rappels;
    setRappels(v);
    const r = await appeler({ action: 'preferences', rappelsActifs: v });
    if (!r) setRappels(!v);
  }

  async function creer() {
    setCreation(true);
    const r = await appeler({ action: 'creer', emplacement: 'accueil', chemin: '/mes-post-it', couleur: 'jaune', taille: 'moyen', x: 900, y: 140 });
    setCreation(false);
    if (r?.postit) { setOnglet('actifs'); demander({ genre: 'ouvrir', postitId: r.postit.id }); }
  }

  const champ = 'h-10 rounded-xl border border-(--color-border) bg-(--color-surface) px-3 text-sm text-(--color-ink) focus-ring';

  return (
    <div className="space-y-5">
      {/* Onglets + actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Statut" className="flex flex-wrap gap-1 rounded-2xl border border-(--color-border) bg-(--color-surface) p-1">
          {ONGLETS.map((o) => (
            <button
              key={o.cle}
              role="tab"
              type="button"
              aria-selected={onglet === o.cle}
              onClick={() => setOnglet(o.cle)}
              className={cn(
                'flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors',
                onglet === o.cle ? 'bg-[#6E0F28] text-white' : 'text-(--color-ink-soft) hover:bg-(--color-surface-soft)',
              )}
            >
              {o.cle === 'corbeille' && <Trash2 className="h-3.5 w-3.5" />}
              {o.label}
              <span className={cn('rounded-full px-1.5 text-[11px] tabular-nums', onglet === o.cle ? 'bg-white/20' : 'bg-(--color-surface-soft)')}>{compte(o.cle)}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={basculerRappels}
            aria-pressed={rappels}
            title="Rappels des tâches datées et horodatées (notifications de l’application). N’affecte pas les rappels des cours en direct."
            className="inline-flex items-center gap-2 rounded-xl border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm font-semibold text-(--color-ink) hover:bg-(--color-surface-soft)"
          >
            {rappels ? <Bell className="h-4 w-4 text-[#6E0F28]" /> : <BellOff className="h-4 w-4 text-(--color-ink-muted)" />}
            Rappels de mes tâches : {rappels ? 'activés' : 'désactivés'}
          </button>
          <button type="button" onClick={creer} disabled={creation} className="inline-flex items-center gap-2 rounded-xl bg-[#6E0F28] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#5A0B20] disabled:opacity-60">
            {creation ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Nouveau Post-it sur l’accueil
          </button>
        </div>
      </div>

      {/* Recherche et filtres (§27) */}
      <div className="grid gap-2 rounded-2xl border border-(--color-border) bg-(--color-surface) p-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))]">
        <label className="relative sm:col-span-2 lg:col-span-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-ink-muted)" />
          <input
            value={texte}
            onChange={(e) => setTexte(e.target.value)}
            placeholder="Mot-clé, titre, spécialité, item, page, statut…"
            aria-label="Rechercher dans mes Post-it"
            className={cn(champ, 'w-full pl-9')}
          />
        </label>
        <select value={matiereId} onChange={(e) => setMatiereId(e.target.value)} aria-label="Spécialité" className={champ}>
          <option value="">Toutes les spécialités</option>
          {specialites.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
        </select>
        <select value={emplacement} onChange={(e) => setEmplacement(e.target.value)} aria-label="Emplacement actuel" className={champ}>
          <option value="">Tous les emplacements</option>
          <option value="accueil">Sur l’accueil</option>
          <option value="genre:item">Sur une page d’item</option>
          <option value="genre:specialite">Sur une page de spécialité</option>
          <option value="aucun">Sur aucune page</option>
        </select>
        <select value={genrePeriode} onChange={(e) => setGenrePeriode(e.target.value as GenrePeriode)} aria-label="Date de création" className={champ}>
          <option value="tout">Toutes les dates</option>
          <option value="jour">Créés le…</option>
          <option value="mois">Créés en (mois)…</option>
          <option value="annee">Créés en (année)…</option>
          <option value="perso">Période personnalisée…</option>
        </select>
        {genrePeriode !== 'tout' && (
          <div className="flex flex-wrap items-center gap-2 sm:col-span-2 lg:col-span-4">
            <CalendarDays className="h-4 w-4 text-(--color-ink-muted)" />
            {genrePeriode === 'jour' && <input type="date" value={jour} onChange={(e) => setJour(e.target.value)} aria-label="Jour" className={champ} />}
            {genrePeriode === 'mois' && <input type="month" value={mois} onChange={(e) => setMois(e.target.value)} aria-label="Mois" className={champ} />}
            {genrePeriode === 'annee' && (
              <select value={annee} onChange={(e) => setAnnee(e.target.value)} aria-label="Année" className={champ}>
                {annees.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            )}
            {genrePeriode === 'perso' && (
              <>
                <label className="flex items-center gap-1.5 text-sm text-(--color-ink-soft)">du <input type="date" value={du} onChange={(e) => setDu(e.target.value)} className={champ} /></label>
                <label className="flex items-center gap-1.5 text-sm text-(--color-ink-soft)">au <input type="date" value={au} onChange={(e) => setAu(e.target.value)} className={champ} /></label>
              </>
            )}
          </div>
        )}
      </div>

      <p className="text-sm text-(--color-ink-soft)" aria-live="polite">
        {resultats.length} Post-it{filtresActifs ? ' correspondant à votre recherche' : ''}
        {onglet === 'corbeille' && ' · effacés définitivement 30 jours après leur suppression'}
      </p>

      {resultats.length === 0 ? (
        <div className="grid place-items-center rounded-3xl border border-dashed border-(--color-border) bg-(--color-surface) px-6 py-14 text-center">
          <StickyNote className="h-10 w-10 text-[#6E0F28]/40" />
          <p className="mt-3 font-semibold text-(--color-ink)">{filtresActifs ? 'Aucun Post-it ne correspond.' : onglet === 'corbeille' ? 'La corbeille est vide.' : 'Aucun Post-it pour l’instant.'}</p>
          {!filtresActifs && onglet !== 'corbeille' && (
            <p className="mt-1 max-w-md text-sm text-(--color-ink-soft)">
              Créez-en un depuis l’accueil ou depuis un item : l’onglet jaune « Post-it », au bord droit de l’écran.
            </p>
          )}
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {resultats.map((p) => <li key={p.id}><CartePostit postit={p} /></li>)}
        </ul>
      )}
    </div>
  );
}

/** Vignette d'un Post-it ; archivé = grisé (§29), la note garde sa couleur en grand. */
function CartePostit({ postit }: { postit: Postit }) {
  const { demander } = usePostits();
  const c = PALETTE[postit.couleur];
  const faites = postit.taches.filter((t) => t.fait).length;
  const lien = lienPostit(postit.origine.cle, postit.id);
  const inactive = postit.statut !== 'actif';
  return (
    <div className={cn('group relative h-full', inactive && 'opacity-60 grayscale-[45%] hover:opacity-90 hover:grayscale-0')}>
      <button
        type="button"
        onClick={() => demander({ genre: 'ouvrir', postitId: postit.id })}
        className="flex h-full min-h-[210px] w-full flex-col rounded-[3px] p-4 text-left shadow-[0_12px_28px_-14px_rgba(0,0,0,0.45)] transition-transform hover:-translate-y-1 focus-ring"
        style={{ background: c.fond, color: c.encre }}
      >
        <span className="flex items-start gap-2">
          <span className="min-w-0 flex-1 font-(family-name:--font-jakarta) text-[15px] font-bold leading-snug">{postit.titre || 'Post-it sans titre'}</span>
          {postit.statut === 'archive' && <span className="shrink-0 rounded-full bg-black/10 px-2 py-0.5 text-[10.5px] font-bold">Archivé</span>}
          {postit.statut === 'supprime' && postit.supprimeLe && (
            <span className="shrink-0 rounded-full bg-black/10 px-2 py-0.5 text-[10.5px] font-bold">{joursAvantPurge(postit.supprimeLe, new Date())} j</span>
          )}
        </span>
        {postit.contenu && <span className={cn(policeManuscrite.className, 'mt-1 line-clamp-4 text-[20px] leading-[1.2]')}>{postit.contenu}</span>}
        {postit.taches.length > 0 && (
          <span className="mt-2 space-y-0.5">
            {postit.taches.slice(0, 3).map((t) => (
              <span key={t.id} className={cn(policeManuscrite.className, 'flex items-center gap-1.5 text-[18px] leading-[1.15]')}>
                <span className="grid h-3 w-3 shrink-0 place-items-center rounded-[3px] border" style={{ borderColor: c.encre, background: t.fait ? c.encre : 'transparent' }} />
                <span className={cn('truncate', t.fait && 'line-through opacity-60')}>{t.texte}</span>
              </span>
            ))}
            {postit.taches.length > 3 && <span className="block text-[11px] font-semibold opacity-70">+ {postit.taches.length - 3} autre(s) · {faites}/{postit.taches.length} faite(s)</span>}
          </span>
        )}
        <span className="mt-auto space-y-0.5 pt-3 text-[11px] font-medium opacity-75">
          <span className="block truncate">Créé dans : {libelleEmplacement(postit.origine)}</span>
          {postit.placements.length > 0 && (
            <span className="flex items-center gap-1 truncate"><MapPin className="h-3 w-3 shrink-0" /> {postit.placements.map((pl) => libelleEmplacement(pl)).join(' · ')}</span>
          )}
          <span className="block">{formatDate(postit.creeLe)}</span>
        </span>
      </button>
      {lien && postit.statut === 'actif' && (
        <Link
          href={lien}
          title="Ouvrir dans sa page"
          aria-label="Ouvrir dans sa page"
          className="absolute -right-2 -top-2 grid h-8 w-8 place-items-center rounded-full bg-[#6E0F28] text-white opacity-0 shadow-lg transition-opacity focus:opacity-100 group-hover:opacity-100"
        >
          <ExternalLink className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
