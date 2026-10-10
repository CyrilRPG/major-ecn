'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, ShieldCheck, Trash2, UserPlus } from 'lucide-react';
import { sauverStaff } from '@/app/admin/echanges/actions';
import { Bouton, Carte, champ, EnteteCarte, Etiquette, Libelle, Toast, useMessage, Vide } from '@/components/admin/cockpit/ui';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LIBELLE_NIVEAU, type NiveauStaff } from '@/lib/echanges/regles';
import type { MembreStaff } from '@/lib/echanges/serveur/admin';
import { cn } from '@/lib/utils';

/**
 * Équipe de modération des Échanges (§102-103) : les administrateurs du
 * compte sont Super Admins d'office (non modifiables ici) ; les membres de
 * l'équipe (rôle professeur) reçoivent un niveau — administrateur
 * pédagogique ou modérateur —, éventuellement limité à certaines promotions.
 */

type Niveau = 'admin_pedagogique' | 'moderateur';
type Edition = { userId: string; nom: string; niveau: Niveau; groupes: string[] | null; peutSuspendre: boolean };
type Option = { id: string; nom: string };

const TON_NIVEAU: Record<NiveauStaff, 'bordeaux' | 'bleu' | 'violet'> = { super_admin: 'bordeaux', admin_pedagogique: 'bleu', moderateur: 'violet' };

const NIVEAUX: { v: NiveauStaff; texte: string }[] = [
  { v: 'super_admin', texte: 'Tous les droits : paramètres du module, équipe de modération, journal d’audit, RGPD, restauration. Réservé aux administrateurs du compte.' },
  { v: 'admin_pedagogique', texte: 'Gère les promotions, les enseignants affectés et la bibliothèque ; modère, sanctionne (suspension comprise), consulte et exporte les statistiques.' },
  { v: 'moderateur', texte: 'Lit tout, supprime des messages, traite les signalements, avertit et met en lecture seule ; suspend seulement si vous le lui accordez. Ne touche ni aux promotions ni aux paramètres.' },
];

export function EquipeModeration({ membres, disponibles, groupes }: {
  membres: (Omit<MembreStaff, 'depuis'> & { depuis: string | null })[];
  disponibles: { userId: string; nom: string; email: string | null }[];
  groupes: Option[];
}) {
  const router = useRouter();
  const [edition, setEdition] = React.useState<Edition | null>(null);
  const [ajout, setAjout] = React.useState(false);
  const [message, setMessage] = useMessage();
  const [enCours, start] = React.useTransition();
  const nomsGroupes = new Map(groupes.map((g) => [g.id, g.nom]));
  const dejaStaff = new Set(membres.map((m) => m.userId));
  const candidats = disponibles.filter((p) => !dejaStaff.has(p.userId));

  const enregistrer = (e: Edition) => start(async () => {
    const r = await sauverStaff(e.userId, { niveau: e.niveau, groupes: e.groupes && e.groupes.length ? e.groupes : null, peutSuspendre: e.peutSuspendre });
    setMessage(r.ok ? `Niveau de ${e.nom} enregistré.` : r.erreur);
    if (r.ok) {
      setEdition(null);
      setAjout(false);
      router.refresh();
    }
  });
  const retirer = (m: { userId: string; nom: string }) => {
    if (!confirm(`Retirer à ${m.nom} son accès au back-office des échanges ?`)) return;
    start(async () => {
      const r = await sauverStaff(m.userId, { niveau: null, groupes: null, peutSuspendre: false });
      setMessage(r.ok ? `${m.nom} n’a plus de niveau Échanges.` : r.erreur);
      if (r.ok) router.refresh();
    });
  };

  return (
    <Carte>
      <EnteteCarte
        icone={ShieldCheck} titre="Équipe de modération" compteur={membres.length}
        actions={<Bouton taille="sm" variante="doux" onClick={() => setAjout(true)} disabled={candidats.length === 0}><UserPlus /> Ajouter</Bouton>}
      />
      <div className="space-y-4 px-4 pb-5 sm:px-5">
        <ul className="grid gap-2 lg:grid-cols-3">
          {NIVEAUX.map((n) => (
            <li key={n.v} className="rounded-xl border border-(--color-border) bg-(--color-surface-soft) px-3 py-2.5">
              <Etiquette ton={TON_NIVEAU[n.v]}>{LIBELLE_NIVEAU[n.v]}</Etiquette>
              <p className="mt-1.5 text-[12.5px] text-(--color-ink-soft)">{n.texte}</p>
            </li>
          ))}
        </ul>

        {membres.length === 0 ? (
          <Vide>Aucun membre.</Vide>
        ) : (
          <ul className="divide-y divide-(--color-border) rounded-xl border border-(--color-border)">
            {membres.map((m) => {
              const superAdmin = m.niveau === 'super_admin';
              return (
                <li key={m.userId} className="flex flex-wrap items-start gap-x-4 gap-y-2 px-3.5 py-3">
                  <div className="min-w-0 flex-1 basis-56">
                    <p className="text-[14px] font-medium text-(--color-ink)">{m.nom}</p>
                    <p className="truncate text-[12.5px] text-(--color-ink-muted)">{m.email ?? '—'}{m.depuis ? ` · depuis le ${m.depuis}` : ''}</p>
                  </div>
                  <div className="flex min-w-0 flex-1 basis-64 flex-wrap items-center gap-1.5">
                    <Etiquette ton={TON_NIVEAU[m.niveau]}>{LIBELLE_NIVEAU[m.niveau]}</Etiquette>
                    {superAdmin ? (
                      <span className="text-[12.5px] text-(--color-ink-muted)">Administrateur du compte — toutes les promotions</span>
                    ) : (
                      <>
                        {m.groupes && m.groupes.length
                          ? m.groupes.map((g) => <Etiquette key={g} ton="gris">{nomsGroupes.get(g) ?? 'Promotion archivée'}</Etiquette>)
                          : <span className="text-[12.5px] text-(--color-ink-soft)">Toutes les promotions</span>}
                        {m.niveau === 'moderateur' && (
                          <span className={cn('text-[12.5px]', m.peutSuspendre ? 'text-green-700' : 'text-(--color-ink-muted)')}>
                            · {m.peutSuspendre ? 'peut suspendre' : 'sans suspension'}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  {!superAdmin && (
                    <div className="flex gap-1">
                      <Bouton
                        taille="xs" variante="fantome" disabled={enCours}
                        onClick={() => setEdition({ userId: m.userId, nom: m.nom, niveau: m.niveau as Niveau, groupes: m.groupes, peutSuspendre: m.peutSuspendre })}
                      >
                        <Pencil /> Modifier
                      </Bouton>
                      <Bouton taille="xs" variante="fantome" disabled={enCours} onClick={() => retirer(m)} className="hover:text-[#B42318]">
                        <Trash2 /> Retirer
                      </Bouton>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        <p className="text-[12.5px] text-(--color-ink-muted)">
          Un administrateur du compte est toujours Super Admin. Pour donner un niveau, la personne doit avoir un compte « équipe » (professeur) actif.
        </p>
      </div>

      <Dialog open={ajout || edition !== null} onOpenChange={(o) => { if (!o && !enCours) { setAjout(false); setEdition(null); } }}>
        <DialogContent className="max-w-xl">
          <FormulaireMembre
            key={edition?.userId ?? 'nouveau'}
            edition={edition}
            candidats={candidats}
            groupes={groupes}
            enCours={enCours}
            onAnnuler={() => { setAjout(false); setEdition(null); }}
            onValider={enregistrer}
          />
        </DialogContent>
      </Dialog>
      <Toast message={message} />
    </Carte>
  );
}

function FormulaireMembre({ edition, candidats, groupes, enCours, onAnnuler, onValider }: {
  edition: Edition | null;
  candidats: { userId: string; nom: string; email: string | null }[];
  groupes: Option[];
  enCours: boolean;
  onAnnuler: () => void;
  onValider: (e: Edition) => void;
}) {
  const [userId, setUserId] = React.useState(edition?.userId ?? '');
  const [filtre, setFiltre] = React.useState('');
  const [niveau, setNiveau] = React.useState<Niveau>(edition?.niveau ?? 'moderateur');
  const [toutes, setToutes] = React.useState(!edition?.groupes?.length);
  const [choix, setChoix] = React.useState<string[]>(edition?.groupes ?? []);
  const [peutSuspendre, setPeutSuspendre] = React.useState(edition?.peutSuspendre ?? false);

  const terme = filtre.trim().toLowerCase();
  const liste = terme ? candidats.filter((c) => `${c.nom} ${c.email ?? ''}`.toLowerCase().includes(terme)) : candidats;
  const nom = edition?.nom ?? candidats.find((c) => c.userId === userId)?.nom ?? '';
  const valide = !!userId && (toutes || choix.length > 0);

  return (
    <>
      <DialogHeader>
        <DialogTitle>{edition ? `Niveau de ${edition.nom}` : 'Ajouter à l’équipe de modération'}</DialogTitle>
        <DialogDescription>Le niveau s’applique au back-office et aux échanges des promotions concernées. Chaque changement est tracé.</DialogDescription>
      </DialogHeader>

      {!edition && (
        <div>
          <Libelle htmlFor="eq-filtre">Membre de l’équipe</Libelle>
          <input id="eq-filtre" className={cn(champ, 'mb-2')} placeholder="Filtrer par nom ou e-mail" value={filtre} onChange={(e) => setFiltre(e.target.value)} />
          <select className={champ} size={6} value={userId} onChange={(e) => setUserId(e.target.value)} aria-label="Membre de l’équipe">
            {liste.map((c) => <option key={c.userId} value={c.userId}>{c.nom}{c.email ? ` — ${c.email}` : ''}</option>)}
          </select>
          {liste.length === 0 && <p className="mt-1 text-[12.5px] text-(--color-ink-muted)">Aucun compte « équipe » disponible.</p>}
        </div>
      )}

      <fieldset>
        <legend className="mb-1 block text-[12.5px] font-medium text-(--color-ink-soft)">Niveau</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {(['moderateur', 'admin_pedagogique'] as Niveau[]).map((n) => (
            <label key={n} className={cn('flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-[13.5px]', niveau === n ? 'border-(--color-primary) bg-(--color-primary-soft)' : 'border-(--color-border)')}>
              <input type="radio" name="eq-niveau" checked={niveau === n} onChange={() => setNiveau(n)} className="accent-(--color-primary)" />
              {LIBELLE_NIVEAU[n]}
            </label>
          ))}
        </div>
      </fieldset>

      <label className={cn('flex items-start gap-2.5', niveau === 'admin_pedagogique' && 'opacity-60')}>
        <input
          type="checkbox" className="mt-0.5 h-4 w-4 accent-(--color-primary)" disabled={niveau === 'admin_pedagogique'}
          checked={niveau === 'admin_pedagogique' || peutSuspendre} onChange={(e) => setPeutSuspendre(e.target.checked)}
        />
        <span className="text-[13.5px] text-(--color-ink)">
          Peut suspendre un candidat
          <span className="block text-[12px] text-(--color-ink-soft)">{niveau === 'admin_pedagogique' ? 'Toujours accordé à un administrateur pédagogique.' : 'Sinon le modérateur se limite aux avertissements et à la lecture seule.'}</span>
        </span>
      </label>

      <fieldset>
        <legend className="mb-1 block text-[12.5px] font-medium text-(--color-ink-soft)">Périmètre</legend>
        <label className="mb-2 flex items-center gap-2 text-[13.5px] text-(--color-ink)">
          <input type="checkbox" className="h-4 w-4 accent-(--color-primary)" checked={toutes} onChange={(e) => setToutes(e.target.checked)} />
          Toutes les promotions (y compris les futures)
        </label>
        {!toutes && (
          <div className="max-h-56 space-y-1 overflow-y-auto rounded-lg border border-(--color-border) p-2">
            {groupes.length === 0 && <p className="px-1 text-[12.5px] text-(--color-ink-muted)">Aucune promotion.</p>}
            {groupes.map((g) => (
              <label key={g.id} className="flex items-center gap-2 rounded px-1 py-0.5 text-[13px] hover:bg-(--color-surface-soft)">
                <input
                  type="checkbox" className="h-4 w-4 accent-(--color-primary)" checked={choix.includes(g.id)}
                  onChange={(e) => setChoix((c) => (e.target.checked ? [...c, g.id] : c.filter((x) => x !== g.id)))}
                />
                {g.nom}
              </label>
            ))}
          </div>
        )}
        {!toutes && choix.length === 0 && <p className="mt-1 text-[12px] text-[#B42318]">Cochez au moins une promotion.</p>}
      </fieldset>

      <DialogFooter>
        <Bouton variante="fantome" onClick={onAnnuler} disabled={enCours}>Annuler</Bouton>
        <Bouton
          enCours={enCours} disabled={!valide}
          onClick={() => onValider({ userId, nom, niveau, groupes: toutes ? null : choix, peutSuspendre: niveau === 'admin_pedagogique' || peutSuspendre })}
        >
          Enregistrer
        </Bouton>
      </DialogFooter>
    </>
  );
}
