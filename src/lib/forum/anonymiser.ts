import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Nom affiché à la place de l'auteur d'un message du forum une fois son
 * compte supprimé (page publique /suppression-compte : « les questions et
 * réponses restent visibles pour les autres élèves, sans votre nom ni votre
 * pseudo »).
 */
export const AUTEUR_FORUM_SUPPRIME = 'Ancien élève';

/**
 * Anonymise les messages d'élève d'un compte AVANT sa suppression :
 *  - `forum_questions.student_pseudo` de ses questions ;
 *  - `forum_replies.author_name` de ses relances rédigées en tant qu'élève
 *    (les réponses d'un enseignant gardent sa signature).
 * Les clés étrangères passent ensuite à NULL par la cascade `ON DELETE SET
 * NULL` de `auth.users`. À appeler avec le client service-role : la RLS
 * n'ouvre pas la mise à jour des questions à leur auteur.
 *
 * Renvoie un message d'erreur, ou `null` si tout est anonymisé. En cas
 * d'erreur, l'appelant NE supprime PAS le compte : supprimer en laissant le
 * pseudo contredirait la promesse faite à l'élève.
 */
export async function anonymiserMessagesForum(
  admin: SupabaseClient,
  userId: string,
): Promise<string | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- tables du forum absentes des types générés
  const db = admin as any;
  const { error: qErr } = await db
    .from('forum_questions')
    .update({ student_pseudo: AUTEUR_FORUM_SUPPRIME })
    .eq('student_id', userId);
  if (qErr) return `Anonymisation des questions du forum impossible : ${qErr.message}`;
  const { error: rErr } = await db
    .from('forum_replies')
    .update({ author_name: AUTEUR_FORUM_SUPPRIME })
    .eq('author_id', userId)
    .eq('author_role', 'student');
  if (rErr) return `Anonymisation des réponses du forum impossible : ${rErr.message}`;
  return null;
}
