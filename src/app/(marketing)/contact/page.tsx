import Link from 'next/link';
import { ArrowRight, Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';

export const metadata = {
  title: 'Nous contacter',
  description: 'Une question sur votre préparation aux EDN ou aux EVC ? L’équipe Major ECN vous répond tous les jours.',
};

const CONTACT = 'contact@major-ecn.fr';

const COORD = [
  { Icon: Phone, t: 'Téléphone', v: '01 47 34 35 71', href: 'tel:+33147343571' },
  { Icon: Mail, t: 'Email', v: CONTACT, href: `mailto:${CONTACT}` },
  { Icon: MapPin, t: 'Adresse', v: '3 rue Rosa Bonheur, 75015 Paris', href: undefined },
  { Icon: Clock, t: 'Disponibilité', v: 'Une équipe disponible tous les jours', href: undefined },
];

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--color-primary)">Nous contacter</p>
          <h1 className="mt-3 font-display text-4xl tracking-tight text-(--color-ink) sm:text-5xl">
            Une question ? Nous vous répondons
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-(--color-ink-soft)">
            Notre équipe vous accompagne dans le choix de votre formule et répond à toutes vos
            questions sur la préparation aux EDN, aux ECOS et aux concours EVC.
          </p>

          <ul className="mt-8 space-y-3">
            {COORD.map((c) => (
              <li key={c.t} className="flex items-center gap-4 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-(--shadow-soft)">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-(--color-primary-soft) text-(--color-primary)">
                  <c.Icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-xs font-medium uppercase tracking-wide text-(--color-ink-muted)">{c.t}</span>
                  {c.href ? (
                    <a href={c.href} className="text-sm font-semibold text-(--color-ink) hover:text-(--color-primary)">{c.v}</a>
                  ) : (
                    <span className="text-sm font-semibold text-(--color-ink)">{c.v}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-(--color-border) bg-(--color-surface-soft) p-7 lg:p-9">
          <div className="flex items-center gap-2 text-(--color-primary)">
            <MessageCircle className="h-5 w-5" />
            <h2 className="font-display text-xl text-(--color-ink)">Écrivez-nous</h2>
          </div>
          <p className="mt-2 text-sm text-(--color-ink-soft)">
            Renseignez vos coordonnées, nous revenons vers vous rapidement.
          </p>
          <form action={`mailto:${CONTACT}`} method="post" encType="text/plain" className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Prénom" name="prenom" />
              <Field label="Nom" name="nom" />
            </div>
            <Field label="Email" name="email" type="email" />
            <Field label="Téléphone" name="telephone" type="tel" />
            <div className="space-y-1.5">
              <label htmlFor="message" className="text-sm font-medium text-(--color-ink)">Votre message</label>
              <textarea
                id="message"
                name="message"
                rows={4}
                className="w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-3.5 py-2.5 text-sm text-(--color-ink) outline-none focus:border-(--color-primary)"
              />
            </div>
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-(--color-primary) px-6 py-3.5 text-base font-semibold text-white transition-transform hover:scale-[1.02]"
            >
              Envoyer ma demande
              <ArrowRight className="h-5 w-5" />
            </button>
          </form>
          <p className="mt-4 flex items-center gap-1.5 text-xs text-(--color-ink-muted)">
            <Phone className="h-3.5 w-3.5" />
            Vous préférez l’inscription directe ?{' '}
            <Link href="/inscription" className="font-semibold text-(--color-primary) hover:underline">
              S’inscrire en ligne
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

function Field({ label, name, type = 'text' }: { label: string; name: string; type?: string }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="text-sm font-medium text-(--color-ink)">{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        className="w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-3.5 py-2.5 text-sm text-(--color-ink) outline-none focus:border-(--color-primary)"
      />
    </div>
  );
}
