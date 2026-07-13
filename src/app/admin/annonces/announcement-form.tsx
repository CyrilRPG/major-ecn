'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Save, Trash2, X } from 'lucide-react';
import { createAnnouncement, updateAnnouncement, deleteAnnouncement, type AnnouncementInput } from './actions';

const KINDS = [
  { value: 'countdown',  label: 'Compte à rebours' },
  { value: 'event_list', label: 'Liste d’événements' },
  { value: 'info',       label: 'Bloc d’information' },
  { value: 'stat',       label: 'Statistique' },
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

type Mode =
  | { mode: 'create'; initial?: undefined; colleges?: { id: string; nom: string }[] }
  | { mode: 'edit';   initial: AnnouncementInput & { id: string }; colleges?: { id: string; nom: string }[] };

type Event = { label: string; date: string; icon?: string };
type SubStat = { label: string; value: string };
type AnnData = Record<string, unknown>;

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

  // Champs structurés par kind, dans un seul objet
  const [data, setData] = useState<AnnData>(() => (props.initial?.data ?? defaultDataFor(kind)) as AnnData);

  // Audience permissions
  const [minOffer, setMinOffer] = useState<string>((props.initial?.min_offer as string | undefined) ?? '');
  const [targetScope, setTargetScope] = useState<'all' | 'full' | 'college'>(
    (props.initial?.target_scope as 'all' | 'full' | 'college' | undefined) ?? 'all',
  );
  const [targetColleges, setTargetColleges] = useState<Set<string>>(
    new Set(props.initial?.target_colleges ?? []),
  );
  // Ciblage par voie de concours (interne / externe). Défaut = les deux.
  const [voies, setVoies] = useState<Set<'interne' | 'externe'>>(
    new Set((props.initial?.voies as ('interne' | 'externe')[] | undefined) ?? ['interne', 'externe']),
  );
  const toggleVoie = (v: 'interne' | 'externe') =>
    setVoies((prev) => {
      const n = new Set(prev);
      if (n.has(v)) n.delete(v); else n.add(v);
      return n;
    });

  const onKindChange = (k: AnnouncementInput['kind']) => {
    setKind(k);
    setData(defaultDataFor(k) as AnnData);
  };

  const submit = () => {
    setError(null);
    const payload: AnnouncementInput = {
      kind,
      title: title.trim(),
      badge_label: badgeLabel.trim() ? badgeLabel.trim() : null,
      badge_tone: badgeTone,
      icon_key: iconKey,
      visible,
      order_index: orderIndex,
      data,
      min_offer: minOffer ? (minOffer as 'essentiel' | 'intensif' | 'approfondi') : null,
      target_scope: targetScope,
      target_colleges: targetScope === 'college' ? Array.from(targetColleges) : [],
      // Une sélection vide équivaut à « toutes les voies » côté rendu.
      voies: voies.size > 0 ? Array.from(voies) : ['interne', 'externe'],
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
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} placeholder="EVC (PAE) 2026" />
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

        {/* ============ Champs spécifiques au kind ============ */}
        <div className="sm:col-span-2 rounded-xl border border-dashed border-(--color-border) bg-(--color-sand-100)/40 p-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-(--color-ink-muted)">
            Contenu du bloc
          </p>
          {kind === 'countdown'  && <CountdownFields data={data} setData={setData} />}
          {kind === 'event_list' && <EventListFields data={data} setData={setData} />}
          {kind === 'info'       && <InfoFields data={data} setData={setData} />}
          {kind === 'stat'       && <StatFields data={data} setData={setData} />}
          {kind === 'text'       && <TextFields data={data} setData={setData} />}
        </div>

        {/* ============ Audience ============ */}
        <div className="sm:col-span-2 rounded-xl border border-dashed border-(--color-border) bg-(--color-primary-soft)/10 p-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-(--color-ink-muted)">
            Qui voit ce bloc ?
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Offre minimale requise">
              <select value={minOffer} onChange={(e) => setMinOffer(e.target.value)} className={inputCls}>
                <option value="">Toutes les offres</option>
                <option value="essentiel">Essentiel ou +</option>
                <option value="intensif">Intensif ou +</option>
                <option value="approfondi">Approfondi uniquement</option>
              </select>
            </Field>
            <Field label="Périmètre">
              <select value={targetScope} onChange={(e) => setTargetScope(e.target.value as 'all'|'full'|'college')} className={inputCls}>
                <option value="all">Tout le monde (par défaut)</option>
                <option value="full">Uniquement offre complète (toutes spécialités)</option>
                <option value="college">Élèves ayant un collège donné</option>
              </select>
            </Field>
          </div>

          {/* Ciblage par voie de concours */}
          <div className="mt-3">
            <p className="mb-2 text-xs font-bold text-(--color-ink)">Voie de concours ciblée</p>
            <div className="flex flex-wrap gap-2">
              {([
                { value: 'interne', label: 'Voie interne' },
                { value: 'externe', label: 'Voie externe' },
              ] as const).map((opt) => (
                <label
                  key={opt.value}
                  className="flex cursor-pointer items-center gap-2 rounded-md border border-(--color-border) bg-white px-3 py-1.5 text-xs has-[:checked]:border-(--color-primary) has-[:checked]:bg-(--color-primary-soft)/40"
                >
                  <input
                    type="checkbox"
                    checked={voies.has(opt.value)}
                    onChange={() => toggleVoie(opt.value)}
                    className="h-3.5 w-3.5"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
            <p className="mt-1 text-[11px] text-(--color-ink-muted)">
              Les deux cochées (ou aucune) = visible par toutes les voies.
            </p>
          </div>
          {targetScope === 'college' && (
            <div className="mt-3">
              <p className="mb-2 text-xs font-bold text-(--color-ink)">Collèges ciblés (au moins un)</p>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                {(props.colleges ?? []).map((c) => {
                  const checked = targetColleges.has(c.id);
                  return (
                    <label key={c.id} className="flex cursor-pointer items-center gap-2 rounded-md border border-(--color-border) bg-white px-2 py-1.5 text-xs has-[:checked]:border-(--color-primary) has-[:checked]:bg-(--color-primary-soft)/40">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => setTargetColleges((prev) => {
                          const n = new Set(prev);
                          if (n.has(c.id)) n.delete(c.id); else n.add(c.id);
                          return n;
                        })}
                        className="h-3.5 w-3.5"
                      />
                      <span className="truncate">{c.nom}</span>
                    </label>
                  );
                })}
              </div>
              {(props.colleges ?? []).length === 0 && (
                <p className="text-xs text-(--color-ink-muted)">Aucun collège disponible.</p>
              )}
            </div>
          )}
        </div>

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

/* ============ Champs spécifiques par kind ============ */
function CountdownFields({ data, setData }: { data: AnnData; setData: (d: AnnData) => void }) {
  const d = data as { target_date?: string; suffix_top?: string; suffix_bottom?: string; unit?: string };
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label="Date cible (jj/mm/aaaa)">
        <input type="date" value={d.target_date ?? ''} onChange={(e) => setData({ ...data, target_date: e.target.value })} className={inputCls} />
      </Field>
      <Field label="Unité affichée">
        <input value={d.unit ?? 'jours'} onChange={(e) => setData({ ...data, unit: e.target.value })} className={inputCls} placeholder="jours" />
      </Field>
      <Field label="Texte au-dessus du compteur">
        <input value={d.suffix_top ?? ''} onChange={(e) => setData({ ...data, suffix_top: e.target.value })} className={inputCls} placeholder="Il vous reste" />
      </Field>
      <Field label="Texte en-dessous du compteur">
        <input value={d.suffix_bottom ?? ''} onChange={(e) => setData({ ...data, suffix_bottom: e.target.value })} className={inputCls} placeholder="avant l’épreuve écrite" />
      </Field>
    </div>
  );
}

function EventListFields({ data, setData }: { data: AnnData; setData: (d: AnnData) => void }) {
  const events = ((data as { events?: Event[] }).events ?? []) as Event[];
  const update = (i: number, patch: Partial<Event>) => {
    const next = [...events];
    next[i] = { ...next[i], ...patch };
    setData({ ...data, events: next });
  };
  const add = () => setData({ ...data, events: [...events, { label: '', date: '', icon: 'calendar_check' }] });
  const remove = (i: number) => setData({ ...data, events: events.filter((_, j) => j !== i) });
  return (
    <div className="space-y-2">
      {events.map((ev, i) => (
        <div key={i} className="grid items-end gap-2 rounded-md border border-(--color-border) bg-white p-2 sm:grid-cols-[1fr_auto_auto_auto]">
          <input value={ev.label} onChange={(e) => update(i, { label: e.target.value })} placeholder="Libellé (ex. Épreuve écrite)" className={inputCls} />
          <input type="date" value={ev.date} onChange={(e) => update(i, { date: e.target.value })} className={inputCls} />
          <select value={ev.icon ?? 'calendar_check'} onChange={(e) => update(i, { icon: e.target.value })} className={inputCls}>
            <option value="calendar_check">✅</option>
            <option value="medal">🏅</option>
            <option value="trophy">🏆</option>
            <option value="calendar">📅</option>
          </select>
          <button type="button" onClick={() => remove(i)} className="rounded-md border border-(--color-danger)/30 px-2 py-2 text-(--color-danger) hover:bg-red-50">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button type="button" onClick={add} className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-(--color-border) bg-white px-3 py-1.5 text-xs font-bold text-(--color-ink-soft) hover:bg-(--color-sand-100)">
        <Plus className="h-3.5 w-3.5" /> Ajouter un événement
      </button>
    </div>
  );
}

function InfoFields({ data, setData }: { data: AnnData; setData: (d: AnnData) => void }) {
  const d = data as { body?: string; cta_label?: string; cta_href?: string; cta_external?: boolean };
  return (
    <div className="grid gap-3">
      <Field label="Texte du bloc">
        <textarea rows={4} value={d.body ?? ''} onChange={(e) => setData({ ...data, body: e.target.value })} className={inputCls} placeholder="Texte explicatif..." />
      </Field>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Bouton — libellé">
          <input value={d.cta_label ?? ''} onChange={(e) => setData({ ...data, cta_label: e.target.value })} className={inputCls} placeholder="Accéder à..." />
        </Field>
        <Field label="Bouton — lien" className="sm:col-span-2">
          <input value={d.cta_href ?? ''} onChange={(e) => setData({ ...data, cta_href: e.target.value })} className={inputCls} placeholder="https://..." />
        </Field>
      </div>
      <label className="flex items-center gap-2 text-xs">
        <input type="checkbox" checked={d.cta_external ?? true} onChange={(e) => setData({ ...data, cta_external: e.target.checked })} />
        Ouvrir le lien dans un nouvel onglet (lien externe)
      </label>
    </div>
  );
}

function StatFields({ data, setData }: { data: AnnData; setData: (d: AnnData) => void }) {
  const d = data as { value?: string; value_suffix?: string; sub_stats?: SubStat[]; footer_note?: string };
  const subs = d.sub_stats ?? [];
  const update = (i: number, patch: Partial<SubStat>) => {
    const next = [...subs];
    next[i] = { ...next[i], ...patch };
    setData({ ...data, sub_stats: next });
  };
  const add = () => setData({ ...data, sub_stats: [...subs, { label: '', value: '' }] });
  const remove = (i: number) => setData({ ...data, sub_stats: subs.filter((_, j) => j !== i) });
  return (
    <div className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Chiffre principal">
          <input value={d.value ?? ''} onChange={(e) => setData({ ...data, value: e.target.value })} className={inputCls} placeholder="1 674" />
        </Field>
        <Field label="Suffixe (sous le chiffre)">
          <input value={d.value_suffix ?? ''} onChange={(e) => setData({ ...data, value_suffix: e.target.value })} className={inputCls} placeholder="postes au total" />
        </Field>
      </div>
      <div>
        <p className="mb-1.5 text-xs font-bold text-(--color-ink)">Sous-statistiques</p>
        <div className="space-y-2">
          {subs.map((s, i) => (
            <div key={i} className="grid items-end gap-2 rounded-md border border-(--color-border) bg-white p-2 sm:grid-cols-[1fr_1fr_auto]">
              <input value={s.label} onChange={(e) => update(i, { label: e.target.value })} placeholder="Libellé (ex. Voie externe)" className={inputCls} />
              <input value={s.value} onChange={(e) => update(i, { value: e.target.value })} placeholder="Valeur (ex. 1 374 postes)" className={inputCls} />
              <button type="button" onClick={() => remove(i)} className="rounded-md border border-(--color-danger)/30 px-2 py-2 text-(--color-danger) hover:bg-red-50">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button type="button" onClick={add} className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-(--color-border) bg-white px-3 py-1.5 text-xs font-bold text-(--color-ink-soft) hover:bg-(--color-sand-100)">
            <Plus className="h-3.5 w-3.5" /> Ajouter une sous-stat
          </button>
        </div>
      </div>
      <Field label="Note en bas (optionnelle)">
        <input value={d.footer_note ?? ''} onChange={(e) => setData({ ...data, footer_note: e.target.value })} className={inputCls} placeholder="Source officielle..." />
      </Field>
    </div>
  );
}

function TextFields({ data, setData }: { data: AnnData; setData: (d: AnnData) => void }) {
  const d = data as { body?: string };
  return (
    <Field label="Texte">
      <textarea rows={5} value={d.body ?? ''} onChange={(e) => setData({ ...data, body: e.target.value })} className={inputCls} placeholder="Paragraphe libre..." />
    </Field>
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

function defaultDataFor(kind: AnnouncementInput['kind']): Record<string, unknown> {
  switch (kind) {
    case 'countdown':
      return { target_date: '2026-10-12', suffix_top: 'Il vous reste', suffix_bottom: 'avant l’épreuve écrite', unit: 'jours' };
    case 'event_list':
      return { events: [{ label: 'Épreuve écrite', date: '2026-10-12', icon: 'calendar_check' }] };
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
