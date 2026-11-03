import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Globe,
  Search,
  Store,
  Truck,
  Building2,
  GraduationCap,
  Users,
  Wrench,
  Briefcase,
  Factory,
  ArrowLeft,
  ArrowRight,
  LogIn,
  UserPlus,
  LayoutDashboard,
  CheckCircle2,
  Sparkles,
  Leaf,
  Cog,
  ShieldCheck,
  Menu,
  X,
  MessageSquare,
  HelpCircle,
} from 'lucide-react';
import { usePlastico } from '../context/PlasticoContext';
import { PlasticoLogo } from '../components/PlasticoLogo';
import { SmartPlasticoAssistant } from '../components/SmartPlasticoAssistant';
import { IMAGE_MANIFEST } from '../data/imageManifest';
import {
  OnboardingWelcomeModal,
  openPlasticoOnboardingTour,
} from '../components/OnboardingWelcomeModal';
import { InteractiveRfqSection } from '../components/RfqAndSupplierSections';
import { InteractiveFlipCards } from '../components/InteractiveFlipCards';
import { ThemeAndCurrencyControls } from '../components/ThemeAndCurrencyControls';

export const PublicHomepage: React.FC = () => {
  const {
    lang,
    setLang,
    t,
    isAuthenticated,
    realUser,
    setIsSearchOpen,
    openLightbox,
    unreadChatCount,
  } = usePlastico();
  const navigate = useNavigate();
  const [heroQuery, setHeroQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const ArrowIcon = lang === 'ar' ? ArrowLeft : ArrowRight;

  const topNavLinks = [
    { to: '/', labelAr: 'الرئيسية', labelEn: 'Home' },
    { to: '/app/companies', labelAr: 'المصانع والشركات', labelEn: 'Factories & Companies' },
    { to: '/app/suppliers', labelAr: 'الموردون', labelEn: 'Suppliers' },
    { to: '/app/market', labelAr: 'السوق الصناعي', labelEn: 'Marketplace' },
    { to: '/app/jobs', labelAr: 'الوظائف', labelEn: 'Jobs' },
    { to: '/app/faults', labelAr: 'الأعطال والمجتمع', labelEn: 'Faults & Community' },
    { to: '/app/training', labelAr: 'الأكاديمية', labelEn: 'Academy' },
  ];

  const entryCards = [
    {
      titleAr: 'السوق الصناعي',
      titleEn: 'Industrial Marketplace',
      descAr: 'ماكينات حقن ونفخ وسحب، خامات بوليمر، ومعدات مستعملة ومساعدة.',
      descEn: 'Injection, blow & extrusion machines, polymer resins, and used gear.',
      icon: Store,
      icon3d: IMAGE_MANIFEST.icons3d.injection,
      to: '/app/market',
    },
    {
      titleAr: 'دليل الموردين',
      titleEn: 'Suppliers Directory',
      descAr: 'دليل موردي الخامات، الماسترباتش، السخانات، الشيلرات، وقطع الغيار.',
      descEn: 'Verified suppliers of raw materials, masterbatch, heaters & chillers.',
      icon: Truck,
      icon3d: IMAGE_MANIFEST.icons3d.rawMaterials,
      to: '/app/suppliers',
    },
    {
      titleAr: 'دليل المصانع والشركات',
      titleEn: 'Factories & Companies',
      descAr: 'ملفات المصانع، خطوط الإنتاج، الطاقة المتاحة، والتواصل المباشر.',
      descEn: 'Factory profiles, production lines, available capacity & direct contact.',
      icon: Building2,
      icon3d: IMAGE_MANIFEST.icons3d.blow,
      to: '/app/companies',
    },
    {
      titleAr: 'الأكاديمية',
      titleEn: 'PLASTICO Academy',
      descAr: 'دورات عملية في تشغيل الماكينات وتشخيص العيوب والقوالب مع شهادات إتمام.',
      descEn: 'Practical courses in machine setup, defects, and molds with certificates.',
      icon: GraduationCap,
      icon3d: IMAGE_MANIFEST.icons3d.qcInspection,
      to: '/app/training',
    },
    {
      titleAr: 'المجتمع الصناعي',
      titleEn: 'Industrial Community',
      descAr: 'نقاشات تقنية وتبادل خبرات بين المهندسين والفنيين وأصحاب المصانع.',
      descEn: 'Technical discussions connecting engineers, technicians & factories.',
      icon: Users,
      icon3d: IMAGE_MANIFEST.icons3d.printing,
      to: '/app/faults',
    },
    {
      titleAr: 'الأعطال والصيانة',
      titleEn: 'Faults & Maintenance',
      descAr: 'تشخيص أعطال الحقن والنفخ والسحب والهيدروليك والكنترول بحلول مجربة.',
      descEn: 'Troubleshooting injection, blow, extrusion, hydraulic & PLC faults.',
      icon: Wrench,
      icon3d: IMAGE_MANIFEST.icons3d.moldMaintenance,
      to: '/app/faults',
    },
    {
      titleAr: 'الوظائف الصناعية',
      titleEn: 'Industrial Jobs',
      descAr: 'فرص عمل للمهندسين، الفنيين، مشغلي الماكينات، ومراقبي الجودة.',
      descEn: 'Career openings for engineers, technicians, operators & QC staff.',
      icon: Briefcase,
      icon3d: IMAGE_MANIFEST.icons3d.thermoforming,
      to: '/app/jobs',
    },
    {
      titleAr: 'خدمات التصنيع (RFQ)',
      titleEn: 'Manufacturing Services',
      descAr: 'طلبات تصنيع للغير (RFQ)، تشغيل طاقات الماكينات المتاحة، وتصنيع القوالب.',
      descEn: 'Contract manufacturing RFQs, machine capacity, and mold tooling.',
      icon: Factory,
      icon3d: IMAGE_MANIFEST.icons3d.extrusion,
      to: '/app/manufacturing',
    },
  ];

  // Exact 6 Role Value Proposition Cards from Section 3 of PLASTICO Master Build Prompt
  const personas = [
    {
      roleAr: 'فني أو عامل',
      roleEn: 'Technician or Operator',
      descAr:
        'بتدور على وظيفة في مجال البلاستيك؟ أنشئ ملفك المهني، اعرض خبراتك، وابحث عن الوظائف المناسبة لتخصصك.',
      descEn:
        'Looking for a job in plastics? Build your professional profile, showcase your machine experience, and apply to matching factory jobs.',
      to: '/app/jobs',
      ctaAr: 'تصفح الوظائف وسجل ملفك',
      ctaEn: 'Browse Jobs & Build Profile',
    },
    {
      roleAr: 'مهندس',
      roleEn: 'Engineer',
      descAr:
        'اعثر على فرص هندسية وإشرافية، تواصل مع المصانع والمتخصصين، ووسّع شبكة علاقاتك المهنية.',
      descEn:
        'Discover engineering and supervisory opportunities, connect with factories and specialists, and expand your industrial network.',
      to: '/app/jobs',
      ctaAr: 'استكشف الفرص الهندسية',
      ctaEn: 'Explore Engineering Roles',
    },
    {
      roleAr: 'صاحب مصنع',
      roleEn: 'Factory Owner',
      descAr:
        'ابحث عن الفنيين والمهندسين والعمال، والخامات، والماكينات الجديدة والمستعملة، والموردين وخدمات التصنيع.',
      descEn:
        'Find technicians, engineers, operators, polymer resins, new & used machinery, suppliers, and contract manufacturing services.',
      to: '/app/companies',
      ctaAr: 'ادخل بوابة المصانع',
      ctaEn: 'Enter Factory Portal',
    },
    {
      roleAr: 'مورد',
      roleEn: 'Supplier',
      descAr:
        'اعرض منتجاتك وخاماتك ومعداتك، وأنشئ صفحة لشركتك، واستقبل استفسارات وطلبات أسعار.',
      descEn:
        'Showcase your polymer resins, masterbatch, and products, create your company page, and receive buyer inquiries and RFQs.',
      to: '/app/suppliers',
      ctaAr: 'ادخل دليل الموردين',
      ctaEn: 'Enter Suppliers Directory',
    },
    {
      roleAr: 'تاجر معدات',
      roleEn: 'Equipment Trader',
      descAr:
        'اعرض الماكينات الجديدة والمستعملة، مع الصور والمواصفات والحالة الفنية، وتواصل مع المشترين.',
      descEn:
        'List new and used machinery with photos, technical specifications, and condition grading, and connect directly with buyers.',
      to: '/app/market/machinery',
      ctaAr: 'تصفح واعرض المعدات',
      ctaEn: 'Browse & List Machinery',
    },
    {
      roleAr: 'مشكلة فنية / عطل',
      roleEn: 'Technical Issue / Fault',
      descAr:
        'انشر العطل بالصور أو الفيديو، وشارك خبراء الصناعة للحصول على المساعدة.',
      descEn:
        'Publish the machine or mold fault with photos or video, and collaborate with industry experts to get field-tested solutions.',
      to: '/app/faults',
      ctaAr: 'انشر العطل أو تصفح الحلول',
      ctaEn: 'Post Fault or Browse Solutions',
    },
  ];

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroQuery.trim()) {
      setIsSearchOpen(true);
      return;
    }
    navigate(`/app/search?q=${encodeURIComponent(heroQuery.trim())}`);
  };

  return (
    <div className="min-h-screen bg-[#F4F7FC] text-[#13243B] flex flex-col overflow-x-hidden">
      <OnboardingWelcomeModal />

      {/* Top Primary Navigation Header */}
      <header className="sticky top-0 z-30 bg-[#071A33] text-white border-b border-white/10">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 h-16 sm:h-18 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={t('القائمة الرئيسية', 'Main Menu')}
              className="lg:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white shrink-0"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link to="/" className="shrink-0">
              <PlasticoLogo variant="horizontal" theme="dark" size="sm" />
            </Link>
          </div>

          {/* Desktop 7 Navigation Links */}
          <nav
            aria-label={t('التنقل الرئيسي', 'Primary Navigation')}
            className="hidden lg:flex items-center gap-1 shrink-0"
          >
            {topNavLinks.map((item, idx) => (
              <Link
                key={item.to}
                to={item.to}
                className={`px-2.5 py-2 rounded-lg text-xs font-extrabold whitespace-nowrap shrink-0 transition-colors ${
                  idx === 0
                    ? 'text-white bg-white/12 border-b-2 border-[#FF8A2A]'
                    : 'text-slate-200 hover:text-white hover:bg-white/8'
                }`}
              >
                {t(item.labelAr, item.labelEn)}
              </Link>
            ))}
          </nav>

          {/* Right/Left Actions: Currency + Dark Mode + Tour + Messages + Language + Auth */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <ThemeAndCurrencyControls compact />

            <button
              type="button"
              onClick={openPlasticoOnboardingTour}
              data-testid="open-onboarding-btn"
              title={t('التعريف بالمنصة', 'Platform Tour')}
              className="hidden md:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/8 hover:bg-white/15 border border-white/15 text-[11px] font-extrabold text-[#27BED6] whitespace-nowrap shrink-0 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FF8A2A] shrink-0" />
              <span className="hidden xl:inline">{t('التعريف بالمنصة', 'Platform Tour')}</span>
            </button>

            <Link
              to="/app/messages"
              data-testid="header-messages-link"
              title={t('الرسائل والاستفسارات', 'Messages & Inquiries')}
              aria-label={t('الرسائل والاستفسارات', 'Messages & Inquiries')}
              className="hidden sm:inline-flex relative p-2 rounded-lg bg-white/8 hover:bg-white/15 border border-white/15 text-white transition-colors shrink-0"
            >
              <MessageSquare className="w-4 h-4 text-[#27BED6]" />
              {unreadChatCount > 0 && (
                <span className="absolute -top-1 -end-1 min-w-[16px] h-4 px-1 rounded-full bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center">
                  {unreadChatCount}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/8 hover:bg-white/15 border border-white/15 text-[11px] font-extrabold text-white whitespace-nowrap shrink-0 transition-colors cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-[#27BED6]" />
              <span>{lang === 'ar' ? 'EN' : 'عربي'}</span>
            </button>

            {isAuthenticated && realUser ? (
              <Link
                to="/app/home"
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#1769E8] hover:bg-[#1258C7] text-white text-xs font-extrabold whitespace-nowrap shrink-0 transition-colors"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>{t('لوحة التحكم', 'Dashboard')}</span>
              </Link>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/8 hover:bg-white/15 border border-white/20 text-white text-xs font-extrabold whitespace-nowrap shrink-0 transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{t('دخول', 'Sign In')}</span>
                </Link>
                <Link
                  to="/auth/register"
                  className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FF8A2A] hover:bg-[#F07B1A] text-white text-xs font-extrabold whitespace-nowrap shrink-0 shadow-sm transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5 hidden sm:inline" />
                  <span>{t('إنشاء حساب', 'Register')}</span>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0A2242] border-t border-white/10 px-4 py-3 grid grid-cols-2 gap-2">
            {topNavLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl bg-white/8 hover:bg-[#1769E8] text-xs font-extrabold text-white"
              >
                {t(item.labelAr, item.labelEn)}
              </Link>
            ))}
            <Link
              to="/app/messages"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl bg-white/8 hover:bg-[#1769E8] text-xs font-extrabold text-[#27BED6] flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{t('الرسائل والاستفسارات', 'Messages')}</span>
            </Link>
            <Link
              to="/auth/login"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl bg-white/8 hover:bg-[#1769E8] text-xs font-extrabold text-white flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5 text-[#27BED6]" />
              <span>{t('تسجيل الدخول', 'Sign In')}</span>
            </Link>
            <Link
              to="/auth/register"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl bg-[#FF8A2A] text-xs font-extrabold text-white flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{t('إنشاء حساب جديد', 'Register')}</span>
            </Link>
            <button
              type="button"
              onClick={() => {
                setLang(lang === 'ar' ? 'en' : 'ar');
                setMobileMenuOpen(false);
              }}
              className="px-3 py-2 rounded-xl bg-white/8 hover:bg-[#1769E8] text-xs font-extrabold text-white flex items-center gap-1.5 text-start cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-[#27BED6]" />
              <span>{lang === 'ar' ? 'English (EN)' : 'العربية (AR)'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                openPlasticoOnboardingTour();
              }}
              className="px-3 py-2 rounded-xl bg-[#FF8A2A]/20 border border-[#FF8A2A]/40 text-xs font-extrabold text-[#FF8A2A] flex items-center gap-1.5 text-start cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('التعريف بالمنصة', 'Platform Tour')}</span>
            </button>
          </div>
        )}
      </header>

      {/* Deep Navy Industrial Hero Section — 5-Second Hook */}
      <section
        data-testid="hero-5sec-hook-section"
        className="relative bg-[#071A33] text-white overflow-hidden border-b border-[#1769E8]/30"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 lg:py-14 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Text, Search & Actions Column */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex flex-wrap items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#1769E8]/20 border border-[#27BED6]/35 text-[#27BED6] text-xs font-extrabold">
              <Sparkles className="w-3.5 h-3.5 text-[#FF8A2A]" />
              <span>
                {t(
                  'المنظومة الرقمية المتكاملة لصناعة البلاستيك — جميع الخدمات متاحة مجاناً حالياً',
                  'The Integrated Plastics Ecosystem — All Core Services Currently Free'
                )}
              </span>
            </div>

            <h1
              data-testid="hero-main-headline"
              className="text-2xl sm:text-4xl lg:text-[42px] font-black leading-tight tracking-tight text-white"
            >
              {t(
                'كل اللي بتدور عليه في صناعة البلاستيك... أصبح في مكان واحد.',
                'Everything You Are Looking For in the Plastics Industry... Is Now in One Place.'
              )}
            </h1>

            <p
              data-testid="hero-main-subheadline"
              className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl font-semibold"
            >
              {t(
                'بتدور على وظيفة؟ محتاج فني؟ بتبحث عن خامة؟ ماكينة؟ مورد؟ أو عندك عطل محتاج حل؟ PLASTICO بتجمعك بكل أطراف صناعة البلاستيك.',
                'Looking for a job? Need a technician? Searching for raw material, a machine, a supplier, or have a fault that needs a solution? PLASTICO connects you with every part of the plastics industry.'
              )}
            </p>

            {/* Universal Search Bar with Orange Search Button */}
            <form
              onSubmit={handleHeroSearch}
              className="bg-white rounded-2xl p-1.5 shadow-xl flex items-center gap-2 max-w-2xl border border-[#DFE7F1]"
            >
              <div className="ps-3 text-[#718096]">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={heroQuery}
                onChange={(e) => setHeroQuery(e.target.value)}
                placeholder={t(
                  'ابحث عن مصانع، موردين، خامات، ماكينات، قوالب، وظائف، أو حلول أعطال...',
                  'Search factories, suppliers, resins, machinery, molds, jobs, or faults...'
                )}
                className="flex-1 min-w-0 bg-transparent text-[#13243B] placeholder-[#718096] text-xs sm:text-sm font-semibold px-2 py-2.5 focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-[#FF8A2A] hover:bg-[#F07B1A] text-white text-xs sm:text-sm font-extrabold transition-colors shrink-0 cursor-pointer"
              >
                {t('بحث شامل', 'Search All')}
              </button>
            </form>

            {/* Quick Industrial Process & Category Filter Chips */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { labelAr: 'الماكينات والمعدات', labelEn: 'Machinery', to: '/app/market/machinery' },
                { labelAr: 'الخامات والماسترباتش', labelEn: 'Raw Materials', to: '/app/market/raw-materials' },
                { labelAr: 'القوالب وقطع الغيار', labelEn: 'Molds & Spares', to: '/app/market/molds-spares' },
                { labelAr: 'دليل المصانع', labelEn: 'Factories Directory', to: '/app/companies' },
                { labelAr: 'الوظائف الصناعية', labelEn: 'Industrial Jobs', to: '/app/jobs' },
                { labelAr: 'حلول الأعطال', labelEn: 'Fault Solutions', to: '/app/faults' },
              ].map((chip) => (
                <Link
                  key={chip.labelAr}
                  to={chip.to}
                  className="px-3.5 py-1.5 rounded-lg bg-white/8 hover:bg-[#1769E8] border border-white/15 text-xs font-bold text-slate-200 hover:text-white transition-colors"
                >
                  {t(chip.labelAr, chip.labelEn)}
                </Link>
              ))}
            </div>

            {/* Primary & Secondary Hero CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/auth/register"
                className="px-6 py-3.5 rounded-xl bg-[#FF8A2A] hover:bg-[#F07B1A] text-white text-sm font-extrabold inline-flex items-center gap-2 shadow-lg transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>
                  {t('سجل الآن مجاناً واختر دورك الصناعي', 'Register Free & Choose Your Role')}
                </span>
              </Link>
              <Link
                to="/app/home"
                className="px-6 py-3.5 rounded-xl bg-[#1769E8] hover:bg-[#1258C7] text-white text-sm font-extrabold inline-flex items-center gap-2 shadow-lg transition-colors"
              >
                <span>{t('استكشف لوحة المنصة', 'Explore Platform Dashboard')}</span>
                <ArrowIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Interactive 3D Industrial Ecosystem Scene Column */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl bg-gradient-to-br from-[#0D284D] to-[#071A33] p-4 sm:p-5 border border-[#27BED6]/35 shadow-2xl space-y-3">
              <div className="flex items-center justify-between text-xs font-extrabold text-[#27BED6]">
                <span>
                  {t(
                    'شبكة صناعة البلاستيك المتكاملة 3D',
                    '3D Connected Plastics Industry Network'
                  )}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px]">
                  {t('مصنع • مورد • فني • مهندس', 'Factory • Supplier • Tech • Engineer')}
                </span>
              </div>

              <div
                onClick={() =>
                  openLightbox(
                    [
                      IMAGE_MANIFEST.marketplace.newInjectionMachine,
                      IMAGE_MANIFEST.marketplace.usedInjectionMachine,
                      IMAGE_MANIFEST.marketplace.resinGranules,
                    ],
                    0,
                    t('منظومة ماكينات وخامات وقوالب البلاستيك — PLASTICO', 'PLASTICO Industrial Showcase')
                  )
                }
                className="cursor-zoom-in rounded-2xl overflow-hidden bg-[#0A2242] relative"
              >
                <img
                  src={IMAGE_MANIFEST.marketplace.newInjectionMachine}
                  alt={t('ماكينة حقن البلاستيك الاحترافية', 'Industrial Injection Molding Machine')}
                  className="w-full h-48 sm:h-52 object-cover rounded-2xl transition-transform duration-300 hover:scale-105"
                />
                <div className="absolute bottom-2 inset-x-2 bg-[#071A33]/85 backdrop-blur-xs rounded-xl px-3 py-1.5 border border-white/15 flex items-center justify-between text-[11px] font-bold text-slate-200">
                  <span>{t('ماكينات حقن • نفخ • سحب • اسطمبات', 'Injection • Blow • Extrusion • Molds')}</span>
                  <span className="text-[#FF8A2A]">{t('اضغط للتكبير', 'Click to Zoom')}</span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <Link
                  to="/app/market/machinery"
                  className="p-2 rounded-xl bg-white/8 hover:bg-white/15 border border-white/10 flex flex-col items-center text-center transition-colors"
                >
                  <img
                    src={IMAGE_MANIFEST.icons3d.blow}
                    alt="Blow Molding"
                    className="w-10 h-10 object-contain mb-1"
                  />
                  <span className="text-[10px] font-bold text-[#27BED6] leading-tight">
                    {t('ماكينات النفخ', 'Blow Machines')}
                  </span>
                </Link>
                <Link
                  to="/app/market/raw-materials"
                  className="p-2 rounded-xl bg-white/8 hover:bg-white/15 border border-white/10 flex flex-col items-center text-center transition-colors"
                >
                  <img
                    src={IMAGE_MANIFEST.icons3d.rawMaterials}
                    alt="Polymer Raw Materials"
                    className="w-10 h-10 object-contain mb-1"
                  />
                  <span className="text-[10px] font-bold text-[#FF8A2A] leading-tight">
                    {t('حبيبات بوليمر', 'Polymer Resins')}
                  </span>
                </Link>
                <Link
                  to="/app/market/molds-spares"
                  className="p-2 rounded-xl bg-white/8 hover:bg-white/15 border border-white/10 flex flex-col items-center text-center transition-colors"
                >
                  <img
                    src={IMAGE_MANIFEST.icons3d.moldMaintenance}
                    alt="Molds & Tooling"
                    className="w-10 h-10 object-contain mb-1"
                  />
                  <span className="text-[10px] font-bold text-emerald-300 leading-tight">
                    {t('قوالب واسطمبات', 'Molds & Tooling')}
                  </span>
                </Link>
                <Link
                  to="/app/services"
                  className="p-2 rounded-xl bg-white/8 hover:bg-white/15 border border-white/10 flex flex-col items-center text-center transition-colors"
                >
                  <img
                    src={IMAGE_MANIFEST.icons3d.extrusion}
                    alt="Auxiliary & Services"
                    className="w-10 h-10 object-contain mb-1"
                  />
                  <span className="text-[10px] font-bold text-amber-300 leading-tight">
                    {t('معدات وخدمات', 'Aux & Services')}
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-12">
        {/* 4 MAIN INTERACTIVE 3D FLIP CARDS (Job Seeker, Factory Owner, Supplier, Equipment Trader) */}
        <InteractiveFlipCards />

        {/* 6 Role Value Proposition Cards + Free-Access Notice (Section 3 of Prompt) */}
        <section
          data-testid="six-roles-value-section"
          className="bg-white rounded-3xl border border-[#DFE7F1] p-6 sm:p-8 shadow-xs space-y-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#DFE7F1] pb-5">
            <div>
              <span className="text-xs font-extrabold text-[#1769E8] uppercase tracking-wider">
                {t(
                  'لماذا PLASTICO؟ قيمة واضحة ومباشرة لكل طرف في الصناعة',
                  'Why PLASTICO? Direct Value for Every Role in the Industry'
                )}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#13243B] mt-1">
                {t(
                  'افهم في ثوانٍ كيف تخدمك المنصة حسب دورك الصناعي',
                  'See in Seconds How the Platform Serves Your Specific Role'
                )}
              </h2>
            </div>

            <div className="px-4 py-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold max-w-md">
              <div className="flex items-center gap-2 font-black text-emerald-800 mb-0.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {t(
                    'جميع الخدمات الأساسية متاحة مجاناً خلال المرحلة الحالية',
                    'All Core Services Are Currently Free'
                  )}
                </span>
              </div>
              <p className="text-[11px] text-emerald-700 leading-relaxed">
                {t(
                  'سجّل الآن واستفد من الإتاحة المجانية لبناء ملفك أو صفحة مصنعك وشركتك قبل إطلاق الباقات المدفوعة الاختيارية مستقبلاً.',
                  'Register now to enjoy free access and establish your profile or company page before optional paid tiers launch in the future.'
                )}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {personas.map((p) => (
              <div
                key={p.roleAr}
                data-testid={`role-value-card-${p.roleEn.toLowerCase().replace(/\s+/g, '-')}`}
                className="rounded-2xl bg-[#F4F7FC] border border-[#DFE7F1] hover:border-[#1769E8] p-5 flex flex-col justify-between gap-4 transition-all"
              >
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-[#071A33] text-white text-xs font-extrabold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#FF8A2A] shrink-0" />
                    <span>{t(p.roleAr, p.roleEn)}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#13243B] font-semibold leading-relaxed">
                    {t(p.descAr, p.descEn)}
                  </p>
                </div>
                <Link
                  to={p.to}
                  className="inline-flex items-center justify-between pt-3 border-t border-[#DFE7F1] text-xs font-extrabold text-[#1769E8] hover:text-[#071A33]"
                >
                  <span>{t(p.ctaAr, p.ctaEn)}</span>
                  <ArrowIcon className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* 8 Visual Entry Cards Section */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <span className="text-xs font-extrabold text-[#1769E8] uppercase tracking-wider">
                {t('أقسام منظومة بلاستيكو', 'PLASTICO Ecosystem Modules')}
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#13243B] mt-1">
                {t(
                  'وصول فوري لجميع قطاعات الصناعة والخدمات الفنية',
                  'Direct Access to Every Industrial Sector & Technical Service'
                )}
              </h2>
            </div>
            <Link
              to="/app/home"
              className="text-xs font-extrabold text-[#1769E8] hover:underline inline-flex items-center gap-1"
            >
              <span>{t('فتح لوحة التحكم الكاملة', 'Open Full Platform Dashboard')}</span>
              <ArrowIcon className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            data-testid="homepage-upgraded-cards"
          >
            {entryCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.titleAr}
                  to={card.to}
                  className="group rounded-2xl bg-white border border-[#DFE7F1] hover:border-[#1769E8] shadow-xs hover:shadow-xl transition-all duration-200 overflow-hidden flex flex-col justify-between min-w-0"
                >
                  <div className="relative h-36 bg-gradient-to-br from-[#0B2B59] to-[#071A33] p-4 flex items-center justify-between overflow-hidden">
                    <div className="relative z-10 flex flex-col justify-between h-full">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 border border-white/15 text-[10px] font-extrabold text-[#27BED6] w-fit">
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span>PLASTICO</span>
                      </span>
                      <h3 className="text-base sm:text-lg font-extrabold text-white group-hover:text-[#FF8A2A] transition-colors">
                        {t(card.titleAr, card.titleEn)}
                      </h3>
                    </div>
                    {card.icon3d ? (
                      <img
                        src={card.icon3d}
                        alt={card.titleAr}
                        className="w-24 h-24 object-contain drop-shadow-[0_10px_16px_rgba(0,0,0,0.45)] group-hover:scale-110 transition-transform duration-300 shrink-0"
                      />
                    ) : (
                      <Icon className="w-12 h-12 text-[#27BED6]" />
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                    <p className="text-xs text-[#4A5568] leading-relaxed font-medium">
                      {t(card.descAr, card.descEn)}
                    </p>
                    <div className="flex items-center justify-between pt-2.5 border-t border-[#DFE7F1] text-xs font-extrabold text-[#1769E8] group-hover:text-[#071A33]">
                      <span>{t('استكشف القسم', 'Explore Section')}</span>
                      <ArrowIcon className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Interactive Manufacturing RFQ Section */}
        <InteractiveRfqSection />

        {/* 3 Feature Banners */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Academy */}
          <div className="rounded-2xl bg-[#071A33] text-white p-6 border border-[#1769E8]/30 flex flex-col justify-between gap-5 shadow-md">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 text-[#27BED6] text-[11px] font-bold">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>{t('أكاديمية بلاستيكو', 'PLASTICO Academy')}</span>
              </span>
              <h3 className="text-xl font-extrabold text-white">
                {t('تعلم .. طور مهاراتك', 'Learn & Upgrade Your Skills')}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t(
                  'مسارات تدريبية متخصصة في تشغيل ماكينات الحقن، صيانة الاسطمبات، وعلم البوليمرات مع شهادات إتمام بعد اجتياز التقييم.',
                  'Specialized courses in injection machine setup, mold care, and polymer science with completion certificates.'
                )}
              </p>
            </div>
            <Link
              to="/app/training"
              className="self-start px-5 py-2.5 rounded-xl bg-[#FF8A2A] hover:bg-[#F07B1A] text-white text-xs font-extrabold inline-flex items-center gap-2 transition-colors"
            >
              <span>{t('ابدأ التعلم الآن', 'Start Learning Now')}</span>
              <ArrowIcon className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 2: Marketplace & Suppliers */}
          <div className="rounded-2xl bg-gradient-to-br from-[#0B2B59] to-[#071A33] text-white p-6 border border-[#1769E8]/40 flex flex-col justify-between gap-5 shadow-md">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 text-[#27BED6] text-[11px] font-bold">
                <Cog className="w-3.5 h-3.5" />
                <span>{t('السوق ودليل الموردين', 'Marketplace & Suppliers')}</span>
              </span>
              <h3 className="text-xl font-extrabold text-white">
                {t('ابحث .. قارن .. اختر', 'Search, Compare & Choose')}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t(
                  'قارن المواصفات الفنية للماكينات الجديدة والمستعملة، السخانات، الشيلرات، وخامات البوليمر وتواصل مباشرة مع الموردين.',
                  'Compare technical specs for new and used machinery, heaters, chillers, and polymer resins.'
                )}
              </p>
            </div>
            <Link
              to="/app/market"
              className="self-start px-5 py-2.5 rounded-xl bg-[#1769E8] hover:bg-[#1258C7] text-white text-xs font-extrabold inline-flex items-center gap-2 transition-colors"
            >
              <span>{t('تصفح السوق', 'Browse Marketplace')}</span>
              <ArrowIcon className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 3: Recycling & Sustainability */}
          <div className="rounded-2xl bg-gradient-to-br from-[#0B3B2E] to-[#07221B] text-white p-6 border border-emerald-500/30 flex flex-col justify-between gap-5 shadow-md">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 text-emerald-300 text-[11px] font-bold">
                <Leaf className="w-3.5 h-3.5" />
                <span>{t('إعادة التدوير والاستدامة', 'Recycling & Sustainability')}</span>
              </span>
              <h3 className="text-xl font-extrabold text-white">
                {t('معاً من أجل مستقبل أخضر', 'Together for a Greener Future')}
              </h3>
              <p className="text-xs text-emerald-100/90 leading-relaxed">
                {t(
                  'معدات غسيل وتخريز البلاستيك، الكسارات، وخامات الـ rPET والـ rHDPE المعاد تدويرها بمعايير صناعية.',
                  'Plastic washing and pelletizing lines, crushers, and industrial-grade rPET and rHDPE materials.'
                )}
              </p>
            </div>
            <Link
              to="/app/market/raw-materials"
              className="self-start px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold inline-flex items-center gap-2 transition-colors"
            >
              <span>{t('تعرف أكثر', 'Learn More')}</span>
              <ArrowIcon className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        {/* Smart PLASTICO Assistant Interactive Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 bg-[#071A33] text-white rounded-3xl p-6 sm:p-8 border border-[#1E3A5F] space-y-5">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1769E8]/25 text-[#27BED6] text-xs font-extrabold">
                <ShieldCheck className="w-4 h-4 text-[#FF8A2A]" />
                <span>{t('نظام توثيق الحسابات والمصانع والموردين', 'Verified Industrial Accounts System')}</span>
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {t(
                  'ثقة صناعية حقيقية وشفافية كاملة في التعاملات',
                  'Real Industrial Trust & Complete Transparency'
                )}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {t(
                  'تمنح منصة PLASTICO شارة التوثيق الرسمية فقط للمصانع والموردين والشركات التي ترفع مستنداتها الرسمية ويتم مراجعتها من الإدارة، مع تمييز واضح لأي بيانات تجريبية (Demo).',
                  'PLASTICO grants the official Verified badge strictly to factories, suppliers, and companies whose official documents pass admin review, while clearly marking sample Demo profiles.'
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-white/8 border border-white/10 space-y-1">
                <div className="font-extrabold text-[#27BED6]">
                  {t('10 عملات محلية ودولية مدعومة', '10 Regional & Global Currencies')}
                </div>
                <p className="text-slate-300 text-[11px]">
                  EGP • SAR • AED • QAR • KWD • BHD • OMR • USD • GBP • EUR
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/8 border border-white/10 space-y-1">
                <div className="font-extrabold text-[#FF8A2A]">
                  {t('مركز المساعدة وتوثيق الحسابات', 'Help Center & Account Verification')}
                </div>
                <p className="text-slate-300 text-[11px]">
                  {t(
                    'ارفع طلب التوثيق أو تواصل مع فريق الدعم الفني في أي وقت.',
                    'Submit verification requests or contact technical support anytime.'
                  )}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                to="/app/help"
                className="px-5 py-2.5 rounded-xl bg-[#1769E8] hover:bg-[#1258C7] text-white text-xs font-extrabold inline-flex items-center gap-2"
              >
                <HelpCircle className="w-4 h-4" />
                <span>{t('مركز المساعدة وتوثيق الحساب', 'Help & Verification Center')}</span>
              </Link>
              <Link
                to="/app/companies"
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-extrabold inline-flex items-center gap-2"
              >
                <Building2 className="w-4 h-4 text-[#27BED6]" />
                <span>{t('تصفح دليل المصانع والشركات', 'Browse Factories & Companies')}</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-3">
            <div>
              <span className="text-xs font-extrabold text-[#FF8A2A]">
                {t('توجيه فوري ذكي', 'Instant Guided Navigation')}
              </span>
              <h2 className="text-xl font-extrabold text-[#13243B] mt-0.5">
                {t('تحدث مع مساعد بلاستيكو', 'Talk to PLASTICO Assistant')}
              </h2>
            </div>
            <SmartPlasticoAssistant mode="embedded" />
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-[#071A33] text-white border-t border-white/10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <PlasticoLogo variant="horizontal" theme="dark" size="sm" showTagline />
          <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-300">
            <Link to="/app/companies" className="hover:text-white">
              {t('دليل المصانع والشركات', 'Factories & Companies')}
            </Link>
            <Link to="/app/suppliers" className="hover:text-white">
              {t('دليل الموردين', 'Suppliers')}
            </Link>
            <Link to="/app/market" className="hover:text-white">
              {t('السوق الصناعي', 'Marketplace')}
            </Link>
            <Link to="/app/jobs" className="hover:text-white">
              {t('الوظائف', 'Jobs')}
            </Link>
            <Link to="/app/faults" className="hover:text-white">
              {t('الأعطال والمجتمع', 'Faults & Community')}
            </Link>
            <Link to="/app/training" className="hover:text-white">
              {t('الأكاديمية', 'Academy')}
            </Link>
            <Link to="/app/help" className="hover:text-white">
              {t('المساعدة والتوثيق', 'Help & Verification')}
            </Link>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-[#27BED6]" />
            <span>PLASTICO — بلاستيكو</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

