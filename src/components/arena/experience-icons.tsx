import type { SVGProps } from "react";

export function ArenaBars(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 28 30"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      {...props}
    >
      <path d="M2 17h5v11H2zM11 10h5v18h-5zM20 2h5v26h-5z" />
    </svg>
  );
}
export function ArenaTarget(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M29 16a13 13 0 1 1-12-13M23 16a7 7 0 1 1-7-7M16 16 29 3M24 3h5v5" />
    </svg>
  );
}
