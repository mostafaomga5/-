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
  UserPlus,
  Settings,
  Headphones,
  LogOut,
  Menu,
  X,
  Star,
  Crown,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Globe,
  Sparkles,
} from 'lucide-react';
import { usePlastico } from '../context/PlasticoContext';
import { GlobalSearchModal } from '../components/GlobalSearchModal';
import { PlasticoLogo } from '../components/PlasticoLogo';
import { VerifiedFactoryBadge } from '../components/VerifiedFactoryBadge';
import { UserRole } from '../types/plastico';

export const AppLayout: React.FC = () => {
  const {
    lang,
    setLang,
    t,
    currentUser,
    switchPersona,
    notifications,
    toastMessage,
    showToast,
  } = usePlastico();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const unreadCount = Math.max(notifications.filter((n) => !n.isRead).length, 3);
  const ChevronIcon = lang === 'ar' ? ChevronLeft : ChevronRight;

  const primaryMenuItems = [
    { to: '/app/home', icon: Home, labelAr: 'الرئيسية', labelEn: 'Home' },
    { to: '/app/faults', icon: Wrench, labelAr: 'الأعطال', labelEn: 'Faults' },
    { to: '/app/jobs', icon: Briefcase, labelAr: 'التوظيف', labelEn: 'Jobs' },
    { to: '/app/market', icon: Store, labelAr: 'السوق المستعمل', labelEn: 'Used Market' },
    { to: '/app/expo', icon: Building2, labelAr: 'المعرض الافتراضي', labelEn: 'Virtual Expo' },
    { to: '/app/manufacturing', icon: FileText, labelAr: 'طلبات التصنيع (RFQ)', labelEn: 'Manufacturing (RFQ)' },
    {
      to: '/app/visual-search',
      icon: Camera,
      labelAr: 'البحث بالصورة',
      labelEn: 'Visual Search',
      badgeNew: true,
    },
    {
      to: '/app/training',
      icon: GraduationCap,
      labelAr: 'التدريب والشهادات',
      labelEn: 'Training & Certs',
    },
    { to: '/app/news', icon: Newspaper, labelAr: 'الأخبار الصناعية', labelEn: 'Industrial News' },
  ];

  const secondaryMenuItems = [
    {
      to: '/app/notifications',
      icon: Bell,
      labelAr: 'الإشعارات',
      labelEn: 'Notifications',
      badgeCount: unreadCount,
    },
    {
      to: '/app/messages',
      icon: MessageSquare,
      labelAr: 'رسائلي',
      labelEn: 'My Messages',
    },
    {
      to: '/app/saved',
      icon: Bookmark,
      labelAr: 'حفظت لاحقاً',
      labelEn: 'Saved Items',
    },
    {
      to: '#invite',
      icon: UserPlus,
      labelAr: 'دعوة الأصدقاء',
      labelEn: 'Invite Friends',
      onClick: () => {
        showToast(
          'تم نسخ رابط الدعوة لمجتمع بلاستيكو الصناعي بنجاح!',
          'Invitation link copied to clipboard!'
        );
        setDrawerOpen(false);
      },
    },
    { to: '/app/settings', icon: Settings, labelAr: 'الإعدادات', labelEn: 'Settings' },
    { to: '/contact', icon: Headphones, labelAr: 'المساعدة والدعم', labelEn: 'Help & Support' },
  ];

  const renderDrawerContent = (closeOnClick = false) => (
    <div className="flex flex-col h-full bg-[#F8FAFC] text-[#0B2A5B] select-none overflow-y-auto">
      {/* Top Deep Navy Header matching Image 2 right screen */}
      <div className="relative bg-gradient-to-b from-[#071D42] via-[#0B2A5B] to-[#123E82] pt-6 pb-12 px-5 text-white">
        {closeOnClick && (
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="absolute top-4 left-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white"
            aria-label={t('إغلاق القائمة', 'Close menu')}
          >
            <X className="w-5 h-5" />
          </button>
        )}
        <div className="flex flex-col items-center text-center">
          <PlasticoLogo theme="dark" size="sm" />
          <p className="text-xs font-medium text-blue-100 mt-2">
            {t('معاً نصنع مستقبل صناعتنا', 'Together we build the future of our industry')}
          </p>
        </div>
      </div>

      {/* Overlapping White User Profile Card matching Image 2 */}
      <div className="relative z-10 px-4 -mt-7">
        <div className="bg-white rounded-2xl p-4 shadow-md border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <img
                src="/images/plastico/team/engineer-avatar.svg"
                alt={currentUser.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-blue-100"
              />
              <span className="absolute -bottom-0.5 -left-0.5 w-5 h-5 rounded-full bg-[#0B2A5B] text-white flex items-center justify-center shadow">
                <Camera className="w-3 h-3" />
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-extrabold text-[#0B2A5B] truncate">
                {currentUser.role === 'engineer' ? t('أحمد محمد علي', 'Ahmed Mohamed Ali') : currentUser.name}
              </h3>
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#78350F] to-[#B45309] text-amber-100 text-[11px] font-bold">
                  <Crown className="w-3 h-3 text-amber-300 fill-amber-300" />
                  <span>{t('محترف', 'Pro')}</span>
                </div>
                <VerifiedFactoryBadge variant="compact" />
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">
                {currentUser.role === 'engineer'
                  ? t('مهندس ميكانيكا', 'Mechanical Engineer')
                  : currentUser.title}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-xs">
            <Link
              to="/app/profile"
              onClick={() => closeOnClick && setDrawerOpen(false)}
              className="text-[#0B2A5B] hover:text-[#1D6BF3] font-bold flex items-center gap-1"
            >
              <span>{t('تعديل الملف الشخصي', 'Edit Profile')}</span>
              <ChevronIcon className="w-3.5 h-3.5" />
            </Link>
            <div className="flex items-center gap-1 font-extrabold text-[#0B2A5B]">
              <span>4.8</span>
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            </div>
          </div>

          {/* Quick Role Switcher for Demo Testing */}
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
            <span className="text-[11px] text-slate-400 font-semibold">
              {t('معاينة كـ:', 'View as:')}
            </span>
            <select
              aria-label={t('تبديل نوع الحساب', 'Switch role')}
              value={currentUser.role}
              onChange={(e) => switchPersona(e.target.value as UserRole)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-bold text-[#0B2A5B] focus:outline-none focus:border-[#1D6BF3]"
            >
              <option value="engineer">{t('مهندس (أحمد محمد)', 'Engineer')}</option>
              <option value="technician">{t('فني تشغيل وصيانة', 'Technician')}</option>
              <option value="factory">{t('صاحب مصنع', 'Factory Owner')}</option>
              <option value="supplier">{t('مورد خامات ومعدات', 'Supplier')}</option>
              <option value="trader">{t('تاجر / سوق مستعمل', 'Trader')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Primary Navigation List */}
      <nav className="px-3 py-3 space-y-1 flex-1">
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
                    ? 'bg-[#DCEBFF] text-[#1D6BF3] shadow-2xs'
                    : 'text-[#0B2A5B] hover:bg-slate-100'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{t(item.labelAr, item.labelEn)}</span>
                {item.badgeNew && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#EF4444] text-white">
                    {t('جديد', 'NEW')}
                  </span>
                )}
              </div>
              <ChevronIcon className="w-4 h-4 text-slate-400" />
            </NavLink>
          );
        })}

        <div className="my-2 border-t border-slate-200/80" />

        {secondaryMenuItems.map((item) => {
          const Icon = item.icon;
          if (item.onClick) {
            return (
              <button
                key={item.labelAr}
                type="button"
                onClick={item.onClick}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-[#0B2A5B] hover:bg-slate-100 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{t(item.labelAr, item.labelEn)}</span>
                </div>
                <ChevronIcon className="w-4 h-4 text-slate-400" />
              </button>
            );
          }
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => closeOnClick && setDrawerOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-[#DCEBFF] text-[#1D6BF3]'
                    : 'text-[#0B2A5B] hover:bg-slate-100'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{t(item.labelAr, item.labelEn)}</span>
                {item.badgeCount ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#EF4444] text-white">
                    {item.badgeCount}
                  </span>
                ) : null}
              </div>
              <ChevronIcon className="w-4 h-4 text-slate-400" />
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Soft Red Logout Button matching Image 2 */}
      <div className="p-4 pt-2">
        <button
          type="button"
          onClick={() => {
            setDrawerOpen(false);
            navigate('/');
          }}
          className="w-full py-3 px-4 rounded-2xl bg-[#FDECEB] hover:bg-[#fbd8d6] text-[#E11D48] font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>{t('تسجيل الخروج', 'Sign Out')}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-[#0F172A] flex flex-col lg:flex-row">
      <GlobalSearchModal />

      {/* Toast Feedback Banner */}
      {toastMessage && (
        <div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-[#0B2A5B] text-white text-xs sm:text-sm font-bold shadow-xl flex items-center gap-2 border border-blue-400/30">
          <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Desktop Persistent Sidebar (matches the exact Drawer from Image 2) */}
      <aside className="hidden lg:block w-80 shrink-0 border-e border-slate-200/80 bg-[#F8FAFC] sticky top-0 h-screen overflow-y-auto shadow-xs">
        {renderDrawerContent(false)}
      </aside>

      {/* Slide-out Mobile/Tablet Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-[#0B2A5B]/50 backdrop-blur-xs"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="relative z-10 w-80 max-w-[86vw] h-full shadow-2xl">
            {renderDrawerContent(true)}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-10">
        {/* Top White App Bar matching Image 2 & Image 5 */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 h-16 px-4 sm:px-6 flex items-center justify-between gap-3 shadow-2xs">
          {/* Right side in RTL: Hamburger Menu + Quick Onboarding Showcase Link */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label={t('فتح القائمة الجانبية', 'Open side menu')}
              className="p-2 rounded-xl text-[#0B2A5B] hover:bg-slate-100 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link
              to="/?welcome=1"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-[#1D6BF3] text-xs font-bold transition-colors"
            >
              <span>{t('شاشة البداية والتسجيل', 'Splash & Onboarding')}</span>
            </Link>
          </div>

          {/* Center: PLASTICO Logo Lockup */}
          <Link to="/app/home" className="flex items-center">
            <PlasticoLogo variant="horizontal" size="sm" />
          </Link>

          {/* Left side in RTL: Language + Notifications Bell + User Avatar */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-[#0B2A5B] text-xs font-extrabold transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-[#1D6BF3]" />
              <span>{lang === 'ar' ? 'EN' : 'عربي'}</span>
            </button>

            <Link
              to="/app/notifications"
              aria-label={t('الإشعارات', 'Notifications')}
              className="relative p-2 rounded-full text-[#0B2A5B] hover:bg-slate-100 transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#EF4444] text-white text-[10px] font-extrabold flex items-center justify-center shadow-xs">
                {unreadCount}
              </span>
            </Link>

            <Link
              to="/app/profile"
              className="shrink-0 rounded-full ring-2 ring-blue-100 hover:ring-[#1D6BF3] transition-all"
            >
              <img
                src="/images/plastico/team/engineer-avatar.svg"
                alt={currentUser.name}
                className="w-9 h-9 rounded-full object-cover"
              />
            </Link>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-5">
          <Outlet />
        </main>
      </div>

      {/* Bottom 5-Tab Navigation Bar matching Image 2, Image 4 & Image 5 */}
      <nav
        aria-label={t('شريط التنقل السفلي', 'Bottom Navigation')}
        className="fixed bottom-0 inset-x-0 z-30 lg:hidden bg-white border-t border-slate-200/90 h-16 px-2 flex items-center justify-around shadow-[0_-4px_20px_rgba(11,42,91,0.06)]"
      >
        {[
          { to: '/app/home', icon: Home, labelAr: 'الرئيسية', labelEn: 'Home' },
          { to: '/app/faults', icon: Wrench, labelAr: 'الأعطال', labelEn: 'Faults' },
          { to: '/app/jobs', icon: Briefcase, labelAr: 'التوظيف', labelEn: 'Jobs' },
          { to: '/app/market', icon: Store, labelAr: 'السوق', labelEn: 'Market' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive =
            location.pathname === tab.to ||
            (tab.to !== '/app/home' && location.pathname.startsWith(tab.to));
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl text-[11px] font-extrabold transition-colors ${
                isActive ? 'text-[#1D6BF3]' : 'text-slate-500 hover:text-[#0B2A5B]'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span>{t(tab.labelAr, tab.labelEn)}</span>
            </NavLink>
          );
        })}

        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl text-[11px] font-extrabold text-slate-500 hover:text-[#0B2A5B]"
        >
          <LayoutGrid className="w-5 h-5" />
          <span>{t('المزيد', 'More')}</span>
        </button>
      </nav>
    </div>
  );
};
