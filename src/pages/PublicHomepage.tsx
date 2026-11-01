import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Globe,
  ArrowLeft,
  ArrowRight,
  Leaf,
  Users,
  BarChart3,
  LayoutGrid,
} from 'lucide-react';
import { usePlastico } from '../context/PlasticoContext';
import { PlasticoLogo } from '../components/PlasticoLogo';

export const PublicHomepage: React.FC = () => {
  const { lang, setLang, t } = usePlastico();
  const navigate = useNavigate();
  const ArrowIcon = lang === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen bg-[#06152D] text-white flex flex-col justify-between relative overflow-hidden">
      {/* Background Industrial Visual (Blue Pellets + Steel Injection Mold) matching Image 1 Screen 01 */}
      <img
        src="/images/plastico/hero/main-industrial-hero.svg"
        alt="PLASTICO Industrial Background"
        className="absolute inset-0 w-full h-full object-cover opacity-90 pointer-events-none"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#071936]/80 via-[#071936]/55 to-[#051024]/95 pointer-events-none" />

      {/* Top Quick Navigation Bar (Language + Quick App Jump) */}
      <header className="relative z-10 w-full max-w-lg mx-auto px-5 pt-6 flex items-center justify-between">
        <Link
          to="/app/home"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md text-xs font-extrabold text-white transition-colors"
        >
          <LayoutGrid className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span>{t('تصفح التطبيق مباشرة', 'Open App Directly')}</span>
        </Link>

        <button
          type="button"
          onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-xs font-extrabold text-white transition-colors"
        >
          <span>{lang === 'ar' ? 'AR' : 'EN'}</span>
          <Globe className="w-4 h-4 text-blue-300" />
        </button>
      </header>

      {/* Center Brand & Value Proposition matching Screen 01 Splash Screen */}
      <div className="relative z-10 w-full max-w-lg mx-auto px-6 py-6 flex-1 flex flex-col justify-between">
        {/* Top Centered Stacked Logo */}
        <div className="flex flex-col items-center text-center mt-2">
          <PlasticoLogo variant="stacked" theme="dark" size="xl" />
          <p className="text-sm sm:text-base font-extrabold text-white mt-3">
            {t('كل صناعة البلاستيك .. في مكان واحد', 'All Plastics Manufacturing .. In One Place')}
          </p>
          <p className="text-[10px] sm:text-xs font-bold tracking-[0.22em] text-blue-200/80 uppercase mt-1">
            PEOPLE • SOLUTIONS • OPPORTUNITIES
          </p>
        </div>

        {/* Middle Headline Block matching Screen 01 */}
        <div className="my-8 text-start max-w-xs">
          <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight text-white">
            {t('معاً نصنع', 'Together We Build')}
            <span className="block">{t('مستقبل', 'A Stronger')}</span>
            <span className="block text-[#2997FF]">{t('أقوى', 'Future')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/90 font-medium leading-relaxed mt-3">
            {t(
              'مجتمع صناعي متكامل يربط المصانع، الفنيين، الموردين، والفرص في عالم البلاستيك',
              'An integrated industrial community connecting factories, technicians, suppliers, and opportunities in plastics'
            )}
          </p>
        </div>

        {/* Bottom CTA Buttons & 3 Pillars matching Screen 01 */}
        <div className="space-y-4 pb-4">
          {/* Carousel Indicator Pills */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="w-8 h-2 rounded-full bg-[#1D6BF3]" />
            <span className="w-6 h-2 rounded-full bg-white/30" />
            <span className="w-6 h-2 rounded-full bg-white/30" />
          </div>

          <button
            type="button"
            onClick={() => navigate('/auth/register')}
            className="w-full py-4 px-6 rounded-full bg-gradient-to-l from-[#1D6BF3] to-[#2578FF] hover:brightness-110 text-white font-extrabold text-base shadow-lg shadow-blue-600/35 flex items-center justify-center gap-3 transition-all"
          >
            <span>{t('ابدأ رحلتك الآن', 'Start Your Journey Now')}</span>
            <ArrowIcon className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => navigate('/app/home')}
            className="w-full py-3.5 px-6 rounded-full bg-white/5 hover:bg-white/15 border border-white/25 text-white font-bold text-sm transition-all"
          >
            {t('تعرف على بلاستيكو (دخول المنصة)', 'Explore PLASTICO Platform')}
          </button>

          {/* 3 Feature Icons Row at bottom of Splash */}
          <div className="grid grid-cols-3 gap-3 pt-4">
            <div className="flex flex-col items-center text-center gap-1.5">
              <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-white">
                <BarChart3 className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-blue-100 leading-tight">
                {t('صناعة أكثر نمواً', 'Faster Industry Growth')}
              </span>
            </div>
            <div className="flex flex-col items-center text-center gap-1.5">
              <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-white">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-blue-100 leading-tight">
                {t('فرص أكبر للجميع', 'Greater Opportunities')}
              </span>
            </div>
            <div className="flex flex-col items-center text-center gap-1.5">
              <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-white">
                <Leaf className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-blue-100 leading-tight">
                {t('بيئة أكثر استدامة', 'Sustainable Environment')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
