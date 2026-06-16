'use client';

/**
 * Widget captcha Cloudflare Turnstile (anti-spam / anti-bot).
 *
 * Rendu explicite via l'API JS Turnstile : on charge le script une seule fois
 * puis on monte le widget dans un conteneur. Le token obtenu est remonté au
 * parent via `onVerify` et joint au payload du formulaire ; le serveur le
 * valide ensuite (cf. src/lib/turnstile.ts).
 *
 * Si `NEXT_PUBLIC_TURNSTILE_SITE_KEY` n'est pas configurée, le composant ne
 * rend rien et signale immédiatement « pas de captcha requis » (onVerify('')),
 * pour ne pas bloquer le développement local. Le captcha s'active dès que la
 * clé est renseignée.
 */

import { useCallback, useEffect, useRef } from 'react';

const SCRIPT_SRC =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
const SCRIPT_ID = 'cf-turnstile-script';

type TurnstileApi = {
  render: (
    el: HTMLElement,
    opts: {
      sitekey: string;
      callback?: (token: string) => void;
      'error-callback'?: () => void;
      'expired-callback'?: () => void;
      'timeout-callback'?: () => void;
      theme?: 'light' | 'dark' | 'auto';
      language?: string;
      appearance?: 'always' | 'execute' | 'interaction-only';
    },
  ) => string;
  reset: (id?: string) => void;
  remove: (id?: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Turnstile load error')));
      if (window.turnstile) resolve();
      return;
    }
    const s = document.createElement('script');
    s.id = SCRIPT_ID;
    s.src = SCRIPT_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Turnstile load error'));
    document.head.appendChild(s);
  });
  return scriptPromise;
}

type Props = {
  /** Remonte le token de vérification (chaîne vide = réinitialisé / non requis). */
  onVerify: (token: string) => void;
  /** Notifie une erreur ou expiration du captcha. */
  onError?: () => void;
  className?: string;
};

export function TurnstileWidget({ onVerify, onError, className }: Props) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  // Conserve les derniers callbacks sans relancer le rendu du widget.
  const onVerifyRef = useRef(onVerify);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onVerifyRef.current = onVerify;
    onErrorRef.current = onError;
  });

  const emitVerify = useCallback((token: string) => onVerifyRef.current(token), []);
  const emitError = useCallback(() => onErrorRef.current?.(), []);

  useEffect(() => {
    // Pas de clé : on considère le captcha comme non requis.
    if (!siteKey) {
      emitVerify('');
      return;
    }
    let cancelled = false;

    loadScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return;
        if (widgetIdRef.current) return; // déjà monté
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: 'light',
          language: 'fr',
          callback: (token: string) => emitVerify(token),
          'error-callback': () => {
            emitVerify('');
            emitError();
          },
          'expired-callback': () => {
            emitVerify('');
            emitError();
          },
          'timeout-callback': () => {
            emitVerify('');
            emitError();
          },
        });
      })
      .catch(() => {
        // Échec de chargement du script : ne pas bloquer l'envoi.
        emitVerify('');
        emitError();
      });

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          /* noop */
        }
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, emitVerify, emitError]);

  if (!siteKey) return null;

  return <div ref={containerRef} className={className} />;
}
