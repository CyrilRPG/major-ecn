import {
  LegalShell, LegalSection, LegalSubSection, LegalList, LegalInfoBox,
} from '@/components/marketing/legal-shell';

export const metadata = {
  title: 'Conditions Générales d’Utilisation — Major ECN',
  description:
    "Conditions Générales d’Utilisation et de Vente de la plateforme Major ECN : description du service, paiement, droit de rétractation, responsabilité.",
};

const TOC = [
  { id: 'objet',                 label: 'Objet' },
  { id: 'definitions',           label: 'Définitions' },
  { id: 'inscription',           label: 'Inscription et compte' },
  { id: 'description-service',   label: 'Description du Service' },
  { id: 'tarifs-paiement',       label: 'Tarifs et paiement' },
  { id: 'paiement-plusieurs-fois', label: 'Paiement en plusieurs fois' },
  { id: 'retractation',          label: 'Droit de rétractation' },
  { id: 'duree-acces',           label: 'Durée d’accès' },
  { id: 'obligations-utilisateur', label: 'Obligations de l’utilisateur' },
  { id: 'propriete-intellectuelle', label: 'Propriété intellectuelle' },
  { id: 'responsabilite',        label: 'Responsabilité' },
  { id: 'suspension-resiliation', label: 'Suspension et résiliation' },
  { id: 'donnees-personnelles',  label: 'Données personnelles' },
  { id: 'modifications-cgu',     label: 'Modification des CGU' },
  { id: 'litiges-mediation',     label: 'Litiges et médiation' },
  { id: 'loi-applicable',        label: 'Loi applicable' },
];

export default function CGUPage() {
  return (
    <LegalShell
      title="Conditions Générales d’Utilisation et de Vente"
      subtitle="Les présentes Conditions Générales régissent l’utilisation de la plateforme Major ECN et l’achat de nos formules de préparation aux EVC."
      lastUpdated="9 juin 2026"
      toc={TOC}
    >
      <p className="text-[15px] leading-relaxed">
        Les présentes Conditions Générales d’Utilisation et de Vente
        (ci-après les « <strong>CGU</strong> ») constituent un contrat
        entre <strong>Major ECN</strong> (ci-après « <strong>nous</strong> »,
        « <strong>Major ECN</strong> ») et toute personne accédant à la
        plateforme major-ecn.fr (ci-après « <strong>vous</strong> », « <strong>l’Utilisateur</strong> »).
      </p>
      <p className="text-[15px] leading-relaxed">
        L’utilisation du Service implique l’acceptation pleine et
        entière des présentes CGU.
      </p>

      <LegalSection id="objet" title="1. Objet">
        <p>
          Les présentes CGU ont pour objet de définir les modalités et
          conditions d’accès et d’utilisation de la plateforme Major ECN,
          ainsi que les conditions d’achat des formules de préparation
          aux Épreuves de Vérification des Connaissances (EVC) dans le
          cadre de la Procédure d’Autorisation d’Exercice (PAE).
        </p>
      </LegalSection>

      <LegalSection id="definitions" title="2. Définitions">
        <LegalList>
          <li>
            <strong>Service</strong> : la plateforme pédagogique en ligne
            Major ECN, accessible à l’adresse major-ecn.fr, incluant
            l’ensemble des fonctionnalités, contenus et ressources mis
            à disposition.
          </li>
          <li>
            <strong>Utilisateur</strong> : toute personne physique
            accédant au Service, qu’elle soit inscrite ou non.
          </li>
          <li>
            <strong>Compte</strong> : espace personnel créé par
            l’Utilisateur permettant d’accéder au Service.
          </li>
          <li>
            <strong>Formule</strong> : offre commerciale (Essentielle,
            Intensive, Programme Approfondi) souscrite par l’Utilisateur.
          </li>
          <li>
            <strong>Contenus</strong> : ensemble des QCM, fiches,
            flashcards, cas cliniques, vidéos et autres ressources
            pédagogiques mises à disposition.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection id="inscription" title="3. Inscription et compte">
        <LegalSubSection title="3.1 Conditions d’inscription">
          <p>
            L’inscription au Service est ouverte aux personnes physiques
            majeures (18 ans révolus), capables juridiquement de
            contracter, exerçant ou se destinant à exercer une profession
            médicale, pharmaceutique ou maïeutique.
          </p>
        </LegalSubSection>
        <LegalSubSection title="3.2 Création du compte">
          <p>
            L’inscription nécessite la fourniture d’informations exactes
            (nom, prénom, email, etc.). Vous êtes seul responsable de
            l’exactitude des informations communiquées.
          </p>
        </LegalSubSection>
        <LegalSubSection title="3.3 Confidentialité des identifiants">
          <p>
            Vos identifiants de connexion sont strictement personnels et
            confidentiels. Vous vous engagez à ne pas les communiquer
            à des tiers et à informer Major ECN sans délai en cas
            d’utilisation frauduleuse de votre compte.
          </p>
        </LegalSubSection>
      </LegalSection>

      <LegalSection id="description-service" title="4. Description du Service">
        <p>
          Major ECN propose une plateforme de préparation aux EVC (PAE)
          comprenant, selon la Formule souscrite :
        </p>
        <LegalList>
          <li>Une banque de QCM corrigés et justifiés</li>
          <li>Des fiches pédagogiques synthétiques</li>
          <li>Des flashcards adaptatives</li>
          <li>Des cas cliniques et dossiers progressifs</li>
          <li>Des annales d’épreuves passées avec corrigés</li>
          <li>Une méthodologie de préparation aux épreuves</li>
          <li>Un suivi personnalisé de progression</li>
          <li>Selon la Formule : sessions live, accompagnement individuel, épreuves blanches</li>
        </LegalList>
        <p>
          La composition exacte de chaque Formule est détaillée sur les
          pages dédiées du site avant tout achat.
        </p>
      </LegalSection>

      <LegalSection id="tarifs-paiement" title="5. Tarifs et paiement">
        <LegalSubSection title="5.1 Tarifs">
          <p>
            Les tarifs des Formules sont indiqués en euros, toutes taxes
            comprises (TTC), sur les pages tarifs et formules du site.
            Major ECN se réserve le droit de modifier ses tarifs à tout
            moment ; les modifications ne s’appliqueront pas aux Formules
            déjà souscrites.
          </p>
        </LegalSubSection>
        <LegalSubSection title="5.2 Modalités de paiement">
          <p>
            Le paiement s’effectue en ligne par carte bancaire via notre
            prestataire <strong>Stripe</strong>, certifié PCI-DSS. Les
            cartes acceptées sont Visa, Mastercard et American Express.
          </p>
          <p>
            Major ECN ne stocke aucune donnée bancaire sur ses serveurs.
            Toutes les transactions sont sécurisées par chiffrement SSL.
          </p>
        </LegalSubSection>
        <LegalSubSection title="5.3 Facturation">
          <p>
            Une facture est émise à chaque paiement et envoyée par email.
            Vous pouvez également la consulter à tout moment depuis votre
            espace personnel.
          </p>
        </LegalSubSection>
      </LegalSection>

      <LegalSection id="paiement-plusieurs-fois" title="6. Paiement en plusieurs fois">
        <p>
          Major ECN propose un paiement en plusieurs fois sans frais
          (3 ou 4 fois) pour les Formules éligibles, via le service
          d’échelonnement proposé par Stripe.
        </p>
        <LegalList>
          <li>
            Ce paiement échelonné est soumis à l’acceptation de votre
            établissement bancaire (carte éligible : Visa / Mastercard).
          </li>
          <li>
            Le premier prélèvement intervient au moment de la commande.
            Les suivants sont prélevés chaque mois à la même date.
          </li>
          <li>
            En cas d’incident de paiement, l’accès au Service peut être
            suspendu jusqu’à régularisation.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection id="retractation" title="7. Droit de rétractation">
        <LegalInfoBox title="Important">
          <p>
            Conformément à l’article L. 221-18 du Code de la consommation,
            vous disposez d’un délai de <strong>14 jours</strong> à compter
            de la souscription pour exercer votre droit de rétractation,
            <em> sans avoir à justifier de motifs ni à payer de pénalités</em>.
          </p>
        </LegalInfoBox>
        <LegalSubSection title="7.1 Modalités de rétractation">
          <p>
            Pour exercer ce droit, adressez-nous votre demande par email
            à <a href="mailto:contact@major-ecn.fr" className="font-semibold text-[#C0112E] underline">contact@major-ecn.fr</a> en précisant
            votre nom, prénom, email d’inscription et formule souscrite.
          </p>
          <p>
            Le remboursement sera effectué dans un délai maximum de 14 jours
            suivant réception de votre demande, sur le moyen de paiement
            utilisé lors de la commande.
          </p>
        </LegalSubSection>
        <LegalSubSection title="7.2 Exception (renonciation expresse)">
          <p>
            Si vous demandez expressément un accès immédiat au Service avant
            l’expiration du délai de rétractation et que vous l’utilisez
            substantiellement (consultation de la majorité des contenus
            pédagogiques), vous reconnaissez perdre votre droit de
            rétractation, conformément à l’article L. 221-28 13° du Code
            de la consommation.
          </p>
        </LegalSubSection>
      </LegalSection>

      <LegalSection id="duree-acces" title="8. Durée d’accès">
        <p>
          L’accès au Service est consenti pour la durée indiquée lors de
          la souscription (généralement jusqu’à la session des EVC suivant
          votre achat). À l’issue de cette période, l’accès est désactivé
          mais le compte est conservé pour permettre une éventuelle
          réinscription.
        </p>
      </LegalSection>

      <LegalSection id="obligations-utilisateur" title="9. Obligations de l’Utilisateur">
        <p>L’Utilisateur s’engage à :</p>
        <LegalList>
          <li>Utiliser le Service dans le respect des présentes CGU et de la loi</li>
          <li>Ne pas créer plusieurs comptes ni partager ses identifiants</li>
          <li>Ne pas reproduire, copier, vendre, redistribuer les Contenus</li>
          <li>Ne pas tenter de contourner les mesures de sécurité du Service</li>
          <li>Ne pas utiliser le Service à des fins illégales ou frauduleuses</li>
          <li>Ne pas perturber le fonctionnement du Service</li>
          <li>Tenir à jour ses informations personnelles</li>
        </LegalList>
        <p>
          Le non-respect de ces obligations peut entraîner la suspension
          ou la résiliation du compte sans préavis ni remboursement.
        </p>
      </LegalSection>

      <LegalSection id="propriete-intellectuelle" title="10. Propriété intellectuelle">
        <p>
          L’ensemble des éléments du Service (textes, images, logos, vidéos,
          QCM, fiches, flashcards, code source, design, marques) sont la
          propriété exclusive de Major ECN ou de ses partenaires et sont
          protégés par les lois françaises et internationales relatives à
          la propriété intellectuelle.
        </p>
        <p>
          La souscription à une Formule vous accorde un droit d’accès et
          d’utilisation strictement <strong>personnel et non transférable</strong> aux
          Contenus, pendant la durée de votre abonnement, à des fins
          exclusivement pédagogiques et personnelles.
        </p>
        <p>
          Toute reproduction, représentation, modification, publication,
          adaptation, vente ou redistribution des Contenus, par quelque
          moyen que ce soit, est strictement interdite sans autorisation
          écrite préalable de Major ECN et constitue une contrefaçon
          sanctionnée par les articles L. 335-2 et suivants du Code de la
          propriété intellectuelle.
        </p>
      </LegalSection>

      <LegalSection id="responsabilite" title="11. Limitation de responsabilité">
        <p>
          Major ECN met tout en œuvre pour fournir un Service de qualité
          et des Contenus actualisés conformément aux référentiels EVC en
          vigueur. Toutefois :
        </p>
        <LegalList>
          <li>
            Major ECN ne garantit aucun résultat aux épreuves. La réussite
            dépend du travail personnel de chaque Utilisateur.
          </li>
          <li>
            Major ECN ne saurait être tenu responsable des modifications
            apportées aux programmes ou modalités des EVC par les autorités
            de tutelle.
          </li>
          <li>
            Major ECN n’est pas responsable des interruptions temporaires
            du Service liées à la maintenance, à des cas de force majeure,
            ou à des défaillances des sous-traitants techniques.
          </li>
          <li>
            La responsabilité de Major ECN est, en toute hypothèse, limitée
            au montant des sommes effectivement payées par l’Utilisateur
            au cours des 12 mois précédant le fait générateur.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection id="suspension-resiliation" title="12. Suspension et résiliation">
        <p>
          Major ECN se réserve le droit de suspendre ou résilier l’accès
          d’un Utilisateur, sans préavis ni indemnité, en cas de :
        </p>
        <LegalList>
          <li>Violation manifeste des présentes CGU</li>
          <li>Fraude ou tentative de fraude</li>
          <li>Partage de compte ou de Contenus</li>
          <li>Impayé persistant</li>
          <li>Comportement portant atteinte à l’image de Major ECN</li>
        </LegalList>
        <p>
          Vous pouvez résilier votre compte à tout moment en nous
          contactant à contact@major-ecn.fr. Aucun remboursement n’est dû
          pour les périodes consommées, sauf dans le cadre du droit de
          rétractation (cf. article 7).
        </p>
      </LegalSection>

      <LegalSection id="donnees-personnelles" title="13. Données personnelles">
        <p>
          Le traitement de vos données personnelles est régi par notre{' '}
          <a href="/confidentialite" className="font-semibold text-[#C0112E] underline">
            Politique de confidentialité
          </a>, qui fait partie intégrante des présentes CGU.
        </p>
      </LegalSection>

      <LegalSection id="modifications-cgu" title="14. Modification des CGU">
        <p>
          Major ECN se réserve le droit de modifier les présentes CGU à
          tout moment. Les utilisateurs en seront informés par email
          et/ou par notification sur le site. Les nouvelles CGU entreront
          en vigueur 30 jours après leur publication, sauf pour les
          modifications imposées par la loi qui entrent en vigueur
          immédiatement.
        </p>
        <p>
          En cas de désaccord avec les nouvelles CGU, l’Utilisateur peut
          résilier son compte sans pénalité.
        </p>
      </LegalSection>

      <LegalSection id="litiges-mediation" title="15. Litiges et médiation">
        <p>
          En cas de litige, l’Utilisateur s’engage à contacter en priorité
          Major ECN à contact@major-ecn.fr pour rechercher une solution
          amiable.
        </p>
        <p>
          À défaut d’accord amiable, l’Utilisateur consommateur peut
          recourir gratuitement à un médiateur de la consommation, en
          application de l’article L. 612-1 du Code de la consommation.
        </p>
        <LegalInfoBox title="Médiateur de la consommation">
          <p>
            Plateforme européenne de Règlement en Ligne des Litiges :{' '}
            <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#C0112E] underline">
              ec.europa.eu/consumers/odr
            </a>
          </p>
        </LegalInfoBox>
      </LegalSection>

      <LegalSection id="loi-applicable" title="16. Loi applicable et juridiction">
        <p>
          Les présentes CGU sont soumises au droit français. Tout litige
          relatif à leur interprétation et/ou à leur exécution relève de
          la compétence des juridictions françaises, sauf dispositions
          d’ordre public contraires applicables au consommateur.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
