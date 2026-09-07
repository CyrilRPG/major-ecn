'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Copy, Loader2, Plus, Power, PowerOff, Ticket } from 'lucide-react';
import {
  createPromoCodeAction,
  togglePromoCodeAction,
} from '@/app/admin/codes-promo/actions';
import type { PromoCodeRow, PromoCodeStatus } from '@/lib/stripe/promo-codes';

/**
 * Une offre vendable, décrite par les trois facettes qui séparent réellement
 * deux produits Stripe : la formule, et — pour le Programme Approfondi — la
 * spécialité et le niveau. Ce sont les seuls axes sur lesquels un coupon peut
 * être restreint (`coupon.applies_to.products`).
 */
export type OfferOption = {
  key: string;
  label: string;
  amountEuros: number;
  formule: string;
  formuleLabel: string;
  specialtyKey: string | null;
  specialtyName: string | null;
  tier: 'base' | 'plus' | null;
  tierLabel: string | null;
};

const inputClass =
  'w-full rounded-lg border border-(--color-border) bg-white px-3 py-2 text-sm';
const labelClass = 'mb-1 block text-xs font-semibold text-(--color-ink-soft)';

const STATUS_STYLE: Record<PromoCodeStatus, { label: string; className: string }> = {
  actif: { label: 'Actif', className: 'bg-green-100 text-green-700' },
  programme: { label: 'Programmé', className: 'bg-blue-100 text-blue-700' },
  inactif: { label: 'Inactif', className: 'bg-(--color-sand-100) text-(--color-ink-soft)' },
  expire: { label: 'Expiré', className: 'bg-(--color-sand-100) text-(--color-ink-muted)' },
  epuise: { label: 'Épuisé', className: 'bg-amber-100 text-amber-800' },
};

const euros = (n: number) =>
  n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const pourcent = (n: number) =>
  n.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

/** Libellé de la remise d'un code : pourcentage du prix ou montant en euros. */
function remiseLabel(c: PromoCodeRow): string {
  if (c.percentOff !== null) return `−${pourcent(c.percentOff)} %`;
  if (c.amountEuros !== null) return `−${euros(c.amountEuros)} €`;
  return 'remise illisible';
}

const day = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : null;

/**
 * Boutons de périmètre — sélection MULTIPLE.
 *
 * Un bouton « Toutes … » qui vide la sélection, puis un bouton par valeur qui
 * s'ajoute ou se retire. Le choix était unique jusqu'au 07/09/2026 : on ne
 * pouvait viser qu'une seule formule ou les trois, jamais deux.
 */
function FacetButtons({
  legend,
  hint,
  options,
  values,
  onToggle,
  onClear,
  allLabel,
}: {
  legend: string;
  hint?: string;
  options: { value: string; label: string }[];
  /** Vide = aucune restriction sur cette facette. */
  values: string[];
  onToggle: (v: string) => void;
  onClear: () => void;
  allLabel: string;
}) {
  const aucune = values.length === 0;
  return (
    <div>
      <p className="mb-1 text-xs font-semibold text-(--color-ink-soft)">{legend}</p>
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={onClear}
          aria-pressed={aucune}
          className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
            aucune
              ? 'border-(--color-primary) bg-(--color-primary) text-white'
              : 'border-(--color-border) bg-white text-(--color-ink-soft) hover:border-(--color-primary) hover:text-(--color-ink)'
          }`}
        >
          {allLabel}
        </button>
        {options.map((o) => {
          const on = values.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onToggle(o.value)}
              aria-pressed={on}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                on
                  ? 'border-(--color-primary) bg-(--color-primary) text-white'
                  : 'border-(--color-border) bg-white text-(--color-ink-soft) hover:border-(--color-primary) hover:text-(--color-ink)'
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
      <p className="mt-1 text-[11px] text-(--color-ink-muted)">
        {hint ? `${hint} ` : ''}
        Plusieurs choix possibles ; aucun sélectionné = aucune restriction.
      </p>
    </div>
  );
}

export function PromoCodesManager({
  offers,
  codes,
}: {
  offers: OfferOption[];
  codes: PromoCodeRow[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [code, setCode] = useState('');
  const [amount, setAmount] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [maxRedemptions, setMaxRedemptions] = useState('');
  const [active, setActive] = useState(true);

  // Périmètre : trois facettes, `null` = « toutes ». Aucune facette choisie =
  // code valable sur toutes les formations (aucun `applies_to` côté Stripe).
  /* Sélection MULTIPLE sur chaque facette : un tableau vide = aucune
     restriction. On peut donc viser « Essentielle + Intensive » sans emporter
     le Programme Approfondi, ce que le choix unique interdisait. */
  const [formules, setFormules] = useState<string[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [tiers, setTiers] = useState<string[]>([]);
  /** Inclure les formules qu'un produit Stripe unique empêche de rattacher à
   *  une spécialité (Essentielle, Intensive…). Vrai par défaut : « toutes les
   *  formules, spécialité X » est la demande courante, et l'écran dit alors
   *  exactement ce que le code couvrira en plus. */
  const [inclureNonDistinguables, setInclureNonDistinguables] = useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  /** Offres couvertes en plus de celles demandées (produits Stripe partagés) :
   *  la création attend une confirmation explicite. */
  const [alsoCovered, setAlsoCovered] = useState<string[] | null>(null);

  /** Unité de la remise : pourcentage du prix, ou montant fixe en euros. */
  const [unite, setUnite] = useState<'pourcentage' | 'euros'>('pourcentage');
  const remise = Number(amount.replace(',', '.'));
  const remiseValide =
    Number.isFinite(remise) && remise > 0 && (unite === 'euros' || remise <= 100);
  /** Prix payé après remise, pour l'aperçu par formation. */
  const apresRemise = (prix: number) =>
    unite === 'pourcentage' ? prix * (1 - remise / 100) : Math.max(0, prix - remise);

  /* ─────────────── Facettes disponibles ─────────────── */
  /* Les trois facettes sont INDÉPENDANTES : choisir une spécialité ne doit pas
     retirer d'autorité les formules Essentielle et Intensive du périmètre.
     Elles se croisaient jusqu'au 07/09/2026, si bien que cocher « Gériatrie »
     ramenait le code au seul Programme Approfondi, et choisir « Essentielle »
     faisait disparaître la liste des spécialités. */

  const formuleOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const o of offers) if (!seen.has(o.formule)) seen.set(o.formule, o.formuleLabel);
    return [...seen].map(([value, label]) => ({ value, label }));
  }, [offers]);

  const specialtyOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const o of offers) {
      if (o.specialtyKey && o.specialtyName && !seen.has(o.specialtyKey)) {
        seen.set(o.specialtyKey, o.specialtyName);
      }
    }
    return [...seen].map(([value, label]) => ({ value, label }));
  }, [offers]);

  const tierOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const o of offers) {
      if (o.tier && o.tierLabel && !seen.has(o.tier)) seen.set(o.tier, o.tierLabel);
    }
    return [...seen].map(([value, label]) => ({ value, label }));
  }, [offers]);

  /**
   * Une offre est « distinguable » quand le périmètre demandé porte sur une
   * dimension que SON produit Stripe sépare réellement. La Formule Essentielle
   * est vendue au même prix pour toutes les spécialités : un seul produit
   * Stripe, sur lequel « Gériatrie » ne veut rien dire. Restreindre un coupon à
   * ce produit le rend valable pour toutes les spécialités — c'est un fait
   * Stripe, pas un choix de notre part.
   */
  function estDistinguable(o: OfferOption): boolean {
    if (specialties.length > 0 && o.specialtyKey === null) return false;
    if (tiers.length > 0 && o.tier === null) return false;
    return true;
  }

  /** Offres des formules choisies que la spécialité / le niveau ne peut pas
   *  départager : incluses seulement si l'admin l'accepte. */
  const nonDistinguables = useMemo(
    () =>
      offers.filter(
        (o) => (formules.length === 0 || formules.includes(o.formule)) && !estDistinguable(o),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [offers, formules, specialties, tiers],
  );

  /** Offres retenues par le périmètre courant. */
  const matched = useMemo(
    () =>
      offers.filter((o) => {
        if (formules.length > 0 && !formules.includes(o.formule)) return false;
        if (!estDistinguable(o)) return inclureNonDistinguables;
        if (specialties.length > 0 && !specialties.includes(o.specialtyKey ?? '')) return false;
        if (tiers.length > 0 && !tiers.includes(o.tier ?? '')) return false;
        return true;
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [offers, formules, specialties, tiers, inclureNonDistinguables],
  );

  /** Offres effectivement retenues qui resteront valables hors du périmètre. */
  const elargies = useMemo(
    () => matched.filter((o) => !estDistinguable(o)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [matched, specialties, tiers],
  );

  const allOffers = formules.length === 0 && specialties.length === 0 && tiers.length === 0;

  /** Ajoute ou retire une valeur d'une facette. */
  function bascule(setter: (f: (v: string[]) => string[]) => void, valeur: string) {
    setter((liste) => (liste.includes(valeur) ? liste.filter((x) => x !== valeur) : [...liste, valeur]));
  }

  function reset() {
    setCode('');
    setAmount('');
    setStartsAt('');
    setExpiresAt('');
    setMaxRedemptions('');
    setFormules([]);
    setSpecialties([]);
    setTiers([]);
    setInclureNonDistinguables(true);
    setActive(true);
    setAlsoCovered(null);
  }

  async function submit(confirmBroaderScope = false) {
    setError(null);
    setSuccess(null);
    if (!allOffers && matched.length === 0) {
      setError('Aucune formation ne correspond à ce périmètre.');
      return;
    }
    setSaving(true);
    const r = await createPromoCodeAction({
      code,
      percentOff: unite === 'pourcentage' ? remise : null,
      amountEuros: unite === 'euros' ? remise : null,
      startsAt,
      expiresAt,
      maxRedemptions: maxRedemptions.trim() ? Number(maxRedemptions) : null,
      offers: allOffers ? [] : matched.map((o) => o.key),
      active,
      confirmBroaderScope,
    });
    setSaving(false);
    if (!r.ok) {
      setError(r.error ?? 'Erreur');
      setAlsoCovered(r.alsoCovered ?? null);
      return;
    }
    setSuccess(`Code « ${r.code} » créé.`);
    reset();
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* ─────────────── Création ─────────────── */}
      <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-soft)">
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-(--color-ink-muted)">
          Nouveau code de réduction
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className={labelClass}>Code saisi par le candidat</span>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="RENTREE2026"
              className={`${inputClass} font-mono tracking-wide`}
            />
            <span className="mt-1 block text-[11px] text-(--color-ink-muted)">
              Majuscules, chiffres, tiret ou souligné. 3 à 40 caractères.
            </span>
          </label>

          <div className="block">
            <span className={labelClass}>Réduction</span>
            <div className="flex gap-2">
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputMode="decimal"
                placeholder={unite === 'pourcentage' ? '10' : '400'}
                aria-label={unite === 'pourcentage' ? 'Réduction en pourcentage du prix' : 'Réduction en euros'}
                className={inputClass}
              />
              <div className="flex shrink-0 overflow-hidden rounded-lg border border-(--color-border)">
                {(['pourcentage', 'euros'] as const).map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setUnite(u)}
                    aria-pressed={unite === u}
                    className={`px-3 text-sm font-bold ${
                      unite === u
                        ? 'bg-(--color-primary) text-white'
                        : 'bg-white text-(--color-ink-soft) hover:bg-(--color-sand-100)'
                    }`}
                  >
                    {u === 'pourcentage' ? '%' : '€'}
                  </button>
                ))}
              </div>
            </div>
            <span className="mt-1 block text-[11px] text-(--color-ink-muted)">
              {unite === 'pourcentage'
                ? 'Pourcentage retiré du prix total, que le candidat paie en 1, 3 ou 4 fois : '
                  + 'chaque mensualité est réduite d’autant.'
                : 'Montant retiré du prix total, que le candidat paie en 1, 3 ou 4 fois : '
                  + 'imputé sur le premier prélèvement, l’éventuel excédent est réparti sur '
                  + 'les mensualités suivantes.'}
              {' '}Non modifiable après création.
            </span>
          </div>

          <label className="block">
            <span className={labelClass}>Date de début (optionnel)</span>
            <input
              type="date"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              className={inputClass}
            />
            <span className="mt-1 block text-[11px] text-(--color-ink-muted)">
              Le code reste fermé jusqu’à cette date, puis s’ouvre tout seul.
            </span>
          </label>

          <label className="block">
            <span className={labelClass}>Date de fin (optionnel)</span>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className={inputClass}
            />
            <span className="mt-1 block text-[11px] text-(--color-ink-muted)">
              Valable jusqu’au soir de cette date incluse.
            </span>
          </label>

          <label className="block">
            <span className={labelClass}>Nombre maximal d’utilisations (optionnel)</span>
            <input
              value={maxRedemptions}
              onChange={(e) => setMaxRedemptions(e.target.value.replace(/[^0-9]/g, ''))}
              inputMode="numeric"
              placeholder="Illimité"
              className={inputClass}
            />
          </label>

          <div className="flex flex-col justify-end pb-1">
            <label className="flex items-center gap-2 text-sm text-(--color-ink)">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="h-4 w-4"
              />
              <span>Actif dès la création{startsAt ? ' (à partir de la date de début)' : ''}</span>
            </label>
          </div>
        </div>

        {/* ─────────────── Périmètre ─────────────── */}
        <fieldset className="mt-4 space-y-3 rounded-xl border border-(--color-border) p-3">
          <legend className="px-1 text-xs font-semibold text-(--color-ink-soft)">
            Périmètre du code
          </legend>

          <FacetButtons
            legend="Formule"
            allLabel="Toutes les formules"
            options={formuleOptions}
            values={formules}
            onToggle={(v) => bascule(setFormules, v)}
            onClear={() => setFormules([])}
          />

          <FacetButtons
            legend="Spécialité"
            allLabel="Toutes les spécialités"
            options={specialtyOptions}
            values={specialties}
            onToggle={(v) => bascule(setSpecialties, v)}
            onClear={() => setSpecialties([])}
          />

          <FacetButtons
            legend="Niveau"
            allLabel="Tous les niveaux"
            options={tierOptions}
            values={tiers}
            onToggle={(v) => bascule(setTiers, v)}
            onClear={() => setTiers([])}
          />

          {/* Formules qu'un produit Stripe unique empêche de rattacher à une
              spécialité : on ne les retire plus d'autorité, on dit ce qu'elles
              impliquent et on laisse l'admin décider. */}
          {nonDistinguables.length > 0 && (
            <div className="rounded-lg border border-(--color-border) bg-(--color-sand-100) p-2.5">
              <label className="flex items-start gap-2 text-xs text-(--color-ink)">
                <input
                  type="checkbox"
                  checked={inclureNonDistinguables}
                  onChange={(e) => setInclureNonDistinguables(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0"
                />
                <span>
                  <strong>
                    Inclure {nonDistinguables.map((o) => o.label).join(', ')}
                  </strong>
                  {' — '}
                  {nonDistinguables.length > 1 ? 'ces formules sont vendues' : 'cette formule est vendue'}
                  {' '}au même prix pour toutes les spécialités : {nonDistinguables.length > 1 ? 'elles ne forment' : 'elle ne forme'}
                  {' '}qu’une fiche produit Stripe, sur laquelle la spécialité n’existe pas. Le code y sera
                  donc valable <strong>quelle que soit la spécialité</strong> achetée.
                </span>
              </label>
            </div>
          )}

          {/* Offres retenues, avec leur prix : c'est le contrôle final avant
              création, le périmètre d'un coupon n'étant pas modifiable ensuite. */}
          <div className="rounded-lg bg-(--color-sand-100) p-2.5">
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-(--color-ink-muted)">
              {allOffers
                ? `Toutes les formations (${offers.length})`
                : `Formations concernées (${matched.length})`}
            </p>
            {allOffers ? (
              <p className="text-xs text-(--color-ink-soft)">
                Aucune restriction : le code est accepté sur n’importe quelle formation.
                Choisissez une formule, une spécialité ou un niveau pour le limiter.
              </p>
            ) : matched.length === 0 ? (
              <p className="text-xs font-medium text-(--color-danger)">
                Aucune formation ne correspond à ce périmètre.
              </p>
            ) : (
              <ul className="space-y-0.5">
                {matched.map((o) => (
                  <li key={o.key} className="flex items-baseline justify-between gap-3 text-xs">
                    <span className="text-(--color-ink)">
                      {o.label}
                      {elargies.includes(o) && (
                        <span className="text-(--color-ink-muted)"> — toutes spécialités</span>
                      )}
                    </span>
                    <span className="shrink-0 font-semibold tabular-nums text-(--color-ink-soft)">
                      {euros(o.amountEuros)} €
                      {remiseValide && (
                        <span className="text-(--color-ink)">
                          {' '}→ {euros(apresRemise(o.amountEuros))} €
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {!allOffers && (
            <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-[11px] leading-snug text-amber-900">
              Sur une autre formation que celles-ci, Stripe ignore le code <strong>sans
              afficher d’erreur</strong> : le champ reste vide et le candidat croit que
              le code « ne marche pas ». Si le code est remis à une personne précise,
              vérifiez qu’il couvre bien la formation qu’elle va acheter, ou laissez
              « Toutes les formations ».
            </p>
          )}

          <p className="text-[11px] leading-snug text-(--color-ink-muted)">
            Pas de filtre par voie : la voie interne ou externe est choisie dans le
            tunnel d’achat et ne change pas le produit acheté. Stripe n’aurait donc
            aucun moyen de refuser le code à l’autre voie — le filtre serait affiché
            sans jamais être appliqué.
          </p>
        </fieldset>

        {error && (
          <div className="mt-2">
            <p className="text-xs font-medium text-(--color-danger)">{error}</p>
            {alsoCovered && alsoCovered.length > 0 && (
              <button
                type="button"
                onClick={() => void submit(true)}
                disabled={saving}
                className="mt-1.5 rounded-lg border border-amber-400 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-100 disabled:opacity-60"
              >
                Créer le code malgré ce périmètre élargi
              </button>
            )}
          </div>
        )}
        {success && <p className="mt-2 text-xs font-medium text-green-700">{success}</p>}

        <button
          type="button"
          onClick={() => void submit()}
          disabled={saving}
          className="mt-3 inline-flex items-center gap-2 rounded-lg bg-(--color-primary) px-4 py-2 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          {saving ? 'Création…' : 'Créer le code'}
        </button>
      </section>

      {/* ─────────────── Liste ─────────────── */}
      <section className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wide text-(--color-ink-muted)">
          Codes existants ({codes.length})
        </p>
        {codes.length === 0 && (
          <p className="rounded-xl border border-dashed border-(--color-border) p-6 text-center text-sm text-(--color-ink-muted)">
            Aucun code pour l’instant.
          </p>
        )}
        {codes.map((c) => {
          const style = STATUS_STYLE[c.status];
          const start = day(c.startsAt);
          const end = day(c.expiresAt);
          // Un code expiré ou épuisé ne se rouvre pas en le réactivant : Stripe
          // continue de le refuser. On masque donc le bouton plutôt que de
          // laisser croire à une bascule possible.
          const canToggle = c.status !== 'expire' && c.status !== 'epuise';
          return (
            <article
              key={c.id}
              className="flex flex-col gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-3 sm:flex-row sm:items-center"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-(--color-sand-100)">
                <Ticket className="h-5 w-5 text-(--color-ink-soft)" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-black tracking-wide text-(--color-ink)">
                    {c.code}
                  </span>
                  <span className="text-sm font-bold text-(--color-ink)">{remiseLabel(c)}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${style.className}`}>
                    {style.label}
                  </span>
                </div>
                <p className="mt-1 text-xs text-(--color-ink-soft)">
                  {c.offerLabels === null ? 'Toutes les formations' : c.offerLabels.join(' · ')}
                </p>
                <p className="mt-0.5 text-[11px] text-(--color-ink-muted)">
                  {c.timesRedeemed} utilisation{c.timesRedeemed > 1 ? 's' : ''}
                  {c.maxRedemptions !== null ? ` / ${c.maxRedemptions}` : ''}
                  {start ? ` · du ${start}` : ''}
                  {end ? ` · jusqu’au ${end}` : ''}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard.writeText(c.code);
                    setCopied(c.id);
                    setTimeout(() => setCopied(null), 1500);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-(--color-ink-soft) hover:bg-(--color-sand-100)"
                  title="Copier le code"
                >
                  {copied === c.id ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </button>
                {canToggle && (
                  <button
                    type="button"
                    onClick={() =>
                      startTransition(async () => {
                        const r = await togglePromoCodeAction(c.id, !c.active);
                        if (!r.ok) setError(r.error ?? 'Erreur');
                        router.refresh();
                      })
                    }
                    disabled={pending}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-(--color-ink-soft) hover:bg-(--color-sand-100)"
                    title={c.active ? 'Désactiver' : 'Activer'}
                  >
                    {c.active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                  </button>
                )}
              </div>
            </article>
          );
        })}
        <p className="pt-1 text-[11px] text-(--color-ink-muted)">
          Un code ne se supprime pas — Stripe ne le permet pas, et l’historique des remises déjà
          accordées doit rester lisible. Désactivez-le. La remise n’est pas modifiable non
          plus : pour la corriger, désactivez ce code et créez-en un nouveau. Aucun automatisme
          ne ferme un code : seul un administrateur le fait, ici.
        </p>
      </section>
    </div>
  );
}
