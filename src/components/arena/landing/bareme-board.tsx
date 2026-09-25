import Link from 'next/link';
import { ArrowRight, ClipboardList, Crosshair, Eye, FileText, Info, Lightbulb, Target, Timer, Trophy } from 'lucide-react';
import { ArenaBars } from '../experience-icons';

export type BaremeCard = { type: 'QRM' | 'QRU' | 'QRP'; title: string; lines: { situation: string; points: string }[]; notes: string[] };

const SUB: Record<BaremeCard['type'], string> = { QRM: 'Réponses multiples', QRU: 'Réponse unique', QRP: 'Nombre de réponses précisé' };

/** « 1 point » → « +1 point » ; « 0 point » et les retraits restent tels quels. */
function signed(points: string): string {
  return /^0(?![,\d])/.test(points) || !/^\d/.test(points) ? points : `+${points}`;
}

function Icon({ type }: { type: BaremeCard['type'] }) {
  if (type === 'QRM') return <ClipboardList aria-hidden strokeWidth={1.6} />;
  if (type === 'QRU') return <Timer aria-hidden strokeWidth={1.6} />;
  return <ArenaBars aria-hidden />;
}

/** Propositions A–E de l'exemple : attendue, cochée. */
type Prop = { l: string; expected: boolean; checked: boolean };
const QRM_EXAMPLE: Prop[] = [
  { l: 'A', expected: true, checked: true }, { l: 'B', expected: true, checked: true }, { l: 'C', expected: false, checked: false },
  { l: 'D', expected: false, checked: true }, { l: 'E', expected: false, checked: false },
];
const QRU_EXAMPLE: Prop[] = ['A', 'B', 'C', 'D', 'E'].map((l) => ({ l, expected: l === 'C', checked: l === 'D' }));

function Example({ card }: { card: BaremeCard }) {
  if (card.type === 'QRP') return null;
  const qrm = card.type === 'QRM';
  const line = qrm ? card.lines.find((l) => /^1 discordance/.test(l.situation)) : card.lines[1];
  const points = signed(line?.points ?? '0 point');
  const props = qrm ? QRM_EXAMPLE : QRU_EXAMPLE;
  return (
    <div className="ev-bareme-example">
      {qrm ? <Crosshair aria-hidden strokeWidth={1.5} className="ev-bareme-example-icon" /> : <Lightbulb aria-hidden strokeWidth={1.5} className="ev-bareme-example-icon" />}
      <div>
        <p className="ev-bareme-example-label">Exemple</p>
        <p className="ev-bareme-example-text">
          {qrm
            ? <>Sur une question à 5 propositions, si vous cochez A, B et D alors que seules A et B sont justes, vous avez 1 discordance → <strong>{points}</strong>.</>
            : <>Si la bonne réponse est C et que vous cochez D, vous obtenez <strong>{points}</strong>.</>}
        </p>
        <details>
          <summary className="ev-bareme-example-btn">Voir un exemple <ArrowRight aria-hidden /></summary>
          <ul className="ev-bareme-props" aria-label="Détail de l’exemple, proposition par proposition">
            {props.map((p) => {
              const wrong = p.checked !== p.expected;
              return (
                <li key={p.l} className={`${p.checked ? 'is-checked' : ''}${p.expected ? ' is-expected' : ''}${wrong ? ' is-wrong' : ''}`}>
                  <b>{p.l}</b>
                  <span>{p.checked ? 'Cochée' : 'Non cochée'}</span>
                  <small>{p.expected ? 'Attendue' : 'Fausse'}</small>
                  {wrong && <em>{qrm ? 'Discordance' : 'Erreur'}</em>}
                </li>
              );
            })}
          </ul>
        </details>
      </div>
    </div>
  );
}

/**
 * Trois cartes QRM / QRU / QRP — maquette client du 24/09/2026 (15_13_48),
 * générées depuis le barème RÉEL de la manche (§6.12 : CNG par défaut, tout
 * ou rien, grille personnalisée). `header` : titre « Vous connaissez la
 * règle… » et encart « Barème visible à tout moment » (page Règles) ; sur la
 * page d'accueil, le titre est porté par `LandingRulesTeaser`.
 */
export function LandingBareme({ cards, roundLabel, header = false }: { cards: BaremeCard[]; roundLabel: string; header?: boolean }) {
  return (
    <section id="bareme" className={`ev-bareme${header ? ' ev-bareme--page' : ''}`} aria-labelledby={header ? 'ev-bareme-title' : undefined} aria-label={header ? undefined : 'Barème des questions'}>
      <div className="ev-wrap">
        {header && (
          <div className="ev-bareme-head">
            <div>
              <p className="ev-eyebrow"><span aria-hidden className="ev-rule" />Barème annoncé avant chaque manche</p>
              <h2 id="ev-bareme-title" className="ev-title-xl">Vous connaissez la règle<br /><em>avant d’entrer sur la piste.</em></h2>
              <p className="ev-bareme-lead">Une correction par discordance et une correction tout ou rien appellent des stratégies différentes.<br />Le barème retenu est affiché sur l’écran d’accueil de chaque manche et rappelé question par question.<br />Réponses indispensables et inacceptables priment sur le barème.</p>
            </div>
            <div className="ev-bareme-visible">
              <Info aria-hidden />
              <div><strong>Barème visible à tout moment</strong><p>Le barème de la manche est toujours affiché avant de commencer et rappelé pendant l’épreuve.</p></div>
            </div>
          </div>
        )}
        <div className="ev-bareme-cards">
          {cards.map((c) => (
            <article key={c.type} className="ev-bareme-card">
              <header>
                <span className="ev-bareme-icon"><Icon type={c.type} /></span>
                <div><h3>{c.type}</h3><p>{SUB[c.type]}</p></div>
                <span className="ev-bareme-mode">{c.title}</span>
              </header>
              <dl>
                {c.lines.map((l) => (
                  <div key={l.situation}><dt>{l.situation}</dt><dd>{signed(l.points)}</dd></div>
                ))}
              </dl>
              {c.notes.map((n) => <p key={n} className="ev-bareme-note"><Info aria-hidden />{n}</p>)}
              <Example card={c} />
            </article>
          ))}
        </div>
        {roundLabel && <p className="ev-bareme-round">{roundLabel}</p>}
      </div>
    </section>
  );
}

const TEASER = [
  { icon: <FileText aria-hidden strokeWidth={1.5} />, title: 'Barème affiché', text: 'Le barème est visible avant le début de la manche et rappelé à chaque question.' },
  { icon: <Eye aria-hidden strokeWidth={1.5} />, title: 'Réponses clés', text: 'Les réponses indispensables et inacceptables sont clairement indiquées.' },
  { icon: <ArenaBars aria-hidden />, title: 'Classement cumulé', text: 'Votre score s’ajoute au classement général du tournoi.' },
  { icon: <Target aria-hidden strokeWidth={1.5} />, title: 'Une seule tentative', text: 'Chaque manche se joue en temps réel. Aucune nouvelle tentative après validation.' },
];

/**
 * « Vous connaissez la règle avant d'entrer sur la piste » — maquette client
 * du 24/09/2026 (15_12_13, moitié basse) : titre bicolore, accroche, lien vers
 * les règles complètes, quatre engagements pictographiés et citation.
 */
export function LandingRulesTeaser({ rulesHref }: { rulesHref: string }) {
  return (
    <section className="ev-teaser" aria-labelledby="ev-teaser-title">
      <div className="ev-wrap ev-teaser-grid">
        <div className="ev-teaser-copy">
          <p className="ev-eyebrow"><span aria-hidden className="ev-rule" />Barème annoncé avant chaque manche</p>
          <h2 id="ev-teaser-title" className="ev-title-xl">Vous connaissez la règle<br /><em>avant d’entrer sur la piste.</em></h2>
          <p>Une correction par discordance et une correction tout ou rien appellent des stratégies opposées. Le barème retenu est affiché sur l’écran d’accueil de chaque manche et rappelé question par question. Réponses indispensables et inacceptables priment sur le barème.</p>
          <Link href={rulesHref} className="ev-btn ev-btn--gold ev-btn--sm ev-btn--square">Voir les règles complètes <ArrowRight aria-hidden /></Link>
        </div>
        <div className="ev-teaser-side">
          <ul className="ev-teaser-list">
            {TEASER.map((t) => (
              <li key={t.title}><span className="ev-teaser-icon">{t.icon}</span><h3>{t.title}</h3><p>{t.text}</p></li>
            ))}
          </ul>
          <div className="ev-quote ev-quote--bar">
            <span className="ev-quote-trophy" aria-hidden><Trophy strokeWidth={1.6} /></span>
            <p>La rigueur d’aujourd’hui construit votre réussite de demain.</p>
            <span className="ev-quote-sign">EVC Arena<br />By Major ECN</span>
          </div>
        </div>
      </div>
    </section>
  );
}
