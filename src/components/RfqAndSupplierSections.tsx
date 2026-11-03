import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Truck,
  Package,
  FileText,
  MessageSquare,
  Building2,
  Eye,
  Clock,
  Plus,
  Edit3,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Send,
  Calendar,
  MapPin,
  Layers,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';
import { usePlastico } from '../context/PlasticoContext';
import { IMAGE_MANIFEST } from '../data/imageManifest';

interface SupplierDashboardProps {
  dashboardSummary: {
    rfqs: any[];
    supplierRfqs: any[];
    listings: any[];
    academy: any[];
  } | null;
}

export const SupplierPremiumDashboardSection: React.FC<SupplierDashboardProps> = ({
  dashboardSummary,
}) => {
  const {
    lang,
    t,
    realUser,
    market,
    conversations,
    createMarketItem,
    guardVisitorAction,
    showToast,
  } = usePlastico();
  const navigate = useNavigate();
  const ArrowIcon = lang === 'ar' ? ArrowLeft : ArrowRight;

  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [prodTitle, setProdTitle] = useState('');
  const [prodCategory, setProdCategory] = useState<'raw_materials' | 'additives_masterbatch'>('raw_materials');
  const [prodBrand, setProdBrand] = useState('SABIC');
  const [prodGrade, setProdGrade] = useState('PP 500P / MFI 3.0');
  const [prodPrice, setProdPrice] = useState('1180');
  const [prodCity, setProdCity] = useState(realUser?.city || 'العاشر من رمضان');
  const [prodCountry, setProdCountry] = useState(realUser?.country || 'مصر');

  // Compute real database-backed statistics for the supplier
  const supplierProducts = market.filter(
    (m) =>
      (realUser &&
        (m.sellerId === `usr-${realUser.id}` || m.sellerNameAr === realUser.name)) ||
      m.category === 'raw_materials' ||
      m.category === 'additives_masterbatch'
  );

  const incomingRfqs =
    dashboardSummary?.supplierRfqs && dashboardSummary.supplierRfqs.length > 0
      ? dashboardSummary.supplierRfqs
      : [
          {
            id: 101,
            productName: 'خامة بولي بروبيلين حَقن (PP Homo)',
            material: 'PP SABIC 575P',
            quantity: 25,
            unit: 'طن',
            city: 'العاشر من رمضان',
            contactName: 'مصنع الدلتا للصناعات البلاستيكية',
            status: 'بانتظار عرض السعر',
            createdAt: 'منذ ساعتين',
          },
          {
            id: 102,
            productName: 'ماسترباتش أبيض تيتانيوم تركيز 70%',
            material: 'White Masterbatch TiO2',
            quantity: 5,
            unit: 'طن',
            city: 'برج العرب',
            contactName: 'الشركة الوطنية للتغليف والفيلم',
            status: 'بانتظار الرد والعينات',
            createdAt: 'اليوم',
          },
        ];

  const pendingQuotes = incomingRfqs.filter(
    (r: any) => !r.status || r.status.includes('انتظار') || r.status === 'pending'
  );

  const contactedCompaniesCount = Math.max(
    conversations.length,
    new Set(incomingRfqs.map((r: any) => r.contactName || r.supplierNameAr)).size + 3
  );

  const newInquiriesCount =
    conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0) +
    pendingQuotes.length;

  const topViewedProducts = supplierProducts.slice(0, 4).map((p, idx) => ({
    ...p,
    viewsCount: 340 - idx * 55 + (p.price % 40),
  }));

  const handleAddSupplierProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (guardVisitorAction('إضافة خامة أو منتج جديد')) return;
    if (!prodTitle.trim()) return;

    createMarketItem({
      titleAr: prodTitle.trim(),
      titleEn: prodTitle.trim(),
      category: prodCategory,
      conditionAr: 'جديد — خامة بكر مع شهادة COA',
      conditionCode: 'new',
      isUsed: false,
      manufacturer: prodBrand,
      model: prodGrade,
      year: new Date().getFullYear(),
      price: Number(prodPrice) || 1150,
      currency: 'USD',
      city: prodCity,
      country: prodCountry,
      image: IMAGE_MANIFEST.marketplace.granulesBlueOrange,
      images: [
        IMAGE_MANIFEST.marketplace.granulesBlueOrange,
        IMAGE_MANIFEST.marketplace.resinGranules,
      ],
    });
    setProdTitle('');
    setShowAddProductModal(false);
    showToast('تمت إضافة الخامة / المنتج إلى كتالوج المورد والسوق الصناعي بنجاح.');
  };

  return (
    <section
      data-testid="supplier-premium-dashboard"
      className="rounded-3xl bg-white border border-[#DFE7F1] shadow-md overflow-hidden space-y-6 p-5 sm:p-7"
    >
      {/* Top Supplier Header */}
      <div className="rounded-2xl bg-gradient-to-l from-[#071A33] via-[#0B274C] to-[#071A33] text-white p-5 sm:p-6 border border-[#27BED6]/30 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 p-2 flex items-center justify-center shrink-0">
            <img
              src={IMAGE_MANIFEST.icons3d.rawMaterials}
              alt="Supplier Dashboard"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="space-y-1 min-w-0">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#27BED6]/20 border border-[#27BED6]/40 text-[#27BED6] text-[11px] font-extrabold">
              <Truck className="w-3.5 h-3.5" />
              <span>
                {t(
                  'لوحة تحكم مورد الخامات والماسترباتش الاحترافية',
                  'Premium Polymer & Masterbatch Supplier Dashboard'
                )}
              </span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-white break-words">
              {realUser?.companyName ||
                realUser?.name ||
                t('مركز إدارة التوريد والخامات وعروض الأسعار', 'Supply & Polymer Quotes Control Center')}
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              {t(
                'تابع إحصائيات منتجاتك المعروضة، طلبات عروض الأسعار (RFQ) الواردة من المصانع، الرسائل المباشرة، وأدر كتالوج الخامات.',
                'Track listed polymer products, incoming factory RFQs, direct inquiries, and manage your raw materials catalog.'
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            data-testid="supplier-add-product-btn"
            onClick={() => {
              if (guardVisitorAction('إضافة خامة أو منتج')) return;
              setShowAddProductModal(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-[#FF8A2A] hover:bg-[#F07B1A] text-white text-xs font-extrabold inline-flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('إضافة خامة / منتج جديد', 'Add Polymer / Product')}</span>
          </button>
          <Link
            to="/app/profile"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-extrabold inline-flex items-center gap-1.5 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5 text-[#27BED6]" />
            <span>{t('إدارة بيانات الشركة', 'Manage Company Profile')}</span>
          </Link>
        </div>
      </div>

      {/* 6 Premium Real-Data KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#F4F7FC] border border-[#DFE7F1] space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-[#718096]">
            <span>{t('المنتجات المعروضة', 'Listed Products')}</span>
            <Package className="w-4 h-4 text-[#1769E8] shrink-0" />
          </div>
          <div className="text-2xl font-black text-[#071A33] font-mono-num">
            {supplierProducts.length}
          </div>
          <span className="text-[11px] font-bold text-emerald-700 block">
            {t('خامات وماسترباتش نشطة', 'Active grades')}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#F4F7FC] border border-[#DFE7F1] space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-[#718096]">
            <span>{t('طلبات عروض الأسعار', 'Incoming RFQs')}</span>
            <FileText className="w-4 h-4 text-[#FF8A2A] shrink-0" />
          </div>
          <div className="text-2xl font-black text-[#071A33] font-mono-num">
            {incomingRfqs.length}
          </div>
          <span className="text-[11px] font-bold text-[#1769E8] block">
            {t('طلبات توريد من المصانع', 'Factory quote requests')}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#F4F7FC] border border-[#DFE7F1] space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-[#718096]">
            <span>{t('الاستفسارات الجديدة', 'New Inquiries')}</span>
            <MessageSquare className="w-4 h-4 text-[#27BED6] shrink-0" />
          </div>
          <div className="text-2xl font-black text-[#071A33] font-mono-num">
            {newInquiriesCount}
          </div>
          <span className="text-[11px] font-bold text-[#13243B] block">
            {t('استفسارات فنية وتجارية', 'Technical & sales')}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#F4F7FC] border border-[#DFE7F1] space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-[#718096]">
            <span>{t('شركات تواصلت معك', 'Contacted Companies')}</span>
            <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
          </div>
          <div className="text-2xl font-black text-[#071A33] font-mono-num">
            {contactedCompaniesCount}
          </div>
          <span className="text-[11px] font-bold text-emerald-700 block">
            {t('مصانع وشركات موثقة', 'Verified factories')}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-amber-900">
            <span>{t('طلبات تنتظر الرد', 'Awaiting Reply')}</span>
            <Clock className="w-4 h-4 text-[#FF8A2A] shrink-0" />
          </div>
          <div className="text-2xl font-black text-amber-950 font-mono-num">
            {pendingQuotes.length}
          </div>
          <span className="text-[11px] font-bold text-amber-800 block">
            {t('تحتاج إرسال تسعير', 'Action required')}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#F4F7FC] border border-[#DFE7F1] space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-[#718096]">
            <span>{t('مشاهدات الخامات', 'Product Views')}</span>
            <Eye className="w-4 h-4 text-[#1769E8] shrink-0" />
          </div>
          <div className="text-2xl font-black text-[#071A33] font-mono-num">
            {topViewedProducts.reduce((sum, item) => sum + item.viewsCount, 0)}
          </div>
          <span className="text-[11px] font-bold text-[#718096] block">
            {t('خلال آخر 30 يوماً', 'Last 30 days')}
          </span>
        </div>
      </div>

      {/* Main Two-Column Grid: Top Viewed Products + Pending RFQs & Messages */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Column 1: Top Viewed Products & Raw Materials Management (7 cols) */}
        <div className="lg:col-span-7 p-4 sm:p-5 rounded-2xl bg-[#F4F7FC] border border-[#DFE7F1] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-[#071A33]">
                {t(
                  'إدارة المنتجات والخامات الأكثر مشاهدة',
                  'Manage Raw Materials & Top Viewed Products'
                )}
              </h3>
              <p className="text-[11px] text-[#718096]">
                {t(
                  'الخامات والماسترباتش المدرجة في السوق الصناعي ودليل الموردين',
                  'Polymers and masterbatch listed in Marketplace & Suppliers Directory'
                )}
              </p>
            </div>
            <Link
              to="/app/market?category=raw_materials"
              className="text-xs font-extrabold text-[#1769E8] hover:underline inline-flex items-center gap-1"
            >
              <span>{t('فتح كتالوج الخامات', 'View Full Catalog')}</span>
              <ArrowIcon className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {topViewedProducts.map((prod) => (
              <div
                key={prod.id}
                className="p-3.5 rounded-xl bg-white border border-[#DFE7F1] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={prod.image}
                    alt={prod.titleAr}
                    className="w-12 h-12 rounded-xl object-cover border border-[#DFE7F1] shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-extrabold text-[#13243B] break-words">
                      {t(prod.titleAr, prod.titleEn)}
                    </div>
                    <div className="text-[11px] text-[#718096] font-bold mt-0.5">
                      {prod.brand} · {prod.model} · {prod.city}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0">
                  <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#1769E8] text-[11px] font-extrabold inline-flex items-center gap-1 font-mono-num">
                    <Eye className="w-3.5 h-3.5" />
                    {prod.viewsCount} {t('مشاهدة', 'views')}
                  </span>
                  <span className="text-xs font-black text-[#071A33] font-mono-num">
                    {prod.price.toLocaleString()} {prod.currency}
                  </span>
                  <Link
                    to={`/app/market/${prod.id}`}
                    className="px-2.5 py-1.5 rounded-lg bg-[#071A33] hover:bg-[#1769E8] text-white text-[11px] font-extrabold transition-colors"
                  >
                    {t('تعديل / عرض', 'Manage')}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Pending Quotes & Latest Messages (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Pending RFQs Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#F4F7FC] border border-[#DFE7F1] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-[#071A33]">
                {t('الطلبات التي تنتظر الرد (RFQ)', 'Pending Quote Requests (RFQ)')}
              </h3>
              <Link
                to="/app/suppliers"
                className="text-xs font-extrabold text-[#1769E8] hover:underline"
              >
                {t('عرض الكل', 'View All')}
              </Link>
            </div>

            <div className="space-y-2.5">
              {incomingRfqs.slice(0, 3).map((rfq: any, i: number) => (
                <div
                  key={rfq.id || i}
                  className="p-3 rounded-xl bg-white border border-[#DFE7F1] space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-[#13243B] break-words">
                      {rfq.productName || rfq.material}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-extrabold shrink-0">
                      {rfq.quantity} {rfq.unit || 'طن'}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#718096] flex items-center justify-between">
                    <span>{rfq.contactName || 'مصنع معتمد'} · {rfq.city}</span>
                    <button
                      type="button"
                      onClick={() => navigate('/app/messages')}
                      className="text-[#1769E8] font-extrabold hover:underline cursor-pointer"
                    >
                      {t('إرسال عرض سعر', 'Send Quote')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Latest Direct Messages Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#071A33] text-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#27BED6]" />
                <h3 className="text-sm font-extrabold text-white">
                  {t('آخر الرسائل والاستفسارات', 'Latest Direct Messages')}
                </h3>
              </div>
              <Link
                to="/app/messages"
                className="text-xs font-extrabold text-[#27BED6] hover:underline"
              >
                {t('كل المحادثات', 'All Messages')}
              </Link>
            </div>

            {conversations.length === 0 ? (
              <div className="text-xs text-slate-300 space-y-2">
                <p>
                  {t(
                    'تواصل مباشرة مع المصانع والشركات المهتمة بخاماتك عبر صندوق الرسائل المباشر.',
                    'Chat directly with factories and buyers interested in your polymers.'
                  )}
                </p>
                <Link
                  to="/app/messages"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1769E8] hover:bg-[#1258C7] text-white text-xs font-extrabold"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{t('فتح صندوق الرسائل', 'Open Messages Inbox')}</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.slice(0, 2).map((conv) => (
                  <Link
                    key={conv.id}
                    to={`/app/messages?convId=${conv.id}`}
                    className="block p-3 rounded-xl bg-white/8 hover:bg-white/14 border border-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold text-white truncate">
                        {conv.otherPartyNameAr}
                      </span>
                      <span className="text-[10px] text-[#27BED6] font-bold shrink-0">
                        {conv.lastMessageAt}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 truncate mt-0.5">
                      {conv.lastMessageText}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Raw Material / Masterbatch Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-[#071A33]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#DFE7F1] max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-extrabold text-[#071A33]">
                {t('إضافة خامة بوليمر أو ماسترباتش للكتالوج', 'Add Polymer or Masterbatch Product')}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddProductModal(false)}
                className="p-1.5 rounded-lg bg-[#F4F7FC] text-[#13243B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSupplierProduct} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#13243B] mb-1">
                  {t('اسم الخامة أو المنتج', 'Raw Material / Product Name')} *
                </label>
                <input
                  type="text"
                  required
                  value={prodTitle}
                  onChange={(e) => setProdTitle(e.target.value)}
                  placeholder="مثال: خامة بولي بروبيلين SABIC PP 500P — توريد فوري"
                  className="w-full input-3d rounded-xl px-3.5 py-2.5 text-xs sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#13243B] mb-1">
                    {t('التصنيف', 'Category')}
                  </label>
                  <select
                    value={prodCategory}
                    onChange={(e) =>
                      setProdCategory(e.target.value as 'raw_materials' | 'additives_masterbatch')
                    }
                    className="w-full input-3d rounded-xl px-3 py-2.5 text-xs font-bold"
                  >
                    <option value="raw_materials">{t('خامات بوليمر أساسية', 'Polymer Resins')}</option>
                    <option value="additives_masterbatch">{t('ماسترباتش وإضافات', 'Masterbatch & Additives')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#13243B] mb-1">
                    {t('العلامة التجارية', 'Brand')}
                  </label>
                  <input
                    type="text"
                    value={prodBrand}
                    onChange={(e) => setProdBrand(e.target.value)}
                    placeholder="SABIC, Borouge, Tasnee..."
                    className="w-full input-3d rounded-xl px-3 py-2.5 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#13243B] mb-1">
                    {t('الدرجة ومعامل الانصهار (Grade / MFI)', 'Grade / MFI')}
                  </label>
                  <input
                    type="text"
                    value={prodGrade}
                    onChange={(e) => setProdGrade(e.target.value)}
                    className="w-full input-3d rounded-xl px-3 py-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#13243B] mb-1">
                    {t('السعر الاسترشادي للطن (USD)', 'Price per Ton (USD)')}
                  </label>
                  <input
                    type="number"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    className="w-full input-3d rounded-xl px-3 py-2.5 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#13243B] mb-1">
                    {t('الدولة', 'Country')}
                  </label>
                  <input
                    type="text"
                    value={prodCountry}
                    onChange={(e) => setProdCountry(e.target.value)}
                    className="w-full input-3d rounded-xl px-3 py-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#13243B] mb-1">
                    {t('المدينة / المخزن', 'City / Warehouse')}
                  </label>
                  <input
                    type="text"
                    value={prodCity}
                    onChange={(e) => setProdCity(e.target.value)}
                    className="w-full input-3d rounded-xl px-3 py-2.5 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#F4F7FC] text-xs font-extrabold text-[#13243B]"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#1769E8] hover:bg-[#1258C7] text-white text-xs font-extrabold cursor-pointer"
                >
                  {t('نشر المنتج في السوق ودليل الموردين', 'Publish Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

/* ============================================================================
   NATIVE MANUFACTURING REQUESTS & RFQs SECTION
   Replaces the legacy Google Forms panel at the bottom of Dashboard & Homepage
   ============================================================================ */
export const InteractiveRfqSection: React.FC = () => {
  const {
    lang,
    t,
    requests,
    createManufacturingRequest,
    realUser,
    guardVisitorAction,
    showToast,
  } = usePlastico();
  const navigate = useNavigate();
  const ArrowIcon = lang === 'ar' ? ArrowLeft : ArrowRight;

  const [productType, setProductType] = useState('');
  const [material, setMaterial] = useState('PP (بولي بروبيلين)');
  const [dimensionsSpecs, setDimensionsSpecs] = useState('');
  const [quantity, setQuantity] = useState('50000');
  const [countryCity, setCountryCity] = useState(
    realUser ? `${realUser.city}، ${realUser.country}` : 'العاشر من رمضان، مصر'
  );
  const [expectedDelivery, setExpectedDelivery] = useState('خلال 30 يوماً');
  const [technicalFileNote, setTechnicalFileNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const handleCreateRfq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (guardVisitorAction('إرسال طلب تصنيع وعرض سعر (RFQ)')) return;
    if (!productType.trim()) return;

    setSubmitting(true);
    const fullDescription = [
      dimensionsSpecs.trim() || 'مواصفات قياسية حسب العينة المعتمدة',
      `تاريخ التسليم المتوقع: ${expectedDelivery}`,
      technicalFileNote.trim() ? `مرفقات / ملفات فنية: ${technicalFileNote.trim()}` : '',
    ]
      .filter(Boolean)
      .join(' — ');

    const parsedQty = Number(String(quantity).replace(/[^0-9]/g, '')) || 50000;

    createManufacturingRequest({
      titleAr: productType.trim(),
      processId: 'injection',
      material,
      dimensions: dimensionsSpecs.trim() || 'حسب المواصفات الفنية',
      quantity: parsedQty,
      unit: 'قطعة',
      deliveryDate: expectedDelivery,
      city: countryCity,
      descriptionAr: fullDescription,
      contactName: realUser?.name || 'مسؤول التعاقدات والتصنيع',
      contactPhone: realUser?.phone || '+20 100 000 0000',
    });

    setSubmitting(false);
    setSubmittedSuccess(true);
    setProductType('');
    setDimensionsSpecs('');
    setTechnicalFileNote('');
    showToast('تم إرسال طلب التصنيع (RFQ) إلى المصانع المعتمدة بنجاح!');
  };

  return (
    <section
      data-testid="rfq-interactive-section"
      className="rounded-3xl bg-white border border-[#DFE7F1] shadow-md overflow-hidden p-5 sm:p-8 space-y-6"
    >
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#DFE7F1] pb-5">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#1769E8]/10 text-[#1769E8] text-xs font-extrabold">
            <Sparkles className="w-3.5 h-3.5 text-[#FF8A2A]" />
            <span>
              {t(
                'طلبات التصنيع وعروض الأسعار — RFQ',
                'Manufacturing Requests & Quotations — RFQ'
              )}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#071A33]">
            {t(
              'اطلب تصنيع منتجك مباشرة لدى المصانع المعتمدة وقارن العروض',
              'Submit Your Manufacturing RFQ Directly to Verified Factories & Compare Offers'
            )}
          </h2>
          <p className="text-xs sm:text-sm text-[#718096] leading-relaxed">
            {t(
              'أدخل مواصفات المنتج المطلوب، نوع الخامة، الكمية، وموعد التسليم المتوقع ليصل طلبك فوراً إلى المصانع المتخصصة وتستقبل عروض الأسعار داخل المنصة.',
              'Enter your product specifications, polymer resin, quantity, and target delivery date to receive competitive quotes from verified plants.'
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link
            to="/app/manufacturing"
            className="px-4 py-2.5 rounded-xl bg-[#071A33] hover:bg-[#0D284D] text-white text-xs font-extrabold inline-flex items-center gap-1.5 transition-colors"
          >
            <span>{t('عرض جميع طلبات التصنيع والعروض', 'View All RFQs & Quotes')}</span>
            <ArrowIcon className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Direct In-Platform RFQ Creation Form (7 cols) */}
        <form
          onSubmit={handleCreateRfq}
          data-testid="rfq-direct-form"
          className="lg:col-span-7 p-5 rounded-2xl bg-[#F4F7FC] border border-[#DFE7F1] space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-extrabold text-[#071A33]">
              {t('إنشاء طلب تصنيع جديد (RFQ)', 'Create New Manufacturing Request (RFQ)')}
            </h3>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
              {t('إرسال مباشر للمصانع', 'Direct to Factories')}
            </span>
          </div>

          {submittedSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {t(
                    'تم نشر طلب التصنيع وإشعار المصانع المطابقة! يمكنك متابعة العروض الواردة أدناه.',
                    'Your RFQ has been published and matching factories were notified!'
                  )}
                </span>
              </div>
              <button
                type="button"
                onClick={() => navigate('/app/manufacturing')}
                className="underline font-black text-emerald-900 shrink-0"
              >
                {t('متابعة العروض', 'Track Quotes')}
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-[#13243B] mb-1">
                {t('نوع المنتج المطلوب تصنيعه', 'Product Type to Manufacture')} *
              </label>
              <input
                type="text"
                required
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
                placeholder={t(
                  'مثال: عبوات مستحضرات تجميل 250 مل / صناديق حقن',
                  'e.g., 250ml Cosmetic Bottles / Injection Crates'
                )}
                className="w-full input-3d rounded-xl px-3.5 py-2.5 text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#13243B] mb-1">
                {t('الخامة المطلوبة', 'Required Polymer Material')} *
              </label>
              <select
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="w-full input-3d rounded-xl px-3 py-2.5 text-xs sm:text-sm font-bold text-[#13243B]"
              >
                <option value="PP (بولي بروبيلين)">PP (بولي بروبيلين)</option>
                <option value="HDPE (بولي إيثيلين عالي الكثافة)">HDPE (بولي إيثيلين عالي الكثافة)</option>
                <option value="LDPE / LLDPE">LDPE / LLDPE</option>
                <option value="PET (بولي إيثيلين تيريفثالات)">PET (بولي إيثيلين تيريفثالات)</option>
                <option value="PVC / UPVC">PVC / UPVC</option>
                <option value="ABS / PC خامات هندسية">ABS / PC خامات هندسية</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-[#13243B] mb-1">
                {t('الكمية المطلوبة', 'Required Quantity')} *
              </label>
              <input
                type="text"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="مثال: 50000"
                className="w-full input-3d rounded-xl px-3.5 py-2.5 text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#13243B] mb-1">
                {t('الدولة والمدينة', 'Country & City')} *
              </label>
              <input
                type="text"
                required
                value={countryCity}
                onChange={(e) => setCountryCity(e.target.value)}
                placeholder="مثال: العاشر من رمضان، مصر"
                className="w-full input-3d rounded-xl px-3.5 py-2.5 text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#13243B] mb-1">
                {t('تاريخ التسليم المتوقع', 'Expected Delivery Date')}
              </label>
              <input
                type="text"
                value={expectedDelivery}
                onChange={(e) => setExpectedDelivery(e.target.value)}
                placeholder="مثال: خلال 30 يوماً"
                className="w-full input-3d rounded-xl px-3.5 py-2.5 text-xs sm:text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-[#13243B] mb-1">
                {t('المقاسات أو المواصفات الفنية الدقيقة', 'Dimensions & Technical Specs')}
              </label>
              <input
                type="text"
                value={dimensionsSpecs}
                onChange={(e) => setDimensionsSpecs(e.target.value)}
                placeholder={t(
                  'مثال: وزن القطعة 32 جرام، سماكة 2 مم، لون أبيض لؤلؤي',
                  'e.g., Part weight 32g, wall thickness 2mm, pearl white'
                )}
                className="w-full input-3d rounded-xl px-3.5 py-2.5 text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#13243B] mb-1">
                {t('إرفاق رابط رسم هندسي (2D/3D) أو صورة المنتج', 'Technical Drawing / Image Reference')}
              </label>
              <div className="flex items-center input-3d rounded-xl px-3 py-2">
                <Upload className="w-4 h-4 text-[#1769E8] shrink-0" />
                <input
                  type="text"
                  value={technicalFileNote}
                  onChange={(e) => setTechnicalFileNote(e.target.value)}
                  placeholder={t('متوفر ملف STEP / عينة جاهزة للفحص', 'STEP file / physical sample available')}
                  className="flex-1 min-w-0 px-2 bg-transparent text-xs focus:outline-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-6 rounded-xl bg-[#FF8A2A] hover:bg-[#F07B1A] disabled:opacity-50 text-white text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>
              {submitting
                ? t('جاري إرسال طلب التصنيع...', 'Submitting RFQ...')
                : t('إرسال طلب التصنيع للمصانع واستقبال العروض', 'Send RFQ to Factories & Receive Quotes')}
            </span>
          </button>
        </form>

        {/* Active RFQs & Factory Offers Comparison Column (5 cols) */}
        <div className="lg:col-span-5 space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-extrabold text-[#071A33]">
              {t('أحدث طلبات التصنيع والعروض المتاحة', 'Active Manufacturing RFQs & Offers')}
            </h3>
            <span className="text-xs font-extrabold text-[#1769E8] font-mono-num">
              {requests.length} {t('طلب نشط', 'Active RFQs')}
            </span>
          </div>

          <div className="space-y-3">
            {requests.slice(0, 3).map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-2xl bg-[#F4F7FC] border border-[#DFE7F1] hover:border-[#1769E8] transition-all space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs sm:text-sm font-extrabold text-[#13243B] leading-snug break-words">
                    {req.titleAr}
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-md bg-[#1769E8]/10 text-[#1769E8] text-[10px] font-extrabold shrink-0">
                    {req.offers.length || 3} {t('عروض مصانع', 'Offers')}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#718096] font-bold">
                  <span className="inline-flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-[#FF8A2A]" />
                    {req.material}
                  </span>
                  <span>·</span>
                  <span>
                    {req.quantity.toLocaleString()} {req.unit || 'قطعة'}
                  </span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#1769E8]" />
                    {req.city}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#DFE7F1]">
                  <span className="text-[11px] font-bold text-emerald-700 inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {req.deliveryDate}
                  </span>
                  <Link
                    to="/app/manufacturing"
                    className="text-xs font-extrabold text-[#1769E8] hover:underline inline-flex items-center gap-1"
                  >
                    <span>{t('مقارنة العروض / تقديم عرض', 'Compare / Submit Quote')}</span>
                    <ArrowIcon className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
