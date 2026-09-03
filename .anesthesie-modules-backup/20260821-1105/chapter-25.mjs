// Chapitre 25 - Système hépatique et anesthésie.
// Module éditorial autonome, fondé exclusivement sur extract.json.

const src = (...ids) => ids;
const n2 = (text, ...children) => ({ text, children });
const row = (concept, bullets, sourceBlocks, image = null) => ({
  concept,
  bullets,
  sourceBlocks,
  ...(image ? { image } : {}),
});
const fullImage = (path, caption, sourceCaption, cropBottomMm = null) => ({
  path,
  position: "after",
  size: "large",
  layout: "full_width",
  containsText: true,
  ...(caption ? { caption } : {}),
  ...(sourceCaption ? { sourceCaption } : {}),
  ...(cropBottomMm ? { cropBottomMm } : {}),
});

const IMAGES = {
  anatomy: fullImage(
    "img/img_001.png",
    "Huit segments s’organisent autour des pédicules et des veines sus-hépatiques",
    "FIGURE 25.1 Subdivisions anatomiques du foie",
  ),
  lobule: fullImage(
    "img/img_002.png",
    "Le lobule relie double apport sanguin, hépatocytes, sinusoïdes et drainage biliaire",
    "FIGURE 25.2 Structure du lobule hépatique",
    12,
  ),
  balance: fullImage(
    "img/img_003.png",
    "La cirrhose diminue simultanément facteurs procoagulants et anticoagulants",
    "TABLEAU 25.1 Facteurs hépatiques favorisant le saignement ou la coagulation",
    13,
  ),
  child: fullImage(
    "img/img_004.png",
    "Child–Turcotte–Pugh combine ascite, bilirubine, albumine, coagulation et encéphalopathie",
    "TABLEAU 25.2 Classification de la sévérité de la cirrhose par Child-Turcotte-Pugh",
    11,
  ),
};

function buildFiche() {
  const parts = [
    {
      title: "Relier anatomie, perfusion et fonctions hépatiques",
      sections: [
        {
          title: "Cartographier le foie utile à l’anesthésiste",
          rows: [
            row(
              "Repères",
              [
                "Le foie pèse environ **1 500 g**, reçoit **25 % du débit cardiaque** et assure stockage, métabolisme, synthèse protéique, coagulation et détoxification.",
                "Quatre lobes et huit segments permettent les résections anatomiques.",
              ],
              src("b00003", "b00004", "b00007", "b00008"),
              IMAGES.anatomy,
            ),
            row(
              "Double vascularisation",
              [
                n2(
                  "Partager débit et oxygénation",
                  "Veine porte : 70 % du débit hépatique",
                  "Artère hépatique : 30 % du débit",
                  "Trois veines sus-hépatiques drainent vers la veine cave inférieure",
                ),
              ],
              src("b00004"),
            ),
            row(
              "Conséquence périopératoire",
              [
                "Hypotension, vasoconstriction et baisse du retour portal menacent un organe fortement perfusé.",
                "La chirurgie hépatique expose directement pédicules portaux et veines sus-hépatiques au risque hémorragique.",
              ],
              src("b00004", "b00111"),
            ),
          ],
        },
        {
          title: "Comprendre le lobule comme unité d’échange",
          rows: [
            row(
              "Architecture",
              [
                "Le foie humain contient environ **50 000 à 100 000 lobules**, longs de quelques millimètres et larges de **0,8 à 2 mm**.",
                "La veine centrolobulaire collecte le sang des sinusoïdes avant les veines sus-hépatiques.",
              ],
              src("b00009"),
              IMAGES.lobule,
            ),
            row(
              "Triade fonctionnelle",
              [
                n2(
                  "Faire converger trois circulations",
                  "Artériole hépatique et veinule portale alimentent les hépatocytes",
                  "Canalicules et conduits interlobulaires drainent la bile",
                  "Cellules de Kupffer phagocytent bactéries et éléments étrangers",
                ),
              ],
              src("b00009"),
            ),
            row(
              "Vulnérabilité centrolobulaire",
              [
                "La zone centrolobulaire est exposée aux lésions hypoxiques et à certains toxiques.",
                "Le NAPQI et plusieurs solvants peuvent provoquer une nécrose ou une dégénérescence graisseuse centrolobulaire.",
              ],
              src("b00036", "b00037", "b00043"),
            ),
          ],
        },
      ],
    },
    {
      title: "Reconnaître l’insuffisance hépatique aiguë",
      sections: [
        {
          title: "Définir gravité, temporalité et étiologie",
          rows: [
            row(
              "Aiguë ou chronique",
              [
                "Une hépatite persistant au-delà de **6 mois** est chronique.",
                "L’insuffisance aiguë associe destruction massive et insuffisance hépatocellulaire brutale sur foie auparavant sain ; la distinguer d’une décompensation aiguë sur maladie chronique.",
              ],
              src("b00012"),
            ),
            row(
              "Sévérité",
              [
                n2(
                  "Lire INR, facteur V et cerveau",
                  "Sévère : INR > 1,5 et facteur V < 50 %, sans encéphalopathie",
                  "Grave : mêmes critères avec encéphalopathie",
                  "Fulminante : ictère et encéphalopathie en moins de 2 semaines ; subfulminante entre 2 semaines et 3 mois",
                ),
              ],
              src("b00013", "b00014", "b00015", "b00016", "b00017", "b00018"),
            ),
            row(
              "Pronostic",
              [
                "Sans encéphalopathie, la mortalité reste inférieure à **2 %** ; avec forme fulminante non greffée, elle atteint **80–85 %**.",
                "La greffe ramène la mortalité fulminante autour de **20–30 %**.",
              ],
              src("b00019"),
            ),
          ],
        },
        {
          title: "Identifier la cause sans perdre le temps thérapeutique",
          rows: [
            row(
              "Virus",
              [
                "VHA : ARN non enveloppé, incubation d’environ un mois, IgM anti-VHA, pas de chronicité ; VHB : IgM anti-HBc, incubation 10 semaines à 6 mois, fulminance autour de 1 %.",
                "VHC : transmission sanguine, souvent asymptomatique et chronique ; VHD dépend du VHB ; VHE ressemble épidémiologiquement au VHA.",
              ],
              src(
                "b00020",
                "b00021",
                "b00022",
                "b00023",
                "b00024",
                "b00025",
                "b00026",
                "b00027",
                "b00028",
                "b00029",
                "b00030",
                "b00031",
                "b00032",
              ),
            ),
            row(
              "Toxiques et alcool",
              [
                n2(
                  "Distinguer exposition chronique et overdose",
                  "Hépatite alcoolique : consommation souvent > 100 g/j pendant des années, ictère constant et signes de cirrhose fréquents",
                  "Acétaminophène : NAPQI déborde la neutralisation, nécrose centrolobulaire et possible insuffisance rénale",
                  "Amanite phalloïde, chloroforme et solvants chlorés peuvent être mortels",
                ),
              ],
              src("b00033", "b00034", "b00035", "b00036", "b00037"),
            ),
            row(
              "Autres cadres",
              [
                "Déficit en alpha-1-antitrypsine, mucoviscidose et Wilson provoquent surtout des atteintes chroniques.",
                "Hépatite auto-immune : auto-anticorps, hypergammaglobulinémie, corticoïdes puis immunosuppresseurs ; foie cardiaque : congestion, ischémie ou hypoxie, réversible si la cause est traitée tôt.",
              ],
              src("b00038", "b00039", "b00040", "b00041", "b00042", "b00043"),
            ),
          ],
        },
      ],
    },
    {
      title: "Interpréter les défaillances aiguës et chroniques",
      sections: [
        {
          title: "Lire les signes d’insuffisance aiguë",
          rows: [
            row(
              "Ictère",
              [
                "Il précède l’encéphalopathie et reflète l’accumulation de bilirubine faute de conjugaison et d’excrétion biliaire efficaces.",
                "Cholestase : bilirubine conjuguée, gamma-GT et phosphatases alcalines augmentées ; cytolyse : ASAT et ALAT élevées.",
              ],
              src("b00044", "b00045", "b00046", "b00058", "b00059"),
            ),
            row(
              "Encéphalopathie",
              [
                n2(
                  "Graduer la détérioration neurologique",
                  "Grade 1 : ralentissement idéomoteur",
                  "Grade 2 : astérixis",
                  "Grade 3 : confusion ; grade 4 : coma",
                ),
              ],
              src("b00047", "b00048", "b00049", "b00050", "b00051", "b00052"),
            ),
            row(
              "Ammoniaque et multiorganes",
              [
                "L’ammoniaque non convertie en urée devient glutamine astrocytaire, dérègle le débit cérébral et favorise l’œdème.",
                "Rechercher insuffisance rénale, syndrome hyperkinétique, SDRA, dysglycémie, dysnatrémie, hypophosphorémie, hypokaliémie et infection.",
              ],
              src("b00053", "b00054", "b00055", "b00056", "b00057"),
            ),
          ],
        },
        {
          title: "Comprendre la cirrhose comme maladie systémique",
          rows: [
            row(
              "Remodelage et portail",
              [
                "Fibrose et nodules obstruent le retour portal : ascite, circulation collatérale, tête de méduse et varices œsophagiennes.",
                "L’ascite peut se compliquer de péritonite bactérienne spontanée.",
              ],
              src("b00062", "b00063"),
            ),
            row(
              "Sous-remplissage artériel",
              [
                n2(
                  "Relier vasodilatation et organes",
                  "Shunts et vasodilatation splanchnique diminuent les résistances systémiques",
                  "Activation de l’ADH, rétention d’eau libre et hyponatrémie",
                  "Moindre perfusion rénale et cérébrale malgré un débit cardiaque élevé",
                ),
              ],
              src("b00064", "b00065"),
            ),
            row(
              "Syndromes associés",
              [
                "Cardiomyopathie : hyperdynamisme puis dysfonction diastolique et systolique, QT long, faible réserve à l’effort.",
                "Syndrome hépatorénal, syndrome hépatopulmonaire et hypertension artérielle pulmonaire modifient fortement le risque anesthésique.",
              ],
              src("b00066", "b00067", "b00068", "b00069", "b00070", "b00071"),
            ),
          ],
        },
      ],
    },
    {
      title: "Évaluer la cirrhose avant d’anesthésier",
      sections: [
        {
          title: "Ne pas confondre INR élevé et hypocoagulation simple",
          rows: [
            row(
              "Seuils usuels",
              [
                "Repères cités : culots si Hb **60–100 g/L** ; plasma **10–15 mL/kg** si INR > 2 ; plaquettes **5–10 unités** si < 30 × 10⁹/L ; cryoprécipités **5–10 unités** si fibrinogène < 2 g/L.",
                "Ces seuils ne suffisent pas à décrire l’équilibre cirrhotique.",
              ],
              src("b00072", "b00073", "b00074", "b00075", "b00076", "b00077"),
            ),
            row(
              "Hémostase rééquilibrée",
              [
                n2(
                  "Deux versants diminuent ensemble",
                  "Facteurs procoagulants abaissés",
                  "Protéines C, S et antithrombine également diminuées",
                  "Facteur VIII et facteur von Willebrand augmentés ; ADAMTS13 diminuée",
                ),
              ],
              src("b00078", "b00079", "b00080", "b00081"),
              IMAGES.balance,
            ),
            row(
              "Décision",
              [
                "INR, plaquettes et fibrinogène prédisent mal le saignement ; sans saignement, une attente peut être préférable à une correction prophylactique.",
                "Prudence renforcée pour chirurgie conventionnelle, bloc neuraxial ou bloc profond.",
              ],
              src("b00078", "b00080", "b00081"),
            ),
          ],
        },
        {
          title: "Stratifier sévérité et fonctions d’organe",
          rows: [
            row(
              "Bilan préopératoire",
              [
                "Évaluer cœur, poumons, reins et hémostase avant toute chirurgie chez le cirrhotique.",
                "Rechercher ascite, encéphalopathie, infection, varices, hyponatrémie, hypoalbuminémie et réserve fonctionnelle.",
              ],
              src("b00084"),
            ),
            row(
              "Scores",
              [
                n2(
                  "Utiliser deux outils complémentaires",
                  "Child–Turcotte–Pugh : ascite, bilirubine, albumine, coagulation, encéphalopathie",
                  "MELD : INR, créatinine et bilirubine",
                  "MELD-Na ajoute le sodium ; l’échelle va de 6 à 40",
                ),
              ],
              src("b00085", "b00086", "b00087"),
              IMAGES.child,
            ),
            row(
              "Poumon et rein",
              [
                "Syndrome hépatorénal : greffe définitive, avec terlipressine et albumine en soutien ; insuffisance prérénale répond à l’hydratation.",
                "Syndrome hépatopulmonaire : gradient alvéolo-artériel > 15 mmHg et vasodilatation intrapulmonaire ; PaO₂ < 50 mmHg aggrave fortement le pronostic.",
              ],
              src("b00068", "b00069", "b00070", "b00071"),
            ),
          ],
        },
      ],
    },
    {
      title: "Adapter médicaments et chirurgie hépatobiliaire",
      sections: [
        {
          title: "Choisir les agents selon clairance et débit hépatique",
          rows: [
            row(
              "Pharmacocinétique",
              [
                "Clairance diminuée, volume de distribution augmenté et liaison protéique réduite rendent l’ajustement imprécis.",
                "La baisse du débit hépatique ralentit surtout les médicaments à forte extraction.",
              ],
              src("b00090", "b00091", "b00092", "b00093", "b00094"),
            ),
            row(
              "Hypnotiques et opioïdes",
              [
                n2(
                  "Privilégier titration et voies indépendantes",
                  "Propofol : doses usuelles en cirrhose modérée",
                  "Midazolam : clairance surtout diminuée en cirrhose sévère ; kétamine peu d’effet sur le débit hépatique",
                  "Rémifentanil indépendant du foie ; fentanyl et hydromorphone préférés ; tramadol réduit",
                ),
              ],
              src("b00095", "b00096", "b00097", "b00098", "b00099"),
            ),
            row(
              "Curares, AL et antalgiques",
              [
                "Succinylcholine et rocuronium prolongés ; cisatracurium métabolisé par Hofmann, avec prudence sur la laudanosine en perfusion prolongée.",
                "AL amides : dose unique usuelle, perfusions ou répétitions réduites de 10–50 % ; paracétamol ≤ 4 g/j ; éviter l’impact rénal et digestif des AINS.",
              ],
              src("b00100", "b00101", "b00102", "b00103", "b00104"),
            ),
          ],
        },
        {
          title: "Anticiper TIPS, résection et greffe",
          rows: [
            row(
              "TIPS",
              [
                "Le shunt diminue pression portale et risque de rupture variqueuse mais peut provoquer hémopéritoine, hémobilie ou lésion vasculaire.",
                "L’augmentation brutale du retour veineux expose à OAP ou insuffisance cardiaque ; à moyen terme, encéphalopathie ou sténose du shunt.",
              ],
              src("b00105", "b00106", "b00107", "b00108"),
            ),
            row(
              "Résection",
              [
                n2(
                  "Réduire le saignement sans sacrifier les organes",
                  "Monitorage et accès veineux adaptés",
                  "TVC basse : proclive, nitroglycérine, furosémide ou stratégies sélectionnées",
                  "Manœuvre de Pringle interrompt artère hépatique et veine porte ; phlébotomie seulement si fonction rénale normale",
                ),
              ],
              src("b00109", "b00110", "b00111"),
            ),
            row(
              "Après résection et greffe",
              [
                "Une insuffisance transitoire et une coagulopathie peuvent faire éviter la péridurale ; ERAS privilégie multimodalité et ACP, éventuellement rachianesthésie morphinique.",
                "La greffe traite cirrhose décompensée, hépatocarcinome non résécable et insuffisance aiguë ; phases : dissection, anhépatique, reperfusion.",
              ],
              src("b00112", "b00113", "b00114", "b00115"),
            ),
          ],
        },
      ],
    },
  ];
  return {
    matiere: "Anesthésie-Réanimation",
    title: "Système hépatique et anesthésie",
    year: "2026-2027",
    coverSubtitle:
      "Évaluer la réserve hépatique, rééquilibrer le risque et adapter l’anesthésie",
    imageOmissions: [],
    imageException: {
      reason:
        "Le document source comporte quatre visuels pédagogiques distincts ; ils sont tous intégrés en pleine largeur.",
    },
    sourceBlocks: [
      ...new Set(
        parts.flatMap((part) =>
          part.sections.flatMap((section) =>
            section.rows.flatMap((entry) => entry.sourceBlocks),
          ),
        ),
      ),
    ],
    parts,
    synthesis: {
      compactLayout: true,
      chiffres: {
        headers: ["Repère", "Valeur"],
        rows: [
          ["Poids du foie", "≈ 1 500 g"],
          ["Débit cardiaque reçu", "25 %"],
          ["Veine porte / artère", "70 % / 30 %"],
          ["Hépatite chronique", "> 6 mois"],
          ["Sévère", "INR > 1,5 ; FV < 50 %"],
          ["Fulminante", "< 2 semaines"],
          ["Mortalité fulminante sans greffe", "80–85 %"],
          ["MELD", "6–40"],
          ["Plasma si INR > 2", "10–15 mL/kg"],
          ["AL répétés", "−10 à −50 %"],
        ],
      },
      tables: [
        {
          title: "Lecture périopératoire",
          headers: ["Domaine", "Question"],
          rows: [
            ["Cerveau", "Grade d’encéphalopathie et œdème ?"],
            ["Cœur", "Réserve, QT et ventricule droit ?"],
            ["Poumon", "Gradient, PaO₂ et pression pulmonaire ?"],
            ["Rein", "Prérénal, hépatorénal ou structurel ?"],
            ["Hémostase", "Saignement clinique ou anomalie isolée ?"],
          ],
        },
        {
          title: "Agents utiles",
          headers: ["Usage", "Orientation"],
          rows: [
            [
              "Hypnose et analgésie",
              "Propofol : dose usuelle si cirrhose modérée ; rémifentanil : estérases",
            ],
            [
              "Curare et locorégionale",
              "Cisatracurium : Hofmann ; AL amide : dose unique usuelle, répétitions réduites",
            ],
            [
              "Entretien et douleur",
              "Desflurane/sévoflurane : autorégulation mieux préservée ; éviter les AINS",
            ],
          ],
        },
      ],
      keyPoints: [
        "Le foie reçoit un quart du débit cardiaque par deux afférences.",
        "Encéphalopathie transforme une insuffisance sévère en forme grave.",
        "La cirrhose associe vasodilatation, sous-remplissage et atteintes multiorganiques.",
        "Un INR élevé ne résume pas l’équilibre hémostatique cirrhotique.",
        "Child et MELD-Na structurent la gravité sans remplacer l’évaluation d’organe.",
        "Privilégier les métabolismes indépendants du foie et titrer.",
        "La TVC basse réduit le saignement de résection mais exige une sélection.",
        "TIPS et reperfusion modifient brutalement le retour veineux.",
      ],
      eclair: [
        "Foie : 1 500 g, 25 % du débit cardiaque, porte 70 %, artère 30 %.",
        "Sévère : INR > 1,5 et FV < 50 % ; grave si encéphalopathie.",
        "Fulminante : ictère + encéphalopathie en moins de 2 semaines.",
        "Encéphalopathie : ralentissement, astérixis, confusion, coma.",
        "Cirrhose : hyperdébit, vasodilatation splanchnique, hyponatrémie.",
        "INR isolé prédit mal le saignement : hémostase rééquilibrée.",
        "MELD = INR, créatinine, bilirubine ; MELD-Na ajoute sodium.",
        "Cisatracurium et rémifentanil contournent largement le foie.",
        "AL répétés ou continus : réduire de 10 à 50 %.",
        "Résection : saignement majeur possible malgré fonction normale.",
      ],
    },
  };
}

const T = (text, why) => [true, text, why];
const F = (text, why) => [false, text, why];
const qcm = (
  enonce,
  sourceBlocks,
  correction_generale,
  entries,
  newInformation = null,
) => ({
  enonce: newInformation ? `${newInformation} ${enonce}` : enonce,
  format: "qcm",
  sourceBlocks: Array.isArray(sourceBlocks) ? sourceBlocks : [sourceBlocks],
  correction_generale,
  ...(newInformation ? { newInformation } : {}),
  items: entries.map(([is_correct, item, justification], index) => ({
    lettre: "ABCDE"[index],
    enonce: item,
    is_correct,
    justification,
  })),
});
const qroc = (
  enonce,
  reponse_attendue,
  sourceBlocks,
  correction_generale,
  newInformation = null,
) => ({
  enonce: newInformation ? `${newInformation} ${enonce}` : enonce,
  format: "qroc",
  reponse_attendue,
  items: [],
  sourceBlocks: Array.isArray(sourceBlocks) ? sourceBlocks : [sourceBlocks],
  correction_generale,
  ...(newInformation ? { newInformation } : {}),
});
const card = (recto, verso, sourceBlocks) => ({
  recto,
  verso,
  sourceBlocks: Array.isArray(sourceBlocks) ? sourceBlocks : [sourceBlocks],
});

function buildFlashcards() {
  return [
    card(
      "Quel est le poids approximatif du foie adulte ?",
      "Environ 1 500 g.",
      "b00004",
    ),
    card(
      "Quelle fraction du débit cardiaque reçoit le foie ?",
      "Environ 25 %.",
      "b00004",
    ),
    card(
      "Quelle part du débit hépatique vient de la veine porte ?",
      "Environ 70 %.",
      "b00004",
    ),
    card(
      "Quelle part du débit hépatique vient de l’artère hépatique ?",
      "Environ 30 %.",
      "b00004",
    ),
    card(
      "Combien de veines sus-hépatiques principales drainent le foie ?",
      "Trois veines vers la veine cave inférieure.",
      "b00004",
    ),
    card("Combien de segments anatomiques compte le foie ?", "Huit segments.", [
      "b00004",
      "b00007",
      "b00008",
    ]),
    card(
      "Quelle est l’unité fonctionnelle du foie ?",
      "Le lobule hépatique.",
      "b00009",
    ),
    card(
      "Combien de lobules contient approximativement le foie ?",
      "Environ 50 000 à 100 000.",
      "b00009",
    ),
    card("Quel est le diamètre d’un lobule ?", "Environ 0,8 à 2 mm.", "b00009"),
    card(
      "Quel est le rôle des cellules de Kupffer ?",
      "Phagocyter bactéries et éléments étrangers du sang portal.",
      "b00009",
    ),
    card(
      "Quand une hépatite devient-elle chronique ?",
      "Lorsqu’elle persiste au-delà de six mois.",
      "b00012",
    ),
    card(
      "Sur quel foie survient l’insuffisance hépatique aiguë ?",
      "Sur un foie auparavant sain.",
      "b00012",
    ),
    card(
      "Quel INR définit une insuffisance aiguë sévère ?",
      "Un INR supérieur à 1,5.",
      ["b00013", "b00014"],
    ),
    card(
      "Quel seuil de facteur V définit la forme sévère ?",
      "Un facteur V inférieur à 50 %.",
      "b00015",
    ),
    card(
      "Qu’ajoute la forme grave à la forme sévère ?",
      "Une encéphalopathie hépatique.",
      "b00016",
    ),
    card(
      "Quel délai définit une hépatite fulminante ?",
      "Ictère et encéphalopathie en moins de deux semaines.",
      "b00017",
    ),
    card(
      "Quel délai définit une hépatite subfulminante ?",
      "Entre deux semaines et trois mois.",
      ["b00017", "b00018"],
    ),
    card(
      "Quelle mortalité sans encéphalopathie est rapportée ?",
      "Moins de 2 %.",
      "b00019",
    ),
    card(
      "Quelle mortalité fulminante sans greffe est rapportée ?",
      "Environ 80 à 85 %.",
      "b00019",
    ),
    card(
      "Quelle mortalité fulminante après greffe est rapportée ?",
      "Environ 20 à 30 %.",
      "b00019",
    ),
    card(
      "Quel marqueur diagnostique l’hépatite A aiguë ?",
      "Les IgM anti-VHA.",
      "b00022",
    ),
    card(
      "L’hépatite A devient-elle chronique ?",
      "Non, aucune forme chronique n’est décrite.",
      "b00022",
    ),
    card(
      "Quel marqueur diagnostique l’hépatite B aiguë ?",
      "Les IgM anti-HBc.",
      "b00023",
    ),
    card(
      "Quelle est l’incubation du VHB ?",
      "De dix semaines à six mois.",
      "b00023",
    ),
    card(
      "Quel virus dépend de la présence du VHB ?",
      "Le virus de l’hépatite Delta.",
      "b00026",
    ),
    card(
      "Quel est le mode principal de transmission du VHC ?",
      "La transmission sanguine.",
      ["b00024", "b00025"],
    ),
    card(
      "Quelle évolution domine après infection par le VHC ?",
      "Une évolution asymptomatique et chronique.",
      "b00024",
    ),
    card(
      "Quel virus ressemble épidémiologiquement au VHA ?",
      "Le virus de l’hépatite E.",
      "b00027",
    ),
    card(
      "Quel niveau de consommation accompagne souvent l’hépatite alcoolique ?",
      "Plus de 100 g d’alcool par jour pendant des années.",
      "b00034",
    ),
    card(
      "Quel signe est constant dans l’hépatite alcoolique aiguë ?",
      "L’ictère.",
      "b00034",
    ),
    card(
      "Quel toxique cause principalement les hépatites toxiques citées ?",
      "L’acétaminophène ou paracétamol.",
      "b00036",
    ),
    card(
      "Quel métabolite toxique dérive de l’acétaminophène ?",
      "Le NAPQI.",
      "b00036",
    ),
    card(
      "Quelle lésion provoque un excès de NAPQI ?",
      "Une nécrose centrolobulaire et une hépatite cytolytique.",
      "b00036",
    ),
    card(
      "Quelle dose maximale quotidienne de paracétamol est citée ?",
      "Quatre grammes par jour, parfois moins.",
      "b00036",
    ),
    card(
      "Quand apparaissent les symptômes d’intoxication au paracétamol ?",
      "Dans les 24 à 36 heures.",
      "b00036",
    ),
    card(
      "Quel champignon peut provoquer une hépatite fatale ?",
      "L’Amanite phalloïde.",
      "b00037",
    ),
    card(
      "Quelle maladie accumule du cuivre dans le foie ?",
      "La maladie de Wilson.",
      "b00039",
    ),
    card(
      "Quel traitement initial vise l’hépatite auto-immune ?",
      "Les corticoïdes, puis des immunosuppresseurs si besoin.",
      "b00041",
    ),
    card(
      "Quelles entités composent le foie cardiaque ?",
      "Congestion, ischémie et hypoxie hépatiques.",
      "b00043",
    ),
    card(
      "Quel signe précède l’encéphalopathie aiguë ?",
      "Un ictère apparaît habituellement avant les signes neurologiques.",
      "b00046",
    ),
    card(
      "Quel est le grade 1 d’encéphalopathie ?",
      "Un ralentissement idéomoteur.",
      ["b00048", "b00049"],
    ),
    card("Quel est le grade 2 d’encéphalopathie ?", "Un astérixis.", [
      "b00048",
      "b00050",
    ]),
    card("Quel est le grade 3 d’encéphalopathie ?", "Une confusion.", [
      "b00048",
      "b00051",
    ]),
    card("Quel est le grade 4 d’encéphalopathie ?", "Un coma.", [
      "b00048",
      "b00052",
    ]),
    card(
      "En quoi le foie transforme-t-il normalement l’ammoniaque ?",
      "En urée par le cycle de l’urée.",
      "b00053",
    ),
    card(
      "Quel métabolite astrocytaire dérive de l’ammoniaque ?",
      "La glutamine.",
      "b00053",
    ),
    card(
      "Quelle complication cérébrale accompagne l’encéphalopathie ?",
      "Un œdème cérébral.",
      ["b00053", "b00057"],
    ),
    card(
      "Quelle anomalie hémodynamique accompagne l’insuffisance aiguë ?",
      "Un syndrome hyperkinétique.",
      "b00057",
    ),
    card(
      "Quelle anomalie acidobasique domine au début ?",
      "Une alcalose respiratoire par hyperventilation centrale.",
      "b00059",
    ),
    card(
      "Quel facteur de coagulation baisse en premier ?",
      "Le facteur VII, demi-vie proche de quatre heures.",
      "b00059",
    ),
    card(
      "Quel test suit la voie extrinsèque en insuffisance hépatique ?",
      "L’INR.",
      "b00059",
    ),
    card(
      "Quel facteur de coagulation reste longtemps normal ?",
      "Le fibrinogène ou facteur I.",
      "b00059",
    ),
    card(
      "Quelle anomalie phosphorée accompagne l’intoxication au paracétamol ?",
      "Une hypophosphorémie.",
      "b00060",
    ),
    card(
      "Que signifie une hypoglycémie dans l’insuffisance aiguë ?",
      "Un stade terminal par défaut de production hépatique de glucose.",
      "b00061",
    ),
    card(
      "Faut-il doser l’ammoniémie pour le pronostic de l’encéphalopathie ?",
      "Non, elle n’est pas un facteur pronostique requis.",
      "b00061",
    ),
    card(
      "Quelles lésions définissent morphologiquement la cirrhose ?",
      "Une fibrose avec transformation nodulaire anarchique.",
      "b00063",
    ),
    card(
      "Quelle infection peut compliquer l’ascite ?",
      "La péritonite bactérienne spontanée.",
      "b00063",
    ),
    card(
      "Pourquoi apparaît une tête de méduse ?",
      "Le sang portal développe une circulation veineuse collatérale.",
      "b00063",
    ),
    card(
      "Quel profil de résistances caractérise la cirrhose ?",
      "Des résistances vasculaires systémiques diminuées.",
      "b00064",
    ),
    card(
      "Pourquoi la cirrhose provoque-t-elle une hyponatrémie ?",
      "La vasodilatation active l’ADH et la rétention d’eau libre.",
      "b00064",
    ),
    card(
      "Quelle dysfonction cardiaque apparaît d’abord ?",
      "Une dysfonction diastolique après l’hyperdynamisme.",
      "b00067",
    ),
    card(
      "Quelle anomalie électrique accompagne la cardiomyopathie cirrhotique ?",
      "Un allongement du QT.",
      "b00067",
    ),
    card(
      "Quel traitement définitif du syndrome hépatorénal est cité ?",
      "La greffe hépatique.",
      "b00069",
    ),
    card(
      "Quels traitements soutiennent le syndrome hépatorénal ?",
      "Terlipressine et albumine.",
      "b00069",
    ),
    card(
      "Quel gradient définit le syndrome hépatopulmonaire ?",
      "Un gradient alvéolo-artériel supérieur à 15 mmHg.",
      "b00071",
    ),
    card(
      "Quel seuil de PaO₂ aggrave fortement le pronostic ?",
      "Une PaO₂ inférieure à 50 mmHg à l’air ambiant.",
      "b00071",
    ),
    card(
      "Quel seuil de pression pulmonaire contre-indique la greffe après traitement ?",
      "Une pression moyenne supérieure à 50 mmHg.",
      "b00071",
    ),
    card(
      "Quel seuil de résistances pulmonaires contre-indique la greffe ?",
      "Plus de 300 dynes/cm⁵.",
      "b00071",
    ),
    card(
      "Quelle dose de plasma est citée si INR supérieur à 2 ?",
      "Dix à quinze millilitres par kilogramme.",
      "b00075",
    ),
    card(
      "Quel seuil plaquettaire déclenche le repère transfusionnel cité ?",
      "Moins de 30 × 10⁹/L.",
      "b00076",
    ),
    card(
      "Quel seuil de fibrinogène déclenche le repère de cryoprécipités ?",
      "Moins de 2 g/L.",
      "b00077",
    ),
    card(
      "Pourquoi l’INR prédit-il mal le saignement du cirrhotique ?",
      "Il ignore la baisse simultanée des facteurs anticoagulants.",
      "b00078",
    ),
    card(
      "Quelles protéines anticoagulantes sont réduites ?",
      "Les protéines C et S et l’antithrombine.",
      "b00078",
    ),
    card(
      "Quel facteur procoagulant augmente en période de stress ?",
      "Le facteur VIII.",
      ["b00078", "b00079"],
    ),
    card(
      "Quelle protéase du von Willebrand diminue dans la cirrhose ?",
      "ADAMTS13.",
      "b00080",
    ),
    card(
      "Que faire d’un coagulogramme perturbé sans saignement ?",
      "Envisager l’attente plutôt qu’une correction prophylactique.",
      "b00080",
    ),
    card(
      "Quels organes évaluer avant anesthésie d’un cirrhotique ?",
      "Cœur, poumons, reins et hémostase.",
      "b00084",
    ),
    card(
      "Quels paramètres composent le MELD ?",
      "INR, créatinine et bilirubine.",
      "b00087",
    ),
    card(
      "Quel paramètre ajoute le MELD-Na ?",
      "La concentration sérique de sodium.",
      "b00087",
    ),
    card(
      "Quelle plage couvre le score MELD ?",
      "De 6 pour le moins sévère à 40 pour le plus sévère.",
      "b00087",
    ),
    card(
      "Quels domaines composent Child–Turcotte–Pugh ?",
      "Ascite, bilirubine, albumine, coagulation et encéphalopathie.",
      ["b00087", "b00088"],
    ),
    card(
      "Comment évolue le volume de distribution dans la cirrhose ?",
      "Il augmente.",
      ["b00090", "b00092"],
    ),
    card(
      "Comment évolue la liaison protéique dans la cirrhose ?",
      "Elle diminue avec l’hypoalbuminémie.",
      "b00092",
    ),
    card(
      "Quelle dose de propofol utiliser en cirrhose modérée ?",
      "La même dose d’induction ou de perfusion que chez le sujet sain.",
      "b00095",
    ),
    card(
      "Quand l’étomidate retarde-t-il surtout le réveil ?",
      "Lors d’une perfusion continue.",
      "b00096",
    ),
    card(
      "Quand la clairance du midazolam diminue-t-elle surtout ?",
      "En cas de cirrhose sévère.",
      "b00097",
    ),
    card(
      "Quel hypnotique a peu d’effet sur le débit hépatique ?",
      "La kétamine.",
      "b00098",
    ),
    card(
      "Quel opioïde est métabolisé par les estérases plasmatiques ?",
      "Le rémifentanil.",
      "b00099",
    ),
    card(
      "Quels opioïdes sont privilégiés chez le cirrhotique ?",
      "Le fentanyl et l’hydromorphone.",
      "b00099",
    ),
    card("Quel opioïde doit voir sa dose diminuée ?", "Le tramadol.", "b00099"),
    card(
      "Pourquoi la succinylcholine peut-elle durer plus longtemps ?",
      "L’activité des cholinestérases plasmatiques diminue.",
      "b00100",
    ),
    card(
      "Quel curare est prolongé par élimination biliaire ?",
      "Le rocuronium.",
      "b00101",
    ),
    card(
      "Quel curare est privilégié pour son élimination de Hofmann ?",
      "Le cisatracurium.",
      "b00101",
    ),
    card(
      "Quel métabolite du cisatracurium est épileptogène ?",
      "La laudanosine.",
      "b00101",
    ),
    card(
      "Comment adapter les AL amides en dose unique ?",
      "Garder la dose usuelle.",
      "b00102",
    ),
    card(
      "Comment adapter les AL amides répétés ou continus ?",
      "Réduire les doses de 10 à 50 %.",
      "b00102",
    ),
    card(
      "Quelle dose maximale de paracétamol est citée chez le cirrhotique ?",
      "Quatre grammes par jour au maximum.",
      "b00103",
    ),
    card(
      "Pourquoi les AINS sont-ils risqués chez le cirrhotique ?",
      "Atteinte rénale et risque de saignement digestif.",
      "b00103",
    ),
    card(
      "Quels volatils préservent mieux l’autorégulation hépatique ?",
      "Le sévoflurane et le desflurane.",
      "b00104",
    ),
    card(
      "Quel objectif principal poursuit le TIPS ?",
      "Réduire la pression portale et le risque de rupture variqueuse.",
      "b00108",
    ),
    card(
      "Quelle complication cardiaque précoce suit le TIPS ?",
      "Un OAP ou une insuffisance cardiaque par hausse du retour veineux.",
      "b00108",
    ),
    card(
      "Quelle complication neurologique tardive suit le TIPS ?",
      "Une encéphalopathie liée au court-circuit de la détoxification portale.",
      "b00108",
    ),
    card(
      "Pourquoi vise-t-on une TVC basse pendant une hépatectomie ?",
      "Pour diminuer les pertes sanguines.",
      "b00111",
    ),
    card(
      "Que fait la manœuvre de Pringle ?",
      "Elle interrompt les flux de l’artère hépatique et de la veine porte.",
      "b00111",
    ),
    card(
      "Quand une phlébotomie peut-elle être utilisée ?",
      "Chez un patient à fonction rénale normale.",
      "b00111",
    ),
    card(
      "Pourquoi certains évitent-ils la péridurale après hépatectomie ?",
      "La coagulopathie transitoire augmente le risque d’hématome.",
      "b00113",
    ),
    card(
      "Quelles sont les trois phases de la greffe hépatique ?",
      "Dissection, phase anhépatique et reperfusion.",
      "b00115",
    ),
    card(
      "Quelles indications définitives de greffe sont citées ?",
      "Cirrhose décompensée, hépatocarcinome non résécable, insuffisance aiguë.",
      "b00115",
    ),
  ];
}

const ISOLATED_QCM = [
  {
    title: "Anatomie et perfusion",
    questions: [
      qcm(
        "Quels repères physiologiques décrivent correctement le foie ?",
        src("b00004"),
        "Le foie est un organe volumineux et très perfusé dont le double apport soutient de multiples fonctions métaboliques.",
        [
          T(
            "Il pèse approximativement 1 500 grammes.",
            "Cette masse en fait l’organe abdominal le plus volumineux.",
          ),
          T(
            "Il reçoit environ un quart du débit cardiaque.",
            "Cette perfusion élevée explique sa vulnérabilité hémodynamique.",
          ),
          T(
            "La veine porte fournit la majorité du débit hépatique.",
            "Elle représente environ soixante-dix pour cent du débit.",
          ),
          F(
            "L’artère hépatique assure quatre-vingt-dix pour cent du débit.",
            "Sa contribution est proche de trente pour cent seulement.",
          ),
          T(
            "Trois veines sus-hépatiques drainent vers la veine cave inférieure.",
            "Elles constituent la principale voie de sortie du sang hépatique.",
          ),
        ],
      ),
      qcm(
        "Quelles fonctions majeures sont assurées par le foie ?",
        src("b00004"),
        "Le foie soutient nutrition, métabolisme, synthèse plasmatique, coagulation et élimination des substances.",
        [
          T(
            "Le stockage de nutriments.",
            "Cette fonction participe au maintien de l’homéostasie énergétique.",
          ),
          T(
            "Le métabolisme de nombreux médicaments.",
            "La clairance hépatique conditionne leur durée d’action.",
          ),
          T(
            "La synthèse des protéines plasmatiques.",
            "L’albumine et plusieurs protéines dépendent de cette fonction.",
          ),
          T(
            "La synthèse des facteurs de coagulation.",
            "L’insuffisance hépatique modifie fortement l’hémostase.",
          ),
          F(
            "La production exclusive des globules rouges adultes.",
            "L’érythropoïèse médullaire assure cette fonction chez l’adulte.",
          ),
        ],
      ),
      qcm(
        "Quels éléments appartiennent au lobule hépatique ?",
        src("b00009"),
        "Le lobule met en relation sinusoïdes, hépatocytes, triade vasculobiliaire et veine centrolobulaire.",
        [
          T(
            "Une veine centrolobulaire.",
            "Elle recueille le sang après son passage dans les sinusoïdes.",
          ),
          T(
            "Des hépatocytes autour de la veine centrale.",
            "Ces cellules assurent l’essentiel des fonctions métaboliques.",
          ),
          T(
            "Une artériole hépatique et une veinule portale.",
            "Elles constituent le double apport microcirculatoire.",
          ),
          T(
            "Des canalicules biliaires.",
            "Ils transportent la bile vers les conduits interlobulaires.",
          ),
          F(
            "Un glomérule filtrant le plasma.",
            "Cette structure appartient au néphron rénal, non au lobule.",
          ),
        ],
      ),
      qcm(
        "Quels rôles remplissent les cellules de Kupffer ?",
        src("b00009"),
        "Les cellules de Kupffer forment un système macrophagique sinusoïdal qui épure le sang portal.",
        [
          T(
            "Phagocyter des bactéries venues de l’intestin.",
            "Le sang portal expose directement le foie aux produits digestifs.",
          ),
          T(
            "Éliminer certains éléments étrangers circulants.",
            "Leur activité réticuloendothéliale assure cette clairance.",
          ),
          F(
            "Conjuguer seules toute la bilirubine.",
            "La conjugaison est principalement une fonction des hépatocytes.",
          ),
          F(
            "Produire les canalicules biliaires par contraction.",
            "Les canalicules sont des structures de drainage entre hépatocytes.",
          ),
          T(
            "Tapisser les sinusoïdes avec les cellules endothéliales.",
            "Elles résident dans la microcirculation sinusoïdale.",
          ),
        ],
      ),
      qcm(
        "Quelles conséquences anesthésiques découlent de la vascularisation hépatique ?",
        src("b00004", "b00111"),
        "La perfusion hépatique dépend de la pression, du débit cardiaque et du retour portal, tandis que la résection expose à l’hémorragie.",
        [
          T(
            "Une hypotension peut réduire le débit hépatique.",
            "La pression de perfusion chute avec la pression artérielle.",
          ),
          T(
            "Une baisse du retour portal peut diminuer l’apport hépatique.",
            "La veine porte fournit la majeure partie du débit.",
          ),
          F(
            "Le foie reste perfusé indépendamment du débit cardiaque.",
            "Il reçoit au contraire une fraction importante de ce débit.",
          ),
          T(
            "La proximité des veines sus-hépatiques augmente le risque de saignement en résection.",
            "Ces gros axes veineux peuvent être ouverts pendant la transection.",
          ),
          F(
            "Une TVC élevée diminue toujours les pertes de résection.",
            "Une pression veineuse élevée augmente la congestion et le saignement.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Insuffisance aiguë",
    questions: [
      qcm(
        "Quels critères définissent une insuffisance hépatique aiguë sévère ?",
        src("b00012", "b00013", "b00014", "b00015"),
        "La forme sévère survient sur foie sain avec altération de synthèse mais sans encéphalopathie.",
        [
          T(
            "Un INR supérieur à 1,5.",
            "Ce seuil traduit l’altération de la synthèse des facteurs.",
          ),
          T(
            "Un facteur V inférieur à 50 %.",
            "Sa diminution complète le critère biologique de gravité.",
          ),
          F(
            "Une encéphalopathie obligatoire.",
            "Sa présence transforme la forme sévère en forme grave.",
          ),
          T(
            "Une destruction hépatique massive et brutale.",
            "Elle est au cœur de l’insuffisance hépatocellulaire aiguë.",
          ),
          F(
            "Une cirrhose ancienne nécessaire.",
            "Le syndrome aigu décrit survient sur un foie auparavant sain.",
          ),
        ],
      ),
      qcm(
        "Comment classer la temporalité d’une hépatite aiguë grave ?",
        src("b00016", "b00017", "b00018"),
        "Le délai entre ictère et encéphalopathie distingue fulminance et subfulminance.",
        [
          T(
            "Moins de deux semaines définit la forme fulminante.",
            "Ictère et encéphalopathie se succèdent dans ce délai.",
          ),
          T(
            "Deux semaines à trois mois définit la forme subfulminante.",
            "Cette fenêtre correspond à une évolution plus lente.",
          ),
          F(
            "Au-delà de six mois reste une forme aiguë fulminante.",
            "Une atteinte dépassant six mois est considérée chronique.",
          ),
          T(
            "L’encéphalopathie est nécessaire à la forme grave.",
            "Elle différencie la forme grave de la forme sévère.",
          ),
          F(
            "L’ictère n’intervient jamais dans la définition temporelle.",
            "Son apparition sert de point de départ avec l’encéphalopathie.",
          ),
        ],
      ),
      qcm(
        "Quels éléments influencent fortement le pronostic de l’insuffisance aiguë ?",
        src("b00019"),
        "L’encéphalopathie marque une rupture pronostique majeure et la greffe modifie radicalement la survie.",
        [
          T(
            "L’absence d’encéphalopathie est associée à une mortalité inférieure à 2 %.",
            "Le pronostic reste relativement favorable sans atteinte neurologique.",
          ),
          T(
            "Une forme fulminante non greffée atteint 80 à 85 % de mortalité.",
            "La destruction hépatique et l’œdème cérébral expliquent ce risque.",
          ),
          T(
            "La greffe abaisse la mortalité fulminante vers 20 à 30 %.",
            "Le remplacement du foie restaure la fonction défaillante.",
          ),
          F(
            "La greffe n’améliore pas la survie d’une forme fulminante.",
            "Elle a précisément révolutionné ce pronostic.",
          ),
          F(
            "L’incidence exacte est connue par un registre exhaustif de population.",
            "Les données proviennent surtout de centres de greffe.",
          ),
        ],
      ),
      qcm(
        "Quelles défaillances peuvent accompagner l’insuffisance hépatique aiguë ?",
        src("b00053", "b00057"),
        "L’insuffisance aiguë est une maladie multiorganique associant cerveau, rein, circulation, poumon, métabolisme et infection.",
        [
          T(
            "Un œdème cérébral.",
            "L’hyperammoniémie et la glutamine astrocytaire y contribuent.",
          ),
          T(
            "Une insuffisance rénale.",
            "Elle peut être fonctionnelle ou structurelle.",
          ),
          T(
            "Un syndrome hémodynamique hyperkinétique.",
            "La vasodilatation systémique modifie profondément la circulation.",
          ),
          T(
            "Un syndrome de détresse respiratoire aiguë.",
            "Une atteinte pulmonaire peut s’intégrer à la défaillance multiple.",
          ),
          F(
            "Une stabilité constante de la glycémie.",
            "Hypoglycémie comme hyperglycémie peuvent survenir.",
          ),
        ],
      ),
      qcm(
        "Quelles anomalies biologiques orientent l’évaluation aiguë ?",
        src("b00059", "b00060", "b00061"),
        "Cholestase, cytolyse, défaut de synthèse, troubles acidobasiques et électrolytiques doivent être lus ensemble.",
        [
          T(
            "ASAT et ALAT élevées signalent la cytolyse.",
            "Ces aminotransférases augmentent lors de lésion hépatocytaire.",
          ),
          T(
            "Gamma-GT, PAL et bilirubine conjuguée élevées signalent la cholestase.",
            "Elles reflètent la diminution d’excrétion biliaire.",
          ),
          T(
            "Le facteur VII baisse précocement.",
            "Sa demi-vie d’environ quatre heures est la plus courte.",
          ),
          F(
            "Le fibrinogène chute toujours en premier.",
            "Il peut rester normal longtemps malgré l’insuffisance.",
          ),
          T(
            "L’alcalose respiratoire est fréquente au début.",
            "Une hyperventilation centrale en est le mécanisme.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Étiologies",
    questions: [
      qcm(
        "Quelles affirmations concernent l’hépatite A ?",
        src("b00022"),
        "Le VHA est un virus à ARN non enveloppé, aigu, diagnostiqué par IgM et sans chronicité.",
        [
          T(
            "L’incubation est voisine d’un mois.",
            "Ce délai précède habituellement une évolution favorable.",
          ),
          T(
            "Les IgM anti-VHA établissent le diagnostic aigu.",
            "Elles signent une infection récente.",
          ),
          F(
            "Une forme chronique est habituelle.",
            "Le virus de l’hépatite A ne persiste pas sous forme d’hépatite chronique.",
          ),
          T(
            "L’insuffisance aiguë est rare, autour de 1 %.",
            "La plupart des infections ont une issue favorable.",
          ),
          F(
            "La transmission exige la présence du VHB.",
            "Cette dépendance concerne le virus Delta.",
          ),
        ],
      ),
      qcm(
        "Quelles affirmations concernent l’hépatite B aiguë ?",
        src("b00023"),
        "Le VHB se diagnostique par IgM anti-HBc et peut rarement devenir fulminant.",
        [
          T(
            "L’incubation s’étend de dix semaines à six mois.",
            "Cette fenêtre est beaucoup plus longue que celle du VHA.",
          ),
          T(
            "Les IgM anti-HBc orientent le diagnostic aigu.",
            "Elles témoignent d’une infection récente.",
          ),
          T(
            "Nausées, asthénie, anorexie et arthralgies sont possibles.",
            "Ces symptômes précèdent souvent ictère et cytolyse.",
          ),
          T(
            "Une forme fulminante complique environ 1 % des cas.",
            "Cette complication reste rare mais grave.",
          ),
          F(
            "Le virus Delta empêche toute infection par le VHB.",
            "Le VHD dépend au contraire du VHB pour être infectieux.",
          ),
        ],
      ),
      qcm(
        "Quelles caractéristiques distinguent VHC, VHD et VHE ?",
        src("b00024", "b00025", "b00026", "b00027"),
        "Le VHC devient surtout chronique, le VHD dépend du VHB et le VHE partage l’épidémiologie du VHA.",
        [
          T(
            "Le VHC se transmet principalement par le sang.",
            "La contamination parentérale est son mode majeur.",
          ),
          T(
            "Le VHC est souvent asymptomatique et chronique.",
            "L’hépatite aiguë manifeste est rare.",
          ),
          T(
            "Le VHD ne devient infectieux qu’en présence du VHB.",
            "Il requiert l’enveloppe fournie par le virus B.",
          ),
          T(
            "Le VHE est un virus à ARN non enveloppé.",
            "Ses caractéristiques épidémiologiques ressemblent au VHA.",
          ),
          F(
            "Le VHE est limité aux pays sans zone endémique.",
            "Des zones endémiques existent en Asie, Afrique et ailleurs.",
          ),
        ],
      ),
      qcm(
        "Quels mécanismes caractérisent l’intoxication à l’acétaminophène ?",
        src("b00036"),
        "Le débordement des voies de neutralisation du NAPQI produit nécrose centrolobulaire et atteinte rénale possible.",
        [
          T(
            "Le NAPQI est le métabolite intermédiaire toxique.",
            "Il est normalement rapidement neutralisé aux doses thérapeutiques.",
          ),
          T(
            "Une dose toxique dépasse la capacité de neutralisation.",
            "Le métabolite réactif s’accumule alors dans l’hépatocyte.",
          ),
          T(
            "La nécrose prédomine en zone centrolobulaire.",
            "Cette zone est particulièrement vulnérable au métabolite.",
          ),
          T(
            "Une insuffisance rénale peut accompagner l’intoxication.",
            "L’atteinte ne se limite pas toujours au foie.",
          ),
          F(
            "Les symptômes sont toujours absents pendant une semaine.",
            "Nausées, vomissements et hépatalgie peuvent survenir en 24 à 36 heures.",
          ),
        ],
      ),
      qcm(
        "Quelles causes non virales d’hépatopathie sont correctement associées ?",
        src("b00034", "b00037", "b00039", "b00041", "b00043"),
        "Alcool, toxiques, maladies métaboliques, auto-immunité et hypoxie produisent des profils différents d’atteinte.",
        [
          T(
            "Alcool chronique massif — hépatite aiguë sur maladie chronique.",
            "Une hausse récente de consommation peut déclencher la décompensation.",
          ),
          T(
            "Amanite phalloïde — hépatite potentiellement fatale.",
            "L’alpha-amanitine provoque une toxicité hépatique majeure.",
          ),
          T(
            "Maladie de Wilson — accumulation hépatique de cuivre.",
            "Le trouble du métabolisme du cuivre endommage le foie.",
          ),
          T(
            "Hépatite auto-immune — auto-anticorps et hypergammaglobulinémie.",
            "L’immunosuppression constitue le traitement médical.",
          ),
          F(
            "Foie cardiaque — mécanisme exclusivement infectieux.",
            "Congestion, ischémie et hypoxie expliquent ce syndrome.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Cirrhose systémique",
    questions: [
      qcm(
        "Quelles conséquences découlent du remodelage cirrhotique ?",
        src("b00063"),
        "La fibrose nodulaire obstrue le système portal et altère synthèse, métabolisme et détoxification.",
        [
          T(
            "Une hypertension portale.",
            "Le foie remodelé oppose une résistance au retour portal.",
          ),
          T(
            "Une ascite susceptible de s’infecter.",
            "La transsudation péritonéale expose à la péritonite bactérienne spontanée.",
          ),
          T(
            "Des varices œsophagiennes.",
            "La circulation collatérale contourne l’obstacle portal.",
          ),
          T(
            "Une hypoalbuminémie.",
            "La synthèse réduite et les pertes dans l’ascite abaissent l’albumine.",
          ),
          F(
            "Une disparition de tout risque thrombotique.",
            "L’hémostase reste rééquilibrée et peut aussi favoriser la coagulation.",
          ),
        ],
      ),
      qcm(
        "Quels mécanismes expliquent le profil hémodynamique cirrhotique ?",
        src("b00064"),
        "Vasodilatation systémique et splanchnique produit hyperdébit, sous-remplissage artériel et rétention hydrique.",
        [
          T(
            "Les résistances vasculaires systémiques sont diminuées.",
            "Les shunts et médiateurs vasodilatateurs expliquent ce profil.",
          ),
          T(
            "La vasodilatation splanchnique réduit la perfusion rénale efficace.",
            "Le sang se distribue davantage dans le territoire abdominal.",
          ),
          T(
            "L’ADH augmente en réponse au sous-remplissage.",
            "Elle favorise la réabsorption d’eau libre.",
          ),
          T(
            "Une hyponatrémie de dilution peut apparaître.",
            "La rétention d’eau dépasse celle du sodium.",
          ),
          F(
            "Le débit cardiaque reste toujours bas dès le début.",
            "La circulation est classiquement hyperdynamique.",
          ),
        ],
      ),
      qcm(
        "Quels signes appartiennent à la cardiomyopathie cirrhotique ?",
        src("b00067"),
        "Une circulation hyperdynamique masque d’abord une dysfonction diastolique puis systolique avec faible réserve.",
        [
          T(
            "Une dysfonction diastolique.",
            "Elle peut être identifiée par échocardiographie.",
          ),
          T(
            "Une dysfonction systolique plus tardive.",
            "Elle est plus difficile à diagnostiquer au repos.",
          ),
          T(
            "Un allongement de l’intervalle QT.",
            "Des troubles du rythme peuvent accompagner la cardiomyopathie.",
          ),
          T(
            "Une réponse cardiaque diminuée à l’exercice.",
            "La réserve contractile est limitée malgré l’hyperdébit basal.",
          ),
          F(
            "Une hypertension systémique constante révélant facilement la maladie.",
            "Les résistances basses peuvent masquer la dysfonction.",
          ),
        ],
      ),
      qcm(
        "Comment différencier les principales insuffisances rénales chez le cirrhotique ?",
        src("b00069"),
        "L’hydratation corrige le prérénal, le syndrome hépatorénal requiert vasoconstriction et greffe, la nécrose tubulaire est structurelle.",
        [
          T(
            "Une insuffisance prérénale peut répondre à l’hydratation.",
            "La restauration du volume efficace corrige ce mécanisme.",
          ),
          T(
            "Le syndrome hépatorénal est fonctionnel.",
            "Le rein est initialement structurellement préservé.",
          ),
          T(
            "Terlipressine et albumine soutiennent le syndrome hépatorénal.",
            "Ces traitements améliorent la circulation en attente de greffe.",
          ),
          T(
            "La greffe est le traitement définitif du syndrome hépatorénal.",
            "Elle corrige la maladie hépatique responsable.",
          ),
          F(
            "La nécrose tubulaire aiguë se corrige toujours par albumine seule.",
            "Cette atteinte structurelle n’a pas de traitement spécifique cité.",
          ),
        ],
      ),
      qcm(
        "Quels critères décrivent le syndrome hépatopulmonaire ?",
        src("b00071"),
        "Le syndrome associe hypertension portale, vasodilatation intrapulmonaire et défaut d’oxygénation.",
        [
          T(
            "Un gradient alvéolo-artériel supérieur à 15 mmHg.",
            "Ce seuil à l’air ambiant appartient à la définition.",
          ),
          T(
            "Une vasodilatation des capillaires intrapulmonaires.",
            "Elle crée un trouble de diffusion et de rapport ventilation-perfusion.",
          ),
          T(
            "Une pression portale pathologiquement élevée.",
            "L’hypertension du système porte appartient au terrain définissant ce syndrome.",
          ),
          F(
            "Une correction complète de la saturation par toute hausse de FiO₂.",
            "L’oxygénation peut rester peu réactive à l’augmentation d’oxygène.",
          ),
          T(
            "Une PaO₂ inférieure à 50 mmHg est de mauvais pronostic.",
            "Ce seuil s’accompagne d’une forte augmentation de mortalité.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Hémostase et scores",
    questions: [
      qcm(
        "Quels seuils transfusionnels sont cités comme repères ?",
        src("b00073", "b00074", "b00075", "b00076", "b00077"),
        "Les seuils usuels guident une réflexion clinique mais ne décrivent pas à eux seuls l’hémostase du cirrhotique.",
        [
          T(
            "Culots globulaires pour une hémoglobine entre 60 et 100 g/L selon le contexte.",
            "Cette zone nécessite une décision individualisée.",
          ),
          T(
            "Plasma 10 à 15 mL/kg si INR supérieur à 2.",
            "Ce repère est historiquement proposé par l’ASA.",
          ),
          T(
            "Plaquettes 5 à 10 unités si numération inférieure à 30 × 10⁹/L.",
            "Ce seuil correspond au repère cité.",
          ),
          T(
            "Cryoprécipités 5 à 10 unités si fibrinogène inférieur à 2 g/L.",
            "Cette supplémentation vise le déficit en fibrinogène.",
          ),
          F(
            "Plasma systématique dès que l’INR dépasse 1,1 sans saignement.",
            "Une correction prophylactique aussi large est injustifiée.",
          ),
        ],
      ),
      qcm(
        "Pourquoi les tests conventionnels prédisent-ils mal le saignement cirrhotique ?",
        src("b00078", "b00079", "b00080"),
        "Le foie défaillant diminue simultanément coagulation et anticoagulation tandis que von Willebrand et facteur VIII augmentent.",
        [
          T(
            "Les facteurs procoagulants sont diminués.",
            "La synthèse hépatique insuffisante abaisse plusieurs facteurs.",
          ),
          T(
            "Les protéines C et S sont également diminuées.",
            "Le versant anticoagulant est lui aussi déficitaire.",
          ),
          T(
            "Le facteur VIII augmente en situation de stress.",
            "Sa production partiellement extrahépatique contribue à cette hausse.",
          ),
          T(
            "ADAMTS13 diminue et laisse davantage de von Willebrand non clivé.",
            "L’adhésion plaquettaire peut ainsi rester efficace.",
          ),
          F(
            "L’INR mesure directement l’ensemble du versant anticoagulant.",
            "Il a été conçu pour la warfarine et n’intègre pas cet équilibre.",
          ),
        ],
      ),
      qcm(
        "Quelles attitudes sont raisonnables devant un cirrhotique sans saignement ?",
        src("b00078", "b00080", "b00081"),
        "Une anomalie isolée ne commande pas automatiquement une transfusion, mais les gestes neuraxiaux ou profonds imposent davantage de prudence.",
        [
          T(
            "Interpréter l’INR avec le contexte clinique.",
            "Sa valeur isolée prédit difficilement le saignement.",
          ),
          T(
            "Éviter une correction prophylactique automatique.",
            "Les grandes séries de greffe soutiennent une attitude d’attente.",
          ),
          T(
            "Renforcer la prudence avant un bloc neuraxial.",
            "Un hématome dans un espace non compressible est grave.",
          ),
          T(
            "Prendre en compte le saignement réel et l’évolution.",
            "La clinique et la dynamique sont essentielles.",
          ),
          F(
            "Considérer toute thrombopénie comme une incapacité absolue à coaguler.",
            "Le facteur von Willebrand élevé compense partiellement l’adhésion.",
          ),
        ],
      ),
      qcm(
        "Quels paramètres composent les scores de sévérité ?",
        src("b00087", "b00088"),
        "Child–Turcotte–Pugh associe clinique et biologie, tandis que MELD repose sur des paramètres biochimiques puis le sodium.",
        [
          T(
            "Child inclut l’ascite.",
            "Cette manifestation clinique reflète l’hypertension portale et la synthèse.",
          ),
          T(
            "Child inclut l’encéphalopathie.",
            "Le grade neurologique participe à la sévérité.",
          ),
          T(
            "MELD inclut INR, créatinine et bilirubine.",
            "Ces trois variables forment l’équation initiale.",
          ),
          T(
            "MELD-Na ajoute le sodium sérique.",
            "L’hyponatrémie améliore la stratification pronostique.",
          ),
          F(
            "MELD repose sur l’ASAT seule.",
            "Les aminotransférases ne constituent pas l’équation du MELD.",
          ),
        ],
      ),
      qcm(
        "Comment interpréter l’échelle MELD ?",
        src("b00087"),
        "Le MELD s’étend de 6 à 40 et augmente avec la sévérité, notamment pour prioriser la greffe.",
        [
          T(
            "Un score de 6 correspond aux patients les moins sévèrement malades.",
            "Il représente l’extrémité basse de l’échelle.",
          ),
          T(
            "Un score de 40 correspond aux patients les plus sévèrement malades.",
            "Il traduit une défaillance avancée.",
          ),
          T(
            "Le score a été développé pour prédire la morbidité après TIPS.",
            "Cette origine précède son usage en allocation de greffe.",
          ),
          T(
            "Il a remplacé en partie Child pour prioriser la greffe.",
            "Sa base objective a favorisé cette adoption.",
          ),
          F(
            "Une valeur élevée garantit l’absence de dysfonction rénale.",
            "La créatinine élevée augmente au contraire le score.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Pharmacologie",
    questions: [
      qcm(
        "Quelles modifications pharmacocinétiques produit la cirrhose ?",
        src("b00090", "b00091", "b00092", "b00093", "b00094"),
        "Clairance et liaison protéique diminuent, volume de distribution augmente et aucun test simple ne quantifie la clairance hépatique.",
        [
          T(
            "La clairance hépatique diminue.",
            "Le parenchyme fonctionnel et le débit sont réduits.",
          ),
          T(
            "Le volume de distribution augmente.",
            "Ascite et modifications hydriques y contribuent.",
          ),
          T(
            "La liaison protéique diminue.",
            "L’hypoalbuminémie augmente la fraction libre.",
          ),
          T(
            "Le métabolisme baisse avec le débit hépatique.",
            "Les agents à forte extraction y sont sensibles.",
          ),
          F(
            "Un test unique mesure précisément la clairance hépatique de chaque médicament.",
            "Aucun équivalent simple de la clairance rénale n’existe.",
          ),
        ],
      ),
      qcm(
        "Comment utiliser les principaux hypnotiques ?",
        src("b00095", "b00096", "b00097", "b00098"),
        "Le propofol reste utilisable en cirrhose modérée, tandis que perfusions d’étomidate et midazolam sévère prolongent le réveil.",
        [
          T(
            "Le propofol peut garder sa dose usuelle en cirrhose modérée.",
            "Induction et perfusion sont peu modifiées dans ce stade.",
          ),
          T(
            "Une perfusion continue d’étomidate peut retarder le réveil.",
            "Son métabolisme entièrement hépatique devient limitant en administration prolongée.",
          ),
          T(
            "Le midazolam est surtout prolongé en cirrhose sévère.",
            "Le CYP3A est affecté tardivement dans l’évolution.",
          ),
          T(
            "La kétamine a peu d’effet sur le débit hépatique.",
            "Cette stabilité est un avantage hémodynamique relatif.",
          ),
          F(
            "L’étomidate augmente toujours le débit de l’artère hépatique.",
            "Il peut le diminuer par hausse des résistances et baisse du débit cardiaque.",
          ),
        ],
      ),
      qcm(
        "Quels opioïdes sont adaptés à l’insuffisance hépatique ?",
        src("b00099"),
        "Privilégier agents peu modifiés ou à métabolisme extrahépatique et réduire ceux qui dépendent d’une activation hépatique.",
        [
          T(
            "Le rémifentanil est peu affecté.",
            "Les estérases plasmatiques assurent son métabolisme.",
          ),
          T(
            "Une dose unique de fentanyl est peu modifiée.",
            "Sa cinétique change peu dans cette situation.",
          ),
          T(
            "L’hydromorphone fait partie des agents privilégiés.",
            "Elle est proposée avec le fentanyl chez le cirrhotique.",
          ),
          T(
            "Le tramadol doit voir sa dose diminuée.",
            "Son métabolisme et son action mixte imposent la prudence.",
          ),
          F(
            "La codéine est idéale car elle ne nécessite aucune transformation.",
            "Elle doit être convertie en morphine, processus dépendant du foie.",
          ),
        ],
      ),
      qcm(
        "Quels choix de curare limitent l’accumulation hépatique ?",
        src("b00100", "b00101"),
        "Le cisatracurium contourne le foie par Hofmann, contrairement au rocuronium biliaire et à la succinylcholine prolongée.",
        [
          T(
            "Le cisatracurium est un curare de choix.",
            "Son élimination de Hofmann est indépendante du foie.",
          ),
          T(
            "Le rocuronium peut avoir une durée prolongée.",
            "Il est métabolisé par le foie et éliminé surtout dans la bile.",
          ),
          T(
            "La succinylcholine peut durer davantage.",
            "Les cholinestérases plasmatiques sont diminuées.",
          ),
          F(
            "La laudanosine est totalement inerte lors de perfusions prolongées.",
            "Ce métabolite a des propriétés épileptogènes et une élimination hépatique.",
          ),
          F(
            "Le sugammadex possède une cinétique parfaitement établie en cirrhose.",
            "Les données pharmacocinétiques y sont peu connues.",
          ),
        ],
      ),
      qcm(
        "Comment adapter anesthésiques locaux et antalgiques ?",
        src("b00102", "b00103"),
        "La dose unique d’amide reste usuelle, les expositions répétées diminuent, et les AINS menacent rein et tube digestif.",
        [
          T(
            "Une dose unique d’AL amide peut rester identique.",
            "Sa cinétique ponctuelle est proche de celle du sujet sain.",
          ),
          T(
            "Une perfusion d’AL amide doit être réduite de 10 à 50 %.",
            "L’accumulation devient pertinente avec l’exposition prolongée.",
          ),
          T(
            "Le paracétamol ne doit pas dépasser 4 g par jour dans ce texte.",
            "Sa demi-vie est néanmoins augmentée chez le cirrhotique.",
          ),
          T(
            "Les AINS peuvent aggraver la fonction rénale.",
            "L’inhibition des prostaglandines réduit la vasodilatation rénale protectrice.",
          ),
          F(
            "Les COX-2 sont démontrés parfaitement sûrs dans la cirrhose.",
            "Ils n’ont pas été étudiés dans cette population.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Chirurgie hépatobiliaire",
    questions: [
      qcm(
        "Quelles complications peuvent suivre un TIPS ?",
        src("b00108"),
        "Le TIPS expose à des lésions vasculaires, une surcharge cardiaque précoce et une encéphalopathie plus tardive.",
        [
          T(
            "Un hémopéritoine lié à la traversée hépatique.",
            "La perforation d’un gros vaisseau peut saigner dans le péritoine.",
          ),
          T(
            "Une hémobilie par communication vasculobiliaire.",
            "Une communication vasculobiliaire peut survenir pendant la traversée.",
          ),
          T(
            "Un œdème aigu pulmonaire au réveil.",
            "L’augmentation brusque du retour veineux surcharge le cœur.",
          ),
          T(
            "Une encéphalopathie à moyen terme.",
            "Le shunt réduit l’épuration hépatique des substances portales.",
          ),
          F(
            "Une diminution constante du retour veineux cardiaque.",
            "Le retour veineux augmente brutalement après ouverture du shunt.",
          ),
        ],
      ),
      qcm(
        "Quels objectifs et risques caractérisent la résection hépatique ?",
        src("b00110", "b00111"),
        "Même avec fonction normale, la transection hépatique expose à une hémorragie qui justifie monitorage et contrôle de la pression veineuse.",
        [
          T(
            "Une hémorragie importante reste possible avec une coagulation normale.",
            "Le risque provient de la richesse vasculaire du foie.",
          ),
          T(
            "Les accès veineux doivent être adaptés au risque.",
            "Une transfusion et un remplissage rapides peuvent devenir nécessaires.",
          ),
          T(
            "Une TVC basse peut réduire les pertes.",
            "Elle diminue la pression dans les veines hépatiques.",
          ),
          T(
            "Le Trendelenburg inversé peut diminuer la pression intrahépatique.",
            "La position proclive contribue à réduire la congestion veineuse.",
          ),
          F(
            "Une TVC élevée protège mécaniquement contre l’ouverture veineuse.",
            "Elle augmente au contraire le gradient de saignement.",
          ),
        ],
      ),
      qcm(
        "Quelles techniques peuvent contribuer à une TVC basse ?",
        src("b00111"),
        "Position, vasodilatation, diurèse et stratégies invasives sont sélectionnées selon le terrain, surtout la fonction rénale.",
        [
          T(
            "Le Trendelenburg inversé.",
            "La position diminue la pression veineuse intrahépatique.",
          ),
          T(
            "La nitroglycérine.",
            "La venodilatation peut réduire la pression de remplissage.",
          ),
          T(
            "Le furosémide.",
            "La diurèse participe à la réduction volémique contrôlée.",
          ),
          T(
            "Une phlébotomie sans remplacement chez un patient à rein normal.",
            "Cette technique est réservée à une fonction rénale préservée.",
          ),
          F(
            "Un remplissage massif systématique avant la transection.",
            "Il augmenterait la TVC et les pertes sanguines.",
          ),
        ],
      ),
      qcm(
        "Quelles conséquences analgésiques suit l’hépatectomie ?",
        src("b00113"),
        "La coagulopathie transitoire limite parfois la péridurale et favorise une analgésie multimodale compatible avec ERAS.",
        [
          T(
            "Une insuffisance hépatique transitoire peut durer quelques jours.",
            "La masse fonctionnelle baisse après la résection.",
          ),
          T(
            "La coagulation peut se perturber en postopératoire.",
            "Cette évolution augmente le risque autour d’un cathéter péridural.",
          ),
          T(
            "Certains centres évitent la péridurale.",
            "Le risque d’hématome neuraxial motive cette prudence.",
          ),
          T(
            "Une ACP peut remplacer ou compléter l’analgésie.",
            "Elle est proposée en l’absence de péridurale.",
          ),
          F(
            "ERAS impose toujours une péridurale prolongée.",
            "Ces programmes tendent au contraire à la limiter ou la bannir.",
          ),
        ],
      ),
      qcm(
        "Quelles affirmations concernent la greffe hépatique ?",
        src("b00115"),
        "La greffe est un traitement définitif désormais standardisé, organisé en dissection, phase anhépatique et reperfusion.",
        [
          T(
            "Elle traite la cirrhose décompensée.",
            "Le remplacement d’organe corrige l’insuffisance terminale.",
          ),
          T(
            "Elle peut traiter un hépatocarcinome non résécable.",
            "Cette indication oncologique est explicitement citée.",
          ),
          T(
            "Elle peut traiter l’insuffisance hépatique aiguë.",
            "La forme fulminante tire un bénéfice vital de la greffe.",
          ),
          T(
            "La phase anhépatique précède la reperfusion.",
            "Le foie natif est retiré avant revascularisation du greffon.",
          ),
          F(
            "Elle reste aujourd’hui une procédure expérimentale.",
            "Les progrès anesthésiques, chirurgicaux et immunosuppresseurs l’ont standardisée.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Décisions périopératoires",
    questions: [
      qcm(
        "Quels éléments justifient une orientation urgente vers un centre de greffe ?",
        src("b00016", "b00019", "b00115"),
        "Une insuffisance aiguë grave ou fulminante associe atteinte de synthèse et encéphalopathie avec mortalité élevée sans transplantation.",
        [
          T(
            "Une encéphalopathie sur insuffisance aiguë sévère.",
            "L’atteinte neurologique transforme la forme sévère en forme grave.",
          ),
          T(
            "Un intervalle ictère–encéphalopathie inférieur à deux semaines.",
            "Cette temporalité définit une évolution fulminante de très mauvais pronostic.",
          ),
          F(
            "Une hépatite A simple sans trouble de synthèse.",
            "La majorité des infections par le VHA évoluent favorablement sans greffe.",
          ),
          T(
            "Une défaillance multiorganique rapidement progressive.",
            "L’association neurologique, rénale ou circulatoire impose une expertise spécialisée.",
          ),
          F(
            "Une élévation isolée de gamma-GT sans signe clinique.",
            "La cholestase biologique isolée ne constitue pas une indication urgente de transplantation.",
          ),
        ],
      ),
      qcm(
        "Quels paramètres faut-il réunir avant une chirurgie majeure chez un cirrhotique ?",
        src("b00064", "b00067", "b00069", "b00071", "b00087"),
        "La stratification associe sévérité hépatique, fonction cardiaque, oxygénation, fonction rénale et état circulatoire.",
        [
          T(
            "Un score MELD ou MELD-Na actualisé.",
            "Il intègre synthèse, excrétion, rein et éventuellement sodium dans le pronostic.",
          ),
          T(
            "Une évaluation de la réserve cardiaque.",
            "La cardiomyopathie cirrhotique peut être masquée par l’hyperdébit basal.",
          ),
          T(
            "Une mesure de l’oxygénation si une dyspnée est présente.",
            "Le syndrome hépatopulmonaire peut provoquer une hypoxémie sévère peu réversible.",
          ),
          T(
            "Une analyse de la fonction rénale et de la volémie efficace.",
            "Une insuffisance prérénale ou hépatorénale modifie fortement le risque.",
          ),
          F(
            "La seule valeur des aminotransférases comme bilan exhaustif.",
            "La cytolyse ne décrit ni réserve globale ni complications systémiques.",
          ),
        ],
      ),
      qcm(
        "Quelles mesures protègent le débit hépatique pendant l’anesthésie ?",
        src("b00004", "b00105", "b00106"),
        "Le maintien d’une pression et d’un débit cardiaque suffisants, ainsi que le choix d’agents préservant l’autorégulation, soutiennent la perfusion.",
        [
          T(
            "Éviter une hypotension prolongée.",
            "La double vascularisation reste dépendante d’une pression de perfusion adéquate.",
          ),
          F(
            "Provoquer une vasoconstriction systémique extrême sans monitorage.",
            "Une réduction excessive du débit peut compromettre les apports portal et artériel.",
          ),
          T(
            "Titrer les agents intraveineux selon la réserve circulatoire.",
            "Ils ont généralement moins d’effet direct sur le débit hépatique que les volatils.",
          ),
          T(
            "Préférer sévoflurane ou desflurane à l’halothane si un volatil est choisi.",
            "Ces agents préservent mieux l’autorégulation hépatique.",
          ),
          T(
            "Maintenir un débit cardiaque compatible avec la perfusion d’organe.",
            "Le foie reçoit environ un quart du débit cardiaque total.",
          ),
        ],
      ),
      qcm(
        "Quels principes sécurisent l’analgésie après hépatectomie ?",
        src("b00102", "b00103", "b00113"),
        "Une stratégie multimodale anticipe la coagulopathie transitoire, limite les cathéters neuraxiaux prolongés et adapte les médicaments.",
        [
          F(
            "Retirer une péridurale sans contrôler l’INR.",
            "La fonction de synthèse peut se dégrader plusieurs jours après la résection.",
          ),
          T(
            "Prévoir une ACP lorsque la voie péridurale est écartée.",
            "Le patient peut titrer l’opioïde dans un cadre surveillé.",
          ),
          T(
            "Associer des alternatives comme la kétamine ou la lidocaïne.",
            "Ces agents peuvent réduire les besoins opioïdes dans une approche multimodale.",
          ),
          F(
            "Prescrire systématiquement un AINS malgré une fonction rénale fragile.",
            "L’inhibition des prostaglandines expose le rein cirrhotique à l’hypoperfusion.",
          ),
          T(
            "Vérifier la coagulation avant toute manipulation neuraxiale.",
            "Le retrait d’un cathéter pendant une coagulopathie expose à un hématome.",
          ),
        ],
      ),
      qcm(
        "Quels critères distinguent cholestase, cytolyse et défaut de synthèse ?",
        src("b00059"),
        "Les marqueurs d’excrétion biliaire, de lésion hépatocytaire et de synthèse décrivent trois dimensions différentes de la fonction hépatique.",
        [
          T(
            "Gamma-GT et phosphatases alcalines orientent vers la cholestase.",
            "Leur augmentation accompagne une diminution de l’excrétion biliaire.",
          ),
          T(
            "ASAT et ALAT témoignent d’une cytolyse.",
            "Ces enzymes s’élèvent lorsque les hépatocytes sont lésés.",
          ),
          F(
            "L’albumine élevée prouve une insuffisance de synthèse aiguë.",
            "C’est une diminution de la production protéique qui traduit la défaillance.",
          ),
          T(
            "Le facteur VII diminue précocement lors d’un défaut de synthèse.",
            "Sa demi-vie très courte rend sa baisse rapidement visible.",
          ),
          F(
            "La bilirubine conjuguée est un marqueur direct de filtration glomérulaire.",
            "Elle renseigne l’excrétion hépatobiliaire et non la fonction rénale.",
          ),
        ],
      ),
    ],
  },
];

function buildIsolatedQcm() {
  return ISOLATED_QCM.map((entry, index) => ({
    label: `QCM ${index + 1} · ${entry.title}`,
    allowed_voies: ["interne"],
    questions: entry.questions,
  }));
}

const DP_QCM = [
  {
    title: "Intoxication au paracétamol",
    vignette:
      "Mme Valette est une patiente de 28 ans, sans maladie hépatique connue, admise douze heures après une ingestion massive d’acétaminophène. Elle présente nausées, sueurs et douleur de l’hypochondre droit. Sa pression artérielle est normale, mais les aminotransférases commencent à augmenter.",
    questions: [
      qcm(
        "Quels mécanismes expliquent la toxicité attendue ?",
        src("b00036"),
        "L’accumulation de NAPQI après saturation des voies de neutralisation produit une nécrose centrolobulaire et parfois une atteinte rénale.",
        [
          T(
            "Le NAPQI est le métabolite hépatotoxique.",
            "Ce composé réactif est normalement neutralisé aux doses thérapeutiques.",
          ),
          T(
            "La capacité de neutralisation est dépassée lors du surdosage.",
            "Le métabolite toxique s’accumule alors dans les hépatocytes.",
          ),
          T(
            "La nécrose prédomine dans la zone centrolobulaire.",
            "Cette région est la cible histologique décrite de l’intoxication.",
          ),
          T(
            "Une insuffisance rénale peut accompagner l’atteinte hépatique.",
            "La toxicité peut provoquer une défaillance rénale associée.",
          ),
          F(
            "Le produit toxique est excrété intact sans métabolisme hépatique.",
            "Trois voies métaboliques hépatiques précèdent la formation du NAPQI.",
          ),
        ],
      ),
      qcm(
        "Vingt-quatre heures après l’ingestion, l’INR atteint 1,8 et le facteur V 42 %, sans trouble neurologique. Comment classer l’insuffisance ?",
        src("b00013", "b00014", "b00015", "b00016"),
        "Les deux seuils biologiques sont franchis sans encéphalopathie : il s’agit d’une insuffisance aiguë sévère, non encore grave.",
        [
          T(
            "La forme aiguë sévère est constituée.",
            "INR supérieur à 1,5 et facteur V inférieur à 50 % remplissent la définition.",
          ),
          F(
            "La forme grave est déjà certaine.",
            "Aucune encéphalopathie n’est présente à ce moment.",
          ),
          T(
            "Une surveillance neurologique rapprochée est nécessaire.",
            "L’apparition d’une encéphalopathie changerait immédiatement la catégorie.",
          ),
          F(
            "La normalité tensionnelle exclut une évolution défavorable.",
            "La gravité hépatocellulaire précède parfois les défaillances hémodynamiques.",
          ),
          T(
            "Le syndrome survient ici sur un foie auparavant sain.",
            "La patiente n’a pas de maladie chronique connue.",
          ),
        ],
        "Vingt-quatre heures après l’ingestion, l’INR atteint 1,8 et le facteur V 42 %, sans trouble neurologique.",
      ),
      qcm(
        "Le lendemain, elle présente un astérixis. Quelles conclusions tirer ?",
        src("b00016", "b00048", "b00050"),
        "L’astérixis correspond au grade 2 et transforme l’insuffisance sévère en insuffisance grave avec atteinte neurologique.",
        [
          T(
            "L’encéphalopathie est de grade 2.",
            "L’astérixis définit ce niveau neurologique.",
          ),
          T(
            "L’insuffisance hépatique est désormais grave.",
            "L’encéphalopathie s’ajoute aux critères biologiques sévères.",
          ),
          T(
            "Le pronostic se dégrade par rapport à l’absence d’encéphalopathie.",
            "La mortalité augmente fortement avec l’atteinte cérébrale.",
          ),
          F(
            "Le signe correspond à un coma de grade 4.",
            "Le coma est une étape beaucoup plus avancée.",
          ),
          F(
            "L’astérixis prouve une récupération hépatique.",
            "Il indique au contraire une accumulation neurotoxique.",
          ),
        ],
        "Le lendemain, elle présente un astérixis.",
      ),
      qcm(
        "L’ammoniémie est élevée et la patiente devient confuse. Quels mécanismes cérébraux sont plausibles ?",
        src("b00051", "b00053", "b00061"),
        "L’ammoniaque échappe au cycle de l’urée, devient glutamine astrocytaire et participe à la dysrégulation du débit cérébral et à l’œdème.",
        [
          T(
            "La confusion correspond au grade 3.",
            "Cette altération neurologique suit l’astérixis dans la gradation.",
          ),
          T(
            "Le foie ne convertit plus efficacement l’ammoniaque en urée.",
            "La défaillance du cycle hépatique augmente l’exposition systémique.",
          ),
          T(
            "Les astrocytes transforment l’ammoniaque en glutamine.",
            "Cette détoxification intracérébrale perturbe leur osmolarité.",
          ),
          T(
            "Un œdème cérébral peut apparaître.",
            "La dysrégulation cérébrale accompagne les formes graves.",
          ),
          F(
            "Le niveau d’ammoniaque mesure exactement le pronostic individuel.",
            "Son dosage n’est pas requis comme facteur pronostique de l’encéphalopathie.",
          ),
        ],
        "L’ammoniémie est élevée et la patiente devient confuse.",
      ),
      qcm(
        "La glycémie chute et le phosphate diminue. Comment interpréter ces anomalies ?",
        src("b00057", "b00060", "b00061"),
        "Hypoglycémie et hypophosphorémie s’intègrent à la défaillance aiguë, la première signalant une incapacité terminale à produire du glucose.",
        [
          T(
            "L’hypoglycémie traduit un défaut de glycogénolyse.",
            "Le foie ne mobilise plus correctement ses réserves glucidiques.",
          ),
          T(
            "La néoglucogenèse hépatique devient insuffisante.",
            "Cette voie ne compense plus les besoins métaboliques.",
          ),
          T(
            "L’hypophosphorémie est décrite dans l’intoxication au paracétamol.",
            "Cette anomalie électrolytique accompagne spécifiquement ce contexte.",
          ),
          F(
            "La dysglycémie exclut toute défaillance multiorganique.",
            "Les troubles métaboliques font justement partie du syndrome multiple.",
          ),
          T(
            "Une correction et une surveillance rapprochées sont nécessaires.",
            "Ces désordres exposent à des complications neurologiques et cardiaques.",
          ),
        ],
        "La glycémie chute et le phosphate diminue.",
      ),
      qcm(
        "L’ictère et l’encéphalopathie sont apparus à quatre jours d’intervalle. Quelle temporalité retenir ?",
        src("b00017", "b00019"),
        "Un intervalle inférieur à deux semaines définit une hépatite fulminante, dont le pronostic sans greffe est très sombre.",
        [
          T(
            "La forme est fulminante.",
            "Quatre jours se situent nettement sous le seuil de deux semaines.",
          ),
          F(
            "La forme est subfulminante.",
            "Cette catégorie commence après deux semaines.",
          ),
          T(
            "La mortalité sans greffe peut atteindre 80 à 85 %.",
            "L’encéphalopathie fulminante marque une gravité extrême.",
          ),
          T(
            "Une évaluation de greffe est urgente.",
            "La transplantation peut ramener la mortalité vers 20 à 30 %.",
          ),
          F(
            "La forme est chronique parce que l’ictère dure plusieurs jours.",
            "La chronicité exige une persistance supérieure à six mois.",
          ),
        ],
        "L’ictère et l’encéphalopathie sont apparus à quatre jours d’intervalle.",
      ),
      qcm(
        "Elle est transférée vers un centre de transplantation. Quels éléments justifient cette orientation ?",
        src("b00019", "b00115"),
        "La forme fulminante grave sur foie sain expose à une mortalité majeure et la greffe constitue le traitement définitif de l’insuffisance aiguë.",
        [
          T(
            "L’encéphalopathie accompagne une altération sévère de synthèse.",
            "Cette association définit la forme grave.",
          ),
          T(
            "Le pronostic sans transplantation est défavorable.",
            "La mortalité fulminante non greffée est extrêmement élevée.",
          ),
          T(
            "L’insuffisance hépatique aiguë est une indication de greffe.",
            "Le remplacement du foie peut restaurer les fonctions vitales.",
          ),
          F(
            "La greffe est réservée uniquement à la cirrhose alcoolique.",
            "Les insuffisances aiguës figurent parmi ses indications majeures.",
          ),
          T(
            "La prise en charge doit anticiper les défaillances multiorganiques.",
            "Cerveau, rein, poumon et circulation peuvent se détériorer rapidement.",
          ),
        ],
        "Elle est transférée vers un centre de transplantation.",
      ),
    ],
  },
  {
    title: "Cirrhose avant colectomie",
    vignette:
      "M. Sabri est un patient de 64 ans porteur d’une cirrhose virale connue, programmé pour une colectomie carcinologique. Il présente une ascite modérée, une albumine à 30 g/L, une bilirubine à 42 µmol/L, un INR à 1,6 et une encéphalopathie légère contrôlée. Sa créatinine est normale.",
    questions: [
      qcm(
        "Quels mécanismes cirrhotiques augmentent son risque périopératoire ?",
        src("b00063", "b00064", "b00065"),
        "Hypertension portale, hypoalbuminémie, vasodilatation et atteintes d’organe réduisent la réserve face à une chirurgie majeure.",
        [
          T(
            "L’ascite traduit une hypertension portale et une transsudation.",
            "Le remodelage hépatique s’oppose au retour du sang portal.",
          ),
          T(
            "L’hypoalbuminémie augmente la fraction libre de médicaments.",
            "La liaison protéique diminue lorsque l’albumine baisse.",
          ),
          T(
            "La vasodilatation splanchnique crée un sous-remplissage artériel.",
            "Le volume sanguin efficace devient inférieur au volume total.",
          ),
          T(
            "Une encéphalopathie signale une détoxification insuffisante.",
            "L’ammoniaque et d’autres substances atteignent la circulation systémique.",
          ),
          F(
            "La cirrhose augmente toujours les résistances vasculaires systémiques.",
            "Elles sont classiquement diminuées par les shunts et la vasodilatation.",
          ),
        ],
      ),
      qcm(
        "Le dossier doit être stratifié. Quels paramètres appartiennent aux scores usuels ?",
        src("b00087", "b00088"),
        "Child utilise ascite, bilirubine, albumine, coagulation et encéphalopathie ; MELD utilise INR, créatinine et bilirubine, avec sodium pour MELD-Na.",
        [
          T(
            "L’ascite participe au score Child.",
            "Son importance est classée d’absente à tendue ou réfractaire.",
          ),
          T(
            "L’albumine participe au score Child.",
            "Une valeur basse augmente le nombre de points.",
          ),
          T(
            "La créatinine entre dans le MELD.",
            "Elle reflète l’impact pronostique de la fonction rénale.",
          ),
          T(
            "Le sodium complète le MELD-Na.",
            "L’hyponatrémie affine le risque de mortalité.",
          ),
          F(
            "Le poids du foie remplace la bilirubine dans le MELD.",
            "La masse anatomique n’appartient pas à l’équation.",
          ),
        ],
        "Le dossier doit être stratifié.",
      ),
      qcm(
        "L’échocardiographie montre une dysfonction diastolique et le QT est prolongé. Que faut-il anticiper ?",
        src("b00067"),
        "La cardiomyopathie cirrhotique peut être masquée au repos et se révéler lors du stress par mauvaise réserve ou trouble du rythme.",
        [
          T(
            "Une faible réponse à l’augmentation de demande.",
            "La réserve cardiaque à l’effort est compromise.",
          ),
          T(
            "Une évolution possible vers une dysfonction systolique.",
            "La maladie progresse classiquement du diastolique au systolique.",
          ),
          T(
            "Un risque de trouble du rythme.",
            "L’allongement du QT signale une vulnérabilité électrique.",
          ),
          F(
            "Des résistances basses excluent toute cardiomyopathie.",
            "Elles peuvent au contraire masquer la dysfonction contractile.",
          ),
          T(
            "Une évaluation cardiaque intégrée au plan anesthésique.",
            "La chirurgie majeure peut démasquer l’insuffisance.",
          ),
        ],
        "L’échocardiographie montre une dysfonction diastolique et le QT est prolongé.",
      ),
      qcm(
        "Les plaquettes sont à 65 × 10⁹/L et l’INR à 1,6, sans saignement. Quelle lecture est correcte ?",
        src("b00078", "b00080", "b00081"),
        "Les tests anormaux ne prouvent pas une hypocoagulation simple ; le versant anticoagulant baisse aussi et von Willebrand augmente.",
        [
          T(
            "L’INR seul prédit mal les pertes opératoires.",
            "Il n’intègre ni protéines anticoagulantes ni compensation endothéliale.",
          ),
          T(
            "Une correction prophylactique n’est pas automatiquement justifiée.",
            "L’absence de saignement permet une décision plus nuancée.",
          ),
          T(
            "Le facteur von Willebrand élevé peut soutenir l’adhésion plaquettaire.",
            "La baisse d’ADAMTS13 augmente sa disponibilité fonctionnelle.",
          ),
          F(
            "La thrombopénie garantit une absence complète de coagulation.",
            "L’équilibre peut rester relativement préservé.",
          ),
          T(
            "Une chirurgie non compressible impose néanmoins de la prudence.",
            "Le contexte du geste compte plus que le seul laboratoire.",
          ),
        ],
        "Les plaquettes sont à 65 × 10⁹/L et l’INR à 1,6, sans saignement.",
      ),
      qcm(
        "Une anesthésie générale avec propofol et cisatracurium est envisagée. Quels arguments soutiennent ces choix ?",
        src("b00095", "b00101"),
        "Le propofol conserve des doses usuelles en cirrhose modérée et le cisatracurium dépend surtout de l’élimination de Hofmann.",
        [
          T(
            "Le propofol peut être titré à dose d’induction usuelle dans une cirrhose modérée.",
            "Sa pharmacocinétique reste acceptable à ce stade.",
          ),
          T(
            "Le cisatracurium contourne largement le métabolisme hépatique.",
            "La voie de Hofmann assure son élimination principale.",
          ),
          F(
            "Le cisatracurium est éliminé exclusivement dans la bile.",
            "Cette caractéristique correspond davantage au rocuronium.",
          ),
          T(
            "Une perfusion très prolongée de cisatracurium impose une vigilance sur la laudanosine.",
            "Ce métabolite épileptogène dépend du foie pour son élimination.",
          ),
          F(
            "Le propofol ne doit jamais être utilisé en cirrhose.",
            "Il demeure un hypnotique utilisable avec titration.",
          ),
        ],
        "Une anesthésie générale avec propofol et cisatracurium est envisagée.",
      ),
      qcm(
        "Une analgésie par AINS est proposée malgré une perfusion rénale limite. Pourquoi la reconsidérer ?",
        src("b00103"),
        "Les AINS peuvent aggraver la perfusion rénale et le saignement digestif dans une cirrhose déjà fragile.",
        [
          T(
            "Ils inhibent les prostaglandines vasodilatatrices rénales.",
            "Le rein cirrhotique dépend de ces médiateurs pour maintenir son débit.",
          ),
          T(
            "Ils peuvent favoriser un saignement digestif.",
            "Les varices et l’hémostase instable augmentent cette conséquence.",
          ),
          T(
            "Leur forte liaison protéique devient moins prévisible avec l’hypoalbuminémie.",
            "La fraction libre peut augmenter lorsque l’albumine diminue.",
          ),
          F(
            "Les COX-2 sont prouvés sans risque dans ce terrain.",
            "Leur utilisation n’a pas été étudiée chez le cirrhotique.",
          ),
          T(
            "Une stratégie multimodale doit sélectionner des alternatives adaptées.",
            "L’analgésie doit préserver rein, conscience et hémostase.",
          ),
        ],
        "Une analgésie par AINS est proposée malgré une perfusion rénale limite.",
      ),
      qcm(
        "En postopératoire, l’ascite augmente et la natrémie baisse. Quel mécanisme faut-il reconnaître ?",
        src("b00064"),
        "La vasodilatation splanchnique diminue le volume artériel efficace, active l’ADH et retient de l’eau libre.",
        [
          T(
            "Le sous-remplissage artériel stimule l’ADH.",
            "La circulation perçoit une hypovolémie malgré l’excès hydrique total.",
          ),
          T(
            "La réabsorption d’eau libre dilue le sodium.",
            "L’hyponatrémie est en partie dilutionnelle.",
          ),
          T(
            "L’augmentation de l’ascite ne prouve pas une bonne perfusion rénale.",
            "Le liquide est séquestré dans un compartiment inefficace.",
          ),
          F(
            "La solution consiste toujours en un remplissage massif non surveillé.",
            "Cette conduite peut aggraver ascite et surcharge sans corriger la vasodilatation.",
          ),
          T(
            "La fonction rénale doit être surveillée étroitement.",
            "Le sous-remplissage favorise insuffisance prérénale et syndrome hépatorénal.",
          ),
        ],
        "En postopératoire, l’ascite augmente et la natrémie baisse.",
      ),
    ],
  },
  {
    title: "TIPS et surcharge cardiaque",
    vignette:
      "Mme Caron est une patiente de 57 ans atteinte de cirrhose avec hypertension portale et épisodes répétés de saignement variqueux. Un TIPS est programmé sous anesthésie générale. Elle présente une dyspnée d’effort mais une fonction systolique conservée au repos.",
    questions: [
      qcm(
        "Quel bénéfice portal est recherché par la création de ce TIPS ?",
        src("b00108"),
        "Le shunt crée une communication portosystémique qui diminue la pression portale et le risque de rupture variqueuse.",
        [
          T(
            "Réduire la pression dans la veine porte.",
            "Le conduit détourne une partie du flux portal vers la circulation cave.",
          ),
          T(
            "Diminuer le risque de nouveau saignement variqueux.",
            "La décompression portale réduit la tension sur les varices.",
          ),
          F(
            "Augmenter la résistance à l’écoulement portal.",
            "Le dispositif vise précisément à contourner cette résistance.",
          ),
          T(
            "Remplacer l’ancien shunt portocave ouvert.",
            "La voie transjugulaire est moins invasive que la laparotomie.",
          ),
          F(
            "Restaurer immédiatement toute fonction de synthèse hépatique.",
            "Le TIPS décompresse le portail sans remplacer le parenchyme.",
          ),
        ],
      ),
      qcm(
        "Pendant la ponction, une hypotension brutale et un abdomen distendu apparaissent. Quelles complications évoquer ?",
        src("b00004", "b00108"),
        "La traversée d’un foie atrophique peut perforer artère ou veine porte et provoquer hémopéritoine ou hémobilie.",
        [
          T(
            "Une perforation de la veine porte.",
            "La procédure chemine au voisinage direct de ce vaisseau.",
          ),
          T(
            "Une lésion de l’artère hépatique.",
            "La branche artérielle peut être atteinte pendant le trajet.",
          ),
          T(
            "Un saignement intrapéritonéal par perforation vasculaire.",
            "Le sang peut diffuser librement dans l’abdomen après la ponction hépatique.",
          ),
          T(
            "Un saignement dans les voies biliaires par trajet aberrant.",
            "Une communication créée entre vaisseau et canal biliaire peut provoquer cette hémobilie.",
          ),
          F(
            "Une simple sténose tardive du shunt comme seule explication.",
            "La sténose n’explique pas ce collapsus perprocédural brutal.",
          ),
        ],
        "Pendant la ponction, une hypotension brutale et un abdomen distendu apparaissent.",
      ),
      qcm(
        "Le saignement est contrôlé et le shunt ouvert. Quel changement hémodynamique survient immédiatement ?",
        src("b00064", "b00108"),
        "L’ouverture du TIPS augmente brusquement le retour veineux au cœur et peut dépasser une réserve cardiaque limitée.",
        [
          T(
            "Le retour veineux central augmente.",
            "Le flux portal est dérivé vers la circulation systémique.",
          ),
          T(
            "La précharge cardiaque s’élève.",
            "Le volume rejoint rapidement le compartiment cave.",
          ),
          F(
            "Le retour veineux s’effondre obligatoirement.",
            "La décompression portale augmente plutôt le flux vers le cœur.",
          ),
          T(
            "Une cardiomyopathie jusque-là masquée peut se révéler.",
            "Les résistances basses cachent parfois une faible réserve.",
          ),
          T(
            "Une surveillance cardiopulmonaire rapprochée est justifiée.",
            "L’adaptation à cette surcharge est imprévisible.",
          ),
        ],
        "Le saignement est contrôlé et le shunt ouvert.",
      ),
      qcm(
        "Au réveil, une hypoxémie avec crépitants et œdème pulmonaire apparaît. Quelle explication retenir ?",
        src("b00108", "b00067"),
        "La surcharge veineuse aiguë après TIPS révèle une incapacité cardiaque à absorber l’augmentation de précharge.",
        [
          T(
            "Un OAP est une complication précoce décrite du TIPS.",
            "Le retour veineux accru peut provoquer une congestion pulmonaire.",
          ),
          T(
            "Une insuffisance cardiaque peut être démasquée.",
            "La fonction au repos ne garantit pas une réserve suffisante.",
          ),
          F(
            "Le tableau prouve uniquement une infection pulmonaire tardive.",
            "La chronologie immédiate oriente vers une surcharge hémodynamique.",
          ),
          T(
            "La dysfonction diastolique cirrhotique peut contribuer.",
            "Un ventricule peu compliant tolère mal l’augmentation de remplissage.",
          ),
          F(
            "Le TIPS diminue toujours la précharge et protège du poumon humide.",
            "Son effet initial sur le retour veineux est inverse.",
          ),
        ],
        "Au réveil, une hypoxémie avec crépitants et œdème pulmonaire apparaît.",
      ),
      qcm(
        "Après stabilisation, elle devient confuse avec astérixis. Quelle complication est probable ?",
        src("b00050", "b00053", "b00108"),
        "Le shunt réduit l’épuration portale et favorise une encéphalopathie par passage systémique de l’ammoniaque.",
        [
          T(
            "Une encéphalopathie hépatique de grade 2 est probable.",
            "Le tremblement battant observé correspond précisément au deuxième grade neurologique.",
          ),
          T(
            "Le sang portal contourne davantage les hépatocytes.",
            "Le TIPS diminue la détoxification avant la circulation systémique.",
          ),
          T(
            "L’ammoniaque atteint plus facilement le cerveau.",
            "Son épuration en urée est réduite par le shunt et la cirrhose.",
          ),
          F(
            "La confusion prouve une sténose immédiate protectrice du shunt.",
            "Une sténose peut survenir mais n’explique pas directement cette aggravation.",
          ),
          T(
            "Une surveillance neurologique doit être poursuivie.",
            "L’encéphalopathie peut progresser vers confusion sévère ou coma.",
          ),
        ],
        "Après stabilisation, elle devient confuse avec astérixis.",
      ),
      qcm(
        "À moyen terme, quels problèmes du shunt doivent être surveillés ?",
        src("b00063", "b00108"),
        "L’encéphalopathie et la sténose peuvent compromettre le bénéfice du TIPS et favoriser une récidive variqueuse.",
        [
          T(
            "Une sténose du shunt.",
            "Le rétrécissement réduit l’efficacité de décompression portale.",
          ),
          T(
            "Une récidive de varices œsophagiennes.",
            "Elle peut réapparaître lorsque le shunt devient insuffisant.",
          ),
          T(
            "Une encéphalopathie persistante ou récidivante.",
            "Le court-circuit portal entretient l’exposition neurotoxique.",
          ),
          F(
            "Une guérison garantie de la cirrhose sous-jacente.",
            "Le TIPS traite une complication sans restaurer le foie.",
          ),
          F(
            "Une disparition définitive de tout risque cardiaque.",
            "La surcharge et la cardiomyopathie restent pertinentes.",
          ),
        ],
        "À moyen terme, quels problèmes du shunt doivent être surveillés ?",
      ),
      qcm(
        "La mortalité à un an est discutée avec la patiente. De quoi dépend-elle surtout ?",
        src("b00087", "b00108"),
        "La survie après TIPS dépend largement de la sévérité hépatique initiale, évaluée notamment par MELD et MELD-Na.",
        [
          T(
            "De la gravité de la maladie avant la procédure.",
            "Le TIPS ne corrige pas la réserve parenchymateuse.",
          ),
          T(
            "Des paramètres de MELD comme INR, créatinine et bilirubine.",
            "Ils reflètent synthèse, fonction rénale et excrétion.",
          ),
          T(
            "Du sodium dans la version MELD-Na.",
            "L’hyponatrémie améliore l’évaluation pronostique.",
          ),
          F(
            "Uniquement du diamètre technique du cathéter jugulaire.",
            "La maladie hépatique globale domine le pronostic à distance.",
          ),
          T(
            "De l’apparition de complications cardiaques ou neurologiques.",
            "OAP et encéphalopathie influencent l’évolution clinique.",
          ),
        ],
        "La mortalité à un an est discutée avec la patiente.",
      ),
    ],
  },
  {
    title: "Hépatectomie pour métastase",
    vignette:
      "M. Nguyen est un patient de 59 ans sans cirrhose, porteur de métastases hépatiques d’un cancer colorectal après chimiothérapie. Une hépatectomie droite ouverte est prévue. La coagulation et la fonction rénale sont normales, mais la tumeur jouxte une veine sus-hépatique.",
    questions: [
      qcm(
        "Pourquoi le risque hémorragique reste-t-il élevé malgré un foie fonctionnel ?",
        src("b00004", "b00110", "b00111"),
        "La richesse vasculaire, la proximité des gros axes veineux et la surface de transection exposent à des pertes massives indépendamment de la coagulation initiale.",
        [
          T(
            "Le foie reçoit environ 25 % du débit cardiaque.",
            "Une lésion vasculaire hépatique peut donc saigner abondamment.",
          ),
          T(
            "Les veines sus-hépatiques sont de gros collecteurs vers la VCI.",
            "Leur ouverture expose à un saignement veineux majeur.",
          ),
          T(
            "Une coagulation normale ne supprime pas le risque mécanique.",
            "Le problème peut provenir directement des vaisseaux sectionnés.",
          ),
          T(
            "Des accès veineux adaptés doivent être prévus.",
            "La compensation d’une hémorragie doit pouvoir être rapide.",
          ),
          F(
            "L’absence de cirrhose interdit toute transfusion.",
            "La fonction normale ne protège pas contre une perte sanguine chirurgicale.",
          ),
        ],
      ),
      qcm(
        "Le chirurgien demande une TVC basse pendant la transection. Quel bénéfice est recherché ?",
        src("b00004", "b00111"),
        "La baisse de pression dans les veines hépatiques réduit le gradient de saignement au niveau de la surface de résection.",
        [
          T(
            "Diminuer la congestion des veines hépatiques.",
            "Une pression veineuse plus basse réduit leur remplissage.",
          ),
          T(
            "Réduire les pertes sanguines peropératoires.",
            "C’est l’objectif central de cette stratégie.",
          ),
          F(
            "Augmenter la pression dans la veine cave.",
            "Une pression cave élevée se transmettrait aux veines sus-hépatiques.",
          ),
          T(
            "Faciliter la transection parenchymateuse.",
            "Un champ moins hémorragique améliore l’exposition.",
          ),
          F(
            "Garantir l’absence de toute hypoperfusion rénale.",
            "Une réduction volémique excessive peut au contraire menacer le rein.",
          ),
        ],
        "Le chirurgien demande une TVC basse pendant la transection.",
      ),
      qcm(
        "Le patient est placé en Trendelenburg inversé et reçoit de la nitroglycérine. Quels effets sont attendus ?",
        src("b00064", "b00111"),
        "La position proclive et la venodilatation diminuent retour veineux et pression intrahépatique, au prix d’un risque hypotensif.",
        [
          T(
            "La pression veineuse intrahépatique peut diminuer.",
            "Le proclive réduit la colonne hydrostatique vers le foie.",
          ),
          T(
            "La nitroglycérine réduit la précharge.",
            "Sa venodilatation contribue à une TVC plus basse.",
          ),
          T(
            "Une hypotension doit être prévenue et traitée.",
            "La combinaison peut réduire excessivement le remplissage artériel.",
          ),
          F(
            "La position augmente obligatoirement le retour veineux.",
            "Le Trendelenburg inversé a l’effet opposé.",
          ),
          T(
            "Le débit hépatique peut devenir vulnérable si la pression chute.",
            "L’organe dépend d’un apport portal et artériel adéquat.",
          ),
        ],
        "Le patient est placé en Trendelenburg inversé et reçoit de la nitroglycérine.",
      ),
      qcm(
        "Une phlébotomie sans remplacement est envisagée. Quelle condition doit être respectée ?",
        src("b00069", "b00111"),
        "Cette technique de réduction de la TVC est réservée à un patient dont la fonction rénale est normale et surveillée.",
        [
          T(
            "La fonction rénale doit être préservée.",
            "Le texte réserve explicitement cette stratégie à ce profil.",
          ),
          T(
            "Le volume retiré doit s’intégrer à une surveillance hémodynamique.",
            "Une hypovolémie excessive compromet organes et pression artérielle.",
          ),
          F(
            "Une insuffisance rénale avancée est l’indication idéale.",
            "Ce terrain augmente le danger de la réduction volémique.",
          ),
          T(
            "L’objectif reste la diminution du saignement hépatique.",
            "La baisse de pression veineuse facilite la résection.",
          ),
          F(
            "Le sang retiré doit être immédiatement remplacé avant la transection.",
            "Le remplacement immédiat annulerait l’effet recherché sur la TVC.",
          ),
        ],
        "Une phlébotomie sans remplacement est envisagée.",
      ),
      qcm(
        "Pendant la résection, une manœuvre de Pringle est réalisée. Quels flux sont interrompus ?",
        src("b00004", "b00111"),
        "La manœuvre de Pringle clampe le pédicule hépatique et suspend temporairement l’apport artériel et portal.",
        [
          T(
            "Le flux de l’artère hépatique.",
            "Cette branche chemine dans le pédicule clampé.",
          ),
          T(
            "Le flux de la veine porte.",
            "La seconde afférence hépatique est également interrompue.",
          ),
          F(
            "Le drainage des trois veines sus-hépatiques directement.",
            "Ces veines se situent en aval et ne sont pas dans le pédicule portal.",
          ),
          T(
            "La majorité du débit hépatique total.",
            "La veine porte et l’artère constituent ensemble le double apport.",
          ),
          F(
            "Le retour de toute la veine cave inférieure.",
            "Le clampage pédiculaire n’est pas un clampage cave.",
          ),
        ],
        "Pendant la résection, une manœuvre de Pringle est réalisée.",
      ),
      qcm(
        "Au premier jour, l’INR augmente après une résection étendue. Quelle conséquence analgésique envisager ?",
        src("b00078", "b00113"),
        "La coagulopathie transitoire rend la gestion d’un cathéter péridural plus risquée et favorise des alternatives multimodales.",
        [
          T(
            "Évaluer le risque d’hématome autour d’une péridurale.",
            "La coagulation peut se détériorer plusieurs jours après l’hépatectomie.",
          ),
          T(
            "Éviter ou limiter la durée de la péridurale selon le protocole.",
            "Les programmes ERAS tendent à réduire son utilisation.",
          ),
          T(
            "Envisager une ACP en l’absence de péridurale.",
            "Cette modalité permet une titration antalgique contrôlée.",
          ),
          T(
            "Associer des analgésiques non neuraxiaux adaptés.",
            "Paracétamol, lidocaïne ou kétamine peuvent intégrer la multimodalité.",
          ),
          F(
            "Retirer tout cathéter sans vérifier la coagulation.",
            "Le retrait dans une coagulopathie peut provoquer un hématome neuraxial.",
          ),
        ],
        "Au premier jour, l’INR augmente après une résection étendue.",
      ),
      qcm(
        "La fonction hépatique se normalise en quelques jours. Comment interpréter l’évolution ?",
        src("b00059", "b00113"),
        "Une insuffisance hépatique transitoire est possible après hépatectomie et peut régresser avec l’adaptation du foie restant.",
        [
          T(
            "L’évolution est compatible avec une dysfonction post-résection transitoire.",
            "Le texte décrit une durée de quelques jours.",
          ),
          T(
            "La coagulation peut s’améliorer parallèlement.",
            "La synthèse hépatique récupère avec la fonction parenchymateuse.",
          ),
          F(
            "Toute élévation transitoire impose une greffe immédiate.",
            "Une récupération spontanée peut suivre une hépatectomie partielle.",
          ),
          T(
            "La surveillance biologique reste nécessaire jusqu’à stabilisation.",
            "La dynamique confirme la récupération et sécurise les gestes invasifs.",
          ),
          F(
            "Le volume du foie restant n’a aucune influence sur la réserve.",
            "La masse fonctionnelle résiduelle conditionne la récupération.",
          ),
        ],
        "La fonction hépatique se normalise en quelques jours.",
      ),
    ],
  },
  {
    title: "Hypoxémie chez une candidate à la greffe",
    vignette:
      "Mme Rigal est une patiente de 52 ans suivie pour cirrhose auto-immune avec hypertension portale. L’inscription sur liste de transplantation est discutée. Elle décrit une dyspnée croissante en position debout, sa saturation à l’air ambiant est de 88 % et l’auscultation pulmonaire est peu contributive. L’échocardiographie ne montre pas de défaillance ventriculaire gauche.",
    questions: [
      qcm(
        "Quels éléments définissent le syndrome hépatopulmonaire recherché ?",
        src("b00071"),
        "L’association d’une hypertension portale, de dilatations vasculaires intrapulmonaires et d’un défaut d’oxygénation définit ce syndrome.",
        [
          T(
            "Une hypertension portale sous-jacente.",
            "Elle constitue le terrain hépatique nécessaire à l’interprétation du trouble gazeux.",
          ),
          T(
            "Un gradient alvéolo-artériel dépassant 15 mmHg à l’air ambiant.",
            "Ce seuil mesuré à l’air ambiant objective l’anomalie des échanges.",
          ),
          F(
            "Une pression artérielle pulmonaire obligatoirement supérieure à 50 mmHg.",
            "Ce seuil concerne l’hypertension portopulmonaire sévère et non ce syndrome.",
          ),
          T(
            "Des capillaires intrapulmonaires anormalement dilatés.",
            "Cette vasodilatation altère les rapports ventilation-perfusion et la diffusion.",
          ),
          F(
            "Une obstruction anatomique constante de l’artère pulmonaire.",
            "Le mécanisme repose sur une dilatation vasculaire diffuse, sans embolie nécessaire.",
          ),
        ],
      ),
      qcm(
        "Les gaz du sang montrent une PaO₂ à 46 mmHg. Quelle portée donner à cette valeur ?",
        src("b00071", "b00115"),
        "Une PaO₂ inférieure à 50 mmHg marque une hypoxémie très sévère associée à une forte augmentation de mortalité.",
        [
          T(
            "Elle franchit un seuil de mauvais pronostic.",
            "Le risque de décès augmente fortement sous 50 mmHg dans ce contexte.",
          ),
          F(
            "Elle exclut le diagnostic faute d’hypercapnie.",
            "La définition n’impose pas une élévation de la PaCO₂.",
          ),
          T(
            "Elle renforce l’indication d’une évaluation de transplantation.",
            "La greffe traite la maladie hépatique responsable du shunt fonctionnel.",
          ),
          F(
            "Elle correspond à une oxygénation normale pour une cirrhose.",
            "La cirrhose n’autorise pas à banaliser une hypoxémie de cette profondeur.",
          ),
          T(
            "Une surveillance rapprochée de l’oxygénation est justifiée.",
            "L’évolution des échanges gazeux conditionne la sécurité périopératoire.",
          ),
        ],
        "Les gaz du sang montrent une PaO₂ à 46 mmHg.",
      ),
      qcm(
        "L’oxygène inspiré est augmenté, mais la saturation s’améliore peu. Quel mécanisme l’explique ?",
        src("b00071"),
        "Le passage du sang dans des capillaires très dilatés limite le temps et l’efficacité de diffusion, rendant l’hypoxémie peu réactive.",
        [
          F(
            "Une consommation hépatique complète de l’oxygène administré.",
            "Le foie ne soustrait pas sélectivement l’oxygène avant la circulation pulmonaire.",
          ),
          T(
            "Un trouble majeur du rapport ventilation-perfusion.",
            "La perfusion de territoires insuffisamment oxygénés entretient l’hypoxémie.",
          ),
          T(
            "Une limitation de diffusion dans les capillaires dilatés.",
            "La distance entre alvéole et hématie augmente lorsque le vaisseau s’élargit.",
          ),
          F(
            "Une preuve formelle de bronchospasme isolé.",
            "La faible réponse à l’oxygène n’impose pas une obstruction bronchique.",
          ),
          T(
            "Un effet de shunt intrapulmonaire fonctionnel.",
            "Une fraction du débit rejoint le sang artériel sans échange gazeux suffisant.",
          ),
        ],
        "L’oxygène inspiré est augmenté, mais la saturation s’améliore peu.",
      ),
      qcm(
        "Le cathétérisme montre finalement une pression pulmonaire moyenne à 42 mmHg. Comment la classer ?",
        src("b00072"),
        "Une pression moyenne comprise entre 35 et 50 mmHg correspond à une hypertension pulmonaire modérée.",
        [
          F(
            "Comme une valeur bénigne inférieure à 33 mmHg.",
            "Quarante-deux millimètres de mercure dépassent nettement la zone bénigne.",
          ),
          T(
            "Comme une hypertension portopulmonaire modérée.",
            "L’intervalle de 35 à 50 mmHg définit cette catégorie.",
          ),
          F(
            "Comme une forme sévère dépassant déjà 50 mmHg.",
            "La valeur mesurée reste sous le seuil de sévérité maximale.",
          ),
          T(
            "Comme un élément exigeant une évaluation du ventricule droit.",
            "La capacité du cœur droit à supporter l’intervention conditionne la conduite.",
          ),
          T(
            "Comme une anomalie à traiter avant la greffe.",
            "La réduction des pressions peut rendre la transplantation envisageable.",
          ),
        ],
        "Le cathétérisme montre finalement une pression pulmonaire moyenne à 42 mmHg.",
      ),
      qcm(
        "Un traitement spécifique est discuté avant toute transplantation. Quelles propositions sont adaptées ?",
        src("b00067", "b00072"),
        "L’époprosténol peut réduire la pression pulmonaire, alors que bêtabloquants et inhibiteurs calciques sont défavorables dans ce cadre.",
        [
          T(
            "L’époprosténol peut être utilisé pour abaisser les pressions.",
            "Cette prostacycline est proposée afin de préparer certains patients à la greffe.",
          ),
          F(
            "Un bêtabloquant non sélectif doit être commencé pour le poumon.",
            "Ces médicaments peuvent aggraver la tolérance hémodynamique de l’hypertension pulmonaire.",
          ),
          F(
            "Un inhibiteur calcique constitue systématiquement le premier choix.",
            "Cette classe est décrite comme inefficace et potentiellement dangereuse ici.",
          ),
          T(
            "La réponse thérapeutique doit être réévaluée par hémodynamique.",
            "Les pressions et résistances résiduelles déterminent l’opérabilité.",
          ),
          T(
            "La fonction ventriculaire droite doit être intégrée à la décision.",
            "Une pression abaissée ne suffit pas si le ventricule droit reste défaillant.",
          ),
        ],
        "Un traitement spécifique est discuté avant toute transplantation.",
      ),
      qcm(
        "Après traitement, la pression moyenne reste à 52 mmHg et les résistances pulmonaires à 340 dyn·s·cm⁻⁵. Quelle décision s’impose ?",
        src("b00072", "b00115"),
        "La persistance d’une pression supérieure à 50 mmHg ou de résistances supérieures à 300 contre-indique la transplantation.",
        [
          T(
            "La greffe hépatique est contre-indiquée dans cet état.",
            "Les deux seuils hémodynamiques défavorables restent franchis malgré le traitement.",
          ),
          F(
            "La pression est devenue bénigne et autorise une chirurgie immédiate.",
            "Cinquante-deux millimètres de mercure appartiennent à la zone sévère.",
          ),
          T(
            "Le risque de défaillance ventriculaire droite est majeur.",
            "Le ventricule droit affronte une postcharge pulmonaire excessivement élevée.",
          ),
          F(
            "Les résistances mesurées n’ont aucun rôle dans la sélection.",
            "Une valeur supérieure à 300 fait partie des critères de contre-indication.",
          ),
          T(
            "Une nouvelle stratégie d’optimisation doit précéder toute réévaluation.",
            "L’opérabilité ne peut être rediscutée qu’après amélioration objective.",
          ),
        ],
        "Après traitement, la pression moyenne reste à 52 mmHg et les résistances pulmonaires à 340 dyn·s·cm⁻⁵.",
      ),
      qcm(
        "Quelques mois plus tard, les pressions sont contrôlées et le ventricule droit est normal. Quel principe guide la suite ?",
        src("b00072", "b00115"),
        "Une transplantation peut être envisagée lorsque le traitement contrôle l’hypertension pulmonaire et que le ventricule droit demeure fonctionnel.",
        [
          F(
            "La normalité droite rend inutile toute surveillance invasive.",
            "La fragilité pulmonaire justifie encore une évaluation périopératoire approfondie.",
          ),
          T(
            "La candidature peut être réexaminée par l’équipe de greffe.",
            "L’amélioration hémodynamique lève potentiellement l’obstacle initial.",
          ),
          T(
            "La fonction du ventricule droit doit rester normale pour opérer.",
            "Elle témoigne d’une adaptation suffisante à la postcharge résiduelle.",
          ),
          F(
            "La cirrhose est guérie par le traitement vasodilatateur pulmonaire.",
            "Le traitement agit sur le lit pulmonaire sans restaurer le parenchyme hépatique.",
          ),
          T(
            "La greffe reste le traitement de fond de la maladie hépatique décompensée.",
            "Le remplacement du foie corrige la cause hépatique lorsque le risque cardiaque devient acceptable.",
          ),
        ],
        "Quelques mois plus tard, les pressions sont contrôlées et le ventricule droit est normal.",
      ),
    ],
  },
  {
    title: "Insuffisance rénale du cirrhotique",
    vignette:
      "M. Boivin est un patient de 61 ans hospitalisé pour cirrhose alcoolique décompensée avec ascite tendue. Après plusieurs jours de diarrhée et une prise récente d’anti-inflammatoires, sa créatinine double. Il est oligurique, sans obstacle urinaire, et son examen ne retrouve ni œdème aigu pulmonaire ni choc manifeste.",
    questions: [
      qcm(
        "Quels mécanismes peuvent participer à cette insuffisance rénale ?",
        src("b00064", "b00069", "b00103"),
        "Sous-remplissage artériel, vasoconstriction rénale fonctionnelle, toxicité des AINS ou nécrose tubulaire peuvent coexister chez le cirrhotique.",
        [
          T(
            "Une hypovolémie liée aux pertes digestives.",
            "La diarrhée réduit un volume artériel efficace déjà fragilisé par la cirrhose.",
          ),
          T(
            "Une inhibition des prostaglandines rénales par les AINS.",
            "Le rein dépend de leur action vasodilatatrice pour maintenir sa perfusion.",
          ),
          T(
            "Un syndrome hépatorénal fonctionnel.",
            "La vasoconstriction rénale peut survenir malgré un rein initialement intact.",
          ),
          T(
            "Une nécrose tubulaire aiguë structurelle.",
            "Une agression prolongée peut léser réellement le parenchyme rénal.",
          ),
          F(
            "Une augmentation protectrice constante du débit rénal par l’ascite.",
            "L’ascite s’accompagne plutôt d’une diminution de perfusion artérielle efficace.",
          ),
        ],
      ),
      qcm(
        "Une expansion volémique prudente améliore rapidement la diurèse et la créatinine. Quel diagnostic devient le plus probable ?",
        src("b00069"),
        "La réponse au remplissage caractérise une insuffisance prérénale liée à une hypovolémie vraie ou relative.",
        [
          T(
            "Une insuffisance prérénale réversible.",
            "La récupération après restauration du volume efficace soutient ce mécanisme.",
          ),
          F(
            "Une nécrose tubulaire irréversible.",
            "Une atteinte structurelle ne se corrige pas aussi rapidement par le seul volume.",
          ),
          F(
            "Un syndrome hépatorénal certain malgré la réponse.",
            "Ce diagnostic est moins probable lorsque l’hydratation corrige la fonction.",
          ),
          T(
            "Un sous-remplissage artériel initial.",
            "La vasodilatation splanchnique et les pertes digestives l’expliquent ensemble.",
          ),
          F(
            "Une indication immédiate de transplantation rénale isolée.",
            "La réversibilité obtenue ne justifie pas un remplacement d’organe.",
          ),
        ],
        "Une expansion volémique prudente améliore rapidement la diurèse et la créatinine.",
      ),
      qcm(
        "Deux semaines plus tard, la créatinine remonte malgré l’arrêt des AINS et une volémie restaurée. Quelle entité faut-il rechercher ?",
        src("b00064", "b00069"),
        "Une dégradation rénale fonctionnelle persistante chez un cirrhotique décompensé évoque un syndrome hépatorénal.",
        [
          F(
            "Une insuffisance prérénale simplement non remplie.",
            "La volémie a été corrigée sans récupération durable cette fois.",
          ),
          T(
            "Un syndrome hépatorénal.",
            "Ce trouble fonctionnel complique la cirrhose avancée et résiste au remplissage simple.",
          ),
          T(
            "Une vasoconstriction rénale intense.",
            "Elle résulte des adaptations circulatoires au sous-remplissage chronique.",
          ),
          F(
            "Une guérison spontanée certaine sans surveillance.",
            "La progression peut être rapide et engage le pronostic.",
          ),
          T(
            "Une évaluation simultanée de la gravité hépatique.",
            "Le rein se détériore dans le cadre de la décompensation globale.",
          ),
        ],
        "Deux semaines plus tard, la créatinine remonte malgré l’arrêt des AINS et une volémie restaurée.",
      ),
      qcm(
        "Le diagnostic de syndrome hépatorénal est retenu. Quels traitements de soutien sont cohérents ?",
        src("b00063", "b00069"),
        "L’association d’un vasoconstricteur comme la terlipressine et d’albumine soutient la circulation en attente du traitement définitif.",
        [
          T(
            "Administrer de l’albumine selon le contexte clinique.",
            "Elle aide à restaurer le compartiment artériel circulant efficace.",
          ),
          T(
            "Utiliser la terlipressine pour corriger la vasodilatation.",
            "La vasoconstriction splanchnique peut améliorer la perfusion rénale.",
          ),
          F(
            "Réintroduire des AINS pour augmenter la filtration.",
            "Ils réduisent les prostaglandines rénales et aggravent la situation.",
          ),
          T(
            "Surveiller étroitement diurèse et créatinine.",
            "La dynamique rénale permet d’évaluer la réponse et la progression.",
          ),
          F(
            "Considérer l’ascite comme une preuve de remplissage vasculaire suffisant.",
            "Le liquide péritonéal n’assure pas une perfusion artérielle efficace.",
          ),
        ],
        "Le diagnostic de syndrome hépatorénal est retenu.",
      ),
      qcm(
        "Quelle intervention constitue le traitement définitif du syndrome hépatorénal ?",
        src("b00069", "b00115"),
        "La transplantation hépatique corrige la défaillance circulatoire provoquée par la cirrhose et représente le traitement définitif.",
        [
          F(
            "Une perfusion prolongée de cristalloïdes sans autre projet.",
            "Le remplissage seul ne corrige pas le mécanisme d’une cirrhose terminale.",
          ),
          T(
            "La transplantation du foie.",
            "Le remplacement de l’organe malade restaure les déterminants hépatiques de la circulation.",
          ),
          F(
            "Une splénectomie systématique.",
            "Cette opération ne traite pas la défaillance hépatique responsable.",
          ),
          T(
            "Une évaluation rapide en centre de greffe.",
            "Le syndrome signale une décompensation sévère dont l’évolution peut être courte.",
          ),
          F(
            "L’arrêt définitif de toute albumine comme principe thérapeutique.",
            "L’albumine fait au contraire partie du soutien médical décrit.",
          ),
        ],
        "Quelle intervention constitue le traitement définitif du syndrome hépatorénal ?",
      ),
      qcm(
        "Le sédiment urinaire devient pathologique après un épisode de choc prolongé. Quelle alternative diagnostique considérer ?",
        src("b00057", "b00069"),
        "Un choc peut provoquer une nécrose tubulaire aiguë, atteinte structurelle différente du syndrome hépatorénal fonctionnel.",
        [
          T(
            "Une nécrose tubulaire aiguë.",
            "L’ischémie prolongée peut léser directement l’épithélium tubulaire.",
          ),
          F(
            "Une forme toujours réversible par albumine seule.",
            "La lésion structurale n’a pas le même comportement qu’un trouble fonctionnel.",
          ),
          T(
            "Une atteinte rénale organique plutôt que purement fonctionnelle.",
            "Le sédiment pathologique et le choc orientent vers une lésion parenchymateuse.",
          ),
          F(
            "Une preuve que la cirrhose n’a plus aucun rôle.",
            "Le terrain cirrhotique continue d’aggraver la perfusion et la tolérance.",
          ),
          T(
            "Une prise en charge de support sans traitement spécifique décrit.",
            "La nécrose tubulaire impose correction des agressions et soutien d’organe.",
          ),
        ],
        "Le sédiment urinaire devient pathologique après un épisode de choc prolongé.",
      ),
      qcm(
        "Avant une intervention ultérieure, quelles prescriptions antalgiques protègent le mieux le rein ?",
        src("b00103"),
        "Les AINS doivent être évités ; une analgésie multimodale prudente tient compte de la fonction hépatique et de l’élimination des agents.",
        [
          T(
            "Écarter les anti-inflammatoires non stéroïdiens.",
            "Leur inhibition des prostaglandines menace directement la perfusion rénale.",
          ),
          F(
            "Choisir un COX-2 en affirmant son innocuité démontrée.",
            "Cette classe n’a pas été validée comme sûre chez le cirrhotique.",
          ),
          T(
            "Adapter les opioïdes à la fonction hépatique et rénale.",
            "L’accumulation des molécules ou métabolites doit être anticipée.",
          ),
          T(
            "Maintenir une stratégie multimodale individualisée.",
            "La combinaison raisonnée réduit les doses de chaque médicament.",
          ),
          F(
            "Utiliser sans limite tout médicament fortement lié à l’albumine.",
            "L’hypoalbuminémie augmente la fraction libre et l’imprévisibilité pharmacologique.",
          ),
        ],
        "Avant une intervention ultérieure, quelles prescriptions antalgiques protègent le mieux le rein ?",
      ),
    ],
  },
  {
    title: "Hépatite alcoolique et encéphalopathie",
    vignette:
      "Mme Leclerc est une patiente de 49 ans consommant plus de 100 g d’alcool par jour depuis de nombreuses années. Elle consulte pour ictère intense, ascite, fièvre modérée et somnolence. L’examen retrouve des angiomes stellaires et une circulation veineuse abdominale. Une infection doit être exclue avant toute sédation.",
    questions: [
      qcm(
        "Quels éléments soutiennent une hépatite alcoolique sur foie chronique ?",
        src("b00033", "b00034"),
        "Une consommation massive prolongée, un ictère constant et des stigmates de cirrhose caractérisent cette présentation.",
        [
          T(
            "Une consommation supérieure à 100 g d’alcool par jour.",
            "Ce niveau prolongé correspond au profil étiologique décrit.",
          ),
          T(
            "Un ictère marqué.",
            "La jaunisse est présentée comme constante dans l’hépatite alcoolique.",
          ),
          T(
            "Des signes cliniques de cirrhose associée.",
            "Ascite et collatérales traduisent une maladie chronique sous-jacente.",
          ),
          F(
            "Une absence obligatoire d’hyperbilirubinémie.",
            "La bilirubine est au contraire élevée lorsque l’ictère apparaît.",
          ),
          F(
            "Une évolution exclusivement aiguë sur foie sain.",
            "L’hépatite alcoolique survient classiquement sur une hépatopathie chronique.",
          ),
        ],
      ),
      qcm(
        "La patiente ralentit ses réponses mais reste orientée. Quel grade neurologique retenir ?",
        src("b00048", "b00049"),
        "Un ralentissement de l’idéation sans astérixis correspond à une encéphalopathie de grade 1.",
        [
          T(
            "Le grade 1.",
            "Le ralentissement idéatoire constitue le signe cardinal de ce premier stade.",
          ),
          F(
            "Le grade 2 car l’astérixis est déjà certain.",
            "Aucun tremblement battant n’est décrit à ce moment.",
          ),
          F(
            "Le grade 4 correspondant au coma.",
            "La patiente reste éveillée et répond aux sollicitations.",
          ),
          T(
            "Une surveillance clinique répétée est requise.",
            "L’encéphalopathie peut progresser rapidement vers des stades supérieurs.",
          ),
          F(
            "L’examen neurologique n’a aucune valeur évolutive.",
            "La gradation clinique structure précisément le suivi de la défaillance.",
          ),
        ],
        "La patiente ralentit ses réponses mais reste orientée.",
      ),
      qcm(
        "Un astérixis apparaît ensuite. Quelles conséquences en tirer ?",
        src("b00050", "b00051"),
        "L’astérixis signe le grade 2 et traduit une exposition cérébrale accrue aux substances normalement détoxifiées par le foie.",
        [
          F(
            "Le trouble reste nécessairement au grade 1.",
            "L’apparition du tremblement battant fait passer au stade suivant.",
          ),
          T(
            "L’encéphalopathie atteint le grade 2.",
            "L’astérixis est le critère clinique discriminant de ce grade.",
          ),
          T(
            "L’ammoniaque insuffisamment transformée peut contribuer.",
            "La défaillance du cycle de l’urée augmente sa concentration systémique.",
          ),
          F(
            "Le signe exclut tout risque d’œdème cérébral.",
            "Une aggravation neurologique peut s’accompagner d’un œdème, surtout en aigu.",
          ),
          T(
            "Les médicaments sédatifs doivent être maniés avec prudence.",
            "Ils peuvent masquer la progression de l’examen neurologique.",
          ),
        ],
        "Un astérixis apparaît ensuite.",
      ),
      qcm(
        "La fièvre s’accentue et le liquide d’ascite devient suspect. Quelle complication rechercher ?",
        src("b00063", "b00057"),
        "Une péritonite bactérienne spontanée peut compliquer l’ascite et aggraver une encéphalopathie ou une défaillance multiorganique.",
        [
          T(
            "Une infection spontanée du liquide d’ascite.",
            "La cirrhose expose spécifiquement à cette complication bactérienne.",
          ),
          T(
            "Un facteur déclenchant d’aggravation neurologique.",
            "L’infection augmente la charge métabolique et la décompensation hépatique.",
          ),
          F(
            "Une cause exclusivement chirurgicale imposant une perforation digestive.",
            "L’infection peut survenir sans foyer perforatif dans l’ascite cirrhotique.",
          ),
          T(
            "Une évolution possible vers une atteinte multiorganique.",
            "Le sepsis peut altérer circulation, rein, poumon et cerveau.",
          ),
          F(
            "Une situation compatible avec une sédation non surveillée.",
            "L’instabilité infectieuse et neurologique exige au contraire un monitorage rapproché.",
          ),
        ],
        "La fièvre s’accentue et le liquide d’ascite devient suspect.",
      ),
      qcm(
        "L’INR est à 2,2 sans saignement actif. Comment raisonner avant un geste profond ?",
        src("b00078", "b00080", "b00081"),
        "L’INR prédit mal le saignement cirrhotique, mais un geste dans un espace non compressible nécessite une évaluation hémostatique particulièrement prudente.",
        [
          T(
            "Ne pas assimiler automatiquement INR élevé et absence totale de coagulation.",
            "Les protéines anticoagulantes baissent simultanément aux facteurs procoagulants.",
          ),
          F(
            "Programmer un bloc neuraxial sans aucune autre analyse.",
            "Un hématome dans cet espace serait grave et difficilement compressible.",
          ),
          T(
            "Rechercher un saignement clinique et suivre l’évolution biologique.",
            "La dynamique et le contexte éclairent mieux le risque réel.",
          ),
          T(
            "Éviter une transfusion prophylactique réflexe si aucun geste ne l’exige.",
            "La correction isolée du chiffre peut perturber un équilibre fragile.",
          ),
          F(
            "Considérer l’INR comme un dosage direct des protéines C et S.",
            "Le test ne mesure pas correctement le versant anticoagulant.",
          ),
        ],
        "L’INR est à 2,2 sans saignement actif.",
      ),
      qcm(
        "Une induction est requise après stabilisation. Quels choix pharmacologiques sont défendables ?",
        src("b00095", "b00097", "b00099", "b00101"),
        "Propofol titré, rémifentanil et cisatracurium limitent l’accumulation, tandis que midazolam et rocuronium peuvent durer davantage.",
        [
          T(
            "Titrer le propofol selon l’effet clinique.",
            "Une cirrhose modérée n’impose pas nécessairement de modifier sa dose initiale.",
          ),
          T(
            "Choisir le rémifentanil pour son métabolisme par estérases.",
            "Son élimination est largement indépendante du foie.",
          ),
          F(
            "Privilégier une perfusion prolongée de midazolam sans adaptation.",
            "Le CYP3A devient déficient dans les formes sévères et prolonge l’effet.",
          ),
          T(
            "Utiliser le cisatracurium pour son élimination de Hofmann.",
            "Cette voie évite une dépendance majeure à la clairance hépatique.",
          ),
          F(
            "Attendre une durée normale garantie avec le rocuronium.",
            "Son élimination biliaire expose à un bloc neuromusculaire prolongé.",
          ),
        ],
        "Une induction est requise après stabilisation.",
      ),
      qcm(
        "Après amélioration, quel ensemble de paramètres renseigne le mieux sa sévérité globale ?",
        src("b00087", "b00088"),
        "Child classe la décompensation clinique et biologique ; MELD-Na associe fonction rénale, synthèse, bilirubine et sodium.",
        [
          T(
            "Ascite et encéphalopathie pour le score Child.",
            "Ces deux manifestations cliniques participent directement à sa classe.",
          ),
          T(
            "Albumine et bilirubine pour compléter Child.",
            "Synthèse et excrétion sont intégrées au calcul.",
          ),
          T(
            "INR, créatinine et bilirubine pour le MELD.",
            "Ces trois variables forment la base du score objectif.",
          ),
          T(
            "Sodium sérique pour la version MELD-Na.",
            "L’hyponatrémie améliore la prédiction de mortalité.",
          ),
          F(
            "Aminotransférases seules pour déterminer tous les risques opératoires.",
            "La cytolyse ne résume ni la réserve ni les défaillances associées.",
          ),
        ],
        "Après amélioration, quel ensemble de paramètres renseigne le mieux sa sévérité globale ?",
      ),
    ],
  },
  {
    title: "Transplantation hépatique et reperfusion",
    vignette:
      "M. Perez est un patient de 55 ans atteint de cirrhose décompensée avec ascite réfractaire et épisodes d’encéphalopathie. Un greffon compatible devient disponible. Le patient arrive au bloc avec anémie modérée, thrombopénie, vasodilatation systémique et fonction ventriculaire droite conservée. Une transplantation orthotopique est engagée.",
    questions: [
      qcm(
        "Quelles indications générales rendent cette transplantation cohérente ?",
        src("b00115"),
        "Cirrhose décompensée, carcinome hépatocellulaire non résécable et insuffisance hépatique aiguë figurent parmi les indications majeures.",
        [
          T(
            "Une cirrhose arrivée au stade terminal.",
            "La décompensation répétée témoigne d’une réserve hépatique épuisée.",
          ),
          F(
            "Une hépatite A simple sans défaillance.",
            "Une infection aiguë favorable ne justifie pas à elle seule une greffe.",
          ),
          T(
            "Un carcinome hépatocellulaire non résécable sélectionné.",
            "La transplantation peut traiter simultanément tumeur et parenchyme malade.",
          ),
          T(
            "Une insuffisance hépatique aiguë grave.",
            "Le remplacement urgent du foie peut modifier son pronostic très sombre.",
          ),
          F(
            "Une élévation isolée et transitoire d’ALAT.",
            "La cytolyse seule ne définit pas une indication de transplantation.",
          ),
        ],
      ),
      qcm(
        "La dissection commence dans un abdomen riche en collatérales. Quels risques dominent cette première phase ?",
        src("b00063", "b00115"),
        "L’hypertension portale et les adhérences exposent à une hémorragie importante pendant l’ablation du foie natif.",
        [
          T(
            "Un saignement provenant des collatérales portosystémiques.",
            "Ces vaisseaux dilatés contournent l’obstacle portal et sont fragiles.",
          ),
          T(
            "Des pertes lors de la mobilisation du foie cirrhotique.",
            "La dissection d’un organe remodelé peut ouvrir de nombreux pédicules.",
          ),
          F(
            "Une absence de risque parce que l’INR prédit mal le saignement.",
            "La mauvaise prédiction biologique n’annule pas le risque anatomique.",
          ),
          T(
            "La nécessité d’un accès vasculaire permettant une compensation rapide.",
            "Une hémorragie massive exige transfusion et correction hémodynamique immédiates.",
          ),
          F(
            "Une protection absolue conférée par la thrombopénie.",
            "La baisse des plaquettes n’a aucun effet protecteur contre l’hémorragie.",
          ),
        ],
        "La dissection commence dans un abdomen riche en collatérales.",
      ),
      qcm(
        "Le foie natif est retiré et le greffon n’est pas encore perfusé. Comment nommer et comprendre cette période ?",
        src("b00115"),
        "La phase anhépatique sépare l’explantation de la reperfusion et prive temporairement l’organisme de fonction hépatique.",
        [
          T(
            "Il s’agit de la phase anhépatique.",
            "Aucun foie fonctionnel n’est alors relié à la circulation du receveur.",
          ),
          T(
            "La détoxification et la synthèse hépatiques sont temporairement absentes.",
            "Les fonctions métaboliques du foie ne sont pas assurées pendant cet intervalle.",
          ),
          F(
            "Cette période correspond déjà à la reperfusion du greffon.",
            "La circulation du nouvel organe n’a pas encore été rétablie.",
          ),
          T(
            "Les troubles métaboliques et hémostatiques doivent être anticipés.",
            "L’absence d’organe fonctionnel s’ajoute aux anomalies préexistantes.",
          ),
          F(
            "La veine porte assure seule toutes les fonctions hépatiques en l’absence de parenchyme.",
            "Un débit vasculaire ne peut remplacer les hépatocytes absents.",
          ),
        ],
        "Le foie natif est retiré et le greffon n’est pas encore perfusé.",
      ),
      qcm(
        "Juste avant le déclampage, quels objectifs sont prioritaires ?",
        src("b00115", "b00064", "b00067"),
        "La préparation à la reperfusion vise une pression et un remplissage adaptés, une correction métabolique et l’anticipation d’une faible réserve cardiaque.",
        [
          T(
            "Réévaluer la volémie et la pression artérielle.",
            "Le retour du flux au greffon peut provoquer une variation hémodynamique brutale.",
          ),
          T(
            "Anticiper la réponse d’un cœur à réserve limitée.",
            "La cardiomyopathie cirrhotique peut se révéler sous le stress du déclampage.",
          ),
          F(
            "Ignorer les électrolytes jusqu’à la fermeture cutanée.",
            "Les perturbations métaboliques peuvent devenir immédiatement dangereuses à la reperfusion.",
          ),
          T(
            "Préparer un traitement rapide de l’instabilité circulatoire.",
            "La vasodilatation préexistante favorise une chute tensionnelle sévère.",
          ),
          F(
            "Chercher à maintenir une hypotension profonde sans limite.",
            "La perfusion du greffon et des autres organes exige une pression suffisante.",
          ),
        ],
        "Juste avant le déclampage, quels objectifs sont prioritaires ?",
      ),
      qcm(
        "Au déclampage, une hypotension sévère survient. Quelle interprétation générale retenir ?",
        src("b00115", "b00064"),
        "La reperfusion constitue une phase hémodynamiquement critique chez un patient déjà vasodilaté et peut nécessiter un soutien immédiat.",
        [
          T(
            "La chronologie évoque un syndrome de reperfusion.",
            "L’instabilité apparaît au moment précis où le greffon reçoit le sang.",
          ),
          T(
            "La vasodilatation cirrhotique réduit la réserve tensionnelle.",
            "Des résistances systémiques déjà basses amplifient la chute de pression.",
          ),
          T(
            "Un soutien vasopresseur peut être nécessaire.",
            "La restauration d’une pression efficace protège le greffon et les organes.",
          ),
          F(
            "L’événement prouve obligatoirement une rupture chirurgicale unique.",
            "Une cause hémodynamique liée au déclampage doit être considérée même sans hémorragie.",
          ),
          F(
            "Il faut attendre spontanément sans monitorage rapproché.",
            "La gravité potentielle impose diagnostic et correction immédiats.",
          ),
        ],
        "Au déclampage, une hypotension sévère survient.",
      ),
      qcm(
        "Un saignement diffus persiste alors que l’INR reste difficile à interpréter. Quels principes appliquer ?",
        src("b00078", "b00079", "b00080"),
        "L’hémostase cirrhotique est rééquilibrée mais fragile ; la correction doit répondre au saignement et aux déficits pertinents plutôt qu’à l’INR isolé.",
        [
          T(
            "Évaluer le saignement réel et son évolution.",
            "La clinique guide plus directement le besoin de correction que le chiffre isolé.",
          ),
          T(
            "Se rappeler que protéines C et S sont aussi diminuées.",
            "Le déficit simultané du versant anticoagulant explique l’équilibre complexe.",
          ),
          T(
            "Intégrer la numération plaquettaire et le fibrinogène.",
            "Ces composantes peuvent devenir limitantes au cours d’une hémorragie massive.",
          ),
          F(
            "Transfuser du plasma uniquement pour normaliser tout INR anormal.",
            "Une cible biologique isolée ne garantit pas une meilleure hémostase.",
          ),
          T(
            "Tenir compte de la dilution et des pertes opératoires.",
            "La chirurgie modifie rapidement un équilibre déjà précaire.",
          ),
        ],
        "Un saignement diffus persiste alors que l’INR reste difficile à interpréter.",
      ),
      qcm(
        "Le greffon fonctionne et la coagulation s’améliore. Quels axes structurent la surveillance postopératoire ?",
        src("b00057", "b00059", "b00115"),
        "La surveillance recherche récupération de synthèse et d’excrétion, stabilité neurologique, fonction rénale, infection et complications cardiopulmonaires.",
        [
          T(
            "Suivre INR et facteurs de coagulation dans le temps.",
            "Leur amélioration dynamique reflète la reprise de synthèse du greffon.",
          ),
          T(
            "Contrôler bilirubine et enzymes hépatiques.",
            "Ces marqueurs renseignent respectivement excrétion et lésion hépatocytaire.",
          ),
          T(
            "Surveiller conscience, rein et glycémie.",
            "Ces fonctions étaient menacées par la défaillance hépatique multiorganique.",
          ),
          T(
            "Rechercher une infection malgré des signes parfois discrets.",
            "Le terrain critique reste vulnérable aux complications infectieuses.",
          ),
          F(
            "Retirer toute surveillance dès la normalisation d’un seul INR.",
            "Une valeur isolée ne suffit pas à confirmer la stabilité globale.",
          ),
        ],
        "Le greffon fonctionne et la coagulation s’améliore.",
      ),
    ],
  },
];

function buildDpQcm() {
  return DP_QCM.map((entry, index) => ({
    label: `DP QCM ${index + 1} · ${entry.title}`,
    allowed_voies: ["interne"],
    vignette: entry.vignette,
    questions: entry.questions,
  }));
}

const ISOLATED_QROC = [
  {
    title: "Anatomie fonctionnelle",
    questions: [
      qroc(
        "Quelle fraction du débit hépatique provient de la veine porte ?",
        "70 %|environ 70 %",
        src("b00004"),
        "La veine porte fournit approximativement 70 % du débit sanguin total destiné au foie.",
      ),
      qroc(
        "Combien de segments anatomiques composent le foie ?",
        "8|huit",
        src("b00007"),
        "La segmentation fonctionnelle divise le foie en huit territoires utiles à la chirurgie de résection.",
      ),
      qroc(
        "Quel vaisseau collecte le sang au centre du lobule hépatique ?",
        "veine centrolobulaire|veine centrale",
        src("b00009"),
        "Les sinusoïdes convergent vers la veine centrolobulaire, puis vers les veines sus-hépatiques.",
      ),
      qroc(
        "Quelle cellule sinusoïdale phagocyte bactéries et éléments étrangers ?",
        "cellule de Kupffer|macrophage de Kupffer",
        src("b00009"),
        "Les cellules de Kupffer sont les macrophages résidents assurant une fonction de filtration sinusoïdale.",
      ),
      qroc(
        "Quelle zone lobulaire est préférentiellement lésée par le NAPQI ?",
        "zone centrolobulaire|zone 3",
        src("b00036"),
        "La toxicité de l’acétaminophène produit une nécrose prédominant dans la région centrolobulaire.",
      ),
    ],
  },
  {
    title: "Défaillance aiguë",
    questions: [
      qroc(
        "Quel seuil d’INR participe à la définition d’une insuffisance hépatique aiguë sévère ?",
        "> 1,5|supérieur à 1,5",
        src("b00013"),
        "Un INR supérieur à 1,5 associé à un facteur V inférieur à 50 % définit la forme sévère.",
      ),
      qroc(
        "Quel élément transforme une insuffisance aiguë sévère en forme grave ?",
        "encéphalopathie hépatique|encéphalopathie",
        src("b00015", "b00016"),
        "L’apparition d’une encéphalopathie sur les critères biologiques sévères définit la forme grave.",
      ),
      qroc(
        "Quel intervalle ictère–encéphalopathie définit la forme fulminante ?",
        "moins de 2 semaines|< 2 semaines",
        src("b00017"),
        "La forme fulminante associe ictère et encéphalopathie en moins de deux semaines.",
      ),
      qroc(
        "Quel signe clinique caractérise le grade 2 d’encéphalopathie ?",
        "astérixis|flapping tremor",
        src("b00050"),
        "Le tremblement battant ou astérixis distingue le grade 2 du simple ralentissement idéatoire.",
      ),
      qroc(
        "Quel trouble acido-basique est fréquent au début d’une insuffisance aiguë ?",
        "alcalose respiratoire",
        src("b00060"),
        "Une hyperventilation centrale provoque fréquemment une alcalose respiratoire précoce.",
      ),
    ],
  },
  {
    title: "Étiologies",
    questions: [
      qroc(
        "Quel anticorps établit le diagnostic d’hépatite A aiguë ?",
        "IgM anti-VHA|IgM VHA",
        src("b00022"),
        "La détection d’IgM dirigées contre le VHA signe une infection aiguë récente.",
      ),
      qroc(
        "Quel marqueur sérologique oriente vers une hépatite B aiguë ?",
        "IgM anti-HBc|anticorps IgM anti-HBc",
        src("b00023"),
        "Les IgM anti-HBc témoignent d’une infection récente par le virus de l’hépatite B.",
      ),
      qroc(
        "De quel virus le virus Delta dépend-il pour être infectieux ?",
        "VHB|virus de l’hépatite B",
        src("b00025", "b00026"),
        "Le VHD nécessite l’enveloppe du VHB et survient en co-infection ou surinfection.",
      ),
      qroc(
        "Quel métabolite intermédiaire explique la toxicité du paracétamol ?",
        "NAPQI",
        src("b00036"),
        "Le NAPQI s’accumule lorsque les voies de neutralisation sont dépassées et détruit les hépatocytes.",
      ),
      qroc(
        "Quel métal s’accumule dans le foie au cours de la maladie de Wilson ?",
        "cuivre",
        src("b00039"),
        "La maladie de Wilson est un trouble héréditaire du métabolisme entraînant une accumulation de cuivre.",
      ),
    ],
  },
  {
    title: "Cirrhose et organes",
    questions: [
      qroc(
        "Quel mécanisme explique l’hyponatrémie de dilution de la cirrhose ?",
        "augmentation de l’ADH|rétention d’eau libre par l’ADH",
        src("b00064"),
        "Le sous-remplissage artériel stimule l’ADH, qui retient de l’eau libre et dilue le sodium.",
      ),
      qroc(
        "Quelle modification électrocardiographique peut signaler la cardiomyopathie cirrhotique ?",
        "allongement du QT|QT prolongé",
        src("b00067"),
        "Un intervalle QT prolongé peut accompagner la dysfonction cardiaque et favoriser les troubles du rythme.",
      ),
      qroc(
        "Quel traitement vasoconstricteur soutient le syndrome hépatorénal ?",
        "terlipressine",
        src("b00069"),
        "La terlipressine, associée à l’albumine, améliore la circulation en attente de transplantation.",
      ),
      qroc(
        "Quel gradient alvéolo-artériel minimal définit le syndrome hépatopulmonaire ?",
        "> 15 mmHg|supérieur à 15 mmHg",
        src("b00071"),
        "Un gradient supérieur à 15 mmHg à l’air ambiant objective l’anomalie d’oxygénation.",
      ),
      qroc(
        "Au-dessus de quelle pression pulmonaire moyenne la forme portopulmonaire est-elle sévère ?",
        "> 50 mmHg|supérieure à 50 mmHg",
        src("b00072"),
        "Une pression artérielle pulmonaire moyenne dépassant 50 mmHg correspond à la catégorie sévère.",
      ),
    ],
  },
  {
    title: "Hémostase et scores",
    questions: [
      qroc(
        "Quel volume de plasma est cité lorsque l’INR dépasse 2 ?",
        "10 à 15 mL/kg|10-15 mL/kg",
        src("b00074"),
        "Le repère transfusionnel mentionne dix à quinze millilitres de plasma par kilogramme.",
      ),
      qroc(
        "Sous quel seuil plaquettaire une transfusion est-elle citée ?",
        "< 30 × 10⁹/L|moins de 30 G/L|30 G/L",
        src("b00075"),
        "Une numération inférieure à 30 × 10⁹/L constitue le seuil de référence présenté.",
      ),
      qroc(
        "Quelle limite rend l’INR isolé insuffisant pour prévoir les pertes sanguines chez le cirrhotique ?",
        "il n’évalue pas l’équilibre procoagulant-anticoagulant|baisse simultanée des facteurs pro et anticoagulants",
        src("b00078", "b00079"),
        "L’INR ignore la réduction parallèle des anticoagulants et les compensations par VIII et von Willebrand.",
      ),
      qroc(
        "Quels trois paramètres biologiques composent le MELD initial ?",
        "INR, créatinine et bilirubine|bilirubine, INR et créatinine",
        src("b00087"),
        "Le MELD initial combine bilirubine, INR et créatinine pour quantifier la sévérité.",
      ),
      qroc(
        "Quel paramètre supplémentaire transforme MELD en MELD-Na ?",
        "sodium sérique|natrémie|sodium",
        src("b00087"),
        "La natrémie complète le score afin de mieux intégrer le pronostic des formes hyponatrémiques.",
      ),
    ],
  },
  {
    title: "Pharmacologie anesthésique",
    questions: [
      qroc(
        "Quel hypnotique peut conserver sa dose usuelle en cirrhose modérée ?",
        "propofol",
        src("b00095"),
        "La pharmacocinétique du propofol reste suffisamment préservée pour une dose usuelle titrée.",
      ),
      qroc(
        "Quel opioïde court reste peu dépendant de la clairance hépatique grâce aux estérases plasmatiques ?",
        "rémifentanil|remifentanil",
        src("b00099"),
        "Le rémifentanil dépend d’estérases plasmatiques et reste peu affecté par la défaillance hépatique.",
      ),
      qroc(
        "Quel curare s’élimine principalement par dégradation de Hofmann ?",
        "cisatracurium",
        src("b00101"),
        "Le cisatracurium contourne largement foie et rein grâce à la dégradation de Hofmann.",
      ),
      qroc(
        "De combien réduire une perfusion prolongée d’anesthésique local amide ?",
        "10 à 50 %|10-50 %",
        src("b00102"),
        "Une perfusion ou des injections répétées d’amide doivent être diminuées de dix à cinquante pour cent.",
      ),
      qroc(
        "Quelle classe antalgique menace particulièrement la perfusion rénale du cirrhotique ?",
        "AINS|anti-inflammatoires non stéroïdiens",
        src("b00103"),
        "Les AINS inhibent les prostaglandines rénales protectrices et peuvent précipiter une insuffisance rénale.",
      ),
    ],
  },
  {
    title: "TIPS et résection",
    questions: [
      qroc(
        "Quel effet hémodynamique immédiat suit l’ouverture d’un TIPS ?",
        "augmentation du retour veineux|augmentation de la précharge",
        src("b00108"),
        "Le shunt détourne le débit portal vers la circulation systémique et élève brusquement la précharge.",
      ),
      qroc(
        "Quelle complication neurologique tardive est fréquente après TIPS ?",
        "encéphalopathie hépatique|encéphalopathie",
        src("b00108"),
        "Le court-circuit portal réduit la détoxification et favorise une encéphalopathie récidivante.",
      ),
      qroc(
        "Quel paramètre veineux cherche-t-on à abaisser pendant une hépatectomie ?",
        "pression veineuse centrale|TVC|PVC",
        src("b00111"),
        "Une pression veineuse centrale basse diminue la congestion des veines hépatiques et le saignement.",
      ),
      qroc(
        "Quels deux apports vasculaires la manœuvre de Pringle interrompt-elle ?",
        "artère hépatique et veine porte|veine porte et artère hépatique",
        src("b00111"),
        "Le clampage du pédicule suspend temporairement les flux artériel hépatique et portal.",
      ),
      qroc(
        "Quelle fonction doit être normale avant une phlébotomie sans remplacement ?",
        "fonction rénale",
        src("b00111"),
        "La réduction volémique par phlébotomie est réservée à un patient dont le rein est préservé.",
      ),
    ],
  },
  {
    title: "Transplantation et surveillance",
    questions: [
      qroc(
        "Quelles sont les trois phases opératoires d’une transplantation hépatique ?",
        "dissection, phase anhépatique et reperfusion|dissection, anhépatique, reperfusion",
        src("b00115"),
        "L’intervention enchaîne dissection du foie natif, période anhépatique puis reperfusion du greffon.",
      ),
      qroc(
        "Quelle chirurgie traite définitivement une cirrhose terminale sélectionnée ?",
        "transplantation hépatique|greffe hépatique",
        src("b00115"),
        "La transplantation remplace le parenchyme défaillant et constitue le traitement définitif sélectionné.",
      ),
      qroc(
        "Pourquoi une péridurale devient-elle délicate après hépatectomie ?",
        "coagulopathie postopératoire|risque d’hématome péridural",
        src("b00113"),
        "La coagulation peut se détériorer plusieurs jours et exposer à un hématome neuraxial au retrait.",
      ),
      qroc(
        "Quel marqueur biologique baisse précocement du fait de sa courte demi-vie ?",
        "facteur VII",
        src("b00059"),
        "Le facteur VII, dont la demi-vie approche quatre heures, diminue avant d’autres protéines de synthèse.",
      ),
      qroc(
        "Quelle anomalie glycémique peut annoncer une défaillance hépatique terminale ?",
        "hypoglycémie",
        src("b00061"),
        "L’épuisement de la glycogénolyse et de la néoglucogenèse peut provoquer une hypoglycémie tardive.",
      ),
    ],
  },
];

function buildIsolatedQroc() {
  return ISOLATED_QROC.map((entry, index) => ({
    label: `QROC ${index + 1} · ${entry.title}`,
    allowed_voies: ["externe"],
    questions: entry.questions,
  }));
}

const DP_QROC = [
  {
    title: "Hépatite B fulminante",
    vignette:
      "M. Delaunay est un patient de 34 ans sans antécédent hépatique, hospitalisé pour asthénie, anorexie, arthralgies et ictère apparus après un séjour prolongé à l’étranger. Les aminotransférases sont très élevées. L’INR est à 1,7 et le facteur V à 44 %, sans trouble de conscience lors de l’admission.",
    questions: [
      qroc(
        "Quel marqueur sérologique rechercher pour confirmer une hépatite B aiguë ?",
        "IgM anti-HBc|anticorps IgM anti-HBc",
        src("b00023"),
        "Les IgM dirigées contre l’antigène HBc témoignent d’une infection aiguë récente par le VHB.",
      ),
      qroc(
        "La sérologie retrouve des IgM anti-HBc. Comment classer l’insuffisance hépatique à ce stade ?",
        "insuffisance hépatique aiguë sévère|forme aiguë sévère",
        src("b00013", "b00014"),
        "Les seuils INR supérieur à 1,5 et facteur V inférieur à 50 % sont réunis sans encéphalopathie.",
        "La sérologie retrouve des IgM anti-HBc.",
      ),
      qroc(
        "Douze heures plus tard, le patient présente un astérixis. Quel grade d’encéphalopathie retenir ?",
        "grade 2|stade 2",
        src("b00050"),
        "L’astérixis ou tremblement battant caractérise précisément le deuxième grade neurologique.",
        "Douze heures plus tard, le patient présente un astérixis.",
      ),
      qroc(
        "L’ictère a précédé l’encéphalopathie de dix jours. Quel qualificatif temporel employer ?",
        "fulminante|hépatite fulminante",
        src("b00017"),
        "Un intervalle inférieur à deux semaines entre ictère et encéphalopathie définit la forme fulminante.",
        "L’ictère a précédé l’encéphalopathie de dix jours.",
      ),
      qroc(
        "Une alcalose respiratoire apparaît sans atteinte pulmonaire. Quel mécanisme initial est attendu ?",
        "hyperventilation centrale|stimulation centrale de la ventilation",
        src("b00060"),
        "La défaillance aiguë provoque fréquemment une hyperventilation centrale responsable de l’alcalose.",
        "Une alcalose respiratoire apparaît sans atteinte pulmonaire.",
      ),
      qroc(
        "La glycémie tombe à 0,45 g/L. Quel processus hépatique défaillant explique cette hypoglycémie ?",
        "défaut de glycogénolyse et de néoglucogenèse|défaillance de la production hépatique de glucose",
        src("b00061"),
        "L’incapacité à mobiliser le glycogène et à produire du glucose marque une atteinte hépatocellulaire terminale.",
        "La glycémie tombe à 0,45 g/L.",
      ),
      qroc(
        "Le patient devient confus malgré le soutien d’organe. Quel traitement définitif doit être évalué sans délai ?",
        "transplantation hépatique|greffe hépatique",
        src("b00019", "b00115"),
        "La forme fulminante grave expose à une mortalité majeure et justifie une évaluation urgente de greffe.",
        "Le patient devient confus malgré le soutien d’organe.",
      ),
    ],
  },
  {
    title: "Cholécystectomie chez une cirrhotique",
    vignette:
      "Mme Aït-Ali est une patiente de 66 ans atteinte de cirrhose métabolique, adressée pour cholécystectomie après plusieurs coliques hépatiques. Elle présente une ascite minime, une bilirubine à 28 µmol/L, une albumine à 33 g/L, un INR à 1,4, aucune encéphalopathie et une créatinine à 105 µmol/L.",
    questions: [
      qroc(
        "Quel score associe ascite, bilirubine, albumine, coagulation et encéphalopathie ?",
        "score de Child-Turcotte-Pugh|Child-Pugh|Child",
        src("b00088"),
        "Le score de Child–Turcotte–Pugh combine ces cinq domaines cliniques et biologiques.",
      ),
      qroc(
        "La natrémie mesurée à 128 mmol/L doit compléter quel score pronostique ?",
        "MELD-Na",
        src("b00087"),
        "Le MELD-Na ajoute le sodium au MELD fondé sur INR, créatinine et bilirubine.",
        "La natrémie mesurée à 128 mmol/L complète l’évaluation.",
      ),
      qroc(
        "L’échographie montre une importante circulation collatérale. Quelle anomalie hémodynamique en est la cause ?",
        "hypertension portale",
        src("b00063"),
        "La résistance du foie cirrhotique au retour portal entraîne la formation de voies collatérales.",
        "L’échographie montre une importante circulation collatérale.",
      ),
      qroc(
        "La patiente a un débit cardiaque élevé et des résistances basses. Comment nommer ce profil ?",
        "circulation hyperdynamique|syndrome hyperkinétique",
        src("b00064", "b00067"),
        "La vasodilatation systémique cirrhotique produit un hyperdébit qui peut masquer une faible réserve cardiaque.",
        "La patiente a un débit cardiaque élevé et des résistances basses.",
      ),
      qroc(
        "Une dose unique de propofol est choisie pour l’induction. Quelle adaptation est habituellement requise en cirrhose modérée ?",
        "aucune adaptation systématique|dose usuelle titrée",
        src("b00095"),
        "Une cirrhose modérée modifie peu la dose initiale de propofol, qui reste titrée à l’effet.",
        "Une dose unique de propofol est choisie pour l’induction.",
      ),
      qroc(
        "Un relâchement musculaire prévisible est recherché. Quel curare indépendant du foie privilégier ?",
        "cisatracurium",
        src("b00101"),
        "Le cisatracurium s’élimine principalement par dégradation de Hofmann, indépendamment du foie.",
        "Un relâchement musculaire prévisible est recherché.",
      ),
      qroc(
        "Une prescription d’ibuprofène est envisagée à la sortie. Quelle classe faut-il éviter ?",
        "AINS|anti-inflammatoires non stéroïdiens",
        src("b00103"),
        "Les AINS réduisent la perfusion rénale et augmentent le risque digestif chez la patiente cirrhotique.",
        "Une prescription d’ibuprofène est envisagée à la sortie.",
      ),
    ],
  },
  {
    title: "Saignement variqueux et TIPS",
    vignette:
      "M. Sfar est un patient de 58 ans présentant une cirrhose avec hémorragies digestives récidivantes par varices œsophagiennes. Malgré le traitement endoscopique, un nouveau saignement survient. L’équipe retient la mise en place d’un shunt portosystémique intrahépatique par voie transjugulaire.",
    questions: [
      qroc(
        "Quel objectif physiologique poursuit le TIPS ?",
        "diminuer la pression portale|décomprimer le système portal",
        src("b00108"),
        "Le shunt détourne une partie du débit portal vers le système cave et réduit la tension variqueuse.",
      ),
      qroc(
        "Pendant la traversée hépatique, l’abdomen se distend brutalement. Quelle complication hémorragique évoquer en premier ?",
        "hémopéritoine",
        src("b00004", "b00108"),
        "La perforation d’une branche portale ou artérielle peut provoquer un saignement intrapéritonéal massif.",
        "Pendant la traversée hépatique, l’abdomen se distend brutalement.",
      ),
      qroc(
        "Après ouverture du shunt, quel paramètre cardiaque augmente immédiatement ?",
        "précharge cardiaque|retour veineux",
        src("b00064", "b00108"),
        "Le débit portal dérivé rejoint directement la circulation systémique et augmente le remplissage cardiaque.",
        "Après ouverture du shunt, le débit central se modifie brutalement.",
      ),
      qroc(
        "Au réveil, des crépitants et une hypoxémie apparaissent. Quelle complication précoce retenir ?",
        "œdème aigu pulmonaire|OAP|insuffisance cardiaque aiguë",
        src("b00108", "b00067"),
        "La hausse rapide de précharge peut démasquer une cardiomyopathie cirrhotique et provoquer un OAP.",
        "Au réveil, des crépitants et une hypoxémie apparaissent.",
      ),
      qroc(
        "Trois jours plus tard, un astérixis apparaît. Quelle complication du shunt est probable ?",
        "encéphalopathie hépatique|encéphalopathie post-TIPS",
        src("b00050", "b00108"),
        "Le sang portal court-circuité est moins détoxifié, ce qui favorise l’accumulation de substances neurotoxiques.",
        "Trois jours plus tard, un astérixis apparaît.",
      ),
      qroc(
        "Six mois plus tard, les varices récidivent. Quelle anomalie mécanique du dispositif rechercher ?",
        "sténose du TIPS|sténose du shunt",
        src("b00063", "b00108"),
        "Le rétrécissement du shunt réduit la décompression portale et permet la réapparition des varices.",
        "Six mois plus tard, les varices récidivent.",
      ),
      qroc(
        "Quel score biochimique initial est lié à la survie après TIPS ?",
        "MELD|MELD-Na",
        src("b00087", "b00108"),
        "Le MELD quantifie la gravité hépatique initiale et a d’abord été développé pour le pronostic après TIPS.",
        "La survie à un an doit maintenant être estimée.",
      ),
    ],
  },
  {
    title: "Résection hépatique à risque hémorragique",
    vignette:
      "Mme Joly est une patiente de 63 ans sans cirrhose, opérée d’une volumineuse tumeur hépatique primitive. La lésion est proche de la veine cave inférieure et des veines sus-hépatiques. La fonction hépatique, la coagulation et la créatinine sont normales avant l’intervention.",
    questions: [
      qroc(
        "Quelle fraction approximative du débit cardiaque traverse le foie et explique son potentiel hémorragique ?",
        "25 %|un quart",
        src("b00004"),
        "Le foie reçoit environ un quart du débit cardiaque par ses apports portal et artériel combinés.",
      ),
      qroc(
        "Pendant la transection, quel objectif de pression veineuse limite le saignement ?",
        "pression veineuse centrale basse|TVC basse|PVC basse",
        src("b00004", "b00111"),
        "Une faible pression centrale réduit la congestion des veines hépatiques ouvertes sur la tranche de section.",
        "Pendant la transection, le chirurgien demande de réduire la congestion veineuse.",
      ),
      qroc(
        "Quelle position peut contribuer à diminuer la pression intrahépatique ?",
        "Trendelenburg inversé|proclive",
        src("b00064", "b00111"),
        "La position proclive diminue le retour veineux et participe à l’abaissement de la pression hépatique.",
        "La stabilité tensionnelle autorise une modification de position.",
      ),
      qroc(
        "Quel vasodilatateur veineux est cité pour abaisser la précharge ?",
        "nitroglycérine|trinitrine",
        src("b00067", "b00111"),
        "La nitroglycérine réduit la précharge et peut participer à la stratégie de pression veineuse basse.",
        "La pression veineuse reste élevée malgré la position.",
      ),
      qroc(
        "Quelle manœuvre chirurgicale clampe simultanément veine porte et artère hépatique ?",
        "manœuvre de Pringle|clampage de Pringle",
        src("b00004", "b00111"),
        "Le clampage du pédicule hépatique interrompt temporairement les deux afférences vasculaires du foie.",
        "Le saignement persiste au moment de la section parenchymateuse.",
      ),
      qroc(
        "À J1, l’INR augmente transitoirement. Quel risque fait rediscuter le maintien d’une péridurale ?",
        "hématome péridural|hématome neuraxial",
        src("b00078", "b00113"),
        "La coagulopathie postopératoire rend dangereuse la manipulation d’un cathéter dans un espace non compressible.",
        "À J1, l’INR augmente transitoirement après la résection.",
      ),
      qroc(
        "Quelle alternative permet au patient de titrer lui-même un opioïde en postopératoire ?",
        "analgésie contrôlée par le patient|ACP|PCA",
        src("b00099", "b00113"),
        "Une pompe d’analgésie contrôlée remplace utilement la péridurale lorsque la coagulation devient instable.",
        "La péridurale est finalement écartée pour sécuriser l’analgésie.",
      ),
    ],
  },
  {
    title: "Hypoxémie et hypertension portale",
    vignette:
      "M. Costa est un patient de 47 ans atteint d’une cirrhose cholestatique et candidat à une chirurgie abdominale. Il signale une dyspnée majorée debout. Les gaz du sang à l’air ambiant retrouvent un gradient alvéolo-artériel à 22 mmHg et une PaO₂ à 58 mmHg. L’imagerie exclut une embolie pulmonaire.",
    questions: [
      qroc(
        "Quel syndrome associe hypertension portale, gradient élevé et dilatation intrapulmonaire ?",
        "syndrome hépatopulmonaire",
        src("b00071"),
        "Le syndrome hépatopulmonaire réunit maladie portale, vasodilatation pulmonaire et trouble d’oxygénation.",
      ),
      qroc(
        "La PaO₂ chute ensuite à 48 mmHg. Quel sens pronostique porte ce seuil ?",
        "mauvais pronostic|forte augmentation de mortalité",
        src("b00071", "b00115"),
        "Une PaO₂ inférieure à 50 mmHg correspond à une hypoxémie sévère associée à une mortalité accrue.",
        "La PaO₂ chute ensuite à 48 mmHg malgré l’oxygène.",
      ),
      qroc(
        "Quel mécanisme vasculaire explique la faible réponse à une hausse de FiO₂ ?",
        "vasodilatation capillaire intrapulmonaire|shunt intrapulmonaire",
        src("b00057", "b00071"),
        "Les capillaires dilatés augmentent la distance de diffusion et créent un effet de shunt fonctionnel.",
        "L’augmentation de la FiO₂ améliore peu la saturation.",
      ),
      qroc(
        "Un cathétérisme retrouve une pression pulmonaire moyenne à 38 mmHg. Comment la classer ?",
        "hypertension pulmonaire modérée|forme modérée",
        src("b00072"),
        "Une pression moyenne comprise entre 35 et 50 mmHg définit l’hypertension portopulmonaire modérée.",
        "Un cathétérisme retrouve une pression pulmonaire moyenne à 38 mmHg.",
      ),
      qroc(
        "Quel traitement vasodilatateur pulmonaire est proposé pour préparer certains patients à la greffe ?",
        "époprosténol",
        src("b00067", "b00072"),
        "L’époprosténol peut réduire les pressions pulmonaires et permettre une réévaluation de transplantation.",
        "L’équipe souhaite abaisser les pressions avant toute opération majeure.",
      ),
      qroc(
        "Après traitement, quelle résistance pulmonaire résiduelle contre-indique la greffe ?",
        "> 300 dyn·s·cm⁻⁵|supérieure à 300 dyn·s·cm⁻⁵",
        src("b00072", "b00115"),
        "Des résistances dépassant 300 dyn·s·cm⁻⁵ après optimisation constituent un critère défavorable majeur.",
        "Après plusieurs semaines, le bilan hémodynamique est répété.",
      ),
      qroc(
        "Quelle fonction ventriculaire doit être normale avant d’autoriser la transplantation ?",
        "fonction ventriculaire droite|fonction du ventricule droit",
        src("b00072"),
        "Un ventricule droit fonctionnel est indispensable pour tolérer la postcharge pulmonaire pendant la greffe.",
        "Les pressions sont enfin contrôlées et la candidature est réexaminée.",
      ),
    ],
  },
  {
    title: "Choix anesthésiques en insuffisance hépatique",
    vignette:
      "Mme Vasseur est une patiente de 70 ans atteinte de cirrhose avancée, opérée en urgence d’une fracture du fémur. Elle présente hypoalbuminémie, ascite, encéphalopathie ancienne, clairance rénale conservée et traitement opioïde chronique. L’équipe doit réduire l’accumulation médicamenteuse et préserver le débit hépatique.",
    questions: [
      qroc(
        "Quelle conséquence l’hypoalbuminémie produit-elle sur la fraction libre des médicaments ?",
        "augmentation de la fraction libre|fraction libre augmentée",
        src("b00092"),
        "La diminution de liaison protéique accroît la proportion pharmacologiquement active dans le plasma.",
      ),
      qroc(
        "Une perfusion de midazolam est proposée. Pourquoi faut-il la limiter en cirrhose sévère ?",
        "métabolisme CYP3A diminué et effet prolongé|réveil retardé",
        src("b00097"),
        "L’altération tardive du CYP3A réduit la clairance du midazolam et peut prolonger la sédation.",
        "Une perfusion de midazolam est proposée pour toute la nuit.",
      ),
      qroc(
        "Quel opioïde de très courte durée contourne le métabolisme hépatique ?",
        "rémifentanil|remifentanil",
        src("b00099"),
        "Les estérases plasmatiques hydrolysent le rémifentanil indépendamment de la fonction du foie.",
        "Une analgésie peropératoire rapidement réversible est recherchée.",
      ),
      qroc(
        "Pourquoi la codéine est-elle peu adaptée dans ce contexte ?",
        "activation hépatique en morphine imprévisible|elle nécessite une conversion hépatique en morphine",
        src("b00099"),
        "Son efficacité dépend d’une biotransformation hépatique devenue variable dans l’insuffisance avancée.",
        "La codéine figure encore sur l’ancienne ordonnance antalgique.",
      ),
      qroc(
        "Quel curare biliaire peut avoir une durée prolongée ?",
        "rocuronium",
        src("b00100"),
        "Le rocuronium dépend du foie et de l’excrétion biliaire, ce qui prolonge son bloc neuromusculaire.",
        "Le chirurgien demande un relâchement profond pendant une heure.",
      ),
      qroc(
        "Quel pourcentage maximal de réduction est cité pour une perfusion prolongée d’amide ?",
        "50 %|cinquante pour cent",
        src("b00102"),
        "La réduction recommandée pour des administrations répétées ou continues s’étend de 10 à 50 %.",
        "Une perfusion prolongée d’anesthésique local est envisagée.",
      ),
      qroc(
        "Quels volatils préservent mieux l’autorégulation hépatique que l’halothane ?",
        "sévoflurane et desflurane|desflurane et sévoflurane",
        src("b00106"),
        "Le sévoflurane et le desflurane maintiennent mieux l’autorégulation du débit hépatique.",
        "L’équipe choisit finalement un entretien par agent volatil.",
      ),
    ],
  },
  {
    title: "Coagulation cirrhotique avant geste invasif",
    vignette:
      "M. Renaud est un patient de 60 ans porteur d’une cirrhose virale. Un drainage profond est envisagé. L’INR est à 2,1, les plaquettes à 28 × 10⁹/L, le fibrinogène à 1,7 g/L et l’hémoglobine à 78 g/L. Il ne présente aucun saignement spontané et reste hémodynamiquement stable.",
    questions: [
      qroc(
        "Quel volume de plasma par kilogramme est cité pour un INR supérieur à 2 ?",
        "10 à 15 mL/kg|10-15 mL/kg",
        src("b00074"),
        "Le repère historique propose dix à quinze millilitres par kilogramme lorsque l’INR dépasse deux.",
      ),
      qroc(
        "La numération descend à 28 × 10⁹/L. Quel seuil transfusionnel est franchi ?",
        "30 × 10⁹/L|30 G/L",
        src("b00075"),
        "Le seuil plaquettaire cité est inférieur à 30 × 10⁹/L pour envisager cinq à dix unités.",
        "La numération descend à 28 × 10⁹/L avant le geste.",
      ),
      qroc(
        "Le fibrinogène reste à 1,7 g/L. Quel produit sanguin est cité ?",
        "cryoprécipités|cryoprecipitate",
        src("b00076"),
        "Un fibrinogène inférieur à 2 g/L correspond au repère d’administration de cryoprécipités.",
        "Le fibrinogène reste à 1,7 g/L lors du contrôle.",
      ),
      qroc(
        "Pourquoi l’absence de saignement interdit-elle une correction purement automatique de l’INR ?",
        "l’INR prédit mal le saignement cirrhotique|hémostase rééquilibrée",
        src("b00078", "b00080"),
        "La baisse simultanée des facteurs procoagulants et anticoagulants rend l’INR insuffisant pour décider seul.",
        "Le patient reste pourtant sans manifestation hémorragique.",
      ),
      qroc(
        "Quelle protéase réduite augmente la disponibilité du facteur von Willebrand ?",
        "ADAMTS13",
        src("b00079"),
        "La diminution d’ADAMTS13 laisse davantage de multimères de von Willebrand capables de soutenir l’adhésion.",
        "Le bilan spécialisé montre un facteur von Willebrand élevé malgré la thrombopénie.",
      ),
      qroc(
        "Pourquoi un geste neuraxial impose-t-il davantage de prudence qu’une ponction compressible ?",
        "risque d’hématome dans un espace non compressible|risque d’hématome neuraxial",
        src("b00081"),
        "Un saignement rachidien ne peut pas être comprimé et peut provoquer une lésion neurologique majeure.",
        "Une technique neuraxiale est évoquée comme alternative au drainage.",
      ),
      qroc(
        "Quel principe décisionnel doit finalement guider la correction hémostatique ?",
        "contexte clinique et saignement réel|évaluation globale plutôt que chiffres isolés",
        src("b00078", "b00080", "b00081"),
        "La nature du geste, le saignement, l’évolution et les déficits pertinents priment sur une valeur isolée.",
        "L’équipe multidisciplinaire réévalue le rapport bénéfice-risque du geste.",
      ),
    ],
  },
  {
    title: "Donneur vivant et récupération postopératoire",
    vignette:
      "Mme Fontaine est une patiente de 41 ans en bonne santé, évaluée comme donneuse vivante d’un lobe hépatique pour un proche. Sa fonction hépatique, sa coagulation et sa fonction rénale sont normales. L’équipe prévoit une résection majeure et souhaite limiter les pertes sanguines puis organiser une analgésie compatible avec la coagulopathie transitoire.",
    questions: [
      qroc(
        "Quelle condition rénale permet d’envisager une phlébotomie sans remplacement ?",
        "fonction rénale normale|fonction rénale préservée",
        src("b00111"),
        "La stratégie de réduction volémique n’est proposée que lorsque la fonction rénale est initialement normale.",
      ),
      qroc(
        "Quel diurétique est cité parmi les moyens de réduire la pression veineuse centrale ?",
        "furosémide|furosemide",
        src("b00069", "b00111"),
        "Le furosémide peut contribuer à la stratégie de faible pression veineuse pendant la transection.",
        "La pression veineuse centrale reste supérieure à l’objectif avant la transection.",
      ),
      qroc(
        "Quelle double vascularisation explique la nécessité de clamper le pédicule pour contrôler l’afflux ?",
        "veine porte et artère hépatique|artère hépatique et veine porte",
        src("b00004", "b00111"),
        "Le foie reçoit un apport portal majoritaire et un apport artériel complémentaire réunis dans le pédicule.",
        "La section approche maintenant le pédicule hépatique.",
      ),
      qroc(
        "Quel nom porte le clampage intermittent de ces deux afférences ?",
        "manœuvre de Pringle|clampage de Pringle",
        src("b00110", "b00111"),
        "La manœuvre de Pringle interrompt temporairement les flux portal et artériel hépatique.",
        "Une hémorragie diffuse apparaît pendant la transection.",
      ),
      qroc(
        "Pourquoi la coagulation peut-elle se dégrader dans les jours suivants ?",
        "insuffisance hépatique transitoire après résection|diminution transitoire de synthèse",
        src("b00059", "b00113"),
        "La masse hépatique restante peut présenter quelques jours de dysfonction avec synthèse diminuée.",
        "Au premier jour postopératoire, l’INR s’élève alors que le saignement chirurgical est contrôlé.",
      ),
      qroc(
        "Quelle complication neuraxiale redoute-t-on au retrait d’un cathéter pendant cette période ?",
        "hématome péridural|hématome neuraxial",
        src("b00078", "b00113"),
        "Le retrait au cours d’une coagulopathie expose à un saignement compressif dans le canal rachidien.",
        "À J2, l’INR augmente alors qu’un cathéter péridural est encore en place.",
      ),
      qroc(
        "Quelle technique intrathécale unique est citée comme alternative antalgique ?",
        "morphine intrathécale|morphine rachidienne",
        src("b00099", "b00113"),
        "Une injection unique de morphine intrathécale peut intégrer une analgésie multimodale sans cathéter prolongé.",
        "Pour une future procédure, l’équipe veut éviter tout cathéter prolongé.",
      ),
    ],
  },
];

function buildDpQroc() {
  return DP_QROC.map((entry, index) => ({
    label: `DP QROC ${index + 1} · ${entry.title}`,
    allowed_voies: ["externe"],
    vignette: entry.vignette,
    questions: entry.questions,
  }));
}

function validateSourceBlocks(extract, content) {
  const known = new Set((extract.blocs || []).map((block) => block.id));
  const missing = [];
  const visit = (value) => {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    if (Array.isArray(value.sourceBlocks)) {
      for (const id of value.sourceBlocks) if (!known.has(id)) missing.push(id);
    }
    for (const [key, child] of Object.entries(value))
      if (key !== "sourceBlocks") visit(child);
  };
  visit(content);
  if (missing.length)
    throw new Error(
      `Chapitre 25 : sourceBlocks inconnus : ${[...new Set(missing)].join(", ")}`,
    );
}

const QCM_BALANCE_OVERRIDES = Object.freeze({
  "1A": {
    "is_correct": false,
    "enonce": "La production exclusive des globules rouges adultes ; Le stockage de nutriments.",
    "justification": "L’érythropoïèse médullaire assure cette fonction chez l’adulte. Cette fonction participe au maintien de l’homéostasie énergétique."
  },
  "1E": {
    "is_correct": true,
    "enonce": "Le métabolisme de nombreux médicaments ; La synthèse des protéines plasmatiques.",
    "justification": "La clairance hépatique conditionne leur durée d’action. L’albumine et plusieurs protéines dépendent de cette fonction."
  },
  "2E": {
    "is_correct": true,
    "enonce": "Une artériole hépatique et une veinule portale ; Des canalicules biliaires.",
    "justification": "Elles constituent le double apport microcirculatoire. Ils transportent la bile vers les conduits interlobulaires."
  },
  "3A": {
    "is_correct": false,
    "enonce": "Produire les canalicules biliaires par contraction ; Phagocyter des bactéries venues de l’intestin.",
    "justification": "Les canalicules sont des structures de drainage entre hépatocytes. Le sang portal expose directement le foie aux produits digestifs."
  },
  "4B": {
    "is_correct": false,
    "enonce": "Une TVC élevée diminue toujours les pertes de résection ; Une baisse du retour portal peut diminuer l’apport hépatique.",
    "justification": "Une pression veineuse élevée augmente la congestion et le saignement. La veine porte fournit la majeure partie du débit."
  },
  "5A": {
    "is_correct": false,
    "enonce": "Une cirrhose ancienne nécessaire ; Un INR supérieur à 1,5.",
    "justification": "Le syndrome aigu décrit survient sur un foie auparavant sain. Ce seuil traduit l’altération de la synthèse des facteurs."
  },
  "5D": {
    "is_correct": false,
    "enonce": "Une encéphalopathie obligatoire ; Une destruction hépatique massive et brutale.",
    "justification": "Sa présence transforme la forme sévère en forme grave. Elle est au cœur de l’insuffisance hépatocellulaire aiguë."
  },
  "6E": {
    "is_correct": true,
    "enonce": "Deux semaines à trois mois définit la forme subfulminante ; L’encéphalopathie est nécessaire à la forme grave.",
    "justification": "Cette fenêtre correspond à une évolution plus lente. Elle différencie la forme grave de la forme sévère."
  },
  "7A": {
    "is_correct": false,
    "enonce": "L’incidence exacte est connue par un registre exhaustif de population ; L’absence d’encéphalopathie est associée à une mortalité inférieure à 2 %.",
    "justification": "Les données proviennent surtout de centres de greffe. Le pronostic reste relativement favorable sans atteinte neurologique."
  },
  "9E": {
    "is_correct": false,
    "enonce": "Le fibrinogène chute toujours en premier ; L’alcalose respiratoire est fréquente au début.",
    "justification": "Il peut rester normal longtemps malgré l’insuffisance. Une hyperventilation centrale en est le mécanisme."
  },
  "10E": {
    "is_correct": true,
    "enonce": "L’insuffisance aiguë est rare, autour de 1 % ; L’incubation est voisine d’un mois.",
    "justification": "La plupart des infections ont une issue favorable. Ce délai précède habituellement une évolution favorable."
  },
  "11E": {
    "is_correct": true,
    "enonce": "Une forme fulminante complique environ 1 % des cas ; L’incubation s’étend de dix semaines à six mois.",
    "justification": "Cette complication reste rare mais grave. Cette fenêtre est beaucoup plus longue que celle du VHA."
  },
  "12E": {
    "is_correct": true,
    "enonce": "Le VHC se transmet principalement par le sang ; Le VHC est souvent asymptomatique et chronique.",
    "justification": "La contamination parentérale est son mode majeur. L’hépatite aiguë manifeste est rare."
  },
  "13B": {
    "is_correct": false,
    "enonce": "Les symptômes sont toujours absents pendant une semaine ; Une dose toxique dépasse la capacité de neutralisation.",
    "justification": "Nausées, vomissements et hépatalgie peuvent survenir en 24 à 36 heures. Le métabolite réactif s’accumule alors dans l’hépatocyte."
  },
  "13D": {
    "is_correct": false,
    "enonce": "Les symptômes sont toujours absents pendant une semaine ; Une insuffisance rénale peut accompagner l’intoxication.",
    "justification": "Nausées, vomissements et hépatalgie peuvent survenir en 24 à 36 heures. L’atteinte ne se limite pas toujours au foie."
  },
  "14A": {
    "is_correct": false,
    "enonce": "Foie cardiaque — mécanisme exclusivement infectieux ; Alcool chronique massif — hépatite aiguë sur maladie chronique.",
    "justification": "Congestion, ischémie et hypoxie expliquent ce syndrome. Une hausse récente de consommation peut déclencher la décompensation."
  },
  "15E": {
    "is_correct": true,
    "enonce": "Une hypoalbuminémie ; Une hypertension portale.",
    "justification": "La synthèse réduite et les pertes dans l’ascite abaissent l’albumine. Le foie remodelé oppose une résistance au retour portal."
  },
  "16E": {
    "is_correct": true,
    "enonce": "Les résistances vasculaires systémiques sont diminuées ; La vasodilatation splanchnique réduit la perfusion rénale efficace.",
    "justification": "Les shunts et médiateurs vasodilatateurs expliquent ce profil. Le sang se distribue davantage dans le territoire abdominal."
  },
  "17A": {
    "is_correct": false,
    "enonce": "Une hypertension systémique constante révélant facilement la maladie ; Une dysfonction diastolique.",
    "justification": "Les résistances basses peuvent masquer la dysfonction. Elle peut être identifiée par échocardiographie."
  },
  "18E": {
    "is_correct": true,
    "enonce": "Terlipressine et albumine soutiennent le syndrome hépatorénal ; La greffe est le traitement définitif du syndrome hépatorénal.",
    "justification": "Ces traitements améliorent la circulation en attente de greffe. Elle corrige la maladie hépatique responsable."
  },
  "19C": {
    "is_correct": false,
    "enonce": "Une correction complète de la saturation par toute hausse de FiO₂ ; Une pression portale pathologiquement élevée.",
    "justification": "L’oxygénation peut rester peu réactive à l’augmentation d’oxygène. L’hypertension du système porte appartient au terrain définissant ce syndrome."
  },
  "20E": {
    "is_correct": true,
    "enonce": "Culots globulaires pour une hémoglobine entre 60 et 100 g/L selon le contexte ; Plasma 10 à 15 mL/kg si INR supérieur à 2.",
    "justification": "Cette zone nécessite une décision individualisée. Ce repère est historiquement proposé par l’ASA."
  },
  "21B": {
    "is_correct": false,
    "enonce": "L’INR mesure directement l’ensemble du versant anticoagulant ; Les protéines C et S sont également diminuées.",
    "justification": "Il a été conçu pour la warfarine et n’intègre pas cet équilibre. Le versant anticoagulant est lui aussi déficitaire."
  },
  "21E": {
    "is_correct": true,
    "enonce": "Les protéines C et S sont également diminuées ; Le facteur VIII augmente en situation de stress.",
    "justification": "Le versant anticoagulant est lui aussi déficitaire. Sa production partiellement extrahépatique contribue à cette hausse."
  },
  "22E": {
    "is_correct": true,
    "enonce": "Renforcer la prudence avant un bloc neuraxial ; Prendre en compte le saignement réel et l’évolution.",
    "justification": "Un hématome dans un espace non compressible est grave. La clinique et la dynamique sont essentielles."
  },
  "23A": {
    "is_correct": false,
    "enonce": "MELD repose sur l’ASAT seule ; Child inclut l’ascite.",
    "justification": "Les aminotransférases ne constituent pas l’équation du MELD. Cette manifestation clinique reflète l’hypertension portale et la synthèse."
  },
  "23E": {
    "is_correct": true,
    "enonce": "MELD-Na ajoute le sodium sérique ; Child inclut l’ascite.",
    "justification": "L’hyponatrémie améliore la stratification pronostique. Cette manifestation clinique reflète l’hypertension portale et la synthèse."
  },
  "25E": {
    "is_correct": true,
    "enonce": "Le volume de distribution augmente ; La liaison protéique diminue.",
    "justification": "Ascite et modifications hydriques y contribuent. L’hypoalbuminémie augmente la fraction libre."
  },
  "26E": {
    "is_correct": true,
    "enonce": "Le midazolam est surtout prolongé en cirrhose sévère ; La kétamine a peu d’effet sur le débit hépatique.",
    "justification": "Le CYP3A est affecté tardivement dans l’évolution. Cette stabilité est un avantage hémodynamique relatif."
  },
  "27E": {
    "is_correct": true,
    "enonce": "Le tramadol doit voir sa dose diminuée ; Le rémifentanil est peu affecté.",
    "justification": "Son métabolisme et son action mixte imposent la prudence. Les estérases plasmatiques assurent son métabolisme."
  },
  "28A": {
    "is_correct": false,
    "enonce": "La laudanosine est totalement inerte lors de perfusions prolongées ; Le cisatracurium est un curare de choix.",
    "justification": "Ce métabolite a des propriétés épileptogènes et une élimination hépatique. Son élimination de Hofmann est indépendante du foie."
  },
  "28B": {
    "is_correct": false,
    "enonce": "Le sugammadex possède une cinétique parfaitement établie en cirrhose ; Le rocuronium peut avoir une durée prolongée.",
    "justification": "Les données pharmacocinétiques y sont peu connues. Il est métabolisé par le foie et éliminé surtout dans la bile."
  },
  "30E": {
    "is_correct": true,
    "enonce": "Un œdème aigu pulmonaire au réveil ; Une encéphalopathie à moyen terme.",
    "justification": "L’augmentation brusque du retour veineux surcharge le cœur. Le shunt réduit l’épuration hépatique des substances portales."
  },
  "31E": {
    "is_correct": true,
    "enonce": "Le Trendelenburg inversé peut diminuer la pression intrahépatique ; Une hémorragie importante reste possible avec une coagulation normale.",
    "justification": "La position proclive contribue à réduire la congestion veineuse. Le risque provient de la richesse vasculaire du foie."
  },
  "32E": {
    "is_correct": true,
    "enonce": "Le Trendelenburg inversé ; La nitroglycérine.",
    "justification": "La position diminue la pression veineuse intrahépatique. La venodilatation peut réduire la pression de remplissage."
  },
  "33E": {
    "is_correct": true,
    "enonce": "La coagulation peut se perturber en postopératoire ; Certains centres évitent la péridurale.",
    "justification": "Cette évolution augmente le risque autour d’un cathéter péridural. Le risque d’hématome neuraxial motive cette prudence."
  },
  "34B": {
    "is_correct": false,
    "enonce": "Elle reste aujourd’hui une procédure expérimentale ; Elle peut traiter un hépatocarcinome non résécable.",
    "justification": "Les progrès anesthésiques, chirurgicaux et immunosuppresseurs l’ont standardisée. Cette indication oncologique est explicitement citée."
  },
  "35A": {
    "is_correct": false,
    "enonce": "Une élévation isolée de gamma-GT sans signe clinique ; Une encéphalopathie sur insuffisance aiguë sévère.",
    "justification": "La cholestase biologique isolée ne constitue pas une indication urgente de transplantation. L’atteinte neurologique transforme la forme sévère en forme grave."
  },
  "36E": {
    "is_correct": true,
    "enonce": "Un score MELD ou MELD-Na actualisé ; Une évaluation de la réserve cardiaque.",
    "justification": "Il intègre synthèse, excrétion, rein et éventuellement sodium dans le pronostic. La cardiomyopathie cirrhotique peut être masquée par l’hyperdébit basal."
  },
  "38D": {
    "is_correct": true,
    "enonce": "Vérifier la coagulation avant toute manipulation neuraxiale ; Prévoir une ACP lorsque la voie péridurale est écartée.",
    "justification": "Le retrait d’un cathéter pendant une coagulopathie expose à un hématome. Le patient peut titrer l’opioïde dans un cadre surveillé."
  },
  "39D": {
    "is_correct": false,
    "enonce": "L’albumine élevée prouve une insuffisance de synthèse aiguë ; Le facteur VII diminue précocement lors d’un défaut de synthèse.",
    "justification": "C’est une diminution de la production protéique qui traduit la défaillance. Sa demi-vie très courte rend sa baisse rapidement visible."
  },
  "40E": {
    "is_correct": true,
    "enonce": "Le NAPQI est le métabolite hépatotoxique ; La capacité de neutralisation est dépassée lors du surdosage.",
    "justification": "Ce composé réactif est normalement neutralisé aux doses thérapeutiques. Le métabolite toxique s’accumule alors dans les hépatocytes."
  },
  "41D": {
    "is_correct": true,
    "enonce": "Le syndrome survient ici sur un foie auparavant sain ; La forme aiguë sévère est constituée.",
    "justification": "La patiente n’a pas de maladie chronique connue. INR supérieur à 1,5 et facteur V inférieur à 50 % remplissent la définition."
  },
  "42A": {
    "is_correct": false,
    "enonce": "Le signe correspond à un coma de grade 4 ; L’encéphalopathie est de grade 2.",
    "justification": "Le coma est une étape beaucoup plus avancée. L’astérixis définit ce niveau neurologique."
  },
  "42C": {
    "is_correct": false,
    "enonce": "Le signe correspond à un coma de grade 4 ; Le pronostic se dégrade par rapport à l’absence d’encéphalopathie.",
    "justification": "Le coma est une étape beaucoup plus avancée. La mortalité augmente fortement avec l’atteinte cérébrale."
  },
  "43E": {
    "is_correct": true,
    "enonce": "Un œdème cérébral peut apparaître ; La confusion correspond au grade 3.",
    "justification": "La dysrégulation cérébrale accompagne les formes graves. Cette altération neurologique suit l’astérixis dans la gradation."
  },
  "44B": {
    "is_correct": false,
    "enonce": "La dysglycémie exclut toute défaillance multiorganique ; La néoglucogenèse hépatique devient insuffisante.",
    "justification": "Les troubles métaboliques font justement partie du syndrome multiple. Cette voie ne compense plus les besoins métaboliques."
  },
  "44C": {
    "is_correct": false,
    "enonce": "La dysglycémie exclut toute défaillance multiorganique ; L’hypophosphorémie est décrite dans l’intoxication au paracétamol.",
    "justification": "Les troubles métaboliques font justement partie du syndrome multiple. Cette anomalie électrolytique accompagne spécifiquement ce contexte."
  },
  "45A": {
    "is_correct": false,
    "enonce": "La forme est chronique parce que l’ictère dure plusieurs jours ; La forme est fulminante.",
    "justification": "La chronicité exige une persistance supérieure à six mois. Quatre jours se situent nettement sous le seuil de deux semaines."
  },
  "46B": {
    "is_correct": false,
    "enonce": "La greffe est réservée uniquement à la cirrhose alcoolique ; Le pronostic sans transplantation est défavorable.",
    "justification": "Les insuffisances aiguës figurent parmi ses indications majeures. La mortalité fulminante non greffée est extrêmement élevée."
  },
  "47E": {
    "is_correct": true,
    "enonce": "Une encéphalopathie signale une détoxification insuffisante ; L’ascite traduit une hypertension portale et une transsudation.",
    "justification": "L’ammoniaque et d’autres substances atteignent la circulation systémique. Le remodelage hépatique s’oppose au retour du sang portal."
  },
  "48B": {
    "is_correct": false,
    "enonce": "Le poids du foie remplace la bilirubine dans le MELD ; L’albumine participe au score Child.",
    "justification": "La masse anatomique n’appartient pas à l’équation. Une valeur basse augmente le nombre de points."
  },
  "49B": {
    "is_correct": false,
    "enonce": "Des résistances basses excluent toute cardiomyopathie ; Une évolution possible vers une dysfonction systolique.",
    "justification": "Elles peuvent au contraire masquer la dysfonction contractile. La maladie progresse classiquement du diastolique au systolique."
  },
  "51E": {
    "is_correct": true,
    "enonce": "Le cisatracurium contourne largement le métabolisme hépatique ; Une perfusion très prolongée de cisatracurium impose une vigilance sur la laudanosine.",
    "justification": "La voie de Hofmann assure son élimination principale. Ce métabolite épileptogène dépend du foie pour son élimination."
  },
  "54A": {
    "is_correct": false,
    "enonce": "Augmenter la résistance à l’écoulement portal ; Réduire la pression dans la veine porte.",
    "justification": "Le dispositif vise précisément à contourner cette résistance. Le conduit détourne une partie du flux portal vers la circulation cave."
  },
  "54D": {
    "is_correct": false,
    "enonce": "Restaurer immédiatement toute fonction de synthèse hépatique ; Remplacer l’ancien shunt portocave ouvert.",
    "justification": "Le TIPS décompresse le portail sans remplacer le parenchyme. La voie transjugulaire est moins invasive que la laparotomie."
  },
  "55B": {
    "is_correct": false,
    "enonce": "Une simple sténose tardive du shunt comme seule explication ; Une lésion de l’artère hépatique.",
    "justification": "La sténose n’explique pas ce collapsus perprocédural brutal. La branche artérielle peut être atteinte pendant le trajet."
  },
  "55C": {
    "is_correct": false,
    "enonce": "Une simple sténose tardive du shunt comme seule explication ; Un saignement intrapéritonéal par perforation vasculaire.",
    "justification": "La sténose n’explique pas ce collapsus perprocédural brutal. Le sang peut diffuser librement dans l’abdomen après la ponction hépatique."
  },
  "56A": {
    "is_correct": false,
    "enonce": "Le retour veineux s’effondre obligatoirement ; Le retour veineux central augmente.",
    "justification": "La décompression portale augmente plutôt le flux vers le cœur. Le flux portal est dérivé vers la circulation systémique."
  },
  "57B": {
    "is_correct": false,
    "enonce": "Le tableau prouve uniquement une infection pulmonaire tardive ; Une insuffisance cardiaque peut être démasquée.",
    "justification": "La chronologie immédiate oriente vers une surcharge hémodynamique. La fonction au repos ne garantit pas une réserve suffisante."
  },
  "57E": {
    "is_correct": true,
    "enonce": "Une insuffisance cardiaque peut être démasquée ; La dysfonction diastolique cirrhotique peut contribuer.",
    "justification": "La fonction au repos ne garantit pas une réserve suffisante. Un ventricule peu compliant tolère mal l’augmentation de remplissage."
  },
  "58A": {
    "is_correct": false,
    "enonce": "La confusion prouve une sténose immédiate protectrice du shunt ; Une encéphalopathie hépatique de grade 2 est probable.",
    "justification": "Une sténose peut survenir mais n’explique pas directement cette aggravation. Le tremblement battant observé correspond précisément au deuxième grade neurologique."
  },
  "59A": {
    "is_correct": false,
    "enonce": "Une disparition définitive de tout risque cardiaque ; Une sténose du shunt.",
    "justification": "La surcharge et la cardiomyopathie restent pertinentes. Le rétrécissement réduit l’efficacité de décompression portale."
  },
  "60C": {
    "is_correct": false,
    "enonce": "Uniquement du diamètre technique du cathéter jugulaire ; Du sodium dans la version MELD-Na.",
    "justification": "La maladie hépatique globale domine le pronostic à distance. L’hyponatrémie améliore l’évaluation pronostique."
  },
  "61B": {
    "is_correct": false,
    "enonce": "L’absence de cirrhose interdit toute transfusion ; Les veines sus-hépatiques sont de gros collecteurs vers la VCI.",
    "justification": "La fonction normale ne protège pas contre une perte sanguine chirurgicale. Leur ouverture expose à un saignement veineux majeur."
  },
  "61E": {
    "is_correct": true,
    "enonce": "Les veines sus-hépatiques sont de gros collecteurs vers la VCI ; Une coagulation normale ne supprime pas le risque mécanique.",
    "justification": "Leur ouverture expose à un saignement veineux majeur. Le problème peut provenir directement des vaisseaux sectionnés."
  },
  "62E": {
    "is_correct": true,
    "enonce": "Diminuer la congestion des veines hépatiques ; Réduire les pertes sanguines peropératoires.",
    "justification": "Une pression veineuse plus basse réduit leur remplissage. C’est l’objectif central de cette stratégie."
  },
  "63A": {
    "is_correct": false,
    "enonce": "La position augmente obligatoirement le retour veineux ; La pression veineuse intrahépatique peut diminuer.",
    "justification": "Le Trendelenburg inversé a l’effet opposé. Le proclive réduit la colonne hydrostatique vers le foie."
  },
  "64A": {
    "is_correct": false,
    "enonce": "Une insuffisance rénale avancée est l’indication idéale ; La fonction rénale doit être préservée.",
    "justification": "Ce terrain augmente le danger de la réduction volémique. Le texte réserve explicitement cette stratégie à ce profil."
  },
  "64B": {
    "is_correct": false,
    "enonce": "Le sang retiré doit être immédiatement remplacé avant la transection ; Le volume retiré doit s’intégrer à une surveillance hémodynamique.",
    "justification": "Le remplacement immédiat annulerait l’effet recherché sur la TVC. Une hypovolémie excessive compromet organes et pression artérielle."
  },
  "65A": {
    "is_correct": false,
    "enonce": "Le retour de toute la veine cave inférieure ; Le flux de l’artère hépatique.",
    "justification": "Le clampage pédiculaire n’est pas un clampage cave. Cette branche chemine dans le pédicule clampé."
  },
  "65D": {
    "is_correct": false,
    "enonce": "Le drainage des trois veines sus-hépatiques directement ; La majorité du débit hépatique total.",
    "justification": "Ces veines se situent en aval et ne sont pas dans le pédicule portal. La veine porte et l’artère constituent ensemble le double apport."
  },
  "66A": {
    "is_correct": false,
    "enonce": "Retirer tout cathéter sans vérifier la coagulation ; Évaluer le risque d’hématome autour d’une péridurale.",
    "justification": "Le retrait dans une coagulopathie peut provoquer un hématome neuraxial. La coagulation peut se détériorer plusieurs jours après l’hépatectomie."
  },
  "66E": {
    "is_correct": true,
    "enonce": "Envisager une ACP en l’absence de péridurale ; Associer des analgésiques non neuraxiaux adaptés.",
    "justification": "Cette modalité permet une titration antalgique contrôlée. Paracétamol, lidocaïne ou kétamine peuvent intégrer la multimodalité."
  },
  "67B": {
    "is_correct": false,
    "enonce": "Toute élévation transitoire impose une greffe immédiate ; La coagulation peut s’améliorer parallèlement.",
    "justification": "Une récupération spontanée peut suivre une hépatectomie partielle. La synthèse hépatique récupère avec la fonction parenchymateuse."
  },
  "67D": {
    "is_correct": false,
    "enonce": "Toute élévation transitoire impose une greffe immédiate ; La surveillance biologique reste nécessaire jusqu’à stabilisation.",
    "justification": "Une récupération spontanée peut suivre une hépatectomie partielle. La dynamique confirme la récupération et sécurise les gestes invasifs."
  },
  "69C": {
    "is_correct": false,
    "enonce": "Elle correspond à une oxygénation normale pour une cirrhose ; Elle renforce l’indication d’une évaluation de transplantation.",
    "justification": "La cirrhose n’autorise pas à banaliser une hypoxémie de cette profondeur. La greffe traite la maladie hépatique responsable du shunt fonctionnel."
  },
  "70B": {
    "is_correct": false,
    "enonce": "Une preuve formelle de bronchospasme isolé ; Un trouble majeur du rapport ventilation-perfusion.",
    "justification": "La faible réponse à l’oxygène n’impose pas une obstruction bronchique. La perfusion de territoires insuffisamment oxygénés entretient l’hypoxémie."
  },
  "70C": {
    "is_correct": false,
    "enonce": "Une consommation hépatique complète de l’oxygène administré ; Une limitation de diffusion dans les capillaires dilatés.",
    "justification": "Le foie ne soustrait pas sélectivement l’oxygène avant la circulation pulmonaire. La distance entre alvéole et hématie augmente lorsque le vaisseau s’élargit."
  },
  "72A": {
    "is_correct": false,
    "enonce": "Un bêtabloquant non sélectif doit être commencé pour le poumon ; L’époprosténol peut être utilisé pour abaisser les pressions.",
    "justification": "Ces médicaments peuvent aggraver la tolérance hémodynamique de l’hypertension pulmonaire. Cette prostacycline est proposée afin de préparer certains patients à la greffe."
  },
  "73A": {
    "is_correct": false,
    "enonce": "Les résistances mesurées n’ont aucun rôle dans la sélection ; La greffe hépatique est contre-indiquée dans cet état.",
    "justification": "Une valeur supérieure à 300 fait partie des critères de contre-indication. Les deux seuils hémodynamiques défavorables restent franchis malgré le traitement."
  },
  "73C": {
    "is_correct": false,
    "enonce": "Les résistances mesurées n’ont aucun rôle dans la sélection ; Le risque de défaillance ventriculaire droite est majeur.",
    "justification": "Une valeur supérieure à 300 fait partie des critères de contre-indication. Le ventricule droit affronte une postcharge pulmonaire excessivement élevée."
  },
  "74C": {
    "is_correct": false,
    "enonce": "La normalité droite rend inutile toute surveillance invasive ; La fonction du ventricule droit doit rester normale pour opérer.",
    "justification": "La fragilité pulmonaire justifie encore une évaluation périopératoire approfondie. Elle témoigne d’une adaptation suffisante à la postcharge résiduelle."
  },
  "75E": {
    "is_correct": true,
    "enonce": "Une nécrose tubulaire aiguë structurelle ; Une hypovolémie liée aux pertes digestives.",
    "justification": "Une agression prolongée peut léser réellement le parenchyme rénal. La diarrhée réduit un volume artériel efficace déjà fragilisé par la cirrhose."
  },
  "76E": {
    "is_correct": true,
    "enonce": "Une insuffisance prérénale réversible ; Un sous-remplissage artériel initial.",
    "justification": "La récupération après restauration du volume efficace soutient ce mécanisme. La vasodilatation splanchnique et les pertes digestives l’expliquent ensemble."
  },
  "77B": {
    "is_correct": false,
    "enonce": "Une insuffisance prérénale simplement non remplie ; Un syndrome hépatorénal.",
    "justification": "La volémie a été corrigée sans récupération durable cette fois. Ce trouble fonctionnel complique la cirrhose avancée et résiste au remplissage simple."
  },
  "77D": {
    "is_correct": true,
    "enonce": "Une évaluation simultanée de la gravité hépatique ; Un syndrome hépatorénal.",
    "justification": "Le rein se détériore dans le cadre de la décompensation globale. Ce trouble fonctionnel complique la cirrhose avancée et résiste au remplissage simple."
  },
  "78A": {
    "is_correct": false,
    "enonce": "Réintroduire des AINS pour augmenter la filtration ; Administrer de l’albumine selon le contexte clinique.",
    "justification": "Ils réduisent les prostaglandines rénales et aggravent la situation. Elle aide à restaurer le compartiment artériel circulant efficace."
  },
  "78B": {
    "is_correct": false,
    "enonce": "Considérer l’ascite comme une preuve de remplissage vasculaire suffisant ; Utiliser la terlipressine pour corriger la vasodilatation.",
    "justification": "Le liquide péritonéal n’assure pas une perfusion artérielle efficace. La vasoconstriction splanchnique peut améliorer la perfusion rénale."
  },
  "79B": {
    "is_correct": false,
    "enonce": "L’arrêt définitif de toute albumine comme principe thérapeutique ; La transplantation du foie.",
    "justification": "L’albumine fait au contraire partie du soutien médical décrit. Le remplacement de l’organe malade restaure les déterminants hépatiques de la circulation."
  },
  "80A": {
    "is_correct": false,
    "enonce": "Une forme toujours réversible par albumine seule ; Une nécrose tubulaire aiguë.",
    "justification": "La lésion structurale n’a pas le même comportement qu’un trouble fonctionnel. L’ischémie prolongée peut léser directement l’épithélium tubulaire."
  },
  "80C": {
    "is_correct": false,
    "enonce": "Une forme toujours réversible par albumine seule ; Une atteinte rénale organique plutôt que purement fonctionnelle.",
    "justification": "La lésion structurale n’a pas le même comportement qu’un trouble fonctionnel. Le sédiment pathologique et le choc orientent vers une lésion parenchymateuse."
  },
  "81A": {
    "is_correct": false,
    "enonce": "Utiliser sans limite tout médicament fortement lié à l’albumine ; Écarter les anti-inflammatoires non stéroïdiens.",
    "justification": "L’hypoalbuminémie augmente la fraction libre et l’imprévisibilité pharmacologique. Leur inhibition des prostaglandines menace directement la perfusion rénale."
  },
  "81D": {
    "is_correct": false,
    "enonce": "Choisir un COX-2 en affirmant son innocuité démontrée ; Maintenir une stratégie multimodale individualisée.",
    "justification": "Cette classe n’a pas été validée comme sûre chez le cirrhotique. La combinaison raisonnée réduit les doses de chaque médicament."
  },
  "82B": {
    "is_correct": false,
    "enonce": "Une évolution exclusivement aiguë sur foie sain ; Un ictère marqué.",
    "justification": "L’hépatite alcoolique survient classiquement sur une hépatopathie chronique. La jaunisse est présentée comme constante dans l’hépatite alcoolique."
  },
  "83D": {
    "is_correct": false,
    "enonce": "L’examen neurologique n’a aucune valeur évolutive ; Une surveillance clinique répétée est requise.",
    "justification": "La gradation clinique structure précisément le suivi de la défaillance. L’encéphalopathie peut progresser rapidement vers des stades supérieurs."
  },
  "84B": {
    "is_correct": false,
    "enonce": "Le signe exclut tout risque d’œdème cérébral ; L’encéphalopathie atteint le grade 2.",
    "justification": "Une aggravation neurologique peut s’accompagner d’un œdème, surtout en aigu. L’astérixis est le critère clinique discriminant de ce grade."
  },
  "85A": {
    "is_correct": false,
    "enonce": "Une situation compatible avec une sédation non surveillée ; Une infection spontanée du liquide d’ascite.",
    "justification": "L’instabilité infectieuse et neurologique exige au contraire un monitorage rapproché. La cirrhose expose spécifiquement à cette complication bactérienne."
  },
  "85B": {
    "is_correct": false,
    "enonce": "Une cause exclusivement chirurgicale imposant une perforation digestive ; Un facteur déclenchant d’aggravation neurologique.",
    "justification": "L’infection peut survenir sans foyer perforatif dans l’ascite cirrhotique. L’infection augmente la charge métabolique et la décompensation hépatique."
  },
  "86A": {
    "is_correct": false,
    "enonce": "Programmer un bloc neuraxial sans aucune autre analyse ; Ne pas assimiler automatiquement INR élevé et absence totale de coagulation.",
    "justification": "Un hématome dans cet espace serait grave et difficilement compressible. Les protéines anticoagulantes baissent simultanément aux facteurs procoagulants."
  },
  "86E": {
    "is_correct": true,
    "enonce": "Ne pas assimiler automatiquement INR élevé et absence totale de coagulation ; Rechercher un saignement clinique et suivre l’évolution biologique.",
    "justification": "Les protéines anticoagulantes baissent simultanément aux facteurs procoagulants. La dynamique et le contexte éclairent mieux le risque réel."
  },
  "88A": {
    "is_correct": false,
    "enonce": "Aminotransférases seules pour déterminer tous les risques opératoires ; Ascite et encéphalopathie pour le score Child.",
    "justification": "La cytolyse ne résume ni la réserve ni les défaillances associées. Ces deux manifestations cliniques participent directement à sa classe."
  },
  "88B": {
    "is_correct": false,
    "enonce": "Aminotransférases seules pour déterminer tous les risques opératoires ; Albumine et bilirubine pour compléter Child.",
    "justification": "La cytolyse ne résume ni la réserve ni les défaillances associées. Synthèse et excrétion sont intégrées au calcul."
  },
  "88D": {
    "is_correct": false,
    "enonce": "Aminotransférases seules pour déterminer tous les risques opératoires ; Sodium sérique pour la version MELD-Na.",
    "justification": "La cytolyse ne résume ni la réserve ni les défaillances associées. L’hyponatrémie améliore la prédiction de mortalité."
  },
  "89A": {
    "is_correct": false,
    "enonce": "Une élévation isolée et transitoire d’ALAT ; Une cirrhose arrivée au stade terminal.",
    "justification": "La cytolyse seule ne définit pas une indication de transplantation. La décompensation répétée témoigne d’une réserve hépatique épuisée."
  },
  "90A": {
    "is_correct": false,
    "enonce": "Une absence de risque parce que l’INR prédit mal le saignement ; Un saignement provenant des collatérales portosystémiques.",
    "justification": "La mauvaise prédiction biologique n’annule pas le risque anatomique. Ces vaisseaux dilatés contournent l’obstacle portal et sont fragiles."
  },
  "91B": {
    "is_correct": false,
    "enonce": "Cette période correspond déjà à la reperfusion du greffon ; La détoxification et la synthèse hépatiques sont temporairement absentes.",
    "justification": "La circulation du nouvel organe n’a pas encore été rétablie. Les fonctions métaboliques du foie ne sont pas assurées pendant cet intervalle."
  },
  "91D": {
    "is_correct": false,
    "enonce": "Cette période correspond déjà à la reperfusion du greffon ; Les troubles métaboliques et hémostatiques doivent être anticipés.",
    "justification": "La circulation du nouvel organe n’a pas encore été rétablie. L’absence d’organe fonctionnel s’ajoute aux anomalies préexistantes."
  },
  "92D": {
    "is_correct": false,
    "enonce": "Chercher à maintenir une hypotension profonde sans limite ; Préparer un traitement rapide de l’instabilité circulatoire.",
    "justification": "La perfusion du greffon et des autres organes exige une pression suffisante. La vasodilatation préexistante favorise une chute tensionnelle sévère."
  },
  "93B": {
    "is_correct": false,
    "enonce": "L’événement prouve obligatoirement une rupture chirurgicale unique ; La vasodilatation cirrhotique réduit la réserve tensionnelle.",
    "justification": "Une cause hémodynamique liée au déclampage doit être considérée même sans hémorragie. Des résistances systémiques déjà basses amplifient la chute de pression."
  },
  "93C": {
    "is_correct": false,
    "enonce": "Il faut attendre spontanément sans monitorage rapproché ; Un soutien vasopresseur peut être nécessaire.",
    "justification": "La gravité potentielle impose diagnostic et correction immédiats. La restauration d’une pression efficace protège le greffon et les organes."
  },
  "94A": {
    "is_correct": false,
    "enonce": "Transfuser du plasma uniquement pour normaliser tout INR anormal ; Évaluer le saignement réel et son évolution.",
    "justification": "Une cible biologique isolée ne garantit pas une meilleure hémostase. La clinique guide plus directement le besoin de correction que le chiffre isolé."
  },
  "94B": {
    "is_correct": false,
    "enonce": "Transfuser du plasma uniquement pour normaliser tout INR anormal ; Se rappeler que protéines C et S sont aussi diminuées.",
    "justification": "Une cible biologique isolée ne garantit pas une meilleure hémostase. Le déficit simultané du versant anticoagulant explique l’équilibre complexe."
  },
  "95A": {
    "is_correct": false,
    "enonce": "Retirer toute surveillance dès la normalisation d’un seul INR ; Suivre INR et facteurs de coagulation dans le temps.",
    "justification": "Une valeur isolée ne suffit pas à confirmer la stabilité globale. Leur amélioration dynamique reflète la reprise de synthèse du greffon."
  },
  "95B": {
    "is_correct": false,
    "enonce": "Retirer toute surveillance dès la normalisation d’un seul INR ; Contrôler bilirubine et enzymes hépatiques.",
    "justification": "Une valeur isolée ne suffit pas à confirmer la stabilité globale. Ces marqueurs renseignent respectivement excrétion et lésion hépatocytaire."
  },
  "95D": {
    "is_correct": false,
    "enonce": "Retirer toute surveillance dès la normalisation d’un seul INR ; Rechercher une infection malgré des signes parfois discrets.",
    "justification": "Une valeur isolée ne suffit pas à confirmer la stabilité globale. Le terrain critique reste vulnérable aux complications infectieuses."
  }
});

function applyQcmBalance(series) {
  let qcmIndex = 0;
  for (const serie of series) {
    for (const question of serie.questions || []) {
      if (question.format !== "qcm") continue;
      for (const item of question.items) {
        const override = QCM_BALANCE_OVERRIDES[`${qcmIndex}${item.lettre}`];
        if (override) Object.assign(item, override);
      }
      qcmIndex += 1;
    }
  }
  return series;
}

export function buildChapter25(extract) {
  const result = {
    fiche: buildFiche(),
    flashcards: buildFlashcards(),
    series: [
      ...buildIsolatedQcm(),
      ...buildDpQcm(),
      ...buildIsolatedQroc(),
      ...buildDpQroc(),
    ],
  };
  applyQcmBalance(result.series);
  validateSourceBlocks(extract, result);
  return result;
}

export default buildChapter25;
