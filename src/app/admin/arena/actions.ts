"use server";

import { unstable_rethrow } from "next/navigation";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logAudit } from "@/lib/audit/log";
import {
  ensureArenaAdmin,
  integrityCheck,
  logAdmin,
  slugify,
} from "@/lib/arena/admin";
import {
  arenaDb,
  computeTournamentStandings,
  effectiveBareme,
  getParticipant,
  getRound,
  getTournament,
  listAttemptsForRounds,
  listParticipants,
  listQuestions,
  loadTournamentSnapshot,
  roundMaxScore,
} from "@/lib/arena/db";
import {
  relanceEmail,
  reportUpdateEmail,
  resultsEmail,
  roundOpeningEmail,
  roundReminderEmail,
  sendArenaEmail,
  validatedEmail,
} from "@/lib/arena/emails";
import { finalizeAttempt, recomputeRound } from "@/lib/arena/grading";
import { sanitizeBareme } from "@/lib/arena/scoring";
import { anonymizeParticipant } from "@/lib/arena/sequence";
import { publishArenaRound } from "@/lib/arena/rank-history-db";
import { issueAccessLink, issueConfirmationLink } from "@/lib/arena/auth-links";
import {
  remainingLabel,
  toDate,
  type TournamentStatus,
} from "@/lib/arena/time";
import {
  defaultEmailSequence,
  isValidPseudo,
  pseudoKey,
  qrpNs,
  type SequenceKind,
} from "@/lib/arena/types";
import { neutralizeQuestion } from "./questions-actions";

/**
 * EVC Arena — actions d'administration (§15) : tournois, manches, statuts,
 * duplication, participants, signalements, emails, tentatives.
 */

type Ok<T = object> = { ok: true } & T;
type Err = { ok: false; error: string };
const err = (error: string): Err => ({ ok: false, error });
const BASE = "/admin/arena";

function revalidate(id?: string) {
  revalidatePath(BASE);
  if (id) revalidatePath(`${BASE}/${id}`);
}

/** A failed round insert must not leave an unusable new draft behind. */
async function insertDraftRounds(tournamentId: string, rows: Record<string, unknown>[]) {
  const db = arenaDb();
  const { error } = await db.from("arena_rounds").insert(rows);
  if (!error) return;
  await db.from("arena_tournaments").delete().eq("id", tournamentId).eq("status", "draft").throwOnError();
  throw error;
}

/* ------------------------------------------------------------------ */
/* Tournois                                                            */
/* ------------------------------------------------------------------ */

const CreateSchema = z.object({
  title: z.string().trim().min(3).max(120),
  specialty: z.string().trim().min(2).max(120),
  specialty_id: z.string().trim().max(80).nullable().optional(),
  edition_label: z.string().trim().max(60).default(""),
  slug: z.string().trim().max(60).optional(),
  rounds: z.literal(3).default(3),
});

export async function createTournament(
  raw: z.input<typeof CreateSchema>,
): Promise<Ok<{ id: string }> | Err> {
  try {
    const actor = await ensureArenaAdmin();
    const parsed = CreateSchema.safeParse(raw);
    if (!parsed.success)
      return err(parsed.error.issues[0]?.message ?? "Formulaire invalide.");
    const d = parsed.data;
    const slug =
      slugify(d.slug || `${d.specialty}-${d.edition_label || d.title}`) ||
      `tournoi-${Date.now()}`;
    const db = arenaDb();
    const { data, error } = await db
      .from("arena_tournaments")
      .insert({
        title: d.title,
        specialty: d.specialty,
        specialty_id: d.specialty_id ?? null,
        edition_label: d.edition_label,
        slug,
        created_by: actor.user.id,
        questions_per_round: 20,
        round_duration_minutes: 20,
        min_rounds_final: 3,
        afficher_effectif_general: false,
      })
      .select("id")
      .single();
    if (error || !data)
      return err(
        String(error?.code) === "23505"
          ? "Cette URL (slug) est déjà utilisée."
          : (error?.message ?? "Création impossible."),
      );
    await insertDraftRounds(data.id, Array.from({ length: d.rounds }, (_, i) => ({
      tournament_id: data.id,
      number: i + 1,
    })));
    await logAdmin(actor, {
      tournamentId: data.id,
      kind: "created",
      details: `Tournoi « ${d.title} » créé (brouillon).`,
    });
    await logAudit({
      actor: actor.profile,
      action: "create",
      entity: "arena_tournament",
      entityId: data.id,
      description: `EVC Arena : création du tournoi « ${d.title} »`,
    });
    revalidate();
    return { ok: true, id: data.id };
  } catch (error) {
    unstable_rethrow(error);
    console.error("[arena] action échouée", error);
    return {
      ok: false,
      error: "L’action n’a pas pu être effectuée. Réessayez.",
    };
  }
}

const SettingsSchema = z.object({
  title: z.string().trim().min(3).max(120),
  slug: z
    .string()
    .trim()
    .regex(
      /^[a-z0-9-]{3,60}$/,
      "Slug : lettres minuscules, chiffres, tirets (3 à 60).",
    ),
  specialty: z.string().trim().min(2).max(120),
  specialty_id: z.string().trim().max(80).nullable(),
  edition_label: z.string().trim().max(60),
  meta_title: z.string().trim().max(160).nullable(),
  meta_description: z.string().trim().max(320).nullable(),
  intro_text: z.string().trim().max(2000),
  indexable: z.boolean(),
  leaderboard_enabled: z.boolean(),
  afficher_effectif_general: z.boolean().default(false),
  leaderboard_size: z.number().int().min(1).max(50),
  threshold_pct: z.number().min(0).max(100),
  min_rounds_final: z.literal(3),
  questions_per_round: z.literal(20),
  round_duration_minutes: z.number().int().min(1).max(240),
  // Durée par défaut d'une question. Le minutage réel d'une manche est la
  // somme des durées de ses questions ; `round_duration_minutes` ne sert
  // plus qu'aux tournois d'avant le 08/09/2026.
  seconds_per_question: z.number().int().min(5).max(3600),
  retention_days: z.number().int().min(30).max(3650),
  email_sequence: z.unknown(),
  texts: z.record(z.string(), z.string().max(4000)).optional(),
});

export async function updateTournamentSettings(
  id: string,
  raw: z.input<typeof SettingsSchema>,
): Promise<Ok | Err> {
  try {
    const actor = await ensureArenaAdmin();
    const parsed = SettingsSchema.safeParse(raw);
    if (!parsed.success)
      return err(parsed.error.issues[0]?.message ?? "Formulaire invalide.");
    const t = await getTournament(id);
    if (!t) return err("Tournoi introuvable.");
    const d = parsed.data;
    const patch = {
      ...d,
      email_sequence: defaultEmailSequence(d.email_sequence),
      texts: d.texts ?? {},
    };
    const { error } = await arenaDb()
      .from("arena_tournaments")
      .update(patch)
      .eq("id", id);
    if (error)
      return err(
        String(error.code) === "23505"
          ? "Cette URL (slug) est déjà utilisée."
          : error.message,
      );
    const changed = Object.keys(patch).filter(
      (k) =>
        JSON.stringify((t as unknown as Record<string, unknown>)[k]) !==
        JSON.stringify((patch as Record<string, unknown>)[k]),
    );
    await logAdmin(actor, {
      tournamentId: id,
      kind: "settings",
      details: `Paramètres modifiés : ${changed.join(", ") || "aucun changement"}.`,
    });
    revalidate(id);
    return { ok: true };
  } catch (error) {
    unstable_rethrow(error);
    console.error("[arena] action échouée", error);
    return {
      ok: false,
      error: "L’action n’a pas pu être effectuée. Réessayez.",
    };
  }
}

export async function updateTournamentBareme(
  id: string,
  raw: unknown,
): Promise<Ok | Err> {
  try {
    const actor = await ensureArenaAdmin();
    const t = await getTournament(id);
    if (!t) return err("Tournoi introuvable.");
    const bareme = sanitizeBareme(raw);
    await arenaDb()
      .from("arena_tournaments")
      .update({ bareme })
      .eq("id", id)
      .throwOnError();
    await logAdmin(actor, {
      tournamentId: id,
      kind: "bareme",
      oldValue: t.bareme,
      newValue: bareme,
      details:
        "Barème du tournoi modifié (s’applique aux manches non encore ouvertes).",
    });
    revalidate(id);
    return { ok: true };
  } catch (error) {
    unstable_rethrow(error);
    console.error("[arena] action échouée", error);
    return {
      ok: false,
      error: "L’action n’a pas pu être effectuée. Réessayez.",
    };
  }
}

/**
 * Modification exceptionnelle du barème d'une manche déjà ouverte (§6.10) :
 * tracée (auteur, date, ancienne et nouvelle valeur) et suivie d'un recalcul
 * des scores et du droit au rang.
 */
export async function overrideRoundBareme(
  roundId: string,
  raw: unknown,
  reason: string,
): Promise<Ok<{ recomputed: number }> | Err> {
  try {
    const actor = await ensureArenaAdmin();
    const round = await getRound(roundId);
    if (!round) return err("Manche introuvable.");
    if (!reason.trim()) return err("Motif obligatoire.");
    const bareme = sanitizeBareme(raw);
    await arenaDb()
      .from("arena_rounds")
      .update({
        bareme_snapshot: bareme,
        bareme_locked_at: round.bareme_locked_at ?? new Date().toISOString(),
      })
      .eq("id", roundId)
      .throwOnError();
    const recomputed = await recomputeRound(roundId);
    await logAdmin(actor, {
      tournamentId: round.tournament_id,
      roundId,
      kind: "bareme_override",
      oldValue: round.bareme_snapshot,
      newValue: bareme,
      details: `Barème de la manche ${round.number} modifié après ouverture : ${reason.trim()}. ${recomputed} tentative(s) recalculée(s).`,
    });
    revalidate(round.tournament_id);
    return { ok: true, recomputed };
  } catch (error) {
    unstable_rethrow(error);
    console.error("[arena] action échouée", error);
    return {
      ok: false,
      error: "L’action n’a pas pu être effectuée. Réessayez.",
    };
  }
}

const RoundSchema = z.object({
  theme: z.string().trim().max(200),
  opens_at: z.string().nullable(),
  closes_at: z.string().nullable(),
  duration_minutes: z.number().int().min(1).max(240).nullable(),
  results_publish_delay_minutes: z
    .number()
    .int()
    .min(0)
    .max(7 * 24 * 60),
  corrections_intro: z.string().max(5000).optional(),
  corrections_methodo: z.string().max(10000).optional(),
  corrections_errors: z.string().max(10000).optional(),
  corrections_references: z.string().max(5000).optional(),
  force: z.boolean().optional(),
});

export async function updateRound(
  roundId: string,
  raw: z.input<typeof RoundSchema>,
): Promise<Ok | Err> {
  try {
    const actor = await ensureArenaAdmin();
    const parsed = RoundSchema.safeParse(raw);
    if (!parsed.success)
      return err(parsed.error.issues[0]?.message ?? "Formulaire invalide.");
    const round = await getRound(roundId);
    if (!round) return err("Manche introuvable.");
    const t = await getTournament(round.tournament_id);
    if (!t) return err("Tournoi introuvable.");
    const d = parsed.data;
    const opens = toDate(d.opens_at);
    const closes = toDate(d.closes_at);
    if ((opens && !closes) || (!opens && closes))
      return err("Indiquez l’ouverture ET la clôture, ou aucune des deux.");
    if (opens && closes && closes <= opens)
      return err("La clôture doit suivre l’ouverture.");
    const datesChanged =
      (round.opens_at ?? null) !== (opens?.toISOString() ?? null) ||
      (round.closes_at ?? null) !== (closes?.toISOString() ?? null);
    const locked = t.status !== "draft" && t.status !== "scheduled";
    if (datesChanged && locked && !d.force)
      return err(
        "Les dates ne sont plus modifiables une fois les inscriptions ouvertes. Confirmez explicitement pour forcer (les inscrits seront informés).",
      );

    const { force: _force, ...rest } = d;
    void _force;
    const { error } = await arenaDb()
      .from("arena_rounds")
      .update({
        ...rest,
        opens_at: opens?.toISOString() ?? null,
        closes_at: closes?.toISOString() ?? null,
      })
      .eq("id", roundId);
    if (error) return err(error.message);
    if (datesChanged) {
      await logAdmin(actor, {
        tournamentId: t.id,
        roundId,
        kind: locked ? "dates_forced" : "dates",
        oldValue: { opens_at: round.opens_at, closes_at: round.closes_at },
        newValue: {
          opens_at: opens?.toISOString() ?? null,
          closes_at: closes?.toISOString() ?? null,
        },
        details: `Dates de la manche ${round.number} ${locked ? "modifiées après ouverture des inscriptions" : "modifiées"}.`,
      });
      if (locked && opens && closes) {
        // Information des inscrits (§15.1)
        const participants = (await listParticipants(t.id)).filter(
          (p) => p.email_confirmed_at && !p.blocked_at && !p.anonymized_at,
        );
        for (const p of participants) {
          await sendArenaEmail({
            tournament: t,
            participant: p,
            to: p.email,
            kind: "manual",
            roundId,
            triggeredBy: actor.user.id,
            mail: roundReminderEmail(t, p, "j7", {
              number: round.number,
              theme: d.theme,
              opens_at: opens,
              closes_at: closes,
            }),
          });
        }
      }
    }
    revalidate(t.id);
    return { ok: true };
  } catch (error) {
    unstable_rethrow(error);
    console.error("[arena] action échouée", error);
    return {
      ok: false,
      error: "L’action n’a pas pu être effectuée. Réessayez.",
    };
  }
}

const TRANSITIONS: Record<TournamentStatus, TournamentStatus[]> = {
  draft: ["scheduled", "archived"],
  scheduled: ["draft", "registration_open", "archived"],
  registration_open: ["archived"],
  round_open: ["archived"],
  round_closed: ["archived"],
  finished: ["archived"],
  archived: ["draft"],
};

/** Transitions manuelles de statut (§15.1). Le passage à « Programmé » exige le contrôle d'intégrité au vert. */
export async function setTournamentStatus(
  id: string,
  next: TournamentStatus,
): Promise<Ok | Err> {
  try {
    const actor = await ensureArenaAdmin();
    const t = await getTournament(id);
    if (!t) return err("Tournoi introuvable.");
    if (!TRANSITIONS[t.status]?.includes(next))
      return err(`Transition ${t.status} → ${next} non autorisée.`);
    if (next === "scheduled") {
      const snap = await loadTournamentSnapshot(t);
      const report = integrityCheck(snap);
      if (!report.ok)
        return err(
          `Contrôle d’intégrité en échec : ${[...report.problems, ...report.perRound.flatMap((r) => r.issues.map((i) => `M${r.number} — ${i}`))].slice(0, 5).join(" · ")}`,
        );
    }
    if (next === "archived" && t.status === "draft") {
      // Un brouillon archivé n'a aucun participant : suppression pure.
    }
    await arenaDb()
      .from("arena_tournaments")
      .update({ status: next })
      .eq("id", id)
      .throwOnError();
    await logAdmin(actor, {
      tournamentId: id,
      kind: "status",
      oldValue: t.status,
      newValue: next,
      details: "Transition manuelle confirmée par l’administrateur.",
    });
    await logAudit({
      actor: actor.profile,
      action: "update",
      entity: "arena_tournament",
      entityId: id,
      description: `EVC Arena « ${t.title} » : statut ${t.status} → ${next}`,
    });
    revalidate(id);
    return { ok: true };
  } catch (error) {
    unstable_rethrow(error);
    console.error("[arena] action échouée", error);
    return {
      ok: false,
      error: "L’action n’a pas pu être effectuée. Réessayez.",
    };
  }
}

export async function deleteDraftTournament(id: string): Promise<Ok | Err> {
  try {
    const actor = await ensureArenaAdmin();
    const t = await getTournament(id);
    if (!t) return err("Tournoi introuvable.");
    if (t.status !== "draft")
      return err(
        "Seul un brouillon peut être supprimé ; archivez les autres tournois.",
      );
    await arenaDb()
      .from("arena_tournaments")
      .delete()
      .eq("id", id)
      .throwOnError();
    await logAudit({
      actor: actor.profile,
      action: "delete",
      entity: "arena_tournament",
      entityId: id,
      description: `EVC Arena : suppression du brouillon « ${t.title} »`,
    });
    revalidate();
    return { ok: true };
  } catch (error) {
    unstable_rethrow(error);
    console.error("[arena] action échouée", error);
    return {
      ok: false,
      error: "L’action n’a pas pu être effectuée. Réessayez.",
    };
  }
}

/** Duplication (§15.3) : paramètres, barèmes, séquence d'emails, textes, manches (sans dates ni contenu) ; jamais les inscrits ni les scores. */
export async function duplicateTournament(
  id: string,
  raw: {
    title: string;
    specialty: string;
    edition_label?: string;
    slug?: string;
  },
): Promise<Ok<{ id: string }> | Err> {
  try {
    const actor = await ensureArenaAdmin();
    const src = await getTournament(id);
    if (!src) return err("Tournoi introuvable.");
    const { data: sourceRounds } = await arenaDb().from("arena_rounds")
      .select("number, duration_minutes, results_publish_delay_minutes")
      .eq("tournament_id", id).order("number").throwOnError();
    const parsed = CreateSchema.safeParse({ ...raw, rounds: 3 });
    if (!parsed.success)
      return err(parsed.error.issues[0]?.message ?? "Formulaire invalide.");
    const d = parsed.data;
    const slug =
      slugify(d.slug || `${d.specialty}-${d.edition_label || d.title}`) ||
      `tournoi-${Date.now()}`;
    const db = arenaDb();
    const { data, error } = await db
      .from("arena_tournaments")
      .insert({
        title: d.title,
        specialty: d.specialty,
        specialty_id: d.specialty_id ?? null,
        edition_label: d.edition_label,
        slug,
        status: "draft",
        indexable: false,
        meta_title: null,
        meta_description: null,
        intro_text: src.intro_text,
        leaderboard_enabled: src.leaderboard_enabled,
        leaderboard_size: src.leaderboard_size,
        threshold_pct: src.threshold_pct,
        afficher_effectif_general: src.afficher_effectif_general,
        min_rounds_final: 3,
        questions_per_round: 20,
        round_duration_minutes: 20,
        seconds_per_question: src.seconds_per_question,
        retention_days: src.retention_days,
        bareme: src.bareme,
        email_sequence: src.email_sequence,
        texts: src.texts,
        created_by: actor.user.id,
      })
      .select("id")
      .single();
    if (error || !data)
      return err(
        String(error?.code) === "23505"
          ? "Cette URL (slug) est déjà utilisée."
          : (error?.message ?? "Duplication impossible."),
      );
    await insertDraftRounds(data.id, Array.from({ length: 3 }, (_, i) => {
      const r = (sourceRounds as { number: number; duration_minutes: number | null; results_publish_delay_minutes: number }[])
        .find(round => round.number === i + 1);
      return {
        tournament_id: data.id,
        number: i + 1,
        duration_minutes: r?.duration_minutes ?? null,
        results_publish_delay_minutes: r?.results_publish_delay_minutes ?? 0,
      };
    }));
    await logAdmin(actor, {
      tournamentId: data.id,
      kind: "duplicated",
      details: `Dupliqué depuis « ${src.title} » (${src.slug}).`,
    });
    await logAudit({
      actor: actor.profile,
      action: "create",
      entity: "arena_tournament",
      entityId: data.id,
      description: `EVC Arena : duplication de « ${src.title} » en « ${d.title} »`,
    });
    revalidate();
    return { ok: true, id: data.id };
  } catch (error) {
    unstable_rethrow(error);
    console.error("[arena] action échouée", error);
    return {
      ok: false,
      error: "L’action n’a pas pu être effectuée. Réessayez.",
    };
  }
}

/* ------------------------------------------------------------------ */
/* Modèles de barème (§6.7)                                           */
/* ------------------------------------------------------------------ */

export async function saveBaremeTemplate(raw: {
  name: string;
  question_type: "QRM" | "QRU" | "QRP";
  config: unknown;
  id?: string | null;
}): Promise<Ok<{ id: string }> | Err> {
  try {
    const actor = await ensureArenaAdmin();
    const name = raw.name.trim();
    if (name.length < 2) return err("Nom du modèle requis.");
    const full = sanitizeBareme({
      [raw.question_type]: { mode: "custom", grid: raw.config },
    });
    const config = full[raw.question_type];
    const db = arenaDb();
    if (raw.id) {
      const { error } = await db
        .from("arena_bareme_templates")
        .update({ name, config })
        .eq("id", raw.id);
      if (error) return err(error.message);
      revalidate();
      return { ok: true, id: raw.id };
    }
    const { data, error } = await db
      .from("arena_bareme_templates")
      .insert({
        name,
        question_type: raw.question_type,
        config,
        created_by: actor.user.id,
      })
      .select("id")
      .single();
    if (error || !data)
      return err(error?.message ?? "Enregistrement impossible.");
    revalidate();
    return { ok: true, id: data.id };
  } catch (error) {
    unstable_rethrow(error);
    console.error("[arena] action échouée", error);
    return {
      ok: false,
      error: "L’action n’a pas pu être effectuée. Réessayez.",
    };
  }
}

export async function deleteBaremeTemplate(id: string): Promise<Ok | Err> {
  try {
    await ensureArenaAdmin();
    await arenaDb()
      .from("arena_bareme_templates")
      .delete()
      .eq("id", id)
      .throwOnError();
    revalidate();
    return { ok: true };
  } catch (error) {
    unstable_rethrow(error);
    console.error("[arena] action échouée", error);
    return {
      ok: false,
      error: "L’action n’a pas pu être effectuée. Réessayez.",
    };
  }
}

/* ------------------------------------------------------------------ */
/* Participants (§15.4)                                                */
/* ------------------------------------------------------------------ */

export async function blockParticipant(
  id: string,
  reason: string,
  block: boolean,
): Promise<Ok | Err> {
  try {
    const actor = await ensureArenaAdmin();
    const p = await getParticipant(id);
    if (!p) return err("Participant introuvable.");
    await arenaDb()
      .from("arena_participants")
      .update({
        blocked_at: block ? new Date().toISOString() : null,
        blocked_reason: block ? reason.trim() || null : null,
      })
      .eq("id", id)
      .throwOnError();
    await logAdmin(actor, {
      tournamentId: p.tournament_id,
      kind: block ? "participant_blocked" : "participant_unblocked",
      details: `${p.pseudo} (${p.email})${reason ? ` : ${reason}` : ""}`,
    });
    revalidate(p.tournament_id);
    return { ok: true };
  } catch (error) {
    unstable_rethrow(error);
    console.error("[arena] action échouée", error);
    return {
      ok: false,
      error: "L’action n’a pas pu être effectuée. Réessayez.",
    };
  }
}

/** Modération du pseudonyme (§3.3) : renommage par l'administration, tracé ; le participant garde ses scores. */
export async function renameParticipant(
  id: string,
  rawPseudo: string,
): Promise<Ok | Err> {
  try {
    const actor = await ensureArenaAdmin();
    const p = await getParticipant(id);
    if (!p) return err("Participant introuvable.");
    const pseudo = rawPseudo.trim();
    if (!isValidPseudo(pseudo))
      return err(
        "Pseudonyme invalide (3 à 24 caractères : lettres, chiffres, espaces, tirets, points).",
      );
    const { error } = await arenaDb()
      .from("arena_participants")
      .update({ pseudo, pseudo_key: pseudoKey(pseudo) })
      .eq("id", id);
    if (error)
      return err(
        String(error.code) === "23505"
          ? "Ce pseudonyme est déjà pris dans ce tournoi."
          : error.message,
      );
    await logAdmin(actor, {
      tournamentId: p.tournament_id,
      kind: "participant_renamed",
      oldValue: p.pseudo,
      newValue: pseudo,
      details: `Pseudonyme modéré : « ${p.pseudo} » → « ${pseudo} » (${p.email}).`,
    });
    revalidate(p.tournament_id);
    return { ok: true };
  } catch (error) {
    unstable_rethrow(error);
    console.error("[arena] action échouée", error);
    return {
      ok: false,
      error: "L’action n’a pas pu être effectuée. Réessayez.",
    };
  }
}

export async function deleteParticipantData(id: string): Promise<Ok | Err> {
  try {
    const actor = await ensureArenaAdmin();
    const p = await getParticipant(id);
    if (!p) return err("Participant introuvable.");
    await anonymizeParticipant(p, "request");
    await logAdmin(actor, {
      tournamentId: p.tournament_id,
      kind: "participant_deleted",
      details: `Données de ${p.pseudo} supprimées par l’administration.`,
    });
    await logAudit({
      actor: actor.profile,
      action: "delete",
      entity: "arena_participant",
      entityId: id,
      description: `EVC Arena : anonymisation du participant ${p.pseudo}`,
    });
    revalidate(p.tournament_id);
    return { ok: true };
  } catch (error) {
    unstable_rethrow(error);
    console.error("[arena] action échouée", error);
    return {
      ok: false,
      error: "L’action n’a pas pu être effectuée. Réessayez.",
    };
  }
}

export async function resendConfirmationAdmin(id: string): Promise<Ok | Err> {
  try {
    const actor = await ensureArenaAdmin();
    const p = await getParticipant(id);
    if (!p) return err("Participant introuvable.");
    if (p.email_confirmed_at) return err("Adresse déjà confirmée.");
    const t = await getTournament(p.tournament_id);
    if (!t) return err("Tournoi introuvable.");
    const r = await issueConfirmationLink(t, p, actor.user.id);
    if (!r.ok) return err(r.error);
    if (r.throttled) return err(`Patientez ${r.retryAfter ?? 60} secondes avant de renvoyer un lien.`);
    revalidate(t.id);
    return { ok: true };
  } catch (error) {
    unstable_rethrow(error);
    console.error("[arena] action échouée", error);
    return {
      ok: false,
      error: "L’action n’a pas pu être effectuée. Réessayez.",
    };
  }
}

/**
 * Renvoie à un participant le lien dont il a besoin, sans que l'administration
 * ait à savoir lequel.
 *
 * `resendConfirmationAdmin` refuse une adresse déjà confirmée — c'est correct
 * pour la confirmation, mais inutilisable quand un inscrit confirmé dit
 * simplement « je n'ai pas reçu le mail » : ce qu'il lui faut alors est un lien
 * de connexion. Cette action choisit donc :
 *   - adresse non confirmée  → nouveau lien de confirmation ;
 *   - adresse confirmée      → lien de connexion valable deux heures.
 *
 * Un participant bloqué ou anonymisé ne reçoit rien : lui renvoyer un lien
 * reviendrait à défaire une décision de modération ou une demande d'effacement.
 */
export async function resendArenaLink(
  id: string,
): Promise<Ok<{ kind: "confirmation" | "login" }> | Err> {
  try {
    const actor = await ensureArenaAdmin();
    const p = await getParticipant(id);
    if (!p) return err("Participant introuvable.");
    if (p.anonymized_at)
      return err("Ce participant a demandé l’effacement de ses données.");
    if (p.blocked_at)
      return err(
        "Ce participant est bloqué : débloquez-le avant de lui renvoyer un lien.",
      );
    const t = await getTournament(p.tournament_id);
    if (!t) return err("Tournoi introuvable.");

    const kind = p.email_confirmed_at ? "login" : "confirmation";
    const r = await issueAccessLink(t, p, actor.user.id);
    if (!r.ok) return err(r.error);
    if (r.throttled) return err(`Patientez ${r.retryAfter ?? 60} secondes avant de renvoyer un lien.`);
    await logAdmin(actor, {
      tournamentId: t.id,
      kind: "participant_email_resent",
      details: `Lien de ${kind === "login" ? "connexion" : "confirmation"} renvoyé à ${p.email}.`,
    });
    revalidate(t.id);
    return { ok: true, kind };
  } catch (error) {
    unstable_rethrow(error);
    console.error("[arena] action échouée", error);
    return {
      ok: false,
      error: "L’action n’a pas pu être effectuée. Réessayez.",
    };
  }
}

/** Réinitialisation exceptionnelle d'une tentative (incident technique avéré) : tracée. */
export async function resetAttempt(
  attemptId: string,
  reason: string,
): Promise<Ok | Err> {
  try {
    const actor = await ensureArenaAdmin();
    if (!reason.trim()) return err("Motif obligatoire.");
    const db = arenaDb();
    const { data: a } = await db
      .from("arena_attempts")
      .select("*")
      .eq("id", attemptId)
      .maybeSingle();
    if (!a) return err("Tentative introuvable.");
    const round = await getRound(a.round_id);
    await db.from("arena_attempts").delete().eq("id", attemptId).throwOnError();
    await logAdmin(actor, {
      tournamentId: round?.tournament_id ?? null,
      roundId: a.round_id,
      kind: "attempt_reset",
      oldValue: a,
      details: `Tentative réinitialisée : ${reason.trim()}`,
    });
    if (round) revalidate(round.tournament_id);
    return { ok: true };
  } catch (error) {
    unstable_rethrow(error);
    console.error("[arena] action échouée", error);
    return {
      ok: false,
      error: "L’action n’a pas pu être effectuée. Réessayez.",
    };
  }
}

/* ------------------------------------------------------------------ */
/* Signalements (§10.1)                                                */
/* ------------------------------------------------------------------ */

export async function handleReport(
  id: string,
  status: "validated" | "rejected",
  response: string,
): Promise<Ok | Err> {
  try {
    const actor = await ensureArenaAdmin();
    const db = arenaDb();
    const { data: rep } = await db
      .from("arena_reports")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (!rep) return err("Signalement introuvable.");
    const { data: q } = await db
      .from("arena_questions")
      .select("id, round_id, neutralized_at")
      .eq("id", rep.question_id)
      .maybeSingle();
    if (!q) return err("Question introuvable.");
    const round = await getRound(q.round_id);
    const t = round ? await getTournament(round.tournament_id) : null;
    if (!round || !t) return err("Manche introuvable.");
    if (status === "validated" && !q.neutralized_at) {
      const r = await neutralizeQuestion(
        q.id,
        response.trim() || "Signalement validé",
      );
      if (!r.ok) return r;
    }
    await db
      .from("arena_reports")
      .update({
        status,
        admin_response: response.trim() || null,
        handled_at: new Date().toISOString(),
        handled_by: actor.user.id,
      })
      .eq("id", id)
      .throwOnError();
    const p = await getParticipant(rep.participant_id);
    if (p) {
      const questions = await listQuestions(round.id);
      const index = questions.findIndex((x) => x.id === q.id) + 1;
      await sendArenaEmail({
        tournament: t,
        participant: p,
        to: p.email,
        kind: "report_update",
        roundId: round.id,
        triggeredBy: actor.user.id,
        mail: reportUpdateEmail(
          t,
          p,
          round.number,
          index,
          status,
          response.trim(),
        ),
      });
    }
    await logAdmin(actor, {
      tournamentId: t.id,
      roundId: round.id,
      kind: "report_handled",
      newValue: { status },
      details: `Signalement ${status === "validated" ? "validé" : "écarté"}${response ? ` : ${response.trim()}` : ""}`,
    });
    revalidate(t.id);
    return { ok: true };
  } catch (error) {
    unstable_rethrow(error);
    console.error("[arena] action échouée", error);
    return {
      ok: false,
      error: "L’action n’a pas pu être effectuée. Réessayez.",
    };
  }
}

/* ------------------------------------------------------------------ */
/* Emails manuels (§15.4)                                              */
/* ------------------------------------------------------------------ */

/**
 * Déclenchement manuel d'une étape de la séquence pour une manche : respecte
 * le dédoublonnage (un participant déjà servi n'est pas re-sollicité).
 */
export async function sendSequenceEmailNow(
  tournamentId: string,
  kind: SequenceKind,
  roundNumber: number | null,
): Promise<Ok<{ sent: number; skipped: number; errors: number }> | Err> {
  try {
    const actor = await ensureArenaAdmin();
    const t = await getTournament(tournamentId);
    if (!t) return err("Tournoi introuvable.");
    const snap = await loadTournamentSnapshot(t);
    const round = roundNumber
      ? snap.rounds.find((r) => r.number === roundNumber)
      : snap.rounds[0];
    if (!round) return err("Manche introuvable.");
    const opens = toDate(round.opens_at);
    const closes = toDate(round.closes_at);
    const participants = (await listParticipants(t.id)).filter(
      (p) => p.email_confirmed_at && !p.blocked_at && !p.anonymized_at,
    );
    const attempts = await listAttemptsForRounds([round.id]);
    const standings =
      kind === "results" ? await computeTournamentStandings(snap) : null;
    let sent = 0,
      skipped = 0,
      errors = 0;
    for (const p of participants) {
      const played = attempts.some((a) => a.participant_id === p.id);
      let mail;
      if (kind === "validated")
        mail = validatedEmail(t, p, {
          m1Open: toDate(snap.rounds[0]?.opens_at),
          m1Theme: snap.rounds[0]?.theme ?? "",
          bareme: t.bareme,
          qrpNs: qrpNs(
            snap.questionsByRound.get(snap.rounds[0]?.id ?? "") ?? [],
          ),
        });
      else if (kind === "j7" || kind === "j1") {
        if (!opens || !closes) return err("Dates de la manche manquantes.");
        mail = roundReminderEmail(t, p, kind, {
          number: round.number,
          theme: round.theme,
          opens_at: opens,
          closes_at: closes,
        });
      } else if (kind === "opening") {
        if (!closes || played) {
          skipped++;
          continue;
        }
        mail = roundOpeningEmail(
          t,
          p,
          { number: round.number, theme: round.theme, closes_at: closes },
          remainingLabel(closes.getTime() - Date.now()),
        );
      } else if (kind === "relance") {
        if (!closes || played) {
          skipped++;
          continue;
        }
        mail = relanceEmail(
          t,
          p,
          { number: round.number, theme: round.theme },
          remainingLabel(Math.max(0, closes.getTime() - Date.now())),
        );
      } else {
        const st = standings?.standings.find((s) => s.participantId === p.id);
        const mine = attempts.find(
          (a) => a.participant_id === p.id && a.status !== "in_progress",
        );
        const next =
          snap.rounds.find((x) => x.number === round.number + 1) ?? null;
        mail = resultsEmail(t, p, {
          number: round.number,
          theme: round.theme,
          score: mine ? Number(mine.score ?? 0) : null,
          max: roundMaxScore(
            snap.questionsByRound.get(round.id) ?? [],
            effectiveBareme(t, round),
          ),
          cumulScore: st?.totalScore ?? 0,
          cumulMax: st?.totalMax ?? 0,
          rank: st?.rank ?? null,
          isLast:
            round.number === Math.max(...snap.rounds.map((x) => x.number)),
          next: next
            ? {
                number: next.number,
                opens_at: toDate(next.opens_at),
                theme: next.theme,
              }
            : null,
        });
      }
      const dedupeKey =
        kind === "validated"
          ? `validated:${t.id}:${p.id}`
          : `${kind}:${round.id}:${p.id}`;
      const r = await sendArenaEmail({
        tournament: t,
        participant: p,
        to: p.email,
        kind,
        roundId: round.id,
        dedupeKey,
        mail,
        triggeredBy: actor.user.id,
      });
      if (r.ok) sent++;
      else if (r.skipped) skipped++;
      else errors++;
    }
    await logAdmin(actor, {
      tournamentId: t.id,
      roundId: round.id,
      kind: "email_manual",
      newValue: { kind, sent, skipped, errors },
      details: `Envoi manuel « ${kind} » : ${sent} envoyé(s), ${skipped} ignoré(s), ${errors} erreur(s).`,
    });
    revalidate(t.id);
    return { ok: true, sent, skipped, errors };
  } catch (error) {
    unstable_rethrow(error);
    console.error("[arena] action échouée", error);
    return {
      ok: false,
      error: "L’action n’a pas pu être effectuée. Réessayez.",
    };
  }
}

/** Publication manuelle des résultats d'une manche clôturée (sans attendre le délai). */
export async function publishRoundResults(roundId: string): Promise<Ok | Err> {
  try {
    const actor = await ensureArenaAdmin();
    const round = await getRound(roundId);
    if (!round) return err("Manche introuvable.");
    const closes = toDate(round.closes_at);
    if (!closes || closes > new Date())
      return err("La manche n’est pas clôturée.");
    const open = await listAttemptsForRounds([roundId], true);
    for (const a of open)
      if (a.status === "in_progress") await finalizeAttempt(a.id, "expired");
    try {
      await publishArenaRound(roundId);
    } catch (e) {
      return err(
        e instanceof Error
          ? e.message
          : "Publication du classement impossible.",
      );
    }
    await logAdmin(actor, {
      tournamentId: round.tournament_id,
      roundId,
      kind: "results_published",
      details: `Résultats de la manche ${round.number} publiés manuellement.`,
    });
    revalidate(round.tournament_id);
    return { ok: true };
  } catch (error) {
    unstable_rethrow(error);
    console.error("[arena] action échouée", error);
    return {
      ok: false,
      error: "L’action n’a pas pu être effectuée. Réessayez.",
    };
  }
}
