import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  CheckCircle2,
  Home,
  Store,
  Users,
  MessageSquare,
  UserCheck,
} from 'lucide-react';
import { usePlastico } from '../context/PlasticoContext';
import { GlobalSearchModal } from '../components/GlobalSearchModal';
import { SmartPlasticoAssistant } from '../components/SmartPlasticoAssistant';
import { VisitorReadOnlyBanner } from '../components/SplashAndVisitorGate';
import { OfflineIndicator } from '../components/PWAInstallButton';

export const PublicLayout: React.FC = () => {
  const { toastMessage, unreadChatCount, t } = usePlastico();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#F4F7FC] text-[#13243B] flex flex-col pb-16 lg:pb-0">
      <GlobalSearchModal />
      <OfflineIndicator />
      <VisitorReadOnlyBanner />

      {toastMessage && (
        <div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl bg-[#071A33] text-white text-xs sm:text-sm font-bold shadow-xl flex items-center gap-2 border border-[#27BED6]/30">
          <CheckCircle2 className="w-4 h-4 text-[#FF8A2A] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation Bar — 5 Primary Tabs matching Reference UI */}
      <nav
        data-testid="mobile-bottom-nav"
        aria-label={t('شريط التنقل السفلي', 'Bottom Navigation')}
        className="fixed bottom-0 inset-x-0 z-30 lg:hidden bg-white/95 backdrop-blur-md border-t border-[#DFE7F1] min-h-16 pb-[env(safe-area-inset-bottom)] px-1 flex items-center justify-around shadow-[0_-4px_20px_rgba(7,26,51,0.06)]"
      >
        {[
          {
            to: '/',
            icon: Home,
            labelAr: 'الرئيسية',
            labelEn: 'Home',
            isHome: true,
          },
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
          const isActive = tab.isHome
            ? location.pathname === '/' || location.pathname === '/app/home'
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
