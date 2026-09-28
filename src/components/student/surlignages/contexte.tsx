'use client';

/**
 * État des surlignages d'une fiche pour l'élève connecté : chargement,
 * modifications, réancrage sur la version courante du PDF et sauvegarde
 * automatique (débounce, sans bouton) via /api/fiches/[cours]/surlignages.
 *
 * Ce module ne dépend PAS de pdf.js : il est importé par le lecteur, chargé
 * avec la page, alors que pdf.js n'arrive qu'avec le canvas paresseux (et son
 * polyfill, qui doit rester le premier import de pdf-canvas).
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  citationEnPlace,
  construireTextePage,
  estCouleur,
  reancrer,
  trierSurlignages,
  COULEUR_PAR_DEFAUT,
  type CouleurSurlignage,
  type EtatAncrage,
  type RectNorm,
  type Surlignage,
  type TextePage,
} from '@/lib/fiches/surlignages-pure';

export type EtatSauvegarde =
  | 'chargement'
  | 'pret'
  | 'modifie'
  | 'enregistrement'
  | 'enregistre'
  | 'erreur'
  | 'indisponible';

/** Sous-ensemble de PDFDocumentProxy utilisé ici (pas d'import de pdf.js). */
export type DocumentTexte = {
  numPages: number;
  getPage(n: number): Promise<{ getTextContent(): Promise<{ items: readonly unknown[] }> }>;
};

type ContexteSurlignages = {
  /** Chargement réussi : création et modification permises. */
  actif: boolean;
  sauvegarde: EtatSauvegarde;
  surlignages: Surlignage[];
  etats: Record<string, EtatAncrage>;
  couleur: CouleurSurlignage;
  choisirCouleur: (c: CouleurSurlignage) => void;
  ajouter: (liste: Surlignage[]) => void;
  changerCouleur: (id: string, c: CouleurSurlignage) => void;
  supprimer: (id: string) => void;
  /** Rectangles recalculés sur la couche texte (passage retrouvé/déplacé). */
  appliquerRects: (id: string, rects: RectNorm[], empreinte: string) => void;
  /** Surlignages à dessiner sur une page (jamais un passage non vérifié). */
  visiblesSurPage: (page: number) => Surlignage[];
  textePage: (page: number) => TextePage | null;
  enregistrerTextePage: (page: number, items: readonly unknown[]) => void;
  /** Version des textes connus : change quand une page livre son texte. */
  versionTextes: number;
  enregistrerDocument: (doc: DocumentTexte | null) => void;
  /** Défilement vers une page (fourni par le canvas). */
  allerALaPage: (page: number) => void;
  enregistrerNavigation: (fn: ((page: number) => void) | null) => void;
};

const Contexte = createContext<ContexteSurlignages | null>(null);

/** `null` hors d'un lecteur de fiche : le canvas fonctionne alors sans surlignage. */
export function useSurlignagesOptionnel(): ContexteSurlignages | null {
  return useContext(Contexte);
}

const CLE_COULEUR = 'surlignage:couleur';
const DELAI_SAUVEGARDE_MS = 1200;
const DELAI_NOUVEL_ESSAI_MS = 8000;

function nouvelId(): string {
  // crypto.randomUUID manque aux Safari < 15.4 : repli sans dépendance.
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  } catch {
    /* repli ci-dessous */
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
export { nouvelId as nouvelIdSurlignage };

export function SurlignagesProvider({
  coursId,
  ficheId,
  children,
}: {
  coursId: string;
  ficheId: string;
  children: ReactNode;
}) {
  const url = `/api/fiches/${encodeURIComponent(coursId)}/surlignages?doc=${encodeURIComponent(ficheId)}`;
  const [surlignages, setSurlignages] = useState<Surlignage[]>([]);
  const [etats, setEtats] = useState<Record<string, EtatAncrage>>({});
  const [sauvegarde, setSauvegarde] = useState<EtatSauvegarde>('chargement');
  // Couleur préférée de l'élève (confort local, jamais indispensable). Lue au
  // premier rendu : elle n'apparaît qu'une fois la barre ouverte, après hydratation.
  const [couleur, setCouleur] = useState<CouleurSurlignage>(() => {
    try {
      const c = typeof window === 'undefined' ? null : window.localStorage.getItem(CLE_COULEUR);
      return estCouleur(c) ? c : COULEUR_PAR_DEFAUT;
    } catch {
      return COULEUR_PAR_DEFAUT;
    }
  });
  const [versionTextes, setVersionTextes] = useState(0);
  const [doc, setDoc] = useState<DocumentTexte | null>(null);

  const listeRef = useRef<Surlignage[]>([]);
  const textesRef = useRef(new Map<number, TextePage>());
  const navigationRef = useRef<((page: number) => void) | null>(null);
  const aSauverRef = useRef(false);
  const enCoursRef = useRef(false);
  const relancerRef = useRef(false);
  const minuterieRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reancreRef = useRef(false);
  const envoyerRef = useRef<(quitter?: boolean) => Promise<void>>(async () => {});

  const choisirCouleur = useCallback((c: CouleurSurlignage) => {
    setCouleur(c);
    try {
      window.localStorage.setItem(CLE_COULEUR, c);
    } catch {
      /* sans importance */
    }
  }, []);

  // ─── Sauvegarde ────────────────────────────────────────────────────────────

  const envoyer = useCallback(
    async (quitter = false) => {
      if (minuterieRef.current) {
        clearTimeout(minuterieRef.current);
        minuterieRef.current = null;
      }
      if (!aSauverRef.current) return;
      if (enCoursRef.current) {
        relancerRef.current = true;
        return;
      }
      aSauverRef.current = false;
      enCoursRef.current = true;
      setSauvegarde('enregistrement');
      const corps = JSON.stringify({ surlignages: listeRef.current });
      let ok = false;
      try {
        const res = await fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: corps,
          credentials: 'same-origin',
          // À la fermeture de l'onglet, `keepalive` laisse partir la requête
          // (limité à 64 Ko par le navigateur : au-delà, envoi ordinaire).
          keepalive: quitter && corps.length < 60_000,
        });
        ok = res.ok;
      } catch {
        ok = false;
      }
      enCoursRef.current = false;
      if (ok) {
        setSauvegarde(aSauverRef.current ? 'modifie' : 'enregistre');
      } else {
        aSauverRef.current = true;
        setSauvegarde('erreur');
        if (!quitter) {
          minuterieRef.current = setTimeout(() => void envoyerRef.current(), DELAI_NOUVEL_ESSAI_MS);
        }
      }
      if (relancerRef.current) {
        relancerRef.current = false;
        void envoyerRef.current(quitter);
      }
    },
    [url],
  );
  useEffect(() => {
    envoyerRef.current = envoyer;
  }, [envoyer]);

  const planifier = useCallback(() => {
    aSauverRef.current = true;
    setSauvegarde('modifie');
    if (minuterieRef.current) clearTimeout(minuterieRef.current);
    minuterieRef.current = setTimeout(() => void envoyer(), DELAI_SAUVEGARDE_MS);
  }, [envoyer]);

  const modifier = useCallback(
    (f: (l: Surlignage[]) => Surlignage[]) => {
      const suivante = f(listeRef.current);
      listeRef.current = suivante;
      setSurlignages(suivante);
      planifier();
    },
    [planifier],
  );

  // Onglet masqué / fermé, ou changement de fiche : on n'attend pas le débounce.
  useEffect(() => {
    const auMasquage = () => {
      if (document.visibilityState === 'hidden') void envoyer(true);
    };
    const aLaFermeture = () => void envoyer(true);
    document.addEventListener('visibilitychange', auMasquage);
    window.addEventListener('pagehide', aLaFermeture);
    return () => {
      document.removeEventListener('visibilitychange', auMasquage);
      window.removeEventListener('pagehide', aLaFermeture);
      void envoyer(true);
    };
  }, [envoyer]);

  // ─── Chargement ────────────────────────────────────────────────────────────

  useEffect(() => {
    let annule = false;
    (async () => {
      try {
        const res = await fetch(url, { credentials: 'same-origin', cache: 'no-store' });
        if (!res.ok) {
          // 401/403/404 : pas de surlignage possible ici ; 5xx : on n'active
          // PAS la création, sinon le prochain enregistrement écraserait les
          // surlignages existants qu'on n'a pas pu lire.
          if (!annule) setSauvegarde('indisponible');
          return;
        }
        const data = (await res.json()) as { surlignages?: Surlignage[] };
        if (annule) return;
        const liste = Array.isArray(data.surlignages) ? data.surlignages : [];
        listeRef.current = liste;
        setSurlignages(liste);
        setEtats(Object.fromEntries(liste.map((s) => [s.id, 'inconnu' as EtatAncrage])));
        setSauvegarde('pret');
      } catch {
        if (!annule) setSauvegarde('indisponible');
      }
    })();
    return () => {
      annule = true;
    };
  }, [url]);

  const actif = sauvegarde !== 'chargement' && sauvegarde !== 'indisponible';

  // ─── Réancrage sur la version affichée du PDF ──────────────────────────────
  // Une seule fois par ouverture, dès que le document ET les surlignages sont
  // là : texte de toutes les pages (léger, calculé par le worker pdf.js), puis
  // confrontation de chaque surlignage. Rien à faire sans surlignage.
  useEffect(() => {
    if (!doc || !actif || reancreRef.current) return;
    if (listeRef.current.length === 0) return;
    reancreRef.current = true;
    let annule = false;
    (async () => {
      const pages: (TextePage | null)[] = [];
      for (let n = 1; n <= doc.numPages; n++) {
        let tp = textesRef.current.get(n) ?? null;
        if (!tp) {
          try {
            const page = await doc.getPage(n);
            const contenu = await page.getTextContent();
            tp = construireTextePage(contenu.items);
            textesRef.current.set(n, tp);
          } catch {
            tp = null;
          }
        }
        if (annule) return;
        pages.push(tp);
      }
      const res = reancrer(listeRef.current, pages);
      setEtats((prec) => ({ ...prec, ...res.etats }));
      setVersionTextes((v) => v + 1);
      if (res.modifies) {
        // Seuls les surlignages retrouvés ailleurs changent ; une liste modifiée
        // entre-temps par l'élève est fusionnée par identifiant.
        const parId = new Map(res.surlignages.map((s) => [s.id, s]));
        modifier((l) => l.map((s) => parId.get(s.id) ?? s));
      }
    })();
    return () => {
      annule = true;
      reancreRef.current = false;
    };
  }, [doc, actif, modifier]);

  // ─── Mutations ─────────────────────────────────────────────────────────────

  const ajouter = useCallback(
    (nouveaux: Surlignage[]) => {
      if (!actif || nouveaux.length === 0) return;
      setEtats((prec) => ({ ...prec, ...Object.fromEntries(nouveaux.map((s) => [s.id, 'intact' as EtatAncrage])) }));
      modifier((l) => [...l, ...nouveaux]);
    },
    [actif, modifier],
  );

  const changerCouleur = useCallback(
    (id: string, c: CouleurSurlignage) => {
      if (!actif) return;
      modifier((l) => l.map((s) => (s.id === id ? { ...s, couleur: c } : s)));
    },
    [actif, modifier],
  );

  const supprimer = useCallback(
    (id: string) => {
      if (!actif) return;
      modifier((l) => l.filter((s) => s.id !== id));
    },
    [actif, modifier],
  );

  const appliquerRects = useCallback(
    (id: string, rects: RectNorm[], empreinte: string) => {
      if (!actif || rects.length === 0) return;
      setEtats((prec) => ({ ...prec, [id]: 'intact' }));
      modifier((l) => l.map((s) => (s.id === id ? { ...s, rects, empreinte } : s)));
    },
    [actif, modifier],
  );

  // ─── Textes de pages ───────────────────────────────────────────────────────

  const textePage = useCallback((page: number) => textesRef.current.get(page) ?? null, []);

  const enregistrerTextePage = useCallback((page: number, items: readonly unknown[]) => {
    textesRef.current.set(page, construireTextePage(items));
    setVersionTextes((v) => v + 1);
  }, []);

  const enregistrerDocument = useCallback((d: DocumentTexte | null) => {
    textesRef.current = new Map();
    setDoc(d);
  }, []);

  const visiblesSurPage = useCallback(
    (page: number) => {
      const tp = textesRef.current.get(page) ?? null;
      return surlignages.filter((s) => {
        if (s.page !== page || s.rects.length === 0) return false;
        const etat = etats[s.id];
        if (etat === 'intact') return true;
        if (etat === 'orphelin' || etat === 'a-redessiner') return false;
        // Réancrage pas encore terminé : on ne dessine d'emblée que si la page
        // a EXACTEMENT le texte du moment où le passage a été surligné.
        return !!tp && tp.empreinte === s.empreinte && citationEnPlace(s, tp.texte);
      });
    },
    // versionTextes : le texte d'une page vient d'arriver → réévaluer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [surlignages, etats, versionTextes],
  );

  const allerALaPage = useCallback((page: number) => navigationRef.current?.(page), []);
  const enregistrerNavigation = useCallback((fn: ((page: number) => void) | null) => {
    navigationRef.current = fn;
  }, []);

  const valeur = useMemo<ContexteSurlignages>(
    () => ({
      actif,
      sauvegarde,
      surlignages: trierSurlignages(surlignages),
      etats,
      couleur,
      choisirCouleur,
      ajouter,
      changerCouleur,
      supprimer,
      appliquerRects,
      visiblesSurPage,
      textePage,
      enregistrerTextePage,
      versionTextes,
      enregistrerDocument,
      allerALaPage,
      enregistrerNavigation,
    }),
    [
      actif, sauvegarde, surlignages, etats, couleur, choisirCouleur, ajouter, changerCouleur, supprimer,
      appliquerRects, visiblesSurPage, textePage, enregistrerTextePage, versionTextes, enregistrerDocument,
      allerALaPage, enregistrerNavigation,
    ],
  );

  return <Contexte.Provider value={valeur}>{children}</Contexte.Provider>;
}
