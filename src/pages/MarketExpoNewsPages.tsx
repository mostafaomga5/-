import React, { useState, useMemo, useEffect } from 'react';
import {
  Link,
  useSearchParams,
  useNavigate,
  useParams,
  useLocation,
} from 'react-router-dom';
import {
  Search,
  Heart,
  MapPin,
  Plus,
  Store,
  Star,
  UploadCloud,
  CheckCircle2,
  X,
  GraduationCap,
  Calendar,
  Flag,
  Phone,
  Building2,
  BookOpen,
  Award,
  Clock,
  UserCheck,
  UserPlus,
  Filter,
  Send,
  ThumbsUp,
  MessageSquare,
  Maximize2,
  Camera,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Share2,
} from 'lucide-react';
import { usePlastico, NormalizedMarketItem } from '../context/PlasticoContext';
import { IndustrialImage } from '../components/IndustrialImage';
import {
  MARKETPLACE_15_CATEGORIES,
  AcademyCourseItem,
} from '../data/ecosystemData';
import { IMAGE_MANIFEST } from '../data/imageManifest';
import { VerifiedFactoryBadge } from '../components/VerifiedFactoryBadge';
import { useThemeAndCurrency } from '../components/ThemeAndCurrencyControls';

async function compressImageFileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('تعذر قراءة ملف الصورة من الجهاز.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => resolve(String(reader.result || ''));
      img.onload = () => {
        try {
          const maxDim = 1100;
          let w = img.width || 800;
          let height = img.height || 600;
          if (w > maxDim || height > maxDim) {
            if (w > height) {
              height = Math.round((height * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(String(reader.result || ''));
            return;
          }
          ctx.drawImage(img, 0, 0, w, height);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        } catch {
          resolve(String(reader.result || ''));
        }
      };
      img.src = String(reader.result || '');
    };
    reader.readAsDataURL(file);
  });
}

const CATEGORY_3D_ICON_MAP: Record<string, string> = {
  injection_machines: IMAGE_MANIFEST.icons3d.injection,
  blow_machines: IMAGE_MANIFEST.icons3d.blow,
  extrusion_lines: IMAGE_MANIFEST.icons3d.extrusion,
  film_lines: IMAGE_MANIFEST.icons3d.film,
  thermoforming_machines: IMAGE_MANIFEST.icons3d.thermoforming,
  rotational_machines: IMAGE_MANIFEST.icons3d.rotomolding,
  recycling_lines: IMAGE_MANIFEST.icons3d.recycling,
  molds: IMAGE_MANIFEST.icons3d.molds,
  raw_materials: IMAGE_MANIFEST.icons3d.rawMaterials,
  additives_masterbatch: IMAGE_MANIFEST.icons3d.rawMaterials,
  printing_packaging: IMAGE_MANIFEST.icons3d.printing,
  qc_testing: IMAGE_MANIFEST.icons3d.qualityControl,
  heaters: IMAGE_MANIFEST.icons3d.compression,
};

/* ============================================================================
   INDUSTRIAL MARKETPLACE & USED EQUIPMENT MARKETPLACE (/app/market & /app/market/:id)
   Covers all 15 categories, Multi-Image Galleries, Lightbox Zoom, Likes,
   Database-Backed Favorites, Follow Seller, and Direct In-App Chat
   ============================================================================ */
export const MarketListPage: React.FC = () => {
  const {
    t,
    market,
    createMarketItem,
    reportMarketItem,
    savedIds,
    toggleSavedItem,
    isLiked,
    getLikeCount,
    toggleLike,
    isFollowing,
    toggleFollow,
    startOrOpenConversation,
    openLightbox,
    isAuthenticated,
    realUser,
    csrfToken,
    showToast,
    guardVisitorAction,
  } = usePlastico();
  const { formatPrice, currency } = useThemeAndCurrency();
  const [searchParams, setSearchParams] = useSearchParams();
  const params = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const routeDefaultCategory = location.pathname.includes('/market/machinery')
    ? 'injection_machines'
    : location.pathname.includes('/market/raw-materials')
      ? 'raw_materials'
      : location.pathname.includes('/market/molds-spares')
        ? 'molds'
        : 'all';

  const activeCategory = searchParams.get('category') || routeDefaultCategory;
  const initialQuery = searchParams.get('q') || '';
  const initialCondition = searchParams.get('condition') || 'all';

  const [query, setQuery] = useState(initialQuery);
  const [conditionFilter, setConditionFilter] = useState<string>(initialCondition);
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [selectedListing, setSelectedListing] =
    useState<NormalizedMarketItem | null>(null);
  const [activeGalleryIdx, setActiveGalleryIdx] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);

  // Listing Comments & Replies State
  const [listingComments, setListingComments] = useState<any[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [replyToCommentId, setReplyToCommentId] = useState<number | null>(null);

  useEffect(() => {
    if (!selectedListing) {
      setListingComments([]);
      return;
    }
    fetch(`/api/comments?itemType=market&itemId=${encodeURIComponent(selectedListing.id)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (Array.isArray(data?.comments)) {
          setListingComments(data.comments);
        }
      })
      .catch(() => {});
  }, [selectedListing]);

  // Sync URL query & condition params when navigating from Smart Assistant or links
  useEffect(() => {
    const urlQ = searchParams.get('q');
    const urlCond = searchParams.get('condition');
    if (urlQ !== null) setQuery(urlQ);
    if (urlCond !== null) setConditionFilter(urlCond);
  }, [searchParams]);

  // If navigated to /app/market/:id, open that listing automatically
  useEffect(() => {
    if (params.id) {
      const found = market.find((m) => m.id === params.id);
      if (found) {
        setSelectedListing(found);
        setActiveGalleryIdx(0);
      }
    }
  }, [params.id, market]);

  // New Listing Form with Real Device / Camera Multi-Photo Upload
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('injection_machines');
  const [newConditionCode, setNewConditionCode] = useState<
    'new' | 'used_excellent' | 'used_good' | 'needs_maintenance'
  >('used_excellent');
  const [newManufacturer, setNewManufacturer] = useState('Haitian');
  const [newModel, setNewModel] = useState('MA-2500');
  const [newYear, setNewYear] = useState(2024);
  const [newPrice, setNewPrice] = useState('18500');
  const [newCurrency, setNewCurrency] = useState<string>(currency || 'EGP');
  const [newCity, setNewCity] = useState(realUser?.city || 'العاشر من رمضان');
  const [newCountry, setNewCountry] = useState(realUser?.country || 'مصر');
  const [uploadedListingImages, setUploadedListingImages] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (currency) setNewCurrency(currency);
  }, [currency]);

  const handleUploadListingFiles = async (
    e: React.ChangeEvent<HTMLInputElement>,
    replaceIndex?: number
  ) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    setUploadError(null);
    setUploadProgress(20);

    const files = Array.from(fileList).slice(0, 8);
    const validDataUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (!f.type.startsWith('image/')) {
        setUploadError('يرجى اختيار ملفات صور صالحة فقط (JPG, PNG, WEBP).');
        continue;
      }
      if (f.size > 12 * 1024 * 1024) {
        setUploadError('حجم الصورة يتجاوز الحد الأقصى المسموح (12 ميجابايت).');
        continue;
      }
      try {
        const dataUrl = await compressImageFileToDataUrl(f);
        if (dataUrl) validDataUrls.push(dataUrl);
        setUploadProgress(Math.min(95, Math.round(((i + 1) / files.length) * 90)));
      } catch {
        setUploadError('حدث خطأ أثناء معالجة إحدى الصور. يرجى إعادة المحاولة.');
      }
    }

    if (validDataUrls.length > 0) {
      if (typeof replaceIndex === 'number') {
        setUploadedListingImages((prev) =>
          prev.map((img, idx) => (idx === replaceIndex ? validDataUrls[0] : img))
        );
      } else {
        setUploadedListingImages((prev) => [...prev, ...validDataUrls].slice(0, 8));
      }
      setUploadProgress(100);
    } else {
      setUploadProgress(0);
    }
    e.target.value = '';
  };

  const handleReorderListingImage = (idx: number, dir: -1 | 1) => {
    setUploadedListingImages((prev) => {
      const target = idx + dir;
      if (target < 0 || target >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[idx];
      copy[idx] = copy[target];
      copy[target] = temp;
      return copy;
    });
  };

  const conditionLabels: Record<
    string,
    { ar: string; en: string; badgeClass: string }
  > = {
    new: {
      ar: 'جديد',
      en: 'New',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    used_excellent: {
      ar: 'مستعمل — حالة ممتازة',
      en: 'Used — Excellent Condition',
      badgeClass: 'bg-blue-50 text-[#1769E8] border-blue-200',
    },
    used_good: {
      ar: 'مستعمل — حالة جيدة',
      en: 'Used — Good Condition',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    needs_maintenance: {
      ar: 'يحتاج صيانة',
      en: 'Needs Maintenance',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    },
  };

  const filteredItems = useMemo(() => {
    return market.filter((item) => {
      if (activeCategory === 'used_equipment') {
        if (!item.isUsed && item.conditionCode === 'new') return false;
      } else if (activeCategory !== 'all') {
        if (item.category !== activeCategory) return false;
      }

      if (conditionFilter === 'used') {
        if (!item.isUsed && item.conditionCode === 'new') return false;
      } else if (conditionFilter !== 'all' && item.conditionCode !== conditionFilter) {
        return false;
      }

      if (
        countryFilter !== 'all' &&
        item.country !== countryFilter &&
        !item.city.includes(countryFilter)
      ) {
        return false;
      }

      if (query.trim()) {
        const q = query.toLowerCase();
        const matchTitle =
          item.titleAr.toLowerCase().includes(q) ||
          item.titleEn.toLowerCase().includes(q);
        const matchBrand =
          item.brand.toLowerCase().includes(q) ||
          item.model.toLowerCase().includes(q);
        const matchCity = item.city.toLowerCase().includes(q);
        if (!matchTitle && !matchBrand && !matchCity) return false;
      }
      return true;
    });
  }, [market, activeCategory, conditionFilter, countryFilter, query]);

  const handlePublishListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const condObj = conditionLabels[newConditionCode] || conditionLabels.new;
    const defaultCategoryImg =
      newCategory === 'heaters' || newCategory === 'extrusion_lines'
        ? IMAGE_MANIFEST.marketplace.extrusionPipeLine
        : newCategory === 'blow_machines'
        ? IMAGE_MANIFEST.marketplace.blowMoldingMachine
        : newCategory === 'film_lines'
        ? IMAGE_MANIFEST.marketplace.blownFilmTower
        : newCategory === 'raw_materials' || newCategory === 'additives_masterbatch'
        ? IMAGE_MANIFEST.marketplace.granulesBlueOrange
        : newCategory === 'molds'
        ? IMAGE_MANIFEST.marketplace.precisionMoldCutout
        : IMAGE_MANIFEST.marketplace.injectionMachineStudio;

    const finalImages =
      uploadedListingImages.length > 0 ? uploadedListingImages : [defaultCategoryImg];

    createMarketItem({
      titleAr: newTitle.trim(),
      titleEn: newTitle.trim(),
      category: newCategory,
      conditionAr: condObj.ar,
      conditionCode: newConditionCode,
      isUsed: newConditionCode !== 'new',
      manufacturer: newManufacturer,
      model: newModel,
      year: newYear,
      price: Number(newPrice) || 1000,
      currency: newCurrency || currency || 'EGP',
      city: newCity,
      country: newCountry,
      image: finalImages[0],
      images: finalImages,
    });
    setNewTitle('');
    setUploadedListingImages([]);
    setUploadProgress(0);
    setUploadError(null);
    setShowAddModal(false);
  };

  const handleContactSellerChat = async (item: NormalizedMarketItem) => {
    const sellerKey = item.sellerId || `seller-${item.id}`;
    const formattedPrice = formatPrice(item.price, item.currency);
    const convId = await startOrOpenConversation({
      targetKey: sellerKey,
      targetNameAr: item.sellerNameAr,
      targetRoleAr: item.sellerTypeAr,
      targetAvatar: item.sellerAvatar || IMAGE_MANIFEST.profiles.supplierTrader,
      contextType: 'market',
      contextId: item.id,
      contextTitleAr: `${item.titleAr} — ${formattedPrice} (${item.city})`,
    });
    if (convId) {
      setSelectedListing(null);
      const openingMsg = 'مرحبًا، أنا مهتم بالإعلان ده. ممكن أعرف تفاصيل أكتر؟';
      navigate(
        `/app/messages?convId=${convId}&listingId=${encodeURIComponent(
          item.id
        )}&prefill=${encodeURIComponent(openingMsg)}`
      );
    }
  };

  const handlePostListingComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListing || !newCommentText.trim()) return;
    if (!guardVisitorAction('إضافة تعليق على الإعلان')) return;
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
        },
        body: JSON.stringify({
          itemType: 'market',
          itemId: selectedListing.id,
          parentId: replyToCommentId,
          content: newCommentText.trim(),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.comments)) {
          setListingComments(data.comments);
        }
        setNewCommentText('');
        setReplyToCommentId(null);
        showToast('تم نشر تعليقك بنجاح!', 'Comment posted!');
      }
    } catch {
      showToast('تعذر نشر التعليق حالياً.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-[#071A33] text-white p-5 sm:p-7 border border-[#1769E8]/30 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#1769E8]/20 border border-[#27BED6]/30 text-[#27BED6] text-xs font-extrabold">
              <Store className="w-4 h-4" />
              <span>
                {t(
                  'السوق الصناعي وسوق المعدات المستعملة',
                  'Industrial Marketplace & Used Equipment'
                )}
              </span>
            </div>
            <h1 className="text-xl sm:text-3xl font-extrabold text-white">
              {t(
                'الماكينات، الخامات، السخانات، المعدات المساعدة، والمستعمل المضمون',
                'Machinery, Raw Materials, Heaters, Auxiliary & Verified Used Gear'
              )}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              {t(
                'افتح الصور بالحجم الكامل مع التكبير، احفظ في المفضلة، وتواصل مباشرة مع البائع عبر الدردشة الفورية.',
                'Zoom high-resolution photos, save to favorites, and chat directly with verified sellers.'
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!guardVisitorAction('نشر إعلان في السوق الصناعي')) {
                return;
              }
              setShowAddModal(true);
            }}
            className="px-5 py-3 rounded-xl bg-[#FF8A2A] hover:bg-[#F07B1A] text-white text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-md transition-colors shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('أضف معدة أو خامة للبيع', 'Post Equipment or Material')}</span>
          </button>
        </div>

        {/* Search & Compact Filters Row */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-[#718096] absolute top-1/2 -translate-y-1/2 start-3.5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t(
                'ابحث عن ماكينة حقن، سخانات، شيلر، قالب، أو خامة بوليمر...',
                'Search injection machine, heaters, chiller, mold, or resin...'
              )}
              className="w-full bg-white text-[#13243B] placeholder-[#718096] rounded-xl ps-10 pe-4 py-2.5 text-xs sm:text-sm font-semibold focus:outline-none"
            />
          </div>

          <div className="sm:col-span-3 flex items-center gap-2 bg-white/10 border border-white/15 rounded-xl px-3 py-2">
            <Filter className="w-4 h-4 text-[#27BED6] shrink-0" />
            <select
              aria-label={t('حالة المعدة', 'Condition Filter')}
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value)}
              className="w-full bg-transparent text-white text-xs font-bold focus:outline-none"
            >
              <option value="all" className="text-[#13243B]">
                {t('جميع الحالات (جديد ومستعمل)', 'All Conditions')}
              </option>
              <option value="new" className="text-[#13243B]">
                {t('جديد (New)', 'New')}
              </option>
              <option value="used_excellent" className="text-[#13243B]">
                {t('مستعمل — حالة ممتازة', 'Used — Excellent')}
              </option>
              <option value="used_good" className="text-[#13243B]">
                {t('مستعمل — حالة جيدة', 'Used — Good')}
              </option>
              <option value="needs_maintenance" className="text-[#13243B]">
                {t('يحتاج صيانة', 'Needs Maintenance')}
              </option>
            </select>
          </div>

          <div className="sm:col-span-3 flex items-center gap-2 bg-white/10 border border-white/15 rounded-xl px-3 py-2">
            <MapPin className="w-4 h-4 text-[#FF8A2A] shrink-0" />
            <select
              aria-label={t('الدولة', 'Country Filter')}
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="w-full bg-transparent text-white text-xs font-bold focus:outline-none"
            >
              <option value="all" className="text-[#13243B]">
                {t('كل الدول والمدن', 'All Locations')}
              </option>
              <option value="مصر" className="text-[#13243B]">
                {t('مصر', 'Egypt')}
              </option>
              <option value="السعودية" className="text-[#13243B]">
                {t('السعودية', 'Saudi Arabia')}
              </option>
              <option value="الإمارات" className="text-[#13243B]">
                {t('الإمارات', 'UAE')}
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Compact 15-Category Filter Bar with 3D Industrial Icons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {MARKETPLACE_15_CATEGORIES.map((cat) => {
          const active = activeCategory === cat.id;
          const icon3d = CATEGORY_3D_ICON_MAP[cat.id];
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                if (cat.id === 'all') {
                  setSearchParams({});
                } else {
                  setSearchParams({ category: cat.id });
                }
              }}
              className={`px-3 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-colors border flex items-center gap-2 cursor-pointer ${
                active
                  ? 'bg-[#1769E8] text-white border-[#1769E8] shadow-xs'
                  : 'bg-white text-[#13243B] border-[#DFE7F1] hover:border-[#1769E8]'
              }`}
            >
              {icon3d && (
                <img
                  src={icon3d}
                  alt=""
                  className="w-5 h-5 rounded-md object-contain bg-white/90 p-0.5 shrink-0"
                />
              )}
              <span>{t(cat.labelAr, cat.labelEn)}</span>
            </button>
          );
        })}
      </div>

      {/* Listings Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#DFE7F1] p-10 text-center space-y-3">
          <p className="text-sm font-bold text-[#13243B]">
            {t(
              'لا توجد عروض مطابقة لهذا الفلتر حالياً.',
              'No listings match the selected filter.'
            )}
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchParams({});
              setConditionFilter('all');
              setCountryFilter('all');
              setQuery('');
            }}
            className="px-4 py-2 rounded-xl bg-[#1769E8] text-white text-xs font-extrabold"
          >
            {t('إعادة ضبط الفلاتر', 'Reset Filters')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const isSaved = savedIds.includes(item.id);
            const liked = isLiked('market', item.id);
            const likeCount = getLikeCount('market', item.id, item.likesCount || 18);
            const sellerKey = item.sellerId || `seller-${item.id}`;
            const followingSeller = isFollowing(sellerKey);
            const itemImages =
              item.images && item.images.length > 0 ? item.images : [item.image];
            const cond =
              conditionLabels[item.conditionCode || 'new'] || conditionLabels.new;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-[#DFE7F1] overflow-hidden shadow-2xs hover:border-[#1769E8]/50 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Image Container with Lightbox Trigger & Favorite Button */}
                  <div className="relative group">
                    <div
                      onClick={() => openLightbox(itemImages, 0, item.titleAr)}
                      className="cursor-zoom-in"
                    >
                      <IndustrialImage
                        src={item.image}
                        alt={item.titleAr}
                        aspectClass="aspect-[16/10]"
                      />
                    </div>

                    {/* Top Right / End: Save to Favorites Heart Button */}
                    <button
                      type="button"
                      onClick={() =>
                        toggleSavedItem(item.id, {
                          itemType: 'market',
                          titleAr: item.titleAr,
                          route: `/app/market/${item.id}`,
                        })
                      }
                      aria-label={t('حفظ في المفضلة', 'Save item')}
                      className="absolute top-3 end-3 w-9 h-9 rounded-xl bg-white/95 hover:bg-white flex items-center justify-center shadow-md cursor-pointer transition-transform active:scale-95"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          isSaved
                            ? 'text-rose-600 fill-rose-600'
                            : 'text-[#13243B]'
                        }`}
                      />
                    </button>

                    {/* Top Left / Start: Multi-Image Zoom Badge */}
                    <button
                      type="button"
                      onClick={() => openLightbox(itemImages, 0, item.titleAr)}
                      className="absolute top-3 start-3 px-2.5 py-1 rounded-lg bg-[#071A33]/85 hover:bg-[#1769E8] text-white text-[11px] font-extrabold flex items-center gap-1 shadow-md cursor-pointer"
                      title={t('تكبير الصور', 'Zoom Photos')}
                    >
                      <Maximize2 className="w-3 h-3" />
                      <span>
                        {itemImages.length > 1
                          ? `${itemImages.length} ${t('صور', 'Photos')}`
                          : t('تكبير', 'Zoom')}
                      </span>
                    </button>

                    <div className="absolute bottom-2.5 start-2.5 flex flex-wrap gap-1.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[11px] font-extrabold border ${cond.badgeClass}`}
                      >
                        {t(cond.ar, cond.en)}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] text-[#718096] font-bold">
                      <span>
                        {item.brand} · {item.model} ({item.year})
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#1769E8]" />
                        {item.city}
                      </span>
                    </div>

                    <h2
                      onClick={() => {
                        setSelectedListing(item);
                        setActiveGalleryIdx(0);
                      }}
                      className="text-sm sm:text-base font-extrabold text-[#13243B] hover:text-[#1769E8] line-clamp-2 leading-snug cursor-pointer"
                    >
                      {t(item.titleAr, item.titleEn)}
                    </h2>

                    <div className="flex items-center justify-between">
                      <div
                        className="text-base font-extrabold text-[#1769E8] font-mono-num"
                        data-testid={`market-price-${item.id}`}
                      >
                        {t(
                          formatPrice(item.price, item.currency).formattedAr,
                          formatPrice(item.price, item.currency).formattedEn
                        )}
                      </div>

                      {/* Like Button with Live Counter */}
                      <button
                        type="button"
                        onClick={() => void toggleLike('market', item.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-extrabold inline-flex items-center gap-1 border transition-colors cursor-pointer ${
                          liked
                            ? 'bg-blue-50 text-[#1769E8] border-blue-200'
                            : 'bg-[#F4F7FC] text-[#718096] border-[#DFE7F1] hover:text-[#13243B]'
                        }`}
                      >
                        <ThumbsUp
                          className={`w-3.5 h-3.5 ${liked ? 'fill-[#1769E8]' : ''}`}
                        />
                        <span className="font-mono-num">{likeCount}</span>
                      </button>
                    </div>

                    <p className="text-xs text-[#718096] line-clamp-2">
                      {item.descriptionAr}
                    </p>

                    {/* Seller Mini Row with Clickable Profile Link & Follow Button */}
                    <div className="pt-2 border-t border-[#DFE7F1]/70 flex items-center justify-between gap-2">
                      <Link
                        to={`/app/profile/${encodeURIComponent(sellerKey)}`}
                        className="flex items-center gap-2 min-w-0 group/seller hover:text-[#1769E8]"
                      >
                        <img
                          src={
                            item.sellerAvatar ||
                            IMAGE_MANIFEST.profiles.supplierTrader
                          }
                          alt={item.sellerNameAr}
                          className="w-7 h-7 rounded-full object-cover border border-[#DFE7F1] shrink-0"
                        />
                        <span className="text-[11px] font-bold text-[#13243B] group-hover/seller:text-[#1769E8] group-hover/seller:underline truncate">
                          {item.sellerNameAr}
                        </span>
                      </Link>
                      <button
                        type="button"
                        onClick={() =>
                          void toggleFollow({
                            targetId: sellerKey,
                            targetType: 'seller',
                            targetNameAr: item.sellerNameAr,
                            targetRoleAr: item.sellerTypeAr,
                            targetAvatar:
                              item.sellerAvatar ||
                              IMAGE_MANIFEST.profiles.supplierTrader,
                          })
                        }
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold shrink-0 transition-colors cursor-pointer ${
                          followingSeller
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-[#F4F7FC] hover:bg-slate-200 text-[#1769E8]'
                        }`}
                      >
                        {followingSeller
                          ? t('✓ متابَع', '✓ Following')
                          : t('+ متابعة', '+ Follow')}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card Bottom Actions */}
                <div className="p-4 pt-2.5 border-t border-[#DFE7F1] flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedListing(item);
                      setActiveGalleryIdx(0);
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#F4F7FC] hover:bg-slate-200/70 text-[#13243B] text-xs font-extrabold transition-colors cursor-pointer"
                  >
                    {t('المواصفات والصور', 'Specs & Photos')}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleContactSellerChat(item)}
                    className="py-2 px-3.5 rounded-xl bg-[#1769E8] hover:bg-[#1258C7] text-white text-xs font-extrabold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{t('تواصل مع البائع', 'Contact Seller')}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Listing Detail, Multi-Image Gallery & Seller Contact Modal */}
      {selectedListing && (
        <div
          onClick={() => setSelectedListing(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071A33]/65 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl border border-[#DFE7F1] max-w-2xl w-full p-5 sm:p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-extrabold text-[#1769E8]">
                  {selectedListing.brand} — {selectedListing.model} (
                  {selectedListing.year})
                </span>
                <h3 className="text-base sm:text-lg font-extrabold text-[#13243B] mt-0.5">
                  {t(selectedListing.titleAr, selectedListing.titleEn)}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedListing(null)}
                className="p-1.5 rounded-lg text-[#718096] hover:bg-[#F4F7FC] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Multi-Image Gallery with Lightbox Trigger */}
            {(() => {
              const gallery =
                selectedListing.images && selectedListing.images.length > 0
                  ? selectedListing.images
                  : [selectedListing.image];
              const currentImg = gallery[activeGalleryIdx] || gallery[0];
              return (
                <div className="space-y-2.5">
                  <div
                    onClick={() =>
                      openLightbox(
                        gallery,
                        activeGalleryIdx,
                        selectedListing.titleAr
                      )
                    }
                    className="relative rounded-xl overflow-hidden border border-[#DFE7F1] cursor-zoom-in group"
                  >
                    <IndustrialImage
                      src={currentImg}
                      alt={selectedListing.titleAr}
                      aspectClass="aspect-[16/9]"
                    />
                    <span className="absolute bottom-3 end-3 px-3 py-1.5 rounded-xl bg-[#071A33]/90 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-lg">
                      <Maximize2 className="w-3.5 h-3.5 text-[#27BED6]" />
                      <span>
                        {t('اضغط لتكبير الصورة', 'Click to Zoom')} (
                        {activeGalleryIdx + 1}/{gallery.length})
                      </span>
                    </span>
                  </div>

                  {gallery.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {gallery.map((imgUrl, idx) => (
                        <button
                          key={`${imgUrl}-${idx}`}
                          type="button"
                          onClick={() => setActiveGalleryIdx(idx)}
                          className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                            idx === activeGalleryIdx
                              ? 'border-[#1769E8] scale-105'
                              : 'border-[#DFE7F1] opacity-70 hover:opacity-100'
                          }`}
                        >
                          <IndustrialImage
                            src={imgUrl}
                            alt={`صورة ${idx + 1}`}
                            aspectRatio="aspect-square"
                            className="w-full h-full"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1]">
                <span className="text-[#718096] block">{t('السعر', 'Price')}</span>
                <span className="font-extrabold text-[#1769E8] font-mono-num text-sm">
                  {t(
                    formatPrice(selectedListing.price, selectedListing.currency).formattedAr,
                    formatPrice(selectedListing.price, selectedListing.currency).formattedEn
                  )}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1]">
                <span className="text-[#718096] block">
                  {t('الحالة الفنية', 'Condition')}
                </span>
                <span className="font-extrabold text-[#13243B]">
                  {selectedListing.conditionAr}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1]">
                <span className="text-[#718096] block">
                  {t('الموقع', 'Location')}
                </span>
                <span className="font-extrabold text-[#13243B]">
                  {selectedListing.city}
                </span>
              </div>
            </div>

            {/* Technical Specifications */}
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold text-[#071A33]">
                {t('المواصفات الفنية الكاملة:', 'Technical Specifications:')}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(selectedListing.specsAr || {}).map(([k, v]) => (
                  <div
                    key={k}
                    className="p-2.5 rounded-lg bg-[#F4F7FC] border border-[#DFE7F1] text-xs flex items-center justify-between"
                  >
                    <span className="text-[#718096] font-medium">{k}:</span>
                    <span className="font-extrabold text-[#13243B]">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#13243B] leading-relaxed">
              {selectedListing.descriptionAr}
            </p>

            {/* Seller Profile & Direct Actions */}
            <div className="p-4 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <Link
                to={`/app/profile/${encodeURIComponent(
                  selectedListing.sellerId || `seller-${selectedListing.id}`
                )}`}
                onClick={() => setSelectedListing(null)}
                className="flex items-center gap-3 group/prof"
              >
                <img
                  src={
                    selectedListing.sellerAvatar ||
                    IMAGE_MANIFEST.profiles.supplierTrader
                  }
                  alt={selectedListing.sellerNameAr}
                  className="w-11 h-11 rounded-xl object-cover border border-[#DFE7F1]"
                />
                <div>
                  <div className="text-xs sm:text-sm font-extrabold text-[#13243B] group-hover/prof:text-[#1769E8] group-hover/prof:underline">
                    {selectedListing.sellerNameAr}
                  </div>
                  <div className="text-[11px] text-[#718096]">
                    {selectedListing.sellerTypeAr} · {selectedListing.city} ·{' '}
                    <span className="text-[#1769E8] font-bold">
                      {t('عرض الملف الشخصي', 'View Profile')}
                    </span>
                  </div>
                </div>
              </Link>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => void handleContactSellerChat(selectedListing)}
                  className="px-4 py-2 rounded-xl bg-[#1769E8] hover:bg-[#1258C7] text-white text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{t('تواصل مع البائع', 'Contact Seller')}</span>
                </button>
                <a
                  href={`tel:${selectedListing.sellerPhone}`}
                  className="px-3.5 py-2 rounded-xl bg-white border border-[#DFE7F1] text-[#13243B] text-xs font-extrabold inline-flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-[#1769E8]" />
                  <span className="font-mono-num">{selectedListing.sellerPhone}</span>
                </a>
              </div>
            </div>

            {/* Other Products from This Seller (منتجات أخرى للبائع) */}
            {(() => {
              const otherSellerItems = market
                .filter(
                  (m) =>
                    m.id !== selectedListing.id &&
                    (m.sellerId === selectedListing.sellerId ||
                      m.sellerNameAr === selectedListing.sellerNameAr ||
                      m.category === selectedListing.category)
                )
                .slice(0, 3);
              if (otherSellerItems.length === 0) return null;
              return (
                <div
                  data-testid="other-seller-products"
                  className="p-4 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] space-y-2.5"
                >
                  <h4 className="text-xs font-extrabold text-[#071A33]">
                    {t('منتجات وعروض أخرى من نفس البائع / القسم:', 'Other Products from Seller:')}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {otherSellerItems.map((other) => (
                      <button
                        key={other.id}
                        type="button"
                        onClick={() => {
                          setSelectedListing(other);
                          setActiveGalleryIdx(0);
                        }}
                        className="p-2.5 rounded-xl bg-white hover:border-[#1769E8] border border-[#DFE7F1] text-right flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <img
                          src={other.image}
                          alt={other.titleAr}
                          className="w-12 h-12 rounded-lg object-cover border border-[#DFE7F1] shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-[11px] font-extrabold text-[#13243B] truncate">
                            {other.titleAr}
                          </div>
                          <div className="text-[11px] font-black text-[#1769E8] font-mono-num mt-0.5">
                            {formatPrice(other.price, other.currency).formattedAr}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Real Comments & Replies on Listing */}
            <div className="p-4 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-[#071A33]">
                  {t('التعليقات والاستفسارات العامة', 'Public Comments & Inquiries')} (
                  {listingComments.length})
                </h4>
                {replyToCommentId && (
                  <button
                    type="button"
                    onClick={() => setReplyToCommentId(null)}
                    className="text-[11px] font-bold text-rose-600 cursor-pointer"
                  >
                    {t('إلغاء الرد', 'Cancel Reply')}
                  </button>
                )}
              </div>

              {listingComments.length > 0 && (
                <div className="space-y-2 max-h-44 overflow-y-auto">
                  {listingComments.map((c) => (
                    <div
                      key={c.id}
                      className={`p-2.5 rounded-xl bg-white border border-[#DFE7F1] text-xs space-y-1 ${
                        c.parentId ? 'ms-5 border-s-2 border-s-[#1769E8]' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <Link
                          to={`/app/profile/${encodeURIComponent(c.authorProfileKey || `usr-${c.userId}`)}`}
                          onClick={() => setSelectedListing(null)}
                          className="font-extrabold text-[#13243B] hover:text-[#1769E8] hover:underline"
                        >
                          {c.authorName}
                        </Link>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-[#718096]">{c.createdAt}</span>
                          <button
                            type="button"
                            onClick={() => setReplyToCommentId(c.id)}
                            className="text-[11px] font-extrabold text-[#1769E8] cursor-pointer"
                          >
                            {t('رد', 'Reply')}
                          </button>
                        </div>
                      </div>
                      <p className="text-[#4A5B73]">{c.content}</p>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handlePostListingComment} className="flex gap-2">
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder={
                    replyToCommentId
                      ? t('اكتب ردك على التعليق...', 'Write your reply...')
                      : t('اكتب استفساراً أو تعليقاً على الإعلان...', 'Write a comment...')
                  }
                  className="flex-1 bg-white border border-[#DFE7F1] rounded-xl px-3 py-2 text-xs"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#071A33] text-white text-xs font-extrabold cursor-pointer"
                >
                  {t('تعليق', 'Comment')}
                </button>
              </form>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#DFE7F1]">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    toggleSavedItem(selectedListing.id, {
                      itemType: 'market',
                      titleAr: selectedListing.titleAr,
                      route: `/app/market/${selectedListing.id}`,
                    })
                  }
                  className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#13243B] hover:text-rose-600 cursor-pointer"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      savedIds.includes(selectedListing.id)
                        ? 'text-rose-600 fill-rose-600'
                        : ''
                    }`}
                  />
                  <span>
                    {savedIds.includes(selectedListing.id)
                      ? t('محفوظ في المفضلة', 'Saved in Favorites')
                      : t('إضافة للمفضلة', 'Add to Favorites')}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const url = `${window.location.origin}/app/market/${selectedListing.id}`;
                    navigator.clipboard?.writeText(url).catch(() => {});
                    showToast('تم نسخ رابط الإعلان للمشاركة', 'Listing link copied');
                  }}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#1769E8] hover:underline cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{t('مشاركة', 'Share')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => void reportMarketItem(selectedListing.id)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>{t('إبلاغ', 'Report')}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedListing(null)}
                className="px-5 py-2 rounded-xl bg-[#071A33] text-white text-xs font-extrabold cursor-pointer"
              >
                {t('إغلاق', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Marketplace Listing Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071A33]/60 backdrop-blur-xs">
          <form
            onSubmit={handlePublishListing}
            className="bg-white rounded-2xl border border-[#DFE7F1] max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-extrabold text-[#13243B]">
                {t(
                  'إضافة عرض جديد في السوق الصناعي',
                  'Publish New Marketplace Listing'
                )}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-[#718096]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#13243B] mb-1">
                  {t('عنوان المعدة أو الخامة', 'Listing Title')} *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={t(
                    'مثال: ماكينة حقن Haitian 250 طن سيرفو',
                    'e.g., Haitian 250T Servo Injection Machine'
                  )}
                  className="w-full input-3d rounded-xl px-3.5 py-2.5 text-xs sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#13243B] mb-1">
                    {t('القسم الصناعي', 'Category')}
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full input-3d rounded-xl px-3 py-2.5 text-xs font-bold"
                  >
                    {MARKETPLACE_15_CATEGORIES.filter((c) => c.id !== 'all').map(
                      (cat) => (
                        <option key={cat.id} value={cat.id}>
                          {t(cat.labelAr, cat.labelEn)}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#13243B] mb-1">
                    {t('حالة المعدة', 'Condition')}
                  </label>
                  <select
                    value={newConditionCode}
                    onChange={(e) => setNewConditionCode(e.target.value as any)}
                    className="w-full input-3d rounded-xl px-3 py-2.5 text-xs font-bold"
                  >
                    <option value="new">{t('جديد', 'New')}</option>
                    <option value="used_excellent">
                      {t('مستعمل — حالة ممتازة', 'Used — Excellent')}
                    </option>
                    <option value="used_good">
                      {t('مستعمل — حالة جيدة', 'Used — Good')}
                    </option>
                    <option value="needs_maintenance">
                      {t('يحتاج صيانة', 'Needs Maintenance')}
                    </option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-[#13243B] mb-1">
                    {t('الشركة المصنعة', 'Manufacturer')}
                  </label>
                  <input
                    type="text"
                    value={newManufacturer}
                    onChange={(e) => setNewManufacturer(e.target.value)}
                    className="w-full input-3d rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#13243B] mb-1">
                    {t('الموديل', 'Model')}
                  </label>
                  <input
                    type="text"
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    className="w-full input-3d rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#13243B] mb-1">
                    {t('سنة الصنع', 'Year')}
                  </label>
                  <input
                    type="number"
                    value={newYear}
                    onChange={(e) => setNewYear(Number(e.target.value))}
                    className="w-full input-3d rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-[#13243B] mb-1">
                    {t('السعر', 'Price')} ({newCurrency})
                  </label>
                  <input
                    type="number"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full input-3d rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#13243B] mb-1">
                    {t('العملة', 'Currency')}
                  </label>
                  <select
                    value={newCurrency}
                    onChange={(e) => setNewCurrency(e.target.value)}
                    className="w-full input-3d rounded-xl px-3 py-2 text-xs font-bold"
                  >
                    <option value="EGP">EGP (ج.م)</option>
                    <option value="SAR">SAR (ر.س)</option>
                    <option value="AED">AED (د.إ)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#13243B] mb-1">
                    {t('المدينة', 'City')}
                  </label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full input-3d rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              {/* Real Device & Camera Multi-Photo Uploader (No Preset Library) */}
              <div className="space-y-2.5 p-3.5 rounded-2xl bg-[#F4F7FC] border border-[#DFE7F1]">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-extrabold text-[#071A33]">
                    {t(
                      'رفع صور المنتج أو الماكينة من جهازك أو الكاميرا (حتى 8 صور):',
                      'Upload Photos from Device or Camera (up to 8):'
                    )}
                  </label>
                  <span className="text-[11px] font-bold text-[#718096]">
                    {uploadedListingImages.length}/8
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label className="cursor-pointer rounded-xl border-2 border-dashed border-[#1769E8]/50 bg-white hover:bg-blue-50/40 p-3 flex items-center justify-center gap-2 text-xs font-extrabold text-[#1769E8] transition-colors">
                    <UploadCloud className="w-4 h-4 shrink-0" />
                    <span>{t('اختيار صور من الجهاز', 'Choose from Device')}</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      data-testid="market-device-photo-input"
                      onChange={(e) => void handleUploadListingFiles(e)}
                      className="hidden"
                    />
                  </label>

                  <label className="cursor-pointer rounded-xl border-2 border-dashed border-[#071A33]/30 bg-white hover:bg-slate-50 p-3 flex items-center justify-center gap-2 text-xs font-extrabold text-[#071A33] transition-colors">
                    <Camera className="w-4 h-4 text-[#FF8A2A] shrink-0" />
                    <span>{t('التقاط صورة بالكاميرا', 'Take Photo via Camera')}</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => void handleUploadListingFiles(e)}
                      className="hidden"
                    />
                  </label>
                </div>

                {uploadError && (
                  <p className="text-xs font-extrabold text-rose-600">{uploadError}</p>
                )}

                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-[#1769E8]">
                      <span>{t('جاري ضغط ورفع الصور...', 'Processing photos...')}</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#DFE7F1] overflow-hidden">
                      <div
                        className="h-full bg-[#1769E8] transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {uploadedListingImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    {uploadedListingImages.map((imgUrl, idx) => (
                      <div
                        key={`upl-${idx}`}
                        className="relative rounded-xl overflow-hidden border-2 border-[#1769E8] aspect-square bg-white group"
                      >
                        <img
                          src={imgUrl}
                          alt={`صورة ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {idx === 0 && (
                          <span className="absolute top-1 start-1 px-1.5 py-0.5 rounded bg-[#071A33]/90 text-[9px] font-extrabold text-[#27BED6]">
                            {t('الرئيسية', 'Main')}
                          </span>
                        )}
                        <div className="absolute inset-x-0 bottom-0 bg-[#071A33]/85 p-1 flex items-center justify-between gap-1">
                          <button
                            type="button"
                            onClick={() => handleReorderListingImage(idx, -1)}
                            disabled={idx === 0}
                            className="p-0.5 text-white disabled:opacity-30 cursor-pointer"
                            title={t('تحريك لليمين', 'Move')}
                          >
                            <ArrowRight className="w-3 h-3" />
                          </button>
                          <label
                            className="p-0.5 text-[#27BED6] cursor-pointer text-[9px] font-extrabold"
                            title={t('استبدال الصورة', 'Replace')}
                          >
                            {t('تغيير', 'Replace')}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => void handleUploadListingFiles(e, idx)}
                              className="hidden"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              setUploadedListingImages((prev) =>
                                prev.filter((_, i) => i !== idx)
                              )
                            }
                            className="p-0.5 text-rose-400 hover:text-rose-300 cursor-pointer"
                            title={t('حذف الصورة', 'Delete')}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReorderListingImage(idx, 1)}
                            disabled={idx === uploadedListingImages.length - 1}
                            className="p-0.5 text-white disabled:opacity-30 cursor-pointer"
                            title={t('تحريك لليسار', 'Move')}
                          >
                            <ArrowLeft className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#DFE7F1]">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2.5 rounded-xl bg-[#F4F7FC] text-[#13243B] text-xs font-bold"
              >
                {t('إلغاء', 'Cancel')}
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#1769E8] hover:bg-[#1258C7] text-white text-xs font-extrabold cursor-pointer"
              >
                {t('نشر الإعلان في قاعدة البيانات', 'Publish Listing')}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export const MarketDetailPage: React.FC = () => <MarketListPage />;

/* ============================================================================
   VIRTUAL EXHIBITIONS FOR FACTORIES (/app/expo)
   ============================================================================ */
export const ExpoListPage: React.FC = () => {
  const {
    t,
    expoBooths,
    savedIds,
    toggleSavedItem,
    isFollowing,
    toggleFollow,
    startOrOpenConversation,
    openLightbox,
    showToast,
  } = usePlastico();
  const navigate = useNavigate();
  const [countryFilter, setCountryFilter] = useState('all');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [activeBooth, setActiveBooth] = useState<any | null>(null);
  const [inquiryMessage, setInquiryMessage] = useState('');

  const allBooths = useMemo(
    () => [
      {
        id: 'booth-united',
        companyNameAr: 'الشركة المتحدة للصناعات البلاستيكية والتغليف',
        companyNameEn: 'United Plastics & Packaging Industries',
        country: 'مصر',
        city: 'العاشر من رمضان',
        specialtyAr: 'الحقن والعبوات الدوائية والغذائية',
        specialtyCode: 'injection',
        hallNameAr: 'قاعة مصانع التعبئة والتغليف (قاعة 1)',
        banner: IMAGE_MANIFEST.exhibitions.expoShowroom,
        gallery: [
          IMAGE_MANIFEST.exhibitions.expoShowroom,
          IMAGE_MANIFEST.marketplace.petBottlesCapsSet,
          IMAGE_MANIFEST.marketplace.injectionMachineStudio,
        ],
        isVerified: true,
        machineryAr: [
          '14 خط حقن Haitian & Engel (من 120 طن إلى 650 طن)',
          '6 خطوط نفخ عبوات HDPE و PET أوتوماتيكية',
          'غرفة نظيفة (Cleanroom) لتصنيع العبوات الدوائية',
        ],
        productsAr: [
          'عبوات وأغطية محكمة الإغلاق للصناعات الغذائية والدوائية',
          'صناديق مناولة صناعية عالية التحمل',
          'بريفورم PET بأوزان من 14 جم حتى 65 جم',
        ],
      },
      ...expoBooths.map((b, idx) => ({
        id: b.id,
        companyNameAr: b.companyNameAr,
        companyNameEn: b.companyNameEn,
        country: idx % 2 === 0 ? 'مصر' : 'السعودية',
        city: b.city,
        specialtyAr: b.taglineAr,
        specialtyCode: idx % 2 === 0 ? 'extrusion' : 'molds',
        hallNameAr: 'قاعة الخطوط الهندسية والمواد الخام (قاعة 2)',
        banner: b.bannerImage || IMAGE_MANIFEST.exhibitions.productionFloor,
        gallery: [
          b.bannerImage || IMAGE_MANIFEST.exhibitions.productionFloor,
          ...(Array.isArray(b.featuredProducts)
            ? b.featuredProducts.map((fp) => fp.image)
            : []),
        ],
        isVerified: true,
        machineryAr: [
          'خطوط سحب مواسير وبروفايل UPVC / HDPE',
          'مركز تصنيع قوالب CNC و Wire-Cut EDM',
        ],
        productsAr: Array.isArray((b as any).featuredProducts)
          ? (b as any).featuredProducts.map((fp: any) => fp.nameAr)
          : Array.isArray((b as any).productsAr)
          ? (b as any).productsAr
          : [
              'عبوات ومستلزمات صناعية',
              'قوالب حقن ونفخ دقيقة',
              'خامات بوليمر وماسترباتش',
            ],
      })),
    ],
    [expoBooths]
  );

  const filteredBooths = allBooths.filter((b) => {
    if (countryFilter !== 'all' && b.country !== countryFilter) return false;
    if (specialtyFilter !== 'all' && b.specialtyCode !== specialtyFilter)
      return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-[#071A33] text-white p-6 sm:p-8 border border-[#1769E8]/30 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#1769E8]/20 text-[#27BED6] text-xs font-extrabold">
          <Building2 className="w-4 h-4" />
          <span>
            {t('المعارض الافتراضية للمصانع', 'Virtual Factory Exhibitions')}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          {t(
            'تجول داخل أجنحة المصانع واستعرض خطوط الإنتاج والمنتجات',
            'Explore Virtual Factory Halls, Production Lines & Capabilities'
          )}
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 max-w-xl">
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="bg-white text-[#13243B] rounded-xl px-3.5 py-2.5 text-xs font-extrabold"
          >
            <option value="all">{t('جميع الدول المشاركة', 'All Countries')}</option>
            <option value="مصر">{t('مصر', 'Egypt')}</option>
            <option value="السعودية">{t('السعودية', 'Saudi Arabia')}</option>
          </select>

          <select
            value={specialtyFilter}
            onChange={(e) => setSpecialtyFilter(e.target.value)}
            className="bg-white text-[#13243B] rounded-xl px-3.5 py-2.5 text-xs font-extrabold"
          >
            <option value="all">
              {t('جميع التخصصات الصناعية', 'All Industrial Specialties')}
            </option>
            <option value="injection">
              {t('حقن ونفخ العبوات', 'Injection & Blow Molding')}
            </option>
            <option value="extrusion">
              {t('سحب المواسير والفيلم', 'Pipe & Film Extrusion')}
            </option>
            <option value="molds">
              {t('تصنيع الاسطمبات والقوالب', 'Molds & Tooling')}
            </option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredBooths.map((booth) => {
          const isSaved = savedIds.includes(booth.id);
          const following = isFollowing(booth.id);
          return (
            <div
              key={booth.id}
              className="bg-white rounded-2xl border border-[#DFE7F1] overflow-hidden shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="relative">
                  <div
                    onClick={() =>
                      openLightbox(
                        booth.gallery || [booth.banner],
                        0,
                        booth.companyNameAr
                      )
                    }
                    className="cursor-zoom-in"
                  >
                    <IndustrialImage
                      src={booth.banner}
                      alt={booth.companyNameAr}
                      aspectClass="aspect-[16/9]"
                    />
                  </div>
                  <span className="absolute top-3 start-3 px-3 py-1 rounded-lg bg-[#071A33]/90 text-[#27BED6] text-[11px] font-extrabold">
                    {booth.hallNameAr}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      toggleSavedItem(booth.id, {
                        itemType: 'expo',
                        titleAr: booth.companyNameAr,
                        route: `/app/expo`,
                      })
                    }
                    className="absolute top-3 end-3 w-8 h-8 rounded-lg bg-white/95 flex items-center justify-center cursor-pointer"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isSaved
                          ? 'text-rose-600 fill-rose-600'
                          : 'text-[#13243B]'
                      }`}
                    />
                  </button>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#718096]">
                      {booth.city}، {booth.country}
                    </span>
                    <div className="flex items-center gap-2">
                      {booth.isVerified && <VerifiedFactoryBadge variant="compact" />}
                      <button
                        type="button"
                        onClick={() =>
                          void toggleFollow({
                            targetId: booth.id,
                            targetType: 'factory',
                            targetNameAr: booth.companyNameAr,
                            targetRoleAr: booth.specialtyAr,
                            targetAvatar: booth.banner,
                          })
                        }
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold cursor-pointer ${
                          following
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-[#F4F7FC] text-[#1769E8] border border-[#DFE7F1]'
                        }`}
                      >
                        {following ? t('✓ متابَع', '✓ Following') : t('+ متابعة المصنع', '+ Follow')}
                      </button>
                    </div>
                  </div>

                  <h2 className="text-base sm:text-lg font-extrabold text-[#13243B]">
                    {t(booth.companyNameAr, booth.companyNameEn)}
                  </h2>
                  <p className="text-xs text-[#718096]">{booth.specialtyAr}</p>

                  <div className="flex flex-wrap gap-1.5">
                    {booth.productsAr.slice(0, 3).map((p: string) => (
                      <span
                        key={p}
                        className="px-2.5 py-1 rounded-lg bg-[#F4F7FC] border border-[#DFE7F1] text-[11px] font-semibold text-[#13243B]"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-5 pt-3 border-t border-[#DFE7F1] flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setActiveBooth(booth)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#1769E8] hover:bg-[#1258C7] text-white text-xs font-extrabold transition-colors cursor-pointer"
                >
                  {t('دخول الجناح الافتراضي', 'Enter Virtual Booth')}
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const cid = await startOrOpenConversation({
                      targetKey: booth.id,
                      targetNameAr: booth.companyNameAr,
                      targetRoleAr: booth.specialtyAr,
                      targetAvatar: booth.banner,
                      contextType: 'expo',
                      contextId: booth.id,
                      contextTitleAr: `جناح معرض: ${booth.companyNameAr}`,
                    });
                    if (cid) navigate(`/app/messages?convId=${cid}`);
                  }}
                  className="py-2.5 px-4 rounded-xl bg-[#071A33] hover:bg-[#0D284D] text-white text-xs font-extrabold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#27BED6]" />
                  <span>{t('محادثة المصنع', 'Chat')}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Booth Interactive Modal */}
      {activeBooth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071A33]/65 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#DFE7F1] max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-extrabold text-[#1769E8]">
                  {activeBooth.hallNameAr}
                </span>
                <h3 className="text-lg font-extrabold text-[#13243B] mt-0.5">
                  {activeBooth.companyNameAr}
                </h3>
                <p className="text-xs text-[#718096]">
                  {activeBooth.city}، {activeBooth.country}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveBooth(null)}
                className="p-1.5 rounded-lg text-[#718096]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div
              onClick={() =>
                openLightbox(
                  activeBooth.gallery || [activeBooth.banner],
                  0,
                  activeBooth.companyNameAr
                )
              }
              className="rounded-xl overflow-hidden border border-[#DFE7F1] cursor-zoom-in"
            >
              <IndustrialImage
                src={activeBooth.banner}
                alt={activeBooth.companyNameAr}
                aspectClass="aspect-[16/8]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] space-y-2">
                <h4 className="text-xs font-extrabold text-[#071A33]">
                  {t(
                    'خطوط الإنتاج والماكينات بالجناح:',
                    'Production Lines & Machinery:'
                  )}
                </h4>
                <ul className="space-y-1.5 text-xs text-[#13243B]">
                  {activeBooth.machineryAr.map((m: string) => (
                    <li key={m} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#1769E8] shrink-0 mt-0.5" />
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] space-y-2">
                <h4 className="text-xs font-extrabold text-[#071A33]">
                  {t('المنتجات المعروضة:', 'Showcased Products:')}
                </h4>
                <ul className="space-y-1.5 text-xs text-[#13243B]">
                  {activeBooth.productsAr.map((p: string) => (
                    <li key={p} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#FF8A2A] shrink-0 mt-0.5" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const cid = await startOrOpenConversation({
                  targetKey: activeBooth.id,
                  targetNameAr: activeBooth.companyNameAr,
                  targetRoleAr: activeBooth.specialtyAr,
                  targetAvatar: activeBooth.banner,
                  contextType: 'expo',
                  contextId: activeBooth.id,
                  contextTitleAr: activeBooth.companyNameAr,
                  initialMessage: inquiryMessage,
                });
                setInquiryMessage('');
                setActiveBooth(null);
                if (cid) {
                  navigate(`/app/messages?convId=${cid}`);
                } else {
                  showToast(
                    `تم إرسال استفسارك المباشر إلى إدارة ${activeBooth.companyNameAr}`,
                    'Inquiry sent!'
                  );
                }
              }}
              className="space-y-2.5 pt-2 border-t border-[#DFE7F1]"
            >
              <label className="block text-xs font-extrabold text-[#13243B]">
                {t(
                  'أرسل رسالة مباشرة أو طلب عرض سعر لإدارة المصنع العارض:',
                  'Send Direct Message or RFQ to Exhibiting Factory:'
                )}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={inquiryMessage}
                  onChange={(e) => setInquiryMessage(e.target.value)}
                  placeholder={t(
                    'اكتب تفاصيل الكمية أو المنتج المطلوب تصنيعه...',
                    'Write your inquiry or required quantity...'
                  )}
                  className="flex-1 input-3d rounded-xl px-3.5 py-2.5 text-xs"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#FF8A2A] hover:bg-[#F07B1A] text-white text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{t('إرسال وفتح المحادثة', 'Send & Chat')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export const ExpoDetailPage: React.FC = () => <ExpoListPage />;

/* ============================================================================
   INDUSTRIAL NEWS, EDITORIAL ARTICLES & MARKET REPORTS (/app/news & /app/news/:id)
   Includes Featured Story, Editorial Categories, Full Article Reader View & Comments
   ============================================================================ */
export const NewsListPage: React.FC = () => {
  const {
    t,
    news,
    openLightbox,
    showToast,
    savedIds,
    toggleSavedItem,
    realUser,
  } = usePlastico();
  const params = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(
    params.id || null
  );
  const [articleComments, setArticleComments] = useState<
    Record<
      string,
      Array<{ id: string; authorName: string; authorId: string; text: string; date: string }>
    >
  >({
    'news-1': [
      {
        id: 'nc-1',
        authorName: 'م. كريم السيد',
        authorId: 'expert-karim-elsayed',
        text: 'تقرير دقيق جداً، التحول نحو ماكينات الحقن السيرفو وفر في مصنعنا بالعاشر من رمضان حوالي 42% من فاتورة الكهرباء الشهرية.',
        date: 'منذ ساعتين',
      },
    ],
  });
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    if (params.id) {
      setSelectedArticleId(params.id);
    } else {
      setSelectedArticleId(null);
    }
  }, [params.id]);

  const enrichedArticles = useMemo(() => {
    return news.map((item, idx) => ({
      ...item,
      authorId: idx % 2 === 0 ? 'expert-nadia-fahmy' : 'expert-karim-elsayed',
      authorNameAr:
        idx % 2 === 0 ? 'د.م. نادية فهمي — محللة أسواق البوليمر' : 'م. كريم السيد — محرر هندسي',
      sourceAr: 'مركز أخبار وأبحاث PLASTICO الصناعي',
      editorialCategory:
        idx === 0
          ? 'machinery_tech'
          : idx === 1
            ? 'recycling'
            : idx === 2
              ? 'market_analysis'
              : 'factories_news',
      fullBodyParagraphsAr: [
        item.summaryAr,
        'تشهد المصانع الإقليمية في مصر والسعودية والإمارات تحديثاً متسارعاً في خطوط الحقن والنفخ والبثق، مدفوعاً بالحاجة إلى خفض استهلاك الطاقة لكل كيلوجرام منتج وتقليل نسب الهالك الصناعي أثناء التشغيل المستمر.',
        'ويؤكد خبراء التشغيل في مجتمع PLASTICO أن الاستثمار في أنظمة التغذية المركزية للخامات ووحدات التجفيف المزودة بحساسات نقطة الندى (Dew Point Sensors) يرفع ثبات الجودة الميكانيكية للمنتجات النهائية ويقلل شكاوى العملاء.',
        'توصية فنية للمصانع: مراجعة جداول الصيانة الوقائية للسخانات، فحص تآكل الفتيل والبرميل دورياً، واعتماد مواصفات الخامة (TDS) قبل بدء التشغيل الكمي.',
      ],
      referencesAr: [
        'التقرير الفصلي لكفاءة الطاقة في مصانع تشكيل البوليمرات — PLASTICO Research',
        'الدليل القياسي لتشغيل ماكينات الحقن والنفخ الحديثة',
      ],
    }));
  }, [news]);

  const filteredArticles = useMemo(() => {
    if (activeCategory === 'ALL') return enrichedArticles;
    return enrichedArticles.filter((a) => a.editorialCategory === activeCategory);
  }, [enrichedArticles, activeCategory]);

  const activeArticle = useMemo(
    () => enrichedArticles.find((a) => a.id === selectedArticleId) || null,
    [enrichedArticles, selectedArticleId]
  );

  // Full Article Reader View (/app/news/:id)
  if (activeArticle) {
    const isSaved = savedIds.includes(activeArticle.id);
    const comments = articleComments[activeArticle.id] || [];
    const related = enrichedArticles.filter((a) => a.id !== activeArticle.id).slice(0, 2);

    return (
      <article className="space-y-6 max-w-4xl mx-auto" data-testid="news-article-reader">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              setSelectedArticleId(null);
              navigate('/app/news');
            }}
            className="px-4 py-2 rounded-xl bg-white border border-[#DFE7F1] hover:border-[#1769E8] text-xs font-extrabold text-[#13243B] inline-flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>{t('العودة إلى مركز الأخبار والتحليلات', 'Back to News Center')}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                toggleSavedItem(activeArticle.id, {
                  itemType: 'market',
                  titleAr: activeArticle.titleAr,
                  route: `/app/news/${activeArticle.id}`,
                })
              }
              className="px-3.5 py-2 rounded-xl bg-white border border-[#DFE7F1] text-xs font-extrabold text-[#13243B] inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-600 text-rose-600' : ''}`} />
              <span>{isSaved ? t('محفوظ', 'Saved') : t('حفظ المقال', 'Save')}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard
                  ?.writeText(`${window.location.origin}/app/news/${activeArticle.id}`)
                  .catch(() => {});
                showToast('تم نسخ رابط المقال للمشاركة!', 'Article link copied!');
              }}
              className="px-3.5 py-2 rounded-xl bg-[#1769E8] text-white text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>{t('مشاركة', 'Share')}</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-[#DFE7F1] overflow-hidden shadow-xs">
          {/* Large Hero Image */}
          <div
            onClick={() =>
              openLightbox([activeArticle.image], 0, activeArticle.titleAr)
            }
            className="relative cursor-zoom-in"
          >
            <IndustrialImage
              src={activeArticle.image}
              alt={activeArticle.titleAr}
              aspectClass="aspect-[16/8]"
            />
            <span className="absolute top-4 start-4 px-3 py-1 rounded-lg bg-[#071A33]/90 text-[#27BED6] text-xs font-extrabold">
              {activeArticle.categoryAr || t('تقرير صناعي', 'Industrial Report')}
            </span>
          </div>

          <div className="p-6 sm:p-8 space-y-5">
            <h1 className="text-xl sm:text-3xl font-black text-[#071A33] leading-tight">
              {t(activeArticle.titleAr, activeArticle.titleEn)}
            </h1>

            {/* Author, Date & Source Bar */}
            <div className="p-3.5 rounded-2xl bg-[#F4F7FC] border border-[#DFE7F1] flex flex-wrap items-center justify-between gap-3 text-xs">
              <Link
                to={`/app/profile/${encodeURIComponent(activeArticle.authorId)}`}
                className="font-extrabold text-[#1769E8] hover:underline flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>{activeArticle.authorNameAr}</span>
              </Link>
              <div className="flex items-center gap-3 text-[#718096]">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{activeArticle.publishedAt}</span>
                </span>
                <span>·</span>
                <span className="font-bold text-[#13243B]">{activeArticle.sourceAr}</span>
              </div>
            </div>

            {/* Full Editorial Paragraphs */}
            <div className="space-y-4 text-sm sm:text-base text-[#13243B] leading-relaxed">
              {activeArticle.fullBodyParagraphsAr.map((para, i) => (
                <p key={i} className={i === 0 ? 'font-bold text-[#071A33]' : ''}>
                  {para}
                </p>
              ))}
            </div>

            {/* Reference Sources */}
            <div className="p-4 rounded-2xl bg-[#F4F7FC] border border-[#DFE7F1] space-y-2">
              <h3 className="text-xs font-extrabold text-[#071A33]">
                {t('المصادر والمراجع الفنية:', 'References & Sources:')}
              </h3>
              <ul className="list-disc ps-5 space-y-1 text-xs text-[#4A5568]">
                {activeArticle.referencesAr.map((ref) => (
                  <li key={ref}>{ref}</li>
                ))}
              </ul>
            </div>

            {/* Article Comments Section */}
            <div className="pt-4 border-t border-[#DFE7F1] space-y-3">
              <h3 className="text-sm font-extrabold text-[#071A33]">
                {t('تعليقات القراء والمتخصصين', 'Reader & Specialist Comments')} ({comments.length})
              </h3>
              <div className="space-y-2">
                {comments.map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <Link
                        to={`/app/profile/${encodeURIComponent(c.authorId)}`}
                        className="font-extrabold text-[#1769E8] hover:underline"
                      >
                        {c.authorName}
                      </Link>
                      <span className="text-[10px] text-[#718096]">{c.date}</span>
                    </div>
                    <p className="text-[#13243B]">{c.text}</p>
                  </div>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!commentText.trim()) return;
                  setArticleComments((prev) => ({
                    ...prev,
                    [activeArticle.id]: [
                      ...(prev[activeArticle.id] || []),
                      {
                        id: `nc-${Date.now()}`,
                        authorName: realUser?.name || 'عضو صناعي',
                        authorId: realUser?.id ? String(realUser.id) : 'expert-karim-elsayed',
                        text: commentText.trim(),
                        date: 'الآن',
                      },
                    ],
                  }));
                  setCommentText('');
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={t('أضف تعليقك أو تحليلك على هذا الخبر...', 'Write your comment...')}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] text-xs"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#071A33] text-white text-xs font-extrabold cursor-pointer"
                >
                  {t('نشر التعليق', 'Post')}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Related Articles */}
        {related.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-base font-extrabold text-[#071A33]">
              {t('مقالات وأخبار ذات صلة', 'Related Industrial Articles')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {related.map((rel) => (
                <button
                  key={rel.id}
                  type="button"
                  onClick={() => navigate(`/app/news/${rel.id}`)}
                  className="bg-white rounded-2xl border border-[#DFE7F1] hover:border-[#1769E8] p-4 text-right flex items-center gap-3 cursor-pointer"
                >
                  <img
                    src={rel.image}
                    alt={rel.titleAr}
                    className="w-20 h-16 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-extrabold text-[#13243B] line-clamp-2">
                      {rel.titleAr}
                    </div>
                    <div className="text-[10px] text-[#718096] mt-1">{rel.publishedAt}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </article>
    );
  }

  const featuredArticle = filteredArticles[0] || enrichedArticles[0];

  return (
    <div className="space-y-6" data-testid="news-editorial-hub">
      {/* Header Banner */}
      <div className="rounded-3xl bg-[#071A33] text-white p-6 sm:p-8 border border-[#1769E8]/35 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1769E8]/25 text-[#27BED6] text-xs font-extrabold">
            {t('مركز أخبار وتحليلات صناعة البلاستيك', 'Plastics Industry News & Editorial Center')}
          </span>
          <h1 className="text-xl sm:text-3xl font-black text-white">
            {t(
              'آخر أخبار المصانع، تكنولوجيا الماكينات، إعادة التدوير، ومقالات الخبراء',
              'Latest Factory News, Machinery Tech, Recycling & Expert Articles'
            )}
          </h1>
        </div>
        <Link
          to="/app/experts"
          className="px-4 py-2.5 rounded-xl bg-[#FF8A2A] hover:bg-[#F07B1A] text-white text-xs font-extrabold shrink-0 text-center"
        >
          {t('شبكة الخبراء وصنّاع المحتوى ←', 'Industrial Experts Hub ←')}
        </Link>
      </div>

      {/* Editorial Category Tabs */}
      <div className="bg-white rounded-2xl border border-[#DFE7F1] p-3 flex items-center gap-2 overflow-x-auto">
        {[
          { id: 'ALL', labelAr: 'كل الأخبار والتحليلات', labelEn: 'All News' },
          { id: 'machinery_tech', labelAr: 'الماكينات والتكنولوجيا', labelEn: 'Machinery & Tech' },
          { id: 'recycling', labelAr: 'إعادة التدوير والاستدامة', labelEn: 'Recycling' },
          { id: 'market_analysis', labelAr: 'تحليلات السوق والخامات', labelEn: 'Market Analysis' },
          { id: 'factories_news', labelAr: 'أخبار الشركات والمصانع', labelEn: 'Companies & Factories' },
        ].map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-colors cursor-pointer ${
              activeCategory === cat.id
                ? 'bg-[#1769E8] text-white'
                : 'bg-[#F4F7FC] text-[#13243B] hover:bg-blue-50'
            }`}
          >
            {t(cat.labelAr, cat.labelEn)}
          </button>
        ))}
      </div>

      {/* Featured Story Hero Card */}
      {featuredArticle && (
        <div
          onClick={() => navigate(`/app/news/${featuredArticle.id}`)}
          className="cursor-pointer bg-white rounded-3xl border border-[#DFE7F1] hover:border-[#1769E8] overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-xs transition-all group"
        >
          <div className="lg:col-span-6 relative">
            <IndustrialImage
              src={featuredArticle.image}
              alt={featuredArticle.titleAr}
              aspectClass="aspect-[16/10] h-full"
            />
            <span className="absolute top-3 start-3 px-3 py-1 rounded-lg bg-[#FF8A2A] text-white text-xs font-extrabold">
              {t('خبر رئيسي مميز', 'Featured Story')}
            </span>
          </div>
          <div className="lg:col-span-6 p-6 flex flex-col justify-between gap-4">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs text-[#1769E8] font-extrabold">
                <span>{featuredArticle.categoryAr || 'تكنولوجيا المصانع'}</span>
                <span>·</span>
                <span className="text-[#718096]">{featuredArticle.publishedAt}</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-[#071A33] group-hover:text-[#1769E8] transition-colors leading-snug">
                {t(featuredArticle.titleAr, featuredArticle.titleEn)}
              </h2>
              <p className="text-xs sm:text-sm text-[#4A5568] leading-relaxed">
                {featuredArticle.summaryAr}
              </p>
            </div>
            <div className="pt-3 border-t border-[#DFE7F1] flex items-center justify-between text-xs">
              <span className="font-bold text-[#13243B]">{featuredArticle.authorNameAr}</span>
              <span className="font-extrabold text-[#1769E8]">
                {t('قراءة المقال الكامل ←', 'Read Full Article ←')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredArticles.map((item) => (
          <div
            key={item.id}
            onClick={() => navigate(`/app/news/${item.id}`)}
            className="cursor-pointer bg-white rounded-2xl border border-[#DFE7F1] p-4 flex items-center justify-between gap-4 hover:border-[#1769E8] transition-all group"
          >
            <div className="space-y-1.5 min-w-0 flex-1">
              <span className="text-[10px] font-extrabold text-[#1769E8]">
                {item.categoryAr || 'أخبار الصناعة'}
              </span>
              <h2 className="text-sm font-extrabold text-[#13243B] group-hover:text-[#1769E8] line-clamp-2">
                {t(item.titleAr, item.titleEn)}
              </h2>
              <p className="text-xs text-[#718096] line-clamp-2">{item.summaryAr}</p>
              <div className="flex items-center gap-2 text-[11px] text-[#718096] pt-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{item.publishedAt}</span>
                <span>·</span>
                <span className="text-[#1769E8] font-bold">{t('قراءة التفاصيل', 'Read')}</span>
              </div>
            </div>
            <div
              onClick={(e) => {
                e.stopPropagation();
                openLightbox([item.image], 0, item.titleAr);
              }}
              className="w-28 h-24 rounded-xl overflow-hidden border border-[#DFE7F1] shrink-0 cursor-zoom-in"
            >
              <IndustrialImage
                src={item.image}
                alt={item.titleAr}
                aspectRatio="aspect-square"
                className="w-full h-full"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const NewsDetailPage: React.FC = () => <NewsListPage />;

export const VisualSearchPage: React.FC = () => {
  const { t, showToast } = usePlastico();
  const [hasSearched, setHasSearched] = useState(true);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-[#DFE7F1] space-y-4">
        <h1 className="text-xl font-extrabold text-[#13243B]">
          {t('البحث بالصورة عن المنتجات وقطع الغيار', 'Visual Search by Photo')}
        </h1>
        <div
          onClick={() => {
            setHasSearched(true);
            showToast('تم تحليل صورة القطعة وعرض المصانع المطابقة!', 'Photo analyzed!');
          }}
          className="cursor-pointer rounded-2xl border-2 border-dashed border-[#1769E8]/50 bg-[#F4F7FC] p-8 flex flex-col items-center text-center gap-2"
        >
          <UploadCloud className="w-8 h-8 text-[#1769E8]" />
          <span className="text-sm font-extrabold text-[#13243B]">
            {t(
              'ارفع صورة القطعة أو العبوة البلاستيكية',
              'Upload Plastic Part or Bottle Photo'
            )}
          </span>
        </div>
        {hasSearched && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <Link
              to="/app/manufacturing/providers"
              className="p-4 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-extrabold text-[#13243B]">
                  {t(
                    'عبوات HDPE 500 مل — مصانع النفخ',
                    '500ml HDPE Bottles — Blow Factories'
                  )}
                </div>
                <div className="text-[11px] text-[#718096]">
                  {t('تصفح المصانع المنتجة', 'View matching factories')}
                </div>
              </div>
              <Star className="w-4 h-4 text-[#FF8A2A]" />
            </Link>
            <Link
              to="/app/suppliers?category=molds_tooling"
              className="p-4 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-extrabold text-[#13243B]">
                  {t(
                    'أغطية PP حقن 28 مم — مصنعو القوالب',
                    '28mm PP Caps — Mold Makers'
                  )}
                </div>
                <div className="text-[11px] text-[#718096]">
                  {t('تصفح مصنعي الاسطمبات', 'View tooling suppliers')}
                </div>
              </div>
              <Star className="w-4 h-4 text-[#1769E8]" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

/* ============================================================================
   PLASTICO ACADEMY (/app/training)
   Real Courses, Lesson Tracking, Assessment Quiz & Certificate Issuance
   ============================================================================ */
export const TrainingPage: React.FC = () => {
  const {
    t,
    academyCourses,
    academyProgressMap,
    saveCourseProgress,
    openLightbox,
    isAuthenticated,
    realUser,
  } = usePlastico();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const selectedCourseId = searchParams.get('course');
  const activeCourse: AcademyCourseItem | undefined = useMemo(
    () => academyCourses.find((c) => c.id === selectedCourseId),
    [academyCourses, selectedCourseId]
  );

  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmittedScore, setQuizSubmittedScore] = useState<number | null>(
    null
  );
  const [savingProgress, setSavingProgress] = useState(false);

  const handleToggleLesson = async (
    course: AcademyCourseItem,
    lessonId: string
  ) => {
    if (!isAuthenticated) {
      navigate(`/auth/login?redirect=/app/training?course=${course.id}`);
      return;
    }
    const current = academyProgressMap[course.id] || {
      courseId: course.id,
      completedLessons: [],
      quizScore: 0,
      certificateCode: '',
    };
    const exists = current.completedLessons.includes(lessonId);
    const nextLessons = exists
      ? current.completedLessons.filter((id) => id !== lessonId)
      : [...current.completedLessons, lessonId];

    setSavingProgress(true);
    await saveCourseProgress(
      course.id,
      nextLessons,
      current.quizScore,
      course.lessons.length
    );
    setSavingProgress(false);
  };

  const handleSubmitQuiz = async (course: AcademyCourseItem, e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate(`/auth/login?redirect=/app/training?course=${course.id}`);
      return;
    }
    let correct = 0;
    for (const q of course.quiz) {
      if (quizAnswers[q.id] === q.correctIndex) {
        correct += 1;
      }
    }
    const score = Math.round((correct / Math.max(1, course.quiz.length)) * 100);
    setQuizSubmittedScore(score);

    const current = academyProgressMap[course.id] || {
      courseId: course.id,
      completedLessons: [],
      quizScore: 0,
      certificateCode: '',
    };
    setSavingProgress(true);
    await saveCourseProgress(
      course.id,
      current.completedLessons,
      Math.max(score, current.quizScore),
      course.lessons.length
    );
    setSavingProgress(false);
  };

  if (activeCourse) {
    const progress = academyProgressMap[activeCourse.id] || {
      courseId: activeCourse.id,
      completedLessons: [],
      quizScore: 0,
      certificateCode: '',
    };
    const completedCount = progress.completedLessons.length;
    const totalLessons = activeCourse.lessons.length;
    const percent = Math.round(
      (completedCount / Math.max(1, totalLessons)) * 100
    );

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setQuizSubmittedScore(null);
              setSearchParams({});
            }}
            className="px-4 py-2 rounded-xl bg-white border border-[#DFE7F1] text-xs font-extrabold text-[#13243B] hover:border-[#1769E8]"
          >
            {t('← العودة إلى جميع دورات الأكاديمية', '← Back to All Courses')}
          </button>

          <span className="px-3 py-1 rounded-lg bg-[#1769E8]/10 text-[#1769E8] text-xs font-extrabold">
            {activeCourse.categoryAr}
          </span>
        </div>

        {/* Course Hero */}
        <div className="rounded-2xl bg-[#071A33] text-white p-6 sm:p-8 border border-[#1769E8]/30 space-y-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {t(activeCourse.titleAr, activeCourse.titleEn)}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {activeCourse.introAr}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-200 pt-2">
            <span className="inline-flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-[#27BED6]" />
              {activeCourse.instructorAr} ({activeCourse.instructorTitleAr})
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#FF8A2A]" />
              {activeCourse.hours} {t('ساعة تدريبية', 'training hours')}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              {totalLessons} {t('دروس عملية', 'practical lessons')}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="p-4 rounded-xl bg-white/8 border border-white/12 space-y-2">
            <div className="flex items-center justify-between text-xs font-extrabold">
              <span>
                {t('نسبة إتمام الدروس:', 'Lesson Completion:')} {completedCount} /{' '}
                {totalLessons} ({percent}%)
              </span>
              <span>
                {t('نتيجة التقييم:', 'Assessment Score:')} {progress.quizScore}%
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-white/15 overflow-hidden">
              <div
                className="h-full bg-[#27BED6] transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-300">
              {activeCourse.completionRequirementsAr}
            </p>
          </div>
        </div>

        {/* Certificate Banner */}
        {progress.certificateCode ? (
          <div className="rounded-2xl bg-gradient-to-l from-[#071A33] to-[#0D2E5C] text-white p-6 border-2 border-[#FF8A2A] shadow-xl space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#FF8A2A] text-white flex items-center justify-center shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-extrabold text-[#27BED6]">
                    {t(
                      'شهادة إتمام موثقة في قاعدة بيانات بلاستيكو',
                      'Verified PLASTICO Academy Certificate'
                    )}
                  </span>
                  <h2 className="text-lg font-extrabold text-white">
                    {realUser?.name} — {activeCourse.titleAr}
                  </h2>
                </div>
              </div>
              <span className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-xs font-mono-num font-extrabold text-[#FF8A2A]">
                {progress.certificateCode}
              </span>
            </div>
          </div>
        ) : null}

        {/* Learning Outcomes */}
        <div className="bg-white rounded-2xl border border-[#DFE7F1] p-6 space-y-3">
          <h2 className="text-base font-extrabold text-[#13243B]">
            {t('مخرجات التعلم والمهارات المكتسبة:', 'Learning Outcomes:')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {activeCourse.outcomesAr.map((out) => (
              <div
                key={out}
                className="p-3 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] flex items-start gap-2 text-xs font-semibold text-[#13243B]"
              >
                <CheckCircle2 className="w-4 h-4 text-[#1769E8] shrink-0 mt-0.5" />
                <span>{out}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Curriculum Lessons */}
        <div className="bg-white rounded-2xl border border-[#DFE7F1] p-6 space-y-4">
          <h2 className="text-base font-extrabold text-[#13243B]">
            {t('المنهج التدريبي والدروس العملية:', 'Course Curriculum & Lessons:')}
          </h2>
          <div className="space-y-3">
            {activeCourse.lessons.map((les, idx) => {
              const isDone = progress.completedLessons.includes(les.id);
              return (
                <div
                  key={les.id}
                  className={`p-4 rounded-xl border transition-all space-y-2.5 ${
                    isDone
                      ? 'bg-emerald-50/40 border-emerald-300'
                      : 'bg-[#F4F7FC] border-[#DFE7F1]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-[#071A33] text-white text-xs font-extrabold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div>
                        <h3 className="text-sm font-extrabold text-[#13243B]">
                          {t(les.titleAr, les.titleEn)}
                        </h3>
                        <span className="text-[11px] text-[#718096]">
                          {les.durationMinutes} {t('دقيقة', 'mins')}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={savingProgress}
                      onClick={() => void handleToggleLesson(activeCourse, les.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-colors ${
                        isDone
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#1769E8] hover:bg-[#1258C7] text-white'
                      }`}
                    >
                      {isDone
                        ? t('✓ تم إتمام الدرس', '✓ Completed')
                        : t('تسجيل إتمام الدرس', 'Mark Lesson Complete')}
                    </button>
                  </div>

                  <p className="text-xs text-[#13243B] leading-relaxed">
                    {les.summaryAr}
                  </p>

                  <ul className="space-y-1 ps-4 list-disc text-xs text-[#718096]">
                    {les.keyPointsAr.map((kp) => (
                      <li key={kp}>{kp}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* Assessment Quiz */}
        <form
          onSubmit={(e) => void handleSubmitQuiz(activeCourse, e)}
          className="bg-white rounded-2xl border border-[#DFE7F1] p-6 space-y-4"
        >
          <div>
            <span className="text-xs font-extrabold text-[#FF8A2A]">
              {t('التقييم الفني النهائي', 'Final Technical Assessment')}
            </span>
            <h2 className="text-base sm:text-lg font-extrabold text-[#13243B] mt-0.5">
              {t(
                'أجب عن الأسئلة التالية لإصدار شهادة إتمام الدورة (يتطلب إتمام جميع الدروس ونتيجة 70% فأعلى)',
                'Complete the quiz below to issue your course certificate (requires 100% lessons + 70% score)'
              )}
            </h2>
          </div>

          <div className="space-y-4">
            {activeCourse.quiz.map((q, qIdx) => (
              <div
                key={q.id}
                className="p-4 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] space-y-2.5"
              >
                <div className="text-xs sm:text-sm font-extrabold text-[#13243B]">
                  {qIdx + 1}. {q.questionAr}
                </div>
                <div className="space-y-1.5">
                  {q.optionsAr.map((opt, oIdx) => (
                    <label
                      key={opt}
                      className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white border border-[#DFE7F1] cursor-pointer text-xs font-semibold text-[#13243B]"
                    >
                      <input
                        type="radio"
                        name={q.id}
                        required
                        checked={quizAnswers[q.id] === oIdx}
                        onChange={() =>
                          setQuizAnswers((prev) => ({ ...prev, [q.id]: oIdx }))
                        }
                        className="text-[#1769E8]"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {quizSubmittedScore !== null && (
            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs font-extrabold text-[#13243B]">
              {t('نتيجتك في الاختبار:', 'Your Quiz Score:')} {quizSubmittedScore}%
            </div>
          )}

          <button
            type="submit"
            disabled={savingProgress}
            className="px-6 py-3 rounded-xl bg-[#FF8A2A] hover:bg-[#F07B1A] text-white text-xs sm:text-sm font-extrabold"
          >
            {savingProgress
              ? t('جاري التحقق والحفظ...', 'Verifying & Saving...')
              : t(
                  'اعتماد الإجابات وإصدار الشهادة',
                  'Submit Assessment & Issue Certificate'
                )}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Academy Header Banner */}
      <div className="rounded-2xl bg-[#071A33] text-white p-6 sm:p-8 border border-[#1769E8]/30 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#FF8A2A]/20 text-[#FF8A2A] text-xs font-extrabold">
          <GraduationCap className="w-4 h-4" />
          <span>{t('أكاديمية بلاستيكو الصناعية', 'PLASTICO Industrial Academy')}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          {t(
            'مسارات تدريبية متخصصة في الحقن، القوالب، البوليمرات، والصيانة الوقائية',
            'Specialized Training Tracks in Injection Molding, Tooling, Polymers & Maintenance'
          )}
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
          {t(
            'جميع الدورات تتضمن دروساً تطبيقية مفصلة واختباراً فنياً لإصدار شهادة إتمام موثقة في حسابك.',
            'Every course features structured practical lessons, progress tracking, and a verified completion certificate.'
          )}
        </p>
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {academyCourses.map((course) => {
          const prog = academyProgressMap[course.id];
          const doneCount = prog?.completedLessons.length || 0;
          const totalCount = course.lessons.length;
          const pct = Math.round((doneCount / Math.max(1, totalCount)) * 100);

          return (
            <div
              key={course.id}
              className="bg-white rounded-2xl border border-[#DFE7F1] overflow-hidden shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div
                  onClick={() => openLightbox([course.image], 0, course.titleAr)}
                  className="cursor-zoom-in"
                >
                  <IndustrialImage
                    src={course.image}
                    alt={course.titleAr}
                    aspectClass="aspect-[16/9]"
                  />
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#F4F7FC] text-[#1769E8] text-[11px] font-extrabold border border-[#DFE7F1]">
                      {course.categoryAr}
                    </span>
                    <span className="text-[11px] font-bold text-[#718096]">
                      {course.hours} {t('ساعات', 'hrs')} · {totalCount}{' '}
                      {t('دروس', 'lessons')}
                    </span>
                  </div>

                  <h2 className="text-base font-extrabold text-[#13243B] leading-snug">
                    {t(course.titleAr, course.titleEn)}
                  </h2>

                  <p className="text-xs text-[#718096] line-clamp-2">
                    {course.introAr}
                  </p>

                  <div className="text-[11px] text-[#13243B] font-semibold">
                    <span className="text-[#718096]">
                      {t('الفئة المستهدفة:', 'Target Audience:')}
                    </span>{' '}
                    {course.targetAudienceAr}
                  </div>

                  {/* Progress Indicator */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-[#718096]">
                        {t('تقدمك في الدورة', 'Your Progress')}
                      </span>
                      <span className="text-[#1769E8]">{pct}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#F4F7FC] overflow-hidden">
                      <div
                        className="h-full bg-[#1769E8]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-3 border-t border-[#DFE7F1] space-y-2">
                {prog?.certificateCode && (
                  <div className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-extrabold flex items-center justify-between">
                    <span>{t('تم إصدار الشهادة', 'Certificate Issued')}</span>
                    <span className="font-mono-num">{prog.certificateCode}</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setSearchParams({ course: course.id })}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#1769E8] hover:bg-[#1258C7] text-white text-xs font-extrabold transition-colors cursor-pointer"
                >
                  {doneCount > 0
                    ? t('متابعة الدروس والتقييم', 'Continue Course & Quiz')
                    : t('فتح المنهج وبدء التعلم', 'Open Course Curriculum')}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
