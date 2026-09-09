/**
 * EVC Arena — tournoi de démonstration (médecine interne) pour la recette du
 * client. Idempotent : relancer le script remet le tournoi à zéro (questions,
 * dates, participants).
 *
 * Usage : node scripts/arena-demo-seed.mjs
 *
 * Le tournoi est créé en statut « Inscriptions ouvertes » : tant que le module
 * est en mode test (src/lib/modules-flags.ts), seul le personnel connecté à
 * l'administration le voit. M1 est ouverte pendant 7 jours à partir de
 * maintenant, M2 et M3 suivent, pour laisser le temps de tester chaque écran.
 */
import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import { completeDemoRounds } from './arena-demo-bank.mjs';

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }),
);
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const SLUG = 'demo-medecine-interne';
const now = Date.now();
const D = 86_400_000;

/* ------------------------------------------------------------------ */
/* Contenu                                                              */
/* ------------------------------------------------------------------ */

// item(lettre, énoncé, exacte, justification, { indispensable, inacceptable })
const I = (lettre, enonce, ok, justification, flags = {}) => ({ lettre, enonce, is_correct: ok, indispensable: Boolean(flags.indispensable), inacceptable: Boolean(flags.inacceptable), justification });

const ROUNDS = [
  {
    number: 1,
    theme: 'Vascularites et maladies systémiques',
    opens: now,
    closes: now + 7 * D,
    intro: 'Manche consacrée aux vascularites et aux connectivites : diagnostic, marqueurs, pièges classiques des questions à choix multiples.',
    methodo: 'Face à une question de vascularite, raisonnez par calibre des vaisseaux (gros, moyen, petit) puis par marqueur (ANCA, complément, cryoglobuline). Une proposition « élimine le diagnostic » est presque toujours fausse en médecine interne : les examens ont une sensibilité imparfaite.',
    errors: 'La confusion la plus fréquente porte sur le rôle de la biopsie d’artère temporale : une biopsie normale n’élimine pas une artérite à cellules géantes. Autre confusion classique : HLA-B51 (Behçet) et HLA-B27 (spondyloarthrites).',
    refs: 'Collège des enseignants de médecine interne (CEMI), 5e édition ; recommandations PNDS artérite à cellules géantes (HAS 2017) ; critères ACR/EULAR 2019 pour le lupus.',
    questions: [
      { type: 'QRM', enonce: 'Concernant l’artérite à cellules géantes (maladie de Horton), quelles sont les propositions exactes ?', vignette: 'Femme de 74 ans, céphalées temporales récentes, hyperesthésie du cuir chevelu, VS à 85 mm.', items: [
        I('A', 'Elle touche préférentiellement les sujets de plus de 50 ans.', true, 'Le pic d’incidence se situe après 70 ans ; la maladie est exceptionnelle avant 50 ans.'),
        I('B', 'La vitesse de sédimentation est habituellement normale.', false, 'Le syndrome inflammatoire biologique est quasi constant (VS et CRP élevées).'),
        I('C', 'Une claudication intermittente de la mâchoire est très évocatrice.', true, 'Signe très spécifique, lié à l’ischémie des muscles masticateurs.'),
        I('D', 'La corticothérapie est débutée sans attendre le résultat de la biopsie.', true, 'Urgence thérapeutique : le risque est la cécité ; la biopsie reste contributive plusieurs jours après le début du traitement.'),
        I('E', 'Une biopsie d’artère temporale normale élimine le diagnostic.', false, 'L’atteinte est segmentaire et focale : une biopsie normale n’élimine pas le diagnostic.', { inacceptable: true }),
      ], explanation: 'L’artérite à cellules géantes est une vascularite des gros vaisseaux du sujet âgé. Le traitement est une urgence dès la suspicion clinique forte ; la biopsie confirme sans conditionner le début du traitement.', pieges: 'La proposition E est un piège de formulation absolue (« élimine »).', erreurs: 'Retarder la corticothérapie dans l’attente de la biopsie.', refs: 'PNDS ACG, HAS 2017.' },
      { type: 'QRU', enonce: 'Quelle est la complication la plus redoutée d’une artérite à cellules géantes non traitée ?', items: [
        I('A', 'La cécité par neuropathie optique ischémique antérieure aiguë.', true, 'Perte visuelle brutale, définitive et souvent bilatérale en l’absence de traitement.'),
        I('B', 'L’insuffisance rénale terminale.', false, 'L’atteinte rénale n’est pas caractéristique de cette vascularite.'),
        I('C', 'La pneumopathie interstitielle.', false, 'Pas d’atteinte pulmonaire spécifique.'),
        I('D', 'L’hépatite fulminante.', false, 'Une cholestase anictérique modérée est possible, pas d’hépatite fulminante.'),
        I('E', 'La thrombopénie profonde.', false, 'On observe plutôt une thrombocytose réactionnelle.'),
      ], explanation: 'La cécité est la complication ischémique majeure ; elle justifie la corticothérapie immédiate.', pieges: 'Une seule réponse attendue.', erreurs: 'Confusion avec les complications rénales des vascularites à ANCA.', refs: 'CEMI.' },
      { type: 'QRP', n: 2, enonce: 'Concernant le lupus systémique, cochez les deux propositions exactes.', items: [
        I('A', 'Les anticorps anti-ADN natif sont très spécifiques de la maladie.', true, 'Spécificité élevée, corrélés à l’activité, notamment rénale.'),
        I('B', 'La maladie prédomine chez l’homme.', false, 'Nette prédominance féminine (9 femmes pour 1 homme).'),
        I('C', 'L’hydroxychloroquine est le traitement de fond de référence.', true, 'Recommandée chez tous les patients sauf contre-indication.'),
        I('D', 'La photosensibilité ne fait pas partie des critères de classification.', false, 'Elle fait partie des manifestations cutanées retenues.'),
        I('E', 'Le complément sérique est habituellement élevé en poussée.', false, 'Il est au contraire consommé (C3, C4 abaissés) en poussée.'),
      ], explanation: 'Le lupus est une connectivite auto-immune de la femme jeune ; anti-ADN natif et anti-Sm sont spécifiques ; l’hydroxychloroquine réduit les poussées et la mortalité.', pieges: 'Le nombre de réponses est imposé : toute proposition erronée cochée annule la question avec le barème CNG.', erreurs: 'Inversion du sens de variation du complément.', refs: 'EULAR 2019, 2023.' },
      { type: 'QRM', enonce: 'Concernant la périartérite noueuse (PAN), quelles sont les propositions exactes ?', items: [
        I('A', 'Elle peut être associée à l’infection par le virus de l’hépatite B.', true, 'Association historique, devenue rare avec la vaccination.'),
        I('B', 'Les ANCA sont généralement négatifs.', true, 'La PAN n’est pas une vascularite à ANCA.'),
        I('C', 'Elle touche les artères de moyen calibre.', true, 'Vascularite nécrosante des artères musculaires de moyen calibre.'),
        I('D', 'La glomérulonéphrite est typique.', false, 'La PAN épargne les glomérules ; l’atteinte rénale est vasculaire (infarctus, HTA).'),
        I('E', 'Des micro-anévrismes peuvent être visibles à l’artériographie.', true, 'Aspect caractéristique des artères rénales, mésentériques ou hépatiques.'),
      ], explanation: 'La PAN est une vascularite nécrosante des artères de moyen calibre, sans ANCA ni glomérulonéphrite, parfois liée au VHB.', pieges: 'La proposition D oppose PAN et vascularites des petits vaisseaux.', erreurs: 'Attribuer une glomérulonéphrite à la PAN.', refs: 'Nomenclature de Chapel Hill 2012.' },
      { type: 'QRU', enonce: 'Quel auto-anticorps est le plus caractéristique de la granulomatose avec polyangéite (anciennement maladie de Wegener) ?', items: [
        I('A', 'c-ANCA de spécificité anti-PR3.', true, 'Présents dans la grande majorité des formes systémiques.'),
        I('B', 'p-ANCA de spécificité anti-MPO.', false, 'Plutôt associés à la polyangéite microscopique et à la granulomatose éosinophilique.'),
        I('C', 'Anticorps anti-membrane basale glomérulaire.', false, 'Caractéristiques du syndrome de Goodpasture.'),
        I('D', 'Anticorps anti-CCP.', false, 'Marqueur de la polyarthrite rhumatoïde.'),
        I('E', 'Anticorps anti-SSA.', false, 'Marqueur du syndrome de Sjögren et du lupus.'),
      ], explanation: 'Les c-ANCA anti-PR3 signent la granulomatose avec polyangéite ; les p-ANCA anti-MPO orientent vers la polyangéite microscopique.', pieges: 'Distinguer la cible (PR3 ou MPO) et non seulement le type de fluorescence.', erreurs: 'Confusion c-ANCA / p-ANCA.', refs: 'CEMI.' },
      { type: 'QRP', n: 2, enonce: 'Concernant la maladie de Behçet, cochez les deux propositions exactes.', items: [
        I('A', 'L’aphtose bipolaire (buccale et génitale) est le signe cardinal.', true, 'Aphtose buccale récidivante quasi constante, aphtose génitale très évocatrice.'),
        I('B', 'Le test de pathergie peut être positif.', true, 'Hyperréactivité cutanée aux traumatismes minimes (piqûre).'),
        I('C', 'Elle est associée à l’antigène HLA-B27.', false, 'L’association est avec HLA-B51.'),
        I('D', 'L’atteinte rénale glomérulaire est fréquente.', false, 'Rare ; les atteintes majeures sont oculaires, vasculaires et neurologiques.'),
        I('E', 'Elle touche surtout la femme âgée.', false, 'Adulte jeune, souvent originaire du pourtour méditerranéen ou d’Asie.'),
      ], explanation: 'Le Behçet est une vascularite des vaisseaux de tout calibre de l’adulte jeune ; aphtose, uvéite, thromboses et HLA-B51 sont les repères.', pieges: 'HLA-B51 et non B27.', erreurs: 'Confusion avec les spondyloarthrites.', refs: 'Critères ICBD 2014.' },
      { type: 'QRM', enonce: 'Concernant la sarcoïdose, quelles sont les propositions exactes ?', items: [
        I('A', 'Des adénopathies hilaires bilatérales sont la présentation thoracique la plus fréquente.', true, 'Stade I radiologique.'),
        I('B', 'Le granulome épithélioïde est sans nécrose caséeuse.', true, 'Différence histologique majeure avec la tuberculose.'),
        I('C', 'Une hypercalcémie est possible.', true, 'Par production extra-rénale de calcitriol par les macrophages.'),
        I('D', 'L’enzyme de conversion de l’angiotensine élevée est spécifique du diagnostic.', false, 'Marqueur d’activité, ni sensible ni spécifique.'),
        I('E', 'Le syndrome de Löfgren est de bon pronostic.', true, 'Érythème noueux, arthralgies de chevilles, adénopathies hilaires : résolution spontanée fréquente.'),
      ], explanation: 'La sarcoïdose est une granulomatose systémique ; le diagnostic repose sur la preuve histologique et l’exclusion des autres granulomatoses.', pieges: 'L’ECA n’est jamais un critère diagnostique.', erreurs: 'Attribuer une valeur diagnostique à l’ECA.', refs: 'CEMI ; ERS/ATS 2020.' },
      { type: 'QRU', enonce: 'Quel auto-anticorps est associé à la forme cutanée diffuse de la sclérodermie systémique ?', items: [
        I('A', 'Anti-topoisomérase I (anti-Scl70).', true, 'Associés à la forme diffuse et à la pneumopathie interstitielle.'),
        I('B', 'Anti-centromère.', false, 'Associés à la forme cutanée limitée et à l’hypertension artérielle pulmonaire.'),
        I('C', 'Anti-Jo1.', false, 'Syndrome des antisynthétases.'),
        I('D', 'Anti-Sm.', false, 'Lupus systémique.'),
        I('E', 'Anti-RNP.', false, 'Connectivite mixte.'),
      ], explanation: 'Anti-Scl70 : forme diffuse, atteinte pulmonaire interstitielle ; anti-centromère : forme limitée, HTAP.', pieges: 'Ne pas inverser Scl70 et centromère.', erreurs: 'Inversion des deux marqueurs.', refs: 'CEMI.' },
      { type: 'QRP', n: 3, enonce: 'Concernant le syndrome de Gougerot-Sjögren, cochez les trois propositions exactes.', items: [
        I('A', 'La xérostomie est un signe majeur.', true, 'Sécheresse buccale par atteinte des glandes salivaires.'),
        I('B', 'La xérophtalmie est un signe majeur.', true, 'Sécheresse oculaire objectivée par le test de Schirmer.'),
        I('C', 'Les anticorps anti-SSA sont fréquemment présents.', true, 'Anti-SSA (Ro) dans deux tiers des cas, critère de classification.'),
        I('D', 'Il est associé à l’antigène HLA-B27.', false, 'Pas d’association avec HLA-B27.'),
        I('E', 'L’hypocomplémentémie est systématique.', false, 'Inconstante ; elle est un facteur de risque de lymphome quand elle est présente.'),
      ], explanation: 'Syndrome sec (bouche, yeux), anti-SSA, biopsie des glandes salivaires accessoires ; surveillance du risque de lymphome.', pieges: 'Trois réponses attendues, aucune erreur tolérée.', erreurs: 'Association erronée avec HLA-B27.', refs: 'Critères ACR/EULAR 2016.' },
      { type: 'QRM', enonce: 'Concernant la vascularite à IgA (purpura rhumatoïde) de l’adulte, quelles sont les propositions exactes ?', items: [
        I('A', 'Le purpura est vasculaire, infiltré, déclive.', true, 'Purpura pétéchial des membres inférieurs, prédominant aux zones de pression.'),
        I('B', 'Des arthralgies sont fréquentes.', true, 'Chevilles et genoux surtout.'),
        I('C', 'Des douleurs abdominales sont possibles.', true, 'Vascularite digestive, risque d’invagination chez l’enfant.'),
        I('D', 'Une thrombopénie profonde est attendue.', false, 'Les plaquettes sont normales : c’est un purpura vasculaire et non thrombopénique.', { inacceptable: true }),
        I('E', 'L’atteinte rénale doit être recherchée et surveillée.', true, 'Bandelette urinaire et créatinine répétées : l’atteinte rénale conditionne le pronostic.', { indispensable: true }),
      ], explanation: 'Vascularite des petits vaisseaux à dépôts d’IgA : purpura, arthralgies, douleurs abdominales, néphropathie à surveiller.', pieges: 'Une proposition inacceptable (D) et une indispensable (E) : la question vaut 0 si l’une des deux règles est déclenchée.', erreurs: 'Confusion avec le purpura thrombopénique.', refs: 'CEMI.' },
      { type: 'QRU', enonce: 'Quel marqueur biologique est le plus évocateur d’une maladie de Still de l’adulte ?', items: [
        I('A', 'Hyperferritinémie majeure avec fraction glycosylée effondrée.', true, 'Ferritine souvent supérieure à cinq fois la normale, ferritine glycosylée inférieure à 20 %.'),
        I('B', 'ANCA positifs.', false, 'Absents.'),
        I('C', 'Anticorps anti-CCP.', false, 'Absents ; la maladie de Still est séronégative.'),
        I('D', 'Hypocomplémentémie.', false, 'Le complément est normal ou élevé (protéine de l’inflammation).'),
        I('E', 'Cryoglobulinémie.', false, 'Sans rapport.'),
      ], explanation: 'Fièvre hectique, éruption saumonée, arthrites, hyperleucocytose à polynucléaires et hyperferritinémie glycosylée basse.', pieges: 'La ferritine seule n’est pas spécifique ; c’est la fraction glycosylée qui l’est.', erreurs: 'Oublier la fraction glycosylée.', refs: 'Critères de Yamaguchi.' },
      { type: 'QRP', n: 2, weight: 2, enonce: 'Concernant le syndrome des antiphospholipides, cochez les deux propositions exactes. (Question à coefficient 2.)', items: [
        I('A', 'Il associe des thromboses veineuses ou artérielles.', true, 'Thromboses inexpliquées, parfois de siège inhabituel.'),
        I('B', 'Le diagnostic biologique exige la persistance des anticorps à douze semaines d’intervalle.', true, 'Anticoagulant lupique, anticardiolipine ou anti-β2GP1 confirmés à 12 semaines.'),
        I('C', 'Une thrombocytose est caractéristique.', false, 'On observe plutôt une thrombopénie modérée.'),
        I('D', 'L’anticoagulation est limitée à trois mois.', false, 'Anticoagulation prolongée, souvent à vie, par antivitamine K.'),
        I('E', 'Les pertes fœtales répétées ne font pas partie des critères.', false, 'La morbidité obstétricale fait partie des critères cliniques.'),
      ], explanation: 'Critères de Sydney : au moins un critère clinique (thrombose ou morbidité obstétricale) et un critère biologique persistant.', pieges: 'Coefficient 2 : la question compte double dans le score de la manche.', erreurs: 'Durée d’anticoagulation sous-estimée ; AOD non recommandés dans les formes artérielles ou triple positives.', refs: 'EULAR 2019.' },
    ],
  },
  {
    number: 2,
    theme: 'Syndromes inflammatoires, auto-immunité et infections',
    opens: now + 8 * D,
    closes: now + 9 * D,
    intro: 'Raisonnement devant un syndrome inflammatoire, marqueurs d’auto-immunité, grandes infections de médecine interne.',
    methodo: 'Devant un syndrome inflammatoire, hiérarchisez : interrogatoire et examen, biologie simple (NFS, EPP, bilan hépatique), puis imagerie orientée. Le TEP-scanner n’est jamais un examen de première intention.',
    errors: 'Erreur la plus fréquente : considérer qu’une CRP normale élimine une inflammation, ou qu’une VS élevée isolée impose une inflammation (pensez au pic monoclonal, à l’âge, à l’anémie).',
    refs: 'CEMI ; recommandations SPILF endocardite 2023 ; ACR/EULAR PR 2010.',
    questions: [
      { type: 'QRM', enonce: 'Concernant les marqueurs de l’inflammation, quelles sont les propositions exactes ?', items: [
        I('A', 'La CRP s’élève en 6 à 12 heures après le début de l’inflammation.', true, 'Cinétique rapide, demi-vie courte : bon marqueur de suivi.'),
        I('B', 'La VS augmente physiologiquement avec l’âge et en cas d’anémie.', true, 'Facteurs non inflammatoires d’élévation de la VS.'),
        I('C', 'Une CRP normale élimine toute inflammation.', false, 'Certaines maladies (lupus actif sans infection) peuvent avoir une CRP peu élevée.'),
        I('D', 'Une VS élevée isolée peut révéler un pic monoclonal.', true, 'L’hypergammaglobulinémie monoclonale accélère la sédimentation sans inflammation.'),
        I('E', 'Le fibrinogène est une protéine de l’inflammation.', true, 'Protéine de la phase aiguë, responsable de l’élévation de la VS.'),
      ], explanation: 'VS et CRP n’ont ni la même cinétique ni les mêmes facteurs confondants.', pieges: 'Formulation absolue en C.', erreurs: 'Confusion VS/CRP.', refs: 'CEMI.' },
      { type: 'QRU', enonce: 'Homme de 68 ans, syndrome inflammatoire biologique isolé découvert sur un bilan systématique, examen clinique normal. Quel est l’examen de première intention parmi les suivants ?', items: [
        I('A', 'Électrophorèse des protéines sériques.', true, 'Examen simple, peu coûteux, qui oriente vers une gammapathie ou une hypergammaglobulinémie.'),
        I('B', 'TEP-scanner au 18-FDG.', false, 'Examen de deuxième ou troisième intention.'),
        I('C', 'Biopsie ostéo-médullaire.', false, 'Invasive, non indiquée à ce stade.'),
        I('D', 'Scintigraphie osseuse.', false, 'Non orientée.'),
        I('E', 'Coloscopie totale.', false, 'Indiquée sur point d’appel ou selon le dépistage, pas en première intention ici.'),
      ], explanation: 'Bilan de première intention : NFS, EPP, bilan hépatique et rénal, bandelette urinaire, radiographie thoracique.', pieges: 'La « meilleure » réponse, pas la plus performante.', erreurs: 'Recours d’emblée au TEP.', refs: 'CEMI.' },
      { type: 'QRP', n: 2, enonce: 'Concernant la définition classique de la fièvre prolongée inexpliquée, cochez les deux propositions exactes.', items: [
        I('A', 'Fièvre évoluant depuis plus de trois semaines.', true, 'Critère de durée.'),
        I('B', 'Température supérieure à 38,3 °C constatée à plusieurs reprises.', true, 'Critère de niveau et de répétition.'),
        I('C', 'Fièvre évoluant depuis au moins une semaine.', false, 'Durée insuffisante.'),
        I('D', 'Elle est par définition d’origine infectieuse.', false, 'Infections, néoplasies, maladies inflammatoires et causes diverses.'),
        I('E', 'Elle impose toujours une hospitalisation.', false, 'Le bilan est souvent ambulatoire.'),
      ], explanation: 'Définition de Petersdorf adaptée : plus de trois semaines, plus de 38,3 °C à plusieurs reprises, bilan de première ligne négatif.', pieges: 'Deux réponses exactement.', erreurs: 'Durée d’une semaine.', refs: 'CEMI.' },
      { type: 'QRM', enonce: 'Concernant l’anémie inflammatoire, quelles sont les propositions exactes ?', items: [
        I('A', 'Elle est normocytaire ou microcytaire.', true, 'Microcytose modérée possible dans les formes prolongées.'),
        I('B', 'La ferritine est normale ou élevée.', true, 'Ferritine = protéine de l’inflammation ; les stocks sont conservés mais séquestrés.'),
        I('C', 'Le fer sérique est abaissé.', true, 'Séquestration du fer par l’hepcidine.'),
        I('D', 'Les réticulocytes sont élevés.', false, 'Anémie arégénérative.'),
        I('E', 'Le coefficient de saturation de la transferrine est abaissé.', true, 'Fer sérique bas et transferrine basse ou normale.'),
      ], explanation: 'Anémie arégénérative par séquestration du fer, ferritine conservée : la différence avec la carence martiale se fait sur la ferritine et le récepteur soluble de la transferrine.', pieges: 'Ferritine élevée n’exclut pas une carence associée.', erreurs: 'Réticulocytes élevés.', refs: 'CEMI.' },
      { type: 'QRU', enonce: 'Quels anticorps sont les plus spécifiques de la polyarthrite rhumatoïde ?', items: [
        I('A', 'Les anticorps anti-peptides citrullinés (anti-CCP).', true, 'Spécificité supérieure à 95 %, présents précocement.'),
        I('B', 'Le facteur rhumatoïde.', false, 'Sensible mais peu spécifique (Sjögren, infections, sujets âgés).'),
        I('C', 'Les anticorps antinucléaires.', false, 'Marqueur des connectivites.'),
        I('D', 'Les anticorps anti-SSA.', false, 'Sjögren, lupus.'),
        I('E', 'Les ANCA.', false, 'Vascularites.'),
      ], explanation: 'Anti-CCP : spécifiques, prédictifs d’érosions ; FR : sensible.', pieges: 'Spécificité versus sensibilité.', erreurs: 'Choisir le facteur rhumatoïde.', refs: 'ACR/EULAR 2010.' },
      { type: 'QRP', n: 2, enonce: 'Concernant les spondyloarthrites, cochez les deux propositions exactes.', items: [
        I('A', 'L’antigène HLA-B27 est fréquemment associé.', true, 'Présent chez 80 à 90 % des spondylarthrites ankylosantes.'),
        I('B', 'Les lombalgies sont de rythme inflammatoire.', true, 'Réveils nocturnes, dérouillage matinal prolongé, amélioration à l’effort.'),
        I('C', 'Elles touchent surtout la femme âgée.', false, 'Adulte jeune, prédominance masculine pour la forme axiale.'),
        I('D', 'Le facteur rhumatoïde est habituellement positif.', false, 'Rhumatisme séronégatif.'),
        I('E', 'L’atteinte est symétrique des petites articulations des mains.', false, 'Atteinte axiale et enthésitique ; oligoarthrite asymétrique des membres inférieurs.'),
      ], explanation: 'Spondyloarthrites : rachialgies inflammatoires, sacro-iliite, enthésites, uvéite, HLA-B27.', pieges: 'Distinguer de la polyarthrite rhumatoïde.', erreurs: 'Facteur rhumatoïde positif.', refs: 'ASAS.' },
      { type: 'QRM', enonce: 'Concernant les myopathies inflammatoires, quelles sont les propositions exactes ?', items: [
        I('A', 'Le déficit moteur est proximal et symétrique.', true, 'Ceintures scapulaire et pelvienne.'),
        I('B', 'Les CPK sont habituellement élevées.', true, 'Marqueur de nécrose musculaire.'),
        I('C', 'Les anticorps anti-Jo1 définissent le syndrome des antisynthétases.', true, 'Myosite, pneumopathie interstitielle, mains de mécanicien, arthrites, Raynaud.'),
        I('D', 'La dermatomyosite de l’adulte peut révéler un cancer.', true, 'Recherche systématique d’une néoplasie, surtout avec anti-TIF1γ.'),
        I('E', 'La biopsie musculaire est inutile au diagnostic.', false, 'Elle reste l’examen de référence en l’absence d’anticorps spécifiques.', { inacceptable: true }),
      ], explanation: 'Myosites : déficit proximal, CPK, EMG, IRM et biopsie ; anticorps spécifiques de myosite.', pieges: 'E est inacceptable : la cocher annule la question.', erreurs: 'Négliger la recherche de cancer.', refs: 'CEMI.' },
      { type: 'QRU', enonce: 'Quelle est la posologie initiale habituelle de prednisone dans une pseudo-polyarthrite rhizomélique isolée ?', items: [
        I('A', '15 à 20 mg par jour.', true, 'Réponse spectaculaire en 48 à 72 heures, argument diagnostique.'),
        I('B', '1 mg/kg par jour.', false, 'Posologie de l’artérite à cellules géantes avec signes ischémiques, pas de la PPR isolée.'),
        I('C', 'Bolus intraveineux de méthylprednisolone.', false, 'Réservé aux formes ischémiques graves d’ACG.'),
        I('D', '5 mg par jour.', false, 'Insuffisant.'),
        I('E', 'AINS seuls.', false, 'Inefficaces sur la PPR.'),
      ], explanation: 'PPR : corticothérapie à faible dose ; ACG : forte dose. L’absence de réponse à 15-20 mg fait reconsidérer le diagnostic.', pieges: 'Ne pas confondre PPR et ACG.', erreurs: 'Surdosage initial.', refs: 'EULAR/ACR 2015.' },
      { type: 'QRP', n: 3, enonce: 'Concernant l’endocardite infectieuse, cochez les trois propositions exactes.', items: [
        I('A', 'Les hémocultures doivent être répétées avant toute antibiothérapie.', true, 'Au moins trois paires espacées.'),
        I('B', 'L’échocardiographie est indispensable au diagnostic.', true, 'Transthoracique puis transœsophagienne.'),
        I('C', 'Les streptocoques oraux et les staphylocoques sont les germes principaux.', true, 'Staphylococcus aureus en tête dans les pays industrialisés.'),
        I('D', 'Une antibioprophylaxie est recommandée avant tout soin dentaire chez tout patient.', false, 'Réservée aux patients à haut risque (prothèse valvulaire, antécédent d’endocardite, cardiopathie cyanogène).'),
        I('E', 'La fièvre est rare.', false, 'Elle est présente dans la grande majorité des cas.'),
      ], explanation: 'Critères de Duke modifiés : hémocultures et échocardiographie ; prophylaxie ciblée.', pieges: 'Trois réponses exactement.', erreurs: 'Prophylaxie universelle.', refs: 'ESC 2023, SPILF.' },
      { type: 'QRM', enonce: 'Concernant l’amylose AA, quelles sont les propositions exactes ?', items: [
        I('A', 'Elle complique les maladies inflammatoires chroniques mal contrôlées.', true, 'Polyarthrite rhumatoïde, maladies auto-inflammatoires, infections chroniques.'),
        I('B', 'L’atteinte rénale se manifeste par une protéinurie.', true, 'Syndrome néphrotique possible.'),
        I('C', 'La biopsie de graisse sous-cutanée avec coloration au rouge Congo permet le diagnostic.', true, 'Biréfringence vert-jaune en lumière polarisée.'),
        I('D', 'Elle est constituée de chaînes légères d’immunoglobulines.', false, 'Ce sont les amyloses AL ; l’AA est constituée de protéine SAA.'),
        I('E', 'Le traitement repose sur le contrôle de la maladie inflammatoire sous-jacente.', true, 'Réduire durablement la production de SAA.'),
      ], explanation: 'Amylose AA = dépôts de SAA ; amylose AL = chaînes légères ; le typage est indispensable.', pieges: 'AA versus AL.', erreurs: 'Confusion des types d’amylose.', refs: 'CEMI.' },
      { type: 'QRU', enonce: 'Devant une cryoglobulinémie mixte, quelle infection doit être recherchée en priorité ?', items: [
        I('A', 'L’hépatite C.', true, 'Cause majeure des cryoglobulinémies mixtes ; le traitement antiviral guérit souvent la vascularite.'),
        I('B', 'L’hépatite A.', false, 'Sans rapport.'),
        I('C', 'La grippe.', false, 'Sans rapport.'),
        I('D', 'L’infection à cytomégalovirus.', false, 'Sans rapport durable.'),
        I('E', 'L’infection à papillomavirus.', false, 'Sans rapport.'),
      ], explanation: 'Cryoglobulinémie mixte : purpura, arthralgies, neuropathie, glomérulonéphrite ; VHC en premier lieu, sinon connectivites et hémopathies.', pieges: 'VHC et non VHB.', erreurs: 'Recherche du VHB uniquement.', refs: 'CEMI.' },
      { type: 'QRP', n: 2, weight: 2, enonce: 'Concernant la maladie de Crohn, cochez les deux propositions exactes. (Question à coefficient 2.)', items: [
        I('A', 'L’atteinte est transmurale.', true, 'À la différence de la rectocolite hémorragique, limitée à la muqueuse.'),
        I('B', 'Des granulomes épithélioïdes peuvent être observés.', true, 'Inconstants mais très évocateurs.'),
        I('C', 'Le rectum est toujours atteint.', false, 'C’est le cas de la RCH ; le Crohn peut épargner le rectum.'),
        I('D', 'Le tabac est protecteur.', false, 'Il aggrave le Crohn ; il est protecteur dans la RCH.'),
        I('E', 'Les p-ANCA sont typiquement positifs.', false, 'Plutôt associés à la RCH ; les ASCA orientent vers le Crohn.'),
      ], explanation: 'Crohn : atteinte segmentaire transmurale de tout le tube digestif, fistules, sténoses, granulomes ; tabac aggravant.', pieges: 'Coefficient 2.', erreurs: 'Confusion Crohn / RCH.', refs: 'ECCO.' },
    ],
  },
  {
    number: 3,
    theme: 'Hémopathies, anémies et médecine interne polyvalente',
    opens: now + 10 * D,
    closes: now + 11 * D,
    intro: 'Anémies, gammapathies, cytopénies, et quelques situations de polyvalence (métabolisme, ionogramme).',
    methodo: 'Devant une anémie : VGM et réticulocytes d’abord. Devant une hypercalcémie : PTH d’abord. Devant une hyponatrémie : osmolalité plasmatique et volémie d’abord. Le bon réflexe est presque toujours un examen simple avant un examen sophistiqué.',
    errors: 'Confusion fréquente entre anémie ferriprive et anémie inflammatoire (la ferritine tranche), et entre PTH élevée (hyperparathyroïdie) et PTH basse (cancers, granulomatoses).',
    refs: 'Collège d’hématologie ; CEMI ; recommandations SFD diabète de type 2 ; SFE hypercalcémie.',
    questions: [
      { type: 'QRM', enonce: 'Concernant l’anémie ferriprive, quelles sont les propositions exactes ?', items: [
        I('A', 'Elle est microcytaire et hypochrome.', true, 'VGM bas, TCMH basse.'),
        I('B', 'La ferritine est abaissée.', true, 'Meilleur marqueur de la carence en l’absence d’inflammation.'),
        I('C', 'Une thrombocytose réactionnelle est possible.', true, 'Fréquente, régressive après correction.'),
        I('D', 'Les réticulocytes sont élevés.', false, 'Anémie arégénérative.'),
        I('E', 'Après 50 ans, une cause digestive doit être recherchée.', true, 'Exploration digestive haute et basse : le cancer colorectal est la hantise.', { indispensable: true }),
      ], explanation: 'Carence martiale : microcytose, ferritine basse ; chez l’adulte, chercher un saignement (digestif, gynécologique).', pieges: 'E est indispensable : ne pas la cocher annule la question.', erreurs: 'Supplémenter sans chercher la cause.', refs: 'Collège d’hématologie.' },
      { type: 'QRU', enonce: 'Quelle manifestation neurologique est caractéristique de la carence en vitamine B12 ?', items: [
        I('A', 'La sclérose combinée de la moelle.', true, 'Syndrome cordonal postérieur et pyramidal, parfois avant l’anémie.'),
        I('B', 'L’hémianopsie latérale homonyme.', false, 'Atteinte des voies visuelles rétrochiasmatiques, sans rapport.'),
        I('C', 'La myasthénie.', false, 'Maladie de la jonction neuromusculaire.'),
        I('D', 'Le syndrome parkinsonien.', false, 'Sans rapport.'),
        I('E', 'L’aphasie de Broca.', false, 'Sans rapport.'),
      ], explanation: 'La carence en B12 associe anémie macrocytaire mégaloblastique et atteinte neurologique cordonale et pyramidale, parfois isolée.', pieges: 'Une seule réponse.', erreurs: 'Attendre l’anémie pour évoquer la carence.', refs: 'Collège d’hématologie.' },
      { type: 'QRP', n: 2, enonce: 'Concernant l’anémie hémolytique auto-immune à anticorps chauds, cochez les deux propositions exactes.', items: [
        I('A', 'Le test de Coombs direct est positif.', true, 'IgG avec ou sans complément.'),
        I('B', 'L’haptoglobine est effondrée.', true, 'Marqueur d’hémolyse.'),
        I('C', 'Les réticulocytes sont bas.', false, 'Anémie régénérative (sauf crise érythroblastopénique).'),
        I('D', 'La ferritine est basse.', false, 'Elle est normale ou élevée.'),
        I('E', 'Les LDH sont normales.', false, 'Élevées dans l’hémolyse.'),
      ], explanation: 'Hémolyse : anémie régénérative, bilirubine libre, LDH élevées, haptoglobine effondrée ; le Coombs signe l’origine immunologique.', pieges: 'Deux réponses.', erreurs: 'Réticulocytes bas.', refs: 'Collège d’hématologie.' },
      { type: 'QRM', enonce: 'Concernant le myélome multiple, quelles sont les propositions exactes ?', items: [
        I('A', 'Un pic monoclonal est retrouvé à l’électrophorèse dans la majorité des cas.', true, 'IgG le plus souvent, parfois chaînes légères seules.'),
        I('B', 'Une hypercalcémie peut révéler la maladie.', true, 'Ostéolyse, un des critères CRAB.'),
        I('C', 'Des lésions osseuses lytiques sont caractéristiques.', true, 'Lacunes à l’emporte-pièce, sans condensation périphérique.'),
        I('D', 'La VS est souvent très élevée.', true, 'Hypergammaglobulinémie monoclonale.'),
        I('E', 'La protéinurie de Bence Jones est une albuminurie.', false, 'Il s’agit de chaînes légères libres ; la bandelette urinaire ne la détecte pas.'),
      ], explanation: 'Critères CRAB : hypercalcémie, insuffisance rénale, anémie, atteinte osseuse ; myélogramme et dosage des chaînes légères libres.', pieges: 'Bandelette négative n’exclut pas une protéinurie de Bence Jones.', erreurs: 'Se fier à la bandelette.', refs: 'IMWG.' },
      { type: 'QRU', enonce: 'Quelle proposition définit une gammapathie monoclonale de signification indéterminée (MGUS) ?', items: [
        I('A', 'Composant monoclonal inférieur à 30 g/L, plasmocytose médullaire inférieure à 10 %, absence d’atteinte d’organe.', true, 'Définition IMWG ; surveillance au long cours.'),
        I('B', 'Plasmocytose médullaire supérieure à 10 % isolée.', false, 'Définit au moins un myélome indolent.'),
        I('C', 'Hypercalcémie avec pic monoclonal.', false, 'Atteinte d’organe : myélome symptomatique.'),
        I('D', 'Lésions osseuses lytiques avec pic monoclonal.', false, 'Myélome symptomatique.'),
        I('E', 'Insuffisance rénale avec chaînes légères urinaires.', false, 'Myélome symptomatique.'),
      ], explanation: 'MGUS : pic faible, plasmocytose faible, pas de critère CRAB ; risque de transformation d’environ 1 % par an.', pieges: 'Trois conditions cumulées.', erreurs: 'Négliger la surveillance.', refs: 'IMWG.' },
      { type: 'QRP', n: 2, enonce: 'Concernant la leucémie lymphoïde chronique, cochez les deux propositions exactes.', items: [
        I('A', 'Elle est définie par une lymphocytose sanguine persistante supérieure à 5 G/L.', true, 'Lymphocytes B monoclonaux.'),
        I('B', 'L’immunophénotypage montre des lymphocytes B CD5+, CD19+, CD23+.', true, 'Score de Matutes élevé.'),
        I('C', 'Des blastes circulants sont caractéristiques.', false, 'Ce sont des lymphocytes matures.'),
        I('D', 'Elle touche surtout le sujet jeune.', false, 'Sujet âgé, âge médian autour de 70 ans.'),
        I('E', 'Elle constitue une urgence thérapeutique.', false, 'Abstention et surveillance dans les stades précoces.'),
      ], explanation: 'LLC : lymphocytose monoclonale B du sujet âgé, diagnostic par immunophénotypage sanguin, traitement selon le stade.', pieges: 'Pas de myélogramme nécessaire au diagnostic.', erreurs: 'Traiter un stade A asymptomatique.', refs: 'Collège d’hématologie.' },
      { type: 'QRM', enonce: 'Concernant la thrombopénie immunologique (PTI) de l’adulte, quelles sont les propositions exactes ?', items: [
        I('A', 'C’est un diagnostic d’exclusion.', true, 'Éliminer les autres causes de thrombopénie (médicaments, infections, hémopathies).'),
        I('B', 'Le myélogramme n’est pas systématique chez le sujet jeune sans anomalie associée.', true, 'Indiqué après 60 ans ou en cas d’anomalie d’une autre lignée.'),
        I('C', 'Les corticoïdes sont le traitement de première ligne des formes symptomatiques.', true, 'Prednisone ou dexaméthasone ; immunoglobulines IV si hémorragie.'),
        I('D', 'Une splénomégalie est typique.', false, 'Sa présence doit faire rechercher un autre diagnostic.', { inacceptable: true }),
        I('E', 'La transfusion de plaquettes est systématique.', false, 'Inefficace (destruction immédiate), réservée aux hémorragies graves.'),
      ], explanation: 'PTI : thrombopénie isolée périphérique, frottis normal, traitement selon le chiffre et les saignements.', pieges: 'D est inacceptable.', erreurs: 'Transfuser des plaquettes sans hémorragie.', refs: 'PNDS PTI.' },
      { type: 'QRU', enonce: 'Patient sans voyage récent, hyperéosinophilie modérée découverte fortuitement. Quelle cause rechercher en priorité ?', items: [
        I('A', 'Une prise médicamenteuse.', true, 'Cause la plus fréquente avec l’atopie en France métropolitaine.'),
        I('B', 'Un paludisme.', false, 'Pas de voyage ; et le paludisme ne donne pas d’hyperéosinophilie.'),
        I('C', 'Une trypanosomiase.', false, 'Sans exposition.'),
        I('D', 'Une tuberculose.', false, 'Rarement responsable.'),
        I('E', 'Une sarcoïdose.', false, 'Possible mais rare.'),
      ], explanation: 'Hyperéosinophilie : médicaments, atopie, parasitoses (selon exposition), puis causes rares.', pieges: 'Le contexte (pas de voyage) élimine les causes tropicales.', erreurs: 'Recherche parasitaire exotique sans exposition.', refs: 'CEMI.' },
      { type: 'QRP', n: 3, enonce: 'Concernant la polyglobulie de Vaquez, cochez les trois propositions exactes.', items: [
        I('A', 'La mutation JAK2 V617F est présente dans plus de 95 % des cas.', true, 'Critère majeur du diagnostic.'),
        I('B', 'L’érythropoïétine sérique est basse.', true, 'Polyglobulie primitive autonome.'),
        I('C', 'Le risque thrombotique est augmenté.', true, 'Justifie saignées, aspirine et cytoréduction selon le risque.'),
        I('D', 'L’érythropoïétine sérique est élevée.', false, 'Signe une polyglobulie secondaire.'),
        I('E', 'Les plaquettes sont typiquement basses.', false, 'Thrombocytose fréquente.'),
      ], explanation: 'Vaquez : hématocrite élevé, JAK2 muté, EPO basse ; risque thrombotique majeur.', pieges: 'Trois réponses.', erreurs: 'Confusion EPO basse / élevée.', refs: 'OMS 2022.' },
      { type: 'QRM', enonce: 'Concernant la prise en charge du diabète de type 2, quelles sont les propositions exactes ?', items: [
        I('A', 'L’objectif d’HbA1c est en général inférieur à 7 %.', true, 'Individualisé selon l’âge et les comorbidités.'),
        I('B', 'La metformine est le traitement de première intention en l’absence de contre-indication.', true, 'Sauf insuffisance rénale sévère.'),
        I('C', 'Le dépistage de la rétinopathie est annuel.', true, 'Fond d’œil ou rétinographie.'),
        I('D', 'Une statine est indiquée selon le niveau de risque cardiovasculaire.', true, 'Très fréquent chez le diabétique de type 2.'),
        I('E', 'L’insuline est obligatoire dès le diagnostic.', false, 'Réservée aux échecs ou aux situations particulières.'),
      ], explanation: 'Objectifs individualisés, metformine, iSGLT2 ou aGLP1 selon le profil cardiovasculaire et rénal, dépistage des complications.', pieges: 'Objectifs individualisés.', erreurs: 'Insulinothérapie d’emblée.', refs: 'SFD 2023.' },
      { type: 'QRU', enonce: 'Hyponatrémie à 122 mmol/L, osmolalité plasmatique basse, patient euvolémique, osmolalité urinaire à 450 mOsm/kg, natriurèse à 60 mmol/L. Quel diagnostic évoquer ?', items: [
        I('A', 'Un syndrome de sécrétion inappropriée d’hormone antidiurétique.', true, 'Hyponatrémie hypo-osmolaire euvolémique avec urines inappropriément concentrées.'),
        I('B', 'Une déshydratation extracellulaire.', false, 'Le patient est euvolémique.'),
        I('C', 'Une insuffisance cardiaque.', false, 'Hyperhydratation extracellulaire attendue.'),
        I('D', 'Une cirrhose décompensée.', false, 'Idem, œdèmes et ascite.'),
        I('E', 'Une potomanie.', false, 'Urines diluées attendues.'),
      ], explanation: 'SIADH : hyponatrémie hypo-osmolaire, euvolémie, osmolalité urinaire supérieure à 100 mOsm/kg, natriurèse conservée, après exclusion d’une hypothyroïdie et d’une insuffisance surrénale.', pieges: 'Analyser la volémie avant tout.', erreurs: 'Perfuser du sérum salé isotonique dans un SIADH.', refs: 'Recommandations européennes 2014.' },
      { type: 'QRP', n: 2, weight: 2, enonce: 'Concernant l’hypercalcémie, cochez les deux propositions exactes. (Question à coefficient 2.)', items: [
        I('A', 'L’hyperparathyroïdie primaire et les cancers en sont les deux causes principales.', true, 'Plus de 90 % des cas.'),
        I('B', 'Un raccourcissement de l’espace QT est possible à l’ECG.', true, 'Signe électrique de l’hypercalcémie.'),
        I('C', 'Une PTH élevée oriente vers une cause néoplasique.', false, 'Une PTH élevée ou normale haute oriente vers l’hyperparathyroïdie ; elle est freinée dans les cancers.'),
        I('D', 'La réhydratation est inutile.', false, 'Premier geste thérapeutique.'),
        I('E', 'Les bisphosphonates ne sont jamais indiqués.', false, 'Traitement de référence des hypercalcémies néoplasiques.'),
      ], explanation: 'PTH : premier examen ; réhydratation puis bisphosphonates ; traitement de la cause.', pieges: 'Coefficient 2.', erreurs: 'Inversion du raisonnement sur la PTH.', refs: 'SFE.' },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Insertion                                                            */
/* ------------------------------------------------------------------ */

// Prepare and validate the full 20-question content before any database mutation.
await completeDemoRounds(db, ROUNDS);
if (process.argv.includes('--check')) {
  console.log(ROUNDS.map(r => ({ manche:r.number, questions:r.questions.length, importees:r.questions.filter(q=>q.source_question_id).length })));
  process.exit(0);
}
const existing = await db.from('arena_tournaments').select('id').eq('slug', SLUG).maybeSingle();
if (existing.data) {
  await db.from('arena_tournaments').delete().eq('id', existing.data.id);
  console.log('Ancien tournoi de démo supprimé.');
}

const { data: t, error: tErr } = await db.from('arena_tournaments').insert({
  slug: SLUG,
  title: 'EVC Arena Médecine interne — Démo',
  edition_label: 'Édition démo',
  specialty: 'Médecine interne polyvalente',
  specialty_id: 'col-medecine-interne',
  status: 'registration_open',
  indexable: false,
  meta_title: 'EVC Arena Médecine interne — tournoi de QCM Major ECN',
  meta_description: 'Trois manches de 20 questions, 60 secondes par question, une seule tentative, classement cumulé entre médecins candidats aux EVC. Entraînement ludique, gratuit.',
  questions_per_round: 20, round_duration_minutes: 20, min_rounds_final: 3, afficher_effectif_general: false,
  intro_text: 'Tournoi de démonstration : trois manches de médecine interne pour vérifier chaque écran du dispositif avant la première édition. Les questions sont des questions d’entraînement.',
  bareme: { QRM: { mode: 'cng' }, QRU: { mode: 'cng' }, QRP: { mode: 'cng' } },
  email_sequence: { validated: { enabled: true }, j7: { enabled: false }, j1: { enabled: true }, opening: { enabled: true }, relance: { enabled: true }, results: { enabled: true }, results_delay_minutes: 0 },
}).select('id').single();
if (tErr) throw tErr;

for (const r of ROUNDS) {
  const { data: round, error: rErr } = await db.from('arena_rounds').insert({
    tournament_id: t.id, number: r.number, theme: r.theme,
    opens_at: new Date(r.opens).toISOString(), closes_at: new Date(r.closes).toISOString(),
    corrections_intro: r.intro, corrections_methodo: r.methodo, corrections_errors: r.errors, corrections_references: r.refs,
  }).select('id').single();
  if (rErr) throw rErr;
  const rows = r.questions.map((q, i) => ({
    round_id: round.id, order_index: i, type: q.type, expected_count: q.type === 'QRP' ? q.n : null, weight: q.weight ?? 1,
    enonce: q.enonce, vignette: q.vignette ?? null, images: q.images ?? [], items: q.items, source_question_id: q.source_question_id ?? null,
    explanation: q.explanation, pieges: q.pieges, erreurs_frequentes: q.erreurs, references_text: q.refs,
  }));
  const { error: qErr } = await db.from('arena_questions').insert(rows);
  if (qErr) throw qErr;
  console.log(`M${r.number} — ${r.theme} : ${rows.length} questions, ${new Date(r.opens).toISOString()} → ${new Date(r.closes).toISOString()}`);
}

// Modèle de barème d'exemple (§6.7)
const { data: tpl } = await db.from('arena_bareme_templates').select('id').eq('name', 'Barème Major ECN sévère (QRM)').maybeSingle();
if (!tpl) {
  await db.from('arena_bareme_templates').insert({ name: 'Barème Major ECN sévère (QRM)', question_type: 'QRM', config: { mode: 'custom', grid: { points: [1, 0.5, 0, 0], apply_rules: true } } });
  console.log('Modèle de barème « Barème Major ECN sévère (QRM) » créé.');
}

await db.from('arena_log').insert({ tournament_id: t.id, kind: 'created', actor_label: 'script de démonstration', details: 'Tournoi de démonstration créé par scripts/arena-demo-seed.mjs (inscriptions ouvertes, visible du personnel en mode test).' });
console.log(`Tournoi de démo prêt : /arena/${SLUG} · /admin/arena/${t.id}`);
