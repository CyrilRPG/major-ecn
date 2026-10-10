import { redirect } from 'next/navigation';
import { acteurBackOffice, listeGroupes, peut, tableauDeBord } from '@/lib/echanges/serveur/admin';
import { cronsAffiches, dateParis } from '@/components/admin/echanges/pilotage/commun';
import {
  TableauDeBordEchanges, type PromotionActive, type SanteTechnique, type SectionTdb,
} from '@/components/admin/echanges/pilotage/tableau-de-bord';

export const dynamic = 'force-dynamic';

/**
 * Tableau de bord des Échanges (tout niveau) : chaque indicateur mène à
 * l'onglet où l'on agit. Les tuiles sont filtrées selon les capacités de la
 * personne (un modérateur ne voit ni les promotions à gérer ni la santé
 * technique) ; un modérateur restreint ne compte que ses promotions.
 */
export default async function TableauDeBordPage() {
  const a = await acteurBackOffice();
  if (!a) redirect('/admin');
  const [t, actives] = await Promise.all([tableauDeBord(a), listeGroupes(a, ['active'])]);
  const maintenant = new Date().getTime();

  const gerer = peut(a, 'gerer_groupes');
  const stats = peut(a, 'statistiques');
  const audit = peut(a, 'audit');
  const lienGroupes = gerer ? '/admin/echanges/groupes' : null;
  const lienStats = (etat?: string) => (stats ? `/admin/echanges/statistiques${etat ? `?etat=${etat}` : ''}` : null);
  const moderation = (onglet: string) => `/admin/echanges/moderation?onglet=${onglet}`;

  const sections: SectionTdb[] = [
    {
      cle: 'promotions', titre: 'Promotions',
      tuiles: [
        { cle: 'actives', libelle: 'Promotions actives', valeur: t.groupes.active, href: lienGroupes, ton: 'ok' },
        { cle: 'brouillons', libelle: 'Brouillons', valeur: t.groupes.brouillon, aide: 'à configurer avant ouverture', href: lienGroupes },
        { cle: 'cloturees', libelle: 'Clôturées', valeur: t.groupes.cloturee, aide: 'consultables, sans publication', href: lienGroupes },
        { cle: 'candidats', libelle: 'Candidats participants', valeur: t.candidats, aide: 'adhésions actives, toutes promotions', href: lienGroupes },
      ],
    },
    {
      cle: 'activite', titre: 'Activité',
      tuiles: [
        { cle: 'm24', libelle: 'Messages (24 h)', valeur: t.messages24h, href: lienStats() },
        { cle: 'm7', libelle: 'Messages (7 jours)', valeur: t.messages7j, href: lienStats() },
      ],
    },
  ];

  if (stats || gerer) {
    sections.push({
      cle: 'questions', titre: 'Questions aux enseignants',
      tuiles: [
        { cle: 'attente', libelle: 'En attente de réponse', valeur: t.questionsEnAttente, href: lienStats('non_repondu'), ton: t.questionsEnAttente > 0 ? 'attention' : 'neutre' },
        {
          cle: 'retard', libelle: `En retard (> ${t.relanceHeures} h)`, valeur: t.questionsEnRetard, aide: 'sans réponse au-delà du délai de relance',
          href: lienStats('retard'), ton: t.questionsEnRetard > 0 ? 'alerte' : 'ok',
        },
        {
          cle: 'reaffecter', libelle: 'À réaffecter', valeur: t.questionsAReaffecter, aide: 'enseignant retiré de la promotion',
          href: lienGroupes, ton: t.questionsAReaffecter > 0 ? 'attention' : 'neutre',
        },
      ],
    });
  }

  const tuilesModeration: SectionTdb['tuiles'] = [];
  if (peut(a, 'moderer')) {
    tuilesModeration.push({ cle: 'file', libelle: 'File de validation', valeur: t.fileValidation, aide: 'messages en attente de validation', href: moderation('validation'), ton: t.fileValidation > 0 ? 'attention' : 'neutre' });
  }
  if (peut(a, 'signalements')) {
    tuilesModeration.push({ cle: 'signalements', libelle: 'Signalements à examiner', valeur: t.signalements, href: moderation('signalements'), ton: t.signalements > 0 ? 'alerte' : 'neutre' });
  }
  if (peut(a, 'moderer')) {
    tuilesModeration.push({ cle: 'blocages', libelle: 'Tentatives retenues', valeur: t.blocages, aide: 'coordonnées ou liens en attente d’examen', href: moderation('blocages'), ton: t.blocages > 0 ? 'attention' : 'neutre' });
  }
  if (peut(a, 'sanctionner')) {
    tuilesModeration.push({ cle: 'sanctions', libelle: 'Mesures actives', valeur: t.sanctionsActives, aide: 'avertissements, suspensions, exclusions…', href: moderation('mesures') });
  }
  if (tuilesModeration.length) sections.push({ cle: 'moderation', titre: 'Modération', tuiles: tuilesModeration });

  const promotions: PromotionActive[] = [...actives]
    .sort((x, y) => y.messages7j - x.messages7j || y.questionsEnAttente - x.questionsEnAttente
      || (y.dernierMessage ?? '').localeCompare(x.dernierMessage ?? '') || x.nom.localeCompare(y.nom, 'fr'))
    .slice(0, 8)
    .map((g) => ({
      id: g.id, nom: g.nom, promotion: g.promotion, candidats: g.candidats, enseignants: g.enseignants, messages7j: g.messages7j,
      questionsEnAttente: g.questionsEnAttente, dernier: g.dernierMessage ? dateParis(g.dernierMessage) : 'Aucun message',
      href: gerer ? `/admin/echanges/groupes/${g.id}` : null,
    }));

  const sante: SanteTechnique | null = audit
    ? { crons: cronsAffiches(t.crons, maintenant), erreurs7j: t.erreurs7j, emailsEchec: t.emailsEchec, lienJournal: '/admin/echanges/journal?onglet=technique' }
    : null;

  return <TableauDeBordEchanges sections={sections} promotions={promotions} lienPromotions={lienGroupes} sante={sante} />;
}
