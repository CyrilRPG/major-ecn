import 'server-only';
import { escapeHtml } from './emails';
import { fmtDateLong, fmtDateShort, fmtDateTime, fmtTime } from './format';
import type { Fiche } from './fiche';
import {
  ACTION_LABEL, ACTION_STATUS_LABEL, APPOINTMENT_STATUS_LABEL, CONTACT_TYPE_LABEL, DIFFICULTY_LABEL,
  OFFER_SHORT_LABEL, VOIE_LABEL,
} from './types';

/**
 * Fiche candidat au format HTML imprimable (→ PDF via Chromium, §17). Une
 * fiche = une section ; plusieurs fiches s'enchaînent avec un saut de page.
 */
const e = escapeHtml;

function nameOf(staff: Fiche['staff'], id: string | null): string {
  if (!id) return '—';
  return staff.find((s) => s.id === id)?.name ?? '—';
}

export function ficheSectionHtml(f: Fiche): string {
  const appts = [...f.appointments].sort((a, b) => b.starts_at.localeCompare(a.starts_at));
  const rows = appts.map((a) => `<tr><td>${e(fmtDateTime(a.starts_at))}</td><td>${e(APPOINTMENT_STATUS_LABEL[a.status] ?? a.status)}</td><td>${e(nameOf(f.staff, a.staff_user_id))}</td></tr>`).join('');

  const reports = f.reports.map((r) => {
    const diffs = r.difficulties.map((d) =>
      `<li><strong>${e(DIFFICULTY_LABEL[d.category] ?? d.category)}</strong>${d.no_action ? ' <em>(constat sans action)</em>' : ''}${d.details ? ` — ${e(d.details)}` : ''}</li>`).join('');
    const acts = r.actions.map((a) => {
      const linked = a.difficulty_id ? r.difficulties.find((d) => d.id === a.difficulty_id) : null;
      return `<li><strong>${e(ACTION_LABEL[a.category] ?? a.category)}</strong> — ${e(ACTION_STATUS_LABEL[a.status] ?? a.status)}` +
        `${a.due_date ? `, échéance ${e(fmtDateShort(`${a.due_date}T12:00:00Z`))}` : ''}` +
        `${a.owner_id ? `, responsable ${e(nameOf(f.staff, a.owner_id))}` : ''}` +
        `${linked ? ` <em>(liée à : ${e(DIFFICULTY_LABEL[linked.category])})</em>` : ''}` +
        `${a.comment ? `<br><span class="muted">${e(a.comment)}</span>` : ''}</li>`;
    }).join('');
    return `<section class="report">
      <h3>${e(fmtDateLong(r.occurred_at))} à ${e(fmtTime(r.occurred_at))} · ${e(CONTACT_TYPE_LABEL[r.contact_type] ?? r.contact_type)} · ${e(nameOf(f.staff, r.author_id))}</h3>
      ${r.summary ? `<p>${e(r.summary).replace(/\n/g, '<br>')}</p>` : ''}
      ${diffs ? `<h4>Difficultés</h4><ul>${diffs}</ul>` : ''}
      ${acts ? `<h4>Actions décidées</h4><ul>${acts}</ul>` : ''}
      ${r.next_step ? `<p><strong>Prochaine étape :</strong> ${e(r.next_step)}</p>` : ''}
      ${r.internal_notes ? `<div class="internal"><strong>Notes internes</strong><br>${e(r.internal_notes).replace(/\n/g, '<br>')}</div>` : ''}
    </section>`;
  }).join('');

  const legacy = f.legacyNotes.map((n) =>
    `<section class="report legacy"><h3>${e(fmtDateTime(n.created_at))} · ${e(n.contact_type)} · ${e(n.motif)}</h3>` +
    `${n.observations ? `<p>${e(n.observations)}</p>` : ''}${n.difficultes ? `<p><strong>Difficultés :</strong> ${e(n.difficultes)}</p>` : ''}` +
    `${n.actions_recommandees ? `<p><strong>Actions recommandées :</strong> ${e(n.actions_recommandees)}</p>` : ''}</section>`).join('');

  const open = f.openActions.map((a) => `<li>${e(ACTION_LABEL[a.category])} — ${e(ACTION_STATUS_LABEL[a.status])}${a.due_date ? `, échéance ${e(fmtDateShort(`${a.due_date}T12:00:00Z`))}` : ''}${a.comment ? ` : ${e(a.comment)}` : ''}</li>`).join('');

  return `<article class="fiche">
    <header>
      <div class="brand">Major ECN · Suivi individuel</div>
      <h1>${e(f.name)}</h1>
      <p class="meta">${e(f.student.email ?? '')}${f.student.phone ? ` · ${e(f.student.phone)}` : ''}</p>
      <p class="meta">${e(f.specialty || 'Spécialité non renseignée')} · ${e(OFFER_SHORT_LABEL[f.offer] ?? f.offer)}${f.voie ? ` · ${e(VOIE_LABEL[f.voie] ?? f.voie)}` : ''}</p>
      <p class="meta">Dernière connexion : ${e(fmtDateTime(f.lastSignIn))}${f.activity ? ` · Vidéos ${f.activity.videos_watched} · Fiches ${f.activity.fiches_read} · QCM ${f.activity.qcm_done} · Flashcards ${f.activity.flashcards_done}` : ''}</p>
    </header>
    <h2>Rendez-vous (${appts.length})</h2>
    ${rows ? `<table><thead><tr><th>Date</th><th>Statut</th><th>Intervenant</th></tr></thead><tbody>${rows}</tbody></table>` : '<p class="muted">Aucun rendez-vous.</p>'}
    ${open ? `<h2>Actions ouvertes</h2><ul>${open}</ul>` : ''}
    <h2>Comptes rendus (${f.reports.length})</h2>
    ${reports || '<p class="muted">Aucun compte rendu.</p>'}
    ${legacy ? `<h2>Notes CRM antérieures</h2>${legacy}` : ''}
    <footer>Document généré le ${e(fmtDateTime(new Date()))} — usage interne, données personnelles.</footer>
  </article>`;
}

export function fichesDocumentHtml(fiches: Fiche[]): string {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Fiches candidats</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; color: #1A2233; font-size: 11.5px; margin: 0; }
    .fiche { page-break-after: always; padding: 4mm 0; }
    .fiche:last-child { page-break-after: auto; }
    header { border-bottom: 3px solid #C0112E; padding-bottom: 8px; margin-bottom: 14px; }
    .brand { color: #C0112E; font-weight: 700; font-size: 11px; letter-spacing: .08em; text-transform: uppercase; }
    h1 { margin: 6px 0 4px; font-size: 22px; color: #14254E; }
    h2 { margin: 18px 0 8px; font-size: 14px; color: #14254E; border-bottom: 1px solid #DDE1E7; padding-bottom: 4px; }
    h3 { margin: 0 0 6px; font-size: 12px; color: #14254E; }
    h4 { margin: 8px 0 4px; font-size: 11px; text-transform: uppercase; letter-spacing: .05em; color: #6B7280; }
    .meta, .muted { color: #6B7280; margin: 2px 0; }
    table { width: 100%; border-collapse: collapse; margin: 6px 0; }
    th, td { text-align: left; padding: 5px 6px; border-bottom: 1px solid #ECEEF1; }
    th { font-size: 10px; text-transform: uppercase; color: #6B7280; }
    .report { border: 1px solid #E6E8EE; border-radius: 8px; padding: 10px 12px; margin: 8px 0; page-break-inside: avoid; }
    .report.legacy { background: #FAFAFB; }
    .internal { margin-top: 8px; padding: 8px; background: #FFF4E5; border-left: 3px solid #F59E0B; }
    ul { margin: 4px 0; padding-left: 18px; }
    li { margin: 3px 0; }
    footer { margin-top: 20px; font-size: 9.5px; color: #9AA1AE; }
  </style></head><body>${fiches.map(ficheSectionHtml).join('')}</body></html>`;
}
