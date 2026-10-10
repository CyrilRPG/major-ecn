'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Archive, ArrowRight, Copy, Eye, EyeOff, Lock, MessagesSquare, Play, RefreshCw, RotateCcw, ShieldCheck, ShieldOff,
} from 'lucide-react';
import { LIBELLE_STATUT, type ModeParticipants, type StatutGroupe } from '@/lib/echanges/regles';
import {
  changerStatutPromotion, conservationLegale, dupliquerPromotion, synchroniserPromotion, visibilitePromotion,
} from '@/app/admin/echanges/actions';
import { Bouton, Carte, champ, Etiquette, Libelle, Toast, useMessage } from '@/components/admin/cockpit/ui';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Compteur, dateParis, LIBELLE_MODE, PastilleConservation, PastilleStatutGroupe, PastilleVisibilite } from './commun';

/** Miroir des transitions autorisées côté serveur (groupes.ts) — le serveur reste juge. */
const TRANSITIONS: Record<StatutGroupe, StatutGroupe[]> = {
  brouillon: ['active'],
  active: ['cloturee'],
  cloturee: ['active', 'archivee'],
  archivee: [],
};

const TEXTE_TRANSITION: Record<string, { bouton: string; titre: string; texte: string; icone: React.ComponentType<{ className?: string }> }> = {
  'brouillon>active': {
    bouton: 'Activer la promotion', titre: 'Activer la promotion ?', icone: Play,
    texte: 'Les candidats correspondant aux critères sont inscrits et la conversation s’ouvre (à la date d’ouverture si elle est fixée, et si la promotion est visible).',
  },
  'active>cloturee': {
    bouton: 'Clôturer', titre: 'Clôturer la promotion ?', icone: Lock,
    texte: 'La conversation passe en lecture seule : les candidats ne publient plus, l’historique reste consultable. Vous pourrez la rouvrir.',
  },
  'cloturee>active': {
    bouton: 'Rouvrir', titre: 'Rouvrir la promotion ?', icone: RotateCcw,
    texte: 'Les participants peuvent de nouveau publier dans la conversation.',
  },
  'cloturee>archivee': {
    bouton: 'Archiver…', titre: 'Archiver la promotion', icone: Archive,
    texte: 'Définitif : la promotion quitte la liste des promotions en cours et reste consultable en lecture seule dans les archives.',
  },
};

export type SyntheseGroupe = {
  id: string; nom: string; annee: number | null; promotion: string | null; specialite: string | null; description: string | null;
  statut: StatutGroupe; visible: boolean; modeParticipants: ModeParticipants; moderationPrealable: boolean; notifierChaqueMessage: boolean;
  bibliothequeAcces: boolean; createdAt: string; ouverteAt: string | null; dateOuverture: string | null; dateCloturePrevue: string | null;
  dateArchivagePrevue: string | null; alerteArchivageJours: number; clotureeAt: string | null; archiveeAt: string | null; conservationLegale: boolean;
};

export type Compteurs = { candidats: number; enseignants: number; messages: number; questions: number; epingles: number; messages7j: number };
export type Epingle = { id: string; extrait: string; epingleAt: string; dejaEnBibliotheque: boolean };

type Confirmation = { titre: string; texte: string; bouton: string; danger?: boolean; action: () => Promise<{ ok: true } | { ok: false; erreur: string }>; fait: string };

/**
 * Onglet « Synthèse » de la fiche (§83) : compteurs, calendrier, statut et
 * transitions (activer, clôturer, rouvrir, archiver avec versement des
 * épinglés §80), visibilité, duplication (§106), synchronisation,
 * conservation légale (RGPD).
 */
export function SynthesePromotion({
  groupe: g, compteurs, relanceHeures, aReaffecter, enAttente, epingles, peutRgpd,
}: {
  groupe: SyntheseGroupe;
  compteurs: Compteurs;
  relanceHeures: number;
  aReaffecter: number;
  enAttente: number;
  epingles: Epingle[];
  peutRgpd: boolean;
}) {
  const router = useRouter();
  const [confirmation, setConfirmation] = React.useState<Confirmation | null>(null);
  const [archivage, setArchivage] = React.useState(false);
  const [duplication, setDuplication] = React.useState(false);
  const [erreur, setErreur] = React.useState<string | null>(null);
  const [enCours, start] = React.useTransition();
  const [message, setMessage] = useMessage();
  const transitions = TRANSITIONS[g.statut];

  function confirmer() {
    if (!confirmation) return;
    const c = confirmation;
    start(async () => {
      const r = await c.action();
      if (!r.ok) { setErreur(r.erreur); return; }
      setConfirmation(null);
      setErreur(null);
      setMessage(c.fait);
      router.refresh();
    });
  }

  function synchroniser() {
    setErreur(null);
    start(async () => {
      const r = await synchroniserPromotion(g.id);
      if (!r.ok) { setErreur(r.erreur); return; }
      const a = r.data?.ajoutes ?? 0;
      const d = r.data?.retires ?? 0;
      setMessage(a + d === 0 ? 'Synchronisation faite : aucun changement.' : `Synchronisation faite : ${a} ajouté${a > 1 ? 's' : ''}, ${d} retiré${d > 1 ? 's' : ''}.`);
      router.refresh();
    });
  }

  const ligne = (libelle: string, valeur: React.ReactNode) => (
    <div className="flex justify-between gap-3 py-1.5 text-[13px]">
      <dt className="text-(--color-ink-soft)">{libelle}</dt>
      <dd className="text-right font-medium text-(--color-ink)">{valeur}</dd>
    </div>
  );

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="min-w-0 space-y-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          <Compteur valeur={compteurs.candidats} libelle="Candidats actifs" />
          <Compteur valeur={compteurs.enseignants} libelle="Enseignants actifs" />
          <Compteur valeur={compteurs.messages} libelle="Messages publiés" />
          <Compteur valeur={compteurs.messages7j} libelle="Messages 7 j" />
          <Compteur valeur={compteurs.questions} libelle="Questions posées" />
          <Compteur valeur={compteurs.epingles} libelle="Réponses épinglées" />
        </div>
        {(enAttente > 0 || aReaffecter > 0) && (
          <p className="rounded-xl bg-[#FFF3E0] px-3 py-2 text-[13px] text-[#B45309]">
            {enAttente > 0 && <>{enAttente} question{enAttente > 1 ? 's' : ''} en attente de réponse (relance après {relanceHeures} h). </>}
            {aReaffecter > 0 && <>{aReaffecter} question{aReaffecter > 1 ? 's' : ''} à réaffecter (enseignant retiré).</>}
          </p>
        )}

        <Carte className="p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-[15px] font-semibold text-(--color-ink)">Statut</h2>
            <PastilleStatutGroupe statut={g.statut} />
            <PastilleVisibilite visible={g.visible} />
            {g.conservationLegale && <PastilleConservation />}
          </div>
          <p className="mt-1 text-[12.5px] text-(--color-ink-soft)">
            {g.statut === 'brouillon' && 'Brouillon : invisible des candidats. Vérifiez critères et enseignants, puis activez.'}
            {g.statut === 'active' && 'Active : les participants échangent. La clôture fige la conversation en lecture seule.'}
            {g.statut === 'cloturee' && 'Clôturée : lecture seule. Rouvrez-la ou archivez-la.'}
            {g.statut === 'archivee' && 'Archivée : consultable en lecture seule. Aucune transition possible.'}
          </p>
          {transitions.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {transitions.map((vers) => {
                const t = TEXTE_TRANSITION[`${g.statut}>${vers}`];
                const Icone = t.icone;
                return (
                  <Bouton
                    key={vers}
                    taille="sm"
                    variante={vers === 'archivee' ? 'contour' : 'plein'}
                    disabled={enCours}
                    onClick={() => {
                      setErreur(null);
                      if (vers === 'archivee') { setArchivage(true); return; }
                      setConfirmation({
                        titre: t.titre, texte: t.texte, bouton: t.bouton,
                        action: () => changerStatutPromotion(g.id, vers),
                        fait: `Promotion ${LIBELLE_STATUT[vers].toLowerCase()}.`,
                      });
                    }}
                  >
                    <Icone /> {t.bouton}
                  </Bouton>
                );
              })}
            </div>
          )}
        </Carte>

        <Carte className="p-4 sm:p-5">
          <h2 className="text-[15px] font-semibold text-(--color-ink)">Actions</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-(--color-border) p-3">
              <p className="text-[13px] font-medium text-(--color-ink)">{g.visible ? 'Masquer aux candidats' : 'Rendre visible'}</p>
              <p className="mb-2 text-[12px] text-(--color-ink-soft)">Désactive la promotion côté candidats sans rien supprimer (messages, participants, enseignants conservés).</p>
              <Bouton
                taille="sm"
                variante="contour"
                disabled={enCours || g.statut === 'archivee'}
                onClick={() => {
                  setErreur(null);
                  setConfirmation(g.visible
                    ? { titre: 'Masquer la promotion ?', texte: 'Les candidats ne la verront plus dans leurs échanges. Rien n’est supprimé ; vous pourrez la rendre visible à tout moment.', bouton: 'Masquer', action: () => visibilitePromotion(g.id, false), fait: 'Promotion masquée aux candidats.' }
                    : { titre: 'Rendre la promotion visible ?', texte: 'Les candidats participants la retrouvent dans leurs échanges (selon son statut et sa date d’ouverture).', bouton: 'Rendre visible', action: () => visibilitePromotion(g.id, true), fait: 'Promotion de nouveau visible.' });
                }}
              >
                {g.visible ? <><EyeOff /> Masquer</> : <><Eye /> Rendre visible</>}
              </Bouton>
            </div>
            <div className="rounded-xl border border-(--color-border) p-3">
              <p className="text-[13px] font-medium text-(--color-ink)">Synchroniser les participants</p>
              <p className="mb-2 text-[12px] text-(--color-ink-soft)">Applique tout de suite les critères aux inscriptions (sinon : synchronisation automatique périodique).</p>
              <Bouton taille="sm" variante="contour" disabled={enCours || g.statut === 'archivee' || g.modeParticipants === 'manuel'} onClick={synchroniser}>
                <RefreshCw /> Synchroniser maintenant
              </Bouton>
            </div>
            <div className="rounded-xl border border-(--color-border) p-3">
              <p className="text-[13px] font-medium text-(--color-ink)">Dupliquer la configuration</p>
              <p className="mb-2 text-[12px] text-(--color-ink-soft)">Nouvelle promotion en brouillon avec les mêmes paramètres et critères — sans candidats ni conversation.</p>
              <Bouton taille="sm" variante="contour" disabled={enCours} onClick={() => { setErreur(null); setDuplication(true); }}>
                <Copy /> Dupliquer…
              </Bouton>
            </div>
            <div className="rounded-xl border border-(--color-border) p-3">
              <p className="text-[13px] font-medium text-(--color-ink)">Conversation</p>
              <p className="mb-2 text-[12px] text-(--color-ink-soft)">Ouvrir l’espace d’échanges tel que l’équipe le voit{g.statut === 'archivee' || g.statut === 'cloturee' ? ' (lecture seule)' : ''}.</p>
              <Link href={`/echanges/${g.id}`} className="inline-flex h-8 items-center gap-1.5 rounded-(--radius-button) bg-(--color-primary) px-3 text-[13px] font-medium text-white hover:bg-(--color-primary-deep) focus-ring">
                <MessagesSquare className="h-4 w-4" /> Ouvrir la conversation
              </Link>
            </div>
            {peutRgpd && (
              <div className="rounded-xl border border-(--color-border) p-3 sm:col-span-2">
                <p className="flex items-center gap-2 text-[13px] font-medium text-(--color-ink)">
                  Conservation légale {g.conservationLegale ? <Etiquette ton="bordeaux">Activée</Etiquette> : <Etiquette ton="gris">Désactivée</Etiquette>}
                </p>
                <p className="mb-2 text-[12px] text-(--color-ink-soft)">En cas de litige ou d’obligation légale : bloque la purge automatique et l’effacement RGPD des messages de cette promotion.</p>
                <Bouton
                  taille="sm"
                  variante="contour"
                  disabled={enCours}
                  onClick={() => {
                    setErreur(null);
                    setConfirmation(g.conservationLegale
                      ? { titre: 'Lever la conservation légale ?', texte: 'La purge automatique et l’effacement RGPD s’appliqueront de nouveau à cette promotion.', bouton: 'Lever', danger: true, action: () => conservationLegale(g.id, false), fait: 'Conservation légale levée.' }
                      : { titre: 'Activer la conservation légale ?', texte: 'Aucun message de cette promotion ne sera purgé ni effacé tant que la conservation est active.', bouton: 'Activer', action: () => conservationLegale(g.id, true), fait: 'Conservation légale activée.' });
                  }}
                >
                  {g.conservationLegale ? <><ShieldOff /> Lever la conservation</> : <><ShieldCheck /> Activer la conservation</>}
                </Bouton>
              </div>
            )}
          </div>
          {erreur && !confirmation && !archivage && !duplication && <p role="alert" className="mt-3 rounded-lg bg-[#FCE4E4] px-3 py-2 text-[13px] text-[#B42318]">{erreur}</p>}
        </Carte>
      </div>

      <div className="space-y-4">
        <Carte className="p-4 sm:p-5">
          <h2 className="text-[15px] font-semibold text-(--color-ink)">Configuration</h2>
          <dl className="mt-1 divide-y divide-(--color-border)">
            {ligne('Année / promotion', [g.annee, g.promotion].filter(Boolean).join(' · ') || '—')}
            {ligne('Spécialité', g.specialite ?? 'Toutes')}
            {ligne('Participants', LIBELLE_MODE[g.modeParticipants].titre)}
            {ligne('Modération préalable', g.moderationPrealable ? 'Oui' : 'Non')}
            {ligne('Notification à chaque message', g.notifierChaqueMessage ? 'Oui' : 'Non')}
            {ligne('Accès bibliothèque', g.bibliothequeAcces ? 'Oui' : 'Non')}
            {ligne('Relance enseignants', `${relanceHeures} h`)}
          </dl>
          {g.description && <p className="mt-2 text-[12.5px] text-(--color-ink-soft)">{g.description}</p>}
        </Carte>
        <Carte className="p-4 sm:p-5">
          <h2 className="text-[15px] font-semibold text-(--color-ink)">Calendrier <span className="text-[12px] font-normal text-(--color-ink-muted)">— heure de Paris</span></h2>
          <dl className="mt-1 divide-y divide-(--color-border)">
            {ligne('Créée le', dateParis(g.createdAt, true))}
            {ligne('Ouverture prévue', dateParis(g.dateOuverture, true))}
            {g.ouverteAt && ligne('Activée le', dateParis(g.ouverteAt, true))}
            {ligne('Clôture prévue', dateParis(g.dateCloturePrevue, true))}
            {g.clotureeAt && ligne('Clôturée le', dateParis(g.clotureeAt, true))}
            {ligne('Archivage prévu', g.dateArchivagePrevue ? `${dateParis(g.dateArchivagePrevue, true)} (alerte ${g.alerteArchivageJours} j avant)` : '—')}
            {g.archiveeAt && ligne('Archivée le', dateParis(g.archiveeAt, true))}
          </dl>
        </Carte>
      </div>

      <Dialog open={!!confirmation} onOpenChange={(o) => { if (!o && !enCours) { setConfirmation(null); setErreur(null); } }}>
        <DialogContent>
          {confirmation && (
            <>
              <DialogHeader>
                <DialogTitle>{confirmation.titre}</DialogTitle>
                <DialogDescription>{confirmation.texte}</DialogDescription>
              </DialogHeader>
              {erreur && <p role="alert" className="text-[13px] text-[#B42318]">{erreur}</p>}
              <DialogFooter>
                <Bouton variante="fantome" onClick={() => { setConfirmation(null); setErreur(null); }} disabled={enCours}>Annuler</Bouton>
                <Bouton variante={confirmation.danger ? 'danger' : 'plein'} enCours={enCours} onClick={confirmer}>{confirmation.bouton}</Bouton>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {archivage && (
        <DialogueArchivage
          groupeId={g.id}
          epingles={epingles}
          onFermer={() => setArchivage(false)}
          onFait={() => { setArchivage(false); setMessage('Promotion archivée.'); router.refresh(); }}
        />
      )}
      {duplication && (
        <DialogueDuplication groupe={g} onFermer={() => setDuplication(false)} />
      )}
      <Toast message={message} />
    </div>
  );
}

/* ─────────────────────────── Archivage (§80) ─────────────────────────── */

function DialogueArchivage({ groupeId, epingles, onFermer, onFait }: { groupeId: string; epingles: Epingle[]; onFermer: () => void; onFait: () => void }) {
  const nouveaux = epingles.filter((e) => !e.dejaEnBibliotheque);
  const [choix, setChoix] = React.useState<'tout' | 'selection' | 'aucun'>(nouveaux.length > 0 ? 'tout' : 'aucun');
  const [ids, setIds] = React.useState<Set<string>>(() => new Set(nouveaux.map((e) => e.id)));
  const [erreur, setErreur] = React.useState<string | null>(null);
  const [enCours, start] = React.useTransition();

  const basculer = (id: string) => setIds((s) => {
    const n = new Set(s);
    if (n.has(id)) n.delete(id); else n.add(id);
    return n;
  });

  function archiver() {
    const transfert = choix === 'selection' ? (ids.size > 0 ? [...ids] : 'aucun') : choix;
    start(async () => {
      const r = await changerStatutPromotion(groupeId, 'archivee', transfert);
      if (!r.ok) { setErreur(r.erreur); return; }
      onFait();
    });
  }

  return (
    <Dialog open onOpenChange={(o) => { if (!o && !enCours) onFermer(); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Archiver la promotion</DialogTitle>
          <DialogDescription>
            {TEXTE_TRANSITION['cloturee>archivee'].texte} Choisissez les réponses épinglées à verser dans la bibliothèque pédagogique.
          </DialogDescription>
        </DialogHeader>
        {epingles.length === 0 ? (
          <p className="rounded-lg bg-(--color-surface-soft) px-3 py-2 text-[13px] text-(--color-ink-soft)">Aucune réponse épinglée dans cette promotion.</p>
        ) : (
          <div className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Versement dans la bibliothèque">
              {([
                ['tout', 'Tout verser', `${nouveaux.length} réponse${nouveaux.length > 1 ? 's' : ''} non encore en bibliothèque`],
                ['selection', 'Choisir', `${ids.size} sélectionnée${ids.size > 1 ? 's' : ''}`],
                ['aucun', 'Ne rien verser', 'La bibliothèque reste inchangée'],
              ] as const).map(([v, titre, aide]) => (
                <label key={v} className={`flex cursor-pointer gap-2 rounded-xl border p-3 text-[13px] ${choix === v ? 'border-(--color-primary) bg-(--color-primary-soft)' : 'border-(--color-border) hover:bg-(--color-surface-soft)'}`}>
                  <input type="radio" name="transfert" className="mt-0.5 accent-(--color-primary)" checked={choix === v} onChange={() => setChoix(v)} />
                  <span><span className="block font-medium text-(--color-ink)">{titre}</span><span className="text-[12px] text-(--color-ink-soft)">{aide}</span></span>
                </label>
              ))}
            </div>
            {choix === 'selection' && (
              <ul className="max-h-72 divide-y divide-(--color-border) overflow-y-auto rounded-lg border border-(--color-border)">
                {epingles.map((e) => (
                  <li key={e.id}>
                    <label className={`flex gap-3 px-3 py-2 text-[13px] ${e.dejaEnBibliotheque ? 'opacity-70' : 'cursor-pointer hover:bg-(--color-surface-soft)'}`}>
                      <input type="checkbox" className="mt-0.5 accent-(--color-primary)" disabled={e.dejaEnBibliotheque} checked={ids.has(e.id)} onChange={() => basculer(e.id)} />
                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-3 text-(--color-ink)">{e.extrait || '(réponse sans texte)'}</span>
                        <span className="mt-0.5 flex flex-wrap items-center gap-2 text-[11.5px] text-(--color-ink-muted)">
                          Épinglée le {dateParis(e.epingleAt)}
                          {e.dejaEnBibliotheque && <Etiquette ton="vert">Déjà en bibliothèque</Etiquette>}
                        </span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {erreur && <p role="alert" className="text-[13px] text-[#B42318]">{erreur}</p>}
        <DialogFooter>
          <Bouton variante="fantome" onClick={onFermer} disabled={enCours}>Annuler</Bouton>
          <Bouton variante="danger" enCours={enCours} onClick={archiver}><Archive /> Archiver définitivement</Bouton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─────────────────────────── Duplication (§106) ─────────────────────────── */

function DialogueDuplication({ groupe, onFermer }: { groupe: SyntheseGroupe; onFermer: () => void }) {
  const [nom, setNom] = React.useState(`${groupe.nom} (copie)`);
  const [annee, setAnnee] = React.useState(groupe.annee ? String(groupe.annee + 1) : '');
  const [promotion, setPromotion] = React.useState(groupe.promotion ?? '');
  const [resultat, setResultat] = React.useState<{ id: string; enseignantsProposes: { userId: string; prenom: string | null }[] } | null>(null);
  const [erreur, setErreur] = React.useState<string | null>(null);
  const [enCours, start] = React.useTransition();

  function dupliquer(e: React.FormEvent) {
    e.preventDefault();
    if (nom.trim().length < 2) { setErreur('Nom obligatoire (2 caractères au moins).'); return; }
    const a = Number.parseInt(annee, 10);
    start(async () => {
      const r = await dupliquerPromotion(groupe.id, { nom: nom.trim(), annee: Number.isFinite(a) ? a : null, promotion: promotion.trim() || null });
      if (!r.ok || !r.data) { setErreur(r.ok ? 'Duplication impossible.' : r.erreur); return; }
      setErreur(null);
      setResultat(r.data);
    });
  }

  return (
    <Dialog open onOpenChange={(o) => { if (!o && !enCours) onFermer(); }}>
      <DialogContent>
        {resultat ? (
          <>
            <DialogHeader>
              <DialogTitle>Promotion dupliquée</DialogTitle>
              <DialogDescription>« {nom.trim()} » est créée en brouillon avec la même configuration. Aucun candidat, message, signalement ni sanction n’a été copié.</DialogDescription>
            </DialogHeader>
            <div>
              <p className="mb-1.5 text-[13px] font-medium text-(--color-ink)">Enseignants proposés</p>
              {resultat.enseignantsProposes.length === 0 ? (
                <p className="text-[13px] text-(--color-ink-muted)">Aucun enseignant actif dans la promotion d’origine.</p>
              ) : (
                <>
                  <ul className="flex flex-wrap gap-1.5">
                    {resultat.enseignantsProposes.map((p) => <li key={p.userId}><Etiquette ton="bleu">{p.prenom ?? 'Sans identité publique'}</Etiquette></li>)}
                  </ul>
                  <p className="mt-1.5 text-[12px] text-(--color-ink-soft)">Ils ne sont pas réaffectés automatiquement : ajoutez-les depuis l’onglet « Enseignants » de la nouvelle promotion.</p>
                </>
              )}
            </div>
            <DialogFooter>
              <Bouton variante="fantome" onClick={onFermer}>Fermer</Bouton>
              <Link href={`/admin/echanges/groupes/${resultat.id}?onglet=enseignants`} className="inline-flex h-10 items-center justify-center gap-1.5 rounded-(--radius-button) bg-(--color-primary) px-4 text-sm font-medium text-white hover:bg-(--color-primary-deep) focus-ring">
                Ouvrir la nouvelle promotion <ArrowRight className="h-4 w-4" />
              </Link>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={dupliquer} className="grid gap-4">
            <DialogHeader>
              <DialogTitle>Dupliquer la configuration</DialogTitle>
              <DialogDescription>Seuls les paramètres et les critères sont copiés ; les dates sont à refixer dans la nouvelle promotion.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Libelle htmlFor="dup-nom">Nom *</Libelle>
                <input id="dup-nom" autoFocus required maxLength={120} className={champ} value={nom} onChange={(e) => setNom(e.target.value)} />
              </div>
              <div>
                <Libelle htmlFor="dup-annee">Année</Libelle>
                <input id="dup-annee" inputMode="numeric" maxLength={4} className={champ} value={annee} onChange={(e) => setAnnee(e.target.value.replace(/\D/g, ''))} />
              </div>
              <div>
                <Libelle htmlFor="dup-promotion">Promotion</Libelle>
                <input id="dup-promotion" maxLength={80} className={champ} value={promotion} onChange={(e) => setPromotion(e.target.value)} />
              </div>
            </div>
            {erreur && <p role="alert" className="text-[13px] text-[#B42318]">{erreur}</p>}
            <DialogFooter>
              <Bouton type="button" variante="fantome" onClick={onFermer} disabled={enCours}>Annuler</Bouton>
              <Bouton type="submit" enCours={enCours}><Copy /> Dupliquer</Bouton>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
