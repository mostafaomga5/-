import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Heart,
  MapPin,
  Plus,
  Store,
  Cpu,
  Layers,
  FlaskConical,
  Wrench,
  Sparkles,
  Star,
  UploadCloud,
  CheckCircle2,
  X,
  GraduationCap,
  Calendar,
} from 'lucide-react';
import { usePlastico } from '../context/PlasticoContext';
import { IndustrialImage } from '../components/IndustrialImage';

/* ============================================================================
   Screen 10: Marketplace (/app/market & /app/market/:id)
   Matches Image 5 (Screen 03) & Image 6 (Screen 10)
   ============================================================================ */
export const MarketListPage: React.FC = () => {
  const { t, market, createMarketItem, showToast } = usePlastico();
  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [likedIds, setLikedIds] = useState<string[]>(['mkt-3', 'mkt-4']);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('12000');
  const [newCity, setNewCity] = useState('القاهرة - مصر');
  const [newCondition, setNewCondition] = useState<'جديد' | 'مستعمل بحالة ممتازة' | 'مجدد'>(
    'مستعمل بحالة ممتازة'
  );

  const toggleLike = (id: string) => {
    setLikedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    createMarketItem({
      titleAr: newTitle,
      titleEn: newTitle,
      category: 'used_machines',
      conditionAr: newCondition,
      price: Number(newPrice) || 10000,
      currency: '$',
      city: newCity,
      sellerName: 'شركة الدلتا للمعدات البلاستيكية',
      sellerRole: 'trader',
      specs: ['فحص فني معتمد', 'جاهز للتشغيل الفوري'],
      image: '/images/plastico/marketplace/used-injection-machine.svg',
    });
    setNewTitle('');
    setShowAddModal(false);
  };

  const categories = [
    { id: 'all', labelAr: 'الكل', labelEn: 'All', icon: Store },
    { id: 'used_machines', labelAr: 'ماكينات', labelEn: 'Machines', icon: Cpu },
    { id: 'molds', labelAr: 'قوالب', labelEn: 'Molds', icon: Layers },
    { id: 'raw_materials', labelAr: 'خامات', labelEn: 'Resins', icon: FlaskConical },
    { id: 'spare_parts', labelAr: 'قطع غيار', labelEn: 'Spares', icon: Wrench },
    { id: 'accessories', labelAr: 'إكسسوارات', labelEn: 'Accessories', icon: Sparkles },
  ];

  // Combine the exact 4 signature items from Image 5 Screen 03 with dynamic market items
  const signatureProducts = [
    {
      id: 'mkt-1',
      titleAr: 'ماكينة حقن Haitian 280 طن',
      titleEn: 'Haitian 280T Injection Machine',
      priceDisplay: '$28,000',
      locationAr: 'القاهرة - مصر',
      conditionBadge: 'ممتازة',
      category: 'used_machines',
      image: '/images/plastico/marketplace/used-injection-machine.svg',
    },
    {
      id: 'mkt-2',
      titleAr: 'قالب حقن بلاستيك',
      titleEn: 'Plastic Injection Mold',
      priceDisplay: '$8,500',
      locationAr: 'دمياط - مصر',
      conditionBadge: 'جيدة جداً',
      category: 'molds',
      image: '/images/plastico/marketplace/injection-mold-steel.svg',
    },
    {
      id: 'mkt-3',
      titleAr: 'خامات PP أبيض',
      titleEn: 'White PP Virgin Granules',
      priceDisplay: 'طن / $1,100',
      locationAr: 'السعودية',
      conditionBadge: 'جديدة',
      category: 'raw_materials',
      image: '/images/plastico/marketplace/virgin-polymer-granules.svg',
    },
    {
      id: 'mkt-4',
      titleAr: 'ماتور سيرفو 2kW',
      titleEn: '2kW Industrial Servo Motor',
      priceDisplay: '$2,800',
      locationAr: 'القاهرة - مصر',
      conditionBadge: 'ممتاز',
      category: 'spare_parts',
      image: '/images/plastico/marketplace/plastic-shredder-unit.svg',
    },
    ...market.slice(4).map((m) => ({
      id: m.id,
      titleAr: m.titleAr,
      titleEn: m.titleEn,
      priceDisplay: `$${m.price.toLocaleString()}`,
      locationAr: m.city,
      conditionBadge: m.conditionAr,
      category: m.category,
      image: m.image,
    })),
  ].filter((item) => {
    const matchesCat = catFilter === 'all' || item.category === catFilter;
    const matchesQuery =
      !query.trim() ||
      item.titleAr.toLowerCase().includes(query.toLowerCase()) ||
      item.locationAr.toLowerCase().includes(query.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="space-y-4">
      {/* Search Bar matching Image 5 Screen 03 */}
      <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 border border-slate-200/90 shadow-2xs">
        <Search className="w-5 h-5 text-slate-400 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('ابحث عن منتج، ماكينة، قالب، أو خامة...', 'Search for a product...')}
          className="flex-1 bg-transparent text-sm text-[#0B2A5B] placeholder-slate-400 focus:outline-none"
        />
      </div>

      {/* Circular Category Icon Pills Row matching Image 5 Screen 03 */}
      <div className="grid grid-cols-6 gap-2 py-1">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const active = catFilter === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCatFilter(cat.id)}
              className="flex flex-col items-center gap-1.5 group"
            >
              <div
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border transition-all ${
                  active
                    ? 'bg-[#E8F2FF] border-[#1D6BF3] text-[#0B2A5B] shadow-xs'
                    : 'bg-white border-slate-200 text-[#0B2A5B] group-hover:border-blue-300'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold transition-colors ${
                  active ? 'bg-[#0B5ED7] text-white' : 'text-[#0B2A5B]'
                }`}
              >
                {t(cat.labelAr, cat.labelEn)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCatFilter('all')}
          className="text-xs font-extrabold text-[#1D6BF3] hover:underline"
        >
          {t('عرض الكل', 'View All')}
        </button>
        <span className="text-xs font-bold text-slate-500">
          {signatureProducts.length} {t('منتج متاح', 'products available')}
        </span>
      </div>

      {/* 2-Column Product Grid matching Image 5 Screen 03 */}
      <div className="grid grid-cols-2 gap-3.5 sm:gap-5">
        {signatureProducts.map((item) => {
          const isLiked = likedIds.includes(item.id);
          return (
            <div
              key={item.id}
              onClick={() =>
                showToast(
                  `تم فتح تفاصيل المنتج: ${item.titleAr} — يمكنك طلب عرض سعر مباشر`,
                  `Opened product: ${item.titleEn}`
                )
              }
              className="cursor-pointer bg-white rounded-3xl border border-slate-200/85 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="relative">
                <IndustrialImage
                  src={item.image}
                  alt={item.titleAr}
                  aspectClass="aspect-[4/3]"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLike(item.id);
                  }}
                  aria-label={t('مفضلة', 'Favorite')}
                  className="absolute top-2.5 left-2.5 w-8 h-8 rounded-full bg-white/95 hover:bg-white flex items-center justify-center shadow-xs"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isLiked ? 'text-[#EF4444] fill-[#EF4444]' : 'text-[#0B2A5B]'
                    }`}
                  />
                </button>
              </div>

              <div className="p-3.5 sm:p-4 text-center space-y-1.5">
                <h3 className="text-xs sm:text-sm font-extrabold text-[#0B2A5B] line-clamp-1">
                  {t(item.titleAr, item.titleEn)}
                </h3>
                <div
                  dir="ltr"
                  className="text-sm sm:text-base font-extrabold text-[#16A34A] font-mono-num"
                >
                  {item.priceDisplay}
                </div>
                <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{item.locationAr}</span>
                </div>
                <div className="pt-1">
                  <span className="inline-block px-3.5 py-1 rounded-full bg-slate-100 text-[#0B2A5B] text-[11px] font-bold">
                    {item.conditionBadge}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Prominent Blue CTA Button: + أضف منتج للبيع matching Image 5 Screen 03 */}
      <div className="sticky bottom-20 lg:bottom-4 pt-2">
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="w-full py-4 px-6 rounded-2xl bg-[#0B5ED7] hover:bg-[#094bb0] text-white font-extrabold text-sm sm:text-base shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>{t('أضف منتج للبيع', 'Add Product for Sale')}</span>
        </button>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B2A5B]/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-[#0B2A5B]">
                {t('إضافة منتج أو ماكينة للبيع', 'Add Product or Machine for Sale')}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddProduct} className="space-y-3">
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder={t(
                  'اسم الماكينة أو القالب أو الخامة (مثال: ماكينة حقن 250 طن)',
                  'Product Title'
                )}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-[#0B2A5B]"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="السعر بالدولار ($)"
                  className="px-3.5 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B2A5B]"
                />
                <input
                  type="text"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  placeholder="المدينة - الدولة"
                  className="px-3.5 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B2A5B]"
                />
              </div>
              <select
                value={newCondition}
                onChange={(e) =>
                  setNewCondition(
                    e.target.value as 'جديد' | 'مستعمل بحالة ممتازة' | 'مجدد'
                  )
                }
                className="w-full px-3.5 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B2A5B]"
              >
                <option value="مستعمل بحالة ممتازة">مستعمل بحالة ممتازة</option>
                <option value="جديد">جديد</option>
                <option value="مجدد">مجدد</option>
              </select>
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-[#0B5ED7] text-white font-extrabold text-sm"
              >
                {t('نشر المنتج في السوق', 'Publish in Marketplace')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export const MarketDetailPage: React.FC = () => <MarketListPage />;

/* ============================================================================
   Screen 12: Virtual Exhibition (/app/expo & /app/expo/:id)
   Matches Image 6 (Screen 12)
   ============================================================================ */
export const ExpoListPage: React.FC = () => {
  const { t, expoBooths, showToast } = usePlastico();
  const [filter, setFilter] = useState<'all' | 'factories' | 'suppliers'>('all');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-[#0B2A5B]">
          {t('المعرض الافتراضي', 'Virtual Exhibition')}
        </h1>
      </div>

      {/* Top Filter Pills matching Image 6 Screen 12 */}
      <div className="grid grid-cols-3 gap-2 p-1.5 rounded-full bg-[#E8EEF6] border border-slate-200">
        {[
          { id: 'all', labelAr: 'كل الشركات', labelEn: 'All Companies' },
          { id: 'factories', labelAr: 'مصانع', labelEn: 'Factories' },
          { id: 'suppliers', labelAr: 'موردين', labelEn: 'Suppliers' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id as 'all' | 'factories' | 'suppliers')}
            className={`py-2 px-3 rounded-full text-xs font-extrabold transition-all ${
              filter === tab.id
                ? 'bg-[#0B2A5B] text-white shadow-xs'
                : 'text-[#0B2A5B] hover:text-[#1D6BF3]'
            }`}
          >
            {t(tab.labelAr, tab.labelEn)}
          </button>
        ))}
      </div>

      {/* Exhibition Booth Card matching Image 6 Screen 12 */}
      <div className="space-y-5">
        {[
          {
            id: 'booth-united',
            nameAr: 'الشركة المتحدة للبلاستيك',
            nameEn: 'United Plastics Co.',
            typeAr: 'مصنع',
            rating: '4.8',
            productsCount: '+50 منتج',
            expYears: '+10 سنوات خبرة',
            banner: '/images/plastico/factories/factory-3-packaging.svg',
          },
          ...expoBooths.map((b) => ({
            id: b.id,
            nameAr: b.companyNameAr,
            nameEn: b.companyNameEn,
            typeAr: 'مصنع معتمد',
            rating: '4.9',
            productsCount: '+35 منتج',
            expYears: '+15 سنة خبرة',
            banner: b.bannerImage,
          })),
        ].map((booth) => (
          <div
            key={booth.id}
            className="bg-white rounded-3xl border border-slate-200/85 p-4 sm:p-6 shadow-2xs space-y-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-[#0B2A5B]">
                  {t(booth.nameAr, booth.nameEn)}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1D6BF3] text-xs font-extrabold">
                    {booth.typeAr}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-extrabold text-[#0B2A5B]">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    {booth.rating}
                  </span>
                </div>
              </div>

              <div className="px-3 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-extrabold text-[#059669]">
                UNITED
              </div>
            </div>

            {/* Large 3D Booth Image */}
            <div className="rounded-2xl overflow-hidden border border-slate-200">
              <IndustrialImage
                src={booth.banner}
                alt={booth.nameAr}
                aspectClass="aspect-[16/9]"
              />
            </div>

            {/* 3 Sub-thumbnails matching Image 6 Screen 12 */}
            <div className="grid grid-cols-3 gap-2.5">
              {[
                '/images/plastico/factories/factory-3-packaging.svg',
                '/images/plastico/marketplace/used-injection-machine.svg',
                '/images/plastico/manufacturing/blow-molding-bottles.svg',
              ].map((img, i) => (
                <div
                  key={i}
                  className="rounded-xl overflow-hidden border border-slate-200 aspect-[16/10]"
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>

            {/* Action Buttons: زيارة الجناح & تواصل الآن */}
            <div className="grid grid-cols-12 gap-3 pt-1">
              <button
                type="button"
                onClick={() =>
                  showToast(
                    `مرحباً بك في جناح ${booth.nameAr} — تم فتح الكتالوج التفاعلي`,
                    `Visiting ${booth.nameEn} booth`
                  )
                }
                className="col-span-7 py-3 rounded-full bg-[#0B2A5B] hover:bg-[#133B7A] text-white text-xs sm:text-sm font-extrabold shadow-xs"
              >
                {t('زيارة الجناح', 'Visit Booth')}
              </button>
              <button
                type="button"
                onClick={() =>
                  showToast(
                    `تم إرسال طلب تواصل مباشر إلى ${booth.nameAr}`,
                    `Contact request sent to ${booth.nameEn}`
                  )
                }
                className="col-span-5 py-3 rounded-full bg-[#DCEBFF] hover:bg-blue-200 text-[#0B2A5B] text-xs sm:text-sm font-extrabold"
              >
                {t('تواصل الآن', 'Contact Now')}
              </button>
            </div>

            {/* Footer Stats */}
            <div className="grid grid-cols-2 pt-3 border-t border-slate-100 text-center text-xs font-extrabold text-[#0B2A5B]">
              <div className="border-e border-slate-200">{booth.productsCount}</div>
              <div>{booth.expYears}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ExpoDetailPage: React.FC = () => <ExpoListPage />;

/* ============================================================================
   Screen 16: Industrial News (/app/news & /app/news/:id)
   Matches Image 6 (Screen 16)
   ============================================================================ */
export const NewsListPage: React.FC = () => {
  const { t, news, showToast } = usePlastico();
  const [cat, setCat] = useState('all');

  const newsCards = [
    {
      id: 'n-1',
      titleAr: 'ارتفاع سعر خام PP عالمياً بنسبة 8% هذا الأسبوع',
      titleEn: 'Global PP Resin Prices Rise by 8% This Week',
      dateAr: '27 نوفمبر 2024',
      category: 'prices',
      image: '/images/plastico/marketplace/virgin-polymer-granules.svg',
    },
    {
      id: 'n-2',
      titleAr: 'دخول ماكينة حقن جديدة موفرة للطاقة إلى السوق المصري',
      titleEn: 'New Energy-Saving Injection Machine Enters Egyptian Market',
      dateAr: '27 نوفمبر 2024',
      category: 'tech',
      image: '/images/plastico/marketplace/used-injection-machine.svg',
    },
    ...news.map((n) => ({
      id: n.id,
      titleAr: n.titleAr,
      titleEn: n.titleEn,
      dateAr: n.publishedAt,
      category: 'all',
      image: n.image,
    })),
  ].filter((item) => cat === 'all' || item.category === cat);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold text-[#0B2A5B]">
        {t('الأخبار الصناعية', 'Industrial News')}
      </h1>

      {/* Filter Pills matching Image 6 Screen 16 */}
      <div className="grid grid-cols-3 gap-2 p-1.5 rounded-full bg-[#E8EEF6] border border-slate-200">
        {[
          { id: 'all', labelAr: 'الكل', labelEn: 'All' },
          { id: 'prices', labelAr: 'أسعار خامات', labelEn: 'Resin Prices' },
          { id: 'tech', labelAr: 'تكنولوجيا', labelEn: 'Technology' },
        ].map((pill) => (
          <button
            key={pill.id}
            type="button"
            onClick={() => setCat(pill.id)}
            className={`py-2 px-3 rounded-full text-xs font-extrabold transition-all ${
              cat === pill.id ? 'bg-[#0B2A5B] text-white' : 'text-[#0B2A5B]'
            }`}
          >
            {t(pill.labelAr, pill.labelEn)}
          </button>
        ))}
      </div>

      {/* News Cards matching Image 6 Screen 16 */}
      <div className="space-y-3.5">
        {newsCards.map((item) => (
          <div
            key={item.id}
            onClick={() =>
              showToast(`قراءة التقرير الكامل: ${item.titleAr}`, `Reading: ${item.titleEn}`)
            }
            className="cursor-pointer bg-white rounded-3xl border border-slate-200/85 p-3.5 sm:p-4 shadow-2xs hover:shadow-md transition-all flex items-center justify-between gap-4"
          >
            <div className="flex-1 space-y-2">
              <h2 className="text-sm sm:text-base font-extrabold text-[#1D6BF3] leading-snug">
                {t(item.titleAr, item.titleEn)}
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <Calendar className="w-3.5 h-3.5" />
                <span>{item.dateAr}</span>
              </div>
            </div>

            <div className="w-28 h-24 sm:w-36 sm:h-24 rounded-2xl overflow-hidden border border-slate-200 shrink-0">
              <img src={item.image} alt={item.titleAr} className="w-full h-full object-cover" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const NewsDetailPage: React.FC = () => <NewsListPage />;

/* ============================================================================
   Screens 13 & 14: Visual Search by Photo (/app/visual-search)
   Matches Image 6 (Screens 13 & 14)
   ============================================================================ */
export const VisualSearchPage: React.FC = () => {
  const { t, showToast } = usePlastico();
  const [hasSearched, setHasSearched] = useState(true);
  const [resultTab, setResultTab] = useState<'products' | 'factories' | 'suppliers'>('products');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-[#0B2A5B]">
            {t('البحث بالصورة', 'Visual Search by Photo')}
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {t(
              'صور المنتج البلاستيكي أو القطعة للوصول للمصانع والموردين المطابقين فوراً',
              'Upload a photo of a plastic product or part to find matching factories & suppliers'
            )}
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-[#EF4444] text-white text-xs font-extrabold">
          {t('جديد', 'NEW')}
        </span>
      </div>

      {/* Screen 13: Upload Box matching Image 6 bottom-left */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/85 shadow-2xs space-y-4">
        <div
          onClick={() => {
            setHasSearched(true);
            showToast(
              'تم تحليل صورة المنتج من 3 زوايا بنجاح وعرض المصانع المطابقة!',
              'Product photo analyzed successfully!'
            );
          }}
          className="cursor-pointer rounded-3xl border-2 border-dashed border-[#1D6BF3]/50 bg-[#F4F8FF] hover:bg-blue-50/80 p-8 flex flex-col items-center justify-center text-center gap-3 transition-colors"
        >
          <div className="w-16 h-16 rounded-full bg-white shadow-xs flex items-center justify-center text-[#1D6BF3]">
            <UploadCloud className="w-8 h-8" />
          </div>
          <div className="text-sm sm:text-base font-extrabold text-[#1D6BF3]">
            {t(
              'ارفع صورة المنتج (يفضل من 3 زوايا)',
              'Upload Product Photo (Preferably from 3 Angles)'
            )}
          </div>
          <p className="text-xs text-slate-500">
            {t(
              'ندعم صور العبوات، الأغطية، قطع الغيار، والاسطمبات بصيغة JPG و PNG',
              'Supports bottles, caps, spare parts, and molds'
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setHasSearched(true);
            showToast('تم تحديث نتائج البحث بالصورة!', 'Visual search results updated!');
          }}
          className="w-full py-3.5 rounded-full bg-[#0B2A5B] hover:bg-[#133B7A] text-white font-extrabold text-sm shadow-md"
        >
          {t('إبحث الآن', 'Search Now')}
        </button>
      </div>

      {/* Screen 14: Visual Search Results matching Image 6 bottom-second */}
      {hasSearched && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200/85 shadow-2xs space-y-4">
          <h2 className="text-base font-extrabold text-[#0B2A5B] text-center">
            {t('نتائج البحث المطابقة للصورة', 'Visual Search Matches')}
          </h2>

          <div className="grid grid-cols-3 gap-2 p-1.5 rounded-full bg-[#E8EEF6]">
            {[
              { id: 'products', labelAr: 'منتجات مشابهة', labelEn: 'Similar Products' },
              { id: 'factories', labelAr: 'مصانع', labelEn: 'Factories' },
              { id: 'suppliers', labelAr: 'موردين', labelEn: 'Suppliers' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() =>
                  setResultTab(tab.id as 'products' | 'factories' | 'suppliers')
                }
                className={`py-2 rounded-full text-xs font-extrabold transition-all ${
                  resultTab === tab.id ? 'bg-[#0B2A5B] text-white' : 'text-[#0B2A5B]'
                }`}
              >
                {t(tab.labelAr, tab.labelEn)}
              </button>
            ))}
          </div>

          {/* Visual Product Previews */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3 flex flex-col items-center text-center">
              <img
                src="/images/plastico/manufacturing/blow-molding-bottles.svg"
                alt="Bottles"
                className="w-28 h-28 object-contain"
              />
              <span className="text-xs font-extrabold text-[#0B2A5B] mt-2">
                {t('عبوات HDPE 500 مل (تطابق 96%)', '500ml HDPE Bottles (96% Match)')}
              </span>
            </div>
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3 flex flex-col items-center text-center">
              <img
                src="/images/plastico/manufacturing/injection-molding-service.svg"
                alt="Caps"
                className="w-28 h-28 object-contain"
              />
              <span className="text-xs font-extrabold text-[#0B2A5B] mt-2">
                {t('أغطية عبوات PP فوهة 28 مم', '28mm PP Bottle Caps')}
              </span>
            </div>
          </div>

          {/* Matching Factories Row matching Image 6 Screen 14 */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            {[
              { nameAr: 'المتحدة للبلاستيك', rating: '4.4', code: 'HA' },
              { nameAr: 'النيل للبلاستيك', rating: '4.6', code: 'NILE' },
            ].map((fac) => (
              <Link
                key={fac.nameAr}
                to="/app/manufacturing/providers"
                className="p-3 rounded-2xl bg-[#F8FAFC] border border-slate-200 hover:border-[#1D6BF3] flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-extrabold text-[#0B2A5B]">{fac.nameAr}</div>
                  <div className="flex items-center gap-1 text-xs font-extrabold text-[#0B2A5B] mt-0.5">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>{fac.rating}</span>
                  </div>
                </div>
                <span className="px-2.5 py-1.5 rounded-xl bg-blue-50 text-[#1D6BF3] text-[10px] font-extrabold">
                  {fac.code}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ============================================================================
   Screen 15: Training & Certificates (/app/training)
   Matches Image 6 (Screen 15)
   ============================================================================ */
export const TrainingPage: React.FC = () => {
  const { t, showToast } = usePlastico();
  const [tab, setTab] = useState<'all' | 'mine'>('all');
  const [enrolledIds, setEnrolledIds] = useState<string[]>(['crs-2']);

  const courses = [
    {
      id: 'crs-1',
      titleAr: 'مبادئ تشغيل ماكينات الحقن وضبط الدورة',
      titleEn: 'Injection Molding Operation & Cycle Optimization',
      levelAr: 'مستوى مبتدئ - 6 ساعات',
      image: '/images/plastico/marketplace/used-injection-machine.svg',
    },
    {
      id: 'crs-2',
      titleAr: 'تشخيص أعطال الهيدروليك وصمامات التوجيه',
      titleEn: 'Hydraulic Faults & Directional Valves Diagnostics',
      levelAr: 'مستوى متقدم - 8 ساعات',
      image: '/images/plastico/manufacturing/thermoforming-packaging.svg',
    },
    {
      id: 'crs-3',
      titleAr: 'تصميم وصيانة قوالب واسطمبات الحقن المتعددة',
      titleEn: 'Multi-Cavity Injection Mold Design & Maintenance',
      levelAr: 'مستوى احترافي - 10 ساعات',
      image: '/images/plastico/marketplace/injection-mold-steel.svg',
    },
  ].filter((c) => (tab === 'all' ? true : enrolledIds.includes(c.id)));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <GraduationCap className="w-6 h-6 text-[#F59E0B]" />
        <h1 className="text-xl font-extrabold text-[#0B2A5B]">
          {t('التدريب والكورسات الهندسية', 'Training & Certified Courses')}
        </h1>
      </div>

      {/* Tabs matching Image 6 Screen 15 */}
      <div className="grid grid-cols-2 gap-2 p-1.5 rounded-full bg-[#E8EEF6] border border-slate-200">
        <button
          type="button"
          onClick={() => setTab('all')}
          className={`py-2.5 rounded-full text-xs sm:text-sm font-extrabold transition-all ${
            tab === 'all' ? 'bg-[#0B2A5B] text-white shadow-xs' : 'text-[#0B2A5B]'
          }`}
        >
          {t('جميع الكورسات', 'All Courses')}
        </button>
        <button
          type="button"
          onClick={() => setTab('mine')}
          className={`py-2.5 rounded-full text-xs sm:text-sm font-extrabold transition-all ${
            tab === 'mine' ? 'bg-[#0B2A5B] text-white shadow-xs' : 'text-[#0B2A5B]'
          }`}
        >
          {t('كورساتي', 'My Courses')} ({enrolledIds.length})
        </button>
      </div>

      {/* Course Cards matching Image 6 Screen 15 */}
      <div className="space-y-4">
        {courses.map((crs) => {
          const isEnrolled = enrolledIds.includes(crs.id);
          return (
            <div
              key={crs.id}
              className="bg-white rounded-3xl border border-slate-200/85 overflow-hidden shadow-2xs"
            >
              <IndustrialImage
                src={crs.image}
                alt={crs.titleAr}
                aspectClass="aspect-[16/8]"
              />
              <div className="p-5 text-center space-y-2.5">
                <h2 className="text-base sm:text-lg font-extrabold text-[#0B2A5B]">
                  {t(crs.titleAr, crs.titleEn)}
                </h2>
                <p className="text-xs text-slate-500 font-bold">{crs.levelAr}</p>
                <div>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-[#059669] text-xs font-extrabold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t('شهادة معتمدة', 'Certified Course')}</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!isEnrolled) {
                      setEnrolledIds((prev) => [...prev, crs.id]);
                    }
                    showToast(
                      `تم تسجيلك في كورس: ${crs.titleAr}`,
                      `Enrolled in: ${crs.titleEn}`
                    );
                  }}
                  className={`w-full py-3.5 rounded-full font-extrabold text-sm transition-all ${
                    isEnrolled
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#0B2A5B] hover:bg-[#133B7A] text-white shadow-md'
                  }`}
                >
                  {isEnrolled ? t('متابعة التعلم ✓', 'Continue Course ✓') : t('سجل الآن', 'Enroll Now')}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
