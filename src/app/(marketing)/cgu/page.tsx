import {
  LegalShell, LegalSection, LegalSubSection, LegalList,
} from '@/components/marketing/legal-shell';

export const metadata = {
  title: 'Conditions Générales d’Utilisation — Major ECN',
  description:
    "Conditions Générales d’Utilisation de la plateforme Major ECN (PAE Formation) — accès au site, obligations des utilisateurs, propriété intellectuelle, données personnelles, médiation.",
};

const TOC = [
  { id: 'preambule',          label: 'Préambule' },
  { id: 'art-1',              label: 'Article 1 — Accès au Site' },
  { id: 'art-2',              label: 'Article 2 — Fonctionnement du Site' },
  { id: 'art-3',              label: 'Article 3 — Utilisation des Services' },
  { id: 'art-4',              label: 'Article 4 — Contenu du Site' },
  { id: 'art-5',              label: 'Article 5 — Données personnelles' },
  { id: 'art-6',              label: 'Article 6 — Responsabilité' },
  { id: 'art-7',              label: 'Article 7 — Convention de preuve' },
  { id: 'art-8',              label: 'Article 8 — Indivisibilité' },
  { id: 'art-9',              label: 'Article 9 — Règlement des différends' },
  { id: 'mentions-legales',   label: 'Mentions légales' },
];

export default function CGUPage() {
  return (
    <LegalShell
      title="Conditions Générales d’Utilisation"
      subtitle="Les présentes Conditions Générales d’Utilisation régissent l’utilisation de la plateforme Major ECN, exploitée par PAE Formation."
      lastUpdated="14 juin 2026"
      toc={TOC}
      pdfHref="/legal/cgu.pdf"
    >
      <section id="preambule" className="scroll-mt-24 pb-8">
        <p className="text-[14.5px] leading-relaxed">
          Major ECN est une plateforme web, accessible à l’adresse{' '}
          <a href="https://www.major-ecn.fr" className="font-semibold text-[#C0112E] underline">www.major-ecn.fr</a>{' '}
          (le « <strong>Site</strong> ») exploité par PAE Formation, société par actions simplifiée
          au capital social de 100 euros, ayant son siège social situé 3, rue Rosa Bonheur à Paris
          (75015), immatriculée au registre du commerce et des sociétés de Paris sous le numéro
          d’identification 821 740 537 et dont le numéro de TVA intracommunautaire est
          FR88821740537 (la « <strong>Société</strong> »). Ladite plateforme est dédiée à la
          présentation aux utilisateurs du Site (le ou les « <strong>Utilisateurs</strong> ») des
          services de la Société.
        </p>
        <p className="mt-3 text-[14.5px] leading-relaxed">
          L’objet des présentes Conditions Générales d’Utilisation (les
          « <strong>Conditions</strong> » ou prises dans leur ensemble, le « <strong>Contrat</strong> »)
          est de définir les termes et les conditions régissant les relations entre les
          Utilisateurs et la Société. En cas de non-respect des termes des présentes Conditions, la
          Société se réserve le droit de prendre toute mesure de nature à préserver ses intérêts et
          notamment à en assurer l’exécution.
        </p>
        <p className="mt-3 text-[14.5px] leading-relaxed">
          L’Utilisateur s’engage lors de chacune de ses visites du Site à respecter l’ensemble des
          présentes Conditions sans aucune réserve. En conséquence, l’Utilisateur reconnait avoir
          pris connaissance des Conditions et accepte d’être lié par les présentes dispositions. Si
          l’Utilisateur accède au Site pour le compte d’une entreprise ou de toute autre entité
          juridique, il est néanmoins personnellement lié par le présent Contrat.
        </p>
      </section>

      <LegalSection id="art-1" title="Article 1 — Accès au Site">
        <p>
          Pour être éligible au Service (tel que ce terme est défini à l’article 2), l’Utilisateur
          doit être une personne physique ayant atteint l’âge de 18 ans et disposer de sa pleine
          capacité juridique.
        </p>
      </LegalSection>

      <LegalSection id="art-2" title="Article 2 — Fonctionnement du Site">
        <p>
          Le Site permet à l’Utilisateur d’accéder notamment aux services suivants (le ou les
          « <strong>Service(s)</strong> ») :
        </p>
        <LegalList>
          <li>consultation des articles, vidéos, magazines, conseils, informations publiés sur le
            Site et <em>newsletter</em> ; et</li>
          <li>souscription aux services de la Société.</li>
        </LegalList>
        <p>
          La souscription aux services de la Société, à savoir les Offres, est soumise aux{' '}
          <a href="/cgs" className="font-semibold text-[#C0112E] underline">Conditions Générales de Service</a>
          {' '}dont l’Utilisateur s’engage à prendre parfaite connaissance avant toute souscription.
        </p>
      </LegalSection>

      <LegalSection id="art-3" title="Article 3 — Utilisation des Services du Site">
        <LegalSubSection title="3.1 Droit d’accès au Site">
          <p>
            La Société, selon les présentes Conditions, accorde aux Utilisateurs un droit d’accès
            limité, révocable, non exclusif, non cessible aux Services à titre strictement
            personnel. Toute utilisation contraire du Site à sa finalité est strictement interdite
            et constitue un manquement aux présentes dispositions.
          </p>
          <p>
            L’utilisation du Site requiert une connexion et un navigateur internet. Afin de
            garantir un bon fonctionnement du Site, il est précisé que le Site est optimisé pour :
          </p>
          <LegalList>
            <li>une résolution d’écran de 1280×768 pixels ;</li>
            <li>les dernières versions des navigateurs Chrome, Firefox et Safari.</li>
          </LegalList>
          <p>
            Tous matériels et logiciels nécessaires à l’accès au Site et à l’utilisation des
            Services restent exclusivement à la charge de l’Utilisateur.
          </p>
          <p>
            La Société se réserve le droit notamment de suspendre ou de refuser un accès d’un ou
            plusieurs Utilisateurs au Site.
          </p>
        </LegalSubSection>
        <LegalSubSection title="3.2 Obligations des Utilisateurs">
          <p>Les Utilisateurs s’interdisent :</p>
          <ol className="mt-2 list-decimal space-y-2 pl-5 text-[14.5px]">
            <li>de transmettre, publier, distribuer, enregistrer ou détruire tout matériel, en
              particulier les contenus de la Société, en violation des lois ou règlementations en
              vigueur concernant la collecte, le traitement ou le transfert d’informations
              personnelles ;</li>
            <li>de diffuser des données, informations, ou contenus à caractère diffamatoire,
              injurieux, obscène, offensant, violent ou incitant à la violence, ou à caractère
              politique, raciste ou xénophobe et de manière générale tout contenu qui serait
              contraire aux lois et règlements en vigueur ou aux bonnes mœurs ;</li>
            <li>de référencer ou créer des liens vers tout contenu ou information disponible depuis
              les sites de la Société, sauf accord exprès, préalable et écrit de la Société ;</li>
            <li>d’utiliser des informations, contenus ou toutes données présentes sur le Site afin
              de proposer un service considéré, à l’entière discrétion de la Société, comme
              concurrentiel à la Société ;</li>
            <li>de vendre, échanger ou monnayer des informations, contenus ou toutes données
              présentes sur le Site ou Service proposé par le Site, sans l’accord exprès et écrit
              de la Société ;</li>
            <li>de pratiquer de l’ingénierie inversée (<em>Reverse Engineering</em>), décompiler,
              désassembler, déchiffrer ou autrement tenter d’obtenir le code source en relation
              avec toute propriété intellectuelle sous-jacente utilisée pour fournir tout ou partie
              des Services ;</li>
            <li>d’utiliser des logiciels ou appareils manuels ou automates, robots de codage ou
              autres moyens pour accéder, explorer, extraire ou indexer toute page du Site ;</li>
            <li>de mettre en danger ou essayer de mettre en danger la sécurité d’un site web de la
              Société. Cela comprend les tentatives de contrôler, scanner ou tester la
              vulnérabilité d’un système ou réseau ou de violer des mesures de sécurité ou
              d’authentification sans une autorisation préalable expresse ;</li>
            <li>de contrefaire ou d’utiliser les produits, les logos, les marques ou tout autre
              élément protégé par les droits de propriété intellectuelle de la Société ;</li>
            <li>de simuler l’apparence ou le fonctionnement du Site, en procédant par exemple à un
              effet miroir ;</li>
            <li>de perturber ou troubler, directement ou indirectement, la Société ou les Services,
              ou imposer une charge disproportionnée sur l’infrastructure du Site ou tenter de
              transmettre ou d’activer des virus informatiques via ou sur le Site.</li>
          </ol>
          <p className="mt-3">
            Il est rappelé que les violations de la sécurité du système ou du réseau peuvent
            conduire à des poursuites civiles et pénales. La Société vérifie l’absence de telle
            violation et peut faire appel aux autorités judiciaires pour poursuivre, le cas échéant,
            des Utilisateurs ayant participé à de telles violations.
          </p>
          <p>
            Les Utilisateurs s’engagent à utiliser le Site de manière loyale, conformément à sa
            finalité professionnelle et aux dispositions légales, règlementaires, aux présentes
            Conditions et aux usages en vigueur.
          </p>
        </LegalSubSection>
      </LegalSection>

      <LegalSection id="art-4" title="Article 4 — Utilisation du contenu du Site">
        <p>
          L’ensemble du contenu du Site, notamment les designs, textes, graphiques, images, vidéos,
          informations, logos, icônes-boutons, logiciels, fichiers audio et autres appartient à la
          Société, lequel est seul titulaire de l’intégralité des droits de propriété
          intellectuelle y afférents.
        </p>
        <p>
          Toute représentation et/ou reproduction et/ou exploitation partielle ou totale des
          contenus et Services proposés par la Société, par quelque procédé que ce soit, sans
          l’autorisation préalable et écrite de la Société, est strictement interdite et serait
          susceptible de donner lieu à des poursuites judiciaires.
        </p>
      </LegalSection>

      <LegalSection id="art-5" title="Article 5 — Données à caractère personnel">
        <LegalSubSection title="5.1 Données collectées">
          <p>
            Afin de permettre à tout Utilisateur de profiter pleinement des Services et
            fonctionnalités du Site, la Société collecte différentes données. Il est rappelé qu’en
            s’inscrivant sur le Site, l’Utilisateur accepte expressément que ces données soient
            collectées et cela quel que soit le pays à partir duquel il se connecte.
          </p>
          <p>Ces données sont collectées à différents moments et selon diverses méthodes :</p>
          <LegalList>
            <li>formulaire de contact et souscription aux services de la plateforme ;</li>
            <li><strong>Fichiers journaux et adresse de protocole internet (IP)</strong> : la Société
              reçoit à chaque connexion sur le Site, le lien du site depuis lequel l’Utilisateur
              est arrivé et celui vers lequel il se dirige lorsqu’il quitte le Site. La Société
              reçoit également l’adresse de protocole internet (IP) de l’Utilisateur ou encore
              certaines informations relatives au système d’exploitation de son ordinateur ou son
              navigateur internet ;</li>
            <li><strong>Cookies</strong> : la Société utilise des fichiers cookies qui peuvent être
              définis comme des fichiers textes susceptibles d’être enregistrés dans un terminal
              lors de la consultation d’un service en ligne avec un logiciel de navigation. Un
              fichier cookie permet à son émetteur, pendant sa durée de validité n’excédant pas
              13 mois, de reconnaître le terminal concerné à chaque fois que ce terminal accède à
              un contenu numérique comportant des cookies du même émetteur. Il est néanmoins
              possible de désactiver l’utilisation des cookies en modifiant les préférences de
              l’Utilisateur dans son navigateur internet. Dans ce cas, certaines fonctionnalités du
              Site sont susceptibles de ne plus fonctionner.</li>
          </LegalList>
        </LegalSubSection>
        <LegalSubSection title="5.2 Conservation des données collectées">
          <p>
            Les données à caractère personnel sont stockées par la Société sur ses serveurs, en vue
            de leur traitement dans le cadre de l’utilisation des Services. Elles sont conservées
            aussi longtemps que nécessaire pour l’apport des Services et fonctions offerts par le
            Site et au plus tard pendant 2 ans à compter de la fin de l’apport des Services. À
            l’issue de ce délai, les données collectées seront effacées par la Société et
            uniquement conservées à titre d’archive aux fins d’établissement de la preuve d’un
            droit ou d’un contrat qui peuvent être archivées conformément aux dispositions du code
            de commerce et du code de la consommation.
          </p>
          <p>
            L’Utilisateur reste toujours propriétaire des informations le concernant qu’il
            transmet à la Société. Il dispose, conformément à la loi n° 78-17 du 6 janvier 1978
            modifiée par la loi n° 2004-801 du 6 août 2004, d’un droit d’accès, de rectification et
            de suppression des données à caractère personnel le concernant, ainsi que du droit de
            s’opposer à la communication de ces données à des tiers pour de justes motifs.
          </p>
          <p>
            L’Utilisateur pourra exercer ses droits en écrivant à{' '}
            <a href="mailto:contact@major-ecn.fr" className="font-semibold text-[#C0112E] underline">contact@major-ecn.fr</a>
            {' '}ou à l’adresse postale : PAE Formation — 3, rue Rosa Bonheur à Paris (75007).
            Une réponse à la requête lui sera adressée dans un délai de 30 jours.
          </p>
        </LegalSubSection>
        <LegalSubSection title="5.3 Finalités de la collecte">
          <p>
            Les données personnelles sont collectées auprès des Utilisateurs afin (i) de permettre
            à l’Utilisateur de profiter pleinement des Services et des fonctions proposés par le
            Site, (ii) de prévenir toute fraude, (iii) à des fins statistiques et (iv) l’envoi de
            <em> newsletter</em> commerciale.
          </p>
          <p>
            L’Utilisateur a la possibilité de se désinscrire à tout moment de la <em>newsletter</em>
            {' '}en complétant le formulaire prévu à cet effet dans ladite <em>newsletter</em>.
          </p>
          <p>
            Ces données peuvent être communiquées par la Société à tout tiers chargés de
            l’exécution, du traitement et de la gestion des Services. Toutefois, dans différentes
            hypothèses, la Société sera susceptible de divulguer ou partager les données
            personnelles d’un Utilisateur à tous autres tiers, parmi lesquelles :
          </p>
          <LegalList>
            <li>avec le consentement de l’Utilisateur ;</li>
            <li>afin de se conformer à la loi, la règlementation en vigueur, à toute procédure
              judiciaire, aux décisions de justice ou à tout autre cas de divulgation obligatoire ;
              ou</li>
            <li>pour protéger les droits, la propriété ou la sécurité du Site, de ses membres ou du
              public.</li>
          </LegalList>
        </LegalSubSection>
      </LegalSection>

      <LegalSection id="art-6" title="Article 6 — Responsabilité">
        <LegalSubSection title="6.1 Les données transmises par l’Utilisateur">
          <p>
            La Société ne contrôle pas l’exactitude du contenu généré par les Utilisateurs ; en
            conséquence, la Société ne donne aucune garantie sur la teneur de ce contenu et ne
            saurait en aucun cas être tenue responsable au titre de ce contenu. Seul l’Utilisateur,
            à l’exclusion de la Société, est responsable de toutes données et informations le
            concernant qu’il a fourni, que ces données soient accessibles ou non du public, et plus
            généralement, l’Utilisateur est seul responsable de l’utilisation qu’il fait du Site.
          </p>
          <p>
            La Société ne garantit pas que l’utilisation, par l’Utilisateur, du Site n’enfreindra
            pas les droits des tiers.
          </p>
        </LegalSubSection>
        <LegalSubSection title="6.2 Les données et informations contenues">
          <p>
            Les conseils et informations relatifs à la préparation à l’examen et toute autre donnée
            affichée sur le Site n’ont pas vocation à constituer des conseils sur la foi desquels
            une décision pourrait être prise par l’Utilisateur.
          </p>
          <p>
            L’Utilisateur ne doit en aucun cas considérer comme acquises lesdites informations et
            données du Site mais devra vérifier indépendamment par lui-même toutes ces informations
            et données. La Société décline toute responsabilité quant à la foi placée par tout
            Utilisateur du Site dans ces données et informations, ou par toute personne pouvant
            être informée de ces données et informations.
          </p>
          <p>
            En tout état de cause, la Société ne saurait être responsable des conséquences de
            l’utilisation des données et informations contenues sur le Site. L’Utilisateur demeure
            l’entier et seul responsable de l’utilisation desdites données et informations.
          </p>
        </LegalSubSection>
        <LegalSubSection title="6.3 Dispositions générales">
          <p>
            Il est rappelé que les données publiées par les Utilisateurs et les informations
            partagées par ces derniers peuvent être captées et exploitées par d’autres Utilisateurs
            ou des tiers. En ce sens, la Société ne garantit pas le respect de la propriété de ces
            données ; il incombe à l’Utilisateur de prendre l’ensemble des dispositions nécessaires
            afin que soit préservée la propriété de ses données.
          </p>
          <p>
            La Société ne garantit pas le fonctionnement sans interruption ou sans erreur des
            Services ; en particulier, la responsabilité de la Société ne saurait être engagée en
            cas d’interruption d’accès au Site en raison d’opérations de maintenance, de mises à
            jour ou d’améliorations techniques.
          </p>
          <p>
            En tout état de cause, la Société ne saurait en aucune circonstance être responsable au
            titre des pertes ou dommages indirects ou imprévisibles de l’Utilisateur ou de tout
            tiers, ce qui inclut notamment tout gain manqué, tout investissement malheureux,
            inexactitude ou corruption de fichiers ou données, préjudice d’image ou commercial,
            perte de chiffre d’affaires ou bénéfice, perte de clientèle ou perte de chance lié à
            quelque titre et sur quelque fondement que ce soit.
          </p>
          <p>
            En outre, la Société ne saurait être responsable de tout retard ou inexécution du
            présent Contrat justifié par un cas de force majeure, telle qu’elle est définie par la
            jurisprudence des cours et tribunaux français.
          </p>
        </LegalSubSection>
      </LegalSection>

      <LegalSection id="art-7" title="Article 7 — Convention de preuve">
        <p>
          Les systèmes et fichiers informatiques font foi dans les rapports entre la Société et
          l’Utilisateur.
        </p>
        <p>
          Ainsi, la Société pourra valablement produire dans le cadre de toute procédure, aux fins
          de preuve les données, fichiers, programmes, enregistrements ou autres éléments, reçus,
          émis ou conservés au moyen des systèmes informatiques exploités par la Société, sur tous
          supports numériques ou analogiques, et s’en prévaloir sauf erreur manifeste.
        </p>
      </LegalSection>

      <LegalSection id="art-8" title="Article 8 — Indivisibilité">
        <p>
          Le fait que l’une quelconque des dispositions du Contrat soit ou devienne illégale ou
          inapplicable n’affectera en aucune façon la validité ou l’applicabilité des autres
          stipulations du Contrat.
        </p>
      </LegalSection>

      <LegalSection id="art-9" title="Article 9 — Règlement des différends">
        <p>
          La conclusion, l’interprétation et la validité du présent Contrat sont régies par la loi
          française, quel que soit le pays d’origine de l’Utilisateur ou le pays depuis lequel
          l’Utilisateur accède à la Société et nonobstant les principes de conflits de lois.
        </p>
        <p>
          Dans l’hypothèse où un différend portant sur la validité, l’exécution ou l’interprétation
          du présent Contrat serait porté devant les juridictions civiles, il sera soumis à la
          compétence exclusive des tribunaux français auxquels il est fait expressément attribution
          de compétence, même en cas de référé ou de pluralité de défendeurs.
        </p>
        <p>
          L’Utilisateur est informé qu’il peut en tout état de cause recourir à une médiation
          conventionnelle ou à tout mode alternatif de règlement des différends (conciliation par
          exemple) en cas de contestation.
        </p>
        <p>
          Conformément à l’article 14.1 du règlement (UE) n°524/2013 du parlement européen et du
          conseil du 21 mai 2013, il est précisé à l’Utilisateur qu’il peut consulter la page
          suivante pour avoir plus d’informations sur ses démarches en cas de contestation :{' '}
          <a
            href="https://consumer-redress.ec.europa.eu/site-relocation_en"
            target="_blank" rel="noopener noreferrer"
            className="font-semibold text-[#C0112E] underline break-all"
          >
            https://consumer-redress.ec.europa.eu/site-relocation_en
          </a>.
        </p>
        <p>
          En outre, l’Utilisateur pourra contacter, sans frais, la Société à l’adresse électronique
          suivante :{' '}
          <a href="mailto:contact@major-ecn.fr" className="font-semibold text-[#C0112E] underline">contact@major-ecn.fr</a>
          {' '}ou par téléphone (prix d’un appel local) :{' '}
          <a href="tel:+33147343571" className="font-semibold text-[#C0112E] underline">01.47.34.35.71</a>.
        </p>
        <p>
          Conformément aux dispositions légales concernant le règlement amiable des litiges, la
          Société adhère au service du médiateur de la consommation de SAS Médiation dont les
          coordonnées sont les suivantes : 222, chemin de la Bergerie à St. Jean de Niost (01800) —{' '}
          <a
            href="http://www.sasmediationsolution-conso.fr/" target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#C0112E] underline break-all"
          >
            sasmediationsolution-conso.fr
          </a>. Après démarche préalable écrite de l’Utilisateur ayant la qualité de consommateur au
          sens du code de la consommation auprès de la Société, le service du médiateur précité
          peut être saisi pour tout litige de consommation dont le règlement n’aurait pas abouti.
        </p>
      </LegalSection>

      <LegalSection id="mentions-legales" title="Mentions légales">
        <p><strong>PAE Formation</strong></p>
        <p>Société par actions simplifiée au capital de 100 euros</p>
        <p>Siège social : 3, rue Rosa Bonheur — Paris (75007)</p>
        <p>821 740 537 R.C.S Paris</p>
        <p>Téléphone : 01.47.34.35.71</p>
        <p>Directeur de publication : A. Bonan</p>
        <p>Le site est hébergé par : OVH SAS — +33 9 72 10 10 07</p>
      </LegalSection>
    </LegalShell>
  );
}
