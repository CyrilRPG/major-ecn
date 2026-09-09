import Link from 'next/link';
import { Mail } from 'lucide-react';
import { ArenaLogoStack } from '@/components/arena/arena-logo';
import { ArenaPage } from '@/components/arena/arena-shell';
import { Container } from '@/components/arena/arena-ui';
import { ResendConfirmation } from '@/components/arena/resend-confirmation';
import { Stadium } from '@/components/arena/stadium';
import { ARENA, BODY, CAPS } from '@/components/arena/tokens';
import { arenaMetadata, loadArenaPage } from '@/lib/arena/page-context';
import { siteUrl } from '@/lib/email/send';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ slug: string }>; searchParams: Promise<{ e?: string; deja?: string }> };

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const ctx = await loadArenaPage(slug);
  return arenaMetadata(ctx.snap, { title: 'Confirmez votre email', noindex: true });
}

/** Écran « confirmez votre email » (§3.2) : le compte est « non confirmé » tant que le lien n'est pas cliqué. */
export default async function ConfirmEmailPage({ params, searchParams }: Params) {
  const { slug } = await params;
  const { e, deja } = await searchParams;
  const ctx = await loadArenaPage(slug);
  return (
    <ArenaPage nav={ctx.nav}>
      <Stadium photo="heroArena" darken={0.48} tint={0.1} gold={0.2} animate position="center 30%" className="py-12 sm:py-20">
        <Container className="max-w-3xl">
          <div className="rounded-[1.6rem] p-6 text-center sm:p-9" style={{ background: 'rgba(11,15,20,0.88)', boxShadow: `inset 0 0 0 1px ${ARENA.lineStrong}, 0 50px 100px -40px rgba(0,0,0,0.95)`, backdropFilter: 'blur(10px)' }}>
            <ArenaLogoStack size="sm" />
            <span className="mx-auto mt-6 flex h-14 w-14 items-center justify-center rounded-full" style={{ background: 'rgba(228,0,43,0.14)', color: ARENA.redSoft, boxShadow: 'inset 0 0 0 1.5px rgba(228,0,43,0.5)' }}><Mail className="h-6 w-6" /></span>
            <p className="mt-4 text-[11px]" style={{ ...CAPS, color: ARENA.redSoft, letterSpacing: '0.26em' }}>Inscription enregistrée</p>
            <h1 className="mt-2 text-[1.9rem] leading-none sm:text-[2.4rem]" style={{ ...CAPS, color: ARENA.text }}>Confirmez votre adresse email</h1>
            <div className="mt-5 space-y-3 text-left text-[14.5px] leading-relaxed" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
              {deja === '1' && <p style={{ color: ARENA.text }}><strong>Cette adresse est déjà enregistrée.</strong> Il reste à la confirmer pour accéder à votre espace.</p>}
              <p>Consultez votre messagerie{e ? <> : <strong className="break-words [overflow-wrap:anywhere]" style={{ color: ARENA.text }}>{e}</strong></> : ''}. Dans l’email EVC Arena, cliquez sur « Confirmer mon adresse ». Pensez aussi aux courriers indésirables.</p>
              <p>Cette confirmation vaut authentification du compte. Elle ne constitue pas un consentement à recevoir les informations de Major ECN, qui relève uniquement de la seconde case du formulaire.</p>
            </div>
            {e && <div className="mt-6 text-left"><ResendConfirmation slug={slug} email={e} /></div>}
            <p className="mt-4 text-[12.5px]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>Mauvaise adresse ? <Link href={`/arena/${slug}/inscription`} className="font-semibold underline-offset-4 hover:underline" style={{ color: ARENA.redSoft }}>Recommencer l’inscription</Link> avec la bonne.</p>
            <p className="mt-6 text-[13px]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>En attendant, invitez un collègue : partagez la page du tournoi <span className="break-all font-semibold" style={{ color: ARENA.text }}>{siteUrl()}/arena/{slug}</span>. Votre lien personnel d’invitation vous attend dans votre espace.</p>
          </div>
        </Container>
      </Stadium>
    </ArenaPage>
  );
}
