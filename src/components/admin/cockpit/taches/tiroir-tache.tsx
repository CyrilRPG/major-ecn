'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { History, Lock, MessageSquare, Send, Share2, X } from 'lucide-react';
import type { TacheVisible } from '@/lib/cockpit/server/taches';
import {
  changerStatutTache, commenterTache, detailTache, partagerTache, revoquerPartage, type DetailTache,
} from '@/app/admin/cockpit/actions-taches';
import { DROITS, DROIT_LABEL, peut, peutAdministrer, STATUTS_TACHE, STATUT_TACHE_LABEL, depuis, type Droit } from '@/lib/cockpit/regles';
import { useActionsCockpit } from '../actions-globales';
import { FormulaireTache, type Membre } from '../formulaires';
import { Bouton, champ, Libelle } from '../ui';

const ACTIONS_JOURNAL: Record<string, string> = {
  creation: 'Création', modification: 'Modification', affectation: 'Affectation', report: 'Report', deplacement: 'Déplacement',
  partage: 'Partage', revocation: 'Révocation d’un partage', archivage: 'Archivage', desarchivage: 'Désarchivage',
};

/** Fiche détaillée d'une tâche, en panneau latéral (ordinateur) ou plein écran (mobile). */
export function TiroirTache({ tache, membres, onFermer, onMessage }: { tache: TacheVisible; membres: Membre[]; onFermer: () => void; onMessage: (m: string) => void }) {
  const router = useRouter();
  const { ouvrir } = useActionsCockpit();
  const [detail, setDetail] = React.useState<DetailTache | null>(null);
  const [commentaire, setCommentaire] = React.useState('');
  const [partage, setPartage] = React.useState<{ user: string; droit: Droit }>({ user: '', droit: 'lecture' });
  const [, start] = React.useTransition();
  const proprietaire = peutAdministrer(tache.niveau);
  const modifiable = peut(tache.niveau, 'modification');

  const charger = React.useCallback(async () => {
    const r = await detailTache(tache.id);
    if (r.ok) setDetail(r.data!);
  }, [tache.id]);
  React.useEffect(() => {
    let actif = true;
    detailTache(tache.id).then((r) => { if (actif && r.ok) setDetail(r.data!); });
    return () => { actif = false; };
  }, [tache.id, tache.updated_at]);

  const agir = (f: () => Promise<{ ok: boolean; erreur?: string }>, ok: string) => start(async () => {
    const r = await f();
    onMessage(r.ok ? ok : (r.erreur ?? 'Action impossible.'));
    await charger();
    router.refresh();
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={`Tâche : ${tache.titre}`}>
      <button type="button" aria-label="Fermer" className="absolute inset-0 bg-black/30" onClick={onFermer} />
      <aside className="relative flex h-full w-full max-w-xl flex-col overflow-y-auto bg-(--color-surface) shadow-2xl">
        <header className="sticky top-0 z-10 flex items-start gap-3 border-b border-(--color-border) bg-(--color-surface) px-5 py-4">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-(--color-primary)">
              {tache.niveau === 'proprietaire' ? (tache.assignee_id ? 'Ma tâche, confiée' : 'Ma tâche privée') : `Partagée avec moi · ${DROIT_LABEL[tache.niveau as Droit] ?? tache.niveau}`}
            </p>
            <h2 className="mt-0.5 text-lg font-semibold text-(--color-ink)">{tache.titre}</h2>
            {detail && tache.niveau !== 'proprietaire' && <p className="text-[12.5px] text-(--color-ink-soft)">Propriétaire : {detail.proprietaire}</p>}
          </div>
          <button type="button" onClick={onFermer} aria-label="Fermer" className="grid h-8 w-8 place-items-center rounded-lg text-(--color-ink-soft) hover:bg-(--color-surface-soft)"><X className="h-4 w-4" /></button>
        </header>

        <div className="space-y-6 px-5 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <Libelle>Statut</Libelle>
            <select className={`${champ} w-auto`} disabled={!modifiable} value={tache.statut}
              onChange={(e) => agir(() => changerStatutTache(tache.id, e.target.value as (typeof STATUTS_TACHE)[number]), 'Statut mis à jour.')}>
              {STATUTS_TACHE.map((s) => <option key={s} value={s}>{STATUT_TACHE_LABEL[s]}</option>)}
            </select>
            {tache.statut === 'reponse_recue' && (
              <span className="text-[12px] text-[#2F5DA8]">Une réponse est arrivée : validez avant de terminer.</span>
            )}
            {tache.lien_type === 'enseignant' && tache.lien_id && proprietaire && (
              <Bouton taille="sm" className="ml-auto" onClick={() => ouvrir('relance', { type: 'enseignant', personneId: tache.lien_id!, personneLabel: tache.lien_label ?? undefined, sujet: tache.titre, mission: tache.titre, tacheId: tache.id })}>
                <Send /> Écrire à cet enseignant
              </Bouton>
            )}
          </div>

          {detail && detail.conversations.length > 0 && (
            <section>
              <h3 className="mb-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-(--color-ink)"><MessageSquare className="h-4 w-4 text-(--color-primary)" /> Conversations liées</h3>
              <ul className="space-y-1 text-[13px]">
                {detail.conversations.map((c) => (
                  <li key={c.id}><Link href={`/admin/cockpit/messagerie/${c.id}`} className="text-(--color-primary) hover:underline">{c.interlocuteur} — {c.sujet}</Link></li>
                ))}
              </ul>
            </section>
          )}

          {modifiable ? (
            <section>
              <h3 className="mb-2 text-[13px] font-semibold text-(--color-ink)">Fiche détaillée</h3>
              <FormulaireTache
                key={tache.updated_at}
                id={tache.id}
                membres={proprietaire ? membres : []}
                initial={{
                  titre: tache.titre, description: tache.description, priorite: tache.priorite as never, statut: tache.statut as never,
                  categorie: tache.categorie, echeance: tache.echeance, heure: tache.heure?.slice(0, 5) ?? null, rappel_at: tache.rappel_at,
                  recurrence: tache.recurrence as never, notes: tache.notes, lien_type: tache.lien_type as never, lien_id: tache.lien_id,
                  lien_label: tache.lien_label, assignee_id: tache.assignee_id,
                }}
                onFini={() => { onMessage('Tâche enregistrée.'); void charger(); }}
              />
            </section>
          ) : (
            <section className="space-y-1 text-[13.5px] text-(--color-ink)">
              {tache.description && <p className="whitespace-pre-wrap">{tache.description}</p>}
              <p className="text-[12.5px] text-(--color-ink-soft)"><Lock className="mr-1 inline h-3.5 w-3.5" />Accès en {DROIT_LABEL[tache.niveau as Droit]?.toLowerCase()} seulement.</p>
            </section>
          )}

          {proprietaire && (
            <section>
              <h3 className="mb-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-(--color-ink)"><Share2 className="h-4 w-4 text-(--color-primary)" /> Partage</h3>
              <p className="mb-2 text-[12.5px] text-(--color-ink-soft)">Privée par défaut, même pour les autres administrateurs. Choisissez précisément avec qui la partager.</p>
              {detail && detail.partages.length > 0 && (
                <ul className="mb-2 divide-y divide-(--color-border) rounded-lg border border-(--color-border)">
                  {detail.partages.map((p) => (
                    <li key={p.user_id} className="flex items-center gap-2 px-3 py-2 text-[13px]">
                      <span className="flex-1">{p.nom}</span>
                      <span className="text-(--color-ink-soft)">{DROIT_LABEL[p.droit as Droit]}</span>
                      <button type="button" className="text-[12px] font-medium text-[#B42318] hover:underline" onClick={() => agir(() => revoquerPartage(tache.id, p.user_id), 'Partage révoqué.')}>Révoquer</button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex flex-wrap gap-2">
                <select className={`${champ} min-w-[180px] flex-1`} value={partage.user} onChange={(e) => setPartage({ ...partage, user: e.target.value })} aria-label="Personne">
                  <option value="">Partager avec…</option>
                  {membres.map((m) => <option key={m.id} value={m.id}>{m.nom}</option>)}
                </select>
                <select className={`${champ} w-auto`} value={partage.droit} onChange={(e) => setPartage({ ...partage, droit: e.target.value as Droit })} aria-label="Droit">
                  {DROITS.map((d) => <option key={d} value={d}>{DROIT_LABEL[d]}</option>)}
                </select>
                <Bouton variante="contour" disabled={!partage.user} onClick={() => agir(() => partagerTache(tache.id, partage.user, partage.droit), 'Tâche partagée.')}>Partager</Bouton>
              </div>
            </section>
          )}

          <section>
            <h3 className="mb-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-(--color-ink)"><MessageSquare className="h-4 w-4 text-(--color-primary)" /> Commentaires</h3>
            <ul className="mb-2 space-y-2">
              {detail?.commentaires.map((c) => (
                <li key={c.id} className="rounded-lg bg-(--color-surface-soft) px-3 py-2 text-[13px]">
                  <p className="text-[11.5px] text-(--color-ink-soft)">{c.auteur} · {depuis(c.created_at)}</p>
                  <p className="whitespace-pre-wrap text-(--color-ink)">{c.texte}</p>
                </li>
              ))}
              {detail && detail.commentaires.length === 0 && <li className="text-[12.5px] text-(--color-ink-muted)">Aucun commentaire.</li>}
            </ul>
            {peut(tache.niveau, 'commentaire') && (
              <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (!commentaire.trim()) return; agir(() => commenterTache(tache.id, commentaire), 'Commentaire ajouté.'); setCommentaire(''); }}>
                <input className={champ} value={commentaire} onChange={(e) => setCommentaire(e.target.value)} placeholder="Ajouter un commentaire…" />
                <Bouton type="submit" variante="contour">Envoyer</Bouton>
              </form>
            )}
          </section>

          <section>
            <h3 className="mb-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-(--color-ink)"><History className="h-4 w-4 text-(--color-primary)" /> Historique</h3>
            <ul className="space-y-1 text-[12.5px] text-(--color-ink-soft)">
              {detail?.historique.map((h, i) => (
                <li key={i}>
                  <span className="text-(--color-ink-muted)">{new Date(h.created_at).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                  {' · '}{ACTIONS_JOURNAL[h.action] ?? h.action}{' · '}{h.acteur}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </aside>
    </div>
  );
}
