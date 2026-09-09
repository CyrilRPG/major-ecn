/**
 * Compatibilité pdf.js 5 avec les navigateurs un peu anciens.
 *
 * pdf.js ≥ 4.x appelle `Promise.withResolvers()` (Chrome ≥ 119, Safari ≥ 17.4,
 * Firefox ≥ 121) et `URL.parse()` (Chrome ≥ 126, Safari ≥ 18.2). Sur un
 * navigateur antérieur, `pdfjs.getDocument` lève « Promise.withResolvers is
 * not a function » et la page entière tombe sur l'écran d'erreur — c'est ce
 * qu'ont vécu des élèves sur les fiches (Chrome 116 macOS, iOS 17.5 ; journal
 * `client_errors` du 08/09/2026).
 *
 * Ce module ne fait qu'ajouter les deux fonctions quand elles manquent. Il
 * doit être importé EN PREMIER par tout module qui importe `react-pdf` /
 * `pdfjs-dist` : les imports ES sont évalués dans l'ordre, un bloc inline
 * placé après l'import arriverait trop tard.
 */

type PromiseWithResolvers<T> = {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: unknown) => void;
};

const P = Promise as unknown as { withResolvers?: <T>() => PromiseWithResolvers<T> };
if (typeof P.withResolvers !== 'function') {
  P.withResolvers = function withResolvers<T>(): PromiseWithResolvers<T> {
    let resolve!: PromiseWithResolvers<T>['resolve'];
    let reject!: PromiseWithResolvers<T>['reject'];
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}

const U = URL as unknown as { parse?: (url: string | URL, base?: string | URL) => URL | null };
if (typeof URL !== 'undefined' && typeof U.parse !== 'function') {
  U.parse = function parse(url: string | URL, base?: string | URL): URL | null {
    try {
      return new URL(url, base);
    } catch {
      return null;
    }
  };
}

export {};
