import test from 'node:test';
import assert from 'node:assert/strict';
import { analyserCoordonnees, deciderPublication } from '../src/lib/echanges/coordonnees';

/**
 * Blocage des coordonnées personnelles (CDC §186-198) — recette R53 à R58.
 * R57 (tentative via l'API) et R59 (image) sont couverts par la recette
 * serveur : ici, la règle pure qu'ils appliquent.
 */
const DOMAINES = ['major-ecn.fr', 'has-sante.fr', 'pubmed.ncbi.nlm.nih.gov', 'ncbi.nlm.nih.gov', 'legifrance.gouv.fr', 'doi.org'];
const bloque = (t: string) => analyserCoordonnees(t, { domainesAutorises: DOMAINES }).bloquant;
const types = (t: string) => analyserCoordonnees(t, { domainesAutorises: DOMAINES }).motifs.map((m) => m.type);

test('R53 — numéro français bloqué, sous toutes ses formes', () => {
  for (const t of [
    'appelle moi au 06 12 34 56 78',
    'mon num 0612345678',
    '06.12.34.56.78 dispo ce soir',
    '06-12-34-56-78',
    '+33 6 12 34 56 78',
    '+33612345678',
    '0033 6 12 34 56 78',
    '+33 (0)6 12 34 56 78',
    'fixe : 01 47 34 35 71',
  ]) assert.equal(bloque(t), true, t);
});

test('R54 — numéro international détecté', () => {
  for (const t of ['+44 7911 123456', '+1 (415) 555-2671', '0041 79 123 45 67', '+212 6 12 34 56 78', '+32 470 12 34 56']) {
    assert.equal(bloque(t), true, t);
  }
});

test('R55 — e-mail, y compris écrit avec « arobase » ou déguisé', () => {
  for (const t of [
    'écris moi jean.dupont@gmail.com',
    'jean.dupont arobase gmail point com',
    'jean.dupont (at) gmail (dot) com',
    'jean [at] hotmail [point] fr',
    'jean at gmail dot com',
    'mon mail perso : jdupont75 chez gmail.com',
    'contact arobase orange.fr',
  ]) assert.equal(bloque(t), true, t);
});

test('R56 — valeurs médicales ordinaires publiables', () => {
  for (const t of [
    'PA 120/80 mmHg, FC 110/min, SpO2 92 %',
    'Kaliémie à 5,2 mmol/L, créatinine 180 µmol/L',
    'Plaquettes 150 000/mm3, leucocytes 12 000/mm3',
    'Hb 9,8 g/dL, VGM 72 fL',
    'Item 231 : quelle conduite à tenir ?',
    'Score de Glasgow 3 + 4 + 5 = 12',
    'Dans l’item 162 on parle de l’insuffisance cardiaque à FEVG < 40 %',
    'Les 3 critères, 2 majeurs et 1 mineur, cf. question 4 de la série 12',
    'INR cible entre 2 et 3, AT III normale',
    'Le signal en IRM T2 est hyperintense',
    '1 000 000 UI de vitamine D en 4 prises',
    'Bilan : Na 135, K 4,1, Cl 100, HCO3 24, urée 6, créat 80',
    'J’ai eu 14/20 au concours blanc du 12/10/2026 à 14 h 30',
    'Merci @Thomas pour la réponse !',
  ]) assert.equal(bloque(t), false, t);
});

test('Réseaux sociaux et invitations à sortir de la plateforme', () => {
  for (const t of [
    'ajoute moi sur snap : jean_du75',
    'mon insta c’est @jean.dupont_75',
    'écris-moi sur whatsapp',
    'contacte moi en mp',
    'viens en privé on en parle',
    'https://wa.me/33612345678',
    'rejoins le groupe https://chat.whatsapp.com/AbCdEf',
    't.me/promo2027',
    'discord.gg/evc2027',
  ]) assert.equal(bloque(t), true, t);
});

test('Numéro dicté en lettres', () => {
  assert.equal(bloque('zéro six douze trente quatre cinquante six soixante dix huit'), true);
  assert.deepEqual(types('zéro six douze trente quatre cinquante six soixante dix huit'), ['nombre_en_lettres']);
  assert.equal(bloque('il y a deux ou trois signes, parfois quatre'), false);
});

test('R58 — un lien pédagogique autorisé reste publiable ; un lien inconnu est signalé', () => {
  assert.equal(bloque('voir https://www.has-sante.fr/jcms/p_3191108/fr/recommandation'), false);
  assert.deepEqual(types('voir https://www.has-sante.fr/jcms/p_3191108/fr/recommandation'), []);
  assert.deepEqual(types('article : https://pubmed.ncbi.nlm.nih.gov/31504418/'), []);
  assert.deepEqual(types('https://doi.org/10.1056/NEJMoa1911303'), []);
  assert.deepEqual(types('regarde https://monblog-medecine.net/page'), ['lien_non_reconnu']);
});

test('Décision selon les réglages', () => {
  const base = { actif: true, mode: 'bloquer' as const, domainesAutorises: DOMAINES, liensNonReconnus: 'moderation' as const };
  assert.equal(deciderPublication('06 12 34 56 78', base).action, 'bloquer');
  assert.equal(deciderPublication('06 12 34 56 78', { ...base, mode: 'moderation' }).action, 'moderation');
  assert.equal(deciderPublication('https://inconnu-site.com', base).action, 'moderation');
  assert.equal(deciderPublication('https://inconnu-site.com', { ...base, liensNonReconnus: 'autoriser' }).action, 'publier');
  assert.equal(deciderPublication('https://inconnu-site.com', { ...base, liensNonReconnus: 'bloquer' }).action, 'bloquer');
  assert.equal(deciderPublication('06 12 34 56 78', { ...base, actif: false }).action, 'publier');
  assert.equal(deciderPublication('Quelle est la dose de charge ?', base).action, 'publier');
});
