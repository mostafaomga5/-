import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  X,
  Sparkles,
  Store,
  Truck,
  Building2,
  GraduationCap,
  Briefcase,
  FileText,
  CheckCircle2,
  Clock,
  ArrowLeft,
  ArrowRight,
  UserPlus,
} from 'lucide-react';
import { usePlastico } from '../context/PlasticoContext';
import { PlasticoLogo } from './PlasticoLogo';
import { IMAGE_MANIFEST } from '../data/imageManifest';

export const ONBOARDING_STORAGE_KEY = 'plastico_onboarding_v2_seen';
export const ONBOARDING_OPEN_EVENT = 'plastico-open-onboarding';

export function openPlasticoOnboardingTour() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(ONBOARDING_OPEN_EVENT));
  }
}

export const OnboardingWelcomeModal: React.FC = () => {
  const { lang, t, isAuthenticated } = usePlastico();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(5);
  const [canClose, setCanClose] = useState<boolean>(false);
  const [activeRoleTab, setActiveRoleTab] = useState<
    'factory' | 'supplier' | 'engineer' | 'technician' | 'trader'
  >('factory');

  const ArrowIcon = lang === 'ar' ? ArrowLeft : ArrowRight;

  // Open automatically only when ?onboarding=1 is requested or when triggered by the Platform Tour button
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('onboarding') === '1') {
        setSecondsLeft(5);
        setCanClose(false);
        setIsOpen(true);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  // Listen for manual "التعريف بالمنصة" trigger from header/drawer
  useEffect(() => {
    const handleOpen = () => {
      setSecondsLeft(5);
      setCanClose(false);
      setIsOpen(true);
    };
    window.addEventListener(ONBOARDING_OPEN_EVENT, handleOpen);
    return () => window.removeEventListener(ONBOARDING_OPEN_EVENT, handleOpen);
  }, []);

  // 5-second countdown timer
  useEffect(() => {
    if (!isOpen) return;
    if (secondsLeft <= 0) {
      setCanClose(true);
      return;
    }
    const timer = window.setTimeout(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setCanClose(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [isOpen, secondsLeft]);

  const handleDismiss = () => {
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, '1');
    } catch {
      // ignore
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  const platformHighlights = [
    {
      titleAr: 'السوق الصناعي والمعدات',
      titleEn: 'Industrial Marketplace',
      descAr: 'بيع وشراء ماكينات الحقن والنفخ والسحب والفيلم والسخانات والمعدات المساعدة.',
      descEn: 'Buy & sell injection, blow, extrusion machines, heaters & auxiliary equipment.',
      img: IMAGE_MANIFEST.icons3d.injection,
      icon: Store,
      to: '/app/market',
    },
    {
      titleAr: 'موردو الخامات والماسترباتش',
      titleEn: 'Raw Materials & Masterbatch',
      descAr: 'توريد خامات PP, PE, PET, PVC, ABS والماسترباتش مع العينات والداتا شيت.',
      descEn: 'Source PP, PE, PET, PVC, ABS resins & masterbatch with TDS and samples.',
      img: IMAGE_MANIFEST.icons3d.rawMaterials,
      icon: Truck,
      to: '/app/suppliers',
    },
    {
      titleAr: 'المصانع والمعارض الافتراضية',
      titleEn: 'Factories & Virtual Expo',
      descAr: 'أجنحة رقمية للمصانع لاستعراض خطوط الإنتاج والطاقة المتاحة للتشغيل.',
      descEn: 'Digital factory booths showcasing production lines and available capacity.',
      img: IMAGE_MANIFEST.icons3d.blow,
      icon: Building2,
      to: '/app/expo',
    },
    {
      titleAr: 'طلبات التصنيع وعروض الأسعار (RFQ)',
      titleEn: 'Manufacturing RFQs',
      descAr: 'اطلب تصنيع منتجك أو اسطمبتك لدى المصانع وقارن عروض الأسعار ومدة التسليم.',
      descEn: 'Submit manufacturing RFQs to factories and compare quotes & delivery times.',
      img: IMAGE_MANIFEST.icons3d.extrusion,
      icon: FileText,
      to: '/app/manufacturing',
    },
    {
      titleAr: 'الوظائف والملفات المهنية',
      titleEn: 'Industrial Jobs & Profiles',
      descAr: 'ملفات مهنية مخصصة للمهندسين والفنيين والعمال والتقديم المباشر لوظائف المصانع.',
      descEn: 'Role-specific profiles for engineers & technicians with direct factory hiring.',
      img: IMAGE_MANIFEST.icons3d.thermoforming,
      icon: Briefcase,
      to: '/app/jobs',
    },
    {
      titleAr: 'أكاديمية بلاستيكو والمجتمع',
      titleEn: 'Academy & Faults Community',
      descAr: 'دورات تدريبية بشهادات موثقة وحلول مجربة لتشخيص أعطال الماكينات والقوالب.',
      descEn: 'Certified training courses and verified troubleshooting for machine faults.',
      img: IMAGE_MANIFEST.icons3d.qcInspection,
      icon: GraduationCap,
      to: '/app/training',
    },
  ];

  const roleBenefits: Record<
    typeof activeRoleTab,
    { titleAr: string; titleEn: string; pointsAr: string[]; pointsEn: string[] }
  > = {
    factory: {
      titleAr: 'لأصحاب ومديري المصانع',
      titleEn: 'For Factory Owners & Plant Managers',
      pointsAr: [
        'استقبال طلبات التصنيع للغير (RFQ) لتشغيل خطوط الإنتاج المتاحة بكامل طاقتها.',
        'طلب عروض أسعار الخامات والماسترباتش ومقارنة الموردين المعتمدين.',
        'عرض منتجات المصنع وخطوط إنتاجه في المعرض الافتراضي وتوظيف المهندسين والفنيين.',
      ],
      pointsEn: [
        'Receive contract manufacturing RFQs to maximize machine utilization.',
        'Request polymer & masterbatch quotes from verified suppliers.',
        'Showcase factory capabilities in the Virtual Expo and hire vetted technical staff.',
      ],
    },
    supplier: {
      titleAr: 'لموردي الخامات والماسترباتش',
      titleEn: 'For Raw Material & Masterbatch Suppliers',
      pointsAr: [
        'لوحة تحكم احترافية لإدارة خامات PP, PE, PET, PVC, ABS والماسترباتش.',
        'استقبال طلبات عروض الأسعار المباشرة (RFQ) والرسائل من المصانع.',
        'إبراز العلامات التجارية، نطاق التوريد المحلي والدولي، وتوفير العينات والداتا شيت.',
      ],
      pointsEn: [
        'Dedicated Supplier Dashboard to manage polymer grades and masterbatch listings.',
        'Receive direct RFQs and inquiries from verified factories.',
        'Highlight brands, local/international supply scope, samples, and technical data sheets.',
      ],
    },
    engineer: {
      titleAr: 'للمهندسين الصناعيين ومهندسي الجودة',
      titleEn: 'For Industrial & Quality Engineers',
      pointsAr: [
        'بناء ملف هندسي يبرز تخصصك، البرامج الهندسية، والمشروعات السابقة.',
        'المشاركة في تشخيص الأعطال الفنية وتبادل الخبرات مع كبار خبراء البوليمرات.',
        'الوصول إلى فرص العمل القيادية والدورات المتقدمة في أكاديمية بلاستيكو.',
      ],
      pointsEn: [
        'Build an engineering portfolio highlighting software, systems, and past projects.',
        'Collaborate on technical fault diagnostics and polymer processing standards.',
        'Access senior industrial career opportunities and Academy certifications.',
      ],
    },
    technician: {
      titleAr: 'للفنيين والعمال ومشغلي الماكينات',
      titleEn: 'For Technicians, Operators & Workers',
      pointsAr: [
        'ملف مهني مخصص يوضح الماكينات التي تجيد تشغيلها أو صيانتها وسنوات خبرتك.',
        'الوصول السريع لحلول أعطال الحقن والنفخ والسحب والهيدروليك.',
        'التقديم الفوري على وظائف المصانع وتطوير مهاراتك بشهادات معتمدة.',
      ],
      pointsEn: [
        'Tailored profile showcasing machines mastered, technical skills, and experience.',
        'Quick access to troubleshooting guides for injection, blow, and extrusion machines.',
        'Apply directly to factory jobs and earn Academy certificates.',
      ],
    },
    trader: {
      titleAr: 'لتجار الماكينات والمعدات الصناعية',
      titleEn: 'For Machinery & Equipment Traders',
      pointsAr: [
        'عرض الماكينات الجديدة والمستعملة والمعدات المساعدة بالمواصفات الفنية الكاملة.',
        'توضيح خدمات البيع والشراء وتوفير قطع الغيار والصيانة للمصانع.',
        'التواصل المباشر عبر الرسائل مع المشترين الصناعيين الجادين.',
      ],
      pointsEn: [
        'List new and used machinery with complete technical specifications and photos.',
        'Highlight buy/sell services, spare parts availability, and maintenance support.',
        'Chat directly with serious industrial buyers and factory owners.',
      ],
    },
  };

  return (
    <div
      data-testid="onboarding-welcome-modal"
      role="dialog"
      aria-modal="true"
      aria-label={t('شاشة الترحيب التعريفية بمنصة بلاستيكو', 'PLASTICO Platform Onboarding')}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#071A33]/80 backdrop-blur-xs overflow-y-auto"
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white border border-[#DFE7F1] shadow-2xl flex flex-col">
        {/* Top Promotional Label, Countdown & Always-Available Skip/Close Bar (§5) */}
        <div className="sticky top-0 z-20 bg-[#071A33] text-white px-4 sm:px-6 py-3.5 border-b border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <PlasticoLogo variant="horizontal" theme="dark" size="sm" />
            <span
              data-testid="promo-content-badge"
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#FF8A2A]/20 border border-[#FF8A2A]/40 text-[#FF8A2A] text-[11px] font-extrabold"
            >
              <Sparkles className="w-3 h-3 text-[#FF8A2A]" />
              <span>{t('إعلان · محتوى ترويجي', 'Ad · Promotional Intro')}</span>
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!canClose && (
              <div
                data-testid="onboarding-countdown"
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/10 border border-white/20 text-[11px] font-extrabold text-[#27BED6]"
              >
                <Clock className="w-3 h-3 text-[#FF8A2A] animate-spin" />
                <span>{secondsLeft}s</span>
              </div>
            )}
            <button
              type="button"
              data-testid="onboarding-close-btn"
              onClick={handleDismiss}
              aria-label={t('تخطي وإغلاق شاشة الترحيب', 'Skip & close onboarding modal')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-rose-600 text-white text-xs font-extrabold transition-colors cursor-pointer"
            >
              <span>{t('تخطي / إغلاق', 'Skip / Close')}</span>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hero Banner Inside Modal */}
        <div className="bg-gradient-to-br from-[#071A33] via-[#0B274C] to-[#071A33] text-white p-5 sm:p-7 border-b border-[#1769E8]/30">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#FF8A2A]/20 border border-[#FF8A2A]/40 text-[#FF8A2A] text-xs font-extrabold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {t(
                    'منظومة صناعية متكاملة لصناعة البلاستيك',
                    'Integrated Industrial Ecosystem for Plastics'
                  )}
                </span>
              </span>
              <h2 className="text-xl sm:text-3xl font-black text-white leading-snug">
                {t(
                  'مرحباً بك في PLASTICO — كل قطاع صناعة البلاستيك في منصة واحدة',
                  'Welcome to PLASTICO — The Complete Plastics Industry Platform'
                )}
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {t(
                  'تربط المنصة بين المصانع، موردي الخامات والماسترباتش، تجار الماكينات، المهندسين، والفنيين لتسهيل التوريد وطلبات التصنيع (RFQ) والتوظيف والتدريب الفني.',
                  'Connecting factories, polymer suppliers, machinery traders, engineers, and technicians for seamless sourcing, contract manufacturing RFQs, hiring, and technical training.'
                )}
              </p>
            </div>

            {/* 3D Floating Showcase */}
            <div className="lg:col-span-4 grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-2xl bg-white/8 border border-white/15 flex flex-col items-center text-center">
                <img
                  src={IMAGE_MANIFEST.icons3d.injection}
                  alt="Injection 3D"
                  className="w-12 h-12 object-contain mb-1"
                />
                <span className="text-[10px] font-extrabold text-[#27BED6]">
                  {t('الماكينات', 'Machinery')}
                </span>
              </div>
              <div className="p-2.5 rounded-2xl bg-white/8 border border-white/15 flex flex-col items-center text-center">
                <img
                  src={IMAGE_MANIFEST.icons3d.rawMaterials}
                  alt="Raw Materials 3D"
                  className="w-12 h-12 object-contain mb-1"
                />
                <span className="text-[10px] font-extrabold text-[#FF8A2A]">
                  {t('الخامات', 'Polymers')}
                </span>
              </div>
              <div className="p-2.5 rounded-2xl bg-white/8 border border-white/15 flex flex-col items-center text-center">
                <img
                  src={IMAGE_MANIFEST.icons3d.extrusion}
                  alt="Extrusion 3D"
                  className="w-12 h-12 object-contain mb-1"
                />
                <span className="text-[10px] font-extrabold text-emerald-400">
                  {t('التصنيع RFQ', 'RFQ & OEM')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-7 space-y-6 bg-[#F4F7FC]">
          {/* 6 Main Platform Sections */}
          <div className="space-y-3">
            <h3 className="text-sm sm:text-base font-extrabold text-[#071A33]">
              {t('الأقسام الرئيسية للمنصة:', 'Core Platform Sections:')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {platformHighlights.map((sec) => {
                const Icon = sec.icon;
                return (
                  <button
                    key={sec.titleAr}
                    type="button"
                    onClick={() => {
                      handleDismiss();
                      navigate(sec.to);
                    }}
                    className="text-start p-3.5 rounded-2xl bg-white border border-[#DFE7F1] hover:border-[#1769E8] shadow-2xs transition-all flex items-start gap-3 group cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#071A33] p-1.5 flex items-center justify-center shrink-0">
                      <img
                        src={sec.img}
                        alt={sec.titleAr}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5 text-[#1769E8] shrink-0" />
                        <h4 className="text-xs sm:text-sm font-extrabold text-[#13243B] group-hover:text-[#1769E8] leading-snug">
                          {t(sec.titleAr, sec.titleEn)}
                        </h4>
                      </div>
                      <p className="text-[11px] text-[#718096] mt-1 leading-relaxed">
                        {t(sec.descAr, sec.descEn)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* How Users Benefit by Industrial Role */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#DFE7F1] space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-sm sm:text-base font-extrabold text-[#071A33]">
                {t('كيف تستفيد من المنصة حسب دورك الصناعي؟', 'How Do You Benefit Based on Your Industrial Role?')}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'factory' as const, ar: 'صاحب مصنع', en: 'Factory' },
                  { id: 'supplier' as const, ar: 'مورد خامات', en: 'Supplier' },
                  { id: 'engineer' as const, ar: 'مهندس', en: 'Engineer' },
                  { id: 'technician' as const, ar: 'فني وعامل', en: 'Technician' },
                  { id: 'trader' as const, ar: 'تاجر معدات', en: 'Trader' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveRoleTab(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-colors cursor-pointer ${
                      activeRoleTab === tab.id
                        ? 'bg-[#1769E8] text-white'
                        : 'bg-[#F4F7FC] text-[#13243B] hover:bg-slate-200/70'
                    }`}
                  >
                    {t(tab.ar, tab.en)}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] space-y-2">
              <div className="text-xs sm:text-sm font-extrabold text-[#1769E8]">
                {t(roleBenefits[activeRoleTab].titleAr, roleBenefits[activeRoleTab].titleEn)}
              </div>
              <ul className="space-y-1.5">
                {(lang === 'ar'
                  ? roleBenefits[activeRoleTab].pointsAr
                  : roleBenefits[activeRoleTab].pointsEn
                ).map((pt, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-[#13243B] font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Early-Access Free Availability Marketing Banner */}
          <div
            data-testid="onboarding-marketing-message"
            className="rounded-2xl bg-gradient-to-r from-[#071A33] via-[#0E2B56] to-[#071A33] text-white p-5 sm:p-6 border border-[#27BED6]/40 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-1.5 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-extrabold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t('المرحلة الحالية مجانية بالكامل', 'Currently Free During Current Phase')}</span>
              </div>
              <h4 className="text-base sm:text-lg font-black text-[#FF8A2A]">
                {t('انضم إلى PLASTICO الآن', 'Join PLASTICO Now')}
              </h4>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                {t(
                  'اكتشف منظومة صناعة البلاستيك في مكان واحد. سجّل الآن واستفد من الخدمات المتاحة مجانًا خلال المرحلة الحالية، وكن من أوائل أعضاء مجتمعنا الصناعي قبل إطلاق الخطط المدفوعة مستقبلًا.',
                  'Discover the plastics industry ecosystem in one place. Register now and benefit from services available for free during the current phase, and be among the first members of our industrial community before future paid plans launch.'
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {!isAuthenticated && (
                <Link
                  to="/auth/register"
                  onClick={handleDismiss}
                  className="px-5 py-3 rounded-xl bg-[#FF8A2A] hover:bg-[#F07B1A] text-white text-xs sm:text-sm font-extrabold inline-flex items-center gap-2 shadow-md transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{t('سجّل حسابك مجاناً الآن', 'Register Free Now')}</span>
                </Link>
              )}
              <button
                type="button"
                onClick={handleDismiss}
                className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs sm:text-sm font-extrabold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>{t('ابدأ تصفح المنصة', 'Explore Platform')}</span>
                <ArrowIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
