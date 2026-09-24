import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ROLES_MODELES,
  accesEquipeExpire,
  composerScope,
  eleveDansPerimetre,
  formulesPour,
  lireScopeEquipe,
  modulesVides,
  peutBlog,
  peutContenu,
  premierePage,
  roleSuiviDeScope,
  resumeModules,
  type Modules,
  deployerPerimetre,
  replierPerimetre,
  accesOnglets,
  pagesDuScope,
  posteDuScope,
  presentationPoste,
  questionDansPerimetre,
} from '../src/lib/auth/collaborateurs';
import { invitationEquipeEmail } from '../src/lib/email/templates';
import { getProfessorScope, profCanAccessCours, canEditCoursContent } from '../src/lib/auth/prof-content-access';
import { canRead, canWrite } from '../src/lib/schemas/professor';

/**
 * Moteur de permissions du cahier des charges (18/09/2026) :
 * utilisateur → permissions cumulables → périmètre. Les champs historiques
 * (type / colleges / content_permissions) sont dérivés et doivent rester
 * cohérents avec ce que lit tout le reste de la plateforme.
 */

test('un rôle modèle se compose en scope complet et reste compatible avec les gardes historiques', () => {
  const scope = composerScope({
    fonction: 'Monteur',
    modele: 'gestionnaire_video',
    modules: ROLES_MODELES.gestionnaire_video.modules,
    perimetre: { specialites: ['col-mir'], formules: { '*': ['approfondi'] } },
  });
  assert.equal(scope.role, 'professor');
  assert.equal(scope.type, 'college');
  assert.deepEqual(scope.colleges, ['col-mir']);
  assert.equal(scope.content_permissions.video, 'rw');
  assert.equal(scope.content_permissions.qcm, 'none');
  // Les gardes existantes lisent ce scope sans rien savoir des modules.
  const prof = getProfessorScope(scope);
  assert.ok(prof);
  assert.equal(canWrite(prof, 'video'), true);
  assert.equal(canRead(prof, 'fiche'), false);
  assert.equal(profCanAccessCours(prof, 'col-mir', 'x'), true);
  assert.equal(profCanAccessCours(prof, 'col-psychiatrie', 'x'), false);
  assert.equal(canEditCoursContent({ role: 'professor', permission_scope: scope }, 'video', 'col-mir', 'x'), true);
  // Droits fins du cahier : dépose et modifie, mais ne publie ni ne supprime.
  assert.equal(peutContenu(scope, 'creer', 'video'), true);
  assert.equal(peutContenu(scope, 'publier', 'video'), false);
  assert.equal(peutContenu(scope, 'supprimer', 'video'), false);
  assert.equal(peutContenu(scope, 'creer', 'fiche'), false);
});

test('un compte historique (content_permissions seules) est traduit en modules sans perte', () => {
  const legacy = {
    role: 'professor', type: 'college', colleges: ['col-geriatrie'],
    content_permissions: { qcm: 'rw', dp: 'rw', qroc: 'none', fiche: 'read' },
  };
  const scope = lireScopeEquipe(legacy, 'intervenant');
  assert.ok(scope);
  assert.equal(scope.modules.contenus.actif, true);
  assert.deepEqual(scope.modules.contenus.types.sort(), ['dp', 'fiche', 'qcm']);
  assert.equal(scope.modules.contenus.creer, true);
  assert.equal(scope.modules.suivi.actif, true);
  assert.equal(scope.modules.suivi.rediger, true);
  assert.equal(scope.modules.suivi.gerer, false);
  assert.equal(roleSuiviDeScope(scope), 'intervenant');
  assert.deepEqual(scope.perimetre.specialites, ['col-geriatrie']);
  // La recomposition conserve l'accès QCM/DP et la révocation QROC.
  assert.equal(scope.content_permissions.qcm, 'rw');
  assert.equal(scope.content_permissions.qroc, 'none');
});

test('un module inactif n’a aucun droit ; un élève n’est jamais du personnel', () => {
  const m: Modules = { ...modulesVides(), blog: { actif: false, creer: true, modifier_siens: true, modifier_tous: true, publier: true, depublier: true, supprimer: true } };
  const scope = composerScope({ modules: m, perimetre: { specialites: 'toutes', formules: {} } });
  assert.equal(scope.modules.blog.creer, false);
  assert.equal(peutBlog(scope, 'creer'), false);
  assert.equal(lireScopeEquipe({ type: 'college', colleges: ['col-mir'], offer: 'approfondi' }), null);
});

test('blog : modifier ses propres articles ≠ modifier tous les articles', () => {
  const scope = composerScope({
    modules: { ...modulesVides(), blog: { actif: true, creer: true, modifier_siens: true, modifier_tous: false, publier: false, depublier: false, supprimer: false } },
    perimetre: { specialites: 'toutes', formules: {} },
  });
  assert.equal(peutBlog(scope, 'modifier', { authorId: 'u1', userId: 'u1' }), true);
  assert.equal(peutBlog(scope, 'modifier', { authorId: 'u2', userId: 'u1' }), false);
  assert.equal(peutBlog(scope, 'publier'), false);
  assert.equal(peutBlog(scope, 'supprimer'), false);
  const chef = composerScope({ modules: ROLES_MODELES.responsable_complet.modules, perimetre: { specialites: 'toutes', formules: {} } });
  assert.equal(peutBlog(chef, 'modifier', { authorId: 'u2', userId: 'u1' }), true);
  assert.equal(peutBlog(chef, 'depublier'), true);
});

test('périmètre : spécialités, puis formules à l’intérieur de chaque spécialité', () => {
  const perimetre = { specialites: ['col-mir', 'col-geriatrie'], formules: { '*': ['approfondi'] as const, 'col-geriatrie': ['essentiel', 'intensif'] as const } };
  const p = composerScope({ modules: modulesVides(), perimetre: { specialites: perimetre.specialites, formules: { '*': ['approfondi'], 'col-geriatrie': ['essentiel', 'intensif'] } } }).perimetre;
  assert.deepEqual(formulesPour(p, 'col-mir'), ['approfondi']);
  assert.deepEqual(formulesPour(p, 'col-geriatrie'), ['essentiel', 'intensif']);
  // Médecine d'urgence Approfondi : dedans. Médecine d'urgence Intensif : dehors.
  assert.equal(eleveDansPerimetre(p, { colleges: ['col-mir'], offers: ['approfondi'] }), true);
  assert.equal(eleveDansPerimetre(p, { colleges: ['col-mir'], offers: ['intensif'] }), false);
  // Gériatrie Intensif : dedans (surcharge). Psychiatrie : hors périmètre.
  assert.equal(eleveDansPerimetre(p, { colleges: ['col-geriatrie'], offers: ['intensif'] }), true);
  assert.equal(eleveDansPerimetre(p, { colleges: ['col-psychiatrie'], offers: ['approfondi'] }), false);
  // Découverte n'est pas une formule vendue : jamais dans un périmètre.
  assert.equal(eleveDansPerimetre(p, { colleges: ['col-mir'], offers: ['decouverte'] }), false);
  // Accès intégral : dans toutes les spécialités.
  assert.equal(eleveDansPerimetre(p, { colleges: 'all', offers: ['approfondi'] }), true);
});

test('expiration : seule une date de fin dépassée ferme l’accès d’un membre du personnel', () => {
  const now = Date.parse('2026-09-18T12:00:00Z');
  assert.equal(accesEquipeExpire({ role: 'professor', access_end: '2026-09-01T00:00:00Z' }, now), true);
  assert.equal(accesEquipeExpire({ role: 'professor', access_end: '2026-12-01T00:00:00Z' }, now), false);
  assert.equal(accesEquipeExpire({ role: 'professor', access_end: null }, now), false);
  assert.equal(accesEquipeExpire({ role: 'admin', access_end: '2026-09-01T00:00:00Z' }, now), false);
});

test('atterrissage : la première page ouverte suit les modules ; résumé lisible', () => {
  const commercial = composerScope({ modules: ROLES_MODELES.commercial.modules, perimetre: { specialites: 'toutes', formules: {} } });
  assert.equal(premierePage(commercial), '/admin/suivi/eleves');
  const redacteur = composerScope({ modules: ROLES_MODELES.redacteur_blog.modules, perimetre: { specialites: 'toutes', formules: {} } });
  assert.equal(premierePage(redacteur), '/admin/blog');
  const rien = composerScope({ modules: modulesVides(), perimetre: { specialites: 'toutes', formules: {} } });
  assert.equal(premierePage(rien), '/admin/securite');
  assert.match(resumeModules(commercial)[0], /Suivi élèves : rédiger/);
});

test('hiérarchie : un parent coché déploie ses sous-collèges avec ses formules, et se replie à l’affichage', () => {
  const enfantsDe = { 'col-medecine-generale': ['col-mg-ophtalmologie', 'col-mg-pediatrie'] };
  const parentDe = { 'col-mg-ophtalmologie': 'col-medecine-generale', 'col-mg-pediatrie': 'col-medecine-generale' };
  const choisi = { specialites: ['col-medecine-generale', 'col-psychiatrie'], formules: { 'col-medecine-generale': ['intensif'] as ('intensif')[] } };
  const deploye = deployerPerimetre(choisi, enfantsDe);
  assert.deepEqual(deploye.specialites, ['col-medecine-generale', 'col-psychiatrie', 'col-mg-ophtalmologie', 'col-mg-pediatrie']);
  assert.deepEqual(deploye.formules['col-mg-pediatrie'], ['intensif']);
  assert.equal(deploye.formules['col-psychiatrie'], undefined);
  const replie = replierPerimetre(deploye, parentDe);
  assert.deepEqual(replie.specialites, ['col-medecine-generale', 'col-psychiatrie']);
  assert.equal(replie.formules['col-mg-pediatrie'], undefined);
  // Un sous-collège seul (sans son parent) reste explicite.
  const seul = replierPerimetre({ specialites: ['col-mg-pediatrie'], formules: {} }, parentDe);
  assert.deepEqual(seul.specialites, ['col-mg-pediatrie']);
  // « Toutes les spécialités » traverse les deux opérations sans changement.
  assert.equal(deployerPerimetre({ specialites: 'toutes', formules: {} }, enfantsDe).specialites, 'toutes');
});

test('onglets : un monteur vidéo n’ouvre ni Contenu, ni Q&R, ni Entraînements, ni Suivi', () => {
  const monteur = composerScope({ modele: 'gestionnaire_video', modules: ROLES_MODELES.gestionnaire_video.modules, perimetre: { specialites: 'toutes', formules: {} } });
  assert.deepEqual(accesOnglets(monteur), { contenu: false, videos: true, qa: false, entrainements: false, suivi: false, blog: false });
  assert.equal(premierePage(monteur), '/admin/videos');
  assert.deepEqual(pagesDuScope(monteur).map((p) => p.href), ['/admin/videos', '/admin/securite']);
  assert.equal(questionDansPerimetre(monteur, 'col-mir'), false);

  const commercial = composerScope({ modules: ROLES_MODELES.commercial.modules, perimetre: { specialites: 'toutes', formules: {} } });
  assert.deepEqual(accesOnglets(commercial), { contenu: false, videos: false, qa: false, entrainements: false, suivi: true, blog: false });

  const enseignant = composerScope({ modules: ROLES_MODELES.enseignant_relecteur.modules, perimetre: { specialites: ['col-mir'], formules: {} } });
  assert.deepEqual(accesOnglets(enseignant), { contenu: true, videos: true, qa: true, entrainements: true, suivi: false, blog: false });
  assert.equal(premierePage(enseignant), '/admin/contenu');
  // Q&R bornées au périmètre ; une question hors cours ne revient qu'aux « toutes spécialités ».
  assert.equal(questionDansPerimetre(enseignant, 'col-mir'), true);
  assert.equal(questionDansPerimetre(enseignant, 'col-psychiatrie'), false);
  assert.equal(questionDansPerimetre(enseignant, null), false);

  // Fiches seules : Contenu et Q&R, mais pas la file d'entraînements (QCM / flashcards).
  const fiches = composerScope({
    modules: { ...modulesVides(), contenus: { actif: true, creer: true, modifier: true, publier: false, supprimer: false, types: ['fiche'] } },
    perimetre: { specialites: 'toutes', formules: {} },
  });
  assert.equal(accesOnglets(fiches).entrainements, false);
  assert.equal(accesOnglets(fiches).qa, true);
  assert.equal(questionDansPerimetre(fiches, null), true);

  // Compte historique : content_permissions → mêmes onglets qu'un compte récent.
  const legacyVideo = lireScopeEquipe({ role: 'professor', type: 'all', colleges: [], content_permissions: { video: 'rw', qcm: 'none' } });
  assert.deepEqual(accesOnglets(legacyVideo), { contenu: false, videos: true, qa: false, entrainements: false, suivi: false, blog: false });
  const legacyProf = lireScopeEquipe({ role: 'professor', type: 'college', colleges: ['col-geriatrie'], content_permissions: { qcm: 'rw', fiche: 'read' } }, 'lecture');
  assert.deepEqual(accesOnglets(legacyProf), { contenu: true, videos: false, qa: true, entrainements: true, suivi: true, blog: false });
  assert.deepEqual(accesOnglets(null), { contenu: false, videos: false, qa: false, entrainements: false, suivi: false, blog: false });
});

test('poste : le modèle fait foi, sinon il se déduit des modules', () => {
  const p = (modules: Modules, modele: Parameters<typeof composerScope>[0]['modele'] = null) =>
    posteDuScope(composerScope({ modele, modules, perimetre: { specialites: 'toutes', formules: {} } }));
  assert.equal(p(ROLES_MODELES.commercial.modules), 'commercial');
  assert.equal(p(ROLES_MODELES.gestionnaire_video.modules), 'gestionnaire_video');
  assert.equal(p(ROLES_MODELES.redacteur_blog.modules), 'redacteur_blog');
  assert.equal(p(ROLES_MODELES.enseignant_relecteur.modules), 'enseignant_relecteur');
  assert.equal(p(ROLES_MODELES.responsable_complet.modules), 'responsable_complet');
  assert.equal(p({ ...ROLES_MODELES.commercial.modules, blog: ROLES_MODELES.redacteur_blog.modules.blog }), 'personnalise');
  assert.equal(p(modulesVides()), 'personnalise');
  assert.equal(p(ROLES_MODELES.commercial.modules, 'responsable_complet'), 'responsable_complet');
});

test('invitation : adaptée au poste, jamais « professeur » pour un monteur vidéo', () => {
  const monteur = composerScope({
    fonction: 'Monteur vidéo', modele: 'gestionnaire_video', modules: ROLES_MODELES.gestionnaire_video.modules,
    perimetre: { specialites: 'toutes', formules: {} }, mfa_obligatoire: true,
  });
  const pres = presentationPoste(monteur);
  assert.equal(pres.intitule, 'Monteur vidéo');
  assert.equal(pres.enseignant, false);
  assert.match(pres.mission, /À valider/);
  assert.deepEqual(pres.acces, ['Vidéos, replays et supports']);
  const mail = invitationEquipeEmail({ firstName: 'Paul', setupUrl: 'https://exemple.test/x', scope: monteur, accesJusquau: '2026-12-31' });
  for (const t of [mail.subject, mail.html, mail.text]) assert.doesNotMatch(t, /professeur/i);
  assert.match(mail.subject, /Monteur vidéo/);
  assert.match(mail.text, /Bonjour Paul/);
  assert.match(mail.text, /Vidéos, replays et supports/);
  assert.match(mail.text, /2FA/);
  assert.match(mail.text, /31 décembre 2026/);
  assert.doesNotMatch(mail.text, /Questions \/ Réponses|Suivi|Contenu pédagogique/);

  // Sans fonction : le libellé du rôle ; enseignant : son espace enseignant.
  const commercial = composerScope({ modele: 'commercial', modules: ROLES_MODELES.commercial.modules, perimetre: { specialites: 'toutes', formules: {} } });
  assert.match(invitationEquipeEmail({ firstName: 'Léa', setupUrl: 'https://exemple.test/x', scope: commercial }).subject, /Commercial/);
  const enseignant = composerScope({ modules: ROLES_MODELES.enseignant_relecteur.modules, perimetre: { specialites: 'toutes', formules: {} } });
  const mailProf = invitationEquipeEmail({ firstName: 'Anne', setupUrl: 'https://exemple.test/x', scope: enseignant });
  assert.match(mailProf.subject, /espace enseignant/);
  assert.match(mailProf.text, /Questions \/ Réponses/);
  // Rien d'ouvert : invitation neutre, sans liste vide.
  const rien = invitationEquipeEmail({ firstName: '', setupUrl: 'https://exemple.test/x', scope: composerScope({ modules: modulesVides(), perimetre: { specialites: 'toutes', formules: {} } }) });
  assert.match(rien.subject, /Collaborateur/);
  assert.doesNotMatch(rien.html, /Ce à quoi vous aurez accès/);
});
