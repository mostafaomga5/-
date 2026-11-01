import React from 'react';
import { BadgeCheck, ShieldCheck } from 'lucide-react';
import { usePlastico } from '../context/PlasticoContext';

export interface VerifiedFactoryBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'pill' | 'compact' | 'banner';
  labelAr?: string;
  labelEn?: string;
  isoCertified?: boolean;
  className?: string;
}

export const VerifiedFactoryBadge: React.FC<VerifiedFactoryBadgeProps> = ({
  size = 'md',
  variant = 'pill',
  labelAr = 'مصنع موثق',
  labelEn = 'Verified Factory',
  isoCertified = false,
  className = '',
}) => {
  const { t } = usePlastico();

  if (variant === 'compact') {
    return (
      <span
        data-testid="verified-factory-badge"
        title={t(
          'مصنع موثق ومعتمد في منصة بلاستيكو الصناعية',
          'Verified & Audited Factory on PLASTICO Platform'
        )}
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-[#059669] border border-emerald-200/90 text-[11px] font-extrabold shrink-0 ${className}`}
      >
        <BadgeCheck className="w-3.5 h-3.5 text-[#10B981] fill-emerald-100 shrink-0" />
        <span>{t(labelAr, labelEn)}</span>
      </span>
    );
  }

  if (variant === 'banner') {
    return (
      <div
        data-testid="verified-factory-badge"
        className={`flex items-center justify-between gap-3 p-3 rounded-2xl bg-gradient-to-l from-emerald-50 via-teal-50/70 to-blue-50/60 border border-emerald-200/90 ${className}`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#10B981] text-white flex items-center justify-center shrink-0 shadow-2xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-extrabold text-[#0B2A5B]">
                {t(labelAr, labelEn)}
              </span>
              <BadgeCheck className="w-4 h-4 text-[#10B981] fill-emerald-100 shrink-0" />
            </div>
            <p className="text-[11px] text-slate-600 font-medium">
              {t(
                'تم التحقق من السجل الصناعي، خطوط الإنتاج، ومعايير الجودة',
                'Industrial registry, production lines & quality standards verified'
              )}
            </p>
          </div>
        </div>
        {isoCertified && (
          <span className="px-2.5 py-1 rounded-full bg-white text-[#059669] border border-emerald-200 text-[11px] font-extrabold shrink-0 shadow-2xs">
            ISO 9001
          </span>
        )}
      </div>
    );
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3.5 py-1.5 text-xs sm:text-sm gap-1.5',
  }[size];

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size];

  return (
    <span
      data-testid="verified-factory-badge"
      title={t(
        'مصنع موثق ومعتمد في منصة بلاستيكو الصناعية',
        'Verified & Audited Factory on PLASTICO Platform'
      )}
      className={`inline-flex items-center rounded-full bg-emerald-50 text-[#059669] border border-emerald-200/90 font-extrabold shadow-2xs shrink-0 ${sizeClasses} ${className}`}
    >
      <ShieldCheck className={`${iconSizes} text-[#10B981] fill-emerald-100 shrink-0`} />
      <span>{t(labelAr, labelEn)}</span>
      {isoCertified && (
        <span className="ms-0.5 px-1.5 py-0.2 rounded-full bg-emerald-600 text-white text-[9px] font-extrabold">
          ISO
        </span>
      )}
    </span>
  );
};
