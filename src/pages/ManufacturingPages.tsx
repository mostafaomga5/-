import React, { useState, useMemo } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Plus,
  Building2,
  Cpu,
  Layers,
  CheckCircle2,
  Star,
  MapPin,
  ArrowLeft,
  ArrowRight,
  Scale,
  Send,
  Phone,
  FileText,
} from 'lucide-react';
import { usePlastico } from '../context/PlasticoContext';
import {
  MANUFACTURING_PROCESS_CATEGORIES,
  filterManufacturingRequests,
  filterFactoryProviders,
  validateManufacturingStep,
  isVerifiedFactoryProvider,
} from '../lib/domainRules';
import { ManufacturingProcessId, ManufacturingRequestStatus } from '../types/plastico';
import { IndustrialImage } from '../components/IndustrialImage';
import { VerifiedFactoryBadge } from '../components/VerifiedFactoryBadge';
import { Sticker3D } from '../components/Sticker3D';
import { GoogleFormsIntegrationPanel } from '../components/GoogleFormsIntegrationPanel';
import { resolveStickerForAsset } from '../lib/domainRules';
import { IMAGE_MANIFEST } from '../data/imageManifest';

/* Shared Sub-navigation Bar for Manufacturing Section */
const ManufacturingSubNav: React.FC<{ activeTab: string }> = ({ activeTab }) => {
  const { t } = usePlastico();
  const tabs = [
    { id: 'rfq', to: '/app/manufacturing', labelAr: 'طلبات جديدة (RFQ)', labelEn: 'New RFQs' },
    {
      id: 'my-requests',
      to: '/app/manufacturing/my-requests',
      labelAr: 'طلباتي',
      labelEn: 'My Requests',
    },
    {
      id: 'providers',
      to: '/app/manufacturing/providers',
      labelAr: 'دليل المصانع',
      labelEn: 'Factories',
    },
    {
      id: 'machines',
      to: '/app/manufacturing/machines',
      labelAr: 'الماكينات المتاحة',
      labelEn: 'Available Machines',
    },
    {
      id: 'molds',
      to: '/app/manufacturing/molds',
      labelAr: 'القوالب والاسطمبات',
      labelEn: 'Molds Service',
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <Sticker3D id="rfq" size="sm" />
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0B2A5B]">
            {t('طلبات التصنيع (RFQ)', 'Manufacturing Requests (RFQ)')}
          </h1>
        </div>
        <Link
          to="/app/manufacturing/requests/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full btn-3d-blue text-xs font-extrabold"
        >
          <Plus className="w-4 h-4" />
          <span>{t('طلب تصنيع جديد', 'New RFQ')}</span>
        </Link>
      </div>

      {/* Main Segmented Toggle matching Image 6 Screen 11 */}
      <div className="grid grid-cols-2 gap-2 p-1.5 rounded-full bg-[#E8EEF6] border border-slate-200">
        <Link
          to="/app/manufacturing"
          className={`py-2.5 rounded-full text-xs sm:text-sm font-extrabold text-center transition-all ${
            activeTab === 'rfq' || activeTab === 'requests'
              ? 'bg-[#0B2A5B] text-white shadow-xs'
              : 'text-[#0B2A5B] hover:text-[#1D6BF3]'
          }`}
        >
          {t('طلبات جديدة', 'New Requests')}
        </Link>
        <Link
          to="/app/manufacturing/my-requests"
          className={`py-2.5 rounded-full text-xs sm:text-sm font-extrabold text-center transition-all ${
            activeTab === 'my-requests'
              ? 'bg-[#0B2A5B] text-white shadow-xs'
              : 'text-[#0B2A5B] hover:text-[#1D6BF3]'
          }`}
        >
          {t('طلباتي', 'My Requests')}
        </Link>
      </div>

      {/* Secondary Pills for Factories, Machines, Molds, and My Offers */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {tabs.slice(2).map((tab) => (
          <Link
            key={tab.id}
            to={tab.to}
            className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap border transition-all ${
              activeTab === tab.id
                ? 'bg-[#DCEBFF] text-[#0B5ED7] border-blue-200'
                : 'bg-white text-[#0B2A5B] border-slate-200 hover:bg-slate-50'
            }`}
          >
            {t(tab.labelAr, tab.labelEn)}
          </Link>
        ))}
        <Link
          to="/app/manufacturing/my-offers"
          className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap border transition-all ${
            activeTab === 'my-offers'
              ? 'bg-[#DCEBFF] text-[#0B5ED7] border-blue-200'
              : 'bg-white text-[#0B2A5B] border-slate-200 hover:bg-slate-50'
          }`}
        >
          {t('عروضي كمصنع', 'My Factory Quotes')}
        </Link>
      </div>
    </div>
  );
};

/* ============================================================================
   Screen 11: Manufacturing Hub & Requests List (/app/manufacturing & /app/manufacturing/requests)
   Matches Image 6 (Screen 11)
   ============================================================================ */
export const ManufacturingHubPage: React.FC = () => {
  return <ManufacturingRequestsListPage />;
};

export const ManufacturingRequestsListPage: React.FC = () => {
  const { t, requests } = usePlastico();
  const [searchParams] = useSearchParams();
  const initialProcess = (searchParams.get('process') as ManufacturingProcessId) || 'all';
  const [processFilter, setProcessFilter] = useState<ManufacturingProcessId | 'all'>(
    initialProcess
  );

  const filteredRequests = useMemo(() => {
    return filterManufacturingRequests(requests, {
      processId: processFilter,
    });
  }, [requests, processFilter]);

  // Signature RFQ cards matching Image 6 Screen 11 first, followed by full request list
  const signatureRfqs = [
    {
      id: requests[0]?.id || 'req-1',
      titleAr: 'إنتاج عبوات بلاستيك',
      titleEn: 'Plastic Bottles Production',
      quantityText: '50,000 قطعة',
      material: 'PP',
      descAr: 'عبوة 500 مل',
      image: IMAGE_MANIFEST.marketplace.petBottlesCapsSet,
      offersCount: requests[0]?.offers.length || 2,
    },
    {
      id: requests[1]?.id || 'req-2',
      titleAr: 'إنتاج أغطية بلاستيك',
      titleEn: 'Plastic Bottle Caps Production',
      quantityText: '100,000 قطعة',
      material: 'HDPE',
      descAr: 'أغطية عبوات محكمة الغلق فوهة 28 مم',
      image: IMAGE_MANIFEST.marketplace.newInjectionMachine,
      offersCount: requests[1]?.offers.length || 1,
    },
    ...filteredRequests.slice(2).map((r) => ({
      id: r.id,
      titleAr: r.titleAr,
      titleEn: r.titleEn,
      quantityText: `${r.quantity.toLocaleString()} ${r.unit || 'قطعة'}`,
      material: r.material,
      descAr: r.dimensions,
      image: r.attachments?.[0] || r.image || IMAGE_MANIFEST.marketplace.petBottlesCapsSet,
      offersCount: r.offers.length,
    })),
  ];

  return (
    <div className="space-y-4">
      <ManufacturingSubNav activeTab="rfq" />

      {/* Process Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setProcessFilter('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap ${
            processFilter === 'all'
              ? 'bg-[#0B5ED7] text-white'
              : 'bg-white text-[#0B2A5B] border border-slate-200'
          }`}
        >
          {t('كل العمليات (11)', 'All Processes (11)')}
        </button>
        {MANUFACTURING_PROCESS_CATEGORIES.slice(0, 6).map((proc) => (
          <button
            key={proc.id}
            type="button"
            onClick={() => setProcessFilter(proc.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap ${
              processFilter === proc.id
                ? 'bg-[#0B5ED7] text-white'
                : 'bg-white text-[#0B2A5B] border border-slate-200'
            }`}
          >
            {t(proc.nameAr, proc.nameEn)}
          </button>
        ))}
      </div>

      {/* RFQ Cards List with 3D Models & Transparent Stickers */}
      <div className="space-y-4">
        {signatureRfqs.map((rfq) => (
          <div
            key={rfq.id}
            className="card-3d p-4 sm:p-5 space-y-4"
          >
            <div className="flex items-center justify-between gap-4">
              {/* Right side in RTL: Title & Specifications */}
              <div className="flex-1 space-y-1.5">
                <Link
                  to={`/app/manufacturing/requests/${rfq.id}`}
                  className="block text-base sm:text-lg font-extrabold text-[#1D6BF3] hover:underline"
                >
                  {t(rfq.titleAr, rfq.titleEn)}
                </Link>
                <div className="text-xs sm:text-sm font-bold text-[#0B2A5B]">
                  {t('الكمية :', 'Quantity :')} <span className="font-mono-num">{rfq.quantityText}</span>
                </div>
                <div className="text-xs sm:text-sm font-bold text-[#0B2A5B]">
                  {t('الخامة :', 'Material :')} <span>{rfq.material}</span>
                </div>
                {rfq.descAr && (
                  <div className="text-xs text-slate-600 font-semibold">
                    {t('الوصف :', 'Spec :')} {rfq.descAr}
                  </div>
                )}
              </div>

              {/* Left side in RTL: 3D Product Image Thumbnail */}
              <Link
                to={`/app/manufacturing/requests/${rfq.id}`}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border border-slate-200 shrink-0 shadow-sm"
              >
                <IndustrialImage
                  src={rfq.image}
                  alt={rfq.titleAr}
                  aspectClass="w-full h-full"
                />
              </Link>
            </div>

            {/* Full-width 3D Dark Navy CTA Button: تقديم عرض سعر */}
            <Link
              to={`/app/manufacturing/requests/${rfq.id}`}
              className="block w-full py-3.5 rounded-full btn-3d-primary text-center text-xs sm:text-sm font-extrabold transition-all"
            >
              {t('تقديم عرض سعر', 'Submit Price Quote')} ({rfq.offersCount}{' '}
              {t('عروض مقدمة', 'quotes')})
            </Link>
          </div>
        ))}
      </div>

      {/* Google Forms RFQ & Quality Inspection Integration */}
      <GoogleFormsIntegrationPanel />
    </div>
  );
};

/* ============================================================================
   4-Step New Manufacturing Request Wizard (/app/manufacturing/requests/new)
   ============================================================================ */
export const NewManufacturingRequestPage: React.FC = () => {
  const { lang, t, createManufacturingRequest } = usePlastico();
  const navigate = useNavigate();
  const ArrowIcon = lang === 'ar' ? ArrowLeft : ArrowRight;

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [errorMsg, setErrorMsg] = useState('');

  const [processId, setProcessId] = useState<ManufacturingProcessId>('injection');
  const [titleAr, setTitleAr] = useState('');
  const [descriptionAr] = useState('');
  const [material, setMaterial] = useState('PP');
  const [unitWeightGrams, setUnitWeightGrams] = useState(25);
  const [dimensions, setDimensions] = useState('عبوة 500 مل · فوهة 28 مم');
  const [color] = useState('أبيض');
  const [quantity, setQuantity] = useState(50000);
  const [unit, setUnit] = useState('قطعة');
  const [moldStatus, setMoldStatus] = useState<'متوفرة وجاهزة' | 'مطلوب تصنيع اسطمبة جديدة' | 'تحتاج صيانة/تعديل'>('متوفرة وجاهزة');
  const [deliveryDate] = useState('2026-12-25');
  const [city, setCity] = useState('العاشر من رمضان');
  const [contactName, setContactName] = useState('أحمد محمد علي');
  const [contactPhone, setContactPhone] = useState('+20 100 812 4400');

  const handleNext = () => {
    const validation = validateManufacturingStep(step, {
      processId,
      titleAr,
      material,
      quantity,
      city,
      contactName,
      contactPhone,
    });
    if (!validation.valid && validation.errorAr) {
      setErrorMsg(validation.errorAr);
      return;
    }
    setErrorMsg('');
    if (step < 4) setStep((s) => (s + 1) as 1 | 2 | 3 | 4);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateManufacturingStep(4, {
      processId,
      titleAr,
      material,
      quantity,
      city,
      contactName,
      contactPhone,
    });
    if (!validation.valid && validation.errorAr) {
      setErrorMsg(validation.errorAr);
      return;
    }

    const newId = createManufacturingRequest({
      titleAr,
      titleEn: titleAr,
      processId,
      material,
      color,
      unitWeightGrams,
      dimensions,
      quantity,
      unit,
      moldStatus,
      qualityRequirements: 'خامة بكر 100% مطابقة للمواصفات القياسية',
      packagingRequirements: 'تعبئة داخل كراتين مضلعة',
      deliveryDate,
      city,
      descriptionAr: descriptionAr || titleAr,
      descriptionEn: descriptionAr || titleAr,
      contactName,
      contactPhone,
      attachments: [IMAGE_MANIFEST.marketplace.petBottlesCapsSet],
    });

    navigate(`/app/manufacturing/requests/${newId}`);
  };

  return (
    <div className="card-3d p-5 sm:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sticker3D id="rfq" size="md" />
          <div>
            <h1 className="text-xl font-extrabold text-[#0B2A5B]">
              {t('نشر طلب تصنيع جديد (نموذج 3D تفاعلي)', 'Post New 3D Manufacturing Request (RFQ)')}
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {t('خطوة', 'Step')} {step} {t('من 4', 'of 4')}
            </p>
          </div>
        </div>
        <Link to="/app/manufacturing" className="text-xs font-extrabold text-[#1D6BF3]">
          {t('إلغاء', 'Cancel')}
        </Link>
      </div>

      {/* Progress bar */}
      <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-[#0B5ED7] to-[#38BDF8] transition-all duration-300"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>

      {errorMsg && (
        <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs font-bold text-[#EF4444]">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {step === 1 && (
          <div className="space-y-4">
            <label className="block text-xs font-extrabold text-[#0B2A5B]">
              {t('اختر عملية التصنيع المطلوبة (نماذج 3D شفافة):', 'Select 3D Manufacturing Process:')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {MANUFACTURING_PROCESS_CATEGORIES.map((proc) => (
                <button
                  key={proc.id}
                  type="button"
                  onClick={() => setProcessId(proc.id)}
                  className={`card-3d p-3.5 text-start transition-all flex items-center gap-3 cursor-pointer ${
                    processId === proc.id
                      ? 'bg-[#E8F2FF] border-2 border-[#1D6BF3] text-[#0B2A5B]'
                      : 'bg-white border border-slate-200 text-[#0B2A5B]'
                  }`}
                >
                  <Sticker3D id={resolveStickerForAsset(proc.id)} size="sm" />
                  <div className="text-xs font-extrabold">{t(proc.nameAr, proc.nameEn)}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-extrabold text-[#0B2A5B] mb-1">
                {t('عنوان طلب التصنيع *', 'RFQ Title *')}
              </label>
              <input
                type="text"
                value={titleAr}
                onChange={(e) => setTitleAr(e.target.value)}
                placeholder={t('مثال: إنتاج عبوات بلاستيك 500 مل', 'e.g. 500ml Plastic Bottles')}
                className="w-full px-4 py-3 rounded-2xl text-sm text-[#0B2A5B] input-3d"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-extrabold text-[#0B2A5B] mb-1">
                  {t('الخامة البلاستيكية *', 'Polymer Material *')}
                </label>
                <select
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-2xl text-sm font-bold text-[#0B2A5B] input-3d"
                >
                  {['PP', 'HDPE', 'LDPE', 'PET', 'ABS', 'PVC'].map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-extrabold text-[#0B2A5B] mb-1">
                  {t('وزن القطعة (جرام)', 'Unit Weight (g)')}
                </label>
                <input
                  type="number"
                  value={unitWeightGrams}
                  onChange={(e) => setUnitWeightGrams(Number(e.target.value))}
                  className="w-full px-3.5 py-3 rounded-2xl text-sm font-bold text-[#0B2A5B] input-3d"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-extrabold text-[#0B2A5B] mb-1">
                {t('الأبعاد والمواصفات', 'Dimensions & Description')}
              </label>
              <input
                type="text"
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl text-sm text-[#0B2A5B] input-3d"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-extrabold text-[#0B2A5B] mb-1">
                  {t('الكمية المطلوبة *', 'Quantity *')}
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-2xl text-sm font-bold text-[#0B2A5B] input-3d"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-[#0B2A5B] mb-1">
                  {t('الوحدة', 'Unit')}
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl text-sm font-bold text-[#0B2A5B] input-3d"
                >
                  <option value="قطعة">قطعة</option>
                  <option value="طن">طن</option>
                  <option value="ألف كيس">ألف كيس</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-extrabold text-[#0B2A5B] mb-1">
                {t('حالة الاسطمبة (القالب)', 'Mold Status')}
              </label>
              <select
                value={moldStatus}
                onChange={(e) =>
                  setMoldStatus(
                    e.target.value as
                      | 'متوفرة وجاهزة'
                      | 'مطلوب تصنيع اسطمبة جديدة'
                      | 'تحتاج صيانة/تعديل'
                  )
                }
                className="w-full px-4 py-3 rounded-2xl text-sm font-bold text-[#0B2A5B] input-3d"
              >
                <option value="متوفرة وجاهزة">متوفرة وجاهزة للتشغيل</option>
                <option value="مطلوب تصنيع اسطمبة جديدة">مطلوب تصنيع اسطمبة جديدة</option>
                <option value="تحتاج صيانة/تعديل">متوفرة وتحتاج صيانة/تعديل</option>
              </select>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-extrabold text-[#0B2A5B] mb-1">
                {t('مدينة التسليم *', 'Delivery City *')}
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl text-sm text-[#0B2A5B] input-3d"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-extrabold text-[#0B2A5B] mb-1">
                  {t('اسم المسؤول *', 'Contact Name *')}
                </label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl text-sm text-[#0B2A5B] input-3d"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-[#0B2A5B] mb-1">
                  {t('رقم الهاتف *', 'Phone *')}
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl text-sm text-[#0B2A5B] input-3d"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 pt-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3 | 4)}
              className="px-6 py-3 rounded-full bg-slate-100 text-[#0B2A5B] text-xs font-extrabold"
            >
              {t('السابق', 'Previous')}
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-8 py-3.5 rounded-full btn-3d-primary text-xs sm:text-sm font-extrabold flex items-center gap-2"
            >
              <span>{t('متابعة', 'Next')}</span>
              <ArrowIcon className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              className="px-8 py-3.5 rounded-full btn-3d-blue text-xs sm:text-sm font-extrabold"
            >
              {t('نشر طلب التصنيع الآن', 'Publish RFQ Now')}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

/* ============================================================================
   Manufacturing Request Detail & Quote Comparison (/app/manufacturing/requests/:id)
   ============================================================================ */
export const ManufacturingRequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, requests, submitFactoryOffer, updateRequestStatus, updateOfferStatus } =
    usePlastico();

  const request = requests.find((r) => r.id === id) || requests[0];
  const [showCompare, setShowCompare] = useState(false);
  const [unitPrice, setUnitPrice] = useState('4.50');
  const [toolingCost, setToolingCost] = useState('55000');
  const [moq, setMoq] = useState('50000');
  const [leadTimeDays, setLeadTimeDays] = useState('18');
  const [notes, setNotes] = useState('');

  if (!request) return null;

  const handleOfferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitFactoryOffer(request.id, {
      unitPrice: Number(unitPrice) || 4.5,
      currency: 'EGP',
      toolingCost: Number(toolingCost) || 0,
      moq: Number(moq) || 10000,
      leadTimeDays: Number(leadTimeDays) || 15,
      notes: notes || 'عرض شامل الخامة البكر والتعبئة القياسية.',
      includedServices: ['فحص جودة 100%', 'توريد منتظم'],
    });
    setNotes('');
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="px-3 py-1 rounded-full bg-blue-50 text-[#1D6BF3] text-xs font-extrabold">
            {request.code} · {request.status}
          </span>
          <select
            aria-label={t('حالة الطلب', 'Request Status')}
            value={request.status}
            onChange={(e) =>
              updateRequestStatus(
                request.id,
                e.target.value as ManufacturingRequestStatus
              )
            }
            className="px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-extrabold text-[#0B2A5B]"
          >
            <option value="استقبال العروض">حالة الطلب: استقبال العروض</option>
            <option value="قيد التفاوض">حالة الطلب: قيد التفاوض</option>
            <option value="تم التعاقد">حالة الطلب: تم التعاقد</option>
            <option value="مكتمل">حالة الطلب: مكتمل</option>
          </select>
        </div>

        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0B2A5B]">
              {t(request.titleAr, request.titleEn)}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {t(request.descriptionAr, request.descriptionEn)}
            </p>
          </div>
          <img
            src={
              request.attachments?.[0] ||
              request.image ||
              IMAGE_MANIFEST.marketplace.petBottlesCapsSet
            }
            alt={request.titleAr}
            className="w-28 h-28 rounded-2xl object-cover border border-slate-200 shrink-0"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-slate-200/80">
            <div className="text-[11px] text-slate-500 font-bold">{t('الخامة', 'Material')}</div>
            <div className="text-sm font-extrabold text-[#0B2A5B] mt-0.5">
              {request.material}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-slate-200/80">
            <div className="text-[11px] text-slate-500 font-bold">{t('الكمية', 'Quantity')}</div>
            <div className="text-sm font-extrabold text-[#0B2A5B] font-mono-num mt-0.5">
              {request.quantity.toLocaleString()} {request.unit}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-slate-200/80">
            <div className="text-[11px] text-slate-500 font-bold">{t('وزن القطعة', 'Weight')}</div>
            <div className="text-sm font-extrabold text-[#0B2A5B] font-mono-num mt-0.5">
              {request.unitWeightGrams} {t('جرام', 'g')}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-slate-200/80">
            <div className="text-[11px] text-slate-500 font-bold">{t('الهاتف', 'Phone')}</div>
            <div
              dir="ltr"
              className="text-xs sm:text-sm font-extrabold text-[#1D6BF3] font-mono-num mt-0.5 text-end"
            >
              {request.contactPhone}
            </div>
          </div>
        </div>
      </div>

      {/* Factory Offers & Comparison Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-extrabold text-[#0B2A5B]">
            {t('عروض الأسعار المقدمة من المصانع', 'Submitted Factory Quotes')} (
            {request.offers.length})
          </h2>
          <button
            type="button"
            onClick={() => setShowCompare(!showCompare)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 text-[#1D6BF3] text-xs font-extrabold"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>{t('جدول مقارنة العروض', 'Compare Quotes')}</span>
          </button>
        </div>

        {showCompare && request.offers.length > 0 && (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-xs text-start">
              <thead className="bg-slate-100 text-[#0B2A5B] font-extrabold">
                <tr>
                  <th className="p-3 text-start">{t('المصنع', 'Factory')}</th>
                  <th className="p-3 text-start">{t('سعر الوحدة', 'Unit Price')}</th>
                  <th className="p-3 text-start">{t('تكلفة التجهيز', 'Tooling')}</th>
                  <th className="p-3 text-start">{t('مدة التوريد', 'Lead Time')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {request.offers.map((of) => (
                  <tr key={of.id} className="bg-white">
                    <td className="p-3 font-extrabold text-[#0B2A5B]">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span>{of.factoryName}</span>
                        <VerifiedFactoryBadge variant="compact" />
                      </div>
                    </td>
                    <td className="p-3 font-extrabold text-[#16A34A] font-mono-num">
                      {of.unitPrice} {of.currency}
                    </td>
                    <td className="p-3 font-mono-num">
                      {of.toolingCost.toLocaleString()} {of.currency}
                    </td>
                    <td className="p-3 font-mono-num">{of.leadTimeDays} يوم عمل</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="space-y-3">
          {request.offers.map((offer) => (
            <div
              key={offer.id}
              className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200 space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-extrabold text-[#0B2A5B]">
                      {offer.factoryName}
                    </span>
                    <VerifiedFactoryBadge variant="compact" />
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{offer.factoryCity}</div>
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-extrabold">
                  {offer.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <div className="text-slate-400">{t('سعر الوحدة', 'Unit Price')}</div>
                  <div className="font-extrabold text-[#16A34A] font-mono-num mt-0.5">
                    {offer.unitPrice} {offer.currency}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <div className="text-slate-400">{t('الحد الأدنى MOQ', 'MOQ')}</div>
                  <div className="font-extrabold text-[#0B2A5B] font-mono-num mt-0.5">
                    {offer.moq.toLocaleString()}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <div className="text-slate-400">{t('مدة التوريد', 'Lead Time')}</div>
                  <div className="font-extrabold text-[#0B2A5B] font-mono-num mt-0.5">
                    {offer.leadTimeDays} {t('يوم', 'days')}
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-600">{offer.notes}</p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateOfferStatus(request.id, offer.id, 'مقبول')}
                  className="px-4 py-2 rounded-full bg-[#0B2A5B] text-white text-xs font-extrabold"
                >
                  {t('قبول العرض والتعاقد', 'Accept Quote')}
                </button>
                <button
                  type="button"
                  onClick={() => updateOfferStatus(request.id, offer.id, 'قيد التفاوض')}
                  className="px-4 py-2 rounded-full bg-blue-50 text-[#1D6BF3] text-xs font-extrabold"
                >
                  {t('بدء التفاوض', 'Negotiate')}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Submit New Quote Form */}
        <form
          onSubmit={handleOfferSubmit}
          className="pt-4 border-t border-slate-200 space-y-3"
        >
          <h3 className="text-sm font-extrabold text-[#0B2A5B]">
            {t('قدم عرض سعر من مصنعك على هذا الطلب', 'Submit a Quote from Your Factory')}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <input
              type="number"
              step="0.05"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              placeholder={t('سعر الوحدة', 'Unit Price')}
              className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B2A5B]"
            />
            <input
              type="number"
              value={toolingCost}
              onChange={(e) => setToolingCost(e.target.value)}
              placeholder={t('تكلفة التجهيز', 'Tooling Cost')}
              className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B2A5B]"
            />
            <input
              type="number"
              value={moq}
              onChange={(e) => setMoq(e.target.value)}
              placeholder="MOQ"
              className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B2A5B]"
            />
            <input
              type="number"
              value={leadTimeDays}
              onChange={(e) => setLeadTimeDays(e.target.value)}
              placeholder={t('أيام التوريد', 'Lead Days')}
              className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B2A5B]"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t(
                'ملاحظات العرض (نوع الماكينة، الخامة، شروط الدفع)...',
                'Quote details...'
              )}
              className="flex-1 px-4 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-xs text-[#0B2A5B]"
            />
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#0B5ED7] text-white text-xs font-extrabold flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{t('إرسال العرض', 'Send Quote')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ============================================================================
   Factory Service Providers Directory (/app/manufacturing/providers)
   ============================================================================ */
export const FactoryProvidersPage: React.FC = () => {
  const { t, providers, showToast } = usePlastico();
  const [query, setQuery] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const filtered = filterFactoryProviders(providers, { query, verifiedOnly });

  return (
    <div className="space-y-4">
      <ManufacturingSubNav activeTab="providers" />

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t(
            'ابحث باسم المصنع، الخامة، أو المنطقة الصناعية...',
            'Search factory, material, or industrial zone...'
          )}
          className="flex-1 px-4 py-3 rounded-2xl bg-white border border-slate-200 text-sm text-[#0B2A5B]"
        />
        <button
          type="button"
          onClick={() => setVerifiedOnly((v) => !v)}
          aria-pressed={verifiedOnly}
          className={`px-4 py-3 rounded-2xl border text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
            verifiedOnly
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
              : 'bg-white text-[#059669] border-emerald-200 hover:bg-emerald-50/60'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{t('المصانع الموثقة فقط', 'Verified Factories Only')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs flex flex-col justify-between"
          >
            <div>
              <IndustrialImage
                src={p.coverImage}
                alt={p.nameAr}
                aspectClass="aspect-[16/8]"
                badgeText={`طاقة متاحة ${p.availableCapacityPercent}%`}
              />
              <div className="p-4 space-y-2.5">
                <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                  <span className="truncate">
                    {p.city} · {p.industrialArea}
                  </span>
                  <span className="flex items-center gap-1 font-extrabold text-[#0B2A5B] shrink-0">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    {p.rating} ({p.reviewsCount})
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={`/app/manufacturing/providers/${p.id}`}
                      className="text-base font-extrabold text-[#0B2A5B] hover:text-[#1D6BF3]"
                    >
                      {t(p.nameAr, p.nameEn)}
                    </Link>
                    {isVerifiedFactoryProvider(p) && (
                      <VerifiedFactoryBadge
                        size="sm"
                        isoCertified={p.id === 'prov-1' || p.id === 'prov-4'}
                      />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {t(p.descriptionAr, p.descriptionEn)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {p.materialsSupported.slice(0, 5).map((mat) => (
                    <span
                      key={mat}
                      className="px-2 py-0.5 rounded-lg bg-slate-100 text-[#0B2A5B] text-[11px] font-bold"
                    >
                      {mat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                dir="ltr"
                onClick={() =>
                  showToast(`هاتف المصنع: ${p.contactPhone}`, `Phone: ${p.contactPhone}`)
                }
                className="text-xs font-extrabold text-[#1D6BF3] font-mono-num"
              >
                {p.contactPhone}
              </button>
              <Link
                to={`/app/manufacturing/providers/${p.id}`}
                className="px-4 py-1.5 rounded-full bg-[#0B2A5B] text-white text-xs font-extrabold"
              >
                {t('ملف المصنع', 'View Factory')}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const FactoryProviderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, providers, showToast } = usePlastico();
  const provider = providers.find((p) => p.id === id) || providers[0];

  if (!provider) return <FactoryProvidersPage />;

  return (
    <div className="space-y-4">
      <ManufacturingSubNav activeTab="providers" />

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs space-y-5 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-2">
          <Link
            to="/app/manufacturing/providers"
            className="text-xs font-extrabold text-[#1D6BF3] hover:underline"
          >
            {t('← العودة إلى دليل المصانع', '← Back to Factories Directory')}
          </Link>
          <span className="flex items-center gap-1 text-xs font-extrabold text-[#0B2A5B]">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>
              {provider.rating} ({provider.reviewsCount} {t('تقييم صناعي', 'reviews')})
            </span>
          </span>
        </div>

        <IndustrialImage
          src={provider.coverImage}
          alt={provider.nameAr}
          aspectClass="aspect-[16/7]"
          className="rounded-2xl"
          badgeText={`طاقة إنتاجية متاحة ${provider.availableCapacityPercent}%`}
        />

        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0B2A5B]">
              {t(provider.nameAr, provider.nameEn)}
            </h2>
            {isVerifiedFactoryProvider(provider) && (
              <VerifiedFactoryBadge size="md" isoCertified />
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
            <MapPin className="w-4 h-4 text-[#1D6BF3]" />
            <span>
              {provider.country} · {provider.city} · {provider.industrialArea}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
            {t(provider.descriptionAr, provider.descriptionEn)}
          </p>
        </div>

        {isVerifiedFactoryProvider(provider) && (
          <VerifiedFactoryBadge variant="banner" isoCertified />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 space-y-2">
            <h3 className="text-xs font-extrabold text-[#0B2A5B]">
              {t('خطوط الإنتاج والماكينات', 'Production Lines & Machinery')}
            </h3>
            <ul className="space-y-1 text-xs text-slate-600">
              {provider.machinesSummary.map((line) => (
                <li key={line}>• {line}</li>
              ))}
            </ul>
          </div>
          <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 space-y-2">
            <h3 className="text-xs font-extrabold text-[#0B2A5B]">
              {t('الخدمات الصناعية المتاحة', 'Offered Industrial Services')}
            </h3>
            <ul className="space-y-1 text-xs text-slate-600">
              {provider.servicesOfferedAr.map((srv) => (
                <li key={srv}>• {srv}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() =>
              showToast(
                `تم بدء طلب عرض سعر مباشر مع ${provider.nameAr}`,
                `Direct RFQ initiated with ${provider.nameEn}`
              )
            }
            className="px-6 py-3 rounded-full bg-[#0B2A5B] hover:bg-[#133B7A] text-white text-xs sm:text-sm font-extrabold"
          >
            {t('اطلب عرض سعر من هذا المصنع الموثق', 'Request Quote from Verified Factory')}
          </button>
          <span
            dir="ltr"
            className="text-xs sm:text-sm font-extrabold text-[#1D6BF3] font-mono-num"
          >
            {provider.contactPhone}
          </span>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   Available Machines & Molds & My Requests/Offers
   ============================================================================ */
export const AvailableMachinesPage: React.FC = () => {
  const { t, machines, showToast } = usePlastico();
  return (
    <div className="space-y-4">
      <ManufacturingSubNav activeTab="machines" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {machines.map((m) => (
          <div
            key={m.id}
            className="bg-white rounded-3xl border border-slate-200 p-4 shadow-2xs space-y-3"
          >
            <IndustrialImage
              src={m.image}
              alt={m.machineBrand}
              aspectClass="aspect-[16/9]"
              className="rounded-2xl"
              badgeText={m.availabilityStatus}
            />
            <div className="text-base font-extrabold text-[#0B2A5B]">
              {m.machineTypeAr} — {m.machineBrand} ({m.tonnageOrCapacity})
            </div>
            <div className="text-xs text-slate-500">
              {m.factoryName} · {m.city} · {m.hourlyOrPerPieceRate}
            </div>
            <button
              type="button"
              onClick={() =>
                showToast(
                  `تم إرسال طلب حجز وقت تشغيل على ماكينة ${m.machineBrand}`,
                  'Machine booking inquiry sent'
                )
              }
              className="w-full py-2.5 rounded-full bg-[#0B2A5B] text-white text-xs font-extrabold"
            >
              {t('طلب تشغيل على الماكينة', 'Book Machine Capacity')}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export const MoldsServicePage: React.FC = () => {
  const { t, showToast } = usePlastico();
  return (
    <div className="space-y-4">
      <ManufacturingSubNav activeTab="molds" />
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex items-center gap-4">
          <img
            src={IMAGE_MANIFEST.marketplace.industrialMold}
            alt="Molds"
            className="w-24 h-24 rounded-2xl object-cover border border-slate-200"
          />
          <div className="space-y-1">
            <h2 className="text-lg font-extrabold text-[#0B2A5B]">
              {t(
                'تصنيع وصيانة وتعديل اسطمبات الحقن والنفخ',
                'Design, CNC Machining & Maintenance of Molds'
              )}
            </h2>
            <p className="text-xs text-slate-600">
              {t(
                'ورش اسطمبات معتمدة لتصنيع قوالب متعدد الفجوات وصيانة Hot Runner وتلميع الفجوات.',
                'Certified toolrooms for multi-cavity molds and hot runner maintenance.'
              )}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() =>
            showToast('تم فتح طلب مقايسة اسطمبة جديدة', 'New mold quotation request')
          }
          className="w-full py-3.5 rounded-full bg-[#0B2A5B] text-white text-xs sm:text-sm font-extrabold"
        >
          {t('اطلب عرض سعر لتصنيع أو صيانة اسطمبة', 'Request Mold Quote')}
        </button>
      </div>
    </div>
  );
};

export const MyManufacturingRequestsPage: React.FC = () => {
  const { t, requests } = usePlastico();
  return (
    <div className="space-y-4">
      <ManufacturingSubNav activeTab="my-requests" />
      <div className="space-y-3">
        {requests.map((r) => (
          <Link
            key={r.id}
            to={`/app/manufacturing/requests/${r.id}`}
            className="block bg-white rounded-3xl border border-slate-200 p-4 shadow-2xs hover:border-[#1D6BF3]"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-extrabold text-[#0B2A5B]">
                {t(r.titleAr, r.titleEn)}
              </span>
              <span className="px-3 py-1 rounded-full bg-blue-50 text-[#1D6BF3] text-xs font-extrabold">
                {r.status}
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {r.material} · {r.quantity.toLocaleString()} {r.unit} · {r.offers.length}{' '}
              {t('عروض أسعار', 'quotes')}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export const MyFactoryOffersPage: React.FC = () => {
  const { t, requests } = usePlastico();
  const allOffers = requests.flatMap((r) =>
    r.offers.map((o) => ({ ...o, reqTitle: r.titleAr, reqId: r.id }))
  );
  return (
    <div className="space-y-4">
      <ManufacturingSubNav activeTab="my-offers" />
      <div className="space-y-3">
        {allOffers.map((of) => (
          <Link
            key={of.id}
            to={`/app/manufacturing/requests/${of.reqId}`}
            className="block bg-white rounded-3xl border border-slate-200 p-4 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-extrabold text-[#0B2A5B]">{of.reqTitle}</span>
              <span className="text-xs font-extrabold text-[#16A34A] font-mono-num">
                {of.unitPrice} {of.currency}
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {of.factoryName} · {of.status}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
