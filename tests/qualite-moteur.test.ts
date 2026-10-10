import assert from 'node:assert/strict';
import test from 'node:test';
import { analyserCommentaire, estAnalysable } from '../src/lib/qualite/analyse-regles';
import { analyserReponse } from '../src/lib/qualite/alertes-regles';
import { doitBloquer, envoiBloquant, pageBloquee, type EnvoiGarde } from '../src/lib/qualite/blocage';
import { mesurerEfficacite } from '../src/lib/qualite/efficacite';
import { deciderInactivite } from '../src/lib/qualite/inactivite';
import {
  cleEnseignant, nps, tauxCommentairesNegatifs, tauxNotesDefavorables, tauxParticipation, tauxSignalementTheme,
} from '../src/lib/qualite/indicateurs';
import { ajouterMois, enProtectionExamen, planifier, progressionParcours, type EntreeOrchestrateur } from '../src/lib/qualite/orchestrateur';
import { normaliserParametres, PARAMETRES_DEFAUT } from '../src/lib/qualite/parametres';
import { MODELES_DEFAUT } from '../src/lib/qualite/questionnaires-defaut';
import { exploiterReponse } from '../src/lib/qualite/reponses';
import { regrouper } from '../src/lib/qualite/recurrence';
import { transitionsPossibles, verifierTransition } from '../src/lib/qualite/workflow';

const params = normaliserParametres({ actif: true, demarrage: '2026-10-01T00:00:00Z' });
const T = (iso: string) => Date.parse(iso);

function entree(p: Partial<EntreeOrchestrateur>): EntreeOrchestrateur {
  return {
    now: T('2026-11-10T12:00:00Z'), params, actif: true,
    debutFormation: '2026-09-01', finFormation: '2027-01-31',
    premiereEpreuve: '2027-01-20', derniereEpreuve: '2027-01-22', examSessionId: 'evc-2027',
    enPause: false, progression: 10, participations: [], envois: [], ...p,
  };
}

test('paramètres : livré éteint, normalisation bornée, facultatif jamais bloquant', () => {
  assert.equal(PARAMETRES_DEFAUT.actif, false);
  const p = normaliserParametres({ familles: { HOT: { obligatoire: false, blocking_scope: 'pedagogie' } }, hot: { seuil_replay: 5 } });
  assert.equal(p.familles.HOT.blocking_scope, 'aucun');
  assert.equal(p.hot.seuil_replay, 1);
  assert.deepEqual(p.progress.seuils, [33, 66]);
  assert.equal(normaliserParametres(null).inactivite.paliers.length, 4);
});

test('orchestrateur : module inactif ⇒ rien', () => {
  const d = planifier(entree({ params: PARAMETRES_DEFAUT, participations: [{ seanceId: 's1', mode: 'direct', disponibleAt: '2026-11-09T18:00:00Z' }] }));
  assert.equal(d.creations.length, 0);
});

test('orchestrateur : un seul questionnaire à chaud par séance (direct + replay)', () => {
  const d = planifier(entree({
    participations: [
      { seanceId: 's1', mode: 'direct', disponibleAt: '2026-11-09T18:00:00Z' },
      { seanceId: 's1', mode: 'replay', disponibleAt: '2026-11-10T08:00:00Z' },
    ],
  }));
  const hot = d.creations.filter((c) => c.famille === 'HOT');
  assert.equal(hot.length, 1);
  assert.equal(hot[0].cle, 'HOT:s1');
  assert.equal(hot[0].statut, 'envoye');
  // Déjà existant ⇒ jamais recréé
  const d2 = planifier(entree({
    participations: [{ seanceId: 's1', mode: 'replay', disponibleAt: '2026-11-10T08:00:00Z' }],
    envois: [{ id: 'e1', cle: 'HOT:s1', famille: 'HOT', statut: 'complete', programme_pour: '2026-11-09T18:10:00Z', echeance: null, created_at: '2026-11-09T18:10:00Z' }],
  }));
  assert.equal(d2.creations.filter((c) => c.famille === 'HOT').length, 0);
});

test('orchestrateur : pas de questionnaire rétroactif avant l’activation, ni avant la fin de la séance', () => {
  const d = planifier(entree({ participations: [{ seanceId: 'vieux', mode: 'direct', disponibleAt: '2026-09-20T18:00:00Z' }] }));
  assert.equal(d.creations.filter((c) => c.famille === 'HOT').length, 0);
  const d2 = planifier(entree({ participations: [{ seanceId: 'futur', mode: 'direct', disponibleAt: '2026-11-10T12:05:00Z' }] }));
  assert.equal(d2.creations.filter((c) => c.famille === 'HOT').length, 0);
});

test('orchestrateur : bilans intermédiaires — un seul seuil à la fois, le plus avancé', () => {
  const d = planifier(entree({ progression: 70 }));
  const prog = d.creations.filter((c) => c.famille === 'PROGRESS');
  assert.equal(prog.length, 1);
  assert.equal(prog[0].cle, 'PROGRESS_66');
  const d2 = planifier(entree({ progression: 40 }));
  assert.equal(d2.creations.find((c) => c.famille === 'PROGRESS')?.cle, 'PROGRESS_33');
  const d3 = planifier(entree({ progression: 40, envois: [{ id: 'p', cle: 'PROGRESS_33', famille: 'PROGRESS', statut: 'complete', programme_pour: '2026-10-20T00:00:00Z', echeance: null, created_at: '2026-10-20T00:00:00Z' }] }));
  assert.equal(d3.creations.filter((c) => c.famille === 'PROGRESS').length, 0);
});

test('orchestrateur : bilan final J-3 programmé puis reprogrammé si le calendrier change', () => {
  const d = planifier(entree({}));
  const fin = d.creations.find((c) => c.famille === 'FINAL');
  assert.ok(fin);
  assert.equal(fin.statut, 'programme');
  assert.equal(fin.cle, 'FINAL:evc-2027');
  assert.equal(fin.programmePour, '2027-01-17T06:00:00.000Z'); // 07:00 Paris (hiver)
  const d2 = planifier(entree({
    premiereEpreuve: '2027-01-27',
    envois: [{ id: 'f', cle: 'FINAL:evc-2027', famille: 'FINAL', statut: 'programme', programme_pour: fin.programmePour, echeance: fin.echeance, created_at: '2026-11-10T12:00:00Z' }],
  }));
  const rep = d2.misesAJour.find((m) => m.id === 'f');
  assert.equal(rep?.type, 'reprogrammer');
  assert.equal(d2.creations.filter((c) => c.famille === 'FINAL').length, 0);
});

test('orchestrateur : activation à l’heure, expiration, priorité du bilan final', () => {
  const now = T('2027-01-17T08:00:00Z');
  const d = planifier(entree({
    now,
    envois: [
      { id: 'f', cle: 'FINAL:evc-2027', famille: 'FINAL', statut: 'programme', programme_pour: '2027-01-17T06:00:00.000Z', echeance: '2027-01-20T23:00:00.000Z', created_at: '2026-11-10T12:00:00Z' },
      { id: 'p', cle: 'PROGRESS_66', famille: 'PROGRESS', statut: 'envoye', programme_pour: '2027-01-10T00:00:00Z', echeance: '2027-02-10T00:00:00Z', created_at: '2027-01-10T00:00:00Z' },
      { id: 'h', cle: 'HOT:x', famille: 'HOT', statut: 'envoye', programme_pour: '2027-01-16T20:00:00Z', echeance: '2027-01-30T00:00:00Z', created_at: '2027-01-16T20:00:00Z' },
      { id: 'old', cle: 'HOT:y', famille: 'HOT', statut: 'affiche', programme_pour: '2026-12-01T00:00:00Z', echeance: '2026-12-15T00:00:00Z', created_at: '2026-12-01T00:00:00Z' },
    ],
  }));
  const parId = new Map(d.misesAJour.map((m) => [m.id, m]));
  assert.equal(parId.get('f')?.type, 'activer');
  assert.equal(parId.get('p')?.type, 'neutraliser');
  assert.equal(parId.get('h')?.type, 'neutraliser'); // dernière ligne droite
  assert.equal(parId.get('old')?.type, 'expirer');
});

test('orchestrateur : questionnaire à chaud pendant la protection = neutralisé, tracé, jamais une réponse', () => {
  const d = planifier(entree({ now: T('2027-01-16T12:00:00Z'), participations: [{ seanceId: 's9', mode: 'direct', disponibleAt: '2027-01-16T10:00:00Z' }] }));
  const h = d.creations.find((c) => c.famille === 'HOT');
  assert.equal(h?.statut, 'neutralise');
  assert.equal(h?.motif, 'protection_avant_examen');
  assert.equal(enProtectionExamen(T('2027-01-12T12:00:00Z'), params, '2027-01-20', '2027-01-22'), false);
  assert.equal(enProtectionExamen(T('2027-01-13T12:00:00Z'), params, '2027-01-20', '2027-01-22'), true);
});

test('orchestrateur : post-EVC J+3 et suivi différé à six mois', () => {
  const d = planifier(entree({}));
  const post = d.creations.find((c) => c.famille === 'POST_EXAM');
  assert.equal(post?.programmePour, '2027-01-25T08:00:00.000Z');
  const fu = d.creations.find((c) => c.famille === 'FOLLOW_UP');
  assert.equal(fu?.programmePour, '2027-07-31T07:00:00.000Z'); // été : UTC+2
  assert.equal(ajouterMois('2026-08-31', 6), '2027-02-28');
});

test('progression du parcours : règle max documentée', () => {
  const now = T('2026-10-31T12:00:00Z');
  assert.equal(Math.round(progressionParcours('calendaire', 5, '2026-09-01', '2026-12-31', now) ?? 0), 50);
  assert.equal(progressionParcours('pedagogique', 5, '2026-09-01', '2026-12-31', now), 5);
  assert.equal(Math.round(progressionParcours('max', 5, '2026-09-01', '2026-12-31', now) ?? 0), 50);
  assert.equal(progressionParcours('max', 70, '2026-09-01', '2026-12-31', now), 70);
  assert.equal(progressionParcours('max', null, null, null, now), null);
});

test('blocage : périmètre précis, un seul questionnaire à la fois, suspensions', () => {
  assert.equal(pageBloquee('/entrainement/abc', 'activites'), true);
  assert.equal(pageBloquee('/cours/abc', 'activites'), false);
  assert.equal(pageBloquee('/cours/abc', 'pedagogie'), true);
  for (const p of ['/profil', '/presences', '/formulaires/1', '/echanges', '/agenda', '/enquetes/x', '/accueil']) {
    assert.equal(pageBloquee(p, 'pedagogie'), false, p);
  }
  const now = T('2026-11-10T12:00:00Z');
  const base: EnvoiGarde = { id: 'a', famille: 'HOT', statut: 'envoye', obligatoire: true, priorite: 30, blocking_scope: 'activites', programme_pour: '2026-11-09T00:00:00Z', suspendu_jusqu_au: null };
  const final: EnvoiGarde = { ...base, id: 'f', famille: 'FINAL', priorite: 100 };
  assert.equal(envoiBloquant([base, final], now)?.id, 'f');
  assert.equal(envoiBloquant([base, { ...final, suspendu_jusqu_au: '2026-11-11T00:00:00Z' }], now)?.id, 'a');
  assert.equal(envoiBloquant([{ ...base, obligatoire: false }], now), null);
  assert.equal(envoiBloquant([base], now, true), null);
  assert.equal(doitBloquer('/checkup', base), true);
});

test('analyse : les quatre remarques du cahier des charges forment un seul thème', () => {
  const textes = ['Le professeur va trop vite.', 'Impossible de suivre le rythme.', 'Les explications sont trop rapides.', 'Il faudrait ralentir et détailler davantage.'];
  for (const t of textes) {
    const a = analyserCommentaire(t, 5);
    assert.equal(a.themeCle, 'rythme_trop_rapide', t);
    assert.notEqual(a.sentiment, 'positif', t);
  }
  const groupes = regrouper(textes.map((t, i) => ({
    id: `c${i}`, user_id: `u${i}`, theme_cle: 'rythme_trop_rapide', sentiment: 'negatif', created_at: `2026-11-0${i + 1}T10:00:00Z`,
    enseignant_cle: 'dupont', enseignant_nom: 'Dr Dupont', contenu_id: null, contenu_label: null, seance_id: `s${i}`,
  })), { now: T('2026-11-10T00:00:00Z'), seuil: 3, fenetreJours: 30 });
  const g = groupes.find((x) => x.portee === 'enseignant');
  assert.equal(g?.candidats, 4);
  assert.equal(g?.depasseSeuil, true);
  assert.equal(g?.seances.length, 4);
});

test('analyse : négatif malgré une note élevée, positif, neutre, réclamation', () => {
  assert.equal(analyserCommentaire('Les explications n\'étaient pas claires du tout', 5).sentiment, 'negatif');
  assert.equal(analyserCommentaire('Super séance, merci beaucoup !', 5).sentiment, 'positif');
  assert.equal(analyserCommentaire('RAS', 4).sentiment, 'neutre');
  assert.equal(estAnalysable('rien à signaler'), false);
  const r = analyserCommentaire('Je demande le remboursement, c’est inadmissible', 1);
  assert.equal(r.nature, 'reclamation');
  assert.equal(r.gravite, 'critique');
  assert.equal(analyserCommentaire('Il y a une erreur dans la correction du QCM 12', 4).contenuType, 'qcm');
  assert.equal(analyserCommentaire('Les recommandations HAS ne sont plus à jour', 4).themeCle, 'contenu_non_actualise');
  // « annuler » ne doit pas être lu comme « nul »
  assert.notEqual(analyserCommentaire('Pensez à ne pas annuler', 5).scores.negatif > 2, true);
});

test('réponses : obligatoires, conditions et dérivés', () => {
  const hot = MODELES_DEFAUT.find((m) => m.code === 'HOT')!.questions;
  const ko = exploiterReponse(hot, { note_globale: 4 });
  assert.equal(ko.ok, false);
  const ok = exploiterReponse(hot, {
    note_globale: 4, clarte: 2, maitrise: 5, rythme: 1, pertinence: 4, supports: 4, difficulte: false,
    difficulte_detail: 'ignoré car condition fausse', amelioration: 'Le prof va trop vite',
  });
  assert.ok(ok.ok);
  assert.equal(ok.valeur.noteGlobale, 4);
  assert.equal(ok.valeur.noteMin, 1);
  assert.equal(ok.valeur.reponses.difficulte_detail, null);
  assert.equal(ok.valeur.commentaires.length, 1);
  const analyse = analyserReponse({
    reponseId: 'r1', famille: 'HOT', titreContexte: 'Séance', exploitee: ok.valeur,
    analyses: ok.valeur.commentaires.map((c) => analyserCommentaire(c.texte, 4)),
  });
  assert.ok(analyse.alertes.some((a) => a.type === 'note_basse' && a.niveau === 'critique'));
  assert.ok(analyse.alertes.some((a) => a.type === 'commentaire_negatif'));
});

test('alertes : difficultés persistantes puis prioritaires, contact, non résolu', () => {
  const prog = MODELES_DEFAUT.find((m) => m.code === 'PROGRESS_66')!.questions;
  const brut: Record<string, unknown> = {};
  for (const q of prog) if (q.type === 'note5') brut[q.id] = 4;
  Object.assign(brut, { difficulte: true, difficultes: ['Dossiers cliniques'], contact: true, resolu: 'Non' });
  const r = exploiterReponse(prog, brut);
  assert.ok(r.ok);
  const a = analyserReponse({
    reponseId: 'r2', famille: 'PROGRESS', titreContexte: '66 %', exploitee: r.valeur, analyses: [],
    difficultesOuvertes: [{ cle: 'difficulte:dossiers_cliniques', occurrences: 2 }],
  });
  assert.equal(a.difficultes.find((d) => d.cle === 'difficulte:dossiers_cliniques')?.niveau, 'prioritaire');
  assert.ok(a.alertes.some((x) => x.type === 'demande_contact'));
  assert.ok(a.alertes.some((x) => x.type === 'difficulte_non_resolue' && x.niveau === 'critique'));
});

test('indicateurs : séparés, avec effectifs ; neutralisation ≠ réponse', () => {
  const reps = [1, 2, 3, 4, 5, null].map((n, i) => ({ user_id: `u${i}`, note_globale: n, notes: {}, note_min: n, soumis_at: '2026-11-01T00:00:00Z' }));
  assert.deepEqual(tauxNotesDefavorables(reps), { n: 2, total: 5, pct: 40 });
  const part = tauxParticipation([{ statut: 'complete' }, { statut: 'expire' }, { statut: 'neutralise' }, { statut: 'dispense' }, { statut: 'programme' }]);
  assert.deepEqual(part, { n: 1, total: 2, pct: 50 });
  const coms = [
    { reponse_id: 'a', user_id: 'u1', sentiment: 'negatif' as const, theme_cle: 't', texte: 'trop vite', created_at: '' },
    { reponse_id: 'a', user_id: 'u1', sentiment: 'positif' as const, theme_cle: null, texte: 'merci', created_at: '' },
    { reponse_id: 'b', user_id: 'u2', sentiment: 'neutre' as const, theme_cle: null, texte: 'RAS', created_at: '' },
    { reponse_id: 'c', user_id: 'u3', sentiment: 'positif' as const, theme_cle: null, texte: 'top', created_at: '' },
  ];
  assert.deepEqual(tauxCommentairesNegatifs(coms, estAnalysable), { n: 1, total: 2, pct: 50 });
  assert.deepEqual(tauxSignalementTheme('t', coms, new Set(['u1', 'u2', 'u3', 'u4'])), { n: 1, total: 4, pct: 25 });
  assert.deepEqual(nps([10, 9, 8, 3]), { score: 25, n: 4 });
  assert.equal(cleEnseignant('Dr Jean DUPONT'), 'jean dupont');
});

test('inactivité : un palier à la fois, le plus haut si plusieurs, réinitialisation', () => {
  const p = PARAMETRES_DEFAUT.inactivite;
  const now = T('2026-11-30T12:00:00Z');
  const ex = { pause: false, termine: false, decouverte: false, exclu: false };
  const d = deciderInactivite({ derniereActivite: '2026-11-01T12:00:00Z', debutFormation: null, palierActuel: 0, palierAt: null }, p, now, ex);
  assert.equal(d.type, 'palier');
  if (d.type === 'palier') { assert.equal(d.action, 'accompagnement'); assert.deepEqual(d.ignores, ['rappel', 'relance', 'signalement']); }
  const d2 = deciderInactivite({ derniereActivite: '2026-11-22T12:00:00Z', debutFormation: null, palierActuel: 0, palierAt: null }, p, now, ex);
  assert.equal(d2.type === 'palier' && d2.action, 'rappel');
  const d3 = deciderInactivite({ derniereActivite: '2026-11-29T12:00:00Z', debutFormation: null, palierActuel: 2, palierAt: '2026-11-20T00:00:00Z' }, p, now, ex);
  assert.equal(d3.type, 'reinitialiser');
  assert.equal(deciderInactivite({ derniereActivite: '2026-10-01T00:00:00Z', debutFormation: null, palierActuel: 0, palierAt: null }, p, now, { ...ex, pause: true }).type, 'rien');
});

test('actions correctives : cycle, justification, validation humaine de la clôture', () => {
  assert.deepEqual(transitionsPossibles('nouveau'), ['en_analyse', 'sans_suite']);
  assert.equal(verifierTransition('nouveau', 'cloture', {}) !== null, true);
  assert.match(verifierTransition('en_cours', 'sans_suite', {}) ?? '', /justifi/);
  assert.equal(verifierTransition('efficacite_a_verifier', 'cloture', { efficacite_constat: 'Remarques en baisse' }), null);
  assert.deepEqual(transitionsPossibles('cloture'), []);
});

test('efficacité : comparaison avant / après sur des fenêtres égales', () => {
  const ref = '2026-11-01T00:00:00Z';
  const reponses = [
    ...[2, 3, 2, 3, 3].map((n, i) => ({ soumis_at: `2026-10-${10 + i}T10:00:00Z`, note_globale: n, user_id: `a${i}` })),
    ...[4, 5, 4, 4, 5].map((n, i) => ({ soumis_at: `2026-11-${10 + i}T10:00:00Z`, note_globale: n, user_id: `b${i}` })),
  ];
  const commentaires = [
    ...[0, 1, 2].map((i) => ({ created_at: `2026-10-1${i}T10:00:00Z`, theme_cle: 'manque_methodologie', sentiment: 'negatif', user_id: `a${i}` })),
  ];
  const m = mesurerEfficacite({ dateReference: ref, fenetreJours: 30, now: T('2026-12-15T00:00:00Z'), reponses, commentaires, themeCle: 'manque_methodologie' });
  assert.equal(m.verdict, 'amelioration');
  assert.equal(m.avant.candidatsTheme, 3);
  assert.equal(m.apres.candidatsTheme, 0);
});
