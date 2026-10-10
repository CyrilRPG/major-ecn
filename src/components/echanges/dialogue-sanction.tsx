'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { AVERTISSEMENTS_PREDEFINIS, DUREES, LIBELLE_SANCTION } from '@/lib/echanges/moderation-textes';
import { api } from './api';
import { Feuille } from './feuille';

export type TypeSanctionUI = 'avertissement' | 'lecture_seule' | 'suspension' | 'exclusion' | 'restriction_tag';

/**
 * Mesure de modération (§49-53) : avertir, lecture seule, suspendre, exclure de
 * la messagerie, retirer le tag. Aucune trace publique (§112) ; l'élève est
 * prévenu seulement si l'équipe le choisit (application, e-mail, les deux).
 */
export function DialogueSanction({ ouvert, onFermer, userId, nom, groupeId, typeInitial = 'avertissement', onFait }: {
  ouvert: boolean;
  onFermer: () => void;
  userId: string;
  nom?: string | null;
  groupeId: string | null;
  typeInitial?: TypeSanctionUI;
  onFait?: () => void;
}) {
  const [type, setType] = useState<TypeSanctionUI>(typeInitial);
  const [portee, setPortee] = useState<'groupe' | 'toutes'>(groupeId ? 'groupe' : 'toutes');
  const [duree, setDuree] = useState<number | null>(24);
  const [jusqua, setJusqua] = useState('');
  const [heuresPerso, setHeuresPerso] = useState(48);
  const [predefini, setPredefini] = useState(AVERTISSEMENTS_PREDEFINIS[0]);
  const [message, setMessage] = useState('');
  const [motif, setMotif] = useState('');
  const [app, setApp] = useState(true);
  const [email, setEmail] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [fait, setFait] = useState(false);
  const avecDuree = type === 'lecture_seule' || type === 'suspension' || type === 'restriction_tag';

  const valider = async () => {
    setEnvoi(true); setErreur(null);
    try {
      await api('/api/echanges/moderation', {
        method: 'POST',
        body: {
          action: 'sanction', userId, groupeId: portee === 'groupe' ? groupeId : null, type,
          motif: motif || null,
          messageEleve: type === 'avertissement' ? (message.trim() || predefini) : (message.trim() || null),
          dureeHeures: avecDuree && duree !== null && duree > 0 ? duree : avecDuree && duree === -1 ? heuresPerso : null,
          jusqua: avecDuree && duree === null && jusqua ? new Date(jusqua).toISOString() : null,
          notifierApp: app, notifierEmail: email,
        },
      });
      setFait(true);
      onFait?.();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : 'Action impossible.');
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <Feuille ouvert={ouvert} onFermer={() => { setFait(false); onFermer(); }} titre={`Modération${nom ? ` — ${nom}` : ''}`}>
      {fait ? (
        <div className="space-y-3 px-2 py-4 text-[14px]">
          <p className="font-semibold text-green-700 dark:text-green-300">Mesure enregistrée : {LIBELLE_SANCTION[type]}.</p>
          <p className="text-(--color-ink-soft)">Elle figure dans l’historique de modération du candidat. Aucun message public n’a été publié.</p>
          <button type="button" onClick={() => { setFait(false); onFermer(); }} className="h-11 w-full rounded-xl bg-[#102C5F] font-bold text-white">Fermer</button>
        </div>
      ) : (
        <div className="space-y-4 px-2 pb-2 text-[14px]">
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            {(Object.keys(LIBELLE_SANCTION) as TypeSanctionUI[]).map((t) => (
              <button key={t} type="button" onClick={() => setType(t)}
                className={`min-h-11 rounded-xl border px-2 py-2 text-[13px] font-semibold ${type === t ? 'border-[#102C5F] bg-[#102C5F] text-white' : 'border-(--color-border) hover:bg-(--color-surface-soft)'}`}>
                {LIBELLE_SANCTION[t]}
              </button>
            ))}
          </div>
          {type === 'exclusion' && (
            <p className="rounded-xl bg-amber-50 px-3 py-2 text-[12.5px] text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
              L’exclusion ne touche QUE la messagerie : cours, fiches, QCM, replays, planificateur, Arena et toutes les autres fonctionnalités restent accessibles.
            </p>
          )}
          {groupeId && (
            <fieldset className="flex flex-wrap gap-4">
              <legend className="mb-1 text-[12px] font-bold uppercase tracking-wide text-(--color-ink-muted)">Portée</legend>
              <label className="inline-flex items-center gap-2"><input type="radio" checked={portee === 'groupe'} onChange={() => setPortee('groupe')} /> Ce groupe</label>
              <label className="inline-flex items-center gap-2"><input type="radio" checked={portee === 'toutes'} onChange={() => setPortee('toutes')} /> Toutes ses messageries</label>
            </fieldset>
          )}
          {avecDuree && (
            <div>
              <p className="mb-1 text-[12px] font-bold uppercase tracking-wide text-(--color-ink-muted)">Durée</p>
              <div className="flex flex-wrap gap-1.5">
                {DUREES.map((d) => (
                  <button key={d.libelle} type="button" onClick={() => setDuree(d.heures)}
                    className={`rounded-full border px-3 py-1.5 text-[12.5px] ${duree === d.heures ? 'border-[#102C5F] bg-[#102C5F] text-white' : 'border-(--color-border)'}`}>{d.libelle}</button>
                ))}
              </div>
              {duree === null && <input type="datetime-local" value={jusqua} onChange={(e) => setJusqua(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-3" aria-label="Jusqu’au" />}
              {duree === -1 && (
                <label className="mt-2 flex items-center gap-2">
                  <input type="number" min={1} max={8784} value={heuresPerso} onChange={(e) => setHeuresPerso(Number(e.target.value) || 1)} className="h-11 w-28 rounded-xl border border-(--color-border) bg-(--color-surface) px-3" /> heures
                </label>
              )}
              <p className="mt-1 text-[12px] text-(--color-ink-muted)">Les droits sont rétablis automatiquement à l’échéance.</p>
            </div>
          )}
          {type === 'avertissement' && (
            <label className="block">
              <span className="mb-1 block text-[12px] font-bold uppercase tracking-wide text-(--color-ink-muted)">Texte prédéfini</span>
              <select value={predefini} onChange={(e) => setPredefini(e.target.value)} className="h-11 w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-3">
                {AVERTISSEMENTS_PREDEFINIS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </label>
          )}
          <label className="block">
            <span className="mb-1 block text-[12px] font-bold uppercase tracking-wide text-(--color-ink-muted)">Message au candidat {type === 'avertissement' ? '(remplace le texte prédéfini)' : '(facultatif)'}</span>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} className="w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-3 py-2" />
          </label>
          <label className="block">
            <span className="mb-1 block text-[12px] font-bold uppercase tracking-wide text-(--color-ink-muted)">Motif interne (jamais visible du candidat)</span>
            <input value={motif} onChange={(e) => setMotif(e.target.value)} className="h-11 w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-3" />
          </label>
          <fieldset className="flex flex-wrap gap-4">
            <legend className="mb-1 text-[12px] font-bold uppercase tracking-wide text-(--color-ink-muted)">Prévenir le candidat</legend>
            <label className="inline-flex items-center gap-2"><input type="checkbox" checked={app} onChange={(e) => setApp(e.target.checked)} className="h-4 w-4" /> Dans Major ECN</label>
            <label className="inline-flex items-center gap-2"><input type="checkbox" checked={email} onChange={(e) => setEmail(e.target.checked)} className="h-4 w-4" /> Par e-mail</label>
          </fieldset>
          {erreur && <p className="font-semibold text-[#E4002B]" role="alert">{erreur}</p>}
          <button type="button" onClick={() => void valider()} disabled={envoi} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#E4002B] font-bold text-white disabled:opacity-50">
            {envoi && <Loader2 className="h-4 w-4 animate-spin" />} Appliquer : {LIBELLE_SANCTION[type]}
          </button>
        </div>
      )}
    </Feuille>
  );
}
