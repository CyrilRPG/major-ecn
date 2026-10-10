import Link from 'next/link';
import { BarreFiltres, BoutonAction, Carte, EnTete, Pastille, Vide } from '@/components/admin/qualite/ui';
import { dateFr } from '@/lib/qualite/format';
import { nomsCandidats } from '@/lib/qualite/serveur/admin';
import { qdb } from '@/lib/qualite/serveur/base';
import { NIVEAU_ALERTE_LABEL, NIVEAUX_ALERTE, STATUT_ALERTE_LABEL, STATUTS_ALERTE, TYPE_ALERTE_LABEL, type NiveauAlerte, type StatutAlerte, type TypeAlerte } from '@/lib/qualite/types';
import { creerActionAction, traiterAlerteAction } from '../actions';

export const dynamic = 'force-dynamic';

type Alerte = {
  id: string; numero: number; niveau: NiveauAlerte; type: TypeAlerte; titre: string; detail: string | null; user_id: string | null; seance_id: string | null;
  enseignant_cle: string | null; enseignant_nom: string | null; contenu_label: string | null; theme_cle: string | null; commentaire_id: string | null;
  donnees: { commentaires?: string[] }; statut: StatutAlerte; traitement: string | null; traitee_at: string | null; action_id: string | null;
  email_envoye_at: string | null; created_at: string;
};

/** Alertes (§21) : critiques, vigilance, récurrence — traitement tracé. */
export default async function AlertesQualitePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const un = (k: string) => (typeof sp[k] === 'string' ? (sp[k] as string) : null);
  const statut = un('statut') ?? (un('id') ? null : 'ouvertes');
  let q = qdb().from('qualite_alertes').select('*').order('created_at', { ascending: false }).limit(400);
  if (un('id')) q = q.eq('id', un('id'));
  else if (statut === 'ouvertes') q = q.in('statut', ['nouvelle', 'en_cours']);
  else if (statut) q = q.eq('statut', statut);
  if (un('niveau')) q = q.eq('niveau', un('niveau'));
  const { data } = await q;
  const alertes = (data ?? []) as Alerte[];
  const noms = await nomsCandidats(alertes.map((a) => a.user_id ?? ''));
  return (
    <>
      <EnTete titre="Alertes qualité" description="Critique : note de 1 ou 2/5, réclamation, difficulté urgente. Vigilance : difficulté, demande de contact, inactivité, taux de réponse, dégradation. Récurrence : plusieurs candidats signalent indépendamment le même problème." />
      <BarreFiltres filtres={[
        { cle: 'niveau', label: 'Niveau', options: NIVEAUX_ALERTE.map((n) => ({ v: n, l: NIVEAU_ALERTE_LABEL[n] })) },
        { cle: 'statut', label: 'Statut', options: [{ v: 'ouvertes', l: 'Ouvertes (nouvelles + en cours)' }, ...STATUTS_ALERTE.map((s) => ({ v: s, l: STATUT_ALERTE_LABEL[s] }))] },
      ]} />
      <Carte titre={`${alertes.length} alerte(s)`}>
        {alertes.length === 0 ? <Vide>Aucune alerte.</Vide> : (
          <ul className="divide-y divide-(--color-border)">
            {alertes.map((a) => (
              <li key={a.id} className="py-3 text-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Pastille ton={a.niveau}>{NIVEAU_ALERTE_LABEL[a.niveau]}</Pastille>
                      <span className="font-medium">{a.titre}</span>
                      <span className="text-xs text-(--color-ink-muted)">n° {a.numero} · {TYPE_ALERTE_LABEL[a.type] ?? a.type} · {dateFr(a.created_at, true)}{a.email_envoye_at ? ' · e-mail envoyé à la direction' : ''}</span>
                    </div>
                    {a.detail && <p className="mt-1 text-(--color-ink-soft)">{a.detail}</p>}
                    <p className="mt-1 flex flex-wrap gap-3 text-xs">
                      {a.user_id && <Link href={`/admin/qualite/candidats/${a.user_id}`} className="text-(--color-primary) hover:underline">{noms.get(a.user_id)?.nom ?? 'Candidat'}</Link>}
                      {a.enseignant_cle && <Link href={`/admin/qualite/enseignants?enseignant=${encodeURIComponent(a.enseignant_cle)}`} className="text-(--color-primary) hover:underline">{a.enseignant_nom ?? a.enseignant_cle}</Link>}
                      {a.theme_cle && <Link href={`/admin/qualite/remarques?theme=${a.theme_cle}${a.enseignant_cle && a.niveau === 'recurrence' ? `&enseignant=${encodeURIComponent(a.enseignant_cle)}` : ''}`} className="text-(--color-primary) hover:underline">Remarques à l’origine</Link>}
                      {a.action_id && <Link href={`/admin/qualite/actions/${a.action_id}`} className="text-(--color-primary) hover:underline">Action corrective</Link>}
                    </p>
                    {a.traitement && <p className="mt-1 text-xs">Traitement : {a.traitement} {a.traitee_at ? `(${dateFr(a.traitee_at)})` : ''}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Pastille ton={a.statut === 'traitee' ? 'ok' : a.statut === 'classee' ? 'neutre' : 'vigilance'}>{STATUT_ALERTE_LABEL[a.statut]}</Pastille>
                    {(a.statut === 'nouvelle' || a.statut === 'en_cours') && (
                      <div className="flex flex-wrap justify-end gap-1">
                        {a.statut === 'nouvelle' && <BoutonAction label="Prendre en charge" variant="ghost" action={traiterAlerteAction.bind(null, a.id)} champs={[{ nom: 'statut', label: '', type: 'select', requis: true, options: [{ v: 'en_cours', l: 'En cours' }] }, { nom: 'traitement', label: 'Note (facultative)' }]} />}
                        <BoutonAction label="Traiter / classer" variant="ghost" action={traiterAlerteAction.bind(null, a.id)} champs={[
                          { nom: 'statut', label: 'Issue', type: 'select', requis: true, options: [{ v: 'traitee', l: 'Traitée' }, { v: 'classee', l: 'Classée sans suite' }] },
                          { nom: 'traitement', label: 'Traitement réalisé ou motif du classement', type: 'long', requis: true },
                        ]} />
                        {!a.action_id && <BoutonAction label="Action corrective" variant="ghost" action={creerActionAction} champs={[
                          { nom: 'titre', label: 'Titre', requis: true, defaut: a.titre.slice(0, 200) },
                          { nom: 'probleme', label: 'Problème constaté', type: 'long', requis: true, defaut: [a.titre, a.detail].filter(Boolean).join(' — ') },
                          { nom: 'cible_type', label: 'Cible', type: 'select', requis: true, defaut: a.enseignant_cle ? 'enseignant' : a.contenu_label ? 'contenu' : a.theme_cle ? 'theme' : 'global', options: [{ v: 'enseignant', l: 'Enseignant' }, { v: 'seance', l: 'Séance' }, { v: 'contenu', l: 'Contenu' }, { v: 'theme', l: 'Thème' }, { v: 'plateforme', l: 'Plateforme' }, { v: 'organisation', l: 'Organisation' }, { v: 'global', l: 'Global' }] },
                          { nom: 'cible_cle', label: 'Clé de la cible', defaut: a.enseignant_cle ?? a.seance_id ?? a.theme_cle ?? '' },
                          { nom: 'cible_label', label: 'Libellé de la cible', defaut: a.enseignant_nom ?? a.contenu_label ?? '' },
                          { nom: 'theme_cle', label: 'Thème (clé)', defaut: a.theme_cle ?? '' },
                          { nom: 'alerte_id', label: 'Alerte liée', defaut: a.id },
                          { nom: 'commentaires', label: 'Remarques liées', defaut: [a.commentaire_id, ...(a.donnees?.commentaires ?? [])].filter(Boolean).join(',') },
                          { nom: 'echeance', label: 'Échéance', type: 'date' },
                        ]} />}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Carte>
    </>
  );
}
