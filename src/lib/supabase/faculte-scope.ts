/**
 * Cloisonnement des tables transverses par faculté.
 *
 * POURQUOI — le projet Supabase est PARTAGÉ entre Major ECN et Major
 * Odontologie. L'arbre de contenu porte sa faculté (`facultes` → `semestres` →
 * `matieres` → `cours`), mais les tables « transverses » — épreuves blanches,
 * annonces d'accueil, agenda, formulaires, blog, popups, sessions… — étaient
 * communes aux deux produits : les épreuves blanches de Major ECN s'affichaient
 * chez les élèves d'odontologie, et sans ce garde-fou les contenus créés depuis
 * l'espace admin d'odontologie remonteraient ici en retour.
 *
 * Ces tables portent désormais une colonne `faculte_id`. Plutôt que de répéter
 * `.eq('faculte_id', …)` sur la centaine d'appels concernés — où un oubli est
 * invisible et rouvre la fuite — le filtre est posé UNE fois, ici, au niveau du
 * client Supabase : `createClient()` et `createAdminClient()` renvoient un
 * client dont chaque requête sur une table cloisonnée est automatiquement
 * bornée à CETTE plateforme, en lecture comme en écriture.
 *
 * `profiles` est volontairement absent de la liste : un même compte
 * administrateur pilote les deux plateformes, et le borner à une faculté le
 * rendrait introuvable à la connexion. Les listes d'élèves et de professeurs de
 * l'espace admin filtrent donc `faculte_id` explicitement, requête par requête.
 */
import { EDN_FACULTE_ID } from '@/lib/data/faculte';

/** Tables transverses portant `faculte_id`. */
const TABLES_CLOISONNEES = new Set([
  'mock_exams',
  'homepage_announcements',
  'homepage_generic_data',
  'platform_events',
  'satisfaction_forms',
  'blog_posts',
  'major_parcours',
  'welcome_popups',
  'evc_sessions',
  'diagnostic_leads',
  'guide_leads',
  'campaign_recipients',
  'ai_generations',
  'medgen_annales',
  'exercise_imports',
  'formula_permissions',
  'admin_alerts',
  'admin_audit_logs',
  'forum_questions',
  'item_popups',
]);

/**
 * Tables marquées à l'écriture seulement.
 *
 * `profiles` ne peut pas être filtré en lecture : un même compte administrateur
 * pilote les deux plateformes, et le borner à une faculté le rendrait
 * introuvable à la connexion sur l'autre. En revanche, tout profil CRÉÉ depuis
 * cette plateforme lui appartient — la faculté est donc écrite d'office, ce qui
 * évite de dépendre de l'appelant. Les listes d'élèves et de professeurs de
 * l'espace admin filtrent `faculte_id` explicitement.
 */
const TABLES_MARQUEES_A_L_ECRITURE = new Set(['profiles']);

/** Ajoute `faculte_id` à une ligne (ou à un tableau de lignes) avant écriture.
 *  Une valeur déjà présente n'est pas écrasée : un appelant qui vise
 *  explicitement une faculté garde la main. */
function marquer(payload: unknown, faculteId: string): unknown {
  if (Array.isArray(payload)) return payload.map((row) => marquer(row, faculteId));
  if (payload && typeof payload === 'object') return { faculte_id: faculteId, ...(payload as object) };
  return payload;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFn = (...args: any[]) => any;

/** Enveloppe le constructeur de requête d'une table cloisonnée.
 *  `lectureBornee` à false : seules les écritures portent la faculté. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function cloisonnerRequete(builder: any, faculteId: string, lectureBornee = true): any {
  return new Proxy(builder, {
    get(cible, prop) {
      const valeur = Reflect.get(cible, prop);
      if (typeof valeur !== 'function') return valeur;
      const methode = valeur as AnyFn;

      if (!lectureBornee && prop !== 'insert' && prop !== 'upsert') return methode.bind(cible);

      // Lectures et suppressions : bornées à la faculté.
      if (prop === 'select' || prop === 'delete') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (...args: any[]) => methode.apply(cible, args).eq('faculte_id', faculteId);
      }
      // Mises à jour : la clause `eq` s'ajoute aux filtres de l'appelant, une
      // ligne de l'autre faculté ne peut donc pas être modifiée d'ici.
      if (prop === 'update') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (...args: any[]) => methode.apply(cible, args).eq('faculte_id', faculteId);
      }
      // Créations : la faculté est écrite dans la ligne.
      if (prop === 'insert' || prop === 'upsert') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (payload: unknown, ...reste: any[]) =>
          methode.apply(cible, [marquer(payload, faculteId), ...reste]);
      }
      return methode.bind(cible);
    },
  });
}

/**
 * Renvoie un client Supabase dont les tables transverses sont bornées à la
 * faculté servie par cette plateforme. Toute autre table (contenu, progression,
 * profils…) traverse le proxy sans modification.
 */
export function cloisonnerParFaculte<T>(client: T, faculteId: string = EDN_FACULTE_ID): T {
  return new Proxy(client as object, {
    get(cible, prop) {
      const valeur = Reflect.get(cible, prop);
      if (prop !== 'from' || typeof valeur !== 'function') {
        return typeof valeur === 'function' ? (valeur as AnyFn).bind(cible) : valeur;
      }
      return (table: string, ...reste: unknown[]) => {
        const builder = (valeur as AnyFn).apply(cible, [table, ...reste]);
        if (TABLES_CLOISONNEES.has(table)) return cloisonnerRequete(builder, faculteId);
        if (TABLES_MARQUEES_A_L_ECRITURE.has(table)) return cloisonnerRequete(builder, faculteId, false);
        return builder;
      };
    },
  }) as T;
}
