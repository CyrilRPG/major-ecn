import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArenaPage } from "@/components/arena/arena-shell";
import { RoundLobby } from "@/components/arena/round-lobby";
import { MissedRound, RoundResults } from "@/components/arena/round-results";
import { DEFAULT_BAREME } from "@/lib/arena/scoring";
import { DesignQuestion } from "./question";
import { AvatarShowcase } from './avatars';
import { DEFAULT_ARENA_AVATAR } from '@/components/arena/avatars';
import { TournamentFinal } from '@/components/arena/tournament-final';
import { finalFixture } from './final-fixture';
import type { FinalVariant } from '@/lib/arena/final-summary';
import { roundOutcome } from '@/lib/arena/performance';
import { passerelleContent, type PasserelleAudience } from '@/lib/arena/passerelle';

/** Écrans de résultat du cahier des charges complémentaire (score /20 → /10, rang, publication, statut Major ECN). */
const RESULT_STATES: Record<string, { score: number; rank: number | null; published: boolean; audience: PasserelleAudience; label: string }> = {
  'results': { score: 12, rank: null, published: false, audience: 'prospect', label: 'Résultats (non publiés)' },
  'results-unranked': { score: 6, rank: null, published: true, audience: 'prospect', label: 'Non classé (< 50 %)' },
  'results-ranked': { score: 11, rank: 12, published: true, audience: 'prospect', label: 'Classé 12e' },
  'results-podium-1': { score: 11, rank: 1, published: true, audience: 'prospect', label: '1er sans trophée' },
  'results-podium-2': { score: 11.5, rank: 2, published: true, audience: 'student', label: '2e sans trophée (élève)' },
  'results-high': { score: 16, rank: 5, published: true, audience: 'prospect', label: '5e ≥ 70 %' },
  'results-trophy': { score: 17, rank: 1, published: true, audience: 'student', label: 'Trophée Or (élève)' },
};

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Recette visuelle EVC Arena",
  robots: { index: false, follow: false },
};

/** Local visual fixtures use the same components as the authenticated tournament. */
export default async function ArenaDesignPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string; effectif?: string }>;
}) {
  if (process.env.NODE_ENV !== "development") notFound();
  if (process.env.ARENA_DESIGN_FIXTURES !== "1") redirect('/arena/demo-medecine-interne/espace');
  const { state = "lobby", effectif } = await searchParams;
  const variant = state.startsWith('final-') ? state.slice(6) as FinalVariant : null;
  const finalSummary = variant && ['champion','silver','bronze','podium','top','standard','progress'].includes(variant) ? finalFixture(variant, effectif === '1') : null;
  const resultState = RESULT_STATES[state] ?? null;
  const resultOutcome = resultState ? roundOutcome({ score: resultState.score, max: 20, rank: resultState.rank, published: resultState.published }) : null;
  const resultPasserelle = resultState && resultOutcome ? passerelleContent({ enabled: true, level: resultOutcome.level, audience: resultState.audience, prospectUrl: '/specialites/medecine-generale', studentUrl: '/matieres/col-medecine-generale' }) : null;
  const round = {
    number: 1,
    theme: "Vascularités et maladies systémiques",
    opens_at: "2026-09-07T10:53:00Z",
    closes_at: "2026-09-14T10:53:00Z",
  };
  const next = {
    number: 2,
    theme: "Syndromes inflammatoires, auto-immunité et infections",
    opens_at: "2026-09-15T10:00:00Z",
    closes_at: "2026-09-15T18:00:00Z",
    questionCount: 20,
    max: 20,
    duration: 20,
  };
  const rounds = [
    round,
    { ...next, opens_at: "2026-09-21T10:00:00Z" },
    {
      ...round,
      number: 3,
      theme: "Synthèse en médecine interne",
      opens_at: "2026-10-05T10:00:00Z",
      closes_at: "2026-10-12T18:00:00Z",
    },
  ];
  const nav = {
    slug: "demo-medecine-interne",
    title: "EVC Arena",
    participant: { pseudo: "DrHorus27", avatar_seed: DEFAULT_ARENA_AVATAR, rank: finalSummary?.general?.rank ?? null },
    registrationOpen: true,
    leaderboardEnabled: true,
  };
  const shared = {
    round,
    total: 3,
    base: "/arena/demo-medecine-interne",
    next,
    correctionsAvailable: true,
  };
  return (
    <>
      <aside role="status" style={{ padding: 16, background: '#ffca4c', color: '#001019', textAlign: 'center' }}>Recette graphique interne — données fictives. <Link href="/arena/demo-medecine-interne/espace">Ouvrir mon véritable espace Arena</Link></aside>
      {state === "avatars" ? <AvatarShowcase nav={nav} /> : <ArenaPage nav={nav} immersive bare>
        {finalSummary ? <TournamentFinal summary={finalSummary} base="/arena/demo-medecine-interne" passerelle={resultState ? null : passerelleContent({ enabled: true, level: finalSummary.level, audience: effectif === '1' ? 'student' : 'prospect', prospectUrl: '/specialites/medecine-generale', studentUrl: '/matieres/col-medecine-generale' })} /> : state === "lobby" ? (
          <RoundLobby
            slug={nav.slug}
            round={round}
            rounds={rounds}
            participant={nav.participant}
            questionCount={20}
            duration={20}
            bareme={DEFAULT_BAREME}
            ns={[2, 3]}
            participantCount={247}
            nowIso="2026-09-09T10:00:00Z"
            countdownText="5 j 12 h 35 min"
          >
            <Link href="?state=question" className="ae-button">
              <span aria-hidden>▷</span>Entrer dans l’arène — manche 1
              <span aria-hidden>→</span>
            </Link>
          </RoundLobby>
        ) : state === "missed" ? (
          <MissedRound {...shared} />
        ) : resultState && resultOutcome ? (
          <RoundResults
            {...shared}
            score={resultState.score}
            max={20}
            perfect={Math.round(resultState.score / 2)}
            partial={4}
            failed={20 - Math.round(resultState.score / 2) - 4}
            durationSeconds={688}
            durationMinutes={20}
            outcome={resultOutcome}
            participant={{ pseudo: 'DrHorus27', avatarSeed: DEFAULT_ARENA_AVATAR }}
            cumul={resultState.published ? { rank: resultState.rank, distinction: resultOutcome.distinction, rounds: 1 } : null}
            passerelle={resultPasserelle}
            weakTheme={resultState.score < 10 ? "Vascularites" : null}
          />
        ) : (
          <div className="ae-question-wrap">
            <DesignQuestion />
          </div>
        )}
      </ArenaPage>}
      <nav
        aria-label="Recette locale"
        style={{
          background: "#001019",
          color: "#ffca4c",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 24,
          padding: 20,
          fontSize: 13,
        }}
      >
        {[
          ["lobby", "Avant la manche"],
          ["question", "Question"],
          ...Object.entries(RESULT_STATES).map(([key, s]) => [key, s.label]),
          ["missed", "Manche manquée"],
          ["avatars", "Avatars et palmarès"],
          ['final-champion', 'Champion'], ['final-silver', 'Argent'], ['final-bronze', 'Bronze'], ['final-podium', '1er sans trophée'], ['final-top', 'Top 10 %'], ['final-standard', 'Progression'], ['final-progress', 'Parcours incomplet'],
        ].map(([key, label]) => (
          <Link key={key} href={`?state=${key}`}>
            {label}
          </Link>
        ))}
        {finalSummary && <Link href={`?state=${state}&effectif=${effectif === '1' ? '0' : '1'}`}>{effectif === '1' ? 'Masquer' : 'Afficher'} l’effectif général</Link>}
      </nav>
    </>
  );
}
