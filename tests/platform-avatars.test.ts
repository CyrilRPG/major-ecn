import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { AVATARS_PLANCHE } from '../src/components/arena/avatars';
import { PLATFORM_AVATARS, isPlatformAvatar, randomAvatarSeed, effectiveSeed, platformAvatarUrl } from '../src/lib/avatar';
import { canoniserAvatar, decoderAvatar, encoderAvatar, estAvatarCompose, portraitDe } from '../src/lib/avatars/traits';

const MIGRATION_PLANCHE = 'supabase/migrations/20260909190000_platform_arena_avatars.sql';
const MIGRATION_COMPOSES = 'supabase/migrations/20260921100000_avatars_composes.sql';

test('catalogue pédagogique : les portraits Arena sauf le gladiateur', async () => {
  assert.equal(PLATFORM_AVATARS.length, 23);
  assert.deepEqual(PLATFORM_AVATARS, AVATARS_PLANCHE.filter(a => a.id !== 'casque'));
  for (const a of PLATFORM_AVATARS) {
    // Un portrait de l'ancienne planche reste accepté, et devient un médaillon
    // sans ornement qui conserve exactement ce visage.
    assert.ok(isPlatformAvatar(a.id));
    const promu = effectiveSeed('compte', a.id);
    assert.ok(estAvatarCompose(promu));
    assert.equal(portraitDe(decoderAvatar(promu)), a.id);
    await access(`public/arena/avatars/${a.id}.png`);
  }
  for (const invalid of [null, undefined, 42, {}, 'casque', 'ancienne-graine', '../casque', 'c1-', 'c1-012']) {
    assert.equal(isPlatformAvatar(invalid), false, String(invalid));
  }
  // Le gladiateur est refusé côté plateforme, en portrait comme en emblème.
  const casque = AVATARS_PLANCHE.findIndex(a => a.id === 'casque');
  assert.equal(isPlatformAvatar(encoderAvatar({ portrait: casque })), false);
  assert.equal(isPlatformAvatar(encoderAvatar({ portrait: 1, embleme: 1 })), false);

  for (let i = 0; i < 100; i++) {
    const tire = randomAvatarSeed();
    assert.ok(isPlatformAvatar(tire), tire);
    // Un compte sans choix garde toujours le même médaillon.
    assert.equal(effectiveSeed(String(i), null), effectiveSeed(String(i), null));
  }
});

test('URL d’image : un médaillon composé passe par la route SVG', () => {
  const compose = randomAvatarSeed();
  assert.equal(platformAvatarUrl(compose), `/api/avatar/${canoniserAvatar(compose)}.svg`);
  // Le repli d'un compte sans choix est lui aussi un médaillon composé.
  assert.match(platformAvatarUrl('compte-sans-choix'), /^\/api\/avatar\/c1-[0-9a-z]{7}\.svg$/);
});

test('migration : la base accepte les médaillons composés et en garantit l’unicité', async () => {
  const db = new PGlite();
  try {
    await db.exec(`
      create table profiles(id int primary key, faculte_id text default 'major-ecn', avatar_seed text, pseudo text, email text);
      create table arena_participants(id int primary key, tournament_id int, faculte_id text, email text, avatar_seed text, anonymized_at timestamptz);
      insert into profiles values (1,'major-ecn',null,'A'), (2,'major-ecn','old-seed','B'),
        (3,'major-ecn','casque','C'), (4,'autre','old-seed','D');
      insert into arena_participants values (1,1,'arena','p1@test.fr','casque',null);
    `);
    await db.exec(await readFile(MIGRATION_PLANCHE, 'utf8'));
    await db.exec(await readFile(MIGRATION_COMPOSES, 'utf8'));

    // 1. Un médaillon composé n'est plus écrasé par le déclencheur.
    const choisi = encoderAvatar({ portrait: 4, fond: 3, cadre: 2, couleurCadre: 1, embleme: 5 });
    await db.exec(`insert into profiles(id, avatar_seed) values (10, '${choisi}');`);
    const { rows } = await db.query<{ avatar_seed: string }>('select avatar_seed from profiles where id = 10');
    assert.equal(rows[0].avatar_seed, choisi);

    // 2. Un compte sans choix reçoit un médaillon composé valide, hors gladiateur.
    await db.exec('insert into profiles(id) values (11);');
    const attribue = (await db.query<{ avatar_seed: string }>('select avatar_seed from profiles where id = 11')).rows[0].avatar_seed;
    assert.ok(estAvatarCompose(attribue), attribue);
    assert.ok(isPlatformAvatar(attribue), attribue);

    // 3. Deux comptes Major ECN ne portent jamais le même médaillon.
    await assert.rejects(
      db.exec(`insert into profiles(id, avatar_seed) values (12, '${choisi}');`),
      /duplicate key|unique/i,
    );
    // Une autre faculté n'est pas concernée par cette unicité.
    await db.exec(`insert into profiles(id, faculte_id, avatar_seed) values (13, 'autre', '${choisi}');`);

    // 4. EVC Arena est CLOISONNÉ : le même médaillon y est libre.
    await db.exec(`insert into arena_participants values (2, 1, 'arena', 'p2@test.fr', '${choisi}', null);`);
    // ...mais pas deux fois dans le même tournoi.
    await assert.rejects(
      db.exec(`insert into arena_participants values (3, 1, 'arena', 'p3@test.fr', '${choisi}', null);`),
      /duplicate key|unique/i,
    );
    // Un autre tournoi, en revanche, repart de zéro.
    await db.exec(`insert into arena_participants values (4, 2, 'arena', 'p4@test.fr', '${choisi}', null);`);
    // Et un participant anonymisé libère son médaillon.
    await db.exec(`insert into arena_participants values (5, 1, 'arena', 'p5@test.fr', '${choisi}', now());`);

    // 5. Les portraits de l'ancienne planche restent partagés sans conflit.
    await db.exec(`insert into arena_participants values (6, 1, 'arena', 'p6@test.fr', 'casque', null), (7, 1, 'arena', 'p7@test.fr', 'casque', null);`);

    // 6. Rejeu sans effet de bord.
    const avant = (await db.query('select id, avatar_seed from profiles order by id')).rows;
    await db.exec(await readFile(MIGRATION_COMPOSES, 'utf8'));
    assert.deepEqual((await db.query('select id, avatar_seed from profiles order by id')).rows, avant);
  } finally {
    await db.close();
  }
});

test('reprise : chacun garde son visage, seuls les ornements changent', async () => {
  const db = new PGlite();
  try {
    await db.exec(`
      create table profiles(id int primary key, faculte_id text default 'major-ecn',
        avatar_seed text, email text);
      create table arena_participants(id int primary key, tournament_id int,
        faculte_id text, email text, avatar_seed text, anonymized_at timestamptz);

      -- Le déclencheur de production qui fige l'avatar d'un participant
      -- (« Le personnage choisi est conservé pendant toute l'Arena »). Il
      -- bloquait la reprise : la migration doit le suspendre le temps du
      -- rattrapage, puis le rétablir.
      create function arena_keep_avatar_identity() returns trigger
        language plpgsql as $t$
        begin
          if new.avatar_seed is distinct from old.avatar_seed then
            raise exception 'Le personnage choisi est conservé pendant toute l''Arena.'
              using errcode = '23514';
          end if;
          return new;
        end;
        $t$;
      create trigger arena_keep_avatar_identity before update of avatar_seed
        on arena_participants for each row execute function arena_keep_avatar_identity();
    `);

    // La migration de 09/2026 réinitialise tous les avatars Major ECN : elle
    // est jouée AVANT que les comptes ne choisissent leur portrait, comme en
    // production. La jouer après écraserait les visages que l'on veut préserver.
    await db.exec(await readFile(MIGRATION_PLANCHE, 'utf8'));

    // 60 comptes qui portent tous LE MÊME portrait : la reprise doit leur
    // donner 60 habillages distincts sans jamais changer le visage.
    const memePortrait = Array.from({ length: 60 }, (_, i) =>
      `(${i + 1}, 'major-ecn', 'medecin-07', 'u${i}@test.fr')`).join(',');
    await db.exec(`insert into profiles values ${memePortrait};`);
    // Un compte sans choix, et un compte d'une autre faculté à ne pas toucher.
    await db.exec(`insert into profiles values (200,'major-ecn',null,'v@test.fr'), (201,'autre','old-seed','w@test.fr');`);

    // Participants Arena : un portrait direct, une graine procédurale dont le
    // visage doit venir du compte Major ECN de même adresse, et un anonymisé.
    await db.exec(`
      insert into arena_participants values
        (1, 1, 'major-ecn', 'u0@test.fr', 'k3f9x2a1', null),
        (2, 1, 'major-ecn', 'a@test.fr', 'lion', null),
        (3, 1, 'autre', 'b@test.fr', 'casque', null),
        (4, 1, 'major-ecn', 'c@test.fr', 'vieille-graine', now());
    `);

    await db.exec(await readFile(MIGRATION_COMPOSES, 'utf8'));

    const profils = (await db.query<{ id: number; avatar_seed: string; faculte_id: string }>(
      'select id, avatar_seed, faculte_id from profiles order by id')).rows;

    // 1. Le visage est conservé, et le médaillon est valide.
    const repris = profils.filter(p => p.id <= 60);
    for (const p of repris) {
      assert.ok(estAvatarCompose(p.avatar_seed), `${p.id} → ${p.avatar_seed}`);
      assert.equal(portraitDe(decoderAvatar(p.avatar_seed)), 'medecin-07');
      assert.ok(isPlatformAvatar(p.avatar_seed), p.avatar_seed);
    }
    // 2. Soixante habillages distincts sur le même visage.
    assert.equal(new Set(repris.map(p => p.avatar_seed)).size, 60);
    // 3. Les ornements ont bien varié, ce n'est pas une valeur constante.
    assert.ok(new Set(repris.map(p => decoderAvatar(p.avatar_seed).fond)).size > 3);

    // 4. Un compte sans choix reçoit un visage, jamais le gladiateur.
    const sansChoix = profils.find(p => p.id === 200)!;
    assert.ok(estAvatarCompose(sansChoix.avatar_seed));
    assert.notEqual(portraitDe(decoderAvatar(sansChoix.avatar_seed)), 'casque');
    // 5. Une autre faculté n'est pas touchée.
    assert.equal(profils.find(p => p.id === 201)!.avatar_seed, 'old-seed');

    const participants = (await db.query<{ id: number; avatar_seed: string }>(
      'select id, avatar_seed from arena_participants order by id')).rows;
    const parId = new Map(participants.map(p => [p.id, p.avatar_seed]));

    // 6. La graine procédurale reprend le visage du compte Major ECN homonyme.
    const visageProfil = portraitDe(decoderAvatar(profils.find(p => p.id === 1)!.avatar_seed));
    assert.equal(portraitDe(decoderAvatar(parId.get(1)!)), visageProfil);
    // 7. Un portrait direct est conservé tel quel, même hors Major ECN.
    assert.equal(portraitDe(decoderAvatar(parId.get(2)!)), 'lion');
    assert.equal(portraitDe(decoderAvatar(parId.get(3)!)), 'casque');
    // 8. Un participant anonymisé n'est pas réveillé.
    assert.equal(parId.get(4), 'vieille-graine');

    // 9. Le déclencheur qui fige l'avatar est rétabli : la suspension ne dure
    //    que le temps de la reprise.
    await assert.rejects(
      db.exec("update arena_participants set avatar_seed = 'c1-0000000' where id = 2;"),
      /conservé pendant toute l/,
    );

    // 10. Rejeu : tout est déjà composé, plus rien ne bouge.
    const avant = (await db.query('select id, avatar_seed from profiles order by id')).rows;
    await db.exec(await readFile(MIGRATION_COMPOSES, 'utf8'));
    assert.deepEqual((await db.query('select id, avatar_seed from profiles order by id')).rows, avant);
  } finally {
    await db.close();
  }
});
