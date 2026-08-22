import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeFlashcardHtml, sanitizeBlockHtml } from '../src/lib/flashcards/rich-text';

/* ── Régression : le « < » de comparaison est du TEXTE ─────────────────────
   Le tokenizer lisait `<[^>]+>` : un « < » de comparaison ouvrait une
   pseudo-balise qui courait jusqu'au « > » suivant — celui de la balise <b>
   d'après. Le nom lu (« PaO », « MMSE ») n'étant pas dans la liste blanche,
   tout le fragment était supprimé. Les critères chiffrés des corrections
   d'annales disparaissaient de l'écran, en laissant une balise orpheline. */

test('un « < » de comparaison est conservé et échappé', () => {
  const html = sanitizeFlashcardHtml(
    '– <b>Modéré</b> : 100 mmHg < PaO₂/FiO₂ ≤ 200 mmHg\n– <b>Sévère</b> : ≤ 100 mmHg',
  );
  assert.match(html, /100 mmHg &lt; PaO₂\/FiO₂ ≤ 200 mmHg/);
  assert.match(html, /<b>Sévère<\/b>/);
  // La balise ouvrante d'après n'a pas été avalée : autant d'ouvertures que de fermetures.
  assert.equal((html.match(/<b>/g) ?? []).length, (html.match(/<\/b>/g) ?? []).length);
});

test('un encadrement « a < X < b » survit à l’intérieur d’une balise', () => {
  const html = sanitizeFlashcardHtml('• <b>Stade modéré, 10 < MMSE < 20</b> : l’un ou l’autre');
  assert.equal(html, '• <b>Stade modéré, 10 &lt; MMSE &lt; 20</b> : l’un ou l’autre');
});

test('les blocs (vignettes) échappent aussi les comparaisons', () => {
  assert.equal(sanitizeBlockHtml('Ligne 1\nPaO₂ < 60 mmHg'), 'Ligne 1<br>PaO₂ &lt; 60 mmHg');
});

/* ── La liste blanche reste stricte ────────────────────────────────────── */

test('les balises de mise en forme autorisées sont conservées', () => {
  assert.equal(
    sanitizeFlashcardHtml('<b>gras</b> <i>ital</i> <sub>2</sub> <sup>3</sup><br>'),
    '<b>gras</b> <i>ital</i> <sub>2</sub> <sup>3</sup><br>',
  );
  assert.equal(
    sanitizeFlashcardHtml('<span style="color:#B45309">ambre</span>'),
    '<span style="color:#B45309">ambre</span>',
  );
  assert.equal(
    sanitizeFlashcardHtml('<img src="https://exemple.fr/ecg.png" alt="ECG">'),
    '<img src="https://exemple.fr/ecg.png" alt="ECG" />',
  );
});

test('aucune injection ne passe', () => {
  for (const [entree, interdit] of [
    ['avant <script>alert(1)</script> après', /<script/i],
    ['avant < script>alert(1)</script> après', /<script/i],
    ['<img src=x onerror=alert(1)>', /onerror/i],
    ['<iframe src="javascript:alert(1)"></iframe>', /iframe|javascript:/i],
    ['<b onmouseover=alert(1)>x</b>', /onmouseover/i],
    ['<a href="javascript:alert(1)">lien</a>', /href|javascript:/i],
    ['<img src="javascript:alert(1)">', /javascript:/i],
    ['<span style="background:url(javascript:alert(1))">x</span>', /javascript:|background/i],
  ] as [string, RegExp][]) {
    assert.doesNotMatch(sanitizeFlashcardHtml(entree), interdit, 'entrée : ' + entree);
  }
});

test('le texte des balises interdites est conservé', () => {
  assert.equal(sanitizeFlashcardHtml('texte <div class="x">bloc</div> fin'), 'texte bloc fin');
});
