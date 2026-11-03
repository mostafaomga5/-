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
  GraduationCap,
  Truck,
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
    suppliers,
    academyCourses,
    faults,
    jobs,
    market,
  } = usePlastico();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  if (!isSearchOpen) return null;

  const qLower = query.trim().toLowerCase();
  const results = globalSearchEntities(query, {
    requests,
    providers,
    faults,
    jobs,
    market,
  });

  const matchedSuppliers = qLower
    ? suppliers.filter(
        (s) =>
          s.companyNameAr.toLowerCase().includes(qLower) ||
          s.companyNameEn.toLowerCase().includes(qLower) ||
          s.supplierTypeLabelAr.toLowerCase().includes(qLower) ||
          s.categoriesAr.some((c) => c.toLowerCase().includes(qLower)) ||
          s.productsServicesAr.some((p) => p.toLowerCase().includes(qLower))
      )
    : [];

  const matchedCourses = qLower
    ? academyCourses.filter(
        (c) =>
          c.titleAr.toLowerCase().includes(qLower) ||
          c.titleEn.toLowerCase().includes(qLower) ||
          c.categoryAr.toLowerCase().includes(qLower) ||
          c.introAr.toLowerCase().includes(qLower)
      )
    : [];

  const totalCount =
    results.total + matchedSuppliers.length + matchedCourses.length;

  const handleGo = (path: string) => {
    setIsSearchOpen(false);
    navigate(path);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-4 bg-[#071A33]/60 backdrop-blur-xs">
      <div
        className="w-full max-w-2xl rounded-2xl bg-white border border-[#DFE7F1] shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label={t('البحث الشامل في بلاستيكو', 'PLASTICO Universal Search')}
      >
        {/* Top Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#DFE7F1] bg-[#F4F7FC]">
          <Search className="w-5 h-5 text-[#1769E8] shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t(
              'ابحث عن خامات، ماكينات، معدات مستعملة، موردين، مصانع، كورسات، وظائف، أو أعطال...',
              'Search raw materials, machines, used equipment, suppliers, factories, courses, jobs, or faults...'
            )}
            className="w-full bg-transparent text-[#13243B] placeholder-[#718096] text-sm sm:text-base focus:outline-none"
          />
          <button
            type="button"
            onClick={() => handleGo('/app/visual-search')}
            title={t('البحث بالصورة', 'Visual Search')}
            className="p-2 rounded-xl bg-[#071A33] text-white hover:bg-[#1769E8] transition-colors shrink-0"
          >
            <Camera className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsSearchOpen(false)}
            className="p-1.5 rounded-xl text-[#718096] hover:text-[#13243B] hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[68vh] overflow-y-auto p-5 space-y-5">
          {!query.trim() ? (
            <div className="space-y-4">
              <p className="text-xs font-bold text-[#718096]">
                {t('عمليات بحث سريعة عبر أقسام المنصة:', 'Quick Searches Across the Platform:')}
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  'سخانات',
                  'HDPE',
                  'PP',
                  'Haitian',
                  'شيلر',
                  'قالب حقن',
                  'ماسترباتش',
                  'صيانة',
                  'حقن',
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setQuery(tag)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#F4F7FC] hover:bg-[#1769E8] text-[#13243B] hover:text-white border border-[#DFE7F1] transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : totalCount === 0 ? (
            <div className="py-10 text-center text-sm text-[#718096]">
              {t('لا توجد نتائج مطابقة لبحثك حالياً.', 'No matching results found.')}
            </div>
          ) : (
            <div className="space-y-5">
              {results.market.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-extrabold text-[#FF8A2A] mb-2">
                    <Package className="w-4 h-4" />
                    <span>
                      {t('السوق الصناعي والمعدات المستعملة', 'Marketplace & Used Equipment')}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {results.market.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleGo(`/app/market/${m.id}`)}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-[#F4F7FC] hover:bg-blue-50/70 border border-[#DFE7F1] text-start transition-colors"
                      >
                        <div>
                          <div className="text-sm font-bold text-[#13243B]">
                            {t(m.titleAr, m.titleEn)}
                          </div>
                          <div className="text-xs text-[#718096] mt-0.5">
                            {m.conditionAr} · {m.price.toLocaleString()} {m.currency} · {m.city}
                          </div>
                        </div>
                        <ArrowUpLeft className="w-4 h-4 text-[#718096]" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {matchedSuppliers.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-extrabold text-[#1769E8] mb-2">
                    <Truck className="w-4 h-4" />
                    <span>{t('دليل الموردين الصناعيين', 'Suppliers Directory')}</span>
                  </div>
                  <div className="space-y-1.5">
                    {matchedSuppliers.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() =>
                          handleGo(`/app/suppliers?category=${s.supplierType}`)
                        }
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-[#F4F7FC] hover:bg-blue-50/70 border border-[#DFE7F1] text-start transition-colors"
                      >
                        <div>
                          <div className="text-sm font-bold text-[#13243B]">
                            {t(s.companyNameAr, s.companyNameEn)}
                          </div>
                          <div className="text-xs text-[#718096] mt-0.5">
                            {t(s.supplierTypeLabelAr, s.supplierTypeLabelEn)} · {s.city}، {s.country}
                          </div>
                        </div>
                        <ArrowUpLeft className="w-4 h-4 text-[#718096]" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {matchedCourses.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-extrabold text-[#27BED6] mb-2">
                    <GraduationCap className="w-4 h-4" />
                    <span>{t('أكاديمية بلاستيكو', 'PLASTICO Academy')}</span>
                  </div>
                  <div className="space-y-1.5">
                    {matchedCourses.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleGo(`/app/training?course=${c.id}`)}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-[#F4F7FC] hover:bg-blue-50/70 border border-[#DFE7F1] text-start transition-colors"
                      >
                        <div>
                          <div className="text-sm font-bold text-[#13243B]">
                            {t(c.titleAr, c.titleEn)}
                          </div>
                          <div className="text-xs text-[#718096] mt-0.5">
                            {c.categoryAr} · {c.hours} {t('ساعات تدريبية', 'training hours')}
                          </div>
                        </div>
                        <ArrowUpLeft className="w-4 h-4 text-[#718096]" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results.providers.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-600 mb-2">
                    <Building2 className="w-4 h-4" />
                    <span>{t('المصانع وخدمات التصنيع', 'Manufacturers & Factories')}</span>
                  </div>
                  <div className="space-y-1.5">
                    {results.providers.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleGo(`/app/manufacturing/providers/${p.id}`)}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-[#F4F7FC] hover:bg-blue-50/70 border border-[#DFE7F1] text-start transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-bold text-[#13243B]">
                              {t(p.nameAr, p.nameEn)}
                            </span>
                            {isVerifiedFactoryProvider(p) && (
                              <VerifiedFactoryBadge variant="compact" />
                            )}
                          </div>
                          <div className="text-xs text-[#718096]">
                            {p.city} · {p.industrialArea}
                          </div>
                        </div>
                        <ArrowUpLeft className="w-4 h-4 text-[#718096] shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results.requests.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-extrabold text-[#1769E8] mb-2">
                    <Layers className="w-4 h-4" />
                    <span>{t('طلبات التصنيع (RFQ)', 'Manufacturing RFQs')}</span>
                  </div>
                  <div className="space-y-1.5">
                    {results.requests.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => handleGo(`/app/manufacturing/requests/${r.id}`)}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-[#F4F7FC] hover:bg-blue-50/70 border border-[#DFE7F1] text-start transition-colors"
                      >
                        <div>
                          <div className="text-sm font-bold text-[#13243B]">
                            {t(r.titleAr, r.titleEn)}
                          </div>
                          <div className="text-xs text-[#718096] mt-0.5">
                            {r.material} · {r.quantity.toLocaleString()} {r.unit}
                          </div>
                        </div>
                        <ArrowUpLeft className="w-4 h-4 text-[#718096]" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results.faults.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-extrabold text-rose-600 mb-2">
                    <Wrench className="w-4 h-4" />
                    <span>
                      {t('المجتمع الصناعي والأعطال الفنية', 'Community & Technical Faults')}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {results.faults.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => handleGo(`/app/faults/${f.id}`)}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-[#F4F7FC] hover:bg-blue-50/70 border border-[#DFE7F1] text-start transition-colors"
                      >
                        <div>
                          <div className="text-sm font-bold text-[#13243B]">
                            {t(f.titleAr, f.titleEn)}
                          </div>
                          <div className="text-xs text-[#718096] mt-0.5">
                            {f.machineType} · {f.polymerMaterial}
                          </div>
                        </div>
                        <ArrowUpLeft className="w-4 h-4 text-[#718096]" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results.jobs.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-extrabold text-[#071A33] mb-2">
                    <Briefcase className="w-4 h-4" />
                    <span>{t('الوظائف الصناعية', 'Industrial Jobs')}</span>
                  </div>
                  <div className="space-y-1.5">
                    {results.jobs.map((j) => (
                      <button
                        key={j.id}
                        type="button"
                        onClick={() => handleGo(`/app/jobs/${j.id}`)}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-[#F4F7FC] hover:bg-blue-50/70 border border-[#DFE7F1] text-start transition-colors"
                      >
                        <div>
                          <div className="text-sm font-bold text-[#13243B]">
                            {t(j.titleAr, j.titleEn)}
                          </div>
                          <div className="text-xs text-[#718096] mt-0.5">
                            {j.companyName} · {j.city}
                          </div>
                        </div>
                        <ArrowUpLeft className="w-4 h-4 text-[#718096]" />
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
