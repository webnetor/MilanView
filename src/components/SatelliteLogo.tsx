import React from 'react';

interface SatelliteLogoProps {
  isBroadcasting?: boolean;
  className?: string;
  size?: number;
  showBadge?: boolean;
}

export const SatelliteLogo: React.FC<SatelliteLogoProps> = ({
  isBroadcasting = false,
  className = '',
  size = 24,
  showBadge = false,
}) => {
  // When broadcasting is active, change from red to vibrant emerald green/cyan
  const primaryColor = isBroadcasting ? '#10B981' : '#DC2626';
  const secondaryColor = isBroadcasting ? '#059669' : '#B91C1C';
  const solarPanelColor = isBroadcasting ? '#34D399' : '#EF4444';
  const waveColor = isBroadcasting ? '#6EE7B7' : '#F87171';
  const glowColor = isBroadcasting ? 'rgba(16, 185, 129, 0.4)' : 'rgba(220, 38, 38, 0.35)';

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`transition-all duration-300 ${isBroadcasting ? 'scale-105' : ''}`}
        style={{ filter: `drop-shadow(0 2px 6px ${glowColor})` }}
      >
        <defs>
          <linearGradient id={isBroadcasting ? 'satGradActive' : 'satGradNormal'} x1="4" y1="4" x2="28" y2="28">
            <stop offset="0%" stopColor={solarPanelColor} />
            <stop offset="100%" stopColor={secondaryColor} />
          </linearGradient>
          <radialGradient id={isBroadcasting ? 'dishGlowActive' : 'dishGlowNormal'} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
            <stop offset="100%" stopColor={primaryColor} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer Beaming Wave Rings when broadcasting or subtle pulse */}
        {isBroadcasting ? (
          <g className="animate-pulse">
            <path
              d="M20 7C22.5 9 24 12 24 15.5C24 19 22.5 22 20 24"
              stroke={waveColor}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeDasharray="2 1"
              opacity="0.9"
            />
            <path
              d="M24 4C27.5 7 29.5 11 29.5 15.5C29.5 20 27.5 24 24 27"
              stroke={waveColor}
              strokeWidth="1.8"
              strokeLinecap="round"
              opacity="0.6"
            />
          </g>
        ) : (
          <path
            d="M21 9C22.8 10.8 23.5 13.2 23.5 15.5"
            stroke={waveColor}
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.5"
          />
        )}

        {/* Left Solar Panel Array */}
        <rect
          x="3"
          y="7"
          width="7"
          height="11"
          rx="1.5"
          fill={solarPanelColor}
          fillOpacity="0.25"
          stroke={primaryColor}
          strokeWidth="1.2"
        />
        {/* Solar grid lines */}
        <line x1="3" y1="10.7" x2="10" y2="10.7" stroke={primaryColor} strokeWidth="0.8" opacity="0.7" />
        <line x1="3" y1="14.3" x2="10" y2="14.3" stroke={primaryColor} strokeWidth="0.8" opacity="0.7" />
        <line x1="6.5" y1="7" x2="6.5" y2="18" stroke={primaryColor} strokeWidth="0.8" opacity="0.7" />

        {/* Central Left Strut */}
        <line x1="10" y1="12.5" x2="13" y2="12.5" stroke={secondaryColor} strokeWidth="1.5" strokeLinecap="round" />

        {/* Central Satellite Chassis / Body (Rotated diamond/capsule) */}
        <rect
          x="13"
          y="8"
          width="8"
          height="9"
          rx="2"
          fill={`url(#${isBroadcasting ? 'satGradActive' : 'satGradNormal'})`}
          stroke={secondaryColor}
          strokeWidth="1.2"
        />

        {/* Central Lens / Sensor Eye */}
        <circle cx="17" cy="12.5" r="2" fill="#FFFFFF" opacity="0.9" />
        <circle cx="17" cy="12.5" r="1" fill={primaryColor} />

        {/* Parabolic Antenna Dish / Transceiver on Bottom-Right */}
        <path
          d="M17 17L14 25"
          stroke={secondaryColor}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* Parabolic Dish Arc */}
        <path
          d="M10 24C12 21 17 21 21 24"
          stroke={primaryColor}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Sub-reflector feed horn pin */}
        <line x1="15.5" y1="22" x2="15.5" y2="25.5" stroke={primaryColor} strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="15.5" cy="26" r="1.2" fill={waveColor} />

        {/* Right Solar Array Extension */}
        <line x1="21" y1="12.5" x2="23" y2="12.5" stroke={secondaryColor} strokeWidth="1.5" strokeLinecap="round" />
        <rect
          x="23"
          y="8.5"
          width="5.5"
          height="8"
          rx="1.2"
          fill={solarPanelColor}
          fillOpacity="0.25"
          stroke={primaryColor}
          strokeWidth="1.2"
        />
        <line x1="23" y1="12.5" x2="28.5" y2="12.5" stroke={primaryColor} strokeWidth="0.8" opacity="0.7" />
        <line x1="25.8" y1="8.5" x2="25.8" y2="16.5" stroke={primaryColor} strokeWidth="0.8" opacity="0.7" />

        {/* Live Broadcast Blinking LED */}
        <circle
          cx="17"
          cy="9.5"
          r="0.9"
          fill="#FFFFFF"
          className={isBroadcasting ? 'animate-ping' : ''}
        />
      </svg>

      {/* Optional Active Live Pill Badge */}
      {showBadge && isBroadcasting && (
        <span className="absolute -bottom-1 -right-1 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
      )}
    </div>
  );
};
