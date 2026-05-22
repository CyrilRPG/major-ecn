import Link from 'next/link';
import { ArrowRight, BookOpen, Check, Clock, Crown, Layers, Stethoscope, Target } from 'lucide-react';

export const metadata = {
  title: 'Formules',
  description: 'Formules D2, D3 (First & Premium), EDN Dernier Tour et ECOS — un accompagnement sur-mesure pour chaque étape du 2e cycle.',
};

const FORMULES = [
  {
    code: 'D2',
    Icon: BookOpen,
    titre: 'Formule Spécial D2 — DFASM1',
    chapeau: 'Posez des bases méthodologiques solides dès l’entrée dans le 2e cycle.',
    points: [
      'Cours en petits groupes ou en individuel',
      'Apprentissage des notions fondamentales selon le nouveau programme de l’EDN',
      'Planification adaptée pour concilier EDN et examens de D2',
      'Création de fiches de révision ciblées pour une mémorisation durable',
      'Première approche méthodologique des Dossiers progressifs, QI et ECOS',
      '3 à 4 heures de cours par semaine, en soirée ou le week-end',
    ],
  },
  {
    code: 'D3',
    Icon: Layers,
    titre: 'Formule D3 — DFASM2',
    chapeau: 'L’année décisive : un enseignement ciblé pour éliminer les lacunes et viser le rang utile.',
    points: [
      'Élimination des lacunes de D2 et consolidation des acquis',
      'Maîtrise des mots-clés et notions essentielles de chaque spécialité',
      'Tests de connaissances réguliers pour suivre votre progression',
      'Organisation et planning de révision sur-mesure',
      'Méthodologie des ECOS par d’anciens évaluateurs nationaux',
      'Formule First (groupes de 4 à 6) ou Premium (sur-mesure, à domicile)',
    ],
  },
  {
    code: 'DT',
    Icon: Target,
    titre: 'EDN — Dernier Tour',
    chapeau: 'La dernière ligne droite : une révision intensive et ciblée pour arriver au pic de forme.',
    points: [
      'Révision complète et hiérarchisée du programme en 3 mois',
      'Reprise des notions clés et essentielles, format par format',
      '6 à 8 heures par semaine, en groupe ou en cours particuliers',
      'Entraînement aux DP, QI, LCA et méthodologie',
      'Coaching par des enseignants experts de l’EDN',
    ],
  },
  {
    code: 'ECOS',
    Icon: Crown,
    titre: 'Formule ECOS',
    chapeau: 'Préparez l’épreuve clinique orale : 10 stations de 8 minutes, raisonnement argumenté.',
    points: [
      'Stations ECOS simulées en conditions réelles (PS, PSS ou sans)',
      'Coaching par des enseignants ayant noté les ECOS nationaux',
      'Méthodologie rigoureuse et maîtrise des mots-clés',
      'Accès à un forum « ECOS » pour échanger avec les enseignants',
      'Complémentaire de la formule « Spéciale D4 »',
    ],
  },
  {
    code: 'EVC',
    Icon: Stethoscope,
    titre: 'EVC / PAE — Praticiens à diplôme étranger',
    chapeau: 'Médecins, pharmaciens, dentistes et sages-femmes : réussissez vos Épreuves de Vérification des Connaissances.',
    points: [
      'Plus de 15 ans d’expertise sur les EVC de la PAE',
      'Préparation adaptée à chaque spécialité (40+ disciplines)',
      'Cours en groupe de 18 h, interactifs et fondés sur des cas cliniques',
      'Préparation longue ou dernier tour intensif, épreuves blanches',
      'Mise à jour des recommandations et protocoles français',
    ],
  },
];

export default function FormulesPage() {
  return (
    <>
      <section className="border-b border-(--color-border) bg-(--color-surface-soft)">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--color-primary)">Nos formules</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl tracking-tight text-(--color-ink) sm:text-5xl">
            Une formule adaptée à chaque étape de votre préparation
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-(--color-ink-soft)">
            De la D2 au Dernier Tour, en passant par les ECOS et les concours EVC / PAE,
            Major ECN conçoit des parcours personnalisés — en présentiel à Paris ou en ligne.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {FORMULES.map((f) => (
            <article
              key={f.code}
              className="flex flex-col rounded-3xl border border-(--color-border) bg-(--color-surface) p-7 shadow-(--shadow-soft)"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-(--color-primary) text-white">
                  <f.Icon className="h-6 w-6" />
                </span>
                <span className="rounded-lg bg-(--color-primary-soft) px-2.5 py-1 font-display text-sm font-semibold text-(--color-primary-deep)">
                  {f.code}
                </span>
              </div>
              <h2 className="mt-5 text-xl font-semibold text-(--color-ink)">{f.titre}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-(--color-ink-soft)">{f.chapeau}</p>
              <ul className="mt-5 flex-1 space-y-2.5">
                {f.points.map((p) => (
                  <li key={p} className="flex items-start gap-2.5 text-sm text-(--color-ink)">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-(--color-primary)" />
                    {p}
                  </li>
                ))}
              </ul>
              <Link
                href="/inscription"
                className="mt-6 inline-flex w-fit items-center gap-2 rounded-xl bg-(--color-primary) px-5 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
              >
                S’inscrire à cette formule
                <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>

        {/* Tarifs & financement */}
        <div className="mt-10 rounded-3xl border border-(--color-border) bg-(--color-surface-soft) p-7 lg:p-9">
          <div className="flex items-center gap-2 text-(--color-primary)">
            <Clock className="h-5 w-5" />
            <h2 className="font-display text-2xl tracking-tight text-(--color-ink)">Tarifs &amp; financement</h2>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { t: 'Frais d’inscription', v: '95 €', d: 'avant réduction d’impôt' },
              { t: 'Cours particuliers', v: 'dès 25 €/h', d: 'selon niveau, lieu et volume' },
              { t: 'Cours en groupe', v: '8 élèves max', d: 'formation sur 9 mois' },
              { t: 'Avantage fiscal', v: '50 %', d: 'réduction ou crédit d’impôt' },
            ].map((x) => (
              <div key={x.t} className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-(--color-ink-muted)">{x.t}</p>
                <p className="mt-1 font-display text-2xl text-(--color-primary)">{x.v}</p>
                <p className="mt-0.5 text-xs text-(--color-ink-soft)">{x.d}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-(--color-ink-muted)">
            Au titre de l’emploi d’un salarié à domicile (article 199 sexdecies du CGI), vous
            bénéficiez de 50 % de réduction d’impôt si vous êtes imposable, ou de 50 % de crédit
            d’impôt si vous ne l’êtes pas — sur les heures de cours et les frais d’inscription.
            Paiement en plusieurs fois possible.
          </p>
          <Link href="/contact" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-(--color-primary)">
            Demander un programme et un devis détaillés <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
