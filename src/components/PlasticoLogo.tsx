import React from 'react';

interface PlasticoLogoProps {
  variant?: 'horizontal' | 'stacked' | 'icon' | 'compact';
  theme?: 'light' | 'dark' | 'monochrome';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
}

export const PlasticoLogo: React.FC<PlasticoLogoProps> = ({
  variant = 'horizontal',
  theme = 'light',
  size = 'md',
  showTagline = false,
  className = '',
}) => {
  const uid = React.useId().replace(/:/g, '');

  const sizeMap = {
    xs: {
      icon: 'w-7 h-7',
      en: 'text-sm',
      ar: 'text-[10px]',
      tag: 'text-[9px]',
      gap: 'gap-2',
    },
    sm: {
      icon: 'w-9 h-9',
      en: 'text-base sm:text-lg',
      ar: 'text-[11px]',
      tag: 'text-[10px]',
      gap: 'gap-2.5',
    },
    md: {
      icon: 'w-10 h-10 sm:w-11 sm:h-11',
      en: 'text-lg sm:text-xl',
      ar: 'text-xs',
      tag: 'text-[11px]',
      gap: 'gap-3',
    },
    lg: {
      icon: 'w-13 h-13 sm:w-15 sm:h-15',
      en: 'text-2xl sm:text-3xl',
      ar: 'text-sm',
      tag: 'text-xs',
      gap: 'gap-3.5',
    },
    xl: {
      icon: 'w-16 h-16 sm:w-20 sm:h-20',
      en: 'text-3xl sm:text-4xl',
      ar: 'text-base',
      tag: 'text-xs sm:text-sm',
      gap: 'gap-4',
    },
  }[size];

  const isDark = theme === 'dark';
  const isMono = theme === 'monochrome';

  const enColor = isMono
    ? 'text-current'
    : isDark
    ? 'text-white'
    : 'text-[#071A33]';

  const arColor = isMono
    ? 'text-current opacity-80'
    : isDark
    ? 'text-[#27BED6]'
    : 'text-[#1769E8]';

  const tagColor = isMono
    ? 'text-current opacity-70'
    : isDark
    ? 'text-slate-300'
    : 'text-[#718096]';

  const renderMark = () => (
    <div className={`${sizeMap.icon} relative shrink-0 select-none flex items-center justify-center`}>
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-xs"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id={`pBlue-${uid}`}
            x1="16"
            y1="14"
            x2="88"
            y2="104"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor={isMono ? 'currentColor' : '#27BED6'} />
            <stop offset="48%" stopColor={isMono ? 'currentColor' : '#1769E8'} />
            <stop offset="100%" stopColor={isMono ? 'currentColor' : '#0B3C8C'} />
          </linearGradient>
          <linearGradient
            id={`pOrange-${uid}`}
            x1="52"
            y1="16"
            x2="108"
            y2="86"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor={isMono ? 'currentColor' : '#FFAD52'} />
            <stop offset="60%" stopColor={isMono ? 'currentColor' : '#FF8A2A'} />
            <stop offset="100%" stopColor={isMono ? 'currentColor' : '#E06300'} />
          </linearGradient>
        </defs>

        {/* Outer Industrial Orange Loop */}
        <path
          d="M54 16H74C92.7777 16 108 31.2223 108 50C108 68.7777 92.7777 84 74 84H56V66H73C81.8366 66 89 58.8366 89 50C89 41.1634 81.8366 34 73 34H54V16Z"
          fill={`url(#pOrange-${uid})`}
          opacity={isMono ? 0.65 : 1}
        />

        {/* Primary Geometric Letter P */}
        <path
          d="M20 28C20 21.3726 25.3726 16 32 16H64C80.5685 16 94 29.4315 94 46C94 62.5685 80.5685 76 64 76H42V104H20V28ZM42 34V58H62C68.6274 58 74 52.6274 74 46C74 39.3726 68.6274 34 62 34H42Z"
          fill={`url(#pBlue-${uid})`}
        />

        {/* Connected Polymer Molecular Nodes */}
        <path
          d="M31 44L51 34L66 46"
          stroke="#FFFFFF"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.95"
        />
        <circle
          cx="31"
          cy="44"
          r="6"
          fill={isMono ? '#FFFFFF' : '#27BED6'}
          stroke={isDark ? '#071A33' : '#FFFFFF'}
          strokeWidth="2"
        />
        <circle cx="51" cy="34" r="5.5" fill="#FFFFFF" />
        <circle
          cx="66"
          cy="46"
          r="6.5"
          fill={isMono ? '#FFFFFF' : '#FF8A2A'}
          stroke="#FFFFFF"
          strokeWidth="2"
        />
      </svg>
    </div>
  );

  if (variant === 'icon' || variant === 'compact') {
    return <div className={`inline-flex items-center ${className}`}>{renderMark()}</div>;
  }

  if (variant === 'stacked') {
    return (
      <div className={`inline-flex flex-col items-center text-center gap-2 ${className}`}>
        {renderMark()}
        <div className="flex flex-col items-center leading-none">
          <div className="flex items-center gap-2">
            <span
              className={`${sizeMap.en} font-black tracking-tight font-['Inter',sans-serif] ${enColor}`}
            >
              PLASTICO
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF8A2A]" />
            <span className={`${sizeMap.ar} font-extrabold ${arColor}`}>بلاستيكو</span>
          </div>
          {showTagline && (
            <span className={`${sizeMap.tag} font-semibold mt-1 ${tagColor}`}>
              منظومة صناعة البلاستيك المتكاملة
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center ${sizeMap.gap} ${className}`}>
      {renderMark()}
      <div className="flex flex-col justify-center leading-tight">
        <div className="flex items-center gap-1.5">
          <span
            className={`${sizeMap.en} font-black tracking-tight font-['Inter',sans-serif] ${enColor}`}
          >
            PLASTICO
          </span>
          <span
            className={`${size === 'sm' ? 'hidden sm:inline-block' : 'inline-block'} w-1.5 h-1.5 rounded-full bg-[#FF8A2A]`}
          />
          <span
            className={`${size === 'sm' ? 'hidden sm:inline' : 'inline'} ${sizeMap.ar} font-extrabold ${arColor}`}
          >
            بلاستيكو
          </span>
        </div>
        {showTagline ? (
          <span className={`${sizeMap.tag} font-semibold ${tagColor} mt-0.5`}>
            كل صناعة البلاستيك. في مكان واحد.
          </span>
        ) : (
          <span
            className={`hidden sm:inline text-[10px] font-medium tracking-wide font-['Inter',sans-serif] ${tagColor}`}
          >
            The Plastics Industry Ecosystem
          </span>
        )}
      </div>
    </div>
  );
};

export default PlasticoLogo;
