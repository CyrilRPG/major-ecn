'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ArchiveRestore, Paperclip, Search, Trash2 } from 'lucide-react';
import { restaurer } from '@/app/admin/echanges/actions';
import type { MessageSupprime } from '@/lib/echanges/serveur/admin';
import { Bouton, Carte, champ, EnteteCarte, Etiquette, Toast, Vide } from '@/components/admin/cockpit/ui';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { BarreSelection, CaseACocher, Contenu, dateParis, Personne, useActionServeur, useSelection } from './outils';

export const ORIGINES: { id: string; libelle: string; ton: 'gris' | 'orange' | 'bordeaux' | 'violet' }[] = [
  { id: 'auteur', libelle: 'Par l’auteur', ton: 'gris' },
  { id: 'moderation', libelle: 'Modération', ton: 'orange' },
  { id: 'refus', libelle: 'Refus (file de validation)', ton: 'bordeaux' },
  { id: 'rgpd', libelle: 'Effacement RGPD', ton: 'violet' },
];

type Filtres = { groupe: string; origine: string; q: string };

/** Filtres dans l'URL (?groupe=&origine=&q=) : la page serveur relit la liste. */
function BarreFiltres({ filtres, groupes }: { filtres: Filtres; groupes: { id: string; nom: string }[] }) {
  const router = useRouter();
  const chemin = usePathname() ?? '/admin/echanges/supprimes';
  const [q, setQ] = React.useState(filtres.q);

  const aller = (f: Filtres) => {
    const p = new URLSearchParams();
    if (f.groupe) p.set('groupe', f.groupe);
    if (f.origine) p.set('origine', f.origine);
    if (f.q.trim()) p.set('q', f.q.trim());
    const qs = p.toString();
    router.push(qs ? `${chemin}?${qs}` : chemin);
  };

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); aller({ ...filtres, q }); }}
      className="grid gap-2 px-4 pb-3 sm:grid-cols-2 sm:px-5 lg:grid-cols-[minmax(0,14rem)_minmax(0,14rem)_minmax(0,1fr)_auto]"
    >
      <select aria-label="Promotion" value={filtres.groupe} onChange={(e) => aller({ ...filtres, q, groupe: e.target.value })} className={champ}>
        <option value="">Toutes les promotions</option>
        {groupes.map((g) => <option key={g.id} value={g.id}>{g.nom}</option>)}
      </select>
      <select aria-label="Origine de la suppression" value={filtres.origine} onChange={(e) => aller({ ...filtres, q, origine: e.target.value })} className={champ}>
        <option value="">Toutes les origines</option>
        {ORIGINES.map((o) => <option key={o.id} value={o.id}>{o.libelle}</option>)}
      </select>
      <input aria-label="Mot-clé" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Mot-clé dans le contenu" className={cn(champ, 'sm:col-span-2 lg:col-span-1')} />
      <div className="flex gap-2 sm:col-span-2 lg:col-span-1">
        <Bouton type="submit" variante="contour"><Search /> Filtrer</Bouton>
        {(filtres.groupe || filtres.origine || filtres.q) && (
          <Bouton type="button" variante="fantome" onClick={() => router.push(chemin)}>Effacer</Bouton>
        )}
      </div>
    </form>
  );
}

/**
 * Liste des messages supprimés : groupe, auteur, contenu, suppression (date,
 * personne, origine), échéance de purge. Restauration groupée réservée au
 * Super Admin (capacité « restaurer »), impossible après la purge.
 */
export function ListeSupprimes({ messages, groupes, filtres, peutRestaurer, conservationJours }: {
  messages: MessageSupprime[];
  groupes: { id: string; nom: string }[];
  filtres: Filtres;
  peutRestaurer: boolean;
  conservationJours: number;
}) {
  const restaurables = messages.filter((m) => !m.purgeAt).map((m) => m.id);
  const sel = useSelection(restaurables);
  const { message, enCours, lancer } = useActionServeur();
  const [confirmer, setConfirmer] = React.useState(false);

  const lancerRestauration = async () => {
    const r = await lancer('restaurer', () => restaurer(sel.choisis), (d) => {
      const n = d?.restaures ?? 0;
      return `${n} message${n > 1 ? 's' : ''} restauré${n > 1 ? 's' : ''} dans ${n > 1 ? 'leurs promotions' : 'sa promotion'}.`;
    });
    if (r.ok) { sel.vider(); setConfirmer(false); }
  };

  const origine = (id: string | null) => ORIGINES.find((o) => o.id === id);

  return (
    <Carte>
      <EnteteCarte icone={Trash2} titre="Messages supprimés" compteur={messages.length} />
      <p className="px-4 pb-3 text-[13px] text-(--color-ink-soft) sm:px-5">
        Conservés {conservationJours} jour{conservationJours > 1 ? 's' : ''} après suppression, puis purgés définitivement (contenu et pièces jointes).
        {peutRestaurer ? ' Vous pouvez restaurer un message tant qu’il n’est pas purgé.' : ' Seul le Super Admin peut restaurer un message.'}
      </p>
      <BarreFiltres key={`${filtres.groupe}|${filtres.origine}|${filtres.q}`} filtres={filtres} groupes={groupes} />

      {messages.length === 0 ? (
        <Vide>{filtres.groupe || filtres.origine || filtres.q ? 'Aucun message supprimé ne correspond à ces filtres.' : 'Aucun message supprimé.'}</Vide>
      ) : (
        <>
          {peutRestaurer && restaurables.length > 0 && (
            <BarreSelection total={restaurables.length} choisis={sel.choisis.length} tous={sel.tous} onTous={sel.basculerTous}>
              <Bouton taille="sm" disabled={sel.choisis.length === 0} onClick={() => setConfirmer(true)}>
                <ArchiveRestore /> Restaurer
              </Bouton>
            </BarreSelection>
          )}
          <ul className="divide-y divide-(--color-border)">
            {messages.map((m) => {
              const o = origine(m.origine);
              return (
                <li key={m.id} className="flex gap-3 px-4 py-3.5 sm:px-5">
                  {peutRestaurer && (
                    m.purgeAt
                      ? <span className="w-4 shrink-0" aria-hidden />
                      : <CaseACocher coche={sel.estChoisi(m.id)} onChange={() => sel.basculer(m.id)} libelle="Sélectionner ce message" className="mt-1" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px]">
                      <Etiquette ton="bordeaux">{m.groupe}</Etiquette>
                      <Personne p={m.auteur} />
                      <span className="text-[12px] text-(--color-ink-muted)">publié le {dateParis(m.createdAt)}</span>
                    </div>
                    {m.purgeAt
                      ? <p className="mt-2 text-[13px] italic text-(--color-ink-muted)">Contenu purgé.</p>
                      : <Contenu texte={m.contenu} className="mt-2" />}
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-(--color-ink-soft)">
                      <Etiquette ton={o?.ton ?? 'gris'}>{o?.libelle ?? m.origine ?? 'Origine inconnue'}</Etiquette>
                      <span>
                        Supprimé le {dateParis(m.supprimeAt)}
                        {m.supprimePar && <> par <span className="font-medium text-(--color-ink)">{m.supprimePar.nom}</span></>}
                      </span>
                      {m.nbPieces > 0 && <span className="inline-flex items-center gap-1"><Paperclip className="h-3 w-3" /> {m.nbPieces}</span>}
                      {m.purgeAt
                        ? <Etiquette ton="gris">Purgé le {dateParis(m.purgeAt, false)}</Etiquette>
                        : m.purgeLe && <span className="text-(--color-ink-muted)">Purge prévue le {dateParis(m.purgeLe, false)}</span>}
                    </div>
                    {m.motif && <p className="mt-1 text-[12px] text-(--color-ink-muted)">Motif de modération : {m.motif}</p>}
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {confirmer && (
        <Dialog open onOpenChange={(v) => { if (!v) setConfirmer(false); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Restaurer {sel.choisis.length} message{sel.choisis.length > 1 ? 's' : ''}</DialogTitle>
              <DialogDescription>
                Les messages réapparaissent à leur place dans la conversation de leur promotion, visibles de tous les participants. L’opération est inscrite au journal d’audit.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Bouton type="button" variante="fantome" onClick={() => setConfirmer(false)}>Annuler</Bouton>
              <Bouton type="button" enCours={enCours === 'restaurer'} onClick={() => void lancerRestauration()}><ArchiveRestore /> Restaurer</Bouton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <Toast message={message} />
    </Carte>
  );
}
