import { ArenaPage, Panel } from '@/components/arena/arena-shell';
import { AvatarDistinctions } from '@/components/arena/avatar-distinctions';
import { Container, Eyebrow } from '@/components/arena/arena-ui';
import { ARENA, BODY, CAPS, DISPLAY, TABULAR } from '@/components/arena/tokens';
import { effectiveBareme } from '@/lib/arena/db';
import { describeBareme } from '@/lib/arena/scoring';
import { arenaMetadata, loadArenaPage } from '@/lib/arena/page-context';
import { publicRules, WARNING_CONNECTION, WARNING_NATURE } from '@/lib/arena/texts';
import { qrpNs } from '@/lib/arena/types';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const ctx = await loadArenaPage(slug);
  return arenaMetadata(ctx.snap, { title: 'Règles' });
}

/** Règles publiques (§19), barème par manche (§6.12), seuil et départage expliqués (§7.1 — « Comment est calculé le classement ? »). */
export default async function RulesPage({ params }: Params) {
  const { slug } = await params;
  const ctx = await loadArenaPage(slug);
  const t = ctx.snap.tournament;
  return (
    <ArenaPage nav={ctx.nav} immersive>
      <Container className="ae-document max-w-3xl py-12 sm:py-16">
        <Eyebrow>Règles publiques</Eyebrow>
        <h1 className="mt-4 text-[2.4rem] leading-[0.95] sm:text-[3.4rem]" style={{ ...CAPS, color: ARENA.text }}>Les règles de l’arène.</h1>

        <ol className="mt-10 space-y-3">
          {publicRules(t).map((r: string, i: number) => (
            <li key={i} className="flex gap-4 text-[15px] leading-relaxed" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
              <span className="shrink-0 pt-0.5 text-sm" style={{ ...TABULAR, color: ARENA.redSoft }}>{(i + 1).toString().padStart(2, '0')}</span>
              <span>{r}</span>
            </li>
          ))}
        </ol>

        <h2 id="classement" className="mt-14 text-[1.7rem] leading-none" style={{ ...CAPS, color: ARENA.text }}>Comment est calculé le classement ?</h2>
        <div className="mt-4 space-y-3 text-[15px] leading-relaxed" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
          <p>Le score cumulé additionne vos scores de manche. Une manche non jouée compte pour zéro. Le rang s’affiche lorsque votre score cumulé atteint <strong style={{ color: ARENA.text }}>{t.threshold_pct.toLocaleString('fr-FR')} %</strong> du maximum cumulé des manches déjà publiées : ce droit est réévalué après chaque manche, dans les deux sens.</p>
          <p>Au classement général, il faut avoir disputé les <strong style={{ color: ARENA.text }}>trois manches</strong>. Les égalités sont départagées par le total de points, puis le nombre de réponses parfaites (score maximal prévu par le barème, sans règle indispensable ou inacceptable déclenchée), puis le temps moyen par manche, le plus faible l’emportant. Le temps moyen est le temps cumulé divisé par le nombre de manches disputées, arrondi à la seconde la plus proche.</p>
          <p>Le classement public, « Meilleurs scores », affiche la liste complète des participants ayant droit au rang, avec son effectif. Classement général établi sur les participants ayant disputé les trois manches.</p>
        </div>

        <h2 className="mt-14 text-[1.7rem] leading-none" style={{ ...CAPS, color: ARENA.text }}>Votre avatar et vos distinctions</h2>
        <div className="mt-4 space-y-3 text-[15px] leading-relaxed" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
          <p>Vous conservez le personnage choisi à l’inscription pendant toute l’Arena. Son apparence dépend exclusivement de votre rang au classement cumulé actuel : <strong>1er = Or / Prestige, 2e = Argent, 3e = Bronze, à partir de la 4e place = Standard</strong>. Avant votre premier classement ou si vous n’avez pas droit au rang, l’avatar reste Standard.</p>
          <p>L’habillage est réévalué après chaque publication, à la hausse comme à la baisse. Jouer une manche supplémentaire ne confère aucun niveau. Les participants à égalité parfaite partagent le même rang et le même habillage.</p>
          <p>Votre palmarès personnel conserve les positions obtenues à chaque publication, même si votre rang actuel baisse. Dans le classement public, seuls le rang, l’avatar, le pseudonyme et le score cumulé sont affichés. Votre identité réelle reste privée.</p>
        </div>

        <AvatarDistinctions seed={ctx.participant?.avatar_seed} />

        <h2 className="mt-14 text-[1.7rem] leading-none" style={{ ...CAPS, color: ARENA.text }}>Barème par manche</h2>
        <p className="mt-2 text-sm" style={{ color: ARENA.textMuted, fontFamily: BODY }}>Généré depuis le paramétrage de chaque manche. Le barème est verrouillé à l’ouverture de la manche.</p>
        <div className="mt-6 space-y-6">
          {ctx.snap.rounds.map((r) => {
            const b = effectiveBareme(t, r);
            const ns = qrpNs(ctx.snap.questionsByRound.get(r.id) ?? []);
            return (
              <Panel key={r.id}>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.2em]" style={{ color: ARENA.redSoft, fontFamily: BODY }}>Manche {r.number}{r.theme ? ` · ${r.theme}` : ''}{r.bareme_locked_at ? ' · barème verrouillé' : ''}</p>
                <div className="mt-4 grid gap-6 md:grid-cols-3">
                  {(['QRM', 'QRU', 'QRP'] as const).map((k) => {
                    const d = describeBareme(k, b, ns);
                    return (
                      <div key={k}>
                        <p className="text-lg font-extrabold" style={{ fontFamily: DISPLAY }}>{k} <span className="text-xs font-bold" style={{ color: ARENA.textMuted, fontFamily: BODY }}>{d.title}</span></p>
                        <dl className="mt-2">
                          {d.lines.map((l) => (
                            <div key={l.situation} className="flex justify-between gap-3 py-1.5 text-[13px]" style={{ borderTop: `1px solid ${ARENA.line}`, fontFamily: BODY }}>
                              <dt style={{ color: ARENA.textSoft }}>{l.situation}</dt>
                              <dd className="shrink-0" style={{ ...TABULAR, color: ARENA.text }}>{l.points}</dd>
                            </div>
                          ))}
                        </dl>
                        {d.notes.map((n) => <p key={n} className="mt-2 text-xs" style={{ color: ARENA.textMuted, fontFamily: BODY }}>{n}</p>)}
                      </div>
                    );
                  })}
                </div>
              </Panel>
            );
          })}
        </div>

        <h2 className="mt-14 text-[1.7rem] leading-none" style={{ ...CAPS, color: ARENA.text }}>Avertissements</h2>
        <div className="mt-4 space-y-3 text-[15px] leading-relaxed" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
          <p>{WARNING_NATURE}</p>
          <p>{WARNING_CONNECTION}</p>
        </div>
      </Container>
    </ArenaPage>
  );
}
