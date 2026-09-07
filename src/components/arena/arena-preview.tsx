'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Share2 } from 'lucide-react';
import { ArenaBackdrop } from './arena-backdrop';
import { MatchDemo } from './match-demo';
import { Leaderboard } from './leaderboard';
import {
  ARENA, ArenaButton, BODY, Container, DISPLAY, Eyebrow, Rise, SectionHead, TABULAR,
} from './arena-ui';

/* ============================================================
   EVC Arena — page mère (maquette). Première édition : médecine
   interne, M1 20/09, M2 25/09, M3 28/09 (§17). Les dates sont des
   données : elles deviendront paramétrables en administration.
   ============================================================ */

/** Ouverture de M1 : 20 septembre 2026, 09h00 heure de Paris (UTC+2). */
const M1_OPEN = new Date('2026-09-20T07:00:00Z');

const MANCHES = [
  { n: 1, date: '20 sept.', theme: 'Vascularites et maladies systémiques', state: 'À venir' },
  { n: 2, date: '25 sept.', theme: 'Thème annoncé après M1', state: 'À venir' },
  { n: 3, date: '28 sept.', theme: 'Thème annoncé après M2', state: 'À venir' },
];

const FORMAT = [
  { value: '3', label: 'manches', detail: 'Dates fixées par édition, chaque manche ouverte 24 h.' },
  { value: '12', label: 'questions', detail: 'QRM, QRU et QRP, une question par écran.' },
  { value: '12', label: 'minutes', detail: 'Chronomètre côté serveur, aucun retour en arrière.' },
  { value: '1', label: 'tentative', detail: 'Par manche. Deux manches suffisent pour figurer au classement final.' },
];

const RULES = [
  'Trois manches, dates annoncées à l’avance. Chaque manche ouverte 24 h.',
  '12 questions, 12 minutes, une seule tentative. Thème et barème annoncés à l’avance.',
  'Corrections après clôture. Classement cumulatif, provisoire après M1 et M2, final après M3.',
  'Au moins deux manches pour figurer au classement final.',
  'Inscription possible en cours de tournoi, y compris pendant une manche ouverte : le temps est alors limité au temps restant avant la clôture.',
  'Égalité départagée par points, puis réponses parfaites, puis temps moyen par manche.',
  'Sous 50 % de score cumulé, aucun rang affiché et aucune apparition dans les Meilleurs scores ; le seuil est réévalué après chaque manche.',
  'Aucun effectif total affiché. EVC Arena est un entraînement ludique, pas un concours blanc.',
];

const BAREME_QRM = [
  ['0 discordance', '1 point'],
  ['1 discordance', '0,5 point'],
  ['2 discordances', '0,2 point'],
  ['3 ou plus', '0 point'],
];

export function ArenaPreview() {
  return (
    <>
      <TopBar />
      <Hero />
      <FormatSection />
      <MatchSection />
      <BaremeSection />
      <ScoresSection />
      <RulesSection />
      <FinalCta />
      <Footer />
    </>
  );
}

/* ---------------------------------------------------------------- */

function Wordmark({ small }: { small?: boolean }) {
  return (
    <span className="inline-flex items-baseline gap-2" style={{ fontFamily: DISPLAY }}>
      <span className={`${small ? 'text-[15px]' : 'text-lg'} font-extrabold tracking-[-0.02em]`}>EVC</span>
      <span className={`${small ? 'text-[15px]' : 'text-lg'} font-extrabold uppercase tracking-[0.22em]`} style={{ color: ARENA.redSoft }}>
        Arena
      </span>
    </span>
  );
}

function TopBar() {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <Container className="flex h-[4.5rem] items-center justify-between">
        <Link href="/" className="flex items-center gap-3" aria-label="Major ECN — accueil">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white p-1.5">
            <Image src="/major-ecn-logo.png" alt="Major ECN" width={64} height={64} className="h-full w-full object-contain" priority />
          </span>
          <span className="hidden h-6 w-px sm:block" style={{ background: ARENA.lineStrong }} />
          <span className="hidden sm:inline-flex"><Wordmark small /></span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="hidden text-xs font-bold uppercase tracking-[0.16em] md:block" style={{ color: ARENA.textMuted, fontFamily: BODY }}>
            Édition 1 · Médecine interne
          </span>
          <ArenaButton className="!px-5 !py-2.5 !text-[13px]">S’inscrire</ArenaButton>
        </div>
      </Container>
    </header>
  );
}

/* ---------------------------------------------------------------- */

function useCountdown(target: Date) {
  const [now, setNow] = useState<number | null>(null);
  // Premier tick différé : l'heure du client n'est connue qu'après l'hydratation.
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, 1000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, []);
  if (now === null) return null;
  const diff = Math.max(0, Math.floor((target.getTime() - now) / 1000));
  return {
    d: Math.floor(diff / 86400),
    h: Math.floor((diff % 86400) / 3600),
    m: Math.floor((diff % 3600) / 60),
    s: diff % 60,
  };
}

function localOpening(target: Date): string | null {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz === 'Europe/Paris') return null;
    return new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: tz }).format(target).replace(':', 'h');
  } catch {
    return null;
  }
}

function Hero() {
  const cd = useCountdown(M1_OPEN);
  // Heure locale dérivée du premier tick (null côté serveur → pas de décalage d'hydratation).
  const local = cd ? localOpening(M1_OPEN) : null;
  const cell = (v: number | undefined) => (v === undefined ? '--' : v.toString().padStart(2, '0'));

  return (
    <section className="relative isolate overflow-hidden pt-[4.5rem]">
      <ArenaBackdrop className="pointer-events-none absolute inset-0 -z-10 h-full w-full" />
      {/* Vignettage : fond sombre garanti sur les bords pour la lisibilité */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: `radial-gradient(ellipse 80% 70% at 50% 40%, transparent 30%, ${ARENA.bg} 95%), linear-gradient(180deg, transparent 70%, ${ARENA.bg} 100%)` }}
      />

      <Container className="pb-16 pt-14 sm:pb-24 sm:pt-20 lg:pt-24">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Eyebrow>Tournoi de QCM · Médecine interne · Septembre 2026</Eyebrow>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
            className="mt-6 text-[clamp(3.6rem,15vw,10rem)] font-extrabold leading-[0.9]"
            style={{ fontFamily: DISPLAY, letterSpacing: '-0.05em' }}
          >
            EVC
            <span
              className="block bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(100deg, ${ARENA.redSoft} 0%, ${ARENA.red} 50%, #FF6A3D 100%)` }}
            >
              ARENA
            </span>
          </motion.h1>

          {/* Ligne de départ */}
          <motion.div
            aria-hidden
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
            className="mx-auto mt-8 h-[3px] w-40 origin-center rounded-full sm:w-56"
            style={{ background: ARENA.red, boxShadow: '0 0 24px rgba(228,0,43,0.9)' }}
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mx-auto mt-8 max-w-2xl text-[1.15rem] font-bold leading-snug sm:text-[1.5rem]"
            style={{ fontFamily: DISPLAY, letterSpacing: '-0.02em', color: ARENA.text }}
          >
            Trois manches. Douze questions. Douze minutes.
            <span className="block" style={{ color: ARENA.textSoft }}>Une seule tentative — et un classement à défendre.</span>
          </motion.p>

          {/* Compte à rebours avant M1 — en temps restant (§5.1), heure de Paris rappelée */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
            className="mx-auto mt-10 inline-block rounded-2xl px-5 py-5 sm:px-8"
            style={{ background: 'rgba(6,10,20,0.55)', backdropFilter: 'blur(10px)', boxShadow: `inset 0 0 0 1px ${ARENA.lineStrong}` }}
          >
            <p className="text-[11px] font-extrabold uppercase tracking-[0.22em]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>
              La manche 1 ouvre dans
            </p>
            <div className="mt-3 flex items-end justify-center gap-3 sm:gap-5">
              {[
                ['j', cd?.d],
                ['h', cd?.h],
                ['min', cd?.m],
                ['s', cd?.s],
              ].map(([u, v], i) => (
                <div key={u as string} className="flex items-end gap-3 sm:gap-5">
                  {i > 0 && <span aria-hidden className="pb-3 text-2xl sm:text-4xl" style={{ color: ARENA.textMuted }}>:</span>}
                  <div className="text-center">
                    <span className="block text-[2.4rem] leading-none sm:text-6xl" style={{ ...TABULAR, fontWeight: 500 }}>
                      {cell(v as number | undefined)}
                    </span>
                    <span className="mt-1.5 block text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>
                      {u}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
              Ouverture le 20 septembre à 09h00 (heure de Paris){local ? ` — soit ${local} chez vous` : ''}.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <ArenaButton className="w-full sm:w-auto">
              S’inscrire au tournoi <ArrowRight className="h-4 w-4" />
            </ArenaButton>
            <ArenaButton variant="ghost" className="w-full sm:w-auto">
              <Share2 className="h-4 w-4" /> Inviter un collègue
            </ArenaButton>
          </motion.div>
          <p className="mt-4 text-xs" style={{ color: ARENA.textMuted, fontFamily: BODY }}>
            Inscription ouverte pendant toute la durée du tournoi · pseudonyme public, identité privée · aucune dotation
          </p>
        </div>

        {/* Piste des manches */}
        <div className="mt-16 grid gap-3 sm:mt-20 sm:grid-cols-3">
          {MANCHES.map((m, i) => (
            <motion.div
              key={m.n}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 + i * 0.1 }}
              className="relative overflow-hidden rounded-2xl p-5"
              style={{
                background: i === 0 ? 'rgba(228,0,43,0.10)' : 'rgba(12,19,34,0.75)',
                boxShadow: `inset 0 0 0 1px ${i === 0 ? 'rgba(228,0,43,0.45)' : ARENA.line}`,
                backdropFilter: 'blur(8px)',
              }}
            >
              <div className="flex items-start justify-between">
                <span className="text-5xl leading-none" style={{ ...TABULAR, color: i === 0 ? ARENA.redSoft : ARENA.textMuted, fontWeight: 500 }}>
                  M{m.n}
                </span>
                <span
                  className="rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em]"
                  style={{ background: 'rgba(255,255,255,0.06)', color: ARENA.textSoft, fontFamily: BODY }}
                >
                  {m.state}
                </span>
              </div>
              <p className="mt-4 text-[15px] font-extrabold" style={{ fontFamily: DISPLAY, letterSpacing: '-0.01em' }}>
                {m.date} · 09h00 → 09h00
              </p>
              <p className="mt-1 text-[13px]" style={{ color: ARENA.textSoft, fontFamily: BODY }}>{m.theme}</p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ---------------------------------------------------------------- */

function FormatSection() {
  return (
    <section className="py-16 sm:py-24" style={{ borderTop: `1px solid ${ARENA.line}` }}>
      <Container>
        <Rise>
          <SectionHead
            eyebrow="Le format"
            title="Court, exigeant, sans rattrapage."
            lead="Une parenthèse compétitive de douze minutes, pensée pour des médecins seniors : le barème est annoncé, le temps est compté, chaque validation est définitive."
          />
        </Rise>
        <div className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-2xl lg:grid-cols-4" style={{ background: ARENA.line }}>
          {FORMAT.map((f, i) => (
            <Rise key={f.label} delay={i * 0.06}>
              <div className="h-full p-6 sm:p-8" style={{ background: ARENA.surface }}>
                <p className="text-[4rem] leading-none sm:text-[5.5rem]" style={{ ...TABULAR, fontWeight: 500, color: ARENA.text }}>
                  {f.value}
                </p>
                <p className="mt-2 text-sm font-extrabold uppercase tracking-[0.16em]" style={{ color: ARENA.redSoft, fontFamily: BODY }}>
                  {f.label}
                </p>
                <p className="mt-3 text-[13px] leading-relaxed" style={{ color: ARENA.textSoft, fontFamily: BODY }}>{f.detail}</p>
              </div>
            </Rise>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ---------------------------------------------------------------- */

function MatchSection() {
  return (
    <section className="py-16 sm:py-24" style={{ borderTop: `1px solid ${ARENA.line}` }}>
      <Container>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start lg:gap-14">
          <Rise className="lg:sticky lg:top-10">
            <SectionHead
              eyebrow="Une manche, en conditions réelles"
              title="Le timer est le seul juge."
              lead="Essayez l’interface de manche : trois questions d’illustration, chronomètre réel, validation irréversible et score calculé avec le barème CNG. Rien n’est enregistré."
            />
            <ul className="mt-8 space-y-4">
              {[
                ['Avant', 'Thème, horaires, règles et barème applicable, puis « Commencer la manche ».'],
                ['Pendant', 'Timer permanent, une question par écran, sauvegarde immédiate, soumission automatique à l’expiration.'],
                ['Après', 'Score de manche, score cumulé, rang si le seuil est atteint, prochaine manche annoncée.'],
              ].map(([k, v]) => (
                <li key={k} className="flex gap-4">
                  <span className="w-16 shrink-0 text-[11px] font-extrabold uppercase tracking-[0.18em]" style={{ color: ARENA.redSoft, fontFamily: BODY, paddingTop: 3 }}>
                    {k}
                  </span>
                  <span className="text-[14px] leading-relaxed" style={{ color: ARENA.textSoft, fontFamily: BODY }}>{v}</span>
                </li>
              ))}
            </ul>
          </Rise>
          <Rise delay={0.1}>
            <MatchDemo />
          </Rise>
        </div>
      </Container>
    </section>
  );
}

/* ---------------------------------------------------------------- */

function BaremeSection() {
  return (
    <section className="py-16 sm:py-24" style={{ borderTop: `1px solid ${ARENA.line}` }}>
      <Container>
        <Rise>
          <SectionHead
            eyebrow="Barème annoncé avant chaque manche"
            title="Vous connaissez la règle avant de jouer votre manche."
            lead="Une correction par discordance et une correction tout ou rien appellent des stratégies opposées. Le barème retenu est affiché sur l’écran d’accueil de chaque manche et rappelé question par question."
          />
        </Rise>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          <Rise>
            <BaremeCard type="QRM" title="Correction par discordance" rows={BAREME_QRM} note="Une discordance = proposition cochée à tort ou attendue non cochée. Comptée sur l’ensemble des propositions." />
          </Rise>
          <Rise delay={0.06}>
            <BaremeCard type="QRU" title="Correction binaire" rows={[['Bonne réponse cochée', '1 point'], ['Tout autre cas', '0 point']]} note="Une seule proposition peut être cochée : cocher une seconde proposition désélectionne la première." />
          </Rise>
          <Rise delay={0.12}>
            <BaremeCard type="QRP" title="Notation en x / n" rows={[['Aucune erreur', 'x ÷ n'], ['Au moins une erreur', '0 point']]} note="n = réponses attendues, x = réponses justes cochées. Le nombre n est indiqué sur la question." />
          </Rise>
        </div>
      </Container>
    </section>
  );
}

function BaremeCard({ type, title, rows, note }: { type: string; title: string; rows: string[][]; note: string }) {
  return (
    <div className="h-full rounded-2xl p-6" style={{ background: ARENA.surface, boxShadow: `inset 0 0 0 1px ${ARENA.line}` }}>
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-extrabold" style={{ fontFamily: DISPLAY, letterSpacing: '-0.03em', color: ARENA.redSoft }}>{type}</span>
        <span className="text-sm font-bold" style={{ color: ARENA.textSoft, fontFamily: BODY }}>{title}</span>
      </div>
      <dl className="mt-5 divide-y" style={{ borderColor: ARENA.line }}>
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between py-2.5" style={{ borderColor: ARENA.line }}>
            <dt className="text-[13.5px]" style={{ color: ARENA.textSoft, fontFamily: BODY }}>{k}</dt>
            <dd className="text-lg" style={{ ...TABULAR, fontWeight: 500 }}>{v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-xs leading-relaxed" style={{ color: ARENA.textMuted, fontFamily: BODY }}>{note}</p>
    </div>
  );
}

/* ---------------------------------------------------------------- */

function ScoresSection() {
  return (
    <section className="py-16 sm:py-24" style={{ borderTop: `1px solid ${ARENA.line}` }}>
      <Container>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start lg:gap-14">
          <Rise className="lg:sticky lg:top-10">
            <SectionHead
              eyebrow="Le fil rouge"
              title="Une position à défendre, manche après manche."
              lead="Le classement est cumulatif : provisoire après M1, cumulé après M2, final après M3. Il se gagne, se perd et se rattrape. Seul votre pseudonyme apparaît."
            />
            <div className="mt-8 rounded-2xl p-5" style={{ background: 'rgba(228,0,43,0.08)', boxShadow: 'inset 0 0 0 1px rgba(228,0,43,0.25)' }}>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em]" style={{ color: ARENA.redSoft, fontFamily: BODY }}>Votre position</p>
              <div className="mt-2 flex items-end gap-4">
                <span className="text-6xl leading-none" style={{ ...TABULAR, fontWeight: 500 }}>7<sup className="text-xl" style={{ color: ARENA.textMuted }}>e</sup></span>
                <span className="pb-1 text-sm leading-snug" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
                  Score cumulé <span className="font-bold" style={{ color: ARENA.text }}>19,4 / 24</span>
                  <br />
                  Manche 3 le 28 septembre — tout reste ouvert.
                </span>
              </div>
            </div>
          </Rise>
          <Rise delay={0.1}>
            <Leaderboard />
          </Rise>
        </div>
      </Container>
    </section>
  );
}

/* ---------------------------------------------------------------- */

function RulesSection() {
  return (
    <section id="regles" className="py-16 sm:py-24" style={{ borderTop: `1px solid ${ARENA.line}` }}>
      <Container>
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <Rise>
            <SectionHead eyebrow="Règles publiques" title="Les règles de l’arène." />
            <ol className="mt-8 space-y-3">
              {RULES.map((r, i) => (
                <li key={i} className="flex gap-4 text-[14px] leading-relaxed" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
                  <span className="shrink-0 pt-0.5 text-sm" style={{ ...TABULAR, color: ARENA.redSoft }}>{(i + 1).toString().padStart(2, '0')}</span>
                  <span>{r}</span>
                </li>
              ))}
            </ol>
          </Rise>
          <Rise delay={0.1}>
            <div className="rounded-2xl p-6 sm:p-8" style={{ background: ARENA.surface, boxShadow: `inset 0 0 0 1px ${ARENA.line}` }}>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>Nature du dispositif</p>
              <p className="mt-3 text-[15px] leading-relaxed" style={{ fontFamily: BODY, color: ARENA.text }}>
                Ceci est un tournoi ludique d’entraînement. Ce n’est pas un concours blanc. Le résultat obtenu ne constitue
                en aucun cas une évaluation de votre niveau réel ni une indication sur vos chances de réussite aux EVC.
              </p>
              <p className="mt-7 text-[11px] font-extrabold uppercase tracking-[0.2em]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>Connexion</p>
              <p className="mt-3 text-[15px] leading-relaxed" style={{ fontFamily: BODY, color: ARENA.text }}>
                Assurez-vous de disposer d’une connexion internet stable avant de commencer. Le chronomètre continue de
                tourner en cas de déconnexion.
              </p>
              <p className="mt-7 text-[11px] font-extrabold uppercase tracking-[0.2em]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>Après la clôture</p>
              <p className="mt-3 text-[15px] leading-relaxed" style={{ fontFamily: BODY, color: ARENA.text }}>
                Chaque participant reçoit les corrections détaillées de la manche : réponses attendues, pièges de l’énoncé,
                erreurs les plus fréquentes et encadré méthodologique. C’est la contrepartie de la participation.
              </p>
            </div>
          </Rise>
        </div>
      </Container>
    </section>
  );
}

/* ---------------------------------------------------------------- */

function FinalCta() {
  return (
    <section className="relative isolate overflow-hidden py-20 sm:py-28" style={{ borderTop: `1px solid ${ARENA.line}` }}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: `radial-gradient(ellipse 60% 80% at 50% 100%, rgba(228,0,43,0.28), transparent 70%)` }}
      />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-px" style={{ background: ARENA.red, boxShadow: '0 0 30px rgba(228,0,43,0.9)' }} />
      <Container>
        <Rise className="mx-auto max-w-3xl text-center">
          <Eyebrow>Première édition · Médecine interne</Eyebrow>
          <h2 className="mt-5 text-[2.4rem] font-extrabold leading-[0.95] sm:text-[3.6rem] lg:text-[4.4rem]" style={{ fontFamily: DISPLAY, letterSpacing: '-0.045em' }}>
            Entrez dans l’arène.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed sm:text-base" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
            Prénom, nom, email, spécialité et pseudonyme. Un email de confirmation, puis rendez-vous le 20 septembre à 09h00, heure de Paris.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ArenaButton className="w-full sm:w-auto">
              S’inscrire au tournoi <ArrowRight className="h-4 w-4" />
            </ArenaButton>
            <ArenaButton variant="ghost" className="w-full sm:w-auto">
              <Share2 className="h-4 w-4" /> Inviter un collègue
            </ArenaButton>
          </div>
        </Rise>
      </Container>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-8">
      <Container className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white p-1">
            <Image src="/major-ecn-logo.png" alt="Major ECN" width={48} height={48} className="h-full w-full object-contain" />
          </span>
          <span className="text-xs" style={{ color: ARENA.textMuted, fontFamily: BODY }}>
            EVC Arena est un dispositif Major ECN — préparation aux EVC depuis 2011.
          </span>
        </div>
        <div className="flex gap-5 text-xs" style={{ color: ARENA.textMuted, fontFamily: BODY }}>
          <Link href="/confidentialite" className="hover:text-white">Politique de confidentialité</Link>
          <Link href="/cgu" className="hover:text-white">CGU</Link>
          <Link href="/" className="hover:text-white">major-ecn.fr</Link>
        </div>
      </Container>
    </footer>
  );
}
