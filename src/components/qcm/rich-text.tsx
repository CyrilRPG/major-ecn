import { sanitizeFlashcardHtml } from '@/lib/flashcards/rich-text';

/**
 * Rend du contenu QCM (énoncé, item, justification, corrigé) qui peut contenir
 * une mise en forme riche (gras/italique/souligné/couleur/image) stockée en
 * HTML. Le contenu est TOUJOURS ré-assaini au rendu (liste blanche stricte),
 * donc sûr même sur des données héritées en texte brut (qui passent tel quel).
 *
 * Rendu inline (`<span>`) pour s'insérer là où on affichait `{q.enonce}` ;
 * hérite du `whitespace-pre-line` éventuel du parent (les sauts de ligne des
 * anciens contenus texte restent préservés).
 */
export function RichText({ html, className }: { html: string | null | undefined; className?: string }) {
  return (
    <span
      className={className ?? '[&_img]:my-1.5 [&_img]:max-h-56 [&_img]:rounded-lg'}
      dangerouslySetInnerHTML={{ __html: sanitizeFlashcardHtml(html ?? '') }}
    />
  );
}
