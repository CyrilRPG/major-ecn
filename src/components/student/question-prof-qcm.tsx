'use client';

/**
 * « Poser une question » depuis un lecteur de QCM / QROC / exercice.
 *
 * Deux destinataires, la question du lecteur JOINTE dans les deux cas
 * (identifiant + réponse donnée ; l'énoncé et le corrigé sont relus en base,
 * jamais pris du navigateur) :
 *  - l'assistant (`/api/chat`, champ `qcm`) répond en s'appuyant sur la
 *    question et son corrigé — sans dévoiler le corrigé tant que l'élève n'a
 *    pas répondu ;
 *  - le professeur référent du collège la reçoit sur le forum (/admin/qa)
 *    avec l'énoncé, les propositions, le corrigé et la réponse de l'élève.
 * La conversation avec l'assistant peut être transmise telle quelle au
 * professeur (`aiContext`).
 */
import { useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import {
  AlertCircle, ArrowUp, CheckCircle2, GraduationCap, Loader2, MessageCircleQuestion,
  MessagesSquare, Paperclip, Send,
} from 'lucide-react';
import { askQuestionAction } from '@/app/(student)/forum/actions';
import { apercuEnonce, type FormatQuestionJointe, type QcmJointEnvoi, type SourceQuestionJointe } from '@/lib/forum/qcm-joint';
import { Markdown } from '@/components/ui/markdown';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type Onglet = 'assistant' | 'prof';
type Message = { role: 'user' | 'assistant'; content: string };

type Props = Parameters<typeof QuestionSurQcm>[0];

/** Une conversation par question : le lecteur réutilise le composant d'une
 *  question à l'autre, la clé repart de zéro. */
export function QuestionProfQcm(props: Props) {
  return <QuestionSurQcm key={`${props.source ?? 'qcm'}:${props.questionId}`} {...props} />;
}

function QuestionSurQcm({
  source = 'qcm',
  questionId,
  enonce,
  numero = null,
  format = 'qcm',
  retournee = false,
  lettres = null,
  texte = null,
  className,
}: {
  /** 'examen' = épreuve blanche ou interrogation (mock_exam_questions) ;
   *  'exercice' = QCM personnel de « Mes entraînements » (student_exercises). */
  source?: SourceQuestionJointe;
  questionId: string;
  /** Énoncé (HTML) : aperçu de la question jointe. */
  enonce: string;
  /** Rang affiché dans le lecteur (« Question 4 »). */
  numero?: number | null;
  format?: FormatQuestionJointe;
  /** Flashcard : verso déjà vu par l'élève (l'assistant peut alors s'en servir). */
  retournee?: boolean;
  /** QCM : lettres cochées par l'élève (null = pas encore répondu). */
  lettres?: string[] | null;
  /** QROC : réponse saisie. */
  texte?: string | null;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [onglet, setOnglet] = useState<Onglet>('assistant');

  // Assistant
  const [messages, setMessages] = useState<Message[]>([]);
  const [saisie, setSaisie] = useState('');
  const [reflexion, setReflexion] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Professeur
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();
  // Depuis l'assistant : l'exercice ne part au professeur que si l'élève coche.
  const [joindre, setJoindre] = useState(false);

  const envoi: QcmJointEnvoi = {
    source,
    questionId,
    lettres: format === 'qcm' ? lettres : null,
    texte: format === 'qroc' ? texte : null,
    retournee: format === 'flashcard' ? retournee : null,
  };
  const reponse = format === 'qroc'
    ? ((texte ?? '').trim() || null)
    : lettres ? (lettres.length ? [...lettres].sort().join(', ') : null) : null;
  const nature = format === 'qroc' ? 'QROC' : format === 'flashcard' ? 'flashcard' : 'QCM';
  const ce = format === 'flashcard' ? 'cette' : 'ce';
  const conversation = messages
    .map((m) => `${m.role === 'user' ? 'Étudiant' : 'Assistant'} : ${m.content}`)
    .join('\n\n');

  function ouvrir(v: boolean) {
    setOpen(v);
    if (!v) { setError(null); if (done) { setDone(false); setBody(''); } }
  }

  async function demanderAssistant(e?: React.FormEvent) {
    e?.preventDefault();
    const question = saisie.trim();
    if (!question || reflexion) return;
    const historique = messages;
    setMessages([...historique, { role: 'user', content: question }]);
    setSaisie('');
    setReflexion(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question, qcm: envoi, historique }),
      });
      const data = (await res.json().catch(() => ({}))) as { reply?: string; error?: string };
      setMessages((m) => [...m, {
        role: 'assistant',
        content: data.reply ?? data.error ?? 'Je n’ai pas pu répondre pour le moment.',
      }]);
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: 'Connexion impossible. Réessaie dans un instant.' }]);
    } finally {
      setReflexion(false);
      requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }));
    }
  }

  function envoyerProf(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    setError(null);
    start(async () => {
      const res = await askQuestionAction({
        body,
        qcm: envoi,
        aiContext: conversation || null,
        // Sans échange avec l'assistant, la question est toujours jointe.
        joindreQcm: conversation ? joindre : true,
      });
      if ('error' in res) setError(res.error);
      else setDone(true);
    });
  }

  /** Bascule vers le professeur en reprenant la dernière question posée. */
  function transmettreAuProf() {
    if (!body.trim()) {
      const derniere = [...messages].reverse().find((m) => m.role === 'user');
      if (derniere) setBody(derniere.content);
    }
    setOnglet('prof');
  }

  const piece = (
    <div className="rounded-xl border border-(--color-border) bg-(--color-surface-soft) p-3">
      <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-(--color-ink-muted)">
        <Paperclip className="h-3 w-3" />
        {format === 'flashcard' ? `Flashcard jointe${numero ? ` — carte ${numero}` : ''}` : `${nature} joint${numero ? ` — question ${numero}` : ''}`}
      </p>
      <p className="mt-1 text-sm leading-snug text-(--color-ink)">{apercuEnonce(enonce, 220)}</p>
      <p className="mt-1.5 text-xs text-(--color-ink-soft)">
        {format === 'flashcard'
          ? <>Verso : <strong>{retournee ? 'déjà retourné' : 'pas encore retourné'}</strong></>
          : <>Votre réponse : <strong>{reponse ?? 'pas encore répondu'}</strong></>}
      </p>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => ouvrir(true)}
        title="Poser une question sur cette question, à l’assistant ou à un professeur"
        className={cn(
          'inline-flex items-center gap-1 rounded-md border border-(--color-border) bg-white px-2 py-1 text-[11px] font-semibold text-(--color-ink-soft) transition-colors hover:border-(--color-primary) hover:text-(--color-primary)',
          className,
        )}
      >
        <MessageCircleQuestion className="h-3.5 w-3.5" />
        <span>Poser une question</span>
      </button>

      <Dialog open={open} onOpenChange={ouvrir}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircleQuestion className="h-5 w-5 text-(--color-primary)" />
              Une question sur {ce} {nature} ?
            </DialogTitle>
            <DialogDescription>
              La question ci-dessous est jointe automatiquement : l’assistant comme le professeur
              savent exactement de {format === 'flashcard' ? 'quelle flashcard' : `quel ${nature}`} vous parlez.
            </DialogDescription>
          </DialogHeader>

          <div role="tablist" className="grid grid-cols-2 gap-1 rounded-xl bg-(--color-surface-soft) p-1">
            {([
              { key: 'assistant', label: 'Assistant', Icon: MessagesSquare },
              { key: 'prof', label: 'Professeur', Icon: GraduationCap },
            ] as const).map(({ key, label, Icon }) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={onglet === key}
                onClick={() => setOnglet(key)}
                className={cn(
                  'inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-colors',
                  onglet === key
                    ? 'bg-white text-(--color-ink) shadow-sm'
                    : 'text-(--color-ink-soft) hover:text-(--color-ink)',
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>

          {piece}

          {onglet === 'assistant' ? (
            <div className="space-y-3">
              {messages.length > 0 && (
                <div ref={scrollRef} className="max-h-[42dvh] space-y-3 overflow-y-auto pr-1">
                  {messages.map((m, i) => (
                    <div key={i} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                      <div
                        className={cn(
                          'max-w-[90%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                          m.role === 'user'
                            ? 'bg-(--color-primary) text-(--color-primary-fg) whitespace-pre-wrap'
                            : 'border border-(--color-border) bg-(--color-surface-soft) text-(--color-ink)',
                        )}
                      >
                        {m.role === 'assistant' ? <Markdown>{m.content}</Markdown> : m.content}
                      </div>
                    </div>
                  ))}
                  {reflexion && (
                    <div className="flex justify-start">
                      <div className="rounded-2xl border border-(--color-border) bg-(--color-surface-soft) px-3.5 py-2.5">
                        <Loader2 className="h-4 w-4 animate-spin text-(--color-ink-muted)" />
                      </div>
                    </div>
                  )}
                </div>
              )}
              <form onSubmit={demanderAssistant} className="relative">
                <textarea
                  value={saisie}
                  onChange={(e) => setSaisie(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void demanderAssistant(); }
                  }}
                  rows={3}
                  maxLength={2000}
                  autoFocus
                  placeholder={messages.length ? 'Une autre question ?' : 'Qu’est-ce qui vous pose souci ? (proposition, corrigé, notion…)'}
                  className="w-full resize-none rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 pr-11 text-sm text-(--color-ink) outline-none focus:border-(--color-primary)"
                />
                <button
                  type="submit"
                  disabled={reflexion || !saisie.trim()}
                  aria-label="Envoyer à l’assistant"
                  className="absolute bottom-3 right-2 flex h-7 w-7 items-center justify-center rounded-lg bg-(--color-primary) text-white transition hover:opacity-90 disabled:opacity-40"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
              </form>
              {messages.some((m) => m.role === 'assistant') && !reflexion && (
                <button
                  type="button"
                  onClick={transmettreAuProf}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-(--color-border) px-3 py-2 text-xs font-bold text-(--color-ink-soft) hover:border-(--color-primary) hover:text-(--color-primary)"
                >
                  <GraduationCap className="h-4 w-4" />
                  Pas convaincu·e ? Transmettre à un professeur
                </button>
              )}
            </div>
          ) : done ? (
            <div className="space-y-3">
              <p className="flex items-start gap-2 rounded-xl border border-[#2E8B57]/40 bg-[color-mix(in_srgb,#2E8B57_10%,var(--color-surface))] p-3 text-sm font-semibold text-[#1F6B43]">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                Question envoyée. La réponse du professeur arrivera dans le forum, et vous serez prévenu·e.
              </p>
              <div className="flex justify-end gap-2">
                <Link href="/forum" className="rounded-lg border border-(--color-border) px-3 py-2 text-xs font-bold text-(--color-ink-soft) hover:text-(--color-ink)">
                  Voir mes questions
                </Link>
                <button type="button" onClick={() => ouvrir(false)} className="rounded-lg bg-(--color-primary) px-3 py-2 text-xs font-bold text-white">
                  Reprendre
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={envoyerProf} className="space-y-3">
              {conversation && (
                <>
                  <p className="text-xs text-(--color-ink-soft)">
                    Votre échange avec l’assistant sera joint lui aussi.
                  </p>
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-(--color-ink)">
                    <input
                      type="checkbox"
                      checked={joindre}
                      onChange={(e) => setJoindre(e.target.checked)}
                      className="h-4 w-4 cursor-pointer rounded border-(--color-border) accent-(--color-primary)"
                    />
                    Joindre l’exercice ci-joint
                  </label>
                </>
              )}
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                maxLength={4000}
                autoFocus
                placeholder="Qu’est-ce qui vous pose souci ? (proposition, corrigé, notion…)"
                className="w-full resize-y rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm text-(--color-ink) outline-none focus:border-(--color-primary)"
              />
              {error && (
                <p className="flex items-start gap-1.5 text-xs text-(--color-danger)">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {error}
                </p>
              )}
              <button
                type="submit"
                disabled={pending || body.trim().length < 8}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-(--color-primary) px-3 py-2.5 text-sm font-bold text-white disabled:opacity-50"
              >
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Envoyer au professeur
              </button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
