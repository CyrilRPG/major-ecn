import { Carte, EnTete } from '@/components/admin/qualite/ui';
import { EditeurParametres, EditeurQuestionnaire } from '@/components/admin/qualite/parametres';
import { dateFr } from '@/lib/qualite/format';
import { lireParametres, qdb } from '@/lib/qualite/serveur/base';
import { listerQuestionnaires } from '@/lib/qualite/serveur/questionnaires';
import { FAMILLE_LABEL, TYPE_SEANCE_LABEL, type TypeSeance } from '@/lib/qualite/types';
import { enregistrerParametresAction, majQuestionnaireAction, retablirQuestionnaireAction, simulerInactiviteAction } from '../actions';

export const dynamic = 'force-dynamic';

/** Paramètres (§29) et questionnaires (§4.2) — modifiables sans développeur, historisés. */
export default async function ParametresQualitePage() {
  const [params, questionnaires, { data: hist }] = await Promise.all([
    lireParametres(), listerQuestionnaires(),
    qdb().from('qualite_parametres_historique').select('id, auteur_nom, motif, at').order('at', { ascending: false }).limit(30),
  ]);
  return (
    <>
      <EnTete titre="Paramètres" description="Activation, échéances, blocages, relances, alertes et questionnaires. Les échéances validées (à chaud, 33 %, 66 %, J-3, J+3, six mois) sont les valeurs par défaut." />
      <EditeurParametres initial={params} enregistrer={enregistrerParametresAction} simuler={simulerInactiviteAction} />
      <h2 className="mb-3 mt-8 text-lg font-semibold text-(--color-ink)">Questionnaires</h2>
      <p className="mb-4 text-sm text-(--color-ink-soft)">Chaque enregistrement crée une nouvelle version ; les questionnaires déjà envoyés conservent la version qu’ils ont reçue. Les questionnaires « type de séance » ajoutent leurs questions au questionnaire à chaud de base.</p>
      <div className="grid gap-4 lg:grid-cols-2">
        {questionnaires.map((q) => (
          <Carte key={q.id} titre={`${q.code} — v${q.version}`} description={`${FAMILLE_LABEL[q.famille]}${q.type_seance ? ` · complément « ${TYPE_SEANCE_LABEL[q.type_seance as TypeSeance]} »` : ''} · modifié le ${dateFr(q.updated_at)}`}>
            <EditeurQuestionnaire q={q} enregistrer={majQuestionnaireAction.bind(null, q.id)} retablir={retablirQuestionnaireAction.bind(null, q.id, q.code)} />
          </Carte>
        ))}
      </div>
      <Carte className="mt-6" titre="Historique des paramètres">
        <ul className="flex flex-col gap-1 text-sm">
          {((hist ?? []) as { id: number; auteur_nom: string | null; motif: string | null; at: string }[]).map((h) => <li key={h.id}>{dateFr(h.at, true)} · {h.auteur_nom ?? '—'}{h.motif ? ` — ${h.motif}` : ''}</li>)}
          {(hist ?? []).length === 0 && <li className="text-(--color-ink-muted)">Aucune modification : valeurs par défaut du cahier des charges.</li>}
        </ul>
      </Carte>
    </>
  );
}
