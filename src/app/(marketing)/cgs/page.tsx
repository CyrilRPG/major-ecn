import {
  LegalShell, LegalSection, LegalSubSection, LegalList, LegalInfoBox,
} from '@/components/marketing/legal-shell';

export const metadata = {
  title: 'Conditions Générales de Service — Major ECN',
  description:
    "Conditions Générales de Service de Major ECN (PAE Formation) : objet des Offres, accès à la Plateforme, Coaching, Channel, durée, prix, paiement, droit de rétractation, propriété intellectuelle, responsabilité, médiation.",
};

const TOC = [
  { id: 'preambule',    label: 'Préambule' },
  { id: 'art-0',        label: 'Article préliminaire — Définitions' },
  { id: 'art-1',        label: 'Article 1 — Documents contractuels' },
  { id: 'art-2',        label: 'Article 2 — Principes directeurs des Offres' },
  { id: 'art-3',        label: 'Article 3 — Mise à disposition de Supports' },
  { id: 'art-4',        label: 'Article 4 — Le Coaching' },
  { id: 'art-5',        label: 'Article 5 — L’accès au Channel' },
  { id: 'art-6',        label: 'Article 6 — Souscription — Durée' },
  { id: 'art-7',        label: 'Article 7 — Prix' },
  { id: 'art-8',        label: 'Article 8 — Conditions de paiement' },
  { id: 'art-9',        label: 'Article 9 — Propriété intellectuelle' },
  { id: 'art-10',       label: 'Article 10 — Rétractation — Garanties' },
  { id: 'art-11',       label: 'Article 11 — Responsabilité' },
  { id: 'art-12',       label: 'Article 12 — Informatique et libertés' },
  { id: 'art-13',       label: 'Article 13 — Disponibilité de la Plateforme' },
  { id: 'art-14',       label: 'Article 14 — Droit applicable' },
  { id: 'art-15',       label: 'Article 15 — Indivisibilité' },
  { id: 'art-16',       label: 'Article 16 — Litiges' },
];

export default function CGSPage() {
  return (
    <LegalShell
      title="Conditions Générales de Service"
      subtitle="Les présentes Conditions Générales de Service régissent les Offres de Major ECN — PAE Formation."
      lastUpdated="14 juin 2026"
      toc={TOC}
      pdfHref="/legal/cgs.pdf"
    >
      <section id="preambule" className="scroll-mt-24 pb-8 text-[14.5px] leading-relaxed">
        <p>
          Major ECN — PAE Formation, société par actions simplifiée au capital social de 100 euros,
          ayant son siège social situé 3, rue Rosa Bonheur à Paris (75015), immatriculée au registre
          du commerce et des sociétés de Paris sous le numéro d’identification 821 740 537 et dont
          le numéro de TVA intracommunautaire est FR88821740537 (le « <strong>Prestataire</strong> »),
          propose des offres d’enseignement dans le domaine médical.
        </p>
        <p className="mt-3">
          Les offres du Prestataire (la ou les « <strong>Offre(s)</strong> ») s’articulent, sauf
          accord contraire des Parties, autour d’une mise à disposition de vidéos de formation sur
          le thème susvisé (la ou les « <strong>Vidéo(s)</strong> ») avec des questionnaires et/ou
          études de cas cliniques (ensemble, le ou les « <strong>Support(s)</strong> »).
        </p>
        <p className="mt-3">
          Toute souscription à une Offre implique, de la part du Client, l’acceptation des
          présentes Conditions Générales de Services.
        </p>
      </section>

      <LegalSection id="art-0" title="Article préliminaire — Définitions et règles d’interprétation">
        <LegalSubSection title="0.1 Définitions">
          <p>
            Les termes et expressions commençant par une majuscule lorsqu’ils sont utilisés dans
            les présentes ont la signification suivante :
          </p>
          <dl className="mt-3 space-y-2 text-[14px]">
            <div><dt className="font-extrabold inline">« Channel » :</dt> <dd className="inline">a le sens qui lui est attribué à l’article 5.</dd></div>
            <div><dt className="font-extrabold inline">« Client » :</dt> <dd className="inline">a le sens qui lui est attribué dans l’exposé préalable.</dd></div>
            <div><dt className="font-extrabold inline">« Coach » :</dt> <dd className="inline">a le sens qui lui est attribué à l’article 4.</dd></div>
            <div><dt className="font-extrabold inline">« Coaching » :</dt> <dd className="inline">a le sens qui lui est attribué dans l’exposé préalable.</dd></div>
            <div><dt className="font-extrabold inline">« Conditions Particulières » :</dt> <dd className="inline">a le sens qui lui est attribué à l’article 1.1.</dd></div>
            <div><dt className="font-extrabold inline">« Contenu » :</dt> <dd className="inline">a le sens qui lui est attribué à l’article 9.</dd></div>
            <div><dt className="font-extrabold inline">« Contrat » :</dt> <dd className="inline">a le sens qui lui est attribué à l’article 1.1.</dd></div>
            <div><dt className="font-extrabold inline">« Offre(s) » :</dt> <dd className="inline">a le sens qui lui est attribué dans l’exposé préalable.</dd></div>
            <div><dt className="font-extrabold inline">« Parties » :</dt> <dd className="inline">désigne le Prestataire et le Client.</dd></div>
            <div><dt className="font-extrabold inline">« Plateforme » :</dt> <dd className="inline">a le sens qui lui est attribué à l’article 3.1.</dd></div>
            <div><dt className="font-extrabold inline">« Prestataire » :</dt> <dd className="inline">a le sens qui lui est attribué dans l’exposé préalable.</dd></div>
            <div><dt className="font-extrabold inline">« Support(s) » :</dt> <dd className="inline">a le sens qui lui est attribué dans l’exposé préalable.</dd></div>
            <div><dt className="font-extrabold inline">« Tiers » :</dt> <dd className="inline">désigne toute personne physique ou morale ou tout autre entité, qui n’est pas une Partie.</dd></div>
            <div><dt className="font-extrabold inline">« Vidéo(s) » :</dt> <dd className="inline">a le sens qui lui est attribué dans l’exposé préalable.</dd></div>
          </dl>
        </LegalSubSection>
        <LegalSubSection title="0.2 Règles d’interprétation">
          <p>Les règles exposées ci-après s’appliquent à l’interprétation des présentes :</p>
          <ol className="mt-2 list-[lower-alpha] space-y-1.5 pl-5 text-[14px]">
            <li>les titres des articles et des annexes sont inclus par commodité et n’affectent en aucun cas l’interprétation de l’une quelconque des stipulations ;</li>
            <li>l’usage des expressions « y compris », « en particulier », ou « notamment » implique que l’énumération qui les suit n’est pas limitative ou exhaustive ;</li>
            <li>le terme « ou » n’est pas exclusif ;</li>
            <li>la définition attribuée à un terme singulier s’applique également à ce terme lorsqu’il est employé au pluriel et vice versa. Il en est de même concernant l’utilisation du genre masculin ou féminin ;</li>
            <li>le décompte des délais exprimés en jours, en mois ou en années doit être fait conformément aux dispositions des articles 640 à 642 du code de procédure civile ;</li>
            <li>toute référence à une partie inclut une référence à ses héritiers, successeurs et ayants droit ;</li>
            <li>toute référence à un document s’entend de ce document tel qu’il pourrait être modifié ou remplacé (autrement qu’en violation des stipulations des présentes).</li>
          </ol>
        </LegalSubSection>
      </LegalSection>

      <LegalSection id="art-1" title="Article 1 — Documents contractuels — Déclarations du Client">
        <LegalSubSection title="1.1 Documents contractuels">
          <p>Les documents contractuels sont :</p>
          <LegalList>
            <li>
              les <a href="/conditions-particulieres" className="font-semibold text-[#C0112E] underline">Conditions Particulières</a> établies
              par le Prestataire comprenant le contenu et la désignation de l’Offre souscrite par
              le Client (les « <strong>Conditions Particulières</strong> ») ;
            </li>
            <li>les présentes Conditions Générales des Services.</li>
          </LegalList>
          <p>L’ensemble des documents précités forme ensemble le contrat unissant les Parties (le « <strong>Contrat</strong> »).</p>
          <p>En cas de contradiction entre une ou plusieurs stipulations figurant dans l’un des documents précités, le document de niveau supérieur prévaudra.</p>
        </LegalSubSection>
        <LegalSubSection title="1.2 Déclarations du Client">
          <p>Le Client déclare :</p>
          <LegalList>
            <li>avoir pris l’entière connaissance des présentes et annexes ;</li>
            <li>avoir reçu toute l’information nécessaire pour prendre une décision éclairée ;</li>
            <li>avoir la pleine capacité, le pouvoir et l’autorité à l’effet de conclure et d’exécuter les présentes ;</li>
            <li>que la conclusion des présentes ne contrevient à aucune disposition législative, réglementaire, ou stipulation contractuelle qui lui est applicable.</li>
          </LegalList>
        </LegalSubSection>
      </LegalSection>

      <LegalSection id="art-2" title="Article 2 — Principes directeurs des Offres">
        <p>
          Le contenu des Offres est communiqué au Client avant toute souscription. Il est tenu d’en
          prendre connaissance avant toute souscription. Le Client doit, en outre, s’assurer seul,
          avant toute souscription, que le thème traité correspond bien à ses attentes.
        </p>
        <p>
          Les méthodes de présentation, d’explications et d’approches des sujets traités par le
          Prestataire sont librement déterminées par ce dernier. Le Client ne saurait, en
          conséquence, réclamer l’étude ou l’approfondissement de certaines notions.
        </p>
      </LegalSection>

      <LegalSection id="art-3" title="Article 3 — Mise à disposition de Supports">
        <LegalSubSection title="3.1 Disponibilités des Supports">
          <p>Dans le cadre des Offres, le Prestataire met à disposition du Client des Supports.</p>
          <p>
            Le Prestataire ne s’engage pas sur un nombre minimum de Supports. Le Prestataire pourra
            éventuellement et discrétionnairement mettre à disposition du Client de nouveaux
            Supports ou réaliser des mises à jour de Supports existants sans que cela ne crée une
            quelconque obligation à sa charge.
          </p>
          <p>
            Les Supports sont accessibles sur une plateforme communiquée par le Prestataire au
            Client (la « <strong>Plateforme</strong> ») dès lors qu’il souscrit à l’Offre dans les
            conditions de l’article 6 des présentes. Ils deviennent disponibles sur la Plateforme
            au fur et à mesure de la progression du Client. Le Client ne saurait exiger une mise à
            disposition immédiate de l’ensemble des Supports.
          </p>
          <p>Une fois rendus disponibles, les Supports restent accessibles au Client sur la Plateforme pendant toute la durée du Contrat.</p>
        </LegalSubSection>
        <LegalSubSection title="3.2 Modalités techniques d’accès à la Plateforme">
          <p>
            Afin d’accéder à la Plateforme, le Client devra à sa seule charge financière et sous son
            entière responsabilité disposer d’une connexion internet et d’un navigateur internet
            compatible (dernières versions de Chrome, Safari et/ou Firefox). Le Prestataire n’est
            pas responsable de la bonne installation et du bon fonctionnement des navigateurs web
            sur le poste du Client.
          </p>
          <p>
            L’accès à la Plateforme nécessite la création d’un compte utilisateur et d’un mot de
            passe personnalisable. Le Client est entièrement responsable de l’utilisation desdits
            identifiants.
          </p>
          <p>
            Les identifiants de connexion à la Plateforme sont personnels et confidentiels. Le
            Client s’engage à mettre tout en œuvre pour conserver secrets les identifiants et à ne
            pas les divulguer sous quelque forme que ce soit. Il s’assurera notamment qu’aucune
            autre personne non autorisée par le Prestataire ait accès aux Supports ainsi qu’au
            contenu des Offres. Dans l’hypothèse où il aurait connaissance de ce qu’une autre
            personne utilise ou profite de son accès ou en cas de vol ou de pertes des
            identifiants, le Client en informera le Prestataire sans délai et le confirmera par
            courrier recommandé et par mail à l’adresse :{' '}
            <a href="mailto:contact@major-ecn.fr" className="font-semibold text-[#C0112E] underline">contact@major-ecn.fr</a>.
          </p>
          <p>
            Le Prestataire se réserve le droit de suspendre l’accès à la Plateforme et la fourniture
            des services prévus par les présentes en cas d’activité suspecte détectée sur le compte
            du Client (par ex. connexions nombreuses ou depuis de multiples emplacements ne pouvant
            pas être raisonnablement celles d’un utilisateur unique), utilisation malveillante,
            mauvaise utilisation ou suspicion de copie.
          </p>
          <p>
            Le Client s’engage à ne pas exposer la Plateforme à tout risque de piratage et de
            tentative d’atteinte à leur vulnérabilité ainsi qu’à leur système de sécurité. En
            conséquence, le Client devra mettre en place l’ensemble des mesures adéquates pour
            prévenir les risques précités.
          </p>
          <p>
            Toute violation des présentes conditions par le Client pourra justifier la fermeture de
            son accès à la Plateforme et la résiliation du Contrat à ses torts exclusifs sans
            remboursement possible des sommes qu’il aura préalablement versées. Le Prestataire se
            réserve le droit d’agir, en outre, contre le Client en vue de la réparation de l’entier
            préjudice subi.
          </p>
        </LegalSubSection>
      </LegalSection>

      <LegalSection id="art-4" title="Article 4 — Le Coaching">
        <p>
          Selon l’Offre souscrite, le Prestataire peut assurer un service de réponses écrites aux
          questions éventuelles du Client sur le contenu des Supports disponibles sur la
          Plateforme (le « <strong>Coaching</strong> »).
        </p>
        <p>
          Le Coaching est disponible uniquement via la messagerie sur la Plateforme et dans une
          limite de 5 questions par semaine. En cas de sous-utilisation du service de Coaching,
          aucun report des questions n’est possible d’une semaine à l’autre par le Client.
        </p>
        <p>Les questions devront impérativement être :</p>
        <LegalList>
          <li>rédigées en langue française ;</li>
          <li>suffisamment explicites ;</li>
          <li>en lien direct avec les Supports disponibles sur la Plateforme.</li>
        </LegalList>
        <p>Le Prestataire ne s’engage pas sur un délai de réponse aux questions soumises.</p>
        <p>
          Les réponses transmises au Client pour les besoins du Coaching sont strictement
          confidentielles. Le Client s’interdit de diffuser ou partager lesdites réponses à tout
          Tiers.
        </p>
        <p>
          Le Client est informé que les questions et réponses posées sur la Plateforme pourront
          être diffusées auprès des autres clients du Prestataire.
        </p>
      </LegalSection>

      <LegalSection id="art-5" title="Article 5 — L’accès au Channel">
        <p>
          Selon l’Offre souscrite, le Prestataire peut donner au Client accès à une communauté
          d’élèves via une application de discussion (le « <strong>Channel</strong> »). Cette mise à
          disposition est facultative et à la discrétion du Prestataire.
        </p>
        <p>
          Le Prestataire ne s’engage pas sur la consistance de la communauté en ce compris sur le
          nombre de membres, la qualité des membres ou leurs connaissances.
        </p>
        <p>
          Les membres échangent de manière anonyme sur le Channel sur les seuls Supports à
          l’exclusion de tout autre sujet.
        </p>
        <p>Le Client encourt l’exclusion, sans mise en demeure préalable et sans délai du Channel, en cas :</p>
        <LegalList>
          <li>de propos non respectueux ;</li>
          <li>de communication d’informations susceptibles de porter atteinte à l’ordre public, à la réglementation nationale et/ou internationale, aux droits des tiers ou aux bonnes mœurs ;</li>
          <li>de sollicitation de la communauté pour des questions ou des sujets sans rapport avec les Supports ;</li>
          <li>de dénigrement des services du Prestataire. Toute question, observation ou remarque à l’encontre des services du Prestataire doit être adressée directement au Prestataire et ne saurait faire l’objet d’une quelconque publication sur le Channel sous peine, en sus, de poursuites éventuelles pour diffamation.</li>
        </LegalList>
        <p>
          Les éventuels propos tenus par le Prestataire ou tout membre du Channel doivent être
          considérés comme des opinions sans engagement contractuel sur leur qualité et/ou
          consistance. En conséquence, le Client ne saurait fonder une quelconque décision sur les
          seules informations échangées via le Channel.
        </p>
      </LegalSection>

      <LegalSection id="art-6" title="Article 6 — Souscription — Durée du Contrat">
        <LegalSubSection title="6.1 Souscription">
          <p>
            Le choix et la souscription à une Offre relevant de la seule responsabilité du Client,
            il appartient à ce dernier de vérifier l’exactitude de sa souscription avant toute
            conclusion du Contrat.
          </p>
          <p>
            Une fois le Contrat conclu, le Client ne saurait réclamer une quelconque modification
            du Contrat sans l’accord du Prestataire.
          </p>
        </LegalSubSection>
        <LegalSubSection title="6.2 Durée du Contrat">
          <p>Le présent Contrat est conclu pour une durée maximum d’un (1) an à compter de la conclusion des présentes.</p>
          <p>
            Par exception à ce qui précède, le Contrat est terminé de manière anticipée le jour des
            épreuves préparées par le Client dans le cadre de la présente souscription. Ces
            épreuves sont les prochaines à compter de la date de souscription nonobstant le passage
            effectif plus tardif des épreuves par le Client.
          </p>
          <LegalInfoBox title="Illustration">
            Le Client souscrit le 12 novembre 2026. Les prochaines épreuves sont fixées le
            15 janvier 2027. Bien que le Client n’entende pas passer les épreuves de la session du
            15 janvier 2027, son accès à la Plateforme terminera le 15 janvier 2027.
          </LegalInfoBox>
          <p>
            Une fois le Contrat terminé, les accès à la Plateforme et au Channel le cas échéant
            seront fermés sans information préalable du Client. L’ensemble des données du Client
            chargées sur la Plateforme seront détruites sans information préalable du Client par le
            Prestataire.
          </p>
          <p>
            En cas de manquement par l’une des Parties à ses obligations contractuelles, le Contrat
            pourra être résilié de plein droit par l’autre Partie quinze (15) jours après l’envoi
            d’une lettre de mise en demeure adressée par lettre recommandée avec demande d’avis de
            réception restée sans effet. La mise en demeure indiquera la ou les défaillances
            constatées.
          </p>
        </LegalSubSection>
      </LegalSection>

      <LegalSection id="art-7" title="Article 7 — Prix">
        <p>
          Les Offres sont proposées aux prix figurant sur les Conditions Particulières. Les prix
          sont exprimés en euros et toutes taxes comprises.
        </p>
        <p>Les prix tiennent compte d’éventuelles réductions qui seraient consenties par le Prestataire.</p>
        <p>Le Client assume à sa seule charge l’ensemble des frais nécessaires à l’accès aux Supports (connexion internet…).</p>
        <p>Toute sous-utilisation ou non-utilisation de la Plateforme, en ce compris des Supports, par le Client ne saurait justifier un quelconque remboursement ou prorogation du Contrat.</p>
      </LegalSection>

      <LegalSection id="art-8" title="Article 8 — Conditions de paiement">
        <LegalSubSection title="8.1 Principe">
          <p>Le prix est payable par voie de paiement sécurisé, selon les modalités suivantes :</p>
          <LegalList>
            <li><em>Par carte bancaire</em> : Carte Bleue (CB), Visa, MasterCard. Les données de paiement sont échangées en mode crypté.</li>
            <li><em>Par virement</em>.</li>
          </LegalList>
          <p>
            Le Prestataire ne sera pas tenu de donner au Client un accès au contenu de l’Offre
            souscrite si celui-ci ne paye pas le prix en totalité dans les conditions ci-dessus
            indiquées. Les paiements effectués par le Client ne seront considérés comme définitifs
            qu’après encaissement effectif par le Prestataire des sommes dues.
          </p>
          <p>Aucun escompte ne sera pratiqué par le Prestataire pour paiement éventuellement anticipé.</p>
        </LegalSubSection>
        <LegalSubSection title="8.2 Incidents de paiement">
          <p>
            Sans préjudice d’éventuels dommages et intérêts, le défaut de paiement par le Client
            d’une somme à son échéance entraîne de plein droit :
          </p>
          <LegalList>
            <li>l’application d’un intérêt de retard égal à trois fois le taux d’intérêt légal, sans mise en demeure préalable et à compter du premier jour de retard auquel s’ajoutent les frais bancaires et de gestion supplémentaires ;</li>
            <li>l’exigibilité immédiate de la totalité des sommes dues et à venir au Prestataire par le Client, sans préjudice de toute autre action que le Prestataire serait en droit d’intenter, à ce titre, à l’encontre du Client.</li>
          </LegalList>
          <p>
            En cas de non-respect des conditions de paiement figurant ci-dessus, le Prestataire se
            réserve en outre le droit de suspendre ou d’annuler la fourniture des prestations
            (suspension de l’accès à la Plateforme, arrêt du Coaching…) ou encore de diminuer et/ou
            d’annuler les éventuelles remises accordées à ce dernier.
          </p>
        </LegalSubSection>
        <LegalSubSection title="8.3 Absence de compensation">
          <p>
            Sauf accord exprès, préalable et écrit du Prestataire, et à condition que les créances
            et dettes réciproques soient certaines, liquides et exigibles, aucune compensation ne
            pourra être valablement effectuée par le Client entre d’éventuelles pénalités pour
            retard dans la fourniture de l’Offre ou non-conformité, d’une part, et les sommes dues
            par le Client au Prestataire au titre de la souscription à l’Offre concernée, d’autre
            part.
          </p>
        </LegalSubSection>
      </LegalSection>

      <LegalSection id="art-9" title="Article 9 — Propriété intellectuelle">
        <p>
          Le Prestataire concède au Client un droit personnel, non exclusif, non cessible et non
          transférable d’accès au contenu de l’Offre, en ce compris tous Supports (Vidéos…) (le
          « <strong>Contenu</strong> »).
        </p>
        <p>
          Les présentes ne confèrent aucun droit de propriété sur le Contenu. La mise à disposition
          d’un accès temporaire au Contenu ne saurait être analysée comme la cession d’un
          quelconque droit de propriété intellectuelle au Client.
        </p>
        <p>
          Le Client ne pourra en aucun cas mettre le Contenu à disposition d’un Tiers et s’interdit
          strictement toute adaptation, captation par tout moyen (par exemple une prise vidéo,
          audio ou photo d’une Vidéo ou d’un échange avec le Prestataire dans le cadre du
          Coaching), extraction partielle ou totale, modification, traduction, arrangement,
          diffusion, décompilation sans que cette liste ne soit limitative du Contenu.
        </p>
        <p>
          Le Client s’interdit par ailleurs de reproduire tout élément du Contenu, ou toute
          documentation fournie par le Prestataire (par exemple, support de présentation, étude,
          analyse…), par quelque moyen, sous quelque forme et sur quelque support que ce soit.
          Toute reproduction totale ou partielle de ce contenu est strictement interdite et est
          susceptible de constituer un délit de contrefaçon.
        </p>
      </LegalSection>

      <LegalSection id="art-10" title="Article 10 — Droit de rétractation — Garanties">
        <LegalSubSection title="10.1 Droit de rétractation">
          <p>
            Conformément aux dispositions légales en vigueur, le Client dispose d’un droit de
            rétractation exerçable dans un délai de 14 jours à compter de sa souscription.
          </p>
          <p>
            Pour autant, il est rappelé qu’en application de l’article L. 221-28 du code de la
            consommation, le Client ne dispose pas de droit de rétractation en cas de :
          </p>
          <LegalInfoBox title="Article L. 221-28, 13° du code de la consommation">
            <em>
              De fourniture d’un contenu numérique sans support matériel dont l’exécution a
              commencé avant la fin du délai de rétractation et, si le contrat soumet le
              consommateur à une obligation de payer, lorsque :
              <br />a) Il a donné préalablement son consentement exprès pour que l’exécution du
              contrat commence avant l’expiration du délai de rétractation ;
              <br />b) Il a reconnu qu’il perdra son droit de rétractation ;
              <br />c) Le professionnel a fourni une confirmation de l’accord du consommateur
              conformément aux dispositions du deuxième alinéa de l’article L. 221-13.
            </em>
          </LegalInfoBox>
        </LegalSubSection>
        <LegalSubSection title="10.2 Garanties">
          <p>
            Le Client est informé, qu’en application de l’article 15 de la loi 2004-575 du 21 juin
            2004, le Prestataire est responsable de plein droit à son égard de la bonne exécution
            des obligations résultant des présentes, que ces obligations soient à exécuter par
            lui-même ou par d’autres prestataires de services, sans préjudice de son droit de
            recours contre ceux-ci.
          </p>
          <p>
            Toutefois, le Prestataire peut s’exonérer de tout ou partie de sa responsabilité en
            apportant la preuve que l’inexécution ou la mauvaise exécution des présentes est
            imputable, soit au Client, soit au fait, imprévisible et insurmontable, d’un Tiers
            étranger à la fourniture des prestations prévues par les présentes, soit à un cas de
            force majeure.
          </p>
        </LegalSubSection>
        <LegalSubSection title="10.3 Information précontractuelle — Acceptation du Client">
          <p>
            Le Client reconnaît avoir eu communication, préalablement à la souscription, d’une
            manière lisible et compréhensible, des présentes Conditions Générales du Service et de
            toutes les informations et renseignements visés aux articles L. 111-1 à L. 111-8 du
            code de la consommation, et en particulier :
          </p>
          <LegalList>
            <li>les caractéristiques essentielles de l’Offre souscrite ;</li>
            <li>le prix de l’Offre et des frais annexes ;</li>
            <li>les informations relatives à l’identité du Prestataire, à ses coordonnées postales, téléphoniques et électroniques, et à ses activités, si elles ne ressortent pas du contexte ;</li>
            <li>les informations relatives aux garanties légales et contractuelles et à leurs modalités de mise en œuvre ;</li>
            <li>la possibilité de recourir à une médiation conventionnelle en cas de litige ;</li>
            <li>les informations relatives au droit de rétractation.</li>
          </LegalList>
          <p>
            Le Client renonce à se prévaloir de tout document contradictoire, qui serait
            inopposable au Prestataire.
          </p>
        </LegalSubSection>
      </LegalSection>

      <LegalSection id="art-11" title="Article 11 — Responsabilité">
        <LegalSubSection title="11.1 Utilisation de l’Offre">
          <p>Le rôle du Prestataire se limite à la mise à disposition au Client de l’Offre.</p>
          <p>
            Le Prestataire n’assure pas de rôle d’organisme de formation. Les présentes prestations
            ne sauraient donc faire l’objet d’une quelconque prise en charge ou dispense de TVA.
          </p>
          <p>
            Le Client est tenu de s’assurer que l’utilisation qu’il fait du Site et de la
            Plateforme est conforme aux dispositions légales et règlementaires. Le Prestataire ne
            donne aucune garantie au Client quant à la conformité de l’utilisation du Site et de la
            Plateforme, qu’il fait ou qu’il projette de faire, aux dispositions légales et
            règlementaires.
          </p>
        </LegalSubSection>
        <LegalSubSection title="11.2 Contenu">
          <p>
            Il est rappelé que les méthodes de présentation, d’explications et d’approches des
            sujets traités dans les Offres sont librement déterminées par le Prestataire et ne sont
            susceptibles d’aucune contestation sur quelque fondement et à quelque titre que ce soit
            par le Client ou par tout Tiers.
          </p>
          <p>
            Les exemples, études et cas présentés par le Prestataire, en ce compris dans les Vidéos
            ou le Coaching, n’ont qu’une vocation explicative et ne sont nullement contractuels. Le
            Prestataire ne s’engage pas sur l’exactitude des données et informations publiées, ni
            sur une réussite aux épreuves.
          </p>
          <p>
            Le Client assume l’entière responsabilité quant aux conséquences directes ou indirectes
            de l’application des conseils et des recommandations du Prestataire et cela sans
            pouvoir rechercher sur quelque fondement que ce soit la responsabilité de ce dernier.
            Le Prestataire ne garantit nullement l’efficacité concrète des conseils et
            recommandations fournis dans les Vidéos ou le Coaching.
          </p>
          <p>
            Le Prestataire ne s’engage pas sur une acquisition effective des connaissances par le
            Client. Le Client est informé que le travail personnel est essentiel afin de bien
            maîtriser les enseignements dispensés par le Prestataire.
          </p>
          <p className="rounded-xl border border-[#C0112E]/30 bg-[#FCEAEC] px-4 py-3 font-semibold underline">
            Le Prestataire rappelle au Client que les résultats aux épreuves sont soumis à un aléa
            et qu’il ne saurait, par suite, garantir toute réussite à ce dernier. Aucune garantie
            de résultat n’est attachée à la souscription d’une Offre.
          </p>
        </LegalSubSection>
        <LegalSubSection title="11.3 Dispositions générales">
          <p>
            En tout état de cause, le Prestataire ne saurait en aucune circonstance être
            responsable au titre des pertes ou dommages indirects ou imprévisibles du Client ou des
            Tiers, ce qui inclut notamment tout gain manqué, inexactitude ou corruption de fichiers
            ou données, préjudice commercial, perte de chiffre d’affaires ou bénéfice, perte de
            clientèle ou perte de chance lié à quelque titre et sur quelque fondement que ce soit.
          </p>
          <p>
            Le Prestataire ne saurait être responsable du retard ou de l’inexécution des présentes
            justifié par un cas de force majeure, telle qu’elle est définie par la jurisprudence
            des cours et tribunaux français.
          </p>
        </LegalSubSection>
      </LegalSection>

      <LegalSection id="art-12" title="Article 12 — Informatique et libertés">
        <p>
          En application de la loi n° 78-17 du 6 janvier 1978, il est rappelé que les données
          nominatives qui sont demandées au Client sont nécessaires à la fourniture du service et à
          l’établissement des factures, notamment.
        </p>
        <p>
          Ces données peuvent être communiquées aux éventuels partenaires du Prestataire chargés de
          l’exécution, du traitement et de la gestion du Service.
        </p>
        <p>
          Le Client dispose, conformément aux réglementations nationales et européennes en vigueur,
          d’un droit d’accès permanent, de modification, de rectification et d’opposition
          s’agissant des informations le concernant.
        </p>
        <p>
          Le Client pourra exercer ses droits en écrivant à{' '}
          <a href="mailto:contact@major-ecn.fr" className="font-semibold text-[#C0112E] underline">contact@major-ecn.fr</a>
          {' '}ou à l’adresse postale suivante : PAE Formation — 3, rue Rosa Bonheur — Paris (75015).
          Une réponse à la requête du Client lui sera adressée dans un délai de 30 jours.
        </p>
      </LegalSection>

      <LegalSection id="art-13" title="Article 13 — Disponibilité de la Plateforme">
        <p>Le Prestataire met tout en œuvre pour assurer la disponibilité de la Plateforme, 24 heures sur 24 et 7 jours sur 7.</p>
        <p>
          Le Prestataire décline néanmoins toute responsabilité en cas d’indisponibilité de la
          Plateforme, à tout moment ou pendant une quelconque période. Le Client est averti des
          aléas techniques et des interruptions d’accès pouvant survenir. En conséquence, le
          Prestataire ne pourra être tenu responsable des indisponibilités ou ralentissements de la
          Plateforme.
        </p>
      </LegalSection>

      <LegalSection id="art-14" title="Article 14 — Droit applicable — Langue — Convention de preuve">
        <p>Les présentes Conditions Générales de Service et les opérations qui en découlent sont régies et soumises au droit français.</p>
        <p>Dans l’hypothèse où les présentes conditions seraient traduites dans une ou plusieurs langues étrangères, seul le texte français ferait foi en cas de litige.</p>
        <p>Les systèmes et fichiers informatiques font foi dans les rapports entre les Parties.</p>
        <p>
          Ainsi, le Prestataire pourra valablement produire dans le cadre de toute procédure, aux
          fins de preuve les données, fichiers, programmes, enregistrements ou autres éléments,
          reçus, émis ou conservés au moyen des systèmes informatiques exploités par ce dernier,
          sur tous supports numériques ou analogiques, et s’en prévaloir sauf erreur manifeste.
        </p>
      </LegalSection>

      <LegalSection id="art-15" title="Article 15 — Indivisibilité">
        <p>Le fait que l’une quelconque des dispositions des présentes soit ou devienne illégale ou inapplicable n’affectera en aucune façon la validité ou l’applicabilité des autres stipulations.</p>
      </LegalSection>

      <LegalSection id="art-16" title="Article 16 — Litiges">
        <p>
          Tout différend qui naîtra de l’interprétation, de l’exécution, de l’inexécution, ou des
          suites ou conséquences des présentes sera soumis aux juridictions civiles françaises.
        </p>
        <p>
          Le Client est informé qu’il peut en tout état de cause recourir à une médiation
          conventionnelle ou à tout mode alternatif de règlement des différends (conciliation par
          exemple) en cas de contestation.
        </p>
        <p>
          Conformément à l’article 14.1 du règlement (UE) n°524/2013 du parlement européen et du
          conseil du 21 mai 2013, il est précisé au Client qu’il peut consulter la page suivante
          pour avoir plus d’informations sur ses démarches en cas de contestation :{' '}
          <a
            href="https://consumer-redress.ec.europa.eu/site-relocation_en"
            target="_blank" rel="noopener noreferrer"
            className="font-semibold text-[#C0112E] underline break-all"
          >
            https://consumer-redress.ec.europa.eu/site-relocation_en
          </a>.
        </p>
        <p>
          En outre, le Client pourra contacter, sans frais, le Vendeur à l’adresse électronique
          suivante :{' '}
          <a href="mailto:contact@major-ecn.fr" className="font-semibold text-[#C0112E] underline">contact@major-ecn.fr</a>
          {' '}ou par téléphone (prix d’un appel local) :{' '}
          <a href="tel:+33147343571" className="font-semibold text-[#C0112E] underline">01.47.34.35.71</a>.
        </p>
        <p>
          Conformément aux dispositions légales concernant le règlement amiable des litiges, le
          Vendeur adhère au service du médiateur de la consommation de SAS Médiation dont les
          coordonnées sont les suivantes : 222, chemin de la Bergerie à St. Jean de Niost (01800)
          —{' '}
          <a
            href="http://www.sasmediationsolution-conso.fr/"
            target="_blank" rel="noopener noreferrer"
            className="font-semibold text-[#C0112E] underline break-all"
          >
            sasmediationsolution-conso.fr
          </a>. Après démarche préalable écrite du Client ayant la qualité de consommateur au sens du
          code de la consommation auprès du Vendeur, le service du médiateur précité peut être
          saisi pour tout litige de consommation dont le règlement n’aurait pas abouti.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
