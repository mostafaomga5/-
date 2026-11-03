import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Lock, LogIn, UserPlus, Eye, ShieldAlert, Sparkles, ArrowLeft, ArrowRight, X } from 'lucide-react';
import { usePlastico } from '../context/PlasticoContext';
import { PlasticoLogo } from './PlasticoLogo';
import { IMAGE_MANIFEST } from '../data/imageManifest';

const SPLASH_SEEN_KEY = 'plastico_splash_shown_session_v1';

export const PlasticoSplashScreen: React.FC<{
  onFinish: () => void;
}> = ({ onFinish }) => {
  const { lang, t } = usePlastico();
  const [progress, setProgress] = useState(15);
  const ArrowIcon = lang === 'ar' ? ArrowLeft : ArrowRight;

  useEffect(() => {
    const t1 = window.setTimeout(() => setProgress(55), 350);
    const t2 = window.setTimeout(() => setProgress(90), 850);
    const t3 = window.setTimeout(() => setProgress(100), 1250);
    const t4 = window.setTimeout(() => {
      onFinish();
    }, 1550);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearTimeout(t4);
    };
  }, [onFinish]);

  return (
    <div
      data-testid="plastico-splash-screen"
      className="fixed inset-0 z-[200] bg-[#071A33] text-white flex flex-col items-center justify-between p-6 overflow-hidden select-none"
    >
      {/* Background radial studio glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 38%, rgba(23, 105, 232, 0.32), rgba(39, 190, 214, 0.14) 42%, transparent 72%)',
        }}
      />

      <div className="w-full max-w-md flex items-center justify-end relative z-10">
        <button
          type="button"
          data-testid="skip-splash-btn"
          onClick={onFinish}
          className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-extrabold text-slate-200 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>{t('تخطي', 'Skip')}</span>
          <ArrowIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Center Logo & 3D Industrial Showcase */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-lg mx-auto space-y-6 my-auto">
        <div className="p-6 rounded-3xl bg-white/5 border border-white/15 shadow-2xl backdrop-blur-md">
          <PlasticoLogo variant="stacked" theme="dark" size="lg" showTagline />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#1769E8]/25 border border-[#27BED6]/40 text-[#27BED6] text-xs font-extrabold">
            <Sparkles className="w-3.5 h-3.5 text-[#FF8A2A]" />
            <span>
              {t(
                'المنظومة الرقمية الأولى لصناعة البلاستيك',
                'The #1 Digital Ecosystem for the Plastics Industry'
              )}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t('كل صناعة البلاستيك. في مكان واحد.', 'The Entire Plastics Industry. In One Place.')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            {t(
              'المصانع • الموردون • سوق الماكينات والخامات • المعارض الافتراضية • الأكاديمية • الأعطال والوظائف',
              'Factories • Suppliers • Machinery & Resins Market • Virtual Expo • Academy • Faults & Jobs'
            )}
          </p>
        </div>

        {/* 3D Category Icons Preview Strip */}
        <div className="flex items-center justify-center gap-3 pt-1">
          {[
            IMAGE_MANIFEST.icons3d.injection,
            IMAGE_MANIFEST.icons3d.blow,
            IMAGE_MANIFEST.icons3d.extrusion,
            IMAGE_MANIFEST.icons3d.rawMaterials,
            IMAGE_MANIFEST.icons3d.moldMaintenance,
          ].map((src, idx) => (
            <div
              key={idx}
              className="w-11 h-11 rounded-2xl bg-white/8 border border-white/15 p-1.5 flex items-center justify-center shadow-md"
            >
              <img src={src} alt="" className="w-full h-full object-contain" />
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="w-64 sm:w-72 space-y-2 pt-2">
          <div className="h-2 rounded-full bg-white/10 overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#1769E8] via-[#27BED6] to-[#FF8A2A] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-[11px] font-bold text-slate-300">
            {t('جاري تهيئة المنصة وتجهيز بوابة الدخول...', 'Initializing platform & login gateway...')}
          </div>
        </div>
      </div>

      <div className="relative z-10 text-[11px] font-bold text-slate-400">
        PLASTICO — بلاستيكو
      </div>
    </div>
  );
};

export const VisitorReadOnlyBanner: React.FC = () => {
  const { isAuthenticated, isVisitorMode, realUser, exitVisitorMode, t } = usePlastico();
  const navigate = useNavigate();

  const isReadOnlyVisitor =
    (!isAuthenticated && isVisitorMode) || realUser?.accountType === 'visitor';

  if (!isReadOnlyVisitor) return null;

  return (
    <div
      data-testid="visitor-readonly-banner"
      className="bg-gradient-to-r from-amber-500/95 via-[#FF8A2A] to-amber-600 text-white px-3.5 py-2 shadow-sm border-b border-white/15 z-40"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 font-extrabold">
          <Eye className="w-4 h-4 shrink-0 text-white" />
          <span>
            {t(
              'أنت تتصفح حالياً بوضع الزائر (تصفح فقط): غير مسموح بالنشر أو التعليق أو الإعجاب أو المراسلة.',
              'You are browsing in Visitor Mode (View-Only): Posting, commenting, liking, and messaging are disabled.'
            )}
          </span>
        </div>
        <div className="flex items-center gap-2 ms-auto">
          <button
            type="button"
            onClick={() => {
              exitVisitorMode();
              navigate('/auth/login');
            }}
            className="px-3 py-1 rounded-lg bg-[#071A33] hover:bg-[#0D284F] text-white text-[11px] font-extrabold inline-flex items-center gap-1 transition-colors cursor-pointer"
          >
            <LogIn className="w-3 h-3" />
            <span>{t('تسجيل الدخول بحساب فعلي', 'Sign In with Full Account')}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              exitVisitorMode();
              navigate('/auth/register');
            }}
            className="px-3 py-1 rounded-lg bg-white text-[#071A33] hover:bg-slate-100 text-[11px] font-extrabold inline-flex items-center gap-1 transition-colors cursor-pointer"
          >
            <UserPlus className="w-3 h-3" />
            <span>{t('إنشاء حساب', 'Register')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const VisitorActionBlockedModal: React.FC = () => {
  const {
    visitorBlockedAction,
    closeVisitorBlockedModal,
    exitVisitorMode,
    t,
  } = usePlastico();
  const navigate = useNavigate();

  if (!visitorBlockedAction) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-testid="visitor-blocked-modal"
      className="fixed inset-0 z-[190] bg-[#071A33]/80 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={closeVisitorBlockedModal}
    >
      <div
        className="bg-white rounded-3xl border border-[#DFE7F1] max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 text-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={closeVisitorBlockedModal}
          aria-label={t('إغلاق', 'Close')}
          className="absolute top-4 end-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-[#FF8A2A] flex items-center justify-center mx-auto shadow-xs">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[11px] font-extrabold">
            <ShieldAlert className="w-3.5 h-3.5 text-[#FF8A2A]" />
            <span>{t('وضع الزائر — صلاحية تصفح فقط', 'Visitor Mode — View Only')}</span>
          </span>
          <h3 className="text-lg sm:text-xl font-extrabold text-[#071A33]">
            {t(
              `لا يمكن تنفيذ "${visitorBlockedAction}" في وضع الزائر`,
              `Cannot perform "${visitorBlockedAction}" in Visitor Mode`
            )}
          </h3>
          <p className="text-xs sm:text-sm text-[#718096] leading-relaxed">
            {t(
              'حساب الزائر مخصص للاطلاع وتصفح أقسام المنصة فقط. لا يُسمح للزائر بالنشر أو التعليق أو الإعجاب أو حفظ المفضلة أو المراسلة إلا بعد تسجيل الدخول بحساب فعلي.',
              'Visitor mode is strictly for browsing. Posting, commenting, liking, saving favorites, and messaging require signing in with an active account.'
            )}
          </p>
        </div>

        <div className="space-y-2.5 pt-1">
          <button
            type="button"
            onClick={() => {
              closeVisitorBlockedModal();
              exitVisitorMode();
              navigate('/auth/login');
            }}
            className="w-full py-3.5 px-4 rounded-xl bg-[#1769E8] hover:bg-[#1258C7] text-white text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>{t('تسجيل الدخول بحسابك الآن', 'Sign In to Your Account')}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              closeVisitorBlockedModal();
              exitVisitorMode();
              navigate('/auth/register');
            }}
            className="w-full py-3 px-4 rounded-xl bg-[#FF8A2A] hover:bg-[#F07B1A] text-white text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t('إنشاء حساب صناعي جديد', 'Create a New Industrial Account')}</span>
          </button>

          <button
            type="button"
            onClick={closeVisitorBlockedModal}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#13243B] text-xs font-extrabold transition-colors cursor-pointer"
          >
            {t('متابعة التصفح كزائر فقط', 'Continue Browsing as Visitor')}
          </button>
        </div>
      </div>
    </div>
  );
};

export const MandatoryAuthGate: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <>
      {children}
      <VisitorActionBlockedModal />
    </>
  );
};

