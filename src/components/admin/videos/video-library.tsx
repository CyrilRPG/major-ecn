'use client';

import { useCallback, useState } from 'react';
import { Loader2, Video } from 'lucide-react';
import {
  listItemsAction, listVideosAction,
  type VideoLibraryItem, type VideoLibraryVideo, type VideoType,
} from '@/app/admin/videos/actions';
import { BunnyVideoUpload } from '@/components/admin/content/bunny-video-upload';
import { VideoManager } from './video-manager';

export type LibraryCollege = {
  id: string;
  nom: string;
  /** Sous-collèges (Médecine générale). Vide pour les spécialités simples. */
  enfants: { id: string; nom: string }[];
};

const CATEGORIES: { type: VideoType; label: string; aide: string }[] = [
  { type: 'cours', label: 'Cours vidéo', aide: 'Visible par la Formule Intensive.' },
  { type: 'seance_approfondie', label: 'Séances approfondies', aide: 'Visible par le Programme Approfondi.' },
];

/**
 * Cascade collège → sous-collège → item → catégorie, puis la liste des vidéos
 * de la catégorie choisie (flèches d'ordre, crayon d'édition, bouton +).
 *
 * Les listes sont chargées à la demande : la plateforme compte plusieurs
 * centaines d'items, les charger toutes d'avance rendrait la page lourde.
 */
export function VideoLibrary({ colleges }: { colleges: LibraryCollege[] }) {
  const [collegeId, setCollegeId] = useState('');
  const [sousCollegeId, setSousCollegeId] = useState('');
  const [coursId, setCoursId] = useState('');
  const [type, setType] = useState<VideoType>('seance_approfondie');

  const [items, setItems] = useState<VideoLibraryItem[] | null>(null);
  const [videos, setVideos] = useState<VideoLibraryVideo[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const college = colleges.find((c) => c.id === collegeId) ?? null;
  const aDesEnfants = (college?.enfants.length ?? 0) > 0;
  // Un collège à sous-collèges (Médecine générale) n'a pas d'items en propre :
  // c'est le sous-collège qui porte les items.
  const matiereId = aDesEnfants ? sousCollegeId : collegeId;

  // Les chargements sont déclenchés par les sélections (pas par des effets) :
  // c'est une réaction à une action de l'utilisateur, pas une synchronisation.
  const chargerItems = useCallback((mid: string) => {
    if (!mid) { setItems(null); return; }
    setLoading(true);
    setError(null);
    listItemsAction(mid).then((res) => {
      setLoading(false);
      if ('error' in res) { setError(res.error); setItems([]); return; }
      setItems(res.items);
    });
  }, []);

  const chargerVideos = useCallback((cid: string, t: VideoType) => {
    if (!cid) { setVideos(null); return; }
    setLoading(true);
    setError(null);
    listVideosAction(cid, t).then((res) => {
      setLoading(false);
      if ('error' in res) { setError(res.error); setVideos([]); return; }
      setVideos(res.videos);
    });
  }, []);

  /** Après une modification : la liste ET les compteurs d'items. */
  const rechargerTout = useCallback(() => {
    chargerVideos(coursId, type);
    if (matiereId) {
      listItemsAction(matiereId).then((res) => {
        if (!('error' in res)) setItems(res.items);
      });
    }
  }, [chargerVideos, coursId, type, matiereId]);

  const item = items?.find((i) => i.id === coursId) ?? null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Champ label="Collège">
          <select
            value={collegeId}
            onChange={(e) => {
              const id = e.target.value;
              setCollegeId(id); setSousCollegeId(''); setCoursId(''); setVideos(null); setItems(null);
              const c = colleges.find((x) => x.id === id);
              if (c && c.enfants.length === 0) chargerItems(id);
            }}
            className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm"
          >
            <option value="">Choisir un collège…</option>
            {colleges.map((c) => (
              <option key={c.id} value={c.id}>{c.nom}</option>
            ))}
          </select>
        </Champ>

        {aDesEnfants && (
          <Champ label="Sous-collège">
            <select
              value={sousCollegeId}
              onChange={(e) => {
                const id = e.target.value;
                setSousCollegeId(id); setCoursId(''); setVideos(null); setItems(null);
                chargerItems(id);
              }}
              className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm"
            >
              <option value="">Choisir un sous-collège…</option>
              {college?.enfants.map((e) => (
                <option key={e.id} value={e.id}>{e.nom}</option>
              ))}
            </select>
          </Champ>
        )}

        {matiereId && (
          <Champ label="Item">
            <select
              value={coursId}
              onChange={(e) => {
                const id = e.target.value;
                setCoursId(id); setVideos(null);
                chargerVideos(id, type);
              }}
              className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm"
              disabled={!items}
            >
              <option value="">{items ? 'Choisir un item…' : 'Chargement…'}</option>
              {(items ?? []).map((i) => (
                <option key={i.id} value={i.id}>
                  {i.titre}
                  {i.nbCours + i.nbSeances > 0
                    ? ` — ${i.nbCours} vidéo${i.nbCours > 1 ? 's' : ''} · ${i.nbSeances} séance${i.nbSeances > 1 ? 's' : ''}`
                    : ''}
                </option>
              ))}
            </select>
          </Champ>
        )}
      </div>

      {coursId && (
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-(--color-ink-muted)">
            Catégorie
          </p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => {
              const actif = type === c.type;
              const n = c.type === 'cours' ? item?.nbCours : item?.nbSeances;
              return (
                <button
                  key={c.type}
                  type="button"
                  onClick={() => { setType(c.type); setVideos(null); chargerVideos(coursId, c.type); }}
                  className={
                    'rounded-xl border px-3.5 py-2 text-sm font-semibold transition-colors ' +
                    (actif
                      ? 'border-[#7C3AED] bg-[#F3EAFF] text-[#5B21B6]'
                      : 'border-(--color-border) bg-(--color-surface) text-(--color-ink-soft) hover:bg-(--color-sand-100)')
                  }
                >
                  {c.label}
                  {typeof n === 'number' && (
                    <span className="ml-1.5 text-xs font-bold tabular-nums opacity-70">{n}</span>
                  )}
                </button>
              );
            })}
          </div>
          <p className="mt-1.5 text-xs text-(--color-ink-muted)">
            {CATEGORIES.find((c) => c.type === type)?.aide}
          </p>
        </div>
      )}

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      {!coursId ? (
        <div className="rounded-2xl border border-dashed border-(--color-border) bg-(--color-surface-soft) px-4 py-10 text-center">
          <Video className="mx-auto h-7 w-7 text-(--color-ink-muted)" />
          <p className="mt-2 text-sm font-semibold text-(--color-ink)">Choisissez un item</p>
          <p className="mt-0.5 text-xs text-(--color-ink-soft)">
            Collège, puis item : toutes les vidéos de la catégorie choisie s’affichent ici.
          </p>
        </div>
      ) : videos === null || loading ? (
        <p className="flex items-center gap-2 px-1 py-6 text-sm text-(--color-ink-soft)">
          <Loader2 className="h-4 w-4 animate-spin" /> Chargement…
        </p>
      ) : (
        <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4">
          <p className="mb-3 text-sm font-bold text-(--color-ink)">
            {item?.titre} — {CATEGORIES.find((c) => c.type === type)?.label}
          </p>
          <VideoManager
            key={`${coursId}-${type}`}
            coursId={coursId}
            type={type}
            videos={videos}
            onChanged={rechargerTout}
          />

          {/* Repli : envoyer le fichier depuis ici, sans passer par bunny.net. */}
          <details className="mt-4 rounded-xl border border-(--color-border) bg-(--color-surface-soft) px-3 py-2">
            <summary className="cursor-pointer text-[12.5px] font-semibold text-(--color-ink-soft)">
              Autre méthode : téléverser le fichier directement (sans passer par bunny.net)
            </summary>
            <div className="pt-3">
              <BunnyVideoUpload
                coursId={coursId}
                type={type}
                defaultTitle={`${CATEGORIES.find((c) => c.type === type)?.label ?? 'Vidéo'} ${videos.length + 1}`}
                onDone={rechargerTout}
              />
            </div>
          </details>
        </div>
      )}
    </div>
  );
}

function Champ({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-(--color-ink-muted)">
        {label}
      </span>
      {children}
    </label>
  );
}
