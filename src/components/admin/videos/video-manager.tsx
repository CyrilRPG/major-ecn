'use client';

import { useCallback, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronDown, ChevronUp, FileText, Link2, Loader2, Paperclip, Pencil,
  Plus, Search, Trash2, UserMinus, Video, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { extractBunnyVideoId } from '@/lib/bunny-link';
import {
  addVideoAction, addVideoSupportAction, deleteVideoAction, listStudentsAction,
  moveVideoAction, removeVideoSupportAction, renameVideoAction, renameVideoSupportAction,
  replaceVideoLinkAction, updateVideoAudienceAction, updateVideoSupportAudienceAction,
  type AddResult, type StudentLite, type VideoSupportDoc, type VideoType,
} from '@/app/admin/videos/actions';
import { resumeAudience, VIDEO_OFFERS, VOIES } from '@/lib/videos/audience';

export type ManagedVideo = {
  id: string;
  titre: string;
  bunny_video_id: string | null;
  order_index: number;
  /** Voies de concours concernées (les deux = aucune restriction). */
  voies: string[];
  /** Formules ayant accès à cette vidéo (et à ses supports). */
  offers: string[];
  /** Élèves explicitement privés d'accès à cette séance. */
  denied_user_ids: string[];
  /** Supports PDF de la vidéo (plusieurs possibles). */
  supports: VideoSupportDoc[];
};

/**
 * Sélecteur d'élèves à EXCLURE d'une séance. Les élèves cochés perdent l'accès,
 * même si leur formule/voie les rendrait éligibles. La liste est chargée à la
 * demande (annuaire potentiellement volumineux) et partagée par tout le manager.
 */
function StudentExclusionPicker({
  students,
  loading,
  error,
  onLoad,
  selected,
  disabled,
  onChange,
}: {
  students: StudentLite[] | null;
  loading: boolean;
  error: string | null;
  onLoad: () => void;
  selected: string[];
  disabled?: boolean;
  onChange: (ids: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');

  function toggleOpen() {
    const next = !open;
    setOpen(next);
    if (next && students === null && !loading) onLoad();
  }

  const bascule = (id: string) => {
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  };

  const filtered = (students ?? []).filter((s) => {
    if (!q.trim()) return true;
    const t = `${s.nom} ${s.email ?? ''} ${s.promotion ?? ''}`.toLowerCase();
    return t.includes(q.trim().toLowerCase());
  });
  const selNoms = (students ?? []).filter((s) => selected.includes(s.id));

  return (
    <div className="rounded-xl border border-(--color-border) bg-(--color-surface-soft) p-3">
      <button
        type="button"
        onClick={toggleOpen}
        className="flex w-full items-center justify-between gap-2 text-left"
      >
        <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-(--color-ink-muted)">
          <UserMinus className="h-3.5 w-3.5" />
          Retirer l’accès à certains élèves
          {selected.length > 0 && (
            <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700">
              {selected.length}
            </span>
          )}
        </span>
        {open ? <ChevronUp className="h-4 w-4 text-(--color-ink-muted)" /> : <ChevronDown className="h-4 w-4 text-(--color-ink-muted)" />}
      </button>

      {/* Résumé des exclus, visible même replié. */}
      {selected.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {(students ? selNoms : selected.map((id) => ({ id, nom: 'Élève', email: null, promotion: null }))).map((s) => (
            <span key={s.id} className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700">
              {s.nom}
              <button
                type="button"
                disabled={disabled}
                aria-label={`Réautoriser ${s.nom}`}
                onClick={() => bascule(s.id)}
                className="rounded-full hover:bg-red-200"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {open && (
        <div className="mt-2">
          <div className="mb-2 flex items-center gap-2 rounded-lg border border-(--color-border) bg-(--color-surface) px-2">
            <Search className="h-3.5 w-3.5 text-(--color-ink-muted)" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher un élève (nom, e-mail, promotion)…"
              className="w-full bg-transparent py-1.5 text-sm outline-none"
            />
          </div>
          {loading ? (
            <p className="flex items-center gap-2 py-2 text-xs text-(--color-ink-soft)">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Chargement des élèves…
            </p>
          ) : error ? (
            <p className="py-2 text-xs font-medium text-red-600">{error}</p>
          ) : (
            <ul className="max-h-52 space-y-0.5 overflow-y-auto pr-1">
              {filtered.length === 0 ? (
                <li className="py-2 text-xs text-(--color-ink-muted)">Aucun élève.</li>
              ) : (
                filtered.map((s) => (
                  <li key={s.id}>
                    <label className="flex cursor-pointer items-center gap-2 rounded-lg px-1.5 py-1 text-sm hover:bg-(--color-sand-100)">
                      <input
                        type="checkbox"
                        disabled={disabled}
                        checked={selected.includes(s.id)}
                        onChange={() => bascule(s.id)}
                        className="h-4 w-4 accent-red-600"
                      />
                      <span className="min-w-0 flex-1 truncate text-(--color-ink)">{s.nom}</span>
                      {s.promotion && (
                        <span className="shrink-0 text-[11px] text-(--color-ink-muted)">{s.promotion}</span>
                      )}
                    </label>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      )}
      <p className="mt-1 text-[11px] text-(--color-ink-muted)">
        Les élèves cochés ne verront plus cette séance ni ses supports.
      </p>
    </div>
  );
}

/** Audience par défaut d'un nouvel ajout — celle qui avait cours avant le
 *  ciblage par vidéo. Les deux voies sont cochées. */
const OFFRES_PAR_DEFAUT: Record<VideoType, string[]> = {
  cours: ['intensif'],
  seance_approfondie: ['approfondi'],
};

/** Cases à cocher d'audience : voies (les deux par défaut) et formules. */
function AudiencePicker({
  voies, offers, disabled, onVoies, onOffers,
}: {
  voies: string[];
  offers: string[];
  disabled?: boolean;
  onVoies: (v: string[]) => void;
  onOffers: (o: string[]) => void;
}) {
  /** Décocher la dernière case rendrait la vidéo invisible : on l'interdit. */
  const bascule = (liste: string[], valeur: string, apply: (l: string[]) => void) => {
    const next = liste.includes(valeur) ? liste.filter((x) => x !== valeur) : [...liste, valeur];
    if (next.length === 0) return;
    apply(next);
  };

  return (
    <div className="space-y-2 rounded-xl border border-(--color-border) bg-(--color-surface-soft) p-3">
      <div>
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-(--color-ink-muted)">
          Voie de concours
        </p>
        <div className="flex flex-wrap gap-3">
          {VOIES.map((v) => (
            <label key={v.value} className="flex items-center gap-1.5 text-sm text-(--color-ink)">
              <input
                type="checkbox"
                disabled={disabled}
                checked={voies.includes(v.value)}
                onChange={() => bascule(voies, v.value, onVoies)}
                className="h-4 w-4 accent-[#7C3AED]"
              />
              {v.label}
            </label>
          ))}
        </div>
        <p className="mt-1 text-[11px] text-(--color-ink-muted)">
          Les deux cochées = aucune restriction de voie.
        </p>
      </div>

      <div>
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-(--color-ink-muted)">
          Formules ayant accès
        </p>
        <div className="flex flex-wrap gap-3">
          {VIDEO_OFFERS.map((o) => (
            <label key={o.value} className="flex items-center gap-1.5 text-sm text-(--color-ink)">
              <input
                type="checkbox"
                disabled={disabled}
                checked={offers.includes(o.value)}
                onChange={() => bascule(offers, o.value, onOffers)}
                className="h-4 w-4 accent-[#7C3AED]"
              />
              {o.label}
            </label>
          ))}
        </div>
        <p className="mt-1 text-[11px] text-(--color-ink-muted)">
          Ce choix prime sur le droit global de la formule. Le support éventuel suit la même règle.
        </p>
      </div>
    </div>
  );
}

/** Un glisser-déposer ramasse volontiers autre chose : on ne garde que les PDF. */
function estPdf(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

/**
 * Zone de dépôt des supports de séance : on y glisse plusieurs PDF à la fois,
 * ou on passe par l'explorateur. Les fichiers écartés (non-PDF) sont nommés,
 * sans quoi un dépôt partiel passerait inaperçu.
 */
function SupportsDropzone({
  libelle,
  disabled,
  onFiles,
}: {
  libelle: string;
  disabled?: boolean;
  onFiles: (files: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [ignores, setIgnores] = useState<string[]>([]);

  function retenir(files: File[]) {
    if (files.length === 0) return;
    setIgnores(files.filter((f) => !estPdf(f)).map((f) => f.name));
    const pdfs = files.filter(estPdf);
    if (pdfs.length > 0) onFiles(pdfs);
  }

  return (
    <div>
      <div
        onDragEnter={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
        // `relatedTarget` est l'élément survolé APRÈS la sortie : sans ce test,
        // passer au-dessus du bouton intérieur éteindrait le surlignage.
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragging(false);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (disabled) return;
          retenir(Array.from(e.dataTransfer.files ?? []));
        }}
        className={`rounded-xl border-2 border-dashed px-3 py-4 text-center transition ${
          dragging
            ? 'border-[#7C3AED] bg-[#F3EAFF]'
            : 'border-(--color-border) bg-(--color-surface-soft)'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          multiple
          className="hidden"
          onChange={(e) => {
            retenir(Array.from(e.target.files ?? []));
            e.target.value = '';
          }}
        />
        <Paperclip className="mx-auto mb-1.5 h-5 w-5 text-(--color-ink-muted)" />
        <p className="text-[12.5px] font-medium text-(--color-ink)">
          Glissez ici un ou plusieurs PDF
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          <FileText />
          {libelle}
        </Button>
      </div>
      {ignores.length > 0 && (
        <p className="mt-1 text-[11px] font-medium text-amber-600">
          Ignoré{ignores.length > 1 ? 's' : ''} (pas un PDF) : {ignores.join(', ')}
        </p>
      )}
    </div>
  );
}

const COPY: Record<VideoType, { titre: string; unite: string; audience: string; exemple: string }> = {
  cours: {
    titre: 'Cours vidéo',
    unite: 'vidéo',
    audience: 'Visible par la Formule Intensive.',
    exemple: 'Cours vidéo 1 — Introduction',
  },
  seance_approfondie: {
    titre: 'Séances approfondies',
    unite: 'séance',
    audience: 'Visible par le Programme Approfondi.',
    exemple: 'Séance 1 — Cardiologie',
  },
};

/**
 * Gestion complète des vidéos d'un item : ajouter (lien Bunny.net collé),
 * réordonner, renommer, remplacer la vidéo, supprimer — et attacher un support
 * PDF facultatif qui devient un onglet chez l'élève.
 *
 * Le fichier de support part DIRECTEMENT du navigateur vers le bucket privé
 * `supports` (comme les fiches) : aucune limite de taille de requête serveur.
 * La ligne en base n'est mise à jour qu'ensuite, par une action serveur qui
 * revérifie les droits et le chemin.
 */
export function VideoManager({
  coursId,
  type,
  videos,
  onChanged,
  onAdd,
  notice,
}: {
  coursId: string;
  type: VideoType;
  videos: ManagedVideo[];
  /** Appelé après chaque modification. Fourni par la bibliothèque vidéo, qui
   *  charge sa liste côté client : un simple router.refresh() ne suffirait pas. */
  onChanged?: () => void;
  /** Ajout personnalisé — utilisé quand l'item n'existe pas encore (« Révisions
   *  - <Collège> ») : l'action crée l'item puis y place la vidéo. */
  onAdd?: (input: {
    type: VideoType; titre: string; lien: string; position: number | null;
    voies: string[]; offers: string[]; deniedUserIds: string[];
  }) => Promise<AddResult>;
  /** Message affiché au-dessus de la liste (contexte particulier). */
  notice?: string;
}) {
  const router = useRouter();
  const copy = COPY[type];
  const apresModification = onChanged ?? (() => router.refresh());
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);

  // Annuaire des élèves, chargé une seule fois puis partagé par les sélecteurs
  // d'exclusion (formulaire d'ajout + panneaux d'édition).
  const [students, setStudents] = useState<StudentLite[] | null>(null);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState<string | null>(null);
  const loadStudents = useCallback(() => {
    setStudentsLoading(true);
    setStudentsError(null);
    listStudentsAction()
      .then((res) => {
        if ('error' in res) { setStudentsError(res.error); return; }
        setStudents(res.students);
      })
      .catch(() => setStudentsError('Chargement des élèves impossible.'))
      .finally(() => setStudentsLoading(false));
  }, []);
  const studentPickerProps = {
    students, loading: studentsLoading, error: studentsError, onLoad: loadStudents,
  };

  // Formulaire d'ajout
  const [adding, setAdding] = useState(false);
  const [titre, setTitre] = useState('');
  const [lien, setLien] = useState('');
  const [position, setPosition] = useState('');
  const [withSupport, setWithSupport] = useState(false);
  const [supportFiles, setSupportFiles] = useState<File[]>([]);
  // Audience du nouvel ajout : les deux voies cochées par défaut.
  const [voies, setVoies] = useState<string[]>(['interne', 'externe']);
  const [offers, setOffers] = useState<string[]>(OFFRES_PAR_DEFAUT[type]);
  // Élèves exclus nominativement de la nouvelle séance.
  const [deniedUserIds, setDeniedUserIds] = useState<string[]>([]);

  /** Dépose un PDF dans le bucket privé et l'ajoute aux supports de la vidéo. */
  async function uploadSupport(videoId: string, file: File, coursIdCible?: string): Promise<string | null> {
    const supabase = createClient();
    const safe = file.name.replace(/[^\w.\-]+/g, '_').slice(-80);
    const path = `${coursIdCible || coursId}/${videoId}-${Date.now()}-${safe}`;
    const { error: upErr } = await supabase.storage.from('supports').upload(path, file, {
      upsert: false,
      contentType: file.type || 'application/pdf',
    });
    if (upErr) return upErr.message;
    const res = await addVideoSupportAction({ videoId, path, fileName: file.name });
    return 'error' in res ? res.error : null;
  }

  /** Dépose plusieurs PDF à la suite ; renvoie la première erreur rencontrée. */
  async function uploadSupports(videoId: string, files: File[], coursIdCible?: string): Promise<string | null> {
    for (const f of files) {
      const err = await uploadSupport(videoId, f, coursIdCible);
      if (err) return err;
    }
    return null;
  }

  function resetAdd() {
    setTitre('');
    setLien('');
    setPosition('');
    setWithSupport(false);
    setSupportFiles([]);
    setVoies(['interne', 'externe']);
    setOffers(OFFRES_PAR_DEFAUT[type]);
    setDeniedUserIds([]);
    setAdding(false);
  }

  function handleAdd() {
    setError(null);
    if (!titre.trim()) return setError('Donnez un titre.');
    if (!extractBunnyVideoId(lien)) {
      return setError('Lien Bunny.net non reconnu. Collez le lien de la vidéo depuis bunny.net.');
    }
    if (withSupport && supportFiles.length === 0) return setError('Choisissez au moins un PDF, ou décochez la case.');
    if (offers.length === 0) return setError('Cochez au moins une formule.');
    if (voies.length === 0) return setError('Cochez au moins une voie.');
    start(async () => {
      const rang = position.trim() ? Number(position) : null;
      const pos = rang && Number.isFinite(rang) ? rang : null;
      const res = onAdd
        ? await onAdd({ type, titre, lien, position: pos, voies, offers, deniedUserIds })
        : await addVideoAction({ coursId, type, titre, lien, position: pos, voies, offers, deniedUserIds });
      if ('error' in res) return setError(res.error);
      if (withSupport && supportFiles.length > 0) {
        const err = await uploadSupports(res.videoId, supportFiles, res.coursId);
        if (err) setError(`Vidéo ajoutée, mais un support a échoué : ${err}`);
      }
      resetAdd();
      apresModification();
    });
  }

  function run(fn: () => Promise<{ ok: true } | { error: string }>) {
    setError(null);
    start(async () => {
      const res = await fn();
      if ('error' in res) setError(res.error);
      else apresModification();
    });
  }

  return (
    <div className="space-y-4">
      <p className="text-[12.5px] text-(--color-ink-soft)">
        {copy.audience} L’ordre ci-dessous est celui que voient les élèves.
      </p>
      {notice && (
        <p className="rounded-xl border border-[#7C3AED]/30 bg-[#F3EAFF] px-3 py-2 text-[12.5px] text-[#5B21B6]">
          {notice}
        </p>
      )}

      {videos.length === 0 ? (
        <p className="rounded-xl border border-dashed border-(--color-border) bg-(--color-surface-soft) px-3 py-4 text-sm text-(--color-ink-muted)">
          Aucune {copy.unite} pour l’instant.
        </p>
      ) : (
        <ul className="space-y-2">
          {videos.map((v, i) => (
            <li key={v.id} className="rounded-xl border border-(--color-border) bg-(--color-surface)">
              <div className="flex items-center gap-2 px-3 py-2.5">
                <div className="flex flex-col">
                  <button
                    type="button"
                    aria-label="Monter"
                    disabled={pending || i === 0}
                    onClick={() => run(() => moveVideoAction({ videoId: v.id, direction: 'up' }))}
                    className="rounded p-0.5 text-(--color-ink-muted) hover:bg-(--color-sand-100) hover:text-(--color-ink) disabled:opacity-30"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Descendre"
                    disabled={pending || i === videos.length - 1}
                    onClick={() => run(() => moveVideoAction({ videoId: v.id, direction: 'down' }))}
                    className="rounded p-0.5 text-(--color-ink-muted) hover:bg-(--color-sand-100) hover:text-(--color-ink) disabled:opacity-30"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
                <span className="w-6 shrink-0 text-center text-xs font-bold tabular-nums text-(--color-ink-muted)">
                  {i + 1}
                </span>
                <Video className="h-4 w-4 shrink-0 text-[#7C3AED]" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-(--color-ink)">{v.titre}</p>
                  <p className="mt-0.5 flex items-center gap-2 text-[11px] text-(--color-ink-muted)">
                    <span className="font-mono">
                      {v.bunny_video_id ? `${v.bunny_video_id.slice(0, 8)}…` : 'aucune vidéo'}
                    </span>
                    {v.supports.length > 0 ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600">
                        <Paperclip className="h-3 w-3" />
                        {v.supports.length} support{v.supports.length > 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="text-(--color-ink-muted)">sans support</span>
                    )}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] font-medium text-(--color-primary-deep)">
                    {resumeAudience(v)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditing(editing === v.id ? null : v.id)}
                  className="rounded-lg p-1.5 text-(--color-ink-muted) hover:bg-(--color-sand-100) hover:text-(--color-ink)"
                  aria-label="Modifier"
                >
                  {editing === v.id ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    if (confirm(`Supprimer « ${v.titre} » ?${v.supports.length > 0 ? ' Ses supports seront également supprimés.' : ''}`)) {
                      run(() => deleteVideoAction({ videoId: v.id }));
                    }
                  }}
                  className="rounded-lg p-1.5 text-(--color-ink-muted) hover:bg-red-50 hover:text-red-600"
                  aria-label="Supprimer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {editing === v.id && (
                <VideoEditPanel
                  video={v}
                  pending={pending}
                  onRename={(t) => run(() => renameVideoAction({ videoId: v.id, titre: t }))}
                  onReplaceLink={(l) => run(() => replaceVideoLinkAction({ videoId: v.id, lien: l }))}
                  onAddSupports={(files) =>
                    run(async () => {
                      const err = await uploadSupports(v.id, files);
                      return err ? { error: err } : { ok: true };
                    })
                  }
                  onRenameSupport={(supportId, titre) =>
                    run(() => renameVideoSupportAction({ supportId, titre }))
                  }
                  onRemoveSupport={(supportId) => run(() => removeVideoSupportAction({ supportId }))}
                  onSupportAudience={(supportId, differentes, sVoies, sOffers) =>
                    run(() => updateVideoSupportAudienceAction({
                      supportId, differentes, voies: sVoies, offers: sOffers,
                    }))
                  }
                  onAudience={(nextVoies, nextOffers, nextDenied) =>
                    run(() => updateVideoAudienceAction({
                      videoId: v.id, voies: nextVoies, offers: nextOffers, deniedUserIds: nextDenied,
                    }))
                  }
                  studentPickerProps={studentPickerProps}
                />
              )}
            </li>
          ))}
        </ul>
      )}

      {adding ? (
        <div className="rounded-xl border border-dashed border-(--color-border) bg-(--color-surface) p-4">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-(--color-ink)">
            <Link2 className="h-4 w-4 text-[#7C3AED]" />
            Nouvelle {copy.unite}
          </p>
          <div className="space-y-2">
            <input
              type="text"
              placeholder={`Nom affiché aux élèves — ex. « ${copy.exemple} »`}
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm focus:border-[#7C3AED] focus:outline-none focus:ring-1 focus:ring-[#7C3AED]"
            />
            <input
              type="text"
              placeholder="Collez ici le lien Bunny.net Stream de la vidéo"
              value={lien}
              onChange={(e) => setLien(e.target.value)}
              className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 font-mono text-sm focus:border-[#7C3AED] focus:outline-none focus:ring-1 focus:ring-[#7C3AED]"
            />
            <label className="flex flex-wrap items-center gap-2 pt-1 text-sm text-(--color-ink)">
              Position dans la liste
              <input
                type="number"
                min={1}
                max={videos.length + 1}
                placeholder={`${videos.length + 1}`}
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-20 rounded-lg border border-(--color-border) bg-(--color-surface) px-2 py-1.5 text-sm"
              />
              <span className="text-xs text-(--color-ink-muted)">
                (vide = à la fin ; 1 = en tête)
              </span>
            </label>
            <AudiencePicker
              voies={voies}
              offers={offers}
              disabled={pending}
              onVoies={setVoies}
              onOffers={setOffers}
            />
            <StudentExclusionPicker
              {...studentPickerProps}
              selected={deniedUserIds}
              disabled={pending}
              onChange={setDeniedUserIds}
            />
            <label className="flex items-center gap-2 pt-1 text-sm text-(--color-ink)">
              <input
                type="checkbox"
                checked={withSupport}
                onChange={(e) => {
                  setWithSupport(e.target.checked);
                  if (!e.target.checked) setSupportFiles([]);
                }}
                className="h-4 w-4 accent-[#7C3AED]"
              />
              Ajouter des supports (PDF) — crée un onglet « Support de la séance » chez l’élève
            </label>
            {withSupport && (
              <div className="space-y-2 pl-6">
                <SupportsDropzone
                  libelle={supportFiles.length > 0 ? 'Ajouter d’autres PDF' : 'Choisir un ou plusieurs PDF'}
                  disabled={pending}
                  // On CUMULE : glisser un deuxième lot ne doit pas effacer le
                  // premier. Les doublons de nom sont écartés — glisser deux
                  // fois le même fichier créerait deux supports identiques.
                  onFiles={(files) =>
                    setSupportFiles((prev) => [
                      ...prev,
                      ...files.filter((f) => !prev.some((p) => p.name === f.name && p.size === f.size)),
                    ])
                  }
                />
                {supportFiles.length > 0 && (
                  <ul className="space-y-1">
                    {supportFiles.map((f, i) => (
                      <li
                        key={`${f.name}-${f.size}-${i}`}
                        className="flex items-center gap-2 rounded-lg border border-(--color-border) bg-(--color-surface) px-2 py-1"
                      >
                        <Paperclip className="h-3.5 w-3.5 shrink-0 text-(--color-ink-muted)" />
                        <span className="min-w-0 flex-1 truncate text-xs text-(--color-ink)">{f.name}</span>
                        <button
                          type="button"
                          disabled={pending}
                          aria-label={`Retirer ${f.name}`}
                          onClick={() => setSupportFiles((prev) => prev.filter((_, j) => j !== i))}
                          className="rounded-lg p-1 text-(--color-ink-muted) hover:bg-red-50 hover:text-red-600"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="text-[11px] text-(--color-ink-muted)">
                  Chaque support prend pour nom celui de son fichier, sans l’extension.
                  Renommez-les depuis le crayon une fois la vidéo créée.
                </p>
              </div>
            )}
            <div className="flex items-center gap-2 pt-1">
              <Button type="button" size="sm" onClick={handleAdd} disabled={pending}>
                {pending ? <Loader2 className="animate-spin" /> : <Plus />}
                Ajouter
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={resetAdd} disabled={pending}>
                Annuler
              </Button>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-(--color-ink-muted)">
            Déposez d’abord la vidéo sur bunny.net (Stream), puis collez son lien ici.
          </p>
        </div>
      ) : (
        <Button type="button" variant="outline" size="sm" onClick={() => { setAdding(true); setError(null); }}>
          <Plus />
          Ajouter une {copy.unite}
        </Button>
      )}

      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function VideoEditPanel({
  video,
  pending,
  onRename,
  onReplaceLink,
  onAddSupports,
  onRenameSupport,
  onRemoveSupport,
  onSupportAudience,
  onAudience,
  studentPickerProps,
}: {
  video: ManagedVideo;
  pending: boolean;
  onRename: (titre: string) => void;
  onReplaceLink: (lien: string) => void;
  onAddSupports: (files: File[]) => void;
  onRenameSupport: (supportId: string, titre: string) => void;
  onRemoveSupport: (supportId: string) => void;
  onSupportAudience: (supportId: string, differentes: boolean, voies: string[], offers: string[]) => void;
  onAudience: (voies: string[], offers: string[], deniedUserIds: string[]) => void;
  studentPickerProps: {
    students: StudentLite[] | null; loading: boolean; error: string | null; onLoad: () => void;
  };
}) {
  const [titre, setTitre] = useState(video.titre);
  const [lien, setLien] = useState('');
  const [voies, setVoies] = useState<string[]>(video.voies);
  const [offers, setOffers] = useState<string[]>(video.offers);
  const [denied, setDenied] = useState<string[]>(video.denied_user_ids);
  const memeListe = (a: string[], b: string[]) => a.slice().sort().join() === b.slice().sort().join();
  const audienceModifiee =
    !memeListe(voies, video.voies)
    || !memeListe(offers, video.offers)
    || !memeListe(denied, video.denied_user_ids);

  return (
    <div className="space-y-3 border-t border-(--color-border) bg-(--color-surface-soft) px-3 py-3">
      <div>
        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-(--color-ink-muted)">
          Nom
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            className="min-w-0 flex-1 rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-1.5 text-sm"
          />
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={pending || !titre.trim() || titre.trim() === video.titre}
            onClick={() => onRename(titre)}
          >
            Renommer
          </Button>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-(--color-ink-muted)">
          Remplacer la vidéo
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={lien}
            placeholder="Nouveau lien Bunny.net"
            onChange={(e) => setLien(e.target.value)}
            className="min-w-0 flex-1 rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-1.5 font-mono text-sm"
          />
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={pending || !lien.trim()}
            onClick={() => { onReplaceLink(lien); setLien(''); }}
          >
            Remplacer
          </Button>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-(--color-ink-muted)">
          Qui y a accès
        </label>
        <AudiencePicker
          voies={voies}
          offers={offers}
          disabled={pending}
          onVoies={setVoies}
          onOffers={setOffers}
        />
        <div className="mt-2">
          <StudentExclusionPicker
            {...studentPickerProps}
            selected={denied}
            disabled={pending}
            onChange={setDenied}
          />
        </div>
        {audienceModifiee && (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="mt-2"
            disabled={pending}
            onClick={() => onAudience(voies, offers, denied)}
          >
            Enregistrer l’accès
          </Button>
        )}
      </div>

      <div>
        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-(--color-ink-muted)">
          Supports de séance (PDF)
        </label>

        {video.supports.length > 0 && (
          <ul className="mb-2 space-y-1.5">
            {video.supports.map((doc) => (
              <SupportLigne
                key={doc.id}
                doc={doc}
                pending={pending}
                videoVoies={video.voies}
                videoOffers={video.offers}
                onRename={(t) => onRenameSupport(doc.id, t)}
                onRemove={() => onRemoveSupport(doc.id)}
                onAudience={(differentes, sVoies, sOffers) => onSupportAudience(doc.id, differentes, sVoies, sOffers)}
              />
            ))}
          </ul>
        )}

        <SupportsDropzone
          libelle={video.supports.length > 0 ? 'Ajouter d’autres PDF' : 'Ajouter un ou plusieurs PDF'}
          disabled={pending}
          onFiles={onAddSupports}
        />
        <p className="mt-1 text-[11px] text-(--color-ink-muted)">
          Chaque support prend pour nom celui de son fichier, sans l’extension ; il se renomme
          dans la liste ci-dessus. L’élève ouvre l’onglet « Support de la séance » et y retrouve
          tous les documents, filigranés à son nom et non téléchargeables.
        </p>
      </div>
    </div>
  );
}

/**
 * Une ligne de support : nom modifiable, suppression, et — repliée par défaut —
 * une case « Permissions différentes » qui donne au support ses PROPRES voies et
 * formules (sinon il hérite de celles de la vidéo).
 */
function SupportLigne({
  doc, pending, videoVoies, videoOffers, onRename, onRemove, onAudience,
}: {
  doc: VideoSupportDoc;
  pending: boolean;
  videoVoies: string[];
  videoOffers: string[];
  onRename: (titre: string) => void;
  onRemove: () => void;
  onAudience: (differentes: boolean, voies: string[], offers: string[]) => void;
}) {
  const [titre, setTitre] = useState(doc.titre);
  const aDesPermsPropres = (doc.voies?.length ?? 0) > 0 || (doc.offers?.length ?? 0) > 0;
  const [differentes, setDifferentes] = useState(aDesPermsPropres);
  // Point de départ des permissions propres : celles du support si elles
  // existent, sinon celles de la vidéo (base logique la plus proche).
  const [voies, setVoies] = useState<string[]>(doc.voies && doc.voies.length > 0 ? doc.voies : videoVoies);
  const [offers, setOffers] = useState<string[]>(doc.offers && doc.offers.length > 0 ? doc.offers : videoOffers);

  const memeListe = (a: string[], b: string[]) => a.slice().sort().join() === b.slice().sort().join();
  const modifie = differentes && (!aDesPermsPropres
    || !memeListe(voies, doc.voies ?? [])
    || !memeListe(offers, doc.offers ?? []));

  function basculeDifferentes(next: boolean) {
    setDifferentes(next);
    // Décocher revient immédiatement à l'héritage de la vidéo.
    if (!next && aDesPermsPropres) onAudience(false, [], []);
  }

  return (
    <li className="rounded-lg border border-(--color-border) bg-(--color-surface) px-2 py-1.5">
      <div className="flex items-center gap-2">
        <Paperclip className="h-3.5 w-3.5 shrink-0 text-(--color-ink-muted)" />
        <input
          type="text"
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          className="min-w-0 flex-1 bg-transparent text-sm text-(--color-ink) outline-none"
        />
        {titre.trim() !== doc.titre && titre.trim() !== '' && (
          <Button type="button" size="sm" variant="secondary" disabled={pending} onClick={() => onRename(titre)}>
            Renommer
          </Button>
        )}
        <button
          type="button"
          disabled={pending}
          onClick={() => { if (confirm(`Retirer le support « ${doc.titre} » ?`)) onRemove(); }}
          aria-label="Retirer ce support"
          className="rounded-lg p-1 text-(--color-ink-muted) hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <label className="mt-1.5 flex items-center gap-2 pl-5 text-[12.5px] text-(--color-ink)">
        <input
          type="checkbox"
          checked={differentes}
          disabled={pending}
          onChange={(e) => basculeDifferentes(e.target.checked)}
          className="h-3.5 w-3.5 accent-[#7C3AED]"
        />
        Permissions différentes
        {!differentes && (
          <span className="text-[11px] text-(--color-ink-muted)">(hérite de la vidéo)</span>
        )}
      </label>

      {differentes && (
        <div className="mt-2 pl-5">
          <AudiencePicker
            voies={voies}
            offers={offers}
            disabled={pending}
            onVoies={setVoies}
            onOffers={setOffers}
          />
          {modifie && (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="mt-2"
              disabled={pending}
              onClick={() => onAudience(true, voies, offers)}
            >
              Enregistrer les permissions du support
            </Button>
          )}
        </div>
      )}
    </li>
  );
}
