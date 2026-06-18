import {
  LegalShell, LegalSection, LegalInfoBox,
} from '@/components/marketing/legal-shell';

export const metadata = {
  alternates: { canonical: '/conditions-particulieres' },
  title: 'Conditions Particulières — Major ECN',
  description:
    "Modèle des Conditions Particulières — Major ECN (PAE Formation). Soumises aux Conditions Générales de Service. Désignation du Client, Offre choisie, date d'effet, exécution immédiate et renonciation au droit de rétractation.",
};

const TOC = [
  { id: 'preambule',    label: 'Préambule' },
  { id: 'designation',  label: 'Désignation du Client' },
  { id: 'offre',        label: 'Typologie de l’Offre choisie' },
  { id: 'date-effet',   label: 'Date d’effet du Contrat' },
  { id: 'observations', label: 'Observations — Exécution immédiate' },
];

export default function ConditionsParticulieresPage() {
  return (
    <LegalShell
      title="Conditions Particulières"
      subtitle="Document complétant les Conditions Générales de Service ; il individualise l’Offre souscrite par le Client."
      lastUpdated="14 juin 2026"
      toc={TOC}
      pdfHref="/legal/conditions-particulieres.pdf"
    >
      <section id="preambule" className="scroll-mt-24 pb-6 text-[14.5px] leading-relaxed">
        <p>
          Les présentes Conditions Particulières sont <strong>soumises aux Conditions Générales
          de Service</strong> de Major ECN — PAE Formation. Elles désignent le Client et précisent
          l’Offre souscrite ainsi que la date d’effet du Contrat.
        </p>
        <p className="mt-3">
          Le présent document est généré et renseigné automatiquement au moment de la souscription
          en ligne sur{' '}
          <a href="https://www.major-ecn.fr" className="font-semibold text-[#C0112E] underline">major-ecn.fr</a>.
          Une copie PDF des présentes est adressée au Client par email après paiement.
        </p>
      </section>

      <LegalSection id="designation" title="Désignation du Client">
        <p>Les Conditions Particulières comportent les éléments d’identification suivants, complétés à partir des informations renseignées lors de la souscription :</p>
        <ul className="mt-2 space-y-1.5 pl-5 text-[14px]" style={{ listStyle: 'disc' }}>
          <li><strong>Nom</strong> du Client</li>
          <li><strong>Prénom</strong> du Client</li>
          <li><strong>Adresse du domicile</strong></li>
          <li><strong>Email</strong> et <strong>numéro de téléphone</strong></li>
          <li>Toute information complémentaire recueillie au cours du tunnel de souscription.</li>
        </ul>
      </LegalSection>

      <LegalSection id="offre" title="Typologie de l’Offre choisie">
        <p>
          Les Conditions Particulières précisent l’Offre souscrite par le Client (Formule
          Essentielle, Formule Intensive ou Programme Approfondi) ainsi que le rappel des
          services fournis (et l’exclusion expresse de ce qui n’est pas inclus).
        </p>
        <p>
          Le contenu détaillé de chaque Offre est consultable sur le Site, sur la page formules
          correspondante. La souscription vaut acceptation de ce périmètre.
        </p>
      </LegalSection>

      <LegalSection id="date-effet" title="Date d’effet du Contrat">
        <p>
          La date d’effet du Contrat correspond à la date de validation du paiement par le Client.
          Cette date conditionne le début de la période contractuelle telle que définie à l’article
          6.2 des Conditions Générales de Service.
        </p>
      </LegalSection>

      <LegalSection id="observations" title="Observations — Exécution immédiate et renonciation au droit de rétractation">
        <LegalInfoBox title="Renonciation expresse — Article L. 221-28, 1° du code de la consommation">
          <p>
            Le Client demande l’<strong>exécution immédiate du Contrat</strong> pour que
            l’exécution du Contrat commence avant l’expiration du délai de rétractation. Le Client
            reconnaît qu’il perd, en conséquence, son droit de rétractation.
          </p>
          <p className="mt-3 italic">
            « Le Client déclare renoncer expressément à son droit de rétractation en vue d’accéder,
            sans délai avant la fin dudit délai de rétractation, à la plateforme de la Société et
            aux services associés dans les conditions des Conditions Générales de Services. En
            conséquence, en application de l’article L. 221-28, 1° du code de la consommation, le
            Client ne saurait rétracter son engagement à l’égard de la Société. »
          </p>
        </LegalInfoBox>
        <p>
          Cette renonciation est recueillie en ligne via une case à cocher dédiée affichée lors du
          tunnel de paiement, en sus des cases d’acceptation des Conditions Générales d’Utilisation
          et des Conditions Générales de Service. L’acceptation est horodatée et conservée à des
          fins de preuve.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
