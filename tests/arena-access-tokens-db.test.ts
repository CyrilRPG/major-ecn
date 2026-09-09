import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const hash = (n: number) => n.toString(16).padStart(64, '0');
type Result = { ok: boolean; status?: string; throttled?: boolean; tokenId?: string; first?: boolean; retryAfter?: number };

test('accès Arena : véritables RPC PostgreSQL, renvois, consommation et permissions', async t => {
  const db = new PGlite();
  try {
    await db.exec(`
      create role anon; create role authenticated; create role service_role bypassrls;
      create table arena_participants(id uuid primary key, tournament_id uuid, login_token_hash text, login_token_expires_at timestamptz,
        confirmation_token_hash text, confirmation_sent_at timestamptz, email_confirmed_at timestamptz,
        last_login_at timestamptz, blocked_at timestamptz, anonymized_at timestamptz);
      insert into arena_participants(id,tournament_id,login_token_hash,login_token_expires_at,confirmation_token_hash,confirmation_sent_at)
        values ('${id(1)}','${id(99)}','${hash(1)}',now()+interval '1 hour','${hash(2)}',now()-interval '2 minutes');
    `);
    const sql = await readFile('supabase/migrations/20260910010000_arena_access_tokens.sql', 'utf8');
    await db.exec(sql);
    const reserve = async (n: number, kind = 'login', participant = 1) => (await db.query<{r: Result}>(
      'select arena_reserve_access_token($1,$2,$3) r', [id(participant), kind, hash(n)])).rows[0].r;
    const consume = async (n: number, kind = 'login') => (await db.query<{r: Result}>(
      'select arena_consume_access_token($1,$2) r', [hash(n), kind])).rows[0].r;
    const age = () => db.exec("update arena_access_tokens set created_at=now()-interval '61 seconds'");
    await t.test('migration rejouable ; anciens liens conservés ; GET sans consommation', async () => {
      await db.exec(sql);
      assert.equal((await db.query('select * from arena_access_tokens')).rows.length, 2);
      assert.equal((await db.query<{ used_at: string | null }>('select used_at from arena_access_tokens where token_hash=$1', [hash(1)])).rows[0].used_at, null);
      assert.equal((await consume(2,'confirmation')).first, true);
      assert.equal((await consume(2,'confirmation')).ok, false);
      assert.equal((await consume(1)).first, false);
    });
    await t.test('réservations concurrentes : un seul nouvel email par minute', async () => {
      const results = await Promise.all([reserve(3),reserve(4)]);
      assert.equal(results.filter(r => r.tokenId).length,1);
      assert.equal(results.filter(r => r.throttled).length,1);
      assert.ok(results.find(r => r.throttled)!.retryAfter! <= 60);
    });
    await t.test('un renvoi conserve le premier lien ; chaque lien est à usage unique', async () => {
      await age();
      assert.ok((await reserve(5)).tokenId);
      assert.equal((await consume(3)).ok, true);
      assert.equal((await consume(3)).ok, false);
      assert.equal((await consume(5)).ok, true);
    });
    await t.test('validation simultanée : une seule consommation', async () => {
      await age(); await reserve(6);
      const results = await Promise.all([consume(6),consume(6)]);
      assert.deepEqual(results.map(r => r.ok).sort(),[false,true]);
    });
    await t.test('échec d’envoi : ancien lien préservé, nouvel essai possible', async () => {
      await age(); await reserve(7);
      await age(); await reserve(8);
      await db.query("update arena_access_tokens set delivery_status='failed' where token_hash=$1",[hash(8)]);
      assert.ok((await reserve(9)).tokenId);
      assert.equal((await consume(8)).ok,false);
      assert.equal((await consume(7)).ok,true);
      assert.equal((await consume(9)).ok,true);
    });
    await t.test('réponse réseau perdue : lien pending utilisable si le mail est arrivé', async () => {
      await age(); await reserve(10);
      assert.equal((await consume(10)).ok,true);
    });
    await t.test('expiration, mauvais type et jeton inconnu refusés', async () => {
      await age(); await reserve(11);
      await db.query("update arena_access_tokens set expires_at=now()-interval '1 second' where token_hash=$1",[hash(11)]);
      assert.equal((await consume(11)).status,'expired');
      assert.equal((await consume(11,'confirmation')).status,'unknown');
      assert.equal((await consume(999)).status,'unknown');
      await age(); await reserve(12,'confirmation');
      await db.query("update arena_access_tokens set expires_at=now()-interval '1 second' where token_hash=$1",[hash(12)]);
      assert.equal((await consume(12,'confirmation')).status,'expired');
    });
    await t.test('comptes bloqués ou anonymisés refusés à chaque étape', async () => {
      await age(); await reserve(13);
      for (const field of ['blocked_at','anonymized_at']) {
        await db.exec(`update arena_participants set ${field}=now()`);
        assert.equal((await consume(13)).status,'blocked');
        assert.equal((await reserve(14)).ok,false);
        await db.exec(`update arena_participants set ${field}=null`);
      }
    });
    await t.test('ancien déploiement : lien émis après migration reconnu, puis consommé', async () => {
      await db.query("update arena_participants set login_token_hash=$1, login_token_expires_at=now()+interval '1 hour'",[hash(15)]);
      assert.equal((await consume(15)).ok,true);
      assert.equal((await consume(15)).ok,false);
    });
    await t.test('un lien consommé par l’ancien déploiement ne peut pas être réutilisé', async () => {
      await db.query("update arena_participants set login_token_hash=$1, login_token_expires_at=now()+interval '1 hour'",[hash(16)]);
      await db.exec(sql);
      await db.exec('update arena_participants set login_token_hash=null');
      assert.equal((await consume(16)).ok,false);
    });
    await t.test('API publique et comptes pédagogiques : aucune lecture/émission/consommation', async () => {
      for(const role of ['anon','authenticated']) {
        await db.exec(`set role ${role}`);
        await assert.rejects(db.query('select * from arena_access_tokens'),/permission denied/);
        await assert.rejects(reserve(90),/permission denied/);
        await assert.rejects(consume(13),/permission denied/);
        await db.exec('reset role');
      }
      await db.exec('set role service_role');
      assert.equal((await consume(13)).ok,true);
      await db.exec('reset role');
    });
  } finally { await db.close(); }
});
