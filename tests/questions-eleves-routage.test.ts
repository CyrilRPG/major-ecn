import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ROLES_MODELES,
  accesOnglets,
  collegesDeLEleve,
  composerScope,
  eleveVisiblePourScope,
  estReferent,
  lireScopeEquipe,
  normaliserPerimetre,
  perimetreVide,
  peutContenu,
  recoitQuestionEleve,
  resumeModules,
  specialitesReferent,
  type ScopeEquipe,
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
/** Sous-collège → parent, tel que `parentDesColleges` le lit en base. */
const PARENT_DE = { 'col-mg-cardiologie': 'col-medecine-generale', 'col-mg-hematologie': 'col-medecine-generale' };

/** Filtre SQL des questions avec collège (compte sans restriction d'items). */
const collegesDesQuestions = (scope: ScopeEquipe | null) => specialitesReferent(scope, {});

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
  assert.equal(recoitQuestionEleve(profil(s, { access_end: '2026-01-01T00:00:00Z' }), 'col-geriatrie', undefined, {}, Date.parse('2026-09-25')), false);
  assert.equal(recoitQuestionEleve(profil(s, { email: null }), 'col-geriatrie'), false);
  assert.equal(recoitQuestionEleve(profil(s, { role: 'admin' }), 'col-geriatrie'), false);
  assert.equal(recoitQuestionEleve(profil(s, { role: 'student' }), 'col-geriatrie'), false);
});

test('un professeur historique (content_permissions) suit la même règle', () => {
  const geriatre = { role: 'professor', type: 'college', colleges: ['col-geriatrie'], content_permissions: { qcm: 'rw', flashcards: 'rw' } };
  assert.equal(recoitQuestionEleve(profil(geriatre), 'col-geriatrie'), true);
  assert.equal(recoitQuestionEleve(profil(geriatre), 'col-mg-cardiologie'), false);
  const videoSeule = { role: 'professor', type: 'all', colleges: [], content_permissions: { video: 'rw', qcm: 'none' } };
  assert.equal(recoitQuestionEleve(profil(videoSeule), 'col-geriatrie'), false);
});

/* ─────────────────── médecine générale : le sous-collège décide (05/10/2026) ─────────────────── */

test('MG : un professeur limité aux items d’un sous-collège ne reçoit que ce sous-collège', () => {
  // Format historique réel (Dr Borgne) : 21 collèges MG + les items d'hématologie.
  const borgne = { role: 'professor', type: 'college', colleges: MG, cours: ['h1', 'h2'], content_permissions: { qcm: 'rw', flashcards: 'rw' } };
  const ctx = { parentDe: PARENT_DE, collegeDeItem: { h1: 'col-mg-hematologie', h2: 'col-mg-hematologie' } };
  assert.equal(recoitQuestionEleve(profil(borgne), 'col-mg-hematologie', undefined, ctx), true);
  // Avant le 05/10/2026 : ses 21 collèges lui envoyaient toute la MG.
  assert.equal(recoitQuestionEleve(profil(borgne), 'col-mg-cardiologie', undefined, ctx), false);
  assert.equal(recoitQuestionEleve(profil(borgne), 'col-medecine-generale', undefined, ctx), false);
  // Question générale d'un élève de MG (sans collège) : pas pour un sous-collège.
  const eleveMg = { type: 'college', colleges: MG, offer: 'intensif' };
  assert.equal(recoitQuestionEleve(profil(borgne), null, eleveMg, ctx), false);
  // Collèges de ses items inconnus : il n'est référent de rien, plutôt que de tout.
  assert.equal(recoitQuestionEleve(profil(borgne), 'col-mg-hematologie', undefined, {}), false);
});

test('MG : la question générale d’un élève va aux référents de toute la médecine générale', () => {
  const toutMg = scopeDe('enseignant_relecteur', MG);
  const cardio = scopeDe('enseignant_relecteur', ['col-mg-cardiologie']);
  const eleveMg = { type: 'college', colleges: ['col-decouverte', ...MG], offer: 'intensif' };
  const ctx = { parentDe: PARENT_DE };
  assert.deepEqual(collegesDeLEleve(eleveMg, PARENT_DE), ['col-medecine-generale']);
  assert.equal(recoitQuestionEleve(profil(toutMg), null, eleveMg, ctx), true);
  assert.equal(recoitQuestionEleve(profil(cardio), null, eleveMg, ctx), false);
  // Le sous-collège choisi par l'élève : ses référents, et ceux de toute la MG.
  assert.equal(recoitQuestionEleve(profil(cardio), 'col-mg-cardiologie', eleveMg, ctx), true);
  assert.equal(recoitQuestionEleve(profil(toutMg), 'col-mg-cardiologie', eleveMg, ctx), true);
  assert.equal(recoitQuestionEleve(profil(cardio), 'col-mg-hematologie', eleveMg, ctx), false);
  // Un élève avec seulement des sous-collèges remonte aussi au parent.
  assert.deepEqual(collegesDeLEleve({ type: 'college', colleges: ['col-mg-cardiologie'], offer: 'intensif' }, PARENT_DE), ['col-medecine-generale']);
});

/* ─────────────────────────── professeur référent (05/10/2026) ─────────────────────────── */

test('tout enseignant est référent par défaut, y compris les comptes historiques', () => {
  const nouveau = scopeDe('enseignant_relecteur', ['col-geriatrie']);
  assert.equal(nouveau.referent, true);
  assert.equal(estReferent(nouveau), true);
  const historique = lireScopeEquipe({ role: 'professor', type: 'college', colleges: ['col-geriatrie'], content_permissions: { qcm: 'rw' } });
  assert.equal(historique?.referent, true);
  assert.equal(estReferent(historique), true);
  // Le monteur vidéo n'enseigne pas : jamais référent, quelle que soit la case.
  assert.equal(estReferent(scopeDe('gestionnaire_video', 'toutes')), false);
});

test('référent : questions des élèves + onglet Vidéos, dépôt sans le type « vidéo »', () => {
  // Enseignant sans le type vidéo coché (cas de la plupart des professeurs).
  const scope = composerScope({
    modules: { ...ROLES_MODELES.enseignant_relecteur.modules, contenus: { ...ROLES_MODELES.enseignant_relecteur.modules.contenus, publier: false, supprimer: false, types: ['qcm', 'fiche'] } },
    perimetre: { specialites: ['col-geriatrie'], formules: {} },
  });
  assert.equal(accesOnglets(scope).qa, true);
  assert.equal(accesOnglets(scope).videos, true);
  assert.equal(peutContenu(scope, 'creer', 'video'), true);
  assert.equal(peutContenu(scope, 'modifier', 'video'), true);
  // Publier et supprimer suivent ses droits : sans eux, le dépôt passe « À valider ».
  assert.equal(peutContenu(scope, 'publier', 'video'), false);
  assert.equal(peutContenu(scope, 'supprimer', 'video'), false);
  assert.equal(recoitQuestionEleve(profil(scope), 'col-geriatrie'), true);
});

test('non référent : ni questions, ni vidéos — même avec le type « vidéo » coché', () => {
  const scope = composerScope({
    modules: structuredClone(ROLES_MODELES.enseignant_relecteur.modules),
    perimetre: { specialites: ['col-geriatrie'], formules: {} },
    referent: false,
  });
  assert.ok(scope.modules.contenus.types.includes('video'));
  assert.equal(scope.referent, false);
  assert.deepEqual(accesOnglets(scope), { contenu: true, videos: false, qa: false, entrainements: true, suivi: false, blog: false });
  for (const droit of ['creer', 'modifier', 'publier', 'supprimer'] as const) assert.equal(peutContenu(scope, droit, 'video'), false, droit);
  // Le reste de son travail d'enseignant est intact.
  assert.equal(peutContenu(scope, 'modifier', 'fiche'), true);
  assert.equal(recoitQuestionEleve(profil(scope), 'col-geriatrie'), false);
  assert.equal(recoitQuestionEleve(profil(scope), null, { type: 'college', colleges: ['col-geriatrie'], offer: 'intensif' }), false);
  assert.deepEqual(specialitesReferent(scope, {}), []);
  // La case décochée survit à la relecture du scope enregistré.
  assert.equal(lireScopeEquipe(JSON.parse(JSON.stringify(scope)))?.referent, false);
  assert.ok(resumeModules(scope).some((l) => l.startsWith('Non référent')));
});

test('le monteur vidéo garde ses vidéos, case référent ou non', () => {
  const monteur = composerScope({ modules: ROLES_MODELES.gestionnaire_video.modules, perimetre: { specialites: 'toutes', formules: {} }, referent: false });
  assert.equal(accesOnglets(monteur).videos, true);
  assert.equal(peutContenu(monteur, 'creer', 'video'), true);
  assert.equal(accesOnglets(monteur).qa, false);
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
