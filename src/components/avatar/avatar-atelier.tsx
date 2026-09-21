'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ComposedAvatarSvg } from '@/components/avatar/composed-avatar';
import {
  DERNIER_GROUPE,
  TRAIT_GROUPS,
  avatarAuHasard,
  decoderAvatar,
  encoderAvatar,
  optionsAutorisees,
  traitsDuGroupe,
  type Perimetre,
} from '@/lib/avatars/traits';
import './avatar-atelier.css';

/**
 * Atelier de composition, en quatre étapes : portrait, fond, cadre, emblème.
 *
 * Chaque option est montrée SUR le médaillon en cours — on voit le résultat,
 * pas une étiquette.
 *
 * La disponibilité n'est interrogée qu'à la DERNIÈRE étape, et c'est voulu :
 * un médaillon n'est complet qu'une fois tous ses réglages posés. Griser plus
 * tôt n'aurait aucun sens (aucun portrait, aucune couleur n'est « pris » en
 * soi) et donnerait une fausse impression de rareté.
 *
 * Le composant ne connaît ni le tournoi ni le compte : il rend un code
 * (`c1-…`) au parent, qui décide de l'enregistrement. `verifierDisponibilite`
 * reçoit des codes complets et renvoie ceux qui sont DÉJÀ PRIS.
 */
export function AvatarAtelier({
  valeur,
  onChange,
  theme = 'clair',
  perimetre = 'arena',
  apercuTaille = 168,
  legende,
  actions,
  verifierDisponibilite,
  onDisponibilite,
}: {
  valeur: string;
  onChange: (seed: string) => void;
  theme?: 'clair' | 'arena';
  perimetre?: Perimetre;
  apercuTaille?: number;
  legende?: ReactNode;
  /** Actions du parent (enregistrer, s'inscrire) : affichées à la dernière étape. */
  actions?: ReactNode;
  /** Reçoit des codes complets, renvoie ceux qui sont déjà pris. */
  verifierDisponibilite?: (codes: string[]) => Promise<string[]>;
  /** Prévient le parent que la sélection courante est libre, prise, ou inconnue. */
  onDisponibilite?: (etat: 'inconnu' | 'verification' | 'libre' | 'pris') => void;
}) {
  const [etape, setEtape] = useState(0);
  const [pris, setPris] = useState<Set<string> | null>(null);
  const [verification, setVerification] = useState(false);
  const config = useMemo(() => decoderAvatar(valeur), [valeur]);
  const groupe = TRAIT_GROUPS[etape];
  const traits = traitsDuGroupe(groupe.id);
  const derniere = groupe.id === DERNIER_GROUPE;
  const sondeRef = useRef(0);

  /**
   * Codes candidats de la dernière étape : le médaillon en cours décliné sur
   * chaque option de l'étape. C'est cette liste que l'on confronte à la base.
   */
  const candidats = useMemo(() => {
    const out = new Map<string, { trait: string; index: number }>();
    if (!derniere) return out;
    for (const trait of traits) {
      for (const index of optionsAutorisees(trait.key, perimetre)) {
        out.set(encoderAvatar({ ...config, [trait.key]: index }), { trait: trait.key, index });
      }
    }
    return out;
  }, [derniere, traits, config, perimetre]);

  const clefCandidats = [...candidats.keys()].join(',');

  useEffect(() => {
    if (!derniere || !verifierDisponibilite || !clefCandidats) {
      const t = window.setTimeout(() => { setPris(null); setVerification(false); }, 0);
      return () => window.clearTimeout(t);
    }
    const id = ++sondeRef.current;
    const codes = clefCandidats.split(',');
    const t = window.setTimeout(async () => {
      setVerification(true);
      try {
        const occupes = await verifierDisponibilite(codes);
        if (id !== sondeRef.current) return;
        setPris(new Set(occupes));
      } catch {
        if (id === sondeRef.current) setPris(null);
      } finally {
        if (id === sondeRef.current) setVerification(false);
      }
    }, 0);
    return () => window.clearTimeout(t);
  }, [derniere, clefCandidats, verifierDisponibilite]);

  const selectionPrise = !!pris?.has(valeur);
  const toutPris = !!pris && candidats.size > 0 && [...candidats.keys()].every((c) => pris.has(c));

  // Le parent n'a pas à refaire le raisonnement : on lui dit l'état.
  useEffect(() => {
    if (!onDisponibilite) return;
    const t = window.setTimeout(() => {
      onDisponibilite(
        !derniere || !verifierDisponibilite ? 'inconnu'
          : verification ? 'verification'
          : pris === null ? 'inconnu'
          : selectionPrise ? 'pris' : 'libre',
      );
    }, 0);
    return () => window.clearTimeout(t);
  }, [onDisponibilite, derniere, verifierDisponibilite, verification, pris, selectionPrise]);

  /** Premier candidat libre, pour sortir la personne d'une impasse en un clic. */
  function premierLibre(): string | null {
    for (const code of candidats.keys()) if (!pris?.has(code)) return code;
    return null;
  }

  return (
    <div className="av-atelier" data-theme={theme}>
      <div className="av-apercu">
        <ComposedAvatarSvg seed={valeur} size={apercuTaille} className="av-apercu__figure" />
        <div className="av-apercu__tailles" aria-hidden>
          {/* Les deux tailles réellement utilisées ailleurs : classement et
              barre de navigation. Composer un médaillon illisible à 32 px doit
              se voir tout de suite. */}
          <ComposedAvatarSvg seed={valeur} size={46} />
          <ComposedAvatarSvg seed={valeur} size={32} />
        </div>
        {legende && <p className="av-apercu__legende">{legende}</p>}
        <p className="av-apercu__code">{valeur}</p>
      </div>

      <div>
        <ol className="av-etapes">
          {TRAIT_GROUPS.map((g, i) => (
            <li key={g.id}>
              <button
                type="button"
                className="av-etape"
                // On peut revenir en arrière librement, mais pas sauter en avant :
                // la dernière étape n'a de sens qu'une fois le reste posé.
                disabled={i > etape}
                aria-current={i === etape ? 'step' : undefined}
                data-fait={i < etape ? '' : undefined}
                onClick={() => setEtape(i)}
              >
                <span className="av-etape__rang">{i + 1}</span>
                {g.label}
              </button>
            </li>
          ))}
        </ol>
        <p className="av-etapes__consigne">
          Étape {etape + 1} sur {TRAIT_GROUPS.length} — {groupe.consigne}
        </p>

        {traits.map((trait) => (
          <div key={trait.key} className="av-trait">
            <p className="av-trait__titre" id={`av-t-${trait.key}`}>{trait.label}</p>
            {trait.kind === 'couleur' ? (
              <div className="av-pastilles" role="group" aria-labelledby={`av-t-${trait.key}`}>
                {optionsAutorisees(trait.key, perimetre).map((i) => {
                  const option = trait.options[i];
                  const candidat = encoderAvatar({ ...config, [trait.key]: i });
                  // Le choix en cours est grisé lui aussi s'il est pris — le taire
                  // laisserait croire qu'il est encore disponible. Il reste cliquable
                  // pour ne pas piéger le clavier sur un bouton désactivé et sélectionné.
                  const indisponible = derniere && !!pris?.has(candidat);
                  const choisi = config[trait.key] === i;
                  return (
                    <button
                      key={i}
                      type="button"
                      className="av-pastille"
                      style={{ background: option.swatch }}
                      aria-pressed={choisi}
                      aria-label={indisponible ? `${option.label} — déjà pris` : option.label}
                      title={indisponible ? `${option.label} — déjà pris` : option.label}
                      data-indisponible={indisponible ? '' : undefined}
                      disabled={indisponible && !choisi}
                      onClick={() => onChange(candidat)}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="av-grille" role="group" aria-labelledby={`av-t-${trait.key}`}>
                {optionsAutorisees(trait.key, perimetre).map((i) => {
                  const option = trait.options[i];
                  const candidat = encoderAvatar({ ...config, [trait.key]: i });
                  // Le choix en cours est grisé lui aussi s'il est pris — le taire
                  // laisserait croire qu'il est encore disponible. Il reste cliquable
                  // pour ne pas piéger le clavier sur un bouton désactivé et sélectionné.
                  const indisponible = derniere && !!pris?.has(candidat);
                  const choisi = config[trait.key] === i;
                  return (
                    <button
                      key={i}
                      type="button"
                      className="av-choix"
                      aria-pressed={choisi}
                      aria-label={indisponible ? `${option.label} — déjà pris` : option.label}
                      title={indisponible ? `${option.label} — déjà pris` : option.label}
                      data-indisponible={indisponible ? '' : undefined}
                      disabled={indisponible && !choisi}
                      onClick={() => onChange(candidat)}
                    >
                      <ComposedAvatarSvg
                        seed={candidat}
                        size={52}
                        title={option.label}
                        cadrage={trait.key === 'portrait' ? 'serre' : 'buste'}
                      />
                      {indisponible && <span className="av-choix__pris">Pris</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {derniere && verifierDisponibilite && (
          <p className="av-dispo" role="status" data-etat={verification ? 'verification' : selectionPrise ? 'pris' : pris ? 'libre' : 'inconnu'}>
            {verification && 'Vérification des médaillons déjà pris…'}
            {!verification && pris === null && 'Disponibilité non vérifiée.'}
            {!verification && pris !== null && !selectionPrise && 'Ce médaillon est disponible.'}
            {!verification && selectionPrise && !toutPris && 'Ce médaillon est déjà porté. Choisissez un emblème non grisé.'}
            {!verification && toutPris && 'Tous les emblèmes de cette composition sont pris. Revenez d’une étape pour changer le cadre ou le fond.'}
          </p>
        )}

        <div className="av-actions">
          {etape > 0 && (
            <button type="button" className="av-onglet" onClick={() => setEtape((n) => n - 1)}>
              Précédent
            </button>
          )}
          {!derniere && (
            <button type="button" className="av-onglet av-onglet--suite" onClick={() => setEtape((n) => n + 1)}>
              Suivant
            </button>
          )}
          <button type="button" className="av-onglet" onClick={() => onChange(avatarAuHasard(Math.random, perimetre))}>
            Composer au hasard
          </button>
          {derniere && selectionPrise && !toutPris && (
            <button
              type="button"
              className="av-onglet"
              onClick={() => { const libre = premierLibre(); if (libre) onChange(libre); }}
            >
              Prendre le premier libre
            </button>
          )}
          {derniere && actions}
        </div>
      </div>
    </div>
  );
}
