/**
 * Rattrape les liens d'activation « natifs » Supabase, qui étaient morts.
 *
 * Le problème
 * -----------
 * Le chemin nominal construit lui-même l'URL d'activation
 * (`/auth/confirm?token_hash=…`) et fonctionne. Mais tous les chemins de
 * SECOURS — `inviteUserByEmail`, `resetPasswordForEmail`, l'email natif de
 * confirmation d'inscription, utilisés dès que Resend échoue — laissent
 * Supabase fabriquer le lien. Deux défauts s'additionnent alors :
 *
 *  1. Le projet ignore le `redirect_to` demandé (l'URL n'est pas dans la liste
 *     blanche « Redirect URLs ») et retombe sur le Site URL,
 *     `https://major-ecn.fr`. Vérifié le 08/09/2026 : `redirect_to` à la
 *     racine, dans `options`, ou absent — le lien renvoie toujours à la racine.
 *     L'élève arrive donc sur la page d'accueil, jamais sur l'écran de choix du
 *     mot de passe.
 *  2. Le jeton revient dans le FRAGMENT (`#access_token=…`, flux « implicite »)
 *     alors que le client navigateur de l'application est en flux PKCE : il ne
 *     sait traiter que `?code=`. Un fragment chargé même directement sur
 *     `/auth/setup-password` ne pose aucune session.
 *
 * D'où « j'appuie sur le lien de l'email et ça ne fonctionne pas ».
 *
 * Le rattrapage
 * -------------
 * Ce script lit le fragment et le POSTe à `/auth/session`, qui pose la session
 * en cookies côté serveur — comme `/auth/confirm` le fait pour le chemin
 * nominal — puis redirige vers l'écran de mot de passe.
 *
 * Il s'exécute à l'analyse du document, AVANT le démarrage de l'application :
 * le client Supabase, une fois créé, tente de consommer le fragment et fait
 * tourner le refresh token. Un rattrapage déclenché depuis un `useEffect`
 * arriverait après et rejouerait un jeton déjà périmé (« Invalid Refresh
 * Token », constaté en test).
 *
 * Ce composant ne dispense pas de corriger la configuration Supabase (Site URL
 * sur `https://www.major-ecn.fr` et URL de redirection en liste blanche). Il
 * rend le site tolérant à ce réglage, et rattrape les liens DÉJÀ envoyés.
 */
const SCRIPT = `(function(){try{
  var h = location.hash.replace(/^#/, '');
  if (!h || h.indexOf('access_token=') < 0) return;
  var p = new URLSearchParams(h);
  var at = p.get('access_token'), rt = p.get('refresh_token'), t = p.get('type') || '';
  if (!at || !rt) return;
  if (['invite','recovery','signup','magiclink'].indexOf(t) < 0) return;
  // magiclink : l'élève a déjà un mot de passe, on le laisse sur l'accueil connecté.
  var next = t === 'magiclink' ? '/' : '/auth/setup-password';
  // Les jetons ne doivent pas transiter par une URL journalisée : POST.
  var f = document.createElement('form');
  f.method = 'POST'; f.action = '/auth/session'; f.style.display = 'none';
  [['access_token', at], ['refresh_token', rt], ['next', next]].forEach(function(kv){
    var i = document.createElement('input');
    i.type = 'hidden'; i.name = kv[0]; i.value = kv[1];
    f.appendChild(i);
  });
  // Le fragment est retiré de l'historique : il ne doit pas resservir.
  history.replaceState(null, '', location.pathname + location.search);
  (document.body || document.documentElement).appendChild(f);
  f.submit();
}catch(e){}})();`;

// Balise <script> brute et non différée : elle part dans le HTML rendu par le
// serveur et s'exécute à l'analyse du document. `next/script` n'est pas utilisé
// ici — même en `beforeInteractive`, React avertit qu'un script écrit dans
// l'arbre n'est pas exécuté lors d'un rendu client, et le rattrapage doit être
// certain de partir avant tout code applicatif.
export function RattrapageLienNatif() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
