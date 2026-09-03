const row = (concept, bullets, sourceBlocks, image = null) => ({
  concept,
  bullets,
  sourceBlocks,
  ...(image ? { image } : {}),
});

const sourceImage = (path, caption, sourceCaption) => ({
  path,
  position: 'after',
  size: 'large',
  layout: 'full_width',
  containsText: true,
  caption,
  sourceCaption,
});

const images = {
  examens: sourceImage('img/img_001.png', 'Examens préinterventionnels guidés par le terrain et la chirurgie', 'TABLEAU 2.1 Recommandation formalisée sur les examens complémentaires systématiques préinterventionnels'),
  mets: sourceImage('img/img_002.png', 'Équivalents métaboliques et retentissement fonctionnel cardiovasculaire', 'TABLEAU 2.3 Score de Lee: corrélation avec le risque de complications cardiovasculaires majeures'),
  lee: sourceImage('img/img_003.png', 'Facteurs du score de risque cardiaque de Lee', 'TABLEAU 2.3 Score de Lee: corrélation avec le risque de complications cardiovasculaires majeures'),
  respiratoire: sourceImage('img/img_004.png', 'Principaux facteurs de complications respiratoires postopératoires', "TABLEAU 2.4 Critères d'évaluation des risques respiratoires"),
  stopBang: sourceImage('img/img_005.png', 'Questionnaire clinique STOP-BANG', 'TABLEAU 2.5 Questionnaire STOP-BANG (réponses binaires oui ou non)'),
  information: sourceImage('img/img_006.png', 'Facteurs modifiant la mémorisation du risque annoncé', 'TABLEAU 2.6 Caractéristiques influençant la perception du risque'),
  asa: sourceImage('img/img_007.png', 'Classification ASA associée au niveau de risque chirurgical', 'TABLEAU 2.7 Description combinée et exemples de classification du risque ASA et du risque chirurgical'),
  risqueChirurgical: sourceImage('img/img_008.png', 'Variables cliniques d’un score de risque chirurgical', 'TABLEAU 2.8 Items du score de risque chirurgical tel qu’il est mis au point pour la chirurgie colique, estimation précise des risques chirurgicaux'),
  traitements: sourceImage('img/img_009.png', 'Conduite périopératoire des principaux traitements cardiovasculaires', 'TABLEAU 2.5 Prise en charge des traitements cardiovasculaires par les patients'),
};

// Une sous-puce n'est utilisée que lorsque sa proposition dépend réellement de
// la puce qui la précède : précision, conséquence, limite ou modalité pratique.
// Les nombres désignent les puces originales de la ligne. Une entrée numérique
// reste au N+1 ; une entrée { parent, children } crée une relation N+1 -> N+2.
const PEDAGOGICAL_HIERARCHY = {
  'Supports adaptés': [{ parent: 0, children: [1] }],
  'Dossier d’anesthésie': [{ parent: 0, children: [1] }],
  'Cœur de l’évaluation': [{ parent: 0, children: [1] }],
  'Pas de bilan automatique': [{ parent: 0, children: [1] }],
  'Risque hémorragique': [0, { parent: 1, children: [2] }],
  'Autonomie': [{ parent: 0, children: [1] }],
  'Fausse parenté iodée': [{ parent: 0, children: [1] }],
  'Sevrages': [0, { parent: 1, children: [2] }],
  'Biomarqueurs': [{ parent: 0, children: [1] }],
  'Échocardiographie': [{ parent: 0, children: [1] }],
  'Prédiction clinique': [{ parent: 0, children: [1] }],
  'Dépistage du SAOS': [{ parent: 0, children: [1] }],
  'Antécédent prioritaire': [{ parent: 0, children: [1] }],
  'Ventilation difficile': [{ parent: 0, children: [1] }],
  'Mémorisation': [{ parent: 0, children: [1] }],
  'Contenu utile': [{ parent: 0, children: [1] }],
  'Risque de l’intervention': [{ parent: 0, children: [1] }],
  'Avis spécialisé ciblé': [{ parent: 0, children: [1] }],
  'Traçabilité': [{ parent: 0, children: [1] }],
  'Balance arrêt–maintien': [{ parent: 0, children: [1] }],
  'Contexte': [{ parent: 0, children: [1] }],
  'Dérivés nitrés': [{ parent: 0, children: [1] }],
  'Antithrombotiques': [{ parent: 0, children: [1] }],
  'Antiparkinsoniens': [{ parent: 0, children: [1] }],
  'Phytothérapie': [{ parent: 0, children: [1] }, 2],
  'Anémie préopératoire': [{ parent: 0, children: [1] }],
  'Continuité': [{ parent: 0, children: [1] }],
  'Consultation infirmière': [{ parent: 0, children: [1] }],
  'Consultation délocalisée': [{ parent: 0, children: [1] }],
  'Télémédecine': [{ parent: 0, children: [1] }],
  'Anticipation': [{ parent: 0, children: [1] }],
  'Actes répétés': [{ parent: 0, children: [1] }],
};

const CLOSING_CHECKLIST_N2 = {
  Terrain: {
    text: 'Vérifications centrées sur le patient',
    children: ['Comorbidités et allergies', 'Autonomie, nutrition et consommations', 'Réserve fonctionnelle et voies aériennes'],
  },
  Intervention: {
    text: 'Vérifications centrées sur l’acte',
    children: ['Nature et urgence relative', 'Retentissement et risque hémorragique', 'Besoins de surveillance'],
  },
  Plan: {
    text: 'Décisions du plan formalisées',
    children: ['Examens et avis justifiés', 'Traitements et optimisation planifiés', 'Transfusion et surveillance anticipées'],
  },
  Partage: {
    text: 'Continuité de l’information',
    children: ['Patient informé et consentant', 'Opérateur averti', 'Dossier complet disponible pour l’équipe anesthésique'],
  },
};

function applyPedagogicalHierarchy(parts) {
  for (const item of parts.flatMap((part) => part.sections.flatMap((section) => section.rows))) {
    if (CLOSING_CHECKLIST_N2[item.concept]) {
      item.bullets = [CLOSING_CHECKLIST_N2[item.concept]];
      continue;
    }
    const scheme = PEDAGOGICAL_HIERARCHY[item.concept];
    if (!scheme) continue;
    const original = [...item.bullets];
    const referenced = scheme.flatMap((entry) => typeof entry === 'number'
      ? [entry]
      : [entry.parent, ...entry.children]);
    const expected = original.map((_, index) => index);
    if (new Set(referenced).size !== referenced.length
      || [...referenced].sort((a, b) => a - b).join(',') !== expected.join(',')) {
      throw new Error(`Hiérarchie incomplète ou ambiguë pour « ${item.concept} »`);
    }
    item.bullets = scheme.map((entry) => typeof entry === 'number'
      ? original[entry]
      : { text: original[entry.parent], children: entry.children.map((index) => original[index]) });
  }
}

export function authoredChapter02Model() {
  images.risqueChirurgical.cropBottomMm = 13;
  const parts = [
    {
      title: 'Finalités et socle de l’évaluation',
      sections: [
        {
          title: 'Une consultation qui modifie le parcours de soins',
          rows: [
            row('Finalité clinique', [
              'Évaluer le **rapport bénéfices/risques** de la procédure et construire une stratégie anesthésique adaptée au patient.',
              'Repérer les risques modifiables assez tôt pour engager une optimisation avant l’intervention.',
            ], ['b00003', 'b00134']),
            row('Bénéfices attendus', [
              'Réduire la morbidité et la mortalité chez les patients à risque.',
              'Limiter les examens inutiles, les retards, les annulations et la durée d’hospitalisation.',
              'Associer le patient à une décision éclairée.',
            ], ['b00003', 'b00004', 'b00005', 'b00006', 'b00007', 'b00008']),
            row('Tous les profils', [
              'Le bénéfice ne se limite pas aux comorbidités sévères : il concerne aussi les patients **ASA I–II**, notamment en ambulatoire.',
              'Une évaluation absente ou inefficace est rapportée dans **11,6 %** des accidents peropératoires et jusqu’à **40 %** des décès.',
            ], ['b00009']),
            row('Décision partagée', [
              'L’anesthésiste-réanimateur relie les enjeux du terrain, de la chirurgie et de l’organisation.',
              'La stratégie finale est expliquée au patient et communiquée à l’opérateur.',
            ], ['b00133', 'b00134', 'b00138']),
          ],
        },
        {
          title: 'Support, dossier et circulation de l’information',
          rows: [
            row('Préquestionnaire', [
              'Un questionnaire préparatoire concentre l’entretien sur les points utiles et réserve du temps à l’échange avec le patient.',
              'Un entretien informatique semi-dirigé peut structurer les données et sélectionner les patients nécessitant un avis médical.',
            ], ['b00013']),
            row('Supports adaptés', [
              'Les documents écrits complètent l’information orale sans la remplacer.',
              'Ils doivent rester compréhensibles malgré les obstacles de langue, de cognition ou de littératie en santé.',
            ], ['b00014', 'b00074']),
            row('Dossier d’anesthésie', [
              'Il appartient au dossier médical et doit être conçu pour fiabiliser le recueil des données.',
              'Il rassemble l’évaluation, les explorations, les décisions thérapeutiques et l’information donnée.',
            ], ['b00015', 'b00138']),
            row('Disponibilité', [
              'Le dossier est communiqué à l’opérateur et doit être accessible au moment de l’anesthésie.',
              'Un défaut d’évaluation ou de transmission favorise les complications majeures périopératoires.',
            ], ['b00015', 'b00138']),
          ],
        },
        {
          title: 'Interrogatoire, examen clinique et prescriptions ciblées',
          rows: [
            row('Antécédents utiles', [
              'Recueillir les antécédents médicaux et chirurgicaux, les anesthésies antérieures et leurs éventuelles complications.',
              'La tolérance et le vécu des anesthésies précédentes orientent l’information et le choix technique.',
            ], ['b00017']),
            row('Cœur de l’évaluation', [
              'L’interrogatoire et l’examen clinique apprécient le terrain, la réserve fonctionnelle et les risques spécifiques.',
              'Les scores complètent cette appréciation ; ils ne remplacent pas le raisonnement clinique.',
            ], ['b00136', 'b00083', 'b00085']),
            row('Pas de bilan automatique', [
              'Un examen complémentaire n’est prescrit que s’il répond à une question issue du terrain ou de la chirurgie.',
              'Les tests systématiques ne dépistent pas utilement une maladie inconnue et ne constituent pas une protection médicolégale.',
            ], ['b00018'], images.examens),
            row('Risque hémorragique', [
              'Rechercher une diathèse hémorragique par l’histoire personnelle, familiale et l’examen physique.',
              'Un questionnaire standardisé tel que **HEMSTOP** objective l’anamnèse avant de demander des tests d’hémostase.',
              'Un score HEMSTOP = 2 identifie un haut risque avec une sensibilité de 89,5 % et une spécificité de 98,6 %.',
            ], ['b00018', 'b00019', 'b00020', 'b00021', 'b00028', 'b00029', 'b00030', 'b00031', 'b00032', 'b00033']),
          ],
        },
      ],
    },
    {
      title: 'Terrain, réserves et risques spécifiques',
      sections: [
        {
          title: 'Fragilité, grand âge et nutrition',
          rows: [
            row('Autonomie', [
              'Apprécier les activités de la vie quotidienne, la mobilité et les capacités physiques.',
              'Une canne ou un déambulateur peut révéler une fragilité et une hausse du risque opératoire.',
            ], ['b00036']),
            row('Fonctions cognitives', [
              'Évaluer simplement l’état neuropsychique et anticiper une aggravation cognitive postopératoire le plus souvent transitoire.',
              'Le risque d’altération des fonctions supérieures pendant moins de 90 jours est expliqué au patient et à l’entourage.',
            ], ['b00036', 'b00037']),
            row('Polymédication', [
              'Plus de 60 % des patients âgés prennent au moins cinq médicaments.',
              'Rechercher aussi les traitements non conventionnels, dont l’usage augmente avec l’âge.',
            ], ['b00037']),
            row('Dénutrition', [
              'Critères cités : **IMC < 18,5 kg/m²**, ou **< 21 kg/m² après 70 ans**, ou perte de poids de **10 %**.',
              'Un support nutritionnel préopératoire peut être indiqué, notamment avant une chirurgie oncologique.',
            ], ['b00039']),
          ],
        },
        {
          title: 'Allergies, tabac et alcool',
          rows: [
            row('Allergie documentée', [
              'Préciser l’agent, la chronologie, les manifestations et les explorations réalisées.',
              'Une étiquette allergique erronée peut conduire à une antibioprophylaxie moins efficace.',
            ], ['b00041']),
            row('Agents périopératoires', [
              'Les antibiotiques, les curares et la chlorhexidine sont impliqués dans les réactions périopératoires.',
              'L’interrogatoire seul identifie difficilement l’allergène : tracer les incertitudes et demander une exploration si nécessaire.',
            ], ['b00041']),
            row('Fausse parenté iodée', [
              'Allergie aux fruits de mer, réaction à un produit de contraste iodé et allergie à la polyvidone iodée sont trois entités distinctes.',
              'La présence de l’une ne prédit pas les deux autres.',
            ], ['b00042', 'b00043']),
            row('Sevrages', [
              'Quantifier les consommations de tabac et d’alcool dès l’interrogatoire.',
              'Selon l’exposition, proposer sevrage, substitution ou prévention d’un syndrome de sevrage à distance de l’acte.',
              'Le sevrage préopératoire diminue notamment certaines complications infectieuses et thrombotiques.',
            ], ['b00044', 'b00045']),
          ],
        },
        {
          title: 'Évaluation cardiovasculaire',
          rows: [
            row('Capacité fonctionnelle', [
              'Rechercher les symptômes cardiovasculaires et estimer la tolérance à l’effort en **METS**.',
              'La réserve fonctionnelle participe au choix des explorations et à la stratification du risque.',
            ], ['b00048'], images.mets),
            row('Score de Lee', [
              'Le risque de complications cardiovasculaires augmente avec le nombre de facteurs présents.',
              'Le score est utile quel que soit l’âge mais doit être interprété avec le contexte chirurgical et la réserve fonctionnelle.',
            ], ['b00048'], images.lee),
            row('Biomarqueurs', [
              'Le **BNP**, ou de préférence le **NT-proBNP**, et la mesure de consommation maximale d’oxygène peuvent améliorer la prédiction.',
              'Ils complètent une stratification clinique ; ils ne justifient pas un dépistage indifférencié.',
            ], ['b00049', 'b00055']),
            row('Explorations de stress', [
              'Réserver échocardiographie de stress ou scintigraphie aux chirurgies de risque intermédiaire ou élevé avec score de Lee = 2 et mauvaise réserve fonctionnelle.',
              'L’ECG d’effort a une bonne valeur prédictive négative mais devient inadapté si le patient ne peut atteindre 85 % de la fréquence maximale théorique.',
            ], ['b00055']),
            row('Échocardiographie', [
              'Indiquée devant insuffisance cardiaque ou valvulopathie connue mal suivie, ou découverte lors de l’examen.',
              'Toute valvulopathie symptomatique ou suspectée impose d’en apprécier la sévérité et l’éventuelle optimisation préopératoire.',
            ], ['b00055']),
            row('Avis cardiologique', [
              'Formuler une question précise : indication opératoire, tolérance à l’effort, traitements et raison du test demandé.',
              'L’avis doit pouvoir modifier la prise en charge : optimisation, exploration supplémentaire ou revascularisation éventuelle.',
            ], ['b00056', 'b00057', 'b00058']),
          ],
        },
        {
          title: 'Risque respiratoire et sommeil',
          rows: [
            row('Prédiction clinique', [
              'L’interrogatoire et l’examen clinique prédisent mieux les complications respiratoires que des EFR systématiques.',
              'Identifier tabagisme, type et durée de chirurgie, état général, insuffisances d’organe et anomalies respiratoires.',
            ], ['b00060'], images.respiratoire),
            row('BPCO sévère', [
              'Évoquée devant handicap quotidien important, hospitalisation récente pour exacerbation ou **VEMS < 75 %** de la valeur théorique.',
              'Avant l’acte : rechercher stabilité, absence d’infection et sevrage tabagique.',
            ], ['b00060']),
            row('Optimisation', [
              'Selon le tableau clinique : antibiothérapie, courte corticothérapie, kinésithérapie respiratoire ou préhabilitation.',
              'Une altération importante de la fonction respiratoire ne contre-indique pas à elle seule l’anesthésie : la décision repose sur le bénéfice/risque.',
            ], ['b00060', 'b00064']),
            row('Dépistage du SAOS', [
              'Utiliser un score clinique tel que **STOP-BANG**.',
              'Au moins trois critères positifs donnent une sensibilité de 93 % pour un index apnées-hypopnées > 15.',
            ], ['b00065', 'b00068'], images.stopBang),
            row('Conséquences du SAOS', [
              'Anticiper contrôle plus difficile des voies aériennes et surveillance postopératoire prolongée.',
              'Prévoir si besoin ventilation non invasive et limiter opioïdes et benzodiazépines postopératoires.',
            ], ['b00065']),
          ],
        },
        {
          title: 'Voies aériennes et ventilation au masque',
          rows: [
            row('Antécédent prioritaire', [
              'Rechercher d’abord tout antécédent documenté d’intubation ou de contrôle des voies aériennes difficile.',
              'Récupérer si possible le compte rendu anesthésique antérieur.',
            ], ['b00071']),
            row('Examen', [
              'Évaluer Mallampati, distance thyromentonnière, ouverture buccale et état dentaire.',
              'Tracer la fragilité dentaire avant l’intubation.',
            ], ['b00071']),
            row('Ventilation difficile', [
              'Facteurs cités : âge > 55 ans, IMC > 26 kg/m², édentation, ronflement et barbe.',
              'Leur association doit conduire à préparer une stratégie de ventilation et de secours.',
            ], ['b00071']),
          ],
        },
      ],
    },
    {
      title: 'Information, consentement et stratification du risque',
      sections: [
        {
          title: 'Une information claire, loyale et personnalisée',
          rows: [
            row('Primauté de l’oral', [
              'L’échange oral permet d’adapter le contenu au contexte, aux attentes et aux capacités de compréhension.',
              'Une information de qualité améliore satisfaction, confiance et compréhension de la stratégie.',
            ], ['b00073', 'b00074']),
            row('Mémorisation', [
              'Le contexte émotionnel réduit l’assimilation ; renforcer l’oral par un écrit, un média interactif ou un accompagnant.',
              'Employer des mots usuels et vérifier la compréhension sans condescendance.',
            ], ['b00074', 'b00075', 'b00079'], images.information),
            row('Contenu utile', [
              'Expliquer la technique envisagée, les risques pertinents, les alternatives et les conséquences d’un refus.',
              'Adapter le niveau de détail à ce que le patient souhaite connaître.',
            ], ['b00073', 'b00075', 'b00079', 'b00139']),
            row('Consentement', [
              'Le consentement s’inscrit dans un projet thérapeutique partagé entre patient, anesthésiste, opérateur et équipe soignante.',
              'Tracer l’information délivrée et les décisions retenues.',
            ], ['b00134', 'b00139']),
          ],
        },
        {
          title: 'Classe ASA et risque chirurgical',
          rows: [
            row('Classe ASA', [
              'Décrit la gravité de l’état systémique et corrèle avec morbidité, mortalité, recours aux soins critiques et durée d’hospitalisation.',
              'Elle reste subjective et ne décrit ni la difficulté des voies aériennes ni les caractéristiques de l’intervention.',
            ], ['b00081', 'b00082', 'b00083'], images.asa),
            row('Risque de l’intervention', [
              'Associer au terrain le retentissement physiologique et le niveau de risque propre à la chirurgie.',
              'Des exemples partagés au sein de l’équipe homogénéisent le classement et la planification.',
            ], ['b00084']),
            row('Scores combinés', [
              'Les scores standardisent le langage et peuvent améliorer la prédiction.',
              'Leur valeur dépend de la population, de la chirurgie, des moyens locaux et des pathologies rares non intégrées.',
            ], ['b00084', 'b00085', 'b00088'], images.risqueChirurgical),
            row('Limites', [
              'Un risque moyen de population ne se transpose pas automatiquement à un individu.',
              'Privilégier les événements qui modifient réellement la stratégie : réintubation, événement cardiovasculaire ou neurologique, infection sévère.',
            ], ['b00085', 'b00088']),
          ],
        },
        {
          title: 'Transformer le risque en plan de soins',
          rows: [
            row('Risque modifiable', [
              'Distinguer ce qui peut être optimisé avant l’acte : infection, dénutrition, sevrage, anémie, insuffisance d’organe déséquilibrée.',
              'Le délai préopératoire doit être utilisé pour mettre en œuvre cette optimisation.',
            ], ['b00039', 'b00045', 'b00058', 'b00060', 'b00112', 'b00127']),
            row('Risque non modifiable', [
              'Intégrer âge, pathologies chroniques et nature de l’intervention au niveau de surveillance et au choix du parcours.',
              'Ne pas confondre risque élevé et contre-indication automatique.',
            ], ['b00036', 'b00064', 'b00084']),
            row('Avis spécialisé ciblé', [
              'Demander un avis lorsqu’une réponse peut modifier l’équilibre d’une pathologie ou la stratégie périopératoire.',
              'Transmettre une question clinique précise plutôt qu’une demande générale de “feu vert”.',
            ], ['b00056', 'b00057', 'b00058']),
            row('Traçabilité', [
              'Documenter les risques identifiés, les examens demandés, les décisions de maintien ou d’arrêt thérapeutique et la surveillance prévue.',
              'Partager ces éléments avec l’opérateur et l’équipe qui réalisera l’anesthésie.',
            ], ['b00114', 'b00138']),
          ],
        },
      ],
    },
    {
      title: 'Optimisation thérapeutique et épargne sanguine',
      sections: [
        {
          title: 'Principes de gestion des traitements chroniques',
          rows: [
            row('Balance arrêt–maintien', [
              'Comparer interaction anesthésique et risque de saignement au risque de rebond ou de décompensation lié à l’arrêt.',
              'Prévoir également la reprise postopératoire.',
            ], ['b00091']),
            row('Contexte', [
              'Les conduites résumées concernent un patient stable et une chirurgie de risque faible ou modéré.',
              'Hors de ce cadre, individualiser avec l’avis du spécialiste concerné.',
            ], ['b00093']),
            row('Prescription explicite', [
              'Pour chaque médicament : écrire la dernière prise, le maintien ou l’arrêt, un éventuel relais et la date de reprise.',
              'Vérifier l’ordonnance réelle, y compris automédication et phytothérapie.',
            ], ['b00091', 'b00109', 'b00120', 'b00121']),
          ],
        },
        {
          title: 'Traitements cardiovasculaires',
          rows: [
            row('Bêtabloquants', [
              'Ne pas interrompre un traitement chronique.',
              'Si une introduction est indiquée, la débuter au moins un mois avant la chirurgie.',
            ], ['b00096'], images.traitements),
            row('IEC et ARA II', [
              'Contrôler la fonction rénale.',
              'Le maintien expose à une hypotension sévère, y compris lors d’une rachianesthésie ; adapter à l’indication clinique.',
            ], ['b00097', 'b00098']),
            row('Statines', [
              'Les maintenir avant l’intervention et les reprendre précocement après.',
              'Une introduction peut être discutée avant chirurgie vasculaire chez un patient à risque cardiovasculaire.',
            ], ['b00099']),
            row('Inhibiteurs calciques', [
              'Poursuivre en cas d’angor.',
              'Dans les autres indications, la tolérance anesthésique et le risque de rebond plaident aussi contre un arrêt systématique.',
            ], ['b00100']),
            row('Diurétiques', [
              'Le maintien est surtout envisagé dans l’insuffisance cardiaque, avec contrôle de l’ionogramme.',
              'Éviter une reprise trop précoce si hypovolémie ou risque d’insuffisance rénale postopératoire.',
            ], ['b00101']),
            row('Dérivés nitrés', [
              'Leur poursuite le jour de l’acte peut avoir des conséquences hémodynamiques.',
              'La voie transdermique est influencée par le refroidissement ou le réchauffement peropératoire.',
            ], ['b00102']),
          ],
        },
        {
          title: 'Hémostase, neurologie et psychiatrie',
          rows: [
            row('Antithrombotiques', [
              'Le maintien augmente le risque hémorragique ; l’arrêt augmente le risque thrombotique.',
              'Décider poursuite, interruption ou relais selon des procédures locales consensuelles entre opérateurs et anesthésistes.',
            ], ['b00103', 'b00104', 'b00105']),
            row('IMAO anciens', [
              'Pour l’iproniazide, discuter avec le psychiatre une éventuelle substitution.',
              'La décision doit éviter un arrêt non préparé et tenir compte des interactions anesthésiques.',
            ], ['b00107']),
            row('Imipraminiques et ISRS', [
              'Interrompre si possible les imipraminiques chez le patient ayant une pathologie cardiovasculaire.',
              'Tracer le risque d’interaction des inhibiteurs sélectifs de la recapture de la sérotonine.',
            ], ['b00107']),
            row('Antiparkinsoniens', [
              'Ne jamais omettre les prises périopératoires.',
              'Administrer le soir, le matin de l’intervention et, si nécessaire, pendant l’acte par sonde gastrique.',
            ], ['b00107']),
          ],
        },
        {
          title: 'Phytothérapie, anticancéreux et transfusion',
          rows: [
            row('Phytothérapie', [
              'La phytothérapie concerne 20 % des patients et est souvent non déclarée.',
              'Valériane : effet sédatif ; ginkgo : inhibition plaquettaire et accidents hémorragiques rapportés.',
              'Interrompre toute phytothérapie **10 jours** avant l’intervention.',
            ], ['b00109']),
            row('Antiangiogéniques', [
              'Risques hémorragique, ischémique et de mauvaise cicatrisation des sutures vasculaires ou digestives.',
              'Arrêter le traitement **6 semaines** avant la chirurgie et différer sa reprise de plusieurs semaines.',
            ], ['b00110']),
            row('Anémie préopératoire', [
              'La corriger particulièrement avant chirurgie carcinologique.',
              'Fer injectable et nutrition constituent la base citée ; l’innocuité de l’érythropoïétine reste discutée.',
            ], ['b00112']),
            row('Stratégie transfusionnelle', [
              'Définir un seuil adapté aux réserves du patient et au type de chirurgie.',
              'Une stratégie trop restrictive peut augmenter les complications cardiaques en chirurgie non cardiaque.',
            ], ['b00112']),
            row('Information spécifique', [
              'Informer lorsque le risque transfusionnel est documenté et recueillir le consentement.',
              'Anticiper les situations de refus, notamment chez les Témoins de Jéhovah.',
            ], ['b00112']),
          ],
        },
      ],
    },
    {
      title: 'Organisation, temporalité et continuité',
      sections: [
        {
          title: 'Responsabilité et répartition des rôles',
          rows: [
            row('Responsable médical', [
              'L’évaluation est placée sous la responsabilité d’un anesthésiste-réanimateur.',
              'Il conduit le processus, suit les explorations et informe l’opérateur.',
            ], ['b00114']),
            row('Continuité', [
              'Lorsque c’est possible, le même anesthésiste réalise l’évaluation et l’acte ; cette continuité est appréciée des patients.',
              'À défaut, la qualité de la transmission devient déterminante.',
            ], ['b00116', 'b00138']),
            row('Consultation infirmière', [
              'Possible pour une chirurgie à faible retentissement chez un patient sans comorbidité associée.',
              'Le médecin valide a posteriori et revoit les patients hors critères.',
            ], ['b00117']),
            row('Allocation des ressources', [
              'Une filière paramédicale structurée peut réduire l’attente et libérer du temps médical pour les patients à risque.',
              'La sélection doit intégrer à la fois terrain et intervention.',
            ], ['b00117']),
          ],
        },
        {
          title: 'Lieu, dossier disponible et consultation à distance',
          rows: [
            row('Locaux dédiés', [
              'Ils favorisent une rotation plus rapide et des coûts plus faibles que l’évaluation au lit du malade.',
              'Accueil, environnement et attente participent aussi à la satisfaction.',
            ], ['b00119']),
            row('Informations préalables', [
              'Connaître l’intitulé exact de l’acte, ses particularités et les modalités d’hospitalisation.',
              'Accéder au dossier hospitalier et à l’ordonnance détaillée des traitements usuels.',
            ], ['b00119', 'b00120', 'b00121']),
            row('Consultation délocalisée', [
              'Possible avec accord des équipes et du patient, selon un cahier des charges défini par l’établissement opérateur.',
              'Informer du risque de report ou d’annulation et renforcer la visite préanesthésique.',
            ], ['b00122', 'b00123']),
            row('Télémédecine', [
              'Utile lorsque le déplacement est difficile, notamment en institution ou en détention.',
              'Exige son et vidéo, accès au dossier et aux traitements, ainsi que pression artérielle, pouls, SpO₂ et température.',
            ], ['b00124']),
          ],
        },
        {
          title: 'Calendrier et visite préanesthésique',
          rows: [
            row('Anticipation', [
              'Pour un acte programmé, la consultation a lieu **plusieurs jours avant** l’intervention.',
              'Ce délai est prévu par le droit français.',
            ], ['b00127', 'b00140']),
            row('Utiliser le délai', [
              'Organiser sevrage, nutrition, kinésithérapie, préhabilitation, examens complémentaires ou avis spécialisé.',
              'Une consultation trop tardive transforme des risques modifiables en report évitable.',
            ], ['b00127']),
            row('Actes répétés', [
              'Une évaluation unique peut couvrir plusieurs actes seulement s’ils ont un faible retentissement et si la prise en charge reste stable.',
              'La pratique doit être acceptée par les équipes et expliquée au patient.',
            ], ['b00125']),
            row('Visite préanesthésique', [
              'Elle actualise l’état clinique, vérifie les informations et adapte la stratégie aux techniques réellement utilisées.',
              'Elle est particulièrement importante après une consultation délocalisée ou à distance.',
            ], ['b00123']),
          ],
        },
        {
          title: 'Check-list de clôture de la consultation',
          rows: [
            row('Terrain', [
              'Comorbidités, autonomie, nutrition, allergies, consommations, réserve fonctionnelle et voies aériennes sont évaluées.',
            ], ['b00136']),
            row('Intervention', [
              'Nature, urgence relative, retentissement, risque hémorragique et besoins de surveillance sont intégrés.',
            ], ['b00134', 'b00084']),
            row('Plan', [
              'Examens et avis sont justifiés ; traitements, optimisation, transfusion et surveillance ont une conduite écrite.',
            ], ['b00137', 'b00091', 'b00112']),
            row('Partage', [
              'Patient informé et consentant ; opérateur averti ; dossier complet et disponible pour l’équipe anesthésique.',
            ], ['b00134', 'b00138', 'b00139']),
          ],
        },
      ],
    },
  ];

  applyPedagogicalHierarchy(parts);

  const sourceBlocks = [...new Set(parts.flatMap((part) => part.sections.flatMap((section) => section.rows.flatMap((item) => item.sourceBlocks))))];

  return {
    matiere: 'Anesthésie-Réanimation',
    title: 'L’évaluation préopératoire',
    year: '2026-2027',
    coverSubtitle: 'Raisonnement clinique, optimisation et organisation du parcours',
    sourceBlocks,
    parts,
    synthesis: {
      chiffres: {
        headers: ['Repère', 'Valeur à connaître'],
        rows: [
          ['Dénutrition', 'IMC < 18,5 kg/m² ; < 21 kg/m² après 70 ans ; perte de poids de 10 %'],
          ['Ventilation au masque difficile', 'Âge > 55 ans ; IMC > 26 kg/m² ; édentation ; ronflement ; barbe'],
          ['Dépistage du SAOS', 'STOP-BANG ≥ 3 : sensibilité 93 % pour un index apnées-hypopnées > 15'],
          ['Phytothérapie', 'Arrêt 10 jours avant l’intervention'],
          ['Antiangiogéniques', 'Arrêt 6 semaines avant la chirurgie'],
        ],
      },
      tables: [
        {
          title: 'Du risque identifié à l’action',
          headers: ['Constat', 'Conséquence pratique'],
          rows: [
            ['Mauvaise réserve fonctionnelle et chirurgie à risque', 'Stratification cardiaque ciblée et exploration seulement si elle modifie la prise en charge'],
            ['SAOS probable', 'Anticipation des voies aériennes, surveillance prolongée, VNI possible, limitation des sédatifs'],
            ['Dénutrition ou anémie', 'Optimisation préopératoire avant chirurgie à risque, notamment oncologique'],
            ['Traitement chronique', 'Balance arrêt–maintien, dernière prise et reprise postopératoire écrites'],
          ],
        },
        {
          title: 'Organisation d’une évaluation fiable',
          headers: ['Étape', 'Exigence'],
          rows: [
            ['Avant', 'Dossier, ordonnance, acte exact et questionnaire préparatoire disponibles'],
            ['Pendant', 'Interrogatoire et examen ciblés, information orale personnalisée, décision partagée'],
            ['Après', 'Explorations suivies, stratégie tracée, opérateur informé, dossier accessible le jour de l’acte'],
            ['À distance', 'Visite préanesthésique pour actualiser les données et confirmer la stratégie'],
          ],
        },
      ],
      keyPoints: [
        'L’interrogatoire et l’examen clinique priment sur les examens systématiques.',
        'La classe ASA doit être complétée par le risque chirurgical et la réserve fonctionnelle.',
        'Un avis spécialisé n’est utile que s’il répond à une question susceptible de modifier la prise en charge.',
        'Un risque élevé impose une stratégie adaptée ; il ne constitue pas à lui seul une contre-indication.',
        'Chaque traitement chronique reçoit une consigne explicite d’arrêt, de maintien et de reprise.',
        'L’information orale personnalisée est soutenue par des supports et une vérification de la compréhension.',
        'La consultation anticipée sert à corriger les risques modifiables et à éviter les reports tardifs.',
        'Le dossier complet suit le patient et doit être disponible lors de l’anesthésie.',
      ],
      eclair: [
        'Commencer par le triptyque **patient – intervention – organisation**.',
        'Rechercher les antécédents anesthésiques, la réserve fonctionnelle, la fragilité, la nutrition et les voies aériennes.',
        'Prescrire un examen uniquement si son résultat peut modifier la stratégie.',
        'Associer classe ASA, risque chirurgical et facteurs de risque spécifiques.',
        'Optimiser infection, tabagisme, alcool, nutrition, anémie et pathologies d’organe avant l’acte.',
        'Écrire la conduite de chaque médicament, y compris phytothérapie et traitements anticancéreux.',
        'Informer avec des mots compris du patient, rechercher son consentement et tracer l’échange.',
        'Transmettre la stratégie à l’opérateur et à l’équipe qui réalisera l’anesthésie.',
        'Réaliser la consultation plusieurs jours avant un acte programmé puis actualiser à la visite préanesthésique.',
      ],
    },
  };
}
