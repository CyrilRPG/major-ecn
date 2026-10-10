'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Archive, BellRing, EyeOff, FileText, Loader2, MessageSquareText, Paperclip, Power, Search, ShieldCheck, UserPlus, X,
} from 'lucide-react';
import { rechercherEleves, sauverParametres } from '@/app/admin/echanges/actions';
import { Bouton, Carte, champ, EnteteCarte, Etiquette, Libelle, Toast, useEtatSuivi, useMessage } from '@/components/admin/cockpit/ui';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LIBELLE_FORMAT } from '@/lib/echanges/fichiers-regles';
import type { Parametres } from '@/lib/echanges/serveur/base';
import { cn } from '@/lib/utils';

/**
 * Formulaire des paramètres du module Échanges (Super Admin). Seuls les champs
 * modifiés sont envoyés (le serveur revalide bornes et valeurs, puis trace
 * l'avant / après). Passer le module en « actif » demande une confirmation :
 * les candidats verront alors les échanges.
 */

export type Personne = { id: string; nom: string; email: string | null; type: 'candidat' | 'equipe' | 'admin' };

type Cle = Exclude<keyof Parametres, 'updated_at'>;
type CleNombre = { [K in Cle]: Parametres[K] extends number ? K : never }[Cle];
type CleBool = { [K in Cle]: Parametres[K] extends boolean ? K : never }[Cle];
type CleTexteListe = 'reactions' | 'coordonnees_domaines_autorises';

/** Bornes acceptées par la base (contraintes de la table) — rappelées dans l'aide. */
const BORNES: Record<CleNombre, [number, number]> = {
  relance_heures: [1, 168], escalade_heures: [1, 336], edition_minutes: [0, 1440], taille_max_mo: [1, 25], pj_max_par_message: [1, 10],
  longueur_max: [200, 20000], limite_messages_minute: [1, 60], limite_messages_heure: [1, 1000], limite_tags_heure: [0, 100],
  limite_tags_enseignant_jour: [0, 200], limite_pj_heure: [0, 200], doublon_secondes: [0, 3600], coordonnees_seuil_alerte: [1, 100],
  conservation_supprimes_jours: [1, 3650], conservation_archives_jours: [30, 3650], conservation_audit_jours: [365, 3650],
  conservation_blocages_jours: [30, 3650], conservation_journal_jours: [7, 3650],
};

const CLES: Cle[] = [
  'module_mode', 'testeurs', 'relance_heures', 'escalade_active', 'escalade_heures', 'reponse_un_annule_autres', 'marquer_traite_actif',
  'edition_minutes', 'formats_autorises', 'taille_max_mo', 'pj_max_par_message', 'longueur_max', 'limite_messages_minute',
  'limite_messages_heure', 'limite_tags_heure', 'limite_tags_enseignant_jour', 'limite_pj_heure', 'doublon_secondes', 'affichage_eleves',
  'reactions', 'reactions_lecture_seule', 'message_accueil', 'regles_texte', 'regles_acceptation_requise', 'coordonnees_blocage_actif',
  'coordonnees_mode', 'coordonnees_domaines_autorises', 'liens_non_reconnus', 'coordonnees_images_analyse', 'coordonnees_seuil_alerte',
  'conservation_supprimes_jours', 'conservation_archives_jours', 'conservation_audit_jours', 'conservation_blocages_jours',
  'conservation_journal_jours', 'purge_auto_active',
];

const LIBELLE_CHAMP: Partial<Record<Cle, string>> = {
  relance_heures: 'Délai de relance', escalade_heures: 'Délai d’escalade', edition_minutes: 'Fenêtre de modification',
  taille_max_mo: 'Taille maximale d’un fichier', pj_max_par_message: 'Fichiers par message', longueur_max: 'Longueur maximale',
  limite_messages_minute: 'Messages par minute', limite_messages_heure: 'Messages par heure', limite_tags_heure: 'Tags d’enseignant par heure',
  limite_tags_enseignant_jour: 'Tags d’un même enseignant par jour', limite_pj_heure: 'Pièces jointes par heure', doublon_secondes: 'Fenêtre anti-doublon',
  coordonnees_seuil_alerte: 'Seuil d’alerte', conservation_supprimes_jours: 'Messages supprimés', conservation_archives_jours: 'Promotions archivées',
  conservation_audit_jours: 'Journal d’audit', conservation_blocages_jours: 'Tentatives bloquées', conservation_journal_jours: 'Journal technique',
};

const MODES: { v: Parametres['module_mode']; titre: string; texte: string }[] = [
  { v: 'desactive', titre: 'Désactivé', texte: 'Invisible pour tous, sauf les Super Admins (configuration).' },
  { v: 'interne', titre: 'Interne', texte: 'L’équipe, les enseignants affectés et les comptes testeurs seulement.' },
  { v: 'actif', titre: 'Actif', texte: 'Ouvert aux candidats de chaque promotion active.' },
];

const versTexte = (l: string[], sep: string) => l.join(sep);
const versListe = (t: string) => [...new Set(t.split(/[\s,;]+/).map((x) => x.trim()).filter(Boolean))];

function textesListes(p: Parametres): Record<CleTexteListe, string> {
  return { reactions: versTexte(p.reactions ?? [], ' '), coordonnees_domaines_autorises: versTexte(p.coordonnees_domaines_autorises ?? [], '\n') };
}

const TYPE_PERSONNE: Record<Personne['type'], { l: string; ton: 'bleu' | 'violet' | 'bordeaux' }> = {
  candidat: { l: 'Candidat', ton: 'bleu' }, equipe: { l: 'Équipe', ton: 'violet' }, admin: { l: 'Administrateur', ton: 'bordeaux' },
};

export function FormulaireParametres({ initial, testeurs, equipe, majLe }: {
  initial: Parametres;
  testeurs: Personne[];
  equipe: Personne[];
  majLe: string | null;
}) {
  const router = useRouter();
  const [v, setV] = useEtatSuivi<Parametres>(initial, initial.updated_at);
  const [listes, setListes] = useEtatSuivi(textesListes(initial), initial.updated_at);
  const [connus, setConnus] = React.useState<Record<string, Personne>>(() => Object.fromEntries(testeurs.map((t) => [t.id, t])));
  const [confirmer, setConfirmer] = React.useState(false);
  const [message, setMessage] = useMessage();
  const [enCours, start] = React.useTransition();

  const maj = <K extends Cle>(k: K, val: Parametres[K]) => setV((x) => ({ ...x, [k]: val }));

  const patch = React.useMemo(() => {
    const p: Partial<Parametres> = {};
    for (const k of CLES) {
      const val: unknown = k === 'reactions' || k === 'coordonnees_domaines_autorises' ? versListe(listes[k]) : v[k];
      if (JSON.stringify(val) !== JSON.stringify(initial[k])) (p as Record<string, unknown>)[k] = val;
    }
    return p;
  }, [v, listes, initial]);
  const nbModifs = Object.keys(patch).length;

  const enregistrer = () => {
    for (const [k, [min, max]] of Object.entries(BORNES) as [CleNombre, [number, number]][]) {
      const n = v[k];
      if (!Number.isFinite(n) || n < min || n > max) {
        setMessage(`« ${LIBELLE_CHAMP[k] ?? k} » doit être compris entre ${min} et ${max}.`);
        return;
      }
    }
    if (v.formats_autorises.length === 0 && v.pj_max_par_message > 0) {
      setMessage('Autorisez au moins un format de pièce jointe.');
      return;
    }
    start(async () => {
      const r = await sauverParametres(patch);
      setConfirmer(false);
      setMessage(r.ok ? 'Paramètres enregistrés.' : r.erreur);
      if (r.ok) router.refresh();
    });
  };
  const demanderEnregistrement = () => {
    if (patch.module_mode === 'actif') setConfirmer(true);
    else enregistrer();
  };
  const annuler = () => {
    setV(initial);
    setListes(textesListes(initial));
  };

  const nb = (k: CleNombre, unite: string, aide?: string) => (
    <ChampNombre
      id={`p-${k}`} libelle={LIBELLE_CHAMP[k] ?? k} unite={unite} aide={aide} bornes={BORNES[k]}
      valeur={v[k]} modifie={k in patch} onChange={(n) => maj(k, n)}
    />
  );
  const coche = (k: CleBool, libelle: string, aide?: string) => (
    <Interrupteur id={`p-${k}`} libelle={libelle} aide={aide} valeur={v[k]} modifie={k in patch} onChange={(b) => maj(k, b)} />
  );

  return (
    <div className="space-y-4 pb-20">
      <Section icone={Power} titre="Mode du module" sousTitre={majLe ? `Dernière modification des paramètres : ${majLe}` : undefined}>
        <div className="grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Mode du module">
          {MODES.map((m) => (
            <button
              key={m.v} type="button" role="radio" aria-checked={v.module_mode === m.v} onClick={() => maj('module_mode', m.v)}
              className={cn(
                'rounded-xl border px-3.5 py-3 text-left transition-colors focus-ring',
                v.module_mode === m.v ? 'border-(--color-primary) bg-(--color-primary-soft)' : 'border-(--color-border) bg-white hover:bg-(--color-surface-soft)',
              )}
            >
              <span className="flex items-center gap-2 text-[14px] font-semibold text-(--color-ink)">
                <span className={cn('h-3.5 w-3.5 rounded-full border-2', v.module_mode === m.v ? 'border-(--color-primary) bg-(--color-primary)' : 'border-(--color-border)')} />
                {m.titre}
                {initial.module_mode === m.v && <span className="text-[11.5px] font-normal text-(--color-ink-muted)">(actuel)</span>}
              </span>
              <span className="mt-1 block text-[12.5px] text-(--color-ink-soft)">{m.texte}</span>
            </button>
          ))}
        </div>
        <Testeurs
          ids={v.testeurs} connus={connus} equipe={equipe} modifie={'testeurs' in patch}
          onAjouter={(p) => { setConnus((c) => ({ ...c, [p.id]: p })); maj('testeurs', [...v.testeurs, p.id]); }}
          onRetirer={(id) => maj('testeurs', v.testeurs.filter((x) => x !== id))}
        />
      </Section>

      <Section icone={BellRing} titre="Relances et escalade" sousTitre="Questions adressées à un enseignant avec un tag @.">
        <div className="grid gap-4 sm:grid-cols-2">
          {nb('relance_heures', 'heures', 'sans réponse après ce délai, l’enseignant est relancé et la question passe « en retard »')}
          {nb('escalade_heures', 'heures', 'après ce délai, l’équipe est prévenue (si l’escalade est active)')}
        </div>
        <div className="space-y-2.5">
          {coche('escalade_active', 'Escalade vers l’équipe', 'Prévenir l’administration quand une question reste sans réponse au-delà du délai d’escalade.')}
          {coche('reponse_un_annule_autres', 'Une réponse suffit', 'Quand plusieurs enseignants sont tagués, la réponse de l’un d’eux traite la question pour tous.')}
          {coche('marquer_traite_actif', 'Marquer « traitée » sans répondre', 'Un enseignant peut clore une question tagée sans publier de réponse (ex. réponse donnée ailleurs).')}
        </div>
      </Section>

      <Section icone={MessageSquareText} titre="Publication et quotas" sousTitre="Protection contre le spam et les abus (quotas par candidat). Attention : un quota à 0 interdit l’action (aucun tag, aucune pièce jointe) ; une fenêtre à 0 la désactive.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {nb('edition_minutes', 'minutes', 'durée pendant laquelle l’auteur peut modifier son message (0 = jamais)')}
          {nb('longueur_max', 'caractères')}
          {nb('limite_messages_minute', 'messages')}
          {nb('limite_messages_heure', 'messages')}
          {nb('limite_tags_heure', 'tags', 'tous enseignants confondus')}
          {nb('limite_tags_enseignant_jour', 'tags', 'vers un même enseignant, sur 24 h')}
          {nb('limite_pj_heure', 'fichiers')}
          {nb('doublon_secondes', 'secondes', 'un message identique dans ce délai est refusé (0 = pas de contrôle)')}
        </div>
      </Section>

      <Section icone={Paperclip} titre="Pièces jointes">
        <div>
          <Libelle>Formats autorisés {'formats_autorises' in patch && <Modifie />}</Libelle>
          <div className="flex flex-wrap gap-2">
            {Object.entries(LIBELLE_FORMAT).map(([mime, lib]) => {
              const actif = v.formats_autorises.includes(mime);
              return (
                <label key={mime} className={cn('inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-[13px]', actif ? 'border-(--color-primary) bg-(--color-primary-soft) text-(--color-primary)' : 'border-(--color-border) bg-white text-(--color-ink-soft)')}>
                  <input
                    type="checkbox" className="h-4 w-4 accent-(--color-primary)" checked={actif}
                    onChange={(e) => maj('formats_autorises', e.target.checked ? [...v.formats_autorises, mime] : v.formats_autorises.filter((x) => x !== mime))}
                  />
                  {lib}
                </label>
              );
            })}
          </div>
          <p className="mt-1 text-[12px] text-(--color-ink-muted)">Le type réel du fichier est vérifié (octets de tête) ; les PDF contenant du code actif sont refusés.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {nb('taille_max_mo', 'Mo', 'par fichier')}
          {nb('pj_max_par_message', 'fichiers')}
        </div>
      </Section>

      <Section icone={EyeOff} titre="Affichage">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Libelle htmlFor="p-affichage">Nom des candidats dans les échanges {'affichage_eleves' in patch && <Modifie />}</Libelle>
            <select id="p-affichage" className={champ} value={v.affichage_eleves} onChange={(e) => maj('affichage_eleves', e.target.value as Parametres['affichage_eleves'])}>
              <option value="prenom_initiale">Prénom et initiale du nom (Marie D.)</option>
              <option value="prenom">Prénom seul (Marie)</option>
              <option value="pseudo">Pseudo (à défaut : prénom et initiale)</option>
            </select>
            <p className="mt-1 text-[12px] text-(--color-ink-muted)">Jamais d’e-mail ni de nom complet côté candidats.</p>
          </div>
          <div>
            <Libelle htmlFor="p-reactions" aide="(séparées par des espaces, 12 au plus)">Réactions proposées {'reactions' in patch && <Modifie />}</Libelle>
            <input id="p-reactions" className={champ} value={listes.reactions} onChange={(e) => setListes((l) => ({ ...l, reactions: e.target.value }))} placeholder="👍 ❤️ 🙏" />
            <p className="mt-1 text-[12px] text-(--color-ink-muted)">Aucune réaction = fonctionnalité masquée.</p>
          </div>
        </div>
        <div className="space-y-2.5">
          {coche('reactions_lecture_seule', 'Réactions en lecture seule', 'Un candidat en lecture seule (sanction) peut encore réagir aux messages.')}
        </div>
        <div>
          <Libelle htmlFor="p-accueil" aide="(affiché en tête de chaque promotion, sauf message propre à la promotion)">Message d’accueil {'message_accueil' in patch && <Modifie />}</Libelle>
          <textarea id="p-accueil" rows={5} className={champ} value={v.message_accueil} onChange={(e) => maj('message_accueil', e.target.value)} maxLength={8000} />
        </div>
        <div>
          <Libelle htmlFor="p-regles">Règles de la messagerie {'regles_texte' in patch && <Modifie />}</Libelle>
          <textarea id="p-regles" rows={7} className={champ} value={v.regles_texte} onChange={(e) => maj('regles_texte', e.target.value)} maxLength={8000} />
        </div>
        {coche('regles_acceptation_requise', 'Acceptation des règles requise', 'Chaque candidat doit accepter les règles avant sa première publication.')}
      </Section>

      <Section icone={ShieldCheck} titre="Protection des coordonnées" sousTitre="Téléphone, e-mail, réseaux sociaux, liens : les échanges restent dans la messagerie Major ECN.">
        {coche('coordonnees_blocage_actif', 'Détection des coordonnées active', 'Analyse chaque message (et les pièces jointes, si activé) avant publication.')}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Libelle htmlFor="p-coord-mode">Quand des coordonnées sont détectées {'coordonnees_mode' in patch && <Modifie />}</Libelle>
            <select id="p-coord-mode" className={champ} value={v.coordonnees_mode} onChange={(e) => maj('coordonnees_mode', e.target.value as Parametres['coordonnees_mode'])}>
              <option value="bloquer">Bloquer la publication (le candidat est prévenu)</option>
              <option value="moderation">Retenir pour validation par la modération</option>
            </select>
          </div>
          <div>
            <Libelle htmlFor="p-liens">Liens vers un site non reconnu {'liens_non_reconnus' in patch && <Modifie />}</Libelle>
            <select id="p-liens" className={champ} value={v.liens_non_reconnus} onChange={(e) => maj('liens_non_reconnus', e.target.value as Parametres['liens_non_reconnus'])}>
              <option value="autoriser">Publier sans contrôle</option>
              <option value="moderation">Soumettre à validation</option>
              <option value="bloquer">Bloquer</option>
            </select>
          </div>
        </div>
        <div>
          <Libelle htmlFor="p-domaines" aide="(un par ligne — les sous-domaines sont inclus)">Sites autorisés {'coordonnees_domaines_autorises' in patch && <Modifie />}</Libelle>
          <textarea
            id="p-domaines" rows={6} className={cn(champ, 'font-mono text-[12.5px]')} value={listes.coordonnees_domaines_autorises}
            onChange={(e) => setListes((l) => ({ ...l, coordonnees_domaines_autorises: e.target.value }))} placeholder="has-sante.fr"
          />
          <p className="mt-1 text-[12px] text-(--color-ink-muted)">{versListe(listes.coordonnees_domaines_autorises).length} site(s) — HAS, Légifrance, sociétés savantes, revues…</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {nb('coordonnees_seuil_alerte', 'tentatives', 'en 24 h pour un même candidat : l’équipe est alertée (une fois par jour)')}
        </div>
        {coche('coordonnees_images_analyse', 'Analyser aussi les pièces jointes', 'Texte des PDF et des images : un numéro ou une adresse dans une capture est détecté.')}
      </Section>

      <Section icone={Archive} titre="Conservation et purge" sousTitre="Durées avant purge définitive. Une promotion sous « conservation légale » n’est jamais purgée.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {nb('conservation_supprimes_jours', 'jours', 'restaurables jusqu’à la purge')}
          {nb('conservation_archives_jours', 'jours', 'après archivage de la promotion')}
          {nb('conservation_audit_jours', 'jours', '1 an minimum')}
          {nb('conservation_blocages_jours', 'jours')}
          {nb('conservation_journal_jours', 'jours')}
        </div>
        {coche('purge_auto_active', 'Purge automatique', 'La tâche planifiée supprime définitivement ce qui a dépassé sa durée de conservation. Désactivée : rien n’est purgé.')}
      </Section>

      <div className={cn(
        'sticky bottom-3 z-30 flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3 shadow-lg transition-opacity',
        nbModifs ? 'border-(--color-primary)/30 bg-white opacity-100' : 'pointer-events-none border-transparent bg-transparent opacity-0 shadow-none',
      )} aria-hidden={!nbModifs}>
        <p className="text-[13.5px] text-(--color-ink)">
          <FileText className="mr-1.5 inline h-4 w-4 text-(--color-primary)" />
          {nbModifs} modification{nbModifs > 1 ? 's' : ''} non enregistrée{nbModifs > 1 ? 's' : ''}
        </p>
        <div className="ml-auto flex gap-2">
          <Bouton variante="fantome" taille="sm" onClick={annuler} disabled={enCours}>Annuler</Bouton>
          <Bouton taille="sm" enCours={enCours} onClick={demanderEnregistrement}>Enregistrer</Bouton>
        </div>
      </div>

      <Dialog open={confirmer} onOpenChange={(o) => { if (!enCours) setConfirmer(o); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Activer les échanges pour les candidats ?</DialogTitle>
            <DialogDescription>
              En passant le module en « actif », les candidats verront les échanges de chaque promotion active et visible,
              pourront publier et taguer leurs enseignants (e-mails de notification compris).
            </DialogDescription>
          </DialogHeader>
          <p className="text-[13px] text-(--color-ink-soft)">Vérifiez que les promotions, les enseignants affectés et les règles sont prêts.</p>
          <DialogFooter>
            <Bouton variante="fantome" onClick={() => setConfirmer(false)} disabled={enCours}>Annuler</Bouton>
            <Bouton enCours={enCours} onClick={enregistrer}>Activer et enregistrer</Bouton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Toast message={message} />
    </div>
  );
}

/* ─────────────────────────── Champs ─────────────────────────── */

function Section({ icone, titre, sousTitre, children }: { icone: React.ComponentType<{ className?: string }>; titre: string; sousTitre?: string; children: React.ReactNode }) {
  return (
    <Carte>
      <EnteteCarte icone={icone} titre={titre} />
      <div className="space-y-4 px-4 pb-5 sm:px-5">
        {sousTitre && <p className="-mt-1 text-[13px] text-(--color-ink-soft)">{sousTitre}</p>}
        {children}
      </div>
    </Carte>
  );
}

function Modifie() {
  return <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-(--color-primary) align-middle" title="Modifié, non enregistré" />;
}

function ChampNombre({ id, libelle, unite, aide, bornes, valeur, modifie, onChange }: {
  id: string; libelle: string; unite: string; aide?: string; bornes: [number, number]; valeur: number; modifie: boolean; onChange: (n: number) => void;
}) {
  const horsBornes = !Number.isFinite(valeur) || valeur < bornes[0] || valeur > bornes[1];
  return (
    <div>
      <Libelle htmlFor={id}>{libelle} {modifie && <Modifie />}</Libelle>
      <div className="flex items-center gap-2">
        <input
          id={id} type="number" inputMode="numeric" min={bornes[0]} max={bornes[1]} step={1}
          className={cn(champ, 'max-w-[140px] tabular-nums', horsBornes && 'border-[#B42318]')}
          value={Number.isFinite(valeur) ? String(valeur) : ''}
          onChange={(e) => onChange(e.target.value === '' ? Number.NaN : Number(e.target.value))}
        />
        <span className="text-[13px] text-(--color-ink-soft)">{unite}</span>
      </div>
      <p className={cn('mt-1 text-[12px]', horsBornes ? 'text-[#B42318]' : 'text-(--color-ink-muted)')}>
        {aide ? `${aide} · ` : ''}de {bornes[0].toLocaleString('fr-FR')} à {bornes[1].toLocaleString('fr-FR')}
      </p>
    </div>
  );
}

function Interrupteur({ id, libelle, aide, valeur, modifie, onChange }: {
  id: string; libelle: string; aide?: string; valeur: boolean; modifie: boolean; onChange: (b: boolean) => void;
}) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3">
      <input id={id} type="checkbox" checked={valeur} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-(--color-primary)" />
      <span className="min-w-0">
        <span className="text-[14px] font-medium text-(--color-ink)">{libelle} {modifie && <Modifie />}</span>
        {aide && <span className="block text-[12.5px] text-(--color-ink-soft)">{aide}</span>}
      </span>
    </label>
  );
}

/* ─────────────────────────── Comptes testeurs ─────────────────────────── */

function Testeurs({ ids, connus, equipe, modifie, onAjouter, onRetirer }: {
  ids: string[];
  connus: Record<string, Personne>;
  equipe: Personne[];
  modifie: boolean;
  onAjouter: (p: Personne) => void;
  onRetirer: (id: string) => void;
}) {
  const [q, setQ] = React.useState('');
  const [eleves, setEleves] = React.useState<Personne[] | null>(null);
  const [cherche, start] = React.useTransition();

  const terme = q.trim().toLowerCase();
  const membresEquipe = terme.length >= 2
    ? equipe.filter((p) => `${p.nom} ${p.email ?? ''}`.toLowerCase().includes(terme)).slice(0, 8)
    : [];
  const resultats = [...membresEquipe, ...(eleves ?? [])].filter((p) => !ids.includes(p.id));

  const chercher = () => {
    if (terme.length < 2) return;
    start(async () => {
      const r = await rechercherEleves(q);
      setEleves(r.map((e) => ({ id: e.id, nom: e.nom, email: e.email, type: 'candidat' as const })));
    });
  };

  return (
    <div className="rounded-xl border border-(--color-border) p-3.5">
      <p className="text-[14px] font-medium text-(--color-ink)">Comptes testeurs {modifie && <Modifie />}</p>
      <p className="text-[12.5px] text-(--color-ink-soft)">En mode « interne », ces comptes (candidats ou équipe) accèdent aux échanges comme s’ils étaient ouverts, pour la recette.</p>
      <ul className="mt-2.5 flex flex-wrap gap-2">
        {ids.length === 0 && <li className="text-[13px] text-(--color-ink-muted)">Aucun compte testeur.</li>}
        {ids.map((id) => {
          const p = connus[id];
          return (
            <li key={id} className="inline-flex items-center gap-1.5 rounded-lg border border-(--color-border) bg-(--color-surface-soft) py-1 pl-2.5 pr-1 text-[13px]">
              <span className="text-(--color-ink)">{p?.nom ?? id}</span>
              {p && <Etiquette ton={TYPE_PERSONNE[p.type].ton} className="text-[11px]">{TYPE_PERSONNE[p.type].l}</Etiquette>}
              <button type="button" onClick={() => onRetirer(id)} aria-label={`Retirer ${p?.nom ?? id}`} className="rounded p-0.5 text-(--color-ink-muted) hover:bg-white hover:text-[#B42318]">
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          );
        })}
      </ul>
      <div className="mt-3 flex gap-2">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-ink-muted)" />
          <input
            value={q} onChange={(e) => { setQ(e.target.value); setEleves(null); }}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); chercher(); } }}
            placeholder="Nom ou e-mail (2 caractères min.)" className={cn(champ, 'pl-8')} aria-label="Rechercher un compte testeur"
          />
        </div>
        <Bouton type="button" variante="contour" onClick={chercher} disabled={terme.length < 2} enCours={cherche}>Chercher</Bouton>
      </div>
      {terme.length >= 2 && (
        <ul className="mt-2 max-h-64 divide-y divide-(--color-border) overflow-y-auto rounded-lg border border-(--color-border)">
          {resultats.map((p) => (
            <li key={p.id}>
              <button type="button" onClick={() => onAjouter(p)} className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] hover:bg-(--color-surface-soft)">
                <UserPlus className="h-4 w-4 shrink-0 text-(--color-primary)" />
                <span className="min-w-0 flex-1 truncate">
                  <span className="text-(--color-ink)">{p.nom}</span>
                  {p.email && <span className="ml-1.5 text-(--color-ink-muted)">{p.email}</span>}
                </span>
                <Etiquette ton={TYPE_PERSONNE[p.type].ton} className="text-[11px]">{TYPE_PERSONNE[p.type].l}</Etiquette>
              </button>
            </li>
          ))}
          {cherche && <li className="flex items-center gap-2 px-3 py-2 text-[13px] text-(--color-ink-muted)"><Loader2 className="h-4 w-4 animate-spin" /> Recherche des candidats…</li>}
          {!cherche && eleves === null && <li className="px-3 py-2 text-[12.5px] text-(--color-ink-muted)">Appuyez sur « Chercher » (ou Entrée) pour inclure les candidats.</li>}
          {!cherche && eleves !== null && resultats.length === 0 && <li className="px-3 py-2 text-[13px] text-(--color-ink-muted)">Aucun compte trouvé.</li>}
        </ul>
      )}
    </div>
  );
}
