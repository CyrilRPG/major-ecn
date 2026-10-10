'use client';

import * as React from 'react';
import Link from 'next/link';
import { Send, Sparkles } from 'lucide-react';
import { demanderAssistant, redigerAvecIa } from '@/app/admin/cockpit/actions-messagerie';
import { TONS, TON_LABEL, type Ton } from '@/lib/cockpit/regles';
import { Bouton, champ, Libelle } from '@/components/admin/cockpit/ui';
import { BoutonCopier, Fenetre } from './outils';

/**
 * Assistance IA des dossiers : préparation d'une réponse au client (texte
 * modifiable, à copier) et analyse d'un dossier. RIEN n'est jamais envoyé
 * automatiquement : l'administrateur relit, copie, puis écrit lui-même.
 */

export function BoutonReponseIa({
  demandeId, reclamationId, destinataire, lienEcrire, taille = 'sm',
}: {
  demandeId?: string;
  reclamationId?: string;
  destinataire: string;
  /** Lien facultatif vers la messagerie (simple navigation, aucun envoi). */
  lienEcrire?: string;
  taille?: 'xs' | 'sm';
}) {
  const [ouvert, setOuvert] = React.useState(false);
  const [ton, setTon] = React.useState<Ton>('professionnel');
  const [consigne, setConsigne] = React.useState('');
  const [texte, setTexte] = React.useState('');
  const [erreur, setErreur] = React.useState<string | null>(null);
  const [enCours, startTransition] = React.useTransition();

  function generer() {
    setErreur(null);
    startTransition(async () => {
      const r = await redigerAvecIa({
        action: 'rediger', ton, consigne: consigne.trim() || null,
        demandeId: demandeId ?? null, reclamationId: reclamationId ?? null, destinataire,
      });
      if (r.ok) setTexte(r.data?.texte ?? '');
      else setErreur(r.erreur);
    });
  }

  return (
    <>
      <Bouton type="button" variante="doux" taille={taille} onClick={() => setOuvert(true)}>
        <Sparkles /> Préparer une réponse (IA)
      </Bouton>
      <Fenetre
        ouvert={ouvert}
        onOuvert={setOuvert}
        titre="Préparer une réponse"
        sousTitre={<>Brouillon pour <strong className="font-medium text-(--color-ink)">{destinataire}</strong> — rien n’est envoyé automatiquement.</>}
      >
        <div className="grid gap-3">
          <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
            <div>
              <Libelle htmlFor="ia-ton">Ton</Libelle>
              <select id="ia-ton" className={champ} value={ton} onChange={(e) => setTon(e.target.value as Ton)}>
                {TONS.map((t) => <option key={t} value={t}>{TON_LABEL[t]}</option>)}
              </select>
            </div>
            <div>
              <Libelle htmlFor="ia-consigne" aide="(facultatif)">Consigne</Libelle>
              <input
                id="ia-consigne"
                className={champ}
                value={consigne}
                onChange={(e) => setConsigne(e.target.value)}
                placeholder="Ex. : proposer un échéancier en 3 fois, rappeler le délai…"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Bouton type="button" taille="sm" onClick={generer} enCours={enCours}>
              {!enCours && <Sparkles />} {texte ? 'Régénérer' : 'Générer le brouillon'}
            </Bouton>
          </div>
          {erreur && <p className="rounded-lg bg-[#FCE4E4] px-3 py-2 text-[13px] text-[#B42318]">{erreur}</p>}
          <div>
            <Libelle htmlFor="ia-texte" aide="(modifiable)">Brouillon</Libelle>
            <textarea
              id="ia-texte"
              className={`${champ} min-h-[220px] leading-relaxed`}
              value={texte}
              onChange={(e) => setTexte(e.target.value)}
              placeholder={enCours ? 'Rédaction en cours…' : 'Choisissez un ton puis générez le brouillon.'}
            />
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {lienEcrire && (
              <Link
                href={lienEcrire}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium text-(--color-primary) hover:bg-(--color-primary-soft) focus-ring"
              >
                <Send className="h-4 w-4" /> Écrire au client
              </Link>
            )}
            <BoutonCopier texte={texte} />
          </div>
        </div>
      </Fenetre>
    </>
  );
}

const CONSIGNE_ANALYSE: Record<'reclamation' | 'amelioration' | 'demande', string> = {
  reclamation:
    'Synthétise et analyse cette réclamation : ce que vit le candidat, cause probable, nature du problème (individuel, pédagogique collectif, technique ou service), gravité, réponse à lui apporter et action recommandée. Sois bref et structuré.',
  amelioration:
    'Synthétise et analyse cette amélioration et les réclamations rattachées : problème commun, fréquence et gravité, causes probables, action corrective recommandée, critères de vérification et message à adresser aux candidats concernés. Sois bref et structuré.',
  demande:
    'Synthétise et analyse cette demande client : besoin exprimé, points à vérifier, prochaine action recommandée. Sois bref et structuré.',
};

export function BoutonAnalyseIa({
  type, id, titre, taille = 'sm',
}: {
  type: 'reclamation' | 'amelioration' | 'demande';
  id: string;
  titre: string;
  taille?: 'xs' | 'sm';
}) {
  const [ouvert, setOuvert] = React.useState(false);
  const [texte, setTexte] = React.useState('');
  const [erreur, setErreur] = React.useState<string | null>(null);
  const [enCours, startTransition] = React.useTransition();

  function lancer() {
    setErreur(null);
    setTexte('');
    startTransition(async () => {
      const r = await demanderAssistant(CONSIGNE_ANALYSE[type], { type, id });
      if (r.ok) setTexte(r.data?.texte ?? '');
      else setErreur(r.erreur);
    });
  }

  return (
    <>
      <Bouton
        type="button"
        variante="doux"
        taille={taille}
        onClick={() => {
          setOuvert(true);
          lancer();
        }}
      >
        <Sparkles /> Analyser avec l’IA
      </Bouton>
      <Fenetre ouvert={ouvert} onOuvert={setOuvert} titre="Analyse de l’IA" sousTitre={titre}>
        <div className="grid gap-3">
          {erreur && <p className="rounded-lg bg-[#FCE4E4] px-3 py-2 text-[13px] text-[#B42318]">{erreur}</p>}
          <div className="min-h-[160px] whitespace-pre-wrap rounded-xl border border-(--color-border) bg-(--color-surface-soft)/60 px-4 py-3 text-[13.5px] leading-relaxed text-(--color-ink)">
            {enCours ? <span className="text-(--color-ink-muted)">Analyse en cours…</span> : texte || <span className="text-(--color-ink-muted)">Aucun résultat.</span>}
          </div>
          <p className="text-[11.5px] text-(--color-ink-muted)">Analyse indicative, à vérifier. Les coordonnées des personnes ne sont pas transmises à l’IA.</p>
          <div className="flex flex-wrap justify-end gap-2">
            <Bouton type="button" variante="fantome" taille="sm" onClick={lancer} disabled={enCours}>Relancer</Bouton>
            <BoutonCopier texte={texte} />
          </div>
        </div>
      </Fenetre>
    </>
  );
}
