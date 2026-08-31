import { requireAdmin } from '@/lib/auth/require-role';
import { FORMULES, getStripe, isTestMode } from '@/lib/stripe';
import { sellableCatalogue } from '@/lib/stripe/catalogue';
import { listPromoCodes, type PromoCodeRow } from '@/lib/stripe/promo-codes';
import { PromoCodesManager, type OfferOption } from '@/components/admin/promo-codes-manager';

export const dynamic = 'force-dynamic';

/**
 * Codes de réduction.
 *
 * Les codes sont créés directement dans Stripe (cf. `lib/stripe/promo-codes.ts`)
 * parce que c'est Stripe Checkout qui affiche le champ « Ajouter un code
 * promotionnel » et qui applique la remise. Le compteur d'utilisations affiché
 * ici est donc celui de Stripe, pas une copie locale susceptible de dériver.
 */
export default async function AdminCodesPromoPage() {
  await requireAdmin();

  // Seules les offres dont le prix Stripe est configuré peuvent être restreintes
  // (le périmètre d'un coupon s'exprime en produits Stripe). Les facettes
  // (formule / spécialité / niveau) accompagnent chaque offre : ce sont les
  // seules dimensions qui séparent réellement deux produits Stripe.
  const offers: OfferOption[] = sellableCatalogue().map((e) => ({
    key: e.offer,
    label: e.label,
    amountEuros: e.amountCents / 100,
    formule: e.formule,
    formuleLabel: FORMULES[e.formule].name,
    specialtyKey: e.specialtyKey,
    specialtyName: e.specialtyName,
    tier: e.tier,
    tierLabel: e.tierLabel,
  }));

  let codes: PromoCodeRow[] = [];
  let loadError: string | null = null;
  try {
    codes = await listPromoCodes(getStripe());
  } catch (e) {
    loadError =
      e instanceof Error
        ? e.message
        : 'Stripe est injoignable : impossible de lister les codes existants.';
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 lg:px-8">
      <header className="mb-6 border-b border-(--color-border) pb-5">
        <h1 className="text-xl font-black tracking-tight text-(--color-ink)">Codes de réduction</h1>
        <p className="mt-1 text-sm text-(--color-ink-soft)">
          Créez des codes à montant libre, valables sur toutes les formations ou seulement
          certaines. Le candidat les saisit dans « Ajouter un code promotionnel » sur la page de
          paiement — la remise est appliquée par Stripe, et le nombre d’utilisations affiché ici
          vient de Stripe.
        </p>
        {isTestMode() && (
          <p className="mt-2 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
            Mode TEST — les codes créés ici ne fonctionnent pas sur les vrais paiements.
          </p>
        )}
      </header>

      {loadError ? (
        <p className="rounded-xl border border-(--color-border) bg-red-50 p-4 text-sm font-medium text-(--color-danger)">
          {loadError}
        </p>
      ) : (
        <PromoCodesManager offers={offers} codes={codes} />
      )}
    </div>
  );
}
