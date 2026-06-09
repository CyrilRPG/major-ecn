import {
  LegalShell, LegalSection, LegalSubSection, LegalList, LegalInfoBox,
} from '@/components/marketing/legal-shell';

export const metadata = {
  title: 'Politique de confidentialité — Major ECN',
  description:
    "Politique de confidentialité de Major ECN : collecte, utilisation et protection de vos données personnelles, conforme au RGPD.",
};

const TOC = [
  { id: 'identite-responsable', label: "Identité du responsable" },
  { id: 'donnees-collectees',  label: 'Données collectées' },
  { id: 'finalites',            label: 'Finalités du traitement' },
  { id: 'base-legale',          label: 'Base légale du traitement' },
  { id: 'destinataires',        label: 'Destinataires des données' },
  { id: 'transferts',           label: 'Transferts hors UE' },
  { id: 'duree-conservation',   label: 'Durée de conservation' },
  { id: 'droits',               label: 'Vos droits (RGPD)' },
  { id: 'cookies',              label: 'Cookies et traceurs' },
  { id: 'securite',             label: 'Sécurité' },
  { id: 'mineurs',              label: 'Données des mineurs' },
  { id: 'modifications',        label: 'Modifications' },
  { id: 'reclamation',          label: 'Réclamation auprès de la CNIL' },
];

export default function ConfidentialitePage() {
  return (
    <LegalShell
      title="Politique de confidentialité"
      subtitle="Comment Major ECN collecte, utilise et protège vos données personnelles, conformément au Règlement Général sur la Protection des Données (RGPD)."
      lastUpdated="9 juin 2026"
      toc={TOC}
    >
      <p className="text-[15px] leading-relaxed">
        La présente politique de confidentialité a pour objet de vous informer
        sur la manière dont <strong>Major ECN</strong> collecte et traite vos
        données à caractère personnel lorsque vous utilisez le site
        <em> major-ecn.fr</em> et la plateforme pédagogique associée
        (ci-après, le « <strong>Service</strong> »).
      </p>

      <LegalSection id="identite-responsable" title="1. Identité du responsable de traitement">
        <p>
          Le responsable du traitement de vos données est :
        </p>
        <LegalInfoBox title="Major ECN">
          <p><strong>Adresse</strong> : 3 rue Rosa Bonheur, 75015 Paris, France</p>
          <p><strong>Email</strong> : contact@major-ecn.fr</p>
          <p><strong>Téléphone</strong> : 01 47 34 35 71</p>
        </LegalInfoBox>
        <p>
          Pour toute question relative au traitement de vos données, vous pouvez
          écrire à <a href="mailto:contact@major-ecn.fr" className="font-semibold text-[#C0112E] underline">contact@major-ecn.fr</a>.
        </p>
      </LegalSection>

      <LegalSection id="donnees-collectees" title="2. Données personnelles collectées">
        <p>
          Nous collectons uniquement les données nécessaires à la fourniture
          du Service. Selon votre utilisation, nous pouvons collecter :
        </p>
        <LegalSubSection title="Données d’identification">
          <LegalList>
            <li>Prénom, nom</li>
            <li>Adresse email</li>
            <li>Numéro de téléphone (facultatif)</li>
            <li>Spécialité préparée et promotion (D2 / D3 / D4 / PAE)</li>
          </LegalList>
        </LegalSubSection>
        <LegalSubSection title="Données de compte">
          <LegalList>
            <li>Identifiant unique de compte</li>
            <li>Mot de passe (stocké sous forme chiffrée et irréversible)</li>
            <li>Préférences pédagogiques, progression, scores</li>
          </LegalList>
        </LegalSubSection>
        <LegalSubSection title="Données de paiement">
          <LegalList>
            <li>
              Les coordonnées bancaires ne sont <strong>jamais stockées
              sur nos serveurs</strong>. Elles sont traitées exclusivement
              par notre prestataire <strong>Stripe</strong>, certifié PCI-DSS.
            </li>
            <li>Nous conservons uniquement les références transactionnelles
              (montant, date, statut, identifiant Stripe).</li>
          </LegalList>
        </LegalSubSection>
        <LegalSubSection title="Données techniques">
          <LegalList>
            <li>Adresse IP</li>
            <li>Type de navigateur et système d’exploitation</li>
            <li>Pages consultées et logs d’utilisation</li>
            <li>Cookies (cf. section 9)</li>
          </LegalList>
        </LegalSubSection>
      </LegalSection>

      <LegalSection id="finalites" title="3. Finalités du traitement">
        <p>Vos données sont traitées pour les finalités suivantes :</p>
        <LegalList>
          <li>Création et gestion de votre compte utilisateur</li>
          <li>Fourniture du Service pédagogique (accès aux contenus, suivi de progression)</li>
          <li>Traitement de votre paiement et facturation</li>
          <li>Envoi des emails transactionnels (confirmation, activation, factures)</li>
          <li>Service client et support technique</li>
          <li>Amélioration du Service (statistiques anonymisées)</li>
          <li>Respect de nos obligations légales et comptables</li>
        </LegalList>
      </LegalSection>

      <LegalSection id="base-legale" title="4. Base légale du traitement">
        <p>
          Conformément à l’article 6 du RGPD, le traitement de vos données
          repose sur les bases légales suivantes :
        </p>
        <LegalList>
          <li>
            <strong>Exécution du contrat</strong> : pour la création de votre
            compte, l’accès au Service et le traitement de votre paiement
          </li>
          <li>
            <strong>Obligation légale</strong> : pour la conservation des
            factures et documents comptables
          </li>
          <li>
            <strong>Intérêt légitime</strong> : pour la sécurité du Service,
            la prévention de la fraude et l’amélioration de nos contenus
          </li>
          <li>
            <strong>Consentement</strong> : pour les cookies non essentiels
            et certaines communications marketing (vous pouvez le retirer
            à tout moment)
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection id="destinataires" title="5. Destinataires des données">
        <p>
          Vos données sont accessibles aux personnes habilitées au sein
          de Major ECN dans le strict cadre de leurs missions, ainsi
          qu’aux sous-traitants suivants :
        </p>
        <LegalList>
          <li>
            <strong>Stripe Payments Europe, Ltd.</strong> (Irlande) — traitement
            des paiements en ligne
          </li>
          <li>
            <strong>Supabase Inc.</strong> (États-Unis, serveurs UE) — hébergement
            de la base de données et authentification
          </li>
          <li>
            <strong>Vercel Inc.</strong> (États-Unis, serveurs UE) — hébergement
            du site et de l’application
          </li>
          <li>
            <strong>Resend, Inc.</strong> (États-Unis) — envoi des emails
            transactionnels
          </li>
        </LegalList>
        <p>
          Vos données ne font l’objet d’aucune cession ni vente à des tiers
          à des fins commerciales.
        </p>
      </LegalSection>

      <LegalSection id="transferts" title="6. Transferts hors Union européenne">
        <p>
          Certains de nos sous-traitants peuvent traiter vos données dans
          des pays situés en dehors de l’Espace économique européen
          (notamment aux États-Unis). Dans ce cas, ces transferts sont
          encadrés par les <strong>Clauses Contractuelles Types</strong>
          (CCT) de la Commission européenne et/ou la décision d’adéquation
          (Data Privacy Framework), qui garantissent un niveau de protection
          adéquat.
        </p>
      </LegalSection>

      <LegalSection id="duree-conservation" title="7. Durée de conservation">
        <p>Vos données sont conservées pour les durées suivantes :</p>
        <LegalList>
          <li>
            <strong>Compte actif</strong> : pour toute la durée de votre
            relation contractuelle avec Major ECN
          </li>
          <li>
            <strong>Compte inactif</strong> : 3 ans après votre dernière
            connexion (puis suppression ou anonymisation)
          </li>
          <li>
            <strong>Données de facturation</strong> : 10 ans (obligation
            légale comptable, art. L. 123-22 du Code de commerce)
          </li>
          <li>
            <strong>Cookies</strong> : 13 mois maximum (recommandation CNIL)
          </li>
          <li>
            <strong>Logs techniques</strong> : 12 mois
          </li>
          <li>
            <strong>Données de prospection</strong> : 3 ans à compter du
            dernier contact
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection id="droits" title="8. Vos droits (RGPD)">
        <p>
          Conformément aux articles 15 à 22 du RGPD, vous disposez des
          droits suivants sur vos données personnelles :
        </p>
        <LegalList>
          <li><strong>Droit d’accès</strong> : obtenir une copie de vos données</li>
          <li><strong>Droit de rectification</strong> : corriger des données inexactes</li>
          <li><strong>Droit à l’effacement</strong> (« droit à l’oubli »)</li>
          <li><strong>Droit à la limitation</strong> du traitement</li>
          <li><strong>Droit à la portabilité</strong> : recevoir vos données dans un format structuré</li>
          <li><strong>Droit d’opposition</strong> au traitement</li>
          <li><strong>Droit de retirer votre consentement</strong> à tout moment</li>
          <li>
            <strong>Droit de définir des directives</strong> sur le sort de
            vos données après votre décès (loi Informatique et Libertés)
          </li>
        </LegalList>
        <LegalInfoBox title="Pour exercer vos droits">
          <p>
            Adressez-nous votre demande par email à{' '}
            <a href="mailto:contact@major-ecn.fr" className="font-semibold text-[#C0112E] underline">contact@major-ecn.fr</a>
            {' '}ou par courrier à : Major ECN, 3 rue Rosa Bonheur, 75015 Paris.
          </p>
          <p className="mt-2">
            Nous répondons sous <strong>1 mois maximum</strong>. Une preuve
            d’identité pourra vous être demandée.
          </p>
        </LegalInfoBox>
      </LegalSection>

      <LegalSection id="cookies" title="9. Cookies et traceurs">
        <p>
          Notre site utilise des cookies pour assurer son bon fonctionnement
          et améliorer votre expérience.
        </p>
        <LegalSubSection title="Cookies strictement nécessaires">
          <p>
            Ces cookies sont indispensables au fonctionnement du Service
            (authentification, panier, sécurité). Ils ne nécessitent pas
            votre consentement.
          </p>
        </LegalSubSection>
        <LegalSubSection title="Cookies de mesure d’audience">
          <p>
            Nous utilisons des cookies analytiques anonymisés et conformes
            aux recommandations CNIL. Ils nous permettent de mesurer la
            fréquentation du site sans recueillir d’informations
            personnellement identifiables.
          </p>
        </LegalSubSection>
        <p>
          Vous pouvez à tout moment configurer votre navigateur pour
          refuser ou supprimer les cookies. Cela peut cependant affecter
          le fonctionnement du Service.
        </p>
      </LegalSection>

      <LegalSection id="securite" title="10. Sécurité de vos données">
        <p>
          Nous mettons en œuvre des mesures techniques et organisationnelles
          appropriées pour assurer la sécurité de vos données :
        </p>
        <LegalList>
          <li>Chiffrement des données en transit (HTTPS/TLS 1.3)</li>
          <li>Chiffrement des données au repos (AES-256)</li>
          <li>Mots de passe stockés via algorithme bcrypt</li>
          <li>Accès aux données limité aux personnes habilitées</li>
          <li>Sauvegardes régulières et journalisation</li>
          <li>Sous-traitants sélectionnés pour leurs garanties RGPD</li>
        </LegalList>
        <p>
          En cas de violation de données susceptible d’engendrer un risque
          élevé pour vos droits et libertés, nous vous informerons dans
          un délai de 72 heures, conformément à l’article 34 du RGPD.
        </p>
      </LegalSection>

      <LegalSection id="mineurs" title="11. Données des mineurs">
        <p>
          Notre Service s’adresse exclusivement à des médecins et étudiants
          en médecine majeurs (18 ans révolus). Nous ne collectons pas
          sciemment de données concernant des mineurs.
        </p>
      </LegalSection>

      <LegalSection id="modifications" title="12. Modifications de la politique">
        <p>
          Nous pouvons être amenés à modifier la présente politique pour
          tenir compte d’évolutions légales ou de notre Service. Toute
          modification substantielle vous sera notifiée par email et/ou
          par bandeau sur le site, et entrera en vigueur 30 jours après
          notification.
        </p>
        <p>
          La date de dernière mise à jour figure en tête du présent
          document.
        </p>
      </LegalSection>

      <LegalSection id="reclamation" title="13. Réclamation auprès de la CNIL">
        <p>
          Si vous estimez que vos droits ne sont pas respectés, vous pouvez
          introduire une réclamation auprès de la Commission Nationale
          de l’Informatique et des Libertés (CNIL) :
        </p>
        <LegalInfoBox title="CNIL">
          <p>3 place de Fontenoy, TSA 80715, 75334 Paris Cedex 07</p>
          <p>Téléphone : 01 53 73 22 22</p>
          <p>
            Site web :{' '}
            <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#C0112E] underline">
              www.cnil.fr
            </a>
          </p>
        </LegalInfoBox>
      </LegalSection>
    </LegalShell>
  );
}
