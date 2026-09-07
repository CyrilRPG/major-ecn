import { Mail } from 'lucide-react';
import { ArenaPage, Panel } from '@/components/arena/arena-shell';
import { ARENA, BODY, Container, DISPLAY, Eyebrow } from '@/components/arena/arena-ui';
import { ResendConfirmation } from '@/components/arena/resend-confirmation';
import { arenaMetadata, loadArenaPage } from '@/lib/arena/page-context';
import { siteUrl } from '@/lib/email/send';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ slug: string }>; searchParams: Promise<{ e?: string }> };

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const ctx = await loadArenaPage(slug);
  return arenaMetadata(ctx.snap, { title: 'Confirmez votre email', noindex: true });
}

/** Écran « confirmez votre email » (§3.2) : le compte est « non confirmé » tant que le lien n'est pas cliqué. */
export default async function ConfirmEmailPage({ params, searchParams }: Params) {
  const { slug } = await params;
  const { e } = await searchParams;
  const ctx = await loadArenaPage(slug);
  return (
    <ArenaPage nav={ctx.nav}>
      <Container className="max-w-xl py-14 sm:py-20">
        <Eyebrow>Inscription enregistrée</Eyebrow>
        <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl" style={{ fontFamily: DISPLAY, letterSpacing: '-0.04em' }}>Confirmez votre adresse email</h1>
        <Panel className="mt-8">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl" style={{ background: 'rgba(228,0,43,0.12)', color: ARENA.redSoft }}><Mail className="h-6 w-6" /></span>
            <div className="space-y-3 text-[15px] leading-relaxed" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
              <p>Un email vient d’être envoyé{e ? <> à <strong style={{ color: ARENA.text }}>{e}</strong></> : ''}. Cliquez sur le lien qu’il contient pour authentifier votre compte : tant que ce n’est pas fait, l’accès aux manches est bloqué.</p>
              <p>Cette confirmation vaut authentification du compte. Elle ne constitue pas un consentement à recevoir les informations de Major ECN, qui relève uniquement de la seconde case du formulaire.</p>
            </div>
          </div>
          {e && <div className="mt-6">{<ResendConfirmation slug={slug} email={e} />}</div>}
          <p className="mt-6 text-sm" style={{ color: ARENA.textSoft, fontFamily: BODY }}>En attendant, invitez un collègue : partagez la page du tournoi <span className="break-all font-bold" style={{ color: ARENA.text }}>{siteUrl()}/arena/{slug}</span>. Votre lien personnel d’invitation vous attend dans votre espace.</p>
        </Panel>
      </Container>
    </ArenaPage>
  );
}
