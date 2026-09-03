/** Source-only replacement bank for course 112. */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const slug = 'traitement-chirurgical-des-tumeurs-malignes-primitives-du-rachis-et-du-sacrum';
const title = 'Traitement chirurgical des tumeurs malignes primitives du rachis et du sacrum';
const dir = resolve('../.corpus-orthopedie', slug);
const out = resolve(process.argv[2] || join(dir, 'delivery', 'reconstruction-source-only-bank'));
const fact = (recto, verso, source) => ({ recto, verso, source: [source] });

// Every card is a short, source-derived assertion. It deliberately covers a
// different reading task from the QCM and never serves as a QCM stem.
const flashcards = [
  fact('Quel caractère douloureux doit faire évoquer une tumeur du rachis ?', 'Une douleur prolongée, non mécanique et résistante au traitement médical.', 15),
  fact('Quels symptômes peuvent révéler une lésion lombosacrée ?', 'Des troubles sphinctériens progressifs, avec ou sans signe neurologique.', 15),
  fact('Pourquoi le diagnostic est-il souvent tardif ?', 'Les signes initiaux sont peu spécifiques et la tumeur peut rester longtemps silencieuse.', 15),
  fact('Quel examen confirme le diagnostic tumoral ?', 'L’examen histologique.', 15),
  fact('Qui élabore la stratégie thérapeutique ?', 'Une équipe multidisciplinaire spécialisée.', 15),
  fact('Quel moment de la prise en charge conditionne le contrôle local ?', 'La première exérèse carcinologique.', 15),
  fact('Quels examens composent l’imagerie initiale ?', 'Radiographies, TDM et IRM.', 16),
  fact('Quel est le rôle diagnostique de l’IRM ?', 'Elle caractérise la lésion et son extension locorégionale.', 18),
  fact('Quel territoire l’IRM doit-elle explorer avant chirurgie ?', 'L’ensemble du rachis avec injection.', 18),
  fact('Que recherche l’IRM dans le canal spinal ?', 'L’envahissement canalaire et une compression nerveuse.', 18),
  fact('Que montre l’IRM dans les parties molles ?', 'L’extension péritumorale et les rapports avec les structures voisines.', 18),
  fact('Quelle limite de l’IRM concerne l’os ?', 'Elle évalue moins bien le contenu osseux que la TDM.', 18),
  fact('Que précise la TDM sur la lésion vertébrale ?', 'Les composantes lytiques, condensantes, calcifications et ossifications.', 20),
  fact('Pourquoi la TDM est-elle utile avant fixation ?', 'Elle apprécie le capital osseux disponible.', 20),
  fact('Quel bilan complète la confirmation de malignité ?', 'Un bilan thoraco-abdomino-pelvien injecté, complété selon le cas.', 20),
  fact('Quelle imagerie peut compléter le bilan d’extension ?', 'Une tomographie par émission de positons selon la situation.', 20),
  fact('Quel élément IRM peut traduire une réponse néoadjuvante ?', 'La diminution de l’œdème, des parties molles et la condensation de la masse.', 18),
  fact('Pourquoi une preuve histologique est-elle nécessaire ?', 'Elle guide un traitement souvent agressif et évite une stratégie inadaptée.', 24),
  fact('Quelle biopsie privilégier au rachis ?', 'La ponction radioguidée, sauf urgence neurologique ou échec.', 31),
  fact('Qui doit planifier une biopsie chirurgicale ?', 'L’équipe susceptible de réaliser la résection tumorale.', 31),
  fact('Où doit se faire une biopsie de tumeur primitive ?', 'Dans un centre de référence.', 34),
  fact('Quelle propriété doit avoir le trajet de biopsie ?', 'Il doit pouvoir être retiré avec la tumeur.', 34),
  fact('Quelle zone tumorale est la plus informative ?', 'La jonction entre la tumeur et l’os.', 34),
  fact('Pourquoi éviter le centre tumoral ?', 'Il peut être nécrosé et non contributif.', 34),
  fact('Quelle zone biopsier en cas de composante condensée ?', 'La partie la plus condensée.', 34),
  fact('Quel canal ne faut-il pas traverser s’il est indemne ?', 'Le canal spinal.', 34),
  fact('Quels prélèvements doivent accompagner l’histologie ?', 'Des prélèvements bactériologiques.', 34),
  fact('Quel document accompagne les fragments biopsiques ?', 'Un résumé clinico-radiologique avec les diagnostics envisagés.', 34),
  fact('Pourquoi le trajet de biopsie est-il carcinologique ?', 'Un mauvais trajet peut contaminer les tissus et empêcher une résection correcte.', 34),
  fact('Quelles tumeurs malignes primitives sont citées au rachis ?', 'Chordome, chondrosarcome, ostéosarcome et sarcome d’Ewing.', 44),
  fact('Quelle particularité topographique caractérise le chordome ?', 'C’est une tumeur exclusivement axiale.', 44),
  fact('Quelle localisation du chordome est fréquente ?', 'Le sacrum.', 44),
  fact('Quelle cinétique caractérise souvent le chordome ?', 'Une évolution lente avec diagnostic parfois tardif.', 44),
  fact('Quel objectif carcinologique est recherché lorsque possible ?', 'Une exérèse en bloc avec marges saines.', 58),
  fact('Pourquoi éviter l’ouverture tumorale ?', 'Elle compromet le contrôle local par dissémination du champ opératoire.', 58),
  fact('Qu’intègre la planification d’une résection ?', 'Extension osseuse, parties molles, canal, racines, vaisseaux et articulations.', 58),
  fact('Qui participe à la décision d’exérèse ?', 'Chirurgien spécialisé, oncologue, radiologue et anatomopathologiste au minimum.', 58),
  fact('Quel traitement peut précéder la chirurgie d’un sarcome de haut grade ?', 'Un traitement néoadjuvant adapté à l’histologie.', 58),
  fact('Quand discuter une stratégie non chirurgicale ?', 'Lorsque des marges fiables sont inaccessibles ou que le bénéfice-risque est défavorable.', 58),
  fact('Que détermine l’extension à l’arc postérieur ?', 'Le type de résection vertébrale nécessaire.', 68),
  fact('Quel contrôle sécurise les coupes osseuses ?', 'Un contrôle antérieur et postérieur des structures à risque.', 68),
  fact('Pourquoi éviter une dissection digitale aveugle au thorax ?', 'Elle expose les vaisseaux et les organes antérieurs sans contrôle fiable.', 93),
  fact('Quel apport peut avoir la thoracoscopie ?', 'Libérer les structures antérieures et contrôler visuellement les coupes.', 93),
  fact('Quel abord peut être utile à la charnière dorsolombaire ?', 'Une thoraco-phréno-laparotomie selon l’extension.', 106),
  fact('Pourquoi deux voies sont-elles souvent nécessaires au rachis lombaire ?', 'Pour libérer l’avant, instrumenter le rachis et réaliser l’ostéotomie en sécurité.', 117),
  fact('Quel temps peut précéder l’ostéotomie ?', 'L’instrumentation postérieure.', 117),
  fact('Quel élément stabilise le rachis pendant l’exérèse ?', 'L’ostéosynthèse postérieure.', 117),
  fact('Quelle reconstruction peut remplacer un corps vertébral réséqué ?', 'Une cage ou une allogreffe.', 93),
  fact('Quand une arthrodèse circonférentielle est-elle discutée ?', 'Dans les résections lombaires étendues nécessitant une stabilité renforcée.', 117),
  fact('Que désigne une hémivertébrectomie ?', 'La résection d’une partie de vertèbre selon l’envahissement latéralisé.', 82),
  fact('Que désigne une vertébrectomie ?', 'La résection d’un corps vertébral et des structures associées selon le plan.', 93),
  fact('Pourquoi les voies peuvent-elles être combinées au cervical ?', 'Pour contrôler les structures antérieures et postérieures avant l’exérèse.', 82),
  fact('Quelles structures antérieures sont à protéger au cervical ?', 'Vaisseaux, trachée, œsophage et tissus mous voisins.', 82),
  fact('Pourquoi réaliser les temps coordonnés dans une même séance ?', 'Pour éviter une difficulté d’extraction ou un saignement secondaire selon la situation.', 93),
  fact('Quelle lésion sacrée peut parfois relever d’un abord postérieur seul ?', 'Une lésion coccygienne sélectionnée.', 174),
  fact('Quand un double abord est-il indiqué au sacrum ?', 'Pour une localisation proximale dépassant le niveau S3.', 174),
  fact('Quel est le premier temps d’une sacrectomie proximale ?', 'Une libération antérieure par laparotomie ou laparoscopie.', 174),
  fact('Pourquoi dévasculariser la tumeur sacrée avant le temps postérieur ?', 'Pour faciliter l’exérèse et limiter la morbidité peropératoire.', 174),
  fact('Quel lambeau peut participer à la couverture sacrée ?', 'Un lambeau d’épiploon interposé dans le bassin.', 174),
  fact('Quel abord postérieur peut être utilisé au sacrum ?', 'Une incision médiane élargie ou arciforme de type Kraske.', 174),
  fact('Pourquoi ligaturer le sac dural au sacrum ?', 'Le canal est fréquemment envahi et l’exérèse en bloc peut l’exiger.', 174),
  fact('De quoi dépend le niveau de coupe sacrée ?', 'De l’extension tumorale.', 174),
  fact('Quel risque suit le sacrifice de racines sacrées ?', 'Un syndrome de la queue de cheval avec troubles vésicosphinctériens.', 174),
  fact('Quand une reconstruction osseuse sacrée est-elle évitable ?', 'Quand S1 et la partie attenante des articulations sacro-iliaques sont conservées.', 193),
  fact('Quand une arthrodèse lombo-iliaque devient-elle nécessaire ?', 'Après sacrectomie totale ou sacrifice important de l’articulation sacro-iliaque.', 193),
  fact('Quelle complication est fréquente après chirurgie sacrée ?', 'L’infection postopératoire.', 193),
  fact('Pourquoi la couverture des tissus mous est-elle anticipée ?', 'Pour réduire la morbidité d’un vaste défect postérieur.', 174),
  fact('Quel signe rend une compression médullaire préoccupante ?', 'Elle suggère un envahissement du canal et complique une résection carcinologique.', 195),
  fact('Que faut-il obtenir si possible devant compression médullaire ?', 'Une biopsie rapide avant une chirurgie extensive.', 195),
  fact('Pourquoi ne pas décomprimer largement sans diagnostic ?', 'Cela peut disséminer la tumeur et compromettre une chirurgie ultérieure.', 195),
  fact('Quel geste peut soulager une urgence neurologique sans diagnostic ?', 'Une laminectomie de décompression limitée si elle est indispensable.', 195),
  fact('Où placer les implants en cas de fixation urgente ?', 'À distance de la tumeur et des vertèbres adjacentes.', 195),
  fact('Que faut-il mettre en balance devant urgence neurologique ?', 'L’urgence neurologique et le pronostic vital carcinologique.', 195),
  fact('Pourquoi une nouvelle histologie peut-elle être nécessaire en rechute ?', 'Pour confirmer la récidive et exclure une autre lésion, notamment radio-induite.', 195),
  fact('Quel piège d’imagerie existe après chirurgie ?', 'Confondre remaniements cicatriciels et récidive tumorale.', 195),
  fact('Pourquoi les reprises carcinologiques sont-elles délicates ?', 'La contamination initiale élargit le champ et réduit les chances de guérison.', 195),
  fact('Quelles complications doivent être expliquées avant chirurgie ?', 'Complications infectieuses, mécaniques et neurologiques.', 195),
  fact('Pourquoi l’expérience de l’équipe est-elle déterminante ?', 'La chirurgie est rare, complexe et ses erreurs sont difficilement rattrapables.', 195),
  fact('Quelle donnée oriente la résection après néoadjuvant ?', 'La réponse tumorale évaluée cliniquement et par imagerie.', 18),
  fact('Que recherche une IRM injectée du rachis entier ?', 'Des lésions vertébrales synchrones.', 18),
  fact('Quelle lésion radiologique typique peut ne pas être biopsiée ?', 'Un angiome vertébral d’aspect caractéristique.', 31),
  fact('Pourquoi le point d’entrée de biopsie peut-il être repéré ?', 'Pour pouvoir exciser ultérieurement le trajet.', 34),
  fact('Quelle voie est préférée pour une tumeur corporéale accessible en arrière ?', 'Une voie postérieure transpédiculaire.', 34),
  fact('Quelle voie est adaptée à une tumeur latérovertébrale ?', 'Une voie postérolatérale rétropleurale ou rétropéritonéale.', 34),
  fact('Quelle précaution concerne les cavités pleurale, péritonéale et rectale ?', 'Éviter de les traverser par le trajet de biopsie.', 34),
  fact('Quel examen du tissu complète la fixation des prélèvements ?', 'L’analyse anatomopathologique avec acheminement adapté.', 34),
  fact('Quelle information favorise l’interprétation anatomopathologique ?', 'Les hypothèses diagnostiques clinico-radiologiques.', 34),
  fact('Quel facteur peut rendre une chirurgie secondaire impossible ?', 'Une biopsie contaminante ou une chirurgie intralésionnelle initiale.', 15),
  fact('Que doit permettre la TDM au chirurgien ?', 'Planifier les appuis osseux et la fixation.', 20),
  fact('Quelle structure thoracique demande un contrôle antérieur ?', 'Les gros vaisseaux et l’œsophage.', 93),
  fact('Quel matériel peut reconstruire la colonne antérieure ?', 'Une cage ou une allogreffe selon la perte de substance.', 93),
  fact('Quelle conséquence mécanique prévient l’arthrodèse lombo-iliaque ?', 'Une bascule pelvienne avec mauvais résultat fonctionnel.', 193),
  fact('Quelle part de la stratégie est discutée avant le geste ?', 'Les marges, voies d’abord, gestes neurologiques et reconstruction.', 58),
  fact('Quelle approche réduit le risque d’errement thérapeutique ?', 'La prise en charge précoce par une équipe spécialisée.', 15),
  fact('Quel est le rôle du suivi après exérèse ?', 'Détecter récidive, complications et conséquences fonctionnelles.', 195),
  fact('Pourquoi réévaluer le dossier avant une reprise ?', 'Pour confirmer la lésion et réadapter la séquence thérapeutique.', 195),
  fact('Quel objectif doit guider une résection en bloc ?', 'Obtenir des marges saines sans disséminer les cellules tumorales.', 58),
  fact('Quelle condition rend une exérèse plus sûre ?', 'Une cartographie préopératoire fiable des rapports tumoraux.', 58),
  fact('Quel facteur influence la reconstruction après résection ?', 'Le niveau rachidien et l’étendue de la perte osseuse.', 117),
  fact('Quel élément doit être discuté avant une chirurgie sacrée proximale ?', 'Le retentissement fonctionnel du niveau de sacrifice des racines sacrées.', 174)
];

const q = (enonce, correct, ...wrong) => ({
  enonce,
  correction_generale: `<p>${correct}</p>`,
  items: [correct, ...wrong].map((text, index) => ({ lettre: 'ABCDE'[index], enonce: text, is_correct: index === 0, justification: index === 0 ? `<p>${correct}</p>` : '<p>Cette réponse ne respecte pas la stratégie décrite.</p>' }))
});
const wrong = ['Se contenter d’un cliché standard isolé.', 'Intervenir sans cartographie préopératoire.', 'Choisir un geste sans discussion spécialisée.', 'Reporter tout contrôle au postopératoire.'];
const specs = [
  q('Une douleur lombaire dure depuis plusieurs mois, réveille la patiente et ne cède pas aux antalgiques. Quelle hypothèse doit être explorée ?', 'Une tumeur rachidienne doit être évoquée.', ...wrong),
  q('Une lésion vertébrale suspecte est découverte. Quel examen analyse le mieux le canal et les parties molles ?', 'Une IRM injectée du rachis.', ...wrong),
  q('Avant de planifier une résection, pourquoi prescrire une TDM ?', 'Pour préciser l’atteinte osseuse et le capital destiné à la fixation.', ...wrong),
  q('Après confirmation de malignité, quel bilan complète la stadification ?', 'Un bilan thoraco-abdomino-pelvien injecté.', ...wrong),
  q('Une lésion présente plusieurs niveaux rachidiens possibles. Quelle exploration recherche des lésions synchrones ?', 'Une IRM injectée de l’ensemble du rachis.', ...wrong),
  q('Une biopsie est envisagée pour une tumeur vertébrale sans urgence. Quelle méthode est privilégiée ?', 'Une ponction radioguidée.', ...wrong),
  q('Le chirurgien prévoit une biopsie ouverte. Quelle caractéristique doit avoir son trajet ?', 'Le trajet doit pouvoir être retiré avec la tumeur.', ...wrong),
  q('La première carotte biopsique est nécrotique. Quelle zone doit être ciblée ensuite ?', 'La jonction active entre la tumeur et l’os.', ...wrong),
  q('Une tumeur corporéale est accessible par l’arrière. Quelle voie de biopsie est la plus cohérente ?', 'Une voie postérieure transpédiculaire.', ...wrong),
  q('Pourquoi associer une bactériologie à l’histologie ?', 'Pour ne pas méconnaître une cause infectieuse associée.', ...wrong),
  q('Le compte rendu d’imagerie évoque un chordome sacré. Quelle caractéristique est compatible ?', 'Il s’agit d’une tumeur exclusivement axiale à évolution souvent lente.', ...wrong),
  q('Quel objectif définit une chirurgie carcinologique lorsque la lésion est résécable ?', 'Une exérèse en bloc avec des marges saines.', ...wrong),
  q('Pourquoi une première chirurgie intralésionnelle est-elle préoccupante ?', 'Elle peut contaminer le champ opératoire et réduire le contrôle local.', ...wrong),
  q('Un sarcome de haut grade est confirmé. Quel élément peut modifier le projet opératoire ?', 'La réponse à un traitement néoadjuvant.', ...wrong),
  q('Une tumeur thoracique est au contact des gros vaisseaux. Quelle organisation sécurise les coupes ?', 'Associer un contrôle antérieur et postérieur des structures à risque.', ...wrong),
  q('Quelle est la contribution de la thoracoscopie dans certaines exérèses thoraciques ?', 'Elle permet de libérer et de contrôler visuellement les structures antérieures.', ...wrong),
  q('Une résection lombaire étendue est programmée. Pourquoi préparer deux voies d’abord ?', 'Pour libérer l’avant, instrumenter l’arrière et sécuriser l’ostéotomie.', ...wrong),
  q('Quel geste peut stabiliser le rachis avant une ostéotomie tumorale ?', 'Une instrumentation postérieure.', ...wrong),
  q('Après une vertébrectomie, quel moyen peut reconstruire la colonne antérieure ?', 'Une cage ou une allogreffe.', ...wrong),
  q('Quelle indication fait discuter une arthrodèse circonférentielle ?', 'Une résection lombaire étendue nécessitant une stabilité renforcée.', ...wrong),
  q('Une lésion sacrée dépasse S3. Quelle stratégie d’abord est habituellement nécessaire ?', 'Un double abord avec libération antérieure puis temps postérieur.', ...wrong),
  q('Quel est l’intérêt de la libération antérieure au sacrum ?', 'Dévasculariser et libérer la tumeur avant l’exérèse postérieure.', ...wrong),
  q('Quel risque doit être expliqué avant sacrifice de racines sacrées ?', 'Des troubles vésicosphinctériens et un syndrome de la queue de cheval.', ...wrong),
  q('Dans quelle situation peut-on éviter une reconstruction osseuse sacrée ?', 'Lorsque S1 et les articulations sacro-iliaques adjacentes sont conservées.', ...wrong),
  q('Quel geste stabilise le bassin après sacrifice important de l’articulation sacro-iliaque ?', 'Une arthrodèse lombo-iliaque.', ...wrong),
  q('Une compression médullaire révèle une lésion chez un sujet jeune sans cancer connu. Quelle étape reste prioritaire si l’état le permet ?', 'Obtenir rapidement une biopsie avant une chirurgie extensive.', ...wrong),
  q('Une décompression urgente est inévitable sans diagnostic. Quel geste limite la dissémination ?', 'Une laminectomie de décompression limitée.', ...wrong),
  q('Où placer les implants lors d’une fixation urgente ?', 'À distance de la tumeur et des vertèbres adjacentes.', ...wrong),
  q('Une image suspecte apparaît après traitement. Quelle précaution précède une nouvelle séquence agressive ?', 'Vérifier l’histologie et distinguer récidive, cicatrice ou autre lésion.', ...wrong),
  q('Quelle complication doit être anticipée après sacrectomie ?', 'L’infection et les problèmes de couverture des tissus mous.', ...wrong),
  q('Quel examen est le plus utile pour cartographier une compression nerveuse par la tumeur ?', 'L’IRM injectée.', ...wrong),
  q('Pourquoi transmettre les hypothèses diagnostiques au pathologiste ?', 'Pour orienter l’analyse des prélèvements.', ...wrong),
  q('Quelle conséquence peut avoir une biopsie traversant une cavité ?', 'Une contamination de tissus qui pourraient devoir être réséqués.', ...wrong),
  q('Quel élément dicte le niveau de coupe pendant une sacrectomie ?', 'L’extension tumorale.', ...wrong),
  q('Pourquoi la stabilité doit-elle être anticipée avant l’exérèse ?', 'La résection peut supprimer les appuis nécessaires au rachis.', ...wrong),
  q('Quel risque rend les reprises après contamination initiale difficiles ?', 'L’élargissement du champ tumoral à réséquer.', ...wrong),
  q('Quel suivi est attendu après une exérèse carcinologique ?', 'Un suivi oncologique, mécanique, neurologique et fonctionnel.', ...wrong),
  q('Quelle donnée clinique fait craindre une atteinte lombosacrée évolutive ?', 'L’apparition progressive de troubles sphinctériens.', ...wrong),
  q('Quel bénéfice apporte une discussion multidisciplinaire précoce ?', 'Coordonner histologie, oncologie, voies d’abord et reconstruction.', ...wrong),
  q('Pourquoi l’expérience du centre est-elle essentielle ?', 'Les erreurs initiales sont souvent difficilement rattrapables.', ...wrong)
];

const qcmLabels = ['Signal d’alerte et imagerie', 'Stadification', 'Biopsie', 'Indication carcinologique', 'Résection vertébrale', 'Reconstruction', 'Sacrum', 'Urgences et suivi'];
const qcm = qcmLabels.map((label, i) => ({ label: `QCM — ${label}`, kind: 'qcm', questions: specs.slice(i * 5, i * 5 + 5) }));
const caseData = [
  ['Une femme de 46 ans consulte pour lombalgies nocturnes et persistantes, sans cancer connu. L’IRM montre une lésion de L3 avec extension aux parties molles, sans déficit initial. Le dossier est adressé à une équipe de recours ; l’imagerie, la biopsie et les options d’exérèse sont coordonnées. Après la séquence retenue, le suivi évalue les plans neurologique, mécanique et oncologique.', [0, 1, 2, 5, 6, 7, 11]],
  ['Un homme de 31 ans présente une douleur thoracique axiale rebelle. L’IRM et la TDM montrent une tumeur de D8 au contact des structures antérieures. La biopsie conclut à un sarcome de haut grade et le dossier est discuté après traitement néoadjuvant. La chirurgie vise un contrôle local, puis un suivi régulier de la stabilité et de l’état neurologique.', [3, 4, 13, 14, 15, 17, 18]],
  ['Une patiente de 58 ans a une lésion cervicale basse pour laquelle les prélèvements radioguidés ne sont pas contributifs. L’équipe qui envisage la résection planifie le trajet de biopsie et les voies d’abord avec les spécialistes concernés. La patiente est informée des risques vasculaires, digestifs et neurologiques ; le suivi recherchera une récidive locale et les séquelles.', [5, 6, 8, 9, 12, 14, 38]],
  ['Un homme de 63 ans présente une tumeur lombaire latéralisée dont l’imagerie précise le capital osseux et les rapports vasculaires. L’indication d’une hémivertébrectomie est retenue après discussion multidisciplinaire. Une instrumentation postérieure et une reconstruction sont préparées ; le suivi contrôle la récupération fonctionnelle et l’alignement après l’intervention.', [2, 10, 11, 16, 17, 18, 19]],
  ['Une femme de 55 ans est suivie pour une tumeur sacrée dépassant S3, avec douleurs pelviennes et troubles urinaires débutants. Une exérèse en bloc est envisagée après évaluation de l’extension et de la biopsie. La séquence associe libération antérieure, temps postérieur et stratégie de couverture ; le suivi surveille les fonctions sphinctériennes et la cicatrisation.', [20, 21, 22, 23, 24, 29, 36]],
  ['Un homme de 24 ans développe rapidement une faiblesse des membres inférieurs sur tumeur rachidienne révélatrice. L’équipe obtient une imagerie complète et organise une biopsie urgente, tout en préparant une décompression limitée si l’aggravation neurologique l’impose. Après traitement, la surveillance porte sur la fonction neurologique, les implants et le contrôle tumoral.', [1, 3, 25, 26, 27, 30, 37]],
  ['Une patiente de 69 ans a été opérée ailleurs d’une lésion sacrée sans diagnostic histologique clair. Une masse douloureuse réapparaît dans la zone opérée. Le centre de recours reprend l’imagerie et les prélèvements avant toute proposition de reprise ; les risques de nouvelle chirurgie et les objectifs réalistes sont expliqués. Le suivi compare l’évolution douloureuse, la fonction sphinctérienne et les images de contrôle.', [4, 12, 28, 32, 35, 36, 39]],
  ['Un homme de 52 ans traité pour une lésion thoracolombaire revient après chirurgie avec douleur croissante et image locale difficile à interpréter. La réunion spécialisée compare les examens, vérifie l’histologie et discute les conséquences d’une éventuelle reprise. La stabilité rachidienne, les complications infectieuses et l’autonomie sont réévaluées au suivi.', [14, 16, 19, 28, 29, 34, 37]]
];
const dp = caseData.map(([vignette, ids], seriesIndex) => ({
  label: `DP ${seriesIndex + 1} — Situation clinique`,
  kind: 'dp',
  vignette,
  questions: ids.map((id, questionIndex) => {
    const source = specs[id];
    const leads = ['Au temps initial, ', 'Après la première imagerie, ', 'Avant le prélèvement, ', 'Une fois l’histologie obtenue, ', 'Pendant la planification opératoire, ', 'Au décours de l’intervention, ', 'Lors de la consultation de suivi, '];
    return { ...source, enonce: `${leads[questionIndex]}${source.enonce.charAt(0).toLowerCase()}${source.enonce.slice(1)}` };
  })
}));
if (flashcards.length !== 100 || qcm.length !== 8 || dp.length !== 8 || qcm.flatMap(s => s.questions).length !== 40 || dp.flatMap(s => s.questions).length !== 56) throw new Error('Paquet incomplet');
mkdirSync(out, { recursive: true });
const chapter = { title, provenance: { extract: 'extract.json', sourceOnly: true, sourceBlocks: [15, 18, 20, 31, 34, 44, 58, 93, 117, 174, 193, 195] }, flashcards, series: [...qcm, ...dp] };
writeFileSync(join(out, 'chapter.json'), `${JSON.stringify(chapter, null, 2)}\n`, 'utf8');
writeFileSync(join(out, 'coverage.json'), `${JSON.stringify({ flashcards: 100, qcm: 40, dp: 56, sourceOnly: true }, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ out, flashcards: flashcards.length, series: chapter.series.length, questions: 96 }));
