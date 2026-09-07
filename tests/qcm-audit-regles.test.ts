/**
 * Audit des corrigés — règles pures : construction des requêtes par lots,
 * lecture des constats, estimation. Le cas de référence est celui signalé par
 * un élève le 06/09/2026 (clé « faux », justification qui démontre le vrai).
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import {
  construireRequetes, decouperEnBatches, formaterQuestions, lireConstats, estimerCoutUsd, texteBrut,
  QUESTIONS_PAR_REQUETE, constatsSchema, type QuestionAuditee,
} from '../src/lib/qcm-audit/regles';

const question = (n: number): QuestionAuditee => ({
  id: `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`,
  cours_id: 'c', college_id: 'col',
  enonce: `<p><strong>Nouvel élément :</strong> question ${n}</p>`,
  items: ['A', 'B', 'C'].map((l) => ({
    id: `10000000-0000-4000-8000-${String(n).padStart(6, '0')}${l.charCodeAt(0).toString().padStart(6, '0')}`,
    lettre: l, enonce: `Proposition ${l}`, is_correct: l === 'A', justification: l === 'A' ? 'Vrai : …' : '',
  })),
});

test('texteBrut retire le HTML, décode les entités et borne la longueur', () => {
  assert.equal(texteBrut('<p>Un BNP &gt; 100&nbsp;pg/mL<br>est en faveur</p>', 100), 'Un BNP > 100 pg/mL est en faveur');
  assert.equal(texteBrut('a'.repeat(50), 10).length, 10);
  assert.ok(texteBrut('a'.repeat(50), 10).endsWith('…'));
});

test('les questions sont regroupées par requête, avec identifiants et clés lisibles', () => {
  const qs = Array.from({ length: 20 }, (_, i) => question(i + 1));
  const requetes = construireRequetes(qs, 'claude-haiku-4-5', 'run-col');
  assert.equal(requetes.length, Math.ceil(20 / QUESTIONS_PAR_REQUETE));
  assert.equal(new Set(requetes.map((r) => r.custom_id)).size, requetes.length, 'custom_id uniques');
  const corps = requetes[0].params.messages[0].content;
  assert.match(corps, /### Question 1 \(00000000-0000-4000-8000-000000000001\)/);
  assert.match(corps, /A \[id=10000000-[0-9a-f-]+\] clé=VRAI — Proposition A/);
  assert.match(corps, /justification : \(vide\)/);
  assert.equal(requetes[0].params.output_config.format.type, 'json_schema');
  assert.equal(requetes[0].params.model, 'claude-haiku-4-5');
});

test('une question sans proposition est ignorée', () => {
  const q = question(1); q.items = [];
  assert.equal(construireRequetes([q], 'm', 'p').length, 0);
});

test('le découpage en batches respecte la taille', () => {
  const lots = decouperEnBatches(Array.from({ length: 4_500 }, (_, i) => i), 2_000);
  assert.deepEqual(lots.map((l) => l.length), [2000, 2000, 500]);
});

test('lireConstats garde les constats valides, dédoublonne et rejette le reste', () => {
  const id = '5fe4ec75-266a-4e75-9e8f-40a494907695';
  const texte = JSON.stringify({ constats: [
    { item_id: id.toUpperCase(), polarite_justification: 'vrai', gravite: 'incoherent', motif: 'Un BNP > 100 pg/mL est en faveur…' },
    { item_id: id, polarite_justification: 'vrai', gravite: 'incoherent', motif: 'doublon' },
    { item_id: 'pas-un-uuid', polarite_justification: 'vrai', gravite: 'incoherent', motif: '' },
    { item_id: '6bf86db4-f12e-437a-90c5-ce138440d005', polarite_justification: 'peut-être', gravite: 'incoherent', motif: '' },
    { item_id: '77b893c4-2d49-4eff-9ece-5c6835e0dcbc', polarite_justification: 'faux', gravite: 'douteux', motif: 'x' },
  ] });
  const constats = lireConstats(texte);
  assert.deepEqual(constats.map((c) => [c.item_id, c.gravite]), [[id, 'incoherent'], ['77b893c4-2d49-4eff-9ece-5c6835e0dcbc', 'douteux']]);
  assert.deepEqual(lireConstats('pas du json'), []);
  assert.deepEqual(lireConstats('{"constats": []}'), []);
});

test('le schéma des constats respecte les règles de forme des sorties structurées', () => {
  type Noeud = { type?: unknown; properties?: Record<string, Noeud>; required?: string[]; additionalProperties?: unknown; items?: Noeud };
  const anomalies = (n: Noeud, chemin = '$'): string[] => {
    const out: string[] = [];
    if (n.type === 'object' || n.properties) {
      if (n.additionalProperties !== false) out.push(`${chemin} : additionalProperties`);
      for (const k of Object.keys(n.properties ?? {})) if (!(n.required ?? []).includes(k)) out.push(`${chemin}.${k} absent de required`);
      for (const [k, v] of Object.entries(n.properties ?? {})) out.push(...anomalies(v, `${chemin}.${k}`));
    }
    if (n.items) out.push(...anomalies(n.items, `${chemin}[]`));
    return out;
  };
  assert.deepEqual(anomalies(constatsSchema as unknown as Noeud), []);
});

test('l’estimation est proportionnelle au volume et reste dans l’ordre de grandeur attendu', () => {
  // Plateforme entière au 06/09/2026 : 122 870 questions, 371 385 propositions.
  const plateforme = estimerCoutUsd(122_870, 371_385, 'claude-haiku-4-5');
  assert.ok(plateforme > 20 && plateforme < 80, `estimation plateforme hors plage : ${plateforme}`);
  const college = estimerCoutUsd(1_000, 5_000, 'claude-haiku-4-5');
  assert.ok(college < 1, `un collège moyen doit coûter moins d'un dollar : ${college}`);
  assert.ok(estimerCoutUsd(1_000, 5_000, 'claude-sonnet-5') > college);
  assert.equal(formaterQuestions([]).length, 0);
});
