'use client';

/**
 * Question QCM / QROC jointe à une question du forum (cf. lib/forum/qcm-joint).
 *
 *  - `equipe` (/admin/qa) : énoncé, propositions avec le corrigé, réponse de
 *    l'élève, lien pour ouvrir / corriger la question ;
 *  - `eleve` (/forum, sa propre question) : rappel de la question et de sa
 *    réponse, lien vers le lecteur — jamais le corrigé d'une question d'épreuve ;
 *  - `public` (question rendue publique, vue par les autres élèves) : la
 *    question seule, sans la réponse de son auteur.
 */
import { useState } from 'react';
import Link from 'next/link';
import { Check, ChevronDown, ChevronUp, ExternalLink, Paperclip } from 'lucide-react';
import { sanitizeFlashcardHtml } from '@/lib/flashcards/rich-text';
import { reponseModele } from '@/lib/qcm/grade';
import {
  apercuEnonce,
  intituleQuestionJointe,
  lienEditionQuestionJointe,
  lienQuestionJointe,
  reponseEleveTexte,
  type QcmJoint,
} from '@/lib/forum/qcm-joint';
import { cn } from '@/lib/utils';

export function QcmJointCard({ joint, mode }: { joint: QcmJoint; mode: 'equipe' | 'eleve' | 'public' }) {
  const [ouvert, setOuvert] = useState(mode === 'equipe');
  const reponse = reponseEleveTexte(joint);
  const coches = joint.reponseEleve && 'lettres' in joint.reponseEleve ? new Set(joint.reponseEleve.lettres) : null;
  const lien = mode === 'equipe' ? lienEditionQuestionJointe(joint) : lienQuestionJointe(joint);
  const contexte = [joint.coursTitre, intituleQuestionJointe(joint)].filter(Boolean).join(' · ');

  return (
    <div className="mt-2 rounded-xl border border-(--color-primary)/25 bg-(--color-primary-soft)/30 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex min-w-0 items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-(--color-primary)">
          <Paperclip className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{joint.format === 'qroc' ? 'QROC joint' : 'QCM joint'} — {contexte}</span>
        </p>
        <div className="flex items-center gap-2">
          {lien && (
            <Link
              href={lien}
              target="_blank"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-(--color-primary) hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              {mode === 'equipe' ? (joint.source === 'examen' ? 'Ouvrir l’épreuve' : 'Ouvrir / corriger') : 'Revoir la question'}
            </Link>
          )}
          <button
            type="button"
            onClick={() => setOuvert((v) => !v)}
            className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-(--color-ink-muted) hover:text-(--color-ink)"
          >
            {ouvert ? <><ChevronUp className="h-3 w-3" /> Réduire</> : <><ChevronDown className="h-3 w-3" /> Afficher</>}
          </button>
        </div>
      </div>

      {!ouvert ? (
        <p className="mt-1 text-xs text-(--color-ink-soft)">{apercuEnonce(joint.enonce, 140)}</p>
      ) : (
        <div className="mt-2 space-y-2">
          <div
            className="text-sm leading-snug text-(--color-ink) [&_img]:my-1 [&_img]:max-h-48 [&_img]:rounded"
            dangerouslySetInnerHTML={{ __html: sanitizeFlashcardHtml(joint.enonce) }}
          />

          {mode === 'equipe' && joint.format === 'qcm' && joint.items.length > 0 && (
            <ul className="space-y-1">
              {joint.items.map((it) => {
                const coche = coches?.has(it.lettre) ?? false;
                return (
                  <li
                    key={it.lettre}
                    className={cn(
                      'flex items-start gap-2 rounded-lg border px-2.5 py-1.5 text-[13px]',
                      it.correct ? 'border-[#2E8B57]/40 bg-[color-mix(in_srgb,#2E8B57_8%,var(--color-surface))]' : 'border-(--color-border) bg-(--color-surface)',
                    )}
                  >
                    <span
                      className={cn(
                        'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded text-[11px] font-bold',
                        coche ? 'bg-(--color-primary) text-white' : 'bg-(--color-surface-soft) text-(--color-ink-soft)',
                      )}
                      title={coche ? 'Cochée par l’élève' : undefined}
                    >
                      {it.lettre}
                    </span>
                    <span className="min-w-0 flex-1 text-(--color-ink)" dangerouslySetInnerHTML={{ __html: sanitizeFlashcardHtml(it.enonce) }} />
                    <span className="flex shrink-0 items-center gap-1 text-[10px] font-bold">
                      {coche && <span className="text-(--color-primary)">cochée</span>}
                      {it.correct && <span className="inline-flex items-center gap-0.5 text-[#1F6B43]"><Check className="h-3 w-3" strokeWidth={3} />vrai</span>}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}

          {mode === 'equipe' && joint.format === 'qroc' && joint.reponseAttendue && (
            <p className="text-[13px] text-(--color-ink)">
              <span className="font-semibold">Réponse attendue : </span>{reponseModele(joint.reponseAttendue)}
            </p>
          )}

          {mode !== 'public' && (
            <p className="text-[13px] text-(--color-ink-soft)">
              {mode === 'equipe' ? 'Réponse de l’élève' : 'Votre réponse'} :{' '}
              <strong className="text-(--color-ink)">{reponse ?? 'pas encore répondu'}</strong>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
