'use client';

import { useState } from 'react';
import { Mail } from 'lucide-react';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO : brancher sur l'API d'inscription newsletter (Mailchimp / Resend / …)
    if (!email.trim()) return;
    setDone(true);
    setEmail('');
  };

  return (
    <form onSubmit={submit} className="mt-3 space-y-2">
      <div className="relative">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Votre adresse email"
          className="w-full rounded-lg border border-[#FACBD0] bg-white px-3 py-2 pr-9 text-[13px] text-[#1A2233] placeholder:text-[#9AA1AE] focus:border-[#E4002B] focus:outline-none focus:ring-1 focus:ring-[#E4002B]"
        />
        <Mail className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#E4002B]" />
      </div>
      <button
        type="submit"
        className="w-full rounded-lg bg-[#C0001F] py-2.5 text-[13px] font-bold text-white shadow-sm transition-transform hover:scale-[1.01]"
      >
        {done ? 'Inscrit ✓' : 'Je m\'inscris'}
      </button>
    </form>
  );
}
