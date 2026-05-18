export function GeometricBackground({ className, seed = 0 }: { className?: string; seed?: number }) {
  const offset = (seed * 37) % 100;
  const gid = `geom-${seed}`;
  return (
    <svg
      viewBox="0 0 400 240"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id={`${gid}-grad`} x1="0" y1="0" x2="400" y2="240" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2A0B40" />
          <stop offset="1" stopColor="#150226" />
        </linearGradient>
        <radialGradient id={`${gid}-violet`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#9F7BFF" stopOpacity="0.32" />
          <stop offset="1" stopColor="#9F7BFF" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${gid}-orange`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#F4AB34" stopOpacity="0.24" />
          <stop offset="1" stopColor="#F4AB34" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="240" fill={`url(#${gid}-grad)`} />
      <circle cx={120 + offset} cy="60" r="140" fill={`url(#${gid}-violet)`} />
      <circle cx={320 - offset} cy="200" r="100" fill={`url(#${gid}-orange)`} />
      <path
        d={`M -20 ${140 + offset / 4} Q 100 ${80 + offset / 6} 220 ${130 + offset / 5} T 460 ${100 + offset / 8}`}
        stroke="#9F7BFF"
        strokeOpacity="0.18"
        strokeWidth="1.2"
        fill="none"
      />
      <path
        d={`M -20 ${190 - offset / 5} Q 110 ${140 - offset / 4} 240 ${180 - offset / 6} T 460 ${160}`}
        stroke="#F4AB34"
        strokeOpacity="0.22"
        strokeWidth="1"
        fill="none"
      />
    </svg>
  );
}
