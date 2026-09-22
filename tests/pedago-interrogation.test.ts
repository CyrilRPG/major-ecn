import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  AUCUN_PREREQUIS,
  PNEUMO_COURS_ID,
  candidatsDuVerrou,
  decisionOuverture,
  redirectionDuRefus,
  type CoursInterrogation,
  type PrerequisInterrogation,
} from '../src/lib/pedago/interrogation-core';
import { parseScope } from '../src/lib/auth/permissions';

/**
 * Interrogation de fin de parcours : la page et le verrou (layout web,
 * /api/mobile/gates) décident par les mêmes règles. Tout écart est une
 * impasse — boucle de redirection quand la page refuse un cours que le verrou
 * impose, écran de prérequis sans issue sur l'app (23/09/2026).
 */

const cours: CoursInterrogation = { id: 'c-1', titre: 'Replays - Révisions', matiere_id: 'col-endocrinologie' };
const tout: PrerequisInterrogation = { video: true, fiche: true, qcm: true, flashcards: true };
const scopeCollege = (colleges: string[], extra: Record<string, unknown> = {}) =>
  parseScope({ type: 'college', colleges, offer: 'approfondi', ...extra });

const decide = (over: Partial<Parameters<typeof decisionOuverture>[0]> = {}) => decisionOuverture({
  cours,
  estAdmin: false,
  scope: scopeCollege(['col-endocrinologie']),
  formuleOuvre: true,
  prerequis: tout,
  ...over,
});

test('ouverture : parcours terminé et accès complet → la page s’ouvre', () => {
  assert.deepEqual(decide(), { ok: true, cours });
});

test('ouverture : les refus suivent l’ordre des contrôles de la page', () => {
  assert.equal(decide({ cours: null }).ok, false);
  assert.deepEqual(decide({ cours: null }), { ok: false, refus: 'introuvable' });
  // Collège retiré du périmètre : refusé avant tout le reste.
  const college = decide({ scope: scopeCollege(['col-cardiologie']), formuleOuvre: false, prerequis: AUCUN_PREREQUIS });
  assert.equal(!college.ok && college.refus, 'college');
  // Collège conservé, mais l'item n'est plus dans la liste explicite.
  const item = decide({ scope: scopeCollege(['col-endocrinologie'], { cours: ['autre-item'] }) });
  assert.equal(!item.ok && item.refus, 'cours');
  // La formule n'ouvre plus l'interrogation.
  const formule = decide({ formuleOuvre: false });
  assert.equal(!formule.ok && formule.refus, 'formule');
  // Accès complet, parcours inachevé : les quatre étapes sont rendues.
  const prerequis = decide({ prerequis: { ...tout, flashcards: false } });
  assert.deepEqual(prerequis, { ok: false, refus: 'prerequis', cours, prerequis: { ...tout, flashcards: false } });
});

test('ouverture : une réponse à un QCM suffit, sans série terminée', () => {
  // Le verrou compte `qcm_attempts` ; l'écran mobile exigeait une
  // `qcm_sessions` terminée et laissait l'élève sur des prérequis sans issue.
  assert.equal(decide({ prerequis: { video: true, fiche: true, qcm: true, flashcards: true } }).ok, true);
  assert.equal(decide({ prerequis: { video: true, fiche: true, qcm: false, flashcards: true } }).ok, false);
});

test('ouverture : l’administrateur passe les accès, pas le parcours', () => {
  const admin = { estAdmin: true, scope: scopeCollege([]), formuleOuvre: false };
  assert.equal(decide(admin).ok, true);
  const inacheve = decide({ ...admin, prerequis: AUCUN_PREREQUIS });
  assert.equal(!inacheve.ok && inacheve.refus, 'prerequis');
});

test('ouverture : contournement Pneumologie — aucun prérequis de parcours', () => {
  const pneumo = { ...cours, id: PNEUMO_COURS_ID };
  assert.equal(decide({ cours: pneumo, prerequis: AUCUN_PREREQUIS }).ok, true);
  // … mais jamais celui des accès.
  const sansFormule = decide({ cours: pneumo, prerequis: AUCUN_PREREQUIS, formuleOuvre: false });
  assert.equal(!sansFormule.ok && sansFormule.refus, 'formule');
});

test('redirections de la page : jamais vers l’interrogation elle-même', () => {
  assert.equal(redirectionDuRefus({ ok: false, refus: 'introuvable' }), null);
  assert.equal(redirectionDuRefus({ ok: false, refus: 'college', cours }), '/facultes');
  assert.equal(redirectionDuRefus({ ok: false, refus: 'cours', cours }), '/matieres/col-endocrinologie');
  assert.equal(redirectionDuRefus({ ok: false, refus: 'formule', cours }), '/cours/c-1');
  assert.equal(redirectionDuRefus({ ok: false, refus: 'prerequis', cours, prerequis: AUCUN_PREREQUIS }), '/cours/c-1');
});

test('candidats du verrou : certificats signés exclus, sans doublon, ordre conservé', () => {
  const progres = [{ cours_id: 'a' }, { cours_id: 'b' }, { cours_id: 'a' }, { cours_id: 'c' }];
  const completions = [
    { cours_id: 'b', certificate_signed_at: '2026-09-20T10:00:00Z' },
    // Interrogation passée mais certificat non signé : toujours à signer.
    { cours_id: 'c', certificate_signed_at: null },
  ];
  assert.deepEqual(candidatsDuVerrou(progres, completions), ['a', 'c']);
  assert.deepEqual(candidatsDuVerrou([], completions), []);
});

test('parité : la page, le layout et les gates décident par le même module', () => {
  const lire = (rel: string) => readFileSync(new URL(`../src/${rel}`, import.meta.url), 'utf8');
  const layout = lire('app/(student)/layout.tsx');
  const gates = lire('app/api/mobile/gates/route.ts');
  const page = lire('app/(student)/cours/[cours]/interrogation/page.tsx');
  const ecranApp = lire('app/api/mobile/interrogation/route.ts');
  for (const verrou of [layout, gates]) {
    assert.match(verrou, /interrogationEnAttente\(/);
    // Aucune copie locale de la règle du parcours.
    assert.doesNotMatch(verrou, /from\('qcm_attempts'\)|from\('flashcard_reviews'\)/);
  }
  for (const ecran of [page, ecranApp]) {
    assert.match(ecran, /ouverturesInterrogation\(/);
    assert.doesNotMatch(ecran, /from\('qcm_attempts'\)|from\('qcm_sessions'\)|canAccessCollege/);
  }
});
