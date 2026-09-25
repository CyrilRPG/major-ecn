/**
 * Campagne de bienvenue (J1 → J7) envoyée aux inscrits de l'espace découverte
 * et aux prospects du guide. Contenu éditorial uniquement : l'habillage est
 * celui de tous les e-mails Major ECN (`../layout`, variante « marketing »,
 * donc avec lien de désinscription).
 *
 * Les bandeaux illustrés (public/emails/banniere-*.jpg) portent déjà le logo
 * et le titre de l'article : ils remplacent le bandeau marine.
 */
import {
  button,
  buttonSecondary,
  contactCard,
  divider,
  emailAssetsBase,
  heading,
  iconList,
  majorEmail,
  majorText,
  MAJOR,
  pHtml,
  pullQuote,
  signature,
  small,
  callout,
  CONTACT_EMAIL,
} from '../layout';

export type CampaignContentKey = 'j1' | 'j3' | 'j5' | 'j7';

/**
 * Désinscription : réponse à la boîte contact (aucun jeton par destinataire
 * n'existe encore pour `campaign_recipients.unsubscribed`). Lien fonctionnel,
 * contrairement à l'ancien `href="#"`.
 */
export const CAMPAIGN_UNSUBSCRIBE_URL = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Désinscription des e-mails Major ECN')}`;

const B = (s: string) => `<strong style="color:${MAJOR.ink};">${s}</strong>`;
const para = (html: string) => pHtml(html);

type Campaign = {
  subject: string;
  preheader: string;
  banner: { file: string; alt: string; height: number };
  step: string;
  body: string[];
  text: string[];
};

function banner(file: string) {
  return `${emailAssetsBase()}/emails/${file}`;
}

const CAMPAIGNS: Record<CampaignContentKey, Campaign> = {
  j1: {
    subject: 'Pourquoi des médecins excellents échouent aux EVC ?',
    preheader: 'Ce n’est pas une question de connaissances. Les erreurs qui reviennent à chaque session.',
    banner: { file: 'banniere-66334621.jpg', alt: 'Pourquoi des médecins excellents échouent aux EVC ?', height: 338 },
    step: 'Méthode EVC · 1/4',
    body: [
      para('Bonjour,'),
      para('Il y a une scène qui se répète à presque chaque session des Épreuves de Vérification des Connaissances.'),
      para('Un médecin avec quinze ans d\'expérience, des centaines de gardes, une solide réputation dans son pays, sort de l\'épreuve convaincu d\'avoir réussi.'),
      para('Quelques semaines plus tard, les résultats tombent.'),
      para(B('Son nom n\'apparaît pas sur la liste des admis.')),
      para('À côté de lui, un confrère beaucoup plus jeune, avec beaucoup moins d\'expérience, obtient son autorisation d\'exercice.'),
      para(B('Comment est-ce possible ?')),
      para('La réponse surprend souvent.'),
      para('Les EVC ne récompensent pas uniquement les connaissances médicales.'),
      para('Ils évaluent surtout la capacité à restituer ces connaissances dans un format très précis, avec des attentes spécifiques, une méthodologie rigoureuse et un temps limité.'),
      para('C\'est d\'ailleurs ce qui explique pourquoi certains excellents médecins échouent alors que d\'autres réussissent dès leur première tentative.'),
      para('Au fil des années, nous avons observé les mêmes erreurs revenir, quelle que soit la spécialité :'),
      callout({ tone: 'brand', html: iconList([
        'Préparer la voie interne et la voie externe <strong>de la même manière</strong>',
        'Réviser sur des supports qui <strong>ne sont pas conçus pour les EVC</strong>',
        'Découvrir la <strong>gestion du temps</strong> le jour de l\'épreuve',
        'Travailler seul sans jamais <strong>faire corriger ses réponses</strong>',
      ], { icon: '&#10005;', tone: 'danger', html: true }) }),
      para(B('La bonne nouvelle, c\'est qu\'aucune de ces erreurs n\'est une fatalité.')),
      para(`Nous avons consacré un article complet à ce sujet dans lequel nous expliquons pourquoi des médecins pourtant très compétents échouent aux EVC… et surtout ${B('comment éviter de faire partie de ceux qui devront repasser les épreuves')}.`),
      button('https://www.major-ecn.fr/blog/pourquoi-des-medecins-echouent-aux-evc', 'Lire l’article complet'),
      divider(),
      para('En attendant, retenez simplement cette idée :'),
      pullQuote('Vous n\'avez pas besoin d\'être le meilleur médecin pour réussir les EVC.', 'Vous devez être le candidat le mieux préparé.'),
      contactCard(),
      signature(),
    ],
    text: [
      'Bonjour,',
      '',
      'Il y a une scène qui se répète à presque chaque session des Épreuves de Vérification des Connaissances : un médecin expérimenté sort de l\'épreuve convaincu d\'avoir réussi… et son nom n\'apparaît pas sur la liste des admis.',
      '',
      'Les EVC évaluent surtout la capacité à restituer ses connaissances dans un format très précis, avec une méthodologie rigoureuse et un temps limité.',
      '',
      'Les erreurs qui reviennent, quelle que soit la spécialité :',
      '✗ Préparer la voie interne et la voie externe de la même manière',
      '✗ Réviser sur des supports qui ne sont pas conçus pour les EVC',
      '✗ Découvrir la gestion du temps le jour de l\'épreuve',
      '✗ Travailler seul sans jamais faire corriger ses réponses',
      '',
      'La bonne nouvelle, c\'est qu\'aucune de ces erreurs n\'est une fatalité.',
      'Lire l\'article complet : https://www.major-ecn.fr/blog/pourquoi-des-medecins-echouent-aux-evc',
      '',
      'Vous n\'avez pas besoin d\'être le meilleur médecin pour réussir les EVC. Vous devez être le candidat le mieux préparé.',
      '',
      'À très bientôt,',
      'L\'équipe Major ECN',
    ],
  },
  j3: {
    subject: 'Les 7 erreurs qui coûtent le plus de points aux EVC',
    preheader: 'Aux EVC, les points se perdent surtout sur la manière de répondre. En voici déjà cinq.',
    banner: { file: 'banniere-353daee3.jpg', alt: 'Les 7 erreurs qui coûtent le plus de points aux EVC', height: 401 },
    step: 'Méthode EVC · 2/4',
    body: [
      para('Bonjour,'),
      para('Il y a une chose qui surprend toujours quand on analyse les résultats des EVC.'),
      para('Parmi les candidats qui échouent, beaucoup étaient d\'excellents médecins. Ils connaissaient leur spécialité. Ils avaient des années d\'expérience. Ils avaient travaillé pendant des mois.'),
      para(B('Alors pourquoi ?')),
      para(`Parce qu'aux EVC, les points ne se perdent pas seulement sur les connaissances. ${B('Ils se perdent surtout sur la manière de répondre.')}`),
      para('Ces erreurs, on les retrouve chez des candidats de toutes les spécialités. Des erreurs discrètes, qu\'on ne voit pas forcément lorsqu\'on prépare seul. En voici déjà cinq :'),
      callout({ tone: 'brand', html: iconList([
        'Préparer la voie interne et la voie externe <strong>exactement de la même manière</strong>',
        'Lire trop vite un QCM et <strong>passer à côté d\'une négation</strong>',
        'Oublier de <strong>hiérarchiser une urgence vitale</strong> dans une copie',
        'Ne travailler sa <strong>gestion du temps</strong> que le jour de l\'examen',
        'Réviser pendant des mois sans jamais <strong>faire corriger ses réponses</strong>',
      ], { icon: '&#10005;', tone: 'danger', html: true }) }),
      para(`Le plus surprenant ? Ces erreurs n'ont souvent rien à voir avec votre niveau médical. Elles relèvent avant tout de la ${B('méthode')}.`),
      para(B('Et la bonne nouvelle, c\'est qu\'elles se corrigent.')),
      para('Nous avons réuni les 7 erreurs qui coûtent le plus de points aux EVC, avec des exemples concrets et des conseils immédiatement applicables.'),
      button('https://www.major-ecn.fr/blog/7-erreurs-points-evc', 'Lire l’article complet'),
      divider(),
      para('Prenez quelques minutes pour le parcourir. Si une seule de ces erreurs vous permet de gagner quelques points le jour J, cette lecture aura déjà été utile.'),
      contactCard(),
      signature(),
      callout({ tone: 'neutral', html: small(`<strong style="color:${MAJOR.ink};">P.S.</strong> Les EVC ne récompensent pas toujours les médecins les plus expérimentés. Elles récompensent surtout ceux qui ont compris les attentes de l'épreuve. C'est précisément ce que nous cherchons à vous transmettre, étape après étape.`, { italic: true }) }),
    ],
    text: [
      'Bonjour,',
      '',
      'Aux EVC, les points ne se perdent pas seulement sur les connaissances. Ils se perdent surtout sur la manière de répondre. En voici déjà cinq :',
      '✗ Préparer la voie interne et la voie externe exactement de la même manière',
      '✗ Lire trop vite un QCM et passer à côté d\'une négation',
      '✗ Oublier de hiérarchiser une urgence vitale dans une copie',
      '✗ Ne travailler sa gestion du temps que le jour de l\'examen',
      '✗ Réviser pendant des mois sans jamais faire corriger ses réponses',
      '',
      'Et la bonne nouvelle, c\'est qu\'elles se corrigent.',
      'Lire l\'article complet : https://www.major-ecn.fr/blog/7-erreurs-points-evc',
      '',
      'À très bientôt,',
      'L\'équipe Major ECN',
      '',
      'P.S. Les EVC ne récompensent pas toujours les médecins les plus expérimentés. Elles récompensent surtout ceux qui ont compris les attentes de l\'épreuve.',
    ],
  },
  j5: {
    subject: 'La méthode que suivent les candidats qui réussissent aux EVC',
    preheader: 'Les habitudes que nous retrouvons le plus souvent chez les lauréats des EVC.',
    banner: { file: 'banniere-84d77dc9.jpg', alt: 'Le mental - Ce qui sépare les candidats qui abandonnent de ceux qui réussissent', height: 400 },
    step: 'Méthode EVC · 3/4',
    body: [
      para('Bonjour,'),
      para(`Quand on prépare les EVC, on passe des centaines d'heures à réviser les connaissances médicales. En revanche, on parle beaucoup plus rarement de ce qui permet à un candidat de ${B('tenir plusieurs mois de préparation')}. Et pourtant, c'est souvent là que tout se joue.`),
      para('Après avoir accompagné plus de 9 000 médecins dans leur préparation aux Épreuves de Vérification des Connaissances, nous avons fait un constat.'),
      para(`Les candidats qui réussissent ne sont pas forcément ceux qui travaillent le plus, ni les plus expérimentés. En revanche, ils partagent presque tous un point commun : ${B('une manière d\'aborder leur préparation qui leur permet de rester engagés jusqu\'au jour J.')}`),
      para('Voici quelques-unes des habitudes que nous retrouvons le plus souvent chez les lauréats :'),
      callout({ tone: 'success', html: iconList([
        'Ils savent <strong>précisément pourquoi</strong> ils préparent les EVC.',
        'Ils découpent leur objectif en <strong>étapes concrètes et atteignables</strong>.',
        'Ils acceptent qu\'il existe des journées moins productives, <strong>sans remettre en cause toute leur préparation</strong>.',
        'Ils gèrent leur énergie comme <strong>une course de fond</strong>, plutôt que comme un sprint.',
        'Ils apprennent à <strong>maîtriser leur stress</strong> au lieu de le subir.',
        'Ils <strong>ne restent pas seuls</strong> face aux difficultés.',
      ], { tone: 'success', html: true }) }),
      para('Ces habitudes peuvent sembler simples.'),
      para(`Pourtant, elles font souvent la différence entre un candidat qui abandonne en cours de route… et ${B('un candidat qui arrive serein et prêt le jour de l\'épreuve')}.`),
      para('Nous avons consacré un article complet à ce sujet.'),
      para('Vous y découvrirez les habitudes mentales que nous retrouvons le plus souvent chez les lauréats des EVC, illustrées par le témoignage d\'un médecin admis et accompagnées de conseils concrets que vous pourrez appliquer dès aujourd\'hui dans votre propre préparation.'),
      button('https://www.major-ecn.fr/blog/comment-reussir-les-evc-conseils-laureats', 'Lire l’article complet'),
      divider(),
      para('Nous espérons que cette lecture vous donnera des clés pour préparer les EVC avec davantage de confiance, de régularité et de sérénité.'),
      contactCard(),
      signature(),
      callout({ tone: 'neutral', html: small(`<strong style="color:${MAJOR.ink};">P.S.</strong> Les connaissances et la méthode sont indispensables. Mais elles ne produisent leurs effets que si vous allez jusqu'au bout de votre préparation. C'est souvent cette capacité à tenir dans la durée qui sépare les candidats qui abandonnent de ceux qui figurent sur la liste des admis.`, { italic: true }) }),
    ],
    text: [
      'Bonjour,',
      '',
      'Après avoir accompagné plus de 9 000 médecins dans leur préparation aux EVC, voici les habitudes que nous retrouvons le plus souvent chez les lauréats :',
      '✓ Ils savent précisément pourquoi ils préparent les EVC.',
      '✓ Ils découpent leur objectif en étapes concrètes et atteignables.',
      '✓ Ils acceptent qu\'il existe des journées moins productives, sans remettre en cause toute leur préparation.',
      '✓ Ils gèrent leur énergie comme une course de fond, plutôt que comme un sprint.',
      '✓ Ils apprennent à maîtriser leur stress au lieu de le subir.',
      '✓ Ils ne restent pas seuls face aux difficultés.',
      '',
      'Lire l\'article complet : https://www.major-ecn.fr/blog/comment-reussir-les-evc-conseils-laureats',
      '',
      'À très bientôt,',
      'L\'équipe Major ECN',
    ],
  },
  j7: {
    subject: 'Comment organiser efficacement ses révisions EVC ?',
    preheader: 'Ce n’est pas le temps de travail qui fait la différence, c’est la manière dont il est organisé.',
    banner: { file: 'banniere-1ccd44f3.jpg', alt: 'Préparation EVC - Planning de révisions', height: 401 },
    step: 'Méthode EVC · 4/4',
    body: [
      para('Bonjour,'),
      para('Une erreur revient très souvent chez les candidats aux EVC.'),
      para(`Ils travaillent énormément… ${B('mais sans véritable plan de préparation.')}`),
      para('Au début, cela ne se voit pas. Puis les semaines passent. Certains chapitres sont revus plusieurs fois, d\'autres sont oubliés, les entraînements arrivent trop tard et l\'impression de tourner en rond s\'installe.'),
      para(`Pourtant, ce n'est pas le temps de travail qui fait la différence. ${B('C\'est la manière dont il est organisé.')}`),
      para('C\'est pourquoi nous avons rédigé un article consacré à une question que se posent la plupart des candidats :'),
      heading('Comment organiser efficacement ses révisions jusqu\'au concours des EVC ?'),
      para('Vous y découvrirez notamment :'),
      iconList([
        'Comment partir de la date du concours pour construire un <strong>rétroplanning réaliste</strong>.',
        'Comment répartir votre préparation en <strong>trois grandes phases</strong> : apprentissage, entraînement et consolidation.',
        'Quels <strong>thèmes privilégier en priorité</strong> pour optimiser votre temps de travail.',
        'Comment <strong>rester régulier</strong> sans vous épuiser au fil des mois.',
      ], { html: true }),
      button('https://www.major-ecn.fr/blog/organiser-revisions-evc', 'Lire l’article complet'),
      divider(),
      para(`Si vous souhaitez aller plus loin, sachez que c'est précisément ce travail d'organisation que ${B('notre plateforme réalise pour vous')}.`),
      para('Vous y trouverez notamment :'),
      iconList([
        'Un plan de travail structuré et progressif',
        'Des cours couvrant l\'ensemble des spécialités',
        'Des entraînements ciblés pour la voie interne comme pour la voie externe',
        'Des examens blancs en conditions réelles',
        'Un suivi de votre progression jusqu\'au concours',
      ], { tone: 'navy', icon: '&#9679;' }),
      buttonSecondary('https://www.major-ecn.fr/plateforme', 'Explorer la plateforme Major ECN'),
      contactCard('Vous avez une question sur votre spécialité, votre voie ou votre organisation ?', 'Notre équipe est à votre disposition pour vous accompagner et répondre à vos interrogations.'),
      para('Les candidats qui réussissent ne sont pas toujours ceux qui travaillent le plus.'),
      para(B('Ce sont souvent ceux qui savent quoi travailler, à quel moment et selon quelle méthode.')),
      signature(),
    ],
    text: [
      'Bonjour,',
      '',
      'Ce n\'est pas le temps de travail qui fait la différence. C\'est la manière dont il est organisé.',
      '',
      'Comment organiser efficacement ses révisions jusqu\'au concours des EVC ?',
      '✓ Construire un rétroplanning réaliste à partir de la date du concours.',
      '✓ Répartir la préparation en trois grandes phases : apprentissage, entraînement et consolidation.',
      '✓ Privilégier les bons thèmes pour optimiser votre temps de travail.',
      '✓ Rester régulier sans vous épuiser au fil des mois.',
      '',
      'Lire l\'article complet : https://www.major-ecn.fr/blog/organiser-revisions-evc',
      'Explorer la plateforme Major ECN : https://www.major-ecn.fr/plateforme',
      '',
      'À très bientôt,',
      'L\'équipe Major ECN',
    ],
  },
};

/** HTML complet d'une étape de la campagne. */
export function renderCampaignHtml(key: CampaignContentKey): string {
  const c = CAMPAIGNS[key];
  return majorEmail({
    subject: c.subject,
    preheader: c.preheader,
    tag: c.step,
    heroImage: { src: banner(c.banner.file), alt: c.banner.alt, width: 600, height: c.banner.height },
    bodyHtml: c.body.join('\n'),
    audience: 'marketing',
    reason: 'Vous recevez cet email car vous vous êtes inscrit(e) sur Major ECN.',
    unsubscribeUrl: CAMPAIGN_UNSUBSCRIBE_URL,
  });
}

/** Version texte d'une étape de la campagne. */
export function renderCampaignText(key: CampaignContentKey): string {
  return majorText(CAMPAIGNS[key].text, { audience: 'marketing', unsubscribeUrl: CAMPAIGN_UNSUBSCRIBE_URL });
}
