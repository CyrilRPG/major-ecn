import { Bookmark } from "lucide-react";

/** Rendered only when the server retrieved a saved mark for this attempt. */
export function MarkedQuestion() {
  return (
    <p className="mb-3 flex items-center gap-2 text-xs text-[#ffca4c]">
      <Bookmark size={16} aria-hidden fill="currentColor" />
      Question marquée pendant la manche
    </p>
  );
}
