import {
  ReputationLevel,
  ManufacturingRequest,
  FactoryServiceProvider,
  IndustrialFault,
  IndustrialJob,
  MarketListing,
  ManufacturingProcessId,
  RequestStatus,
  UserProfile,
} from '../types/plastico';

export function isVerifiedFactoryProvider(
  provider: Pick<FactoryServiceProvider, 'verifiedDemo' | 'rating' | 'reviewsCount'>
): boolean {
  return Boolean(provider.verifiedDemo);
}

export function isVerifiedUserProfile(
  profile: Pick<UserProfile, 'accountType' | 'badges' | 'points'>
): boolean {
  if (profile.accountType === 'factory') return true;
  if (
    profile.badges?.some(
      (b) =>
        b.includes('موثق') ||
        b.includes('معتمد') ||
        b.toLowerCase().includes('verified')
    )
  ) {
    return true;
  }
  return profile.points >= 500;
}

export function canAccountPerformWriteAction(
  accountType?: string | null,
  isAuthenticated = false
): boolean {
  if (!isAuthenticated || !accountType) return false;
  if (accountType === 'visitor') return false;
  return true;
}

export const POINTS_RULES = {
  PUBLISH_FAULT: 10,
  PUBLISH_SOLUTION: 50,
  POSITIVE_RATING: 20,
  BEST_SOLUTION: 100,
} as const;

export function calculateReputationLevel(points: number): ReputationLevel {
  if (points >= 2000) return 'expert';
  if (points >= 500) return 'professional';
  return 'beginner';
}

export function getReputationLabel(level: ReputationLevel, lang: 'ar' | 'en'): string {
  const labels: Record<ReputationLevel, { ar: string; en: string }> = {
    beginner: { ar: 'مستوى مبتدئ (0–499 نقطة)', en: 'Beginner (0–499 pts)' },
    professional: { ar: 'مستوى محترف (500–1,999 نقطة)', en: 'Professional (500–1,999 pts)' },
    expert: { ar: 'مستوى خبير (2,000+ نقطة)', en: 'Expert (2,000+ pts)' },
  };
  return labels[level][lang];
}

export function awardReputationPoints(
  currentPoints: number,
  action: keyof typeof POINTS_RULES
): { newPoints: number; level: ReputationLevel; delta: number } {
  const delta = POINTS_RULES[action];
  const newPoints = Math.max(0, currentPoints + delta);
  return {
    newPoints,
    level: calculateReputationLevel(newPoints),
    delta,
  };
}

export interface ManufacturingRequestFilter {
  query?: string;
  processId?: ManufacturingProcessId | 'all';
  city?: string;
  material?: string;
  moldOwnership?: string;
  status?: RequestStatus | 'all';
  requestType?: 'all' | 'product_manufacturing' | 'mold_operation';
}

export function filterManufacturingRequests(
  requests: ManufacturingRequest[],
  filters: ManufacturingRequestFilter
): ManufacturingRequest[] {
  return requests.filter((req) => {
    if (filters.requestType && filters.requestType !== 'all' && req.requestType !== filters.requestType) {
      return false;
    }
    if (filters.processId && filters.processId !== 'all' && req.processId !== filters.processId) {
      return false;
    }
    if (filters.city && filters.city !== 'all' && req.city !== filters.city) {
      return false;
    }
    if (filters.material && filters.material !== 'all' && req.material !== filters.material) {
      return false;
    }
    if (filters.moldOwnership && filters.moldOwnership !== 'all' && req.moldOwnership !== filters.moldOwnership) {
      return false;
    }
    if (filters.status && filters.status !== 'all' && req.status !== filters.status) {
      return false;
    }
    if (filters.query && filters.query.trim().length > 0) {
      const q = filters.query.trim().toLowerCase();
      const haystack = [
        req.titleAr,
        req.titleEn,
        req.descriptionAr,
        req.material,
        req.city,
        req.referenceCode,
        req.categoryAr,
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

export function filterFactoryProviders(
  providers: FactoryServiceProvider[],
  opts: {
    query?: string;
    processId?: ManufacturingProcessId | 'all';
    city?: string;
    material?: string;
    minCapacity?: number;
    verifiedOnly?: boolean;
  }
): FactoryServiceProvider[] {
  return providers.filter((p) => {
    if (opts.verifiedOnly && !isVerifiedFactoryProvider(p)) {
      return false;
    }
    if (opts.processId && opts.processId !== 'all' && !p.processes.includes(opts.processId)) {
      return false;
    }
    if (opts.city && opts.city !== 'all' && p.city !== opts.city) {
      return false;
    }
    if (opts.material && opts.material !== 'all' && !p.materialsSupported.includes(opts.material)) {
      return false;
    }
    if (typeof opts.minCapacity === 'number' && p.availableCapacityPercent < opts.minCapacity) {
      return false;
    }
    if (opts.query && opts.query.trim().length > 0) {
      const q = opts.query.trim().toLowerCase();
      const text = [
        p.nameAr,
        p.nameEn,
        p.descriptionAr,
        p.city,
        p.industrialArea,
        ...p.materialsSupported,
        ...p.productsManufacturedAr,
      ]
        .join(' ')
        .toLowerCase();
      if (!text.includes(q)) return false;
    }
    return true;
  });
}

export interface GlobalSearchResultItem {
  id: string;
  category: 'manufacturing' | 'factories' | 'faults' | 'jobs' | 'market';
  title: string;
  subtitle: string;
  link: string;
}

export function executeGlobalSearch(
  query: string,
  dataset: {
    requests: ManufacturingRequest[];
    providers: FactoryServiceProvider[];
    faults: IndustrialFault[];
    jobs: IndustrialJob[];
    market: MarketListing[];
  }
): GlobalSearchResultItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results: GlobalSearchResultItem[] = [];

  dataset.requests.forEach((r) => {
    if (
      r.titleAr.toLowerCase().includes(q) ||
      r.titleEn.toLowerCase().includes(q) ||
      r.material.toLowerCase().includes(q) ||
      r.city.toLowerCase().includes(q) ||
      r.descriptionAr.toLowerCase().includes(q)
    ) {
      results.push({
        id: r.id,
        category: 'manufacturing',
        title: r.titleAr,
        subtitle: `${r.material} · ${r.quantity.toLocaleString()} قطعة · ${r.city}`,
        link: `/app/manufacturing/requests/${r.id}`,
      });
    }
  });

  dataset.providers.forEach((p) => {
    if (
      p.nameAr.toLowerCase().includes(q) ||
      p.nameEn.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q) ||
      p.industrialArea.toLowerCase().includes(q) ||
      p.materialsSupported.some((m) => m.toLowerCase().includes(q))
    ) {
      results.push({
        id: p.id,
        category: 'factories',
        title: p.nameAr,
        subtitle: `${p.city} (${p.industrialArea}) · طاقة متاحة ${p.availableCapacityPercent}%`,
        link: `/app/manufacturing/providers/${p.id}`,
      });
    }
  });

  dataset.faults.forEach((f) => {
    if (
      f.titleAr.toLowerCase().includes(q) ||
      f.machineBrand.toLowerCase().includes(q) ||
      f.machineModel.toLowerCase().includes(q) ||
      f.machineTypeAr.toLowerCase().includes(q)
    ) {
      results.push({
        id: f.id,
        category: 'faults',
        title: f.titleAr,
        subtitle: `${f.machineBrand} ${f.machineModel} · ${f.solutions.length} حلول فنية`,
        link: `/app/faults/${f.id}`,
      });
    }
  });

  dataset.jobs.forEach((j) => {
    if (
      j.titleAr.toLowerCase().includes(q) ||
      j.factoryNameAr.toLowerCase().includes(q) ||
      j.city.toLowerCase().includes(q) ||
      j.specializationAr.toLowerCase().includes(q)
    ) {
      results.push({
        id: j.id,
        category: 'jobs',
        title: j.titleAr,
        subtitle: `${j.factoryNameAr} · ${j.city} · ${j.salaryRangeAr}`,
        link: `/app/jobs/${j.id}`,
      });
    }
  });

  dataset.market.forEach((m) => {
    if (
      m.titleAr.toLowerCase().includes(q) ||
      m.brand.toLowerCase().includes(q) ||
      m.model.toLowerCase().includes(q) ||
      m.categoryAr.toLowerCase().includes(q)
    ) {
      results.push({
        id: m.id,
        category: 'market',
        title: m.titleAr,
        subtitle: `${m.brand} ${m.model} · ${m.price.toLocaleString()} ${m.currency}`,
        link: `/app/market/${m.id}`,
      });
    }
  });

  return results;
}

export { MANUFACTURING_PROCESS_CATEGORIES } from '../data/seedData';

export function globalSearchEntities(
  query: string,
  dataset: {
    requests: ManufacturingRequest[];
    providers: FactoryServiceProvider[];
    faults: IndustrialFault[];
    jobs: IndustrialJob[];
    market: MarketListing[];
  }
) {
  const q = query.trim().toLowerCase();
  if (!q) {
    return {
      total: 0,
      requests: [] as ManufacturingRequest[],
      providers: [] as FactoryServiceProvider[],
      faults: [] as IndustrialFault[],
      jobs: [] as IndustrialJob[],
      market: [] as MarketListing[],
    };
  }
  const reqs = dataset.requests.filter((r) =>
    [r.titleAr, r.titleEn, r.material, r.city, r.descriptionAr]
      .join(' ')
      .toLowerCase()
      .includes(q)
  );
  const provs = dataset.providers.filter((p) =>
    [p.nameAr, p.nameEn, p.city, p.industrialArea, ...p.materialsSupported]
      .join(' ')
      .toLowerCase()
      .includes(q)
  );
  const flts = dataset.faults.filter((f) =>
    [f.titleAr, f.titleEn, f.machineBrand, f.machineTypeAr, f.descriptionAr]
      .join(' ')
      .toLowerCase()
      .includes(q)
  );
  const jbs = dataset.jobs.filter((j) =>
    [j.titleAr, j.titleEn, j.factoryNameAr, j.city, j.specializationAr]
      .join(' ')
      .toLowerCase()
      .includes(q)
  );
  const mkts = dataset.market.filter((m) =>
    [m.titleAr, m.titleEn, m.brand, m.model, m.categoryAr, m.city]
      .join(' ')
      .toLowerCase()
      .includes(q)
  );
  return {
    total: reqs.length + provs.length + flts.length + jbs.length + mkts.length,
    requests: reqs,
    providers: provs,
    faults: flts,
    jobs: jbs,
    market: mkts,
  };
}

export function validateManufacturingStep(
  step: number,
  data: {
    titleAr?: string;
    processId?: string;
    descriptionAr?: string;
    material?: string;
    quantity?: number;
    city?: string;
    contactName?: string;
    contactPhone?: string;
  }
): { valid: boolean; errorAr?: string; errorEn?: string } {
  if (step === 1) {
    if (!data.processId) {
      return {
        valid: false,
        errorAr: 'يرجى اختيار عملية التصنيع المطلوبة.',
        errorEn: 'Please select a manufacturing process.',
      };
    }
    if (data.titleAr !== undefined && data.titleAr.trim().length < 3) {
      return {
        valid: false,
        errorAr: 'يرجى إدخال اسم المنتج البلاستيكي المطلوب تصنيعه (3 أحرف على الأقل).',
        errorEn: 'Please enter a valid product name (at least 3 characters).',
      };
    }
    if (data.descriptionAr !== undefined && data.descriptionAr.trim().length < 8) {
      return {
        valid: false,
        errorAr: 'يرجى كتابة وصف مختصر للمنتج والغرض منه.',
        errorEn: 'Please provide a clear product description.',
      };
    }
  }
  if (step === 2) {
    if (data.titleAr !== undefined && data.titleAr.trim().length < 3) {
      return {
        valid: false,
        errorAr: 'يرجى إدخال اسم المنتج البلاستيكي المطلوب تصنيعه (3 أحرف على الأقل).',
        errorEn: 'Please enter a valid product name (at least 3 characters).',
      };
    }
    if (!data.material) {
      return {
        valid: false,
        errorAr: 'يرجى تحديد الخامة البلاستيكية المطلوبة (مثل PP أو HDPE أو PET).',
        errorEn: 'Please select the required polymer material.',
      };
    }
  }
  if (step === 3) {
    if (!data.quantity || Number(data.quantity) <= 0) {
      return {
        valid: false,
        errorAr: 'يرجى تحديد الكمية المطلوبة للإنتاج بشكل صحيح.',
        errorEn: 'Please enter a valid production quantity greater than zero.',
      };
    }
  }
  if (step === 4) {
    if (!data.city || !data.contactName?.trim() || !data.contactPhone?.trim()) {
      return {
        valid: false,
        errorAr: 'يرجى استكمال المدينة واسم المسؤول ورقم التواصل.',
        errorEn: 'Please complete city, contact person, and phone number.',
      };
    }
  }
  return { valid: true };
}

export type Sticker3DKey =
  | 'faults'
  | 'jobs'
  | 'market'
  | 'expo'
  | 'rfq'
  | 'training'
  | 'news'
  | 'visual_search'
  | 'injection_machine'
  | 'blow_bottles'
  | 'steel_mold'
  | 'resin_granules'
  | 'extrusion_pipe'
  | 'recycling_shredder'
  | 'servo_spares'
  | 'engineer_pro'
  | 'technician_pro'
  | 'factory_plant'
  | 'supplier_silo'
  | 'verified_shield';

export interface Sticker3DCatalogItem {
  id: Sticker3DKey;
  nameAr: string;
  nameEn: string;
  sectionAr: string;
  sectionEn: string;
  route: string;
}

export const STICKER_3D_CATALOG: Sticker3DCatalogItem[] = [
  {
    id: 'faults',
    nameAr: 'عداد ضغط هيدروليك ومفتاح صيانة 3D',
    nameEn: '3D Hydraulic Gauge & Wrench',
    sectionAr: 'قسم الأعطال والصيانة',
    sectionEn: 'Faults & Maintenance',
    route: '/app/faults',
  },
  {
    id: 'jobs',
    nameAr: 'خوذة مهندس وبطاقة توظيف صناعية 3D',
    nameEn: '3D Safety Helmet & ID Badge',
    sectionAr: 'قسم التوظيف الصناعي',
    sectionEn: 'Industrial Jobs',
    route: '/app/jobs',
  },
  {
    id: 'market',
    nameAr: 'منصة شحن وتروس سوق المعدات 3D',
    nameEn: '3D Industrial Pallet & Gear',
    sectionAr: 'السوق الصناعي المستعمل',
    sectionEn: 'Industrial Marketplace',
    route: '/app/market',
  },
  {
    id: 'expo',
    nameAr: 'جناح المعرض الافتراضي ثلاثي الأبعاد',
    nameEn: '3D Virtual Exhibition Pavilion',
    sectionAr: 'المعرض الافتراضي',
    sectionEn: 'Virtual Expo',
    route: '/app/expo',
  },
  {
    id: 'rfq',
    nameAr: 'مخطط هندسي بفرجار وجزء بلاستيكي 3D',
    nameEn: '3D Engineering Blueprint & Caliper',
    sectionAr: 'طلبات التصنيع (RFQ)',
    sectionEn: 'Manufacturing RFQs',
    route: '/app/manufacturing/requests',
  },
  {
    id: 'injection_machine',
    nameAr: 'نموذج ماكينة حقن بلاستيك CNC 3D',
    nameEn: '3D CNC Injection Molding Machine',
    sectionAr: 'الماكينات وخطوط الحقن',
    sectionEn: 'Injection Molding Machines',
    route: '/app/manufacturing/machines',
  },
  {
    id: 'blow_bottles',
    nameAr: 'نموذج عبوات وجراكن نفخ HDPE 3D',
    nameEn: '3D Blow Molded HDPE Bottles',
    sectionAr: 'تصنيع النفخ والعبوات',
    sectionEn: 'Blow Molding & Packaging',
    route: '/app/manufacturing/requests',
  },
  {
    id: 'steel_mold',
    nameAr: 'قالب حقن صلب H13 متعدد الفجوات 3D',
    nameEn: '3D H13 Multi-Cavity Steel Mold',
    sectionAr: 'تصنيع وتشغيل القوالب',
    sectionEn: 'Molds Service',
    route: '/app/manufacturing/molds',
  },
  {
    id: 'resin_granules',
    nameAr: 'حبيبات بوليمر وخامات ماستر باتش 3D',
    nameEn: '3D Polymer Granules & Masterbatch',
    sectionAr: 'خامات البوليمر والماستر باتش',
    sectionEn: 'Polymer Raw Materials',
    route: '/app/market',
  },
  {
    id: 'extrusion_pipe',
    nameAr: 'خط سحب وبثق مواسير وأفلام 3D',
    nameEn: '3D Pipe & Film Extrusion Line',
    sectionAr: 'قطاع السحب والبثق',
    sectionEn: 'Extrusion Lines',
    route: '/app/manufacturing',
  },
  {
    id: 'recycling_shredder',
    nameAr: 'كسارة وخط إعادة تدوير بلاستيك 3D',
    nameEn: '3D Plastic Shredder & Recycling',
    sectionAr: 'إعادة التدوير والجرش',
    sectionEn: 'Plastic Recycling',
    route: '/app/manufacturing',
  },
  {
    id: 'servo_spares',
    nameAr: 'موتور سيرفو وبلف هيدروليك 3D',
    nameEn: '3D Servo Motor & Hydraulic Valve',
    sectionAr: 'قطع الغيار والمستهلكات',
    sectionEn: 'Spare Parts & Servos',
    route: '/app/market',
  },
  {
    id: 'training',
    nameAr: 'درع وكأس الشهادات والتدريب الصناعي 3D',
    nameEn: '3D Industrial Training Trophy',
    sectionAr: 'التدريب والشهادات',
    sectionEn: 'Training & Certifications',
    route: '/app/training',
  },
  {
    id: 'news',
    nameAr: 'مؤشر أسعار البوليمر والأخبار 3D',
    nameEn: '3D Polymer Market Index & News',
    sectionAr: 'الأخبار والتقارير الصناعية',
    sectionEn: 'Industrial News',
    route: '/app/news',
  },
  {
    id: 'visual_search',
    nameAr: 'عدسة الذكاء البصري وفحص العينات 3D',
    nameEn: '3D Visual Inspection Scanner',
    sectionAr: 'البحث بالصورة',
    sectionEn: 'Visual Search',
    route: '/app/visual-search',
  },
  {
    id: 'factory_plant',
    nameAr: 'مجمع مصنع بلاستيك ذكي متكامل 3D',
    nameEn: '3D Smart Plastics Factory Plant',
    sectionAr: 'دليل المصانع المعتمدة',
    sectionEn: 'Verified Factories',
    route: '/app/manufacturing/providers',
  },
  {
    id: 'engineer_pro',
    nameAr: 'وسام المهندس الصناعي المحترف 3D',
    nameEn: '3D Industrial Engineer Emblem',
    sectionAr: 'حساب مهندس صناعي',
    sectionEn: 'Engineer Role',
    route: '/app/profile',
  },
  {
    id: 'technician_pro',
    nameAr: 'حقيبة عدة فني الصيانة والتشغيل 3D',
    nameEn: '3D Maintenance Technician Kit',
    sectionAr: 'حساب فني تشغيل وصيانة',
    sectionEn: 'Technician Role',
    route: '/app/profile',
  },
  {
    id: 'supplier_silo',
    nameAr: 'صومعة تخزين وتوريد الخامات 3D',
    nameEn: '3D Polymer Resin Silo',
    sectionAr: 'حساب مورد خامات ومعدات',
    sectionEn: 'Supplier Role',
    route: '/app/market',
  },
  {
    id: 'verified_shield',
    nameAr: 'ختم التوثيق الذهبي للمصانع المعتمدة 3D',
    nameEn: '3D Verified Factory Shield',
    sectionAr: 'توثيق المصانع والاعتماد',
    sectionEn: 'Factory Verification',
    route: '/app/profile',
  },
];

export function resolveStickerForAsset(srcOrKey: string): Sticker3DKey {
  const lower = (srcOrKey || '').toLowerCase();
  if (lower.includes('blow') || lower.includes('bottle')) return 'blow_bottles';
  if (
    lower.includes('injection-mold-') ||
    lower.includes('industrial-mold') ||
    lower === 'molds' ||
    lower.includes('/molds')
  ) {
    return 'steel_mold';
  }
  if (
    lower.includes('granule') ||
    lower.includes('resin') ||
    lower.includes('virgin') ||
    lower.includes('raw_materials')
  ) {
    return 'resin_granules';
  }
  if (
    lower.includes('pipe') ||
    lower.includes('extrusion') ||
    lower.includes('film') ||
    lower.includes('sheet') ||
    lower.includes('profile') ||
    lower.includes('thermoform') ||
    lower.includes('vacuum')
  ) {
    return 'extrusion_pipe';
  }
  if (lower.includes('shredder') || lower.includes('recycl')) return 'recycling_shredder';
  if (lower.includes('spare') || lower.includes('auxiliary') || lower.includes('servo')) {
    return 'servo_spares';
  }
  if (lower.includes('exhibition') || lower.includes('expo')) return 'expo';
  if (lower.includes('news') || lower.includes('report')) return 'news';
  if (lower.includes('engineer')) return 'engineer_pro';
  if (lower.includes('team') || lower.includes('technician')) return 'technician_pro';
  if (lower.includes('factory') || lower.includes('hero') || lower.includes('ecosystem')) {
    return 'factory_plant';
  }
  if (lower.includes('injection') || lower.includes('machine')) return 'injection_machine';
  return 'injection_machine';
}

// =========================================================================
// MULTI-CURRENCY & COUNTRY DEFAULT CURRENCY SYSTEM (10 CURRENCIES)
// =========================================================================

export type SupportedCurrencyCode =
  | 'EGP'
  | 'SAR'
  | 'AED'
  | 'QAR'
  | 'KWD'
  | 'BHD'
  | 'OMR'
  | 'USD'
  | 'GBP'
  | 'EUR';

export interface CurrencyConfigItem {
  code: SupportedCurrencyCode;
  symbolAr: string;
  symbolEn: string;
  nameAr: string;
  nameEn: string;
  countryAr: string;
  rateFromUsd: number;
}

export const CURRENCY_RATE_REFERENCE_DATE = '2026-11-02';

export const SUPPORTED_CURRENCIES: CurrencyConfigItem[] = [
  {
    code: 'EGP',
    symbolAr: 'ج.م',
    symbolEn: 'EGP',
    nameAr: 'الجنيه المصري',
    nameEn: 'Egyptian Pound',
    countryAr: 'مصر',
    rateFromUsd: 49.2,
  },
  {
    code: 'SAR',
    symbolAr: 'ر.س',
    symbolEn: 'SAR',
    nameAr: 'الريال السعودي',
    nameEn: 'Saudi Riyal',
    countryAr: 'السعودية',
    rateFromUsd: 3.75,
  },
  {
    code: 'AED',
    symbolAr: 'د.إ',
    symbolEn: 'AED',
    nameAr: 'الدرهم الإماراتي',
    nameEn: 'UAE Dirham',
    countryAr: 'الإمارات',
    rateFromUsd: 3.67,
  },
  {
    code: 'QAR',
    symbolAr: 'ر.ق',
    symbolEn: 'QAR',
    nameAr: 'الريال القطري',
    nameEn: 'Qatari Riyal',
    countryAr: 'قطر',
    rateFromUsd: 3.64,
  },
  {
    code: 'KWD',
    symbolAr: 'د.ك',
    symbolEn: 'KWD',
    nameAr: 'الدينار الكويتي',
    nameEn: 'Kuwaiti Dinar',
    countryAr: 'الكويت',
    rateFromUsd: 0.31,
  },
  {
    code: 'BHD',
    symbolAr: 'د.ب',
    symbolEn: 'BHD',
    nameAr: 'الدينار البحريني',
    nameEn: 'Bahraini Dinar',
    countryAr: 'البحرين',
    rateFromUsd: 0.38,
  },
  {
    code: 'OMR',
    symbolAr: 'ر.ع',
    symbolEn: 'OMR',
    nameAr: 'الريال العماني',
    nameEn: 'Omani Rial',
    countryAr: 'عمان',
    rateFromUsd: 0.385,
  },
  {
    code: 'USD',
    symbolAr: '$',
    symbolEn: 'USD',
    nameAr: 'الدولار الأمريكي',
    nameEn: 'US Dollar',
    countryAr: 'دولي',
    rateFromUsd: 1,
  },
  {
    code: 'GBP',
    symbolAr: '£',
    symbolEn: 'GBP',
    nameAr: 'الجنيه الإسترليني',
    nameEn: 'British Pound',
    countryAr: 'المملكة المتحدة',
    rateFromUsd: 0.78,
  },
  {
    code: 'EUR',
    symbolAr: '€',
    symbolEn: 'EUR',
    nameAr: 'اليورو الأوروبي',
    nameEn: 'Euro',
    countryAr: 'أوروبا',
    rateFromUsd: 0.92,
  },
];

export function getDefaultCurrencyForCountry(country?: string | null): SupportedCurrencyCode {
  const c = (country || '').trim().toLowerCase();
  if (c.includes('مصر') || c.includes('egypt')) return 'EGP';
  if (c.includes('سعود') || c.includes('saudi') || c.includes('ksa')) return 'SAR';
  if (c.includes('إمارات') || c.includes('امارات') || c.includes('uae') || c.includes('dubai')) return 'AED';
  if (c.includes('قطر') || c.includes('qatar')) return 'QAR';
  if (c.includes('كويت') || c.includes('kuwait')) return 'KWD';
  if (c.includes('بحرين') || c.includes('bahrain')) return 'BHD';
  if (c.includes('عمان') || c.includes('oman')) return 'OMR';
  if (c.includes('بريطان') || c.includes('المملكة المتحدة') || c.includes('uk') || c.includes('britain')) return 'GBP';
  if (c.includes('ألمان') || c.includes('إيطال') || c.includes('تركيا') || c.includes('أوروبا') || c.includes('euro')) return 'EUR';
  if (c.includes('أمريك') || c.includes('usa') || c.includes('دولي')) return 'USD';
  return 'EGP';
}

export function convertPriceCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: SupportedCurrencyCode
): { convertedAmount: number; formattedAr: string; formattedEn: string; referenceDate: string } {
  const safeAmount = Math.max(0, Number(amount || 0));
  const fromCode = (fromCurrency || 'EGP').toUpperCase();
  const fromObj =
    SUPPORTED_CURRENCIES.find((c) => c.code === fromCode) || SUPPORTED_CURRENCIES[0];
  const toObj =
    SUPPORTED_CURRENCIES.find((c) => c.code === toCurrency) || SUPPORTED_CURRENCIES[0];

  const amountInUsd = safeAmount / (fromObj.rateFromUsd || 1);
  const rawConverted = amountInUsd * (toObj.rateFromUsd || 1);
  const convertedAmount =
    toObj.rateFromUsd < 1 ? Number(rawConverted.toFixed(2)) : Math.round(rawConverted);

  return {
    convertedAmount,
    formattedAr: `${convertedAmount.toLocaleString()} ${toObj.symbolAr}`,
    formattedEn: `${convertedAmount.toLocaleString()} ${toObj.symbolEn}`,
    referenceDate: CURRENCY_RATE_REFERENCE_DATE,
  };
}

// =========================================================================
// ACCOUNT VERIFICATION STATUS SYSTEM
// =========================================================================

export type VerificationStatusCode = 'unverified' | 'pending' | 'verified' | 'rejected';

export function getVerificationStatusMeta(status: VerificationStatusCode) {
  switch (status) {
    case 'verified':
      return {
        code: 'verified' as const,
        labelAr: 'موثق رسمياً',
        labelEn: 'Verified Account',
        badgeClass: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30',
      };
    case 'pending':
      return {
        code: 'pending' as const,
        labelAr: 'طلب التوثيق قيد المراجعة',
        labelEn: 'Verification Pending Review',
        badgeClass: 'bg-amber-500/15 text-amber-700 border-amber-500/30',
      };
    case 'rejected':
      return {
        code: 'rejected' as const,
        labelAr: 'مرفوض (يرجى مراجعة السبب)',
        labelEn: 'Rejected (See Reason)',
        badgeClass: 'bg-rose-500/15 text-rose-700 border-rose-500/30',
      };
    default:
      return {
        code: 'unverified' as const,
        labelAr: 'غير موثق',
        labelEn: 'Unverified',
        badgeClass: 'bg-slate-500/15 text-slate-600 border-slate-400/30',
      };
  }
}

// =========================================================================
// JOB APPLICATION WORKFLOW STATUSES
// =========================================================================

export type JobApplicationStatusCode =
  | 'received'
  | 'under_review'
  | 'contacted'
  | 'accepted'
  | 'rejected'
  | 'withdrawn';

export const JOB_APPLICATION_STATUS_META: Record<
  JobApplicationStatusCode,
  { labelAr: string; labelEn: string; badgeClass: string }
> = {
  received: {
    labelAr: 'تم الاستلام',
    labelEn: 'Received',
    badgeClass: 'bg-blue-50 text-[#1769E8] border-blue-200',
  },
  under_review: {
    labelAr: 'تحت المراجعة',
    labelEn: 'Under Review',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  contacted: {
    labelAr: 'تم التواصل',
    labelEn: 'Contacted',
    badgeClass: 'bg-cyan-50 text-cyan-800 border-cyan-200',
  },
  accepted: {
    labelAr: 'مقبول',
    labelEn: 'Accepted',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  rejected: {
    labelAr: 'مرفوض',
    labelEn: 'Rejected',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  withdrawn: {
    labelAr: 'منسحب',
    labelEn: 'Withdrawn',
    badgeClass: 'bg-slate-100 text-slate-600 border-slate-300',
  },
};

export function validateIndustrialAttachment(file: {
  name: string;
  sizeBytes: number;
  category: 'image' | 'video' | 'document';
}): { valid: boolean; errorAr?: string; errorEn?: string } {
  const lower = (file.name || '').toLowerCase();
  if (file.category === 'image') {
    const okExt = lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png') || lower.endsWith('.webp');
    if (!okExt) {
      return {
        valid: false,
        errorAr: 'صيغة الصورة غير مدعومة. الصيغ المسموحة: JPG, PNG, WEBP.',
        errorEn: 'Unsupported image format. Allowed: JPG, PNG, WEBP.',
      };
    }
    if (file.sizeBytes > 10 * 1024 * 1024) {
      return {
        valid: false,
        errorAr: 'حجم الصورة يتجاوز الحد الأقصى المسموح (10 ميجابايت).',
        errorEn: 'Image exceeds max size (10MB).',
      };
    }
  } else if (file.category === 'video') {
    const okExt = lower.endsWith('.mp4') || lower.endsWith('.mov') || lower.endsWith('.webm');
    if (!okExt) {
      return {
        valid: false,
        errorAr: 'صيغة الفيديو غير مدعومة. الصيغ المسموحة: MP4, MOV, WEBM.',
        errorEn: 'Unsupported video format. Allowed: MP4, MOV, WEBM.',
      };
    }
    if (file.sizeBytes > 50 * 1024 * 1024) {
      return {
        valid: false,
        errorAr: 'حجم الفيديو يتجاوز الحد الأقصى المسموح (50 ميجابايت).',
        errorEn: 'Video exceeds max size (50MB).',
      };
    }
  } else if (file.category === 'document') {
    const okExt =
      lower.endsWith('.pdf') ||
      lower.endsWith('.doc') ||
      lower.endsWith('.docx') ||
      lower.endsWith('.jpg') ||
      lower.endsWith('.png');
    if (!okExt) {
      return {
        valid: false,
        errorAr: 'صيغة المستند غير مدعومة. الصيغ المسموحة: PDF, DOC, DOCX, JPG, PNG.',
        errorEn: 'Unsupported document format. Allowed: PDF, DOC, DOCX, JPG, PNG.',
      };
    }
    if (file.sizeBytes > 15 * 1024 * 1024) {
      return {
        valid: false,
        errorAr: 'حجم المستند يتجاوز الحد الأقصى المسموح (15 ميجابايت).',
        errorEn: 'Document exceeds max size (15MB).',
      };
    }
  }
  return { valid: true };
}


