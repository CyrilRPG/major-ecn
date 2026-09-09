"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Play, RotateCcw } from "lucide-react";
import {
  restartPreview,
  startAttempt,
} from "@/app/(arena)/arena/[slug]/actions";
import { ArenaButton } from "./arena-ui";
import { FormError } from "./form-ui";

export function StartRoundButton({
  slug,
  roundNumber,
  label,
  preview,
  immersive = false,
}: {
  slug: string;
  roundNumber: number;
  label: string;
  preview: boolean;
  immersive?: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const begin = () => {
    setError(null);
    start(async () => {
      try {
        const r = await startAttempt(slug, roundNumber, preview);
        if (!r.ok) {
          setError(r.error);
          return;
        }
        window.location.assign(
          `/arena/${slug}/manche/${roundNumber}${preview ? "?preview=1" : ""}`,
        );
      } catch {
        setError(
          "La manche n’a pas pu démarrer. Vérifiez votre connexion puis réessayez.",
        );
      }
    });
  };
  if (immersive)
    return (
      <div>
        <FormError>{error}</FormError>
        <button
          type="button"
          className="ae-button"
          disabled={pending}
          onClick={begin}
        >
          <Play aria-hidden />
          {pending ? "Démarrage…" : label}
          <ArrowRight aria-hidden />
        </button>
      </div>
    );
  return (
    <div className="space-y-3">
      <FormError>{error}</FormError>
      <ArenaButton
        size="lg"
        disabled={pending}
        className="w-full"
        onClick={begin}
      >
        {pending ? "Démarrage…" : label}
      </ArenaButton>
    </div>
  );
}

export function RestartPreviewButton({
  slug,
  roundNumber,
}: {
  slug: string;
  roundNumber: number;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <ArenaButton
      variant="ghost"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await restartPreview(slug, roundNumber);
          router.refresh();
        })
      }
    >
      <RotateCcw className="h-4 w-4" /> Rejouer la prévisualisation
    </ArenaButton>
  );
}
