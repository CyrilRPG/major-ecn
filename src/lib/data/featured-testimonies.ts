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
  {
    slug: 'dr-bill-baron-wankpo',
    name: 'Dr Bill Baron WANKPO',
    initials: 'BW',
    spec: 'Médecine générale',
    role: 'Lauréat des EVC de Médecine Générale',
    photo: '/temoignages/drbilly.png',
    quote: "Une préparation structurée et ciblée, utile bien au-delà du concours.",
    paragraphs: [
      "J'ai présenté le concours de médecine générale pour la première fois après avoir préparé les épreuves avec Major ECN, et j'ai eu la satisfaction de réussir avec de bonnes notes. J'ai également plusieurs collègues qui ont suivi cette préparation dans différentes spécialités et qui ont eux aussi obtenu leur concours.",
      "Ce que j'ai particulièrement apprécié, c'est la qualité de la méthodologie proposée. Les connaissances sont évidemment indispensables, mais au fil de la préparation, j'ai compris qu'il ne suffisait pas de connaître son cours. Savoir répondre aux questions, structurer son raisonnement et comprendre les attentes du jury fait souvent toute la différence le jour de l'épreuve.",
      "Les examens blancs réalisés dans des conditions proches du concours m'ont également beaucoup aidé. Ils permettent de se confronter à la réalité de l'épreuve, d'identifier ses points faibles et d'aborder le jour J avec davantage de confiance.",
      "Je recommande cette préparation pour deux raisons principales : réussir les EVC grâce à une préparation structurée et ciblée ; et améliorer sa pratique médicale quotidienne grâce à des enseignements concrets et applicables sur le terrain.",
      "C'est d'ailleurs un aspect que j'ai particulièrement apprécié : cette préparation ne sert pas uniquement à réussir un concours. De nombreuses notions abordées sont utiles dans la pratique médicale de tous les jours.",
      "Bien entendu, aucune formation ne remplace le travail personnel. Il faut réviser régulièrement, revoir les notions abordées et rester constant dans ses efforts. Personne ne pourra faire ce travail à votre place.",
      "Comme beaucoup de candidats, j'ai connu des périodes de doute au cours de la préparation. Dans ces moments-là, il est parfois difficile de mesurer le chemin déjà parcouru. Les entraînements réguliers et les examens blancs m'ont permis de continuer à avancer avec davantage de confiance et de sérénité.",
      "Enfin, comme pour tout concours, il existe toujours une part d'incertitude. Mais une préparation sérieuse permet d'aborder les épreuves dans les meilleures conditions possibles et d'arriver le jour J avec le sentiment d'avoir donné le meilleur de soi-même.",
      "Je souhaite beaucoup de réussite à tous les futurs candidats.",
    ],
  },
  {
    slug: 'dr-samy-kabaweh',
    name: 'Dr Samy KABAWEH',
    initials: 'SK',
    spec: 'Radiologie',
    role: 'Lauréat des EVC Radiologie',
    photo: '/temoignages/drsamy.jpg',
    quote: "Cette préparation m'a vraiment permis de franchir un cap.",
    paragraphs: [
      "J'ai passé les EVC en radiologie il y a quelques années avec Major ECN, et cette préparation m'a vraiment permis de franchir un cap.",
      "Avant cela, je travaillais sans méthode claire. Je connaissais certaines choses, mais je ne savais pas toujours comment organiser mes réponses ni comment prioriser mes révisions.",
      "La préparation m'a aidé à cibler l'essentiel et à ne pas m'éparpiller. Les fiches étaient claires, les dossiers bien construits, et le jour J, j'ai eu le sentiment de retrouver une très grande partie des situations déjà travaillées pendant la préparation.",
      "Cette réussite m'a permis d'intégrer le système français. J'ai ensuite recommandé la formation à mon épouse, qui est gynécologue. Elle a passé les EVC en 2024 avec Major ECN, et elle a réussi elle aussi.",
      "Aujourd'hui, nous sommes tous les deux en poste, chacun dans notre spécialité, et sincèrement, cette préparation a compté pour nous deux, mais aussi pour notre famille.",
      "Merci encore à toute l'équipe de Major ECN.",
    ],
  },
  {
    slug: 'dr-faten-hnania',
    name: 'Dr Faten Hnania',
    initials: 'FH',
    spec: 'Médecine générale',
    role: 'Lauréate des EVC MG',
    photo: '/temoignages/drfaten.png',
    quote: "Un cadre clair et une méthode de travail sérieuse.",
    paragraphs: [
      "C'est une préparation sérieuse, à condition bien sûr de travailler régulièrement de son côté.",
      "Ce que j'ai particulièrement apprécié, c'est le gain de temps pendant la préparation. Les supports sont clairs, bien organisés, et permettent d'aller à l'essentiel sans se disperser.",
      "Le vrai plus pour moi, ça a surtout été la méthodologie de réponse. On peut avoir des connaissances, mais encore faut-il comprendre ce qu'on attend de nous et savoir structurer sa réponse.",
      "Je recommande Major ECN aux candidats qui préparent les EVC et qui ont besoin d'un cadre clair et d'une méthode de travail sérieuse.",
    ],
  },
];
