import { z } from 'zod';

/**
 * Schémas du protocole de synchronisation mobile (POST /api/mobile/sync).
 *
 * Chaque opération porte un `op_id` UUID généré par le client : la table
 * `sync_ops` déduplique les rejeux (réseau coupé pendant la réponse, etc.).
 * `user_id` n'est JAMAIS accepté du client — il est forcé depuis le token.
 */

const uuid = z.string().uuid();
const isoDate = z.string().datetime({ offset: true });

export const MAX_SYNC_OPS = 500;
/** Plafonds anti-abus du temps d'étude (miroir de l'esprit du heartbeat). */
export const MAX_SECONDS_PER_TIME_OP = 6 * 3600;
export const MAX_SECONDS_PER_DAY = 16 * 3600;

const QcmSessionRow = z.object({
  id: uuid,
  serie_id: uuid,
  started_at: isoDate,
  finished_at: isoDate.nullable().optional(),
  score_correct: z.number().int().min(0).max(100_000),
  score_total: z.number().int().min(0).max(100_000),
});

const QcmAttemptRow = z.object({
  id: uuid,
  session_id: uuid.nullable().optional(),
  question_id: uuid,
  selected_items: z.unknown(),
  is_correct: z.boolean(),
  time_spent_seconds: z.number().int().min(0).max(86_400).nullable().optional(),
  attempted_at: isoDate,
  text_answer: z.string().max(4000).nullable().optional(),
});

const FlashcardReviewRow = z.object({
  id: uuid,
  flashcard_id: uuid,
  difficulty: z.enum(['tres_facile', 'facile', 'difficile', 'tres_difficile']),
  weight: z.number().int().min(1).max(4),
  reviewed_at: isoDate,
});

const SavedQuestionRow = z.object({
  question_id: uuid,
  serie_id: uuid.nullable().optional(),
  cours_id: uuid.nullable().optional(),
  /** false = retirer des « questions à revoir ». */
  saved: z.boolean(),
});

const CourseProgressRow = z.object({
  cours_id: uuid,
  fiche_read: z.boolean(),
  video_watched: z.boolean(),
  last_seen_at: isoDate,
});

const CourseNoteRow = z.object({
  cours_id: uuid,
  content: z.string().max(200_000),
  updated_at: isoDate,
});

const TimeTrackingRow = z.object({
  session_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  seconds: z.number().int().min(0).max(MAX_SECONDS_PER_TIME_OP),
});

export const SyncOpSchema = z.discriminatedUnion('table', [
  z.object({ op_id: uuid, table: z.literal('qcm_sessions'), row: QcmSessionRow }),
  z.object({ op_id: uuid, table: z.literal('qcm_attempts'), row: QcmAttemptRow }),
  z.object({ op_id: uuid, table: z.literal('flashcard_reviews'), row: FlashcardReviewRow }),
  z.object({ op_id: uuid, table: z.literal('student_saved_questions'), row: SavedQuestionRow }),
  z.object({ op_id: uuid, table: z.literal('course_progress'), row: CourseProgressRow }),
  z.object({ op_id: uuid, table: z.literal('course_notes'), row: CourseNoteRow }),
  z.object({ op_id: uuid, table: z.literal('time_tracking'), row: TimeTrackingRow }),
]);

export const SyncRequestSchema = z.object({
  /** Dernier pull réussi — null/absent = premier sync (pull complet). */
  last_pull_at: isoDate.nullable().optional(),
  ops: z.array(SyncOpSchema).max(MAX_SYNC_OPS),
});

export type SyncOp = z.infer<typeof SyncOpSchema>;
export type SyncRequest = z.infer<typeof SyncRequestSchema>;
