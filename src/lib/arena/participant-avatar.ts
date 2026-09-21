import { estAvatarPlanche } from '@/components/arena/avatars';
import { isPlatformAvatar } from '@/lib/avatar';
import { estAvatarCompose } from '@/lib/avatars/traits';

type AvatarParticipant = {
  email: string;
  faculte_id: string;
  avatar_seed: string;
  anonymized_at: string | null;
};

export type AvatarProfile = {
  email: string;
  faculte_id: string | null;
  avatar_seed: string | null;
};

const emailKey = (email: string) => email.trim().toLowerCase();

/**
 * Les anciennes graines Arena (« k3f9x2a1 ») dessinent un emblème procédural,
 * pas le portrait enregistré sur Major ECN. Pour ces comptes SEULEMENT, on
 * retrouve ce portrait.
 *
 * Un médaillon composé, comme un portrait de la planche, est un choix fait
 * DANS l'Arena : il reste l'identité du tournoi. Depuis le 21/09/2026 les deux
 * mondes sont cloisonnés — l'avatar du compte Major ECN ne s'y substitue plus.
 * Résolution commune aux pages personnelles et au classement, sans modifier la
 * base ni transmettre les données du profil pédagogique aux composants publics.
 */
export async function resolveParticipantAvatars<T extends AvatarParticipant>(
  participants: T[],
  loadProfiles: (emails: string[]) => Promise<AvatarProfile[]>,
): Promise<T[]> {
  const legacy = participants.filter(p =>
    p.faculte_id === 'major-ecn' && !p.anonymized_at
    && !estAvatarPlanche(p.avatar_seed)
    // Un médaillon composé est un choix fait DANS l'Arena : les deux mondes
    // sont cloisonnés, on n'y substitue jamais l'avatar du compte Major ECN.
    && !estAvatarCompose(p.avatar_seed),
  );
  const emails = [...new Set(legacy.flatMap(p => [p.email, emailKey(p.email)]).filter(Boolean))];
  if (!emails.length) return participants;

  const choices = new Map<string, Set<string>>();
  // Bornes sur la taille des URL PostgREST, même pour un grand classement.
  for (let from = 0; from < emails.length; from += 100) {
    const profiles = await loadProfiles(emails.slice(from, from + 100));
    for (const profile of profiles) {
      if (profile.faculte_id !== 'major-ecn' || !isPlatformAvatar(profile.avatar_seed)) continue;
      const key = emailKey(profile.email);
      const seeds = choices.get(key) ?? new Set<string>();
      seeds.add(profile.avatar_seed);
      choices.set(key, seeds);
    }
  }

  const legacySet = new Set(legacy);
  return participants.map(p => {
    if (!legacySet.has(p)) return p;
    const seeds = choices.get(emailKey(p.email));
    // Ne jamais inventer un choix si le profil manque ou est ambigu.
    if (seeds?.size !== 1) return p;
    return { ...p, avatar_seed: [...seeds][0] };
  });
}
