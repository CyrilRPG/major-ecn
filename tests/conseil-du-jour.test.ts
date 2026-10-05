import { test } from 'node:test';
import assert from 'node:assert/strict';
import { choisirConseil, conseilsApplicables, CONSEIL_CLES, type FaitsConseil } from '../src/lib/student/conseil-core';

/** Élève assidu qui utilise déjà tout : aucun conseil. */
const assidu: FaitsConseil = {
  joursAvantEvc: 102,
  ouverts: { checkup: true, moteur: true, planning: true, parcours: true, mesEntrainements: true },
  checkupFait: true, planningCree: true, itemsAttention: 3, topItem: 'Pneumonies aiguës', revisionCibleeFaite: true,
  transversalesFaites: 12, questions30j: 300, erreursParCollege: [{ nom: 'Cardiologie', erreurs: 14 }], entrainementCibleFait: true,
  questionsMisesDeCote: 20, notes: 8, parcoursTermines: 4, epreuvesRemises: 1, epreuvesDisponibles: 1, exercicesPerso: 5,
  prochaineSeance: { titre: 'Réanimation', jour: 'mardi 6 octobre', heure: '18h30' }, agendaOuvert: true, prioritesOuvertes: true,
};
const jour = { aujourdhui: '2026-10-05', vues: {}, masques: new Set<string>() };

test('un élève qui utilise déjà tout ne reçoit aucun conseil', () => {
  assert.deepEqual(conseilsApplicables(assidu), []);
  assert.equal(choisirConseil(assidu, jour), null);
});

test('le conseil reprend les vrais chiffres de l’élève', () => {
  const c = choisirConseil({ ...assidu, entrainementCibleFait: false }, jour);
  assert.equal(c?.cle, 'entrainement-cible');
  assert.match(c!.titre, /Cardiologie/);
  assert.match(c!.texte, /14 erreurs/);
});

test('le plus utile passe devant : Check-up jamais fait avant le reste', () => {
  const c = choisirConseil({ ...assidu, checkupFait: false, notes: 0, entrainementCibleFait: false }, jour);
  assert.equal(c?.cle, 'checkup');
  assert.match(c!.texte, /J-102/);
});

test('un conseil écarté ne revient pas', () => {
  const f = { ...assidu, checkupFait: false, notes: 0 };
  const c = choisirConseil(f, { ...jour, masques: new Set(['checkup']) });
  assert.equal(c?.cle, 'notes');
});

test('lassitude : affiché depuis plus de 3 jours sans effet, il cède la place', () => {
  const f = { ...assidu, checkupFait: false, notes: 0 };
  assert.equal(choisirConseil(f, { ...jour, vues: { checkup: '2026-10-03' } })?.cle, 'checkup');
  assert.equal(choisirConseil(f, { ...jour, vues: { checkup: '2026-09-30' } })?.cle, 'notes');
});

test('épreuve blanche : plus urgente à moins de 60 jours de l’EVC', () => {
  const f = { ...assidu, epreuvesRemises: 0, parcoursTermines: 0 };
  const loin = conseilsApplicables(f).find((c) => c.cle === 'epreuve-blanche')!;
  const proche = conseilsApplicables({ ...f, joursAvantEvc: 40 }).find((c) => c.cle === 'epreuve-blanche')!;
  assert.ok(proche.score > loin.score);
});

test('un module fermé ne génère jamais de conseil', () => {
  const ferme = { ...assidu, ouverts: { checkup: false, moteur: false, planning: false, parcours: false, mesEntrainements: false }, checkupFait: false, planningCree: false, revisionCibleeFaite: false, prioritesOuvertes: false, parcoursTermines: 0, exercicesPerso: 0 };
  const cles = conseilsApplicables(ferme).map((c) => c.cle);
  for (const k of ['checkup', 'planning', 'priorites', 'ciblee', 'parcours', 'mes-entrainements']) assert.ok(!cles.includes(k as never), k);
});

test('chaque conseil a une clé connue et un lien interne', () => {
  const tout: FaitsConseil = {
    ...assidu, checkupFait: false, planningCree: false, revisionCibleeFaite: false, transversalesFaites: 0, entrainementCibleFait: false,
    questionsMisesDeCote: 0, notes: 0, parcoursTermines: 0, epreuvesRemises: 0, exercicesPerso: 0, agendaOuvert: false, prioritesOuvertes: false,
  };
  const list = conseilsApplicables(tout);
  assert.equal(list.length, CONSEIL_CLES.length);
  for (const c of list) assert.ok(CONSEIL_CLES.includes(c.cle) && c.href.startsWith('/') && c.texte.length > 40, c.cle);
});
