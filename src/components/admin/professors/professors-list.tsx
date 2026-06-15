'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { initials } from '@/lib/utils';
import { DeleteAccountButton } from '@/components/admin/delete-account-button';
import { ToggleActiveButton } from '@/components/admin/toggle-active-button';
import { EditProfileDialog } from '@/components/admin/edit-profile-dialog';

export type ProfessorRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  pseudo: string | null;
  cv_url: string | null;
  certificat_scolarite_url: string | null;
  carte_pro_url: string | null;
  created_at: string;
  is_active: boolean;
  permission_scope: unknown;
  tags: { label: string; tone: 'muted' | 'primary' }[];
};

export function ProfessorsList({
  rows,
  colleges,
  coursByCollege,
}: {
  rows: ProfessorRow[];
  colleges: { id: string; nom: string }[];
  coursByCollege: Record<string, { id: string; titre: string }[]>;
}) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((p) => {
      const haystack = [p.first_name, p.last_name, p.email, p.phone]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [rows, query]);

  return (
    <div>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-ink-muted)" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un professeur (nom, prénom, email, téléphone)…"
          className="pl-9"
          autoComplete="off"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) px-5 py-10 text-center">
          <p className="text-sm text-(--color-ink-soft)">
            Aucun professeur ne correspond à « {query} ».
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((p) => {
            const displayName = `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || p.email || 'professeur';
            return (
              <li key={p.id} className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-(--shadow-soft) sm:p-5">
                <div className="flex flex-wrap items-start gap-4">
                  <Avatar className="h-11 w-11 shrink-0">
                    <AvatarFallback>{initials(p.first_name, p.last_name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-(--color-ink)">{p.first_name} {p.last_name}</p>
                    <p className="truncate font-mono text-xs text-(--color-ink-soft)">{p.email}</p>
                    {p.phone && (
                      <p className="mt-0.5 text-xs text-(--color-ink-muted)">{p.phone}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-1 max-w-full">
                    <Badge variant={p.is_active ? 'primary' : 'muted'}>
                      {p.is_active ? 'Professeur' : 'Désactivé'}
                    </Badge>
                    <EditProfileDialog
                      role="professor"
                      profile={{
                        id: p.id,
                        first_name: p.first_name,
                        last_name: p.last_name,
                        email: p.email,
                        phone: p.phone,
                        address: p.address,
                        pseudo: p.pseudo,
                        cv_url: p.cv_url,
                        certificat_scolarite_url: p.certificat_scolarite_url,
                        carte_pro_url: p.carte_pro_url,
                        created_at: p.created_at,
                      }}
                      professorScope={{ permission_scope: p.permission_scope, colleges, coursByCollege }}
                    />
                    <ToggleActiveButton userId={p.id} displayName={displayName} isActive={p.is_active} />
                    <DeleteAccountButton userId={p.id} displayName={displayName} />
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1 border-t border-(--color-border) pt-3">
                  {p.tags.map((t, i) => (
                    <Badge key={i} variant={t.tone}>{t.label}</Badge>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-4 text-[11px] text-(--color-ink-muted)">
        {filtered.length} / {rows.length} professeur{rows.length > 1 ? 's' : ''}
      </p>
    </div>
  );
}
