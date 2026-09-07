import { Handshake, MessagesSquare, Stethoscope } from 'lucide-react';

/**
 * Accompagnement humain — blocs courts réutilisés sur le site public.
 *
 * POURQUOI. Le site laissait croire que Major ECN se résume à une plateforme
 * numérique. La plateforme est un outil ; selon la formule, le candidat pose
 * ses questions à l'équipe pédagogique, révise en direct avec les enseignants
 * et bénéficie d'un accompagnement jusqu'aux EVC. Ces blocs rendent cette
 * dimension visible sans ajouter de grosse section ni toucher à l'architecture.
 *
 * CE QU'ILS N'ANNONCENT JAMAIS. Ni « assistance 24h/24 », ni « disponible
 * 7j/7 », ni « mentor personnel », « tuteur dédié » ou « accompagnement
 * quotidien » : ces services n'existent pas, et une promesse invérifiable se
 * retourne contre la préparation. Le vocabulaire retenu est celui des faits :
 * équipe pédagogique, enseignants spécialistes, réponses à vos questions,
 * échanges avec les enseignants, cours en direct, suivi de progression,
 * accompagnement jusqu'aux EVC. Il est écrit en toutes lettres dans le HTML,
 * jamais porté par une seule icône.
 *
 * DEUX TRAITEMENTS GRAPHIQUES. Les pages Tarifs et spécialité proscrivent le
 * pictogramme (cf. en-tête de `tarifs-page.tsx`) : leurs blocs utilisent le
 * filet court de la charte. L'accueil et la page Plateforme utilisent déjà les
 * icônes Lucide : leurs blocs en portent.
 */

const NAVY = '#0F1F4D';
const RED = '#C0112E';
const RED_DEEP = '#8B0E22';
const INK_SOFT = '#5B6478';
const LINE = '#E4E7EF';
const PAPER = '#FBFBFD';
const FONT = "'Plus Jakarta Sans', sans-serif";
const FONT_BODY = "'Manrope', sans-serif";

/** Marqueur de liste des pages sans pictogramme : un filet court. */
function Filet({ color = RED }: { color?: string }) {
  return <span aria-hidden className="mt-[9px] block h-px w-3 shrink-0" style={{ background: color, opacity: 0.85 }} />;
}

const REPERES_TARIFS = [
  { fort: 'Vos questions, nos réponses', suite: 'par notre équipe pédagogique, dans toutes les formules' },
  { fort: 'Des enseignants spécialistes', suite: 'praticiens et médecins de votre discipline' },
  { fort: 'Des échanges en direct', suite: 'selon votre formule, avec replays' },
];

/**
 * Bloc transversal placé sous les trois cartes de la page Tarifs. Il dit ce
 * qui est commun aux trois formules, puis ce que les deux formules
 * accompagnées ajoutent — la hiérarchie que les cartes portent déjà.
 */
export function AccompagnementTarifs() {
  return (
    <div
      className="mt-10 rounded-[1.25rem] px-6 py-6 sm:px-8"
      style={{ border: `1px solid ${LINE}`, background: '#FFFFFF', fontFamily: FONT }}
    >
      <p className="text-[15px] font-black leading-snug tracking-tight sm:text-[17px]" style={{ color: NAVY, letterSpacing: '-0.02em' }}>
        Chez Major ECN, vous n’êtes jamais seul face à votre préparation.
      </p>
      <p className="mt-2.5 max-w-4xl text-[13.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
        Quelle que soit votre formule, vous pouvez poser vos questions et obtenir des réponses de notre
        équipe pédagogique. Avec les formules Intensive et Approfondie, vous bénéficiez en plus de cours
        en direct et d’échanges avec nos enseignants spécialistes.
      </p>
      <ul className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
        {REPERES_TARIFS.map((r) => (
          <li key={r.fort} className="flex items-start gap-3">
            <Filet />
            <p className="text-[12.5px] leading-snug" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
              <span className="block text-[13px] font-black" style={{ color: NAVY }}>{r.fort}</span>
              {r.suite}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Bloc de la page Plateforme, posé à côté des fonctionnalités : la plateforme
 * est un outil, pas un self-service.
 */
export function AccompagnementPlateforme() {
  return (
    <section className="py-12 sm:py-14" style={{ fontFamily: FONT, background: '#FFFFFF' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className="grid grid-cols-1 gap-6 rounded-3xl px-6 py-7 sm:px-8 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-start lg:gap-8"
          style={{ border: `1px solid ${LINE}`, background: PAPER }}
        >
          <span
            aria-hidden
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
            style={{ background: '#FCEAEC', color: RED }}
          >
            <MessagesSquare className="h-6 w-6" strokeWidth={1.9} />
          </span>
          <div>
            <h2 className="text-[1.25rem] font-black leading-tight tracking-tight sm:text-[1.5rem]" style={{ color: NAVY, letterSpacing: '-0.02em' }}>
              Une plateforme, mais jamais seul face à vos questions
            </h2>
            <p className="mt-3 max-w-3xl text-[14.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
              Une difficulté&nbsp;? Une notion que vous souhaitez approfondir&nbsp;? Posez vos questions pendant
              votre préparation et bénéficiez des réponses de notre équipe pédagogique.
            </p>
            <p className="mt-3.5 text-[14px] font-black leading-snug" style={{ color: RED_DEEP }}>
              Vous avancez à votre rythme. Nous restons disponibles lorsque vous avez besoin d’une réponse.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

const REPERES_ACCUEIL = [
  { Icon: MessagesSquare, texte: 'Des réponses à vos questions' },
  { Icon: Stethoscope, texte: 'Des enseignants spécialistes' },
  { Icon: Handshake, texte: 'Un accompagnement jusqu’aux EVC' },
];

/** Trois repères courts de l'accueil, sous le texte de la section enseignants. */
export function AccompagnementReperesAccueil() {
  return (
    <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
      {REPERES_ACCUEIL.map((r) => (
        <li
          key={r.texte}
          className="flex items-center gap-3 rounded-2xl px-4 py-3.5"
          style={{ border: `1px solid ${LINE}`, background: '#FFFFFF' }}
        >
          <span
            aria-hidden
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
            style={{ background: '#FCEAEC', color: RED }}
          >
            <r.Icon className="h-4.5 w-4.5" strokeWidth={1.9} />
          </span>
          <span className="text-[13px] font-black leading-snug" style={{ color: NAVY, fontFamily: FONT }}>
            {r.texte}
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Bloc standardisé des pages de spécialité. Identique partout pour ne pas
 * multiplier les variantes, et sans pictogramme : ces pages n'en portent
 * aucun.
 */
export function AccompagnementSpecialite() {
  return (
    <section className="py-12 sm:py-14" style={{ fontFamily: FONT, background: PAPER }}>
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <div className="rounded-[1.25rem] bg-white px-7 py-7 sm:px-9" style={{ border: `1px solid ${LINE}` }}>
          <h2 className="text-[1.2rem] font-black leading-tight tracking-tight sm:text-[1.45rem]" style={{ color: NAVY, letterSpacing: '-0.02em' }}>
            Des outils pour travailler. Des enseignants pour vous accompagner.
          </h2>
          <p className="mt-3 max-w-4xl text-[14px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
            Travaillez à votre rythme sur la plateforme et posez vos questions lorsque vous en avez besoin.
            Selon votre formule, retrouvez également nos enseignants en direct pour réviser, approfondir le
            programme et échanger autour de vos difficultés.
          </p>
          <p className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-[12px] font-black uppercase tracking-[0.06em]" style={{ color: NAVY }}>
            <span>Plateforme</span>
            <span aria-hidden style={{ color: RED }}>•</span>
            <span>Réponses à vos questions</span>
            <span aria-hidden style={{ color: RED }}>•</span>
            <span>Enseignants en direct selon la formule</span>
          </p>
        </div>
      </div>
    </section>
  );
}
