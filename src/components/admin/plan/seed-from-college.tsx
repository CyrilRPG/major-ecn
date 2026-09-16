'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { NativeSelect } from '@/components/admin/suivi/ui';
import { seedFromCollegeAction } from '@/app/admin/planificateur/actions';

/** Données de test (§26) : un item par cours de la plateforme pour une spécialité. */
export function SeedFromCollege({ colleges }: { colleges: { id: string; nom: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [college, setCollege] = useState(colleges[0]?.id ?? '');
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}><Wand2 /> Créer depuis les cours</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer les items depuis les cours de la plateforme</DialogTitle>
            <DialogDescription>Un item par cours (et sous-collèges), relié au cours pour les évaluations et les QCM. Valeurs par défaut : importance = étoiles du cours, volume 3, transversalité 2. Les items déjà présents ne sont pas recréés.</DialogDescription>
          </DialogHeader>
          <NativeSelect value={college} onChange={(e) => setCollege(e.target.value)}>{colleges.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}</NativeSelect>
          {msg && <p className="text-sm text-(--color-ink-soft)">{msg}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Fermer</Button>
            <Button disabled={pending || !college} onClick={() => start(async () => {
              setMsg(null);
              const r = await seedFromCollegeAction(college);
              setMsg(r.ok ? `${r.created} item(s) créé(s), ${r.skipped} déjà présent(s).` : r.error);
              if (r.ok) router.refresh();
            })}>{pending && <Loader2 className="animate-spin" />} Créer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
