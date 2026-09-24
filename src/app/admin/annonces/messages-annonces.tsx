'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Eye, EyeOff, Loader2, Megaphone, MoveDown, MoveUp, Plus, Save, Trash2 } from 'lucide-react';
import { basculerVisibilite, creerMessage, deplacerMessage, modifierMessage, supprimerBloc, type MessageInputT } from './actions';
import { ChoixSpecialites, inputCls, type Specialite } from './fiches-concours';

export type LigneMessage = {
  id: string;
  title: string;
  badge_label: string | null;
  badge_tone: string | null;
  icon_key: string | null;
  visible: boolean;
  data: Record<string, unknown>;
  min_offer: string | null;
  target_scope: string | null;
  target_colleges: string[] | null;
  voies: string[] | null;
};

const labelCls = 'mb-1 block text-[11px] font-bold uppercase tracking-wider text-(--color-ink-muted)';

const TONS = [
  { value: 'red', label: 'Rouge', c: '#A91D2C' },
  { value: 'blue', label: 'Bleu', c: '#1E40AF' },
  { value: 'orange', label: 'Orange', c: '#B45B00' },
  { value: 'purple', label: 'Violet', c: '#6D28D9' },
  { value: 'gray', label: 'Gris', c: '#5B6478' },
] as const;

const ICONES = [
  { value: 'megaphone', label: '📢 Annonce' },
  { value: 'bell', label: '🔔 Rappel' },
  { value: 'info', label: 'ℹ️ Information' },
  { value: 'calendar', label: '📅 Date' },
  { value: 'user_check', label: '👤 Compte / inscription' },
  { value: 'trophy', label: '🏆 Résultat' },
  { value: 'chart', label: '📊 Chiffre' },
] as const;

const FORMULES = [
  { value: '', label: 'Toutes les formules (découverte comprise)' },
  { value: 'essentiel', label: 'Essentielle et au-dessus' },
  { value: 'intensif', label: 'Intensive et au-dessus' },
  { value: 'approfondi', label: 'Approfondie uniquement' },
] as const;

/** Phrase lisible : qui voit ce message ? */
export function resumeAudience(m: Pick<LigneMessage, 'target_scope' | 'target_colleges' | 'voies' | 'min_offer' | 'data'>, nomDe: Map<string, string>): string {
  const parts: string[] = [];
  const ts = m.target_scope ?? 'all';
  if (ts === 'full') parts.push('Élèves en accès intégral');
  else if (ts === 'college' && (m.target_colleges ?? []).length > 0) {
    const noms = (m.target_colleges ?? []).map((id) => nomDe.get(id) ?? id);
    parts.push(noms.length > 3 ? `${noms.slice(0, 3).join(', ')} +${noms.length - 3}` : noms.join(', '));
  } else parts.push('Tous les élèves');
  const vs = m.voies ?? [];
  if (vs.length === 1) parts.push(vs[0] === 'interne' ? 'voie interne' : 'voie externe');
  if (m.min_offer) parts.push(FORMULES.find((f) => f.value === m.min_offer)?.label.toLowerCase() ?? m.min_offer);
  const fin = m.data?.fin_affichage;
  if (typeof fin === 'string' && fin) parts.push(`jusqu’au ${new Date(`${fin}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`);
  return parts.join(' · ');
}

function MessageForm({ initial, specialites, onFermer }: { initial?: LigneMessage; specialites: Specialite[]; onFermer: () => void }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const d = (initial?.data ?? {}) as Record<string, string | undefined>;
  const [title, setTitle] = useState(initial?.title ?? '');
  const [subtitle, setSubtitle] = useState(d.subtitle ?? '');
  const [body, setBody] = useState(d.body ?? '');
  const [ctaLabel, setCtaLabel] = useState(d.cta_label ?? '');
  const [ctaHref, setCtaHref] = useState(d.cta_href ?? '');
  const [note, setNote] = useState(d.footer_note ?? '');
  const [fin, setFin] = useState(d.fin_affichage ?? '');
  const [badge, setBadge] = useState(initial?.badge_label ?? '');
  const [tone, setTone] = useState(initial?.badge_tone === 'green' ? 'blue' : (initial?.badge_tone ?? 'red'));
  const [icon, setIcon] = useState(initial?.icon_key ?? 'megaphone');
  const [audience, setAudience] = useState<'all' | 'full' | 'college'>(
    initial?.target_scope === 'full' ? 'full' : initial?.target_scope === 'college' && (initial.target_colleges ?? []).length > 0 ? 'college' : 'all',
  );
  const [colleges, setColleges] = useState<string[]>(initial?.target_colleges ?? []);
  const [voies, setVoies] = useState<string[]>(initial?.voies?.length ? initial.voies : ['interne', 'externe']);
  const [minOffer, setMinOffer] = useState(initial?.min_offer ?? '');

  const submit = () => {
    setError(null);
    const payload: MessageInputT = {
      title,
      badge_label: badge || null,
      badge_tone: tone as MessageInputT['badge_tone'],
      icon_key: icon,
      visible: initial?.visible ?? true,
      data: { subtitle, body, cta_label: ctaLabel, cta_href: ctaHref, footer_note: note, fin_affichage: fin },
      min_offer: (minOffer || null) as MessageInputT['min_offer'],
      target_scope: audience,
      target_colleges: audience === 'college' ? colleges : [],
      voies: voies as ('interne' | 'externe')[],
    };
    start(async () => {
      const r = initial ? await modifierMessage(initial.id, payload) : await creerMessage(payload);
      if (!r.ok) { setError(r.error); return; }
      router.refresh();
      onFermer();
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className={labelCls}>Titre</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} placeholder="ex. Inscriptions au CNG" />
        </label>
        <label className="block">
          <span className={labelCls}>Sous-titre (facultatif)</span>
          <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className={inputCls} />
        </label>
        <label className="block">
          <span className={labelCls}>Pastille (facultatif)</span>
          <input value={badge} onChange={(e) => setBadge(e.target.value)} className={inputCls} placeholder="ex. Nouveau" />
        </label>
        <label className="block sm:col-span-2">
          <span className={labelCls}>Texte</span>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} className={inputCls} />
        </label>
        <label className="block">
          <span className={labelCls}>Bouton — libellé (facultatif)</span>
          <input value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} className={inputCls} />
        </label>
        <label className="block">
          <span className={labelCls}>Bouton — lien</span>
          <input value={ctaHref} onChange={(e) => setCtaHref(e.target.value)} className={inputCls} placeholder="https://… ou /page" />
        </label>
        <label className="block sm:col-span-2">
          <span className={labelCls}>Encadré en bas (facultatif)</span>
          <input value={note} onChange={(e) => setNote(e.target.value)} className={inputCls} />
        </label>
        <label className="block">
          <span className={labelCls}>Icône</span>
          <select value={icon} onChange={(e) => setIcon(e.target.value)} className={inputCls}>
            {ICONES.map((i) => <option key={i.value} value={i.value}>{i.label}</option>)}
          </select>
        </label>
        <div>
          <span className={labelCls}>Couleur</span>
          <div className="flex gap-2">
            {TONS.map((t) => (
              <button key={t.value} type="button" onClick={() => setTone(t.value)} aria-label={t.label} title={t.label}
                className={`h-8 w-8 rounded-full ring-offset-2 ${tone === t.value ? 'ring-2 ring-(--color-ink)' : ''}`} style={{ background: t.c }} />
            ))}
          </div>
        </div>
      </div>

      <fieldset className="space-y-3 rounded-xl border border-(--color-border) bg-(--color-sand-100)/30 p-3">
        <legend className="px-1 text-[11px] font-bold uppercase tracking-wider text-(--color-ink-muted)">Qui voit ce message ?</legend>
        <div className="flex flex-wrap gap-2">
          {([['all', 'Tous les élèves'], ['college', 'Certaines spécialités'], ['full', 'Accès intégral seulement']] as const).map(([v, l]) => (
            <button key={v} type="button" onClick={() => setAudience(v)}
              className={`rounded-full border px-3 py-1 text-xs font-bold ${audience === v ? 'border-(--color-primary) bg-(--color-primary) text-white' : 'border-(--color-border) text-(--color-ink-soft)'}`}>
              {l}
            </button>
          ))}
        </div>
        {audience === 'college' && <ChoixSpecialites specialites={specialites} selection={colleges} onChange={setColleges} />}
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <span className={labelCls}>Voie</span>
            <div className="flex gap-3 text-sm">
              {(['externe', 'interne'] as const).map((v) => (
                <label key={v} className="flex items-center gap-1.5">
                  <input type="checkbox" checked={voies.includes(v)} onChange={() => setVoies((x) => (x.includes(v) ? (x.length > 1 ? x.filter((y) => y !== v) : x) : [...x, v]))} />
                  {v === 'externe' ? 'Externe' : 'Interne'}
                </label>
              ))}
            </div>
          </div>
          <label className="block">
            <span className={labelCls}>Formule</span>
            <select value={minOffer} onChange={(e) => setMinOffer(e.target.value)} className={inputCls}>
              {FORMULES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </label>
          <label className="block">
            <span className={labelCls}>Afficher jusqu’au (facultatif)</span>
            <input type="date" value={fin} onChange={(e) => setFin(e.target.value)} className={inputCls} />
          </label>
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center justify-end gap-3">
        {error && <span className="text-xs font-bold text-[#B91C1C]">{error}</span>}
        <button type="button" onClick={onFermer} className="rounded-lg px-3 py-2 text-sm font-semibold text-(--color-ink-soft) hover:bg-(--color-sand-100)">Annuler</button>
        <button type="button" disabled={pending} onClick={submit} className="inline-flex items-center gap-2 rounded-lg bg-(--color-primary) px-4 py-2 text-sm font-bold text-white shadow-sm disabled:opacity-60">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {initial ? 'Enregistrer' : 'Publier le message'}
        </button>
      </div>
    </div>
  );
}

export function MessagesAnnonces({ messages, specialites }: { messages: LigneMessage[]; specialites: Specialite[] }) {
  const router = useRouter();
  const [ouvert, setOuvert] = useState<string | null>(null);
  const [creation, setCreation] = useState(false);
  const [pending, start] = useTransition();
  const nomDe = new Map(specialites.map((s) => [s.id, s.nom]));

  const agir = (fn: () => Promise<{ ok: boolean; error?: string }>) => start(async () => {
    const r = await fn();
    if (!r.ok && r.error) alert(r.error);
    router.refresh();
  });

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold text-(--color-ink)">
            <Megaphone className="h-4 w-4 text-(--color-primary)" /> Messages
            <span className="rounded-full bg-(--color-sand-100) px-2 py-0.5 text-[11px] font-bold text-(--color-ink-soft)">{messages.length}</span>
          </h2>
          <p className="mt-0.5 max-w-2xl text-xs text-(--color-ink-muted)">
            Informations ponctuelles (lien CNG, rappel, nouveauté…), affichées sous la carte concours, pour le public choisi.
          </p>
        </div>
        <button type="button" onClick={() => { setCreation(true); setOuvert(null); }} className="inline-flex items-center gap-2 rounded-lg border border-(--color-primary) px-3 py-2 text-sm font-bold text-(--color-primary)">
          <Plus className="h-4 w-4" /> Nouveau message
        </button>
      </div>

      {creation && (
        <div className="rounded-2xl border-2 border-(--color-primary)/30 bg-(--color-surface) p-4">
          <MessageForm specialites={specialites} onFermer={() => setCreation(false)} />
        </div>
      )}

      {messages.length === 0 && !creation && (
        <p className="rounded-2xl border border-dashed border-(--color-border) px-4 py-6 text-center text-sm text-(--color-ink-soft)">Aucun message.</p>
      )}

      {messages.map((m, i) => {
        const open = ouvert === m.id;
        return (
          <div key={m.id} className={`rounded-2xl border border-(--color-border) bg-(--color-surface) ${m.visible ? '' : 'opacity-70'}`}>
            <div className="flex items-center gap-2 px-4 py-3">
              <button type="button" onClick={() => { setOuvert(open ? null : m.id); setCreation(false); }} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                <ChevronRight className={`h-4 w-4 shrink-0 text-(--color-ink-soft) transition-transform ${open ? 'rotate-90' : ''}`} />
                <span className="min-w-0">
                  <span className="flex items-center gap-2 truncate text-sm font-bold text-(--color-ink)">
                    {m.title}
                    {!m.visible && <span className="rounded-full bg-(--color-sand-100) px-2 py-0.5 text-[10px] font-medium text-(--color-ink-muted)">Masqué</span>}
                  </span>
                  <span className="block truncate text-[11px] text-(--color-ink-muted)">{resumeAudience(m, nomDe)}</span>
                </span>
              </button>
              <button type="button" disabled={pending || i === 0} onClick={() => agir(() => deplacerMessage(m.id, 'up'))} className="rounded-md p-1.5 text-(--color-ink-soft) hover:bg-(--color-sand-100) disabled:opacity-30" aria-label="Monter"><MoveUp className="h-4 w-4" /></button>
              <button type="button" disabled={pending || i === messages.length - 1} onClick={() => agir(() => deplacerMessage(m.id, 'down'))} className="rounded-md p-1.5 text-(--color-ink-soft) hover:bg-(--color-sand-100) disabled:opacity-30" aria-label="Descendre"><MoveDown className="h-4 w-4" /></button>
              <button type="button" disabled={pending} onClick={() => agir(() => basculerVisibilite(m.id, !m.visible))} className="rounded-md p-1.5 text-(--color-ink-soft) hover:bg-(--color-sand-100)" aria-label={m.visible ? 'Masquer' : 'Afficher'}>
                {m.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
              <button type="button" disabled={pending} onClick={() => { if (confirm(`Supprimer « ${m.title} » ?`)) agir(() => supprimerBloc(m.id)); }} className="rounded-md p-1.5 text-(--color-ink-soft) hover:bg-(--color-sand-100)" aria-label="Supprimer"><Trash2 className="h-4 w-4" /></button>
            </div>
            {open && (
              <div className="border-t border-(--color-border) p-4">
                <MessageForm initial={m} specialites={specialites} onFermer={() => setOuvert(null)} />
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}
