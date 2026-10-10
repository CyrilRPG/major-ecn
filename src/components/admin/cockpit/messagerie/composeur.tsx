'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Copy, FileText, Paperclip, Save, Send, Sparkles, Trash2, TriangleAlert, Undo2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import {
  enregistrerBrouillon, envoyerMessage, preparerTeleversement, redigerAvecIa, supprimerBrouillon,
} from '@/app/admin/cockpit/actions-messagerie';
import { TONS, TON_LABEL, type ActionIa, type Ton } from '@/lib/cockpit/regles';
import { Bouton, champ } from '@/components/admin/cockpit/ui';
import { nouvelleCle, tailleLisible, type RoleFil } from './types';

/**
 * Zone de rédaction d'un fil : texte libre, assistant IA (§6), pièces
 * jointes, envoi et brouillon. L'IA ne fait que remplir la zone de texte :
 * rien ne part sans un clic sur « Envoyer » (C05), et la rédaction manuelle
 * reste toujours possible si l'assistant échoue (C17).
 *
 * Idempotence (C12) : UNE clé par message composé, réutilisée à chaque nouvel
 * essai ou double clic, régénérée seulement après un envoi réussi.
 */

type Piece = {
  local: string;
  nom: string;
  taille: number;
  mime: string;
  etat: 'envoi' | 'ok' | 'erreur';
  chemin?: string;
  erreur?: string;
};

const MODELES: { label: string; consigne: string }[] = [
  { label: 'Relance douce', consigne: 'Relancer avec bienveillance pour savoir où en est la mission et proposer de l’aide si besoin.' },
  { label: 'Point d’avancement', consigne: 'Demander un point d’avancement précis sur la mission et une date de livraison prévisionnelle.' },
  { label: 'Rappel d’échéance', consigne: 'Rappeler l’échéance de la mission et demander confirmation qu’elle sera tenue.' },
  { label: 'Remerciement', consigne: 'Remercier pour le travail rendu et confirmer la bonne réception.' },
  { label: 'Nouvelle mission', consigne: 'Proposer une nouvelle mission, en décrire le contexte et demander la disponibilité.' },
];

const ACTIONS_TEXTE: { action: Exclude<ActionIa, 'rediger' | 'objet'>; label: string }[] = [
  { action: 'corriger', label: 'Corriger' },
  { action: 'reformuler', label: 'Reformuler' },
  { action: 'raccourcir', label: 'Raccourcir' },
  { action: 'developper', label: 'Développer' },
];

const ACCEPT = '.pdf,.png,.jpg,.jpeg,.webp,.gif,.txt,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip';
const MAX_PIECES = 10;

export function Composeur({
  conversationId,
  role,
  destinataire,
  brouillon,
  tacheId,
  onEnvoye,
  onMessage,
  className,
}: {
  conversationId: string;
  role: RoleFil;
  /** Nom affiché du destinataire (contexte de l'IA). */
  destinataire?: string;
  brouillon?: { id: string; corps: string } | null;
  tacheId?: string | null;
  onEnvoye?: (messageId: string) => void;
  /** Retour bref (toast) géré par le parent. */
  onMessage?: (m: string) => void;
  className?: string;
}) {
  const router = useRouter();
  const proprietaire = role === 'proprietaire';
  const [corps, setCorps] = React.useState(brouillon?.corps ?? '');
  const [brouillonId, setBrouillonId] = React.useState<string | null>(brouillon?.id ?? null);
  const [pieces, setPieces] = React.useState<Piece[]>([]);
  const [erreur, setErreur] = React.useState<string | null>(null);
  const [envoiEnCours, setEnvoiEnCours] = React.useState(false);
  const [sauvegarde, setSauvegarde] = React.useState(false);
  const [modifieDepuisSauvegarde, setModifie] = React.useState(false);
  const cle = React.useRef<string | null>(null);
  const verrou = React.useRef(false);
  const fichierRef = React.useRef<HTMLInputElement>(null);

  // Assistant IA
  const [iaOuverte, setIaOuverte] = React.useState(false);
  const [ton, setTon] = React.useState<Ton>('professionnel');
  const [consigne, setConsigne] = React.useState('');
  const [iaEnCours, setIaEnCours] = React.useState<ActionIa | null>(null);
  const [iaErreur, setIaErreur] = React.useState<string | null>(null);
  const [objet, setObjet] = React.useState<string | null>(null);
  const [avantIa, setAvantIa] = React.useState<string | null>(null);
  const [redigeAvecIa, setRedigeAvecIa] = React.useState(false);

  const cleCourante = () => {
    if (!cle.current) cle.current = nouvelleCle();
    return cle.current;
  };

  function changerCorps(v: string) {
    setCorps(v);
    setModifie(true);
    setErreur(null);
  }

  /* ---------------------------- IA ---------------------------- */

  async function lancerIa(action: ActionIa) {
    if (iaEnCours) return;
    setIaErreur(null);
    if (action === 'rediger' && !consigne.trim() && !corps.trim()) {
      setIaErreur('Décrivez en une phrase ce que vous voulez dire, ou choisissez un modèle.');
      return;
    }
    if (action !== 'rediger' && action !== 'objet' && !corps.trim()) {
      setIaErreur('Écrivez ou générez d’abord un texte.');
      return;
    }
    setIaEnCours(action);
    try {
      const r = await redigerAvecIa({
        action,
        ton,
        consigne: consigne.trim() || null,
        texte: corps.trim() || null,
        conversationId,
        tacheId: tacheId ?? null,
        destinataire: destinataire ?? null,
      });
      if (!r.ok || !r.data) {
        setIaErreur(r.ok ? 'L’assistant n’a rien proposé. Vous pouvez rédiger le message vous-même.' : r.erreur);
        return;
      }
      if (action === 'objet') {
        setObjet(r.data.texte);
        return;
      }
      setAvantIa(corps);
      setCorps(r.data.texte);
      setModifie(true);
      setRedigeAvecIa(true);
    } catch {
      setIaErreur('L’assistant IA est indisponible pour le moment. La rédaction manuelle reste possible.');
    } finally {
      setIaEnCours(null);
    }
  }

  function annulerIa() {
    if (avantIa === null) return;
    setCorps(avantIa);
    setAvantIa(null);
    setModifie(true);
  }

  /* ------------------------ Pièces jointes ------------------------ */

  async function ajouterFichiers(liste: FileList | null) {
    if (!liste || liste.length === 0) return;
    const fichiers = Array.from(liste).slice(0, Math.max(0, MAX_PIECES - pieces.length));
    if (fichiers.length < liste.length) setErreur(`${MAX_PIECES} pièces jointes au plus par message.`);
    const nouvelles = fichiers.map((f) => ({
      piece: { local: nouvelleCle(), nom: f.name, taille: f.size, mime: f.type, etat: 'envoi' } as Piece,
      fichier: f,
    }));
    setPieces((p) => [...p, ...nouvelles.map((n) => n.piece)]);
    const maj = (local: string, champs: Partial<Piece>) => setPieces((p) => p.map((x) => (x.local === local ? { ...x, ...champs } : x)));

    await Promise.all(nouvelles.map(async ({ piece: n, fichier }) => {
      try {
        if (!n.mime) {
          maj(n.local, { etat: 'erreur', erreur: 'Type de fichier non reconnu.' });
          return;
        }
        const prep = await preparerTeleversement(n.nom, n.taille, n.mime);
        if (!prep.ok || !prep.data) {
          maj(n.local, { etat: 'erreur', erreur: prep.ok ? 'Téléversement impossible.' : prep.erreur });
          return;
        }
        const jeton = new URL(prep.data.url).searchParams.get('token');
        if (!jeton) {
          maj(n.local, { etat: 'erreur', erreur: 'Téléversement impossible.' });
          return;
        }
        const { error } = await createClient().storage.from('cockpit').uploadToSignedUrl(prep.data.chemin, jeton, fichier, { contentType: n.mime });
        if (error) {
          maj(n.local, { etat: 'erreur', erreur: 'Le fichier n’a pas pu être téléversé.' });
          return;
        }
        maj(n.local, { etat: 'ok', chemin: prep.data.chemin });
      } catch {
        maj(n.local, { etat: 'erreur', erreur: 'Connexion interrompue pendant le téléversement.' });
      }
    }));
  }

  const retirerPiece = (local: string) => setPieces((p) => p.filter((x) => x.local !== local));
  const televersementEnCours = pieces.some((p) => p.etat === 'envoi');

  /* ---------------------------- Envoi ---------------------------- */

  async function envoyer() {
    if (verrou.current) return;
    const texte = corps.trim();
    if (!texte) {
      setErreur('Le message est vide.');
      return;
    }
    if (televersementEnCours) {
      setErreur('Patientez : une pièce jointe est en cours de téléversement.');
      return;
    }
    verrou.current = true;
    setEnvoiEnCours(true);
    setErreur(null);
    try {
      const r = await envoyerMessage({
        conversationId,
        corps: texte,
        cle: cleCourante(),
        brouillonId: proprietaire ? brouillonId : null,
        redigeAvecIa,
        pieces: pieces.filter((p) => p.etat === 'ok' && p.chemin).map((p) => ({ chemin: p.chemin!, nom: p.nom, taille: p.taille, mime: p.mime || null })),
      });
      if (!r.ok || !r.data) {
        // La clé est conservée : un nouvel essai ne crée jamais de doublon.
        setErreur(r.ok ? 'Le message n’a pas pu être envoyé.' : r.erreur);
        return;
      }
      cle.current = null;
      setCorps('');
      setPieces([]);
      setBrouillonId(null);
      setRedigeAvecIa(false);
      setAvantIa(null);
      setObjet(null);
      setConsigne('');
      setModifie(false);
      onMessage?.(r.data.doublon ? 'Ce message était déjà enregistré.' : 'Message enregistré dans le fil.');
      onEnvoye?.(r.data.messageId);
      router.refresh();
    } catch {
      setErreur('Connexion interrompue. Vous pouvez réessayer sans risque de doublon.');
    } finally {
      verrou.current = false;
      setEnvoiEnCours(false);
    }
  }

  async function sauverBrouillon() {
    if (!proprietaire || sauvegarde) return;
    if (!corps.trim()) {
      setErreur('Le brouillon est vide.');
      return;
    }
    setSauvegarde(true);
    setErreur(null);
    try {
      const r = await enregistrerBrouillon(conversationId, corps, brouillonId);
      if (!r.ok || !r.data) {
        setErreur(r.ok ? 'Le brouillon n’a pas été enregistré.' : r.erreur);
        return;
      }
      setBrouillonId(r.data.id);
      setModifie(false);
      onMessage?.('Brouillon enregistré.');
    } catch {
      setErreur('Connexion interrompue : le brouillon n’a pas été enregistré.');
    } finally {
      setSauvegarde(false);
    }
  }

  async function jeterBrouillon() {
    if (!brouillonId) {
      setCorps('');
      setModifie(false);
      return;
    }
    if (!window.confirm('Supprimer ce brouillon ?')) return;
    const r = await supprimerBrouillon(brouillonId);
    if (!r.ok) {
      setErreur(r.erreur);
      return;
    }
    setBrouillonId(null);
    setCorps('');
    setModifie(false);
    onMessage?.('Brouillon supprimé.');
    router.refresh();
  }

  return (
    <div className={cn('rounded-2xl border border-(--color-border) bg-white shadow-[0_1px_2px_rgba(60,20,30,0.04)]', className)}>
      {proprietaire && (
        <div className="border-b border-(--color-border) px-3 py-2 sm:px-4">
          <button
            type="button"
            onClick={() => setIaOuverte((o) => !o)}
            aria-expanded={iaOuverte}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[13px] font-medium transition-colors focus-ring',
              iaOuverte ? 'bg-(--color-primary-soft) text-(--color-primary)' : 'text-(--color-primary) hover:bg-(--color-primary-soft)',
            )}
          >
            <Sparkles className="h-4 w-4" /> Rédiger avec l’IA
          </button>
          <span className="ml-2 text-[11.5px] text-(--color-ink-muted)">Propose un texte modifiable — rien n’est envoyé sans votre clic.</span>

          {iaOuverte && (
            <div className="mt-2.5 grid gap-3 pb-1">
              <div>
                <p className="mb-1 text-[12px] font-medium text-(--color-ink-soft)">Ton</p>
                <div className="flex flex-wrap gap-1.5">
                  {TONS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTon(t)}
                      aria-pressed={ton === t}
                      className={cn(
                        'rounded-full border px-3 py-1 text-[12.5px] transition-colors focus-ring',
                        ton === t ? 'border-(--color-primary) bg-(--color-primary) text-white' : 'border-(--color-border) bg-white text-(--color-ink-soft) hover:bg-(--color-surface-soft)',
                      )}
                    >
                      {TON_LABEL[t]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1 text-[12px] font-medium text-(--color-ink-soft)">Consigne ou modèle</p>
                <div className="mb-1.5 flex flex-wrap gap-1.5">
                  {MODELES.map((m) => (
                    <button
                      key={m.label}
                      type="button"
                      onClick={() => setConsigne(m.consigne)}
                      className="inline-flex items-center gap-1 rounded-md bg-(--color-surface-soft) px-2 py-1 text-[12px] text-(--color-ink-soft) hover:bg-(--color-surface-soft) hover:text-(--color-ink) focus-ring"
                    >
                      <FileText className="h-3.5 w-3.5" /> {m.label}
                    </button>
                  ))}
                </div>
                <textarea
                  className={cn(champ, 'min-h-[60px] resize-y text-[13.5px]')}
                  value={consigne}
                  onChange={(e) => setConsigne(e.target.value)}
                  maxLength={1500}
                  placeholder="Ex. Relancer pour la correction du chapitre 12, idéalement avant vendredi."
                />
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <Bouton type="button" taille="sm" onClick={() => lancerIa('rediger')} enCours={iaEnCours === 'rediger'} disabled={!!iaEnCours}>
                  <Sparkles /> Générer le brouillon
                </Bouton>
                {ACTIONS_TEXTE.map((a) => (
                  <Bouton
                    key={a.action}
                    type="button"
                    variante="contour"
                    taille="sm"
                    onClick={() => lancerIa(a.action)}
                    enCours={iaEnCours === a.action}
                    disabled={!!iaEnCours || !corps.trim()}
                  >
                    {a.label}
                  </Bouton>
                ))}
                <Bouton type="button" variante="contour" taille="sm" onClick={() => lancerIa('objet')} enCours={iaEnCours === 'objet'} disabled={!!iaEnCours || !corps.trim()}>
                  Proposer un objet
                </Bouton>
                {avantIa !== null && (
                  <Bouton type="button" variante="fantome" taille="sm" onClick={annulerIa}>
                    <Undo2 /> Revenir au texte précédent
                  </Bouton>
                )}
              </div>
              {objet && (
                <div className="flex flex-wrap items-center gap-2 rounded-lg bg-(--color-surface-soft) px-3 py-2 text-[13px] text-(--color-ink)">
                  <span className="text-(--color-ink-soft)">Objet proposé :</span>
                  <span className="font-medium">{objet}</span>
                  <Bouton
                    type="button"
                    variante="fantome"
                    taille="xs"
                    className="ml-auto"
                    onClick={() => { void navigator.clipboard?.writeText(objet).then(() => onMessage?.('Objet copié.')).catch(() => undefined); }}
                  >
                    <Copy /> Copier
                  </Bouton>
                  <button type="button" onClick={() => setObjet(null)} className="rounded p-0.5 text-(--color-ink-muted) hover:text-(--color-ink) focus-ring" aria-label="Fermer la proposition d’objet">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
              {iaErreur && (
                <p role="alert" className="flex items-start gap-2 rounded-lg bg-[#FFF3E0] px-3 py-2 text-[13px] text-[#B45309]">
                  <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{iaErreur} <span className="text-(--color-ink-soft)">Votre texte est conservé ci-dessous.</span></span>
                </p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="px-3 pt-3 sm:px-4">
        <label htmlFor={`corps-${conversationId}`} className="sr-only">Votre message</label>
        <textarea
          id={`corps-${conversationId}`}
          className="block min-h-[140px] w-full resize-y border-0 bg-transparent p-0 text-[14.5px] leading-relaxed text-(--color-ink) placeholder:text-(--color-ink-muted) focus:outline-none focus:ring-0"
          value={corps}
          onChange={(e) => changerCorps(e.target.value)}
          maxLength={20000}
          placeholder={proprietaire ? `Écrire à ${destinataire ?? 'votre interlocuteur'}…` : 'Votre réponse…'}
          disabled={envoiEnCours}
        />
        {redigeAvecIa && (
          <p className="pb-1 text-[11.5px] text-(--color-ink-muted)">Texte proposé par l’IA : relisez-le et ajustez-le avant l’envoi.</p>
        )}
      </div>

      {pieces.length > 0 && (
        <ul className="flex flex-wrap gap-1.5 px-3 pb-1 pt-2 sm:px-4">
          {pieces.map((p) => (
            <li
              key={p.local}
              title={p.erreur ?? p.nom}
              className={cn(
                'inline-flex max-w-full items-center gap-1.5 rounded-lg border px-2 py-1 text-[12px]',
                p.etat === 'erreur' ? 'border-[#F5C2C0] bg-[#FCE4E4] text-[#B42318]' : 'border-(--color-border) bg-(--color-surface-soft) text-(--color-ink-soft)',
              )}
            >
              <Paperclip className="h-3.5 w-3.5 shrink-0" />
              <span className="max-w-[180px] truncate">{p.nom}</span>
              <span className="text-(--color-ink-muted)">
                {p.etat === 'envoi' ? 'téléversement…' : p.etat === 'erreur' ? p.erreur : tailleLisible(p.taille)}
              </span>
              <button type="button" onClick={() => retirerPiece(p.local)} className="rounded p-0.5 hover:bg-black/5 focus-ring" aria-label={`Retirer ${p.nom}`}>
                <X className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {erreur && (
        <p role="alert" className="mx-3 mt-2 rounded-lg bg-[#FCE4E4] px-3 py-2 text-[13px] text-[#B42318] sm:mx-4">{erreur}</p>
      )}

      <div className="flex flex-wrap items-center gap-2 px-3 py-3 sm:px-4">
        <input
          ref={fichierRef}
          type="file"
          multiple
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => { void ajouterFichiers(e.target.files); e.target.value = ''; }}
        />
        <Bouton type="button" variante="fantome" taille="sm" onClick={() => fichierRef.current?.click()} disabled={pieces.length >= MAX_PIECES || envoiEnCours}>
          <Paperclip /> Joindre
        </Bouton>
        {proprietaire && (
          <>
            <Bouton type="button" variante="fantome" taille="sm" onClick={sauverBrouillon} enCours={sauvegarde} disabled={envoiEnCours || !corps.trim()}>
              <Save /> {brouillonId && !modifieDepuisSauvegarde ? 'Brouillon enregistré' : 'Enregistrer le brouillon'}
            </Bouton>
            {(brouillonId || corps) && (
              <Bouton type="button" variante="fantome" taille="sm" onClick={jeterBrouillon} disabled={envoiEnCours} aria-label="Supprimer le brouillon">
                <Trash2 />
              </Bouton>
            )}
          </>
        )}
        <Bouton type="button" className="ml-auto" onClick={envoyer} enCours={envoiEnCours} disabled={!corps.trim() || televersementEnCours}>
          <Send /> Envoyer
        </Bouton>
      </div>
    </div>
  );
}
