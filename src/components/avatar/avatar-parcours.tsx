'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { PortraitAvatar } from '@/components/avatar/portrait-avatar';
import {
  ETAPES,
  ETAPE_FINALE,
  candidats,
  choisir,
  choixDepuisAvatar,
  etapeSansChoix,
  optionsEtape,
  parRessemblance,
  type Choix,
} from '@/lib/avatars/parcours';
import {
  PORTRAITS,
  avatarAuHasard,
  libelleOption,
  portraitAffiche,
  type Portrait,
} from '@/lib/avatars/portraits';
import './avatar-parcours.css';

/** Portraits montrés à la dernière étape, au plus. */
const MAX_FINALE = 24;
/** Portraits « proches » proposés quand la sélection est maigre ou prise. */
const MAX_PROCHES = 12;

/**
 * Parcours de choix de l'avatar : profil, teint, visage, cheveux, coiffure,
 * barbe, accessoires, tenue, expression, fond — puis le portrait lui-même.
 *
 * On ne compose rien : chaque étape filtre les portraits du catalogue et
 * n'offre que les options qui mènent à un portrait existant. Chaque option
 * est illustrée par le portrait le plus proche de l'avatar en cours : on voit
 * le changement, pas une étiquette.
 *
 * La disponibilité (EVC Arena seulement, où deux participants d'un même
 * tournoi ne portent jamais le même portrait) n'est interrogée qu'à la
 * DERNIÈRE étape, sur les seuls portraits qui y sont montrés.
 * `verifierDisponibilite` reçoit des codes et renvoie ceux qui sont DÉJÀ PRIS.
 */
export function AvatarParcours({
  valeur,
  onChange,
  theme = 'clair',
  apercuTaille = 168,
  legende,
  actions,
  verifierDisponibilite,
  onDisponibilite,
}: {
  valeur: string;
  onChange: (seed: string) => void;
  theme?: 'clair' | 'arena';
  apercuTaille?: number;
  legende?: ReactNode;
  /** Actions du parent (enregistrer, s'inscrire), affichées sous le parcours. */
  actions?: ReactNode;
  verifierDisponibilite?: (codes: string[]) => Promise<string[]>;
  onDisponibilite?: (etat: 'inconnu' | 'verification' | 'libre' | 'pris') => void;
}) {
  const actuel = portraitAffiche(valeur);
  const [etape, setEtape] = useState(0);
  const [choix, setChoix] = useState<Choix>(() => choixDepuisAvatar(valeur));
  const [pris, setPris] = useState<Set<string> | null>(null);
  const [verification, setVerification] = useState(false);
  const sondeRef = useRef(0);
  const dernierEmis = useRef(valeur);

  // Un changement VENU DU PARENT (tirage initial, « Au hasard ») réaligne
  // tous les choix sur le nouveau portrait. Nos propres changements, eux,
  // gardent les critères laissés « Indifférent ».
  useEffect(() => {
    if (valeur === dernierEmis.current) return;
    dernierEmis.current = valeur;
    const t = window.setTimeout(() => setChoix(choixDepuisAvatar(valeur)), 0);
    return () => window.clearTimeout(t);
  }, [valeur]);

  function emettre(p: Portrait) {
    dernierEmis.current = p.code;
    onChange(p.code);
  }

  const finale = etape === ETAPE_FINALE;
  const restants = useMemo(() => candidats(choix), [choix]);
  const selection = useMemo(
    () => parRessemblance(restants, actuel).slice(0, MAX_FINALE),
    [restants, actuel],
  );
  // Voisins hors sélection : ils évitent l'impasse quand il ne reste qu'un
  // ou deux portraits, ou qu'ils sont déjà portés dans le tournoi.
  const proches = useMemo(() => {
    if (!finale || (restants.length >= 6 && !verifierDisponibilite)) return [];
    const dedans = new Set(restants.map((p) => p.numero));
    return parRessemblance(PORTRAITS.filter((p) => !dedans.has(p.numero)), actuel).slice(0, MAX_PROCHES);
  }, [finale, restants, actuel, verifierDisponibilite]);

  const clefSonde = finale ? [...selection, ...proches].map((p) => p.code).join(',') : '';

  useEffect(() => {
    if (!finale || !verifierDisponibilite || !clefSonde) {
      const t = window.setTimeout(() => { setPris(null); setVerification(false); }, 0);
      return () => window.clearTimeout(t);
    }
    const id = ++sondeRef.current;
    const t = window.setTimeout(async () => {
      setVerification(true);
      try {
        const occupes = await verifierDisponibilite(clefSonde.split(','));
        if (id === sondeRef.current) setPris(new Set(occupes));
      } catch {
        if (id === sondeRef.current) setPris(null);
      } finally {
        if (id === sondeRef.current) setVerification(false);
      }
    }, 0);
    return () => window.clearTimeout(t);
  }, [finale, clefSonde, verifierDisponibilite]);

  const selectionPrise = !!pris?.has(actuel.code);

  useEffect(() => {
    if (!onDisponibilite) return;
    const t = window.setTimeout(() => {
      onDisponibilite(
        !verifierDisponibilite ? 'inconnu'
          : !finale ? 'inconnu'
          : verification ? 'verification'
          : pris === null ? 'inconnu'
          : selectionPrise ? 'pris' : 'libre',
      );
    }, 0);
    return () => window.clearTimeout(t);
  }, [onDisponibilite, verifierDisponibilite, finale, verification, pris, selectionPrise]);

  function poser(index: number, v: string | undefined) {
    const r = choisir(choix, index, v, actuel);
    setChoix(r.choix);
    emettre(r.avatar);
  }

  /** Étape suivante ou précédente, en sautant celles qui n'offrent aucun choix. */
  function aller(sens: 1 | -1) {
    let i = etape + sens;
    while (i >= 0 && i < ETAPE_FINALE && etapeSansChoix(i, choix)) i += sens;
    setEtape(Math.max(0, Math.min(ETAPE_FINALE, i)));
  }

  function auHasard() {
    const code = avatarAuHasard();
    const p = portraitAffiche(code);
    setChoix(choixDepuisAvatar(code));
    emettre(p);
  }

  const courante = finale ? null : ETAPES[etape];
  const options = courante ? optionsEtape(etape, choix, actuel) : [];
  const vignette = (p: Portrait, taille = 56) => <PortraitAvatar seed={p.code} size={taille} decoratif />;

  return (
    <div className="av-parcours" data-theme={theme}>
      <div className="av-apercu">
        <PortraitAvatar seed={actuel.code} size={apercuTaille} className="av-apercu__figure" />
        <div className="av-apercu__tailles" aria-hidden>
          {/* Les tailles réellement utilisées ailleurs : classement et barre
              de navigation. */}
          <PortraitAvatar seed={actuel.code} size={46} decoratif />
          <PortraitAvatar seed={actuel.code} size={32} decoratif />
        </div>
        {legende && <p className="av-apercu__legende">{legende}</p>}
        <ul className="av-resume" aria-label="Vos choix">
          {ETAPES.map(({ critere, titre }) => (
            <li key={critere} data-ouvert={choix[critere] === undefined ? '' : undefined}>
              <span>{titre}</span>
              {choix[critere] === undefined ? 'Indifférent' : libelleOption(critere, choix[critere]!)}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <ol className="av-etapes">
          {ETAPES.map((e, i) => {
            const vide = etapeSansChoix(i, choix);
            return (
              <li key={e.critere}>
                <button
                  type="button"
                  className="av-etape"
                  aria-current={i === etape ? 'step' : undefined}
                  data-fait={i < etape ? '' : undefined}
                  data-vide={vide ? '' : undefined}
                  title={vide ? 'Une seule possibilité avec vos choix précédents' : undefined}
                  onClick={() => setEtape(i)}
                >
                  <span className="av-etape__rang">{i + 1}</span>
                  {e.titre}
                </button>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              className="av-etape"
              aria-current={finale ? 'step' : undefined}
              onClick={() => setEtape(ETAPE_FINALE)}
            >
              <span className="av-etape__rang">{ETAPE_FINALE + 1}</span>
              Portrait
            </button>
          </li>
        </ol>
        <p className="av-etapes__consigne">
          Étape {etape + 1} sur {ETAPE_FINALE + 1} —{' '}
          {courante ? courante.consigne : restants.length > 1
            ? `${restants.length} portraits correspondent à vos choix : choisissez le vôtre.`
            : 'Voici votre portrait.'}
        </p>

        {courante && (
          <div className="av-grille" role="group" aria-label={courante.titre}>
            {options.map((o) => (
              <button
                key={o.valeur}
                type="button"
                className="av-choix"
                aria-pressed={choix[courante.critere] === o.valeur}
                onClick={() => poser(etape, o.valeur)}
              >
                {vignette(o.apercu)}
                <span className="av-choix__label">
                  {o.swatch && <i className="av-choix__pastille" style={{ background: o.swatch }} aria-hidden />}
                  {o.label}
                </span>
              </button>
            ))}
            {options.length > 1 && (
              <button
                type="button"
                className="av-choix av-choix--ouvert"
                aria-pressed={choix[courante.critere] === undefined}
                onClick={() => poser(etape, undefined)}
              >
                <span className="av-choix__indifferent" aria-hidden>?</span>
                <span className="av-choix__label">Indifférent</span>
              </button>
            )}
          </div>
        )}

        {finale && (
          <>
            <div className="av-grille av-grille--portraits" role="group" aria-label="Portraits correspondant à vos choix">
              {selection.map((p) => (
                <CartePortrait key={p.code} p={p} choisi={p.numero === actuel.numero} pris={!!pris?.has(p.code)} onClick={() => emettre(p)} />
              ))}
            </div>
            {proches.length > 0 && (
              <>
                <p className="av-trait__titre">Portraits proches</p>
                <div className="av-grille av-grille--portraits" role="group" aria-label="Portraits proches">
                  {proches.map((p) => (
                    <CartePortrait
                      key={p.code}
                      p={p}
                      choisi={p.numero === actuel.numero}
                      pris={!!pris?.has(p.code)}
                      onClick={() => { setChoix(choixDepuisAvatar(p.code)); emettre(p); }}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {finale && verifierDisponibilite && (
          <p className="av-dispo" role="status" data-etat={verification ? 'verification' : selectionPrise ? 'pris' : pris ? 'libre' : 'inconnu'}>
            {verification && 'Vérification des portraits déjà pris…'}
            {!verification && pris === null && 'Disponibilité non vérifiée.'}
            {!verification && pris !== null && !selectionPrise && 'Ce portrait est disponible.'}
            {!verification && selectionPrise && 'Ce portrait est déjà porté dans cette Arena : choisissez-en un qui n’est pas grisé.'}
          </p>
        )}

        <div className="av-actions">
          {etape > 0 && (
            <button type="button" className="av-onglet" onClick={() => aller(-1)}>Précédent</button>
          )}
          {!finale && (
            <button type="button" className="av-onglet av-onglet--suite" onClick={() => aller(1)}>Suivant</button>
          )}
          <button type="button" className="av-onglet" onClick={auHasard}>Au hasard</button>
          {actions}
        </div>
      </div>
    </div>
  );
}

function CartePortrait({ p, choisi, pris, onClick }: { p: Portrait; choisi: boolean; pris: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      className="av-choix"
      aria-pressed={choisi}
      aria-label={pris ? 'Portrait déjà pris' : undefined}
      data-indisponible={pris ? '' : undefined}
      // Le choix en cours reste cliquable même s'il est pris : le désactiver
      // piégerait le clavier sur un bouton sélectionné.
      disabled={pris && !choisi}
      onClick={onClick}
    >
      <PortraitAvatar seed={p.code} size={72} />
      {pris && <span className="av-choix__pris">Pris</span>}
    </button>
  );
}
