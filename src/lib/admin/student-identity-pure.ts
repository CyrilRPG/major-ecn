import { OFFER_LABEL, type Offer } from '@/types/domain';

/**
 * Identité d'un élève telle que l'équipe la voit à côté d'une question :
 * le pseudo automatique (« ibo-X-mnv ») ne permet pas de savoir qui écrit.
 * Données sérialisables, destinées aux composants client de l'espace staff.
 *
 * Module PUR (aucune lecture base) : importable côté client et testable —
 * cf. tests/questions-eleves-routage.test.ts. Le chargeur service-role vit
 * dans `student-identity.ts` (serveur seulement).
 */
export type StudentIdentity = {
  id: string;
  /** « Prénom NOM », ou un libellé neutre si le profil n'a pas de nom. */
  name: string;
  /** Adresse de l'élève : administrateurs SEULEMENT (cf. `identitePourLecteur`). */
  email: string | null;
  specialty: string | null;
  /** 'interne' | 'externe' | null */
  voie: string | null;
  /** Libellé de la formule (« Formule Intensive »). */
  offer: string | null;
  /** Fiche de l'élève dans l'espace admin, ou null si le lecteur n'y a pas accès. */
  href: string | null;
};

type RawScope = {
  offer?: string;
  paid_specialty?: string | null;
  paid_voie?: string | null;
  voie?: string | null;
} | null;

function isOffer(value: string | undefined): value is Offer {
  return value === 'decouverte' || value === 'essentiel' || value === 'intensif' || value === 'approfondi';
}

/** Libellé affiché quand le profil n'a ni prénom ni nom. */
export const ELEVE_SANS_NOM = 'Élève (nom non renseigné)';

/** Identité COMPLÈTE (vue administrateur) ; filtrer avec `identitePourLecteur` avant tout envoi à un collaborateur. */
export function identityFromProfile(p: {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  permission_scope: unknown;
}): StudentIdentity {
  const scope = (p.permission_scope ?? null) as RawScope;
  const name = [p.first_name, p.last_name].map((s) => (s ?? '').trim()).filter(Boolean).join(' ');
  const offer = scope?.offer;
  return {
    id: p.id,
    // Jamais l'adresse en guise de nom : elle fuirait vers les collaborateurs.
    name: name || ELEVE_SANS_NOM,
    email: p.email,
    specialty: scope?.paid_specialty?.trim() || null,
    voie: scope?.paid_voie ?? scope?.voie ?? null,
    offer: isOffer(offer) ? OFFER_LABEL[offer] : offer ?? null,
    href: `/admin/suivi/candidats/${p.id}`,
  };
}

/** Ligne de contexte pour un e-mail ou un journal : « Gériatrie · voie interne · Formule Intensive ». */
export function identityContext(s: Pick<StudentIdentity, 'specialty' | 'voie' | 'offer'>): string {
  return [s.specialty, s.voie ? `voie ${s.voie}` : null, s.offer].filter(Boolean).join(' · ');
}

/**
 * Qui lit ? Un administrateur, ou un collaborateur avec ou sans le module
 * « Suivi élèves ».
 */
export type LecteurIdentite = { admin: boolean; suivi: boolean };

/**
 * Identité d'un élève réduite à ce que CE lecteur a le droit de voir
 * (demande de Cyril, 25/09/2026 : « les professeurs voient le nom et le
 * prénom, le mail pas besoin ») :
 *  - administrateur : tout, lien vers la fiche candidat ;
 *  - collaborateur avec le module Suivi : pas d'e-mail, lien vers la fiche
 *    du tableau de travail (bornée à son périmètre) ;
 *  - autre collaborateur (enseignant) : nom, spécialité, voie, formule — ni
 *    e-mail ni lien.
 */
export function identitePourLecteur(s: StudentIdentity, lecteur: LecteurIdentite): StudentIdentity {
  if (lecteur.admin) return s;
  return {
    ...s,
    name: s.email && s.name.trim() === s.email ? ELEVE_SANS_NOM : s.name,
    email: null,
    href: lecteur.suivi ? `/admin/suivi/eleves/${s.id}` : null,
  };
}
