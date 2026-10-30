import React from 'react';

interface PilotScarfLogoProps {
  className?: string;
  size?: number;
}

export const PilotScarfLogo: React.FC<PilotScarfLogoProps> = ({ className = 'w-7 h-7', size }) => {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
    >
      {/* Aviator flight goggles strap */}
      <path
        d="M6 26C6 26 10 24 16 24M42 26C42 26 38 24 32 24"
        stroke="#F59E0B"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Fluttering Pilot Scarf tails in wind (The iconic Zigzag scarf) */}
      <path
        d="M20 28C22 33 26 36 29 42C31 46 36 44 38 39C40 33 42 27 44 21C45 18 42 16 38 18C33 21 28 22 23 25"
        fill="url(#scarfGrad1)"
      />
      <path
        d="M24 29C25 34 29 38 32 43C34 46 38 45 40 40C41 36 43 31 44 26"
        stroke="#D97706"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      
      {/* Second wave of scarf */}
      <path
        d="M17 28C15 34 14 38 10 42C8 44 5 42 6 38C8 32 11 28 15 26"
        fill="url(#scarfGrad2)"
      />

      {/* Aviator Goggles Left lens frame */}
      <rect
        x="12"
        y="17"
        width="11"
        height="11"
        rx="3.5"
        fill="#1E293B"
        stroke="#F59E0B"
        strokeWidth="2.5"
      />
      {/* Aviator Goggles Right lens frame */}
      <rect
        x="25"
        y="17"
        width="11"
        height="11"
        rx="3.5"
        fill="#1E293B"
        stroke="#F59E0B"
        strokeWidth="2.5"
      />

      {/* Bridge connector */}
      <path
        d="M23 22.5H25"
        stroke="#F59E0B"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Glass reflections */}
      <line
        x1="15"
        y1="20"
        x2="19"
        y2="24"
        stroke="#38BDF8"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="28"
        y1="20"
        x2="32"
        y2="24"
        stroke="#38BDF8"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      <defs>
        <linearGradient id="scarfGrad1" x1="20" y1="18" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FBBF24" />
          <stop offset="1" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="scarfGrad2" x1="6" y1="26" x2="17" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F59E0B" />
          <stop offset="1" stopColor="#B45309" />
        </linearGradient>
      </defs>
    </svg>
  );
};
