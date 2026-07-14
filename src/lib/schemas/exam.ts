import { z } from 'zod';

export const BAREME_MODES = ['classic', 'custom', 'discordance'] as const;
export const QROC_MODES = ['self', 'ai'] as const;
export const QUESTION_ORDERS = ['fixed', 'random'] as const;
export const EXAM_STATUSES = ['draft', 'published', 'archived'] as const;

const DiscordanceTierSchema = z.object({
  d: z.number().int().min(0),
  p: z.number().min(0),
});

const ExamItemSchema = z.object({
  lettre: z.string().min(1).max(1),
  enonce: z.string().default(''),
  is_correct: z.boolean(),
  justification: z.string().optional().default(''),
});

/** Réglages d'une épreuve (Phase 1 : libre ; la programmation vient en Phase 3). */
export const ExamSettingsSchema = z.object({
  title: z.string().min(1, 'Titre requis').max(200),
  college_id: z.string().nullable().optional(),
  duration_minutes: z.number().int().positive().max(600).nullable().optional(),
  instructions: z.string().default(''),
  qcm_bareme_mode: z.enum(BAREME_MODES).default('classic'),
  discordance_table: z.array(DiscordanceTierSchema).default([]),
  qroc_mode: z.enum(QROC_MODES).default('self'),
  question_order: z.enum(QUESTION_ORDERS).default('fixed'),
  // Ciblage
  min_offer: z.enum(['essentiel', 'intensif', 'approfondi']).nullable().optional(),
  target_colleges: z.array(z.string()).default([]),
  voies: z.array(z.enum(['interne', 'externe'])).default([]),
  target_promos: z.array(z.string()).default([]),
});

export const ExamQuestionSchema = z.object({
  id: z.string().uuid().optional(),
  format: z.enum(['qcm', 'qroc']),
  enonce: z.string().default(''),
  vignette: z.string().nullable().optional(),
  correction_generale: z.string().nullable().optional(),
  points: z.number().min(0).max(100).default(1),
  college_id: z.string().nullable().optional(),
  items: z.array(ExamItemSchema).default([]),
  reponse_attendue: z.string().nullable().optional(),
});

export type ExamSettingsInput = z.infer<typeof ExamSettingsSchema>;
export type ExamQuestionInput = z.infer<typeof ExamQuestionSchema>;
