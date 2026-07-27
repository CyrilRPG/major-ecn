import Link from 'next/link';
import { ArrowRight, Sparkles, Trophy } from 'lucide-react';
import { isSubscriber, isTrialExpired, trialDaysLeft } from '@/lib/auth/trial';
import type { Profile } from '@/lib/auth/get-profile';
import { APPROFONDI_FROM_LABEL } from '@/lib/stripe/approfondi';

type Variant = 'banner' | 'card' | 'inline';

const COPY: Record<string, { eyebrow: string; titre: string; sous: string }> = {
  default: {
    eyebrow: 'Espace découverte',
    titre: 'Débloquez toute la plateforme',
    sous: 'Accédez à l’intégralité des QCM, flashcards, annales, cas cliniques et méthodologie EVC.',
  },
  cours: {
    eyebrow: 'Parcours Découverte terminé',
    titre: 'Tout le contenu de ce collège, sans limite',
    sous: 'Cours vidéo, annales, examens blancs, suivi pédagogique et méthodologie EVC pour toutes les spécialités.',
  },
  fin: {
    eyebrow: 'Bravo pour cette session',
    titre: 'Et si la prochaine, c’était sans limite ?',
    sous: 'Choisissez votre formule et accédez à l’intégralité de notre préparation EVC.',
  },
};

/** Tarifs officiels — alignés sur le site vitrine (/tarifs et /formules). */
const FORMULES: { name: string; price: string; href: string; tone: string }[] = [
  { name: 'Essentielle', price: '495 €',         href: '/tarifs', tone: '#16793C' },
  { name: 'Intensive',   price: '995 €',         href: '/tarifs', tone: '#C0112E' },
  { name: 'Approfondi',  price: APPROFONDI_FROM_LABEL, href: '/tarifs', tone: '#1E40AF' },
];

/**
 * Pousse l'inscription vers les formules payantes du site vitrine.
 * Visible sur la version Découverte (trial_until set). Renvoie systématiquement
 * vers /tarifs (pas d'email mailto).
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
  const expired = !!profile && isTrialExpired(profile);
  const daysLeft = profile ? trialDaysLeft(profile) : 0;

  if (variant === 'inline') {
    return (
      <div className={'flex flex-wrap items-center gap-3 rounded-xl border border-(--color-primary)/30 bg-(--color-primary-soft) px-4 py-3 text-sm ' + (className ?? '')}>
        <Sparkles className="h-4 w-4 shrink-0 text-(--color-primary)" />
        <span className="flex-1 text-(--color-ink)">
          <span className="font-semibold">{c.titre}</span> · {c.sous}
        </span>
        <Link
          href="/tarifs"
          className="inline-flex items-center gap-1.5 rounded-lg bg-(--color-primary) px-3 py-1.5 text-xs font-bold text-white"
        >
          Voir les formules
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
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
      <div className="relative grid items-center gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="inline-flex items-center gap-1.5 rounded-full bg-(--color-primary) px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white">
            {context === 'cours' ? <Trophy className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
            {expired
              ? 'Espace découverte expiré'
              : daysLeft > 0
              ? `Découverte · ${daysLeft} j restant${daysLeft > 1 ? 's' : ''}`
              : c.eyebrow}
          </p>
          <h3 className="mt-3 font-display text-xl font-semibold tracking-tight text-(--color-ink) sm:text-2xl">
            {c.titre}
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-(--color-ink-soft)">{c.sous}</p>

          {/* Vrais tarifs du site vitrine */}
          <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {FORMULES.map((f) => (
              <li key={f.name}
                className="rounded-xl border border-(--color-border) bg-(--color-surface) px-3 py-2"
              >
                <p className="text-[11px] font-extrabold uppercase tracking-[0.1em]" style={{ color: f.tone }}>
                  {f.name}
                </p>
                <p className="mt-0.5 text-[15px] font-black tabular-nums text-(--color-ink)">
                  {f.price}
                </p>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-2.5">
          <Link
            href="/tarifs"
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-(--color-primary) px-5 py-3 text-sm font-bold text-white shadow-(--shadow-soft) transition-transform hover:scale-[1.025]"
          >
            Voir toutes les formules
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/tarifs"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-(--color-border) bg-(--color-surface) px-4 py-2.5 text-xs font-semibold text-(--color-ink) hover:border-(--color-primary)/40"
          >
            Comparer les tarifs en détail
          </Link>
        </div>
      </div>
    </section>
  );
}
