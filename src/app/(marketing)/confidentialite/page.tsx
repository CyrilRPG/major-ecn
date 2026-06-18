import {
  LegalShell, LegalSection, LegalList,
} from '@/components/marketing/legal-shell';

export const metadata = {
  alternates: { canonical: '/confidentialite' },
  title: 'Politique de confidentialité — Major ECN',
  description:
    "Politique de confidentialité de la plateforme Major ECN (PAE Formation) : informations collectées, conservation, utilisation, droits RGPD, sécurité.",
};

const TOC = [
  { id: 'preambule',         label: 'Préambule' },
  { id: 'informations',      label: '1. Les informations collectées' },
  { id: 'conservation',      label: '2. Conservation des informations' },
  { id: 'utilisation',       label: '3. Utilisation des informations' },
  { id: 'obligations',       label: '4. Vos obligations' },
  { id: 'mineurs',           label: '5. Protection des mineurs' },
  { id: 'securite',          label: '6. Sécurité' },
  { id: 'modification',      label: '7. Modification de la Politique' },
  { id: 'contact',           label: '8. Contact' },
];

export default function ConfidentialitePage() {
  return (
    <LegalShell
      title="Politique de Confidentialité"
      subtitle="Comment Major ECN (PAE Formation) collecte, utilise et protège vos données personnelles."
      lastUpdated="14 juin 2026"
      toc={TOC}
      pdfHref="/legal/politique-confidentialite.pdf"
    >
      <section id="preambule" className="scroll-mt-24 pb-6 text-[14.5px] leading-relaxed">
        <p>
          Major ECN est une plateforme web, accessible à l’adresse{' '}
          <a href="https://www.major-ecn.fr" className="font-semibold text-[#C0112E] underline">www.major-ecn.fr</a>
          {' '}(la « <strong>Plateforme</strong> ») exploitée par PAE Formation, société par actions
          simplifiée au capital social de 100 euros, ayant son siège social situé 3, rue Rosa
          Bonheur à Paris (75015), immatriculée au registre du commerce et des sociétés de Paris
          sous le numéro d’identification 821 740 537 et dont le numéro de TVA intracommunautaire
          est FR88821740537 (la « <strong>Société</strong> »).
        </p>
        <p className="mt-3">
          Les utilisateurs de la Plateforme (le ou les « <strong>Utilisateur(s)</strong> ») ont la
          possibilité d’accéder à différents services parmi lesquels le suivi d’une formation
          d’enseignement en ligne (le ou les « <strong>Service(s)</strong> »).
        </p>
        <p className="mt-3">
          Devenir un Utilisateur de la Plateforme implique une collecte d’informations. Dans ce
          contexte, la protection de vos données constitue une priorité absolue pour la Société.
          Ainsi, afin de préserver votre confiance, la Société a adopté la présente Politique de
          Confidentialité.
        </p>
        <p className="mt-3">
          L’ensemble de ces informations sont traitées conformément à la présente Politique de
          Confidentialité et sont soumises à nos{' '}
          <a href="/cgu" className="font-semibold text-[#C0112E] underline">Conditions Générales d’Utilisation</a>.
        </p>
      </section>

      <LegalSection id="informations" title="1. Les informations collectées">
        <p>
          Afin de permettre aux Utilisateurs de profiter pleinement des Services et fonctionnalités
          de la Plateforme, la Société collecte différentes informations. Il est rappelé qu’en vous
          inscrivant sur la Plateforme, vous acceptez expressément que ces informations soient
          collectées et cela quel que soit le pays à partir duquel vous vous connectez. Par
          ailleurs, le fait que vous communiquiez des données à la Société est une démarche
          entièrement volontaire de votre part. Vous avez la possibilité de vous y opposer à tout
          moment, conformément aux Conditions Générales d’Utilisation de la Plateforme et à la
          présente Politique de Confidentialité, en modifiant vos paramètres ou en résiliant votre
          compte, sachant que le retrait de votre consentement n’opère pas rétroactivement.
        </p>
        <p>Ces informations sont collectées à différents moments et selon diverses méthodes :</p>
        <p className="mt-3 italic">Informations collectées</p>
        <LegalList>
          <li><strong>Informations fournies lors de l’inscription</strong> : pour devenir Utilisateur, vous devez fournir des informations personnelles, telles que votre nom, prénom et mail. Sans ce minimum d’informations, il n’est pas possible de créer un compte.</li>
          <li><strong>Informations fournies lors de la souscription</strong> : nom, prénom, mail, adresse de domicile, copie de pièces d’identité et diplôme.</li>
        </LegalList>
        <p className="mt-3 italic">Utilisation de la Plateforme</p>
        <p>
          Lors de votre utilisation de la Plateforme, les serveurs de la Société enregistrent
          automatiquement les informations créées et échangées en utilisant nos Services. À titre
          d’exemple, la Société a connaissance de l’ensemble de vos informations de sessions
          (quelle page avez-vous visité sur la Plateforme, quelles données ont été saisies…).
        </p>
        <p className="mt-3 italic">Fichiers journaux, adresse de protocole internet (IP) et informations concernant votre ordinateur</p>
        <p>
          La Société reçoit, lorsque vous vous connectez à la Plateforme, le lien du site depuis
          lequel vous êtes arrivé et celui vers lequel vous vous dirigez lorsque vous quittez la
          Plateforme.
        </p>
        <p>
          La Société reçoit également votre adresse de protocole internet (IP) ou encore certaines
          informations relatives au système d’exploitation de votre ordinateur ou son navigateur
          internet.
        </p>
        <p className="mt-3 italic">Cookies</p>
        <p>
          La Société, à l’instar de la très grande majorité des sites internet, utilise des
          cookies. Les cookies sont des petits fichiers de données stockés sur le disque dur de
          votre ordinateur permettant de vous identifier en tant qu’Utilisateur lors de vos
          connexions à la Plateforme. Ils vous évitent, par exemple, de saisir votre mot de passe à
          chaque connexion sur la Plateforme. Il vous est néanmoins possible de désactiver
          l’utilisation des cookies en modifiant vos préférences dans votre navigateur internet.
          Dans ce cas, certaines fonctionnalités de la Plateforme sont susceptibles de ne plus
          fonctionner.
        </p>
      </LegalSection>

      <LegalSection id="conservation" title="2. Conservation des informations collectées">
        <p>
          Une fois collectées, ces informations sont stockées dans les serveurs de la Société ou de
          tout sous-traitant de la Société en vue de leur traitement dans le cadre de l’utilisation
          des Services. Elles sont conservées tant que vous disposez d’un compte membre sur la
          Plateforme. En cas d’inactivité de votre compte membre pendant une durée de 2 ans, les
          données de votre compte membre seront automatiquement supprimées.
        </p>
        <p>Il est à noter que les cookies ont, quant à eux, une durée de validité n’excédant pas 13 mois.</p>
        <p>
          Afin d’assurer le meilleur fonctionnement des services et fonctionnalités de la
          Plateforme, il est recommandé aux Utilisateurs de mettre à jour régulièrement les
          informations figurant dans leur Profil et, en conséquence, de corriger ou supprimer toute
          information inexacte.
        </p>
        <p>
          Vous restez toujours propriétaire des informations vous concernant que vous transmettez
          sur la Plateforme. En ce sens, vous disposez, conformément à la loi n° 78-17 du 6 janvier
          1978 modifiée par la loi n° 2004-801 du 6 août 2004 et du Règlement UE 2016/679 du
          27 avril 2016, d’un droit d’accès, de rectification, de limitation de traitement et/ou
          d’effacement des données à caractère personnel vous concernant, ainsi que du droit de
          vous opposer audit traitement et du droit à la portabilité des données à caractère
          personnel. Pour exercer vos droits, veuillez écrire à{' '}
          <a href="mailto:contact@major-ecn.fr" className="font-semibold text-[#C0112E] underline">contact@major-ecn.fr</a>
          {' '}ou à l’adresse postale : PAE Formation — 3, rue Rosa Bonheur à Paris (75007).
        </p>
        <p>Une réponse à votre requête vous sera adressée dans un délai de 30 jours.</p>
        <p>Vous conservez le droit de déposer une réclamation pour atteinte à la protection de vos données, auprès de la CNIL.</p>
      </LegalSection>

      <LegalSection id="utilisation" title="3. Utilisation des informations collectées">
        <p>
          Les informations collectées sont utilisées afin de vous permettre d’utiliser les
          différents Services proposés sur la Plateforme. En créant votre compte, vous acceptez de
          manière volontaire et expresse les Conditions Générales d’Utilisation de la Plateforme et
          la présente Politique de Confidentialité qui autorisent la Société à traiter vos données.
        </p>
        <p>
          Parce que la protection de vos données personnelles est essentielle, la Société s’engage
          à ne pas vendre, ni louer, ni fournir de quelque manière que ce soit vos informations
          personnelles, sauf dans les conditions décrites dans la présente Politique de
          Confidentialité et dans les Conditions Générales d’Utilisation de la Plateforme.
          Toutefois, dans différentes hypothèses la Société sera susceptible de divulguer ou
          partager vos informations personnelles à des tiers, parmi lesquelles :
        </p>
        <LegalList>
          <li>avec votre consentement explicite ou implicite ;</li>
          <li>afin de se conformer à la loi, la règlementation en vigueur, à toute procédure judiciaire, aux décisions de justice ou à tout autre cas de divulgation obligatoire ;</li>
          <li>pour protéger les droits, la propriété ou la sécurité de la Plateforme, de ses membres ou du public ;</li>
          <li>dans le cadre de la fourniture des différents Services et fonctionnalités proposés par la Plateforme, mais uniquement lorsque cela est nécessaire à l’exécution de ses opérations et à la fourniture de ces services et fonctionnalités.</li>
        </LegalList>
      </LegalSection>

      <LegalSection id="obligations" title="4. Vos obligations">
        <p>
          En tant qu’Utilisateur de la Plateforme, vous êtes tenus de respecter, outre les
          obligations légales et réglementaires, les obligations issues de la présente Politique de
          Confidentialité et des Conditions Générales d’Utilisation de la Plateforme.
        </p>
        <p>
          La Société appelle par ailleurs à votre responsabilité étant entendu que les Utilisateurs
          sont seuls responsables des informations et contenus, y compris les informations
          concernant la race, l’origine ethnique, l’orientation sexuelle, les opinions politiques,
          les croyances religieuses ou philosophiques, l’adhésion à un syndicat ou toute
          information relative à la santé, qu’ils communiquent.
        </p>
      </LegalSection>

      <LegalSection id="mineurs" title="5. Protection des mineurs">
        <p>Afin de protéger les mineurs, l’Utilisateur doit avoir atteint l’âge de 18 ans et disposer de sa pleine capacité juridique.</p>
      </LegalSection>

      <LegalSection id="securite" title="6. Sécurité">
        <p>
          Afin d’assurer la protection de vos informations personnelles, l’accès à votre compte est
          protégé par un mot de passe que vous devez tenir confidentiel. En cas d’utilisation non
          autorisée de votre compte ou de toute atteinte à la confidentialité et à la sécurité de
          ses moyens d’identification, vous devez en informer sans délai la Société.
        </p>
        <p>
          La Société prend toutes les mesures raisonnables afin de protéger les informations contre
          toute perte, utilisation à mauvais escient et contre tout accès, divulgation,
          modification et destruction non autorisée. Différentes procédures physiques et
          électroniques ont été mises en place afin d’assurer la protection de vos données
          personnelles.
        </p>
      </LegalSection>

      <LegalSection id="modification" title="7. Modification de la Politique de Confidentialité">
        <p>
          La Société se réserve le droit de modifier, compléter ou remplacer les dispositions de la
          présente Politique de Confidentialité. En cas de modification importante, la Société
          s’engage à afficher, sur la Plateforme, une notification relative à la modification de la
          Politique de Confidentialité.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="8. Contact">
        <p>
          Pour toutes questions, observations, suggestions ou réclamations, veuillez contacter PAE
          Formation — 3, rue Rosa Bonheur à Paris (75007), par mail —{' '}
          <a href="mailto:contact@major-ecn.fr" className="font-semibold text-[#C0112E] underline">contact@major-ecn.fr</a>.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
