import React, { useState, useEffect, useCallback } from 'react';
import { Download, Share, Plus, X, WifiOff, CheckCircle2, Smartphone } from 'lucide-react';
import { usePlastico } from '../context/PlasticoContext';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const PWAInstallButton: React.FC<{ variant?: 'compact' | 'card' }> = ({
  variant = 'compact',
}) => {
  const { t } = usePlastico();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const isIOS =
    typeof navigator !== 'undefined' &&
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as unknown as { MSStream?: unknown }).MSStream;

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      (window.matchMedia('(display-mode: standalone)').matches ||
        (navigator as unknown as { standalone?: boolean }).standalone === true)
    ) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowModal(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = useCallback(async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
      return;
    }
    setShowModal(true);
  }, [deferredPrompt]);

  if (isInstalled && variant === 'compact') {
    return null;
  }

  return (
    <>
      {variant === 'compact' ? (
        <button
          type="button"
          onClick={handleInstallClick}
          data-testid="pwa-install-btn"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1769E8]/20 hover:bg-[#1769E8] text-[#27BED6] hover:text-white border border-[#27BED6]/30 text-xs font-extrabold transition-colors cursor-pointer whitespace-nowrap"
          title={t('تثبيت تطبيق PLASTICO على جهازك', 'Install PLASTICO App')}
        >
          <Download className="w-3.5 h-3.5 shrink-0" />
          <span>{t('تثبيت التطبيق', 'Install App')}</span>
        </button>
      ) : (
        <div className="p-4 rounded-2xl bg-[#071A33] text-white border border-[#1769E8]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1769E8]/25 border border-[#27BED6]/40 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5 text-[#27BED6]" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-white">
                {t('تطبيق PLASTICO متاح للتثبيت (PWA)', 'PLASTICO Industrial PWA Ready')}
              </h3>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                {t(
                  'ثبّت تطبيق بلاستيكو على شاشتك الرئيسية للوصول الفوري للسوق، الأعطال، أسعار الخامات، والرسائل.',
                  'Install PLASTICO on your home screen for instant access to Marketplace, Faults, Materials Intelligence, and Messages.'
                )}
              </p>
            </div>
          </div>
          {isInstalled ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-extrabold shrink-0">
              <CheckCircle2 className="w-4 h-4" />
              <span>{t('مثبّت على جهازك', 'Installed')}</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={handleInstallClick}
              className="px-4 py-2.5 rounded-xl bg-[#FF8A2A] hover:bg-[#F07B1A] text-white text-xs font-extrabold inline-flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{t('تثبيت على الهاتف / الكمبيوتر', 'Install on Device')}</span>
            </button>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-[#071A33]/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#DFE7F1] max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl text-[#13243B]">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#071A33] text-white flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-[#27BED6]" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-[#071A33]">
                    {t('تثبيت تطبيق PLASTICO', 'Install PLASTICO App')}
                  </h3>
                  <p className="text-[11px] text-[#718096]">
                    {t('تجربة تطبيق كاملة وسريعة على الهاتف والكمبيوتر', 'Full mobile & desktop PWA experience')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg bg-[#F4F7FC] hover:bg-slate-200 text-[#13243B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isIOS ? (
              <div className="space-y-2.5 text-xs text-[#13243B] bg-[#F4F7FC] p-4 rounded-xl border border-[#DFE7F1]">
                <p className="font-extrabold text-[#071A33]">
                  {t('لتثبيت التطبيق على iPhone / iPad:', 'To install on iPhone / iPad:')}
                </p>
                <div className="flex items-center gap-2">
                  <Share className="w-4 h-4 text-[#1769E8] shrink-0" />
                  <span>
                    {t('1. اضغط على زر المشاركة (Share) في متصفح Safari.', '1. Tap the Share button in Safari.')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#FF8A2A] shrink-0" />
                  <span>
                    {t(
                      '2. اختر "إضافة إلى الشاشة الرئيسية" (Add to Home Screen).',
                      '2. Select "Add to Home Screen".'
                    )}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5 text-xs text-[#13243B] bg-[#F4F7FC] p-4 rounded-xl border border-[#DFE7F1]">
                <p className="font-extrabold text-[#071A33]">
                  {t('لتثبيت التطبيق مباشرة:', 'To install the app directly:')}
                </p>
                <p className="leading-relaxed text-[#4A5568]">
                  {t(
                    'اضغط على أيقونة التثبيت في شريط عنوان المتصفح (Chrome / Edge) أو افتح قائمة المتصفح واختر "تثبيت التطبيق / Install App". إذا كنت تتصفح من داخل نافذة المعاينة، افتح التطبيق في علامة تبويب مستقلة لتفعيل التثبيت المباشر.',
                    'Click the install icon in your browser address bar or choose "Install App" from the browser menu. If viewing inside a preview frame, open the app in a new tab first.'
                  )}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#1769E8] hover:bg-[#1258C7] text-white text-xs font-extrabold cursor-pointer"
            >
              {t('فهمت، إغلاق', 'Got it')}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export const OfflineIndicator: React.FC = () => {
  const { t } = usePlastico();
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="bg-amber-500 text-[#071A33] text-xs font-extrabold py-1.5 px-4 flex items-center justify-center gap-2 z-50">
      <WifiOff className="w-3.5 h-3.5 shrink-0" />
      <span>
        {t(
          'أنت تتصفح حالياً بدون اتصال بالإنترنت — يتم عرض البيانات المحفوظة مؤقتاً.',
          'You are currently offline — showing cached platform data.'
        )}
      </span>
    </div>
  );
};
