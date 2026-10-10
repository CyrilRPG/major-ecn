import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BoutonAction, Carte, EnTete, Pastille } from '@/components/admin/qualite/ui';
import { FormulaireDocument } from '@/components/admin/qualite/document';
import { ListeDocuments } from '@/components/admin/qualite/documents-liste';
import { dateFr, note } from '@/lib/qualite/format';
import { qdb } from '@/lib/qualite/serveur/base';
import { CIBLE_ACTION_LABEL, STATUT_ACTION_LABEL, type CibleAction, type StatutAction } from '@/lib/qualite/types';
import { transitionsPossibles } from '@/lib/qualite/workflow';
import type { Periode } from '@/lib/qualite/efficacite';
import { ajouterDocumentAction, majActionAction, mesurerActionAction, transitionActionAction } from '../../actions';

export const dynamic = 'force-dynamic';

type Action = {
  id: string; numero: number; titre: string; probleme: string; cause: string | null; action_decidee: string | null; responsable_id: string | null;
  responsable_nom: string | null; echeance: string | null; statut: StatutAction; justification_sans_suite: string | null; realisee_at: string | null;
  cible_type: CibleAction; cible_cle: string | null; cible_label: string | null; theme_cle: string | null; date_reference: string | null;
  mesure_avant: Periode | null; mesure_apres: (Periode & { verdict?: string; explication?: string }) | null; mesure_at: string | null;
  efficacite_constat: string | null; efficace: boolean | null; cloture_at: string | null; created_at: string;
};

function Mesure({ titre, p }: { titre: string; p: Periode | null }) {
  if (!p) return null;
  return (
    <div className="rounded border border-(--color-border) p-3 text-sm">
      <p className="mb-1 text-xs font-semibold uppercase text-(--color-ink-muted)">{titre} ({dateFr(p.du)} → {dateFr(p.au)})</p>
      <p>Réponses : {p.reponses} · note moyenne {note(p.noteMoyenne)}</p>
      <p>Notes défavorables : {p.notesDefavorables.pct ?? '—'} % ({p.notesDefavorables.n}/{p.notesDefavorables.total})</p>
      <p>Remarques du thème : {p.remarquesTheme} ({p.candidatsTheme} candidat(s))</p>
    </div>
  );
}

/** Fiche d'une action corrective (§23, §24). */
export default async function ActionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const db = qdb();
  const [{ data }, { data: liens }, { data: hist }, { data: equipe }] = await Promise.all([
    db.from('qualite_actions').select('*').eq('id', id).maybeSingle(),
    db.from('qualite_liens').select('vers_type, vers_id').eq('de_type', 'action').eq('de_id', id),
    db.from('qualite_journal').select('id, action, auteur_nom, details, at').eq('objet_type', 'action').eq('objet_id', id).order('at'),
    db.from('profiles').select('id, first_name, last_name, email').in('role', ['admin', 'professor']).neq('is_active', false).order('last_name').limit(300),
  ]);
  const a = data as Action | null;
  if (!a) notFound();
  const ls = (liens ?? []) as { vers_type: string; vers_id: string }[];
  const comIds = ls.filter((l) => l.vers_type === 'commentaire').map((l) => l.vers_id);
  const { data: coms } = comIds.length ? await db.from('qualite_commentaires').select('id, texte, created_at').in('id', comIds.slice(0, 150)) : { data: [] };
  const equipeOpts = ((equipe ?? []) as { id: string; first_name: string | null; last_name: string | null; email: string | null }[])
    .map((p) => ({ v: p.id, l: `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || p.email || p.id }));
  const maj = majActionAction.bind(null, a.id);
  const suivantes = transitionsPossibles(a.statut);
  return (
    <>
      <Link href="/admin/qualite/actions" className="mb-3 inline-block text-sm text-(--color-ink-soft) hover:underline">← Actions correctives</Link>
      <EnTete titre={`Action n° ${a.numero} — ${a.titre}`} description={`${CIBLE_ACTION_LABEL[a.cible_type]}${a.cible_label ? ` : ${a.cible_label}` : ''} · créée le ${dateFr(a.created_at)}`}
        action={<Pastille ton={a.statut === 'cloture' ? 'ok' : a.statut === 'sans_suite' ? 'neutre' : 'vigilance'}>{STATUT_ACTION_LABEL[a.statut]}</Pastille>} />
      <div className="grid gap-4 lg:grid-cols-3">
        <Carte titre="Analyse et décision" className="lg:col-span-2" action={a.statut !== 'cloture' && a.statut !== 'sans_suite' ? (
          <BoutonAction label="Modifier" action={maj} champs={[
            { nom: 'titre', label: 'Titre', defaut: a.titre, requis: true },
            { nom: 'probleme', label: 'Problème constaté', type: 'long', defaut: a.probleme, requis: true },
            { nom: 'cause', label: 'Analyse de la cause', type: 'long', defaut: a.cause ?? '' },
            { nom: 'action_decidee', label: 'Action décidée', type: 'long', defaut: a.action_decidee ?? '' },
            { nom: 'responsable_id', label: 'Responsable', type: 'select', defaut: a.responsable_id ?? '', options: equipeOpts },
            { nom: 'echeance', label: 'Date limite', type: 'date', defaut: a.echeance ?? '' },
            { nom: 'date_reference', label: "Date de référence (mise en œuvre) pour la mesure", type: 'date', defaut: a.date_reference?.slice(0, 10) ?? '' },
          ]} />) : undefined}>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="text-(--color-ink-soft)">Problème constaté</dt><dd className="whitespace-pre-wrap">{a.probleme}</dd>
            <dt className="text-(--color-ink-soft)">Analyse de la cause</dt><dd className="whitespace-pre-wrap">{a.cause ?? '—'}</dd>
            <dt className="text-(--color-ink-soft)">Action décidée</dt><dd className="whitespace-pre-wrap">{a.action_decidee ?? '—'}</dd>
            <dt className="text-(--color-ink-soft)">Responsable</dt><dd>{a.responsable_nom ?? '—'}</dd>
            <dt className="text-(--color-ink-soft)">Date limite</dt><dd>{dateFr(a.echeance)}</dd>
            <dt className="text-(--color-ink-soft)">Réalisation</dt><dd>{dateFr(a.realisee_at)}</dd>
            <dt className="text-(--color-ink-soft)">Constat d’efficacité</dt><dd className="whitespace-pre-wrap">{a.efficacite_constat ?? '—'}{a.efficace !== null ? ` (${a.efficace ? 'efficace' : 'non efficace'})` : ''}</dd>
            {a.justification_sans_suite && <><dt className="text-(--color-ink-soft)">Sans suite</dt><dd>{a.justification_sans_suite}</dd></>}
            <dt className="text-(--color-ink-soft)">Clôture</dt><dd>{dateFr(a.cloture_at)}</dd>
          </dl>
          {suivantes.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-(--color-border) pt-3">
              {suivantes.map((s) => {
                const act = transitionActionAction.bind(null, a.id, s);
                if (s === 'sans_suite') return <BoutonAction key={s} label="Classer sans suite" variant="ghost" action={act} champs={[{ nom: 'justification_sans_suite', label: 'Justification (conservée)', type: 'long', requis: true }]} />;
                if (s === 'cloture') return <BoutonAction key={s} label="Valider et clôturer" variant="primary" action={act} champs={[
                  { nom: 'efficacite_constat', label: "Constat d'efficacité", type: 'long', requis: true, defaut: a.efficacite_constat ?? a.mesure_apres?.explication ?? '' },
                  { nom: 'efficace', label: 'Action efficace ?', type: 'select', requis: true, options: [{ v: 'oui', l: 'Oui' }, { v: 'non', l: 'Non' }, { v: 'partiel', l: 'Partiellement' }] },
                ]} />;
                const avance = STATUT_ACTION_LABEL[s];
                return <BoutonAction key={s} label={`→ ${avance}`} variant={transitionsPossibles(a.statut)[0] === s ? 'primary' : 'ghost'} action={act} />;
              })}
            </div>
          )}
        </Carte>
        <Carte titre="Signalements associés">
          <ul className="flex max-h-80 flex-col gap-1.5 overflow-y-auto text-sm">
            {ls.filter((l) => l.vers_type === 'alerte').map((l) => <li key={l.vers_id}><Link href={`/admin/qualite/alertes?id=${l.vers_id}`} className="text-(--color-primary) hover:underline">Alerte</Link></li>)}
            {ls.filter((l) => l.vers_type === 'reclamation').map((l) => <li key={l.vers_id}><Link href={`/admin/qualite/reclamations?id=${l.vers_id}`} className="text-(--color-primary) hover:underline">Réclamation</Link></li>)}
            {((coms ?? []) as { id: string; texte: string; created_at: string }[]).map((c) => <li key={c.id} className="text-xs">« {c.texte.slice(0, 200)} » <span className="text-(--color-ink-muted)">{dateFr(c.created_at)}</span></li>)}
            {ls.length === 0 && <li className="text-xs text-(--color-ink-muted)">Aucun.</li>}
          </ul>
        </Carte>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Carte titre="Mesure de l'efficacité" className="lg:col-span-2" description="Indicateurs avant / après la mise en œuvre, sur des fenêtres de même durée. Proposition seulement : la clôture reste une décision humaine."
          action={<BoutonAction label="Mesurer maintenant" action={mesurerActionAction.bind(null, a.id)} />}>
          {a.mesure_avant ? (
            <>
              <div className="grid gap-3 md:grid-cols-2"><Mesure titre="Avant" p={a.mesure_avant} /><Mesure titre="Après" p={a.mesure_apres} /></div>
              <p className="mt-2 text-sm">Verdict proposé : <strong>{a.mesure_apres?.verdict ?? '—'}</strong> — {a.mesure_apres?.explication} <span className="text-xs text-(--color-ink-muted)">(mesuré le {dateFr(a.mesure_at, true)})</span></p>
            </>
          ) : <p className="text-sm text-(--color-ink-muted)">Pas encore mesurée. Renseignez la date de référence puis cliquez sur « Mesurer ».</p>}
        </Carte>
        <Carte titre="Documents justificatifs" action={<FormulaireDocument action={ajouterDocumentAction.bind(null, 'action', a.id)} />}>
          <ListeDocuments objetType="action" objetId={a.id} />
        </Carte>
      </div>
      <Carte className="mt-4" titre="Historique">
        <ul className="flex flex-col gap-1 text-xs">
          {((hist ?? []) as { id: number; action: string; auteur_nom: string | null; at: string }[]).map((h) => <li key={h.id}>{dateFr(h.at, true)} · {h.action.replace(/_/g, ' ')} · {h.auteur_nom ?? '—'}</li>)}
        </ul>
      </Carte>
    </>
  );
}
