import test from 'node:test';
import assert from 'node:assert/strict';

/**
 * Offre Découverte par spécialité : choix de l'item selon la spécialité
 * d'inscription, et règle d'accès `canAccessCours` (miroir de la RLS
 * `accessible_cours_ids()`, migration 20261001120000).
 */
import {
  DECOUVERTE_COLLEGE_ID,
  DECOUVERTE_METHODOLOGIE_COURS_ID,
  DECOUVERTE_PNEUMOLOGIE_COURS_ID,
  ITEMS_DECOUVERTE_SPECIALITE,
  contenuDecouverte,
  coursDecouvertePourSpecialite,
  itemDecouvertePourSpecialite,
  specialiteDecouverteDuScope,
  voieDemandeeALInscription,
} from '../src/lib/decouverte/items-specialite';
import { canAccessCours, parseScope } from '../src/lib/auth/permissions';
import { welcomeEmail } from '../src/lib/email/templates';

const [PEDIA, GYNECO, URGENCE] = ITEMS_DECOUVERTE_SPECIALITE.map((i) => i.coursId);

test('spécialité → item découverte (libellés du formulaire, accents et apostrophes indifférents)', () => {
  assert.equal(itemDecouvertePourSpecialite('Pédiatrie')?.coursId, PEDIA);
  assert.equal(itemDecouvertePourSpecialite('pediatrie')?.coursId, PEDIA);
  assert.equal(itemDecouvertePourSpecialite('Gynécologie obstétrique')?.coursId, GYNECO);
  assert.equal(itemDecouvertePourSpecialite('Gynécologie-obstétrique')?.coursId, GYNECO);
  assert.equal(itemDecouvertePourSpecialite('Gynécologie médicale')?.coursId, GYNECO);
  assert.equal(itemDecouvertePourSpecialite('Médecine d’urgence')?.coursId, URGENCE);
  assert.equal(itemDecouvertePourSpecialite("Médecine d'urgence")?.coursId, URGENCE);
  // Pas d'item dédié : repli « Pneumologie » (clé absente).
  for (const s of ['Médecine générale', 'Psychiatrie', 'Chirurgie infantile', '', null, undefined]) {
    assert.equal(itemDecouvertePourSpecialite(s), null, String(s));
    assert.equal(coursDecouvertePourSpecialite(s), null, String(s));
  }
  assert.deepEqual(coursDecouvertePourSpecialite('Pédiatrie'), [PEDIA, DECOUVERTE_METHODOLOGIE_COURS_ID]);
});

test('voie demandée à l’inscription : MG et spécialités à item dédié', () => {
  assert.equal(voieDemandeeALInscription('Médecine générale'), true);
  assert.equal(voieDemandeeALInscription('Pédiatrie'), true);
  assert.equal(voieDemandeeALInscription('Médecine d’urgence'), true);
  assert.equal(voieDemandeeALInscription('Gynécologie obstétrique'), true);
  assert.equal(voieDemandeeALInscription('Psychiatrie'), false);
  assert.equal(voieDemandeeALInscription(''), false);
});

test('spécialité lue dans le scope : signup.specialty puis specialty_wish', () => {
  assert.equal(specialiteDecouverteDuScope({ signup: { specialty: 'Pédiatrie' }, specialty_wish: 'Autre' }), 'Pédiatrie');
  assert.equal(specialiteDecouverteDuScope({ specialty_wish: 'Gynécologie médicale' }), 'Gynécologie médicale');
  assert.equal(specialiteDecouverteDuScope({}), null);
  assert.equal(specialiteDecouverteDuScope(null), null);
});

test('canAccessCours : un découverte de Pédiatrie ne voit que son item et la Méthodologie', () => {
  const scope = parseScope({
    type: 'college', colleges: [DECOUVERTE_COLLEGE_ID], offer: 'decouverte', espace_decouverte: true,
    decouverte_cours: [PEDIA, DECOUVERTE_METHODOLOGIE_COURS_ID],
  });
  assert.deepEqual(scope.decouverte_cours, [PEDIA, DECOUVERTE_METHODOLOGIE_COURS_ID]);
  assert.equal(canAccessCours(scope, DECOUVERTE_COLLEGE_ID, PEDIA, 'specific'), true);
  assert.equal(canAccessCours(scope, DECOUVERTE_COLLEGE_ID, DECOUVERTE_METHODOLOGIE_COURS_ID, 'all'), true);
  assert.equal(canAccessCours(scope, DECOUVERTE_COLLEGE_ID, DECOUVERTE_PNEUMOLOGIE_COURS_ID, 'all'), false);
  assert.equal(canAccessCours(scope, DECOUVERTE_COLLEGE_ID, GYNECO, 'specific'), false);
  assert.equal(canAccessCours(scope, DECOUVERTE_COLLEGE_ID, URGENCE, 'specific'), false);
});

test('canAccessCours : sans clé (MG, autres spécialités), Pneumologie et Méthodologie, jamais les items de spécialité', () => {
  const scope = parseScope({ type: 'college', colleges: [DECOUVERTE_COLLEGE_ID], offer: 'decouverte', voie: 'interne' });
  assert.equal(scope.decouverte_cours, undefined);
  assert.equal(canAccessCours(scope, DECOUVERTE_COLLEGE_ID, DECOUVERTE_PNEUMOLOGIE_COURS_ID, 'all'), true);
  assert.equal(canAccessCours(scope, DECOUVERTE_COLLEGE_ID, DECOUVERTE_METHODOLOGIE_COURS_ID, 'all'), true);
  for (const id of [PEDIA, GYNECO, URGENCE]) assert.equal(canAccessCours(scope, DECOUVERTE_COLLEGE_ID, id, 'specific'), false);
});

test('canAccessCours : la clé ne restreint QUE le collège Découverte (passage en formule payante)', () => {
  const scope = parseScope({
    type: 'college', colleges: [DECOUVERTE_COLLEGE_ID, 'col-pediatrie'], offer: 'intensif', paid_formule: 'intensif',
    decouverte_cours: [PEDIA, DECOUVERTE_METHODOLOGIE_COURS_ID],
  });
  assert.equal(canAccessCours(scope, 'col-pediatrie', 'b14763c3-b696-4a34-9d2b-049bab942710', 'all'), true);
  assert.equal(canAccessCours(scope, DECOUVERTE_COLLEGE_ID, PEDIA, 'specific'), true);
  // Collège Découverte absent du scope : rien, même listé.
  const sansCollege = parseScope({ type: 'college', colleges: ['col-pediatrie'], offer: 'intensif', decouverte_cours: [PEDIA] });
  assert.equal(canAccessCours(sansCollege, DECOUVERTE_COLLEGE_ID, PEDIA, 'specific'), false);
});

test('contenu annoncé selon la voie', () => {
  assert.deepEqual(contenuDecouverte('Pédiatrie', 'interne'), {
    specialite: 'Pédiatrie', theme: 'Méningites et méningo-encéphalites',
    lignes: ['1 fiche de cours', '10 QCM, dont 1 dossier progressif', '10 flashcards'],
  });
  assert.equal(contenuDecouverte('Médecine d’urgence', 'Voie externe')?.lignes[1], '10 QROC, dont 1 dossier progressif');
  assert.equal(contenuDecouverte('Médecine générale', 'externe')?.theme, 'Pneumologie');
  assert.equal(contenuDecouverte('Psychiatrie', 'externe'), null);
});

test('e-mail de bienvenue découverte : item de la spécialité, sans réseau social', () => {
  const mail = welcomeEmail({
    firstName: 'Sara', setupUrl: 'https://www.major-ecn.fr/auth/confirm?token_hash=x&type=invite', role: 'student',
    decouverte: contenuDecouverte('Gynécologie obstétrique', 'interne'),
  });
  assert.match(mail.html, /Votre item découverte de Gynécologie-obstétrique : Grossesse extra-utérine/);
  assert.match(mail.html, /10 QCM, dont 1 dossier progressif/);
  assert.match(mail.text, /Grossesse extra-utérine — 1 fiche de cours, 10 QCM, dont 1 dossier progressif, 10 flashcards/);
  assert.doesNotMatch(mail.html, /facebook|instagram|linkedin|tiktok|youtube|twitter/i);
  // Sans spécialité dédiée : annonce générique inchangée.
  const generique = welcomeEmail({ firstName: 'Sara', setupUrl: 'https://www.major-ecn.fr/x', role: 'student' });
  assert.match(generique.html, /Votre espace découverte est actif/);
});
