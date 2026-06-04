/**
 * Données partagées des témoignages à la une (utilisées par la page
 * /temoignages et la route dynamique /temoignages/[slug]).
 */
export type Featured = {
  slug: string;
  name: string;
  initials: string;
  spec: string;
  role: string;
  /** Photo dans /public/temoignages/<photo> ; fallback initiales si absente. */
  photo: string;
  quote: string;
  paragraphs: string[];
};

export const FEATURED_TESTIMONIES: Featured[] = [
  {
    slug: 'dr-haykel-abdelbaki',
    name: 'Dr Haykel Abdelbaki',
    initials: 'HA',
    spec: 'Radiologie',
    role: 'Lauréat des EVC',
    photo: '/temoignages/dr-haykel-abdelbaki.jpg',
    quote: 'Sérieux, qualité et accompagnement : les clés de ma réussite.',
    paragraphs: [
      "J'ai réussi les EVC de radiologie et Major ECN a largement contribué à cette réussite.",
      "Ce que j'ai particulièrement apprécié, c'est le sérieux et la qualité de l'organisation. Les cours sont actualisés, clairs et réellement adaptés aux exigences du concours. Le planning est respecté, ce qui permet d'avancer sereinement tout au long de la préparation.",
      "L'équipe pédagogique est un véritable point fort. Les enseignants sont disponibles, à l'écoute et prennent le temps d'identifier les difficultés de chaque candidat afin de l'aider à progresser efficacement.",
      "Les épreuves blanches organisées dans des conditions proches de l'examen permettent de se préparer concrètement au jour J et d'évaluer son niveau de manière réaliste. Les annales corrigées avec les grilles officielles et les mots-clés attendus sont également d'une grande aide pour comprendre ce qui est réellement attendu par les jurys.",
      "Au-delà des supports et des enseignements, j'ai trouvé chez Major ECN un cadre de travail structuré et rassurant qui m'a permis d'aborder les épreuves avec davantage de confiance.",
      "Je recommande cette préparation à tous les candidats qui souhaitent mettre toutes les chances de leur côté pour réussir les EVC.",
    ],
  },
  {
    slug: 'dr-amelie-lamure',
    name: 'Dr Amélie Lamure',
    initials: 'AL',
    spec: 'Anesthésie-Réanimation',
    role: 'Lauréate des EVC',
    photo: '/temoignages/dr-amelie-lamure.jpg',
    quote: "Une équipe présente, disponible et impliquée à chaque étape.",
    paragraphs: [
      "Quand j'ai commencé à préparer les EVC, je me suis vite rendu compte que la difficulté ne venait pas seulement du concours lui-même. Il fallait aussi réussir à tenir dans la durée, garder sa motivation, gérer les moments de doute et continuer à avancer malgré la fatigue et les contraintes du quotidien.",
      "Avant de rejoindre Major ECN, j'avais souvent l'impression d'être seule face à cette montagne. Je travaillais, je révisais, mais je me demandais constamment si j'étais dans la bonne direction, si je ne passais pas à côté de l'essentiel ou si ma façon de travailler était vraiment adaptée aux attentes des EVC.",
      "Ce que Major ECN m'a apporté, c'est d'abord ce sentiment de ne plus être seule. J'ai trouvé une équipe présente, disponible et impliquée, qui connaissait parfaitement les exigences du concours et qui nous accompagnait à chaque étape de la préparation. J'avais le sentiment d'avoir de véritables partenaires à mes côtés, et cela a été extrêmement précieux tout au long de cette année.",
      "Bien sûr, la qualité des cours a énormément compté. Les contenus étaient complets, structurés et orientés vers ce qu'il fallait réellement maîtriser pour les épreuves. Les cas cliniques, les examens blancs et les séances de méthodologie m'ont permis de comprendre ce qui était attendu le jour J et d'aborder progressivement le concours avec davantage de confiance.",
      "Mais ce dont je me souviendrai le plus, c'est de l'accompagnement humain. Dans les moments où l'on doute, où l'on se sent dépassé par la charge de travail ou lorsque l'on se pose mille questions sur sa préparation, savoir que l'on peut compter sur une équipe réactive et bienveillante fait une vraie différence.",
      "La réussite aux EVC demande beaucoup de travail personnel, personne ne peut faire ce travail à votre place. En revanche, être guidé, encouragé et accompagné tout au long du parcours permet d'avancer beaucoup plus sereinement et efficacement.",
      "Aujourd'hui, après avoir réussi les EVC d'Anesthésie-Réanimation, je tiens à remercier sincèrement toute l'équipe de Major ECN. Leur accompagnement, leur disponibilité et leur engagement ont compté bien au-delà du simple enseignement. Ils ont été présents pendant toute cette préparation, et je leur en suis profondément reconnaissante.",
    ],
  },
  {
    slug: 'dr-leila-bettaieb',
    name: 'Dr Leila Bettaieb',
    initials: 'LB',
    spec: 'Médecine générale',
    role: 'Lauréate des EVC MG',
    photo: '/temoignages/dr-leila-bettaieb.jpg',
    quote: "Une méthode claire, de bons supports et un véritable accompagnement.",
    paragraphs: [
      "J'ai particulièrement apprécié le travail réalisé autour des cas cliniques corrigés. Pouvoir s'entraîner sur un grand nombre de dossiers et comprendre précisément ce qui était attendu dans les réponses m'a énormément aidée à progresser.",
      "Au-delà des connaissances, cette préparation m'a surtout permis d'acquérir une véritable méthodologie de travail et de réponse aux épreuves, ce qui fait souvent la différence le jour du concours.",
      "Bien sûr, il faut travailler sérieusement et réviser régulièrement. Aucune formation ne peut apprendre ou mémoriser à votre place 😊. Mais lorsqu'on dispose d'une méthode claire, de bons supports et d'un accompagnement adapté, on avance beaucoup plus sereinement.",
      "J'ai également beaucoup apprécié la disponibilité de l'équipe. À plusieurs reprises, j'ai pu poser mes questions et obtenir des réponses qui m'ont permis de continuer à avancer sans rester bloquée dans mes révisions.",
      "Je recommande sincèrement Major ECN à tous les candidats qui recherchent non seulement des cours et des entraînements de qualité, mais aussi un véritable accompagnement tout au long de leur préparation.",
    ],
  },
];
