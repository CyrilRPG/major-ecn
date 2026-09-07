/**
 * Audit des corrigés — passage « justifications » : détection des
 * justifications vides ou recopiées de l'énoncé (7 771 recopiées et 7 384
 * vides en base le 06/09/2026, surtout dans les DP Gériatrie), requêtes de
 * rédaction et lecture des propositions.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import {
  justificationARediger, questionsARediger, construireRequetesRedaction, formaterQuestionsRedaction,
  lireJustifications, estimerCoutRedactionUsd, justificationsSchema, QUESTIONS_PAR_REQUETE_REDACTION,
  type QuestionAuditee,
} from '../src/lib/qcm-audit/regles';

test('une justification vide, ou identique à l’énoncé au balisage et à la casse près, est à rédiger', () => {
  assert.equal(justificationARediger({ enonce: 'Le BNP élevé confirme l’origine cardiaque', justification: '' }), true);
  assert.equal(justificationARediger({ enonce: 'Le BNP élevé confirme l’origine cardiaque', justification: '  ' }), true);
  assert.equal(justificationARediger({ enonce: '<p>Le BNP élevé confirme l’origine cardiaque</p>', justification: 'le bnp élevé confirme l’origine cardiaque.' }), true);
  assert.equal(justificationARediger({ enonce: 'Le BNP élevé confirme l’origine cardiaque', justification: 'Faux : le BNP oriente mais ne confirme pas.' }), false);
});

const question = (n: number, justifs: string[]): QuestionAuditee => ({
  id: `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`,
  cours_id: 'c', college_id: 'col', enonce: `Question ${n}`,
  items: justifs.map((j, i) => ({
    id: `10000000-0000-4000-8000-${String(n).padStart(6, '0')}${String(i).padStart(6, '0')}`,
    lettre: 'ABCDE'[i], enonce: `Proposition ${'ABCDE'[i]}`, is_correct: i === 0, justification: j,
  })),
});

test('seules les questions ayant une proposition à rédiger sont soumises, et ces propositions sont marquées', () => {
  const saine = question(1, ['Vrai : …', 'Faux : …']);
  const abimee = question(2, ['Proposition A', 'Faux : …', '']);
  assert.deepEqual(questionsARediger([saine, abimee]).map((q) => q.id), [abimee.id]);
  const corps = formaterQuestionsRedaction([abimee]);
  assert.match(corps, /A \[id=[0-9a-f-]+\] clé=VRAI — Proposition A\n\s+→ À RÉDIGER/);
  assert.match(corps, /B \[id=[0-9a-f-]+\] clé=FAUX — Proposition B\n\s+justification existante : Faux : …/);
  assert.match(corps, /C \[id=[0-9a-f-]+\] clé=FAUX — Proposition C\n\s+→ À RÉDIGER/);
});

test('les requêtes de rédaction sont plus petites et portent le schéma des justifications', () => {
  const qs = Array.from({ length: 10 }, (_, i) => question(i + 1, ['', 'x']));
  const requetes = construireRequetesRedaction(qs, 'claude-sonnet-5', 'run-col');
  assert.equal(requetes.length, Math.ceil(10 / QUESTIONS_PAR_REQUETE_REDACTION));
  assert.equal(requetes[0].params.max_tokens, 8_000);
  assert.deepEqual(requetes[0].params.output_config.format.schema, justificationsSchema);
  assert.ok(requetes.every((r) => r.custom_id.startsWith('run-col-r')));
});

test('lireJustifications ne garde que des textes substantiels, sans HTML, un par identifiant', () => {
  const id = '5fe4ec75-266a-4e75-9e8f-40a494907695';
  const texte = JSON.stringify({ justifications: [
    { item_id: id, justification: '<p>Faux : un BNP élevé oriente vers une origine cardiaque mais ne la confirme pas à lui seul.</p>' },
    { item_id: id, justification: 'doublon à ignorer, pourtant assez long pour passer' },
    { item_id: '77b893c4-2d49-4eff-9ece-5c6835e0dcbc', justification: 'trop court' },
    { item_id: 'nope', justification: 'identifiant invalide mais texte assez long pour passer' },
  ] });
  const out = lireJustifications(texte);
  assert.equal(out.length, 1);
  assert.equal(out[0].item_id, id);
  assert.equal(out[0].justification, 'Faux : un BNP élevé oriente vers une origine cardiaque mais ne la confirme pas à lui seul.');
  assert.deepEqual(lireJustifications('{}'), []);
});

test('la rédaction des ~1 900 questions abîmées coûte quelques dollars, pas des dizaines', () => {
  const cout = estimerCoutRedactionUsd(1_883, 7_771, 'claude-sonnet-5');
  assert.ok(cout > 2 && cout < 15, `coût hors plage : ${cout}`);
});
