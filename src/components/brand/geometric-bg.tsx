export function GeometricBackground({ className, seed = 0 }: { className?: string; seed?: number }) {
  const offset = (seed * 37) % 100;
  const gid = `geom-${seed}`;
  const baseY = 150 + (offset % 40);
  return (
    <svg
      viewBox="0 0 400 240"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id={`${gid}-grad`} x1="0" y1="0" x2="400" y2="240" gradientUnits="userSpaceOnUse">
          <stop stopColor="#56080E" />
          <stop offset="1" stopColor="#2C0407" />
        </linearGradient>
        <linearGradient id={`${gid}-line`} x1="0" y1="0" x2="400" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E2231A" stopOpacity="0" />
          <stop offset="0.5" stopColor="#E2231A" stopOpacity="0.55" />
          <stop offset="1" stopColor="#E2231A" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`${gid}-glow`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#E15A62" stopOpacity="0.22" />
          <stop offset="1" stopColor="#E15A62" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="240" fill={`url(#${gid}-grad)`} />
      <circle cx={300 - offset} cy="50" r="150" fill={`url(#${gid}-glow)`} />
      {[0, 1, 2].map((row) => (
        <line
          key={row}
          x1="0"
          x2="400"
          y1={60 + row * 60 + (offset % 12)}
          y2={60 + row * 60 + (offset % 12)}
          stroke="#FFFFFF"
          strokeOpacity="0.05"
        />
      ))}
      <path
        d={`M -10 ${baseY}
            H 90
            l 14 -34 l 16 64 l 14 -52 l 10 22 H 220
            l 14 -28 l 14 50 l 12 -34 H 410`}
        stroke={`url(#${gid}-line)`}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
