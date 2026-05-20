interface Props {
  size?: number
  className?: string
}

export function LogoIcon({ size = 40, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background */}
      <circle cx="100" cy="100" r="97" fill="#1B4332" />

      {/* Outer amber border */}
      <circle cx="100" cy="100" r="97" fill="none" stroke="#D97706" strokeWidth="4" />

      {/* Inner amber ring */}
      <circle cx="100" cy="100" r="80" fill="none" stroke="#D97706" strokeWidth="1.5" />

      {/* Text arc path (top half) */}
      <defs>
        <path id="ii-top-arc" d="M 20 100 A 80 80 0 0 1 180 100" />
      </defs>

      {/* "INFIELD · INTEL" arched across the top */}
      <text
        fontFamily="'Oswald', sans-serif"
        fontSize="16"
        fontWeight="700"
        fill="white"
        letterSpacing="3"
      >
        <textPath href="#ii-top-arc" startOffset="50%" textAnchor="middle">
          INFIELD · INTEL
        </textPath>
      </text>

      {/* Left baseball seam curve */}
      <path
        d="M 74 46 Q 46 100 74 154"
        fill="none"
        stroke="#D97706"
        strokeWidth="1.5"
      />
      {/* Left seam tick marks */}
      <line x1="65"  y1="63"  x2="75"  y2="67"  stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="57"  y1="82"  x2="67"  y2="85"  stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="54"  y1="100" x2="64"  y2="100" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="57"  y1="118" x2="67"  y2="115" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="65"  y1="136" x2="75"  y2="132" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />

      {/* Right baseball seam curve */}
      <path
        d="M 126 46 Q 154 100 126 154"
        fill="none"
        stroke="#D97706"
        strokeWidth="1.5"
      />
      {/* Right seam tick marks */}
      <line x1="125" y1="67"  x2="135" y2="63"  stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="133" y1="85"  x2="143" y2="82"  stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="136" y1="100" x2="146" y2="100" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="133" y1="115" x2="143" y2="118" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="125" y1="132" x2="135" y2="136" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />

      {/* Baseball diamond outline */}
      <polygon
        points="100,60 130,90 100,120 70,90"
        fill="none"
        stroke="#D97706"
        strokeWidth="2"
      />

      {/* Base dots at each corner of the diamond */}
      <circle cx="100" cy="60"  r="3.5" fill="#D97706" />
      <circle cx="130" cy="90"  r="3.5" fill="#D97706" />
      <circle cx="100" cy="120" r="3.5" fill="#D97706" />
      <circle cx="70"  cy="90"  r="3.5" fill="#D97706" />

      {/* "II" monogram in center of diamond */}
      <text
        x="100"
        y="97"
        textAnchor="middle"
        fontFamily="'Oswald', sans-serif"
        fontSize="24"
        fontWeight="700"
        fill="#D97706"
      >
        II
      </text>

      {/* EST. 2025 */}
      <text
        x="100"
        y="150"
        textAnchor="middle"
        fontFamily="'Oswald', sans-serif"
        fontSize="11"
        fontWeight="500"
        fill="white"
        letterSpacing="2.5"
      >
        EST. 2025
      </text>

      {/* Decorative amber dots flanking EST text */}
      <circle cx="62" cy="148" r="2.5" fill="#D97706" />
      <circle cx="138" cy="148" r="2.5" fill="#D97706" />
    </svg>
  )
}
