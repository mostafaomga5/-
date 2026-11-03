import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Wrench,
  Briefcase,
  Store,
  Building2,
  FileText,
  Camera,
  GraduationCap,
  Newspaper,
  Bell,
  MessageSquare,
  Bookmark,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Globe,
  CheckCircle2,
  Search,
  Truck,
  UserCheck,
  LogIn,
  UserPlus,
  LayoutDashboard,
  Sparkles,
  ShieldCheck,
  HelpCircle,
  BarChart3,
  Users,
  Bot,
} from 'lucide-react';
import { usePlastico } from '../context/PlasticoContext';
import { GlobalSearchModal } from '../components/GlobalSearchModal';
import { PlasticoLogo } from '../components/PlasticoLogo';
import { VerifiedFactoryBadge } from '../components/VerifiedFactoryBadge';
import { SmartPlasticoAssistant } from '../components/SmartPlasticoAssistant';
import { VisitorReadOnlyBanner } from '../components/SplashAndVisitorGate';
import {
  OnboardingWelcomeModal,
  openPlasticoOnboardingTour,
} from '../components/OnboardingWelcomeModal';
import { ThemeAndCurrencyControls } from '../components/ThemeAndCurrencyControls';
import { PWAInstallButton, OfflineIndicator } from '../components/PWAInstallButton';

export const AppLayout: React.FC = () => {
  const {
    lang,
    setLang,
    t,
    isAuthenticated,
    realUser,
    currentUser,
    logoutRealSession,
    notifications,
    savedIds,
    unreadChatCount,
    toastMessage,
    setIsSearchOpen,
  } = usePlastico();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const ChevronIcon = lang === 'ar' ? ChevronLeft : ChevronRight;

  const topNavItems = [
    { to: '/app/home', labelAr: 'الرئيسية', labelEn: 'Home', exact: true },
    { to: '/app/market', labelAr: 'السوق', labelEn: 'Marketplace' },
    { to: '/app/faults', labelAr: 'المجتمع والأعطال', labelEn: 'Community & Faults' },
    { to: '/app/news', labelAr: 'الأخبار والتحليلات', labelEn: 'Industry News' },
    { to: '/app/materials', labelAr: 'أسعار الخامات', labelEn: 'Materials Intelligence' },
    { to: '/app/suppliers', labelAr: 'الموردون والمصانع', labelEn: 'Directory' },
    { to: '/app/jobs', labelAr: 'الوظائف', labelEn: 'Jobs' },
    { to: '/app/training', labelAr: 'الأكاديمية', labelEn: 'Academy' },
  ];

  const primaryMenuItems = [
    { to: '/app/home', icon: Home, labelAr: 'الرئيسية والمجتمع الصناعي', labelEn: 'Home & Social Feed' },
    { to: '/app/faults', icon: Wrench, labelAr: 'مجتمع الأعطال والحلول الفنية', labelEn: 'Faults & Troubleshooting' },
    { to: '/app/news', icon: Newspaper, labelAr: 'أخبار صناعة البلاستيك والتحليلات', labelEn: 'Industry News & Editorial' },
    { to: '/app/experts', icon: Users, labelAr: 'خبراء وصنّاع محتوى الصناعة', labelEn: 'Experts & Creators' },
    { to: '/app/materials', icon: BarChart3, labelAr: 'أسعار الخامات وتحليلات السوق', labelEn: 'Materials Intelligence' },
    { to: '/app/market', icon: Store, labelAr: 'السوق الصناعي والماكينات والخامات', labelEn: 'Industrial Marketplace' },
    { to: '/app/jobs', icon: Briefcase, labelAr: 'الوظائف والملفات المهنية', labelEn: 'Jobs & Careers' },
    { to: '/app/jobs/applications', icon: FileText, labelAr: 'طلبات التوظيف والمتقدمون', labelEn: 'Job Applications' },
    { to: '/app/companies', icon: Building2, labelAr: 'دليل المصانع والشركات والخبراء', labelEn: 'Factories & Companies' },
    { to: '/app/suppliers', icon: Truck, labelAr: 'دليل الموردين ومراكز الصيانة', labelEn: 'Suppliers Directory' },
    { to: '/app/training', icon: GraduationCap, labelAr: 'أكاديمية بلاستيكو للتدريب', labelEn: 'PLASTICO Academy' },
    { to: '/app/manufacturing', icon: FileText, labelAr: 'خدمات التصنيع وطلبات RFQ', labelEn: 'Manufacturing Services (RFQ)' },
    { to: '/app/expo', icon: Building2, labelAr: 'المعارض الافتراضية للمصانع', labelEn: 'Virtual Exhibitions' },
    { to: '/app/visual-search', icon: Camera, labelAr: 'البحث الذكي بالصورة', labelEn: 'Visual Search' },
    { to: '/app/ai', icon: Bot, labelAr: 'مساعد PLASTICO AI المتخصص', labelEn: 'PLASTICO AI Assistant' },
  ];

  const secondaryMenuItems = [
    {
      to: '/app/profile',
      icon: UserCheck,
      labelAr: 'ملفي المهني / الصناعي',
      labelEn: 'My Profile',
    },
    {
      to: '/app/help',
      icon: HelpCircle,
      labelAr: 'المساعدة وتوثيق الحساب',
      labelEn: 'Help & Verification',
    },
    {
      to: '/app/saved',
      icon: Bookmark,
      labelAr: 'المفضلة والعناصر المحفوظة',
      labelEn: 'Favorites & Saved Items',
      badgeCount: savedIds.length,
    },
    {
      to: '/app/messages',
      icon: MessageSquare,
      labelAr: 'المراسلات والدردشة المباشرة',
      labelEn: 'Direct Messages',
      badgeCount: unreadChatCount,
    },
    {
      to: '/app/notifications',
      icon: Bell,
      labelAr: 'الإشعارات',
      labelEn: 'Notifications',
      badgeCount: unreadCount,
    },
    { to: '/app/settings', icon: Settings, labelAr: 'إعدادات الحساب', labelEn: 'Account Settings' },
    { to: '/app/admin', icon: ShieldCheck, labelAr: 'لوحة تحكم الإدارة', labelEn: 'Admin Console' },
  ];

  const roleBadgeLabel = (role?: string) => {
    switch (role) {
      case 'technician':
        return t('فني تشغيل وصيانة', 'Technician');
      case 'engineer':
        return t('مهندس صناعي', 'Industrial Engineer');
      case 'factory':
        return t('حساب مصنع', 'Factory Account');
      case 'supplier':
        return t('مورد خامات ومعدات', 'Supplier Account');
      case 'trader':
        return t('تاجر معدات مستعملة', 'Equipment Trader');
      case 'visitor':
        return t('زائر (تصفح فقط)', 'Visitor (View Only)');
      default:
        return t('عضو بلاستيكو', 'PLASTICO Member');
    }
  };

  const renderDrawerContent = (closeOnClick = false) => (
    <div className="flex flex-col h-full bg-white text-[#13243B] select-none overflow-y-auto">
      {/* Deep Navy Brand Header */}
      <div className="relative bg-[#071A33] pt-6 pb-8 px-5 text-white border-b border-white/10">
        {closeOnClick && (
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="absolute top-4 end-4 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
            aria-label={t('إغلاق القائمة', 'Close menu')}
          >
            <X className="w-5 h-5" />
          </button>
        )}
        <Link
          to="/"
          onClick={() => closeOnClick && setDrawerOpen(false)}
          className="inline-block"
        >
          <PlasticoLogo theme="dark" size="sm" showTagline />
        </Link>

        {/* Authenticated User or Guest Card */}
        <div className="mt-5 p-3.5 rounded-xl bg-white/8 border border-white/12">
          {isAuthenticated && realUser ? (
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-extrabold text-white truncate">
                  {realUser.name}
                </span>
                {realUser.verified && <VerifiedFactoryBadge variant="compact" />}
              </div>
              <p className="text-xs text-[#27BED6] font-bold mt-0.5">
                {roleBadgeLabel(realUser.accountType)}
              </p>
              <p className="text-[11px] text-slate-300 truncate mt-0.5">
                {realUser.email} · {realUser.city}، {realUser.country}
              </p>
              <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-white/10">
                <Link
                  to="/app/profile"
                  onClick={() => closeOnClick && setDrawerOpen(false)}
                  className="flex-1 text-center py-1.5 px-2.5 rounded-lg bg-[#1769E8] hover:bg-[#1258C7] text-white text-xs font-bold transition-colors"
                >
                  {t('الملف الشخصي', 'My Profile')}
                </Link>
                <Link
                  to="/app/home"
                  onClick={() => closeOnClick && setDrawerOpen(false)}
                  className="flex-1 text-center py-1.5 px-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors"
                >
                  {t('لوحة التحكم', 'Dashboard')}
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-xs font-bold text-slate-200">
                {t(
                  'سجل دخولك لحفظ طلباتك وإدارة حسابك الصناعي وإصدار شهادات الأكاديمية.',
                  'Sign in to save RFQs, manage your industrial account, and earn Academy certificates.'
                )}
              </p>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <Link
                  to="/auth/login"
                  onClick={() => closeOnClick && setDrawerOpen(false)}
                  className="py-2 px-3 rounded-lg bg-[#1769E8] hover:bg-[#1258C7] text-white text-xs font-extrabold text-center transition-colors"
                >
                  {t('تسجيل الدخول', 'Sign In')}
                </Link>
                <Link
                  to="/auth/register"
                  onClick={() => closeOnClick && setDrawerOpen(false)}
                  className="py-2 px-3 rounded-lg bg-[#FF8A2A] hover:bg-[#F07B1A] text-white text-xs font-extrabold text-center transition-colors"
                >
                  {t('إنشاء حساب', 'Register')}
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Quick Controls (Currency, Theme, PWA & Language) inside Drawer */}
        <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
          <ThemeAndCurrencyControls compact />
          <div className="flex items-center gap-1.5">
            <PWAInstallButton variant="compact" />
            <button
              type="button"
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-extrabold cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-[#27BED6]" />
              <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="px-3 py-4 space-y-1 flex-1">
        {primaryMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => closeOnClick && setDrawerOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-[#1769E8]/10 text-[#1769E8]'
                    : 'text-[#13243B] hover:bg-[#F4F7FC]'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{t(item.labelAr, item.labelEn)}</span>
              </div>
              <ChevronIcon className="w-4 h-4 text-[#718096]" />
            </NavLink>
          );
        })}

        <div className="my-3 border-t border-[#DFE7F1]" />

        <button
          type="button"
          onClick={() => {
            if (closeOnClick) setDrawerOpen(false);
            openPlasticoOnboardingTour();
          }}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold bg-[#FF8A2A]/10 text-[#071A33] hover:bg-[#FF8A2A]/20 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-[#FF8A2A] shrink-0" />
            <span>{t('التعريف بالمنصة (جولة تفاعلية)', 'Platform Interactive Tour')}</span>
          </div>
          <ChevronIcon className="w-4 h-4 text-[#718096]" />
        </button>

        {secondaryMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => closeOnClick && setDrawerOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-[#1769E8]/10 text-[#1769E8]'
                    : 'text-[#13243B] hover:bg-[#F4F7FC]'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{t(item.labelAr, item.labelEn)}</span>
                {item.badgeCount ? (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#FF8A2A] text-white">
                    {item.badgeCount}
                  </span>
                ) : null}
              </div>
              <ChevronIcon className="w-4 h-4 text-[#718096]" />
            </NavLink>
          );
        })}
      </nav>

      {/* Logout Button when Authenticated */}
      {isAuthenticated && (
        <div className="p-4 pt-2 border-t border-[#DFE7F1]">
          <button
            type="button"
            onClick={async () => {
              setDrawerOpen(false);
              await logoutRealSession();
              navigate('/auth/login');
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('تسجيل الخروج', 'Sign Out')}</span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F4F7FC] text-[#13243B] flex flex-col overflow-x-hidden">
      <GlobalSearchModal />
      <OnboardingWelcomeModal />

      {/* Toast Feedback Banner */}
      {toastMessage && (
        <div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl bg-[#071A33] text-white text-xs sm:text-sm font-bold shadow-xl flex items-center gap-2 border border-[#27BED6]/30">
          <CheckCircle2 className="w-4 h-4 text-[#FF8A2A] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Slide-out Navigation Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-[#071A33]/60 backdrop-blur-xs"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="relative z-10 w-80 max-w-[86vw] h-full shadow-2xl">
            {renderDrawerContent(true)}
          </div>
        </div>
      )}

      {/* Top Primary Navigation Bar */}
      <OfflineIndicator />
      <VisitorReadOnlyBanner />
      <header className="sticky top-0 z-30 bg-[#071A33] text-white border-b border-white/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 h-16 flex items-center justify-between gap-1.5 sm:gap-2">
          {/* Start in RTL: Menu button + Complete Unclipped PLASTICO Logo */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 min-w-0">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label={t('فتح القائمة الجانبية', 'Open navigation drawer')}
              className="p-2 rounded-xl bg-white/8 hover:bg-white/15 text-white transition-colors shrink-0 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link
              to="/"
              data-testid="header-plastico-logo"
              className="flex items-center shrink-0 overflow-visible"
            >
              <PlasticoLogo variant="horizontal" theme="dark" size="sm" />
            </Link>
          </div>

          {/* Center: 7 Desktop Primary Navigation Links */}
          <nav
            aria-label={t('التنقل الرئيسي', 'Main Navigation')}
            className="hidden xl:flex items-center gap-1 shrink-0"
          >
            {topNavItems.map((item) => {
              const isActive = item.exact
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`px-3 py-2 rounded-lg text-xs font-extrabold whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-[#1769E8] text-white'
                      : 'text-slate-200 hover:text-white hover:bg-white/8'
                  }`}
                >
                  {t(item.labelAr, item.labelEn)}
                </Link>
              );
            })}
          </nav>

          {/* End in RTL: Balanced Mobile & Desktop Action Icons */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Desktop-only Currency/Theme & Tour controls (available in drawer on mobile) */}
            <div className="hidden md:flex items-center gap-1.5">
              <ThemeAndCurrencyControls compact />
            </div>

            <button
              type="button"
              onClick={openPlasticoOnboardingTour}
              data-testid="open-onboarding-btn"
              title={t('التعريف بالمنصة', 'Platform Tour')}
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-extrabold text-[#27BED6] whitespace-nowrap transition-colors cursor-pointer shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FF8A2A] shrink-0" />
              <span className="hidden md:inline">{t('التعريف بالمنصة', 'Tour')}</span>
            </button>

            {/* 1. Search Icon */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              aria-label={t('بحث شامل', 'Universal Search')}
              className="inline-flex items-center gap-1.5 p-2 sm:px-2.5 sm:py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-bold text-slate-200 whitespace-nowrap transition-colors cursor-pointer shrink-0"
            >
              <Search className="w-4 h-4 text-[#27BED6] shrink-0" />
              <span className="hidden md:inline">{t('بحث...', 'Search...')}</span>
            </button>

            {/* 2. Notifications Bell Icon */}
            <Link
              to="/app/notifications"
              data-testid="header-notifications-link"
              title={t('الإشعارات', 'Notifications')}
              aria-label={t('الإشعارات', 'Notifications')}
              className="relative p-2 rounded-lg bg-white/10 hover:bg-white/15 text-white transition-colors shrink-0"
            >
              <Bell className="w-4 h-4 text-[#FF8A2A]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -end-1 min-w-[16px] h-4 px-1 rounded-full bg-[#FF8A2A] text-white text-[10px] font-black flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>

            {/* 3. Messages Icon */}
            <Link
              to="/app/messages"
              data-testid="header-messages-link"
              title={t('المراسلات والدردشة المباشرة', 'Messages')}
              aria-label={t('المراسلات والدردشة المباشرة', 'Messages')}
              className="relative p-2 rounded-lg bg-white/10 hover:bg-white/15 text-white transition-colors shrink-0"
            >
              <MessageSquare className="w-4 h-4 text-[#27BED6]" />
              {unreadChatCount > 0 && (
                <span className="absolute -top-1 -end-1 min-w-[16px] h-4 px-1 rounded-full bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center">
                  {unreadChatCount}
                </span>
              )}
            </Link>

            <Link
              to="/app/saved"
              title={t('المفضلة والعناصر المحفوظة', 'Favorites')}
              className="hidden sm:inline-flex relative p-2 rounded-lg bg-white/10 hover:bg-white/15 text-white transition-colors shrink-0"
            >
              <Bookmark className="w-4 h-4 text-[#FF8A2A]" />
              {savedIds.length > 0 && (
                <span className="absolute -top-1 -end-1 min-w-[16px] h-4 px-1 rounded-full bg-[#FF8A2A] text-white text-[10px] font-black flex items-center justify-center">
                  {savedIds.length}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="hidden sm:inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-extrabold whitespace-nowrap transition-colors cursor-pointer shrink-0"
            >
              <Globe className="w-3.5 h-3.5 text-[#27BED6] shrink-0" />
              <span>{lang === 'ar' ? 'EN' : 'عربي'}</span>
            </button>

            {/* 4. My Account / Sign In */}
            {isAuthenticated && realUser ? (
              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <Link
                  to="/app/home"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1769E8] hover:bg-[#1258C7] text-white text-xs font-extrabold whitespace-nowrap transition-colors"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
                  <span>{t('لوحة التحكم', 'Dashboard')}</span>
                </Link>
                <Link
                  to="/app/profile"
                  data-testid="header-profile-link"
                  className="inline-flex items-center gap-1.5 p-1 sm:px-2 sm:py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white whitespace-nowrap transition-colors"
                >
                  <img
                    src={currentUser.avatar}
                    alt={realUser.name}
                    className="w-7 h-7 sm:w-6 sm:h-6 rounded-full object-cover border border-[#27BED6]/60 shrink-0"
                  />
                  <span className="hidden sm:inline max-w-[100px] truncate">
                    {realUser.name}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    await logoutRealSession();
                    navigate('/auth/login');
                  }}
                  title={t('تسجيل الخروج', 'Sign Out')}
                  className="hidden sm:inline-flex p-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 transition-colors cursor-pointer shrink-0"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 shrink-0">
                <Link
                  to="/auth/login"
                  className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#1769E8] hover:bg-[#1258C7] text-white text-xs font-extrabold whitespace-nowrap transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5 shrink-0" />
                  <span>{t('دخول', 'Sign In')}</span>
                </Link>
                <Link
                  to="/auth/register"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF8A2A] hover:bg-[#F07B1A] text-white text-xs font-extrabold whitespace-nowrap transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5 shrink-0" />
                  <span>{t('حساب جديد', 'Create Account')}</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto pb-20 lg:pb-12">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-72 shrink-0 border-e border-[#DFE7F1] bg-white min-h-[calc(100vh-4rem)]">
          {renderDrawerContent(false)}
        </aside>

        {/* Page Body */}
        <main className="flex-1 min-w-0 px-3.5 sm:px-6 lg:px-8 py-5 sm:py-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar — 5 Primary Tabs matching Reference UI */}
      <nav
        data-testid="mobile-bottom-nav"
        aria-label={t('شريط التنقل السفلي', 'Bottom Navigation')}
        className="fixed bottom-0 inset-x-0 z-30 lg:hidden bg-white/95 backdrop-blur-md border-t border-[#DFE7F1] min-h-16 pb-[env(safe-area-inset-bottom)] px-1 flex items-center justify-around shadow-[0_-4px_20px_rgba(7,26,51,0.06)]"
      >
        {[
          { to: '/app/home', icon: Home, labelAr: 'الرئيسية', labelEn: 'Home', exact: true },
          { to: '/app/market', icon: Store, labelAr: 'السوق', labelEn: 'Market' },
          { to: '/app/faults', icon: Users, labelAr: 'المجتمع', labelEn: 'Community' },
          {
            to: '/app/messages',
            icon: MessageSquare,
            labelAr: 'الرسائل',
            labelEn: 'Messages',
            badge: unreadChatCount,
          },
          { to: '/app/profile', icon: UserCheck, labelAr: 'حسابي', labelEn: 'My Account' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.exact
            ? location.pathname === tab.to
            : location.pathname.startsWith(tab.to);
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={`relative min-h-[44px] min-w-[54px] flex flex-col items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-[11px] font-extrabold transition-colors ${
                isActive ? 'text-[#1769E8]' : 'text-[#718096] hover:text-[#13243B]'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {tab.badge ? (
                  <span className="absolute -top-1.5 -end-2 min-w-[16px] h-4 px-1 rounded-full bg-[#FF8A2A] text-white text-[9px] font-black flex items-center justify-center">
                    {tab.badge}
                  </span>
                ) : null}
              </div>
              <span>{t(tab.labelAr, tab.labelEn)}</span>
            </NavLink>
          );
        })}
      </nav>

      <SmartPlasticoAssistant mode="floating" />
    </div>
  );
};
