/** Programmation d'une épreuve (sous-ensemble des colonnes mock_exams). */
export type ExamScheduling = {
  exam_mode: 'free' | 'scheduled';
  duration_minutes: number | null;
  open_at: string | null;
  close_at: string | null;
  absence_mode: 'zero' | 'rattrapage';
  rattrapage_open_at: string | null;
  rattrapage_close_at: string | null;
  results_publish_mode: 'immediate' | 'after_close' | 'at_datetime';
  results_publish_at: string | null;
};

export type AccessOverride = { open_at: string | null; close_at: string | null; duration_minutes: number | null } | null;

export type WindowReason = 'free' | 'open' | 'before' | 'after' | 'rattrapage' | 'override';
export type WindowState = {
  canCompose: boolean;
  opensAt: Date | null;
  closesAt: Date | null;
  durationMinutes: number | null;
  reason: WindowReason;
};

const toDate = (s: string | null | undefined): Date | null => (s ? new Date(s) : null);

/**
 * Fenêtre de composition applicable à un candidat, en tenant compte :
 * épreuve libre (toujours), programmée (open/close), déblocage individuel
 * (mock_exam_access, prioritaire), et rattrapage des absents.
 */
export function examWindow(exam: ExamScheduling, access: AccessOverride, nowMs: number, hasSubmission: boolean): WindowState {
  const dur = exam.duration_minutes;

  // Déblocage individuel : prioritaire sur tout.
  if (access) {
    const o = toDate(access.open_at), c = toDate(access.close_at);
    const afterOpen = !o || nowMs >= o.getTime();
    const beforeClose = !c || nowMs <= c.getTime();
    return {
      canCompose: afterOpen && beforeClose,
      opensAt: o, closesAt: c, durationMinutes: access.duration_minutes ?? dur,
      reason: afterOpen && beforeClose ? 'override' : (o && nowMs < o.getTime() ? 'before' : 'after'),
    };
  }

  if (exam.exam_mode !== 'scheduled') {
    return { canCompose: true, opensAt: null, closesAt: null, durationMinutes: dur, reason: 'free' };
  }

  const o = toDate(exam.open_at), c = toDate(exam.close_at);
  if (o && nowMs < o.getTime()) return { canCompose: false, opensAt: o, closesAt: c, durationMinutes: dur, reason: 'before' };
  if (!c || nowMs <= c.getTime()) return { canCompose: true, opensAt: o, closesAt: c, durationMinutes: dur, reason: 'open' };

  // Après la fenêtre principale : rattrapage réservé aux absents.
  if (exam.absence_mode === 'rattrapage' && !hasSubmission) {
    const ro = toDate(exam.rattrapage_open_at), rc = toDate(exam.rattrapage_close_at);
    if (ro && rc) {
      if (nowMs < ro.getTime()) return { canCompose: false, opensAt: ro, closesAt: rc, durationMinutes: dur, reason: 'before' };
      if (nowMs <= rc.getTime()) return { canCompose: true, opensAt: ro, closesAt: rc, durationMinutes: dur, reason: 'rattrapage' };
    }
  }
  return { canCompose: false, opensAt: o, closesAt: c, durationMinutes: dur, reason: 'after' };
}

/** Les résultats (et le classement) sont-ils publiés ? */
export function resultsVisible(exam: ExamScheduling, nowMs: number): boolean {
  switch (exam.results_publish_mode) {
    case 'after_close':
      return !exam.close_at || nowMs > new Date(exam.close_at).getTime();
    case 'at_datetime':
      return !!exam.results_publish_at && nowMs >= new Date(exam.results_publish_at).getTime();
    default:
      return true; // immediate
  }
}

/** Échéance effective d'une copie en cours : min(start+durée, fermeture). */
export function effectiveDeadline(startedAtMs: number, durationMinutes: number | null, closesAt: Date | null): Date | null {
  const byDuration = durationMinutes ? startedAtMs + durationMinutes * 60_000 : null;
  const byClose = closesAt ? closesAt.getTime() : null;
  const candidates = [byDuration, byClose].filter((x): x is number => x !== null);
  if (candidates.length === 0) return null;
  return new Date(Math.min(...candidates));
}
