import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Camera,
  Wrench,
  Briefcase,
  Store,
  Building2,
  FileText,
  GraduationCap,
  Newspaper,
  Package,
  Heart,
  MapPin,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { usePlastico } from '../context/PlasticoContext';
import { IndustrialImage } from '../components/IndustrialImage';

export const AppDashboard: React.FC = () => {
  const {
    lang,
    t,
    setIsSearchOpen,
    market,
    showToast,
  } = usePlastico();
  const navigate = useNavigate();
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const ArrowIcon = lang === 'ar' ? ArrowLeft : ArrowRight;

  const toggleLike = (e: React.MouseEvent, id: string, title: string) => {
    e.preventDefault();
    e.stopPropagation();
    setLikedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
    showToast(
      `تم تحديث قائمة المفضلة: ${title}`,
      `Updated favorites: ${title}`
    );
  };

  const quickCategories = [
    {
      to: '/app/faults',
      labelAr: 'الأعطال',
      labelEn: 'Faults',
      icon: Wrench,
      bgClass: 'bg-[#FDECEB] hover:bg-[#fbd9d7]',
      iconClass: 'text-[#EF4444]',
    },
    {
      to: '/app/jobs',
      labelAr: 'التوظيف',
      labelEn: 'Jobs',
      icon: Briefcase,
      bgClass: 'bg-[#E8F2FF] hover:bg-[#d6e7ff]',
      iconClass: 'text-[#1D6BF3]',
    },
    {
      to: '/app/market',
      labelAr: 'السوق المستعمل',
      labelEn: 'Used Market',
      icon: Store,
      bgClass: 'bg-[#FFF2E2] hover:bg-[#ffe6c7]',
      iconClass: 'text-[#F97316]',
    },
    {
      to: '/app/expo',
      labelAr: 'المعرض الافتراضي',
      labelEn: 'Virtual Expo',
      icon: Building2,
      bgClass: 'bg-[#E6F7EE] hover:bg-[#d1f1e0]',
      iconClass: 'text-[#10B981]',
    },
    {
      to: '/app/manufacturing',
      labelAr: 'طلبات التصنيع (RFQ)',
      labelEn: 'RFQ Requests',
      icon: FileText,
      bgClass: 'bg-[#EFEBFD] hover:bg-[#e2dbfb]',
      iconClass: 'text-[#6366F1]',
    },
    {
      to: '/app/training',
      labelAr: 'التدريب والشهادات',
      labelEn: 'Training & Certs',
      icon: GraduationCap,
      bgClass: 'bg-[#FEF6E0] hover:bg-[#fdedc4]',
      iconClass: 'text-[#F59E0B]',
    },
    {
      to: '/app/news',
      labelAr: 'الأخبار الصناعية',
      labelEn: 'Industrial News',
      icon: Newspaper,
      bgClass: 'bg-[#E8F4FE] hover:bg-[#d5ebfd]',
      iconClass: 'text-[#0284C7]',
    },
    {
      to: '/app/visual-search',
      labelAr: 'البحث بالصورة',
      labelEn: 'Visual Search',
      icon: Camera,
      bgClass: 'bg-[#EAEFF8] hover:bg-[#dce5f4]',
      iconClass: 'text-[#0B2A5B]',
      isNew: true,
    },
  ];

  const todayHighlights = [
    {
      to: '/app/faults',
      count: '124',
      labelAr: 'عطل جديد',
      labelEn: 'New Faults',
      icon: Wrench,
      bgClass: 'bg-[#FDECEB]',
      iconClass: 'text-[#EF4444]',
    },
    {
      to: '/app/jobs',
      count: '58',
      labelAr: 'وظيفة جديدة',
      labelEn: 'New Jobs',
      icon: Briefcase,
      bgClass: 'bg-[#E6F7EE]',
      iconClass: 'text-[#10B981]',
    },
    {
      to: '/app/manufacturing',
      count: '37',
      labelAr: 'طلب تصنيع',
      labelEn: 'RFQ Orders',
      icon: FileText,
      bgClass: 'bg-[#EFEBFD]',
      iconClass: 'text-[#6366F1]',
    },
    {
      to: '/app/market',
      count: '210',
      labelAr: 'منتج جديد',
      labelEn: 'New Products',
      icon: Package,
      bgClass: 'bg-[#FEF5E4]',
      iconClass: 'text-[#F59E0B]',
    },
  ];

  const featuredProducts = [
    {
      id: market[0]?.id || 'mkt-1',
      titleAr: 'ماكينة حقن 280 طن',
      titleEn: '280T Injection Machine',
      price: '$42,000',
      locationAr: 'مصر',
      locationEn: 'Egypt',
      badgeAr: 'مستعمل',
      badgeEn: 'Used',
      image: '/images/plastico/marketplace/used-injection-machine.svg',
    },
    {
      id: market[1]?.id || 'mkt-2',
      titleAr: 'قالب حقن بلاستيك 16 تجويف',
      titleEn: '16-Cavity Injection Mold',
      price: '$8,000',
      locationAr: 'تركيا',
      locationEn: 'Turkey',
      image: '/images/plastico/marketplace/injection-mold-steel.svg',
    },
    {
      id: market[2]?.id || 'mkt-3',
      titleAr: 'خامات PP عالية الجودة',
      titleEn: 'High Grade PP Granules',
      price: 'طن / $1,250',
      locationAr: 'السعودية',
      locationEn: 'Saudi Arabia',
      image: '/images/plastico/marketplace/virgin-polymer-granules.svg',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Search Bar with Camera Button matching Image 2 */}
      <div className="flex items-center gap-2.5 bg-white rounded-2xl p-2 border border-slate-200/90 shadow-2xs">
        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          className="flex-1 flex items-center gap-3 px-3 py-2 text-start text-slate-400 hover:text-[#0B2A5B] transition-colors"
        >
          <Search className="w-5 h-5 text-[#0B2A5B] shrink-0" />
          <span className="text-xs sm:text-sm font-medium truncate">
            {t('ابحث عن ماكينات، خامات، وظائف ...', 'Search machines, resins, jobs...')}
          </span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/app/visual-search')}
          title={t('البحث بالصورة', 'Visual Search by Photo')}
          className="p-2.5 rounded-xl bg-[#0B2A5B] hover:bg-[#1D6BF3] text-white transition-colors shrink-0 shadow-xs"
        >
          <Camera className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Hero Industrial Banner matching Image 2 */}
      <div className="relative rounded-3xl overflow-hidden shadow-md border border-blue-900/15 bg-[#082046]">
        <img
          src="/images/plastico/hero/main-industrial-hero.svg"
          alt="PLASTICO Community"
          className="absolute inset-0 w-full h-full object-cover opacity-85"
        />
        <div className=" inset-0 bg-gradient-to-l from-[#071936]/95 via-[#0B2A5B]/80 to-transparent relative p-6 sm:p-8 flex flex-col items-start justify-between min-h-[195px] sm:min-h-[215px]">
          <div className="max-w-md space-y-1.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white leading-snug">
              {t('صناعة البلاستيك', 'The Plastics Industry')}
              <span className="block text-white">
                {t('فرص أكبر لمستقبل أقوى', 'Bigger Opportunities for a Stronger Future')}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 font-medium">
              {t(
                'انضم إلى أكبر مجتمع صناعي في الوطن العربي',
                'Join the largest plastics industrial community in the Arab world'
              )}
            </p>
          </div>

          <div className="w-full flex items-center justify-between mt-5">
            <Link
              to="/app/manufacturing"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1D6BF3] hover:bg-[#1559D6] text-white text-xs sm:text-sm font-extrabold shadow-md transition-all"
            >
              <span>{t('اكتشف المزيد', 'Explore Now')}</span>
              <ArrowIcon className="w-4 h-4" />
            </Link>

            {/* Carousel Dots */}
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-white" />
              <span className="w-2 h-2 rounded-full bg-white/45" />
              <span className="w-2 h-2 rounded-full bg-white/45" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. 8 Quick-Access Category Tiles (4x2 Grid) matching Image 2 */}
      <div className="grid grid-cols-4 gap-2.5 sm:gap-4">
        {quickCategories.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.to}
              to={cat.to}
              className={`relative rounded-2xl p-3 sm:p-4 flex flex-col items-center justify-center text-center gap-2 transition-all shadow-2xs border border-white/80 ${cat.bgClass}`}
            >
              {cat.isNew && (
                <span className="absolute -top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-[#EF4444] text-white text-[10px] font-extrabold shadow-xs">
                  {t('جديد', 'NEW')}
                </span>
              )}
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/80 flex items-center justify-center shadow-2xs">
                <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${cat.iconClass}`} />
              </div>
              <span className="text-[11px] sm:text-xs font-extrabold text-[#0B2A5B] leading-tight">
                {t(cat.labelAr, cat.labelEn)}
              </span>
            </Link>
          );
        })}
      </div>

      {/* 4. Today's Highlights (أهم الأنشطة اليوم) matching Image 2 */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-extrabold text-[#0B2A5B]">
            {t('أهم الأنشطة اليوم', "Today's Top Activity")}
          </h2>
          <Link
            to="/app/notifications"
            className="text-xs font-extrabold text-[#1D6BF3] hover:underline"
          >
            {t('عرض الكل', 'View All')}
          </Link>
        </div>

        <div className="grid grid-cols-4 gap-2.5 sm:gap-4">
          {todayHighlights.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.labelAr}
                to={item.to}
                className={`rounded-2xl p-3 sm:p-4 flex flex-col items-center justify-center text-center gap-1 transition-transform hover:-translate-y-0.5 border border-white ${item.bgClass}`}
              >
                <Icon className={`w-5 h-5 ${item.iconClass} mb-0.5`} />
                <span className="text-lg sm:text-2xl font-extrabold text-[#0B2A5B] font-mono-num leading-none">
                  {item.count}
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-[#0B2A5B]/85">
                  {t(item.labelAr, item.labelEn)}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 5. Featured Products in Market (منتجات مميزة في السوق) matching Image 2 */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-extrabold text-[#0B2A5B]">
            {t('منتجات مميزة في السوق', 'Featured Market Products')}
          </h2>
          <Link
            to="/app/market"
            className="text-xs font-extrabold text-[#1D6BF3] hover:underline"
          >
            {t('عرض الكل', 'View All')}
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
          {featuredProducts.map((prod) => {
            const isLiked = likedIds.includes(prod.id);
            return (
              <Link
                key={prod.id}
                to={`/app/market/${prod.id}`}
                className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="relative">
                  <IndustrialImage
                    src={prod.image}
                    alt={t(prod.titleAr, prod.titleEn)}
                    aspectClass="aspect-[4/3]"
                  />
                  <button
                    type="button"
                    onClick={(e) => toggleLike(e, prod.id, t(prod.titleAr, prod.titleEn))}
                    aria-label={t('إضافة للمفضلة', 'Favorite')}
                    className="absolute top-2 left-2 w-7 h-7 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-xs"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        isLiked ? 'text-[#EF4444] fill-[#EF4444]' : 'text-[#0B2A5B]'
                      }`}
                    />
                  </button>
                  {prod.badgeAr && (
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-[#10B981] text-white text-[10px] font-extrabold shadow-xs">
                      ● {t(prod.badgeAr, prod.badgeEn || '')}
                    </span>
                  )}
                </div>

                <div className="p-2.5 sm:p-3.5 space-y-1">
                  <h3 className="text-xs sm:text-sm font-extrabold text-[#0B2A5B] line-clamp-1">
                    {t(prod.titleAr, prod.titleEn)}
                  </h3>
                  <div
                    dir="ltr"
                    className="text-xs sm:text-sm font-extrabold text-[#16A34A] font-mono-num text-end"
                  >
                    {prod.price}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{t(prod.locationAr, prod.locationEn)}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 6. Bottom Community CTA Banner matching Image 2 */}
      <Link
        to="/onboarding/type"
        className="block rounded-2xl bg-gradient-to-l from-[#071D42] via-[#0B2A5B] to-[#133F85] p-4 sm:p-5 text-white shadow-md hover:brightness-105 transition-all"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="text-center flex-1">
            <div className="text-sm sm:text-base font-extrabold">
              {t('معاً نصنع مجتمع صناعي أقوى', 'Together We Build a Stronger Industrial Community')}
            </div>
            <div className="text-[11px] sm:text-xs text-blue-200 font-medium mt-0.5">
              {t('فرص - شراكات - ابتكار - نمو', 'Opportunities - Partnerships - Innovation - Growth')}
            </div>
          </div>
          <ArrowIcon className="w-5 h-5 text-white shrink-0" />
        </div>
      </Link>
    </div>
  );
};
