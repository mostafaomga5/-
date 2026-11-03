import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Factory,
  Truck,
  Store,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  CheckCircle2,
} from 'lucide-react';
import { usePlastico } from '../context/PlasticoContext';
import { IMAGE_MANIFEST } from '../data/imageManifest';

export interface MainFlipCardItem {
  id: 'job_seeker' | 'factory_owner' | 'supplier' | 'trader';
  titleAr: string;
  titleEn: string;
  shortFrontAr: string;
  shortFrontEn: string;
  backDetailsAr: string;
  backDetailsEn: string;
  highlightsAr: string[];
  highlightsEn: string[];
  ctaLabelAr: string;
  ctaLabelEn: string;
  targetRoute: string;
  secondaryRoute?: string;
  secondaryLabelAr?: string;
  secondaryLabelEn?: string;
  icon: React.ComponentType<{ className?: string }>;
  image3d: string;
  fullBleedBg: string;
  accentColor: string;
  badgeAr: string;
  badgeEn: string;
}

export const MAIN_FLIP_CARDS: MainFlipCardItem[] = [
  {
    id: 'job_seeker',
    titleAr: 'الباحث عن وظيفة',
    titleEn: 'Job Seeker',
    shortFrontAr: 'وظائف مصانع البلاستيك وبناء السيرة المهنية والتقديم المباشر',
    shortFrontEn: 'Plastics factory jobs, professional CV builder & direct apply',
    backDetailsAr:
      'ابحث عن وظائف في مصانع البلاستيك، أنشئ سيرتك المهنية، وقدّم مباشرة على الوظائف المناسبة لخبرتك.',
    backDetailsEn:
      'Search jobs in plastics factories, build your technical resume, and apply directly to positions matching your experience.',
    highlightsAr: [
      'تقديم مباشر بملفك المهني أو السيرة الذاتية PDF',
      'متابعة حالة الطلب (تم الاستلام • تحت المراجعة • مقبول)',
      'وظائف حقن، نفخ، سحب، فيلم، صيانة قوالب وجودة',
    ],
    highlightsEn: [
      'Direct apply with profile or PDF CV',
      'Live application status tracking',
      'Injection, blow, extrusion, mold & QC roles',
    ],
    ctaLabelAr: 'افتح القسم',
    ctaLabelEn: 'Open Section',
    targetRoute: '/app/jobs',
    secondaryRoute: '/app/jobs/applications',
    secondaryLabelAr: 'طلباتي الوظيفية',
    secondaryLabelEn: 'My Applications',
    icon: Briefcase,
    image3d: IMAGE_MANIFEST.icons3d.thermoforming,
    fullBleedBg: IMAGE_MANIFEST.marketplace.injectionMachineWorkshop,
    accentColor: 'from-[#1769E8] to-[#0B2B59]',
    badgeAr: 'للفنيين والمهندسين والعمال',
    badgeEn: 'For Technicians, Engineers & Workers',
  },
  {
    id: 'factory_owner',
    titleAr: 'صاحب المصنع',
    titleEn: 'Factory Owner',
    shortFrontAr: 'توظيف الفنيين، طلب الخامات والماكينات، وخدمات التصنيع للغير',
    shortFrontEn: 'Hire talent, source resins & machines, and manage RFQs',
    backDetailsAr:
      'ابحث عن فنيين ومهندسين وعمال، واطلب خامات وماكينات وموردين وخدمات تصنيع في مكان واحد.',
    backDetailsEn:
      'Find technicians, engineers, and operators, and source raw materials, machinery, suppliers, and contract manufacturing in one place.',
    highlightsAr: [
      'نشر وظائف المصنع وفرز المتقدمين حسب الماكينة',
      'طلب عروض أسعار خامات وماكينات وتصنيع للغير (RFQ)',
      'جناح خاص للمصنع في دليل المصانع والمعرض الافتراضي',
    ],
    highlightsEn: [
      'Post factory jobs & filter applicants by machine',
      'Request quotes for resins, machines & contract RFQs',
      'Dedicated factory profile & Virtual Expo booth',
    ],
    ctaLabelAr: 'استكشف الآن',
    ctaLabelEn: 'Explore Now',
    targetRoute: '/app/companies',
    secondaryRoute: '/app/manufacturing',
    secondaryLabelAr: 'طلبات التصنيع RFQ',
    secondaryLabelEn: 'Manufacturing RFQs',
    icon: Factory,
    image3d: IMAGE_MANIFEST.icons3d.injection,
    fullBleedBg: IMAGE_MANIFEST.hero.mainFactory,
    accentColor: 'from-[#0D324D] to-[#071A33]',
    badgeAr: 'للمصانع وخطوط الإنتاج',
    badgeEn: 'For Plants & Production Lines',
  },
  {
    id: 'supplier',
    titleAr: 'المورد',
    titleEn: 'Supplier',
    shortFrontAr: 'عرض الخامات والماسترباتش واستقبال طلبات عروض الأسعار',
    shortFrontEn: 'Showcase polymer resins & masterbatch and receive RFQs',
    backDetailsAr:
      'اعرض الخامات والمنتجات، وأنشئ صفحة شركتك، وتواصل مع المصانع التي تبحث عن الموردين.',
    backDetailsEn:
      'Showcase your polymer raw materials and products, create your company page, and connect directly with factories seeking suppliers.',
    highlightsAr: [
      'خامات PP / PE / PET / PVC / ABS وماسترباتش وإضافات',
      'استقبال طلبات عروض الأسعار (RFQ) المباشرة من المصانع',
      'لوحة تحكم احترافية لإدارة الأصناف والداتا شيت',
    ],
    highlightsEn: [
      'PP, PE, PET, PVC, ABS resins, masterbatch & additives',
      'Receive direct RFQ inquiries from verified factories',
      'Dedicated supplier dashboard & datasheet management',
    ],
    ctaLabelAr: 'افتح القسم',
    ctaLabelEn: 'Open Section',
    targetRoute: '/app/suppliers',
    secondaryRoute: '/app/market/raw-materials',
    secondaryLabelAr: 'سوق الخامات',
    secondaryLabelEn: 'Raw Materials Market',
    icon: Truck,
    image3d: IMAGE_MANIFEST.icons3d.rawMaterials,
    fullBleedBg: IMAGE_MANIFEST.marketplace.polymerWarehouse,
    accentColor: 'from-[#0E4459] to-[#071A33]',
    badgeAr: 'لموردي الخامات والماسترباتش',
    badgeEn: 'For Resin & Masterbatch Suppliers',
  },
  {
    id: 'trader',
    titleAr: 'التاجر ومعارض المعدات',
    titleEn: 'Equipment Trader & Showrooms',
    shortFrontAr: 'عرض الماكينات الجديدة والمستعملة والقوالب وقطع الغيار',
    shortFrontEn: 'List new & used machinery, molds, chillers & spare parts',
    backDetailsAr:
      'اعرض الماكينات الجديدة والمستعملة وقطع الغيار والمعدات المساعدة مع المواصفات والصور.',
    backDetailsEn:
      'Showcase new and used plastic machinery, spare parts, molds, and auxiliary equipment with full technical specs and photos.',
    highlightsAr: [
      'تحديد الحالة الفنية وسنة الصنع وقوة الإغلاق بالطن',
      'ماكينات حقن، نفخ، سحب، كسارات، شيلرات وسخانات',
      'تواصل مباشر عبر الدردشة الصناعية أو الهاتف والواتساب',
    ],
    highlightsEn: [
      'Specify condition grade, year & clamping tonnage',
      'Injection, blow, extrusion, crushers, chillers & heaters',
      'Direct buyer chat, phone & WhatsApp contact',
    ],
    ctaLabelAr: 'استكشف الآن',
    ctaLabelEn: 'Explore Now',
    targetRoute: '/app/market/machinery',
    secondaryRoute: '/app/market/molds-spares',
    secondaryLabelAr: 'القوالب وقطع الغيار',
    secondaryLabelEn: 'Molds & Spare Parts',
    icon: Store,
    image3d: IMAGE_MANIFEST.icons3d.moldMaintenance,
    fullBleedBg: IMAGE_MANIFEST.marketplace.injectionMachineStudio,
    accentColor: 'from-[#2A1B0E] to-[#071A33]',
    badgeAr: 'لتجار الماكينات والمعدات',
    badgeEn: 'For Machinery & Equipment Traders',
  },
];

export const InteractiveFlipCards: React.FC<{
  compact?: boolean;
}> = ({ compact = false }) => {
  const { lang, t } = usePlastico();
  const location = useLocation();
  const navigate = useNavigate();
  const [flippedMap, setFlippedMap] = useState<Record<string, boolean>>({});
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const ArrowIcon = lang === 'ar' ? ArrowLeft : ArrowRight;

  // Reset all flipped cards automatically when navigating to any route
  useEffect(() => {
    setFlippedMap({});
    setHoveredId(null);
  }, [location.pathname, location.search]);

  const handleFrontClick = (id: string) => {
    setFlippedMap((prev) => ({
      ...prev,
      [id]: true,
    }));
  };

  const handleBackClick = (card: MainFlipCardItem) => {
    // On mobile/touch: 2nd tap on an already flipped card opens the section directly
    setFlippedMap({});
    setHoveredId(null);
    navigate(card.targetRoute);
  };

  const handleFlipBackOnly = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setFlippedMap((prev) => ({
      ...prev,
      [id]: false,
    }));
    setHoveredId(null);
  };

  return (
    <section
      data-testid="interactive-flip-cards-section"
      aria-label={t('بوابات الأدوار الصناعية التفاعلية', 'Interactive Industrial Role Gateways')}
      className="space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#1769E8] uppercase tracking-wider">
            <RotateCw className="w-3.5 h-3.5 text-[#FF8A2A]" />
            <span>
              {t(
                'البوابات التفاعلية الرئيسية — مرر بالماوس أو اضغط لقلب البطاقة',
                'Interactive Role Gateways — Hover or Tap to Flip'
              )}
            </span>
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#13243B] mt-1">
            {t(
              'اختر مسارك الصناعي داخل منظومة PLASTICO',
              'Choose Your Industrial Track Inside PLASTICO'
            )}
          </h2>
        </div>
        <p className="text-xs text-[#718096] font-semibold">
          {t(
            'على الكمبيوتر: مرر الماوس لقلب البطاقة • على الهاتف: الضغطة الأولى تقلب البطاقة للتفاصيل، والضغطة الثانية تفتح القسم',
            'Desktop: Hover to flip • Mobile: 1st tap flips for details, 2nd tap opens section'
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {MAIN_FLIP_CARDS.map((card) => {
          const Icon = card.icon;
          const isFlipped = Boolean(flippedMap[card.id]) || hoveredId === card.id;

          return (
            <div
              key={card.id}
              data-testid={`flip-card-${card.id}`}
              onMouseEnter={() => setHoveredId(card.id)}
              onMouseLeave={() =>
                setHoveredId((prev) => (prev === card.id ? null : prev))
              }
              className={`flip-card-perspective ${compact ? 'h-[340px]' : 'h-[365px]'} select-none`}
            >
              <div
                className={`flip-card-inner rounded-3xl ${isFlipped ? 'is-flipped' : ''}`}
              >
                {/* FRONT FACE — FULL-BLEED BACKGROUND IMAGE */}
                <div
                  onClick={() => handleFrontClick(card.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleFrontClick(card.id);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-expanded={isFlipped}
                  aria-label={`${t(card.titleAr, card.titleEn)} — ${t('اضغط لقلب البطاقة', 'Tap to flip card')}`}
                  className="flip-card-face rounded-3xl text-white p-5 border border-[#27BED6]/40 shadow-xl flex flex-col justify-between overflow-hidden cursor-pointer relative"
                >
                  {/* Full-Bleed Background Image filling 100% of the card */}
                  <img
                    src={card.fullBleedBg}
                    alt={t(card.titleAr, card.titleEn)}
                    className="absolute inset-0 w-full h-full object-cover object-center scale-105 transition-transform duration-500"
                  />
                  {/* Dark Industrial Gradient Overlay for high text contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#071A33] via-[#071A33]/80 to-[#071A33]/40" />

                  {/* Top Badge + Flip Indicator */}
                  <div className="flex items-center justify-between gap-2 relative z-10">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#071A33]/80 backdrop-blur-xs border border-white/20 text-[11px] font-extrabold text-[#27BED6]">
                      <Icon className="w-3.5 h-3.5 text-[#FF8A2A] shrink-0" />
                      <span className="truncate">{t(card.badgeAr, card.badgeEn)}</span>
                    </span>
                    <button
                      type="button"
                      data-testid={`flip-toggle-btn-${card.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFrontClick(card.id);
                      }}
                      title={t('اقلب البطاقة', 'Flip card')}
                      className="p-2 rounded-full bg-[#071A33]/80 hover:bg-[#1769E8] border border-white/20 text-white transition-colors cursor-pointer shrink-0"
                    >
                      <RotateCw className="w-3.5 h-3.5 text-[#27BED6]" />
                    </button>
                  </div>

                  {/* Center Floating 3D Emblem + Bold Title */}
                  <div className="my-auto flex flex-col items-center text-center space-y-2.5 py-2 relative z-10">
                    <div className="w-20 h-20 rounded-2xl bg-[#071A33]/75 backdrop-blur-xs border border-[#27BED6]/40 p-2 flex items-center justify-center shadow-lg">
                      <img
                        src={card.image3d}
                        alt=""
                        className="w-full h-full object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.5)]"
                      />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg sm:text-xl font-black text-white drop-shadow-sm">
                        {t(card.titleAr, card.titleEn)}
                      </h3>
                      <p className="text-xs text-slate-100 leading-relaxed line-clamp-2 px-1 font-semibold">
                        {t(card.shortFrontAr, card.shortFrontEn)}
                      </p>
                    </div>
                  </div>

                  {/* Direct CTA on Front Face */}
                  <div className="pt-2.5 border-t border-white/20 flex items-center justify-between gap-2 relative z-10">
                    <Link
                      to={card.targetRoute}
                      onClick={(e) => e.stopPropagation()}
                      data-testid={`flip-front-cta-${card.id}`}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#FF8A2A] hover:bg-[#F07B1A] text-white text-xs font-extrabold inline-flex items-center justify-center gap-2 shadow-md transition-colors"
                    >
                      <span>{t(card.ctaLabelAr, card.ctaLabelEn)}</span>
                      <ArrowIcon className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* BACK FACE — FULL-BLEED BACKGROUND + CLEAR DETAILS & NAVIGATION */}
                <div
                  onClick={() => handleBackClick(card)}
                  className="flip-card-face flip-card-back rounded-3xl bg-[#071A33] text-white p-5 border-2 border-[#27BED6] shadow-2xl flex flex-col justify-between overflow-hidden cursor-pointer relative"
                >
                  <img
                    src={card.fullBleedBg}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover object-center opacity-20"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-[#071A33]/95 via-[#071A33]/95 to-[#071A33]" />

                  <div className="space-y-3 relative z-10">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-black text-[#27BED6] flex items-center gap-1.5">
                        <Icon className="w-4 h-4 text-[#FF8A2A] shrink-0" />
                        <span>{t(card.titleAr, card.titleEn)}</span>
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleFlipBackOnly(e, card.id)}
                        className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-bold text-slate-200 inline-flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCw className="w-3 h-3" />
                        <span>{t('رجوع', 'Flip Back')}</span>
                      </button>
                    </div>

                    <p className="text-xs sm:text-sm font-bold text-white leading-relaxed">
                      {t(card.backDetailsAr, card.backDetailsEn)}
                    </p>

                    <ul className="space-y-1.5 pt-1">
                      {(lang === 'ar' ? card.highlightsAr : card.highlightsEn).map(
                        (item, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-1.5 text-[11px] text-slate-200 leading-snug"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-white/15 relative z-10">
                    <Link
                      to={card.targetRoute}
                      onClick={(e) => e.stopPropagation()}
                      data-testid={`flip-back-cta-${card.id}`}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#1769E8] hover:bg-[#1258C7] text-white text-xs font-extrabold inline-flex items-center justify-center gap-2 shadow-md transition-colors"
                    >
                      <span>{t(card.ctaLabelAr, card.ctaLabelEn)}</span>
                      <ArrowIcon className="w-3.5 h-3.5" />
                    </Link>
                    {card.secondaryRoute && (
                      <Link
                        to={card.secondaryRoute}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-extrabold inline-flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <span>
                          {t(card.secondaryLabelAr || '', card.secondaryLabelEn || '')}
                        </span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
