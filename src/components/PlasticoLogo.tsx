import React from 'react';

interface PlasticoLogoProps {
  variant?: 'horizontal' | 'stacked';
  theme?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg' | 'xl';
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
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const arTextSizes = {
    sm: 'text-lg leading-none',
    md: 'text-xl leading-none',
    lg: 'text-3xl leading-none',
    xl: 'text-4xl leading-none',
  };

  const enTextSizes = {
    sm: 'text-[9px] tracking-[0.18em]',
    md: 'text-[10px] tracking-[0.2em]',
    lg: 'text-xs tracking-[0.22em]',
    xl: 'text-sm tracking-[0.24em]',
  };

  const textColor = theme === 'dark' ? 'text-white' : 'text-[#0B2A5B]';
  const subTextColor = theme === 'dark' ? 'text-blue-200' : 'text-[#1E3A8A]';

  if (variant === 'stacked') {
    return (
      <div className={`inline-flex flex-col items-center text-center select-none ${className}`}>
        <img
          src="/brand/plastico-symbol.svg"
          alt="PLASTICO"
          className={`${iconSizes[size]} object-contain drop-shadow-sm`}
        />
        <span className={`font-extrabold ${arTextSizes[size]} ${textColor} mt-1.5`}>
          بلاستيكو
        </span>
        <span className={`font-extrabold uppercase ${enTextSizes[size]} ${textColor} mt-1`}>
          PLASTICO
        </span>
        {showTagline && (
          <span className={`text-xs font-semibold ${subTextColor} mt-1.5`}>
            معاً نصنع مستقبل صناعتنا
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <img
        src="/brand/plastico-symbol.svg"
        alt="PLASTICO"
        className={`${iconSizes[size]} object-contain shrink-0`}
      />
      <div className="flex flex-col items-start leading-none">
        <span className={`font-extrabold ${arTextSizes[size]} ${textColor}`}>
          بلاستيكو
        </span>
        <span className={`font-extrabold uppercase ${enTextSizes[size]} ${textColor} mt-1`}>
          PLASTICO
        </span>
      </div>
    </div>
  );
};
