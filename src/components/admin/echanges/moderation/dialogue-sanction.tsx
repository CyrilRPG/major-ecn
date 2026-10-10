'use client';

import * as React from 'react';
import { ShieldAlert } from 'lucide-react';
import { sanctionner } from '@/app/admin/echanges/actions';
import { AVERTISSEMENTS_PREDEFINIS, LIBELLE_SANCTION } from '@/lib/echanges/moderation-textes';
import { sanctionPermise, type Capacite, type TypeSanction } from '@/lib/echanges/regles';
import { Bouton, champ, Libelle } from '@/components/admin/cockpit/ui';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { ResultatAction } from './outils';

export type CibleSanction = { userId: string; nom: string; groupeId: string | null; groupe: string | null };

const TYPES: TypeSanction[] = ['avertissement', 'lecture_seule', 'restriction_tag', 'suspension', 'exclusion'];

const AIDE_TYPE: Record<TypeSanction, string> = {
  avertissement: 'Message de rappel aux règles, sans restriction. Conservé dans l’historique du candidat.',
  lecture_seule: 'Le candidat lit et recherche toujours, mais ne publie plus.',
  restriction_tag: 'Le candidat publie toujours, mais ne peut plus taguer d’enseignant.',
  suspension: 'Accès à la messagerie suspendu pour la durée choisie.',
  exclusion: 'Accès à la messagerie retiré jusqu’à réintégration.',
};

const DUREES: { cle: string; libelle: string; heures: number | null }[] = [
  { cle: '24', libelle: '24 h', heures: 24 },
  { cle: '72', libelle: '72 h', heures: 72 },
  { cle: '168', libelle: '7 jours', heures: 168 },
  { cle: 'date', libelle: 'Jusqu’à une date', heures: null },
  { cle: 'sans', libelle: 'Sans échéance', heures: null },
];

/** Types de mesure permis à l'acteur — reflet de `sanctionPermise` (le serveur revérifie). */
export function typesPermis(capacites: string[]): TypeSanction[] {
  const c = new Set(capacites as Capacite[]);
  return TYPES.filter((t) => sanctionPermise(t, c));
}

/**
 * Mesure envers un candidat (§49-53) depuis le back-office : type limité au
 * niveau de l'acteur, durée, message au candidat (textes prédéfinis), motif
 * interne, prévenir dans l'application et/ou par e-mail. Aucune trace publique
 * dans le groupe (§112). Montée à l'ouverture seulement.
 */
export function DialogueSanction({ cible, capacites, onFermer, onFait }: {
  cible: CibleSanction;
  capacites: string[];
  onFermer: () => void;
  onFait: (r: ResultatAction) => void;
}) {
  const permis = typesPermis(capacites);
  const [type, setType] = React.useState<TypeSanction>(permis[0] ?? 'avertissement');
  const [portee, setPortee] = React.useState<'groupe' | 'toutes'>(cible.groupeId ? 'groupe' : 'toutes');
  const [duree, setDuree] = React.useState('24');
  const [jusqua, setJusqua] = React.useState('');
  const [message, setMessage] = React.useState(AVERTISSEMENTS_PREDEFINIS[0]);
  const [motif, setMotif] = React.useState('');
  const [app, setApp] = React.useState(true);
  const [email, setEmail] = React.useState(false);
  const [envoi, setEnvoi] = React.useState(false);
  const [erreur, setErreur] = React.useState<string | null>(null);
  const ids = { message: React.useId(), motif: React.useId(), date: React.useId() };

  const avecDuree = type === 'lecture_seule' || type === 'suspension' || type === 'restriction_tag';
  const preset = DUREES.find((d) => d.cle === duree) ?? DUREES[0];
  const dateManquante = avecDuree && duree === 'date' && !jusqua;
  const messageManquant = type === 'avertissement' && !message.trim();

  const changerType = (t: TypeSanction) => {
    // Le texte prédéfini n'a de sens par défaut que pour l'avertissement ; ailleurs le message est un complément facultatif.
    if (t === 'avertissement' && !message.trim()) setMessage(AVERTISSEMENTS_PREDEFINIS[0]);
    if (t !== 'avertissement' && type === 'avertissement' && AVERTISSEMENTS_PREDEFINIS.includes(message)) setMessage('');
    setType(t);
  };

  const appliquer = async () => {
    if (avecDuree && duree === 'date' && !(new Date(jusqua).getTime() > Date.now())) {
      setErreur('La date de fin doit être dans le futur.');
      return;
    }
    setEnvoi(true); setErreur(null);
    let r: ResultatAction;
    try {
      r = await sanctionner({
        userId: cible.userId,
        groupeId: portee === 'groupe' ? cible.groupeId : null,
        type,
        motif: motif.trim() || null,
        messageEleve: message.trim() || null,
        dureeHeures: avecDuree ? preset.heures : null,
        jusqua: avecDuree && duree === 'date' && jusqua ? new Date(jusqua).toISOString() : null,
        notifierApp: app,
        notifierEmail: email,
      });
    } catch (e) {
      r = { ok: false, erreur: e instanceof Error ? e.message : 'Action impossible.' };
    }
    setEnvoi(false);
    if (!r.ok) { setErreur(r.erreur); return; }
    onFait(r);
  };

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onFermer(); }}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-(--color-primary)" /> Mesure envers {cible.nom}</DialogTitle>
          <DialogDescription>
            Aucune trace publique dans le groupe. La mesure est inscrite au journal d’audit et à l’historique de modération du candidat.
          </DialogDescription>
        </DialogHeader>

        {permis.length === 0 ? (
          <p className="text-sm text-(--color-ink-soft)">Votre niveau d’accès ne permet pas de prendre de mesure envers un candidat.</p>
        ) : (
          <div className="space-y-4">
            <fieldset>
              <legend className="mb-1.5 text-[12.5px] font-medium text-(--color-ink-soft)">Type de mesure</legend>
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {permis.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => changerType(t)}
                    aria-pressed={type === t}
                    className={cn(
                      'rounded-lg border px-3 py-2 text-left text-[13px] font-medium transition-colors focus-ring',
                      type === t ? 'border-(--color-primary) bg-(--color-primary-soft) text-(--color-primary)' : 'border-(--color-border) text-(--color-ink) hover:bg-(--color-surface-soft)',
                    )}
                  >
                    {LIBELLE_SANCTION[t]}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-[12px] text-(--color-ink-muted)">{AIDE_TYPE[type]}</p>
              {permis.length < TYPES.length && (
                <p className="mt-1 text-[12px] text-(--color-ink-muted)">La suspension et l’exclusion nécessitent un droit accordé par Major ECN.</p>
              )}
            </fieldset>

            {type === 'exclusion' && (
              <p className="rounded-lg bg-[#FFF3E0] px-3 py-2 text-[12.5px] text-[#B45309]">
                L’exclusion ne touche QUE la messagerie : cours, fiches, QCM, replays et toutes les autres fonctionnalités de la formation restent accessibles.
              </p>
            )}

            {cible.groupeId && (
              <fieldset className="flex flex-wrap gap-x-5 gap-y-1.5 text-[13px] text-(--color-ink)">
                <legend className="mb-1.5 text-[12.5px] font-medium text-(--color-ink-soft)">Portée</legend>
                <label className="inline-flex cursor-pointer items-center gap-2">
                  <input type="radio" name="portee" checked={portee === 'groupe'} onChange={() => setPortee('groupe')} className="accent-(--color-primary)" />
                  {cible.groupe ? `La promotion « ${cible.groupe} »` : 'Ce groupe'}
                </label>
                <label className="inline-flex cursor-pointer items-center gap-2">
                  <input type="radio" name="portee" checked={portee === 'toutes'} onChange={() => setPortee('toutes')} className="accent-(--color-primary)" />
                  Toutes ses messageries
                </label>
              </fieldset>
            )}

            {avecDuree && (
              <div>
                <p className="mb-1.5 text-[12.5px] font-medium text-(--color-ink-soft)">Durée</p>
                <div className="flex flex-wrap gap-1.5">
                  {DUREES.map((d) => (
                    <button
                      key={d.cle}
                      type="button"
                      onClick={() => setDuree(d.cle)}
                      aria-pressed={duree === d.cle}
                      className={cn(
                        'rounded-full border px-3 py-1 text-[12.5px] transition-colors focus-ring',
                        duree === d.cle ? 'border-(--color-primary) bg-(--color-primary) text-white' : 'border-(--color-border) text-(--color-ink) hover:bg-(--color-surface-soft)',
                      )}
                    >
                      {d.libelle}
                    </button>
                  ))}
                </div>
                {duree === 'date' && (
                  <div className="mt-2">
                    <Libelle htmlFor={ids.date} aide="(heure de Paris)">Jusqu’au</Libelle>
                    <input id={ids.date} type="datetime-local" value={jusqua} onChange={(e) => setJusqua(e.target.value)} className={cn(champ, 'sm:w-64')} />
                  </div>
                )}
                <p className="mt-1.5 text-[12px] text-(--color-ink-muted)">
                  {duree === 'sans' ? 'La mesure reste active jusqu’à ce qu’elle soit levée.' : 'Les droits sont rétablis automatiquement à l’échéance.'}
                </p>
              </div>
            )}

            <div>
              <Libelle htmlFor={ids.message} aide={type === 'avertissement' ? undefined : '(facultatif, ajouté au texte standard de la mesure)'}>
                Message au candidat
              </Libelle>
              <div className="mb-1.5 flex flex-wrap gap-1">
                {AVERTISSEMENTS_PREDEFINIS.map((a, i) => (
                  <button
                    key={a}
                    type="button"
                    title={a}
                    onClick={() => setMessage(a)}
                    className={cn(
                      'max-w-full truncate rounded-md border px-2 py-0.5 text-[11.5px] transition-colors focus-ring sm:max-w-[16rem]',
                      message === a ? 'border-(--color-primary) bg-(--color-primary-soft) text-(--color-primary)' : 'border-(--color-border) text-(--color-ink-soft) hover:bg-(--color-surface-soft)',
                    )}
                  >
                    Texte {i + 1} · {a}
                  </button>
                ))}
              </div>
              <textarea id={ids.message} value={message} onChange={(e) => setMessage(e.target.value)} rows={3} maxLength={2000} className={champ} />
            </div>

            <div>
              <Libelle htmlFor={ids.motif} aide="(interne, jamais visible du candidat)">Motif</Libelle>
              <input id={ids.motif} value={motif} onChange={(e) => setMotif(e.target.value)} maxLength={500} className={champ} />
            </div>

            <fieldset className="flex flex-wrap gap-x-5 gap-y-1.5 text-[13px] text-(--color-ink)">
              <legend className="mb-1.5 text-[12.5px] font-medium text-(--color-ink-soft)">Prévenir le candidat</legend>
              <label className="inline-flex cursor-pointer items-center gap-2">
                <input type="checkbox" checked={app} onChange={(e) => setApp(e.target.checked)} className="h-4 w-4 accent-(--color-primary)" /> Dans Major ECN
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2">
                <input type="checkbox" checked={email} onChange={(e) => setEmail(e.target.checked)} className="h-4 w-4 accent-(--color-primary)" /> Par e-mail
              </label>
            </fieldset>
            {!app && !email && <p className="text-[12px] text-(--color-ink-muted)">Le candidat ne sera pas prévenu : la mesure s’appliquera sans message.</p>}

            {erreur && <p role="alert" className="text-[13px] font-medium text-[#B42318]">{erreur}</p>}
          </div>
        )}

        <DialogFooter>
          <Bouton type="button" variante="fantome" onClick={onFermer}>Annuler</Bouton>
          {permis.length > 0 && (
            <Bouton
              type="button"
              variante={type === 'avertissement' ? 'plein' : 'danger'}
              enCours={envoi}
              disabled={dateManquante || messageManquant}
              onClick={() => void appliquer()}
            >
              Appliquer : {LIBELLE_SANCTION[type]}
            </Bouton>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
