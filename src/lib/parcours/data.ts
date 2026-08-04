/**
 * Catalogue STATIQUE des Parcours du Major.
 *
 * Sert de repli tant que les tables Supabase ne sont pas encore créées (la
 * migration doit être appliquée à la base). Dès que la base contient des
 * parcours, c'est ELLE qui fait foi (voir `source.ts`) — ce fichier n'est alors
 * plus lu. Il permet de VOIR et tester la section sans base.
 *
 * Le contenu reprend fidèlement les « Coaching PAE » n°1, 2 et 5. Les parcours
 * 3–42 n'ont ici qu'un titre provisoire et leur date d'ouverture.
 */

export type StaticQuestion = {
  section: 'qcm' | 'cas_clinique';
  format: 'qcm' | 'qroc';
  ordre: number;
  enonceHtml: string;
  items: { lettre: string; texte: string; correct: boolean }[];
  reponseAttendue: string | null;
  explicationHtml: string | null;
};

export type StaticParcours = {
  numero: number;
  titre: string;
  sousTitre: string | null;
  introHtml: string;
  vignetteHtml: string | null;
  availableAt: string;
  questions: StaticQuestion[];
};

/** Ouverture : paire ceil(n/2). Paire 1 (parcours 1 & 2) ouverte maintenant ;
 *  paire p≥2 = lundi 2026-08-11 10h (Europe/Paris) + (p-2) semaines. */
function availableAtFor(numero: number): string {
  const pair = Math.ceil(numero / 2);
  if (pair === 1) return '2026-08-04T00:00:00+02:00';
  const dt = new Date(Date.UTC(2026, 7, 11) + (pair - 2) * 7 * 86_400_000);
  const y = dt.getUTCFullYear();
  const m = dt.getUTCMonth();
  const day = dt.getUTCDate();
  // Heure d'été (CEST, +02) jusqu'au 2026-10-25 inclus, puis CET (+01).
  const off = Date.UTC(y, m, day) <= Date.UTC(2026, 9, 25) ? '+02:00' : '+01:00';
  const pad = (x: number) => String(x).padStart(2, '0');
  return `${y}-${pad(m + 1)}-${pad(day)}T10:00:00${off}`;
}

/** Contenu rédigé des parcours déjà intégrés. */
const CONTENT: Record<number, Partial<Pick<StaticParcours, 'titre' | 'sousTitre' | 'introHtml' | 'vignetteHtml' | 'questions'>>> = {
  1: {
    titre: 'Bien démarrer sa préparation',
    sousTitre: 'Méthode de travail & premier cas clinique',
    introHtml: `
<p>Bienvenue à tous pour cette préparation au concours du PAE ! Vous accèderez à <strong>deux coachings par semaine</strong>. Leur objectif principal : vous faire acquérir la bonne méthodologie pour travailler et pour bien rédiger vos réponses.</p>
<h3>Un objectif double</h3>
<p>Votre travail doit viser deux buts : d’abord <strong>apprendre des connaissances brutes</strong> (par ex. l’hémoglobine normale chez la femme est comprise entre 12 et 16 g/dL), mais aussi <strong>savoir utiliser ces connaissances</strong> comme autant de passerelles pour construire un chemin vers la bonne réponse. Mieux vaut un marteau dont on sait se servir qu’une masse qu’on ne peut pas soulever !</p>
<h3>Le volume et la qualité de travail</h3>
<p>Pour le PAE, comptez au minimum <strong>deux à trois heures par jour</strong> en semaine et deux après-midi le week-end. Veillez aussi à la qualité : travaillez dans de bonnes conditions, sans éléments perturbateurs, en évitant de finir trop tard. L’essentiel est de <strong>vous connaître</strong> : les « bonnes conditions » ne sont pas les mêmes pour tous (au calme, en musique, en bibliothèque…). Testez et gardez ce qui vous réussit.</p>
<p><em>NB :</em> les heures de transport ne valent pas une heure au calme — ne les comptez pas, mais mettez-les à profit pour vous remémorer la veille ou réviser vos cartes Anki.</p>
<h3>Les supports de cours</h3>
<p>Évitez de vous éparpiller entre trop de supports. Le plus complet reste <strong>les fiches fournies par l’équipe PAE Formation</strong>. Elles sont très complètes : inutile de tout retenir par cœur — connaissez d’abord <strong>les grands points</strong> de chaque fiche, ceux qui servent à répondre, puis passez aux entraînements.</p>
<h3>Des corrections « actives »</h3>
<p>Mettez à profit les entraînements : lisez les corrections avec soin, tenez un <strong>carnet d’erreurs</strong>, et retournez lire les paragraphes concernés du cours. Si un point n’est pas clair, ne procrastinez pas : relisez, posez des questions. Rien de plus rageant que de buter le jour J sur une question simple qu’on avait laissée de côté.</p>
<h3>Les cas cliniques</h3>
<p>Chaque coaching s’accompagne d’un petit cas clinique testant des notions que vous devez maîtriser, et de la correction du cas de la semaine précédente. Jouez le jeu « en situation », <strong>sans vos cours</strong> : écrivez vos réponses comme le jour de l’épreuve. Bon courage !</p>`,
    vignetteHtml: `
<p>Vous recevez en consultation une patiente de <strong>85 ans</strong> que vous ne connaissez pas encore. Elle n’a pas de médecin traitant ; sa petite-fille, infirmière, « se charge de la surveillance de sa santé ». Elle vient car sa pharmacienne a mesuré sa pression artérielle après un malaise lors de son vaccin contre la grippe : <strong>88/56 mmHg</strong> au moment du malaise, puis <strong>145/93 mmHg</strong> 15 min après. La pharmacienne lui a conseillé de consulter pour « rechercher une pathologie artérielle ».</p>
<p>Antécédents : cholécystectomie il y a 20 ans, asthme, allergie au latex. Elle est G3P2, ne prend aucun traitement, pèse 57 kg pour 1 m 55. Après l’interrogatoire et un examen clinique attentif, votre appareil affiche : <strong>145/95 mmHg</strong>.</p>`,
    questions: [
      {
        section: 'cas_clinique', format: 'qroc', ordre: 0,
        enonceHtml: `<p>Quelles sont les <strong>conditions recommandées</strong> pour la mesure tensionnelle en cabinet de médecine générale ?</p>`,
        items: [],
        reponseAttendue: 'Repos ≥ 5 min, à distance (> 30 min) d’un effort ou du tabac ; 3 mesures espacées de 1–2 min, moyenne des 2 dernières ; appareil électronique validé, brassard adapté ; aux deux bras à la première consultation',
        explicationHtml: `<p>Le sujet doit être <strong>assis ou allongé au repos</strong> depuis au moins 5 min, à distance de plus de 30 min de tout effort et de tout tabagisme. On pratique <strong>3 mesures espacées de 1 à 2 min</strong> et on retient la <strong>moyenne des deux dernières</strong>. Appareil électronique validé, brassard adapté ; aux deux bras à la première consultation, puis on retient le bras le plus élevé.</p>`,
      },
      {
        section: 'cas_clinique', format: 'qroc', ordre: 1,
        enonceHtml: `<p>Que vous manque-t-il pour poser le diagnostic d’<strong>hypertension artérielle</strong> ? Comment obtenez-vous ces éléments ?</p>`,
        items: [],
        reponseAttendue: 'Confirmer la stabilité de l’HTA hors du cabinet (écarter l’effet blouse blanche) : MAPA ou automesure tensionnelle (règle des 3 jours)',
        explicationHtml: `<p>Il faut montrer la <strong>stabilité de l’HTA</strong> dans le temps et <strong>en dehors du contexte de soin</strong> (écarter l’HTA « blouse blanche ») : MAPA ou automesure tensionnelle 3 jours de suite.</p>`,
      },
      {
        section: 'cas_clinique', format: 'qroc', ordre: 2,
        enonceHtml: `<p>Votre patiente présente-t-elle des <strong>facteurs de risque cardiovasculaires</strong> ?</p>`,
        items: [],
        reponseAttendue: 'Essentiellement l’âge ; IMC normal (~24 kg/m²), pas de diabète, de dyslipidémie ni d’antécédents familiaux',
        explicationHtml: `<p>On ne retrouve guère que <strong>l’âge</strong>. IMC ≈ 24 kg/m² (normal). Pas de diabète, de dyslipidémie ni d’antécédents familiaux connus.</p>`,
      },
      {
        section: 'cas_clinique', format: 'qcm', ordre: 3,
        enonceHtml: `<p>À propos du <strong>bilan complémentaire</strong> pertinent dans ce cas, quelles sont les propositions exactes ?</p>`,
        items: [
          { lettre: 'A', texte: 'Test MMS', correct: true },
          { lettre: 'B', texte: 'Exploration des anomalies lipidiques', correct: true },
          { lettre: 'C', texte: 'Bilan d’hémostase', correct: false },
          { lettre: 'D', texte: 'Créatininémie et fonction rénale', correct: true },
          { lettre: 'E', texte: 'Ionogramme', correct: true },
          { lettre: 'F', texte: 'Évaluation de la consommation d’alcool', correct: true },
        ],
        reponseAttendue: null,
        explicationHtml: `<p><strong>Réponse : ABDEF.</strong> Bilan devant une HTA : EAL, ionogramme, fonction rénale, glycémie à jeun, protéinurie, ECG de repos. On ajoute le <strong>test MMS</strong> (évaluation cognitive de cette patiente âgée) et la recherche d’une <strong>intoxication alcoolique</strong> (cause d’HTA secondaire).</p>`,
      },
      {
        section: 'cas_clinique', format: 'qroc', ordre: 4,
        enonceHtml: `<p>Quelle est la <strong>cible tensionnelle</strong> chez cette patiente ?</p>`,
        items: [],
        reponseAttendue: 'PAS < 150 mmHg, sans hypotension orthostatique',
        explicationHtml: `<p>Patiente de plus de 80 ans ayant visiblement fait une <strong>hypotension orthostatique</strong> lors de son vaccin. Objectif : <strong>PAS &lt; 150 mmHg sans HTO</strong>.</p>`,
      },
      {
        section: 'cas_clinique', format: 'qroc', ordre: 5,
        enonceHtml: `<p>Les valeurs à domicile confirment celles du cabinet. Quelles <strong>thérapeutiques</strong> mettez-vous en place ?</p>`,
        items: [],
        reponseAttendue: 'Cible déjà atteinte : règles hygiéno-diététiques seules (activité physique, sel < 6–8 g/j, arrêt alcool/tabac, fruits & légumes, limiter les graisses saturées)',
        explicationHtml: `<p>La cible est déjà atteinte : <strong>règles hygiéno-diététiques seules</strong> — activité physique régulière, sel &lt; 6–8 g/j, pas d’alcool ni de tabac, fruits et légumes, limitation des graisses saturées.</p>`,
      },
    ],
  },
  2: {
    titre: 'Mémoriser efficacement ses cours',
    sousTitre: 'Techniques de mémorisation',
    introHtml: `
<p>Bonjour à tous, et bienvenue pour le coaching n°2 ! L’objectif ici : des astuces pour <strong>mieux retenir vos cours</strong>.</p>
<h3>Faire ressortir l’essentiel</h3>
<p>Les supports fournis sont complets et contiennent parfois du « hors programme ». Les cours « live » aident à distinguer l’important du détail. Adoptez un <strong>code couleur</strong> — par niveau d’importance (jaune : à connaître, vert : primordial, rouge : indispensable, risque de « PMZ ») ou par type d’information. L’essentiel est un apprentissage <strong>structuré</strong> : une « étagère » de connaissances, pas un « sac ».</p>
<h3>Reformuler pour ancrer</h3>
<p>Recopier un cours sous une autre forme force l’effort de mémoire. Faites un tableau de synthèse en fin de fiche : <em>Épidémiologie, Physiopathologie, Tableau clinique, Examens complémentaires, Complications, Traitement, Surveillance</em>. Attention : très chronophage si fait pour tous les cours — réservez-le aux sujets difficiles.</p>
<h3>Apprendre selon sa mémoire</h3>
<p>Mémoire visuelle : relire, s’appuyer sur les tableaux. Mémoire auditive : lire à voix haute, s’enregistrer et réécouter. Pour les listes, récitez-les toujours dans le même ordre, créez des <strong>moyens mnémotechniques</strong>, et retenez leur <strong>nombre d’éléments</strong>.</p>
<h3>Réviser régulièrement</h3>
<p>Un cours s’oublie vite : revoyez-le après ~2 semaines, puis après 1 mois. Ma méthode en 3 lectures : (1) lecture tranquille pour comprendre le « pourquoi » ; (2) 3 jours après, retenir et restituer les grandes lignes ; (3) parfaire en insistant sur les points fragiles. Et s’entraîner avec les annales et les cas cliniques !</p>`,
    vignetteHtml: null,
    questions: [],
  },
  5: {
    titre: 'Répondre aux questions à réponse courte',
    sousTitre: 'Méthodologie des QROC',
    introHtml: `
<p>Bonjour à tous ! J’espère que vos révisions avancent bien. Après les QCM, voyons comment répondre aux <strong>questions à réponse courte (QROC)</strong>.</p>
<h3>Respecter le nombre de réponses demandé</h3>
<p>Quand un nombre limité de réponses est attendu (« Quelles sont les 2 hypothèses ? »), <strong>n’en donnez pas plus</strong> : vous risqueriez de perdre des points. Si vous en avez plusieurs en tête, choisissez les plus <strong>probables</strong> et/ou les plus <strong>graves</strong>.</p>
<h3>Justifier et structurer</h3>
<p>Pour les questions courtes (« Quel diagnostic ? »), <strong>justifiez</strong> succinctement sauf mention contraire. Mettez en évidence l’<strong>élément central</strong> (le diagnostic), annoncé d’emblée : pas de suspens. Une pensée structurée met le correcteur dans de bonnes dispositions.</p>
<h3>Pour justifier un diagnostic</h3>
<ul><li>Terrain</li><li>Signes fonctionnels évocateurs</li><li>Examen clinique en faveur</li><li>Examens complémentaires en faveur du diagnostic</li></ul>
<p><em>Ex. pneumopathie du lobe inférieur droit :</em> patient de 65 ans tabagique ; toux et crachats ; fièvre et foyer de crépitants en base droite ; syndrome inflammatoire et foyer systématisé en LID.</p>
<h3>S’auto-évaluer honnêtement</h3>
<p>Entraînez-vous puis corrigez-vous « honnêtement » : ne comptez le point que si la réponse est <strong>parfaitement exacte</strong>. Restez bref, présentez par tirets si un nombre défini est demandé, et soulignez les mots-clés. Bon courage !</p>`,
    vignetteHtml: null,
    questions: [],
  },
};

export const STATIC_PARCOURS: StaticParcours[] = Array.from({ length: 42 }, (_, i) => {
  const numero = i + 1;
  const c = CONTENT[numero];
  return {
    numero,
    titre: c?.titre ?? `Parcours n°${numero}`,
    sousTitre: c?.sousTitre ?? null,
    introHtml: c?.introHtml ?? '',
    vignetteHtml: c?.vignetteHtml ?? null,
    availableAt: availableAtFor(numero),
    questions: c?.questions ?? [],
  };
});
