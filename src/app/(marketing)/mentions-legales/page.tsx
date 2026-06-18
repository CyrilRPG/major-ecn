import {
  LegalShell, LegalSection, LegalList, LegalInfoBox,
} from '@/components/marketing/legal-shell';

export const metadata = {
  alternates: { canonical: '/mentions-legales' },
  title: 'Mentions légales — Major ECN',
  description:
    "Mentions légales du site major-ecn.fr : éditeur, hébergeur, directeur de publication et coordonnées de contact.",
};

const TOC = [
  { id: 'editeur',           label: 'Éditeur du site' },
  { id: 'directeur-publication', label: 'Directeur de publication' },
  { id: 'hebergeur',         label: 'Hébergeur' },
  { id: 'propriete',         label: 'Propriété intellectuelle' },
  { id: 'crédits',           label: 'Crédits' },
  { id: 'liens-externes',    label: 'Liens externes' },
  { id: 'cookies',           label: 'Cookies' },
  { id: 'contact',           label: 'Contact' },
];

export default function MentionsLegalesPage() {
  return (
    <LegalShell
      title="Mentions légales"
      subtitle="Conformément à la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l’économie numérique, voici les informations légales concernant le site major-ecn.fr."
      lastUpdated="9 juin 2026"
      toc={TOC}
    >
      <LegalSection id="editeur" title="1. Éditeur du site">
        <LegalInfoBox title="Major ECN">
          <p><strong>Dénomination sociale</strong> : Major ECN</p>
          <p><strong>Adresse</strong> : 3 rue Rosa Bonheur, 75015 Paris, France</p>
          <p><strong>Email</strong> : contact@major-ecn.fr</p>
          <p><strong>Téléphone</strong> : 01 47 34 35 71</p>
          <p className="mt-2 text-[12px]" style={{ color: '#7A8499' }}>
            <em>SIREN, SIRET, RCS, capital social et numéro de TVA intracommunautaire
            à compléter par l’éditeur le cas échéant.</em>
          </p>
        </LegalInfoBox>
      </LegalSection>

      <LegalSection id="directeur-publication" title="2. Directeur de la publication">
        <p>
          Le directeur de la publication du site major-ecn.fr est le
          représentant légal de Major ECN.
        </p>
        <p>
          Pour toute question éditoriale, vous pouvez contacter le directeur
          de la publication à l’adresse{' '}
          <a href="mailto:contact@major-ecn.fr" className="font-semibold text-[#C0112E] underline">
            contact@major-ecn.fr
          </a>.
        </p>
      </LegalSection>

      <LegalSection id="hebergeur" title="3. Hébergeur">
        <p>
          Le site major-ecn.fr est hébergé par :
        </p>
        <LegalInfoBox title="Vercel Inc.">
          <p>440 N Barranca Ave #4133, Covina, CA 91723, États-Unis</p>
          <p>
            Site web :{' '}
            <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#C0112E] underline">
              vercel.com
            </a>
          </p>
        </LegalInfoBox>
        <p>
          Les bases de données et services d’authentification sont assurés
          par <strong>Supabase Inc.</strong> (970 Toa Payoh North #07-04,
          Singapour 318992) avec des serveurs situés dans l’Union européenne.
        </p>
      </LegalSection>

      <LegalSection id="propriete" title="4. Propriété intellectuelle">
        <p>
          L’ensemble du contenu du site major-ecn.fr (textes, images, logos,
          vidéos, documents pédagogiques, code source, structure, design,
          marques) est protégé par les dispositions du Code de la propriété
          intellectuelle et appartient à Major ECN ou à ses partenaires.
        </p>
        <p>
          Toute reproduction, représentation, modification, publication,
          adaptation totale ou partielle de ces éléments, quel que soit le
          moyen ou le procédé utilisé, est interdite sans autorisation
          écrite préalable de Major ECN.
        </p>
        <p>
          Toute exploitation non autorisée est susceptible d’engager la
          responsabilité civile et pénale de son auteur, conformément aux
          articles L. 335-2 et suivants du Code de la propriété intellectuelle.
        </p>
        <p>
          Pour toute demande d’autorisation de reproduction, contactez-nous
          à <a href="mailto:contact@major-ecn.fr" className="font-semibold text-[#C0112E] underline">contact@major-ecn.fr</a>.
        </p>
      </LegalSection>

      <LegalSection id="crédits" title="5. Crédits">
        <LegalList>
          <li>
            <strong>Photographies</strong> : témoignages de candidats ayant
            consenti à l’utilisation de leur image
          </li>
          <li>
            <strong>Icônes</strong> : Lucide Icons (licence ISC)
          </li>
          <li>
            <strong>Polices de caractères</strong> : Plus Jakarta Sans,
            Manrope, IBM Plex Mono (Open Font License)
          </li>
          <li>
            <strong>Développement</strong> : Major ECN
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection id="liens-externes" title="6. Liens externes">
        <p>
          Le site major-ecn.fr peut contenir des liens vers d’autres sites
          web. Major ECN n’exerce aucun contrôle sur ces sites et décline
          toute responsabilité quant à leur contenu, leur politique de
          confidentialité ou leurs pratiques.
        </p>
        <p>
          La présence d’un lien vers un site tiers ne constitue ni une
          approbation ni un partenariat, sauf mention contraire explicite.
        </p>
      </LegalSection>

      <LegalSection id="cookies" title="7. Cookies">
        <p>
          Le site major-ecn.fr utilise des cookies pour assurer son bon
          fonctionnement et améliorer votre expérience. Pour en savoir plus,
          consultez notre{' '}
          <a href="/confidentialite" className="font-semibold text-[#C0112E] underline">
            Politique de confidentialité
          </a>.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="8. Nous contacter">
        <p>
          Pour toute question concernant le site major-ecn.fr, vous pouvez
          nous joindre par les moyens suivants :
        </p>
        <LegalInfoBox title="Major ECN">
          <p><strong>Email</strong> : contact@major-ecn.fr</p>
          <p><strong>Téléphone</strong> : 01 47 34 35 71</p>
          <p><strong>Horaires</strong> : Lun – Ven : 09h00 – 20h00</p>
          <p><strong>Adresse postale</strong> : 3 rue Rosa Bonheur, 75015 Paris</p>
        </LegalInfoBox>
      </LegalSection>
    </LegalShell>
  );
}
