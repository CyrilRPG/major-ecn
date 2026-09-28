import {
  LegalShell, LegalSection, LegalList, LegalInfoBox,
} from '@/components/marketing/legal-shell';

/**
 * Page publique de suppression de compte. Exigée par Google Play (formulaire
 * « Sécurité des données ») : elle doit être accessible sans connexion, nommer
 * l'application, décrire la marche à suivre et les données supprimées ou
 * conservées. Même gabarit que les autres pages légales.
 */
export const metadata = {
  alternates: { canonical: '/suppression-compte' },
  title: 'Supprimer votre compte — Major ECN',
  description:
    "Comment supprimer votre compte Major ECN depuis l’application mobile ou par e-mail, et quelles données sont supprimées ou conservées.",
};

const TOC = [
  { id: 'application', label: 'Application concernée' },
  { id: 'dans-l-application', label: 'Depuis l’application' },
  { id: 'par-e-mail', label: 'Par e-mail' },
  { id: 'donnees-supprimees', label: 'Données supprimées' },
  { id: 'donnees-conservees', label: 'Données conservées' },
];

export default function SuppressionComptePage() {
  return (
    <LegalShell
      title="Supprimer votre compte"
      subtitle="La marche à suivre pour supprimer votre compte Major ECN, et ce que deviennent vos données."
      lastUpdated="28 septembre 2026"
      toc={TOC}
    >
      <LegalSection id="application" title="1. Application concernée">
        <p>
          Cette page concerne l’application mobile <strong>Major ECN</strong> (Android et iOS),
          éditée par PAE Formation, ainsi que la plateforme web{' '}
          <a href="https://www.major-ecn.fr" className="font-semibold text-[#C0112E] underline">www.major-ecn.fr</a>.
          Le compte est le même sur l’application et sur le site : le supprimer depuis l’un le
          supprime partout.
        </p>
      </LegalSection>

      <LegalSection id="dans-l-application" title="2. Depuis l’application">
        <LegalInfoBox title="Étapes">
          <ol className="mt-1 space-y-1.5 pl-5" style={{ listStyle: 'decimal' }}>
            <li>Ouvrez l’application Major ECN et connectez-vous.</li>
            <li>Touchez l’onglet <strong>Plus</strong>, en bas à droite.</li>
            <li>Touchez votre nom, en haut de l’écran, pour ouvrir votre <strong>Profil</strong>.</li>
            <li>Descendez en bas de la page et touchez <strong>Supprimer mon compte</strong>.</li>
            <li>Confirmez. La suppression est immédiate et définitive.</li>
          </ol>
        </LegalInfoBox>
        <p>
          Les cours téléchargés sur le téléphone sont effacés en même temps. Vous pouvez ensuite
          désinstaller l’application.
        </p>
      </LegalSection>

      <LegalSection id="par-e-mail" title="3. Par e-mail">
        <p>
          Si vous n’avez plus accès à l’application, écrivez à{' '}
          <a href="mailto:contact@major-ecn.fr?subject=Suppression%20de%20mon%20compte" className="font-semibold text-[#C0112E] underline">contact@major-ecn.fr</a>
          {' '}depuis l’adresse e-mail de votre compte, avec pour objet « Suppression de mon
          compte ». Nous supprimons le compte et vous le confirmons sous 30 jours au plus.
        </p>
      </LegalSection>

      <LegalSection id="donnees-supprimees" title="4. Données supprimées">
        <LegalList>
          <li>votre compte et votre profil : nom, prénom, adresse e-mail, téléphone, pseudo, avatar ;</li>
          <li>votre progression : réponses aux QCM, séries, flashcards, questions à revoir, temps d’étude ;</li>
          <li>vos notes de cours et vos surlignages de fiches ;</li>
          <li>l’appareil associé au compte et la licence hors ligne de l’application.</li>
        </LegalList>
      </LegalSection>

      <LegalSection id="donnees-conservees" title="5. Données conservées">
        <LegalList>
          <li>
            <strong>Factures et pièces comptables</strong> : conservées pendant la durée légale de
            dix ans (article L. 123-22 du Code de commerce).
          </li>
          <li>
            <strong>Preuves contractuelles</strong> (contrat, consentements, signature) : conservées
            pendant la durée de prescription applicable, cinq ans à compter de la fin du contrat.
          </li>
          <li>
            <strong>Messages publiés sur le forum</strong> : vos questions et vos réponses restent
            visibles là où elles avaient été publiées, signées « Ancien élève » : sans votre nom, votre
            pseudo ni votre avatar.
          </li>
        </LegalList>
        <p>
          Ces données ne servent plus qu’à répondre à nos obligations légales. Pour toute question,
          consultez notre{' '}
          <a href="/confidentialite" className="font-semibold text-[#C0112E] underline">politique de confidentialité</a>.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
