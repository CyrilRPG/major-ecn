import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { AVATARS_PLANCHE } from '../src/components/arena/avatars';
import { PLATFORM_AVATARS, isPlatformAvatar, randomAvatarSeed, effectiveSeed, platformAvatarUrl } from '../src/lib/avatar';

test('catalogue pédagogique : toutes les images Arena sauf le gladiateur', async () => {
  assert.equal(PLATFORM_AVATARS.length, 23);
  assert.deepEqual(PLATFORM_AVATARS, AVATARS_PLANCHE.filter(a => a.id !== 'casque'));
  for (const a of PLATFORM_AVATARS) {
    assert.equal(effectiveSeed('compte', a.id), a.id);
    await access(`public${platformAvatarUrl(a.id)}`);
  }
  for (const invalid of [null, undefined, 42, {}, 'casque', 'ancienne-graine', '../casque']) {
    assert.equal(isPlatformAvatar(invalid), false);
  }
  for (let i = 0; i < 100; i++) {
    assert.ok(isPlatformAvatar(randomAvatarSeed()));
    assert.ok(isPlatformAvatar(effectiveSeed(String(i), 'casque')));
    assert.equal(effectiveSeed(String(i), null), effectiveSeed(String(i), null));
  }
});

test('migration : reset, nouveaux comptes, choix persistés, rejeu et séparation des plateformes', async () => {
  const db = new PGlite();
  try {
    await db.exec(`
      create table profiles(id int primary key, faculte_id text default 'major-ecn', avatar_seed text, pseudo text);
      create table arena_participants(id int, avatar_seed text);
      insert into profiles values (1,'major-ecn',null,'A'), (2,'major-ecn','old-seed','B'),
        (3,'major-ecn','casque','C'), (4,'autre','old-seed','D');
      insert into arena_participants values (1,'casque');
    `);
    const sql = await readFile('supabase/migrations/20260909190000_platform_arena_avatars.sql', 'utf8');
    await db.exec(sql);
    const catalog = (await db.query<{ ids: string[] }>('select major_ecn_avatar_ids() as ids')).rows[0].ids;
    assert.deepEqual(catalog, PLATFORM_AVATARS.map(a => a.id));
    await db.exec("insert into profiles(id) values (5); insert into profiles(id,avatar_seed) values (6,null), (7,'casque'), (8,'hibou');");
    let rows = (await db.query<{ id: number; avatar_seed: string }>('select id,avatar_seed from profiles order by id')).rows;
    assert.ok(rows.filter(r => r.id !== 4).every(r => isPlatformAvatar(r.avatar_seed)));
    assert.equal(rows.find(r => r.id === 4)?.avatar_seed, 'old-seed');
    assert.equal(rows.find(r => r.id === 8)?.avatar_seed, 'hibou');
    await db.exec("update profiles set avatar_seed='lion' where id=1; update profiles set pseudo='modifié' where id=1;");
    rows = (await db.query<{ id: number; avatar_seed: string }>('select id,avatar_seed from profiles order by id')).rows;
    assert.equal(rows[0].avatar_seed, 'lion');
    await db.exec(sql);
    assert.deepEqual((await db.query('select id,avatar_seed from profiles order by id')).rows, rows);
    assert.equal((await db.query<{ avatar_seed: string }>('select avatar_seed from arena_participants')).rows[0].avatar_seed, 'casque');
  } finally { await db.close(); }
});
