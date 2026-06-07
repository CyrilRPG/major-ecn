import Link from 'next/link';
import { ArrowRight, Mail, Sparkles } from 'lucide-react';
import { isSubscriber, isTrialExpired, trialDaysLeft } from '@/lib/auth/trial';
import type { Profile } from '@/lib/auth/get-profile';

const INSCRIPTION_EMAIL = 'contact@major-ecn.fr';
const SUBJECT = encodeURIComponent('Passage à l’abonnement Major ECN');

type Variant = 'banner' | 'card' | 'inline';

const COPY: Record<string, { eyebrow: string; titre: string; sous: string }> = {
  default: {
    eyebrow: 'Essai gratuit',
    titre: 'Débloquez toute la plateforme',
    sous: 'Accédez à l’intégralité des QCM, flashcards, annales et au suivi IA — sans limite de temps.',
  },
  cours: {
    eyebrow: 'Continuer ce cours',
    titre: 'Tout le contenu de ce collège, sans limite',
    sous: 'Annales, examens blancs, tuteur dédié, analytics — passez Essentiel, Premium ou Intensif.',
  },
  fin: {
    eyebrow: 'Bravo pour cette session',
    titre: 'Et si la prochaine, c’était sans limite ?',
    sous: 'Choisissez votre formule (Essentiel, Premium ou Intensif) et accédez à 4 200+ QCM.',
  },
};

/**
 * Pousse l'inscription vers les formules payantes (Essentiel/Premium/Intensif).
 * Visible sur la version gratuite/essai de la plateforme. Met en avant l'email
 * `contact@major-ecn.fr` pour les demandes d'inscription.
 */
export function UpgradeBanner({
  variant = 'banner',
  context = 'default',
  className,
  profile,
}: {
  variant?: Variant;
  context?: 'default' | 'cours' | 'fin';
  className?: string;
  profile?: Pick<Profile, 'trial_until'> | null;
}) {
  // Caché pour les abonnés (trial_until null).
  if (profile && isSubscriber(profile)) return null;

  const c = COPY[context];
  const mailHref = `mailto:${INSCRIPTION_EMAIL}?subject=${SUBJECT}`;
  const expired = !!profile && isTrialExpired(profile);
  const daysLeft = profile ? trialDaysLeft(profile) : 0;

  if (variant === 'inline') {
    return (
      <div className={'flex flex-wrap items-center gap-3 rounded-xl border border-(--color-primary)/30 bg-(--color-primary-soft) px-4 py-3 text-sm ' + (className ?? '')}>
        <Sparkles className="h-4 w-4 shrink-0 text-(--color-primary)" />
        <span className="flex-1 text-(--color-ink)">
          <span className="font-semibold">{c.titre}</span> · {c.sous}
        </span>
        <a
          href={mailHref}
          className="inline-flex items-center gap-1.5 rounded-lg bg-(--color-primary) px-3 py-1.5 text-xs font-bold text-white"
        >
          <Mail className="h-3.5 w-3.5" />
          {INSCRIPTION_EMAIL}
        </a>
      </div>
    );
  }

  return (
    <section
      className={
        'relative isolate overflow-hidden rounded-2xl border border-(--color-primary)/25 ' +
        'bg-gradient-to-br from-(--color-primary-soft) via-white to-white p-6 shadow-(--shadow-soft) sm:p-7 ' +
        (className ?? '')
      }
    >
      <div aria-hidden className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-(--color-primary)/15 blur-3xl" />
      <div className="relative grid items-center gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <p className="inline-flex items-center gap-1.5 rounded-full bg-(--color-primary) px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white">
            <Sparkles className="h-3 w-3" />
            {expired
              ? 'Essai expiré'
              : daysLeft > 0
              ? `Essai gratuit · ${daysLeft} j restant${daysLeft > 1 ? 's' : ''}`
              : c.eyebrow}
          </p>
          <h3 className="mt-3 font-display text-xl font-semibold tracking-tight text-(--color-ink) sm:text-2xl">
            {c.titre}
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-(--color-ink-soft)">{c.sous}</p>
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-(--color-ink-soft)">
            <li>✓ Essentiel 49 €/mois</li>
            <li>✓ Premium 89 €/mois</li>
            <li>✓ Intensif 149 €/mois</li>
            <li>✓ Sans engagement</li>
          </ul>
        </div>
        <div className="flex flex-col gap-2.5">
          <a
            href={mailHref}
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-(--color-primary) px-5 py-3 text-sm font-bold text-white shadow-(--shadow-soft) transition-transform hover:scale-[1.025]"
          >
            <Mail className="h-4 w-4" />
            {INSCRIPTION_EMAIL}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-(--color-border) bg-(--color-surface) px-4 py-2.5 text-xs font-semibold text-(--color-ink) hover:border-(--color-primary)/40"
          >
            Voir les formules en détail
          </Link>
        </div>
      </div>
    </section>
  );
}
