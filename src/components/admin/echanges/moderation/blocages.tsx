'use client';

import * as React from 'react';
import { Send, ShieldAlert, ShieldBan } from 'lucide-react';
import { liberer } from '@/app/admin/echanges/actions';
import type { FileModeration } from '@/lib/echanges/serveur/admin';
import { Bouton, Carte, EnteteCarte, Etiquette, PastilleStatut, Toast, Vide } from '@/components/admin/cockpit/ui';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BasculeHistorique } from './bascule-historique';
import { dateParis, Personne, useActionServeur } from './outils';

type Blocage = FileModeration['blocages'][number];

const LIBELLE_TYPE: Record<string, string> = {
  coordonnees: 'Coordonnées / lien', spam: 'Envois répétés', doublon: 'Doublon', tag_abusif: 'Tag abusif', piece_jointe: 'Pièce jointe',
};
const LIBELLE_SOURCE: Record<string, string> = {
  message: 'Message', edition: 'Modification', legende: 'Légende', profil: 'Profil', image: 'Image', document: 'Document',
};
const STATUT: Record<string, { libelle: string; ton: string }> = {
  bloque: { libelle: 'Bloqué', ton: 'a_analyser' },
  en_moderation: { libelle: 'En validation', ton: 'en_attente' },
  libere: { libelle: 'Libéré (faux positif)', ton: 'terminee' },
  confirme: { libelle: 'Confirmé', ton: 'annulee' },
};

const motifsLisibles = (m: unknown): string[] =>
  Array.isArray(m) ? m.map((x) => (typeof x === 'string' ? x : JSON.stringify(x))).filter(Boolean) : [];

/**
 * Tentatives bloquées (§54-56, §198) : la détection de coordonnées, liens et
 * abus a retenu ou refusé un envoi. « Publier quand même » corrige un faux
 * positif : le message retenu est publié tel quel.
 */
export function Blocages({ blocages, historique, peutModerer }: { blocages: Blocage[]; historique: boolean; peutModerer: boolean }) {
  const { message, enCours, lancer } = useActionServeur();
  const [aLiberer, setALiberer] = React.useState<Blocage | null>(null);

  const confirmer = async () => {
    if (!aLiberer) return;
    const b = aLiberer;
    const r = await lancer('liberer', () => liberer(b.id), b.messageId ? 'Message publié (faux positif).' : 'Tentative marquée comme faux positif.');
    if (r.ok) setALiberer(null);
  };

  return (
    <Carte>
      <EnteteCarte
        icone={ShieldBan}
        titre={historique ? 'Tentatives bloquées — historique' : 'Tentatives bloquées (30 derniers jours)'}
        compteur={blocages.length}
        actions={<BasculeHistorique historique={historique} />}
      />
      <p className="px-4 pb-3 text-[13px] text-(--color-ink-soft) sm:px-5">
        Envois retenus par la détection automatique (numéros, adresses, réseaux sociaux, liens, envois répétés, fichiers). Le candidat a été invité à reformuler.
      </p>
      {blocages.length === 0 ? (
        <Vide>Aucune tentative bloquée.</Vide>
      ) : (
        <ul className="divide-y divide-(--color-border)">
          {blocages.map((b) => {
            const st = STATUT[b.statut] ?? { libelle: b.statut, ton: b.statut };
            const motifs = motifsLisibles(b.motifs);
            const ouvert = b.statut === 'bloque' || b.statut === 'en_moderation';
            return (
              <li key={b.id} className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:px-5">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px]">
                    <PastilleStatut statut={st.ton} libelle={st.libelle} />
                    <Etiquette ton="orange">{LIBELLE_TYPE[b.type] ?? b.type}</Etiquette>
                    <Etiquette ton="gris">{LIBELLE_SOURCE[b.source] ?? b.source}</Etiquette>
                    {b.groupe && <Etiquette ton="bordeaux">{b.groupe}</Etiquette>}
                    <span className="text-[12px] text-(--color-ink-muted)">{dateParis(b.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-[13px]"><Personne p={b.auteur} /></p>
                  {b.extrait ? (
                    <p className="mt-1.5 whitespace-pre-wrap break-words rounded-lg bg-(--color-surface-soft) px-3 py-2 font-mono text-[12.5px] text-(--color-ink)">{b.extrait}</p>
                  ) : (
                    <p className="mt-1.5 text-[12.5px] italic text-(--color-ink-muted)">Extrait effacé.</p>
                  )}
                  {motifs.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {motifs.map((m, i) => <Etiquette key={`${m}-${i}`} ton="violet">{m}</Etiquette>)}
                    </div>
                  )}
                </div>
                {peutModerer && ouvert && (
                  <div className="shrink-0">
                    <Bouton taille="xs" variante="contour" onClick={() => setALiberer(b)}>
                      <Send /> {b.messageId ? 'Publier quand même (faux positif)' : 'Faux positif'}
                    </Bouton>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {aLiberer && (
        <Dialog open onOpenChange={(o) => { if (!o) setALiberer(null); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-(--color-primary)" /> Faux positif de la détection</DialogTitle>
              <DialogDescription>
                {aLiberer.messageId
                  ? 'Le message retenu sera publié tel quel dans la promotion, et la tentative marquée comme libérée. Vérifiez qu’il ne contient aucune coordonnée personnelle.'
                  : 'Aucun message n’a été conservé pour cette tentative : elle sera seulement marquée comme faux positif (le candidat devra renvoyer son message).'}
              </DialogDescription>
            </DialogHeader>
            {aLiberer.extrait && (
              <p className="whitespace-pre-wrap break-words rounded-lg bg-(--color-surface-soft) px-3 py-2 font-mono text-[12.5px] text-(--color-ink)">{aLiberer.extrait}</p>
            )}
            <DialogFooter>
              <Bouton type="button" variante="fantome" onClick={() => setALiberer(null)}>Annuler</Bouton>
              <Bouton type="button" enCours={enCours === 'liberer'} onClick={() => void confirmer()}>
                {aLiberer.messageId ? 'Publier le message' : 'Marquer comme faux positif'}
              </Bouton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <Toast message={message} />
    </Carte>
  );
}
