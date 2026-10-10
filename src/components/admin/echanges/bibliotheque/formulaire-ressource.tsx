'use client';

import * as React from 'react';
import { BookOpen } from 'lucide-react';
import { enregistrerRessource } from '@/app/admin/echanges/actions';
import type { Ressource } from '@/lib/echanges/serveur/admin';
import { Bouton, champ, Libelle } from '@/components/admin/cockpit/ui';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { dateParis, type ResultatAction } from '../moderation/outils';

const AUTEUR_ANONYME = 'Question d’un candidat';

/**
 * Création / correction d'une ressource de la bibliothèque. La question est
 * attribuée anonymement par défaut (§120) ; « Revalider aujourd'hui » met à
 * jour la date de validation affichée aux candidats (§122). Montée à
 * l'ouverture seulement (état initial = ressource éditée).
 */
export function FormulaireRessource({ ressource, specialites, onFermer, onFait }: {
  ressource: Ressource | null;
  specialites: { id: string; nom: string }[];
  onFermer: () => void;
  onFait: (message: string) => void;
}) {
  const r = ressource;
  const [titre, setTitre] = React.useState(r?.titre ?? '');
  const [question, setQuestion] = React.useState(r?.question ?? '');
  const [questionAuteur, setQuestionAuteur] = React.useState(r?.questionAuteur ?? AUTEUR_ANONYME);
  const [reponse, setReponse] = React.useState(r?.reponse ?? '');
  const [enseignant, setEnseignant] = React.useState(r?.enseignantLabel ?? '');
  const [specialiteId, setSpecialiteId] = React.useState(r?.specialiteId ?? '');
  const [itemNumero, setItemNumero] = React.useState(r?.itemNumero ? String(r.itemNumero) : '');
  const [itemTitre, setItemTitre] = React.useState(r?.itemTitre ?? '');
  const [motsCles, setMotsCles] = React.useState((r?.motsCles ?? []).join(', '));
  const [publie, setPublie] = React.useState(r?.publie ?? true);
  const [revalider, setRevalider] = React.useState(false);
  const [envoi, setEnvoi] = React.useState(false);
  const [erreur, setErreur] = React.useState<string | null>(null);
  const id = React.useId();

  const valide = titre.trim().length > 0 && reponse.trim().length > 0;

  const enregistrer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valide) return;
    const num = Number(itemNumero);
    const spec = specialites.find((s) => s.id === specialiteId);
    setEnvoi(true); setErreur(null);
    let res: ResultatAction<{ id: string }>;
    try {
      res = await enregistrerRessource({
        titre: titre.trim(),
        question: question.trim() || null,
        questionAuteur: questionAuteur.trim() || AUTEUR_ANONYME,
        reponse: reponse.trim(),
        enseignantLabel: enseignant.trim() || null,
        specialiteId: specialiteId || null,
        specialiteNom: specialiteId ? spec?.nom ?? r?.specialiteNom ?? null : null,
        itemNumero: itemNumero.trim() && Number.isFinite(num) && num > 0 ? Math.round(num) : null,
        itemTitre: itemTitre.trim() || null,
        motsCles: motsCles.split(/[,;\n]/).map((m) => m.trim()).filter(Boolean),
        publie,
        revalider: r ? revalider : undefined,
      }, r?.id);
    } catch (err) {
      res = { ok: false, erreur: err instanceof Error ? err.message : 'Enregistrement impossible.' };
    }
    setEnvoi(false);
    if (!res.ok) { setErreur(res.erreur); return; }
    onFait(r ? 'Ressource mise à jour.' : 'Ressource ajoutée à la bibliothèque.');
  };

  const f = (n: string) => `${id}-${n}`;

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onFermer(); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-(--color-primary)" /> {r ? 'Modifier la ressource' : 'Nouvelle ressource'}</DialogTitle>
          <DialogDescription>
            Une ressource est une réponse pédagogique permanente, indépendante des promotions. Corrigez-la si une recommandation évolue.
          </DialogDescription>
        </DialogHeader>

        <form id={f('form')} onSubmit={(e) => void enregistrer(e)} className="space-y-3.5">
          <div>
            <Libelle htmlFor={f('titre')}>Titre *</Libelle>
            <input id={f('titre')} value={titre} onChange={(e) => setTitre(e.target.value)} maxLength={200} required className={champ} />
          </div>

          <div>
            <Libelle htmlFor={f('question')} aide="(facultative)">Question</Libelle>
            <textarea id={f('question')} value={question} onChange={(e) => setQuestion(e.target.value)} rows={3} className={champ} />
          </div>
          <div>
            <Libelle htmlFor={f('qauteur')} aide="(anonyme par défaut)">Attribution de la question</Libelle>
            <input id={f('qauteur')} value={questionAuteur} onChange={(e) => setQuestionAuteur(e.target.value)} maxLength={80} className={champ} />
            <p className="mt-1 text-[12px] text-(--color-ink-muted)">
              Laissez « {AUTEUR_ANONYME} » : le nom d’un candidat n’apparaît qu’avec son accord.
            </p>
          </div>

          <div>
            <Libelle htmlFor={f('reponse')}>Réponse *</Libelle>
            <textarea id={f('reponse')} value={reponse} onChange={(e) => setReponse(e.target.value)} rows={7} required className={champ} />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Libelle htmlFor={f('ens')}>Enseignant</Libelle>
              <input id={f('ens')} value={enseignant} onChange={(e) => setEnseignant(e.target.value)} placeholder="Ex. : Dr Claire, cardiologue" className={champ} />
            </div>
            <div>
              <Libelle htmlFor={f('spec')}>Spécialité</Libelle>
              <select id={f('spec')} value={specialiteId} onChange={(e) => setSpecialiteId(e.target.value)} className={champ}>
                <option value="">Aucune</option>
                {specialites.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
              </select>
            </div>
            <div>
              <Libelle htmlFor={f('item')}>Item n°</Libelle>
              <input id={f('item')} type="number" min={1} max={999} inputMode="numeric" value={itemNumero} onChange={(e) => setItemNumero(e.target.value)} className={champ} />
            </div>
            <div>
              <Libelle htmlFor={f('itemt')}>Intitulé de l’item</Libelle>
              <input id={f('itemt')} value={itemTitre} onChange={(e) => setItemTitre(e.target.value)} className={champ} />
            </div>
          </div>

          <div>
            <Libelle htmlFor={f('mots')} aide="(séparés par des virgules, 20 au plus)">Mots-clés</Libelle>
            <input id={f('mots')} value={motsCles} onChange={(e) => setMotsCles(e.target.value)} className={champ} />
          </div>

          <div className="flex flex-col gap-2 text-[13px] text-(--color-ink)">
            <label className="inline-flex cursor-pointer items-center gap-2">
              <input type="checkbox" checked={publie} onChange={(e) => setPublie(e.target.checked)} className="h-4 w-4 accent-(--color-primary)" />
              Publiée (visible des candidats dans la bibliothèque)
            </label>
            {r && (
              <label className="inline-flex cursor-pointer items-start gap-2">
                <input type="checkbox" checked={revalider} onChange={(e) => setRevalider(e.target.checked)} className="mt-0.5 h-4 w-4 accent-(--color-primary)" />
                <span>
                  Revalider aujourd’hui
                  <span className="block text-[12px] text-(--color-ink-muted)">
                    Met à jour la date « Validée le » affichée aux candidats (actuellement : {dateParis(r.valideAt, false)}).
                  </span>
                </span>
              </label>
            )}
          </div>

          {erreur && <p role="alert" className="text-[13px] font-medium text-[#B42318]">{erreur}</p>}
        </form>

        <DialogFooter>
          <Bouton type="button" variante="fantome" onClick={onFermer}>Annuler</Bouton>
          <Bouton type="submit" form={f('form')} enCours={envoi} disabled={!valide}>{r ? 'Enregistrer' : 'Ajouter'}</Bouton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
