import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

/**
 * Migration des relances Découverte rejouée sur un vrai PostgreSQL (PGlite) :
 * trigger de première connexion (et son innocuité en cas d'erreur), append-
 * only, anti-doublon en base, réservation concurrente d'items, synchronisation
 * idempotente, compte supprimé, état complet.
 */
const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;

const SOCLE = `
  create role anon; create role authenticated; create role service_role bypassrls;
  create schema auth;
  create table auth.users(id uuid primary key, email text, last_sign_in_at timestamptz, banned_until timestamptz, deleted_at timestamptz,
    created_at timestamptz default now(), invited_at timestamptz, email_confirmed_at timestamptz);
  create table auth.sessions(id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete cascade, created_at timestamptz default now());
  create table public.profiles(id uuid primary key references auth.users(id) on delete cascade, faculte_id text, role text, permission_scope jsonb,
    email text, first_name text, last_name text, phone text, created_at timestamptz default now(), is_active boolean default true, last_relance_at timestamptz);
`;
const DECOUVERTE = `{"type":"college","colleges":["col-decouverte"],"offer":"decouverte","espace_decouverte":true,"signup":{"specialty":"Psychiatrie","session":"2027","country":"France"}}`;

async function base() {
  const db = new PGlite();
  await db.exec(SOCLE);
  const sql = await readFile('supabase/migrations/20260930200000_relances_decouverte.sql', 'utf8');
  await db.exec(sql);
  return { db, sql };
}

async function profil(db: PGlite, n: number, o: { email?: string; connecte?: boolean; faculte?: string; relance?: string | null; scope?: string } = {}) {
  await db.query(`insert into auth.users(id, email, created_at, invited_at, last_sign_in_at, email_confirmed_at) values ($1,$2, now() - interval '60 days', now() - interval '60 days', $3, $3)`,
    [id(n), o.email ?? `c${n}@exemple.fr`, o.connecte ? new Date(Date.now() - 50 * 86400000).toISOString() : null]);
  if (o.connecte) await db.query(`insert into auth.sessions(user_id, created_at) values ($1, now() - interval '55 days')`, [id(n)]);
  await db.query(`insert into public.profiles(id, faculte_id, role, permission_scope, email, first_name, last_name, created_at, last_relance_at) values ($1,$2,'student',$3::jsonb,$4,'Sara','B', now() - interval '60 days', $5)`,
    [id(n), o.faculte ?? 'major-ecn', o.scope ?? DECOUVERTE, o.email ?? `c${n}@exemple.fr`, o.relance ?? null]);
}

test('migration des relances Découverte sur PostgreSQL réel', async (t) => {
  const { db, sql } = await base();
  try {
    await t.test('rejouable', async () => {
      await db.exec(sql);
      const r = await db.query<{ n: number }>('select count(*)::int n from decouverte_parametres');
      assert.equal(r.rows[0].n, 1);
    });

    await t.test('synchronisation : reprise du stock, ancien système, connexions approchées, idempotente', async () => {
      await profil(db, 1, { relance: new Date(Date.now() - 10 * 86400000).toISOString() });
      await profil(db, 2, { connecte: true });
      await profil(db, 3, { faculte: 'major-odonto' });
      await profil(db, 4, { scope: '{"type":"all","offer":"intensif"}' });
      const r = (await db.query<{ r: Record<string, number> }>('select decouverte_synchroniser() r')).rows[0].r;
      assert.deepEqual(r, { nouveaux: 2, relances_ancien_systeme: 1, premieres_connexions: 1, adresses_modifiees: 0 });
      const c2 = (await db.query<{ premiere_connexion_at: string; premiere_connexion_approx: boolean }>('select premiere_connexion_at, premiere_connexion_approx from decouverte_candidats where user_id=$1', [id(2)])).rows[0];
      assert.equal(c2.premiere_connexion_approx, true);
      assert.ok(Date.now() - new Date(c2.premiere_connexion_at).getTime() > 54 * 86400000, 'plus ancienne trace connue (session)');
      const envois = (await db.query<{ type: string; statut: string }>('select type, statut from decouverte_envois order by type')).rows;
      assert.deepEqual(envois.map((e) => `${e.type}/${e.statut}`), ['ancienne_relance/historique', 'initial/historique', 'initial/historique']);
      const r2 = (await db.query<{ r: Record<string, number> }>('select decouverte_synchroniser() r')).rows[0].r;
      assert.deepEqual(r2, { nouveaux: 0, relances_ancien_systeme: 0, premieres_connexions: 0, adresses_modifiees: 0 });
    });

    await t.test('trigger : première connexion horodatée + événement, une seule fois', async () => {
      const avant = new Date().toISOString();
      await db.query('update auth.users set last_sign_in_at = now() where id=$1', [id(1)]);
      const c = (await db.query<{ premiere_connexion_at: string; premiere_connexion_approx: boolean; id: string }>('select id, premiere_connexion_at, premiere_connexion_approx from decouverte_candidats where user_id=$1', [id(1)])).rows[0];
      assert.ok(c.premiere_connexion_at && new Date(c.premiere_connexion_at).getTime() >= new Date(avant).getTime() - 1000);
      assert.equal(c.premiere_connexion_approx, false);
      await db.query("update auth.users set last_sign_in_at = now() + interval '1 hour' where id=$1", [id(1)]);
      const ev = await db.query<{ n: number }>("select count(*)::int n from decouverte_evenements where candidat_id=$1 and type='premiere_connexion'", [c.id]);
      assert.equal(ev.rows[0].n, 1);
    });

    await t.test('trigger : une erreur interne ne bloque JAMAIS la connexion', async () => {
      await profil(db, 5);
      await db.query('select decouverte_synchroniser()');
      await db.exec('alter table decouverte_candidats rename column premiere_connexion_at to casse');
      await db.query('update auth.users set last_sign_in_at = now() where id=$1', [id(5)]);
      const u = await db.query<{ last_sign_in_at: string | null }>('select last_sign_in_at from auth.users where id=$1', [id(5)]);
      assert.ok(u.rows[0].last_sign_in_at, 'la connexion est passée malgré l’erreur');
      await db.exec('alter table decouverte_candidats rename column casse to premiere_connexion_at');
      // Rattrapage par la synchronisation (date approchée).
      await db.query('select decouverte_synchroniser()');
      const c = await db.query<{ premiere_connexion_at: string | null }>('select premiere_connexion_at from decouverte_candidats where user_id=$1', [id(5)]);
      assert.ok(c.rows[0].premiere_connexion_at);
    });

    await t.test('timeline, journal et oppositions en ajout seul', async () => {
      await assert.rejects(db.exec("update decouverte_evenements set type='x'"), /ajout seul/);
      await assert.rejects(db.exec('delete from decouverte_evenements'), /ajout seul/);
      await assert.rejects(db.exec('truncate decouverte_evenements'), /ajout seul/);
      await db.exec("insert into communication_oppositions(email_normalise, source) values ('stop@exemple.fr','admin')");
      await assert.rejects(db.exec('delete from communication_oppositions'), /ajout seul/);
      await assert.rejects(db.exec("update communication_oppositions set source='plainte'"), /ajout seul/);
      await db.exec("insert into communication_oppositions(email_normalise, source) values ('stop@exemple.fr','plainte') on conflict do nothing");
      assert.equal((await db.query<{ n: number }>('select count(*)::int n from communication_oppositions')).rows[0].n, 1);
      await assert.rejects(db.exec("insert into communication_oppositions(email_normalise, source) values ('Maj@Exemple.fr','admin')"));
    });

    await t.test('anti-doublon en base : un seul R1 réservé/envoyé/importé ; exceptionnel et échec à part', async () => {
      const c = (await db.query<{ id: string }>('select id from decouverte_candidats where user_id=$1', [id(5)])).rows[0].id;
      const ins = (type: string, statut: string, exc = false) => db.query(`insert into decouverte_envois(candidat_id, type, origine, statut, exceptionnel) values ($1,$2,'module',$3,$4)`, [c, type, statut, exc]);
      await ins('R1', 'echec');
      await ins('R1', 'en_cours');
      await assert.rejects(ins('R1', 'envoye'), /duplicate key|unique/);
      await assert.rejects(ins('R1', 'historique'), /duplicate key|unique/);
      await ins('R1', 'envoye', true); // relance exceptionnelle confirmée
      await ins('R2', 'envoye');
      await ins('ancienne_relance', 'historique');
      await ins('ancienne_relance', 'historique');
      // Deux « administrateurs » simultanés : un seul gagne.
      const res = await Promise.allSettled([ins('R3', 'en_cours'), ins('R3', 'en_cours')]);
      assert.equal(res.filter((x) => x.status === 'fulfilled').length, 1);
    });

    await t.test('réservation d’items : deux exécutions concurrentes ne partagent aucun item', async () => {
      const cands = (await db.query<{ id: string }>('select id from decouverte_candidats')).rows.map((r) => r.id);
      const op = (await db.query<{ id: string }>("insert into decouverte_operations(cle_idempotence, type, mode) values ('cle-test-001','groupe','relance') returning id")).rows[0].id;
      await assert.rejects(db.exec("insert into decouverte_operations(cle_idempotence, type, mode) values ('cle-test-001','groupe','relance')"), /duplicate key|unique/);
      for (const c of cands) await db.query('insert into decouverte_operation_items(operation_id, candidat_id, type_prevu) values ($1,$2,$3)', [op, c, 'R1']);
      const [a, b] = await Promise.all([
        db.query<{ id: string }>('select id from decouverte_reserver_items($1, 2)', [op]),
        db.query<{ id: string }>('select id from decouverte_reserver_items($1, 2)', [op]),
      ]);
      const ids = [...a.rows, ...b.rows].map((r) => r.id);
      assert.equal(new Set(ids).size, ids.length);
      const reste = await db.query<{ id: string }>('select id from decouverte_reserver_items($1, 50)', [op]);
      assert.equal(ids.length + reste.rows.length, cands.length);
      assert.equal((await db.query('select id from decouverte_reserver_items($1, 50)', [op])).rows.length, 0);
      // Item interrompu depuis plus de 3 minutes : repris.
      await db.query("update decouverte_operation_items set claimed_at = now() - interval '4 minutes' where id=$1", [ids[0]]);
      assert.equal((await db.query('select id from decouverte_reserver_items($1, 50)', [op])).rows.length, 1);
    });

    await t.test('changement d’adresse : historisé, liens révoqués, blocage levé', async () => {
      const c = (await db.query<{ id: string }>('select id from decouverte_candidats where user_id=$1', [id(5)])).rows[0].id;
      const e = (await db.query<{ id: string }>("select id from decouverte_envois where candidat_id=$1 and type='R2'", [c])).rows[0].id;
      await db.query("insert into decouverte_liens(jeton_hash, envoi_id, candidat_id, expire_at) values ('h1',$1,$2, now() + interval '30 days')", [e, c]);
      await db.query("update decouverte_candidats set email_bloque_adresse='c5@exemple.fr', email_bloque_raison='Permanent', email_bloque_at=now() where id=$1", [c]);
      await db.query("update auth.users set email='Nouvelle@Exemple.fr' where id=$1", [id(5)]);
      const r = (await db.query<{ r: Record<string, number> }>('select decouverte_synchroniser() r')).rows[0].r;
      assert.equal(r.adresses_modifiees, 1);
      const cc = (await db.query<{ email_normalise: string; email_bloque_adresse: string | null }>('select email_normalise, email_bloque_adresse from decouverte_candidats where id=$1', [c])).rows[0];
      assert.deepEqual(cc, { email_normalise: 'nouvelle@exemple.fr', email_bloque_adresse: null });
      assert.ok((await db.query<{ revoque_at: string | null }>("select revoque_at from decouverte_liens where jeton_hash='h1'")).rows[0].revoque_at);
      const types = (await db.query<{ type: string }>('select type from decouverte_evenements where candidat_id=$1 order by id', [c])).rows.map((x) => x.type);
      assert.ok(types.includes('email_modifie') && types.includes('adresse_debloquee'));
    });

    await t.test('compte supprimé : fiche et historique conservés, suppression datée et tracée', async () => {
      await db.query('delete from auth.users where id=$1', [id(2)]);
      const c = (await db.query<{ user_id: string | null; compte_supprime_at: string | null; id: string }>("select id, user_id, compte_supprime_at from decouverte_candidats where email_normalise='c2@exemple.fr'")).rows[0];
      assert.equal(c.user_id, null);
      assert.ok(c.compte_supprime_at);
      assert.equal((await db.query<{ n: number }>("select count(*)::int n from decouverte_evenements where candidat_id=$1 and type='compte_supprime'", [c.id])).rows[0].n, 1);
    });

    await t.test('état complet : une seule valeur, champs frais d’auth.users et du profil', async () => {
      const e = (await db.query<{ e: { candidats: Array<Record<string, unknown>>; envois: unknown[]; oppositions: unknown[] } }>('select decouverte_etat() e')).rows[0].e;
      assert.equal(e.candidats.length, 3);
      const c5 = e.candidats.find((c) => c.user_id === id(5))!;
      assert.equal(c5.auth_email, 'Nouvelle@Exemple.fr');
      assert.equal(c5.profil_offre, 'decouverte');
      assert.ok(e.envois.length >= 6);
      const un = (await db.query<{ e: { candidats: unknown[] } }>('select decouverte_etat(array[$1]::uuid[]) e', [c5.id])).rows[0].e;
      assert.equal(un.candidats.length, 1);
    });
  } finally {
    await db.close();
  }
});
