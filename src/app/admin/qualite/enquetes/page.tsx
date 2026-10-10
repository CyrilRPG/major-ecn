import Link from 'next/link';
import { BarreFiltres, BoutonAction, Carte, EnTete, Pastille, TauxTexte, Vide } from '@/components/admin/qualite/ui';
import { DownloadButton } from '@/components/admin/suivi/ui';
import { filtresVersQuery, lireFiltres } from '@/lib/qualite/filtres';
import { defsFiltres } from '@/lib/qualite/filtres-ui';
import { dateFr, maintenant } from '@/lib/qualite/format';
import { tauxParticipation } from '@/lib/qualite/indicateurs';
import { chargerEnvois, nomsCandidats, optionsFiltres } from '@/lib/qualite/serveur/admin';
import { FAMILLE_LABEL, FAMILLES, STATUT_ENVOI_LABEL, STATUTS_ENVOI } from '@/lib/qualite/types';
import { dispenserEnvoiAction, neutraliserEnvoiAction, renvoyerEnvoiAction, suspendreEnvoiAction } from '../actions';

export const dynamic = 'force-dynamic';

const TON: Record<string, string> = { complete: 'ok', expire: 'critique', neutralise: 'neutre', dispense: 'neutre', programme: 'neutre', envoye: 'vigilance', affiche: 'vigilance', commence: 'vigilance' };

/** Enquêtes et taux de réponse (§7.3, §17, §26) : instances envoyées, statuts, exceptions. */
export default async function EnquetesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const f = lireFiltres(sp);
  const [envois, opts] = await Promise.all([chargerEnvois(f), optionsFiltres()]);
  const noms = await nomsCandidats(envois.slice(0, 400).map((e) => e.user_id));
  const finals = envois.filter((e) => e.famille === 'FINAL');
  const parSpecialite = new Map<string, typeof finals>();
  const parPromotion = new Map<string, typeof finals>();
  for (const e of finals) {
    for (const c of e.contexte?.candidat?.colleges ?? ['—']) (parSpecialite.get(c) ?? parSpecialite.set(c, []).get(c)!).push(e);
    const p = e.contexte?.candidat?.promotion ?? '—';
    (parPromotion.get(p) ?? parPromotion.set(p, []).get(p)!).push(e);
  }
  const nomCollege = new Map(opts.colleges.map((c) => [c.v, c.l]));
  const now = maintenant();
  const statuts = STATUTS_ENVOI.map((s) => ({ s, n: envois.filter((e) => e.statut === s).length }));
  return (
    <>
      <EnTete
        titre="Enquêtes et taux de réponse"
        description="Chaque questionnaire envoyé, avec son statut. Une neutralisation ou une dispense n'est jamais comptée comme une réponse : le taux se calcule sur les questionnaires effectivement attendus."
        action={<DownloadButton href={`/api/admin/qualite/export${filtresVersQuery(f, { type: 'envois', format: 'xlsx' })}`} filename="enquetes.xlsx" label="Exporter (Excel)" />}
      />
      <BarreFiltres filtres={[...defsFiltres(opts, ['du', 'au', 'famille', 'college', 'voie', 'formule', 'promotion', 'session']), { cle: 'statut', label: 'Statut', options: STATUTS_ENVOI.map((s) => ({ v: s, l: STATUT_ENVOI_LABEL[s] })) }]} />
      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <Carte titre="Par questionnaire">
          <ul className="flex flex-col gap-2 text-sm">
            {FAMILLES.map((fam) => (
              <li key={fam} className="flex justify-between gap-2"><span className="text-(--color-ink-soft)">{FAMILLE_LABEL[fam]}</span><TauxTexte t={tauxParticipation(envois.filter((e) => e.famille === fam))} /></li>
            ))}
          </ul>
        </Carte>
        <Carte titre="Bilan final (J-3) par spécialité" description="Taux de complétion (§7.3)">
          {finals.length === 0 ? <Vide>Aucun bilan final sur la période.</Vide> : (
            <ul className="flex max-h-64 flex-col gap-1.5 overflow-y-auto text-sm">
              {Array.from(parSpecialite.entries()).sort().map(([c, l]) => <li key={c} className="flex justify-between gap-2"><span className="text-(--color-ink-soft)">{nomCollege.get(c) ?? c}</span><TauxTexte t={tauxParticipation(l)} /></li>)}
            </ul>
          )}
        </Carte>
        <Carte titre="Bilan final par promotion">
          {finals.length === 0 ? <Vide>—</Vide> : (
            <ul className="flex flex-col gap-1.5 text-sm">
              {Array.from(parPromotion.entries()).sort().map(([p, l]) => <li key={p} className="flex justify-between gap-2"><span className="text-(--color-ink-soft)">{p}</span><TauxTexte t={tauxParticipation(l)} /></li>)}
            </ul>
          )}
        </Carte>
      </div>
      <Carte titre={`Questionnaires (${envois.length})`} description={statuts.filter((s) => s.n).map((s) => `${STATUT_ENVOI_LABEL[s.s]} : ${s.n}`).join(' · ')}>
        {envois.length === 0 ? <Vide>Aucun questionnaire pour ces filtres.</Vide> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-(--color-ink-muted)">
                <tr><th className="py-2 pr-3">Candidat</th><th className="pr-3">Questionnaire</th><th className="pr-3">Prévu le</th><th className="pr-3">Statut</th><th className="pr-3">Blocage</th><th>Exceptions</th></tr>
              </thead>
              <tbody className="divide-y divide-(--color-border)">
                {envois.slice(0, 400).map((e) => {
                  const ouvert = ['programme', 'envoye', 'affiche', 'commence'].includes(e.statut);
                  return (
                    <tr key={e.id} className="align-top">
                      <td className="py-2 pr-3"><Link href={`/admin/qualite/candidats/${e.user_id}`} className="hover:underline">{noms.get(e.user_id)?.nom ?? 'Candidat'}</Link></td>
                      <td className="pr-3"><span className="block">{e.titre}</span><span className="text-xs text-(--color-ink-muted)">{FAMILLE_LABEL[e.famille]}{e.relances ? ` · ${e.relances} relance(s)` : ''}</span></td>
                      <td className="pr-3 whitespace-nowrap">{dateFr(e.programme_pour, true)}{e.echeance && <span className="block text-xs text-(--color-ink-muted)">expire {dateFr(e.echeance)}</span>}</td>
                      <td className="pr-3"><Pastille ton={TON[e.statut] ?? 'neutre'}>{STATUT_ENVOI_LABEL[e.statut]}</Pastille>
                        {(e.neutralise_motif || e.dispense_motif) && <span className="block text-xs text-(--color-ink-muted)">{e.neutralise_motif ?? e.dispense_motif}</span>}
                        {e.suspendu_jusqu_au && Date.parse(e.suspendu_jusqu_au) > now && <span className="block text-xs text-amber-700">suspendu jusqu’au {dateFr(e.suspendu_jusqu_au, true)}</span>}
                      </td>
                      <td className="pr-3 text-xs">{e.obligatoire ? e.blocking_scope : 'facultatif'}</td>
                      <td className="py-1">
                        {ouvert && (
                          <div className="flex flex-wrap gap-1">
                            {e.statut !== 'programme' && <BoutonAction label="Relancer" action={renvoyerEnvoiAction.bind(null, e.id)} variant="ghost" />}
                            {e.obligatoire && <BoutonAction label="Dispense temporaire" action={suspendreEnvoiAction.bind(null, e.id)} variant="ghost" champs={[{ nom: 'jusqu_au', label: 'Blocage levé jusqu’au', type: 'datetime', requis: true }, { nom: 'motif', label: 'Motif (technique, accessibilité…)', requis: true }]} />}
                            <BoutonAction label="Dispenser" action={dispenserEnvoiAction.bind(null, e.id)} variant="ghost" champs={[{ nom: 'motif', label: 'Motif de la décision administrative', type: 'long', requis: true }]} />
                            <BoutonAction label="Neutraliser" action={neutraliserEnvoiAction.bind(null, e.id)} variant="ghost" champs={[{ nom: 'motif', label: 'Motif', requis: true }]} />
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {envois.length > 400 && <p className="mt-2 text-xs text-(--color-ink-muted)">400 premiers affichés ; l’export contient tout.</p>}
          </div>
        )}
      </Carte>
    </>
  );
}
