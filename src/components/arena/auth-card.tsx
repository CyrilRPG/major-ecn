import type { ReactNode } from 'react';
import { ArenaLogoStack } from './arena-logo';
import { ArenaNavigation } from './arena-navigation';
import { ArenaFooter } from './arena-shell';
import { Stadium } from './stadium';
import { ARENA, BODY, CAPS } from './tokens';

/**
 * Coque des pages d'accès sans tournoi dans l'URL (connexion, atterrissage
 * des liens de confirmation et de connexion, mot de passe oublié) : barre
 * haute commune, carte centrée sur l'arène, pied de page.
 */
export function AuthCard({ title, lead, children, wide = false, slug }: { title: string; lead?: ReactNode; children: ReactNode; wide?: boolean; slug?: string }) {
  return (
    <>
      <ArenaNavigation slug={slug} />
      <main className="flex-1">
        <Stadium photo="heroArena" darken={0.48} tint={0.1} gold={0.2} animate position="center 30%" className="flex min-h-[calc(100svh-4.5rem)] items-center py-12">
          <div className={`mx-auto w-full px-4 sm:px-6 ${wide ? 'max-w-3xl' : 'max-w-2xl'}`}>
            <div className="rounded-[1.6rem] p-5 text-center sm:p-10" style={{ background: 'rgba(11,15,20,0.92)', boxShadow: `inset 0 0 0 1px ${ARENA.lineStrong}, 0 50px 100px -40px rgba(0,0,0,0.95)`, backdropFilter: 'blur(10px)' }}>
              <ArenaLogoStack size="sm" />
              <h1 className="mt-6 text-[1.8rem] leading-tight sm:text-[2.2rem]" style={{ ...CAPS, color: ARENA.text }}>{title}</h1>
              {lead && <div className="mt-4 text-[15px] leading-relaxed" style={{ color: ARENA.textSoft, fontFamily: BODY }}>{lead}</div>}
              <div className="mt-7 space-y-4 text-left">{children}</div>
            </div>
          </div>
        </Stadium>
      </main>
      <ArenaFooter slug="" />
    </>
  );
}
