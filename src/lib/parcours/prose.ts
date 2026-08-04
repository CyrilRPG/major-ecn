/**
 * Classe de mise en page du texte riche des parcours (rappel, cas clinique,
 * énoncés, corrections).
 *
 * Le projet n'a PAS le plugin `@tailwindcss/typography` : les classes `prose`
 * ne font rien, et le reset de Tailwind supprime les marges des paragraphes et
 * l'apparence des titres. On restaure donc explicitement, via des variantes
 * d'enfants, l'espacement entre paragraphes et le style des sous-titres.
 */
export const PARCOURS_PROSE = [
  'text-[14px] leading-relaxed text-(--color-ink)',
  '[&>*:first-child]:mt-0',
  // Saut de ligne / espacement après chaque paragraphe.
  '[&_p]:my-3 [&_p]:leading-relaxed',
  // Sous-titres (ex. « Les supports de cours ») nettement distincts.
  '[&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:text-[16px] [&_h2]:font-extrabold [&_h2]:text-(--color-ink)',
  '[&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-[15px] [&_h3]:font-bold [&_h3]:text-(--color-primary-deep)',
  '[&_h4]:mt-4 [&_h4]:mb-1.5 [&_h4]:text-[14px] [&_h4]:font-bold [&_h4]:text-(--color-ink)',
  // Listes lisibles.
  '[&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5',
  '[&_li]:my-1 [&_li]:leading-relaxed',
  // Emphases, liens, images.
  '[&_strong]:font-semibold [&_strong]:text-(--color-ink)',
  '[&_em]:italic',
  '[&_a]:font-medium [&_a]:text-[#C0112E] [&_a]:underline [&_a]:underline-offset-2',
  '[&_img]:my-3 [&_img]:max-w-full [&_img]:rounded-xl',
].join(' ');
