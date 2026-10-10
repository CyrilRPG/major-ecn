import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ajouterJoursIso, cleEnvoi, comparerTaches, deplacer, estUrgente, libelleEcheance, lienConversation, lundiDe, niveauAccesTache,
  objetCopieReponse, objetMessageEnseignant, peut, peutAdministrer, peutVoirDemande, peutVoirReclamation, prochaineEcheance,
  roleDansConversation, statutApresEnvoi, statutApresReponse, tauxDeReponse, PREFIXE_OBJET_COPIE,
} from '../src/lib/cockpit/regles';

/**
 * Cockpit administrateur — règles pures (CDC 08/10/2026, recette C01 à C18).
 * La recette serveur (`tmp/_qa-cockpit/recette.mts`) rejoue les mêmes cas
 * contre la base ; ici, les règles qu'elle applique.
 */

const A = 'admin-a';
const B = 'admin-b';
const P = 'prof-p';

test('C01 — une tâche privée n’est visible d’aucun autre administrateur', () => {
  const t = { owner_id: A, assignee_id: null };
  assert.equal(niveauAccesTache(t, [], A), 'proprietaire');
  assert.equal(niveauAccesTache(t, [], B), null, 'le rôle admin n’ouvre rien');
  assert.equal(niveauAccesTache(t, [], P), null);
});

test('C02 — partage volontaire puis révocation', () => {
  const t = { owner_id: A, assignee_id: null };
  assert.equal(niveauAccesTache(t, [{ user_id: B, droit: 'commentaire', revoque_at: null }], B), 'commentaire');
  assert.equal(niveauAccesTache(t, [{ user_id: B, droit: 'commentaire', revoque_at: '2026-10-09T10:00:00Z' }], B), null);
  // Le droit le plus élevé l'emporte ; un partage à un autre ne compte pas.
  assert.equal(niveauAccesTache(t, [
    { user_id: B, droit: 'lecture', revoque_at: null },
    { user_id: B, droit: 'modification', revoque_at: null },
    { user_id: P, droit: 'modification', revoque_at: null },
  ], B), 'modification');
  assert.equal(peut('lecture', 'commentaire'), false);
  assert.equal(peut('commentaire', 'commentaire'), true);
  assert.equal(peut('modification', 'proprietaire'), false);
  assert.equal(peutAdministrer('modification'), false, 'seul le propriétaire partage, révoque et archive');
});

test('Affectation : la personne affectée peut faire avancer la tâche, pas la partager', () => {
  const t = { owner_id: A, assignee_id: P };
  assert.equal(niveauAccesTache(t, [], P), 'modification');
  assert.equal(peutAdministrer(niveauAccesTache(t, [], P)), false);
});

test('Dossiers d’équipe : demandes et réclamations bornées', () => {
  const dem = { created_by: A, assignee_id: P, nature: 'comptable' };
  assert.equal(peutVoirDemande(dem, A, true), true);
  assert.equal(peutVoirDemande(dem, P, false), true, 'personne chargée du traitement');
  assert.equal(peutVoirDemande(dem, 'autre-prof', false), false, 'collaborateur non concerné');
  assert.equal(peutVoirDemande(dem, B, true), true, 'administrateur');
  assert.equal(peutVoirReclamation({ created_by: A, assignee_id: null }, P, false), false);
  assert.equal(peutVoirReclamation({ created_by: A, assignee_id: P }, P, false), true);
});

test('C04 / C16 — conversation : propriétaire et enseignant seulement, jamais un élève ni un autre admin', () => {
  const c = { owner_id: A, interlocuteur_id: P, interlocuteur_type: 'enseignant' };
  assert.equal(roleDansConversation(c, A, 'admin'), 'proprietaire');
  assert.equal(roleDansConversation(c, P, 'professor'), 'enseignant');
  assert.equal(roleDansConversation(c, B, 'admin'), null);
  assert.equal(roleDansConversation(c, P, 'student'), null, 'un compte élève n’est jamais interlocuteur');
  const eleve = { owner_id: A, interlocuteur_id: 'eleve-e', interlocuteur_type: 'eleve' };
  assert.equal(roleDansConversation(eleve, 'eleve-e', 'student'), null, 'C16 : l’élève n’accède pas aux conversations administratives');
});

test('C13 — une réponse passe la tâche à « Réponse reçue », jamais à « Terminée »', () => {
  assert.equal(statutApresEnvoi('a_faire'), 'attente_reponse');
  assert.equal(statutApresEnvoi('terminee'), 'terminee');
  assert.equal(statutApresReponse('attente_reponse'), 'reponse_recue');
  assert.equal(statutApresReponse('a_faire'), 'reponse_recue');
  assert.equal(statutApresReponse('terminee'), 'terminee', 'une tâche close n’est pas rouverte en silence');
  assert.equal(statutApresReponse('annulee'), 'annulee');
  for (const s of ['a_faire', 'en_cours', 'attente_reponse', 'reponse_recue', 'reportee'] as const) {
    assert.notEqual(statutApresReponse(s), 'terminee');
  }
});

test('C11 — objet de copie stable et filtrable', () => {
  const o = objetCopieReponse('Thomas', 'Relecture cardiologie');
  assert.equal(o, '[MAJOR ECN - MESSAGERIE INTERNE] Réponse de Thomas - Relecture cardiologie');
  assert.ok(o.startsWith(PREFIXE_OBJET_COPIE));
  assert.equal(objetCopieReponse('Thomas', 'Relecture cardiologie'), o, 'même objet à chaque réponse du fil');
  assert.equal(objetMessageEnseignant('  Relecture  '), '[MAJOR ECN] Relecture');
  assert.ok(objetCopieReponse('X', 'y'.repeat(400)).length <= 250);
});

test('C12 / C14 — clé d’envoi identique à chaque tentative, lien profond vers le fil', () => {
  assert.equal(cleEnvoi('abc'), cleEnvoi('abc'));
  assert.notEqual(cleEnvoi('abc'), cleEnvoi('abd'));
  assert.equal(lienConversation('https://major-ecn.fr/', 'c1'), 'https://major-ecn.fr/admin/cockpit/messagerie/c1');
});

test('Récurrence : jour, semaine, mois (fin de mois)', () => {
  assert.equal(prochaineEcheance('2026-10-09', 'quotidienne'), '2026-10-10');
  assert.equal(prochaineEcheance('2026-10-09', 'hebdomadaire'), '2026-10-16');
  assert.equal(prochaineEcheance('2026-01-31', 'mensuelle'), '2026-02-28');
  assert.equal(prochaineEcheance('2026-12-15', 'mensuelle'), '2027-01-15');
  assert.equal(prochaineEcheance('2026-10-09', 'aucune'), null);
});

test('Dates : lundi de la semaine, ajout de jours, libellés', () => {
  assert.equal(lundiDe('2026-10-08'), '2026-10-05'); // jeudi
  assert.equal(lundiDe('2026-10-11'), '2026-10-05'); // dimanche
  assert.equal(lundiDe('2026-10-05'), '2026-10-05');
  assert.equal(ajouterJoursIso('2026-10-31', 1), '2026-11-01');
  assert.equal(libelleEcheance('2026-10-08', '2026-10-08', '08:30:00'), 'Aujourd’hui - 08:30');
  assert.equal(libelleEcheance('2026-10-09', '2026-10-08'), 'Demain');
  assert.equal(libelleEcheance(null, '2026-10-08'), 'Sans échéance');
});

test('Urgence et tri des tâches', () => {
  const auj = '2026-10-08';
  assert.equal(estUrgente({ priorite: 'urgente', echeance: null, statut: 'a_faire' }, auj), true);
  assert.equal(estUrgente({ priorite: 'normale', echeance: '2026-10-07', statut: 'a_faire' }, auj), true, 'en retard');
  assert.equal(estUrgente({ priorite: 'haute', echeance: auj, statut: 'en_cours' }, auj), true);
  assert.equal(estUrgente({ priorite: 'haute', echeance: '2026-10-09', statut: 'en_cours' }, auj), false);
  assert.equal(estUrgente({ priorite: 'urgente', echeance: null, statut: 'terminee' }, auj), false);
  const base = { ordre: 0, created_at: '2026-10-01T00:00:00Z' };
  const liste = [
    { ...base, id: 'c', priorite: 'normale', echeance: null, heure: null },
    { ...base, id: 'b', priorite: 'basse', echeance: '2026-10-08', heure: '10:00' },
    { ...base, id: 'a', priorite: 'urgente', echeance: '2026-10-08', heure: '10:00' },
    { ...base, id: 'd', priorite: 'normale', echeance: '2026-10-08', heure: '08:30' },
  ].sort(comparerTaches);
  assert.deepEqual(liste.map((t) => t.id), ['d', 'a', 'b', 'c']);
});

test('Priorités réordonnables et taux de réponse', () => {
  assert.deepEqual(deplacer(['a', 'b', 'c'], 2, -1), ['a', 'c', 'b']);
  assert.deepEqual(deplacer(['a', 'b', 'c'], 0, -1), ['a', 'b', 'c']);
  assert.equal(tauxDeReponse(0, 0), null);
  assert.equal(tauxDeReponse(12, 11), 92);
  assert.equal(tauxDeReponse(3, 5), 100);
});
