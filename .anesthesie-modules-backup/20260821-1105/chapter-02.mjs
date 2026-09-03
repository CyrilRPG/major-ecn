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
          renderChunks: [1, 2, 3],
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
          renderChunks: [2, 4],
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

const flashcard = (recto, verso, sourceBlocks) => ({
  recto,
  verso,
  sourceBlocks: Array.isArray(sourceBlocks) ? sourceBlocks : [sourceBlocks],
});

function buildFlashcards() {
  return [
    flashcard('Quels bénéfices cliniques vise l’évaluation préopératoire ?', 'Moins de morbidité et de mortalité postopératoires chez les patients à risque.', ['b00003', 'b00131']),
    flashcard('Comment l’évaluation préopératoire optimise-t-elle les examens ?', 'Elle évite les prescriptions inutiles et réserve les tests aux questions cliniques.', ['b00004', 'b00018']),
    flashcard('Quel coût organisationnel les reports évitables entraînent-ils ?', 'Ils mobilisent des ressources et augmentent les coûts liés aux retards ou annulations.', ['b00005', 'b00006']),
    flashcard('Quel effet l’évaluation peut-elle avoir sur le séjour hospitalier ?', 'Une préparation adaptée peut réduire la durée d’hospitalisation.', 'b00007'),
    flashcard('Quelle place le patient occupe-t-il dans la décision préopératoire ?', 'Il reçoit une information personnalisée et participe à un choix éclairé.', ['b00008', 'b00134']),
    flashcard('Les patients ASA I–II bénéficient-ils aussi de cette évaluation ?', 'Oui, notamment avant une intervention ambulatoire.', 'b00009'),
    flashcard('Quelle part des accidents peropératoires implique une évaluation absente ou inefficace ?', 'Environ 11,6 % des accidents peropératoires.', 'b00009'),
    flashcard('Quel intérêt présente une structure centralisée de consultation ?', 'Elle améliore l’efficience malgré un investissement organisationnel initial.', 'b00010'),
    flashcard('À quoi sert un questionnaire remis avant la consultation ?', 'À cibler l’entretien et à préserver du temps pour l’échange avec le patient.', ['b00012', 'b00013']),
    flashcard('Que permet un entretien informatique semi-dirigé ?', 'Structurer les données et repérer les patients nécessitant une consultation médicale.', 'b00013'),
    flashcard('Les documents écrits remplacent-ils l’information orale ?', 'Non, ils la soutiennent sans permettre sa personnalisation complète.', ['b00014', 'b00074']),
    flashcard('À quel dossier appartient le dossier d’anesthésie ?', 'Il fait partie intégrante du dossier médical du patient.', 'b00015'),
    flashcard('Pourquoi adapter localement la structure du dossier d’anesthésie ?', 'Sa conception influence directement la qualité du recueil des données.', 'b00015'),
    flashcard('Quels antécédents anesthésiques faut-il préciser ?', 'Techniques antérieures, tolérance, satisfaction et complications éventuelles.', ['b00016', 'b00017']),
    flashcard('Les examens complémentaires préopératoires sont-ils systématiques ?', 'Non, leur indication dépend du terrain, de l’acte et d’une question clinique utile.', 'b00018'),
    flashcard('Pourquoi un bilan systématique ne protège-t-il pas sur le plan médicolégal ?', 'Il ne dépiste pas efficacement une maladie ignorée et ne remplace pas le raisonnement clinique.', 'b00018'),
    flashcard('Comment débute le dépistage d’un risque hémorragique ?', 'Par l’histoire personnelle et familiale, puis l’examen physique.', ['b00018', 'b00019']),
    flashcard('Que signifie l’acronyme HEMSTOP ?', 'Hématome, hémorragie, ménorragies, chirurgie, extraction dentaire, obstétrique, parents.', ['b00018', 'b00020']),
    flashcard('Quels saignements dentaires recherche HEMSTOP ?', 'Un saignement anormal après une extraction dentaire.', ['b00021', 'b00028']),
    flashcard('Quelles questions HEMSTOP sont spécifiques aux femmes ?', 'Règles très abondantes et hémorragie anormale après un accouchement.', ['b00029', 'b00030', 'b00031']),
    flashcard('Quel antécédent familial complète HEMSTOP ?', 'Une maladie hémorragique familiale telle qu’une maladie de von Willebrand ou une hémophilie.', 'b00032'),
    flashcard('Quel seuil HEMSTOP définit un haut risque hémorragique ?', 'Un score égal ou supérieur à 2.', 'b00033'),
    flashcard('Quelle est la sensibilité de HEMSTOP au seuil de 2 ?', 'Environ 89,5 % pour identifier un haut risque hémorragique.', 'b00033'),
    flashcard('Pourquoi HEMSTOP est-il préférable à un TCA ou TQ systématique ?', 'Sa sensibilité clinique rapportée dépasse nettement celle des tests d’hémostase isolés.', 'b00033'),
    flashcard('Quels domaines apprécient la fragilité d’un patient âgé ?', 'Autonomie, mobilité, capacités physiques et état neuropsychique.', ['b00034', 'b00035', 'b00036']),
    flashcard('Quel signe simple peut révéler une fragilité fonctionnelle ?', 'L’usage d’une canne ou d’un déambulateur.', 'b00036'),
    flashcard('La fragilité contre-indique-t-elle toute chirurgie bénéfique ?', 'Non, certaines chirurgies peuvent améliorer durablement qualité de vie et autonomie.', 'b00036'),
    flashcard('Quelle polymédication est fréquente chez le sujet âgé ?', 'Plus de cinq médicaments chez plus de 60 % des patients âgés.', 'b00037'),
    flashcard('Quel risque cognitif doit être expliqué au patient âgé ?', 'Une aggravation souvent transitoire des fonctions supérieures pendant moins de 90 jours.', 'b00037'),
    flashcard('Quels critères cliniques évoquent une dénutrition avant 70 ans ?', 'IMC inférieur à 18,5 kg/m² ou perte pondérale d’au moins 10 %.', ['b00038', 'b00039']),
    flashcard('Quel seuil d’IMC évoque une dénutrition après 70 ans ?', 'Un IMC inférieur à 21 kg/m².', 'b00039'),
    flashcard('Dans quel contexte un support nutritionnel préopératoire est-il particulièrement utile ?', 'Avant certaines chirurgies, notamment oncologiques.', 'b00039'),
    flashcard('Quels agents dominent les allergies périopératoires récentes ?', 'Antibiotiques, curares et chlorhexidine.', ['b00040', 'b00041']),
    flashcard('Quel risque entraîne une fausse étiquette d’allergie aux bêta-lactamines ?', 'Le recours à une antibioprophylaxie alternative parfois moins efficace.', 'b00041'),
    flashcard('Une allergie aux fruits de mer traduit-elle une allergie à l’iode ?', 'Non, elle correspond à des IgE dirigées contre des protéines alimentaires.', 'b00042'),
    flashcard('Quel lien unit produit de contraste iodé et polyvidone iodée ?', 'Aucun lien allergologique automatique : ce sont des réactions distinctes.', ['b00042', 'b00043']),
    flashcard('Pourquoi organiser le sevrage tabagique avant l’intervention ?', 'Il réduit notamment les complications infectieuses et thrombotiques.', ['b00044', 'b00045']),
    flashcard('Comment prévenir un sevrage alcoolique périopératoire ?', 'Repérer la consommation puis organiser substitution ou prévention à distance de l’acte.', 'b00045'),
    flashcard('Quels outils apprécient la réserve fonctionnelle cardiovasculaire ?', 'Les METS et la classe fonctionnelle de la NYHA.', ['b00046', 'b00047', 'b00048']),
    flashcard('Comment évolue le risque cardiaque avec le nombre de facteurs du score de Lee ?', 'Il augmente de façon exponentielle.', 'b00048'),
    flashcard('Quels biomarqueurs améliorent la prédiction cardiovasculaire ?', 'Le BNP, et surtout le NT-proBNP.', 'b00049'),
    flashcard('Quand discuter une imagerie cardiaque de stress ?', 'Chirurgie intermédiaire ou élevée, Lee ≥ 2 et mauvaise réserve fonctionnelle.', 'b00055'),
    flashcard('Quand réaliser une échocardiographie préopératoire ?', 'Insuffisance cardiaque ou valvulopathie connue mal suivie, découverte ou symptomatique.', 'b00055'),
    flashcard('Quelle limite présente l’électrocardiogramme d’effort ?', 'Il exige d’atteindre 85 % de la fréquence cardiaque maximale théorique.', 'b00055'),
    flashcard('Que doit préciser une demande d’avis cardiologique ?', 'Acte prévu, tolérance à l’effort, traitements et question clinique posée.', ['b00056', 'b00057']),
    flashcard('Quel avis cardiologique est inutile avant une chirurgie ?', 'Une consultation générale sans question susceptible de modifier la prise en charge.', 'b00058'),
    flashcard('Quel principe autorise l’intervention chez un patient cardiaque ?', 'Une pathologie équilibrée et une stratégie périopératoire définie, hors urgence.', 'b00058'),
    flashcard('Quels éléments prédisent le mieux les complications respiratoires ?', 'L’interrogatoire et l’examen clinique, avant les EFR systématiques.', ['b00059', 'b00060']),
    flashcard('Quels critères décrivent une BPCO sévère ?', 'Handicap quotidien, hospitalisation récente pour exacerbation ou VEMS < 75 % théorique.', 'b00060'),
    flashcard('Comment optimiser une maladie respiratoire avant chirurgie ?', 'Stabilité, absence d’infection, sevrage tabagique, traitement et préhabilitation ciblés.', 'b00060'),
    flashcard('Un VEMS inférieur à 1 000 mL interdit-il toute anesthésie ?', 'Non, la décision repose sur la balance bénéfices–risques de l’intervention.', 'b00064'),
    flashcard('Pourquoi dépister un syndrome d’apnées obstructives du sommeil ?', 'Il modifie gestion des voies aériennes, analgésie et surveillance postopératoire.', 'b00065'),
    flashcard('Quel seuil STOP-BANG est sensible pour un SAOS modéré à sévère ?', 'Au moins 3 critères positifs sur 8.', ['b00066', 'b00068']),
    flashcard('Quelle sensibilité a STOP-BANG ≥ 3 pour un IAH supérieur à 15 ?', 'Environ 93 %.', 'b00068'),
    flashcard('Quels médicaments limiter chez un patient avec SAOS ?', 'Les opioïdes postopératoires et les benzodiazépines.', 'b00065'),
    flashcard('Quel antécédent prédit fortement une intubation difficile ?', 'Une difficulté documentée de contrôle des voies aériennes lors d’une anesthésie antérieure.', ['b00070', 'b00071']),
    flashcard('Quels critères examinent une intubation potentiellement difficile ?', 'Mallampati, distance thyromentonnière, ouverture buccale et état dentaire.', 'b00071'),
    flashcard('Quels facteurs favorisent une ventilation au masque difficile ?', 'Âge > 55 ans, IMC > 26, édentation, ronflement et barbe.', 'b00071'),
    flashcard('Quels résultats accompagne une information claire et loyale ?', 'Satisfaction, confiance, compréhension et meilleure qualité de vie ressentie.', ['b00072', 'b00073']),
    flashcard('Quelle modalité d’information reste prioritaire ?', 'L’échange oral personnalisé avec le patient.', 'b00074'),
    flashcard('Comment soutenir la mémorisation d’une information anxiogène ?', 'Associer supports écrits et, si souhaité, présence d’un accompagnant.', 'b00074'),
    flashcard('Pourquoi éviter le jargon médical pendant l’entretien ?', 'De nombreux patients ne comprennent pas les équivalents médicaux de mots usuels.', 'b00074'),
    flashcard('Quel intérêt présente un média interactif d’information ?', 'Le patient choisit les informations qu’il souhaite approfondir.', ['b00075', 'b00076', 'b00079']),
    flashcard('Quel outil classe le plus couramment l’état physique préopératoire ?', 'La classification ASA.', ['b00080', 'b00081']),
    flashcard('Avec quels événements la classe ASA est-elle corrélée ?', 'Morbidité, mortalité, soins critiques, durée de séjour et complications cardiovasculaires.', ['b00082', 'b00083']),
    flashcard('Quelles limites réduisent la précision individuelle de la classe ASA ?', 'Subjectivité et absence de données sur voies aériennes, structure et intervention.', 'b00083'),
    flashcard('Comment homogénéiser l’usage de la classe ASA ?', 'Partager des exemples précis et l’associer au risque chirurgical.', 'b00084'),
    flashcard('Quel bénéfice principal apportent les scores de risque ?', 'Ils standardisent la gravité et facilitent la communication entre professionnels.', 'b00085'),
    flashcard('Pourquoi contextualiser un score chirurgical ?', 'Patientèle, chirurgie, logistique et maladies rares modifient sa pertinence.', 'b00085'),
    flashcard('Quels événements précis sont plus utiles qu’un risque global ?', 'Réintubation, événement neurologique ou cardiaque et infection sévère.', ['b00088', 'b00089']),
    flashcard('Quel raisonnement guide chaque traitement chronique ?', 'Comparer risque de maintien, risque d’arrêt et modalités de reprise.', 'b00091'),
    flashcard('Dans quel contexte les consignes cardiovasculaires usuelles s’appliquent-elles ?', 'Patient stable avant une chirurgie de risque faible ou modéré.', ['b00092', 'b00093']),
    flashcard('Faut-il interrompre brutalement un bêtabloquant chronique ?', 'Non, le consensus est de poursuivre le traitement.', ['b00094', 'b00096']),
    flashcard('Quand commencer un bêtabloquant si une indication existe ?', 'Au moins un mois avant la chirurgie, jamais au dernier moment.', 'b00096'),
    flashcard('Quel contrôle réaliser sous IEC ou ARA II ?', 'Évaluer la fonction rénale avant de décider la conduite périopératoire.', 'b00097'),
    flashcard('Quel risque expose au maintien périopératoire d’un IEC ou ARA II ?', 'Une hypotension artérielle sévère, y compris sous rachianesthésie.', ['b00097', 'b00098']),
    flashcard('Quelle conduite adopter pour une statine chronique ?', 'La maintenir avant l’acte et la reprendre précocement après.', 'b00099'),
    flashcard('Quand peut-on instaurer une statine avant chirurgie ?', 'Avant chirurgie vasculaire chez un patient ayant des facteurs cardiovasculaires.', 'b00099'),
    flashcard('Faut-il poursuivre un inhibiteur calcique prescrit pour angor ?', 'Oui, le traitement est maintenu.', 'b00100'),
    flashcard('Quand poursuivre préférentiellement un diurétique ?', 'Surtout lorsqu’il traite une insuffisance cardiaque.', 'b00101'),
    flashcard('Quel bilan accompagne un traitement diurétique ?', 'Un ionogramme sanguin.', 'b00101'),
    flashcard('Pourquoi différer parfois la reprise postopératoire d’un diurétique ?', 'Pour limiter insuffisance rénale et hypovolémie précoces.', 'b00101'),
    flashcard('Pourquoi les dérivés nitrés transdermiques sont-ils délicats au bloc ?', 'Refroidissement et réchauffement modifient leur pharmacocinétique.', 'b00102'),
    flashcard('Quels risques s’opposent pour un antithrombotique ?', 'Hémorragie si maintien et thrombose si interruption.', ['b00103', 'b00104']),
    flashcard('Comment sécuriser les décisions sur les antithrombotiques ?', 'Par des procédures locales consensuelles entre anesthésistes et opérateurs.', ['b00104', 'b00105']),
    flashcard('Quelle conduite discuter pour l’iproniazide ?', 'Une éventuelle substitution préparée avec le psychiatre.', ['b00106', 'b00107']),
    flashcard('Quand interrompre si possible un imipraminique ?', 'Chez un patient porteur d’une pathologie cardiovasculaire.', 'b00107'),
    flashcard('Quelle vigilance concerne les inhibiteurs sélectifs de la recapture de la sérotonine ?', 'Tracer leur potentiel d’interaction avec les médicaments périopératoires.', 'b00107'),
    flashcard('Comment administrer un antiparkinsonien autour de l’intervention ?', 'Sans omettre de prise, y compris le matin et si besoin par sonde gastrique.', 'b00107'),
    flashcard('Quelle proportion de patients utilise une phytothérapie ?', 'Environ 20 %.', ['b00108', 'b00109']),
    flashcard('Quels effets périopératoires ont valériane et ginkgo ?', 'Sédation pour la valériane ; inhibition plaquettaire pour le ginkgo.', 'b00109'),
    flashcard('Quand interrompre une phytothérapie avant chirurgie ?', 'Dix jours avant l’intervention.', 'b00109'),
    flashcard('Quels risques accompagnent les antiangiogéniques ?', 'Hémorragie, ischémie et mauvaise cicatrisation vasculaire ou digestive.', 'b00110'),
    flashcard('Quand arrêter un antiangiogénique avant chirurgie ?', 'Six semaines avant l’intervention.', 'b00110'),
    flashcard('Quand reprendre un antiangiogénique après chirurgie ?', 'Seulement après plusieurs semaines, selon la cicatrisation.', 'b00110'),
    flashcard('Comment définir un seuil transfusionnel préopératoire ?', 'Selon les réserves du patient et le type de chirurgie.', ['b00111', 'b00112']),
    flashcard('Quel danger présente une stratégie transfusionnelle trop restrictive ?', 'Une hausse des complications cardiaques en chirurgie non cardiaque.', 'b00112'),
    flashcard('Comment corriger une anémie avant chirurgie carcinologique ?', 'Fer injectable et optimisation nutritionnelle en première intention.', 'b00112'),
    flashcard('Quand délivrer une information transfusionnelle spécifique ?', 'Lorsqu’un risque transfusionnel est documenté.', 'b00112'),
    flashcard('Qui assume la responsabilité de l’évaluation préopératoire ?', 'Un anesthésiste-réanimateur, chargé de la conduite et du suivi.', ['b00113', 'b00114']),
    flashcard('Quel avantage présente la continuité avec le même anesthésiste ?', 'Elle est appréciée des patients et facilite la cohérence de la prise en charge.', ['b00115', 'b00116']),
    flashcard('Quels patients peuvent relever d’une consultation infirmière structurée ?', 'Acte à faible retentissement sans comorbidité associée.', 'b00117'),
    flashcard('Pourquoi réserver du temps médical grâce au tri paramédical ?', 'Pour concentrer l’expertise sur les terrains ou interventions à risque.', 'b00117'),
    flashcard('Quels avantages offrent des locaux dédiés ?', 'Rotation plus rapide, coûts réduits et meilleure organisation de l’accueil.', ['b00118', 'b00119']),
    flashcard('Quelles informations chirurgicales doivent être disponibles ?', 'Intitulé exact, particularités de l’acte et modalités d’hospitalisation.', 'b00119'),
    flashcard('Quels documents médicamenteux doivent être accessibles ?', 'Dossier hospitalier et ordonnance détaillée des traitements quotidiens.', ['b00120', 'b00121']),
    flashcard('Quelle condition encadre une consultation délocalisée ?', 'Accord des équipes et du patient selon un cahier des charges prédéfini.', ['b00122', 'b00123']),
    flashcard('Quel risque expliquer avant une consultation délocalisée ?', 'La possibilité d’un report ou d’une annulation si des données manquent.', 'b00123'),
    flashcard('Pourquoi la visite préanesthésique est-elle cruciale après délocalisation ?', 'Elle actualise les données et ajuste l’information aux techniques réellement utilisées.', 'b00123'),
    flashcard('Quels patients peuvent bénéficier d’une téléconsultation préopératoire ?', 'Patients en institution, détenus ou personnes dont le déplacement est difficile.', 'b00124'),
    flashcard('Quels paramètres mesurer pendant une téléconsultation ?', 'Pression artérielle, pouls, SpO₂ et température.', 'b00124'),
    flashcard('Quand une seule consultation peut-elle couvrir plusieurs actes ?', 'Actes répétés à faible retentissement avec prise en charge stable.', 'b00125'),
    flashcard('Quand programmer la consultation avant un acte électif ?', 'Plusieurs jours avant l’intervention.', ['b00126', 'b00127']),
    flashcard('À quoi sert le délai avant une chirurgie programmée ?', 'À organiser sevrage, nutrition, kinésithérapie, préhabilitation, examens ou avis.', 'b00127'),
    flashcard('Quel statut réglementaire a la consultation en France ?', 'Elle est obligatoire et réalisée plusieurs jours avant un acte programmé.', ['b00131', 'b00140']),
    flashcard('Quel triptyque structure le rapport bénéfices–risques ?', 'État du patient, caractéristiques de l’intervention et ressources disponibles.', ['b00133', 'b00134']),
    flashcard('Que doit contenir la stratégie finale ?', 'Optimisation, technique, traitements, surveillance, information et consentement.', ['b00134', 'b00137']),
    flashcard('Où consigner tous les éléments de l’évaluation ?', 'Dans le dossier d’anesthésie, communiqué à l’opérateur et disponible le jour de l’acte.', 'b00138'),
    flashcard('Comment la qualité de l’information réduit-elle l’anxiété ?', 'Une compréhension adaptée renforce la confiance et limite ses répercussions physiologiques.', 'b00139'),
    flashcard('Pourquoi maintenir une veille bibliographique préopératoire ?', 'Les recommandations et les connaissances évoluent régulièrement.', 'b00141'),
  ];
}

const qroc = (enonce, reponse_attendue, sourceBlocks, correction_generale, newInformation = null) => ({
  enonce: newInformation ? `${newInformation} ${enonce}` : enonce,
  format: 'qroc',
  reponse_attendue,
  items: [],
  sourceBlocks: Array.isArray(sourceBlocks) ? sourceBlocks : [sourceBlocks],
  correction_generale,
  ...(newInformation ? { newInformation } : {}),
});

function buildIsolatedQroc() {
  const definitions = [
    ['Finalités de la consultation', [
      ['Quel est l’objectif médical central de l’évaluation préopératoire ?', 'Établir le rapport bénéfices–risques et construire une stratégie adaptée', ['b00003', 'b00134'], 'La consultation transforme les risques identifiés en décisions d’optimisation, de technique et de surveillance.'],
      ['Quel indicateur traduit une évaluation défaillante dans les accidents peropératoires ?', '11,6 % des accidents peropératoires', 'b00009', 'Une part mesurable des événements peropératoires est associée à une évaluation absente ou inefficace.'],
      ['Quel document rassemble les décisions anesthésiques avant l’intervention ?', 'Le dossier d’anesthésie', ['b00015', 'b00138'], 'Ce dossier assure le recueil, la traçabilité et la disponibilité des informations pour l’équipe.'],
      ['Quel outil peut cibler l’entretien avant la consultation médicale ?', 'Un questionnaire préparatoire', 'b00013', 'Un questionnaire préalable concentre le temps médical sur les risques et les attentes pertinentes.'],
      ['Quelle condition rend un examen complémentaire préopératoire pertinent ?', 'Son résultat doit pouvoir modifier la prise en charge', ['b00018', 'b00137'], 'La prescription répond à une question clinique issue du terrain ou des caractéristiques de l’acte.'],
    ]],
    ['Hémorragie, fragilité et nutrition', [
      ['Quel score clinique standardise l’anamnèse hémorragique ?', 'HEMSTOP', ['b00018', 'b00033'], 'HEMSTOP rassemble les saignements personnels, obstétricaux, chirurgicaux, dentaires et familiaux.'],
      ['À partir de quel score HEMSTOP le risque hémorragique est-il élevé ?', '2', 'b00033', 'Le seuil de deux réponses positives offre une sensibilité élevée dans la population étudiée.'],
      ['Quel seuil d’IMC indique une dénutrition après 70 ans ?', 'IMC < 21 kg/m²', 'b00039', 'Chez la personne âgée, le seuil nutritionnel est relevé afin de détecter plus tôt une réserve insuffisante.'],
      ['Quel élément de mobilité signale simplement une fragilité ?', 'L’usage d’une canne ou d’un déambulateur', 'b00036', 'Une aide à la marche traduit une autonomie réduite et un risque opératoire augmenté.'],
      ['Quel délai maximal décrit l’aggravation cognitive souvent transitoire ?', 'Moins de 90 jours', 'b00037', 'L’information du patient âgé inclut la possibilité d’une altération temporaire des fonctions supérieures.'],
    ]],
    ['Cœur et poumons', [
      ['Quels deux outils cliniques apprécient la réserve cardiovasculaire ?', 'METS et classe NYHA', 'b00048', 'La capacité fonctionnelle oriente l’examen, la stratification et l’utilité d’explorations complémentaires.'],
      ['Quel score cardiaque reste utile quel que soit l’âge ?', 'Le score de Lee', 'b00048', 'Le nombre de facteurs du score de Lee accompagne une augmentation exponentielle des complications.'],
      ['Quel biomarqueur est préféré au BNP pour affiner la prédiction ?', 'NT-proBNP', 'b00049', 'Le NT-proBNP complète l’évaluation clinique et la réserve fonctionnelle dans la stratification cardiaque.'],
      ['Quelle valeur de VEMS participe à la définition d’une BPCO sévère ?', 'VEMS < 75 % de la valeur théorique', 'b00060', 'La sévérité respiratoire associe déficit fonctionnel, retentissement quotidien et poussées récentes.'],
      ['Un VEMS inférieur à 1 000 mL constitue-t-il une contre-indication absolue ?', 'Non', 'b00064', 'Même une fonction respiratoire très amputée impose une balance bénéfices–risques, pas une exclusion automatique.'],
    ]],
    ['Voies aériennes et SAOS', [
      ['Quel seuil STOP-BANG justifie une vigilance accrue pour le SAOS ?', 'Au moins 3 critères positifs', ['b00065', 'b00068'], 'Trois réponses positives offrent une forte sensibilité pour un index apnées–hypopnées supérieur à quinze.'],
      ['Quel antécédent est prioritaire pour prédire une intubation difficile ?', 'Une difficulté antérieure documentée de contrôle des voies aériennes', 'b00071', 'Une difficulté déjà observée fournit une information directement exploitable pour préparer la stratégie.'],
      ['Quelle distance anatomique participe à l’évaluation d’une intubation difficile ?', 'La distance thyromentonnière', 'b00071', 'Elle complète Mallampati, ouverture buccale, état dentaire et antécédents de voies aériennes.'],
      ['Quels deux critères pileux ou nocturnes favorisent la ventilation au masque difficile ?', 'Barbe et ronflement', 'b00071', 'Barbe et ronflement s’ajoutent à l’âge, à l’IMC et à l’édentation pour anticiper la ventilation.'],
      ['Quel support ventilatoire peut être anticipé après chirurgie chez un patient avec SAOS ?', 'Une ventilation non invasive', 'b00065', 'Le dépistage préopératoire permet de planifier une assistance ventilatoire et une surveillance prolongée.'],
    ]],
    ['Information et mesure du risque', [
      ['Quelle modalité d’information doit rester prioritaire ?', 'L’information orale personnalisée', 'b00074', 'Seul l’entretien permet d’adapter immédiatement le contenu aux souhaits et à la compréhension du patient.'],
      ['Quel proche peut soutenir la mémorisation pendant une consultation anxiogène ?', 'Un accompagnant', 'b00074', 'La présence choisie d’un proche complète les documents écrits lorsque l’émotion gêne l’assimilation.'],
      ['Quel score décrit le plus couramment l’état physique préopératoire ?', 'La classification ASA', ['b00081', 'b00083'], 'La classe ASA synthétise le terrain mais doit être confrontée aux risques de l’acte et des voies aériennes.'],
      ['Pourquoi partager des exemples de classes ASA dans une équipe ?', 'Pour homogénéiser les classifications', 'b00084', 'Des exemples communs réduisent la variabilité subjective et améliorent la planification interprofessionnelle.'],
      ['Quel événement précis peut être préféré à une morbidité globale dans un score ?', 'Une réintubation postopératoire', 'b00088', 'Un événement défini et directement actionnable se transpose mieux à la stratégie d’un patient donné.'],
    ]],
    ['Traitements cardiovasculaires', [
      ['Quel traitement cardiovasculaire chronique ne doit pas être interrompu brutalement ?', 'Un bêtabloquant', 'b00096', 'L’arrêt expose à un rebond alors qu’une introduction tardive avant l’acte peut également être dangereuse.'],
      ['Quel risque majeur accompagne le maintien d’un IEC ou ARA II ?', 'Une hypotension artérielle sévère', ['b00097', 'b00098'], 'Le blocage du système rénine–angiotensine peut compromettre la réponse hémodynamique à l’anesthésie.'],
      ['Quand reprendre une statine après l’intervention ?', 'Le plus tôt possible', 'b00099', 'La continuité du traitement limite une interruption inutile de la protection cardiovasculaire.'],
      ['Quel examen biologique accompagne la poursuite d’un diurétique ?', 'Un ionogramme sanguin', 'b00101', 'Le contrôle électrolytique participe à l’évaluation du risque rénal et volémique.'],
      ['Quel facteur du bloc modifie l’absorption d’un dérivé nitré transdermique ?', 'La température cutanée', 'b00102', 'Refroidissement et réchauffement externes rendent l’exposition transdermique moins prévisible.'],
    ]],
    ['Autres médicaments et transfusion', [
      ['Quel délai d’arrêt est recommandé pour toute phytothérapie ?', '10 jours', 'b00109', 'Ce délai limite les effets sédatifs, plaquettaires et les interactions non déclarées.'],
      ['Quel délai d’arrêt précède une chirurgie sous antiangiogénique ?', '6 semaines', 'b00110', 'La fenêtre vise à réduire hémorragie, ischémie et mauvaise cicatrisation des sutures.'],
      ['Quel traitement neurologique ne doit subir aucune omission périopératoire ?', 'Le traitement antiparkinsonien', 'b00107', 'La continuité des prises est prioritaire, avec recours possible à une sonde gastrique pendant l’acte.'],
      ['Quelles deux mesures corrigent d’abord l’anémie avant chirurgie carcinologique ?', 'Fer injectable et nutrition', 'b00112', 'L’optimisation de l’hémoglobine réduit l’exposition transfusionnelle dans un contexte où elle peut être défavorable.'],
      ['Quelle décision du patient est indispensable avant une transfusion ?', 'Son consentement', 'b00112', 'Un risque transfusionnel documenté impose une information spécifique et une décision anticipée.'],
    ]],
    ['Organisation et temporalité', [
      ['Qui valide une consultation infirmière préopératoire ?', 'Un médecin anesthésiste-réanimateur', ['b00114', 'b00117'], 'Le tri paramédical reste placé sous responsabilité médicale avec reprise des situations hors critères.'],
      ['Quels patients peuvent être évalués initialement par une infirmière ?', 'Patients sans comorbidité avant chirurgie à faible retentissement', 'b00117', 'Le double critère terrain–intervention réserve ce circuit aux situations simples.'],
      ['Quelles constantes doivent être disponibles en télémédecine ?', 'Pression artérielle, pouls, SpO₂ et température', 'b00124', 'La téléconsultation conserve un socle de mesures objectives en plus du son, de la vidéo et du dossier.'],
      ['Quand une consultation unique peut-elle couvrir des actes itératifs ?', 'Si les actes ont un faible retentissement et si la stratégie reste stable', 'b00125', 'Une modification du terrain ou un alourdissement progressif impose une nouvelle évaluation.'],
      ['Combien de temps avant un acte programmé faut-il consulter ?', 'Plusieurs jours avant', ['b00127', 'b00140'], 'L’anticipation laisse le temps d’optimiser le terrain, de réaliser un bilan utile et d’organiser le parcours.'],
    ]],
  ];
  return definitions.map(([title, questions], index) => ({
    label: `QROC ${index + 1} · ${title}`,
    vignette: '',
    allowed_voies: ['externe'],
    questions: questions.map(([enonce, reponse, sources, correction]) => qroc(enonce, reponse, sources, correction)),
  }));
}

const DP_QROC = [
  {
    title: 'Fragilité avant colectomie',
    vignette: 'Une patiente de 79 ans doit bénéficier d’une colectomie programmée pour cancer. Elle vit seule, marche avec une canne et a perdu 11 % de son poids en quatre mois. Son ordonnance comporte sept médicaments. Elle comprend l’objectif de l’intervention mais craint de perdre son autonomie après l’hospitalisation. L’équipe souhaite utiliser le délai préopératoire pour corriger les risques modifiables.',
    steps: [
      [null, 'Quel syndrome gériatrique doit être recherché en priorité ?', 'La fragilité', 'b00036', 'L’aide à la marche, la perte d’autonomie potentielle et le terrain âgé imposent une évaluation de la fragilité.'],
      ['Le calcul retrouve un IMC à 20,4 kg/m².', 'Quel diagnostic nutritionnel faut-il retenir ?', 'Dénutrition', 'b00039', 'Après 70 ans, un IMC inférieur à 21 kg/m² suffit à retenir une dénutrition clinique.'],
      ['La patiente confirme une perte pondérale de 11 %.', 'Quelle optimisation doit être organisée avant la chirurgie ?', 'Un support nutritionnel préopératoire', ['b00039', 'b00127'], 'La perte de poids supérieure à dix pour cent et la chirurgie oncologique justifient une préparation nutritionnelle anticipée.'],
      ['L’hémoglobine est mesurée à 9,6 g/dL.', 'Quelles mesures constituent la base de la correction de cette anémie ?', 'Fer injectable et nutrition', 'b00112', 'L’anémie carcinologique doit être corrigée en privilégiant fer injectable et soutien nutritionnel.'],
      ['Son fils demande si les troubles cognitifs sont possibles après l’acte.', 'Quel risque temporel faut-il expliquer ?', 'Aggravation cognitive souvent transitoire pendant moins de 90 jours', 'b00037', 'L’information porte sur une altération possible des fonctions supérieures, habituellement transitoire.'],
      ['La patiente prend également du ginkgo sans l’avoir mentionné sur l’ordonnance.', 'Combien de jours avant l’intervention faut-il l’interrompre ?', '10 jours', 'b00109', 'Le ginkgo peut inhiber la fonction plaquettaire ; toute phytothérapie est interrompue dix jours avant.'],
      ['La date opératoire est maintenue dans trois semaines.', 'Quel avantage principal offre ce délai ?', 'Réaliser l’optimisation nutritionnelle, hématologique et fonctionnelle', 'b00127', 'Une consultation anticipée transforme les anomalies modifiables en programme concret avant l’hospitalisation.'],
    ],
  },
  {
    title: 'Dyspnée avant chirurgie vasculaire',
    vignette: 'Un homme de 68 ans est adressé avant une revascularisation artérielle programmée. Il est hypertendu, diabétique et décrit une dyspnée à la montée d’un étage sans douleur thoracique. Son suivi cardiologique est ancien et sa capacité d’effort paraît limitée. L’intervention est considérée comme à risque élevé ; l’anesthésiste veut poser une question précise avant de multiplier les explorations.',
    steps: [
      [null, 'Quel outil clinique permet de quantifier d’abord sa capacité fonctionnelle ?', 'Les METS', 'b00048', 'La dépense énergétique des activités quotidiennes situe la réserve fonctionnelle avant toute exploration spécialisée.'],
      ['Le score de Lee est calculé à 2 et la réserve fonctionnelle reste mauvaise.', 'Quel type d’exploration peut être discuté ?', 'Une imagerie cardiaque de stress', 'b00055', 'Chirurgie à risque, Lee au moins égal à deux et mauvaise capacité d’effort forment le profil ciblé.'],
      ['L’examen retrouve un souffle systolique nouveau et une dyspnée d’effort.', 'Quel examen cardiaque devient indiqué ?', 'Une échocardiographie transthoracique', 'b00055', 'Une valvulopathie symptomatique suspectée doit être caractérisée et son éventuel traitement discuté avant l’acte.'],
      ['Un avis cardiologique est demandé.', 'Quelles informations doivent accompagner la demande ?', 'Acte prévu, tolérance à l’effort, traitements et question clinique', ['b00056', 'b00057'], 'Une demande ciblée permet au cardiologue de proposer une réponse susceptible de modifier la stratégie.'],
      ['Le patient prend une statine au long cours.', 'Quelle conduite médicamenteuse faut-il écrire ?', 'Maintien avant et reprise postopératoire précoce', 'b00099', 'L’interruption d’une statine chronique n’apporte aucun bénéfice dans ce contexte vasculaire.'],
      ['Il prend aussi un IEC et sa fonction rénale est altérée.', 'Quel risque peranesthésique doit guider la décision ?', 'Hypotension artérielle sévère', ['b00097', 'b00098'], 'Le maintien d’un IEC peut réduire la réponse vasoconstrictrice et majorer une hypotension profonde.'],
      ['Après optimisation, la pathologie cardiaque est jugée équilibrée.', 'Quelle décision opératoire est alors possible hors urgence ?', 'Donner l’accord pour l’intervention', 'b00058', 'Une maladie stabilisée et une stratégie définie autorisent la poursuite du parcours programmé.'],
    ],
  },
  {
    title: 'BPCO et apnées du sommeil',
    vignette: 'Un homme de 63 ans obèse, fumeur actif, doit être opéré d’une éventration. Il présente une BPCO avec bronchorrhée et a été hospitalisé deux mois plus tôt pour une exacerbation. Son épouse décrit des ronflements sonores et des pauses respiratoires nocturnes. L’examen préopératoire doit distinguer les facteurs modifiables des éléments imposant une surveillance renforcée.',
    steps: [
      [null, 'Quels moyens prédisent le mieux ses complications respiratoires postopératoires ?', 'L’interrogatoire et l’examen clinique', 'b00060', 'Les données cliniques identifient mieux le risque respiratoire global que des EFR prescrites isolément.'],
      ['Le VEMS est mesuré à 72 % de la valeur théorique.', 'Quel degré de sévérité respiratoire ce résultat peut-il soutenir ?', 'Une BPCO sévère', 'b00060', 'Un VEMS inférieur à soixante-quinze pour cent participe à la définition, avec le retentissement clinique.'],
      ['La bronchorrhée persiste sans fièvre.', 'Quelle intervention non médicamenteuse est particulièrement adaptée ?', 'Kinésithérapie respiratoire', 'b00060', 'Une bronchorrhée constitue une indication privilégiée de préparation kinésithérapique et de préhabilitation.'],
      ['Le STOP-BANG comporte cinq réponses positives.', 'Quel syndrome faut-il considérer comme probable ?', 'Un syndrome d’apnées obstructives du sommeil', ['b00065', 'b00068'], 'Un score au moins égal à trois possède une forte sensibilité pour un SAOS significatif.'],
      ['L’équipe prépare le réveil et l’hospitalisation.', 'Quelles deux mesures respiratoires doivent être anticipées ?', 'Surveillance prolongée et ventilation non invasive', 'b00065', 'Le SAOS modifie directement le lieu de surveillance et la disponibilité d’une assistance ventilatoire.'],
      ['Une analgésie postopératoire est planifiée.', 'Quelles classes faut-il limiter ?', 'Opioïdes et benzodiazépines', 'b00065', 'Ces médicaments aggravent l’obstruction et la dépression ventilatoire chez un patient apnéique.'],
      ['Le patient demande si sa fonction respiratoire interdit l’intervention.', 'Quel principe doit guider la réponse ?', 'La balance bénéfices–risques plutôt qu’un seuil isolé', 'b00064', 'Une fonction très altérée n’est pas une contre-indication automatique si la stratégie est adaptée.'],
    ],
  },
  {
    title: 'Saignements avant hystérectomie',
    vignette: 'Une femme de 42 ans doit subir une hystérectomie programmée. Elle rapporte des règles très abondantes traitées par fer, des ecchymoses spontanées et un saignement prolongé après une extraction dentaire. Sa mère est suivie pour maladie de von Willebrand. Aucun bilan d’hémostase récent n’est disponible et l’équipe souhaite éviter une prescription biologique aveugle.',
    steps: [
      [null, 'Quel outil clinique doit structurer l’anamnèse hémorragique ?', 'Le questionnaire HEMSTOP', 'b00018', 'L’histoire personnelle, gynécologique, dentaire et familiale est standardisée avant les tests biologiques.'],
      ['Les règles abondantes ont nécessité un traitement médical.', 'Dans quel domaine de HEMSTOP cette donnée s’inscrit-elle ?', 'Ménorragies', 'b00030', 'Une consultation ou un traitement pour des règles excessives correspond à une réponse positive spécifique.'],
      ['Elle confirme un saignement anormal après extraction dentaire.', 'Quel autre domaine du score devient positif ?', 'Extraction dentaire', 'b00028', 'Un saignement dentaire excessif ajoute un signal clinique indépendant au questionnaire.'],
      ['La maladie de von Willebrand maternelle est documentée.', 'Quel volet de l’anamnèse est alors positif ?', 'Antécédent familial de trouble de la coagulation', 'b00032', 'Une maladie hémorragique chez un proche renforce la probabilité d’une diathèse familiale.'],
      ['Le score HEMSTOP atteint 3.', 'Comment classer le risque hémorragique clinique ?', 'Haut risque', 'b00033', 'Le seuil de haut risque est atteint dès deux réponses positives.'],
      ['Un TCA normal est retrouvé.', 'Pourquoi ce résultat n’annule-t-il pas le signal clinique ?', 'Les tests usuels ont une faible sensibilité pour ce dépistage', 'b00033', 'La sensibilité rapportée du TCA ou du TQ allongé est très inférieure à celle de HEMSTOP.'],
      ['La chirurgie reste programmée après avis spécialisé.', 'Quelle information doit être transmise à l’équipe opératoire ?', 'Le risque hémorragique et la stratégie d’hémostase', ['b00137', 'b00138'], 'La décision issue de l’évaluation doit être écrite, communiquée et accessible le jour de l’acte.'],
    ],
  },
  {
    title: 'Traitements avant prothèse de hanche',
    vignette: 'Un homme de 74 ans doit recevoir une prothèse totale de hanche. Il prend bisoprolol, ramipril, atorvastatine, furosémide et un patch nitré. Son insuffisance cardiaque est stable, mais une insuffisance rénale modérée est connue. Le chirurgien demande une conduite écrite pour chaque médicament afin d’éviter à la fois hypotension, rebond et reprise postopératoire inadaptée.',
    steps: [
      [null, 'Quelle conduite adopter pour son bêtabloquant chronique ?', 'Le poursuivre', 'b00096', 'Un arrêt brutal expose au rebond, tandis que le maintien d’un traitement ancien est consensuel.'],
      ['La créatinine confirme une fonction rénale diminuée.', 'Quel traitement nécessite une décision centrée sur l’hypotension ?', 'Le ramipril', ['b00097', 'b00098'], 'L’IEC associe contrôle rénal et risque d’hypotension sévère pendant l’anesthésie.'],
      ['La prévention cardiovasculaire doit rester continue.', 'Quelle consigne donner pour l’atorvastatine ?', 'Maintien avant et reprise rapide après chirurgie', 'b00099', 'Une statine au long cours est conservée et réintroduite dès que la situation le permet.'],
      ['Le furosémide traite l’insuffisance cardiaque.', 'Quel bilan biologique faut-il vérifier ?', 'L’ionogramme sanguin', 'b00101', 'La poursuite d’un diurétique cardiaque s’accompagne d’une vérification électrolytique et volémique.'],
      ['Le patient est hypovolémique au réveil.', 'Quelle prescription doit être différée ?', 'La reprise immédiate du furosémide', 'b00101', 'Une reprise précoce dans ce contexte augmente le risque d’insuffisance rénale postopératoire.'],
      ['Une couverture chauffante sera utilisée au bloc.', 'Pourquoi le patch nitré mérite-t-il une attention particulière ?', 'La chaleur modifie son absorption transdermique', 'b00102', 'Le réchauffement local peut changer la pharmacocinétique et les effets hémodynamiques du dérivé nitré.'],
      ['Toutes les décisions sont arrêtées.', 'Sous quelle forme doivent-elles parvenir au médecin anesthésiste du jour ?', 'Une conduite écrite dans le dossier d’anesthésie', ['b00091', 'b00138'], 'Arrêt, maintien et reprise sont tracés afin d’assurer une transmission sans ambiguïté.'],
    ],
  },
  {
    title: 'Téléconsultation en institution',
    vignette: 'Une patiente de 86 ans vivant en EHPAD doit bénéficier d’une endoscopie interventionnelle programmée dans un établissement éloigné. Le déplacement est difficile et une téléconsultation est proposée avec son accord. L’infirmière de l’institution dispose du dossier, de l’ordonnance et d’un chariot de constantes ; la fille de la patiente souhaite assister à l’entretien.',
    steps: [
      [null, 'Quel motif rend la télémédecine pertinente dans cette situation ?', 'La difficulté de déplacement', 'b00124', 'L’hébergement en institution et l’éloignement justifient une évaluation à distance correctement équipée.'],
      ['La connexion vidéo et audio est testée.', 'Quels autres documents sont indispensables ?', 'Dossier médical et traitements usuels', 'b00124', 'Une téléconsultation utile exige les mêmes informations cliniques et médicamenteuses qu’un entretien présentiel.'],
      ['L’infirmière prépare la mesure des constantes.', 'Quels quatre paramètres doit-elle recueillir ?', 'Pression artérielle, pouls, SpO₂ et température', 'b00124', 'Ces mesures objectives complètent l’examen visuel et l’interrogatoire réalisés à distance.'],
      ['La patiente entend mal et sa fille propose de rester.', 'Quel bénéfice peut apporter l’accompagnante ?', 'Soutenir la compréhension et la mémorisation', 'b00074', 'Un proche choisi aide à restituer l’information lorsque communication ou émotion limitent l’assimilation.'],
      ['Le nom exact de l’acte n’apparaît pas dans le courrier.', 'Quelle information doit être obtenue avant de conclure ?', 'L’intitulé précis et les particularités de l’intervention', 'b00119', 'Le retentissement et la stratégie ne peuvent être appréciés sans connaître exactement le geste prévu.'],
      ['La patiente consent à la consultation délocalisée.', 'Quel risque organisationnel doit lui être expliqué ?', 'Un report ou une annulation de l’intervention', 'b00123', 'Une donnée manquante ou une discordance lors du contact présentiel peut imposer de différer le geste.'],
      ['Elle arrive finalement le matin de l’endoscopie.', 'Quel temps clinique actualise l’évaluation à distance ?', 'La visite préanesthésique', 'b00123', 'Le premier contact direct vérifie l’état actuel et adapte la stratégie aux techniques effectivement utilisées.'],
    ],
  },
  {
    title: 'Allergie avant chirurgie ambulatoire',
    vignette: 'Une femme de 35 ans est évaluée avant une cholécystectomie ambulatoire. Son dossier mentionne « allergie à l’iode » après des nausées lors d’un scanner. Elle mange des crustacés sans réaction, utilise parfois de la polyvidone iodée et rapporte une éruption ancienne sous amoxicilline sans exploration. L’équipe doit clarifier ces étiquettes avant de choisir l’antibioprophylaxie.',
    steps: [
      [null, 'Quels éléments faut-il préciser pour chaque réaction alléguée ?', 'Agent, chronologie, manifestations et explorations réalisées', 'b00041', 'Une étiquette ne devient exploitable qu’après description précise du produit et de la réaction.'],
      ['La réaction au produit de contraste se limitait à des nausées.', 'Peut-on en déduire une allergie aux fruits de mer ?', 'Non', 'b00042', 'Les protéines alimentaires responsables des réactions aux crustacés n’ont aucun rapport avec l’iode.'],
      ['La polyvidone iodée a toujours été bien tolérée.', 'Quelle relation existe avec une réaction à un contraste iodé ?', 'Aucune relation allergologique automatique', ['b00042', 'b00043'], 'Produit de contraste et polyvidone sont des composés distincts dont les réactions ne se prédisent pas mutuellement.'],
      ['L’éruption sous amoxicilline reste mal documentée.', 'Quel risque entraîne une éviction injustifiée des bêta-lactamines ?', 'Une antibioprophylaxie alternative moins efficace', 'b00041', 'Une fausse allergie peut accroître les complications en imposant une classe antimicrobienne moins performante.'],
      ['L’équipe interroge les expositions périopératoires.', 'Quels trois agents doivent rester particulièrement recherchés ?', 'Antibiotiques, curares et chlorhexidine', 'b00041', 'Ces produits figurent parmi les déclencheurs principaux des réactions périopératoires contemporaines.'],
      ['Aucun allergène certain n’est identifié.', 'Quelle conduite documentaire reste nécessaire ?', 'Tracer les incertitudes et demander une exploration si utile', 'b00041', 'Une incertitude explicite vaut mieux qu’une conclusion erronée et oriente l’évaluation allergologique ultérieure.'],
      ['La stratégie ambulatoire est confirmée.', 'Où doit figurer la synthèse allergologique ?', 'Dans le dossier d’anesthésie accessible le jour de l’acte', ['b00015', 'b00138'], 'La disponibilité de l’information protège le choix de l’antibiotique et des médicaments d’anesthésie.'],
    ],
  },
  {
    title: 'Actes itératifs en radiologie',
    vignette: 'Un enfant de 9 ans atteint d’une maladie chronique doit recevoir trois gestes radiologiques sous anesthésie à six semaines d’intervalle. Les actes sont courts, de faible retentissement et réalisés par la même équipe. Son état clinique et ses traitements sont stables. Les parents demandent si une consultation unique est possible et comment seront gérés les changements entre deux séances.',
    steps: [
      [null, 'Quelle caractéristique des interventions autorise une évaluation commune ?', 'Leur faible retentissement physiopathologique', 'b00125', 'Des actes brefs et peu invasifs peuvent relever d’une consultation commune si les autres conditions restent stables.'],
      ['Les trois séances suivent le même protocole.', 'Quelle stabilité supplémentaire doit être vérifiée ?', 'Absence d’alourdissement progressif de la prise en charge', 'b00125', 'La stratégie ne doit ni se modifier ni devenir plus complexe au fil des actes répétés.'],
      ['Les parents acceptent le principe après explication.', 'Quelle dimension éthique cette discussion satisfait-elle ?', 'Le consentement éclairé', 'b00125', 'La possibilité d’une évaluation unique et ses limites doivent être comprises et acceptées.'],
      ['Avant la deuxième séance, l’enfant développe une infection respiratoire.', 'Quelle conséquence a ce changement clinique ?', 'Une nouvelle évaluation avant l’anesthésie', ['b00123', 'b00125'], 'La stabilité initiale n’autorise pas à ignorer une modification intercurrente susceptible de changer la stratégie.'],
      ['L’infection a disparu mais un nouveau traitement a été introduit.', 'Quel document doit être actualisé ?', 'L’ordonnance détaillée des traitements usuels', ['b00120', 'b00121'], 'Toute modification médicamenteuse doit être connue avant de reconduire la prise en charge.'],
      ['Le troisième acte est remplacé par une procédure plus invasive.', 'La consultation initiale suffit-elle encore ?', 'Non', 'b00125', 'L’augmentation du retentissement rompt les conditions qui permettaient une évaluation commune.'],
      ['Une nouvelle stratégie est décidée.', 'À qui doit-elle être transmise avant le geste ?', 'À l’opérateur et à l’équipe anesthésique', ['b00114', 'b00138'], 'La continuité repose sur une décision écrite, communiquée et disponible au moment de l’anesthésie.'],
    ],
  },
];

const DP_QROC_ANCHORS = [
  ['b00035', 'b00038', 'b00111', 'b00037', 'b00108', 'b00126', 'b00134'],
  ['b00047', 'b00048', 'b00055', 'b00056', 'b00092', 'b00097', 'b00058'],
  ['b00059', 'b00060', 'b00044', 'b00066', 'b00065', 'b00070', 'b00064'],
  ['b00018', 'b00030', 'b00028', 'b00032', 'b00033', 'b00021', 'b00137'],
  ['b00096', 'b00097', 'b00099', 'b00101', 'b00102', 'b00091', 'b00138'],
  ['b00118', 'b00124', 'b00121', 'b00074', 'b00119', 'b00123', 'b00140'],
  ['b00040', 'b00041', 'b00042', 'b00043', 'b00014', 'b00137', 'b00138'],
  ['b00125', 'b00119', 'b00134', 'b00123', 'b00120', 'b00140', 'b00138'],
];

function buildDpQroc() {
  return DP_QROC.map((definition, index) => ({
    label: `DP QROC ${index + 1} · ${definition.title}`,
    vignette: definition.vignette,
    allowed_voies: ['externe'],
    questions: definition.steps.map(([info, enonce, answer, sources, correction], questionIndex) => {
      const question = qroc(enonce, answer, sources, correction, info);
      question.sourceBlocks = [...new Set([...question.sourceBlocks, DP_QROC_ANCHORS[index][questionIndex]])];
      return question;
    }),
  }));
}

const qcm = (enonce, sourceBlocks, correction_generale, options, newInformation = null) => ({
  enonce: newInformation ? `${newInformation} ${enonce}` : enonce,
  format: 'qcm',
  sourceBlocks: Array.isArray(sourceBlocks) ? sourceBlocks : [sourceBlocks],
  correction_generale,
  ...(newInformation ? { newInformation } : {}),
  items: options.map(([is_correct, itemText, justification], index) => ({
    lettre: 'ABCDE'[index],
    enonce: itemText,
    is_correct,
    justification,
  })),
});

const O = (isCorrect, text, justification) => [isCorrect, text, justification];

function buildIsolatedQcm() {
  const definitions = [
    ['Fondements et objectifs', [
      ['Une consultation préopératoire est organisée avant une chirurgie ambulatoire chez un patient ASA II. Quels bénéfices peuvent être raisonnablement attendus ?', ['b00003', 'b00004', 'b00007', 'b00009'], 'L’évaluation conserve un intérêt chez les patients peu comorbides : elle sécurise le parcours, rationalise les examens et soutient la décision.', [
        O(false, 'La consultation justifie de supprimer un examen même si son résultat pourrait modifier la stratégie.', 'La rationalisation concerne les tests sans indication ; un examen susceptible de changer optimisation, technique ou surveillance reste pertinent.'),
        O(false, 'La garantie qu’aucun événement indésirable ne surviendra pendant l’acte.', 'Une consultation réduit certains risques mais ne peut supprimer l’aléa périopératoire.'),
        O(true, 'Une participation du patient au choix après une information adaptée.', 'Le consentement éclairé fait partie des finalités explicites de cette évaluation.'),
        O(false, 'L’exclusion des patients ASA I de toute filière d’évaluation anesthésique.', 'Les sujets ASA I–II tirent aussi bénéfice d’une préparation, notamment en ambulatoire.'),
        O(false, 'La prescription automatique d’un bilan biologique complet avant toute anesthésie.', 'Un bilan uniforme contredit le principe d’examens guidés par le terrain et l’intervention.'),
      ]],
      ['Quelles fonctions un questionnaire préparatoire bien conçu peut-il remplir ?', ['b00013', 'b00015'], 'Le questionnaire prépare l’entretien sans se substituer au médecin ; sa valeur tient à la structuration et à la sélection des informations utiles.', [
        O(false, 'Décider seul de l’aptitude définitive à l’anesthésie.', 'Une réponse automatisée ne porte pas la responsabilité médicale de la stratégie finale.'),
        O(true, 'Concentrer la consultation sur les problèmes qui nécessitent un échange.', 'Le recueil préalable libère du temps pour discuter risques, préférences et décisions.'),
        O(false, 'Éviter la consultation médicale à tout patient qui coche une case négative.', 'La sélection dépend d’un ensemble de données et du retentissement de l’acte prévu.'),
        O(true, 'Standardiser la collecte afin de faciliter la transmission des données.', 'Une structure explicite améliore la complétude et la circulation des informations.'),
        O(true, 'Repérer les situations devant être revues par un anesthésiste-réanimateur.', 'L’entretien semi-dirigé peut orienter vers une évaluation médicale plus approfondie.'),
      ]],
      ['À propos du dossier d’anesthésie, quelles affirmations sont justes ?', ['b00015', 'b00138'], 'Le dossier est un outil clinique de continuité : sa conception, son contenu et sa disponibilité conditionnent la qualité de la transmission.', [
        O(true, 'Il appartient au dossier médical du patient.', 'Son intégration au dossier médical assure conservation et accessibilité des décisions.'),
        O(true, 'Sa structure peut influencer la qualité des données recueillies.', 'Un support adapté aux pratiques locales favorise un recueil plus fiable et complet.'),
        O(false, 'Il peut rester indisponible le jour de l’acte si la consultation a été satisfaisante.', 'L’équipe qui réalise l’anesthésie doit pouvoir consulter l’évaluation et les consignes.'),
        O(false, 'Il sert uniquement à archiver les résultats biologiques prescrits.', 'Il rassemble aussi clinique, risques, traitements, information, consentement et stratégie.'),
        O(true, 'Les éléments utiles doivent être communiqués à l’opérateur.', 'La coordination avec le chirurgien relie le risque du terrain aux contraintes du geste.'),
      ]],
      ['Quels éléments appartiennent au cœur clinique de l’évaluation préopératoire ?', ['b00017', 'b00018', 'b00136'], 'L’histoire, l’examen et la réserve fonctionnelle précèdent les scores et orientent les examens susceptibles de modifier une décision.', [
        O(false, 'Un scanner thoraco-abdomino-pelvien systématique chez tout adulte.', 'L’imagerie sans question clinique ne constitue pas un dépistage préopératoire utile.'),
        O(false, 'Une batterie identique de tests quelle que soit la chirurgie.', 'Le retentissement de l’intervention participe directement au choix des explorations.'),
        O(true, 'Les complications et la tolérance des anesthésies antérieures.', 'Une expérience passée difficile modifie le risque, le choix technique et l’information.'),
        O(true, 'L’interrogatoire associé à un examen physique ciblé.', 'Ces deux temps cliniques fondent la stratification et la préparation du patient.'),
        O(false, 'La classe ASA utilisée seule pour autoriser ou refuser l’intervention.', 'ASA ne résume ni le risque chirurgical ni les voies aériennes ni les ressources.'),
      ]],
      ['Dans quelles situations un examen complémentaire préopératoire est-il justifié ?', ['b00018', 'b00055', 'b00137'], 'Un test est pertinent lorsqu’une anomalie plausible est recherchée et que son résultat peut changer optimisation, technique, surveillance ou calendrier.', [
        O(true, 'Une échocardiographie devant une valvulopathie symptomatique suspectée.', 'L’examen quantifie la lésion et permet de discuter un traitement avant la chirurgie.'),
        O(true, 'Une exploration de stress chez un patient Lee 2 peu fonctionnel avant chirurgie à risque.', 'Ce profil concentre la probabilité d’un résultat susceptible de modifier la conduite.'),
        O(false, 'Un ionogramme est inutile chez un insuffisant cardiaque dès lors que le diurétique est bien toléré cliniquement.', 'Le traitement diurétique expose à des anomalies hydroélectrolytiques qui peuvent rester silencieuses et modifier la conduite périopératoire.'),
        O(false, 'Un TCA et un TQ normaux pour remplacer toute anamnèse hémorragique.', 'Les tests usuels isolés sont moins sensibles qu’un interrogatoire standardisé bien mené.'),
        O(false, 'Une radiographie pulmonaire uniquement pour rassurer l’équipe médico-légale.', 'Un examen sans hypothèse ni conséquence clinique n’apporte aucune protection pertinente.'),
      ]],
    ]],
    ['Hémorragie, âge et nutrition', [
      ['Quels éléments appartiennent au questionnaire HEMSTOP ?', ['b00018', 'b00028', 'b00030', 'b00032'], 'HEMSTOP explore des saignements personnels provoqués ou spontanés, des situations gynéco-obstétricales et une histoire familiale documentée.', [
        O(true, 'Une hémorragie inhabituelle après extraction dentaire.', 'Le saignement dentaire excessif constitue une question autonome du questionnaire.'),
        O(false, 'La seule prise quotidienne d’un antihypertenseur.', 'Ce traitement ne renseigne pas directement une diathèse hémorragique personnelle.'),
        O(false, 'Une pneumonie survenue après une anesthésie ancienne.', 'Une complication respiratoire antérieure n’entre pas dans les domaines de HEMSTOP.'),
        O(true, 'Des règles ayant nécessité fer, contraception ou acide tranexamique.', 'Une ménorragie traitée compte parmi les critères spécifiques proposés aux femmes.'),
        O(true, 'Une maladie hémorragique documentée chez un membre de la famille.', 'HEMSTOP recherche une histoire familiale de trouble de la coagulation responsable de saignements.'),
      ]],
      ['Comment interpréter un score HEMSTOP égal à 2 ?', 'b00033', 'Deux réponses positives classent le patient à haut risque clinique ; un TCA ou un TQ normal ne suffit pas à invalider cette alerte.', [
        O(false, 'Il élimine pratiquement toute maladie hémorragique familiale.', 'Le seuil augmente au contraire la probabilité d’une diathèse nécessitant une exploration.'),
        O(true, 'Il correspond au seuil de haut risque hémorragique rapporté.', 'La valeur deux a été retenue pour identifier les patients nécessitant une vigilance accrue.'),
        O(true, 'Sa sensibilité est proche de 89,5 % dans la population étudiée.', 'Cette performance dépasse nettement celle d’un allongement isolé du TCA ou du TQ.'),
        O(true, 'Il justifie une évaluation hémorragique ciblée avant de fixer la stratégie invasive.', 'Le seuil signale un haut risque clinique et conduit à explorer puis anticiper le risque sans imposer une annulation définitive.'),
        O(true, 'Il repose sur l’anamnèse plutôt que sur un dépistage biologique uniforme.', 'Le questionnaire standardise des manifestations cliniques personnelles et familiales.'),
      ]],
      ['Chez un patient âgé, quelles données orientent l’évaluation de la fragilité ?', ['b00036', 'b00037'], 'La fragilité est multidimensionnelle : mobilité, autonomie, cognition et polymédication éclairent le risque mieux que l’âge civil isolé.', [
        O(true, 'La nécessité d’une canne pour les déplacements habituels.', 'Une aide à la marche révèle une réserve fonctionnelle réduite et un risque accru.'),
        O(false, 'L’âge chronologique utilisé comme unique critère de refus opératoire.', 'Le bénéfice d’une chirurgie peut rester important malgré un âge élevé et une fragilité.'),
        O(true, 'Les activités de la vie quotidienne et la mobilité réelle.', 'Le niveau d’autonomie renseigne la capacité à supporter puis récupérer de l’intervention.'),
        O(true, 'L’évaluation de la cognition et des capacités fonctionnelles quotidiennes.', 'Ces dimensions complètent la mobilité et la polymédication pour apprécier la fragilité au-delà de l’âge civil.'),
        O(true, 'La prise d’au moins cinq médicaments au long cours.', 'La polymédication fréquente augmente la complexité des interactions et des adaptations.'),
      ]],
      ['Quelles informations sont exactes au sujet du risque cognitif du patient âgé ?', ['b00036', 'b00037'], 'L’information doit être nuancée : le risque dépend du parcours global et une aggravation des fonctions supérieures est souvent limitée dans le temps.', [
        O(false, 'Une anesthésie générale entraîne toujours une démence définitive.', 'Aucune relation aussi déterministe ne peut être déduite de la seule technique choisie.'),
        O(true, 'La durée et l’ensemble de la prise en charge contribuent aux complications.', 'Le devenir ne dépend pas uniquement de l’opposition générale versus locorégionale.'),
        O(false, 'Des troubles cognitifs préexistants interdisent toute chirurgie oncologique.', 'La décision confronte risque, qualité de vie et bénéfice attendu de l’intervention.'),
        O(true, 'Une aggravation transitoire de moins de 90 jours doit être expliquée.', 'Cette temporalité aide le patient et l’entourage à anticiper la récupération.'),
        O(false, 'Le choix technique suffit à supprimer le besoin d’information de l’entourage.', 'Une explication adaptée reste nécessaire quelle que soit la modalité anesthésique.'),
      ]],
      ['Quels critères soutiennent le diagnostic préopératoire de dénutrition ?', 'b00039', 'Les seuils associent corpulence et dynamique pondérale ; leur présence déclenche une optimisation, surtout avant chirurgie oncologique.', [
        O(true, 'Un IMC à 18,2 kg/m² chez un adulte de 55 ans.', 'Avant soixante-dix ans, une valeur inférieure à 18,5 répond au critère clinique.'),
        O(true, 'Un IMC à 20,5 kg/m² chez une patiente de 76 ans.', 'Après soixante-dix ans, le seuil utilisé est inférieur à 21 kg/m².'),
        O(true, 'L’association de l’IMC et de l’évolution pondérale, sans exiger de biomarqueur nutritionnel.', 'Le diagnostic repose sur deux critères cliniques complémentaires : la corpulence et la perte de poids.'),
        O(true, 'Une perte involontaire de 10 % du poids habituel.', 'Une diminution de cet ordre constitue à elle seule un signal nutritionnel majeur.'),
        O(true, 'La préparation d’une chirurgie oncologique avec réserve nutritionnelle basse.', 'Ce contexte renforce l’intérêt d’un support nutritionnel avant l’intervention.'),
      ]],
    ]],
    ['Allergies et consommations', [
      ['Quelles données sont utiles pour clarifier une allergie médicamenteuse alléguée ?', ['b00041', 'b00042'], 'Une enquête allergologique exploitable distingue l’agent, la chronologie et les symptômes, sans créer de liens artificiels entre expositions iodées.', [
        O(true, 'La chronologie entre administration et manifestations.', 'Le délai d’apparition aide à distinguer une réaction immunologique d’un effet indésirable.'),
        O(false, 'La présence d’iode dans la molécule comme preuve suffisante.', 'L’iode ne définit pas un allergène commun aux produits de contraste et antiseptiques.'),
        O(false, 'Une simple histoire de nausées pour confirmer une anaphylaxie.', 'Des nausées isolées ne suffisent pas à documenter une réaction allergique grave.'),
        O(true, 'Les explorations réalisées après l’épisode et leurs résultats.', 'Des tests antérieurs peuvent confirmer un produit ou lever une étiquette injustifiée.'),
        O(false, 'L’allergie aux crustacés pour interdire automatiquement la polyvidone iodée.', 'Les protéines alimentaires et le composé antiseptique relèvent de mécanismes distincts.'),
      ]],
      ['Pourquoi faut-il réévaluer une étiquette d’allergie aux bêta-lactamines ?', 'b00041', 'Une fausse allergie réduit les options d’antibioprophylaxie et peut conduire à un agent moins efficace pour la chirurgie prévue.', [
        O(false, 'Parce que toute éruption ancienne prouve une allergie immédiate sévère.', 'La morphologie, le délai et les circonstances de l’éruption doivent être précisés.'),
        O(true, 'Parce qu’une alternative antibiotique peut être moins performante.', 'L’éviction injustifiée d’une bêta-lactamine peut augmenter les complications infectieuses.'),
        O(true, 'Parce que l’étiquette antibiotique doit être distinguée des autres déclencheurs périopératoires possibles.', 'Les curares restent des causes importantes de réaction au bloc ; clarifier une bêta-lactamine n’autorise pas à négliger les autres expositions.'),
        O(true, 'Parce que les allergies médicamenteuses sont souvent sous-documentées.', 'Un libellé imprécis doit conduire à reconstituer l’épisode et, si besoin, explorer.'),
        O(true, 'Parce qu’une clarification améliore le choix de l’antibioprophylaxie.', 'Identifier ce qui est toléré permet une prévention infectieuse mieux adaptée.'),
      ]],
      ['Quelles associations allergologiques sont erronées ?', ['b00042', 'b00043'], 'Crustacés, contraste iodé et polyvidone iodée constituent trois entités indépendantes ; l’une ne prédit pas les deux autres.', [
        O(false, 'Réaction aux crustacés documentée séparément d’une éventuelle réaction au contraste.', 'Cette distinction est exacte : les IgE alimentaires reconnaissent des protéines spécifiques.'),
        O(false, 'Réaction propre à la polyvidone iodée distincte de celle au contraste.', 'Chaque composé peut provoquer une réaction qui doit être documentée séparément.'),
        O(false, 'Réaction au contraste ne prédisant pas une allergie alimentaire aux fruits de mer.', 'Cette indépendance allergologique est exacte et ne constitue donc pas une association erronée.'),
        O(true, 'Tolérance des crustacés excluant tout risque de réaction à un produit de contraste.', 'Cette association est erronée : une allergie alimentaire ou son absence ne prédit pas la réponse à un produit de contraste.'),
        O(false, 'Allergie à la polyvidone considérée comme une réaction propre au composé antiseptique.', 'Cette formulation respecte l’indépendance entre polyvidone, contraste et allergènes alimentaires.'),
      ]],
      ['Quels bénéfices peut apporter un sevrage préparé avant chirurgie ?', ['b00044', 'b00045'], 'L’interrogatoire quantifie les consommations puis un programme anticipé réduit complications et syndromes de sevrage évitables.', [
        O(true, 'Une diminution des complications infectieuses dans certaines chirurgies.', 'Le sevrage tabagique préopératoire réduit notamment ce risque en orthopédie et plastique.'),
        O(false, 'La suppression de toute évaluation respiratoire chez un ancien fumeur.', 'L’arrêt du tabac n’efface pas une BPCO ni les autres déterminants pulmonaires.'),
        O(true, 'Une réduction du risque thrombotique sur des anastomoses vasculaires.', 'La préparation du sevrage participe à protéger les reconstructions vasculaires.'),
        O(false, 'L’arrêt brutal d’un alcool important la veille sans prévention.', 'Une dépendance impose d’anticiper substitution et prévention du syndrome de sevrage.'),
        O(false, 'Un bénéfice uniquement esthétique sans effet sur les complications.', 'Les enjeux sont infectieux, respiratoires, thrombotiques et organisationnels.'),
      ]],
      ['Quelles informations doivent être recueillies face à une consommation d’alcool importante ?', 'b00045', 'La quantité et la dépendance orientent une prévention planifiée ; l’objectif est d’éviter que l’hospitalisation déclenche un sevrage non contrôlé.', [
        O(true, 'Le niveau de consommation obtenu par un interrogatoire non jugeant.', 'La précision du récit conditionne l’estimation de dépendance et la préparation.'),
        O(true, 'L’histoire de consommation, les signes de dépendance et le risque de sevrage.', 'L’entretien caractérise les quantités, la chronologie et les manifestations cliniques qu’un marqueur biologique isolé ne peut résumer.'),
        O(true, 'Le risque de syndrome de sevrage pendant la période opératoire.', 'L’interruption imposée par l’hospitalisation peut provoquer une complication grave.'),
        O(false, 'Une consigne universelle d’arrêt brutal le matin de l’acte.', 'Le calendrier et une éventuelle substitution doivent être organisés à distance.'),
        O(true, 'Les possibilités de prévention ou de substitution avant l’admission.', 'Une stratégie anticipée sécurise le parcours et réduit les complications évitables.'),
      ]],
    ]],
    ['Évaluation cardiovasculaire', [
      ['Quelles données initiales orientent la stratification cardiaque avant une chirurgie non cardiaque ?', ['b00048', 'b00055'], 'La réserve fonctionnelle, les facteurs du score de Lee et le niveau de risque chirurgical déterminent la pertinence des examens supplémentaires.', [
        O(true, 'La capacité fonctionnelle estimée en METS.', 'La tolérance à l’effort renseigne la réserve cardiovasculaire avant de sélectionner les examens complémentaires.'),
        O(false, 'Le groupe sanguin comme indicateur direct d’ischémie myocardique.', 'Le groupe sanguin ne renseigne ni la fonction cardiaque ni la réserve à l’effort.'),
        O(true, 'La recherche de signes fonctionnels cardiovasculaires à l’interrogatoire.', 'Des symptômes orientent l’examen clinique et peuvent conduire à compléter l’évaluation.'),
        O(true, 'Le nombre de facteurs présents dans le score de Lee.', 'L’incidence des complications croît fortement avec l’accumulation de ces facteurs.'),
        O(true, 'Le niveau de risque de la chirurgie envisagée.', 'Le risque intermédiaire ou élevé du geste intervient avec le score de Lee et la réserve fonctionnelle dans la décision d’exploration.'),
      ]],
      ['Dans quel profil une imagerie cardiaque de stress est-elle la plus cohérente ?', 'b00055', 'Une exploration fonctionnelle avancée se réserve aux patients exposés dont la mauvaise réserve et le risque cumulé peuvent conduire à modifier le parcours.', [
        O(false, 'Patient jeune asymptomatique avant chirurgie cutanée mineure.', 'Le faible risque et la bonne réserve rendent improbable un bénéfice décisionnel.'),
        O(true, 'Chirurgie vasculaire avec score de Lee à 2 et faible capacité d’effort.', 'Les trois éléments correspondent au profil dans lequel une exploration peut être utile.'),
        O(false, 'Coloscopie simple chez un sportif sans facteur cardiovasculaire.', 'Ni le terrain ni le geste ne justifient une imagerie de stress préopératoire.'),
        O(false, 'Intervention à risque élevé lorsque le résultat ne modifierait ni traitement, ni surveillance, ni calendrier.', 'Une imagerie de stress n’est cohérente que si son résultat peut entraîner une décision thérapeutique ou organisationnelle.'),
        O(false, 'Tout patient hypertendu équilibré, indépendamment de l’acte.', 'Une hypertension stable isolée ne suffit pas à déclencher une exploration complexe.'),
      ]],
      ['Quelles situations justifient une échocardiographie préopératoire ?', 'b00055', 'L’échographie répond à une insuffisance cardiaque ou une valvulopathie non caractérisée, mal suivie ou symptomatique.', [
        O(true, 'Un souffle nouveau associé à une dyspnée d’effort.', 'L’association fait suspecter une valvulopathie symptomatique nécessitant une évaluation.'),
        O(false, 'Une valvulopathie connue, stable, documentée et suivie récemment sans symptôme.', 'Une répétition sans changement clinique est peu susceptible de modifier la prise en charge.'),
        O(true, 'Une insuffisance cardiaque connue dont le suivi est ancien.', 'La fonction et l’équilibre doivent être réévalués avant de fixer la stratégie.'),
        O(false, 'Une simple demande de certificat opératoire sans question cardiaque.', 'Une échographie ne doit pas répondre à une logique administrative générale.'),
        O(true, 'Une valvulopathie symptomatique pour discuter un traitement préalable.', 'La sévérité peut conduire à optimiser ou traiter la lésion avant la chirurgie.'),
      ]],
      ['Que doit contenir une demande utile d’avis cardiologique ?', ['b00056', 'b00057', 'b00058'], 'L’anesthésiste formule une question périopératoire précise et fournit les données qui permettent au cardiologue de proposer une modification concrète.', [
        O(true, 'L’indication et le niveau de risque de l’intervention prévue.', 'Le retentissement chirurgical conditionne la tolérance cardiovasculaire recherchée.'),
        O(true, 'La capacité d’effort actuelle décrite avec des activités concrètes.', 'Cette donnée aide à interpréter la nécessité et la faisabilité d’un test fonctionnel.'),
        O(true, 'Une question périopératoire ciblée et la décision susceptible d’en découler.', 'Le cardiologue doit connaître le problème à résoudre, le risque de l’acte et les options que son avis peut modifier.'),
        O(true, 'Les traitements cardiovasculaires en cours et leurs doses.', 'La conduite médicamenteuse peut faire partie des propositions d’optimisation.'),
        O(true, 'La raison exacte pour laquelle un test d’effort est envisagé.', 'Le cardiologue doit connaître la décision que le résultat est susceptible de modifier.'),
      ]],
      ['Quelles limites caractérisent l’électrocardiogramme d’effort préopératoire ?', 'b00055', 'Le test possède une bonne valeur prédictive négative mais reste limité par ses performances et par l’incapacité de certains patients à fournir l’effort requis.', [
        O(false, 'Il garde une excellente sensibilité chez tous les patients vasculaires.', 'Ses performances diagnostiques sont seulement modérées et dépendent de l’effort obtenu.'),
        O(true, 'Il peut être impossible chez un patient orthopédique très limité.', 'Une incapacité locomotrice empêche d’atteindre la charge nécessaire à l’interprétation.'),
        O(true, 'Il ne remplace pas l’échocardiographie devant un souffle valvulaire symptomatique.', 'L’épreuve d’effort n’apporte pas l’analyse anatomique et fonctionnelle nécessaire à la caractérisation d’une valvulopathie.'),
        O(true, 'Il demande d’approcher 85 % de la fréquence cardiaque maximale théorique.', 'Sans niveau d’effort suffisant, la portée diagnostique de l’épreuve diminue.'),
        O(true, 'Sa valeur prédictive positive reste insuffisante pour conclure seul.', 'Un résultat positif doit être replacé dans la probabilité clinique et la stratégie globale.'),
      ]],
    ]],
    ['Respiration et voies aériennes', [
      ['Quels facteurs traduisent une BPCO sévère avant chirurgie ?', 'b00060', 'La sévérité ne repose pas sur un seul chiffre : retentissement quotidien, poussée récente et réduction du VEMS sont complémentaires.', [
        O(true, 'Un handicap respiratoire important dans la vie courante.', 'Le retentissement fonctionnel quotidien participe directement à la définition clinique.'),
        O(false, 'Une toux isolée de deux jours sans antécédent pulmonaire.', 'Ce symptôme aigu ne suffit pas à classer une bronchopathie chronique sévère.'),
        O(false, 'Une hospitalisation récente pour exacerbation ne traduit plus aucune sévérité après la sortie.', 'Une poussée ayant nécessité une admission reste un marqueur de maladie sévère ou mal stabilisée en période préopératoire.'),
        O(false, 'Un VEMS mesuré à 105 % de la valeur théorique.', 'Une fonction supérieure à la valeur attendue ne correspond pas au seuil de sévérité.'),
        O(false, 'L’absence complète de gêne avec activité physique normale.', 'Une réserve conservée est peu compatible avec le handicap décrit dans la forme sévère.'),
      ]],
      ['Quelles mesures optimisent un patient BPCO bronchorrhéique avant l’acte ?', 'b00060', 'L’objectif est d’obtenir une maladie stable, sans infection, en combinant traitement ciblé, kinésithérapie et réduction des expositions.', [
        O(false, 'Programmer l’intervention pendant une exacerbation fébrile non traitée.', 'Une infection active et une poussée évolutive augmentent les complications postopératoires.'),
        O(true, 'Organiser une kinésithérapie respiratoire préopératoire.', 'La bronchorrhée est une situation où le drainage et la préparation sont particulièrement utiles.'),
        O(true, 'Conseiller et accompagner l’arrêt du tabac.', 'Le sevrage contribue à stabiliser le terrain et à réduire les complications.'),
        O(true, 'Réévaluer les traitements bronchodilatateurs à partir des symptômes et des données respiratoires utiles.', 'L’optimisation associe une mesure pertinente à une adaptation clinique ; elle ne consiste pas à répéter des EFR sans conséquence.'),
        O(true, 'Discuter antibiothérapie ou courte corticothérapie selon l’état.', 'Une poussée ou une infection peut justifier une intervention pharmacologique ciblée.'),
      ]],
      ['Quelles conséquences pratiques entraîne un STOP-BANG élevé ?', ['b00065', 'b00068'], 'Le dépistage du SAOS modifie la préparation des voies aériennes, le choix analgésique et le niveau de surveillance après l’intervention.', [
        O(true, 'Anticiper une ventilation au masque et une intubation plus difficiles.', 'Le SAOS augmente la probabilité de difficultés de contrôle des voies aériennes.'),
        O(false, 'Supprimer tout monitorage dès la sortie de salle d’intervention.', 'Le risque respiratoire impose au contraire une surveillance prolongée et adaptée.'),
        O(true, 'Prévoir une ventilation non invasive si la situation le nécessite.', 'Une assistance postopératoire peut être préparée avant l’admission du patient.'),
        O(false, 'Favoriser les benzodiazépines pour améliorer le tonus pharyngé.', 'Ces sédatifs aggravent l’obstruction et la dépression respiratoire.'),
        O(true, 'Construire une analgésie limitant l’exposition aux opioïdes.', 'L’épargne morphinique réduit le risque de dépression ventilatoire chez le patient apnéique.'),
      ]],
      ['Quels critères favorisent une ventilation difficile au masque facial ?', 'b00071', 'Le risque s’accroît avec l’âge, la morphologie faciale ou corporelle et des indices de collapsus nocturne.', [
        O(false, 'Un âge de 25 ans avec dentition complète et absence de ronflement.', 'Ce profil ne rassemble aucun des facteurs cliniques principaux décrits.'),
        O(true, 'Un indice de masse corporelle supérieur à 26 kg/m².', 'La surcharge corporelle figure parmi les prédicteurs de ventilation difficile.'),
        O(false, 'Une taille de chaussure supérieure à 44.', 'Cette mesure n’apporte aucune information sur l’étanchéité ou la perméabilité des voies aériennes.'),
        O(true, 'Une édentation complète.', 'L’absence de dents peut rendre l’application du masque et son étanchéité moins efficaces.'),
        O(true, 'La présence d’une barbe associée à des ronflements.', 'Ces deux éléments gênent le masque et signalent un risque d’obstruction pharyngée.'),
      ]],
      ['Que faut-il évaluer pour anticiper une intubation difficile ?', ['b00070', 'b00071'], 'La prédiction combine antécédent, examen oropharyngé, dimensions cervicales et buccales ainsi que vulnérabilité dentaire.', [
        O(true, 'Un compte rendu antérieur mentionnant une difficulté d’intubation.', 'Une expérience documentée est l’information la plus directement transposable à la stratégie.'),
        O(true, 'La classe de Mallampati observée correctement.', 'L’exposition oropharyngée apporte un élément du faisceau prédictif.'),
        O(true, 'La distance thyromentonnière et les autres paramètres anatomiques d’accès aux voies aériennes.', 'L’anticipation d’une intubation difficile repose sur un examen dédié de l’ouverture buccale, de la mobilité et des repères cervicofaciaux.'),
        O(true, 'La distance thyromentonnière et l’ouverture de bouche.', 'Ces dimensions apprécient l’espace disponible pour la laryngoscopie et l’intubation.'),
        O(false, 'La créatininémie pour mesurer directement la mobilité cervicale.', 'La fonction rénale ne renseigne pas l’anatomie nécessaire au contrôle des voies aériennes.'),
      ]],
    ]],
    ['Information et scores', [
      ['Quelles pratiques améliorent la compréhension de l’information anesthésique ?', ['b00073', 'b00074', 'b00075'], 'Une information orale ajustée, soutenue par des outils choisis, respecte le niveau de compréhension et le souhait de détail de chaque patient.', [
        O(false, 'Employer uniquement le vocabulaire technique sans demander au patient de reformuler.', 'Des mots usuels et une vérification active de la compréhension sont nécessaires pour détecter les malentendus.'),
        O(true, 'Proposer un support écrit pour revoir les messages après l’entretien.', 'Un document aide la mémorisation sans remplacer l’échange personnalisé.'),
        O(false, 'Imposer tous les détails techniques même si le patient refuse de les entendre.', 'Un média interactif permet de respecter la quantité d’information souhaitée.'),
        O(false, 'Limiter l’entretien à la remise d’un formulaire standard signé.', 'Une signature isolée ne démontre ni compréhension ni consentement éclairé.'),
        O(true, 'Inviter un accompagnant lorsque le patient le souhaite.', 'Un proche peut soutenir la mémorisation dans un contexte émotionnel difficile.'),
      ]],
      ['Quelles associations avec la classe ASA sont décrites ?', ['b00081', 'b00082', 'b00083'], 'ASA corrèle avec plusieurs résultats de parcours mais sa subjectivité et son périmètre imposent de l’associer à d’autres dimensions du risque.', [
        O(true, 'Une augmentation globale du risque périopératoire lorsque la classe s’élève.', 'La classe ASA est associée au pronostic global, sans prédire le type anatomique exact d’une difficulté de voies aériennes.'),
        O(true, 'Une relation avec la morbidité et la mortalité périopératoires.', 'La gravité de l’état physique accompagne une fréquence croissante d’événements.'),
        O(true, 'Une association avec le besoin d’hospitalisation en soins critiques.', 'Les classes élevées sont liées à une utilisation plus fréquente de ressources intensives.'),
        O(true, 'Une variabilité de classement entre évaluateurs.', 'La part de jugement clinique explique une reproductibilité imparfaite et doit être connue lors de l’interprétation.'),
        O(true, 'Une relation avec la durée de séjour hospitalier.', 'Un terrain plus sévère s’accompagne souvent d’un parcours postopératoire plus long.'),
      ]],
      ['Quelles limites empêchent d’utiliser la classe ASA seule ?', ['b00083', 'b00084'], 'La classe décrit surtout le terrain ; l’intervention, les voies aériennes, la structure et le jugement partagé restent indispensables.', [
        O(true, 'Son attribution comporte une part de subjectivité.', 'Deux évaluateurs peuvent classer différemment un même patient sans exemples communs.'),
        O(false, 'Elle inclut précisément toutes les difficultés techniques de la chirurgie.', 'Le type et la complexité de l’intervention ne sont pas intégrés dans la classe.'),
        O(true, 'Elle ignore les particularités de la structure de soins.', 'Les ressources disponibles modifient pourtant la capacité à prendre en charge un risque.'),
        O(true, 'Elle n’intègre aucun paramètre anatomique dédié aux voies aériennes.', 'La classe ASA ne mesure ni ouverture buccale, ni mobilité cervicale, ni distance thyromentonnière.'),
        O(true, 'Elle ne remplace pas l’évaluation du risque chirurgical.', 'Terrain et retentissement de l’acte doivent être combinés pour planifier les moyens.'),
      ]],
      ['Quels usages pertinents peut avoir un score de risque chirurgical ?', ['b00085', 'b00088'], 'Un score structure la communication et aide la planification, mais son résultat doit être adapté au contexte local et aux événements réellement actionnables.', [
        O(true, 'Standardiser la description de la gravité entre professionnels.', 'Un vocabulaire commun améliore la transmission entre anesthésistes et opérateurs.'),
        O(false, 'Remplacer toute appréciation clinique chez un patient atteint d’une maladie rare.', 'Une situation absente du modèle exige un raisonnement individualisé supplémentaire.'),
        O(false, 'Déterminer seul la destination postopératoire sans tenir compte du terrain ni des ressources disponibles.', 'Un score soutient la planification, mais doit être intégré au contexte clinique et organisationnel avant de réserver un niveau de soins.'),
        O(false, 'Garantir le devenir individuel à partir d’une probabilité de groupe.', 'Une incidence populationnelle ne prédit jamais avec certitude l’issue d’un patient.'),
        O(false, 'Rendre inutiles les particularités logistiques de l’établissement.', 'La disponibilité des lits, techniques et personnels modifie la traduction pratique du risque.'),
      ]],
      ['Quels critères de jugement sont particulièrement actionnables en préopératoire ?', ['b00088', 'b00129'], 'Des événements définis reliés à une décision clinique sont plus utiles qu’une catégorie globale et imprécise de morbidité.', [
        O(false, 'Une notion indifférenciée de malaise postopératoire.', 'Un terme flou ne guide ni prévention précise ni choix de surveillance.'),
        O(false, 'Le risque de réintubation n’est pas actionnable avant l’intervention puisqu’il survient en postopératoire.', 'Son anticipation modifie la stratégie de voies aériennes, la surveillance respiratoire et le niveau de soins à prévoir.'),
        O(true, 'La survenue d’un événement vasculaire neurologique ou cardiaque.', 'Ces complications graves peuvent être reliées à une stratification et une prévention.'),
        O(false, 'La couleur de la chambre attribuée au patient.', 'Cet élément organisationnel n’est pas un résultat clinique du parcours.'),
        O(true, 'Une infection sévère documentée.', 'Un événement infectieux défini permet d’évaluer l’efficacité d’actions préventives.'),
      ]],
    ]],
    ['Médicaments et transfusion', [
      ['Quelles conduites sont cohérentes pour les traitements cardiovasculaires chroniques ?', ['b00096', 'b00099', 'b00100'], 'La continuité protège du rebond pour plusieurs classes ; chaque décision reste liée à l’indication, au terrain et au moment de reprise.', [
        O(true, 'Poursuivre un bêtabloquant pris depuis plusieurs mois.', 'Le consensus évite une interruption brutale susceptible de provoquer un rebond.'),
        O(true, 'Maintenir une statine puis la réintroduire rapidement après l’acte.', 'La protection cardiovasculaire ne justifie pas une suspension périopératoire prolongée.'),
        O(true, 'Introduire progressivement un bêtabloquant au moins un mois avant l’acte lorsqu’une indication est retenue.', 'Ce délai permet la titration et l’évaluation de la tolérance, contrairement à une forte dose débutée la veille.'),
        O(true, 'Continuer un inhibiteur calcique prescrit pour un angor.', 'Le maintien est recommandé pour prévenir déséquilibre et effet rebond.'),
        O(true, 'Individualiser la poursuite ou l’arrêt selon la classe, l’indication et la situation hémodynamique.', 'Les bénéfices du maintien et les risques périopératoires diffèrent entre bêtabloquants, IEC, ARA II et autres traitements.'),
      ]],
      ['Quelles données guideront la conduite d’un IEC ou d’un ARA II ?', ['b00097', 'b00098'], 'Le risque d’hypotension sévère doit être confronté à l’indication, à la fonction rénale et à la stratégie anesthésique.', [
        O(false, 'La couleur du comprimé comme marqueur de risque hémodynamique.', 'L’apparence galénique ne renseigne pas les effets sur le système rénine–angiotensine.'),
        O(false, 'La fonction rénale peut être ignorée si la pression artérielle est normale en consultation.', 'Une altération rénale modifie la tolérance des IEC ou ARA II et doit participer à la décision, même sans hypotension initiale.'),
        O(false, 'L’idée qu’une rachianesthésie élimine toute hypotension sous traitement.', 'Une hypotension sévère est également décrite avec une technique neuraxiale.'),
        O(true, 'Le risque de vasoplégie et d’hypotension pendant l’anesthésie.', 'Le blocage hormonal peut limiter les mécanismes compensateurs hémodynamiques.'),
        O(true, 'Une consigne écrite d’arrêt ou de maintien adaptée au contexte.', 'L’ambiguïté médicamenteuse le jour de l’acte crée un risque évitable.'),
      ]],
      ['Quelles affirmations sont justes au sujet des diurétiques ?', 'b00101', 'Le maintien est surtout discuté dans l’insuffisance cardiaque, avec contrôle biologique ; la reprise précoce dépend de la volémie et du risque rénal.', [
        O(true, 'Leur poursuite est particulièrement envisagée dans l’insuffisance cardiaque.', 'L’indication cardiaque peut justifier de conserver l’équilibre obtenu avant l’acte.'),
        O(false, 'Aucun ionogramme n’est utile lorsque le patient paraît stable.', 'Des anomalies électrolytiques peuvent être silencieuses et influencer l’anesthésie.'),
        O(true, 'Un contrôle de l’ionogramme sanguin avant l’intervention.', 'La recherche d’un trouble électrolytique est nécessaire même lorsque le patient paraît stable.'),
        O(true, 'Leur prescription postopératoire reconnue comme facteur de risque d’insuffisance rénale.', 'Une reprise trop précoce peut compromettre la fonction rénale pendant la phase de récupération.'),
        O(true, 'Le report de leur reprise immédiate lorsqu’un risque d’hypovolémie persiste.', 'Une volémie insuffisante renforce le danger rénal lié à la réintroduction du diurétique.'),
      ]],
      ['Quelles conduites concernent les médicaments neurologiques ou psychiatriques ?', 'b00107', 'La stratégie évite les interruptions dangereuses tout en anticipant les interactions propres à certaines classes et au terrain cardiovasculaire.', [
        O(true, 'Discuter l’iproniazide avec le psychiatre pour une éventuelle substitution.', 'Un IMAO ancien nécessite une préparation concertée plutôt qu’un arrêt improvisé.'),
        O(true, 'Envisager l’arrêt d’un imipraminique chez un patient cardiaque.', 'L’interaction avec les anesthésiques généraux renforce le risque cardiovasculaire.'),
        O(true, 'Tracer le potentiel d’interaction des inhibiteurs de recapture de la sérotonine.', 'Cette information doit parvenir à l’équipe qui prescrira les médicaments périopératoires.'),
        O(false, 'Omettre la dose matinale d’un antiparkinsonien par principe.', 'La continuité stricte des prises prévient une décompensation motrice aiguë.'),
        O(false, 'Suspendre tous les psychotropes sans échange avec le prescripteur.', 'Les conduites varient selon la molécule, le risque d’interaction et celui du sevrage.'),
      ]],
      ['Quelles mesures sont adaptées devant une anémie avant chirurgie carcinologique ?', 'b00112', 'L’épargne sanguine commence avant l’acte par une correction de l’anémie et une stratégie transfusionnelle compatible avec les réserves individuelles.', [
        O(false, 'Différer le fer injectable jusqu’après la chirurgie malgré une anémie ferriprive et un délai court.', 'En chirurgie carcinologique, le fer parentéral permet une optimisation préopératoire plus rapide lorsque le contexte le justifie.'),
        O(false, 'Choisir le même seuil transfusionnel pour tous les patients.', 'Le seuil dépend de la réserve cardiovasculaire et du risque propre à la chirurgie.'),
        O(true, 'Corriger parallèlement une insuffisance nutritionnelle.', 'La nutrition soutient l’érythropoïèse et la récupération avant l’intervention oncologique.'),
        O(false, 'Appliquer une stratégie toujours plus restrictive sans limite.', 'Une restriction excessive augmente les complications cardiaques en chirurgie non cardiaque.'),
        O(true, 'Informer spécifiquement si une transfusion devient probable.', 'Le risque documenté nécessite un échange dédié et le recueil du consentement.'),
      ]],
    ]],
    ['Organisation du parcours', [
      ['Quelles conditions encadrent une consultation préopératoire infirmière ?', ['b00114', 'b00117'], 'La filière paramédicale concerne des situations simples, reste supervisée médicalement et doit réorienter tout patient hors critères.', [
        O(false, 'Une chirurgie majeure chez un patient multicomorbide afin d’économiser du temps.', 'Ce profil nécessite l’expertise médicale que la filière cherche précisément à préserver.'),
        O(true, 'Une intervention à faible retentissement chez un patient sans comorbidité.', 'L’association d’un terrain simple et d’un acte mineur correspond aux critères étudiés.'),
        O(true, 'Une validation médicale par l’anesthésiste-réanimateur des données et décisions recueillies.', 'La filière infirmière peut structurer l’évaluation des patients sélectionnés, mais la responsabilité et la validation restent médicales.'),
        O(true, 'Une vérification a posteriori des évaluations par le médecin.', 'La supervision confirme les dossiers conformes et reprend les anomalies identifiées.'),
        O(false, 'L’interdiction de réadresser un patient devenu symptomatique.', 'Tout élément nouveau hors protocole doit conduire à une consultation médicale.'),
      ]],
      ['Quels éléments contribuent à la qualité perçue d’une consultation dédiée ?', 'b00119', 'L’entretien médical s’inscrit dans une expérience complète où accès, accueil, locaux et attente influencent satisfaction et efficience.', [
        O(true, 'Un temps d’attente maîtrisé.', 'La fluidité du parcours contribue fortement à la satisfaction exprimée par les patients.'),
        O(true, 'Des locaux adaptés à la rotation et à la confidentialité.', 'Un environnement dédié peut réduire coûts et délais par rapport au lit d’hospitalisation.'),
        O(false, 'L’absence d’accès au dossier afin de préserver la spontanéité de l’entretien.', 'Le dossier et l’ordonnance sont indispensables à une décision fiable.'),
        O(false, 'Un accueil indifférent dès lors que le médecin est compétent.', 'La qualité de réception participe à l’évaluation globale du parcours par le patient.'),
        O(false, 'La consultation peut être jugée de qualité sans connaître l’intervention ni les modalités d’hospitalisation.', 'Le risque chirurgical, la stratégie et les ressources ne peuvent être correctement définis sans ces informations.'),
      ]],
      ['Quelles exigences rendent une consultation délocalisée acceptable ?', ['b00122', 'b00123'], 'La délocalisation repose sur un accord explicite, un cahier des charges partagé et une visite préanesthésique renforcée.', [
        O(false, 'L’accord du patient devient facultatif lorsque la consultation délocalisée lui évite un trajet.', 'Le consentement doit inclure avantages et contraintes, notamment le risque de report ou d’annulation.'),
        O(false, 'L’absence de communication entre les deux établissements.', 'Les techniques, modalités d’hospitalisation et risques doivent être transmis au consultant.'),
        O(false, 'L’établissement opérateur peut renoncer à tout cahier des charges si l’équipe distante est expérimentée.', 'Un cadre commun reste nécessaire pour harmoniser le recueil, la transmission et les critères de réévaluation.'),
        O(false, 'La suppression de la visite préanesthésique le jour de l’intervention.', 'Ce contact direct est particulièrement important pour vérifier et rectifier les informations.'),
        O(true, 'Une information sur la possibilité d’un report si une donnée manque.', 'Le patient doit consentir en connaissant cette limite organisationnelle réelle.'),
      ]],
      ['Quelles ressources sont nécessaires à une téléconsultation préopératoire fiable ?', 'b00124', 'La distance ne dispense ni du dossier ni d’informations objectives : communication audiovisuelle, médicaments et constantes constituent le socle.', [
        O(true, 'Une transmission simultanée du son et de la vidéo.', 'L’entretien et l’observation nécessitent un échange audiovisuel de qualité suffisante.'),
        O(true, 'L’accès au dossier médical et à l’ordonnance actuelle.', 'Antécédents et traitements conditionnent la stratification et les consignes.'),
        O(true, 'Une température mesurée avec un dispositif disponible sur le lieu de téléconsultation.', 'Les constantes doivent être objectivées et transmises pour conserver une évaluation à distance exploitable.'),
        O(true, 'La mesure de la pression artérielle, du pouls et de la SpO₂.', 'Ces paramètres complètent l’évaluation à distance du terrain cardiorespiratoire.'),
        O(true, 'Un dispositif organisé selon un protocole et sous responsabilité médicale.', 'La téléconsultation ne se réduit pas à une application : elle exige professionnels, accès aux données et circuit de décision.'),
      ]],
      ['Quelles conditions permettent une consultation unique pour plusieurs actes ?', 'b00125', 'Une évaluation commune suppose faible retentissement, stabilité du patient et de la stratégie, accord des équipes et consentement informé.', [
        O(true, 'Des procédures répétées dont le retentissement physiologique reste faible.', 'La faible agressivité des actes est une condition nécessaire de cette organisation.'),
        O(true, 'L’absence d’escalade prévisible vers des gestes plus invasifs ou une prise en charge plus complexe.', 'Une évaluation commune n’est acceptable que si le faible retentissement et la stabilité de la stratégie se maintiennent entre les séances.'),
        O(true, 'Une prise en charge anesthésique qui ne se complexifie pas au fil du temps.', 'La stratégie doit rester comparable pour que l’évaluation initiale demeure pertinente.'),
        O(true, 'L’acceptation de cette pratique par toutes les équipes concernées.', 'La continuité dépend d’un fonctionnement partagé entre opérateurs et anesthésistes.'),
        O(true, 'Une explication spécifique suivie du consentement du patient.', 'Le patient doit comprendre le cadre et les motifs qui imposeraient une réévaluation.'),
      ]],
    ]],
  ];
  return definitions.map(([title, questions], index) => ({
    label: `QCM ${index + 1} · ${title}`,
    vignette: '',
    allowed_voies: ['interne'],
    questions: questions.map(([stem, sources, correction, options]) => qcm(stem, sources, correction, options)),
  }));
}

const DP_QCM = [
  {
    title: 'Préparation d’une chirurgie thyroïdienne',
    vignette: 'Une femme de 57 ans doit être opérée d’un goitre multinodulaire compressif. Elle est autonome, hypertendue équilibrée et n’a jamais présenté de complication anesthésique. La consultation a lieu quatre semaines avant l’acte. Le dossier chirurgical précise une thyroïdectomie totale avec hospitalisation conventionnelle, mais l’ordonnance habituelle et le compte rendu d’une anesthésie ancienne ne sont pas encore disponibles.',
    steps: [
      [null, 'Quelles données faut-il réunir avant de conclure la stratégie ?', ['b00017', 'b00119', 'b00120'], 'L’évaluation doit relier antécédents anesthésiques, traitements actuels et caractéristiques exactes de la chirurgie.', [
        O(false, 'Les antécédents anesthésiques peuvent être ignorés lorsque l’examen clinique actuel est normal.', 'Une intubation difficile, une réaction ou une complication passée peut modifier la technique et les moyens de secours malgré un examen rassurant.'),
        O(false, 'Un bilan biologique identique à celui de tous les patients du service.', 'Les examens sont choisis après l’interrogatoire et selon le retentissement de l’acte.'),
        O(true, 'L’ordonnance détaillée avec les prises quotidiennes.', 'La conduite périopératoire ne peut être écrite sans connaître molécules et indications.'),
        O(true, 'Les préférences du patient parmi les options anesthésiques médicalement acceptables.', 'La stratégie finale associe les données du terrain et du geste à une décision comprise et consentie.'),
        O(true, 'Les particularités opératoires et les modalités d’hospitalisation.', 'Le geste exact détermine risque, surveillance et préparation des ressources.'),
      ]],
      ['Le compte rendu ancien mentionne une intubation difficile avec vidéolaryngoscope.', 'Quelles conséquences cette information doit-elle avoir ?', 'b00071', 'Un antécédent documenté de difficulté des voies aériennes devient un déterminant majeur du plan anesthésique actuel.', [
        O(true, 'Préparer une stratégie d’intubation adaptée et du matériel de recours.', 'La difficulté déjà rencontrée rend nécessaire une anticipation explicite.'),
        O(false, 'Considérer l’épisode comme sans valeur parce qu’il date de dix ans.', 'L’anatomie et les conditions peuvent persister ; le document reste hautement informatif.'),
        O(false, 'Un score de Mallampati normal suffit à annuler l’antécédent d’intubation difficile documenté.', 'Le nouvel examen complète l’information, mais ne fait pas disparaître une difficulté antérieure qui impose une stratégie de recours.'),
        O(false, 'Remplacer l’évaluation des voies aériennes par un score HEMSTOP.', 'HEMSTOP concerne le risque hémorragique et n’évalue pas l’intubation.'),
        O(false, 'Programmer une induction sans possibilité de ventilation de secours.', 'Une difficulté prévisible impose au contraire plusieurs solutions préparées.'),
      ]],
      ['L’examen retrouve une ouverture buccale limitée et une fragilité dentaire antérieure.', 'Quels éléments doivent être tracés et expliqués ?', 'b00071', 'La vulnérabilité dentaire et les critères anatomiques participent à la préparation technique comme à l’information loyale.', [
        O(false, 'La certitude qu’aucun traumatisme dentaire ne peut survenir.', 'Une préparation réduit le risque mais ne permet pas de garantir une absence de lésion.'),
        O(true, 'L’état dentaire précis avant toute instrumentation.', 'La description initiale distingue une lésion préexistante d’une complication nouvelle.'),
        O(true, 'Le risque accru lié à l’accès buccal limité.', 'Une petite ouverture complique l’introduction et la manipulation du matériel.'),
        O(false, 'Une indication automatique d’annulation définitive de la chirurgie.', 'Le risque conduit à adapter la technique et les moyens, non à interdire systématiquement.'),
        O(true, 'La stratégie prévue pour contrôler les voies aériennes.', 'Le patient doit comprendre les modalités rendues nécessaires par son anatomie.'),
      ]],
      ['La patiente signale des ecchymoses faciles mais aucun saignement chirurgical ou dentaire.', 'Quelle démarche hémorragique est appropriée ?', ['b00018', 'b00033'], 'L’histoire doit être standardisée avant de décider si une exploration biologique ou spécialisée est nécessaire.', [
        O(true, 'Administrer le questionnaire HEMSTOP complet.', 'Une manifestation isolée doit être replacée parmi les autres domaines hémorragiques.'),
        O(false, 'Prescrire automatiquement TCA et TQ puis ignorer l’anamnèse.', 'Les tests usuels isolés possèdent une faible sensibilité pour ce dépistage.'),
        O(true, 'Rechercher des antécédents familiaux de maladie de la coagulation.', 'L’histoire des proches complète les saignements personnels dans le score.'),
        O(true, 'Interpréter l’ecchymose comme une réponse parmi plusieurs domaines du score.', 'Le haut risque repose sur au moins deux réponses positives ; une manifestation isolée doit donc être complétée par l’anamnèse standardisée.'),
        O(false, 'Confondre cette plainte avec une allergie aux produits iodés.', 'Risque hémorragique et hypersensibilité relèvent d’évaluations différentes.'),
      ]],
      ['Le score HEMSTOP final est égal à 1 et l’examen ne montre aucun signe hémorragique.', 'Quelle décision est cohérente pour les examens d’hémostase ?', 'b00018', 'Un faible signal clinique sans autre anomalie ne justifie pas mécaniquement un dépistage biologique systématique.', [
        O(false, 'Demander un bilan complet uniquement pour protéger juridiquement l’équipe.', 'Un test non indiqué n’apporte aucune protection médicolégale pertinente.'),
        O(false, 'Prescrire systématiquement TCA et TQ pour confirmer le faible risque malgré l’absence d’autre indication.', 'Un score inférieur au seuil et un examen sans signe hémorragique ne justifient pas un dépistage biologique uniforme.'),
        O(false, 'Reporter l’intervention de six mois malgré un score inférieur au seuil.', 'Aucune donnée ne soutient un délai aussi long ou une exclusion opératoire.'),
        O(false, 'Prévoir une transfusion prophylactique avant l’arrivée au bloc.', 'La transfusion sans anémie ni hémorragie attendue expose à un risque injustifié.'),
        O(true, 'Conserver la synthèse de l’anamnèse dans le dossier.', 'La traçabilité explicite le raisonnement qui a conduit à ne pas explorer davantage.'),
      ]],
      ['La patiente demande pourquoi l’entretien oral est maintenu malgré la brochure reçue.', 'Quels arguments lui répondre ?', ['b00073', 'b00074'], 'Le document soutient la mémoire, tandis que l’échange adapte les risques et vérifie réellement compréhension et consentement.', [
        O(false, 'L’entretien oral doit reprendre mot pour mot les informations générales de la brochure.', 'L’échange sert précisément à adapter l’information aux voies aériennes, aux risques et aux choix propres à la patiente.'),
        O(false, 'Les questions de la patiente doivent être reportées après la signature du consentement.', 'Le consentement n’est éclairé que si les incertitudes sont discutées avant la décision et la signature.'),
        O(false, 'La brochure n’a aucune utilité après la consultation.', 'Le support écrit aide à reprendre les messages lorsque l’émotion gêne la mémorisation.'),
        O(true, 'La reformulation vérifie ce qu’elle a réellement compris.', 'Des termes apparemment courants peuvent être interprétés différemment par le patient.'),
        O(false, 'La signature du document suffit à prouver une compréhension complète.', 'Une signature ne remplace ni l’explication individualisée ni sa vérification.'),
      ]],
      ['La veille de l’intervention, aucune modification clinique n’est rapportée.', 'Quel est le rôle de la visite préanesthésique ?', ['b00123', 'b00138'], 'La visite confirme l’actualité des informations et la faisabilité du plan transmis à l’équipe du jour.', [
        O(false, 'Reprendre toute la consultation sans utiliser le dossier disponible.', 'La visite actualise une évaluation antérieure ; elle ne doit pas ignorer les données déjà recueillies.'),
        O(false, 'La déclaration d’une stabilité suffit sans actualiser les symptômes ni les traitements.', 'La visite vérifie activement l’absence d’infection, de nouveau traitement ou de symptôme susceptible de modifier la stratégie.'),
        O(false, 'Supprimer la préparation de l’intubation puisque la patiente va bien.', 'La stabilité clinique ne fait pas disparaître l’antécédent documenté de difficulté.'),
        O(true, 'Confirmer que le matériel et les moyens prévus sont accessibles.', 'Une stratégie n’est sûre que si les ressources nécessaires sont présentes au moment de l’acte.'),
        O(true, 'S’assurer que le dossier complet accompagne la patiente.', 'La transmission écrite permet à l’équipe réalisatrice d’appliquer les décisions anticipées.'),
      ]],
    ],
  },
  {
    title: 'Arthroplastie et risque cardiorespiratoire',
    vignette: 'Un homme de 71 ans doit bénéficier d’une arthroplastie d’épaule. Il est obèse, diabétique et décrit une dyspnée pour deux étages. Il ronfle, mais ne connaît pas de pause respiratoire. Un infarctus ancien est traité médicalement et son suivi cardiologique date de trois ans. La chirurgie est de risque intermédiaire et la consultation se déroule cinq semaines avant l’admission.',
    steps: [
      [null, 'Quels axes initiaux doivent structurer l’évaluation ?', ['b00048', 'b00065', 'b00136'], 'Ce terrain impose d’apprécier réserve cardiaque, probabilité de SAOS et capacité respiratoire avant de choisir des examens.', [
        O(true, 'Quantifier la tolérance à l’effort par des activités concrètes.', 'La capacité fonctionnelle guide la stratification cardiovasculaire.'),
        O(true, 'Calculer un STOP-BANG à partir des huit critères cliniques.', 'Obésité et ronflement justifient un dépistage standardisé du SAOS.'),
        O(false, 'Prescrire d’emblée toutes les imageries cardiaques disponibles.', 'La sélection d’un test avancé dépend du score de Lee et de la réserve.'),
        O(true, 'Intégrer l’infarctus ancien à la stratification malgré l’absence actuelle de symptôme.', 'Cet antécédent participe au score cardiaque, à l’analyse de la réserve et aux décisions d’optimisation.'),
        O(true, 'Examiner les voies aériennes et l’état dentaire.', 'Un SAOS possible augmente la probabilité de difficultés de ventilation ou d’intubation.'),
      ]],
      ['Le score de Lee est égal à 2 et la capacité fonctionnelle est inférieure à 4 METS.', 'Quelle stratégie d’exploration est défendable ?', 'b00055', 'L’association risque chirurgical, Lee élevé et mauvaise réserve rend pertinente une exploration si elle modifie la conduite.', [
        O(false, 'Aucun examen ne peut être envisagé chez un patient incapable de courir.', 'Une imagerie pharmacologique de stress reste possible lorsque l’effort est limité.'),
        O(true, 'Discuter une échocardiographie de stress ou une scintigraphie myocardique.', 'Ces examens sont proposés dans ce profil sélectionné à risque intermédiaire.'),
        O(true, 'Formuler la décision attendue avant de demander le test.', 'Une exploration sans conséquence thérapeutique prévisible n’améliore pas le parcours.'),
        O(true, 'Préférer une modalité pharmacologique si l’incapacité fonctionnelle empêche un effort interprétable.', 'Une échocardiographie de stress ou une scintigraphie peut explorer le risque sans exiger l’atteinte d’une charge d’effort suffisante.'),
        O(false, 'Annuler définitivement l’arthroplastie sur la seule valeur du score.', 'Le score déclenche une stratification et une optimisation, pas une interdiction automatique.'),
      ]],
      ['Un cardiologue est sollicité pour décider si une imagerie de stress changerait la prise en charge.', 'Quelles données doivent figurer dans le courrier ?', ['b00056', 'b00057'], 'La demande utile décrit l’acte, l’effort, les traitements et la question afin d’obtenir une réponse périopératoire actionnable.', [
        O(true, 'Le risque intermédiaire de l’arthroplastie prévue.', 'Le cardiologue interprète la réserve en fonction de la contrainte opératoire.'),
        O(false, 'Une demande limitée à la formule « avis avant opération ».', 'Cette formulation n’indique ni problème clinique ni décision à prendre.'),
        O(true, 'La capacité inférieure à quatre METS.', 'La mauvaise tolérance à l’effort constitue un déterminant majeur du choix du test.'),
        O(true, 'La liste des médicaments cardiovasculaires actuels.', 'Une optimisation ou une adaptation peut faire partie de l’avis spécialisé.'),
        O(false, 'Le souhait d’obtenir une garantie de risque nul.', 'Aucun spécialiste ne peut transformer une probabilité en certitude individuelle.'),
      ]],
      ['Le STOP-BANG est finalement coté à 4.', 'Quelles adaptations périopératoires faut-il anticiper ?', ['b00065', 'b00068'], 'Un score supérieur au seuil sensible conduit à préparer voies aériennes, surveillance respiratoire et analgésie économe en dépresseurs.', [
        O(false, 'Un STOP-BANG à 4 ne modifie pas la surveillance si l’intervention est programmée en ambulatoire.', 'Le risque d’obstruction persiste après l’acte et peut imposer une surveillance prolongée ou une adaptation du parcours ambulatoire.'),
        O(false, 'Une prémédication systématique par benzodiazépine à forte dose.', 'La sédation peut aggraver le collapsus pharyngé et la dépression ventilatoire.'),
        O(true, 'La disponibilité d’une ventilation non invasive.', 'Une assistance préparée peut être nécessaire au réveil ou pendant le sommeil.'),
        O(true, 'Une stratégie analgésique limitant les opioïdes.', 'L’épargne morphinique réduit l’exposition à une dépression respiratoire postopératoire.'),
        O(false, 'La suppression de l’évaluation des voies aériennes puisque le score suffit.', 'STOP-BANG signale le SAOS mais ne décrit pas seul l’anatomie d’intubation.'),
      ]],
      ['L’examen retrouve une barbe, un IMC à 32 kg/m² et un âge supérieur à 55 ans.', 'Que suggère cette association pour la ventilation au masque ?', 'b00071', 'Plusieurs facteurs reconnus s’additionnent et justifient une préparation spécifique de la ventilation faciale.', [
        O(false, 'Une ventilation nécessairement facile grâce à la barbe.', 'La pilosité peut empêcher une bonne étanchéité du masque.'),
        O(true, 'Un risque accru de ventilation difficile.', 'Âge, surcharge corporelle et barbe font partie des prédicteurs cliniques.'),
        O(true, 'La nécessité d’envisager des moyens d’améliorer l’étanchéité.', 'Une stratégie pratique peut compenser les difficultés liées à la morphologie.'),
        O(false, 'Une impossibilité certaine d’oxygéner le patient.', 'Les facteurs augmentent une probabilité sans prédire un échec absolu.'),
        O(false, 'Une indication automatique de trachéotomie avant l’arthroplastie.', 'Une telle mesure disproportionnée n’est pas déduite de ces critères.'),
      ]],
      ['L’imagerie de stress ne montre pas d’ischémie et le traitement est optimisé.', 'Quelle interprétation est raisonnable ?', ['b00055', 'b00058'], 'Un résultat rassurant soutient la poursuite après équilibre du terrain, tout en maintenant les précautions respiratoires identifiées.', [
        O(false, 'Un test de stress négatif suffit à maintenir l’intervention sans réexaminer l’état clinique ni les autres risques.', 'La décision finale intègre la stabilité cardiaque, le risque respiratoire, les traitements et l’organisation prévue ; un examen isolé ne suffit pas.'),
        O(false, 'Le risque périopératoire devient mathématiquement nul.', 'Un test négatif réduit une probabilité sans supprimer les autres complications possibles.'),
        O(false, 'Le STOP-BANG élevé peut être retiré du dossier.', 'L’évaluation cardiaque n’annule pas le risque respiratoire indépendant.'),
        O(true, 'Les mesures prévues pour le SAOS restent nécessaires.', 'La surveillance et l’analgésie dépendent du risque apnéique, non du test myocardique.'),
        O(false, 'Tous les traitements doivent être suspendus le matin sans consigne.', 'Chaque classe exige une décision individualisée écrite avant l’admission.'),
      ]],
      ['Le patient est informé de la stratégie et reformule correctement les risques.', 'Quels éléments clôturent valablement la consultation ?', ['b00134', 'b00138'], 'La décision partagée devient opérationnelle lorsqu’elle est consentie, tracée, transmise et disponible pour l’équipe.', [
        O(true, 'Le recueil de son consentement après les explications.', 'La compréhension vérifiée permet une participation réelle au projet thérapeutique.'),
        O(true, 'La communication des conclusions à l’opérateur.', 'Le chirurgien doit connaître les conditions, optimisations et moyens planifiés.'),
        O(true, 'La conservation des résultats, des décisions et de l’information dans le dossier.', 'La trace écrite permet à l’équipe du jour d’appliquer la stratégie discutée et d’en comprendre le raisonnement.'),
        O(true, 'L’inscription des adaptations respiratoires dans le dossier.', 'L’équipe du jour doit retrouver surveillance, analgésie et assistance ventilatoire prévues.'),
        O(false, 'Une nouvelle imagerie cardiaque systématique la veille.', 'Sans changement clinique, la répétition immédiate n’apporterait aucune décision nouvelle.'),
      ]],
    ],
  },
  {
    title: 'Bronchopathie avant résection digestive',
    vignette: 'Une femme de 66 ans doit subir une résection digestive pour tumeur. Elle fume encore quinze cigarettes par jour, présente une BPCO et produit des expectorations abondantes. Une exacerbation traitée en ville s’est terminée dix jours plus tôt. Elle se déplace lentement mais sans aide. Son VEMS ancien était à 68 % de la valeur théorique et la date opératoire est prévue dans trois semaines.',
    steps: [
      [null, 'Quelles données cliniques font craindre des complications respiratoires ?', 'b00060', 'La maladie chronique, le tabagisme, la bronchorrhée et la poussée récente pèsent davantage que la répétition isolée d’un test.', [
        O(true, 'Une exacerbation respiratoire très récente.', 'Une maladie insuffisamment stabilisée augmente les complications pulmonaires postopératoires.'),
        O(false, 'Une bronchorrhée importante est sans conséquence respiratoire tant qu’il n’existe pas de fièvre.', 'Les sécrétions favorisent encombrement et complications postopératoires même en l’absence de nouvelle infection fébrile.'),
        O(false, 'Le sexe féminin utilisé seul comme facteur de BPCO sévère.', 'Le risque dépend du retentissement et de la fonction respiratoire, pas du sexe isolé.'),
        O(false, 'Un tabagisme ancien définitivement sevré utilisé seul pour conclure à une complication respiratoire imminente.', 'Le risque actuel dépend surtout de la maladie respiratoire, de sa stabilité et des expositions persistantes.'),
        O(false, 'Une marche habituelle conservée interprétée comme la preuve d’une réserve respiratoire très faible.', 'Une tolérance fonctionnelle préservée ne permet pas d’affirmer à elle seule une réserve respiratoire limitée.'),
      ]],
      ['L’auscultation retrouve des ronchi diffus, sans fièvre ni signe de nouvelle infection.', 'Quelle préparation est particulièrement indiquée ?', 'b00060', 'La bronchorrhée sans infection active bénéficie d’un drainage, d’une optimisation bronchodilatatrice et d’une préhabilitation ciblée.', [
        O(false, 'Aucune action puisque l’intervention n’a pas encore commencé.', 'Le délai préopératoire existe précisément pour corriger les facteurs modifiables.'),
        O(true, 'Une kinésithérapie respiratoire avant l’hospitalisation.', 'Le drainage des sécrétions est particulièrement pertinent dans la bronchorrhée.'),
        O(true, 'Une réévaluation du traitement respiratoire habituel.', 'La stabilité clinique nécessite une thérapeutique adaptée et correctement suivie.'),
        O(false, 'Une transfusion préventive pour fluidifier les sécrétions.', 'La transfusion n’a aucune place dans le traitement d’un encombrement bronchique.'),
        O(true, 'Un parcours de préhabilitation tenant compte de ses capacités.', 'Une préparation fonctionnelle peut améliorer la réserve avant la chirurgie majeure.'),
      ]],
      ['La patiente accepte de débuter un sevrage tabagique accompagné.', 'Quels bénéfices peuvent être discutés ?', 'b00045', 'Un sevrage préparé réduit des complications infectieuses ou thrombotiques et participe à la stabilisation pulmonaire.', [
        O(false, 'Trois semaines de sevrage suppriment tout risque infectieux lié au tabagisme antérieur.', 'L’arrêt réduit progressivement plusieurs facteurs de risque, mais ne transforme pas une patiente BPCO en sujet sans risque.'),
        O(false, 'La restauration garantie d’un VEMS normal en trois semaines.', 'La fonction chronique ne se normalise pas nécessairement malgré un bénéfice du sevrage.'),
        O(true, 'Une diminution de l’exposition respiratoire pendant la préparation.', 'Chaque période sans fumée limite irritation et sécrétions avant l’acte.'),
        O(false, 'La possibilité d’omettre toute surveillance pulmonaire postopératoire.', 'Le terrain BPCO conserve un risque même après l’arrêt du tabac.'),
        O(false, 'L’annulation automatique de la chirurgie si une cigarette est fumée.', 'Le sevrage est fortement conseillé et accompagné, pas utilisé comme sanction isolée.'),
      ]],
      ['Un contrôle retrouve un VEMS à 690 mL malgré une amélioration clinique.', 'Quelle conclusion est la plus juste ?', 'b00064', 'Une fonction très amputée oblige à renforcer l’analyse bénéfices–risques et les moyens, sans constituer seule une interdiction.', [
        O(false, 'Toute anesthésie est formellement contre-indiquée sous 1 000 mL.', 'Des patients avec un VEMS inférieur peuvent être pris en charge sous stratégie adaptée.'),
        O(true, 'La décision doit confronter bénéfice oncologique et risque respiratoire.', 'Le caractère carcinologique donne un poids important au bénéfice attendu.'),
        O(false, 'La valeur du VEMS permet à elle seule de choisir entre anesthésie générale et locorégionale.', 'Le choix technique confronte le geste, la stabilité clinique, les voies aériennes, la fonction respiratoire et les possibilités de surveillance.'),
        O(false, 'Le chiffre suffit à décider sans examiner la stabilité clinique.', 'Infection, symptômes, handicap et optimisation doivent accompagner l’interprétation.'),
        O(true, 'Une surveillance postopératoire adaptée doit être planifiée.', 'La faible réserve augmente les conséquences d’une complication respiratoire.'),
      ]],
      ['Le bilan sanguin montre une anémie ferriprive à 9,8 g/dL.', 'Quelles mesures préopératoires sont pertinentes ?', 'b00112', 'Avant chirurgie oncologique, la correction de l’anémie associe fer injectable, nutrition et stratégie transfusionnelle personnalisée.', [
        O(true, 'Administrer du fer injectable selon l’évaluation étiologique.', 'Le fer parentéral constitue la base proposée pour corriger cette anémie préopératoire.'),
        O(true, 'Évaluer et soutenir l’état nutritionnel.', 'Nutrition et érythropoïèse doivent être optimisées ensemble avant la résection.'),
        O(false, 'Fixer un seuil transfusionnel identique pour toute la population.', 'La réserve cardiorespiratoire et la chirurgie déterminent le seuil individuel.'),
        O(false, 'Ignorer l’anémie jusqu’au saignement peropératoire.', 'L’anticipation réduit l’exposition transfusionnelle et les complications évitables.'),
        O(true, 'Informer si la probabilité de transfusion devient significative.', 'Un risque documenté exige une information spécifique et le consentement.'),
      ]],
      ['La patiente souhaite connaître toutes les options mais retient mal les chiffres annoncés.', 'Comment adapter l’information ?', ['b00074', 'b00075'], 'L’entretien oral reste central et peut être renforcé par des supports choisis, une reformulation et un accompagnant.', [
        O(true, 'Donner des explications orales avec des mots non techniques.', 'Un langage accessible réduit les incompréhensions entre termes médicaux et usuels.'),
        O(true, 'Proposer un document écrit qu’elle pourra relire.', 'Le support compense en partie les difficultés de mémorisation liées à l’émotion.'),
        O(true, 'Présenter loyalement les risques respiratoires en les reliant aux mesures de prévention prévues.', 'Une information compréhensible n’occulte pas le risque ; elle explique sa probabilité et les moyens concrets destinés à le réduire.'),
        O(true, 'Vérifier la compréhension par une reformulation personnelle.', 'Faire expliquer la stratégie révèle les points encore mal compris.'),
        O(true, 'Accueillir un proche si elle souhaite son aide.', 'La présence d’un accompagnant peut soutenir mémoire et décision sans la remplacer.'),
      ]],
      ['Après trois semaines, elle est afébrile, moins encombrée et le plan de soins critiques est réservé.', 'Pourquoi la consultation anticipée a-t-elle été utile ?', 'b00127', 'Le délai a permis sevrage, kinésithérapie, correction de l’anémie et organisation des ressources avant le jour opératoire.', [
        O(true, 'Plusieurs risques modifiables ont reçu une intervention concrète.', 'Respiration, tabac et hémoglobine ont été travaillés avant l’exposition chirurgicale.'),
        O(false, 'Elle a transformé une chirurgie oncologique en acte sans aucun risque.', 'L’optimisation réduit certains risques sans abolir la fragilité respiratoire.'),
        O(false, 'La réservation d’un lit de soins critiques suffit à elle seule à démontrer l’utilité de l’anticipation.', 'La consultation a permis à la fois optimisation respiratoire, sevrage, correction de l’anémie, information et planification des ressources postopératoires.'),
        O(false, 'Elle rend inutile la visite préanesthésique finale.', 'L’état doit encore être actualisé juste avant l’intervention.'),
        O(true, 'Un report tardif pour anomalie connue devient moins probable.', 'Traiter les problèmes à distance évite de les découvrir sans marge d’action.'),
      ]],
    ],
  },
  {
    title: 'Médicaments avant chirurgie urologique',
    vignette: 'Un homme de 69 ans atteint de maladie de Parkinson doit subir une résection urologique programmée. Il prend lévodopa à heures fixes, sertraline, aspirine, ginkgo et un inhibiteur calcique pour angor. Il rapporte une aggravation motrice rapide lorsqu’une dose antiparkinsonienne est retardée. Le risque hémorragique de l’acte est discuté et la consultation se tient dix-huit jours avant la chirurgie.',
    steps: [
      [null, 'Quels traitements nécessitent immédiatement une consigne individualisée ?', ['b00100', 'b00104', 'b00107', 'b00109'], 'Chaque classe pose un risque distinct : rebond angineux, thrombose ou hémorragie, décompensation motrice et interaction végétale.', [
        O(true, 'La lévodopa dont les horaires doivent être préservés.', 'Une omission peut provoquer une aggravation motrice périopératoire importante.'),
        O(true, 'L’aspirine en confrontant thrombose et saignement.', 'La décision dépend du risque de l’arrêt autant que de celui du maintien.'),
        O(true, 'Le ginkgo en raison de son effet plaquettaire.', 'Cette phytothérapie non anodine a été associée à des accidents hémorragiques.'),
        O(true, 'Le caractère programmé permet d’écrire avant l’admission une conduite précise pour chaque traitement à risque.', 'Ce délai doit servir à coordonner horaires, arrêts, poursuites et reprises plutôt qu’à reporter la décision au jour de l’acte.'),
        O(true, 'L’inhibiteur calcique prescrit pour l’angor.', 'Son indication favorise la poursuite afin d’éviter un déséquilibre ischémique.'),
      ]],
      ['Le neurologue confirme la nécessité d’éviter toute interruption de lévodopa.', 'Comment organiser les prises autour de l’anesthésie ?', 'b00107', 'Le traitement antiparkinsonien est maintenu jusqu’au matin et peut être administré par sonde si l’acte se prolonge.', [
        O(true, 'Donner la dose habituelle le soir précédant l’intervention.', 'La continuité commence dès la période de jeûne et d’hospitalisation.'),
        O(true, 'Administrer la prise matinale prévue avec la conduite adaptée au jeûne.', 'L’omission systématique du matin est contraire à la priorité neurologique.'),
        O(true, 'Éviter toute suspension prolongée de lévodopa autour de l’intervention.', 'Une interruption de quarante-huit heures exposerait à une décompensation motrice dangereuse et compliquerait la récupération.'),
        O(true, 'Prévoir une administration par sonde gastrique si nécessaire pendant l’acte.', 'Cette voie permet de respecter les horaires lorsque la voie orale devient indisponible.'),
        O(true, 'Reprendre la voie habituelle dès qu’elle est disponible, sans attendre le retour complet de la marche.', 'La continuité dopaminergique participe au contrôle moteur nécessaire à la mobilisation postopératoire.'),
      ]],
      ['Le patient prend de la sertraline depuis plusieurs années sans complication.', 'Quelle conduite documentaire est adaptée ?', 'b00107', 'Un ISRS peut être maintenu, mais son potentiel d’interaction doit être signalé à l’équipe périopératoire.', [
        O(false, 'L’arrêter brutalement sans prévenir le prescripteur.', 'Une suspension improvisée expose à un déséquilibre psychiatrique et à un sevrage.'),
        O(true, 'Mentionner le risque d’interaction dans le compte rendu.', 'La traçabilité oriente les prescriptions anesthésiques et postopératoires.'),
        O(false, 'Le remplacer automatiquement par un imipraminique chez ce patient.', 'Une substitution n’est pas indiquée et pourrait ajouter un risque cardiovasculaire.'),
        O(false, 'La stabilité sous sertraline dispense de rechercher les autres médicaments susceptibles d’interagir.', 'Le risque périopératoire peut résulter d’une association ; l’ordonnance complète doit être analysée même si ce traitement est ancien et bien toléré.'),
        O(false, 'Considérer tout antidépresseur comme une contre-indication à l’anesthésie.', 'La plupart des traitements sont compatibles avec une stratégie correctement anticipée.'),
      ]],
      ['Le ginkgo a été pris quotidiennement jusqu’à la consultation.', 'Quelle consigne faut-il donner ?', 'b00109', 'Le ginkgo inhibe la fonction plaquettaire ; l’arrêt dix jours avant laisse ici une fenêtre suffisante.', [
        O(true, 'Interrompre le ginkgo dix jours avant la chirurgie.', 'Ce délai est recommandé pour limiter les interactions et le risque hémorragique.'),
        O(false, 'Le poursuivre parce qu’un produit végétal est toujours inoffensif.', 'L’origine végétale n’empêche ni effet pharmacologique ni complication au bloc.'),
        O(false, 'La date de dernière prise devient inutile à tracer dès que la consigne d’arrêt a été remise.', 'L’équipe du jour doit pouvoir vérifier sur le dossier que la fenêtre de dix jours a effectivement été respectée.'),
        O(true, 'Noter la date de dernière prise pour vérifier le respect de la fenêtre d’arrêt.', 'La traçabilité permet à l’équipe du jour de confirmer les dix jours sans exposition.'),
        O(true, 'Éviter toute substitution spontanée par une autre phytothérapie.', 'Un produit végétal de remplacement peut lui aussi modifier l’hémostase ou la sédation.'),
      ]],
      ['Le chirurgien estime le risque hémorragique significatif sous aspirine, tandis que le cardiologue craint la thrombose à l’arrêt.', 'Quel processus décisionnel est attendu ?', ['b00103', 'b00104', 'b00105'], 'La décision antithrombotique doit être collégiale, fondée sur les deux risques et inscrite dans une procédure locale consensuelle.', [
        O(false, 'Le risque hémorragique doit être considéré seul puisque le chirurgien réalise le geste.', 'La décision confronte obligatoirement la gravité du saignement au risque thrombotique de l’interruption de l’aspirine.'),
        O(true, 'Associer opérateur, anesthésiste et prescripteur pertinent.', 'Les conséquences du saignement et de la thrombose relèvent de compétences complémentaires.'),
        O(false, 'Laisser le patient choisir seul sans information médicale.', 'Sa préférence compte après une présentation loyale des risques et des options.'),
        O(false, 'Le consensus oral suffit sans inscrire la poursuite, l’arrêt ou le relais dans le dossier.', 'Une consigne non tracée peut être interprétée différemment par le patient et l’équipe le jour de l’acte.'),
        O(false, 'Adopter la même stratégie pour toutes les chirurgies urologiques.', 'Le risque varie avec le geste, l’indication de l’aspirine et le terrain.'),
      ]],
      ['L’inhibiteur calcique contrôle efficacement l’angor sans effet indésirable.', 'Quelle conduite faut-il retenir ?', 'b00100', 'L’indication angineuse et le risque de rebond plaident pour maintenir l’inhibiteur calcique.', [
        O(false, 'Le suspendre une semaine uniquement parce qu’une anesthésie est prévue.', 'Aucun bénéfice n’est attendu d’un arrêt systématique dans cette indication.'),
        O(false, 'Omettre l’inhibiteur calcique pendant toute la période préopératoire puis le reprendre après l’acte.', 'Cette interruption sans indication expose à perdre l’équilibre coronarien obtenu ; la poursuite est recommandée dans ce contexte stable.'),
        O(false, 'Doubler la dose le matin sans mesure tensionnelle.', 'Une majoration non justifiée pourrait provoquer des effets hémodynamiques.'),
        O(true, 'Reporter clairement cette consigne sur la feuille médicamenteuse.', 'La continuité entre consultation et admission dépend d’une instruction sans ambiguïté.'),
        O(false, 'Le remplacer par un dérivé nitré transdermique chauffé au bloc.', 'Cette substitution n’est pas indiquée et l’absorption du patch serait imprévisible.'),
      ]],
      ['Le jour de l’acte, les dernières prises concordent avec les consignes et le patient reste stable.', 'Quelles vérifications finales sont essentielles ?', ['b00123', 'b00138'], 'La visite finale confirme état clinique, médicaments réellement pris et disponibilité de la stratégie partagée.', [
        O(false, 'L’horaire de la dernière lévodopa est sans importance si une dose a été prise la veille.', 'La durée d’interruption doit être minimisée ; l’heure exacte conditionne donc la programmation de la prochaine administration.'),
        O(true, 'Vérifier la date d’arrêt du ginkgo et la conduite de l’aspirine.', 'Les deux éléments modifient l’appréciation hémorragique au moment du geste.'),
        O(false, 'Ignorer le dossier puisque les consignes ont été données oralement.', 'L’équipe réalisatrice doit disposer de la trace validée et des avis associés.'),
        O(true, 'Confirmer que l’inhibiteur calcique a été pris selon la prescription.', 'La poursuite protège l’équilibre de l’angor pendant la période de stress.'),
        O(false, 'Retarder toute prise antiparkinsonienne jusqu’au lendemain.', 'Cette interruption contredirait le plan et exposerait à une aggravation motrice.'),
      ]],
    ],
  },
  {
    title: 'Allergie et anémie avant chirurgie mammaire',
    vignette: 'Une femme de 48 ans doit bénéficier d’une mastectomie pour cancer. Elle rapporte une « allergie à la pénicilline » après des troubles digestifs dans l’enfance, une réaction au produit de contraste et une consommation quotidienne de valériane. Elle a perdu 8 kg en trois mois. L’hémoglobine est à 9,2 g/dL et une transfusion pourrait devenir nécessaire selon le saignement opératoire.',
    steps: [
      [null, 'Quelles priorités doivent être clarifiées dès cette consultation ?', ['b00039', 'b00041', 'b00109', 'b00112'], 'Allergie, nutrition, phytothérapie et anémie sont quatre risques modifiables qui influencent directement la préparation.', [
        O(true, 'Reconstituer la réaction attribuée à la pénicilline.', 'Des troubles digestifs anciens ne prouvent pas une hypersensibilité véritable.'),
        O(true, 'Quantifier la perte pondérale et calculer l’IMC.', 'La dynamique du poids participe au diagnostic de dénutrition.'),
        O(true, 'Identifier les prises végétales souvent absentes de l’ordonnance.', 'La valériane possède un effet sédatif pertinent pour l’anesthésie.'),
        O(false, 'Reporter toute discussion transfusionnelle après l’intervention.', 'Un risque prévisible doit être expliqué et anticipé avant l’acte.'),
        O(true, 'Distinguer l’allergie aux crustacés, la réaction au contraste et la tolérance de la polyvidone iodée.', 'Ces expositions correspondent à des entités distinctes qui doivent être documentées séparément sans lien automatique.'),
      ]],
      ['Le dossier ancien confirme uniquement des nausées sous amoxicilline, sans éruption ni détresse respiratoire.', 'Quelles conséquences tirer de cette précision ?', 'b00041', 'Une intolérance digestive isolée ne justifie pas forcément d’écarter une bêta-lactamine efficace.', [
        O(false, 'Classer la patiente comme anaphylactique certaine.', 'Aucun signe immédiat cutané, respiratoire ou circulatoire n’est décrit.'),
        O(true, 'Réévaluer l’étiquette avant de choisir l’antibioprophylaxie.', 'Une fausse allergie peut imposer un antibiotique alternatif moins efficace.'),
        O(true, 'Tracer les manifestations réellement survenues.', 'Une description factuelle évite la transmission d’un diagnostic excessif.'),
        O(false, 'Interdire tous les antibiotiques de manière définitive.', 'L’épisode ne permet pas une éviction aussi large et dangereuse.'),
        O(false, 'Déduire une allergie aux curares de ces nausées.', 'Aucune réactivité croisée n’est suggérée entre ces produits.'),
      ]],
      ['La réaction au contraste était un urticaire, tandis que la polyvidone iodée est bien tolérée.', 'Quelles affirmations sont correctes ?', ['b00042', 'b00043'], 'Une réaction au contraste n’implique ni allergie à la polyvidone ni hypersensibilité alimentaire universelle.', [
        O(false, 'La polyvidone iodée doit être contre-indiquée malgré sa bonne tolérance personnelle.', 'Une réaction au contraste ne prédit pas une hypersensibilité à cet antiseptique ; l’historique propre de chaque produit doit être conservé.'),
        O(false, 'Tout aliment contenant de l’iode doit être supprimé.', 'L’iode n’est pas l’allergène commun invoqué par ce type de réaction.'),
        O(false, 'L’urticaire au contraste peut être fusionné dans le dossier avec une étiquette générique d’allergie à l’iode.', 'Le produit exact, la chronologie et les manifestations doivent rester documentés sans créer une association allergologique artificielle.'),
        O(false, 'L’urticaire prouve une allergie à tous les antiseptiques.', 'Une réaction à un produit ne s’étend pas à des familles sans lien.'),
        O(true, 'Les trois entités ne se prédisent pas mutuellement.', 'Crustacés, contraste et polyvidone correspondent à des mécanismes distincts.'),
      ]],
      ['La valériane est encore prise chaque soir à dix-huit jours de la chirurgie.', 'Quelle conduite est adaptée ?', 'b00109', 'L’effet sédatif de la valériane justifie l’arrêt de toute phytothérapie dix jours avant.', [
        O(false, 'Attendre les deux derniers jours avant la chirurgie pour interrompre la valériane.', 'La fenêtre recommandée est de dix jours ; à dix-huit jours de l’acte, l’arrêt doit donc survenir au plus tard huit jours plus tard.'),
        O(false, 'La maintenir jusqu’à l’induction parce qu’elle réduit l’anxiété.', 'Son effet peut s’ajouter de façon imprévisible aux médicaments anesthésiques.'),
        O(true, 'Inscrire la date de dernière prise dans le dossier.', 'La traçabilité confirme que le délai d’arrêt a été respecté.'),
        O(false, 'La remplacer par du ginkgo pour éviter la sédation.', 'Le ginkgo expose à une inhibition plaquettaire et à des saignements.'),
        O(false, 'Prévoir un antagoniste spécifique systématique au réveil.', 'Aucun antidote prophylactique ne remplace l’interruption anticipée.'),
      ]],
      ['La perte de poids atteint 11 % et l’IMC est à 18,1 kg/m².', 'Quelles mesures deviennent prioritaires ?', ['b00039', 'b00112'], 'La dénutrition et l’anémie avant chirurgie carcinologique justifient une optimisation nutritionnelle et martiale coordonnée.', [
        O(true, 'Mettre en place un support nutritionnel préopératoire.', 'Deux critères cliniques convergent vers une réserve nutritionnelle insuffisante.'),
        O(true, 'Administrer du fer injectable si l’étiologie le confirme.', 'Le fer parentéral constitue une base de la correction de l’anémie.'),
        O(true, 'Corriger l’anémie avant qu’un saignement opératoire ne majore le déficit.', 'L’anticipation par bilan étiologique et fer injectable si indiqué réduit le risque transfusionnel et améliore les réserves.'),
        O(true, 'Interpréter la perte involontaire de 11 % comme un critère de dénutrition.', 'Associée à un IMC bas, cette dynamique pondérale traduit une diminution des réserves qui nécessite une optimisation nutritionnelle.'),
        O(true, 'Coordonner le calendrier opératoire avec la préparation.', 'Le délai doit être utilisé sans méconnaître le bénéfice oncologique de la chirurgie.'),
      ]],
      ['La patiente refuse toute transfusion pour des raisons personnelles.', 'Quels éléments doivent structurer la décision ?', 'b00112', 'Un refus informé exige d’évaluer le risque, d’optimiser l’anémie et de définir avec l’équipe une stratégie compatible.', [
        O(true, 'Vérifier qu’elle comprend les conséquences possibles de son refus.', 'Une décision autonome suppose une information loyale sur bénéfices et risques.'),
        O(true, 'Renforcer les mesures d’épargne sanguine préopératoires.', 'La correction de l’anémie devient encore plus déterminante.'),
        O(true, 'Informer l’opérateur du refus afin de construire une stratégie d’épargne sanguine partagée.', 'Le chirurgien doit intégrer cette contrainte à la technique, à l’hémostase et à la balance bénéfice-risque de l’intervention.'),
        O(true, 'Tracer précisément la décision et les alternatives acceptées.', 'Une documentation claire guide l’équipe si un saignement survient.'),
        O(true, 'Respecter le refus après avoir vérifié sa compréhension et discuté les alternatives acceptables.', 'Une décision autonome et tracée guide l’équipe ; aucune transfusion programmée ne peut être imposée contre ce consentement.'),
      ]],
      ['Après optimisation, l’hémoglobine remonte et le plan d’épargne sanguine est accepté.', 'Quelles conditions permettent de maintenir l’intervention ?', ['b00134', 'b00138'], 'La chirurgie peut suivre si bénéfices et risques ont été partagés, les alternatives préparées et les décisions rendues accessibles.', [
        O(true, 'Une stratégie écrite adaptée à ses réserves actuelles.', 'Le seuil et les mesures doivent correspondre à la patiente, non à une règle uniforme.'),
        O(true, 'L’information de l’opérateur sur le refus transfusionnel.', 'Le chirurgien doit intégrer cette contrainte au geste et à l’hémostase.'),
        O(false, 'La disparition supposée de tout risque parce que l’hémoglobine augmente.', 'L’amélioration réduit le danger sans supprimer la possibilité de saignement.'),
        O(true, 'La disponibilité du dossier complet le jour de l’acte.', 'L’équipe doit retrouver consentement, alternatives et conduites anticipées.'),
        O(true, 'Le maintien d’une surveillance postopératoire adaptée au terrain oncologique et nutritionnel.', 'L’amélioration de l’hémoglobine ne supprime ni le risque de saignement ni le besoin de suivre la récupération.'),
      ]],
    ],
  },
  {
    title: 'Téléconsultation avant chirurgie ophtalmologique',
    vignette: 'Un homme de 82 ans vivant en résidence médicalisée doit être opéré d’un glaucome dans un centre situé à deux heures. Il marche avec un déambulateur, prend huit médicaments et entend difficilement au téléphone. Une téléconsultation vidéo est organisée avec une infirmière et sa fille. Le centre opérateur a transmis le type d’anesthésie habituel et les conditions d’accueil ambulatoire.',
    steps: [
      [null, 'Quelles conditions rendent cette téléconsultation acceptable ?', ['b00123', 'b00124'], 'Le déplacement difficile justifie la distance si communication, dossier, mesures et cadre de l’établissement opérateur sont disponibles.', [
        O(true, 'Une liaison vidéo et audio permettant un véritable entretien.', 'Le son seul serait insuffisant pour cette personne malentendante.'),
        O(false, 'La liste des traitements peut reposer sur la seule mémoire du patient lorsque la téléconsultation est assistée par une infirmière.', 'La polymédication exige l’accès au dossier et à l’ordonnance afin d’éviter omissions, erreurs de dose et indications méconnues.'),
        O(false, 'L’absence de toute constante parce que le geste est ophtalmologique.', 'Le terrain nécessite des mesures objectives même pour un acte peu invasif.'),
        O(true, 'La connaissance des techniques pratiquées dans le centre.', 'Le consultant doit adapter ses décisions aux modalités réellement disponibles.'),
        O(false, 'Une consultation imposée sans accord du patient.', 'La délocalisation requiert son consentement après explication des contraintes.'),
      ]],
      ['L’infirmière dispose d’un tensiomètre, d’un saturomètre et d’un thermomètre.', 'Quelles mesures doivent être transmises ?', 'b00124', 'La télémédecine conserve un socle objectif associant pression, fréquence, oxygénation et température.', [
        O(true, 'La pression artérielle mesurée dans de bonnes conditions.', 'Cette valeur participe à l’évaluation cardiovasculaire et thérapeutique.'),
        O(true, 'Le pouls avec sa fréquence et sa régularité.', 'Le rythme apporte une information complémentaire à la seule pression.'),
        O(true, 'La saturation périphérique en oxygène.', 'La SpO₂ contribue au bilan respiratoire à distance.'),
        O(false, 'La taille des chaussures comme constante obligatoire.', 'Cette mesure ne figure pas parmi les paramètres cliniques nécessaires.'),
        O(true, 'La température corporelle.', 'Une fièvre pourrait révéler une situation intercurrente et modifier le calendrier.'),
      ]],
      ['Le patient utilise un déambulateur et sa fille rapporte une baisse récente d’autonomie.', 'Quelles interprétations sont pertinentes ?', 'b00036', 'L’aide à la marche et le déclin récent suggèrent une fragilité qui doit être intégrée au bénéfice fonctionnel et au retour à domicile.', [
        O(true, 'Rechercher systématiquement les activités de vie quotidienne préservées.', 'Le niveau réel d’autonomie guide l’organisation après l’acte.'),
        O(true, 'Interpréter le déambulateur comme un indice de réserve fonctionnelle réduite à approfondir.', 'Cette aide à la marche participe à l’évaluation de la fragilité sans constituer à elle seule un motif de refus chirurgical.'),
        O(true, 'Anticiper les aides nécessaires lors du retour en résidence.', 'Une rupture prolongée des habitudes peut détériorer qualité de vie et autonomie.'),
        O(true, 'Évaluer la cognition séparément de la mobilité.', 'Une baisse d’autonomie et l’usage d’un déambulateur ne renseignent pas à eux seuls les fonctions supérieures ni la capacité à consentir.'),
        O(true, 'Discuter le risque de récupération plus difficile avec l’entourage.', 'Une information adaptée prépare le patient et les aidants au parcours.'),
      ]],
      ['L’ordonnance révèle huit médicaments, dont un diurétique et un IEC.', 'Quels contrôles ou décisions sont nécessaires ?', ['b00091', 'b00097', 'b00101'], 'La polymédication impose une conduite écrite, avec attention particulière à la fonction rénale, aux électrolytes et à la volémie.', [
        O(true, 'Contrôler la fonction rénale sous IEC.', 'Cette donnée contribue à décider du maintien et à estimer la tolérance.'),
        O(true, 'Vérifier l’ionogramme en présence du diurétique.', 'Des troubles électrolytiques silencieux peuvent compliquer l’anesthésie.'),
        O(false, 'Suspendre indistinctement les huit traitements pendant une semaine.', 'Chaque médicament possède une balance arrêt–maintien particulière.'),
        O(true, 'Écrire l’horaire des dernières prises autorisées.', 'Une consigne précise évite les interprétations lors de l’admission ambulatoire.'),
        O(true, 'Anticiper une hypotension liée à l’IEC même pour une anesthésie de courte durée.', 'La brièveté du geste ne supprime pas l’effet hémodynamique du traitement ; la conduite doit être écrite et individualisée.'),
      ]],
      ['La fille reformule les consignes, mais le patient souhaite répondre lui-même.', 'Comment préserver une information de qualité ?', ['b00073', 'b00074'], 'L’accompagnante soutient la communication sans se substituer à la décision du patient capable.', [
        O(true, 'S’adresser d’abord au patient avec des phrases courtes.', 'L’adaptation au handicap auditif respecte son autonomie.'),
        O(true, 'Utiliser un support écrit lisible pour les consignes.', 'Le document réduit la dépendance à une mémorisation auditive difficile.'),
        O(true, 'Associer la fille à l’échange avec l’accord du patient, sans lui transférer la décision.', 'L’accompagnante peut soutenir la compréhension tout en préservant l’autonomie du patient.'),
        O(true, 'Vérifier séparément ce que le patient a retenu.', 'La reformulation personnelle permet d’identifier une incompréhension.'),
        O(true, 'Laisser au patient le temps de poser ses propres questions.', 'Un échange interactif adapté à son handicap est indispensable à une information comprise.'),
      ]],
      ['Le patient est prévenu qu’une discordance pourrait conduire à différer le geste.', 'Pourquoi cette information est-elle nécessaire ?', 'b00123', 'La consultation distante comporte un risque de report si le contact direct révèle une donnée absente ou incompatible.', [
        O(false, 'Le risque de report peut être tu puisqu’il reste rare dans une organisation délocalisée.', 'Le consentement doit inclure les contraintes prévisibles, même peu fréquentes, et pas seulement les avantages de la téléconsultation.'),
        O(false, 'Elle autorise l’équipe à annuler sans motif clinique.', 'Un report doit répondre à une donnée susceptible d’altérer sécurité ou stratégie.'),
        O(true, 'Elle prépare le patient à la visite préanesthésique sur place.', 'Ce premier contact direct vérifie et rectifie les informations à distance.'),
        O(false, 'Elle dispense le centre d’envoyer ses protocoles au consultant.', 'Le cahier des charges et les techniques restent des prérequis.'),
        O(false, 'Elle transforme la téléconsultation en simple formalité administrative.', 'L’évaluation à distance reste un acte médical complet et décisionnel.'),
      ]],
      ['À l’arrivée, les constantes et l’état clinique sont inchangés.', 'Quelles actions relèvent encore de la visite préanesthésique ?', ['b00123', 'b00138'], 'La stabilité doit être confirmée, les prises vérifiées et la stratégie rendue disponible avant l’entrée en salle.', [
        O(true, 'Confirmer les médicaments réellement pris le matin.', 'Une discordance médicamenteuse peut modifier l’hémodynamique et le calendrier.'),
        O(true, 'Vérifier directement les voies aériennes et l’examen utile.', 'Le contact présentiel complète ce qui était limité par la vidéo.'),
        O(false, 'Ignorer toutes les données de la téléconsultation précédente.', 'La continuité repose sur leur actualisation, pas sur leur effacement.'),
        O(true, 'S’assurer que le dossier suit le patient jusqu’à la salle.', 'Les consignes doivent être accessibles au professionnel qui réalise l’anesthésie.'),
        O(true, 'Expliquer toute modification importante de technique et confirmer le maintien du consentement.', 'La visite actualise la stratégie, mais une adaptation substantielle doit rester comprise et acceptée par le patient.'),
      ]],
    ],
  },
  {
    title: 'Anesthésies répétées pour pansements',
    vignette: 'Un enfant de 7 ans doit recevoir quatre pansements complexes sous anesthésie à trois semaines d’intervalle. Les gestes initiaux sont courts et peu douloureux ; son asthme est stable et aucun traitement ne change. Les parents demandent une seule consultation pour toute la séquence. L’équipe accepte le principe sous réserve d’une prise en charge constante et d’une réévaluation avant chaque séance.',
    steps: [
      [null, 'Quelles conditions autorisent une consultation commune ?', 'b00125', 'Faible retentissement, stabilité et accord partagé rendent cette organisation possible.', [O(true,'Des actes à faible retentissement physiologique.','Cette faible agressivité est une condition explicite.'),O(true,'Une stratégie qui reste comparable entre les séances.','Un alourdissement imposerait une nouvelle consultation.'),O(true,'Une réévaluation avant toute séance si l’état clinique s’aggrave entre les actes.','La consultation commune ne dispense jamais d’actualiser une infection, un symptôme ou un traitement susceptible de modifier la stratégie.'),O(true,'L’accord des équipes et des parents informés.','La pratique requiert adhésion professionnelle et consentement.'),O(true,'Un dossier accessible aux équipes concernées pendant toute la séquence d’actes.','La continuité dépend d’une information clinique, médicamenteuse et décisionnelle complète entre les établissements.')]],
      ['Avant la deuxième séance, une toux fébrile apparaît depuis quarante-huit heures.', 'Quelle conduite est appropriée ?', ['b00060','b00125'], 'Une infection respiratoire intercurrente rompt la stabilité qui justifiait l’évaluation unique.', [O(true,'Réexaminer l’enfant avant de maintenir l’anesthésie.','La situation respiratoire actuelle peut modifier le risque.'),O(false,'Appliquer automatiquement le plan de la première séance.','Un protocole antérieur ne couvre pas une infection nouvelle.'),O(true,'Rechercher des signes de décompensation de l’asthme.','L’infection peut déséquilibrer une pathologie respiratoire.'),O(false,'Considérer la fièvre comme sans effet sur le calendrier.','Une infection active peut conduire à différer un geste programmé.'),O(false,'Prescrire une transfusion pour traiter la toux.','Aucune indication hématologique n’est décrite ici.')]],
      ['Le pansement est différé et l’enfant redevient asymptomatique une semaine plus tard.', 'Quelles vérifications permettent de reprendre ?', ['b00060','b00123'], 'La reprise suppose stabilité respiratoire, absence d’infection et actualisation du dossier.', [O(true,'Confirmer l’absence de fièvre et de gêne respiratoire.','La résolution clinique conditionne la nouvelle décision.'),O(true,'Vérifier les traitements reçus pendant l’épisode.','Une prescription récente peut interagir avec l’anesthésie.'),O(true,'Réaliser une auscultation malgré la disparition de la toux.','L’examen clinique vérifie la résolution respiratoire et recherche un signe persistant que l’interrogatoire seul pourrait méconnaître.'),O(true,'Tracer le report et la nouvelle évaluation.','La chronologie doit rester lisible pour les séances suivantes.'),O(true,'Expliquer que la guérison réduit le risque sans supprimer tout aléa anesthésique.','La reprise repose sur une balance redevenue acceptable et sur une stratégie adaptée, non sur une garantie d’absence de complication.')]],
      ['Le troisième pansement devient plus long et nécessite un geste chirurgical associé.', 'Que change cette évolution ?', 'b00125', 'L’augmentation du retentissement met fin aux conditions de la consultation unique.', [O(true,'Réaliser une nouvelle évaluation anesthésique complète.','La procédure n’est plus équivalente aux actes initiaux.'),O(true,'Réexaminer la technique anesthésique à partir de la durée et de l’agressivité du nouveau geste.','La stratégie courte des pansements initiaux ne peut être reconduite sans analyser les besoins propres à la chirurgie associée.'),O(true,'Préciser les nouvelles modalités d’hospitalisation.','Un geste plus lourd peut nécessiter une surveillance différente.'),O(false,'Masquer cette modification aux parents jusqu’au bloc.','Le consentement doit porter sur la procédure réellement prévue.'),O(true,'Réviser les besoins analgésiques et postopératoires.','L’extension chirurgicale change douleur et surveillance attendues.')]],
      ['Les parents reçoivent une brochure mais expriment encore plusieurs incertitudes.', 'Comment compléter l’information ?', ['b00073','b00074'], 'L’information orale personnalisée reste prioritaire malgré l’existence d’un document écrit.', [O(true,'Reprendre les risques avec des mots adaptés à la famille.','L’entretien répond aux questions propres à cet enfant.'),O(true,'Faire reformuler les modifications comprises.','La reformulation objective les éventuels malentendus.'),O(true,'Utiliser la brochure comme support sans la substituer à l’entretien individualisé.','Le document aide à relire les informations, tandis que l’échange répond aux incertitudes propres à l’enfant et vérifie la compréhension.'),O(true,'Expliquer pourquoi la stratégie initiale a changé.','Le nouveau geste justifie une information renouvelée.'),O(true,'Répondre aux incertitudes sans dissimuler les risques pour préserver une confiance réaliste.','Une information claire et proportionnée permet aux parents de comprendre la nouvelle stratégie et d’y consentir sans fausse garantie.')]],
      ['L’asthme reste stable mais l’enfant ronfle depuis une prise de poids récente.', 'Quelle exploration clinique ajouter ?', ['b00065','b00068'], 'Un dépistage de SAOS devient pertinent et peut modifier surveillance et analgésie.', [O(true,'Calculer un score clinique adapté tel que STOP-BANG.','Le ronflement et la prise pondérale motivent le dépistage.'),O(false,'Conclure à un SAOS certain sur le ronflement seul.','Un symptôme isolé ne suffit pas à confirmer le syndrome.'),O(false,'Un réexamen normal des voies aériennes suffit à exclure un SAOS malgré le ronflement et la prise de poids.','L’anatomie d’intubation et le risque d’obstruction nocturne sont liés mais distincts ; le dépistage clinique doit être mené spécifiquement.'),O(false,'Prévoir systématiquement des benzodiazépines fortes.','Ces sédatifs aggraveraient une obstruction nocturne possible.'),O(true,'Anticiper une surveillance respiratoire si le score est élevé.','Le résultat doit avoir une conséquence organisationnelle concrète.')]],
      ['Après la dernière séance, le dossier doit être archivé pour d’autres anesthésies.', 'Quelles informations y conserver ?', ['b00015','b00138'], 'Le dossier doit transmettre tolérance, difficultés, décisions et évolution entre les actes.', [O(true,'Les complications ou difficultés rencontrées à chaque séance.','Un antécédent documenté orientera une anesthésie future.'),O(true,'Les raisons des reports et changements de stratégie.','La chronologie explique les décisions successives.'),O(true,'Les données cliniques et anesthésiques utiles au sein du dossier médical.','La conservation des examens, traitements, difficultés et décisions permet d’orienter une anesthésie ultérieure.'),O(true,'Les informations données et le consentement parental.','La trace de la décision partagée complète la stratégie.'),O(false,'Détruire les comptes rendus après le dernier pansement.','La conservation assure la continuité lors d’un acte ultérieur.')]],
    ],
  },
  {
    title: 'Antiangiogénique avant chirurgie colorectale',
    vignette: 'Un homme de 61 ans traité pour cancer colorectal doit subir une chirurgie de résection programmée. Il reçoit un antiangiogénique, prend un anticoagulant pour une thrombose ancienne et présente une anémie modérée. Le traitement anticancéreux a été administré il y a deux semaines. Le chirurgien souhaite opérer rapidement, tandis que l’anesthésiste veut réduire les risques de saignement et de mauvaise cicatrisation.',
    steps: [
      [null, 'Quels risques liés à l’antiangiogénique doivent être intégrés ?', 'b00110', 'Hémorragie, ischémie et défaut de cicatrisation concernent directement cette chirurgie.', [O(true,'Une mauvaise cicatrisation des sutures digestives.','L’effet antiangiogénique compromet la réparation tissulaire.'),O(true,'Un risque hémorragique périopératoire accru.','Cette classe expose à des complications de saignement.'),O(true,'Des événements ischémiques cardiovasculaires.','Le risque cardiaque décrit est de nature ischémique.'),O(false,'Une protection garantie contre toute thrombose.','Le traitement ne supprime pas les événements thrombotiques.'),O(false,'Une accélération certaine de la consolidation des tissus.','Son mécanisme produit au contraire une cicatrisation défavorable.')]],
      ['La dernière injection date de quatorze jours.', 'Quel délai d’arrêt est recommandé avant la chirurgie ?', 'b00110', 'Une fenêtre de six semaines est recommandée pour limiter les complications de cette classe.', [O(false,'Deux semaines suffisent dans toutes les situations.','Le délai écoulé reste inférieur à la recommandation.'),O(true,'Attendre six semaines depuis l’arrêt si le contexte le permet.','Cette durée réduit risque hémorragique et cicatriciel.'),O(false,'Poursuivre le traitement jusqu’au matin de l’acte.','Le maintien exposerait les sutures et l’hémostase.'),O(false,'Le respect théorique des six semaines dispense de toute discussion avec l’équipe oncologique et chirurgicale.','Le calendrier doit confronter risque cicatriciel, risque hémorragique et bénéfice oncologique dans une décision multidisciplinaire.'),O(false,'Remplacer immédiatement l’antiangiogénique par du ginkgo.','Le ginkgo ajouterait une inhibition plaquettaire indésirable.')]],
      ['L’anticoagulant protège d’une récidive thrombotique mais augmente le saignement opératoire.', 'Quel raisonnement doit guider sa gestion ?', ['b00103','b00104'], 'La conduite confronte risque hémorragique du maintien et risque thrombotique de l’arrêt.', [O(true,'Préciser l’indication et l’ancienneté de la thrombose.','Ces données déterminent le danger d’une interruption.'),O(true,'Évaluer le risque hémorragique propre à la résection.','La conséquence d’un saignement dépend du geste prévu.'),O(false,'Arrêter sans discussion tous les anticoagulants.','Une interruption aveugle peut provoquer une récidive grave.'),O(true,'Utiliser une procédure locale consensuelle si disponible.','Un cadre partagé harmonise arrêt, relais et reprise.'),O(false,'Laisser chaque intervenant donner une consigne différente.','Des instructions contradictoires créent un risque évitable.')]],
      ['L’hémoglobine est à 9,4 g/dL et la ferritine est basse.', 'Quelles mesures préparer ?', 'b00112', 'L’anémie oncologique doit être corrigée avant l’acte et le seuil transfusionnel individualisé.', [O(true,'Administrer du fer injectable après confirmation de l’indication.','Le fer parentéral est une base de l’optimisation.'),O(true,'Évaluer la nutrition et corriger une carence associée.','La réserve nutritionnelle soutient la correction hématologique.'),O(true,'Définir un seuil transfusionnel individualisé plutôt que choisir systématiquement la valeur la plus basse.','La réserve cardiorespiratoire, le geste et le saignement attendu déterminent la tolérance à l’anémie et la stratégie transfusionnelle.'),O(true,'Définir un seuil selon ses réserves et la chirurgie.','La stratégie transfusionnelle est personnalisée.'),O(true,'Informer avant l’intervention du risque transfusionnel et des mesures d’épargne prévues.','Un risque prévisible doit être expliqué à un moment où le patient peut comprendre les alternatives et exprimer son consentement.')]],
      ['Le patient accepte une transfusion si elle devient indispensable.', 'Quelles traces doivent figurer au dossier ?', ['b00112','b00138'], 'Information, consentement et stratégie d’épargne sanguine doivent être immédiatement accessibles.', [O(true,'Le contenu de l’information transfusionnelle délivrée.','La traçabilité confirme que risques et bénéfices ont été expliqués.'),O(true,'Le consentement exprimé par le patient.','La décision doit être connue de toute l’équipe.'),O(true,'La précision qu’aucune absence de transfusion ne peut être garantie avant de connaître le saignement réel.','Cette incertitude fait partie de l’information loyale et distingue un objectif d’épargne d’une promesse irréaliste.'),O(true,'Le seuil et les mesures d’épargne envisagés.','Une conduite chiffrée évite les décisions improvisées.'),O(true,'Le résultat du contrôle biologique après le traitement martial.','L’efficacité de la correction doit être objectivée avant d’actualiser le risque et le plan d’épargne sanguine.')]],
      ['Le délai de six semaines est respecté et l’anticoagulation a une conduite collégiale écrite.', 'Quels éléments autorisent la poursuite du parcours ?', ['b00114','b00134'], 'Une stratégie partagée, un terrain optimisé et des responsabilités explicites sécurisent la décision opératoire.', [O(true,'La coordination entre anesthésiste, chirurgien et prescripteur.','Chaque professionnel apporte une dimension indispensable du risque.'),O(true,'La vérification de l’efficacité de la correction de l’anémie.','Le résultat objectif confirme le bénéfice de l’optimisation.'),O(true,'Le maintien d’une vigilance cicatricielle malgré le respect du délai de six semaines.','La fenêtre diminue le risque lié à l’antiangiogénique sans garantir une cicatrisation normale chez chaque patient.'),O(true,'Une date planifiée de reprise des traitements.', 'La période postopératoire fait partie de la stratégie médicamenteuse.'),O(true,'La transmission du plan collégial au médecin et à l’équipe du jour.','Les dates d’arrêt, de relais et de reprise doivent être disponibles au moment où elles seront appliquées.')]],
      ['La visite finale confirme l’absence de nouvelle cure anticancéreuse et un état clinique stable.', 'Quelles vérifications restent nécessaires ?', ['b00123','b00138'], 'La dernière visite confronte les prises réelles au plan et confirme la disponibilité des ressources prévues.', [O(true,'Contrôler la date exacte de dernière dose antiangiogénique.','La fenêtre d’arrêt doit être certaine, pas seulement supposée.'),O(true,'Vérifier arrêt ou relais anticoagulant réellement appliqué.','Une divergence modifierait immédiatement le risque hémorragique.'),O(false,'Abandonner le plan transfusionnel puisque le patient reste asymptomatique.','La stabilité clinique ne prédit ni le volume du saignement opératoire ni sa tolérance.'),O(true,'S’assurer que les produits et moyens d’épargne sont disponibles.','L’anticipation organisationnelle rend la stratégie réalisable.'),O(false,'Programmer la reprise de l’antiangiogénique dès la salle de réveil.','Une reprise aussi précoce exposerait les tissus récemment opérés à un risque cicatriciel majeur.')]],
    ],
  },
];

function buildDpQcm() {
  return DP_QCM.map((definition, index) => ({
    label: `DP QCM ${index + 1} · ${definition.title}`,
    vignette: definition.vignette,
    allowed_voies: ['interne'],
    questions: definition.steps.map(([info, stem, sources, correction, options]) => qcm(stem, sources, correction, options, info)),
  }));
}

function validateSourceBlocks(extract, value) {
  const available = new Set(extract.blocs.map((block) => block.id).filter(Boolean));
  const used = [];
  const visit = (item) => {
    if (!item || typeof item !== 'object') return;
    if (Array.isArray(item.sourceBlocks)) used.push(...item.sourceBlocks);
    if (Array.isArray(item)) item.forEach(visit);
    else Object.values(item).forEach(visit);
  };
  visit(value);
  const missing = [...new Set(used.filter((id) => !available.has(id)))];
  if (missing.length) throw new Error(`Blocs source absents du chapitre 02 : ${missing.join(', ')}`);
}

export function buildChapter02(extract) {
  const result = {
    fiche: authoredChapter02Model(),
    flashcards: buildFlashcards(),
    series: [...buildIsolatedQcm(), ...buildDpQcm(), ...buildIsolatedQroc(), ...buildDpQroc()],
  };
  validateSourceBlocks(extract, result);
  return result;
}

export default buildChapter02;
