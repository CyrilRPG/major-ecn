import 'server-only';
import { randomUUID } from 'node:crypto';
import { inflateSync } from 'node:zlib';
import { FAST_MODEL } from '@/lib/ai/anthropic';
import { analyserCoordonnees } from '../coordonnees';
import { EXTENSIONS, formatAccepte, nomAffiche, pdfDangereux, texteDuFluxPdf, typeReel } from '../fichiers-regles';
import type { ErreurEchanges, PieceJointeDTO } from '../types';
import type { AccesGroupe, Acteur } from './acces';
import { db, journaliser, parametres } from './base';
import { controlerTexte } from './messages';

/**
 * Pièces jointes (CDC §69-70, §99, R59).
 *
 *  1. `demanderEnvoi` : contrôles (droits, format, taille, quota), ligne en
 *     base, URL de téléversement SIGNÉE vers le seau privé « echanges » — le
 *     fichier ne transite jamais par une fonction serveur (plafond 4,5 Mo).
 *     Le chemin de stockage est aléatoire : aucun nom de personne, aucun
 *     identifiant de groupe devinable.
 *  2. `valider` : relit le fichier, vérifie la taille et le type RÉEL (octets
 *     de tête), refuse un PDF à contenu actif, cherche des coordonnées (texte
 *     du PDF, image analysée) ; sinon le fichier est prêt à être joint.
 *  3. `urlTelechargement` : accès revérifié à chaque fois (même une URL
 *     récupérée dans une ancienne session ne suffit pas), URL signée de 60 s.
 */

const SEAU = 'echanges';

export async function demanderEnvoi(acteur: Acteur, acces: AccesGroupe, f: { nom: string; mime: string; taille: number; legende?: string | null }):
  Promise<{ id: string; chemin: string; jeton: string } | ErreurEchanges> {
  const prm = await parametres();
  const peut = acces.droits.joindre || acces.droits.publierAnnonce;
  if (!peut) return { error: acces.droits.motif ?? 'Vous ne pouvez pas joindre de fichier ici.', code: 'DROITS' };
  const mime = (f.mime || '').toLowerCase();
  if (!formatAccepte(f.nom || '', mime, prm.formats_autorises)) {
    const formats = prm.formats_autorises.map((m) => EXTENSIONS[m]?.[0]?.toUpperCase()).filter(Boolean).join(', ');
    return { error: `Format non autorisé. Formats acceptés : ${formats}.`, code: 'INVALIDE' };
  }
  if (!Number.isFinite(f.taille) || f.taille <= 0) return { error: 'Fichier vide.', code: 'INVALIDE' };
  if (f.taille > prm.taille_max_mo * 1024 * 1024) return { error: `Fichier trop lourd (${prm.taille_max_mo} Mo au maximum).`, code: 'INVALIDE' };
  if (acces.role === 'candidat') {
    const { count } = await db().from('echanges_pieces_jointes').select('id', { count: 'exact', head: true })
      .eq('uploader_id', acteur.id).gte('created_at', new Date(Date.now() - 3_600_000).toISOString());
    if ((count ?? 0) >= prm.limite_pj_heure) return { error: 'Trop de fichiers envoyés cette heure-ci. Réessayez plus tard.', code: 'QUOTA' };
  }
  const legende = (f.legende ?? '').trim().slice(0, 300) || null;
  let statutLegende: 'ok' | 'moderation' = 'ok';
  if (legende) {
    const c = await controlerTexte(legende, { userId: acteur.id, groupeId: acces.groupe.id, source: 'legende', exempte: acces.role === 'equipe' });
    if (c.action === 'bloquer') return c.erreur;
    if (c.action === 'moderation') statutLegende = 'moderation';
  }
  const ext = EXTENSIONS[mime][0];
  const chemin = `${randomUUID()}/${randomUUID()}.${ext}`;
  const generique = acces.role !== 'candidat';
  const { count: rang } = generique
    ? await db().from('echanges_pieces_jointes').select('id', { count: 'exact', head: true }).eq('uploader_id', acteur.id)
    : { count: 0 };
  const { data, error } = await db().from('echanges_pieces_jointes').insert({
    groupe_id: acces.groupe.id, uploader_id: acteur.id, chemin,
    nom: nomAffiche(f.nom, mime, generique, (rang ?? 0) + 1), mime, taille: f.taille, legende,
    statut: 'en_attente_envoi', verification: statutLegende === 'moderation' ? { legende: 'moderation' } : null,
  }).select('id').single();
  if (error || !data) return { error: 'Préparation de l’envoi impossible.', code: 'INVALIDE' };
  const { data: signe, error: se } = await db().storage.from(SEAU).createSignedUploadUrl(chemin);
  if (se || !signe) {
    await journaliser('erreur', 'fichier', 'URL de téléversement non émise', { erreur: se?.message });
    return { error: 'Le service de fichiers est indisponible. Réessayez.', code: 'INVALIDE' };
  }
  return { id: data.id, chemin, jeton: signe.token };
}

/** Texte lisible d'un PDF : flux décompressés (FlateDecode) + texte brut. */
function lirePdf(octets: Buffer): { brut: string; texte: string } {
  const brut = octets.toString('latin1');
  const morceaux: string[] = [brut];
  const re = /stream\r?\n/g;
  let m: RegExpExecArray | null;
  let n = 0;
  while ((m = re.exec(brut)) && n < 400) {
    const debut = m.index + m[0].length;
    const fin = brut.indexOf('endstream', debut);
    if (fin < 0) break;
    n += 1;
    try {
      morceaux.push(inflateSync(octets.subarray(debut, fin)).toString('latin1'));
    } catch { /* flux non compressé ou autre filtre */ }
    re.lastIndex = fin;
  }
  const tout = morceaux.join('\n');
  return { brut: tout, texte: texteDuFluxPdf(tout) };
}

/** Analyse d'image (R59) : coordonnées visibles ? Échec d'analyse → validation par l'équipe. */
async function imageAvecCoordonnees(octets: Buffer, mime: string): Promise<{ detecte: boolean; certain: boolean; details: string }> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key || octets.length > 4_500_000 || !['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(mime)) {
    return { detecte: false, certain: false, details: key ? 'Image trop lourde pour l’analyse' : 'Analyse indisponible' };
  }
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal: AbortSignal.timeout(20_000),
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: FAST_MODEL,
        max_tokens: 200,
        system: 'Tu contrôles des images publiées dans une messagerie d’étudiants en médecine. Réponds UNIQUEMENT par un objet JSON {"coordonnees": true|false, "details": "..."}. "coordonnees" vaut true si l’image montre des coordonnées personnelles permettant de contacter quelqu’un hors de la plateforme : numéro de téléphone, adresse e-mail, pseudonyme ou compte de réseau social / messagerie (Snapchat, Instagram, WhatsApp, Telegram, Discord…), QR code de contact ou d’invitation à un groupe. Les valeurs médicales, numéros d’items, résultats biologiques et mentions de Major ECN ne sont PAS des coordonnées.',
        messages: [{ role: 'user', content: [
          { type: 'image', source: { type: 'base64', media_type: mime, data: octets.toString('base64') } },
          { type: 'text', text: 'Cette image contient-elle des coordonnées personnelles ?' },
        ] }],
      }),
    });
    if (!res.ok) return { detecte: false, certain: false, details: `Analyse indisponible (${res.status})` };
    const j = (await res.json()) as { content?: { type: string; text?: string }[] };
    const txt = j.content?.find((c) => c.type === 'text')?.text ?? '';
    const obj = JSON.parse(/\{[\s\S]*\}/.exec(txt)?.[0] ?? '{}') as { coordonnees?: boolean; details?: string };
    if (typeof obj.coordonnees !== 'boolean') return { detecte: false, certain: false, details: 'Réponse d’analyse illisible' };
    return { detecte: obj.coordonnees, certain: true, details: String(obj.details ?? '').slice(0, 300) };
  } catch (e) {
    return { detecte: false, certain: false, details: `Analyse impossible : ${String(e).slice(0, 120)}` };
  }
}

export async function valider(acteur: Acteur, acces: AccesGroupe, id: string): Promise<{ piece: PieceJointeDTO } | ErreurEchanges> {
  const prm = await parametres();
  const { data: pj } = await db().from('echanges_pieces_jointes').select('id, groupe_id, uploader_id, chemin, nom, mime, taille, legende, statut, verification').eq('id', id).maybeSingle();
  if (!pj || pj.uploader_id !== acteur.id || pj.groupe_id !== acces.groupe.id) return { error: 'Fichier introuvable.', code: 'INTROUVABLE' };
  if (pj.statut === 'pret' || pj.statut === 'en_moderation') return { piece: dto(pj) };
  if (pj.statut !== 'en_attente_envoi') return { error: 'Ce fichier a été refusé.', code: 'BLOQUE' };

  const refuser = async (motif: string, journal = true) => {
    await db().storage.from(SEAU).remove([pj.chemin]);
    await db().from('echanges_pieces_jointes').update({ statut: 'bloque', verification: { motif } }).eq('id', id);
    await db().from('echanges_blocages').insert({ user_id: acteur.id, groupe_id: acces.groupe.id, type: 'piece_jointe', source: pj.mime === 'application/pdf' ? 'document' : 'image', extrait: pj.nom, motifs: [motif] });
    if (journal) await journaliser('alerte', 'fichier', `Pièce jointe refusée : ${motif}`, { pj: id });
    return { error: `Fichier refusé : ${motif}.`, code: 'BLOQUE' as const };
  };

  const { data: blob, error } = await db().storage.from(SEAU).download(pj.chemin);
  if (error || !blob) return { error: 'Le fichier n’a pas été reçu. Réessayez l’envoi.', code: 'INVALIDE' };
  const octets = Buffer.from(await blob.arrayBuffer());
  if (octets.length === 0) return refuser('fichier vide', false);
  if (octets.length > prm.taille_max_mo * 1024 * 1024) return refuser(`plus de ${prm.taille_max_mo} Mo`, false);
  const reel = typeReel(octets.subarray(0, 1024));
  if (!reel || reel !== pj.mime) return refuser('le contenu ne correspond pas au format annoncé');

  const verification: Record<string, unknown> = { ...(pj.verification ?? {}), taille_reelle: octets.length, type_reel: reel };
  let enModeration = (pj.verification as { legende?: string } | null)?.legende === 'moderation';
  const exempte = acces.role === 'equipe';

  if (reel === 'application/pdf') {
    const { brut, texte } = lirePdf(octets);
    const danger = pdfDangereux(brut);
    if (danger) return refuser(`document contenant du contenu actif (${danger})`);
    if (!exempte && prm.coordonnees_blocage_actif) {
      const a = analyserCoordonnees(texte, { domainesAutorises: prm.coordonnees_domaines_autorises });
      if (a.bloquant) { enModeration = true; verification.coordonnees = a.motifs.slice(0, 5); }
    }
  } else if (!exempte && prm.coordonnees_blocage_actif && prm.coordonnees_images_analyse) {
    const r = await imageAvecCoordonnees(octets, reel);
    verification.analyse_image = r;
    if (r.detecte || !r.certain) enModeration = true;
  }

  const statut = enModeration ? 'en_moderation' : 'pret';
  await db().from('echanges_pieces_jointes').update({ statut, taille: octets.length, verification }).eq('id', id);
  return { piece: dto({ ...pj, statut, taille: octets.length }) };
}

function dto(pj: { id: string; nom: string; mime: string | null; taille: number | null; legende: string | null; statut: string }): PieceJointeDTO {
  return { id: pj.id, nom: pj.nom, mime: pj.mime, taille: pj.taille, legende: pj.legende, estImage: !!pj.mime?.startsWith('image/'), enModeration: pj.statut === 'en_moderation' };
}

/**
 * Lien de téléchargement : l'accès au GROUPE est revérifié, et le message
 * doit être visible de la personne (ou c'est son propre envoi, ou elle
 * modère). URL signée valable 60 secondes.
 */
export async function urlTelechargement(acteur: Acteur, acces: AccesGroupe | null, id: string, telecharger: boolean): Promise<string | null> {
  if (!acces || !acces.droits.lire) return null;
  const { data: pj } = await db().from('echanges_pieces_jointes').select('id, groupe_id, message_id, uploader_id, chemin, nom, statut, supprime_at, purge_at').eq('id', id).maybeSingle();
  if (!pj || pj.groupe_id !== acces.groupe.id || pj.purge_at || pj.statut === 'bloque') return null;
  const moderateur = acces.droits.moderer;
  if (pj.supprime_at && !moderateur) return null;
  if (pj.uploader_id !== acteur.id && !moderateur) {
    if (!pj.message_id || pj.statut !== 'attache') return null;
    const { data: m } = await db().from('echanges_messages').select('statut, supprime_at').eq('id', pj.message_id).maybeSingle();
    if (!m || m.supprime_at || m.statut !== 'publie') return null;
  }
  const { data, error } = await db().storage.from(SEAU).createSignedUrl(pj.chemin, 60, telecharger ? { download: pj.nom } : undefined);
  if (error || !data) {
    await journaliser('erreur', 'fichier', 'URL de lecture non émise', { pj: id, erreur: error?.message });
    return null;
  }
  return data.signedUrl;
}

/** Accès administratif à une pièce jointe d'un message supprimé (Modération → Messages supprimés). */
export async function urlAdministrative(id: string): Promise<string | null> {
  const { data: pj } = await db().from('echanges_pieces_jointes').select('chemin, nom, purge_at').eq('id', id).maybeSingle();
  if (!pj || pj.purge_at) return null;
  const { data } = await db().storage.from(SEAU).createSignedUrl(pj.chemin, 60, { download: pj.nom });
  return data?.signedUrl ?? null;
}

export async function effacerDuStockage(chemins: string[]): Promise<number> {
  let n = 0;
  for (let i = 0; i < chemins.length; i += 100) {
    const { data } = await db().storage.from(SEAU).remove(chemins.slice(i, i + 100));
    n += (data ?? []).length;
  }
  return n;
}
