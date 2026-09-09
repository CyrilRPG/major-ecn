import test from 'node:test';
import assert from 'node:assert/strict';
import {cleanStem,cleanExplanation,cleanAttribution,withoutAbsence} from '../scripts/banques/lib/nettoyage-editorial.mjs';
test('préserve le sens clinique de source et les valeurs',()=>{
 const value='La source infectieuse ne doit pas être négligée. La température est de 39,5 °C.';
 assert.equal(cleanExplanation(value),value);assert.equal(cleanAttribution(value),value);
});
test('préserve les illustrations intégrées et leur texte',()=>{
 const value='<p>La source infectieuse est localisée sur cette image : <img src="/radio.png" alt="Cliché à 3 mois"></p>';
 assert.equal(cleanExplanation(value),value);assert.equal(cleanAttribution(value),value);
});
test('retire une attribution générique sans perdre la négation ou les nombres',()=>{
 assert.equal(cleanExplanation('Selon le cours, la valeur ne dépasse pas 3 mm.'),'La valeur ne dépasse pas 3 mm.');
});
test('ne remplace pas une absence de corrigé par un texte vide',()=>{
 assert.equal(withoutAbsence('La source ne mentionne pas cette indication.'),null);
});
test('conserve une consigne standard complète',()=>{
 const value='Concernant la prise en charge de ce patient de 45 ans, quelles propositions sont exactes ?';
 assert.equal(cleanStem(value),value);
});
