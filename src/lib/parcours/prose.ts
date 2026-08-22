/**
 * Mise en page du texte riche des Parcours du Major : le cours (« le rappel du
 * coach »), la vignette du cas clinique, les énoncés et les corrections.
 *
 * Le projet n'a PAS le plugin `@tailwindcss/typography` : les classes `prose` ne
 * font rien, et le reset de Tailwind supprime marges, puces et styles de titres.
 * Tout est donc restauré explicitement, via des variantes d'enfants.
 *
 * Le contenu stocké en base utilise, en plus des balises habituelles, un petit
 * vocabulaire de classes (posé par `tmp/_mise-en-page.mjs`) :
 *   .chapeau               phrase d'accroche du coach, en tête du cours
 *   .cloture               sa formule de fin (« Bon courage ! »)
 *   .encadre.attention     « ATTENTION … », les pièges
 *   .encadre.conseil       l'avis personnel du coach
 *   .encadre.note          « NB », les précisions de second plan
 *   .encadre.exemple       un exemple concret
 *   .encadre.examen        les données d'examen d'une vignette
 *   .encadre > .etiquette  le petit intitulé de l'encadré
 *   .cle                   les « +++ » du support, marqueurs d'importance
 *   .verdict               le « Réponse : … » qui ouvre une correction
 *   .tableau               conteneur défilant d'un <table>
 */
export const PARCOURS_PROSE = [
  'text-[15px] leading-[1.75] text-(--color-ink)',
  '[&>*:first-child]:mt-0 [&>*:last-child]:mb-0',

  // ── Paragraphes ────────────────────────────────────────────────────────────
  '[&_p]:my-3.5',
  // Accroche : plus grande, plus claire, adossée à un filet doré.
  '[&_.chapeau]:my-0 [&_.chapeau]:border-l-[3px] [&_.chapeau]:border-[#E9C766] [&_.chapeau]:pl-4',
  '[&_.chapeau]:text-[16px] [&_.chapeau]:leading-[1.7] [&_.chapeau]:text-(--color-ink-soft)',
  '[&_.chapeau+*]:mt-5',
  // Formule de clôture du coach, en bas de cours.
  '[&_.cloture]:mt-6 [&_.cloture]:mb-0 [&_.cloture]:border-l-[3px] [&_.cloture]:border-[#E9C766]',
  '[&_.cloture]:pl-4 [&_.cloture]:text-[14px] [&_.cloture]:italic [&_.cloture]:text-[#8A6D1F]',

  // ── Titres ─────────────────────────────────────────────────────────────────
  // Section de cours : filet doré à gauche, encre franche.
  '[&_h3]:mt-7 [&_h3]:mb-2.5 [&_h3]:border-l-[3px] [&_h3]:border-[#E9C766] [&_h3]:pl-3',
  '[&_h3]:text-[16px] [&_h3]:font-extrabold [&_h3]:leading-snug [&_h3]:tracking-[-0.01em] [&_h3]:text-(--color-ink)',
  // Sous-section : rouge de la marque, plus discret.
  '[&_h4]:mt-5 [&_h4]:mb-1.5 [&_h4]:text-[13.5px] [&_h4]:font-bold [&_h4]:uppercase',
  '[&_h4]:tracking-[0.08em] [&_h4]:text-[#C0112E]',
  '[&_h2]:mt-7 [&_h2]:mb-3 [&_h2]:text-[18px] [&_h2]:font-black [&_h2]:tracking-tight [&_h2]:text-(--color-ink)',

  // ── Listes ─────────────────────────────────────────────────────────────────
  '[&_ul]:my-3.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:marker:text-[#E4002B]',
  '[&_ol]:my-3.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:marker:font-bold [&_ol]:marker:text-[#C0112E]',
  '[&_li]:my-1.5 [&_li]:pl-1 [&_li]:leading-[1.7]',
  '[&_li>ul]:my-1.5 [&_li>ul]:list-[circle]',

  // ── Encadrés ───────────────────────────────────────────────────────────────
  '[&_.encadre]:my-4 [&_.encadre]:rounded-xl [&_.encadre]:border [&_.encadre]:border-l-4',
  '[&_.encadre]:px-4 [&_.encadre]:py-3 [&_.encadre]:text-[14px] [&_.encadre]:leading-[1.7]',
  '[&_.encadre_p]:my-1.5 [&_.encadre_ul]:my-1.5 [&_.encadre>*:first-child]:mt-0 [&_.encadre>*:last-child]:mb-0',
  '[&_.etiquette]:mb-1 [&_.etiquette]:block [&_.etiquette]:text-[10.5px] [&_.etiquette]:font-bold',
  '[&_.etiquette]:uppercase [&_.etiquette]:tracking-[0.14em]',
  // Attention — ambre
  '[&_.attention]:border-[#FCD9A4] [&_.attention]:border-l-[#F59E0B] [&_.attention]:bg-[#FFFBF2]',
  '[&_.attention_.etiquette]:text-[#B45309]',
  // Conseil du coach — doré
  '[&_.conseil]:border-[#EBDCAE] [&_.conseil]:border-l-[#C99A2E] [&_.conseil]:bg-[#FDFAF0]',
  '[&_.conseil_.etiquette]:text-[#8A6D1F]',
  // À noter — neutre
  '[&_.note]:border-(--color-border) [&_.note]:border-l-(--color-border-strong) [&_.note]:bg-(--color-surface-soft)',
  '[&_.note_.etiquette]:text-(--color-ink-soft)',
  // Exemple — encre douce
  '[&_.exemple]:border-[#DCE3EE] [&_.exemple]:border-l-[#8A93A6] [&_.exemple]:bg-[#F7F9FC]',
  '[&_.exemple_.etiquette]:text-[#5A6478]',
  // Données d'examen — rouge très pâle
  '[&_.examen]:border-[#F8D3D8] [&_.examen]:border-l-[#E4002B] [&_.examen]:bg-[#FFF7F8]',
  '[&_.examen_.etiquette]:text-[#C0112E]',

  // ── Accents ────────────────────────────────────────────────────────────────
  '[&_strong]:font-semibold [&_strong]:text-(--color-ink)',
  '[&_em]:italic [&_em]:text-(--color-ink-soft)',
  '[&_.cle]:ml-0.5 [&_.cle]:rounded [&_.cle]:bg-[#FDE7E9] [&_.cle]:px-1 [&_.cle]:py-px',
  '[&_.cle]:align-middle [&_.cle]:text-[11px] [&_.cle]:font-bold [&_.cle]:tracking-tight [&_.cle]:text-[#C0112E]',
  '[&_.verdict]:mr-1 [&_.verdict]:inline-block [&_.verdict]:rounded-md [&_.verdict]:bg-[#0E1626]',
  '[&_.verdict]:px-2 [&_.verdict]:py-0.5 [&_.verdict]:text-[12px] [&_.verdict]:font-bold [&_.verdict]:text-[#F5C84B]',
  '[&_mark]:rounded [&_mark]:bg-[#FFF3C4] [&_mark]:px-1 [&_mark]:text-(--color-ink)',
  '[&_sup]:text-[0.7em] [&_sup]:align-super [&_sub]:text-[0.7em] [&_sub]:align-sub',
  '[&_a]:font-medium [&_a]:text-[#C0112E] [&_a]:underline [&_a]:decoration-[#F8B4B4] [&_a]:underline-offset-2',
  '[&_a:hover]:decoration-[#C0112E]',
  '[&_blockquote]:my-4 [&_blockquote]:border-l-[3px] [&_blockquote]:border-(--color-border-strong)',
  '[&_blockquote]:pl-4 [&_blockquote]:text-(--color-ink-soft) [&_blockquote]:italic',
  '[&_hr]:my-6 [&_hr]:border-0 [&_hr]:border-t [&_hr]:border-(--color-border)',

  // ── Tableaux ───────────────────────────────────────────────────────────────
  '[&_.tableau]:my-5 [&_.tableau]:w-full [&_.tableau]:overflow-x-auto',
  '[&_.tableau]:rounded-xl [&_.tableau]:border [&_.tableau]:border-(--color-border)',
  '[&_table]:w-full [&_table]:border-collapse [&_table]:text-[13.5px]',
  '[&_caption]:border-b [&_caption]:border-(--color-border) [&_caption]:bg-[#FBFCFD] [&_caption]:px-3.5',
  '[&_caption]:py-2.5 [&_caption]:text-left [&_caption]:text-[12px] [&_caption]:font-bold',
  '[&_caption]:uppercase [&_caption]:tracking-[0.1em] [&_caption]:text-[#C0112E]',
  '[&_thead_th]:bg-(--color-surface-soft) [&_thead_th]:text-[11.5px] [&_thead_th]:uppercase',
  '[&_thead_th]:tracking-[0.08em] [&_thead_th]:text-(--color-ink-soft)',
  '[&_th]:border-b [&_th]:border-(--color-border) [&_th]:px-3.5 [&_th]:py-2 [&_th]:text-left [&_th]:font-bold',
  '[&_td]:border-b [&_td]:border-(--color-border) [&_td]:px-3.5 [&_td]:py-2 [&_td]:align-top',
  '[&_tbody_tr:last-child_td]:border-b-0 [&_tbody_tr:last-child_th]:border-b-0',
  '[&_tbody_th[colspan]]:bg-[#FFF7F8] [&_tbody_th[colspan]]:text-[12px] [&_tbody_th[colspan]]:uppercase',
  '[&_tbody_th[colspan]]:tracking-[0.1em] [&_tbody_th[colspan]]:text-[#C0112E]',

  // ── Images ─────────────────────────────────────────────────────────────────
  '[&_figure]:my-5',
  '[&_img]:my-4 [&_img]:max-w-full [&_img]:rounded-xl [&_img]:border [&_img]:border-(--color-border)',
  '[&_img]:shadow-[0_1px_3px_rgba(16,24,40,0.06)]',
  '[&_figcaption]:mt-2 [&_figcaption]:text-[12.5px] [&_figcaption]:text-(--color-ink-soft)',
].join(' ');
