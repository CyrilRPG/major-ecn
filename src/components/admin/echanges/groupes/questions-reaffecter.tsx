'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRightLeft, CheckCircle2 } from 'lucide-react';
import type { EnseignantGroupe } from '@/lib/echanges/serveur/admin';
import { libelleEnseignant } from '@/lib/echanges/regles';
import { reaffecterQuestion } from '@/app/admin/echanges/actions';
import { Bouton, Carte, champ, Toast, useMessage } from '@/components/admin/cockpit/ui';
import { dateParis } from './commun';

export type QuestionAReaffecter = { tagId: string; enseignantId: string; tagAt: string; extrait: string };

/**
 * Onglet « Questions à réaffecter » : questions en attente d'un enseignant
 * retiré (§76, §113). Les confier à un enseignant actif crée un nouveau tag,
 * un nouvel e-mail et un nouveau délai de relance.
 */
export function QuestionsAReaffecter({
  questions, enseignants, lectureSeule,
}: {
  questions: QuestionAReaffecter[];
  enseignants: EnseignantGroupe[];
  lectureSeule?: boolean;
}) {
  const router = useRouter();
  const [choix, setChoix] = React.useState<Record<string, string>>({});
  const [erreurs, setErreurs] = React.useState<Record<string, string>>({});
  const [traitee, setTraitee] = React.useState<string | null>(null);
  const [enCours, start] = React.useTransition();
  const [message, setMessage] = useMessage();
  const parUser = new Map(enseignants.map((e) => [e.userId, e]));
  const actifs = enseignants.filter((e) => e.actif && e.prenomPublic);

  const libelle = (e: EnseignantGroupe) => `${e.nom}${e.prenomPublic ? ` — ${libelleEnseignant(e.prenomPublic, e.qualite || e.qualiteIdentite)}` : ''}`;

  function reaffecter(tagId: string) {
    const aff = choix[tagId];
    if (!aff) return;
    setTraitee(tagId);
    start(async () => {
      const r = await reaffecterQuestion(tagId, aff);
      if (!r.ok) {
        setErreurs((x) => ({ ...x, [tagId]: r.erreur }));
        setTraitee(null);
        return;
      }
      setErreurs((x) => { const n = { ...x }; delete n[tagId]; return n; });
      setTraitee(null);
      setMessage('Question réaffectée : l’enseignant est prévenu par e-mail.');
      router.refresh();
    });
  }

  return (
    <Carte>
      <div className="border-b border-(--color-border) p-3 sm:p-4">
        <h2 className="text-[15px] font-semibold text-(--color-ink)">Questions à réaffecter <span className="text-(--color-primary)">({questions.length})</span></h2>
        <p className="text-[12.5px] text-(--color-ink-soft)">Questions adressées à un enseignant retiré de la promotion, en attente d’un nouveau destinataire.</p>
      </div>
      {questions.length === 0 ? (
        <p className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-(--color-ink-muted)">
          <CheckCircle2 className="h-4 w-4 text-[#1F7A3E]" /> Aucune question à réaffecter.
        </p>
      ) : (
        <ul className="divide-y divide-(--color-border)">
          {actifs.length === 0 && !lectureSeule && (
            <li className="bg-[#FFF3E0] px-3 py-2 text-[13px] text-[#B45309] sm:px-4">Aucun enseignant actif avec une identité publique : ajoutez-en un dans l’onglet « Enseignants ».</li>
          )}
          {questions.map((q) => {
            const ancien = parUser.get(q.enseignantId);
            const options = actifs.filter((e) => e.userId !== q.enseignantId);
            return (
              <li key={q.tagId} className="space-y-2 px-3 py-3 sm:px-4">
                <p className="text-[12px] text-(--color-ink-muted)">
                  Posée le {dateParis(q.tagAt, true)} · adressée à {ancien ? ancien.nom : 'un enseignant retiré'}
                </p>
                <blockquote className="border-l-2 border-(--color-primary-soft) pl-3 text-[13.5px] text-(--color-ink)">{q.extrait || '(question sans texte)'}</blockquote>
                {!lectureSeule && (
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      className={`${champ} max-w-md flex-1`}
                      value={choix[q.tagId] ?? ''}
                      onChange={(e) => setChoix((x) => ({ ...x, [q.tagId]: e.target.value }))}
                      aria-label="Nouvel enseignant destinataire"
                      disabled={options.length === 0}
                    >
                      <option value="">Choisir un enseignant actif…</option>
                      {options.map((e) => <option key={e.affectationId} value={e.affectationId}>{libelle(e)}</option>)}
                    </select>
                    <Bouton taille="sm" disabled={!choix[q.tagId] || (enCours && traitee !== q.tagId)} enCours={enCours && traitee === q.tagId} onClick={() => reaffecter(q.tagId)}>
                      <ArrowRightLeft /> Réaffecter
                    </Bouton>
                  </div>
                )}
                {erreurs[q.tagId] && <p role="alert" className="text-[12.5px] text-[#B42318]">{erreurs[q.tagId]}</p>}
              </li>
            );
          })}
        </ul>
      )}
      <Toast message={message} />
    </Carte>
  );
}
