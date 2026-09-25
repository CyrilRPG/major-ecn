'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  CalendarClock, Check, ChevronDown, ChevronUp, FileText, GripVertical, Loader2, Paperclip, Pencil,
  Plus, Search, Trash2, UserMinus, UserPlus, Video, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { extractBunnyVideoId } from '@/lib/bunny-link';
import { BunnyApercu } from './bunny-apercu';
import {
  addVideoAction, addVideoSupportAction, deleteVideoAction, deleteVideosAction, listStudentsAction,
  moveVideoSupportAction, publishVideoAction, removeVideoSupportAction, renameVideoAction, reorderVideosAction, unpublishVideoAction,
  renameVideoSupportAction, replaceVideoLinkAction, updateVideoAudienceAction,
  updateVideoLiveAtAction, updateVideoRubriqueAction, updateVideoSupportAudienceAction,
  type AddResult, type StudentLite, type VideoSupportDoc, type VideoType,
} from '@/app/admin/videos/actions';
import { resumeAudience, VIDEO_OFFERS, VOIES } from '@/lib/videos/audience';
import { rubriqueParDefaut } from '@/lib/videos/rubriques';
import { formaterDateSeance } from '@/lib/videos/a-venir';
import { decalagePendantGlisser, deplacerElement, indiceDeDepot } from '@/lib/videos/ordre';

/** Glisser-déposer en cours dans la liste (coordonnées de la page, en px). */
type Glisser = {
  id: string;
  de: number;
  vers: number;
  dy: number;
  /** Faux tant que le pointeur n'a pas bougé de quelques pixels (simple clic). */
  actif: boolean;
  pointerId: number;
  departY: number;
  tops: number[];
  hauteurs: number[];
  milieux: number[];
  ecart: number;
  ulTop: number;
};

/** Droits fins du cahier des charges (§5) de la personne connectée. */
export type DroitsVideo = { creer: boolean; modifier: boolean; publier: boolean; supprimer: boolean };
export const TOUS_DROITS: DroitsVideo = { creer: true, modifier: true, publier: true, supprimer: true };

export type ManagedVideo = {
  id: string;
  titre: string;
  bunny_video_id: string | null;
  /** Séance à venir : pas encore de vidéo, seulement des dossiers à préparer. */
  a_venir?: boolean;
  /** Date de la séance en direct (facultative). */
  live_at?: string | null;
  order_index: number;
  /** « À valider » tant qu'une personne habilitée n'a pas publié. */
  status?: 'publie' | 'a_valider';
  publish_at?: string | null;
  /** Rubrique affichée à l'élève (null = libellé par défaut du type). */
  rubrique: string | null;
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
  /** Séance à venir : créée sans lien Bunny, la vidéo s'ajoute après la séance. */
  aVenir: boolean;
  /** Date de la séance en direct, au format `datetime-local` (heure locale). */
  liveAt: string;
  lien: string;
  /** Saisie libre ; vide ⇒ libellé par défaut du type. */
  rubrique: string;
  voies: string[];
  offers: string[];
  deniedUserIds: string[];
  allowedUserIds: string[];
  supports: BatchSupport[];
};

/* ------------------------------------------------------------------ */
/*  BatchChanges — modifications groupées d'une vidéo existante        */
/* ------------------------------------------------------------------ */

type BatchChanges = {
  rename?: string;
  replaceLink?: string;
  /** Date de la séance en direct (ISO) ; `null` ⇒ retirée ; absent ⇒ inchangée. */
  liveAt?: string | null;
  /** `null` ⇒ retour au libellé par défaut ; absent ⇒ inchangée. */
  rubrique?: string | null;
  audience?: { voies: string[]; offers: string[]; deniedUserIds: string[]; allowedUserIds: string[] };
  supportRenames?: { supportId: string; titre: string }[];
  supportAudiences?: { supportId: string; differentes: boolean; voies: string[]; offers: string[] }[];
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

/** ISO → valeur d'un champ `datetime-local`, dans l'heure locale du navigateur. */
function versSaisieLocale(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** Valeur d'un champ `datetime-local` (heure locale) → ISO ; vide ou invalide ⇒ null. */
function depuisSaisieLocale(valeur: string): string | null {
  if (!valeur.trim()) return null;
  const d = new Date(valeur);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/** Champ « Date de la séance en direct » (facultatif). */
function DateSeanceField({
  value,
  disabled,
  onChange,
  compact = false,
}: {
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  compact?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-(--color-ink-muted)">
        Date de la séance en direct (facultatif)
      </label>
      <input
        type="datetime-local"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 text-sm focus:border-[#7C3AED] focus:outline-none focus:ring-1 focus:ring-[#7C3AED] sm:w-auto ${compact ? 'py-1.5' : 'py-2'}`}
      />
      <p className="mt-1 text-[11px] text-(--color-ink-muted)">
        Affichée aux élèves : « Séance en direct à venir — le … ». Sans effet sur la publication.
      </p>
    </div>
  );
}

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
  droits = TOUS_DROITS,
}: {
  coursId: string;
  type: VideoType;
  videos: ManagedVideo[];
  onChanged?: () => void;
  onAdd?: (input: {
    type: VideoType; titre: string; lien: string; aVenir: boolean; liveAt: string | null;
    position: number | null; rubrique: string | null;
    voies: string[]; offers: string[]; deniedUserIds: string[]; allowedUserIds: string[];
  }) => Promise<AddResult>;
  notice?: string;
  /** Droits de la personne : sans « publier », ses dépôts restent « À valider » ; sans « supprimer », pas de corbeille. */
  droits?: DroitsVideo;
}) {
  const router = useRouter();
  const copy = COPY[type];
  const apresModification = onChanged ?? (() => router.refresh());
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  // Horloge figée au premier rendu (badge « Programmée le … »).
  const [maintenant] = useState(() => Date.now());
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

  function createEmptySeance(aVenir = false): BatchSeance {
    return {
      tempId: crypto.randomUUID(),
      titre: '',
      aVenir,
      liveAt: '',
      lien: '',
      rubrique: '',
      voies: ['interne', 'externe'],
      offers: OFFRES_PAR_DEFAUT[type],
      deniedUserIds: [],
      allowedUserIds: [],
      supports: [],
    };
  }

  function startAdding(aVenir = false) {
    setAdding(true);
    setSeances([createEmptySeance(aVenir)]);
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
      // Séance à venir : pas de lien exigé (la vidéo viendra après la séance) ;
      // un lien saisi quand même est validé comme d'habitude.
      if (s.aVenir ? !!s.lien.trim() && !extractBunnyVideoId(s.lien) : !extractBunnyVideoId(s.lien)) {
        return setError(`Séance ${i + 1} : lien Bunny.net non reconnu. Collez le lien de la vidéo depuis bunny.net.`);
      }
      if (s.aVenir && s.liveAt.trim() && !depuisSaisieLocale(s.liveAt)) return setError(`Séance ${i + 1} : date de la séance invalide.`);
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

      const rubrique = s.rubrique.trim() || null;
      // La date est convertie ICI, dans l'heure locale de la personne qui la
      // saisit : le serveur ne connaît pas son fuseau.
      const aVenir = s.aVenir && !s.lien.trim();
      const liveAt = s.aVenir ? depuisSaisieLocale(s.liveAt) : null;
      const res = onAdd
        ? await onAdd({
            type, titre: s.titre, lien: s.lien, aVenir, liveAt, position: null, rubrique,
            voies: s.voies, offers: s.offers,
            deniedUserIds: s.deniedUserIds, allowedUserIds: s.allowedUserIds,
          })
        : await addVideoAction({
            coursId, type, titre: s.titre, lien: s.lien, aVenir, liveAt, position: null, rubrique,
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

  /* ── Suppressions sans rechargement ────────────────────────────────
     Les éléments supprimés sont MASQUÉS tout de suite (mise à jour
     optimiste), puis l'action serveur part. En cas d'échec, on les
     démasque : ils réapparaissent à leur place, avec le motif. Rien ne
     démonte la liste : formulaire « Nouvelle vidéo » ouvert, saisies non
     enregistrées et défilement sont conservés. */
  const [videosMasquees, setVideosMasquees] = useState<ReadonlySet<string>>(() => new Set());
  const [supportsMasques, setSupportsMasques] = useState<ReadonlySet<string>>(() => new Set());
  const [selection, setSelection] = useState<ReadonlySet<string>>(() => new Set());
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);
  const [alerteListe, setAlerteListe] = useState<string | null>(null);

  const avec = (s: ReadonlySet<string>, ids: string[]) => new Set([...s, ...ids]);
  const sans = (s: ReadonlySet<string>, ids: string[]) => { const n = new Set(s); ids.forEach((id) => n.delete(id)); return n; };

  /* Ordre optimiste (glisser-déposer, flèches) : valable tant que la liste
     reçue du serveur est celle sur laquelle il a été calculé ; le
     rechargement qui suit l'enregistrement le remplace naturellement. */
  const [ordreLocal, setOrdreLocal] = useState<{ source: ManagedVideo[]; ids: string[] } | null>(null);
  const ordreActif = ordreLocal && ordreLocal.source === videos ? ordreLocal.ids : null;

  const affichees = useMemo(() => {
    const liste = videos
      .filter((v) => !videosMasquees.has(v.id))
      .map((v) => (v.supports.some((s) => supportsMasques.has(s.id))
        ? { ...v, supports: v.supports.filter((s) => !supportsMasques.has(s.id)) }
        : v));
    if (!ordreActif) return liste;
    const rang = new Map(ordreActif.map((id, i) => [id, i]));
    return liste
      .map((v, i) => ({ v, i }))
      .sort((x, y) => ((rang.get(x.v.id) ?? Infinity) - (rang.get(y.v.id) ?? Infinity)) || (x.i - y.i))
      .map((r) => r.v);
  }, [videos, videosMasquees, supportsMasques, ordreActif]);
  const selectionnees = affichees.filter((v) => selection.has(v.id));
  const toutSelectionne = affichees.length > 0 && selectionnees.length === affichees.length;

  /* ── Réordonnancement : glisser-déposer (souris, tactile) + clavier ──
     Mise à jour optimiste, puis UNE action serveur avec l'ordre complet.
     Les envois sont mis en file (plusieurs déplacements rapides partent dans
     l'ordre) ; la liste n'est rechargée qu'une fois la file vide. En cas
     d'échec : ordre du serveur rétabli + message. */
  const [annonce, setAnnonce] = useState('');
  const [glisse, setGlisse] = useState<Glisser | null>(null);
  const glisseRef = useRef<Glisser | null>(null);
  const fileOrdre = useRef<Promise<unknown>>(Promise.resolve());
  const enAttente = useRef(0);
  const carteRefs = useRef(new Map<string, HTMLLIElement>());
  const poigneeRefs = useRef(new Map<string, HTMLButtonElement>());
  const listeRef = useRef<HTMLUListElement>(null);
  const focusApres = useRef<string | null>(null);
  const peutOrdonner = droits.modifier && !!coursId && !suppressionEnCours;
  const aideOrdreId = useId();

  useEffect(() => {
    // Après un déplacement au clavier, la poignée garde le focus (le nœud a bougé).
    const id = focusApres.current;
    if (!id) return;
    focusApres.current = null;
    poigneeRefs.current.get(id)?.focus();
  });

  function appliquerOrdre(de: number, vers: number, focus = false) {
    if (!peutOrdonner || de === vers || vers < 0 || vers >= affichees.length) return;
    const idsAvant = affichees.map((v) => v.id);
    const ids = deplacerElement(idsAvant, de, vers);
    const titre = affichees[de].titre;
    setOrdreLocal({ source: videos, ids });
    setAlerteListe(null);
    setAnnonce(`« ${titre} » déplacée en position ${vers + 1} sur ${ids.length}.`);
    if (focus) focusApres.current = idsAvant[de];

    enAttente.current++;
    const envoi = fileOrdre.current.then(() => reorderVideosAction({ coursId, type, orderedIds: ids, deplaceeId: idsAvant[de] }));
    fileOrdre.current = envoi.catch(() => undefined);
    envoi
      .then((res) => {
        enAttente.current--;
        if ('error' in res) {
          setOrdreLocal(null);
          setAnnonce(`Ordre non enregistré : ${res.error}`);
          resynchroniser(`Ordre non enregistré — l’ordre précédent est rétabli. ${res.error}`);
          return;
        }
        if (enAttente.current === 0) apresModification();
      })
      .catch(() => {
        enAttente.current--;
        setOrdreLocal(null);
        resynchroniser('L’ordre n’a pas pu être enregistré (connexion ?). La liste a été actualisée : vérifiez-la.');
      });
  }

  function debutGlisser(e: React.PointerEvent<HTMLButtonElement>, index: number) {
    if (!peutOrdonner || (e.pointerType === 'mouse' && e.button !== 0)) return;
    const ul = listeRef.current;
    if (!ul) return;
    const rects = affichees.map((v) => carteRefs.current.get(v.id)?.getBoundingClientRect() ?? null);
    if (rects.some((r) => !r)) return;
    const sy = window.scrollY;
    const tops = rects.map((r) => r!.top + sy);
    const hauteurs = rects.map((r) => r!.height);
    const ecart = tops.length > 1 ? Math.max(0, tops[1] - (tops[0] + hauteurs[0])) : 8;
    e.preventDefault();
    // Focus sur la poignée : Échap annule le glisser en cours.
    e.currentTarget.focus({ preventScroll: true });
    e.currentTarget.setPointerCapture(e.pointerId);
    const g: Glisser = {
      id: affichees[index].id, de: index, vers: index, dy: 0, actif: false,
      pointerId: e.pointerId, departY: e.clientY + sy,
      tops, hauteurs, ecart, milieux: tops.map((t, i) => t + hauteurs[i] / 2),
      ulTop: ul.getBoundingClientRect().top + sy,
    };
    glisseRef.current = g;
  }

  function pendantGlisser(e: React.PointerEvent<HTMLButtonElement>) {
    const g = glisseRef.current;
    if (!g || e.pointerId !== g.pointerId) return;
    // Défilement automatique près des bords (longues listes, tactile).
    if (e.clientY < 70) window.scrollBy(0, -14);
    else if (e.clientY > window.innerHeight - 70) window.scrollBy(0, 14);
    const dy = e.clientY + window.scrollY - g.departY;
    if (!g.actif && Math.abs(dy) < 4) return;
    const vers = indiceDeDepot(g.milieux, g.de, g.milieux[g.de] + dy);
    const suivant = { ...g, dy, vers, actif: true };
    glisseRef.current = suivant;
    setGlisse(suivant);
  }

  function finGlisser(e: React.PointerEvent<HTMLButtonElement>, annuler = false) {
    const g = glisseRef.current;
    if (!g || e.pointerId !== g.pointerId) return;
    glisseRef.current = null;
    setGlisse(null);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    if (!annuler && g.actif && g.vers !== g.de) appliquerOrdre(g.de, g.vers);
  }

  function clavierPoignee(e: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    if (e.key === 'Escape' && glisseRef.current) {
      glisseRef.current = null;
      setGlisse(null);
      setAnnonce('Déplacement annulé.');
      return;
    }
    const vers = e.key === 'ArrowUp' ? index - 1
      : e.key === 'ArrowDown' ? index + 1
        : e.key === 'Home' ? 0
          : e.key === 'End' ? affichees.length - 1
            : null;
    if (vers === null) return;
    e.preventDefault();
    appliquerOrdre(index, vers, true);
  }

  /** Style d'une carte pendant un glisser (carte soulevée, voisines décalées). */
  function styleCarte(i: number): React.CSSProperties | undefined {
    if (!glisse?.actif) return undefined;
    if (i === glisse.de) return { transform: `translateY(${glisse.dy}px)`, zIndex: 20, position: 'relative' };
    const d = decalagePendantGlisser(i, glisse.de, glisse.vers, glisse.hauteurs[glisse.de] + glisse.ecart);
    return { transform: `translateY(${d}px)`, transition: 'transform 160ms ease' };
  }

  /** Emplacement de dépôt (pointillés violets) à la place que prendra la carte. */
  const emplacement = glisse?.actif
    ? {
        top: (glisse.vers > glisse.de
          ? glisse.tops[glisse.vers] + glisse.hauteurs[glisse.vers] - glisse.hauteurs[glisse.de]
          : glisse.tops[glisse.vers]) - glisse.ulTop,
        height: glisse.hauteurs[glisse.de],
      }
    : null;

  /** Resynchronise la liste sur le serveur quand l'issue d'une suppression est incertaine. */
  const resynchroniser = (message: string) => {
    setAlerteListe(message);
    apresModification();
  };

  function retirerSupport(supportId: string) {
    setAlerteListe(null);
    setSupportsMasques((s) => avec(s, [supportId]));
    removeVideoSupportAction({ supportId })
      .then((res) => {
        if ('error' in res) {
          setSupportsMasques((s) => sans(s, [supportId]));
          setAlerteListe(`Support non supprimé : ${res.error}`);
        }
      })
      .catch(() => {
        setSupportsMasques((s) => sans(s, [supportId]));
        resynchroniser('La suppression du support n’a pas pu être confirmée (connexion ?). La liste a été actualisée : vérifiez-la.');
      });
  }

  function libelleSupports(n: number): string {
    return `${n} support${n > 1 ? 's' : ''} PDF (fichier${n > 1 ? 's' : ''} compris)`;
  }

  function supprimerSeance(v: ManagedVideo) {
    const nb = v.supports.length;
    const ok = confirm(
      `Supprimer définitivement la ${copy.unite} « ${v.titre} » ?\n\n`
      + (nb > 0
        ? `Seront supprimés : la ${copy.unite} et ${nb > 1 ? `ses ${libelleSupports(nb)}` : 'son support PDF (fichier compris)'}.\n`
        : `Aucun support n’y est attaché.\n`)
      + 'La vidéo hébergée sur bunny.net n’est pas effacée.\n\nCette action est irréversible.',
    );
    if (!ok) return;
    setAlerteListe(null);
    setVideosMasquees((s) => avec(s, [v.id]));
    setSelection((s) => sans(s, [v.id]));
    if (editing === v.id) setEditing(null);
    setSuppressionEnCours(true);
    deleteVideoAction({ videoId: v.id })
      .then((res) => {
        if ('error' in res) {
          setVideosMasquees((s) => sans(s, [v.id]));
          setAlerteListe(`« ${v.titre} » n’a pas été supprimée : ${res.error}`);
          return;
        }
        apresModification();
      })
      .catch(() => {
        setVideosMasquees((s) => sans(s, [v.id]));
        resynchroniser('La suppression n’a pas pu être confirmée (connexion ?). La liste a été actualisée : vérifiez-la.');
      })
      .finally(() => setSuppressionEnCours(false));
  }

  function supprimerSelection() {
    const cibles = selectionnees;
    if (cibles.length === 0) return;
    const ids = cibles.map((v) => v.id);
    const nbSupports = cibles.reduce((acc, v) => acc + v.supports.length, 0);
    const pluriel = cibles.length > 1 ? 's' : '';
    const noms = cibles.slice(0, 8).map((v) => `• ${v.titre}`).join('\n')
      + (cibles.length > 8 ? `\n… et ${cibles.length - 8} autre${cibles.length - 8 > 1 ? 's' : ''}` : '');
    const ok = confirm(
      `Supprimer définitivement ${cibles.length} ${copy.unite}${pluriel} ?\n\n${noms}\n\n`
      + (nbSupports > 0
        ? `Seront supprimés avec elle${pluriel} : ${libelleSupports(nbSupports)}.\n`
        : 'Aucun support n’y est attaché.\n')
      + 'Les vidéos hébergées sur bunny.net ne sont pas effacées.\n\nCette action est irréversible.',
    );
    if (!ok) return;
    setAlerteListe(null);
    setVideosMasquees((s) => avec(s, ids));
    setSelection(new Set());
    if (editing && ids.includes(editing)) setEditing(null);
    setSuppressionEnCours(true);
    deleteVideosAction({ videoIds: ids })
      .then((res) => {
        if ('error' in res) {
          setVideosMasquees((s) => sans(s, ids));
          setSelection(new Set(ids));
          setAlerteListe(`Rien n’a été supprimé : ${res.error}`);
          return;
        }
        if (res.refus.length > 0) {
          const refuses = res.refus.map((r) => r.id);
          setVideosMasquees((s) => sans(s, refuses));
          setSelection(new Set(refuses));
          setAlerteListe(
            `${res.supprimees.length} supprimée${res.supprimees.length > 1 ? 's' : ''}, `
            + `${res.refus.length} non supprimée${res.refus.length > 1 ? 's' : ''} (restée${res.refus.length > 1 ? 's' : ''} cochée${res.refus.length > 1 ? 's' : ''}) : `
            + res.refus.map((r) => `« ${r.titre ?? r.id} » — ${r.error}`).join(' ; '),
          );
        }
        if (res.supprimees.length > 0) apresModification();
      })
      .catch(() => {
        setVideosMasquees((s) => sans(s, ids));
        resynchroniser('La suppression n’a pas pu être confirmée (connexion ?). La liste a été actualisée : vérifiez ce qui reste.');
      })
      .finally(() => setSuppressionEnCours(false));
  }

  return (
    <div className="space-y-4">
      <p className="text-[12.5px] text-(--color-ink-soft)">
        {copy.audience}{' '}L&apos;ordre ci-dessous est celui que voient les élèves.
        {droits.modifier && affichees.length > 1 && (
          <span id={aideOrdreId}>
            {' '}Pour le changer, glissez une {copy.unite} par sa poignée
            <GripVertical className="mx-0.5 inline h-3.5 w-3.5 align-[-2px] text-(--color-ink-muted)" aria-hidden />
            (ou, poignée sélectionnée, flèches ↑/↓ du clavier).
          </span>
        )}
      </p>
      {notice && (
        <p className="rounded-xl border border-[#7C3AED]/30 bg-[#F3EAFF] px-3 py-2 text-[12.5px] text-[#5B21B6]">
          {notice}
        </p>
      )}

      {alerteListe && (
        <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[12.5px] font-medium text-red-700">
          <p className="min-w-0 flex-1">{alerteListe}</p>
          <button
            type="button"
            onClick={() => setAlerteListe(null)}
            aria-label="Fermer le message"
            className="rounded p-0.5 text-red-500 hover:bg-red-100"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* ── Sélection multiple (suppression groupée) ── */}
      {droits.supprimer && affichees.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-(--color-border) bg-(--color-surface-soft) px-3 py-2">
          <label className="flex cursor-pointer items-center gap-2 text-[12.5px] font-semibold text-(--color-ink-soft)">
            <input
              type="checkbox"
              checked={toutSelectionne}
              ref={(el) => { if (el) el.indeterminate = selectionnees.length > 0 && !toutSelectionne; }}
              disabled={suppressionEnCours}
              onChange={() => setSelection(toutSelectionne ? new Set() : new Set(affichees.map((v) => v.id)))}
              className="h-4 w-4 accent-[#7C3AED]"
            />
            Tout sélectionner
          </label>
          <span className="text-[12px] tabular-nums text-(--color-ink-muted)">
            {selectionnees.length > 0
              ? `${selectionnees.length} ${copy.unite}${selectionnees.length > 1 ? 's' : ''} sélectionnée${selectionnees.length > 1 ? 's' : ''}`
              : `Cochez des ${copy.unite}s pour les supprimer ensemble`}
          </span>
          {selectionnees.length > 0 && (
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelection(new Set())}
                disabled={suppressionEnCours}
                className="rounded-lg px-2 py-1 text-[12px] font-semibold text-(--color-ink-soft) hover:bg-(--color-sand-100) disabled:opacity-50"
              >
                Désélectionner
              </button>
              <button
                type="button"
                onClick={supprimerSelection}
                disabled={suppressionEnCours}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-(--color-surface) px-3 py-1.5 text-[12.5px] font-semibold text-red-600 hover:border-red-300 hover:bg-red-50 disabled:opacity-50"
              >
                {suppressionEnCours ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                Supprimer la sélection ({selectionnees.length})
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Liste des vidéos existantes ── */}
      {affichees.length === 0 ? (
        <p className="rounded-xl border border-dashed border-(--color-border) bg-(--color-surface-soft) px-3 py-4 text-sm text-(--color-ink-muted)">
          Aucune {copy.unite} pour l&apos;instant.
        </p>
      ) : (
        <div className="relative">
        {emplacement && (
          <div
            aria-hidden
            data-testid="emplacement-depot"
            className="pointer-events-none absolute inset-x-0 rounded-xl border-2 border-dashed border-[#7C3AED]/50 bg-[#F3EAFF]/70"
            style={{ top: emplacement.top, height: emplacement.height }}
          />
        )}
        <ul ref={listeRef} className={`space-y-2 ${glisse?.actif ? 'select-none' : ''}`}>
          {affichees.map((v, i) => (
            <li
              key={v.id}
              ref={(el) => { if (el) carteRefs.current.set(v.id, el); else carteRefs.current.delete(v.id); }}
              style={styleCarte(i)}
              className={`rounded-xl border bg-(--color-surface) transition-colors ${
                glisse?.actif && glisse.de === i
                  ? 'cursor-grabbing border-[#7C3AED] shadow-[0_18px_40px_-12px_rgba(91,33,182,0.45)] ring-2 ring-[#7C3AED]/30'
                  : selection.has(v.id) ? 'border-[#7C3AED]/60 ring-1 ring-[#7C3AED]/30' : 'border-(--color-border)'
              }`}
            >
              <div className="flex items-center gap-2 px-3 py-2.5">
                {droits.modifier && (
                  <button
                    type="button"
                    ref={(el) => { if (el) poigneeRefs.current.set(v.id, el); else poigneeRefs.current.delete(v.id); }}
                    disabled={!peutOrdonner || affichees.length < 2}
                    onPointerDown={(e) => debutGlisser(e, i)}
                    onPointerMove={pendantGlisser}
                    onPointerUp={(e) => finGlisser(e)}
                    onPointerCancel={(e) => finGlisser(e, true)}
                    onKeyDown={(e) => clavierPoignee(e, i)}
                    aria-label={`Réordonner « ${v.titre} », position ${i + 1} sur ${affichees.length}`}
                    aria-describedby={aideOrdreId}
                    title="Glisser pour changer l’ordre (ou flèches ↑/↓ au clavier)"
                    className={`-ml-1 shrink-0 touch-none rounded-md p-1 text-(--color-ink-muted) hover:bg-[#F3EAFF] hover:text-[#7C3AED] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]/50 disabled:cursor-not-allowed disabled:opacity-30 ${
                      glisse?.actif && glisse.de === i ? 'cursor-grabbing text-[#7C3AED]' : 'cursor-grab'
                    }`}
                  >
                    <GripVertical className="h-4 w-4" />
                  </button>
                )}
                {droits.supprimer && (
                  <input
                    type="checkbox"
                    checked={selection.has(v.id)}
                    disabled={suppressionEnCours}
                    onChange={() => setSelection((s) => (s.has(v.id) ? sans(s, [v.id]) : avec(s, [v.id])))}
                    aria-label={`Sélectionner « ${v.titre} »`}
                    className="h-4 w-4 shrink-0 accent-[#7C3AED]"
                  />
                )}
                <div className="flex flex-col">
                  <button
                    type="button"
                    aria-label={`Monter « ${v.titre} »`}
                    disabled={!peutOrdonner || i === 0}
                    onClick={() => appliquerOrdre(i, i - 1)}
                    className="rounded p-0.5 text-(--color-ink-muted) hover:bg-(--color-sand-100) hover:text-(--color-ink) disabled:opacity-30"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Descendre « ${v.titre} »`}
                    disabled={!peutOrdonner || i === affichees.length - 1}
                    onClick={() => appliquerOrdre(i, i + 1)}
                    className="rounded p-0.5 text-(--color-ink-muted) hover:bg-(--color-sand-100) hover:text-(--color-ink) disabled:opacity-30"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
                <span className="w-6 shrink-0 text-center text-xs font-bold tabular-nums text-(--color-ink-muted)">
                  {i + 1}
                </span>
                {v.a_venir
                  ? <CalendarClock className="h-4 w-4 shrink-0 text-[#B26A00]" />
                  : <Video className="h-4 w-4 shrink-0 text-[#7C3AED]" />}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-(--color-ink)">{v.titre}</p>
                  {v.a_venir && (
                    // Séance à venir : les dossiers sont en ligne, la vidéo
                    // s'ajoute après la séance depuis le crayon.
                    <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className="rounded-full bg-[#FEF3E2] px-2 py-0.5 font-bold text-[#B26A00]">Vidéo à venir</span>
                      <span className="text-(--color-ink-soft)">
                        {v.live_at && formaterDateSeance(v.live_at)
                          ? `Séance le ${formaterDateSeance(v.live_at)}`
                          : 'Date de séance non renseignée'}
                        {droits.modifier ? ' — crayon pour coller le lien Bunny après la séance' : ''}
                      </span>
                    </p>
                  )}
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
                  {v.rubrique && (
                    <p className="mt-0.5 truncate text-[11px] text-(--color-ink-muted)">
                      Rubrique : {v.rubrique}
                    </p>
                  )}
                  {/* Statut de publication (cahier des charges §5). */}
                  <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px]">
                    {v.status === 'a_valider' ? (
                      <span className="rounded-full bg-[#FEF3E2] px-2 py-0.5 font-bold text-[#B26A00]">À valider — invisible des élèves</span>
                    ) : v.publish_at && new Date(v.publish_at).getTime() > maintenant ? (
                      <span className="rounded-full bg-[#E5F1FF] px-2 py-0.5 font-bold text-[#1E4D8B]">Programmée le {new Date(v.publish_at).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                    ) : (
                      <span className="rounded-full bg-[#E7F6EC] px-2 py-0.5 font-bold text-[#16793C]">Publiée</span>
                    )}
                    {droits.publier && v.status === 'a_valider' && (
                      <>
                        <button type="button" disabled={pending} onClick={() => run(() => publishVideoAction({ videoId: v.id }))} className="rounded-md bg-[#16793C] px-2 py-0.5 font-bold text-white hover:brightness-110 disabled:opacity-50">Publier</button>
                        <button
                          type="button" disabled={pending}
                          onClick={() => { const d = prompt('Publier le (AAAA-MM-JJ HH:MM) :'); if (d) run(() => publishVideoAction({ videoId: v.id, publishAt: d.replace(' ', 'T') })); }}
                          className="rounded-md border border-(--color-border) px-2 py-0.5 font-semibold text-(--color-ink-soft) hover:bg-(--color-sand-100) disabled:opacity-50"
                        >Programmer…</button>
                      </>
                    )}
                    {droits.publier && v.status !== 'a_valider' && (
                      <button type="button" disabled={pending} onClick={() => { if (confirm(`Retirer « ${v.titre} » de la publication ? Elle repassera « À valider ».`)) run(() => unpublishVideoAction({ videoId: v.id })); }} className="rounded-md border border-(--color-border) px-2 py-0.5 font-semibold text-(--color-ink-soft) hover:bg-(--color-sand-100) disabled:opacity-50">Retirer</button>
                    )}
                  </p>
                </div>
                {droits.modifier && (
                  <button
                    type="button"
                    onClick={() => setEditing(editing === v.id ? null : v.id)}
                    className="rounded-lg p-1.5 text-(--color-ink-muted) hover:bg-(--color-sand-100) hover:text-(--color-ink)"
                    aria-label="Modifier"
                  >
                    {editing === v.id ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                  </button>
                )}
                {droits.supprimer && (
                  <button
                    type="button"
                    disabled={pending || suppressionEnCours}
                    onClick={() => supprimerSeance(v)}
                    className="rounded-lg p-1.5 text-(--color-ink-muted) hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                    aria-label={`Supprimer la ${copy.unite}`}
                    title={`Supprimer la ${copy.unite} (${copy.unite} + supports)`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              {editing === v.id && (
                <VideoEditPanel
                  // Remonté quand la vidéo change (lien collé, date modifiée) :
                  // le panneau repart de l'état enregistré.
                  key={`${v.id}-${v.bunny_video_id ?? ''}-${v.live_at ?? ''}`}
                  video={v}
                  type={type}
                  pending={pending}
                  onSaveAll={(changes) =>
                    run(async () => {
                      if (changes.rename) {
                        const r = await renameVideoAction({ videoId: v.id, titre: changes.rename });
                        if ('error' in r) return r;
                      }
                      if (changes.replaceLink) {
                        const r = await replaceVideoLinkAction({ videoId: v.id, lien: changes.replaceLink });
                        if ('error' in r) return r;
                      }
                      if (changes.liveAt !== undefined) {
                        const r = await updateVideoLiveAtAction({ videoId: v.id, liveAt: changes.liveAt });
                        if ('error' in r) return r;
                      }
                      if (changes.rubrique !== undefined) {
                        const r = await updateVideoRubriqueAction({ videoId: v.id, rubrique: changes.rubrique });
                        if ('error' in r) return r;
                      }
                      if (changes.audience) {
                        const r = await updateVideoAudienceAction({
                          videoId: v.id, ...changes.audience,
                        });
                        if ('error' in r) return r;
                      }
                      for (const sr of changes.supportRenames ?? []) {
                        const r = await renameVideoSupportAction(sr);
                        if ('error' in r) return r;
                      }
                      for (const sa of changes.supportAudiences ?? []) {
                        const r = await updateVideoSupportAudienceAction(sa);
                        if ('error' in r) return r;
                      }
                      return { ok: true as const };
                    })
                  }
                  onAddSupports={(files) =>
                    run(async () => {
                      const err = await uploadSupports(v.id, files);
                      return err ? { error: err } : { ok: true };
                    })
                  }
                  onRemoveSupport={retirerSupport}
                  onMoveSupport={(supportId, direction) =>
                    run(() => moveVideoSupportAction({ supportId, direction }))
                  }
                  onDeleteSeance={droits.supprimer ? () => supprimerSeance(v) : undefined}
                  unite={copy.unite}
                  deleting={suppressionEnCours}
                  studentPickerProps={studentPickerProps}
                />
              )}
            </li>
          ))}
        </ul>
        </div>
      )}
      {/* Annonce des déplacements pour les lecteurs d'écran. */}
      <p aria-live="polite" role="status" className="sr-only">{annonce}</p>

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
      ) : droits.creer ? (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => startAdding()}>
              <Plus />
              Ajouter {videos.length > 0 ? 'des' : 'une'} {copy.unite}{videos.length > 0 ? 's' : ''}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => startAdding(true)}>
              <CalendarClock />
              Séance à venir (dossiers d&apos;abord)
            </Button>
          </div>
          <p className="text-[11.5px] text-(--color-ink-muted)">
            Séance à venir : déposez les dossiers à préparer sans lien Bunny ; la vidéo s&apos;ajoute
            après la séance, depuis le crayon.
          </p>
          {!droits.publier && (
            <p className="text-[12px] text-[#B26A00]">
              Vos dépôts restent « À valider » : un responsable habilité les publiera après relecture.
            </p>
          )}
        </div>
      ) : (
        <p className="text-[12px] text-(--color-ink-muted)">Votre accès ne permet pas de déposer de {copy.unite}.</p>
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

  function moveSupport(tempId: string, direction: 'up' | 'down') {
    const list = [...seance.supports];
    const idx = list.findIndex((s) => s.tempId === tempId);
    if (idx === -1) return;
    const target = direction === 'up' ? idx - 1 : idx + 1;
    if (target < 0 || target >= list.length) return;
    const [moved] = list.splice(idx, 1);
    list.splice(target, 0, moved);
    onUpdate({ supports: list });
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
        {seance.aVenir && (
          <span className="shrink-0 rounded-full bg-[#FEF3E2] px-2 py-0.5 text-[10px] font-bold text-[#B26A00]">
            Vidéo à venir
          </span>
        )}
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
          {/* Séance à venir : pas encore de vidéo, les dossiers d'abord. */}
          <label className="flex items-start gap-2 rounded-xl border border-(--color-border) bg-(--color-surface-soft) px-3 py-2 text-[12.5px] text-(--color-ink)">
            <input
              type="checkbox"
              checked={seance.aVenir}
              disabled={disabled}
              onChange={(e) => onUpdate({ aVenir: e.target.checked })}
              className="mt-0.5 h-4 w-4 accent-[#7C3AED]"
            />
            <span>
              <span className="font-semibold">Séance à venir — pas encore de vidéo</span>
              <span className="block text-[11px] text-(--color-ink-muted)">
                Les élèves voient l&apos;annonce de la séance et ses dossiers à préparer. Le lien Bunny
                s&apos;ajoute après la séance, depuis le crayon : les supports restent attachés.
              </span>
            </span>
          </label>

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
                Lien Bunny.net Stream{seance.aVenir ? ' (facultatif)' : ''}
              </label>
              <input
                type="text"
                placeholder={seance.aVenir ? 'À ajouter après la séance' : 'Collez le lien de la vidéo'}
                value={seance.lien}
                disabled={disabled}
                onChange={(e) => onUpdate({ lien: e.target.value })}
                className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 font-mono text-sm focus:border-[#7C3AED] focus:outline-none focus:ring-1 focus:ring-[#7C3AED]"
              />
              {/* Aperçu dès qu'un lien est collé : la bonne vidéo, avant d'enregistrer. */}
              <BunnyApercu lien={seance.lien} />
            </div>
          </div>

          {seance.aVenir && (
            <DateSeanceField
              value={seance.liveAt}
              disabled={disabled}
              onChange={(v) => onUpdate({ liveAt: v })}
            />
          )}

          {/* Rubrique (titre de section côté élève) */}
          <RubriqueField
            type={type}
            value={seance.rubrique}
            disabled={disabled}
            onChange={(r) => onUpdate({ rubrique: r })}
          />

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
              {seance.aVenir ? 'Dossiers à préparer (PDF)' : `Supports PDF de la ${copy.unite}`}
            </p>

            {seance.supports.length > 0 && (
              <ul className="mb-3 space-y-2">
                {seance.supports.map((sup, supIdx) => (
                  <li
                    key={sup.tempId}
                    className="rounded-lg border border-(--color-border) bg-(--color-surface-soft) p-2"
                  >
                    <div className="flex items-center gap-2">
                      {seance.supports.length > 1 && (
                        <div className="flex flex-col">
                          <button
                            type="button"
                            aria-label="Monter"
                            disabled={disabled || supIdx === 0}
                            onClick={() => moveSupport(sup.tempId, 'up')}
                            className="rounded p-0.5 text-(--color-ink-muted) hover:bg-(--color-sand-100) hover:text-(--color-ink) disabled:opacity-30"
                          >
                            <ChevronUp className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            aria-label="Descendre"
                            disabled={disabled || supIdx === seance.supports.length - 1}
                            onClick={() => moveSupport(sup.tempId, 'down')}
                            className="rounded p-0.5 text-(--color-ink-muted) hover:bg-(--color-sand-100) hover:text-(--color-ink) disabled:opacity-30"
                          >
                            <ChevronDown className="h-3 w-3" />
                          </button>
                        </div>
                      )}
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
              L&apos;élève retrouve les documents dans l&apos;onglet « Support de la séance ».
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  RubriqueField — titre de section affiché à l'élève                 */
/* ------------------------------------------------------------------ */

function RubriqueField({
  type,
  value,
  disabled,
  onChange,
  compact = false,
}: {
  type: VideoType;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
  compact?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-(--color-ink-muted)">
        Rubrique (affichée à l&apos;élève)
      </label>
      <input
        type="text"
        value={value}
        disabled={disabled}
        maxLength={120}
        placeholder={rubriqueParDefaut(type)}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 text-sm focus:border-[#7C3AED] focus:outline-none focus:ring-1 focus:ring-[#7C3AED] ${compact ? 'py-1.5' : 'py-2'}`}
      />
      <p className="mt-1 text-[11px] text-(--color-ink-muted)">
        Regroupe les vidéos sous un titre de section dans l&apos;espace élève (ex. : Dernier tour de révision).
        Laissez vide pour le libellé par défaut : « {rubriqueParDefaut(type)} ».
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  VideoEditPanel — édition d'une vidéo existante                     */
/* ------------------------------------------------------------------ */

type SupportEditState = {
  titre: string;
  differentes: boolean;
  voies: string[];
  offers: string[];
};

function VideoEditPanel({
  video,
  type,
  pending,
  onSaveAll,
  onAddSupports,
  onRemoveSupport,
  onMoveSupport,
  onDeleteSeance,
  unite,
  deleting = false,
  studentPickerProps,
}: {
  video: ManagedVideo;
  type: VideoType;
  pending: boolean;
  onSaveAll: (changes: BatchChanges) => void;
  onAddSupports: (files: File[]) => void;
  onRemoveSupport: (supportId: string) => void;
  onMoveSupport: (supportId: string, direction: 'up' | 'down') => void;
  /** Suppression de la séance entière (absent sans le droit « supprimer »). */
  onDeleteSeance?: () => void;
  /** « séance » ou « vidéo », pour les libellés. */
  unite: string;
  deleting?: boolean;
  studentPickerProps: {
    students: StudentLite[] | null; loading: boolean; error: string | null; onLoad: () => void;
  };
}) {
  const [titre, setTitre] = useState(video.titre);
  const [lien, setLien] = useState('');
  const aVenir = !!video.a_venir;
  // Date de la séance : proposée pour une séance à venir (ou déjà renseignée).
  const [liveAt, setLiveAt] = useState(() => versSaisieLocale(video.live_at));
  const liveAtInitial = video.live_at ? depuisSaisieLocale(versSaisieLocale(video.live_at)) : null;
  const [rubrique, setRubrique] = useState(video.rubrique ?? '');
  const [voies, setVoies] = useState<string[]>(video.voies);
  const [offers, setOffers] = useState<string[]>(video.offers);
  const [denied, setDenied] = useState<string[]>(video.denied_user_ids);
  const [allowed, setAllowed] = useState<string[]>(video.allowed_user_ids);

  const [supportEdits, setSupportEdits] = useState<Record<string, SupportEditState>>(() => {
    const init: Record<string, SupportEditState> = {};
    for (const s of video.supports) {
      const has = (s.voies?.length ?? 0) > 0 || (s.offers?.length ?? 0) > 0;
      init[s.id] = {
        titre: s.titre,
        differentes: has,
        voies: s.voies && s.voies.length > 0 ? s.voies : video.voies,
        offers: s.offers && s.offers.length > 0 ? s.offers : video.offers,
      };
    }
    return init;
  });

  function getSupportEdit(doc: VideoSupportDoc): SupportEditState {
    return supportEdits[doc.id] ?? {
      titre: doc.titre,
      differentes: (doc.voies?.length ?? 0) > 0 || (doc.offers?.length ?? 0) > 0,
      voies: doc.voies && doc.voies.length > 0 ? doc.voies : video.voies,
      offers: doc.offers && doc.offers.length > 0 ? doc.offers : video.offers,
    };
  }

  function updateSupportEdit(id: string, patch: Partial<SupportEditState>) {
    setSupportEdits((prev) => {
      const current = prev[id] ?? getSupportEdit(video.supports.find((s) => s.id === id)!);
      return { ...prev, [id]: { ...current, ...patch } };
    });
  }

  const memeListe = (a: string[], b: string[]) => a.slice().sort().join() === b.slice().sort().join();

  const isDirty = useMemo(() => {
    if (titre.trim() !== video.titre) return true;
    if (lien.trim()) return true;
    if (depuisSaisieLocale(liveAt) !== liveAtInitial) return true;
    if ((rubrique.trim() || null) !== (video.rubrique ?? null)) return true;
    if (!memeListe(voies, video.voies)) return true;
    if (!memeListe(offers, video.offers)) return true;
    if (!memeListe(denied, video.denied_user_ids)) return true;
    if (!memeListe(allowed, video.allowed_user_ids)) return true;
    for (const s of video.supports) {
      const edit = getSupportEdit(s);
      if (edit.titre.trim() !== s.titre) return true;
      const had = (s.voies?.length ?? 0) > 0 || (s.offers?.length ?? 0) > 0;
      if (edit.differentes !== had) return true;
      if (edit.differentes) {
        if (!memeListe(edit.voies, s.voies ?? [])) return true;
        if (!memeListe(edit.offers, s.offers ?? [])) return true;
      }
    }
    return false;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [titre, lien, liveAt, rubrique, voies, offers, denied, allowed, supportEdits, video]);

  function handleSaveAll() {
    const changes: BatchChanges = {};
    if (titre.trim() && titre.trim() !== video.titre) changes.rename = titre.trim();
    if (lien.trim()) changes.replaceLink = lien.trim();
    const liveAtSaisie = depuisSaisieLocale(liveAt);
    if (liveAtSaisie !== liveAtInitial) changes.liveAt = liveAtSaisie;
    const rubriqueSaisie = rubrique.trim() || null;
    if (rubriqueSaisie !== (video.rubrique ?? null)) changes.rubrique = rubriqueSaisie;
    const audienceChanged =
      !memeListe(voies, video.voies) || !memeListe(offers, video.offers)
      || !memeListe(denied, video.denied_user_ids) || !memeListe(allowed, video.allowed_user_ids);
    if (audienceChanged) {
      changes.audience = { voies, offers, deniedUserIds: denied, allowedUserIds: allowed };
    }
    const renames: NonNullable<BatchChanges['supportRenames']> = [];
    const audiences: NonNullable<BatchChanges['supportAudiences']> = [];
    for (const s of video.supports) {
      const edit = getSupportEdit(s);
      if (edit.titre.trim() && edit.titre.trim() !== s.titre) {
        renames.push({ supportId: s.id, titre: edit.titre.trim() });
      }
      const had = (s.voies?.length ?? 0) > 0 || (s.offers?.length ?? 0) > 0;
      const audienceModified = edit.differentes !== had
        || (edit.differentes && (!memeListe(edit.voies, s.voies ?? []) || !memeListe(edit.offers, s.offers ?? [])));
      if (audienceModified) {
        audiences.push({
          supportId: s.id,
          differentes: edit.differentes,
          voies: edit.differentes ? edit.voies : [],
          offers: edit.differentes ? edit.offers : [],
        });
      }
    }
    if (renames.length > 0) changes.supportRenames = renames;
    if (audiences.length > 0) changes.supportAudiences = audiences;
    onSaveAll(changes);
  }

  return (
    <div className="space-y-3 border-t border-(--color-border) bg-(--color-surface-soft) px-3 py-3">
      <div>
        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-(--color-ink-muted)">
          Nom
        </label>
        <input
          type="text"
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-1.5 text-sm"
        />
      </div>

      {aVenir ? (
        // Séance à venir : c'est ici qu'on colle le lien après la séance. Les
        // supports déjà en ligne restent attachés à cette même entrée.
        <div className="rounded-xl border border-[#B26A00]/30 bg-[#FEF3E2] p-3">
          <label className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#B26A00]">
            <CalendarClock className="h-3.5 w-3.5" />
            Ajouter la vidéo (après la séance)
          </label>
          <input
            type="text"
            value={lien}
            placeholder="Collez le lien Bunny.net de la vidéo"
            onChange={(e) => setLien(e.target.value)}
            className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-1.5 font-mono text-sm"
          />
          <p className="mt-1 text-[11px] text-(--color-ink-soft)">
            Les dossiers déjà déposés restent attachés : rien à refaire.
          </p>
          <BunnyApercu lien={lien} />
        </div>
      ) : (
        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-(--color-ink-muted)">
            Remplacer la vidéo
          </label>
          <input
            type="text"
            value={lien}
            placeholder="Nouveau lien Bunny.net (laisser vide pour conserver)"
            onChange={(e) => setLien(e.target.value)}
            className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-1.5 font-mono text-sm"
          />
          <BunnyApercu lien={lien} />
        </div>
      )}

      {(aVenir || !!video.live_at) && (
        <DateSeanceField value={liveAt} disabled={pending} onChange={setLiveAt} compact />
      )}

      <RubriqueField
        type={type}
        value={rubrique}
        disabled={pending}
        onChange={setRubrique}
        compact
      />

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
      </div>

      <div>
        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-(--color-ink-muted)">
          Supports de séance (PDF)
        </label>

        {video.supports.length > 0 && (
          <ul className="mb-2 space-y-1.5">
            {video.supports.map((doc, idx) => (
              <SupportLigne
                key={doc.id}
                doc={doc}
                index={idx}
                total={video.supports.length}
                pending={pending}
                editState={getSupportEdit(doc)}
                onEditChange={(patch) => updateSupportEdit(doc.id, patch)}
                onRemove={() => onRemoveSupport(doc.id)}
                onMove={(dir) => onMoveSupport(doc.id, dir)}
              />
            ))}
          </ul>
        )}

        <SupportsDropzone
          libelle={video.supports.length > 0 ? "Ajouter d’autres PDF" : "Ajouter un ou plusieurs PDF"}
          disabled={pending}
          onFiles={onAddSupports}
        />
        <p className="mt-1 text-[11px] text-(--color-ink-muted)">
          Chaque support prend pour nom celui de son fichier, sans l&apos;extension ; il se renomme
          dans la liste ci-dessus. L&apos;élève ouvre l&apos;onglet « Support de la séance » et y retrouve
          tous les documents, filigranés à son nom et non téléchargeables.
        </p>
      </div>

      <div className="flex items-center gap-3 border-t border-(--color-border) pt-3">
        <Button
          type="button"
          disabled={pending || !isDirty}
          onClick={handleSaveAll}
        >
          {pending ? <Loader2 className="animate-spin" /> : <Check />}
          Enregistrer
        </Button>
        {isDirty && (
          <p className="text-[11px] font-medium text-amber-600">
            Modifications non enregistrées
          </p>
        )}
        {onDeleteSeance && (
          <button
            type="button"
            onClick={onDeleteSeance}
            disabled={pending || deleting}
            className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-(--color-surface) px-3 py-1.5 text-[12.5px] font-semibold text-red-600 hover:border-red-300 hover:bg-red-50 disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Supprimer la {unite}
          </button>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SupportLigne — un support existant, avec permissions inline        */
/* ------------------------------------------------------------------ */

function SupportLigne({
  doc, index, total, pending,
  editState, onEditChange,
  onRemove, onMove,
}: {
  doc: VideoSupportDoc;
  index: number;
  total: number;
  pending: boolean;
  editState: SupportEditState;
  onEditChange: (patch: Partial<SupportEditState>) => void;
  onRemove: () => void;
  onMove: (direction: 'up' | 'down') => void;
}) {
  return (
    <li className="rounded-lg border border-(--color-border) bg-(--color-surface) px-2 py-1.5">
      <div className="flex items-center gap-2">
        {total > 1 && (
          <div className="flex flex-col">
            <button
              type="button"
              aria-label="Monter"
              disabled={pending || index === 0}
              onClick={() => onMove('up')}
              className="rounded p-0.5 text-(--color-ink-muted) hover:bg-(--color-sand-100) hover:text-(--color-ink) disabled:opacity-30"
            >
              <ChevronUp className="h-3 w-3" />
            </button>
            <button
              type="button"
              aria-label="Descendre"
              disabled={pending || index === total - 1}
              onClick={() => onMove('down')}
              className="rounded p-0.5 text-(--color-ink-muted) hover:bg-(--color-sand-100) hover:text-(--color-ink) disabled:opacity-30"
            >
              <ChevronDown className="h-3 w-3" />
            </button>
          </div>
        )}
        <Paperclip className="h-3.5 w-3.5 shrink-0 text-(--color-ink-muted)" />
        <input
          type="text"
          value={editState.titre}
          onChange={(e) => onEditChange({ titre: e.target.value })}
          className="min-w-0 flex-1 bg-transparent text-sm text-(--color-ink) outline-none"
        />
        <button
          type="button"
          disabled={pending}
          onClick={() => { if (confirm(`Retirer le support « ${doc.titre} » ? Son fichier PDF sera supprimé.`)) onRemove(); }}
          aria-label="Retirer ce support"
          className="rounded-lg p-1 text-(--color-ink-muted) hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <label className="mt-1.5 flex items-center gap-2 pl-5 text-[12.5px] text-(--color-ink)">
        <input
          type="checkbox"
          checked={editState.differentes}
          disabled={pending}
          onChange={(e) => onEditChange({ differentes: e.target.checked })}
          className="h-3.5 w-3.5 accent-[#7C3AED]"
        />
        Permissions différentes
        {!editState.differentes && (
          <span className="text-[11px] text-(--color-ink-muted)">(hérite de la vidéo)</span>
        )}
      </label>

      {editState.differentes && (
        <div className="mt-2 pl-5">
          <AudiencePicker
            voies={editState.voies}
            offers={editState.offers}
            disabled={pending}
            onVoies={(v) => onEditChange({ voies: v })}
            onOffers={(o) => onEditChange({ offers: o })}
          />
        </div>
      )}
    </li>
  );
}
