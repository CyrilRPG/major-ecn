'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { BadgeCheck, Mail, Pencil, Pin, Search, Send, UserCheck, UserMinus, UserPlus } from 'lucide-react';
import type { EnseignantGroupe } from '@/lib/echanges/serveur/admin';
import { libelleEnseignant } from '@/lib/echanges/regles';
import { affectation as enregistrerAffectation, identiteEnseignant } from '@/app/admin/echanges/actions';
import { Avatar, Bouton, Carte, champ, Etiquette, Libelle, Toast, Vide, useMessage } from '@/components/admin/cockpit/ui';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export type AvatarMode = 'initiale' | 'majorecn' | 'neutre' | 'photo';

/** Membre de l'équipe (compte enseignant / administrateur) et son identité publique éventuelle. */
export type MembreEquipe = {
  userId: string; nom: string; email: string | null; role: string;
  prenomPublic: string | null; qualite: string | null; specialite: string | null; avatarMode: AvatarMode | null;
};

const LIBELLE_AVATAR: Record<Exclude<AvatarMode, 'photo'>, string> = {
  initiale: 'Initiale du prénom public',
  majorecn: 'Logo Major ECN',
  neutre: 'Avatar neutre',
};

type Affectation = {
  userId: string; qualite: string; specialitePublique: string; emailNotification: string;
  peutPublier: boolean; peutEpingler: boolean; actif: boolean; annoncer: boolean;
};

type Etape =
  | { type: 'ajout' }
  | { type: 'identite'; membre: MembreEquipe; suite: 'affectation' | null }
  | { type: 'affectation'; membre: MembreEquipe; valeurs: Affectation; nouveau: boolean }
  | { type: 'retrait'; e: EnseignantGroupe };

/**
 * Onglet « Enseignants » de la fiche (§76, §85, §113-115). Le nom réel n'est
 * visible QUE dans ce back-office ; les candidats ne voient que l'identité
 * publique « Prénom · qualité ». Un enseignant sans identité publique doit
 * d'abord en recevoir une.
 */
export function EnseignantsPromotion({
  groupeId, enseignants, equipe, lectureSeule,
}: {
  groupeId: string;
  enseignants: EnseignantGroupe[];
  equipe: MembreEquipe[];
  lectureSeule?: boolean;
}) {
  const router = useRouter();
  const [etape, setEtape] = React.useState<Etape | null>(null);
  const [erreur, setErreur] = React.useState<string | null>(null);
  const [enCours, start] = React.useTransition();
  const [message, setMessage] = useMessage();
  const parId = React.useMemo(() => new Map(equipe.map((m) => [m.userId, m])), [equipe]);

  const membreDe = (e: EnseignantGroupe): MembreEquipe => parId.get(e.userId) ?? {
    userId: e.userId, nom: e.nom, email: e.email, role: 'professor',
    prenomPublic: e.prenomPublic, qualite: e.qualiteIdentite, specialite: null, avatarMode: null,
  };

  const valeursDe = (e: EnseignantGroupe, actif = e.actif): Affectation => ({
    userId: e.userId, qualite: e.qualite ?? '', specialitePublique: e.specialitePublique ?? '', emailNotification: e.emailNotification ?? '',
    peutPublier: e.peutPublier, peutEpingler: e.peutEpingler, actif, annoncer: false,
  });

  function fermer() {
    if (enCours) return;
    setEtape(null);
    setErreur(null);
  }

  /** Après le choix d'un membre (ajout) : identité publique d'abord si elle manque. */
  function choisir(m: MembreEquipe) {
    setErreur(null);
    const existante = enseignants.find((e) => e.userId === m.userId);
    const valeurs: Affectation = existante
      ? { ...valeursDe(existante, true), annoncer: true }
      : { userId: m.userId, qualite: '', specialitePublique: '', emailNotification: '', peutPublier: true, peutEpingler: true, actif: true, annoncer: true };
    if (!m.prenomPublic) setEtape({ type: 'identite', membre: m, suite: 'affectation' });
    else setEtape({ type: 'affectation', membre: m, valeurs, nouveau: true });
  }

  function sauverIdentite(m: MembreEquipe, i: { prenomPublic: string; qualite: string; specialite: string; avatarMode: AvatarMode }, suite: 'affectation' | null) {
    setErreur(null);
    start(async () => {
      const r = await identiteEnseignant(m.userId, { prenomPublic: i.prenomPublic.trim(), qualite: i.qualite.trim(), specialite: i.specialite.trim() || null, avatarMode: i.avatarMode });
      if (!r.ok) { setErreur(r.erreur); return; }
      const maj: MembreEquipe = { ...m, prenomPublic: i.prenomPublic.trim(), qualite: i.qualite.trim() || 'Enseignant Major ECN', specialite: i.specialite.trim() || null, avatarMode: i.avatarMode };
      router.refresh();
      if (suite === 'affectation') {
        const existante = enseignants.find((e) => e.userId === m.userId);
        setEtape({
          type: 'affectation', membre: maj, nouveau: true,
          valeurs: existante
            ? { ...valeursDe(existante, true), annoncer: true }
            : { userId: m.userId, qualite: '', specialitePublique: '', emailNotification: '', peutPublier: true, peutEpingler: true, actif: true, annoncer: true },
        });
      } else {
        setEtape(null);
        setMessage('Identité publique enregistrée.');
      }
    });
  }

  function sauverAffectation(v: Affectation, texte: string) {
    setErreur(null);
    start(async () => {
      const r = await enregistrerAffectation(groupeId, {
        userId: v.userId, qualite: v.qualite.trim() || null, specialitePublique: v.specialitePublique.trim() || null,
        emailNotification: v.emailNotification.trim() || null, peutPublier: v.peutPublier, peutEpingler: v.peutEpingler,
        actif: v.actif, annoncer: v.actif ? v.annoncer : false,
      });
      if (!r.ok) { setErreur(r.erreur); return; }
      setEtape(null);
      setMessage(texte);
      router.refresh();
    });
  }

  const actifs = enseignants.filter((e) => e.actif);
  const inactifs = enseignants.filter((e) => !e.actif);

  return (
    <Carte>
      <div className="flex flex-wrap items-center gap-3 border-b border-(--color-border) p-3 sm:p-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] font-semibold text-(--color-ink)">Enseignants de la promotion <span className="text-(--color-primary)">({actifs.length})</span></h2>
          <p className="text-[12.5px] text-(--color-ink-soft)">Nom réel visible uniquement ici. Les candidats voient l’identité publique « Prénom · qualité ».</p>
        </div>
        {!lectureSeule && <Bouton taille="sm" onClick={() => { setErreur(null); setEtape({ type: 'ajout' }); }}><UserPlus /> Ajouter un enseignant</Bouton>}
      </div>

      {erreur && !etape && <p role="alert" className="mx-3 mt-3 rounded-lg bg-[#FCE4E4] px-3 py-2 text-[13px] text-[#B42318] sm:mx-4">{erreur}</p>}

      {enseignants.length === 0 ? (
        <Vide>Aucun enseignant affecté. Les candidats ne pourront adresser de question à personne.</Vide>
      ) : (
        <ul className="divide-y divide-(--color-border)">
          {[...actifs, ...inactifs].map((e) => {
            const qualite = e.qualite || e.qualiteIdentite;
            return (
              <li key={e.affectationId} className={`flex flex-wrap items-start gap-3 px-3 py-3 sm:px-4 ${e.actif ? '' : 'bg-(--color-surface-soft)/60'}`}>
                <Avatar nom={e.nom} />
                <div className="min-w-0 flex-1 basis-60">
                  <p className="flex flex-wrap items-center gap-2 text-[14px] font-semibold text-(--color-ink)">
                    {e.nom}
                    {!e.actif && <Etiquette ton="gris">Retiré</Etiquette>}
                  </p>
                  <p className="truncate text-[12.5px] text-(--color-ink-muted)">{e.email ?? '—'}</p>
                  <p className="mt-1 text-[13px]">
                    {e.prenomPublic
                      ? <span className="inline-flex items-center gap-1 text-(--color-ink)"><BadgeCheck className="h-3.5 w-3.5 text-(--color-primary)" /> {libelleEnseignant(e.prenomPublic, qualite)}</span>
                      : <span className="font-medium text-[#C2570C]">Identité publique manquante</span>}
                    {e.specialitePublique && <span className="text-(--color-ink-soft)"> · {e.specialitePublique}</span>}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[12px]">
                    {e.peutPublier ? <Etiquette ton="bleu" className="gap-1"><Send className="h-3 w-3" /> Publie</Etiquette> : <Etiquette ton="gris">Ne publie pas</Etiquette>}
                    {e.peutEpingler ? <Etiquette ton="bleu" className="gap-1"><Pin className="h-3 w-3" /> Épingle</Etiquette> : <Etiquette ton="gris">N’épingle pas</Etiquette>}
                    {e.emailNotification && <span className="inline-flex items-center gap-1 text-(--color-ink-soft)"><Mail className="h-3 w-3" /> {e.emailNotification}</span>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex flex-wrap justify-end gap-1.5 text-[12px]">
                    <span className={e.questionsEnAttente > 0 ? 'font-semibold text-[#C2570C]' : 'text-(--color-ink-soft)'}>
                      {e.questionsEnAttente} en attente
                    </span>
                    {e.questionsAReaffecter > 0 && <Etiquette ton="orange">{e.questionsAReaffecter} à réaffecter</Etiquette>}
                  </div>
                  {!lectureSeule && (
                    <div className="flex flex-wrap justify-end gap-1.5">
                      <Bouton taille="xs" variante="fantome" onClick={() => { setErreur(null); setEtape({ type: 'identite', membre: membreDe(e), suite: null }); }}>
                        <BadgeCheck /> Identité
                      </Bouton>
                      {e.actif ? (
                        <>
                          <Bouton taille="xs" variante="contour" onClick={() => { setErreur(null); setEtape({ type: 'affectation', membre: membreDe(e), valeurs: valeursDe(e), nouveau: false }); }}>
                            <Pencil /> Modifier
                          </Bouton>
                          <Bouton taille="xs" variante="contour" onClick={() => { setErreur(null); setEtape({ type: 'retrait', e }); }}>
                            <UserMinus /> Retirer
                          </Bouton>
                        </>
                      ) : (
                        <Bouton taille="xs" variante="contour" onClick={() => choisir(membreDe(e))}>
                          <UserCheck /> Réaffecter
                        </Bouton>
                      )}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {etape?.type === 'ajout' && (
        <DialogueChoix equipe={equipe} enseignants={enseignants} onFermer={fermer} onChoisir={choisir} />
      )}
      {etape?.type === 'identite' && (
        <DialogueIdentite
          key={etape.membre.userId}
          membre={etape.membre}
          suite={etape.suite}
          erreur={erreur}
          enCours={enCours}
          onFermer={fermer}
          onValider={(i) => sauverIdentite(etape.membre, i, etape.suite)}
        />
      )}
      {etape?.type === 'affectation' && (
        <DialogueAffectation
          key={etape.membre.userId}
          membre={etape.membre}
          initial={etape.valeurs}
          nouveau={etape.nouveau}
          erreur={erreur}
          enCours={enCours}
          onFermer={fermer}
          onValider={(v) => sauverAffectation(v, etape.nouveau ? 'Enseignant affecté à la promotion.' : 'Affectation mise à jour.')}
        />
      )}
      {etape?.type === 'retrait' && (
        <Dialog open onOpenChange={(o) => { if (!o) fermer(); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Retirer {etape.e.nom} de la promotion ?</DialogTitle>
              <DialogDescription>
                Il disparaît des tags et ne reçoit plus de questions de cette promotion. Ses messages déjà publiés restent dans la conversation.
              </DialogDescription>
            </DialogHeader>
            {etape.e.questionsEnAttente > 0 ? (
              <p className="rounded-lg bg-[#FFF3E0] px-3 py-2 text-[13px] text-[#B45309]">
                {etape.e.questionsEnAttente} question{etape.e.questionsEnAttente > 1 ? 's' : ''} en attente passer{etape.e.questionsEnAttente > 1 ? 'ont' : 'a'} « à réaffecter » :
                vous pourrez les confier à un autre enseignant depuis l’onglet « Questions à réaffecter ».
              </p>
            ) : (
              <p className="text-[13px] text-(--color-ink-soft)">Aucune question en attente pour cet enseignant.</p>
            )}
            {erreur && <p role="alert" className="text-[13px] text-[#B42318]">{erreur}</p>}
            <DialogFooter>
              <Bouton variante="fantome" onClick={fermer} disabled={enCours}>Annuler</Bouton>
              <Bouton variante="danger" enCours={enCours} onClick={() => sauverAffectation({ ...valeursDe(etape.e), actif: false }, 'Enseignant retiré de la promotion.')}>
                <UserMinus /> Retirer
              </Bouton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <Toast message={message} />
    </Carte>
  );
}

/* ─────────────────────────── Dialogues ─────────────────────────── */

function DialogueChoix({
  equipe, enseignants, onFermer, onChoisir,
}: {
  equipe: MembreEquipe[];
  enseignants: EnseignantGroupe[];
  onFermer: () => void;
  onChoisir: (m: MembreEquipe) => void;
}) {
  const [q, setQ] = React.useState('');
  const actifs = new Set(enseignants.filter((e) => e.actif).map((e) => e.userId));
  const s = q.trim().toLowerCase();
  const liste = equipe.filter((m) => !actifs.has(m.userId)
    && (!s || [m.nom, m.email, m.prenomPublic, m.qualite].some((x) => x?.toLowerCase().includes(s))));
  return (
    <Dialog open onOpenChange={(o) => { if (!o) onFermer(); }}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Ajouter un enseignant</DialogTitle>
          <DialogDescription>Choisissez un membre de l’équipe pédagogique. S’il n’a pas encore d’identité publique, vous la renseignerez d’abord.</DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-ink-muted)" />
          <input autoFocus className={`${champ} pl-8`} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher (nom, e-mail, prénom public)…" aria-label="Rechercher un membre de l’équipe" />
        </div>
        <ul className="max-h-72 divide-y divide-(--color-border) overflow-y-auto rounded-lg border border-(--color-border)">
          {liste.length === 0 && <li className="px-3 py-4 text-center text-[13px] text-(--color-ink-muted)">Aucun membre disponible.</li>}
          {liste.map((m) => {
            const ancien = enseignants.some((e) => e.userId === m.userId);
            return (
              <li key={m.userId}>
                <button type="button" onClick={() => onChoisir(m)} className="flex w-full items-center gap-3 px-3 py-2 text-left text-[13px] hover:bg-(--color-surface-soft) focus-ring">
                  <Avatar nom={m.nom} taille={30} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-(--color-ink)">{m.nom} {m.role === 'admin' && <span className="font-normal text-(--color-ink-muted)">· administrateur</span>}</span>
                    <span className="block truncate text-[12px] text-(--color-ink-muted)">
                      {m.prenomPublic ? libelleEnseignant(m.prenomPublic, m.qualite) : 'Sans identité publique'}{m.email ? ` · ${m.email}` : ''}
                    </span>
                  </span>
                  {ancien && <Etiquette ton="gris">Ancien</Etiquette>}
                  {!m.prenomPublic && <Etiquette ton="orange">Identité à créer</Etiquette>}
                </button>
              </li>
            );
          })}
        </ul>
        <DialogFooter>
          <Bouton variante="fantome" onClick={onFermer}>Annuler</Bouton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DialogueIdentite({
  membre, suite, erreur, enCours, onFermer, onValider,
}: {
  membre: MembreEquipe;
  suite: 'affectation' | null;
  erreur: string | null;
  enCours: boolean;
  onFermer: () => void;
  onValider: (i: { prenomPublic: string; qualite: string; specialite: string; avatarMode: AvatarMode }) => void;
}) {
  const [prenom, setPrenom] = React.useState(membre.prenomPublic ?? '');
  const [qualite, setQualite] = React.useState(membre.qualite ?? 'Enseignant Major ECN');
  const [specialite, setSpecialite] = React.useState(membre.specialite ?? '');
  const [avatar, setAvatar] = React.useState<AvatarMode>(membre.avatarMode && membre.avatarMode !== 'photo' ? membre.avatarMode : 'initiale');
  // Indice (le serveur fait le contrôle réel sur le nom de famille du compte).
  const motsDuNom = membre.nom.toLowerCase().split(/\s+/).filter((m) => m.length >= 3);
  const prenomSaisi = prenom.trim().toLowerCase();
  const suspect = motsDuNom.length > 1 && motsDuNom.slice(1).some((m) => `${prenomSaisi} ${qualite.toLowerCase()}`.includes(m));

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onFermer(); }}>
      <DialogContent>
        <form
          className="grid gap-4"
          onSubmit={(e) => { e.preventDefault(); if (prenom.trim()) onValider({ prenomPublic: prenom, qualite, specialite, avatarMode: avatar }); }}
        >
          <DialogHeader>
            <DialogTitle>Identité publique de {membre.nom}</DialogTitle>
            <DialogDescription>
              Seule identité montrée aux candidats, dans toutes les promotions. Elle ne doit jamais contenir le nom de famille.
              {membre.avatarMode === 'photo' && ' La photo actuelle sera remplacée par l’avatar choisi.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Libelle htmlFor="idt-prenom">Prénom public *</Libelle>
              <input id="idt-prenom" autoFocus required maxLength={40} className={champ} value={prenom} onChange={(e) => setPrenom(e.target.value)} placeholder="ex. Thomas" />
            </div>
            <div>
              <Libelle htmlFor="idt-qualite">Qualité</Libelle>
              <input id="idt-qualite" maxLength={80} className={champ} value={qualite} onChange={(e) => setQualite(e.target.value)} placeholder="Enseignant Major ECN" />
            </div>
            <div>
              <Libelle htmlFor="idt-specialite">Spécialité</Libelle>
              <input id="idt-specialite" maxLength={80} className={champ} value={specialite} onChange={(e) => setSpecialite(e.target.value)} placeholder="ex. Cardiologie" />
            </div>
            <div>
              <Libelle htmlFor="idt-avatar">Avatar</Libelle>
              <select id="idt-avatar" className={champ} value={avatar} onChange={(e) => setAvatar(e.target.value as AvatarMode)}>
                {(Object.keys(LIBELLE_AVATAR) as (keyof typeof LIBELLE_AVATAR)[]).map((k) => <option key={k} value={k}>{LIBELLE_AVATAR[k]}</option>)}
              </select>
            </div>
          </div>
          <p className="rounded-lg bg-(--color-surface-soft) px-3 py-2 text-[13px] text-(--color-ink)">
            Aperçu : <strong>{prenom.trim() ? libelleEnseignant(prenom, qualite) : '—'}</strong>
          </p>
          {suspect && <p className="text-[12.5px] text-[#B45309]">Attention : l’identité publique semble contenir le nom de famille.</p>}
          {erreur && <p role="alert" className="text-[13px] text-[#B42318]">{erreur}</p>}
          <DialogFooter>
            <Bouton type="button" variante="fantome" onClick={onFermer} disabled={enCours}>Annuler</Bouton>
            <Bouton type="submit" enCours={enCours} disabled={!prenom.trim()}>{suite === 'affectation' ? 'Enregistrer et continuer' : 'Enregistrer'}</Bouton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DialogueAffectation({
  membre, initial, nouveau, erreur, enCours, onFermer, onValider,
}: {
  membre: MembreEquipe;
  initial: Affectation;
  nouveau: boolean;
  erreur: string | null;
  enCours: boolean;
  onFermer: () => void;
  onValider: (v: Affectation) => void;
}) {
  const [v, setV] = React.useState(initial);
  const maj = (p: Partial<Affectation>) => setV((x) => ({ ...x, ...p }));
  const apercu = membre.prenomPublic ? libelleEnseignant(membre.prenomPublic, v.qualite.trim() || membre.qualite) : '—';

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onFermer(); }}>
      <DialogContent>
        <form className="grid gap-4" onSubmit={(e) => { e.preventDefault(); onValider(v); }}>
          <DialogHeader>
            <DialogTitle>{nouveau ? `Affecter ${membre.nom}` : `Affectation de ${membre.nom}`}</DialogTitle>
            <DialogDescription>Identité vue par les candidats : <strong className="text-(--color-ink)">{apercu}</strong></DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Libelle htmlFor="aff-qualite" aide="(dans cette promotion)">Qualité</Libelle>
              <input id="aff-qualite" maxLength={80} className={champ} value={v.qualite} onChange={(e) => maj({ qualite: e.target.value })} placeholder={membre.qualite ?? 'Enseignant Major ECN'} />
            </div>
            <div>
              <Libelle htmlFor="aff-specialite">Spécialité publique</Libelle>
              <input id="aff-specialite" maxLength={80} className={champ} value={v.specialitePublique} onChange={(e) => maj({ specialitePublique: e.target.value })} placeholder={membre.specialite ?? 'ex. Cardiologie'} />
            </div>
            <div className="sm:col-span-2">
              <Libelle htmlFor="aff-email" aide="(vide = e-mail du compte)">E-mail de notification</Libelle>
              <input id="aff-email" type="email" className={champ} value={v.emailNotification} onChange={(e) => maj({ emailNotification: e.target.value })} placeholder={membre.email ?? ''} />
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="flex items-start gap-2 rounded-xl border border-(--color-border) p-3 text-[13px]">
              <input type="checkbox" className="mt-0.5 accent-(--color-primary)" checked={v.peutPublier} onChange={(e) => maj({ peutPublier: e.target.checked })} />
              <span><span className="block font-medium text-(--color-ink)">Peut publier</span><span className="text-[12px] text-(--color-ink-soft)">Messages, réponses et annonces.</span></span>
            </label>
            <label className="flex items-start gap-2 rounded-xl border border-(--color-border) p-3 text-[13px]">
              <input type="checkbox" className="mt-0.5 accent-(--color-primary)" checked={v.peutEpingler} onChange={(e) => maj({ peutEpingler: e.target.checked })} />
              <span><span className="block font-medium text-(--color-ink)">Peut épingler</span><span className="text-[12px] text-(--color-ink-soft)">Mettre en avant les réponses de référence.</span></span>
            </label>
          </div>
          {nouveau && (
            <label className="flex items-start gap-2 text-[13px] text-(--color-ink)">
              <input type="checkbox" className="mt-0.5 accent-(--color-primary)" checked={v.annoncer} onChange={(e) => maj({ annoncer: e.target.checked })} />
              <span>Annoncer son arrivée dans la conversation <span className="block text-[12px] text-(--color-ink-soft)">Message automatique : « {apercu} rejoint cet espace. »</span></span>
            </label>
          )}
          {erreur && <p role="alert" className="text-[13px] text-[#B42318]">{erreur}</p>}
          <DialogFooter>
            <Bouton type="button" variante="fantome" onClick={onFermer} disabled={enCours}>Annuler</Bouton>
            <Bouton type="submit" enCours={enCours}>{nouveau ? 'Affecter' : 'Enregistrer'}</Bouton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
