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
