import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, MessagesSquare } from 'lucide-react';
import {
  acteurBackOffice, enseignantsDuGroupe, epinglesDuGroupe, equipeDisponible, groupeAccessible, participantsDuGroupe, peut,
  questionsAReaffecterDuGroupe,
} from '@/lib/echanges/serveur/admin';
import { contexteCriteres, type GroupeRow } from '@/lib/echanges/serveur/acces';
import { ficheGroupe } from '@/lib/echanges/serveur/groupes';
import { identitesDe } from '@/lib/echanges/serveur/identites';
import { lireCriteres } from '@/lib/echanges/regles';
import { FichePromotion } from '@/components/admin/echanges/groupes/fiche-promotion';
import {
  isoVersParis, ONGLETS_FICHE, PastilleConservation, PastilleStatutGroupe, PastilleVisibilite, type OngletFiche, type ValeursPromotion,
} from '@/components/admin/echanges/groupes/commun';
import type { MembreEquipe } from '@/components/admin/echanges/groupes/enseignants-promotion';
import type { SyntheseGroupe } from '@/components/admin/echanges/groupes/synthese-promotion';

export const metadata = { title: 'Promotion — Échanges' };
export const dynamic = 'force-dynamic';

type GroupeComplet = GroupeRow & { alerte_archivage_jours: number | null; ouverte_at: string | null };

/**
 * Fiche d'une promotion (§83) : synthèse et transitions de statut,
 * paramètres, critères (avec aperçu §181), participants, enseignants et
 * questions à réaffecter. Une promotion archivée s'ouvre en lecture seule.
 */
export default async function FichePromotionPage({
  params, searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ onglet?: string | string[] }>;
}) {
  const a = await acteurBackOffice();
  if (!a || !peut(a, 'gerer_groupes')) redirect('/admin/echanges');
  const { id } = await params;
  const { onglet } = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id) || !(await groupeAccessible(a, id))) notFound();

  const fiche = await ficheGroupe(id);
  if (!fiche) notFound();
  const g = fiche.groupe as GroupeComplet;

  const [participants, enseignants, equipeBrute, questions, epingles, ctx] = await Promise.all([
    participantsDuGroupe(id),
    enseignantsDuGroupe(id),
    equipeDisponible(),
    questionsAReaffecterDuGroupe(id),
    epinglesDuGroupe(id),
    contexteCriteres(),
  ]);
  const identites = await identitesDe([...equipeBrute.map((m) => m.userId), ...enseignants.map((e) => e.userId)]);
  const equipe: MembreEquipe[] = equipeBrute.map((m) => ({ ...m, avatarMode: identites.get(m.userId)?.avatar_mode ?? null }));
  // Un enseignant affecté dont le compte n'est plus listé dans l'équipe garde son identité éditable.
  for (const e of enseignants) {
    if (equipe.some((m) => m.userId === e.userId)) continue;
    const idt = identites.get(e.userId);
    equipe.push({
      userId: e.userId, nom: e.nom, email: e.email, role: 'professor', prenomPublic: idt?.prenom_public ?? null,
      qualite: idt?.qualite ?? null, specialite: idt?.specialite ?? null, avatarMode: idt?.avatar_mode ?? null,
    });
  }

  const criteres = lireCriteres(g.criteres);
  const synthese: SyntheseGroupe = {
    id: g.id, nom: g.nom, annee: g.annee, promotion: g.promotion, specialite: g.specialite_nom, description: g.description,
    statut: g.statut, visible: g.visible, modeParticipants: g.mode_participants, moderationPrealable: g.moderation_prealable,
    notifierChaqueMessage: g.notifier_chaque_message, bibliothequeAcces: g.bibliotheque_acces, createdAt: g.created_at,
    ouverteAt: g.ouverte_at ?? null, dateOuverture: g.date_ouverture, dateCloturePrevue: g.date_cloture_prevue,
    dateArchivagePrevue: g.date_archivage_prevue, alerteArchivageJours: g.alerte_archivage_jours ?? 7,
    clotureeAt: g.cloturee_at, archiveeAt: g.archivee_at, conservationLegale: g.conservation_legale,
  };
  const valeurs: ValeursPromotion = {
    nom: g.nom, annee: g.annee ? String(g.annee) : '', promotion: g.promotion ?? '', specialiteId: g.specialite_id ?? '',
    description: g.description ?? '', modeParticipants: g.mode_participants, criteres,
    moderationPrealable: g.moderation_prealable, notifierChaqueMessage: g.notifier_chaque_message, bibliothequeAcces: g.bibliotheque_acces,
    messageAccueil: g.message_accueil ?? '', dateOuverture: isoVersParis(g.date_ouverture), dateCloturePrevue: isoVersParis(g.date_cloture_prevue),
    dateArchivagePrevue: isoVersParis(g.date_archivage_prevue), alerteArchivageJours: String(g.alerte_archivage_jours ?? 7),
  };
  const demande = Array.isArray(onglet) ? onglet[0] : onglet;
  const ongletInitial: OngletFiche = (ONGLETS_FICHE as readonly string[]).includes(demande ?? '') ? (demande as OngletFiche) : 'synthese';
  const retour = g.statut === 'archivee' ? { href: '/admin/echanges/archives', label: 'Archives' } : { href: '/admin/echanges/groupes', label: 'Promotions' };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-0">
          <Link href={retour.href} className="inline-flex items-center gap-1 text-[13px] font-medium text-(--color-ink-soft) hover:text-(--color-primary)">
            <ArrowLeft className="h-3.5 w-3.5" /> {retour.label}
          </Link>
          <h2 className="mt-1 flex flex-wrap items-center gap-2 text-lg font-semibold tracking-tight text-(--color-ink)">
            <span className="min-w-0 break-words">{g.nom}</span>
            <PastilleStatutGroupe statut={g.statut} />
            <PastilleVisibilite visible={g.visible} />
            {g.conservation_legale && <PastilleConservation />}
          </h2>
          <p className="text-sm text-(--color-ink-soft)">{[g.annee, g.promotion, g.specialite_nom ?? 'Toutes spécialités'].filter(Boolean).join(' · ')}</p>
        </div>
        <Link
          href={`/echanges/${g.id}`}
          className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-(--radius-button) border border-(--color-border) bg-white px-3 text-[13px] font-medium text-(--color-primary) hover:bg-(--color-primary-soft) focus-ring"
        >
          <MessagesSquare className="h-4 w-4" /> Ouvrir la conversation
        </Link>
      </div>
      <FichePromotion
        key={g.id}
        ongletInitial={ongletInitial}
        groupe={synthese}
        compteurs={fiche.compteurs}
        relanceHeures={fiche.relanceHeures}
        epingles={epingles}
        peutRgpd={peut(a, 'rgpd')}
        valeurs={valeurs}
        mode={g.mode_participants}
        criteres={criteres}
        specialites={ctx.specialites}
        participants={participants}
        enseignants={enseignants}
        equipe={equipe}
        questions={questions}
      />
    </div>
  );
}
