'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Save } from 'lucide-react';
import type { EntreeGroupe } from '@/lib/echanges/serveur/groupes';
import { creerPromotion, modifierPromotion } from '@/app/admin/echanges/actions';
import { Bouton, Carte, champ, Libelle, Toast, useEtatSuivi, useMessage } from '@/components/admin/cockpit/ui';
import { ChampsCriteres } from './champs-criteres';
import { parisVersIso, type Specialite, type ValeursPromotion } from './commun';

/** Valeurs du formulaire → entrée attendue par le serveur (dates Paris → ISO). */
function versEntree(v: ValeursPromotion): EntreeGroupe {
  const annee = Number.parseInt(v.annee, 10);
  const alerte = Number.parseInt(v.alerteArchivageJours, 10);
  return {
    nom: v.nom.trim(),
    annee: Number.isFinite(annee) ? annee : null,
    promotion: v.promotion.trim() || null,
    specialiteId: v.specialiteId || null,
    description: v.description.trim() || null,
    modeParticipants: v.modeParticipants,
    criteres: v.criteres,
    moderationPrealable: v.moderationPrealable,
    notifierChaqueMessage: v.notifierChaqueMessage,
    bibliothequeAcces: v.bibliothequeAcces,
    messageAccueil: v.messageAccueil.trim() || null,
    dateOuverture: v.dateOuverture ? parisVersIso(v.dateOuverture) : null,
    dateCloturePrevue: v.dateCloturePrevue ? parisVersIso(v.dateCloturePrevue) : null,
    dateArchivagePrevue: v.dateArchivagePrevue ? parisVersIso(v.dateArchivagePrevue) : null,
    alerteArchivageJours: Number.isFinite(alerte) ? alerte : 7,
  };
}

/** Contrôles de cohérence avant envoi (le serveur nettoie de toute façon). */
function erreurs(v: ValeursPromotion): string | null {
  if (v.nom.trim().length < 2) return 'Le nom de la promotion est obligatoire (2 caractères au moins).';
  if (v.annee && !/^\d{4}$/.test(v.annee.trim())) return 'L’année doit comporter quatre chiffres (ex. 2027).';
  const o = v.dateOuverture ? parisVersIso(v.dateOuverture) : null;
  const c = v.dateCloturePrevue ? parisVersIso(v.dateCloturePrevue) : null;
  const a = v.dateArchivagePrevue ? parisVersIso(v.dateArchivagePrevue) : null;
  if (o && c && c <= o) return 'La clôture prévue doit suivre la date d’ouverture.';
  if (c && a && a <= c) return 'L’archivage prévu doit suivre la clôture prévue.';
  if (o && a && a <= o) return 'L’archivage prévu doit suivre la date d’ouverture.';
  const j = Number(v.alerteArchivageJours);
  if (!Number.isFinite(j) || j < 0 || j > 60) return 'L’alerte avant archivage doit être comprise entre 0 et 60 jours.';
  return null;
}

/**
 * Formulaire d'une promotion : création (avec mode et critères, créée en
 * brouillon puis ouverture de la fiche) ou modification des paramètres
 * depuis la fiche (les critères ont leur propre onglet, avec aperçu §181).
 */
export function FormulairePromotion({
  initial, specialites, groupeId, lectureSeule,
}: {
  initial: ValeursPromotion;
  specialites: Specialite[];
  /** Absent : création. */
  groupeId?: string;
  lectureSeule?: boolean;
}) {
  const router = useRouter();
  const creation = !groupeId;
  const [v, setV] = useEtatSuivi(initial, JSON.stringify(initial));
  const [enCours, start] = React.useTransition();
  const [erreur, setErreur] = React.useState<string | null>(null);
  const [message, setMessage] = useMessage();
  const maj = (p: Partial<ValeursPromotion>) => setV((x) => ({ ...x, ...p }));

  function soumettre(e: React.FormEvent) {
    e.preventDefault();
    const err = erreurs(v);
    setErreur(err);
    if (err) return;
    const entree = versEntree(v);
    start(async () => {
      if (creation) {
        const r = await creerPromotion(entree);
        if (!r.ok || !r.data) { setErreur(r.ok ? 'Création impossible.' : r.erreur); return; }
        router.push(`/admin/echanges/groupes/${r.data.id}`);
        return;
      }
      // Mode et critères : onglet dédié, avec aperçu des ajouts / retraits.
      const { modeParticipants: _m, criteres: _c, ...parametres } = entree;
      void _m; void _c;
      const r = await modifierPromotion(groupeId, parametres);
      if (!r.ok) { setErreur(r.erreur); return; }
      setMessage('Paramètres enregistrés.');
      router.refresh();
    });
  }

  const id = (s: string) => `promo-${s}`;

  return (
    <form onSubmit={soumettre} className="space-y-4">
      <fieldset disabled={lectureSeule || enCours} className="space-y-4">
        <Carte className="space-y-4 p-4 sm:p-5">
          <h2 className="text-[15px] font-semibold text-(--color-ink)">Identité de la promotion</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2">
              <Libelle htmlFor={id('nom')}>Nom *</Libelle>
              <input id={id('nom')} className={champ} value={v.nom} maxLength={120} required onChange={(e) => maj({ nom: e.target.value })} placeholder="ex. Cardiologie — Promotion 2027" />
            </div>
            <div>
              <Libelle htmlFor={id('annee')}>Année</Libelle>
              <input id={id('annee')} className={champ} inputMode="numeric" value={v.annee} maxLength={4} onChange={(e) => maj({ annee: e.target.value.replace(/\D/g, '') })} placeholder="2027" />
            </div>
            <div>
              <Libelle htmlFor={id('promotion')}>Promotion</Libelle>
              <input id={id('promotion')} className={champ} value={v.promotion} maxLength={80} onChange={(e) => maj({ promotion: e.target.value })} placeholder="ex. EDN 2027" />
            </div>
            <div className="sm:col-span-2">
              <Libelle htmlFor={id('specialite')} aide="(affichée aux candidats)">Spécialité</Libelle>
              <select id={id('specialite')} className={champ} value={v.specialiteId} onChange={(e) => maj({ specialiteId: e.target.value })}>
                <option value="">Toutes spécialités / transversale</option>
                {specialites.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2 lg:col-span-4">
              <Libelle htmlFor={id('description')}>Description</Libelle>
              <textarea id={id('description')} className={`${champ} min-h-[72px]`} value={v.description} maxLength={1000} onChange={(e) => maj({ description: e.target.value })} />
            </div>
          </div>
        </Carte>

        {creation && (
          <Carte className="space-y-3 p-4 sm:p-5">
            <h2 className="text-[15px] font-semibold text-(--color-ink)">Participants</h2>
            <p className="text-[12.5px] text-(--color-ink-soft)">La promotion est créée en brouillon : les candidats y sont inscrits à son activation. Vous pourrez ajouter ou exclure des candidats depuis sa fiche.</p>
            <ChampsCriteres
              mode={v.modeParticipants}
              criteres={v.criteres}
              specialites={specialites}
              onMode={(m) => maj({ modeParticipants: m })}
              onCriteres={(c) => maj({ criteres: c })}
            />
          </Carte>
        )}

        <Carte className="space-y-3 p-4 sm:p-5">
          <h2 className="text-[15px] font-semibold text-(--color-ink)">Fonctionnement</h2>
          <div className="grid gap-2 sm:grid-cols-3">
            {([
              ['moderationPrealable', 'Modération préalable', 'Les messages des candidats sont validés par l’équipe avant publication.'],
              ['notifierChaqueMessage', 'Notifier chaque message', 'Les participants sont notifiés à chaque nouveau message (sinon : résumé).'],
              ['bibliothequeAcces', 'Accès à la bibliothèque', 'Les candidats consultent la bibliothèque pédagogique depuis la conversation.'],
            ] as const).map(([cle, titre, aide]) => (
              <label key={cle} className="flex cursor-pointer gap-2 rounded-xl border border-(--color-border) bg-white p-3 text-[13px] hover:bg-(--color-surface-soft)">
                <input type="checkbox" className="mt-0.5 accent-(--color-primary)" checked={v[cle]} onChange={(e) => maj({ [cle]: e.target.checked })} />
                <span>
                  <span className="block font-medium text-(--color-ink)">{titre}</span>
                  <span className="block text-[12px] text-(--color-ink-soft)">{aide}</span>
                </span>
              </label>
            ))}
          </div>
          <div>
            <Libelle htmlFor={id('accueil')} aide="(laisser vide pour le message général du module)">Message d’accueil</Libelle>
            <textarea id={id('accueil')} className={`${champ} min-h-[96px]`} value={v.messageAccueil} maxLength={4000} onChange={(e) => maj({ messageAccueil: e.target.value })} />
          </div>
        </Carte>

        <Carte className="space-y-3 p-4 sm:p-5">
          <h2 className="text-[15px] font-semibold text-(--color-ink)">Calendrier <span className="text-[12.5px] font-normal text-(--color-ink-muted)">— heure de Paris</span></h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Libelle htmlFor={id('ouverture')} aide="(visible des candidats à partir de)">Ouverture</Libelle>
              <input id={id('ouverture')} type="datetime-local" className={champ} value={v.dateOuverture} onChange={(e) => maj({ dateOuverture: e.target.value })} />
            </div>
            <div>
              <Libelle htmlFor={id('cloture')}>Clôture prévue</Libelle>
              <input id={id('cloture')} type="datetime-local" className={champ} value={v.dateCloturePrevue} onChange={(e) => maj({ dateCloturePrevue: e.target.value })} />
            </div>
            <div>
              <Libelle htmlFor={id('archivage')}>Archivage prévu</Libelle>
              <input id={id('archivage')} type="datetime-local" className={champ} value={v.dateArchivagePrevue} onChange={(e) => maj({ dateArchivagePrevue: e.target.value })} />
            </div>
            <div>
              <Libelle htmlFor={id('alerte')} aide="(jours avant)">Alerte d’archivage</Libelle>
              <input id={id('alerte')} type="number" min={0} max={60} className={champ} value={v.alerteArchivageJours} onChange={(e) => maj({ alerteArchivageJours: e.target.value })} />
            </div>
          </div>
          <p className="text-[12px] text-(--color-ink-muted)">À la clôture prévue, la promotion passe en lecture seule ; à l’archivage prévu, elle est archivée sans verser d’office les réponses épinglées dans la bibliothèque. L’équipe est alertée avant l’archivage.</p>
        </Carte>
      </fieldset>

      {erreur && <p role="alert" className="rounded-lg bg-[#FCE4E4] px-3 py-2 text-[13px] text-[#B42318]">{erreur}</p>}

      {!lectureSeule && (
        <div className="flex flex-wrap items-center justify-end gap-2">
          {creation && <Link href="/admin/echanges/groupes" className="px-3 text-sm font-medium text-(--color-ink-soft) hover:text-(--color-ink)">Annuler</Link>}
          <Bouton type="submit" enCours={enCours}><Save /> {creation ? 'Créer la promotion (brouillon)' : 'Enregistrer les paramètres'}</Bouton>
        </div>
      )}
      <Toast message={message} />
    </form>
  );
}
