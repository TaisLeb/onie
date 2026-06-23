/* Hand-built SVG product renders + icons — fully self-contained, no photos. */

export function Tube() {
  return (
    <svg viewBox="0 0 120 260" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="tubeBody" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fbf8e7" />
          <stop offset="0.5" stopColor="#efe9cf" />
          <stop offset="1" stopColor="#d9d2b0" />
        </linearGradient>
      </defs>
      {/* crimp */}
      <rect x="34" y="6" width="52" height="16" rx="3" fill="#0b0b0a" />
      <path d="M34 22h52l-6 14H40z" fill="#15140f" />
      {/* body */}
      <path
        d="M38 36h44c4 0 6 4 6 9v176c0 14-13 25-28 25s-28-11-28-25V45c0-5 2-9 6-9z"
        fill="url(#tubeBody)"
      />
      {/* highlight */}
      <rect x="45" y="50" width="6" height="150" rx="3" fill="#ffffff" opacity="0.6" />
      {/* lilac accent dot */}
      <circle cx="74" cy="74" r="9" fill="#9a7bd0" />
      {/* label text */}
      <rect x="48" y="120" width="30" height="3" rx="1.5" fill="#0b0b0a" opacity="0.5" />
      <rect x="48" y="130" width="22" height="2.5" rx="1.25" fill="#0b0b0a" opacity="0.3" />
    </svg>
  );
}

export function Jar() {
  return (
    <svg viewBox="0 0 160 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="jarLid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a2a26" />
          <stop offset="1" stopColor="#0b0b0a" />
        </linearGradient>
        <linearGradient id="jarBody" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#1a1a16" />
          <stop offset="0.5" stopColor="#37362f" />
          <stop offset="1" stopColor="#0b0b0a" />
        </linearGradient>
      </defs>
      {/* body */}
      <rect x="22" y="78" width="116" height="100" rx="18" fill="url(#jarBody)" />
      <rect x="34" y="92" width="6" height="64" rx="3" fill="#ffffff" opacity="0.18" />
      {/* lid */}
      <rect x="14" y="34" width="132" height="52" rx="14" fill="url(#jarLid)" />
      <rect x="14" y="34" width="132" height="10" rx="5" fill="#ffffff" opacity="0.08" />
      {/* logo dot */}
      <circle cx="80" cy="60" r="6" fill="#9a7bd0" />
      <rect x="58" y="128" width="44" height="3" rx="1.5" fill="#fbf8e7" opacity="0.6" />
    </svg>
  );
}

export function Serum() {
  return (
    <svg viewBox="0 0 90 270" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="serBody" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#15140f" />
          <stop offset="0.5" stopColor="#33322b" />
          <stop offset="1" stopColor="#0b0b0a" />
        </linearGradient>
      </defs>
      {/* cap */}
      <rect x="33" y="6" width="24" height="40" rx="4" fill="#0b0b0a" />
      <rect x="36" y="46" width="18" height="10" fill="#2a2a26" />
      {/* body */}
      <rect x="26" y="56" width="38" height="206" rx="14" fill="url(#serBody)" />
      <rect x="34" y="74" width="5" height="150" rx="2.5" fill="#ffffff" opacity="0.18" />
      <circle cx="45" cy="92" r="7" fill="#9a7bd0" />
      <rect x="34" y="150" width="22" height="3" rx="1.5" fill="#fbf8e7" opacity="0.5" />
      <rect x="34" y="160" width="16" height="2.5" rx="1.25" fill="#fbf8e7" opacity="0.3" />
    </svg>
  );
}

/** Large hero/spotlight tube (cream, premium). */
export function HydraTube() {
  return (
    <svg viewBox="0 0 140 320" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="hBody" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fdfbef" />
          <stop offset="0.45" stopColor="#f0ead2" />
          <stop offset="1" stopColor="#cfc7a4" />
        </linearGradient>
        <radialGradient id="hGlow" cx="0.5" cy="0.3" r="0.7">
          <stop offset="0" stopColor="#b79be6" stopOpacity="0.55" />
          <stop offset="1" stopColor="#b79be6" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="70" cy="150" rx="90" ry="120" fill="url(#hGlow)" />
      <rect x="40" y="8" width="60" height="18" rx="3" fill="#0b0b0a" />
      <path d="M40 26h60l-7 16H47z" fill="#15140f" />
      <path
        d="M45 42h50c5 0 7 5 7 11v216c0 17-15 31-32 31s-32-14-32-31V53c0-6 2-11 7-11z"
        fill="url(#hBody)"
      />
      <rect x="54" y="60" width="7" height="190" rx="3.5" fill="#ffffff" opacity="0.65" />
      <circle cx="85" cy="92" r="11" fill="#9a7bd0" />
      <rect x="58" y="150" width="34" height="3.5" rx="1.75" fill="#0b0b0a" opacity="0.55" />
      <rect x="58" y="162" width="26" height="3" rx="1.5" fill="#0b0b0a" opacity="0.35" />
      <rect x="58" y="172" width="30" height="2.5" rx="1.25" fill="#0b0b0a" opacity="0.25" />
    </svg>
  );
}

export function Leaf() {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M100 16c46 26 70 60 70 96 0 40-31 72-70 72S30 152 30 112c0-36 24-70 70-96z"
        fill="#7fae57"
      />
      <path
        d="M100 16c46 26 70 60 70 96 0 40-31 72-70 72V16z"
        fill="#9fc46a"
      />
      <path
        d="M100 40v140M100 70l34-20M100 100l40-22M100 130l34-18M100 70L66 50M100 100l-40-22M100 130l-34-18"
        stroke="#3d5a2a"
        strokeWidth="2"
        opacity="0.5"
      />
    </svg>
  );
}

/* A warm, soft-focus botanical behind the model: gradient-filled foliage
   with real depth-of-field blur and butter "dappled light", so she reads
   as standing in a dreamy lilac thicket — organic, not clip-art. */
export function LilacForest() {
  return (
    <svg
      viewBox="0 0 400 500"
      preserveAspectRatio="xMidYMax slice"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <filter id="lf-far" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="15" />
        </filter>
        <filter id="lf-mid" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <filter id="lf-near" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>

        {/* warm-lit lilac, light catches the upper edge */}
        <linearGradient id="lf-gWarm" x1="0.2" y1="0" x2="0.7" y2="1">
          <stop offset="0" stopColor="#efe2c6" />
          <stop offset="0.42" stopColor="#cdb4e6" />
          <stop offset="1" stopColor="#a98fd0" />
        </linearGradient>
        <linearGradient id="lf-gCool" x1="0.3" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor="#dac9ef" />
          <stop offset="1" stopColor="#9a7bc8" />
        </linearGradient>
        <linearGradient id="lf-gDeep" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#b89ddb" />
          <stop offset="1" stopColor="#7d61b0" />
        </linearGradient>
        <radialGradient id="lf-bokeh" cx="0.5" cy="0.45" r="0.5">
          <stop offset="0" stopColor="#fbf3d6" stopOpacity="0.9" />
          <stop offset="1" stopColor="#fbf3d6" stopOpacity="0" />
        </radialGradient>

        {/* organic leaf shapes, centred on origin, pointing up */}
        <path
          id="lf-broad"
          d="M0,-60 C40,-46 42,26 6,64 C2,66 -2,66 -6,64 C-42,26 -40,-46 0,-60 Z"
        />
        <path
          id="lf-slim"
          d="M0,-72 C20,-50 22,28 4,72 C2,74 -2,74 -4,72 C-22,28 -20,-50 0,-72 Z"
        />
      </defs>

      {/* far layer — heavily blurred bokeh foliage, warm and soft */}
      <g filter="url(#lf-far)" opacity="0.75">
        <use href="#lf-broad" fill="url(#lf-gWarm)" transform="translate(56,110) rotate(-28) scale(2.0)" />
        <use href="#lf-broad" fill="url(#lf-gCool)" transform="translate(350,86) rotate(32) scale(2.2)" />
        <use href="#lf-slim" fill="url(#lf-gWarm)" transform="translate(384,268) rotate(74) scale(1.9)" />
        <use href="#lf-broad" fill="url(#lf-gCool)" transform="translate(14,252) rotate(-70) scale(1.8)" />
        <use href="#lf-slim" fill="url(#lf-gWarm)" transform="translate(150,70) rotate(-8) scale(1.7)" />
      </g>

      {/* warm dappled light coming through the canopy */}
      <g style={{ mixBlendMode: "screen" }}>
        <circle cx="120" cy="120" r="46" fill="url(#lf-bokeh)" />
        <circle cx="300" cy="180" r="34" fill="url(#lf-bokeh)" />
        <circle cx="250" cy="90" r="24" fill="url(#lf-bokeh)" />
        <circle cx="70" cy="300" r="30" fill="url(#lf-bokeh)" />
        <circle cx="340" cy="330" r="40" fill="url(#lf-bokeh)" />
      </g>

      {/* mid layer — softly blurred, gradient leaves */}
      <g filter="url(#lf-mid)" opacity="0.9">
        <use href="#lf-broad" fill="url(#lf-gWarm)" transform="translate(46,430) rotate(-22) scale(1.85)" />
        <use href="#lf-broad" fill="url(#lf-gCool)" transform="translate(356,416) rotate(24) scale(2.0)" />
        <use href="#lf-slim" fill="url(#lf-gWarm)" transform="translate(330,150) rotate(48) scale(1.5)" />
        <use href="#lf-slim" fill="url(#lf-gCool)" transform="translate(72,150) rotate(-48) scale(1.4)" />
      </g>

      {/* near layer — gentlest blur, deeper lilac framing the base */}
      <g filter="url(#lf-near)" opacity="0.95">
        <use href="#lf-broad" fill="url(#lf-gDeep)" transform="translate(6,478) rotate(-38) scale(1.95)" />
        <use href="#lf-broad" fill="url(#lf-gDeep)" transform="translate(394,490) rotate(42) scale(2.05)" />
        <use href="#lf-slim" fill="url(#lf-gDeep)" transform="translate(204,508) rotate(6) scale(1.7)" />
      </g>
    </svg>
  );
}

export function IconYoutube() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="5" width="20" height="14" rx="4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10 9.5l5 2.5-5 2.5z" fill="currentColor" />
    </svg>
  );
}
export function IconInstagram() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17" cy="7" r="1.2" fill="currentColor" />
    </svg>
  );
}
export function IconTwitter() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M22 5.8c-.7.3-1.5.5-2.3.6.8-.5 1.5-1.3 1.8-2.3-.8.5-1.7.8-2.6 1A4 4 0 0 0 12 8.5c0 .3 0 .6.1.9-3.3-.2-6.3-1.8-8.3-4.3-.4.6-.5 1.3-.5 2 0 1.4.7 2.6 1.8 3.3-.7 0-1.3-.2-1.8-.5v.1c0 1.9 1.4 3.5 3.2 3.9-.6.2-1.3.2-1.9.1.5 1.6 2 2.7 3.7 2.8A8 8 0 0 1 2 18.6 11.3 11.3 0 0 0 8.1 20c7.3 0 11.3-6 11.3-11.3v-.5c.8-.6 1.4-1.3 2-2z"
        fill="currentColor"
      />
    </svg>
  );
}
