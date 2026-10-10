import Link from 'next/link';
import { BarreFiltres, BoutonAction, Carte, EnTete, Pastille, Vide } from '@/components/admin/qualite/ui';
import { FormulaireDocument } from '@/components/admin/qualite/document';
import { ListeDocuments } from '@/components/admin/qualite/documents-liste';
import { dateFr, PRIORITE_LABEL, STATUT_RECLAMATION_LABEL } from '@/lib/qualite/format';
import { qdb } from '@/lib/qualite/serveur/base';
import { ajouterDocumentAction, creerActionAction, creerReclamationAction, majReclamationAction, noterReclamationAction } from '../actions';

export const dynamic = 'force-dynamic';

type Reclamation = {
  id: string; candidat_id: string | null; candidat_label: string; specialite: string | null; categorie: string; sujet: string; description: string | null;
  canal: string; priorite: string; statut: string; motif: string | null; decision: string | null; origine: string | null; commentaire_id: string | null;
  qualite_action_id: string | null; created_at: string; resolue_at: string | null; cloturee_at: string | null;
};

const STATUTS = Object.entries(STATUT_RECLAMATION_LABEL).map(([v, l]) => ({ v, l }));
const PRIORITES = Object.entries(PRIORITE_LABEL).map(([v, l]) => ({ v, l }));

/**
 * Réclamations (§22) : registre UNIQUE, partagé avec le cockpit administrateur
 * (`cockpit_reclamations`). Distinct des simples avis négatifs ; une remarque
 * peut être requalifiée en réclamation depuis l'onglet Remarques.
 */
export default async function ReclamationsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const un = (k: string) => (typeof sp[k] === 'string' && sp[k] ? (sp[k] as string) : null);
  const db = qdb();
  let q = db.from('cockpit_reclamations').select('*').order('created_at', { ascending: false }).limit(300);
  if (un('id')) q = q.eq('id', un('id'));
  else if (un('statut')) q = q.eq('statut', un('statut'));
  const { data, error } = await q;
  const liste = (data ?? []) as Reclamation[];
  const focus = un('id') ? liste[0] ?? null : null;
  const { data: hist } = focus ? await db.from('qualite_journal').select('id, action, auteur_nom, details, at').eq('objet_type', 'reclamation').eq('objet_id', focus.id).order('at') : { data: [] };
  return (
    <>
      <EnTete titre="Réclamations" description="Identifiant, date de réception, candidat, motif, catégorie, priorité, responsable, statut, historique des échanges, décision et date de clôture."
        action={<BoutonAction label="Enregistrer une réclamation" variant="primary" action={creerReclamationAction} champs={[
          { nom: 'candidat', label: 'E-mail du candidat (ou nom)', requis: true }, { nom: 'sujet', label: 'Sujet', requis: true },
          { nom: 'description', label: 'Description', type: 'long' }, { nom: 'motif', label: 'Motif' },
          { nom: 'categorie', label: 'Catégorie', type: 'select', requis: true, options: [{ v: 'pedagogie', l: 'Pédagogie' }, { v: 'contenu', l: 'Contenu' }, { v: 'technique', l: 'Technique' }, { v: 'service', l: 'Service' }, { v: 'facturation', l: 'Facturation' }, { v: 'fonctionnalite', l: 'Fonctionnalité' }, { v: 'autre', l: 'Autre' }] },
          { nom: 'canal', label: 'Canal', type: 'select', requis: true, options: [{ v: 'email', l: 'E-mail' }, { v: 'telephone', l: 'Téléphone' }, { v: 'messagerie', l: 'Messagerie' }, { v: 'courrier', l: 'Courrier' }, { v: 'autre', l: 'Autre' }] },
          { nom: 'priorite', label: 'Priorité', type: 'select', requis: true, defaut: 'normale', options: PRIORITES },
        ]} />} />
      {error && <p className="mb-4 text-sm text-(--color-danger)">Registre indisponible : {error.message}</p>}
      {!focus && <BarreFiltres filtres={[{ cle: 'statut', label: 'Statut', options: STATUTS }]} />}
      {focus && (
        <Carte className="mb-6" titre={focus.sujet} description={`Reçue le ${dateFr(focus.created_at, true)} · ${focus.candidat_label} · ${focus.canal} · origine ${focus.origine === 'qualite' ? 'qualité' : 'cockpit'}`}
          action={<Link href="/admin/qualite/reclamations" className="text-sm text-(--color-primary)">Toutes les réclamations</Link>}>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="text-sm">
              <p className="mb-1 text-xs font-mono text-(--color-ink-muted)">Identifiant : {focus.id}</p>
              {focus.description && <p className="mb-2 whitespace-pre-wrap">{focus.description}</p>}
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                <dt className="text-(--color-ink-soft)">Statut</dt><dd>{STATUT_RECLAMATION_LABEL[focus.statut] ?? focus.statut}</dd>
                <dt className="text-(--color-ink-soft)">Priorité</dt><dd>{PRIORITE_LABEL[focus.priorite] ?? focus.priorite}</dd>
                <dt className="text-(--color-ink-soft)">Catégorie</dt><dd>{focus.categorie}</dd>
                <dt className="text-(--color-ink-soft)">Motif</dt><dd>{focus.motif ?? '—'}</dd>
                <dt className="text-(--color-ink-soft)">Décision / solution</dt><dd className="whitespace-pre-wrap">{focus.decision ?? '—'}</dd>
                <dt className="text-(--color-ink-soft)">Clôture</dt><dd>{dateFr(focus.cloturee_at)}</dd>
              </dl>
              <div className="mt-3 flex flex-wrap gap-2">
                {focus.candidat_id && <Link href={`/admin/qualite/candidats/${focus.candidat_id}`} className="text-sm text-(--color-primary) hover:underline">Fiche du candidat</Link>}
                {focus.commentaire_id && <Link href={`/admin/qualite/remarques?commentaire=${focus.commentaire_id}`} className="text-sm text-(--color-primary) hover:underline">Remarque d’origine</Link>}
                {focus.qualite_action_id && <Link href={`/admin/qualite/actions/${focus.qualite_action_id}`} className="text-sm text-(--color-primary) hover:underline">Action corrective</Link>}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <BoutonAction label="Mettre à jour" action={majReclamationAction.bind(null, focus.id)} champs={[
                  { nom: 'statut', label: 'Statut', type: 'select', defaut: focus.statut, options: STATUTS },
                  { nom: 'priorite', label: 'Priorité', type: 'select', defaut: focus.priorite, options: PRIORITES },
                  { nom: 'motif', label: 'Motif', defaut: focus.motif ?? '' },
                  { nom: 'decision', label: 'Décision ou solution (requise pour clôturer)', type: 'long', defaut: focus.decision ?? '' },
                ]} />
                <BoutonAction label="Consigner un échange" action={noterReclamationAction.bind(null, focus.id)} champs={[
                  { nom: 'canal', label: 'Canal', type: 'select', options: [{ v: 'telephone', l: 'Téléphone' }, { v: 'email', l: 'E-mail' }, { v: 'messagerie', l: 'Messagerie' }, { v: 'interne', l: 'Note interne' }] },
                  { nom: 'texte', label: 'Contenu de l’échange', type: 'long', requis: true },
                ]} />
                {!focus.qualite_action_id && <BoutonAction label="Action corrective" action={creerActionAction} champs={[
                  { nom: 'titre', label: 'Titre', requis: true, defaut: focus.sujet },
                  { nom: 'probleme', label: 'Problème constaté', type: 'long', requis: true, defaut: focus.description ?? focus.sujet },
                  { nom: 'cible_type', label: 'Cible', type: 'select', requis: true, options: [{ v: 'global', l: 'Global' }, { v: 'enseignant', l: 'Enseignant' }, { v: 'contenu', l: 'Contenu' }, { v: 'plateforme', l: 'Plateforme' }, { v: 'organisation', l: 'Organisation' }] },
                  { nom: 'cible_label', label: 'Libellé de la cible' },
                  { nom: 'reclamation_id', label: 'Réclamation liée', defaut: focus.id },
                  { nom: 'echeance', label: 'Échéance', type: 'date' },
                ]} />}
                <FormulaireDocument action={ajouterDocumentAction.bind(null, 'reclamation', focus.id)} />
              </div>
              <div className="mt-3"><ListeDocuments objetType="reclamation" objetId={focus.id} /></div>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase text-(--color-ink-muted)">Historique</p>
              <ul className="flex flex-col gap-2 text-sm">
                {((hist ?? []) as { id: number; action: string; auteur_nom: string | null; details: { texte?: string; canal?: string; statut?: string; decision?: string }; at: string }[]).map((h) => (
                  <li key={h.id} className="rounded border border-(--color-border) p-2">
                    <p className="text-xs text-(--color-ink-muted)">{dateFr(h.at, true)} · {h.auteur_nom ?? '—'} · {h.action.replace(/_/g, ' ')}{h.details?.canal ? ` (${h.details.canal})` : ''}</p>
                    {h.details?.texte && <p className="whitespace-pre-wrap">{h.details.texte}</p>}
                    {h.details?.statut && <p className="text-xs">Statut → {STATUT_RECLAMATION_LABEL[h.details.statut] ?? h.details.statut}</p>}
                  </li>
                ))}
                {(hist ?? []).length === 0 && <li className="text-xs text-(--color-ink-muted)">Aucun échange consigné.</li>}
              </ul>
            </div>
          </div>
        </Carte>
      )}
      {!focus && (
        <Carte titre={`${liste.length} réclamation(s)`}>
          {liste.length === 0 ? <Vide>Aucune réclamation.</Vide> : (
            <ul className="divide-y divide-(--color-border) text-sm">
              {liste.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                  <span><Link href={`/admin/qualite/reclamations?id=${r.id}`} className="font-medium hover:underline">{r.sujet}</Link>
                    <span className="block text-xs text-(--color-ink-muted)">{r.candidat_label} · {dateFr(r.created_at)} · {r.categorie}{r.origine === 'qualite' ? ' · issue d’une enquête' : ''}</span></span>
                  <span className="flex items-center gap-2"><Pastille ton={r.priorite === 'urgente' || r.priorite === 'haute' ? 'critique' : 'neutre'}>{PRIORITE_LABEL[r.priorite] ?? r.priorite}</Pastille><Pastille ton={r.statut === 'cloturee' || r.statut === 'resolu' ? 'ok' : 'vigilance'}>{STATUT_RECLAMATION_LABEL[r.statut] ?? r.statut}</Pastille></span>
                </li>
              ))}
            </ul>
          )}
        </Carte>
      )}
    </>
  );
}
