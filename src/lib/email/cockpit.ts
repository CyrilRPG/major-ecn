import {
  button, esc, greeting, linkFallback, majorEmail, majorText, pHtml, quote, small, summaryTable,
} from './layout';

/**
 * Gabarits des e-mails du cockpit administrateur et de la messagerie
 * administrative (CDC 08/10/2026, §7, §8, §10). Charte commune Major ECN,
 * aucune icône de réseau social. Chaque lien ouvre le fil exact (C14).
 */

type Mail = { subject: string; html: string; text: string };

const paragraphes = (t: string) =>
  esc(t)
    .split(/\n{2,}/)
    .map((bloc) => `<p style="margin:0 0 12px;">${bloc.replace(/\n/g, '<br>')}</p>`)
    .join('');

const dateLongue = (iso: string) =>
  new Date(iso).toLocaleString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris',
  });

/* ─────────────── Message de l'administration à un enseignant (§7) ─────────────── */

export function messageEnseignantEmail(o: {
  subject: string;
  prenomDestinataire: string;
  expediteur: string;
  sujet: string;
  corps: string;
  lien: string;
  piecesJointes: number;
}): Mail {
  const html = majorEmail({
    subject: o.subject,
    preheader: o.corps.slice(0, 110),
    eyebrow: 'Messagerie Major ECN',
    title: o.sujet,
    intro: pHtml(`<strong>${esc(o.expediteur)}</strong> vous a écrit depuis la messagerie administrative de Major ECN.`),
    bodyHtml: [
      `<div style="font-size:15px;line-height:24px;color:#3D3540;">${paragraphes(o.corps)}</div>`,
      o.piecesJointes > 0 ? small(`${o.piecesJointes} pièce(s) jointe(s) à consulter dans la conversation.`) : '',
      button(o.lien, 'Répondre dans Major ECN'),
      linkFallback(o.lien),
      small('Merci de répondre depuis votre espace Major ECN : votre réponse sera rattachée à cette conversation.'),
    ].join('\n'),
    audience: 'service',
    reason: 'Vous recevez cet e-mail car l’administration de Major ECN vous a adressé un message.',
  });
  const text = majorText([
    o.subject, '',
    `${o.expediteur} vous a écrit depuis la messagerie administrative de Major ECN.`, '',
    o.corps, '',
    `Répondre dans Major ECN : ${o.lien}`,
  ]);
  return { subject: o.subject, html, text };
}

/* ─────────── Copie au propriétaire d'une réponse enseignant (§8, C10, C11) ─────────── */

export function copieReponseEmail(o: {
  subject: string;
  prenomProprietaire: string;
  auteur: string;
  auteurEmail: string | null;
  sujet: string;
  dateIso: string;
  corps: string;
  lien: string;
  tache: string | null;
  piecesJointes: number;
}): Mail {
  const html = majorEmail({
    subject: o.subject,
    preheader: `${o.auteur} : ${o.corps.slice(0, 100)}`,
    eyebrow: 'Messagerie interne — Réponse reçue',
    title: `Réponse de ${o.auteur}`,
    intro: greeting(o.prenomProprietaire) + pHtml('Une réponse vient d’arriver dans votre messagerie Major ECN. En voici la copie complète.'),
    bodyHtml: [
      summaryTable([
        ['De', esc(o.auteur) + (o.auteurEmail ? ` &lt;${esc(o.auteurEmail)}&gt;` : '')],
        ['Sujet', esc(o.sujet)],
        ['Date', esc(dateLongue(o.dateIso))],
        o.tache ? ['Tâche liée', esc(o.tache)] : null,
        o.piecesJointes > 0 ? ['Pièces jointes', `${o.piecesJointes} (dans la conversation)`] : null,
      ]),
      quote(o.corps, { label: 'Texte de la réponse' }),
      button(o.lien, 'Consulter la conversation'),
      linkFallback(o.lien),
      small('La tâche liée est passée à « Réponse reçue » : elle ne sera close qu’après votre validation.'),
    ].join('\n'),
    audience: 'internal',
    reason: 'Copie automatique de chaque réponse reçue dans votre messagerie administrative Major ECN.',
  });
  const text = majorText([
    o.subject, '',
    `De : ${o.auteur}${o.auteurEmail ? ` <${o.auteurEmail}>` : ''}`,
    `Sujet : ${o.sujet}`,
    `Date : ${dateLongue(o.dateIso)}`,
    o.tache ? `Tâche liée : ${o.tache}` : null,
    '', o.corps, '',
    `Consulter la conversation : ${o.lien}`,
  ], { audience: 'internal' });
  return { subject: o.subject, html, text };
}

/* ─────────────── Relance d'un élève ou d'un client (e-mail seul) ─────────────── */

export function relanceClientEmail(o: { subject: string; corps: string }): Mail {
  const html = majorEmail({
    subject: o.subject,
    preheader: o.corps.slice(0, 110),
    eyebrow: 'Major ECN',
    title: o.subject.replace(/^\[MAJOR ECN\]\s*/, ''),
    bodyHtml: `<div style="font-size:15px;line-height:24px;color:#3D3540;">${paragraphes(o.corps)}</div>`,
    audience: 'service',
    reason: 'Vous recevez cet e-mail dans le cadre de votre suivi par l’équipe Major ECN.',
  });
  return { subject: o.subject, html, text: majorText([o.subject, '', o.corps]) };
}

/* ─────────────── Rappel / échéance d'une tâche (§10) ─────────────── */

export function rappelTacheEmail(o: { prenom: string; titre: string; echeance: string | null; lien: string }): Mail {
  const subject = `[MAJOR ECN - COCKPIT] Rappel : ${o.titre}`.slice(0, 250);
  const html = majorEmail({
    subject,
    preheader: o.titre,
    eyebrow: 'Mon cockpit — Rappel',
    title: o.titre,
    intro: greeting(o.prenom) + pHtml('Vous aviez programmé un rappel pour cette tâche.'),
    bodyHtml: [
      o.echeance ? summaryTable([['Échéance', esc(o.echeance)]]) : '',
      button(o.lien, 'Ouvrir la tâche'),
      linkFallback(o.lien),
    ].join('\n'),
    audience: 'internal',
    reason: 'Rappel programmé dans votre cockpit Major ECN (réglable dans les paramètres du cockpit).',
  });
  return { subject, html, text: majorText([subject, '', o.titre, o.echeance ? `Échéance : ${o.echeance}` : null, '', o.lien], { audience: 'internal' }) };
}

/* ─────────────── Tâche ou dossier confié (§3 « attribuer à un collaborateur ») ─────────────── */

export function affectationEmail(o: { prenom: string; auteur: string; titre: string; lien: string }): Mail {
  const subject = `[MAJOR ECN - COCKPIT] ${o.auteur} vous a confié : ${o.titre}`.slice(0, 250);
  const html = majorEmail({
    subject,
    preheader: o.titre,
    eyebrow: 'Mon cockpit — Nouvelle affectation',
    title: o.titre,
    intro: greeting(o.prenom) + pHtml(`<strong>${esc(o.auteur)}</strong> vous a confié ce suivi dans Major ECN.`),
    bodyHtml: [button(o.lien, 'Ouvrir dans Major ECN'), linkFallback(o.lien)].join('\n'),
    audience: 'internal',
    reason: 'Affectation dans le cockpit Major ECN (réglable dans les paramètres du cockpit).',
  });
  return { subject, html, text: majorText([subject, '', o.titre, '', o.lien], { audience: 'internal' }) };
}
