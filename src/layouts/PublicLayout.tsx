import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { usePlastico } from '../context/PlasticoContext';
import { GlobalSearchModal } from '../components/GlobalSearchModal';

export const PublicLayout: React.FC = () => {
  const { toastMessage } = usePlastico();

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-[#0B2A5B] flex flex-col">
      <GlobalSearchModal />

      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-[#0B2A5B] text-white text-xs sm:text-sm font-bold shadow-xl flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
};
