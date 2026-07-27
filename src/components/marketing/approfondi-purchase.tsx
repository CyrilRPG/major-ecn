'use client';

/**
 * Tunnel d'achat du Programme Approfondi.
 *
 * Le prix dépend de la SPÉCIALITÉ et du TIER (« Approfondi » / « Approfondi + »).
 * Parcours :
 *   1. l'étudiant choisit sa spécialité ;
 *   2. les offres disponibles apparaissent (avec heures / couverture + prix) ;
 *   3. il choisit une offre → formulaire de paiement Stripe (1×/3×/4×).
 * Les spécialités non proposées en ligne (ex. Anesthésie-réanimation) basculent
 * sur le formulaire de rappel conseiller.
 */
import { useState } from 'react';
import { ArrowRight, Check, Clock, GraduationCap, Layers3, Phone } from 'lucide-react';
import { APPROFONDI_SPECIALTIES } from '@/lib/stripe/approfondi';
import { CheckoutButton } from './checkout-button';
import { CallbackRequestForm } from './callback-request-form';

const NAVY = '#0F1F4D';
const INK_SOFT = '#5B6478';
const BORDER = '#E5E9F0';
const CTA = { deep: '#1E3A8A', main: '#1E40AF' };
const OTHER = '__other__';

function euros(cents: number): string {
  return (cents / 100).toLocaleString('fr-FR', { maximumFractionDigits: 0 });
}

export function ApprofondiPurchase() {
  const [specKey, setSpecKey] = useState<string | null>(null);
  const [tierId, setTierId] = useState<string | null>(null);

  const spec = APPROFONDI_SPECIALTIES.find((s) => s.key === specKey) ?? null;
  const tier = spec?.tiers.find((t) => t.id === tierId) ?? null;
  const isOther = specKey === OTHER;

  function pickSpecialty(key: string) {
    setSpecKey(key);
    // Auto-sélection quand une seule offre (ex. MIPIC).
    const s = APPROFONDI_SPECIALTIES.find((x) => x.key === key);
    setTierId(s && s.tiers.length === 1 ? s.tiers[0].id : null);
  }

  return (
    <div className="space-y-4">
      {/* Étape 1 — spécialité */}
      <div>
        <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.14em]" style={{ color: NAVY }}>
          1. Votre spécialité
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {APPROFONDI_SPECIALTIES.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => pickSpecialty(s.key)}
              className="flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-[13.5px] font-semibold transition-colors"
              style={{
                borderColor: specKey === s.key ? CTA.main : BORDER,
                background: specKey === s.key ? '#EEF2FF' : 'white',
                color: NAVY,
              }}
            >
              <GraduationCap className="h-4 w-4 shrink-0" style={{ color: CTA.main }} />
              {s.name}
            </button>
          ))}
          <button
            type="button"
            onClick={() => { setSpecKey(OTHER); setTierId(null); }}
            className="flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-[13.5px] font-semibold transition-colors sm:col-span-2"
            style={{
              borderColor: isOther ? CTA.main : BORDER,
              background: isOther ? '#EEF2FF' : 'white',
              color: NAVY,
            }}
          >
            <Phone className="h-4 w-4 shrink-0" style={{ color: CTA.main }} />
            Autre spécialité (être rappelé par un conseiller)
          </button>
        </div>
      </div>

      {/* Étape 2 — offre (tier) */}
      {spec && (
        <div>
          <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.14em]" style={{ color: NAVY }}>
            2. Votre formule
          </p>
          <div className="grid grid-cols-1 gap-2.5">
            {spec.tiers.map((t) => {
              const active = tierId === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTierId(t.id)}
                  className="flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors"
                  style={{
                    borderColor: active ? CTA.main : BORDER,
                    background: active ? '#EEF2FF' : 'white',
                  }}
                >
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 text-[14px] font-extrabold" style={{ color: NAVY }}>
                      {active && <Check className="h-4 w-4 shrink-0" style={{ color: CTA.main }} strokeWidth={3} />}
                      {t.tierLabel}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-[12px]" style={{ color: INK_SOFT }}>
                      {t.hoursLabel && <><Clock className="h-3.5 w-3.5" /> {t.hoursLabel}</>}
                      {t.coverageLabel && <><Layers3 className="h-3.5 w-3.5" /> {t.coverageLabel}</>}
                    </p>
                  </div>
                  <span className="shrink-0 text-[18px] font-black" style={{ color: CTA.main }}>
                    {euros(t.amountCents)} €
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Étape 3 — paiement ou rappel */}
      {isOther ? (
        <div className="pt-1">
          <CallbackRequestForm color={CTA} />
        </div>
      ) : tier ? (
        <div className="pt-1">
          <CheckoutButton
            formuleId="programme-approfondi"
            approfondiVariant={tier.id}
            label={`Payer ${euros(tier.amountCents)} € et créer mon compte`}
            color={CTA}
          />
        </div>
      ) : spec ? (
        <p className="flex items-center gap-1.5 rounded-xl border border-dashed px-3 py-2.5 text-[12.5px]" style={{ borderColor: BORDER, color: INK_SOFT }}>
          <ArrowRight className="h-3.5 w-3.5" /> Choisissez une formule ci-dessus pour continuer.
        </p>
      ) : (
        <p className="flex items-center gap-1.5 rounded-xl border border-dashed px-3 py-2.5 text-[12.5px]" style={{ borderColor: BORDER, color: INK_SOFT }}>
          <ArrowRight className="h-3.5 w-3.5" /> Sélectionnez votre spécialité pour voir les offres et les tarifs.
        </p>
      )}
    </div>
  );
}
