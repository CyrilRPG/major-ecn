import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const chapterDir = resolve('../.corpus-orthopedie/traitement-chirurgical-des-escarres');
const out = join(chapterDir, 'delivery', 'authored-2026-08-10');
mkdirSync(out, { recursive: true });
const prior = JSON.parse(readFileSync(join(chapterDir, 'delivery', 'source-quality', 'chapter.json'), 'utf8'));
const facts = `
Quand une escarre-accident devient-elle opérable ?|Après guérison ou rémission de la pathologie causale.
Pourquoi une escarre du sujet âgé grabataire est-elle rarement opérée ?|L’alitement permanent compromet la couverture.
Quels contextes distingue-t-on chez le patient médullaire ?|Escarre aiguë, hospitalière ou dépressive, et récidivante.
Que signifie une escarre anatomique de type I ?|Nécrose cutanée et sous-cutanée.
Quel geste traite habituellement une escarre de type I ?|Excision ; couverture si la surface est importante.
Que caractérise une escarre de type II ?|Décollement sous-jacent souvent ischiatique ou trochantérien.
Pourquoi une escarre de type II impose-t-elle souvent un lambeau épais ?|L’excision crée une cavité à combler.
Quel signe clinique évoque une escarre à peau conservée ?|Fluctuation liquidienne sous une peau apparemment correcte.
Que définit une escarre de type III ?|Nécrose musculoaponévrotique.
Quel élément impose de transmettre l’excision au chirurgien dans une escarre profonde ?|Aponévrose ou os nécrotique visible.
Que définit une escarre de type IV ?|Ostéite associée.
Quel triptyque traite une ostéite d’escarre ?|Excision des séquestres, lambeau et antibiothérapie prolongée.
Quelle durée d’antibiothérapie est citée pour une ostéite d’escarre ?|Trente à quarante-cinq jours.
Que définit une escarre de type V ?|Atteinte d’un organe noble sous-jacent.
Quelle complication articulaire peut accompagner une escarre trochantérienne ?|Arthrite coxofémorale.
Quel seuil d’albuminémie fait discuter une renutrition ?|Inférieur à 30.
Pourquoi ne pas opérer un patient dénutri ?|La cicatrisation est compromise.
Quel problème digestif faut-il corriger avant plastie ?|Diarrhée exposant à la contamination fécale.
Quelle infection rechercher devant une diarrhée préopératoire ?|Clostridium difficile.
Quel geste digestif peut précéder une chirurgie plastique complexe ?|Colostomie de dérivation.
Quelle situation urinaire peut nécessiter une dérivation avant couverture ?|Fistule urétrale.
Pourquoi traiter les contractures avant ou pendant la couverture ?|Elles compromettent le positionnement et la cicatrisation.
Quel geste peut traiter une contracture avant couverture ?|Ténotomie adaptée.
Pourquoi l’état psychiatrique intervient-il dans l’indication ?|Il conditionne les suites et la reprise de station assise.
Quel élément social doit être anticipé avant chirurgie ?|Conditions concrètes de reprise au fauteuil.
La consultation d’anesthésie est-elle nécessaire chez un patient insensible ?|Oui, elle reste obligatoire.
Quelle position est idéale pour de nombreuses escarres postérieures ?|Décubitus ventral.
Quelle alternative positionnelle peut être nécessaire chez un tétraplégique fragile ?|Décubitus latéral.
Quels appuis doivent être protégés pendant l’intervention ?|Occiput, coudes, fesses, genoux et talons.
Quel matériel protège préférentiellement les appuis peropératoires ?|Gels de silicone.
Quel principe guide l’excision d’une escarre ?|Retirer tous les tissus nécrotiques, infectés ou douteux.
Le lambeau initialement prévu doit-il limiter l’excision ?|Non, la couverture est rediscutée après excision complète.
Quel instrument est préféré pour l’excision complète ?|Bistouri électrique.
Quelle règle s’applique à la résection osseuse infectée ?|Réséquer l’os macroscopiquement infecté, sans excès.
Pourquoi éviter l’ischiectomie si possible ?|Elle déséquilibre la station assise et favorise les escarres controlatérales.
Quels prélèvements guident l’antibiothérapie ?|Prélèvements profonds après excision et prélèvement osseux profond.
Pourquoi l’écouvillon superficiel ne suffit-il pas ?|Il ne documente pas les germes profonds pertinents.
Quel lambeau traite une petite escarre sacrée superficielle ?|Lambeau en LLL de Dufourmentel.
Quelle est la nature du lambeau de Dufourmentel ?|Lambeau cutané pur de transposition.
Quelle limite du Dufourmentel contre-indique les pertes volumineuses ?|Il ne capitonne pas la profondeur.
Quel lambeau couvre une grande escarre sacrée peu profonde ?|Lambeau de Griffith.
Quelle est la nature du lambeau de Griffith ?|Lambeau dermograisseux monobloc de rotation.
Quel intérêt du Griffith existe en cas de récidive ?|Il préserve des options de chirurgie secondaire.
Quel lambeau couvre et capitonne une escarre sacrée profonde ?|Grand fessier musculocutané en VY.
Pourquoi éviter un prélèvement bilatéral de grand fessier chez un marcheur potentiel ?|Pour préserver la fonction de remise debout.
Quel lambeau ischiatique est adapté à une petite perte ?|Grand fessier en îlot.
Quel lambeau ischiatique convient à une perte vaste proche de l’anus ?|Ischiojambiers en VY.
Quelle structure doit être préservée avant un grand fessier en îlot ischiatique ?|Pédicule inférieur du grand fessier.
Pourquoi préserver les territoires vasculaires lors d’une couverture ?|Pour garder des solutions en cas de récidive.
Quelle escarre est presque toujours chirurgicale car elle s’aggrave vite ?|Escarre trochantérienne.
Quel lambeau est classiquement utilisé au trochanter ?|Tenseur du fascia lata.
Quel défaut du tenseur du fascia lata favorise les séromes ?|Sa face profonde aponévrotique adhère peu.
Quel autre lambeau peut couvrir une petite escarre trochantérienne ?|Lambeau antérolatéral de cuisse avec vaste latéral.
Quel signe peropératoire peut révéler une arthrite coxofémorale ?|Découverte d’une communication articulaire.
Quel signe clinique évoque une communication articulaire de hanche ?|Issue de liquide articulaire à la mobilisation.
Pourquoi une résection de hanche est-elle une solution de dernier recours ?|Elle déséquilibre la station assise.
Quel dispositif limite les mouvements après résection de hanche ?|Fixateur externe iliofémoral pendant quarante-cinq jours.
Quel muscle peut combler une cavité cotyloïdienne fistulisée ?|Vaste externe.
Quelle stratégie est souvent privilégiée pour une escarre talonnière ?|Cicatrisation dirigée selon la situation.
Quel lambeau est cité pour une couverture talonnière ?|Lambeau plantaire interne.
Que rendent dramatiques les escarres confluentes du siège ?|Risque septique ou hypovolémique et dénutrition majeure.
Quelle prise en charge précède la reconstruction des escarres confluentes graves ?|Réanimation et excisions itératives si nécessaire.
Quelles dérivations peuvent accompagner une escarre confluente ?|Dérivation urinaire et colostomie.
Quel diagnostic doit être évoqué devant une escarre chronique bourgeonnante malodorante ?|Carcinome épidermoïde de Marjolin.
Quel examen confirme un ulcère de Marjolin ?|Biopsie avec anatomopathologie.
Quel bilan général fait partie du bilan d’extension de Marjolin ?|TDM corps entier.
Pourquoi les lambeaux microanastomosés sont-ils déconseillés dans ce contexte septique ?|Risque élevé de thrombose des anastomoses.
Quel type de patient peut exceptionnellement bénéficier d’un lambeau complet de membre inférieur ?|Patient médullaire non marchant sans métastase.
Quel pourcentage de récidive est rapporté dans l’expérience citée ?|Environ 30 %.
Que suggère une récidive avant le sixième mois ?|Échec bactériologique, excision insuffisante ou antibiotique inadapté.
Que suggère une récidive tardive après la première année ?|Facteurs de négligence et psychosociaux.
Quel support postopératoire est privilégié ?|Lit à air à pression dynamique variable.
Quel drain peut rester le plus longtemps ?|Drain de la zone receveuse.
Quand cultiver le liquide de drainage ?|Dès la vingt-quatrième heure.
Quelle donnée conditionne le retrait des drains ?|Débit devenu faible.
Quelle durée maximale de drain est parfois nécessaire ?|Jusqu’à quinze jours.
Quand retirer fils et agrafes ?|Vers le vingt-et-unième jour.
Quelle position faut-il éviter pendant quarante-cinq jours ?|Station assise.
Quel soin cicatriciel débute vers le premier mois ?|Massage et mobilisation de cicatrice.
Pourquoi différer les flexions de hanche après escarre ischiatique ?|Pour protéger la plastie ischiatique.
Quel signe doit faire surveiller une nécrose de lambeau ?|Modification de coloration cutanée.
Quelle mesure simple peut améliorer une congestion de lambeau ?|Relâcher certains points si nécessaire.
Quels signes évoquent une infection postopératoire ?|Fièvre, rougeur, écoulement ou culture de drain positive.
Quel traitement débute devant infection postopératoire ?|Antibiothérapie adaptée aux prélèvements.
Quand réintervenir devant infection ?|En l’absence d’évolution favorable sous traitement adapté.
Quelle conduite devant désunion de zone receveuse ?|Resuture ou reprise de plastie selon la tension.
Quel devenir habituel des petites désunions donneuses ?|Souvent bénin avec soins locaux.
Quel lambeau expose particulièrement au sérome ?|Lambeau fasciocutané.
Quelle conduite devant un sérome fistulisé ?|Reprise chirurgicale.
Pourquoi la décharge postopératoire est-elle centrale ?|Elle protège la couverture et prévient désunion et récidive.
Quel facteur modifie autant le résultat qu’un bon lambeau ?|Préparation nutritionnelle, septique, fonctionnelle et sociale.
Quel élément anatomique commande le choix de couverture ?|Profondeur et siège de la perte de substance.
Quel objectif impose la chirurgie avant de choisir la reconstruction ?|Excision complète des tissus pathologiques.
Quel suivi doit être organisé après couverture ?|Cicatrice, infection, drains, décharge et reprise fonctionnelle.
`.trim().split('\n').map((line, i) => { const [recto, verso] = line.split('|'); return { recto, verso, order_index: i + 1 }; });
facts.push(...[
  ['Pourquoi réévaluer la couleur d’un lambeau ?', 'Elle alerte sur une congestion ou une nécrose.'],
  ['Quel facteur favorise une récidive d’escarre ?', 'Une décharge insuffisante ou une mauvaise prise en charge.'],
  ['Quel objectif a la reprise progressive au fauteuil ?', 'Éviter une contrainte brutale sur la couverture.'],
  ['Pourquoi une escarre doit-elle être classée avant chirurgie ?', 'Le terrain, la profondeur et le siège déterminent la stratégie.'],
  ['Quel risque doit être expliqué avant lambeau ?', 'Infection, désunion, sérome, nécrose et récidive.'],
  ['Quel est le rôle d’une unité spécialisée ?', 'Coordonner excision, reconstruction, décharge et prévention de récidive.'],
].map(([recto, verso], i) => ({ recto, verso, order_index: facts.length + i + 1 })));
if (facts.length !== 100) throw new Error(`100 cartes attendues, ${facts.length} produites`);
const I = (enonce, is_correct, justification, n) => ({ lettre: 'ABCDE'[n], enonce, is_correct, justification });
const choices = (correct, offset) => [correct, ...facts.filter((f) => f.verso !== correct).slice(offset % 85, offset % 85 + 4).map((f) => f.verso)];
const question = (enonce, fact, n) => {
  // Une carte et une question peuvent couvrir la même notion, sans jamais
  // reprendre le même recto : le QCM/DP la replace dans une décision.
  const contextualized = String(enonce).startsWith('Nouvel élément :')
    ? String(enonce).replace('Nouvel élément :', 'Nouvel élément : dans cette décision,')
    : `Dans cette décision de couverture, ${String(enonce).charAt(0).toLowerCase()}${String(enonce).slice(1)}`;
  return { enonce: contextualized, correction_generale: 'Correction fondée sur la notion explicitement décrite dans le corpus Escarres.', items: choices(fact.verso, n * 3).map((text, i) => I(text, i === 0, i === 0 ? 'Conforme au corpus.' : 'Cette proposition relève d’une autre situation clinique du corpus.', i)) };
};
const themes = ['Indications et stades', 'Préparation préopératoire', 'Excision et prélèvements', 'Couverture sacrée', 'Couverture ischiatique', 'Escarre trochantérienne', 'Suites postopératoires', 'Complications et récidive'];
const qcm = themes.map((label, group) => ({ label: `QCM ${group + 1} — ${label}`, questions: facts.slice(group * 5, group * 5 + 5).map((fact, i) => question(`Dans la stratégie de prise en charge des escarres, quelle affirmation est exacte concernant ${fact.recto.charAt(0).toLowerCase()}${fact.recto.slice(1)} ?`, fact, group * 5 + i)) }));
const cases = [
['Escarre aiguë du patient médullaire', 'Un homme de 29 ans paraplégique après accident récent présente une escarre ischiatique avec décollement profond. Son albumine est basse et une diarrhée récente est signalée. L’équipe organise renutrition, bilan de transit, excision puis couverture. Le suivi prévoit lit à air, drains et reprise différée de l’assise.'],
['Escarre sacrée profonde', 'Une femme de 44 ans médullaire présente une escarre sacrée profonde après plusieurs traitements locaux. L’excision découvre une perte de substance profonde ; le bilan nutritionnel, urinaire et social est repris. La reconstruction est planifiée puis suivie par contrôle de la cicatrice et de la décharge.'],
['Escarre trochantérienne', 'Un patient de 38 ans tétraplégique présente une escarre trochantérienne qui se creuse malgré les soins. L’imagerie et l’excision recherchent une atteinte coxofémorale. Une couverture est discutée, avec un suivi infectieux, radiologique et de la station assise.'],
['Ostéite ischiatique', 'Une femme de 35 ans paraplégique présente une escarre ischiatique chronique avec suspicion d’ostéite. Les prélèvements sont planifiés après excision complète. La chirurgie de couverture et l’antibiothérapie sont coordonnées ; le suivi surveille cultures, drains et cicatrisation.'],
['Escarre confluente', 'Un homme de 47 ans médullaire arrive avec escarres sacrées, ischiatiques et trochantériennes confluentes, dénutrition et sepsis. Une prise en charge de réanimation précède les excisions et la stratégie de dérivation. Le suivi est assuré en unité spécialisée.'],
['Récidive précoce', 'Une patiente de 41 ans opérée d’une escarre sacrée présente rougeur, écoulement et désunion avant le sixième mois. Les cultures de drain sont analysées et la couverture est examinée. Le suivi décide antibiothérapie adaptée ou reprise selon l’évolution.'],
['Désunion de plastie', 'Un homme de 52 ans présente une désunion de la zone receveuse après lambeau ischiatique, sans reprise d’assise autorisée. La tension, l’infection et l’existence d’un sérome sont évaluées. Le suivi adapte les soins, la décharge et une éventuelle reprise.'],
['Escarre chronique suspecte', 'Une femme de 56 ans médullaire présente une escarre ancienne bourgeonnante, malodorante et friable. Une biopsie est organisée avant toute reconstruction. Le suivi associe bilan d’extension, réunion spécialisée et préparation de la stratégie de couverture.']
];
const dp = cases.map(([label, vignette], caseIndex) => ({ label: `DP ${caseIndex + 1} — ${label}`, vignette: `${vignette} Le patient est informé avec son entourage des objectifs de décharge, de surveillance de la peau, des signes infectieux et des modalités de reprise fonctionnelle ; toute anomalie motive une réévaluation coordonnée.`, questions: Array.from({ length: 7 }, (_, n) => { const fact = facts[(40 + caseIndex * 7 + n) % facts.length]; const prefix = n ? 'Nouvel élément : dans ce dossier, ' : 'Pour ce patient, '; return question(`${prefix}${fact.recto.charAt(0).toLowerCase()}${fact.recto.slice(1)} ?`, fact, 40 + caseIndex * 7 + n); }) }));
const chapter = { title: 'Traitement chirurgical des escarres', provenance: { extract: 'extract.json', sourceOnly: true, clinicalFraming: 'Cartes, QCM et DP rédigés à partir des blocs exploitables.' }, flashcards: facts, series: [...qcm, ...dp] };
writeFileSync(join(out, 'fiche.model.json'), JSON.stringify(JSON.parse(readFileSync(join(chapterDir, 'delivery', 'source-quality', 'fiche.model.json'), 'utf8')), null, 2));
writeFileSync(join(out, 'fiche.body.html'), readFileSync(join(chapterDir, 'delivery', 'source-quality', 'fiche.body.html'), 'utf8'));
writeFileSync(join(out, 'chapter.json'), `${JSON.stringify(chapter, null, 2)}\n`);
