import Image from 'next/image';
import { cn } from '@/lib/utils';

/** Logo Major ECN (stéthoscope + wordmark). Image unique : marque + texte. */
export function BrandLogo({ className }: { className?: string }) {
  return (
    <Image
      src="/major-ecn-logo.png"
      alt="Major ECN"
      width={1024}
      height={1024}
      priority
      className={cn('h-10 w-auto object-contain', className)}
    />
  );
}

/** Alias — le logo Major ECN intègre déjà la marque et le texte. */
export const BrandMark = BrandLogo;
