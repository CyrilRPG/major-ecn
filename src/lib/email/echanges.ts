import {
  button, esc, greeting, linkFallback, majorEmail, majorText, pHtml, quote, small, summaryTable,
} from './layout';

/**
 * Gabarits des e-mails du module Échanges (CDC §22-24, §49, §129-130) et du
 * centre de notifications. Charte commune Major ECN, aucune icône de réseau
 * social. Le lien « Répondre » ouvre la question elle-même, jamais le tableau
 * de bord (§23).
 */

type Mail = { subject: string; html: string; text: string };

const apercu = (t: string, n = 420) => (t.length > n ? `${t.slice(0, n - 1)}…` : t);

/* ───────────────────────── Enseignant tagué (§22) ───────────────────────── */

export function questionAdresseeEmail(o: {
  prenomEnseignant: string;
  formation: string | null;
  promotion: string | null;
  groupe: string;
  eleve: string;
  question: string;
  contexte: string | null;
  lien: string;
}): Mail {
  const subject = 'Major ECN — Une question vous a été adressée';
  const html = majorEmail({
    subject,
    preheader: `${o.groupe} : ${apercu(o.question, 90)}`,
    eyebrow: 'Échanges — Question adressée',
    title: 'Une question vous a été adressée',
    intro: greeting(o.prenomEnseignant) + pHtml(`Une question vient de vous être adressée par un candidat (<strong>${esc(o.eleve)}</strong>).`),
    bodyHtml: [
      summaryTable([
        o.formation ? ['Formation', esc(o.formation)] : null,
        o.promotion ? ['Promotion', esc(o.promotion)] : null,
        ['Groupe', esc(o.groupe)],
        o.contexte ? ['Contenu concerné', esc(o.contexte)] : null,
      ]),
      quote(apercu(o.question), { label: 'Aperçu de la question' }),
      button(o.lien, 'Répondre à la question'),
      linkFallback(o.lien),
      small('Seul un tag explicite vous adresse une question : les autres messages du groupe ne vous envoient jamais d’e-mail. Sans réponse, un rappel vous sera adressé après le délai prévu.'),
    ].join('\n'),
    reason: 'Vous recevez cet e-mail car un candidat vous a tagué dans un groupe d’échanges Major ECN.',
  });
  const text = majorText([
    subject, '',
    `Bonjour ${o.prenomEnseignant},`,
    `Une question vient de vous être adressée par un candidat (${o.eleve}).`,
    o.formation ? `Formation : ${o.formation}` : null,
    o.promotion ? `Promotion : ${o.promotion}` : null,
    `Groupe : ${o.groupe}`,
    o.contexte ? `Contenu concerné : ${o.contexte}` : null,
    '', apercu(o.question), '',
    `Répondre à la question : ${o.lien}`,
  ]);
  return { subject, html, text };
}

/* ───────────────────────── Relance H+12 (§24) ───────────────────────── */

export function questionEnAttenteEmail(o: {
  prenomEnseignant: string;
  heures: number;
  groupe: string;
  promotion: string | null;
  question: string;
  lien: string;
}): Mail {
  const subject = 'Major ECN — Une question est toujours en attente';
  const html = majorEmail({
    subject,
    preheader: `Question en attente depuis ${o.heures} heures — ${o.groupe}`,
    eyebrow: 'Échanges — Rappel',
    title: 'Une question est toujours en attente',
    intro: greeting(o.prenomEnseignant) + pHtml(`Une question qui vous a été adressée il y a ${o.heures} heures n’a pas encore reçu de réponse.`),
    bodyHtml: [
      summaryTable([['Groupe', esc(o.groupe)], o.promotion ? ['Promotion', esc(o.promotion)] : null]),
      quote(apercu(o.question), { label: 'Question' }),
      button(o.lien, 'Répondre'),
      linkFallback(o.lien),
      small('Ce rappel est unique : vous ne recevrez pas d’autre relance pour cette question.'),
    ].join('\n'),
    reason: 'Vous recevez cet e-mail car une question qui vous a été adressée attend votre réponse.',
  });
  const text = majorText([
    subject, '', `Bonjour ${o.prenomEnseignant},`,
    `Une question qui vous a été adressée il y a ${o.heures} heures n’a pas encore reçu de réponse.`,
    `Groupe : ${o.groupe}`, '', apercu(o.question), '', `Répondre : ${o.lien}`,
  ]);
  return { subject, html, text };
}

/* ────────────────── Alertes internes à l'équipe Major ECN ────────────────── */

export function alerteInterneEmail(o: { sujet: string; titre: string; lignes: [string, string][]; texte?: string | null; lien: string; bouton: string }): Mail {
  const html = majorEmail({
    subject: o.sujet,
    audience: 'internal',
    preheader: o.titre,
    eyebrow: 'Échanges — Supervision',
    title: o.titre,
    bodyHtml: [
      summaryTable(o.lignes.map(([a, b]) => [a, esc(b)] as [string, string])),
      o.texte ? quote(apercu(o.texte)) : '',
      button(o.lien, o.bouton),
    ].join('\n'),
  });
  const text = majorText([o.titre, '', ...o.lignes.map(([a, b]) => `${a} : ${b}`), '', o.texte ? apercu(o.texte) : null, '', `${o.bouton} : ${o.lien}`], { audience: 'internal' });
  return { subject: o.sujet, html, text };
}

/* ─────────────────────── Avertissement d'un candidat (§49) ─────────────────────── */

export function messageModerationEmail(o: { prenom: string | null; titre: string; message: string; lien: string }): Mail {
  const subject = `Major ECN — ${o.titre}`;
  const html = majorEmail({
    subject,
    preheader: apercu(o.message, 100),
    eyebrow: 'Échanges',
    title: o.titre,
    intro: greeting(o.prenom),
    bodyHtml: [pHtml(esc(o.message).replace(/\n/g, '<br>')), button(o.lien, 'Ouvrir les échanges')].join('\n'),
    reason: 'Cet e-mail de service concerne votre participation aux échanges Major ECN.',
  });
  const text = majorText([subject, '', o.prenom ? `Bonjour ${o.prenom},` : 'Bonjour,', '', o.message, '', o.lien]);
  return { subject, html, text };
}

/* ───────────────────────── Annonce importante ───────────────────────── */

export function annonceImportanteEmail(o: { prenom: string | null; groupe: string; message: string; lien: string }): Mail {
  const subject = `Major ECN — Annonce importante : ${o.groupe}`;
  const html = majorEmail({
    subject,
    preheader: apercu(o.message, 100),
    eyebrow: 'Annonces Major ECN',
    title: 'Annonce importante',
    intro: greeting(o.prenom) + pHtml(`Major ECN a publié une annonce importante dans <strong>${esc(o.groupe)}</strong>.`),
    bodyHtml: [quote(apercu(o.message, 1200), { tone: 'brand' }), button(o.lien, 'Lire l’annonce')].join('\n'),
    reason: 'Vous recevez cet e-mail car Major ECN a marqué cette annonce comme importante pour votre promotion.',
  });
  const text = majorText([subject, '', o.prenom ? `Bonjour ${o.prenom},` : 'Bonjour,', '', apercu(o.message, 1200), '', `Lire l’annonce : ${o.lien}`]);
  return { subject, html, text };
}

/* ─────────────────────── Centre de notifications ─────────────────────── */

export type ElementNotif = { titre: string; corps: string | null; lien: string | null; categorie: string };

export function notificationImmediateEmail(o: { prenom: string | null; element: ElementNotif; reglages: string }): Mail {
  const subject = `Major ECN — ${o.element.titre}`;
  const html = majorEmail({
    subject,
    preheader: o.element.corps ?? o.element.titre,
    eyebrow: o.element.categorie,
    title: o.element.titre,
    intro: greeting(o.prenom),
    bodyHtml: [
      o.element.corps ? pHtml(esc(o.element.corps)) : '',
      o.element.lien ? button(o.element.lien, 'Ouvrir') : '',
      small(`Vous pouvez choisir les alertes reçues par e-mail dans <a href="${esc(o.reglages)}">Mes notifications</a>.`),
    ].join('\n'),
    reason: 'Vous recevez cet e-mail selon vos préférences de notification Major ECN.',
  });
  const text = majorText([o.element.titre, '', o.element.corps, o.element.lien ? `Ouvrir : ${o.element.lien}` : null, '', `Mes notifications : ${o.reglages}`]);
  return { subject, html, text };
}

export function recapitulatifEmail(o: { prenom: string | null; elements: ElementNotif[]; reglages: string }): Mail {
  const n = o.elements.length;
  const subject = `Major ECN — Votre récapitulatif du jour (${n} nouveauté${n > 1 ? 's' : ''})`;
  const parCategorie = new Map<string, ElementNotif[]>();
  for (const e of o.elements) parCategorie.set(e.categorie, [...(parCategorie.get(e.categorie) ?? []), e]);
  const blocs = [...parCategorie.entries()].map(([cat, els]) => {
    const lignes = els.map((e) => `<li style="margin:0 0 8px;">${e.lien ? `<a href="${esc(e.lien)}" style="color:#7A1F3D;font-weight:600;text-decoration:none;">${esc(e.titre)}</a>` : `<strong>${esc(e.titre)}</strong>`}${e.corps ? `<br><span style="color:#6B6168;">${esc(apercu(e.corps, 180))}</span>` : ''}</li>`).join('');
    return `<p style="margin:18px 0 8px;font-weight:700;color:#1A2233;">${esc(cat)}</p><ul style="margin:0;padding-left:18px;">${lignes}</ul>`;
  }).join('');
  const html = majorEmail({
    subject,
    preheader: o.elements.slice(0, 3).map((e) => e.titre).join(' · '),
    eyebrow: 'Récapitulatif',
    title: 'Ce qui a changé aujourd’hui',
    intro: greeting(o.prenom),
    bodyHtml: [
      blocs,
      small(`Vous recevez ce récapitulatif selon vos choix. Modifiez-les dans <a href="${esc(o.reglages)}">Mes notifications</a>.`),
    ].join('\n'),
    reason: 'Vous recevez ce récapitulatif selon vos préférences de notification Major ECN.',
  });
  const text = majorText([
    subject, '',
    ...[...parCategorie.entries()].flatMap(([cat, els]) => [cat, ...els.map((e) => `• ${e.titre}${e.lien ? ` — ${e.lien}` : ''}`), '']),
    `Mes notifications : ${o.reglages}`,
  ]);
  return { subject, html, text };
}
