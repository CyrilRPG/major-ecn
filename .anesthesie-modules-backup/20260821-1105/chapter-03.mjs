// Chapitre 03 - La gestion des voies aeriennes superieures.
// Contenu editorial redige exclusivement a partir des blocs de extract.json.

const src = (...ids) => ids;
const n2 = (text, ...children) => ({ text, children });
const row = (concept, bullets, sourceBlocks, image) => ({
  concept, bullets, sourceBlocks, ...(image ? { image } : {}),
});

const image = (path, caption, sourceCaption) => ({
  path,
  position: 'after',
  size: 'large',
  layout: 'full_width',
  containsText: true,
  caption,
  sourceCaption,
});

const IMAGES = {
  anatomie: image('img/img_001.png', 'Anatomie fonctionnelle des voies aeriennes superieures', 'FIGURE 3.1 Anatomie des voies aeriennes superieures'),
  mallampati: image('img/img_002.png', 'Classification de Mallampati', 'TABLEAU 3.1 Classification de Mallampati'),
  thyro: image('img/img_003.png', 'Mesure de la distance thyromentonniere', 'FIGURE 3.2 Evaluation de la distance thyromentonniere'),
  evaluation: image('img/img_004.png', 'Criteres cliniques d une voie aerienne favorable', 'TABLEAU 3.2 Evaluation clinique normale des voies aeriennes pour une intubation tracheale'),
  priseMasque: image('img/img_007.png', 'Prise du masque et subluxation mandibulaire a une main', 'FIGURE 3.5 Ventilation a une main avec un masque facial'),
  canuleOro: image('img/img_008.png', 'Mise en place d une canule oropharyngee', 'FIGURE 3.6 Mise en place d une canule oropharyngee'),
  canuleNaso: image('img/img_009.png', 'Mise en place d une canule nasopharyngee', 'FIGURE 3.7 Mise en place d une canule nasopharyngee'),
  deuxMains: image('img/img_010.png', 'Ventilation au masque a deux mains', 'FIGURE 3.8 Ventilation a deux mains avec un masque facial'),
  insertionDsg: image('img/img_011.png', 'Insertion d un dispositif supraglottique', 'FIGURE 3.9 Technique d insertion du masque larynge'),
  igel: image('img/img_012.png', 'Architecture d un dispositif supraglottique i-Gel', 'FIGURE 3.10 Le masque larynge i-Gel'),
  nonInvasif: image('img/img_013.png', 'Ventilation faciale et supraglottique : indications et limites', 'TABLEAU 3.3 Indications, contre-indications et complications de la ventilation avec un masque facial et avec un dispositif supraglottique'),
  intubation: image('img/img_014.png', 'Intubation tracheale : indications et complications', 'TABLEAU 3.4 Indications, contre-indications et complications de l intubation endotracheale'),
  laryngoscopie: image('img/img_015.png', 'Positionnement et laryngoscopie directe', 'FIGURE 3.11 Positionnement du patient et intubation orotracheale avec la laryngoscopie directe'),
  cormack: image('img/img_016.png', 'Exposition glottique selon Cormack et Lehane', 'FIGURE 3.12 Le grade d intubation selon Cormack et Lehane'),
  burp: image('img/img_017.png', 'Manipulation laryngee externe optimale', 'FIGURE 3.13 Manipulation externe optimale du larynx avec la main droite libre ou BURP'),
  video: image('img/img_018.png', 'Principales familles de videolaryngoscopes', 'TABLEAU 3.5 Differents types de videolaryngoscopes'),
  crico: image('img/img_019.png', 'Reperage de la membrane cricothyroidienne', 'FIGURE 3.14 Site anatomique servant a la ponction de la membrane cricothyroidienne et a la cricothyroidotomie'),
  algo: image('img/img_020.png', 'Strategie devant une intubation difficile sous anesthesie generale', 'FIGURE 3.15 Algorithme de l intubation difficile chez un patient sous anesthesie generale'),
  fibro: image('img/img_021.png', 'Intubation guidee par fibroscopie', 'FIGURE 3.16 Intubation a la fibroscopie'),
  invasif: image('img/img_022.png', 'Abords tracheaux invasifs : indications, limites et complications', 'TABLEAU 3.6 Indications, contre-indications et complications des techniques tracheales invasives'),
};

// Les deux sources comportent, sous le visuel utile, le début numéroté de la
// section suivante. Le recadrage conserve l’intégralité du contenu médical.
IMAGES.anatomie.cropBottomMm = 14;
  IMAGES.invasif.cropBottomMm = 7.5;

function buildFiche() {
  const parts = [
    {
      title: 'Comprendre et anticiper la voie aerienne',
      sections: [
        {
          title: 'Anatomie fonctionnelle et protection laryngee',
          renderChunks: [2, 3],
          rows: [
            row('Pharynx', [
              'Le pharynx est le carrefour commun aux voies respiratoires et digestives : nasopharynx, oropharynx puis laryngopharynx.',
              n2('L oropharynx s etend de la base de langue a l epiglotte.', 'Son innervation plurielle explique la meilleure efficacite d une anesthesie locale topique que regionale.'),
            ], src('b00004'), IMAGES.anatomie),
            row('Protection de la glotte', [
              'La base de langue, l epiglotte et les reflexes de deglutition detournent le bol alimentaire vers l oesophage.',
              'La perte de ces reflexes expose directement a l inhalation tracheobronchique.',
            ], src('b00005')),
            row('Larynx et nerfs recurrents', [
              n2('Le larynx adulte est situe entre C4 et C6 et agit comme une valve respiratoire.', 'Ses principaux cartilages sont le thyroid, le cricoide, les arytenoides et l epiglotte.'),
              'Une atteinte recurrentielle unilaterale altere la voix ; une atteinte bilaterale peut fermer la glotte et obstruer completement la voie aerienne.',
            ], src('b00006')),
            row('Particularites pediatriques', [
              'Avant 10 ans, le larynx est plus haut, la langue proportionnellement plus volumineuse et l epiglotte plus grande et angulee.',
              'Le cricoide constitue la region la plus etroite des voies aeriennes du jeune enfant.',
            ], src('b00007')),
            row('Axe trachéobronchique', [
              'La trachée s’étend du cricoïde en C6 à la bifurcation bronchique située vers T4-T6 et mesure environ 15 cm chez l’adulte.',
              'La bronche souche gauche mesure environ 5 cm et chemine sous la crosse aortique puis au-dessus de l’œsophage.',
            ], src('b00008', 'b00009')),
          ],
        },
        {
          title: 'Evaluation preanesthesique',
          renderChunks: [2, 1, 1],
          rows: [
            row('Objectif', [
              'L evaluation depiste une ventilation ou une intubation potentiellement difficile afin de planifier l oxygenation et les solutions de secours.',
              n2('Elle associe trois sources d information.', 'Antecedents anesthesiques et chirurgicaux.', 'Examen des voies aeriennes.', 'Explorations ciblees si l anatomie le justifie.'),
            ], src('b00012')),
            row('Mallampati', [
              'La classe de Mallampati estime le volume de la langue par rapport a la cavite orale.',
              'Les classes III et IV predisent independamment une ventilation au masque difficile, sans suffire seules a conclure.',
            ], src('b00015'), IMAGES.mallampati),
            row('Examen combine', [
              n2('Une evaluation fiable croise plusieurs criteres.', 'Ouverture buccale et distances thyromentonniere et sternomentonniere.', 'Extension cervicale, retrognathie, obesite, barbe et protrusion mandibulaire.'),
              'La valeur predictive de chaque signe isole est limitee ; leur combinaison oriente le choix d une technique alternative.',
            ], src('b00016', 'b00017'), IMAGES.evaluation),
            row('Upper lip bite test', [
              'Mordre largement la levre superieure traduit une subluxation mandibulaire satisfaisante.',
              'L impossibilite de mordre la levre superieure signale une retrognathie non subluxable et une laryngoscopie directe potentiellement difficile.',
            ], src('b00018', 'b00024'), IMAGES.thyro),
          ],
        },
        {
          title: 'Profils a risque de desaturation rapide',
          renderChunks: [1, 3],
          rows: [
            row('Determinants', [
              'La duree d apnee tolerable depend de la reserve pulmonaire en oxygene, de la consommation d oxygene et du seuil de saturation accepte.',
              'Une CRF basse ou une consommation elevee raccourcit la marge de securite.',
            ], src('b00026', 'b00028')),
            row('Obesite', [
              n2('L obesite raccourcit la periode d apnee sans desaturation.', 'La CRF diminue, les alveoles se ferment plus tot et le shunt ainsi que la consommation d oxygene augmentent.'),
              'La période d’apnée moyenne passe d’environ 6,1 min à poids normal à 4,1 min en obésité modérée et 2,7 min en obésité morbide.',
            ], src('b00050')),
            row('Grossesse', [
              'La CRF diminue tandis que ventilation minute et consommation d oxygene augmentent : la fraction expiree monte vite, mais la desaturation survient plus tot.',
              'Chez certaines parturientes, la periode d apnee sans desaturation peut etre proche d une minute.',
            ], src('b00052')),
            row('Sujet age', [
              'Une ventilation minute plus faible peut prolonger le temps necessaire a la denitrogenation au-dela de trois minutes.',
              'Fuites liees a l edentation, moindre tonus facial et shunt intrapulmonaire peuvent compromettre la preoxygenation.',
            ], src('b00054')),
          ],
        },
      ],
    },
    {
      title: 'Preoxygener avant toute induction',
      sections: [
        {
          title: 'Physiologie et objectif mesurable',
          rows: [
            row('Reservoir pulmonaire', [
              n2('L oxygene inspire a 100 % augmente surtout la reserve contenue dans la CRF.', 'Le contenu sanguin progresse peu car l hemoglobine est deja presque totalement saturee en air ambiant.'),
              'Pour une CRF de 2 500 mL, la reserve mobilisable atteint environ 2 125 mL apres preoxygenation contre 150 mL en air.',
            ], src('b00026', 'b00027')),
            row('Periode d apnee sans desaturation', [
              'Elle s etend du debut de l apnee jusqu a une SpO2 inferieure a 90 %.',
              'Chez l adulte sain, elle atteint environ 6,9 min apres oxygene pur, 5 min a 80 %, 3,5 min a 60 % et 1 min en air.',
            ], src('b00028', 'b00029')),
            row('Critere d efficacite', [
              'Une SpO2 a 100 % ne prouve pas une denitrogenation complete.',
              n2('La fraction tele-expiratoire d oxygene est l indicateur pratique le plus utile.', 'Une cible superieure a 90 % traduit une fraction alveolaire proche de 95 % si le CO2 expire represente 5 %.'),
            ], src('b00034', 'b00036')),
            row('Indication large', [
              'Les difficultes imprevues justifient une preoxygenation chez tout patient soumis a une induction d anesthesie generale.',
              'Elle devient critique si le masque est contre-indique, si l intubation peut durer ou si le patient desature rapidement.',
            ], src('b00031')),
          ],
        },
        {
          title: 'Technique fiable',
          rows: [
            row('Trois conditions', [
              n2('Une preoxygenation echoue si le circuit n apporte pas reellement l oxygene pur.', 'Gaz frais insuffisant.', 'Fuite autour du masque.', 'Reinspiration de gaz expires.'),
              'Un debit frais de 10 a 12 L/min et une etancheite controlee limitent ces echecs.',
            ], src('b00038')),
            row('Respiration courante', [
              'Faire respirer normalement jusqu a une fraction tele-expiratoire d oxygene superieure a 90 %, habituellement en trois minutes.',
              'La cible mesuree prime sur une duree fixe ; une cible inaccessible fait rechercher une fuite.',
            ], src('b00041')),
            row('Technique rapide', [
              'Huit inspirations profondes en 60 secondes approchent l efficacite de trois minutes de respiration courante.',
              'Quatre inspirations en 30 secondes sont moins fiables ; la methode rapide exige cooperation et haut debit de gaz frais.',
            ], src('b00043')),
            row('Optimisation', [
              n2('Augmenter la CRF prolonge la marge d apnee.', 'Une position semi-assise peut aider, surtout chez l obese.', 'Une PEEP associee a une aide inspiratoire peut recruter le poumon.'),
              'La position assise peut toutefois majorer l hypotension et compliquer le geste d intubation.',
            ], src('b00046', 'b00048')),
          ],
        },
        {
          title: 'Adaptation aux terrains',
          rows: [
            row('Patient obese', [
              'Privilegier une preoxygenation mesuree, en position semi-assise si elle est hemodynamiquement tolerable.',
              n2('Si une methode rapide est retenue, choisir huit inspirations en 60 secondes.', 'La pression positive et la PEEP peuvent prolonger l apnee, hors risque d inhalation gastrique.'),
            ], src('b00050')),
            row('Parturiente', [
              'La fraction expiree d oxygene augmente rapidement, mais cette rapidite ne doit pas rassurer sur la duree d apnee.',
              'Si l urgence impose une methode rapide, huit inspirations en 60 secondes sont preferees.',
            ], src('b00052')),
            row('Patient age', [
              'La respiration a volume courant est plus efficace que quatre inspirations profondes en 30 secondes.',
              'Poursuivre au-dela de trois minutes si la cible expiree n est pas atteinte et corriger soigneusement les fuites.',
            ], src('b00054')),
            row('Risque d inhalation', [
              'La ventilation positive apres induction peut distendre l estomac ; elle n est pas retenue lorsque le risque d inhalation est eleve.',
              'L oxygenation reste prioritaire si la situation se degrade.',
            ], src('b00050', 'b00191')),
          ],
        },
      ],
    },
    {
      title: 'Oxygener sans franchir la glotte',
      sections: [
        {
          title: 'Ventilation au masque facial',
          renderChunks: [2, 2],
          rows: [
            row('Place centrale', [
              'Le masque assure l oxygenation avant un dispositif avance et constitue le premier moyen de sauvetage apres echec d intubation.',
              'Il ne protege pas de l inhalation ; maintenir idealement la pression insufflee sous 20 cmH2O limite l insufflation gastrique.',
            ], src('b00057')),
            row('Prise a une main', [
              n2('L etancheite repose sur le pouce et l index.', 'Les autres doigts tractent la mandibule sur ses structures osseuses, sans comprimer les tissus mous.'),
              'Le petit doigt place derriere la branche mandibulaire contribue a la subluxation.',
            ], src('b00066', 'b00067', 'b00068', 'b00069'), IMAGES.priseMasque),
            row('Predicteurs', [
              'Age superieur a 55 ans, obesite, barbe, edentation, syndrome d apnees du sommeil, Mallampati III-IV et protrusion limitee augmentent le risque.',
              'L anticipation organise les ressources sans condamner le patient a une ventilation effectivement difficile.',
            ], src('b00071', 'b00072')),
            row('Causes corrigibles', [
              n2('Rechercher avant d escalader.', 'Position ou obstruction du patient.', 'Taille ou etancheite du masque.', 'Profondeur anesthesique et rigidite ou spasme medicamenteux.'),
              'Le niveau d experience de l operateur participe aussi a la difficulte.',
            ], src('b00072')),
          ],
        },
        {
          title: 'Sauvetage de la ventilation faciale',
          renderChunks: [2, 3],
          rows: [
            row('Liberer la voie aerienne', [
              'Associer extension ou rotation prudente de la tete, chin lift ou jaw thrust et subluxation mandibulaire.',
              'Changer la taille du masque et approfondir l anesthesie si le contexte le permet.',
            ], src('b00074')),
            row('Canule oropharyngee', [
              'Elle maintient un passage pharynge lorsque la langue et les tissus mous obstruent la ventilation.',
              'Son emploi constitue l une des aides immediates d une ventilation faciale difficile.',
            ], src('b00074'), IMAGES.canuleOro),
            row('Canule nasopharyngee', [
              'Elle offre une voie complementaire pour maintenir la permeabilite pharyngee.',
              'Le choix entre les deux canules depend du patient et de la possibilite d utiliser chaque trajet.',
            ], src('b00074'), IMAGES.canuleNaso),
            row('Deux operateurs', [
              'Un operateur maintient le masque a deux mains et subluxe la mandibule ; le second comprime le ballon.',
              'Cette organisation ameliore simultanement l etancheite et la permeabilite pharyngee.',
            ], src('b00074'), IMAGES.deuxMains),
            row('Echec persistant', [
              'Si l oxygenation demeure impossible, envisager le reveil lorsque cela reste possible ou suivre immediatement l algorithme de voie aerienne difficile.',
              'La repetition des memes tentatives ne doit pas retarder un dispositif supraglottique ou un abord invasif.',
            ], src('b00084', 'b00154')),
          ],
        },
        {
          title: 'Dispositifs supraglottiques',
          renderChunks: [1, 1, 2],
          rows: [
            row('Deuxieme generation', [
              'Les dispositifs modernes ameliorent l etancheite et disposent souvent d une lumiere separee pour drainer le contenu gastrique.',
              'Ils restent supraglottiques et ne garantissent pas une protection complete contre l inhalation.',
            ], src('b00086', 'b00087'), IMAGES.nonInvasif),
            row('Insertion', [
              n2('L extremite suit le palais dur puis la paroi posterieure du pharynx.', 'Le tube est stabilise avant de retirer le doigt de guidage.'),
              'La mise en place demande moins d experience que l intubation et provoque moins de traumatismes et de variations hemodynamiques.',
            ], src('b00087', 'b00090', 'b00091'), IMAGES.insertionDsg),
            row('i-Gel', [
              'Son bourrelet plein non gonflable epouse l oropharynx sans pression de ballonnet.',
              'Son insertion est rapide, sa stabilité satisfaisante et son alignement glottique favorable.',
            ], src('b00095', 'b00096', 'b00097'), IMAGES.igel),
            row('Pont vers l intubation', [
              n2('Certains dispositifs de deuxieme generation acceptent une intubation a travers leur conduit.', 'Le maintien du dispositif preserve l oxygenation pendant la conversion.'),
              'Les facteurs de difficulté d’insertion supraglottique diffèrent de ceux de l’intubation ; en cas d’échec d’intubation, leur utilisation doit être précoce.',
            ], src('b00087', 'b00098', 'b00154')),
          ],
        },
      ],
    },
    {
      title: 'Intuber, verifier et extuber',
      sections: [
        {
          title: 'Preparation et materiel',
          rows: [
            row('Sonde tracheale', [
              'La sonde est transparente, radioopaque, sterile et raccordee au circuit par un connecteur externe standard de 15 mm.',
              'Le ballonnet distal assure l etancheite ; sa valve et son ballon temoin permettent le gonflage.',
            ], src('b00103', 'b00104')),
            row('Check-list avant tentative', [
              n2('Reunir les moyens d oxygener, intuber et confirmer.', 'Source d oxygene, ballon et aspiration fonctionnelle.', 'Sondes et lames de plusieurs tailles.', 'Capnographie, fixation, monitorage et aide competente.'),
              'Anticiper le materiel de secours avant la perte des reflexes protecteurs.',
            ], src('b00105', 'b00108'), IMAGES.intubation),
            row('Calibre et ballonnet', [
              'Chez l enfant, le calibre vise une fuite au-dessus de 20 a 25 cmH2O.',
              'Chez l adulte, un ballonnet grand volume et basse pression concilie etancheite et moindre pression tracheale.',
            ], src('b00108')),
            row('Lames', [
              'La lame courbe Macintosh numero 3 est la plus courante chez l adulte.',
              'La lame droite de Miller est souvent choisie avant six mois ; plusieurs formes et tailles doivent rester disponibles.',
            ], src('b00109')),
          ],
        },
        {
          title: 'Laryngoscopie directe',
          rows: [
            row('Position', [
              n2('La position de reniflement rapproche les axes oral, pharynge et larynge.', 'Elle associe une flexion cervicale d’environ 35 degrés et une extension d’environ 15 degrés.'),
              'Chez le patient obese, surélever la tete et le tronc optimise l axe de travail.',
            ], src('b00111'), IMAGES.laryngoscopie),
            row('Traction', [
              'Introduire la lame a droite, repousser la langue vers la gauche puis identifier vallécule et epiglotte.',
              'La traction suit un angle de 30 a 40 degres sans mouvement de bascule ni appui sur les dents.',
            ], src('b00112', 'b00115')),
            row('Exposition glottique', [
              'Les grades I-II de Cormack et Lehane exposent tout ou partie de la glotte ; les grades III-IV correspondent a une exposition defavorable.',
              'Le grade de vue ne predit pas parfaitement le passage de la sonde et ne se transpose pas directement a la videolaryngoscopie.',
            ], src('b00120', 'b00123', 'b00124', 'b00126'), IMAGES.cormack),
            row('Optimisation de la vue', [
              n2('Appliquer une manipulation laryngee externe si la vue est insuffisante.', 'Le BURP deplace le cartilage thyroid vers l arriere, le haut et la droite sous la main d un assistant.'),
              'Repositionner la tete ou changer de lame avant une nouvelle tentative.',
            ], src('b00131', 'b00158'), IMAGES.burp),
          ],
        },
        {
          title: 'Confirmation et alternatives',
          renderChunks: [2, 2],
          rows: [
            row('Profondeur', [
              'Faire progresser la sonde environ 2 cm apres le passage complet du ballonnet sous les cordes vocales.',
              'L extremite distale doit rester au moins 2 cm au-dessus de la carene pour eviter l intubation endobronchique.',
            ], src('b00127', 'b00128', 'b00129')),
            row('Confirmation', [
              n2('La capnographie est le critere central.', 'Exiger un CO2 expire continu et stable pendant trois ou quatre cycles.'),
              'Completer par l auscultation bilaterale ; radiographie ou fibroscopie tranche un doute persistant.',
            ], src('b00129', 'b00130')),
            row('Videolaryngoscopie', [
              'La camera ameliore la vue glottique et le succes au premier essai tout en limitant mobilisation cervicale et traumatismes.',
              'La vue indirecte impose souvent un mandrin preforme ou angule dans la sonde.',
            ], src('b00139', 'b00140'), IMAGES.video),
            row('Voie nasale', [
              'La sonde progresse par une narine puis vers la glotte sous laryngoscopie et guidage possible par pince de Magill.',
              'La preparation nasale associe lidocaine 3 %, phenylephrine 0,25 % et lubrification du ballonnet.',
            ], src('b00135', 'b00136', 'b00137')),
          ],
        },
        {
          title: 'Extubation planifiee',
          rows: [
            row('Prerequis', [
              n2('N extuber qu apres recuperation globale.', 'Conscience normale, stabilite hemodynamique et ventilation efficace.', 'Bloc neuromusculaire leve et normothermie.'),
              'Un echec d extubation expose a une reintubation plus urgente et plus dangereuse.',
            ], src('b00184')),
            row('Sequence', [
              'Oxygener quelques minutes, aspirer les secretions oropharyngees puis demander une inspiration profonde si possible.',
              'Degonfler le ballonnet et retirer la sonde afin de provoquer une toux passive.',
            ], src('b00184')),
            row('Voie aerienne difficile', [
              'Chez un patient difficile a intuber, remplacer temporairement la sonde par un mandrin long creux.',
              'Ce pont maintient un acces pour une reintubation urgente.',
            ], src('b00184', 'b00185', 'b00186')),
            row('Surveillance', [
              'La reussite immediate du retrait ne dispense pas d une surveillance de l oxygenation, de la ventilation et de la permeabilite laryngee.',
              'Le materiel de reintubation doit rester disponible chez le patient a risque.',
            ], src('b00184', 'b00185')),
          ],
        },
      ],
    },
    {
      title: 'Faire face a l echec et au risque d inhalation',
      sections: [
        {
          title: 'Intubation difficile : priorite a l oxygenation',
          renderChunks: [2, 2],
          rows: [
            row('Reconnaissance', [
              'Une intubation necessitant plusieurs essais est difficile ; d autres definitions associent grade III-IV, plus de dix minutes ou deux a trois tentatives optimales.',
              'La gravite de l evenement impose aide humaine, chariot dedie et algorithme connu.',
            ], src('b00151', 'b00153')),
            row('Trois situations', [
              n2('La conduite depend d abord de la possibilite d oxygener.', 'Difficulte prevue.', 'Echec imprevu avec ventilation possible.', 'Impossibilite d intuber et d oxygener.'),
              'Le dispositif supraglottique intervient precocement ; l abord tracheal ne doit pas etre retarde en CICO.',
            ], src('b00154'), IMAGES.algo),
            row('Apres le premier echec', [
              'Repositionner, optimiser la lame, utiliser un mandrin, demander une pression laryngee externe ou changer de lame.',
              'Chaque action vise a restaurer l oxygenation et a eviter l accumulation de traumatismes.',
            ], src('b00158')),
            row('Mandrins', [
              'Le mandrin court preforme guide la sonde ; les bougies longues peuvent servir d introducteur, d echangeur ou de pont d extubation.',
              'Un mandrin long doit figurer dans le chariot d intubation difficile.',
            ], src('b00162', 'b00163', 'b00164')),
          ],
        },
        {
          title: 'Techniques alternatives',
          renderChunks: [1, 3],
          rows: [
            row('Fibroscopie', [
              n2('Technique de reference pour une difficulte prevue, souvent chez un patient eveille.', 'Elle evite la mobilisation cervicale et peut traverser certains dispositifs supraglottiques.'),
              'Sa preparation et son apprentissage sont longs ; elle n est pas adaptee a une situation CICO.',
            ], src('b00168', 'b00169', 'b00170', 'b00171'), IMAGES.fibro),
            row('Stylet optique', [
              'La sonde montee sur le stylet progresse sous vision jusqu a la glotte ; les anneaux tracheaux confirment l acces tracheal.',
              'La technique tolere une ouverture buccale et une mobilisation cervicale limitees.',
            ], src('b00166')),
            row('Dispositif extraglottique', [
              'Masque larynge et combitube assurent une ventilation extraglottique sans constituer une intubation tracheale.',
              'Ils peuvent restaurer l oxygenation pendant la strategie de secours.',
            ], src('b00173')),
            row('Entrainement', [
              'La rarete de la situation ne dispense pas d une pratique reguliere de l algorithme et des gestes invasifs en simulation.',
              'Le choix entre techniques depend aussi du materiel disponible et de l experience reelle du praticien.',
            ], src('b00146', 'b00195', 'b00196')),
          ],
        },
        {
          title: 'Acces tracheal de sauvetage',
          renderChunks: [2, 2],
          rows: [
            row('Indication', [
              'Une obstruction laryngee ou sus-laryngee impossible a lever impose une cricothyroidotomie.',
              'En CICO, la restauration de l oxygenation par un acces tracheal devient prioritaire.',
            ], src('b00144', 'b00154', 'b00175'), IMAGES.crico),
            row('Ventilation transtracheale', [
              n2('Ponctionner la membrane cricothyroidienne puis connecter un catheter a une source d oxygene.', 'Utiliser un catheter de 14 ou 16 G relié de préférence à une source à haut débit.'),
              'Cette solution est rapide mais temporaire.',
            ], src('b00175', 'b00179')),
            row('Cricothyroidotomie', [
              'Une canule de type Melker ou une sonde de 5 a 6 mm permet oxygenation, ventilation et protection des voies aeriennes.',
              'La voie cricothyroidienne est plus rapide et plus simple qu une tracheotomie dans ce contexte.',
            ], src('b00179'), IMAGES.invasif),
            row('Complications', [
              n2('Surveiller les lesions liees a l abord et a l expiration.', 'Hemorragie thyroidienne, emphyseme sous-cutane et pneumothorax.', 'Un obstacle sus-glottique, un hematome cervical ou une anatomie anormale contre-indiquent l intubation retrograde.'),
              'Les faux trajets et les echecs justifient un entrainement technique repete.',
            ], src('b00179', 'b00182')),
          ],
        },
        {
          title: 'Sequence rapide et pression cricoidienne',
          rows: [
            row('Patients exposes', [
              'Risque majeur chez le patient non a jeun, en urgence, enceinte, occlus, avec conscience alteree, reflux actif ou hernie hiatale non traitee.',
              'La sequence rapide reduit l intervalle entre perte des reflexes et protection par le ballonnet tracheal.',
            ], src('b00188', 'b00191')),
            row('Gravite de l inhalation', [
              'Un volume superieur a 0,4 mL/kg, un liquide tres acide, des particules ou une contamination bacterienne aggravent l’inhalation.',
              'La prevention diminue le risque sans offrir de garantie absolue.',
            ], src('b00189', 'b00190')),
            row('Conduite', [
              n2('Administrer rapidement hypnotique et bloqueur neuromusculaire aux doses planifiees.', 'Eviter la ventilation manuelle qui insufflerait l estomac pendant l apnee, tant que l oxygenation le permet.'),
              'Preoxygener soigneusement avant la perte des reflexes.',
            ], src('b00191', 'b00031')),
            row('Pression cricoidienne', [
              'La manoeuvre de Sellick applique 30 N sur le cricoide contre le rachis cervical.',
              'Mal positionnee ou appliquee pendant toux et vomissements, elle peut gener la ventilation ou les voies aeriennes ; la relacher si elle compromet l oxygenation.',
            ], src('b00192', 'b00193')),
          ],
        },
      ],
    },
  ];

  return {
    matiere: 'Anesthésie-Réanimation',
    title: 'La gestion des voies aériennes supérieures',
    year: '2026-2027',
    coverSubtitle: 'Evaluation, oxygenation, intubation et strategies de sauvetage',
    imageOmissions: [
      {
        path: 'img/img_005.png',
        reason: 'duplicate',
        justification: 'Vue générale du masque facial redondante avec la prise fonctionnelle détaillée conservée dans la figure suivante.',
      },
      {
        path: 'img/img_006.png',
        reason: 'duplicate',
        justification: 'Seconde vue de préhension redondante avec les figures plus lisibles de ventilation à une puis à deux mains.',
      },
    ],
    sourceBlocks: [...new Set(parts.flatMap((part) => part.sections.flatMap((section) => section.rows.flatMap((entry) => entry.sourceBlocks))))],
    parts,
    synthesis: {
      chiffres: {
        headers: ['Repere', 'Valeur utile'],
        rows: [
          ['Cible de preoxygenation', 'Fraction tele-expiratoire d oxygene > 90 %'],
          ['Debit frais', '10 a 12 L/min'],
          ['Pression masque', 'Idealement < 20 cmH2O'],
          ['Confirmation tracheale', 'CO2 expire stable sur 3 a 4 cycles'],
          ['Position de sonde', 'Extremite au moins 2 cm au-dessus de la carene'],
          ['Sellick', 'Pression cricoidienne de 30 N'],
        ],
      },
      tables: [
        {
          title: 'Decider et preoxygener les terrains fragiles',
          headers: ['Situation ou terrain', 'Conduite structurante'],
          rows: [
            ['Puis-je ventiler au masque ?', 'Optimiser prise, position, canules et deux operateurs'],
            ['Puis-je placer un dispositif supraglottique ?', 'Le poser precocement apres echec d intubation'],
            ['Puis-je intuber ?', 'Limiter les essais et changer reellement de strategie'],
            ['Puis-je oxygener ?', 'En cas de reponse negative, acces cricothyroidien sans retard'],
            ['Difficulte prevue', 'Fibroscopie eveillee ou technique planifiee'],
            ['Vue directe defavorable', 'Optimisation, mandrin ou videolaryngoscope'],
            ['Echec avec oxygenation possible', 'Dispositif supraglottique et appel a l aide'],
            ['CICO', 'Cricothyroidotomie ou oxygenation transtracheale'],
            ['Obesite', 'CRF basse : position semi-assise et PEEP si absence de risque d inhalation'],
            ['Grossesse', 'Denitrogenation rapide mais apnee tres courte'],
            ['Age avance', 'Fuites frequentes et cible parfois atteinte apres plus de 3 min'],
            ['Estomac plein', 'Preoxygener sans distension gastrique puis sequence rapide'],
          ],
        },
      ],
      keyPoints: [
        'Evaluer plusieurs criteres : aucun signe clinique isole n exclut une difficulte.',
        'Preoxygener tous les patients et viser une fraction tele-expiratoire d oxygene superieure a 90 %.',
        'Devant un echec, maintenir l oxygenation avant de poursuivre l intubation.',
        'Utiliser precocement un dispositif supraglottique lorsque l intubation echoue.',
        'Confirmer la position tracheale par un CO2 expire continu et stable.',
        'Planifier l extubation difficile avec un acces de reintubation.',
        'En CICO, ne pas retarder l acces tracheal invasif.',
      ],
      eclair: [
        'Mallampati III-IV et protrusion mandibulaire limitee augmentent le risque de ventilation difficile.',
        'La SpO2 a 100 % ne garantit pas une preoxygenation complete.',
        'Respiration courante trois minutes ou huit inspirations profondes en 60 secondes.',
        'Pression faciale idealement inferieure a 20 cmH2O pour limiter l insufflation gastrique.',
        'Jaw thrust, canules et ventilation a deux operateurs corrigent une ventilation faciale difficile.',
        'Les dispositifs supraglottiques oxygenent sans proteger totalement de l inhalation.',
        'Le videolaryngoscope ameliore la vue mais necessite souvent un mandrin adapte.',
        'CO2 stable sur plusieurs cycles : preuve majeure d une intubation tracheale.',
        'La fibroscopie convient a la difficulte prevue, pas au CICO.',
        'L abord cricothyroidien est la solution de sauvetage lorsque l oxygenation est impossible.',
        'Une pression cricoidienne genant les echanges gazeux doit etre modifiee ou abandonnee.',
      ],
    },
  };
}

const fc = (recto, verso, ...sourceBlocks) => ({ recto, verso, sourceBlocks });

function buildFlashcards() {
  return [
    fc('Quelles sont les trois régions du pharynx ?', 'Nasopharynx, oropharynx et laryngopharynx.', 'b00004'),
    fc('Entre quelles structures s’étend l’oropharynx ?', 'De la base de la langue à l’épiglotte.', 'b00004'),
    fc('Pourquoi l’anesthésie topique de l’oropharynx est-elle privilégiée ?', 'Son innervation multiple rend une anesthésie régionale moins simple.', 'b00004'),
    fc('Quel est le rôle respiratoire essentiel du larynx ?', 'Il forme une valve protectrice des voies respiratoires.', 'b00006'),
    fc('Quels cartilages forment principalement le larynx ?', 'Thyroïde, cricoïde, aryténoïdes et épiglotte.', 'b00006'),
    fc('Quel nerf innerve les muscles intrinsèques du larynx ?', 'Le nerf laryngé récurrent, branche du vague.', 'b00006'),
    fc('Que peut provoquer une lésion récurrentielle unilatérale ?', 'Une corde vocale immobile près de la ligne médiane et une modification de la voix.', 'b00006'),
    fc('Que risque une atteinte bilatérale des nerfs récurrents ?', 'Une fermeture des cordes vocales avec obstruction complète.', 'b00006'),
    fc('Où se situe le larynx chez l’enfant de moins de dix ans ?', 'Plus haut que chez l’adulte, entre C3 et C4.', 'b00007'),
    fc('Quelle région est la plus étroite chez le jeune enfant ?', 'La région du cartilage cricoïde.', 'b00007'),
    fc('De quel niveau à quel niveau s’étend la trachée ?', 'Du cricoïde en C6 à la bifurcation bronchique vers T4-T6.', 'b00008'),
    fc('Quelle est la longueur approximative de la trachée adulte ?', 'Environ 15 cm, dont 5 cm au-dessus du manubrium.', 'b00008'),
    fc('Que doit rechercher l’évaluation des voies aériennes ?', 'Une difficulté potentielle de ventilation ou d’intubation.', 'b00012'),
    fc('Quelles données ouvre l’évaluation des voies aériennes ?', 'Antécédents, examen clinique et examens paracliniques ciblés.', 'b00012'),
    fc('Que mesure indirectement la classification de Mallampati ?', 'Le volume de la langue relativement à la cavité orale.', 'b00015'),
    fc('Quelles classes de Mallampati prédisent une ventilation difficile ?', 'Les classes III et IV.', 'b00015'),
    fc('Pourquoi faut-il combiner les signes d’examen des voies aériennes ?', 'Chaque signe isolé a une valeur prédictive limitée.', 'b00017'),
    fc('Quels éléments complètent Mallampati à l’examen ?', 'Ouverture buccale, distances mentonnières, cou, mandibule, barbe et obésité.', 'b00016'),
    fc('Que teste l’upper lip bite test ?', 'La capacité de protrusion ou de subluxation mandibulaire.', 'b00018', 'b00024'),
    fc('Que signifie l’impossibilité de mordre la lèvre supérieure ?', 'Une rétrognathie non subluxable et une laryngoscopie potentiellement difficile.', 'b00024'),
    fc('Quelle est la consommation d’oxygène de repos chez l’adulte ?', 'Environ 3 mL/kg/min, soit 200 à 250 mL/min.', 'b00026'),
    fc('Où la préoxygénation stocke-t-elle surtout l’oxygène ajouté ?', 'Dans les poumons, au sein de la capacité résiduelle fonctionnelle.', 'b00027'),
    fc('Pourquoi l’oxygène pur augmente-t-il peu le contenu sanguin en O2 ?', 'L’hémoglobine est déjà presque saturée en air et l’O2 est peu soluble.', 'b00027'),
    fc('Comment définit-on la période d’apnée sans désaturation ?', 'Du début de l’apnée jusqu’à une SpO2 inférieure à 90 %.', 'b00028'),
    fc('Quelle PASD obtient-on après O2 à 100 % chez l’adulte sain ?', 'Environ 6,9 minutes chez l’adulte sain.', 'b00028'),
    fc('Quelle PASD observe-t-on en air ambiant chez l’adulte sain ?', 'Environ une minute chez l’adulte sain.', 'b00029'),
    fc('Pourquoi une SpO2 à 100 % ne valide-t-elle pas la préoxygénation ?', 'Elle ne renseigne pas sur la dénitrogénation ni sur le stock pulmonaire.', 'b00036'),
    fc('Quel est le meilleur indicateur pratique de préoxygénation complète ?', 'La fraction télé-expiratoire d’oxygène.', 'b00036'),
    fc('Quelle cible de fraction télé-expiratoire d’oxygène faut-il viser ?', 'Une valeur supérieure à 90 %.', 'b00036', 'b00041'),
    fc('Pourquoi la PASD n’est-elle pas mesurée en pratique courante ?', 'Attendre la désaturation compromettrait volontairement la sécurité.', 'b00034'),
    fc('Chez quels patients la préoxygénation est-elle recommandée ?', 'Chez tous les patients avant l’induction d’une anesthésie générale.', 'b00031'),
    fc('Quelles fuites rendent une préoxygénation inefficace ?', 'Fuite au masque, gaz frais insuffisant ou réinspiration.', 'b00038'),
    fc('Quel débit frais utiliser pendant la préoxygénation ?', 'Environ 10 à 12 L/min.', 'b00038'),
    fc('Combien dure habituellement la préoxygénation en respiration courante ?', 'Environ trois minutes, sous contrôle de la fraction expirée.', 'b00041'),
    fc('Quelle technique rapide est comparable à trois minutes de respiration courante ?', 'Huit inspirations profondes en 60 secondes.', 'b00043'),
    fc('Pourquoi quatre inspirations profondes en 30 secondes sont-elles insuffisantes ?', 'Leur efficacité est inférieure à trois minutes de respiration courante.', 'b00043'),
    fc('Comment la position semi-assise améliore-t-elle la préoxygénation ?', 'Elle augmente la capacité résiduelle fonctionnelle.', 'b00046'),
    fc('Quel risque accompagne la préoxygénation en position assise ?', 'Une hypotension accrue et parfois une intubation moins aisée.', 'b00046'),
    fc('Comment la PEEP prolonge-t-elle la marge d’apnée ?', 'Elle recrute le poumon et accroît le réservoir pulmonaire d’oxygène.', 'b00048'),
    fc('Pourquoi l’obésité raccourcit-elle la PASD ?', 'CRF basse, atélectasies, shunt et consommation d’oxygène accrue.', 'b00050'),
    fc('Quelle PASD est rapportée dans l’obésité morbide ?', 'Environ 2,7 minutes pour un IMC moyen de 43 kg/m².', 'b00050'),
    fc('Quelle technique rapide choisir chez le patient obèse ?', 'Privilégier 8 inspirations profondes en 60 s plutôt que 4 en 30 s.', 'b00050'),
    fc('Quand éviter la pression positive après induction chez l’obèse ?', 'Lorsqu’un risque d’inhalation gastrique existe.', 'b00050'),
    fc('Pourquoi la femme enceinte désature-t-elle rapidement ?', 'Sa CRF baisse tandis que sa consommation d’oxygène augmente.', 'b00052'),
    fc('Quelle PASD minimale est décrite chez certaines parturientes ?', 'Elle peut être aussi courte qu’une minute.', 'b00052'),
    fc('Quelle méthode de préoxygénation privilégier chez le sujet âgé ?', 'La respiration à volume courant, parfois prolongée au-delà de trois minutes.', 'b00054'),
    fc('Quelles particularités faciales favorisent les fuites chez le sujet âgé ?', 'L’édentation et la perte de tonus des joues et de la mâchoire.', 'b00054'),
    fc('Quel est le rôle premier de la ventilation au masque ?', 'Maintenir l’oxygénation avant ou après l’échec d’un dispositif avancé.', 'b00057'),
    fc('La ventilation faciale protège-t-elle contre l’inhalation ?', 'Non, elle oxygène sans isoler la trachée du contenu pharyngé.', 'b00057'),
    fc('Quelle pression faciale limite l’insufflation gastrique ?', 'Une pression idéalement inférieure à 20 cmH2O.', 'b00057'),
    fc('Quels doigts assurent l’étanchéité du masque à une main ?', 'Le pouce et l’index.', 'b00066'),
    fc('Où placer les doigts qui tractent la mandibule ?', 'Sur l’os mandibulaire, jamais sur les tissus mous.', 'b00067', 'b00068'),
    fc('Quels patients risquent une ventilation faciale difficile ?', 'Sujet âgé, obèse, barbu, édenté, SAOS, Mallampati III-IV ou protrusion limitée.', 'b00071', 'b00072'),
    fc('Quelles causes médicamenteuses peuvent gêner la ventilation faciale ?', 'Rigidité induite par opioïde ou spasme massétérin sous succinylcholine.', 'b00072'),
    fc('Quelles manœuvres ouvrent la voie aérienne au masque ?', 'Chin lift, jaw thrust et subluxation mandibulaire.', 'b00074'),
    fc('Comment organiser une ventilation faciale à deux opérateurs ?', 'L’un tient le masque à deux mains, l’autre ventile au ballon.', 'b00074'),
    fc('Quelles canules facilitent la ventilation faciale ?', 'Les canules oropharyngée et nasopharyngée.', 'b00074'),
    fc('Que faire si la ventilation faciale reste impossible ?', 'Réveiller si possible ou suivre immédiatement l’algorithme de voie aérienne difficile.', 'b00084'),
    fc('Que distingue un dispositif supraglottique de deuxième génération ?', 'Une meilleure étanchéité et souvent un canal de drainage gastrique.', 'b00086'),
    fc('Un dispositif supraglottique protège-t-il totalement de l’inhalation ?', 'Non, son siège extraglottique ne constitue pas une protection complète.', 'b00087'),
    fc('Quel avantage hémodynamique offre un dispositif supraglottique ?', 'Il provoque moins de variations que l’intubation trachéale.', 'b00087'),
    fc('Quel rôle peut avoir un dispositif supraglottique dans l’intubation difficile ?', 'Rétablir l’oxygénation et parfois servir de conduit d’intubation.', 'b00087'),
    fc('Quel type de bourrelet possède l’i-Gel ?', 'Un bourrelet d’étanchéité plein et non gonflable.', 'b00095', 'b00096', 'b00097'),
    fc('Quelle largeur normalisée possède le raccord d’une sonde trachéale ?', 'Un diamètre externe de 15 mm.', 'b00103', 'b00104'),
    fc('Quels moyens doivent précéder toute tentative d’intubation ?', 'Oxygène, ventilation, aspiration, sondes, lames, monitorage, confirmation et aide.', 'b00105', 'b00108'),
    fc('Quel critère guide le calibre trachéal pédiatrique ?', 'Une fuite pour une pression supérieure à 20-25 cmH2O.', 'b00108'),
    fc('Quel ballonnet est privilégié chez l’adulte ?', 'Un ballonnet à basse pression et grand volume.', 'b00108'),
    fc('Quelle lame est la plus utilisée chez l’adulte ?', 'La lame courbe Macintosh numéro 3.', 'b00109'),
    fc('Quelle lame est souvent recommandée avant six mois ?', 'La lame droite de Miller.', 'b00109'),
    fc('Quels axes la position de reniflement cherche-t-elle à rapprocher ?', 'Les axes oral, pharyngé et laryngé.', 'b00111'),
    fc('Quels angles cervicaux sont décrits pour la laryngoscopie directe ?', 'Flexion de 35° par rapport au thorax et extension de 15°.', 'b00111'),
    fc('Dans quelle direction exercer la traction du laryngoscope ?', 'À 30-40° de l’horizontale, sans bascule sur les dents.', 'b00112', 'b00115'),
    fc('Que visualisent les grades I et II de Cormack-Lehane ?', 'Toute la glotte ou une partie suffisante pour une intubation généralement facile.', 'b00123', 'b00124'),
    fc('Que caractérisent les grades III et IV de Cormack-Lehane ?', 'Une glotte quasi invisible et une laryngoscopie difficile.', 'b00123', 'b00124'),
    fc('Pourquoi Cormack-Lehane ne suffit-il pas à prédire le passage de sonde ?', 'La qualité de vue et la difficulté d’avancée de la sonde ne sont pas parfaitement corrélées.', 'b00120', 'b00126'),
    fc('De combien avancer la sonde après le passage du ballonnet ?', 'Environ 2 cm sous les cordes vocales.', 'b00127'),
    fc('À quelle distance de la carène maintenir la pointe de sonde ?', 'Au moins 2 cm au-dessus de la carène.', 'b00128', 'b00129'),
    fc('Quel signe confirme le mieux la position trachéale ?', 'Un CO2 expiré continu et stable pendant trois ou quatre cycles.', 'b00129'),
    fc('Que complète l’auscultation après intubation ?', 'Elle vérifie la symétrie bilatérale de la ventilation.', 'b00129'),
    fc('Quels examens tranchent un doute sur la position de sonde ?', 'La radiographie thoracique ou la fibroscopie.', 'b00130'),
    fc('Sur quel cartilage appliquer le BURP ?', 'Sur le cartilage thyroïde.', 'b00131'),
    fc('Que signifie l’acronyme BURP ?', 'Pression laryngée vers l’arrière, le haut et la droite.', 'b00131'),
    fc('Comment préparer la muqueuse avant une intubation nasale ?', 'Lidocaïne 3 %, phényléphrine 0,25 % et lubrification de la sonde.', 'b00136', 'b00137'),
    fc('Quel est le principal avantage du vidéolaryngoscope ?', 'Une meilleure vue glottique et davantage de succès au premier essai.', 'b00139', 'b00140'),
    fc('Pourquoi un mandrin est-il souvent nécessaire en vidéolaryngoscopie ?', 'La vue est indirecte et la sonde doit suivre une courbure adaptée.', 'b00140'),
    fc('Quand une intubation est-elle difficile selon la définition clinique ASA citée ?', 'Lorsqu’elle nécessite plusieurs essais.', 'b00153'),
    fc('Quelles ressources exige une intubation difficile rare mais grave ?', 'Un chariot dédié, une aide disponible et un algorithme maîtrisé.', 'b00151'),
    fc('Quelles sont les trois situations d’intubation difficile ?', 'Prévue, imprévue avec ventilation possible, ou impossibilité d’intuber et d’oxygéner.', 'b00154'),
    fc('Quel dispositif utiliser précocement après un échec d’intubation ?', 'Un dispositif supraglottique.', 'b00154'),
    fc('Quel est l’objectif prioritaire après un premier échec d’intubation ?', 'Maintenir ou restaurer l’oxygénation.', 'b00158'),
    fc('Quelles corrections simples suivent un premier échec ?', 'Repositionner, changer la lame, utiliser un mandrin et optimiser le larynx.', 'b00158'),
    fc('À quoi sert un mandrin court ?', 'À préformer et guider la sonde vers la glotte.', 'b00162', 'b00163', 'b00164'),
    fc('À quoi sert une bougie longue lors d’une voie aérienne difficile ?', 'À introduire, échanger une sonde ou maintenir un pont d’extubation.', 'b00164'),
    fc('Quand un stylet optique est-il particulièrement utile ?', 'Si l’ouverture buccale ou la mobilisation cervicale est limitée.', 'b00166'),
    fc('Quel signe visuel confirme le passage trachéal au stylet optique ?', 'La visualisation des anneaux trachéaux.', 'b00166'),
    fc('Quelle est la technique de référence pour une intubation difficile prévue ?', 'La fibroscopie, souvent réalisée chez un patient éveillé.', 'b00168', 'b00170', 'b00171'),
    fc('Pourquoi la fibroscopie est-elle adaptée au rachis cervical fragile ?', 'Elle permet l’intubation sans mobilisation du rachis.', 'b00168', 'b00169'),
    fc('Pourquoi la fibroscopie n’est-elle pas adaptée au CICO ?', 'Sa préparation est longue alors que l’oxygénation invasive est urgente.', 'b00170'),
    fc('Où se situe la membrane cricothyroïdienne ?', 'Entre les cartilages thyroïde et cricoïde.', 'b00144'),
    fc('Quand réaliser une cricothyroïdotomie ?', 'Lorsqu’une obstruction laryngée ou sus-laryngée ne peut être levée.', 'b00144'),
    fc('De quoi dépend le choix d’une technique trachéale invasive ?', 'Du matériel, des ressources et de l’expérience du praticien.', 'b00146'),
    fc('Que signifie la situation CICO ?', 'Impossibilité d’intuber et impossibilité d’oxygéner.', 'b00145', 'b00154'),
    fc('Quel calibre de cathéter est cité pour l’oxygénation transtrachéale ?', 'Un cathéter 14 ou 16 G.', 'b00179'),
    fc('Quel diamètre de tube peut être utilisé en cricothyroïdotomie ?', 'Une sonde trachéale de 5 ou 6 mm.', 'b00179'),
    fc('Quelles complications menacent la ventilation transtrachéale ?', 'Hémorragie, emphysème sous-cutané et pneumothorax.', 'b00179'),
    fc('Quelles complications menacent une intubation rétrograde ?', 'Échec, hémorragie et faux trajet.', 'b00182'),
    fc('Quels obstacles contre-indiquent l’intubation rétrograde ?', 'Obstacle supraglottique, hématome cervical ou anatomie cervicale modifiée.', 'b00182'),
    fc('Quels critères précèdent une extubation sûre ?', 'Conscience, stabilité, ventilation efficace, décurarisation et normothermie.', 'b00184'),
    fc('Comment préparer immédiatement le retrait d’une sonde ?', 'Oxygéner, aspirer les sécrétions et demander une inspiration profonde.', 'b00184'),
    fc('Quel dispositif sécurise l’extubation d’un patient difficile ?', 'Un mandrin long creux laissé temporairement comme guide.', 'b00184', 'b00185', 'b00186'),
    fc('Quels patients relèvent d’une induction en séquence rapide ?', 'Ceux qui présentent un risque élevé d’inhalation gastrique.', 'b00188', 'b00191'),
    fc('Quels contextes urgents majorent le risque d’inhalation ?', 'Estomac plein, urgence, grossesse, occlusion ou conscience altérée.', 'b00188'),
    fc('Quels contextes programmés justifient aussi une séquence rapide ?', 'Reflux actif ou hernie hiatale documentée non traitée.', 'b00188'),
    fc('Quel volume inhalé constitue un facteur de gravité ?', 'Un volume supérieur à 0,4 mL/kg.', 'b00189'),
    fc('Quels contenus inhalés aggravent la détresse respiratoire ?', 'Liquide très acide, particules ou forte contamination bactérienne.', 'b00189'),
    fc('Quel est l’objectif temporel de la séquence rapide ?', 'Réduire le délai entre perte des réflexes et intubation protectrice.', 'b00191'),
    fc('Pourquoi évite-t-on la ventilation manuelle en séquence rapide ?', 'Pour limiter insufflation et distension gastriques avant intubation.', 'b00191'),
    fc('Comment se réalise la manœuvre de Sellick ?', 'Pression du cricoïde contre le rachis cervical.', 'b00192'),
    fc('Quelle force appliquer lors de la manœuvre de Sellick ?', 'Une pression cricoïdienne de 30 newtons.', 'b00192'),
    fc('Quand la pression cricoïdienne devient-elle dangereuse ?', 'Lors de toux ou vomissements, avec risque de rupture œsophagienne.', 'b00193'),
    fc('Que faire si Sellick compromet les échanges gazeux ?', 'Modifier ou relâcher la pression pour sécuriser la voie aérienne.', 'b00193'),
  ];
}

const ISOLATED_QCM_AUTHORED = [
  {
    enonce: 'Lors de l’examen préanesthésique, quels éléments augmentent la probabilité d’une gestion difficile des voies aériennes ?',
    format: 'qcm',
    sourceBlocks: src('b00012', 'b00015', 'b00016', 'b00017', 'b00071', 'b00072'),
    correction_generale: 'L’anticipation repose sur l’histoire anesthésique et l’association de plusieurs signes. Elle distingue le risque d’intubation de celui d’une ventilation faciale inefficace.',
    items: [
      { lettre: 'A', enonce: 'Une distance thyromentonnière normale suffit à exclure une intubation difficile.', is_correct: false, justification: 'Une mesure isolée ne neutralise ni une ouverture buccale limitée, ni une mobilité cervicale réduite, ni un antécédent difficile.' },
      { lettre: 'B', enonce: 'Un Mallampati IV est un signal de difficulté potentielle, sans valeur d’exclusion à lui seul.', is_correct: true, justification: 'La faible visibilité oropharyngée augmente le risque, mais sa performance isolée ne permet ni certitude ni exclusion.' },
      { lettre: 'C', enonce: 'Une intubation antérieure facile garantit la simplicité de toute anesthésie ultérieure.', is_correct: false, justification: 'Le terrain, la chirurgie et les conditions d’accès aux voies aériennes peuvent évoluer entre deux interventions.' },
      { lettre: 'D', enonce: 'L’absence d’examen clinique peut être compensée par une radiographie cervicale systématique.', is_correct: false, justification: 'L’imagerie reste ciblée ; elle ne remplace ni l’interrogatoire ni l’évaluation clinique effectuée au lit du patient.' },
      { lettre: 'E', enonce: 'L’association obésité–barbe doit faire anticiper une ventilation au masque moins fiable.', is_correct: true, justification: 'L’obésité favorise l’obstruction tandis que la barbe compromet l’étanchéité entre le masque et le visage.' },
    ],
  },
  {
    enonce: 'Quels résultats de l’examen mandibulaire justifient de préparer une alternative à la laryngoscopie directe ?',
    format: 'qcm',
    sourceBlocks: src('b00016', 'b00017', 'b00018', 'b00024'),
    correction_generale: 'Une mandibule peu mobile limite l’alignement et l’accès glottique. La protrusion, l’ouverture buccale et les autres critères doivent être interprétés ensemble.',
    items: [
      { lettre: 'A', enonce: 'L’impossibilité de mordre la lèvre supérieure traduit une subluxation mandibulaire limitée.', is_correct: true, justification: 'L’upper lip bite test explore précisément l’avancée de la mandibule par rapport au maxillaire supérieur.' },
      { lettre: 'B', enonce: 'Une rétrognathie non protrudable peut compliquer à la fois la ventilation faciale et l’exposition glottique.', is_correct: true, justification: 'Le recul mandibulaire favorise l’obstruction pharyngée et réduit l’espace nécessaire au déplacement de la langue.' },
      { lettre: 'C', enonce: 'Le test de morsure de la lèvre supérieure mesure principalement l’extension du rachis cervical.', is_correct: false, justification: 'La mobilité cervicale est évaluée séparément ; ce test porte sur la capacité de projection mandibulaire.' },
      { lettre: 'D', enonce: 'Une ouverture buccale très réduite reste compatible avec toutes les techniques d’intubation orale.', is_correct: false, justification: 'Le passage d’une lame, d’une sonde ou de certains dispositifs optiques nécessite un espace interincisif suffisant.' },
      { lettre: 'E', enonce: 'Plusieurs anomalies mandibulaires concordantes ont davantage de poids qu’un résultat isolé.', is_correct: true, justification: 'La sensibilité de chaque signe est limitée ; leur association renforce la probabilité d’une difficulté réelle.' },
    ],
  },
  {
    enonce: 'Avant une anesthésie générale programmée, quelles données contribuent utilement au plan de gestion des voies aériennes ?',
    format: 'qcm',
    sourceBlocks: src('b00012', 'b00016', 'b00017', 'b00105', 'b00108', 'b00151', 'b00200', 'b00201'),
    correction_generale: 'Le plan associe dossier antérieur, examen actuel et préparation matérielle. Il prévoit aussi la conduite à tenir si la technique de première intention échoue.',
    items: [
      { lettre: 'A', enonce: 'Les comptes rendus anesthésiques antérieurs doivent être recherchés lorsqu’une difficulté est rapportée.', is_correct: true, justification: 'Ils précisent souvent la technique réussie, le nombre de tentatives et les dispositifs qui ont été efficaces.' },
      { lettre: 'B', enonce: 'Une intubation autrefois facile garantit que la prochaine laryngoscopie sera simple.', is_correct: false, justification: 'Le terrain, la chirurgie, la position et les conditions opératoires peuvent évoluer entre deux anesthésies.' },
      { lettre: 'C', enonce: 'Le matériel d’aspiration peut être assemblé après l’induction si aucun reflux n’est connu.', is_correct: false, justification: 'L’aspiration fait partie du matériel immédiatement disponible avant la perte des réflexes protecteurs.' },
      { lettre: 'D', enonce: 'L’ouverture buccale, la protrusion mandibulaire et la mobilité cervicale orientent le choix technique.', is_correct: true, justification: 'Ces paramètres déterminent l’accès oral, l’alignement des axes et la faisabilité d’une laryngoscopie directe.' },
      { lettre: 'E', enonce: 'Une solution d’oxygénation de secours doit être prête avant la première tentative d’intubation.', is_correct: true, justification: 'La préparation anticipée évite une perte de temps si l’exposition glottique ou le passage de la sonde échoue.' },
    ],
  },
  {
    enonce: 'Quels constats cliniques font anticiper une ventilation faciale difficile après l’induction ?',
    format: 'qcm',
    sourceBlocks: src('b00015', 'b00016', 'b00024', 'b00071', 'b00072'),
    correction_generale: 'Les facteurs prédictifs associent défaut d’étanchéité et obstruction des voies aériennes supérieures. Leur cumul doit conduire à préparer aides pharyngées et ventilation à deux opérateurs.',
    items: [
      { lettre: 'A', enonce: 'Une barbe dense peut créer une fuite importante malgré une taille de masque adaptée.', is_correct: true, justification: 'Les poils interrompent le contact périphérique et empêchent parfois d’obtenir une pression positive efficace.' },
      { lettre: 'B', enonce: 'L’édentation modifie les reliefs faciaux sur lesquels repose le masque.', is_correct: true, justification: 'L’absence de support dentaire creuse les joues et rend l’appui du coussinet moins régulier.' },
      { lettre: 'C', enonce: 'Un syndrome d’apnées obstructives du sommeil augmente le risque d’obstruction pharyngée.', is_correct: true, justification: 'La collapsibilité des voies aériennes supérieures persiste et peut s’accentuer lors de la perte de tonus.' },
      { lettre: 'D', enonce: 'Un Mallampati III ou IV peut signaler une langue volumineuse relativement à la cavité orale.', is_correct: true, justification: 'Cette disproportion favorise la fermeture du passage pharyngé sous anesthésie et complique la ventilation.' },
      { lettre: 'E', enonce: 'Un âge supérieur à 55 ans s’ajoute aux facteurs de ventilation faciale difficile.', is_correct: true, justification: 'La diminution du tonus et les modifications anatomiques liées à l’âge augmentent la vulnérabilité à l’obstruction après induction.' },
    ],
  },
  {
    enonce: 'Comment interpréter les tests cliniques prédictifs d’une voie aérienne difficile ?',
    format: 'qcm',
    sourceBlocks: src('b00012', 'b00016', 'b00017', 'b00018'),
    correction_generale: 'Les tests cliniques ont une sensibilité imparfaite : ils orientent l’anticipation sans garantir une intubation facile. Un plan de secours reste nécessaire.',
    items: [
      { lettre: 'A', enonce: 'Un test négatif isolé suffit à exclure une intubation difficile imprévue.', is_correct: false, justification: 'La sensibilité imparfaite expose à des faux négatifs ; un résultat rassurant ne supprime donc pas le risque.' },
      { lettre: 'B', enonce: 'Un Mallampati favorable garantit une laryngoscopie directe facile.', is_correct: false, justification: 'Ce classement explore un seul aspect anatomique et conserve des faux négatifs.' },
      { lettre: 'C', enonce: 'Un examen actuel rassurant annule la valeur d’une intubation difficile antérieure.', is_correct: false, justification: 'Une difficulté déjà observée reste une information majeure pour préparer la prochaine stratégie.' },
      { lettre: 'D', enonce: 'Une radiographie cervicale systématique améliore le dépistage chez tous les patients.', is_correct: false, justification: 'L’imagerie répond à une indication ciblée et ne remplace pas l’évaluation clinique.' },
      { lettre: 'E', enonce: 'Les limites des tests imposent de conserver un plan d’oxygénation et de secours.', is_correct: true, justification: 'La difficulté imprévue reste possible ; la sécurité dépend donc aussi de l’organisation et du matériel disponibles.' },
    ],
  },
  {
    enonce: 'Quelles conditions permettent d’obtenir une préoxygénation réellement complète avant l’induction ?',
    format: 'qcm',
    sourceBlocks: src('b00031', 'b00036', 'b00038', 'b00041'),
    correction_generale: 'Une préoxygénation fiable exige oxygène pur, étanchéité du circuit, débit frais suffisant et dénitrogénation objectivée par la fraction télé-expiratoire.',
    items: [
      { lettre: 'A', enonce: 'Le masque doit limiter l’entrée d’air ambiant pendant toute la dénitrogénation.', is_correct: true, justification: 'Une fuite dilue l’oxygène inspiré et empêche le remplacement efficace de l’azote alvéolaire.' },
      { lettre: 'B', enonce: 'Une fraction télé-expiratoire d’oxygène supérieure à 90 % constitue une cible pratique.', is_correct: true, justification: 'Cette mesure renseigne directement sur la dénitrogénation pulmonaire obtenue avant la période d’apnée.' },
      { lettre: 'C', enonce: 'L’administration d’oxygène pur remplace progressivement l’azote contenu dans la capacité résiduelle fonctionnelle.', is_correct: true, justification: 'La dénitrogénation transforme le volume pulmonaire de fin d’expiration en réserve d’oxygène mobilisable pendant l’apnée.' },
      { lettre: 'D', enonce: 'Un débit frais de 10 à 12 L/min aide à prévenir la réinspiration des gaz expirés.', is_correct: true, justification: 'Le débit élevé renouvelle le circuit et maintient une concentration inspirée proche de l’oxygène pur.' },
      { lettre: 'E', enonce: 'Une FeO2 inférieure à 80 % impose de corriger une fuite, un débit insuffisant ou un défaut de coopération avant l’induction.', is_correct: true, justification: 'Cette valeur traduit une dénitrogénation incomplète et une réserve pulmonaire encore insuffisante.' },
    ],
  },
  {
    enonce: 'Quels paramètres déterminent la durée d’apnée tolérable après une préoxygénation ?',
    format: 'qcm',
    sourceBlocks: src('b00026', 'b00027', 'b00028', 'b00029', 'b00036', 'b00045', 'b00046'),
    correction_generale: 'La réserve dépend surtout de l’oxygène contenu dans la capacité résiduelle fonctionnelle et de sa vitesse de consommation. Les terrains à faible CRF désaturent plus tôt.',
    items: [
      { lettre: 'A', enonce: 'Une capacité résiduelle fonctionnelle plus grande augmente le réservoir alvéolaire disponible.', is_correct: true, justification: 'Après dénitrogénation, ce volume pulmonaire contient l’essentiel de l’oxygène mobilisable pendant l’apnée.' },
      { lettre: 'B', enonce: 'Une consommation élevée d’oxygène raccourcit le délai avant la désaturation.', is_correct: true, justification: 'Le stock constitué avant l’induction s’épuise plus vite lorsque les besoins métaboliques augmentent.' },
      { lettre: 'C', enonce: 'La grossesse et l’obésité peuvent réduire la marge de sécurité apnéique.', is_correct: true, justification: 'Ces situations diminuent la capacité résiduelle fonctionnelle et accélèrent souvent la chute de saturation.' },
      { lettre: 'D', enonce: 'La qualité de la dénitrogénation initiale conditionne la quantité d’oxygène disponible pendant l’apnée.', is_correct: true, justification: 'Une FeO2 élevée traduit le remplacement de l’azote alvéolaire et augmente le stock pulmonaire mobilisable.' },
      { lettre: 'E', enonce: 'Une FeO2 supérieure à 90 % indique que le réservoir pulmonaire a été correctement constitué.', is_correct: true, justification: 'La fraction expirée élevée témoigne d’une faible quantité d’azote résiduel au terme de la manœuvre.' },
    ],
  },
  {
    enonce: 'Quelles mesures optimisent la préoxygénation d’un adulte avant une anesthésie générale ?',
    format: 'qcm',
    sourceBlocks: src('b00038', 'b00041', 'b00043', 'b00046', 'b00048', 'b00050'),
    correction_generale: 'La technique standard reste trois minutes de ventilation courante sous oxygène pur. Des adaptations positionnelles, ventilatoires ou respiratoires répondent au terrain et à l’urgence.',
    items: [
      { lettre: 'A', enonce: 'Trois minutes de respiration courante avec un masque étanche constituent une méthode de référence.', is_correct: true, justification: 'Cette durée permet une dénitrogénation progressive lorsque le patient respire normalement dans un circuit riche en oxygène.' },
      { lettre: 'B', enonce: 'Huit inspirations profondes en 60 secondes peuvent convenir à un patient coopérant.', is_correct: true, justification: 'Cette alternative rapide procure une préoxygénation proche de la méthode lente dans de bonnes conditions.' },
      { lettre: 'C', enonce: 'Une position proclive peut augmenter la capacité résiduelle fonctionnelle chez l’obèse.', is_correct: true, justification: 'Le relèvement du thorax limite la compression diaphragmatique et augmente le volume pulmonaire de fin d’expiration.' },
      { lettre: 'D', enonce: 'Une PEEP peut recruter le poumon et prolonger la période d’apnée.', is_correct: true, justification: 'La pression expiratoire positive maintient davantage d’alvéoles ouvertes et accroît le stock d’oxygène.' },
      { lettre: 'E', enonce: 'La fraction télé-expiratoire d’oxygène doit être suivie pour objectiver l’efficacité de la manœuvre.', is_correct: true, justification: 'Une FeO2 supérieure à 90 % confirme mieux la dénitrogénation qu’une SpO2 déjà au plateau.' },
    ],
  },
  {
    enonce: 'Comment choisir entre respiration courante et inspirations profondes pour dénitrogéner les poumons ?',
    format: 'qcm',
    sourceBlocks: src('b00038', 'b00041', 'b00043'),
    correction_generale: 'Le choix dépend du temps disponible et de la coopération. La FeO2 reste le juge de l’efficacité, quelle que soit la séquence respiratoire retenue.',
    items: [
      { lettre: 'A', enonce: 'La respiration courante pendant trois minutes convient à une induction programmée.', is_correct: true, justification: 'Elle offre une méthode simple, reproductible et compatible avec une surveillance continue de la FeO2.' },
      { lettre: 'B', enonce: 'Huit respirations profondes sur 60 secondes représentent une option lorsque le délai est court.', is_correct: true, justification: 'Un patient coopérant renouvelle rapidement sa capacité résiduelle fonctionnelle grâce à ces grands volumes courants.' },
      { lettre: 'C', enonce: 'Quatre inspirations profondes en 30 secondes sont toujours équivalentes à la méthode de trois minutes.', is_correct: false, justification: 'Cette séquence courte est moins constante et devient insuffisante dans plusieurs terrains à risque.' },
      { lettre: 'D', enonce: 'Une technique par inspirations profondes suppose de comprendre et d’exécuter correctement la consigne.', is_correct: true, justification: 'Des efforts incomplets ou mal synchronisés réduisent le renouvellement alvéolaire et la qualité de la dénitrogénation.' },
      { lettre: 'E', enonce: 'Le résultat doit être contrôlé par la fraction télé-expiratoire plutôt que par la seule durée.', is_correct: true, justification: 'Le temps ne détecte ni fuite ni réinspiration, alors que la FeO2 renseigne sur le gaz réellement expiré.' },
    ],
  },
  {
    enonce: 'Quels pièges peuvent donner une fausse impression de préoxygénation efficace ?',
    format: 'qcm',
    sourceBlocks: src('b00036', 'b00038', 'b00041', 'b00043'),
    correction_generale: 'La saturation pulsée ne mesure pas la réserve alvéolaire. Une fuite, un débit insuffisant ou une technique mal exécutée peuvent laisser une FeO2 basse malgré une apparence rassurante.',
    items: [
      { lettre: 'A', enonce: 'Une SpO2 stable à 100 % peut masquer une dénitrogénation encore incomplète.', is_correct: true, justification: 'La saturation de l’hémoglobine atteint son plafond avant que l’azote soit totalement éliminé du poumon.' },
      { lettre: 'B', enonce: 'Une fuite périphérique permet l’entrée d’air même si le débitmètre affiche de l’oxygène pur.', is_correct: true, justification: 'Le mélange avec l’air ambiant abaisse la fraction inspirée et empêche d’atteindre la cible expiratoire.' },
      { lettre: 'C', enonce: 'Un faible débit frais peut favoriser la réinspiration à l’intérieur du circuit.', is_correct: true, justification: 'Le renouvellement incomplet des gaz maintient de l’azote et du dioxyde de carbone dans le mélange inspiré.' },
      { lettre: 'D', enonce: 'Un débit élevé ne compense pas durablement une fuite persistante autour du masque.', is_correct: true, justification: 'L’entrée d’air ambiant entretient l’azote alvéolaire malgré l’apport important d’oxygène frais.' },
      { lettre: 'E', enonce: 'Des inspirations profondes mal réalisées peuvent rendre la méthode rapide moins efficace.', is_correct: true, justification: 'La séquence dépend de la coopération ; des volumes insuffisants ne renouvellent pas correctement les alvéoles.' },
    ],
  },
  {
    enonce: 'Quelles actions améliorent immédiatement une ventilation au masque peu efficace ?',
    format: 'qcm',
    sourceBlocks: src('b00067', 'b00068', 'b00074', 'b00084'),
    correction_generale: 'La correction associe libération du pharynx et restauration de l’étanchéité : repositionnement, subluxation mandibulaire, canule et prise à deux mains sont combinés sans multiplier les insufflations inefficaces.',
    items: [
      { lettre: 'A', enonce: 'La subluxation mandibulaire peut dégager la langue de la paroi pharyngée postérieure.', is_correct: true, justification: 'Le jaw thrust projette la mandibule et les tissus qui lui sont attachés vers l’avant, rouvrant le passage aérien.' },
      { lettre: 'B', enonce: 'Une canule oropharyngée est utile chez un patient profondément anesthésié sans réflexe nauséeux.', is_correct: true, justification: 'Elle empêche l’affaissement de la langue et maintient une lumière entre la bouche et le pharynx.' },
      { lettre: 'C', enonce: 'La prise du masque à deux mains permet à un second opérateur d’assurer les insufflations.', is_correct: true, justification: 'La séparation des tâches améliore simultanément l’appui périphérique et la traction mandibulaire.' },
      { lettre: 'D', enonce: 'Les doigts doivent comprimer fortement les tissus mous sous le menton pour lever l’obstruction.', is_correct: false, justification: 'Cette pression repousse les tissus vers le pharynx ; l’appui doit porter sur le rebord osseux mandibulaire.' },
      { lettre: 'E', enonce: 'Un dispositif supraglottique doit être envisagé si les corrections manuelles ne rétablissent pas la ventilation.', is_correct: true, justification: 'Changer rapidement de moyen d’oxygénation évite la répétition d’insufflations inefficaces et l’aggravation de l’hypoxémie.' },
    ],
  },
  {
    enonce: 'Quels facteurs liés au patient exposent à une ventilation faciale difficile ?',
    format: 'qcm',
    sourceBlocks: src('b00015', 'b00016', 'b00024', 'b00071', 'b00072'),
    correction_generale: 'Le risque résulte soit d’une fuite au contact du visage, soit d’un collapsus pharyngé. Barbe, édentation, obésité, SAOS et faible protrusion peuvent se cumuler.',
    items: [
      { lettre: 'A', enonce: 'Une barbe épaisse compromet l’étanchéité du coussinet facial.', is_correct: true, justification: 'L’interface devient irrégulière et laisse échapper le gaz malgré une pression correcte du masque.' },
      { lettre: 'B', enonce: 'L’absence de dents peut réduire la surface d’appui et creuser les joues.', is_correct: true, justification: 'La perte des reliefs maxillaires rend difficile l’adaptation du masque sur le tiers inférieur du visage.' },
      { lettre: 'C', enonce: 'Une mandibule facilement protrudable est un facteur majeur d’obstruction au masque.', is_correct: false, justification: 'Une bonne subluxation facilite au contraire le dégagement de la langue et la traction des tissus pharyngés.' },
      { lettre: 'D', enonce: 'L’obésité associée à un SAOS augmente la collapsibilité des voies aériennes supérieures.', is_correct: true, justification: 'La réduction des volumes pulmonaires et le relâchement pharyngé rendent la ventilation plus vulnérable après induction.' },
      { lettre: 'E', enonce: 'Un Mallampati I permet d’écarter une fuite ou une obstruction pendant la ventilation faciale.', is_correct: false, justification: 'Ce test n’évalue ni tous les défauts d’étanchéité ni l’ensemble des mécanismes obstructifs.' },
    ],
  },
  {
    enonce: 'Comment limiter l’insufflation gastrique pendant la ventilation faciale ?',
    format: 'qcm',
    sourceBlocks: src('b00057', 'b00066', 'b00067', 'b00068', 'b00074'),
    correction_generale: 'Une voie pharyngée ouverte et un masque étanche permettent d’utiliser la pression minimale efficace. Maintenir la pression inspiratoire sous 20 cmH2O réduit le passage de gaz vers l’estomac.',
    items: [
      { lettre: 'A', enonce: 'La pression inspiratoire doit rester inférieure à 20 cmH2O lorsque l’oxygénation le permet.', is_correct: true, justification: 'Au-delà, la probabilité d’ouverture œsophagienne et de distension gastrique augmente nettement.' },
      { lettre: 'B', enonce: 'Une bonne étanchéité autorise des volumes efficaces sans majorer inutilement la pression.', is_correct: true, justification: 'Les fuites obligent sinon à augmenter le débit et la pression, ce qui favorise l’insufflation digestive.' },
      { lettre: 'C', enonce: 'Lever l’obstruction pharyngée diminue la résistance opposée au passage vers les poumons.', is_correct: true, justification: 'Le gaz suit plus facilement la voie respiratoire lorsque la mandibule et la langue sont correctement positionnées.' },
      { lettre: 'D', enonce: 'La pression minimale produisant une expansion thoracique visible doit être recherchée.', is_correct: true, justification: 'Limiter la pression délivrée réduit le passage de gaz dans l’œsophage tout en conservant une ventilation pulmonaire efficace.' },
      { lettre: 'E', enonce: 'Le masque facial isole la trachée et supprime le risque d’inhalation gastrique.', is_correct: false, justification: 'Aucun ballonnet sous-glottique ne sépare les voies respiratoires du contenu pharyngé ou gastrique.' },
    ],
  },
  {
    enonce: 'Quelle place la ventilation faciale occupe-t-elle dans une stratégie de voie aérienne difficile ?',
    format: 'qcm',
    sourceBlocks: src('b00057', 'b00074', 'b00084', 'b00154', 'b00158'),
    correction_generale: 'La ventilation au masque est une technique d’oxygénation et de transition. Son efficacité conditionne la possibilité de réveiller le patient ou de préparer une autre technique sans urgence hypoxique.',
    items: [
      { lettre: 'A', enonce: 'Un échec d’intubation impose d’abandonner la ventilation faciale même lorsqu’elle reste efficace.', is_correct: false, justification: 'Une ventilation faciale conservée constitue au contraire une voie d’oxygénation utile entre les tentatives.' },
      { lettre: 'B', enonce: 'L’appel d’aide peut attendre la perte complète de la ventilation faciale.', is_correct: false, justification: 'Le renfort et le matériel de secours doivent être mobilisés avant que la situation ne devienne hypoxique.' },
      { lettre: 'C', enonce: 'Son efficacité dispense de limiter le nombre de laryngoscopies traumatiques.', is_correct: false, justification: 'Les essais répétés peuvent créer œdème et saignement, puis rendre la ventilation elle-même impossible.' },
      { lettre: 'D', enonce: 'Son échec malgré une optimisation complète doit faire progresser rapidement dans l’algorithme.', is_correct: true, justification: 'Le dispositif supraglottique ou, en CICO, l’accès invasif ne doivent pas attendre une désaturation profonde.' },
      { lettre: 'E', enonce: 'Elle assure une protection équivalente à celle d’une sonde trachéale à ballonnet.', is_correct: false, justification: 'Le masque ne franchit pas la glotte et n’empêche pas le contenu digestif d’atteindre le larynx.' },
    ],
  },
  {
    enonce: 'Quels gestes constituent une prise correcte du masque facial à une main ?',
    format: 'qcm',
    sourceBlocks: src('b00066', 'b00067', 'b00068', 'b00069'),
    correction_generale: 'Le pouce et l’index plaquent le coussinet tandis que les autres doigts soulèvent la mandibule sur ses reliefs osseux. La main ne doit ni écraser les tissus mous ni servir d’appui sur le cou.',
    items: [
      { lettre: 'A', enonce: 'Le pouce et l’index contrôlent l’appui périphérique du masque.', is_correct: true, justification: 'Leur position en C répartit la pression sur le coussinet et limite les fuites autour du nez et de la bouche.' },
      { lettre: 'B', enonce: 'Les trois autres doigts tractent la mandibule vers le haut et l’avant.', is_correct: true, justification: 'Cette élévation contribue à la perméabilité pharyngée tout en rapprochant le visage du masque.' },
      { lettre: 'C', enonce: 'Les pulpes digitales doivent prendre appui sur les structures osseuses mandibulaires.', is_correct: true, justification: 'Le contact osseux transmet la traction sans enfoncer les tissus sous-mentonniers dans la voie aérienne.' },
      { lettre: 'D', enonce: 'Les doigts soulèvent le rebord osseux de la mandibule sans comprimer les tissus sous-mentonniers.', is_correct: true, justification: 'La traction mandibulaire libère le pharynx tandis qu’une pression sur les tissus mous repousserait la langue en arrière.' },
      { lettre: 'E', enonce: 'La pression appliquée sur le masque doit rester juste suffisante pour obtenir l’étanchéité.', is_correct: true, justification: 'Une force excessive déforme le coussinet et peut recréer une fuite au lieu d’améliorer la ventilation.' },
    ],
  },
  {
    enonce: 'Quelles caractéristiques distinguent les dispositifs supraglottiques modernes ?',
    format: 'qcm',
    sourceBlocks: src('b00086', 'b00087', 'b00095', 'b00096', 'b00097'),
    correction_generale: 'Les dispositifs récents améliorent l’étanchéité et offrent souvent un drainage gastrique. Ils restent extraglottiques, même lorsqu’ils servent de conduit à une intubation.',
    items: [
      { lettre: 'A', enonce: 'Une lumière gastrique séparée est fréquente sur les modèles de deuxième génération.', is_correct: true, justification: 'Elle permet le drainage ou l’aspiration en regard de l’œsophage sans occuper le conduit ventilatoire.' },
      { lettre: 'B', enonce: 'Certains modèles autorisent le passage secondaire d’une sonde trachéale.', is_correct: true, justification: 'Le dispositif peut alors maintenir l’oxygénation tout en servant de guide à l’intubation.' },
      { lettre: 'C', enonce: 'L’i-Gel possède un bourrelet anatomique qui ne nécessite pas de gonflage.', is_correct: true, justification: 'Son matériau souple épouse la région périlaryngée sans ballonnet pneumatique.' },
      { lettre: 'D', enonce: 'Les modèles de deuxième génération comportent souvent un canal de drainage gastrique distinct.', is_correct: true, justification: 'Cette lumière permet d’évacuer le contenu œsophagien sans utiliser le conduit ventilatoire principal.' },
      { lettre: 'E', enonce: 'Une meilleure pression d’étanchéité autorise plus facilement une ventilation contrôlée.', is_correct: true, justification: 'Les dispositifs modernes limitent davantage les fuites lorsque la pression inspiratoire doit être augmentée.' },
    ],
  },
  {
    enonce: 'Quels bénéfices et quelles limites faut-il attendre d’un masque laryngé ?',
    format: 'qcm',
    sourceBlocks: src('b00086', 'b00087', 'b00098'),
    correction_generale: 'Le masque laryngé s’insère rapidement, traumatise peu et stimule moins que la sonde trachéale. Sa simplicité ne doit pas faire surestimer sa protection contre l’inhalation.',
    items: [
      { lettre: 'A', enonce: 'Son apprentissage est généralement plus court que celui de l’intubation trachéale.', is_correct: true, justification: 'La mise en place ne demande ni visualisation directe de la glotte ni franchissement des cordes vocales.' },
      { lettre: 'B', enonce: 'La réponse hémodynamique à son insertion est souvent moins marquée.', is_correct: true, justification: 'La stimulation laryngotrachéale est moindre que lors d’une laryngoscopie suivie du passage d’une sonde.' },
      { lettre: 'C', enonce: 'Le risque de traumatisme des voies aériennes est habituellement réduit.', is_correct: true, justification: 'Le dispositif reste dans le pharynx et évite le contact direct avec la trachée et les cordes vocales.' },
      { lettre: 'D', enonce: 'Il protège de l’inhalation avec la même efficacité qu’un ballonnet trachéal.', is_correct: false, justification: 'L’étanchéité périlaryngée ne constitue pas une barrière hermétique sous la glotte.' },
      { lettre: 'E', enonce: 'Une intubation difficile n’implique pas nécessairement l’échec d’un masque laryngé.', is_correct: true, justification: 'Le dispositif se place au-dessus de la glotte et contourne certains obstacles propres à la laryngoscopie directe.' },
    ],
  },
  {
    enonce: 'Comment utiliser un dispositif supraglottique lors d’un échec d’intubation ?',
    format: 'qcm',
    sourceBlocks: src('b00087', 'b00154', 'b00158'),
    correction_generale: 'Après l’échec, le supraglottique vise d’abord à restaurer l’oxygénation. Une fois les échanges stabilisés, il permet de choisir réveil, intubation guidée ou autre stratégie.',
    items: [
      { lettre: 'A', enonce: 'La pose du dispositif doit être retardée jusqu’à l’apparition d’une hypoxémie profonde.', is_correct: false, justification: 'Attendre la désaturation réduit la marge de sécurité et favorise l’évolution vers une situation CICO.' },
      { lettre: 'B', enonce: 'Le retour d’un volume courant efficace permet de suspendre les laryngoscopies répétées.', is_correct: true, justification: 'La priorité redevient alors l’oxygénation stable, non l’obtention immédiate d’une sonde trachéale.' },
      { lettre: 'C', enonce: 'Un modèle compatible peut servir de conduit à une intubation guidée.', is_correct: true, justification: 'La sonde progresse à travers le canal tandis que le dispositif conserve un accès aux voies aériennes.' },
      { lettre: 'D', enonce: 'Il faut attendre la chute de SpO2 pour ne pas masquer la difficulté réelle.', is_correct: false, justification: 'Attendre expose inutilement le cerveau et le cœur à l’hypoxie sans améliorer la technique.' },
      { lettre: 'E', enonce: 'Sa pose correcte autorise à ignorer définitivement le risque d’inhalation.', is_correct: false, justification: 'La ventilation peut être excellente alors que la trachée reste imparfaitement isolée du pharynx.' },
    ],
  },
  {
    enonce: 'Quelles propriétés de l’i-Gel influencent sa mise en place et son utilisation ?',
    format: 'qcm',
    sourceBlocks: src('b00086', 'b00095', 'b00096', 'b00097'),
    correction_generale: 'L’i-Gel est un dispositif anatomique sans ballonnet gonflable, conçu pour une insertion rapide. Son canal gastrique améliore le drainage mais ne transforme pas le dispositif en sonde trachéale.',
    items: [
      { lettre: 'A', enonce: 'Son bourrelet d’étanchéité est constitué d’un matériau souple non gonflable.', is_correct: true, justification: 'La forme préétablie s’adapte aux reliefs périlaryngés sans contrôle de pression de ballonnet.' },
      { lettre: 'B', enonce: 'Le coussinet de l’i-Gel doit être gonflé avant chaque utilisation.', is_correct: false, justification: 'Son matériau souple est préformé et ne comporte pas de ballonnet pneumatique.' },
      { lettre: 'C', enonce: 'Le canal gastrique de l’i-Gel sert de conduit principal à la ventilation pulmonaire.', is_correct: false, justification: 'La ventilation utilise la lumière aérienne ; le canal séparé est destiné au drainage œsophagien.' },
      { lettre: 'D', enonce: 'Le coussinet doit recevoir de l’air jusqu’à disparition complète de toute fuite.', is_correct: false, justification: 'Il n’existe pas de ballonnet à gonfler ; forcer une injection endommagerait le dispositif.' },
      { lettre: 'E', enonce: 'Sa conception supprime toute possibilité de régurgitation autour du larynx.', is_correct: false, justification: 'Le drainage réduit certains risques, mais aucune barrière trachéale hermétique n’est créée.' },
    ],
  },
  {
    enonce: 'Quels points différencient une ventilation supraglottique d’une intubation trachéale ?',
    format: 'qcm',
    sourceBlocks: src('b00087', 'b00103', 'b00108', 'b00129'),
    correction_generale: 'Le supraglottique siège dans le pharynx et ventile sans franchir les cordes. La sonde trachéale place un ballonnet sous-glottique, offrant une protection et un contrôle plus complets.',
    items: [
      { lettre: 'A', enonce: 'Le dispositif supraglottique franchit les cordes vocales avant d’assurer l’étanchéité.', is_correct: false, justification: 'Il se place dans le pharynx au-dessus de la glotte et ne pénètre pas dans la trachée.' },
      { lettre: 'B', enonce: 'La sonde trachéale traverse les cordes vocales avant le gonflage du ballonnet.', is_correct: true, justification: 'Le ballonnet se situe sous la glotte et isole la lumière respiratoire lorsque sa pression est adaptée.' },
      { lettre: 'C', enonce: 'La capnographie reste utile pour surveiller la ventilation avec les deux techniques.', is_correct: true, justification: 'Le CO2 expiré confirme le passage du gaz alvéolaire et permet de suivre la continuité des échanges.' },
      { lettre: 'D', enonce: 'Le dispositif supraglottique protège de l’inhalation aussi complètement qu’une sonde trachéale à ballonnet.', is_correct: false, justification: 'L’absence de ballonnet sous-glottique laisse une protection moins complète contre le contenu gastrique.' },
      { lettre: 'E', enonce: 'Certains supraglottiques peuvent être conservés comme conduit pendant une intubation guidée.', is_correct: true, justification: 'Leur canal central aligne le matériel vers le larynx tout en maintenant une voie d’oxygénation.' },
    ],
  },
  {
    enonce: 'Quels contrôles attestent qu’une sonde se trouve dans la trachée à une profondeur adaptée ?',
    format: 'qcm',
    sourceBlocks: src('b00127', 'b00128', 'b00129', 'b00130'),
    correction_generale: 'La position trachéale est confirmée par un CO2 expiré persistant. L’auscultation bilatérale, le repère d’insertion et une pointe située au moins 2 cm au-dessus de la carène contrôlent la profondeur.',
    items: [
      { lettre: 'A', enonce: 'Un capnogramme stable pendant trois à quatre cycles confirme le passage trachéal.', is_correct: true, justification: 'La persistance du CO2 expiré distingue la ventilation alvéolaire d’une insufflation œsophagienne transitoire.' },
      { lettre: 'B', enonce: 'Une condensation visible dans la sonde suffit à exclure une intubation œsophagienne.', is_correct: false, justification: 'La buée est un signe non spécifique et ne remplace jamais une courbe capnographique durable.' },
      { lettre: 'C', enonce: 'Une auscultation symétrique recherche notamment une migration dans une bronche souche.', is_correct: true, justification: 'Une sonde trop avancée peut conserver du CO2 expiré tout en ne ventilant qu’un seul poumon.' },
      { lettre: 'D', enonce: 'L’extrémité distale doit rester au moins 2 cm au-dessus de la carène.', is_correct: true, justification: 'Cette marge absorbe les déplacements liés aux mouvements cervicaux et réduit l’intubation sélective.' },
      { lettre: 'E', enonce: 'La profondeur doit être recontrôlée après un mouvement important de la tête ou du cou.', is_correct: true, justification: 'La mobilisation cervicale peut déplacer l’extrémité de la sonde vers la carène ou vers les cordes vocales.' },
    ],
  },
  {
    enonce: 'Quelles règles rendent la laryngoscopie directe plus sûre et plus atraumatique ?',
    format: 'qcm',
    sourceBlocks: src('b00105', 'b00109', 'b00111', 'b00112', 'b00115'),
    correction_generale: 'La sécurité dépend du positionnement, de l’insertion contrôlée de la lame et d’une traction dans l’axe. Les dents ne servent jamais de levier, et l’oxygénation est rétablie entre les essais.',
    items: [
      { lettre: 'A', enonce: 'La position de reniflement facilite l’alignement des axes chez l’adulte sans contre-indication cervicale.', is_correct: true, justification: 'La flexion du cou associée à l’extension de la tête améliore l’accès visuel au larynx.' },
      { lettre: 'B', enonce: 'La lame Macintosh est avancée dans la vallécule avant la traction.', is_correct: true, justification: 'Sa pointe soulève indirectement l’épiglotte par mise en tension du ligament hyoépiglottique.' },
      { lettre: 'C', enonce: 'Le manche peut être basculé sur les incisives lorsque la glotte reste invisible.', is_correct: false, justification: 'Ce mouvement transforme les dents en point d’appui et expose aux fractures sans améliorer correctement l’axe.' },
      { lettre: 'D', enonce: 'La traction doit suivre un axe oblique vers le haut plutôt qu’un mouvement de levier.', is_correct: true, justification: 'Une force orientée à environ 30–40 degrés soulève les tissus en limitant les traumatismes dentaires.' },
      { lettre: 'E', enonce: 'Chaque tentative doit être interrompue assez tôt pour permettre une réoxygénation avant la désaturation.', is_correct: true, justification: 'Limiter la durée de laryngoscopie évite d’épuiser la réserve constituée pendant la préoxygénation.' },
    ],
  },
  {
    enonce: 'Quel matériel doit être prêt avant la perte des réflexes protecteurs ?',
    format: 'qcm',
    sourceBlocks: src('b00105', 'b00108', 'b00109', 'b00129', 'b00154'),
    correction_generale: 'L’équipement de première intention et de secours est vérifié avant l’induction : oxygène, aspiration, laryngoscope, sondes, contrôle du ballonnet, capnographie et dispositif d’oxygénation alternatif.',
    items: [
      { lettre: 'A', enonce: 'L’aspiration peut être recherchée seulement après la survenue d’une régurgitation.', is_correct: false, justification: 'Elle doit être fonctionnelle avant l’induction afin d’évacuer immédiatement sang, sécrétions ou contenu gastrique.' },
      { lettre: 'B', enonce: 'L’éclairage du laryngoscope peut être testé après l’installation de l’apnée.', is_correct: false, justification: 'Une panne doit être identifiée avant la perte des réflexes pour ne pas retarder le contrôle des voies aériennes.' },
      { lettre: 'C', enonce: 'Le ballonnet de chaque sonde prévue doit être testé avant utilisation.', is_correct: true, justification: 'Une fuite pneumatique empêcherait l’étanchéité et la protection trachéale après le passage des cordes.' },
      { lettre: 'D', enonce: 'Le capnographe peut être branché seulement si l’auscultation paraît douteuse.', is_correct: false, justification: 'La détection continue du CO2 constitue le contrôle majeur et doit être disponible pour toute intubation.' },
      { lettre: 'E', enonce: 'Le dispositif supraglottique de secours peut rester hors de la salle chez un patient sans facteur prédictif.', is_correct: false, justification: 'Une difficulté imprévue est possible ; le moyen de sauvetage doit être obtenu sans délai logistique.' },
    ],
  },
  {
    enonce: 'Comment interpréter la qualité de l’exposition glottique pendant une laryngoscopie ?',
    format: 'qcm',
    sourceBlocks: src('b00120', 'b00123', 'b00124', 'b00131', 'b00158', 'b00164'),
    correction_generale: 'La classification de Cormack-Lehane décrit ce qui est réellement visible. Une vue incomplète conduit à optimiser position, manipulation externe et introducteur plutôt qu’à forcer le passage.',
    items: [
      { lettre: 'A', enonce: 'La visibilité de la seule épiglotte correspond au grade I de Cormack-Lehane.', is_correct: false, justification: 'Le grade I expose toute la glotte ; l’épiglotte seule correspond à une exposition nettement plus difficile.' },
      { lettre: 'B', enonce: 'La seule épiglotte visible définit un grade III.', is_correct: true, justification: 'Dans ce grade, aucune partie de l’ouverture glottique n’est exposée malgré l’identification de l’épiglotte.' },
      { lettre: 'C', enonce: 'L’absence simultanée de glotte et d’épiglotte correspond au grade IV.', is_correct: true, justification: 'Cette exposition très défavorable ne fournit aucun repère laryngé direct.' },
      { lettre: 'D', enonce: 'Le grade III impose de poursuivre la traction jusqu’à obtenir une vue complète.', is_correct: false, justification: 'Une force excessive traumatise les tissus ; un changement de position, BURP, bougie ou vidéo est préférable.' },
      { lettre: 'E', enonce: 'La classification garantit à elle seule que la sonde franchira facilement le larynx.', is_correct: false, justification: 'La visibilité et la trajectoire du tube sont liées mais non équivalentes, notamment en vidéolaryngoscopie.' },
    ],
  },
  {
    enonce: 'Quels choix de sonde, de ballonnet et de lame sont cohérents chez un adulte ?',
    format: 'qcm',
    sourceBlocks: src('b00103', 'b00108', 'b00109', 'b00111'),
    correction_generale: 'Le matériel est adapté à la morphologie et au contexte. Chez l’adulte, une lame Macintosh 3 et un ballonnet grand volume–basse pression constituent des choix usuels, avec plusieurs tailles disponibles.',
    items: [
      { lettre: 'A', enonce: 'La lame Macintosh numéro 3 est couramment utilisée pour la laryngoscopie adulte.', is_correct: true, justification: 'Sa courbure et sa longueur conviennent à de nombreux adultes, sans constituer un choix obligatoire pour tous.' },
      { lettre: 'B', enonce: 'Le même diamètre de sonde doit être imposé à tous les adultes.', is_correct: false, justification: 'Le calibre dépend de la morphologie, du sexe et des contraintes d’accès à la glotte.' },
      { lettre: 'C', enonce: 'Un ballonnet de grand volume à basse pression limite la compression muqueuse.', is_correct: true, justification: 'La surface de contact répartit la pression nécessaire à l’étanchéité sur une zone trachéale plus large.' },
      { lettre: 'D', enonce: 'La lame de Miller est imposée à tout adulte obèse.', is_correct: false, justification: 'L’obésité conduit surtout à optimiser le positionnement ; le type de lame dépend de l’anatomie et de l’opérateur.' },
      { lettre: 'E', enonce: 'Un seul diamètre de sonde suffit puisque l’exposition prédit exactement le passage.', is_correct: false, justification: 'Une vue correcte n’exclut ni rétrécissement, ni trajectoire difficile, ni nécessité d’un tube de calibre différent.' },
    ],
  },
  {
    enonce: 'Après une première laryngoscopie infructueuse, quelles modifications sont pertinentes avant un nouvel essai ?',
    format: 'qcm',
    sourceBlocks: src('b00131', 'b00139', 'b00140', 'b00154', 'b00158', 'b00164'),
    correction_generale: 'Une seconde tentative ne répète pas la première : l’équipe réoxygène, appelle de l’aide, corrige la position et choisit une aide adaptée à la cause de l’échec.',
    items: [
      { lettre: 'A', enonce: 'Le deuxième essai doit reproduire exactement la position de tête du premier.', is_correct: false, justification: 'Une mauvaise hauteur d’appui ou un défaut de flexion-extension doit être corrigé avant une nouvelle tentative.' },
      { lettre: 'B', enonce: 'Une manipulation laryngée externe optimale peut être testée.', is_correct: true, justification: 'Le déplacement du cartilage thyroïde modifie l’axe de la glotte et peut révéler sa partie postérieure.' },
      { lettre: 'C', enonce: 'Le même matériel doit être réutilisé sans tenir compte de la cause de l’échec.', is_correct: false, justification: 'Une lame différente, une bougie ou un vidéolaryngoscope répondent mieux au problème observé.' },
      { lettre: 'D', enonce: 'L’appel à l’aide doit attendre l’échec de toutes les techniques personnelles de l’opérateur.', is_correct: false, justification: 'Un renfort précoce prépare l’oxygénation de secours et apporte une expertise avant la dégradation.' },
      { lettre: 'E', enonce: 'La même laryngoscopie doit être répétée sans réoxygéner tant que la SpO2 dépasse 90 %.', is_correct: false, justification: 'La marge peut s’effondrer rapidement ; chaque nouvel essai est précédé d’une oxygénation adéquate.' },
    ],
  },
  {
    enonce: 'Quels principes empêchent un échec d’intubation de devenir une hypoxémie grave ?',
    format: 'qcm',
    sourceBlocks: src('b00057', 'b00084', 'b00154', 'b00158', 'b00175', 'b00195'),
    correction_generale: 'La priorité est l’apport d’oxygène, non la présence immédiate d’une sonde. Limiter les essais, ventiler entre eux et avancer tôt vers le supraglottique prévient la situation CICO.',
    items: [
      { lettre: 'A', enonce: 'Une nouvelle tentative peut débuter sans réoxygénation si la précédente a été courte.', is_correct: false, justification: 'La réserve doit être restaurée entre les essais même avant une chute visible de la saturation.' },
      { lettre: 'B', enonce: 'Le nombre de laryngoscopies peut rester illimité tant que la sonde n’a pas franchi la glotte.', is_correct: false, justification: 'Les essais répétés créent œdème et saignement puis compromettent les autres moyens d’oxygénation.' },
      { lettre: 'C', enonce: 'Un dispositif supraglottique est posé précocement lorsque l’intubation échoue.', is_correct: true, justification: 'Cette voie extraglottique peut rétablir rapidement les échanges et interrompre l’escalade hypoxique.' },
      { lettre: 'D', enonce: 'La présence d’un vidéolaryngoscope autorise à négliger la préparation d’un accès invasif.', is_correct: false, justification: 'Aucun outil d’intubation ne garantit l’oxygénation ; une solution CICO reste indispensable.' },
      { lettre: 'E', enonce: 'Une saturation qui baisse justifie de prolonger la laryngoscopie pour gagner du temps.', is_correct: false, justification: 'La chute impose au contraire de cesser le geste et de restaurer immédiatement l’oxygénation.' },
    ],
  },
  {
    enonce: 'Quelles techniques conviennent à une intubation difficile prévue ?',
    format: 'qcm',
    sourceBlocks: src('b00139', 'b00140', 'b00166', 'b00168', 'b00169', 'b00170', 'b00171'),
    correction_generale: 'Une difficulté anticipée permet de préserver la ventilation spontanée et de choisir une technique optique maîtrisée. La fibroscopie éveillée est particulièrement adaptée lorsque l’induction ferait perdre une voie d’oxygénation fragile.',
    items: [
      { lettre: 'A', enonce: 'La fibroscopie éveillée permet de progresser sans supprimer d’emblée la respiration spontanée.', is_correct: true, justification: 'L’anesthésie topique et la coopération maintiennent les échanges pendant le guidage vers la trachée.' },
      { lettre: 'B', enonce: 'Un vidéolaryngoscope peut être choisi si l’ouverture buccale autorise le passage de sa lame.', is_correct: true, justification: 'La vision indirecte améliore l’exposition, mais l’accès oral et la trajectoire du tube doivent rester possibles.' },
      { lettre: 'C', enonce: 'Un stylet optique constitue une autre option entre des mains entraînées.', is_correct: true, justification: 'L’optique distale guide le dispositif vers la glotte tout en limitant certains mouvements cervicaux.' },
      { lettre: 'D', enonce: 'Le choix technique doit préserver une solution d’oxygénation si l’intubation planifiée échoue.', is_correct: true, justification: 'Une difficulté anticipée impose un plan de secours explicite avant toute perte de ventilation spontanée.' },
      { lettre: 'E', enonce: 'La fibroscopie est indiquée comme premier geste lorsqu’aucune technique n’oxygène un patient en CICO.', is_correct: false, justification: 'Sa préparation est trop lente dans cette urgence ; un accès cricothyroïdien doit restaurer l’oxygène.' },
    ],
  },
  {
    enonce: 'Quels usages peut-on faire d’un mandrin long dans une voie aérienne difficile ?',
    format: 'qcm',
    sourceBlocks: src('b00140', 'b00164', 'b00184', 'b00185', 'b00186'),
    correction_generale: 'La bougie sert de rail lorsque la glotte est peu visible, tandis qu’un échangeur creux peut maintenir un accès lors d’un changement ou d’une extubation difficile. Ces usages supposent une manipulation atraumatique.',
    items: [
      { lettre: 'A', enonce: 'Une bougie peut franchir une glotte partiellement visible avant le passage de la sonde.', is_correct: true, justification: 'Son faible diamètre et sa rigidité contrôlée facilitent l’accès dans une exposition de grade III.' },
      { lettre: 'B', enonce: 'Le tube trachéal peut ensuite être avancé sur le mandrin utilisé comme guide.', is_correct: true, justification: 'La bougie matérialise le trajet vers la trachée et évite de rechercher à nouveau l’orifice glottique.' },
      { lettre: 'C', enonce: 'Un échangeur creux peut conserver temporairement une voie de réintubation après extubation.', is_correct: true, justification: 'Le guide laissé en place offre un rail immédiat si une obstruction impose de remettre une sonde.' },
      { lettre: 'D', enonce: 'Le mandrin doit être poussé contre toute résistance afin de confirmer les anneaux trachéaux.', is_correct: false, justification: 'Forcer expose aux perforations ; toute résistance anormale impose d’interrompre la progression.' },
      { lettre: 'E', enonce: 'La présence d’un mandrin dispense de contrôler la position par capnographie.', is_correct: false, justification: 'Un guide peut emprunter un faux trajet ; seul le CO2 expiré persistant confirme la ventilation trachéale.' },
    ],
  },
  {
    enonce: 'Quelle place réserver à la vidéolaryngoscopie dans les difficultés d’intubation ?',
    format: 'qcm',
    sourceBlocks: src('b00120', 'b00126', 'b00139', 'b00140', 'b00158'),
    correction_generale: 'La caméra améliore souvent la vue glottique et le succès au premier essai, mais ne garantit pas la trajectoire du tube. Positionnement, mandrin préformé et stratégie d’oxygénation restent nécessaires.',
    items: [
      { lettre: 'A', enonce: 'La vidéolaryngoscopie exige le même alignement complet des axes qu’une vision directe.', is_correct: false, justification: 'La caméra distale permet d’observer la glotte sans obtenir une ligne de vue anatomique rectiligne.' },
      { lettre: 'B', enonce: 'Un mandrin préformé aide souvent la sonde à suivre la courbure de la lame.', is_correct: true, justification: 'Une excellente image ne suffit pas si le tube reste dirigé vers la paroi antérieure du pharynx.' },
      { lettre: 'C', enonce: 'La vidéolaryngoscopie garantit le succès au premier essai indépendamment de l’expérience.', is_correct: false, justification: 'La visualisation peut être meilleure, mais l’insertion de la lame et la trajectoire du tube restent techniques.' },
      { lettre: 'D', enonce: 'Une vue parfaite garantit que la sonde entrera sans difficulté dans la trachée.', is_correct: false, justification: 'La géométrie entre la bouche et la glotte peut rester angulée malgré une image complète.' },
      { lettre: 'E', enonce: 'Le vidéolaryngoscope remplace les solutions de ventilation et l’accès invasif de secours.', is_correct: false, justification: 'Il traite l’exposition glottique, mais n’assure pas l’oxygénation si l’intubation et la ventilation échouent.' },
    ],
  },
  {
    enonce: 'Quels repères et matériels concernent l’oxygénation transtrachéale de sauvetage ?',
    format: 'qcm',
    sourceBlocks: src('b00144', 'b00175', 'b00179'),
    correction_generale: 'La membrane cricothyroïdienne fournit l’accès antérieur le plus rapide. Un cathéter 14–16 G peut oxygéner temporairement, avant une sécurisation par canule ou petite sonde trachéale.',
    items: [
      { lettre: 'A', enonce: 'La membrane cricothyroïdienne se palpe entre les cartilages thyroïde et cricoïde.', is_correct: true, justification: 'Ce repère médian superficiel donne un trajet court vers la lumière respiratoire.' },
      { lettre: 'B', enonce: 'Un cathéter de calibre 14 ou 16 G peut servir à une oxygénation temporaire.', is_correct: true, justification: 'Son diamètre permet une insufflation d’oxygène en attendant un accès plus durable.' },
      { lettre: 'C', enonce: 'Une sonde trachéale standard de 8 mm franchit facilement toute ouverture cricothyroïdienne.', is_correct: false, justification: 'L’abord impose un petit calibre, habituellement une sonde de 5 ou 6 mm.' },
      { lettre: 'D', enonce: 'La ponction doit être effectuée latéralement pour éviter les cartilages laryngés.', is_correct: false, justification: 'La ligne médiane limite le risque vasculaire et conduit directement à la membrane recherchée.' },
      { lettre: 'E', enonce: 'Un cathéter fin nécessite un dispositif d’insufflation adapté à sa forte résistance.', is_correct: true, justification: 'Son faible diamètre limite le débit spontané et requiert une source d’oxygène pressurisée correctement réglée.' },
    ],
  },
  {
    enonce: 'Quelles complications faut-il rechercher après un abord cricothyroïdien ?',
    format: 'qcm',
    sourceBlocks: src('b00146', 'b00179', 'b00182'),
    correction_generale: 'Le geste peut provoquer saignement, faux trajet et diffusion gazeuse extratrachéale. Une expiration entravée sous haut débit expose particulièrement à l’emphysème et au pneumothorax.',
    items: [
      { lettre: 'A', enonce: 'Un emphysème sous-cutané cervical peut révéler une fuite ou une mauvaise position.', is_correct: true, justification: 'Le gaz diffusé hors de la lumière trachéale produit une crépitation palpable dans les tissus.' },
      { lettre: 'B', enonce: 'Un pneumothorax est possible lorsque l’expiration devient insuffisante sous pression.', is_correct: true, justification: 'L’accumulation gazeuse crée un barotraumatisme susceptible de rompre les structures pulmonaires.' },
      { lettre: 'C', enonce: 'Une hémorragie peut compliquer la ponction des tissus cervicaux.', is_correct: true, justification: 'Une trajectoire non médiane ou une dissection étendue peut léser les vaisseaux de la région.' },
      { lettre: 'D', enonce: 'Un faux trajet dans les tissus mous doit être recherché même sans hémorragie visible.', is_correct: true, justification: 'Un cathéter extratrachéal peut insuffler le cou et provoquer un emphysème sans reflux sanguin.' },
      { lettre: 'E', enonce: 'Une élévation des pressions avec asymétrie thoracique doit faire rechercher un pneumothorax.', is_correct: true, justification: 'Ces signes associent mauvaise expansion pulmonaire et obstacle à l’évacuation du gaz insufflé.' },
    ],
  },
  {
    enonce: 'Quand une situation impose-t-elle une cricothyroïdotomie sans nouvelle tentative par les voies supérieures ?',
    format: 'qcm',
    sourceBlocks: src('b00145', 'b00154', 'b00170', 'b00175'),
    correction_generale: 'Le CICO est défini par l’impossibilité d’intuber et d’oxygéner après échec des moyens non invasifs. L’accès cervical devient alors une urgence vitale qui ne doit plus être retardée.',
    items: [
      { lettre: 'A', enonce: 'La ventilation faciale reste impossible malgré repositionnement, canules et deux opérateurs.', is_correct: true, justification: 'L’échec d’une technique faciale optimisée supprime l’une des principales voies de sauvetage.' },
      { lettre: 'B', enonce: 'Le dispositif supraglottique correctement inséré ne délivre aucun volume efficace.', is_correct: true, justification: 'L’absence d’oxygénation extraglottique confirme l’épuisement des moyens non invasifs disponibles.' },
      { lettre: 'C', enonce: 'L’intubation a échoué et la SpO2 chute rapidement malgré les tentatives d’oxygénation.', is_correct: true, justification: 'La progression hypoxique impose d’ouvrir l’accès trachéal avant les lésions irréversibles.' },
      { lettre: 'D', enonce: 'Une ventilation faciale facile avec saturation stable impose néanmoins un abord immédiat.', is_correct: false, justification: 'Lorsque l’oxygénation est conservée, l’équipe dispose encore de temps pour une autre stratégie ou le réveil.' },
      { lettre: 'E', enonce: 'Une désaturation rapide en CICO renforce l’indication d’un accès cervical immédiat.', is_correct: true, justification: 'L’absence de ventilation par les voies supérieures ne laisse pas le temps de préparer une fibroscopie.' },
    ],
  },
  {
    enonce: 'Quels éléments guident le choix entre les techniques trachéales invasives de sauvetage ?',
    format: 'qcm',
    sourceBlocks: src('b00146', 'b00175', 'b00179'),
    correction_generale: 'Aucune méthode n’est supérieure dans toutes les situations. La vitesse d’exécution dépend du matériel présent, de l’expérience réelle et de la nécessité d’une oxygénation temporaire ou d’une voie ventilatoire durable.',
    items: [
      { lettre: 'A', enonce: 'La technique maîtrisée par l’opérateur est privilégiée si elle peut être réalisée immédiatement.', is_correct: true, justification: 'En urgence hypoxique, une méthode connue et disponible vaut mieux qu’un dispositif complexe non pratiqué.' },
      { lettre: 'B', enonce: 'La ponction par cathéter offre surtout une solution rapide et transitoire.', is_correct: true, justification: 'Elle apporte de l’oxygène mais nécessite souvent une conversion vers un accès ventilatoire plus stable.' },
      { lettre: 'C', enonce: 'L’ouverture chirurgicale permet l’introduction d’une petite sonde à ballonnet.', is_correct: true, justification: 'La voie ainsi obtenue autorise ventilation, expiration et protection plus complètes qu’un cathéter fin.' },
      { lettre: 'D', enonce: 'La technique immédiatement disponible et maîtrisée doit être privilégiée en situation CICO.', is_correct: true, justification: 'Le délai sans oxygène pèse davantage qu’une supériorité théorique entre deux dispositifs de sauvetage.' },
      { lettre: 'E', enonce: 'L’expérience acquise en simulation n’influence pas la réussite d’un geste rarement effectué.', is_correct: false, justification: 'L’entraînement améliore le repérage, l’enchaînement matériel et la capacité à agir sous forte contrainte.' },
    ],
  },
  {
    enonce: 'Quelles limites s’appliquent à l’intubation rétrograde ?',
    format: 'qcm',
    sourceBlocks: src('b00182'),
    correction_generale: 'L’intubation rétrograde reste lente et exposée à l’échec, au saignement et au faux trajet. Elle ne convient ni au CICO ni aux anatomies cervicales ou supraglottiques qui empêchent le passage du guide.',
    items: [
      { lettre: 'A', enonce: 'L’intubation rétrograde constitue la méthode la plus rapide lors d’un CICO avec désaturation profonde.', is_correct: false, justification: 'Le passage du guide puis de la sonde est trop lent face à une absence complète d’oxygénation.' },
      { lettre: 'B', enonce: 'Un hématome cervical déformant les repères constitue une contre-indication.', is_correct: true, justification: 'La ponction et le trajet deviennent imprévisibles, avec risque accru de saignement et de fausse route.' },
      { lettre: 'C', enonce: 'Une déformation cervicale n’altère ni les repères de ponction ni le trajet du guide.', is_correct: false, justification: 'Un hématome ou une anatomie modifiée augmente les risques de faux trajet et de lésion vasculaire.' },
      { lettre: 'D', enonce: 'Elle est la procédure de première intention lorsqu’aucune méthode n’oxygène le patient.', is_correct: false, justification: 'Sa lenteur la rend inadaptée au CICO, qui exige un accès cricothyroïdien immédiat.' },
      { lettre: 'E', enonce: 'Une anatomie cervicale modifiée n’a pas d’effet puisque le guide chemine dans la trachée.', is_correct: false, justification: 'La première étape est percutanée et dépend précisément de repères antérieurs fiables.' },
    ],
  },
  {
    enonce: 'Quels prérequis rendent une extubation raisonnablement sûre ?',
    format: 'qcm',
    sourceBlocks: src('b00184'),
    correction_generale: 'L’extubation n’est pas un simple retrait mécanique. Elle attend conscience suffisante, ventilation efficace, stabilité hémodynamique, normothermie et récupération neuromusculaire complète.',
    items: [
      { lettre: 'A', enonce: 'Le patient doit être capable de protéger ses voies aériennes et de tousser efficacement.', is_correct: true, justification: 'La récupération des réflexes limite l’obstruction et l’inhalation après disparition du ballonnet.' },
      { lettre: 'B', enonce: 'Une ventilation spontanée adaptée et une oxygénation stable sont nécessaires.', is_correct: true, justification: 'Le retrait supprime le contrôle ventilatoire direct et doit laisser une respiration autonome suffisante.' },
      { lettre: 'C', enonce: 'La décurarisation doit être complète et objectivée.', is_correct: true, justification: 'Un bloc résiduel altère la force inspiratoire, la toux et le tonus pharyngé.' },
      { lettre: 'D', enonce: 'La normothermie doit être obtenue avant le retrait de la sonde.', is_correct: true, justification: 'L’hypothermie prolonge les effets anesthésiques et retarde la récupération neuromusculaire.' },
      { lettre: 'E', enonce: 'Une toux efficace et des réflexes de protection laryngée doivent être présents.', is_correct: true, justification: 'Ces fonctions limitent l’obstruction et l’inhalation après la disparition de la protection trachéale.' },
    ],
  },
  {
    enonce: 'Comment sécuriser le retrait de sonde après une intubation difficile ?',
    format: 'qcm',
    sourceBlocks: src('b00103', 'b00184', 'b00185', 'b00186'),
    correction_generale: 'L’extubation difficile se déroule dans un environnement contrôlé avec réintubation préparée. Oxygénation, aspiration et guide d’échange peuvent réduire le risque de perdre définitivement l’accès trachéal.',
    items: [
      { lettre: 'A', enonce: 'Le matériel de réintubation doit rester monté et immédiatement utilisable.', is_correct: true, justification: 'Une obstruction post-extubation impose parfois de reprendre la trachée en quelques instants.' },
      { lettre: 'B', enonce: 'Un échangeur creux peut être laissé temporairement dans la trachée.', is_correct: true, justification: 'Il conserve un rail vers la lumière respiratoire après que la sonde principale a été retirée.' },
      { lettre: 'C', enonce: 'Les sécrétions sont aspirées avant le dégonflage du ballonnet.', is_correct: true, justification: 'Cette préparation limite leur passage vers le larynx et améliore la perméabilité après retrait.' },
      { lettre: 'D', enonce: 'L’extubation doit avoir lieu dans un environnement disposant d’aide et de matériel de réintubation.', is_correct: true, justification: 'Une difficulté de récupération impose de pouvoir restaurer rapidement une voie aérienne contrôlée.' },
      { lettre: 'E', enonce: 'Le retrait d’un échangeur de sonde dépend de la stabilité respiratoire et du risque de réintubation.', is_correct: true, justification: 'Une SpO2 normale immédiate ne suffit pas à exclure une obstruction secondaire.' },
    ],
  },
  {
    enonce: 'Dans quels contextes le risque gastrique impose-t-il une induction en séquence rapide ?',
    format: 'qcm',
    sourceBlocks: src('b00188', 'b00189', 'b00191'),
    correction_generale: 'La séquence rapide est indiquée lorsque le contenu gastrique menace les voies aériennes : urgence, estomac plein, grossesse, occlusion, altération de conscience ou reflux actif non traité.',
    items: [
      { lettre: 'A', enonce: 'Une occlusion intestinale avec vomissements constitue une situation à haut risque.', is_correct: true, justification: 'La stase et la distension gastriques rendent la régurgitation probable au moment de la perte des réflexes.' },
      { lettre: 'B', enonce: 'Une césarienne urgente après un repas récent justifie cette stratégie.', is_correct: true, justification: 'La grossesse et le caractère urgent cumulent deux facteurs majeurs d’inhalation.' },
      { lettre: 'C', enonce: 'Une altération de conscience supprime une partie de la protection laryngée.', is_correct: true, justification: 'La toux et la fermeture glottique peuvent être insuffisantes avant même l’administration des hypnotiques.' },
      { lettre: 'D', enonce: 'Un reflux actif non traité reste sans conséquence lors d’une chirurgie programmée.', is_correct: false, justification: 'La régurgitation demeure possible hors urgence et peut modifier la technique d’induction.' },
      { lettre: 'E', enonce: 'Une vidange gastrique retardée peut maintenir un risque d’inhalation malgré un jeûne horaire conforme.', is_correct: true, justification: 'La pathologie, l’urgence ou certains terrains rendent le contenu gastrique imprévisible.' },
    ],
  },
  {
    enonce: 'Quels principes réduisent le risque d’inhalation pendant une induction en séquence rapide ?',
    format: 'qcm',
    sourceBlocks: src('b00031', 'b00036', 'b00041', 'b00191', 'b00192', 'b00193'),
    correction_generale: 'La séquence rapide raccourcit la période sans réflexes protecteurs après une préoxygénation complète. Elle évite les insufflations gastriques inutiles et adapte la pression cricoïdienne à la ventilation réelle.',
    items: [
      { lettre: 'A', enonce: 'La préoxygénation doit être optimisée avant l’administration de l’hypnotique.', is_correct: true, justification: 'Elle permet de traverser l’apnée sans ventilation faciale tant que la saturation reste acceptable.' },
      { lettre: 'B', enonce: 'L’enchaînement hypnotique–curare–intubation minimise le temps sans protection trachéale.', is_correct: true, justification: 'Une paralysie rapide facilite le passage précoce de la sonde et le gonflage du ballonnet.' },
      { lettre: 'C', enonce: 'Les insufflations manuelles vigoureuses sont systématiques dès la perte de conscience.', is_correct: false, justification: 'Elles distendent l’estomac et sont évitées lorsqu’une apnée courte reste bien tolérée.' },
      { lettre: 'D', enonce: 'Une aspiration prête permet de réagir immédiatement à une régurgitation.', is_correct: true, justification: 'L’évacuation rapide du contenu pharyngé limite sa progression vers la glotte.' },
      { lettre: 'E', enonce: 'La pression cricoïdienne doit être maintenue même si elle rend l’oxygénation impossible.', is_correct: false, justification: 'Une manœuvre qui compromet les échanges doit être diminuée ou relâchée afin de sécuriser la voie aérienne.' },
    ],
  },
  {
    enonce: 'Comment adapter la pression cricoïdienne lorsqu’elle gêne la prise en charge ?',
    format: 'qcm',
    sourceBlocks: src('b00192', 'b00193'),
    correction_generale: 'La manœuvre de Sellick cible le cartilage cricoïde avec une force contrôlée. Elle n’est jamais dogmatique : vue glottique, ventilation et sécurité œsophagienne commandent sa réduction ou son arrêt.',
    items: [
      { lettre: 'A', enonce: 'Une vue glottique dégradée peut justifier de réduire progressivement la pression.', is_correct: true, justification: 'Le relâchement partiel peut restaurer l’axe laryngé tout en conservant une certaine compression.' },
      { lettre: 'B', enonce: 'La pression cricoïdienne doit être maintenue sans modification même si elle empêche toute oxygénation.', is_correct: false, justification: 'La manœuvre doit être relâchée ou ajustée lorsqu’elle compromet la ventilation ou la laryngoscopie.' },
      { lettre: 'C', enonce: 'La pression s’exerce sur le cartilage thyroïde pour fermer directement la glotte.', is_correct: false, justification: 'Le geste porte sur le cricoïde dirigé vers le rachis, non sur le cartilage thyroïde.' },
      { lettre: 'D', enonce: 'La force décrite après perte de conscience est proche de 30 newtons.', is_correct: true, justification: 'Cette intensité vise une compression efficace sans déformation cervicale excessive.' },
      { lettre: 'E', enonce: 'Un vomissement actif justifie d’augmenter la pression pour retenir le contenu gastrique.', is_correct: false, justification: 'La compression pendant l’effort expose à une rupture œsophagienne et doit être cessée.' },
    ],
  },
];

const DP_QCM_AUTHORED_LATE_CASES = [
  {
    label: 'Intubation difficile imprévue',
    vignette: '<p>Une femme de 49 ans sans critère prédictif majeur est anesthésiée pour une cholécystectomie. La ventilation au masque est facile, mais la première laryngoscopie directe ne montre que l’épiglotte. La SpO2 reste à 100 % et un assistant, un mandrin long, un vidéolaryngoscope et un masque laryngé sont présents.</p>',
    questions: [
      {
        enonce: 'Comment qualifier et interpréter l’exposition obtenue ?', format: 'qcm', sourceBlocks: src('b00120', 'b00123', 'b00124', 'b00127'),
        correction_generale: 'La seule épiglotte visible correspond au grade III de Cormack-Lehane. La ventilation facile maintient une marge pour réoxygéner et modifier la technique.',
        items: [
          { lettre: 'A', enonce: 'Il s’agit d’un grade III de Cormack-Lehane.', is_correct: true, justification: 'Ce grade montre l’épiglotte sans exposer l’ouverture glottique.' },
          { lettre: 'B', enonce: 'La situation correspond à un grade I puisque l’épiglotte est identifiée.', is_correct: false, justification: 'Le grade I exige une vue complète de la glotte.' },
          { lettre: 'C', enonce: 'La ventilation faciale efficace permet d’interrompre calmement la tentative.', is_correct: true, justification: 'L’oxygénation peut être restaurée avant toute nouvelle laryngoscopie.' },
          { lettre: 'D', enonce: 'Une intubation œsophagienne est déjà confirmée.', is_correct: false, justification: 'Aucune sonde n’a encore été passée dans cette vignette.' },
          { lettre: 'E', enonce: 'Une autre tentative doit comporter une modification concrète.', is_correct: true, justification: 'Répéter le même geste accroît le traumatisme sans améliorer l’exposition.' },
        ],
      },
      {
        newInformation: 'L’opérateur constate que la tête est insuffisamment fléchie et que la lame est trop courte.',
        enonce: 'L’opérateur constate que la tête est insuffisamment fléchie et que la lame est trop courte. Quelles modifications précèdent le deuxième essai ?', format: 'qcm', sourceBlocks: src('b00109', 'b00111', 'b00154', 'b00158'),
        correction_generale: 'La patiente est réoxygénée, la tête replacée en position de reniflement et une lame adaptée est choisie. L’aide est informée avant le nouvel essai.',
        items: [
          { lettre: 'A', enonce: 'Repositionner la tête en flexion cervicale avec extension adaptée.', is_correct: true, justification: 'La position de reniflement rapproche les axes oral et pharyngolaryngé.' },
          { lettre: 'B', enonce: 'Choisir une lame de longueur plus appropriée.', is_correct: true, justification: 'Une lame trop courte n’atteint pas correctement la vallécule.' },
          { lettre: 'C', enonce: 'Réoxygéner au masque avant la reprise.', is_correct: true, justification: 'La réserve doit être restaurée malgré une saturation encore normale.' },
          { lettre: 'D', enonce: 'Conserver exactement la position initiale pour comparer les essais.', is_correct: false, justification: 'La mauvaise installation constitue précisément une cause corrigeable.' },
          { lettre: 'E', enonce: 'Éloigner l’assistant afin de limiter les stimulations.', is_correct: false, justification: 'Une aide est utile pour la manipulation externe et le secours.' },
        ],
      },
      {
        newInformation: 'Après repositionnement, une partie postérieure de la glotte apparaît lorsque l’assistant mobilise le cartilage thyroïde.',
        enonce: 'Après repositionnement, une partie postérieure de la glotte apparaît lorsque l’assistant mobilise le cartilage thyroïde. Quel rôle joue cette manipulation ?', format: 'qcm', sourceBlocks: src('b00120', 'b00131', 'b00158'),
        correction_generale: 'La pression laryngée externe optimale améliore ici la vue glottique. Elle est ajustée par l’assistant sur indication de l’opérateur et ne doit pas être confondue avec Sellick.',
        items: [
          { lettre: 'A', enonce: 'La manœuvre BURP peut faire apparaître la commissure postérieure.', is_correct: true, justification: 'Le cartilage thyroïde est déplacé vers l’arrière, le haut et la droite.' },
          { lettre: 'B', enonce: 'L’opérateur doit guider l’assistant jusqu’à la meilleure position.', is_correct: true, justification: 'L’effet visuel varie immédiatement avec la direction de la pression.' },
          { lettre: 'C', enonce: 'Cette manipulation s’exerce nécessairement sur le cartilage cricoïde.', is_correct: false, justification: 'Le BURP mobilise le thyroïde, contrairement à la pression cricoïdienne.' },
          { lettre: 'D', enonce: 'L’amélioration obtenue peut faciliter le passage d’une bougie.', is_correct: true, justification: 'Une ouverture partielle suffit parfois à guider l’introducteur.' },
          { lettre: 'E', enonce: 'La pression doit être poursuivie si elle fait disparaître la glotte.', is_correct: false, justification: 'Elle est modulée afin de conserver l’exposition la plus favorable.' },
        ],
      },
      {
        newInformation: 'La bougie franchit la glotte sous contrôle, tandis que la ventilation entre les tentatives reste facile.',
        enonce: 'La bougie franchit la glotte sous contrôle, tandis que la ventilation entre les tentatives reste facile. Comment l’utiliser ?', format: 'qcm', sourceBlocks: src('b00158', 'b00164'),
        correction_generale: 'La bougie sert de rail : elle est stabilisée sans forcer, puis la sonde est avancée dessus. La ventilation facile reste disponible si le passage échoue.',
        items: [
          { lettre: 'A', enonce: 'Maintenir l’introducteur stable pendant l’avancée de la sonde.', is_correct: true, justification: 'Le retrait accidentel ferait perdre le trajet glottique acquis.' },
          { lettre: 'B', enonce: 'Faire coulisser le tube sur la bougie sans pousser contre une résistance.', is_correct: true, justification: 'Forcer expose à une lésion laryngée ou à un faux trajet.' },
          { lettre: 'C', enonce: 'Retirer la bougie avant que la sonde n’ait franchi les cordes.', is_correct: false, justification: 'Le guide doit rester en place jusqu’au passage trachéal du tube.' },
          { lettre: 'D', enonce: 'Prévoir le retour immédiat à la ventilation faciale en cas d’échec.', is_correct: true, justification: 'L’oxygénation demeure prioritaire sur la poursuite du rail.' },
          { lettre: 'E', enonce: 'Considérer la position trachéale comme confirmée par le seul franchissement.', is_correct: false, justification: 'La capnographie doit encore prouver une ventilation alvéolaire.' },
        ],
      },
      {
        newInformation: 'Une courbe de CO2 apparaît et persiste pendant quatre cycles, avec murmure vésiculaire bilatéral.',
        enonce: 'Une courbe de CO2 apparaît et persiste pendant quatre cycles, avec murmure vésiculaire bilatéral. Comment interpréter ces données ?', format: 'qcm', sourceBlocks: src('b00128', 'b00129'),
        correction_generale: 'Le capnogramme persistant confirme la trachée et l’auscultation bilatérale rend peu probable une intubation sélective. La profondeur et la fixation restent contrôlées.',
        items: [
          { lettre: 'A', enonce: 'Le CO2 continu confirme une intubation trachéale.', is_correct: true, justification: 'Quatre cycles réguliers témoignent d’échanges alvéolaires durables.' },
          { lettre: 'B', enonce: 'L’auscultation symétrique complète le contrôle de profondeur.', is_correct: true, justification: 'Elle recherche une ventilation des deux poumons après le passage.' },
          { lettre: 'C', enonce: 'La sonde doit être fixée après vérification de son repère.', is_correct: true, justification: 'La stabilité prévient une migration lors des mobilisations.' },
          { lettre: 'D', enonce: 'Une radiographie est obligatoire avant toute ventilation.', is_correct: false, justification: 'Les contrôles clinique et capnographique autorisent la prise en charge immédiate.' },
          { lettre: 'E', enonce: 'Le ballonnet peut rester dégonflé puisque le CO2 est présent.', is_correct: false, justification: 'L’étanchéité est nécessaire pour ventiler et protéger la trachée.' },
        ],
      },
      {
        newInformation: 'Après mobilisation de la patiente, le murmure vésiculaire droit prédomine et la pression inspiratoire augmente.',
        enonce: 'Après mobilisation de la patiente, le murmure vésiculaire droit prédomine et la pression inspiratoire augmente. Comment réagir ?', format: 'qcm', sourceBlocks: src('b00128', 'b00129', 'b00130'),
        correction_generale: 'La migration endobronchique droite est probable. La profondeur est vérifiée, la sonde retirée prudemment puis l’auscultation et les pressions sont réévaluées.',
        items: [
          { lettre: 'A', enonce: 'Suspecter une progression de la sonde dans la bronche droite.', is_correct: true, justification: 'L’asymétrie apparue après mobilisation est typique d’une intubation sélective.' },
          { lettre: 'B', enonce: 'Retirer progressivement la sonde sous ventilation contrôlée.', is_correct: true, justification: 'La pointe doit revenir au moins deux centimètres au-dessus de la carène.' },
          { lettre: 'C', enonce: 'Réausculter les deux poumons après la correction.', is_correct: true, justification: 'Le retour d’une symétrie valide l’effet du repositionnement.' },
          { lettre: 'D', enonce: 'Avancer davantage la sonde pour diminuer la pression.', is_correct: false, justification: 'Cette action aggraverait la ventilation unipulmonaire.' },
          { lettre: 'E', enonce: 'Écarter la migration parce que le CO2 reste présent.', is_correct: false, justification: 'Une sonde endobronchique conserve un capnogramme malgré la mauvaise profondeur.' },
        ],
      },
      {
        newInformation: 'En fin d’intervention, la patiente est stable mais l’équipe juge qu’une réintubation urgente serait difficile.',
        enonce: 'En fin d’intervention, la patiente est stable mais l’équipe juge qu’une réintubation urgente serait difficile. Comment planifier l’extubation ?', format: 'qcm', sourceBlocks: src('b00184', 'b00185', 'b00186'),
        correction_generale: 'Le retrait attend la récupération complète et se déroule avec matériel prêt. Un échangeur creux peut préserver l’accès trachéal pendant la phase à risque.',
        items: [
          { lettre: 'A', enonce: 'Vérifier conscience, normothermie et décurarisation.', is_correct: true, justification: 'Ces critères réduisent le risque d’échec respiratoire après retrait.' },
          { lettre: 'B', enonce: 'Aspirer les sécrétions avant de dégonfler le ballonnet.', is_correct: true, justification: 'Le geste limite leur descente vers le larynx.' },
          { lettre: 'C', enonce: 'Envisager un échangeur de sonde temporaire.', is_correct: true, justification: 'Il fournit un rail immédiat si une réintubation devient nécessaire.' },
          { lettre: 'D', enonce: 'Éloigner le vidéolaryngoscope après le réveil.', is_correct: false, justification: 'Le matériel ayant permis l’intubation doit rester disponible.' },
          { lettre: 'E', enonce: 'Extuber dans une zone sans assistance pour éviter les stimulations.', is_correct: false, justification: 'Une voie difficile exige au contraire un environnement contrôlé.' },
        ],
      },
    ],
  },
  {
    label: 'Obstruction laryngée et CICO',
    vignette: '<p>Un homme de 63 ans opéré récemment du cou développe un hématome compressif et une détresse respiratoire. Après induction de sauvetage, ni le masque facial optimisé, ni la laryngoscopie, ni le dispositif supraglottique ne permettent une oxygénation efficace. La membrane cricothyroïdienne a été repérée et un kit d’accès invasif est ouvert.</p>',
    questions: [
      {
        enonce: 'Quels éléments définissent la gravité immédiate de cette situation ?', format: 'qcm', sourceBlocks: src('b00145', 'b00154', 'b00175'),
        correction_generale: 'L’échec conjoint de l’intubation, du masque facial optimisé et du dispositif supraglottique définit un CICO. L’obstruction cervicale rend toute temporisation particulièrement dangereuse.',
        items: [
          { lettre: 'A', enonce: 'L’intubation n’a pas permis de contrôler la voie aérienne.', is_correct: true, justification: 'La glotte n’est pas accessible malgré la tentative de sauvetage.' },
          { lettre: 'B', enonce: 'Le dispositif supraglottique ne restaure pas l’oxygénation.', is_correct: true, justification: 'La principale voie extraglottique de secours est également en échec.' },
          { lettre: 'C', enonce: 'L’hématome crée une obstruction évolutive des voies supérieures.', is_correct: true, justification: 'La compression peut rapidement devenir complète et irréversible.' },
          { lettre: 'D', enonce: 'La situation reste bénigne tant qu’un kit invasif est présent.', is_correct: false, justification: 'La disponibilité du matériel ne fournit aucun oxygène sans réalisation du geste.' },
          { lettre: 'E', enonce: 'Une nouvelle fibroscopie prolongée constitue la priorité.', is_correct: false, justification: 'Le CICO impose un accès trachéal plus rapide.' },
        ],
      },
      {
        newInformation: 'La SpO2 chute à 78 % malgré une tentative optimisée de ventilation supraglottique.',
        enonce: 'La SpO2 chute à 78 % malgré une tentative optimisée de ventilation supraglottique. Quelle décision ne doit plus être retardée ?', format: 'qcm', sourceBlocks: src('b00144', 'b00154', 'b00175'),
        correction_generale: 'La cricothyroïdotomie doit être réalisée immédiatement. Ni nouvelle laryngoscopie ni attente d’un expert ne sont compatibles avec cette hypoxémie.',
        items: [
          { lettre: 'A', enonce: 'Ouvrir l’accès cricothyroïdien déjà repéré.', is_correct: true, justification: 'Il s’agit désormais de la seule voie rapide vers la trachée.' },
          { lettre: 'B', enonce: 'Poursuivre les essais supraglottiques jusqu’à une SpO2 inférieure à 60 %.', is_correct: false, justification: 'Le dispositif optimisé échoue et le délai aggrave les lésions hypoxiques.' },
          { lettre: 'C', enonce: 'Demander simultanément du renfort sans suspendre le geste.', is_correct: true, justification: 'L’aide prépare ventilation, fixation et traitement des complications.' },
          { lettre: 'D', enonce: 'Attendre une trachéotomie formelle par un chirurgien ORL.', is_correct: false, justification: 'La cricothyroïdotomie est plus rapide dans cette urgence vitale.' },
          { lettre: 'E', enonce: 'Cesser les nouvelles tentatives par les voies supérieures.', is_correct: true, justification: 'Elles consomment du temps sans perspective réaliste d’oxygénation.' },
        ],
      },
      {
        newInformation: 'Le cartilage thyroïde et le cricoïde sont palpables malgré l’hématome latéral.',
        enonce: 'Le cartilage thyroïde et le cricoïde sont palpables malgré l’hématome latéral. Quels repères guident l’accès ?', format: 'qcm', sourceBlocks: src('b00144'),
        correction_generale: 'La membrane cricothyroïdienne se situe sur la ligne médiane entre thyroïde et cricoïde. Le trajet médian évite la déformation latérale et limite le risque vasculaire.',
        items: [
          { lettre: 'A', enonce: 'La membrane recherchée se trouve entre les deux cartilages.', is_correct: true, justification: 'Elle offre un passage direct et superficiel vers la lumière respiratoire.' },
          { lettre: 'B', enonce: 'La ligne médiane est privilégiée malgré l’hématome latéral.', is_correct: true, justification: 'Elle fournit les repères les plus fiables et moins de structures vasculaires.' },
          { lettre: 'C', enonce: 'La ponction doit viser la masse latérale la plus saillante.', is_correct: false, justification: 'L’hématome déforme les tissus et ne constitue pas un repère trachéal.' },
          { lettre: 'D', enonce: 'Le cricoïde est situé sous la membrane.', is_correct: true, justification: 'La membrane relie son bord supérieur au cartilage thyroïde.' },
          { lettre: 'E', enonce: 'Le cartilage thyroïde doit être traversé directement.', is_correct: false, justification: 'Le cartilage est évité au profit de l’espace membraneux.' },
        ],
      },
      {
        newInformation: 'La membrane est ouverte et l’équipe dispose d’une canule Melker ainsi que d’une sonde de 5 mm.',
        enonce: 'La membrane est ouverte et l’équipe dispose d’une canule Melker ainsi que d’une sonde de 5 mm. Quelles options restaurent l’oxygénation ?', format: 'qcm', sourceBlocks: src('b00175', 'b00179'),
        correction_generale: 'La canule permet un accès percutané rapide ; une sonde de 5 mm offre une ventilation plus conventionnelle. Le choix dépend de la maîtrise sans retarder l’oxygène.',
        items: [
          { lettre: 'A', enonce: 'La canule peut fournir une oxygénation transtrachéale temporaire.', is_correct: true, justification: 'Elle crée rapidement un passage vers la trachée.' },
          { lettre: 'B', enonce: 'La sonde de 5 mm peut être introduite par l’ouverture.', is_correct: true, justification: 'Ce calibre convient à un abord cricothyroïdien élargi.' },
          { lettre: 'C', enonce: 'La méthode la mieux maîtrisée doit être engagée immédiatement.', is_correct: true, justification: 'Le délai importe davantage qu’une supériorité théorique du dispositif.' },
          { lettre: 'D', enonce: 'La canule fine protège définitivement de l’inhalation.', is_correct: false, justification: 'Elle apporte de l’oxygène sans ballonnet protecteur.' },
          { lettre: 'E', enonce: 'Il faut refermer la membrane avant d’insérer la sonde.', is_correct: false, justification: 'L’ouverture constitue précisément le trajet vers la trachée.' },
        ],
      },
      {
        newInformation: 'L’oxygénation revient, mais un emphysème sous-cutané cervical apparaît pendant la ventilation.',
        enonce: 'L’oxygénation revient, mais un emphysème sous-cutané cervical apparaît pendant la ventilation. Quelles complications rechercher ?', format: 'qcm', sourceBlocks: src('b00146', 'b00179'),
        correction_generale: 'L’emphysème évoque une fuite ou un faux trajet. Il faut vérifier l’accès et rechercher pneumothorax, gêne expiratoire et saignement.',
        items: [
          { lettre: 'A', enonce: 'Contrôler la position intratrachéale du dispositif.', is_correct: true, justification: 'Une extrémité dans les tissus diffuse directement le gaz sous la peau.' },
          { lettre: 'B', enonce: 'Rechercher un pneumothorax devant une asymétrie thoracique.', is_correct: true, justification: 'La ventilation sous pression peut produire un barotraumatisme.' },
          { lettre: 'C', enonce: 'Évaluer la possibilité d’une expiration insuffisante.', is_correct: true, justification: 'Le piégeage gazeux augmente pression et diffusion extratrachéale.' },
          { lettre: 'D', enonce: 'Considérer l’emphysème comme un signe normal d’efficacité.', is_correct: false, justification: 'Il traduit une complication et non une ventilation physiologique.' },
          { lettre: 'E', enonce: 'Ignorer tout saignement si la saturation s’améliore.', is_correct: false, justification: 'Une hémorragie cervicale peut menacer l’accès et les voies aériennes.' },
        ],
      },
      {
        newInformation: 'L’hématome cervical déforme maintenant la face antérieure du cou.',
        enonce: 'L’hématome cervical déforme maintenant la face antérieure du cou. Pourquoi l’intubation rétrograde est-elle inadaptée ?', format: 'qcm', sourceBlocks: src('b00182'),
        correction_generale: 'L’hématome rend la ponction et le trajet du guide imprévisibles. La technique rétrograde est en outre trop lente pour une situation CICO.',
        items: [
          { lettre: 'A', enonce: 'Les repères percutanés sont devenus peu fiables.', is_correct: true, justification: 'La déformation augmente le risque de ponction hors de la trachée.' },
          { lettre: 'B', enonce: 'Le saignement peut être aggravé par une nouvelle traversée tissulaire.', is_correct: true, justification: 'La ponction expose à léser des vaisseaux déjà comprimés.' },
          { lettre: 'C', enonce: 'Le délai de guidage est incompatible avec une hypoxémie sévère.', is_correct: true, justification: 'L’accès déjà ouvert doit être utilisé sans détour.' },
          { lettre: 'D', enonce: 'La technique rétrograde est plus rapide que la cricothyroïdotomie ouverte.', is_correct: false, justification: 'Elle nécessite ponction, récupération du fil et rail de la sonde.' },
          { lettre: 'E', enonce: 'L’hématome facilite la remontée du guide vers la bouche.', is_correct: false, justification: 'Il déforme au contraire le trajet cervical et pharyngé.' },
        ],
      },
      {
        newInformation: 'Après stabilisation, la revue d’événement montre que le geste invasif avait rarement été pratiqué en simulation.',
        enonce: 'Après stabilisation, la revue d’événement montre que le geste invasif avait rarement été pratiqué en simulation. Quelles ressources réduisent le risque futur ?', format: 'qcm', sourceBlocks: src('b00146', 'b00154', 'b00175', 'b00179'),
        correction_generale: 'L’entraînement régulier, un matériel standardisé et des rôles explicites réduisent le délai en CICO. La connaissance théorique seule ne remplace pas la pratique du geste.',
        items: [
          { lettre: 'A', enonce: 'Organiser des simulations répétées de l’algorithme CICO.', is_correct: true, justification: 'La répétition améliore décision, repérage et coordination sous stress.' },
          { lettre: 'B', enonce: 'Standardiser l’emplacement et le contenu du kit invasif.', is_correct: true, justification: 'Un matériel constant évite les recherches au moment critique.' },
          { lettre: 'C', enonce: 'Définir qui appelle, oxygène et réalise le geste.', is_correct: true, justification: 'La distribution des rôles limite les actions concurrentes ou oubliées.' },
          { lettre: 'D', enonce: 'Réserver tout entraînement aux chirurgiens ORL.', is_correct: false, justification: 'L’anesthésiste peut devoir agir avant l’arrivée d’un spécialiste.' },
          { lettre: 'E', enonce: 'Changer de kit à chaque simulation pour éviter les automatismes.', is_correct: false, justification: 'La standardisation favorise au contraire une exécution rapide.' },
        ],
      },
    ],
  },
  {
    label: 'Occlusion intestinale et séquence rapide',
    vignette: '<p>Un homme de 68 ans est opéré en urgence d’une occlusion intestinale avec vomissements récents. Il est déshydraté mais conscient, Mallampati III, avec une ventilation faciale probablement possible. Le risque d’inhalation est majeur. L’équipe prépare aspiration, vidéolaryngoscope, médicaments d’induction et solution de secours.</p>',
    questions: [
      {
        enonce: 'Quels éléments justifient une induction en séquence rapide ?', format: 'qcm', sourceBlocks: src('b00188', 'b00189', 'b00190', 'b00191'),
        correction_generale: 'L’urgence, l’occlusion et les vomissements indiquent un estomac plein à haut risque. La séquence rapide réduit la période sans protection laryngée.',
        items: [
          { lettre: 'A', enonce: 'L’occlusion favorise une stase digestive importante.', is_correct: true, justification: 'Le contenu gastrique reste abondant malgré le délai du dernier repas.' },
          { lettre: 'B', enonce: 'Les vomissements récents signalent une régurgitation probable.', is_correct: true, justification: 'Le contenu peut atteindre le pharynx dès la perte des réflexes.' },
          { lettre: 'C', enonce: 'Le caractère urgent augmente le risque d’inhalation.', is_correct: true, justification: 'Le jeûne et la vidange gastrique ne peuvent être garantis.' },
          { lettre: 'D', enonce: 'Un Mallampati III protège contre le passage gastrique.', is_correct: false, justification: 'Ce score concerne l’oropharynx et non le contenu digestif.' },
          { lettre: 'E', enonce: 'La conscience actuelle annule l’indication après injection.', is_correct: false, justification: 'L’induction supprimera précisément les réflexes encore présents.' },
        ],
      },
      {
        newInformation: 'Le masque est étanche et la fraction télé-expiratoire d’oxygène atteint 93 % après trois minutes.',
        enonce: 'Le masque est étanche et la fraction télé-expiratoire d’oxygène atteint 93 % après trois minutes. Comment interpréter la préoxygénation ?', format: 'qcm', sourceBlocks: src('b00031', 'b00036', 'b00038', 'b00041'),
        correction_generale: 'La FeO2 à 93 % valide la dénitrogénation. L’équipe peut induire avec une réserve constituée, aspiration et secours immédiatement disponibles.',
        items: [
          { lettre: 'A', enonce: 'La cible expiratoire supérieure à 90 % est atteinte.', is_correct: true, justification: 'Le réservoir alvéolaire est correctement enrichi en oxygène.' },
          { lettre: 'B', enonce: 'L’étanchéité a limité l’entrée d’air ambiant.', is_correct: true, justification: 'Elle explique l’efficacité de la dénitrogénation mesurée.' },
          { lettre: 'C', enonce: 'La SpO2 aurait suffi sans mesure expirée.', is_correct: false, justification: 'La saturation ne quantifie pas l’azote résiduel pulmonaire.' },
          { lettre: 'D', enonce: 'La séquence rapide peut maintenant débuter sans délai inutile.', is_correct: true, justification: 'Le prérequis respiratoire est rempli dans ce contexte urgent.' },
          { lettre: 'E', enonce: 'La ventilation gastrique est nécessaire avant l’hypnotique.', is_correct: false, justification: 'Le masque sert ici à respirer spontanément, non à insuffler l’estomac.' },
        ],
      },
      {
        newInformation: 'Le patient régurgite facilement et l’équipe veut réduire au minimum le temps sans protection laryngée.',
        enonce: 'Le patient régurgite facilement et l’équipe veut réduire au minimum le temps sans protection laryngée. Quel est le but de l’enchaînement hypnotique–curare–intubation ?', format: 'qcm', sourceBlocks: src('b00191'),
        correction_generale: 'L’enchaînement rapide obtient des conditions d’intubation précoces et raccourcit l’intervalle entre disparition des réflexes et gonflage du ballonnet.',
        items: [
          { lettre: 'A', enonce: 'Obtenir rapidement une paralysie compatible avec le passage de la sonde.', is_correct: true, justification: 'De bonnes conditions limitent la durée et les tentatives de laryngoscopie.' },
          { lettre: 'B', enonce: 'Réduire le délai avant isolation de la trachée.', is_correct: true, justification: 'Le ballonnet protège dès que la sonde est correctement placée.' },
          { lettre: 'C', enonce: 'Prolonger la ventilation faciale avant toute laryngoscopie.', is_correct: false, justification: 'Les insufflations inutiles augmentent la distension gastrique.' },
          { lettre: 'D', enonce: 'Maintenir l’aspiration prête pendant la procédure.', is_correct: true, justification: 'Une régurgitation visible doit pouvoir être évacuée immédiatement.' },
          { lettre: 'E', enonce: 'Retarder le curare jusqu’à confirmation du CO2.', is_correct: false, justification: 'Le bloc neuromusculaire doit permettre l’intubation, qui précède la capnographie.' },
        ],
      },
      {
        newInformation: 'La SpO2 reste à 99 % immédiatement après l’induction et aucune difficulté inattendue n’apparaît.',
        enonce: 'La SpO2 reste à 99 % immédiatement après l’induction et aucune difficulté inattendue n’apparaît. Comment arbitrer la ventilation manuelle ?', format: 'qcm', sourceBlocks: src('b00191'),
        correction_generale: 'La réserve est suffisante et l’intubation s’annonce rapide : les insufflations faciales sont évitées pour ne pas distendre l’estomac. Une oxygénation de secours reste prête.',
        items: [
          { lettre: 'A', enonce: 'S’abstenir d’insufflations systématiques pendant cette apnée courte.', is_correct: true, justification: 'La saturation stable permet de limiter le risque de distension gastrique.' },
          { lettre: 'B', enonce: 'Poursuivre rapidement vers la laryngoscopie préparée.', is_correct: true, justification: 'La protection trachéale doit être obtenue sans temps mort.' },
          { lettre: 'C', enonce: 'Comprimer vigoureusement le ballon pour prévenir toute désaturation.', is_correct: false, justification: 'Une forte pression favorise le passage de gaz dans l’estomac.' },
          { lettre: 'D', enonce: 'Réévaluer la conduite si la SpO2 baisse ou si l’intubation se prolonge.', is_correct: true, justification: 'L’oxygénation reprend la priorité dès que la marge se réduit.' },
          { lettre: 'E', enonce: 'Ignorer le matériel de sauvetage puisque le premier examen était rassurant.', is_correct: false, justification: 'Une difficulté imprévue reste possible pendant tout le geste.' },
        ],
      },
      {
        newInformation: 'La première vue glottique devient meilleure lorsque l’assistant diminue légèrement la pression cricoïdienne.',
        enonce: 'La première vue glottique devient meilleure lorsque l’assistant diminue légèrement la pression cricoïdienne. Que faire ?', format: 'qcm', sourceBlocks: src('b00192', 'b00193'),
        correction_generale: 'La pression est maintenue au niveau minimal compatible avec une bonne vue et une oxygénation efficace. Elle peut être relâchée davantage si elle gêne encore.',
        items: [
          { lettre: 'A', enonce: 'Conserver la pression diminuée si elle permet l’intubation.', is_correct: true, justification: 'L’adaptation concilie l’objectif anti-régurgitation et l’accès glottique.' },
          { lettre: 'B', enonce: 'Revenir automatiquement à 30 N avant de passer la sonde.', is_correct: false, justification: 'La force initiale recréerait la déformation qui masquait la glotte.' },
          { lettre: 'C', enonce: 'Relâcher complètement si l’oxygénation devient impossible.', is_correct: true, justification: 'La sécurité respiratoire prime sur une manœuvre mal tolérée.' },
          { lettre: 'D', enonce: 'Coordonner les changements avec l’opérateur qui voit la glotte.', is_correct: true, justification: 'Il peut signaler immédiatement l’effet de chaque variation.' },
          { lettre: 'E', enonce: 'Déplacer les doigts sur le cartilage thyroïde.', is_correct: false, justification: 'La cible de Sellick reste le cartilage cricoïde.' },
        ],
      },
      {
        newInformation: 'La sonde passe ; le capnogramme est stable, mais l’auscultation paraît plus faible à gauche.',
        enonce: 'La sonde passe ; le capnogramme est stable, mais l’auscultation paraît plus faible à gauche. Comment confirmer et corriger la profondeur ?', format: 'qcm', sourceBlocks: src('b00128', 'b00129', 'b00130'),
        correction_generale: 'Le CO2 confirme la trachée, mais l’asymétrie évoque une intubation bronchique droite. La sonde est retirée prudemment puis l’auscultation recontrôlée.',
        items: [
          { lettre: 'A', enonce: 'Retenir que la position trachéale est confirmée par le CO2.', is_correct: true, justification: 'Le signal persistant montre une ventilation alvéolaire.' },
          { lettre: 'B', enonce: 'Suspecter une pointe trop proche ou au-delà de la carène.', is_correct: true, justification: 'Une sonde profonde ventile préférentiellement le poumon droit.' },
          { lettre: 'C', enonce: 'Retirer légèrement le tube sous surveillance.', is_correct: true, justification: 'La pointe doit rester à distance de la bifurcation.' },
          { lettre: 'D', enonce: 'Avancer la sonde puisque le poumon gauche est moins audible.', is_correct: false, justification: 'L’avancée aggraverait la sélectivité droite.' },
          { lettre: 'E', enonce: 'Considérer l’auscultation inutile devant un capnogramme normal.', is_correct: false, justification: 'La capnographie ne renseigne pas sur la ventilation bilatérale.' },
        ],
      },
      {
        newInformation: 'En fin d’intervention, le patient est encore hypotherme et sa décurarisation n’est pas complète.',
        enonce: 'En fin d’intervention, le patient est encore hypotherme et sa décurarisation n’est pas complète. Quels critères conditionnent l’extubation ?', format: 'qcm', sourceBlocks: src('b00184'),
        correction_generale: 'L’extubation est différée. Réchauffement, levée complète du bloc, conscience, ventilation efficace et stabilité doivent être obtenus avant le retrait.',
        items: [
          { lettre: 'A', enonce: 'Réchauffer le patient jusqu’à la normothermie.', is_correct: true, justification: 'L’hypothermie retarde le réveil et la récupération musculaire.' },
          { lettre: 'B', enonce: 'Antagoniser puis contrôler le bloc neuromusculaire.', is_correct: true, justification: 'Une toux et une ventilation efficaces exigent une force restaurée.' },
          { lettre: 'C', enonce: 'Extuber parce que la chirurgie abdominale est terminée.', is_correct: false, justification: 'La fin opératoire ne remplace pas les critères physiologiques.' },
          { lettre: 'D', enonce: 'Vérifier conscience, stabilité et oxygénation avant le geste.', is_correct: true, justification: 'Ces paramètres réduisent le risque de reprise urgente.' },
          { lettre: 'E', enonce: 'Accepter un bloc résiduel si la SpO2 est normale.', is_correct: false, justification: 'La saturation peut précéder une obstruction et une hypoventilation.' },
        ],
      },
    ],
  },
  {
    label: 'Extubation d’une voie aérienne difficile',
    vignette: '<p>Une femme de 57 ans a été intubée au fibroscope éveillé pour une tumeur pharyngée. Après résection, elle est stable et ventilée, mais un œdème local est possible et la réintubation serait délicate. L’équipe discute le moment du retrait, la surveillance postopératoire et le maintien transitoire d’un guide d’échange.</p>',
    questions: [
      {
        enonce: 'Quels paramètres doivent être évalués avant de décider l’extubation ?', format: 'qcm', sourceBlocks: src('b00184', 'b00203'),
        correction_generale: 'La décision associe récupération générale, perméabilité postopératoire et faisabilité d’une réintubation. La chirurgie pharyngée impose une prudence supplémentaire.',
        items: [
          { lettre: 'A', enonce: 'La conscience et la capacité de protéger le larynx.', is_correct: true, justification: 'Une toux efficace limite obstruction et inhalation.' },
          { lettre: 'B', enonce: 'La ventilation spontanée et l’oxygénation.', is_correct: true, justification: 'Le retrait supprime le contrôle direct de la voie aérienne.' },
          { lettre: 'C', enonce: 'L’importance de l’œdème après la résection.', is_correct: true, justification: 'Un gonflement peut réduire la lumière une fois la sonde retirée.' },
          { lettre: 'D', enonce: 'La facilité d’un éventuel nouvel accès trachéal.', is_correct: true, justification: 'La stratégie dépend du risque de ne pas pouvoir réintuber.' },
          { lettre: 'E', enonce: 'Uniquement l’heure de fin de chirurgie.', is_correct: false, justification: 'L’horaire ne décrit aucune récupération physiologique.' },
        ],
      },
      {
        newInformation: 'La température est à 35,4 °C et le monitorage neuromusculaire montre encore un bloc résiduel.',
        enonce: 'La température est à 35,4 °C et le monitorage neuromusculaire montre encore un bloc résiduel. Pourquoi différer le retrait ?', format: 'qcm', sourceBlocks: src('b00184'),
        correction_generale: 'Deux critères majeurs manquent : normothermie et décurarisation. Le retrait exposerait à une faiblesse ventilatoire sur une voie déjà œdémateuse.',
        items: [
          { lettre: 'A', enonce: 'L’hypothermie retarde la récupération complète.', is_correct: true, justification: 'Elle prolonge les effets anesthésiques et altère les fonctions musculaires.' },
          { lettre: 'B', enonce: 'Le bloc résiduel diminue la force inspiratoire et la toux.', is_correct: true, justification: 'La patiente protégerait moins bien ses voies aériennes.' },
          { lettre: 'C', enonce: 'L’œdème augmente les conséquences d’une faiblesse pharyngée.', is_correct: true, justification: 'Deux mécanismes obstructifs pourraient alors se cumuler.' },
          { lettre: 'D', enonce: 'Une SpO2 normale sous ventilation autorise le retrait.', is_correct: false, justification: 'Elle ne prédit pas la respiration autonome après extubation.' },
          { lettre: 'E', enonce: 'Le réchauffement est inutile après une chirurgie ORL.', is_correct: false, justification: 'La normothermie reste un critère quelle que soit la spécialité.' },
        ],
      },
      {
        newInformation: 'Après réchauffement et antagonisation, la patiente est consciente, stable et ventile efficacement.',
        enonce: 'Après réchauffement et antagonisation, la patiente est consciente, stable et ventile efficacement. Quelles mesures préparent directement le geste ?', format: 'qcm', sourceBlocks: src('b00103', 'b00184', 'b00185'),
        correction_generale: 'La patiente est oxygénée, les sécrétions aspirées et le matériel de reprise préparé. L’équipe définit la surveillance et le rôle du guide avant de dégonfler.',
        items: [
          { lettre: 'A', enonce: 'Préoxygéner avant le retrait.', is_correct: true, justification: 'Une réserve protège pendant une toux ou une obstruction brève.' },
          { lettre: 'B', enonce: 'Aspirer les sécrétions oropharyngées.', is_correct: true, justification: 'Le dégonflage ne doit pas entraîner leur inhalation.' },
          { lettre: 'C', enonce: 'Préparer fibroscope, sonde et dispositif d’oxygénation.', is_correct: true, justification: 'Une reprise doit être possible sans recherche de matériel.' },
          { lettre: 'D', enonce: 'Transférer la patiente avant de retirer la sonde.', is_correct: false, justification: 'Le geste reste dans la zone la mieux équipée.' },
          { lettre: 'E', enonce: 'Définir une surveillance immédiate après extubation.', is_correct: true, justification: 'L’œdème peut provoquer une obstruction précoce.' },
        ],
      },
      {
        newInformation: 'L’œdème paraît modéré mais l’équipe considère toujours la réintubation comme difficile.',
        enonce: 'L’œdème paraît modéré mais l’équipe considère toujours la réintubation comme difficile. Comment conserver une voie immédiate ?', format: 'qcm', sourceBlocks: src('b00184', 'b00185', 'b00186'),
        correction_generale: 'Un échangeur creux peut rester dans la trachée après retrait de la sonde. Il fournit un rail temporaire sans remplacer la surveillance.',
        items: [
          { lettre: 'A', enonce: 'Introduire un échangeur de sonde avant le retrait.', is_correct: true, justification: 'Le guide reste dans la lumière pendant l’extubation.' },
          { lettre: 'B', enonce: 'Stabiliser sa profondeur pour éviter migration et traumatisme.', is_correct: true, justification: 'Une position contrôlée limite toux et fausse route.' },
          { lettre: 'C', enonce: 'Le retirer aussitôt, avant d’évaluer la respiration.', is_correct: false, justification: 'Il doit couvrir la période où une reprise reste possible.' },
          { lettre: 'D', enonce: 'Conserver le matériel de réintubation autour de la patiente.', is_correct: true, justification: 'Le rail n’est utile que si une sonde peut être avancée rapidement.' },
          { lettre: 'E', enonce: 'Considérer l’œdème modéré comme une garantie de succès.', is_correct: false, justification: 'Même limité, il peut progresser ou gêner le passage.' },
        ],
      },
      {
        newInformation: 'La sonde est retirée sur un guide creux, que la patiente tolère sans détresse.',
        enonce: 'La sonde est retirée sur un guide creux, que la patiente tolère sans détresse. Quels usages du guide sont pertinents ?', format: 'qcm', sourceBlocks: src('b00184', 'b00185', 'b00186'),
        correction_generale: 'Le guide maintient un trajet de réintubation et peut accompagner une oxygénation selon le modèle. Il est surveillé, fixé et retiré dès que le risque devient acceptable.',
        items: [
          { lettre: 'A', enonce: 'Servir de rail à une nouvelle sonde si l’obstruction survient.', is_correct: true, justification: 'Le trajet trachéal est déjà matérialisé.' },
          { lettre: 'B', enonce: 'Rester à une profondeur contrôlée et atraumatique.', is_correct: true, justification: 'Une insertion excessive peut irriter ou perforer les voies aériennes.' },
          { lettre: 'C', enonce: 'Autoriser l’absence de monitorage respiratoire.', is_correct: false, justification: 'Le guide n’empêche ni obstruction ni hypoxémie.' },
          { lettre: 'D', enonce: 'Être retiré lorsque la stabilité est confirmée.', is_correct: true, justification: 'Son maintien n’est pas nécessaire au-delà de la période à risque.' },
          { lettre: 'E', enonce: 'Remplacer définitivement une trachéotomie nécessaire.', is_correct: false, justification: 'Il ne constitue qu’un accès temporaire de secours.' },
        ],
      },
      {
        newInformation: 'Une obstruction partielle transitoire apparaît avec un tirage, mais la patiente répond au jaw thrust.',
        enonce: 'Une obstruction partielle transitoire apparaît avec un tirage, mais la patiente répond au jaw thrust. Quels moyens doivent rester prêts ?', format: 'qcm', sourceBlocks: src('b00057', 'b00074', 'b00154'),
        correction_generale: 'Le jaw thrust est maintenu, l’oxygène administré et les aides pharyngées préparées. Masque et supraglottique restent disponibles sans retirer le guide.',
        items: [
          { lettre: 'A', enonce: 'Poursuivre la subluxation mandibulaire efficace.', is_correct: true, justification: 'Elle rouvre le pharynx pendant la récupération du tonus.' },
          { lettre: 'B', enonce: 'Administrer de l’oxygène au masque.', is_correct: true, justification: 'L’apport augmente la réserve pendant l’obstruction.' },
          { lettre: 'C', enonce: 'Préparer une canule et un dispositif supraglottique.', is_correct: true, justification: 'Ils traitent une obstruction qui deviendrait persistante.' },
          { lettre: 'D', enonce: 'Retirer immédiatement le guide malgré le tirage.', is_correct: false, justification: 'Le risque de réintubation est précisément en train d’augmenter.' },
          { lettre: 'E', enonce: 'Attendre une désaturation avant toute assistance.', is_correct: false, justification: 'Les signes cliniques justifient déjà un traitement.' },
        ],
      },
      {
        newInformation: 'La SpO2 recommence à baisser et le passage sur le guide reste techniquement possible.',
        enonce: 'La SpO2 recommence à baisser et le passage sur le guide reste techniquement possible. Quelle conduite adopter ?', format: 'qcm', sourceBlocks: src('b00154', 'b00184', 'b00185', 'b00186'),
        correction_generale: 'La dégradation malgré les moyens non invasifs impose de réintuber rapidement sur le guide, avec oxygénation et aide simultanées. Il ne faut pas perdre ce trajet acquis.',
        items: [
          { lettre: 'A', enonce: 'Faire avancer une sonde compatible sur l’échangeur.', is_correct: true, justification: 'Le rail permet une reprise rapide de la lumière trachéale.' },
          { lettre: 'B', enonce: 'Maintenir l’oxygénation pendant la préparation.', is_correct: true, justification: 'Chaque seconde de marge doit être préservée.' },
          { lettre: 'C', enonce: 'Demander une aide expérimentée immédiatement.', is_correct: true, justification: 'La coordination accélère le passage et la confirmation.' },
          { lettre: 'D', enonce: 'Retirer le guide puis recommencer une fibroscopie éveillée.', is_correct: false, justification: 'Cette stratégie perdrait l’accès disponible pendant une hypoxémie.' },
          { lettre: 'E', enonce: 'Confirmer la nouvelle sonde par capnographie.', is_correct: true, justification: 'Le CO2 persistant prouve la restauration de la ventilation trachéale.' },
        ],
      },
    ],
  },
];

const DP_QCM_AUTHORED_CASES = [
  {
    label: 'Obésité et voie aérienne à risque',
    vignette: '<p>Un homme de 58 ans, IMC 43 kg/m², est programmé pour une laparotomie. Il présente un SAOS appareillé, une barbe épaisse, un Mallampati IV et une protrusion mandibulaire limitée. Sa SpO2 est à 95 % en air ambiant. L’équipe prévoit une induction générale et prépare un vidéolaryngoscope, un dispositif supraglottique de deuxième génération et le chariot d’intubation difficile.</p>',
    questions: [
      {
        enonce: 'Quels éléments font anticiper simultanément une ventilation faciale et une intubation difficiles ?', format: 'qcm',
        sourceBlocks: src('b00015', 'b00016', 'b00024', 'b00050', 'b00071', 'b00072'),
        correction_generale: 'L’obésité, le SAOS et la barbe menacent la ventilation faciale ; Mallampati IV et la faible protrusion mandibulaire rendent aussi l’exposition glottique incertaine.',
        items: [
          { lettre: 'A', enonce: 'La SpO2 à 95 % permet d’écarter une difficulté anatomique.', is_correct: false, justification: 'La saturation basale ne renseigne ni sur l’étanchéité du masque ni sur l’accès au larynx.' },
          { lettre: 'B', enonce: 'La barbe épaisse favorise une fuite autour du masque.', is_correct: true, justification: 'Les poils interrompent le contact régulier du coussinet avec la peau.' },
          { lettre: 'C', enonce: 'Le SAOS et l’obésité augmentent le risque d’obstruction après induction.', is_correct: true, justification: 'La perte de tonus agit sur un pharynx déjà collapsible et sur des volumes pulmonaires réduits.' },
          { lettre: 'D', enonce: 'Une protrusion mandibulaire limitée est sans rapport avec la laryngoscopie.', is_correct: false, justification: 'Elle réduit la capacité à déplacer la langue et à aligner l’accès glottique.' },
          { lettre: 'E', enonce: 'Un Mallampati IV justifie la préparation d’une technique alternative.', is_correct: true, justification: 'Ce signe ne prédit pas seul l’échec, mais renforce ici un faisceau concordant.' },
        ],
      },
      {
        newInformation: 'Installé demi-assis, il respire de l’oxygène pur avec une fraction télé-expiratoire qui plafonne à 82 %.',
        enonce: 'Installé demi-assis, il respire de l’oxygène pur avec une fraction télé-expiratoire qui plafonne à 82 %. Quelles mesures sont adaptées à cette préoxygénation insuffisante ?', format: 'qcm',
        sourceBlocks: src('b00031', 'b00036', 'b00038', 'b00041', 'b00046'),
        correction_generale: 'Une FeO2 à 82 % reste sous la cible. Il faut vérifier l’étanchéité, augmenter le débit frais et poursuivre jusqu’à une valeur supérieure à 90 %.',
        items: [
          { lettre: 'A', enonce: 'Réajuster le masque afin de supprimer toute entrée d’air ambiant.', is_correct: true, justification: 'Une fuite explique fréquemment l’échec de la dénitrogénation malgré l’oxygène pur.' },
          { lettre: 'B', enonce: 'Débuter l’induction puisque la position proclive suffit à constituer la réserve.', is_correct: false, justification: 'La position améliore la CRF, mais ne corrige pas une fraction expirée insuffisante.' },
          { lettre: 'C', enonce: 'Porter le débit de gaz frais à 10–12 L/min.', is_correct: true, justification: 'Un débit élevé réduit la réinspiration et maintient une forte fraction inspirée.' },
          { lettre: 'D', enonce: 'Se fier à la SpO2 plutôt qu’à la FeO2 chez ce patient obèse.', is_correct: false, justification: 'La saturation peut être rassurante alors que le réservoir alvéolaire reste incomplet.' },
          { lettre: 'E', enonce: 'Poursuivre la manœuvre jusqu’à dépasser 90 % de FeO2.', is_correct: true, justification: 'Ce seuil objective une dénitrogénation pulmonaire satisfaisante avant l’apnée.' },
        ],
      },
      {
        newInformation: 'Après réajustement du masque et augmentation du débit frais à 12 L/min, la fraction télé-expiratoire atteint 92 %.',
        enonce: 'Après réajustement du masque et augmentation du débit frais à 12 L/min, la fraction télé-expiratoire atteint 92 %. Comment interpréter ce nouveau contrôle ?', format: 'qcm',
        sourceBlocks: src('b00036', 'b00038', 'b00041', 'b00046', 'b00048'),
        correction_generale: 'La FeO2 à 92 % valide la dénitrogénation. La position demi-assise augmente la réserve de l’obèse, mais impose de rester attentif à l’hypotension d’induction.',
        items: [
          { lettre: 'A', enonce: 'La préoxygénation doit être reprise à zéro car la cible est 100 %.', is_correct: false, justification: 'Une valeur supérieure à 90 % constitue la cible pratique retenue.' },
          { lettre: 'B', enonce: 'La réserve pulmonaire est désormais mieux constituée pour la période d’apnée.', is_correct: true, justification: 'La faible teneur résiduelle en azote augmente l’oxygène disponible dans la CRF.' },
          { lettre: 'C', enonce: 'La position demi-assise supprime tout risque hémodynamique à l’induction.', is_correct: false, justification: 'Le relèvement peut favoriser une hypotension, surtout après les médicaments anesthésiques.' },
          { lettre: 'D', enonce: 'Le débit élevé a contribué à éviter la réinspiration dans le circuit.', is_correct: true, justification: 'Le renouvellement rapide du gaz maintient une concentration inspirée proche de 100 %.' },
          { lettre: 'E', enonce: 'Une PEEP peut être envisagée pour augmenter encore la CRF si le contexte le permet.', is_correct: true, justification: 'Le recrutement alvéolaire prolonge la tolérance à l’apnée, hors risque gastrique majeur.' },
        ],
      },
      {
        newInformation: 'Après l’induction, le thorax se soulève à peine et une fuite importante est audible autour du masque.',
        enonce: 'Après l’induction, le thorax se soulève à peine et une fuite importante est audible autour du masque. Quelles actions doivent être combinées immédiatement ?', format: 'qcm',
        sourceBlocks: src('b00066', 'b00067', 'b00068', 'b00074'),
        correction_generale: 'La fuite et l’obstruction sont traitées ensemble : repositionnement, jaw thrust, canule et prise à deux mains rétablissent l’étanchéité sans écraser les tissus sous-mentonniers.',
        items: [
          { lettre: 'A', enonce: 'Subluxer la mandibule et vérifier la position de la tête.', is_correct: true, justification: 'Ces gestes éloignent la langue de la paroi pharyngée et améliorent le passage aérien.' },
          { lettre: 'B', enonce: 'Introduire une canule oropharyngée si la profondeur anesthésique le permet.', is_correct: true, justification: 'La canule maintient la langue en avant chez un patient sans réflexe nauséeux.' },
          { lettre: 'C', enonce: 'Passer à une prise du masque à deux mains avec un second opérateur.', is_correct: true, justification: 'Deux mains optimisent simultanément l’appui facial et la traction mandibulaire.' },
          { lettre: 'D', enonce: 'Comprimer les tissus mous sous le menton afin de fermer la fuite.', is_correct: false, justification: 'Cette pression aggrave l’obstruction ; les doigts doivent s’appuyer sur l’os.' },
          { lettre: 'E', enonce: 'Augmenter brutalement la pression inspiratoire au-delà de 30 cmH2O.', is_correct: false, justification: 'Une forte pression distend l’estomac sans corriger la cause de la fuite.' },
        ],
      },
      {
        newInformation: 'Une première vidéolaryngoscopie échoue, mais la ventilation à deux mains maintient une SpO2 à 97 %.',
        enonce: 'Une première vidéolaryngoscopie échoue, mais la ventilation à deux mains maintient une SpO2 à 97 %. Quelle conduite est cohérente ?', format: 'qcm',
        sourceBlocks: src('b00084', 'b00086', 'b00140', 'b00154', 'b00158'),
        correction_generale: 'L’oxygénation conservée permet de s’arrêter, d’appeler de l’aide et de préparer une vraie modification. Le supraglottique reste prêt si la ventilation faciale se dégrade.',
        items: [
          { lettre: 'A', enonce: 'Réoxygéner complètement avant toute nouvelle tentative.', is_correct: true, justification: 'Chaque essai doit débuter avec une réserve maximale afin d’éviter l’hypoxémie.' },
          { lettre: 'B', enonce: 'Répéter immédiatement le même geste puisque la SpO2 est encore normale.', is_correct: false, justification: 'Une tentative identique augmente le traumatisme sans traiter la cause de l’échec.' },
          { lettre: 'C', enonce: 'Préparer le dispositif supraglottique de deuxième génération déjà disponible.', is_correct: true, justification: 'Il constitue une voie d’oxygénation rapide si le masque devient inefficace.' },
          { lettre: 'D', enonce: 'Appeler une aide expérimentée avant de changer de technique.', is_correct: true, justification: 'Le renfort apporte une expertise et prépare simultanément les solutions de secours.' },
          { lettre: 'E', enonce: 'Réaliser d’emblée une cricothyroïdotomie malgré la ventilation efficace.', is_correct: false, justification: 'L’accès invasif est réservé à l’impossibilité d’oxygéner, absente ici.' },
        ],
      },
      {
        newInformation: 'Le dispositif supraglottique ventile correctement ; une aide expérimentée arrive avec un mandrin préformé.',
        enonce: 'Le dispositif supraglottique ventile correctement ; une aide expérimentée arrive avec un mandrin préformé. Quels principes guident la nouvelle tentative ?', format: 'qcm',
        sourceBlocks: src('b00087', 'b00139', 'b00140', 'b00154', 'b00158'),
        correction_generale: 'La ventilation supraglottique doit rester stable pendant la préparation. L’opérateur expérimenté choisit une technique réellement différente, limite l’essai et prévoit immédiatement le retour à l’oxygénation.',
        items: [
          { lettre: 'A', enonce: 'Maintenir l’oxygénation pendant la préparation du matériel.', is_correct: true, justification: 'La stabilité des échanges permet une tentative planifiée plutôt qu’un geste précipité.' },
          { lettre: 'B', enonce: 'Préformer la sonde selon la courbure du vidéolaryngoscope.', is_correct: true, justification: 'Le mandrin aide le tube à suivre une trajectoire angulée vers la glotte.' },
          { lettre: 'C', enonce: 'Retirer définitivement le supraglottique avant d’avoir vérifié le plan de repli.', is_correct: false, justification: 'Le dispositif représente la voie d’oxygénation acquise et doit rester immédiatement réutilisable.' },
          { lettre: 'D', enonce: 'Confier l’essai à l’opérateur le plus expérimenté disponible.', is_correct: true, justification: 'La compétence technique augmente la probabilité de réussite dès cette tentative modifiée.' },
          { lettre: 'E', enonce: 'Limiter la durée du geste et revenir au supraglottique en cas d’échec.', is_correct: true, justification: 'L’oxygénation prime sur la poursuite d’une intubation qui n’aboutit pas.' },
        ],
      },
      {
        newInformation: 'La chirurgie est terminée ; le patient est réveillé, normotherme et complètement décurarisé après une intubation finalement difficile.',
        enonce: 'La chirurgie est terminée ; le patient est réveillé, normotherme et complètement décurarisé après une intubation finalement difficile. Quelles conditions sécurisent le retrait ?', format: 'qcm',
        sourceBlocks: src('b00103', 'b00184', 'b00185', 'b00186'),
        correction_generale: 'Les critères généraux sont réunis, mais la réintubation potentielle reste difficile. L’aspiration, l’oxygénation, le matériel prêt et éventuellement un guide d’échange sécurisent l’extubation.',
        items: [
          { lettre: 'A', enonce: 'Le réveil permet de retirer la sonde sans contrôler la ventilation spontanée.', is_correct: false, justification: 'La conscience ne suffit pas ; fréquence, volume et oxygénation doivent être efficaces.' },
          { lettre: 'B', enonce: 'Le matériel de réintubation peut être rangé puisque la décurarisation est complète.', is_correct: false, justification: 'Une obstruction post-extubation reste possible malgré une récupération neuromusculaire normale.' },
          { lettre: 'C', enonce: 'Les sécrétions oropharyngées doivent être aspirées avant le dégonflage.', is_correct: true, justification: 'Leur élimination limite l’inhalation et facilite la perméabilité après retrait.' },
          { lettre: 'D', enonce: 'Un échangeur creux peut maintenir temporairement un accès à la trachée.', is_correct: true, justification: 'Le guide permet une réintubation rapide si l’œdème ou l’obstruction survient.' },
          { lettre: 'E', enonce: 'La stabilité respiratoire et hémodynamique doit être confirmée juste avant le geste.', is_correct: true, justification: 'Le retrait ne doit pas créer une dépendance immédiate à une ventilation de secours.' },
        ],
      },
    ],
  },
  {
    label: 'Césarienne urgente à estomac plein',
    vignette: '<p>Une femme de 34 ans à 39 semaines d’aménorrhée doit subir une césarienne urgente sous anesthésie générale. Elle a mangé deux heures auparavant, présente un Mallampati II et une ouverture buccale normale. Sa SpO2 est à 99 %, mais l’équipe rappelle que la grossesse réduit la capacité résiduelle fonctionnelle et raccourcit fortement la durée d’apnée tolérable.</p>',
    questions: [
      {
        enonce: 'Quelles affirmations décrivent correctement sa marge d’oxygénation avant l’induction ?', format: 'qcm',
        sourceBlocks: src('b00026', 'b00027', 'b00028', 'b00029', 'b00036', 'b00045', 'b00052'),
        correction_generale: 'La grossesse réduit la CRF et augmente les besoins en oxygène ; la désaturation est donc rapide. Une SpO2 initiale normale ne mesure pas la réserve alvéolaire.',
        items: [
          { lettre: 'A', enonce: 'La diminution de la CRF réduit le stock pulmonaire mobilisable pendant l’apnée.', is_correct: true, justification: 'La dénitrogénation enrichit surtout le gaz contenu dans ce volume de fin d’expiration.' },
          { lettre: 'B', enonce: 'Une SpO2 à 99 % prouve que la préoxygénation est déjà complète.', is_correct: false, justification: 'L’hémoglobine peut être saturée alors que les alvéoles contiennent encore beaucoup d’azote.' },
          { lettre: 'C', enonce: 'Les besoins métaboliques de la grossesse accélèrent l’utilisation de l’oxygène stocké.', is_correct: true, justification: 'Une consommation accrue épuise plus vite la réserve constituée avant l’apnée.' },
          { lettre: 'D', enonce: 'Son Mallampati II annule le risque de désaturation rapide.', is_correct: false, justification: 'Mallampati concerne l’examen oropharyngé, non les volumes pulmonaires et la consommation.' },
          { lettre: 'E', enonce: 'La préoxygénation doit être particulièrement rigoureuse malgré l’urgence obstétricale.', is_correct: true, justification: 'Une courte marge apnéique exige de maximiser le réservoir avant la perte de conscience.' },
        ],
      },
      {
        newInformation: 'La patiente coopère et peut effectuer des inspirations profondes pendant que le débit d’oxygène reste élevé.',
        enonce: 'La patiente coopère et peut effectuer des inspirations profondes pendant que le débit d’oxygène reste élevé. Quelle technique rapide peut être retenue ?', format: 'qcm',
        sourceBlocks: src('b00038', 'b00041', 'b00043'),
        correction_generale: 'Huit inspirations profondes en 60 secondes constituent l’alternative rapide validée chez une patiente coopérante. L’étanchéité et la FeO2 supérieure à 90 % restent contrôlées.',
        items: [
          { lettre: 'A', enonce: 'Demander huit inspirations profondes réparties sur 60 secondes.', is_correct: true, justification: 'Cette séquence renouvelle rapidement la CRF avec un résultat proche de la méthode lente.' },
          { lettre: 'B', enonce: 'Accepter quatre inspirations en 30 secondes comme équivalent certain.', is_correct: false, justification: 'Cette modalité plus courte est moins constante, particulièrement sur un terrain à faible CRF.' },
          { lettre: 'C', enonce: 'Maintenir un masque étanche pendant l’ensemble des efforts respiratoires.', is_correct: true, justification: 'Une entrée d’air diluerait chaque inspiration profonde et réduirait la dénitrogénation.' },
          { lettre: 'D', enonce: 'Contrôler la fraction télé-expiratoire avant d’injecter les médicaments.', is_correct: true, justification: 'La FeO2 confirme l’efficacité réelle malgré la brièveté imposée par l’urgence.' },
          { lettre: 'E', enonce: 'Interrompre après 30 secondes dès que la SpO2 affiche 100 %.', is_correct: false, justification: 'La saturation ne reflète pas le remplacement de l’azote dans les alvéoles.' },
        ],
      },
      {
        newInformation: 'Le chirurgien demande le début immédiat de l’anesthésie ; la préoxygénation a atteint une fraction expirée de 91 %.',
        enonce: 'Le chirurgien demande le début immédiat de l’anesthésie ; la préoxygénation a atteint une fraction expirée de 91 %. Quels principes définissent l’induction adaptée ?', format: 'qcm',
        sourceBlocks: src('b00188', 'b00191', 'b00192'),
        correction_generale: 'L’urgence, la grossesse et le repas récent imposent une séquence rapide. La FeO2 valide la réserve ; hypnotique et curare sont enchaînés pour protéger tôt la trachée.',
        items: [
          { lettre: 'A', enonce: 'La FeO2 à 91 % autorise le début de la séquence rapide.', is_correct: true, justification: 'La cible de dénitrogénation est atteinte malgré le temps obstétrical limité.' },
          { lettre: 'B', enonce: 'Une ventilation faciale vigoureuse doit précéder systématiquement la laryngoscopie.', is_correct: false, justification: 'Elle distend l’estomac et n’est pas requise tant que l’apnée reste bien tolérée.' },
          { lettre: 'C', enonce: 'L’hypnotique et le curare sont administrés pour permettre une intubation précoce.', is_correct: true, justification: 'La durée entre perte des réflexes et gonflage du ballonnet doit être minimale.' },
          { lettre: 'D', enonce: 'Le risque d’inhalation disparaît puisque l’ouverture buccale est normale.', is_correct: false, justification: 'Ce signe facilite éventuellement l’accès mais ne modifie ni estomac plein ni grossesse.' },
          { lettre: 'E', enonce: 'Une aspiration fonctionnelle doit rester immédiatement disponible.', is_correct: true, justification: 'Elle permet d’évacuer rapidement toute régurgitation visible dans le pharynx.' },
        ],
      },
      {
        newInformation: 'Une pression de Sellick est appliquée, mais elle dégrade la vue glottique et rend la ventilation impossible.',
        enonce: 'Une pression de Sellick est appliquée, mais elle dégrade la vue glottique et rend la ventilation impossible. Comment la gérer ?', format: 'qcm',
        sourceBlocks: src('b00192', 'b00193'),
        correction_generale: 'La pression cricoïdienne ne doit jamais compromettre la ventilation ni l’intubation. Elle est diminuée puis relâchée si nécessaire jusqu’au rétablissement des échanges et de la vue.',
        items: [
          { lettre: 'A', enonce: 'Demander un relâchement progressif sous contrôle de l’opérateur.', is_correct: true, justification: 'Une diminution peut restaurer l’axe glottique tout en conservant une pression partielle.' },
          { lettre: 'B', enonce: 'Maintenir 30 N malgré l’impossibilité de ventiler.', is_correct: false, justification: 'La prévention de l’hypoxie prime sur l’application rigide d’une manœuvre.' },
          { lettre: 'C', enonce: 'Supprimer complètement la pression si la vue et l’oxygénation ne reviennent pas autrement.', is_correct: true, justification: 'La trachée doit pouvoir être sécurisée même au prix de l’arrêt du Sellick.' },
          { lettre: 'D', enonce: 'Déplacer la pression du cricoïde vers le cartilage thyroïde.', is_correct: false, justification: 'Le geste changerait de cible sans résoudre de manière contrôlée la déformation laryngée.' },
          { lettre: 'E', enonce: 'Coordonner verbalement chaque adaptation avec la personne qui l’applique.', is_correct: true, justification: 'Une communication directe permet de tester l’effet immédiat sur la vue et la ventilation.' },
        ],
      },
      {
        newInformation: 'Après relâchement partiel de la pression, la sonde franchit les cordes vocales au premier essai.',
        enonce: 'Après relâchement partiel de la pression, la sonde franchit les cordes vocales au premier essai. Quels signes confirment son placement correct ?', format: 'qcm',
        sourceBlocks: src('b00128', 'b00129'),
        correction_generale: 'Le passage visuel est complété par un capnogramme persistant, une auscultation bilatérale et un contrôle de profondeur maintenant la pointe au-dessus de la carène.',
        items: [
          { lettre: 'A', enonce: 'Une courbe de CO2 stable doit persister pendant plusieurs cycles.', is_correct: true, justification: 'La continuité du signal confirme une ventilation alvéolaire par la trachée.' },
          { lettre: 'B', enonce: 'La seule buée dans la sonde suffit à valider la position.', is_correct: false, justification: 'La condensation est non spécifique et peut survenir sans intubation trachéale correcte.' },
          { lettre: 'C', enonce: 'L’auscultation doit retrouver une ventilation pulmonaire bilatérale.', is_correct: true, justification: 'Une asymétrie suggérerait notamment une migration dans la bronche souche droite.' },
          { lettre: 'D', enonce: 'Le repère d’insertion doit être vérifié après la fixation.', is_correct: true, justification: 'La profondeur correcte doit être conservée malgré les mobilisations opératoires.' },
          { lettre: 'E', enonce: 'La sonde doit être avancée jusqu’au contact de la carène.', is_correct: false, justification: 'La pointe reste au moins deux centimètres au-dessus pour éviter l’intubation sélective.' },
        ],
      },
      {
        newInformation: 'À la fin de la césarienne, la patiente ventile spontanément mais reste somnolente et le monitorage montre un bloc résiduel.',
        enonce: 'À la fin de la césarienne, la patiente ventile spontanément mais reste somnolente et le monitorage montre un bloc résiduel. Quelles mesures sont nécessaires ?', format: 'qcm',
        sourceBlocks: src('b00184'),
        correction_generale: 'La ventilation spontanée isolée ne suffit pas. L’extubation est différée jusqu’au réveil complet, à l’antagonisation du bloc et à la capacité de protéger les voies aériennes.',
        items: [
          { lettre: 'A', enonce: 'Retirer immédiatement la sonde puisque la chirurgie est terminée.', is_correct: false, justification: 'La somnolence et la curarisation résiduelle exposent à l’obstruction et à l’inhalation.' },
          { lettre: 'B', enonce: 'Poursuivre la ventilation et l’oxygénation en attendant une récupération suffisante.', is_correct: true, justification: 'Le soutien évite une extubation prématurée pendant la phase de réveil.' },
          { lettre: 'C', enonce: 'Antagoniser le bloc neuromusculaire puis en objectiver la levée.', is_correct: true, justification: 'La récupération musculaire restaure la toux et le tonus des voies aériennes.' },
          { lettre: 'D', enonce: 'Vérifier la conscience et l’efficacité des réflexes de protection.', is_correct: true, justification: 'La patiente doit pouvoir maintenir la perméabilité et gérer ses sécrétions.' },
          { lettre: 'E', enonce: 'La grossesse autorise l’extubation sous anesthésie profonde pour éviter la toux.', is_correct: false, justification: 'Le risque gastrique rend au contraire essentielle une protection laryngée retrouvée.' },
        ],
      },
      {
        newInformation: 'Après antagonisation, elle est pleinement consciente, normotherme, stable et tousse efficacement après aspiration oropharyngée.',
        enonce: 'Après antagonisation, elle est pleinement consciente, normotherme, stable et tousse efficacement après aspiration oropharyngée. Quels éléments rendent maintenant l’extubation acceptable ?', format: 'qcm',
        sourceBlocks: src('b00103', 'b00184'),
        correction_generale: 'La patiente réunit conscience, stabilité, normothermie, décurarisation et toux efficace. Après oxygénation, le retrait peut être réalisé avec surveillance immédiate.',
        items: [
          { lettre: 'A', enonce: 'La capacité à tousser indique une protection laryngée fonctionnelle.', is_correct: true, justification: 'Une toux efficace aide à éliminer les sécrétions et à prévenir leur inhalation.' },
          { lettre: 'B', enonce: 'La normothermie et la stabilité hémodynamique complètent les critères respiratoires.', is_correct: true, justification: 'Elles témoignent d’une récupération globale compatible avec le retrait du support.' },
          { lettre: 'C', enonce: 'L’aspiration préalable réduit la charge de sécrétions au-dessus du ballonnet.', is_correct: true, justification: 'Le dégonflage expose autrement ces sécrétions à descendre vers le larynx.' },
          { lettre: 'D', enonce: 'La surveillance peut cesser dès que la sonde a franchi les cordes.', is_correct: false, justification: 'Obstruction et hypoventilation peuvent apparaître dans les minutes suivant le retrait.' },
          { lettre: 'E', enonce: 'Une oxygénation avant le geste augmente la marge en cas d’événement transitoire.', is_correct: true, justification: 'Elle constitue une réserve utile pendant la toux ou une brève obstruction post-extubation.' },
        ],
      },
    ],
  },

  {
    label: 'Traumatisme cervical et intubation prévue difficile',
    vignette: '<p>Un homme de 41 ans victime d’un accident de la route présente une fracture cervicale instable. Il est conscient, oxygéné au masque et doit être opéré sans mobilisation du rachis. Son ouverture buccale est limitée, mais il coopère. L’équipe dispose d’un fibroscope, de stylets optiques et d’un vidéolaryngoscope.</p>',
    questions: [
      {
        enonce: 'Quels éléments doivent structurer l’évaluation avant toute sédation ?', format: 'qcm', sourceBlocks: src('b00012', 'b00016', 'b00017', 'b00166', 'b00168', 'b00170'),
        correction_generale: 'L’évaluation précise l’accès oral, la mandibule, les lésions cervicales et la capacité à coopérer. Le plan doit préserver la ventilation spontanée et éviter la mobilisation du rachis.',
        items: [
          { lettre: 'A', enonce: 'L’ouverture buccale limitée influence le choix du dispositif optique.', is_correct: true, justification: 'Une lame ou un stylet oral nécessite un espace suffisant entre les incisives.' },
          { lettre: 'B', enonce: 'La stabilité de l’oxygénation permet de préparer une technique éveillée.', is_correct: true, justification: 'Le patient coopérant conserve sa respiration pendant l’anesthésie topique et le guidage.' },
          { lettre: 'C', enonce: 'La fracture cervicale rend souhaitable une mobilisation ample pour aligner les axes.', is_correct: false, justification: 'L’instabilité impose au contraire de limiter les mouvements du rachis.' },
          { lettre: 'D', enonce: 'Le matériel de secours doit être organisé avant d’administrer une sédation.', is_correct: true, justification: 'Une perte de coopération ou une obstruction doit pouvoir être traitée immédiatement.' },
          { lettre: 'E', enonce: 'L’imagerie traumatologique remplace l’examen clinique des voies aériennes.', is_correct: false, justification: 'Elle décrit les lésions, mais n’évalue pas seule l’accès buccal et mandibulaire.' },
        ],
      },
      {
        newInformation: 'La tomodensitométrie confirme l’instabilité cervicale sans obstruction supraglottique.',
        enonce: 'La tomodensitométrie confirme l’instabilité cervicale sans obstruction supraglottique. Quelle place occupe la fibroscopie ?', format: 'qcm', sourceBlocks: src('b00166', 'b00168', 'b00169', 'b00170', 'b00171'),
        correction_generale: 'La fibroscopie éveillée permet une progression contrôlée avec respiration spontanée et faible mobilisation cervicale. Elle requiert préparation, anesthésie locale et coopération.',
        items: [
          { lettre: 'A', enonce: 'Elle peut être réalisée avant l’induction générale chez ce patient conscient.', is_correct: true, justification: 'Le maintien de la ventilation réduit le risque lié à une perte d’accès après induction.' },
          { lettre: 'B', enonce: 'Elle impose une curarisation complète avant l’introduction du fibroscope.', is_correct: false, justification: 'L’intérêt de la technique éveillée est précisément de conserver la respiration spontanée.' },
          { lettre: 'C', enonce: 'Elle limite les mouvements cervicaux par rapport à une laryngoscopie directe forcée.', is_correct: true, justification: 'Le fibroscope suit la lumière des voies aériennes sans alignement marqué des axes.' },
          { lettre: 'D', enonce: 'Une anesthésie topique soigneuse améliore la tolérance du passage.', is_correct: true, justification: 'Elle réduit toux et réflexes tout en évitant une anesthésie générale prématurée.' },
          { lettre: 'E', enonce: 'Elle serait prioritaire si toute oxygénation devenait impossible.', is_correct: false, justification: 'En CICO, sa préparation est trop lente et l’accès cricothyroïdien s’impose.' },
        ],
      },
      {
        newInformation: 'L’anesthésie topique est efficace, mais l’ouverture buccale reste limitée à deux travers de doigt.',
        enonce: 'L’anesthésie topique est efficace, mais l’ouverture buccale reste limitée à deux travers de doigt. Quels avantages et contraintes offrent les techniques optiques ?', format: 'qcm', sourceBlocks: src('b00139', 'b00140', 'b00166', 'b00168'),
        correction_generale: 'Le fibroscope demande peu d’ouverture et suit un trajet souple. La vidéolaryngoscopie améliore la vue, mais sa lame et la trajectoire du tube exigent un accès oral compatible.',
        items: [
          { lettre: 'A', enonce: 'Le fibroscope souple peut progresser par un espace plus réduit qu’une lame large.', is_correct: true, justification: 'Son diamètre et sa flexibilité conviennent mieux à une ouverture limitée.' },
          { lettre: 'B', enonce: 'Une belle image vidéo garantit le passage du tube malgré l’étroitesse buccale.', is_correct: false, justification: 'La sonde et la lame doivent physiquement franchir la bouche, indépendamment de l’image.' },
          { lettre: 'C', enonce: 'Un stylet optique peut constituer une option pour une équipe entraînée.', is_correct: true, justification: 'La vision distale guide la trajectoire en limitant certains mouvements cervicaux.' },
          { lettre: 'D', enonce: 'Le choix doit tenir compte de l’expérience réelle de l’opérateur.', is_correct: true, justification: 'Une technique rarement pratiquée augmente les manipulations et la durée du geste.' },
          { lettre: 'E', enonce: 'Toutes les techniques optiques suppriment le besoin d’un plan d’oxygénation.', is_correct: false, justification: 'Une panne, des sécrétions ou un échec de passage restent possibles.' },
        ],
      },
      {
        newInformation: 'Le fibroscope progresse difficilement à cause de sécrétions, tandis que le patient reste calme et bien saturé.',
        enonce: 'Le fibroscope progresse difficilement à cause de sécrétions, tandis que le patient reste calme et bien saturé. Quelles précautions permettent de poursuivre ?', format: 'qcm', sourceBlocks: src('b00105', 'b00166', 'b00168', 'b00170'),
        correction_generale: 'La stabilité permet d’interrompre la progression, d’aspirer et de rétablir la visibilité. Il faut conserver l’oxygénation et éviter une sédation qui ferait perdre la ventilation spontanée.',
        items: [
          { lettre: 'A', enonce: 'Retirer légèrement l’endoscope et aspirer les sécrétions.', is_correct: true, justification: 'Une image claire évite la progression aveugle et les faux trajets.' },
          { lettre: 'B', enonce: 'Maintenir l’apport d’oxygène pendant la préparation de la reprise.', is_correct: true, justification: 'La saturation stable doit être préservée tout au long de la procédure.' },
          { lettre: 'C', enonce: 'Augmenter brutalement la sédation pour supprimer toute déglutition.', is_correct: false, justification: 'Une dépression respiratoire pourrait faire perdre l’avantage de la technique éveillée.' },
          { lettre: 'D', enonce: 'Reprendre seulement après récupération d’une vue anatomique exploitable.', is_correct: true, justification: 'Les anneaux et la glotte doivent être reconnus avant d’avancer la sonde.' },
          { lettre: 'E', enonce: 'Forcer le fibroscope contre la résistance puisque la SpO2 reste normale.', is_correct: false, justification: 'La résistance peut signaler un obstacle et expose au traumatisme ou au faux trajet.' },
        ],
      },
      {
        newInformation: 'Les anneaux trachéaux sont visualisés et la sonde est avancée sans mobilisation du cou.',
        enonce: 'Les anneaux trachéaux sont visualisés et la sonde est avancée sans mobilisation du cou. Comment confirmer la position trachéale ?', format: 'qcm', sourceBlocks: src('b00129', 'b00130', 'b00166'),
        correction_generale: 'La vision des anneaux guide correctement le fibroscope, mais la position finale de la sonde est confirmée par le CO2 persistant et l’auscultation bilatérale.',
        items: [
          { lettre: 'A', enonce: 'Rechercher un capnogramme stable pendant plusieurs cycles.', is_correct: true, justification: 'Le CO2 expiré continu atteste une ventilation alvéolaire par la trachée.' },
          { lettre: 'B', enonce: 'Auscultater les deux champs pulmonaires après ventilation.', is_correct: true, justification: 'La symétrie aide à exclure une migration dans une bronche souche.' },
          { lettre: 'C', enonce: 'Considérer la condensation comme une preuve suffisante.', is_correct: false, justification: 'La buée est non spécifique et ne remplace pas la capnographie.' },
          { lettre: 'D', enonce: 'Vérifier et fixer le repère de profondeur de la sonde.', is_correct: true, justification: 'La position doit rester stable pendant les changements opératoires.' },
          { lettre: 'E', enonce: 'Mobiliser fortement le cou pour améliorer l’auscultation.', is_correct: false, justification: 'Ce mouvement est inutile et dangereux pour la fracture instable.' },
        ],
      },
      {
        newInformation: 'Après l’intervention, l’œdème cervical est faible mais la réintubation resterait techniquement difficile.',
        enonce: 'Après l’intervention, l’œdème cervical est faible mais la réintubation resterait techniquement difficile. Quelles conditions précèdent l’extubation ?', format: 'qcm', sourceBlocks: src('b00184', 'b00185', 'b00186'),
        correction_generale: 'L’extubation est différée jusqu’à une récupération complète et réalisée avec une stratégie de reprise immédiate. La faible intensité de l’œdème ne suffit pas à rendre la réintubation simple.',
        items: [
          { lettre: 'A', enonce: 'Obtenir conscience, ventilation efficace et décurarisation complète.', is_correct: true, justification: 'Ces fonctions réduisent l’obstruction et le besoin de réintubation urgente.' },
          { lettre: 'B', enonce: 'Vérifier normothermie et stabilité hémodynamique.', is_correct: true, justification: 'La récupération globale fait partie des critères avant retrait.' },
          { lettre: 'C', enonce: 'Préparer le fibroscope et les dispositifs qui ont réussi initialement.', is_correct: true, justification: 'Le plan de reprise doit utiliser sans délai le matériel adapté.' },
          { lettre: 'D', enonce: 'Extuber dès la fin de chirurgie puisque l’œdème paraît faible.', is_correct: false, justification: 'Le risque dépend aussi de l’accès cervical et de la difficulté technique.' },
          { lettre: 'E', enonce: 'Retirer la sonde dans une zone dépourvue de matériel avancé.', is_correct: false, justification: 'Le geste doit rester dans un environnement offrant aide et oxygénation.' },
        ],
      },
      {
        newInformation: 'Le patient est réveillé et décurarisé ; l’équipe décide d’un retrait contrôlé de la sonde en salle d’opération.',
        enonce: 'Le patient est réveillé et décurarisé ; l’équipe décide d’un retrait contrôlé de la sonde en salle d’opération. Quel dispositif peut conserver un accès de réintubation ?', format: 'qcm', sourceBlocks: src('b00184', 'b00185', 'b00186'),
        correction_generale: 'Un échangeur creux laissé temporairement dans la trachée sert de rail si la sonde doit être remise. Son maintien s’accompagne d’oxygénation et de surveillance.',
        items: [
          { lettre: 'A', enonce: 'Un mandrin long creux peut être maintenu pendant le retrait.', is_correct: true, justification: 'Il matérialise le trajet trachéal malgré la disparition de la sonde principale.' },
          { lettre: 'B', enonce: 'Le guide permet d’avancer rapidement une nouvelle sonde si nécessaire.', is_correct: true, justification: 'Il sert de rail et évite de recommencer toute la procédure d’accès.' },
          { lettre: 'C', enonce: 'Le guide autorise l’absence de surveillance après l’extubation.', is_correct: false, justification: 'Une obstruction et une mauvaise tolérance peuvent toujours survenir.' },
          { lettre: 'D', enonce: 'Le maintien doit être atraumatique et limité au temps utile.', is_correct: true, justification: 'Une pression ou une durée excessive irrite la trachée et provoque toux.' },
          { lettre: 'E', enonce: 'Une sonde nasogastrique constitue un substitut équivalent à l’échangeur.', is_correct: false, justification: 'Elle ne possède ni rigidité ni conception adaptées au guidage trachéal.' },
        ],
      },
    ],
  },
  {
    label: 'Échec de ventilation faciale après induction',
    vignette: '<p>Un homme édenté de 76 ans est induit pour une chirurgie abdominale. L’évaluation avait noté une protrusion mandibulaire correcte, mais le masque fuit et le thorax ne se soulève pas. La SpO2 passe de 99 à 94 %. Une canule oropharyngée, plusieurs tailles de masque et un dispositif supraglottique sont immédiatement disponibles.</p>',
    questions: [
      {
        enonce: 'Quelles causes peuvent expliquer la mauvaise ventilation initiale ?', format: 'qcm', sourceBlocks: src('b00054', 'b00071', 'b00072', 'b00074'),
        correction_generale: 'L’édentation explique la fuite, tandis que la perte de tonus peut obstruer le pharynx. Les deux mécanismes doivent être recherchés avant de conclure à l’échec.',
        items: [
          { lettre: 'A', enonce: 'L’absence de relief dentaire compromet l’appui du masque.', is_correct: true, justification: 'Les joues creuses laissent persister des espaces sous le coussinet.' },
          { lettre: 'B', enonce: 'La langue peut retomber malgré une protrusion correcte à l’état éveillé.', is_correct: true, justification: 'L’induction supprime le tonus qui maintenait le pharynx ouvert.' },
          { lettre: 'C', enonce: 'Une taille de masque inadaptée peut majorer la fuite.', is_correct: true, justification: 'Un coussinet trop grand ou trop petit épouse mal les contours.' },
          { lettre: 'D', enonce: 'La bonne protrusion mandibulaire exclut toute obstruction après induction.', is_correct: false, justification: 'Le potentiel de jaw thrust n’empêche pas l’affaissement spontané des tissus.' },
          { lettre: 'E', enonce: 'La baisse de SpO2 prouve une intubation œsophagienne.', is_correct: false, justification: 'Aucune intubation n’a eu lieu ; elle traduit ici l’inefficacité ventilatoire.' },
        ],
      },
      {
        newInformation: 'La tête est peu étendue, la mandibule retombe et les doigts de l’opérateur compriment les tissus sous-mentonniers.',
        enonce: 'La tête est peu étendue, la mandibule retombe et les doigts de l’opérateur compriment les tissus sous-mentonniers. Quelles corrections appliquer ?', format: 'qcm', sourceBlocks: src('b00067', 'b00068', 'b00074'),
        correction_generale: 'Il faut repositionner la tête, pratiquer le jaw thrust et déplacer les doigts sur l’os mandibulaire. La canule complète ces gestes si la profondeur est suffisante.',
        items: [
          { lettre: 'A', enonce: 'Optimiser l’extension compatible avec son anatomie.', is_correct: true, justification: 'Le repositionnement améliore l’alignement et l’ouverture pharyngée.' },
          { lettre: 'B', enonce: 'Projeter la mandibule vers l’avant.', is_correct: true, justification: 'La subluxation éloigne la langue de la paroi postérieure.' },
          { lettre: 'C', enonce: 'Prendre appui sur le rebord osseux plutôt que sur les tissus mous.', is_correct: true, justification: 'La traction devient efficace sans repousser les tissus dans le pharynx.' },
          { lettre: 'D', enonce: 'Maintenir la compression sous-mentonnière pour stabiliser le masque.', is_correct: false, justification: 'Elle aggrave précisément le mécanisme obstructif observé.' },
          { lettre: 'E', enonce: 'Ajouter une canule oropharyngée si les réflexes sont abolis.', is_correct: true, justification: 'Elle empêche la langue de refermer à nouveau le passage.' },
        ],
      },
      {
        newInformation: 'Après pose d’une canule, une fuite persiste malgré un meilleur passage pharyngé.',
        enonce: 'Après pose d’une canule, une fuite persiste malgré un meilleur passage pharyngé. Comment organiser une ventilation à deux opérateurs ?', format: 'qcm', sourceBlocks: src('b00066', 'b00067', 'b00068', 'b00074'),
        correction_generale: 'Le premier opérateur tient le masque à deux mains et tracte la mandibule ; le second comprime le ballon en surveillant pression, volume et soulèvement thoracique.',
        items: [
          { lettre: 'A', enonce: 'Le premier opérateur réalise une prise bilatérale du masque.', is_correct: true, justification: 'Deux mains répartissent mieux l’appui sur un visage édenté.' },
          { lettre: 'B', enonce: 'Ses doigts maintiennent simultanément le jaw thrust.', is_correct: true, justification: 'La traction conserve le bénéfice obtenu sur la perméabilité pharyngée.' },
          { lettre: 'C', enonce: 'Le second opérateur assure les insufflations contrôlées.', is_correct: true, justification: 'Il peut adapter le ballon pendant que l’étanchéité reste stable.' },
          { lettre: 'D', enonce: 'Les deux opérateurs doivent comprimer ensemble le ballon.', is_correct: false, justification: 'Cette répartition abandonnerait la tenue soigneuse du masque.' },
          { lettre: 'E', enonce: 'Le soulèvement thoracique et la capnographie évaluent l’efficacité.', is_correct: true, justification: 'Ces signes montrent que le gaz atteint réellement les poumons.' },
        ],
      },
      {
        newInformation: 'La SpO2 atteint 90 % et la ventilation faciale reste insuffisante malgré deux opérateurs.',
        enonce: 'La SpO2 atteint 90 % et la ventilation faciale reste insuffisante malgré deux opérateurs. Quelle place donner au dispositif supraglottique ?', format: 'qcm', sourceBlocks: src('b00084', 'b00086', 'b00154'),
        correction_generale: 'L’échec facial optimisé et la baisse de saturation imposent une insertion supraglottique précoce. Il ne faut ni attendre une hypoxémie sévère ni répéter les mêmes insufflations.',
        items: [
          { lettre: 'A', enonce: 'Insérer sans délai le dispositif déjà préparé.', is_correct: true, justification: 'Il contourne le défaut d’étanchéité faciale et peut restaurer les volumes.' },
          { lettre: 'B', enonce: 'Attendre une SpO2 inférieure à 70 % pour confirmer l’indication.', is_correct: false, justification: 'Le retard réduit la marge avant les lésions hypoxiques.' },
          { lettre: 'C', enonce: 'Choisir une taille adaptée et vérifier la profondeur d’insertion.', is_correct: true, justification: 'Une mauvaise taille ou un dispositif trop superficiel entretient les fuites.' },
          { lettre: 'D', enonce: 'Continuer uniquement la ventilation faciale puisque la canule est en place.', is_correct: false, justification: 'La technique optimisée échoue déjà et ne doit pas être prolongée.' },
          { lettre: 'E', enonce: 'Appeler de l’aide pendant la mise en place.', is_correct: true, justification: 'Le renfort prépare l’intubation ou l’accès invasif si le sauvetage échoue.' },
        ],
      },
      {
        newInformation: 'Un i-Gel est inséré rapidement et permet un soulèvement thoracique régulier.',
        enonce: 'Un i-Gel est inséré rapidement et permet un soulèvement thoracique régulier. Quels contrôles et limites faut-il connaître ?', format: 'qcm', sourceBlocks: src('b00086', 'b00087', 'b00095', 'b00096', 'b00097'),
        correction_generale: 'L’efficacité est confirmée par volume, thorax et CO2. Le bourrelet de l’i-Gel ne se gonfle pas ; son canal gastrique est utile, mais la protection contre l’inhalation reste incomplète.',
        items: [
          { lettre: 'A', enonce: 'Rechercher un capnogramme régulier et un volume courant satisfaisant.', is_correct: true, justification: 'Ces données confirment une ventilation alvéolaire efficace par le dispositif.' },
          { lettre: 'B', enonce: 'Gonfler son bourrelet jusqu’à disparition de toute fuite.', is_correct: false, justification: 'Le coussinet de l’i-Gel est plein et ne reçoit pas d’air.' },
          { lettre: 'C', enonce: 'Utiliser le canal gastrique si un drainage est nécessaire.', is_correct: true, justification: 'La lumière séparée donne accès à l’œsophage sans interrompre la ventilation.' },
          { lettre: 'D', enonce: 'Considérer la trachée comme totalement protégée du contenu gastrique.', is_correct: false, justification: 'Le dispositif reste au-dessus de la glotte, sans ballonnet intratrachéal.' },
          { lettre: 'E', enonce: 'Surveiller toute nouvelle fuite ou augmentation des pressions.', is_correct: true, justification: 'Une migration ou une obstruction peut secondairement dégrader l’efficacité.' },
        ],
      },
      {
        newInformation: 'Le dispositif est stable, l’oxygénation est restaurée et un fibroscope est disponible.',
        enonce: 'Le dispositif est stable, l’oxygénation est restaurée et un fibroscope est disponible. Quelles conditions permettent une intubation à travers le dispositif ?', format: 'qcm', sourceBlocks: src('b00087', 'b00129', 'b00166'),
        correction_generale: 'L’intubation guidée peut être préparée sans interrompre une oxygénation stable. Le fibroscope franchit la glotte, la sonde suit le guide et la capnographie confirme le résultat.',
        items: [
          { lettre: 'A', enonce: 'Vérifier que le modèle autorise le passage d’une sonde compatible.', is_correct: true, justification: 'Le diamètre interne limite le calibre du fibroscope et du tube.' },
          { lettre: 'B', enonce: 'Maintenir la ventilation jusqu’au moment nécessaire à la progression.', is_correct: true, justification: 'La voie acquise ne doit pas être perdue pendant la préparation.' },
          { lettre: 'C', enonce: 'Faire avancer le fibroscope sous contrôle visuel jusque dans la trachée.', is_correct: true, justification: 'La visualisation des anneaux sécurise le trajet avant le rail de la sonde.' },
          { lettre: 'D', enonce: 'Retirer le dispositif avant d’avoir préparé le fibroscope.', is_correct: false, justification: 'Cette action supprimerait la seule oxygénation efficace.' },
          { lettre: 'E', enonce: 'Confirmer la position finale par un CO2 expiré persistant.', is_correct: true, justification: 'Le guidage visuel ne remplace pas la preuve ventilatoire après mise en place.' },
        ],
      },
      {
        newInformation: 'La sonde est finalement guidée dans la trachée sans nouvelle désaturation.',
        enonce: 'La sonde est finalement guidée dans la trachée sans nouvelle désaturation. Quels principes ont évité la transformation en CICO ?', format: 'qcm', sourceBlocks: src('b00084', 'b00154', 'b00158', 'b00195'),
        correction_generale: 'La prise en charge a traité l’oxygénation avant l’intubation : optimisation faciale, recours précoce au supraglottique, appel à l’aide et guidage seulement après stabilisation.',
        items: [
          { lettre: 'A', enonce: 'La ventilation faciale a été optimisée avant d’être déclarée impossible.', is_correct: true, justification: 'Les corrections techniques ont distingué un échec réversible d’une impasse réelle.' },
          { lettre: 'B', enonce: 'Le supraglottique a été posé avant l’hypoxémie profonde.', is_correct: true, justification: 'Cette anticipation a restauré rapidement une réserve en oxygène.' },
          { lettre: 'C', enonce: 'L’intubation a été différée jusqu’à la stabilisation ventilatoire.', is_correct: true, justification: 'Le geste définitif a été préparé sans sacrifier les échanges gazeux.' },
          { lettre: 'D', enonce: 'Les mêmes insufflations inefficaces ont été répétées jusqu’au succès.', is_correct: false, justification: 'La réussite est venue du changement de technique, non de la répétition.' },
          { lettre: 'E', enonce: 'La préparation du secours invasif serait inutile dans un cas comparable.', is_correct: false, justification: 'Un échec du supraglottique aurait imposé un accès trachéal immédiat.' },
        ],
      },
    ],
  },
];

function makeQroc(enonce, reponse_attendue, correction_generale, sourceBlocks, newInformation) {
  return {
    enonce: `${newInformation ? `${newInformation} ` : ''}${enonce}`,
    ...(newInformation ? { newInformation } : {}),
    format: 'qroc',
    reponse_attendue,
    correction_generale,
    items: [],
    sourceBlocks,
  };
}

const ISOLATED_QROC = [
  ['Quel test clinique apprécie directement la protrusion mandibulaire ?', 'Upper lip bite test|test de morsure de la lèvre supérieure', 'Le test demande au patient de mordre sa lèvre supérieure ; l’échec traduit une mandibule peu subluxable.', src('b00018', 'b00024')],
  ['Quelles classes de Mallampati augmentent le risque de ventilation au masque difficile ?', 'Classes III et IV|Mallampati 3 et 4', 'Une langue volumineuse par rapport à la cavité orale rend l’obstruction et la prise au masque plus probables.', src('b00015')],
  ['Quel antécédent doit être recherché en priorité avant une nouvelle anesthésie ?', 'Antécédent d’intubation difficile', 'Une difficulté antérieure documentée est une donnée directement exploitable pour modifier le plan et préparer les secours.', src('b00012', 'b00200', 'b00201')],
  ['Quel est le niveau cervical habituel du larynx adulte ?', 'C4 à C6|entre C4 et C6', 'Le larynx adulte s’étend de C4 à C6, alors qu’il est situé plus haut chez le jeune enfant.', src('b00006')],
  ['Quelle complication menace une atteinte bilatérale des nerfs récurrents ?', 'Obstruction complète des voies aériennes|fermeture glottique complète', 'La paralysie bilatérale peut immobiliser les deux cordes près de la ligne médiane et fermer la glotte.', src('b00006')],
  ['Quel seuil de fraction télé-expiratoire d’oxygène valide la préoxygénation ?', 'Supérieure à 90 %|FeO2 > 90 %', 'Cette cible témoigne d’une dénitrogénation alvéolaire bien plus précisément qu’une SpO2 maximale.', src('b00036', 'b00041')],
  ['Quel débit de gaz frais limite la réinspiration pendant la préoxygénation ?', '10 à 12 L/min|10-12 L/min', 'Un débit frais élevé, associé à un masque étanche, empêche le mélange avec l’air et les gaz expirés.', src('b00038')],
  ['Quelle technique rapide assure une préoxygénation efficace ?', 'Huit inspirations profondes en 60 secondes|8 RP en 60 s', 'Chez un patient coopérant, cette technique obtient une qualité proche de trois minutes de respiration courante.', src('b00043')],
  ['Pourquoi la SpO2 à 100 % ne suffit-elle pas à évaluer la préoxygénation ?', 'Elle ne mesure pas la dénitrogénation pulmonaire|elle ne mesure pas la réserve alvéolaire', 'L’hémoglobine peut être saturée alors que la capacité résiduelle fonctionnelle contient encore beaucoup d’azote.', src('b00036')],
  ['Quel volume pulmonaire constitue le principal réservoir d’oxygène après préoxygénation ?', 'Capacité résiduelle fonctionnelle|CRF', 'L’oxygène remplace l’azote dans la CRF et augmente ainsi la réserve disponible pendant l’apnée.', src('b00027')],
  ['Quelle pression inspiratoire maximale est souhaitable au masque facial ?', 'Moins de 20 cmH2O|< 20 cmH2O', 'Des pressions plus élevées favorisent l’insufflation et la distension gastriques sans protéger de l’inhalation.', src('b00057')],
  ['Quelle manœuvre mandibulaire libère rapidement le pharynx au masque ?', 'Jaw thrust|subluxation mandibulaire', 'La traction antérieure de la mandibule éloigne la langue de la paroi pharyngée postérieure.', src('b00074')],
  ['Comment répartir les rôles lors d’une ventilation faciale à deux opérateurs ?', 'Un opérateur tient le masque à deux mains et l’autre ventile', 'La séparation des tâches améliore l’étanchéité, la subluxation mandibulaire et la qualité des insufflations.', src('b00074')],
  ['Où doivent prendre appui les doigts sous la mandibule ?', 'Sur l’os mandibulaire|sur les structures osseuses', 'Une pression sur les tissus mous sous-mentonniers aggrave l’obstruction au lieu de soulever la mandibule.', src('b00067', 'b00068')],
  ['Quelle aide pharyngée choisir chez un patient profondément anesthésié sans réflexe nauséeux ?', 'Canule oropharyngée|canule de Guedel', 'La canule empêche l’affaissement de la langue et améliore la circulation du gaz vers le larynx.', src('b00074')],
  ['Quelle génération de dispositif supraglottique possède souvent un canal gastrique ?', 'Deuxième génération', 'La lumière séparée améliore le drainage gastrique et l’étanchéité par rapport aux premiers modèles.', src('b00086')],
  ['Quel dispositif supraglottique possède un bourrelet plein non gonflable ?', 'i-Gel|iGel', 'Le matériau souple épouse l’oropharynx sans nécessiter de gonflage du coussinet distal.', src('b00095', 'b00096', 'b00097')],
  ['Quelle est la limite protectrice majeure d’un masque laryngé ?', 'Il ne protège pas complètement de l’inhalation gastrique', 'Sa position au-dessus de la glotte ne sépare pas hermétiquement la trachée du contenu pharyngé.', src('b00087')],
  ['Quel rôle de sauvetage a un dispositif supraglottique après échec d’intubation ?', 'Rétablir l’oxygénation|assurer une ventilation extraglottique', 'Sa pose précoce évite que des laryngoscopies répétées conduisent à une hypoxémie ou à un CICO.', src('b00154')],
  ['Par quel trajet certains dispositifs supraglottiques permettent-ils d’intuber ?', 'À travers le conduit du dispositif|à travers le masque laryngé', 'La sonde peut être guidée alors que le dispositif reste en place et continue de servir de voie d’oxygénation.', src('b00087')],
  ['Quel signe capnographique confirme une intubation trachéale ?', 'CO2 expiré continu sur 3 à 4 cycles|capnogramme stable sur plusieurs cycles', 'Une courbe persistante pendant plusieurs ventilations distingue la trachée d’un passage œsophagien.', src('b00129')],
  ['À quelle distance minimale de la carène placer l’extrémité de la sonde ?', 'Au moins 2 cm', 'Cette marge réduit le risque de migration endobronchique lors des mouvements de tête ou du patient.', src('b00128', 'b00129')],
  ['Quelle lame de laryngoscope est la plus utilisée chez l’adulte ?', 'Macintosh numéro 3|lame Macintosh 3', 'La lame courbe numéro 3 constitue le matériel de référence pour la laryngoscopie adulte.', src('b00109')],
  ['Quel mouvement du laryngoscope doit être absolument évité ?', 'La bascule sur les dents|l’appui sur les incisives', 'La traction doit suivre son axe sans utiliser les dents comme levier, afin de prévenir le traumatisme dentaire.', src('b00112', 'b00115')],
  ['Sur quel cartilage applique-t-on la manœuvre BURP ?', 'Cartilage thyroïde', 'La mobilisation vers l’arrière, le haut et la droite est transmise au larynx par le cartilage thyroïde.', src('b00131')],
  ['Quelle technique de référence convient à une intubation difficile prévue ?', 'Fibroscopie éveillée|intubation fibroscopique éveillée', 'Elle préserve la ventilation spontanée et évite une mobilisation cervicale importante pendant le guidage.', src('b00168', 'b00169', 'b00170', 'b00171')],
  ['Quel dispositif simple peut guider la sonde devant une vue glottique de grade III ?', 'Bougie d’Eschmann|mandrin long|mandrin de Frova', 'L’introducteur franchit la glotte partiellement visible puis sert de rail à la sonde trachéale.', src('b00164')],
  ['Quel est l’objectif prioritaire après une première intubation échouée ?', 'Maintenir l’oxygénation|restaurer l’oxygénation', 'La prévention de l’hypoxie impose de ventiler et de limiter les tentatives avant toute recherche de perfection technique.', src('b00158', 'b00195')],
  ['Pourquoi le vidéolaryngoscope requiert-il souvent un mandrin ?', 'Pour orienter la sonde selon la courbure de la lame', 'La glotte est vue indirectement, mais le tube doit suivre un trajet angulé pour la rejoindre.', src('b00140')],
  ['Dans quelle situation la fibroscopie n’est-elle pas une solution adaptée ?', 'CICO|impossibilité d’intuber et d’oxygéner', 'La préparation est trop longue alors que l’hypoxémie impose immédiatement un accès trachéal.', src('b00170', 'b00175')],
  ['Où se situe la membrane utilisée pour la cricothyroïdotomie ?', 'Entre le cartilage thyroïde et le cartilage cricoïde', 'Cette membrane médiane offre l’accès le plus rapide à la lumière respiratoire en urgence.', src('b00144')],
  ['Quel calibre de cathéter peut assurer une oxygénation transtrachéale temporaire ?', '14 ou 16 G|cathéter 14-16 G', 'Ces calibres se relient au circuit ou, de préférence, à une source d’oxygène à haut débit.', src('b00179')],
  ['Que signifie l’acronyme CICO ?', 'Cannot intubate, cannot oxygenate|impossible d’intuber et d’oxygéner', 'Le terme désigne l’échec conjoint des techniques d’intubation et de toutes les voies d’oxygénation non invasives.', src('b00145', 'b00154')],
  ['Quelle complication gazeuse rechercher après ventilation transtrachéale ?', 'Pneumothorax|emphysème sous-cutané', 'Une expiration entravée ou un cathéter mal placé peut provoquer un barotraumatisme et une diffusion extra-trachéale.', src('b00179')],
  ['Quelle anomalie cervicale contre-indique une intubation rétrograde ?', 'Hématome cervical|anatomie cervicale antérieure modifiée', 'La déformation du trajet augmente le risque d’échec, de saignement et de faux passage.', src('b00182')],
  ['Quel état neuromusculaire est exigé avant l’extubation ?', 'Levée complète du bloc neuromusculaire|décurarisation complète', 'La récupération musculaire conditionne une ventilation, une toux et une protection laryngée efficaces.', src('b00184')],
  ['Quel guide peut sécuriser l’extubation d’une voie aérienne difficile ?', 'Mandrin long creux|échangeur de sonde creux', 'Il maintient un chemin vers la trachée pour une réintubation urgente après retrait de la sonde.', src('b00184', 'b00185', 'b00186')],
  ['Quel est l’objectif de l’induction en séquence rapide ?', 'Réduire le délai entre perte des réflexes et intubation trachéale', 'L’enchaînement rapide diminue la durée pendant laquelle la trachée n’est plus protégée du contenu gastrique.', src('b00191')],
  ['Quelle force exercer pour une pression cricoïdienne efficace ?', '30 N|30 newtons', 'Cette force vise à comprimer l’œsophage supérieur contre le rachis cervical.', src('b00192')],
  ['Que faire si la pression cricoïdienne empêche l’oxygénation ?', 'La modifier ou la relâcher|cesser la pression', 'La ventilation et la sécurisation de la voie aérienne priment sur le maintien d’une manœuvre inefficace ou dangereuse.', src('b00193')],
];

const DP_QROC_CASES = [
  {
    label: 'Bilan avant chirurgie ORL',
    vignette: '<p>Un homme de 64 ans doit être opéré d’une tumeur amygdalienne. Il rapporte une intubation difficile ancienne sans document disponible. Il est barbu, édenté, Mallampati III, avec une extension cervicale réduite. Une endoscopie ORL décrit une déformation pharyngée sans obstruction complète. L’équipe veut conserver une ventilation spontanée jusqu’à la sécurisation de la trachée.</p>',
    steps: [
      ['Quel élément anamnestique a le plus de poids pour préparer sa stratégie ?', 'Antécédent d’intubation difficile', 'Une difficulté antérieure, même incomplètement documentée, impose de préparer une technique et un plan de secours.', src('b00012', 'b00200', 'b00201'), null],
      ['Quel risque faut-il maintenant anticiper en plus de l’intubation difficile ?', 'Ventilation au masque difficile', 'Barbe, édentation et Mallampati III cumulent plusieurs facteurs de mauvaise étanchéité et d’obstruction pharyngée.', src('b00071', 'b00072'), 'L’examen confirme une protrusion mandibulaire limitée, une barbe dense et une absence complète de dents.'],
      ['Quelle technique de référence permet de conserver la ventilation spontanée ?', 'Fibroscopie éveillée|intubation fibroscopique éveillée', 'La fibroscopie éveillée guide la sonde sans curare et sans supprimer prématurément la respiration spontanée.', src('b00168', 'b00170', 'b00171'), 'Le patient coopère et accepte une anesthésie locale topique des voies aériennes.'],
      ['Quel signe endoscopique prouve que le fibroscope est dans la trachée ?', 'Visualisation des anneaux trachéaux', 'Les anneaux trachéaux identifient la lumière respiratoire avant de faire progresser la sonde.', src('b00166'), 'Le fibroscope franchit la glotte et montre une succession régulière d’anneaux cartilagineux.'],
      ['Quel monitorage confirme ensuite la bonne position de la sonde ?', 'Capnographie|CO2 expiré continu', 'Un capnogramme persistant sur plusieurs cycles confirme la ventilation trachéale après le contrôle visuel.', src('b00129'), 'La sonde est avancée ; la ventilation débute et une courbe de CO2 apparaît immédiatement.'],
      ['Quel dispositif faut-il envisager avant de retirer cette sonde difficile ?', 'Mandrin long creux|échangeur de sonde', 'Le guide laissé dans la trachée rend possible une réintubation rapide si l’œdème obstrue la voie aérienne.', src('b00184', 'b00185', 'b00186'), 'En fin d’intervention, un œdème pharyngé modéré rendrait une réintubation urgente délicate.'],
      ['Quelle récupération pharmacologique est indispensable avant l’extubation ?', 'Décurarisation complète|levée complète du bloc neuromusculaire', 'La récupération neuromusculaire restaure ventilation, toux et protection laryngée avant le retrait.', src('b00184'), 'Le patient est conscient et stable, mais le monitorage neuromusculaire révèle encore un bloc résiduel.'],
    ],
  },
  {
    label: 'Préoxygénation d’une patiente obèse',
    vignette: '<p>Une femme de 46 ans, IMC 48 kg/m², doit être anesthésiée pour une chirurgie bariatrique. Elle est installée en décubitus dorsal, respire calmement et sa SpO2 vaut 98 %. L’équipe sait que sa capacité résiduelle fonctionnelle est basse et que la désaturation peut survenir pendant le temps d’une seule tentative de laryngoscopie.</p>',
    steps: [
      ['Quel mécanisme réduit principalement sa réserve d’oxygène ?', 'Diminution de la capacité résiduelle fonctionnelle|baisse de la CRF', 'La CRF basse réduit le volume pulmonaire disponible pour stocker l’oxygène après dénitrogénation.', src('b00050'), null],
      ['Quelle position peut augmenter sa capacité résiduelle fonctionnelle ?', 'Position semi-assise|position proclive', 'L’élévation du tronc augmente le volume pulmonaire de fin d’expiration et prolonge l’apnée.', src('b00046', 'b00050'), 'La table permet de relever le thorax sans provoquer d’hypotension.'],
      ['Quel indicateur faut-il suivre plutôt que la seule SpO2 ?', 'Fraction télé-expiratoire d’oxygène|FeO2', 'La fraction expirée mesure la dénitrogénation alors que la saturation peut être maximale très tôt.', src('b00036'), 'Après une minute d’oxygène pur, sa SpO2 atteint 100 % mais la fraction expirée reste à 78 %.'],
      ['Quelle cible expirée indique une préoxygénation satisfaisante ?', 'Supérieure à 90 %|FeO2 > 90 %', 'Une fraction télé-expiratoire au-dessus de 90 % traduit un remplacement presque complet de l’azote alvéolaire.', src('b00036', 'b00041'), 'Après correction de la fuite du masque, la fraction télé-expiratoire progresse régulièrement.'],
      ['Quelle technique rapide serait acceptable si le temps manquait ?', 'Huit inspirations profondes en 60 secondes|8 RP 60 s', 'Chez l’obèse, la séquence à huit inspirations est préférable à quatre inspirations en trente secondes.', src('b00050'), 'La patiente reste parfaitement coopérante, mais le chirurgien annonce un délai opératoire très court.'],
      ['Quelle pression respiratoire peut encore augmenter sa CRF ?', 'PEEP|pression positive télé-expiratoire', 'La PEEP recrute les unités pulmonaires et augmente le réservoir d’oxygène disponible.', src('b00048', 'b00050'), 'L’induction est réalisée sans risque d’inhalation identifié et l’équipe souhaite prolonger la marge d’apnée.'],
      ['Pourquoi cette pression serait-elle évitée si l’estomac était plein ?', 'Risque d’insufflation gastrique et d’inhalation', 'La ventilation positive peut distendre l’estomac et favoriser une régurgitation avant la protection trachéale.', src('b00050', 'b00191'), 'Une information tardive révèle finalement des vomissements récents et une possible stase gastrique.'],
    ],
  },
  {
    label: 'Ventilation faciale chez un patient édenté',
    vignette: '<p>Un homme de 82 ans est anesthésié pour une réduction de fracture. Il est édenté et présente une perte de tonus des joues. Après induction, une fuite importante empêche l’obtention d’un volume courant satisfaisant. La SpO2 commence à diminuer ; une aide, des canules et plusieurs masques sont immédiatement accessibles.</p>',
    steps: [
      ['Quel facteur anatomique explique d’abord la fuite autour du masque ?', 'Édentation|absence de dents', 'La perte du relief dentaire empêche l’appui régulier du masque et favorise les fuites chez le sujet âgé.', src('b00054', 'b00071', 'b00072'), null],
      ['Quelle manœuvre mandibulaire doit être ajoutée à la prise du masque ?', 'Jaw thrust|subluxation mandibulaire', 'La projection de la mandibule vers l’avant libère le pharynx et améliore le passage du gaz.', src('b00074'), 'Le thorax ne se soulève toujours pas et la langue paraît obstruer le pharynx.'],
      ['Quelle canule peut maintenir le passage pharyngé ?', 'Canule oropharyngée|canule de Guedel', 'Chez un patient profondément anesthésié, elle empêche la langue de retomber sur la paroi postérieure.', src('b00074'), 'Le patient n’a plus de réflexe nauséeux et l’ouverture buccale est suffisante.'],
      ['Comment répartir les rôles pour améliorer l’étanchéité ?', 'Un opérateur tient à deux mains, le second ventile', 'La prise à deux mains optimise à la fois la traction mandibulaire et l’appui périphérique du masque.', src('b00074'), 'Une seconde personne arrive alors que la fuite persiste malgré la canule.'],
      ['Quel dispositif doit être posé si ces mesures échouent ?', 'Dispositif supraglottique|masque laryngé', 'Le dispositif supraglottique contourne les difficultés d’étanchéité faciale et restaure rapidement l’oxygénation.', src('b00154'), 'La SpO2 atteint 88 % malgré une technique faciale à deux opérateurs bien conduite.'],
      ['Quel canal du dispositif de deuxième génération réduit le risque gastrique ?', 'Canal gastrique|lumière de drainage gastrique', 'Cette lumière séparée permet d’aspirer ou de drainer le contenu situé en regard de l’œsophage.', src('b00086'), 'Un masque laryngé de deuxième génération est inséré et ventile correctement.'],
      ['Quelle limite de protection persiste malgré la ventilation obtenue ?', 'Protection incomplète contre l’inhalation gastrique', 'La trachée n’est pas isolée par un ballonnet sous-glottique malgré une étanchéité ventilatoire satisfaisante.', src('b00087'), 'Le volume courant devient satisfaisant, mais le patient avait présenté des nausées avant l’intervention.'],
    ],
  },
  {
    label: 'Migration endobronchique peropératoire',
    vignette: '<p>Une femme de 38 ans est intubée sans difficulté pour une chirurgie en décubitus latéral. La sonde avait été fixée après visualisation du ballonnet sous les cordes et capnogramme stable. Après le changement de position, la pression inspiratoire augmente et l’auscultation devient très asymétrique, sans disparition du CO2 expiré.</p>',
    steps: [
      ['Quel contrôle initial prouvait la position trachéale ?', 'CO2 expiré continu sur plusieurs cycles|capnographie persistante', 'Une courbe régulière pendant trois ou quatre cycles confirme que la ventilation passe par la trachée.', src('b00129'), null],
      ['Quelle complication mécanique doit être suspectée en premier ?', 'Intubation endobronchique|migration de la sonde dans une bronche souche', 'Une sonde trop profonde ventile un seul poumon tout en conservant un capnogramme présent.', src('b00128', 'b00129'), 'Le murmure vésiculaire est nettement diminué à gauche après la mise en décubitus latéral.'],
      ['Quelle distance minimale doit séparer la pointe de la carène ?', 'Au moins 2 cm', 'Cette marge laisse une réserve aux déplacements de sonde produits par la position et les mouvements cervicaux.', src('b00128', 'b00129'), 'Le repère de profondeur montre que la sonde a progressé depuis sa fixation initiale.'],
      ['Quel examen clinique vérifie la symétrie après correction ?', 'Auscultation pulmonaire bilatérale', 'Le retour d’un murmure vésiculaire symétrique complète la surveillance capnographique.', src('b00129'), 'La sonde est retirée de deux centimètres tout en maintenant la ventilation.'],
      ['Quel examen peut confirmer la profondeur si le doute persiste ?', 'Fibroscopie|radiographie thoracique', 'La fibroscopie localise directement la carène ; la radiographie montre la position de l’extrémité distale.', src('b00130'), 'Malgré une meilleure auscultation, la pression reste élevée et l’équipe souhaite localiser précisément la pointe.'],
      ['Quelle propriété matérielle rend la sonde visible en radiographie ?', 'Son caractère radioopaque|radio-opacité de la sonde', 'Le matériau de la sonde contient un repère radioopaque permettant son contrôle sur un cliché thoracique.', src('b00103'), 'Une radiographie portable est demandée pendant la poursuite de la ventilation.'],
      ['Quel autre élément faut-il recontrôler après repositionnement ?', 'Pression du ballonnet|étanchéité du ballonnet', 'Un déplacement et une nouvelle fixation justifient de vérifier que le ballonnet reste étanche sans surpression muqueuse.', src('b00103', 'b00108'), 'La sonde est finalement fixée à une nouvelle profondeur après restauration d’une ventilation bilatérale.'],
    ],
  },
  {
    label: 'Échec de laryngoscopie directe',
    vignette: '<p>Un homme de 52 ans est anesthésié pour une chirurgie orthopédique. La ventilation faciale est efficace, mais la première laryngoscopie ne montre que l’épiglotte. L’opérateur s’arrête sans traumatiser les dents. La SpO2 reste à 99 % et le chariot contient plusieurs lames, une bougie, un vidéolaryngoscope et un masque laryngé.</p>',
    steps: [
      ['Quel grade de Cormack-Lehane correspond à la seule épiglotte visible ?', 'Grade III|Cormack III', 'Le grade III correspond à une glotte non visible alors que l’épiglotte reste identifiable.', src('b00120', 'b00123', 'b00124'), null],
      ['Quelle correction positionnelle doit précéder une nouvelle tentative ?', 'Repositionner la tête en position de reniflement', 'Une flexion cervicale et une extension adaptées rapprochent les axes oral, pharyngé et laryngé.', src('b00111', 'b00158'), 'La tête reposait presque à plat et les axes oral et pharyngé étaient mal alignés.'],
      ['Quelle manipulation externe peut améliorer l’exposition ?', 'BURP|pression laryngée externe optimale', 'La mobilisation du cartilage thyroïde vers l’arrière, le haut et la droite peut faire apparaître la glotte.', src('b00131', 'b00158'), 'Après repositionnement, la glotte reste à peine visible mais le cartilage thyroïde est facilement accessible.'],
      ['Quel introducteur peut franchir une glotte partiellement visible ?', 'Mandrin long|bougie d’Eschmann|mandrin de Frova', 'La bougie semi-rigide progresse sous contrôle puis sert de rail à la sonde trachéale.', src('b00164'), 'La manipulation laryngée fait apparaître brièvement le bord postérieur de la glotte.'],
      ['Quelle technique vidéo peut augmenter le succès au nouvel essai ?', 'Vidéolaryngoscopie|vidéolaryngoscope', 'La caméra améliore la vue indirecte de la glotte et le succès dès la première tentative vidéo.', src('b00139', 'b00140'), 'La bougie n’a pas franchi la glotte et l’oxygénation reste excellente entre les tentatives.'],
      ['Quel moyen doit restaurer l’oxygénation si la ventilation faciale se dégrade ?', 'Dispositif supraglottique|masque laryngé', 'Sa pose précoce offre une voie d’oxygénation extraglottique avant l’installation d’un CICO.', src('b00154'), 'Un œdème progressif rend maintenant la ventilation au masque moins efficace.'],
      ['Quelle priorité s’impose si ni masque ni dispositif supraglottique n’oxygènent ?', 'Accès trachéal invasif|cricothyroïdotomie', 'L’impossibilité d’oxygéner interdit de poursuivre les tentatives et impose un accès cricothyroïdien immédiat.', src('b00154', 'b00175'), 'Malgré la pose correcte du dispositif supraglottique, la SpO2 chute et aucun volume n’est délivré.'],
    ],
  },
  {
    label: 'Cricothyroïdotomie de sauvetage',
    vignette: '<p>Une femme de 29 ans développe un laryngospasme réfractaire puis un œdème massif après une réaction périopératoire. La ventilation faciale et le dispositif supraglottique sont inefficaces, et aucune structure glottique n’est visible. La SpO2 chute rapidement. Un opérateur repère la face antérieure du cou pendant qu’un autre appelle du renfort.</p>',
    steps: [
      ['Quel acronyme décrit l’impossibilité actuelle d’intuber et d’oxygéner ?', 'CICO|cannot intubate cannot oxygenate', 'Le CICO associe l’échec d’intubation à l’échec de toutes les techniques non invasives d’oxygénation.', src('b00145', 'b00154'), null],
      ['Quelle membrane doit être identifiée sur la ligne médiane ?', 'Membrane cricothyroïdienne', 'Elle se situe entre les cartilages thyroïde et cricoïde et donne un accès rapide à la trachée.', src('b00144'), 'Le cartilage thyroïde et le cricoïde deviennent palpables malgré l’œdème cervical.'],
      ['Quel accès doit être réalisé sans nouvelle tentative laryngoscopique ?', 'Cricothyroïdotomie|abord cricothyroïdien', 'En CICO, l’accès trachéal devient le seul moyen de prévenir une hypoxie irréversible.', src('b00144', 'b00154', 'b00175'), 'La SpO2 atteint 72 % et l’oxygénation reste impossible par les voies supérieures.'],
      ['Quel calibre de cathéter permet une oxygénation transtrachéale temporaire ?', '14 ou 16 G|cathéter 14-16 G', 'Un cathéter de ce calibre peut être relié à une source d’oxygène, idéalement à haut débit.', src('b00179'), 'Le kit chirurgical complet n’est pas encore ouvert, mais un cathéter adapté est immédiatement disponible.'],
      ['Quel diamètre de sonde peut sécuriser ensuite l’accès ?', '5 ou 6 mm|sonde de 5-6 mm', 'Une petite sonde trachéale introduite par l’abord permet ventilation, oxygénation et protection de la voie.', src('b00175', 'b00179'), 'L’oxygénation revient après ponction et l’équipe élargit maintenant l’accès cricothyroïdien.'],
      ['Quelle complication évoque l’apparition d’air sous-cutané cervical ?', 'Emphysème sous-cutané', 'Le gaz a diffusé hors de la trachée, souvent par malposition ou fuite autour de l’accès.', src('b00146', 'b00179'), 'Une crépitation palpable apparaît autour du cou pendant la ventilation à haut débit.'],
      ['Quelle complication thoracique doit alors être recherchée ?', 'Pneumothorax', 'Une expiration gênée sous haut débit peut provoquer un barotraumatisme associé à l’emphysème.', src('b00179', 'b00182'), 'La pression ventilatoire augmente et l’hémithorax droit se soulève moins que le gauche.'],
    ],
  },
  {
    label: 'Inhalation gastrique évitée en urgence',
    vignette: '<p>Un homme de 45 ans arrive au bloc pour péritonite, trois heures après un repas et avec vomissements actifs. Il est tachypnéique, mais encore coopérant. L’ouverture buccale est normale et le vidéolaryngoscope est prêt. L’objectif est de protéger rapidement la trachée tout en préservant la courte réserve d’oxygène disponible.</p>',
    steps: [
      ['Quelle technique d’induction est indiquée ?', 'Induction en séquence rapide|intubation en séquence rapide', 'L’urgence, l’estomac plein et les vomissements créent un risque majeur d’inhalation gastrique.', src('b00188', 'b00191'), null],
      ['Quel objectif respiratoire doit être atteint avant l’injection ?', 'Préoxygénation complète|FeO2 supérieure à 90 %', 'Le réservoir pulmonaire doit être maximal avant la période d’apnée sans ventilation manuelle.', src('b00031', 'b00036', 'b00041'), 'Le masque devient étanche et la fraction télé-expiratoire d’oxygène est mesurable.'],
      ['Quel est le but temporel de la séquence rapide ?', 'Minimiser le délai entre perte des réflexes et intubation', 'La trachée doit être isolée au plus vite après que l’induction a supprimé les réflexes protecteurs.', src('b00191'), 'La fraction expirée atteint 92 % et les médicaments d’induction sont prêts à être injectés.'],
      ['Pourquoi évite-t-on les insufflations faciales systématiques pendant l’apnée ?', 'Pour éviter la distension gastrique|pour limiter l’inhalation', 'Les pressions positives peuvent gonfler l’estomac et déclencher régurgitation avant le gonflage du ballonnet.', src('b00191'), 'La saturation reste à 100 % immédiatement après la perte de conscience.'],
      ['Sur quel cartilage s’exerce la pression de Sellick ?', 'Cartilage cricoïde', 'Le cricoïde est comprimé vers le rachis dans l’objectif d’occlure l’œsophage supérieur.', src('b00192'), 'Un assistant formé applique une pression cervicale pendant la laryngoscopie.'],
      ['Quelle adaptation est requise si cette pression masque la glotte ?', 'Diminuer ou relâcher la pression cricoïdienne', 'Une manœuvre gênant la vue ou l’oxygénation ne doit pas empêcher la sécurisation effective de la trachée.', src('b00193'), 'La vue glottique disparaît sous la pression et réapparaît lorsqu’elle est légèrement diminuée.'],
      ['Quel signal prouve finalement que la trachée est protégée ?', 'CO2 expiré continu sur plusieurs cycles|capnogramme persistant', 'Le CO2 stable confirme la position trachéale avant de considérer l’intubation réussie.', src('b00129'), 'La sonde franchit la glotte, le ballonnet est gonflé et la ventilation mécanique commence.'],
    ],
  },
  {
    label: 'Extubation après intubation traumatique',
    vignette: '<p>Un homme de 70 ans a subi trois tentatives de laryngoscopie avant une intubation par vidéolaryngoscope. En fin de chirurgie, il présente des sécrétions abondantes et un discret œdème lingual. Il est encore hypotherme et partiellement curarisé. L’équipe veut éviter un retrait prématuré suivi d’une réintubation en urgence.</p>',
    steps: [
      ['Quel risque justifie de différer immédiatement l’extubation ?', 'Réintubation difficile en urgence|échec d’extubation', 'Les traumatismes répétés et l’œdème peuvent rendre le nouvel accès plus difficile que l’intubation initiale.', src('b00151', 'b00184'), null],
      ['Quelle anomalie thermique doit être corrigée ?', 'Hypothermie|absence de normothermie', 'La normothermie fait partie des critères de récupération exigés avant le retrait de la sonde.', src('b00184'), 'La température centrale est mesurée à 35,2 °C malgré une ventilation et une hémodynamique stables.'],
      ['Quelle récupération médicamenteuse faut-il objectiver ?', 'Décurarisation complète|levée du bloc neuromusculaire', 'Un bloc résiduel diminue la force ventilatoire et la capacité à protéger les voies aériennes.', src('b00184'), 'Le monitorage neuromusculaire confirme encore une récupération incomplète.'],
      ['Quel soin précède le dégonflage du ballonnet ?', 'Aspiration des sécrétions oropharyngées', 'L’aspiration retire les sécrétions accumulées au-dessus du ballonnet avant son ouverture.', src('b00103', 'b00184'), 'Après réchauffement et antagonisation, le patient est conscient mais les sécrétions restent abondantes.'],
      ['Quel guide peut être laissé pendant le retrait de la sonde ?', 'Mandrin long creux|échangeur de sonde', 'Le guide maintient un accès trachéal temporaire si l’œdème impose une réintubation rapide.', src('b00184', 'b00185', 'b00186'), 'L’équipe estime que la nouvelle laryngoscopie resterait difficile malgré la récupération complète.'],
      ['Quel réflexe provoque le retrait après inspiration profonde ?', 'Toux passive|manœuvre de toux', 'Le dégonflage puis le retrait de la sonde entraînent une toux qui aide à dégager les sécrétions.', src('b00005', 'b00184'), 'Le patient est oxygéné quelques minutes puis réalise une inspiration profonde sur demande.'],
      ['Quelle surveillance immédiate est prioritaire après le retrait ?', 'Oxygénation et perméabilité des voies aériennes', 'Une obstruction ou une hypoventilation doit être reconnue avant la dégradation et traitée avec le matériel déjà prêt.', src('b00006', 'b00184', 'b00185'), 'La sonde est retirée sur le guide, avec un stridor discret mais une SpO2 encore normale.'],
    ],
  },
];

// Provenance des données déjà présentes dans les vignettes. Elle est rattachée
// à la première question, qui demande précisément d’interpréter ces données.
const DP_QCM_CONTEXT_BLOCKS = [
  src('b00050'),
  src('b00052'),
  src('b00166'),
  src('b00054'),
  src('b00127'),
  src('b00145'),
  src('b00189', 'b00190'),
  src('b00184'),
];

const DP_QROC_CONTEXT_BLOCKS = [
  src('b00004'),
  src('b00026', 'b00028', 'b00029'),
  src('b00203'),
  src('b00008', 'b00009'),
  src('b00162', 'b00163', 'b00202'),
  src('b00196'),
  src('b00189', 'b00190', 'b00205'),
  src('b00204'),
];

function buildSeries() {
  const series = [];
  for (let index = 0; index < 8; index += 1) {
    const questions = ISOLATED_QCM_AUTHORED.slice(index * 5, index * 5 + 5);
    series.push({
      label: `QCM - Série ${index + 1} · ${['Évaluation', 'Préoxygénation', 'Ventilation faciale', 'Supraglottique', 'Intubation', 'Difficultés', 'Accès invasif', 'Extubation et inhalation'][index]}`,
      allowed_voies: ['interne'],
      questions,
    });
  }

  const authoredDpQcm = [
    ...DP_QCM_AUTHORED_CASES,
    ...DP_QCM_AUTHORED_LATE_CASES,
  ];
  authoredDpQcm.forEach((clinicalCase, caseIndex) => {
    series.push({
      label: `DP QCM ${caseIndex + 1} · ${clinicalCase.label}`,
      vignette: clinicalCase.vignette,
      allowed_voies: ['interne'],
      questions: clinicalCase.questions,
    });
  });

  for (let index = 0; index < 8; index += 1) {
    const questions = ISOLATED_QROC.slice(index * 5, index * 5 + 5)
      .map(([enonce, answer, correction, blocks]) => makeQroc(enonce, answer, correction, blocks));
    series.push({
      label: `QROC - Série ${index + 1} · ${['Anatomie et examen', 'Préoxygénation', 'Masque facial', 'Supraglottique', 'Intubation', 'Alternatives', 'CICO', 'Extubation et séquence rapide'][index]}`,
      allowed_voies: ['externe'],
      questions,
    });
  }

  DP_QROC_CASES.forEach((clinicalCase, caseIndex) => {
    series.push({
      label: `DP QROC ${caseIndex + 1} · ${clinicalCase.label}`,
      vignette: clinicalCase.vignette,
      allowed_voies: ['externe'],
      questions: clinicalCase.steps.map(([prompt, answer, correction, blocks, newInformation], questionIndex) => {
        const question = makeQroc(prompt, answer, correction, blocks, questionIndex === 0 ? undefined : newInformation);
        if (questionIndex === 0) question.sourceBlocks = [...new Set([...question.sourceBlocks, ...DP_QROC_CONTEXT_BLOCKS[caseIndex]])];
        return question;
      }),
    });
  });

  return series;
}

export function buildChapter03(extract) {
  if (!extract?.blocs?.length) throw new Error('Chapitre 03 : extraction source absente ou vide.');
  const available = new Set(extract.blocs.map((block) => block.id).filter(Boolean));
  const fiche = buildFiche();
  const flashcards = buildFlashcards();
  const series = buildSeries();
  const referenced = [
    ...fiche.sourceBlocks,
    ...flashcards.flatMap((card) => card.sourceBlocks),
    ...series.flatMap((entry) => entry.questions.flatMap((question) => question.sourceBlocks)),
  ];
  const unknown = [...new Set(referenced.filter((id) => !available.has(id)))];
  if (unknown.length) throw new Error(`Chapitre 03 : blocs de provenance inconnus (${unknown.join(', ')}).`);
  return { fiche, flashcards, series };
}

export default buildChapter03;
