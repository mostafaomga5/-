import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Building2,
  Truck,
  Store,
  Search,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  MessageSquare,
  Phone,
  ArrowLeft,
  ArrowRight,
  Briefcase,
  FileText,
  Upload,
  Clock,
  XCircle,
  AlertTriangle,
  GraduationCap,
  Award,
  PlayCircle,
  HelpCircle,
  Users,
  Bell,
  SlidersHorizontal,
  Sparkles,
  ExternalLink,
  Check,
  Send,
} from 'lucide-react';
import { usePlastico } from '../context/PlasticoContext';
import { IndustrialImage } from '../components/IndustrialImage';
import { IMAGE_MANIFEST } from '../data/imageManifest';
import {
  JOB_APPLICATION_STATUS_META,
  JobApplicationStatusCode,
  getVerificationStatusMeta,
  VerificationStatusCode,
  validateIndustrialAttachment,
} from '../lib/domainRules';
import { useThemeAndCurrency } from '../components/ThemeAndCurrencyControls';

/* ============================================================================
   1. COMPANY, FACTORY & SUPPLIER DIRECTORY (/app/companies)
   ============================================================================ */
export const CompanyDirectoryPage: React.FC = () => {
  const {
    lang,
    t,
    providers,
    suppliers,
    isFollowing,
    toggleFollow,
    startOrOpenConversation,
  } = usePlastico();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'factories' | 'suppliers'>('all');
  const [query, setQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const ArrowIcon = lang === 'ar' ? ArrowLeft : ArrowRight;

  const cities = ['all', 'العاشر من رمضان', 'السادس من أكتوبر', 'برج العرب', 'العبور', 'بدر'];

  const filteredFactories = useMemo(() => {
    if (activeTab === 'suppliers') return [];
    return providers.filter((f) => {
      if (cityFilter !== 'all' && !f.city.includes(cityFilter)) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        const hay = `${f.nameAr} ${f.nameEn} ${f.city} ${f.industrialArea} ${f.materialsSupported.join(' ')} ${f.productsManufacturedAr.join(' ')}`.toLowerCase();
        return hay.includes(q);
      }
      return true;
    });
  }, [providers, activeTab, cityFilter, query]);

  const filteredSuppliers = useMemo(() => {
    if (activeTab === 'factories') return [];
    return suppliers.filter((s) => {
      if (cityFilter !== 'all' && !s.city.includes(cityFilter)) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        const hay = `${s.companyNameAr} ${s.companyNameEn} ${s.city} ${s.supplierTypeLabelAr} ${s.productsServicesAr.join(' ')}`.toLowerCase();
        return hay.includes(q);
      }
      return true;
    });
  }, [suppliers, activeTab, cityFilter, query]);

  return (
    <div className="space-y-6" data-testid="company-directory-page">
      {/* Header Banner */}
      <div className="bg-[#071A33] text-white rounded-3xl p-6 sm:p-8 border border-[#1E3A5F] flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-2 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1769E8]/25 border border-[#27BED6]/35 text-[#27BED6] text-xs font-extrabold">
            <Building2 className="w-3.5 h-3.5 text-[#FF8A2A]" />
            <span>{t('دليل المصانع والشركات والموردين', 'Factories, Companies & Suppliers Directory')}</span>
          </span>
          <h1 className="text-xl sm:text-3xl font-black text-white">
            {t(
              'تصفح المصانع، خطوط الإنتاج، وموردي الخامات في منظومة PLASTICO',
              'Explore Factories, Production Lines & Material Suppliers in PLASTICO'
            )}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {t(
              'تواصل مباشرة مع إدارات المصانع وشركات توريد البوليمرات والماسترباتش. جميع الحسابات التجريبية مميزة بوضوح بعلامة (Demo) بينما تحمل الحسابات الموثقة شارة التوثيق الرسمية.',
              'Connect directly with plant managers and polymer suppliers. Sample entries are clearly marked as Demo while verified entities carry the official Verified badge.'
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link
            to="/app/help"
            className="px-4 py-2.5 rounded-xl bg-[#FF8A2A] hover:bg-[#F07B1A] text-white text-xs font-extrabold inline-flex items-center gap-2 shadow-md"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{t('طلب توثيق مصنعك أو شركتك', 'Verify Your Factory / Company')}</span>
          </Link>
          <Link
            to="/app/manufacturing"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-extrabold inline-flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-[#27BED6]" />
            <span>{t('طلب تصنيع للغير (RFQ)', 'Request Contract Manufacturing')}</span>
          </Link>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-[#DFE7F1] p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#718096] absolute top-1/2 -translate-y-1/2 start-3.5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t(
                'ابحث باسم المصنع، الشركة، الخامة (PP, HDPE, PET)، أو المنتج...',
                'Search by factory, supplier, polymer resin, or product...'
              )}
              className="w-full ps-10 pe-4 py-2.5 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] text-xs sm:text-sm text-[#13243B] focus:outline-none focus:border-[#1769E8]"
            />
          </div>

          <select
            aria-label={t('تصفية حسب المدينة الصناعية', 'Filter by industrial city')}
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] text-xs font-extrabold text-[#13243B]"
          >
            {cities.map((c) => (
              <option key={c} value={c}>
                {c === 'all' ? t('كل المدن الصناعية', 'All Industrial Cities') : c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', labelAr: 'الكل (مصانع وموردون)', labelEn: 'All (Factories & Suppliers)' },
            { id: 'factories', labelAr: 'المصانع وخطوط الإنتاج', labelEn: 'Factories & Plants' },
            { id: 'suppliers', labelAr: 'موردو الخامات والماسترباتش', labelEn: 'Resin & Masterbatch Suppliers' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#1769E8] text-white'
                  : 'bg-[#F4F7FC] text-[#13243B] border border-[#DFE7F1]'
              }`}
            >
              {t(tab.labelAr, tab.labelEn)}
            </button>
          ))}
        </div>
      </div>

      {/* Factories Grid */}
      {filteredFactories.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-black text-[#13243B] flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#1769E8]" />
            <span>{t('المصانع وخطوط التشغيل', 'Factories & Production Plants')}</span>
            <span className="text-xs font-bold text-[#718096]">({filteredFactories.length})</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFactories.map((factory) => {
              const followed = isFollowing(factory.id);
              return (
                <div
                  key={factory.id}
                  data-testid={`factory-dir-card-${factory.id}`}
                  className="bg-white rounded-3xl border border-[#DFE7F1] p-5 flex flex-col justify-between gap-4 shadow-xs hover:border-[#1769E8] transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <IndustrialImage
                          src={factory.coverImage}
                          alt={factory.nameAr}
                          aspectRatio="aspect-square"
                          className="w-14 h-14 rounded-2xl shrink-0 border border-[#DFE7F1]"
                        />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-extrabold">
                              {t('نموذج تجريبي Demo', 'Demo Sample')}
                            </span>
                            {factory.verifiedDemo && (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-extrabold inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>{t('بيانات مكتملة', 'Complete Info')}</span>
                              </span>
                            )}
                          </div>
                          <h3 className="text-base font-black text-[#13243B] truncate mt-1">
                            {t(factory.nameAr, factory.nameEn)}
                          </h3>
                          <p className="text-xs text-[#718096] flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-[#1769E8] shrink-0" />
                            <span>
                              {factory.city} — {factory.industrialArea}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-[#4A5568] leading-relaxed line-clamp-2">
                      {t(factory.descriptionAr, factory.descriptionEn)}
                    </p>

                    <div className="flex flex-wrap gap-1.5">
                      {factory.materialsSupported.slice(0, 5).map((mat) => (
                        <span
                          key={mat}
                          className="px-2.5 py-1 rounded-lg bg-[#F4F7FC] border border-[#DFE7F1] text-[11px] font-extrabold text-[#071A33]"
                        >
                          {mat}
                        </span>
                      ))}
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] font-extrabold text-emerald-800">
                        {t(
                          `طاقة متاحة ${factory.availableCapacityPercent}%`,
                          `Available Capacity ${factory.availableCapacityPercent}%`
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#DFE7F1] flex items-center justify-between gap-2">
                    <Link
                      to={`/app/factories/${factory.id}`}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-[#071A33] hover:bg-[#0D284D] text-white text-xs font-extrabold inline-flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span>{t('عرض صفحة المصنع', 'View Factory Page')}</span>
                      <ArrowIcon className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      type="button"
                      onClick={() =>
                        void toggleFollow({
                          targetId: factory.id,
                          targetType: 'factory',
                          targetNameAr: factory.nameAr,
                          targetRoleAr: 'مصنع بلاستيك',
                          targetAvatar: factory.coverImage,
                        })
                      }
                      className={`px-3 py-2.5 rounded-xl text-xs font-extrabold cursor-pointer ${
                        followed
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-[#F4F7FC] text-[#1769E8] border border-[#DFE7F1]'
                      }`}
                    >
                      {followed ? t('✓ متابَع', 'Following') : t('+ متابعة', '+ Follow')}
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        const cid = await startOrOpenConversation({
                          targetKey: factory.id,
                          targetNameAr: factory.nameAr,
                          targetRoleAr: 'مصنع بلاستيك',
                          targetAvatar: factory.coverImage,
                          contextType: 'factory',
                          contextId: factory.id,
                          contextTitleAr: factory.nameAr,
                        });
                        if (cid) navigate(`/app/messages?conv=${cid}`);
                      }}
                      title={t('مراسلة المصنع', 'Message Factory')}
                      aria-label={t('مراسلة المصنع', 'Message Factory')}
                      className="p-2.5 rounded-xl bg-[#1769E8]/10 text-[#1769E8] hover:bg-[#1769E8] hover:text-white transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Suppliers Grid */}
      {filteredSuppliers.length > 0 && (
        <div className="space-y-3 pt-2">
          <h2 className="text-lg font-black text-[#13243B] flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#FF8A2A]" />
            <span>{t('شركات توريد الخامات والماسترباتش والمعدات', 'Polymer & Equipment Suppliers')}</span>
            <span className="text-xs font-bold text-[#718096]">({filteredSuppliers.length})</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSuppliers.map((sup) => (
              <div
                key={sup.id}
                data-testid={`supplier-dir-card-${sup.id}`}
                className="bg-white rounded-3xl border border-[#DFE7F1] p-5 flex flex-col justify-between gap-4 shadow-xs hover:border-[#1769E8] transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <IndustrialImage
                      src={sup.logo}
                      alt={sup.companyNameAr}
                      aspectRatio="aspect-square"
                      className="w-14 h-14 rounded-2xl shrink-0 border border-[#DFE7F1]"
                    />
                    <div className="min-w-0">
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#1769E8] text-[10px] font-extrabold">
                        {t(sup.supplierTypeLabelAr, sup.supplierTypeLabelEn)}
                      </span>
                      <h3 className="text-base font-black text-[#13243B] truncate mt-1">
                        {t(sup.companyNameAr, sup.companyNameEn)}
                      </h3>
                      <p className="text-xs text-[#718096]">
                        {sup.city}، {sup.country}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-[#4A5568] line-clamp-2">{sup.descriptionAr}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {sup.productsServicesAr.slice(0, 4).map((item: string) => (
                      <span
                        key={item}
                        className="px-2.5 py-1 rounded-lg bg-[#F4F7FC] border border-[#DFE7F1] text-[11px] font-bold text-[#13243B]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#DFE7F1] flex items-center justify-between gap-2">
                  <Link
                    to={`/app/suppliers/${sup.id}`}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-[#1769E8] hover:bg-[#1258C7] text-white text-xs font-extrabold inline-flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>{t('صفحة المورد والمنتجات', 'Supplier Profile')}</span>
                    <ArrowIcon className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ============================================================================
   2. DEDICATED FACTORY PROFILE PAGE (/app/factories/:id)
   ============================================================================ */
export const FactoryDetailProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, providers, jobs, machines, startOrOpenConversation } = usePlastico();
  const navigate = useNavigate();

  const factory = providers.find((p) => p.id === id) || providers[0];
  const factoryJobs = jobs.filter((j) => j.factoryNameAr === factory.nameAr).slice(0, 4);
  const factoryMachines = machines.slice(0, 4);

  return (
    <div className="space-y-6" data-testid="factory-detail-profile-page">
      <div className="bg-[#071A33] text-white rounded-3xl p-6 sm:p-8 border border-[#1E3A5F] space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <IndustrialImage
              src={factory.coverImage}
              alt={factory.nameAr}
              aspectRatio="aspect-square"
              className="w-20 h-20 rounded-2xl border-2 border-[#27BED6] shrink-0"
            />
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[11px] font-extrabold">
                  {t('ملف مصنع تجريبي (Demo)', 'Sample Factory Profile (Demo)')}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#1769E8]/25 text-[#27BED6] text-[11px] font-extrabold">
                  {factory.city} — {factory.industrialArea}
                </span>
              </div>
              <h1 className="text-xl sm:text-3xl font-black text-white">
                {t(factory.nameAr, factory.nameEn)}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
                {t(factory.descriptionAr, factory.descriptionEn)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={async () => {
                const cid = await startOrOpenConversation({
                  targetKey: factory.id,
                  targetNameAr: factory.nameAr,
                  targetRoleAr: 'مصنع بلاستيك',
                  targetAvatar: factory.coverImage,
                  contextType: 'factory',
                  contextId: factory.id,
                  contextTitleAr: factory.nameAr,
                });
                if (cid) navigate(`/app/messages?conv=${cid}`);
              }}
              className="px-5 py-3 rounded-xl bg-[#FF8A2A] hover:bg-[#F07B1A] text-white text-xs sm:text-sm font-extrabold inline-flex items-center gap-2 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{t('مراسلة إدارة المصنع', 'Message Factory Management')}</span>
            </button>
            <Link
              to="/app/manufacturing"
              className="px-4 py-3 rounded-xl bg-[#1769E8] hover:bg-[#1258C7] text-white text-xs sm:text-sm font-extrabold inline-flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>{t('طلب تصنيع لدى المصنع', 'Request Manufacturing Quote')}</span>
            </Link>
          </div>
        </div>

        {/* Key Specs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/10">
          <div className="p-3.5 rounded-2xl bg-white/8 border border-white/10">
            <div className="text-[11px] text-slate-300">{t('عدد الماكينات وخطوط الإنتاج', 'Machines Count')}</div>
            <div className="text-lg font-black text-[#27BED6] font-mono-num mt-0.5">
              {factory.machinesSummary.length} {t('خط إنتاج', 'Lines')}
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/8 border border-white/10">
            <div className="text-[11px] text-slate-300">{t('مدى قوة الإغلاق (الحقن)', 'Tonnage Range')}</div>
            <div className="text-lg font-black text-white font-mono-num mt-0.5">
              {factory.tonnageRange}
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/8 border border-white/10">
            <div className="text-[11px] text-slate-300">{t('الطاقة الإنتاجية المتاحة للغير', 'Available Capacity')}</div>
            <div className="text-lg font-black text-emerald-400 font-mono-num mt-0.5">
              {factory.availableCapacityPercent}%
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/8 border border-white/10">
            <div className="text-[11px] text-slate-300">{t('سرعة الاستجابة لعروض التصنيع', 'Response Time')}</div>
            <div className="text-lg font-black text-[#FF8A2A] font-mono-num mt-0.5">
              {factory.responseTimeAr}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-5">
          <div className="bg-white rounded-3xl border border-[#DFE7F1] p-6 space-y-4">
            <h2 className="text-lg font-black text-[#13243B]">
              {t('المنتجات والخامات المدعومة وخطوط الإنتاج', 'Supported Polymers & Manufactured Products')}
            </h2>
            <div className="space-y-3">
              <div>
                <span className="text-xs font-extrabold text-[#718096] block mb-2">
                  {t('الخامات البوليمرية المعتمدة بالمصنع:', 'Supported Polymer Resins:')}
                </span>
                <div className="flex flex-wrap gap-2">
                  {factory.materialsSupported.map((m) => (
                    <span
                      key={m}
                      className="px-3 py-1.5 rounded-xl bg-[#071A33] text-white text-xs font-extrabold"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-xs font-extrabold text-[#718096] block mb-2">
                  {t('أبرز المنتجات التي يصنعها المصنع:', 'Manufactured Products:')}
                </span>
                <div className="flex flex-wrap gap-2">
                  {factory.productsManufacturedAr.map((prod) => (
                    <span
                      key={prod}
                      className="px-3 py-1.5 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] text-xs font-extrabold text-[#13243B]"
                    >
                      {prod}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-[#DFE7F1] p-6 space-y-4">
            <h2 className="text-lg font-black text-[#13243B]">
              {t('الماكينات المتاحة للتشغيل لدى المصنع', 'Available Production Machines')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {factoryMachines.map((m) => (
                <div
                  key={m.id}
                  className="p-4 rounded-2xl bg-[#F4F7FC] border border-[#DFE7F1] space-y-1.5"
                >
                  <div className="text-sm font-black text-[#13243B]">{m.machineTypeAr}</div>
                  <div className="text-xs text-[#718096]">
                    {m.machineBrand} · {m.tonnageOrCapacity}
                  </div>
                  <div className="text-xs font-extrabold text-[#1769E8]">
                    {m.hourlyOrPerPieceRate}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-5">
          <div className="bg-white rounded-3xl border border-[#DFE7F1] p-6 space-y-3">
            <h3 className="text-base font-black text-[#13243B]">
              {t('الخدمات الصناعية والاعتمادات', 'Services & Quality Standards')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {factory.servicesOfferedAr.map((c: string) => (
                <span
                  key={c}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-[#DFE7F1] p-6 space-y-3">
            <h3 className="text-base font-black text-[#13243B]">
              {t('الوظائف المتاحة بالمصنع', 'Open Positions at Factory')}
            </h3>
            {factoryJobs.length === 0 ? (
              <p className="text-xs text-[#718096]">
                {t('يمكنك تصفح جميع وظائف المصانع في قسم الوظائف.', 'Browse all factory jobs in the Jobs section.')}
              </p>
            ) : (
              factoryJobs.map((j) => (
                <Link
                  key={j.id}
                  to={`/app/jobs/${j.id}`}
                  className="block p-3 rounded-xl bg-[#F4F7FC] hover:border-[#1769E8] border border-[#DFE7F1] text-xs font-extrabold text-[#13243B]"
                >
                  {j.titleAr}
                </Link>
              ))
            )}
            <Link
              to="/app/jobs"
              className="block text-center py-2.5 rounded-xl bg-[#1769E8] text-white text-xs font-extrabold"
            >
              {t('استعراض كل الوظائف الصناعية', 'Browse All Industrial Jobs')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   3. DEDICATED SUPPLIER PROFILE PAGE (/app/suppliers/:id)
   ============================================================================ */
export const SupplierDetailProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, suppliers, submitSupplierRfq, startOrOpenConversation, guardVisitorAction } =
    usePlastico();
  const navigate = useNavigate();
  const supplier = suppliers.find((s) => s.id === id) || suppliers[0];

  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState(5);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleRfqSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guardVisitorAction('إرسال طلب عرض سعر للمورد')) return;
    if (!productName.trim() || !contactName.trim() || !contactPhone.trim()) return;
    const res = await submitSupplierRfq({
      supplierId: supplier.id,
      supplierNameAr: supplier.companyNameAr,
      category: supplier.supplierType,
      productName,
      material: productName,
      quantity,
      unit: 'طن',
      city: supplier.city,
      details: `طلب عرض سعر من صفحة المورد ${supplier.companyNameAr}`,
      contactName,
      contactPhone,
    });
    if (res.ok) {
      setSubmitted(true);
      setProductName('');
    }
  };

  return (
    <div className="space-y-6" data-testid="supplier-detail-profile-page">
      <div className="bg-[#071A33] text-white rounded-3xl p-6 sm:p-8 border border-[#1E3A5F] flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <IndustrialImage
            src={supplier.logo}
            alt={supplier.companyNameAr}
            aspectRatio="aspect-square"
            className="w-20 h-20 rounded-2xl border-2 border-[#FF8A2A] shrink-0"
          />
          <div className="space-y-1.5">
            <span className="px-3 py-1 rounded-full bg-[#FF8A2A]/20 text-[#FF8A2A] text-xs font-extrabold">
              {t(supplier.supplierTypeLabelAr, supplier.supplierTypeLabelEn)}
            </span>
            <h1 className="text-xl sm:text-3xl font-black text-white">
              {t(supplier.companyNameAr, supplier.companyNameEn)}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              {t(supplier.descriptionAr, supplier.descriptionEn)}
            </p>
            <p className="text-xs text-[#27BED6] font-bold">
              {supplier.city}، {supplier.country} · {supplier.contactPhone}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={async () => {
            const cid = await startOrOpenConversation({
              targetKey: supplier.id,
              targetNameAr: supplier.companyNameAr,
              targetRoleAr: supplier.supplierTypeLabelAr,
              targetAvatar: supplier.logo,
              contextType: 'supplier',
              contextId: supplier.id,
              contextTitleAr: supplier.companyNameAr,
            });
            if (cid) navigate(`/app/messages?conv=${cid}`);
          }}
          className="px-5 py-3 rounded-xl bg-[#1769E8] hover:bg-[#1258C7] text-white text-xs sm:text-sm font-extrabold inline-flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <MessageSquare className="w-4 h-4" />
          <span>{t('مراسلة المورد مباشرة', 'Chat with Supplier')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#DFE7F1] p-6 space-y-4">
          <h2 className="text-lg font-black text-[#13243B]">
            {t('الخامات والأصناف المتوفرة للتوريد', 'Available Resins, Masterbatch & Products')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {supplier.productsServicesAr.map((item: string) => (
              <div
                key={item}
                className="p-3.5 rounded-2xl bg-[#F4F7FC] border border-[#DFE7F1] flex items-center gap-2.5 text-xs font-extrabold text-[#13243B]"
              >
                <CheckCircle2 className="w-4 h-4 text-[#1769E8] shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 bg-white rounded-3xl border border-[#DFE7F1] p-6 space-y-4">
          <h3 className="text-base font-black text-[#13243B]">
            {t('اطلب عرض سعر فوري أو عينة خامة (RFQ)', 'Request Instant Quote or Resin Sample')}
          </h3>
          {submitted && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
              {t(
                'تم إرسال طلب عرض السعر إلى المورد وحفظه في قاعدة البيانات بنجاح.',
                'RFQ sent to supplier and saved to database.'
              )}
            </div>
          )}
          <form onSubmit={handleRfqSubmit} className="space-y-3">
            <input
              type="text"
              required
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder={t('اسم الخامة أو الكود (مثال: PP Raffia SABIC 500P)', 'Material Grade / Code')}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] text-xs font-bold"
            />
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value || 1))}
              placeholder={t('الكمية المطلوبة بالطن', 'Quantity in Tons')}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] text-xs font-bold"
            />
            <input
              type="text"
              required
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder={t('اسم المسؤول / المصنع', 'Contact Name / Factory')}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] text-xs font-bold"
            />
            <input
              type="text"
              required
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder={t('رقم الهاتف / واتساب', 'Phone / WhatsApp')}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] text-xs font-bold"
            />
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#FF8A2A] hover:bg-[#F07B1A] text-white text-xs font-extrabold cursor-pointer"
            >
              {t('إرسال طلب عرض السعر', 'Submit Quote Request')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   4. JOB APPLICATIONS & EMPLOYER TRACKER PAGE (/app/jobs/applications)
   ============================================================================ */
export const JobApplicationsPage: React.FC = () => {
  const { lang, t, jobs, isAuthenticated, realUser, showToast, guardVisitorAction } = usePlastico();
  const [myApps, setMyApps] = useState<any[]>([]);
  const [employerApps, setEmployerApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(jobs[0]?.id || 'job-1');
  const [applicantPhone, setApplicantPhone] = useState(realUser?.phone || '');
  const [cvFileName, setCvFileName] = useState('');
  const [coverNote, setCoverNote] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  const loadApplications = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await fetch('/api/jobs/applications', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setMyApps(data.myApplications || []);
        setEmployerApps(data.receivedApplications || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadApplications();
  }, [isAuthenticated]);

  const handleCvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const f = e.target.files?.[0];
    if (!f) return;
    const check = validateIndustrialAttachment({
      name: f.name,
      sizeBytes: f.size,
      category: 'document',
    });
    if (!check.valid) {
      setUploadError(lang === 'ar' ? check.errorAr || '' : check.errorEn || '');
      return;
    }
    setCvFileName(f.name);
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guardVisitorAction('التقديم على وظيفة صناعية')) return;
    const targetJob = jobs.find((j) => j.id === selectedJobId) || jobs[0];
    if (!targetJob) return;

    try {
      const res = await fetch('/api/jobs/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          jobId: targetJob.id,
          jobTitleAr: targetJob.titleAr,
          companyNameAr: targetJob.companyName,
          applicantPhone,
          cvFileName: cvFileName || 'الملف المهني الرقمي PLASTICO.pdf',
          coverNote,
        }),
      });
      if (res.ok) {
        showToast('تم إرسال طلب التوظيف وحفظه بنجاح!', 'Job application submitted!');
        setCoverNote('');
        void loadApplications();
      }
    } catch {
      // ignore
    }
  };

  const handleStatusChange = async (appId: number, status: JobApplicationStatusCode) => {
    try {
      const res = await fetch(`/api/jobs/applications/${appId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        showToast('تم تحديث حالة طلب التوظيف بنجاح.', 'Application status updated.');
        void loadApplications();
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6" data-testid="job-applications-page">
      <div className="bg-[#071A33] text-white rounded-3xl p-6 sm:p-8 border border-[#1E3A5F] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1769E8]/25 text-[#27BED6] text-xs font-extrabold">
            <Briefcase className="w-3.5 h-3.5 text-[#FF8A2A]" />
            <span>{t('متابعة طلبات التوظيف وإدارة المتقدمين', 'Job Applications & Employer Tracker')}</span>
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            {t(
              'نظام التقديم المباشر بملفك المهني أو السيرة الذاتية ومتابعة حالة القبول',
              'Direct Job Application & Real-Time Status Workflow'
            )}
          </h1>
          <p className="text-xs text-slate-300">
            {t(
              'الحالات المدعومة: تم الاستلام • تحت المراجعة • تم التواصل • مقبول • مرفوض • منسحب',
              'Supported statuses: Received • Under Review • Contacted • Accepted • Rejected • Withdrawn'
            )}
          </p>
        </div>
        <Link
          to="/app/jobs"
          className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-extrabold shrink-0"
        >
          {t('العودة لكل الوظائف', 'Back to All Jobs')}
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Submit New Application Form */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-[#DFE7F1] p-6 space-y-4">
          <h2 className="text-base font-black text-[#13243B]">
            {t('تقديم سريع بملفك المهني + السيرة الذاتية (PDF/DOC)', 'Quick Apply with Profile + CV')}
          </h2>
          <form onSubmit={handleApplySubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-extrabold text-[#13243B] mb-1">
                {t('اختر الوظيفة الصناعية', 'Select Industrial Job')}
              </label>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] text-xs font-bold text-[#13243B]"
              >
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.titleAr} — {j.companyName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[#13243B] mb-1">
                {t('رقم الهاتف للتواصل المباشر', 'Direct Contact Phone')}
              </label>
              <input
                type="text"
                value={applicantPhone}
                onChange={(e) => setApplicantPhone(e.target.value)}
                placeholder="+20 100 000 0000"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[#13243B] mb-1">
                {t('إرفاق السيرة الذاتية (PDF / DOC / صورة شهادة خبرة)', 'Attach CV / Certificate')}
              </label>
              <label className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-[#F4F7FC] border border-dashed border-[#1769E8] text-xs font-bold text-[#1769E8] cursor-pointer">
                <span className="truncate">
                  {cvFileName || t('اضغط لاختيار ملف السيرة الذاتية...', 'Click to choose CV file...')}
                </span>
                <Upload className="w-4 h-4 shrink-0" />
                <input type="file" onChange={handleCvFileChange} className="hidden" />
              </label>
              {uploadError && (
                <p className="text-[11px] font-bold text-rose-600 mt-1">{uploadError}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[#13243B] mb-1">
                {t('نبذة عن خبرتك في الماكينات أو الخطوط', 'Summary of Machine Experience')}
              </label>
              <textarea
                rows={3}
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value)}
                placeholder={t(
                  'مثال: خبرة 6 سنوات على ماكينات الحقن Haitian وEngel وضبط قوالب التعبئة...',
                  'Example: 6 years experience on Haitian & Engel injection machines...'
                )}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] text-xs font-bold"
              />
            </div>

            <button
              type="submit"
              data-testid="submit-job-application-btn"
              className="w-full py-3 rounded-xl bg-[#1769E8] hover:bg-[#1258C7] text-white text-xs font-extrabold cursor-pointer"
            >
              {t('إرسال طلب التوظيف الآن', 'Submit Application Now')}
            </button>
          </form>
        </div>

        {/* Applications List & Status Manager */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white rounded-3xl border border-[#DFE7F1] p-6 space-y-4">
            <h2 className="text-base font-black text-[#13243B]">
              {t('سجل طلبات التوظيف وحالات المراجعة', 'Submitted Applications & Review Status')}
            </h2>

            {!isAuthenticated ? (
              <div className="p-6 rounded-2xl bg-[#F4F7FC] text-center space-y-3">
                <p className="text-xs font-bold text-[#718096]">
                  {t(
                    'يرجى تسجيل الدخول بحسابك لعرض وتتبع طلبات التوظيف الخاصة بك أو إدارة المتقدمين لمصنعك.',
                    'Please sign in to track your job applications or manage factory applicants.'
                  )}
                </p>
                <Link
                  to="/auth/login"
                  className="inline-block px-5 py-2.5 rounded-xl bg-[#1769E8] text-white text-xs font-extrabold"
                >
                  {t('تسجيل الدخول', 'Sign In')}
                </Link>
              </div>
            ) : loading ? (
              <p className="text-xs text-[#718096]">{t('جاري تحميل الطلبات...', 'Loading applications...')}</p>
            ) : employerApps.length === 0 && myApps.length === 0 ? (
              <div className="p-6 rounded-2xl bg-[#F4F7FC] text-center text-xs font-bold text-[#718096]">
                {t('لا توجد طلبات توظيف مسجلة بعد. قدّم على وظيفة من النموذج المجاور.', 'No applications yet. Apply using the form.')}
              </div>
            ) : (
              <div className="space-y-3">
                {(employerApps.length > 0 ? employerApps : myApps).map((app: any) => {
                  const statusKey = (app.status || 'received') as JobApplicationStatusCode;
                  const meta =
                    JOB_APPLICATION_STATUS_META[statusKey] ||
                    JOB_APPLICATION_STATUS_META.received;

                  return (
                    <div
                      key={app.id}
                      data-testid={`job-application-row-${app.id}`}
                      className="p-4 rounded-2xl bg-[#F4F7FC] border border-[#DFE7F1] space-y-3"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-black text-[#13243B]">
                            {app.job_title_ar}
                          </h3>
                          <p className="text-xs text-[#718096] font-bold">
                            {app.company_name_ar} · {t('المتقدم:', 'Applicant:')} {app.applicant_name} ({app.applicant_phone || '—'})
                          </p>
                          {app.cv_file_name && (
                            <span className="inline-block mt-1 text-[11px] font-extrabold text-[#1769E8]">
                              📎 {app.cv_file_name}
                            </span>
                          )}
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full border text-xs font-extrabold ${meta.badgeClass}`}
                        >
                          {lang === 'ar' ? meta.labelAr : meta.labelEn}
                        </span>
                      </div>

                      {app.cover_note && (
                        <p className="text-xs text-[#4A5568] bg-white p-3 rounded-xl border border-[#DFE7F1]">
                          {app.cover_note}
                        </p>
                      )}

                      {/* Status transition buttons */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#DFE7F1]">
                        <span className="text-[11px] font-extrabold text-[#718096] me-1">
                          {t('تحديث الحالة:', 'Update Status:')}
                        </span>
                        {(
                          [
                            'received',
                            'under_review',
                            'contacted',
                            'accepted',
                            'rejected',
                            'withdrawn',
                          ] as JobApplicationStatusCode[]
                        ).map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => void handleStatusChange(app.id, st)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold cursor-pointer transition-colors ${
                              statusKey === st
                                ? 'bg-[#071A33] text-white'
                                : 'bg-white border border-[#DFE7F1] text-[#13243B] hover:border-[#1769E8]'
                            }`}
                          >
                            {lang === 'ar'
                              ? JOB_APPLICATION_STATUS_META[st].labelAr
                              : JOB_APPLICATION_STATUS_META[st].labelEn}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   5. STANDALONE COURSE DETAILS & LESSON PLAYER PAGE (/app/training/:courseId)
   ============================================================================ */
export const CourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const {
    lang,
    t,
    academyCourses,
    academyProgressMap,
    saveCourseProgress,
    realUser,
    guardVisitorAction,
  } = usePlastico();

  const course =
    academyCourses.find((c) => c.id === courseId) || academyCourses[0];
  const progress = academyProgressMap[course.id];

  const [completedLessons, setCompletedLessons] = useState<string[]>(
    progress?.completedLessons || []
  );
  const [quizScore, setQuizScore] = useState<number>(progress?.quizScore || 85);

  const toggleLesson = async (lessonId: string) => {
    if (!guardVisitorAction('تسجيل التقدم في الدورة التدريبية')) return;
    const next = completedLessons.includes(lessonId)
      ? completedLessons.filter((id) => id !== lessonId)
      : [...completedLessons, lessonId];
    setCompletedLessons(next);
    await saveCourseProgress(course.id, next, quizScore, course.lessons.length);
  };

  const handleIssueCertificate = async () => {
    if (!guardVisitorAction('إصدار شهادة إتمام الدورة التدريبية')) return;
    const allIds = course.lessons.map((l) => l.id);
    setCompletedLessons(allIds);
    setQuizScore(95);
    await saveCourseProgress(course.id, allIds, 95, course.lessons.length);
  };

  return (
    <div className="space-y-6" data-testid="course-detail-page">
      <div className="bg-[#071A33] text-white rounded-3xl p-6 sm:p-8 border border-[#1E3A5F] flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-2 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF8A2A]/20 text-[#FF8A2A] text-xs font-extrabold">
            <GraduationCap className="w-4 h-4" />
            <span>{course.categoryAr}</span>
          </span>
          <h1 className="text-xl sm:text-3xl font-black text-white">
            {t(course.titleAr, course.titleEn)}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {course.introAr}
          </p>
          <div className="text-xs text-[#27BED6] font-bold">
            {t('المحاضر:', 'Instructor:')} {course.instructorAr} ({course.instructorTitleAr}) · {course.hours} {t('ساعات تدريبية', 'Training Hours')}
          </div>
        </div>

        <Link
          to="/app/training"
          className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-extrabold self-start"
        >
          {t('العودة لجميع الدورات', 'Back to Academy')}
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#DFE7F1] p-6 space-y-4">
          <h2 className="text-base font-black text-[#13243B]">
            {t('وحدات ودروس الدورة التدريبية', 'Course Modules & Technical Lessons')}
          </h2>
          <div className="space-y-3">
            {course.lessons.map((lesson, idx) => {
              const done = completedLessons.includes(lesson.id);
              return (
                <div
                  key={lesson.id}
                  onClick={() => void toggleLesson(lesson.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                    done
                      ? 'bg-emerald-50/70 border-emerald-300'
                      : 'bg-[#F4F7FC] border-[#DFE7F1] hover:border-[#1769E8]'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="text-xs sm:text-sm font-black text-[#13243B]">
                      {idx + 1}. {t(lesson.titleAr, lesson.titleEn)}
                    </div>
                    <p className="text-xs text-[#718096] leading-relaxed">
                      {lesson.summaryAr}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-lg text-[11px] font-extrabold shrink-0 ${
                      done ? 'bg-emerald-600 text-white' : 'bg-white text-[#1769E8] border border-[#DFE7F1]'
                    }`}
                  >
                    {done ? t('✓ مكتمل', 'Completed') : t('إتمام الدرس', 'Mark Done')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-5 bg-white rounded-3xl border border-[#DFE7F1] p-6 space-y-4">
          <h3 className="text-base font-black text-[#13243B] flex items-center gap-2">
            <Award className="w-5 h-5 text-[#FF8A2A]" />
            <span>{t('شهادة إتمام الدورة التدريبية', 'Course Completion Certificate')}</span>
          </h3>
          <p className="text-xs text-[#718096] leading-relaxed">
            {t(
              'تصدر أكاديمية PLASTICO شهادة إتمام دورة تدريبية رقمية عند إكمال جميع الدروس واجتياز التقييم الفني (بنسبة 70% فأعلى). هذه الشهادة تثبت إتمام المحتوى التدريبي داخل المنصة وليست اعتماداً حكومياً أو جامعياً.',
              'PLASTICO Academy issues a digital course completion certificate upon completing all lessons and passing the technical quiz (70%+). This certifies course completion on the platform, not a government or university degree.'
            )}
          </p>

          {progress?.certificateCode ? (
            <div className="p-5 rounded-2xl bg-[#071A33] text-white border-2 border-[#FF8A2A] space-y-2 text-center">
              <Award className="w-10 h-10 text-[#FF8A2A] mx-auto" />
              <div className="text-xs font-extrabold text-[#27BED6]">
                {t('شهادة إتمام دورة تدريبية — PLASTICO Academy', 'Course Completion Certificate')}
              </div>
              <div className="text-base font-black">
                {realUser?.name || t('متدرب بلاستيكو', 'PLASTICO Trainee')}
              </div>
              <div className="text-xs text-slate-300">{t(course.titleAr, course.titleEn)}</div>
              <div className="text-xs font-mono-num text-[#FF8A2A] font-black pt-1">
                {progress.certificateCode}
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => void handleIssueCertificate()}
              className="w-full py-3 rounded-xl bg-[#FF8A2A] hover:bg-[#F07B1A] text-white text-xs font-extrabold cursor-pointer"
            >
              {t(
                'إكمال الدروس وإصدار شهادة إتمام الدورة الآن',
                'Complete Lessons & Issue Certificate'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   6. UNIFIED SEARCH RESULTS PAGE (/app/search)
   ============================================================================ */
export const SearchResultsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQ = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQ);
  const [categoryFilter, setCategoryFilter] = useState('all');

  const {
    t,
    providers,
    suppliers,
    market,
    jobs,
    faults,
    academyCourses,
    requests,
  } = usePlastico();
  const { formatPrice } = useThemeAndCurrency();

  const q = query.trim().toLowerCase();

  const results = useMemo(() => {
    const match = (text: string) => (!q ? true : text.toLowerCase().includes(q));
    return {
      factories: providers.filter((p) =>
        match(`${p.nameAr} ${p.nameEn} ${p.city} ${p.materialsSupported.join(' ')}`)
      ),
      suppliers: suppliers.filter((s) =>
        match(`${s.companyNameAr} ${s.companyNameEn} ${s.supplierTypeLabelAr} ${s.productsServicesAr.join(' ')}`)
      ),
      market: market.filter((m) =>
        match(`${m.titleAr} ${m.titleEn} ${m.brand} ${m.model} ${m.categoryAr}`)
      ),
      jobs: jobs.filter((j) =>
        match(`${j.titleAr} ${j.companyName} ${j.city} ${j.specializationAr}`)
      ),
      faults: faults.filter((f) =>
        match(`${f.titleAr} ${f.machineType} ${f.polymerMaterial} ${f.descriptionAr}`)
      ),
      courses: academyCourses.filter((c) =>
        match(`${c.titleAr} ${c.titleEn} ${c.categoryAr}`)
      ),
      rfqs: requests.filter((r) =>
        match(`${r.titleAr} ${r.material} ${r.city}`)
      ),
    };
  }, [q, providers, suppliers, market, jobs, faults, academyCourses, requests]);

  const totalCount =
    results.factories.length +
    results.suppliers.length +
    results.market.length +
    results.jobs.length +
    results.faults.length +
    results.courses.length +
    results.rfqs.length;

  return (
    <div className="space-y-6" data-testid="search-results-page">
      <div className="bg-[#071A33] text-white rounded-3xl p-6 sm:p-8 border border-[#1E3A5F] space-y-4">
        <h1 className="text-xl sm:text-2xl font-black">
          {t('البحث الشامل في منظومة PLASTICO الصناعية', 'Unified PLASTICO Industrial Search')}
        </h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSearchParams(query ? { q: query } : {});
          }}
          className="flex items-center gap-2 bg-white rounded-2xl p-1.5"
        >
          <Search className="w-5 h-5 text-[#718096] ms-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t(
              'ابحث عن مصانع، موردين، ماكينات، خامات PP/HDPE، وظائف، أعطال، أو دورات...',
              'Search factories, suppliers, machinery, resins, jobs, faults, or courses...'
            )}
            className="flex-1 bg-transparent text-[#13243B] text-xs sm:text-sm font-bold px-2 py-2 focus:outline-none"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[#FF8A2A] text-white text-xs font-extrabold cursor-pointer"
          >
            {t('بحث', 'Search')}
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', labelAr: `الكل (${totalCount})`, labelEn: `All (${totalCount})` },
            { id: 'factories', labelAr: `المصانع (${results.factories.length})`, labelEn: `Factories (${results.factories.length})` },
            { id: 'suppliers', labelAr: `الموردون (${results.suppliers.length})`, labelEn: `Suppliers (${results.suppliers.length})` },
            { id: 'market', labelAr: `السوق والمعدات (${results.market.length})`, labelEn: `Market (${results.market.length})` },
            { id: 'jobs', labelAr: `الوظائف (${results.jobs.length})`, labelEn: `Jobs (${results.jobs.length})` },
            { id: 'faults', labelAr: `الأعطال (${results.faults.length})`, labelEn: `Faults (${results.faults.length})` },
            { id: 'courses', labelAr: `الأكاديمية (${results.courses.length})`, labelEn: `Courses (${results.courses.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCategoryFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer ${
                categoryFilter === tab.id
                  ? 'bg-[#1769E8] text-white'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20'
              }`}
            >
              {t(tab.labelAr, tab.labelEn)}
            </button>
          ))}
        </div>
      </div>

      {/* Categorized Results */}
      <div className="space-y-6">
        {(categoryFilter === 'all' || categoryFilter === 'factories') &&
          results.factories.length > 0 && (
            <div className="bg-white rounded-3xl border border-[#DFE7F1] p-5 space-y-3">
              <h2 className="text-base font-black text-[#13243B]">
                {t('المصانع وخطوط الإنتاج', 'Factories')} ({results.factories.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {results.factories.slice(0, 6).map((f) => (
                  <Link
                    key={f.id}
                    to={`/app/factories/${f.id}`}
                    className="p-3.5 rounded-2xl bg-[#F4F7FC] border border-[#DFE7F1] hover:border-[#1769E8] flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="text-sm font-black text-[#13243B]">{f.nameAr}</div>
                      <div className="text-xs text-[#718096]">
                        {f.city} · {f.materialsSupported.join(' / ')}
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-[#1769E8]">
                      {t('عرض المصنع', 'View')}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

        {(categoryFilter === 'all' || categoryFilter === 'market') &&
          results.market.length > 0 && (
            <div className="bg-white rounded-3xl border border-[#DFE7F1] p-5 space-y-3">
              <h2 className="text-base font-black text-[#13243B]">
                {t('السوق الصناعي (ماكينات • خامات • قوالب)', 'Marketplace Listings')} ({results.market.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {results.market.slice(0, 6).map((m) => {
                  const conv = formatPrice(m.price, m.currency);
                  return (
                    <Link
                      key={m.id}
                      to="/app/market"
                      className="p-3.5 rounded-2xl bg-[#F4F7FC] border border-[#DFE7F1] hover:border-[#1769E8] flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-black text-[#13243B] truncate">
                          {m.titleAr}
                        </div>
                        <div className="text-xs text-[#718096]">
                          {m.categoryAr} · {m.city}
                        </div>
                      </div>
                      <span className="text-xs font-black text-[#FF8A2A] font-mono-num shrink-0">
                        {conv.formattedAr}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

        {(categoryFilter === 'all' || categoryFilter === 'jobs') &&
          results.jobs.length > 0 && (
            <div className="bg-white rounded-3xl border border-[#DFE7F1] p-5 space-y-3">
              <h2 className="text-base font-black text-[#13243B]">
                {t('الوظائف الصناعية', 'Industrial Jobs')} ({results.jobs.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {results.jobs.slice(0, 6).map((j) => (
                  <Link
                    key={j.id}
                    to={`/app/jobs/${j.id}`}
                    className="p-3.5 rounded-2xl bg-[#F4F7FC] border border-[#DFE7F1] hover:border-[#1769E8] flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="text-sm font-black text-[#13243B]">{j.titleAr}</div>
                      <div className="text-xs text-[#718096]">
                        {j.companyName} · {j.city}
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-[#1769E8]">
                      {t('التفاصيل والتقديم', 'Apply')}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

/* ============================================================================
   7. HELP, SUPPORT & ACCOUNT VERIFICATION PAGE (/app/help)
   ============================================================================ */
export const HelpSupportPage: React.FC = () => {
  const { lang, t, isAuthenticated, realUser, showToast, guardVisitorAction } = usePlastico();
  const [requests, setRequests] = useState<any[]>([]);
  const [companyName, setCompanyName] = useState(
    realUser?.companyName || realUser?.name || ''
  );
  const [documentType, setDocumentType] = useState('سجل تجاري وبطاقة ضريبية');
  const [docFileName, setDocFileName] = useState('');
  const [notes, setNotes] = useState('');
  const [uploadErr, setUploadErr] = useState<string | null>(null);

  const loadVerification = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await fetch('/api/verification/my', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    void loadVerification();
  }, [isAuthenticated]);

  const latestStatus: VerificationStatusCode = realUser?.verified
    ? 'verified'
    : requests[0]?.status || 'unverified';
  const statusMeta = getVerificationStatusMeta(latestStatus);

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadErr(null);
    const f = e.target.files?.[0];
    if (!f) return;
    const valid = validateIndustrialAttachment({
      name: f.name,
      sizeBytes: f.size,
      category: 'document',
    });
    if (!valid.valid) {
      setUploadErr(lang === 'ar' ? valid.errorAr || '' : valid.errorEn || '');
      return;
    }
    setDocFileName(f.name);
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guardVisitorAction('إرسال طلب توثيق الحساب')) return;
    if (!companyName.trim()) return;

    try {
      const res = await fetch('/api/verification/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          companyName,
          documentType,
          documentUrl: docFileName || 'official-verification-doc.pdf',
          notes,
        }),
      });
      if (res.ok) {
        showToast(
          'تم إرسال طلب توثيق الحساب للمراجعة من إدارة المنصة.',
          'Verification request submitted for admin review.'
        );
        setNotes('');
        void loadVerification();
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6" data-testid="help-support-page">
      <div className="bg-[#071A33] text-white rounded-3xl p-6 sm:p-8 border border-[#1E3A5F] space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1769E8]/25 text-[#27BED6] text-xs font-extrabold">
          <ShieldCheck className="w-4 h-4 text-[#FF8A2A]" />
          <span>{t('مركز المساعدة وتوثيق الحسابات الرسمية', 'Help Center & Official Account Verification')}</span>
        </span>
        <h1 className="text-xl sm:text-3xl font-black text-white">
          {t(
            'وثّق حساب مصنعك أو شركتك أو ملفك المهني واحصل على الدعم الفني',
            'Verify Your Factory, Supplier Company or Professional Profile'
          )}
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
          {t(
            'تُحفظ مستندات التوثيق بشكل خاص وآمن ولا يطلع عليها سوى صاحب الحساب وإدارة المنصة للمراجعة فقط.',
            'Verification documents are stored privately and are strictly accessible only to the account owner and platform administrators.'
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Verification Request Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#DFE7F1] p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#DFE7F1] pb-4">
            <div>
              <h2 className="text-base font-black text-[#13243B]">
                {t('حالة توثيق الحساب الحالية', 'Current Account Verification Status')}
              </h2>
              <p className="text-xs text-[#718096]">
                {t(
                  'الحالات الرسمية: غير موثق • طلب التوثيق قيد المراجعة • موثق رسمياً • مرفوض مع السبب',
                  'Statuses: Unverified • Pending Review • Verified • Rejected with Reason'
                )}
              </p>
            </div>
            <span
              data-testid="verification-status-badge"
              className={`px-3.5 py-1.5 rounded-full border text-xs font-extrabold ${statusMeta.badgeClass}`}
            >
              {lang === 'ar' ? statusMeta.labelAr : statusMeta.labelEn}
            </span>
          </div>

          {requests[0]?.status === 'rejected' && requests[0]?.rejection_reason && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
              {t('سبب الرفض:', 'Rejection Reason:')} {requests[0].rejection_reason}
            </div>
          )}

          <form onSubmit={handleVerificationSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-extrabold text-[#13243B] mb-1">
                {t('اسم المصنع / الشركة / الاسم المهني الثلاثي', 'Factory / Company / Full Legal Name')}
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder={t('مثال: مصنع الأهرام للبلاستيك والتغليف', 'Example: Al-Ahram Plastics Factory')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[#13243B] mb-1">
                {t('نوع المستند المرفق للمراجعة', 'Verification Document Type')}
              </label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] text-xs font-bold"
              >
                <option value="سجل تجاري وبطاقة ضريبية">سجل تجاري وبطاقة ضريبية (للمصانع والموردين)</option>
                <option value="رخصة تشغيل صناعية أو شهادة ISO">رخصة تشغيل صناعية أو شهادة ISO</option>
                <option value="كارنيه نقابة المهندسين أو شهادة خبرة">كارنيه نقابة المهندسين أو شهادة خبرة معتمدة</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[#13243B] mb-1">
                {t('رفع نسخة المستند (خاص — لا يظهر للعامة)', 'Upload Document (Private to Admin)')}
              </label>
              <label className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-[#F4F7FC] border border-dashed border-[#1769E8] text-xs font-bold text-[#1769E8] cursor-pointer">
                <span className="truncate">
                  {docFileName || t('اختر ملف PDF أو صورة المستند الرسمي...', 'Choose PDF or image file...')}
                </span>
                <Upload className="w-4 h-4 shrink-0" />
                <input type="file" onChange={handleDocUpload} className="hidden" />
              </label>
              {uploadErr && <p className="text-[11px] font-bold text-rose-600 mt-1">{uploadErr}</p>}
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[#13243B] mb-1">
                {t('ملاحظات إضافية لفريق المراجعة', 'Additional Notes for Review Team')}
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('رقم السجل التجاري أو تفاصيل النشاط الصناعي...', 'Commercial registration number or details...')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] text-xs font-bold"
              />
            </div>

            <button
              type="submit"
              data-testid="submit-verification-request-btn"
              className="w-full py-3 rounded-xl bg-[#1769E8] hover:bg-[#1258C7] text-white text-xs font-extrabold cursor-pointer"
            >
              {t('إرسال طلب التوثيق الرسمي', 'Submit Official Verification Request')}
            </button>
          </form>
        </div>

        {/* FAQ & Support Info */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-[#DFE7F1] p-6 space-y-4">
          <h2 className="text-base font-black text-[#13243B]">
            {t('الأسئلة الشائعة والدعم الفني', 'Frequently Asked Questions')}
          </h2>
          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-[#F4F7FC] border border-[#DFE7F1] space-y-1">
              <div className="font-black text-[#13243B]">
                {t('هل استخدام منصة PLASTICO مجاني؟', 'Is PLASTICO free to use?')}
              </div>
              <p className="text-[#718096] leading-relaxed">
                {t(
                  'نعم، جميع الخدمات الأساسية متاحة مجاناً حالياً لتشجيع المصانع والموردين والفنيين على بناء مجتمع صناعي متكامل، مع خطط مستقبلية لباقات مدفوعة اختيارية.',
                  'Yes, all core services are currently free, with optional paid tiers planned for the future.'
                )}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#F4F7FC] border border-[#DFE7F1] space-y-1">
              <div className="font-black text-[#13243B]">
                {t('كيف أحصل على شارة الحساب الموثق؟', 'How do I get the Verified badge?')}
              </div>
              <p className="text-[#718096] leading-relaxed">
                {t(
                  'ارفع مستند السجل التجاري أو شهادة الخبرة من هذه الصفحة، وستقوم إدارة المنصة بمراجعته واعتماد التوثيق.',
                  'Submit your commercial registry or certificate on this page for admin verification.'
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   8. ADMIN DASHBOARD PAGE (/app/admin)
   ============================================================================ */
export const AdminDashboardPage: React.FC = () => {
  const { t, isAuthenticated, showToast } = usePlastico();
  const [overview, setOverview] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<
    'verifications' | 'users' | 'listings' | 'reports' | 'announcements'
  >('verifications');
  const [rejectionReasonMap, setRejectionReasonMap] = useState<Record<number, string>>({});
  const [annTitle, setAnnTitle] = useState('');
  const [annBody, setAnnBody] = useState('');

  const fetchOverview = async () => {
    try {
      const res = await fetch('/api/admin/overview', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setOverview(data);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      void fetchOverview();
    }
  }, [isAuthenticated]);

  const handleReviewVerification = async (
    reqId: number,
    status: 'verified' | 'rejected'
  ) => {
    try {
      const res = await fetch(`/api/admin/verification/${reqId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          status,
          rejectionReason: rejectionReasonMap[reqId] || 'المستند غير واضح، يرجى إعادة الرفع.',
        }),
      });
      if (res.ok) {
        showToast(
          status === 'verified'
            ? 'تم قبول التوثيق ومنح شارة الحساب الموثق بنجاح!'
            : 'تم رفض طلب التوثيق مع إرسال السبب للمستخدم.',
          'Verification reviewed.'
        );
        void fetchOverview();
      }
    } catch {
      // ignore
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annBody.trim()) return;
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ titleAr: annTitle, bodyAr: annBody, targetRole: 'all' }),
      });
      if (res.ok) {
        showToast('تم نشر الإشعار العام لجميع مستخدمي المنصة.', 'Announcement published.');
        setAnnTitle('');
        setAnnBody('');
        void fetchOverview();
      }
    } catch {
      // ignore
    }
  };

  const stats = overview?.stats || {
    totalUsers: 0,
    factoriesCount: 0,
    suppliersCount: 0,
    techniciansCount: 0,
    engineersCount: 0,
    tradersCount: 0,
    totalListings: 0,
    totalRfqs: 0,
    totalAcademyEnrollments: 0,
    pendingVerifications: 0,
    openReports: 0,
    totalJobApplications: 0,
  };

  return (
    <div className="space-y-6" data-testid="admin-dashboard-page">
      <div className="bg-[#071A33] text-white rounded-3xl p-6 sm:p-8 border border-[#1E3A5F] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF8A2A]/20 text-[#FF8A2A] text-xs font-extrabold">
              <ShieldCheck className="w-4 h-4" />
              <span>{t('لوحة تحكم الإدارة الشاملة — Admin Console', 'Platform Admin Console')}</span>
            </span>
            <h1 className="text-xl sm:text-3xl font-black text-white mt-1">
              {t(
                'إدارة المستخدمين، طلبات التوثيق، عروض السوق، وطلبات التوظيف',
                'Manage Users, Verifications, Marketplace Listings & Job Applications'
              )}
            </h1>
          </div>
          <button
            type="button"
            onClick={() => void fetchOverview()}
            className="px-4 py-2 rounded-xl bg-[#1769E8] text-white text-xs font-extrabold self-start cursor-pointer"
          >
            {t('تحديث الإحصائيات الفورية', 'Refresh Live Metrics')}
          </button>
        </div>

        {/* 8 Admin KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-white/8 border border-white/10">
            <div className="text-[11px] text-slate-300">{t('إجمالي المستخدمين المسجلين', 'Total Users')}</div>
            <div className="text-xl font-black text-white font-mono-num">{stats.totalUsers}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/8 border border-white/10">
            <div className="text-[11px] text-slate-300">{t('المصانع والموردون', 'Factories & Suppliers')}</div>
            <div className="text-xl font-black text-[#27BED6] font-mono-num">
              {stats.factoriesCount + stats.suppliersCount}
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/8 border border-white/10">
            <div className="text-[11px] text-slate-300">{t('طلبات التوثيق قيد المراجعة', 'Pending Verifications')}</div>
            <div className="text-xl font-black text-[#FF8A2A] font-mono-num">
              {stats.pendingVerifications}
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/8 border border-white/10">
            <div className="text-[11px] text-slate-300">{t('عروض السوق وطلبات RFQ', 'Listings & RFQs')}</div>
            <div className="text-xl font-black text-emerald-400 font-mono-num">
              {stats.totalListings + stats.totalRfqs}
            </div>
          </div>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: 'verifications', labelAr: 'طلبات توثيق الحسابات', labelEn: 'Verification Requests' },
          { id: 'users', labelAr: 'المستخدمون والأدوار', labelEn: 'Users & Roles' },
          { id: 'listings', labelAr: 'عروض السوق الصناعي', labelEn: 'Marketplace Listings' },
          { id: 'reports', labelAr: 'البلاغات والمخالفات', labelEn: 'Reports' },
          { id: 'announcements', labelAr: 'إرسال إشعارات عامة', labelEn: 'System Broadcast' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#071A33] text-white'
                : 'bg-white border border-[#DFE7F1] text-[#13243B]'
            }`}
          >
            {t(tab.labelAr, tab.labelEn)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'verifications' && (
        <div className="bg-white rounded-3xl border border-[#DFE7F1] p-6 space-y-4">
          <h2 className="text-base font-black text-[#13243B]">
            {t('مراجعة واعتماد طلبات توثيق المصانع والموردين والمهندسين', 'Review Verification Requests')}
          </h2>
          {(overview?.verificationRequests || []).length === 0 ? (
            <p className="text-xs text-[#718096]">
              {t('لا توجد طلبات توثيق معلقة حالياً.', 'No verification requests found.')}
            </p>
          ) : (
            <div className="space-y-3">
              {(overview?.verificationRequests || []).map((req: any) => (
                <div
                  key={req.id}
                  className="p-4 rounded-2xl bg-[#F4F7FC] border border-[#DFE7F1] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="text-sm font-black text-[#13243B]">
                      {req.company_name} ({req.role})
                    </div>
                    <div className="text-xs text-[#718096]">
                      {req.document_type} · {req.notes || '—'}
                    </div>
                    <div className="text-[11px] font-extrabold text-[#1769E8]">
                      الحالة: {req.status}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      value={rejectionReasonMap[req.id] || ''}
                      onChange={(e) =>
                        setRejectionReasonMap((prev) => ({
                          ...prev,
                          [req.id]: e.target.value,
                        }))
                      }
                      placeholder={t('سبب الرفض (عند الرفض)', 'Rejection reason')}
                      className="px-3 py-1.5 rounded-lg bg-white border border-[#DFE7F1] text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => void handleReviewVerification(req.id, 'verified')}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-extrabold cursor-pointer"
                    >
                      {t('اعتماد وتوثيق', 'Approve')}
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleReviewVerification(req.id, 'rejected')}
                      className="px-3.5 py-2 rounded-xl bg-rose-600 text-white text-xs font-extrabold cursor-pointer"
                    >
                      {t('رفض مع السبب', 'Reject')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-[#DFE7F1] p-6 space-y-3">
          <h2 className="text-base font-black text-[#13243B]">
            {t('الحسابات المسجلة في قاعدة البيانات', 'Registered Database Users')}
          </h2>
          <div className="space-y-2">
            {(overview?.users || []).map((u: any) => (
              <div
                key={u.id}
                className="p-3.5 rounded-2xl bg-[#F4F7FC] border border-[#DFE7F1] flex items-center justify-between gap-2 text-xs"
              >
                <div>
                  <span className="font-black text-[#13243B]">{u.name}</span> · {u.email} ({u.accountType})
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full font-extrabold ${
                    u.verified
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {u.verified ? t('موثق', 'Verified') : t('غير موثق', 'Unverified')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'listings' && (
        <div className="bg-white rounded-3xl border border-[#DFE7F1] p-6 space-y-3">
          <h2 className="text-base font-black text-[#13243B]">
            {t('عروض السوق الصناعي المسجلة', 'Database Marketplace Listings')}
          </h2>
          <div className="space-y-2">
            {(overview?.listings || []).map((l: any) => (
              <div
                key={l.id}
                className="p-3.5 rounded-2xl bg-[#F4F7FC] border border-[#DFE7F1] flex items-center justify-between gap-2 text-xs"
              >
                <div>
                  <span className="font-black text-[#13243B]">{l.titleAr}</span> · {l.sellerNameAr}
                </div>
                <span className="font-mono-num font-black text-[#1769E8]">
                  {l.price} {l.currency}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="bg-white rounded-3xl border border-[#DFE7F1] p-6 space-y-3">
          <h2 className="text-base font-black text-[#13243B]">
            {t('البلاغات الواردة من المستخدمين', 'User Reports')}
          </h2>
          {(overview?.reports || []).length === 0 ? (
            <p className="text-xs text-[#718096]">{t('لا توجد بلاغات مفتوحة.', 'No open reports.')}</p>
          ) : (
            (overview?.reports || []).map((r: any) => (
              <div
                key={r.id}
                className="p-3.5 rounded-2xl bg-[#F4F7FC] border border-[#DFE7F1] flex items-center justify-between gap-2 text-xs"
              >
                <div>
                  <span className="font-black">{r.target_type}</span>: {r.reason}
                </div>
                <span className="font-extrabold text-[#1769E8]">{r.status}</span>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'announcements' && (
        <div className="bg-white rounded-3xl border border-[#DFE7F1] p-6 space-y-4">
          <h2 className="text-base font-black text-[#13243B]">
            {t('إرسال إشعار وتنبيه عام لمستخدمي المنصة', 'Broadcast System Announcement')}
          </h2>
          <form onSubmit={handleBroadcast} className="space-y-3 max-w-xl">
            <input
              type="text"
              required
              value={annTitle}
              onChange={(e) => setAnnTitle(e.target.value)}
              placeholder={t('عنوان الإشعار العام...', 'Announcement Title...')}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] text-xs font-bold"
            />
            <textarea
              rows={3}
              required
              value={annBody}
              onChange={(e) => setAnnBody(e.target.value)}
              placeholder={t('نص الإشعار لجميع المصانع والموردين والفنيين...', 'Announcement message...')}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] text-xs font-bold"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#FF8A2A] text-white text-xs font-extrabold cursor-pointer"
            >
              {t('نشر الإشعار الآن', 'Publish Announcement')}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
