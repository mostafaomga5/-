import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Camera,
  Crown,
  CheckCircle2,
  MapPin,
  Star,
  User,
  MessageCircle,
  MessageSquare,
  Award,
  FileCheck,
  Trophy,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Wrench,
  Briefcase,
  ShoppingCart,
  Bell,
  Settings as SettingsIcon,
  RotateCcw,
  Bookmark,
  Send,
} from 'lucide-react';
import { usePlastico } from '../context/PlasticoContext';
import { UserRole } from '../types/plastico';
import { VerifiedFactoryBadge } from '../components/VerifiedFactoryBadge';
import { isVerifiedUserProfile } from '../lib/domainRules';

/* ============================================================================
   Screen 06: Professional Profile (/app/profile & /app/profile/edit)
   Matches Image 4 (right phone) & Image 6 (Screen 6)
   ============================================================================ */
export const ProfilePage: React.FC = () => {
  const { lang, t, currentUser, showToast } = usePlastico();
  const navigate = useNavigate();
  const ArrowIcon = lang === 'ar' ? ArrowLeft : ArrowRight;
  const ChevronIcon = lang === 'ar' ? ChevronLeft : ChevronRight;
  const isVerified = isVerifiedUserProfile(currentUser);

  return (
    <div className="space-y-4">
      {/* Top Celebration Header matching Image 4 Right Phone */}
      <div className="text-center space-y-1 py-1">
        <div className="flex items-center justify-between mb-1">
          <Link
            to="/onboarding/setup"
            className="px-3.5 py-1.5 rounded-full bg-slate-200/80 hover:bg-slate-300 text-[#0B2A5B] text-xs font-extrabold transition-colors"
          >
            {t('تعديل لاحقاً / تعديل الملف', 'Edit Profile')}
          </Link>
          <span className="text-xs font-extrabold text-[#1D6BF3]">
            {t('ملفي الشخصي', 'My Profile')}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B2A5B]">
          {t('تم إنشاء ملفك بنجاح!', 'Your Profile is Ready!')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          {t('هكذا سيظهر ملفك للآخرين في مجتمع بلاستيكو', 'Here is how your profile appears to others')}
        </p>
      </div>

      {/* Main Profile Card matching Image 4 Right Phone */}
      <div className="bg-white rounded-3xl border border-slate-200/85 p-5 shadow-2xs space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="relative shrink-0">
              <img
                src="/images/plastico/team/engineer-avatar.svg"
                alt={currentUser.name}
                className="w-20 h-20 rounded-full object-cover border-2 border-blue-200 shadow-xs"
              />
              <span className="absolute bottom-0 left-0 w-7 h-7 rounded-full bg-[#0B2A5B] text-white flex items-center justify-center shadow">
                <Camera className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#059669] text-[11px] font-extrabold">
                  ● {t('متصل حالياً', 'Online Now')}
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-gradient-to-r from-[#78350F] to-[#B45309] text-amber-100 text-xs font-extrabold">
                  <Crown className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                  <span>{t('محترف', 'Pro')}</span>
                </span>
                {isVerified && (
                  <VerifiedFactoryBadge
                    size="sm"
                    isoCertified={currentUser.role === 'factory'}
                  />
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <h2 className="text-lg sm:text-xl font-extrabold text-[#0B2A5B]">
                  {currentUser.role === 'engineer'
                    ? t('أحمد محمد علي', 'Ahmed Mohamed Ali')
                    : currentUser.name}
                </h2>
                <CheckCircle2 className="w-4 h-4 text-[#1D6BF3] fill-blue-50 shrink-0" />
              </div>

              <p className="text-xs sm:text-sm font-bold text-slate-600">
                {currentUser.role === 'engineer'
                  ? t('مهندس ميكانيكا', 'Mechanical Engineer')
                  : currentUser.title}
              </p>

              <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                <MapPin className="w-3.5 h-3.5 text-[#1D6BF3]" />
                <span>{t('القاهرة، مصر', 'Cairo, Egypt')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Verified Factory Credibility Banner on User Profile */}
        {isVerified && (
          <VerifiedFactoryBadge
            variant="banner"
            isoCertified
          />
        )}

        {/* 3-Column Stats Strip matching Image 4 Right Phone */}
        <div className="grid grid-cols-3 divide-x divide-x-reverse divide-slate-200 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 py-3 text-center">
          <div className="px-2">
            <div className="text-sm sm:text-base font-extrabold text-[#0B2A5B] font-mono-num">
              &lt; 1 {t('ساعة', 'hr')}
            </div>
            <div className="text-[11px] text-slate-500 font-bold mt-0.5">
              {t('متوسط الاستجابة', 'Avg Response')}
            </div>
          </div>
          <div className="px-2">
            <div className="text-sm sm:text-base font-extrabold text-[#0B2A5B] font-mono-num">
              28
            </div>
            <div className="text-[11px] text-slate-500 font-bold mt-0.5">
              {t('أعطال تم حلها', 'Faults Solved')}
            </div>
          </div>
          <div className="px-2">
            <div className="flex items-center justify-center gap-1 text-sm sm:text-base font-extrabold text-[#0B2A5B] font-mono-num">
              <span>4.8</span>
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            </div>
            <div className="text-[11px] text-slate-500 font-bold mt-0.5">
              {t('التقييم', 'Rating')}
            </div>
          </div>
        </div>

        {/* 3 Action Buttons: عرض كامل | واتساب | تواصل */}
        <div className="grid grid-cols-12 gap-2.5">
          <button
            type="button"
            onClick={() =>
              showToast('أنت تستعرض النسخة الكاملة من ملفك المهني', 'Viewing full profile')
            }
            className="col-span-6 py-3 px-4 rounded-2xl bg-[#0B2A5B] hover:bg-[#133B7A] text-white text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-xs"
          >
            <User className="w-4 h-4" />
            <span>{t('عرض كامل', 'Full Profile')}</span>
          </button>

          <button
            type="button"
            onClick={() =>
              showToast('تم فتح المحادثة عبر واتساب المهني', 'Opening WhatsApp contact')
            }
            className="col-span-3 py-2.5 px-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-[#059669] text-[11px] font-extrabold flex flex-col items-center justify-center gap-0.5"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{t('واتساب', 'WhatsApp')}</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/app/messages')}
            className="col-span-3 py-2.5 px-2 rounded-2xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[#1D6BF3] text-[11px] font-extrabold flex flex-col items-center justify-center gap-0.5"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{t('تواصل', 'Message')}</span>
          </button>
        </div>

        {/* نبذة عني */}
        <div className="pt-2 space-y-1.5">
          <h3 className="text-xs sm:text-sm font-extrabold text-[#0B2A5B]">
            {t('نبذة عني', 'About Me')}
          </h3>
          <p className="p-3.5 rounded-2xl bg-[#F8FAFC] text-xs sm:text-sm text-slate-600 font-medium leading-relaxed border border-slate-100">
            {t(
              'شغفي هو حل المشكلات التقنية والمساهمة في تطوير صناعة البلاستيك في مصر والعالم العربي..',
              'Passionate about solving technical faults and advancing plastics manufacturing across Egypt and the Arab world.'
            )}
          </p>
        </div>

        {/* المهارات الرئيسية */}
        <div className="space-y-2">
          <h3 className="text-xs sm:text-sm font-extrabold text-[#0B2A5B]">
            {t('المهارات الرئيسية', 'Core Skills')}
          </h3>
          <div className="flex flex-wrap gap-2">
            {[
              'صيانة ماكينات الحقن',
              'هيدروليك',
              'تشخيص الأعطال',
              'قراءة المخططات',
              'تحسين الإنتاجية',
            ].map((skill) => (
              <span
                key={skill}
                className="px-3.5 py-1.5 rounded-xl bg-[#E8EEF6] text-[#0B2A5B] text-xs font-bold"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* الخبرة مع الماكينات (Machine Brands matching Image 4 Right Phone) */}
        <div className="space-y-2">
          <h3 className="text-xs sm:text-sm font-extrabold text-[#0B2A5B]">
            {t('الخبرة مع الماكينات', 'Machine Brands Experience')}
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { name: 'HAITIAN', color: 'text-[#1D4ED8] border-blue-200 bg-blue-50/50' },
              { name: 'ARBURG', color: 'text-[#059669] border-emerald-200 bg-emerald-50/50' },
              { name: 'ENGEL', color: 'text-[#0F172A] border-slate-300 bg-slate-50' },
              { name: 'KraussMaffei', color: 'text-[#1E3A8A] border-blue-200 bg-slate-50' },
            ].map((brand) => (
              <span
                key={brand.name}
                className={`px-3 py-2 rounded-xl border text-xs font-extrabold tracking-wide ${brand.color}`}
              >
                {brand.name}
              </span>
            ))}
            <span className="px-2.5 py-2 rounded-xl bg-[#E8EEF6] text-[#0B2A5B] text-xs font-extrabold">
              +3
            </span>
          </div>
        </div>

        {/* الخبرة مع الخامات */}
        <div className="space-y-2">
          <h3 className="text-xs sm:text-sm font-extrabold text-[#0B2A5B]">
            {t('الخبرة مع الخامات', 'Polymers & Resins')}
          </h3>
          <div className="grid grid-cols-5 gap-2 text-center">
            {['ABS', 'PVC', 'PET', 'PE', 'PP'].map((resin) => (
              <span
                key={resin}
                className="py-2 rounded-xl bg-[#E8EEF6] text-[#0B2A5B] text-xs font-extrabold"
              >
                {resin}
              </span>
            ))}
          </div>
        </div>

        {/* الشهادات والدورات */}
        <div className="space-y-2">
          <h3 className="text-xs sm:text-sm font-extrabold text-[#0B2A5B]">
            {t('الشهادات والدورات', 'Certificates & Courses')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-slate-200 flex items-center justify-between gap-2">
              <div>
                <div className="text-xs font-extrabold text-[#0B2A5B]">
                  {t('دورة صيانة ماكينات الحقن', 'Injection Maintenance Course')}
                </div>
                <div className="text-[11px] text-slate-500">Plastics Academy</div>
              </div>
              <Award className="w-6 h-6 text-[#1D6BF3] shrink-0" />
            </div>

            <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-slate-200 flex items-center justify-between gap-2">
              <div>
                <div className="text-xs font-extrabold text-[#0B2A5B]">
                  {t('أساسيات الهيدروليك', 'Hydraulics Fundamentals')}
                </div>
                <div className="text-[11px] text-slate-500">TÜV Rheinland</div>
              </div>
              <FileCheck className="w-6 h-6 text-[#0B2A5B] shrink-0" />
            </div>
          </div>
        </div>

        {/* Quick Menu Rows matching Image 6 Screen 6 */}
        <div className="pt-2 divide-y divide-slate-100 border-t border-slate-100">
          {[
            { labelAr: 'معلوماتي المهنية', to: '/onboarding/setup' },
            { labelAr: 'إنجازاتي والحلول المعتمدة', to: '/app/faults' },
            {
              labelAr: `الشارات والنقاط (${currentUser.reputationPoints} نقطة)`,
              to: '/app/profile',
            },
            { labelAr: 'إعدادات الحساب', to: '/app/settings' },
          ].map((row) => (
            <Link
              key={row.labelAr}
              to={row.to}
              className="py-3 flex items-center justify-between text-xs sm:text-sm font-extrabold text-[#0B2A5B] hover:text-[#1D6BF3]"
            >
              <span>{row.labelAr}</span>
              <ChevronIcon className="w-4 h-4 text-slate-400" />
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom Dark Navy Trophy Banner matching Image 4 Right Phone */}
      <Link
        to="/app/home"
        className="block rounded-3xl bg-gradient-to-l from-[#071D42] via-[#0B2A5B] to-[#133F85] p-4 sm:p-5 text-white shadow-md hover:brightness-105 transition-all"
      >
        <div className="flex items-center justify-between gap-3">
          <Trophy className="w-10 h-10 text-amber-400 shrink-0" />
          <div className="flex-1 text-center">
            <div className="text-sm sm:text-base font-extrabold">
              {t('ابدأ رحلتك الآن', 'Start Your Journey Now')}
            </div>
            <div className="text-[11px] text-blue-100 font-medium mt-0.5">
              {t(
                'اكتشف فرص العمل، شارك في الأعطال، وتواصل مع المجتمع الصناعي',
                'Discover jobs, solve faults, and connect with the industrial community'
              )}
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-[#1D6BF3] flex items-center justify-center shrink-0">
            <ArrowIcon className="w-4 h-4 text-white" />
          </div>
        </div>
      </Link>
    </div>
  );
};

export const ProfileEditPage: React.FC = () => <ProfilePage />;

/* ============================================================================
   Screen 17: Notifications (/app/notifications)
   Matches Image 6 (Screen 17)
   ============================================================================ */
export const NotificationsPage: React.FC = () => {
  const { t, notifications, markAllNotificationsRead, markNotificationRead } = usePlastico();
  const navigate = useNavigate();

  const signatureNotifs = [
    {
      id: 'ntf-sig-1',
      titleAr: 'رد جديد على عطلك',
      bodyAr: 'من أحمد محمد — منذ دقيقة',
      link: '/app/faults',
      icon: Wrench,
      iconBg: 'bg-blue-50 text-[#1D6BF3]',
    },
    {
      id: 'ntf-sig-2',
      titleAr: 'وظيفة جديدة تناسبك',
      bodyAr: 'شركة الشرق للبلاستيك — منذ 10 دقائق',
      link: '/app/jobs',
      icon: Briefcase,
      iconBg: 'bg-emerald-50 text-[#10B981]',
    },
    {
      id: 'ntf-sig-3',
      titleAr: 'عرض سعر جديد على طلبك',
      bodyAr: 'مصنع النيل للبلاستيك — منذ 20 دقيقة',
      link: '/app/manufacturing',
      icon: ShoppingCart,
      iconBg: 'bg-amber-50 text-[#F59E0B]',
    },
    {
      id: 'ntf-sig-4',
      titleAr: 'تم قبول طلبك وتحديث نقاط السمعة',
      bodyAr: 'مجمع بلاستيكو الصناعي — منذ ساعة',
      link: '/app/profile',
      icon: Bell,
      iconBg: 'bg-purple-50 text-[#6366F1]',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-[#0B2A5B]">
          {t('الإشعارات', 'Notifications')}
        </h1>
        <button
          type="button"
          onClick={markAllNotificationsRead}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B2A5B] text-white text-xs font-extrabold"
        >
          <span>{t('الكل مقروء', 'All Read')}</span>
        </button>
      </div>

      {/* Signature Cards matching Image 6 Screen 17 */}
      <div className="space-y-3">
        {signatureNotifs.map((n) => {
          const Icon = n.icon;
          return (
            <div
              key={n.id}
              onClick={() => navigate(n.link)}
              className="cursor-pointer bg-white rounded-3xl border border-slate-200/85 p-4 shadow-2xs hover:border-[#1D6BF3] flex items-center justify-between gap-4 transition-all"
            >
              <div className="flex-1">
                <div className="text-sm sm:text-base font-extrabold text-[#0B2A5B]">
                  {n.titleAr}
                </div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">{n.bodyAr}</div>
              </div>
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${n.iconBg}`}
              >
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}

        {notifications.map((notif) => (
          <div
            key={notif.id}
            onClick={() => {
              markNotificationRead(notif.id);
              navigate(notif.link);
            }}
            className="cursor-pointer bg-white rounded-3xl border border-slate-200/85 p-4 shadow-2xs hover:border-[#1D6BF3] flex items-center justify-between gap-4"
          >
            <div>
              <div className="text-sm font-extrabold text-[#0B2A5B]">
                {t(notif.titleAr, notif.titleEn)}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {t(notif.bodyAr, notif.bodyEn)} · {notif.createdAt}
              </div>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#1D6BF3] flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ============================================================================
   Settings, Messages & Saved Items Pages
   ============================================================================ */
export const SettingsPage: React.FC = () => {
  const { lang, setLang, t, currentUser, switchPersona, resetDemoData } = usePlastico();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <SettingsIcon className="w-6 h-6 text-[#0B2A5B]" />
        <h1 className="text-xl font-extrabold text-[#0B2A5B]">
          {t('إعدادات الحساب والمنصة', 'Account & Platform Settings')}
        </h1>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-5">
        <div className="space-y-2">
          <label className="block text-xs font-extrabold text-[#0B2A5B]">
            {t('لغة الواجهة والاتجاه:', 'Interface Language:')}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setLang('ar')}
              className={`py-3 rounded-2xl text-xs font-extrabold border ${
                lang === 'ar'
                  ? 'bg-[#0B2A5B] text-white border-[#0B2A5B]'
                  : 'bg-slate-50 text-[#0B2A5B] border-slate-200'
              }`}
            >
              العربية (RTL)
            </button>
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`py-3 rounded-2xl text-xs font-extrabold border ${
                lang === 'en'
                  ? 'bg-[#0B2A5B] text-white border-[#0B2A5B]'
                  : 'bg-slate-50 text-[#0B2A5B] border-slate-200'
              }`}
            >
              English (LTR)
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-extrabold text-[#0B2A5B]">
            {t('تبديل الدور المهني النشط:', 'Switch Active Professional Role:')}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {(
              [
                { r: 'engineer', label: 'مهندس بلاستيك' },
                { r: 'technician', label: 'فني تشغيل وصيانة' },
                { r: 'factory', label: 'صاحب مصنع' },
                { r: 'supplier', label: 'مورد خامات' },
                { r: 'trader', label: 'تاجر / سوق مستعمل' },
              ] as { r: UserRole; label: string }[]
            ).map((item) => (
              <button
                key={item.r}
                type="button"
                onClick={() => switchPersona(item.r)}
                className={`p-3 rounded-2xl text-xs font-extrabold border ${
                  currentUser.role === item.r
                    ? 'bg-[#DCEBFF] text-[#0B5ED7] border-[#1D6BF3]'
                    : 'bg-slate-50 text-[#0B2A5B] border-slate-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={resetDemoData}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-red-50 text-[#E11D48] text-xs font-extrabold"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t('إعادة ضبط البيانات التجريبية', 'Reset Demo Data')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const MessagesPage: React.FC = () => {
  const { t, showToast } = usePlastico();
  const [msg, setMsg] = useState('');
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold text-[#0B2A5B]">{t('رسائلي', 'My Messages')}</h1>
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100">
          <div className="text-xs font-extrabold text-[#0B2A5B]">
            مصنع الدلتا للصناعات البلاستيكية
          </div>
          <p className="text-xs text-slate-600 mt-1">
            مرحباً باشمهندس أحمد، تم مراجعة عرض السعر لطلب إنتاج عبوات 500 مل وجاهزون للتنفيذ.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder={t('اكتب رسالتك...', 'Type a message...')}
            className="flex-1 px-4 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-xs text-[#0B2A5B]"
          />
          <button
            type="button"
            onClick={() => {
              setMsg('');
              showToast('تم إرسال الرسالة بنجاح!', 'Message sent!');
            }}
            className="px-5 py-2.5 rounded-full bg-[#0B2A5B] text-white text-xs font-extrabold flex items-center gap-1"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{t('إرسال', 'Send')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const SavedItemsPage: React.FC = () => {
  const { t } = usePlastico();
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Bookmark className="w-5 h-5 text-[#1D6BF3]" />
        <h1 className="text-xl font-extrabold text-[#0B2A5B]">
          {t('حفظت لاحقاً', 'Saved Items')}
        </h1>
      </div>
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-3">
        <Link
          to="/app/market"
          className="block p-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-slate-200"
        >
          <div className="text-sm font-extrabold text-[#0B2A5B]">ماكينة حقن Haitian 280 طن</div>
          <div className="text-xs text-[#16A34A] font-extrabold mt-0.5">$28,000 · القاهرة</div>
        </Link>
        <Link
          to="/app/jobs"
          className="block p-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-slate-200"
        >
          <div className="text-sm font-extrabold text-[#0B2A5B]">
            مهندس صيانة ميكانيكا — شركة النور للبلاستيك
          </div>
          <div className="text-xs text-slate-500 mt-0.5">6 أكتوبر · $800 - $1,200</div>
        </Link>
      </div>
    </div>
  );
};
