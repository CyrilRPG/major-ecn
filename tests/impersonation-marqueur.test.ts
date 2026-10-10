import { test } from 'node:test';
import assert from 'node:assert/strict';
import { signerMarqueur, lireMarqueur, enImpersonation } from '../src/lib/auth/impersonation-marqueur';

// Le secret n'est lu qu'au premier usage : le fixer ici suffit.
process.env.SUPABASE_SERVICE_ROLE_KEY = 'cle-de-test-service-role';
delete process.env.IMPERSONATION_SECRET;

const ADMIN = '11111111-1111-4111-8111-111111111111';
const ELEVE = '22222222-2222-4222-8222-222222222222';
const AUTRE = '33333333-3333-4333-8333-333333333333';

test('marqueur signé, lié à l’élève, en cours → valide', async () => {
  const v = await signerMarqueur(ADMIN, ELEVE);
  const m = await lireMarqueur(v, ELEVE);
  assert.equal(m.etat, 'valide');
  assert.equal(m.etat === 'valide' && m.adminId, ADMIN);
});

test('ancien format (identifiant en clair) ou valeur forgée → invalide', async () => {
  assert.equal((await lireMarqueur(ADMIN, ELEVE)).etat, 'invalide');
  assert.equal((await lireMarqueur('x', ELEVE)).etat, 'invalide');
  assert.equal((await lireMarqueur(`v1.${ADMIN}.${ELEVE}.${Date.now() + 1e6}.AAAA`, ELEVE)).etat, 'invalide');
});

test('marqueur d’un autre compte → invalide', async () => {
  const v = await signerMarqueur(ADMIN, AUTRE);
  assert.equal((await lireMarqueur(v, ELEVE)).etat, 'invalide');
  assert.equal((await lireMarqueur(v, null)).etat, 'invalide');
});

test('charge modifiée (échéance prolongée, cible changée) → invalide', async () => {
  const v = await signerMarqueur(ADMIN, ELEVE, Date.now() + 1000);
  const p = v.split('.');
  assert.equal((await lireMarqueur([p[0], p[1], p[2], String(Date.now() + 9e9), p[4]].join('.'), ELEVE)).etat, 'invalide');
  assert.equal((await lireMarqueur([p[0], p[1], AUTRE, p[3], p[4]].join('.'), AUTRE)).etat, 'invalide');
});

test('authentique mais échu → expire', async () => {
  const v = await signerMarqueur(ADMIN, ELEVE, Date.now() - 1);
  assert.equal((await lireMarqueur(v, ELEVE)).etat, 'expire');
});

test('absent → absent ; raccourci enImpersonation', async () => {
  assert.equal((await lireMarqueur(undefined, ELEVE)).etat, 'absent');
  const v = await signerMarqueur(ADMIN, ELEVE);
  const jar = (val?: string) => ({ get: (n: string) => (n === 'impersonator_id' && val ? { value: val } : undefined) });
  assert.equal(await enImpersonation(jar(v), ELEVE), true);
  assert.equal(await enImpersonation(jar(ADMIN), ELEVE), false);
  assert.equal(await enImpersonation(jar(), ELEVE), false);
});
