"use client";

import { useEffect, useRef, type ReactNode } from 'react';

/** Direct profile links must also reveal the collapsed final-screen profile. */
export function ProfileDetails({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const profileHashes = ['#compte', '#palmares-title'];
    const open = (hash: string) => {
      if (profileHashes.includes(hash) && ref.current) {
        ref.current.open = true;
        document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' });
      }
    };
    const reveal = () => {
      open(window.location.hash);
    };
    // Next.js changes hashes with pushState, which does not emit hashchange.
    // Open before its scroll handling, including a second click on the same hash.
    const onProfileLink = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
      if (!link) return;
      const url = new URL(link.getAttribute('href')!, window.location.href);
      if (url.origin === window.location.origin && url.pathname === window.location.pathname) open(url.hash);
    };
    reveal();
    window.addEventListener('hashchange', reveal);
    document.addEventListener('click', onProfileLink, true);
    return () => {
      window.removeEventListener('hashchange', reveal);
      document.removeEventListener('click', onProfileLink, true);
    };
  }, []);
  return <details ref={ref} className="af-profile af-panel" id="compte"><summary>MON PROFIL ET MON PALMARÈS</summary><div className="af-profile-content">{children}</div></details>;
}
