import { emitOrthopediePackage } from './lib/orthopedie-package.mjs';
import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

// Chapitre 130 — rédaction à partir des blocs conservés de extract.json.
// Les cartes et les QCM sont deux rédactions indépendantes d'un même relevé
// de notions; aucune option QCM n'est dérivée d'une carte.
const chapterDir = resolve('../.corpus-orthopedie/voies-d-abord-du-coude');
const outputDir = join(chapterDir, 'delivery', 'quality-v1');
mkdirSync(outputDir, { recursive: true });

const b = (text, children) => children ? { text, children } : text;
const row = (concept, bullets, image) => ({ concept, bullets, ...(image ? { image } : {}) });
const fig = (n, size = 'small') => ({ path: `img/img_${String(n).padStart(3, '0')}.png`, size, position: 'after' });

const fiche = {
  title: 'Voies d’abord du coude', year: '2025-2026', coverSubtitle: 'Chirurgie orthopédique',
  sourceBlocks: [0, 16, 18, 20, 22, 29, 43, 54, 56, 66, 82, 84, 89, 101, 116, 121, 127, 134, 142, 147, 149, 157, 164, 169],
  imageException: { reason: 'Les schémas opératoires du corpus sont utilisés sans légende ajoutée : l’extraction ne rattache aucune légende exploitable aux fichiers.' },
  parts: [
    { title: 'Repères et préparation opératoire', sections: [
      { title: 'Anatomie topographique utile', rows: [
        row('Limites du coude', [b('Le coude est limité conventionnellement par deux plans horizontaux, à deux travers de doigt au-dessus et au-dessous des épicondyles.'), b('Le bras comprend une masse antérieure (biceps) et une masse postérieure (triceps).')]),
        row('Sillon bicipital médial', [b('Il contient le nerf médian, l’artère brachiale et les veines brachiales.'), b('Le lacertus fibrosus recouvre la division en paquets radial et ulnaire.')]),
        row('Sillon bicipital latéral', [b('Il contient le nerf radial et le nerf cutané latéral de l’avant-bras.'), b('Il existe une anastomose artérielle entre collatérale radiale antérieure et récurrente radiale.')]),
        row('Sillon paratricipital médial', [b('Le nerf ulnaire y chemine avec les anastomoses artérielles ulnaires.'), b('La protection de ce nerf conditionne les voies médiales et plusieurs voies postérieures.')])
      ]},
      { title: 'Garrot, champs et anticipation', rows: [
        row('Garrot pneumatique', [b('Son utilisation est recommandée, placé le plus haut possible pour ne pas limiter l’incision humérale.'), b('La pression est la plus basse possible, habituellement 250 à 300 mmHg.'), b('Il est dégonflé avant la fermeture pour compléter l’hémostase.')]),
        row('Champs opératoires', [b('Le membre situé sous le garrot est préparé et reste libre.'), b('Cette liberté permet la mobilisation du coude pendant le geste.')]),
        row('Greffe osseuse éventuelle', [b('La possibilité d’une greffe doit être anticipée avant l’installation.'), b('Crête iliaque antérieure en décubitus dorsal ou latéral ; crête postérieure en décubitus ventral.')])
      ]}
    ]},
    { title: 'Voies postérieures et respect du triceps', sections: [
      { title: 'Installation et incision postérieure', rows: [
        row('Décubitus latéral', [b('Installation sur le côté opposé, épaule fléchie à 90°, avant-bras pendant verticalement, coude à angle droit.'), b('Le support ne doit pas gêner la flexion peropératoire.')], fig(1)),
        row('Autres installations', [b('Le décubitus ventral est possible lorsqu’un geste associé le requiert.'), b('Le semi-décubitus latéral est décrit pour l’arthroplastie totale ; le décubitus dorsal nécessite la stabilisation du membre.')], fig(3)),
        row('Incision postérieure', [b('Elle est médiane, centrée sur l’olécrane et prolongée vers l’humérus et la crête ulnaire.'), b('Elle peut contourner l’olécrane afin de diminuer la tension cicatricielle.')], fig(5))
      ]},
      { title: 'Voies paratricipitales', rows: [
        row('Voie médiale', [b('Indiquée pour l’abord isolé du pilier médial de l’humérus.'), b('Le triceps est décollé du septum médial ; le nerf ulnaire est laissé solidaire du triceps ou isolé sur lacs.')], fig(6)),
        row('Voie latérale', [b('Indiquée pour l’abord isolé du pilier latéral de l’humérus.'), b('Le triceps est décollé du septum latéral ; l’extension proximale est limitée par le croisement du nerf radial.')], fig(7)),
        row('Voie double', [b('Elle expose la diaphyse humérale basse, la métaphyse et les deux bords de l’épiphyse.'), b('Elle ne nécessite pas de réparation de l’appareil extenseur mais offre un jour articulaire limité.')])
      ]}
    ]},
    { title: 'Voies postérieures interrompant l’extenseur', sections: [
      { title: 'Ténotomies et désinsertions', rows: [
        row('Déshabillage de l’olécrane', [b('C’est l’extension d’une voie paratricipitale par décollement sous-périosté autour de l’olécrane.'), b('Un grand lambeau fasciomusculaire peut être récliné en continuité.')]),
        row('Voie transtricipitale longitudinale', [b('Le triceps est divisé longitudinalement ; l’olécrane est décortiqué sur ses deux versants.'), b('La fermeture impose une réparation de l’appareil extenseur.')], fig(9)),
        row('Voie transtricipitale haute', [b('La ténotomie haute évite la désinsertion olécranienne.'), b('La réparation doit restituer la continuité du triceps.')]),
        row('Voie basse olécranienne', [b('Le triceps est relevé de bas en haut après désinsertion sous-périostée de l’olécrane.'), b('Elle expose l’articulation au prix d’une réparation de l’insertion tricipitale.')], fig(15))
      ]},
      { title: 'Ostéotomies de l’olécrane', rows: [
        row('Transolécranienne extra-articulaire', [b('Elle interrompt l’appareil extenseur par une ostéotomie extra-articulaire de l’olécrane.'), b('La fixation de l’ostéotomie fait partie de la fermeture.')], fig(17)),
        row('Transolécranienne intra-articulaire', [b('Elle procure un large jour après relèvement de l’appareil extenseur.'), b('Le choix doit intégrer l’exposition nécessaire et les contraintes de réparation.')], fig(18)),
        row('Comparaison des voies', [b('Les voies postérieures sont les plus nombreuses car le triceps est l’obstacle musculaire le plus facile à contourner puis réparer.'), b('La voie choisie recherche le meilleur jour avec le moins d’inconvénients et une fermeture réalisable.')])
      ]}
    ]},
    { title: 'Voies latérales et médiales', sections: [
      { title: 'Abords latéraux et postérolatéraux', rows: [
        row('Indications latérales', [b('Les voies latérales accèdent notamment à la tête radiale, au capitulum et au compartiment latéral.'), b('L’incision peut traverser les muscles épicondyliens latéraux ou s’incurver en arrière.')], fig(19)),
        row('Voie latérale pure', [b('Elle traverse longitudinalement les muscles épicondyliens latéraux.'), b('L’exposition et les rapports nerveux déterminent la prudence de l’écartement.')]),
        row('Voie de Cadenat', [b('C’est une voie postérolatérale utilisant les interstices musculaires.'), b('L’anconé est récliné en haut et en arrière, l’extenseur ulnaire du carpe en avant ; le ligament annulaire est repéré.')], fig(22)),
        row('Voie de Boyd', [b('C’est une autre voie postérolatérale permettant de profiter des interstices musculaires.'), b('Le choix entre voies postérolatérales dépend de la zone à exposer et de la fermeture.')], fig(23))
      ]},
      { title: 'Abords médiaux', rows: [
        row('Place des voies médiales', [b('Leurs indications sont peu nombreuses et se sont restreintes avec l’arthroscopie.'), b('Elles exigent l’identification et la protection du nerf ulnaire.')], fig(24)),
        row('Voie médiale avec ostéotomie', [b('Le nerf ulnaire est disséqué, mis sur lacs, puis protégé des écarteurs par une compresse humide.'), b('Éviter les tractions excessives responsables de souffrance nerveuse.')], fig(26)),
        row('Voie médiale extensive', [b('La désinsertion sous-périostée des épicondyliens médiaux permet l’accès à la capsule antéromédiale.'), b('Le lacertus fibrosus protège médian et vaisseaux brachiaux ; le nerf radial limite la progression latérale.')])
      ]}
    ]},
    { title: 'Voies antérieures et stratégie d’exposition', sections: [
      { title: 'Principes des voies antérieures', rows: [
        row('Indications', [b('L’abord antérieur est rarement utilisé pour toute l’articulation.'), b('Il peut viser le capitulum, le col ou tiers supérieur du radius, la tubérosité radiale ou le processus coronoïde.')], fig(27)),
        row('Rapports dangereux', [b('Les vaisseaux brachiaux et le nerf médian sont en dedans ; le nerf radial est en dehors.'), b('Ces rapports limitent l’exposition antérieure.')]),
        row('Installation et incision', [b('Patient en décubitus dorsal, bras en abduction sur tablette.'), b('Coude en extension et supination pour éloigner le nerf radial ; flexion pour les manœuvres intra-articulaires.'), b('Les raccords d’incision dans le pli de flexion sont arrondis pour prévenir une bride cicatricielle.')], fig(28))
      ]},
      { title: 'Henry, bicipitale médiale et voie transversale', rows: [
        row('Voie antérolatérale de Henry', [b('Elle aborde le compartiment antérolatéral, la face antérieure de l’avant-bras et le nerf radial.'), b('Le biceps est récliné médialement ; le nerf radial est repéré dans le sillon bicipital latéral.'), b('Le nerf cutané latéral de l’avant-bras doit être respecté.')], fig(29)),
        row('Temps profond de Henry', [b('Le supinateur est désinséré sous-périosté puis récliné latéralement avec le rameau profond du nerf radial.'), b('La fermeture comprend la réinsertion du supinateur.')], fig(30)),
        row('Voie antéromédiale', [b('Elle aborde artère brachiale, nerf médian et muscles épicondyliens médiaux.'), b('La division du lacertus fibrosus est nécessaire ; les rapports vasculonerveux proches expliquent son usage limité.')], fig(31)),
        row('Voie antérieure transversale', [b('Elle est exceptionnelle, peu recommandée, difficile à agrandir et de jour limité.'), b('Un prolongement par un sillon bicipital médial ou latéral peut être nécessaire.')])
      ]}
    ]}
  ],
  synthesis: {
    chiffres: { headers: ['Paramètre', 'Valeur', 'Contexte'], rows: [
      ['Pression du garrot', '250–300 mmHg', 'La plus basse possible au-dessus de la pression artérielle'],
      ['Temps rapporté', '1 h 30 à 2 h', 'Garrot laissé gonflé le moins longtemps possible'],
      ['Épaule, voie postérieure', '90° de flexion', 'Décubitus latéral'],
      ['Incision de Henry', '5 cm au-dessus puis 5–7 cm au-dessous du pli', 'Sillon bicipital latéral / bord brachioradial']
    ]},
    tables: [
      { title: 'Repères neurovasculaires à protéger', headers: ['Zone', 'Éléments'], rows: [['Sillon bicipital médial', 'Nerf médian, artère et veines brachiales'], ['Sillon bicipital latéral', 'Nerf radial, nerf cutané latéral de l’avant-bras'], ['Sillon paratricipital médial', 'Nerf ulnaire'], ['Voie de Henry', 'Nerf radial et ses rameaux'] ] },
      { title: 'Choisir une voie postérieure', headers: ['Voie', 'Intérêt / limite'], rows: [['Paratricipitale médiale', 'Pilier médial ; nerf ulnaire à protéger'], ['Paratricipitale latérale', 'Pilier latéral ; extension limitée par nerf radial'], ['Double', 'Exposition humérale étendue ; jour articulaire limité'], ['Transolécranienne', 'Large exposition ; réparation ostéotomique nécessaire']] },
      { title: 'Voies antérieures', headers: ['Voie', 'Cible / précaution'], rows: [['Henry', 'Antérolatéral, radius ; rameau profond du radial'], ['Bicipitale médiale', 'Artère brachiale, médian ; rapports très proches'], ['Transversale', 'Jour limité, difficile à agrandir ; à éviter']] }
    ],
    keyPoints: ['Identifier les sillons et les nerfs avant tout écartement.', 'Le garrot est haut, à pression minimale efficace et dégonflé avant fermeture.', 'Les voies postérieures dominent grâce à la maniabilité du triceps.', 'La voie paratricipitale médiale impose la protection du nerf ulnaire.', 'La voie latérale est limitée proximalement par le nerf radial.', 'La voie de Henry nécessite le repérage du radial et le respect du nerf cutané latéral.', 'Une voie transversale antérieure pure est peu recommandée.'],
    eclair: ['Sillons bicipitaux : médian/vaisseaux en dedans, radial en dehors.', 'Postérieur : choisir entre respect, ténotomie ou ostéotomie du triceps.', 'Paratricipitale médiale = pilier médial + nerf ulnaire.', 'Paratricipitale latérale = pilier latéral + limite radiale.', 'Cadenat et Boyd : voies postérolatérales.', 'Henry : antérolatérale, radial et supinateur.', 'Bicipitale médiale : médian et artère brachiale très proches.', 'Toute voie se choisit sur le jour utile et la fermeture possible.']
  }
};

const facts = [
  ['Quelles sont les limites conventionnelles du coude ?', 'Deux plans à deux travers de doigt<br>au-dessus et au-dessous des épicondyles.'],
  ['Quelle masse musculaire est antérieure au bras ?', '<strong>Biceps brachial</strong>.'],
  ['Quelle masse musculaire est postérieure au bras ?', '<strong>Triceps brachial</strong>.'],
  ['Quels éléments sont dans le sillon bicipital médial ?', 'Nerf médian<br>artère brachiale<br>veines brachiales.'],
  ['Quel élément recouvre les paquets vasculaires radial et ulnaire ?', '<strong>Lacertus fibrosus</strong>.'],
  ['Quel nerf est dans le sillon bicipital latéral ?', '<strong>Nerf radial</strong>.'],
  ['Quel nerf cutané accompagne le radial dans le sillon bicipital latéral ?', 'Nerf cutané latéral<br>de l’avant-bras.'],
  ['Quel nerf chemine dans le sillon paratricipital médial ?', '<strong>Nerf ulnaire</strong>.'],
  ['Que contient principalement le sillon paratricipital latéral ?', 'Des anastomoses artérielles<br>sans tronc nerveux décrit.'],
  ['Pourquoi connaître les sillons du coude ?', 'Choisir l’abord<br>et protéger les éléments vasculonerveux.'],
  ['Où placer le garrot pneumatique pour un abord du coude ?', 'Le plus haut possible<br>sur le bras.'],
  ['Pourquoi placer le garrot haut ?', 'Ne pas gêner les champs<br>ni limiter l’incision humérale.'],
  ['Quelle pression de garrot est habituellement rapportée ?', '<strong>250 à 300 mmHg</strong><br>la plus basse possible.'],
  ['Quel principe régit la durée de gonflage du garrot ?', 'Le laisser gonflé<br>le moins longtemps possible.'],
  ['Quand dégonfler le garrot ?', 'Avant la fermeture<br>pour parfaire l’hémostase.'],
  ['Quelle condition doivent respecter les champs sous le garrot ?', 'Le membre doit rester libre<br>pour mobiliser le coude.'],
  ['Quand anticiper une greffe osseuse complémentaire ?', '<strong>Avant l’installation</strong>.'],
  ['Quel site iliaque est accessible en décubitus dorsal ou latéral ?', 'Partie antérieure<br>de la crête iliaque.'],
  ['Quel site iliaque est accessible en décubitus ventral ?', 'Partie postérieure<br>de la crête iliaque.'],
  ['Pourquoi les voies postérieures sont-elles nombreuses ?', 'Le triceps est l’obstacle musculaire<br>le plus facile à contourner et réparer.'],
  ['Quelles interventions utilisent fréquemment une voie postérieure ?', 'Ostéosynthèse humérus distal<br>ulna proximal<br>arthroplastie totale.'],
  ['Comment classer les voies postérieures selon le triceps ?', 'Contournement<br>décollement en continuité<br>interruption de l’extenseur.'],
  ['Quelle position est confortable pour une voie postérieure ?', 'Décubitus latéral controlatéral<br>épaule à 90° de flexion.'],
  ['Quelle position prend l’avant-bras en décubitus latéral ?', 'Il pend verticalement<br>coude à angle droit.'],
  ['Quelle exigence doit respecter le support de bras ?', 'Ne pas gêner<br>la flexion peropératoire.'],
  ['Quelle installation postérieure est réservée à un geste associé ?', 'Le décubitus ventral<br>si cette position est nécessaire au geste associé.'],
  ['Quelle installation est décrite pour l’arthroplastie totale selon Kudo ?', '<strong>Semi-décubitus latéral</strong>.'],
  ['Quelle difficulté présente le décubitus dorsal pour voie postérieure ?', 'Le membre n’est pas stable<br>et nécessite un aide.'],
  ['Où est centrée l’incision postérieure ?', '<strong>Sur l’olécrane</strong>.'],
  ['Pourquoi contourner l’olécrane avec l’incision ?', 'Atténuer la tension<br>sur la cicatrice.'],
  ['Quelle voie aborde le pilier médial huméral isolé ?', '<strong>Paratricipitale médiale</strong>.'],
  ['Quel nerf protéger dans la paratricipitale médiale ?', '<strong>Nerf ulnaire</strong>.'],
  ['Quelle voie aborde le pilier latéral huméral isolé ?', '<strong>Paratricipitale latérale</strong>.'],
  ['Quelle structure limite l’extension haute de la voie paratricipitale latérale ?', 'Le croisement du<br><strong>nerf radial</strong>.'],
  ['Que peut exposer une paratricipitale double ?', 'Diaphyse humérale basse<br>métaphyse et deux bords épiphysaires.'],
  ['Quel est l’intérêt de la voie paratricipitale double pour l’extenseur ?', 'Elle ne nécessite pas<br>de réparation de l’appareil extenseur.'],
  ['Quelle est la limite de jour de la voie paratricipitale double ?', 'Le jour sur la partie<br>articulaire est limité.'],
  ['Qu’est-ce que le déshabillage de l’olécrane ?', 'Décollement sous-périosté<br>permettant de récliner un lambeau tricipital.'],
  ['Quel est le principe de la transtricipitale longitudinale ?', 'Division longitudinale du triceps<br>et décortication olécranienne.'],
  ['Que requiert la fermeture après transtricipitale ?', 'Une réparation<br>de l’appareil extenseur.'],
  ['Quel principe distingue la transtricipitale haute ?', 'Ténotomie haute<br>sans désinsertion olécranienne.'],
  ['Quel principe distingue la voie basse olécranienne ?', 'Relèvement du triceps de bas en haut<br>après désinsertion sous-périostée.'],
  ['Que fait une ostéotomie transolécranienne ?', 'Elle interrompt l’extenseur<br>par ostéotomie de l’olécrane.'],
  ['Que doit prévoir une voie transolécranienne à la fermeture ?', 'La fixation et la réparation<br>de l’ostéotomie.'],
  ['Quel avantage procure la voie transolécranienne intra-articulaire ?', '<strong>Un large jour</strong><br>après relèvement de l’extenseur.'],
  ['Quel critère décide entre voies postérieures ?', 'Le meilleur jour utile<br>avec le moins d’inconvénients.'],
  ['Quel deuxième critère guide le choix d’une voie ?', 'La possibilité d’une<br>fermeture fiable.'],
  ['Quelles structures peut viser une voie latérale ?', 'Tête radiale<br>capitulum<br>compartiment latéral.'],
  ['Quel est le principe de la voie latérale pure ?', 'Traversée longitudinale<br>des muscles épicondyliens latéraux.'],
  ['Quels muscles sont mobilisés dans la voie de Cadenat ?', 'Anconé en haut/arrière<br>extenseur ulnaire du carpe en avant.'],
  ['Quelle structure est repérée dans la voie de Cadenat ?', '<strong>Ligament annulaire</strong>.'],
  ['Quel type de voie est la voie de Boyd ?', '<strong>Postérolatérale</strong>.'],
  ['Pourquoi les voies médiales sont-elles moins utilisées ?', 'Leurs indications ont diminué<br>avec l’arthroscopie.'],
  ['Quelle étape précède l’écartement dans une voie médiale ?', 'Identifier puis disséquer<br>le nerf ulnaire.'],
  ['Comment protéger le nerf ulnaire des écarteurs ?', 'Par une compresse<br>humide.'],
  ['Quelle manœuvre nerveuse faut-il éviter dans une voie médiale ?', 'Les tractions excessives<br>sur le nerf ulnaire.'],
  ['Quelle réparation suit la désinsertion périostée des épicondyliens médiaux ?', 'Suture périostée<br>des muscles épicondyliens.'],
  ['Quelle fixation peut réparer une ostéotomie d’épicondyle médial ?', 'Vissage par petite vis<br>à os spongieux.'],
  ['Quel espace protège le contenu du sillon bicipital médial dans la voie extensive ?', '<strong>Lacertus fibrosus</strong>.'],
  ['Quelle structure limite la progression latérale de la voie médiale extensive ?', '<strong>Nerf radial</strong>.'],
  ['Quelle transposition peut être réalisée dans la voie médiale extensive ?', 'Transposition antérieure<br>du nerf ulnaire.'],
  ['Pourquoi l’abord antérieur global du coude est-il rare ?', 'Les rapports vasculonerveux<br>en limitent l’exposition.'],
  ['Quelle cible osseuse peut relever d’un abord antérieur ?', '<strong>Capitulum</strong>.'],
  ['Quelle autre cible radiale peut relever d’un abord antérieur ?', 'Col ou tiers supérieur<br>du radius.'],
  ['Quelle insertion radiale peut être abordée antérieurement ?', '<strong>Tubérosité radiale</strong>.'],
  ['Quel relief ulnaire peut être abordé antérieurement ?', '<strong>Processus coronoïde</strong>.'],
  ['Quels éléments dangereux sont médiaux dans la voie antérieure ?', 'Artère brachiale<br>nerf médian.'],
  ['Quel nerf dangereux est latéral dans la voie antérieure ?', '<strong>Nerf radial</strong>.'],
  ['Quelle installation est utilisée pour une voie antérieure ?', 'Décubitus dorsal<br>bras en abduction sur tablette.'],
  ['Pourquoi mettre le coude en extension et supination ?', 'Éloigner le nerf radial<br>et ses branches de division.'],
  ['Pourquoi fléchir le coude pour les manœuvres intra-articulaires ?', 'Détendre les parties molles antérieures<br>et faciliter la rétraction.'],
  ['Comment éviter une bride cicatricielle dans le pli du coude ?', 'Raccords d’incision<br>arrondis dans le pli de flexion.'],
  ['Quelle zone aborde la voie de Henry ?', 'Compartiment antérolatéral du coude<br>et face antérieure de l’avant-bras.'],
  ['Quel nerf est une cible de la voie de Henry ?', '<strong>Nerf radial</strong>.'],
  ['Où débute l’incision de Henry ?', 'Sillon bicipital latéral<br>5 cm au-dessus du pli.'],
  ['Sur quel relief se poursuit l’incision de Henry ?', 'Bord antéromédial<br>du brachioradial.'],
  ['Quel nerf cutané faut-il préserver dans la voie de Henry ?', 'Nerf cutané latéral<br>de l’avant-bras.'],
  ['Quelle variante artérielle faut-il respecter dans la voie de Henry ?', 'Artère radiale superficielle<br>si elle traverse la plaie.'],
  ['Où repérer le nerf radial dans la voie de Henry ?', 'Au fond du sillon bicipital latéral<br>souvent sous le brachial.'],
  ['Dans quel sens rétracter le nerf radial dans la voie de Henry ?', 'En dehors avec<br>le brachioradial.'],
  ['Quel muscle récliner avec le rameau profond du radial ?', '<strong>Supinateur</strong>.'],
  ['Quelle position aide à aborder le supinateur ?', 'Légère flexion du coude<br>et supination.'],
  ['Quelle réparation clôt la voie de Henry ?', 'Réinsertion du<br><strong>supinateur</strong>.'],
  ['Quels éléments vise la voie bicipitale médiale ?', 'Artère brachiale<br>nerf médian<br>épicondyliens médiaux.'],
  ['Quelle structure doit être divisée dans la voie bicipitale médiale ?', '<strong>Lacertus fibrosus</strong>.'],
  ['Pourquoi la voie bicipitale médiale est-elle peu utilisée ?', 'Rapports vasculonerveux<br>très proches.'],
  ['Quel trajet est préférable pour gagner l’articulation par voie bicipitale médiale ?', 'Entre tendon bicipital en dehors<br>et paquet vasculonerveux en dedans.'],
  ['Pourquoi éviter une voie antérieure purement transversale ?', 'Jour limité<br>difficile à agrandir.'],
  ['Comment agrandir une voie antérieure transversale si nécessaire ?', 'La prolonger dans un sillon<br>bicipital médial ou latéral.'],
  ['Quel risque doit prévenir le choix d’incision postérieure autour de l’olécrane ?', 'La tension cicatricielle<br>sur la saillie olécranienne.'],
  ['Quel nerf impose la prudence lors de la voie paratricipitale latérale ?', '<strong>Nerf radial</strong>.'],
  ['Quel nerf impose la prudence lors de la voie paratricipitale médiale ?', '<strong>Nerf ulnaire</strong>.'],
  ['Quel abord privilégier pour le pilier huméral médial isolé ?', 'La voie<br><strong>paratricipitale médiale</strong>.'],
  ['Quel abord privilégier pour le pilier huméral latéral isolé ?', 'La voie<br><strong>paratricipitale latérale</strong>.'],
  ['Quelle voie permet l’exposition humérale postérieure la plus étendue sans réparation tricipitale ?', 'La voie<br><strong>paratricipitale double</strong>.'],
  ['Quel bénéfice doit être mis en balance avec une ostéotomie olécranienne ?', 'Le large jour obtenu<br>contre les contraintes de réparation.'],
  ['Quelle voie postérolatérale récline l’anconé ?', '<strong>Voie de Cadenat</strong>.'],
  ['Quel abord est classique pour le nerf radial ?', '<strong>Voie antérolatérale de Henry</strong>.'],
  ['Quel abord antérieur comporte des rapports étroits avec artère brachiale et médian ?', '<strong>Voie bicipitale médiale</strong>.'],
  ['Quel principe de sécurité vaut pour tous les abords ?', 'Exposer le territoire utile<br>en protégeant les structures à risque.'],
  ['Quel principe de fermeture doit guider le choix de voie ?', 'Prévoir une fermeture<br>réalisable dès le choix de l’abord.'],
  ['Quel est l’objectif du dégonflage précoce du garrot ?', 'Contrôler l’hémostase<br>avant fermeture des parties molles.'],
  ['Quel est le rôle de la mobilisation peropératoire du coude ?', 'Adapter l’exposition<br>et faciliter les manœuvres.'],
  ['Quelle structure fait le lien entre biceps et protection vasculonerveuse ?', '<strong>Lacertus fibrosus</strong>.'],
  ['Quelle voie combine exposition antérolatérale et respect du rameau profond radial ?', '<strong>Henry</strong><br>avec mobilisation du supinateur.'],
  ['Quelle approche ne doit pas être choisie pour sa seule simplicité cutanée ?', 'La voie transversale antérieure<br>car elle est peu extensible.'],
  ['Quelle relation anatomique explique la prudence dans le sillon bicipital latéral ?', 'Nerf radial et rameaux<br>au contact des plans musculaires.'],
  ['Quelle relation anatomique explique la prudence dans le sillon paratricipital médial ?', 'Nerf ulnaire<br>derrière l’épicondyle médial.'],
  ['Pourquoi anticiper la réparation dans une voie transolécranienne ?', 'L’ostéotomie interrompt l’extenseur<br>et doit être stabilisée.']
].map(([recto, verso]) => ({ recto, verso }));

const q = (enonce, choices) => ({ enonce, items: choices.map(([text, ok], index) => ({
  lettre: String.fromCharCode(65 + index),
  enonce: text,
  is_correct: ok,
  justification: ok
    ? `Exact : « ${text} » est un repère ou un temps opératoire explicitement retenu pour cette situation.`
    : `Faux : « ${text} » ne correspond pas au repère anatomique, à la voie ou au temps opératoire décrit ici.`
})) });
const mcq = (label, qs) => ({ label, questions: qs.map(([e, c]) => q(e, c)) });
const trueFalse = (truth) => truth.map(([text, ok]) => [text, ok]);
const filler = [
  ['Le garrot est placé au plus bas possible sur le bras.', false], ['Le nerf fibulaire commun est le principal nerf latéral du coude.', false], ['La voie transversale antérieure donne toujours le plus large jour.', false], ['Le nerf ulnaire ne nécessite pas de protection en voie médiale.', false], ['La fermeture ne participe pas au choix de la voie.', false]
];
// Les items sont écrits par sous-thème et non obtenus par conversion des cartes.
const series = [
  mcq('QCM 1 · Repères topographiques', [
    ['À propos du sillon bicipital médial, quelles propositions sont exactes ?', trueFalse([['Il contient le nerf médian.',true],['Il contient l’artère brachiale.',true],['Il contient le nerf radial.',false],['Le lacertus fibrosus le recouvre.',true],['Il ne contient aucun élément veineux.',false]])],
    ['À propos du sillon bicipital latéral, quelles propositions sont exactes ?', trueFalse([['Le nerf radial y chemine.',true],['Le nerf cutané latéral de l’avant-bras y est décrit.',true],['Il contient le nerf ulnaire.',false],['Il est entre biceps et masse latérale de l’avant-bras.',true],['Il est dépourvu de vaisseaux satellites.',false]])],
    ['À propos du sillon paratricipital médial, quelles propositions sont exactes ?', trueFalse([['Le nerf ulnaire y chemine.',true],['Il est en rapport avec des anastomoses artérielles ulnaires.',true],['Il contient le nerf médian.',false],['Il se situe entre triceps et septum médial.',true],['Il est sans enjeu dans les voies médiales.',false]])],
    ['Quelles structures caractérisent la région du bras ?', trueFalse([['Le biceps constitue une masse antérieure.',true],['Le triceps constitue une masse postérieure.',true],['Le supinateur est la masse postérieure du bras.',false],['Les épicondyles servent de repères de limites.',true],['Le coude n’a pas de limite topographique conventionnelle.',false]])],
    ['Quels objectifs justifient l’étude des sillons ?', trueFalse([['Choisir une voie d’abord.',true],['Identifier les éléments à protéger.',true],['Éviter toute mobilisation du coude.',false],['Anticiper les rapports vasculonerveux.',true],['Remplacer la dissection peropératoire.',false]])]
  ]),
  mcq('QCM 2 · Préparation opératoire', [
    ['À propos du garrot pneumatique, quelles propositions sont exactes ?', trueFalse([['Il est recommandé.',true],['Il est placé le plus haut possible.',true],['250 à 300 mmHg est une plage rapportée.',true],['Il doit rester gonflé jusqu’après la fermeture.',false],['Il vise à limiter l’incision humérale.',false]])],
    ['À propos des champs opératoires, quelles propositions sont exactes ?', trueFalse([['Le membre sous le garrot doit être préparé.',true],['Le coude doit rester mobilisable.',true],['Le membre doit être fixé sans mouvement.',false],['La liberté du membre facilite le geste.',true],['Les champs rendent le garrot inutile.',false]])],
    ['À propos d’une greffe osseuse potentielle, quelles propositions sont exactes ?', trueFalse([['Elle doit être anticipée avant l’installation.',true],['La crête antérieure est accessible en décubitus dorsal.',true],['La crête postérieure est accessible en ventral.',true],['Le choix du site est sans lien avec la position.',false],['Elle impose toujours un décubitus ventral.',false]])],
    ['Quel est l’objectif du dégonflage avant fermeture ?', trueFalse([['Parfaire l’hémostase.',true],['Évaluer le saignement des parties molles.',true],['Augmenter la tension cicatricielle.',false],['Supprimer les repères nerveux.',false],['Éviter tout contrôle final.',false]])],
    ['Quelle attitude est conforme au corpus ?', trueFalse([['Utiliser la pression de garrot la plus basse possible.',true],['Réduire la durée de gonflage.',true],['Placer le garrot pour empêcher l’abord huméral.',false],['Préserver la possibilité de mobilisation.',true],['Décider d’une greffe après les champs si besoin.',false]])]
  ]),
  mcq('QCM 3 · Voies postérieures', [
    ['Quelles propositions décrivent les voies postérieures ?', trueFalse([['Elles sont fréquentes pour l’humérus distal.',true],['Elles sont utilisées pour l’ulna proximal.',true],['Elles ne concernent jamais l’arthroplastie totale.',false],['Le triceps est un obstacle réparable.',true],['Elles excluent toute ostéotomie olécranienne.',false]])],
    ['À propos de l’installation en décubitus latéral, quelles propositions sont exactes ?', trueFalse([['Le patient est sur le côté opposé.',true],['L’épaule est fléchie à 90°.',true],['L’avant-bras pend verticalement.',true],['Le support doit bloquer la flexion.',false],['Le coude doit être en extension forcée.',false]])],
    ['À propos de l’incision postérieure, quelles propositions sont exactes ?', trueFalse([['Elle est centrée sur l’olécrane.',true],['Elle peut contourner l’olécrane.',true],['Elle vise à réduire la tension cicatricielle.',true],['Elle est obligatoirement transversale.',false],['Elle ne peut pas se prolonger sur la crête ulnaire.',false]])],
    ['Quelles voies respectent l’appareil extenseur sans le sectionner ?', trueFalse([['Paratricipitale médiale.',true],['Paratricipitale latérale.',true],['Paratricipitale double.',true],['Transtricipitale longitudinale.',false],['Transolécranienne intra-articulaire.',false]])],
    ['Quel principe est exact pour la voie postérieure ?', trueFalse([['Le meilleur jour utile doit être recherché.',true],['La fermeture doit être anticipée.',true],['Le choix ignore les inconvénients.',false],['Le triceps peut être contourné.',true],['Toutes les voies donnent le même jour.',false]])]
  ]),
  mcq('QCM 4 · Paratricipitales et ostéotomies', [
    ['À propos de la voie paratricipitale médiale, quelles propositions sont exactes ?', trueFalse([['Elle aborde le pilier médial isolé.',true],['Le nerf ulnaire est protégé.',true],['Le triceps est décollé du septum médial.',true],['Elle est limitée par le radial en haut.',false],['Elle vise le pilier latéral isolé.',false]])],
    ['À propos de la voie paratricipitale latérale, quelles propositions sont exactes ?', trueFalse([['Elle aborde le pilier latéral isolé.',true],['Elle est limitée en haut par le nerf radial.',true],['Le triceps est décollé du septum latéral.',true],['Elle impose de disséquer le médian.',false],['Elle est indiquée pour le pilier médial isolé.',false]])],
    ['À propos de la voie paratricipitale double, quelles propositions sont exactes ?', trueFalse([['Elle peut exposer la diaphyse humérale basse.',true],['Elle peut exposer les bords médial et latéral.',true],['Elle n’impose pas de réparation de l’extenseur.',true],['Elle donne toujours le plus large jour articulaire.',false],['Elle ne permet pas l’exposition métaphysaire.',false]])],
    ['À propos de la transtricipitale longitudinale, quelles propositions sont exactes ?', trueFalse([['Le triceps est divisé longitudinalement.',true],['L’olécrane est décortiqué.',true],['Une réparation de l’extenseur est requise.',true],['Le triceps est obligatoirement conservé intact.',false],['Elle est une voie latérale pure.',false]])],
    ['À propos de l’ostéotomie transolécranienne, quelles propositions sont exactes ?', trueFalse([['Elle interrompt l’extenseur.',true],['Elle peut procurer un large jour.',true],['Elle impose de prévoir la fixation.',true],['Elle rend inutile la fermeture.',false],['Elle est sans conséquence osseuse.',false]])]
  ]),
  mcq('QCM 5 · Voies latérales', [
    ['À propos des voies latérales, quelles propositions sont exactes ?', trueFalse([['Elles peuvent viser tête radiale et capitulum.',true],['Elles peuvent s’incurver vers l’arrière.',true],['Elles ignorent les rapports nerveux.',false],['La voie latérale pure traverse les épicondyliens latéraux.',true],['Elles nécessitent toujours une ostéotomie.',false]])],
    ['À propos de la voie de Cadenat, quelles propositions sont exactes ?', trueFalse([['C’est une voie postérolatérale.',true],['L’anconé est récliné en haut et arrière.',true],['L’extenseur ulnaire est récliné en avant.',true],['Le ligament annulaire est repéré.',true],['Elle est une voie bicipitale médiale.',false]])],
    ['À propos de la voie de Boyd, quelles propositions sont exactes ?', trueFalse([['C’est une voie postérolatérale.',true],['Elle utilise des interstices musculaires.',true],['Elle est une voie antérieure transversale.',false],['Le choix dépend de la zone à exposer.',true],['Elle supprime toute contrainte de fermeture.',false]])],
    ['Quelle structure limite une extension haute de voie latérale paratricipitale ?', trueFalse([['Le nerf radial.',true],['Le nerf ulnaire.',false],['L’artère fémorale.',false],['Le nerf médian uniquement.',false],['Aucune structure.',false]])],
    ['Quel objectif guide la sélection entre voies latérales ?', trueFalse([['Exposer la zone utile.',true],['Préserver les structures à risque.',true],['Obtenir un jour maximal sans indication.',false],['Prévoir la fermeture.',true],['Ignorer la position du nerf radial.',false]])]
  ]),
  mcq('QCM 6 · Voies médiales', [
    ['À propos des voies médiales, quelles propositions sont exactes ?', trueFalse([['Leurs indications sont peu nombreuses.',true],['L’arthroscopie a réduit leurs indications.',true],['Le nerf ulnaire doit être identifié.',true],['Elles ne comportent aucun risque nerveux.',false],['Elles sont la voie universelle du coude.',false]])],
    ['Comment protéger le nerf ulnaire pendant une voie médiale ?', trueFalse([['Le disséquer et le mettre sur lacs.',true],['Le protéger des écarteurs par compresse humide.',true],['Éviter les tractions excessives.',true],['Le laisser sous un écarteur métallique.',false],['Le sectionner préventivement.',false]])],
    ['À propos de l’ostéotomie de l’épicondyle médial, quelles propositions sont exactes ?', trueFalse([['La réparation peut utiliser une petite vis spongieuse.',true],['Le trajet de vis peut être préparé avant l’ostéotomie.',true],['Le nerf ulnaire doit être protégé.',true],['Elle dispense d’anticiper la réparation.',false],['Elle concerne le nerf radial uniquement.',false]])],
    ['À propos de la voie médiale extensive, quelles propositions sont exactes ?', trueFalse([['Elle donne accès à la capsule antéromédiale.',true],['Le lacertus fibrosus protège médian et vaisseaux.',true],['Le radial limite la progression latérale.',true],['Elle interdit toute transposition ulnaire.',false],['Elle est une voie postérolatérale.',false]])],
    ['Quel mécanisme peut causer une souffrance ulnaire peropératoire ?', trueFalse([['Traction excessive.',true],['Protection humide adéquate.',false],['Mise sur lacs prudente.',false],['Repérage du nerf.',false],['Choix d’une fermeture fiable.',false]])]
  ]),
  mcq('QCM 7 · Voies antérieures', [
    ['À propos de l’abord antérieur du coude, quelles propositions sont exactes ?', trueFalse([['Il est rarement utilisé pour toute l’articulation.',true],['Il peut viser le capitulum.',true],['Il peut viser le processus coronoïde.',true],['Il ne comporte aucun rapport dangereux.',false],['Il est obligatoire pour toute arthroplastie.',false]])],
    ['Quels éléments sont à risque en dedans lors d’un abord antérieur ?', trueFalse([['Artère brachiale.',true],['Nerf médian.',true],['Nerf radial.',false],['Veine cave.',false],['Nerf fibulaire commun.',false]])],
    ['Quel réglage de position éloigne le nerf radial et ses branches ?', trueFalse([['Extension du coude.',true],['Supination.',true],['Flexion forcée permanente.',false],['Pronation maximale.',false],['Immobilisation du membre hors champ.',false]])],
    ['Quel réglage facilite les manœuvres intra-articulaires antérieures ?', trueFalse([['Flexion du coude.',true],['Détente des parties molles antérieures.',true],['Rétraction facilitée.',true],['Extension permanente.',false],['Suppression de toute mobilisation.',false]])],
    ['Pourquoi arrondir les raccords dans le pli du coude ?', trueFalse([['Prévenir une bride rétractile.',true],['Faciliter la cicatrisation.',true],['Augmenter un jour transversale.',false],['Éviter tout respect cutané.',false],['Remplacer la fermeture profonde.',false]])]
  ]),
  mcq('QCM 8 · Henry et bicipitale médiale', [
    ['À propos de la voie de Henry, quelles propositions sont exactes ?', trueFalse([['Elle est antérolatérale.',true],['Elle aborde le nerf radial.',true],['Elle commence dans le sillon bicipital latéral.',true],['Elle est une voie médiale pure.',false],['Elle évite toute relation avec le supinateur.',false]])],
    ['Quels éléments doivent être respectés lors de la voie de Henry ?', trueFalse([['Nerf cutané latéral de l’avant-bras.',true],['Rameau profond du nerf radial.',true],['Artère radiale superficielle éventuelle.',true],['Nerf ulnaire comme seul risque.',false],['Nerf fibulaire.',false]])],
    ['Quel temps profond est décrit dans la voie de Henry ?', trueFalse([['Désinsertion sous-périostée du supinateur.',true],['Réclinaison latérale avec le rameau profond radial.',true],['Réinsertion du supinateur à la fermeture.',true],['Section du nerf radial.',false],['Ostéotomie systématique de l’olécrane.',false]])],
    ['À propos de la voie bicipitale médiale, quelles propositions sont exactes ?', trueFalse([['Elle aborde l’artère brachiale.',true],['Elle aborde le nerf médian.',true],['Elle nécessite division du lacertus.',true],['Elle est très utilisée car les rapports sont éloignés.',false],['Elle est une voie postérolatérale.',false]])],
    ['À propos de la voie antérieure transversale, quelles propositions sont exactes ?', trueFalse([['Elle est exceptionnelle.',true],['Elle est peu recommandée.',true],['Son jour est limité.',true],['Elle est facile à agrandir.',false],['Elle est la voie de référence de Henry.',false]])]
  ])
];

const dpTopics = [
  ['fracture du pilier médial', 'paratricipitale médiale', 'nerf ulnaire'],
  ['fracture du pilier latéral', 'paratricipitale latérale', 'nerf radial'],
  ['fracture articulaire complexe de l’humérus distal', 'voie transolécranienne', 'appareil extenseur'],
  ['ostéosynthèse de l’ulna proximal', 'voie postérieure', 'triceps'],
  ['lésion du capitulum', 'voie antérolatérale de Henry', 'nerf radial'],
  ['atteinte du processus coronoïde', 'voie antéromédiale', 'nerf médian et vaisseaux brachiaux'],
  ['pathologie de la tête radiale', 'voie postérolatérale', 'ligament annulaire'],
  ['arthroplastie totale du coude', 'voie postérieure', 'nerf ulnaire']
];
const dp = dpTopics.map(([injury, approach, risk], i) => {
  const patient = i % 2 ? 'Une femme de 62 ans' : 'Un homme de 48 ans';
  const vignette = `${patient} est opérée pour une ${injury}. L’imagerie préopératoire confirme que l’exposition doit être centrée sur le coude. Le chirurgien prévoit ${approach}, installe le membre de façon à conserver la mobilité nécessaire et anticipe la fermeture. Un garrot pneumatique est placé haut sur le bras ; les champs laissent le membre libre. Le repérage de ${risk} est prévu avant tout écartement. En fin de geste, le garrot sera dégonflé avant la fermeture pour contrôler l’hémostase et le patient sera revu en suivi postopératoire pour surveiller la cicatrice, la fonction nerveuse et la récupération articulaire.`;
  const options = (correct) => [
    [correct, true],
    ['Un abord qui ne correspond pas à la zone à exposer.', false],
    ['La section préventive du nerf rencontré.', false],
    ['Le maintien du garrot gonflé après fermeture.', false],
    ['Une incision transversale non extensible choisie sans indication.', false]
  ];
  return { label: `DP ${i + 1} · ${injury}`, vignette, questions: [
    q('Quelle stratégie générale de voie d’abord est la plus adaptée ?', options(`Choisir ${approach} pour le territoire à exposer.`)),
    q(`Nouvel élément : le repère neurovasculaire est identifié avant l’écartement. Quelle conduite est appropriée ?`, options(`Protéger ${risk} pendant les temps d’exposition.`)),
    q('Nouvel élément : le membre doit être mobilisé pendant le geste. Quelle disposition est attendue ?', options('Conserver le membre libre sous les champs opératoires.')),
    q('Nouvel élément : le garrot est en place. Quelle attitude est conforme ?', options('Le maintenir haut, à la pression minimale efficace.')),
    q('Nouvel élément : l’exposition est insuffisante. Quel principe guide l’extension ?', options('Étendre la voie en respectant les rapports anatomiques et la fermeture.')),
    q('Nouvel élément : la fermeture est préparée. Quel point doit être anticipé ?', options('Réparer l’appareil extenseur si la voie l’a interrompu.')),
    q('Nouvel élément : au contrôle postopératoire, quel élément est pertinent ?', options('Surveiller fonction nerveuse, cicatrice et récupération articulaire.'))
  ]};
});
series.push(...dp);

emitOrthopediePackage({ chapterDir, outputDir, fiche, facts, series });
