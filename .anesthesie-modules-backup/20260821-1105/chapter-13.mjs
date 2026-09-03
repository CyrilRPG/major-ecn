// Chapitre 13 - Système nerveux autonome et anesthésie.
// Module éditorial autonome, fondé exclusivement sur extract.json.

const src = (...ids) => ids;
const n2 = (text, ...children) => ({ text, children });
const row = (concept, bullets, sourceBlocks, image) => ({ concept, bullets, sourceBlocks, ...(image ? { image } : {}) });
const fullImage = (path, caption, sourceCaption, extra = {}) => ({
  path, position: 'after', size: 'large', layout: 'full_width', containsText: true,
  caption, sourceCaption, ...extra,
});

const IMAGES = {
  organisation: fullImage('img/img_001.png', 'Deux divisions autonomes et leurs relais vers les organes effecteurs', 'FIGURE 13.1 | Organisation générale du système nerveux autonome avec ses deux grandes divisions'),
  anatomy: fullImage('img/img_002.png', 'Origines, ganglions et trajets des voies sympathique et parasympathique', 'FIGURE 13.2 (A) Organisation anatomique du système sympathique et du système parasympathique; (B) Relation entre la moelle épinière, le nerf spinal, les ganglions paravertébraux, le rameau communicant blanc (fibres préganglionnaires sympathiques) et le rameau communicant gris (fibres postganglionnaires sympathiques en pointillé)'),
  catecholamines: fullImage('img/img_003.png', 'Étapes enzymatiques de la biosynthèse des catécholamines', 'FIGURE 13.3 Biosynthèse des catécholamines'),
  sympatheticA: fullImage('img/img_004.png', 'Récepteurs et effets sympathiques selon les organes - première partie', 'TABLEAU 13.1 | Système sympathique'),
  sympatheticB: fullImage('img/img_005.png', 'Récepteurs et effets sympathiques selon les organes - suite', 'TABLEAU 13.2 Système parasympathique'),
  parasympathetic: fullImage('img/img_006.png', 'Récepteurs et effets parasympathiques selon les organes', 'TABLEAU 13.2 Système parasympathique'),
  receptors: fullImage('img/img_007.png', 'Familles et sous-types de récepteurs autonomes', 'FIGURE 13.4 Sous-types de récepteurs adrénergiques et cholinergiques', { cropBottomMm: 9 }),
  balance: fullImage('img/img_008.png', 'Effets opposés des deux divisions sur les principales fonctions végétatives', 'TABLEAU 13.3 Comparaison des fonctions végétatives, sympathiques et parasympathiques'),
  adrenergicDrugs: fullImage('img/img_009.png', 'Profil hémodynamique comparé de trois agonistes adrénergiques', 'TABLEAU 13.6 Médicaments du système nerveux parasympathique'),
  cholinergicDrugs: fullImage('img/img_010.png', 'Principales familles de médicaments cholinergiques et leurs cibles', 'TABLEAU 13.6 Médicaments du système nerveux parasympathique'),
  antimuscarinics: fullImage('img/img_011.png', 'Effets comparés de l’atropine, du glycopyrrolate et de la scopolamine', 'TABLEAU 13.7 Effets pharmacologiques des anticholinergiques (antimuscariniques)', { cropBottomMm: 9 }),
};

function buildFiche() {
  const parts = [
    {
      title: 'Cartographier le système nerveux autonome',
      sections: [
        {
          title: 'Une régulation involontaire au service de l’homéostasie',
          rows: [
            row('Mission intégratrice', [
              'Le système nerveux autonome ajuste en continu l’activité des viscères pour maintenir l’équilibre du milieu intérieur.',
              n2('Transformer des signaux multiples en réponse végétative',
                'Les informations proviennent du système nerveux central, de la périphérie et de l’environnement.',
                'Stress, peur, excitation sexuelle et cycle veille-sommeil modulent une activité pourtant involontaire.'),
            ], src('b00003', 'b00005')),
            row('Trois catégories d’effecteurs', [
              'Les voies autonomes innervent le myocarde, les muscles lisses et les glandes endocrines ou exocrines.',
              'Elles influencent aussi la libération d’hormones métaboliques et cardiovasculaires.',
            ], src('b00005')),
            row('Architecture à deux neurones', [
              n2('Suivre le signal du centre à l’organe',
                'La fibre préganglionnaire myélinisée part de la moelle ou du tronc cérébral.',
                'Elle fait relais dans un ganglion autonome.',
                'La fibre postganglionnaire non myélinisée rejoint l’effecteur.'),
            ], src('b00006'), IMAGES.organisation),
          ],
        },
        {
          title: 'Sympathique thoracolombaire : une réponse diffuse',
          renderChunks: [3, 2],
          rows: [
            row('Origine et longueur des fibres', [
              'Les corps cellulaires préganglionnaires siègent dans la colonne intermédiolatérale thoracolombaire.',
              'Les fibres préganglionnaires sont courtes ; les fibres postganglionnaires, longues, gagnent les organes.',
            ], src('b00008', 'b00012')),
            row('Chaîne paravertébrale', [
              'Vingt-deux paires de ganglions longent le rachis ; des ganglions prévertébraux et terminaux complètent le dispositif.',
              n2('Distinguer les deux rameaux communicants',
                'Le rameau blanc conduit la fibre préganglionnaire vers le ganglion.',
                'Le rameau gris ramène certaines fibres postganglionnaires au nerf spinal puis à la peau.'),
            ], src('b00012', 'b00013')),
            row('Relais fusionnés utiles à repérer', [
              'La région cervicale comprend les ganglions supérieur, moyen et inférieur ; le ganglion stellaire appartient à la région thoracique haute.',
              'Les ganglions cœliaque et mésentériques constituent des relais prévertébraux majeurs.',
            ], src('b00014', 'b00015', 'b00016', 'b00017', 'b00018', 'b00019', 'b00020'), IMAGES.anatomy),
            row('Médullosurrénale : ganglion endocrine', [
              'Les fibres préganglionnaires l’atteignent directement par le nerf splanchnique.',
              'Les cellules chromaffines libèrent dans le sang environ 80 % d’adrénaline et 20 % de noradrénaline.',
            ], src('b00021', 'b00024', 'b00025')),
            row('Exception cholinergique sympathique', [
              'La majorité des fibres postganglionnaires libèrent la noradrénaline.',
              'Une minorité cholinergique innerve surtout les glandes sudoripares et des vaisseaux cutanés.',
            ], src('b00029')),
          ],
        },
        {
          title: 'Parasympathique craniosacré : une action ciblée',
          rows: [
            row('Origines et relais', [
              'Les neurones préganglionnaires naissent dans le tronc cérébral et les segments sacrés ; les ganglions sont proches ou inclus dans le viscère.',
              'Les fibres préganglionnaires longues expliquent un rayon d’action plus précis que celui du sympathique.',
            ], src('b00027')),
            row('Nerf vague dominant', [
              'Le vague représente environ 75 % du parasympathique et innerve cœur, poumons, tube digestif, foie, pancréas et vésicule biliaire.',
            ], src('b00027')),
            row('Territoires crâniens et sacrés', [
              n2('Associer chaque voie à son territoire',
                'III : accommodation et sphincter irien.',
                'VII et IX : glandes lacrymales et salivaires.',
                'Plexus pelviens : côlon distal, rectum, vessie et organes reproducteurs.'),
            ], src('b00027')),
          ],
        },
      ],
    },
    {
      title: 'Comprendre la transmission autonome',
      sections: [
        {
          title: 'Noradrénaline : synthèse, libération et extinction du signal',
          renderChunks: [3, 2],
          rows: [
            row('Biosynthèse séquentielle', [
              n2('Dérouler la synthèse depuis la tyrosine circulante',
                'La tyrosine hydroxylase forme la DOPA : c’est l’étape limitante.',
                'La DOPA décarboxylase produit la dopamine dans le cytoplasme.',
                'La dopamine entre dans les vésicules puis la dopamine β-hydroxylase forme la noradrénaline.'),
              'Dans la médullosurrénale, la phényléthanolamine N-méthyltransférase conduit à l’adrénaline.',
            ], src('b00031'), IMAGES.catecholamines),
            row('Protection vésiculaire', [
              'La monoamine oxydase mitochondriale dégrade rapidement dopamine et noradrénaline restées hors des vésicules.',
              'Une stimulation sympathique augmente l’activité de la tyrosine hydroxylase et reconstitue les réserves.',
            ], src('b00031')),
            row('Exocytose calcium-dépendante', [
              'Une libération basale soutient les fonctions de repos ; l’influx nerveux fusionne les vésicules avec la membrane en présence de calcium.',
            ], src('b00032')),
            row('Recapture majoritaire', [
              'Environ 95 % de la noradrénaline libérée est recaptée activement par la terminaison présynaptique.',
              'Le reste est méthylé par la COMT ou diffuse vers la circulation ; environ 1 % est perdu par diffusion sanguine.',
            ], src('b00033')),
            row('Cotransmission modulatrice', [
              'La noradrénaline peut être colocalisée avec le neuropeptide Y ou l’ATP.',
              'Des médiateurs circulants, endothéliaux ou tissulaires modulent la libération présynaptique des cotransmetteurs.',
            ], src('b00034', 'b00037')),
          ],
        },
        {
          title: 'Acétylcholine : un signal bref et ubiquitaire',
          rows: [
            row('Synthèse cytoplasmique', [
              n2('Assembler le médiateur puis le protéger avant sa libération',
                'La choline acétyltransférase associe la choline à l’acétyl-CoA mitochondrial.',
                'L’acétylcholine obtenue est aussitôt stockée dans des vésicules.'),
            ], src('b00039')),
            row('Libération graduée', [
              'La quantité libérée augmente avec la fréquence, la durée et l’intensité des influx nerveux.',
              'L’acétylcholine active des récepteurs nicotiniques ou muscariniques selon le site.',
            ], src('b00040')),
            row('Hydrolyse rapide', [
              n2('Éteindre le signal au contact de la fente synaptique',
                'L’acétylcholinestérase transforme l’acétylcholine en choline et acétate.',
                'Sa distribution tissulaire et sanguine explique la brièveté d’une injection intraveineuse.'),
            ], src('b00040')),
            row('Rétrocontrôle et VIP', [
              'Des récepteurs muscariniques présynaptiques peuvent augmenter ou freiner la libération d’acétylcholine.',
              'Le VIP colocalisé favorise la vasodilatation et amplifie notamment la salivation.',
            ], src('b00040', 'b00041')),
          ],
        },
      ],
    },
    {
      title: 'Relier récepteur, organe et réponse',
      sections: [
        {
          title: 'Récepteurs adrénergiques : lire un profil hémodynamique',
          renderChunks: [2, 2],
          rows: [
            row('α1 : contraction du muscle lisse', [
              n2('Déduire l’effet clinique de la contraction α1',
                'Artérioles et veines augmentent leur tonus.',
                'Les sphincters, le muscle radial de l’iris et la capsule splénique se contractent.',
                'Les résistances vasculaires et la pression artérielle s’élèvent.'),
            ], src('b00043', 'b00049')),
            row('α2 : frein présynaptique', [
              'Les récepteurs α2 de la terminaison noradrénergique inhibent la libération de noradrénaline.',
              'Leur activation centrale réduit le tonus sympathique et explique les effets sédatifs des agonistes α2.',
            ], src('b00033', 'b00043', 'b00049'), IMAGES.sympatheticA),
            row('β1 : cœur et rénine', [
              n2('Relier une même cible au cœur et au rein',
                'Au cœur, β1 augmente fréquence, contractilité et vitesse de conduction.',
                'Au rein, β1 stimule la libération de rénine par les cellules juxtaglomérulaires.'),
            ], src('b00043'), IMAGES.sympatheticB),
            row('β2 : relaxation du muscle lisse', [
              'β2 dilate bronches et vaisseaux de certains territoires, relâche utérus et détrusor, et modifie les réponses métaboliques.',
              'Un agonisme β2 peut ainsi associer bronchodilatation, vasodilatation et tremblement.',
            ], src('b00043')),
          ],
        },
        {
          title: 'Récepteurs cholinergiques : distinguer relais et effecteur',
          rows: [
            row('Nicotinique ganglionnaire', [
              n2('Faire du nicotinique le relais commun aux deux divisions',
                'L’acétylcholine préganglionnaire active le neurone postganglionnaire sympathique.',
                'Le même mécanisme transmet la commande parasympathique et active les cellules chromaffines.'),
            ], src('b00029', 'b00051'), IMAGES.receptors),
            row('Muscarinique effecteur', [
              n2('Distribuer les sous-types selon la fonction de l’organe',
                'M2 prédomine au cœur et ralentit l’activité nodale.',
                'M3 domine dans les glandes et les muscles lisses.'),
              'Des récepteurs muscariniques existent aussi sur certaines terminaisons postganglionnaires sympathiques.',
            ], src('b00051'), IMAGES.parasympathetic),
            row('Familles à mémoriser', [
              'Les récepteurs adrénergiques se déclinent en α1, α2 et β1 à β3 ; les muscariniques en M1 à M5.',
              'Les récepteurs nicotiniques comprennent des formes musculaires, ganglionnaires et centrales.',
            ], src('b00043', 'b00049', 'b00051', 'b00161', 'b00162')),
          ],
        },
        {
          title: 'Antagonisme fonctionnel et tonus de repos',
          rows: [
            row('Prédominance selon l’organe', [
              'Au repos, le tonus sympathique domine sur artérioles et veines ; le parasympathique domine sur la plupart des autres organes.',
              'L’équilibre porte sur pression, cœur, bronches, digestion, sécrétions, thermorégulation, miction et sexualité.',
            ], src('b00054'), IMAGES.balance),
            row('Mode combat ou fuite', [
              n2('Mobiliser immédiatement les fonctions utiles à l’effort',
                'Débit cardiaque, pression, perfusion musculaire et diamètres pupillaire et bronchique augmentent.',
                'Digestion et fonction rénale sont temporairement freinées.',
                'Glucose et acides gras sont mobilisés.'),
              'La même division participe à l’éjaculation et à l’orgasme.',
            ], src('b00055', 'b00058')),
            row('Mode conservation', [
              n2('Restaurer les réserves pendant les périodes de repos',
                'Le cœur ralentit tandis que digestion, sécrétions et absorption sont stimulées.',
                'Excrétion et miction sont facilitées.'),
              'Le parasympathique participe aussi à l’érection et aux fonctions de réparation.',
            ], src('b00059')),
          ],
        },
      ],
    },
    {
      title: 'Interpréter les réflexes autonomes en anesthésie',
      sections: [
        {
          title: 'Boucles d’homéostasie cardiorespiratoire',
          renderChunks: [3, 3],
          rows: [
            row('Thermorégulation', [
              'Une élévation thermique détourne le débit vers la peau et active la sudation cholinergique sympathique.',
              'Radiation et évaporation dissipent alors la chaleur.',
            ], src('b00061', 'b00063')),
            row('Rythme cardiaque', [
              'La noradrénaline sympathique accélère le cœur ; l’acétylcholine vagale le ralentit.',
              'Douleur, fièvre, besoin en oxygène et hypovolémie déplacent l’équilibre vers la tachycardie.',
            ], src('b00065')),
            row('Baroréflexe : pression élevée', [
              n2('De la paroi artérielle au cœur',
                'Les sinus carotidiens et la crosse aortique détectent l’étirement.',
                'Les afférences IX et X gagnent le noyau du faisceau solitaire.',
                'Retrait sympathique et activation vagale provoquent vasodilatation et bradycardie.'),
            ], src('b00067', 'b00068', 'b00071')),
            row('Baroréflexe : pression basse', [
              'Une chute de pression désinhibe le sympathique, retire le frein vagal et augmente les résistances artérielles et veineuses.',
              'La vasoconstriction privilégie la perfusion du cerveau, du cœur et des reins.',
            ], src('b00069', 'b00070', 'b00071')),
            row('Commande respiratoire', [
              'Le sympathique favorise la bronchodilatation β2 ; le parasympathique favorise bronchoconstriction et sécrétions au repos.',
              'Hypoxie, hypercapnie et acidose activent les centres respiratoires via les chémorécepteurs.',
            ], src('b00073')),
            row('Pression et débit', [
              'La pression artérielle résulte du produit du débit cardiaque par les résistances vasculaires périphériques.',
              'Une correction pressive peut donc relever la résistance tout en réduisant le débit si le cœur ne compense pas.',
            ], src('b00067', 'b00068', 'b00069')),
          ],
        },
        {
          title: 'Réflexes périopératoires à reconnaître immédiatement',
          renderChunks: [3, 3],
          rows: [
            row('Bainbridge', [
              'La distension de l’oreillette droite et de la jonction cavo-atriale déclenche une tachycardie par baisse du tonus parasympathique et effet sinusal direct.',
              'La réponse dépend de la fréquence cardiaque initiale.',
            ], src('b00075', 'b00076')),
            row('Bezold-Jarisch', [
              'La stimulation de récepteurs du ventricule gauche provoque hypotension, bradycardie et vasodilatation coronaire.',
              'Le réflexe peut accompagner ischémie, infarctus, reperfusion ou syncope.',
            ], src('b00078')),
            row('Cushing', [
              n2('Reconnaître une réponse autonome en deux temps',
                'L’ischémie cérébrale active d’abord fortement le sympathique et élève la pression.',
                'L’hypertension obtenue entraîne ensuite une bradycardie baroréflexe.'),
            ], src('b00080')),
            row('Oculocardiaque', [
              'La traction des muscles extraoculaires emprunte une afférence trigéminale puis augmente brutalement le tonus vagal.',
              'Une bradycardie intense peut survenir ; atropine ou glycopyrrolate en réduisent l’incidence.',
            ], src('b00082')),
            row('Valsalva : phase de contrainte', [
              n2('Suivre la cascade créée par la glotte fermée',
                'La pression intrathoracique augmente et le retour veineux diminue.',
                'Débit et pression chutent, puis le baroréflexe augmente fréquence et contractilité.'),
            ], src('b00084')),
            row('Valsalva : libération', [
              'À l’ouverture de la glotte, le retour veineux et la pression rebondissent ; le parasympathique ramène ensuite les valeurs vers la normale.',
            ], src('b00084')),
          ],
        },
      ],
    },
    {
      title: 'Choisir un médicament adrénergique',
      sections: [
        {
          title: 'Vasopresseurs : restaurer le tonus sans perdre le débit',
          rows: [
            row('Adrénaline', [
              'Agoniste α et β non sélectif, elle associe vasoconstriction, stimulation cardiaque et bronchodilatation.',
              'Elle élève surtout la pression systolique, agit 10 à 15 minutes et constitue l’agent de choix de l’arrêt cardiaque.',
            ], src('b00087', 'b00094', 'b00099'), IMAGES.adrenergicDrugs),
            row('Noradrénaline', [
              'Son profil surtout α1 augmente résistances, pression systolique et pression diastolique.',
              'La stimulation β1 cardiaque peut être masquée par une bradycardie vagale baroréflexe.',
            ], src('b00101')),
            row('Éphédrine', [
              'Ses actions directes et indirectes augmentent pression, fréquence, contractilité et calibre bronchique.',
              'Moins puissante mais plus longue que l’adrénaline, elle expose à la tachyphylaxie par épuisement des stocks de noradrénaline.',
            ], src('b00103')),
            row('Phényléphrine', [
              'L’agonisme α1 pur augmente la pression par vasoconstriction et ralentit le cœur par baroréflexe.',
              'Elle traite certaines hypotensions anesthésiques, avec un risque de baisse du débit cardiaque.',
            ], src('b00105')),
          ],
        },
        {
          title: 'Inotropes et chronotropes : soutenir la pompe ou le rythme',
          rows: [
            row('Dobutamine', [
              'L’agonisme β1 augmente surtout le débit cardiaque par effets inotrope et chronotrope positifs.',
              'Une faible activité β2 peut vasodilater et faire chuter la pression, notamment dans le choc cardiogénique.',
            ], src('b00107')),
            row('Dopamine', [
              'Les effets varient avec la dose : D1 rénal à faible dose, β à dose moyenne, puis α1 et β1 à forte dose.',
              'Elle n’est plus usuelle en réanimation et reste un second choix de la bradycardie résistante à l’atropine.',
            ], src('b00109')),
            row('Isoprotérénol', [
              'Agoniste β1-β2 de courte durée, il accélère fortement le cœur tout en diminuant résistances et pression.',
              'Une perfusion peut traiter certaines bradyarythmies.',
            ], src('b00115')),
            row('Clonidine', [
              'L’agonisme α2 central et présynaptique réduit la libération de noradrénaline.',
              'Sédation, analgésie procédurale, sevrage de sédation et antihypertension sont les principaux usages décrits.',
            ], src('b00111')),
            row('Dexmédétomidine', [
              'Très sélective pour α2, elle permet une sédation consciente avec propriétés analgésiques, y compris chez un patient non intubé.',
              'Bradycardie et hypotension sont possibles ; la dose de charge peut provoquer une hypertension transitoire.',
            ], src('b00113')),
            row('Salbutamol', [
              'Agoniste β2 préférentiel inhalé ou intraveineux, il traite le bronchospasme.',
              'À forte dose, tremblement et ralentissement du péristaltisme peuvent survenir ; salmétérol et formotérol agissent plus longtemps.',
            ], src('b00116', 'b00117', 'b00118', 'b00119')),
          ],
        },
        {
          title: 'Inodilatation et freinage adrénergique',
          rows: [
            row('Inhibition des phosphodiestérases', [
              'Bloquer la dégradation de l’AMPc amplifie les effets en aval des récepteurs β.',
              'Enoximone et milrinone associent renforcement de la contraction et vasodilatation.',
            ], src('b00120', 'b00121', 'b00123', 'b00125')),
            row('Milrinone', [
              'L’augmentation d’AMPc et de l’influx calcique soutient l’inotropisme ; la relaxation vasculaire, notamment pulmonaire, réduit précharge et postcharge.',
              'Son rapport bénéfice-risque ne justifie pas un emploi prolongé dans l’insuffisance cardiaque sévère.',
            ], src('b00125')),
            row('Aténolol et métoprolol', [
              'Le blocage β1 réduit fréquence, débit, pression et consommation myocardique d’oxygène.',
              'L’allongement de la diastole améliore la perfusion coronaire ; les usages principaux sont hypertension et cardiopathie ischémique.',
            ], src('b00126', 'b00127', 'b00128')),
            row('Esmolol', [
              'Cet antagoniste β1 intraveineux est hydrolysé par les estérases érythrocytaires.',
              'L’effet culmine en 6 à 10 minutes et a presque disparu à 20 minutes, ce qui facilite un contrôle tensionnel rapide.',
            ], src('b00129', 'b00130')),
            row('Labétalol', [
              'Le blocage α et β non sélectif convient au contrôle d’une hypertension aiguë ou à l’hypotension contrôlée en anesthésie.',
              'Par voie intraveineuse, le rapport d’activité β:α est voisin de 7:1.',
            ], src('b00131', 'b00132')),
          ],
        },
      ],
    },
    {
      title: 'Maîtriser la pharmacologie cholinergique',
      sections: [
        {
          title: 'Augmenter l’acétylcholine sans oublier les effets muscariniques',
          renderChunks: [3, 3],
          rows: [
            row('Deux stratégies parasympathomimétiques', [
              'Un médicament peut stimuler directement un récepteur cholinergique, accroître la libération d’acétylcholine ou empêcher sa dégradation.',
              'Les agonistes muscariniques directs ont une place limitée en pratique anesthésique.',
            ], src('b00089', 'b00134', 'b00135', 'b00136'), IMAGES.cholinergicDrugs),
            row('Effet de classe des anticholinestérases', [
              'L’accumulation d’acétylcholine renforce la transmission neuromusculaire mais suractive aussi les récepteurs muscariniques.',
              'Bradycardie, hypersalivation, hyperpéristaltisme et myosis justifient l’association à un antagoniste muscarinique.',
            ], src('b00137', 'b00138')),
            row('Néostigmine', [
              'Ce carbamate inhibe réversiblement l’acétylcholinestérase ; l’effet maximal survient en 7 à 10 minutes et dure environ une heure.',
              'Elle ne pénètre pas le cerveau et peut être associée au glycopyrrolate.',
            ], src('b00139', 'b00140')),
            row('Pyridostigmine', [
              'Son mécanisme est proche de celui de la néostigmine, avec un début plus lent et une durée plus longue.',
              'La voie orale est utile dans la myasthénie grave.',
            ], src('b00141', 'b00142')),
            row('Édrophonium', [
              'Inhibiteur compétitif et réversible, il agit rapidement pendant environ dix minutes.',
              'Sa brièveté a soutenu son emploi diagnostique dans la myasthénie.',
            ], src('b00143', 'b00144')),
            row('Physostigmine', [
              'Amine tertiaire franchissant la barrière hémato-encéphalique, elle peut traiter un syndrome anticholinergique central.',
              'Ses effets centraux la distinguent des anticholinestérases quaternaires.',
            ], src('b00145', 'b00146')),
          ],
        },
        {
          title: 'Bloquer les récepteurs muscariniques avec discernement',
          renderChunks: [3, 2],
          rows: [
            row('Syndrome antimuscarinique', [
              n2('Séparer périphérie et cerveau',
                'Périphérie : tachycardie, mydriase, sécheresse, constipation, rétention urinaire et peau sèche.',
                'Centre : confusion, désorientation, amnésie, hallucinations et paranoïa.'),
              'Le sujet âgé est particulièrement exposé aux manifestations centrales.',
            ], src('b00147', 'b00148')),
            row('Indications périopératoires', [
              'Atropine, glycopyrrolate et scopolamine sont des antagonistes compétitifs, réversibles et peu sélectifs.',
              'Ils traitent surtout la bradycardie symptomatique et réduisent les sécrétions oropharyngées ou bronchiques.',
            ], src('b00149', 'b00150'), IMAGES.antimuscarinics),
            row('Atropine', [
              'Amine tertiaire liposoluble, elle franchit la barrière hémato-encéphalique mais ses effets périphériques dominent.',
              'Son effet chronotrope est plus marqué que celui du glycopyrrolate.',
            ], src('b00153')),
            row('Scopolamine', [
              'Très liposoluble, elle privilégie les effets centraux : somnolence, amnésie et analgésie.',
              'Elle réduit puissamment la salivation et prévient le mal des transports.',
            ], src('b00154', 'b00155')),
            row('Glycopyrrolate', [
              'Amine quaternaire ionisée, il franchit peu la barrière hémato-encéphalique et évite les effets centraux.',
              'Il réduit fortement la salivation avec moins de tachycardie, ce qui l’adapte à l’association aux anticholinestérases.',
            ], src('b00156', 'b00157')),
          ],
        },
      ],
    },
  ];

  const sourceBlocks = [...new Set(parts.flatMap((part) => part.sections.flatMap((section) => section.rows.flatMap((item) => item.sourceBlocks))))];
  return {
    matiere: 'Anesthésie-Réanimation',
    title: 'Système nerveux autonome et anesthésie',
    year: '2026-2027',
    coverSubtitle: 'Relier voies, récepteurs, réflexes et médicaments aux décisions périopératoires',
    sourceBlocks,
    parts,
    synthesis: {
      compactLayout: true,
      chiffres: {
        headers: ['Repère', 'Valeur'],
        rows: [
          ['Ganglions sympathiques paravertébraux', '22 paires'],
          ['Fibres sympathiques postganglionnaires cholinergiques', '5 à 8 %'],
          ['Médullosurrénale', '80 % adrénaline / 20 % noradrénaline'],
          ['Recapture de noradrénaline', 'Environ 95 %'],
          ['Nerf vague', 'Environ 75 % du parasympathique'],
          ['Réflexe oculocardiaque en chirurgie oculaire', '30 à 90 %'],
          ['Néostigmine : effet maximal', '7 à 10 min'],
          ['Esmolol : effet presque disparu', '20 min'],
        ],
      },
      tables: [
        {
          title: 'Récepteur et effet dominant', headers: ['Cible', 'Conséquence clinique'], rows: [
            ['α1', 'Vasoconstriction, hausse des résistances et de la pression'],
            ['α2', 'Frein présynaptique, sympatholyse centrale, sédation'],
            ['β1', 'Chronotropisme, inotropisme, conduction et rénine'],
            ['β2', 'Bronchodilatation et relaxation de muscles lisses'],
            ['M2', 'Ralentissement cardiaque'],
            ['M3', 'Sécrétions et contraction de nombreux muscles lisses'],
          ],
        },
      ],
      keyPoints: [
        'Toute voie autonome comporte un neurone préganglionnaire cholinergique et un relais ganglionnaire.',
        'Le sympathique est surtout noradrénergique après le ganglion, sauf notamment au niveau des glandes sudoripares.',
        'La médullosurrénale transforme une commande préganglionnaire en libération hormonale systémique.',
        'Le profil α, β ou muscarinique explique mieux l’effet clinique d’un médicament que son appartenance à une liste.',
        'Une hausse de pression par vasoconstriction peut s’accompagner d’une bradycardie baroréflexe et d’une baisse du débit.',
        'Un dossier périopératoire doit faire reconnaître oculocardiaque, Bezold-Jarisch, Cushing et Valsalva par leur déclencheur.',
        'Les anticholinestérases renforcent la transmission mais imposent d’anticiper leurs effets muscariniques.',
        'Le passage cérébral distingue atropine et scopolamine du glycopyrrolate quaternaire.',
      ],
      eclair: [
        'Préganglionnaire autonome : acétylcholine sur récepteur nicotinique ganglionnaire.',
        'Après le ganglion : noradrénaline pour le sympathique, acétylcholine pour le parasympathique.',
        'α1 contracte les vaisseaux ; α2 freine la noradrénaline ; β1 stimule le cœur ; β2 dilate les bronches.',
        'Une hausse pressive peut ralentir le cœur par activation vagale baroréflexe.',
        'Traction oculaire : bradycardie trigémino-vagale ; HTIC : hypertension puis bradycardie de Cushing.',
        'Adrénaline pour l’arrêt cardiaque ; noradrénaline pour le tonus vasculaire ; dobutamine pour le bas débit.',
        'La néostigmine augmente aussi les effets muscariniques : anticiper bradycardie et hypersécrétions.',
        'Le glycopyrrolate reste périphérique ; atropine et scopolamine peuvent franchir la barrière cérébrale.',
      ],
    },
  };
}

const card = (recto, verso, sourceBlocks) => ({ recto, verso, sourceBlocks: Array.isArray(sourceBlocks) ? sourceBlocks : [sourceBlocks] });
const qcm = (enonce, sourceBlocks, correction_generale, items, newInformation) => ({
  enonce: newInformation ? `${newInformation} ${enonce}` : enonce,
  format: 'qcm', sourceBlocks, correction_generale,
  ...(newInformation ? { newInformation } : {}),
  items: items.map(([is_correct, itemEnonce, justification], index) => ({ lettre: 'ABCDE'[index], enonce: itemEnonce, is_correct, justification })),
});
const qroc = (enonce, reponse_attendue, sourceBlocks, correction_generale, newInformation) => ({
  enonce: newInformation ? `${newInformation} ${enonce}` : enonce,
  format: 'qroc', reponse_attendue, sourceBlocks, correction_generale, items: [],
  ...(newInformation ? { newInformation } : {}),
});

const flashcards = [
  card('Quelle fonction générale assure le système nerveux autonome ?', 'Il règle l’activité viscérale involontaire afin de maintenir l’homéostasie.', 'b00005'),
  card('Quels trois tissus reçoivent une innervation autonome ?', 'Myocarde, muscles lisses et glandes endocrines ou exocrines.', 'b00005'),
  card('Quelles sont les deux divisions du système nerveux autonome ?', 'Le système sympathique et le système parasympathique.', 'b00006'),
  card('Où siège le corps cellulaire d’une fibre autonome préganglionnaire ?', 'Dans le SNC, au niveau de la moelle épinière ou du tronc cérébral.', 'b00006'),
  card('Une fibre autonome préganglionnaire est-elle myélinisée ?', 'Oui ; la fibre postganglionnaire est non myélinisée.', 'b00006'),
  card('Quel neurotransmetteur libèrent toutes les fibres autonomes préganglionnaires ?', 'L’acétylcholine.', 'b00029'),
  card('Quelle est l’origine médullaire du sympathique ?', 'La colonne intermédiolatérale des segments thoracolombaires.', ['b00008', 'b00012']),
  card('Pourquoi les fibres sympathiques préganglionnaires sont-elles courtes ?', 'Elles font relais dans des ganglions proches de la moelle.', 'b00012'),
  card('Combien de paires compte la chaîne sympathique paravertébrale ?', 'Vingt-deux paires de ganglions.', 'b00012'),
  card('Quel rameau mène une fibre sympathique préganglionnaire au ganglion ?', 'Le rameau communicant blanc.', 'b00013'),
  card('Quel rameau ramène une fibre sympathique postganglionnaire au nerf spinal ?', 'Le rameau communicant gris.', 'b00013'),
  card('Quelle part des fibres sympathiques postganglionnaires rejoint la peau ?', 'Environ 5 à 8 %.', 'b00013'),
  card('Quels sont les trois principaux ganglions cervicaux sympathiques ?', 'Les ganglions cervical supérieur, moyen et inférieur.', ['b00014', 'b00015', 'b00016']),
  card('Quel ganglion sympathique résulte d’une fusion thoracique haute ?', 'Le ganglion stellaire.', 'b00017'),
  card('Quels relais prévertébraux innervent les viscères abdominaux ?', 'Les ganglions cœliaque et mésentériques supérieur et inférieur.', ['b00018', 'b00019', 'b00020']),
  card('Par quel nerf les fibres sympathiques gagnent-elles la médullosurrénale ?', 'Par le nerf splanchnique.', ['b00021', 'b00024']),
  card('Quelles proportions de catécholamines libère la médullosurrénale ?', 'Environ 80 % d’adrénaline et 20 % de noradrénaline.', 'b00024'),
  card('Pourquoi la médullosurrénale a-t-elle un statut neurohormonal ?', 'Ses cellules chromaffines libèrent directement les catécholamines dans le sang.', ['b00024', 'b00025']),
  card('Quelle est l’origine du parasympathique ?', 'Une origine craniosacrée : tronc cérébral et segments sacrés.', 'b00027'),
  card('Où se trouvent les ganglions parasympathiques ?', 'Près de l’organe effecteur ou dans sa paroi.', 'b00027'),
  card('Pourquoi l’action parasympathique est-elle plus précise ?', 'Ses ganglions proches des viscères limitent la divergence des voies.', 'b00027'),
  card('Quelle part du parasympathique représente le nerf vague ?', 'Environ 75 %.', 'b00027'),
  card('Quels organes thoracoabdominaux le vague innerve-t-il ?', 'Cœur, poumons, tube digestif, foie, pancréas et vésicule biliaire.', 'b00027'),
  card('Quel nerf parasympathique innerve la parotide ?', 'Le nerf glossopharyngien, IX.', 'b00027'),
  card('Quel nerf parasympathique commande le sphincter irien ?', 'Le nerf oculomoteur, III.', 'b00027'),
  card('Quels organes reçoivent les fibres parasympathiques sacrées ?', 'Côlon distal, rectum, vessie et organes reproducteurs.', 'b00027'),
  card('Quel transmetteur libère la majorité des fibres sympathiques postganglionnaires ?', 'La noradrénaline.', 'b00029'),
  card('Quelle exception sympathique postganglionnaire libère de l’acétylcholine ?', 'Les fibres des glandes sudoripares et de certains vaisseaux cutanés.', 'b00029'),
  card('Quel est le précurseur initial des catécholamines ?', 'La tyrosine apportée par le sang.', 'b00031'),
  card('Quelle enzyme limite la biosynthèse des catécholamines ?', 'La tyrosine hydroxylase.', 'b00031'),
  card('Quel produit la tyrosine hydroxylase forme-t-elle ?', 'La L-DOPA.', 'b00031'),
  card('Quelle enzyme transforme la DOPA en dopamine ?', 'La DOPA décarboxylase.', 'b00031'),
  card('Où la dopamine devient-elle noradrénaline ?', 'Dans la vésicule synaptique.', 'b00031'),
  card('Quelle enzyme vésiculaire forme la noradrénaline ?', 'La dopamine bêta-hydroxylase.', 'b00031'),
  card('Quel rôle joue la monoamine oxydase dans la terminaison noradrénergique ?', 'Elle dégrade les monoamines non protégées dans les vésicules.', 'b00031'),
  card('De quoi dépend l’exocytose de noradrénaline ?', 'De l’influx nerveux et de la présence de calcium.', 'b00032'),
  card('Quel mécanisme termine surtout l’action de la noradrénaline ?', 'Sa recapture active par la terminaison présynaptique.', 'b00033'),
  card('Quelle proportion de noradrénaline est recaptée ?', 'Environ 95 % de la quantité libérée.', 'b00033'),
  card('Quelle enzyme extraneuronale inactive une part de la noradrénaline ?', 'La catéchol-O-méthyltransférase, ou COMT.', 'b00033'),
  card('Quels cotransmetteurs accompagnent souvent la noradrénaline ?', 'Le neuropeptide Y ou l’ATP.', ['b00034', 'b00037']),
  card('Quels substrats forment l’acétylcholine ?', 'La choline et l’acétyl-CoA.', 'b00039'),
  card('Quelle enzyme synthétise l’acétylcholine ?', 'La choline acétyltransférase.', 'b00039'),
  card('Pourquoi l’acétylcholine est-elle rapidement mise en vésicules ?', 'Pour la protéger de la dégradation enzymatique.', 'b00039'),
  card('Quelle enzyme hydrolyse l’acétylcholine ?', 'L’acétylcholinestérase.', 'b00040'),
  card('Quels métabolites produit l’hydrolyse de l’acétylcholine ?', 'La choline et l’acétate.', 'b00040'),
  card('Pourquoi une injection d’acétylcholine agit-elle brièvement ?', 'L’acétylcholinestérase est abondante dans les tissus et le sang.', 'b00040'),
  card('Quel peptide colocalisé amplifie la salivation cholinergique ?', 'Le peptide intestinal vasoactif, VIP.', ['b00040', 'b00041']),
  card('Quel effet périphérique domine après stimulation α1 ?', 'La contraction du muscle lisse, notamment vasculaire.', 'b00043'),
  card('Quel récepteur adrénergique présynaptique freine la noradrénaline ?', 'Le récepteur α2.', ['b00033', 'b00049']),
  card('Quel récepteur adrénergique accélère et renforce le cœur ?', 'Le récepteur β1.', 'b00043'),
  card('Quel récepteur stimule la sécrétion rénale de rénine ?', 'Le récepteur β1 des cellules juxtaglomérulaires.', 'b00043'),
  card('Quel récepteur adrénergique dilate les bronches ?', 'β2 relâche le muscle lisse bronchique.', 'b00043'),
  card('Quel récepteur cholinergique assure la transmission ganglionnaire autonome ?', 'Le récepteur nicotinique ganglionnaire.', 'b00051'),
  card('Quel sous-type muscarinique prédomine au cœur ?', 'Le récepteur M2.', 'b00051'),
  card('Quel sous-type muscarinique prédomine dans les glandes et muscles lisses ?', 'Le récepteur M3.', 'b00051'),
  card('Où le tonus sympathique prédomine-t-il au repos ?', 'Sur les artérioles et les veines.', 'b00054'),
  card('Quels effets cardiaques produit le sympathique ?', 'Il augmente fréquence, force de contraction et débit.', ['b00055', 'b00058']),
  card('Quel effet le sympathique exerce-t-il sur la pupille ?', 'Une mydriase par contraction du muscle radial.', ['b00043', 'b00058']),
  card('Quel effet le parasympathique exerce-t-il sur la digestion ?', 'Il augmente sécrétions, motilité et absorption.', 'b00059'),
  card('Quelle division autonome participe à l’érection ?', 'Le parasympathique.', 'b00059'),
  card('Quel neurotransmetteur déclenche la sudation thermorégulatrice ?', 'L’acétylcholine libérée par des fibres sympathiques.', 'b00063'),
  card('Quelle relation unit pression, débit et résistances ?', 'PA = débit cardiaque × résistances vasculaires périphériques.', ['b00067', 'b00068']),
  card('Où se trouvent les barorécepteurs artériels majeurs ?', 'Dans les sinus carotidiens et la crosse aortique.', 'b00071'),
  card('Quels nerfs conduisent les afférences baroréflexes ?', 'Les nerfs glossopharyngien IX et vague X.', 'b00071'),
  card('Quelle réponse suit une hypertension détectée par les barorécepteurs ?', 'Retrait sympathique, vasodilatation et bradycardie vagale.', 'b00071'),
  card('Quelle réponse autonome suit une chute de pression ?', 'Activation sympathique, vasoconstriction et retrait vagal.', ['b00069', 'b00071']),
  card('Quels organes sont préservés lors d’une hypotension prolongée ?', 'Le cerveau, le cœur et les reins.', ['b00069', 'b00070']),
  card('Quel effet bronchique produit le parasympathique ?', 'Une bronchoconstriction cholinergique avec augmentation des sécrétions.', 'b00073'),
  card('Quel stimulus déclenche le réflexe de Bainbridge ?', 'L’augmentation du remplissage de l’oreillette droite.', 'b00075'),
  card('Quelle réponse cardiaque caractérise le réflexe de Bainbridge ?', 'Une tachycardie par retrait parasympathique et étirement sinusal.', ['b00075', 'b00076']),
  card('Quelle triade définit le réflexe de Bezold-Jarisch ?', 'Hypotension, bradycardie et vasodilatation coronaire.', 'b00078'),
  card('Quel événement déclenche le réflexe de Cushing ?', 'Une ischémie cérébrale liée à une hausse de pression intracrânienne.', 'b00080'),
  card('Quelle séquence hémodynamique évoque le réflexe de Cushing ?', 'Activation sympathique avec hypertension, puis bradycardie réflexe.', 'b00080'),
  card('Quelle afférence porte le réflexe oculocardiaque ?', 'Les nerfs ciliaires puis la division ophtalmique du trijumeau.', 'b00082'),
  card('Quelle réponse efférente produit le réflexe oculocardiaque ?', 'Une activation vagale responsable d’une bradycardie intense.', 'b00082'),
  card('Quels médicaments réduisent le réflexe oculocardiaque ?', 'L’atropine ou le glycopyrrolate.', 'b00082'),
  card('Quel effet initial produit une manœuvre de Valsalva ?', 'Baisse du retour veineux, du débit cardiaque et de la pression.', 'b00084'),
  card('Comment réagit le système autonome pendant la contrainte de Valsalva ?', 'Le sympathique augmente fréquence et contractilité.', 'b00084'),
  card('Comment agit un sympathomimétique direct ?', 'Il stimule directement un ou plusieurs récepteurs adrénergiques.', 'b00087'),
  card('Comment agit un sympathomimétique indirect ?', 'Il favorise la libération ou la disponibilité de noradrénaline.', 'b00087'),
  card('Quel profil récepteur possède l’adrénaline ?', 'Un agonisme non sélectif α et β.', 'b00094'),
  card('Quel médicament est l’agent de choix de l’arrêt cardiaque ?', 'L’adrénaline.', 'b00099'),
  card('Combien de temps durent les effets décrits de l’adrénaline ?', 'Environ 10 à 15 minutes.', 'b00099'),
  card('Pourquoi la noradrénaline peut-elle ralentir la fréquence cardiaque ?', 'La hausse de pression active une bradycardie vagale baroréflexe.', 'b00101'),
  card('Quel profil distingue l’éphédrine ?', 'Des effets adrénergiques directs et indirects, moins puissants mais plus longs.', 'b00103'),
  card('Pourquoi l’éphédrine expose-t-elle à la tachyphylaxie ?', 'Les doses répétées épuisent les stocks de noradrénaline.', 'b00103'),
  card('Quelle cible sélective active la phényléphrine ?', 'Le récepteur α1 adrénergique.', 'b00105'),
  card('Pourquoi la phényléphrine peut-elle diminuer le débit cardiaque ?', 'Vasoconstriction et bradycardie réflexe augmentent la charge du cœur.', 'b00105'),
  card('Quelle indication majeure correspond à la dobutamine ?', 'Le choc cardiogénique avec bas débit.', 'b00107'),
  card('Quel effet indésirable hémodynamique peut donner la dobutamine ?', 'Une hypotension par vasodilatation β2.', 'b00107'),
  card('Quelle place actuelle garde la dopamine ?', 'Un second choix dans la bradycardie résistante à l’atropine.', 'b00109'),
  card('Par quel mécanisme central agit la clonidine ?', 'L’agonisme α2 réduit la libération de noradrénaline.', 'b00111'),
  card('Quel profil de sédation permet la dexmédétomidine ?', 'Une sédation consciente avec propriétés analgésiques.', 'b00113'),
  card('Quels effets indésirables dominent sous dexmédétomidine ?', 'Bradycardie et hypotension.', 'b00113'),
  card('Pourquoi une dose de charge de dexmédétomidine peut-elle augmenter la pression ?', 'Elle provoque d’abord une vasoconstriction α2 périphérique.', 'b00113'),
  card('Quel médicament β1-β2 traite certaines bradyarythmies ?', 'L’isoprotérénol en perfusion.', 'b00115'),
  card('Quel récepteur cible préférentiellement le salbutamol ?', 'Le récepteur β2 adrénergique.', ['b00116', 'b00117']),
  card('Quels effets extrarespiratoires peut provoquer le salbutamol à forte dose ?', 'Tremblement musculaire et ralentissement du péristaltisme.', ['b00117', 'b00118']),
  card('Que provoque l’inhibition d’une phosphodiestérase sur l’AMPc ?', 'Une accumulation d’AMPc qui amplifie les effets β adrénergiques.', 'b00121'),
  card('Quels effets associe l’enoximone ?', 'Inotropisme positif puissant et vasodilatation périphérique.', 'b00123'),
  card('Pourquoi la milrinone est-elle dite inodilatatrice ?', 'Elle augmente la contraction et relâche le muscle lisse vasculaire.', 'b00125'),
  card('Quel territoire vasculaire la milrinone relâche-t-elle particulièrement ?', 'Le territoire pulmonaire.', 'b00125'),
  card('Quels effets cardiaques produisent aténolol et métoprolol ?', 'Baisse de fréquence, débit, pression et demande myocardique en O₂.', 'b00128'),
  card('Pourquoi l’esmolol agit-il brièvement ?', 'Il est métabolisé par les estérases des globules rouges.', 'b00130'),
  card('Quand l’effet de l’esmolol est-il maximal ?', 'Dans les 6 à 10 minutes.', 'b00130'),
  card('Quel profil de blocage possède le labétalol ?', 'Un antagonisme adrénergique α et β non sélectif.', 'b00132'),
  card('Quel est le rapport d’activité β sur α du labétalol IV ?', 'Environ 7 pour 1.', 'b00132'),
  card('Quel est le mécanisme commun des anticholinestérases ?', 'Elles empêchent la dégradation de l’acétylcholine dans la fente.', 'b00138'),
  card('Quels effets muscariniques accompagne une anticholinestérase ?', 'Bradycardie, hypersalivation, hyperpéristaltisme et myosis.', 'b00138'),
  card('Quelle est la durée d’action approximative de la néostigmine ?', 'Environ une heure.', 'b00140'),
  card('La néostigmine franchit-elle la barrière hémato-encéphalique ?', 'Non, elle ne pénètre pas dans le cerveau.', 'b00140'),
  card('Quel avantage pratique possède la pyridostigmine ?', 'Une durée prolongée et une administration orale.', 'b00142'),
  card('Quelle est la durée d’action approximative de l’édrophonium ?', 'Environ dix minutes.', 'b00144'),
  card('Quelle anticholinestérase traite un syndrome anticholinergique central ?', 'La physostigmine, qui traverse la barrière hémato-encéphalique.', 'b00146'),
  card('Quels signes périphériques évoquent un blocage muscarinique ?', 'Tachycardie, mydriase, sécheresse, constipation et rétention urinaire.', 'b00148'),
  card('Quels signes centraux évoquent un blocage muscarinique ?', 'Confusion, désorientation, amnésie, hallucinations ou paranoïa.', 'b00148'),
  card('Quelles sont les deux indications usuelles des antimuscariniques en anesthésie ?', 'Traiter une bradycardie et réduire les sécrétions.', 'b00150'),
  card('Pourquoi l’atropine peut-elle agir dans le cerveau ?', 'C’est une amine tertiaire liposoluble.', 'b00153'),
  card('Quels effets centraux caractérisent la scopolamine ?', 'Somnolence, amnésie et analgésie.', 'b00155'),
  card('Pourquoi le glycopyrrolate a-t-il peu d’effets centraux ?', 'C’est une amine quaternaire ionisée qui franchit mal la barrière cérébrale.', 'b00157'),
  card('Quel antimuscarinique réduit fortement la salivation avec peu de tachycardie ?', 'Le glycopyrrolate.', 'b00157'),
];
const QCM_SERIES = [
  {
    label: 'QCM — Série 1 · Organisation autonome', allowed_voies: ['interne'], questions: [
      qcm('Quelles propriétés décrivent l’organisation générale d’une voie autonome ?', src('b00005', 'b00006'), 'Une voie autonome efférente relie le SNC à un effecteur viscéral par un relais ganglionnaire entre deux neurones.', [
        [true, 'Le neurone préganglionnaire a son corps cellulaire dans le système nerveux central.', 'La commande naît dans la moelle épinière ou le tronc cérébral.'],
        [true, 'La fibre préganglionnaire est habituellement myélinisée.', 'Sa gaine la distingue de la fibre située après le relais.'],
        [true, 'Le neurone postganglionnaire a son corps cellulaire dans un ganglion périphérique.', 'Le relais autonome contient le soma du second neurone.'],
        [false, 'La fibre postganglionnaire rejoint exclusivement un muscle squelettique.', 'Les effecteurs autonomes sont surtout cœur, muscles lisses et glandes.'],
        [false, 'L’activité autonome est totalement indépendante des émotions.', 'Peur, stress et excitation sexuelle modifient le tonus végétatif.'],
      ]),
      qcm('Quelles caractéristiques appartiennent au système sympathique ?', src('b00008', 'b00012', 'b00013'), 'Le sympathique thoracolombaire utilise des relais proches du rachis, d’où des fibres préganglionnaires courtes et postganglionnaires longues.', [
        [false, 'Ses neurones préganglionnaires proviennent uniquement du tronc cérébral.', 'Cette origine crânienne appartient au parasympathique.'],
        [true, 'La colonne intermédiolatérale contient les corps cellulaires préganglionnaires.', 'Elle constitue l’origine médullaire thoracolombaire de la voie.'],
        [false, 'Ses ganglions sont tous inclus dans la paroi de l’organe cible.', 'Beaucoup siègent dans les chaînes paravertébrales ou les plexus prévertébraux.'],
        [true, 'Le rameau communicant blanc conduit une fibre vers le ganglion paravertébral.', 'Il appartient au trajet préganglionnaire sympathique.'],
        [true, 'Le rameau gris permet à certaines fibres de regagner un nerf spinal.', 'Ces axones postganglionnaires gagnent notamment la peau.'],
      ]),
      qcm('À propos de la médullosurrénale, quelles affirmations sont exactes ?', src('b00021', 'b00024', 'b00025'), 'La médullosurrénale se comporte comme un relais sympathique modifié qui transforme une stimulation cholinergique en sécrétion endocrine de catécholamines.', [
        [true, 'Elle reçoit directement des fibres sympathiques préganglionnaires.', 'Aucun neurone postganglionnaire classique ne s’interpose avant les cellules chromaffines.'],
        [false, 'Elle est atteinte par le nerf vague.', 'Les fibres concernées empruntent le nerf splanchnique.'],
        [true, 'Ses cellules chromaffines libèrent des catécholamines dans la circulation.', 'La réponse devient systémique et de nature neurohormonale.'],
        [false, 'Sa sécrétion contient principalement de la noradrénaline.', 'L’adrénaline représente environ quatre cinquièmes du mélange.'],
        [false, 'Elle constitue un ganglion parasympathique terminal.', 'Son rattachement fonctionnel est sympathique.'],
      ]),
      qcm('Quelles données distinguent la division parasympathique ?', src('b00027'), 'Le parasympathique craniosacré possède de longues fibres préganglionnaires et des ganglions juxtaviscéraux, ce qui rend son action ciblée.', [
        [true, 'Ses origines associent tronc cérébral et moelle sacrée.', 'Cette distribution explique l’appellation craniosacrée.'],
        [true, 'Ses ganglions se situent près de l’effecteur ou dans sa paroi.', 'Le relais terminal raccourcit la fibre postganglionnaire.'],
        [false, 'Ses ganglions forment une chaîne continue le long du rachis.', 'Cette chaîne appartient au système sympathique.'],
        [true, 'Le nerf vague en représente la composante majeure.', 'Il compte pour environ 75 % de cette division.'],
        [false, 'Ses fibres sacrées innervent principalement le myocarde.', 'Elles gagnent surtout côlon distal, rectum, vessie et organes reproducteurs.'],
      ]),
      qcm('Quelles associations entre nerf crânien et territoire parasympathique sont correctes ?', src('b00027'), 'Les voies crâniennes distribuent une commande ciblée aux yeux, aux glandes et à de nombreux viscères thoracoabdominaux.', [
        [false, 'Le nerf III commande les glandes parotides.', 'La parotide reçoit surtout des fibres issues du IX.'],
        [true, 'Le nerf VII participe à l’innervation lacrymale et sous-mandibulaire.', 'Le facial porte ces contingents sécrétoires.'],
        [true, 'Le nerf IX innerve notamment la glande parotide.', 'Le glossopharyngien contribue à la sécrétion salivaire parotidienne.'],
        [false, 'Le nerf X innerve le sphincter de l’iris.', 'Cette commande emprunte le nerf oculomoteur.'],
        [true, 'Le nerf X gagne le cœur, les poumons et le tube digestif.', 'Le vague assure une vaste innervation viscérale.'],
      ]),
    ],
  },
  {
    label: 'QCM — Série 2 · Neurotransmetteurs', allowed_voies: ['interne'], questions: [
      qcm('Quelles étapes appartiennent à la biosynthèse de la noradrénaline ?', src('b00031'), 'La tyrosine devient successivement DOPA, dopamine puis noradrénaline, avec une compartimentation vésiculaire de la dernière étape.', [
        [true, 'La tyrosine hydroxylase transforme la tyrosine en DOPA.', 'Cette réaction cytoplasmique est l’étape limitante.'],
        [true, 'La DOPA décarboxylase produit la dopamine.', 'Elle retire le groupement carboxyle de la DOPA.'],
        [false, 'La COMT convertit la dopamine en noradrénaline.', 'La dopamine β-hydroxylase réalise cette conversion.'],
        [true, 'La dopamine entre dans une vésicule avant de devenir noradrénaline.', 'Le transport vésiculaire protège le précurseur de la dégradation.'],
        [false, 'La monoamine oxydase constitue l’enzyme de synthèse finale.', 'La MAO catabolise les monoamines non stockées.'],
      ]),
      qcm('Quels mécanismes encadrent la libération de noradrénaline ?', src('b00031', 'b00032', 'b00033'), 'La stimulation augmente la synthèse et déclenche une exocytose calcique, puis la recapture présynaptique termine l’essentiel du signal.', [
        [false, 'La noradrénaline n’est libérée qu’en situation de stress extrême.', 'Une libération basale existe au repos.'],
        [true, 'L’exocytose vésiculaire dépend du calcium.', 'Le calcium permet la fusion des vésicules avec la membrane.'],
        [false, 'La totalité du neurotransmetteur diffuse dans le sang.', 'Seule une faible fraction échappe à la synapse.'],
        [true, 'La terminaison nerveuse recapture environ 95 % de la quantité libérée.', 'Ce transport actif est le principal mécanisme d’arrêt.'],
        [true, 'La stimulation sympathique accroît l’activité de la tyrosine hydroxylase.', 'Les réserves sont ainsi adaptées à une demande accrue.'],
      ]),
      qcm('Quelles propositions décrivent la terminaison cholinergique ?', src('b00039', 'b00040', 'b00041'), 'L’acétylcholine est synthétisée à partir de choline et d’acétyl-CoA, stockée en vésicules puis hydrolysée très rapidement.', [
        [true, 'La choline acétyltransférase assure la synthèse cytoplasmique.', 'Elle unit les deux substrats nécessaires.'],
        [false, 'L’acétyl-CoA provient principalement du noyau neuronal.', 'Il est fourni par le métabolisme mitochondrial.'],
        [true, 'Le stockage vésiculaire protège l’acétylcholine.', 'La séquestration limite son hydrolyse avant la libération.'],
        [false, 'La COMT hydrolyse l’acétylcholine dans la fente.', 'Cette fonction revient à l’acétylcholinestérase.'],
        [false, 'Le VIP diminue systématiquement la salivation.', 'Ce cotransmetteur vasodilatateur en amplifie l’effet.'],
      ]),
      qcm('Quelles voies autonomes sont cholinergiques ?', src('b00029', 'b00040', 'b00051'), 'Toutes les fibres préganglionnaires et les fibres postganglionnaires parasympathiques libèrent de l’acétylcholine ; certaines fibres sympathiques font exception au modèle noradrénergique.', [
        [true, 'Les fibres préganglionnaires sympathiques.', 'Elles activent un récepteur nicotinique ganglionnaire.'],
        [true, 'Les fibres préganglionnaires parasympathiques.', 'Leur transmetteur de relais est aussi l’acétylcholine.'],
        [false, 'Toutes les fibres postganglionnaires sympathiques cardiaques.', 'Celles qui innervent le cœur libèrent surtout la noradrénaline.'],
        [true, 'Les fibres postganglionnaires parasympathiques.', 'Elles activent des récepteurs muscariniques effecteurs.'],
        [true, 'Une minorité de fibres sympathiques destinées aux glandes sudoripares.', 'Cette exception utilise une transmission cholinergique périphérique.'],
      ]),
      qcm('Quelles affirmations sur la cotransmission autonome sont justes ?', src('b00034', 'b00037', 'b00040'), 'Un neurotransmetteur classique peut partager sa terminaison avec un peptide ou l’ATP, lesquels modulent l’intensité et la durée de la réponse.', [
        [false, 'Un neurone autonome ne peut contenir qu’un seul médiateur.', 'La coexistence de plusieurs substances est fréquente.'],
        [true, 'Le neuropeptide Y peut être colocalisé avec la noradrénaline.', 'Cette association existe dans des fibres sympathiques postganglionnaires.'],
        [true, 'L’ATP peut accompagner la noradrénaline.', 'Il participe à la cotransmission sympathique.'],
        [false, 'Les médiateurs tissulaires n’influencent pas une terminaison présynaptique.', 'Des récepteurs présynaptiques peuvent augmenter ou diminuer la libération.'],
        [true, 'Le VIP peut accompagner l’acétylcholine.', 'Son action vasodilatatrice renforce certaines réponses sécrétoires.'],
      ]),
    ],
  },
  {
    label: 'QCM — Série 3 · Récepteurs et organes', allowed_voies: ['interne'], questions: [
      qcm('Quels effets relèvent principalement d’un récepteur α1 ?', src('b00043', 'b00049'), 'L’activation α1 contracte de nombreux muscles lisses, augmente le tonus vasculaire et produit une mydriase radiaire.', [
        [true, 'La contraction des artérioles cutanées.', 'Le muscle lisse vasculaire exprime des récepteurs α1.'],
        [false, 'La relaxation directe des bronches.', 'La bronchodilatation dépend surtout de β2.'],
        [true, 'La contraction des veines.', 'La venoconstriction augmente le retour veineux et les résistances.'],
        [true, 'La contraction du muscle radial de l’iris.', 'Cette contraction radiaire produit une dilatation nette de la pupille.'],
        [false, 'Le ralentissement direct du nœud sinusal.', 'Le frein cardiaque autonome est principalement muscarinique M2.'],
      ]),
      qcm('Quelles conséquences peut avoir une stimulation β1 ?', src('b00043'), 'β1 stimule le myocarde et la conduction tout en favorisant la libération de rénine par le rein.', [
        [true, 'Une augmentation de la contractilité ventriculaire.', 'L’inotropisme positif constitue un effet cardiaque majeur.'],
        [true, 'Une accélération du nœud sinusal.', 'Le chronotropisme positif augmente la fréquence.'],
        [false, 'Une bronchoconstriction directe.', 'Le tonus bronchique n’est pas accru par β1.'],
        [true, 'Une augmentation de la vitesse de conduction atrioventriculaire.', 'La stimulation facilite la propagation de l’influx cardiaque.'],
        [true, 'Une libération de rénine par les cellules juxtaglomérulaires.', 'Le rein participe ainsi à la réponse pressive.'],
      ]),
      qcm('Quelles réponses sont compatibles avec une activation β2 ?', src('b00043'), 'β2 relâche plusieurs muscles lisses et peut modifier la perfusion, la ventilation et le métabolisme.', [
        [true, 'Une bronchodilatation.', 'Le relâchement du muscle bronchique augmente le calibre des voies aériennes.'],
        [false, 'Une vasoconstriction généralisée α-like.', 'Les territoires β2 répondent plutôt par une dilatation.'],
        [true, 'Une relaxation utérine.', 'Le myomètre peut être relâché par cette voie.'],
        [false, 'Une contraction du détrusor.', 'β2 favorise au contraire sa relaxation.'],
        [false, 'Une diminution directe de la fréquence cardiaque.', 'Un agoniste β2 ne reproduit pas le frein vagal.'],
      ]),
      qcm('Quels rôles peut-on attribuer aux récepteurs cholinergiques autonomes ?', src('b00051'), 'Le nicotinique transmet le signal au ganglion, tandis que les muscariniques assurent l’essentiel de la réponse viscérale parasympathique.', [
        [true, 'Le récepteur nicotinique ganglionnaire active le neurone postganglionnaire.', 'Il reçoit l’acétylcholine préganglionnaire des deux divisions.'],
        [false, 'Le récepteur nicotinique est le principal récepteur cardiaque vagal.', 'Le ralentissement vagal cardiaque dépend surtout du sous-type muscarinique M2.'],
        [true, 'M2 prédomine dans le tissu cardiaque.', 'Son activation ralentit fréquence et conduction.'],
        [true, 'M3 est fréquent dans les glandes et le muscle lisse.', 'Il sous-tend sécrétions et contractions viscérales.'],
        [false, 'Les récepteurs muscariniques sont absents du système nerveux central.', 'Plusieurs sous-types y sont exprimés.'],
      ]),
      qcm('Quelles associations organe-effet autonome sont correctes ?', src('b00054', 'b00055', 'b00058', 'b00059'), 'Les deux divisions ont souvent des effets opposés, mais leur prédominance et leur importance diffèrent selon l’organe.', [
        [false, 'Le parasympathique dilate la pupille.', 'Il contracte le sphincter irien et produit un myosis.'],
        [true, 'Le sympathique augmente la fréquence et la force cardiaques.', 'Cette réponse prépare à un effort ou à un danger.'],
        [true, 'Le parasympathique stimule le péristaltisme digestif.', 'Il favorise digestion et absorption au repos.'],
        [false, 'Le sympathique contracte toujours les bronches.', 'Son effet dominant est une bronchodilatation β2.'],
        [true, 'Le parasympathique participe à l’érection.', 'La vasodilatation génitale appartient à la fonction de conservation.'],
      ]),
    ],
  },
  {
    label: 'QCM — Série 4 · Réflexes autonomes', allowed_voies: ['interne'], questions: [
      qcm('Quelles étapes composent la réponse à une élévation de pression artérielle ?', src('b00067', 'b00068', 'b00071'), 'L’étirement des barorécepteurs active les afférences IX-X, réduit le tonus sympathique et augmente le frein vagal.', [
        [true, 'Les sinus carotidiens et la crosse aortique augmentent leurs décharges.', 'Leur paroi détecte la distension produite par la pression.'],
        [true, 'Le nerf glossopharyngien conduit une partie des afférences.', 'Le nerf de Hering relie le sinus carotidien au tronc cérébral.'],
        [false, 'Le centre vasoconstricteur est activé davantage.', 'Il est inhibé pour réduire les résistances.'],
        [true, 'Le tonus vagal sur le nœud sinusal augmente.', 'Cette activation parasympathique diminue directement la fréquence cardiaque.'],
        [false, 'Une vasoconstriction diffuse constitue la réponse finale.', 'Le retrait sympathique entraîne une vasodilatation.'],
      ]),
      qcm('Quelles réponses suivent une chute aiguë de pression artérielle ?', src('b00069', 'b00070', 'b00071'), 'L’inhibition des barorécepteurs restaure le sympathique, réduit le vague et redistribue le débit vers les organes critiques.', [
        [true, 'Une augmentation des résistances artérielles.', 'La noradrénaline contracte les vaisseaux α-adrénergiques.'],
        [false, 'Une activation vagale soutenue.', 'Le frein parasympathique est retiré.'],
        [true, 'Une augmentation du tonus veineux.', 'La venoconstriction soutient le retour veineux.'],
        [true, 'Une diminution relative du débit cutané et splanchnique.', 'La redistribution protège cerveau, cœur et reins.'],
        [true, 'Une restauration de l’activité sympathique cardiaque.', 'La fréquence et la contractilité peuvent augmenter.'],
      ]),
      qcm('Quelles caractéristiques définissent le réflexe de Bezold-Jarisch ?', src('b00078'), 'Une stimulation ventriculaire gauche déclenche une réponse cardio-inhibitrice associant hypotension, bradycardie et vasodilatation coronaire.', [
        [true, 'Le point de départ se situe dans la paroi du ventricule gauche.', 'Des chimio- et mécanorécepteurs y déclenchent la boucle.'],
        [false, 'La triade comprend hypertension, tachycardie et vasoconstriction.', 'Ce tableau est à l’opposé de la réponse décrite.'],
        [true, 'Une ischémie myocardique peut le provoquer.', 'L’infarctus fait partie des contextes associés.'],
        [false, 'Il dépend d’une traction sur un muscle extraoculaire.', 'Ce déclencheur correspond au réflexe oculocardiaque.'],
        [false, 'Son expression cardiaque habituelle est une tachycardie.', 'La fréquence ralentit pendant la réponse.'],
      ]),
      qcm('Quelles propositions décrivent le réflexe oculocardiaque ?', src('b00082'), 'La traction oculaire emprunte une afférence trigéminale et déclenche une réponse parasympathique pouvant causer une bradycardie profonde.', [
        [true, 'Une traction des muscles extraoculaires peut l’initier.', 'Les récepteurs à l’étirement constituent le point de départ.'],
        [true, 'L’afférence rejoint la division ophtalmique du trijumeau.', 'Les nerfs ciliaires conduisent le stimulus vers le ganglion trigéminal.'],
        [false, 'L’efférence terminale est sympathique β1.', 'La réponse passe par une augmentation du tonus vagal.'],
        [true, 'L’atropine peut en réduire l’incidence.', 'Son antagonisme muscarinique freine la bradycardie.'],
        [false, 'Il est exceptionnel au cours de la chirurgie oculaire.', 'L’incidence rapportée s’étend de 30 à 90 %.'],
      ]),
      qcm('Que peut-on observer au cours d’une manœuvre de Valsalva ?', src('b00084'), 'La contrainte diminue le retour veineux et active le sympathique ; la libération entraîne un rebond pressif puis un frein parasympathique.', [
        [false, 'La glotte reste ouverte pendant l’expiration forcée.', 'La manœuvre est effectuée à glotte fermée.'],
        [true, 'La pression intrathoracique augmente pendant la contrainte.', 'La colonne d’air bloquée comprime les structures thoraciques.'],
        [true, 'Le retour veineux diminue dans la phase de contrainte.', 'La compression limite l’afflux sanguin vers le cœur.'],
        [false, 'La fréquence cardiaque baisse immédiatement par stimulation vagale.', 'La baisse pressive entraîne d’abord une réponse sympathique.'],
        [true, 'L’ouverture de la glotte peut être suivie d’une activation baroréflexe parasympathique.', 'Le retour veineux et la pression rebondissent avant la normalisation.'],
      ]),
    ],
  },

  {
    label: 'QCM — Série 5 · Vasopresseurs', allowed_voies: ['interne'], questions: [
      qcm('Quelles propriétés pharmacodynamiques caractérisent l’adrénaline ?', src('b00094', 'b00099'), 'L’adrénaline active les récepteurs α et β, stimule le cœur, contracte certains vaisseaux et dilate les bronches.', [
        [true, 'Elle possède un agonisme adrénergique non sélectif.', 'Son spectre réunit des cibles α et β.'],
        [true, 'Elle augmente la fréquence cardiaque par une action β1.', 'La stimulation nodale produit un effet chronotrope positif.'],
        [false, 'Elle augmente toujours la pression diastolique.', 'La vasodilatation β2 peut réduire les résistances et la pression diastolique.'],
        [true, 'Elle constitue un traitement de référence de l’arrêt cardiaque.', 'Ses effets vasculaires et cardiaques répondent à cette urgence.'],
        [false, 'Ses doses répétées sont dépourvues de désensibilisation.', 'Une atténuation de réponse est décrite après répétition.'],
      ]),
      qcm('Quelles réponses hémodynamiques sont attendues sous noradrénaline ?', src('b00101'), 'Le profil α dominant élève les résistances et les deux composantes de pression, tandis que le baroréflexe peut ralentir le cœur.', [
        [true, 'Une vasoconstriction artérielle importante.', 'L’activation α1 contracte les artérioles.'],
        [false, 'Une bronchodilatation β2 majeure.', 'La noradrénaline a très peu d’activité β2.'],
        [true, 'Une hausse de la pression systolique.', 'La résistance accrue soutient la pression maximale.'],
        [true, 'Une hausse de la pression diastolique.', 'Le tonus vasculaire élevé maintient la pression entre les battements.'],
        [true, 'Une bradycardie réflexe possible.', 'Les barorécepteurs activent le vague face à la hausse tensionnelle.'],
      ]),
      qcm('Quels éléments doivent être anticipés avec l’éphédrine ?', src('b00103'), 'L’éphédrine augmente pression et activité cardiaque par des actions directes et par libération de noradrénaline, avec tachyphylaxie aux répétitions.', [
        [true, 'Une augmentation de la pression artérielle.', 'La stimulation adrénergique élève le tonus vasculaire et le débit.'],
        [false, 'Un effet exclusivement α1 direct.', 'Le médicament agit sur plusieurs réponses et mobilise aussi la noradrénaline.'],
        [true, 'Une accélération de la fréquence cardiaque.', 'Le versant stimulant cardiaque accompagne l’effet presseur.'],
        [false, 'Une puissance supérieure à celle de l’adrénaline.', 'Elle est décrite comme moins puissante et plus prolongée.'],
        [true, 'Une tachyphylaxie après des bolus répétés.', 'L’épuisement des réserves neuronales réduit progressivement l’efficacité.'],
      ]),
      qcm('À propos de la phényléphrine, quelles affirmations sont justes ?', src('b00105'), 'La phényléphrine est un agoniste α1 pur : sa vasoconstriction augmente la pression mais peut ralentir le cœur et diminuer le débit.', [
        [true, 'Elle contracte les vaisseaux par stimulation α1.', 'Son action directe cible le muscle lisse vasculaire.'],
        [true, 'Elle peut traiter une hypotension liée à une anesthésie neuraxiale.', 'La restauration du tonus vasculaire corrige la vasoplégie.'],
        [false, 'Elle augmente directement la fréquence par agonisme β1.', 'Elle ne possède pas ce profil de stimulation cardiaque.'],
        [true, 'Une bradycardie baroréflexe peut apparaître.', 'La pression accrue stimule les afférences artérielles.'],
        [false, 'Elle garantit une augmentation du débit cardiaque.', 'La postcharge et le ralentissement peuvent faire baisser le débit.'],
      ]),
      qcm('Quelles comparaisons entre adrénaline, noradrénaline et phényléphrine sont correctes ?', src('b00094', 'b00099', 'b00101', 'b00105'), 'Le choix dépend du besoin de stimulation cardiaque, de vasoconstriction et du risque de réflexe barorécepteur.', [
        [false, 'La phényléphrine est la plus stimulante sur β1.', 'Son profil α1 sélectif ne fournit pas de stimulation myocardique β1 directe.'],
        [true, 'L’adrénaline combine activité cardiaque et bronchodilatatrice.', 'Les composantes β1 cardiaque et β2 bronchique complètent son effet vasculaire α.'],
        [true, 'La noradrénaline augmente les résistances plus nettement que l’adrénaline.', 'Son activité α est dominante et son effet β2 faible.'],
        [false, 'La noradrénaline abolit toute réponse vagale.', 'La hausse tensionnelle peut justement déclencher une réponse vagale.'],
        [true, 'Phényléphrine et noradrénaline peuvent provoquer une bradycardie réflexe.', 'Leur effet presseur active le baroréflexe.'],
      ]),
    ],
  },
  {
    label: 'QCM — Série 6 · Inotropes et agonistes α2', allowed_voies: ['interne'], questions: [
      qcm('Quelles données orientent vers la dobutamine ?', src('b00107'), 'La dobutamine soutient un débit insuffisant par agonisme β1, au prix possible d’une vasodilatation et d’une hypotension.', [
        [true, 'Une situation de choc cardiogénique.', 'Le défaut de pompe bénéficie d’un renforcement inotrope.'],
        [true, 'La recherche d’un effet inotrope positif.', 'β1 augmente la force de contraction myocardique.'],
        [false, 'Une vasoplégie isolée avec débit déjà élevé.', 'Un inotrope ne corrige pas le mécanisme principal de cette situation.'],
        [true, 'Une possible diminution de pression par activité β2.', 'La vasodilatation musculaire peut dépasser le gain de débit.'],
        [true, 'Une augmentation potentielle de la fréquence cardiaque.', 'L’agonisme β1 possède également un effet chronotrope.'],
      ]),
      qcm('Quelles propositions concernant la dopamine sont exactes ?', src('b00109'), 'La dopamine change de profil avec la dose et n’occupe plus une place routinière en réanimation.', [
        [true, 'À faible dose, une activité D1 rénale est décrite.', 'Le territoire rénal répond au versant dopaminergique.'],
        [true, 'À dose moyenne, des effets β deviennent apparents.', 'La fréquence et certains débits régionaux peuvent augmenter.'],
        [true, 'À forte dose, l’activité α1 augmente la pression.', 'La vasoconstriction s’ajoute alors à la stimulation cardiaque.'],
        [false, 'Elle reste le vasopresseur de première intention dans toutes les unités de soins intensifs.', 'Son emploi de routine a été abandonné.'],
        [false, 'Elle est contre-indiquée dans toute bradycardie.', 'Elle demeure un second choix lorsque l’atropine échoue.'],
      ]),
      qcm('Quels effets sont cohérents avec un agonisme α2 central ?', src('b00111', 'b00113'), 'Clonidine et dexmédétomidine diminuent la transmission noradrénergique centrale, produisant sédation, analgésie et parfois brady-hypotension.', [
        [true, 'Une réduction de la libération de noradrénaline.', 'L’activation présynaptique α2 constitue un frein.'],
        [false, 'Une stimulation sympathique diffuse obligatoire.', 'Le mécanisme central est sympatholytique.'],
        [true, 'Un effet sédatif.', 'La diminution du tonus central favorise l’apaisement.'],
        [false, 'Une bronchodilatation β2 comme action principale.', 'Les cibles pharmacologiques sont α2.'],
        [true, 'Une bradycardie possible.', 'Le retrait sympathique cardiaque ralentit la fréquence.'],
      ]),
      qcm('À propos de la dexmédétomidine, quelles affirmations sont exactes ?', src('b00113'), 'La dexmédétomidine, agoniste α2 très sélectif, permet une sédation consciente mais impose une surveillance hémodynamique.', [
        [false, 'Elle est moins sélective pour α2 que la clonidine.', 'Sa sélectivité est décrite comme environ 1 300 fois supérieure.'],
        [true, 'Elle peut être utilisée chez un patient non intubé.', 'La sédation consciente fait partie de ses usages.'],
        [true, 'Elle possède des propriétés analgésiques.', 'L’effet ne se limite pas à l’hypnose.'],
        [true, 'Une hypotension peut survenir pendant la perfusion.', 'La sympatholyse réduit le tonus vasculaire.'],
        [true, 'Une hypertension transitoire peut suivre la dose de charge.', 'L’activation vasculaire périphérique initiale explique cette phase.'],
      ]),
      qcm('Quelles caractéristiques appartiennent à l’isoprotérénol ?', src('b00115'), 'L’isoprotérénol active β1 et β2, accélère nettement le cœur et réduit les résistances, ce qui impose une perfusion.', [
        [true, 'Son action est brève.', 'La courte durée nécessite une administration continue.'],
        [false, 'Il agit comme un agoniste α1 pur.', 'Ses cibles cliniques sont les récepteurs β.'],
        [true, 'Il augmente directement la fréquence cardiaque.', 'La stimulation β1 du nœud sinusal explique le chronotropisme positif observé.'],
        [true, 'Il diminue les résistances vasculaires périphériques.', 'L’activation β2 relâche le muscle lisse de plusieurs territoires vasculaires.'],
        [false, 'Il constitue un traitement de la bradyarythmie par blocage β.', 'L’effet thérapeutique provient au contraire d’une stimulation β.'],
      ]),
    ],
  },
  {
    label: 'QCM — Série 7 · Bronches, phosphodiestérases et bêtabloquants', allowed_voies: ['interne'], questions: [
      qcm('Quelles affirmations décrivent le salbutamol ?', src('b00116', 'b00117', 'b00118', 'b00119'), 'Le salbutamol est un agoniste β2 préférentiel bronchodilatateur, dont les fortes doses exposent à des effets musculaires et digestifs.', [
        [true, 'Il peut être administré par inhalation.', 'Cette voie cible directement l’arbre bronchique.'],
        [false, 'Sa cible préférentielle est le récepteur α2.', 'Le salbutamol stimule principalement β2 et ne possède pas un profil α2.'],
        [true, 'Un tremblement musculaire peut apparaître à forte dose.', 'La stimulation β2 du muscle squelettique explique cet effet.'],
        [false, 'Il accélère toujours le péristaltisme.', 'Le transit peut au contraire ralentir.'],
        [true, 'Le formotérol représente une alternative de longue durée.', 'Ce β2-agoniste prolonge la bronchodilatation.'],
      ]),
      qcm('Que provoque l’inhibition des phosphodiestérases décrites dans ce chapitre ?', src('b00120', 'b00121', 'b00123', 'b00125'), 'En empêchant la dégradation de l’AMPc, ces agents renforcent la contraction cardiaque et peuvent relâcher le muscle lisse vasculaire.', [
        [true, 'Une accumulation intracellulaire d’AMPc.', 'La voie de dégradation du second messager est bloquée.'],
        [true, 'Une amplification des effets situés en aval des récepteurs β.', 'L’AMPc persiste plus longtemps dans la cellule.'],
        [false, 'Une inhibition directe de tous les récepteurs β.', 'La cible est une enzyme, non le récepteur membranaire.'],
        [true, 'Un effet inotrope positif avec l’enoximone.', 'La force de contraction augmente nettement.'],
        [false, 'Une vasoconstriction périphérique constante.', 'Ces molécules possèdent plutôt une activité vasodilatatrice.'],
      ]),
      qcm('Quelles propriétés caractérisent la milrinone ?', src('b00125'), 'La milrinone est un inodilatateur employé dans l’insuffisance cardiaque aiguë, notamment lorsque le lit pulmonaire et la charge ventriculaire doivent être réduits.', [
        [true, 'Elle augmente l’AMPc et l’influx calcique myocardique.', 'Ces mécanismes soutiennent l’inotropisme.'],
        [false, 'Elle augmente directement la postcharge.', 'Sa vasodilatation réduit la résistance à l’éjection.'],
        [true, 'Elle relâche le muscle lisse vasculaire pulmonaire.', 'Le territoire pulmonaire est particulièrement concerné.'],
        [true, 'Elle peut diminuer la précharge et la postcharge.', 'La vasodilatation facilite l’éjection cardiaque.'],
        [false, 'Un emploi prolongé est recommandé dans toute insuffisance cardiaque sévère.', 'Le rapport bénéfice-risque ne justifie pas cette stratégie prolongée.'],
      ]),
      qcm('Quels effets résultent d’un bêtablocage β1 cardiosélectif ?', src('b00127', 'b00128'), 'Aténolol et métoprolol diminuent le travail cardiaque et la consommation d’oxygène tout en allongeant la diastole.', [
        [true, 'Une réduction de la fréquence cardiaque.', 'Le blocage du nœud sinusal freine le chronotropisme.'],
        [true, 'Une baisse de la demande myocardique en oxygène.', 'La diminution du travail protège le myocarde ischémique.'],
        [false, 'Une augmentation systématique du débit cardiaque.', 'Le frein chronotrope et inotrope peut le réduire.'],
        [true, 'Un allongement du temps diastolique.', 'La durée de perfusion coronaire augmente.'],
        [false, 'Un antagonisme α1 responsable de vasodilatation directe.', 'Ces agents sont décrits comme cardiosélectifs β1.'],
      ]),
      qcm('Quelles particularités rendent l’esmolol adapté à un contrôle rapide ?', src('b00129', 'b00130'), 'Son administration intraveineuse et son hydrolyse érythrocytaire donnent à l’esmolol un effet bref et rapidement titrable.', [
        [false, 'Il doit être administré uniquement par voie orale.', 'La formulation décrite est intraveineuse.'],
        [true, 'Les estérases des globules rouges le métabolisent.', 'Cette voie explique la disparition rapide de l’effet.'],
        [true, 'Son effet maximal apparaît en 6 à 10 minutes.', 'Le délai est compatible avec une titration aiguë.'],
        [false, 'Son action persiste plusieurs jours après une dose.', 'Elle a presque disparu vingt minutes après l’administration.'],
        [true, 'Il peut contrôler un épisode hypertensif aigu.', 'La brièveté limite la durée d’un éventuel surdosage.'],
      ]),
    ],
  },
  {
    label: 'QCM — Série 8 · Cholinergiques et antimuscariniques', allowed_voies: ['interne'], questions: [
      qcm('Quels effets accompagnent l’inhibition de l’acétylcholinestérase ?', src('b00137', 'b00138'), 'L’acétylcholine s’accumule aux synapses, renforçant la transmission neuromusculaire mais aussi les manifestations muscariniques.', [
        [true, 'Une augmentation de la transmission neuromusculaire.', 'La concentration d’acétylcholine augmente au niveau de la plaque.'],
        [true, 'Une bradycardie.', 'L’excès cholinergique stimule les récepteurs cardiaques muscariniques.'],
        [false, 'Une sécheresse buccale intense.', 'La salivation est au contraire augmentée.'],
        [true, 'Un myosis.', 'Le sphincter de l’iris répond à l’activation muscarinique.'],
        [true, 'Une accélération du péristaltisme.', 'Le tube digestif est stimulé par l’excès d’acétylcholine.'],
      ]),
      qcm('Quelles caractéristiques distinguent la néostigmine ?', src('b00139', 'b00140'), 'La néostigmine carbamyle réversiblement l’enzyme, agit environ une heure et ne franchit pas la barrière cérébrale.', [
        [true, 'C’est un carbamate ester.', 'Sa structure permet une inhibition réversible prolongée.'],
        [false, 'Son action est irréversible.', 'L’enzyme retrouve son activité après décarbamylation.'],
        [true, 'Son effet maximal survient en 7 à 10 minutes.', 'Ce délai guide l’évaluation de la réponse.'],
        [false, 'Elle traverse facilement le cerveau.', 'La molécule n’entre pas dans le SNC.'],
        [true, 'Le glycopyrrolate peut limiter ses effets muscariniques.', 'L’association réduit salivation et bradycardie.'],
      ]),
      qcm('Quelles comparaisons entre anticholinestérases sont exactes ?', src('b00140', 'b00142', 'b00144', 'b00146'), 'Le choix dépend de la durée, de la voie possible et du passage central : pyridostigmine prolongée, édrophonium bref, physostigmine cérébrale.', [
        [false, 'La pyridostigmine agit plus brièvement que l’édrophonium.', 'Elle possède au contraire un effet prolongé.'],
        [true, 'La pyridostigmine peut être donnée par voie orale.', 'Cette propriété est utile dans la myasthénie.'],
        [true, 'L’édrophonium agit environ dix minutes.', 'Son inhibition compétitive est très courte.'],
        [false, 'La physostigmine est une amine quaternaire exclue du cerveau.', 'C’est une amine tertiaire franchissant la barrière.'],
        [true, 'La physostigmine peut traiter un syndrome anticholinergique central.', 'Son passage cérébral permet d’antagoniser les effets centraux.'],
      ]),
      qcm('Quels signes appartiennent à un syndrome antimuscarinique ?', src('b00147', 'b00148'), 'Le blocage périphérique assèche et ralentit les viscères, tandis que le passage central peut provoquer confusion et hallucinations.', [
        [true, 'Une tachycardie.', 'Le frein vagal cardiaque est supprimé.'],
        [true, 'Une rétention urinaire.', 'Le détrusor perd sa stimulation cholinergique.'],
        [false, 'Une hypersalivation.', 'Les sécrétions diminuent sous antagoniste muscarinique.'],
        [true, 'Une confusion chez un sujet âgé.', 'Les manifestations centrales sont fréquentes sur ce terrain.'],
        [true, 'Une mydriase.', 'Le sphincter irien n’est plus activé par l’acétylcholine.'],
      ]),
      qcm('Quelles différences entre atropine, scopolamine et glycopyrrolate sont exactes ?', src('b00150', 'b00153', 'b00155', 'b00157'), 'La liposolubilité favorise les effets centraux de l’atropine et surtout de la scopolamine, tandis que le glycopyrrolate quaternaire reste périphérique.', [
        [false, 'Le glycopyrrolate traverse mieux la barrière cérébrale que la scopolamine.', 'Sa charge permanente limite fortement ce passage.'],
        [true, 'L’atropine est une amine tertiaire.', 'Sa liposolubilité autorise une action centrale.'],
        [true, 'La scopolamine produit volontiers somnolence et amnésie.', 'Sa forte liposolubilité rend les effets centraux particulièrement prédominants.'],
        [false, 'Le glycopyrrolate accélère plus le cœur que l’atropine.', 'Son effet cardiaque est moins marqué.'],
        [true, 'Le glycopyrrolate réduit puissamment les sécrétions salivaires.', 'Il convient à l’association avec une anticholinestérase.'],
      ]),
    ],
  },
];

const DP_QCM_SERIES = [
  {
    label: 'DP QCM 1 · Hypotension après rachianesthésie', allowed_voies: ['interne'],
    vignette: 'Une femme de 31 ans sans cardiopathie bénéficie d’une rachianesthésie. Peu après l’installation du bloc, elle devient nauséeuse, sa pression artérielle chute et sa fréquence cardiaque reste à 88/min. La ventilation est spontanée et l’oxygénation correcte.',
    questions: [
      qcm('Quels mécanismes autonomes peuvent participer à cette hypotension ?', src('b00054', 'b00067', 'b00068', 'b00069'), 'La pression dépend du débit et des résistances ; une perte de tonus sympathique vasculaire réduit surtout les résistances et le retour veineux.', [
        [true, 'Une diminution du tonus sympathique artériolaire.', 'Les artérioles sont normalement maintenues sous influence sympathique.'],
        [true, 'Une diminution du tonus veineux.', 'La venodilatation réduit le retour vers le cœur.'],
        [false, 'Une activation α1 diffuse spontanée.', 'Une telle réponse contracterait les vaisseaux et soutiendrait la pression.'],
        [true, 'Une baisse des résistances vasculaires périphériques.', 'La relation PA = débit × résistances explique l’effet tensionnel.'],
        [false, 'Une augmentation obligatoire du débit cardiaque.', 'Le débit peut diminuer si le remplissage ventriculaire baisse.'],
      ]),
      qcm('La pression tombe à 72/38 mmHg et la fréquence reste stable. Quelles propriétés rendent la phényléphrine cohérente ici ?', src('b00105'), 'Une vasoplégie avec fréquence conservée peut répondre à un agoniste α1 pur, tout en imposant de surveiller le débit et le baroréflexe.', [
        [true, 'Son action vasoconstrictrice directe.', 'La contraction artériolaire relève les résistances.'],
        [false, 'Une forte stimulation β2 bronchique.', 'Ce médicament ne repose pas sur un agonisme β2.'],
        [true, 'L’augmentation attendue de la pression artérielle.', 'Le gain de tonus vasculaire corrige le mécanisme dominant.'],
        [true, 'L’absence de besoin initial d’un effet chronotrope marqué.', 'La patiente n’est pas bradycarde à ce stade.'],
        [false, 'La certitude d’augmenter le débit cardiaque.', 'Le débit peut baisser par hausse de postcharge et ralentissement réflexe.'],
      ], 'La pression tombe à 72/38 mmHg et la fréquence reste stable.'),
      qcm('Après le premier bolus, la pression atteint 110/62 mmHg et la fréquence passe à 58/min. Comment interpréter cette évolution ?', src('b00071', 'b00105'), 'La hausse de pression a activé les barorécepteurs puis le vague, produisant une bradycardie réflexe attendue avec un agoniste α1.', [
        [true, 'Les sinus carotidiens détectent l’augmentation de distension.', 'Leur décharge augmente lorsque la pression s’élève.'],
        [true, 'Les afférences IX et X gagnent le tronc cérébral.', 'Ces nerfs transmettent le signal barorécepteur.'],
        [false, 'La phényléphrine stimule directement M2 au cœur.', 'La bradycardie est réflexe, non muscarinique directe.'],
        [true, 'Une commande parasympathique accrue atteint le nœud sinusal.', 'La réponse efférente vagale ralentit alors la fréquence cardiaque.'],
        [false, 'Cette évolution prouve une activité β1 excessive.', 'Un effet β1 accélérerait plutôt le cœur.'],
      ], 'Après le premier bolus, la pression atteint 110/62 mmHg et la fréquence passe à 58/min.'),
      qcm('Quelques minutes plus tard, l’hypotension récidive avec une fréquence à 48/min. Quels arguments peuvent faire préférer l’éphédrine ?', src('b00103'), 'L’éphédrine associe effet presseur et stimulation cardiaque ; elle répond mieux qu’un α1 pur à une hypotension accompagnée de bradycardie.', [
        [true, 'Elle augmente la fréquence cardiaque.', 'Son profil adrénergique soutient le chronotropisme.'],
        [true, 'Elle renforce la contractilité.', 'Le versant cardiaque peut relever le débit.'],
        [true, 'Elle élève la pression artérielle.', 'Actions vasculaire et cardiaque convergent vers cet effet.'],
        [false, 'Elle bloque les récepteurs β1.', 'Elle produit des effets sympathomimétiques et non un bêtablocage.'],
        [false, 'Elle agit uniquement par inhibition de l’acétylcholinestérase.', 'Son mécanisme est adrénergique direct et indirect.'],
      ], 'Quelques minutes plus tard, l’hypotension récidive avec une fréquence à 48/min.'),
      qcm('Trois bolus successifs d’éphédrine produisent des réponses de moins en moins nettes. Quelles explications sont plausibles ?', src('b00103'), 'La tachyphylaxie de l’éphédrine vient surtout de l’épuisement progressif des réserves neuronales de noradrénaline mobilisées par son action indirecte.', [
        [false, 'Une accumulation soudaine de glycopyrrolate.', 'Aucun antimuscarinique n’a été administré.'],
        [true, 'Une tachyphylaxie pharmacologique.', 'La baisse rapide d’efficacité après répétition correspond à ce phénomène.'],
        [true, 'Un épuisement des stocks de noradrénaline.', 'La composante indirecte dépend de réserves présynaptiques disponibles.'],
        [false, 'Une transformation de l’éphédrine en bêtabloquant.', 'Le profil récepteur ne change pas de cette manière.'],
        [true, 'La nécessité de réévaluer le mécanisme de l’hypotension.', 'Un traitement devenu peu efficace impose de rechercher un autre déterminant.'],
      ], 'Trois bolus successifs d’éphédrine produisent des réponses de moins en moins nettes.'),
      qcm('Une perfusion α1 corrige la pression mais le débit cardiaque mesuré diminue. Quels mécanismes peuvent l’expliquer ?', src('b00067', 'b00068', 'b00105'), 'La vasoconstriction relève la pression en augmentant les résistances, mais la postcharge et le ralentissement réflexe peuvent réduire le débit.', [
        [true, 'Une augmentation de la postcharge ventriculaire.', 'Le cœur éjecte contre une résistance artérielle plus élevée.'],
        [false, 'Une relaxation généralisée des artérioles.', 'Le traitement provoque une contraction et non une vasodilatation.'],
        [true, 'Une bradycardie baroréflexe.', 'La fréquence plus basse peut diminuer le débit minute.'],
        [true, 'Une pression devenue meilleure malgré un débit moindre.', 'La formule de pression autorise cette dissociation lorsque les résistances montent.'],
        [false, 'Une action inotrope β1 directe de la phényléphrine.', 'Son agonisme sélectif ne renforce pas directement la contraction cardiaque.'],
      ], 'Une perfusion α1 corrige la pression mais le débit cardiaque mesuré diminue.'),
      qcm('Après remplissage adapté et réduction du vasoconstricteur, pression et débit se normalisent. Quels enseignements retenir ?', src('b00054', 'b00067', 'b00068', 'b00103', 'b00105'), 'Le choix d’un sympathomimétique doit intégrer pression, fréquence et débit ; relever un chiffre tensionnel ne suffit pas à garantir une perfusion adaptée.', [
        [true, 'La pression artérielle ne renseigne pas seule sur le débit.', 'Elle combine le débit avec les résistances vasculaires.'],
        [true, 'Le profil de fréquence aide à choisir entre α1 pur et agent mixte.', 'Une bradycardie rend utile un soutien chronotrope.'],
        [false, 'Tout épisode doit recevoir des bolus illimités d’éphédrine.', 'La tachyphylaxie et le mécanisme réel limitent cette stratégie.'],
        [false, 'Une pression normalisée exclut toute baisse de perfusion.', 'Des résistances très élevées peuvent masquer un débit insuffisant.'],
        [true, 'Le traitement doit être réévalué après chaque réponse hémodynamique.', 'La balance pression-débit évolue avec les interventions.'],
      ], 'Après remplissage adapté et réduction du vasoconstricteur, pression et débit se normalisent.'),
    ],
  },
  {
    label: 'DP QCM 2 · Vasoplégie en réanimation', allowed_voies: ['interne'],
    vignette: 'Un homme de 67 ans est admis pour une infection sévère avec hypotension persistante. Après correction prudente de la volémie, sa pression reste basse, ses extrémités sont chaudes et son débit cardiaque est conservé. Le rythme est sinusal, l’oxygénation est correcte et l’équipe cherche à restaurer le tonus vasculaire sans augmenter inutilement un débit déjà satisfaisant.',
    questions: [
      qcm('Quel profil pharmacologique répond au mécanisme hémodynamique dominant ?', src('b00043', 'b00054', 'b00067', 'b00068'), 'Une vasoplégie avec débit préservé appelle d’abord une augmentation des résistances par stimulation vasculaire α1.', [
        [true, 'Un agonisme α1 artériolaire.', 'Il restaure la contraction du muscle lisse vasculaire.'],
        [false, 'Un antagonisme α1 isolé.', 'Bloquer le récepteur accentuerait la vasodilatation.'],
        [true, 'Une augmentation des résistances périphériques.', 'Ce terme manque dans le produit déterminant la pression.'],
        [false, 'Une stimulation muscarinique M2 cardiaque.', 'Elle ralentirait le cœur sans corriger le tonus vasculaire.'],
        [false, 'Une relaxation β2 généralisée.', 'Une vasodilatation supplémentaire aggraverait la pression.'],
      ]),
      qcm('Une perfusion de noradrénaline est commencée. Quelles réponses faut-il attendre ?', src('b00101'), 'La noradrénaline contracte les artérioles et les grosses artères, augmente pression systolique et diastolique et peut déclencher un ralentissement vagal.', [
        [true, 'Une hausse du tonus artériel.', 'L’agonisme α1 domine le profil de la noradrénaline et contracte les artérioles.'],
        [true, 'Une augmentation de la pression diastolique.', 'Les résistances restent élevées entre les éjections.'],
        [false, 'Une bronchodilatation β2 au premier plan.', 'Son activité sur ce sous-type est minime.'],
        [true, 'Une possible augmentation de contractilité par β1.', 'Un effet cardiaque existe malgré la prédominance vasculaire.'],
        [true, 'Un ralentissement réflexe si la pression monte rapidement.', 'Les barorécepteurs peuvent activer le vague.'],
      ], 'Une perfusion de noradrénaline est commencée.'),
      qcm('La pression moyenne se corrige, mais la fréquence passe de 104 à 74/min. Quelles interprétations sont correctes ?', src('b00071', 'b00101'), 'Une décélération après correction pressive est compatible avec le baroréflexe et ne signifie pas nécessairement une défaillance du médicament.', [
        [true, 'La crosse aortique et les sinus carotidiens ont pu être stimulés.', 'La hausse de pression augmente l’étirement de leurs parois.'],
        [false, 'La noradrénaline a bloqué directement les récepteurs β1.', 'Elle possède au contraire une certaine activité agoniste β1.'],
        [true, 'L’activité vagale sur le nœud sinusal peut avoir augmenté.', 'Le bras efférent parasympathique ralentit le cœur après le signal barorécepteur.'],
        [false, 'Le tonus sympathique vasculaire a nécessairement disparu.', 'La pression corrigée témoigne d’une vasoconstriction persistante.'],
        [true, 'Le débit cardiaque doit être surveillé malgré la pression correcte.', 'Une fréquence réduite peut modifier le débit selon le volume d’éjection.'],
      ], 'La pression moyenne se corrige, mais la fréquence passe de 104 à 74/min.'),
      qcm('Une bronchoconstriction aiguë complique l’évolution et une activité β2 devient souhaitable. Quelles propriétés de l’adrénaline deviennent pertinentes ?', src('b00094', 'b00099'), 'L’adrénaline associe β2 bronchique, β1 cardiaque et α vasculaire, mais son profil plus large impose de surveiller fréquence et pression.', [
        [true, 'Une bronchodilatation par stimulation β2.', 'Le muscle lisse bronchique se relâche.'],
        [true, 'Une augmentation de la fréquence par β1.', 'Le nœud sinusal répond à l’agonisme cardiaque.'],
        [true, 'Une vasoconstriction dans les territoires α1.', 'La pression peut être soutenue en parallèle.'],
        [false, 'Une action exclusivement présynaptique α2.', 'Le spectre inclut plusieurs récepteurs α et β.'],
        [false, 'Une absence totale d’effet métabolique ou cardiaque.', 'Son agonisme β a des conséquences systémiques.'],
      ], 'Une bronchoconstriction aiguë complique l’évolution et une activité β2 devient souhaitable.'),
      qcm('Après plusieurs administrations d’adrénaline, l’effet devient moins marqué. Quels éléments peuvent être retenus ?', src('b00094', 'b00099'), 'Les effets durent 10 à 15 minutes et des doses répétées peuvent s’accompagner de désensibilisation, ce qui impose une réévaluation globale.', [
        [true, 'Une durée d’action décrite de 10 à 15 minutes.', 'La réponse doit être replacée dans cette fenêtre temporelle.'],
        [false, 'Une efficacité forcément stable quel que soit le nombre de doses.', 'Une désensibilisation est signalée après répétition.'],
        [true, 'Une diminution progressive de réponse possible.', 'La pharmacodynamie n’est pas immuable au cours du traitement.'],
        [false, 'Une conversion de l’adrénaline en antimuscarinique.', 'Le médicament reste un sympathomimétique.'],
        [true, 'La nécessité de contrôler simultanément pression, fréquence et perfusion.', 'Le profil large peut corriger un paramètre et en dégrader un autre.'],
      ], 'Après plusieurs administrations d’adrénaline, l’effet devient moins marqué.'),
      qcm('Le débit devient élevé tandis que la vasoplégie persiste. Quelles options seraient mal appariées à cette situation ?', src('b00105', 'b00107', 'b00115'), 'Un inotrope ou un β-agoniste renforçant davantage le cœur ne traite pas une vasoplégie à haut débit ; un agent α1 répond mieux au défaut de résistance.', [
        [false, 'Renforcer le tonus α1 avec un vasoconstricteur.', 'Cette stratégie vise précisément la résistance insuffisante.'],
        [true, 'Choisir la dobutamine pour augmenter encore le débit.', 'Le mécanisme n’est pas une défaillance de pompe.'],
        [true, 'Utiliser l’isoprotérénol pour réduire les résistances.', 'Sa vasodilatation β2 risque d’aggraver la pression.'],
        [false, 'Réévaluer la balance débit-résistances.', 'Le calcul physiologique guide l’ajustement.'],
        [true, 'Chercher uniquement une bradycardie à corriger alors que le cœur est rapide.', 'Le profil chronotrope n’est pas le besoin dominant.'],
      ], 'Le débit devient élevé tandis que la vasoplégie persiste.'),
      qcm('La situation se stabilise sous un agent à prédominance α. Quelles règles de raisonnement ressortent de ce dossier ?', src('b00043', 'b00067', 'b00068', 'b00071', 'b00101'), 'La pression doit être décomposée en débit et résistances, puis la réponse baroréflexe doit être distinguée d’un effet cardiaque direct.', [
        [true, 'Une pression basse avec débit conservé suggère un défaut de résistances.', 'Le produit PA = débit × résistances permet cette lecture.'],
        [false, 'La fréquence cardiaque traduit toujours l’effet direct du médicament.', 'Le baroréflexe peut inverser la réponse attendue.'],
        [true, 'La noradrénaline possède un profil vasculaire plus marqué que β2.', 'Son affinité α domine l’effet clinique.'],
        [true, 'Une correction pressive justifie une surveillance du débit.', 'La vasoconstriction peut modifier la charge ventriculaire.'],
        [false, 'Tous les sympathomimétiques sont interchangeables.', 'Leur répartition α, β et leurs actions indirectes diffèrent.'],
      ], 'La situation se stabilise sous un agent à prédominance α.'),
    ],
  },
  {
    label: 'DP QCM 3 · Bas débit après chirurgie cardiaque', allowed_voies: ['interne'],
    vignette: 'Une femme de 72 ans sort de circulation extracorporelle avec un débit cardiaque bas, une pression limite et des signes de congestion pulmonaire. Le rythme est sinusal à 82/min et la volémie a été vérifiée. L’échocardiographie confirme une contraction ventriculaire diminuée, tandis que l’équipe souhaite améliorer l’éjection sans aggraver la pression pulmonaire ni provoquer une vasodilatation incontrôlée.',
    questions: [
      qcm('Quelles propriétés d’un médicament sont recherchées en première analyse ?', src('b00043', 'b00107', 'b00125'), 'Le défaut de pompe appelle un inotrope β1 ou une augmentation d’AMPc, tandis qu’une vasodilatation pulmonaire peut réduire la charge du ventricule.', [
        [true, 'Un effet inotrope positif.', 'La force d’éjection doit augmenter pour relever le débit.'],
        [false, 'Un blocage β1 cardiaque immédiat.', 'Il réduirait la contractilité déjà insuffisante.'],
        [true, 'Une réduction possible de la postcharge.', 'Faciliter l’éjection peut améliorer le volume systolique.'],
        [false, 'Une bradycardie vagale comme objectif principal.', 'La fréquence initiale n’explique pas le bas débit.'],
        [true, 'Une surveillance de la pression si une vasodilatation est induite.', 'Une inodilatation peut dégrader le chiffre tensionnel.'],
      ]),
      qcm('La dobutamine est choisie. Quels effets sont attendus ?', src('b00107'), 'L’agonisme β1 de la dobutamine augmente contractilité, fréquence et débit ; une faible activité β2 peut abaisser la pression.', [
        [true, 'Une augmentation de la contractilité myocardique.', 'C’est l’effet thérapeutique central dans le choc cardiogénique.'],
        [true, 'Une hausse du débit cardiaque.', 'Le volume éjecté augmente si le ventricule répond.'],
        [false, 'Une vasoconstriction α1 pure.', 'Le profil n’est pas celui d’un vasopresseur sélectif.'],
        [true, 'Une accélération possible de la fréquence.', 'β1 exerce également un chronotropisme positif.'],
        [true, 'Une chute de pression par vasodilatation β2.', 'La redistribution vasculaire peut dépasser le gain de débit.'],
      ], 'La dobutamine est choisie.'),
      qcm('Le débit s’améliore mais la pression diminue et les résistances sont basses. Quelles interprétations sont adaptées ?', src('b00067', 'b00068', 'b00107'), 'L’inotropisme a corrigé le débit tandis que la vasodilatation a réduit les résistances ; le produit des deux explique une pression encore insuffisante.', [
        [true, 'L’activité β2 de la dobutamine peut contribuer à la vasodilatation.', 'Une faible activité relaxante existe dans le territoire musculaire.'],
        [false, 'La baisse tensionnelle prouve une diminution du débit.', 'Le débit mesuré s’est au contraire amélioré.'],
        [true, 'La pression peut rester basse malgré un débit plus élevé.', 'Des résistances très réduites abaissent le produit final.'],
        [false, 'La seule solution est d’arrêter tout soutien inotrope.', 'L’ajustement doit préserver la correction du bas débit.'],
        [true, 'Un soutien vasculaire peut être discuté selon la perfusion.', 'Il peut restaurer les résistances sans renoncer à l’inotropisme.'],
      ], 'Le débit s’améliore mais la pression diminue et les résistances sont basses.'),
      qcm('L’hypertension pulmonaire persiste et l’équipe envisage la milrinone. Quelles propriétés sont pertinentes ?', src('b00121', 'b00125'), 'La milrinone augmente l’AMPc, renforce la contraction et relâche le lit vasculaire, notamment pulmonaire, réduisant précharge et postcharge.', [
        [true, 'L’inhibition de la dégradation de l’AMPc.', 'La phosphodiestérase normalement élimine ce second messager.'],
        [false, 'Le blocage direct des canaux calciques myocardiques.', 'L’inotropisme est associé à une augmentation de l’influx calcique.'],
        [true, 'Une activité inotrope positive.', 'Le ventricule peut éjecter davantage.'],
        [true, 'Une relaxation vasculaire pulmonaire.', 'Ce territoire répond particulièrement à l’inodilatateur.'],
        [false, 'Une augmentation volontaire de la postcharge.', 'La vasodilatation sous milrinone tend au contraire à diminuer la postcharge.'],
      ], 'L’hypertension pulmonaire persiste et l’équipe envisage la milrinone.'),
      qcm('Après introduction de milrinone, la pression baisse à nouveau malgré un meilleur débit. Quels risques doivent être anticipés ?', src('b00125'), 'L’effet vasodilatateur de la milrinone facilite l’éjection mais peut provoquer une hypotension qui limite son emploi ou impose un soutien vasculaire.', [
        [true, 'Une vasodilatation systémique trop marquée.', 'La relaxation ne se limite pas au lit pulmonaire.'],
        [true, 'Une réduction excessive de la précharge.', 'Une dilatation veineuse peut diminuer le remplissage.'],
        [false, 'Une obstruction α1 généralisée par agonisme direct.', 'La molécule agit sur une phosphodiestérase.'],
        [true, 'La nécessité de suivre pression et perfusion en parallèle du débit.', 'Un débit meilleur ne garantit pas seul une pression suffisante.'],
        [false, 'L’indication d’un traitement prolongé systématique.', 'L’emploi durable n’est pas justifié par le rapport bénéfice-risque.'],
      ], 'Après introduction de milrinone, la pression baisse à nouveau malgré un meilleur débit.'),
      qcm('Une tachycardie importante apparaît sous stimulation β1. Quels effets physiologiques sont en cause ?', src('b00043', 'b00107'), 'β1 accélère le nœud sinusal, augmente la conduction et renforce la contraction ; l’efficacité hémodynamique doit être confrontée au coût cardiaque.', [
        [true, 'Un chronotropisme positif.', 'Le nœud sinusal décharge plus vite.'],
        [true, 'Une augmentation de la vitesse de conduction.', 'Le tissu nodal répond à l’agonisme β1.'],
        [true, 'Un inotropisme positif concomitant.', 'La force contractile s’accroît en même temps que la fréquence.'],
        [false, 'Une inhibition sélective des cellules juxtaglomérulaires.', 'β1 peut au contraire stimuler la libération de rénine.'],
        [false, 'Une activation M2 responsable de l’accélération.', 'M2 exerce normalement un effet ralentisseur.'],
      ], 'Une tachycardie importante apparaît sous stimulation β1.'),
      qcm('Le débit et la pression finissent par se stabiliser avec des doses ajustées. Quelles conclusions sont justes ?', src('b00043', 'b00107', 'b00121', 'b00125'), 'Dobutamine et milrinone peuvent améliorer un bas débit par des voies différentes, mais leur vasodilatation exige une titration fondée sur pression et perfusion.', [
        [true, 'La dobutamine agit principalement par le récepteur β1.', 'Elle renforce directement la réponse adrénergique cardiaque.'],
        [true, 'La milrinone agit en aval du récepteur sur l’AMPc.', 'Elle bloque la phosphodiestérase responsable de sa dégradation.'],
        [false, 'Les deux agents sont des vasoconstricteurs α1 purs.', 'Leur profil inclut au contraire une vasodilatation.'],
        [true, 'La congestion pulmonaire peut bénéficier d’une réduction de charge.', 'La vasodilatation pulmonaire et systémique facilite l’éjection.'],
        [false, 'La pression artérielle doit être ignorée si le débit s’améliore.', 'Une hypotension limite la perfusion malgré le gain de débit.'],
      ], 'Le débit et la pression finissent par se stabiliser avec des doses ajustées.'),
    ],
  },
  {
    label: 'DP QCM 4 · Intubation fibroscopique éveillée', allowed_voies: ['interne'],
    vignette: 'Un homme de 54 ans présente une voie aérienne difficile prévisible. Une intubation fibroscopique éveillée est planifiée sous anesthésie locale avec sédation, tout en conservant une coopération suffisante. Sa pression est de 138/76 mmHg, sa fréquence de 64/min et il respire spontanément ; la stratégie doit limiter l’anxiété tout en permettant les consignes et la surveillance des réponses vagales.',
    questions: [
      qcm('Quelles propriétés rendent un agoniste α2 adapté à cette stratégie ?', src('b00111', 'b00113'), 'L’agonisme α2 central procure sédation et analgésie en diminuant la transmission noradrénergique, ce qui convient à une procédure consciente.', [
        [true, 'Un effet sédatif central.', 'La réduction du tonus noradrénergique apaise le patient.'],
        [true, 'Des propriétés analgésiques.', 'Elles complètent l’anesthésie locale lors des manipulations.'],
        [false, 'Une paralysie neuromusculaire profonde comme effet intrinsèque.', 'Ces agents ne sont pas des curares.'],
        [true, 'Une utilisation possible chez un patient non intubé.', 'La sédation consciente est précisément une indication décrite.'],
        [false, 'Une activation sympathique massive obligatoire.', 'Le profil central est surtout sympatholytique.'],
      ]),
      qcm('La dexmédétomidine est débutée en perfusion. Quelles caractéristiques la distinguent de la clonidine ?', src('b00111', 'b00113'), 'La dexmédétomidine est beaucoup plus sélective pour α2 et dispose d’un emploi établi en perfusion pour sédation consciente.', [
        [true, 'Une sélectivité α2 environ 1 300 fois supérieure.', 'Cette différence pharmacologique est explicitement décrite.'],
        [false, 'Une absence de tout effet analgésique.', 'Elle possède au contraire une composante analgésique.'],
        [true, 'Un usage en perfusion intraveineuse continue.', 'La procédure éveillée peut être couverte pendant toute sa durée.'],
        [false, 'Une activité principale sur β2 bronchique.', 'La cible pharmacologique de la dexmédétomidine est adrénergique α2, pas β2.'],
        [true, 'Une expérience clinique pour l’intubation fibroscopique éveillée.', 'Cette situation figure parmi les indications rapportées.'],
      ], 'La dexmédétomidine est débutée en perfusion.'),
      qcm('Après la dose de charge, la pression augmente transitoirement. Comment expliquer ce phénomène ?', src('b00113'), 'Une activation α2 périphérique initiale contracte les vaisseaux avant que la sympatholyse centrale ne domine.', [
        [true, 'Une vasoconstriction périphérique précoce.', 'Les récepteurs vasculaires répondent au pic initial de concentration.'],
        [false, 'Un blocage complet des récepteurs α.', 'Le médicament est agoniste, non antagoniste.'],
        [true, 'Un effet lié surtout à la phase de charge.', 'L’hypertension est signalée particulièrement à ce moment.'],
        [false, 'Une stimulation muscarinique des glandes.', 'La réponse pressive ne relève pas de la voie cholinergique.'],
        [true, 'Une évolution ensuite possible vers l’hypotension.', 'La sympatholyse centrale peut prendre le dessus pendant la perfusion.'],
      ], 'Après la dose de charge, la pression augmente transitoirement.'),
      qcm('Pendant la progression du fibroscope, la fréquence ralentit à 46/min. Quels mécanismes sont plausibles ?', src('b00065', 'b00113'), 'La diminution du tonus sympathique sous agoniste α2 favorise la bradycardie, à laquelle peut s’ajouter une stimulation vagale liée à la procédure.', [
        [true, 'Une sympatholyse centrale par activation α2.', 'Le retrait de la commande accélératrice ralentit le nœud sinusal.'],
        [true, 'Une prédominance relative du tonus parasympathique.', 'Le vague devient plus influent lorsque le sympathique recule.'],
        [false, 'Une stimulation directe β1 par la dexmédétomidine.', 'Un tel effet accélérerait la fréquence.'],
        [false, 'Une inhibition de l’acétylcholinestérase par le sédatif.', 'Ce n’est pas son mécanisme pharmacologique.'],
        [true, 'Un effet indésirable connu de la perfusion.', 'La bradycardie fait partie des événements signalés.'],
      ], 'Pendant la progression du fibroscope, la fréquence ralentit à 46/min.'),
      qcm('La pression diminue ensuite parallèlement à la fréquence. Quels paramètres méritent une réévaluation ?', src('b00067', 'b00068', 'b00113'), 'La baisse conjointe de fréquence et de tonus vasculaire peut réduire débit et résistances ; la profondeur de sédation et le débit de perfusion doivent être réexaminés.', [
        [true, 'Le débit de dexmédétomidine.', 'Une exposition trop importante peut renforcer la sympatholyse.'],
        [true, 'La fréquence cardiaque comme déterminant du débit.', 'Un ralentissement marqué peut réduire le débit minute.'],
        [true, 'Les résistances vasculaires périphériques.', 'La diminution du tonus sympathique favorise l’hypotension.'],
        [false, 'La présence d’une tachyphylaxie à l’éphédrine avant toute administration.', 'Aucune éphédrine répétée n’est mentionnée.'],
        [false, 'L’hypothèse d’une activation α1 vasculaire persistante.', 'La pression basse suggère que cet effet n’est pas dominant.'],
      ], 'La pression diminue ensuite parallèlement à la fréquence.'),
      qcm('La stimulation oropharyngée déclenche une nouvelle poussée vagale. Quelles réponses pharmacologiques sont cohérentes ?', src('b00065', 'b00150', 'b00153', 'b00157'), 'Une bradycardie vagale symptomatique peut être antagonisée par un antimuscarinique, atropine ou glycopyrrolate, dont le passage central diffère.', [
        [true, 'Administrer un antagoniste muscarinique si la bradycardie est mal tolérée.', 'Bloquer M2 lève le frein cholinergique cardiaque.'],
        [true, 'Utiliser l’atropine pour un effet chronotrope périphérique marqué.', 'Cet antimuscarinique traite la bradycardie symptomatique.'],
        [false, 'Donner une anticholinestérase pour ralentir la réponse.', 'Elle augmenterait l’acétylcholine et pourrait aggraver le ralentissement.'],
        [true, 'Envisager le glycopyrrolate lorsque l’on souhaite éviter des effets centraux.', 'Sa charge quaternaire limite le passage cérébral.'],
        [false, 'Choisir la scopolamine pour obtenir l’effet cardiaque le plus intense.', 'Ses effets centraux et antisialagogues prédominent davantage.'],
      ], 'La stimulation oropharyngée déclenche une nouvelle poussée vagale.'),
      qcm('L’intubation est réussie avec une sédation ajustée et une hémodynamique stable. Quels points de sécurité résument ce dossier ?', src('b00111', 'b00113', 'b00150', 'b00157'), 'La sédation α2 consciente exige une titration continue et une anticipation de la brady-hypotension ; un antimuscarinique périphérique peut être choisi selon le contexte.', [
        [true, 'Surveiller fréquence et pression pendant toute la perfusion.', 'Les principaux effets indésirables sont hémodynamiques.'],
        [false, 'Considérer la dose de charge comme dépourvue d’effet vasculaire.', 'Une hypertension transitoire est possible.'],
        [true, 'Adapter le débit au niveau de coopération recherché.', 'La sédation consciente doit préserver la participation du patient.'],
        [true, 'Anticiper une réponse vagale lors des manipulations.', 'La stimulation des voies aériennes peut s’ajouter à la sympatholyse.'],
        [false, 'Choisir systématiquement un agent franchissant le cerveau pour contrôler les sécrétions.', 'Le glycopyrrolate périphérique peut mieux convenir.'],
      ], 'L’intubation est réussie avec une sédation ajustée et une hémodynamique stable.'),
    ],
  },
];

const MORE_DP_QCM_SERIES = [
  {
    label: 'DP QCM 5 · Bradycardie pendant chirurgie oculaire', allowed_voies: ['interne'],
    vignette: 'Un enfant prénommé Lucas, âgé de 9 ans, est anesthésié pour correction d’un strabisme. La fréquence cardiaque est stable à 92/min lorsque le chirurgien débute la traction sur un muscle extraoculaire. La pression est normale, aucun médicament chronotrope n’a été administré et le monitorage permet de relier immédiatement toute variation du rythme aux gestes effectués dans l’orbite.',
    questions: [
      qcm('Quelles structures appartiennent à l’arc réflexe susceptible d’être déclenché ?', src('b00082'), 'Le réflexe oculocardiaque naît dans les structures extraoculaires, emprunte le trijumeau puis active une réponse vagale cardiaque.', [
        [true, 'Des récepteurs à l’étirement dans les muscles extraoculaires.', 'La traction mécanique constitue le stimulus initial.'],
        [true, 'Les nerfs ciliaires courts et longs.', 'Ils conduisent l’information depuis l’orbite.'],
        [true, 'La division ophtalmique du trijumeau.', 'L’afférence rejoint le système trigéminal par cette branche.'],
        [false, 'Une efférence sympathique β1 exclusive.', 'La réponse terminale est parasympathique.'],
        [false, 'Le ganglion cœliaque comme relais obligatoire.', 'Ce plexus abdominal n’intervient pas dans la boucle oculaire.'],
      ]),
      qcm('La traction provoque immédiatement une fréquence à 38/min. Quelles interprétations sont exactes ?', src('b00082'), 'La relation temporelle et l’intensité du ralentissement évoquent une activation vagale oculocardiaque, fréquente en chirurgie de l’œil.', [
        [true, 'Le déclencheur mécanique est typique du réflexe oculocardiaque.', 'La traction extraoculaire est le stimulus caractéristique.'],
        [false, 'La réponse correspond à un réflexe de Bainbridge.', 'Bainbridge produit une tachycardie après distension atriale droite.'],
        [true, 'Le tonus parasympathique cardiaque a brutalement augmenté.', 'L’efférence vagale ralentit le nœud sinusal.'],
        [false, 'Une incidence de 1 % rend cette hypothèse exceptionnelle.', 'La fréquence rapportée en chirurgie oculaire est de 30 à 90 %.'],
        [true, 'L’arrêt de la traction fait partie des mesures immédiates logiques.', 'Supprimer le stimulus interrompt l’arc réflexe.'],
      ], 'La traction provoque immédiatement une fréquence à 38/min.'),
      qcm('La fréquence remonte après relâchement, puis rechute lors d’une nouvelle traction. Quels médicaments peuvent réduire cette réponse ?', src('b00082', 'b00150'), 'Atropine et glycopyrrolate bloquent les récepteurs muscariniques cardiaques et diminuent l’incidence du réflexe.', [
        [true, 'L’atropine.', 'Son antagonisme muscarinique lève le frein vagal.'],
        [true, 'Le glycopyrrolate.', 'Il agit en périphérie sans passage cérébral important.'],
        [false, 'La néostigmine seule.', 'Elle augmente l’acétylcholine et peut accentuer la bradycardie.'],
        [false, 'Le métoprolol.', 'Un bêtablocage freinerait davantage le cœur.'],
        [false, 'La clonidine.', 'Sa sympatholyse n’est pas un traitement du ralentissement réflexe aigu.'],
      ], 'La fréquence remonte après relâchement, puis rechute lors d’une nouvelle traction.'),
      qcm('Un antimuscarinique est choisi chez ce patient. Quels effets périphériques faut-il anticiper ?', src('b00147', 'b00148'), 'Le blocage muscarinique accélère le cœur, dilate la pupille et réduit sécrétions et motilité viscérale.', [
        [true, 'Une augmentation de la fréquence cardiaque.', 'L’effet de l’acétylcholine sur M2 est bloqué.'],
        [true, 'Une sécheresse buccale.', 'Les glandes salivaires perdent leur stimulation muscarinique.'],
        [false, 'Une production salivaire accrue.', 'Le blocage muscarinique diminue au contraire les sécrétions glandulaires.'],
        [true, 'Une possible rétention urinaire.', 'Le détrusor reçoit moins de commande cholinergique.'],
        [true, 'Une dilatation pupillaire par inhibition du sphincter irien.', 'Le sphincter irien est inhibé lorsque la commande muscarinique est bloquée.'],
      ], 'Un antimuscarinique est choisi chez ce patient.'),
      qcm('L’équipe veut limiter tout effet central et choisit le glycopyrrolate. Quelles propriétés justifient ce choix ?', src('b00157'), 'Le glycopyrrolate quaternaire, fortement ionisé, pénètre peu dans le cerveau tout en réduisant efficacement la salivation.', [
        [true, 'Sa structure d’amine quaternaire.', 'La charge permanente freine la diffusion lipidique.'],
        [false, 'Une très grande liposolubilité cérébrale.', 'La molécule franchit difficilement la barrière hémato-encéphalique.'],
        [true, 'L’absence d’effets centraux notable.', 'La faible pénétration protège le SNC.'],
        [true, 'Un effet antisialagogue puissant.', 'Il réduit fortement la production de salive.'],
        [false, 'Un effet cardiaque plus marqué que celui de l’atropine.', 'Son action chronotrope est décrite comme moins forte.'],
      ], 'L’équipe veut limiter tout effet central et choisit le glycopyrrolate.'),
      qcm('La bradycardie disparaît, mais une sécheresse marquée est notée. Quelle analyse est correcte ?', src('b00148', 'b00150', 'b00157'), 'L’effet thérapeutique et la sécheresse relèvent du même antagonisme muscarinique périphérique ; l’intensité sécrétoire ne traduit pas un passage central.', [
        [true, 'La diminution salivaire est un effet pharmacologique attendu.', 'Le glycopyrrolate est un antisialagogue puissant.'],
        [false, 'La sécheresse prouve une intoxication sympathique centrale.', 'La réponse vient d’un blocage périphérique des glandes.'],
        [true, 'L’efficacité cardiaque confirme le blocage du versant vagal.', 'La fréquence ne chute plus lors du stimulus.'],
        [false, 'Une augmentation de l’acétylcholine expliquerait la bouche sèche.', 'Un excès cholinergique favoriserait les sécrétions.'],
        [true, 'L’absence de confusion concorde avec le faible passage cérébral.', 'Le caractère quaternaire limite les manifestations centrales.'],
      ], 'La bradycardie disparaît, mais une sécheresse marquée est notée.'),
      qcm('La chirurgie se termine sans nouvel épisode. Quels éléments permettent de distinguer ce réflexe d’autres réponses autonomes ?', src('b00075', 'b00078', 'b00080', 'b00082'), 'Le déclencheur extraoculaire et la bradycardie vagale identifient le réflexe oculocardiaque, contrairement aux stimuli atrial, ventriculaire ou intracrânien.', [
        [true, 'Une traction oculaire le distingue de Bainbridge.', 'Bainbridge naît d’une distension de l’oreillette droite.'],
        [true, 'L’afférence trigéminale le distingue du baroréflexe classique.', 'Le signal ne part ni du sinus carotidien ni de la crosse aortique.'],
        [false, 'Une hypertension intracrânienne est son déclencheur habituel.', 'Ce contexte correspond au réflexe de Cushing.'],
        [true, 'Une bradycardie intense est compatible avec son efférence vagale.', 'Le cœur reçoit un frein parasympathique brutal.'],
        [false, 'Une tachycardie par distension atriale le définit.', 'Cette réponse est celle de Bainbridge.'],
      ], 'La chirurgie se termine sans nouvel épisode.'),
    ],
  },
  {
    label: 'DP QCM 6 · Hypertension intracrânienne et réflexe de Cushing', allowed_voies: ['interne'],
    vignette: 'Une femme de 46 ans est prise en charge pour un processus intracrânien expansif. Sous anesthésie, la pression artérielle augmente rapidement alors que la pression intracrânienne mesurée s’élève. La profondeur anesthésique et l’oxygénation sont stables, aucun vasopresseur n’a été injecté et l’équipe confronte les variations successives de pression et de fréquence au risque d’ischémie cérébrale.',
    questions: [
      qcm('Quels mécanismes initiaux peuvent expliquer la hausse tensionnelle ?', src('b00080'), 'L’ischémie cérébrale liée à la pression intracrânienne active le centre vasomoteur et le sympathique pour tenter de préserver la perfusion cérébrale.', [
        [true, 'Une ischémie du centre vasomoteur.', 'La compression menace l’apport sanguin aux centres cérébraux.'],
        [true, 'Une activation sympathique intense.', 'La réponse vise à augmenter la pression de perfusion.'],
        [false, 'Une inhibition initiale complète du sympathique.', 'Le premier temps est une stimulation, non un retrait.'],
        [true, 'Une augmentation de la contractilité cardiaque.', 'Le cœur participe à la réponse pressive.'],
        [false, 'Une vasodilatation périphérique muscarinique isolée.', 'Le tonus vasomoteur s’élève pour soutenir la pression.'],
      ]),
      qcm('La pression atteint 198/104 mmHg et la fréquence, initialement rapide, commence à diminuer. Quelle séquence est probable ?', src('b00071', 'b00080'), 'Après la réponse sympathique pressive, les barorécepteurs activent le vague et produisent une bradycardie secondaire.', [
        [true, 'Une tachycardie peut précéder le ralentissement.', 'La stimulation sympathique cardiaque appartient au premier temps.'],
        [true, 'L’hypertension augmente la décharge des barorécepteurs.', 'Leur paroi est fortement distendue.'],
        [true, 'Le vague ralentit secondairement le nœud sinusal.', 'La bradycardie est le versant réflexe du second temps.'],
        [false, 'Le phénomène est un réflexe de Bainbridge pur.', 'Bainbridge dépend du remplissage atrial droit.'],
        [false, 'La baisse de fréquence traduit obligatoirement la disparition de l’HTIC.', 'Le stimulus intracrânien peut persister malgré le frein cardiaque.'],
      ], 'La pression atteint 198/104 mmHg et la fréquence, initialement rapide, commence à diminuer.'),
      qcm('La bradycardie atteint 42/min alors que l’hypertension persiste. Quelles affirmations sont justes ?', src('b00067', 'b00068', 'b00071', 'b00080'), 'Le tableau associe une pression élevée par tonus vasomoteur et un ralentissement baroréflexe ; la fréquence seule ne reflète donc pas l’intensité sympathique vasculaire.', [
        [true, 'Le tonus vasculaire sympathique peut rester très élevé.', 'Les résistances soutiennent toujours l’hypertension.'],
        [false, 'La bradycardie prouve un état parasympathique généralisé.', 'Le cœur reçoit un frein vagal tandis que les vaisseaux restent contractés.'],
        [true, 'La pression résulte de résistances élevées malgré une fréquence basse.', 'Le produit débit-résistances peut rester important.'],
        [false, 'La situation est définie par une vasodilatation coronaire et une hypotension.', 'Cette triade évoquerait plutôt Bezold-Jarisch.'],
        [true, 'Le traitement causal doit viser l’agression intracrânienne.', 'La boucle autonome signale une menace de perfusion cérébrale.'],
      ], 'La bradycardie atteint 42/min alors que l’hypertension persiste.'),
      qcm('Un antimuscarinique accélère temporairement le cœur sans corriger l’hypertension. Comment interpréter cette dissociation ?', src('b00071', 'b00080', 'b00150'), 'Le médicament bloque l’efférence vagale cardiaque mais ne supprime ni l’activation vasomotrice sympathique ni l’ischémie cérébrale déclenchante.', [
        [true, 'Le frein muscarinique du nœud sinusal a été levé.', 'La fréquence augmente après antagonisme M2.'],
        [false, 'La cause intracrânienne a nécessairement disparu.', 'Le traitement agit en aval sur le cœur seulement.'],
        [true, 'Les résistances vasculaires peuvent rester élevées.', 'L’antimuscarinique ne bloque pas α1.'],
        [false, 'L’absence de baisse tensionnelle exclut le réflexe de Cushing.', 'La réponse cardiaque et vasculaire peuvent évoluer séparément.'],
        [true, 'La correction symptomatique ne remplace pas la prise en charge causale.', 'La perfusion cérébrale reste menacée tant que la pression intracrânienne persiste.'],
      ], 'Un antimuscarinique accélère temporairement le cœur sans corriger l’hypertension.'),
      qcm('Après contrôle de la pression intracrânienne, la pression artérielle diminue. Quelles modifications autonomes sont attendues ?', src('b00071', 'b00080'), 'La disparition du stimulus ischémique réduit l’activation sympathique ; la moindre pression diminue aussi la stimulation baroréceptrice.', [
        [true, 'Une réduction du tonus vasomoteur sympathique.', 'Le besoin de soutenir artificiellement la perfusion cérébrale recule.'],
        [true, 'Une diminution de la décharge des barorécepteurs.', 'Leur étirement baisse avec la pression.'],
        [false, 'Une aggravation obligatoire de la bradycardie vagale.', 'Le stimulus barorécepteur se relâche.'],
        [true, 'Un retour progressif de la fréquence vers sa valeur initiale.', 'La balance sympathique-vagale se normalise.'],
        [false, 'Une persistance nécessaire de la vasoconstriction maximale.', 'Le mécanisme déclenchant a été corrigé.'],
      ], 'Après contrôle de la pression intracrânienne, la pression artérielle diminue.'),
      qcm('L’équipe compare le tableau avec le réflexe de Bezold-Jarisch. Quelles différences sont correctes ?', src('b00078', 'b00080'), 'Cushing est pressif et d’origine cérébrale ; Bezold-Jarisch naît du ventricule gauche et associe hypotension, bradycardie et vasodilatation coronaire.', [
        [true, 'Le déclencheur de Cushing est une ischémie cérébrale.', 'Une pression intracrânienne élevée menace les centres vasomoteurs.'],
        [false, 'Bezold-Jarisch provoque typiquement une hypertension sévère.', 'Sa triade comprend une hypotension.'],
        [true, 'Les récepteurs de Bezold-Jarisch siègent dans le ventricule gauche.', 'Des mécanorécepteurs et chémorécepteurs y initient la réponse.'],
        [true, 'Les deux réflexes peuvent comporter une bradycardie.', 'Le ralentissement survient toutefois dans des contextes opposés.'],
        [false, 'Les deux réflexes ont pour stimulus une traction oculaire.', 'Cette situation correspond à l’arc trigémino-vagal.'],
      ], 'L’équipe compare le tableau avec le réflexe de Bezold-Jarisch.'),
      qcm('La patiente est stabilisée après traitement neurochirurgical. Quels repères diagnostiques retenir ?', src('b00078', 'b00080', 'b00082'), 'Déclencheur, pression et fréquence permettent de distinguer rapidement Cushing, Bezold-Jarisch et oculocardiaque.', [
        [true, 'HTIC avec hypertension puis bradycardie oriente vers Cushing.', 'La séquence associe activation sympathique et réponse baroréflexe.'],
        [true, 'Hypotension avec bradycardie après stimulus ventriculaire évoque Bezold-Jarisch.', 'La triade cardio-inhibitrice est caractéristique.'],
        [false, 'Traction oculaire avec bradycardie définit Cushing.', 'Ce déclencheur identifie le réflexe oculocardiaque.'],
        [true, 'Le contexte causal est aussi important que la fréquence cardiaque.', 'Plusieurs arcs différents ralentissent le cœur.'],
        [false, 'Toute bradycardie périopératoire relève du même mécanisme.', 'Les afférences et les réponses vasculaires diffèrent nettement.'],
      ], 'La patiente est stabilisée après traitement neurochirurgical.'),
    ],
  },
  {
    label: 'DP QCM 7 · Bradycardie symptomatique résistante', allowed_voies: ['interne'],
    vignette: 'Un homme de 76 ans présente une bradycardie à 34/min avec malaise et pression artérielle basse. Aucun geste oculaire ni signe d’hypertension intracrânienne n’est retrouvé. Le rythme reste régulier, la volémie est jugée correcte et l’équipe veut d’abord lever un éventuel frein vagal, puis utiliser une stimulation adrénergique titrable si la réponse initiale reste insuffisante.',
    questions: [
      qcm('Quelles voies autonomes régulent normalement sa fréquence cardiaque ?', src('b00043', 'b00051', 'b00065'), 'La noradrénaline sympathique stimule β1 et accélère le cœur, tandis que l’acétylcholine vagale active M2 et le ralentit.', [
        [true, 'Le sympathique cardiaque agit par la noradrénaline.', 'Les fibres postganglionnaires libèrent ce transmetteur au cœur.'],
        [true, 'Le récepteur β1 augmente la fréquence.', 'Le nœud sinusal répond par un chronotropisme positif.'],
        [false, 'Le parasympathique accélère le cœur par M3.', 'La commande vagale utilise surtout M2 et ralentit le rythme.'],
        [true, 'Le nerf vague libère de l’acétylcholine.', 'Ce médiateur porte le frein parasympathique.'],
        [false, 'Le récepteur α1 constitue le principal frein sinusal.', 'α1 agit surtout sur le muscle lisse vasculaire.'],
      ]),
      qcm('L’atropine est administrée. Quels éléments décrivent son action ?', src('b00149', 'b00150', 'b00153'), 'L’atropine bloque compétitivement les récepteurs muscariniques, lève le frein vagal et peut agir en périphérie comme dans le SNC.', [
        [true, 'Un antagonisme muscarinique réversible.', 'La molécule s’oppose à l’acétylcholine sans détruire le récepteur.'],
        [false, 'Une stimulation directe β1.', 'L’accélération vient du retrait vagal.'],
        [true, 'Une augmentation de fréquence cardiaque.', 'Le sous-type M2 n’est plus activé efficacement par l’acétylcholine vagale.'],
        [true, 'Un passage possible de la barrière hémato-encéphalique.', 'La structure d’amine tertiaire confère à l’atropine une liposolubilité suffisante.'],
        [false, 'Une hypersalivation attendue.', 'Les sécrétions diminuent sous blocage muscarinique.'],
      ], 'L’atropine est administrée.'),
      qcm('La fréquence ne s’améliore pas suffisamment après atropine. Quelles options de deuxième choix sont décrites ?', src('b00109', 'b00115'), 'Une bradycardie résistante peut conduire à une stimulation adrénergique par dopamine ou isoprotérénol selon le contexte.', [
        [true, 'Une perfusion de dopamine.', 'Elle garde une place de second choix dans cet algorithme.'],
        [true, 'Une perfusion d’isoprotérénol.', 'Son agonisme β1 accélère le cœur et répond au ralentissement symptomatique.'],
        [false, 'Un bêtabloquant cardiosélectif.', 'Un antagoniste β1 aggraverait la bradycardie au lieu de la corriger.'],
        [false, 'Une dose de clonidine.', 'La sympatholyse centrale ralentirait encore la fréquence.'],
        [true, 'Une surveillance étroite de la pression sous agoniste β.', 'Le versant β2 peut diminuer les résistances.'],
      ], 'La fréquence ne s’améliore pas suffisamment après atropine.'),
      qcm('L’isoprotérénol est débuté et la fréquence augmente, mais la pression baisse. Quels mécanismes expliquent cette réponse ?', src('b00115'), 'L’isoprotérénol stimule β1 au cœur et β2 dans les vaisseaux : la tachycardie s’accompagne donc d’une diminution des résistances et de la pression.', [
        [true, 'Une stimulation β1 du nœud sinusal.', 'Elle accélère directement le rythme.'],
        [true, 'Une vasodilatation β2.', 'Le muscle lisse vasculaire se relâche.'],
        [false, 'Une vasoconstriction α1 dominante.', 'L’agent n’a pas ce profil récepteur.'],
        [true, 'Une inhibition baroréceptrice secondaire à la pression basse.', 'Le ralentissement réflexe est levé lorsque l’étirement diminue.'],
        [false, 'Une action prolongée permettant un bolus unique.', 'La courte durée impose une perfusion.'],
      ], 'L’isoprotérénol est débuté et la fréquence augmente, mais la pression baisse.'),
      qcm('Une dopamine est discutée à la place. Quelles propriétés varient avec la dose ?', src('b00109'), 'Le profil de la dopamine évolue de D1 vers β puis α1-β1 lorsque la dose augmente, modifiant débit régional, fréquence et pression.', [
        [true, 'L’activité D1 prédomine à faible dose.', 'Le territoire rénal est alors mis en avant.'],
        [true, 'Les effets β apparaissent à dose moyenne.', 'Le cœur et certains vaisseaux répondent davantage.'],
        [true, 'L’activité α1 devient importante à forte dose.', 'La vasoconstriction augmente la pression.'],
        [false, 'Le médicament reste exclusivement muscarinique à toutes les doses.', 'Ses cibles sont dopaminergiques et adrénergiques.'],
        [false, 'La dopamine ne peut jamais augmenter la contractilité.', 'Le versant β1 à dose élevée renforce la contraction.'],
      ], 'Une dopamine est discutée à la place.'),
      qcm('La fréquence se normalise mais une tachyarythmie menace sous stimulation adrénergique. Quelles propriétés doivent être intégrées ?', src('b00043', 'b00109', 'b00115'), 'La stimulation β1 augmente fréquence, conduction et contractilité ; l’objectif est de corriger le ralentissement sans dépasser une réponse cardiaque utile.', [
        [true, 'β1 accélère la conduction atrioventriculaire.', 'L’influx traverse plus rapidement les tissus nodaux.'],
        [true, 'β1 augmente la contractilité.', 'Le soutien ne se limite pas au rythme.'],
        [false, 'β1 protège systématiquement contre toute arythmie.', 'Une stimulation excessive peut favoriser une tachyarythmie.'],
        [true, 'La dose doit être titrée sur la réponse clinique.', 'L’effet cardiaque croît avec l’exposition.'],
        [false, 'Une fréquence très élevée garantit un débit supérieur.', 'Un rythme excessif peut nuire au remplissage.'],
      ], 'La fréquence se normalise mais une tachyarythmie menace sous stimulation adrénergique.'),
      qcm('Le patient est stabilisé avec la dose minimale efficace. Quelles distinctions thérapeutiques sont exactes ?', src('b00109', 'b00115', 'b00130', 'b00153'), 'Atropine retire le frein muscarinique ; dopamine et isoprotérénol apportent une stimulation adrénergique, tandis qu’esmolol aurait l’effet opposé.', [
        [true, 'L’atropine agit en levant une inhibition vagale.', 'Elle ne stimule pas directement β1.'],
        [true, 'L’isoprotérénol associe β1 cardiaque et β2 vasculaire.', 'Son effet sur la pression peut diverger de celui sur la fréquence.'],
        [false, 'L’esmolol représente un stimulant cardiaque de secours.', 'Cet antagoniste β1 ralentit le cœur.'],
        [false, 'La clonidine constitue un choix logique pour accélérer un rythme lent.', 'Son agonisme α2 réduit le tonus sympathique.'],
        [true, 'La dopamine peut soutenir à la fois pression et cœur à forte dose.', 'Les composantes α1 vasculaire et β1 cardiaque deviennent alors toutes deux actives.'],
      ], 'Le patient est stabilisé avec la dose minimale efficace.'),
    ],
  },
  {
    label: 'DP QCM 8 · Réversion neuromusculaire et effets cholinergiques', allowed_voies: ['interne'],
    vignette: 'Une femme de 63 ans arrive en fin d’intervention après administration d’un curare. Une réversion par anticholinestérase est planifiée. Elle a une fréquence cardiaque à 68/min et des sécrétions bronchiques modérées. L’équipe souhaite restaurer la transmission neuromusculaire tout en prévenant la bradycardie et l’hypersécrétion liées à l’augmentation d’acétylcholine dans les autres synapses.',
    questions: [
      qcm('Quelles conséquences découlent de l’inhibition de l’acétylcholinestérase ?', src('b00137', 'b00138'), 'L’acétylcholine s’accumule dans les fentes synaptiques, renforçant à la fois la transmission neuromusculaire et les réponses muscariniques.', [
        [true, 'Une augmentation de l’acétylcholine disponible.', 'La dégradation enzymatique est freinée.'],
        [true, 'Un renforcement de la transmission neuromusculaire.', 'La plaque motrice reçoit davantage de médiateur.'],
        [false, 'Un blocage direct des récepteurs nicotiniques.', 'L’effet augmente le signal cholinergique au lieu d’en antagoniser le récepteur.'],
        [true, 'Une stimulation concomitante des récepteurs muscariniques.', 'L’acétylcholine n’est pas sélective de la jonction neuromusculaire.'],
        [false, 'Une disparition des sécrétions bronchiques.', 'Les glandes peuvent être davantage stimulées.'],
      ]),
      qcm('La néostigmine est retenue. Quelles caractéristiques pharmacologiques sont exactes ?', src('b00140'), 'La néostigmine inhibe réversiblement l’enzyme sous forme carbamylée, atteint son maximum en 7 à 10 minutes et agit environ une heure.', [
        [true, 'Elle appartient aux carbamates esters.', 'La carbamylation explique son inhibition réversible.'],
        [true, 'Son effet maximal n’est pas immédiat.', 'Il faut attendre approximativement 7 à 10 minutes.'],
        [false, 'Sa durée habituelle est de quelques secondes.', 'L’action se prolonge environ soixante minutes.'],
        [true, 'Elle ne pénètre pas dans le cerveau.', 'Le SNC n’est pas directement exposé.'],
        [false, 'Elle bloque les récepteurs muscariniques.', 'Elle augmente au contraire la stimulation par l’acétylcholine.'],
      ], 'La néostigmine est retenue.'),
      qcm('Peu après l’administration, la fréquence diminue et la salivation augmente. Quels effets expliquent ce tableau ?', src('b00138', 'b00140'), 'L’excès d’acétylcholine stimule les récepteurs muscariniques cardiaques et glandulaires, donnant bradycardie et hypersalivation.', [
        [true, 'Une activation M2 au cœur.', 'Le nœud sinusal ralentit sous influence cholinergique.'],
        [true, 'Une stimulation muscarinique des glandes salivaires.', 'Les sécrétions deviennent plus abondantes.'],
        [false, 'Une activation α1 vasculaire pure.', 'Le tableau est cholinergique et non vasoconstricteur.'],
        [true, 'Un effet indésirable de classe des anticholinestérases.', 'La hausse d’acétylcholine ne se limite pas à la plaque motrice.'],
        [false, 'Un syndrome antimuscarinique.', 'Celui-ci associerait sécheresse et tachycardie.'],
      ], 'Peu après l’administration, la fréquence diminue et la salivation augmente.'),
      qcm('Le glycopyrrolate est associé. Quelles raisons justifient ce choix ?', src('b00138', 'b00157'), 'Le glycopyrrolate bloque les effets muscariniques périphériques, réduit fortement la salivation et a un effet cardiaque moins marqué que l’atropine.', [
        [true, 'Il antagonise la bradycardie cholinergique.', 'Le blocage muscarinique protège le cœur.'],
        [true, 'Il diminue les sécrétions salivaires.', 'Son activité antisialagogue est puissante.'],
        [false, 'Il renforce la transmission nicotinique par inhibition enzymatique.', 'Ce rôle revient à la néostigmine, pas à l’antimuscarinique.'],
        [true, 'Il traverse peu la barrière hémato-encéphalique.', 'Sa structure quaternaire le maintient en périphérie.'],
        [true, 'Il provoque moins de tachycardie que l’atropine.', 'Son effet cardiaque est décrit comme plus modéré.'],
      ], 'Le glycopyrrolate est associé.'),
      qcm('La patiente reste confuse alors que les signes périphériques sont contrôlés. Pourquoi la néostigmine ne corrige-t-elle pas un syndrome central ?', src('b00140', 'b00146'), 'La néostigmine ne franchit pas la barrière cérébrale ; une molécule tertiaire comme la physostigmine peut atteindre les synapses centrales.', [
        [true, 'La néostigmine est exclue du cerveau.', 'Sa distribution ne permet pas d’antagoniser un blocage central.'],
        [false, 'Toute anticholinestérase traverse également le SNC.', 'La structure chimique crée des différences majeures de passage.'],
        [true, 'La physostigmine est une amine tertiaire.', 'Son absence de charge permanente facilite la diffusion membranaire.'],
        [true, 'Une amine tertiaire comme la physostigmine peut corriger une atteinte centrale.', 'Son passage cérébral augmente l’acétylcholine dans les synapses du cerveau.'],
        [false, 'Le glycopyrrolate constitue l’antidote central le plus diffusible.', 'Il franchit justement très mal la barrière.'],
      ], 'La patiente reste confuse alors que les signes périphériques sont contrôlés.'),
      qcm('Un diagnostic différentiel compare néostigmine, pyridostigmine et édrophonium. Quelles distinctions sont exactes ?', src('b00140', 'b00142', 'b00144'), 'Ces inhibiteurs partagent une cible mais diffèrent par rapidité, durée et voie : édrophonium très bref, pyridostigmine prolongée et orale.', [
        [true, 'La pyridostigmine agit plus longtemps que la néostigmine.', 'Sa cinétique est prolongée malgré un début moins rapide.'],
        [true, 'La pyridostigmine peut être prise par voie orale.', 'Cette propriété soutient son emploi chronique dans la myasthénie.'],
        [false, 'L’édrophonium agit environ une heure.', 'Son effet ne dure qu’une dizaine de minutes.'],
        [true, 'L’édrophonium inhibe l’enzyme de façon compétitive et réversible.', 'Il empêche temporairement l’accès au site actif.'],
        [false, 'La néostigmine possède les effets centraux les plus marqués.', 'La néostigmine ne passe pas dans le cerveau et reste donc périphérique.'],
      ], 'Un diagnostic différentiel compare néostigmine, pyridostigmine et édrophonium.'),
      qcm('La réversion est obtenue sans bradycardie ni hypersécrétion persistante. Quels principes faut-il retenir ?', src('b00138', 'b00140', 'b00146', 'b00157'), 'Une anticholinestérase agit sur toutes les synapses cholinergiques accessibles ; l’antimuscarinique associé doit contrôler les effets périphériques sans masquer une atteinte centrale.', [
        [true, 'Anticiper les effets muscariniques dès la prescription de néostigmine.', 'Ils résultent directement de l’accumulation d’acétylcholine.'],
        [true, 'Associer un antagoniste périphérique adapté au profil du patient.', 'Le glycopyrrolate limite salivation et ralentissement.'],
        [false, 'Considérer toute confusion comme corrigée par le glycopyrrolate.', 'La molécule ne pénètre pas suffisamment dans le cerveau.'],
        [true, 'Choisir la physostigmine uniquement si une action centrale est recherchée.', 'Son passage cérébral la distingue des agents quaternaires.'],
        [false, 'Augmenter indéfiniment la néostigmine devant une bradycardie.', 'Une exposition accrue accentuerait la stimulation muscarinique.'],
      ], 'La réversion est obtenue sans bradycardie ni hypersécrétion persistante.'),
    ],
  },
];

const QROC_SERIES = [
  {
    label: 'QROC — Série 1 · Anatomie fonctionnelle', allowed_voies: ['externe'], questions: [
      qroc('Nommez la structure périphérique où s’effectue le relais entre les deux neurones d’une voie autonome.', 'Ganglion autonome|Ganglion autonomique', src('b00006'), 'Le neurone préganglionnaire y fait synapse avec le neurone postganglionnaire.'),
      qroc('Indiquez l’origine centrale de la division sympathique.', 'Moelle thoracolombaire|Segments thoraciques et lombaires', src('b00008'), 'Les corps cellulaires occupent la colonne intermédiolatérale thoracolombaire.'),
      qroc('Quel cordon nerveux conduit la fibre sympathique avant le ganglion paravertébral ?', 'Rameau communicant blanc|Cordon communicant blanc', src('b00013'), 'Le rameau blanc appartient au trajet préganglionnaire.'),
      qroc('Donnez le nom du grand relais sympathique fusionné de la région thoracique haute.', 'Ganglion stellaire', src('b00017'), 'Le ganglion stellaire résulte de la fusion de ganglions thoraciques hauts.'),
      qroc('Quel pourcentage de catécholamines médullosurrénaliennes correspond à l’adrénaline ?', '80 %|Environ 80 %', src('b00024'), 'L’adrénaline domine largement la sécrétion des cellules chromaffines.'),
    ],
  },
  {
    label: 'QROC — Série 2 · Voies parasympathiques', allowed_voies: ['externe'], questions: [
      qroc('Quel terme anatomique résume l’origine du parasympathique ?', 'Craniosacrée|Système craniosacré', src('b00027'), 'Les neurones préganglionnaires siègent dans le tronc cérébral et la moelle sacrée.'),
      qroc('Quel nerf crânien porte la majorité des fibres parasympathiques ?', 'Nerf vague|Nerf X|Vague', src('b00027'), 'Le vague représente environ trois quarts de cette division.'),
      qroc('Quel nerf crânien assure la commande parasympathique du corps ciliaire ?', 'Nerf oculomoteur|Nerf III|III', src('b00027'), 'Le III innerve le corps ciliaire et le sphincter de l’iris.'),
      qroc('Quelle paire crânienne innerve notamment la glande parotide ?', 'Nerf glossopharyngien|Nerf IX|IX', src('b00027'), 'Le IX fournit une commande sécrétoire à la parotide.'),
      qroc('Citez un organe pelvien recevant une innervation parasympathique sacrée.', 'Vessie|Rectum|Côlon descendant|Organes reproducteurs', src('b00027'), 'Les plexus pelviens distribuent la commande aux viscères distaux.'),
    ],
  },
  {
    label: 'QROC — Série 3 · Transmission synaptique', allowed_voies: ['externe'], questions: [
      qroc('Quelle réaction constitue l’étape limitante de la synthèse des catécholamines ?', 'Tyrosine en DOPA|Hydroxylation de la tyrosine', src('b00031'), 'La tyrosine hydroxylase contrôle la vitesse de la voie.'),
      qroc('Nommez l’enzyme qui forme la noradrénaline à partir de dopamine.', 'Dopamine bêta-hydroxylase|Dopamine β-hydroxylase', src('b00031'), 'La réaction se déroule à l’intérieur des vésicules.'),
      qroc('Quel processus élimine la plus grande part de noradrénaline synaptique ?', 'Recapture présynaptique|Recapture neuronale', src('b00033'), 'La terminaison récupère activement environ 95 % du médiateur.'),
      qroc('Quelle enzyme associe choline et acétyl-CoA ?', 'Choline acétyltransférase|Choline acétylase', src('b00039'), 'Elle assure la synthèse cytoplasmique de l’acétylcholine.'),
      qroc('Quel peptide colocalisé avec l’acétylcholine majore la salivation ?', 'VIP|Peptide intestinal vasoactif', src('b00040', 'b00041'), 'Le VIP vasodilatateur renforce la réponse sécrétoire.'),
    ],
  },
  {
    label: 'QROC — Série 4 · Récepteurs', allowed_voies: ['externe'], questions: [
      qroc('Quel sous-type adrénergique est responsable de la vasoconstriction artériolaire ?', 'Alpha 1|α1', src('b00043'), 'L’activation α1 contracte le muscle lisse vasculaire et augmente les résistances.'),
      qroc('Quel sous-type adrénergique inhibe la libération présynaptique de noradrénaline ?', 'Alpha 2|α2', src('b00049'), 'α2 fonctionne comme un frein sur la terminaison noradrénergique.'),
      qroc('Quel sous-type adrénergique augmente la libération de rénine ?', 'Bêta 1|β1', src('b00043'), 'Les cellules juxtaglomérulaires expriment β1.'),
      qroc('Quel récepteur cholinergique assure le relais dans un ganglion autonome ?', 'Nicotinique ganglionnaire|Récepteur N ganglionnaire', src('b00051'), 'L’acétylcholine préganglionnaire active ce canal sur le second neurone.'),
      qroc('Quel sous-type muscarinique ralentit le nœud sinusal ?', 'M2|Récepteur M2', src('b00051'), 'M2 porte l’essentiel du frein vagal cardiaque.'),
    ],
  },
  {
    label: 'QROC — Série 5 · Réflexes périopératoires', allowed_voies: ['externe'], questions: [
      qroc('Écrivez la relation entre pression artérielle, débit cardiaque et résistances.', 'PA = débit cardiaque × résistances vasculaires périphériques|PA = Qc × RVP', src('b00067', 'b00068'), 'La pression peut augmenter par le débit, les résistances ou les deux.'),
      qroc('Quel réflexe accélère le cœur après distension de l’oreillette droite ?', 'Réflexe de Bainbridge|Bainbridge', src('b00075'), 'Les récepteurs d’étirement cavo-atriaux diminuent le tonus parasympathique.'),
      qroc('Nommez le réflexe associant hypotension, bradycardie et vasodilatation coronaire.', 'Réflexe de Bezold-Jarisch|Bezold-Jarisch', src('b00078'), 'Cette triade naît de récepteurs du ventricule gauche.'),
      qroc('Quel réflexe associe hypertension intracrânienne, réponse pressive puis bradycardie ?', 'Réflexe de Cushing|Cushing', src('b00080'), 'L’ischémie cérébrale active d’abord le sympathique, puis le baroréflexe ralentit le cœur.'),
      qroc('Quelle branche du trijumeau reçoit l’afférence du réflexe oculocardiaque ?', 'Division ophtalmique|V1|Branche ophtalmique', src('b00082'), 'Les nerfs ciliaires rejoignent la division ophtalmique du ganglion trigéminal.'),
    ],
  },
  {
    label: 'QROC — Série 6 · Sympathomimétiques', allowed_voies: ['externe'], questions: [
      qroc('Quel sympathomimétique de référence est indiqué lors d’un arrêt cardiaque ?', 'Adrénaline|Épinéphrine', src('b00099'), 'Son agonisme α et β soutient perfusion et activité cardiaque.'),
      qroc('Quel vasopresseur possède un profil surtout α avec très peu d’effet β2 ?', 'Noradrénaline|Norépinéphrine', src('b00101'), 'Il augmente fortement les résistances et les pressions systolique et diastolique.'),
      qroc('Quel phénomène limite l’efficacité de bolus répétés d’éphédrine ?', 'Tachyphylaxie|Épuisement des stocks de noradrénaline', src('b00103'), 'La composante indirecte dépend de réserves neuronales disponibles.'),
      qroc('Quel agoniste α1 pur peut corriger une hypotension anesthésique ?', 'Phényléphrine', src('b00105'), 'Sa vasoconstriction relève les résistances mais peut ralentir le cœur.'),
      qroc('Quel inotrope β1 est indiqué dans un choc cardiogénique ?', 'Dobutamine', src('b00107'), 'L’augmentation de contractilité relève le débit cardiaque.'),
    ],
  },
  {
    label: 'QROC — Série 7 · Modulateurs adrénergiques', allowed_voies: ['externe'], questions: [
      qroc('Quel agoniste α2 très sélectif permet une sédation consciente ?', 'Dexmédétomidine', src('b00113'), 'Elle est utilisée en perfusion chez des patients non intubés.'),
      qroc('Quel agoniste β1-β2 de courte durée traite certaines bradyarythmies ?', 'Isoprotérénol|Isoprénaline', src('b00115'), 'La perfusion accélère le cœur tout en diminuant les résistances.'),
      qroc('Quel second messager s’accumule sous inhibiteur de phosphodiestérase ?', 'AMPc|Adénosine monophosphate cyclique', src('b00121'), 'La phosphodiestérase est normalement responsable de sa dégradation.'),
      qroc('Quel inodilatateur relâche particulièrement le lit vasculaire pulmonaire ?', 'Milrinone', src('b00125'), 'Elle réduit précharge et postcharge tout en augmentant l’inotropisme.'),
      qroc('Quel bêtabloquant IV est hydrolysé par les estérases érythrocytaires ?', 'Esmolol', src('b00130'), 'Son métabolisme explique une durée d’action très courte.'),
    ],
  },
  {
    label: 'QROC — Série 8 · Médicaments cholinergiques', allowed_voies: ['externe'], questions: [
      qroc('Quel délai correspond au pic d’effet de la néostigmine ?', '7 à 10 minutes|Entre 7 et 10 minutes', src('b00140'), 'La carbamylation réversible de l’enzyme atteint alors son effet maximal.'),
      qroc('Quelle anticholinestérase orale agit plus longtemps que la néostigmine ?', 'Pyridostigmine', src('b00142'), 'Son début est plus lent mais sa durée facilite le traitement de la myasthénie.'),
      qroc('Quel inhibiteur compétitif agit environ dix minutes ?', 'Édrophonium', src('b00144'), 'Sa brièveté a permis un usage diagnostique avec une réponse rapidement réversible.'),
      qroc('Quel anticholinestérase franchit le cerveau et traite un syndrome central ?', 'Physostigmine', src('b00146'), 'Cette amine tertiaire traverse la barrière hémato-encéphalique.'),
      qroc('Quel antimuscarinique quaternaire réduit fortement les sécrétions sans effet central ?', 'Glycopyrrolate', src('b00157'), 'Sa charge limite le passage cérébral et son action antisialagogue est puissante.'),
    ],
  },
];

const DP_QROC_SERIES = [
  {
    label: 'DP QROC 1 · Hypotension orthostatique', allowed_voies: ['externe'],
    vignette: 'Une femme de 78 ans se lève pour la première fois après une intervention. Elle ressent un voile noir et sa pression artérielle chute. Aucun saignement n’est retrouvé. Le rythme était sinusal au repos, la volémie a été vérifiée et l’équipe analyse successivement les capteurs artériels, la réponse cardiaque et le recrutement vasculaire nécessaires au maintien de la perfusion.',
    questions: [
      qroc('Quel système efférent doit compenser rapidement la chute tensionnelle ?', 'Système nerveux sympathique|Sympathique', src('b00054', 'b00069'), 'Le tonus sympathique maintient normalement les résistances vasculaires.'),
      qroc('La pression passe de 132/74 à 86/48 mmHg au lever. Quelle classe de capteurs est moins étirée ?', 'Barorécepteurs artériels|Barorécepteurs', src('b00071'), 'La baisse de distension diminue les décharges issues du sinus carotidien et de la crosse.', 'La pression passe de 132/74 à 86/48 mmHg au lever.'),
      qroc('La fréquence augmente à 108/min. Quel récepteur cardiaque médiatise cet effet sympathique ?', 'Bêta 1|β1', src('b00043', 'b00069'), 'La stimulation β1 accélère le nœud sinusal et soutient le débit cardiaque.', 'La fréquence augmente à 108/min.'),
      qroc('Les extrémités deviennent froides. Quel récepteur vasculaire explique cette réponse ?', 'Alpha 1|α1', src('b00043', 'b00069'), 'α1 contracte les artérioles cutanées et augmente les résistances.', 'Les extrémités deviennent froides.'),
      qroc('La pression reste basse malgré la tachycardie. Quel autre compartiment vasculaire doit se contracter pour soutenir le retour ?', 'Veines|Réseau veineux', src('b00069'), 'La venoconstriction augmente le retour veineux et le remplissage cardiaque.', 'La pression reste basse malgré la tachycardie.'),
      qroc('Une perfusion α1 relève la pression mais ralentit le cœur. Quel réflexe produit ce ralentissement ?', 'Baroréflexe|Réflexe barorécepteur', src('b00071', 'b00105'), 'La pression accrue stimule le vague par les afférences IX et X.', 'Une perfusion α1 relève la pression mais ralentit le cœur.'),
      qroc('Après stabilisation, quels trois organes doivent être prioritairement perfusés lors d’une hypotension prolongée ?', 'Cerveau, cœur et reins', src('b00069', 'b00070'), 'La redistribution sympathique préserve ces organes critiques.', 'Après stabilisation, l’équipe vérifie la redistribution du débit.'),
    ],
  },
  {
    label: 'DP QROC 2 · Fièvre, sudation et ventilation', allowed_voies: ['externe'],
    vignette: 'Un homme de 35 ans présente une fièvre élevée en salle de surveillance. Sa peau devient chaude et moite, sa fréquence cardiaque et sa ventilation augmentent. L’oxygénation reste correcte mais les besoins métaboliques s’élèvent ; l’équipe suit la redistribution cutanée du débit, la sudation, le rythme cardiaque puis la réponse ventilatoire à une acidose débutante.',
    questions: [
      qroc('Quel objectif homéostatique vise la vasodilatation cutanée ?', 'Dissipation de la chaleur|Perte de chaleur', src('b00063'), 'Le transfert de débit vers la peau favorise radiation et évaporation.'),
      qroc('La sueur devient abondante. Quel neurotransmetteur sympathique stimule les glandes sudoripares ?', 'Acétylcholine|ACh', src('b00029', 'b00063'), 'Cette voie constitue une exception cholinergique postganglionnaire sympathique.', 'La sueur devient abondante.'),
      qroc('La fréquence atteint 118/min. Quel médiateur sympathique accélère le cœur ?', 'Noradrénaline|NA', src('b00065'), 'La noradrénaline libérée par les fibres cardiaques stimule le rythme.', 'La fréquence atteint 118/min.'),
      qroc('La consommation d’oxygène augmente. Quel centre du SNC adapte la fréquence respiratoire ?', 'Centre respiratoire du tronc cérébral|Tronc cérébral', src('b00073'), 'La commande ventilatoire centrale répond aux besoins métaboliques.', 'La consommation d’oxygène augmente.'),
      qroc('Une acidose avec hausse de PCO2 apparaît. Quel type de capteurs détecte ces changements ?', 'Chémorécepteurs|Chémorécepteurs périphériques et centraux', src('b00073'), 'Ils détectent les ions H+ et le CO2 et stimulent la ventilation.', 'Une acidose avec hausse de PCO2 apparaît.'),
      qroc('Le bronchospasme disparaît sous stimulation adrénergique. Quel sous-type récepteur a relâché les bronches ?', 'Bêta 2|β2', src('b00043', 'b00073'), 'L’activation β2 détend le muscle lisse bronchique et augmente le calibre aérien.', 'Le bronchospasme disparaît sous stimulation adrénergique.'),
      qroc('La température redescend et le patient se repose. Quelle division ralentit alors le cœur ?', 'Parasympathique|Nerf vague', src('b00059', 'b00065'), 'Le retour au repos restaure la prédominance vagale cardiaque.', 'La température redescend et le patient se repose.'),
    ],
  },
  {
    label: 'DP QROC 3 · Bronchospasme et agonistes β', allowed_voies: ['externe'],
    vignette: 'Une patiente de 42 ans asthmatique développe un bronchospasme périopératoire. La pression est stable et l’auscultation retrouve des sibilants diffus. Elle respire spontanément, sans bradycardie ni signe de surcharge ; l’équipe choisit une cible bronchique sélective, surveille les effets musculaires et digestifs des fortes doses puis discute un relais plus prolongé.',
    questions: [
      qroc('Quel sous-type adrénergique doit être stimulé pour relâcher le muscle bronchique ?', 'Bêta 2|β2', src('b00043'), 'La relaxation β2 augmente le calibre bronchique.'),
      qroc('Un traitement inhalé est choisi. Quel agoniste préférentiel correspond à cette indication ?', 'Salbutamol', src('b00116', 'b00117'), 'Le salbutamol stimule préférentiellement β2 et peut être inhalé.', 'Un traitement inhalé est choisi.'),
      qroc('À forte dose, un tremblement apparaît. Quel effet indésirable du traitement est observé ?', 'Tremblement musculaire|Tremblements', src('b00117', 'b00118'), 'La stimulation β2 du muscle squelettique peut provoquer ce symptôme.', 'À forte dose, un tremblement apparaît.'),
      qroc('Le transit ralentit durant le traitement. Quelle fonction digestive est diminuée ?', 'Péristaltisme|Motilité intestinale', src('b00117', 'b00118'), 'Les fortes doses de salbutamol peuvent ralentir le péristaltisme.', 'Le transit ralentit durant le traitement.'),
      qroc('Une molécule β2 plus prolongée est envisagée. Citez un exemple décrit.', 'Salmétérol|Formotérol|Terbutaline', src('b00119'), 'Salmétérol et formotérol font partie des agonistes de longue durée.', 'Une molécule β2 plus prolongée est envisagée.'),
      qroc('La fréquence accélère pendant la prise en charge. Quel récepteur cardiaque explique un effet chronotrope adrénergique ?', 'Bêta 1|β1', src('b00043'), 'Le récepteur β1 augmente la fréquence du nœud sinusal et accélère la conduction.', 'La fréquence accélère pendant la prise en charge.'),
      qroc('Le bronchospasme est contrôlé. Quelle division autonome favoriserait au contraire une bronchoconstriction au repos ?', 'Parasympathique|Système parasympathique', src('b00073'), 'Les fibres cholinergiques parasympathiques contractent les bronches.', 'Le bronchospasme est contrôlé et la physiologie de repos est discutée.'),
    ],
  },
  {
    label: 'DP QROC 4 · Insuffisance cardiaque aiguë', allowed_voies: ['externe'],
    vignette: 'Un homme de 69 ans présente un bas débit avec pression limite et pression artérielle pulmonaire élevée après une chirurgie cardiaque. La volémie est optimisée. Le rythme est sinusal et l’échocardiographie suggère un défaut de contraction ; la stratégie compare un agoniste β1 à un inhibiteur de phosphodiestérase, tout en surveillant les effets de vasodilatation sur les charges ventriculaires.',
    questions: [
      qroc('Quel agoniste β1 est classiquement indiqué pour augmenter le débit dans ce contexte ?', 'Dobutamine', src('b00107'), 'La dobutamine renforce contractilité et fréquence dans le choc cardiogénique.'),
      qroc('Le débit augmente sous traitement. Quel effet cardiaque principal a été recherché ?', 'Inotropisme positif|Augmentation de la contractilité', src('b00043', 'b00107'), 'Le ventricule éjecte davantage grâce à une contraction plus forte.', 'Le débit augmente sous traitement.'),
      qroc('La pression diminue malgré le meilleur débit. Quel effet β2 de la dobutamine peut l’expliquer ?', 'Vasodilatation|Diminution des résistances', src('b00068', 'b00107'), 'Une faible activité β2 relâche certains territoires vasculaires.', 'La pression diminue malgré le meilleur débit.'),
      qroc('Une phosphodiestérase est ensuite inhibée. Quel second messager s’accumule ?', 'AMPc', src('b00120', 'b00121'), 'L’enzyme bloquée ne dégrade plus l’AMPc, qui s’accumule dans la cellule.', 'Une phosphodiestérase est ensuite inhibée.'),
      qroc('La pression pulmonaire baisse sous cet inodilatateur. Quel médicament a probablement été ajouté ?', 'Milrinone', src('b00125'), 'La milrinone relâche particulièrement le muscle lisse vasculaire pulmonaire.', 'La pression pulmonaire baisse sous cet inodilatateur.'),
      qroc('La précharge et la postcharge diminuent. Quel mécanisme vasculaire commun produit ces effets ?', 'Vasodilatation|Relaxation du muscle lisse vasculaire', src('b00043', 'b00125'), 'La dilatation veineuse et artérielle facilite le remplissage et l’éjection.', 'La précharge et la postcharge diminuent.'),
      qroc('La stabilisation obtenue, quelle durée d’emploi n’est pas justifiée par le rapport bénéfice-risque ?', 'Emploi prolongé|Traitement prolongé', src('b00125'), 'L’utilisation durable n’est pas recommandée dans l’insuffisance cardiaque sévère.', 'La stabilisation obtenue, l’équipe réévalue la durée de traitement.'),
    ],
  },
  {
    label: 'DP QROC 5 · Hypertension aiguë peropératoire', allowed_voies: ['externe'],
    vignette: 'Une femme de 58 ans développe un épisode hypertensif aigu pendant une intervention. La fréquence est à 112/min et une réduction rapidement réversible du travail cardiaque est souhaitée. L’oxygénation et la volémie sont stables ; l’équipe privilégie une molécule intraveineuse titrable, puis compare son profil cardiosélectif à celui d’un antagoniste α-β si le contrôle vasculaire devient nécessaire.',
    questions: [
      qroc('Quel bêtabloquant intraveineux à très courte durée convient à cet objectif ?', 'Esmolol', src('b00129', 'b00130'), 'Sa cinétique brève permet une titration rapide lors d’un épisode hypertensif aigu.'),
      qroc('Le médicament est administré. Quel sous-type récepteur cardiaque est antagonisé ?', 'Bêta 1|β1', src('b00043', 'b00130'), 'L’esmolol est un antagoniste cardiosélectif β1.', 'Le médicament est administré.'),
      qroc('L’effet atteint son maximum. Quel délai approximatif s’est écoulé ?', '6 à 10 minutes|Entre 6 et 10 minutes', src('b00129', 'b00130', 'b00043'), 'Le pic d’action survient dans cette fenêtre et permet un ajustement rapide.', 'L’effet atteint son maximum.'),
      qroc('Vingt minutes après l’arrêt, l’effet a presque disparu. Quelle voie métabolique explique cette brièveté ?', 'Estérases des globules rouges|Hydrolyse par les estérases érythrocytaires', src('b00130'), 'Le métabolisme érythrocytaire est très rapide.', 'Vingt minutes après l’arrêt, l’effet a presque disparu.'),
      qroc('Une option bloquant aussi α est discutée. Quel médicament correspond ?', 'Labétalol', src('b00131', 'b00132'), 'Le labétalol antagonise à la fois les récepteurs α et β.', 'Une option bloquant aussi α est discutée.'),
      qroc('Quel rapport approximatif décrit l’activité β sur α du labétalol IV ?', '7 pour 1|7:1', src('b00132'), 'L’activité bêtabloquante domine par voie intraveineuse.', 'Le profil du labétalol IV est quantifié.'),
      qroc('Après contrôle tensionnel, quelle phase du cycle cardiaque s’allonge sous bêtablocage et favorise la perfusion coronaire ?', 'Diastole|Temps diastolique', src('b00128'), 'Le ralentissement cardiaque prolonge le temps de perfusion coronaire.', 'Après contrôle tensionnel, la fréquence diminue sans bas débit.'),
    ],
  },
  {
    label: 'DP QROC 6 · Syndrome anticholinergique central', allowed_voies: ['externe'],
    vignette: 'Un homme de 81 ans devient confus, désorienté et halluciné en salle de réveil. Il présente aussi une bouche sèche, une mydriase, une tachycardie et une rétention urinaire. La température est élevée mais la peau reste sèche ; l’équipe rapproche les manifestations cérébrales et périphériques avant de choisir un antidote capable de franchir la barrière hémato-encéphalique.',
    questions: [
      qroc('Quel syndrome pharmacologique réunit ces signes centraux et périphériques ?', 'Syndrome anticholinergique|Syndrome antimuscarinique', src('b00147', 'b00148'), 'Le blocage muscarinique affecte cerveau, glandes, cœur, œil et vessie.'),
      qroc('La peau est sèche malgré la chaleur. Quelle sécrétion autonome est inhibée ?', 'Sudation|Sécrétion sudorale', src('b00063', 'b00148'), 'Le blocage cholinergique empêche l’activation des glandes sudoripares.', 'La peau est sèche malgré la chaleur.'),
      qroc('La tachycardie reste à 126/min malgré le repos. Quel sous-type muscarinique cardiaque est bloqué ?', 'M2', src('b00051', 'b00148'), 'La suppression du frein M2 accélère le nœud sinusal.', 'La tachycardie reste à 126/min malgré le repos.'),
      qroc('Un antidote central est envisagé. Quelle anticholinestérase traverse le cerveau ?', 'Physostigmine', src('b00146'), 'Cette amine tertiaire franchit la barrière hémato-encéphalique.', 'Un antidote central est envisagé.'),
      qroc('Pourquoi la néostigmine ne corrigerait-elle pas les hallucinations ?', 'Elle ne franchit pas la barrière hémato-encéphalique|Elle ne pénètre pas le cerveau', src('b00140'), 'Son action reste périphérique car elle ne pénètre pas dans le système nerveux central.', 'La néostigmine est écartée pour traiter les hallucinations.'),
      qroc('La confusion s’améliore après traitement. Quelle enzyme a été inhibée pour augmenter l’acétylcholine ?', 'Acétylcholinestérase', src('b00040', 'b00146'), 'L’inhibition réduit l’hydrolyse du neurotransmetteur central.', 'La confusion s’améliore après traitement.'),
      qroc('Quel facteur lié au patient favorise les manifestations centrales des antimuscariniques ?', 'Âge avancé|Sujet âgé', src('b00148'), 'Les personnes âgées présentent plus souvent confusion et désorientation.', 'Le dossier est relu après résolution des symptômes.'),
    ],
  },
  {
    label: 'DP QROC 7 · Myasthénie et anticholinestérases', allowed_voies: ['externe'],
    vignette: 'Une patiente de 29 ans est explorée pour faiblesse fatigable compatible avec une myasthénie. Plusieurs anticholinestérases sont comparées selon la durée et la voie. Le besoin initial est un test bref, puis un traitement oral prolongé ; l’équipe anticipe en parallèle la bradycardie, l’hypersalivation et le myosis liés à la stimulation muscarinique excessive.',
    questions: [
      qroc('Quel mécanisme enzymatique commun augmente l’acétylcholine disponible ?', 'Inhibition de l’acétylcholinestérase', src('b00138'), 'La dégradation du neurotransmetteur est ralentie dans la fente.'),
      qroc('Un test très bref est recherché. Quel agent agit environ dix minutes ?', 'Édrophonium', src('b00144'), 'Son inhibition compétitive et réversible est rapide et courte.', 'Un test très bref est recherché.'),
      qroc('Un traitement oral prolongé est ensuite nécessaire. Quel agent est adapté ?', 'Pyridostigmine', src('b00142'), 'Elle peut être administrée oralement et agit plus longtemps.', 'Un traitement oral prolongé est ensuite nécessaire.'),
      qroc('Une néostigmine est utilisée dans une autre situation. Combien de temps dure environ son action ?', 'Environ 1 heure|Une heure', src('b00140'), 'Son inhibition réversible persiste bien au-delà de l’édrophonium.', 'Une néostigmine est utilisée dans une autre situation.'),
      qroc('Une bradycardie apparaît avec hypersalivation. Quel type de récepteur est suractivé ?', 'Récepteur muscarinique|Récepteurs muscariniques', src('b00138'), 'L’excès d’acétylcholine stimule les organes parasympathiques.', 'Une bradycardie apparaît avec hypersalivation.'),
      qroc('Quel antagoniste quaternaire peut être associé pour réduire ces effets ?', 'Glycopyrrolate', src('b00140', 'b00157'), 'Il contrôle salivation et bradycardie avec peu d’effet central.', 'Un antagoniste périphérique est ajouté.'),
      qroc('Quel signe pupillaire accompagne habituellement l’excès muscarinique ?', 'Myosis', src('b00138'), 'La stimulation du sphincter irien contracte la pupille.', 'Après l’association, l’équipe rappelle les signes d’excès cholinergique.'),
    ],
  },
  {
    label: 'DP QROC 8 · Manœuvre de Valsalva', allowed_voies: ['externe'],
    vignette: 'Un homme de 50 ans réalise une expiration forcée à glotte fermée pendant une exploration hémodynamique. La pression et la fréquence sont suivies en continu. Il est en rythme sinusal, sans traitement vasoactif ; l’équipe décrit séparément la phase de contrainte, la diminution du retour veineux, la compensation sympathique puis le rebond pressif à l’ouverture de la glotte.',
    questions: [
      qroc('Quel changement de pression survient d’abord dans le thorax ?', 'Augmentation de la pression intrathoracique', src('b00084'), 'La glotte fermée transforme l’effort expiratoire en pression interne.'),
      qroc('Pendant la contrainte, quel retour vers le cœur diminue ?', 'Retour veineux|Retour veineux cardiaque', src('b00067', 'b00084'), 'La pression thoracique élevée comprime les veines.', 'Pendant la contrainte, le volume éjecté commence à baisser.'),
      qroc('Le débit et la pression diminuent. Quelle branche autonome est alors stimulée ?', 'Sympathique|Système sympathique', src('b00069', 'b00084'), 'La décharge baroréceptrice réduite active la réponse pressive.', 'Le débit et la pression diminuent.'),
      qroc('La fréquence augmente au-dessus de 100/min. Quel effet cardiaque accompagne le chronotropisme positif ?', 'Augmentation de la contractilité|Inotropisme positif', src('b00043', 'b00084'), 'La réponse sympathique renforce simultanément fréquence et contraction.', 'La fréquence augmente au-dessus de 100/min.'),
      qroc('La glotte s’ouvre et le retour veineux rebondit. Quel paramètre artériel augmente ensuite ?', 'Pression artérielle', src('b00071', 'b00084'), 'La contraction et le remplissage accrus créent un dépassement pressif.', 'La glotte s’ouvre et le retour veineux rebondit.'),
      qroc('Le rebond tensionnel stimule un arc de régulation. Nommez-le.', 'Baroréflexe|Réflexe barorécepteur', src('b00068', 'b00071', 'b00084'), 'La hausse de pression réactive les capteurs carotidiens et aortiques.', 'Le rebond tensionnel stimule un arc de régulation.'),
      qroc('Quelle division ramène finalement fréquence et pression vers le repos ?', 'Parasympathique|Système parasympathique|Vague', src('b00059', 'b00084'), 'Le tonus vagal augmente après le rebond pressif.', 'La fréquence ralentit et les valeurs se normalisent.'),
    ],
  },
];

const series = [...QCM_SERIES, ...DP_QCM_SERIES, ...MORE_DP_QCM_SERIES, ...QROC_SERIES, ...DP_QROC_SERIES];

export function buildChapter13() {
  return { fiche: buildFiche(), flashcards, series };
}

export default buildChapter13;
