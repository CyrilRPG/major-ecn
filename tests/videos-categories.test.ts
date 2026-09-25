import assert from 'node:assert/strict';
import test from 'node:test';
import {
  autreCategorie,
  categorieDeVideo,
  categoriesDisponibles,
  CATEGORIES_VIDEO,
  ORDRE_CATEGORIES,
  resumeCategorie,
  titreCategorie,
} from '../src/lib/videos/categories';
import { compterReplays, filtrerReplays } from '../src/lib/videos/replays';
import type { PermissionScope } from '../src/types/domain';
import type { ContentAccess } from '../src/lib/auth/permissions';

/**
 * Replays d'un item : deux catégories (Séance intensive / Séances
 * approfondies) que l'élève choisit, chaque vidéo avec SES supports.
 */

const APPROFONDI: ContentAccess = {
  fiche: true, ficheExpress: true, video: false, qcm: true, entrainement: true, seanceProf: true,
  flashcards: true, interrogation: true, seanceApprofondie: true, notes: true, parcoursMajor: true,
};
const INTENSIF: ContentAccess = { ...APPROFONDI, video: true, seanceApprofondie: false, seanceProf: false };

const scope = (offer: 'intensif' | 'approfondi', voie: 'interne' | 'externe' = 'interne'): PermissionScope =>
  ({ type: 'college', colleges: ['col-mir'], offer, voie }) as PermissionScope;

/** Reproduction de « Replays - Révisions » de Médecine d'urgence (18/09/2026). */
const LIGNES = [
  // Séances approfondies : Programme Approfondi + Formule Intensive, les deux voies.
  ...[1, 2, 3].map((n) => ({
    id: `sa-${n}`, titre: `SEANCE ${n}`, type: 'seance_approfondie', rubrique: null, order_index: n - 1,
    bunny_video_id: `b-sa-${n}`, storage_path: null, serie_id: null, unlock_direct: null,
    voies: ['interne', 'externe'], offers: ['approfondi', 'intensif'],
    denied_user_ids: null, allowed_user_ids: null,
    video_supports: [
      { id: `sa-${n}-sujet`, titre: `Cas ${n}`, order_index: 0, voies: null, offers: null },
      { id: `sa-${n}-corr`, titre: `Cas ${n} corrigé`, order_index: 1, voies: null, offers: null },
    ],
  })),
  // Séances intensives « supplémentaires » : Programme Approfondi, voie interne seule.
  ...[1, 2].map((n) => ({
    id: `c-${n}`, titre: `SEANCE ${n} SUPPLEMENTAIRE`, type: 'cours', rubrique: null, order_index: n - 1,
    bunny_video_id: `b-c-${n}`, storage_path: null, serie_id: null, unlock_direct: null,
    voies: ['interne'], offers: ['approfondi'],
    denied_user_ids: null, allowed_user_ids: null,
    video_supports: [
      { id: `c-${n}-sujet`, titre: `Cas ${n + 10}`, order_index: 0, voies: null, offers: null },
      // Support réservé au Programme Approfondi (permissions propres).
      { id: `c-${n}-corr`, titre: `Cas ${n + 10} corrigé`, order_index: 1, voies: null, offers: ['approfondi'] },
    ],
  })),
];

test('catégories : type → catégorie, ordre, alternance, libellés', () => {
  assert.equal(categorieDeVideo('seance_approfondie'), 'seance_approfondie');
  assert.equal(categorieDeVideo('cours'), 'cours');
  assert.equal(categorieDeVideo(null), 'cours');
  assert.deepEqual(ORDRE_CATEGORIES, ['cours', 'seance_approfondie']);
  assert.equal(autreCategorie('cours'), 'seance_approfondie');
  assert.equal(autreCategorie('seance_approfondie'), 'cours');
  assert.equal(CATEGORIES_VIDEO.cours.segment, 'video');
  assert.equal(CATEGORIES_VIDEO.seance_approfondie.segment, 'seance-approfondie');
  assert.equal(titreCategorie('cours', null), 'Séance intensive');
  assert.equal(titreCategorie('cours', '  Dernier tour  '), 'Dernier tour');
  assert.equal(resumeCategorie(1, 0), '1 séance');
  assert.equal(resumeCategorie(10, 26), '10 séances · 26 supports');
  assert.equal(resumeCategorie(2, 1), '2 séances · 1 support');
});

test('catégories disponibles : seulement celles qui ont une vidéo visible, intensive d’abord', () => {
  assert.deepEqual(categoriesDisponibles({ cours: 10, seance_approfondie: 11 }), ['cours', 'seance_approfondie']);
  assert.deepEqual(categoriesDisponibles({ cours: 0, seance_approfondie: 3 }), ['seance_approfondie']);
  assert.deepEqual(categoriesDisponibles({ cours: 0, seance_approfondie: 0 }), []);
});

test('élève Approfondi voie interne : les deux catégories, chaque vidéo avec ses supports', () => {
  const r = filtrerReplays(LIGNES, { userId: 'u', scope: scope('approfondi'), access: APPROFONDI, isAdmin: false });
  assert.equal(r.cours.length, 2);
  assert.equal(r.seance_approfondie.length, 3);
  assert.deepEqual(r.cours[0].supports.map((s) => s.titre), ['Cas 11', 'Cas 11 corrigé']);
  assert.deepEqual(r.seance_approfondie[2].supports.map((s) => s.titre), ['Cas 3', 'Cas 3 corrigé']);
  assert.deepEqual(compterReplays(r.cours), { seances: 2, supports: 4 });
  assert.deepEqual(compterReplays(r.seance_approfondie), { seances: 3, supports: 6 });
});

test('élève Approfondi voie externe : les séances « voie interne » disparaissent avec leurs supports', () => {
  const r = filtrerReplays(LIGNES, { userId: 'u', scope: scope('approfondi', 'externe'), access: APPROFONDI, isAdmin: false });
  assert.equal(r.cours.length, 0);
  assert.equal(r.seance_approfondie.length, 3);
});

test('élève Intensif : les séances approfondies qui le ciblent restent, un support réservé s’efface', () => {
  const lignes = LIGNES.map((v) => (v.type === 'cours' ? { ...v, offers: ['approfondi', 'intensif'] } : v));
  const r = filtrerReplays(lignes, { userId: 'u', scope: scope('intensif'), access: INTENSIF, isAdmin: false });
  // Séances approfondies cochées « Formule Intensive » : visibles malgré
  // seanceApprofondie = false (c'est la règle des permissions par vidéo).
  assert.equal(r.seance_approfondie.length, 3);
  // Cours ciblant aussi l'intensif : visibles ; le corrigé réservé au
  // Programme Approfondi ne l'est pas.
  assert.equal(r.cours.length, 2);
  assert.deepEqual(r.cours[0].supports.map((s) => s.titre), ['Cas 11']);
});

test('ordre des séances : order_index, puis ordre d’entrée ; nominatif remonté', () => {
  const lignes = [
    { ...LIGNES[1], order_index: 5 },
    { ...LIGNES[0], order_index: 0, allowed_user_ids: ['u'] },
    { ...LIGNES[2], order_index: 5 },
  ];
  const r = filtrerReplays(lignes, { userId: 'u', scope: scope('approfondi'), access: APPROFONDI, isAdmin: false });
  assert.deepEqual(r.seance_approfondie.map((v) => v.id), ['sa-1', 'sa-2', 'sa-3']);
  assert.equal(r.autoriseParVideo, true);
});

test('administration : tout est visible, supports compris', () => {
  const r = filtrerReplays(LIGNES, { userId: 'admin', scope: scope('approfondi', 'externe'), access: undefined, isAdmin: true });
  assert.equal(r.cours.length, 2);
  assert.equal(r.cours[0].supports.length, 2);
});

test('item de révisions : au niveau du collège, sauf en Médecine générale (un par sous-collège)', async () => {
  const { porteItemRevisions } = await import('../src/lib/videos/revisions');
  // Collège simple (Gynécologie-obstétrique).
  assert.equal(porteItemRevisions('col-gynecologie', 'col-gynecologie', false), true);
  // Collège à sous-collèges (Odontologie) : au niveau du collège, jamais dans un sous-collège.
  assert.equal(porteItemRevisions('col-ecn-odontologie', 'col-ecn-odontologie', true), true);
  assert.equal(porteItemRevisions('col-ecn-odontologie', 'col-ecn-odonto-paro', true), false);
  // Médecine générale : un par sous-collège, aucun à la racine.
  assert.equal(porteItemRevisions('col-medecine-generale', 'col-mg-gynecologie', true), true);
  assert.equal(porteItemRevisions('col-medecine-generale', 'col-medecine-generale', true), false);
  assert.equal(porteItemRevisions('', '', false), false);
});
