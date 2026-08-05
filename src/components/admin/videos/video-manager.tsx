'use client';

import { useCallback, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Check, ChevronDown, ChevronUp, FileText, Link2, Loader2, Paperclip, Pencil,
  Plus, Search, Trash2, UserMinus, UserPlus, Video, X,
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
  voies: string[];
  offers: string[];
  denied_user_ids: string[];
  allowed_user_ids: string[];
  supports: VideoSupportDoc[];
};

/* ------------------------------------------------------------------ */
/*  Batch types                                                        */
/* ------------------------------------------------------------------ */

type BatchSupport = {
  tempId: string;
  file: File;
  titre: string;
  differentes: boolean;
  voies: string[];
  offers: string[];
};

type BatchSeance = {
  tempId: string;
  titre: string;
  lien: string;
  voies: string[];
  offers: string[];
  deniedUserIds: string[];
  allowedUserIds: string[];
  supports: BatchSupport[];
};

/* ------------------------------------------------------------------ */
/*  StudentPicker                                                      */
/* ------------------------------------------------------------------ */

function StudentPicker({
  mode = 'deny',
  students,
  loading,
  error,
  onLoad,
  selected,
  disabled,
  onChange,
}: {
  mode?: 'deny' | 'allow';
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

  const isAllow = mode === 'allow';
  const Icon = isAllow ? UserPlus : UserMinus;
  const titre = isAllow
    ? 'Accorder l’accès à des élèves supplémentaires'
    : 'Retirer l’accès à certains élèves';
  const removeAria = (nom: string) =>
    isAllow ? `Retirer l’autorisation de ${nom}` : `Réautoriser ${nom}`;
  const helper = isAllow
    ? 'Les élèves cochés verront cette séance même s’ils n’ont normalement pas accès à l’item ou n’ont pas la formule requise.'
    : 'Les élèves cochés ne verront plus cette séance ni ses supports.';
  const c = isAllow
    ? {
        badge: 'bg-emerald-100 text-emerald-700',
        chip: 'bg-emerald-50 text-emerald-700',
        chipBtn: 'hover:bg-emerald-200',
        check: 'accent-emerald-600',
      }
    : {
        badge: 'bg-red-100 text-red-700',
        chip: 'bg-red-50 text-red-700',
        chipBtn: 'hover:bg-red-200',
        check: 'accent-red-600',
      };

  return (
    <div className="rounded-xl border border-(--color-border) bg-(--color-surface-soft) p-3">
      <button
        type="button"
        onClick={toggleOpen}
        className="flex w-full items-center justify-between gap-2 text-left"
      >
        <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-(--color-ink-muted)">
          <Icon className="h-3.5 w-3.5" />
          {titre}
          {selected.length > 0 && (
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${c.badge}`}>
              {selected.length}
            </span>
          )}
        </span>
        {open ? <ChevronUp className="h-4 w-4 text-(--color-ink-muted)" /> : <ChevronDown className="h-4 w-4 text-(--color-ink-muted)" />}
      </button>

      {selected.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {(students ? selNoms : selected.map((id) => ({ id, nom: 'Élève', email: null, promotion: null }))).map((s) => (
            <span key={s.id} className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${c.chip}`}>
              {s.nom}
              <button
                type="button"
                disabled={disabled}
                aria-label={removeAria(s.nom)}
                onClick={() => bascule(s.id)}
                className={`rounded-full ${c.chipBtn}`}
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
                        className={`h-4 w-4 ${c.check}`}
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
        {helper}
      </p>
    </div>
  );
}

const OFFRES_PAR_DEFAUT: Record<VideoType, string[]> = {
  cours: ['intensif'],
  seance_approfondie: ['approfondi'],
};

/* ------------------------------------------------------------------ */
/*  AudiencePicker                                                     */
/* ------------------------------------------------------------------ */

function AudiencePicker({
  voies, offers, disabled, onVoies, onOffers,
}: {
  voies: string[];
  offers: string[];
  disabled?: boolean;
  onVoies: (v: string[]) => void;
  onOffers: (o: string[]) => void;
}) {
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

/* ------------------------------------------------------------------ */
/*  SupportsDropzone                                                   */
/* ------------------------------------------------------------------ */

function estPdf(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

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

/* ------------------------------------------------------------------ */
/*  VideoManager — gestion complète des vidéos d'un item               */
/* ------------------------------------------------------------------ */

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
  onChanged?: () => void;
  onAdd?: (input: {
    type: VideoType; titre: string; lien: string; position: number | null;
    voies: string[]; offers: string[]; deniedUserIds: string[]; allowedUserIds: string[];
  }) => Promise<AddResult>;
  notice?: string;
}) {
  const router = useRouter();
  const copy = COPY[type];
  const apresModification = onChanged ?? (() => router.refresh());
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);

  // Annuaire des élèves (partagé par tous les sélecteurs)
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

  // === Batch add state ===
  const [adding, setAdding] = useState(false);
  const [seances, setSeances] = useState<BatchSeance[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState({ current: 0, total: 0, label: '' });

  function createEmptySeance(): BatchSeance {
    return {
      tempId: crypto.randomUUID(),
      titre: '',
      lien: '',
      voies: ['interne', 'externe'],
      offers: OFFRES_PAR_DEFAUT[type],
      deniedUserIds: [],
      allowedUserIds: [],
      supports: [],
    };
  }

  function startAdding() {
    setAdding(true);
    setSeances([createEmptySeance()]);
    setError(null);
  }

  function cancelAdding() {
    setAdding(false);
    setSeances([]);
    setError(null);
    setSaving(false);
    setSaveProgress({ current: 0, total: 0, label: '' });
  }

  function updateSeance(tempId: string, patch: Partial<BatchSeance>) {
    setSeances((prev) => prev.map((s) => (s.tempId === tempId ? { ...s, ...patch } : s)));
  }

  async function handleSaveAll() {
    for (let i = 0; i < seances.length; i++) {
      const s = seances[i];
      if (!s.titre.trim()) return setError(`Séance ${i + 1} : donnez un titre.`);
      if (!extractBunnyVideoId(s.lien)) return setError(`Séance ${i + 1} : lien Bunny.net non reconnu. Collez le lien de la vidéo depuis bunny.net.`);
      if (s.offers.length === 0) return setError(`Séance ${i + 1} : cochez au moins une formule.`);
      if (s.voies.length === 0) return setError(`Séance ${i + 1} : cochez au moins une voie.`);
    }

    setError(null);
    setSaving(true);
    const total = seances.reduce((acc, s) => acc + 1 + s.supports.length, 0);
    let current = 0;
    const supabase = createClient();

    for (let i = 0; i < seances.length; i++) {
      const s = seances[i];
      setSaveProgress({ current, total, label: `Création de « ${s.titre} »…` });

      const res = onAdd
        ? await onAdd({
            type, titre: s.titre, lien: s.lien, position: null,
            voies: s.voies, offers: s.offers,
            deniedUserIds: s.deniedUserIds, allowedUserIds: s.allowedUserIds,
          })
        : await addVideoAction({
            coursId, type, titre: s.titre, lien: s.lien, position: null,
            voies: s.voies, offers: s.offers,
            deniedUserIds: s.deniedUserIds, allowedUserIds: s.allowedUserIds,
          });

      if ('error' in res) {
        setError(`Séance ${i + 1} « ${s.titre} » : ${res.error}`);
        setSaving(false);
        apresModification();
        return;
      }

      current++;

      for (const sup of s.supports) {
        setSaveProgress({ current, total, label: `Support « ${sup.titre} » → « ${s.titre} »…` });
        const safe = sup.file.name.replace(/[^\w.\-]+/g, '_').slice(-80);
        const path = `${res.coursId}/${res.videoId}-${Date.now()}-${safe}`;
        const { error: upErr } = await supabase.storage.from('supports').upload(path, sup.file, {
          upsert: false,
          contentType: sup.file.type || 'application/pdf',
        });
        if (upErr) {
          setError(`Support « ${sup.titre} » : ${upErr.message}`);
          setSaving(false);
          apresModification();
          return;
        }
        const supRes = await addVideoSupportAction({ videoId: res.videoId, path, fileName: sup.file.name });
        if ('error' in supRes) {
          setError(`Support « ${sup.titre} » : ${supRes.error}`);
          setSaving(false);
          apresModification();
          return;
        }
        if (sup.differentes) {
          await updateVideoSupportAudienceAction({
            supportId: supRes.supportId,
            differentes: true,
            voies: sup.voies,
            offers: sup.offers,
          });
        }
        current++;
      }
    }

    setSaving(false);
    cancelAdding();
    apresModification();
  }

  // Upload helpers pour le panneau d'édition des vidéos existantes
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

  async function uploadSupports(videoId: string, files: File[], coursIdCible?: string): Promise<string | null> {
    for (const f of files) {
      const err = await uploadSupport(videoId, f, coursIdCible);
      if (err) return err;
    }
    return null;
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
        {copy.audience} L'ordre ci-dessous est celui que voient les élèves.
      </p>
      {notice && (
        <p className="rounded-xl border border-[#7C3AED]/30 bg-[#F3EAFF] px-3 py-2 text-[12.5px] text-[#5B21B6]">
          {notice}
        </p>
      )}

      {/* ── Liste des vidéos existantes ── */}
      {videos.length === 0 ? (
        <p className="rounded-xl border border-dashed border-(--color-border) bg-(--color-surface-soft) px-3 py-4 text-sm text-(--color-ink-muted)">
          Aucune {copy.unite} pour l'instant.
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
                  onAudience={(nextVoies, nextOffers, nextDenied, nextAllowed) =>
                    run(() => updateVideoAudienceAction({
                      videoId: v.id, voies: nextVoies, offers: nextOffers,
                      deniedUserIds: nextDenied, allowedUserIds: nextAllowed,
                    }))
                  }
                  studentPickerProps={studentPickerProps}
                />
              )}
            </li>
          ))}
        </ul>
      )}

      {/* ── Ajout par lot ── */}
      {adding ? (
        <div className="space-y-4 rounded-2xl border-2 border-dashed border-[#7C3AED]/40 bg-[#FDFAFF] p-5">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 text-sm font-bold text-[#5B21B6]">
              <Plus className="h-4 w-4" />
              {seances.length > 1
                ? `Ajouter ${seances.length} ${copy.unite}s`
                : `Nouvelle ${copy.unite}`}
            </p>
            <Button type="button" variant="ghost" size="sm" onClick={cancelAdding} disabled={saving}>
              <X className="h-4 w-4" /> Fermer
            </Button>
          </div>

          <p className="text-[12.5px] text-(--color-ink-soft)">
            Remplissez les informations de chaque {copy.unite} et leurs supports, puis cliquez sur « Enregistrer tout » en bas de page.
            Les permissions de chaque support se règlent ici directement.
          </p>

          {seances.map((s, i) => (
            <BatchSeanceCard
              key={s.tempId}
              index={i}
              seance={s}
              type={type}
              copy={copy}
              canRemove={seances.length > 1}
              disabled={saving}
              onUpdate={(patch) => updateSeance(s.tempId, patch)}
              onRemove={() => setSeances((prev) => prev.filter((x) => x.tempId !== s.tempId))}
              studentPickerProps={studentPickerProps}
            />
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setSeances((prev) => [...prev, createEmptySeance()])}
            disabled={saving}
          >
            <Plus className="h-4 w-4" />
            Ajouter une autre {copy.unite}
          </Button>

          {saving && (
            <div className="rounded-xl border border-[#7C3AED]/20 bg-white p-3">
              <div className="mb-2 h-2 overflow-hidden rounded-full bg-[#F3EAFF]">
                <div
                  className="h-full rounded-full bg-[#7C3AED] transition-all duration-300"
                  style={{ width: `${saveProgress.total > 0 ? (saveProgress.current / saveProgress.total) * 100 : 0}%` }}
                />
              </div>
              <p className="flex items-center gap-2 text-xs text-[#5B21B6]">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                {saveProgress.label}
              </p>
            </div>
          )}

          <div className="flex items-center gap-3 border-t border-[#7C3AED]/20 pt-4">
            <Button type="button" onClick={handleSaveAll} disabled={saving || seances.length === 0}>
              {saving ? <Loader2 className="animate-spin" /> : <Check />}
              Enregistrer tout
              <span className="ml-1 rounded-full bg-white/80 px-1.5 py-0.5 text-[10px] font-bold tabular-nums">
                {seances.length} {copy.unite}{seances.length > 1 ? 's' : ''}
                {seances.reduce((a, s) => a + s.supports.length, 0) > 0 &&
                  ` · ${seances.reduce((a, s) => a + s.supports.length, 0)} support${seances.reduce((a, s) => a + s.supports.length, 0) > 1 ? 's' : ''}`}
              </span>
            </Button>
            <Button type="button" variant="ghost" onClick={cancelAdding} disabled={saving}>
              Annuler
            </Button>
          </div>
        </div>
      ) : (
        <Button type="button" variant="outline" size="sm" onClick={startAdding}>
          <Plus />
          Ajouter {videos.length > 0 ? 'des' : 'une'} {copy.unite}{videos.length > 0 ? 's' : ''}
        </Button>
      )}

      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  BatchSeanceCard — une séance dans le formulaire d'ajout par lot     */
/* ------------------------------------------------------------------ */

function BatchSeanceCard({
  index,
  seance,
  type,
  copy,
  canRemove,
  disabled,
  onUpdate,
  onRemove,
  studentPickerProps,
}: {
  index: number;
  seance: BatchSeance;
  type: VideoType;
  copy: { unite: string; exemple: string };
  canRemove: boolean;
  disabled: boolean;
  onUpdate: (patch: Partial<BatchSeance>) => void;
  onRemove: () => void;
  studentPickerProps: {
    students: StudentLite[] | null; loading: boolean; error: string | null; onLoad: () => void;
  };
}) {
  const [collapsed, setCollapsed] = useState(false);

  function addSupportFiles(files: File[]) {
    const existing = seance.supports;
    const news: BatchSupport[] = files
      .filter((f) => !existing.some((s) => s.file.name === f.name && s.file.size === f.size))
      .map((f) => ({
        tempId: crypto.randomUUID(),
        file: f,
        titre: f.name.replace(/\.pdf$/i, '').trim() || 'Support',
        differentes: false,
        voies: seance.voies,
        offers: seance.offers,
      }));
    onUpdate({ supports: [...existing, ...news] });
  }

  function updateSupport(tempId: string, patch: Partial<BatchSupport>) {
    onUpdate({
      supports: seance.supports.map((s) => (s.tempId === tempId ? { ...s, ...patch } : s)),
    });
  }

  function removeSupport(tempId: string) {
    onUpdate({ supports: seance.supports.filter((s) => s.tempId !== tempId) });
  }

  return (
    <div className="rounded-xl border border-(--color-border) bg-(--color-surface) shadow-sm">
      {/* En-tête */}
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#7C3AED] text-xs font-bold text-white">
          {index + 1}
        </span>
        <p className="min-w-0 flex-1 truncate text-sm font-bold text-(--color-ink)">
          {seance.titre.trim() || `${copy.unite.charAt(0).toUpperCase() + copy.unite.slice(1)} ${index + 1}`}
        </p>
        {seance.supports.length > 0 && (
          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600">
            <Paperclip className="h-3 w-3" />
            {seance.supports.length}
          </span>
        )}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg p-1 text-(--color-ink-muted) hover:bg-(--color-sand-100)"
          aria-label={collapsed ? 'Déplier' : 'Replier'}
        >
          {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </button>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            className="rounded-lg p-1 text-(--color-ink-muted) hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
            aria-label="Retirer cette séance"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {!collapsed && (
        <div className="space-y-3 border-t border-(--color-border) px-4 py-4">
          {/* Titre + lien Bunny */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-(--color-ink-muted)">
                Nom affiché aux élèves
              </label>
              <input
                type="text"
                placeholder={`ex. « ${copy.exemple} »`}
                value={seance.titre}
                disabled={disabled}
                onChange={(e) => onUpdate({ titre: e.target.value })}
                className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm focus:border-[#7C3AED] focus:outline-none focus:ring-1 focus:ring-[#7C3AED]"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-(--color-ink-muted)">
                Lien Bunny.net Stream
              </label>
              <input
                type="text"
                placeholder="Collez le lien de la vidéo"
                value={seance.lien}
                disabled={disabled}
                onChange={(e) => onUpdate({ lien: e.target.value })}
                className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 font-mono text-sm focus:border-[#7C3AED] focus:outline-none focus:ring-1 focus:ring-[#7C3AED]"
              />
            </div>
          </div>

          {/* Audience */}
          <AudiencePicker
            voies={seance.voies}
            offers={seance.offers}
            disabled={disabled}
            onVoies={(v) => onUpdate({ voies: v })}
            onOffers={(o) => onUpdate({ offers: o })}
          />

          {/* Élèves */}
          <StudentPicker
            mode="deny"
            {...studentPickerProps}
            selected={seance.deniedUserIds}
            disabled={disabled}
            onChange={(ids) => onUpdate({ deniedUserIds: ids })}
          />
          <StudentPicker
            mode="allow"
            {...studentPickerProps}
            selected={seance.allowedUserIds}
            disabled={disabled}
            onChange={(ids) => onUpdate({ allowedUserIds: ids })}
          />

          {/* Supports PDF */}
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-(--color-ink-muted)">
              Supports PDF de la {copy.unite}
            </p>

            {seance.supports.length > 0 && (
              <ul className="mb-3 space-y-2">
                {seance.supports.map((sup) => (
                  <li
                    key={sup.tempId}
                    className="rounded-lg border border-(--color-border) bg-(--color-surface-soft) p-2"
                  >
                    <div className="flex items-center gap-2">
                      <Paperclip className="h-3.5 w-3.5 shrink-0 text-(--color-ink-muted)" />
                      <input
                        type="text"
                        value={sup.titre}
                        disabled={disabled}
                        onChange={(e) => updateSupport(sup.tempId, { titre: e.target.value })}
                        className="min-w-0 flex-1 bg-transparent text-sm text-(--color-ink) outline-none"
                      />
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => removeSupport(sup.tempId)}
                        aria-label={`Retirer ${sup.titre}`}
                        className="rounded-lg p-1 text-(--color-ink-muted) hover:bg-red-50 hover:text-red-600"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <label className="mt-1.5 flex items-center gap-2 pl-5 text-[12.5px] text-(--color-ink)">
                      <input
                        type="checkbox"
                        checked={sup.differentes}
                        disabled={disabled}
                        onChange={(e) => updateSupport(sup.tempId, { differentes: e.target.checked })}
                        className="h-3.5 w-3.5 accent-[#7C3AED]"
                      />
                      Permissions différentes
                      {!sup.differentes && (
                        <span className="text-[11px] text-(--color-ink-muted)">(hérite de la {copy.unite})</span>
                      )}
                    </label>
                    {sup.differentes && (
                      <div className="mt-2 pl-5">
                        <AudiencePicker
                          voies={sup.voies}
                          offers={sup.offers}
                          disabled={disabled}
                          onVoies={(v) => updateSupport(sup.tempId, { voies: v })}
                          onOffers={(o) => updateSupport(sup.tempId, { offers: o })}
                        />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}

            <SupportsDropzone
              libelle={seance.supports.length > 0 ? 'Ajouter d’autres PDF' : 'Choisir un ou plusieurs PDF'}
              disabled={disabled}
              onFiles={addSupportFiles}
            />
            <p className="mt-1 text-[11px] text-(--color-ink-muted)">
              Chaque support prend pour nom celui de son fichier. Renommez-le ci-dessus si besoin.
              L'élève retrouve les documents dans l'onglet « Support de la séance ».
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  VideoEditPanel — édition d'une vidéo existante                     */
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
  onAudience: (voies: string[], offers: string[], deniedUserIds: string[], allowedUserIds: string[]) => void;
  studentPickerProps: {
    students: StudentLite[] | null; loading: boolean; error: string | null; onLoad: () => void;
  };
}) {
  const [titre, setTitre] = useState(video.titre);
  const [lien, setLien] = useState('');
  const [voies, setVoies] = useState<string[]>(video.voies);
  const [offers, setOffers] = useState<string[]>(video.offers);
  const [denied, setDenied] = useState<string[]>(video.denied_user_ids);
  const [allowed, setAllowed] = useState<string[]>(video.allowed_user_ids);
  const memeListe = (a: string[], b: string[]) => a.slice().sort().join() === b.slice().sort().join();
  const audienceModifiee =
    !memeListe(voies, video.voies)
    || !memeListe(offers, video.offers)
    || !memeListe(denied, video.denied_user_ids)
    || !memeListe(allowed, video.allowed_user_ids);

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
        <div className="mt-2 space-y-2">
          <StudentPicker
            mode="deny"
            {...studentPickerProps}
            selected={denied}
            disabled={pending}
            onChange={setDenied}
          />
          <StudentPicker
            mode="allow"
            {...studentPickerProps}
            selected={allowed}
            disabled={pending}
            onChange={setAllowed}
          />
        </div>
        {audienceModifiee && (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="mt-2"
            disabled={pending}
            onClick={() => onAudience(voies, offers, denied, allowed)}
          >
            Enregistrer l'accès
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
          Chaque support prend pour nom celui de son fichier, sans l'extension ; il se renomme
          dans la liste ci-dessus. L'élève ouvre l'onglet « Support de la séance » et y retrouve
          tous les documents, filigranés à son nom et non téléchargeables.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SupportLigne — un support existant, avec permissions inline        */
/* ------------------------------------------------------------------ */

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
  const [voies, setVoies] = useState<string[]>(doc.voies && doc.voies.length > 0 ? doc.voies : videoVoies);
  const [offers, setOffers] = useState<string[]>(doc.offers && doc.offers.length > 0 ? doc.offers : videoOffers);

  const memeListe = (a: string[], b: string[]) => a.slice().sort().join() === b.slice().sort().join();
  const modifie = differentes && (!aDesPermsPropres
    || !memeListe(voies, doc.voies ?? [])
    || !memeListe(offers, doc.offers ?? []));

  function basculeDifferentes(next: boolean) {
    setDifferentes(next);
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
