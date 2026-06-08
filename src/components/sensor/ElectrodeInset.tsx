import { useId } from 'react';

/** Close-up electrode fabric — aligned with more_details_page mockup. */
export function ElectrodeInset() {
  const clipId = useId();

  return (
    <svg
      className="electrode-inset-svg"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <clipPath id={clipId}>
          <circle cx="60" cy="60" r="58" />
        </clipPath>
        <radialGradient id="electrodeMetal" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#d8d8d8" />
          <stop offset="55%" stopColor="#9a9a9a" />
          <stop offset="100%" stopColor="#5a5a5a" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="58" fill="#111" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
      <g clipPath={`url(#${clipId})`}>
        <rect width="120" height="120" fill="#0d0d0d" />
        <path
          d="M8 38 H112 M8 62 H112 M8 86 H112 M28 18 V102 M92 18 V102"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth="1"
        />
        <path
          d="M28 38 H52 M68 38 H92 M28 38 L60 62 L92 38 M28 62 H60 M60 62 H92"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="1.1"
        />
        <circle cx="28" cy="38" r="11" fill="url(#electrodeMetal)" stroke="#c8c8c8" strokeWidth="0.8" />
        <circle cx="92" cy="38" r="11" fill="url(#electrodeMetal)" stroke="#c8c8c8" strokeWidth="0.8" />
        <circle cx="60" cy="62" r="11" fill="url(#electrodeMetal)" stroke="#c8c8c8" strokeWidth="0.8" />
      </g>
    </svg>
  );
}
