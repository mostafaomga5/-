import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  Layers,
  Building2,
  Wrench,
  Briefcase,
  Package,
  Camera,
  ArrowUpLeft,
} from 'lucide-react';
import { usePlastico } from '../context/PlasticoContext';
import { globalSearchEntities, isVerifiedFactoryProvider } from '../lib/domainRules';
import { VerifiedFactoryBadge } from './VerifiedFactoryBadge';

export const GlobalSearchModal: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    t,
    requests,
    providers,
    faults,
    jobs,
    market,
  } = usePlastico();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  if (!isSearchOpen) return null;

  const results = globalSearchEntities(query, {
    requests,
    providers,
    faults,
    jobs,
    market,
  });

  const handleGo = (path: string) => {
    setIsSearchOpen(false);
    navigate(path);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-4 bg-[#0B2A5B]/40 backdrop-blur-xs">
      <div
        className="w-full max-w-2xl rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label={t('البحث الشامل في بلاستيكو', 'PLASTICO Global Search')}
      >
        {/* Top Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50/70">
          <Search className="w-5 h-5 text-[#1D6BF3] shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t(
              'ابحث عن ماكينات، خامات، أعطال، وظائف، أو طلبات تصنيع...',
              'Search machines, resins, faults, jobs, or RFQs...'
            )}
            className="w-full bg-transparent text-[#0B2A5B] placeholder-[#64748B] text-sm sm:text-base focus:outline-none"
          />
          <button
            type="button"
            onClick={() => handleGo('/app/visual-search')}
            title={t('البحث بالصورة', 'Visual Search')}
            className="p-2 rounded-xl bg-[#0B2A5B] text-white hover:bg-[#1D6BF3] transition-colors shrink-0"
          >
            <Camera className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsSearchOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[68vh] overflow-y-auto p-5 space-y-5">
          {!query.trim() ? (
            <div className="space-y-4">
              <p className="text-xs font-bold text-slate-500">
                {t('عمليات بحث سريعة ومقترحة:', 'Quick & Suggested Searches:')}
              </p>
              <div className="flex flex-wrap gap-2">
                {['HDPE', 'PP', 'Haitian', 'قالب حقن', 'صيانة', 'عبوات', 'سيرفو'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setQuery(tag)}
                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-100 hover:bg-blue-50 text-[#0B2A5B] hover:text-[#1D6BF3] border border-slate-200 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : results.total === 0 ? (
            <div className="py-10 text-center text-sm text-slate-500">
              {t('لا توجد نتائج مطابقة لبحثك حالياً.', 'No matching results found.')}
            </div>
          ) : (
            <div className="space-y-5">
              {results.requests.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-[#6366F1] mb-2">
                    <Layers className="w-4 h-4" />
                    <span>{t('طلبات التصنيع (RFQ)', 'Manufacturing RFQs')}</span>
                  </div>
                  <div className="space-y-1.5">
                    {results.requests.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => handleGo(`/app/manufacturing/requests/${r.id}`)}
                        className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200/80 text-start transition-colors"
                      >
                        <div>
                          <div className="text-sm font-bold text-[#0B2A5B]">{t(r.titleAr, r.titleEn)}</div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {r.material} · {r.quantity.toLocaleString()} {r.unit}
                          </div>
                        </div>
                        <ArrowUpLeft className="w-4 h-4 text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results.faults.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-[#EF4444] mb-2">
                    <Wrench className="w-4 h-4" />
                    <span>{t('منصة الأعطال الصناعية', 'Industrial Faults')}</span>
                  </div>
                  <div className="space-y-1.5">
                    {results.faults.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => handleGo(`/app/faults/${f.id}`)}
                        className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200/80 text-start transition-colors"
                      >
                        <div>
                          <div className="text-sm font-bold text-[#0B2A5B]">{t(f.titleAr, f.titleEn)}</div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {f.machineType} · {f.polymerMaterial}
                          </div>
                        </div>
                        <ArrowUpLeft className="w-4 h-4 text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results.jobs.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1D6BF3] mb-2">
                    <Briefcase className="w-4 h-4" />
                    <span>{t('الوظائف الصناعية', 'Industrial Jobs')}</span>
                  </div>
                  <div className="space-y-1.5">
                    {results.jobs.map((j) => (
                      <button
                        key={j.id}
                        type="button"
                        onClick={() => handleGo(`/app/jobs/${j.id}`)}
                        className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200/80 text-start transition-colors"
                      >
                        <div>
                          <div className="text-sm font-bold text-[#0B2A5B]">{t(j.titleAr, j.titleEn)}</div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {j.companyName} · {j.city}
                          </div>
                        </div>
                        <ArrowUpLeft className="w-4 h-4 text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results.market.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-[#F97316] mb-2">
                    <Package className="w-4 h-4" />
                    <span>{t('سوق الماكينات والخامات', 'Marketplace')}</span>
                  </div>
                  <div className="space-y-1.5">
                    {results.market.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleGo(`/app/market/${m.id}`)}
                        className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200/80 text-start transition-colors"
                      >
                        <div>
                          <div className="text-sm font-bold text-[#0B2A5B]">{t(m.titleAr, m.titleEn)}</div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {m.price.toLocaleString()} {m.currency} · {m.city}
                          </div>
                        </div>
                        <ArrowUpLeft className="w-4 h-4 text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results.providers.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-[#10B981] mb-2">
                    <Building2 className="w-4 h-4" />
                    <span>{t('المصانع المعتمدة', 'Verified Factories')}</span>
                  </div>
                  <div className="space-y-1.5">
                    {results.providers.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleGo(`/app/manufacturing/providers/${p.id}`)}
                        className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200/80 text-start transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-bold text-[#0B2A5B]">
                              {t(p.nameAr, p.nameEn)}
                            </span>
                            {isVerifiedFactoryProvider(p) && (
                              <VerifiedFactoryBadge variant="compact" />
                            )}
                          </div>
                          <div className="text-xs text-slate-500">
                            {p.city} · {p.industrialArea}
                          </div>
                        </div>
                        <ArrowUpLeft className="w-4 h-4 text-slate-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
