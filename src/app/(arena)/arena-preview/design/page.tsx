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
  const finalSummary = variant && ['champion','silver','bronze','top','standard','progress'].includes(variant) ? finalFixture(variant, effectif === '1') : null;
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
        {finalSummary ? <TournamentFinal summary={finalSummary} base="/arena/demo-medecine-interne" /> : state === "lobby" ? (
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
        ) : state === "results" ? (
          <RoundResults
            {...shared}
            score={3}
            max={20}
            perfect={2}
            partial={5}
            failed={13}
            durationSeconds={688}
            durationMinutes={20}
            position="Dans la seconde moitié du classement"
            positionDetail="Le classement complet sera publié à la clôture de la manche."
            weakTheme="Vascularites"
            feedbackSubject="les vascularites"
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
          ["results", "Résultats"],
          ["missed", "Manche manquée"],
          ["avatars", "Avatars et palmarès"],
          ['final-champion', 'Champion'], ['final-silver', 'Argent'], ['final-bronze', 'Bronze'], ['final-top', 'Top 10 %'], ['final-standard', 'Progression'], ['final-progress', 'Parcours incomplet'],
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
