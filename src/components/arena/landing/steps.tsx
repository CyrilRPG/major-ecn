import { FilePenLine, Timer } from 'lucide-react';
import { HelmetDivider } from '../arena-footers';

/** « 12 à 20 questions » / « 20 questions » depuis les manches réelles. */
function questionsText(counts: readonly number[]): string {
  const real = counts.filter((n) => n > 0);
  if (!real.length) return 'Des questions chronométrées une par une.';
  const min = Math.min(...real), max = Math.max(...real);
  return min === max ? `${min} questions par manche.` : `${min} à ${max} questions selon la manche.`;
}

function secondsText(seconds: readonly number[]): string {
  const real = [...new Set(seconds.filter((s) => s > 0))];
  if (real.length === 1) return `${real[0]} secondes par question.`;
  return 'Durée indiquée à chaque question.';
}

function Bars() {
  return <svg viewBox="0 0 48 48" aria-hidden className="ev-steps-icon" fill="currentColor"><path d="M6 42h36v3H6z" /><rect x="10" y="24" width="7" height="16" rx="1" /><rect x="20.5" y="14" width="7" height="26" rx="1" /><rect x="31" y="19" width="7" height="21" rx="1" /></svg>;
}

/**
 * « Comment se déroule un Battle ? » — section claire de la maquette client
 * du 24/09/2026 (15_08_21) : casque au milieu du filet doré, titre bicolore,
 * devise, trois étapes 01 · 02 · 03. Le nombre de questions et la durée
 * viennent des manches réelles. `signature` : signatures EVC Arena / devise en
 * bas de section (page Calendrier, où la section clôt la page).
 */
export function LandingSteps({ questions, seconds, signature = false }: { questions: readonly number[]; seconds: readonly number[]; signature?: boolean }) {
  const steps = [
    { n: '01', icon: <FilePenLine aria-hidden className="ev-steps-icon" strokeWidth={1.7} />, title: 'Je m’inscris à la manche', text: ['Je rejoins la manche le jour J en quelques clics, sous pseudonyme.'] },
    { n: '02', icon: <Timer aria-hidden className="ev-steps-icon" strokeWidth={1.8} />, title: 'Je dispute la manche', text: [questionsText(questions), secondsText(seconds), 'Une seule tentative.'] },
    { n: '03', icon: <Bars />, title: 'J’analyse ma performance', text: ['Je reçois mes corrections détaillées, je découvre mon classement anonymisé et je suis ma progression.'] },
  ];
  return (
    <section className="ev-steps" aria-labelledby="ev-steps-title">
      <HelmetDivider />
      <div className="ev-wrap">
        <div className="ev-steps-head">
          <h2 id="ev-steps-title"><span>Comment se déroule un <em>Battle</em>&nbsp;?</span></h2>
          <p>Trois étapes. Une seule tentative. Une vraie progression.</p>
        </div>
        <ol className="ev-steps-list">
          {steps.map((s) => (
            <li key={s.n}>
              <div className="ev-steps-mark"><span className="ev-steps-number">{s.n}</span>{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.text.map((line, i) => <span key={line}>{i > 0 && <br />}{line}</span>)}</p>
            </li>
          ))}
        </ol>
      </div>
      {signature && (
        <div className="ev-steps-signature">
          <p className="ev-sign-left">EVC Arena<span aria-hidden /><br />By Major ECN</p>
          <p className="ev-sign-right">La rigueur<br />au service<br />de votre réussite</p>
        </div>
      )}
    </section>
  );
}
