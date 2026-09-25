import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ROLES_MODELES,
  collegesDesQuestions,
  composerScope,
  eleveVisiblePourScope,
  lireScopeEquipe,
  normaliserPerimetre,
  perimetreVide,
  recoitQuestionEleve,
} from '../src/lib/auth/collaborateurs';
import { getProfessorScope, profCanAccessCollege } from '../src/lib/auth/prof-content-access';
import {
  ELEVE_SANS_NOM, identitePourLecteur, identityFromProfile,
} from '../src/lib/admin/student-identity-pure';

/**
 * Demandes de Cyril du 25/09/2026 :
 *  1. le monteur vidéo recevait des questions d'élèves — seuls les enseignants
 *     dont le périmètre couvre la question les reçoivent ;
 *  2. les enseignants voient le nom et le prénom de l'élève, jamais son e-mail ;
 *  3. le monteur vidéo voyait tous les collèges — un périmètre absent ou
 *     illisible n'ouvre rien, « toutes » doit être écrit en toutes lettres.
 */

const MG = ['col-medecine-generale', 'col-mg-cardiologie', 'col-mg-hematologie'];

const scopeDe = (modele: keyof typeof ROLES_MODELES, specialites: 'toutes' | string[]) =>
  composerScope({ modele, modules: structuredClone(ROLES_MODELES[modele].modules), perimetre: { specialites, formules: {} } });

const profil = (permission_scope: unknown, extra: Record<string, unknown> = {}) => ({
  role: 'professor', email: 'collaborateur@exemple.test', is_active: true, access_end: null, permission_scope, ...extra,
});

/* ─────────────────────────── routage des questions ─────────────────────────── */

test('le monteur vidéo ne reçoit aucune question, même « toutes spécialités »', () => {
  const monteur = scopeDe('gestionnaire_video', 'toutes');
  assert.equal(recoitQuestionEleve(profil(monteur), 'col-geriatrie'), false);
  assert.equal(recoitQuestionEleve(profil(monteur), null), false);
  assert.deepEqual(collegesDesQuestions(monteur), []);
  // Scope réel du compte de prod (VICTOR B, 24/09/2026) : vidéo seule, type all.
  const prod = {
    role: 'professor', type: 'all', colleges: [], version: 1, fonction: 'MONTEUR VIDEO', modele: 'gestionnaire_video',
    content_permissions: { dp: 'none', qcm: 'none', qroc: 'none', video: 'rw' },
    modules: { suivi: { actif: false }, contenus: { actif: true, creer: true, modifier: true, publier: true, supprimer: false, types: ['video'] }, blog: { actif: false } },
    perimetre: { specialites: 'toutes', formules: {} },
  };
  assert.equal(recoitQuestionEleve(profil(prod), null), false);
  assert.equal(recoitQuestionEleve(profil(prod), 'col-ophtalmologie'), false);
});

test('ni le commercial ni le rédacteur blog ne reçoivent de question', () => {
  for (const modele of ['commercial', 'redacteur_blog'] as const) {
    const s = scopeDe(modele, 'toutes');
    assert.equal(recoitQuestionEleve(profil(s), 'col-geriatrie'), false, modele);
    assert.equal(recoitQuestionEleve(profil(s), null), false, modele);
  }
});

test('un enseignant reçoit les questions de SON périmètre seulement', () => {
  const geriatre = scopeDe('enseignant_relecteur', ['col-geriatrie']);
  assert.equal(recoitQuestionEleve(profil(geriatre), 'col-geriatrie'), true);
  assert.equal(recoitQuestionEleve(profil(geriatre), 'col-mg-cardiologie'), false);
  // Question hors cours d'un élève inconnu : seulement « toutes spécialités ».
  assert.equal(recoitQuestionEleve(profil(geriatre), null), false);
  assert.equal(recoitQuestionEleve(profil(scopeDe('enseignant_relecteur', 'toutes')), null), true);
  assert.deepEqual(collegesDesQuestions(geriatre), ['col-geriatrie']);
  assert.equal(collegesDesQuestions(scopeDe('enseignant_relecteur', 'toutes')), 'toutes');
});

test('une question hors cours suit la spécialité de l’élève', () => {
  const geriatre = scopeDe('enseignant_relecteur', ['col-geriatrie']);
  const mg = scopeDe('enseignant_relecteur', MG);
  const monteur = scopeDe('gestionnaire_video', ['col-geriatrie']);
  const eleveGeriatrie = { type: 'college', colleges: ['col-decouverte', 'col-geriatrie', 'col-dermatologie'], offer: 'essentiel' };
  const eleveMg = { type: 'college', colleges: MG, offer: 'intensif' };
  const eleveDecouverte = { type: 'college', colleges: ['col-decouverte'], offer: 'decouverte' };
  const eleveIntegral = { type: 'all', offer: 'approfondi' };
  assert.equal(recoitQuestionEleve(profil(geriatre), null, eleveGeriatrie), true);
  assert.equal(recoitQuestionEleve(profil(mg), null, eleveGeriatrie), false);
  assert.equal(recoitQuestionEleve(profil(mg), null, eleveMg), true);
  assert.equal(recoitQuestionEleve(profil(geriatre), null, eleveMg), false);
  // Le monteur vidéo, même sur la bonne spécialité, ne reçoit rien.
  assert.equal(recoitQuestionEleve(profil(monteur), null, eleveGeriatrie), false);
  // Découverte seule ou accès intégral : « toutes spécialités » seulement.
  assert.equal(recoitQuestionEleve(profil(geriatre), null, eleveDecouverte), false);
  assert.equal(recoitQuestionEleve(profil(geriatre), null, eleveIntegral), false);
  assert.equal(recoitQuestionEleve(profil(scopeDe('enseignant_relecteur', 'toutes')), null, eleveIntegral), true);
  // Une question AVEC collège ignore les collèges de l'élève.
  assert.equal(recoitQuestionEleve(profil(geriatre), 'col-mg-cardiologie', eleveGeriatrie), false);
});

test('compte désactivé, expiré, sans e-mail ou administrateur : pas de mail', () => {
  const s = scopeDe('enseignant_relecteur', 'toutes');
  assert.equal(recoitQuestionEleve(profil(s, { is_active: false }), 'col-geriatrie'), false);
  assert.equal(recoitQuestionEleve(profil(s, { access_end: '2026-01-01T00:00:00Z' }), 'col-geriatrie', undefined, Date.parse('2026-09-25')), false);
  assert.equal(recoitQuestionEleve(profil(s, { email: null }), 'col-geriatrie'), false);
  assert.equal(recoitQuestionEleve(profil(s, { role: 'admin' }), 'col-geriatrie'), false);
  assert.equal(recoitQuestionEleve(profil(s, { role: 'student' }), 'col-geriatrie'), false);
});

test('un professeur historique (content_permissions) suit la même règle', () => {
  const borgne = { role: 'professor', type: 'college', colleges: MG, cours: ['c1'], content_permissions: { qcm: 'rw', flashcards: 'rw' } };
  assert.equal(recoitQuestionEleve(profil(borgne), 'col-mg-cardiologie'), true);
  assert.equal(recoitQuestionEleve(profil(borgne), 'col-geriatrie'), false);
  const videoSeule = { role: 'professor', type: 'all', colleges: [], content_permissions: { video: 'rw', qcm: 'none' } };
  assert.equal(recoitQuestionEleve(profil(videoSeule), 'col-geriatrie'), false);
});

/* ─────────────────────────── identité de l'élève ─────────────────────────── */

const eleve = identityFromProfile({
  id: 'u1', first_name: 'Jeanne', last_name: 'Martin', email: 'jeanne@exemple.test',
  permission_scope: { offer: 'intensif', paid_specialty: 'Gériatrie', paid_voie: 'interne' },
});

test('l’administrateur voit tout, dont l’e-mail et la fiche candidat', () => {
  const vue = identitePourLecteur(eleve, { admin: true, suivi: true });
  assert.equal(vue.email, 'jeanne@exemple.test');
  assert.equal(vue.href, '/admin/suivi/candidats/u1');
  assert.equal(vue.name, 'Jeanne Martin');
});

test('un enseignant voit nom et prénom, jamais l’e-mail ni la fiche', () => {
  const vue = identitePourLecteur(eleve, { admin: false, suivi: false });
  assert.equal(vue.name, 'Jeanne Martin');
  assert.equal(vue.email, null);
  assert.equal(vue.href, null);
  assert.equal(vue.specialty, 'Gériatrie');
  assert.ok(!JSON.stringify(vue).includes('jeanne@'));
});

test('un collaborateur du suivi ouvre la fiche bornée à son périmètre, sans e-mail', () => {
  const vue = identitePourLecteur(eleve, { admin: false, suivi: true });
  assert.equal(vue.email, null);
  assert.equal(vue.href, '/admin/suivi/eleves/u1');
});

test('un profil sans nom n’affiche jamais l’adresse en guise de nom', () => {
  const sansNom = identityFromProfile({ id: 'u2', first_name: null, last_name: ' ', email: 'x@exemple.test', permission_scope: null });
  assert.equal(sansNom.name, ELEVE_SANS_NOM);
  // Identité construite ailleurs avec l'adresse comme nom : masquée aussi.
  const vue = identitePourLecteur({ ...sansNom, name: 'x@exemple.test' }, { admin: false, suivi: false });
  assert.equal(vue.name, ELEVE_SANS_NOM);
  assert.ok(!JSON.stringify(vue).includes('x@exemple'));
});

/* ─────────────────────────── périmètre fermé par défaut ─────────────────────────── */

test('un périmètre absent ou illisible n’ouvre aucune spécialité', () => {
  assert.deepEqual(normaliserPerimetre(undefined).specialites, []);
  assert.deepEqual(normaliserPerimetre({}).specialites, []);
  assert.deepEqual(normaliserPerimetre({ specialites: 'n’importe quoi' }).specialites, []);
  assert.equal(normaliserPerimetre({ specialites: 'toutes' }).specialites, 'toutes');
  assert.deepEqual(perimetreVide().specialites, []);
  // Scope à modules sans périmètre : type college, aucun collège.
  const s = lireScopeEquipe({ role: 'professor', modules: ROLES_MODELES.gestionnaire_video.modules });
  assert.equal(s?.type, 'college');
  assert.deepEqual(s?.colleges, []);
});

test('un monteur restreint ne voit que ses collèges ; le type absent ne vaut plus « all »', () => {
  const monteur = scopeDe('gestionnaire_video', ['col-ophtalmologie']);
  assert.equal(monteur.type, 'college');
  const portee = getProfessorScope(monteur);
  assert.equal(profCanAccessCollege(portee, 'col-ophtalmologie'), true);
  assert.equal(profCanAccessCollege(portee, 'col-geriatrie'), false);
  assert.equal(profCanAccessCollege(null, 'col-geriatrie'), true, 'administrateur');
  // Ancien défaut `type ?? 'all'` : un scope sans type ouvrait tout.
  const sansType = getProfessorScope({ role: 'professor', colleges: ['col-ophtalmologie'], content_permissions: { video: 'rw' } });
  assert.equal(sansType?.type, 'college');
  assert.equal(profCanAccessCollege(sansType, 'col-geriatrie'), false);
  // Scope historique sans type : périmètre = sa liste de collèges.
  assert.deepEqual(lireScopeEquipe({ role: 'professor', colleges: ['col-ophtalmologie'], content_permissions: { video: 'rw' } })?.perimetre.specialites, ['col-ophtalmologie']);
});

test('suivi individuel : un commercial ne voit que les élèves de ses spécialités', () => {
  const commercial = scopeDe('commercial', ['col-geriatrie']);
  const geriatrie = { type: 'college', colleges: ['col-geriatrie'], offer: 'intensif' };
  const cardio = { type: 'college', colleges: ['col-mg-cardiologie'], offer: 'intensif' };
  const decouverte = { type: 'college', colleges: ['col-decouverte'], offer: 'decouverte' };
  assert.equal(eleveVisiblePourScope(commercial, geriatrie), true);
  assert.equal(eleveVisiblePourScope(commercial, cardio), false);
  assert.equal(eleveVisiblePourScope(commercial, decouverte), false);
  assert.equal(eleveVisiblePourScope(null, geriatrie), false);
  assert.equal(eleveVisiblePourScope(scopeDe('commercial', 'toutes'), cardio), true);
});
