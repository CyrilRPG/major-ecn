'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen, ChevronDown, ChevronRight, Copy, FileText, Layers3,
  ListChecks, Loader2, Lock, MoveRight, Pencil, Plus, Trash2, Video, X,
} from 'lucide-react';
import {
  addSlot, createCollege, createItem, deleteCollege, deleteItem, deleteSlot,
  duplicateItem, moveItem, renameCollege, renameItem, updateCollegePermission,
} from './actions';

type Slot = { id: string; label: string; content_type: 'video' | 'fiche' | 'qcm' | 'flashcards'; position: number };
type Item = { id: string; titre: string; order_index: number; slots: Slot[] };
type College = { id: string; nom: string; icon_key: string | null; color_hex: string | null; order_index: number; min_offer: string | null; items: Item[] };

const SLOT_ICONS = {
  video:      Video,
  fiche:      FileText,
  qcm:        ListChecks,
  flashcards: Layers3,
} as const;
const SLOT_LABELS = {
  video:      'Vidéo',
  fiche:      'Fiche',
  qcm:        'QCM',
  flashcards: 'Flashcards',
} as const;
const SLOT_COLORS = {
  video:      { bg: '#FCEAEC', fg: '#C0112E' },
  fiche:      { bg: '#EDE9FE', fg: '#6D28D9' },
  qcm:        { bg: '#FFEDD5', fg: '#EA580C' },
  flashcards: { bg: '#DCFCE7', fg: '#16A34A' },
} as const;

const OFFER_LABELS: Record<string, string> = {
  essentiel: 'Essentiel ou +',
  premium:   'Premium ou +',
  intensif:  'Intensif uniquement',
};

export function ArborescenceClient({ colleges }: { colleges: College[] }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [showAddCollege, setShowAddCollege] = useState(false);
  const [addingItem, setAddingItem] = useState<string | null>(null); // matiere_id
  const [addingSlot, setAddingSlot] = useState<string | null>(null); // cours_id
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });

  const run = (action: () => Promise<{ ok: boolean; error?: string }>) => {
    setError(null);
    startTransition(async () => {
      const r = await action();
      if (!r.ok) setError(r.error ?? 'Erreur');
      else router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-(--color-danger)/30 bg-red-50 px-3 py-2 text-sm text-(--color-danger)">
          {error}
        </div>
      )}

      {/* Bouton « ajouter un collège » */}
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={() => setShowAddCollege(true)}
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-lg bg-(--color-primary) px-3 py-2 text-sm font-bold text-white hover:scale-[1.02] disabled:opacity-60"
        >
          <Plus className="h-4 w-4" /> Nouveau collège
        </button>
      </div>

      {showAddCollege && (
        <CreateCollegeForm
          onCancel={() => setShowAddCollege(false)}
          onCreate={(input) => {
            setShowAddCollege(false);
            run(async () => {
              const r = await createCollege(input);
              return r.ok ? { ok: true } : { ok: false, error: r.error };
            });
          }}
        />
      )}

      {/* Liste des collèges */}
      {colleges.length === 0 && (
        <p className="rounded-2xl border border-dashed border-(--color-border) bg-(--color-surface) p-8 text-center text-sm text-(--color-ink-muted)">
          Aucun collège pour le moment. Créez-en un pour démarrer.
        </p>
      )}

      {colleges.map((m) => (
        <article key={m.id} className="rounded-2xl border border-(--color-border) bg-(--color-surface) shadow-(--shadow-soft)">
          {/* En-tête collège */}
          <header className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-5">
            <button
              onClick={() => toggle(m.id)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-(--color-ink-soft) hover:bg-(--color-sand-100)"
            >
              {expanded.has(m.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ background: `${m.color_hex ?? '#C0112E'}22`, color: m.color_hex ?? '#C0112E' }}>
              <BookOpen className="h-4 w-4" />
            </span>
            <CollegeNameEditor college={m} onRun={run} />
            <span className="text-xs text-(--color-ink-muted)">{m.items.length} item{m.items.length > 1 ? 's' : ''}</span>

            <div className="ml-auto flex items-center gap-2">
              <PermissionEditor college={m} onRun={run} />
              <button
                onClick={() => {
                  if (confirm(`Supprimer « ${m.nom} » et tous ses items ? Action irréversible.`)) {
                    run(async () => await deleteCollege(m.id));
                  }
                }}
                disabled={pending}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-(--color-danger) hover:bg-red-50"
                title="Supprimer le collège"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </header>

          {/* Items du collège */}
          {expanded.has(m.id) && (
            <div className="border-t border-(--color-border) px-4 py-3 sm:px-5">
              <div className="space-y-2">
                {m.items.map((it) => (
                  <ItemRow
                    key={it.id}
                    item={it}
                    matiere_id={m.id}
                    colleges={colleges}
                    pending={pending}
                    onRun={run}
                    onAddSlot={() => setAddingSlot(it.id)}
                    addingSlot={addingSlot === it.id}
                    closeAddSlot={() => setAddingSlot(null)}
                  />
                ))}
              </div>

              {/* Ajouter un item */}
              {addingItem === m.id ? (
                <AddItemForm
                  onCancel={() => setAddingItem(null)}
                  onCreate={(titre) => {
                    setAddingItem(null);
                    run(async () => {
                      const r = await createItem({ matiere_id: m.id, titre });
                      return r.ok ? { ok: true } : { ok: false, error: r.error };
                    });
                  }}
                />
              ) : (
                <button
                  onClick={() => setAddingItem(m.id)}
                  disabled={pending}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg border border-dashed border-(--color-border) px-3 py-2 text-xs font-bold text-(--color-ink-soft) hover:bg-(--color-sand-100) disabled:opacity-60"
                >
                  <Plus className="h-3.5 w-3.5" /> Ajouter un item à ce collège
                </button>
              )}
            </div>
          )}
        </article>
      ))}

      {pending && (
        <p className="flex items-center justify-center gap-2 text-xs text-(--color-ink-muted)">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Enregistrement…
        </p>
      )}
    </div>
  );
}

/* ============================================================
   Editeurs inline
   ============================================================ */
function CollegeNameEditor({ college, onRun }: { college: College; onRun: (a: () => Promise<{ ok: boolean; error?: string }>) => void }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(college.nom);

  if (editing) {
    return (
      <span className="flex items-center gap-1.5">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
          className="rounded-md border border-(--color-border) bg-white px-2 py-1 text-sm font-bold text-(--color-ink) outline-none focus:border-(--color-primary)"
        />
        <button
          onClick={() => {
            setEditing(false);
            onRun(async () => await renameCollege(college.id, value));
          }}
          className="rounded-md bg-(--color-primary) px-2 py-1 text-xs font-bold text-white"
        >
          OK
        </button>
        <button onClick={() => { setEditing(false); setValue(college.nom); }} className="text-xs text-(--color-ink-soft)">
          <X className="h-3.5 w-3.5" />
        </button>
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5">
      <h2 className="text-base font-bold text-(--color-ink)">{college.nom}</h2>
      <button onClick={() => setEditing(true)} className="text-(--color-ink-muted) hover:text-(--color-primary)">
        <Pencil className="h-3.5 w-3.5" />
      </button>
    </span>
  );
}

function PermissionEditor({ college, onRun }: { college: College; onRun: (a: () => Promise<{ ok: boolean; error?: string }>) => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-(--color-border) bg-(--color-sand-100) px-2.5 py-1 text-[11px] font-medium text-(--color-ink-soft)">
      <Lock className="h-3 w-3" />
      <select
        value={college.min_offer ?? ''}
        onChange={(e) => {
          const v = (e.target.value || null) as 'essentiel' | 'premium' | 'intensif' | null;
          onRun(async () => await updateCollegePermission(college.id, v));
        }}
        className="bg-transparent text-[11px] font-medium text-(--color-ink) outline-none"
      >
        <option value="">Accès libre</option>
        <option value="essentiel">{OFFER_LABELS.essentiel}</option>
        <option value="premium">{OFFER_LABELS.premium}</option>
        <option value="intensif">{OFFER_LABELS.intensif}</option>
      </select>
    </span>
  );
}

function ItemRow({
  item, matiere_id, colleges, pending, onRun, onAddSlot, addingSlot, closeAddSlot,
}: {
  item: Item;
  matiere_id: string;
  colleges: College[];
  pending: boolean;
  onRun: (a: () => Promise<{ ok: boolean; error?: string }>) => void;
  onAddSlot: () => void;
  addingSlot: boolean;
  closeAddSlot: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(item.titre);
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-(--color-border) bg-(--color-surface)">
      <div className="flex flex-wrap items-center gap-2 px-3 py-2">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex h-7 w-7 items-center justify-center rounded-md text-(--color-ink-soft) hover:bg-(--color-sand-100)"
        >
          {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        </button>

        {editing ? (
          <span className="flex items-center gap-1.5">
            <input
              value={value} onChange={(e) => setValue(e.target.value)} autoFocus
              className="rounded-md border border-(--color-border) bg-white px-2 py-1 text-sm text-(--color-ink) outline-none focus:border-(--color-primary)"
            />
            <button onClick={() => { setEditing(false); onRun(async () => await renameItem(item.id, value)); }}
              className="rounded-md bg-(--color-primary) px-2 py-1 text-xs font-bold text-white">OK</button>
            <button onClick={() => { setEditing(false); setValue(item.titre); }} className="text-xs text-(--color-ink-soft)">
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ) : (
          <span className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-(--color-ink)">{item.titre}</p>
            <button onClick={() => setEditing(true)} className="text-(--color-ink-muted) hover:text-(--color-primary)">
              <Pencil className="h-3 w-3" />
            </button>
          </span>
        )}
        <span className="text-[11px] text-(--color-ink-muted)">
          {item.slots.length} contenu{item.slots.length > 1 ? 's' : ''}
        </span>

        <div className="ml-auto flex items-center gap-1">
          <select
            value=""
            onChange={(e) => {
              const target = e.target.value;
              if (!target || target === matiere_id) return;
              if (confirm(`Déplacer « ${item.titre} » vers ce collège ?`)) {
                onRun(async () => await moveItem(item.id, target));
              }
              e.currentTarget.value = '';
            }}
            className="rounded-md border border-(--color-border) bg-white px-1.5 py-1 text-[11px] text-(--color-ink-soft) outline-none"
            title="Déplacer vers un autre collège"
          >
            <option value="">Déplacer…</option>
            {colleges.filter((c) => c.id !== matiere_id).map((c) => (
              <option key={c.id} value={c.id}>{c.nom}</option>
            ))}
          </select>
          <button
            onClick={() => onRun(async () => {
              const r = await duplicateItem(item.id);
              return r.ok ? { ok: true } : { ok: false, error: r.error };
            })}
            disabled={pending}
            className="flex h-7 w-7 items-center justify-center rounded-md text-(--color-ink-soft) hover:bg-(--color-sand-100)"
            title="Dupliquer l'item"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => {
              if (confirm(`Supprimer l'item « ${item.titre} » et tous ses contenus ?`)) {
                onRun(async () => await deleteItem(item.id));
              }
            }}
            disabled={pending}
            className="flex h-7 w-7 items-center justify-center rounded-md text-(--color-danger) hover:bg-red-50"
            title="Supprimer l'item"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Slots de contenu */}
      {open && (
        <div className="border-t border-(--color-border) px-3 py-3">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-(--color-ink-muted)">
            Contenus de cet item
          </p>
          <ul className="space-y-1.5">
            {item.slots.map((s) => {
              const Icon = SLOT_ICONS[s.content_type];
              const tone = SLOT_COLORS[s.content_type];
              return (
                <li key={s.id} className="flex items-center gap-2 rounded-md border border-(--color-border) bg-white px-2.5 py-1.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md" style={{ background: tone.bg, color: tone.fg }}>
                    <Icon className="h-3 w-3" />
                  </span>
                  <span className="flex-1 text-sm text-(--color-ink)">{s.label}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: tone.fg }}>
                    {SLOT_LABELS[s.content_type]}
                  </span>
                  <button
                    onClick={() => {
                      if (confirm(`Retirer le contenu « ${s.label} » ?`)) {
                        onRun(async () => await deleteSlot(s.id));
                      }
                    }}
                    disabled={pending}
                    className="text-(--color-danger) hover:opacity-70"
                    title="Retirer ce contenu"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              );
            })}
            {item.slots.length === 0 && (
              <li className="text-xs italic text-(--color-ink-muted)">Aucun contenu — ajoutez-en un.</li>
            )}
          </ul>

          {addingSlot ? (
            <AddSlotForm
              onCancel={closeAddSlot}
              onAdd={(label, content_type) => {
                closeAddSlot();
                onRun(async () => await addSlot({ cours_id: item.id, label, content_type }));
              }}
            />
          ) : (
            <button
              onClick={onAddSlot}
              disabled={pending}
              className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-dashed border-(--color-border) px-2.5 py-1 text-[11px] font-bold text-(--color-ink-soft) hover:bg-(--color-sand-100)"
            >
              <Plus className="h-3 w-3" /> Ajouter un contenu
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function CreateCollegeForm({
  onCancel, onCreate,
}: {
  onCancel: () => void;
  onCreate: (input: { nom: string; min_offer: 'essentiel' | 'premium' | 'intensif' | null }) => void;
}) {
  const [nom, setNom] = useState('');
  const [offer, setOffer] = useState<'' | 'essentiel' | 'premium' | 'intensif'>('');
  return (
    <div className="rounded-2xl border border-(--color-primary)/40 bg-(--color-primary-soft)/30 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <input
          autoFocus value={nom} onChange={(e) => setNom(e.target.value)}
          placeholder="Nom du nouveau collège (ex. Cardiologie)"
          className="flex-1 min-w-[200px] rounded-md border border-(--color-border) bg-white px-3 py-2 text-sm outline-none focus:border-(--color-primary)"
        />
        <select
          value={offer} onChange={(e) => setOffer(e.target.value as 'essentiel'|'premium'|'intensif'|'')}
          className="rounded-md border border-(--color-border) bg-white px-2 py-2 text-sm outline-none"
        >
          <option value="">Accès libre</option>
          <option value="essentiel">Essentiel ou +</option>
          <option value="premium">Premium ou +</option>
          <option value="intensif">Intensif uniquement</option>
        </select>
        <button
          onClick={() => nom.trim() && onCreate({ nom, min_offer: (offer || null) })}
          disabled={!nom.trim()}
          className="rounded-md bg-(--color-primary) px-3 py-2 text-sm font-bold text-white disabled:opacity-60"
        >
          Créer
        </button>
        <button onClick={onCancel} className="rounded-md border border-(--color-border) px-3 py-2 text-sm">Annuler</button>
      </div>
    </div>
  );
}

function AddItemForm({ onCancel, onCreate }: { onCancel: () => void; onCreate: (titre: string) => void }) {
  const [titre, setTitre] = useState('');
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-(--color-primary)/40 bg-(--color-primary-soft)/30 p-3">
      <input
        autoFocus value={titre} onChange={(e) => setTitre(e.target.value)}
        placeholder="Titre du nouvel item (ex. Insuffisance cardiaque)"
        className="flex-1 min-w-[180px] rounded-md border border-(--color-border) bg-white px-2.5 py-1.5 text-sm outline-none focus:border-(--color-primary)"
      />
      <button
        onClick={() => titre.trim() && onCreate(titre)}
        disabled={!titre.trim()}
        className="rounded-md bg-(--color-primary) px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60"
      >
        <MoveRight className="inline h-3 w-3" /> Créer (4 contenus par défaut)
      </button>
      <button onClick={onCancel} className="rounded-md border border-(--color-border) px-2 py-1.5 text-xs">Annuler</button>
    </div>
  );
}

function AddSlotForm({ onCancel, onAdd }: { onCancel: () => void; onAdd: (label: string, type: 'video'|'fiche'|'qcm'|'flashcards') => void }) {
  const [label, setLabel] = useState('');
  const [type, setType] = useState<'video'|'fiche'|'qcm'|'flashcards'>('video');
  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5 rounded-md border border-(--color-primary)/40 bg-(--color-primary-soft)/30 p-2">
      <input
        autoFocus value={label} onChange={(e) => setLabel(e.target.value)}
        placeholder="Titre du contenu (ex. Vidéo synthétique)"
        className="flex-1 min-w-[160px] rounded-md border border-(--color-border) bg-white px-2 py-1 text-xs outline-none focus:border-(--color-primary)"
      />
      <select
        value={type} onChange={(e) => setType(e.target.value as 'video'|'fiche'|'qcm'|'flashcards')}
        className="rounded-md border border-(--color-border) bg-white px-2 py-1 text-xs outline-none"
      >
        <option value="video">Vidéo</option>
        <option value="fiche">Fiche</option>
        <option value="qcm">QCM</option>
        <option value="flashcards">Flashcards</option>
      </select>
      <button
        onClick={() => label.trim() && onAdd(label, type)}
        disabled={!label.trim()}
        className="rounded-md bg-(--color-primary) px-2 py-1 text-xs font-bold text-white disabled:opacity-60"
      >
        Ajouter
      </button>
      <button onClick={onCancel} className="rounded-md border border-(--color-border) px-2 py-1 text-xs">Annuler</button>
    </div>
  );
}
