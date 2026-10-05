/**
 * Libellés administrateur des paramètres du moteur pédagogique (Orchestrateur
 * §11 à §32, Interconnexion §55, Alertes §53, Check-up §4 à §27). Module PUR :
 * l'écran de réglages affiche chaque valeur avec sa signification et sa
 * valeur initiale, sans redéveloppement pour la modifier.
 */
export type SettingsModule = 'orchestrateur' | 'engagement' | 'checkup';

export const MODULE_TITLE: Record<SettingsModule, string> = {
  orchestrateur: 'Orchestrateur pédagogique central',
  engagement: 'Engagement et alertes candidat',
  checkup: 'EVC Check-up',
};

export const SETTINGS_LABELS: Record<SettingsModule, Record<string, string>> = {
  orchestrateur: {
    weights: 'Poids du score de priorité (normalisés par leur somme)',
    'weights.importance': 'Importance de l’item (%)',
    'weights.faiblesse': 'Faiblesse (%)',
    'weights.urgence': 'Urgence temporelle (%)',
    'weights.reactivation': 'Besoin de réactivation (%)',
    tie_threshold: 'Écart de score « proche » (points) — l’arbitrage départage en dessous',
    importance_unrated: 'Importance d’un item sans étoile (0 à 1)',
    urgency_horizon_days: 'Horizon de l’urgence (jours avant l’EVC)',
    reviews: 'Réactivations',
    'reviews.intervals': 'Délais de réactivation (jours, séparés par des virgules)',
    'reviews.pre_exam_window_days': 'Compression avant l’EVC : fenêtre (jours)',
    'reviews.pre_exam_divisor': 'Compression avant l’EVC : intervalles divisés par',
    'reviews.placement_far': 'Replacement avant l’EVC : au plus tôt J-',
    'reviews.placement_near': 'Replacement avant l’EVC : au plus tard J-',
    'reviews.min_days_between': 'Fréquence maximale : une réactivation par item tous les (jours)',
    'reviews.placement_daily_capacity': 'Réactivations replacées par jour au maximum',
    'reviews.early_tolerance_days': 'Activité faite en avance : tolérance (jours)',
    weak_errors: 'Erreurs faibles',
    'weak_errors.window_days': 'Fenêtre des erreurs faibles (jours)',
    'weak_errors.threshold': 'Erreurs faibles distinctes pour passer À revoir',
    on_track: 'En bonne voie',
    'on_track.min_positive': 'Signaux positifs minimum',
    'on_track.min_strong_or_intermediate': 'Dont forts ou intermédiaires',
    'on_track.no_strong_error_days': 'Sans erreur forte/intermédiaire depuis (jours)',
    consolidated: 'Maîtrise consolidée',
    'consolidated.positives': 'Signaux positifs',
    'consolidated.min_strong_or_intermediate': 'Dont forts ou intermédiaires',
    'consolidated.min_sessions': 'Sessions distinctes minimum',
    'consolidated.min_spread_days': 'Écart minimum entre le premier et le dernier (jours)',
    'consolidated.no_error_days': 'Sans aucune erreur depuis (jours)',
    recent_seen_days: 'Question « récemment vue » : fenêtre (jours)',
    equivalence_days: 'Équivalence d’activité : réalisée dans les (jours)',
    need_closure: 'Fermeture d’un besoin par une révision',
    'need_closure.min_results': 'Résultats minimum',
    'need_closure.min_positive_ratio': 'Part de réussite minimum (0 à 1)',
    checkup_recommendation: 'Recommandation d’un nouveau Check-up',
    'checkup_recommendation.new_items_worked': 'Après N nouveaux items travaillés',
    'checkup_recommendation.days_since_last': 'Ou N jours depuis le dernier Check-up',
    program: 'Programme du jour',
    'program.default_daily_minutes': 'Budget par défaut sans planificateur (minutes)',
    'program.extra_minutes_with_planner': 'Avec planificateur : temps réservé aux révisions (minutes)',
    'program.max_activities': 'Activités au maximum par jour',
    'program.margin_pct': 'Marge laissée sur le budget (%)',
    'program.durations': 'Durées estimées (minutes)',
    'program.durations.review': 'Révision prioritaire',
    'program.durations.consolidate': 'Consolidation',
    'program.durations.reactivate': 'Réactivation',
    'program.durations.evaluate': 'Contrôle',
    notification_cooldown_hours: 'Notifications regroupées : délai minimum entre deux (heures)',
    backfill_days: 'Mise en service : historique repris (jours)',
  },
  engagement: {
    weights: 'Pondération du score d’engagement interne (jamais affiché au candidat)',
    'weights.transversal': 'Révisions transversales (%)',
    'weights.entrainement': 'Entraînement actif (%)',
    'weights.regularite': 'Régularité (%)',
    'weights.autres': 'Autres activités (%)',
    targets: 'Cibles valant 100 % de chaque composante',
    'targets.transversal_sessions_14d': 'Révisions transversales sur 14 jours',
    'targets.questions_7d': 'Questions sur 7 jours',
    'targets.active_days_7d': 'Jours actifs sur 7 jours',
    'targets.autres_points_7d': 'Autres activités sur 7 jours (points)',
    levels: 'Seuils du score',
    'levels.vert': 'VERT à partir de',
    'levels.jaune': 'JAUNE à partir de',
    'levels.orange': 'ORANGE à partir de (sinon ROUGE)',
    escalation_days: 'Escalade sans activité significative (jours)',
    'escalation_days.level1': 'Niveau 1 (encart)',
    'escalation_days.level2': 'Niveau 2 (encart orange + pop-up)',
    'escalation_days.level3': 'Niveau 3 (pop-up + bandeau persistant)',
    significant: 'Journée d’activité significative',
    'significant.min_questions': 'Questions (QCM, QROC, dossiers, annales) minimum',
    'significant.min_flashcards': 'Flashcards minimum',
    'significant.min_active_minutes': 'Temps d’étude mesuré minimum (minutes, 0 = ignoré)',
    'significant.count_videos': 'Une vidéo suivie compte',
    'significant.min_arena_answers': 'Réponses EVC Arena minimum',
    rhythm: 'Comparaison au rythme habituel',
    'rhythm.baseline_weeks': 'Semaines de référence',
    'rhythm.min_baseline_active_days': 'Jours actifs minimum dans la référence',
    'rhythm.drop_pct': 'Baisse déclenchant une vigilance (%)',
    transversal_min_ratio: 'Révisions transversales : vigilance sous ce taux de réalisation (0 à 1)',
    recovery: 'Reprise confirmée',
    'recovery.min_activities': 'Activités significatives minimum',
    'recovery.min_active_days': 'Jours actifs minimum',
    grace_days: 'Délai de grâce d’un nouvel inscrit (jours)',
    notification_cooldown_hours: 'Délai minimum entre deux notifications (heures)',
    planner: 'Adhérence au planificateur',
    'planner.adherence_vert': 'Planning suivi à partir de (%)',
    'planner.adherence_orange': 'Planning en retard à partir de (%, sinon non suivi)',
    'planner.delay_rate_7d': 'Retard cumulé : réalisation sur 7 jours sous (%)',
    'planner.delay_min_planned': 'Retard cumulé : activités prévues minimum',
    'planner.low_adherence_days': 'Planificateur ignoré : durée avant proposition (jours)',
    'planner.low_adherence_rate': 'Planificateur ignoré : réalisation sous (%)',
    'planner.overload_repeat': '« Planning trop chargé » répété (fois sur 14 jours)',
    'planner.recent_recalc_hours': 'Pas d’alerte de retard après un recalcul (heures)',
    'planner.low_adherence_cooldown_days': 'Ne pas reposer la question avant (jours)',
    tracking_guard_ratio: 'Garde-fou tracking : activité plateforme anormalement basse (ratio)',
  },
  checkup: {
    cooldown_days: 'Anti-répétition : question récemment vue (jours)',
    qrm_points: 'Barème QRM : 0, 1, 2, 3 discordances et plus',
    interne: 'Voie interne',
    'interne.questions': 'Questions',
    'interne.minutes': 'Durée (minutes)',
    'interne.tolerance': 'Tolérance sur le nombre de questions (dossiers indivisibles)',
    externe_60: 'Voie externe — format 60 minutes',
    'externe_60.blocks': 'Blocs',
    'externe_60.minutes': 'Durée (minutes)',
    externe_120: 'Voie externe — format 120 minutes',
    'externe_120.blocks': 'Blocs',
    'externe_120.minutes': 'Durée (minutes)',
    alerts_60: 'Alertes de temps restant — 60 min (minutes, séparées par des virgules)',
    alerts_120: 'Alertes de temps restant — 120 min (minutes, séparées par des virgules)',
    diversity: 'Diversité',
    'diversity.starred_share': 'Part d’items étoilés visée (0 à 1)',
    'diversity.interne_dp_max_share': 'Part maximale de dossiers progressifs (voie interne, 0 à 1)',
    'diversity.interne_unit_max_questions': 'Dossier non éligible au-delà de N questions (voie interne)',
    sources: 'Sources complémentaires (plafonds, jamais des quotas)',
    'sources.des_transversal_max_share': 'QCM DES + banque transversale : part maximale (0 à 1)',
    'sources.annales_single_year_max': 'Annales d’une seule année : maximum',
    'sources.annales_multi_year_max': 'Annales de plusieurs années : maximum',
    'sources.diversity_boost': 'Facteur de diversité des sources',
    'sources.externe_annale_blocks_60': 'Voie externe 60 min : blocs d’annales maximum',
    'sources.externe_annale_blocks_120': 'Voie externe 120 min : blocs d’annales maximum',
    externe_blocks: 'Blocs de la voie externe',
    'externe_blocks.min_questions': 'Questions minimum par bloc',
    'externe_blocks.max_questions_60': 'Questions maximum par bloc (60 min)',
    'externe_blocks.max_questions_120': 'Questions maximum par bloc (120 min)',
    'externe_blocks.isolated_size_60': 'Bloc de questions isolées (60 min)',
    'externe_blocks.isolated_size_120': 'Bloc de questions isolées (120 min)',
    grace_seconds: 'Tolérance réseau après l’échéance (secondes)',
  },
};

export type SettingsLeaf = { path: string; kind: 'number' | 'boolean' | 'numbers' | 'text'; value: number | boolean | number[] | string; initial: number | boolean | number[] | string };

/** Feuilles d'un objet de réglages (chemin pointé), dans l'ordre de l'objet par défaut. */
export function settingsLeaves(defaults: unknown, current: unknown, prefix = ''): SettingsLeaf[] {
  const out: SettingsLeaf[] = [];
  const d = (defaults ?? {}) as Record<string, unknown>;
  const c = (current ?? {}) as Record<string, unknown>;
  for (const key of Object.keys(d)) {
    const path = prefix ? `${prefix}.${key}` : key;
    const dv = d[key];
    const cv = c[key] ?? dv;
    if (Array.isArray(dv)) out.push({ path, kind: 'numbers', value: Array.isArray(cv) ? (cv as number[]) : (dv as number[]), initial: dv as number[] });
    else if (dv && typeof dv === 'object') out.push(...settingsLeaves(dv, cv, path));
    else if (typeof dv === 'boolean') out.push({ path, kind: 'boolean', value: typeof cv === 'boolean' ? cv : dv, initial: dv });
    else if (typeof dv === 'number') out.push({ path, kind: 'number', value: typeof cv === 'number' ? cv : dv, initial: dv });
    else out.push({ path, kind: 'text', value: String(cv ?? ''), initial: String(dv ?? '') });
  }
  return out;
}

/** Reconstruit l'objet de réglages depuis les feuilles saisies. */
export function settingsFromLeaves(leaves: { path: string; value: unknown }[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const l of leaves) {
    const parts = l.path.split('.');
    let cur = out;
    for (let i = 0; i < parts.length - 1; i++) {
      cur[parts[i]] = (cur[parts[i]] && typeof cur[parts[i]] === 'object' ? cur[parts[i]] : {}) as Record<string, unknown>;
      cur = cur[parts[i]] as Record<string, unknown>;
    }
    cur[parts[parts.length - 1]] = l.value;
  }
  return out;
}

/** Libellé d'un groupe ou d'un paramètre ; à défaut, le chemin technique. */
export function settingsLabel(module: SettingsModule, path: string): string {
  return SETTINGS_LABELS[module][path] ?? path;
}
