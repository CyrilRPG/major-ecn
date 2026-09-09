import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;

test('migration Arena : publication atomique, historique, identité et accès privé', async t => {
  const db = new PGlite();
  try {
    // Minimal existing Arena schema; test the actual production migration/RPC.
    await db.exec(`
      create role anon; create role authenticated; create role service_role bypassrls;
      create table arena_tournaments(id uuid primary key);
      create table arena_rounds(id uuid primary key, tournament_id uuid references arena_tournaments(id), number int, closes_at timestamptz, results_published_at timestamptz);
      create table arena_participants(id uuid primary key, tournament_id uuid references arena_tournaments(id), avatar_seed text not null, pseudo text, anonymized_at timestamptz);
      create table arena_attempts(id uuid primary key, round_id uuid references arena_rounds(id), status text);
      grant all on all tables in schema public to service_role;
      insert into arena_tournaments values ('${id(1)}'), ('${id(2)}');
      insert into arena_rounds values ('${id(11)}','${id(1)}',1,'2020-01-01',null), ('${id(12)}','${id(1)}',2,'2020-01-02',null), ('${id(13)}','${id(1)}',3,'2020-01-03',null);
      insert into arena_participants values ('${id(21)}','${id(1)}','medecin-01','Joueur',null), ('${id(22)}','${id(2)}','lion','Autre',null);
    `);
    await db.exec(await readFile('supabase/migrations/20260909110000_arena_avatar_rank_history.sql', 'utf8'));
    const publish = async (round: number, expected: number[], entries: unknown[], final = false) => (await db.query<{ ok: boolean }>(
      'select arena_publish_ranking_snapshot($1, $2::uuid[], $3, $4, false, $5::jsonb) as ok',
      [id(round), expected.map(id), '2026-09-09T12:00:00Z', final, JSON.stringify(entries)],
    )).rows[0].ok;
    const entry = (rank: number, score: number) => ({ participant_id: id(21), rank, total_score: score, total_max: 39 });

    await t.test('un autre personnage est refusé en base ; les réglages et l’anonymisation restent possibles', async () => {
      await assert.rejects(db.query('update arena_participants set avatar_seed=$1 where id=$2', ['lion', id(21)]), /personnage choisi/);
      await db.query('update arena_participants set avatar_seed=$1, pseudo=$2 where id=$3', ['medecin-01', 'Joueur2', id(21)]);
      await db.query('update arena_participants set anonymized_at=now() where id=$1', [id(22)]);
    });
    await t.test('une erreur de snapshot ne publie pas les résultats', async () => {
      await assert.rejects(publish(11, [], [entry(0, 10)]));
      const row = (await db.query('select results_published_at, ranking_snapshot_at from arena_rounds where id=$1', [id(11)])).rows[0];
      assert.deepEqual(row, { results_published_at: null, ranking_snapshot_at: null });
      assert.equal((await db.query('select * from arena_rank_history')).rows.length, 0);
      await assert.rejects(publish(11, [], [{ ...entry(1, 10), participant_id: id(22) }]), /étranger/);
    });
    await t.test('une tentative ouverte bloque la publication', async () => {
      await db.query('insert into arena_attempts values ($1,$2,$3)', [id(31), id(11), 'in_progress']);
      await assert.rejects(publish(11, [], [entry(1, 10)]), /encore ouvertes/);
      await db.query('update arena_attempts set status=$1 where id=$2', ['expired', id(31)]);
    });
    await t.test('trois publications conservent 1er → 2e → 1er ; un rejeu ne remplace pas un ancien rang', async () => {
      assert.equal(await publish(11, [], [entry(1, 10)]), true);
      assert.equal(await publish(11, [], [entry(6, 1)]), true);
      assert.equal(await publish(12, [], [entry(2, 20)]), false, 'détecte un cumul concurrent devenu obsolète');
      assert.equal(await publish(12, [11], [entry(2, 20)]), true);
      assert.equal(await publish(13, [11, 12], [entry(1, 30)], true), true);
      const rows = (await db.query<{ rank: number; is_final: boolean }>('select rank, is_final from arena_rank_history order by round_number')).rows;
      assert.deepEqual(rows.map(r => r.rank), [1, 2, 1]);
      assert.deepEqual(rows.map(r => r.is_final), [false, false, true]);
    });
    await t.test('ni les visiteurs ni les comptes authentifiés ne peuvent lire ou publier le palmarès', async () => {
      for (const role of ['anon', 'authenticated']) {
        await db.exec(`set role ${role}`);
        await assert.rejects(db.query('select * from arena_rank_history'), /permission denied/);
        await assert.rejects(publish(11, [], []), /permission denied/);
        await db.exec('reset role');
      }
      await db.exec('set role service_role');
      assert.equal((await db.query('select * from arena_rank_history')).rows.length, 3);
      await db.exec('reset role');
    });
  } finally { await db.close(); }
});
