import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import {
  computeArenaRankings,
  leaderboardRows,
  type RankingAttempt,
} from "../src/lib/arena/ranking";
import { tournamentFinalSummary } from "../src/lib/arena/final-summary";
import { durationText, meanRoundSeconds } from "../src/lib/arena/format";

const rounds = [1, 2, 3].map((number) => ({
  id: `r${number}`,
  number,
  counted: true,
  maxScore: 20,
  max: 20,
  questionCount: 20,
  date: null,
  theme: "Médecine",
}));
const players = ["complete", "partial", "low", "absent"].map((id) => ({
  id,
  pseudo: id,
  avatarSeed: "medecin-07",
}));
const attempt = (
  participantId: string,
  number: number,
  score: number,
  durationSeconds = 600,
): RankingAttempt => ({
  participantId,
  roundId: `r${number}`,
  score,
  perfectCount: Math.floor(score),
  durationSeconds,
  truncated: false,
});
const attempts = [
  ...rounds.map((r) =>
    attempt("complete", r.number, 18, [542, 571, 581][r.number - 1]),
  ),
  attempt("partial", 1, 20),
  attempt("partial", 2, 20),
  ...rounds.map((r) => attempt("low", r.number, 2)),
];
const opts = { thresholdPct: 50, minRoundsFinal: 2, isFinal: true };
const rankings = () => computeArenaRankings(rounds, attempts, players, opts);
test('les effectifs administratifs incluent les manches disputées non publiées sans publier leurs scores cumulés', () => {
  const r=computeArenaRankings(rounds.map(x=>({...x,counted:x.number===1})),attempts,players,{...opts,isFinal:false});
  assert.equal(r.effectifGeneral,2);
  assert.equal(r.byRound.r2.effectifManche,3);
  assert.equal(r.standings.find(s=>s.participantId==='complete')?.totalScore,18);
  assert.equal(r.standings.find(s=>s.participantId==='complete')?.roundsPlayed,1);
});
const summary = (participantId: string, show = false) =>
  tournamentFinalSummary({
    participantId,
    edition: "2026",
    afficherEffectifGeneral: show,
    rankings: rankings(),
    history: [],
    rounds,
    thresholdPct: 50,
  });

test("effectifs : intersection des trois manches, indépendante du seuil ; rangs de manche conservés", () => {
  const r = rankings();
  assert.equal(r.effectifGeneral, 2);
  assert.deepEqual(
    rounds.map((x) => r.byRound[x.id].effectifManche),
    [3, 3, 2],
  );
  assert.ok(
    rounds.every((x) => r.effectifGeneral <= r.byRound[x.id].effectifManche),
  );
  assert.equal(
    r.standings.find((s) => s.participantId === "partial")?.rank,
    null,
  );
  assert.equal(
    r.byRound.r1.standings.find((s) => s.participantId === "partial")?.rank,
    1,
  );
  assert.equal(
    r.byRound.r1.standings.find((s) => s.participantId === "complete")?.rank,
    2,
  );
  assert.deepEqual(
    leaderboardRows(r.standings).map((s) => s.pseudo),
    ["complete"],
  );
});
test("un doublon de tentative ne gonfle ni les effectifs ni le nombre de manches ni les points", () => {
  const r = computeArenaRankings(
    rounds,
    [...attempts, attempt("partial", 1, 20)],
    players,
    opts,
  );
  assert.equal(r.effectifGeneral, 2);
  assert.equal(
    r.standings.find((s) => s.participantId === "partial")?.roundsPlayed,
    2,
  );
  assert.equal(
    r.standings.find((s) => s.participantId === "partial")?.totalScore,
    40,
  );
});
test("rang et effectif général solidaires, jamais de dénominateur sur les manches", () => {
  assert.equal(summary("complete").general?.text, "1er du classement général");
  assert.equal(
    summary("complete", true).general?.text,
    "1er sur 2 du classement général",
  );
  assert.equal(summary("low", true).general, null);
  assert.equal(summary("partial", true).general, null);
  assert.equal(summary("complete").rounds[0].rank, 2);
  assert.ok(
    summary("complete", true).rounds.every((r) => !("effectifManche" in r)),
  );
});
test("moyenne unique arrondie et dénominateurs de score restreints aux manches disputées", () => {
  const s = summary("complete");
  assert.equal(s.totalSeconds, 1694);
  assert.equal(s.meanSeconds, 565);
  assert.equal(durationText(s.meanSeconds), "9 min 25 s");
  assert.equal(meanRoundSeconds(1694, 3), 565);
  assert.equal(summary("partial").max, 40);
  assert.equal(summary("partial").questionCount, 40);
  assert.equal(summary("partial").rounds[2].played, false);
  assert.equal(summary("absent").meanSeconds, null);
  assert.equal(summary("absent").variant, "progress");
});
test("la liste publique complète dépasse 50 participants, les aperçus restent bornés", () => {
  const ps = Array.from({ length: 140 }, (_, i) => ({
    id: `p${i}`,
    pseudo: `p${i}`,
    avatarSeed: "lion",
  }));
  const ats = ps.flatMap((p) => rounds.map((r) => attempt(p.id, r.number, 20)));
  const r = computeArenaRankings(rounds, ats, ps, opts);
  assert.equal(leaderboardRows(r.standings).length, 140);
  assert.equal(leaderboardRows(r.standings, 10).length, 10);
  assert.equal(r.effectifGeneral, 140);
});
test("les six variantes proviennent des résultats ; le portrait ne change pas", () => {
  const ps = Array.from({ length: 100 }, (_, i) => ({
    id: `p${i}`,
    pseudo: `p${i}`,
    avatarSeed: "medecin-07",
  }));
  const ats = ps.flatMap((p, i) =>
    rounds.map((r) => attempt(p.id, r.number, i === 99 ? 2 : 20 - i / 10)),
  );
  const r = computeArenaRankings(rounds, ats, ps, opts);
  const variants = [0, 1, 2, 9, 99].map(
    (i) =>
      tournamentFinalSummary({
        participantId: `p${i}`,
        edition: "2026",
        afficherEffectifGeneral: true,
        rankings: r,
        history: [],
        rounds,
        thresholdPct: 50,
      }).variant,
  );
  assert.deepEqual(variants, [
    "champion",
    "silver",
    "bronze",
    "top",
    "standard",
  ]);
  assert.ok(r.standings.every((s) => s.avatarSeed === "medecin-07"));
});
test("migration réelle : booléen faux par défaut, format 20, ancien tournoi disputé conservé", async () => {
  const db = new PGlite();
  try {
    await db.exec(`create table arena_tournaments(id int primary key,questions_per_round int default 12,min_rounds_final int default 2,round_duration_minutes int default 12);
      create table arena_rounds(id int primary key,tournament_id int);create table arena_attempts(round_id int,is_preview boolean);
      insert into arena_tournaments(id) values(1),(2);insert into arena_rounds values(1,1);insert into arena_attempts values(1,false);`);
    await db.exec(
      await readFile(
        "supabase/migrations/20260909150000_arena_final_format.sql",
        "utf8",
      ),
    );
    await db.exec("insert into arena_tournaments(id) values(3)");
    const rows = (
      await db.query<{
        questions_per_round: number;
        min_rounds_final: number;
        afficher_effectif_general: boolean;
      }>("select * from arena_tournaments order by id")
    ).rows;
    assert.deepEqual(
      rows.map((r) => r.questions_per_round),
      [12, 20, 20],
    );
    assert.ok(
      rows.every(
        (r) =>
          r.min_rounds_final === 3 && r.afficher_effectif_general === false,
      ),
    );
    await db.exec(
      "update arena_tournaments set afficher_effectif_general=true where id=2",
    );
    assert.equal(
      (
        await db.query<{ afficher_effectif_general: boolean }>(
          "select afficher_effectif_general from arena_tournaments where id=2",
        )
      ).rows[0].afficher_effectif_general,
      true,
    );
  } finally {
    await db.close();
  }
});
