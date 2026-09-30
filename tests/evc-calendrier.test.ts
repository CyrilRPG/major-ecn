import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  delaiAvantMinuitParis, delaiProchainRecalcul, ecartJours, epreuveCapture, epreuveParCollege, etatBandeau,
  etatCompteur, etatInscriptionEvc, formatInstantParis, formatJour, inscriptionEffective, instantParis, jourParis,
  totauxPostes,
} from '../src/lib/evc-calendrier/dates';
import { CALENDRIER_REPLI, EPREUVES_REPLI, REGLAGES_REPLI } from '../src/lib/evc-calendrier/repli';
import { normaliserEpreuve, normaliserReglages } from '../src/lib/evc-calendrier/lignes';
import type { CalendrierEvc, EpreuveEvc } from '../src/lib/evc-calendrier/types';

/* Toutes les heures des tests sont écrites AVEC leur fuseau : le résultat ne
   doit jamais dépendre du fuseau de la machine qui exécute les tests. */
const t = (iso: string) => Date.parse(iso);
const MG = EPREUVES_REPLI.find((e) => e.slug === 'medecine-generale')!;

/* ───────────── jour calendaire de Paris ───────────── */

test('jourParis : minuit de Paris, pas minuit UTC ni minuit local', () => {
  assert.equal(jourParis(t('2027-01-14T22:59:59Z')), '2027-01-14'); // 23:59:59 à Paris (hiver, UTC+1)
  assert.equal(jourParis(t('2027-01-14T23:00:00Z')), '2027-01-15'); // 00:00 à Paris
  assert.equal(jourParis(t('2026-07-15T21:59:00Z')), '2026-07-15'); // 23:59 à Paris (été, UTC+2)
  assert.equal(jourParis(t('2026-07-15T22:00:00Z')), '2026-07-16');
});

test('ecartJours : jours calendaires, y compris à cheval sur un changement d’heure', () => {
  assert.equal(ecartJours('2026-09-30', '2027-01-15'), 107);
  assert.equal(ecartJours('2026-10-24', '2026-10-26'), 2); // passage à l'heure d'hiver le 25/10
  assert.equal(ecartJours('2027-03-27', '2027-03-29'), 2); // passage à l'heure d'été le 28/03
  assert.equal(ecartJours('2027-01-16', '2027-01-15'), -1);
});

test('instantParis : heure murale → instant UTC, été comme hiver', () => {
  assert.equal(new Date(instantParis('2026-06-17', '14:00')).toISOString(), '2026-06-17T12:00:00.000Z');
  assert.equal(new Date(instantParis('2027-01-15', '00:00')).toISOString(), '2027-01-14T23:00:00.000Z');
  assert.equal(new Date(instantParis('2026-10-25', '00:00')).toISOString(), '2026-10-24T22:00:00.000Z');
  assert.equal(new Date(instantParis('2026-10-26', '00:00')).toISOString(), '2026-10-25T23:00:00.000Z');
});

test('recalcul : au plus une heure, et pile au minuit de Paris', () => {
  const avantMinuit = t('2027-01-14T22:30:00Z'); // 23:30 à Paris
  assert.equal(delaiAvantMinuitParis(avantMinuit), 30 * 60_000);
  assert.equal(delaiProchainRecalcul(avantMinuit), 30 * 60_000 + 1_000);
  assert.equal(delaiProchainRecalcul(t('2027-01-14T08:00:00Z')), 60 * 60_000);
  // Nuit du passage à l'heure d'hiver : 25 heures entre deux minuits de Paris.
  assert.equal(delaiAvantMinuitParis(t('2026-10-24T22:00:00Z')), 25 * 60 * 60_000);
});

test('libellés : construits à la main, identiques serveur et navigateur', () => {
  assert.equal(formatJour('2027-01-15'), 'vendredi 15 janvier 2027');
  assert.equal(formatJour('2026-12-01'), 'mardi 1er décembre 2026');
  assert.equal(formatJour('2026-11-10', { semaine: false, annee: false }), '10 novembre');
  assert.deepEqual(formatInstantParis('2026-06-17T12:00:00.000Z'), { jour: 'mercredi 17 juin 2026', heure: '14 h' });
  assert.deepEqual(formatInstantParis('2026-07-16T15:30:00.000Z'), { jour: 'jeudi 16 juillet 2026', heure: '17 h 30' });
});

/* ───────────── B3 — compteur de la capture ───────────── */

test('compteur : J-N, veille, Jour J, lendemain', () => {
  assert.deepEqual(etatCompteur(MG, t('2026-09-30T10:00:00+02:00')), { etat: 'j_moins', jours: 107 });
  assert.deepEqual(etatCompteur(MG, t('2027-01-14T08:00:00+01:00')), { etat: 'j_moins', jours: 1 }); // la veille
  assert.deepEqual(etatCompteur(MG, t('2027-01-14T23:59:00+01:00')), { etat: 'j_moins', jours: 1 });
  assert.deepEqual(etatCompteur(MG, t('2027-01-15T00:00:00+01:00')), { etat: 'jour_j' });
  assert.deepEqual(etatCompteur(MG, t('2027-01-15T23:30:00+01:00')), { etat: 'jour_j' });
  assert.deepEqual(etatCompteur(MG, t('2027-01-16T00:00:00+01:00')), { etat: 'masque' }); // lendemain
  assert.deepEqual(etatCompteur({ date_epreuve: null }, t('2026-09-30T10:00:00Z')), { etat: 'masque' });
});

test('compteur : un visiteur à UTC−10 ou UTC+12, à 23 h 30 chez lui, voit le jour de Paris', () => {
  // 23:30 à Tahiti le 13/01 = 10:30 à Paris le 14/01 → veille.
  assert.deepEqual(etatCompteur(MG, t('2027-01-13T23:30:00-10:00')), { etat: 'j_moins', jours: 1 });
  // 23:30 à Tahiti le 14/01 = 10:30 à Paris le 15/01 → Jour J (et non « J-1 » local).
  assert.deepEqual(etatCompteur(MG, t('2027-01-14T23:30:00-10:00')), { etat: 'jour_j' });
  // 23:30 à Auckland le 15/01 = 11:30 à Paris le 15/01 → Jour J (et non « lendemain » local).
  assert.deepEqual(etatCompteur(MG, t('2027-01-15T23:30:00+12:00')), { etat: 'jour_j' });
  // 23:30 à Auckland le 14/01 = 11:30 à Paris le 14/01 → veille.
  assert.deepEqual(etatCompteur(MG, t('2027-01-14T23:30:00+12:00')), { etat: 'j_moins', jours: 1 });
});

test('compteur : passage à l’heure d’hiver et d’été sans jour perdu ni doublé', () => {
  const e = { date_epreuve: '2026-10-27' };
  assert.deepEqual(etatCompteur(e, t('2026-10-24T23:30:00+02:00')), { etat: 'j_moins', jours: 3 });
  assert.deepEqual(etatCompteur(e, t('2026-10-25T00:30:00+02:00')), { etat: 'j_moins', jours: 2 });
  assert.deepEqual(etatCompteur(e, t('2026-10-25T23:30:00+01:00')), { etat: 'j_moins', jours: 2 });
  assert.deepEqual(etatCompteur(e, t('2026-10-26T00:10:00+01:00')), { etat: 'j_moins', jours: 1 });
  const p = { date_epreuve: '2027-03-29' };
  assert.deepEqual(etatCompteur(p, t('2027-03-28T01:59:00+01:00')), { etat: 'j_moins', jours: 1 });
  assert.deepEqual(etatCompteur(p, t('2027-03-28T03:01:00+02:00')), { etat: 'j_moins', jours: 1 });
  assert.deepEqual(etatCompteur(p, t('2027-03-29T00:00:00+02:00')), { etat: 'jour_j' });
});

test('capture : spécialité paramétrable, médecine générale par défaut', () => {
  assert.equal(epreuveCapture(CALENDRIER_REPLI, t('2026-09-30T10:00:00Z'))?.slug, 'medecine-generale');
  const psy: CalendrierEvc = { ...CALENDRIER_REPLI, reglages: { ...REGLAGES_REPLI, slug_capture_hero: 'psychiatrie' } };
  assert.equal(epreuveCapture(psy, t('2026-09-30T10:00:00Z'))?.date_epreuve, '2026-12-10');
  // Épreuve passée : la ligne reste (compteur masqué), jamais d'autre spécialité.
  assert.equal(epreuveCapture(psy, t('2026-12-20T10:00:00Z'))?.slug, 'psychiatrie');
});

/* ───────────── B2 / B5 — bandeau ───────────── */

test('bandeau : prochaine épreuve, puis la suivante dès le lendemain', () => {
  const avant = etatBandeau(CALENDRIER_REPLI, t('2026-09-30T10:00:00+02:00'));
  assert.equal(avant.etat, 'a_venir');
  if (avant.etat === 'a_venir') {
    assert.equal(avant.jours, 41);
    assert.equal(avant.epreuves[0].slug, 'medecine-du-travail');
  }
  const jourJ = etatBandeau(CALENDRIER_REPLI, t('2026-11-10T18:00:00+01:00'));
  assert.equal(jourJ.etat, 'jour_j');
  if (jourJ.etat === 'jour_j') assert.equal(jourJ.epreuves[0].slug, 'medecine-du-travail');
  const lendemain = etatBandeau(CALENDRIER_REPLI, t('2026-11-11T00:00:00+01:00'));
  assert.equal(lendemain.etat, 'a_venir');
  if (lendemain.etat === 'a_venir') {
    assert.equal(lendemain.epreuves[0].slug, 'anesthesie-reanimation');
    assert.equal(lendemain.jours, 2);
  }
});

test('bandeau : dernière épreuve le jour J, puis « Session 2027 : calendrier à paraître »', () => {
  const dernier = etatBandeau(CALENDRIER_REPLI, t('2027-01-15T12:00:00+01:00'));
  assert.equal(dernier.etat, 'jour_j');
  if (dernier.etat === 'jour_j') assert.equal(dernier.epreuves[0].slug, 'medecine-generale');
  const apres = etatBandeau(CALENDRIER_REPLI, t('2027-01-16T00:00:01+01:00'));
  assert.deepEqual(apres, { etat: 'a_paraitre', annee: 2027, url: REGLAGES_REPLI.url_deroule });
});

test('bandeau : une épreuve désactivée disparaît, la session suivante publiée prend le relais', () => {
  const sansMdt: CalendrierEvc = {
    ...CALENDRIER_REPLI,
    epreuves: EPREUVES_REPLI.map((e) => (e.slug === 'medecine-du-travail' ? { ...e, actif: false } : e)),
  };
  const b = etatBandeau(sansMdt, t('2026-09-30T10:00:00Z'));
  assert.equal(b.etat === 'a_venir' && b.epreuves[0].slug, 'anesthesie-reanimation');

  const e2027: EpreuveEvc = { ...MG, id: 'x', session: 2027, date_epreuve: '2028-01-14' };
  const nonPubliee: CalendrierEvc = { ...CALENDRIER_REPLI, epreuves: [...EPREUVES_REPLI, e2027] };
  assert.equal(etatBandeau(nonPubliee, t('2027-02-01T10:00:00Z')).etat, 'a_paraitre');
  const publiee: CalendrierEvc = { ...nonPubliee, reglages: { ...REGLAGES_REPLI, prochaine_session_publiee: true } };
  const b2 = etatBandeau(publiee, t('2027-02-01T10:00:00Z'));
  assert.equal(b2.etat === 'a_venir' && b2.epreuves[0].session, 2027);
  assert.deepEqual(etatBandeau(publiee, t('2028-02-01T10:00:00Z')), { etat: 'a_paraitre', annee: 2028, url: REGLAGES_REPLI.url_deroule });
  // La capture suit la session suivante publiée.
  assert.equal(epreuveCapture(publiee, t('2027-02-01T10:00:00Z'))?.session, 2027);
});

/* ───────────── B4 — inscription ───────────── */

test('inscription : avant, pendant, après, session suivante connue', () => {
  const r = REGLAGES_REPLI;
  assert.equal(etatInscriptionEvc(MG, r, t('2026-06-17T13:59:00+02:00')).etat, 'a_venir');
  assert.equal(etatInscriptionEvc(MG, r, t('2026-06-17T14:00:00+02:00')).etat, 'ouverte');
  assert.equal(etatInscriptionEvc(MG, r, t('2026-07-16T17:00:00+02:00')).etat, 'ouverte');
  assert.deepEqual(etatInscriptionEvc(MG, r, t('2026-07-16T17:01:00+02:00')), { etat: 'close', session: 2026 });

  const suivante = { ...r, prochaine_inscription_debut: '2027-06-16T12:00:00.000Z', prochaine_inscription_fin: '2027-07-15T15:00:00.000Z' };
  const avantSuivante = etatInscriptionEvc(MG, suivante, t('2026-09-30T10:00:00Z'));
  assert.equal(avantSuivante.etat, 'a_venir');
  assert.equal(avantSuivante.session, 2027);
  assert.deepEqual(inscriptionEffective(MG, suivante, t('2026-09-30T10:00:00Z')), { debut: '2027-06-16T12:00:00.000Z', fin: '2027-07-15T15:00:00.000Z' });
  assert.equal(etatInscriptionEvc(MG, suivante, t('2027-06-20T10:00:00Z')).etat, 'ouverte');
  assert.deepEqual(etatInscriptionEvc(MG, suivante, t('2027-08-01T10:00:00Z')), { etat: 'close', session: 2027 });
  // Pendant la période courante, la période suivante ne s'affiche pas encore.
  assert.equal(etatInscriptionEvc(MG, suivante, t('2026-07-01T10:00:00Z')).session, 2026);
  assert.deepEqual(inscriptionEffective(MG, r, t('2026-09-30T10:00:00Z')), { debut: MG.inscription_debut, fin: MG.inscription_fin });

  const sansDates = { ...MG, inscription_debut: null, inscription_fin: null };
  assert.deepEqual(etatInscriptionEvc(sansDates, r, t('2026-09-30T10:00:00Z')), { etat: 'inconnue', session: 2026 });
});

/* ───────────── liens avec la plateforme ───────────── */

test('collège relié, totaux et normalisation des lignes de la base', () => {
  assert.equal(epreuveParCollege(CALENDRIER_REPLI, 'col-medecine-generale', t('2026-09-30T10:00:00Z'))?.date_epreuve, '2027-01-15');
  assert.equal(epreuveParCollege(CALENDRIER_REPLI, 'col-inconnu', t('2026-09-30T10:00:00Z')), null);
  assert.deepEqual(totauxPostes(CALENDRIER_REPLI), { externe: 1003, interne: 2896, specialitesExterne: 13 });
  const sansTotaux = { ...CALENDRIER_REPLI, reglages: { ...REGLAGES_REPLI, postes_total_externe: null } };
  assert.equal(totauxPostes(sansTotaux).externe, 1003); // somme des treize lignes

  const e = normaliserEpreuve({
    id: 'a', session: 2026, slug: 'medecine-generale', nom: 'Médecine générale', date_epreuve: '2027-01-15',
    postes_interne: 89, postes_externe: '35', inscription_debut: '2026-06-17 12:00:00+00', inscription_fin: null,
    college_id: '', lieu: null, ordre: 5, actif: true,
  });
  assert.equal(e.postes_externe, 35);
  assert.equal(e.inscription_debut, '2026-06-17T12:00:00.000Z');
  assert.equal(e.college_id, null);
  assert.equal(e.lieu, 'Espace Jean Monnet, Rungis');
  assert.deepEqual(normaliserReglages(null), REGLAGES_REPLI);
});
