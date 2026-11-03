import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Truck,
  Search,
  MapPin,
  Phone,
  Mail,
  FileText,
  CheckCircle2,
  X,
  Filter,
  Send,
  MessageSquare,
  UserPlus,
  UserCheck,
} from 'lucide-react';
import { usePlastico } from '../context/PlasticoContext';
import {
  SUPPLIER_CATEGORY_FILTERS,
  SupplierDirectoryItem,
} from '../data/ecosystemData';
import { VerifiedFactoryBadge } from '../components/VerifiedFactoryBadge';

export const SuppliersDirectoryPage: React.FC = () => {
  const {
    t,
    suppliers,
    submitSupplierRfq,
    isAuthenticated,
    realUser,
    isFollowing,
    toggleFollow,
    startOrOpenConversation,
    openLightbox,
  } = usePlastico();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const activeCategory = searchParams.get('category') || 'all';
  const initialQuery = searchParams.get('q') || searchParams.get('material') || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedSupplierForRfq, setSelectedSupplierForRfq] =
    useState<SupplierDirectoryItem | null>(null);
  const [detailSupplier, setDetailSupplier] =
    useState<SupplierDirectoryItem | null>(null);

  useEffect(() => {
    const qParam = searchParams.get('q') || searchParams.get('material');
    if (qParam !== null) {
      setSearchQuery(qParam);
    }
  }, [searchParams]);

  // RFQ Form State
  const [rfqProductName, setRfqProductName] = useState('');
  const [rfqMaterial, setRfqMaterial] = useState('PP / HDPE');
  const [rfqQuantity, setRfqQuantity] = useState(5);
  const [rfqUnit, setRfqUnit] = useState('طن');
  const [rfqCity, setRfqCity] = useState(realUser?.city || 'العاشر من رمضان');
  const [rfqDetails, setRfqDetails] = useState('');
  const [rfqContactName, setRfqContactName] = useState(realUser?.name || '');
  const [rfqContactPhone, setRfqContactPhone] = useState(
    realUser?.phone || '+20 10'
  );
  const [rfqSubmitting, setRfqSubmitting] = useState(false);
  const [rfqError, setRfqError] = useState<string | null>(null);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      if (activeCategory !== 'all' && s.supplierType !== activeCategory) {
        return false;
      }
      if (selectedCountry !== 'all' && s.country !== selectedCountry) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inName =
          s.companyNameAr.toLowerCase().includes(q) ||
          s.companyNameEn.toLowerCase().includes(q);
        const inProducts = s.productsServicesAr.some((p) =>
          p.toLowerCase().includes(q)
        );
        const inBrands = s.brandsSupplied.some((b) =>
          b.toLowerCase().includes(q)
        );
        if (!inName && !inProducts && !inBrands) return false;
      }
      return true;
    });
  }, [suppliers, activeCategory, selectedCountry, searchQuery]);

  const handleOpenRfq = (supplier: SupplierDirectoryItem) => {
    if (!isAuthenticated) {
      navigate('/auth/login?redirect=/app/suppliers');
      return;
    }
    setSelectedSupplierForRfq(supplier);
    setRfqProductName(supplier.productsServicesAr[0] || '');
    setRfqContactName(realUser?.name || '');
    setRfqContactPhone(realUser?.phone || '+20 100 000 0000');
    setRfqError(null);
  };

  const handleSubmitRfq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierForRfq) return;
    setRfqSubmitting(true);
    setRfqError(null);

    const result = await submitSupplierRfq({
      supplierId: selectedSupplierForRfq.id,
      supplierNameAr: selectedSupplierForRfq.companyNameAr,
      category: selectedSupplierForRfq.supplierType,
      productName: rfqProductName,
      material: rfqMaterial,
      quantity: rfqQuantity,
      unit: rfqUnit,
      city: rfqCity,
      details: rfqDetails,
      contactName: rfqContactName,
      contactPhone: rfqContactPhone,
    });

    setRfqSubmitting(false);
    if (!result.ok) {
      setRfqError(result.error || 'تعذر إرسال الطلب.');
      return;
    }
    setSelectedSupplierForRfq(null);
    setRfqDetails('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-[#071A33] text-white p-6 sm:p-8 border border-[#1769E8]/30 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#1769E8]/20 border border-[#27BED6]/30 text-[#27BED6] text-xs font-extrabold">
              <Truck className="w-4 h-4" />
              <span>
                {t(
                  'دليل الموردين الصناعيين المعتمدين',
                  'Industrial Suppliers Directory'
                )}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {t(
                'موردو خامات البوليمر، الماكينات، السخانات، والمعدات المساعدة',
                'Suppliers of Polymer Resins, Machinery, Heaters & Auxiliary Gear'
              )}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {t(
                'تواصل مباشرة مع شركات التوريد والوكلاء الصناعيين عبر المحادثات الفورية أو أرسل طلب عرض سعر رسمي (RFQ).',
                'Connect directly with industrial suppliers via instant chat or submit an official RFQ.'
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (suppliers.length > 0) handleOpenRfq(suppliers[0]);
            }}
            className="px-5 py-3 rounded-xl bg-[#FF8A2A] hover:bg-[#F07B1A] text-white text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-md transition-colors shrink-0 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>
              {t('طلب عرض سعر خامات / معدات (RFQ)', 'Request Supplier Quote (RFQ)')}
            </span>
          </button>
        </div>

        {/* Search & Country Filter Bar */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-[#718096] absolute top-1/2 -translate-y-1/2 start-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t(
                'ابحث باسم الشركة، الخامة (PP, HDPE, PET)، السخانات، أو الماركة (SABIC, Haitian)...',
                'Search company, resin (PP, HDPE, PET), heaters, or brand...'
              )}
              className="w-full bg-white text-[#13243B] placeholder-[#718096] rounded-xl ps-10 pe-4 py-2.5 text-xs sm:text-sm font-medium focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2 bg-white/10 border border-white/15 rounded-xl px-3 py-2">
            <Filter className="w-4 h-4 text-[#27BED6] shrink-0" />
            <select
              aria-label={t('تصفية حسب الدولة', 'Filter by country')}
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full bg-transparent text-white text-xs sm:text-sm font-bold focus:outline-none"
            >
              <option value="all" className="text-[#13243B]">
                {t('جميع الدول العربية', 'All Countries')}
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

      {/* Contextual 10 Category Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {SUPPLIER_CATEGORY_FILTERS.map((cat) => {
          const active = activeCategory === cat.id;
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
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-colors border cursor-pointer ${
                active
                  ? 'bg-[#1769E8] text-white border-[#1769E8]'
                  : 'bg-white text-[#13243B] border-[#DFE7F1] hover:border-[#1769E8]'
              }`}
            >
              {t(cat.labelAr, cat.labelEn)}
            </button>
          );
        })}
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSuppliers.map((sup) => {
          const supKey = sup.id.startsWith('sup-') ? sup.id : `sup-${sup.id}`;
          const following = isFollowing(supKey);
          return (
            <div
              key={sup.id}
              className="bg-white rounded-2xl border border-[#DFE7F1] p-5 shadow-2xs hover:border-[#1769E8]/50 transition-all flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                {/* Top Row */}
                <div className="flex items-start gap-3.5">
                  <Link
                    to={`/app/profile/${encodeURIComponent(supKey)}`}
                    className="shrink-0"
                  >
                    <img
                      src={sup.logo}
                      alt={sup.companyNameAr}
                      className="w-14 h-14 rounded-xl object-cover bg-[#F4F7FC] border border-[#DFE7F1] hover:border-[#1769E8] p-1 transition-colors"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="px-2.5 py-0.5 rounded-md bg-[#F4F7FC] text-[#1769E8] text-[11px] font-extrabold border border-[#DFE7F1]">
                          {t(sup.supplierTypeLabelAr, sup.supplierTypeLabelEn)}
                        </span>
                        {sup.isVerified && <VerifiedFactoryBadge variant="compact" />}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          void toggleFollow({
                            targetId: supKey,
                            targetType: 'supplier',
                            targetNameAr: sup.companyNameAr,
                            targetRoleAr: sup.supplierTypeLabelAr,
                            targetAvatar: sup.logo,
                          })
                        }
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold inline-flex items-center gap-1 cursor-pointer ${
                          following
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-[#F4F7FC] text-[#1769E8] border border-[#DFE7F1]'
                        }`}
                      >
                        {following ? (
                          <>
                            <UserCheck className="w-3 h-3" />
                            <span>{t('متابَع', 'Following')}</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3 h-3" />
                            <span>{t('متابعة', 'Follow')}</span>
                          </>
                        )}
                      </button>
                    </div>
                    <Link
                      to={`/app/profile/${encodeURIComponent(supKey)}`}
                      className="block text-base font-extrabold text-[#13243B] hover:text-[#1769E8] mt-1.5 leading-snug transition-colors"
                    >
                      {t(sup.companyNameAr, sup.companyNameEn)}
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-[#718096] mt-1">
                      <MapPin className="w-3.5 h-3.5 text-[#1769E8]" />
                      <span>
                        {sup.city}، {sup.country}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#718096] leading-relaxed">
                  {t(sup.descriptionAr, sup.descriptionEn)}
                </p>

                {/* Categories & Brands */}
                <div className="space-y-2 pt-1">
                  <div className="text-[11px] font-bold text-[#13243B]">
                    {t('المنتجات والتخصصات الموردة:', 'Supplied Categories:')}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {sup.categoriesAr.map((c) => (
                      <span
                        key={c}
                        className="px-2.5 py-1 rounded-lg bg-[#F4F7FC] text-[#13243B] text-[11px] font-semibold border border-[#DFE7F1]"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#718096]">
                  <span className="font-bold text-[#13243B]">
                    {t('العلامات التجارية:', 'Brands:')}
                  </span>
                  {sup.brandsSupplied.map((b) => (
                    <span
                      key={b}
                      className="px-2 py-0.5 rounded-md bg-[#071A33]/5 text-[#071A33] font-bold"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-[#DFE7F1] flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Link
                    to={`/app/profile/${encodeURIComponent(supKey)}`}
                    className="px-3 py-2 rounded-xl bg-[#F4F7FC] hover:bg-blue-50 text-[#1769E8] text-xs font-extrabold transition-colors"
                  >
                    {t('الملف الشخصي', 'Full Profile')}
                  </Link>
                  <button
                    type="button"
                    onClick={() => setDetailSupplier(sup)}
                    className="px-2.5 py-2 rounded-xl bg-[#F4F7FC] hover:bg-slate-200/70 text-[#13243B] text-xs font-bold transition-colors cursor-pointer"
                  >
                    {t('نبذة سريعة', 'Quick Info')}
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={async () => {
                      const cid = await startOrOpenConversation({
                        targetKey: supKey,
                        targetNameAr: sup.companyNameAr,
                        targetRoleAr: sup.supplierTypeLabelAr,
                        targetAvatar: sup.logo,
                        contextType: 'supplier',
                        contextId: sup.id,
                        contextTitleAr: `توريد خامات ومعدات: ${sup.companyNameAr}`,
                      });
                      if (cid) navigate(`/app/messages?convId=${cid}`);
                    }}
                    className="px-3 py-2 rounded-xl bg-[#071A33] hover:bg-[#0D284D] text-white text-xs font-extrabold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#27BED6]" />
                    <span>{t('دردشة', 'Chat')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenRfq(sup)}
                    className="px-3.5 py-2 rounded-xl bg-[#1769E8] hover:bg-[#1258C7] text-white text-xs font-extrabold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{t('اطلب عرض سعر', 'Request Quote')}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Supplier Full Profile Modal */}
      {detailSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071A33]/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#DFE7F1] max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[88vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={detailSupplier.logo}
                  alt={detailSupplier.companyNameAr}
                  className="w-14 h-14 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] p-1.5"
                />
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-[#13243B]">
                    {t(detailSupplier.companyNameAr, detailSupplier.companyNameEn)}
                  </h3>
                  <p className="text-xs text-[#718096]">
                    {detailSupplier.city}، {detailSupplier.country}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetailSupplier(null)}
                className="p-1.5 rounded-lg text-[#718096] hover:bg-[#F4F7FC]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-[#13243B] leading-relaxed">
              {t(detailSupplier.descriptionAr, detailSupplier.descriptionEn)}
            </p>

            <div className="space-y-2">
              <h4 className="text-xs font-extrabold text-[#071A33]">
                {t('قائمة المنتجات والخدمات المتاحة:', 'Products & Services Supplied:')}
              </h4>
              <ul className="space-y-1.5">
                {detailSupplier.productsServicesAr.map((prod) => (
                  <li
                    key={prod}
                    className="flex items-center gap-2 text-xs text-[#13243B] bg-[#F4F7FC] px-3 py-2 rounded-lg border border-[#DFE7F1]"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#1769E8] shrink-0" />
                    <span>{prod}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#1769E8]" />
                <span className="font-mono-num font-bold text-[#13243B]">
                  {detailSupplier.contactPhone}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#1769E8]" />
                <span className="font-mono-num font-bold text-[#13243B] truncate">
                  {detailSupplier.contactEmail}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#DFE7F1]">
              <button
                type="button"
                onClick={() => setDetailSupplier(null)}
                className="px-4 py-2 rounded-xl bg-[#F4F7FC] text-[#13243B] text-xs font-bold"
              >
                {t('إغلاق', 'Close')}
              </button>
              <button
                type="button"
                onClick={() => {
                  const s = detailSupplier;
                  setDetailSupplier(null);
                  handleOpenRfq(s);
                }}
                className="px-5 py-2 rounded-xl bg-[#FF8A2A] hover:bg-[#F07B1A] text-white text-xs font-extrabold"
              >
                {t('إرسال طلب عرض سعر (RFQ)', 'Send RFQ')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Supplier RFQ Modal */}
      {selectedSupplierForRfq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071A33]/60 backdrop-blur-xs">
          <form
            onSubmit={handleSubmitRfq}
            className="bg-white rounded-2xl border border-[#DFE7F1] max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[11px] font-extrabold text-[#1769E8]">
                  {t('طلب عرض سعر مباشر للمورد (RFQ)', 'Direct Supplier RFQ')}
                </span>
                <h3 className="text-base sm:text-lg font-extrabold text-[#13243B] mt-0.5">
                  {selectedSupplierForRfq.companyNameAr}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSupplierForRfq(null)}
                className="p-1.5 rounded-lg text-[#718096] hover:bg-[#F4F7FC]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {rfqError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                {rfqError}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#13243B] mb-1">
                  {t('اسم الخامة / المعدة المطلوبة', 'Required Material or Equipment')}
                </label>
                <input
                  type="text"
                  required
                  value={rfqProductName}
                  onChange={(e) => setRfqProductName(e.target.value)}
                  className="w-full input-3d rounded-xl px-3.5 py-2.5 text-xs sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#13243B] mb-1">
                    {t('الكمية المطلوبة', 'Quantity')}
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={rfqQuantity}
                    onChange={(e) => setRfqQuantity(Number(e.target.value))}
                    className="w-full input-3d rounded-xl px-3.5 py-2.5 text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#13243B] mb-1">
                    {t('الوحدة', 'Unit')}
                  </label>
                  <select
                    value={rfqUnit}
                    onChange={(e) => setRfqUnit(e.target.value)}
                    className="w-full input-3d rounded-xl px-3.5 py-2.5 text-xs sm:text-sm"
                  >
                    <option value="طن">{t('طن', 'Ton')}</option>
                    <option value="كجم">{t('كجم', 'Kg')}</option>
                    <option value="وحدة / ماكينة">{t('وحدة / ماكينة', 'Unit / Machine')}</option>
                    <option value="طقم">{t('طقم', 'Set')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#13243B] mb-1">
                    {t('الدرجة / المواصفة الفنية', 'Grade / Technical Spec')}
                  </label>
                  <input
                    type="text"
                    value={rfqMaterial}
                    onChange={(e) => setRfqMaterial(e.target.value)}
                    className="w-full input-3d rounded-xl px-3.5 py-2.5 text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#13243B] mb-1">
                    {t('مدينة التسليم', 'Delivery City')}
                  </label>
                  <input
                    type="text"
                    required
                    value={rfqCity}
                    onChange={(e) => setRfqCity(e.target.value)}
                    className="w-full input-3d rounded-xl px-3.5 py-2.5 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#13243B] mb-1">
                  {t('تفاصيل إضافية (شروط الدفع والتوريد)', 'Additional Notes')}
                </label>
                <textarea
                  rows={2}
                  value={rfqDetails}
                  onChange={(e) => setRfqDetails(e.target.value)}
                  placeholder={t(
                    'مثال: مطلوب شهادة تحليل COA وتوريد خلال أسبوع...',
                    'e.g., COA certificate required, delivery within 7 days...'
                  )}
                  className="w-full input-3d rounded-xl px-3.5 py-2 text-xs sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#13243B] mb-1">
                    {t('اسم المسؤول', 'Contact Name')}
                  </label>
                  <input
                    type="text"
                    required
                    value={rfqContactName}
                    onChange={(e) => setRfqContactName(e.target.value)}
                    className="w-full input-3d rounded-xl px-3.5 py-2.5 text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#13243B] mb-1">
                    {t('رقم الهاتف', 'Phone Number')}
                  </label>
                  <input
                    type="text"
                    required
                    value={rfqContactPhone}
                    onChange={(e) => setRfqContactPhone(e.target.value)}
                    className="w-full input-3d rounded-xl px-3.5 py-2.5 text-xs sm:text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#DFE7F1]">
              <button
                type="button"
                onClick={() => setSelectedSupplierForRfq(null)}
                className="px-4 py-2.5 rounded-xl bg-[#F4F7FC] text-[#13243B] text-xs font-bold"
              >
                {t('إلغاء', 'Cancel')}
              </button>
              <button
                type="submit"
                disabled={rfqSubmitting}
                className="px-5 py-2.5 rounded-xl bg-[#1769E8] hover:bg-[#1258C7] disabled:opacity-50 text-white text-xs font-extrabold inline-flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {rfqSubmitting
                    ? t('جاري الإرسال...', 'Submitting...')
                    : t('إرسال طلب عرض السعر', 'Submit RFQ')}
                </span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default SuppliersDirectoryPage;
