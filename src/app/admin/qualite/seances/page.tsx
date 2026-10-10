import Link from 'next/link';
import { BoutonAction, Carte, EnTete, Pastille, Vide } from '@/components/admin/qualite/ui';
import { dateFr, note } from '@/lib/qualite/format';
import { moyenne } from '@/lib/qualite/indicateurs';
import { nomsCandidats } from '@/lib/qualite/serveur/admin';
import { qdb, toutesLesLignes } from '@/lib/qualite/serveur/base';
import type { SeanceLigne } from '@/lib/qualite/serveur/seances';
import { TYPE_SEANCE_LABEL, TYPES_SEANCE, type TypeSeance } from '@/lib/qualite/types';
import { corrigerParticipationAction, majSeanceAction } from '../actions';

export const dynamic = 'force-dynamic';

/**
 * Séances pédagogiques (§30 learning_event_id) : direct et replay rapprochés,
 * enseignant, type de séance (questions complémentaires), et correction des
 * participations (§4.1).
 */
export default async function SeancesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const focus = typeof sp.seance === 'string' ? sp.seance : null;
  const db = qdb();
  const seances = await toutesLesLignes<SeanceLigne>((a, b) => db.from('qualite_seances').select('*').order('debut_at', { ascending: false, nullsFirst: false }).order('id').range(a, b));
  const [parts, reps] = await Promise.all([
    toutesLesLignes<{ seance_id: string; user_id: string; mode: string; source: string; statut: string; motif: string | null; corrige_at: string | null }>((a, b) => db.from('qualite_participations').select('seance_id, user_id, mode, source, statut, motif, corrige_at').order('id').range(a, b)),
    toutesLesLignes<{ seance_id: string; note_globale: number | null }>((a, b) => db.from('qualite_reponses').select('seance_id, note_globale').eq('famille', 'HOT').not('seance_id', 'is', null).order('id').range(a, b)),
  ]);
  const partsPar = new Map<string, typeof parts>();
  for (const p of parts) (partsPar.get(p.seance_id) ?? partsPar.set(p.seance_id, []).get(p.seance_id)!).push(p);
  const repsPar = new Map<string, number[]>();
  for (const r of reps) if (r.note_globale !== null) (repsPar.get(r.seance_id) ?? repsPar.set(r.seance_id, []).get(r.seance_id)!).push(r.note_globale);
  const choisie = focus ? seances.find((s) => s.id === focus) ?? null : null;
  const partsChoisie = choisie ? partsPar.get(choisie.id) ?? [] : [];
  const noms = await nomsCandidats(partsChoisie.map((p) => p.user_id));
  const typeOpts = TYPES_SEANCE.map((t) => ({ v: t, l: TYPE_SEANCE_LABEL[t] }));
  return (
    <>
      <EnTete titre="Séances et participations" description="Chaque séance a un identifiant stable qui rapproche le direct et son replay : une même séance ne produit qu'un questionnaire à chaud par candidat. La présence en direct vient des feuilles d'émargement des séances (seule donnée de participation disponible) ; corrigez ici une correspondance erronée." />
      {choisie && (
        <Carte className="mb-6" titre={choisie.titre} description={`${choisie.event_id ? 'Direct' : 'Replay seul'}${choisie.video_id && choisie.event_id ? ' + replay rattaché' : ''} · ${dateFr(choisie.debut_at, true)} · ${choisie.enseignant_nom ?? 'enseignant non renseigné'}`}
          action={<Link href="/admin/qualite/seances" className="text-sm text-(--color-primary)">Toutes les séances</Link>}>
          <div className="mb-3 flex flex-wrap gap-2">
            <BoutonAction label="Corriger la séance" action={majSeanceAction.bind(null, choisie.id)} champs={[
              { nom: 'type_seance', label: 'Type (questions complémentaires)', type: 'select', requis: true, defaut: choisie.type_seance, options: typeOpts },
              { nom: 'enseignant_nom', label: 'Enseignant', defaut: choisie.enseignant_nom ?? '' },
              { nom: 'theme', label: 'Thème', defaut: choisie.theme ?? '' },
              { nom: 'video_id', label: 'Replay rattaché (identifiant de la vidéo, vide = aucun)', defaut: choisie.video_id ?? '' },
            ]} />
            <BoutonAction label="Ajouter / annuler une participation" action={corrigerParticipationAction.bind(null, choisie.id)} champs={[
              { nom: 'email', label: 'E-mail du compte candidat', requis: true },
              { nom: 'mode', label: 'Mode', type: 'select', requis: true, options: [{ v: 'direct', l: 'Direct' }, { v: 'replay', l: 'Replay' }] },
              { nom: 'statut', label: 'Correction', type: 'select', requis: true, options: [{ v: 'valide', l: 'A bien participé' }, { v: 'annule', l: 'N’a pas participé (correspondance erronée)' }] },
              { nom: 'motif', label: 'Motif', requis: true },
            ]} />
          </div>
          {partsChoisie.length === 0 ? <Vide>Aucune participation rapprochée.</Vide> : (
            <ul className="divide-y divide-(--color-border) text-sm">
              {partsChoisie.map((p) => (
                <li key={`${p.user_id}${p.mode}`} className="flex flex-wrap items-center justify-between gap-2 py-1.5">
                  <Link href={`/admin/qualite/candidats/${p.user_id}`} className="hover:underline">{noms.get(p.user_id)?.nom ?? p.user_id}</Link>
                  <span className="flex items-center gap-2 text-xs">{p.mode} · {p.source}{p.motif ? ` · ${p.motif}` : ''}
                    <Pastille ton={p.statut === 'valide' ? 'ok' : 'neutre'}>{p.statut === 'valide' ? 'valide' : 'annulée'}</Pastille>
                    {p.statut === 'valide' && <BoutonAction label="Annuler" variant="ghost" action={corrigerParticipationAction.bind(null, choisie.id)} champs={[
                      { nom: 'user_id', label: '', type: 'select', requis: true, options: [{ v: p.user_id, l: noms.get(p.user_id)?.nom ?? 'Candidat' }] },
                      { nom: 'mode', label: '', type: 'select', requis: true, options: [{ v: p.mode, l: p.mode }] },
                      { nom: 'statut', label: '', type: 'select', requis: true, options: [{ v: 'annule', l: 'Annuler la participation' }] },
                      { nom: 'motif', label: 'Motif', requis: true },
                    ]} />}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Carte>
      )}
      <Carte titre={`${seances.length} séance(s)`}>
        {seances.length === 0 ? <Vide>Aucune séance synchronisée : lancez un passage depuis la vue générale.</Vide> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-(--color-ink-muted)"><tr><th className="py-2 pr-3">Séance</th><th className="pr-3">Date</th><th className="pr-3">Enseignant</th><th className="pr-3">Type</th><th className="pr-3">Direct / replay</th><th className="pr-3">Participants</th><th>Évaluations</th></tr></thead>
              <tbody className="divide-y divide-(--color-border)">
                {seances.slice(0, 400).map((s) => {
                  const p = (partsPar.get(s.id) ?? []).filter((x) => x.statut === 'valide');
                  const m = moyenne(repsPar.get(s.id) ?? []);
                  return (
                    <tr key={s.id}>
                      <td className="py-2 pr-3"><Link href={`/admin/qualite/seances?seance=${s.id}`} className="font-medium hover:underline">{s.titre}</Link><span className="block text-xs text-(--color-ink-muted)">{s.specialite_label ?? ''}</span></td>
                      <td className="pr-3 whitespace-nowrap">{dateFr(s.debut_at, true)}</td>
                      <td className="pr-3">{s.enseignant_nom ?? <span className="text-(--color-ink-muted)">—</span>}</td>
                      <td className="pr-3">{TYPE_SEANCE_LABEL[s.type_seance as TypeSeance]}{s.lien === 'manuel' && <span className="block text-[11px] text-(--color-ink-muted)">corrigée</span>}</td>
                      <td className="pr-3 text-xs">{s.event_id ? 'direct' : ''}{s.event_id && s.video_id ? ' + ' : ''}{s.video_id ? 'replay' : ''}</td>
                      <td className="pr-3">{p.filter((x) => x.mode === 'direct').length} / {p.filter((x) => x.mode === 'replay').length}</td>
                      <td>{m.n ? `${note(m.moyenne)} (${m.n})` : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Carte>
    </>
  );
}
