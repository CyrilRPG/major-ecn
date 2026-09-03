/* AUTO-GÉNÉRÉ depuis src/lib/fiches/template/styles.css — ne pas éditer à la main.
 * Miroir de la charte du générateur major-ecn-fiche (assets/templates/styles.css).
 * Exporté en string pour être dispo côté client (aperçu/éditeur) ET serveur. */

export const FICHE_CSS_RAW = `/* ════════════════════════════════════════════════════════════════════════════
   MAJOR ECN — Charte « médicale sobre »
   Feuille de style des fiches (WeasyPrint / HTML → PDF, format A4 portrait)

   Palette : bleu nuit (structure) + bordeaux feutré (accent) + ocre doux,
   trois tons profonds et peu saturés qui s'harmonisent sans détonner.
   ════════════════════════════════════════════════════════════════════════════ */

/* ── Polices embarquées (assets/fonts/) ─────────────────────────────────────
   base_url = dossier assets ; repli automatique si un fichier est absent.   */
@font-face {
  font-family: "Playfair Display";
  src: url("fonts/PlayfairDisplay-Regular.ttf");
  font-weight: 400;
}
@font-face {
  font-family: "Playfair Display";
  src: url("fonts/PlayfairDisplay-Bold.ttf");
  font-weight: 700;
}
@font-face {
  font-family: "Playfair Display";
  src: url("fonts/PlayfairDisplay-Italic.ttf");
  font-style: italic;
}
@font-face {
  font-family: "Cormorant Garamond";
  src: url("fonts/CormorantGaramond-Regular.ttf");
  font-weight: 400;
}
@font-face {
  font-family: "Cormorant Garamond";
  src: url("fonts/CormorantGaramond-SemiBold.ttf");
  font-weight: 600;
}
@font-face {
  font-family: "Cormorant Garamond";
  src: url("fonts/CormorantGaramond-Italic.ttf");
  font-style: italic;
}
@font-face {
  font-family: "Inter";
  src: url("fonts/Inter-Regular.ttf");
  font-weight: 400;
}
@font-face {
  font-family: "Inter";
  src: url("fonts/Inter-Medium.ttf");
  font-weight: 500;
}
@font-face {
  font-family: "Inter";
  src: url("fonts/Inter-SemiBold.ttf");
  font-weight: 600;
}
@font-face {
  font-family: "Inter";
  src: url("fonts/Inter-Bold.ttf");
  font-weight: 700;
}
@font-face {
  font-family: "Inter";
  src: url("fonts/Inter-Italic.ttf");
  font-style: italic;
}
@font-face {
  font-family: "JetBrains Mono";
  src: url("fonts/JetBrainsMono-Regular.ttf");
}

/* ── Variables de charte ──────────────────────────────────────────────────── */
:root {
  --navy: #1C2E49;        /* Bleu nuit — bannières, en-têtes, structure */
  --navy-deep: #131F33;   /* Bleu nuit profond — bande de couverture */
  --burgundy: #8C2F39;    /* Bordeaux feutré — mots-clés, piège, marqueur ⚠ */
  --gold: #B5934A;        /* Ocre doux — liseré fin, marqueur ★ */
  --mist: #EEF0F3;        /* Gris clair froid — surfaces */
  --line: #D3D9E2;        /* Gris très clair — filets discrets */
  --anthracite: #1F2A38;  /* Encre — corps de texte */
  --pearl: #8E99A8;       /* Gris perle — texte secondaire */
  --paper: #FFFFFF;       /* Blanc — fond de page */
  --serif: "Playfair Display", "Times New Roman", serif;
  --serif-soft: "Cormorant Garamond", "Times New Roman", serif;
  --sans: "Inter", "Helvetica", "Arial", sans-serif;
  --mono: "JetBrains Mono", "Courier New", monospace;
}

/* ── Mise en page : A4, en-tête, pied de page ─────────────────────────────── */
@page {
  size: A4;
  margin: 24mm 18mm 22mm 18mm;
  background: var(--paper);
  border-top: 0.7pt solid var(--navy);

  @top-left {
    content: string(course-name);
    font-family: var(--sans);
    font-size: 8pt;
    color: var(--pearl);
    vertical-align: bottom;
    padding-bottom: 2.4mm;
  }
  @top-right {
    content: string(section-courante);
    font-family: var(--sans);
    font-size: 8pt;
    font-style: italic;
    color: var(--navy);
    vertical-align: bottom;
    padding-bottom: 2.4mm;
  }
  @bottom-center {
    content: string(footer-text);
    font-family: var(--sans);
    font-size: 7.6pt;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--pearl);
    vertical-align: middle;
  }
  @bottom-right {
    content: counter(page) "/" counter(pages);
    font-family: var(--sans);
    font-size: 8pt;
    font-weight: 700;
    color: #fff;
    background: var(--navy);
    border-radius: 2.4mm;
    height: 7mm;
    width: 16mm;
    text-align: center;
    vertical-align: middle;
  }
}

/* La page de garde n'a ni marge, ni en-tête, ni pied de page. */
@page :first {
  margin: 0;
  border: none;
  @top-left { content: none; }
  @top-right { content: none; }
  @bottom-center { content: none; }
  @bottom-right { content: none; }
}

/* ── Réinitialisation & base ──────────────────────────────────────────────── */
* { margin: 0; padding: 0; box-sizing: border-box; }

html, body {
  font-family: var(--sans);
  font-size: 10.4pt;
  line-height: 1.5;
  color: var(--anthracite);
}

/* Sources des chaînes dynamiques (hors flux visible). */
.string-source {
  position: absolute;
  top: 0;
  left: -300mm;
  font-size: 1pt;
  color: transparent;
}
.string-source--cours { string-set: course-name content(); }
.string-source--footer { string-set: footer-text content(); }
/* Section courante affichée dans l'en-tête de page. */
.partie-banner-title, .eclair-title {
  string-set: section-courante content();
}

.page { break-before: page; }

/* Aucun bloc (ligne de tableau, encadré-réflexe, figure…) ne se coupe entre
   deux pages : il est déplacé entier sur la page suivante si besoin. */
tr { break-inside: avoid; }

/* Le corps s'écoule en continu : une bannière a toujours du contenu autour
   d'elle (jamais de page réduite à un seul en-tête). Seule la 1re grande
   partie ouvre une nouvelle page, après la page de garde. */
.partie-page { margin-top: 9mm; }
.partie-page--first { break-before: page; margin-top: 0; }

/* Signets PDF (plan de navigation). */
.partie-banner-title { bookmark-level: 1; }
.ft-subtitle-text { bookmark-level: 2; }
/* Les en-têtes de tableau sont répétés à chaque page : un seul signet par
   partie / sous-partie (le 1er), pas un par occurrence répétée. */
.partie-banner-title--repeat { bookmark-level: none; }

/* Filigrane : logo gris très clair (transparence intégrée à l'image),
   répété au centre de chaque page. En position fixe, il se répète sur
   toutes les pages ; la page de garde, opaque et de z-index supérieur,
   le recouvre entièrement. */
.page-watermark {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
}
.page-watermark img {
  display: block;
  width: 156mm;
}

/* ════════════════════════════════════════════════════════════════════════════
   1. PAGE DE GARDE
   ════════════════════════════════════════════════════════════════════════════ */
.cover {
  position: relative;
  z-index: 2;
  width: 210mm;
  height: 297mm;
  background: var(--paper);
  overflow: hidden;
}
.cover-band {
  position: absolute;
  top: 0;
  left: 0;
  width: 13mm;
  height: 297mm;
  background: var(--navy-deep);
}
.cover-content {
  position: absolute;
  top: 0;
  left: 13mm;
  right: 0;
  bottom: 0;
  padding: 30mm 24mm 24mm 26mm;
}

/* ── Identité du cours ── */
.cover-head {
  padding-bottom: 9mm;
  border-bottom: 0.8pt solid var(--line);
}
.cover-logo {
  float: right;
  width: 43mm;
  margin: 1mm -2mm 6mm 12mm;
}
.cover-matiere {
  font-family: var(--sans);
  font-size: 12pt;
  font-weight: 600;
  letter-spacing: 0.34em;
  text-transform: uppercase;
  color: var(--gold);
}
.cover-title {
  font-family: var(--serif);
  font-weight: 700;
  font-size: 38pt;
  line-height: 1.08;
  color: var(--navy);
  margin-top: 6mm;
}
.cover-year {
  font-family: var(--serif-soft);
  font-style: italic;
  font-size: 15pt;
  color: var(--pearl);
  margin-top: 4.5mm;
}
.cover-item {
  font-family: var(--sans);
  font-size: 9pt;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--pearl);
  margin-top: 3mm;
}

/* Étiquette de section (Plan / Légende). */
.cover-section-label {
  font-family: var(--sans);
  font-size: 9pt;
  font-weight: 700;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--navy);
}

/* ── Plan : grandes parties uniquement ── */
.cover-plan {
  clear: both;
  margin-top: 13mm;
}
.cover-plan-list {
  list-style: none;
  margin-top: 4mm;
}
.cover-plan-item { break-inside: avoid; }
.cover-plan-link {
  display: block;
  text-decoration: none;
  color: inherit;
  padding: 3.3mm 1mm;
  border-bottom: 0.5pt solid var(--line);
}
.cover-plan-num {
  display: inline-block;
  width: 15mm;
  font-family: var(--serif);
  font-weight: 700;
  font-size: 14.5pt;
  color: var(--gold);
}
.cover-plan-text {
  font-family: var(--serif-soft);
  font-weight: 600;
  font-size: 13.5pt;
  color: var(--anthracite);
}

/* ── Légende des marqueurs ── */
.cover-legend {
  position: absolute;
  left: 26mm;
  right: 24mm;
  bottom: 24mm;
  padding-top: 6mm;
  border-top: 0.8pt solid var(--line);
}
.cover-legend-items { margin-top: 3mm; }
.cover-legend-item { margin-right: 9mm; }
.cover-legend-sym {
  font-weight: 700;
  font-size: 11pt;
  margin-right: 1.6mm;
}
.cover-legend-sym--1 { color: var(--gold); }
.cover-legend-sym--2 { color: var(--navy); }
.cover-legend-sym--3 { color: var(--burgundy); }
.cover-legend-text {
  font-family: var(--sans);
  font-size: 9pt;
  color: var(--anthracite);
}

/* ════════════════════════════════════════════════════════════════════════════
   2. CORPS DE LA FICHE
   ════════════════════════════════════════════════════════════════════════════ */
.partie-banner {
  background: var(--navy);
  color: #fff;
  padding: 4.6mm 7mm;
  margin-bottom: 6mm;
  border-radius: 1.4mm;
  break-after: avoid;
  break-inside: avoid;
}
.partie-banner-num {
  font-family: var(--serif);
  font-weight: 700;
  font-size: 21pt;
  color: var(--gold);
  padding-right: 5mm;
  margin-right: 5mm;
  border-right: 0.8pt solid rgba(255, 255, 255, 0.4);
}
.partie-banner-title {
  font-family: var(--serif);
  font-weight: 700;
  font-size: 17pt;
}
.partie-banner--plain .partie-banner-title { padding-left: 1mm; }

/* ── Tableaux de fiche : concept (gauche) + détail exhaustif (droite) ─────── */
.fiche-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  margin: 5mm 0;
  font-size: 9.7pt;
}
.ft-col-concept { width: 27%; }
.ft-col-detail { width: 73%; }

.fiche-table th { break-inside: avoid; }

/* Bannière de grande partie : 1re ligne du 1er tableau (jamais isolée). */
.ft-banner-row td {
  background: var(--navy);
  color: #fff;
  padding: 4.4mm 6mm;
  border: 0.5pt solid var(--navy);
}

/* En-tête : étiquette de partie + titre de sous-partie. */
.ft-tag {
  background: var(--navy);
  color: #fff;
  font-family: var(--serif-soft);
  font-style: italic;
  font-weight: 700;
  font-size: 12pt;
  text-align: center;
  vertical-align: middle;
  padding: 2.6mm 2mm;
  border: 0.5pt solid var(--navy);
}
.ft-subtitle {
  background: #E7EBF1;
  color: var(--navy);
  font-family: var(--serif);
  font-weight: 700;
  font-size: 12.5pt;
  text-align: center;
  vertical-align: middle;
  padding: 2.8mm 4mm;
  border: 0.5pt solid var(--line);
}

/* Corps : colonne concept (gauche) + colonne détail (droite). */
.ft-concept {
  background: var(--mist);
  font-family: var(--sans);
  font-weight: 700;
  font-size: 10pt;
  color: var(--anthracite);
  text-align: center;
  vertical-align: middle;
  padding: 2.8mm 3mm;
  border: 0.5pt solid var(--pearl);
}
.ft-detail {
  background: #fff;
  vertical-align: top;
  padding: 2.4mm 4mm;
  border: 0.5pt solid var(--pearl);
}
.ft-detail.content { margin: 0; }
.ft-detail > :first-child { margin-top: 0; }
.ft-detail > :last-child { margin-bottom: 0; }
.ft-detail ul, .ft-detail ol { margin: 1mm 0 1mm 2mm; padding-left: 3mm; }
.ft-detail li { margin: 0.8mm 0; }
.ft-detail table { margin: 2.4mm 0; font-size: 9pt; }

/* Lignes-réflexe (à retenir / piège / mnémo), pleine largeur. */
.ft-reflexe td {
  border: 0.5pt solid var(--pearl);
  border-left: 2.4mm solid var(--pearl);
  padding: 2.6mm 4mm;
  vertical-align: top;
}
.ft-reflexe--a_retenir td { border-left-color: var(--navy); background: var(--mist); }
.ft-reflexe--piege td { border-left-color: var(--burgundy); background: #F5E9EA; }
.ft-reflexe--mnemo td { border-left-color: var(--gold); background: #F6F1E4; }
.ft-reflexe-label {
  display: block;
  margin-bottom: 1mm;
  font-family: var(--sans);
  font-weight: 700;
  font-size: 8.4pt;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.ft-reflexe--a_retenir .ft-reflexe-label { color: var(--navy); }
.ft-reflexe--piege .ft-reflexe-label { color: var(--burgundy); }
.ft-reflexe--mnemo .ft-reflexe-label { color: #8A6D2E; }
.ft-reflexe-body { display: block; }
.ft-reflexe-body > :first-child { margin-top: 0; }
.ft-reflexe-body > :last-child { margin-bottom: 0; }
.ft-reflexe-body ul { margin: 0.5mm 0 0.5mm 2mm; padding-left: 3mm; }

/* Marqueurs de légende insérés dans le contenu. */
.fmark { font-weight: 700; }
.fmark.m-ecn { color: var(--gold); }
.fmark.m-yield { color: var(--navy); }
.fmark.m-trap { color: var(--burgundy); }

/* ── Typographie du contenu ──────────────────────────────────────────────── */
.content { margin: 3mm 0; }
.content p { margin: 2mm 0; }
.content strong { color: var(--burgundy); font-weight: 700; }
.content em { color: var(--anthracite); }
.content h1, .content h2, .content h3, .content h4 {
  font-family: var(--serif-soft);
  font-weight: 600;
  color: var(--anthracite);
  margin: 4mm 0 2mm 0;
}
.content h4 { font-size: 11.5pt; }

.content ul, .content ol {
  margin: 2mm 0 2mm 5mm;
  padding-left: 3mm;
}
.content li { margin: 1.3mm 0; }
/* Puces par défaut : niveau 1 = disque plein, niveau 2+ = cercle creux
   (contour, intérieur blanc). Jamais de carré (on force « circle » au-delà
   du niveau 2). Marqueur en bleu nuit ≈ noir. */
.content ul { list-style-type: disc; }
.content ul ul { list-style-type: circle; }
.content ul ul ul { list-style-type: circle; }
.content li::marker { color: var(--navy); }

.content a { color: var(--navy); text-decoration: none; }
.content code {
  font-family: var(--mono);
  font-size: 9pt;
  background: var(--mist);
  padding: 0.3mm 1mm;
  border-radius: 0.8mm;
}

/* ── Tableaux (corps) ────────────────────────────────────────────────────── */
table {
  border-collapse: collapse;
  width: 100%;
  margin: 4mm 0;
  font-size: 9.4pt;
  break-inside: avoid;
}
th, td {
  border: 0.5pt solid var(--pearl);
  padding: 2mm 2.8mm;
  text-align: left;
  vertical-align: top;
}
th {
  background: var(--mist);
  font-family: var(--sans);
  font-weight: 700;
  color: var(--anthracite);
}
tbody tr:nth-child(even) { background: #F5F6F8; }
td:first-child strong { color: var(--navy); }
thead { display: table-header-group; }

/* ════════════════════════════════════════════════════════════════════════════
   3. FIGURES & IMAGES (intégrées dans la cellule d'une ligne de tableau)
   ════════════════════════════════════════════════════════════════════════════ */
/* La figure est dans la cellule de la dernière ligne : jamais seule, jamais
   coupée (la ligne entière, indivisible, se déplace si besoin). */
.ft-figure {
  margin: 2mm 0;
  text-align: center;
}
.ft-figure img {
  max-width: 100%;
  border: 0.8pt solid var(--line);
  padding: 1.4mm;
  background: #fff;
}

/* Petites figures (max(w, h) < 900 px) : flottent à droite (3ᵉ colonne),
   le texte de la cellule s'écoule à leur gauche et remplit l'espace. */
.ft-figure--small {
  float: right;
  width: 50mm;
  margin: 0.5mm 0 2.5mm 5mm;
}
.ft-figure--small img { max-height: 58mm; }

/* Grandes figures : pleine largeur, sous le texte (jamais flottées). */
.ft-figure--large {
  clear: both;
  width: 100%;
  margin: 3.5mm 0 1mm 0;
}
.ft-figure--large img { max-height: 95mm; }

/* Les images textuelles sont placées dans une ligne colspan=2 dédiée. */
.fiche-table .ft-image-row {
  background: #fff;
  break-inside: avoid;
  page-break-inside: avoid;
}
.fiche-table .ft-image-row > td { padding: 2mm 3mm 4mm; border-top: 0; }
.fiche-table .ft-image-row .ft-figure--large { width: 100%; margin: 0; }
.fiche-table .ft-image-row .ft-figure--large img {
  max-width: 100% !important;
  max-height: 150mm !important;
}

/* ════════════════════════════════════════════════════════════════════════════
   4. SYNTHÈSE & CHIFFRES-CLÉS
   ════════════════════════════════════════════════════════════════════════════ */
.synthese-bloc {
  margin: 6mm 0;
  break-inside: avoid;
}
.synthese-titre {
  font-family: var(--serif-soft);
  font-weight: 600;
  font-size: 13pt;
  color: var(--navy);
  margin-bottom: 1.6mm;
}
.table-synthese th {
  background: var(--navy);
  color: #fff;
  border-color: var(--navy);
}
.table-synthese tbody tr:nth-child(odd) { background: #fff; }
.table-synthese tbody tr:nth-child(even) { background: var(--mist); }

.table-chiffres th {
  background: #8A6D2E;
  border-color: #8A6D2E;
}
.table-chiffres td:first-child { font-weight: 700; }
.table-chiffres td:first-child strong { color: var(--anthracite); }

/* ════════════════════════════════════════════════════════════════════════════
   5. FICHE ÉCLAIR
   ════════════════════════════════════════════════════════════════════════════ */
/* Fiche éclair : mise en page compacte tenant sur une seule page. */
.eclair-card {
  background: var(--mist);
  border-top: 2.2pt solid var(--navy);
  padding: 6mm 11mm 7mm 11mm;
  margin-top: 2mm;
}
.eclair-eyebrow {
  text-align: center;
  font-family: var(--sans);
  font-size: 8.5pt;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--gold);
}
.eclair-title {
  text-align: center;
  font-family: var(--serif);
  font-weight: 700;
  font-size: 21pt;
  color: var(--anthracite);
  margin-top: 1.4mm;
}
.eclair-sub {
  text-align: center;
  font-family: var(--serif-soft);
  font-style: italic;
  font-size: 12pt;
  color: var(--navy);
  margin-top: 0.6mm;
}
.eclair-rule {
  width: 38mm;
  height: 0.8pt;
  background: var(--gold);
  margin: 3.4mm auto 4mm auto;
}
.eclair-body { font-size: 9.3pt; line-height: 1.4; }
.eclair-body p { margin: 1.6mm 0; }
.eclair-body strong { color: var(--burgundy); }
.eclair-body ul { margin: 1mm 0 1mm 4mm; padding-left: 3mm; }
.eclair-body li { margin: 0.6mm 0; }
.eclair-body li::marker { color: var(--navy); }
.eclair-points-titre {
  font-family: var(--serif-soft);
  font-weight: 700;
  font-size: 11.5pt;
  color: var(--navy);
  margin: 4mm 0 1.6mm 0;
  padding-bottom: 0.8mm;
  border-bottom: 0.6pt solid var(--gold);
}
.eclair-points { padding-left: 5.5mm; }
.eclair-points li {
  margin: 1.3mm 0;
  padding-left: 1.4mm;
  font-size: 9.3pt;
  line-height: 1.38;
}
.eclair-points li::marker { color: var(--navy); }
.eclair-points strong { color: var(--burgundy); }
.eclair-footer {
  margin-top: 4.5mm;
  text-align: center;
}
.eclair-logo {
  display: block;
  max-width: 19mm;
  margin: 0 auto 1.6mm auto;
}
.eclair-footer-text {
  font-family: var(--sans);
  font-size: 8pt;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--pearl);
}
`;
