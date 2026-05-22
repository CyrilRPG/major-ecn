import Link from 'next/link';
import { ArrowRight, BadgePercent, CalendarCheck, CheckCircle2, CreditCard, PhoneCall, UserPlus } from 'lucide-react';

export const metadata = {
  title: 'Inscription',
  description: 'Inscrivez-vous à Major ECN : choisissez votre formule, échangez avec l’équipe et démarrez votre préparation aux EDN.',
};

const CONTACT = 'contact@major-ecn.fr';

const ETAPES = [
  { Icon: UserPlus, t: 'Choisissez votre formule', d: 'D2, D3 (First ou Premium), Dernier Tour ou ECOS — selon votre année et vos objectifs.' },
  { Icon: PhoneCall, t: 'Échangez avec l’équipe', d: 'Un conseiller vous rappelle pour construire un programme adapté à votre emploi du temps.' },
  { Icon: CalendarCheck, t: 'Démarrez votre préparation', d: 'Cours en petits groupes ou en individuel, en présentiel à Paris ou en ligne.' },
];

const AVANTAGES = [
  'Petits groupes de 5 élèves en moyenne',
  'Enseignants sélectionnés parmi les meilleurs classés à l’EDN',
  'Coaching personnalisé et suivi sur-mesure',
  'Cours en soirée ou le week-end',
];

export default function InscriptionPage() {
  return (
    <>
      {/* HERO */}
      <section className="hero-navy relative isolate overflow-hidden text-white">
        <div aria-hidden className="hero-grid absolute inset-0 -z-10" />
        <div aria-hidden className="absolute -right-20 top-0 -z-10 h-72 w-72 rounded-full bg-(--color-primary)/20 blur-[120px]" />
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
          <span className="inline-flex items-center gap-2 rounded-full bg-(--color-primary) px-3.5 py-1.5 text-xs font-semibold">
            <BadgePercent className="h-3.5 w-3.5" />
            Jusqu’à 50 % de réduction d’impôts
          </span>
          <h1 className="mt-5 max-w-3xl font-display text-4xl leading-[1.07] tracking-tight sm:text-5xl">
            Inscrivez-vous et lancez votre préparation
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/65">
            Une nouvelle étape vers votre avenir médical commence. Rejoignez Major ECN et
            mettez toutes les chances de votre côté pour réussir vos EDN.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="eyebrow">La marche à suivre</p>
            <h2 className="mt-3 font-display text-3xl tracking-tight text-(--color-ink) sm:text-4xl">
              Comment s’inscrire
            </h2>
            <ol className="mt-6 space-y-4">
              {ETAPES.map((e, i) => (
                <li
                  key={e.t}
                  className="card-lift flex items-start gap-4 rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-soft) hover:shadow-(--shadow-lifted)"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-(--color-primary) text-white">
                    <e.Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-(--color-ink)">
                      <span className="mr-1.5 font-display text-(--color-primary)">{i + 1}.</span>{e.t}
                    </p>
                    <p className="mt-0.5 text-sm leading-relaxed text-(--color-ink-soft)">{e.d}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-6 rounded-2xl border border-(--color-border) bg-(--color-surface-soft) p-6">
              <div className="flex items-center gap-2 text-(--color-primary)">
                <CreditCard className="h-5 w-5" />
                <p className="text-sm font-semibold text-(--color-ink)">Paiement facilité</p>
              </div>
              <p className="mt-1.5 text-sm text-(--color-ink-soft)">
                Possibilité de régler en plusieurs fois : l’aspect financier ne doit pas être un
                frein à votre réussite.
              </p>
              <ul className="mt-4 space-y-2">
                {AVANTAGES.map((a) => (
                  <li key={a} className="flex items-start gap-2 text-sm text-(--color-ink)">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-(--color-primary)" />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Formulaire */}
          <div className="relative rounded-3xl border border-(--color-primary) bg-(--color-surface) p-7 shadow-(--shadow-lifted) lg:p-9">
            <span className="absolute -top-3 left-7 rounded-full bg-(--color-primary) px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
              Réponse sous 24 h
            </span>
            <h2 className="font-display text-2xl tracking-tight text-(--color-ink)">Demande d’inscription</h2>
            <p className="mt-1.5 text-sm text-(--color-ink-soft)">
              Renseignez vos informations, nous vous recontactons rapidement.
            </p>
            <form action={`mailto:${CONTACT}`} method="post" encType="text/plain" className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Prénom" name="prenom" />
                <Field label="Nom" name="nom" />
              </div>
              <Field label="Email" name="email" type="email" />
              <Field label="Téléphone" name="telephone" type="tel" />
              <div className="space-y-1.5">
                <label htmlFor="formule" className="text-sm font-medium text-(--color-ink)">Formule souhaitée</label>
                <select
                  id="formule"
                  name="formule"
                  className="w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-3.5 py-2.5 text-sm text-(--color-ink) outline-none transition-colors focus:border-(--color-primary)"
                >
                  <option>Formule D2 — DFASM1</option>
                  <option>Formule D3 — First</option>
                  <option>Formule D3 — Premium</option>
                  <option>EDN — Dernier Tour</option>
                  <option>Formule ECOS</option>
                  <option>EVC / PAE</option>
                </select>
              </div>
              <button
                type="submit"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-(--color-primary) px-6 py-4 text-base font-semibold text-white transition-transform hover:scale-[1.02]"
              >
                Envoyer ma demande d’inscription
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </form>
            <p className="mt-4 text-center text-xs text-(--color-ink-muted)">
              Une question avant de vous inscrire ?{' '}
              <Link href="/contact" className="font-semibold text-(--color-primary) hover:underline">Contactez-nous</Link>
            </p>
          </div>
        </div>
      </section>
    </>
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
        className="w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-3.5 py-2.5 text-sm text-(--color-ink) outline-none transition-colors focus:border-(--color-primary)"
      />
    </div>
  );
}
