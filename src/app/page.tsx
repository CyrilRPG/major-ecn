import Link from 'next/link';
import {
  ArrowRight, Activity, ClipboardCheck, FileText, MonitorPlay,
  ShieldCheck, Stethoscope, Target, Users, Layers3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BrandLogo } from '@/components/brand/brand-logo';

const CONTACT = 'contact@major-ecn.fr';

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
        <div
          className="absolute -top-48 right-[-10rem] h-[520px] w-[520px] rounded-full opacity-40 blur-3xl"
          style={{ background: 'radial-gradient(circle, var(--color-accent), transparent 62%)' }}
        />
        <div
          className="absolute bottom-[-12rem] -left-40 h-[440px] w-[440px] rounded-full opacity-30 blur-3xl"
          style={{ background: 'radial-gradient(circle, var(--color-primary), transparent 62%)' }}
        />
      </div>

      <Nav />

      {/* === Hero (split, asymétrique) === */}
      <section className="px-6 lg:px-10 pt-16 md:pt-24 pb-20 mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-[1.15fr_1fr] gap-14 items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-(--color-border) bg-(--color-surface) px-4 py-1.5 text-xs font-medium text-(--color-ink-soft)">
              <Stethoscope className="h-3.5 w-3.5 text-(--color-accent)" />
              Préparation aux EDN &amp; EVC — D2 · D3 · D4 · PAE
            </span>

            <h1 className="mt-7 font-semibold tracking-tight text-(--color-ink) leading-[1.02] text-balance text-4xl sm:text-5xl md:text-6xl">
              La prépa qui transforme le programme du R2C en{' '}
              <em className="display italic text-(--color-primary)">rang utile</em>.
            </h1>

            <p className="mt-7 max-w-xl text-lg text-(--color-ink-soft) leading-relaxed text-pretty">
              Major ECN accompagne les étudiants en médecine vers les Épreuves Dématérialisées
              Nationales et les Épreuves de Vérification des Connaissances. Cours en vidéo,
              dossiers progressifs, ECOS et coaching individuel — tout est aligné sur les
              recommandations de la HAS.
            </p>

            <div className="mt-9 flex flex-col sm:flex-row gap-3">
              <Button asChild size="xl">
                <Link href="/login">
                  Accéder à mon espace
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="xl" variant="outline">
                <Link href="#methode">Découvrir la méthode</Link>
              </Button>
            </div>
          </div>

          {/* Carte aperçu du parcours */}
          <div className="surface-card-lg">
            <p className="eyebrow">Parcours d’un item</p>
            <ol className="mt-5 space-y-3">
              {[
                { Icon: MonitorPlay, t: 'Cours vidéo', d: 'Le cours filmé par un médecin référent.' },
                { Icon: FileText, t: 'Fiche de synthèse', d: 'Le résumé aligné HAS, prêt à réviser.' },
                { Icon: ClipboardCheck, t: 'Dossiers progressifs & QI', d: 'Entraînement format EDN, corrigé justifié.' },
                { Icon: Layers3, t: 'Flashcards & Dernier Tour', d: 'Mémorisation pondérée par difficulté.' },
              ].map(({ Icon, t, d }, i) => (
                <li key={t} className="flex items-start gap-3 rounded-xl border border-(--color-border) bg-(--color-surface-soft) p-3">
                  <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-(--color-primary) text-white font-mono text-xs">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span>
                    <span className="flex items-center gap-1.5 font-medium text-(--color-ink) text-sm">
                      <Icon className="h-4 w-4 text-(--color-accent)" />
                      {t}
                    </span>
                    <span className="block text-xs text-(--color-ink-muted) mt-0.5">{d}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden border border-(--color-border) bg-(--color-border)">
          <Stat value="15 ans" label="d’expérience sur les EVC / PAE" />
          <Stat value="96 %" label="obtiennent leur spécialité de choix" />
          <Stat value="D2 → D4" label="un suivi sur tout le 2e cycle" />
          <Stat value="Paris + ligne" label="cours en présentiel ou à distance" />
        </div>
      </section>

      {/* === Le constat === */}
      <section className="px-6 lg:px-10 py-20 mx-auto max-w-6xl">
        <header className="mb-12 max-w-2xl">
          <p className="eyebrow">Le constat</p>
          <h2 className="mt-3 text-3xl md:text-5xl font-semibold tracking-tight text-balance leading-[1.05]">
            La réforme a tout changé. <em className="display italic text-(--color-primary)">Pas ta méthode.</em>
          </h2>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Pain
            title="Un programme tentaculaire"
            description="Les connaissances de rang A et B du R2C couvrent l’ensemble du 2e cycle. Sans hiérarchisation, on révise tout et on ne retient rien."
          />
          <Pain
            title="Trois épreuves, trois logiques"
            description="EDN, ECOS et LCA n’évaluent pas les mêmes compétences. S’entraîner sur un seul format, c’est arriver à découvert sur les autres."
          />
          <Pain
            title="Le rang utile se joue tôt"
            description="Le classement se construit en D2 et D3, pas en dernière ligne droite. Reporter, c’est laisser filer des places."
          />
        </div>
      </section>

      {/* === La méthode (protocole en étapes) === */}
      <section id="methode" className="px-6 lg:px-10 py-20 mx-auto max-w-5xl">
        <header className="mb-14 max-w-2xl">
          <p className="eyebrow">La méthode Major ECN</p>
          <h2 className="mt-3 text-3xl md:text-5xl font-semibold tracking-tight text-balance leading-[1.05]">
            Un protocole, <em className="display italic text-(--color-primary)">item par item</em>.
          </h2>
          <p className="mt-4 text-(--color-ink-soft) leading-relaxed text-pretty">
            Chaque item du programme suit la même séquence, du cours jusqu’au format concours.
            Vous savez en permanence ce qui est acquis et ce qui reste à travailler.
          </p>
        </header>

        <div className="space-y-3">
          <Phase n="01" Icon={MonitorPlay} title="Cours vidéo"
            description="Le cours filmé par un médecin spécialiste de sa discipline, à votre rythme, avec un contenu mis à jour selon les dernières recommandations HAS." />
          <Phase n="02" Icon={FileText} title="Fiche de synthèse"
            description="Le résumé hiérarchisé rang A / rang B, structuré pour la mémorisation active et prêt à être révisé en Dernier Tour." />
          <Phase n="03" Icon={ClipboardCheck} title="Entraînement format EDN"
            description="Dossiers progressifs, questions isolées et LCA au format exact du concours. Chaque proposition est corrigée et justifiée." />
          <Phase n="04" Icon={Target} title="ECOS & coaching"
            description="Stations ECOS simulées et coaching individuel avec des enseignants ayant participé aux ECOS nationaux et aux corrections." />
          <Phase n="05" Icon={Layers3} title="Flashcards & Dernier Tour"
            description="Révision espacée pondérée par difficulté pour fixer durablement, jusqu’à la préparation intensive de fin de parcours." />
        </div>
      </section>

      {/* === Pourquoi Major ECN === */}
      <section className="px-6 lg:px-10 py-20 mx-auto max-w-6xl">
        <header className="mb-12 max-w-2xl">
          <p className="eyebrow">Pourquoi Major ECN</p>
          <h2 className="mt-3 text-3xl md:text-5xl font-semibold tracking-tight text-balance leading-[1.05]">
            Un accompagnement <em className="display italic text-(--color-primary)">sur-mesure</em>, pas un catalogue.
          </h2>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Benefit
            Icon={ShieldCheck}
            title="Des enseignants praticiens"
            description="Des médecins et spécialistes reconnus dans leur domaine, qui enseignent ce qu’ils pratiquent et corrigent au plus près du concours."
          />
          <Benefit
            Icon={Activity}
            title="Une pédagogie personnalisée"
            description="Coaching individuel, petits groupes et ajustements réguliers selon votre progression, votre rythme et vos objectifs de rang."
          />
          <Benefit
            Icon={Users}
            title="Un suivi sur tout le 2e cycle"
            description="Des formules dédiées D2 (DFASM1), D3 (DFASM2), D4 et EVC PAE : la préparation se construit dès la première année utile."
          />
        </div>
      </section>

      {/* === Témoignages === */}
      <section className="px-6 lg:px-10 py-20 mx-auto max-w-6xl">
        <header className="mb-12 max-w-2xl">
          <p className="eyebrow">Ils ont classé</p>
          <h2 className="mt-3 text-3xl md:text-5xl font-semibold tracking-tight text-balance leading-[1.05]">
            La préparation qui <em className="display italic text-(--color-primary)">a fait la différence</em>.
          </h2>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Quote
            text="Je n’aurais jamais visé aussi haut sans Major ECN. Avec des camarades classés 3e, 4e et 6e, l’émulation du groupe a tout changé."
            name="Inès R."
            role="EDN — spécialité obtenue"
          />
          <Quote
            text="Le format des dossiers progressifs et des ECOS était exactement celui du jour J. Plus aucune surprise sur la forme, je me concentrais sur le fond."
            name="Thomas G."
            role="DFASM2 (D3)"
          />
          <Quote
            text="Le coaching individuel m’a permis de hiérarchiser le programme rang A / rang B. C’est ce qui m’a fait gagner des places sur le classement."
            name="Sarah M."
            role="EVC PAE — admise"
          />
        </div>
      </section>

      {/* === CTA final === */}
      <section className="px-6 lg:px-10 py-24 mx-auto max-w-4xl text-center">
        <h2 className="font-semibold tracking-tight text-(--color-ink) leading-[1.02] text-balance text-4xl md:text-6xl">
          Votre rang se prépare <em className="display italic text-(--color-primary)">dès maintenant</em>.
        </h2>
        <p className="mt-6 max-w-xl mx-auto text-(--color-ink-soft) text-pretty">
          Connectez-vous avec votre adresse Major ECN pour reprendre votre parcours là où vous
          l’avez laissé. Votre progression et vos statistiques vous attendent.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="xl">
            <Link href="/login">
              Accéder à mon espace
              <ArrowRight />
            </Link>
          </Button>
          <Button asChild size="xl" variant="outline">
            <Link href={`mailto:${CONTACT}`}>Échanger avec l’équipe</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-30 surface-glass border-b border-(--color-border)">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 h-20 flex items-center justify-between">
        <div className="inline-flex items-center rounded-xl bg-(--color-sidebar) px-3 py-2">
          <BrandLogo className="h-12 w-auto" />
        </div>
        <div className="hidden md:flex items-center gap-7 text-sm text-(--color-ink-soft)">
          <a href="#methode" className="hover:text-(--color-ink) transition">Méthode</a>
          <a href="#methode" className="hover:text-(--color-ink) transition">Formules</a>
          <a href={`mailto:${CONTACT}`} className="hover:text-(--color-ink) transition">Contact</a>
        </div>
        <Button asChild size="md">
          <Link href="/login">Se connecter</Link>
        </Button>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-(--color-border) mt-16 bg-(--color-surface)">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-(--color-ink-muted)">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center rounded-lg bg-(--color-sidebar) px-2.5 py-1.5">
            <BrandLogo className="h-12 w-auto" />
          </span>
          <span>Major ECN — Préparation EDN &amp; EVC · Paris &amp; en ligne</span>
        </div>
        <div className="flex items-center gap-5">
          <a href="#" className="hover:text-(--color-ink) transition">Mentions légales</a>
          <a href="#" className="hover:text-(--color-ink) transition">Confidentialité</a>
          <a href={`mailto:${CONTACT}`} className="hover:text-(--color-ink) transition">{CONTACT}</a>
        </div>
      </div>
    </footer>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-(--color-surface) px-5 py-6">
      <p className="font-display text-2xl text-(--color-primary) leading-none">{value}</p>
      <p className="mt-2 text-xs text-(--color-ink-muted) leading-snug">{label}</p>
    </div>
  );
}

function Pain({ title, description }: { title: string; description: string }) {
  return (
    <article className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6">
      <span className="inline-block h-1.5 w-8 rounded-full bg-(--color-accent)" />
      <h3 className="mt-4 font-semibold text-(--color-ink) text-lg leading-snug">{title}</h3>
      <p className="mt-2 text-sm text-(--color-ink-soft) leading-relaxed text-pretty">{description}</p>
    </article>
  );
}

function Phase({
  n, Icon, title, description,
}: { n: string; Icon: typeof MonitorPlay; title: string; description: string }) {
  return (
    <article className="flex items-start gap-5 rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 hover:border-(--color-accent) transition-colors">
      <span className="font-mono text-sm text-(--color-ink-muted) pt-1 tabular-nums">{n}</span>
      <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-(--color-primary-soft) text-(--color-primary)">
        <Icon className="h-5 w-5" />
      </span>
      <div className="flex-1">
        <h3 className="font-semibold text-(--color-ink) text-lg leading-snug">{title}</h3>
        <p className="mt-1.5 text-sm text-(--color-ink-soft) leading-relaxed text-pretty">{description}</p>
      </div>
    </article>
  );
}

function Benefit({ Icon, title, description }: { Icon: typeof Users; title: string; description: string }) {
  return (
    <article className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6">
      <div className="h-11 w-11 rounded-xl flex items-center justify-center bg-(--color-primary) text-white">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-5 font-semibold text-(--color-ink) text-lg leading-snug">{title}</h3>
      <p className="mt-2 text-sm text-(--color-ink-soft) leading-relaxed text-pretty">{description}</p>
    </article>
  );
}

function Quote({ text, name, role }: { text: string; name: string; role: string }) {
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2);
  return (
    <figure className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 flex flex-col h-full">
      <blockquote className="display text-(--color-ink) leading-relaxed flex-1 text-lg">
        « {text} »
      </blockquote>
      <figcaption className="mt-5 pt-5 border-t border-(--color-border) flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-(--color-primary) text-white flex items-center justify-center font-semibold text-sm">
          {initials}
        </div>
        <div>
          <p className="font-medium text-sm text-(--color-ink)">{name}</p>
          <p className="text-xs text-(--color-ink-muted)">{role}</p>
        </div>
      </figcaption>
    </figure>
  );
}
