'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, CalendarClock, CheckCircle2, FileText, Info, Loader2, Send, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { apercuLienBunnyAction, type ApercuBunny } from '@/app/admin/videos/actions';
import { formaterDuree } from '@/lib/videos/bibliotheque';
import { formaterDateSeance } from '@/lib/videos/a-venir';
import {
  OFFRE_ATTENDUE, alertesSeance, libelleOffre, libelleVoie, tailleLisible,
  type Alerte, type SeanceBilan, type TypeVideoBilan,
} from '@/lib/videos/bilan-publication';

/** Où la vidéo va être rangée (affiché en tête du bilan). */
export type ContexteVideo = {
  college: string;
  sousCollege: string | null;
  item: string;
  categorie: string;
};

export type SeanceAuBilan = SeanceBilan & {
  /** Lien collé (ou identifiant Bunny) : sert à interroger bunny.net. */
  lien: string;
  rubrique: string;
};

type EtatBunny =
  | { phase: 'chargement' }
  | { phase: 'pret'; apercu: ApercuBunny }
  | { phase: 'erreur'; message: string };

/**
 * Bilan avant publication (28/09/2026) : tout ce qui va partir, séance par
 * séance, avec les points qui ressemblent à une erreur. Rien n'est envoyé
 * avant « Confirmer ».
 */
export function BilanPublicationDialog({
  open,
  onOpenChange,
  onConfirm,
  seances,
  type,
  contexte,
  existantes,
  publieDirect,
  nomsEleves,
  mode = 'depot',
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  seances: SeanceAuBilan[];
  type: TypeVideoBilan;
  contexte?: ContexteVideo | null;
  existantes: { titre: string; bunnyId: string | null }[];
  /** true : visible des élèves dès la confirmation ; false : déposé « À valider ». */
  publieDirect: boolean;
  nomsEleves: Map<string, string>;
  /** `publication` : vidéo « À valider » déjà déposée, qu'on publie. */
  mode?: 'depot' | 'publication';
}) {
  const unite = type === 'cours' ? 'vidéo' : 'séance';
  const pluriel = seances.length > 1 ? 's' : '';
  const [bunny, setBunny] = useState<Record<number, EtatBunny>>({});

  // Vérification sur bunny.net de chaque lien, à l'ouverture du bilan.
  useEffect(() => {
    if (!open) return;
    let annule = false;
    seances.forEach((s, i) => {
      if (!s.bunnyId) return;
      // Pas d'entrée = « Vérification… » : l'état n'est posé qu'au retour.
      apercuLienBunnyAction(s.lien || s.bunnyId)
        .then((res) => {
          if (annule) return;
          setBunny((b) => ({ ...b, [i]: 'error' in res ? { phase: 'erreur', message: res.error } : { phase: 'pret', apercu: res } }));
        })
        .catch(() => {
          if (!annule) setBunny((b) => ({ ...b, [i]: { phase: 'erreur', message: 'bunny.net injoignable : le lien sera vérifié à l’enregistrement.' } }));
        });
    });
    return () => { annule = true; };
  }, [open, seances]);

  const alertes: Alerte[][] = seances.map((s, i) => {
    const a = alertesSeance(s, i, { type, existantes, lot: seances });
    const b = bunny[i];
    if (b?.phase === 'pret' && b.apercu.introuvable) {
      a.unshift({ niveau: 'attention', texte: 'bunny.net ne trouve pas cette vidéo dans la bibliothèque de la plateforme : les élèves verraient une erreur.' });
    }
    return a;
  });
  const nbAttention = alertes.flat().filter((a) => a.niveau === 'attention').length;
  const nbSupports = seances.reduce((n, s) => n + s.supports.length, 0);

  const nomsDe = (ids: string[]) => {
    const noms = ids.map((id) => nomsEleves.get(id) ?? 'élève');
    return noms.length > 6 ? `${noms.slice(0, 6).join(', ')} et ${noms.length - 6} autre${noms.length - 6 > 1 ? 's' : ''}` : noms.join(', ');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-[#7C3AED]" />
            Bilan avant publication
          </DialogTitle>
          <DialogDescription>
            Nous avons bien pris en compte votre demande de publication de{seances.length > 1 ? 's' : ' la'} {unite}{pluriel} suivante{pluriel}.
            Vérifiez le bilan ci-dessous : rien n’est envoyé avant votre confirmation.
          </DialogDescription>
        </DialogHeader>

        {/* Destination + statut */}
        <div className="space-y-2 rounded-xl border border-(--color-border) bg-(--color-surface-soft) p-3 text-[13px]">
          {contexte && (
            <p className="text-(--color-ink)">
              <span className="text-(--color-ink-muted)">Destination : </span>
              <strong>{contexte.college}</strong>
              {contexte.sousCollege && <> › <strong>{contexte.sousCollege}</strong></>}
              {' › '}<strong>{contexte.item}</strong>
              <span className="text-(--color-ink-muted)"> · {contexte.categorie}</span>
            </p>
          )}
          <p className="text-(--color-ink)">
            <span className="text-(--color-ink-muted)">Contenu : </span>
            {seances.length} {unite}{pluriel}
            {mode === 'depot' && <>, {nbSupports} support{nbSupports > 1 ? 's' : ''} PDF</>}
          </p>
          {publieDirect ? (
            <p className="flex items-start gap-1.5 font-semibold text-[#16793C]">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              Dès votre confirmation, {seances.length > 1 ? 'elles seront visibles' : 'elle sera visible'} des élèves concernés.
            </p>
          ) : (
            <p className="flex items-start gap-1.5 font-semibold text-[#B26A00]">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              Dépôt « À valider » : invisible des élèves jusqu’à la publication par un responsable.
            </p>
          )}
          {nbAttention > 0 ? (
            <p className="flex items-start gap-1.5 font-semibold text-[#B45309]">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              {nbAttention} point{nbAttention > 1 ? 's' : ''} à vérifier ci-dessous.
            </p>
          ) : (
            <p className="flex items-start gap-1.5 text-(--color-ink-soft)">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              Aucune anomalie détectée.
            </p>
          )}
        </div>

        <ol className="space-y-3">
          {seances.map((s, i) => {
            const b = bunny[i];
            const attendue = OFFRE_ATTENDUE[type];
            return (
              <li key={i} className="rounded-xl border border-(--color-border) bg-(--color-surface) p-3 text-[13px]">
                <p className="font-bold text-(--color-ink)">
                  {seances.length > 1 && <span className="mr-1.5 text-(--color-ink-muted)">{i + 1}.</span>}
                  {s.titre}
                </p>
                {s.rubrique && <p className="mt-0.5 text-[12px] text-(--color-ink-muted)">Rubrique : {s.rubrique}</p>}

                <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5">
                  <dt className="text-(--color-ink-muted)">Vidéo</dt>
                  <dd className="min-w-0 text-(--color-ink)">
                    {!s.bunnyId ? (
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarClock className="h-3.5 w-3.5 text-[#1E4D8B]" />
                        Séance à venir{s.liveAt ? ` — ${formaterDateSeance(s.liveAt) ?? ''}` : ' (sans date)'}
                      </span>
                    ) : !b || b.phase === 'chargement' ? (
                      <span className="inline-flex items-center gap-1.5 text-(--color-ink-soft)">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Vérification sur bunny.net…
                      </span>
                    ) : b.phase === 'erreur' ? (
                      <span className="text-amber-700">{b.message}</span>
                    ) : b.apercu.introuvable ? (
                      <span className="font-semibold text-red-600">Introuvable sur bunny.net ({s.bunnyId})</span>
                    ) : (
                      <span className="inline-flex min-w-0 items-center gap-1.5">
                        <Video className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                        <span className="truncate font-semibold" title={b.apercu.titre ?? undefined}>{b.apercu.titre ?? 'Vidéo trouvée'}</span>
                        {b.apercu.dureeSecondes ? <span className="shrink-0 text-(--color-ink-muted)">· {formaterDuree(b.apercu.dureeSecondes)}</span> : null}
                      </span>
                    )}
                  </dd>

                  <dt className="text-(--color-ink-muted)">Formules</dt>
                  <dd className="flex flex-wrap gap-1">
                    {s.offers.map((o) => (
                      <span
                        key={o}
                        className={`rounded-full px-2 py-0.5 text-[11.5px] font-semibold ${o === attendue ? 'bg-[#F3EAFF] text-[#5B21B6]' : 'bg-(--color-sand-100) text-(--color-ink)'}`}
                      >
                        {libelleOffre(o)}
                      </span>
                    ))}
                  </dd>

                  <dt className="text-(--color-ink-muted)">Voies</dt>
                  <dd className="text-(--color-ink)">
                    {s.voies.length >= 2 ? 'Interne et externe' : s.voies.map(libelleVoie).join(', ')}
                  </dd>

                  {(s.allowedUserIds.length > 0 || s.deniedUserIds.length > 0) && (
                    <>
                      <dt className="text-(--color-ink-muted)">Élèves</dt>
                      <dd className="space-y-0.5 text-(--color-ink)">
                        {s.allowedUserIds.length > 0 && <p><span className="font-semibold text-[#16793C]">Ajoutés :</span> {nomsDe(s.allowedUserIds)}</p>}
                        {s.deniedUserIds.length > 0 && <p><span className="font-semibold text-red-600">Exclus :</span> {nomsDe(s.deniedUserIds)}</p>}
                      </dd>
                    </>
                  )}

                  <dt className="text-(--color-ink-muted)">Supports</dt>
                  <dd className="min-w-0">
                    {s.supports.length === 0 ? (
                      <span className="text-(--color-ink-muted)">Aucun</span>
                    ) : (
                      <ul className="space-y-1">
                        {s.supports.map((sup, j) => (
                          <li key={j} className="flex min-w-0 items-start gap-1.5">
                            <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-(--color-ink-muted)" />
                            <span className="min-w-0">
                              <span className="block truncate text-(--color-ink)" title={sup.nom}>
                                {sup.nom}
                                {sup.taille !== null && <span className="text-(--color-ink-muted)"> · {tailleLisible(sup.taille)}</span>}
                              </span>
                              <span className="block text-[11.5px] text-(--color-ink-muted)">
                                {sup.differentes
                                  ? `Audience propre : ${sup.offers.map(libelleOffre).join(' · ') || 'aucune formule'} — ${sup.voies.length >= 2 ? 'toutes voies' : sup.voies.map(libelleVoie).join(', ')}`
                                  : 'Même audience que la séance'}
                              </span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </dd>
                </dl>

                {alertes[i].length > 0 && (
                  <ul className="mt-2.5 space-y-1">
                    {alertes[i].map((a, k) => (
                      <li
                        key={k}
                        className={`flex items-start gap-1.5 rounded-lg px-2 py-1 text-[12px] ${a.niveau === 'attention' ? 'bg-[#FFF7E6] font-medium text-[#B45309]' : 'bg-(--color-surface-soft) text-(--color-ink-soft)'}`}
                      >
                        {a.niveau === 'attention'
                          ? <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          : <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />}
                        {a.texte}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ol>

        <DialogFooter className="gap-2 sm:justify-between">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Corriger
          </Button>
          <Button type="button" onClick={onConfirm}>
            <Send />
            {mode === 'publication'
              ? 'Confirmer et publier'
              : publieDirect ? 'Confirmer et publier' : 'Confirmer le dépôt'}
            {nbAttention > 0 && <span className="ml-1 text-[11px] font-normal opacity-80">(malgré {nbAttention} point{nbAttention > 1 ? 's' : ''})</span>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
