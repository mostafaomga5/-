import React, { useState } from 'react';
import { Layers } from 'lucide-react';

interface IndustrialImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectClass?: string;
  badgeText?: string;
  overlayGradient?: boolean;
}

export const IndustrialImage: React.FC<IndustrialImageProps> = ({
  src,
  alt,
  className = '',
  aspectClass = 'aspect-[16/10]',
  badgeText,
  overlayGradient = false,
}) => {
  const [hasError, setHasError] = useState(false);

  return (
    <div
      className={`relative overflow-hidden bg-slate-100 ${aspectClass} ${className}`}
    >
      {!hasError ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setHasError(true)}
          className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-[1.02]"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200">
          <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-[#1D6BF3] mb-2">
            <Layers className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-[#0B2A5B] line-clamp-2">{alt}</span>
        </div>
      )}

      {overlayGradient && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#071936]/80 via-[#071936]/20 to-transparent" />
      )}

      {badgeText && (
        <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#10B981] text-white shadow-sm">
          {badgeText}
        </span>
      )}
    </div>
  );
};
