/**
 * <FicheDocument /> — rendu d'une `FicheData` au format charte « médicale sobre ».
 *
 * Reproduit fidèlement le template du générateur (major-ecn-fiche :
 * assets/templates/fiche.html + cover.html), avec les MÊMES classes CSS que
 * `styles.css` (vendorisé dans src/lib/fiches/template/styles.css).
 *
 * Un seul et même composant sert :
 *   - l'aperçu en direct dans l'éditeur (rendu client) ;
 *   - le HTML envoyé à Chromium pour le PDF (renderToStaticMarkup côté serveur).
 * → l'aperçu et le PDF sont identiques par construction.
 *
 * Le rendu Markdown des cellules réutilise react-markdown + remark-gfm (déjà
 * présents) ; un petit plugin rehype colore les marqueurs de légende ★ ◆ ⚠.
 */
/* Images en <img> brut volontaire : ce document est rendu en PDF par Chromium,
   où next/image n'a pas de sens. */
/* eslint-disable @next/next/no-img-element */
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  FICHE_LEGEND,
  REFLEXE_LABELS,
  type FicheData,
  type FicheRow,
  type SousPartie,
} from './types';

/* ── Coloration des marqueurs de légende (★ ◆ ⚠) ──────────────────────────────
   Miroir de html_renderer._MARKER_CLASSES du générateur. Implémenté en plugin
   rehype « maison » (sans dépendance), qui scinde les nœuds texte. */
const MARKER_CLASSES: Record<string, string> = {
  '★': 'm-ecn',
  '◆': 'm-yield',
  '⚠': 'm-trap',
};
const MARKER_RE = /([★◆⚠])/g;

/* eslint-disable @typescript-eslint/no-explicit-any */
function rehypeFmarkers() {
  const visit = (node: any) => {
    if (!node || !Array.isArray(node.children)) return;
    const next: any[] = [];
    for (const child of node.children) {
      if (child.type === 'text' && MARKER_RE.test(child.value)) {
        MARKER_RE.lastIndex = 0;
        const parts = child.value.split(MARKER_RE);
        for (const part of parts) {
          if (part === '') continue;
          if (MARKER_CLASSES[part]) {
            next.push({
              type: 'element',
              tagName: 'span',
              properties: { className: ['fmark', MARKER_CLASSES[part]] },
              children: [{ type: 'text', value: part }],
            });
          } else {
            next.push({ type: 'text', value: part });
          }
        }
      } else {
        visit(child);
        next.push(child);
      }
    }
    node.children = next;
  };
  return (tree: any) => visit(tree);
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** Markdown bloc complet (paragraphes, tableaux GFM, listes…). */
function MarkdownBlock({ source }: { source: string }) {
  if (!source || !source.trim()) return null;
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeFmarkers]}>
      {source}
    </ReactMarkdown>
  );
}

/** Markdown court rendu sans <p> enveloppant (cellule « concept », points-clés). */
function MarkdownInline({ source }: { source: string }) {
  if (!source || !source.trim()) return null;
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeFmarkers]}
      components={{ p: ({ children }) => <>{children}</> }}
    >
      {source}
    </ReactMarkdown>
  );
}

/* ── Figures d'une sous-partie (intégrées à la dernière ligne) ─────────────── */
function SousPartieFigures({ sp }: { sp: SousPartie }) {
  if (!sp.images || sp.images.length === 0) return null;
  return (
    <>
      {sp.images.map((img, i) =>
        img.url ? (
          <figure key={i} className="ft-figure">
            <img src={img.url} alt={img.description} />
            <figcaption>
              Figure&nbsp;{img.figure_number} — {img.description}
            </figcaption>
          </figure>
        ) : null,
      )}
    </>
  );
}

/* ── Tableau d'une sous-partie ────────────────────────────────────────────── */
function SousPartieTable({
  partieNumero,
  partieTitre,
  sp,
  isFirstSousPartie,
}: {
  partieNumero: string;
  partieTitre: string;
  sp: SousPartie;
  isFirstSousPartie: boolean;
}) {
  // Cible d'insertion des figures : dernière ligne « normal », sinon dernière.
  let target = -1;
  sp.rows.forEach((r, i) => {
    if (r.kind === 'normal') target = i;
  });
  if (target === -1 && sp.rows.length > 0) target = sp.rows.length - 1;

  return (
    <table className="fiche-table">
      <colgroup>
        <col className="ft-col-concept" />
        <col className="ft-col-detail" />
      </colgroup>
      <thead>
        <tr className="ft-banner-row">
          <td colSpan={2}>
            <span className="partie-banner-num">{partieNumero}</span>
            <span
              className={
                'partie-banner-title' +
                (isFirstSousPartie ? '' : ' partie-banner-title--repeat')
              }
            >
              {partieTitre}
            </span>
          </td>
        </tr>
        <tr className="ft-head-row">
          <th className="ft-tag">{partieNumero}</th>
          <th className="ft-subtitle">
            <span className="ft-subtitle-text">
              {sp.lettre}.&nbsp;&nbsp;{sp.titre}
            </span>
          </th>
        </tr>
      </thead>
      <tbody>
        {sp.rows.map((row: FicheRow, i: number) =>
          row.kind === 'normal' ? (
            <tr key={i}>
              <td className="ft-concept">
                <MarkdownInline source={row.concept} />
              </td>
              <td className="ft-detail content">
                <MarkdownBlock source={row.detail_md} />
                {i === target && <SousPartieFigures sp={sp} />}
              </td>
            </tr>
          ) : (
            <tr key={i} className={`ft-reflexe ft-reflexe--${row.kind}`}>
              <td colSpan={2}>
                <span className="ft-reflexe-label">{REFLEXE_LABELS[row.kind]}</span>
                <span className="ft-reflexe-body content">
                  <MarkdownBlock source={row.detail_md} />
                </span>
                {i === target && <SousPartieFigures sp={sp} />}
              </td>
            </tr>
          ),
        )}
      </tbody>
    </table>
  );
}

/* ── Page de garde (cover.html) ───────────────────────────────────────────── */
function Cover({ fiche, logoUrl }: { fiche: FicheData; logoUrl?: string }) {
  return (
    <section className="cover">
      <div className="cover-band" />
      <div className="cover-content">
        <div className="cover-head">
          {logoUrl && <img className="cover-logo" src={logoUrl} alt="Major ECN" />}
          <div className="cover-matiere">{fiche.matiere}</div>
          <h1 className="cover-title">{fiche.nom_cours}</h1>
          <div className="cover-year">Année&nbsp;{fiche.annee}</div>
          {fiche.item && <div className="cover-item">{fiche.item}</div>}
        </div>

        <div className="cover-plan">
          <div className="cover-section-label">Plan du cours</div>
          <ol className="cover-plan-list">
            {fiche.plan.map((partie, i) => (
              <li key={i} className="cover-plan-item">
                <a className="cover-plan-link" href={`#partie-${i + 1}`}>
                  <span className="cover-plan-num">{partie.numero}</span>
                  <span className="cover-plan-text">{partie.titre}</span>
                </a>
              </li>
            ))}
          </ol>
        </div>

        <div className="cover-legend">
          <div className="cover-section-label">Légende</div>
          <div className="cover-legend-items">
            {FICHE_LEGEND.map((entry, i) => (
              <span key={i} className="cover-legend-item">
                <span className={`cover-legend-sym cover-legend-sym--${i + 1}`}>
                  {entry.symbol}
                </span>
                <span className="cover-legend-text">{entry.label}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Document complet ─────────────────────────────────────────────────────── */
export function FicheDocument({
  fiche,
  logoUrl,
  watermarkUrl,
}: {
  fiche: FicheData;
  /** Logo affiché sur la page de garde + la fiche éclair. */
  logoUrl?: string;
  /** Filigrane discret (logo gris) répété au centre des pages. */
  watermarkUrl?: string;
}) {
  const hasSynthese = fiche.tableaux.length > 0 || fiche.chiffres_cles !== null;
  const hasEclair = !!fiche.fiche_eclair_md.trim() || fiche.points_cles.length > 0;

  return (
    <>
      {watermarkUrl && (
        <div className="page-watermark">
          <img src={watermarkUrl} alt="" />
        </div>
      )}

      {/* Sources des chaînes dynamiques (en-tête / pied — parité WeasyPrint). */}
      <span className="string-source string-source--cours">{fiche.nom_cours}</span>
      <span className="string-source string-source--footer">
        Major ECN&nbsp;&middot;&nbsp;{fiche.annee}
      </span>

      {/* 1. Page de garde */}
      <Cover fiche={fiche} logoUrl={logoUrl} />

      {/* 2. Corps */}
      {fiche.parties.map((partie, pi) => (
        <section
          key={pi}
          className={'partie-page' + (pi === 0 ? ' partie-page--first' : '')}
          id={`partie-${pi + 1}`}
        >
          {partie.sous_parties.map((sp, si) => (
            <SousPartieTable
              key={si}
              partieNumero={partie.numero}
              partieTitre={partie.titre}
              sp={sp}
              isFirstSousPartie={si === 0}
            />
          ))}
        </section>
      ))}

      {/* 3. Synthèse & chiffres-clés */}
      {hasSynthese && (
        <section className="page synthese-page">
          <div className="partie-banner partie-banner--plain">
            <span className="partie-banner-title">Synthèse — Tableaux de révision</span>
          </div>

          {fiche.chiffres_cles && (
            <div className="synthese-bloc">
              <h3 className="synthese-titre">Chiffres-clés à connaître</h3>
              <div className="table-synthese table-chiffres content">
                <MarkdownBlock source={fiche.chiffres_cles.markdown} />
              </div>
            </div>
          )}

          {fiche.tableaux.map((tab, i) => (
            <div key={i} className="synthese-bloc">
              <h3 className="synthese-titre">{tab.titre}</h3>
              <div className="table-synthese content">
                <MarkdownBlock source={tab.markdown} />
              </div>
            </div>
          ))}
        </section>
      )}

      {/* 4. Fiche éclair */}
      {hasEclair && (
        <section className="page eclair-page">
          <div className="eclair-card">
            <div className="eclair-eyebrow">Révision express</div>
            <h2 className="eclair-title">Fiche éclair</h2>
            <p className="eclair-sub">{fiche.nom_cours}</p>
            <div className="eclair-rule" />

            {fiche.fiche_eclair_md.trim() && (
              <div className="eclair-body content">
                <MarkdownBlock source={fiche.fiche_eclair_md} />
              </div>
            )}

            {fiche.points_cles.length > 0 && (
              <>
                <h3 className="eclair-points-titre">À retenir absolument</h3>
                <ul className="eclair-points">
                  {fiche.points_cles.map((point, i) => (
                    <li key={i}>
                      <MarkdownInline source={point} />
                    </li>
                  ))}
                </ul>
              </>
            )}

            <div className="eclair-footer">
              {logoUrl && <img src={logoUrl} alt="Major ECN" className="eclair-logo" />}
              <div className="eclair-footer-text">
                Major ECN&nbsp;&middot;&nbsp;{fiche.annee}
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
