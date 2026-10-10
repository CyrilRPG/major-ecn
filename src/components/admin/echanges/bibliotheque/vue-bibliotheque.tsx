'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { BookOpen, Eye, EyeOff, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { enregistrerRessource, supprimerRessource } from '@/app/admin/echanges/actions';
import type { Ressource } from '@/lib/echanges/serveur/admin';
import { Bouton, Carte, champ, EnteteCarte, Etiquette, Toast, Vide } from '@/components/admin/cockpit/ui';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { dateParis, useActionServeur } from '../moderation/outils';
import { FormulaireRessource } from './formulaire-ressource';

type Filtres = { q: string; specialite: string; publie: string };
type Specialite = { id: string; nom: string };

/** Filtres dans l'URL (?q=&specialite=&publie=1|0) : la page serveur relit la liste. */
function BarreFiltres({ filtres, specialites }: { filtres: Filtres; specialites: Specialite[] }) {
  const router = useRouter();
  const chemin = usePathname() ?? '/admin/echanges/bibliotheque';
  const [q, setQ] = React.useState(filtres.q);

  const aller = (f: Filtres) => {
    const p = new URLSearchParams();
    if (f.q.trim()) p.set('q', f.q.trim());
    if (f.specialite) p.set('specialite', f.specialite);
    if (f.publie) p.set('publie', f.publie);
    const qs = p.toString();
    router.push(qs ? `${chemin}?${qs}` : chemin);
  };

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); aller({ ...filtres, q }); }}
      className="grid gap-2 px-4 pb-3 sm:grid-cols-2 sm:px-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,14rem)_minmax(0,11rem)_auto]"
    >
      <input aria-label="Rechercher" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Titre, question, réponse, mot-clé" className={cn(champ, 'sm:col-span-2 lg:col-span-1')} />
      <select aria-label="Spécialité" value={filtres.specialite} onChange={(e) => aller({ ...filtres, q, specialite: e.target.value })} className={champ}>
        <option value="">Toutes les spécialités</option>
        {specialites.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
      </select>
      <select aria-label="Statut" value={filtres.publie} onChange={(e) => aller({ ...filtres, q, publie: e.target.value })} className={champ}>
        <option value="">Publiées et masquées</option>
        <option value="1">Publiées</option>
        <option value="0">Masquées</option>
      </select>
      <div className="flex gap-2 sm:col-span-2 lg:col-span-1">
        <Bouton type="submit" variante="contour"><Search /> Filtrer</Bouton>
        {(filtres.q || filtres.specialite || filtres.publie) && (
          <Bouton type="button" variante="fantome" onClick={() => router.push(chemin)}>Effacer</Bouton>
        )}
      </div>
    </form>
  );
}

/**
 * Bibliothèque pédagogique : liste des ressources (titre, spécialité, item,
 * enseignant, publiée / masquée, date de validation), recherche et filtres,
 * création / correction, publication et retrait.
 */
export function VueBibliotheque({ ressources, specialites, filtres }: { ressources: Ressource[]; specialites: Specialite[]; filtres: Filtres }) {
  const { message, setMessage, enCours, lancer, rafraichir } = useActionServeur();
  const [edition, setEdition] = React.useState<{ r: Ressource | null } | null>(null);
  const [aRetirer, setARetirer] = React.useState<Ressource | null>(null);
  const nomSpecialite = (r: Ressource) => r.specialiteNom ?? specialites.find((s) => s.id === r.specialiteId)?.nom ?? null;
  const publiees = ressources.filter((r) => r.publie).length;

  const basculer = (r: Ressource) =>
    void lancer(`publie-${r.id}`, () => enregistrerRessource({ publie: !r.publie }, r.id), r.publie ? 'Ressource masquée aux candidats.' : 'Ressource publiée.');

  const retirer = async () => {
    if (!aRetirer) return;
    const id = aRetirer.id;
    const r = await lancer('retirer', () => supprimerRessource(id), 'Ressource retirée de la bibliothèque.');
    if (r.ok) setARetirer(null);
  };

  return (
    <Carte>
      <EnteteCarte
        icone={BookOpen}
        titre="Bibliothèque pédagogique"
        compteur={ressources.length}
        badge={ressources.length > 0 ? <Etiquette ton="gris">{publiees} publiée{publiees > 1 ? 's' : ''}</Etiquette> : undefined}
        actions={<Bouton taille="sm" onClick={() => setEdition({ r: null })}><Plus /> Nouvelle ressource</Bouton>}
      />
      <p className="px-4 pb-3 text-[13px] text-(--color-ink-soft) sm:px-5">
        Réponses validées par les enseignants, consultables par les candidats indépendamment de leur promotion. La question est anonymisée par défaut.
      </p>
      <BarreFiltres key={`${filtres.q}|${filtres.specialite}|${filtres.publie}`} filtres={filtres} specialites={specialites} />

      {ressources.length === 0 ? (
        <Vide>{filtres.q || filtres.specialite || filtres.publie ? 'Aucune ressource ne correspond à ces filtres.' : 'La bibliothèque est vide : épinglez une réponse dans un groupe puis « Ajouter à la bibliothèque », ou créez une ressource.'}</Vide>
      ) : (
        <ul className="divide-y divide-(--color-border)">
          {ressources.map((r) => {
            const spec = nomSpecialite(r);
            return (
              <li key={r.id} className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-start sm:px-5">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Etiquette ton={r.publie ? 'vert' : 'gris'}>{r.publie ? 'Publiée' : 'Masquée'}</Etiquette>
                    {spec && <Etiquette ton="bordeaux">{spec}</Etiquette>}
                    {r.itemNumero && <Etiquette ton="bleu">Item {r.itemNumero}{r.itemTitre ? ` · ${r.itemTitre}` : ''}</Etiquette>}
                  </div>
                  <p className="mt-1.5 break-words text-[14px] font-semibold text-(--color-ink)">{r.titre}</p>
                  <p className="mt-0.5 line-clamp-2 break-words text-[13px] text-(--color-ink-soft)">{r.reponse}</p>
                  <p className="mt-1.5 text-[12px] text-(--color-ink-muted)">
                    {r.enseignantLabel ?? 'Enseignant non précisé'}
                    {' · '}Validée le {dateParis(r.valideAt, false)}
                    {r.questionAuteur && <> · {r.questionAuteur}</>}
                    {r.motsCles.length > 0 && <> · {r.motsCles.join(', ')}</>}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-1.5">
                  <Bouton taille="xs" variante="contour" onClick={() => setEdition({ r })}><Pencil /> Modifier</Bouton>
                  <Bouton taille="xs" variante="contour" enCours={enCours === `publie-${r.id}`} onClick={() => basculer(r)}>
                    {r.publie ? <><EyeOff /> Masquer</> : <><Eye /> Publier</>}
                  </Bouton>
                  <Bouton taille="xs" variante="fantome" onClick={() => setARetirer(r)} aria-label={`Retirer « ${r.titre} »`}><Trash2 /> Retirer</Bouton>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {edition && (
        <FormulaireRessource
          ressource={edition.r}
          specialites={specialites}
          onFermer={() => setEdition(null)}
          onFait={(m) => { setEdition(null); setMessage(m); rafraichir(); }}
        />
      )}
      {aRetirer && (
        <Dialog open onOpenChange={(o) => { if (!o) setARetirer(null); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Retirer cette ressource ?</DialogTitle>
              <DialogDescription>
                « {aRetirer.titre} » sera supprimée définitivement de la bibliothèque (le message d’origine, s’il existe encore, reste dans sa promotion). Pour la cacher sans la perdre, préférez « Masquer ».
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Bouton type="button" variante="fantome" onClick={() => setARetirer(null)}>Annuler</Bouton>
              <Bouton type="button" variante="danger" enCours={enCours === 'retirer'} onClick={() => void retirer()}><Trash2 /> Retirer</Bouton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <Toast message={message} />
    </Carte>
  );
}
