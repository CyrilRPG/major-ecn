"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowRight,
  Bookmark,
  Check,
  FileText,
  Info,
  Wifi,
  X,
} from "lucide-react";
import { ZoomableImage } from "@/components/qcm/image-zoom";
import type { PublicQuestion } from "@/lib/arena/types";
import { Ring } from "./ring";

const TYPE_LABEL = {
  QRM: "Réponses multiples",
  QRU: "Réponse unique",
  QRP: "Nombre de réponses précisé",
};

export type QuestionViewProps = {
  question: PublicQuestion;
  roundNumber: number;
  roundTotal: number;
  roundTheme: string;
  questionIndex: number;
  questionTotal: number;
  clock: string;
  progress: number;
  urgent: boolean;
  selected: string[];
  pending: boolean;
  canValidate: boolean;
  confirmationRequired: boolean;
  baremeLabel: string;
  error: string | null;
  onToggle: (letter: string) => void;
  onValidate: () => void;
  marked: boolean;
  markPending?: boolean;
  onMark: () => void;
};

export function QuestionView({
  question,
  roundNumber,
  roundTotal,
  roundTheme,
  questionIndex,
  questionTotal,
  clock,
  progress,
  urgent,
  selected,
  pending,
  canValidate,
  confirmationRequired,
  baremeLabel,
  error,
  onToggle,
  onValidate,
  marked,
  markPending,
  onMark,
}: QuestionViewProps) {
  const [confirm, setConfirm] = useState(false);
  const [help, setHelp] = useState(false);
  return (
    <section className="ae-question">
      <header className="ae-question-header">
        <div className="ae-question-heading">
          <p className="ae-kicker">
            Manche {roundNumber} / {roundTotal}
          </p>
          <h1>{roundTheme}</h1>
        </div>
        <div
          className="ae-question-timer"
          aria-label={`${clock} restantes pour cette question`}
        >
          <Ring
            size={124}
            stroke={8}
            color="#ffca4c"
            progress={progress}
            urgent={urgent}
          >
            <span className="ae-clock" aria-live="off">
              {clock}
            </span>
            <span className="ae-clock-caption">cette question</span>
          </Ring>
        </div>
        <div className="ae-question-progress">
          <p className="ae-kicker">Question</p>
          <strong>
            {questionIndex + 1} / {questionTotal}
          </strong>
          <div className="ae-progress-bars" aria-hidden>
            {Array.from({ length: questionTotal }, (_, i) => (
              <span key={i} data-active={i <= questionIndex ? "" : undefined} />
            ))}
          </div>
        </div>
      </header>
      {question.vignette && (
        <div className="ae-vignette">
          <FileText aria-hidden />
          <p>{question.vignette}</p>
        </div>
      )}
      <h2 className="ae-question-enonce">{question.enonce}</h2>
      <p className="ae-question-type">
        {TYPE_LABEL[question.type]}
        <b>
          · &nbsp; {question.type} &nbsp; · &nbsp; {baremeLabel}
        </b>
        {question.type === "QRP" && (
          <span>
            {" "}
            · Cochez exactement {question.expected_count ?? 1} propositions
          </span>
        )}
        {question.weight !== 1 && <span> · Coefficient {question.weight}</span>}
      </p>
      {question.images.length > 0 && (
        <div className="ae-question-images">
          {question.images.map((src) => (
            <span key={src}>
              <ZoomableImage src={src} sizes="(max-width: 760px) 90vw, 230px" />
            </span>
          ))}
        </div>
      )}
      <ul className="ae-question-answers" aria-label="Propositions de réponse">
        {question.items.map((item) => (
          <li key={item.lettre}>
            <button
              type="button"
              className="ae-question-answer"
              onClick={() => onToggle(item.lettre)}
              disabled={pending}
              aria-pressed={selected.includes(item.lettre)}
              aria-label={`${item.lettre}. ${item.enonce}`}
            >
              <span className="ae-answer-letter" aria-hidden>
                {selected.includes(item.lettre) ? <Check /> : item.lettre}
              </span>
              <span>{item.enonce}</span>
            </button>
          </li>
        ))}
      </ul>
      {error && (
        <p className="ae-question-error" role="alert">
          {error}
        </p>
      )}
      <div className="ae-question-actions">
        <button
          type="button"
          className="ae-button ae-button-quiet"
          aria-pressed={marked}
          disabled={markPending}
          onClick={onMark}
        >
          <Bookmark aria-hidden fill={marked ? "currentColor" : "none"} />
          {marked ? "Question marquée" : "Marquer la question"}
        </button>
        <Dialog.Root open={confirm} onOpenChange={setConfirm}>
          <Dialog.Trigger asChild>
            <button
              className="ae-button"
              disabled={!canValidate || pending}
              onClick={(event) => {
                if (!confirmationRequired) {
                  event.preventDefault();
                  onValidate();
                }
              }}
            >
              {pending ? "Enregistrement…" : "Valider la réponse"}
              <ArrowRight aria-hidden />
            </button>
          </Dialog.Trigger>
          <Dialog.Overlay className="ae-dialog-overlay" />
          <Dialog.Content
            className="ae-dialog"
            onOpenAutoFocus={(event) => {
              event.preventDefault();
              document.getElementById("arena-cancel-answer")?.focus();
            }}
          >
            <Dialog.Close className="ae-dialog-close" aria-label="Fermer">
              <X aria-hidden />
            </Dialog.Close>
            <span className="ae-alert-icon" aria-hidden>
              !
            </span>
            <Dialog.Title>Confirmer votre réponse ?</Dialog.Title>
            <Dialog.Description className="ae-dialog-description">
              Une fois validée, votre réponse ne pourra plus être modifiée.
            </Dialog.Description>
            <p className="ae-dialog-note">
              Cette confirmation apparaît uniquement lors de votre première
              validation.
            </p>
            <div className="ae-dialog-actions">
              <Dialog.Close
                id="arena-cancel-answer"
                className="ae-button ae-button-quiet"
              >
                Annuler
              </Dialog.Close>
              <button
                className="ae-button"
                disabled={!canValidate || pending}
                onClick={() => {
                  setConfirm(false);
                  onValidate();
                }}
              >
                Valider
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Root>
      </div>
      <div className="ae-question-footnote">
        <span>
          <Info aria-hidden />
          Question {questionIndex + 1} sur {questionTotal} · Validation
          définitive — aucun retour en arrière.
        </span>
        <Dialog.Root open={help} onOpenChange={setHelp}>
          <Dialog.Trigger asChild>
            <button type="button">
              <Wifi aria-hidden />
              Problème technique ?
            </button>
          </Dialog.Trigger>
          <Dialog.Overlay className="ae-dialog-overlay" />
          <Dialog.Content className="ae-dialog ae-technical-dialog">
            <Dialog.Close className="ae-dialog-close" aria-label="Fermer">
              <X aria-hidden />
            </Dialog.Close>
            <Dialog.Title>Problème technique ?</Dialog.Title>
            <Dialog.Description>
              Le chronomètre continue de tourner. Vérifiez votre connexion
              internet. Vos réponses déjà validées sont sauvegardées : vous
              pouvez recharger la page pour reprendre la question en cours.
            </Dialog.Description>
            <Dialog.Close className="ae-button ae-button-quiet">
              Revenir à ma question
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Root>
      </div>
    </section>
  );
}
