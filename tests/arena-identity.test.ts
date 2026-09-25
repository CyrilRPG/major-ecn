import test from 'node:test';
import assert from 'node:assert/strict';
import {
  accessRedirect,
  isActiveIdentity,
  joinDecision,
  maskEmail,
  pickLoginParticipant,
  resolveTournamentParticipant,
  safeArenaNext,
  type IdentityParticipant,
} from '../src/lib/arena/identity';

const T_A = 'tournoi-a', T_B = 'tournoi-b';
const p = (over: Partial<IdentityParticipant> = {}): IdentityParticipant => ({
  id: 'p-a', tournament_id: T_A, email: 'interniste@example.test',
  email_confirmed_at: '2026-09-08T22:58:46Z', blocked_at: null, anonymized_at: null, created_at: '2026-09-08T22:58:30Z', ...over,
});

test('bug Interniste : la personne connectée par le tournoi A est reconnue dans le tournoi B (même adresse)', () => {
  const person = p();
  const inB = p({ id: 'p-b', tournament_id: T_B, email: 'Interniste@Example.test ' });
  assert.equal(resolveTournamentParticipant(person, T_A, null)?.id, 'p-a');
  assert.equal(resolveTournamentParticipant(person, T_B, inB)?.id, 'p-b');
  // Pas encore inscrit à B : null (→ inscription en un clic), jamais la ligne du tournoi A.
  assert.equal(resolveTournamentParticipant(person, T_B, null), null);
});

test('une inscription en attente, bloquée, anonymisée ou d’une autre adresse n’ouvre jamais de session', () => {
  const person = p();
  assert.equal(resolveTournamentParticipant(person, T_B, p({ id: 'x', tournament_id: T_B, email_confirmed_at: null })), null);
  assert.equal(resolveTournamentParticipant(person, T_B, p({ id: 'x', tournament_id: T_B, blocked_at: '2026-09-01' })), null);
  assert.equal(resolveTournamentParticipant(person, T_B, p({ id: 'x', tournament_id: T_B, anonymized_at: '2026-09-01' })), null);
  assert.equal(resolveTournamentParticipant(person, T_B, p({ id: 'x', tournament_id: T_B, email: 'autre@example.test' })), null);
  assert.equal(resolveTournamentParticipant(person, T_B, p({ id: 'x', tournament_id: 'tournoi-c' })), null);
  // Session d'une ligne bloquée ou anonymisée : personne.
  assert.equal(resolveTournamentParticipant(p({ blocked_at: '2026-09-01' }), T_A, null), null);
  assert.equal(resolveTournamentParticipant(p({ email_confirmed_at: null }), T_A, null), null);
  assert.equal(isActiveIdentity(null), false);
});

test('inscription en un clic : créer, compléter une inscription en attente, refuser un compte suspendu, rester idempotent', () => {
  assert.equal(joinDecision(null).kind, 'create');
  assert.equal(joinDecision(p({ anonymized_at: '2026-09-01' })).kind, 'create');
  assert.equal(joinDecision(p({ blocked_at: '2026-09-01' })).kind, 'blocked');
  assert.equal(joinDecision(p({ email_confirmed_at: null })).kind, 'complete_pending');
  const already = joinDecision(p());
  assert.equal(already.kind, 'already');
});

test('un seul lien de connexion par demande : tournoi demandé, sinon tournoi en cours, sinon le plus récent', () => {
  const rows = [
    { ...p({ id: 'old', created_at: '2026-09-01' }), tournamentSlug: 'fini', tournamentStatus: 'finished' },
    { ...p({ id: 'live', tournament_id: T_B, created_at: '2026-09-02' }), tournamentSlug: 'en-cours', tournamentStatus: 'round_open' },
    { ...p({ id: 'pending', tournament_id: 'c', email_confirmed_at: null, created_at: '2026-09-20' }), tournamentSlug: 'attente', tournamentStatus: 'registration_open' },
  ];
  assert.equal(pickLoginParticipant(rows, 'fini')?.id, 'old');
  assert.equal(pickLoginParticipant(rows)?.id, 'live');
  // Le tournoi demandé n'a qu'une inscription en attente : on connecte par une inscription confirmée.
  assert.equal(pickLoginParticipant(rows, 'attente')?.id, 'live');
  // Aucune inscription confirmée : la confirmation en attente est renvoyée.
  assert.equal(pickLoginParticipant([rows[2]])?.id, 'pending');
  assert.equal(pickLoginParticipant([{ ...rows[0], blocked_at: 'x' }]), null);
  assert.equal(pickLoginParticipant([]), null);
});

test('retour après connexion : seulement une page EVC Arena du site', () => {
  assert.equal(safeArenaNext('/arena/demo/manche/3'), '/arena/demo/manche/3');
  assert.equal(safeArenaNext('/arena/demo/inscription?i=abc'), '/arena/demo/inscription?i=abc');
  for (const bad of ['https://evil.example/arena', '//evil.example', '/arena/../admin', '/admin', '/arena\\@evil', 'javascript:alert(1)', '', null, undefined])
    assert.equal(safeArenaNext(bad as string), null, String(bad));
});

test('page réservée ouverte sans inscription : inscription en un clic si connecté, sinon connexion AVEC le tournoi', () => {
  assert.equal(accessRedirect('demo', { signedIn: true, next: '/arena/demo/manche/2' }), '/arena/demo/inscription?suite=%2Farena%2Fdemo%2Fmanche%2F2');
  assert.equal(accessRedirect('demo', { signedIn: false, next: '/arena/demo/espace' }), '/arena/connexion?tournoi=demo&suite=%2Farena%2Fdemo%2Fespace');
  assert.equal(accessRedirect('demo', { signedIn: false }), '/arena/connexion?tournoi=demo');
  assert.notEqual(accessRedirect('demo', { signedIn: false }), '/arena/connexion');
});

test('adresse masquée sur l’écran d’inscription en un clic', () => {
  assert.equal(maskEmail('interniste@example.test'), 'int•••@example.test');
  assert.equal(maskEmail('ab@x.fr'), 'a•••@x.fr');
  assert.equal(maskEmail('pas-une-adresse'), '•••');
});
