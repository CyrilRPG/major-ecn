import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { recueilParSlug } from '@/lib/data/annales-evc';
import {
  BUCKET_ANNALES,
  cheminRecueilAnnales,
  lireJetonTelechargementAnnales,
  nomFichierAnnales,
} from '@/lib/annales-evc/lien';

/**
 * Téléchargement d'un recueil d'annales EVC depuis le lien reçu par e-mail ou le
 * bouton affiché après le formulaire. Le jeton signé désigne une demande et un
 * recueil ; on redirige vers une URL signée Supabase de quelques minutes.
 */
export async function GET(req: Request) {
  const t = new URL(req.url).searchParams.get('t') ?? '';
  const charge = lireJetonTelechargementAnnales(t);
  const recueil = charge ? recueilParSlug(charge.slug) : undefined;
  if (!charge || !recueil) {
    return NextResponse.redirect(new URL('/annales-evc?lien=invalide', req.url), 303);
  }

  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from(BUCKET_ANNALES)
    .createSignedUrl(cheminRecueilAnnales(recueil.slug), 600, { download: nomFichierAnnales(recueil.slug) });
  if (error || !data?.signedUrl) {
    console.error('[annales-evc] URL signée impossible :', error?.message);
    return NextResponse.redirect(new URL('/annales-evc?lien=indisponible', req.url), 303);
  }

  // Compteur de téléchargements (sans bloquer la redirection)
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const a = admin as any;
    const { data: lead } = await a.from('annales_leads').select('download_count').eq('id', charge.lead).maybeSingle();
    if (lead) {
      await a.from('annales_leads')
        .update({ download_count: (lead.download_count ?? 0) + 1, last_download_at: new Date().toISOString() })
        .eq('id', charge.lead);
    }
  } catch {
    /* le téléchargement passe avant la statistique */
  }

  return NextResponse.redirect(data.signedUrl, 302);
}
