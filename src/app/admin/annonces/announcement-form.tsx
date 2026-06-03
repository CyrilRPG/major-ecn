'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Save, Trash2, X } from 'lucide-react';
import { createAnnouncement, updateAnnouncement, deleteAnnouncement, type AnnouncementInput } from './actions';

const KINDS = [
  { value: 'countdown',  label: 'Compte à rebours (jours jusqu’à une date)' },
  { value: 'event_list', label: 'Liste d’événements datés' },
  { value: 'info',       label: 'Bloc d’information (texte + bouton)' },
  { value: 'stat',       label: 'Statistique (gros chiffre + sous-stats)' },
  { value: 'text',       label: 'Texte libre' },
] as const;

const TONES = [
  { value: 'red',    label: 'Rouge' },
  { value: 'green',  label: 'Vert' },
  { value: 'blue',   label: 'Bleu' },
  { value: 'orange', label: 'Orange' },
  { value: 'purple', label: 'Violet' },
  { value: 'gray',   label: 'Gris' },
] as const;

const ICONS = [
  { value: 'megaphone',      label: '📢 Mégaphone' },
  { value: 'calendar',       label: '📅 Calendrier' },
  { value: 'calendar_days',  label: '📆 Jours' },
  { value: 'calendar_check', label: '✅ Calendar check' },
  { value: 'user_check',     label: '👤 User check' },
  { value: 'chart',          label: '📊 Stat' },
  { value: 'medal',          label: '🏅 Médaille' },
  { value: 'trophy',         label: '🏆 Trophée' },
] as const;

type Mode = { mode: 'create'; initial?: undefined } | { mode: 'edit'; initial: AnnouncementInput & { id: string } };

export function AnnouncementForm(props: Mode) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [kind, setKind] = useState<AnnouncementInput['kind']>(props.initial?.kind ?? 'info');
  const [title, setTitle] = useState(props.initial?.title ?? '');
  const [badgeLabel, setBadgeLabel] = useState(props.initial?.badge_label ?? '');
  const [badgeTone, setBadgeTone] = useState<AnnouncementInput['badge_tone']>(props.initial?.badge_tone ?? 'red');
  const [iconKey, setIconKey] = useState(props.initial?.icon_key ?? 'megaphone');
  const [visible, setVisible] = useState(props.initial?.visible ?? true);
  const [orderIndex, setOrderIndex] = useState<number>(props.initial?.order_index ?? 50);

  // data — édité en JSON brut, avec exemples par kind
  const [dataJson, setDataJson] = useState(() =>
    JSON.stringify(props.initial?.data ?? defaultDataFor(kind), null, 2),
  );

  const onKindChange = (k: AnnouncementInput['kind']) => {
    setKind(k);
    setDataJson(JSON.stringify(defaultDataFor(k), null, 2));
  };

  const submit = () => {
    setError(null);
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(dataJson);
    } catch (e) {
      setError(`JSON du bloc invalide : ${e instanceof Error ? e.message : 'erreur'}`);
      return;
    }
    const payload: AnnouncementInput = {
      kind,
      title: title.trim(),
      badge_label: badgeLabel.trim() ? badgeLabel.trim() : null,
      badge_tone: badgeTone,
      icon_key: iconKey,
      visible,
      order_index: orderIndex,
      data: parsed,
    };
    start(async () => {
      const res = props.mode === 'create'
        ? await createAnnouncement(payload)
        : await updateAnnouncement({ ...payload, id: props.initial.id });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  };

  const remove = () => {
    if (props.mode !== 'edit') return;
    if (!confirm('Supprimer ce bloc ? Cette action est irréversible.')) return;
    start(async () => {
      const res = await deleteAnnouncement(props.initial.id);
      if (!res.ok) setError(res.error);
      else router.refresh();
    });
  };

  return (
    <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5">
      {props.mode === 'create' && (
        <h3 className="mb-4 text-base font-bold text-(--color-ink)">Nouveau bloc</h3>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Type de bloc">
          <select value={kind} onChange={(e) => onKindChange(e.target.value as AnnouncementInput['kind'])} className={inputCls}>
            {KINDS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
          </select>
        </Field>
        <Field label="Ordre d’affichage (plus petit = plus haut)">
          <input type="number" value={orderIndex} onChange={(e) => setOrderIndex(Number(e.target.value) || 0)} className={inputCls} />
        </Field>

        <Field label="Titre" className="sm:col-span-2">
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} placeholder="EVC (PAE) 2027" />
        </Field>

        <Field label="Icône">
          <select value={iconKey} onChange={(e) => setIconKey(e.target.value)} className={inputCls}>
            {ICONS.map((i) => <option key={i.value} value={i.value}>{i.label}</option>)}
          </select>
        </Field>
        <Field label="Couleur de l’accent">
          <select value={badgeTone} onChange={(e) => setBadgeTone(e.target.value as AnnouncementInput['badge_tone'])} className={inputCls}>
            {TONES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </Field>

        <Field label="Badge optionnel (ex : « Ouvertes », « Nouveau »)" className="sm:col-span-2">
          <input value={badgeLabel} onChange={(e) => setBadgeLabel(e.target.value)} className={inputCls} placeholder="Laisser vide pour aucun badge" />
        </Field>

        <Field label="Contenu du bloc (édition JSON)" className="sm:col-span-2">
          <p className="mb-2 text-[11px] text-(--color-ink-muted)">
            Le format dépend du type de bloc choisi. Adapte les valeurs.
            Voir les exemples ci-dessous selon le type.
          </p>
          <textarea
            value={dataJson}
            onChange={(e) => setDataJson(e.target.value)}
            rows={10}
            className={`${inputCls} font-mono text-xs`}
            spellCheck={false}
          />
          <p className="mt-1 text-[11px] text-(--color-ink-muted)">
            {HELP_BY_KIND[kind]}
          </p>
        </Field>

        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} />
          <span>Bloc visible sur l’accueil</span>
        </label>
      </div>

      {error && (
        <p className="mt-3 rounded-lg border border-(--color-danger)/30 bg-red-50 px-3 py-2 text-sm text-(--color-danger)">{error}</p>
      )}

      <div className="mt-5 flex items-center justify-between">
        {props.mode === 'edit' ? (
          <button type="button" onClick={remove} disabled={pending} className="inline-flex items-center gap-2 rounded-lg border border-(--color-danger)/30 px-3 py-2 text-sm font-medium text-(--color-danger) hover:bg-red-50">
            <Trash2 className="h-4 w-4" /> Supprimer
          </button>
        ) : <span />}
        <button type="button" onClick={submit} disabled={pending} className="inline-flex items-center gap-2 rounded-lg bg-(--color-primary) px-4 py-2 text-sm font-bold text-white shadow-sm hover:scale-[1.02] disabled:opacity-60">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : (props.mode === 'create' ? <Plus className="h-4 w-4" /> : <Save className="h-4 w-4" />)}
          {props.mode === 'create' ? 'Créer le bloc' : 'Enregistrer'}
        </button>
      </div>
    </div>
  );
}

/* -------- helpers UI -------- */
const inputCls = 'w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm text-(--color-ink) outline-none transition-colors focus:border-(--color-primary)';

function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-xs font-semibold text-(--color-ink)">{label}</span>
      {children}
    </label>
  );
}

const HELP_BY_KIND: Record<AnnouncementInput['kind'], string> = {
  countdown:
    '{ "target_date": "AAAA-MM-JJ", "suffix_top": "Il vous reste", "suffix_bottom": "avant l’épreuve écrite", "unit": "jours" }',
  event_list:
    '{ "events": [ { "label": "Épreuve écrite", "date": "AAAA-MM-JJ", "icon": "calendar_check" } ] }',
  info:
    '{ "body": "Texte explicatif…", "cta_label": "Bouton optionnel", "cta_href": "https://…", "cta_external": true }',
  stat:
    '{ "value": "1 674", "value_suffix": "postes au total", "sub_stats": [ {"label":"Voie externe","value":"1 374 postes"}, {"label":"Voie interne","value":"300 postes"} ], "footer_note": "Source officielle" }',
  text:
    '{ "body": "Paragraphe libre…" }',
};

function defaultDataFor(kind: AnnouncementInput['kind']): Record<string, unknown> {
  switch (kind) {
    case 'countdown':
      return { target_date: '2027-10-12', suffix_top: 'Il vous reste', suffix_bottom: 'avant l’épreuve écrite', unit: 'jours' };
    case 'event_list':
      return { events: [{ label: 'Épreuve écrite', date: '2027-10-12', icon: 'calendar_check' }] };
    case 'info':
      return { body: '', cta_label: '', cta_href: '', cta_external: true };
    case 'stat':
      return { value: '', value_suffix: '', sub_stats: [{ label: '', value: '' }], footer_note: '' };
    case 'text':
      return { body: '' };
  }
}

/** Petite zone de fermeture pour l'écran de création (utilisée par la page). */
export function CloseCreateLink() {
  const router = useRouter();
  return (
    <button type="button" onClick={() => router.refresh()} className="inline-flex items-center gap-1 text-xs text-(--color-ink-soft) hover:text-(--color-ink)">
      <X className="h-3.5 w-3.5" /> Annuler
    </button>
  );
}
