import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CalendarDays, FileText, Laptop, MapPin, Newspaper } from 'lucide-react';

export const metadata = {
  title: 'En savoir plus',
  description: 'Comprendre les EDN, les ECOS et la réforme : calendrier 2026, format des épreuves, préparation en présentiel et en ligne.',
};

const IMG = 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1400&auto=format&fit=crop';

const EPREUVES = [
  { j: 'Lundi après-midi', h: '14 h 30 – 17 h 30', t: '1ʳᵉ unité de composition' },
  { j: 'Mardi matin', h: '9 h – 12 h', t: '2ᵉ unité de composition' },
  { j: 'Mardi après-midi', h: '14 h 30 – 17 h 30', t: '3ᵉ unité de composition' },
  { j: 'Mercredi matin', h: '9 h – 12 h', t: 'Lecture critique d’articles (LCA)' },
];

const ARTICLES = [
  { cat: 'Exercice médical', t: 'Structures d’accueil pour les lauréats PAE : CHU, cliniques ou secteur privé ?', d: '19 septembre 2025' },
  { cat: 'Exercice médical', t: 'Quelle rémunération pour un médecin étranger exerçant en France ?', d: '26 juin 2025' },
  { cat: 'Exercice médical', t: 'L’impact des Épreuves de Vérification des Connaissances sur l’accès aux soins', d: '26 juin 2025' },
];

export default function EnSavoirPlusPage() {
  return (
    <>
      <section className="bg-(--color-sidebar) text-white">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--color-accent)">En savoir plus</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl tracking-tight sm:text-5xl">
            Tout comprendre des EDN, des ECOS et de la réforme
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/70">
            Les Épreuves Dématérialisées Nationales remplacent les ECN. La première session
            regroupe quatre épreuves de trois heures et se tiendra du 20 au 23 octobre 2026.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl tracking-tight text-(--color-ink)">Le calendrier des épreuves</h2>
            <p className="mt-3 text-sm leading-relaxed text-(--color-ink-soft)">
              La première session des EDN aura lieu du 20 au 23 octobre 2026 dans les centres
              d’épreuves fixés par arrêté. Une seconde session est prévue pour les étudiants
              n’ayant pas atteint la note minimale requise. La date des ECOS est à venir.
            </p>
            <ul className="mt-5 space-y-2.5">
              {EPREUVES.map((e) => (
                <li key={e.t} className="flex items-center gap-3 rounded-xl border border-(--color-border) bg-(--color-surface) px-4 py-3">
                  <CalendarDays className="h-4 w-4 shrink-0 text-(--color-primary)" />
                  <span className="flex-1 text-sm font-medium text-(--color-ink)">{e.t}</span>
                  <span className="text-xs text-(--color-ink-muted)">{e.j} · {e.h}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-(--color-sidebar)">
            <Image src={IMG} alt="Préparation aux EDN" fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="bg-(--color-surface-soft) py-16">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <h2 className="font-display text-3xl tracking-tight text-(--color-ink)">Présentiel ou en ligne, vous choisissez</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-(--shadow-soft)">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-(--color-primary-soft) text-(--color-primary)">
                <MapPin className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-semibold text-(--color-ink)">Cours en présentiel</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-(--color-ink-soft)">
                Un encadrement personnalisé dans nos locaux parisiens, en immersion totale avec
                vos formateurs.
              </p>
            </div>
            <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-(--shadow-soft)">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-(--color-primary-soft) text-(--color-primary)">
                <Laptop className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-semibold text-(--color-ink)">Cours en ligne</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-(--color-ink-soft)">
                Supports détaillés, vidéos explicatives et entraînements interactifs (QCM,
                examens blancs) — idéal pour les emplois du temps chargés.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <h2 className="font-display text-3xl tracking-tight text-(--color-ink)">Comment se construit votre classement</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-(--color-ink-soft)">
          Depuis 2023, les ECN sont remplacées par trois composantes, afin de prendre en compte
          à la fois les connaissances théoriques et les compétences cliniques.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            { p: '60 %', t: 'EDN', d: 'Épreuves écrites : dossiers progressifs, questions isolées et LCA.' },
            { p: '30 %', t: 'ECOS', d: 'Examens cliniques objectifs et structurés, à l’oral, au printemps.' },
            { p: '10 %', t: 'Parcours', d: 'Expériences, recherche, stages, engagement associatif.' },
          ].map((x) => (
            <div key={x.t} className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-(--shadow-soft)">
              <p className="font-display text-3xl text-(--color-primary)">{x.p}</p>
              <p className="mt-2 font-semibold text-(--color-ink)">{x.t}</p>
              <p className="mt-1 text-sm leading-relaxed text-(--color-ink-soft)">{x.d}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs leading-relaxed text-(--color-ink-muted)">
          Les connaissances sont hiérarchisées en rang A (exigible pour tout médecin, seuil de
          14/20) et rang B (exigible pour l’interne d’une spécialité). Le rang C, enseigné en
          internat, n’est pas évalué à l’EDN.
        </p>
      </section>

      <section className="border-t border-(--color-border) bg-(--color-surface-soft) py-16">
        <div className="mx-auto max-w-3xl px-5 lg:px-8">
          <h2 className="font-display text-3xl tracking-tight text-(--color-ink)">Foire aux questions</h2>
          <div className="mt-6 space-y-3">
            {[
              { q: 'Je suis en D2, faut-il commencer dès maintenant ?', a: 'Oui. La préparation est un marathon : démarrer tôt installe un rythme de travail serein, consolide les acquis de D2 et anticipe les spécialités à venir — tout en réussissant les examens de la faculté.' },
              { q: 'À quel classement puis-je m’attendre ?', a: '96 % des élèves qui suivent les conseils et le rythme proposés par nos enseignants obtiennent la spécialité de leur choix.' },
              { q: 'Où et quand ont lieu les cours ?', a: 'À Paris (15ᵉ et 14ᵉ arrondissements) ou en ligne ; les cours particuliers se déroulent à domicile. Les séances ont lieu en soirée ou le week-end.' },
              { q: 'Existe-t-il des facilités de paiement ?', a: 'Oui, le règlement en plusieurs fois est possible afin que l’aspect financier ne soit pas un frein à votre réussite.' },
              { q: 'Peut-on s’inscrire à plusieurs ?', a: 'Tout à fait. Un groupe d’amis qui se connaissent bien favorise un rythme de travail soudé et aide à affronter le concours.' },
            ].map((f) => (
              <details key={f.q} className="group rounded-2xl border border-(--color-border) bg-(--color-surface) p-5">
                <summary className="cursor-pointer list-none text-sm font-semibold text-(--color-ink) marker:hidden">
                  {f.q}
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-(--color-ink-soft)">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="mb-6 flex items-center gap-2">
          <Newspaper className="h-5 w-5 text-(--color-primary)" />
          <h2 className="font-display text-3xl tracking-tight text-(--color-ink)">Nos derniers conseils</h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {ARTICLES.map((a) => (
            <article key={a.t} className="flex flex-col rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-(--shadow-soft)">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-(--color-primary-soft) px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-(--color-primary-deep)">
                <FileText className="h-3 w-3" /> {a.cat}
              </span>
              <h3 className="mt-3 flex-1 text-sm font-semibold leading-snug text-(--color-ink)">{a.t}</h3>
              <p className="mt-3 text-xs text-(--color-ink-muted)">{a.d}</p>
            </article>
          ))}
        </div>
        <Link href="/inscription" className="mt-10 inline-flex items-center gap-2 rounded-xl bg-(--color-primary) px-6 py-3.5 text-base font-semibold text-white transition-transform hover:scale-[1.03]">
          Prêt à réussir vos EDN ? Inscrivez-vous
          <ArrowRight className="h-5 w-5" />
        </Link>
      </section>
    </>
  );
}
