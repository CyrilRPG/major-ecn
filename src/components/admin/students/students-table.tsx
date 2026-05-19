'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ImpersonateAction } from './impersonate-action';
import { EditStudentDialog } from './edit-student-dialog';
import { initials } from '@/lib/utils';
import { parseScope } from '@/lib/auth/permissions';

export type Student = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  promotion: string | null;
  permission_scope: unknown;
};

const PROMOS = ['D2', 'D3', 'D4', 'PAE', 'Autre'];

export function StudentsTable({
  students,
  collegeMap,
  colleges,
}: {
  students: Student[];
  collegeMap: Record<string, string>;
  colleges: { id: string; nom: string }[];
}) {
  const [q, setQ] = useState('');
  const [promo, setPromo] = useState<string>('all');
  const [permission, setPermission] = useState<string>('all');

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const full = `${s.first_name ?? ''} ${s.last_name ?? ''} ${s.email ?? ''}`.toLowerCase();
      if (q && !full.includes(q.toLowerCase())) return false;
      if (promo !== 'all' && s.promotion !== promo) return false;
      const scope = parseScope(s.permission_scope);
      if (permission === 'all-access' && scope.type !== 'all') return false;
      if (permission === 'restricted' && scope.type === 'all') return false;
      return true;
    });
  }, [students, q, promo, permission]);

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-(--color-ink-soft)" />
          <Input className="pl-9" placeholder="Rechercher un élève (nom, prénom, email)…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={promo} onValueChange={setPromo}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Promotion" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes promos</SelectItem>
            {PROMOS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={permission} onValueChange={setPermission}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Permissions" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes permissions</SelectItem>
            <SelectItem value="all-access">Toute l’offre</SelectItem>
            <SelectItem value="restricted">Restreintes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Élève</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Téléphone</TableHead>
            <TableHead>Promotion</TableHead>
            <TableHead>Accès</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-12 text-center text-(--color-ink-soft)">
                Aucun élève ne correspond à ces filtres.
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((s) => {
              const scope = parseScope(s.permission_scope);
              return (
                <TableRow key={s.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback>{initials(s.first_name, s.last_name)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{s.first_name} {s.last_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-(--color-ink-soft) font-mono text-xs">{s.email}</TableCell>
                  <TableCell className="text-(--color-ink-soft)">{s.phone ?? 'Non renseigné'}</TableCell>
                  <TableCell>
                    {s.promotion && <Badge variant="outline">{s.promotion}</Badge>}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-1">
                      <Badge variant={scope.offer === 'premium' ? 'primary' : 'outline'}>
                        {scope.offer === 'premium' ? 'Premium' : 'Basic'}
                      </Badge>
                      {scope.type === 'all' ? (
                        <Badge variant="muted">Tous collèges</Badge>
                      ) : (
                        scope.colleges.map((c) => (
                          <Badge key={c} variant="muted">{collegeMap[c] ?? c}</Badge>
                        ))
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <EditStudentDialog student={s} colleges={colleges} />
                      <ImpersonateAction
                        studentId={s.id}
                        studentName={`${s.first_name ?? ''} ${s.last_name ?? ''}`.trim() || s.email || 'élève'}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </>
  );
}
