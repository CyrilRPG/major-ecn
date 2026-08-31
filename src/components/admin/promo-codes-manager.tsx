'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Check, Copy, Loader2, Plus, Power, PowerOff, Ticket } from 'lucide-react';
import {
  createPromoCodeAction,
  togglePromoCodeAction,
} from '@/app/admin/codes-promo/actions';
import type { PromoCodeRow, PromoCodeStatus } from '@/lib/stripe/promo-codes';

export type OfferOption = { key: string; label: string; amountEuros: number };

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

const day = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : null;

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
  const [allOffers, setAllOffers] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [oncePerCandidate, setOncePerCandidate] = useState(false);
  const [active, setActive] = useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const amountEuros = Number(amount.replace(',', '.'));

  /**
   * Piège du paiement en plusieurs fois : Stripe applique une remise en euros à
   * la PREMIÈRE facture. En 4×, une remise supérieure à la première mensualité
   * est donc perdue pour la différence. On calcule la mensualité la plus faible
   * du périmètre choisi et on prévient avant la création — c'est irrattrapable
   * après, un coupon n'étant pas modifiable.
   */
  const installmentWarning = useMemo(() => {
    if (!Number.isFinite(amountEuros) || amountEuros <= 0) return null;
    const scope = allOffers ? offers : offers.filter((o) => selected.includes(o.key));
    if (scope.length === 0) return null;
    // 4× est le plus grand fractionnement proposé, donc la plus petite première
    // mensualité : c'est l'offre la moins chère du périmètre qui contraint.
    const worst = scope.reduce((min, o) => (o.amountEuros < min.amountEuros ? o : min), scope[0]);
    const firstInstalment = worst.amountEuros / 4;
    if (amountEuros <= firstInstalment) return null;
    return (
      `En paiement 4×, la première mensualité de « ${worst.label} » est de `
      + `${euros(firstInstalment)} € : une remise de ${euros(amountEuros)} € s’y imputerait `
      + `en partie seulement, et ${euros(amountEuros - firstInstalment)} € seraient perdus. `
      + `Le code reste correct en paiement comptant.`
    );
  }, [amountEuros, allOffers, offers, selected]);

  function reset() {
    setCode('');
    setAmount('');
    setStartsAt('');
    setExpiresAt('');
    setMaxRedemptions('');
    setAllOffers(true);
    setSelected([]);
    setOncePerCandidate(false);
    setActive(true);
  }

  async function submit() {
    setError(null);
    setSuccess(null);
    if (!allOffers && selected.length === 0) {
      setError('Choisissez au moins une formation, ou cochez « Toutes les formations ».');
      return;
    }
    setSaving(true);
    const r = await createPromoCodeAction({
      code,
      amountEuros,
      startsAt,
      expiresAt,
      maxRedemptions: maxRedemptions.trim() ? Number(maxRedemptions) : null,
      offers: allOffers ? [] : selected,
      oncePerCandidate,
      active,
    });
    setSaving(false);
    if (!r.ok) {
      setError(r.error ?? 'Erreur');
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

          <label className="block">
            <span className={labelClass}>Montant de la réduction (€)</span>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="decimal"
              placeholder="150"
              className={inputClass}
            />
            <span className="mt-1 block text-[11px] text-(--color-ink-muted)">
              Montant libre, déduit du prix affiché. Non modifiable après création.
            </span>
          </label>

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

          <div className="flex flex-col justify-end gap-2 pb-1">
            <label className="flex items-start gap-2 text-sm text-(--color-ink)">
              <input
                type="checkbox"
                checked={oncePerCandidate}
                onChange={(e) => setOncePerCandidate(e.target.checked)}
                className="mt-0.5 h-4 w-4"
              />
              <span>
                Une seule fois par candidat
                <span className="block text-[11px] text-(--color-ink-muted)">
                  Réservé à une première commande : refusé si le candidat a déjà payé chez nous.
                </span>
              </span>
            </label>
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

        {/* Périmètre */}
        <fieldset className="mt-4 rounded-xl border border-(--color-border) p-3">
          <legend className="px-1 text-xs font-semibold text-(--color-ink-soft)">
            Formations concernées
          </legend>
          <label className="flex items-center gap-2 text-sm font-semibold text-(--color-ink)">
            <input
              type="checkbox"
              checked={allOffers}
              onChange={(e) => setAllOffers(e.target.checked)}
              className="h-4 w-4"
            />
            Toutes les formations
          </label>
          {!allOffers && (
            <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
              {offers.map((o) => (
                <label key={o.key} className="flex items-center gap-2 text-sm text-(--color-ink-soft)">
                  <input
                    type="checkbox"
                    checked={selected.includes(o.key)}
                    onChange={(e) =>
                      setSelected((prev) =>
                        e.target.checked ? [...prev, o.key] : prev.filter((k) => k !== o.key),
                      )
                    }
                    className="h-4 w-4"
                  />
                  <span>
                    {o.label}{' '}
                    <span className="text-(--color-ink-muted)">— {euros(o.amountEuros)} €</span>
                  </span>
                </label>
              ))}
            </div>
          )}
        </fieldset>

        {installmentWarning && (
          <p className="mt-3 flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            <AlertTriangle className="mt-px h-4 w-4 shrink-0" />
            <span>{installmentWarning}</span>
          </p>
        )}
        {error && <p className="mt-2 text-xs font-medium text-(--color-danger)">{error}</p>}
        {success && <p className="mt-2 text-xs font-medium text-green-700">{success}</p>}

        <button
          type="button"
          onClick={submit}
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
                  <span className="text-sm font-bold text-(--color-ink)">−{euros(c.amountEuros)} €</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${style.className}`}>
                    {style.label}
                  </span>
                  {c.oncePerCandidate && (
                    <span className="rounded-full bg-(--color-sand-100) px-2 py-0.5 text-[10px] font-bold text-(--color-ink-soft)">
                      1 par candidat
                    </span>
                  )}
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
          accordées doit rester lisible. Désactivez-le. Le montant n’est pas modifiable non plus :
          pour le corriger, désactivez ce code et créez-en un nouveau.
        </p>
      </section>
    </div>
  );
}
